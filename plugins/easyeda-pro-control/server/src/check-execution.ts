/* oxlint-disable import/max-dependencies -- This coordinator composes the existing journal, runtime, checkpoint and native report proof boundaries. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, createOperation, listOperationStates, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, newOperationId, sha256Json, validateExpectedFingerprint, validatePrivateFingerprint } from "./core.ts";
import type { DispatchOperationJournal, EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { EXACT_READ_ENVELOPE_MAX_BYTES, EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { buildNativePcbDrcReadExpression, buildNativeRuleSnapshotReadExpression, buildNativeSchematicErcReadExpression, nativeRuleCheckBindingSchema, nativeRuleCheckEvidenceSchema, nativeRuleCheckRequestSchema, nativeRuleSnapshotSchema, verifyNativeRuleReport } from "./native-rule-report.ts";
import type { NativeRuleCheckBinding, NativeRuleReport, NativeRuleSnapshot } from "./native-rule-report.ts";
import { verifyNativeRuleReportProfile } from "./native-rule-profile.ts";
import { wrapWithContextGuard } from "./runtime-scripts.ts";
import { prepareRecoveryNavigation } from "./recovery-navigation.ts";
import { assertFacadeOnlyRuntimeUpgrade } from "./design-execution.ts";
import { transactionError } from "./transaction-error.ts";

type Value = Record<string, unknown>;
type Kind = "pcb-drc" | "schematic-erc";
const PROFILE = "easyeda-pro-control.rule-check-transaction.v1";
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const checkpointSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), source: z.string().min(1), checkpoint: z.string().min(1),
  receiptPath: z.string().min(1), checkpointSha256: hash, checkpointDumpSha256: hash }).catchall(z.unknown());
type Checkpoint = z.infer<typeof checkpointSchema>;
const verificationSchema = z.object({ ok: z.literal(true), sourceMatchesReceipt: z.literal(true), checkpointMatchesReceipt: z.literal(true),
  sourceEqualsCheckpoint: z.literal(true), sourceChanged: z.literal(false), checkpointSha256: hash, checkpointDumpSha256: hash,
  sourceSha256: hash, sourceDumpSha256: hash, checkpoint: z.string().min(1), source: z.string().min(1), receiptPath: z.string().min(1) }).catchall(z.unknown());

export interface RuleCheckInput { readonly kind: Kind; readonly expectedContext: ExpectedContext; readonly expectedFingerprint: Value; readonly maxInlineItems?: number }
interface CheckPlan extends Value { profile: typeof PROFILE; check: { kind: Kind }; expectedContext: ExpectedContext; expectedFingerprint: Value; maxInlineItems: number }
interface CheckJournal extends DispatchOperationJournal { plan: CheckPlan; preCheckpoint: Checkpoint; baseline?: NativeRuleSnapshot;
  calculationDispatched: boolean; runtimeFingerprint?: Value; result?: Value }

export type RuleCheckEngine = Pick<EasyedaControlEngine, "assertContext" | "checkpoint" | "dispatchWithOrphanTracking" | "assertRecoveryOperationIsolated" |
  "ensureRuntimeRestartChallenge" | "recoverDispatchAuthority"> & {
  readonly executionAuthorityValidator: unknown;
  readonly status: () => Promise<{ stableFingerprint: Value }>;
  readonly upstream: { readonly installedEasyedaBundles?: () => Promise<{ assetsRoot: string }> };
};
const dependencies = { createOperation, listOperations: listOperationStates, loadOperation, updateOperation, writePhaseArtifact, verifyProfile: verifyNativeRuleReportProfile };
export type RuleCheckDependencies = Partial<typeof dependencies>;

function binding(context: ExpectedContext): NativeRuleCheckBinding {
  return nativeRuleCheckBindingSchema.parse({ projectUuid: context.project.uuid ?? context.project.projectUuid,
    documentUuid: context.document.uuid ?? context.document.documentUuid, tabId: context.document.tabId });
}
export function ruleSnapshotHash(snapshot: NativeRuleSnapshot): string {
  const parsed = nativeRuleSnapshotSchema.parse(snapshot);
  return sha256Json({ ...parsed, document: { projectUuid: parsed.document.projectUuid, documentUuid: parsed.document.documentUuid } });
}
export function assertRuleCheckDatabaseUnchanged(input: unknown, checkpoint: Checkpoint): Value {
  const result = verificationSchema.parse(input);
  if (result.checkpoint !== checkpoint.checkpoint || result.receiptPath !== checkpoint.receiptPath || result.source !== checkpoint.source ||
      result.checkpointSha256 !== checkpoint.checkpointSha256 || result.checkpointDumpSha256 !== checkpoint.checkpointDumpSha256 ||
      result.sourceDumpSha256 !== checkpoint.checkpointDumpSha256) { throw new Error("Rule check changed or lost its complete SQLite baseline."); }
  return result;
}
export function boundedRuleReport(report: NativeRuleReport, maximumItems: number): Value {
  z.number().int().min(0).max(200).parse(maximumItems);
  const items: NativeRuleReport["items"] = [];
  let bytes = 0;
  for (const item of report.items.slice(0, maximumItems)) {
    const size = Buffer.byteLength(JSON.stringify(item));
    if (bytes + size > 131_072) { break; }
    bytes += size; items.push(item);
  }
  return { profile: report.profile, kind: report.kind, document: report.document, counts: report.counts, zeroReportedViolations: report.zeroReportedViolations,
    scope: report.scope, limitations: report.limitations, itemCount: report.items.length, items, itemsOmitted: report.items.length - items.length };
}

/** Only fixed package builders may supply expression. This helper is not exposed
 * through MCP and cannot select an API method from caller input.
 */
