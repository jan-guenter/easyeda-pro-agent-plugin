/* oxlint-disable import/max-dependencies -- This extracted-module fixture retains the independent production schemas and exact source/gate collaborators. */
/** Actual Source registration and guards with an inert metadata coordinator.
 * No historical evidence, application, process observer or native helper runs. */
import assert from "node:assert/strict";
import { installIndexFixtureDependencies } from "./helpers/index-fixture-dependencies.ts";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { SerializedGate } from "../src/engine.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { currentFootprintForwardSourceRelinquishmentRequestSchema } from "../src/current-footprint-forward-source-relinquishment-contract.ts";

type Row = Record<string, unknown>;
type Handler = (input: { request: unknown }) => Promise<unknown>;
const digest = "a".repeat(64), operationId = "footprint-forward-execution-registration";
const historical = { action: "relinquish-unknown-source-opening", operationId, expectedManifestSha256: digest,
  expectedRosterSha256: digest, expectedIntentSha256: digest, expectedBindingSha256: digest,
  confirmRelinquishUnknownSourceOpening: true, acceptUnknownCaptureOutcome: true };
const wrap = (request: object): { request: object } => ({ request: { action: "footprint-forward-source-relinquishment", request } });

/** Extract only the real Source coordinator wrapper, retained guard state,
 * startup dispatcher and strict tool callback. Unrelated entrypoint work is absent. */
function registrationSource(source: string): string {
  const blocks = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.flatMap(statement =>
    statement.type === "IfStatement" && statement.consequent.type === "BlockStatement" && statement.consequent.body.some(node =>
      node.type === "VariableDeclaration" && node.declarations.some(declaration => declaration.id.type === "Identifier" && declaration.id.name === "runStartup")) ? [statement.consequent] : []);
  assert.equal(blocks.length, 1); const block = blocks[0]; assert.ok(block);
  const names = ["mainOriginal", "heldCacheOriginal", "resettableDiagnosticOwnerAllocated", "heldCacheCalls",
    "headAgeOriginal", "headAgeCalls", "viaPreopeningHistoricalOriginal", "startupOriginal", "startupCalls", "combinedHistoricalOriginal",
    "forwardOpeningHistoricalOriginal", "forwardSourceHistoricalOriginal", "runForwardSourceHistorical", "runStartup"];
  const selected = names.map(name => {
    const nodes = block.body.filter(node => node.type === "VariableDeclaration" && node.declarations.length === 1 &&
      node.declarations[0]?.id.type === "Identifier" && node.declarations[0].id.name === name);
    assert.equal(nodes.length, 1); const node = nodes[0]; assert.ok(node);
    let limit = 3000;
    if (name === "runStartup") { limit = 28_000; }
    else if (name === "runForwardSourceHistorical") { limit = 10_000; }
    assert.ok(node.end > node.start && node.end - node.start < limit);
    return source.slice(node.start, node.end);
  });
  const registrations = block.body.filter(node => node.type === "IfStatement" && node.consequent.type === "BlockStatement" &&
    node.consequent.body.some(statement => statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression" &&
      statement.expression.callee.type === "MemberExpression" && statement.expression.callee.object.type === "Identifier" &&
      statement.expression.callee.object.name === "server" && statement.expression.callee.property.type === "Identifier" &&
      statement.expression.callee.property.name === "registerTool" && statement.expression.arguments[0]?.type === "Literal" &&
      statement.expression.arguments[0].value === "easyeda_control_pcb209_worker_startup"));
  assert.equal(registrations.length, 1); const registration = registrations[0]; assert.ok(registration);
  assert.ok(registration.end - registration.start < 16_000);
  return [...selected, source.slice(registration.start, registration.end)].join("\n");
}

/** Exercise the real gate and retained method identities around a delayed
 * publication acknowledgment. This coordinator never receives native custody. */
