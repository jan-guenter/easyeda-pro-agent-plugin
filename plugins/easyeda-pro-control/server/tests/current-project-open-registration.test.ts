import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { createOperation } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import { currentDisposableOpenRequestSchema, queryCurrentDisposableOpen } from "../src/current-disposable-open.ts";
import { CurrentDisposableOpenCoordinator } from "../src/current-disposable-open-runtime.ts";

void test("actual project-open registration keeps strict lifecycle inputs and local baseline inspection during quarantine", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_open",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_editor_shell",', start);
  assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown; expectedFingerprint?: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined;
  let guards = 0, nativeOwners = 0, quarantineChecks = 0;
  const scope = vm.createContext({ z, currentDisposableOpenRequestSchema, CurrentDisposableOpenCoordinator,
    privateFingerprintSchema: z.unknown(), process: { env: {} },
    currentDisposableOpenCoordinator: undefined, ordinaryLaunchRuntime: undefined, windowsRuntime: undefined,
    closedSymbolIndexReservation: undefined, scheduledShutdown: undefined,
    ownedWindowsRuntime: (): never => { nativeOwners += 1; throw new Error("Native allocation forbidden in local inspection"); },
    engine: { assertBridgeDispatchAllowed: (): Promise<never> => { quarantineChecks += 1; return Promise.reject(new Error("quarantine")); } },
    serializedGuarded: (handler: Callback, options: { allowDuringOrphanRisk: unknown }): Callback => {
      assert.deepEqual(Object.keys(options), ["allowDuringOrphanRisk"]); assert.equal(options.allowDuringOrphanRisk, true); guards += 1; return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType; expectedFingerprint: z.ZodType };
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean } }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_project_open"); assert.deepEqual(Object.keys(config.inputSchema), ["request", "expectedFingerprint"]);
      assert.equal(config.annotations.readOnlyHint, false); assert.equal(config.annotations.destructiveHint, false); assert.equal(config.annotations.idempotentHint, false);
      invoke = handler; requestSchema = config.inputSchema.request;
    },
  });
  // Actual registration and coordinator; only its unavailable native boundary is
  // Doubled. The managed journal belongs to this test's isolated control root.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.equal(guards, 1); assert.ok(invoke); assert.ok(requestSchema);
  const operationId = "current-baseline-local-inspection", plan = { profile: "easyeda-pro-control.current-symbol-closed-baseline.v1" };
  await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan), state: "stopped",
    artifacts: [], orphanedCallPossible: true, nextSafeAction: "Inspect only; synthetic original owner is absent." });
  const request = { action: "baseline-inspect", operationId };
  for (const invalid of [{ ...request, code: "caller()" }, { ...request, target: {} }, { ...request, runtime: {} },
    { ...request, sourceSha256: "a".repeat(64) }, { ...request, action: "baseline-writer" }, { ...request, acceptUnqualifiedSchematicStartupEffects: true }]) {
    assert.equal(requestSchema.safeParse(invalid).success, false); await assert.rejects(invoke({ request: invalid }));
  }
  await assert.rejects(invoke({ request, expectedFingerprint: {} }), /cannot replace/u);
  const result = await invoke({ request: requestSchema.parse(request) });
  const resultSchema = z.object({ result: z.object({ operationId: z.literal(operationId), state: z.literal("stopped"),
    projectOpeningMode: z.null(), unqualifiedSchematicStartupEffectsAccepted: z.literal(false),
    originalOwnerRetained: z.literal(false), writerReady: z.literal(false), executionAuthorized: z.literal(false) }) });
  assert.ok(resultSchema.safeParse(result).success);
  const observedOperationId = "current-baseline-observation-inspection";
  await createOperation({ schema: OPERATION_SCHEMA, operationId: observedOperationId, plan, planHash: buildPlanHash(plan), state: "plan-invalidated",
    projectOpeningMode: "unqualified-schematic-startup-observation", artifacts: [], orphanedCallPossible: false,
    nextSafeAction: "Synthetic retired observation; effects remain unknown." });
  const historical = await invoke({ request: requestSchema.parse({ action: "baseline-inspect", operationId: observedOperationId }) });
  const historicalSchema = z.object({ result: z.object({ operationId: z.literal(observedOperationId), state: z.literal("plan-invalidated"),
    projectOpeningMode: z.literal("unqualified-schematic-startup-observation"), unqualifiedSchematicStartupEffectsAccepted: z.literal(true),
    originalOwnerRetained: z.literal(false), writerReady: z.literal(false), executionAuthorized: z.literal(false) }) });
  assert.ok(historicalSchema.safeParse(historical).success);
  assert.equal(nativeOwners, 0); assert.equal(quarantineChecks, 0);
  for (const continuation of ["baseline-observe-termination", "baseline-admit", "baseline-observe-caches", "baseline-observe-finish"]) {
    await assert.rejects(invoke({ request: { action: continuation, operationId } }), /unavailable/u);
  }
  assert.equal(nativeOwners, 0); assert.equal(quarantineChecks, 0);
});

