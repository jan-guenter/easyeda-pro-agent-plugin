/** Passive grammar and actual readonly helpers. No original issuer is used. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_REQUESTS as REQUESTS, currentFootprintInverseGetIntrinsicsCases, currentFootprintInverseGetIntrinsicsNativeFrame, currentFootprintInverseGetIntrinsicsTemplate, currentFootprintInverseGetIntrinsicsWire, qualifyCurrentFootprintInverseGetIntrinsicsHelper, validateCurrentFootprintInverseGetIntrinsicsCommand } from "../src/current-footprint-inverse-get-intrinsics-protocol.ts";
import { currentFootprintInverseGetIntrinsicsNativeSource } from "../src/current-footprint-inverse-get-intrinsics-native.ts";

void test("all fixed GET intrinsic messages preserve readonly declarations, wire identity and dedicated bounds", () => {
  const cases = currentFootprintInverseGetIntrinsicsCases(); assert.equal(cases.length, 13); assert.equal(REQUESTS.cdpRequests, REQUESTS.calls + REQUESTS.properties + REQUESTS.helpers); assert.equal(REQUESTS.controls, REQUESTS.cdpRequests + 2);
  for (const command of cases) {
    const row = currentFootprintInverseGetIntrinsicsTemplate(command); let text = row.template;
    if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__get_intrinsics_program_${command.role}__`), JSON.stringify(CALLS[command.role].program)); assert.equal(command.params.throwOnSideEffect, true); qualifyCurrentFootprintInverseGetIntrinsicsHelper({ scriptSource: `(${command.params.functionDeclaration})` }, command.params.functionDeclaration); assert.throws(() => { qualifyCurrentFootprintInverseGetIntrinsicsHelper({ scriptSource: command.params.functionDeclaration }, command.params.functionDeclaration); }); }
    for (const name of row.names) { text = text.replace(JSON.stringify(`__get_intrinsics_${name}__`), JSON.stringify("original_ref")); } assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
    const bytes = Buffer.from(`${JSON.stringify(currentFootprintInverseGetIntrinsicsWire(command, 79, "original_ui"))}\0`); assert.equal(currentFootprintInverseGetIntrinsicsNativeFrame(bytes, command, "original_ui")["action"], "footprint-inverse-get-intrinsics"); assert.throws(() => currentFootprintInverseGetIntrinsicsNativeFrame(bytes, command, "foreign_ui"));
  }
  for (const phase of ["inverse-get-intrinsics-resume", "inverse-get-intrinsics-send", "inverse-get-intrinsics-delete"]) { assert.throws(() => validateCurrentFootprintInverseGetIntrinsicsCommand({ phase, method: "Debugger.resume", params: {} })); }
  const source = currentFootprintInverseGetIntrinsicsNativeSource(); assert.ok(source.includes("inverseLookupPreentryComplete") && source.includes("inverseLookupPreentryHeld") && source.includes("inverseGetIntrinsicsHelpers!=inverseGetIntrinsicsCalls")); assert.ok(!source.includes("Debugger.resume"));
});
