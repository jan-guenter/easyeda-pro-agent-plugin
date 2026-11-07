/** Genuine generated data/journal joins with a deliberately synthetic owner.
 * Component preparation is the sole VM seam; no Windows or native process. */
/* oxlint-disable import/max-dependencies -- Original lifecycle, separately branded sources, schemas and checkpoint-only seam must meet at the complete journal boundary. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { CurrentPcbOrdinaryReadLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbComponentSpatialLifecycle, CurrentPcbDiagnosticLifecycleDependencies, CurrentPcbDiagnosticLifecycleOptions, CurrentPcbDiagnosticLifecycleOwner } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { assertGeneratedReaderClosedCaptureChain, diagnosticLifecycleRecordSchemas, readCurrentPcbDiagnosticLifecycles } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import { qualifyGeneratedPadFixtureInitialSql } from "../src/managed-pad-fixture-initial-sql.ts";
import { qualifyGeneratedComponentFixtureInitialSql } from "../src/managed-component-fixture-initial-sql.ts";
import { stageManagedPadFixtureOpeningSource } from "../src/managed-pad-fixture-opening-source.ts";
import { stageManagedComponentFixtureOpeningSource } from "../src/managed-component-fixture-opening-source.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

const unused = (): Promise<never> => Promise.reject(new Error("unexpected synthetic route"));
async function fixture(context: TestContext, component = false, wrongReport = false): Promise<Readonly<{
  lifecycle: CurrentPcbOrdinaryReadLifecycle | CurrentPcbComponentSpatialLifecycle; operationId: string; request: (action: string) => Promise<Record<string, unknown>>;
  captures: () => number; released: () => boolean;
}>> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  const input = await managedFixtureInitialSqlFixture(undefined, component ? "component-circular-smt-pad" : "circular-smt-pad-only");
  const qualified = component ? await qualifyGeneratedComponentFixtureInitialSql(input) : await qualifyGeneratedPadFixtureInitialSql(input);
  const operationId = component ? "pcb209-spatial-component-capture-chain" : `pcb209-ordinary-test-pad-capture-${wrongReport ? "wrong" : "valid"}`;
  let bound = false; let closed = false; let released = false; let captures = 0;
  const binding = Object.freeze({ helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" });
  const owner: CurrentPcbDiagnosticLifecycleOwner & Partial<Pick<CurrentPcbDiagnosticOwner, "openGeneratedComponentFixtureProject" | "openGeneratedFixtureProject" | "retainedGeneratedFixtureRegistration">> = {
    status: () => ({ profile: component ? "pcb-component-spatial209" : "diagnostic209", stringPrecreateConsumed: false, helperPid: 456, binding: bound ? binding : null, failure: null, busy: false,
      launchConsumed: bound, closeConsumed: closed, released, helperClosed: released, browserObservationConsumed: false, frameInspectionConsumed: false, scriptInspectionConsumed: false,
      diagnosticFailure: null, diagnosticFailureObservation: null, projectOpeningConsumed: false, projectOpeningResult: null, modelObservationConsumed: false, pcbOpeningConsumed: false,
      pcbOpeningResult: null, pcbObservationConsumed: false, pcbFrameObservation: null, pcbSourceQualified: false, nativeLaunchError: null, nativeSendError: null, createProcessError: null, noProcessCleanupAvailable: false, cleanupOnly: false,
      frameWorkerVerified: false, executionAuthorized: false, generatedFixtureRegistrationPurpose: true }),
    launch: () => { bound = true; return Promise.resolve(binding); }, observeApplicationWindow: () => Promise.resolve("12345"),
    requestNormalClose: () => { closed = true; return Promise.resolve(); }, observeTermination: () => Promise.resolve(closed), releaseClosed: () => { assert.equal(closed, true); released = true; return Promise.resolve(); },
    releaseUnlaunched: unused, releaseNoProcess: unused, browserObservation: unused, inspectFrames: unused, inspectScript: unused, inspectWorkers: unused, inspectWorkerScript: unused,
    observeWorkerState: unused, observeModelState: unused, openProject: unused, openPcb: unused, observePcbOpening: unused, openGeneratedFixtureProject: unused, openGeneratedComponentFixtureProject: unused,
    retainedGeneratedFixtureRegistration: () => null, reserveComponentSpatialAbort: () => { throw new Error("unused synthetic abort"); }, dispatchComponentSpatialAbort: unused, observeComponentSpatial209: unused,
    observeLayers209: unused, observePrimitives209: unused, observeExtendedPrimitives209: unused, observeSelectionRelations209: unused, observePadShapes209: unused, observeImageShapes209: unused, observeArcShapes209: unused, observePouredShapes209: unused,
  };
  const prepared = Object.freeze({ qualification: qualified.qualification, preparationCheckpoint: Object.freeze({ sha256: "d".repeat(64) }) });
  let reportSchema = "easyeda-pro-control.generated-pad-reader-closed-snapshot.v1";
  if (component) { reportSchema = "easyeda-pro-control.generated-component-reader-closed-snapshot.v1"; }
  else if (wrongReport) { reportSchema = "easyeda-pro-control.generated-reader-closed-snapshot.v1"; }
  const capture = (): Readonly<Record<string, unknown>> => ({ schema: reportSchema,
    projectUuid: qualified.qualification.target.projectUuid, originalQualificationSha256: sha256Json(qualified.qualification), rawWindowsPath: qualified.qualification.target.rawWindowsPath,
    ...(component ? { originalPreparationCheckpointSha256: prepared.preparationCheckpoint.sha256 } : {}), writerAuthority: false, completeSqlEffectsAccepted: false });
  const options: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "a".repeat(64), powershellBytes: 1,
    assertLocalAllowed: (): void => { assert.equal(root, process.env["EASYEDA_CONTROL_DATA_DIR"]); }, assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve(),
    ...(qualified.qualification.schema === "easyeda-pro-control.qualified-generated-component-fixture-target.v1" ? { generatedComponentSource: stageManagedComponentFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive }) } : { generatedFixtureSource: stageManagedPadFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive }) }) };
  const dependencies: CurrentPcbDiagnosticLifecycleDependencies = { verifyInstallation: () => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) }), allocateOwner: () => Promise.resolve(owner),
    captureGeneratedClosedData: async value => { captures += 1; value.assertOriginalOwner(); await value.observeOriginalTermination(); assert.equal(value.source.qualification, qualified.qualification); return capture(); },
    captureComponentGeneratedClosedData: async value => { captures += 1; value.assertOriginalOwner(); await value.observeOriginalTermination(); assert.equal(value.source.qualification, qualified.qualification); assert.equal(value.prepared, prepared); return capture(); } };
  let lifecycle: CurrentPcbOrdinaryReadLifecycle | CurrentPcbComponentSpatialLifecycle;
  if (component) {
    const url = new URL("../src/current-pcb-diagnostic-lifecycle.ts", import.meta.url);
    const sourceRequire = createRequire(url);
    const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
    const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
    Reflect.apply(evaluate, undefined, [(name: string): unknown => { const actual: unknown = sourceRequire(name); if (name !== "./managed-component-fixture-generated-open-checkpoint.ts") { return actual; }
      assert.ok(actual !== null && typeof actual === "object"); return { ...actual, prepareGeneratedComponentFixtureOpenCheckpoint: (): Promise<object> => Promise.resolve(prepared) }; }, loaded, loaded.exports]);
    const Constructor = loaded.exports["CurrentPcbComponentSpatialLifecycle"]; assert.ok(typeof Constructor === "function");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual production lifecycle; only its initial checkpoint preparer is an explicit inert seam, never native authority.
    lifecycle = Reflect.construct(Constructor, [options, dependencies]) as CurrentPcbComponentSpatialLifecycle;
  } else { lifecycle = new CurrentPcbOrdinaryReadLifecycle(options, dependencies); }
  const request = async (action: string): Promise<Record<string, unknown>> => {
    const inspected = await lifecycle.run({ action: "inspect", operationId });
    return lifecycle.run({ action, operationId, expectedBindingSha256: inspected["bindingSha256"], ...(action.startsWith("capture-") ? { confirmReadClosedFixture: true } : {}) });
  };
  context.after(async () => { if (!released && bound) { if (!closed) { const inspected = await lifecycle.run({ action: "inspect", operationId }); await lifecycle.run({ action: "normal-close", operationId, expectedBindingSha256: inspected["bindingSha256"], hwnd: "12345", confirmNormalClose: true }); } await request("observe-termination"); await request("release-closed"); } });
  await lifecycle.run({ action: "launch", operationId, ...(component ? { confirmValidationOnly: true } : { confirmOrdinaryReadOnly: true }), confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true });
  return { lifecycle, operationId, request, captures: () => captures, released: () => released };
}
void test("actual Pad report schema chains to its genuine initial qualification and original helper release", async context => {
  const f = await fixture(context); await assert.rejects(f.request("capture-generated-closed"), /CAPTURE_UNAVAILABLE/u); assert.equal(f.captures(), 0);
  const inspected = await f.lifecycle.run({ action: "inspect", operationId: f.operationId });
  await f.lifecycle.run({ action: "normal-close", operationId: f.operationId, expectedBindingSha256: inspected["bindingSha256"], hwnd: "12345", confirmNormalClose: true }); await f.request("observe-termination");
  await f.request("capture-generated-closed"); assert.equal(f.captures(), 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(row => row.operationId === f.operationId); assert.ok(operation !== undefined);
  const intent = operation.records["generated-closed-capture-intent.json"], result = operation.records["generated-closed-capture-result.json"]; assert.ok(intent !== undefined && result !== undefined);
  assert.equal(intent.schema, "easyeda-pro-control.generated-pad-reader-closed-capture-intent.v1"); assert.equal(result.report?.["schema"], "easyeda-pro-control.generated-pad-reader-closed-snapshot.v1");
  const oldIntent = diagnosticLifecycleRecordSchemas["generated-closed-capture-intent.json"].parse({ schema: "easyeda-pro-control.generated-reader-closed-capture-intent.v1", operationId: intent.operationId, createdAt: intent.createdAt, terminationSha256: intent.terminationSha256, originalQualificationSha256: intent.originalQualificationSha256, target: intent.target, readOnlyDataCapture: true });
  assertGeneratedReaderClosedCaptureChain({ ...operation, records: { ...operation.records, "generated-closed-capture-intent.json": oldIntent, "generated-closed-capture-result.json": { ...result, intentSha256: sha256Json(oldIntent) } } });
  await assert.rejects(f.request("capture-generated-closed"), /CAPTURE_UNAVAILABLE/u); await f.request("release-closed"); assert.equal(f.released(), true);
});
void test("cross-schema Pad report refuses before result publication and still allows original cleanup", async context => {
  const f = await fixture(context, false, true), inspected = await f.lifecycle.run({ action: "inspect", operationId: f.operationId });
  await f.lifecycle.run({ action: "normal-close", operationId: f.operationId, expectedBindingSha256: inspected["bindingSha256"], hwnd: "12345", confirmNormalClose: true }); await f.request("observe-termination");
  await assert.rejects(f.request("capture-generated-closed"), /REPORT_CHAIN/u); assert.equal(f.captures(), 1);
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined);
  await assert.rejects(readFile(join(root, "pcb-diagnostic-lifecycle-v1", f.operationId, "generated-closed-capture-result.json")), /ENOENT/u);
  await f.request("release-closed"); assert.equal(f.released(), true);
});
void test("Component has a distinct consumed closed action/report/checkpoint chain and releases its original owner", async context => {
  const f = await fixture(context, true); await assert.rejects(f.request("capture-generated-closed"));
  await assert.rejects(f.request("capture-component-generated-closed"), /CAPTURE_UNAVAILABLE/u); assert.equal(f.captures(), 0);
  const inspected = await f.lifecycle.run({ action: "inspect", operationId: f.operationId });
  await f.lifecycle.run({ action: "normal-close", operationId: f.operationId, expectedBindingSha256: inspected["bindingSha256"], hwnd: "12345", confirmNormalClose: true }); await f.request("observe-termination");
  await f.request("capture-component-generated-closed"); assert.equal(f.captures(), 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(row => row.operationId === f.operationId); assert.ok(operation !== undefined);
  const result = operation.records["component-generated-closed-capture-result.json"]; assert.ok(result !== undefined);
  assert.equal(result.report?.["schema"], "easyeda-pro-control.generated-component-reader-closed-snapshot.v1"); assert.equal(operation.records["generated-closed-capture-intent.json"], undefined);
  assert.equal(result.writerAuthority, false); assert.equal(result.executionAuthorized, false); assert.equal(canonicalJson(result).includes("nativeComponentCacheQualified\":true"), false);
  await assert.rejects(f.request("capture-component-generated-closed"), /CAPTURE_UNAVAILABLE/u); await f.request("release-closed"); assert.equal(f.released(), true);
});