void test("public baseline preparation requires distinct IDs and every approval, rejecting caller observations and continuation overrides", () => {
  const preparation = { checkpoint: { path: "/synthetic/checkpoint.eprj2", bytes: 4096, sha256: "a".repeat(64) },
    target: { projectUuid: "b".repeat(64), branchUuid: "c".repeat(32), ownerUuid: "d".repeat(32), symbolUuid: "e".repeat(16) }, patch: { name: "Prepared only" } };
  const request = { action: "baseline-begin", operationId: "baseline-test-operation", openingOperationId: "opening-test-operation",
    preparation, confirmNormalClose: true, confirmDisposableProject: true, acceptNormalOpenEffects: true };
  assert.equal(currentDisposableOpenRequestSchema.safeParse(request).success, true);
  for (const approval of ["confirmNormalClose", "confirmDisposableProject", "acceptNormalOpenEffects"]) {
    const missing = Object.fromEntries(Object.entries(request).filter(([key]) => key !== approval));
    assert.equal(currentDisposableOpenRequestSchema.safeParse(missing).success, false);
    assert.equal(currentDisposableOpenRequestSchema.safeParse({ ...request, [approval]: false }).success, false);
  }
  for (const invalid of [{ ...request, operationId: request.openingOperationId }, { ...request, preparation: { ...preparation, observationProjection: {} } },
    { ...request, runtime: {} }, { ...request, code: "caller()" }]) { assert.equal(currentDisposableOpenRequestSchema.safeParse(invalid).success, false); }
  for (const action of ["baseline-relaunch", "baseline-open-project"]) {
    const continuation = { action, operationId: request.operationId, acceptNormalOpenEffects: true };
    assert.equal(currentDisposableOpenRequestSchema.safeParse(continuation).success, true);
    assert.equal(currentDisposableOpenRequestSchema.safeParse({ action, operationId: request.operationId }).success, false);
    assert.equal(currentDisposableOpenRequestSchema.safeParse({ ...continuation, target: preparation.target }).success, false);
  }
  assert.equal(currentDisposableOpenRequestSchema.safeParse({ action: "baseline-finish-close", operationId: request.operationId,
    confirmNormalClose: true, acceptUnknownFileEffects: true }).success, true);
  assert.equal(currentDisposableOpenRequestSchema.safeParse({ action: "baseline-finish-close", operationId: request.operationId,
    confirmNormalClose: true }).success, false);
});

void test("schematic-startup acceptance is a literal opt-in only on project-only navigation and grants no catalog authority", () => {
  const request = { action: "baseline-open-project", operationId: "baseline-optional-startup", acceptNormalOpenEffects: true };
  assert.equal(currentDisposableOpenRequestSchema.safeParse(request).success, true);
  assert.equal(currentDisposableOpenRequestSchema.safeParse({ ...request, acceptUnqualifiedSchematicStartupEffects: true }).success, true);
  for (const value of [false, "true", 1, null, {}]) {
    assert.equal(currentDisposableOpenRequestSchema.safeParse({ ...request, acceptUnqualifiedSchematicStartupEffects: value }).success, false);
  }
  for (const action of ["baseline-relaunch", "baseline-admit", "baseline-observe-caches", "baseline-observe-termination", "baseline-inspect", "baseline-observe-finish"]) {
    const other = action === "baseline-relaunch" ? { action, operationId: request.operationId, acceptNormalOpenEffects: true } : { action, operationId: request.operationId };
    assert.equal(currentDisposableOpenRequestSchema.safeParse(other).success, true);
    assert.equal(currentDisposableOpenRequestSchema.safeParse({ ...other, acceptUnqualifiedSchematicStartupEffects: true }).success, false);
  }
  const catalog = queryCurrentDisposableOpen({ includeSchemas: true });
  assert.equal(catalog["offline"], true); assert.equal(catalog["invocationEnabledByDiscovery"], false);
  const serialized = JSON.stringify(catalog);
  assert.ok(serialized.includes("Schematic initialization may rewrite documents or queue persistence."));
  assert.ok(serialized.includes("Acceptance never grants startup, opening-effect, persistence or writer authority."));
});
