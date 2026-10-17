import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { currentSymbolCopyOperationStepSchema } from "../src/current-symbol-copy-operation.ts";

type Value = Record<string, unknown>;
const ID = "disposable-copy-runtime";
function object(value: unknown): Value { assert.ok(isRecord(value)); return value; }
async function fixture(): Promise<{
  calls: string[];
  state: { failure: string | undefined; pendingAuthentication: boolean; pendingTermination: boolean; invariant: boolean; purpose: string };
  invoke: (name: string, argument?: unknown) => Promise<Value>;
  inspect: () => Value;
}> {
  const calls: string[] = [], state = { failure: undefined as string | undefined, pendingAuthentication: false,
    pendingTermination: false, invariant: true, purpose: "disposable-validation" };
  const clock = Object.freeze({ original: "copy-aged-clock" }), generation = Object.freeze({ operationId: ID });
  const continuation = Object.freeze({ original: "copy-continuation" }); let scopeActive = false;
  class Controller {
    public readonly kind: string;
    public owned = false;
    public status: Value = { failed: false, retired: false, closeAttempted: false, finishCloseAttempted: false, finishObservationAvailable: false };
    public constructor(kind: string) { this.kind = kind; }
    private step(name: string): Value {
      const event = `${this.kind}.${name}`; calls.push(event);
      if (state.failure === event) { this.status["failed"] = true; throw new Error(`Synthetic failure: ${event}`); }
      return { ...this.status };
    }
    public inspect(): Value { assert.ok(this.kind === "baseline" || this.owned); return { ...this.status }; }
    public getCopyProjectOnlyGeneration(): unknown { assert.equal(this.kind, "baseline"); return generation; }
    public getCopyAgedClock(): unknown { assert.equal(this.kind, "baseline"); return clock; }
    public execute(selected: unknown, startup: unknown, aged: unknown): Value {
      assert.equal(selected, generation); assert.equal(aged, clock); assert.equal(scopeActive, false);
      assert.deepEqual(startup, { original: "startup" }); this.owned = true; return this.step("execute");
    }
    public getVerificationContinuation(): unknown { assert.equal(this.status["retired"], true); return continuation; }
    public start(selected: unknown): Value {
      assert.equal(selected, continuation); this.owned = true; this.status["launchAcknowledged"] = true; return this.step("start");
    }
    public admit(): Value {
      const result = this.step("admit");
      if (state.pendingAuthentication) { state.pendingAuthentication = false; return { ...result, authentication: "pending", admissionAttempted: false }; }
      return { ...result, admitted: true };
    }
    public observeCaches(): Value { return this.step("caches"); }
    public openProject(): Value { return this.step("open"); }
    public collectSavedContent(): Value { return this.step("read"); }
    public finishNormalClose(): Value {
      this.status["closeAttempted"] = true; this.status["finishCloseAttempted"] = true; this.status["finishObservationAvailable"] = true;
      return this.step("close");
    }
    public observeFinish(): Value {
      const result = this.step("finish");
      if (state.pendingTermination) { state.pendingTermination = false; return { ...result, termination: "pending" }; }
      this.status["retired"] = true; this.status["finishObservationAvailable"] = false;
      return { ...this.status, termination: "terminated", verificationContinuationRetained: this.status["failed"] !== true,
        fullReopenReadbackInvariant: this.status["failed"] !== true && state.invariant };
    }
  }
  const baseline = new Controller("baseline"), engine = {
    assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(),
    upstream: { withAuthenticatedBridgeDispatchScope: async (task: () => Promise<void>): Promise<void> => {
      assert.equal(scopeActive, false); scopeActive = true; try { await task(); } finally { scopeActive = false; }
    } },
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-copy-operation-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Promise, structuredClone, currentSymbolCopyOperationStepSchema,
    assertCurrentProjectOnlySymbolCopyGeneration: (value: unknown, owner: unknown): Value => {
      assert.equal(value, generation); assert.equal(owner, engine); return { source: { purpose: state.purpose } };
    },
    CurrentSymbolCopyWriterCoordinator: function CurrentSymbolCopyWriterCoordinator(): Controller { return new Controller("writer"); },
    CurrentSymbolCopyVerificationCoordinator: function CurrentSymbolCopyVerificationCoordinator(): Controller { return new Controller("verifier"); },
    qualifyCurrentSymbolCopyStartup: (owner: unknown, selected: unknown): Promise<unknown> => {
      assert.equal(owner, engine); assert.equal(selected, generation); assert.equal(scopeActive, true); calls.push("startup");
      return state.failure === "startup" ? Promise.reject(new Error("Synthetic startup refusal")) : Promise.resolve({ original: "startup" });
    },
  });
  const constructor: unknown = runInContext(`${program}\nCurrentSymbolCopyOperationCoordinator;`, context); assert.ok(typeof constructor === "function");
  const instance = object(Reflect.construct(constructor, [engine, baseline]));
  const invoke = (name: string, argument?: unknown): unknown => {
    const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, [ID, argument]) as unknown;
  };
  return { calls, state, invoke: async (name, argument): Promise<Value> => object(await invoke(name, argument)), inspect: (): Value => object(invoke("inspect")) };
}
type Harness = Awaited<ReturnType<typeof fixture>>;
function step(phase: unknown): Value {
  assert.equal(typeof phase, "string");
  if (phase === "copy-write") { return { expectedPhase: phase, confirmWrite: true, acceptSymbolCopy: true, confirmDisposableProject: true }; }
  if (String(phase).endsWith("-close")) { return { expectedPhase: phase, confirmNormalClose: true, acceptUnknownFileEffects: true }; }
  if (phase === "verification-start" || phase === "verification-open") { return { expectedPhase: phase, acceptNormalOpenEffects: true }; }
  return { expectedPhase: phase };
}
function advance(f: Harness): Promise<Value> { return f.invoke("advance", step(f.inspect()["nextPhase"])); }
async function reach(f: Harness, phase: string): Promise<void> {
  for (let index = 0; index < 15 && f.inspect()["nextPhase"] !== phase; index += 1) { await advance(f); }
  assert.equal(f.inspect()["nextPhase"], phase);
}

