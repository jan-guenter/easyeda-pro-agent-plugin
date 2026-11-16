/** Pure codec and emitted-ledger checks. No C# compilation, owner, Job,
 * application, original result token or persistence proof is constructed. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { currentFootprintInverseNativeDeleteCollateralNativeSource as legacySource } from "../src/current-footprint-inverse-native-delete-collateral-native.ts";
import { currentFootprintInverseNativeDeleteCollateralCases as cases, currentFootprintInverseNativeDeleteCollateralNativeFrame as legacyFrame, currentFootprintInverseNativeDeleteCollateralWire as legacyWire } from "../src/current-footprint-inverse-native-delete-collateral-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_POSTSTATE_DISPATCH as dispatch, currentFootprintInverseNativeDeletePoststateNativeSource as source } from "../src/current-footprint-inverse-native-delete-poststate-native.ts";
import { currentFootprintInverseNativeDeletePoststateNativeFrame as frame, validateCurrentFootprintInverseNativeDeletePoststateCommand as validate, currentFootprintInverseNativeDeletePoststateWire as wire } from "../src/current-footprint-inverse-native-delete-poststate-protocol.ts";

function emittedArray(text: string, name: string): unknown {
  const matched = new RegExp(`${name}=\\{([^}]+)\\}`, "u").exec(text); assert.ok(matched !== null); return JSON.parse(`[${matched[1]}]`);
}
void test("poststate reuses exact after syntax and CDP bytes under only its distinct action", () => {
  for (const command of cases().filter(value => value.round === "after")) {
    const payload = Buffer.from(`${JSON.stringify(wire(command, 79, "original_ui"))}${String.fromCodePoint(0)}`);
    const oldWire = legacyWire(command, 79, "original_ui");
    const oldPayload = Buffer.from(`${JSON.stringify(oldWire)}${String.fromCodePoint(0)}`);
    const expected = legacyFrame(oldPayload, command, "original_ui");
    const actual: Record<string, unknown> = frame(payload, command, "original_ui"); assert.equal(actual["round"], "after"); assert.deepEqual(actual, { ...expected, action: "footprint-inverse-native-delete-poststate" });
    assert.throws(() => validate({ ...command, round: "before" })); assert.throws(() => validate({ ...command, callerProgram: "foreign" }));
    assert.throws(() => wire(command, 2_147_483_648, "original_ui"));
    const maximum = Buffer.from(`${JSON.stringify(wire(command, 2_147_483_647, "original_ui"))}${String.fromCodePoint(0)}`); assert.equal(frame(maximum, command, "original_ui")["requestId"], 2_147_483_647);
    if (command.method === "Debugger.getScriptSource") { assert.equal(Object.hasOwn(actual, "role"), false); }
  }
});
void test("emitted V4 ledger retains five physical slots and original bindings without opening legacy after-round", () => {
  const old = legacySource(); const text = source(); assert.equal(legacySource(), old);
  const phases = ["inverse-native-delete-collateral-call", "inverse-native-delete-collateral-helper", "inverse-native-delete-collateral-call", "inverse-native-delete-collateral-helper", "inverse-native-delete-collateral-properties"];
  const roles = ["tabReprove", null, "storageReprove", null, "storage"];
  const methods = ["Runtime.callFunctionOn", "Debugger.getScriptSource", "Runtime.callFunctionOn", "Debugger.getScriptSource", "Runtime.getProperties"];
  assert.deepEqual(emittedArray(text, "DnpsPhases"), phases); assert.deepEqual(emittedArray(text, "DnpsRoles"), roles); assert.deepEqual(emittedArray(text, "DnpsMethods"), methods);
  const after = cases().filter(value => value.round === "after");
  const physical = phases.map((phase, index) => { const found = after.find(value => value.phase === phase && ("role" in value ? value.role : null) === roles[index]); assert.ok(found !== undefined); return found; });
  const packets = physical.map(command => `${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}${String.fromCodePoint(0)}`).join("");
  assert.ok(text.includes(createHash("sha256").update(packets).digest("hex")));
  assert.ok(text.includes("AssertDncl();AssertDnd();AssertNativeDeleteExecution();"));
  assert.ok(text.includes("!dnclComplete||!dndComplete||!ndcPrepared||!ndxRegistrationComplete||dnclFailed||dndFailed||ndcFailed||dnpsFailed"));
  assert.ok(text.includes('InverseDeleteBindingHandle(fields["reflection"])')); assert.ok(text.includes('InverseDeleteBindingHandle(fields["storage"])'));
  assert.ok(text.includes('fields["objectId"] as string!=dnpsReflection')); assert.ok(text.includes('fields["argument0"] as string!=(dnpsStep==0?ndcTabProof:ndcStorageProof)'));
  assert.ok(text.includes('fields["objectId"] as string!=dnpsStorage')); assert.ok(text.includes("dnpsStep!=5||dnpsCalls!=2||dnpsHelpers!=2||dnpsProperties!=1"));
  assert.ok(text.includes('copy.Remove("round");return FootprintInverseNativeDeleteCollateralMessage(')); assert.ok(text.indexOf("dnpsStep++;SendMessage(id,text)") > text.indexOf('throw DnpsError("original-proof")'));
  assert.equal(text.split("catch{dnpsFailed=true;throw;}").length - 1, 2);
  for (const closed of ["ndxReturned", "ndcAfterBound", "ndcAfterComplete", "ControlFootprintInverseNativeDeleteCollateral(", "SendFootprintInverseNativeDeleteCollateral("]) { assert.equal(text.includes(closed), false); }
  assert.ok(text.includes("object rawRole")); assert.ok(text.includes("rawRole!=null&&!(rawRole is string)")); assert.ok(text.includes('fields["round"] as string!="after"'));
  assert.ok(dispatch.includes("$FootprintInverseNativeContinuationV4")); assert.ok(dispatch.includes("$FootprintInverseNativeLifecycle209")); assert.ok(dispatch.includes("$request.requestId -ne 0"));
  assert.ok(dispatch.includes("$request.requestId -lt 1 -or $request.requestId -gt 2147483647")); assert.ok(dispatch.includes("$role=$null")); assert.equal(dispatch.includes("NullString"), false);
});
