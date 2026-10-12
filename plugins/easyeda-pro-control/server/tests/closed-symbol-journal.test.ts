import assert from "node:assert/strict";
import fsPromises, { readFile, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { buildPlanHash, isRecord, newOperationId, sha256Json } from "../src/core.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal, inspectClosedSymbolRestart, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { AppendInput, ClosedJournal, ClosedSymbolPlan, Generation, LaunchGeneration } from "../src/closed-symbol-journal.ts";

const digest = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
function plan(): ClosedSymbolPlan {
  return { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target, activeUuid: "f".repeat(32), projectPath: "/synthetic/not-opened.eprj2",
    operation: { id: "rename-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic Ω" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: digest, facadeSha256: digest, expectedFingerprintSha256: digest };
}
function generation(ordinal: number): Generation {
  const jobId = String(ordinal + 1).repeat(32);
  return { ordinal, helperInstance: "a".repeat(32), jobId, rootPid: ordinal + 100, rootStartIdentity: `win32:13436257345960252${String(ordinal)}:job:${jobId}`, runtimeSha256: sha256Json({ runtime: ordinal }), sessionSha256: sha256Json({ session: ordinal }), captureSha256: sha256Json({ capture: ordinal }) };
}
function launchGeneration(ordinal: number): LaunchGeneration {
  const full = generation(ordinal);
  return { ordinal, helperInstance: full.helperInstance, jobId: full.jobId, rootPid: full.rootPid, rootStartIdentity: full.rootStartIdentity };
}
function launchData(ordinal: number): Record<string, unknown> {
  const launch = launchGeneration(ordinal);
  const launchReceipt = { jobId: launch.jobId, helperInstance: launch.helperInstance, root: { pid: launch.rootPid, role: "easyeda-main", startIdentity: launch.rootStartIdentity } };
  return { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) };
}
function input(journal: ClosedJournal): AppendInput {
  const step = STEPS[Math.floor(journal.sequence / 2)]; assert.ok(step !== undefined);
  const kind = journal.sequence % 2 === 0 ? "intent" : "result";
  let ordinal = 2;
  if (step.startsWith("baseline-")) { ordinal = 0; }
  else if (step.startsWith("edit-")) { ordinal = 1; }
  let bound: Generation | LaunchGeneration | null = generation(ordinal);
  if (step.endsWith("-launch")) { bound = kind === "intent" ? null : launchGeneration(ordinal); }
  else if (step.endsWith("-admission") && kind === "intent") { bound = launchGeneration(ordinal); }
  return { step, kind, generation: bound, requestSha256: sha256Json({ step }),
    data: step.endsWith("-launch") && kind === "result" ? launchData(ordinal) : { syntheticOnly: true, note: "No dispatcher or native proof is invoked." } };
}
async function fixture(count = 0): Promise<ClosedJournal> {
  const journal = await createClosedSymbolJournal(newOperationId(), plan());
  for (let index = 0; index < count; index += 1) { await appendClosedSymbolEvent(journal, input(journal)); }
  return journal;
}
function bytes(journal: ClosedJournal): Promise<Buffer[]> { return Promise.all([journal.journalPath, ...journal.artifacts.map((entry) => entry.path)].map((path) => readFile(path))); }

void test("initial journal precedes the first launch and restores no authority", async () => {
  const journal = await fixture(); const before = await bytes(journal);
  assert.equal(Object.hasOwn(journal.plan, "initialGeneration"), false); assert.equal(Object.hasOwn(journal, "context"), false); assert.equal(Object.hasOwn(journal, "preCheckpoint"), false);
  const result = await inspectClosedSymbolRestart(journal.operationId);
  assert.equal(result["classification"], "planned"); assert.deepEqual(result["nextEvidencePhase"], { step: "baseline-launch", kind: "intent" });
  for (const name of ["executionAuthorized", "resumeAuthorized", "replayAllowed", "authorityRestored", "completionProved"]) { assert.equal(result[name], false); }
  assert.deepEqual(await bytes(journal), before);
});
void test("write intent durably retains possible mutation before dispatch and later phases never clear it", async () => {
  const journal = await fixture(20);
  assert.equal(journal.mutationMayHaveOccurred, false);
  await appendClosedSymbolEvent(journal, input(journal));
  assert.equal(journal.sequence, 21);
  assert.equal(journal.mutationMayHaveOccurred, true);
  const retained = await loadClosedSymbolJournal(journal.operationId);
  assert.equal(retained.journal.mutationMayHaveOccurred, true);
  while (journal.sequence < STEPS.length * 2) {
    await appendClosedSymbolEvent(journal, input(journal));
    assert.equal(journal.mutationMayHaveOccurred, true);
  }
  assert.equal(journal.saved, false); assert.equal(journal.reopened, false);
});
void test("a cleared possible-mutation marker after write intent refuses historical inspection", async () => {
  const journal = await fixture(21);
  journal.mutationMayHaveOccurred = false;
  await updateOperation(journal);
  await assert.rejects(loadClosedSymbolJournal(journal.operationId), /write intent lost its possible-mutation marker/u);
});
void test("conservative earlier mutation risk remains retained by the data recorder", async () => {
  const journal = await fixture();
  journal.mutationMayHaveOccurred = true;
  await updateOperation(journal);
  await appendClosedSymbolEvent(journal, input(journal));
  const retained = await loadClosedSymbolJournal(journal.operationId);
  assert.equal(retained.journal.mutationMayHaveOccurred, true);
});
void test("all forty-four fixed events remain historical data, not completed execution", async () => {
  const journal = await fixture(STEPS.length * 2); const before = await bytes(journal);
  assert.equal(journal.state, "closed-session-evidence-recorded"); assert.equal(journal.saved, false); assert.equal(journal.reopened, false);
  const loaded = await loadClosedSymbolJournal(journal.operationId), result = await inspectClosedSymbolRestart(journal.operationId);
  assert.equal(loaded.events.length, 44); assert.equal(result["classification"], "all-evidence-recorded"); assert.equal(result["nextEvidencePhase"], null); assert.equal(result["completionProved"], false);
  assert.deepEqual(await bytes(journal), before);
  await assert.rejects(appendClosedSymbolEvent(journal, { step: "baseline-launch", kind: "intent", generation: null, requestSha256: digest, data: {} }), /exhausted/u);
});
for (const count of [1, 2, 7, 12, 19, 20, 27, 39]) {
  void test(`restart inspection of prefix ${count} is byte-invariant and never grants replay`, async () => {
    const journal = await fixture(count); const before = await bytes(journal), result = await inspectClosedSymbolRestart(journal.operationId);
    assert.equal(result["classification"], count % 2 === 1 ? "intent-without-result" : "after-result"); assert.equal(result["replayAllowed"], false);
    assert.deepEqual(await bytes(journal), before);
  });
}
void test("out-of-order, result-without-intent and duplicate intent refuse without new bytes", async () => {
  const journal = await fixture(); const before = await bytes(journal);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), step: "edit-write" }), /order/u);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), kind: "result" }), /order/u);
  assert.deepEqual(await bytes(journal), before); const first = input(journal); await appendClosedSymbolEvent(journal, first);
  await assert.rejects(appendClosedSymbolEvent(journal, first), /order/u);
});
void test("result request binding cannot be substituted", async () => {
  const journal = await fixture(1); const before = await bytes(journal);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), requestSha256: digest }), /bind its intent/u); assert.deepEqual(await bytes(journal), before);
});
for (const bad of ["134362573459602520", `win32:134362573459602520:job:${"e".repeat(32)}`, `win32:1234:job:${"1".repeat(32)}`]) {
  void test(`actual native root start grammar refuses ${bad}`, async () => {
    const journal = await fixture(1);
    await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: { ...launchGeneration(0), rootStartIdentity: bad } }), /text refused|another Job/u);
  });
}
void test("launch intent cannot contain fabricated ownership and normal phase cannot drift", async () => {
  const journal = await fixture();
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: launchGeneration(0) }), /invent a generation/u);
  for (let index = 0; index < 4; index += 1) { await appendClosedSymbolEvent(journal, input(journal)); }
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: { ...generation(0), runtimeSha256: "f".repeat(64) } }), /generation drift/u);
});
void test("new generation cannot reuse the old Job even with a changed root PID", async () => {
  const journal = await fixture(11), old = generation(0);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: { ...launchGeneration(1), jobId: old.jobId, rootStartIdentity: old.rootStartIdentity } }), /reuses a generation/u);
});
void test("full family plan hash covers fields omitted by the legacy generic plan hash", async () => {
  const journal = await fixture(); const changed = structuredClone(journal);
  changed.plan.operation.patch.name = "Different intended title";
  assert.equal(buildPlanHash(changed.plan), journal.planHash); assert.notEqual(sha256Json(changed.plan), journal.closedPlanSha256);
  await updateOperation(changed);
  await assert.rejects(loadClosedSymbolJournal(journal.operationId), /plan binding differs/u);
});
void test("existing engine orphan fields survive settled result recording", async () => {
  const journal = await fixture(1);
  journal.orphanedCallPossible = true; journal.orphanedCallPhase = "synthetic-tracked-read"; journal.runtimeRestartChallenge = "synthetic-never-authority";
  await updateOperation(journal); await appendClosedSymbolEvent(journal, input(journal));
  const loaded = await loadOperation(journal.operationId);
  assert.equal(loaded["orphanedCallPossible"], true); assert.equal(loaded["runtimeRestartChallenge"], "synthetic-never-authority");
  const inspected = await inspectClosedSymbolRestart(journal.operationId); assert.equal(inspected["orphanedCallPossible"], true);
});
void test("stale and concurrent append attempts cannot publish another phase", async () => {
  const journal = await fixture(); const stale = structuredClone(journal); const first = input(journal);
  const running = appendClosedSymbolEvent(journal, first);
  await assert.rejects(appendClosedSymbolEvent(journal, first), /already running/u); await running;
  await assert.rejects(appendClosedSymbolEvent(stale, first), /predecessor is stale/u);
});
void test("dangling exclusive artifact stops append and restart classification without adoption", async () => {
  const journal = await fixture(); const before = await readFile(journal.journalPath);
  const artifact = await writePhaseArtifact(journal.operationId, 1, "baseline-launch-intent", { syntheticDanglingArtifact: true });
  await assert.rejects(inspectClosedSymbolRestart(journal.operationId), /Unreferenced/u);
  await assert.rejects(appendClosedSymbolEvent(journal, input(journal)), /Unreferenced/u);
  assert.deepEqual(await readFile(journal.journalPath), before); const retained = await readFile(artifact.path); assert.ok(retained.length > 0);
});
void test("corrupted managed phase fails hash verification and is not rewritten", async () => {
  const journal = await fixture(1); const artifact = journal.artifacts[0]; assert.ok(artifact);
  await writeFile(artifact.path, "{}\n"); const before = await bytes(journal);
  await assert.rejects(inspectClosedSymbolRestart(journal.operationId), /hash verification/u); assert.deepEqual(await bytes(journal), before);
});
void test("an intact artifact with a substituted deterministic path refuses", async () => {
  const journal = await fixture(1), source = journal.artifacts[0]; assert.ok(source);
  const value: unknown = JSON.parse(await readFile(source.path, "utf8"));
  journal.artifacts[0] = await writePhaseArtifact(journal.operationId, 1, "wrong-phase", value); await updateOperation(journal);
  await assert.rejects(loadClosedSymbolJournal(journal.operationId), /descriptor refused/u);
});
for (const bad of [undefined, Number.NaN, -0, new Date(), new Map(), Array.from({ length: 4097 }, () => null), "x".repeat(48_001)]) {
  void test(`bounded data refuses ${Object.prototype.toString.call(bad)}/${typeof bad}`, async () => {
    const journal = await fixture(); await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), data: bad }), /Closed journal/u);
    assert.equal(journal.sequence, 0);
  });
}
void test("data getters/cycles are not serialized and Unicode/key bytes remain exact", async () => {
  const journal = await fixture(); let reads = 0;
  const getter = { get secret(): string { reads += 1; return "not read"; } };
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), data: getter }), /accessor/u); assert.equal(reads, 0);
  const cycle: Record<string, unknown> = {}; cycle["self"] = cycle;
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), data: cycle }), /non-JSON/u);
  const data: unknown = JSON.parse(String.raw`{"__proto__":{"nativeProof":true},"Ω":"é\u0000�"}`);
  await appendClosedSymbolEvent(journal, { ...input(journal), data });
  const loaded = await loadClosedSymbolJournal(journal.operationId);
  assert.equal(sha256Json(loaded.events[0]?.data), sha256Json(data)); const inspected = await inspectClosedSymbolRestart(journal.operationId); assert.equal(inspected["authorityRestored"], false);
});
for (const mutation of ["family", "fake-initial-owner", "wrong-target", "missing-fingerprint"] as const) {
  void test(`strict plan refuses ${mutation}`, async () => {
    const value: Record<string, unknown> = structuredClone(plan());
    if (mutation === "family") { value["profile"] = "legacy"; }
    if (mutation === "fake-initial-owner") { value["initialGeneration"] = generation(0); }
    if (mutation === "wrong-target") { value["targetUuid"] = "a".repeat(32); }
    if (mutation === "missing-fingerprint") { Reflect.deleteProperty(value, "expectedFingerprintSha256"); }
    await assert.rejects(createClosedSymbolJournal(newOperationId(), value));
  });
}
void test("append snapshots data and generation synchronously before its first await", async () => {
  const journal = await fixture(3);
  const data = { before: true };
  const capturedGeneration = { ...generation(0) };
  const value = { ...input(journal), generation: capturedGeneration, data };
  const running = appendClosedSymbolEvent(journal, value);
  data.before = false; capturedGeneration.rootPid = 900;
  value.requestSha256 = digest; value.kind = "intent";
  await running;
  const loaded = await loadClosedSymbolJournal(journal.operationId);
  const last = loaded.events.at(-1);
  assert.deepEqual(last?.data, { before: true }); assert.equal(last?.generation?.rootPid, 100);
  assert.equal(last?.kind, "result"); assert.notEqual(last?.requestSha256, digest);
});
void test("append refuses input accessors without invoking them and releases its reservation", async () => {
  const journal = await fixture(); let reads = 0;
  const value = { ...input(journal), get data(): unknown { reads += 1; return {}; } };
  await assert.rejects(appendClosedSymbolEvent(journal, value), /own data/u);
  assert.equal(reads, 0); await appendClosedSymbolEvent(journal, input(journal));
});
void test("cumulative string bytes refuse before a later accessor or deep value is visited", async () => {
  const journal = await fixture(); let reads = 0;
  const later = { get value(): unknown { reads += 1; return {}; } };
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), data: ["x".repeat(30_000), "y".repeat(18_001), later] }), /cumulative text byte bound/u);
  assert.equal(reads, 0); assert.equal(journal.sequence, 0);
});
void test("cumulative key bytes count before later malformed data", async () => {
  const journal = await fixture();
  const data: Record<string, unknown> = {};
  for (let index = 0; index < 97; index += 1) { data[`${String(index).padStart(3, "0")}${"k".repeat(497)}`] = ""; }
  data["laterUndefined"] = undefined;
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), data }), /cumulative text byte bound/u);
  assert.equal(journal.sequence, 0);
});
for (const field of ["operationId", "closedPlanSha256", "markerSha256", "sequence", "previousArtifactSha256", "generationOrdinal", "dataSha256", "extraField"] as const) {
  void test(`sealed synthetic event with substituted ${field} still fails family parsing`, async () => {
    const template = await fixture(1);
    const descriptor = template.artifacts[0]; assert.ok(descriptor);
    const journal = await fixture();
    const raw: unknown = JSON.parse(await readFile(descriptor.path, "utf8")); assert.ok(isRecord(raw));
    raw["operationId"] = journal.operationId;
    if (field === "operationId") { raw[field] = newOperationId(); }
    else if (field === "sequence") { raw[field] = 3; }
    else if (field === "generationOrdinal") { raw[field] = 1; }
    else { raw[field] = "f".repeat(64); }
    journal.artifacts[0] = await writePhaseArtifact(journal.operationId, 1, "baseline-launch-intent", raw);
    journal.sequence = 1;
    await updateOperation(journal);
    const before = await bytes(journal);
    await assert.rejects(inspectClosedSymbolRestart(journal.operationId), /Closed journal/u);
    assert.deepEqual(await bytes(journal), before);
  });
}
for (const boundary of ["artifact", "journal"] as const) {
  for (const mutation of ["saved", "operationId", "plan", "marker"] as const) {
    void test(`mutable journal ${mutation} during ${boundary} publication cannot poison the sealed successor`, async (context) => {
      const journal = await fixture(), peer = await fixture();
      const originalId = journal.operationId, originalPath = journal.journalPath;
      const before = await readFile(originalPath), peerBefore = await readFile(peer.journalPath);
      const method = boundary === "artifact" ? "link" : "rename";
      const original = fsPromises[method];
      const expectedName = boundary === "artifact" ? "01-baseline-launch-intent.json" : `${originalId}.json`;
      let injected = false;
      const spy = context.mock.method(fsPromises, method, async (...args: Parameters<typeof original>): Promise<void> => {
        await original(args[0], args[1]);
        if (!injected && basename(String(args[1])) === expectedName) {
          injected = true;
          if (mutation === "saved") { journal.saved = true; }
          else if (mutation === "operationId") { journal.operationId = peer.operationId; }
          else if (mutation === "plan") { journal.plan.operation.patch.name = "Mutated during publication"; }
          else { journal.markerSha256 = "f".repeat(64); }
        }
      });
      syncBuiltinESMExports();
      try { await assert.rejects(appendClosedSymbolEvent(journal, input(journal)), /changed while append/u); }
      finally { spy.mock.restore(); syncBuiltinESMExports(); }
      assert.equal(injected, true); assert.deepEqual(await readFile(peer.journalPath), peerBefore);
      if (boundary === "artifact") {
        assert.deepEqual(await readFile(originalPath), before);
        await assert.rejects(loadClosedSymbolJournal(originalId), /Unreferenced/u);
      } else {
        const retained = await loadClosedSymbolJournal(originalId);
        assert.equal(retained.journal.sequence, 1); assert.equal(retained.journal.saved, false);
        assert.equal(retained.journal.plan.operation.patch.name, "Synthetic Ω");
        assert.equal(retained.journal.markerSha256, sha256Json(plan().marker));
      }
      if (mutation === "saved") { assert.equal(journal.saved, true); }
      if (mutation === "operationId") { assert.equal(journal.operationId, peer.operationId); }
      if (mutation === "plan") { assert.equal(journal.plan.operation.patch.name, "Mutated during publication"); }
      if (mutation === "marker") { assert.equal(journal.markerSha256, "f".repeat(64)); }
    });
  }
}
for (const count of [2, 3, 12, 13, 30, 31]) {
  void test(`launch acknowledgment remains inspectable without admission at prefix ${count}`, async () => {
    const journal = await fixture(count);
    const before = await bytes(journal);
    const loaded = await loadClosedSymbolJournal(journal.operationId), result = await inspectClosedSymbolRestart(journal.operationId);
    const last = loaded.events.at(-1); assert.ok(last?.generation);
    assert.equal(Object.hasOwn(last.generation, "runtimeSha256"), false);
    assert.equal(Object.hasOwn(last.generation, "sessionSha256"), false);
    assert.equal(Object.hasOwn(last.generation, "captureSha256"), false);
    assert.equal(result["classification"], count % 2 === 0 ? "after-result" : "intent-without-result");
    assert.equal(result["authorityRestored"], false); assert.equal(result["replayAllowed"], false);
    assert.deepEqual(await bytes(journal), before);
  });
}
for (const mutation of ["missing-receipt", "extra-envelope", "hash", "role", "root-extra", "job", "helper", "pid", "start"] as const) {
  void test(`native launch receipt binding refuses ${mutation} before recording admission`, async () => {
    const journal = await fixture(1);
    const before = await bytes(journal);
    const data = launchData(0), receipt = data["launchReceipt"]; assert.ok(isRecord(receipt));
    const root = receipt["root"]; assert.ok(isRecord(root));
    if (mutation === "missing-receipt") { Reflect.deleteProperty(data, "launchReceipt"); }
    else if (mutation === "extra-envelope") { data["runtimeAdmitted"] = true; }
    else if (mutation === "role") { root["role"] = "renderer"; }
    else if (mutation === "root-extra") { root["admitted"] = true; }
    else if (mutation === "job") { receipt["jobId"] = "e".repeat(32); }
    else if (mutation === "helper") { receipt["helperInstance"] = "e".repeat(32); }
    else if (mutation === "pid") { root["pid"] = 987; }
    else if (mutation === "start") { root["startIdentity"] = `win32:134362573459602521:job:${"1".repeat(32)}`; }
    data["launchReceiptSha256"] = mutation === "hash" ? "f".repeat(64) : sha256Json(receipt);
    await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), data }), /Closed journal/u);
    assert.deepEqual(await bytes(journal), before);
  });
}
void test("launch and admission intent cannot claim prematurely captured full generation", async () => {
  const launch = await fixture(1);
  const admission = await fixture(2);
  for (const journal of [launch, admission]) {
    const before = await bytes(journal);
    await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: generation(0) }), /exact object/u);
    assert.deepEqual(await bytes(journal), before);
  }
});
void test("admission result requires all digests and cannot change the retained native launch", async () => {
  const journal = await fixture(3);
  const before = await bytes(journal);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: launchGeneration(0) }), /exact object/u);
  for (const change of [{ rootPid: 901 }, { helperInstance: "b".repeat(32) }, { rootStartIdentity: `win32:134362573459602521:job:${"1".repeat(32)}` }]) {
    await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: { ...generation(0), ...change } }), /admission differs/u);
  }
  assert.deepEqual(await bytes(journal), before);
});
void test("post-admission phases require the established full generation", async () => {
  const journal = await fixture(4);
  const before = await bytes(journal);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: launchGeneration(0) }), /exact object/u);
  await assert.rejects(appendClosedSymbolEvent(journal, { ...input(journal), generation: { ...generation(0), captureSha256: "f".repeat(64) } }), /generation drift/u);
  assert.deepEqual(await bytes(journal), before);
});
