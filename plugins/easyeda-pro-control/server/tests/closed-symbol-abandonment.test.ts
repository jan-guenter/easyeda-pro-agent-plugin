/* oxlint-disable import/max-dependencies -- Focused cases reuse real managed journals/checkpoints/SQL and existing closure/startup fixtures, without a new injection harness. */
import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { controlDataDirectory, operationPath, writePhaseArtifact } from "../src/artifacts.ts";
import { createCheckpoint } from "../src/checkpoint.ts";
import { copyClosedProjectBytes } from "../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../src/closed-file-sql.ts";
import { abandonClosedSymbolBeforeNavigation, inspectClosedSymbolAbandonment } from "../src/closed-symbol-abandonment.ts";
import { abandonClosedSymbolBaselineBeforeNavigation, inspectClosedSymbolBaselineAbandonment } from "../src/closed-symbol-baseline-abandonment.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { AppendInput, ClosedJournal, ClosedSymbolPlan, Generation, LaunchGeneration } from "../src/closed-symbol-journal.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "../src/closed-symbol-native-profile.ts";
import { buildStartupProgram } from "../src/closed-symbol-startup-program.ts";
import { VALIDATION_ACTION_ID, claimClosedSymbolValidationTarget } from "../src/closed-symbol-target-claim.ts";
import { newOperationId, sha256Json, sha256Text } from "../src/core.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { mintSyntheticClosedSessionProof } from "./helpers/windows-closed-session-fixture.ts";
import { startupFixture } from "./helpers/closed-symbol-startup-browser-fixture.ts";

const digest = "a".repeat(64);
const message = 'Tool "easyeda_execute" can mutate design state and requires confirmWrite=true.';
const rejection = { isError: true, structuredContent: { errorCode: "ERR_CONFIRM_WRITE_REQUIRED", message,
  details: { toolName: "easyeda_execute", toolGroup: "diagnostics", risk: "high" } },
  content: [{ type: "text", text: `[ERR_CONFIRM_WRITE_REQUIRED] ${message}` }] };

function phaseInput(journal: ClosedJournal): AppendInput {
  const step = STEPS[Math.floor(journal.sequence / 2)]; assert.ok(step);
  const kind = journal.sequence % 2 === 0 ? "intent" : "result";
  const ordinal = step.startsWith("baseline-") ? 0 : 1;
  const jobId = String(ordinal + 1).repeat(32);
  const launch: LaunchGeneration = { ordinal, helperInstance: "a".repeat(32), jobId, rootPid: ordinal + 100,
    rootStartIdentity: `win32:13436257345960252${String(ordinal)}:job:${jobId}` };
  const full: Generation = { ...launch, runtimeSha256: digest, sessionSha256: digest, captureSha256: digest };
  let generation: LaunchGeneration | Generation | null = full;
  if (step.endsWith("-launch")) { generation = kind === "intent" ? null : launch; }
  else if (step.endsWith("-admission") && kind === "intent") { generation = launch; }
  const launchReceipt = { jobId, helperInstance: launch.helperInstance, root: { pid: launch.rootPid, role: "easyeda-main", startIdentity: launch.rootStartIdentity } };
  return { step, kind, generation, requestSha256: sha256Json({ step }),
    data: step.endsWith("-launch") && kind === "result" ? { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) } : { syntheticOnly: true } };
}

