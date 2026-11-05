/** Actual registration guards with inert coordinators; no native process or historical collector runs. */
/* oxlint-disable max-classes-per-file -- Two inert controller peers exercise the distinct production constructor paths. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { SerializedGate } from "../src/engine.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { currentFootprintForwardOpeningRelinquishmentRequestSchema } from "../src/current-footprint-forward-opening-relinquishment-contract.ts";

type Row = Record<string, unknown>;
type Handler = (input: { request: unknown }) => Promise<unknown>;
const digest = "a".repeat(64), operationId = "footprint-copy-qualify-registration";
const historical = { action: "relinquish-unknown-opening", operationId, expectedIntentSha256: digest,
  expectedBindingSha256: digest, expectedOpeningIntentSha256: digest,
  confirmRelinquishUnknownOpening: true, acceptUnknownCaptureOutcome: true };
const wrap = (request: object): { request: object } => ({ request: { action: "footprint-forward-opening-relinquishment", request } });

/** Bound extraction to the named historical dispatcher, its guard state and
 * actual tool registration; unrelated entrypoint code never enters the VM. */
function registrationSource(source: string): string {
  const blocks = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.flatMap(statement =>
    statement.type === "IfStatement" && statement.consequent.type === "BlockStatement" && statement.consequent.body.some(node =>
      node.type === "VariableDeclaration" && node.declarations.some(declaration => declaration.id.type === "Identifier" && declaration.id.name === "runStartup")) ? [statement.consequent] : []);
  assert.equal(blocks.length, 1); const block = blocks[0]; assert.ok(block);
  const names = ["mainOriginal", "heldCacheOriginal", "resettableDiagnosticOwnerAllocated", "heldCacheCalls", "runHeldCache",
    "headAgeOriginal", "headAgeCalls", "startupOriginal", "startupCalls", "combinedHistoricalOriginal",
    "forwardOpeningHistoricalOriginal", "runForwardOpeningHistorical", "runStartup"];
  const selected = names.map(name => {
    const nodes = block.body.filter(node => node.type === "VariableDeclaration" && node.declarations.length === 1 &&
      node.declarations[0]?.id.type === "Identifier" && node.declarations[0].id.name === name);
    assert.equal(nodes.length, 1); const node = nodes[0]; assert.ok(node);
    let limit = 3000;
    if (name === "runStartup") { limit = 28_000; }
    else if (name === "runForwardOpeningHistorical" || name === "runHeldCache") { limit = 10_000; }
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

/** Preserve the real gate, callback and owner identity checks while the inert
 * coordinator holds a deterministic publication barrier instead of native work. */
async function fixture(): Promise<Readonly<{ invoke: Handler; scope: vm.Context; entered: Promise<null>;
  release: () => void; allocations: () => number; collections: () => number; replaceMethod: () => void }>> {
  const entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  let allocations = 0, collections = 0;
  interface Options { assertLocalAllowed: () => void; assertAllowed: () => Promise<void>; assertFreshNoOwnedAllocations: () => void }
  class Historical {
    readonly #options: Options;
    #reserved = false;
    public constructor(options: Options) { this.#options = options; allocations += 1; }
    /** Exercise pre-collection and post-publication admission with the same receiver. */
    public async run(request: unknown): Promise<Row> {
      currentFootprintForwardOpeningRelinquishmentRequestSchema.parse(request);
      this.#reserved = true;
      try {
        this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations(); await this.#options.assertAllowed();
        collections += 1; entered.resolve(null); await release.promise;
        this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
        return { synthetic: true, executionReady: false, captureOutcome: "unknown" };
      } finally { this.#reserved = false; }
    }
    public hasActiveReservation(): boolean { return this.#reserved; }
  }
  class FailedReplacement {
    readonly #reserved = false;
    public constructor() { throw new Error("synthetic replacement constructor failed"); }
    public run(): Promise<Row> { return Promise.resolve({ synthetic: this.#reserved }); }
    public hasActiveReservation(): boolean { return this.#reserved; }
    public hasOwnedAllocation(): boolean { return this.#reserved; }
  }
  const gate = new SerializedGate(), upstream = {};
  const engine = { upstream, controlFingerprintPromise: Promise.resolve(), executionAuthorityValidator: (): void => undefined,
    assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => Promise.resolve() };
  let handler: Handler | undefined;
  const scope = vm.createContext({ z, currentPcb209WorkerStartupToolRequestSchema, currentSymbolOperationToolOutputSchema: z.unknown(),
    CurrentFootprintForwardOpeningUnknownRelinquishment: Historical, CurrentFootprintHeldCacheValidation: FailedReplacement,
    diagnostic209: true, facadeMode: "public-utilities-only", facadeToolRegistered: (): boolean => true,
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "synthetic" } },
    resolve: (): string => "/synthetic/plugin", retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    CURRENT_PCB_DIAGNOSTIC_PROFILE: { powershell: { sha256: digest, bytes: 1 } }, engine, upstream, bridgeGate: gate,
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, ordinaryLaunchCoordinator: undefined,
    currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined,
    currentFootprintHeldCacheValidation: undefined, currentFootprintHeadAgeValidation: undefined, currentFootprintForwardSourceValidation: undefined, hasForwardSourceCustody: (): boolean => false,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
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
    vm.runInContext(selected.replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  }
  assert.ok(handler);
  return { invoke: handler, scope, entered: entered.promise, release: (): void => { release.resolve(null); },
    allocations: (): number => allocations, collections: (): number => collections,
    replaceMethod: (): void => { Object.defineProperty(Historical.prototype, "run", { value: (): never => assert.fail("Replacement must not run") }); } };
}

void test("historical registration rejects injected authority, retains its reservation and pins original methods", async () => {
  const f = await fixture();
  for (const request of [{ ...historical, originalPid: 42 }, { ...historical, acceptUnknownCaptureOutcome: false }, { ...historical, action: "capture-project" }]) {
    await assert.rejects(f.invoke(wrap(request)));
  }
  assert.equal(f.allocations(), 0); assert.equal(f.collections(), 0);
  const pending = f.invoke(wrap(historical)); await f.entered;
  try {
    await assert.rejects(f.invoke({ request: { action: "footprint-forward-prewrite", request: { action: "inspect", operationId } } }), /historical relinquishment reserves/u);
    assert.equal(f.allocations(), 1); assert.equal(f.collections(), 1); f.replaceMethod();
  } finally { f.release(); }
  await assert.rejects(pending, /coordinator changed/u);
  await assert.rejects(f.invoke(wrap(historical)), /coordinator changed/u);
  assert.equal(f.collections(), 1);
});

void test("historical registration refuses retained owners and remembers a cleared slot after replacement failure", async () => {
  const f = await fixture();
  vm.runInContext("ordinaryLaunchCoordinator = {}", f.scope);
  await assert.rejects(f.invoke(wrap(historical)), /fresh facade/u);
  vm.runInContext("ordinaryLaunchCoordinator = undefined", f.scope);
  vm.runInContext(`heldCacheOriginal = { owner: { hasActiveReservation() { return false; }, hasOwnedAllocation() { return false; } }, assertLocal() {} };
    currentFootprintHeldCacheValidation = heldCacheOriginal.owner`, f.scope);
  assert.throws(() => vm.runInContext('runHeldCache({ action: "launch" })', f.scope), /replacement constructor failed/u);
  assert.equal(vm.runInContext("heldCacheOriginal === undefined && currentFootprintHeldCacheValidation === undefined", f.scope), true);
  await assert.rejects(f.invoke(wrap(historical)), /fresh facade/u);
  assert.equal(f.allocations(), 0); assert.equal(f.collections(), 0);
});
