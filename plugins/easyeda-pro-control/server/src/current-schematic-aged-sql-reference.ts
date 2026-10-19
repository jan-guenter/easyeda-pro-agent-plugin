/** SCH-specific original scratch issuer. No public route, symbol token conversion
 * or historical APP authority. The shared transport remains document-neutral.
 */
/* oxlint-disable import/max-dependencies -- Bind existing original baseline, transport, managed evidence and Windows issuers directly, without supplied verifier callbacks. */
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { loadOperation, operationPath, readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson, isRecord, newOperationId, sha256Json } from "./core.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE } from "./current-aged-sql-clock-controls.ts";
import { selectCurrentUnlockedSqlHead } from "./current-aged-sql-head.ts";
import { revalidateCurrentSchematicRenameOpeningEvidence } from "./current-disposable-open-runtime.ts";
// This helper only derives the shared append-only sidecar path; it issues no
// Symbol owner or clock authority and cannot convert a historical token.
import { currentSymbolClockEvidenceId } from "./current-symbol-clock-evidence.ts";
import { assertCurrentSchematicRenameClosedClockBinding, assertOriginalCurrentSchematicRenameBaseline, currentSchematicRenameBaselineClockBinding,
  revalidateCurrentSchematicRenameClosedClockEvidence } from "./current-schematic-rename-owner-baseline.ts";
import type { CurrentSchematicRenameBaseline } from "./current-schematic-rename-owner-baseline.ts";
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

export interface OriginalCurrentSchematicAgedSqlReference {
  readonly profile: "private.original-current-schematic-aged-sql-reference.v1";
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
  readonly result: OriginalCurrentSchematicAgedSqlReference;
  readonly engine: EasyedaControlEngine;
  readonly baseline: CurrentSchematicRenameBaseline;
  readonly text: string;
}
const issued = new WeakMap<object, Original>();
const attempts = new WeakSet<CurrentSchematicRenameBaseline>();
function need(condition: boolean, message = "Current aged SQL reference refused."): asserts condition {
  if (!condition) { throw new Error(message); }
}
export function assertOriginalCurrentSchematicAgedSqlReference(value: unknown, engine: EasyedaControlEngine,
  baseline: CurrentSchematicRenameBaseline): OriginalCurrentSchematicAgedSqlReference {
  need(value !== null && typeof value === "object");
  const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.baseline === baseline && original.text === canonicalJson(value),
    "Current aged SQL reference needs its unchanged original engine and baseline.");
  assertOriginalCurrentSchematicRenameBaseline(baseline, engine);
  return original.result;
}

/** Artifact reproof does not revive old closed-file authority after relaunch. */
export async function revalidateOriginalCurrentSchematicAgedSqlReference(value: unknown, engine: EasyedaControlEngine,
  baseline: CurrentSchematicRenameBaseline): Promise<OriginalCurrentSchematicAgedSqlReference> {
  const original = assertOriginalCurrentSchematicAgedSqlReference(value, engine, baseline);
  await readExactUtf8Artifact(original.intentArtifact);
  need(assertOriginalCurrentSchematicAgedSqlReference(value, engine, baseline) === original);
  await readExactUtf8Artifact(original.resultArtifact);
  need(assertOriginalCurrentSchematicAgedSqlReference(value, engine, baseline) === original);
  return original;
}

/** Called before replacement launch, while original closed-copy authority is
 * valid. The nonce scratch executable never imports EasyEDA APP or its profile.
 * Ambiguous scratch creation/launch consumes this attempt permanently.
 */
export class CurrentSchematicAgedSqlReferenceStage {
  private readonly engine: EasyedaControlEngine;
  private readonly returns = new Map<string, Readonly<MainReferenceTransportOutcome>>();
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  public originalReturn(operationId: string): Readonly<MainReferenceTransportOutcome> | undefined { return this.returns.get(operationId); }

