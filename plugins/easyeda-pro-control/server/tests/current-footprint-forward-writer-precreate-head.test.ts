/** Real private-field refusal paths only; no native process exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintForwardWriterPrecreateHeadOwner, requireOriginalCurrentFootprintForwardWriterPrecreateHead } from "../src/current-footprint-forward-writer-precreate-head.ts";

void test("precreate head refuses source-shaped provider/capability/interval without invoking a supplied getter", async () => {
 let calls = 0; const provider: unknown = Object.create(null); assert.ok(provider !== null && typeof provider === "object");
 Object.defineProperty(provider, "requireSourceInput", { get: (): never => { calls += 1; throw new Error("caller getter"); } });
 const owner: unknown = Reflect.construct(CurrentFootprintForwardWriterPrecreateHeadOwner, [provider, {}, {}]); assert.ok(owner instanceof CurrentFootprintForwardWriterPrecreateHeadOwner);
 await assert.rejects(owner.observe()); assert.equal(calls, 0); assert.throws(() => owner.observe(), /CONSUMED/u); await owner.joinAfterOriginalExit();
 assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintForwardWriterPrecreateHead, undefined, [{ profile: "private.current-footprint-forward-writer-precreate-head.v1" }, provider, {}, {}]));
});
