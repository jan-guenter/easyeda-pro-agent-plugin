import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { currentSymbolValidationStepSchema } from "../src/current-symbol-validation.ts";

type Value = Record<string, unknown>;
const ID = "disposable-validation-original", INVERSE_ID = "disposable-validation-derived-inverse";
function object(value: unknown): Value { assert.ok(isRecord(value)); return value; }
interface Harness {
  readonly calls: string[];
  readonly state: { failure?: string; authenticationPending: boolean; terminationPending: boolean; cleanupInspectionFails: boolean };
  readonly invoke: (name: string, argument?: unknown) => Promise<Value>;
  readonly inspect: () => Value;
}
async function fixture(): Promise<Harness> {
  const calls: string[] = [], state: Harness["state"] = { authenticationPending: false, terminationPending: false, cleanupInspectionFails: false };
  const generation = Object.freeze({ operationId: ID }), inverseGeneration = Object.freeze({ operationId: INVERSE_ID });
  const agedClock = Object.freeze({ original: "aged-clock" }), inverseClock = Object.freeze({ original: "inverse-clock" });
  const forwardContinuation = Object.freeze({ original: "forward-continuation" }), inverseContinuation = Object.freeze({ original: "inverse-continuation" });
  const verificationResult = Object.freeze({ original: "verification-result" });
  let scopeActive = false, verifiers = 0, writers = 0;
  class Controller {
    public readonly kind: string;
    public owned = false;
    public status: Value = { closeAttempted: false, closeAcknowledged: false, finishCloseAttempted: false,
      finishCloseAcknowledged: false, finishObservationAvailable: false, failed: false, retired: false };
    public constructor(kind: string) { this.kind = kind; }
    private step(name: string): Value {
      const event = `${this.kind}.${name}`; calls.push(event);
      if (state.failure === event) { this.status["failed"] = true; throw new Error(`Synthetic failure: ${event}`); }
      return { ...this.status };
    }
    public inspect(): Value {
      if (this.kind === "inverse-baseline" && state.cleanupInspectionFails) { throw new Error("Synthetic cleanup inspection failed"); }
      if (this.kind.endsWith("writer")) { assert.equal(this.owned, true); }
      return { ...this.status, ...(this.kind === "inverse-baseline" ? {
        operationId: this.owned ? INVERSE_ID : null, cleanupOwner: this.owned ? "inverse-baseline" : "predecessor-verifier",
      } : {}) };
    }
    public execute(input: unknown, startup: unknown, clock: unknown): Value {
      assert.equal(scopeActive, false); assert.equal(input, this.kind.startsWith("forward") ? generation : inverseGeneration);
      assert.equal(clock, this.kind.startsWith("forward") ? agedClock : inverseClock); assert.deepEqual(startup, { original: "startup" });
      this.owned = true; return this.step("execute");
    }
    public getVerificationContinuation(): unknown {
      assert.equal(this.status["retired"], true); assert.equal(this.status["failed"], false);
      return this.kind.startsWith("forward") ? forwardContinuation : inverseContinuation;
    }
    public start(input: unknown): Value {
      assert.equal(input, this.kind.startsWith("forward") ? forwardContinuation : inverseContinuation); this.owned = true; return this.step("start");
    }
    public admit(): Value {
      const result = this.step("admit");
      if (state.authenticationPending) { state.authenticationPending = false; return { ...result, admissionAttempted: false, authentication: "pending" }; }
      return { ...result, admissionAttempted: true, admitted: true, admissionProved: true };
    }
    public observeCaches(): Value { return this.step("observeCaches"); }
    public openProject(): Value { return this.step("openProject"); }
    public collectSavedContent(): Value { return this.step("collectSavedContent"); }
    public finishNormalClose(): Value {
      this.status["closeAttempted"] = true; this.status["finishCloseAttempted"] = true;
      this.status["closeAcknowledged"] = true; this.status["finishCloseAcknowledged"] = true; this.status["finishObservationAvailable"] = true;
      return this.step("finishNormalClose");
    }
    public observeFinish(_operationId: string, retainForInverse?: true): Value {
      const result = this.step("observeFinish");
      if (state.terminationPending) { state.terminationPending = false; return { ...result, termination: "pending" }; }
      this.status["retired"] = retainForInverse !== true; this.status["finishObservationAvailable"] = retainForInverse === true;
      return { ...this.status, termination: "terminated", verificationContinuationRetained: this.status["failed"] !== true,
        fullReopenReadbackInvariant: retainForInverse !== true && this.status["failed"] !== true };
    }
    public getResultContinuation(): unknown { assert.equal(this.kind, "forward-verifier"); return verificationResult; }
    public prepare(input: unknown): Value {
      assert.equal(input, verificationResult); const result = this.step("prepare"); this.owned = true;
      return { ...result, operationId: INVERSE_ID, prepared: true };
    }
    public relaunch(): Value { return this.step("relaunch"); }
    public observeAgedClock(): Value { return this.step("observeAgedClock"); }
    public getProjectOnlyGeneration(): unknown { return this.kind === "baseline" ? generation : inverseGeneration; }
    public getAgedClock(): unknown { return this.kind === "baseline" ? agedClock : inverseClock; }
  }
  const baseline = new Controller("baseline");
  const engine = {
    assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(),
    upstream: { withAuthenticatedBridgeDispatchScope: async (task: () => Promise<void>): Promise<void> => {
      assert.equal(scopeActive, false); scopeActive = true; try { await task(); } finally { scopeActive = false; }
    } },
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-validation-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Promise, structuredClone, currentSymbolValidationStepSchema,
    CurrentSymbolWriterCoordinator: function CurrentSymbolWriterCoordinator(): Controller { const kind = writers === 0 ? "forward-writer" : "inverse-writer"; writers += 1; return new Controller(kind); },
    CurrentSymbolVerificationCoordinator: function CurrentSymbolVerificationCoordinator(): Controller { const kind = verifiers === 0 ? "forward-verifier" : "inverse-verifier"; verifiers += 1; return new Controller(kind); },
    CurrentSymbolInverseCoordinator: function CurrentSymbolInverseCoordinator(): Controller { return new Controller("inverse-baseline"); },
    qualifyCurrentSymbolWriterStartup: (): Promise<unknown> => {
      assert.equal(scopeActive, true); calls.push("startup");
      return state.failure === "startup" ? Promise.reject(new Error("Synthetic startup refusal")) : Promise.resolve({ original: "startup" });
    },
  });
  const constructor: unknown = runInContext(`${program}\nCurrentSymbolValidationCoordinator;`, context);
  assert.equal(typeof constructor, "function"); assert.ok(typeof constructor === "function");
  const instance = object(Reflect.construct(constructor, [engine, baseline]));
  const raw = (name: string, argument?: unknown): unknown => {
    const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, [ID, argument]) as unknown;
  };
  return { calls, state, invoke: async (name, argument): Promise<Value> => object(await raw(name, argument)), inspect: (): Value => object(raw("inspect")) };
}
function step(phase: unknown): Value {
  assert.equal(typeof phase, "string");
  if (phase === "forward-write") { return { expectedPhase: phase, confirmDisposableProject: true, acceptMetadataMutation: true }; }
  if (phase === "inverse-write") { return { expectedPhase: phase, confirmDisposableProject: true, acceptDerivedInverseMutation: true }; }
  if (phase === "inverse-prepare") { return { expectedPhase: phase, acceptScratchProcessEffects: true }; }
  if (phase === "inverse-open") { return { expectedPhase: phase, acceptNormalOpenEffects: true, acceptUnqualifiedSchematicStartupEffects: true }; }
  if (String(phase).endsWith("-close")) { return { expectedPhase: phase, confirmNormalClose: true, acceptUnknownFileEffects: true }; }
  if (String(phase).endsWith("-start") || String(phase).endsWith("-open") || phase === "inverse-relaunch") { return { expectedPhase: phase, acceptNormalOpenEffects: true }; }
  return { expectedPhase: phase };
}
function advance(f: Harness): Promise<Value> { return f.invoke("advance", step(f.inspect()["nextPhase"])); }
async function reach(f: Harness, phase: string): Promise<void> {
  for (let index = 0; index < 30 && f.inspect()["nextPhase"] !== phase; index += 1) { await advance(f); }
  assert.equal(f.inspect()["nextPhase"], phase);
}

