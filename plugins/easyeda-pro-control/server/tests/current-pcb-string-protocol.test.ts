import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { diagnosticNativeRequest, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION, CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION } from "../src/current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, currentPcbStringScopeCommand, currentPcbStringWorkerCommand } from "../src/current-pcb-string-commands.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION } from "../src/current-pcb-string-empty-producers.ts";

function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
const COMMANDS = [
  currentPcbStringScopeCommand("renderer-association", "scope", "callback"),
  currentPcbStringWorkerCommand("context"),
  currentPcbStringScopeCommand("empty-producers", "scope", "callback", "constructors"),
] as const;
void test("separate String native protocol accepts exactly three fixed precreate programs without forwarding code", () => {
  assert.equal(CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, 112);
  for (const { stringPhase, ...command } of COMMANDS) {
    const encoded = wire({ id: 112, ...command, sessionId: "original" });
    const result = stringPrecreateNativeRequest(encoded);
    assert.equal(result["stringPhase"], stringPhase); assert.equal(result["requestId"], 112);
    assert.equal(result["sessionId"], "original");
    for (const field of ["params", "expression", "functionDeclaration", "arguments", "timeout"]) {
      assert.equal(Object.hasOwn(result, field), false);
    }
    assert.throws(() => diagnosticNativeRequest(encoded), /OUTBOUND/u);
    assert.throws(() => diagnosticNativeRequest(wire({ id: 1, ...command, sessionId: "original" })), /OUTBOUND/u);
    assert.throws(() => stringPrecreateNativeRequest(wire({ id: 113, ...command, sessionId: "original" })), /OUTBOUND/u);
  }
  assert.deepEqual(stringPrecreateNativeRequest(wire({ id: 112, method: "Target.getTargets" })),
    { action: "send", requestId: 112, method: "Target.getTargets" });
  assert.throws(() => diagnosticNativeRequest(wire({ id: 83, method: "Target.getTargets" })), /OUTBOUND/u);
});
void test("String native protocol rejects caller code, effect overrides, extra arguments and public phase routing", () => {
  for (const { stringPhase, ...command } of COMMANDS) {
    for (const changed of [
      { ...command.params, throwOnSideEffect: false }, { ...command.params, awaitPromise: true },
      { ...command.params, silent: false }, { ...command.params, userGesture: true },
      { ...command.params, generatePreview: true }, { ...command.params, returnByValue: false },
      { ...command.params, executionContextId: 1 },
      { ...command.params, ...(command.method === "Runtime.evaluate" ? { expression: "globalThis" } : { functionDeclaration: "function(){}" }) },
    ]) {
      assert.throws(() => stringPrecreateNativeRequest(wire({ id: 1, ...command, params: changed, sessionId: "original" })), /OUTBOUND/u);
    }
    assert.throws(() => stringPrecreateNativeRequest(wire({ id: 1, ...command, stringPhase, sessionId: "original" })), /OUTBOUND/u);
  }
});
void test("String programs are byte-exact in the native fixed-purpose adapter", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  for (const [name, source] of Object.entries({
    StringRendererAssociationFunction: CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION,
    StringWorkerAssociationExpression: CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION,
    StringEmptyProducersFunction: CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION,
  })) {
    const encoded = new RegExp(`const string ${name}=@"((?:""|[^"])*)";`, "u").exec(native)?.[1];
    assert.equal(encoded?.replaceAll('""', '"'), source, name);
    assert.ok(native.includes(createHash("sha256").update(source).digest("hex")));
  }
  assert.ok(native.includes('if(!stringPrecreate) throw Error("string-purpose");'));
  assert.ok(native.includes("readonly bool stringPrecreate;"));
  assert.ok(native.includes("public EasyedaDiagnosticOwner() { }"));
  assert.ok(native.includes("return new EasyedaDiagnosticOwner(true);"));
  assert.ok(native.includes("if (-not $StringPrecreate) {throw 'pcb-diagnostic-string-purpose'}"));
});
