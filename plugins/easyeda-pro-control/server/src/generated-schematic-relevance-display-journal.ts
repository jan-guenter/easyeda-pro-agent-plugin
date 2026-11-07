/** Distinct original Relevance schematic display publication and once-only mutation/Save intent.
 * Journal JSON is evidence only; it cannot recreate an owner or dispatch. */
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { assertOperationIdUnused, createOperation, ensureOperationStorage, loadOperation, operationPath, verifyExactManagedArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, sha256Json } from "./core.ts";
import type { TrackedDispatchOperationJournal } from "./engine.ts";
import { GeneratedFixtureJournalPublication } from "./generated-fixture-journal-publication.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "./generated-fixture-journal-publication.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "./generated-schematic-relevance-display.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES = ["baseline", "allocation", "launch", "main", "opening", "capture", "preflight", "modify", "observe", "effect", "clock", "save",
  "close", "exit", "closed-sql", "qualify", "release", "reopen", "reopened-effect", "reopen-close", "reopen-exit", "reopened-sql", "complete"] as const;
export type GeneratedSchematicRelevanceDisplayJournalStage = typeof GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES[number];
type Kind = "operation-intent" | "failure" | "no-allocation" | "abort-intent" | "abort-result" | "termination-intent" | "termination-result" | "release-intent" | "release-result" |
  `${GeneratedSchematicRelevanceDisplayJournalStage}-${"intent" | "result"}`;
const kinds = new Set<string>(["operation-intent", "failure", "no-allocation", "abort-intent", "abort-result", "termination-intent", "termination-result", "release-intent", "release-result",
  ...GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES.flatMap(stage => [`${stage}-intent`, `${stage}-result`])]);
