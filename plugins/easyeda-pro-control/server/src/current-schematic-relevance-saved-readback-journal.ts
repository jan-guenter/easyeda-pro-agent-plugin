/** Distinct durable reader grammar. JSON records never recreate a native owner,
 * cache grant, source receipt or saved acceptance. */
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { assertOperationIdUnused, createOperation, ensureOperationStorage, loadOperation, operationPath, verifyExactManagedArtifact } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, sha256Json } from "./core.ts";
import type { TrackedDispatchOperationJournal } from "./engine.ts";
import { GeneratedFixtureJournalPublication } from "./generated-fixture-journal-publication.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { assertOriginalCurrentSchematicRelevanceSavedReadbackOwner, originalCurrentSchematicRelevanceSavedReadbackTarget } from "./current-schematic-relevance-saved-readback-owner.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_STAGES=["allocation","launch","main","ui","cache","backup","invalidate","loading","registration","opening","cold","scene","close","exit","release","closed-sql","complete"] as const;
type Stage=typeof CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_STAGES[number];
const cleanupKinds=["abort-intent","abort-result","termination-intent","termination-result","helper-release-intent","helper-release-result","no-process-intent","no-process-result","cleanup-complete"] as const;
export type CurrentSchematicRelevanceSavedReadbackJournalKind="operation-intent"|"failure"|typeof cleanupKinds[number]|`${Stage}-${"intent"|"result"}`;
const kinds=new Set<string>(["operation-intent","failure",...cleanupKinds,...CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_STAGES.flatMap(stage=>[`${stage}-intent`,`${stage}-result`])]);
const digest=z.string().regex(/^[a-f0-9]{64}$/u);
const entrySchema=z.strictObject({schema:z.literal("private.current-schematic-relevance-saved-readback-record.v1"),operationId:z.string().regex(/^sch209-relevance-readback-[a-f0-9]{16}$/u),sequence:z.number().int().min(1).max(48),previousSha256:digest.nullable(),kind:z.custom<CurrentSchematicRelevanceSavedReadbackJournalKind>((value):value is CurrentSchematicRelevanceSavedReadbackJournalKind=>typeof value==="string"&&kinds.has(value)),evidence:z.record(z.string(),z.unknown()),executionAuthorized:z.literal(false)}).refine(row=>Buffer.byteLength(`${JSON.stringify(row)}\n`)<=65_536);
type Entry=z.infer<typeof entrySchema>;
function need(value:boolean,reason:string):asserts value{if(!value){throw new Error(`SCHEMATIC_SAVED_JOURNAL_${reason}`);}}
function terminal(kind:CurrentSchematicRelevanceSavedReadbackJournalKind|undefined):boolean{return kind==="complete-result"||kind==="cleanup-complete";}
export function assertCurrentSchematicRelevanceSavedReadbackJournalChain(input:unknown):readonly Entry[]{
 const records=z.array(entrySchema).max(48).parse(input),seen=new Set<string>();let failed=false,next=0,pending:Stage|null=null,previous:Entry|null=null;
 for(const [index,row]of records.entries()){
  need(row.sequence===index+1&&row.previousSha256===(previous===null?null:sha256Json(previous))&&!seen.has(row.kind)&&!terminal(previous?.kind)&&(previous===null||row.operationId===previous.operationId),"CHAIN");
  if(index===0){need(row.kind==="operation-intent","FIRST");}
  else if(row.kind==="failure"){need(!failed,"FAILURE_ONCE");failed=true;}
  else if(failed){
   need((cleanupKinds as readonly string[]).includes(row.kind),"NORMAL_AFTER_FAILURE");
   if(row.kind.endsWith("-result")){need(seen.has(row.kind.replace(/-result$/u,"-intent")),"CLEANUP_INTENT");}
   if(row.kind==="termination-result"){need(row.evidence["rootExited"]===true&&row.evidence["jobEmpty"]===true,"EXIT");}
   if(row.kind==="helper-release-intent"){need(seen.has("termination-result"),"EXIT_BEFORE_RELEASE");}
   if(row.kind==="helper-release-result"||row.kind==="no-process-result"){need(row.evidence["helperReleased"]===true&&row.evidence["helperClosed"]===true,"HELPER_RELEASE");}
   if(row.kind==="cleanup-complete"){need(seen.has("helper-release-result")||seen.has("no-process-result")||row.evidence["noResourceAllocated"]===true,"CLEANUP_RESOURCES");need(row.evidence["readbackAccepted"]===false,"NO_CLEANUP_ACCEPTANCE");}
  }else{
   const stage=CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_STAGES[next];need(stage!==undefined,"STAGE_BOUND");
   if(row.kind.endsWith("-intent")){need(pending===null&&row.kind===`${stage}-intent`,"INTENT_ORDER");pending=stage;}
   else{need(pending===stage&&row.kind===`${stage}-result`,"RESULT_ORDER");pending=null;next+=1;}
   if(row.kind==="complete-result"){need(row.evidence["persistenceVerified"]===true&&row.evidence["reopenedVerified"]===true&&row.evidence["originalHelperReleased"]===true,"COMPLETE");}
  }
  seen.add(row.kind);previous=row;
 }
 return records;
}
const originals=new WeakMap<CurrentSchematicRelevanceSavedReadbackJournal,GeneratedSchematicRelevanceSavedReadbackPlan>();
function manifestCore(value:Readonly<Record<string,unknown>>):string{const{journalSha256:_hash,integrityModel:_model,...body}=value;return canonicalJson(body);}

