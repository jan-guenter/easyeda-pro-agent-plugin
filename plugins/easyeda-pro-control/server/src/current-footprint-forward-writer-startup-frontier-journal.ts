/** Original component publication only. Parent root/Job exit and pending
 * callback/timer joins are required historical facts, never reconstructed
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
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_BUDGET as BUDGET,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_CALLBACK_ROLES as CALLBACK_ROLES,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PREFIX as PREFIX,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PROFILE as PROFILE,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PURPOSE as PURPOSE,currentFootprintForwardWriterStartupFrontierIdSchema,currentFootprintForwardWriterStartupFrontierRecordSchema,currentFootprintForwardWriterStartupFrontierRequestSchema} from "./current-footprint-forward-writer-startup-frontier-contract.ts";
import type {CurrentFootprintForwardWriterStartupFrontierRecord as Entry,CurrentFootprintForwardWriterStartupFrontierPhase as Phase,CurrentFootprintForwardWriterStartupFrontierRequest as Request} from "./current-footprint-forward-writer-startup-frontier-contract.ts";

const MAX_RECORDS=BUDGET.records;
const BUDGET_SHA256=sha256Json(BUDGET);
const TERMINAL=new Set<Phase>(["release-result"]);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_FRONTIER_JOURNAL_${code}`);}}
function core(value:Readonly<UnknownRecord>):string{const{journalSha256:_hash,integrityModel:_model,...fields}=value;return canonicalJson(fields);}
const ordinal=z.number().int().min(1).max(BUDGET.callbackHolds);
const role=z.enum(CALLBACK_ROLES);
const callback=z.strictObject({ordinal,role});
const timer=z.strictObject({ordinal:z.number().int().min(1).max(2),role:z.enum(["entry","returned"])});
const digest=z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
/** Validate all strict fixed evidence before accounting or chain acceptance. */
function validateEvidence(entry:Entry):void{
 switch(entry.kind){
 case "operation-intent": {z.strictObject({request:currentFootprintForwardWriterStartupFrontierRequestSchema}).parse(entry.evidence);break;
 }
 case "setup-intent": {z.strictObject({sourceRecords:z.number().int().min(1).max(BUDGET.sourceRecordUpperBound),sourceSha256:digest,inputSha256:digest}).parse(entry.evidence);break;
 }
 case "setup-result": {z.strictObject({callbackPoints:z.literal(4),timerPoints:z.literal(2),timerSetupRequests:z.literal(17)}).parse(entry.evidence);break;
 }
 case "callback-intent": {callback.parse(entry.evidence);break;
 }
 case "callback-result": {callback.extend({originalResumed:z.literal(true),commands:z.union([z.literal(8),z.literal(4),z.literal(6)])}).parse(entry.evidence);break;
 }
 case "timer-intent": {timer.parse(entry.evidence);break;
 }
 case "timer-result": {timer.extend({originalResumed:z.literal(true),commands:z.union([z.literal(5),z.literal(6)]),cancelled:z.boolean()}).parse(entry.evidence);break;
 }
 case "queue-intent":case "release-intent": {z.strictObject({}).parse(entry.evidence);break;}
 case "queue-result": {z.strictObject({calls:z.number().int().min(1).max(BUDGET.sourceRecordUpperBound),finalizers:z.number().int().min(1).max(BUDGET.sourceRecordUpperBound),fulfilledPromiseReferences:z.number().int().min(1).max(2*BUDGET.sourceRecordUpperBound),originalSerialSlotsNull:z.literal(true),originalOpeningCompleted:z.literal(true)}).parse(entry.evidence);break;
 }
 case "frontier-result": {z.strictObject({startupComplete:z.literal(true),executionAuthorized:z.literal(false),completeProducerFrontierVerified:z.literal(false)}).parse(entry.evidence);break;
 }
 case "failure": {z.strictObject({phase:z.enum(["setup","callback","timer","queue","frontier"]),originalErrorRetained:z.literal(true)}).parse(entry.evidence);break;
 }
 case "release-result": {z.strictObject({originalParentJobExitObserved:z.literal(true),originalPendingCallbacksJoined:z.literal(true),released:z.literal(true)}).parse(entry.evidence);break;
 }
 default: {throw new Error("FORWARD_FRONTIER_JOURNAL_EVIDENCE_KIND");}

 }
}
/** A source row is an upper bound. Actual entry/return/finalizer counts come
 * only from the original completed callback and serial Promise observations. */
