/* oxlint-disable import/max-dependencies -- This composition test compares the real index registration, offline facade and fixed-purpose schema together; splitting their imports would hide a boundary under a synthetic helper. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { CurrentPcb209DiagnosticLifecycle, CurrentPcb209EmptyStartupLifecycle, CurrentPcb209RatlineContinuationLifecycle, CurrentPcb209RatlineStartupLifecycle, CurrentPcb209WorkerStartupLifecycle, CurrentPcbDiagnosticLifecycle, CurrentPcbWorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "../src/current-pcb-diagnostic-profile.ts";
import { currentPcbDiagnosticToolRequestSchema, currentPcbDiagnosticValidationRequestSchema,
  queryCurrentPcbDiagnosticValidation, validateCurrentPcbDiagnosticValidationArguments } from "../src/current-pcb-diagnostic-validation.ts";
import { currentPcbWorkerStartupValidationRequestSchema, queryCurrentPcbWorkerStartupValidation } from "../src/current-pcb-worker-startup-validation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { currentPcb209OpeningRequestSchema } from "../src/current-pcb-209-opening-validation.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";

const operationId = "worker-startup-contract";
const expectedBindingSha256 = "a".repeat(64);
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const rawWindowsPath = String.raw`C:\disposable\startup.eprj2`;
const capture = { action: "capture-project", operationId, expectedBindingSha256,
  target: { rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
    documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) },
  confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true };
const wrap = (request: unknown): Readonly<{ action: "worker-startup"; request: unknown }> => ({ action: "worker-startup", request });

void test("startup validation is discoverable through the existing offline diagnostic wrapper without execution claims", () => {
  const startup = queryCurrentPcbWorkerStartupValidation(true);
  const diagnostic = queryCurrentPcbDiagnosticValidation({ includeSchemas: true });
  for (const key of ["executionAuthorized", "connectedValidation", "saveAuthorized"]) { assert.equal(startup[key], false); }
  assert.equal(startup["validationOnly"], true); assert.equal(startup["wrapperAction"], "worker-startup");
  assert.notEqual(startup["inputSchema"], undefined); assert.deepEqual(diagnostic["workerStartup"], startup);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "pcb-diagnostic-validation", query: { includeSchemas: true } })).result, diagnostic);
  const request = wrap(capture);
  assert.equal(validateCurrentPcbDiagnosticValidationArguments(request)["valid"], true);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "pcb-diagnostic-validation-validate", query: { request } })).result,
    validateCurrentPcbDiagnosticValidationArguments(request));
});

void test("startup schema keeps its purpose, pause confirmation and disposable target strict", () => {
  assert.equal(currentPcbWorkerStartupValidationRequestSchema.safeParse(launch).success, true);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(launch).success, false);
  assert.equal(currentPcbDiagnosticToolRequestSchema.safeParse(wrap(launch)).success, true);
  assert.equal(currentPcbDiagnosticToolRequestSchema.safeParse(capture).success, false);
  assert.equal(currentPcbWorkerStartupValidationRequestSchema.safeParse({ ...launch, operationId: "diagnostic-contract" }).success, false);
  for (const key of ["confirmDisposableProject", "acceptNormalOpenEffects", "acceptDebuggerPauseEffects"]) {
    assert.equal(currentPcbDiagnosticToolRequestSchema.safeParse(wrap({ ...capture, [key]: false })).success, false);
    const missing = Object.fromEntries(Object.entries(capture).filter(([name]) => name !== key));
    assert.equal(currentPcbDiagnosticToolRequestSchema.safeParse(wrap(missing)).success, false);
  }
  for (const extra of [{ method: "Runtime.evaluate" }, { expression: "1+1" }, { purpose: "worker-startup" },
    { executable: String.raw`C:\other.exe` }, { profile: {} }, { sourceSha256: "d".repeat(64) }]) {
    assert.equal(currentPcbDiagnosticToolRequestSchema.safeParse(wrap({ ...capture, ...extra })).success, false);
    assert.equal(currentPcbDiagnosticToolRequestSchema.safeParse({ ...wrap(capture), ...extra }).success, false);
  }
  for (const action of ["open-project", "open-pcb", "handoff", "create", "save", "upgrade", "inspect-workers", "observe-model-state"]) {
    assert.equal(currentPcbWorkerStartupValidationRequestSchema.safeParse({ action, operationId, expectedBindingSha256 }).success, false);
  }
  for (const action of ["observe-current-assignments", "observe-actor-clock", "observe-current-channel"]) {
    const request = { action, operationId, expectedBindingSha256 };
    assert.equal(currentPcbWorkerStartupValidationRequestSchema.safeParse(request).success, true);
    for (const extra of [{ actor: {} }, { clock: Date.now() }, { workerObjectId: "caller" }, { assignments: {} }]) {
      assert.equal(currentPcbWorkerStartupValidationRequestSchema.safeParse({ ...request, ...extra }).success, false);
    }
  }
  assert.equal(currentPcbWorkerStartupValidationRequestSchema.safeParse({ action: "inspect-script", operationId, expectedBindingSha256,
    frameId: "frame", family: "pcb" }).success, false);
});

void test("startup public registration binds the actual inherited methods, fixed pins and reciprocal launch exclusions", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_diagnostic_validation") ||');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",', start + 1);
  const helpers = source.slice(source.indexOf("function disposableOwnData("), source.indexOf("function disposableIndexMethods("));
  assert.ok(start > 0 && end > start);
  let options: CurrentPcbDiagnosticLifecycleOptions | undefined;
  let invoke: ((input: { request: unknown; extra?: boolean }) => Promise<unknown>) | undefined;
  let allocations = 0, checks = 0, gateCalls = 0;
  const calls: unknown[] = [];
  class Coordinator extends CurrentPcbWorkerStartupLifecycle {
    public constructor(input: CurrentPcbDiagnosticLifecycleOptions) { super(input); allocations += 1; options = input; }
    public override async run(input: unknown): Promise<Record<string, unknown>> {
      assert.ok(this instanceof Coordinator);
      const request = currentPcbWorkerStartupValidationRequestSchema.parse(input); assert.ok(options); options.assertLocalAllowed();
      if (request.action === "launch") { await options.assertAllowed(); }
      calls.push(request); return { synthetic: true, action: request.action };
    }
    public override async captureWorkerStartup(id: string, binding: string, input: unknown): Promise<Record<string, unknown>> {
      assert.ok(this instanceof Coordinator);
      await Promise.resolve(); assert.ok(options); options.assertLocalAllowed(); calls.push({ id, binding, input });
      return { synthetic: true, validationOnly: true, saveAuthorized: false };
    }
    public override async observeWorkerStartupAssignments(id: string, binding: string): Promise<Record<string, unknown>> {
      await Promise.resolve(); assert.ok(this instanceof Coordinator); assert.ok(options); options.assertLocalAllowed();
      calls.push({ id, binding, action: "observe-current-assignments" }); return { synthetic: true };
    }
    public override async observeWorkerStartupActor(id: string, binding: string): Promise<Record<string, unknown>> {
      await Promise.resolve(); assert.ok(this instanceof Coordinator); assert.ok(options); options.assertLocalAllowed();
      calls.push({ id, binding, action: "observe-actor-clock" }); return { synthetic: true };
    }
    public override async observeWorkerStartupChannel(id: string, binding: string): Promise<Record<string, unknown>> {
      await Promise.resolve(); assert.ok(this instanceof Coordinator); assert.ok(options); options.assertLocalAllowed();
      calls.push({ id, binding, action: "observe-current-channel" }); return { synthetic: true };
    }
  }
  const environment = { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "Ubuntu" };
  const upstream = {};
  const engine = { upstream, executionAuthorityValidator: {}, controlFingerprintPromise: Promise.resolve({ sha256: "a".repeat(64) }),
    assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => { checks += 1; return Promise.resolve(); } };
  const scope = vm.createContext({ z, currentPcbDiagnosticToolRequestSchema, currentPcb209OpeningRequestSchema, CURRENT_PCB_DIAGNOSTIC_PROFILE,
    CurrentPcbDiagnosticLifecycle, CurrentPcb209DiagnosticLifecycle, CurrentPcb209EmptyStartupLifecycle, CurrentPcb209RatlineStartupLifecycle, CurrentPcb209RatlineContinuationLifecycle, CurrentPcb209WorkerStartupLifecycle,
    CurrentPcbWorkerStartupLifecycle: Coordinator, currentPcbWorkerStartupLifecycle: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, process: { env: environment }, engine, upstream,
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
      assert.equal(name, "easyeda_control_pcb_diagnostic_validation");
      assert.equal(configuration.inputSchema.safeParse({ request: wrap(capture), extra: true }).success, false); invoke = handler;
    } },
  });
  vm.runInContext(stripTypeScriptTypes(`${helpers}\n${source.slice(start, end)}`).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  await assert.rejects(invoke({ request: wrap({ ...capture, acceptDebuggerPauseEffects: false }) })); assert.equal(allocations, 0);
  await invoke({ request: wrap({ action: "inspect", operationId }) });
  assert.equal(allocations, 1); assert.equal(checks, 0); assert.equal(gateCalls, 0); assert.ok(options);
  assert.equal(options.powershellSha256, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256);
  assert.equal(options.powershellBytes, CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes);
  await invoke({ request: wrap(capture) }); assert.equal(gateCalls, 1);
  const { action: _action, operationId: _operation, expectedBindingSha256: _binding, ...body } = capture;
  assert.equal(JSON.stringify(calls.at(-1)), JSON.stringify({ id: operationId, binding: expectedBindingSha256, input: body }));
  for (const action of ["observe-current-assignments", "observe-actor-clock", "observe-current-channel"]) {
    await invoke({ request: wrap({ action, operationId, expectedBindingSha256 }) });
    assert.equal(JSON.stringify(calls.at(-1)), JSON.stringify({ id: operationId, binding: expectedBindingSha256, action }));
  }
  assert.equal(gateCalls, 4);
  for (const name of ["windowsRuntime", "ordinaryLaunchRuntime", "currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator",
    "currentSchematicRenameOperationCoordinator", "closedSymbolIndexReservation", "scheduledShutdown"]) {
    scope[name] = {}; await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope[name] = undefined;
  }
  for (const name of ["currentPcbDiagnosticLifecycle", "currentPcbStringPrecreateLifecycle"]) {
    scope[name] = { hasActiveReservation: (): boolean => true };
    await assert.rejects(options.assertOtherLaunchesSettled(), /requires no retained/u); scope[name] = undefined;
  }
  await options.assertOtherLaunchesSettled();
  const core: unknown = Object.getPrototypeOf(CurrentPcbWorkerStartupLifecycle.prototype);
  assert.ok(core !== null && typeof core === "object");
  for (const name of ["handoffStartup", "openStartup", "observeStartupAssignments", "requireStartupAssignments", "observeStartupActor", "observeStartupChannel"]) {
    const descriptor = Object.getOwnPropertyDescriptor(core, name); assert.ok(descriptor);
    try {
      Object.defineProperty(core, name, { ...descriptor, value: (): never => { throw new Error("substituted core method called"); } });
      await assert.rejects(invoke({ request: wrap(capture) }), /original index owner/u);
    } finally { Object.defineProperty(core, name, descriptor); }
  }
  const guard = source.slice(source.indexOf("function assertOrdinaryRuntimeAllocationAllowed()"), source.indexOf("/** No outer gate/authenticated scope."));
  vm.runInContext(stripTypeScriptTypes(`${guard}\ncurrentPcbWorkerStartupLifecycle={hasActiveReservation:()=>true};`), scope);
  assert.throws(() => vm.runInContext("assertOrdinaryRuntimeAllocationAllowed()", scope), /reserves application startup/u);
});
