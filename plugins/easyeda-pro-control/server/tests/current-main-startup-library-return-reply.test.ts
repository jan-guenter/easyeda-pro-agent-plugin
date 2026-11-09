/** Supplied metadata comparison only. Real Promise provenance belongs to the
 * original private cursor and is never reconstructed from these packets. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentMainStartupLibraryReturnReply } from "../src/current-main-startup-library-return-reply.ts";

function packet(state = "fulfilled", type = "object"): unknown {
  return { result: [], internalProperties: [
    { name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "promise-prototype" } },
    { name: "[[PromiseState]]", value: { type: "string", value: state } },
    { name: "[[PromiseResult]]", value: { type, className: "Yo", description: "Yo", objectId: "original-result" } },
  ] };
}
void test("only a complete native fulfilled Promise result is available to the separate original receiver proof", () => {
  const reply = captureCurrentMainStartupLibraryReturnReply(packet()); assert.equal(reply.resultObjectId, "original-result");
  assert.equal(JSON.stringify(reply.raw), JSON.stringify(packet()));
  for (const state of ["pending", "rejected", "Fulfilled"]) { assert.throws(() => captureCurrentMainStartupLibraryReturnReply(packet(state))); }
  assert.throws(() => captureCurrentMainStartupLibraryReturnReply(packet("fulfilled", "undefined")));
  assert.throws(() => captureCurrentMainStartupLibraryReturnReply({ result: [], internalProperties: [] }));
});
void test("return metadata proxies/accessors are rejected before their hooks can run", () => {
  let hooks = 0; const trap = (): never => { hooks += 1; throw new Error("hook"); };
  const accessor = {}; Object.defineProperty(accessor, "internalProperties", { get: trap });
  assert.throws(() => captureCurrentMainStartupLibraryReturnReply(accessor));
  assert.throws(() => captureCurrentMainStartupLibraryReturnReply(new Proxy({}, { ownKeys: trap, getPrototypeOf: trap })));
  assert.equal(hooks, 0);
});
