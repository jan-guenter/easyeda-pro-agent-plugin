import assert from "node:assert/strict";
import { after, test } from "node:test";
import fsPromises, { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { loadOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { sha256Text } from "../src/core.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Consumer imports follow the synthetic prerequisite hook; issuer modules stay unchanged.
const { assertOriginalClosedSymbolWitness } = await import("../src/closed-symbol-witness.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { witnessFixture } = await import("./helpers/closed-symbol-witness-fixture.ts");

void test("actual source-qualified collector retains the one result and exclusive clock artifact", async (context) => {
  const f = await witnessFixture(context), result = await f.stage.collect(f.input);
  assert.strictEqual(assertOriginalClosedSymbolWitness(result, f.engine, f.journal.operationId), result);
  assert.equal(result.completionProved, false); assert.equal(result.executionAuthorized, false);
  assert.equal(result.expectedActor.uuid, result.witness.actorUuid); assert.equal(Object.isFrozen(result.expectedActor), true);
  assert.equal(f.state.witnessCalls, 1); assert.strictEqual(f.stage.originalReturn(f.journal.operationId), f.state.returned);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  assert.equal(loaded.events.at(-1)?.step, "edit-witness"); assert.equal(loaded.events.at(-1)?.kind, "result");
  assert.equal(loaded.journal.orphanedCallPossible, false); assert.equal(result.artifactSha256, loaded.journal.artifacts.at(-1)?.sha256);
  assert.equal(sha256Text(await readFile(result.clockArtifact.path, "utf8")), result.clockArtifactSha256);
  assert.throws(() => assertOriginalClosedSymbolWitness(structuredClone(result), f.engine, f.journal.operationId), /not issued/u);
  await assert.rejects(f.stage.collect(f.input), /already consumed/u);
});

for (const change of ["actor", "worker-time", "renderer-time", "offset", "scope", "session", "caller-id", "caller-saved", "uncertain"] as const) {
  void test(`settled witness ${change} refuses issuance and cannot replay`, async (context) => {
    const f = await witnessFixture(context), operationId = f.journal.operationId;
    f.state.afterWitness = (value): void => {
      if (change === "actor") { value["cachedActor"] = { uuid: "8".repeat(32), username: "other", nickname: "other" }; }
      if (change === "worker-time") { value["workerTimeAfterMs"] = Number(value["workerTimeAfterMs"]) + 300_000; }
      if (change === "renderer-time") { value["rendererClockAfterMs"] = Number(value["rendererClockAfterMs"]) + 300_000; }
      if (change === "offset") { value["rendererTimezoneOffsetMinutes"] = 0; }
      if (change === "scope") { f.state.scope = false; }
      if (change === "session") { f.state.sequence += 1; }
      if (change === "caller-id") { f.journal.operationId = "easyeda-20261012t000000z-12345678"; }
      if (change === "caller-saved") { f.journal.saved = true; }
    };
    f.state.failWitness = change === "uncertain";
    await assert.rejects(f.stage.collect(f.input)); assert.equal(f.state.witnessCalls, 1);
    assert.throws(() => assertOriginalClosedSymbolWitness(f.stage.originalReturn(operationId), f.engine, operationId), /not issued|missing/u);
    if (change !== "uncertain") { assert.strictEqual(f.stage.originalReturn(operationId), f.state.returned); }
    const loaded = await loadClosedSymbolJournal(operationId);
    assert.equal(loaded.events.at(-1)?.kind, change === "uncertain" ? "intent" : "result");
    // Original operation attempt remains spent even if the caller changed ID.
    Object.assign(f.journal, loaded.journal);
    await assert.rejects(f.stage.collect(f.input), /already consumed/u);
    assert.equal(f.state.witnessCalls, 1);
  });
}
for (const change of ["copy", "inventory", "clock-unavailable", "missing-issuer", "launch-clone"] as const) {
  void test(`predispatch ${change} cannot issue a witness`, async (context) => {
    const f = await witnessFixture(context);
    let input = f.input;
    if (change === "copy") { input = { ...input, baselineCopy: structuredClone(input.baselineCopy) }; }
    if (change === "inventory") { input = { ...input, baselineInventory: structuredClone(input.baselineInventory) }; }
    if (change === "clock-unavailable") { f.owner.behavior.clockMode = "unavailable"; }
    if (change === "missing-issuer") { Object.defineProperty(f.runtime, "clockObservationForLaunch", { value: undefined }); }
    if (change === "launch-clone") {
      const original = f.relaunch.originalLaunch(f.journal.operationId, "edit-launch"); assert.ok(original !== undefined);
      context.mock.method(f.relaunch, "originalLaunch", () => structuredClone(original));
    }
    await assert.rejects(f.stage.collect(input)); assert.equal(f.state.witnessCalls, 0);
    assert.equal(f.stage.originalReturn(f.journal.operationId), undefined);
  });
}
for (const boundary of ["raw-artifact", "raw-journal-before", "raw-journal-after", "aux-missing", "aux-partial", "aux-unreferenced", "aux-duplicate"] as const) {
  void test(`publication ${boundary} retains observations but never an issued witness`, async (context) => {
    const f = await witnessFixture(context), operationId = f.journal.operationId;
    if (boundary === "aux-duplicate") { await writePhaseArtifact(operationId, 20, "edit-witness-clock-qualification", { prior: "must not overwrite" }); }
    const link = fsPromises.link, rename = fsPromises.rename; let rawPublished = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      const name = basename(String(args[1]));
      if (name === "20-edit-witness-result.json") { rawPublished = true; if (boundary === "raw-artifact") { throw new Error("synthetic raw publication failure"); } }
      if (name === "20-edit-witness-clock-qualification.json" && boundary === "aux-missing") { throw new Error("synthetic auxiliary publication failure"); }
      await link(...args);
      if (name === "20-edit-witness-clock-qualification.json" && boundary === "aux-partial") { await fsPromises.writeFile(args[1], "{", { mode: 0o600 }); }
      if (name === "20-edit-witness-clock-qualification.json" && boundary === "aux-unreferenced") { throw new Error("synthetic after auxiliary publication failure"); }
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
      const selected = rawPublished && basename(String(args[1])) === `${operationId}.json`;
      if (selected && boundary === "raw-journal-before") { throw new Error("synthetic journal publication failure"); }
      await rename(...args);
      if (selected && boundary === "raw-journal-after") { throw new Error("synthetic journal acknowledgement failure"); }
    }); syncBuiltinESMExports();
    await assert.rejects(f.stage.collect(f.input));
    assert.equal(f.state.witnessCalls, 1); assert.strictEqual(f.stage.originalReturn(operationId), f.state.returned);
    assert.throws(() => assertOriginalClosedSymbolWitness(f.state.returned, f.engine, operationId), /not issued/u);
    const durable = await loadOperation(operationId); assert.equal(durable["saved"], false);
    await assert.rejects(f.stage.collect(f.input), /already consumed/u);
    assert.equal(f.state.witnessCalls, 1);
    context.mock.restoreAll(); syncBuiltinESMExports();
  });
}
void test("valid concurrent journal append after settled result refuses stale issuance", async (context) => {
  const f = await witnessFixture(context); let advanced = false;
  f.state.afterRuntime = async (): Promise<void> => {
    if (advanced || f.state.witnessCalls === 0) { return; }
    const loaded = await loadClosedSymbolJournal(f.journal.operationId);
    const last = loaded.events.at(-1);
    if (last?.kind !== "result" || last.step !== "edit-witness") { return; }
    advanced = true;
    await appendClosedSymbolEvent(loaded.journal, { step: "edit-write", kind: "intent", generation: last.generation,
      requestSha256: "a".repeat(64), data: { syntheticConcurrentWriter: true } });
  };
  await assert.rejects(f.stage.collect(f.input), /durable journal advanced/u);
  assert.equal(advanced, true); assert.equal(f.state.witnessCalls, 1);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.events.at(-1)?.step, "edit-write");
  assert.equal(f.journal.sequence, 18); assert.equal(loaded.journal.sequence, 21);
});
void test("capture release failure preserves raw and auxiliary observations and consumes each cleanup once", async (context) => {
  const f = await witnessFixture(context), previous = f.owner.behavior.mutateResponse; let stopped = false;
  f.owner.behavior.mutateResponse = (request, response): void => {
    previous?.(request, response);
    if (request["action"] === "release-capture" && f.state.witnessCalls === 1 && !stopped) {
      const raw = f.stage.originalReturn(f.journal.operationId);
      if (raw !== undefined && f.stage.originalClockCapture(f.journal.operationId, "after") !== undefined) { stopped = true; response["released"] = false; }
    }
  };
  await assert.rejects(f.stage.collect(f.input)); assert.equal(stopped, true); assert.equal(f.state.witnessCalls, 1);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.events.at(-1)?.kind, "result");
  assert.strictEqual(f.stage.originalReturn(f.journal.operationId), f.state.returned);
  const requests = f.owner.requests.filter((request) => request["action"] === "release-capture");
  const bindings = requests.map((request) => request["captureBindingSha256"]); assert.equal(new Set(bindings).size, bindings.length);
});
