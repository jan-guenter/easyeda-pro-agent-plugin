/** Actual intent-owner refusal paths only. No valid source/native authority
 * or filesystem reservation is manufactured by copied caller inputs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintForwardWriterCreateIntentOwner, reproveOriginalCurrentFootprintForwardWriterConsumedCreateIntent, requireOriginalCurrentFootprintForwardWriterConsumedCreateIntent } from "../src/current-footprint-forward-writer-create-intent.ts";

const REQUEST = Object.freeze({ operationId: "footprint-create-intent-refused-original", clockWindow: Object.freeze({ minimum: 1_700_000_000_000, maximum: 1_700_000_010_000 }), confirmDisposableCopy: true, acceptUnsupportedInverse: true });
void test("intent owner refuses caller property access and Proxy inputs before any reservation", () => {
 let calls = 0; const copied: unknown = Object.create(null); assert.ok(copied !== null && typeof copied === "object");
 const getter = (): never => { calls += 1; throw new Error("caller getter"); };
 for (const key of ["provider", "preparation", "head", "interval", "capability", "mainOrigin", "clockOrigin", "reservation"]) { Object.defineProperty(copied, key, { get: getter, enumerable: true }); }
 assert.throws(() => Reflect.construct(CurrentFootprintForwardWriterCreateIntentOwner, [copied, REQUEST]));
 const proxy = new Proxy(copied, { get: (): never => { calls += 1; throw new Error("proxy"); } }); assert.throws(() => Reflect.construct(CurrentFootprintForwardWriterCreateIntentOwner, [proxy, REQUEST])); assert.equal(calls, 0);
});
void test("matching intent/profile shapes cannot issue an original dispatch token", async () => {
 const inputs = Object.freeze({ provider: {}, preparation: {}, head: {}, interval: {}, capability: {}, mainOrigin: {}, clockOrigin: {}, reservation: {} });
 const value: unknown = Reflect.construct(CurrentFootprintForwardWriterCreateIntentOwner, [inputs, REQUEST]); assert.ok(value instanceof CurrentFootprintForwardWriterCreateIntentOwner);
 await assert.rejects(value.prepare()); assert.throws(() => value.prepare(), /PREPARATION_CONSUMED/u); await value.finishAfterOriginalExit();
 assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintForwardWriterConsumedCreateIntent, undefined, [{ profile: "private.current-footprint-forward-writer-create-intent.v1", operationId: REQUEST.operationId, executionAuthorized: false, saveAuthorized: false }, {}, {}, {}, {}]));
 await assert.rejects(async () => { await Reflect.apply(reproveOriginalCurrentFootprintForwardWriterConsumedCreateIntent, undefined, [{ profile: "private.current-footprint-forward-writer-create-intent.v1", operationId: REQUEST.operationId, executionAuthorized: false, saveAuthorized: false }, {}, {}, {}, {}]); });
});
