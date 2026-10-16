import assert from "node:assert/strict";
import fsPromises, { appendFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { controlDataDirectory, createOperation, ensureManagedDirectory, loadOperation, operationPath, publishManagedAttachmentExclusive,
  updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import { abandonCurrentSymbolBaselineBeforeRelaunch, inspectCurrentSymbolBaselineAbandonment } from "../src/current-symbol-baseline-abandonment.ts";
import { scanQualifiedAdmissionOperations } from "../src/closed-symbol-terminal-admission.ts";
import { historicalAbandonmentRequestSchema, runHistoricalAbandonment } from "../src/historical-abandonment.ts";
import { OPERATION_SCHEMA, buildPlanHash, normalizeEasyedaProjectPath, sha256Json, sha256Text } from "../src/core.ts";

const HASH = "a".repeat(64);
const RAW_PATH = String.raw`C:\SyntheticNeverOpened\Disposable.eprj2`;
const SOURCE = normalizeEasyedaProjectPath(RAW_PATH);
const TARGET = { rawWindowsPath: RAW_PATH, projectUuid: sha256Text(RAW_PATH), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: HASH };
const phaseNames = ["capture-intent", "capture-result", "close-intent", "close-result", "copy-intent", "copy-result", "stopped"];
let counter = 0;
function seal(data: Record<string, unknown>, key: string): Record<string, unknown> { return { ...data, [key]: sha256Json(data) }; }
async function selected(operationId: string): Promise<Awaited<ReturnType<typeof scanQualifiedAdmissionOperations>>[number] | undefined> {
  const operations = await scanQualifiedAdmissionOperations(); return operations.find(item => item.summary.operationId === operationId);
}
async function fixture(selectedId?: string): Promise<{ operationId: string; journalPath: string; sidecar: string; copyPath: string; checkpointPath: string }> {
  counter += 1;
  const operationId = selectedId ?? `current-baseline-abandonment-test-${counter}`;
  const directory = operationPath(operationId).slice(0, -5);
  const checkpointDirectory = join(controlDataDirectory(), "checkpoints");
  await ensureManagedDirectory(directory); await ensureManagedDirectory(checkpointDirectory);
  const checkpointBytes = Buffer.from(`synthetic checkpoint ${counter}\n`), rawBytes = Buffer.from(`synthetic raw copy ${counter}\n`);
  const copyPath = join(directory, "closed-copy-00000000-0000-0000-0000-000000000001.eprj2");
  const checkpointPath = join(checkpointDirectory, `${operationId}.eprj2`), receiptPath = checkpointPath.replace(/\.eprj2$/u, ".checkpoint.json");
  const raw = await publishManagedAttachmentExclusive(copyPath, "Synthetic raw copy", rawBytes, "synthetic");
  const checkpoint = await publishManagedAttachmentExclusive(checkpointPath, "Synthetic checkpoint", checkpointBytes, "synthetic");
  const checkpointDescriptor = { path: checkpointPath, bytes: checkpoint.bytes, sha256: checkpoint.sha256 };
  const checkpointReceipt = seal({ schema: "easyeda-pro-control.checkpoint.v2", source: SOURCE, checkpoint: checkpointPath, receiptPath,
    sourceSha256: raw.sha256, checkpointSha256: checkpoint.sha256 }, "receiptSha256");
  await publishManagedAttachmentExclusive(receiptPath, "Synthetic checkpoint receipt", Buffer.from(JSON.stringify(checkpointReceipt)), "synthetic");
  const launch = { jobId: "d".repeat(32), helperInstance: "e".repeat(32), root: { pid: 1234, role: "easyeda-main", startIdentity: `win32:123:job:${"d".repeat(32)}` } };
  const openingOperationId = `current-opening-abandonment-test-${counter}`;
  const preparation = seal({ profile: "private.current-owned-symbol-metadata-preparation.v1", openingOperationId,
    postOpeningBaselineVerified: false, writerReady: false, executionAuthorized: false }, "preparationSha256");
  const plan = { profile: "easyeda-pro-control.current-symbol-closed-baseline.v1", openingOperationId, target: TARGET, launch,
    expectedFingerprintSha256: HASH, preparationSha256: preparation["preparationSha256"] };
  const authority = seal({ schema: "easyeda-pro-control.execution-authority.v1", bindingSha256: HASH, policyId: "synthetic-policy", policySha256: HASH,
    processes: [launch.root], processTreeSha256: sha256Json([launch.root]) }, "authoritySha256");
  const capture = { operationId, phase: "closed-baseline", challengeAttempt: 1,
    bridgeSession: { sessionId: "synthetic" }, runtimeIdentity: { synthetic: true }, executionAuthority: authority };
  const shared = { operationId, phase: "closed-baseline", challengeAttempt: 1, authoritySha256: authority["authoritySha256"], launchSha256: sha256Json(launch),
    bridgeSessionSha256: sha256Json(capture.bridgeSession), runtimeIdentitySha256: sha256Json(capture.runtimeIdentity),
    helperInstance: launch.helperInstance, jobId: launch.jobId, policyId: authority["policyId"], policySha256: authority["policySha256"] };
  const intent = seal({ ...shared, schema: "easyeda-pro-control.closed-session-close-intent.v1", captureBindingSha256: HASH }, "closeIntentSha256");
  const closeReceipt = seal({ schema: "easyeda-pro-control.closed-session-close-dispatch.v1", closeIntentSha256: intent["closeIntentSha256"],
    closeDispatched: true, saveOrDiscardSelected: false, terminationProved: false }, "closeReceiptSha256");
  const proof = seal({ ...shared, schema: "easyeda-pro-control.closed-session-termination.v1", closeIntentSha256: intent["closeIntentSha256"],
    closeReceiptSha256: closeReceipt["closeReceiptSha256"], jobEmpty: true, retainedProcessesExited: true, saveOrDiscardSelected: false,
    queuedWritesPersisted: "not-proved", persistentWorkReplayExcluded: "not-proved" }, "proofSha256");
  const copy = seal({ schema: "easyeda-pro-control.closed-file-byte-copy.v1", source: SOURCE, artifact: copyPath, bytes: raw.bytes, sha256: raw.sha256,
    closureProofSha256: proof["proofSha256"], sourceEqualsArtifactBytes: true, sourceProjectGenerationBindingVerified: false, executionAuthorized: false }, "receiptSha256");
  const copyResult = { checkpoint: checkpointReceipt, copy,
    preparation: { checkpoint: checkpointDescriptor, target: { ...TARGET, ownerUuid: "f".repeat(32) } },
    targetEvidence: { ...TARGET, docType: "PCB", ownerUuid: "f".repeat(32) }, sql: { checkpointSha256: raw.sha256, schemaSha256: HASH, logicalSha256: HASH },
    beforeWriteBaselineVerified: false, openingEffectsVerified: false, writerReady: false, executionAuthorized: false };
  const stopped = { phase: "relaunch-or-release", replayAllowed: false, closeAttempted: true, copyAttempted: true, relaunchAttempted: true,
    launchAcknowledged: false, releaseAttempted: false, captureReleased: false, admissionAttempted: false, admissionCaptureRetained: false,
    cacheAttempted: false, cacheReplyRetained: false, projectOpenAttempted: false, projectOpenReplyRetained: false, finishCloseAttempted: false,
    finishCloseAcknowledged: false, finishReleaseAttempted: false, finishCaptureReleased: false };
  const journal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: "stopped", mutationState: "not-inferred", saved: false, reopened: false, orphanedCallPossible: false, hardStop: true,
    mutationMayHaveOccurred: true, sequence: 7, artifacts: [] as Awaited<ReturnType<typeof writePhaseArtifact>>[], closeAttempted: true, copyAttempted: true,
    relaunchAttempted: true, releaseAttempted: false, admissionAttempted: false, cacheAttempted: false, projectOpenAttempted: false,
    finishCloseAttempted: false, finishReleaseAttempted: false, createdAt: "2026-10-16T00:00:00.000Z", updatedAt: "2026-10-16T00:00:01.000Z",
    nextSafeAction: "Preserve synthetic historical evidence." };
  await createOperation(journal);
  const events = [{ openingOperationId, preparation }, { capture }, { intent }, { closeReceipt }, { proof }, copyResult, stopped];
  for (const [index, phase] of phaseNames.entries()) { journal.artifacts.push(await writePhaseArtifact(operationId, index + 1, phase, events[index])); }
  await updateOperation(journal);
  return { operationId, journalPath: journal.journalPath, sidecar: join(directory, "abandoned-baseline-before-relaunch.json"), copyPath, checkpointPath };
}

void test("pre-relaunch action requires exact confirmation and disposable scope", () => {
  const operationId = "current-baseline-synthetic", request = { action: "abandon-baseline-before-relaunch", operationId,
    confirmation: `${operationId}:abandoned-before-relaunch`, confirmDisposableProject: true };
  assert.deepEqual(historicalAbandonmentRequestSchema.parse(request), request);
  for (const changed of [{ confirmation: "wrong" }, { confirmDisposableProject: false }, { action: "relaunch" },
    { operationId: "../escape" }, { expectedFingerprint: {} }, { code: "ignored()" }]) {
    assert.equal(historicalAbandonmentRequestSchema.safeParse({ ...request, ...changed }).success, false);
  }
});

void test("valid mixed-case and digit-first completed baselines without sidecars preserve ordinary admission", async () => {
  const f = await fixture("1-Current-Baseline-Mixed-Case");
  const journal = await loadOperation(f.operationId); journal["state"] = "completed"; journal["hardStop"] = false;
  await updateOperation(journal);
  assert.equal(await inspectCurrentSymbolBaselineAbandonment(f.operationId), undefined);
  assert.equal(await selected(f.operationId), undefined);
});

void test("sidecar preserves complete history, reads no original source, and grants no replay or current authority", async () => {
  const f = await fixture();
  const before = await readFile(f.journalPath), initial = await selected(f.operationId);
  await assert.rejects(stat(SOURCE), { code: "ENOENT" });
  assert.equal(initial?.unfinished, true);
  const result = await runHistoricalAbandonment({ action: "abandon-baseline-before-relaunch", operationId: f.operationId,
    confirmation: `${f.operationId}:abandoned-before-relaunch`, confirmDisposableProject: true });
  for (const key of ["completionProved", "processClosureProved", "sourceInvarianceProved", "authorityRestored", "executionAuthorized", "replayAllowed", "saved", "reopened"] as const) {
    assert.equal(Reflect.get(result, key), false);
  }
  const sidecar = await readFile(f.sidecar);
  assert.deepEqual(await abandonCurrentSymbolBaselineBeforeRelaunch(f.operationId), result);
  assert.deepEqual(await readFile(f.sidecar), sidecar); assert.deepEqual(await readFile(f.journalPath), before);
  assert.equal(await selected(f.operationId), undefined);
  await writeFile(f.copyPath, "corrupted raw copy", { mode: 0o600 });
  const refused = await selected(f.operationId);
  assert.equal(refused?.qualification, "abandonment-evidence-invalid"); assert.equal(refused.bridgeBlocking, true); assert.equal(refused.unfinished, true);
  assert.deepEqual(await readFile(f.journalPath), before);
});

void test("later relaunch intent, incomplete prefix, ambiguous flags and changed phase bytes never publish", async (context) => {
  for (const kind of ["later", "missing", "orphan", "admitted", "phase-drift"] as const) {
    await context.test(kind, async () => {
      const f = await fixture();
      const journal = await loadOperation(f.operationId);
      if (kind === "later") { await writePhaseArtifact(f.operationId, 8, "relaunch-intent", { synthetic: true }); }
      if (kind === "missing") { journal.artifacts?.splice(3, 1); await updateOperation(journal); }
      if (kind === "orphan") { journal["orphanedCallPossible"] = true; await updateOperation(journal); }
      if (kind === "admitted") { journal["admissionAttempted"] = true; await updateOperation(journal); }
      if (kind === "phase-drift") { await writeFile(join(f.journalPath.slice(0, -5), "07-stopped.json"), "{}"); }
      const before = await readFile(f.journalPath);
      await assert.rejects(abandonCurrentSymbolBaselineBeforeRelaunch(f.operationId));
      await assert.rejects(stat(f.sidecar), { code: "ENOENT" }); assert.deepEqual(await readFile(f.journalPath), before);
    });
  }
});

void test("sidecar or later evidence corruption is requalified on every scan", async () => {
  const f = await fixture(); await abandonCurrentSymbolBaselineBeforeRelaunch(f.operationId);
  const original = await readFile(f.sidecar);
  await writeFile(f.sidecar, "{}");
  await assert.rejects(inspectCurrentSymbolBaselineAbandonment(f.operationId));
  const refused = await selected(f.operationId); assert.equal(refused?.bridgeBlocking, true);
  await writeFile(f.sidecar, original);
  await writePhaseArtifact(f.operationId, 8, "relaunch-intent", { synthetic: true });
  await assert.rejects(inspectCurrentSymbolBaselineAbandonment(f.operationId), /later or unrecognized/u);
});

void test("historical qualification refuses an operation directory substituted during enumeration", async (context) => {
  const f = await fixture();
  const directory = f.journalPath.slice(0, -5), originalOpendir = fsPromises.opendir;
  let substituted = false;
  context.mock.method(fsPromises, "opendir", async (...args: Parameters<typeof originalOpendir>) => {
    const opened = await originalOpendir(...args);
    if (!substituted) {
      substituted = true;
      await rename(directory, `${directory}-retained`); await mkdir(directory, { mode: 0o700 });
    }
    return opened;
  });
  syncBuiltinESMExports();
  try { await assert.rejects(abandonCurrentSymbolBaselineBeforeRelaunch(f.operationId), /directory.*changed/u); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  await assert.rejects(stat(f.sidecar), { code: "ENOENT" });
});

void test("producer records durable relaunch intent before every native launch", async () => {
  const source = await readFile(new URL("../src/current-symbol-baseline-runtime.ts", import.meta.url), "utf8");
  const begin = source.indexOf("public async relaunch("), end = source.indexOf("public async admit(", begin);
  const method = source.slice(begin, end);
  assert.ok(begin > 0 && end > begin);
  const intent = method.indexOf('record(slot, "relaunch-intent"'), launch = method.indexOf("await this.runtime.launch()");
  assert.ok(intent !== -1 && launch > intent); assert.equal(method.match(/this\.runtime\.launch\(/gu)?.length, 1);
});

void test("exact managed binary verification refuses malformed descriptors, wrong hashes and named-path substitution", async (context: TestContext) => {
  const f = await fixture();
  const bytes = await readFile(f.copyPath), descriptor = { path: f.copyPath, bytes: bytes.length, sha256: sha256Text(bytes.toString()) };
  await verifyExactManagedArtifact(descriptor);
  for (const input of [{ ...descriptor, bytes: 268_435_457 }, { ...descriptor, bytes: Number.NaN }, { ...descriptor, sha256: "0".repeat(64) },
    { ...descriptor, path: SOURCE }]) { await assert.rejects(verifyExactManagedArtifact(input)); }
  const accessor = { ...descriptor }; Object.defineProperty(accessor, "bytes", { get: () => { assert.fail("Descriptor getter executed"); } });
  await assert.rejects(verifyExactManagedArtifact(accessor), /own data/u);
  const originalOpen = fsPromises.open;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
    const handle = await originalOpen(...args);
    if (String(args[0]).endsWith(`/${f.copyPath.split("/").at(-1)}`)) {
      const flushHandle = handle.sync.bind(handle);
      context.mock.method(handle, "sync", async () => {
        await flushHandle(); await rename(f.copyPath, `${f.copyPath}.retained`); await writeFile(f.copyPath, bytes, { flag: "wx", mode: 0o600 });
      });
    }
    return handle;
  });
  syncBuiltinESMExports();
  try { await assert.rejects(verifyExactManagedArtifact(descriptor), /changed/u); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
});

void test("binary growth after sync refuses before creating a hash stream", async (context) => {
  const f = await fixture();
  const bytes = await readFile(f.copyPath), originalOpen = fsPromises.open;
  let streams = 0;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
    const handle = await originalOpen(...args);
    if (String(args[0]).endsWith(`/${f.copyPath.split("/").at(-1)}`)) {
      const flushHandle = handle.sync.bind(handle), originalStream = handle.createReadStream.bind(handle);
      context.mock.method(handle, "sync", async () => { await flushHandle(); await appendFile(f.copyPath, "growth"); });
      context.mock.method(handle, "createReadStream", (...options: Parameters<typeof originalStream>) => { streams += 1; return originalStream(...options); });
    }
    return handle;
  });
  syncBuiltinESMExports();
  const expected = { path: f.copyPath, bytes: bytes.length, sha256: sha256Text(bytes.toString()) };
  try { await assert.rejects(verifyExactManagedArtifact(expected), /byte length changed before hashing/u); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  assert.equal(streams, 0);
});
