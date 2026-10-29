/** Actual lifecycle and factory registry with synthetic installation and a real
 * inert Node helper. No Windows resource or application claim is exercised. */
/* oxlint-disable import/max-dependencies -- This coupled negative-publication case needs the maintained lifecycle, actual factory registry, inert child and managed journal boundaries together. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { test } from "node:test";
import { transform } from "esbuild";
import { sha256Json } from "../src/core.ts";
import type { CurrentFootprintCombinedLifecycle, CurrentPcb209WorkerStartupLifecycleDependencies, CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

async function fixture(mode: "stderr-close" | "stderr-delayed-close", publicationFailure = false, forgedFailure = false): Promise<Readonly<{
  lifecycle: CurrentFootprintCombinedLifecycle; writes: () => number; close: () => Promise<void>;
}>> {
  const factory = await combinedReadyFactoryFixture(mode);
  const path = new URL("../src/current-pcb-diagnostic-lifecycle.ts", import.meta.url); const originalRequire = createRequire(path);
  const raw = await readFile(path, "utf8"), transformed = await transform(raw, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? {
    ...originalRequire(name), requireCurrentFootprintCombinedUnlaunchedFactoryFailure: factory.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure,
    currentFootprintCombinedFactoryFailureDiagnostics: factory.api.currentFootprintCombinedFactoryFailureDiagnostics,
  } : originalRequire(name) as unknown, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained class is transformed only to join its imported getter with the actual factory's separate private module registry.
  const Constructor = loaded.exports["CurrentFootprintCombinedLifecycle"] as typeof CurrentFootprintCombinedLifecycle;
  const options: CurrentPcbDiagnosticLifecycleOptions = { ...factory.options, assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", assertLocalAllowed: (): void => undefined,
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() };
  let failPublication = publicationFailure;
  let allocatedOptions: Parameters<typeof factory.api.startCurrentFootprintCombinedNativeOwner>[0] | null = null;
  let allocationError: unknown = null;
  const dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {
    allocateOwner: async current => {
      allocatedOptions = current;
      try {
        if (forgedFailure) { throw Object.assign(new Error("PCB_DIAGNOSTIC_OWNER_COMBINED_FACTORY_READY_FAILED"), {
          profile: "private.current-footprint-combined-before-launch-failure.v1", helperTransportClosed: true,
          launchRequestWritten: false, applicationLaunchDispatched: false, terminationProved: false,
        }); }
        return await factory.api.startCurrentFootprintCombinedNativeOwner(current);
      } catch (error) { allocationError = error; throw error; }
    },
    verifyInstallation: () => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) }),
    publishRecord: async (id, name, value): Promise<void> => {
      if (name === "combined-factory-before-launch.json" && failPublication) { failPublication = false; throw new Error("synthetic publication refusal"); }
      await publishCurrentPcbDiagnosticLifecycleRecord(id, name, value);
    },
  };
  return { lifecycle: new Constructor(options, dependencies), writes: (): number => factory.state.writes,
    close: async (): Promise<void> => {
      assert.ok(allocatedOptions !== null);
      if (factory.api.currentFootprintCombinedFactoryFailureDiagnostics(allocationError, allocatedOptions)?.helperClosed !== true) { await once(factory.child(), "close"); }
    } };
}
function launch(operationId: string): Record<string, unknown> { return { action: "launch", operationId,
  confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true }; }
for (const publicationFailure of [false, true]) {
  void test(`original closed pre-ready factory failure resolves only after terminal publication, publication failure=${String(publicationFailure)}`, async () => {
    const operationId = `footprint-combined-factory-${publicationFailure ? "publication" : "normal"}`; const f = await fixture("stderr-close", publicationFailure);
    await assert.rejects(f.lifecycle.run(launch(operationId)), /COMBINED_FACTORY_READY_FAILED|Combined factory failed/u);
    const before = await f.lifecycle.run({ action: "inspect", operationId });
    assert.equal(before["combinedFactoryBeforeLaunchRetained"], true); assert.equal(before["combinedFactoryBeforeLaunchPublished"], !publicationFailure);
    assert.doesNotMatch(JSON.stringify(before), /private-synthetic-diagnostic/u); assert.equal(f.writes(), 0);
    if (publicationFailure) {
      assert.equal(f.lifecycle.hasActiveReservation(), true);
      await f.lifecycle.run({ action: "cleanup-unlaunched", operationId, expectedIntentSha256: before["intentSha256"] });
    }
    const after = await f.lifecycle.run({ action: "inspect", operationId });
    assert.equal(after["state"], "factory-before-launch-failed"); assert.equal(after["combinedFactoryBeforeLaunchPublished"], true);
    assert.equal(f.lifecycle.hasActiveReservation(), false); assert.equal(f.writes(), 0);
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    await assert.rejects(f.lifecycle.run(launch(operationId)), /LAUNCH_CONSUMED/u);
  });
}
void test("late original helper close can settle its retained failure without replaying launch or any stdin write", async () => {
  const f = await fixture("stderr-delayed-close"), operationId = "footprint-combined-factory-late";
  await assert.rejects(f.lifecycle.run(launch(operationId)), /COMBINED_FACTORY_READY_FAILED|Combined factory failed/u);
  const before = await f.lifecycle.run({ action: "inspect", operationId });
  assert.equal(before["combinedFactoryBeforeLaunchPublished"], false); assert.equal(f.lifecycle.hasActiveReservation(), true);
  await f.close();
  await f.lifecycle.run({ action: "cleanup-unlaunched", operationId, expectedIntentSha256: before["intentSha256"] });
  assert.equal(f.lifecycle.hasActiveReservation(), false); assert.equal(f.writes(), 0); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("copied error fields cannot issue a factory terminal, and old intents cannot adopt the new terminal schema", async () => {
  const f = await fixture("stderr-close", false, true), operationId = "footprint-combined-factory-forged";
  await assert.rejects(f.lifecycle.run(launch(operationId)), /COMBINED_FACTORY_READY_FAILED/u);
  const inspected = await f.lifecycle.run({ action: "inspect", operationId });
  assert.equal(inspected["combinedFactoryBeforeLaunchRetained"], false); assert.equal(inspected["combinedFactoryBeforeLaunchPublished"], false);
  await assert.rejects(f.lifecycle.run({ action: "cleanup-unlaunched", operationId, expectedIntentSha256: inspected["intentSha256"] }), /NONDISPATCH_NOT_PROVED/u);
  const oldId = "footprint-combined-000-no-retroactive-proof";
  const oldIntent = diagnosticLifecycleRecordSchemas["intent.json"].parse({ schema: "easyeda-pro-control.footprint-combined-launch-intent.v1",
    operationId: oldId, createdAt: "2026-10-29T00:00:00.000Z", purpose: "worker-startup", facadeSha256: "a".repeat(64),
    installationSha256: "b".repeat(64), confirmValidationOnly: true, confirmDiagnosticLaunch: true,
    acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true });
  await publishCurrentPcbDiagnosticLifecycleRecord(oldId, "intent.json", oldIntent);
  await publishCurrentPcbDiagnosticLifecycleRecord(oldId, "combined-factory-before-launch.json", {
    schema: "easyeda-pro-control.footprint-combined-factory-before-launch.v1", operationId: oldId,
    createdAt: "2026-10-29T00:00:00.000Z", intentSha256: sha256Json(oldIntent),
    proof: { profile: "private.current-footprint-combined-before-launch-failure.v1", helperTransportClosed: true,
      launchRequestWritten: false, applicationLaunchDispatched: false, terminationProved: false },
  });
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /COMBINED_FACTORY_BEFORE_LAUNCH_CHAIN/u);
});
