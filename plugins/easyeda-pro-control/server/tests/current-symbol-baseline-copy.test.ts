/* oxlint-disable import/max-dependencies -- Exercise actual retained termination, closed copy, full SQL and native metadata leaves together; only the opening-owner seam is evaluated privately. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { chmod, lstat, mkdir, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import vm from "node:vm";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact } from "../src/artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../src/closed-file-sql.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import type { CurrentSymbolBaselineOwner } from "../src/current-disposable-open-runtime.ts";
import { assessCurrentStartupPremises } from "../src/current-startup-premises.ts";
import { assertOriginalCurrentSymbolFinishSnapshot, captureCurrentSymbolBaselineCopy } from "../src/current-symbol-baseline-copy.ts";
import type { CurrentSymbolBaselineCopyEvidence, CurrentSymbolBaselineCopyInput, CurrentSymbolFinishSnapshot, CurrentSymbolFinishSnapshotEvidence, CurrentSymbolFinishSnapshotInput, CurrentSymbolVerificationSnapshotInput,
  assertOriginalCurrentSymbolBaselineCopy, assertOriginalCurrentSymbolVerificationSnapshot, captureCurrentSymbolFinishSnapshot, captureCurrentSymbolVerificationSnapshot,
  revalidateCurrentSymbolBaselineCopy, revalidateCurrentSymbolFinishSnapshot } from "../src/current-symbol-baseline-copy.ts";
import { currentClosedSymbolMetadataProjection, validateCurrentClosedSymbolMetadataResult } from "../src/current-symbol-closed-target.ts";
import { prepareCurrentSymbolMetadata } from "../src/current-symbol-metadata-preparation.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "../src/engine.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "../src/native-history.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "../src/windows-authority.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const RAW_PATH = String.raw`C:\SyntheticOnly\ClosedBaseline.eprj2`;
const TARGET = { projectUuid: sha256Text(RAW_PATH), branchUuid: "2".repeat(32), ownerUuid: "3".repeat(32), symbolUuid: "4".repeat(16) };
const HEAD = "6".repeat(32), KEY = "7".repeat(32), PCB = "5".repeat(16);
const digest = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
function record(type: string, body: unknown, id?: string): string {
  return `${JSON.stringify({ type, ticket: 1, ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}
function contents(pcbType = "PCB", title = "Original"): string {
  const header = { client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2.206" };
  return record("DOCHEAD", { ...header, uuid: TARGET.symbolUuid, docType: "SYMBOL" }) +
    record("META", { title, description: "Description", tags: ["fixture"], docType: 2, source: "template" }, "META") +
    record("DOCHEAD", { ...header, uuid: PCB, docType: pcbType }) + record("META", { title: "Fixture PCB" }, "META");
}
function replaceHistory(path: string, raw: string): void {
  const database = new DatabaseSync(path);
  try { database.prepare("UPDATE history_data SET dataStr=?").run(encrypted(raw, HEAD, KEY)); }
  finally { database.close(); }
}
interface Loaded {
  capture: typeof captureCurrentSymbolBaselineCopy;
  original: typeof assertOriginalCurrentSymbolBaselineCopy;
  revalidate: typeof revalidateCurrentSymbolBaselineCopy;
  finish: typeof captureCurrentSymbolFinishSnapshot;
  originalFinish: typeof assertOriginalCurrentSymbolFinishSnapshot;
  revalidateFinish: typeof revalidateCurrentSymbolFinishSnapshot;
  verification: typeof captureCurrentSymbolVerificationSnapshot;
  originalVerification: typeof assertOriginalCurrentSymbolVerificationSnapshot;
}
interface Fixture {
  source: string;
  engine: EasyedaControlEngine;
  input: CurrentSymbolBaselineCopyInput;
  loaded: Loaded;
  events: CurrentSymbolBaselineCopyEvidence[];
  state: { current: boolean; scoped: boolean; finishCapture: ClosedSessionAuthorityCapture | undefined };
  retained: ReturnType<typeof closedSessionFixture>;
  run: (hook?: (event: CurrentSymbolBaselineCopyEvidence) => void) => ReturnType<typeof captureCurrentSymbolBaselineCopy>;
}

/** Private test realm only. Production exports have no owner/verifier injection.
 * Every storage, crypto, inventory and closure implementation below is real.
 */