export function assertCurrentFootprintForwardWriterStartupFrontierChain(records:readonly Entry[]):void{
 need(records.length<=MAX_RECORDS,"CHAIN_BOUND");const seen=new Set<Phase>();let ended=false,failed=false,prior:Entry|null=null,releasing=false;
 let callbackOrdinal=0,cleanup=0,entries=0,finalizers=0,normal=0,returns=0,sourceRecords=0,timerOrdinal=0;
 let pendingCallback:ReturnType<typeof callback.parse>|null=null,pendingTimer:ReturnType<typeof timer.parse>|null=null;
 const acceptNormal=(entry:Entry):void=>{
   if(entry.kind==="setup-intent"){need(!seen.has(entry.kind),"SETUP_ONCE");const value=entry.evidence["sourceRecords"];need(typeof value==="number","SOURCE_BOUND");sourceRecords=value;}
   else if(entry.kind==="setup-result"){need(seen.has("setup-intent")&&!seen.has(entry.kind),"SETUP_INTENT");}
   else{need(seen.has("setup-result")&&!seen.has("frontier-result"),"SETUP_REQUIRED");
    if(entry.kind==="callback-intent"){const value=callback.parse(entry.evidence);need(!seen.has("queue-intent")&&pendingCallback===null&&value.ordinal===callbackOrdinal+1&&value.ordinal<=3*sourceRecords,"CALLBACK_INTENT");if(value.role==="startupEntry"){need(entries===returns&&entries<sourceRecords,"CALLBACK_ACTIVE");}else if(value.role==="startupReturn"){need(entries===returns+1,"CALLBACK_RETURN");}else{need(finalizers<returns,"CALLBACK_FINALIZER");}callbackOrdinal=value.ordinal;pendingCallback=value;}
    else if(entry.kind==="callback-result"){const value=callback.parse({ordinal:entry.evidence["ordinal"],role:entry.evidence["role"]});need(pendingCallback!==null&&value.ordinal===pendingCallback.ordinal&&value.role===pendingCallback.role,"CALLBACK_RESULT");const commands=({startupEntry:8,startupReturn:4,initialFinally:6,queuedFinally:6} as const)[value.role];need(entry.evidence["commands"]===commands,"CALLBACK_COMMANDS");if(value.role==="startupEntry"){entries+=1;}else if(value.role==="startupReturn"){returns+=1;}else{finalizers+=1;}pendingCallback=null;}
    else if(entry.kind==="timer-intent"){const value=timer.parse(entry.evidence);need(!seen.has("queue-intent")&&pendingTimer===null&&value.ordinal===timerOrdinal+1&&value.role===(value.ordinal===1?"entry":"returned"),"TIMER_INTENT");timerOrdinal=value.ordinal;pendingTimer=value;}
    else if(entry.kind==="timer-result"){const value=timer.parse({ordinal:entry.evidence["ordinal"],role:entry.evidence["role"]});need(pendingTimer!==null&&value.ordinal===pendingTimer.ordinal&&value.role===pendingTimer.role&&entry.evidence["commands"]===(value.role==="entry"?5:6)&&entry.evidence["cancelled"]===(value.role==="returned"),"TIMER_RESULT");pendingTimer=null;}
    else if(entry.kind==="queue-intent"){need(!seen.has(entry.kind)&&pendingCallback===null&&pendingTimer===null&&timerOrdinal===2&&entries===returns&&returns===finalizers&&entries>=1,"QUEUE_INTENT");}
    else if(entry.kind==="queue-result"){const calls=entry.evidence["calls"],refs=entry.evidence["fulfilledPromiseReferences"];need(seen.has("queue-intent")&&!seen.has(entry.kind)&&typeof calls==="number"&&calls<=sourceRecords&&calls===entries&&entry.evidence["finalizers"]===calls&&typeof refs==="number"&&refs>=calls&&refs<=2*calls&&callbackOrdinal===3*calls,"QUEUE_RESULT");}
    else{need(entry.kind==="frontier-result"&&seen.has("queue-result"),"FRONTIER_RESULT");}
   }
 };
 for(const[index,input]of records.entries()){
  const entry=currentFootprintForwardWriterStartupFrontierRecordSchema.parse(input);validateEvidence(entry);
  need(!ended&&entry.sequence===index&&entry.previousSha256===(prior===null?null:sha256Json(prior))&&(prior===null||entry.operationId===prior.operationId),"CHAIN_IDENTITY");
  const isCleanup=entry.kind==="failure"||entry.kind==="release-intent"||entry.kind==="release-result";if(isCleanup){cleanup+=1;}else{normal+=1;}
  need(Buffer.byteLength(`${JSON.stringify(entry)}\n`)<=BUDGET.recordBytes&&normal<=BUDGET.normalRecords&&cleanup<=BUDGET.cleanupRecords,"CLASS_RESERVATION");
  need(index!==0||entry.kind==="operation-intent","OPERATION_INTENT");
  if(entry.kind==="operation-intent"){const request=currentFootprintForwardWriterStartupFrontierRequestSchema.parse(entry.evidence["request"]);need(index===0&&request.operationId===entry.operationId,"ORIGINAL_REQUEST");}
  else if(entry.kind==="failure"){need(!failed&&!releasing,"FAILURE_ONCE");failed=true;}
  else if(entry.kind==="release-intent"){need(!releasing,"RELEASE_ONCE");releasing=true;}
  else if(entry.kind==="release-result"){need(releasing,"RELEASE_INTENT");ended=true;}
  else{need(!failed&&!releasing,"NORMAL_ENDED");acceptNormal(entry);
  }seen.add(entry.kind);prior=entry;
 }
}
const artifactSchema = z.object({
  path: z.string().max(BUDGET.artifactPathUnits),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f\d]{64}$/u),
}).strict();
const manifestSchema = z.object({
  operationId: currentFootprintForwardWriterStartupFrontierIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: currentFootprintForwardWriterStartupFrontierRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$/u), purpose:z.literal(PURPOSE), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(currentFootprintForwardWriterStartupFrontierRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintForwardWriterStartupFrontierChain(entries);
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
export async function readCurrentFootprintForwardWriterStartupFrontierHistory(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  currentFootprintForwardWriterStartupFrontierIdSchema.parse(operationId);
  const operation = await loadOperation(operationId), records = parse(operation);
  return freezeDeep({ operation, records });
}
/** Pure parsed summary for the shared fresh launch scan; grants no ownership. */
export function projectCurrentFootprintForwardWriterStartupFrontierLaunchState(operation: UnknownRecord): Readonly<{ operationId: string; settled: boolean }> | undefined {
  const id = operation["operationId"], plan = operation["plan"];
  if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && plan["profile"] === PROFILE)) { return undefined; }
  need(typeof id === "string" && isRecord(plan), "RESERVED_OPERATION");
  const parsed = parse(operation); const last = parsed.at(-1);
  return { operationId: id, settled: last !== undefined && TERMINAL.has(last.kind) };
}
const scan = createOperationScanner(projectCurrentFootprintForwardWriterStartupFrontierLaunchState);
/** Every original empty, partial, successful-but-unreleased or failed
 * component blocks another launch until its own terminal release evidence. */
export async function assertNoUnresolvedCurrentFootprintForwardWriterStartupFrontiers():Promise<void>{
 for(const operation of await scan()){need(operation.settled,"UNRESOLVED_OWNER");}
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintForwardWriterStartupFrontierJournal {
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
    this.#request = freezeDeep(currentFootprintForwardWriterStartupFrontierRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#request.operationId);
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
    const entry = freezeDeep(currentFootprintForwardWriterStartupFrontierRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-forward-writer-startup-frontier-record.v1", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence:captureCurrentPcbStringClockReply(evidence).value,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintForwardWriterStartupFrontierChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
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
