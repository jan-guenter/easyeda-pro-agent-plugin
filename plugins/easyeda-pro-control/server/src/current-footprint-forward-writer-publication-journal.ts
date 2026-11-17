/** Original component publication only. Parent root/Job exit and pending
 * callback/serial Promise joins are required historical facts, never reconstructed
 * native custody. The full provider retains helper release independently. */
import {dirname,join} from "node:path";
import {randomBytes} from "node:crypto";
import {z} from "zod";
import {assertOperationIdUnused,createOperation,createOperationScanner,ensureOperationStorage,loadOperation,operationPath,repairExactManagedArtifactDurability,repairOperationPublicationDurability, updateOperation,writePhaseArtifact} from "./artifacts.ts";
import type {ArtifactDescriptor,OperationJournal} from "./artifacts.ts";
import {OPERATION_SCHEMA,buildPlanHash,canonicalJson,isRecord,sha256Json,sha256Text} from "./core.ts";
import type {UnknownRecord} from "./core.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_BUDGET as BUDGET,CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLBACK_ROLES as CALLBACK_ROLES,CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PREFIX as PREFIX,CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PROFILE as PROFILE,CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PURPOSE as PURPOSE,currentFootprintForwardWriterPublicationIdSchema,currentFootprintForwardWriterPublicationRecordSchema,currentFootprintForwardWriterPublicationRequestSchema} from "./current-footprint-forward-writer-publication-contract.ts";
import type {CurrentFootprintForwardWriterPublicationRecord as Entry,CurrentFootprintForwardWriterPublicationPhase as Phase,CurrentFootprintForwardWriterPublicationRequest as Request} from "./current-footprint-forward-writer-publication-contract.ts";