function envelopeCode(expression: string, context: ExpectedContext): string {
  return wrapWithContextGuard(`const payload=await ${expression};
const json=JSON.stringify(payload,(_key,value)=>{if(value===null||typeof value==='string'||typeof value==='boolean'||(typeof value==='number'&&Number.isFinite(value))||(typeof value==='object'&&(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)))return value;throw new Error('RULE_TRANSPORT_NON_JSON');});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${EXACT_READ_ENVELOPE_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${EXACT_READ_ENVELOPE_MAX_BYTES})throw new Error('RULE_TRANSPORT_LIMIT');return envelope;`, context);
}
function summary(journal: CheckJournal): Value {
  return { operationId: journal.operationId, profile: PROFILE, kind: journal.plan.check.kind, state: journal.state, saved: false, reopened: false,
    hardStop: journal.hardStop, orphanedCallPossible: journal.orphanedCallPossible, mutationMayHaveOccurred: journal.mutationMayHaveOccurred,
    report: journal.result?.["report"] ?? null, proof: journal.result?.["proof"] ?? null, reportArtifact: journal.result?.["reportArtifact"] ?? null,
    nextSafeAction: journal.nextSafeAction, journalPath: journal.journalPath, artifacts: journal.artifacts };
}
function isJournal(value: unknown): value is CheckJournal {
  return isRecord(value) && isRecord(value["plan"]) && value["plan"]["profile"] === PROFILE && isRecord(value["plan"]["check"]) &&
    isRecord(value["plan"]["expectedContext"]) && isRecord(value["plan"]["expectedFingerprint"]) && typeof value["plan"]["maxInlineItems"] === "number" &&
    typeof value["operationId"] === "string" && typeof value["planHash"] === "string" && typeof value["journalPath"] === "string" &&
    typeof value["state"] === "string" && typeof value["mutationState"] === "string" && typeof value["saved"] === "boolean" &&
    typeof value["reopened"] === "boolean" && typeof value["orphanedCallPossible"] === "boolean" && typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" && typeof value["nextSafeAction"] === "string" && typeof value["updatedAt"] === "string" &&
    typeof value["sequence"] === "number" && typeof value["calculationDispatched"] === "boolean" && isRecord(value["context"]) &&
    checkpointSchema.safeParse(value["preCheckpoint"]).success && Array.isArray(value["artifacts"]);
}

