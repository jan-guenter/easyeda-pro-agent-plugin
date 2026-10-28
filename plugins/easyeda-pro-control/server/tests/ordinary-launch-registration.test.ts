/* oxlint-disable max-classes-per-file -- The registration constructs two distinct production owners; both constructors need independent inert doubles. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { OrdinaryLaunchCoordinator, ordinaryLaunchRequestSchema } from "../src/ordinary-launch.ts";
import type { OrdinaryLaunchOptions } from "../src/ordinary-launch.ts";

void test("ordinary launcher registration keeps quarantine and exact shared runtime allocation", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_open",', start);
  assert.ok(start > 0 && end > start);
  let options: OrdinaryLaunchOptions | undefined;
  let invoke: ((input: { request: unknown }) => Promise<unknown>) | undefined;
  let checks = 0, quarantine = false, quarantineChecks = 0;
  let pendingAdmission: Promise<null> | undefined;
  const runtimeOptions: unknown[] = [];
  class Coordinator extends OrdinaryLaunchCoordinator {
    public constructor(input: OrdinaryLaunchOptions) { super(input); options = input; }
  }
  // oxlint-disable-next-line typescript/no-extraneous-class -- The real callback uses new; this constructor double records identity without acquiring a native resource.
  class Runtime { public constructor(input: unknown) { runtimeOptions.push(input); } }
  class Diagnostic {
    private readonly unused = false;
    public hasActiveReservation(): boolean { return this.unused; }
    public hasAttemptedNativeOwnerAllocation(): boolean { return this.unused; }
  }
  const environment = { EASYEDA_ASSETS_ROOT: "/mnt/d/Apps/EasyEDA/resources/app/assets" };
  const scope = vm.createContext({ z, ordinaryLaunchRequestSchema, OrdinaryLaunchCoordinator: Coordinator, WindowsControlRuntime: Runtime,
    CurrentPcbDiagnosticLifecycle: Diagnostic,
    disposableOwnerMethod: (owner: object, key: string): unknown => Reflect.get(owner, key) as unknown,
    process: { env: environment }, resolve: (): string => "/synthetic/plugin", upstream: {},
    ordinaryLaunchCoordinator: undefined, ordinaryLaunchRuntime: undefined, windowsRuntime: undefined,
    closedSymbolIndexReservation: undefined, scheduledShutdown: undefined,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined,
    closedSymbolUnreservedFailure: { observed: false },
    assertOrdinaryRuntimeAllocationAllowed: (): void => { checks += 1; },
    engine: { assertBridgeDispatchAllowed: async (): Promise<void> => {
      quarantineChecks += 1;
      if (quarantine) { throw new Error("quarantine"); }
      if (pendingAdmission !== undefined) { await pendingAdmission; }
    } },
    serializedGuarded: (handler: typeof invoke, guardOptions: { allowDuringOrphanRisk: unknown }): typeof invoke => {
      assert.deepEqual(Object.keys(guardOptions), ["allowDuringOrphanRisk"]);
      assert.equal(guardOptions.allowDuringOrphanRisk, true); return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType } }, handler: typeof invoke): void => {
      assert.equal(name, "easyeda_control_launch");
      assert.equal(config.inputSchema.request.safeParse({ action: "launch", operationId: "fixture", confirmLaunch: true,
        acceptExistingProfileEffects: true, args: [] }).success, false);
      const close = { action: "normal-close", operationId: "fixture", expectedLaunchedSha256: "c".repeat(64),
        hwnd: "1234", confirmNormalClose: true };
      assert.equal(config.inputSchema.request.safeParse(close).success, true);
      assert.equal(config.inputSchema.request.safeParse({ ...close, confirmNormalClose: false }).success, false);
      assert.equal(config.inputSchema.request.safeParse({ ...close, force: true }).success, false);
      assert.equal(config.inputSchema.request.safeParse({ ...close, hwnd: "0" }).success, false);
      assert.equal(config.inputSchema.request.safeParse({ action: "observe-window", operationId: "fixture",
        expectedLaunchedSha256: close.expectedLaunchedSha256 }).success, true);
      invoke = handler;
    },
  });
  // Actual registration and coordinator with an isolated journal root and inert
  // Runtime. No facade, helper, bridge or application is started.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  quarantine = true;
  const inspection = await invoke({ request: { action: "inspect", operationId: "fixture" } });
  const inspectionSchema = z.object({ result: z.object({ operationId: z.literal("fixture"), state: z.literal("not-found"),
    attemptConsumed: z.literal(false), designExecutionAuthorized: z.literal(false) }) });
  assert.ok(inspectionSchema.safeParse(inspection).success);
  assert.equal(quarantineChecks, 0); assert.equal(runtimeOptions.length, 0);
  await assert.rejects(invoke({ request: { action: "inspect", operationId: "fixture", force: true } }));
  assert.equal(quarantineChecks, 0);
  const digest = "a".repeat(64);
  const guardedRequests = [
    { action: "launch", operationId: "fixture", confirmLaunch: true, acceptExistingProfileEffects: true },
    { action: "observe-application", operationId: "fixture" },
    { action: "observe-termination", operationId: "fixture" },
    { action: "release-closed", operationId: "fixture", expectedLaunchedSha256: digest, expectedTerminationSha256: digest, confirmReleaseClosed: true },
    { action: "observe-window", operationId: "fixture", expectedLaunchedSha256: digest },
    { action: "normal-close", operationId: "fixture", expectedLaunchedSha256: digest, hwnd: "1234", confirmNormalClose: true },
    { action: "abandon-supervision", operationId: "fixture", expectedLaunchedSha256: digest, confirmAbandonSupervision: true, acceptUnobservedDescendants: true },
    { action: "abandon-unknown-launch", operationId: "fixture", expectedIntentSha256: digest, confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true },
  ];
  for (const request of guardedRequests) { await assert.rejects(invoke({ request }), /quarantine/u); }
  assert.equal(quarantineChecks, 8); assert.equal(runtimeOptions.length, 0);
  quarantine = false;
  await invoke({ request: { action: "inspect", operationId: "fixture" } });
  assert.ok(options);
  const identity = { expectedExecutableSha256: "a".repeat(64), expectedHelperSha256: "c".repeat(64), reviewedExecutionScopeSha256: "b".repeat(64) };
  const runtime = options.allocateRuntime(identity);
  assert.equal(checks, 1);
  assert.equal(scope["windowsRuntime"], runtime); assert.equal(scope["ordinaryLaunchRuntime"], runtime);
  const allocated = runtimeOptions[0];
  assert.ok(allocated !== null && typeof allocated === "object" && "expectedExecutableSha256" in allocated);
  assert.equal(allocated["expectedExecutableSha256"], identity.expectedExecutableSha256);
  assert.ok(options.assertLocalAllowed);
  const scansBeforeLocal = quarantineChecks;
  options.assertLocalAllowed();
  assert.equal(quarantineChecks, scansBeforeLocal);
  await options.assertAllowed();
  assert.throws(() => options?.allocateRuntime(identity), /already allocated/u);
  scope["windowsRuntime"] = {};
  await assert.rejects(options.assertAllowed(), /unavailable or changed/u);
  scope["windowsRuntime"] = runtime; scope["scheduledShutdown"] = Promise.resolve();
  await assert.rejects(options.assertAllowed(), /unavailable or changed/u);
  scope["scheduledShutdown"] = undefined;
  const drifts = [
    (): void => { scope["windowsRuntime"] = {}; },
    (): void => { scope["closedSymbolIndexReservation"] = {}; },
    (): void => { scope["scheduledShutdown"] = Promise.resolve(); },
    (): void => { environment.EASYEDA_ASSETS_ROOT = "/mnt/d/Changed/resources/app/assets"; },
  ];
  for (const drift of drifts) {
    const admission = Promise.withResolvers<null>();
    pendingAdmission = admission.promise;
    const checked = options.assertAllowed();
    drift(); admission.resolve(null);
    await assert.rejects(checked, /unavailable or changed/u);
    scope["windowsRuntime"] = runtime; scope["closedSymbolIndexReservation"] = undefined;
    scope["scheduledShutdown"] = undefined;
    environment.EASYEDA_ASSETS_ROOT = "/mnt/d/Apps/EasyEDA/resources/app/assets";
  }
  pendingAdmission = undefined;
  await options.assertAllowed();
});