const MAX_RECORDS=BUDGET.records;
const BUDGET_SHA256=sha256Json(BUDGET);
const TERMINAL=new Set<Phase>(["release-result"]);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_PUBLICATION_JOURNAL_${code}`);}}
function core(value:Readonly<UnknownRecord>):string{const{journalSha256:_hash,integrityModel:_model,...fields}=value;return canonicalJson(fields);}
const ordinal=z.number().int().min(1).max(BUDGET.callbackHolds);
const role=z.enum(CALLBACK_ROLES);
const callback=z.strictObject({ordinal,role});
const digest=z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
const sourceBound=z.number().int().min(1).max(BUDGET.bodyLineUpperBound);
const runBound=z.number().int().min(2).max(BUDGET.callbackRunUpperBound);
function validateEvidence(entry:Entry):void{
 switch(entry.kind){
 case "operation-intent":{z.strictObject({request:currentFootprintForwardWriterPublicationRequestSchema}).parse(entry.evidence);break;}
 case "setup-intent":{z.strictObject({bodyLineUpperBound:sourceBound,callbackRunUpperBound:runBound,sourceSha256:digest,projectionSha256:digest,copyPlanSha256:digest,maximumBodySha256:digest}).refine(value=>value.callbackRunUpperBound===2*value.bodyLineUpperBound).parse(entry.evidence);break;}
 case "setup-result":{z.strictObject({originalCallbackPointsRetained:z.literal(4),newCallbackArms:z.literal(0),originalStartupFrontierCompleted:z.literal(true)}).parse(entry.evidence);break;}
 case "body-intent":{z.strictObject({bodySha256:digest,planSha256:digest,documentUuid:z.string().regex(/^[a-f\d]{16}$(?![\s\S])/u),bodyLineCalls:sourceBound,headCalls:z.literal(2),originalTwoStringTupleRetained:z.literal(true)}).parse(entry.evidence);break;}
 case "body-result":{z.strictObject({originalBodyBound:z.literal(true),parserResumeAuthorized:z.literal(false)}).parse(entry.evidence);break;}
 case "callback-intent":{callback.parse(entry.evidence);break;}
 case "callback-result":{callback.extend({originalResumed:z.literal(true),commands:z.union([z.literal(8),z.literal(4),z.literal(6)])}).parse(entry.evidence);break;}
 case "queue-intent":case "release-intent":{z.strictObject({}).parse(entry.evidence);break;}
 case "queue-result":{z.strictObject({calls:z.number().int().min(0).max(BUDGET.callbackRunUpperBound),finalizers:z.number().int().min(0).max(BUDGET.callbackRunUpperBound),fulfilledPromiseReferences:z.number().int().min(0).max(2*BUDGET.callbackRunUpperBound),originalSerialSlotsNull:z.literal(true),originalParserAndPostSyncReturned:z.literal(true)}).refine(value=>value.finalizers===value.calls&&value.fulfilledPromiseReferences>=value.calls&&value.fulfilledPromiseReferences<=2*value.calls).parse(entry.evidence);break;}
 case "publication-result":{z.strictObject({publicationQuiescent:z.literal(true),executionAuthorized:z.literal(false),completeProducerFrontierVerified:z.literal(false)}).parse(entry.evidence);break;}
 case "failure":{z.strictObject({phase:z.enum(["setup","body","callback","queue","publication"]),originalErrorRetained:z.literal(true)}).parse(entry.evidence);break;}
 case "release-result":{z.strictObject({originalParentJobExitObserved:z.literal(true),originalPendingCallbacksJoined:z.literal(true),released:z.literal(true)}).parse(entry.evidence);break;}
 default:{throw new Error("FORWARD_PUBLICATION_JOURNAL_EVIDENCE_KIND");}
 }
}
/** Counts are upper bounds only. Actual original callback returns/finalizers
 * and empty serial slots must be supplied by the separate native controller. */
export function assertCurrentFootprintForwardWriterPublicationChain(records:readonly Entry[]):void{
 need(records.length<=MAX_RECORDS,"CHAIN_BOUND");const seen=new Set<Phase>();let ended=false,failed=false,prior:Entry|null=null,releasing=false;
 let callbackOrdinal=0,entries=0,finalizers=0,lineMaximum=0,returns=0,runMaximum=0;
 let pendingCallback:ReturnType<typeof callback.parse>|null=null;
 const acceptNormal=(entry:Entry):void=>{
  if(entry.kind==="setup-intent"){need(!seen.has(entry.kind),"SETUP_ONCE");lineMaximum=sourceBound.parse(entry.evidence["bodyLineUpperBound"]);runMaximum=runBound.parse(entry.evidence["callbackRunUpperBound"]);return;}
  if(entry.kind==="setup-result"){need(seen.has("setup-intent")&&!seen.has(entry.kind),"SETUP_INTENT");return;}
  need(seen.has("setup-result")&&!seen.has("publication-result"),"SETUP_REQUIRED");
  if(entry.kind==="body-intent"){need(!seen.has(entry.kind)&&sourceBound.parse(entry.evidence["bodyLineCalls"])<=lineMaximum,"BODY_ONCE_BOUND");return;}
  if(entry.kind==="body-result"){need(seen.has("body-intent")&&!seen.has(entry.kind),"BODY_INTENT");return;}
  need(seen.has("body-result"),"BODY_REQUIRED");
  if(entry.kind==="callback-intent"){
   const value=callback.parse(entry.evidence);need(!seen.has("queue-intent")&&pendingCallback===null&&value.ordinal===callbackOrdinal+1&&value.ordinal<=3*runMaximum,"CALLBACK_INTENT");
   if(value.role==="startupEntry"){need(entries===returns&&entries<runMaximum,"CALLBACK_ACTIVE");}else if(value.role==="startupReturn"){need(entries===returns+1,"CALLBACK_RETURN");}else{need(finalizers<returns,"CALLBACK_FINALIZER");}
   callbackOrdinal=value.ordinal;pendingCallback=value;
  }else if(entry.kind==="callback-result"){
   const value=callback.parse({ordinal:entry.evidence["ordinal"],role:entry.evidence["role"]});need(pendingCallback!==null&&value.ordinal===pendingCallback.ordinal&&value.role===pendingCallback.role,"CALLBACK_RESULT");
   need(entry.evidence["commands"]===({startupEntry:8,startupReturn:4,initialFinally:6,queuedFinally:6} as const)[value.role],"CALLBACK_COMMANDS");
   if(value.role==="startupEntry"){entries+=1;}else if(value.role==="startupReturn"){returns+=1;}else{finalizers+=1;}pendingCallback=null;
  }else if(entry.kind==="queue-intent"){need(!seen.has(entry.kind)&&pendingCallback===null&&entries===returns&&returns===finalizers,"QUEUE_QUIESCENCE");}
  else if(entry.kind==="queue-result"){need(seen.has("queue-intent")&&!seen.has(entry.kind)&&entry.evidence["calls"]===entries&&entry.evidence["finalizers"]===finalizers,"QUEUE_ORIGINAL_COUNTS");}
  else if(entry.kind==="publication-result"){need(seen.has("queue-result")&&pendingCallback===null,"PUBLICATION_QUIESCENCE");}
  else{throw new Error("FORWARD_PUBLICATION_JOURNAL_NORMAL_KIND");}
 };
 for(const entry of records){
  currentFootprintForwardWriterPublicationRecordSchema.parse(entry);validateEvidence(entry);need(Buffer.byteLength(JSON.stringify(entry))+1<=BUDGET.recordBytes,"RECORD_BYTES");
  need(!ended&&entry.sequence===(prior===null?0:prior.sequence+1)&&entry.previousSha256===(prior===null?null:sha256Json(prior))&&(prior===null||entry.operationId===prior.operationId),"CHAIN_IDENTITY");
  if(entry.kind==="operation-intent"){need(prior===null,"OPERATION_FIRST");const request=currentFootprintForwardWriterPublicationRequestSchema.parse(entry.evidence["request"]);need(request.operationId===entry.operationId,"OPERATION_ID");}
  else{
   need(seen.has("operation-intent"),"OPERATION_REQUIRED");
   if(entry.kind==="failure"){need(!failed&&!releasing,"FAILURE_ONCE");failed=true;}
   else if(entry.kind==="release-intent"){need(!releasing&&(failed||seen.has("publication-result")),"RELEASE_STATE");releasing=true;}
   else if(entry.kind==="release-result"){need(releasing,"RELEASE_INTENT");ended=true;}
   else{need(!failed&&!releasing,"NORMAL_ENDED");acceptNormal(entry);}
  }
  seen.add(entry.kind);prior=entry;
 }
}

const artifactSchema = z.object({
  path: z.string().max(BUDGET.artifactPathUnits),
  bytes: z.number().int().positive().max(BUDGET.recordBytes),
  sha256: z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u),
}).strict();
const manifestSchema = z.object({
  operationId: currentFootprintForwardWriterPublicationIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: currentFootprintForwardWriterPublicationRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u), purpose:z.literal(PURPOSE), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(currentFootprintForwardWriterPublicationRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintForwardWriterPublicationChain(entries);
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
/** Read the maintained full chain and freshly verified artifacts without
 * constructing a publisher, native owner or resumable opening lifecycle. */
export async function readCurrentFootprintForwardWriterPublicationHistory(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  currentFootprintForwardWriterPublicationIdSchema.parse(operationId);
  const operation = await loadOperation(operationId), records = parse(operation);
  return freezeDeep({ operation, records });
}
/** Pure parsed summary for the shared fresh launch scan; grants no ownership. */
export function projectCurrentFootprintForwardWriterPublicationLaunchState(operation: UnknownRecord): Readonly<{ operationId: string; settled: boolean }> | undefined {
  const id = operation["operationId"], plan = operation["plan"];
  if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && plan["profile"] === PROFILE)) { return undefined; }
  need(typeof id === "string" && isRecord(plan), "RESERVED_OPERATION");
  const parsed = parse(operation); const last = parsed.at(-1);
  return { operationId: id, settled: last !== undefined && TERMINAL.has(last.kind) };
}
const scan = createOperationScanner(projectCurrentFootprintForwardWriterPublicationLaunchState);
/** Every original empty, partial, successful-but-unreleased or failed
 * component blocks another launch until its own terminal release evidence. */
export async function assertNoUnresolvedCurrentFootprintForwardWriterPublications():Promise<void>{
 for(const operation of await scan()){need(operation.settled,"UNRESOLVED_OWNER");}
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintForwardWriterPublicationJournal {
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
    this.#request = freezeDeep(currentFootprintForwardWriterPublicationRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#request.operationId);
    const plan = { profile: PROFILE, request: this.#request, nonce: randomBytes(32).toString("hex"), purpose:PURPOSE, budgetSha256: BUDGET_SHA256 };
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
    const actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
  }
  public async append(kind: Phase, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async () => { await this.#assertPublished(); this.#queue(kind, evidence); await this.#settlePending(); });
  }
  #queue(kind: Phase, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "PUBLICATION_PENDING"); const records = parse(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(currentFootprintForwardWriterPublicationRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-forward-writer-publication-record.v1", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence:captureCurrentPcbStringClockReply(evidence).value,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintForwardWriterPublicationChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
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
  async #exclusive(action:()=>Promise<void>):Promise<void>{
    need(!this.#writing,"PUBLICATION_BUSY");const idle=Promise.withResolvers<null>();this.#writing=true;this.#publicationIdle=idle.promise;
    try{await action();}finally{this.#writing=false;idle.resolve(null);}
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
    try { await repairExactManagedArtifactDurability(pending.descriptor); }
    catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) { throw error; }
      const written = await writePhaseArtifact(this.#request.operationId, pending.entry.sequence, pending.entry.kind, pending.entry);
      need(canonicalJson(written) === canonicalJson(pending.descriptor), "ARTIFACT_CHANGED");
      await repairExactManagedArtifactDurability(pending.descriptor);
    }
    if (core(actual) !== core(pending.next)) { await updateOperation(pending.next); }
    // A matching renamed manifest can still lack its original parent sync.
    // Settle only the original sealed bytes before clearing this pending step.
    await repairOperationPublicationDurability(pending.next);
    actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(pending.next), "PUBLICATION_CHANGED");
    this.#operation = pending.next; this.#pending = null;
  }
  public retained(): Readonly<{ records: readonly Entry[]; publicationPending: boolean; reserved: boolean }> {
    return Object.freeze({ records: Object.freeze([...parse(this.#operation)]), publicationPending: this.#pending !== null || this.#writing, reserved: this.#reserved });
  }
}