export class CurrentSchematicRelevanceSavedReadbackJournal{
 readonly #prepared:GeneratedSchematicRelevanceSavedReadbackPlan;readonly #operation:TrackedDispatchOperationJournal;readonly #publication:GeneratedFixtureJournalPublication;
 #reserve:Promise<void>|null=null;#creationEntered=false;#created=false;#reserved=false;#busy=false;#owner:CurrentSchematicRelevanceSavedReadbackOwner|null=null;
 public constructor(prepared:GeneratedSchematicRelevanceSavedReadbackPlan){
  const original=requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(prepared);const operationId=`sch209-relevance-readback-${randomBytes(8).toString("hex")}`,time=new Date().toISOString();this.#prepared=prepared;
  const plan=freezeDeep({profile:"private.current-schematic-relevance-saved-readback-journal.v1",writerOperationId:original.data.operationId,target:original.data.target,sourceSqlLogicalSha256:original.closed.checkpoint.vacuumProjection.sourceLogicalSha256,nonce:randomBytes(32).toString("hex")});
  this.#operation={schema:OPERATION_SCHEMA,operationId,journalPath:operationPath(operationId),plan,planHash:buildPlanHash(plan),state:"prepared",mutationState:"schematic-saved-reader-intent",mutationMayHaveOccurred:false,hardStop:true,saved:false,reopened:false,orphanedCallPossible:false,createdAt:time,updatedAt:time,sequence:0,records:[],artifacts:[],nextSafeAction:"Keep this original saved schematic reader through exact cold/scene/closed proof or original resource cleanup; never replay."};
  this.#publication=new GeneratedFixtureJournalPublication(this.#operation,():void=>{this.#current();});originals.set(this,prepared);Object.freeze(this);
 }
 #current():void{need(originals.get(this)===this.#prepared&&originalJournalMethods(),"ORIGINAL");requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared);if(this.#owner!==null){assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(this.#owner);need(originalCurrentSchematicRelevanceSavedReadbackTarget(this.#owner)===this.#prepared,"OWNER");}}
 #records():readonly Entry[]{const records=assertCurrentSchematicRelevanceSavedReadbackJournalChain(this.#operation["records"]);need(records.length===this.#operation.sequence&&records.length===this.#operation.artifacts.length&&records.every(row=>row.operationId===this.#operation.operationId),"MANIFEST");return records;}
 public reserve():Promise<void>{if(this.#reserve!==null){return this.#reserve;}const pending=this.#exclusive(async():Promise<void>=>{this.#current();await ensureOperationStorage();await assertOperationIdUnused(this.#operation.operationId);this.#current();this.#creationEntered=true;await createOperation(this.#operation);this.#created=true;await this.#append("operation-intent",{writerOperationId:requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data.operationId});this.#reserved=true;});this.#reserve=pending;return pending;}
 public bindOwner(owner:CurrentSchematicRelevanceSavedReadbackOwner):void{this.#current();if(this.#owner===owner){return;}need(this.#reserved&&!this.#busy&&!this.#publication.pending()&&this.#owner===null,"BIND_ONCE");assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(owner);need(originalCurrentSchematicRelevanceSavedReadbackTarget(owner)===this.#prepared,"BIND_PLAN");this.#owner=owner;}
 public async assertCurrent():Promise<void>{this.#current();need(this.#created&&!this.#publication.pending(),"PUBLICATION_PENDING");const actual=await loadOperation(this.#operation.operationId);this.#current();need(canonicalJson(actual)===canonicalJson(this.#operation),"MANIFEST_CHANGED");this.#records();for(const artifact of this.#operation.artifacts){await verifyExactManagedArtifact(artifact);this.#current();}}
 async #append(kind:CurrentSchematicRelevanceSavedReadbackJournalKind,evidence:Readonly<Record<string,unknown>>):Promise<void>{
  const records=this.#records();const previous=records.at(-1);const raw=entrySchema.parse({schema:"private.current-schematic-relevance-saved-readback-record.v1",operationId:this.#operation.operationId,sequence:records.length+1,previousSha256:records.length===0?null:sha256Json(previous),kind,evidence,executionAuthorized:false});const entry=freezeDeep(raw);
  const next=[...records,entry];assertCurrentSchematicRelevanceSavedReadbackJournalChain(next);
  await this.#publication.change({records:next,state:terminal(kind)?"completed":"prepared",hardStop:!terminal(kind),...(kind==="invalidate-intent"||kind==="registration-intent"||kind==="opening-intent"?{mutationMayHaveOccurred:true,mutationState:`schematic-saved-${kind}`} :{}),...(kind==="complete-result"?{saved:true,reopened:true,mutationState:"schematic-saved-readback-accepted"}:{}),...(kind==="cleanup-complete"?{mutationState:"schematic-saved-reader-cleaned-without-acceptance"}:{})},{phase:kind,value:entry});
 }
 public append(kind:CurrentSchematicRelevanceSavedReadbackJournalKind,evidence:Readonly<Record<string,unknown>>):Promise<void>{return this.#exclusive(async():Promise<void>=>{need(this.#reserved,"RESERVATION");await this.assertCurrent();await this.#append(kind,evidence);});}
 public async settlePublication():Promise<void>{await this.#exclusive(async():Promise<void>=>{need(this.#creationEntered,"CREATION_REQUIRED");if(!this.#created){const actual=await loadOperation(this.#operation.operationId);this.#current();need(manifestCore(actual)===manifestCore(this.#operation),"CREATION_CHANGED");Object.assign(this.#operation,actual);this.#created=true;}await this.#publication.settle();if(this.#records().length===0){await this.#append("operation-intent",{writerOperationId:requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data.operationId});}this.#reserved=true;await this.assertCurrent();});}
 async #exclusive(work:()=>Promise<void>):Promise<void>{need(!this.#busy,"BUSY");this.#busy=true;try{await work();}finally{this.#busy=false;}}
 public retained():Readonly<{operationId:string;journalPath:string;reserved:boolean;publicationPending:boolean;busy:boolean;records:readonly Entry[]}>{this.#current();return freezeDeep({operationId:this.#operation.operationId,journalPath:this.#operation.journalPath,reserved:this.#reserved,publicationPending:this.#publication.pending(),busy:this.#busy,records:[...this.#records()]});}
 public requireOriginal(prepared:GeneratedSchematicRelevanceSavedReadbackPlan):void{this.#current();need(prepared===this.#prepared,"PLAN");}
}
const journalDescriptors=Object.getOwnPropertyDescriptors(CurrentSchematicRelevanceSavedReadbackJournal.prototype);
function originalJournalMethods():boolean{return Reflect.ownKeys(CurrentSchematicRelevanceSavedReadbackJournal.prototype).length===Reflect.ownKeys(journalDescriptors).length&&Object.entries(journalDescriptors).every(([name,before])=>{const actual=Object.getOwnPropertyDescriptor(CurrentSchematicRelevanceSavedReadbackJournal.prototype,name);return actual!==undefined&&actual.value===before.value&&actual.get===before.get&&actual.set===before.set&&actual.writable===before.writable&&actual.enumerable===before.enumerable&&actual.configurable===before.configurable;});}
export function assertOriginalCurrentSchematicRelevanceSavedReadbackJournal(journal:CurrentSchematicRelevanceSavedReadbackJournal,prepared:GeneratedSchematicRelevanceSavedReadbackPlan):void{need(originals.get(journal)===prepared&&originalJournalMethods()&&Object.getPrototypeOf(journal)===CurrentSchematicRelevanceSavedReadbackJournal.prototype&&Reflect.ownKeys(journal).length===0,"ORIGINAL_JOURNAL");journal.requireOriginal(prepared);}
