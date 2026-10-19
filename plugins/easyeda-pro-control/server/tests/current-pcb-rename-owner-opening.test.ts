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
import { parseCurrentPcbRenameOwnerRequest } from "../src/current-pcb-rename-owner.ts";

type Bag = Record<string, unknown>;
const OPEN = "synthetic-pcb-opening", OWNER = "synthetic-pcb-owner";
function noOp(): undefined { return undefined; }
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(options: Readonly<{ scopeFailure?: boolean; holdUnused?: boolean; injected?: boolean; closed?: boolean }> = {}): Promise<{
  request: ReturnType<typeof parseCurrentPcbRenameOwnerRequest>;
  begin: (request?: unknown, sibling?: boolean) => Promise<unknown>;
  get: (id?: string) => unknown;
  original: (owner: unknown, wrongEngine?: boolean) => unknown;
  completed: (owner: unknown) => unknown;
  revalidate: (owner: unknown) => Promise<unknown>;
  evidence: (owner: unknown) => Promise<unknown>;
  reserved: () => boolean;
  mutate: (kind: "owner" | "validator" | "launch" | "disk" | "session" | "status" | "capture" | "clock" | "release") => void;
  release: () => void;
  state: { unused: number; scopes: number; admissions: number; owner: boolean; actions: string[] };
}> {
  const rawWindowsPath = String.raw`C:\Synthetic\PcbFixture.eprj2`;
  const projectUuid = sha256Text(rawWindowsPath);
  const target = { rawWindowsPath, projectUuid, documentUuid: "1".repeat(16), branchUuid: "2".repeat(32), expectedSourceSha256: "3".repeat(64) };
  const openingRequest = { action: "open", operationId: OPEN, rawWindowsPath, projectUuid, documentUuid: target.documentUuid,
    expectedSourceSha256: target.expectedSourceSha256, confirmDisposableProject: true, acceptNormalOpenEffects: true };
  const request = parseCurrentPcbRenameOwnerRequest({ operationId: OWNER,
    target: { projectUuid, branchUuid: target.branchUuid, pcbUuid: target.documentUuid, ownerUuid: "6".repeat(32) }, desiredTitle: "Renamed PCB" });
  const launch = { jobId: "4".repeat(32), helperInstance: "5".repeat(32),
    root: { pid: 50, role: "easyeda-main", startIdentity: `win32:12345678901234567:job:${"4".repeat(32)}` } };
  const prior = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 2,
    authenticationReceiptSha256: "6".repeat(64), authenticatedAtEpochMs: 1000 };
  const fingerprint = { synthetic: true, installedBundles: { assetsRoot: "/synthetic/assets" } };
  const plan = { profile: "easyeda-pro-control.current-disposable-open.v1", purpose: "disposable-validation",
    intent: { request: openingRequest, target, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION }, expectedFingerprint: fingerprint };
  const journal: Bag = { schema: OPERATION_SCHEMA, operationId: OPEN, journalPath: "/synthetic/opening.json", plan, planHash: buildPlanHash(plan),
    state: "completed", mutationState: "not-inferred", saved: false, reopened: false, hardStop: false, orphanedCallPossible: false,
    mutationMayHaveOccurred: true, sequence: 4, artifacts: [], updatedAt: "2026-10-18T00:00:00.000Z", nextSafeAction: "Synthetic opening",
    projectDispatchConsumed: true, documentDispatchConsumed: true, result: { outcome: "target-native-identity-observed" },
    checkpointProof: { profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: {}, targetEvidence: {} },
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
    CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest, parseCurrentPcbRenameOwnerRequest,
    CURRENT_SYMBOL_OPERATION_PURPOSE: "ordinary-symbol-metadata", EasyedaControlEngine: Object, WindowsControlRuntime: Object,
    CURRENT_SCHEMATIC_OPERATION_PURPOSE: "ordinary-schematic-rename",
    createOperation: (): never => forbidden("create-operation"), updateOperation: (): never => forbidden("update-operation"),
    writePhaseArtifact: (): never => forbidden("artifact"),
    loadOperation: (id: string): Promise<Bag> => { assert.equal(id, OPEN); return Promise.resolve(structuredClone(disk)); },
    assertOperationIdUnused: (): Promise<unknown> => { state.unused += 1; return options.holdUnused === true ? barrier.promise : Promise.resolve(); },
    prepareCurrentDisposableOpenCheckpoint: noOp, verifyCurrentDisposableOpenCheckpoint: noOp,
    prepareCurrentSymbolOperationCheckpoint: noOp, verifyCurrentSymbolOperationCheckpoint: noOp,
    prepareCurrentSchematicOperationCheckpoint: noOp, verifyCurrentSchematicOperationCheckpoint: noOp,
    verifyCurrentDisposableOpenImplementation: noOp, validateSdkLocalRuntimeFingerprint: noOp,
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
({begin:(request,useSibling)=>(useSibling?sibling:first).preparePcbRenameOpeningOwner('${OPEN}',request),
get:id=>first.getPcbRenameOpeningOwner(id),original:(value,wrong)=>assertCurrentPcbRenameOpeningOwner(value,wrong?{}:testEngine),
completed:value=>assertCompletedCurrentPcbRenameOpeningTransfer(value,testEngine),
revalidate:value=>revalidateCurrentPcbRenameOpeningOwner(value,testEngine),
evidence:value=>revalidateCurrentPcbRenameOpeningEvidence(value,testEngine),reserved:()=>baselineRuntimeReservations.has(testOpening.runtime)});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const method = api[name]; assert.ok(typeof method === "function");
    return Reflect.apply(method, undefined, args) as unknown; };
  return { request, begin: async (input = request, sibling = false): Promise<unknown> => await invoke("begin", [input, sibling]),
    get: (id = OWNER): unknown => invoke("get", [id]), original: (owner, wrong = false): unknown => invoke("original", [owner, wrong]),
    completed: (owner): unknown => invoke("completed", [owner]), revalidate: async (owner): Promise<unknown> => await invoke("revalidate", [owner]),
    evidence: async (owner): Promise<unknown> => await invoke("evidence", [owner]),
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

void test("PCB transfer retains the exact original opener, intent and one shared-runtime reservation without dispatch", async () => {
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

void test("competing PCB transfers cannot both reserve one original runtime", async () => {
  const f = await fixture(), outcomes = await Promise.allSettled([f.begin(), f.begin({ ...f.request, operationId: "sibling-owner" }, true)]);
  assert.equal(outcomes.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter(value => value.status === "rejected").length, 1);
  assert.equal(f.reserved(), true); assert.deepEqual(f.state.actions, []);
});

void test("scope-exit failure retains the same PCB owner for cleanup but never grants completed-transfer admission", async () => {
  const f = await fixture({ scopeFailure: true }); await assert.rejects(f.begin(), /scope exit failure/u);
  const owner = f.get();
  const original = f.original(owner);
  assert.equal(f.reserved(), true); assert.equal(await f.revalidate(owner), original);
  assert.throws(() => f.completed(owner), /completed|cleanup/u);
  await assert.rejects(f.begin(), /distinct unused/u);
  await assert.rejects(f.begin({ ...f.request, operationId: "another-owner" }, true), /transferred/u);
  assert.equal(f.get(), owner); assert.deepEqual(f.state.actions, []);
});

void test("PCB transfer rejects retargeting, prior close and injected services before reservation", async () => {
  const f = await fixture();
  for (const input of [{ ...f.request, operationId: OPEN }, { ...f.request, extra: true },
    { ...f.request, target: { ...f.request.target, pcbUuid: "9".repeat(16) } }]) { await assert.rejects(f.begin(input)); }
  assert.equal(f.reserved(), false); assert.equal(f.state.unused, 0); assert.equal(f.state.scopes, 0);
  for (const options of [{ closed: true }, { injected: true }]) {
    const blocked = await fixture(options); await assert.rejects(blocked.begin());
    assert.equal(blocked.reserved(), false); assert.deepEqual(blocked.state.actions, []);
  }
});

void test("PCB transfer checks original owner after its pending read and before atomic reservation", async () => {
  const f = await fixture({ holdUnused: true }), pending = f.begin();
  for (let index = 0; index < 20 && f.state.unused === 0; index += 1) { await Promise.resolve(); }
  assert.equal(f.state.unused, 1); assert.equal(f.reserved(), false); f.mutate("owner"); f.release();
  await assert.rejects(pending, /owner lost/u); assert.equal(f.reserved(), false); assert.equal(f.state.scopes, 0);
});

void test("PCB owner detects launch, validator and persisted-journal drift without issuing replacement ownership", async () => {
  for (const kind of ["validator", "launch", "disk", "status", "capture", "clock", "release"] as const) {
    const f = await fixture(), owner = await f.begin(); f.mutate(kind);
    await assert.rejects(f.revalidate(owner)); assert.equal(f.reserved(), true); assert.deepEqual(f.state.actions, []);
  }
  const f = await fixture({ holdUnused: true }), pending = f.begin();
  for (let index = 0; index < 20 && f.state.unused === 0; index += 1) { await Promise.resolve(); }
  f.mutate("session"); f.release(); await assert.rejects(pending, /authenticated session changed/u);
  assert.equal(f.reserved(), false); assert.deepEqual(f.state.actions, []);
});

void test("PCB closed-clock opening evidence rechecks the exact journal and original owner without claiming admission", async () => {
  const f = await fixture(), owner = await f.begin();
  const before = f.state.admissions;
  assert.equal(await f.evidence(owner), f.completed(owner)); assert.equal(f.state.admissions, before);
  f.mutate("disk"); await assert.rejects(f.evidence(owner), /persisted journal changed/u);
  assert.equal(f.state.admissions, before); assert.deepEqual(f.state.actions, []);
  const incomplete = await fixture({ scopeFailure: true }); await assert.rejects(incomplete.begin(), /scope exit failure/u);
  await assert.rejects(incomplete.evidence(incomplete.get()), /completed|cleanup/u);
});
