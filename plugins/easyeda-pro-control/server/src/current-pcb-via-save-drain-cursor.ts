/** Original uploader tail with overlapping cache jobs and independent finalizers.
 * A data/cursor object cannot issue an owner, resume or completion token. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVE_DRAIN_FLAGS as FLAGS,CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS as REQUESTS,validateCurrentPcbViaSaveDrainCommand } from "./current-pcb-via-save-drain-protocol.ts";
import type { CurrentPcbViaSaveDrainCommand,CurrentPcbViaSaveDrainProgramRole,CurrentPcbViaSaveDrainRole } from "./current-pcb-via-save-drain-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_DRAIN_PROGRAMS as PROGRAMS } from "./current-pcb-via-save-drain-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE as RETAIN,currentProjectSaveProducerCachePromiseHandle,decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentPcbViaLocalUploadCompleted } from "./current-pcb-via-local-upload-cursor.ts";
import type { CurrentProjectLiveHistoryCacheData } from "./current-project-live-history-cache-data.ts";

export interface CurrentPcbViaSaveDrainHeld {readonly packet:object;readonly role:CurrentPcbViaSaveDrainRole;readonly joinedId:string;readonly key:string|null;readonly cache:Readonly<{role:string;joinedId:string}>|null;readonly promise:Readonly<{objectId:string}>|null;readonly returnPromiseId:string|null}
export interface CurrentPcbViaSaveDrainBindings {
  readonly local:CurrentPcbViaLocalUploadCompleted;readonly uploadCapture:string;readonly historyFrame:string;readonly body:string;readonly branchUuid:string;
  readonly assertCurrent:()=>Promise<void>;readonly requireHeld:(packet:object)=>CurrentPcbViaSaveDrainHeld;
  readonly historyResult:()=>Promise<Readonly<{historyUuid:string;bodySha256:string}>>;
  readonly liveData:()=>Promise<CurrentProjectLiveHistoryCacheData>;
  readonly postSyncProgress:()=>Readonly<{replayResumed:boolean;completed:boolean}>;
  readonly request:(command:CurrentPcbViaSaveDrainCommand)=>Promise<unknown>;
  readonly resume:(held:CurrentPcbViaSaveDrainHeld,command:CurrentPcbViaSaveDrainCommand)=>Promise<void>;
  /** The separately qualified original four-message delete lane owns its
   * exact packet, native Cache result, ACK and same Debugger.resumed event. */
  readonly continueDelete:(held:CurrentPcbViaSaveDrainHeld)=>Promise<void>;
  readonly complete:()=>Promise<void>;readonly fail:()=>void;
}
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const boolean=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.boolean()})});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.looseObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const cloudField=z.strictObject({name:z.enum(["[[Prototype]]","[[PromiseState]]","[[PromiseResult]]"]),value:remote});
const cloudMetadata=z.strictObject({result:z.tuple([]),internalProperties:z.array(cloudField).length(3)});
function need(v:boolean):asserts v{if(!v){throw new Error("VIA_DRAIN_ORIGINAL_DAG");}}
const normal=["historyReply","detachedEntry","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone","detachedReturned","cacheDeleteCall","cacheDeleteReturned"] as const;
type JobRole="localSave"|"flow"|"head";
interface Job {readonly role:JobRole;readonly slot:0|1|2;key:string|null;entry:string|null;pending:string|null;stage:0|1|2|3}
type Arg=Readonly<{objectId:string}>|Readonly<{value:string|0|1}>;
export class CurrentPcbViaSaveDrainCursor {
  readonly #binding:CurrentPcbViaSaveDrainBindings;readonly #attempts=new WeakSet<object>();readonly #done=new Set<CurrentPcbViaSaveDrainRole>();readonly #frames=new Map<CurrentPcbViaSaveDrainRole,string>();
  readonly #jobs:readonly Job[]=[{role:"localSave",slot:0,key:null,entry:null,pending:null,stage:0},{role:"flow",slot:1,key:null,entry:null,pending:null,stage:0},{role:"head",slot:2,key:null,entry:null,pending:null,stage:0}];
  readonly #promises=new Map<number,string>();#capture:string|null=null;#historyUuid:string|null=null;#live:CurrentProjectLiveHistoryCacheData|null=null;#requests=0;#events=0;#resumes=0;#passes=0;#busy=false;#failed=false;#completed=false;
  public constructor(binding:CurrentPcbViaSaveDrainBindings){this.#binding=binding;this.#promises.set(3,binding.local.bufferPromise);Object.freeze(this);}
  async #current():Promise<void>{need(!this.#failed);await this.#binding.assertCurrent();need(!this.#failed);}
  #refuse():void{if(!this.#failed){this.#failed=true;this.#binding.fail();}}
  async #send(input:CurrentPcbViaSaveDrainCommand):Promise<unknown>{const c=validateCurrentPcbViaSaveDrainCommand(input);await this.#current();this.#requests+=1;need(this.#requests<=REQUESTS.cdpRequests);const result=captureCurrentPcbStringClockReply(await this.#binding.request(c)).value;await this.#current();return result;}
  #call(role:CurrentPcbViaSaveDrainProgramRole,objectId:string,args:readonly Arg[],slot=0):Promise<unknown>{return this.#send({phase:"via-drain-call",role,slot,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId,returnByValue:!["capture","retain"].includes(role),functionDeclaration:role==="retain"?RETAIN:PROGRAMS[role],arguments:[...args]}});}
  #properties(role:"replyFrame"|"capture"|"queued"|"cloudFrame"|"settled",objectId:string,slot=0,pass=0):Promise<unknown>{return this.#send({phase:"via-drain-properties",role,slot,pass,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
  #frame(role:CurrentPcbViaSaveDrainRole):string{const f=this.#frames.get(role);need(f!==undefined);return f;}
  #original():string{need(this.#capture!==null);return this.#capture;}
  #prerequisite(role:CurrentPcbViaSaveDrainRole):void{
    const has=(name:CurrentPcbViaSaveDrainRole):boolean=>this.#done.has(name);
    if(role==="historyReply"){need(this.#done.size===0);return;}need(has("historyReply"));
    if(role==="syncEntry"){need(has("detachedEntry")&&this.#jobs[0]?.stage!==0&&this.#jobs[0]?.stage!==1);}
    if(role==="syncDeferred"){need(has("syncEntry"));}if(role==="historyQueued"){need(has("syncDeferred"));}
    if(role==="historyFinally"||role==="cloudReturned"){need(has("historyQueued"));}if(role==="cloudFinally"){need(has("cloudReturned"));}
    if(role==="batchReturned"){need(has("cloudFinally"));}if(role==="bufferDone"){need(has("batchReturned"));}
    if(role==="cacheDeleteCall"){need(has("detachedEntry")&&this.#jobs[0]?.stage===3);}if(role==="cacheDeleteReturned"){need(has("cacheDeleteCall"));}
    if(role==="detachedReturned"){need(has("cacheDeleteReturned"));}
  }
  async #captureReply(held:CurrentPcbViaSaveDrainHeld):Promise<void>{
    const effect=await this.#binding.historyResult();await this.#current();need(effect.bodySha256===sha256Text(this.#binding.body)&&/^[a-f\d]{32}$/u.test(effect.historyUuid));this.#historyUuid=effect.historyUuid;
    const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("replyFrame",held.joinedId),9),response=fields.get("8");need(response?.type==="object"&&response.className==="Object"&&response.subtype===undefined&&response.objectId!==undefined&&response.value===undefined);
    this.#capture=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#call("capture",held.joinedId,[{objectId:this.#binding.uploadCapture},{objectId:this.#binding.historyFrame},{objectId:this.#binding.local.cacheFrame},{objectId:response.objectId},{value:effect.historyUuid}]),7);
    const captured=decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("capture",this.#capture),7),cloud=captured.get("6");need(cloud?.type==="object"&&cloud.subtype==="promise"&&cloud.className==="Promise"&&cloud.description==="Promise");this.#promises.set(6,currentFootprintCopyClockRpcV2ArrayObject(captured,6));
  }
  async #source(held:CurrentPcbViaSaveDrainHeld):Promise<void>{
    const role=held.role;this.#prerequisite(role);need(!this.#done.has(role));this.#frames.set(role,held.joinedId);
    if(role==="cacheDeleteCall"||role==="cacheDeleteReturned"){await this.#binding.continueDelete(held);await this.#current();return;}
    if(role==="historyReply"){await this.#captureReply(held);}else{
      need(role!=="headEntry"&&role!=="headPromise"&&role!=="headSuccess");const args:Arg[]=[{objectId:this.#original()}];
      if(role==="syncDeferred"){args.push({objectId:this.#frame("syncEntry")});}if(role==="historyFinally"){args.push({objectId:this.#frame("historyQueued")});}if(role==="cloudFinally"){args.push({objectId:this.#frame("cloudReturned")});}if(role==="detachedReturned"){args.push({objectId:this.#frame("detachedEntry")});}
      if(role==="cloudReturned"){const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("cloudFrame",held.joinedId),8),value=fields.get("7");need(value?.type==="object"&&value.className==="Object"&&value.subtype===undefined&&value.objectId!==undefined);args.push({objectId:value.objectId});}
      yes.parse(await this.#call(role,held.joinedId,args));
      if(role==="historyQueued"){const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("queued",held.joinedId),10),promise=fields.get("9");need(promise?.type==="object"&&promise.subtype==="promise"&&promise.className==="Promise"&&promise.description==="Promise");this.#promises.set(7,currentFootprintCopyClockRpcV2ArrayObject(fields,9));}
      if(role==="bufferDone"||role==="batchReturned"||role==="detachedReturned"){need(held.returnPromiseId!==null);let slot=2;if(role==="bufferDone"){slot=0;}else if(role==="batchReturned"){slot=1;}const reply=z.strictObject({result:z.unknown()}).parse(await this.#call("retain",held.returnPromiseId,[],slot));this.#promises.set(slot===2?8:slot+4,currentProjectSaveProducerCachePromiseHandle(reply.result));}
    }
    await this.#resume(held,0);
  }
  async #liveData():Promise<CurrentProjectLiveHistoryCacheData>{
    need(this.#done.has("cloudFinally")&&this.#binding.postSyncProgress().replayResumed);const live=await this.#binding.liveData();await this.#current();need(live.historyUuid===this.#historyUuid&&live.branchUuid===this.#binding.branchUuid&&live.historyBodySha256===sha256Text(this.#binding.body)&&live.documents.length===1);if(this.#live!==null){need(this.#live===live);}this.#live=live;return live;
  }
  async #cache(held:CurrentPcbViaSaveDrainHeld):Promise<void>{
    need(held.key!==null);let job:Job|undefined;
    if(held.role==="headEntry"){need(held.cache!==null);const kind=held.cache.role;need(["localSave","flow","syncHead"].includes(kind));job=this.#jobs.find(j=>j.role===(kind==="syncHead"?"head":kind));need(job!==undefined&&job.stage===0);job.key=held.key;job.entry=held.cache.joinedId;
      let args:Arg[]=[{objectId:this.#original()},{value:held.key},{value:this.#binding.body}];
      if(job.role==="localSave"){need(this.#done.has("detachedEntry"));}else{const live=await this.#liveData();if(job.role==="flow"){const document=live.documents[0];need(document!==undefined&&held.key===document.url);args=[{objectId:this.#original()},{value:document.url},{value:document.body},{value:live.historyUuid},{value:document.documentUuid},{value:live.historyNum}];}else{need(this.#jobs[1]?.stage!==0&&this.#jobs[1]?.stage!==1&&held.key===live.headIndex.url);args=[{objectId:this.#original()},{value:live.headIndex.url},{value:live.headIndex.body}];}}
      yes.parse(await this.#call(job.role,job.entry,args,job.slot));
    }else{job=this.#jobs.find(j=>j.key===held.key);need(job!==undefined&&job.entry!==null);
      if(held.role==="headPromise"){need(job.stage===1&&held.promise!==null);job.pending=held.joinedId;this.#promises.set(job.slot,held.promise.objectId);yes.parse(await this.#call("headPromise",held.joinedId,[{objectId:job.entry}],job.slot));}
      else{need(held.role==="headSuccess"&&job.stage===2&&job.pending!==null);yes.parse(await this.#call("headSuccess",held.joinedId,[{objectId:job.entry},{objectId:job.pending}],job.slot));}
    }
    await this.#resume(held,job.slot);need(job.stage<3);job.stage+=1;
  }
  async #resume(held:CurrentPcbViaSaveDrainHeld,slot:number):Promise<void>{need(held.role!=="cacheDeleteCall"&&held.role!=="cacheDeleteReturned");await this.#current();need(this.#binding.requireHeld(held.packet)===held);this.#requests+=1;need(this.#requests<=REQUESTS.cdpRequests);await this.#binding.resume(held,validateCurrentPcbViaSaveDrainCommand({phase:"via-drain-resume",role:held.role,slot,method:"Debugger.resume",params:{}}));await this.#current();}
  #ready():boolean{return normal.every(r=>this.#done.has(r))&&this.#jobs.every(j=>j.stage===3)&&this.#binding.postSyncProgress().completed;}
  public async continue(packet:object):Promise<void>{need(!this.#busy&&!this.#failed&&!this.#completed&&!this.#attempts.has(packet));this.#attempts.add(packet);this.#busy=true;
    try{const held=this.#binding.requireHeld(packet);need(held.packet===packet);await this.#current();this.#events+=1;need(this.#events<=REQUESTS.events);if(held.role==="headEntry"||held.role==="headPromise"||held.role==="headSuccess"){need(this.#done.has("historyReply"));await this.#cache(held);}else{await this.#source(held);this.#done.add(held.role);}this.#resumes+=1;if(this.#ready()){await this.#settle();}}
    catch(error){this.#refuse();throw error;}finally{this.#busy=false;}}
  async #settle():Promise<void>{need(this.#ready()&&this.#passes<2&&this.#promises.size===9);this.#passes+=1;let fulfilled=true;
    for(let slot=0;slot<9;slot+=1){const objectId=this.#promises.get(slot);need(objectId!==undefined);const metadata=await this.#properties("settled",objectId,slot,this.#passes);
      if(slot===6){const fields=new Map(cloudMetadata.parse(metadata).internalProperties.map(f=>[f.name,f.value]));need(fields.size===3);const state=fields.get("[[PromiseState]]");const result=fields.get("[[PromiseResult]]");const parent=fields.get("[[Prototype]]");need(parent?.type==="object"&&parent.className==="Promise"&&parent.objectId!==undefined&&state?.type==="string");
        if(state.value==="pending"){need(result?.type==="undefined");fulfilled=false;}else{need(state.value==="fulfilled"&&result?.type==="object"&&result.className==="Object"&&result.subtype===undefined&&result.objectId!==undefined);yes.parse(await this.#call("cloudResult",result.objectId,[{objectId:this.#original()},{objectId:this.#frame("cloudReturned")}],this.#passes-1));}}else{const state=decodeCurrentProjectSaveProducerCachePromise(metadata);fulfilled&&=state==="fulfilled";}
    }
    if(fulfilled){const ready=boolean.parse(await this.#call("final",this.#original(),[{objectId:this.#original()}])).result.value;if(ready){await this.#binding.complete();await this.#current();this.#completed=true;}}
  }
  public async settle():Promise<void>{need(!this.#busy&&!this.#failed&&!this.#completed);this.#busy=true;try{await this.#settle();}catch(error){this.#refuse();throw error;}finally{this.#busy=false;}}
  /** Core must additionally consume its actual full-sync origin/latch once.
   * This proves the first deferred return and original cloud-finally resume. */
  public requirePostHistorySyncEntry():void{need(!this.#busy&&!this.#failed&&!this.#completed&&this.#done.has("syncEntry")&&this.#done.has("syncDeferred")&&this.#done.has("historyQueued")&&this.#done.has("cloudReturned")&&this.#done.has("cloudFinally")&&!this.#binding.postSyncProgress().completed);}
  public progress():Readonly<{acknowledgedResumes:number;allCallsResumed:boolean;deferredSyncCompleted:boolean;cloudFinallyResumed:boolean;postHistorySyncExpected:boolean;canSettle:boolean;settlementPasses:number;completed:boolean;failed:boolean}>{const ready=this.#ready();return Object.freeze({acknowledgedResumes:this.#resumes,allCallsResumed:normal.every(r=>this.#done.has(r))&&this.#jobs.every(j=>j.stage===3),deferredSyncCompleted:this.#done.has("syncDeferred"),cloudFinallyResumed:this.#done.has("cloudFinally"),postHistorySyncExpected:!this.#failed&&!this.#completed&&this.#done.has("cloudFinally")&&!this.#binding.postSyncProgress().completed,canSettle:!this.#busy&&!this.#failed&&!this.#completed&&ready&&this.#passes<2,settlementPasses:this.#passes,completed:this.#completed,failed:this.#failed});}
  public requireCompleted():void{need(this.#completed&&!this.#failed);}
}
