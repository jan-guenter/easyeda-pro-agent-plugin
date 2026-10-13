/** Actual lifecycle issuers; synthetic gateway/browser/content, no native app. */
/* oxlint-disable import/max-dependencies -- This integration fixture composes the actual original-owner stages directly and keeps synthetic gateway responses explicit. */
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { ClosedSymbolNavigationStage, assertOriginalClosedSymbolNavigation } from "../../src/closed-symbol-navigation.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { buildStartupProgram } from "../../src/closed-symbol-startup-program.ts";
import { isRecord } from "../../src/core.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../../src/library-native-profile.ts";
import { buildRecoveryNavigationCode } from "../../src/recovery-navigation.ts";
import { startupFixture } from "./closed-symbol-startup-browser-fixture.ts";
import { sqlStageFixture } from "./closed-symbol-sql-fixture.ts";
import { decodeRawHistoryForOriginalSymbolSqlPlan } from "../../src/symbol-sql-comparator.ts";
import { prepareOriginalSavedSymbolSource } from "../../src/closed-symbol-saved-source.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "../../src/saved-symbol-projection.ts";
import { ClosedSymbolSavedReadStage } from "../../src/closed-symbol-saved-read.ts";

type Value = Record<string, unknown>;
export interface SavedReadState {
  calls: number; raw: unknown; fail: boolean; observationOverride?: Value;
  before?: () => void | Promise<void>; after?: (raw: unknown) => void | Promise<void>;
}
type Base = Awaited<ReturnType<typeof sqlStageFixture>>;
type Source = Awaited<ReturnType<typeof prepareOriginalSavedSymbolSource>>;
type Admission = Awaited<ReturnType<Base["admission"]["admit"]>>;
type NavigationIo = NonNullable<ConstructorParameters<typeof ClosedSymbolNavigationStage>[2]>;
export type SavedReadFixture = Base & {
  originalEditComparison: Awaited<ReturnType<Base["sql"]["compareEdit"]>>;
  preparedSource: Source; verifyAdmission: Admission; verifyGeneration: Admission["generation"];
  navigation: ClosedSymbolNavigationStage; navigationResult: Awaited<ReturnType<ClosedSymbolNavigationStage["openCompanion"]>>;
  readState: SavedReadState; readStage: ClosedSymbolSavedReadStage; readInput: Parameters<ClosedSymbolSavedReadStage["read"]>[0];
};
export async function savedReadFixture(context: TestContext): Promise<SavedReadFixture> {
  const f = await sqlStageFixture(context);
  const originalEditComparison = await f.sql.compareEdit(f.compareInput);
  const preparedSource = await prepareOriginalSavedSymbolSource(originalEditComparison, f.engine, f.journal.operationId);
  const decoded = await decodeRawHistoryForOriginalSymbolSqlPlan(f.preparation.sqlPlan, f.edited.inventory);
  // Deliberate synthetic content producer, not the independent native-parser
  // Differential oracle. That source-only oracle is tested separately.
  const projection = await prepareSavedSymbolProjection({ chunks: decoded.chunks, targetUuid: preparedSource.targetUuid,
    maximumTicket: preparedSource.maximumTicket, currentEditVersion: preparedSource.headerEditVersion });
  const browser = startupFixture("verify-marker-read"), plan = f.journal.plan;
  Object.assign(browser.input, { projectUuid: plan.projectUuid, branchUuid: plan.branchUuid, ownerUuid: plan.ownerUuid, marker: plan.marker });
  Object.assign(browser.actor, { uuid: plan.ownerUuid, username: "synthetic-user" });
  browser.state.host["globalVariableCookieData"] = { userInfo: { ...browser.actor } };
  browser.state.host["messageBus"] = { rpcCall(route: unknown, args: unknown): Promise<unknown> {
    assert.equal(route, "/pro-mgr/hasProject"); assert.equal(JSON.stringify(args), JSON.stringify([plan.projectUuid])); return Promise.resolve({ message: false });
  } };
  const target = { projectUuid: plan.projectUuid, projectPath: plan.projectPath, documentUuid: plan.activeUuid, documentType: 3 as const };
  const active = { project: { uuid: plan.projectUuid, path: plan.projectPath },
    document: { uuid: plan.activeUuid, documentType: 3, tabId: `${plan.activeUuid}@${plan.projectUuid}` } };
  const code = buildRecoveryNavigationCode(target, { navigate: true, requireExclusiveTabs: true, requireEditorReadiness: true });
  const readState: SavedReadState = { calls: 0, raw: undefined, fail: false };
  const original = f.engine.upstream.callTool.bind(f.engine.upstream);
  f.engine.upstream.callTool = async (name, args, timeout, binding): ReturnType<typeof original> => {
    const program = String(args?.["code"]);
    if (program.includes("private.saved-symbol-content-observation.v1")) {
      assert.equal(name, "easyeda_execute"); assert.ok(binding !== undefined); assert.equal(args?.["confirmWrite"], true);
      const current = await loadClosedSymbolJournal(f.journal.operationId);
      assert.equal(current.events.at(-1)?.step, "verify-content-read"); assert.equal(current.events.at(-1)?.kind, "intent");
      assert.equal(current.journal.orphanedCallPossible, true); readState.calls += 1; await readState.before?.();
      if (readState.fail) { throw new Error("Synthetic uncertain saved-content transport"); }
      const observation = readState.observationOverride ?? { profile: "private.saved-symbol-content-observation.v1", projectUuid: plan.projectUuid,
        targetUuid: plan.targetUuid, maximumTicket: preparedSource.maximumTicket, workerClient: "c".repeat(16),
        content: expectedSavedSymbolContent(projection, "c".repeat(16)), executionAuthorized: false, producerBindingVerified: false, completionProved: false };
      const raw = { content: [{ type: "text" as const, text: JSON.stringify(observation) }] };
      readState.raw = raw; await readState.after?.(raw); return raw;
    }
    if (program === code) {
      assert.equal(args?.["confirmWrite"], true);
      return { content: [{ type: "text", text: JSON.stringify({ schema: "easyeda-pro-control.recovery-navigation.v1", ok: true,
        openedProject: true, openedDocument: true, project: active.project, document: active.document }) }] };
    }
    if (program === buildStartupProgram(browser.input)) {
      const observed = await browser.run(); assert.equal(observed["ok"], true, JSON.stringify(observed));
      return { content: [{ type: "text", text: JSON.stringify(observed) }] };
    }
    return original(name, args, timeout, binding);
  };
  await f.relaunch.launch({ journal: f.journal, phase: "verify-launch", proof: f.proof, copy: f.edited.copy, checkpoint: f.edited.checkpoint });
  f.state.scope = true; f.state.sequence += 1; f.state.generation = "synthetic-witness-runtime-0003";
  const verifyAdmission = await f.admission.admit(f.journal, "verify-admission");
  await f.startup.observe(f.journal, "verify-marker-read");
  const status = await f.engine.status();
  const fingerprint = status.stableFingerprint; assert.ok(isRecord(fingerprint));
  context.mock.method(f.engine, "assertContext", () => Promise.resolve(structuredClone(active)));
  const navigation = new ClosedSymbolNavigationStage(f.engine, fingerprint, {
    // The synthetic SQL fixture contains two symbols, not a real PCB page.
    // Navigation preparation/profile are explicit test I/O; the actual stage,
    // Checkpoint reader, tracked dispatcher and success registry remain intact.
    verifyLibraryNativeProfile: (): ReturnType<NonNullable<NavigationIo["verifyLibraryNativeProfile"]>> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    prepareRecoveryNavigation: (): ReturnType<NonNullable<NavigationIo["prepareRecoveryNavigation"]>> => Promise.resolve({ target, code, checkpointSha256: f.edited.checkpoint.checkpointSha256,
      libraryHeaderEvidence: { profile: "easyeda.native-history.library-header-evidence.v1", projectUuid: plan.projectUuid,
        checkpointSha256: f.edited.checkpoint.checkpointSha256, documents: [], contentSha256: "a".repeat(64), sha256: "a".repeat(64) } }),
  });
  const navigationResult = await navigation.openCompanion(f.journal, "verify-open", verifyAdmission.generation, f.edited.checkpoint);
  assertOriginalClosedSymbolNavigation(navigationResult, f.engine, f.journal.operationId, "verify-open");
  const readStage = new ClosedSymbolSavedReadStage(f.engine, f.runtime, f.admission, f.relaunch, f.startup, navigation, fingerprint);
  return { ...f, originalEditComparison, preparedSource, verifyAdmission, verifyGeneration: verifyAdmission.generation, navigation, navigationResult,
    readState, readStage, readInput: { journal: f.journal, source: preparedSource, navigationResult } };
}
