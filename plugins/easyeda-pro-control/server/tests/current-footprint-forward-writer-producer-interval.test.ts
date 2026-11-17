/** The actual Core interval methods and private registry run with explicitly
 * synthetic original constructor/Main/native sources. No native owner runs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { transform } from "esbuild";
import { types } from "node:util";
import { currentProjectSaveProducerGuardCases } from "../src/current-project-save-producer-guard-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS, CURRENT_PROJECT_SAVE_PRODUCER_ROLES } from "../src/current-project-save-producer-protocol.ts";
import type { CurrentFootprintForwardWriterProducerInterval } from "../src/current-footprint-forward-writer-producer-interval.ts";

interface OriginalCore {
  beginFootprintForwardWriterProducerInterval: (capability: object) => Promise<CurrentFootprintForwardWriterProducerInterval>;
  bindFootprintForwardWriterProducerInterval: (token: CurrentFootprintForwardWriterProducerInterval, capability: object, origin: object) => void;
  consumeFootprintForwardWriterProducerInterval: (token: CurrentFootprintForwardWriterProducerInterval, capability: object, origin: object) => void;
}
async function fixture(mutate?: (scope: Record<string, unknown>) => void): Promise<Readonly<{
  owner: OriginalCore; capability: object; origin: object; scope: Record<string, unknown>; points: Map<string, string>;
  state: { live: boolean; armed: boolean; mainBusy: boolean; sourceChecks: number; channelChecks: number; armedChecks: number };
  require: (token: CurrentFootprintForwardWriterProducerInterval, owner: object, capability: object, origin?: object) => void;
}>> {
  const text = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const methodsStart = text.indexOf("  public beginFootprintForwardWriterProducerInterval(");
  const methodsEnd = text.indexOf("  /** Retain the exact original full preparation before its first await.", methodsStart);
  const registryStart = text.indexOf("interface ForwardWriterProducerIntervalRecord {");
  const registryEnd = text.indexOf("const forwardWriterClockRpcOrigins", registryStart);
  assert.ok(methodsStart > 0 && methodsEnd > methodsStart && registryStart > 0 && registryEnd > registryStart);
  const body = `${text.slice(registryStart, registryEnd)}
export class SyntheticOriginalCore {
  #forwardWriterProducerIntervalAttempted=false; #forwardWriterProducerIntervalPending=null;
  #combinedAbortAttempted=false; #combinedOutputCleanupOnly=false; #mainTerminateAttempted=false;
  #terminationObserved=false; #closeConsumed=false; #releaseConsumed=false;
  #startupChannel={status:()=>({started:true,released:false,failed:false,fatal:false})};
  #available(){if(!state.live)throw Error('synthetic original ended');}
  originalFootprintForwardWriterSource(){return originalSource;}
${text.slice(methodsStart, methodsEnd)}
}`;
  const state = { live: true, armed: false, mainBusy: false, sourceChecks: 0, channelChecks: 0, armedChecks: 0 };
  const capability = Object.freeze({ syntheticOriginalCapability: true }), origin = Object.freeze({ syntheticOriginalOrigin: true });
  const main = Object.freeze({ requireForwardWriterRequestArmed: (cap: unknown, token: unknown): void => {
    state.armedChecks += 1; assert.equal(cap, capability); assert.equal(token, origin); assert.equal(state.armed, true); assert.equal(state.mainBusy, false);
  } });
  const points = new Map([...new Set([...currentProjectSaveProducerGuardCases("script").map(command => command.role), ...CURRENT_PROJECT_SAVE_PRODUCER_ROLES])].map((role, index) => [role, `original-${String(index)}`]));
  const current = (): void => { assert.equal(state.live, true, "synthetic original ended"); };
  const scope: Record<string, unknown> = { events: Object.freeze({ syntheticOriginalSubscriber: true }), points, eventCount: 48, event: null, role: null, read: Promise.resolve(),
    cacheCursor: Object.freeze({ requireCompleted: current }), syncCursor: Object.freeze({ requireCompleted: current }), assertOriginal: current,
    armed: true, failed: false, retired: false, guardRequests: 10, heldRetained: false, resumeExpected: false, continuation: null,
    source: Object.freeze({ workerSource: "synthetic complete source", scriptId: "script", assertCurrent: async (): Promise<void> => { state.sourceChecks += 1; await Promise.resolve(); mutate?.(scope); } }),
    channel: Object.freeze({ assertCurrent: (): Promise<void> => { state.channelChecks += 1; return Promise.resolve(); } }) };
  const originalSource = Object.freeze({ source: {}, opening: {}, result: {}, main });
  const component = { failed: false, retired: false }; const completion = { component, opening: originalSource.opening, result: originalSource.result };
  const producerOwners = new WeakMap<object, unknown>(); const frontierCompletions = new WeakMap<object, unknown>(), frontiers = new WeakMap<object, unknown>();
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  let owner: OriginalCore | null = null;
  const compiled = await transform(body, { loader: "ts", format: "cjs", target: "node24" });
  runInNewContext(compiled.code, { module: loaded, exports: loaded.exports, state, originalSource, types,
    CURRENT_PROJECT_SAVE_PRODUCER_ROLES, CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS, currentProjectSaveProducerGuardCases,
    forwardWriterProducerOwners: producerOwners, forwardWriterFrontierCompletions: frontierCompletions, forwardWriterFrontiers: frontiers,
    error: (code: string): Error => new Error(code),
    assertOriginalCurrentFootprintForwardWriterNativeOwner: (value: unknown): void => { assert.equal(value, owner); current(); },
    requireCurrentFootprintForwardWriterMainNativeOwner: (cap: unknown, runner: unknown, mode: string): OriginalCore | null => { assert.equal(cap, capability); assert.equal(runner, main); assert.equal(mode, "normal"); return owner; },
    qualifyCurrentProjectSaveProducerGuardSource: (source: unknown): void => { assert.equal(source, "synthetic complete source"); },
  });
  const Constructor = loaded.exports["SyntheticOriginalCore"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This class contains actual extracted Core methods, with only labelled synthetic original scope/source/native issuers in the isolated VM.
  owner = Reflect.construct(Constructor, []) as OriginalCore; producerOwners.set(owner, scope); frontierCompletions.set(owner, completion); frontiers.set(owner, component);
  const reprove = loaded.exports["requireOriginalCurrentFootprintForwardWriterProducerInterval"]; assert.ok(typeof reprove === "function");
  return { owner, capability, origin, scope, points, state,
    require: (token, receiver, cap, tokenOrigin): void => { Reflect.apply(reprove, undefined, [token, receiver, cap, tokenOrigin]); } };
}
void test("original guard interval begins before Main arm, binds once and survives only its one intended action transition", async () => {
  const f = await fixture(); const token = await f.owner.beginFootprintForwardWriterProducerInterval(f.capability);
  assert.equal(f.points.size, 37); assert.equal(f.state.sourceChecks, 1); assert.equal(f.state.channelChecks, 1); assert.equal(f.state.armedChecks, 0);
  f.require(token, f.owner, f.capability); assert.throws(() => { f.require(structuredClone(token), f.owner, f.capability); });
  assert.throws(() => { f.require(new Proxy(token, {}), f.owner, f.capability); }); assert.throws(() => { f.require(token, {}, f.capability); });
  f.state.armed = true; f.owner.bindFootprintForwardWriterProducerInterval(token, f.capability, f.origin);
  assert.throws(() => { f.require(token, f.owner, f.capability); }); f.require(token, f.owner, f.capability, f.origin);
  f.owner.consumeFootprintForwardWriterProducerInterval(token, f.capability, f.origin);
  assert.throws(() => { f.owner.consumeFootprintForwardWriterProducerInterval(token, f.capability, f.origin); }, /CONSUMED/u);
  f.state.mainBusy = true; f.scope["event"] = { syntheticPlannedHeldProducer: true }; f.scope["role"] = "localIngress"; f.scope["eventCount"] = 49;
  f.require(token, f.owner, f.capability, f.origin);
  f.points.set("historySeed", "replacement"); assert.throws(() => { f.require(token, f.owner, f.capability, f.origin); }, /CHANGED/u);
  f.points.set("historySeed", "original-0"); assert.throws(() => { f.require(token, f.owner, f.capability, f.origin); }, /FAILED/u);
  await assert.rejects(f.owner.beginFootprintForwardWriterProducerInterval(f.capability), /CONSUMED/u);
});
void test("a guard event, changed subscriber or partial original startup after an awaited check burns interval preparation", async () => {
  for (const mutate of [
    (scope: Record<string, unknown>): void => { scope["eventCount"] = 49; },
    (scope: Record<string, unknown>): void => { scope["events"] = {}; },
    (scope: Record<string, unknown>): void => { scope["failed"] = true; },
  ]) {
    const f = await fixture(mutate); await assert.rejects(f.owner.beginFootprintForwardWriterProducerInterval(f.capability), /CHANGED/u);
    assert.equal(f.state.channelChecks, 0); await assert.rejects(f.owner.beginFootprintForwardWriterProducerInterval(f.capability), /CONSUMED/u);
  }
});
