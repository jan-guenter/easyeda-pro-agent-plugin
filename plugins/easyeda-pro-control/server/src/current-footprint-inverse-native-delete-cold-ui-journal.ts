/* oxlint-disable import/max-dependencies -- The cold-only publisher joins existing rooted descriptors, managed readers and journal grammar without changing released active storage. */
import {constants} from "node:fs";
import type {BigIntStats} from "node:fs";
import {link,lstat,open,unlink} from "node:fs/promises";
import type {FileHandle} from "node:fs/promises";
import process from "node:process";
import {openControlRootCapability} from "./control-root.ts";
import type {ControlRootDirectory} from "./control-root.ts";
/** One original cold UI continuation publication. Strict chain, exact retained
 * bytes and fresh artifact reproof issue no native owner or resume authority. */
import {basename,dirname,join} from "node:path";
import {randomBytes,randomUUID} from "node:crypto";
import {z} from "zod";
import {assertOperationIdUnused,controlDataDirectory,createOperationScanner,ensureOperationStorage,loadOperation,operationPath,repairExactManagedArtifactDurability,repairOperationPublicationDurability,updateOperation,verifyExactManagedArtifact,writePhaseArtifact} from "./artifacts.ts";
import type {ArtifactDescriptor,OperationJournal} from "./artifacts.ts";
import {OPERATION_SCHEMA,buildPlanHash,canonicalJson,isRecord,sha256Json,sha256Text} from "./core.ts";
import type {UnknownRecord} from "./core.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {COLD_UI_JOURNAL_BUDGET as BUDGET,COLD_UI_STAGES,COLD_UI_PREFIX as PREFIX,COLD_UI_PROFILE as PROFILE,COLD_UI_PURPOSE as PURPOSE,coldUiIdSchema,coldUiRecordSchema,coldUiStageRequestSchema} from "./current-footprint-inverse-native-delete-cold-ui-contract.ts";
import type {ColdUiStageRecord as Entry,ColdUiStagePhase as Phase,ColdUiStageRequest as Request} from "./current-footprint-inverse-native-delete-cold-ui-contract.ts";

const originalJournals=new WeakSet<object>();
const MAX_RECORDS=BUDGET.records;const BUDGET_SHA256=sha256Json(BUDGET);
const TERMINAL=new Set<Phase>(["terminal-success","terminal-failure"]);
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`COLD_UI_JOURNAL_${code}`);}}
function core(value:Readonly<UnknownRecord>):string{const{journalSha256:_hash,integrityModel:_model,...fields}=value;return canonicalJson(fields);}
const empty=z.strictObject({});const completed=z.strictObject({originalCompleted:z.literal(true)});
/** A normal stage has one exact intent/result. Failure must precede cleanup
 * and match the actual active stage; incomplete histories remain quarantined. */
