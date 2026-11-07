/** Fixed UI bytes only. Synthetic packets issue no intrinsic or owner grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_UI_OWN_DATA_PROGRAMS as P, CURRENT_FOOTPRINT_INVERSE_UI_OWN_DATA_REQUESTS as REQUESTS, currentFootprintInverseUiOwnDataCases, currentFootprintInverseUiOwnDataNativeFrame, currentFootprintInverseUiOwnDataTemplate, currentFootprintInverseUiOwnDataWire, validateCurrentFootprintInverseUiOwnDataCommand } from "../src/current-footprint-inverse-ui-own-data-protocol.ts";
import { currentFootprintInverseOwnDataCases, validateCurrentFootprintInverseOwnDataCommand } from "../src/current-footprint-inverse-own-data-protocol.ts";

void test("UI intrinsic vocabulary shares only inert programs and rejects worker receipt commands", () => {
  const cases = currentFootprintInverseUiOwnDataCases(); assert.equal(cases.length, 20); assert.equal(REQUESTS.cdpRequests, 23); assert.equal(REQUESTS.controls, 25);
  for (const command of cases) { const row = currentFootprintInverseUiOwnDataTemplate(command); let encoded = row.template; if (command.method === "Runtime.callFunctionOn") { const role = command.phase.slice("inverse-ui-own-data-".length); assert.ok(role === "literal" || role === "bind" || role === "identities" || role === "reprove"); encoded = encoded.replace(JSON.stringify(`__inverse_ui_own_data_program${role}__`), JSON.stringify(P[role])); } for (const name of row.names) { encoded = encoded.replace(JSON.stringify(`__inverse_ui_own_data_${name}__`), JSON.stringify(name === "uniqueContextId" ? "original_context" : "original_ref")); } assert.deepEqual(JSON.parse(encoded), { method: command.method, params: command.params }); assert.throws(() => validateCurrentFootprintInverseOwnDataCommand(command));
    const wire = currentFootprintInverseUiOwnDataWire(command, 79, "original_ui"); const fields = currentFootprintInverseUiOwnDataNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`), command, "original_ui"); assert.equal(fields["action"], "footprint-inverse-ui-own-data"); assert.throws(() => currentFootprintInverseUiOwnDataNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`), command, "foreign_ui"));
  }
  for (const command of currentFootprintInverseOwnDataCases()) { assert.throws(() => validateCurrentFootprintInverseUiOwnDataCommand(command)); }
  for (const phase of ["inverse-ui-own-data-resume", "inverse-ui-own-data-restore", "inverse-ui-own-data-delete"]) { assert.throws(() => validateCurrentFootprintInverseUiOwnDataCommand({ phase, method: "Debugger.resume", params: {} })); }
});