async function fixture(): Promise<Fixture> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "current-baseline-")), source = join(directory, "fixture.eprj2");
  const database = new DatabaseSync(source);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY,branch_uuid TEXT,owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY,project_uuid TEXT,history_uuid TEXT);
      CREATE TABLE project_history_${TARGET.branchUuid}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(TARGET.projectUuid, TARGET.branchUuid, TARGET.ownerUuid);
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(TARGET.branchUuid, TARGET.projectUuid, HEAD);
    database.prepare(`INSERT INTO project_history_${TARGET.branchUuid} VALUES(?,?,?,?,?,?)`).run(HEAD, null, null, KEY, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HEAD, HEAD, encrypted(contents(), HEAD, KEY));
  } finally { database.close(); }
  await chmod(source, 0o600);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "synthetic-opening" },
    { expectedSource: source, artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: await controlRootCapability(), maximumSourceBytes: 268_435_456 });
  const checkpointBytes = await readFile(checkpoint.checkpoint);
  const checkpointPreparation = await prepareCurrentSymbolMetadata({ checkpoint: { path: checkpoint.checkpoint, bytes: checkpointBytes.length, sha256: digest(checkpointBytes) },
    target: TARGET, patch: { name: "Renamed fixture" } });
  // The baseline must accept new post-opening bytes, not reuse the old hash.
  const opened = new DatabaseSync(source);
  try { opened.exec("CREATE TABLE synthetic_open_effect(value TEXT); INSERT INTO synthetic_open_effect VALUES('observed, not accepted')"); }
  finally { opened.close(); }
  const owner: CurrentSymbolBaselineOwner = Object.freeze({ profile: "private.current-symbol-baseline-owner.v1",
    operationId: `current-baseline-${directory.split("/").at(-1) ?? "missing"}`, openingOperationId: "synthetic-original-opening" });
  await mkdir(operationPath(owner.operationId).slice(0, -5), { recursive: true, mode: 0o700 });
  const retained = closedSessionFixture();
  const binding = await retained.capture({ ...INPUT, operationId: owner.operationId, orphanPhase: "closed-baseline" });
  const capture: ClosedSessionAuthorityCapture = { operationId: owner.operationId, phase: "closed-baseline", challengeAttempt: 1,
    bridgeSession: binding.bridgeSession, runtimeIdentity: binding.runtimeIdentity, executionAuthority: binding.executionAuthority };
  const intent = await retained.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await retained.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await retained.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  const active = { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid, documentUuid: PCB, tabId: `${PCB}@${TARGET.projectUuid}` };
  const observation = validateCurrentClosedSymbolMetadataResult({ method: "eda.lib_Symbol.get", arguments: { symbolUuid: TARGET.symbolUuid }, target: active }, {
    ok: true, kind: "current-closed-symbol-metadata-witness", method: "eda.lib_Symbol.get", target: active,
    value: { uuid: TARGET.symbolUuid, projectUuid: TARGET.projectUuid, ownerUuid: TARGET.ownerUuid, name: "Original", description: "Description",
      tagsJson: '["fixture"]', source: "template", version: "1", ticket: 1 }, samples: 2, implementationKind: "native-task-equivalent",
    clientTicketObservation: { client: "a".repeat(16), maxTicket: 1, samples: 4 },
    runtimeObservation: { editorVersion: "3.2.206", actor: { uuid: TARGET.ownerUuid, username: "synthetic-user", nickname: "Synthetic" },
      clockSamples: Array.from({ length: 4 }, (_, index) => ({ rendererBeforeMs: 1000 + index * 3,
        serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
      backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false },
    targetClosedInRegistry: true, hiddenEditorsVerified: true, workerIdentityVerified: false,
    cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
  const state = { current: true, scoped: false, finishCapture: undefined as ClosedSessionAuthorityCapture | undefined };
  const syntheticClock = Object.freeze({ syntheticOriginalCaptureClock: true });
  const syntheticEngine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): { synthetic: string } | undefined => state.scoped ? { synthetic: "scope" } : undefined },
    clockObservationForClosedCapture: (candidate: unknown): Promise<typeof syntheticClock> => {
      assert.equal(candidate, state.finishCapture, "synthetic original finish capture required"); return Promise.resolve(syntheticClock);
    },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(), assertRecoveryOperationIsolated: (): Promise<void> => Promise.resolve() };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the source-evaluated private owner seam accepts this explicit synthetic engine; actual production admission is tested separately.
  const engine = syntheticEngine as unknown as EasyedaControlEngine;
  const original = { source: { target: { ...active, rawWindowsPath: RAW_PATH, expectedSourceSha256: checkpoint.sourceSha256 },
    preNavigationCheckpoint: { checkpoint }, launchProjection: binding.launch, bridgeSession: binding.bridgeSession },
  preparation: { openingOperationId: owner.openingOperationId, checkpointPreparation, closedTargetWitness: { observation } } };
  const assertOwner = (candidate: unknown, candidateEngine: unknown): typeof original => {
    assert.equal(candidate, owner, "synthetic original owner required"); assert.equal(candidateEngine, engine); assert.equal(state.current, true, "synthetic owner lost");
    return original;
  };
  const sourceText = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-baseline-copy.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const scope = vm.createContext({ Object, String, Number, Buffer, structuredClone, lstat, join, controlDataDirectory, controlRootCapability, operationPath, readArtifact,
    createCheckpoint, verifyCheckpoint, assertIssuedClosedFileCopy, copyClosedProjectBytes, readClosedCopySqlInventory, readerCompletion, canonicalJson, isRecord, sha256Json,
    normalizeEasyedaProjectPath: (raw: string): string => { assert.equal(raw, RAW_PATH); return source; },
    assertCurrentSymbolBaselineOwner: assertOwner, revalidateCurrentSymbolBaselineOwner: (candidate: unknown, candidateEngine: unknown) => Promise.resolve(assertOwner(candidate, candidateEngine)),
    currentClosedSymbolMetadataProjection, prepareCurrentSymbolMetadata, assessCurrentStartupPremises, isNativeDocumentDeleted, readNativeHistoryCheckpoint,
    assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority,
    // Engine-owned capture clock is a test-only seam here; runtime tests execute
    // The actual engine/clock issuer. Native termination/copy/SQL remain real.
    assertIssuedWindowsClockObservation: (candidate: unknown): Promise<typeof syntheticClock> => {
      assert.equal(candidate, syntheticClock); return Promise.resolve(syntheticClock);
    } });
  const exports: unknown = vm.runInContext(`${sourceText}\n({capture:captureCurrentSymbolBaselineCopy,original:assertOriginalCurrentSymbolBaselineCopy,
    revalidate:revalidateCurrentSymbolBaselineCopy,finish:captureCurrentSymbolFinishSnapshot,originalFinish:assertOriginalCurrentSymbolFinishSnapshot,
    revalidateFinish:revalidateCurrentSymbolFinishSnapshot,verification:captureCurrentSymbolVerificationSnapshot,
    originalVerification:assertOriginalCurrentSymbolVerificationSnapshot});`, scope);
  assert.ok(isRecord(exports) && typeof exports["capture"] === "function" && typeof exports["original"] === "function" && typeof exports["revalidate"] === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked functions come from the maintained source in the private test realm, never from plugin input.
  const loaded = exports as unknown as Loaded;
  const input = { owner, capture, intent, closeReceipt, proof, runtime: await syntheticSqlRuntime() };
  const events: CurrentSymbolBaselineCopyEvidence[] = [];
  return { source, engine, input, loaded, events, state, retained,
    run: (hook) => loaded.capture(engine, input, (event) => { events.push(event); hook?.(event); }) };
}

async function finalInput(value: Fixture): Promise<CurrentSymbolFinishSnapshotInput> {
  const baseline = await value.run();
  const binding = await value.retained.capture({ ...INPUT, bindingSha256: "f".repeat(64), operationId: value.input.owner.operationId, orphanPhase: "closed-edit",
    bridgeSession: { ...INPUT.bridgeSession, sessionId: "synthetic-new-session", sequence: 2 } });
  const capture: ClosedSessionAuthorityCapture = { operationId: binding.operationId, phase: "closed-edit", challengeAttempt: binding.challengeAttempt,
    bridgeSession: binding.bridgeSession, runtimeIdentity: binding.runtimeIdentity, executionAuthority: binding.executionAuthority };
  value.state.finishCapture = capture;
  const intent = await value.retained.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await value.retained.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await value.retained.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  // The old generation/owner is intentionally unavailable after relaunch.
  value.state.current = false;
  return { baseline, capture, intent, closeReceipt, proof, launch: binding.launch, runtime: value.input.runtime };
}

async function verificationInput(value: Fixture, finishSnapshot: CurrentSymbolFinishSnapshot): Promise<CurrentSymbolVerificationSnapshotInput> {
  const binding = await value.retained.capture({ ...INPUT, bindingSha256: "e".repeat(64), operationId: value.input.owner.operationId, orphanPhase: "closed-verification",
    bridgeSession: { ...INPUT.bridgeSession, sessionId: "synthetic-verification-session", sequence: 3 } });
  const capture: ClosedSessionAuthorityCapture = { operationId: binding.operationId, phase: "closed-verification", challengeAttempt: binding.challengeAttempt,
    bridgeSession: binding.bridgeSession, runtimeIdentity: binding.runtimeIdentity, executionAuthority: binding.executionAuthority };
  value.state.finishCapture = capture;
  const intent = await value.retained.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await value.retained.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await value.retained.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  return { finishSnapshot, capture, intent, closeReceipt, proof, launch: binding.launch, runtime: value.input.runtime };
}

void test("baseline copy retains original-owner combined admission and post-root/final checks without duplicate scans", async () => {
  const copySource = await readFile(new URL("../src/current-symbol-baseline-copy.ts", import.meta.url), "utf8");
  const ownerSource = await readFile(new URL("../src/current-disposable-open-runtime.ts", import.meta.url), "utf8");
  const copyStart = copySource.indexOf("export async function captureCurrentSymbolBaselineCopy(");
  const copyEnd = copySource.indexOf("\nexport interface CurrentSymbolFinishSnapshotInput");
  const ownerStart = ownerSource.indexOf("  private transferBaseline(");
  const ownerEnd = ownerSource.indexOf("  private issueGeneration(");
  assert.ok(copyStart > 0 && copyEnd > copyStart && ownerStart > 0 && ownerEnd > ownerStart);
  const copy = copySource.slice(copyStart, copyEnd), owner = ownerSource.slice(ownerStart, ownerEnd);
  assert.match(owner, /current\(\); await engine\.assertBridgeAndRecoveryAdmission\(operationId\); current\(\);\s+const persisted = await this\.load\(owner\.openingOperationId\); current\(\);/u);
  assert.match(copy, /const retained = await revalidateCurrentSymbolBaselineOwner\(owner, engine\);/u);
  assert.doesNotMatch(copy, /engine\.assert(?:BridgeDispatchAllowed|RecoveryOperationIsolated)\(/u);
  assert.equal([...copy.matchAll(/await current\(\);/gu)].length, 11);
  assert.match(copy, /await current\(\);\s+const root = await controlRootCapability\(\); await current\(\);/u);
  assert.match(copy, /const verified = await verifyCheckpoint\(checkpoint\.receiptPath, policy\); await current\(\);/u);
  assert.match(copy, /assertCurrentClosedSessionCopyAuthority\(proof\); unchanged\(\);\s+issued\.set\(result,/u);
});

void test("final snapshot retains changed closed bytes and full reader evidence without reusing old owner authority", async () => {
  const value = await fixture();
  const input = await finalInput(value);
  const database = new DatabaseSync(value.source);
  try { database.exec("INSERT INTO synthetic_open_effect VALUES('unqualified second startup')"); } finally { database.close(); }
  const bytes = await readFile(value.source), events: string[] = [];
  const result = await value.loaded.finish(value.engine, input, (event) => { events.push(event.kind); });
  assert.deepEqual(events, ["checkpoint", "copy", "inventory"]);
  assert.equal(result.copy.sha256, digest(bytes)); assert.notEqual(result.copy.sha256, input.baseline.copy.sha256);
  assert.equal(result.sql.checkpointSha256, result.copy.sha256); assert.equal(result.native.projectUuid, TARGET.projectUuid);
  assert.equal(result.native.ownerUuid, TARGET.ownerUuid); assert.equal(result.native.documents, 2);
  assert.equal(result.baselineCopyReceiptSha256, input.baseline.copy.receiptSha256);
  assert.equal(result.snapshotCaptured, true); assert.equal(result.openingEffectsVerified, false); assert.equal(result.persistenceVerified, false);
  assert.equal(result.writerReady, false); assert.equal(result.executionAuthorized, false);
  assert.deepEqual(await readFile(result.copy.artifact), bytes); assert.deepEqual(await readFile(value.source), bytes);
  await assert.rejects(value.loaded.finish(value.engine, input, () => { assert.fail("Consumed final copy repeated"); }), /consumed/u);
});

void test("post-edit snapshot issuer retains original inventory and closure but rejects reconstructed or changed evidence", async () => {
  const value = await fixture();
  const events: CurrentSymbolFinishSnapshotEvidence[] = [], foreign = await fixture(), input = await finalInput(value);
  const result = await value.loaded.finish(value.engine, input, (event) => { events.push(event); });
  const original = value.loaded.originalFinish(result, value.engine);
  assert.equal(original.baseline, input.baseline); assert.equal(original.capture, input.capture);
  assert.equal(original.proof, input.proof); assert.equal(original.launch, input.launch);
  const inventory = events[2]; assert.ok(inventory?.kind === "inventory"); assert.equal(original.inventory, inventory.value);
  assert.equal(readerCompletion(original.inventory).observedChildClose, true);
  assert.throws(() => { assertOriginalCurrentSymbolFinishSnapshot(result, value.engine); }, /not issued/u);
  assert.throws(() => { value.loaded.originalFinish(structuredClone(result), value.engine); }, /not issued/u);
  assert.throws(() => { value.loaded.originalFinish(result, foreign.engine); }, /not issued/u);
  assert.equal(Object.isFrozen(original.inventory), true);
  assert.equal(Reflect.set(original.capture, "phase", "closed-baseline"), true);
  assert.throws(() => { value.loaded.originalFinish(result, value.engine); }, /not issued/u);
});

void test("post-edit relaunch revalidation uses its own checkpoint and current proof, not the retired baseline owner", async () => {
  for (const fault of ["none", "source", "checkpoint", "receipt"] as const) {
    const value = await fixture();
    const input = await finalInput(value);
    const database = new DatabaseSync(value.source);
    try { database.exec("INSERT INTO synthetic_open_effect VALUES('post-edit state')"); } finally { database.close(); }
    const result = await value.loaded.finish(value.engine, input, () => {
      // This test consumes the completed issued snapshot below.
    });
    assert.notEqual(result.copy.sha256, input.baseline.copy.sha256);
    await assert.rejects(value.loaded.revalidateFinish(value.engine, structuredClone(result)), /not issued/u);
    if (fault === "source") {
      const changed = new DatabaseSync(value.source);
      try { changed.exec("INSERT INTO synthetic_open_effect VALUES('late drift')"); } finally { changed.close(); }
    }
    if (fault === "checkpoint") {
      const path = result.checkpoint.checkpoint;
      const bytes = await readFile(path);
      await rename(path, `${path}.retained`); await writeFile(path, bytes, { flag: "wx", mode: 0o600 });
    }
    if (fault === "receipt") { await writeFile(result.checkpoint.receiptPath, JSON.stringify({ ...result.checkpoint, label: "substituted" })); }
    await (fault === "none" ? value.loaded.revalidateFinish(value.engine, result) :
      assert.rejects(value.loaded.revalidateFinish(value.engine, result), /changed|identity/u));
    assert.equal(value.state.current, false); assert.equal(result.persistenceVerified, false);
    assert.equal(value.retained.requests.filter((request) => request["action"] === "release-capture").length, 0);
  }
});

void test("closed verification snapshot retains its own full inventory and binds the original post-edit predecessor", async () => {
  const value = await fixture();
  const input = await finalInput(value);
  const finish = await value.loaded.finish(value.engine, input, () => {
    // The predecessor's full inventory is retrieved from its original issuer below.
  }), finishOriginal = value.loaded.originalFinish(finish, value.engine);
  const events: CurrentSymbolFinishSnapshotEvidence[] = [], verifyInput = await verificationInput(value, finish);
  const result = await value.loaded.verification(value.engine, verifyInput, (event) => { events.push(event); });
  assert.deepEqual(events.map((event) => event.kind), ["checkpoint", "copy", "inventory"]);
  const inventory = events[2], original = value.loaded.originalVerification(result, value.engine);
  assert.ok(inventory?.kind === "inventory"); assert.equal(original.inventory, inventory.value); assert.notEqual(original.inventory, finishOriginal.inventory);
  assert.equal(original.baseline, input.baseline); assert.equal(original.capture, verifyInput.capture); assert.equal(original.proof, verifyInput.proof);
  assert.equal(original.capture.phase, "closed-verification"); assert.notEqual(original.launch.jobId, finishOriginal.launch.jobId);
  assert.equal(result.copy.sha256, finish.copy.sha256); assert.notEqual(result.copy.closureProofSha256, finish.copy.closureProofSha256);
  assert.equal(result.posteditCopyReceiptSha256, finish.copy.receiptSha256); assert.equal(result.baselineCopyReceiptSha256, input.baseline.copy.receiptSha256);
  assert.equal(result.persistenceVerified, false); assert.equal(result.writerReady, false); assert.equal(result.executionAuthorized, false);
  assert.throws(() => { value.loaded.originalVerification(structuredClone(result), value.engine); }, /not issued/u);
  assert.equal(value.loaded.originalFinish(finish, value.engine), finishOriginal);
  await assert.rejects(value.loaded.verification(value.engine, verifyInput, () => { assert.fail("Verification capture repeated"); }), /consumed/u);
});

void test("closed verification consumes failed attempts without reusing old phase, cloned proof or failed evidence publication", async () => {
  for (const fault of ["old-phase", "proof", "publication"] as const) {
    const value = await fixture();
    const input = await finalInput(value);
    const events: string[] = [], finish = await value.loaded.finish(value.engine, input, () => {
      // Only verification-attempt events are collected here.
    }), verifyInput = await verificationInput(value, finish);
    if (fault === "old-phase") { Reflect.set(verifyInput.capture, "phase", "closed-edit"); }
    if (fault === "proof") { Reflect.set(verifyInput, "proof", structuredClone(verifyInput.proof)); }
    await assert.rejects(value.loaded.verification(value.engine, verifyInput, (event) => {
      events.push(event.kind); if (fault === "publication" && event.kind === "inventory") { throw new Error("synthetic verification publication failed"); }
    }));
    assert.deepEqual(events, fault === "publication" ? ["checkpoint", "copy", "inventory"] : []);
    await assert.rejects(value.loaded.verification(value.engine, verifyInput, () => { assert.fail("Failed verification repeated"); }), /consumed/u);
    assert.equal(value.retained.requests.filter((request) => request["action"] === "release-capture").length, 0);
  }
});

void test("final snapshot refuses cloned authority and late source replacement without releasing closure or retrying", async () => {
  for (const fault of ["capture", "proof", "replacement"] as const) {
    const value = await fixture();
    const events: string[] = [], input = await finalInput(value);
    if (fault === "capture") { Reflect.set(input, "capture", structuredClone(input.capture)); }
    if (fault === "proof") { Reflect.set(input, "proof", structuredClone(input.proof)); }
    await assert.rejects(value.loaded.finish(value.engine, input, (event) => {
      events.push(event.kind);
      if (fault === "replacement" && event.kind === "checkpoint") {
        // oxlint-disable-next-line node/no-sync -- Private synthetic source substitution at the exact post-checkpoint boundary.
        const bytes = readFileSync(value.source);
        // oxlint-disable-next-line node/no-sync -- Preserve the original synthetic inode; no production file is accessed.
        renameSync(value.source, `${value.source}.final-retained`);
        // oxlint-disable-next-line node/no-sync -- Exclusive private synthetic replacement tests same-byte lineage refusal.
        writeFileSync(value.source, bytes, { flag: "wx", mode: 0o600 });
      }
    }));
    assert.deepEqual(events, fault === "replacement" ? ["checkpoint", "copy"] : []);
    await assert.rejects(value.loaded.finish(value.engine, input, () => { assert.fail("Failed final copy repeated"); }), /consumed/u);
    assert.equal(value.retained.requests.filter((request) => request["action"] === "release-capture").length, 0);
  }
});

void test("current closed baseline captures new source bytes, real SQL and metadata without writer admission", async () => {
  const value = await fixture();
  const before = await readFile(value.source), result = await value.run();
  assert.deepEqual(value.events.map((event) => event.kind), ["checkpoint", "copy", "inventory", "startup-premises", "preparation"]);
  assert.equal(value.events[1]?.value, result.copy); assert.equal(value.events[2]?.value, result.inventory);
  assert.equal(value.events[3]?.value, result.startupPremises); assert.equal(value.events[4]?.value, result.preparation);
  assert.deepEqual(result.startupPremises.blockers, ["unsupported-sql-schema"]);
  assert.equal(result.startupPremises.historicalSubsetSatisfied, false); assert.equal(result.startupPremises.startupQualified, false);
  assert.equal(result.copy.sha256, digest(before)); assert.equal(result.checkpoint.sourceSha256, digest(before));
  assert.equal(result.inventory.checkpointSha256, result.copy.sha256); assert.equal(readerCompletion(result.inventory).exitCode, 0);
  assertIssuedClosedFileCopy(result.copy); value.loaded.original(result, value.engine);
  assert.throws(() => { value.loaded.original(structuredClone(result), value.engine); }, /not issued/u);
  assert.equal(result.preparation.metadata.after.name, "Renamed fixture"); assert.equal(result.preparation.correlation.metadataMatches, true);
  assert.equal(result.preparation.checkpoint.path, result.checkpoint.checkpoint); assert.equal(result.targetEvidence.documentUuid, PCB);
  assert.equal(result.beforeWriteBaselineVerified, false); assert.equal(result.openingEffectsVerified, false);
  assert.equal(result.writerReady, false); assert.equal(result.executionAuthorized, false);
  assert.deepEqual(await readFile(result.copy.artifact), before); assert.deepEqual(await readFile(value.source), before);
  await assert.rejects(value.run(), /consumed/u);
  await assert.rejects(captureCurrentSymbolBaselineCopy(value.engine, value.input, () => { assert.fail("Unissued owner must not publish evidence"); }), /not issued|owner/iu);
  assert.equal(value.retained.requests.filter((request) => request["action"] === "normal-close").length, 1);
});

void test("current closed baseline rejects foreign owner, cloned proof, wrong closure binding and active scope before copying", async () => {
  for (const fault of ["owner", "proof", "capture", "authority", "intent", "scope"] as const) {
    const value = await fixture();
    if (fault === "owner") { Reflect.set(value.input, "owner", structuredClone(value.input.owner)); }
    if (fault === "proof") { Reflect.set(value.input, "proof", structuredClone(value.input.proof)); }
    if (fault === "capture") { Reflect.set(value.input.capture, "runtimeIdentity", { ...value.input.capture.runtimeIdentity, processId: 999 }); }
    if (fault === "authority") { Reflect.set(value.input.capture.executionAuthority, "capturedAt", "2020-01-01T00:00:00Z"); }
    if (fault === "intent") { Reflect.set(value.input.intent, "jobId", "9".repeat(32)); }
    if (fault === "scope") { value.state.scoped = true; }
    await assert.rejects(value.run()); assert.equal(value.events.length, 0);
  }
});

void test("same-byte source replacement before or after checkpoint refuses exact lineage and retains issued evidence", async () => {
  for (const timing of ["before-capture", "after-checkpoint"] as const) {
    const value = await fixture();
    const replace = (): void => {
      // oxlint-disable-next-line node/no-sync -- Synchronous substitution is confined to this private synthetic source before capture or between checkpoint and copy.
      const bytes = readFileSync(value.source);
      // oxlint-disable-next-line node/no-sync -- Retain the exact old synthetic inode to prove replacement is detected despite identical bytes.
      renameSync(value.source, `${value.source}.retained`);
      // oxlint-disable-next-line node/no-sync -- Exclusive replacement is confined to the test-created synthetic pathname.
      writeFileSync(value.source, bytes, { flag: "wx", mode: 0o600 });
    };
    if (timing === "before-capture") { replace(); }
    await assert.rejects(value.run((event) => { if (timing === "after-checkpoint" && event.kind === "checkpoint") { replace(); } }), /lineage/u);
    assert.deepEqual(value.events.map((event) => event.kind), timing === "before-capture" ? ["checkpoint"] : ["checkpoint", "copy"]);
    if (timing === "after-checkpoint") {
      const copy = value.events[1]; assert.ok(copy?.kind === "copy"); assertIssuedClosedFileCopy(copy.value);
    }
    await assert.rejects(value.run(), /consumed/u);
  }
});

void test("callback failure retains completed evidence and consumes the only baseline attempt", async () => {
  for (const phase of ["inventory", "startup-premises"] as const) {
    const value = await fixture();
    await assert.rejects(value.run((event) => { if (event.kind === phase) { throw new Error("synthetic evidence publication failed"); } }), /publication failed/u);
    assert.deepEqual(value.events.map((event) => event.kind), phase === "inventory" ? ["checkpoint", "copy", "inventory"] : ["checkpoint", "copy", "inventory", "startup-premises"]);
    const inventory = value.events[2]; assert.ok(inventory?.kind === "inventory"); assert.equal(readerCompletion(inventory.value).exitCode, 0);
    await assert.rejects(value.run(), /consumed/u);
  }
});

void test("fresh closed baseline requires the retained PCB, exact owner and observed symbol metadata", async () => {
  for (const fault of ["pcb", "owner", "metadata"] as const) {
    const value = await fixture();
    if (fault === "pcb") { replaceHistory(value.source, contents("FOOTPRINT")); }
    if (fault === "metadata") { replaceHistory(value.source, contents("PCB", "Unobserved rename")); }
    if (fault === "owner") {
      const database = new DatabaseSync(value.source);
      try { database.prepare("UPDATE projects SET owner_uuid=?").run("9".repeat(32)); } finally { database.close(); }
    }
    await assert.rejects(value.run(), /PCB|not proven/u);
    assert.deepEqual(value.events.map((event) => event.kind), fault === "metadata" ? ["checkpoint", "copy", "inventory", "startup-premises"] : ["checkpoint", "copy", "inventory"]);
  }
});

void test("late source change and lost closure owner refuse after retaining fresh metadata", async () => {
  for (const fault of ["source", "helper"] as const) {
    const value = await fixture();
    await assert.rejects(value.run((event) => {
      if (event.kind !== "preparation") { return; }
      if (fault === "helper") { value.retained.behavior.helperLost = true; }
      else {
        const database = new DatabaseSync(value.source);
        try { database.exec("INSERT INTO synthetic_open_effect VALUES('late change')"); } finally { database.close(); }
      }
    }), /changed|helper/u);
    assert.deepEqual(value.events.map((event) => event.kind), ["checkpoint", "copy", "inventory", "startup-premises", "preparation"]);
    await assert.rejects(value.run(), /consumed/u);
  }
});

void test("current baseline revalidation accepts original copy and current proof without changing source", async () => {
  const value = await fixture();
  const result = await value.run();
  const before = await readFile(value.source);
  await value.loaded.revalidate(value.engine, result, value.input.proof);
  assert.deepEqual(await readFile(value.source), before);
  assert.equal(result.beforeWriteBaselineVerified, false); assert.equal(result.executionAuthorized, false);
  assert.equal(value.events.length, 5); assert.equal(value.retained.requests.filter((request) => request["action"] === "normal-close").length, 1);
});

void test("current baseline revalidation refuses source edits, checkpoint substitution and a resealed replacement-source receipt", async () => {
  for (const fault of ["source-edit", "checkpoint", "resealed-receipt"] as const) {
    const value = await fixture();
    const result = await value.run();
    if (fault === "source-edit") {
      const before = await lstat(value.source, { bigint: true }), database = new DatabaseSync(value.source);
      try { database.exec("INSERT INTO synthetic_open_effect VALUES('after baseline')"); } finally { database.close(); }
      const after = await lstat(value.source, { bigint: true }); assert.equal(after.ino, before.ino);
    } else {
      const path = fault === "checkpoint" ? result.checkpoint.checkpoint : value.source;
      const bytes = await readFile(path);
      await rename(path, `${path}.retained`); await writeFile(path, bytes, { flag: "wx", mode: 0o600 });
      if (fault === "resealed-receipt") {
        const stat = await lstat(path, { bigint: true });
        const { receiptSha256: originalReceiptSha256, ...receiptCore } = result.checkpoint;
        const core = { ...receiptCore, sourceIdentity: { dev: stat.dev.toString(), ino: stat.ino.toString(),
          birthtimeNs: stat.birthtimeNs.toString(), ctimeNs: stat.ctimeNs.toString() } };
        const resealed = { ...core, receiptSha256: sha256Text(canonicalJson(core)) };
        assert.notEqual(resealed.receiptSha256, originalReceiptSha256);
        await writeFile(result.checkpoint.receiptPath, JSON.stringify(resealed));
        const verified = await verifyCheckpoint(result.checkpoint.receiptPath, { expectedSource: value.source,
          artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: await controlRootCapability(), maximumSourceBytes: 268_435_456 });
        assert.equal(verified.ok, true, "A valid self-hash does not make a substituted receipt the original baseline");
      }
    }
    await assert.rejects(value.loaded.revalidate(value.engine, result, value.input.proof), /changed/u);
    assert.equal(value.events.length, 5);
  }
});

void test("current baseline revalidation rejects a cloned result before admitting its unchanged files", async () => {
  const value = await fixture();
  const result = await value.run();
  await assert.rejects(value.loaded.revalidate(value.engine, structuredClone(result), value.input.proof), /not issued/u);
  await value.loaded.revalidate(value.engine, result, value.input.proof);
});
