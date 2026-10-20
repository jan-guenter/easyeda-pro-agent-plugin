import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { CurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "../src/current-pcb-diagnostic-profile.ts";
import { currentPcbDiagnosticValidationRequestSchema } from "../src/current-pcb-diagnostic-validation.ts";

void test("public diagnostic registration preserves local inspection/cleanup, fixed pins and complete reverse-owner exclusions", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_diagnostic_validation"))');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",', start);
  const helpers = source.slice(source.indexOf("function disposableOwnData("), source.indexOf("function disposableIndexMethods("));
  assert.ok(start > 0 && end > start);
  let options: CurrentPcbDiagnosticLifecycleOptions | undefined;
  let invoke: ((input: { request: unknown; extra?: boolean }) => Promise<unknown>) | undefined;
  let blocked = false, checks = 0, gateCalls = 0;
  let pendingAdmission: Promise<null> | undefined;
  class Coordinator extends CurrentPcbDiagnosticLifecycle {
    public constructor(input: CurrentPcbDiagnosticLifecycleOptions) { super(input); options = input; }
    public override async run(input: unknown): Promise<Record<string, unknown>> {
      const request = currentPcbDiagnosticValidationRequestSchema.parse(input);
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
  const scope = vm.createContext({ z, currentPcbDiagnosticValidationRequestSchema, CURRENT_PCB_DIAGNOSTIC_PROFILE,
    CurrentPcbDiagnosticLifecycle: Coordinator, currentPcbDiagnosticLifecycle: undefined, process: { env: environment }, engine, upstream,
    facadeMode: "calculation-only", facadeToolRegistered: (): boolean => true,
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
      assert.equal(name, "easyeda_control_pcb_diagnostic_validation");
      assert.equal(configuration.inputSchema.safeParse({ request: { action: "inspect", operationId: "registration" }, extra: true }).success, false);
      invoke = handler;
    } },
  });
  vm.runInContext(stripTypeScriptTypes(`${helpers}\n${source.slice(start, end)}`).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  blocked = true;
  const inspected = await invoke({ request: { action: "inspect", operationId: "registration" } });
  assert.match(JSON.stringify(inspected), /not-found/u); assert.equal(checks, 0); assert.equal(gateCalls, 0);
  await assert.rejects(invoke({ request: { action: "inspect", operationId: "registration" }, extra: true }));
  assert.ok(options);
  assert.equal(options.powershellSha256, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256);
  assert.equal(options.powershellBytes, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes);
  const launch = { action: "launch", operationId: "registration", confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  await assert.rejects(invoke({ request: launch }), /unresolved engine journal/u);
  await invoke({ request: { action: "normal-close", operationId: "registration", expectedBindingSha256: "a".repeat(64), hwnd: "123", confirmNormalClose: true } });
  await invoke({ request: { action: "cleanup-no-process", operationId: "registration", expectedIntentSha256: "a".repeat(64) } });
  assert.equal(checks, 1); blocked = false;
  const excluded = ["windowsRuntime", "ordinaryLaunchRuntime", "currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator",
    "currentSchematicRenameOperationCoordinator", "closedSymbolIndexReservation", "scheduledShutdown"];
  for (const name of excluded) {
    scope[name] = {}; await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope[name] = undefined;
  }
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
});