void test("disposable validation retains original forward/inverse owners through both complete lifecycles", async () => {
  const f = await fixture(); await f.invoke("begin"); await reach(f, "completed");
  const result = f.inspect(); assert.equal(result["forwardVerified"], true); assert.equal(result["inverseVerified"], true);
  assert.equal(result["metadataRestorationVerified"], true); assert.equal(result["historicalDatabaseBytesRestored"], false);
  assert.equal(result["normalWritersEnabled"], false); assert.equal(result["inverseOperationId"], INVERSE_ID);
  assert.equal(f.calls.filter((call) => call.endsWith(".execute")).length, 2);
  assert.equal(f.calls.filter((call) => call.endsWith(".collectSavedContent")).length, 2);
  assert.equal(f.calls.filter((call) => call.endsWith(".finishNormalClose")).length, 4);
  await assert.rejects(f.invoke("begin"), /one original baseline/u);
});

void test("stale phase and missing/extraneous effect acknowledgements refuse before any next action", async () => {
  const f = await fixture(); await f.invoke("begin");
  await assert.rejects(f.invoke("advance", { expectedPhase: "forward-write" }));
  await assert.rejects(f.invoke("advance", { ...step("forward-write"), code: "caller()" }));
  assert.deepEqual(f.calls, []); await advance(f);
  const before = [...f.calls]; await assert.rejects(f.invoke("advance", step("forward-write")), /exact next phase/u);
  assert.deepEqual(f.calls, before); assert.equal(f.inspect()["nextPhase"], "forward-close");
});