void test("copy orchestration completes one forward lifecycle, rejects stale phases and keeps original clock/continuation", async () => {
  const f = await fixture(); await f.invoke("begin");
  await assert.rejects(f.invoke("advance", { expectedPhase: "copy-write", confirmWrite: true })); assert.deepEqual(f.calls, []);
  await advance(f); await assert.rejects(f.invoke("advance", step("copy-write"))); assert.equal(f.calls.filter(call => call === "writer.execute").length, 1);
  await reach(f, "completed"); assert.equal(f.inspect()["copyVerified"], true); assert.equal(f.inspect()["inverseSupported"], false);
  assert.deepEqual(f.calls, ["startup", "writer.execute", "writer.close", "writer.finish", "verifier.start", "verifier.admit", "verifier.caches",
    "verifier.open", "verifier.read", "verifier.close", "verifier.finish"]);
  await assert.rejects(f.invoke("begin")); await assert.rejects(f.invoke("advance", step("verification-finish")));
});

void test("only explicitly pending authentication/termination may repeat and missing final invariant never completes", async () => {
  const f = await fixture(); await f.invoke("begin"); await reach(f, "copy-observe-termination");
  f.state.pendingTermination = true; await advance(f); assert.equal(f.inspect()["nextPhase"], "copy-observe-termination"); await advance(f);
  await reach(f, "verification-admit"); f.state.pendingAuthentication = true; await advance(f);
  assert.equal(f.inspect()["nextPhase"], "verification-admit"); await advance(f); await reach(f, "verification-finish");
  f.state.invariant = false; await assert.rejects(advance(f)); assert.equal(f.inspect()["copyVerified"], false); assert.equal(f.inspect()["nextPhase"], "stopped");
  const ordinary = await fixture(); ordinary.state.purpose = "ordinary-symbol-metadata"; await assert.rejects(ordinary.invoke("begin"));
});

void test("ready copy can irreversibly select original-baseline cleanup without dispatching a write", async () => {
  const f = await fixture(); await f.invoke("begin"); await f.invoke("requestCleanup");
  assert.equal(f.inspect()["cleanupRequested"], true); assert.equal(f.inspect()["nextPhase"], "cleanup-close"); assert.deepEqual(f.calls, []);
  await assert.rejects(f.invoke("requestCleanup")); await assert.rejects(f.invoke("advance", step("copy-write")));
  await advance(f); await advance(f); assert.equal(f.inspect()["nextPhase"], "stopped"); assert.equal(f.inspect()["copyVerified"], false);
  assert.deepEqual(f.calls, ["baseline.close", "baseline.finish"]);
  const started = await fixture(); await started.invoke("begin"); await advance(started); await assert.rejects(started.invoke("requestCleanup"));
});

void test("startup, copy and reopened read failures retain their actual close owner without replay", async () => {
  for (const [failure, phase, owner] of [["startup", "copy-write", "baseline"], ["writer.execute", "copy-write", "writer"],
    ["verifier.read", "verification-read", "verifier"]] as const) {
    const f = await fixture(); await f.invoke("begin"); await reach(f, phase); f.state.failure = failure;
    await assert.rejects(advance(f)); assert.equal(f.inspect()["nextPhase"], "cleanup-close");
    await assert.rejects(f.invoke("advance", step(phase))); f.state.failure = undefined; await advance(f); await advance(f);
    assert.equal(f.inspect()["nextPhase"], "stopped"); assert.equal(f.inspect()["copyVerified"], false);
    assert.deepEqual(f.calls.slice(-2), [`${owner}.close`, `${owner}.finish`]);
  }
});