async function fixture(): Promise<Readonly<{ invoke: Handler; scope: vm.Context; entered: Promise<null>;
  release: () => void; allocations: () => number; collections: () => number; scans: () => number; replaceMethod: () => void;
  assertRetirement: () => void }>> {
  const entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  let allocations = 0, collections = 0, scans = 0;
  interface Options {
    assertLocalAllowed: () => void; assertFreshNoOwnedAllocations: () => void;
    assertOtherLaunchesSettled: (snapshot: object) => Promise<void>;
  }
  const snapshot = Object.freeze({ synthetic: true });
  class Historical {
    readonly #options: Options;
    #reserved = false;
    #pending = false;
    public constructor(options: Options) { this.#options = options; allocations += 1; }
    /** The first acknowledgment is unknown. The next call settles those same
     * pending bytes without collecting a second observation or allocating again. */
    public async run(request: unknown): Promise<Row> {
      currentFootprintForwardSourceRelinquishmentRequestSchema.parse(request);
      this.#reserved = true;
      this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
      await this.#options.assertOtherLaunchesSettled(snapshot);
      if (!this.#pending) {
        collections += 1; entered.resolve(null); await release.promise;
        this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
        this.#pending = true; throw new Error("synthetic publication acknowledgment unknown");
      }
      this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
      this.#pending = false; this.#reserved = false;
      return { synthetic: true, executionReady: false, executionAuthorized: false, saveAuthorized: false,
        captureOutcome: "unknown", terminationOutcome: "unknown", helperReleaseOutcome: "unknown" };
    }
    public hasActiveReservation(): boolean { return this.#reserved; }
  }
  const gate = new SerializedGate(), upstream = {};
  const engine = { upstream, controlFingerprintPromise: Promise.resolve(), executionAuthorityValidator: (): void => undefined,
    assertForwardSourceRelinquishmentOtherOperationsSettled: (actual: object): Promise<void> => {
      assert.equal(actual, snapshot); scans += 1; return Promise.resolve();
    } };
  let handler: Handler | undefined;
  const scope = vm.createContext({ stagedComponentOpeningSource: undefined, z, currentPcb209WorkerStartupToolRequestSchema, currentSymbolOperationToolOutputSchema: z.unknown(),
    CurrentFootprintForwardSourceUnknownRelinquishment: Historical,
    diagnostic209: true, facadeMode: "public-utilities-only", facadeToolRegistered: (): boolean => true,
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "synthetic" } },
    resolve: (): string => "/synthetic/plugin", retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    CURRENT_PCB_DIAGNOSTIC_PROFILE: { powershell: { sha256: digest, bytes: 1 } }, engine, upstream, bridgeGate: gate,
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, ordinaryLaunchCoordinator: undefined,
    currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined,
    currentFootprintHeldCacheValidation: undefined, currentFootprintHeadAgeValidation: undefined, currentFootprintForwardSourceValidation: undefined,
    hasForwardSourceCustody: (): boolean => false,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    assertUnusedForwardSourceHistoricalRetirement: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined,
    guarded: (registered: Handler): Handler => async input => { const result = await registered(input); return result; },
    server: { registerTool: (name: string, _config: unknown, registered: Handler): void => {
      assert.equal(name, "easyeda_control_pcb209_worker_startup"); handler = registered;
    } },
  });
  const source = stripTypeScriptTypes(await readFile(new URL("../src/index.ts", import.meta.url), "utf8"));
  const helperStart = source.indexOf("function disposableOwnData(");
  const helperEnd = source.indexOf("\n}", source.indexOf("function disposableOwnerMethod(", helperStart)) + 2;
  assert.ok(helperStart > 0 && helperEnd > helperStart);
  for (const selected of [source.slice(helperStart, helperEnd), registrationSource(source)]) {
    assert.ok(selected.length > 0 && selected.length < 60_000);
    installIndexFixtureDependencies(scope,source);
    vm.runInContext(selected.replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  }
  assert.ok(handler);
  return { invoke: handler, scope, entered: entered.promise, release: (): void => { release.resolve(null); },
    allocations: (): number => allocations, collections: (): number => collections, scans: (): number => scans,
    assertRetirement: (): void => { vm.runInContext("assertUnusedForwardSourceHistoricalRetirement()", scope); },
    replaceMethod: (): void => { Object.defineProperty(Historical.prototype, "run", { value: (): never => assert.fail("Replacement must not run") }); } };
}

void test("Source historical registration retains unknown publication and settles only on its original coordinator", async () => {
  const f = await fixture();
  for (const request of [{ ...historical, originalPid: 42 }, { ...historical, acceptUnknownCaptureOutcome: false },
    { ...historical, expectedManifestSha256: "invalid" }, { ...historical, action: "capture-source" }]) {
    await assert.rejects(f.invoke(wrap(request)));
  }
  assert.equal(f.allocations(), 0); assert.equal(f.collections(), 0); assert.equal(f.scans(), 0);
  const pending = f.invoke(wrap(historical)); await f.entered;
  try {
    assert.throws(() => { f.assertRetirement(); }, /original finished unused/u);
    await assert.rejects(f.invoke({ request: { action: "footprint-forward-prewrite", request: { action: "inspect", operationId: "footprint-copy-qualify-registration" } } }), /source historical relinquishment reserves/u);
    assert.equal(f.allocations(), 1); assert.equal(f.collections(), 1); assert.equal(f.scans(), 1);
  } finally { f.release(); }
  await assert.rejects(pending, /publication acknowledgment unknown/u);
  assert.throws(() => { f.assertRetirement(); }, /original finished unused/u);
  assert.equal(vm.runInContext("currentPcbWorkerStartupLifecycle === forwardSourceHistoricalOriginal.owner", f.scope), true);
  await assert.rejects(f.invoke({ request: { action: "footprint-forward-prewrite", request: { action: "inspect", operationId: "footprint-copy-qualify-registration" } } }), /source historical relinquishment reserves/u);
  const settled = await f.invoke(wrap(historical));
  assert.ok(settled !== null && typeof settled === "object" && "result" in settled);
  assert.deepEqual(settled.result, { synthetic: true, executionReady: false, executionAuthorized: false, saveAuthorized: false,
    captureOutcome: "unknown", terminationOutcome: "unknown", helperReleaseOutcome: "unknown" });
  assert.equal(f.allocations(), 1); assert.equal(f.collections(), 1); assert.equal(f.scans(), 2);
  assert.equal(vm.runInContext("currentPcbWorkerStartupLifecycle === undefined", f.scope), true);
  assert.doesNotThrow(() => { f.assertRetirement(); });
  f.replaceMethod();
  assert.throws(() => { f.assertRetirement(); }, /coordinator changed/u);
  await assert.rejects(f.invoke(wrap(historical)), /coordinator changed/u);
  assert.equal(f.scans(), 2);
});

void test("unused metadata retirement retains the exact fresh-allocation assertion and monotonic native-allocation flag", async () => {
  for (const mutation of ["resettableDiagnosticOwnerAllocated = true", "forwardSourceHistoricalOriginal.assertFreshNoOwnedAllocations = () => {}",
    "forwardSourceHistoricalOriginal.reserved = () => false", "forwardSourceHistoricalOriginal.run = async () => ({})",
    "forwardSourceHistoricalOriginal.owner = {}"] as const) {
    const f = await fixture(), pending = f.invoke(wrap(historical)); await f.entered; f.release();
    await assert.rejects(pending, /publication acknowledgment unknown/u); await f.invoke(wrap(historical));
    assert.doesNotThrow(() => { f.assertRetirement(); });
    vm.runInContext(mutation, f.scope);
    assert.throws(() => { f.assertRetirement(); }, /fresh facade|original finished unused/u);
  }
});

void test("Source historical registration refuses prior owner allocation before creating its coordinator", async () => {
  const f = await fixture();
  vm.runInContext("ordinaryLaunchCoordinator = {}", f.scope);
  await assert.rejects(f.invoke(wrap(historical)), /fresh facade/u);
  assert.equal(f.allocations(), 0); assert.equal(f.scans(), 0);
});
