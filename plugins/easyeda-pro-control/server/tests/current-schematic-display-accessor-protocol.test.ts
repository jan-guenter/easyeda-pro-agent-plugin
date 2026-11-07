import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_CALLS } from "../src/current-schematic-display-accessor-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_REQUESTS, currentSchematicDisplayAccessorNativeCases, validateCurrentSchematicDisplayAccessorCommand } from "../src/current-schematic-display-accessor-protocol.ts";
import { currentSchematicDisplayAccessorWire } from "../src/current-schematic-display-accessor-wire.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { requireOriginalCurrentSchematicDisplayAccessorOrigin } from "../src/current-pcb-diagnostic-owner.ts";

void test("all seven fixed accessor cases retain native original holder/data custody and cannot express action, SQL or caller code", () => {
  for (const source of Object.values(CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_CALLS)) { assert.equal(typeof runInContext(`(${source})`, createContext({})), "function"); }
  const cases = currentSchematicDisplayAccessorNativeCases(); assert.equal(cases.length, 7);
  for (const command of cases) {
    const fixed = currentSchematicDisplayAccessorWire(command, 1); const encoded = Buffer.from(`${JSON.stringify({ id: 1, ...fixed.command, schematicAccessorCommand: true, sessionId: "original-ui" })}\0`);
    assert.deepEqual(currentSchematicDisplayWriteNativeRequest(encoded), fixed.request); assert.throws(() => currentPcbViaWriteNativeRequest(encoded));
    for (const key of ["functionDeclaration", "targetJson", "operationJson", "holderObjectId", "sessionId", "expression", "arguments"]) { assert.equal(Object.hasOwn(fixed.request, key), false); }
    assert.throws(() => validateCurrentSchematicDisplayAccessorCommand({ ...command, realm: "caller" }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentSchematicDisplayAccessorCommand({ ...command, params: { ...command.params, throwOnSideEffect: false } })); }
  }
  assert.equal(CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_REQUESTS.normal, 234); assert.equal(CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_REQUESTS.total, 235);
  assert.throws(() => Reflect.apply(requireOriginalCurrentSchematicDisplayAccessorOrigin, undefined, [{ profile: "private.current-schematic-display-accessor-origin.v1" }, {}, {}]), /ACCESSOR_ORIGINAL/u);
});