export function assertCurrentFootprintInverseNativeDeleteColdUiChain(records:readonly Entry[]):void{
 need(records.length<=MAX_RECORDS,"BOUND");let active:string|null=null,cleaned=false,cleaning=false,cleanup=0,ended=false,failed=false,normal=0,ordinal=0,prior:Entry|null=null;
 for(const[index,input]of records.entries()){
  const entry=coldUiRecordSchema.parse(input);need(!ended&&entry.sequence===index&&entry.previousSha256===(prior===null?null:sha256Json(prior))&&(prior===null||entry.operationId===prior.operationId),"CHAIN");
  if(["failure","cleanup-intent","cleanup-result","terminal-failure"].includes(entry.kind)){cleanup+=1;}else{normal+=1;}
  need(normal<=BUDGET.normalRecords&&cleanup<=BUDGET.cleanupRecords&&Buffer.byteLength(`${JSON.stringify(entry)}\n`)<=BUDGET.recordBytes,"CLASS");
  if(index===0){need(entry.kind==="operation-intent","OPERATION_FIRST");const request=z.strictObject({request:coldUiStageRequestSchema}).parse(entry.evidence).request;need(request.operationId===entry.operationId,"OPERATION_ID");}
  else if(entry.kind==="failure"){const evidence=z.strictObject({stage:z.enum(COLD_UI_STAGES),originalErrorRetained:z.literal(true)}).parse(entry.evidence);need(!failed&&!cleaning&&(active===null?evidence.stage===COLD_UI_STAGES[Math.max(ordinal-1,0)]||evidence.stage===COLD_UI_STAGES[ordinal]:evidence.stage===active),"FAILURE");failed=true;}
  else if(entry.kind==="cleanup-intent"){empty.parse(entry.evidence);need(failed&&!cleaning,"CLEANUP_INTENT");cleaning=true;}
  else if(entry.kind==="cleanup-result"){const e=z.strictObject({originalResourcesClosed:z.literal(true),originalPendingJoined:z.literal(true),noApplicationLaunched:z.boolean(),originalRootAndWholeJobExited:z.boolean()}).parse(entry.evidence);need(cleaning&&!cleaned&&e.noApplicationLaunched!==e.originalRootAndWholeJobExited,"CLEANUP_RESULT");cleaned=true;}
  else if(entry.kind==="terminal-failure"){z.strictObject({originalCleanupCompleted:z.literal(true),wholeInverseVerified:z.literal(false)}).parse(entry.evidence);need(failed&&cleaned,"TERMINAL_FAILURE");ended=true;}
  else if(entry.kind==="terminal-success"){z.strictObject({nativeUiTaskAbsenceVerified:z.literal(true),publicSdkParity:z.literal(false),wholeInverseVerified:z.literal(false)}).parse(entry.evidence);need(!failed&&!cleaning&&active===null&&ordinal===COLD_UI_STAGES.length,"TERMINAL_SUCCESS");ended=true;}
  else{
   need(!failed&&!cleaning&&entry.kind!=="operation-intent","NORMAL_ENDED");const stage=COLD_UI_STAGES[ordinal];need(stage!==undefined,"STAGE_BOUND");
   if(entry.kind===`${stage}-intent`){empty.parse(entry.evidence);need(active===null,"STAGE_INTENT");active=stage;}
   else{need(entry.kind===`${stage}-result`&&active===stage,"STAGE_RESULT");completed.parse(entry.evidence);active=null;ordinal+=1;}
  }
  prior=entry;
 }
}

