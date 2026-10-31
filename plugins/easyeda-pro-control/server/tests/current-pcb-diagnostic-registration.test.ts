/* oxlint-disable import/max-dependencies -- Registration uses the actual purpose classes, strict schemas and facade mode selection instead of permissive stand-ins. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { CurrentPcb209DiagnosticLifecycle, CurrentPcb209VisualLifecycle, CurrentPcbDiagnosticLifecycle, CurrentPcbStringPrecreateLifecycle, CurrentPcbWorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "../src/current-pcb-diagnostic-profile.ts";
import { currentPcbDiagnosticToolRequestSchema, currentPcbDiagnosticValidationRequestSchema } from "../src/current-pcb-diagnostic-validation.ts";
import { currentPcbStringPrecreateRequestSchema } from "../src/current-pcb-string-precreate-validation.ts";
import { currentPcb209OpeningRequestSchema } from "../src/current-pcb-209-opening-validation.ts";
import { currentPcb209VisualRequestSchema } from "../src/current-pcb-209-visual-validation.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";

for (const stringPurpose of [false, true]) {
void test(`public ${stringPurpose ? "String precreate" : "diagnostic"} registration preserves local inspection/cleanup, fixed pins and reverse-owner exclusions`, async () => {
  const tool = stringPurpose ? "easyeda_control_pcb_string_precreate_validation" : "easyeda_control_pcb_diagnostic_validation";
  const operationId = stringPurpose ? "string-precreate-registration" : "registration";
  const requestSchema = stringPurpose ? currentPcbStringPrecreateRequestSchema : currentPcbDiagnosticValidationRequestSchema;
  const Base = stringPurpose ? CurrentPcbStringPrecreateLifecycle : CurrentPcbDiagnosticLifecycle;
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const diagnosticMarker = 'if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_diagnostic_validation") ||';
  const start = source.indexOf(stringPurpose ? `if (facadeToolRegistered(facadeMode, "${tool}"))` : diagnosticMarker);
  const end = source.indexOf(stringPurpose ? diagnosticMarker :
    'registerFacadeTool(\n  "easyeda_control_launch",', start + 1);
  const helpers = source.slice(source.indexOf("function disposableOwnData("), source.indexOf("function disposableIndexMethods("));
  assert.ok(start > 0 && end > start);
  let options: CurrentPcbDiagnosticLifecycleOptions | undefined;
  let invoke: ((input: { request: unknown; extra?: boolean }) => Promise<unknown>) | undefined;
  let blocked = false, checks = 0, gateCalls = 0;
  let pendingAdmission: Promise<null> | undefined;
  class Coordinator extends Base {
    public constructor(input: CurrentPcbDiagnosticLifecycleOptions) { super(input); options = input; }
    /** Preserve real local inspection while exercising captured local and
     * launch guards for synthetic effects, avoiding any native allocation. */
    public override async run(input: unknown): Promise<Record<string, unknown>> {
      const request = requestSchema.parse(input);
      if (request.action === "inspect") { return super.run(request); }
      assert.ok(options); options.assertLocalAllowed();
      if (request.action === "launch") { await options.assertAllowed(); }
      return { synthetic: true, action: request.action };
    }
  }
  const environment = { EASYEDA_ASSETS_ROOT: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", WSL_DISTRO_NAME: "Ubuntu" };
  const authority = {}, facadePromise = Promise.resolve({ sha256: "a".repeat(64) }), upstream = {};
  const engine = { upstream, executionAuthorityValidator: authority, controlFingerprintPromise: facadePromise,
    assertDiagnosticLaunchOtherOperationsSettled: async (): Promise<void> => {
      checks += 1; if (blocked) { throw new Error("synthetic unresolved engine journal"); }
      if (pendingAdmission !== undefined) { await pendingAdmission; }
    } };
  const scope = vm.createContext({ z, currentPcbDiagnosticToolRequestSchema, currentPcbDiagnosticValidationRequestSchema,
    currentPcbStringPrecreateRequestSchema, currentPcb209OpeningRequestSchema, currentPcb209VisualRequestSchema, CURRENT_PCB_DIAGNOSTIC_PROFILE,
    CurrentPcbDiagnosticLifecycle: Coordinator, CurrentPcb209DiagnosticLifecycle, CurrentPcb209VisualLifecycle, CurrentPcbStringPrecreateLifecycle: Coordinator,
    CurrentPcbWorkerStartupLifecycle,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined, currentFootprintHeldCacheValidation: undefined, currentFootprintHeadAgeValidation: undefined,
    process: { env: environment }, engine, upstream,
    facadeMode: "calculation-only", facadeToolRegistered,
    bridgeGate: { run: (handler: () => Promise<unknown>): Promise<unknown> => { gateCalls += 1; return handler(); } },
    retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    resolve: (): string => "/synthetic/plugin", currentSymbolOperationToolOutputSchema: z.object({ result: z.unknown() }),
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, currentDisposableOpenCoordinator: undefined,
    currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    guarded: (handler: NonNullable<typeof invoke>): NonNullable<typeof invoke> => async input => {
      const result = await handler(input); return result;
    },
    server: { registerTool: (name: string, configuration: { inputSchema: z.ZodType }, handler: typeof invoke): void => {
      assert.equal(name, tool);
      assert.equal(configuration.inputSchema.safeParse({ request: { action: "inspect", operationId }, extra: true }).success, false);
      invoke = handler;
    } },
  });
  vm.runInContext(stripTypeScriptTypes(`${helpers}\n${source.slice(start, end)}`).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  blocked = true;
  const inspected = await invoke({ request: { action: "inspect", operationId } });
  assert.match(JSON.stringify(inspected), /not-found/u); assert.equal(checks, 0); assert.equal(gateCalls, 0);
  await assert.rejects(invoke({ request: { action: "inspect", operationId }, extra: true }));
  assert.ok(options);
  assert.equal(options.powershellSha256, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256);
  assert.equal(options.powershellBytes, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes);
  const launch = { action: "launch", operationId, confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  await assert.rejects(invoke({ request: launch }), /unresolved engine journal/u);
  await invoke({ request: { action: "normal-close", operationId, expectedBindingSha256: "a".repeat(64), hwnd: "123", confirmNormalClose: true } });
  await invoke({ request: { action: "cleanup-no-process", operationId, expectedIntentSha256: "a".repeat(64) } });
  assert.equal(checks, 1); blocked = false;
  const excluded = ["windowsRuntime", "ordinaryLaunchRuntime", "currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator",
    "currentSchematicRenameOperationCoordinator", "closedSymbolIndexReservation", "scheduledShutdown"];
  for (const name of excluded) {
    scope[name] = {}; await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope[name] = undefined;
  }
  const otherOwner = stringPurpose ? "currentPcbDiagnosticLifecycle" : "currentPcbStringPrecreateLifecycle";
  scope[otherOwner] = { hasActiveReservation: (): boolean => true };
  await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u);
  scope[otherOwner] = undefined;
  scope["closedSymbolUnreservedFailure"] = { observed: true };
  await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u);
  scope["closedSymbolUnreservedFailure"] = { observed: false };
  const waiting = Promise.withResolvers<null>(); pendingAdmission = waiting.promise;
  const check = options.assertOtherLaunchesSettled(); scope["windowsRuntime"] = {}; waiting.resolve(null);
  await assert.rejects(check, /requires no retained/u); scope["windowsRuntime"] = undefined; pendingAdmission = undefined;
  await options.assertOtherLaunchesSettled();
  const originalMethod = engine.assertDiagnosticLaunchOtherOperationsSettled;
  engine.assertDiagnosticLaunchOtherOperationsSettled = (): Promise<void> => Promise.resolve();
  assert.throws(options.assertLocalAllowed, /original index owner/u);
  engine.assertDiagnosticLaunchOtherOperationsSettled = originalMethod;
  environment.WSL_DISTRO_NAME = "Changed"; assert.throws(options.assertLocalAllowed, /original index owner/u);
  environment.WSL_DISTRO_NAME = "Ubuntu"; options.assertLocalAllowed();
  // The fixed public classes inherit the real methods directly. Capturing only
  // A trivial public wrapper would miss substitution of its dynamic super call.
  assert.equal(Object.hasOwn(Base.prototype, "run"), false);
  assert.equal(Object.hasOwn(Base.prototype, "hasActiveReservation"), false);
  assert.equal(Reflect.deleteProperty(Coordinator.prototype, "run"), true);
  scope["currentPcbDiagnosticLifecycle"] = undefined; scope["currentPcbStringPrecreateLifecycle"] = undefined;
  vm.runInContext(stripTypeScriptTypes(`${helpers}\n${source.slice(start, end)}`).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  await invoke({ request: { action: "inspect", operationId } });
  const core: unknown = Object.getPrototypeOf(Base.prototype);
  assert.ok(core !== null && typeof core === "object");
  for (const name of ["run", "hasActiveReservation"]) {
    const descriptor = Object.getOwnPropertyDescriptor(core, name); assert.ok(descriptor);
    try {
      Object.defineProperty(core, name, { ...descriptor, value: (): never => { throw new Error("substituted core method called"); } });
      await assert.rejects(invoke({ request: { action: "inspect", operationId } }), /original index owner/u);
    } finally { Object.defineProperty(core, name, descriptor); }
  }
});
}
