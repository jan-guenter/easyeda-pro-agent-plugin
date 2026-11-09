/** Host-side original request/packet custody. Synthetic CDP bytes establish
 * no target execution, live return-value identity, accepted event or Job. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintInverseNativeGetTaskInvocationCustody as Custody, assertOriginalCurrentFootprintInverseNativeGetTaskInvocationCustody as original } from "../src/current-footprint-inverse-native-get-task-invocation-custody.ts";

/** Build only the complete fixed synthetic native-Promise reply shape. */
function packet(id = "original-promise"): Readonly<{ result: Readonly<{ type: "object"; subtype: "promise"; className: "Promise"; description: "Promise"; objectId: string }> }> { return { result: { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: id } }; }
void test("same original request and settled slot retain the actual Promise record without replacement", async () => {
  const invocation = Promise.withResolvers<unknown>(); let current = true; let exited = false; let raw: unknown = null; let reads = 0;
  const lane = new Custody({ request: invocation.promise, current: (): void => { assert.ok(current); }, assertOriginalInvocation: (value): void => { assert.equal(value, invocation.promise); }, originalReply: (value): unknown => { assert.equal(value, invocation.promise); reads += 1; assert.ok(raw !== null); return raw; }, assertOriginalExit: (): void => { assert.ok(exited); } }); original(lane); lane.requireCurrent(); assert.equal(reads, 0);
  const first = lane.requireOriginalPromise(); const second = lane.requireOriginalPromise(); raw = packet(); invocation.resolve(raw); const value = await first; assert.equal(await second, value); assert.deepEqual(value, { objectId: "original-promise" }); lane.requireOriginalPromiseRecord(value); assert.throws(() =>{  lane.requireOriginalPromiseRecord({ ...value }); }); await assert.rejects(lane.settleAfterOriginalExit());
  current = false; assert.throws(() =>{  lane.requireCurrent(); }); exited = true; await lane.settleAfterOriginalExit(); assert.throws(() =>{  lane.requireCurrent(); });
});
void test("equal-shaped foreign slot replies, metadata changes, getters and Proxy packets refuse", async () => {
  for (const mode of ["foreign", "changed", "getter", "proxy"] as const) {
    const invocation = Promise.withResolvers<unknown>(); let effects = 0; let exited = false; let raw: unknown = null;
    const lane = new Custody({ request: invocation.promise, current: (): void => { assert.equal(exited, false); }, assertOriginalInvocation: (value): void => { assert.equal(value, invocation.promise); }, originalReply: (): unknown => raw, assertOriginalExit: (): void => { assert.ok(exited); } });
    const valid = packet(); raw = mode === "foreign" ? packet() : valid;
    if (mode === "getter") { raw = Object.defineProperty({}, "result", { enumerable: true, get(): unknown { effects += 1; return valid.result; } }); }
    if (mode === "proxy") { raw = new Proxy(valid, { ownKeys(): readonly (string | symbol)[] { effects += 1; return ["result"]; } }); }
    const reply = lane.requireOriginalPromise(); invocation.resolve(mode === "foreign" ? valid : raw);
    if (mode === "changed") { const value = await reply; raw = packet("foreign-promise"); assert.throws(() =>{  lane.requireOriginalPromiseRecord(value); }); } else { await assert.rejects(reply); }
    assert.equal(effects, 0); exited = true; await lane.settleAfterOriginalExit(); assert.throws(() =>{  lane.requireCurrent(); });
  }
});
void test("actual original exit joins the same unresolved invocation observer", async () => {
  const invocation = Promise.withResolvers<unknown>(); let exited = false; let joined = false;
  const lane = new Custody({ request: invocation.promise, current: (): void => { assert.equal(exited, false); }, assertOriginalInvocation: (value): void => { assert.equal(value, invocation.promise); }, originalReply: (): unknown => { throw new Error("no original reply after exit"); }, assertOriginalExit: (): void => { assert.ok(exited); } }); await assert.rejects(lane.settleAfterOriginalExit()); exited = true; const cleanup = (async (): Promise<void> => { await lane.settleAfterOriginalExit(); joined = true; })(); await Promise.resolve(); assert.equal(joined, false); invocation.reject(new Error("original pipe closed")); await cleanup; assert.equal(joined, true);
});
