/** Native codec/source and original empty-factory regressions. The process
 * fixture is inert Node, never an application or Windows ownership proof. */
/* oxlint-disable import/max-dependencies -- Compare independent fixed vocabularies, source reservation and the genuine factory; no single mocked adapter can establish this boundary. */
import { expandCurrentPcbDiagnosticCSharpReviewSource, packCurrentPcbDiagnosticCSharpReviewStorage } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { applyCurrentProjectStructureNativeFragment } from "../src/current-project-structure-native-fragment.ts";
import { CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE as PROFILE } from "../src/current-project-structure-native-profile.ts";
import { currentProjectStructureWorkerNativeCases, currentProjectStructureWorkerNativeSource } from "../src/current-project-structure-worker-native.ts";
import { currentProjectStructureWorkerWire } from "../src/current-project-structure-worker-wire.ts";
import { currentPcb209WorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE } from "../src/current-footprint-copy-combined-profile.ts";
import { requireCurrentProjectStructureMainPlanTransportCapacity } from "../src/current-project-structure-main-wire.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

void test("dedicated structure source is idempotent, bounded and retains independent old-purpose limits", async () => {
  const helper = expandCurrentPcbDiagnosticCSharpReviewSource(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"));
  const next = applyCurrentProjectStructureNativeFragment(helper); assert.equal(applyCurrentProjectStructureNativeFragment(next), next);
  assert.ok(Buffer.byteLength(packCurrentPcbDiagnosticCSharpReviewStorage(next)) < 2 * 1024 * 1024); assert.match(next, /AdmitProjectStructureAction/u);
  assert.deepEqual([PROFILE.main.normal, PROFILE.main.cleanup, PROFILE.main.total], [59, 27, 86]);
  assert.deepEqual([PROFILE.worker.normal, PROFILE.worker.cleanup, PROFILE.worker.total], [897, 47, 944]);
  assert.equal(CURRENT_FOOTPRINT_COMBINED_PROFILE.main.requestLimit, 55); assert.equal(PROFILE.writerAuthorized, false);
  assert.equal(PROFILE.saveAuthorized, false); assert.equal(PROFILE.completeUploadFrontierVerified, false);
  assert.throws(() => applyCurrentProjectStructureNativeFragment(helper.replace(/public sealed (?:partial )?class EasyedaDiagnosticOwner \{\n {2}\[StructLayout/u, "public class ForeignOwner {\n  [StructLayout")), /FRAGMENT_ANCHOR/u);
});
void test("worker observer wire admits only fixed sites/programs on its own birth and reserves comparison text before arm", () => {
  const cases = currentProjectStructureWorkerNativeCases(); assert.equal(cases.length, 36);
  assert.match(currentProjectStructureWorkerNativeSource(), /EasyedaProjectStructureWorkerProtocol/u);
  for (const command of cases) {
    const wire = currentProjectStructureWorkerWire(command, PROFILE.worker.total); assert.equal(wire.request["action"], "structure-worker-send");
    assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false); assert.equal(Object.hasOwn(wire.request, "lineNumber"), false);
    if (wire.request["phase"] === "call-same") { currentPcb209WorkerStartupWire(command, 1); }
    else { assert.throws(() => currentPcb209WorkerStartupWire(command, 1)); }
    assert.throws(() => currentProjectStructureWorkerWire(command, PROFILE.worker.total + 1));
  }
  const command = cases.find(value => value.method === "Runtime.callFunctionOn"); assert.ok(command?.method === "Runtime.callFunctionOn");
  assert.throws(() => currentProjectStructureWorkerWire({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } }, 1));
  const plan = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 101, structureText: "small complete tree" };
  requireCurrentProjectStructureMainPlanTransportCapacity(plan);
  assert.throws(() =>{  requireCurrentProjectStructureMainPlanTransportCapacity({ ...plan, structureText: "x".repeat(32_768) }); }, /WIRE_BYTES/u);
});
void test("actual structure factory reserves a separate native birth and closes its original unlaunched helper", async context => {
  const f = await combinedReadyFactoryFixture("ready", "structure"), owner = await f.api.startCurrentProjectStructureNativeOwner(f.options);
  const child = f.child(); context.after(async () => { if (child.exitCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  assert.equal(owner.status().profile, PROFILE.purpose); assert.equal(owner.status().launchConsumed, false);
  assert.throws(() => owner.structureObservationInput({ profile: "private.current-project-structure-worker-lease.v1" }, false), /ORIGINAL_CONSTRUCTORS_REQUIRED/u);
  assert.throws(() => owner.combinedMainCapability(), /COMBINED_MAIN_CAPTURE_REQUIRED/u);
  assert.throws(() => owner.reserveFootprintCombinedAbort(), /COMBINED_ORIGINAL_ABORT_OWNER/u);
  await owner.releaseUnlaunched(); assert.deepEqual(f.state.actions, ["release-unlaunched"]); assert.equal(owner.status().helperClosed, true);
});
void test("failed structure readiness retains zero-input original closure and refuses diagnostics from equal options", async () => {
  const f = await combinedReadyFactoryFixture("wrong-challenge", "structure"); let stopped: unknown;
  await assert.rejects(f.api.startCurrentProjectStructureNativeOwner(f.options), (failure: unknown): boolean => { stopped = failure; return true; });
  const held = f.api.currentProjectStructureFactoryFailureDiagnostics(stopped, f.options);
  assert.ok(held !== null); assert.equal(held.helperClosed, true); assert.equal(held.stdinBytesWritten, 0); assert.equal(held.launchInvoked, false);
  assert.equal(f.api.currentProjectStructureFactoryFailureDiagnostics(stopped, { ...f.options }), null);
  assert.equal(f.state.writes, 0); assert.equal(f.child().exitCode, 0);
});
