/** Original native DEL uploader/finalizer DAG. The actual controller supplies
 * every held packet and resume barrier; no data value creates either. Natural
 * sync and native Cache.delete have distinct original held-frame readers. */
import{z}from"zod";
import{sha256Text}from"./core.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SOURCE_ROLES as ROLES,currentFootprintInverseNativeDeleteDrainCall as call,validateCurrentFootprintInverseNativeDeleteDrainCommand as validate}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainCommand as Command,CurrentFootprintInverseNativeDeleteDrainKind as Kind}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as objectAt}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentProjectSaveProducerCachePromiseHandle as promiseHandle,decodeCurrentProjectSaveProducerCachePromise as promiseState}from"./current-project-save-producer-cache-replies.ts";
import type{CurrentFootprintInverseNativeDeleteLocalCompleted as Local}from"./current-footprint-inverse-native-delete-local-cursor.ts";
import type{CurrentFootprintSavedFlowCacheData as CacheData}from"./current-footprint-saved-flow-cache-data.ts";

type SourceRole=typeof ROLES[number];type CacheRole="headEntry"|"headPromise"|"headSuccess";type DeleteRole="cacheDeleteCall"|"cacheDeleteReturned";
export type CurrentFootprintInverseNativeDeleteDrainRole=SourceRole|CacheRole|DeleteRole;
export interface CurrentFootprintInverseNativeDeleteDrainHeld{
 readonly packet:object;readonly role:CurrentFootprintInverseNativeDeleteDrainRole;readonly joinedId:string;
 readonly key:string|null;readonly cache:Readonly<{role:"localSave"|"flow"|"syncHead";joinedId:string}>|null;
 readonly promise:Readonly<{objectId:string}>|null;readonly returnPromiseId:string|null;
}
export interface CurrentFootprintInverseNativeDeleteDrainBindings{
 readonly local:Local;readonly uploadCapture:string;readonly historyFrame:string;readonly body:string;readonly branchUuid:string;
 readonly reflection:string;readonly recipe:string;readonly dependencies:string;
 readonly assertCurrent:()=>Promise<void>;readonly requireHeld:(packet:object)=>CurrentFootprintInverseNativeDeleteDrainHeld;
 readonly historyResult:()=>Promise<Readonly<{historyUuid:string;bodySha256:string}>>;readonly liveData:()=>Promise<CacheData>;
 readonly postSyncProgress:()=>Readonly<{replayResumed:boolean;completed:boolean}>;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
 readonly resume:(held:CurrentFootprintInverseNativeDeleteDrainHeld,command:Command)=>Promise<void>;
 readonly continueDelete:(held:CurrentFootprintInverseNativeDeleteDrainHeld)=>Promise<void>;
 readonly complete:()=>Promise<void>;readonly fail:(cause:unknown)=>void;
}
/** Cursor-only bound. Frame/caller observation, recipe15, natural sync and
 * the separate four-command delete lane are deliberately outside this sum. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CURSOR_REQUESTS=Object.freeze({sourceAndCacheProofs:20,resumes:20,frameProperties:4,retainedReturns:3,promiseMetadata:18,cloudResultProofs:2,finalProofs:2,normal:69,helpers:27,total:96,settlementPasses:2,heldFrames:22});
const boolean=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.boolean()})}),yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const cloudField=z.strictObject({name:z.enum(["[[Prototype]]","[[PromiseState]]","[[PromiseResult]]"]),value:remote});
const cloudMetadata=z.strictObject({result:z.tuple([]),internalProperties:z.array(cloudField).length(3)});
type Arg=Readonly<{objectId:string}>|Readonly<{value:string|0}>;
interface Job{readonly role:"localSave"|"flow"|"head";readonly slot:0|1|2;key:string|null;entry:string|null;pending:string|null;stage:0|1|2|3}
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_DRAIN_${code}`);}}
export class CurrentFootprintInverseNativeDeleteDrainCursor{
 readonly #b:CurrentFootprintInverseNativeDeleteDrainBindings;readonly #attempts=new WeakSet<object>();readonly #done=new Set<CurrentFootprintInverseNativeDeleteDrainRole>();readonly #frames=new Map<SourceRole,string>();
 readonly #jobs:readonly Job[]=[{role:"localSave",slot:0,key:null,entry:null,pending:null,stage:0},{role:"flow",slot:1,key:null,entry:null,pending:null,stage:0},{role:"head",slot:2,key:null,entry:null,pending:null,stage:0}];
 readonly #promises=new Map<number,string>();#capture:string|null=null;#historyUuid:string|null=null;#live:CacheData|null=null;
 #normal=0;#helpers=0;#resumes=0;#events=0;#passes=0;#busy=false;#failed=false;#failure:unknown;#completed=false;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteDrainBindings){this.#b=Object.freeze({...bindings});this.#promises.set(3,bindings.local.bufferPromise);Object.freeze(this);}
 async #current():Promise<void>{if(this.#failed){throw this.#failure;}await this.#b.assertCurrent();if(this.#failed){throw this.#failure;}}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;try{this.#b.fail(cause);}catch{
 // Failure handoff cannot replace the retained original cause or strand its join.
 }}}
 async #send(input:Command):Promise<unknown>{await this.#current();const c=validate(input);need((this.#normal+=1)<=69,"NORMAL_BOUND");const value=capture(await this.#b.request(c)).value;await this.#current();if(c.method==="Runtime.callFunctionOn"){need((this.#helpers+=1)<=27,"HELPER_BOUND");await this.#b.qualifyHelper(c);await this.#current();}return value;}
 #call(kind:Kind,role:string,objectId:string,args:readonly Arg[],slot=0,pass=0):Promise<unknown>{return this.#send(call(kind,role,objectId,args,slot,pass));}
 #properties(role:"replyFrame"|"capture"|"queued"|"cloudFrame"|"settled",objectId:string,slot=0,pass=0):Promise<unknown>{return this.#send({phase:"inverse-native-delete-drain-properties",role,slot,pass,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 #refs():readonly Arg[]{return[this.#b.reflection,this.#b.recipe,this.#b.dependencies].map(objectId=>({objectId}));}
 #frame(role:SourceRole):string{const frame=this.#frames.get(role);need(frame!==undefined,"FRAME");return frame;}
 #original():string{need(this.#capture!==null,"CAPTURE");return this.#capture;}
 #prerequisite(role:CurrentFootprintInverseNativeDeleteDrainRole):void{
  const has=(name:CurrentFootprintInverseNativeDeleteDrainRole):boolean=>this.#done.has(name);
  if(role==="historyReply"){need(this.#done.size===0,"FIRST_REPLY");return;}need(has("historyReply"),"ORIGINAL_REPLY");
  if(role==="syncEntry"){need(has("detachedEntry")&&(this.#jobs[0]?.stage??0)>=2,"LOCAL_SAVE_STARTED");}
  if(role==="syncDeferred"){need(has("syncEntry"),"SYNC_ENTRY");}if(role==="historyQueued"){need(has("syncDeferred"),"SYNC_DEFERRED");}
  if(role==="historyFinally"||role==="cloudReturned"){need(has("historyQueued"),"HISTORY_QUEUED");}if(role==="cloudFinally"){need(has("cloudReturned"),"CLOUD_RETURNED");}
  if(role==="batchReturned"){need(has("cloudFinally"),"CLOUD_FINALLY");}if(role==="bufferDone"){need(has("batchReturned"),"BATCH_RETURNED");}
  if(role==="cacheDeleteCall"){need(has("detachedEntry")&&this.#jobs[0]?.stage===3,"LOCAL_SAVE_COMPLETE");}
  if(role==="cacheDeleteReturned"){need(has("cacheDeleteCall"),"DELETE_CALL");}if(role==="detachedReturned"){need(has("cacheDeleteReturned"),"DELETE_RETURN");}
 }
 async #captureReply(held:CurrentFootprintInverseNativeDeleteDrainHeld):Promise<void>{
  const effect=await this.#b.historyResult();await this.#current();need(effect.bodySha256===sha256Text(this.#b.body)&&/^[a-f\d]{32}$/u.test(effect.historyUuid),"ORIGINAL_MAIN_RESULT");this.#historyUuid=effect.historyUuid;
  const fields=array(await this.#properties("replyFrame",held.joinedId),9),response=fields.get("8");need(response?.type==="object"&&response.className==="Object"&&response.subtype===undefined&&response.objectId!==undefined,"REPLY_OBJECT");
  const args:Arg[]=[held.joinedId,this.#b.uploadCapture,this.#b.historyFrame,this.#b.local.cacheFrame,response.objectId].map(objectId=>({objectId}));args.push({value:effect.historyUuid},...this.#refs());
  this.#capture=arrayCapture(await this.#call("drain","capture",held.joinedId,args),7);
  const original=array(await this.#properties("capture",this.#capture),7);const cloud=original.get("6");need(cloud?.type==="object"&&cloud.subtype==="promise"&&cloud.className==="Promise"&&cloud.description==="Promise","CLOUD_PROMISE");this.#promises.set(6,objectAt(original,6));
 }
 async #source(held:CurrentFootprintInverseNativeDeleteDrainHeld):Promise<void>{
  const role=held.role;this.#prerequisite(role);need(!this.#done.has(role),"ROLE_ONCE");
  if(role==="cacheDeleteCall"||role==="cacheDeleteReturned"){await this.#b.continueDelete(held);await this.#current();return;}
  need(role!=="headEntry"&&role!=="headPromise"&&role!=="headSuccess","SOURCE_ROLE");this.#frames.set(role,held.joinedId);
  if(role==="historyReply"){await this.#captureReply(held);}else{
   const args:Arg[]=[{objectId:held.joinedId},{objectId:this.#original()}];
   if(role==="syncDeferred"){args.push({objectId:this.#frame("syncEntry")});}if(role==="historyFinally"){args.push({objectId:this.#frame("historyQueued")});}
   if(role==="cloudFinally"){args.push({objectId:this.#frame("cloudReturned")});}if(role==="detachedReturned"){args.push({objectId:this.#frame("detachedEntry")});}
   if(role==="cloudReturned"){const fields=array(await this.#properties("cloudFrame",held.joinedId),8),value=fields.get("7");need(value?.type==="object"&&value.className==="Object"&&value.subtype===undefined&&value.objectId!==undefined,"CLOUD_RESULT");args.push({objectId:value.objectId});}
   args.push(...this.#refs());yes.parse(await this.#call("drain",role,held.joinedId,args));
   if(role==="historyQueued"){const fields=array(await this.#properties("queued",held.joinedId),10),promise=fields.get("9");need(promise?.type==="object"&&promise.subtype==="promise"&&promise.className==="Promise"&&promise.description==="Promise","DEFERRED_PROMISE");this.#promises.set(7,objectAt(fields,9));}
   if(role==="bufferDone"||role==="batchReturned"||role==="detachedReturned"){need(held.returnPromiseId!==null,"ORIGINAL_RETURN");const slots={bufferDone:4,batchReturned:5,detachedReturned:8}as const;const slot=slots[role];const value=z.strictObject({result:z.unknown()}).parse(await this.#call("retain","promise",held.returnPromiseId,[],slot));this.#promises.set(slot,promiseHandle(value.result));}
  }
  await this.#resume(held,0);
 }
 async #cacheData():Promise<CacheData>{need(this.#done.has("cloudFinally")&&this.#b.postSyncProgress().replayResumed,"ORIGINAL_REPLAY");const data=await this.#b.liveData();await this.#current();need(data.headHistoryUuid===this.#historyUuid&&data.branchUuid===this.#b.branchUuid,"CACHE_RESULT");if(this.#live!==null){need(this.#live===data,"SAME_CACHE_RESULT");}this.#live=data;return data;}
 async #cache(held:CurrentFootprintInverseNativeDeleteDrainHeld):Promise<void>{
  need(held.key!==null,"CACHE_KEY");let job:Job|undefined;
  if(held.role==="headEntry"){
   need(held.cache!==null,"CACHE_ENTRY");const selected=held.cache.role==="syncHead"?"head":held.cache.role;job=this.#jobs.find(row=>row.role===selected);need(job!==undefined&&job.stage===0,"CACHE_JOB_ONCE");job.key=held.key;job.entry=held.cache.joinedId;
   let args:Arg[]=[{objectId:job.entry},{objectId:this.#original()},{value:held.key},{value:this.#b.body}];
   if(job.role==="localSave"){need(this.#done.has("detachedEntry"),"DETACHED_ENTRY");}
   else{const data=await this.#cacheData();if(job.role==="flow"){const bodies=data.bodies.filter(row=>row.historyUuid===data.headHistoryUuid&&row.ordinal===0&&row.url===`https://client/dataStr/${data.headHistoryUuid}-FOOTPRINT`),body=bodies[0];need(bodies.length===1&&body!==undefined&&body.body===this.#b.body&&held.key===body.url,"ONE_TOMBSTONE_BODY");args=[{objectId:job.entry},{objectId:this.#original()},{value:body.url},{value:body.body},{value:data.headHistoryUuid},{value:"FOOTPRINT"},{value:0}];}
    else{need((this.#jobs[1]?.stage??0)>=2&&held.key===data.headIndex.url,"FLOW_BEFORE_INDEX");args=[{objectId:job.entry},{objectId:this.#original()},{value:data.headIndex.url},{value:data.headIndex.body}];}}
   args.push(...this.#refs());yes.parse(await this.#call("cache",job.role,job.entry,args,job.slot));
  }else{job=this.#jobs.find(row=>row.key===held.key);need(job!==undefined&&job.entry!==null,"ORIGINAL_CACHE_JOB");
   if(held.role==="headPromise"){need(job.stage===1&&held.promise!==null,"ORIGINAL_CACHE_PROMISE");job.pending=held.joinedId;this.#promises.set(job.slot,held.promise.objectId);yes.parse(await this.#call("cache","headPromise",held.joinedId,[{objectId:held.joinedId},{objectId:this.#original()},{objectId:job.entry},...this.#refs()],job.slot));}
   else{need(held.role==="headSuccess"&&job.stage===2&&job.pending!==null,"ORIGINAL_CACHE_SUCCESS");yes.parse(await this.#call("cache","headSuccess",held.joinedId,[{objectId:held.joinedId},{objectId:this.#original()},{objectId:job.entry},{objectId:job.pending},...this.#refs()],job.slot));}
  }
  await this.#resume(held,job.slot);need(job.stage<3,"CACHE_STAGE_BOUND");job.stage+=1;
 }
 async #resume(held:CurrentFootprintInverseNativeDeleteDrainHeld,slot:number):Promise<void>{need(held.role!=="cacheDeleteCall"&&held.role!=="cacheDeleteReturned","SEPARATE_DELETE");await this.#current();need(this.#b.requireHeld(held.packet)===held&&(this.#normal+=1)<=69,"ORIGINAL_RESUME");await this.#b.resume(held,validate({phase:"inverse-native-delete-drain-resume",role:held.role,slot,method:"Debugger.resume",params:{}}));await this.#current();}
 #ready():boolean{return ROLES.every(role=>this.#done.has(role))&&this.#done.has("cacheDeleteCall")&&this.#done.has("cacheDeleteReturned")&&this.#jobs.every(job=>job.stage===3)&&this.#b.postSyncProgress().completed;}
 public async continue(packet:object):Promise<void>{need(!this.#busy&&!this.#failed&&!this.#completed&&!this.#attempts.has(packet),"ONE_ORIGINAL_ATTEMPT");this.#attempts.add(packet);this.#busy=true;
  try{const held=this.#b.requireHeld(packet);need(held.packet===packet&&(this.#events+=1)<=22,"HELD_FRAME_BOUND");await this.#current();need(this.#b.requireHeld(packet)===held,"CURRENT_HELD");
   if(held.role==="headEntry"||held.role==="headPromise"||held.role==="headSuccess"){need(this.#done.has("historyReply"),"CACHE_AFTER_REPLY");await this.#cache(held);}else{await this.#source(held);this.#done.add(held.role);}this.#resumes+=1;if(this.#ready()){await this.#settle();}
  }catch(error){this.#fail(error);throw error;}finally{this.#busy=false;}}
 async #settle():Promise<void>{need(this.#ready()&&this.#passes<2&&this.#promises.size===9,"SETTLEMENT_FRONTIER");this.#passes+=1;let fulfilled=true;
  for(let slot=0;slot<9;slot+=1){const objectId=this.#promises.get(slot);need(objectId!==undefined,"ORIGINAL_PROMISE");const metadata=await this.#properties("settled",objectId,slot,this.#passes);
   if(slot===6){const fields=new Map(cloudMetadata.parse(metadata).internalProperties.map(row=>[row.name,row.value])),parent=fields.get("[[Prototype]]"),result=fields.get("[[PromiseResult]]"),state=fields.get("[[PromiseState]]");need(fields.size===3&&parent?.type==="object"&&parent.className==="Promise"&&parent.objectId!==undefined&&state?.type==="string","CLOUD_METADATA");
    if(state.value==="pending"){need(result?.type==="undefined","PENDING_CLOUD_RESULT");fulfilled=false;}else{need(state.value==="fulfilled"&&result?.type==="object"&&result.className==="Object"&&result.subtype===undefined&&result.objectId!==undefined,"FULFILLED_CLOUD_RESULT");yes.parse(await this.#call("drain","cloudResult",result.objectId,[{objectId:result.objectId},{objectId:this.#original()},{objectId:this.#frame("cloudReturned")},...this.#refs()],this.#passes-1,this.#passes));}}
   else{fulfilled=promiseState(metadata)==="fulfilled"&&fulfilled;}
  }
  if(fulfilled){const result=boolean.parse(await this.#call("drain","final",this.#original(),[{objectId:this.#original()},{objectId:this.#original()},...this.#refs()],0,this.#passes)).result.value;
   if(result){await this.#b.complete();await this.#current();this.#completed=true;}}
 }
 public async settle():Promise<void>{need(!this.#busy&&!this.#failed&&!this.#completed,"SETTLE_ONCE");this.#busy=true;try{await this.#settle();}catch(error){this.#fail(error);throw error;}finally{this.#busy=false;}}
 public requirePostHistorySyncEntry():void{need(!this.#busy&&!this.#failed&&!this.#completed&&["syncEntry","syncDeferred","historyQueued","cloudReturned","cloudFinally"].every(role=>this.#done.has(z.enum(ROLES).parse(role)))&&!this.#b.postSyncProgress().completed,"ORIGINAL_FULL_SYNC_FRONTIER");}
 public originalCapture():string{need(!this.#failed&&this.#done.has("historyReply"),"ORIGINAL_CAPTURE");return this.#original();}
 public progress():Readonly<{acknowledgedResumes:number;canSettle:boolean;completed:boolean;failed:boolean;settlementPasses:number;wholeInverseVerified:false}>{return Object.freeze({acknowledgedResumes:this.#resumes,canSettle:!this.#busy&&!this.#failed&&!this.#completed&&this.#ready()&&this.#passes<2,completed:this.#completed,failed:this.#failed,settlementPasses:this.#passes,wholeInverseVerified:false});}
 public requireCompleted():void{need(this.#completed&&!this.#failed,"COMPLETE");}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainCursor.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainCursor);
