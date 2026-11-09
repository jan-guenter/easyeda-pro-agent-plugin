/** Fixed encoder checks only; no original process or clock invocation exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbViaClockNativeCases } from "../src/current-pcb-via-clock-protocol.ts";
import { currentPcbViaClockTemplate, currentPcbViaClockWire } from "../src/current-pcb-via-clock-wire.ts";
import { currentPcbViaClockNativeSource } from "../src/current-pcb-via-clock-native.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";
import { requireOriginalCurrentPcbViaClockOrigin } from "../src/current-pcb-diagnostic-owner.ts";

const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("all37 clock cases keep initial SDK/worker receivers in native custody and fixed realms separate", () => {
  const cases = currentPcbViaClockNativeCases(); assert.equal(cases.length, 37);
  for (const command of cases) {
    const template = currentPcbViaClockTemplate(command); const realm = template.realm === "worker" ? "worker" : "ui";
    const wire = currentPcbViaClockWire(command, realm, 1); const encoded = bytes({ id: 1, ...wire.command, viaClockCommand: true, viaClockRealm: realm, sessionId: "original-session" });
    assert.deepEqual(currentPcbViaWriteNativeRequest(encoded), wire.request);
    assert.equal(wire.request["requestId"], 1);
    for (const key of ["action", "requestId", "phase", "method", "realm", "id", "jobId", "helperInstance", "rootCreated", "rootPid"]) { assert.equal(Object.hasOwn(template.fields, key), false); }
    if (command.phase === "via-clock-result") { assert.equal(wire.request["rpcRequestId"], 41); assert.notEqual(wire.request["rpcRequestId"], wire.request["requestId"]); }
    for (const key of ["sessionId", "uniqueContextId", "functionDeclaration", "condition", "expression", "arguments", "lineNumber", "columnNumber"]) { assert.equal(Object.hasOwn(wire.request, key), false); }
    if (command.phase === "via-clock-registration") { assert.equal(Object.hasOwn(wire.request, "objectId"), false); assert.ok(template.template.includes("__via_clock_boundSdk__")); }
    if (command.phase === "via-clock-worker") { assert.equal(Object.hasOwn(wire.request, "uniqueContextId"), false); assert.ok(template.template.includes("__via_clock_boundWorker__")); }
    if (template.realm !== "either") { assert.throws(() => currentPcbViaClockWire(command, realm === "worker" ? "ui" : "worker", 1)); }
    assert.throws(() => diagnosticNativeRequest(encoded)); assert.throws(() => spatialDiagnosticNativeRequest(encoded));
    assert.throws(() => currentPcbViaClockWire({ ...command, owner: "caller" }, realm, 1));
  }
  assert.match(currentPcbViaClockNativeSource(), /EasyedaDiagnosticFixedTable\.Load/u);
});
void test("matching clock origin JSON supplies no original Via owner, source, SDK binding or Save authority", () => {
  assert.throws(() => Reflect.apply(requireOriginalCurrentPcbViaClockOrigin, undefined, [{ profile: "private.current-pcb-via-clock-origin.v1" }, {}, {}]), /CLOCK_ORIGINAL/u);
});
