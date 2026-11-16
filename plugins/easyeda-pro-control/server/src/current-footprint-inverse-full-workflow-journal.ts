/** Exact original publication only; parsing a history never resumes a native owner. */
import {dirname,join} from "node:path";
import {randomBytes} from "node:crypto";
import {z} from "zod";
import {assertOperationIdUnused,createOperation,createOperationScanner,ensureOperationStorage,loadOperation,operationPath,updateOperation,verifyExactManagedArtifact,writePhaseArtifact} from "./artifacts.ts";
import type {ArtifactDescriptor,OperationJournal} from "./artifacts.ts";
import {OPERATION_SCHEMA,buildPlanHash,canonicalJson,isRecord,sha256Json,sha256Text} from "./core.ts";
import type {UnknownRecord} from "./core.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_BUDGET as BUDGET,CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_PROFILE as PROFILE,
 assertCurrentFootprintInverseFullWorkflowChain,currentFootprintInverseFullWorkflowIdSchema,currentFootprintInverseFullWorkflowRecordSchema,currentFootprintInverseFullWorkflowRequestSchema} from "./current-footprint-inverse-full-workflow-contract.ts";
import type {CurrentFootprintInverseFullWorkflowRecord as Entry,CurrentFootprintInverseFullWorkflowRequest as Request} from "./current-footprint-inverse-full-workflow-contract.ts";

