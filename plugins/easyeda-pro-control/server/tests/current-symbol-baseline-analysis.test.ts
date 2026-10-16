/* oxlint-disable import/max-dependencies -- Use real managed journals, SQLite readers and native decoding with synthetic private fixtures; no application or production data is accessed. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { controlDataDirectory, createOperation, ensureManagedDirectory, loadOperation, operationPath, publishManagedAttachmentExclusive, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, normalizeEasyedaProjectPath, sha256Json, sha256Text } from "../src/core.ts";
import { analyzeCurrentSymbolBaseline } from "../src/current-symbol-baseline-analysis.ts";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

const RAW_PATH = String.raw`C:\SyntheticNeverOpened\BaselineAnalysis.eprj2`;
const SOURCE = normalizeEasyedaProjectPath(RAW_PATH);
const PROJECT = sha256Text(RAW_PATH);
const BRANCH = "b".repeat(32), HEAD = "e".repeat(32), KEY = "f".repeat(32), OWNER = "c".repeat(32), PCB = "d".repeat(16);
const PHASES = ["capture-intent", "capture-result", "close-intent", "close-result", "copy-intent", "copy-result", "relaunch-intent", "relaunch-result",
  "capture-release-intent", "capture-release-result", "admission-intent", "admission-capture-intent", "admission-capture-result", "admission-result",
  "cache-intent", "cache-result", "project-only-intent", "project-only-result", "finish-close-intent", "finish-close-result", "finish-snapshot-intent",
  "finish-snapshot-result", "finish-retirement-proof", "finish-release-intent"];
type Bag = Record<string, unknown>;
let counter = 0;
function seal(value: Bag, key: string): Bag { return { ...value, [key]: sha256Json(value) }; }
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function rawHistory(ticket: number, title: string): string {
  return `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ client: "synthetic", ticket })}|\n` +
    `${JSON.stringify({ type: "DOCHEAD", ticket: 1 })}||${JSON.stringify({ uuid: PCB, docType: "PCB", client: "synthetic", version: "1", updateTime: 1 })}|\n` +
    `${JSON.stringify({ type: "META", ticket, id: "META" })}||${JSON.stringify({ title })}|\n`;
}
function closure(operationId: string, final: boolean, drift?: string): { capture: Bag; intent: Bag; closeReceipt: Bag; proof: Bag; launch: Bag } {
  const phase = final ? "closed-edit" : "closed-baseline";
  const jobId = (final ? "2" : "1").repeat(32), root = { pid: final ? 200 : 100, role: "easyeda-main", startIdentity: `win32:123456789012345:job:${(final ? "2" : "1").repeat(32)}` };
  const launch = { jobId, helperInstance: "3".repeat(32), root };
  const authority = seal({ schema: "easyeda-pro-control.execution-authority.v1", bindingSha256: "4".repeat(64), policyId: "synthetic-policy",
    policySha256: "5".repeat(64), processes: [root], processTreeSha256: sha256Json([root]) }, "authoritySha256");
  if (drift === "processTreeSha256") {
    delete authority["authoritySha256"]; authority["processTreeSha256"] = "0".repeat(64); Object.assign(authority, seal(authority, "authoritySha256"));
  }
  const capture = { operationId, phase, challengeAttempt: 1, bridgeSession: { gatewayInstanceId: "g".repeat(43), sessionId: (final ? "b" : "a").repeat(43), sequence: final ? 2 : 1 },
    runtimeIdentity: { synthetic: final }, executionAuthority: authority };
  if (drift === "gateway") { capture.bridgeSession.gatewayInstanceId = "x".repeat(43); }
  if (drift === "sequence") { capture.bridgeSession.sequence = 1; }
  const common: Bag = { operationId, phase, challengeAttempt: 1, authoritySha256: authority["authoritySha256"],
    bridgeSessionSha256: sha256Json(capture.bridgeSession), runtimeIdentitySha256: sha256Json(capture.runtimeIdentity),
    launchSha256: sha256Json(launch), jobId, helperInstance: launch.helperInstance, policyId: authority["policyId"], policySha256: authority["policySha256"] };
  if (drift !== undefined && ["launchSha256", "jobId", "helperInstance", "policySha256"].includes(drift)) { common[drift] = "0".repeat(64); }
  const intentBody: Bag = { ...common, schema: "easyeda-pro-control.closed-session-close-intent.v1", captureBindingSha256: authority["bindingSha256"] };
  if (drift === "captureBindingSha256") { intentBody["captureBindingSha256"] = "0".repeat(64); }
  if (drift === "schema") { delete intentBody["schema"]; }
  const intent = seal(intentBody, "closeIntentSha256");
  const closeReceipt = seal({ schema: "easyeda-pro-control.closed-session-close-dispatch.v1", closeIntentSha256: intent["closeIntentSha256"],
    closeDispatched: true, saveOrDiscardSelected: false, terminationProved: false }, "closeReceiptSha256");
  const proof = seal({ ...common, schema: "easyeda-pro-control.closed-session-termination.v1", closeIntentSha256: intent["closeIntentSha256"], closeReceiptSha256: closeReceipt["closeReceiptSha256"],
    jobEmpty: true, retainedProcessesExited: true, saveOrDiscardSelected: false, queuedWritesPersisted: "not-proved", persistentWorkReplayExcluded: "not-proved" }, "proofSha256");
  return { capture, intent, closeReceipt, proof, launch };
}
async function retained(operationId: string, final: boolean, effect: string, proof: Bag, receiptDrift?: string): Promise<{ result: Bag; rawPath: string }> {
  const temporary = await mkdtemp(join(syntheticSqlRoot(), "baseline-analysis-")); const source = join(temporary, "synthetic.eprj2");
  const database = new DatabaseSync(source);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY,branch_uuid TEXT,owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY,project_uuid TEXT,history_uuid TEXT);
      CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);
      CREATE TABLE opaque(a,b,c,d,e); CREATE TABLE dictionary(k TEXT PRIMARY KEY,v BLOB) WITHOUT ROWID;`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(PROJECT, BRANCH, OWNER);
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, PROJECT, HEAD);
    database.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`).run(HEAD, null, null, KEY, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HEAD, HEAD, encrypted(rawHistory(final && effect === "clock" ? 2 : 1,
      final && effect === "native" ? "changed" : "same"), HEAD, KEY));
    database.prepare("INSERT INTO opaque VALUES(?,?,?,?,?)").run(9_007_199_254_740_993n, "a\0b", Buffer.from([0, 255]), 1.25, null);
    database.exec("INSERT INTO dictionary VALUES('k',X'01')");
    if (final && effect === "typed") { database.exec("UPDATE opaque SET b=X'610062'"); }
    if (final && effect === "rowid") { database.exec("UPDATE opaque SET rowid=2"); }
    if (final && effect === "global") { database.exec("UPDATE dictionary SET v=X'02'; PRAGMA user_version=9"); }
  } finally { database.close(); }
  const bytes = await readFile(source); const suffix = final ? "2" : "1"; const directory = operationPath(operationId).slice(0, -5);
  const rawPath = join(directory, `closed-copy-00000000-0000-0000-0000-00000000000${suffix}.eprj2`);
  const raw = await publishManagedAttachmentExclusive(rawPath, "Synthetic retained raw copy", bytes, "synthetic");
  const checkpointPath = join(controlDataDirectory(), "checkpoints", `${operationId}-${suffix}.eprj2`);
  const checkpoint = await publishManagedAttachmentExclusive(checkpointPath, "Synthetic retained checkpoint", bytes, "synthetic");
  const info = await lstat(checkpointPath, { bigint: true });
  const sourceIdentity = { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" };
  const checkpointReceipt = seal({ schema: "easyeda-pro-control.checkpoint.v2", source: SOURCE, checkpoint: checkpointPath,
    receiptPath: checkpointPath.replace(/\.eprj2$/u, ".checkpoint.json"), sourceIdentity,
    createdAt: "2026-10-16T00:00:00.000Z", sourceStatBefore: { size: String(raw.bytes), mtimeNs: "5", ctimeNs: "4" },
    sourceStatAfter: { size: String(raw.bytes), mtimeNs: "5", ctimeNs: "4" }, sourceDataVersion: 1,
    sourceDumpSha256: "a".repeat(64), checkpointDumpSha256: "a".repeat(64),
    quickCheck: { sourceBefore: "ok", sourceAfter: "ok", checkpoint: "ok" }, integrityModel: "Synthetic unkeyed consistency only.",
    checkpointIdentity: { dev: info.dev.toString(), ino: info.ino.toString(), birthtimeNs: info.birthtimeNs.toString(), ctimeNs: info.ctimeNs.toString() },
    sourceSha256: raw.sha256, checkpointSha256: checkpoint.sha256 }, "receiptSha256");
  if (receiptDrift !== undefined && receiptDrift !== "copy-source-size") {
    delete checkpointReceipt["receiptSha256"];
    if (receiptDrift === "different-dump") { checkpointReceipt["checkpointDumpSha256"] = "b".repeat(64); }
    else { Reflect.deleteProperty(checkpointReceipt, receiptDrift); }
    Object.assign(checkpointReceipt, seal(checkpointReceipt, "receiptSha256"));
  }
  await publishManagedAttachmentExclusive(String(checkpointReceipt["receiptPath"]), "Synthetic checkpoint receipt", Buffer.from(JSON.stringify(checkpointReceipt)), "synthetic");
  const rawInfo = await lstat(rawPath, { bigint: true });
  const copy = seal({ schema: "easyeda-pro-control.closed-file-byte-copy.v1", source: SOURCE, artifact: rawPath, bytes: raw.bytes, sha256: raw.sha256,
    artifactIdentity: Object.fromEntries(Object.entries({ device: rawInfo.dev, inode: rawInfo.ino, size: rawInfo.size, mtimeNs: rawInfo.mtimeNs,
      ctimeNs: rawInfo.ctimeNs, birthtimeNs: rawInfo.birthtimeNs, mode: rawInfo.mode, uid: rawInfo.uid, gid: rawInfo.gid, links: rawInfo.nlink }).map(([key, value]) => [key, value.toString()])),
    sourceIdentity: { device: "1", inode: "2", birthtimeNs: "3", ctimeNs: "4", size: receiptDrift === "copy-source-size" ? "1" : String(raw.bytes), mtimeNs: "5", mode: "33152", uid: "0", gid: "0", links: "1" },
    closureProofSha256: proof["proofSha256"],
    sourceEqualsArtifactBytes: true, sourceProjectGenerationBindingVerified: false, executionAuthorized: false }, "receiptSha256");
  const inventory = await readExactSqlInventory({ checkpointPath: rawPath, expectedSha256: raw.sha256, runtime: await syntheticSqlRuntime() });
  const history = await readNativeHistoryCheckpoint({ checkpointPath, expectedSha256: checkpoint.sha256, projectUuid: PROJECT, libraryAtomHeaders: "preserve" });
  const result = { checkpoint: checkpointReceipt, copy, sql: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 },
    openingEffectsVerified: false, writerReady: false, executionAuthorized: false,
    ...(final ? { profile: "private.current-symbol-finish-snapshot.v1", snapshotCaptured: true, persistenceVerified: false,
      native: { projectUuid: PROJECT, branchUuid: BRANCH, ownerUuid: OWNER, headHistoryUuid: HEAD, historyRows: history.historyRowCount,
        chunks: history.chunkCount, documents: history.documents.length, historySemanticSha256: history.semanticSha256 } } :
      { beforeWriteBaselineVerified: false, targetEvidence: { projectUuid: PROJECT, branchUuid: BRANCH, ownerUuid: OWNER, documentUuid: PCB, docType: "PCB",
        documentSemanticSha256: history.documents[0]?.semanticSha256, historySemanticSha256: history.semanticSha256, headHistoryUuid: HEAD } }) };
  return { result, rawPath };
}
async function fixture(effect = "none", closureDrift?: string, receiptDrift?: string): Promise<{ operationId: string; rawPath: string; journalPath: string }> {
  counter += 1; const operationId = `current-baseline-analysis-test-${counter}`;
  await ensureManagedDirectory(operationPath(operationId).slice(0, -5)); await ensureManagedDirectory(join(controlDataDirectory(), "checkpoints"));
  const first = closure(operationId, false), last = closure(operationId, true, closureDrift);
  const baseline = await retained(operationId, false, effect, first.proof), finish = await retained(operationId, true, effect, last.proof, receiptDrift);
  const baseCopy = bag(baseline.result["copy"]), finalCopy = finish.result["copy"];
  finish.result["baselineCopyReceiptSha256"] = baseCopy["receiptSha256"];
  const captureHash = sha256Json(last.capture);
  const retirement = { schema: "easyeda-pro-control.current-symbol-finish-retirement.v1", operationId, proof: last.proof, originalLaunch: last.launch,
    closeIntent: last.intent, closeReceipt: last.closeReceipt,
    admissionCaptureSha256: captureHash, finishSnapshotStatus: "captured", finishSnapshotCaptured: true,
    finishSnapshotEvidence: { checkpoint: finish.result["checkpoint"], copy: finalCopy }, priorOrphan: false,
    persistenceVerified: false, writerAuthority: false, replayAllowed: false, continuationAuthorized: false };
  const selected: Record<string, Bag> = { "capture-result": { capture: first.capture }, "close-intent": { intent: first.intent },
    "close-result": { closeReceipt: first.closeReceipt }, "copy-intent": { proof: first.proof }, "copy-result": baseline.result,
    "relaunch-intent": { copyReceiptSha256: baseCopy["receiptSha256"], checkpoint: baseline.result["checkpoint"], proof: first.proof }, "relaunch-result": { launch: last.launch },
    "admission-capture-result": { capture: last.capture }, "finish-close-intent": { intent: last.intent, originalLaunch: last.launch }, "finish-close-result": { closeReceipt: last.closeReceipt },
    "finish-snapshot-intent": { proof: last.proof, closeIntent: last.intent, closeReceipt: last.closeReceipt, baselineCopyReceiptSha256: baseCopy["receiptSha256"], admissionCaptureSha256: captureHash },
    "finish-snapshot-result": finish.result, "finish-retirement-proof": retirement,
    "finish-release-intent": { admissionCaptureSha256: captureHash, trackedCaptureSha256: null } };
  const plan = { profile: "easyeda-pro-control.current-symbol-closed-baseline.v1", launch: first.launch,
    target: { rawWindowsPath: RAW_PATH, projectUuid: PROJECT, branchUuid: BRANCH, documentUuid: PCB } };
  const journal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: "plan-invalidated", mutationState: "not-inferred", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false,
    mutationMayHaveOccurred: true, sequence: 24, artifacts: [] as Awaited<ReturnType<typeof writePhaseArtifact>>[],
    closeAttempted: true, copyAttempted: true, relaunchAttempted: true, releaseAttempted: true, admissionAttempted: true, cacheAttempted: true,
    projectOpenAttempted: true, finishCloseAttempted: true, finishReleaseAttempted: true, finishSnapshotAttempted: true, finishSnapshotCaptured: true, finishSnapshotFailed: false,
    result: { ...retirement, admissionCaptureReleased: true, retired: true }, createdAt: "2026-10-16T00:00:00.000Z", updatedAt: "2026-10-16T00:00:01.000Z" };
  await createOperation(journal);
  for (const [index, phase] of PHASES.entries()) { journal.artifacts.push(await writePhaseArtifact(operationId, index + 1, phase, selected[phase] ?? { synthetic: phase })); }
  await updateOperation(journal);
  return { operationId, rawPath: finish.rawPath, journalPath: journal.journalPath };
}
async function analyze(operationId: string): ReturnType<typeof analyzeCurrentSymbolBaseline> { return analyzeCurrentSymbolBaseline(operationId, await syntheticSqlRuntime()); }
async function editPhase(operationId: string, phase: string, change: (value: Bag) => void): Promise<void> {
  const journal = await loadOperation(operationId); const artifact = journal.artifacts?.[PHASES.indexOf(phase)]; assert.ok(artifact);
  const value = bag(JSON.parse(await readFile(artifact.path, "utf8"))); change(value);
  const bytes = Buffer.from(JSON.stringify(value)); await writeFile(artifact.path, bytes);
  Object.assign(artifact, { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  // The test deliberately publishes a self-consistent but conflicting history.
  const journalPath = operationPath(operationId);
  const raw = bag(JSON.parse(await readFile(journalPath, "utf8")));
  raw["artifacts"] = journal.artifacts; delete raw["journalSha256"];
  await writeFile(operationPath(operationId), JSON.stringify({ ...raw, journalSha256: sha256Json(raw) }));
}

void test("successful producer phase order is exact and remains the only accepted historical path", async () => {
  const source = await readFile(new URL("../src/current-symbol-baseline-runtime.ts", import.meta.url), "utf8");
  const actual = [...source.matchAll(/record\(slot, "([a-z-]+)"/gu)].map(match => match[1]).filter(phase => phase !== "stopped");
  assert.deepEqual(actual, PHASES); assert.match(source, /state: "plan-invalidated", hardStop: false, orphanedCallPossible: false/u);
});
void test("complete unchanged comparison reads only retained files and changes no journal or raw copy", async () => {
  const selected = await fixture(); const before = await readFile(selected.journalPath), raw = await readFile(selected.rawPath);
  await assert.rejects(stat(SOURCE), { code: "ENOENT" });
  const result = await analyze(selected.operationId);
  assert.equal(result["classification"], "unchanged"); assert.equal(result["comparisonComplete"], true);
  assert.equal(bag(result["sql"])["exactLogicalSqlUnchanged"], true);
  assert.equal(bag(result["native"])["exactMaterializedNativeAndDocumentProvenanceUnchanged"], true);
  for (const key of ["originalProjectRead", "filesWritten", "startupQualified", "openingEffectsVerified", "persistenceVerified", "producerBindingVerified",
    "backendActorVerified", "backendClockVerified", "beforeWriteBaselineVerified", "writerReady", "executionAuthorized", "authorityRestored", "replayAllowed"]) { assert.equal(result[key], false); }
  assert.deepEqual(await readFile(selected.journalPath), before); assert.deepEqual(await readFile(selected.rawPath), raw);
});
for (const effect of ["typed", "rowid", "global", "native", "clock"]) {
  void test(`complete historical comparison detects ${effect} change`, async () => {
    const selected = await fixture(effect); const result = await analyze(selected.operationId);
    assert.equal(result["classification"], "changed"); assert.equal(bag(result["sql"])["exactLogicalSqlUnchanged"], false);
    const native = bag(result["native"]);
    assert.equal(native["semanticContentUnchanged"], effect !== "native");
    assert.equal(native["exactMaterializedNativeAndDocumentProvenanceUnchanged"], !["native", "clock"].includes(effect));
    assert.equal(result["detailedCellOrRecordDifferencesReturned"], false);
  });
}
void test("unfinished, partial, orphaned and failed terminal records refuse before comparison", async (context) => {
  for (const changed of [{ state: "completed" }, { hardStop: true }, { orphanedCallPossible: true }, { finishSnapshotCaptured: false }, { finishSnapshotFailed: true }, { finishReleaseAttempted: false }]) {
    await context.test(JSON.stringify(changed), async () => {
      const selected = await fixture(); const journal = await loadOperation(selected.operationId);
      Object.assign(journal, changed); await updateOperation(journal); await assert.rejects(analyze(selected.operationId));
    });
  }
});
void test("unlisted later evidence and altered raw bytes refuse without rewriting them", async () => {
  const later = await fixture(); await writePhaseArtifact(later.operationId, 25, "later-intent", {});
  await assert.rejects(analyze(later.operationId), /later or conflicting/u);
  const altered = await fixture(); await writeFile(altered.rawPath, "changed");
  await assert.rejects(analyze(altered.operationId)); assert.equal(await readFile(altered.rawPath, "utf8"), "changed");
});
void test("an identical-byte replacement cannot substitute the recorded raw-copy inode", async () => {
  const selected = await fixture(); const bytes = await readFile(selected.rawPath);
  await rename(selected.rawPath, `${selected.rawPath}.preserved`); await writeFile(selected.rawPath, bytes, { mode: 0o600 });
  await assert.rejects(analyze(selected.operationId), /raw-copy identity/u);
  assert.deepEqual(await readFile(`${selected.rawPath}.preserved`), bytes);
});
void test("self-consistent phase edits cannot substitute copy bindings or semantic commitments", async (context) => {
  for (const kind of ["baseline", "native", "source", "path", "retirement"]) {
    await context.test(kind, async () => {
      const selected = await fixture();
      await editPhase(selected.operationId, "finish-snapshot-result", value => {
        if (kind === "baseline") { value["baselineCopyReceiptSha256"] = "0".repeat(64); }
        if (kind === "native") { bag(value["native"])["historySemanticSha256"] = "0".repeat(64); }
        if (kind === "retirement") { value["snapshotCaptured"] = false; }
        if (kind === "source" || kind === "path") {
          const copy = bag(value["copy"]); delete copy["receiptSha256"];
          copy[kind === "source" ? "source" : "artifact"] = kind === "source" ? `${SOURCE}.foreign` : SOURCE; value["copy"] = seal(copy, "receiptSha256");
        }
      });
      await assert.rejects(analyze(selected.operationId));
    });
  }
});
void test("checkpoint receipts require the complete producer shape and equal logical dump commitments", async (context) => {
  for (const field of ["createdAt", "sourceDumpSha256", "checkpointDumpSha256", "sourceStatAfter", "different-dump", "copy-source-size"]) {
    await context.test(field, async () => {
      // The receipt file, phase result and retirement all retain the same
      // Changed self-sealed data. Missing producer fields must still refuse.
      const selected = await fixture("none", undefined, field);
      await assert.rejects(analyze(selected.operationId));
    });
  }
});
void test("self-sealed closure substitutions cannot change launch, Job, policy or process-tree bindings", async (context) => {
  for (const kind of ["schema", "launchSha256", "jobId", "helperInstance", "policySha256", "captureBindingSha256", "processTreeSha256", "gateway", "sequence"]) {
    await context.test(kind, async () => {
      // All downstream receipts and self-hashes agree with the changed closure;
      // Only binding to the original launch/capture rejects these variants.
      const selected = await fixture("none", kind);
      await assert.rejects(analyze(selected.operationId));
    });
  }
});
