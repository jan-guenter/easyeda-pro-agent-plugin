/** Public phase composition with actual schemas and source, synthetic original
 * lifecycle boundaries only. No native ownership, CAD or filesystem mutation.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { performance } from "node:perf_hooks";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { CURRENT_SCHEMATIC_RENAME_OPERATION_PURPOSE, currentSchematicRenameOperationRequestSchema, queryCurrentSchematicRenameOperation,
  validateCurrentSchematicRenameOperationArguments } from "../src/current-schematic-rename-operation.ts";

type Value = Record<string, unknown>;
const ID = "synthetic-schematic-rename", OPENING = "synthetic-schematic-opening";
const TARGET = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), schematicUuid: "d".repeat(16) };
const BEGIN = { action: "baseline-begin", operationId: ID, openingOperationId: OPENING, target: TARGET,
  desiredTitle: "Renamed SCH", confirmDisposableProject: true, acceptSchematicRename: true };
function object(value: unknown): Value { assert.ok(isRecord(value)); return value; }
async function fixture(): Promise<{
  calls: string[]; run: (request: unknown) => Promise<Value>; inspect: () => Value;
  state: { failure: string | undefined; returnedFailure: boolean; pendingAuthentication: boolean; pendingTermination: boolean;
    invariant: boolean; metadata: boolean; childRoster: boolean; cleanupGate: Promise<unknown> | undefined;
    beginGate: Promise<unknown> | undefined;
    cleanupStarted: (() => void) | undefined;
    scratchGate: Promise<unknown> | undefined; scratchStarted: (() => void) | undefined };
}> {
  const calls: string[] = [], state = { failure: undefined as string | undefined, returnedFailure: false,
    pendingAuthentication: false, pendingTermination: false, invariant: true, metadata: true, childRoster: true, cleanupGate: undefined as Promise<unknown> | undefined,
    beginGate: undefined as Promise<unknown> | undefined,
    cleanupStarted: undefined as (() => void) | undefined,
    scratchGate: undefined as Promise<unknown> | undefined, scratchStarted: undefined as (() => void) | undefined };
  const clock = Object.freeze({ original: "clock" }), continuation = Object.freeze({ operationId: ID, original: "continuation" });
  const generation = Object.freeze({ operationId: ID }), owner = Object.freeze({ operationId: ID }), reference = Object.freeze({ original: "reference" });
  const baselineValue = Object.freeze({ original: "baseline" }), proof = Object.freeze({ original: "proof" }), startup = Object.freeze({ original: "startup" });
  let scoped = false;
  class Controller {
    public readonly kind: string;
    public owned = false;
    public status: Value = { state: "ready", failed: false, retired: false, closeAttempted: false, finishObservationAvailable: false };
    public constructor(kind: string) { this.kind = kind; }
    private summary(): Value {
      const available = this.owned && this.status["ownerRetained"] !== false && this.status["retired"] !== true && this.status["releaseAttempted"] !== true;
      const cleanup = available && (this.kind !== "baseline" || this.status["cleanupOnly"] === true);
      return { ...this.status, cleanupCloseAvailable: cleanup && this.status["closeAttempted"] !== true &&
        (this.kind !== "baseline" || this.status["captureRetained"] === true),
      finishObservationAvailable: cleanup && this.status["closeAcknowledged"] === true,
      closedBaselineRetirementAvailable: cleanup && this.kind === "baseline" && this.status["terminationProved"] === true };
    }
    private step(name: string): Value {
      const event = `${this.kind}.${name}`; calls.push(event);
      if (state.failure === event) { this.status["failed"] = true; throw new Error(`Synthetic failure: ${event}`); }
      return this.summary();
    }
    public inspect(): Value { assert.ok(this.owned); return this.summary(); }
    public capture(value: unknown): Value {
      assert.equal(value, owner); this.owned = true; this.status["captureRetained"] = true; return this.step("capture");
    }
    public captureForCleanup(value: unknown): Value {
      assert.equal(value, owner); this.owned = true; this.status["captureRetained"] = true; this.status["cleanupOnly"] = true; return this.step("cleanup-capture");
    }
    public close(): Value { return this.finishNormalClose(); }
    public cleanupClose(): Value { return this.finishNormalClose(); }
    public async requestCleanup(): Promise<Value> { state.cleanupStarted?.(); await state.cleanupGate; this.status["cleanupOnly"] = true; return this.step("request-cleanup"); }
    public closedBaseline(): unknown { assert.equal(this.kind, "baseline"); return baselineValue; }
    public closedContinuation(): unknown { assert.equal(this.kind, "baseline"); return continuation; }
    public relaunch(value: unknown): Value {
      assert.equal(value, continuation); this.owned = true; this.status["launchRetained"] = true; this.status["launchAttempted"] = true; return this.step("relaunch");
    }
    public generation(): unknown { assert.equal(this.kind, "generation"); return generation; }
    public execute(selected: unknown, observed: unknown, age: unknown): Value {
      assert.equal(selected, generation); assert.equal(observed, startup); assert.equal(age, clock); assert.equal(scoped, false);
      this.owned = true;
      if (state.failure === "writer.transfer-before") {
        this.status["ownerRetained"] = false; calls.push("writer.execute"); throw new Error("Synthetic writer transfer never committed");
      }
      if (state.returnedFailure) { this.status["failed"] = true; }
      return this.step("execute");
    }
    public getVerificationContinuation(): unknown { assert.equal(this.status["retired"], true); return continuation; }
    public start(selected: unknown): Value { assert.equal(selected, continuation); this.owned = true; this.status["launchAcknowledged"] = true; return this.step("start"); }
    public admit(): Value {
      const result = this.step("admit");
      if (state.pendingAuthentication) { state.pendingAuthentication = false; return { ...result, authentication: "pending", admissionAttempted: false }; }
      return { ...result, admitted: true };
    }
    public observeCaches(): Value { return this.step("caches"); }
    public openProject(): Value { return this.step("open"); }
    public collectSavedContent(): Value { return this.step("read"); }
    public finishNormalClose(): Value {
      this.status["closeAttempted"] = true; this.status["closeAcknowledged"] = true; this.status["finishObservationAvailable"] = true;
      return this.step("close");
    }
    public observeTermination(): Value {
      const result = this.step("termination");
      if (state.pendingTermination) { state.pendingTermination = false; return { ...result, termination: "pending" }; }
      this.status["terminationProved"] = true; this.status["baselineCaptured"] = true; return this.summary();
    }
    public cleanupObserveTermination(): Value { return this.observeFinish(); }
    public retireClosedBaseline(): Value { this.status["retired"] = true; return this.step("retire-closed"); }
    public observeFinish(): Value {
      const result = this.step("finish");
      if (state.pendingTermination) { state.pendingTermination = false; return { ...result, termination: "pending" }; }
      this.status["releaseAttempted"] = true;
      if (state.failure === `${this.kind}.release`) { this.status["failed"] = true; throw new Error("Synthetic consumed release refused"); }
      this.status["retired"] = true; this.status["finishObservationAvailable"] = false;
      return { ...this.summary(), termination: "terminated", verificationContinuationRetained: this.status["failed"] !== true,
        fullReopenReadbackInvariant: this.status["failed"] !== true && state.invariant, reopenedSchematicMetadataVerified: state.metadata, reopenedSchematicChildRosterVerified: state.childRoster };
    }
  }
  const engine = { assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(), upstream: {
    withAuthenticatedBridgeDispatchScope: async (task: () => Promise<void>): Promise<void> => {
      assert.equal(scoped, false); scoped = true; try { await task(); } finally { scoped = false; }
    } } };
  const opener = { prepareSchematicRenameOpeningOwner: (opening: unknown, request: Value): Promise<object> => {
    assert.equal(opening, OPENING); assert.equal(request["operationId"], ID); calls.push("opening.transfer");
    return state.failure === "opening.transfer" ? Promise.reject(new Error("Synthetic committed opening transfer refused")) : Promise.resolve(owner);
  }, getSchematicRenameOpeningOwner: (): object => owner };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-operation-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Promise, performance, process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets" } }, structuredClone, isRecord,
    CURRENT_SCHEMATIC_RENAME_OPERATION_PURPOSE, currentSchematicRenameOperationRequestSchema, controlDataDirectory: (): string => "/synthetic/control",
    loadRuntimeMachineProfile: async (): Promise<Value> => { await state.beginGate;
      return { profile: { controlDirectory: "/synthetic/control", easyeda: { assetsRoot: "/synthetic/assets" }, runtime: {} } }; },
    loadOperation: (): Promise<Value> => Promise.resolve({ operationId: ID, plan: { profile: "easyeda-pro-control.current-schematic-rename-writer.v1" }, artifacts: [] }),
    assertCurrentSchematicRenameOpeningOwner: (value: unknown, selected: unknown): Value => { assert.equal(value, owner); assert.equal(selected, engine); return { source: { runtime: {} } }; },
    CurrentSchematicRenameBaselineCoordinator: function CurrentSchematicRenameBaselineCoordinator(): Controller { return new Controller("baseline"); },
    CurrentSchematicRenameGenerationCoordinator: function CurrentSchematicRenameGenerationCoordinator(): Controller { return new Controller("generation"); },
    CurrentSchematicRenameWriterCoordinator: function CurrentSchematicRenameWriterCoordinator(): Controller { return new Controller("writer"); },
    CurrentSchematicRenameVerificationCoordinator: function CurrentSchematicRenameVerificationCoordinator(): Controller { return new Controller("verification"); },
    CurrentSchematicAgedSqlReferenceStage: function CurrentSchematicAgedSqlReferenceStage(): object { return { runOnce: async (input: Value): Promise<object> => {
      assert.equal(input["baseline"], baselineValue); assert.equal(input["proof"], proof); calls.push("scratch.once");
      state.scratchStarted?.(); await state.scratchGate; return reference;
    } }; },
    currentSchematicRenameBaselineClockBinding: (value: unknown): object => { assert.equal(value, baselineValue); return { proof }; },
    collectCurrentSchematicRenameStartupObservation: (selected: unknown, value: unknown): Promise<object> => {
      assert.equal(selected, engine); assert.equal(value, generation); assert.equal(scoped, true); calls.push("startup.once"); return Promise.resolve(startup);
    },
    collectCurrentSchematicAgedSqlClock: (selected: unknown, value: unknown, observedReference: unknown, observedStartup: unknown): Promise<object> => {
      assert.equal(selected, engine); assert.equal(value, generation); assert.equal(observedReference, reference); assert.equal(observedStartup, startup);
      assert.equal(scoped, true); calls.push("clock.once"); return Promise.resolve(clock);
    },
  });
  const constructor: unknown = runInContext(`${program}\nCurrentSchematicRenameOperationCoordinator;`, context); assert.equal(typeof constructor, "function");
  assert.ok(typeof constructor === "function"); const instance = object(Reflect.construct(constructor, [engine, opener]));
  const invoke = (name: string, argument: unknown): unknown => { const method = instance[name]; assert.equal(typeof method, "function");
    assert.ok(typeof method === "function"); return Reflect.apply(method, instance, [argument]) as unknown; };
  return { calls, state, run: async request => object(await invoke("run", request)), inspect: (): Value => object(invoke("inspect", ID)) };
}
type Harness = Awaited<ReturnType<typeof fixture>>;
function step(phase: unknown): Value {
  assert.equal(typeof phase, "string");
  if (phase === "rename-write") { return { expectedPhase: phase, confirmWrite: true, acceptSchematicRename: true, confirmDisposableProject: true }; }
  if (String(phase).endsWith("-close")) { return { expectedPhase: phase, confirmNormalClose: true, acceptUnknownFileEffects: true }; }
  if (["baseline-relaunch", "baseline-open-project", "verification-start", "verification-open"].includes(String(phase))) {
    return { expectedPhase: phase, acceptNormalOpenEffects: true };
  }
  if (phase === "baseline-prepare-clock") { return { expectedPhase: phase, acceptScratchProcessEffects: true }; }
  return { expectedPhase: phase };
}
function advance(value: Harness): Promise<Value> { return value.run({ action: "advance", operationId: ID, step: step(value.inspect()["nextPhase"]) }); }
async function reach(value: Harness, phase: string): Promise<void> {
  for (let index = 0; index < 30 && value.inspect()["nextPhase"] !== phase; index += 1) { await advance(value); }
  assert.equal(value.inspect()["nextPhase"], phase);
}
function diagnostic(value: Harness): Value {
  const result = object(value.inspect()["phaseDiagnostics"]);
  assert.equal(result["diagnosticOnly"], true); assert.equal(result["monotonicElapsedOnly"], true);
  assert.equal(result["clockAuthority"], false); assert.equal(result["replayAllowed"], false); assert.ok(Object.isFrozen(result));
  assert.deepEqual(Object.keys(result).toSorted(), ["clockAuthority", "current", "diagnosticOnly", "last", "monotonicElapsedOnly", "profile", "replayAllowed"]);
  return result;
}
function duration(value: Value, key: "elapsedMs" | "durationMs"): number {
  const ms = value[key]; assert.ok(typeof ms === "number" && Number.isSafeInteger(ms) && ms >= 0);
  assert.ok(Object.isFrozen(value)); return ms;
}

void test("SCHEMATIC public schema requires exact phase acknowledgments and excludes alternate source or writer inputs", () => {
  assert.equal(validateCurrentSchematicRenameOperationArguments(BEGIN)["valid"], true);
  for (const value of [{ ...BEGIN, code: "arbitrary" }, { ...BEGIN, path: "/another/project.eprj2" }, { ...BEGIN, openingOperationId: ID },
    { ...BEGIN, target: { ...TARGET, symbolUuid: "e".repeat(16) } }, { ...BEGIN, desiredTitle: "INPUT" },
    { action: "advance", operationId: ID, step: { expectedPhase: "rename-write", confirmWrite: true } },
    { action: "advance", operationId: ID, step: { ...step("baseline-prepare-clock"), proof: {} } }]) {
    assert.equal(validateCurrentSchematicRenameOperationArguments(value)["valid"], false);
  }
  const discovery = queryCurrentSchematicRenameOperation({ includeSchemas: true });
  assert.equal(discovery["executionAuthorized"], false); assert.equal(discovery["connectedValidation"], false);
  assert.equal(discovery["historicalConnectedValidation"], "not-recorded");
  assert.ok(isRecord(discovery["inputSchema"]));
});

void test("SCHEMATIC public phases complete only the original forward lifecycle and actual saved metadata result", async () => {
  const value = await fixture(); await value.run(BEGIN);
  await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
  await reach(value, "completed"); assert.equal(value.inspect()["renameVerified"], true);
  assert.deepEqual(value.calls, ["opening.transfer", "baseline.capture", "baseline.close", "baseline.termination", "scratch.once", "generation.relaunch",
    "generation.admit", "generation.caches", "generation.open", "startup.once", "clock.once", "writer.execute", "writer.close", "writer.finish",
    "verification.start", "verification.admit", "verification.caches", "verification.open", "verification.read", "verification.close", "verification.finish"]);
  await assert.rejects(value.run(BEGIN)); await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
  await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }));
});

void test("SCHEMATIC begin exposes only bounded monotonic diagnostics while its original profile read is pending", async () => {
  const value = await fixture();
  const gate = Promise.withResolvers<boolean>(); value.state.beginGate = gate.promise;
  const pending = value.run(BEGIN);
  const current = object(diagnostic(value)["current"]);
  assert.equal(current["action"], "baseline-begin"); assert.equal(current["phase"], "baseline-begin"); assert.equal(current["stage"], "performing");
  const elapsed = duration(current, "elapsedMs"); assert.equal(diagnostic(value)["last"], null);
  assert.equal(value.inspect()["nextPhase"], "stopped"); assert.equal(value.inspect()["busy"], true); assert.deepEqual(value.calls, []);
  await assert.rejects(value.run(BEGIN), /already running/u);
  gate.resolve(true); await pending;
  assert.equal(diagnostic(value)["current"], null); const last = object(diagnostic(value)["last"]);
  assert.equal(last["action"], "baseline-begin"); assert.equal(last["phase"], "baseline-begin"); assert.equal(last["outcome"], "succeeded");
  assert.ok(duration(last, "durationMs") >= elapsed); assert.equal(value.inspect()["busy"], false);
  await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
  assert.deepEqual(diagnostic(value)["last"], last); assert.equal(diagnostic(value)["current"], null);
});

void test("SCHEMATIC consumed failures retain active cleanup diagnostics until the original cleanup settles", async () => {
  for (const action of ["baseline-begin", "advance", "cleanup"] as const) {
    const value = await fixture();
    if (action !== "baseline-begin") { await value.run(BEGIN); }
    const gate = Promise.withResolvers<boolean>(), started = Promise.withResolvers<boolean>();
    value.state.cleanupGate = gate.promise; value.state.cleanupStarted = (): void => { started.resolve(true); };
    if (action !== "cleanup") { value.state.failure = action === "baseline-begin" ? "baseline.capture" : "baseline.close"; }
    const request = action === "baseline-begin" ? BEGIN : { action, operationId: ID, confirmAbort: true };
    const pending = action === "advance" ? advance(value) : value.run(request); await started.promise;
    const current = object(diagnostic(value)["current"]), elapsed = duration(current, "elapsedMs");
    assert.equal(current["action"], action); assert.equal(current["phase"], action === "advance" ? "baseline-close" : action);
    assert.equal(current["stage"], "cleanup-selection"); assert.equal(value.inspect()["busy"], true);
    await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }), /already running/u);
    if (action === "cleanup" || action === "baseline-begin") { gate.reject(new Error("Synthetic cleanup refusal")); } else { gate.resolve(true); }
    await assert.rejects(pending, /Synthetic|baseline failed/u);
    assert.equal(diagnostic(value)["current"], null); const last = object(diagnostic(value)["last"]);
    assert.equal(last["action"], action); assert.equal(last["outcome"], "failed"); assert.ok(duration(last, "durationMs") >= elapsed);
    assert.equal(value.inspect()["busy"], false); assert.equal(value.inspect()["renameVerified"], false);
    assert.equal(value.calls.includes("writer.execute"), false);
  }
});

void test("SCHEMATIC public phases repeat only pending observations and never complete missing saved proof", async () => {
  const value = await fixture(); await value.run(BEGIN); await reach(value, "baseline-observe-termination");
  value.state.pendingTermination = true; await advance(value); assert.equal(value.inspect()["nextPhase"], "baseline-observe-termination");
  assert.equal(object(diagnostic(value)["last"])["outcome"], "observation-pending");
  await advance(value); await reach(value, "baseline-admit"); value.state.pendingAuthentication = true;
  await advance(value); assert.equal(value.inspect()["nextPhase"], "baseline-admit");
  assert.equal(object(diagnostic(value)["last"])["outcome"], "observation-pending"); await advance(value);
  assert.equal(object(diagnostic(value)["last"])["outcome"], "succeeded");
  await reach(value, "verification-finish"); value.state.metadata = false;
  await assert.rejects(advance(value)); assert.equal(value.inspect()["renameVerified"], false); assert.equal(value.inspect()["nextPhase"], "stopped");
  const incomplete = await fixture(); await incomplete.run(BEGIN); await reach(incomplete, "verification-finish"); incomplete.state.invariant = false;
  await assert.rejects(advance(incomplete)); assert.equal(incomplete.inspect()["renameVerified"], false);
  const missingChildren = await fixture(); await missingChildren.run(BEGIN); await reach(missingChildren, "verification-finish");
  missingChildren.state.childRoster = false;
  await assert.rejects(advance(missingChildren)); assert.equal(missingChildren.inspect()["renameVerified"], false);
  assert.equal(missingChildren.inspect()["nextPhase"], "stopped");
});

void test("SCHEMATIC public stopped or thrown write stage keeps the writer close owner and forbids replay", async () => {
  for (const returned of [false, true]) {
    const value = await fixture(); await value.run(BEGIN); await reach(value, "rename-write");
    if (returned) { value.state.returnedFailure = true; } else { value.state.failure = "writer.execute"; }
    await assert.rejects(advance(value)); assert.equal(value.inspect()["cleanupOwner"], "writer"); assert.equal(value.inspect()["nextPhase"], "cleanup-close");
    await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("rename-write") }));
    value.state.failure = undefined; await advance(value); await advance(value);
    assert.equal(value.inspect()["nextPhase"], "stopped"); assert.equal(value.inspect()["renameVerified"], false);
    assert.equal(value.calls.filter(call => call === "writer.execute").length, 1);
  }
  const historical = await fixture(); const result = await historical.run({ action: "inspect", operationId: ID });
  assert.equal(result["historicalOnly"], true); assert.equal(result["originalOwnerRetained"], false); assert.equal(result["renameVerified"], false);
});

void test("SCHEMATIC cleanup is serialized, irreversible and selects only original capture or closed retirement", async () => {
  const value = await fixture(); await value.run(BEGIN);
  const gate = Promise.withResolvers<boolean>(); value.state.cleanupGate = gate.promise;
  const pending = value.run({ action: "cleanup", operationId: ID, confirmAbort: true });
  const inspection = await value.run({ action: "inspect", operationId: ID });
  assert.equal(inspection["busy"], true); assert.equal(inspection["cleanupRequested"], true);
  assert.equal(inspection["nextPhase"], "stopped"); assert.equal(inspection["executionAuthorized"], false);
  const current = object(diagnostic(value)["current"]);
  assert.equal(current["action"], "cleanup"); assert.equal(current["phase"], "cleanup"); assert.equal(current["stage"], "cleanup-selection");
  duration(current, "elapsedMs");
  assert.equal(value.calls.includes("baseline.request-cleanup"), false);
  await assert.rejects(value.run({ action: "advance", operationId: ID, step: step("baseline-close") }), /already running/u);
  await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }), /already running/u);
  await assert.rejects(value.run(BEGIN), /already running/u); gate.resolve(true); await pending;
  assert.equal(value.inspect()["nextPhase"], "cleanup-close");
  assert.equal(diagnostic(value)["current"], null); assert.equal(object(diagnostic(value)["last"])["outcome"], "succeeded");
  await assert.rejects(value.run({ action: "cleanup", operationId: ID, confirmAbort: true }));
  await advance(value); await advance(value); assert.equal(value.inspect()["nextPhase"], "stopped"); assert.equal(value.inspect()["renameVerified"], false);
  assert.equal(value.calls.includes("writer.execute"), false);

  const closed = await fixture(); await closed.run(BEGIN); await reach(closed, "baseline-prepare-clock");
  await closed.run({ action: "cleanup", operationId: ID, confirmAbort: true });
  assert.equal(closed.inspect()["nextPhase"], "cleanup-retire-closed"); await advance(closed);
  assert.equal(closed.calls.filter(call => call === "baseline.close").length, 1); assert.equal(closed.calls.includes("scratch.once"), false);

  const opening = await fixture(); opening.state.failure = "opening.transfer"; await assert.rejects(opening.run(BEGIN), /opening transfer refused/u);
  assert.equal(opening.inspect()["nextPhase"], "cleanup-capture"); opening.state.failure = undefined;
  await advance(opening); assert.equal(opening.inspect()["nextPhase"], "cleanup-close"); await advance(opening); await advance(opening);
  assert.equal(opening.inspect()["renameVerified"], false); assert.equal(opening.calls.filter(call => call === "opening.transfer").length, 1);
  assert.equal(opening.calls.includes("baseline.capture"), false); assert.equal(opening.calls.includes("baseline.cleanup-capture"), true);
});

void test("SCHEMATIC inspect returns a detached busy snapshot while the original scratch phase remains pending", async () => {
  const value = await fixture(); await value.run(BEGIN); await reach(value, "baseline-prepare-clock");
  const gate = Promise.withResolvers<boolean>(), started = Promise.withResolvers<boolean>();
  value.state.scratchGate = gate.promise; value.state.scratchStarted = (): void => { started.resolve(true); };
  const pending = advance(value); await started.promise;
  try {
    const calls = [...value.calls], inspection = await value.run({ action: "inspect", operationId: ID });
    assert.equal(inspection["busy"], true); assert.equal(inspection["nextPhase"], "stopped");
    assert.equal(inspection["originalOwnerRetained"], true); assert.equal(inspection["renameVerified"], false);
    assert.equal(inspection["executionAuthorized"], false); assert.equal(inspection["replayAllowed"], false);
    const current = object(diagnostic(value)["current"]);
    assert.equal(current["action"], "advance"); assert.equal(current["phase"], "baseline-prepare-clock"); assert.equal(current["stage"], "performing");
    duration(current, "elapsedMs");
    assert.equal(object(diagnostic(value)["last"])["phase"], "baseline-observe-termination");
    assert.deepEqual(structuredClone(inspection["attemptedPhases"]), ["baseline-begin", "baseline-close", "baseline-observe-termination", "baseline-prepare-clock"]);
    assert.ok(Array.isArray(inspection["attemptedPhases"])); inspection["attemptedPhases"].push("forged");
    assert.notDeepEqual(value.inspect()["attemptedPhases"], inspection["attemptedPhases"]);
    for (const request of [BEGIN, { action: "advance", operationId: ID, step: step("baseline-prepare-clock") },
      { action: "cleanup", operationId: ID, confirmAbort: true }]) { await assert.rejects(value.run(request), /already running/u); }
    await assert.rejects(value.run({ action: "inspect", operationId: ID, confirmWrite: true }));
    assert.deepEqual(value.calls, calls);
  } finally { gate.resolve(true); await pending; }
  const completed = await value.run({ action: "inspect", operationId: ID });
  assert.equal(completed["busy"], false); assert.equal(completed["nextPhase"], "baseline-relaunch");
  assert.equal(diagnostic(value)["current"], null); const last = object(diagnostic(value)["last"]);
  assert.equal(last["phase"], "baseline-prepare-clock"); assert.equal(last["outcome"], "succeeded"); duration(last, "durationMs");
  assert.equal(value.calls.filter(call => call === "scratch.once").length, 1);
});

void test("SCHEMATIC cleanup skips an uncommitted writer reservation and never offers a consumed release again", async () => {
  const uncommitted = await fixture(); await uncommitted.run(BEGIN); await reach(uncommitted, "rename-write");
  uncommitted.state.failure = "writer.transfer-before"; await assert.rejects(advance(uncommitted), /never committed/u);
  assert.equal(uncommitted.inspect()["cleanupOwner"], "generation"); assert.equal(uncommitted.inspect()["nextPhase"], "cleanup-close");
  uncommitted.state.failure = undefined; await advance(uncommitted); await advance(uncommitted);
  assert.deepEqual(uncommitted.calls.slice(-2), ["generation.close", "generation.finish"]);
  assert.equal(uncommitted.calls.includes("writer.close"), false); assert.equal(uncommitted.inspect()["renameVerified"], false);

  for (const [phase, owner] of [["rename-observe-termination", "writer"], ["verification-finish", "verification"]] as const) {
    const consumed = await fixture(); await consumed.run(BEGIN); await reach(consumed, phase);
    consumed.state.failure = `${owner}.release`; await assert.rejects(advance(consumed), /consumed release/u);
    assert.equal(consumed.inspect()["cleanupOwner"], owner); assert.equal(consumed.inspect()["nextPhase"], "stopped");
    await consumed.run({ action: "cleanup", operationId: ID, confirmAbort: true }); assert.equal(consumed.inspect()["nextPhase"], "stopped");
    await assert.rejects(consumed.run({ action: "advance", operationId: ID, step: step("cleanup-observe-termination") }));
    assert.equal(consumed.calls.filter(call => call === `${owner}.finish`).length, 1); assert.equal(consumed.inspect()["renameVerified"], false);
  }
});