async function fixture(rawReturn: unknown = rejection, baseline = false, successfulRead = false): Promise<{ journal: ClosedJournal; source: string; claimPath: string }> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "abandonment-")), source = join(directory, "synthetic.eprj2");
  const database = new DatabaseSync(source);
  try { database.exec("CREATE TABLE t(value TEXT); INSERT INTO t(rowid,value) VALUES(55,'synthetic baseline')"); }
  finally { database.close(); }
  await chmod(source, 0o600);
  const operationId = newOperationId(), project = "b".repeat(64), target = sha256Text(operationId).slice(0, 16);
  const metadata = { name: "Synthetic symbol", description: "No native CAD call" };
  let startup: ReturnType<typeof startupFixture> | undefined;
  if (baseline) { startup = startupFixture(); }
  else if (successfulRead) { startup = startupFixture("edit-marker-read"); }
  const plan: ClosedSymbolPlan = { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(16), projectPath: source, operation: { id: VALIDATION_ACTION_ID, action: "library.symbol.modify", libraryUuid: project,
      target: { uuid: target }, patch: metadata }, marker: startup?.input.marker ?? { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) },
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: digest, expectedFingerprintSha256: digest };
  const journal = await createClosedSymbolJournal(operationId, plan);
  const request = { action: "run-disposable-once", target: { projectPath: source, projectUuid: project, branchUuid: plan.branchUuid,
    ownerUuid: plan.ownerUuid, symbolUuid: target, companionPcbUuid: plan.activeUuid }, metadata, confirmDisposableMetadataEdit: true };
  const claim = await claimClosedSymbolValidationTarget(request, plan);
  if (baseline && startup !== undefined) {
    while (journal.sequence < 4) { await appendClosedSymbolEvent(journal, phaseInput(journal)); }
    const startupRequest = { profile: "easyeda-pro-control.closed-symbol-startup-request.v1", input: startup.input,
      codeSha256: sha256Text(buildStartupProgram(startup.input)), directMainFrameOnly: true };
    await appendClosedSymbolEvent(journal, { ...phaseInput(journal), requestSha256: sha256Json(startupRequest), data: startupRequest });
    const returned: unknown = rawReturn === rejection ? { structuredContent: { ok: true, result: await startup.run() }, content: [] } : rawReturn;
    await appendClosedSymbolEvent(journal, { ...phaseInput(journal), requestSha256: sha256Json(startupRequest), data: { rawReturn: returned } });
    return { journal, source, claimPath: claim.artifact.path };
  }
  while (journal.sequence < 8) { await appendClosedSymbolEvent(journal, phaseInput(journal)); }
  const checkpointDirectory = join(controlDataDirectory(), "checkpoints");
  await mkdir(checkpointDirectory, { recursive: true, mode: 0o700 });
  const checkpoint = await createCheckpoint({ source, outputDir: checkpointDirectory, label: `abandon-${operationId.slice(-8)}` });
  await appendClosedSymbolEvent(journal, { ...phaseInput(journal), data: { checkpoint } });
  const { proof } = await mintSyntheticClosedSessionProof();
  const copy = await copyClosedProjectBytes({ source, expectedSourceSha256: checkpoint.sourceSha256,
    artifactDirectory: operationPath(operationId).slice(0, -5), closureProof: proof });
  const inventory = await readClosedCopySqlInventory({ copy, runtime: await syntheticSqlRuntime() });
  await appendClosedSymbolEvent(journal, { ...phaseInput(journal), data: { copyReceipt: copy, sqlDigests: {
    checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 } } });
  while (journal.sequence < 14) { await appendClosedSymbolEvent(journal, phaseInput(journal)); }
  const input = { phase: "edit-marker-read" as const, projectUuid: project, branchUuid: plan.branchUuid, ownerUuid: plan.ownerUuid, marker: plan.marker };
  const startupRequest = { profile: "easyeda-pro-control.closed-symbol-startup-request.v1", input,
    codeSha256: sha256Text(buildStartupProgram(input)), directMainFrameOnly: true };
  await appendClosedSymbolEvent(journal, { ...phaseInput(journal), requestSha256: sha256Json(startupRequest), data: startupRequest });
  const returned: unknown = successfulRead && startup !== undefined
    ? { structuredContent: { ok: true, result: await startup.run() }, content: [] } : rawReturn;
  await appendClosedSymbolEvent(journal, { ...phaseInput(journal), requestSha256: sha256Json(startupRequest), data: { rawReturn: returned } });
  return { journal, source, claimPath: claim.artifact.path };
}
function retainedBytes(value: Awaited<ReturnType<typeof fixture>>): Promise<Buffer[]> {
  return Promise.all([value.journal.journalPath, value.claimPath, ...value.journal.artifacts.map(item => item.path)].map(path => readFile(path)));
}