type Phase=Entry["kind"];
const MAX_RECORDS = BUDGET.records;
const BUDGET_SHA256 = sha256Json(BUDGET);
const TERMINAL = new Set<Phase>(["complete", "terminal-failure"]);
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`INVERSE_FULL_WORKFLOW_JOURNAL_${code}`); } }
function core(value: Readonly<UnknownRecord>): string {
  const { journalSha256: _hash, integrityModel: _model, ...fields } = value; return canonicalJson(fields);
}
const artifactSchema = z.object({
  path: z.string().max(BUDGET.artifactPathUnits),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f\d]{64}$/u),
}).strict();
const manifestSchema = z.object({
  operationId: currentFootprintInverseFullWorkflowIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: currentFootprintInverseFullWorkflowRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$/u), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(currentFootprintInverseFullWorkflowRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintInverseFullWorkflowChain(entries);
  need(entries.every(entry => entry.operationId === operation.operationId) && operation.artifacts.length === entries.length, "ARTIFACT_ROSTER");
  for (const [index, entry] of entries.entries()) {
    const text = `${JSON.stringify(entry)}\n`; const descriptor = operation.artifacts[index];
    need(descriptor !== undefined && descriptor.path === artifact(operation.operationId, entry).path && descriptor.sha256 === sha256Text(text) && descriptor.bytes === Buffer.byteLength(text), "ARTIFACT_BINDING");
  }
  const terminal = entries.at(-1); need(operation.state === (terminal !== undefined && TERMINAL.has(terminal.kind) ? "completed" : "prepared"), "TERMINAL_STATE");
  return entries;
}
function artifact(operationId: string, entry: Entry): ArtifactDescriptor {
  const text = `${JSON.stringify(entry)}\n`;
  return { path: join(dirname(operationPath(operationId)), operationId, `${String(entry.sequence).padStart(2, "0")}-${entry.kind}.json`), bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
}
/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintInverseFullWorkflowJournal {
  readonly #request: Request;
  #operation: OperationJournal;
  #reserved = false;
  #reserveAttempted = false;
  #reservationEntered = false;
  #reservationConflict = false;
  #writing = false;
  #publicationIdle: Promise<null> = Promise.resolve(null);
  #pending: Readonly<{ entry: Entry; descriptor: ArtifactDescriptor; next: OperationJournal }> | null = null;
  public constructor(request: Request) {
    this.#request = freezeDeep(currentFootprintInverseFullWorkflowRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#request.operationId);
    const plan = { profile: PROFILE, request: this.#request, nonce: randomBytes(32).toString("hex"), budgetSha256: BUDGET_SHA256 };
    this.#operation = { schema: OPERATION_SCHEMA, operationId: this.#request.operationId, plan, planHash: buildPlanHash(plan),
      state: "prepared", records: [], artifacts: [] };
    Object.freeze(this);
  }
  public async reserve(): Promise<void> {
    need(!this.#reserveAttempted, "RESERVATION_CONSUMED"); this.#reserveAttempted = true;
    await this.#exclusive(async () => {
      await ensureOperationStorage(); await assertOperationIdUnused(this.#request.operationId); this.#reservationEntered = true;
      try { await createOperation(this.#operation); }
      catch (error) {
        if (error instanceof Error && "code" in error && error.code === "EEXIST") { this.#reservationConflict = true; }
        throw error;
      }
      this.#reserved = true;
      this.#queue("operation-intent", { request: this.#request }); await this.#settlePending();
    });
  }
  /** Describe only this instance's original reservation attempt. A known
   * pre-create refusal or EEXIST conflict owns no managed journal. An unknown
   * create cannot be discarded or adopted and must settle its original bytes. */
  public reservationOutcome(): "not-entered" | "conflict" | "create-unknown" | "reserved" {
    need(!this.#writing, "PUBLICATION_BUSY");
    if (this.#reservationConflict) { return "conflict"; }
    if (!this.#reservationEntered) { return "not-entered"; }
    return this.#reserved ? "reserved" : "create-unknown";
  }
  public async assertCurrent(): Promise<void> {
    need(!this.#writing, "PUBLICATION_BUSY"); await this.#assertPublished(); need(!this.#writing, "PUBLICATION_BUSY");
  }
  async #assertPublished(): Promise<void> {
    need(this.#reserved && this.#pending === null, "PUBLICATION_PENDING");
    const actual = await loadOperation(this.#request.operationId);const records=parse(actual);need(core(actual)===core(this.#operation),"ORIGINAL_CHANGED");
    for(const entry of records){await verifyExactManagedArtifact(artifact(this.#request.operationId,entry));}
    const same=await loadOperation(this.#request.operationId);parse(same);need(core(same)===core(actual),"ORIGINAL_CHANGED");
  }
  public async append(kind: Phase, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async () => { await this.#assertPublished(); this.#queue(kind, evidence); await this.#settlePending(); });
  }
  #queue(kind: Phase, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "PUBLICATION_PENDING"); const records = parse(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(currentFootprintInverseFullWorkflowRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-inverse-flow-record.v1", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintInverseFullWorkflowChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
    const artifacts = this.#operation.artifacts ?? [];
    const next = { ...this.#operation, records: [...records, entry], artifacts: [...artifacts, descriptor], state: TERMINAL.has(kind) ? "completed" : "prepared" };
    parse(next);
    this.#pending = Object.freeze({ entry, descriptor, next });
  }
  public async settle(): Promise<void> {
    await this.#exclusive(() => this.#settlePending());
  }
  /** Join only the original publication active at invocation. This always
   * settles and issues no read, retry, publication or admission authority. */
  public async waitForCurrentPublication(): Promise<void> { await this.#publicationIdle; }
  async #exclusive(action: () => Promise<void>): Promise<void> {
    need(!this.#writing, "PUBLICATION_BUSY");
    const idle = Promise.withResolvers<null>(); this.#writing = true; this.#publicationIdle = idle.promise;
    try { await action(); } finally { this.#writing = false; idle.resolve(null); }
  }
  async #settlePending(): Promise<void> {
    need(this.#reserveAttempted && this.#reservationEntered && !this.#reservationConflict, "ORIGINAL_RESERVATION_REQUIRED");
    let actual = await loadOperation(this.#request.operationId);
    if (!this.#reserved) { need(core(actual) === core(this.#operation), "RESERVATION_CHANGED"); this.#reserved = true; }
    let pending = this.#pending;
    if (pending === null) {
      need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
      if (parse(this.#operation).length > 0) { return; }
      this.#queue("operation-intent", { request: this.#request }); pending = this.#pending;
    }
    need(pending !== null, "ORIGINAL_PENDING_REQUIRED");
    need(core(actual) === core(this.#operation) || core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    try { await verifyExactManagedArtifact(pending.descriptor); }
    catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) { throw error; }
      const written = await writePhaseArtifact(this.#request.operationId, pending.entry.sequence, pending.entry.kind, pending.entry);
      need(canonicalJson(written) === canonicalJson(pending.descriptor), "ARTIFACT_CHANGED");
    }
    if (core(actual) !== core(pending.next)) { await updateOperation(pending.next); }
    actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    this.#operation = pending.next; this.#pending = null;
  }
  public retained(): Readonly<{ records: readonly Entry[]; publicationPending: boolean; reserved: boolean }> {
    return Object.freeze({ records: Object.freeze([...parse(this.#operation)]), publicationPending: this.#pending !== null || this.#writing, reserved: this.#reserved });
  }
}

export async function readCurrentFootprintInverseFullWorkflowHistory(operationId:string):Promise<Readonly<{operation:OperationJournal;records:readonly Entry[]}>>{
 currentFootprintInverseFullWorkflowIdSchema.parse(operationId);
 const operation=await loadOperation(operationId),records=parse(operation);
 for(const entry of records){await verifyExactManagedArtifact(artifact(operationId,entry));}
 const same=await loadOperation(operationId);parse(same);need(core(same)===core(operation),"HISTORY_CHANGED");
 return freezeDeep({operation:same,records});
}
const scan=createOperationScanner((operation):string|undefined=>{
 const id=operation["operationId"],plan=operation["plan"];
 if(typeof id==="string"&&(id.startsWith("footprint-inverse-flow-")||isRecord(plan)&&plan["profile"]===PROFILE)){return id;}
 if(isRecord(plan)&&plan["profile"]===PROFILE){throw new Error("INVERSE_FULL_WORKFLOW_JOURNAL_MANIFEST");}
 return undefined;
});
export async function scanCurrentFootprintInverseFullWorkflowSummaries():Promise<readonly Readonly<{operationId:string;settled:boolean}>[]>{
 const selected=await scan(),summaries:Readonly<{operationId:string;settled:boolean}>[]=[];
 for(const operationId of selected){const history=await readCurrentFootprintInverseFullWorkflowHistory(operationId);const last=history.records.at(-1);summaries.push(Object.freeze({operationId,settled:last!==undefined&&TERMINAL.has(last.kind)}));}
 return Object.freeze(summaries);
}
Object.freeze(CurrentFootprintInverseFullWorkflowJournal.prototype);Object.freeze(CurrentFootprintInverseFullWorkflowJournal);
