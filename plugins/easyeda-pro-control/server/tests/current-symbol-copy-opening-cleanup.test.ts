/** Actual opener/cleanup in a private VM with synthetic I/O and native owners.
 * No application, project, profile or saved ownership is used by these tests.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest } from "../src/current-disposable-open.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { CURRENT_SYMBOL_COPY_OPERATION_PURPOSE, parseCurrentSymbolCopyOperationRequest } from "../src/current-symbol-copy-operation.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "close-ack" | "close-intent" | "retirement";
const COPY = "synthetic-copy-cleanup", OPEN = "synthetic-opening";
function noOp(): undefined { return undefined; }
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(failure: Failure = "none"): Promise<{
  begin: () => Promise<unknown>; run: (action: string) => Promise<Bag>; mutate: (kind: "owner" | "method" | "journal") => void;
  state: { preparations: number; closes: number; probes: number; releases: number; owner: boolean; phases: string[] };
  originalJournal: string; journal: Bag; reserved: () => boolean;
}> {
  const rawWindowsPath = String.raw`C:\Synthetic\Fixture.eprj2`;
  const documentUuid = "1".repeat(16), projectUuid = sha256Text(rawWindowsPath);
  const target = { rawWindowsPath, projectUuid, documentUuid, branchUuid: "2".repeat(32), expectedSourceSha256: "3".repeat(64) };
  const request = { action: "open", operationId: OPEN, rawWindowsPath, projectUuid, documentUuid,
    expectedSourceSha256: target.expectedSourceSha256, confirmDisposableProject: true, acceptNormalOpenEffects: true };
  const launch = { jobId: "4".repeat(32), helperInstance: "5".repeat(32),
    root: { pid: 50, role: "easyeda-main", startIdentity: `win32:12345678901234567:job:${"4".repeat(32)}` } };
  const prior = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 2,
    authenticationReceiptSha256: "6".repeat(64), authenticatedAtEpochMs: 1000 };
  const lease = { gatewayInstanceId: prior.gatewayInstanceId, sessionId: prior.sessionId, sessionSequence: prior.sequence };
  const plan = { profile: "easyeda-pro-control.current-disposable-open.v1", purpose: "disposable-validation",
    intent: { request, target, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION }, expectedFingerprint: { synthetic: true } };
  const journal: Bag = { schema: OPERATION_SCHEMA, operationId: OPEN, journalPath: "/synthetic/opening.json", plan, planHash: buildPlanHash(plan),
    state: "completed", mutationState: "not-inferred", saved: false, reopened: false, hardStop: false, orphanedCallPossible: false,
    mutationMayHaveOccurred: true, sequence: 4, artifacts: [], updatedAt: "2026-10-17T00:00:00.000Z", nextSafeAction: "Synthetic opening",
    projectDispatchConsumed: true, documentDispatchConsumed: true, result: { outcome: "target-native-identity-observed" },
    checkpointProof: { profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: {}, targetEvidence: {} },
    originalLaunch: launch, bridgeSessionBeforeOrphan: prior, bridgeDispatchBeforeOrphan: lease };
  let disk = structuredClone(journal), scoped = false;
  const state = { preparations: 0, closes: 0, probes: 0, releases: 0, owner: true, phases: [] as string[] };
  const runtime = {
    status: (): Bag => ({ state: "owned", launch }),
    observeApplicationWindow: (): Promise<Bag> => Promise.resolve({ outcome: "available", hwnd: "123", jobId: launch.jobId, helperInstance: launch.helperInstance }),
    normalClose: (hwnd: string): Promise<void> => {
      assert.equal(hwnd, "123"); state.closes += 1;
      return failure === "close-ack" ? Promise.reject(new Error("Synthetic close reply lost")) : Promise.resolve();
    },
    observeLaunchTermination: (): Promise<Bag> => { state.probes += 1; return Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: state.probes > 1 }); },
  };
  const engine = { assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(),
    assertRecoveryOperationIsolated: (id: string): Promise<void> => { assert.equal(id, COPY); return Promise.resolve(); },
    executionAuthorityValidator: {}, upstream: {
      currentAuthenticatedBridgeDispatchBinding: (): unknown => scoped ? lease : undefined,
      withAuthenticatedBridgeDispatchScope: async (task: () => Promise<void>): Promise<void> => {
        assert.equal(scoped, false); scoped = true; try { await task(); } finally { scoped = false; }
      },
      bridgeSessionLifecycle: (): Bag => { const { gatewayInstanceId, ...activeSession } = prior;
        return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId, activeSession }; },
      assertClosedAuthenticatedBridgeDispatchReleased: (dispatch: unknown, session: unknown): Bag => {
        assert.deepEqual(dispatch, lease); assert.deepEqual(session, prior); assert.ok(state.probes > 1);
        const { gatewayInstanceId: _gateway, ...identity } = prior; return { ...identity, closeReason: "closed", closedAtEpochMs: 2000 };
      },
    } };
  class Baseline {
    private readonly operationId = COPY;
    public copyOpeningCleanupStatus(id: string): Bag { assert.equal(id, this.operationId); return { slotRetained: false, closeAttempted: false, closeAcknowledged: false }; }
    public retireCopyOpeningCapture(id: string): Promise<void> {
      assert.equal(id, this.operationId); assert.ok(state.probes > 1); state.releases += 1;
      return failure === "retirement" ? Promise.reject(new Error("Synthetic capture retirement failed")) : Promise.resolve();
    }
  }
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-disposable-open-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ z, Object, Reflect, Promise, structuredClone, canonicalJson, buildPlanHash, isRecord, sha256Text, OPERATION_SCHEMA,
    CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, CURRENT_SYMBOL_COPY_OPERATION_PURPOSE, parseCurrentSymbolCopyOperationRequest,
    currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest,
    CURRENT_SYMBOL_OPERATION_PURPOSE: "ordinary-symbol-metadata", EasyedaControlEngine: Object, WindowsControlRuntime: Object,
    CURRENT_SCHEMATIC_OPERATION_PURPOSE: "ordinary-schematic-rename",
    CurrentSymbolBaselineCoordinator: Baseline,
    currentOwnedSymbolCopyRequestSchema: z.object({ projectUuid: z.string(), branchUuid: z.string(), symbolUuid: z.string() }).strict(),
    prepareCurrentOwnedSymbolCopy: (): never => { state.preparations += 1; throw new Error("Synthetic preparation refused"); },
    createOperation: noOp, updateOperation: (): never => { throw new Error("Cleanup must not overwrite the original journal"); },
    loadOperation: (id: string): Promise<Bag> => { assert.equal(id, OPEN); return Promise.resolve(structuredClone(disk)); },
    writePhaseArtifact: (id: string, sequence: number, phase: string): Promise<Bag> => {
      assert.equal(id, OPEN); assert.ok(sequence > 4); state.phases.push(phase);
      if (failure === "close-intent" && phase === "copy-initial-close-intent") { return Promise.reject(new Error("Synthetic intent publication failed")); }
      return Promise.resolve({ path: `/synthetic/${sequence}-${phase}.json`, bytes: 1, sha256: "7".repeat(64) });
    },
    assertOperationIdUnused: noOp, prepareCurrentDisposableOpenCheckpoint: noOp, verifyCurrentDisposableOpenCheckpoint: noOp,
    prepareCurrentSymbolOperationCheckpoint: noOp, verifyCurrentSymbolOperationCheckpoint: noOp,
    prepareCurrentSchematicOperationCheckpoint: noOp, verifyCurrentSchematicOperationCheckpoint: noOp,
    verifyCurrentDisposableOpenImplementation: noOp, validateSdkLocalRuntimeFingerprint: noOp,
    testOptions: { engine, runtime: (): typeof runtime => runtime, assertOwner: (): void => { assert.equal(state.owner, true, "Synthetic owner lost"); } },
    testOpening: { journal, runtime, launch, launchText: canonicalJson(launch), planText: canonicalJson(plan),
      nativeCleanup: { status: runtime.status, normalClose: runtime.normalClose, observeApplicationWindow: runtime.observeApplicationWindow } },
  });
  // Private fields are accessed only inside this isolated source-evaluation realm;
  // The public parser and actual production module expose no seeding operation.
  const api = bag(runInContext(`${program}\nconst testCoordinator = new CurrentDisposableOpenCoordinator(testOptions);
testCoordinator.retained.set('${OPEN}',testOpening);
({begin:()=>testCoordinator.beginCopyBaseline('${OPEN}',{operationId:'${COPY}',source:{projectUuid:'${projectUuid}',branchUuid:'${target.branchUuid}',symbolUuid:'${"8".repeat(16)}'},confirmNormalClose:true},{}),
run:request=>testCoordinator.runCopy(request),reserved:()=>baselineRuntimeReservations.has(testOpening.runtime)});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const method = api[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, undefined, args) as unknown; };
  return { begin: async (): Promise<unknown> => await invoke("begin", []),
    run: async (action): Promise<Bag> => bag(await invoke("run", [{ action, operationId: COPY,
      ...(action === "baseline-finish-close" ? { confirmNormalClose: true, acceptUnknownFileEffects: true } : {}) }])),
    mutate: (kind): void => {
      if (kind === "owner") { state.owner = false; }
      else if (kind === "method") { runtime.normalClose = (): Promise<void> => Promise.resolve(); }
      else { disk = { ...disk, nextSafeAction: "Changed journal" }; }
    },
    state, originalJournal: canonicalJson(journal), journal, reserved: (): boolean => invoke("reserved", []) === true };
}

void test("early copy preparation failure keeps original normal close and termination without replay or journal writes", async () => {
  const f = await fixture(); await assert.rejects(f.begin(), /preparation refused/u);
  assert.equal(f.state.preparations, 1); assert.equal(f.reserved(), true);
  const inspected = await f.run("baseline-inspect"); assert.equal(inspected["terminalCleanupOnly"], true); assert.equal(inspected["originalFailurePreserved"], true);
  await assert.rejects(f.begin()); await assert.rejects(f.run("baseline-relaunch")); await assert.rejects(f.run("copy-begin"));
  await f.run("baseline-finish-close"); await assert.rejects(f.run("baseline-finish-close"));
  const pending = await f.run("baseline-observe-finish"); assert.equal(pending["termination"], "pending");
  const terminal = await f.run("baseline-observe-finish"); assert.equal(terminal["retired"], true); assert.equal(terminal["copyVerified"], false);
  assert.equal(terminal["closedSessionCopyAuthority"], false); assert.equal(f.state.closes, 1); assert.equal(f.state.releases, 1);
  assert.equal(canonicalJson(f.journal), f.originalJournal); assert.equal(f.reserved(), true);
  await assert.rejects(f.run("baseline-observe-finish")); await assert.rejects(f.begin());
  const retired = await f.run("copy-inspect"); assert.equal(retired["retired"], true);
});

void test("early copy cleanup consumes close before publication and never repeats a lost close reply", async () => {
  for (const failure of ["close-ack", "close-intent"] as const) {
    const f = await fixture(failure); await assert.rejects(f.begin()); await assert.rejects(f.run("baseline-finish-close"));
    const inspected = await f.run("copy-inspect"); assert.equal(inspected["closeAttempted"], true); await assert.rejects(f.run("baseline-finish-close"));
    assert.equal(f.state.closes, failure === "close-ack" ? 1 : 0);
    await f.run("baseline-observe-finish"); const terminal = await f.run("baseline-observe-finish");
    assert.equal(terminal["closeAcknowledged"], false); assert.equal(terminal["retired"], true);
    assert.equal(canonicalJson(f.journal), f.originalJournal); assert.equal(f.reserved(), true);
  }
});

void test("early copy cleanup refuses changed owner, retained methods and persisted opening before close", async () => {
  for (const kind of ["owner", "method", "journal"] as const) {
    const f = await fixture(); await assert.rejects(f.begin()); f.mutate(kind); await assert.rejects(f.run("baseline-finish-close"));
    assert.equal(f.state.closes, 0); assert.deepEqual(f.state.phases, ["copy-initial-begin-failed"]); assert.equal(f.reserved(), true);
  }
});

void test("early copy capture-retirement failure remains consumed and cannot imply terminal success", async () => {
  const f = await fixture("retirement"); await assert.rejects(f.begin()); await f.run("baseline-finish-close");
  await f.run("baseline-observe-finish"); await assert.rejects(f.run("baseline-observe-finish"), /retirement failed/u);
  await assert.rejects(f.run("baseline-observe-finish")); const result = await f.run("copy-inspect");
  assert.equal(result["releaseAttempted"], true); assert.equal(result["retired"], false); assert.equal(result["copyVerified"], false);
  assert.equal(f.state.releases, 1); assert.equal(canonicalJson(f.journal), f.originalJournal); assert.equal(f.reserved(), true);
});
