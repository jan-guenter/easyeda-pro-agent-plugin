/** Inverse-only bounded cold-load comparison. Mixed-family parsed metadata
 * comes from the full pinned source projection; no PCB substitution is used. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbViaSavedLoadData } from "./current-pcb-via-saved-load-capture.ts";
import type { CurrentFootprintInverseColdLoadData } from "./current-footprint-inverse-cold-load-data.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";

const project=z.strictObject({uuid:z.string(),branchUuid:z.string().nullable(),isOpening:z.boolean(),isReady:z.boolean(),cacheName:z.string().optional(),localCacheName:z.string().optional()});
const fetched=z.strictObject({history:z.record(z.string(),z.unknown()),url:z.string().max(8192),snapshot:z.literal(true),debugUndefined:z.literal(false),bytes:z.array(z.number().int().min(0).max(255)).min(1).max(8192).optional(),plaintext:z.string().max(16_384).optional()});
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_COLD_PROGRESS");}}
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function object(value:unknown):Record<string,unknown>{need(record(value));return value;}
function exact(value:Record<string,unknown>,names:readonly string[]):void{need(Reflect.ownKeys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name)));}
function partial(actual:Record<string,unknown>,expected:Readonly<Record<string,string|number|null>>,final:Readonly<Record<string,unknown>>):void{
  need(Object.keys(actual).every(key=>Object.hasOwn(expected,key)||["editHead","docs","docIds"].includes(key)));
  const base=Object.fromEntries(Object.keys(expected).map(key=>{need(Object.hasOwn(actual,key));return[key,actual[key]];}));need(canonicalJson(base)===canonicalJson(expected));
  for(const key of ["editHead","docs","docIds"].filter(name=>Object.hasOwn(actual,name))){const values=actual[key];const all=final[key];need(Array.isArray(values)&&Array.isArray(all)&&values.length<=all.length);
    for(const[index,item]of values.entries()){if(!(record(item)&&Reflect.ownKeys(item).length===1&&Object.getOwnPropertyDescriptor(item,"schema")?.value==="private.saved-load-hole.v1")){need(canonicalJson(item)===canonicalJson(all[index]));}}}
}
export class CurrentFootprintInverseColdLoadProgress{
  readonly #data:CurrentFootprintInverseColdLoadData;readonly #chunks=new Map<string,number>();readonly #counts=new Map<CurrentPcbViaSavedLoadRole,number>();
  #stage:"branch"|"cold"|"histories"|"fetches"|"ready"|"complete"="branch";#failed=false;
  public constructor(data:CurrentFootprintInverseColdLoadData){captureCurrentPcbViaSavedLoadData(data);need(data.schema==="private.current-footprint-inverse-cold-load-data.v1"&&Object.isFrozen(data)&&data.chunks.length>0&&data.chunks.length<=8&&data.histories.length>0&&data.histories.length<=8&&new Set(data.chunks.map(row=>row.dataUuid)).size===data.chunks.length);this.#data=data;Object.freeze(this);}
  #project(input:unknown,role:CurrentPcbViaSavedLoadRole):void{const value=project.parse(input);const d=this.#data;need(value.uuid===d.projectUuid&&value.branchUuid===(role==="branch"?null:d.branchUuid)&&value.isOpening===(role!=="ready")&&value.isReady===(role==="ready"));if(role==="branch"){need(value.cacheName===undefined&&value.localCacheName===undefined);}else{need(value.cacheName===`project_${d.projectUuid}_v6`&&value.localCacheName===`localProject_${d.projectUuid}_v1`);}}
  public accept(role:CurrentPcbViaSavedLoadRole,input:unknown):void{need(!this.#failed);try{
    const read=["branch","cold","histories","fetchEntry","response","bytes","plaintext","parsed","ready"];need(read.includes(role));const count=(this.#counts.get(role)??0)+1;need(count<=(["fetchEntry","response","bytes","plaintext"].includes(role)?this.#data.chunks.length:1));this.#counts.set(role,count);
    const reply=object(captureCurrentPcbViaSavedLoadData(input));exact(reply,["result"]);const result=object(reply["result"]);exact(result,["type","value"]);need(result["type"]==="object");const value=object(result["value"]);
    if(role==="branch"){need(this.#stage==="branch");exact(value,["project","branchUuid","historyUuid"]);this.#project(value["project"],role);need(value["branchUuid"]===this.#data.branchUuid&&value["historyUuid"]===this.#data.headHistoryUuid);this.#stage="cold";return;}
    if(role==="cold"){need(this.#stage==="cold");exact(value,["project","emptyLocalIndex"]);this.#project(value["project"],role);need(value["emptyLocalIndex"]===true);this.#stage="histories";return;}
    if(role==="histories"||role==="parsed"){need(this.#stage===(role==="histories"?"histories":"fetches"));exact(value,["project","historyUuid","histories"]);this.#project(value["project"],role);need(value["historyUuid"]===this.#data.headHistoryUuid);
      if(role==="histories"){need(canonicalJson(value["histories"])===canonicalJson(this.#data.histories));this.#stage="fetches";}else{need(this.#chunks.size===this.#data.chunks.length&&[...this.#chunks.values()].every(stage=>stage===4)&&canonicalJson(value["histories"])===canonicalJson(this.#data.parsedHistories));this.#stage="ready";}return;}
    if(role==="ready"){need(this.#stage==="ready");exact(value,["project","histories"]);this.#project(value["project"],role);need(canonicalJson(value["histories"])===canonicalJson(this.#data.parsedHistories));this.#stage="complete";return;}
    need(this.#stage==="fetches");const valueFetch=fetched.parse(value);const chunk=this.#data.chunks.find(row=>row.fetchUrl===valueFetch.url);need(chunk!==undefined);const head=this.#data.histories.find(row=>row["uuid"]===chunk.historyUuid);const final=this.#data.parsedHistories.find(row=>row["uuid"]===chunk.historyUuid);need(head!==undefined&&final!==undefined);partial(valueFetch.history,head,final);
    const step=({fetchEntry:1,response:2,bytes:3,plaintext:4}as Partial<Record<CurrentPcbViaSavedLoadRole,number>>)[role]??0;need(step>0&&(this.#chunks.get(chunk.dataUuid)??0)===step-1);
    if(step<3){need(valueFetch.bytes===undefined&&valueFetch.plaintext===undefined);}else{need(valueFetch.bytes!==undefined);const bytes=Buffer.from(valueFetch.bytes);need(bytes.toString("base64")===chunk.dataBase64&&createHash("sha256").update(bytes).digest("hex")===chunk.cipherSha256);need(step===3?valueFetch.plaintext===undefined:valueFetch.plaintext===chunk.plaintext);}
    this.#chunks.set(chunk.dataUuid,step);
  }catch(error){this.#failed=true;throw error;}}
  public status():Readonly<{failed:boolean;complete:boolean;comparedNativeBodies:number;parserInputReceipts:number;nativeOwnershipVerified:false;completeProducerFrontierVerified:false}>{return Object.freeze({failed:this.#failed,complete:this.#stage==="complete",comparedNativeBodies:[...this.#chunks.values()].filter(stage=>stage===4).length,parserInputReceipts:this.#counts.get("plaintext")??0,nativeOwnershipVerified:false,completeProducerFrontierVerified:false});}
}
