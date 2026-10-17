/** Original current scratch issuer. No public route or historical APP authority. */
/* oxlint-disable import/max-dependencies -- Bind existing original baseline, transport, managed evidence and Windows issuers directly, without supplied verifier callbacks. */
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { loadOperation, operationPath, readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson, isRecord, newOperationId, sha256Json } from "./core.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE } from "./current-aged-sql-clock-controls.ts";
import { selectCurrentUnlockedSqlHead } from "./current-aged-sql-head.ts";
import { currentSymbolClockEvidenceId } from "./current-symbol-clock-evidence.ts";
// oxlint-disable-next-line import/no-cycle -- The baseline coordinator invokes this stage; only its existing copy issuer may admit the original input.
import { assertOriginalCurrentSymbolCopyBaselineCopy, currentSymbolCopyBaselineClockBinding, revalidateCurrentSymbolCopyBaselineCopy } from "./current-symbol-baseline-copy.ts";
import type { CurrentSymbolCopyBaselineCopy } from "./current-symbol-baseline-copy.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { MAIN_REFERENCE_PROFILE, validateMainReferenceRequest } from "./closed-symbol-main-reference-program.ts";
import { CURRENT_MAIN_REFERENCE_RUNTIME_PINS } from "./current-main-reference-helper-identity.ts";
import { compileCurrentAgedSqlReferenceTransport, invokeMainReferenceTransport } from "./closed-symbol-main-reference-transport.ts";
import type { MainReferenceTransportOutcome } from "./closed-symbol-main-reference-transport.ts";
import { validateMainReferenceTransportV3Result } from "./closed-symbol-main-reference-v3-result.ts";
import { retainMainReferenceTransportV2, successfulRetainedMainReferenceText } from "./closed-symbol-main-reference-result-envelope.ts";
import { validateClockControls } from "./symbol-clock-controls.ts";
import type { ClockControls } from "./symbol-clock-controls.ts";
import { assertCurrentClosedSessionCopyAuthority, assertCurrentIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { ClosedSessionTerminationProof } from "./windows-authority.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

export interface OriginalCurrentCopyAgedSqlReference {
  readonly profile: "private.original-current-copy-aged-sql-reference.v1";
  readonly operationId: string;
  readonly request: ReturnType<typeof validateMainReferenceRequest>;
  readonly controlsAfter: ClockControls;
  readonly nativeBefore: ReturnType<typeof validateClockSample>;
  readonly nativeAfter: ReturnType<typeof validateClockSample>;
  readonly parserSource: typeof CURRENT_AGED_SQL_DATE_PARSER_SOURCE;
  readonly mainSha256: string;
  readonly intentArtifact: Readonly<ArtifactDescriptor>;
  readonly resultArtifact: Readonly<ArtifactDescriptor>;
  readonly originalScratchProcessRetained: true;
  readonly fullScanRequiredBeforeResult: true;
  readonly fullScanWireOutputRetained: false;
  readonly currentAppSourceQualified: false;
  readonly appClockDirectlyObserved: false;
  readonly executionAuthorized: false;
}
interface Original {
  readonly result: OriginalCurrentCopyAgedSqlReference;
  readonly engine: EasyedaControlEngine;
  readonly baseline: CurrentSymbolCopyBaselineCopy;
  readonly text: string;
}
const issued = new WeakMap<object, Original>();
const attempts = new WeakSet<CurrentSymbolCopyBaselineCopy>();
function need(condition: boolean, message = "Current aged SQL reference refused."): asserts condition {
  if (!condition) { throw new Error(message); }
}
export function assertOriginalCurrentCopyAgedSqlReference(value: unknown, engine: EasyedaControlEngine,
  baseline: CurrentSymbolCopyBaselineCopy): OriginalCurrentCopyAgedSqlReference {
  need(value !== null && typeof value === "object");
  const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.baseline === baseline && original.text === canonicalJson(value),
    "Current aged SQL reference needs its unchanged original engine and baseline.");
  assertOriginalCurrentSymbolCopyBaselineCopy(baseline, engine);
  return original.result;
}

