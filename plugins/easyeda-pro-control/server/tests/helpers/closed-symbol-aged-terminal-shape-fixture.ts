/** Shaped data only: no journal files, SQL, authority, native calls or completion proof. */
import { join } from "node:path";
import { operationPath } from "../../src/artifacts.ts";
import { newOperationId, sha256Json } from "../../src/core.ts";
import { parseClosedSymbolTerminalEnvelope } from "../../src/closed-symbol-terminal-shape.ts";
import type { ClosedSymbolTerminalBody, ClosedSymbolTerminalEnvelope, TerminalDescriptor } from "../../src/closed-symbol-terminal-shape.ts";
import { AGED_TERMINAL_NEXT_ACTION, AGED_TERMINAL_STATE, parseClosedSymbolAgedTerminalEnvelope } from "../../src/closed-symbol-aged-terminal-shape.ts";
import type { ClosedSymbolAgedTerminalEnvelope } from "../../src/closed-symbol-aged-terminal-shape.ts";

const digest = "a".repeat(64), family = "easyeda-pro-control.project-symbol-closed-session.v1";
interface ShapedPredecessor extends Record<string, unknown> {
  operationId: string; updatedAt: string; nextSafeAction: string; journalSha256: string; artifacts: TerminalDescriptor[];
  plan: { profile: string; projectPath: string; expectedFingerprintSha256: string; facadeSha256: string; nativePinsSha256: string };
}
function sealed<T extends Record<string, unknown>>(value: T): T & { journalSha256: string } { return { ...value, journalSha256: sha256Json(value) }; }
function shapedData(): { commonBody: ReturnType<typeof bodyFor>; predecessor: ReturnType<typeof predecessorFor>; directory: string } {
  const operationId = newOperationId();
  const directory = operationPath(operationId).slice(0, -5);
  const predecessor = predecessorFor(operationId, directory);
  return { commonBody: bodyFor(predecessor, directory), predecessor, directory };
}
function predecessorFor(operationId: string, directory: string): ShapedPredecessor {
  const plan = { profile: family, projectPath: "/tmp/unopened-shape-only.eprj2", expectedFingerprintSha256: digest,
    facadeSha256: digest, nativePinsSha256: digest };
  const artifacts = Array.from({ length: 44 }, (_, index) => ({ path: join(directory, `${String(index + 1).padStart(2, "0")}-synthetic-phase.json`), bytes: 1, sha256: digest }));
  return sealed({ operationId, plan, closedPlanSha256: digest, markerSha256: digest, sequence: 44,
    state: "closed-session-evidence-recorded", updatedAt: "2026-10-12T01:02:03.000Z", nextSafeAction: "Inspect shaped data only.",
    artifacts, hardStop: false, orphanedCallPossible: false, saved: false, reopened: false,
    integrityModel: "synthetic-only", syntheticUnknown: { important: ["Ω", { retained: true }] } });
}
function bodyFor(predecessor: ReturnType<typeof predecessorFor>, directory: string): ClosedSymbolTerminalBody {
  const artifact = (name: string): TerminalDescriptor => ({ path: join(directory, name), bytes: 1, sha256: digest });
  const sqlDigests = { checkpointSha256: digest, schemaSha256: digest, logicalSha256: digest };
  return { operationId: predecessor.operationId, family, closedPlanSha256: digest, markerSha256: digest,
    expectedFingerprintSha256: digest, facadeSha256: digest, nativePinsSha256: digest,
    predecessor: { state: "closed-session-evidence-recorded", updatedAt: predecessor.updatedAt,
      nextSafeAction: predecessor.nextSafeAction, entireJournalSha256: sha256Json(predecessor) },
    recordedAt: "2026-10-12T01:02:04.000Z", phaseArtifacts: predecessor.artifacts,
    generations: ([0, 1, 2] as const).map((ordinal) => ({ ordinal, generationSha256: digest, launchReceiptSha256: digest,
      closeIntentSha256: digest, closeReceiptSha256: digest, terminationProofSha256: digest, checkpointReceiptSha256: digest,
      copyReceiptSha256: digest, copyArtifact: artifact(`closed-copy-${String(ordinal).repeat(8)}-0000-4000-8000-000000000000.eprj2`), sqlDigests })),
    evidence: { fingerprint: artifact("00-expected-fingerprint.json"), baselineWindow: artifact("00-baseline-owned-window.json"),
      editWindow: artifact("00-edit-owned-window.json"), verificationWindow: artifact("00-verify-owned-window.json"),
      witnessQualification: artifact("20-edit-witness-clock-qualification.json"), witnessRaw: artifact("20-edit-witness-result.json"),
      writeRaw: artifact("22-edit-write-result.json"), savedReadRaw: artifact("38-verify-content-read-raw.json") },
    results: { witnessResultSha256: digest, preparationSha256: digest, writeResultSha256: digest, editComparisonSha256: digest,
      savedSourceSha256: digest, savedReadResultSha256: digest, verificationComparisonSha256: digest, verificationNavigationBindingSha256: digest },
    finalSource: { source: predecessor.plan.projectPath, sourceSha256: digest, sourceIdentitySha256: digest,
      checkpointReceiptSha256: digest, copyReceiptSha256: digest, sqlDigests, method: "issued-copy+verifyCheckpoint+complete-sql" },
    outcome: { metadataPersistedAndVerified: true, savedContentVerifiedInFreshWorker: true, wholeOwnedSessionsExited: true,
      companionOpenedInFreshSession: true, explicitSavePerformed: false, targetEditorOpened: false, saved: false, reopened: false } };
}
export function terminalFixture(): { predecessor: ShapedPredecessor; stored: Record<string, unknown>; envelope: ClosedSymbolAgedTerminalEnvelope; terminalArtifact: TerminalDescriptor } {
  const { commonBody, predecessor, directory } = shapedData();
  const body = { ...commonBody, headEligibility: "aged-unlocked",
    evidence: { ...commonBody.evidence,
      mainReferenceIntent: { path: join(directory, "10-baseline-main-reference-intent.json"), bytes: 1, sha256: digest },
      mainReferenceResult: { path: join(directory, "10-baseline-main-reference-result.json"), bytes: 1, sha256: digest } },
    results: { ...commonBody.results, mainReferenceResultSha256: digest } };
  const envelope = parseClosedSymbolAgedTerminalEnvelope({ profile: "easyeda-pro-control.closed-symbol-terminal.v2", body, bodySha256: sha256Json(body) });
  const terminalArtifact = { path: join(directory, "45-closed-symbol-terminal.json"), bytes: Buffer.byteLength(JSON.stringify(envelope)) + 1, sha256: digest };
  const { journalSha256: _seal, ...prior } = predecessor;
  const stored = sealed({ ...prior, state: AGED_TERMINAL_STATE, updatedAt: envelope.body.recordedAt,
    nextSafeAction: AGED_TERMINAL_NEXT_ACTION, terminalArtifact });
  return { predecessor, stored, envelope, terminalArtifact };
}
export function lockedFixture(): { predecessor: ShapedPredecessor; input: unknown; envelope: ClosedSymbolTerminalEnvelope } {
  const { commonBody: body, predecessor } = shapedData();
  const input = { profile: "easyeda-pro-control.closed-symbol-terminal.v1", body, bodySha256: sha256Json(body) };
  return { predecessor, input, envelope: parseClosedSymbolTerminalEnvelope(input) };
}
