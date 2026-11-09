/** Fixed encoder checks only; no original process or clock invocation exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicDisplayClockNativeCases } from "../src/current-schematic-display-clock-protocol.ts";
import { currentSchematicDisplayClockTemplate, currentSchematicDisplayClockWire } from "../src/current-schematic-display-clock-wire.ts";
import { currentSchematicDisplayClockNativeSource } from "../src/current-schematic-display-clock-native.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";
import { requireOriginalCurrentSchematicDisplayClockOrigin } from "../src/current-pcb-diagnostic-owner.ts";

const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("all37 clock cases keep initial SDK/worker receivers in native custody and fixed realms separate", () => {
  const cases = currentSchematicDisplayClockNativeCases(); assert.equal(cases.length, 37);
  for (const command of cases) {
    const template = currentSchematicDisplayClockTemplate(command); const realm = template.realm === "worker" ? "worker" : "ui";
    const wire = currentSchematicDisplayClockWire(command, realm, 1); const encoded = bytes({ id: 1, ...wire.command, schematicClockCommand: true, schematicClockRealm: realm, sessionId: "original-session" });
    assert.deepEqual(currentSchematicDisplayWriteNativeRequest(encoded), wire.request);
    for (const key of ["sessionId", "uniqueContextId", "functionDeclaration", "condition", "expression", "arguments", "lineNumber", "columnNumber"]) { assert.equal(Object.hasOwn(wire.request, key), false); }
    if (command.phase === "schematic-clock-registration") { assert.equal(Object.hasOwn(wire.request, "objectId"), false); assert.ok(template.template.includes("__schematic_clock_boundSdk__")); }
    if (command.phase === "schematic-clock-worker") { assert.equal(Object.hasOwn(wire.request, "uniqueContextId"), false); assert.ok(template.template.includes("__schematic_clock_boundWorker__")); }
    if (template.realm !== "either") { assert.throws(() => currentSchematicDisplayClockWire(command, realm === "worker" ? "ui" : "worker", 1)); }
    assert.throws(() => diagnosticNativeRequest(encoded)); assert.throws(() => spatialDiagnosticNativeRequest(encoded));
    assert.throws(() => currentSchematicDisplayClockWire({ ...command, owner: "caller" }, realm, 1));
  }
  assert.match(currentSchematicDisplayClockNativeSource(), /EasyedaDiagnosticFixedTable\.Load/u);
});
void test("matching clock origin JSON supplies no original SCH owner, source, SDK binding or Save authority", () => {
  assert.throws(() => Reflect.apply(requireOriginalCurrentSchematicDisplayClockOrigin, undefined, [{ profile: "private.current-schematic-display-clock-origin.v1" }, {}, {}]), /CLOCK_ORIGINAL/u);
});
