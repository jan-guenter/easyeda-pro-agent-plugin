/** Production Core waiter/ACK handlers with an explicit lexical row-getter
 * seam. No native owner factory, child process, DB or grant is constructed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { currentPcbViaMainLiveHistoryNativeCases } from "../src/current-pcb-via-main-live-history-protocol.ts";

async function fixture(): Promise<Readonly<{ wait: () => Promise<unknown>; ack: (phase: string) => void; fail: () => void; reads: () => number; rows: object }>> {
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const prepared = Object.freeze({ inertCheckpoint: true }); const plan = Object.freeze({ inertPlan: true }); const rows = Object.freeze({ originalCompletedRows: true }); let reads = 0;
  let source = await readFile(url, "utf8"); const anchor = "  public async waitForSchematicRelevanceDisplayLiveHistoryRows(argumentsValue:GeneratedSchematicRelevanceDisplayNativeArguments):Promise<CurrentPcbViaMainLiveHistoryRows>{";
  assert.equal(source.split(anchor).length, 2);
  source = source.replace(anchor, `  public syntheticWaitRows(plan){return this.waitForSchematicRelevanceDisplayLiveHistoryRows(plan);}
  public syntheticAckRows(command){this.#observeSchematicLiveHistoryReply(syntheticPlan,command);}
  public syntheticFailRows(){this.#refuseSchematicHistoryWaiters();}
${anchor}`);
  const lookup="return this.requireSchematicRelevanceDisplayLiveHistoryRows(argumentsValue);";assert.equal(source.split(lookup).length,2);source=source.replace(lookup,"return syntheticRowsLookup();");
  const actualGetter="this.requireSchematicRelevanceDisplayLiveHistoryRows(argumentsValue);this.#schematicLiveHistoryRowsSignal.resolve(true);";assert.equal(source.split(actualGetter).length,2);source=source.replace(actualGetter,"syntheticRowsLookup();this.#schematicLiveHistoryRowsSignal.resolve(true);");
  const check="requireSchematicArguments(this,argumentsValue);if(!await this.#schematicLiveHistoryRowsSignal.promise)";assert.equal(source.split(check).length,2);source=source.replace(check,"syntheticPlanCheck(argumentsValue);if(!await this.#schematicLiveHistoryRowsSignal.promise)");
  source += `\nlet syntheticRowsLookup,syntheticPlan;function syntheticPlanCheck(value){if(value!==syntheticPlan)throw Error("synthetic-plan");} export function seedSyntheticRows(owner,prepared,lookup,plan){syntheticRowsLookup=lookup;syntheticPlan=plan;const allocation={prepared,owner,state:"retained"};pcbViaWriteAllocations.set(prepared,allocation);pcbViaWriteFactories.set(owner,Object.freeze({allocation}));}`;
  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name === "./current-pcb-via-write-plan.ts") { assert.ok(typeof actual === "object" && actual !== null); return { ...actual, requireOriginalCurrentPcbViaWritePlan: (candidate: unknown): unknown => { assert.equal(candidate, plan); return { prepared }; } }; }
    if (name === "./managed-fixture-generated-open-checkpoint.ts") { assert.ok(typeof actual === "object" && actual !== null); return { ...actual, assertOriginalGeneratedFixtureOpenCheckpoint: (candidate: unknown): void => { assert.equal(candidate, prepared); } }; }
    return actual;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaWriteOwner"], seed = loaded.exports["seedSyntheticRows"]; assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const constructed: unknown = Reflect.construct(Constructor, [Object.freeze({ pid: 0 }), (): Promise<void> => Promise.resolve(), null, (): Promise<void> => Promise.resolve()]);
  assert.ok(typeof constructed === "object" && constructed !== null); const owner = constructed;
  Reflect.apply(seed, undefined, [owner, prepared, (): object => { reads += 1; return rows; },plan]);
  const wait: unknown = Reflect.get(owner, "syntheticWaitRows"); const ack: unknown = Reflect.get(owner, "syntheticAckRows"); const fail: unknown = Reflect.get(owner, "syntheticFailRows");
  assert.ok(typeof wait === "function" && typeof ack === "function" && typeof fail === "function");
  return Object.freeze({ wait: async (): Promise<unknown> => { const pending: unknown = Reflect.apply(wait, owner, [plan]); return await pending; }, ack: (phase: string): void => {
    const command = currentPcbViaMainLiveHistoryNativeCases().find(candidate => candidate.phase === phase); assert.ok(command !== undefined); Reflect.apply(ack, owner, [command]);
  }, fail: (): void => { Reflect.apply(fail, owner, []); }, reads: (): number => reads, rows });
}
void test("worker syncHistory keeps its original wait through Main resume until actual final release acknowledgement", async () => {
  const f = await fixture(); let settled = false; const pending = f.wait(); const observed = (async (): Promise<void> => { await pending; settled = true; })();
  f.ack("via-main-live-arm"); f.ack("via-main-live-step"); await Promise.resolve();
  assert.equal(settled, false); assert.equal(f.reads(), 0);
  f.ack("via-main-live-release"); assert.equal(await pending, f.rows); await observed; assert.equal(f.reads(), 2);
});
void test("original failure wakes the held rows waiter and a later release cannot revive it", async () => {
  const f = await fixture(); const pending = f.wait(); const rejected = assert.rejects(pending, /ROWS_REFUSED/u);
  f.fail(); await rejected; assert.equal(f.reads(), 0); f.ack("via-main-live-release");
  await assert.rejects(f.wait(), /ROWS_REFUSED/u); assert.equal(f.reads(), 1);
});
