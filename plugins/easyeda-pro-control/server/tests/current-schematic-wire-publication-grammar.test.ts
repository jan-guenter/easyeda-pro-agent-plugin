import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicWireCmPublicationCursor } from "../src/current-schematic-wire-cm-publication-cursor.ts";
import { currentSchematicWireCmPublicationCases, currentSchematicWireCmPublicationTemplate, validateCurrentSchematicWireCmPublicationCommand as validateCm } from "../src/current-schematic-wire-cm-publication-protocol.ts";
import { currentSchematicWirePendingBatchCases, currentSchematicWirePendingBatchTemplate, validateCurrentSchematicWirePendingBatchCommand as validate } from "../src/current-schematic-wire-pending-batch-protocol.ts";

void test("Wire batch vocabulary refuses caller programs and copied reservations", () => {
  for (const command of currentSchematicWirePendingBatchCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWirePendingBatchTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-pending-batch-resume", method: "Debugger.resume", params: {} }));
  for (const command of currentSchematicWireCmPublicationCases()) { assert.deepEqual(validateCm(command), command); assert.ok(currentSchematicWireCmPublicationTemplate(command).template.length > 0); }
  const cursor = new CurrentSchematicWireCmPublicationCursor({ ordinal: 1, frame: "123.1.2", publisherFrame: "123.2.3", holder: "holder", native: "native", expected: [{ id: "wire", type: "WIRE", body: "{}" }, { id: "line", type: "LINE", body: "{}" }, { id: "attr", type: "ATTR", body: "{}" }] }); const command = cursor.next(); assert.ok(command !== null); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command); assert.throws(() => { cursor.accept(command, {}); }); assert.throws(() => cursor.next());
});
