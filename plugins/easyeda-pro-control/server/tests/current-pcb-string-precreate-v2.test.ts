import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, currentPcbStringScopeCommand } from "../src/current-pcb-string-commands.ts";
import { CURRENT_PCB_STRING_PRECREATE_RESULT_BYTES, CURRENT_PCB_STRING_PRECREATE_SAMPLE_BYTES,
  CurrentPcbStringPrecreateRunner } from "../src/current-pcb-string-precreate-runner.ts";
import type { CurrentPcbStringObservationCommand, CurrentPcbStringPrecreateTransport } from "../src/current-pcb-string-precreate-runner.ts";
import { currentPcbStringPrecreateV2Fixture } from "./helpers/current-pcb-string-precreate-v2-fixture.ts";

function runner(transport: CurrentPcbStringPrecreateTransport): CurrentPcbStringPrecreateRunner {
  return new CurrentPcbStringPrecreateRunner(transport, "pcb", "original-context", "worker-context", {
    projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "d".repeat(16), windowTabId: "window_1",
  });
}
const phase = (command: CurrentPcbStringObservationCommand): string => "modelPhase" in command ? command.modelPhase : command.stringPhase;
const SWEEP = ["snapshot-v2", "pending-v2", "raw-strings", "root-inventory", "renderer-association", "worker-association",
  "empty-producers-v2", "producer-markers-v2"];
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function object(value: unknown): Record<string, unknown> {
  assert.ok(isObject(value)); return value;
}

void test("precreate v2 retains unavailable owners through two eight-leaf sweeps without granting empty-board authority", async () => {
  const commands: CurrentPcbStringObservationCommand[] = [], fixture = currentPcbStringPrecreateV2Fixture();
  let observations = 0;
  const selected = runner({ assertCurrent: (): void => {
    // Synthetic retained owner.
  },
    observeCurrent: (): Promise<void> => { observations += 1; return Promise.resolve(); },
    request: (command): Promise<unknown> => {
      assert.ok(Object.isFrozen(command)); assert.ok(Object.isFrozen(command.params));
      commands.push(command); return Promise.resolve(fixture.reply(command));
    } });
  const result = await selected.observe();
  const first = object(result["first"]), lazy = object(first["lazyBaseline"]);
  assert.equal(result["schema"], "easyeda-pro-control.pcb-string-precreate-observation.v2");
  assert.deepEqual(result["first"], result["second"]); assert.equal(result["matchingSamples"], true);
  assert.deepEqual(object(first["compilerState"])["dynamicCopper"], { manager: "null", state: null });
  assert.deepEqual(object(first["emptyProducers"])["model"], { manager: "null", state: null });
  assert.equal(lazy["strictV1Comparison"], null); assert.equal(lazy["observedConditionsSatisfied"], false);
  assert.ok(Array.isArray(lazy["unmetConditions"]));
  assert.ok(lazy["unmetConditions"].includes("strict-v1.owner-profile-available"));
  assert.ok(lazy["unmetConditions"].includes("ratline.model-owner-observed"));
  for (const field of ["managerAbsenceImpliesEmpty", "emptyRootPcbVerified", "queueCompletionVerified", "saveAuthorized", "writerSupported", "executionAuthorized"]) {
    assert.equal(lazy[field], false);
  }
  assert.equal(result["executionAuthorized"], false); assert.equal(result["projectWorkerAssociationVerified"], false);
  assert.equal(fixture.untouched(), true); assert.equal(observations, 4); assert.equal(commands.length, 66);
  assert.deepEqual(commands.slice(49).map(command => phase(command)), [...SWEEP, ...SWEEP, "release"]);
  assert.equal(commands.filter(command => phase(command) === "release").length, 1);
  // The shared ceiling includes bounded common packets; this V2 leaf still uses 66 requests.
  assert.equal(CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, 215 + 4 + 15 + 3 * (512 * 2 + 1));
  assert.equal(CURRENT_PCB_STRING_PRECREATE_SAMPLE_BYTES, 208 * 1024);
  assert.equal(CURRENT_PCB_STRING_PRECREATE_RESULT_BYTES, 424 * 1024);
  await assert.rejects(selected.observe(), /PRECREATE_OBSERVATION/u); assert.equal(commands.length, 66);
});

void test("precreate v2 refuses a malformed final marker and releases once without retrying", async () => {
  const fixture = currentPcbStringPrecreateV2Fixture(), phases: string[] = []; let markerCount = 0;
  const selected = runner({ assertCurrent: (): void => {
    // Synthetic retained owner.
  }, observeCurrent: (): Promise<void> => Promise.resolve(),
    request: (command): Promise<unknown> => {
      phases.push(phase(command));
      if (phase(command) === "producer-markers-v2") {
        markerCount += 1;
        if (markerCount === 2) { return Promise.resolve({ result: { type: "undefined" }, exceptionDetails: {} }); }
      }
      return Promise.resolve(fixture.reply(command));
    } });
  await assert.rejects(selected.observe(), /PRECREATE_OBSERVATION_FAILED_PRODUCER_MARKERS_V2/u);
  assert.deepEqual(phases.slice(49), [...SWEEP, ...SWEEP, "release"]);
  assert.equal(phases.filter(value => value === "release").length, 1); assert.equal(fixture.untouched(), true);
});

void test("precreate v2 cannot publish a successful observation after its original owner changes at release", async () => {
  const fixture = currentPcbStringPrecreateV2Fixture(); let current = true, releases = 0;
  const selected = runner({ assertCurrent: (): void => { if (!current) { throw new Error("Private replacement details."); } },
    observeCurrent: (): Promise<void> => Promise.resolve(), request: (command): Promise<unknown> => {
      const reply = fixture.reply(command);
      if (phase(command) === "release") { current = false; releases += 1; }
      return Promise.resolve(reply);
    } });
  await assert.rejects(selected.observe(), /PRECREATE_OBSERVATION_FAILED_OWNER_FINAL/u);
  assert.equal(releases, 1); assert.equal(fixture.untouched(), true);
});

void test("precreate v2 fixed command builders retain exact argument shapes and reject invalid handles", () => {
  for (const selected of ["empty-producers-v2", "producer-markers-v2"] as const) {
    const command = currentPcbStringScopeCommand(selected, "scope", "callback", "constructors");
    assert.equal(command.stringPhase, selected); assert.equal(command.method, "Runtime.callFunctionOn");
    if (command.method !== "Runtime.callFunctionOn") { assert.fail("Fixed call expected."); }
    assert.deepEqual(command.params.arguments, [{ objectId: "callback" }, { objectId: "constructors" }]);
    assert.equal(command.params.throwOnSideEffect, true); assert.equal(command.params.awaitPromise, false);
    assert.ok(Object.isFrozen(command.params.arguments));
    assert.throws(() => currentPcbStringScopeCommand(selected, "scope", "callback", "invalid handle"), /HANDLE/u);
  }
});
