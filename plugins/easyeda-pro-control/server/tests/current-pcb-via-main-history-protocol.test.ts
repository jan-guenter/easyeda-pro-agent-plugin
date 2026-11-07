/** Fixed source/handle codec only. No native owner or SQL is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_PCB_VIA_MAIN_HISTORY_CALLBACK_CONDITION as CONDITION, currentPcbViaMainHistoryNativeCases, validateCurrentPcbViaMainHistoryCommand } from "../src/current-pcb-via-main-history-protocol.ts";
import { currentPcbViaMainHistoryWire } from "../src/current-pcb-via-main-history-wire.ts";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";

void test("all fixed history cases contain only scalar native handles and retain the ordinary16KiB arbitrary-source guard", () => {
  const cases = currentPcbViaMainHistoryNativeCases(); assert.equal(cases.length, 82);
  for (const command of cases) { const wire = currentPcbViaMainHistoryWire(command, 79); assert.equal(wire.request["action"], "pcb-via-main-history");
    for (const key of ["functionDeclaration", "expression", "condition", "sql", "body", "cipherHex", "keyHex"]) { assert.equal(Object.hasOwn(wire.request, key), false); }
    assert.throws(() => validateCurrentPcbViaMainHistoryCommand({ ...command, grant: true }));
  }
  const join = cases.find(item => item.phase === "via-main-history-join" && item.role === "runData"); assert.ok(join?.phase === "via-main-history-join"); assert.ok(join.params.functionDeclaration.length > 16_384);
  assert.doesNotThrow(() => validateCurrentPcbViaMainHistoryCommand(join));
  assert.throws(() => validateCurrentPcbViaMainHistoryCommand({ ...join, params: { ...join.params, functionDeclaration: `${join.params.functionDeclaration} ` } }), /PCB_STRING_CLOCK_REPLY_CAPTURE/u);
  assert.throws(() => captureCurrentPcbStringClockReply({ source: join.params.functionDeclaration }), /PCB_STRING_CLOCK_REPLY_CAPTURE/u);
  const parts = Array.from({ length: 8 }, () => "0".repeat(8192)); assert.doesNotThrow(() => captureCurrentPcbStringClockReply({ result: { type: "object", value: { cipherHexParts: parts } } }));
});
void test("source/accessor/proxy failures cannot skip the callback guard or invoke caller hooks", () => {
  assert.equal(runInNewContext(CONDITION, { e: "select 1" }), false); assert.equal(runInNewContext(CONDITION, { e: "begin immediate transaction" }), true);
  assert.equal(runInNewContext(CONDITION, { e: "commit transaction" }), true); assert.equal(runInNewContext(CONDITION, {}), true);
  let calls = 0; const hook = (): never => { calls += 1; throw new Error("caller hook"); };
  const join = currentPcbViaMainHistoryNativeCases().find(item => item.phase === "via-main-history-join"); assert.ok(join?.phase === "via-main-history-join");
  const params = { ...join.params }; Object.defineProperty(params, "functionDeclaration", { enumerable: true, get: hook });
  assert.throws(() => validateCurrentPcbViaMainHistoryCommand({ ...join, params }));
  const proxy = new Proxy({ ...join.params }, { getPrototypeOf: hook, ownKeys: hook }); assert.throws(() => validateCurrentPcbViaMainHistoryCommand({ ...join, params: proxy })); assert.equal(calls, 0);
});
