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
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BUDGET as BUDGET,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PREFIX as PREFIX,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PROFILE as PROFILE,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PURPOSE as PURPOSE,currentFootprintForwardWriterTicketTimerIdSchema,currentFootprintForwardWriterTicketTimerRecordSchema,currentFootprintForwardWriterTicketTimerRequestSchema} from "./current-footprint-forward-writer-ticket-timer-contract.ts";
import type {CurrentFootprintForwardWriterTicketTimerRecord as Entry,CurrentFootprintForwardWriterTicketTimerPhase as Phase,CurrentFootprintForwardWriterTicketTimerRequest as Request} from "./current-footprint-forward-writer-ticket-timer-contract.ts";

const MAX_RECORDS=BUDGET.records;
const BUDGET_SHA256=sha256Json(BUDGET);
const TERMINAL=new Set<Phase>(["release-result"]);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_TICKET_TIMER_JOURNAL_${code}`);}}
function core(value:Readonly<UnknownRecord>):string{const{journalSha256:_hash,integrityModel:_model,...fields}=value;return canonicalJson(fields);}
const digest=z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/u);
const timer=z.strictObject({ordinal:z.number().int().min(1).max(6),timerOrdinal:z.number().int().min(1).max(2),role:z.enum(["entry","returned","selfReturned"])});
function validateEvidence(entry:Entry):void{
 switch(entry.kind){
 case "operation-intent":{z.strictObject({request:currentFootprintForwardWriterTicketTimerRequestSchema}).parse(entry.evidence);break;}
 case "ws-intent":{z.strictObject({sourceSha256:digest,inputSha256:digest,originalStartupEntryObserved:z.literal(true)}).parse(entry.evidence);break;}
 case "ws-result":{z.strictObject({privateDeployment:z.literal(false),sourceInitializations:z.literal(1),originalLexicalFrameRetained:z.literal(true),websocketPublicationExcluded:z.literal(true)}).parse(entry.evidence);break;}
 case "setup-intent":{z.strictObject({sourceSha256:digest,inputSha256:digest,originalReflectionPacketRetained:z.literal(true)}).parse(entry.evidence);break;}
 case "setup-result":{z.strictObject({commands:z.literal(37),points:z.literal(3),baselinePublishTimerNull:z.literal(true),originalSubscribersRetained:z.literal(true),canvasTimersExcluded:z.literal(true)}).parse(entry.evidence);break;}
 case "precreate-intent":case "quiesce-intent":case "release-intent":{z.strictObject({}).parse(entry.evidence);break;}
 case "precreate-result":{z.strictObject({commands:z.literal(1),originalBaselineUnchanged:z.literal(true)}).parse(entry.evidence);break;}
 case "timer-intent":{timer.parse(entry.evidence);break;}
 case "timer-result":{timer.extend({commands:z.union([z.literal(4),z.literal(3)]),originalResumed:z.literal(true)}).parse(entry.evidence);break;}
 case "quiesce-result":{z.strictObject({commands:z.number().int().min(1).max(3),timers:z.number().int().min(1).max(2),publishTimerNull:z.literal(true),originalParserAndPostSyncReturned:z.literal(true),originalCallbacksJoined:z.literal(true)}).parse(entry.evidence);break;}
 case "complete":{z.strictObject({timers:z.number().int().min(1).max(2),naturalSelfReturnsJoined:z.literal(true),executionAuthorized:z.literal(false)}).parse(entry.evidence);break;}
 case "failure":{z.strictObject({phase:z.enum(["ws","setup","precreate","timer","quiesce"]),originalErrorRetained:z.literal(true)}).parse(entry.evidence);break;}
 case "release-result":{z.strictObject({originalParentJobExitObserved:z.literal(true),originalPendingCallbacksJoined:z.literal(true),released:z.literal(true)}).parse(entry.evidence);break;}
 default:{throw new Error("FORWARD_TICKET_TIMER_JOURNAL_KIND");}
 }
}
export function assertCurrentFootprintForwardWriterTicketTimerChain(records:readonly Entry[]):void{
 need(records.length<=MAX_RECORDS,"CHAIN_BOUND");const seen=new Set<Phase>();let ended=false,failed=false,ordinal=0,prior:Entry|null=null,releasing=false,timers=0;
 let pending:ReturnType<typeof timer.parse>|null=null;
 const roles=["entry","returned","selfReturned"]as const;
 for(const entry of records){
  currentFootprintForwardWriterTicketTimerRecordSchema.parse(entry);validateEvidence(entry);need(Buffer.byteLength(JSON.stringify(entry))+1<=BUDGET.recordBytes,"RECORD_BYTES");
  need(!ended&&entry.sequence===(prior===null?0:prior.sequence+1)&&entry.previousSha256===(prior===null?null:sha256Json(prior))&&(prior===null||entry.operationId===prior.operationId),"CHAIN_IDENTITY");
  if(entry.kind==="operation-intent"){need(prior===null&&currentFootprintForwardWriterTicketTimerRequestSchema.parse(entry.evidence["request"]).operationId===entry.operationId,"OPERATION_FIRST");}
  else{
   need(seen.has("operation-intent"),"OPERATION_REQUIRED");
   if(entry.kind==="failure"){need(!failed&&!releasing,"FAILURE_ONCE");failed=true;}
   else if(entry.kind==="release-intent"){need(!releasing&&(failed||seen.has("complete")),"RELEASE_STATE");releasing=true;}
   else if(entry.kind==="release-result"){need(releasing,"RELEASE_INTENT");ended=true;}
   else{
    need(!failed&&!releasing&&!seen.has("complete"),"NORMAL_ENDED");
    const ordered:readonly Phase[]=["ws-intent","ws-result","setup-intent","setup-result","precreate-intent","precreate-result"];
    const at=ordered.indexOf(entry.kind);
    if(at!==-1){const predecessor=at===0?"operation-intent":ordered[at-1];need(!seen.has(entry.kind)&&predecessor!==undefined&&seen.has(predecessor),"SETUP_ORDER");}
    else if(entry.kind==="timer-intent"){
     const value=timer.parse(entry.evidence);need(seen.has("precreate-result")&&!seen.has("quiesce-result")&&pending===null&&value.ordinal===ordinal+1&&value.role===roles[ordinal%3]&&value.timerOrdinal===Math.floor(ordinal/3)+1,"TIMER_ORDER");pending=value;
    }else if(entry.kind==="timer-result"){
     const value=timer.parse({ordinal:entry.evidence["ordinal"],timerOrdinal:entry.evidence["timerOrdinal"],role:entry.evidence["role"]});need(pending!==null&&canonicalJson(pending)===canonicalJson(value)&&entry.evidence["commands"]===(value.role==="entry"?4:3),"TIMER_RESULT");ordinal=value.ordinal;timers+=value.role==="selfReturned"?1:0;pending=null;
    }else if(entry.kind==="quiesce-intent"){need(seen.has("precreate-result")&&!seen.has(entry.kind),"QUIESCE_ONCE");}
    else if(entry.kind==="quiesce-result"){need(seen.has("quiesce-intent")&&!seen.has(entry.kind)&&pending===null&&timers>0&&ordinal===3*timers&&entry.evidence["timers"]===timers,"QUIESCE_ORIGINAL");}
    else if(entry.kind==="complete"){need(seen.has("quiesce-result")&&pending===null&&entry.evidence["timers"]===timers,"COMPLETE_ORIGINAL");}
    else{throw new Error("FORWARD_TICKET_TIMER_JOURNAL_NORMAL_KIND");}
   }
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
  operationId: currentFootprintForwardWriterTicketTimerIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: currentFootprintForwardWriterTicketTimerRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u), purpose:z.literal(PURPOSE), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(currentFootprintForwardWriterTicketTimerRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintForwardWriterTicketTimerChain(entries);
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
export async function readCurrentFootprintForwardWriterTicketTimerHistory(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  currentFootprintForwardWriterTicketTimerIdSchema.parse(operationId);
  const operation = await loadOperation(operationId), records = parse(operation);
  return freezeDeep({ operation, records });
}
/** Pure parsed summary for the shared fresh launch scan; grants no ownership. */
export function projectCurrentFootprintForwardWriterTicketTimerLaunchState(operation: UnknownRecord): Readonly<{ operationId: string; settled: boolean }> | undefined {
  const id = operation["operationId"], plan = operation["plan"];
  if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && plan["profile"] === PROFILE)) { return undefined; }
  need(typeof id === "string" && isRecord(plan), "RESERVED_OPERATION");
  const parsed = parse(operation); const last = parsed.at(-1);
  return { operationId: id, settled: last !== undefined && TERMINAL.has(last.kind) };
}
const scan = createOperationScanner(projectCurrentFootprintForwardWriterTicketTimerLaunchState);
/** Every original empty, partial, successful-but-unreleased or failed
 * component blocks another launch until its own terminal release evidence. */
export async function assertNoUnresolvedCurrentFootprintForwardWriterTicketTimers():Promise<void>{
 for(const operation of await scan()){need(operation.settled,"UNRESOLVED_OWNER");}
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintForwardWriterTicketTimerJournal {
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
    this.#request = freezeDeep(currentFootprintForwardWriterTicketTimerRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#request.operationId);
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
    need(!this.#writing, "TICKET_TIMER_BUSY");
    if (this.#reservationConflict) { return "conflict"; }
    if (!this.#reservationEntered) { return "not-entered"; }
    return this.#reserved ? "reserved" : "create-unknown";
  }
  public async assertCurrent(): Promise<void> {
    need(!this.#writing, "TICKET_TIMER_BUSY"); await this.#assertPublished(); need(!this.#writing, "TICKET_TIMER_BUSY");
  }
  async #assertPublished(): Promise<void> {
    need(this.#reserved && this.#pending === null, "TICKET_TIMER_PENDING");
    const actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
  }
  public async append(kind: Phase, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async () => { await this.#assertPublished(); this.#queue(kind, evidence); await this.#settlePending(); });
  }
  #queue(kind: Phase, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "TICKET_TIMER_PENDING"); const records = parse(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(currentFootprintForwardWriterTicketTimerRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-forward-writer-ticket-timer-record.v1", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence:captureCurrentPcbStringClockReply(evidence).value,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintForwardWriterTicketTimerChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
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
    need(!this.#writing,"TICKET_TIMER_BUSY");const idle=Promise.withResolvers<null>();this.#writing=true;this.#publicationIdle=idle.promise;
    try{await action();}finally{this.#writing=false;idle.resolve(null);}
  }
  async #settlePending(): Promise<void> {
    need(this.#reserveAttempted && this.#reservationEntered && !this.#reservationConflict, "ORIGINAL_RESERVATION_REQUIRED");
    let actual: OperationJournal | undefined;
    try { actual = await loadOperation(this.#request.operationId); }
    catch (error) {
      if (this.#reserved || !(error instanceof Error && "code" in error && error.code === "ENOENT")) { throw error; }
    }
    if (actual === undefined) {
      need(this.#pending === null && parse(this.#operation).length === 0, "INITIAL_RESERVATION_REQUIRED");
      // The original create may have failed before its exclusive link existed.
      // Republish only this instance's retained initial bytes.
      // A competing link remains a conflict and can never be adopted.
      try { await createOperation(this.#operation); }
      catch (error) {
        if (error instanceof Error && "code" in error && error.code === "EEXIST") { this.#reservationConflict = true; }
        throw error;
      }
      actual = await loadOperation(this.#request.operationId);
    }
    if (!this.#reserved) { need(core(actual) === core(this.#operation), "RESERVATION_CHANGED"); this.#reserved = true; }
    let pending = this.#pending;
    if (pending === null) {
      need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
      if (parse(this.#operation).length > 0) { return; }
      this.#queue("operation-intent", { request: this.#request }); pending = this.#pending;
    }
    need(pending !== null, "ORIGINAL_PENDING_REQUIRED");
    need(core(actual) === core(this.#operation) || core(actual) === core(pending.next), "TICKET_TIMER_CHANGED");
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
    actual = await loadOperation(this.#request.operationId); parse(actual); need(core(actual) === core(pending.next), "TICKET_TIMER_CHANGED");
    this.#operation = pending.next; this.#pending = null;
  }
  public retained(): Readonly<{ records: readonly Entry[]; publicationPending: boolean; reserved: boolean }> {
    return Object.freeze({ records: Object.freeze([...parse(this.#operation)]), publicationPending: this.#pending !== null || this.#writing, reserved: this.#reserved });
  }
}
