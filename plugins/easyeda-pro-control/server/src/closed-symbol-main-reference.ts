/** Private prospective baseline qualification. No route, renderer, target cache,
 * writer, replay, aged-head grant or completion claim. Editing remains blocked.
 */
/* oxlint-disable import/max-dependencies -- Bind actual managed artifacts, original closed SQL/copy and source-issued clock owners directly, without callback issuers. */
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { operationPath, readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { ClosedSessionTerminationProof } from "./windows-authority.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "./closed-symbol-native-profile.ts";
import { mainReferenceBaseline } from "./closed-symbol-main-reference-baseline.ts";
import { MAIN_REFERENCE_PROFILE, validateMainReferenceRequest } from "./closed-symbol-main-reference-program.ts";
import { compileMainReferenceTransportV3, invokeMainReferenceTransport } from "./closed-symbol-main-reference-transport.ts";
import { validateMainReferenceTransportV3Result } from "./closed-symbol-main-reference-v3-result.ts";
import { retainMainReferenceTransportV2, successfulRetainedMainReferenceText } from "./closed-symbol-main-reference-result-envelope.ts";

export interface OriginalMainReference {
  readonly profile: "private.original-main-reference.v1"; readonly operationId: string;
  readonly request: ReturnType<typeof validateMainReferenceRequest>; readonly observation: Readonly<Record<string, unknown>>;
  readonly intentArtifact: Readonly<ArtifactDescriptor>; readonly resultArtifact: Readonly<ArtifactDescriptor>;
  readonly baselineCopyReceiptSha256: string; readonly baselineLogicalSha256: string; readonly operationSha256: string;
  readonly appClockDirectlyObserved: false; readonly executionAuthorized: false;
}
const attempts = new WeakMap<EasyedaControlEngine, Set<string>>();
const originals = new WeakMap<object, { engine: EasyedaControlEngine; operationId: string; text: string; result: OriginalMainReference }>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
export function assertOriginalMainReference(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalMainReference {
  const record = value !== null && typeof value === "object" ? originals.get(value) : undefined;
  need(record !== undefined && record.engine === engine && record.operationId === operationId && record.text === canonicalJson(value), "Main reference was not issued for this original operation.");
  return record.result;
}

/** Historical artifact reproof only. A later edit launch intentionally consumes
 * baseline copy authority, so this never tries to revive that old authority. */
export async function revalidateOriginalMainReference(value: unknown, engine: EasyedaControlEngine, operationId: string): Promise<OriginalMainReference> {
  const original = assertOriginalMainReference(value, engine, operationId);
  const directory = operationPath(operationId).slice(0, -5);
  need(original.intentArtifact.path === join(directory, "10-baseline-main-reference-intent.json") &&
    original.resultArtifact.path === join(directory, "10-baseline-main-reference-result.json") &&
    original.intentArtifact.bytes > 0 && original.intentArtifact.bytes <= 60_000 &&
    original.resultArtifact.bytes > 0 && original.resultArtifact.bytes <= 196_608, "Main reference historical artifact scope differs.");
  await readExactUtf8Artifact(original.intentArtifact);
  need(assertOriginalMainReference(value, engine, operationId) === original, "Main reference changed during historical revalidation.");
  await readExactUtf8Artifact(original.resultArtifact);
  need(assertOriginalMainReference(value, engine, operationId) === original, "Main reference changed during historical revalidation.");
  return original;
}

export class ClosedSymbolMainReferenceStage {
  private readonly engine: EasyedaControlEngine;
  private readonly returns = new Map<string, Awaited<ReturnType<typeof invokeMainReferenceTransport>>>();
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  public originalReturn(operationId: string): Awaited<ReturnType<typeof invokeMainReferenceTransport>> | undefined { return this.returns.get(operationId); }

  public async runOnce(input: Readonly<{ journal: ClosedJournal; baselineCopy: ClosedFileCopyReceipt; baselineInventory: NativeSqlInventory; baselineProof: ClosedSessionTerminationProof }>): Promise<OriginalMainReference> {
    const callerText = canonicalJson(input.journal), operationId = input.journal.operationId;
    let used = attempts.get(this.engine); if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    need(!used.has(operationId), "Main reference attempt already consumed; inspect retained intent/result instead of retrying."); used.add(operationId);
    const copy = input.baselineCopy, inventory = input.baselineInventory, proof = input.baselineProof;
    const copyText = canonicalJson(copy), proofText = canonicalJson(proof);
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    need(typeof scopeReader === "function", "Main reference cannot observe the outer scope.");
    const unchanged = (): void => {
      need(canonicalJson(input.journal) === callerText && input.baselineCopy === copy && input.baselineInventory === inventory && input.baselineProof === proof &&
        canonicalJson(copy) === copyText && canonicalJson(proof) === proofText && readerCompletion(inventory).exitCode === 0, "Main reference original caller or baseline changed.");
      need(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(this.engine.upstream) === undefined,
        "Main reference must run outside an authenticated generation.");
    };
    const current = async (): Promise<void> => {
      unchanged(); need(await assertClosedSessionCopyAuthority(proof) === proof, "Main reference baseline closure is no longer owned."); unchanged();
    };
    const loaded = await loadClosedSymbolJournal(operationId); unchanged();
    const { events, journal } = loaded;
    const copyIntent = events.find((event) => event.step === "baseline-copy" && event.kind === "intent"), last = events.at(-1);
    need(canonicalJson(journal) === callerText && journal.sequence === 10 && !journal.hardStop && !journal.orphanedCallPossible && last?.step === "baseline-copy" && last.kind === "result" &&
      last.generation?.ordinal === 0 && isRecord(copyIntent?.data) && canonicalJson(copyIntent.data["proof"]) === proofText &&
      proof["operationId"] === operationId && proof["phase"] === "closed-baseline" && proof["challengeAttempt"] === 1 && proof.proofSha256 === copy.closureProofSha256 &&
      proof["jobId"] === last.generation.jobId && proof["helperInstance"] === last.generation.helperInstance,
      "Main reference requires its original closed baseline immediately before edit launch.");
    need(journal.plan.nativePinsSha256 === WITNESS_NATIVE_PINS_SHA256, "Main reference native source profile differs.");
    await current(); await this.engine.assertBridgeDispatchAllowed(); await current(); await this.engine.assertRecoveryOperationIsolated(operationId); await current();
    const baseline = await mainReferenceBaseline(journal, events, copy, inventory); await current();
    const baselineClock = await windowsClockObservationForResult(proof, "termination"); await current();
    need(baselineClock.clock.status === "observed" && baselineClock.base["checkedAt"] === proof.closedAt && baselineClock.base["jobEmpty"] === true &&
      baselineClock.base["jobId"] === proof["jobId"] && baselineClock.base["helperInstance"] === proof["helperInstance"] &&
      baselineClock.ownerBinding["operationId"] === operationId && baselineClock.ownerBinding["phase"] === "closed-baseline" &&
      baselineClock.ownerBinding["challengeAttempt"] === 1 && baselineClock.ownerBinding["closeIntentSha256"] === proof.closeIntentSha256 &&
      baselineClock.ownerBinding["authoritySha256"] === proof.authoritySha256,
      "Main reference original baseline clock is unavailable or mismatched.");
    const request = validateMainReferenceRequest({ profile: MAIN_REFERENCE_PROFILE, nonce: randomBytes(32).toString("hex"), operationId,
      closedPlanSha256: journal.closedPlanSha256, baselineCopyReceiptSha256: copy.receiptSha256, baselineLogicalSha256: inventory.logicalSha256,
      baselineClosureClockSha256: sha256Json(baselineClock), nativePinsSha256: journal.plan.nativePinsSha256, historyUuid: baseline.historyUuid,
      createdAtLiteral: baseline.createdAtLiteral, referenceUtcMs: Number((BigInt(baselineClock.clock.after.utcBeforeTicks) - 621_355_968_000_000_000n) / 10_000n) });
    const invocation = await compileMainReferenceTransportV3(request); await current();
    const directory = operationPath(operationId).slice(0, -5), resultPath = join(directory, "10-baseline-main-reference-result.json");
    const beforeIntent = await loadClosedSymbolJournal(operationId); unchanged();
    need(canonicalJson(beforeIntent.journal) === callerText, "Main reference journal advanced before intent.");
    // Exclusive publication prevents new engine/restart from replaying an
    // Ambiguous creation/launch. No journal sequence or artifact array is edited.
    const intentArtifact = Object.freeze(await writePhaseArtifact(operationId, 10, "baseline-main-reference-intent", {
      profile: "private.main-reference-intent.v3", request, resultPath, commandSha256: invocation.commandSha256, mainSha256: invocation.mainSha256,
      sourcePins: invocation.sourcePins, runtimePinsSha256: invocation.runtimePinsSha256, baselineClock,
      helperIdentity: invocation.helperIdentity, stdinProfile: invocation.stdinProfile, stdinSha256: invocation.stdinSha256,
      windowsSideEffects: "one disjoint nonce scratch copy and one owned synthetic Job; no EasyEDA app/profile input", executionAuthorized: false,
    }));
    await current(); await readExactUtf8Artifact(intentArtifact); await current();
    const beforeDispatch = await loadClosedSymbolJournal(operationId); unchanged(); assertCurrentClosedSessionCopyAuthority(proof);
    need(canonicalJson(beforeDispatch.journal) === callerText, "Main reference journal advanced before dispatch.");
    const returned = await invokeMainReferenceTransport(invocation);
    this.returns.set(operationId, returned);
    const returnedText = canonicalJson(returned);
    // Preserve actual settled output even if the caller changed during await.
    // The v2 envelope preserves transport closure, guard completeness and
    // Containment separately from any native Job qualification.
    const retainedResult = retainMainReferenceTransportV2(returned, invocation.requestSha256, intentArtifact.sha256);
    const resultArtifact = Object.freeze(await writePhaseArtifact(operationId, 10, "baseline-main-reference-result", retainedResult));
    need(canonicalJson(returned) === returnedText, "Main reference settled reply changed."); await current();
    need(resultArtifact.path === resultPath && resultArtifact.bytes <= 196_608 && returned.transportFailure === null &&
      returned.rawStdoutBase64 === Buffer.from(returned.stdout).toString("base64") && returned.rawStderrBase64 === Buffer.from(returned.stderr).toString("base64") &&
      returned.exitCode === 0 && returned.signal === null && !returned.timedOut && returned.stderr === "",
      "Main reference transport failed or is ambiguous; never retry it.");
    const retainedText = successfulRetainedMainReferenceText(retainedResult, invocation.requestSha256, intentArtifact.sha256);
    need(retainedText.text === returned.stdout, "Main reference retained transport text differs.");
    const parsed: unknown = JSON.parse(retainedText.text);
    const observation = validateMainReferenceTransportV3Result(parsed, invocation);
    const after = observation["nativeAfter"], before = observation["nativeBefore"];
    need(isRecord(before) && isRecord(after) && before["zoneRulesSha256"] === baselineClock.clock.after.zoneRulesSha256 &&
      after["zoneRulesSha256"] === baselineClock.clock.after.zoneRulesSha256 && before["localOffsetMinutes"] === baselineClock.clock.after.localOffsetMinutes &&
      after["localOffsetMinutes"] === baselineClock.clock.after.localOffsetMinutes && before["qpcFrequency"] === baselineClock.clock.after.qpcFrequency &&
      after["qpcFrequency"] === baselineClock.clock.after.qpcFrequency && BigInt(String(before["qpcBefore"])) >= BigInt(baselineClock.clock.after.qpcAfter) &&
      BigInt(String(before["utcBeforeTicks"])) >= BigInt(baselineClock.clock.after.utcAfterTicks), "Main reference OS clock construction differs from baseline closure.");
    await readExactUtf8Artifact(resultArtifact); await current(); await readExactUtf8Artifact(intentArtifact); await current();
    need(await assertIssuedWindowsClockObservation(baselineClock) === baselineClock, "Main reference clock issuer changed."); await current();
    const final = await loadClosedSymbolJournal(operationId); unchanged(); assertCurrentClosedSessionCopyAuthority(proof);
    need(canonicalJson(final.journal) === callerText && canonicalJson(returned) === returnedText, "Main reference durable journal or settled reply changed.");
    const result: OriginalMainReference = Object.freeze({ profile: "private.original-main-reference.v1", operationId, request, observation, intentArtifact, resultArtifact,
      baselineCopyReceiptSha256: copy.receiptSha256, baselineLogicalSha256: inventory.logicalSha256, operationSha256: sha256Json(journal.plan.operation),
      appClockDirectlyObserved: false, executionAuthorized: false });
    originals.set(result, { engine: this.engine, operationId, text: canonicalJson(result), result }); return result;
  }
}
