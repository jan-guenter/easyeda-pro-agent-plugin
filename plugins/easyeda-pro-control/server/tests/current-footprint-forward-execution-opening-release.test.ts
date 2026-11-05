/** Genuine provider/StartupOpening release over an inert Linux child. Only
 * source qualification and the opening's original callbacks are synthetic. */
/* oxlint-disable import/max-dependencies -- Join the real opening, provider, native factory and managed journal without replacing their release implementations. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import type { CurrentPcb209WorkerStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupOpeningBinding } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";
import { currentFootprintForwardExecutionOpeningRequestSchema } from "../src/current-footprint-forward-execution-opening-contract.ts";
import { readCurrentFootprintForwardExecutionOpeningHistory } from "../src/current-footprint-forward-execution-opening-journal.ts";
import { forwardExecutionOpeningProviderFixture } from "./helpers/forward-execution-opening-provider-fixture.ts";

function request(suffix: string): ReturnType<typeof currentFootprintForwardExecutionOpeningRequestSchema.parse> {
  const rawWindowsPath = String.raw`C:\Synthetic\validation.eprj2`;
  return currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId: `footprint-forward-execution-opening-release-${suffix}`,
    target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
    footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true,
    acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
}

async function originalOpening(assertTermination: () => Promise<void>): Promise<Readonly<{
  Constructor: typeof CurrentPcb209WorkerStartupOpening; opening: CurrentPcb209WorkerStartupOpening;
}>> {
  const path = new URL("../src/current-pcb-209-worker-startup-opening.ts", import.meta.url), require = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, source = Object.freeze({ syntheticSourceQualification: true });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, source); } };
    }
    // oxlint-disable-next-line import/no-dynamic-require -- Every implementation except the explicitly synthetic source issuer remains unchanged.
    return require(name) as unknown;
  }, loaded, loaded.exports]);
  const value = loaded.exports["CurrentPcb209WorkerStartupOpening"]; assert.ok(typeof value === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Genuine transformed class, not a substitute Opening or reconstructed private registry entry.
  const Constructor = value as typeof CurrentPcb209WorkerStartupOpening;
  const footprint = loaded.exports["CurrentFootprintCopyStartupOpening"]; assert.ok(typeof footprint === "function");
  const footprintPrototype: unknown = Reflect.get(footprint, "prototype"); assert.ok(footprintPrototype !== null && typeof footprintPrototype === "object");
  assert.equal(Object.getPrototypeOf(Constructor.prototype), Object.getPrototypeOf(footprintPrototype));
  assert.equal(Reflect.get(Constructor.prototype, "releaseAfterTermination"), Reflect.get(footprintPrototype, "releaseAfterTermination"));
  const openingFailure = new Error("synthetic original opening preflight refusal");
  const binding: CurrentPcbWorkerStartupOpeningBinding = Object.freeze({
    context: () => ({ sessionId: "parent-session", uniqueContextId: "original-context" }),
    reprove: (): Promise<void> => Promise.reject(openingFailure),
    begin: (): never => assert.fail("No opening dispatch"), finish: (): never => assert.fail("No opening completion"),
    observeParent: (): never => assert.fail("No parent request"), ancillaryFrame: (): null => null,
    observeAncillary: (): never => assert.fail("No ancillary request"), ancillaryObservation: (): null => null,
  });
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentSessionId: "parent-session", parentTargetId: "parent-target",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(), assertOriginalTermination: assertTermination,
    request: (): never => assert.fail("No native opening request"), subscribe: (): never => assert.fail("No capture listener"),
  });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exact source issuer is the sole stub above; no qualification is supplied to a production module.
  const opening = new Constructor({ dependency, opening: binding, actorClockSourceQualification: source as never });
  const selected = request("unused-opening-target");
  await assert.rejects(opening.open({ ...selected.target, branchUuid: "b".repeat(32) }, (): never => assert.fail("No checkpoint callback")), caught => caught === openingFailure);
  assert.equal(opening.status().settled, true); assert.equal(opening.status().transport.started, false);
  return Object.freeze({ Constructor, opening });
}

async function fixture(context: TestContext, suffix: string, assertTermination: () => Promise<void>,
  verifyNativeGraph?: () => Promise<void>): Promise<Awaited<ReturnType<typeof forwardExecutionOpeningProviderFixture>> & Readonly<{ opening: CurrentPcb209WorkerStartupOpening }>> {
  const openingForRelease = await originalOpening(assertTermination), selected = request(suffix);
  const f = await forwardExecutionOpeningProviderFixture(selected, "launched", { openingForRelease,
    ...(verifyNativeGraph === undefined ? {} : { verifyNativeGraph }),
    launchTarget: { windowsPath: "C:\\Synthetic\\easyeda-pro.exe", sha256: "e".repeat(64) },
    childProgram: `
      const readline=require('node:readline');const input=readline.createInterface({input:process.stdin});
      process.stdout.write(JSON.stringify(packet)+'\\n');
      input.on('line',line=>{const q=JSON.parse(line);let result;
        if(q.action==='launch')result={helperInstance:packet.helperInstance,jobId:packet.jobId,rootPid:123,rootCreated:'123456789012345'};
        else if(q.action==='normal-close')result={closeDispatched:true,saveOrDiscardSelected:false};
        else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
        else if(q.action==='release')result={released:true};else throw Error('Unexpected inert cleanup request');
        process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
    ` });
  context.after(() => { if (!f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } });
  await f.provider.launch(selected); await f.provider.close("123"); assert.equal(await f.provider.observeTermination(), true);
  return Object.freeze({ ...f, opening: openingForRelease.opening });
}

void test("successful original Opening release remains retained across an exact native no-dispatch preflight retry", async context => {
  let armed: Error | null = null, calls = 0; const failure = new Error("synthetic original native prefix refusal");
  const f = await fixture(context, "native-prefix", (): Promise<void> => { calls += 1; return Promise.resolve(); },
    (): Promise<void> => { const caught = armed; armed = null; return caught === null ? Promise.resolve() : Promise.reject(caught); });
  const before = [...f.factory.state.actions]; armed = failure;
  await assert.rejects(f.provider.release(), caught => caught === failure); assert.equal(calls, 1);
  assert.deepEqual(f.factory.state.actions, before); assert.equal(f.provider.inspection()["releaseAttempted"], false);
  await f.provider.release(); assert.equal(calls, 1); assert.equal(await f.provider.observeRelease(), "released");
  assert.deepEqual(f.factory.state.actions, [...before, "termination", "release"]);
  assert.equal(f.provider.hasOwnedAllocation(), false); assert.equal(f.provider.hasActiveReservation(), false);
});

void test("a rejected original StartupOpening release is retained without a second termination callback", async context => {
  let calls = 0, refuse = true; const failure = new Error("synthetic original opening release failure");
  const f = await fixture(context, "opening-refusal", (): Promise<void> => { calls += 1; return refuse ? Promise.reject(failure) : Promise.resolve(); });
  const before = [...f.factory.state.actions];
  await assert.rejects(f.provider.release(), caught => caught === failure); assert.equal(calls, 1);
  // A now-successful callback cannot authorize redispatch of the rejected call.
  refuse = false;
  await assert.rejects(f.provider.release(), caught => caught === failure); assert.equal(calls, 1);
  Object.defineProperty(f.opening, "releaseAfterTermination", { configurable: true, value: (): Promise<void> => Promise.resolve() });
  await assert.rejects(f.provider.release(), /ORIGINAL_METHODS_CHANGED/u); assert.equal(calls, 1);
  Reflect.deleteProperty(f.opening, "releaseAfterTermination");
  await assert.rejects(f.provider.release(), caught => caught === failure); assert.equal(calls, 1);
  assert.deepEqual(f.factory.state.actions, before); assert.equal(f.provider.hasOwnedAllocation(), true);
  assert.equal(f.provider.hasActiveReservation(), true); assert.equal(f.provider.inspection()["releaseAttempted"], false);
  const history = await readCurrentFootprintForwardExecutionOpeningHistory(request("opening-refusal").operationId);
  assert.equal(history.records.at(-1)?.kind, "release-intent"); assert.equal(history.operation["state"], "prepared");
});
