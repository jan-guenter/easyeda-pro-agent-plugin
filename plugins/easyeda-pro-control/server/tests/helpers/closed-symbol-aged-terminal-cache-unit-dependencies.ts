/** TEST ONLY fixed module substitution. No real inspector/closure success is claimed. */
import { join } from "node:path";
import { controlDataDirectory as actualRoot, operationPath } from "../../src/artifacts.ts";
import { sha256Json } from "../../src/core.ts";
import { AGED_TERMINAL_NEXT_ACTION, parseClosedSymbolAgedTerminalEnvelope } from "../../src/closed-symbol-aged-terminal-shape.ts";

export const FAMILY = "easyeda-pro-control.project-symbol-closed-session.v1";
const hash = "a".repeat(64);
type Bag = Record<string, unknown>;
export type Step = "root" | "scope" | "load" | "terminal" | "fingerprint" | "capture" | "cold" | "observe" | "revalidate";
export const state: { root: string; calls: Step[]; before?: (step: Step) => void | Promise<void>; after?: (step: Step, value: unknown) => void | Promise<void>;
  fixtures: Map<string, ReturnType<typeof makeFixture>>; observations: Map<string, unknown>; observationPadding?: string } = { root: actualRoot(), calls: [], fixtures: new Map(), observations: new Map() };
