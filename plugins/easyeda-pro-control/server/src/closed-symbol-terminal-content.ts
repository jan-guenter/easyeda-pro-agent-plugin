/** Internal data reconstruction. Never registers historical replies as originals. */
/* oxlint-disable import/max-dependencies -- Replay fixed producer compilers and parsers directly; forwarding modules would obscure the absence of Stage issuer calls. */
import { join } from "node:path";
import { operationPath, readExactUtf8Artifact } from "./artifacts.ts";
import type { ClosedJournal, Generation, PhaseEvent } from "./closed-symbol-journal.ts";
import type { OriginalClosedSymbolWitness } from "./closed-symbol-witness.ts";
import type { PreparedClosedSymbolSql } from "./closed-symbol-sql-comparison.ts";
import type { OriginalClosedSymbolWrite } from "./closed-symbol-write.ts";
import type { OriginalSavedSymbolSource } from "./closed-symbol-saved-source.ts";
import type { OriginalClosedSymbolSavedRead } from "./closed-symbol-saved-read.ts";
import { validateStartupResult } from "./closed-symbol-startup-program.ts";
import { canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text } from "./core.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { buildWorkerBoundProjectSymbolMetadataExpression } from "./project-symbol-metadata.ts";
import { buildClosedSymbolSavedContentExpression } from "./saved-symbol-reader.ts";
import { verifySavedSymbolContent } from "./saved-symbol-projection.ts";
import type { SavedSymbolProjection } from "./saved-symbol-projection.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { nativeLibraryHeaderEvidence } from "./native-library-header-evidence.ts";
import { buildRecoveryNavigationCode, deriveRecoveryNavigationTarget } from "./recovery-navigation.ts";
import type { TerminalDescriptor } from "./closed-symbol-terminal-shape.ts";
import { phase, phaseData } from "./closed-symbol-terminal-lifecycle.ts";
import { validateRecordedCaptureEvidence } from "./closed-symbol-recorded-native.ts";
import type { RecordedNativeSource } from "./closed-symbol-recorded-native.ts";

type Bag = Readonly<Record<string, unknown>>;
const EPOCH_TICKS = 621_355_968_000_000_000n;
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function bag(value: unknown): Bag { need(isRecord(value), "Terminal content object missing."); return value; }
function same(actual: unknown, expected: unknown, label: string): void { need(canonicalJson(actual) === canonicalJson(expected), `Terminal ${label} differs.`); }
function generation(events: readonly PhaseEvent[], index: number, ordinal: number): Generation {
  const value = phase(events, index).generation;
  need(value !== null && "captureSha256" in value && value.ordinal === ordinal, "Terminal content generation missing."); return value;
}
function context(journal: ClosedJournal): { project: { uuid: string; path: string }; document: { uuid: string; documentType: 3; tabId: string } } {
  return { project: { uuid: journal.plan.projectUuid, path: journal.plan.projectPath },
    document: { uuid: journal.plan.activeUuid, documentType: 3, tabId: `${journal.plan.activeUuid}@${journal.plan.projectUuid}` } };
}

export function reconstructRecordedWrite(input: Readonly<{
  journal: ClosedJournal; events: readonly PhaseEvent[]; witness: OriginalClosedSymbolWitness; preparation: PreparedClosedSymbolSql;
}>): OriginalClosedSymbolWrite {
  const { journal, events, witness, preparation } = input;
  const expectedContext = context(journal);
  const code = `return await ${buildWorkerBoundProjectSymbolMetadataExpression(preparation.metadataPlan, expectedContext, witness.expectedActor,
    { projectUuid: witness.witness.projectUuid, client: witness.witness.client, maxTicket: witness.witness.preDispatchMaxTicket,
      notBeforeMs: witness.witness.serverClockMinMs, notAfterMs: witness.witness.serverClockMaxMs })}`;
  const request = { profile: "private.closed-symbol-write-request.v1", witnessArtifactSha256: witness.artifactSha256,
    witnessClockArtifactSha256: witness.clockArtifactSha256, witnessClockArtifact: witness.clockArtifact,
    preparedSqlPlanSha256: preparation.preparedSqlPlanSha256, metadataPlanSha256: preparation.metadataPlanSha256,
    codeSha256: sha256Text(code), context: expectedContext, sameOriginalClockWindow: true };
  same(phaseData(events, 21), request, "fixed write request");
  const requestSha256 = sha256Json(request);
  const raw = phaseData(events, 22);
  need(phase(events, 21).requestSha256 === requestSha256 && phase(events, 22).requestSha256 === requestSha256 && journal.mutationMayHaveOccurred,
    "Terminal write request/risk binding differs.");
  same(Object.keys(raw), ["rawReturn"], "write result fields");
  const result = decodeExactReadEnvelope(extractToolPayload(raw["rawReturn"]));
  same(result, { kind: "project-symbol-metadata", targetId: journal.plan.targetUuid, createdId: null }, "write acknowledgement");
  const artifactSha256 = journal.artifacts[21]?.sha256; need(artifactSha256 !== undefined, "Terminal write artifact missing.");
  return Object.freeze({ profile: "private.closed-symbol-write-result.v1", operationId: journal.operationId, generation: generation(events, 22, 1),
    requestSha256, artifactSha256, witnessArtifactSha256: witness.artifactSha256, witnessClockArtifactSha256: witness.clockArtifactSha256,
    preparedSqlPlanSha256: preparation.preparedSqlPlanSha256, metadataPlanSha256: preparation.metadataPlanSha256,
    result: Object.freeze({ kind: "project-symbol-metadata", targetId: journal.plan.targetUuid, createdId: null }),
    executionAuthorized: false, completionProved: false, saved: false, reopened: false });
}

