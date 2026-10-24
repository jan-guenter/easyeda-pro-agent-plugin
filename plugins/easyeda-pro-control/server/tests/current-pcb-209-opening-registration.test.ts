/** Executes the actual public registration/callback with isolated collaborators.
 * The 209 lifecycle uses its real inherited run and default dependencies; no
 * native launch is attempted because the original engine admission refuses. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { CurrentPcb209DiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "../src/current-pcb-diagnostic-profile.ts";
import { currentPcbDiagnosticToolRequestSchema } from "../src/current-pcb-diagnostic-validation.ts";
import { currentPcb209OpeningRequestSchema } from "../src/current-pcb-209-opening-validation.ts";
// oxlint-disable-next-line import/max-dependencies -- Keep actual mode selection, schemas and lifecycle together at this registration boundary.
import { facadeToolRegistered } from "../src/facade-mode.ts";

function forbiddenLegacyLifecycle(): never { assert.fail("209 registration selected a legacy diagnostic or worker-startup lifecycle"); }

void test("209 public opening callback selects the original 209 lifecycle and rejects wider/caller-selected routes before allocation", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_diagnostic_validation") ||');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",', start + 1);
  const helpers = source.slice(source.indexOf("function disposableOwnData("), source.indexOf("function disposableIndexMethods("));
  assert.ok(start > 0 && end > start);
  type Invoke = (input: { request: unknown; extra?: boolean }) => Promise<unknown>;
  let inputSchema: z.ZodType | undefined, invoke: Invoke | undefined, options: CurrentPcbDiagnosticLifecycleOptions | undefined;
  let allocations = 0, checks = 0, gateCalls = 0, wrappers = 0;
  let blocked = true;
  let pendingAdmission: Promise<null> | undefined;
  class Selected209Lifecycle extends CurrentPcb209DiagnosticLifecycle {
    public constructor(input: CurrentPcbDiagnosticLifecycleOptions) { super(input); allocations += 1; options = input; }
  }
  assert.equal(Object.hasOwn(Selected209Lifecycle.prototype, "run"), false);
  assert.equal(Object.hasOwn(CurrentPcb209DiagnosticLifecycle.prototype, "run"), false);
  const environment = { EASYEDA_ASSETS_ROOT: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", WSL_DISTRO_NAME: "Ubuntu" };
  const authority = {}, facadePromise = Promise.resolve({ sha256: "a".repeat(64) }), upstream = {};
  const engine = { upstream, executionAuthorityValidator: authority, controlFingerprintPromise: facadePromise,
    assertDiagnosticLaunchOtherOperationsSettled: async (): Promise<void> => {
      checks += 1; if (blocked) { throw new Error("synthetic unresolved engine journal"); }
      if (pendingAdmission !== undefined) { await pendingAdmission; }
    } };
  const scope = vm.createContext({ z, currentPcb209OpeningRequestSchema, currentPcbDiagnosticToolRequestSchema,
    CURRENT_PCB_DIAGNOSTIC_PROFILE, CurrentPcb209DiagnosticLifecycle: Selected209Lifecycle,
    CurrentPcbDiagnosticLifecycle: forbiddenLegacyLifecycle, CurrentPcbWorkerStartupLifecycle: forbiddenLegacyLifecycle,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, currentPcbWorkerStartupLifecycle: undefined,
    process: { env: environment }, engine, upstream, facadeMode: "public-utilities-only", facadeToolRegistered,
    bridgeGate: { run: (handler: () => Promise<unknown>): Promise<unknown> => { gateCalls += 1; return handler(); } },
    retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    resolve: (): string => "/synthetic/plugin", currentSymbolOperationToolOutputSchema: z.object({ result: z.unknown() }),
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, currentDisposableOpenCoordinator: undefined,
    currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    guarded: (handler: Invoke): Invoke => {
      wrappers += 1;
      return async input => { const result = await handler(input); return result; };
    },
    server: { registerTool: (name: string, configuration: { inputSchema: z.ZodType;
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean } }, handler: Invoke): void => {
      assert.equal(name, "easyeda_control_pcb209_opening"); inputSchema = configuration.inputSchema; invoke = handler;
      assert.equal(configuration.annotations.readOnlyHint, false); assert.equal(configuration.annotations.destructiveHint, false);
      assert.equal(configuration.annotations.idempotentHint, false); assert.equal(configuration.annotations.openWorldHint, true);
    } },
  });
  vm.runInContext(stripTypeScriptTypes(`${helpers}\n${source.slice(start, end)}`).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke !== undefined && inputSchema !== undefined); assert.equal(wrappers, 1);
  const expectedBindingSha256 = "a".repeat(64), operationId = "pcb209-registration";
  const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  const invalid = [
    { request: { action: "worker-startup", request: { ...launch, operationId: "worker-startup-private" } } },
    { request: { action: "observe-model-state", operationId, expectedBindingSha256 } },
    { request: { action: "inspect-workers", operationId, expectedBindingSha256 } },
    { request: { action: "observe-worker-state", operationId, expectedBindingSha256 } },
    { request: { action: "inspect-script", operationId, expectedBindingSha256, frameId: "frame", family: "public-api" } },
    { request: { action: "inspect", operationId, observation: "model" } },
    { request: { ...launch, operationId: "legacy-operation" } },
    { request: { ...launch, generation: "206" } }, { request: { ...launch, allocateOwner: "caller" } },
    { request: { ...launch, executable: "caller.exe" } }, { request: { ...launch, sourceSha256: expectedBindingSha256 } },
    { request: { ...launch, url: "https://private.invalid" } }, { request: { ...launch, code: "caller-code" } },
    { request: { action: "inspect", operationId }, extra: true },
  ];
  for (const input of invalid) {
    assert.equal(inputSchema.safeParse(input).success, false); await assert.rejects(invoke(input));
  }
  assert.equal(allocations, 0); assert.equal(gateCalls, 0); assert.equal(checks, 0);
  const inspected = await invoke({ request: { action: "inspect", operationId } });
  assert.match(JSON.stringify(inspected), /not-found/u); assert.equal(allocations, 1); assert.equal(gateCalls, 0); assert.equal(checks, 0);
  await assert.rejects(invoke({ request: { action: "query-observation", operationId, observation: "primitives209",
    expectedResultRecordSha256: "a".repeat(64), query: { kind: "family", family: "Line" } } }), /QUERY_PUBLISHED_RESULT_REQUIRED/u);
  assert.equal(allocations, 1); assert.equal(gateCalls, 0); assert.equal(checks, 0);
  assert.ok(options); assert.ok(scope["currentPcbDiagnosticLifecycle"] instanceof Selected209Lifecycle);
  assert.equal(options.powershellSha256, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256);
  assert.equal(options.powershellBytes, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes);
  await assert.rejects(invoke({ request: launch }), /unresolved engine journal/u);
  assert.equal(checks, 1); assert.equal(gateCalls, 1); assert.equal(allocations, 1);
  const stillUnlaunched = await invoke({ request: { action: "inspect", operationId } }); assert.match(JSON.stringify(stillUnlaunched), /not-found/u);
  // Cleanup remains routed through the original owner and serialization while
  // Bridge admission is blocked. Missing native ownership still refuses.
  await assert.rejects(invoke({ request: { action: "normal-close", operationId, expectedBindingSha256, hwnd: "123", confirmNormalClose: true } }));
  assert.equal(checks, 1); assert.equal(gateCalls, 2); blocked = false;
  for (const name of ["windowsRuntime", "ordinaryLaunchRuntime", "currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator",
    "currentSchematicRenameOperationCoordinator", "closedSymbolIndexReservation", "scheduledShutdown"]) {
    scope[name] = {}; await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope[name] = undefined;
  }
  for (const name of ["currentPcbStringPrecreateLifecycle", "currentPcbWorkerStartupLifecycle"]) {
    scope[name] = { hasActiveReservation: (): boolean => true };
    await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope[name] = undefined;
  }
  scope["closedSymbolUnreservedFailure"] = { observed: true };
  await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope["closedSymbolUnreservedFailure"] = { observed: false };
  const waiting = Promise.withResolvers<null>(); pendingAdmission = waiting.promise;
  const check = options.assertOtherLaunchesSettled(); scope["ordinaryLaunchRuntime"] = {}; waiting.resolve(null);
  await assert.rejects(check, /requires no retained/u); scope["ordinaryLaunchRuntime"] = undefined; pendingAdmission = undefined;
  await options.assertOtherLaunchesSettled();
  const originalMethod = engine.assertDiagnosticLaunchOtherOperationsSettled;
  engine.assertDiagnosticLaunchOtherOperationsSettled = (): Promise<void> => Promise.resolve();
  assert.throws(options.assertLocalAllowed, /original index owner/u); engine.assertDiagnosticLaunchOtherOperationsSettled = originalMethod;
  environment.WSL_DISTRO_NAME = "Changed"; assert.throws(options.assertLocalAllowed, /original index owner/u); environment.WSL_DISTRO_NAME = "Ubuntu";
  const retained = scope["currentPcbDiagnosticLifecycle"]; scope["currentPcbDiagnosticLifecycle"] = {};
  await assert.rejects(invoke({ request: { action: "inspect", operationId } }), /original index owner/u); scope["currentPcbDiagnosticLifecycle"] = retained;
  const core: unknown = Object.getPrototypeOf(CurrentPcb209DiagnosticLifecycle.prototype);
  assert.ok(core !== null && typeof core === "object");
  for (const name of ["run", "hasActiveReservation"]) {
    const descriptor = Object.getOwnPropertyDescriptor(core, name); assert.ok(descriptor);
    try {
      Object.defineProperty(core, name, { ...descriptor, value: (): never => { throw new Error("substituted core method called"); } });
      await assert.rejects(invoke({ request: { action: "inspect", operationId } }), /original index owner/u);
    } finally { Object.defineProperty(core, name, descriptor); }
  }
  options.assertLocalAllowed(); assert.equal(allocations, 1);
});