export const root = { path: actualRoot(), device: 1n, inode: 2n, handle: {}, async assertCurrent(): Promise<void> { await step("scope", null); } };
async function step<T>(name: Step, value: T): Promise<T> { state.calls.push(name); await state.before?.(name); await state.after?.(name, value); return value; }
export function reset(): void { state.root = actualRoot(); root.path = actualRoot(); root.device = 1n; root.inode = 2n; state.calls.length = 0; state.fixtures.clear(); state.observations.clear(); delete state.before; delete state.after; delete state.observationPadding; }
export function controlDataDirectory(): string { return state.root; }
export function controlRootCapability(): Promise<typeof root> { return step("root", root); }
export function makeFixture(number: number): { candidate: Bag; runtime: Bag; journal: Bag; events: Bag[]; envelope: ReturnType<typeof parseClosedSymbolAgedTerminalEnvelope>; result: Bag; inputPadding?: string } {
  const operationId = `easyeda-aged-cache-unit-${String(number).padStart(8, "0")}`;
  const directory = operationPath(operationId).slice(0, -5);
  const descriptor = (name: string): { path: string; bytes: number; sha256: string } => ({ path: join(directory, name), bytes: 1, sha256: hash });
  const artifacts = Array.from({ length: 44 }, (_, index) => descriptor(`${String(index + 1).padStart(2, "0")}-unit.json`));
  const sqlDigests = { checkpointSha256: hash, schemaSha256: hash, logicalSha256: hash };
  const body = { headEligibility: "aged-unlocked", operationId, family: FAMILY, closedPlanSha256: hash, markerSha256: hash, expectedFingerprintSha256: hash, facadeSha256: hash, nativePinsSha256: hash,
    predecessor: { state: "closed-session-evidence-recorded", updatedAt: "2026-10-12T10:00:00.000Z", nextSafeAction: "unit", entireJournalSha256: hash },
    recordedAt: "2026-10-12T10:00:01.000Z", phaseArtifacts: artifacts,
    generations: [0, 1, 2].map((ordinal) => ({ ordinal, generationSha256: hash, launchReceiptSha256: hash, closeIntentSha256: hash,
      closeReceiptSha256: hash, terminationProofSha256: hash, checkpointReceiptSha256: hash, copyReceiptSha256: hash,
      copyArtifact: descriptor(`closed-copy-${String(ordinal).repeat(8)}-0000-4000-8000-000000000000.eprj2`), sqlDigests })),
    evidence: { fingerprint: descriptor("00-expected-fingerprint.json"), baselineWindow: descriptor("00-baseline-owned-window.json"), editWindow: descriptor("00-edit-owned-window.json"),
      verificationWindow: descriptor("00-verify-owned-window.json"), witnessQualification: descriptor("20-edit-witness-clock-qualification.json"), witnessRaw: descriptor("20-edit-witness-result.json"),
      writeRaw: descriptor("22-edit-write-result.json"), savedReadRaw: descriptor("38-verify-content-read-raw.json"),
      mainReferenceIntent: descriptor("10-baseline-main-reference-intent.json"), mainReferenceResult: descriptor("10-baseline-main-reference-result.json") },
    results: { mainReferenceResultSha256: hash, witnessResultSha256: hash, preparationSha256: hash, writeResultSha256: hash, editComparisonSha256: hash, savedSourceSha256: hash,
      savedReadResultSha256: hash, verificationComparisonSha256: hash, verificationNavigationBindingSha256: hash },
    finalSource: { source: join(state.root, "unit-not-opened.eprj2"), sourceSha256: hash, sourceIdentitySha256: hash, checkpointReceiptSha256: hash,
      copyReceiptSha256: hash, sqlDigests, method: "issued-copy+verifyCheckpoint+complete-sql" },
    outcome: { metadataPersistedAndVerified: true, savedContentVerifiedInFreshWorker: true, wholeOwnedSessionsExited: true, companionOpenedInFreshSession: true,
      explicitSavePerformed: false, targetEditorOpened: false, saved: false, reopened: false } };
  const envelope = parseClosedSymbolAgedTerminalEnvelope({ profile: "easyeda-pro-control.closed-symbol-terminal.v2", body, bodySha256: sha256Json(body) });
  const terminalArtifact = descriptor("45-closed-symbol-terminal.json");
  const journal = { operationId, state: "closed-session-completed", sequence: 44, artifacts, terminalArtifact, journalSha256: hash,
    updatedAt: body.recordedAt, nextSafeAction: AGED_TERMINAL_NEXT_ACTION };
  const candidate = { operationId, state: journal.state, family: FAMILY, storedJournalSha256: hash, entireStoredJournalSha256: sha256Json(journal), terminalArtifact };
  const runtime = { nodeExecutable: "/synthetic/node", nodeVersion: "24.18.0", nodeSha256: hash };
  const result = { profile: "private.closed-symbol-historical-terminal.v2", operationId, classification: "historical-completion-verified",
    historicalCompletionRecorded: true, terminalOutcomeVerified: true, liveOriginalCompletionProved: false, currentSourceChecked: false,
    currentOwnershipChecked: false, authorityRestored: false, executionAuthorized: false, replayAllowed: false, terminalArtifact, bodySha256: envelope.bodySha256,
    storedJournalSha256: hash, entireStoredJournalSha256: candidate.entireStoredJournalSha256 };
  const fixture = { candidate, runtime, journal, events: [] as Bag[], envelope, result }; state.fixtures.set(operationId, fixture); return fixture;
}
function selected(operationId: unknown): ReturnType<typeof makeFixture> {
  const value = typeof operationId === "string" ? state.fixtures.get(operationId) : undefined;
  if (value === undefined) { throw new Error("Missing unit fixture."); } return value;
}
export function loadClosedSymbolHistoricalPhaseJournal(operationId: string): Promise<unknown> { const f = selected(operationId); return step("load", { journal: f.journal, events: f.events }); }
export function readExactUtf8Artifact(descriptor: { path: string }): Promise<unknown> {
  const f = [...state.fixtures.values()].find((entry) => descriptor.path === entry.envelope.body.evidence.fingerprint.path || descriptor.path === entry.envelope.body.phaseArtifacts[0]?.path.replace("01-unit.json", "45-closed-symbol-terminal.json"));
  if (f === undefined) { throw new Error("Missing unit artifact."); }
  const isFingerprint = descriptor.path.endsWith("00-expected-fingerprint.json");
  return step(isFingerprint ? "fingerprint" : "terminal", { text: JSON.stringify(isFingerprint ? { unitOnly: true, padding: f.inputPadding ?? "" } : f.envelope) });
}
export function captureClosedSymbolJournalBytes(journal: Bag): Promise<unknown> {
  return step("capture", { profile: "private.closed-terminal-journal-bytes.v1", operationId: journal["operationId"], journalSemanticSha256: sha256Json(journal),
    artifact: { path: operationPath(String(journal["operationId"])), bytes: 1, sha256: hash } });
}
export function inspectClosedSymbolAgedTerminal(operationId: string): Promise<unknown> { return step("cold", structuredClone(selected(operationId).result)); }
export function observeClosedSymbolAgedTerminalClosure(input: unknown): Promise<unknown> {
  if (input === null || typeof input !== "object") { throw new Error("Unit input missing."); }
  const journal: unknown = Reflect.get(input, "journal");
  if (journal === null || typeof journal !== "object") { throw new Error("Unit journal missing."); }
  const id = Reflect.get(journal, "operationId") as unknown;
  const value = Object.freeze({ syntheticOnly: true, binding: sha256Json(input), padding: state.observationPadding ?? "" });
  state.observations.set(String(id), value); return step("observe", value);
}
export function revalidateClosedSymbolAgedTerminalClosure(input: unknown, previous: unknown): Promise<unknown> {
  return step("revalidate", { input, previous });
}

export function revalidateObservedClosedSymbolAgedTerminalClosure(previous: unknown): Promise<unknown> {
  return step("revalidate", { previous });
}