/** Bounded durable projection, not the nondurable complete active-context blob. */
export async function recordedNavigationBinding(journal: ClosedJournal, events: readonly PhaseEvent[], selected: "edit-open" | "verify-open"): Promise<Bag> {
  const seal = canonicalJson({ journal, events });
  const current = (): void => { same(canonicalJson({ journal, events }), seal, "navigation caller changed"); };
  const index = selected === "edit-open" ? 17 : 35;
  const copyIndex = selected === "edit-open" ? 9 : 25;
  const request = phaseData(events, index);
  const raw = phaseData(events, index + 1);
  const checkpoint = bag(phaseData(events, copyIndex)["checkpoint"]);
  same(request["checkpoint"], checkpoint, "navigation checkpoint");
  same(request["target"], { projectUuid: journal.plan.projectUuid, projectPath: journal.plan.projectPath, documentUuid: journal.plan.activeUuid, documentType: 3 }, "navigation target");
  same(request["context"], { project: { uuid: journal.plan.projectUuid, path: journal.plan.projectPath }, document: { uuid: journal.plan.activeUuid, documentType: 3 } }, "navigation requested context");
  need(typeof checkpoint["checkpoint"] === "string" && typeof checkpoint["checkpointSha256"] === "string", "Terminal navigation checkpoint missing.");
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint["checkpoint"], expectedSha256: checkpoint["checkpointSha256"],
    projectUuid: journal.plan.projectUuid, libraryAtomHeaders: "preserve" }); current();
  const expectedContext = { project: { uuid: journal.plan.projectUuid, path: journal.plan.projectPath }, document: { uuid: journal.plan.activeUuid, documentType: 3 } };
  const target = deriveRecoveryNavigationTarget(expectedContext, history);
  const headers = await nativeLibraryHeaderEvidence(history, { checkpointSha256: checkpoint["checkpointSha256"], projectUuid: journal.plan.projectUuid }); current();
  need(history.projectOwnerUuid === journal.plan.ownerUuid, "Terminal navigation retained project owner differs.");
  const code = buildRecoveryNavigationCode(target, { navigate: true, requireExclusiveTabs: true, requireEditorReadiness: true,
    checkpointProjectOwnerUuid: history.projectOwnerUuid });
  same(request, { target, context: expectedContext, checkpoint, codeSha256: sha256Text(code), libraryHeaderEvidence: headers }, "full fixed navigation request");
  need(phase(events, index).requestSha256 === sha256Json(request) && phase(events, index + 1).requestSha256 === sha256Json(request), "Terminal navigation request hash differs.");
  same(Object.keys(raw), ["rawReturn"], "navigation result fields");
  const native = bag(extractToolPayload(raw["rawReturn"]));
  const project = { uuid: journal.plan.projectUuid, path: journal.plan.projectPath };
  const document = bag(native["document"]);
  need(typeof native["openedProject"] === "boolean" && typeof native["openedDocument"] === "boolean" && typeof document["tabId"] === "string" &&
    document["tabId"].length > 0 && document["tabId"].length <= 256, "Terminal navigation acknowledgement invalid.");
  const targetDocument = { uuid: journal.plan.activeUuid, documentType: 3, tabId: document["tabId"] };
  same(native, { ok: true, schema: "easyeda-pro-control.recovery-navigation.v1", openedProject: native["openedProject"], openedDocument: native["openedDocument"],
    project, document: targetDocument }, "navigation native acknowledgement");
  return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-navigation-binding.v1", operationId: journal.operationId, phase: selected,
    project, document: targetDocument, checkpointReceiptSha256: sha256Json(checkpoint), openedProject: native["openedProject"], openedDocument: native["openedDocument"],
    navigationAcknowledged: true, currentCheckpointUnchanged: true });
}