export class RuleCheckExecutor {
  private readonly engine: RuleCheckEngine;
  private readonly services: typeof dependencies;
  public constructor(engine: RuleCheckEngine, overrides: RuleCheckDependencies = {}) { this.engine = engine; this.services = { ...dependencies, ...overrides }; }
  private async load(operationId: string): Promise<CheckJournal> {
    const journal = await this.services.loadOperation(operationId);
    if (!isJournal(journal)) { throw new Error("Not a valid rule-check transaction journal."); }
    nativeRuleCheckRequestSchema.parse(journal.plan.check);
    validateExpectedFingerprint(journal.plan.expectedFingerprint);
    if (journal.runtimeFingerprint !== undefined) { validateExpectedFingerprint(journal.runtimeFingerprint); }
    if (journal.baseline !== undefined) { nativeRuleSnapshotSchema.parse(journal.baseline); }
    return journal;
  }
  private async record(journal: CheckJournal, phase: string, value: unknown): Promise<ArtifactDescriptor> {
    journal.sequence += 1;
    const artifact = await this.services.writePhaseArtifact(journal.operationId, journal.sequence, phase, value);
    journal.artifacts.push(artifact); journal.updatedAt = new Date().toISOString();
    await this.services.updateOperation(journal); return artifact;
  }
  private async runtime(plan: CheckPlan, context: ExpectedContext, fingerprint = plan.expectedFingerprint): Promise<void> {
    validatePrivateFingerprint(fingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, fingerprint, "Rule-check runtime");
    await this.engine.assertContext(structuredClone(context));
    const installed = await this.engine.upstream.installedEasyedaBundles?.();
    if (installed === undefined) { throw new Error("Rule-check installed implementation is unavailable."); }
    await this.services.verifyProfile(installed.assetsRoot, plan.check.kind);
  }
  private async unchanged(journal: CheckJournal): Promise<Value> {
    return assertRuleCheckDatabaseUnchanged(await this.engine.checkpoint({ receiptPath: journal.preCheckpoint.receiptPath }), journal.preCheckpoint);
  }
  private async dispatch(journal: CheckJournal, phase: string, expression: string): Promise<unknown> {
    await this.runtime(journal.plan, journal.context, journal.runtimeFingerprint ?? journal.plan.expectedFingerprint);
    journal.state = `${phase}-dispatching`; journal.hardStop = true;
    await this.services.updateOperation(journal);
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute",
      { code: envelopeCode(expression, journal.context), timeoutMs: 60_000, confirmWrite: true }, 70_000);
    const payload = decodeExactReadEnvelope(extractToolPayload(raw));
    await this.record(journal, `${phase}-return`, payload); return payload;
  }
  private async snapshot(journal: CheckJournal, phase: string): Promise<NativeRuleSnapshot> {
    const expected = binding(journal.context);
    const snapshot = nativeRuleSnapshotSchema.parse(await this.dispatch(journal, phase, buildNativeRuleSnapshotReadExpression(journal.plan.check.kind, expected)));
    if (snapshot.kind !== journal.plan.check.kind || canonicalJson(snapshot.document) !== canonicalJson(expected)) { throw new Error("Rule-check snapshot belongs to another target."); }
    return snapshot;
  }
  public async run(request: RuleCheckInput): Promise<Value> {
    const input = structuredClone(request);
    const check = nativeRuleCheckRequestSchema.parse({ kind: input.kind });
    const maximumItems = z.number().int().min(0).max(200).parse(input.maxInlineItems ?? 100);
    const operations = await this.services.listOperations();
    if (operations.some((journal) => !isTerminalOperation(journal))) { throw new Error("Resolve the incomplete operation before running a native check."); }
    if (this.engine.executionAuthorityValidator === undefined || this.engine.executionAuthorityValidator === null) { throw new Error("Native checks require retained runtime authority."); }
    if (input.expectedContext.document.documentType !== (check.kind === "pcb-drc" ? 3 : 1)) { throw new Error("Native check requires the exact matching active editor."); }
    const plan: CheckPlan = { profile: PROFILE, check, expectedContext: structuredClone(input.expectedContext), expectedFingerprint: structuredClone(input.expectedFingerprint), maxInlineItems: maximumItems };
    await this.runtime(plan, plan.expectedContext);
    const expectedContext = structuredClone(plan.expectedContext);
    const context = structuredClone(await this.engine.assertContext(expectedContext));
    const checkpointDirectory = join(controlDataDirectory(), "checkpoints");
    const checkpoint = checkpointSchema.parse(await this.engine.checkpoint({ source: context.project.path, outputDir: checkpointDirectory, label: "rule-check-before" }));
    const operationId = newOperationId();
    const journal: CheckJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), planHash: buildPlanHash(plan), plan,
      state: "planned", mutationState: "before", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
      calculationDispatched: false, nextSafeAction: "Run the one journaled native check; never retry an uncertain calculation.", context, preCheckpoint: checkpoint,
      sequence: 0, artifacts: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.services.createOperation(journal);
    try {
      journal.baseline = await this.snapshot(journal, "check-baseline");
      await this.record(journal, "calculation-scope-baseline", journal.baseline);
      await this.unchanged(journal);
      journal.calculationDispatched = true; journal.mutationMayHaveOccurred = true;
      await this.services.updateOperation(journal);
      const expected = binding(context);
      const expression = check.kind === "pcb-drc" ? buildNativePcbDrcReadExpression(expected) : buildNativeSchematicErcReadExpression(expected);
      const evidence = nativeRuleCheckEvidenceSchema.parse(await this.dispatch(journal, "native-check", expression));
      const report = verifyNativeRuleReport(evidence, expected);
      if (report.kind !== check.kind || evidence.sourceBefore !== journal.baseline.source ||
          canonicalJson(evidence.policyBefore) !== canonicalJson(journal.baseline.policy)) { throw new Error("Native calculation did not use the journaled source and policy baseline."); }
      const after = await this.snapshot(journal, "check-after");
      if (ruleSnapshotHash(after) !== ruleSnapshotHash(journal.baseline)) { throw new Error("Native check changed its full live calculation scope."); }
      const database = await this.unchanged(journal);
      const final = checkpointSchema.parse(await this.engine.checkpoint({ source: context.project.path, outputDir: checkpointDirectory, label: "rule-check-after" }));
      if (final.source !== checkpoint.source || final.checkpointDumpSha256 !== checkpoint.checkpointDumpSha256) { throw new Error("Native check changed the complete saved SQLite project."); }
      await this.runtime(plan, context);
      await this.unchanged(journal);
      journal.finalCheckpoint = final;
      const reportArtifact = await this.record(journal, "itemized-report", report);
      journal.result = { report: boundedRuleReport(report, maximumItems), reportArtifact, proof: { durableDatabaseUnchanged: true,
        databaseScope: "complete-sqlite-logical-dump", databaseDumpSha256: final.checkpointDumpSha256,
        calculationScopeSha256: ruleSnapshotHash(after), checkpointVerification: database, saved: false, reopened: false } };
      journal.state = "completed"; journal.hardStop = false; journal.mutationMayHaveOccurred = false;
      journal.nextSafeAction = "Review every reported item and the recorded enabled-rule policy. No design save was called; this is not fabrication approval.";
      await this.record(journal, "check-verified", journal.result); return summary(journal);
    } catch (error) {
      journal.state = journal.orphanedCallPossible ? "check-outcome-unknown" : "check-needs-review"; journal.hardStop = true;
      journal.nextSafeAction = "Inspect the check journal. Recover retained execution authority if required, then reconcile without rerunning the check or saving.";
      await this.services.updateOperation(journal); throw transactionError(error, journal);
    }
  }
  public async inspect(operationId: string): Promise<Value> { return summary(await this.load(operationId)); }
  public async recoverAuthority(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    const confirmation = journal.orphanedCallPossible ? await this.engine.ensureRuntimeRestartChallenge(journal) : undefined;
    await this.engine.recoverDispatchAuthority(journal, confirmation, async () => {
      const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
      validatePrivateFingerprint(fingerprint);
      const status = await this.engine.status();
      assertSubset(status.stableFingerprint, fingerprint, "Check recovery runtime");
    });
    journal.state = "check-authority-recovered"; journal.hardStop = true;
    journal.nextSafeAction = "Open the exact existing target if needed, then reconcile the retained calculation scope and complete SQLite baseline.";
    await this.services.updateOperation(journal); return summary(journal);
  }
  public async rebindRuntime(operationId: string, expectedFingerprint: Value): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal) || journal.orphanedCallPossible) { throw new Error("Only a non-orphan incomplete check can rebind its facade."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    validatePrivateFingerprint(expectedFingerprint);
    const status = await this.engine.status();
    const current = status.stableFingerprint;
    assertSubset(current, expectedFingerprint, "Requested check replacement runtime");
    assertFacadeOnlyRuntimeUpgrade(journal.plan.expectedFingerprint, current);
    journal.runtimeFingerprint = structuredClone(current); journal.state = "check-runtime-rebound"; journal.hardStop = true;
    await this.record(journal, "runtime-rebound", { fingerprint: current, originalPlanHash: journal.planHash }); return summary(journal);
  }
  public async openTarget(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal) || journal.orphanedCallPossible) { throw new Error("Check navigation requires a non-orphan incomplete check."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    const fingerprint = journal.runtimeFingerprint ?? journal.plan.expectedFingerprint;
    validatePrivateFingerprint(fingerprint);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, fingerprint, "Check navigation runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    if (bundles === undefined) { throw new Error("Native installation profile is missing."); }
    const prepared = await prepareRecoveryNavigation({ expectedContext: journal.plan.expectedContext, preCheckpoint: journal.preCheckpoint, assetsRoot: bundles.assetsRoot });
    journal.state = "check-target-opening"; journal.hardStop = true; await this.services.updateOperation(journal);
    const result = await this.engine.dispatchWithOrphanTracking(journal, "check-open-target", "easyeda_execute", { code: prepared.code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    await this.record(journal, "target-open-return", extractToolPayload(result));
    journal.context = structuredClone(await this.engine.assertContext(structuredClone(journal.plan.expectedContext), { allowTabChange: true }));
    journal.state = "check-target-opened-needs-reconciliation"; await this.services.updateOperation(journal); return summary(journal);
  }
  public async reconcileNoMutation(operationId: string): Promise<Value> {
    const journal = await this.load(operationId);
    if (isTerminalOperation(journal)) { return summary(journal); }
    if (journal.orphanedCallPossible) { throw new Error("Recover retained execution authority before checking current state."); }
    await this.engine.assertRecoveryOperationIsolated(operationId);
    journal.context = structuredClone(await this.engine.assertContext(structuredClone(journal.context), { allowTabChange: true }));
    await this.runtime(journal.plan, journal.context, journal.runtimeFingerprint ?? journal.plan.expectedFingerprint);
    if (journal.baseline === undefined && journal.calculationDispatched) { throw new Error("Calculation baseline is missing; no automatic reconciliation is possible."); }
    if (journal.baseline !== undefined && ruleSnapshotHash(await this.snapshot(journal, "check-reconcile-snapshot")) !== ruleSnapshotHash(journal.baseline)) { throw new Error("Rule-check calculation scope differs from its retained baseline."); }
    const database = await this.unchanged(journal);
    journal.state = "reconciled-no-mutation"; journal.hardStop = false; journal.mutationMayHaveOccurred = false;
    journal.nextSafeAction = "No calculation was repeated or result inferred. Recorded source scope and the saved database are unchanged; review the earlier failure.";
    await this.record(journal, "reconciled-no-mutation", { database, calculationWasDispatched: journal.calculationDispatched, baselineAvailable: journal.baseline !== undefined });
    return summary(journal);
  }
}
