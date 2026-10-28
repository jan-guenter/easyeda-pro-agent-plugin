/* oxlint-disable import/max-dependencies -- This coordinator regression joins its actual transport with isolated native callbacks and only stubs the source issuer. */
/** Actual 209 coordinator and startup transport over synthetic original native
 * callbacks. Only the complete-source issuer is stubbed. No editor is opened. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { setImmediate as nextTurn } from "node:timers/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentDisposableOpenSealedTarget } from "../src/current-disposable-open.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "../src/current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209WorkerStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } from "../src/current-pcb-209-startup-opening-program.ts";
import type { CurrentPcbWorkerStartupOpeningBinding } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";

const path = String.raw`C:\disposable\209-opening-failure.eprj2`;
const target: CurrentDisposableOpenSealedTarget = Object.freeze({ rawWindowsPath: path,
  projectUuid: createHash("sha256").update(path).digest("hex"), branchUuid: "a".repeat(32),
  documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) });
const source: CurrentPcb209ActorClockSourceQualification = Object.freeze({
  profile: "private.pcb209-actor-clock-source.v1", application: "3.2.209.8a704eab",
  sourceSha256: Object.freeze({ ui: "synthetic", worker: "synthetic", wsService: "synthetic", backend: "synthetic", pcb: "synthetic" }),
  sourceClosureSha256: "synthetic", suppliedSourceBytesOnly: true, nativeSourceContextsOwned: false,
  responderOwnershipVerified: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false,
  futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false,
});
async function constructor(): Promise<typeof CurrentPcb209WorkerStartupOpening> {
  const modulePath = new URL("../src/current-pcb-209-worker-startup-opening.ts", import.meta.url);
  const actualRequire = createRequire(modulePath), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(modulePath, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, source); } };
    }
    return actualRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentPcb209WorkerStartupOpening"]; assert.ok(typeof result === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual class with only its source issuer stubbed above; native transport remains original.
  return result as typeof CurrentPcb209WorkerStartupOpening;
}
function reply(phase: "preflight" | "open-project"): unknown {
  const dispatched = phase === "open-project";
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-opening.v1",
    phase, projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    ok: !dispatched, status: dispatched ? "refused" : "ready", failure: dispatched ? { stage: "dispatch", code: "GUARD" } : null,
    cleanupFailure: null, dispatchAttempted: dispatched, publicResult: null, prefixObserved: false, nativeWorkMayRemain: dispatched,
    observation: dispatched ? null : { projectPresent: false, branchUuid: null, windowTabId: "window", containerCount: 1,
      tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA - V3.2.209", expectedOpenedTitle: "EasyEDA - V3.2.209",
      documentTitle: "EasyEDA - V3.2.209" } }) } };
}
async function fixture(): Promise<Readonly<{
  opening: CurrentPcb209WorkerStartupOpening; calls: string[]; state: { terminated: boolean; unsubscribed: boolean; terminationProofs: number };
  dispatched: Promise<null>; finishOpening: () => void; failCapture: () => void;
}>> {
  const Constructor = await constructor(), calls: string[] = [], state = { terminated: false, unsubscribed: false, terminationProofs: 0 };
  const dispatched = Promise.withResolvers<null>(), pendingOpening = Promise.withResolvers<unknown>();
  let listener: Parameters<CurrentPcbWorkerStartupDependency["subscribe"]>[0] | null = null;
  const opening: CurrentPcbWorkerStartupOpeningBinding = Object.freeze({
    context: () => ({ sessionId: "parent-session", uniqueContextId: "original-context" }), reprove: (): Promise<void> => Promise.resolve(),
    begin: (): Readonly<{ sessionId: string; uniqueContextId: string }> => { calls.push("begin"); return { sessionId: "parent-session", uniqueContextId: "original-context" }; },
    finish: (): void => { calls.push("finish"); }, observeParent: (): void => undefined,
    ancillaryFrame: (): null => null, observeAncillary: (): never => assert.fail("No ancillary frame"), ancillaryObservation: (): null => null,
  });
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentSessionId: "parent-session", parentTargetId: "parent-target",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: (): Promise<void> => { state.terminationProofs += 1; assert.equal(state.terminated, true); return Promise.resolve(); },
    subscribe: (value: Parameters<CurrentPcbWorkerStartupDependency["subscribe"]>[0]): (() => void) => {
      assert.equal(listener, null); listener = value; return (): void => { state.unsubscribed = true; };
    },
    request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => {
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params && command.params.functionDeclaration === CURRENT_PCB_209_STARTUP_OPENING_FUNCTION && command.params.arguments.length === 2) {
        const phase = command.params.arguments[1].value; assert.ok(phase === "preflight" || phase === "open-project"); calls.push(phase);
        if (phase === "open-project") { dispatched.resolve(null); return pendingOpening.promise; }
        return Promise.resolve(reply(phase));
      }
      calls.push(command.method);
      if (command.method === "Target.getTargets") { return Promise.resolve({ targetInfos: [{ targetId: "parent-target", type: "page", title: "EasyEDA", url: "https://client/editor", attached: true }] }); }
      return Promise.resolve({});
    },
  });
  return { opening: new Constructor({ dependency, opening, actorClockSourceQualification: source }), calls, state,
    dispatched: dispatched.promise, finishOpening: (): void => { pendingOpening.resolve(reply("open-project")); },
    failCapture: (): void => { assert.ok(listener !== null); listener({ sessionId: "parent-session", method: "Target.attachedToTarget", params: {} }); } };
}

void test("209 capture refusal promptly settles open while retaining its original pending dispatch until termination", { timeout: 5000 }, async () => {
  const f = await fixture(), work = f.opening.open(target, (): Promise<void> => Promise.resolve());
  await f.dispatched; f.failCapture(); await assert.rejects(work);
  const failed = f.opening.status();
  assert.equal(failed.settled, true); assert.equal(failed.openingDispatchSettled, false); assert.equal(failed.completed, false);
  assert.ok(failed.diagnostics.failure !== null); assert.equal(f.calls.filter(call => call === "open-project").length, 1);
  await assert.rejects(f.opening.open(target, (): Promise<void> => Promise.resolve()), /CONSUMED/u);
  await assert.rejects(f.opening.releaseAfterTermination()); assert.equal(f.state.unsubscribed, false);
  f.state.terminated = true; f.finishOpening(); await f.opening.releaseAfterTermination();
  assert.equal(f.opening.status().openingDispatchSettled, true); assert.equal(f.state.unsubscribed, true);
  assert.equal(f.opening.status().diagnostics.failure, failed.diagnostics.failure);
  assert.equal(f.calls.filter(call => call === "open-project").length, 1); assert.equal(f.calls.includes("Debugger.resume"), false);
});

void test("209 capture failure during final source guard prevents its delayed opening dispatch", { timeout: 5000 }, async () => {
  const f = await fixture(), guardEntered = Promise.withResolvers<null>(), guardRelease = Promise.withResolvers<null>();
  const work = f.opening.open(target, (): Promise<void> => Promise.resolve(), async (): Promise<void> => { guardEntered.resolve(null); await guardRelease.promise; });
  await guardEntered.promise; f.failCapture(); await assert.rejects(work);
  assert.equal(f.opening.status().openingAttempted, false); assert.equal(f.calls.includes("open-project"), false);
  guardRelease.resolve(null); await nextTurn();
  assert.equal(f.calls.includes("open-project"), false); assert.equal(f.opening.status().openingDispatchSettled, true);
  f.state.terminated = true; await f.opening.releaseAfterTermination();
});

void test("209 termination cleanup can finish after the original pending opener outlasts one settlement deadline", { timeout: 8000 }, async () => {
  const f = await fixture(), work = f.opening.open(target, (): Promise<void> => Promise.resolve());
  await f.dispatched; f.failCapture(); await assert.rejects(work); f.state.terminated = true;
  await assert.rejects(f.opening.releaseAfterTermination(), /DEADLINE/u);
  assert.equal(f.state.unsubscribed, true); assert.equal(f.state.terminationProofs, 1); assert.equal(f.opening.status().openingDispatchSettled, false);
  f.finishOpening(); await f.opening.releaseAfterTermination();
  assert.equal(f.state.terminationProofs, 1); assert.equal(f.opening.status().openingDispatchSettled, true);
  assert.equal(f.calls.filter(call => call === "open-project").length, 1);
});