const digest = z.string().regex(/^[a-f0-9]{64}$/u), profile = "private.generated-schematic-relevance-display-journal.v1";
const entrySchema = z.strictObject({ schema: z.literal("easyeda-pro-control.generated-schematic-relevance-display-record.v1"),
  operationId: z.string().min(30).max(80).regex(/^sch209-relevance-display-[a-z0-9][a-z0-9-]*$/u), sequence: z.number().int().min(1).max(64), previousSha256: digest.nullable(),
  kind: z.custom<Kind>((value): value is Kind => typeof value === "string" && kinds.has(value)), evidence: z.record(z.string(), z.unknown()), inverseAvailable: z.literal(false),
}).refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= 65_536);
type Entry = z.infer<typeof entrySchema>;
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_RELEVANCE_DISPLAY_JOURNAL_${reason}`); } }
function terminal(kind: Kind | undefined): boolean { return kind === "complete-result" || kind === "no-allocation"; }
function manifestCore(value: Readonly<Record<string, unknown>>): string {
  const { journalSha256: _hash, integrityModel: _model, ...body } = value; return canonicalJson(body);
}

/** The persisted chain validates sequencing only. Actual effect, native exit,
 * complete SQL and reopen tokens are independently checked by the coordinator. */
export function assertGeneratedSchematicRelevanceDisplayJournalChain(input: unknown): readonly Entry[] {
  const records = z.array(entrySchema).max(64).parse(input); let pending: string | null = null, previous: Entry | null = null;
  let failed = false, next = 0; const seen = new Set<string>();
  for (const [index, entry] of records.entries()) {
    need(entry.sequence === index + 1 && entry.previousSha256 === (previous === null ? null : sha256Json(previous)) && !seen.has(entry.kind) &&
      !terminal(previous?.kind) && (previous === null || previous.operationId === entry.operationId), "CHAIN");
    if (index === 0) { need(entry.kind === "operation-intent", "FIRST"); }
    else if (entry.kind === "failure") { need(!failed, "DUPLICATE_FAILURE"); failed = true; }
    else if (entry.kind === "no-allocation") { need(failed && !seen.has("allocation-intent") && entry.evidence["allocationNeverEntered"] === true, "NO_ALLOCATION"); }
    else if (failed) {
      need(["abort-intent", "abort-result", "termination-intent", "termination-result", "release-intent", "release-result"].includes(entry.kind), "NORMAL_AFTER_FAILURE");
      if (entry.kind.endsWith("-result")) { need(seen.has(entry.kind.replace(/-result$/u, "-intent")), "CLEANUP_INTENT"); }
      if (entry.kind === "termination-result") { need(entry.evidence["rootExited"] === true && entry.evidence["jobEmpty"] === true, "ORIGINAL_EXIT"); }
      if (entry.kind === "release-intent") { need(seen.has("termination-result"), "EXIT_BEFORE_RELEASE"); }
      if (entry.kind === "release-result") { need(entry.evidence["released"] === true, "ORIGINAL_RELEASE"); }
    } else {
      const stage = GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES[next]; need(stage !== undefined, "STAGE_BOUND");
      if (entry.kind.endsWith("-intent")) { need(pending === null && entry.kind === `${stage}-intent`, "INTENT_ORDER"); pending = stage; }
      else { need(pending === stage && entry.kind === `${stage}-result`, "RESULT_ORDER"); pending = null; next += 1; }
      if (entry.kind === "modify-result" || entry.kind === "save-result") {
        const result = generatedSchematicRelevanceDisplayStageResultSchema.parse(entry.evidence); need(result.ok && result.stage === entry.kind.slice(0, -7), "STAGE_ACK");
      }
      if (entry.kind === "complete-result") { z.strictObject({ saved: z.literal(true), reopened: z.literal(true), completeSqlVerified: z.literal(true),
        completePeerRosterPreserved: z.literal(true), inverseAvailable: z.literal(false) }).parse(entry.evidence); }
    }
    seen.add(entry.kind); previous = entry;
  }
  return records;
}

export interface GeneratedSchematicRelevanceDisplayDispatch { readonly profile: "private.generated-schematic-relevance-display-dispatch.v1" }
interface Dispatch { readonly journal: GeneratedSchematicRelevanceDisplayJournal; readonly owner: object; readonly argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly stage: "modify" | "save"; readonly sequence: number; consumed: boolean; enrolled: boolean }
const dispatches = new WeakMap<GeneratedSchematicRelevanceDisplayDispatch, Dispatch>();
/** The actual native owner consumes this token synchronously before its first
 * await. A lost acknowledgement cannot mint another token or repeat the stage. */
export function consumeGeneratedSchematicRelevanceDisplayDispatch(token: GeneratedSchematicRelevanceDisplayDispatch, stage: "modify" | "save", owner: object,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): Readonly<{ assertPublished: () => Promise<void> }> {
  const original = dispatches.get(token);
  need(original !== undefined && !original.consumed && original.stage === stage && original.owner === owner && original.argumentsValue === argumentsValue, "ORIGINAL_DISPATCH");
  original.journal.requireDispatchIntent(stage, original.sequence); original.consumed = true;
  return Object.freeze({ assertPublished: (): Promise<void> => original.journal.assertDispatchPublished(stage, original.sequence) });
}

export interface GeneratedSchematicRelevanceDisplayModifyEnrollment {
  readonly assertCurrent: () => void;
  readonly assertBeforeAttempt: () => void;
  readonly assertOriginalAttempted: () => void;
  readonly assertPublished: () => Promise<void>;
}
/** Preserve the published original modify intent through prospective setup.
 * Enrollment never consumes, refunds or replaces the actual dispatch. */
export function enrollGeneratedSchematicRelevanceDisplayModifyIntent(token: GeneratedSchematicRelevanceDisplayDispatch, owner: object,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): GeneratedSchematicRelevanceDisplayModifyEnrollment {
  const original = dispatches.get(token);
  need(original !== undefined && original.stage === "modify" && original.owner === owner && original.argumentsValue === argumentsValue && !original.consumed && !original.enrolled, "ORIGINAL_MODIFY_ENROLLMENT");
  original.journal.requireDispatchIntent("modify", original.sequence); original.enrolled = true;
  const current = (): void => { need(dispatches.get(token) === original && original.enrolled, "ORIGINAL_MODIFY_ENROLLMENT"); original.journal.requireRetainedDispatchIntent("modify", original.sequence); };
  return Object.freeze({ assertCurrent: current,
    assertBeforeAttempt: (): void => { current(); need(!original.consumed, "MODIFY_BEFORE_ATTEMPT"); original.journal.requireDispatchIntent("modify", original.sequence); },
    assertOriginalAttempted: (): void => { current(); need(original.consumed, "MODIFY_ORIGINAL_ATTEMPT_REQUIRED"); },
    assertPublished: async (): Promise<void> => { current(); await original.journal.assertDispatchPublished("modify", original.sequence); current(); } });
}

/** Same structural enrollment contract, with a distinct original Save-stage
 * registry lookup. An enrolled Modify intent cannot satisfy this function. */
export type GeneratedSchematicRelevanceDisplaySaveEnrollment = GeneratedSchematicRelevanceDisplayModifyEnrollment;
export function enrollGeneratedSchematicRelevanceDisplaySaveIntent(token: GeneratedSchematicRelevanceDisplayDispatch, owner: object,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): GeneratedSchematicRelevanceDisplaySaveEnrollment {
  const original = dispatches.get(token);
  need(original !== undefined && original.stage === "save" && original.owner === owner && original.argumentsValue === argumentsValue && !original.consumed && !original.enrolled, "ORIGINAL_SAVE_ENROLLMENT");
  original.journal.requireDispatchIntent("save", original.sequence); original.enrolled = true;
  const current = (): void => { need(dispatches.get(token) === original && original.enrolled, "ORIGINAL_SAVE_ENROLLMENT"); original.journal.requireRetainedDispatchIntent("save", original.sequence); };
  return Object.freeze({ assertCurrent: current,
    assertBeforeAttempt: (): void => { current(); need(!original.consumed, "SAVE_BEFORE_ATTEMPT"); original.journal.requireDispatchIntent("save", original.sequence); },
    assertOriginalAttempted: (): void => { current(); need(original.consumed, "SAVE_ORIGINAL_ATTEMPT_REQUIRED"); },
    assertPublished: async (): Promise<void> => { current(); await original.journal.assertDispatchPublished("save", original.sequence); current(); } });
}

/** One original retained journal. Publication settlement joins its immutable
 * pending candidate and same marker; it performs no native dispatch itself. */
export class GeneratedSchematicRelevanceDisplayJournal {
  readonly #arguments: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint;
  readonly #operation: TrackedDispatchOperationJournal; readonly #publication: GeneratedFixtureJournalPublication;
  readonly #tokens = new Map<"modify" | "save", GeneratedSchematicRelevanceDisplayDispatch>();
  #reserveAttempted = false; #creationEntered = false; #created = false; #reserved = false; #busy = false; #owner: object | null = null;
  public constructor(argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments, prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint,
    dependencies: GeneratedFixtureJournalPublicationDependencies = {}) {
    requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(argumentsValue, prepared); this.#arguments = argumentsValue; this.#prepared = prepared;
    const plan = freezeDeep({ profile, arguments: argumentsValue, checkpoint: prepared.preparationCheckpoint, nonce: randomBytes(32).toString("hex") }), time = new Date().toISOString();
    this.#operation = { schema: OPERATION_SCHEMA, operationId: argumentsValue.operation.operationId, journalPath: operationPath(argumentsValue.operation.operationId), plan, planHash: buildPlanHash(plan),
      state: "prepared", mutationState: "schematic-display-intent", mutationMayHaveOccurred: false, hardStop: true, saved: false, reopened: false,
      orphanedCallPossible: false, createdAt: time, updatedAt: time, sequence: 0, records: [], artifacts: [],
      nextSafeAction: "Retain this original schematic writer through exact effect, one Save, closed SQL and reopen; never replay mutation or Save." };
    this.#publication = new GeneratedFixtureJournalPublication(this.#operation, (): void => { this.#current(); }, dependencies); Object.freeze(this);
  }
  #current(): void { requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(this.#arguments, this.#prepared); }
  #records(): readonly Entry[] {
    const records = assertGeneratedSchematicRelevanceDisplayJournalChain(this.#operation["records"]); need(records.length === this.#operation.sequence && records.every(record => record.operationId === this.#operation.operationId) &&
      records.length === this.#operation.artifacts.length, "MANIFEST"); return records;
  }
  public async reserve(): Promise<void> {
    need(!this.#reserveAttempted, "RESERVATION_CONSUMED"); this.#reserveAttempted = true;
    await this.#exclusive(async (): Promise<void> => {
      this.#current(); await ensureOperationStorage(); await assertOperationIdUnused(this.#operation.operationId); this.#current();
      this.#creationEntered = true; await createOperation(this.#operation); this.#created = true; await this.#append("operation-intent", { arguments: this.#arguments }); this.#reserved = true;
    });
  }
  public bindWriter(owner: object): void { this.#current(); need(this.#reserved && !this.#busy && this.#owner === null && !this.#publication.pending() && owner !== null && typeof owner === "object", "WRITER_BINDING"); this.#owner = owner; }
  async #assertCurrent(): Promise<void> {
    this.#current(); need(this.#created && !this.#publication.pending(), "PUBLICATION_PENDING"); const actual = await loadOperation(this.#operation.operationId); this.#current();
    need(canonicalJson(actual) === canonicalJson(this.#operation), "ORIGINAL_MANIFEST_CHANGED"); this.#records();
    for (const artifact of this.#operation.artifacts) { await verifyExactManagedArtifact(artifact); this.#current(); }
  }
  async #append(kind: Kind, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    const records = this.#records(); const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(entrySchema.parse({ schema: "easyeda-pro-control.generated-schematic-relevance-display-record.v1", operationId: this.#operation.operationId,
      sequence: records.length + 1, previousSha256, kind, evidence, inverseAvailable: false }));
    const next = [...records, entry]; assertGeneratedSchematicRelevanceDisplayJournalChain(next);
    await this.#publication.change({ records: next, state: terminal(kind) ? "completed" : "prepared", hardStop: !terminal(kind),
      ...(kind === "modify-intent" || kind === "save-intent" ? { mutationMayHaveOccurred: true, mutationState: `schematic-display-${kind}` } : {}),
      ...(kind === "complete-result" ? { saved: true, reopened: true, mutationState: "schematic-display-saved-reopened" } : {}) }, { phase: kind, value: entry });
  }
  public append(kind: Kind, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    return this.#exclusive(async (): Promise<void> => { need(this.#reserved, "ORIGINAL_RESERVATION"); await this.#assertCurrent(); await this.#append(kind, evidence); });
  }
  public async appendIntent(stage: "modify" | "save", evidence: Readonly<Record<string, unknown>>, owner: object): Promise<GeneratedSchematicRelevanceDisplayDispatch> {
    need(this.#owner === owner && !this.#busy && !this.#publication.pending() && !this.#tokens.has(stage), "ORIGINAL_WRITER_BINDING");
    const token: GeneratedSchematicRelevanceDisplayDispatch = Object.freeze({ profile: "private.generated-schematic-relevance-display-dispatch.v1" });
    const sequence = this.#records().length + 1; dispatches.set(token, { journal: this, owner, argumentsValue: this.#arguments, stage, sequence, consumed: false, enrolled: false }); this.#tokens.set(stage, token);
    await this.append(`${stage}-intent`, evidence); return this.retainedDispatchIntent(stage);
  }
  public retainedDispatchIntent(stage: "modify" | "save"): GeneratedSchematicRelevanceDisplayDispatch {
    const token = this.#tokens.get(stage); const original = token === undefined ? undefined : dispatches.get(token);
    need(token !== undefined && original !== undefined && !original.consumed, "ORIGINAL_DISPATCH"); this.requireDispatchIntent(stage, original.sequence); return token;
  }
  public requireDispatchIntent(stage: "modify" | "save", sequence: number): void {
    this.#current(); need(!this.#busy && this.#reserved && !this.#publication.pending(), "PUBLICATION_PENDING"); const last = this.#records().at(-1);
    need(last?.kind === `${stage}-intent` && last.sequence === sequence, "CURRENT_DISPATCH_INTENT");
  }
  public requireRetainedDispatchIntent(stage: "modify" | "save", sequence: number): void {
    this.#current(); need(!this.#busy && this.#reserved && !this.#publication.pending(), "PUBLICATION_PENDING");
    const record = this.#records()[sequence - 1]; need(record?.kind === `${stage}-intent` && record.sequence === sequence, "RETAINED_DISPATCH_INTENT");
  }
  public async assertDispatchPublished(stage: "modify" | "save", sequence: number): Promise<void> { this.requireDispatchIntent(stage, sequence); await this.#assertCurrent(); this.requireDispatchIntent(stage, sequence); }
  public async settlePublication(): Promise<void> {
    await this.#exclusive(async (): Promise<void> => {
      need(this.#creationEntered, "ORIGINAL_MANIFEST_REQUIRED");
      if (!this.#created) {
        const actual = await loadOperation(this.#operation.operationId); this.#current();
        need(manifestCore(actual) === manifestCore(this.#operation), "ORIGINAL_CREATION_CHANGED"); Object.assign(this.#operation, actual); this.#created = true;
      }
      await this.#publication.settle();
      if (this.#records().length === 0) { await this.#append("operation-intent", { arguments: this.#arguments }); } this.#reserved = true; await this.#assertCurrent(); });
  }
  async #exclusive(action: () => Promise<void>): Promise<void> { need(!this.#busy, "BUSY"); this.#busy = true; try { await action(); } finally { this.#busy = false; } }
  public retained(): Readonly<Record<string, unknown>> {
    return freezeDeep({ records: [...this.#records()], reserved: this.#reserved, publicationPending: this.#publication.pending(), busy: this.#busy,
      mutationMayHaveOccurred: this.#operation.mutationMayHaveOccurred, saved: this.#operation.saved, reopened: this.#operation.reopened, journalPath: this.#operation.journalPath });
  }
}
