/* oxlint-disable import/max-dependencies, max-classes-per-file -- Compare the real registration, facade and schemas together; keep legacy and combined synthetic coordinators independently scoped so the existing VM fixture retains its semantics. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { CurrentFootprintCombinedLifecycle, CurrentFootprintCopyPreparationLifecycle, CurrentFootprintCopyRoutePreparationLifecycle, CurrentPcb209DiagnosticLifecycle, CurrentPcb209EmptyStartupLifecycle, CurrentPcb209RatlineContinuationLifecycle, CurrentPcb209RatlineStartupLifecycle, CurrentPcb209VisualLifecycle, CurrentPcb209WorkerStartupLifecycle, CurrentPcbDiagnosticLifecycle, CurrentPcbWorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentFootprintCombinedUnknownAbandonmentOptions } from "../src/current-footprint-combined-unknown-abandonment.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "../src/current-pcb-diagnostic-profile.ts";
import { currentPcbDiagnosticToolRequestSchema, currentPcbDiagnosticValidationRequestSchema,
  queryCurrentPcbDiagnosticValidation, validateCurrentPcbDiagnosticValidationArguments } from "../src/current-pcb-diagnostic-validation.ts";
import { currentPcbWorkerStartupValidationRequestSchema, queryCurrentPcbWorkerStartupValidation } from "../src/current-pcb-worker-startup-validation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { currentPcb209OpeningRequestSchema } from "../src/current-pcb-209-opening-validation.ts";
import { currentPcb209VisualRequestSchema } from "../src/current-pcb-209-visual-validation.ts";
import { currentFootprintCombinedValidationRequestSchema } from "../src/current-footprint-combined-validation.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { SerializedGate } from "../src/engine.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";
import { sha256Json } from "../src/core.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const operationId = "worker-startup-contract";
const expectedBindingSha256 = "a".repeat(64);
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const rawWindowsPath = String.raw`C:\disposable\startup.eprj2`;
const capture = { action: "capture-project", operationId, expectedBindingSha256,
  target: { rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
    documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) },
  confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true };
const wrap = (request: unknown): Readonly<{ action: "worker-startup"; request: unknown }> => ({ action: "worker-startup", request });
const wrapCombined = (request: unknown): { request: { action: "footprint-combined"; request: unknown } } => ({ request: { action: "footprint-combined", request } });

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
  const scope = vm.createContext({ z, currentPcbDiagnosticToolRequestSchema, currentPcb209OpeningRequestSchema, currentPcb209VisualRequestSchema, CURRENT_PCB_DIAGNOSTIC_PROFILE,
    CurrentPcbDiagnosticLifecycle, CurrentPcb209DiagnosticLifecycle, CurrentPcb209VisualLifecycle, CurrentPcb209EmptyStartupLifecycle, CurrentPcb209RatlineStartupLifecycle, CurrentPcb209RatlineContinuationLifecycle, CurrentPcb209WorkerStartupLifecycle,
    CurrentFootprintCopyPreparationLifecycle, CurrentFootprintCopyRoutePreparationLifecycle,
    CurrentPcbWorkerStartupLifecycle: Coordinator, currentPcbWorkerStartupLifecycle: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, currentFootprintMainLifecycle: undefined, currentFootprintHeldCacheValidation: undefined,
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
  for (const name of ["currentPcbDiagnosticLifecycle", "currentPcbStringPrecreateLifecycle", "currentFootprintMainLifecycle"]) {
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


void test("registered combined wrapper retains its lifecycle and confirmed abort bypasses the occupied bridge gate", { timeout: 5000 }, async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_diagnostic_validation") ||');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",', start + 1);
  const helpers = source.slice(source.indexOf("function disposableOwnData("), source.indexOf("function disposableIndexMethods("));
  assert.ok(start > 0 && end > start);
  let invoke: ((input: { request: unknown }) => Promise<unknown>) | undefined;
  let allocations = 0, gateCalls = 0, historicalAllocations = 0;
  const historicalOwners: object[] = [];
  const coordinators: Coordinator[] = [];
  let options: CurrentPcbDiagnosticLifecycleOptions | undefined;
  let mainPublished = false, reserved = false, sealed = false;
  const calls: string[] = [], entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  const historicalEntered = Promise.withResolvers<null>(), historicalRelease = Promise.withResolvers<null>();
  const { action: _action, operationId: _operation, expectedBindingSha256: _binding, ...captureBody } = capture;
  // The actual registration/prototype guards and actual SerializedGate are
  // Exercised here. Coordinator callbacks remain explicitly synthetic.
  class Coordinator extends CurrentFootprintCombinedLifecycle {
    #attempted = false;
    public constructor(input: CurrentPcbDiagnosticLifecycleOptions) { super(input); allocations += 1; options = input; coordinators.push(this); }
    public override async run(input: unknown): Promise<Record<string, unknown>> {
      assert.ok(this instanceof Coordinator); assert.ok(options); options.assertLocalAllowed();
      const request = currentFootprintCombinedValidationRequestSchema.parse(input);
      if (request.action === "launch") {
        if (this.#attempted) { throw new Error("synthetic original launch consumed"); }
        await options.assertAllowed(); reserved = true; this.#attempted = true;
      }
      if (request.action === "observe-main-construction") { mainPublished = true; }
      if (request.action === "abort-generation") { sealed = true; }
      calls.push(request.action); return { synthetic: true, action: request.action, executionAuthorized: false };
    }
    public override async captureWorkerStartup(id: string, binding: string, input: unknown): Promise<Record<string, unknown>> {
      assert.ok(this instanceof Coordinator); assert.ok(options); options.assertLocalAllowed();
      assert.equal(id, "footprint-combined-registration"); assert.equal(binding, expectedBindingSha256);
      assert.equal(mainPublished, true); assert.equal(JSON.stringify(input), JSON.stringify(captureBody));
      calls.push("capture-project"); entered.resolve(null); await release.promise; options.assertLocalAllowed();
      assert.equal(sealed, true); throw new Error("synthetic original generation sealed");
    }
    public override hasActiveReservation(): boolean { assert.ok(this instanceof Coordinator); return reserved; }
    public override hasAttemptedNativeOwnerAllocation(): boolean { assert.ok(this instanceof Coordinator); return this.#attempted; }
  }
  class HistoricalCoordinator {
    readonly #input: CurrentFootprintCombinedUnknownAbandonmentOptions;
    #reserved = false;
    public constructor(input: CurrentFootprintCombinedUnknownAbandonmentOptions) { this.#input = input; historicalAllocations += 1; historicalOwners.push(this); }
    public hasActiveReservation(): boolean { return this.#reserved; }
    public async run(input: unknown): Promise<Record<string, unknown>> {
      const request = currentFootprintCombinedValidationRequestSchema.parse(input);
      assert.equal(request.action, "abandon-unknown-launch"); this.#input.assertFreshNoOwnedAllocations(); this.#reserved = true;
      historicalEntered.resolve(null);
      try {
        await historicalRelease.promise; this.#input.assertLocalAllowed(); await this.#input.assertOtherLaunchesSettled();
        return { synthetic: true, state: "unknown-launch-abandoned", executionAuthorized: false, terminationProved: false };
      } finally { this.#reserved = false; }
    }
  }
  const gate = new SerializedGate(), upstream = {};
  const engine = { upstream, executionAuthorityValidator: {}, controlFingerprintPromise: Promise.resolve({ sha256: "a".repeat(64) }),
    assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => Promise.resolve() };
  const scope = vm.createContext({ z, currentPcbDiagnosticToolRequestSchema, currentPcb209OpeningRequestSchema, currentPcb209VisualRequestSchema,
    currentPcb209WorkerStartupToolRequestSchema, CURRENT_PCB_DIAGNOSTIC_PROFILE,
    CurrentPcbDiagnosticLifecycle, CurrentPcb209DiagnosticLifecycle, CurrentPcb209VisualLifecycle, CurrentPcb209EmptyStartupLifecycle, CurrentPcb209RatlineStartupLifecycle,
    CurrentPcb209RatlineContinuationLifecycle, CurrentPcb209WorkerStartupLifecycle, CurrentFootprintCopyPreparationLifecycle,
    CurrentFootprintCopyRoutePreparationLifecycle, CurrentFootprintCombinedLifecycle: Coordinator, CurrentPcbWorkerStartupLifecycle,
    CurrentFootprintCombinedUnknownAbandonment: HistoricalCoordinator, ordinaryLaunchCoordinator: undefined,
    currentPcbWorkerStartupLifecycle: undefined, currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined,
    currentFootprintMainLifecycle: undefined, currentFootprintHeldCacheValidation: undefined, process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "Ubuntu" } },
    engine, upstream, facadeMode: "public-utilities-only", facadeToolRegistered,
    bridgeGate: { run: (handler: () => Promise<unknown>): Promise<unknown> => { gateCalls += 1; return gate.run(handler); } },
    retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    resolve: (): string => "/synthetic/plugin", currentSymbolOperationToolOutputSchema: z.object({ result: z.unknown() }),
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, currentDisposableOpenCoordinator: undefined,
    currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    guarded: (handler: NonNullable<typeof invoke>): NonNullable<typeof invoke> => async input => { const result = await handler(input); return result; },
    server: { registerTool: (name: string, configuration: { inputSchema: z.ZodType; annotations: { destructiveHint: boolean } }, handler: typeof invoke): void => {
      if (name === "easyeda_control_pcb209_worker_startup") {
        assert.equal(configuration.annotations.destructiveHint, true);
        assert.equal(configuration.inputSchema.safeParse({ request: {}, extra: true }).success, false); invoke = handler;
      }
    } },
  });
  vm.runInContext(stripTypeScriptTypes(`${helpers}\n${source.slice(start, end)}`).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  const id = "footprint-combined-registration";
  await assert.rejects(invoke(wrapCombined({ action: "abort-generation", operationId: id, expectedBindingSha256, confirmAbortOriginalCombinedJob: false })));
  assert.equal(allocations, 0); assert.equal(gateCalls, 0);
  const abandon = { action: "abandon-unknown-launch", operationId: id, expectedIntentSha256: expectedBindingSha256,
    confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true, acceptUnknownProfileEffects: true };
  await assert.rejects(invoke(wrapCombined({ ...abandon, acceptUnobservedDescendants: false })));
  assert.equal(historicalAllocations, 0);
  const historical = invoke(wrapCombined(abandon)); await historicalEntered.promise;
  assert.equal(historicalAllocations, 1); assert.equal(allocations, 0); assert.equal(gateCalls, 1);
  await assert.rejects(invoke(wrapCombined({ action: "inspect", operationId: id })), /relinquishment reserves/u);
  assert.equal(allocations, 0); historicalRelease.resolve(null); await historical;
  assert.equal(scope["currentPcbWorkerStartupLifecycle"], undefined);
  assert.equal(historicalOwners.length, 1);
  const historicalOwner = historicalOwners[0]; assert.ok(historicalOwner);
  for (const name of ["run", "hasActiveReservation"]) {
    Object.defineProperty(historicalOwner, name, { configurable: true, value: (): never => { throw new Error("shadowed historical method called"); } });
    try { await assert.rejects(invoke(wrapCombined(abandon)), /coordinator changed/u); }
    finally { assert.equal(Reflect.deleteProperty(historicalOwner, name), true); }
  }
  assert.equal(historicalAllocations, 1); assert.equal(gateCalls, 1);
  const queuedEntered = Promise.withResolvers<null>(), queuedRelease = Promise.withResolvers<null>();
  const blocker = gate.run(async () => { queuedEntered.resolve(null); await queuedRelease.promise; }); await queuedEntered.promise;
  const queuedLaunch = invoke(wrapCombined({ ...launch, operationId: id, acceptDebuggerPauseEffects: true }));
  assert.equal(allocations, 1); assert.equal(reserved, false);
  const duplicateQueued = assert.rejects(invoke(wrapCombined({ ...launch, operationId: `${id}-queued`, acceptDebuggerPauseEffects: true })), /original launch consumed/u);
  assert.equal(allocations, 1); queuedRelease.resolve(null); await blocker; await queuedLaunch; await duplicateQueued;
  // A live/unknown reservation must keep the same consumed coordinator.
  await assert.rejects(invoke(wrapCombined({ ...launch, operationId: `${id}-live`, acceptDebuggerPauseEffects: true })), /original launch consumed/u);
  assert.equal(allocations, 1);
  await invoke(wrapCombined({ action: "observe-main-construction", operationId: id, expectedBindingSha256 }));
  assert.equal(allocations, 1); assert.equal(gateCalls, 5);
  await assert.rejects(invoke(wrapCombined(abandon)), /coordinator changed/u);
  assert.equal(historicalAllocations, 1); assert.equal(gateCalls, 5);
  const captureRequest = invoke(wrapCombined({ ...capture, operationId: id }));
  const captureRefusal = assert.rejects(captureRequest, /synthetic original generation sealed/u); await entered.promise;
  assert.equal(gateCalls, 6);
  const core: unknown = Object.getPrototypeOf(CurrentFootprintCombinedLifecycle.prototype);
  assert.ok(core !== null && typeof core === "object");
  for (const name of ["runMainAction", "runCombinedAbort", "requireCombinedMainPublished", "assertCombinedNormal"]) {
    const descriptor = Object.getOwnPropertyDescriptor(core, name); assert.ok(descriptor);
    try {
      Object.defineProperty(core, name, { ...descriptor, value: (): never => { throw new Error("substituted combined core called"); } });
      await assert.rejects(invoke(wrapCombined({ action: "abort-generation", operationId: id, expectedBindingSha256, confirmAbortOriginalCombinedJob: true })), /original index owner/u);
    } finally { Object.defineProperty(core, name, descriptor); }
  }
  const attemptedDescriptor = Object.getOwnPropertyDescriptor(Coordinator.prototype, "hasAttemptedNativeOwnerAllocation"); assert.ok(attemptedDescriptor);
  try {
    Object.defineProperty(Coordinator.prototype, "hasAttemptedNativeOwnerAllocation", { ...attemptedDescriptor, value: (): boolean => true });
    await assert.rejects(invoke(wrapCombined({ ...launch, operationId: `${id}-substituted`, acceptDebuggerPauseEffects: true })), /original index owner/u);
  } finally { Object.defineProperty(Coordinator.prototype, "hasAttemptedNativeOwnerAllocation", attemptedDescriptor); }
  await assert.rejects(invoke({ request: { action: "footprint-copy-route-preparation", request: { action: "inspect", operationId: "footprint-route-foreign" } } }), /purpose cannot change/u);
  assert.equal(allocations, 1);
  await invoke(wrapCombined({ action: "abort-generation", operationId: id, expectedBindingSha256, confirmAbortOriginalCombinedJob: true }));
  assert.equal(gateCalls, 6); assert.equal(sealed, true); assert.deepEqual(calls, ["launch", "observe-main-construction", "capture-project", "abort-generation"]);
  await invoke(wrapCombined({ action: "inspect", operationId: id })); assert.equal(gateCalls, 6); assert.equal(allocations, 1);
  release.resolve(null); await captureRefusal;
  // Synthetic terminal cleanup drops the lease only after the original call
  // Settles. Inspect retains it; the next launch receives a new coordinator.
  reserved = false;
  await invoke(wrapCombined({ action: "inspect", operationId: id })); assert.equal(allocations, 1);
  const terminalOwner = coordinators[0]; assert.ok(terminalOwner);
  Object.defineProperty(terminalOwner, "hasAttemptedNativeOwnerAllocation", { configurable: true, value: (): boolean => true });
  try { await assert.rejects(invoke(wrapCombined({ ...launch, operationId: `${id}-released`, acceptDebuggerPauseEffects: true })), /original index owner/u); }
  finally { assert.equal(Reflect.deleteProperty(terminalOwner, "hasAttemptedNativeOwnerAllocation"), true); }
  await invoke(wrapCombined({ ...launch, operationId: `${id}-released`, acceptDebuggerPauseEffects: true }));
  assert.equal(allocations, 2); assert.notEqual(coordinators[1], terminalOwner);

  // The real lifecycle reader independently rejects an old durable operation
  // Before a replacement coordinator can call an installation verifier/factory.
  const consumedId = "footprint-combined-registration-durable-consumed";
  const intent = diagnosticLifecycleRecordSchemas["intent.json"].parse({ schema: "easyeda-pro-control.footprint-combined-launch-intent.v2",
    operationId: consumedId, createdAt: "2026-10-29T00:00:00.000Z", purpose: "worker-startup", facadeSha256: "a".repeat(64),
    installationSha256: "b".repeat(64), confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true,
    acceptDebuggerPauseEffects: true, dispatchProtocol: "challenge-ready-before-launch.v1" });
  await publishCurrentPcbDiagnosticLifecycleRecord(consumedId, "intent.json", intent);
  await publishCurrentPcbDiagnosticLifecycleRecord(consumedId, "combined-factory-before-launch.json", {
    schema: "easyeda-pro-control.footprint-combined-factory-before-launch.v1", operationId: consumedId,
    createdAt: "2026-10-29T00:00:00.000Z", intentSha256: sha256Json(intent), proof: { profile: "private.current-footprint-combined-before-launch-failure.v1",
      helperTransportClosed: true, launchRequestWritten: false, applicationLaunchDispatched: false, terminationProved: false } });
  let allocated = 0, verified = 0;
  const actual = new CurrentFootprintCombinedLifecycle({ pluginRoot: "/synthetic/plugin", assetsRoot: "/synthetic/assets",
    powershellSha256: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256, powershellBytes: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes,
    assertLocalAllowed: (): void => undefined, assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }, {
    verifyInstallation: (): never => { verified += 1; throw new Error("unexpected verification"); },
    allocateOwner: (): never => { allocated += 1; throw new Error("unexpected allocation"); } });
  await assert.rejects(actual.run({ ...launch, operationId: consumedId, acceptDebuggerPauseEffects: true }), /OPERATION_CONSUMED/u);
  assert.equal(verified, 0); assert.equal(allocated, 0); assert.equal(actual.hasAttemptedNativeOwnerAllocation(), false); assert.equal(actual.hasActiveReservation(), false);
});