/** Artifact reproof does not revive old closed-file authority after relaunch. */
export async function revalidateOriginalCurrentCopyAgedSqlReference(value: unknown, engine: EasyedaControlEngine,
  baseline: CurrentSymbolCopyBaselineCopy): Promise<OriginalCurrentCopyAgedSqlReference> {
  const original = assertOriginalCurrentCopyAgedSqlReference(value, engine, baseline);
  await readExactUtf8Artifact(original.intentArtifact);
  need(assertOriginalCurrentCopyAgedSqlReference(value, engine, baseline) === original);
  await readExactUtf8Artifact(original.resultArtifact);
  need(assertOriginalCurrentCopyAgedSqlReference(value, engine, baseline) === original);
  return original;
}

/** Called before replacement launch, while original closed-copy authority is
 * valid. The nonce scratch executable never imports EasyEDA APP or its profile.
 * Ambiguous scratch creation/launch consumes this attempt permanently.
 */
export class CurrentCopyAgedSqlReferenceStage {
  private readonly engine: EasyedaControlEngine;
  private readonly returns = new Map<string, Readonly<MainReferenceTransportOutcome>>();
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  public originalReturn(operationId: string): Readonly<MainReferenceTransportOutcome> | undefined { return this.returns.get(operationId); }

  public async runOnce(input: Readonly<{ baseline: CurrentSymbolCopyBaselineCopy; proof: ClosedSessionTerminationProof }>): Promise<OriginalCurrentCopyAgedSqlReference> {
    const { baseline, proof } = input, engine = this.engine;
    assertOriginalCurrentSymbolCopyBaselineCopy(baseline, engine);
    need(!attempts.has(baseline), "Current aged SQL reference attempt already consumed."); attempts.add(baseline);
    const operationId = baseline.owner.operationId, proofText = canonicalJson(proof);
    const closureBinding = currentSymbolCopyBaselineClockBinding(baseline, engine), { journalOperationId } = closureBinding;
    const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(scopeReader !== undefined);
    const unchanged = (): void => {
      assertOriginalCurrentSymbolCopyBaselineCopy(baseline, engine);
      need(canonicalJson(currentSymbolCopyBaselineClockBinding(baseline, engine)) === canonicalJson(closureBinding));
      need(input.baseline === baseline && input.proof === proof && canonicalJson(proof) === proofText &&
        engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(engine.upstream) === undefined,
      "Current scratch reference requires its original closed baseline outside a bridge scope.");
      assertCurrentClosedSessionCopyAuthority(proof);
    };
    const current = async (): Promise<void> => {
      unchanged(); await revalidateCurrentSymbolCopyBaselineCopy(engine, baseline, proof); unchanged();
    };
    await current(); await engine.assertBridgeDispatchAllowed(); await current();
    await engine.assertRecoveryOperationIsolated(journalOperationId); await current();
    const journal = await loadOperation(journalOperationId); unchanged();
    const journalText = canonicalJson(journal);
    need(journal.operationId === journalOperationId && journal["orphanedCallPossible"] === false);
    const target = { ...baseline.preparation.source, ownerUuid: baseline.preparation.ownerUuid };
    const head = await selectCurrentUnlockedSqlHead(baseline.inventory, target); await current();
    const clock = await windowsClockObservationForResult(proof, "termination"); await current();
    need(clock.clock.status === "observed" && clock.base["checkedAt"] === proof.closedAt &&
      clock.ownerBinding["operationId"] === journalOperationId && clock.ownerBinding["phase"] === closureBinding.phase);
    const binding = Object.freeze({ profile: "private.current-aged-sql-reference-binding.v1", operationId,
      planHash: journal.planHash, baselineCopyReceiptSha256: baseline.copy.receiptSha256,
      baselineLogicalSha256: baseline.inventory.logicalSha256, target,
      parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE, historyUuid: head.historyUuid });
    const request = validateMainReferenceRequest({ profile: MAIN_REFERENCE_PROFILE, nonce: randomBytes(32).toString("hex"),
      // The native generic wire protocol requires this grammar. The separately
      // Retained binding digest ties it to the actual current operation ID.
      operationId: newOperationId(), closedPlanSha256: sha256Json(binding), baselineCopyReceiptSha256: baseline.copy.receiptSha256,
      baselineLogicalSha256: baseline.inventory.logicalSha256, baselineClosureClockSha256: sha256Json(clock),
      nativePinsSha256: sha256Json({ parser: CURRENT_AGED_SQL_DATE_PARSER_SOURCE, runtime: CURRENT_MAIN_REFERENCE_RUNTIME_PINS }), ...head,
      referenceUtcMs: Number((BigInt(clock.clock.after.utcBeforeTicks) - 621_355_968_000_000_000n) / 10_000n) });
    const invocation = await compileCurrentAgedSqlReferenceTransport(request); await current();
    need(canonicalJson(await loadOperation(journalOperationId)) === journalText); unchanged();
    const evidenceId = currentSymbolClockEvidenceId(operationId);
    const resultPath = join(operationPath(evidenceId).slice(0, -5), "00-current-aged-reference-result.json");
    const intentArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "current-aged-reference-intent", {
      profile: "private.current-aged-sql-reference-intent.v1", binding, request, resultPath, baselineClock: clock,
      compilerProfile: invocation.profile, parserSource: invocation.parserSource, scanPolicy: invocation.scanPolicy,
      mainSha256: invocation.mainSha256, commandSha256: invocation.commandSha256, stdinSha256: invocation.stdinSha256,
      sourcePins: invocation.sourcePins, runtimePinsSha256: invocation.runtimePinsSha256, helperIdentity: invocation.helperIdentity,
      windowsSideEffects: "one disjoint nonce scratch copy and original synthetic Job; no EasyEDA APP or profile input", executionAuthorized: false,
    }));
    await current(); await readExactUtf8Artifact(intentArtifact); await current();
    need(canonicalJson(await loadOperation(journalOperationId)) === journalText); unchanged();
    const returned = await invokeMainReferenceTransport(invocation);
    this.returns.set(operationId, returned);
    const retained = retainMainReferenceTransportV2(returned, invocation.requestSha256, intentArtifact.sha256);
    const resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "current-aged-reference-result", retained));
    await current();
    need(resultArtifact.path === resultPath && resultArtifact.bytes <= 196_608);
    const text = successfulRetainedMainReferenceText(retained, invocation.requestSha256, intentArtifact.sha256);
    need(text.text === returned.stdout);
    // This validator owns only the generic native scratch/process relation. It
    // Never calls the historical APP parser comparator or issues its authority.
    const observation = validateMainReferenceTransportV3Result(JSON.parse(text.text) as unknown, invocation);
    const reference = observation["reference"]; need(isRecord(reference));
    const controlsAfter = validateClockControls(reference["mainReference"],
      { createdAtLiteral: request.createdAtLiteral, referenceUtcMs: request.referenceUtcMs }, "main-reference");
    const nativeBefore = validateClockSample(observation["nativeBefore"]);
    const nativeAfter = validateClockSample(observation["nativeAfter"]);
    for (const sample of [nativeBefore, nativeAfter]) {
      need(sample.zoneRulesSha256 === clock.clock.after.zoneRulesSha256 && sample.localOffsetMinutes === clock.clock.after.localOffsetMinutes &&
        sample.qpcFrequency === clock.clock.after.qpcFrequency);
    }
    need(BigInt(nativeBefore.utcBeforeTicks) >= BigInt(clock.clock.after.utcAfterTicks) &&
      BigInt(nativeBefore.qpcBefore) >= BigInt(clock.clock.after.qpcAfter));
    await readExactUtf8Artifact(resultArtifact); await current();
    need(canonicalJson(await loadOperation(journalOperationId)) === journalText); unchanged();
    assertCurrentIssuedWindowsClockObservation(clock);
    const result: OriginalCurrentCopyAgedSqlReference = Object.freeze({ profile: "private.original-current-copy-aged-sql-reference.v1", operationId,
      request, controlsAfter, nativeBefore, nativeAfter, parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE, mainSha256: invocation.mainSha256,
      intentArtifact, resultArtifact, originalScratchProcessRetained: true, fullScanRequiredBeforeResult: true, fullScanWireOutputRetained: false,
      currentAppSourceQualified: false, appClockDirectlyObserved: false, executionAuthorized: false });
    issued.set(result, { result, engine, baseline, text: canonicalJson(result) }); return result;
  }
}
