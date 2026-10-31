/* oxlint-disable import/max-dependencies -- Exercise the actual public callback with its real controller, strict schemas, gate and cross-family journal guard; refuse before any checkpoint or native allocation. */
/** Mounted routing tests use actual index source and only synthetic facade
 * admission. They dispatch no native helper, application or cache request. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintHeldCacheValidation } from "../src/current-footprint-held-cache-validation.ts";
import { reserveFootprintHeldCacheValidation } from "../src/current-footprint-held-cache-validation-journal.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "../src/current-pcb-diagnostic-profile.ts";
import { SerializedGate } from "../src/engine.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

type Invoke = (input: { request: unknown; extra?: boolean }) => Promise<unknown>;
const operationId = "footprint-held-cache-registration";
const rawWindowsPath = String.raw`C:\EasyEDA\offline-held-registration.eprj2`;
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true,
  confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptCacheReadEffects: true,
  target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) } };
const wrap = (request: object): { request: object } => ({ request: { action: "footprint-held-cache", request } });

/** Extract the maintained registration, original receiver closure and descriptor
 * helpers without evaluating index bootstrap or replacing controller methods. */
async function fixture(blocked = true): Promise<Readonly<{ invoke: Invoke; schema: z.ZodType; scope: vm.Context;
  allocations: () => number; checks: () => number; options: () => CurrentPcbDiagnosticLifecycleOptions }>> {
  let allocations = 0, checks = 0, options: CurrentPcbDiagnosticLifecycleOptions | undefined;
  class Selected extends CurrentFootprintHeldCacheValidation {
    public constructor(input: CurrentPcbDiagnosticLifecycleOptions) { super(input); allocations += 1; options = input; }
  }
  const upstream = {};
  const engine = { upstream, controlFingerprintPromise: Promise.resolve(), executionAuthorityValidator: {},
    assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => {
      checks += 1; return blocked ? Promise.reject(new Error("synthetic unresolved engine operation")) : Promise.resolve();
    } };
  let registration: { invoke: Invoke; schema: z.ZodType } | undefined;
  const scope = vm.createContext({ z, currentPcb209WorkerStartupToolRequestSchema,
    CurrentFootprintHeldCacheValidation: Selected, CURRENT_PCB_DIAGNOSTIC_PROFILE, engine, upstream,
    bridgeGate: new SerializedGate(), diagnostic209: true, facadeMode: "public-utilities-only", facadeToolRegistered: (): boolean => true,
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "synthetic" } },
    resolve: (): string => "/synthetic/plugin", retainedControlRoot: { path: controlDataDirectory() }, controlDataDirectory,
    currentFootprintHeldCacheValidation: undefined, windowsRuntime: undefined, ordinaryLaunchRuntime: undefined,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined,
    currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined,
    currentSymbolOperationToolOutputSchema: z.object({ result: z.unknown() }),
    guarded: (handler: Invoke): Invoke => async input => { const result = await handler(input); return result; },
    server: { registerTool: (name: string, configuration: { inputSchema: z.ZodType; annotations: object }, handler: Invoke): void => {
      assert.equal(name, "easyeda_control_pcb209_worker_startup"); assert.equal(registration, undefined);
      assert.deepEqual(structuredClone(configuration.annotations), { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true });
      registration = { invoke: handler, schema: configuration.inputSchema };
    } },
  });
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const helper = source.indexOf("function disposableOwnData("), helperEnd = source.indexOf("function disposableIndexMethods(", helper);
  const owner = source.indexOf("  let heldCacheOriginal:"), ownerEnd = source.indexOf("  const runMain =", owner);
  const callback = source.indexOf('  if (facadeToolRegistered(facadeMode, "easyeda_control_pcb209_worker_startup"))'),
    callbackEnd = source.indexOf("  server.registerTool(diagnosticTool,", callback);
  for (const [start, end] of [[helper, helperEnd], [owner, ownerEnd], [callback, callbackEnd]] as const) {
    assert.ok(start > 0 && end > start && end - start < 30_000);
    vm.runInContext(stripTypeScriptTypes(source.slice(start, end)).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  }
  assert.ok(registration);
  return { ...registration, scope, allocations: (): number => allocations, checks: (): number => checks,
    options: (): CurrentPcbDiagnosticLifecycleOptions => { assert.ok(options); return options; } };
}

