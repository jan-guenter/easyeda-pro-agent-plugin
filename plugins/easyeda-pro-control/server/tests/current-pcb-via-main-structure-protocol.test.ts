/** Pure fixed/native projection only. No request, SQL, callback loan, body
 * reservation or response publication is owned by these structural inputs. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_FINAL_FUNCTION as FINAL } from "../src/current-pcb-via-main-structure-source.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS as LIMITS, CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS as PROGRAMS, currentPcbViaMainStructureNativeCases, validateCurrentPcbViaMainStructureCommand } from "../src/current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_EXPECTED_MARKER as MARKER, currentPcbViaMainStructureTemplate, currentPcbViaMainStructureWire } from "../src/current-pcb-via-main-structure-wire.ts";
import { decodeCurrentPcbViaMainStructureNativeAck } from "../src/current-pcb-via-main-structure-ack.ts";

void test("finite Via structure wire omits controller body and cannot arm or remove the original borrowed SQL callback", () => {
  const cases = currentPcbViaMainStructureNativeCases(); assert.equal(cases.length, 89); assert.equal(LIMITS.normal, 74); assert.equal(LIMITS.total, 88);
  for (const command of cases) { const wire = currentPcbViaMainStructureWire(command, 79); for (const field of ["structureText", "ticket", "projectUuid", "branchUuid", "functionDeclaration", "condition", "bodyGranted", "published"]) { assert.equal(Object.hasOwn(wire.request, field), false); } assert.throws(() => validateCurrentPcbViaMainStructureCommand({ ...command, authorized: true })); }
  const controller = cases.find(command => command.phase === "via-main-structure-join" && command.role === "controller"); assert.ok(controller !== undefined);
  assert.ok(currentPcbViaMainStructureTemplate(controller).template.includes(MARKER));
  const arm = cases.find(command => command.phase === "via-main-structure-arm"); assert.ok(arm?.phase === "via-main-structure-arm");
  assert.throws(() => validateCurrentPcbViaMainStructureCommand({ ...arm, role: "callback" }));
  assert.throws(() => validateCurrentPcbViaMainStructureCommand({ phase: "via-main-structure-remove", role: "callback", method: "Debugger.removeBreakpoint", params: { breakpointId: "original" } }));
  assert.throws(() => validateCurrentPcbViaMainStructureCommand({ phase: "via-main-structure-step", role: "finalFailed", method: "Debugger.resume", params: {} }));
});
void test("native windows remain per original pending call and original finalizer source is exact", () => {
  assert.equal(Buffer.byteLength(FINAL.source), FINAL.bytes); assert.equal(createHash("sha256").update(FINAL.source).digest("hex"), FINAL.sha256);
  assert.ok(PROGRAMS.controller.program.length < 16_384);
  const run = currentPcbViaMainStructureNativeCases().find(command => command.phase === "via-main-structure-step" && command.role === "run"); assert.ok(run !== undefined);
  assert.deepEqual(decodeCurrentPcbViaMainStructureNativeAck({ written: true, beforeEpochMs: 1000, afterEpochMs: 0 }, run), { beforeEpochMs: 1000, afterEpochMs: 0 });
  assert.throws(() => decodeCurrentPcbViaMainStructureNativeAck({ written: true, beforeEpochMs: 1000, afterEpochMs: 1001 }, run));
  const callback = currentPcbViaMainStructureNativeCases().find(command => command.phase === "via-main-structure-step" && command.role === "callback"); assert.ok(callback !== undefined);
  assert.throws(() => decodeCurrentPcbViaMainStructureNativeAck({ written: true, beforeEpochMs: 1000, afterEpochMs: 999 }, callback));
});