  public async runOnce(input: Readonly<{ baseline: CurrentSchematicRenameBaseline; proof: ClosedSessionTerminationProof }>): Promise<OriginalCurrentSchematicAgedSqlReference> {
    const { baseline, proof } = input, engine = this.engine;
    assertOriginalCurrentSchematicRenameBaseline(baseline, engine);
    need(!attempts.has(baseline), "Current aged SQL reference attempt already consumed."); attempts.add(baseline);
    const operationId = baseline.owner.operationId, proofText = canonicalJson(proof);
    const closureBinding = currentSchematicRenameBaselineClockBinding(baseline, engine), { journalOperationId } = closureBinding;
    need(closureBinding.proof === proof, "Current SCH scratch reference requires its original baseline proof.");
    // Retain expected data only; every guard still obtains and checks the current
    // Original binding, proof, authority and evidence after its awaits.
    const closureBindingText = canonicalJson(closureBinding);
    const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(scopeReader !== undefined);
    // oxlint-disable-next-line typescript/unbound-method -- Retain identity; all calls below use the original engine receiver.
    const admission = engine.assertBridgeAndRecoveryAdmission;
    const unchanged = (): void => {
      assertCurrentSchematicRenameClosedClockBinding(baseline, engine);
      const retained = currentSchematicRenameBaselineClockBinding(baseline, engine);
      need(retained.proof === proof && canonicalJson(retained) === closureBindingText);
      need(input.baseline === baseline && input.proof === proof && canonicalJson(proof) === proofText &&
        engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(engine.upstream) === undefined &&
        engine.assertBridgeAndRecoveryAdmission === admission,
      "Current scratch reference requires its original closed baseline outside a bridge scope.");
      assertCurrentClosedSessionCopyAuthority(proof);
    };
    const current = async (): Promise<void> => {
      unchanged(); await revalidateCurrentSchematicRenameClosedClockEvidence(baseline, engine); unchanged();
    };
    // The public mutating route retains bridgeGate for this whole phase.
    // Intermediate fixed readers and append-only evidence writers cannot dispatch
    // CAD or native scratch actions. Targeted evidence, sidecars and original
    // Owners are still revalidated after their awaits.
    // Full admission is never cached or reused across boundaries. Only bounded
    // Original-opening/selected-journal reads follow it, guarded synchronously
    // After every await. They have no native or bridge effects and preserve the
    // Final journal equality checks while the full scan may take substantial time.
    let journalText: string | undefined;
    const boundary = async (): ReturnType<typeof loadOperation> => {
      await current();
      const selected = await loadOperation(journalOperationId); unchanged();
      const text = canonicalJson(selected);
      need(selected.operationId === journalOperationId && selected["orphanedCallPossible"] === false &&
        (journalText === undefined || text === journalText), "Current scratch selected journal changed at its admission boundary.");
      journalText ??= text;
      await admission.call(engine, journalOperationId); unchanged();
      await revalidateCurrentSchematicRenameOpeningEvidence(baseline.owner, engine); unchanged();
      const finalSelected = await loadOperation(journalOperationId); unchanged();
      need(canonicalJson(finalSelected) === journalText, "Current scratch selected journal changed after full admission.");
      return finalSelected;
    };
    const journal = await boundary(); unchanged();
    const target = baseline.intent.target;
    const head = await selectCurrentUnlockedSqlHead(baseline.inventory, target); await current();
    const clock = await windowsClockObservationForResult(proof, "termination"); await current();
    need(clock.clock.status === "observed" && clock.base["checkedAt"] === proof.closedAt &&
      clock.ownerBinding["operationId"] === journalOperationId && clock.ownerBinding["phase"] === closureBinding.phase);
    const binding = Object.freeze({ profile: "private.current-schematic-aged-sql-reference-binding.v1", operationId,
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
      profile: "private.current-schematic-aged-sql-reference-intent.v1", binding, request, resultPath, baselineClock: clock,
      compilerProfile: invocation.profile, parserSource: invocation.parserSource, scanPolicy: invocation.scanPolicy,
      mainSha256: invocation.mainSha256, commandSha256: invocation.commandSha256, stdinSha256: invocation.stdinSha256,
      sourcePins: invocation.sourcePins, runtimePinsSha256: invocation.runtimePinsSha256, helperIdentity: invocation.helperIdentity,
      windowsSideEffects: "one disjoint nonce scratch copy and original synthetic Job; no EasyEDA APP or profile input", executionAuthorized: false,
    }));
    await current(); await readExactUtf8Artifact(intentArtifact); await current();
    need(canonicalJson(await loadOperation(journalOperationId)) === journalText); unchanged();
    await boundary(); unchanged();
    // Only the boundary's guarded, read-only target-journal proofs follow its
    // Full scan. No intervening native, bridge or other external-effect action.
    const returned = await invokeMainReferenceTransport(invocation);
    this.returns.set(operationId, returned);
    const retained = retainMainReferenceTransportV2(returned, invocation.requestSha256, intentArtifact.sha256);
    const resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "current-aged-reference-result", retained));
    // Retain the original raw return even if a new blocker rejects acceptance.
    // No successful-result parser or issuer runs before fresh full admission.
    await boundary(); unchanged();
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
    await boundary(); unchanged();
    assertCurrentIssuedWindowsClockObservation(clock);
    const result: OriginalCurrentSchematicAgedSqlReference = Object.freeze({ profile: "private.original-current-schematic-aged-sql-reference.v1", operationId,
      request, controlsAfter, nativeBefore, nativeAfter, parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE, mainSha256: invocation.mainSha256,
      intentArtifact, resultArtifact, originalScratchProcessRetained: true, fullScanRequiredBeforeResult: true, fullScanWireOutputRetained: false,
      currentAppSourceQualified: false, appClockDirectlyObserved: false, executionAuthorized: false });
    issued.set(result, { result, engine, baseline, text: canonicalJson(result) }); return result;
  }
}
