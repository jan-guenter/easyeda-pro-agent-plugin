import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentPcb209RatlineCaptureReply } from "../src/current-pcb-209-ratline-capture-reply.ts";

const context = { role: "worker", scope: "full", pauseIndex: 6, site: "initialized", requestNumber: 45,
  command: "Runtime.callFunctionOn", expression: null, program: "empty" } as const;

void test("ratline rejected reply diagnostic copies bounded data without invoking getters or proxies", () => {
  let touched = 0;
  const inputs = [Object.defineProperty({}, "result", { enumerable: true, get: (): never => { touched += 1; throw new Error("Getter invoked"); } }),
    new Proxy({}, { ownKeys: (): never => { touched += 1; throw new Error("Proxy invoked"); } })];
  for (const input of inputs) {
    const captured = captureCurrentPcb209RatlineCaptureReply(input, context);
    assert.equal(captured.reply.status, "malformed"); assert.equal(captured.reply.value, null);
    assert.equal(captured.executionAuthorized, false);
  }
  assert.equal(touched, 0);
  const captured = captureCurrentPcb209RatlineCaptureReply({ result: { value: "x".repeat(32_769) } }, context);
  assert.equal(captured.reply.status, "oversized"); assert.equal(captured.reply.value, null); assert.equal(captured.reply.sha256, null);
});