export async function reconstructRecordedSavedRead(input: Readonly<{
  journal: ClosedJournal; events: readonly PhaseEvent[]; source: OriginalSavedSymbolSource; projection: SavedSymbolProjection;
  rawArtifact: TerminalDescriptor; nativeSource: RecordedNativeSource;
}>): Promise<OriginalClosedSymbolSavedRead> {
  const { journal, events, source } = input;
  const callerSeal = canonicalJson({ journal, events, source, rawArtifact: input.rawArtifact, nativeSource: input.nativeSource });
  const current = (): void => { same(canonicalJson({ journal, events, source, rawArtifact: input.rawArtifact, nativeSource: input.nativeSource }), callerSeal, "saved-read replay caller"); };
  const request = phaseData(events, 37);
  const result = phaseData(events, 38);
  const admitted = generation(events, 38, 2);
  const startupData = phaseData(events, 34), startupInput = { phase: "verify-marker-read" as const, projectUuid: journal.plan.projectUuid,
    branchUuid: journal.plan.branchUuid, ownerUuid: journal.plan.ownerUuid, marker: journal.plan.marker };
  const startup = validateStartupResult(extractToolPayload(startupData["rawReturn"]), startupInput);
  const observations = startup["observations"];
  need(startup["ok"] === true && Array.isArray(observations), "Terminal saved-read startup missing.");
  const actor = validateActorProjection(bag(bag(observations[0])["observation"])["startupActor"]);
  const clock = bag(request["clock"]);
  const capture = bag(request["clockCapture"]);
  const authority = bag(capture["executionAuthority"]);
  const clockData = bag(clock["clock"]);
  const base = bag(clock["base"]);
  const owner = bag(clock["ownerBinding"]);
  validateRecordedCaptureEvidence({ journal, generation: admitted, capture, phase: "closed-verification", attempt: 2,
    bridgeDispatch: phaseData(events, 31)["bridgeDispatch"], source: input.nativeSource, clock });
  need(clock["schema"] === "easyeda-pro-control.owned-clock-attachment.v1" && clock["phase"] === "capture" &&
    clock["helperSourceSha256"] === input.nativeSource.helperSourceSha256 && clock["executionScopeSha256"] === input.nativeSource.executionScopeSha256 &&
    typeof clock["baseSha256"] === "string" && /^[a-f0-9]{64}$/u.test(clock["baseSha256"]) && clock["producerBindingVerified"] === false && clock["executionAuthorized"] === false &&
    clockData["status"] === "observed" && clockData["tzAbsentBefore"] === true && clockData["tzAbsentAfter"] === true &&
    base["jobId"] === admitted.jobId && base["helperInstance"] === admitted.helperInstance && base["bindingSha256"] === authority["bindingSha256"] &&
    capture["operationId"] === journal.operationId && capture["phase"] === "closed-verification" && capture["challengeAttempt"] === 2 &&
    sha256Json(capture["bridgeSession"]) === admitted.sessionSha256 && sha256Json(capture["runtimeIdentity"]) === admitted.runtimeSha256,
    "Terminal saved-read clock/capture binding differs.");
  // The baseSha256 field seals the original wire object's JSON property order. The
  // Validated base is rebuilt in fixed parser order, so it cannot reproduce that
  // Raw digest. The phase's exact file hash binds the retained digest; compare
  // The base fields to the independently retained capture here instead.
  same(base["processes"], authority["processes"], "saved-read captured processes");
  need(base["capturedAt"] === authority["capturedAt"], "Terminal saved-read capture time differs.");
  const { authoritySha256, ...authorityBody } = authority;
  need(authoritySha256 === sha256Json(authorityBody) && authority["processTreeSha256"] === sha256Json(authority["processes"]),
    "Terminal saved-read capture self-seal differs.");
  same(owner, { operationId: journal.operationId, phase: "closed-verification", challengeAttempt: 2, bindingSha256: authority["bindingSha256"],
    bridgeSessionSha256: admitted.sessionSha256, runtimeIdentitySha256: admitted.runtimeSha256, authoritySha256: authority["authoritySha256"] }, "saved-read clock owner");
  const admissionTime = bag(bag(phaseData(events, 32)["capture"])["executionAuthority"])["capturedAt"];
  const closedTime = bag(phaseData(events, 41)["proof"])["closedAt"];
  need(typeof admissionTime === "string" && typeof closedTime === "string" && typeof authority["capturedAt"] === "string" &&
    Date.parse(admissionTime) <= Date.parse(authority["capturedAt"]) && Date.parse(authority["capturedAt"]) <= Date.parse(closedTime),
    "Terminal saved-read capture is outside its admitted closed generation.");
  const before = validateClockSample(clockData["before"]);
  const after = validateClockSample(clockData["after"]);
  need(before.qpcFrequency === after.qpcFrequency && before.zoneRulesSha256 === after.zoneRulesSha256 && before.localOffsetMinutes === after.localOffsetMinutes &&
    BigInt(before.utcAfterTicks) <= BigInt(after.utcBeforeTicks) && BigInt(before.qpcAfter) <= BigInt(after.qpcBefore), "Terminal saved-read clock sample order differs.");
  const notBeforeMs = Number((BigInt(before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
  const expectedContext = context(journal);
  const readPlan = { projectUuid: source.projectUuid, branchUuid: source.branchUuid, ownerUuid: source.ownerUuid, targetUuid: source.targetUuid,
    headerEditVersion: source.headerEditVersion, maximumTicket: source.maximumTicket, notBeforeMs, notAfterMs: notBeforeMs + 60_000 };
  const code = `return await ${buildClosedSymbolSavedContentExpression(readPlan, expectedContext, actor)}`;
  const rawPath = join(operationPath(journal.operationId).slice(0, -5), "38-verify-content-read-raw.json");
  const expected = { profile: "private.closed-symbol-saved-read-request.v1", source, context: expectedContext, expectedActor: actor, readPlan,
    codeSha256: sha256Text(code), rawPath, rawLimit: 172_032, artifactLimit: 245_760, clockCapture: capture, clock };
  same(request, expected, "saved-read fixed request");
  const requestSha256 = sha256Json(expected);
  need(phase(events, 37).requestSha256 === requestSha256 && phase(events, 38).requestSha256 === requestSha256,
    "Terminal saved-read request digest differs.");
  const rawArtifact = input.rawArtifact;
  need(rawArtifact.path === rawPath && rawArtifact.bytes > 0 && rawArtifact.bytes <= 245_760, "Terminal saved-read raw artifact bound differs.");
  same(result["rawArtifact"], rawArtifact, "saved-read raw descriptor");
  const retained = await readExactUtf8Artifact(rawArtifact); current();
  const envelope = bag(JSON.parse(retained.text) as unknown);
  const encoded = envelope["rawReturnBase64"], size = envelope["rawReturnBytes"];
  need(typeof encoded === "string" && typeof size === "number" && Number.isSafeInteger(size) && size > 0 && size <= 172_032,
    "Terminal saved-read raw byte metadata differs.");
  const bytes = Buffer.from(encoded, "base64");
  need(bytes.length === size && bytes.toString("base64") === encoded, "Terminal saved-read base64/byte count differs.");
  const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  const rawSha256 = sha256Text(text);
  same(envelope, { profile: "private.closed-symbol-saved-read-raw.v1", operationId: journal.operationId, requestSha256, sourceSha256: source.sourceSha256,
    rawReturnSha256: rawSha256, rawReturnBytes: size, rawReturnBase64: encoded }, "saved-read raw envelope");
  same(result, { rawArtifact, rawReturnSha256: rawSha256, rawReturnBytes: size, sourceSha256: source.sourceSha256 }, "saved-read result descriptor");
  const observation = bag(extractToolPayload(JSON.parse(text) as unknown));
  need(Reflect.ownKeys(observation).length === 9 && observation["profile"] === "private.saved-symbol-content-observation.v1" &&
    observation["projectUuid"] === source.projectUuid && observation["targetUuid"] === source.targetUuid && observation["maximumTicket"] === source.maximumTicket &&
    typeof observation["workerClient"] === "string" && /^[a-f0-9]{16}$/u.test(observation["workerClient"]) && typeof observation["content"] === "string" &&
    Buffer.byteLength(observation["content"]) <= 65_536 && observation["executionAuthorized"] === false && observation["producerBindingVerified"] === false &&
    observation["completionProved"] === false, "Terminal saved-read observation scope differs.");
  const relation = Object.freeze({ ...verifySavedSymbolContent(input.projection, observation), sourceSha256: source.sourceSha256,
    editComparisonResultSha256: source.editComparisonResultSha256 });
  const artifactSha256 = journal.artifacts[37]?.sha256; need(artifactSha256 !== undefined, "Terminal saved-read result artifact missing.");
  return Object.freeze({ profile: "private.closed-symbol-saved-read.v1", operationId: journal.operationId, generation: admitted,
    sourceSha256: source.sourceSha256, editComparisonResultSha256: source.editComparisonResultSha256, editComparisonArtifactSha256: source.editComparisonArtifactSha256,
    requestSha256, artifactSha256, rawArtifact, rawReturnSha256: rawSha256, rawReturnBytes: size, relation,
    executionAuthorized: false, completionProved: false, saved: false, reopened: false });
}