void test("offline held-cache query validates the same strict mounted grammar without issuing ownership", () => {
  const discovery = z.record(z.string(), z.unknown()).parse(queryOfflineApi(apiRequestSchema.parse({
    action: "footprint-held-cache", query: { includeSchemas: true } })).result);
  assert.equal(discovery["wrapperAction"], "footprint-held-cache"); assert.equal(discovery["readOnly"], true);
  for (const flag of ["nativeQualificationIssued", "runtimeAdmissionGranted", "replayTokenIssued", "writerAuthority", "saveAuthorized", "executionAuthorized"]) {
    assert.equal(discovery[flag], false);
  }
  for (const [request, valid] of [[launch, true], [{ ...launch, requestLimit: 9999 }, false],
    [{ ...launch, target: { ...launch.target, branchUuid: "a".repeat(32) } }, false], [{ action: "save", operationId }, false]] as const) {
    const result = z.record(z.string(), z.unknown()).parse(queryOfflineApi(apiRequestSchema.parse({
      action: "footprint-held-cache-validate", query: { request } })).result);
    assert.equal(result["valid"], valid); assert.equal(result["executionAuthorized"], false);
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse(wrap(request).request).success, valid);
  }
});

void test("mounted held-cache callback rejects authority injection and changed original controller methods before native allocation", async () => {
  const f = await fixture();
  for (const request of [wrap({ ...launch, requestLimit: 9999 }), wrap({ action: "save", operationId }),
    { ...wrap(launch), extra: true }, { request: { action: "footprint-held-cache", request: launch, targetId: "caller" } }]) {
    assert.equal(f.schema.safeParse(request).success, false); await assert.rejects(f.invoke(request));
  }
  assert.equal(f.allocations(), 0); assert.equal(f.checks(), 0);
  await assert.rejects(f.invoke(wrap(launch)), /synthetic unresolved engine operation/u);
  assert.equal(f.allocations(), 1); assert.equal(f.checks(), 1);
  const owner: unknown = f.scope["currentFootprintHeldCacheValidation"];
  assert.ok(owner instanceof CurrentFootprintHeldCacheValidation);
  assert.equal(owner.hasActiveReservation(), false); assert.equal(owner.hasOwnedAllocation(), false);
  Object.defineProperty(owner, "run", { configurable: true, value: (): never => assert.fail("Substituted controller must not run") });
  try { await assert.rejects(f.invoke(wrap({ action: "inspect", operationId })), /Original held-cache controller/u); }
  finally { Reflect.deleteProperty(owner, "run"); }
  f.options().assertLocalAllowed();
  f.scope["upstream"] = {};
  assert.throws(f.options().assertLocalAllowed, /Original held-cache controller/u);
});

void test("an unresolved held-cache reservation quarantines both shared diagnostic launches and the mounted held-cache callback", async () => {
  await reserveFootprintHeldCacheValidation("footprint-held-cache-unresolved-registration");
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_OWNER/u);
  const f = await fixture(false);
  await assert.rejects(f.invoke(wrap(launch)), /UNRESOLVED_OWNER/u);
  assert.equal(f.allocations(), 1); assert.equal(f.checks(), 1);
  const owner: unknown = f.scope["currentFootprintHeldCacheValidation"];
  assert.ok(owner instanceof CurrentFootprintHeldCacheValidation);
  assert.equal(owner.hasActiveReservation(), false); assert.equal(owner.hasOwnedAllocation(), false);
});
