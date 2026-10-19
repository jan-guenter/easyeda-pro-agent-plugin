/* oxlint-disable import/max-dependencies -- Exercise the actual shared issuer with original request schemas and explicit realm-only boundary I/O. */
/** Actual opener source in a private realm with synthetic boundary I/O.
 * These tests issue no production owner and never launch or contact EasyEDA.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, isRecord, sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest } from "../src/current-disposable-open.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { parseCurrentSchematicRenameOwnerRequest } from "../src/current-schematic-rename-owner.ts";
import { parseCurrentPcbRenameOwnerRequest } from "../src/current-pcb-rename-owner.ts";
import { currentSymbolBaselineRequestSchema } from "../src/current-symbol-baseline-runtime.ts";
import { currentOwnedSymbolCopyRequestSchema } from "../src/current-symbol-owned-preparation.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSchematicOperationOpeningRequestSchema } from "../src/current-schematic-operation.ts";
import { currentSchematicOpeningExpectationSchema } from "../src/current-schematic-operation-startup.ts";
import { currentSymbolStartupExpectationSchema } from "../src/current-symbol-startup.ts";

type Bag = Record<string, unknown>;
const OPEN = "synthetic-schematic-opening", OWNER = "synthetic-schematic-owner";
function noOp(): undefined { return undefined; }
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(options: Readonly<{ scopeFailure?: boolean; holdUnused?: boolean; injected?: boolean; closed?: boolean; ordinary?: boolean }> = {}): Promise<{
  request: ReturnType<typeof parseCurrentSchematicRenameOwnerRequest>;
  begin: (request?: unknown, sibling?: boolean) => Promise<unknown>;
  beginOrdinary: (request?: unknown) => Promise<unknown>;
  get: (id?: string) => unknown;
  original: (owner: unknown, wrongEngine?: boolean) => unknown;
  completed: (owner: unknown) => unknown;
  revalidate: (owner: unknown) => Promise<unknown>;
  evidence: (owner: unknown) => Promise<unknown>;
  reserved: () => boolean;
  pcb: () => Promise<unknown>;
  pcbOriginal: (owner: unknown) => unknown;
  symbol: () => Promise<unknown>;
  mutate: (kind: "owner" | "validator" | "launch" | "disk" | "session" | "status" | "capture" | "clock" | "release") => void;
  release: () => void;
  state: { unused: number; scopes: number; admissions: number; owner: boolean; actions: string[] };
}> {
  const rawWindowsPath = String.raw`C:\Synthetic\SchematicFixture.eprj2`;
  const projectUuid = sha256Text(rawWindowsPath);
  const target = { rawWindowsPath, projectUuid, documentUuid: "1".repeat(16), branchUuid: "2".repeat(32), expectedSourceSha256: "3".repeat(64) };
  const request = parseCurrentSchematicRenameOwnerRequest({ operationId: OWNER,
    target: { projectUuid, branchUuid: target.branchUuid, schematicUuid: "a".repeat(16), ownerUuid: "6".repeat(32) }, desiredTitle: "Renamed SCH" });
  const childUuid = "c".repeat(16), rename = { target: request.target, desiredTitle: request.desiredTitle };
  const schematicExpectation = currentSchematicOpeningExpectationSchema.parse({ intent: rename, startup: { sheetUuids: [childUuid], templates: [] },
    peers: [{ uuid: request.target.schematicUuid, name: "source sch", displayName: "Source SCH", source: "", version: "1", boardUuid: "", ticket: 1, updateTime: 1 }],
    childKv: { [childUuid]: { uuid: childUuid, project_uuid: projectUuid, schematic_uuid: request.target.schematicUuid, title: "child", display_title: "Child",
      docType: 1, zIndex: 0, source: "", version: "1", updateTime: 1, ticket: 2 } },
    targetAst: { uuid: request.target.schematicUuid, title: "source sch", displayTitle: "Source SCH", board: "", version: "1", updateTime: 1, blockSymbolUuid: "",
      sort: [childUuid], sheets: { [childUuid]: { uuid: childUuid, title: "child", displayTitle: "Child", zIndex: 0 } } } });
  const ordinary = options.ordinary === true;
  const sealed = ordinary ? { startupExpectation: schematicExpectation.startup, schematicExpectation } : {};
  const openingRequest = { action: "open", operationId: OPEN, rawWindowsPath, projectUuid, documentUuid: target.documentUuid,
    expectedSourceSha256: target.expectedSourceSha256, confirmDisposableProject: true, acceptNormalOpenEffects: true,
    ...(ordinary ? { rename } : {}) };
  const launch = { jobId: "4".repeat(32), helperInstance: "5".repeat(32),
    root: { pid: 50, role: "easyeda-main", startIdentity: `win32:12345678901234567:job:${"4".repeat(32)}` } };
  const prior = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 2,
    authenticationReceiptSha256: "6".repeat(64), authenticatedAtEpochMs: 1000 };
  const fingerprint = { synthetic: true, installedBundles: { assetsRoot: "/synthetic/assets" } };
  const purpose = ordinary ? CURRENT_SCHEMATIC_OPERATION_PURPOSE : "disposable-validation";
  const plan = { profile: "easyeda-pro-control.current-disposable-open.v1", purpose,
    intent: { request: openingRequest, target, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, ...sealed }, expectedFingerprint: fingerprint };
  const journal: Bag = { schema: OPERATION_SCHEMA, operationId: OPEN, journalPath: "/synthetic/opening.json", plan, planHash: buildPlanHash(plan),
    state: "completed", mutationState: "not-inferred", saved: false, reopened: false, hardStop: false, orphanedCallPossible: false,
    mutationMayHaveOccurred: true, sequence: 4, artifacts: [], updatedAt: "2026-10-18T00:00:00.000Z", nextSafeAction: "Synthetic opening",
    projectDispatchConsumed: true, documentDispatchConsumed: true, result: { outcome: "target-native-identity-observed" },
    checkpointProof: { profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: {}, targetEvidence: {},
      ...(ordinary ? { purpose, ...sealed } : {}) },
    originalLaunch: launch, bridgeSessionBeforeOrphan: prior, bridgeDispatchBeforeOrphan: {},
    ...(options.closed === true ? { normalCloseAttempted: true } : {}) };
  let currentLaunch = launch, disk = structuredClone(journal), scopeDepth = 0, sessionPresent = true;
  const barrier = Promise.withResolvers<boolean>();
  const state = { unused: 0, scopes: 0, admissions: 0, owner: true, actions: [] as string[] };
  const forbidden = (name: string): never => { state.actions.push(name); throw new Error(`Unexpected action ${name}`); };
  const runtime = { status: (): Bag => ({ state: "owned", launch: currentLaunch }),
    normalClose: (): never => forbidden("normal-close"), observeApplicationWindow: (): never => forbidden("window"),
    observeLaunchTermination: (): never => forbidden("termination") };
  const engine = { status: (): Promise<{ stableFingerprint: typeof fingerprint }> => Promise.resolve({ stableFingerprint: fingerprint }),
    assertBridgeAndRecoveryAdmission: (): Promise<void> => { state.admissions += 1; return Promise.resolve(); },
    captureClosedSessionAuthority: (): never => forbidden("capture"), clockObservationForClosedCapture: (): never => forbidden("clock"),
    releaseClosedSessionAuthority: (): never => forbidden("release"),
    executionAuthorityValidator: {}, upstream: {
      currentAuthenticatedBridgeDispatchBinding: (): unknown => scopeDepth > 0 ? { synthetic: true } : undefined,
      withAuthenticatedBridgeDispatchScope: async (task: () => Promise<unknown>): Promise<unknown> => {
        state.scopes += 1; scopeDepth += 1;
        try { const result = await task(); if (options.scopeFailure === true) { throw new Error("Synthetic scope exit failure"); } return result; }
        finally { scopeDepth -= 1; }
      },
      bridgeSessionLifecycle: (): Bag => { const { gatewayInstanceId, ...activeSession } = prior;
        return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId, activeSession: sessionPresent ? activeSession : null }; },
    } };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-disposable-open-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ z, Object, Reflect, Promise, structuredClone, canonicalJson, buildPlanHash, isRecord, sha256Text, assertSubset, OPERATION_SCHEMA,
    CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest, parseCurrentSchematicRenameOwnerRequest, parseCurrentPcbRenameOwnerRequest,
    CURRENT_SYMBOL_OPERATION_PURPOSE: "ordinary-symbol-metadata", EasyedaControlEngine: Object, WindowsControlRuntime: Object,
    CURRENT_SCHEMATIC_OPERATION_PURPOSE: "ordinary-schematic-rename",
    currentSchematicOperationOpeningRequestSchema, currentSchematicOpeningExpectationSchema, currentSymbolStartupExpectationSchema,
    currentSymbolBaselineRequestSchema, currentOwnedSymbolCopyRequestSchema,
    CurrentSymbolBaselineCoordinator: class { public readonly syntheticBoundary = true; },
    prepareCurrentOwnedSymbolMetadata: (): never => { throw new Error("Synthetic symbol source-preparation stop"); },
    createOperation: (): never => forbidden("create-operation"), updateOperation: (): never => forbidden("update-operation"),
    writePhaseArtifact: (): never => forbidden("artifact"),
    loadOperation: (id: string): Promise<Bag> => { assert.equal(id, OPEN); return Promise.resolve(structuredClone(disk)); },
    assertOperationIdUnused: (): Promise<unknown> => { state.unused += 1; return options.holdUnused === true ? barrier.promise : Promise.resolve(); },
    prepareCurrentDisposableOpenCheckpoint: noOp, verifyCurrentDisposableOpenCheckpoint: noOp,
    prepareCurrentSymbolOperationCheckpoint: noOp, verifyCurrentSymbolOperationCheckpoint: noOp,
    prepareCurrentSchematicOperationCheckpoint: noOp, verifyCurrentSchematicOperationCheckpoint: noOp,
    verifyCurrentDisposableOpenImplementation: noOp, validateSdkLocalRuntimeFingerprint: noOp,
    testPcbRequest: { operationId: "synthetic-pcb-owner", target: { projectUuid, branchUuid: target.branchUuid, pcbUuid: target.documentUuid, ownerUuid: "6".repeat(32) }, desiredTitle: "Renamed PCB" },
    testSymbolRequest: { operationId: "synthetic-symbol-owner", preparation: { checkpoint: { path: "/synthetic/checkpoint.eprj2", bytes: 1, sha256: "1".repeat(64) },
      target: { projectUuid, branchUuid: target.branchUuid, ownerUuid: "6".repeat(32), symbolUuid: "7".repeat(16) }, patch: { name: "Renamed symbol" } }, confirmNormalClose: true },
    testEngine: engine, testInjected: options.injected === true,
    testOptions: { engine, runtime: (): typeof runtime => runtime, assertOwner: (): void => { assert.equal(state.owner, true, "Synthetic owner lost"); } },
    testOpening: { journal, runtime, launch, launchText: canonicalJson(launch), planText: canonicalJson(plan),
      nativeCleanup: { status: runtime.status, normalClose: runtime.normalClose, observeApplicationWindow: runtime.observeApplicationWindow } },
  });
  // Only this isolated evaluation can seed lexical retained slots. No public
  // Production API receives a factory, supplied owner or replacement engine.
  const api = bag(runInContext(`${program}
const first=new CurrentDisposableOpenCoordinator(testOptions,testInjected?{assertOperationIdUnused}:{});
const sibling=new CurrentDisposableOpenCoordinator(testOptions);
first.retained.set('${OPEN}',testOpening);sibling.retained.set('${OPEN}',testOpening);
({begin:(request,useSibling)=>(useSibling?sibling:first).prepareSchematicRenameOpeningOwner('${OPEN}',request),
beginOrdinary:request=>first.prepareOrdinarySchematicRenameOpeningOwner('${OPEN}',request),
get:id=>first.getSchematicRenameOpeningOwner(id),original:(value,wrong)=>assertCurrentSchematicRenameOpeningOwner(value,wrong?{}:testEngine),
completed:value=>assertCompletedCurrentSchematicRenameOpeningTransfer(value,testEngine),
revalidate:value=>revalidateCurrentSchematicRenameOpeningOwner(value,testEngine),
evidence:value=>revalidateCurrentSchematicRenameOpeningEvidence(value,testEngine),pcb:()=>sibling.preparePcbRenameOpeningOwner('${OPEN}',testPcbRequest),
symbol:()=>sibling.beginSymbolBaseline('${OPEN}',testSymbolRequest,{}),
pcbOriginal:value=>assertCurrentPcbRenameOpeningOwner(value,testEngine),reserved:()=>baselineRuntimeReservations.has(testOpening.runtime)});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const method = api[name]; assert.ok(typeof method === "function");
    return Reflect.apply(method, undefined, args) as unknown; };
  return { request, begin: async (input = request, sibling = false): Promise<unknown> => await invoke("begin", [input, sibling]),
    beginOrdinary: async (input = request): Promise<unknown> => await invoke("beginOrdinary", [input]),
    get: (id = OWNER): unknown => invoke("get", [id]), original: (owner, wrong = false): unknown => invoke("original", [owner, wrong]),
    completed: (owner): unknown => invoke("completed", [owner]), revalidate: async (owner): Promise<unknown> => await invoke("revalidate", [owner]),
    evidence: async (owner): Promise<unknown> => await invoke("evidence", [owner]),
    pcb: async (): Promise<unknown> => await invoke("pcb", []), pcbOriginal: (owner): unknown => invoke("pcbOriginal", [owner]),
    symbol: async (): Promise<unknown> => await invoke("symbol", []),
    reserved: (): boolean => invoke("reserved", []) === true, release: (): void => { barrier.resolve(true); }, state,
    mutate: (kind): void => {
      if (kind === "owner") { state.owner = false; }
      else if (kind === "validator") { engine.executionAuthorityValidator = { changed: true }; }
      else if (kind === "launch") { currentLaunch = { ...launch, jobId: "9".repeat(32) }; }
      else if (kind === "session") { sessionPresent = false; }
      else if (kind === "status") { runtime.status = (): never => forbidden("changed-status"); }
      else if (kind === "capture") { engine.captureClosedSessionAuthority = (): never => forbidden("changed-capture"); }
      else if (kind === "clock") { engine.clockObservationForClosedCapture = (): never => forbidden("changed-clock"); }
      else if (kind === "release") { engine.releaseClosedSessionAuthority = (): never => forbidden("changed-release"); }
      else { disk = { ...disk, nextSafeAction: "Changed journal" }; }
    } };
}

void test("SCH transfer retains the exact original opener, intent and one shared-runtime reservation without dispatch", async () => {
  const f = await fixture(), owner = await f.begin();
  const original = bag(f.original(owner));
  assert.equal(f.get(), owner); assert.equal(f.reserved(), true); assert.equal(f.completed(owner), original);
  assert.equal(await f.revalidate(owner), original);
  assert.deepEqual(structuredClone(original["intent"]), { target: f.request.target, desiredTitle: f.request.desiredTitle });
  assert.equal(bag(original["source"])["purpose"], "disposable-validation"); assert.equal(Object.isFrozen(owner), true);
  assert.throws(() => f.original(structuredClone(owner)), /not issued/u); assert.throws(() => f.original(owner, true), /not issued/u);
  await assert.rejects(f.begin(), /distinct unused/u);
  await assert.rejects(f.begin({ ...f.request, operationId: "second-owner" }), /transferred/u);
  assert.deepEqual(f.state.actions, []); assert.equal(f.state.scopes, 1);
});

void test("ordinary SCH owner transfer binds the sealed pre-navigation intent and rejects every sibling-purpose entry", async () => {
  const f = await fixture({ ordinary: true });
  await assert.rejects(f.begin(), /same purpose/u);
  await assert.rejects(f.pcb(), /disposable/u); await assert.rejects(f.symbol());
  for (const request of [{ ...f.request, desiredTitle: "Another title" },
    ...["ownerUuid", "branchUuid", "schematicUuid"].map(key => Object.assign(structuredClone(f.request), {
      target: Object.assign(structuredClone(f.request.target), { [key]: "9".repeat(key === "schematicUuid" ? 16 : 32) }) }))]) {
    await assert.rejects(f.beginOrdinary(request), /pre-navigation rename intention/u);
  }
  assert.equal(f.reserved(), false); assert.equal(f.state.unused, 0);
  const owner = await f.beginOrdinary();
  const original = bag(f.original(owner));
  assert.equal(bag(original["source"])["purpose"], CURRENT_SCHEMATIC_OPERATION_PURPOSE);
  assert.deepEqual(bag(bag(original["source"])["schematicExpectation"])["intent"], { target: f.request.target, desiredTitle: f.request.desiredTitle });
  assert.equal(await f.revalidate(owner), original); assert.equal(f.reserved(), true); assert.deepEqual(f.state.actions, []);
  const disposable = await fixture(); await assert.rejects(disposable.beginOrdinary(), /same purpose/u);
  assert.equal(disposable.reserved(), false);
});

void test("competing SCH transfers cannot both reserve one original runtime", async () => {
  const f = await fixture(), outcomes = await Promise.allSettled([f.begin(), f.begin({ ...f.request, operationId: "sibling-owner" }, true)]);
  assert.equal(outcomes.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter(value => value.status === "rejected").length, 1);
  assert.equal(f.reserved(), true); assert.deepEqual(f.state.actions, []);
});

void test("scope-exit failure retains the same SCH owner for cleanup but never grants completed-transfer admission", async () => {
  const f = await fixture({ scopeFailure: true }); await assert.rejects(f.begin(), /scope exit failure/u);
  const owner = f.get();
  const original = f.original(owner);
  assert.equal(f.reserved(), true); assert.equal(await f.revalidate(owner), original);
  assert.throws(() => f.completed(owner), /completed|cleanup/u);
  await assert.rejects(f.begin(), /distinct unused/u);
  await assert.rejects(f.begin({ ...f.request, operationId: "another-owner" }, true), /transferred/u);
  assert.equal(f.get(), owner); assert.deepEqual(f.state.actions, []);
});

void test("SCH transfer rejects retargeting, prior close and injected services before reservation", async () => {
  const f = await fixture();
  for (const input of [{ ...f.request, operationId: OPEN }, { ...f.request, extra: true },
    { ...f.request, target: { ...f.request.target, branchUuid: "9".repeat(32) } }]) { await assert.rejects(f.begin(input)); }
  assert.equal(f.reserved(), false); assert.equal(f.state.unused, 0); assert.equal(f.state.scopes, 0);
  for (const options of [{ closed: true }, { injected: true }]) {
    const blocked = await fixture(options); await assert.rejects(blocked.begin());
    assert.equal(blocked.reserved(), false); assert.deepEqual(blocked.state.actions, []);
  }
});

void test("SCH transfer checks original owner after its pending read and before atomic reservation", async () => {
  const f = await fixture({ holdUnused: true }), pending = f.begin();
  for (let index = 0; index < 20 && f.state.unused === 0; index += 1) { await Promise.resolve(); }
  assert.equal(f.state.unused, 1); assert.equal(f.reserved(), false); f.mutate("owner"); f.release();
  await assert.rejects(pending, /owner lost/u); assert.equal(f.reserved(), false); assert.equal(f.state.scopes, 0);
});

void test("SCH owner detects launch, validator and persisted-journal drift without issuing replacement ownership", async () => {
  for (const kind of ["validator", "launch", "disk", "status", "capture", "clock", "release"] as const) {
    const f = await fixture(), owner = await f.begin(); f.mutate(kind);
    await assert.rejects(f.revalidate(owner)); assert.equal(f.reserved(), true); assert.deepEqual(f.state.actions, []);
  }
  const f = await fixture({ holdUnused: true }), pending = f.begin();
  for (let index = 0; index < 20 && f.state.unused === 0; index += 1) { await Promise.resolve(); }
  f.mutate("session"); f.release(); await assert.rejects(pending, /authenticated session changed/u);
  assert.equal(f.reserved(), false); assert.deepEqual(f.state.actions, []);
});

void test("SCH closed-clock opening evidence rechecks the exact journal and original owner without claiming admission", async () => {
  const f = await fixture(), owner = await f.begin();
  const before = f.state.admissions;
  assert.equal(await f.evidence(owner), f.completed(owner)); assert.equal(f.state.admissions, before);
  f.mutate("disk"); await assert.rejects(f.evidence(owner), /persisted journal changed/u);
  assert.equal(f.state.admissions, before); assert.deepEqual(f.state.actions, []);
  const incomplete = await fixture({ scopeFailure: true }); await assert.rejects(incomplete.begin(), /scope exit failure/u);
  await assert.rejects(incomplete.evidence(incomplete.get()), /completed|cleanup/u);
});

void test("SCH and PCB transfers exclude each other without cross-family authority", async () => {
  const f = await fixture(), owner = await f.begin();
  assert.throws(() => f.pcbOriginal(owner), /not issued/u);
  await assert.rejects(f.pcb(), /transferred/u);
  const opposite = await fixture(), pcb = await opposite.pcb();
  assert.throws(() => opposite.original(pcb), /not issued/u);
  await assert.rejects(opposite.begin(), /transferred/u);
  const race = await fixture(), results = await Promise.allSettled([race.begin(), race.pcb()]);
  assert.equal(results.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(results.filter(value => value.status === "rejected").length, 1);
  assert.deepEqual(race.state.actions, []);
});

void test("SCH transfer and actual symbol-baseline reservation exclude one another", async () => {
  const f = await fixture(); await f.begin(); await assert.rejects(f.symbol(), /transferred/u);
  const opposite = await fixture(); await assert.rejects(opposite.symbol(), /Synthetic symbol source-preparation stop/u);
  // The actual shared issuer reserved the symbol runtime before its synthetic
  // Source-preparation failure. A new SCH owner cannot reuse that runtime.
  assert.equal(opposite.reserved(), true); await assert.rejects(opposite.begin(), /transferred/u);
  assert.deepEqual(f.state.actions, []); assert.deepEqual(opposite.state.actions, []);
});