void test("only genuine pending authentication and termination retain their expected phase", async () => {
  const f = await fixture(); await f.invoke("begin"); await reach(f, "forward-observe-termination");
  f.state.terminationPending = true; await advance(f); assert.equal(f.inspect()["nextPhase"], "forward-observe-termination");
  await advance(f); await reach(f, "forward-verification-admit");
  f.state.authenticationPending = true; await advance(f); assert.equal(f.inspect()["nextPhase"], "forward-verification-admit");
  await advance(f); assert.equal(f.inspect()["nextPhase"], "forward-verification-caches");
  await reach(f, "inverse-admit"); f.state.authenticationPending = true; await advance(f);
  assert.equal(f.inspect()["nextPhase"], "inverse-admit"); await advance(f); assert.equal(f.inspect()["nextPhase"], "inverse-caches");
});

void test("startup failure leaves original baseline cleanup and never invokes a writer", async () => {
  const f = await fixture(); await f.invoke("begin"); f.state.failure = "startup";
  await assert.rejects(advance(f), /startup refusal/u); assert.equal(f.inspect()["nextPhase"], "cleanup-close");
  delete f.state.failure; await advance(f); f.state.terminationPending = true; await advance(f);
  assert.equal(f.inspect()["nextPhase"], "cleanup-observe-termination"); await advance(f);
  assert.equal(f.inspect()["nextPhase"], "stopped"); assert.equal(f.calls.includes("baseline.finishNormalClose"), true);
  assert.equal(f.calls.some((call) => call.endsWith(".execute")), false);
});

void test("failed writer transfers cleanup to its exact instance and cannot start verification or inverse", async () => {
  const f = await fixture(); await f.invoke("begin"); f.state.failure = "forward-writer.execute";
  await assert.rejects(advance(f), /Synthetic failure/u); assert.equal(f.inspect()["nextPhase"], "cleanup-close");
  delete f.state.failure; await advance(f); f.state.terminationPending = true; await advance(f);
  assert.equal(f.inspect()["nextPhase"], "cleanup-observe-termination"); await advance(f);
  assert.equal(f.inspect()["nextPhase"], "stopped"); assert.equal(f.calls.includes("forward-writer.finishNormalClose"), true);
  assert.equal(f.calls.some((call) => call.includes("verifier.start") || call.includes("inverse-baseline.prepare")), false);
});

void test("failed snapshot comparison exposes only supported retained observation cleanup", async () => {
  const f = await fixture(); await f.invoke("begin"); await reach(f, "forward-verification-finish");
  f.state.failure = "forward-verifier.observeFinish"; await assert.rejects(advance(f), /Synthetic failure/u);
  assert.equal(f.inspect()["nextPhase"], "cleanup-observe-termination");
  delete f.state.failure; await advance(f); assert.equal(f.inspect()["nextPhase"], "stopped");
  assert.equal(f.calls.filter((call) => call === "forward-verifier.finishNormalClose").length, 1);
  assert.equal(f.calls.includes("inverse-baseline.prepare"), false);
});

void test("failed inverse preparation retires its held predecessor proof without another close or mutation", async () => {
  const f = await fixture(); await f.invoke("begin"); await reach(f, "inverse-prepare");
  f.state.failure = "inverse-baseline.prepare"; await assert.rejects(advance(f), /Synthetic failure/u);
  assert.equal(f.inspect()["nextPhase"], "cleanup-observe-termination");
  delete f.state.failure; await advance(f); assert.equal(f.inspect()["nextPhase"], "stopped");
  assert.equal(f.calls.filter((call) => call === "forward-verifier.finishNormalClose").length, 1);
  assert.equal(f.calls.filter((call) => call === "forward-verifier.observeFinish").length, 2);
  assert.equal(f.calls.includes("inverse-writer.execute"), false);
});

void test("cleanup inspection failure preserves the primary consumed-stage error", async () => {
  const f = await fixture(); await f.invoke("begin"); await reach(f, "inverse-prepare");
  f.state.failure = "inverse-baseline.prepare"; f.state.cleanupInspectionFails = true;
  await assert.rejects(advance(f), (error: unknown) => {
    const failure = object(error);
    const errors = failure["errors"];
    assert.equal(failure["name"], "AggregateError"); assert.ok(Array.isArray(errors)); assert.equal(errors.length, 2);
    const cleanup = object(errors[1]), primary = object(errors[0]);
    assert.match(String(primary["message"]), /Synthetic failure: inverse-baseline.prepare/u);
    assert.match(String(cleanup["message"]), /Synthetic cleanup inspection failed/u);
    assert.equal(failure["cause"], errors[1]); return true;
  });
  assert.equal(f.inspect()["nextPhase"], "stopped"); assert.equal(f.inspect()["failedPhase"], "inverse-prepare");
  const previous = [...f.calls]; await assert.rejects(f.invoke("advance", step("inverse-prepare")), /exact next phase/u);
  assert.deepEqual(f.calls, previous); assert.equal(f.calls.includes("inverse-writer.execute"), false);
});
