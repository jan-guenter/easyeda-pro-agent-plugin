/** Explicit synthetic Core/plan issuance. The production controller and its
 * real reply/source validators run unchanged; no native owner is created. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { observeOriginalCurrentSchematicRelevanceSavedScene as Observe, requireOriginalCurrentSchematicRelevanceSavedSceneObservation as Require } from "../../src/current-schematic-relevance-saved-scene-controller.ts";

interface Api { observeOriginalCurrentSchematicRelevanceSavedScene: typeof Observe; requireOriginalCurrentSchematicRelevanceSavedSceneObservation: typeof Require }
type Owner = Parameters<Api["observeOriginalCurrentSchematicRelevanceSavedScene"]>[0];
type Origin = Parameters<Api["observeOriginalCurrentSchematicRelevanceSavedScene"]>[1];
export async function controllerFixture(args: unknown, reply: unknown): Promise<Readonly<{
 api: Api; owner: Owner; origin: Origin; calls: string[];
 state: { failPhase: string; releaseFails: boolean; throwUndefined: boolean; checks: number; driftOnCheck: number; current: boolean };
}>> {
 const url = new URL("../../src/current-schematic-relevance-saved-scene-controller.ts", import.meta.url); const sourceRequire = createRequire(url);
 const source = await readFile(url, "utf8"); const needle = 'await import("./current-pcb-diagnostic-owner.ts")'; assert.equal(source.split(needle).length, 2);
 const output = await transform(source.replace(needle, 'await Promise.resolve(require("./current-pcb-diagnostic-owner.ts"))'), { loader: "ts", format: "cjs", target: "node24" });
 const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
 const owner = Object.freeze({ syntheticOwner: true }); const origin = Object.freeze({ syntheticOrigin: true }); const prepared = Object.freeze({ syntheticPlan: true });
 const plan = Object.freeze({ closed: Object.freeze({ args }) }); const calls: string[] = [];
 const state = { failPhase: "", releaseFails: false, throwUndefined: false, checks: 0, driftOnCheck: 0, current: true };
 const binding = Object.freeze({ prepared, windowTabId: "synthetic-saved-window", assertCurrent: (): Promise<void> => {
  state.checks += 1; if (state.checks === state.driftOnCheck) { state.current = false; }
  assert.equal(state.current, true); return Promise.resolve();
 } });
 const namespace = {
  requireOriginalCurrentSchematicRelevanceSavedSceneOrigin: (o: unknown, actual: unknown): unknown => { assert.equal(o, origin); assert.equal(actual, owner); assert.equal(state.current, true); return binding; },
  sendOriginalCurrentSchematicRelevanceSavedScene: (actual: unknown, o: unknown, ordinal: number, phase: string): Promise<unknown> => {
   assert.equal(o, origin); assert.equal(actual, owner); assert.equal(phase, ["capture", "observe", "release"][ordinal]); assert.equal(calls.includes(phase), false); calls.push(phase);
   if (state.failPhase === phase || phase === "release" && state.releaseFails) {
   // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Deliberate thrown-undefined regression proves the controller cannot mistake a non-Error rejection for success.
   return Promise.reject(state.throwUndefined ? undefined : new Error(`synthetic-${phase}`));
   }
   if (phase === "capture") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(2)", objectId: "synthetic-tuple" } }); }
   return Promise.resolve(phase === "observe" ? { result: { type: "object", value: reply } } : {});
  },
 };
 Reflect.apply(evaluate, undefined, [(name: string): unknown => {
  if (name === "./current-pcb-diagnostic-owner.ts") { return namespace; }
  if (name === "./generated-schematic-relevance-saved-readback-plan.ts") { return { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan: (p: unknown): unknown => { assert.equal(p, prepared); return plan; } }; }
  return sourceRequire(name) as unknown;
 }, loaded, loaded.exports]);
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the two explicit synthetic issuers above replace Core/plan custody; these types expose the unchanged production controller for ordering tests.
 return Object.freeze({ api: loaded.exports as unknown as Api, owner: owner as unknown as Owner, origin: origin as unknown as Origin, calls, state });
}