void test("absent sidecar requires no journal or SQL fixture", async () => {
  assert.equal(await inspectClosedSymbolAbandonment("easyeda-absent-abandonment-0001"), undefined);
});

void test("abandonment preserves the claim and all journal bytes, and later inspection never rereads source", async () => {
  const value = await fixture();
  const before = await retainedBytes(value);
  const result = await abandonClosedSymbolBeforeNavigation(value.journal.operationId);
  assert.equal(result.classification, "historical-abandonment-verified");
  for (const key of ["completionProved", "executionAuthorized", "authorityRestored", "replayAllowed", "saved", "reopened"] as const) {
    assert.equal(result[key], false);
  }
  assert.deepEqual(await retainedBytes(value), before);
  await rename(value.source, `${value.source}.retained`);
  assert.deepEqual(await inspectClosedSymbolAbandonment(value.journal.operationId), result);
  assert.deepEqual(await abandonClosedSymbolBeforeNavigation(value.journal.operationId), result);
  assert.deepEqual(await retainedBytes(value), before);
});

void test("an ordinary handler failure cannot qualify as a pre-handler rejection", async () => {
  const value = await fixture({ isError: true, content: [{ type: "text", text: "A handler failed after execution." }] });
  const before = await retainedBytes(value);
  await assert.rejects(abandonClosedSymbolBeforeNavigation(value.journal.operationId), /pre-handler rejection/u);
  assert.equal(await inspectClosedSymbolAbandonment(value.journal.operationId), undefined);
  assert.deepEqual(await retainedBytes(value), before);
});

void test("a successful fixed marker read permits only unchanged-source historical abandonment", async () => {
  const value = await fixture(undefined, false, true);
  const before = await retainedBytes(value);
  const result = await abandonClosedSymbolBeforeNavigation(value.journal.operationId);
  assert.equal(result.classification, "historical-abandonment-verified");
  assert.equal(result.completionProved, false); assert.equal(result.replayAllowed, false);
  assert.equal(result.authorityRestored, false); assert.equal(result.executionAuthorized, false);
  assert.deepEqual(await retainedBytes(value), before);
  assert.deepEqual(await inspectClosedSymbolAbandonment(value.journal.operationId), result);
  const incomplete = await fixture({ structuredContent: { ok: true, result: { ok: true } }, content: [] });
  await assert.rejects(abandonClosedSymbolBeforeNavigation(incomplete.journal.operationId));
  assert.equal(await inspectClosedSymbolAbandonment(incomplete.journal.operationId), undefined);
  const later = await fixture(undefined, false, true);
  await writePhaseArtifact(later.journal.operationId, 17, "edit-open-intent", { syntheticUnacknowledgedIntent: true });
  await assert.rejects(abandonClosedSymbolBeforeNavigation(later.journal.operationId), /Unreferenced next phase/u);
});

void test("unreferenced later navigation evidence prevents historical abandonment", async () => {
  const value = await fixture();
  await writePhaseArtifact(value.journal.operationId, 17, "edit-open-intent", { syntheticUnacknowledgedIntent: true });
  const before = await retainedBytes(value);
  await assert.rejects(abandonClosedSymbolBeforeNavigation(value.journal.operationId), /Unreferenced next phase/u);
  assert.deepEqual(await retainedBytes(value), before);
});