const artifactSchema = z.object({
  path: z.string().max(BUDGET.artifactPathUnits),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f\d]{64}$/u),
}).strict();
const manifestSchema = z.object({
  operationId: coldUiIdSchema,
  plan: z.object({ profile: z.literal(PROFILE), request: coldUiStageRequestSchema,
    nonce: z.string().regex(/^[a-f\d]{64}$/u), purpose:z.literal(PURPOSE), budgetSha256: z.literal(BUDGET_SHA256) }).strict(),
  records: z.array(coldUiRecordSchema).max(MAX_RECORDS),
  artifacts: z.array(artifactSchema).max(MAX_RECORDS),
  state: z.enum(["prepared", "completed"]),
}).loose().refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= BUDGET.manifestBytes);
function parse(input: Readonly<UnknownRecord>): readonly Entry[] {
  const operation = manifestSchema.parse(input); const request = operation.plan.request;
  need(request.operationId === operation.operationId, "MANIFEST");
  const entries = operation.records;
  assertCurrentFootprintInverseNativeDeleteColdUiChain(entries);
  if(entries.length>0){need(canonicalJson(z.strictObject({request:coldUiStageRequestSchema}).parse(entries[0]?.evidence).request)===canonicalJson(request),"MANIFEST_REQUEST");}
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
function sameInitialFile(left:Readonly<{dev:bigint;ino:bigint}>,right:Readonly<{dev:bigint;ino:bigint}>):boolean{return left.dev===right.dev&&left.ino===right.ino;}
interface InitialPublicationAttempt {confirmedPrepublication:boolean;destinationConflict:boolean;directory:Readonly<{dev:bigint;ino:bigint}>|null}
/** A cold-only initial publication keeps the released generic publisher intact.
 * Only an owned temporary whose cleanup and directory sync completed before any
 * link invocation can establish that this original manifest never published. */
async function publishInitialColdUiOperation(operation:OperationJournal,attempt:InitialPublicationAttempt):Promise<void>{
 const operationId=coldUiIdSchema.parse(operation.operationId);need(parse(operation).length===0,"INITIAL_ONLY");
 const journalCore={...operation};delete journalCore["journalSha256"];
 journalCore["integrityModel"]="The unkeyed SHA-256 value detects accidental corruption. It does not authenticate the journal against a writer with access to the control-data directory.";
 const sealed={...journalCore,journalSha256:sha256Text(canonicalJson(journalCore))};
 const bytes=Buffer.from(`${JSON.stringify(sealed,null,2)}\n`);need(bytes.length<=BUDGET.manifestBytes,"INITIAL_BYTES");
 const path=operationPath(operationId),root=await openControlRootCapability(controlDataDirectory(),false);
 let directory:ControlRootDirectory|undefined,file:FileHandle|undefined,identity:BigIntStats|undefined;
 let failed=false,linkInvoked=false,temporary="";let failure:unknown;const cleanupErrors:unknown[]=[];
 const currentDirectory=async():Promise<void>=>{
  need(directory!==undefined,"INITIAL_DIRECTORY");const current=await root.openDirectory(dirname(path),false);
  try{need(sameInitialFile(directory.info,current.info),"INITIAL_DIRECTORY_CHANGED");await root.assertCurrent();}finally{await current.handle.close();}
 };
 try{
  directory=await root.openDirectory(dirname(path),false);
  if(attempt.directory===null){attempt.directory=Object.freeze({dev:directory.info.dev,ino:directory.info.ino});}else{need(sameInitialFile(directory.info,attempt.directory),"INITIAL_DIRECTORY_CHANGED");}
  const prefix=`/proc/self/fd/${String(directory.handle.fd)}/${basename(path)}`;
  temporary=`${prefix}.tmp-cold-ui-${randomUUID()}`;
  // oxlint-disable-next-line no-bitwise -- This fixed managed child can neither follow a symlink nor replace an existing temporary.
  file=await open(temporary,constants.O_RDWR|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW|constants.O_NONBLOCK,0o600);
  identity=await file.stat({bigint:true});
  need(identity.isFile()&&identity.nlink===1n&&Number(identity.mode%512n)===0o600&&typeof process.getuid==="function"&&identity.uid===BigInt(process.getuid()),"INITIAL_TEMPORARY");
  await file.writeFile(bytes);await file.sync();
  const written=await file.stat({bigint:true});need(sameInitialFile(identity,written)&&written.size===BigInt(bytes.length)&&written.nlink===1n&&written.uid===identity.uid&&Number(written.mode%512n)===0o600,"INITIAL_WRITTEN");
  await currentDirectory();
  const named=await lstat(temporary,{bigint:true});need(sameInitialFile(written,named)&&named.isFile()&&named.size===written.size&&named.nlink===1n&&named.uid===written.uid&&named.mode===written.mode&&named.mtimeNs===written.mtimeNs&&named.ctimeNs===written.ctimeNs,"INITIAL_TEMPORARY_CHANGED");
  linkInvoked=true;
  try{await link(temporary,prefix);}catch(error){attempt.destinationConflict=error instanceof Error&&"code"in error&&error.code==="EEXIST";throw error;}
  const published=await lstat(prefix,{bigint:true});need(sameInitialFile(identity,published)&&published.isFile()&&published.nlink===2n&&published.uid===identity.uid&&Number(published.mode%512n)===0o600,"INITIAL_PUBLISHED");await directory.handle.sync();
 }catch(error){failed=true;failure=error;}
 if(file!==undefined){await file.close().catch((error:unknown)=>{cleanupErrors.push(error);});}
 if(identity!==undefined&&directory!==undefined){
  try{
   const current=await lstat(temporary,{bigint:true});need(sameInitialFile(identity,current)&&current.isFile()&&current.uid===identity.uid&&Number(current.mode%512n)===0o600,"INITIAL_TEMPORARY_CHANGED");
   await unlink(temporary);await directory.handle.sync();await currentDirectory();
  }catch(error){cleanupErrors.push(error);}
 }
 if(directory!==undefined){await directory.handle.close().catch((error:unknown)=>{cleanupErrors.push(error);});}
 await root.close().catch((error:unknown)=>{cleanupErrors.push(error);});
 if(failed||cleanupErrors.length>0){
  attempt.confirmedPrepublication=failed&&identity!==undefined&&!linkInvoked&&cleanupErrors.length===0;
  if(cleanupErrors.length===0){throw failure;}
  throw new AggregateError(failed?[failure,...cleanupErrors]:cleanupErrors,"COLD_UI_JOURNAL_INITIAL_CLEANUP",{cause:failure});
 }
 const actual=await loadOperation(operationId);need(core(actual)===core(operation),"RESERVATION_CHANGED");
 await repairOperationPublicationDurability(operation);const durable=await loadOperation(operationId);need(core(durable)===core(operation),"RESERVATION_CHANGED");
 Object.assign(operation,sealed);
}

/** Read the maintained full chain and freshly verified artifacts without
 * constructing a publisher, native owner or resumable opening lifecycle. */
export async function readCurrentFootprintInverseNativeDeleteColdUiHistory(operationId: string): Promise<Readonly<{
  operation: OperationJournal; records: readonly Entry[];
}>> {
  coldUiIdSchema.parse(operationId);
  const operation = await loadOperation(operationId), records = parse(operation);
  for (const entry of records) { await verifyExactManagedArtifact(artifact(operationId, entry)); }
  const current = await loadOperation(operationId);
  parse(current); need(core(current) === core(operation), "HISTORY_CHANGED");
  return freezeDeep({ operation: current, records });
}
/** Pure parsed summary for the shared fresh launch scan; grants no ownership. */
export function projectCurrentFootprintInverseNativeDeleteColdUiLaunchState(operation: UnknownRecord): Readonly<{ operationId: string; settled: boolean }> | undefined {
  const id = operation["operationId"], plan = operation["plan"];
  if (!(typeof id === "string" && id.startsWith(PREFIX)) && !(isRecord(plan) && plan["profile"] === PROFILE)) { return undefined; }
  need(typeof id === "string" && isRecord(plan), "RESERVED_OPERATION");
  const parsed = parse(operation); const last = parsed.at(-1);
  return { operationId: id, settled: last !== undefined && TERMINAL.has(last.kind) };
}
const scanCandidates = createOperationScanner(projectCurrentFootprintInverseNativeDeleteColdUiLaunchState);
export async function scanCurrentFootprintInverseNativeDeleteColdUiLaunchStates(): Promise<readonly Readonly<{
  operationId: string; settled: boolean;
}>[]> {
  const summaries: Readonly<{ operationId: string; settled: boolean }>[] = [];
  for (const { operationId } of await scanCandidates()) {
    const { records } = await readCurrentFootprintInverseNativeDeleteColdUiHistory(operationId);
    const last = records.at(-1);
    summaries.push(Object.freeze({ operationId, settled: last !== undefined && TERMINAL.has(last.kind) }));
  }
  return Object.freeze(summaries);
}
/** Every incomplete original cold UI stage quarantines subsequent launches. */
export async function assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis():Promise<void>{
 for(const operation of await scanCurrentFootprintInverseNativeDeleteColdUiLaunchStates()){need(operation.settled,"UNRESOLVED_OWNER");}
}

/** Retain pending bytes before either publication await. Settlement writes only
 * the original record/manifest and never repeats a native operation. */
export class CurrentFootprintInverseNativeDeleteColdUiJournal {
  readonly #request: Request;
  #cleanupPlan:Readonly<{stage:typeof COLD_UI_STAGES[number]}>|null=null;
  #cleanupClosure:Readonly<{originalResourcesClosed:true;originalPendingJoined:true;noApplicationLaunched:boolean;originalRootAndWholeJobExited:boolean}>|null=null;
  #operation: OperationJournal;
  #reserved = false;
  #reserveAttempted = false;
  #reservationEntered = false;
  #reservationConflict = false;
  #initialNeverPublished=false;
  #initialDirectory:Readonly<{dev:bigint;ino:bigint}>|null=null;
  #writing = false;
  #publicationIdle: Promise<null> = Promise.resolve(null);
  #pending: Readonly<{ entry: Entry; descriptor: ArtifactDescriptor; next: OperationJournal }> | null = null;
  public constructor(request: Request) {
    originalJournals.add(this);
    this.#request = freezeDeep(coldUiStageRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); operationPath(this.#request.operationId);
    const plan = { profile: PROFILE, request: this.#request, nonce: randomBytes(32).toString("hex"), purpose:PURPOSE, budgetSha256: BUDGET_SHA256 };
    this.#operation = { schema: OPERATION_SCHEMA, operationId: this.#request.operationId, plan, planHash: buildPlanHash(plan),
      state: "prepared", records: [], artifacts: [] };
    Object.freeze(this);
  }
  public async reserve(): Promise<void> {
    need(!this.#reserveAttempted, "RESERVATION_CONSUMED"); this.#reserveAttempted = true;
    await this.#exclusive(async () => {
      await ensureOperationStorage(); await assertOperationIdUnused(this.#request.operationId); this.#reservationEntered = true;
      await this.#createInitial();
      this.#reserved = true;
      this.#queue("operation-intent", { request: this.#request }); await this.#settlePending();
    });
  }
  async #createInitial():Promise<void>{
    const attempt:InitialPublicationAttempt={confirmedPrepublication:false,destinationConflict:false,directory:this.#initialDirectory};this.#initialNeverPublished=false;
    try{await publishInitialColdUiOperation(this.#operation,attempt);}
    catch(error){this.#initialNeverPublished=attempt.confirmedPrepublication;this.#reservationConflict=attempt.destinationConflict;throw error;}
    finally{this.#initialDirectory=attempt.directory;}
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
    const actual = await loadOperation(this.#request.operationId); need(this.#pending === null, "PUBLICATION_PENDING"); parse(actual); need(core(actual) === core(this.#operation), "ORIGINAL_CHANGED");
  }
  public async assertStage(stage:"checkpoint-intent"|"birth-intent"|"read-intent"):Promise<void>{
    await this.#assertPublished();need(parse(this.#operation).at(-1)?.kind===stage,"STAGE_CUTOFF");for(const descriptor of this.#operation.artifacts??[]){await verifyExactManagedArtifact(descriptor);}await this.#assertPublished();need(parse(this.#operation).at(-1)?.kind===stage,"STAGE_CUTOFF");
  }
  public async assertReadAdmission():Promise<void>{
    need(!this.#writing,"PUBLICATION_BUSY");await this.#assertPublished();
    const records=parse(this.#operation);need(records.length===6&&records.at(-1)?.kind==="read-intent","READ_PREFIX");
    for(const descriptor of this.#operation.artifacts??[]){await verifyExactManagedArtifact(descriptor);}
    await this.#assertPublished();need(!this.#writing,"PUBLICATION_BUSY");
    const admitted=parse(this.#operation);need(admitted.length===6&&admitted.at(-1)?.kind==="read-intent","READ_PREFIX");
  }
  public async append(kind: Phase, evidence: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#exclusive(async () => { await this.#assertPublished(); this.#queue(kind, evidence); await this.#settlePending(); });
  }
  #queue(kind: Phase, evidence: Readonly<Record<string, unknown>>): void {
    need(this.#pending === null, "PUBLICATION_PENDING"); const records = parse(this.#operation);
    const previousSha256 = records.length === 0 ? null : sha256Json(records.at(-1));
    const entry = freezeDeep(coldUiRecordSchema.parse({
      schema: "easyeda-pro-control.footprint-inverse-cold-ui-stage-record.v1", operationId: this.#request.operationId,
      sequence: records.length, previousSha256, kind, evidence:captureCurrentPcbStringClockReply(evidence).value,
      executionAuthorized: false, saveAuthorized: false,
    }));
    assertCurrentFootprintInverseNativeDeleteColdUiChain([...records, entry]); const descriptor = artifact(this.#request.operationId, entry);
    const artifacts = this.#operation.artifacts ?? [];
    const next = { ...this.#operation, records: [...records, entry], artifacts: [...artifacts, descriptor], state: TERMINAL.has(kind) ? "completed" : "prepared" };
    parse(next);
    this.#pending = Object.freeze({ entry, descriptor, next });
  }
  /** Retain the finite cleanup publication plan before the first await.
   * Settling this plan never invokes cleanup or a native operation. */
  public planOriginalCleanup(stage:typeof COLD_UI_STAGES[number]):void{
    if(this.#cleanupPlan===null){this.#cleanupPlan=Object.freeze({stage});}else{need(this.#cleanupPlan.stage===stage,"ORIGINAL_CLEANUP_STAGE");}
  }
  public async beginOriginalCleanup(stage:typeof COLD_UI_STAGES[number]):Promise<void>{
    this.planOriginalCleanup(stage);await this.settleOriginalCleanupPublication();
  }
  /** The original coordinator rechecks its own completed cleanup before
   * handing over these fixed historical bytes. Data issues no native grant. */
  public recordOriginalCleanupClosure(noApplicationLaunched:boolean,originalRootAndWholeJobExited:boolean):void{
    need(this.#cleanupPlan!==null&&typeof noApplicationLaunched==="boolean"&&typeof originalRootAndWholeJobExited==="boolean"&&noApplicationLaunched!==originalRootAndWholeJobExited,"CLEANUP_CLOSURE");
    const evidence=Object.freeze({originalResourcesClosed:true as const,originalPendingJoined:true as const,noApplicationLaunched,originalRootAndWholeJobExited});
    need(this.#cleanupClosure===null||canonicalJson(this.#cleanupClosure)===canonicalJson(evidence),"ORIGINAL_CLEANUP_CLOSURE");this.#cleanupClosure=evidence;
  }
  /** Resume only planned exact publications after the original pending
   * artifact/manifest settles; no stage/native dispatch can be replayed. */
  public async settleOriginalCleanupPublication():Promise<void>{
    const plan=this.#cleanupPlan;if(plan===null){return;}await this.settle();
    let records=this.retained().records;if(TERMINAL.has(records.at(-1)?.kind??"operation-intent")){return;}
    const planned:readonly Readonly<{kind:Phase;evidence:Readonly<Record<string,unknown>>}>[]=[
      {kind:"failure",evidence:{stage:plan.stage,originalErrorRetained:true}},{kind:"cleanup-intent",evidence:{}},
      ...(this.#cleanupClosure===null?[]:[{kind:"cleanup-result" as const,evidence:this.#cleanupClosure},{kind:"terminal-failure" as const,evidence:{originalCleanupCompleted:true,wholeInverseVerified:false}}]),
    ];
    for(const item of planned){
      const existing=records.find(record=>record.kind===item.kind);
      if(existing===undefined){await this.append(item.kind,item.evidence);}else{need(canonicalJson(existing.evidence)===canonicalJson(item.evidence),"ORIGINAL_CLEANUP_PUBLICATION");}
      records=this.retained().records;
    }
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
    let actual:OperationJournal;
    try{actual=await loadOperation(this.#request.operationId);}
    catch(error){
      if(this.#reserved||!this.#initialNeverPublished||!(error instanceof Error&&"code"in error&&error.code==="ENOENT")){throw error;}
      need(this.#pending===null&&parse(this.#operation).length===0,"INITIAL_ONLY");
      await assertOperationIdUnused(this.#request.operationId);await this.#createInitial();
      actual=await loadOperation(this.#request.operationId);
    }
    if (!this.#reserved) { need(core(actual) === core(this.#operation), "RESERVATION_CHANGED"); await repairOperationPublicationDurability(this.#operation);actual=await loadOperation(this.#request.operationId);need(core(actual)===core(this.#operation),"RESERVATION_CHANGED");this.#reserved = true; }
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

Object.freeze(CurrentFootprintInverseNativeDeleteColdUiJournal.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteColdUiJournal);
export function assertOriginalCurrentFootprintInverseNativeDeleteColdUiJournal(journal:CurrentFootprintInverseNativeDeleteColdUiJournal):void{
 need(journal!==null&&typeof journal==="object"&&originalJournals.has(journal)&&Object.getPrototypeOf(journal)===CurrentFootprintInverseNativeDeleteColdUiJournal.prototype&&Reflect.ownKeys(journal).length===0,"ORIGINAL_PUBLISHER");
}
