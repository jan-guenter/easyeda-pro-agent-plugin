/** The mounted path is readonly qualification. These source/forgery cases do
 * not create an original Core, UI sender, native process, Call or worker Job. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintInverseNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { requireOriginalCurrentFootprintInverseNativeDeleteQualification } from "../src/current-footprint-inverse-native-delete-qualification.ts";
import { qualifyCurrentFootprintInverseNativeDeleteQualificationSource } from "../src/current-footprint-inverse-native-delete-qualification-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_QUALIFICATION_DISPATCH as DISPATCH, currentFootprintInverseNativeDeleteQualificationNativeSource } from "../src/current-footprint-inverse-native-delete-qualification-native.ts";
import { validateCurrentFootprintInverseNativeDeleteSenderReadCommand as readonly, currentFootprintInverseNativeDeleteSenderCases as senderCases } from "../src/current-footprint-inverse-native-delete-sender-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";
import type { CurrentFootprintInverseNativeDeleteIntent } from "../src/current-footprint-inverse-native-delete-intent.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "../src/current-footprint-copy-held-saved-generation.ts";

void test("fresh native qualification refuses every invocation/frame/arm phase and reserves unchanged complete alternate groups", () => {
  let accepted = 0; for (const command of senderCases()) { if (command.phase === "inverse-native-delete-sender-invoke" || command.phase === "inverse-native-delete-sender-frame" || command.phase === "inverse-native-delete-sender-arm" || command.phase === "inverse-native-delete-sender-call" && command.role === "entry") { assert.throws(() => readonly(command)); } else { assert.deepEqual(readonly(command), command); accepted += 1; } } assert.equal(accepted, 14);
  assert.equal(PROFILE.renderer.total, 27_705); assert.equal(PROFILE.controls, 182_736); assert.equal(PROFILE.main.reproofs, 103_376);
  const native = currentFootprintInverseNativeDeleteQualificationNativeSource(); assert.ok(native.includes("AssertInverseNativeDeleteFresh();") && native.includes("inverseNativeDeleteBootstrapCompleted")); assert.ok(!native.includes("Debugger.resume") && !native.includes("sender-invoke") && !native.includes("setBreakpoint")); assert.equal(DISPATCH.split("        'footprint-inverse-native-delete-sender' {").length, 2); assert.equal(DISPATCH.split("        'footprint-inverse-native-delete-registration' {").length, 2);
});
void test("a copied owner, intent or qualification cannot enter Core and source accessors/Proxies remain uncalled", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forged owner data must fail the original Core registry before any request.
  const owner = Object.create(CurrentFootprintInverseNativeOwner.prototype) as CurrentFootprintInverseNativeOwner; const intent: CurrentFootprintInverseNativeDeleteIntent = Object.freeze({ profile: "private.current-footprint-inverse-native-delete-intent.v1" }); const token = Object.freeze({ profile: "private.current-footprint-inverse-native-delete-qualification.v1" as const });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Equal-shaped checkpoint data must not enroll a qualification.
  assert.throws(() => owner.observeFootprintInverseNativeDeleteQualification(intent)); assert.throws(() => requireOriginalCurrentFootprintInverseNativeDeleteQualification(token, owner, {} as CurrentFootprintForwardSavedCheckpoint));
  let getters = 0, traps = 0; const accessor = Object.defineProperty({}, "scriptSource", { get: (): string => { getters += 1; return "forged"; }, enumerable: true }); const proxy = new Proxy({}, { getOwnPropertyDescriptor: (): undefined => { traps += 1; return undefined; }, ownKeys: (): never[] => { traps += 1; return []; }, getPrototypeOf: (): null => { traps += 1; return null; } });
  for (const input of [accessor, proxy, { scriptSource: "forged" }, { scriptSource: "forged", nativeJob: true }]) { assert.throws(() => { qualifyCurrentFootprintInverseNativeDeleteQualificationSource(input, "ui"); }); assert.throws(() => { qualifyCurrentFootprintInverseNativeDeleteQualificationSource(input, "manager"); }); } assert.equal(getters, 0); assert.equal(traps, 0);
});