void test("changed current SQL refuses publication, and changed retained phase refuses later qualification", async () => {
  const changed = await fixture();
  const before = await retainedBytes(changed);
  const database = new DatabaseSync(changed.source);
  try { database.exec("UPDATE t SET value='changed'"); } finally { database.close(); }
  await assert.rejects(abandonClosedSymbolBeforeNavigation(changed.journal.operationId));
  assert.equal(await inspectClosedSymbolAbandonment(changed.journal.operationId), undefined);
  assert.deepEqual(await retainedBytes(changed), before);
  const value = await fixture();
  await abandonClosedSymbolBeforeNavigation(value.journal.operationId);
  const phase = value.journal.artifacts[15]; assert.ok(phase);
  await writeFile(phase.path, "changed retained phase\n");
  await assert.rejects(inspectClosedSymbolAbandonment(value.journal.operationId));
});

void test("six-event baseline abandonment preserves evidence and grants no closure, source or replay proof", async () => {
  const value = await fixture(undefined, true);
  const before = await retainedBytes(value);
  await assert.rejects(abandonClosedSymbolBeforeNavigation(value.journal.operationId), /exact unquarantined validation prefix/u);
  const result = await abandonClosedSymbolBaselineBeforeNavigation(value.journal.operationId);
  assert.equal(result.boundary, "baseline-startup-observed");
  assert.equal(result.classification, "historical-abandonment-verified");
  for (const key of ["processClosureProved", "sourceInvarianceProved", "completionProved", "executionAuthorized", "authorityRestored", "replayAllowed", "saved", "reopened"] as const) {
    assert.equal(result[key], false);
  }
  assert.deepEqual(await retainedBytes(value), before);
  await rename(value.source, `${value.source}.retained`);
  assert.deepEqual(await inspectClosedSymbolBaselineAbandonment(value.journal.operationId), result);
  assert.deepEqual(await abandonClosedSymbolBaselineBeforeNavigation(value.journal.operationId), result);
  assert.deepEqual(await retainedBytes(value), before);
  const phase = value.journal.artifacts[5]; assert.ok(phase);
  await writeFile(phase.path, "changed retained startup\n");
  await assert.rejects(inspectClosedSymbolBaselineAbandonment(value.journal.operationId));
});

void test("baseline abandonment rejects a mere success flag and any later close intent", async () => {
  const malformed = await fixture({ structuredContent: { ok: true }, content: [] }, true);
  await assert.rejects(abandonClosedSymbolBaselineBeforeNavigation(malformed.journal.operationId));
  assert.equal(await inspectClosedSymbolBaselineAbandonment(malformed.journal.operationId), undefined);
  const later = await fixture(undefined, true);
  const before = await retainedBytes(later);
  await writePhaseArtifact(later.journal.operationId, 7, "baseline-close-intent", { syntheticUnacknowledgedIntent: true });
  await assert.rejects(abandonClosedSymbolBaselineBeforeNavigation(later.journal.operationId), /Unreferenced next phase/u);
  assert.equal(await inspectClosedSymbolBaselineAbandonment(later.journal.operationId), undefined);
  assert.deepEqual(await retainedBytes(later), before);
  const diagnostic = await fixture(undefined, true), generation = phaseInput(diagnostic.journal).generation;
  assert.ok(generation !== null);
  const window = await writePhaseArtifact(diagnostic.journal.operationId, 0, "baseline-owned-window", {
    profile: "private.closed-symbol-owned-window.v1", generation, observed: {
      schema: "easyeda-pro-control.windows-native-ui.v1", action: "windows", authority: "retained-job",
      binding: { rootPid: generation.rootPid, rootStartTicks: generation.rootStartIdentity.split(":")[1],
        executable: "C:\\Synthetic\\EasyEDA.exe", executableSha256: digest }, result: { mainWindowHandle: "1", windows: [] },
    },
  });
  const windowBytes = await readFile(window.path);
  await abandonClosedSymbolBaselineBeforeNavigation(diagnostic.journal.operationId);
  assert.deepEqual(await readFile(window.path), windowBytes);
  await writeFile(window.path, "changed diagnostic\n");
  await assert.rejects(inspectClosedSymbolBaselineAbandonment(diagnostic.journal.operationId));
});
