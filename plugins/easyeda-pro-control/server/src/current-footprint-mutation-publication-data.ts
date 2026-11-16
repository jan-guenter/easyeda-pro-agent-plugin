/** Pure supplied-body parser census over immutable source. Exact parseFull
 * calls and publication upper bounds supply no actual native completion. */
import {Script} from "node:vm";
import {types} from "node:util";
import {z} from "zod";
import {sha256Text} from "./core.ts";
import {CURRENT_GENERATED_INITIAL_CACHE_SOURCE as INITIAL} from "./current-generated-initial-cache-source.ts";
import {CURRENT_FOOTPRINT_MUTATION_PUBLICATION_METHODS as METHODS,requireCurrentFootprintMutationPublicationSource} from "./current-footprint-mutation-publication-source.ts";
import type {CurrentFootprintMutationPublicationSource} from "./current-footprint-mutation-publication-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_MUTATION_PUBLICATION_DATA_LIMITS=Object.freeze({inputStrings:2,utf8Bytes:2_097_152});
const program=`(()=>{"use strict";const input=JSON.parse(payload),trace=[],console={error(){throw Error("MUTATION_BODY_PARSE");}};
${INITIAL.Gu.source};${INITIAL.Ro.source};
const manager={throwError:true,onEnd(){},onEditHead(){},onDocHead(doc,editHead,raw){trace.push({kind:"head",doc,editHead:editHead??null,raw});},onLine(id,ticket,data,type,client,docType,docUuid,firstTicket,pend,editHead,num,raw){trace.push({kind:"line",id,ticket,data,type,client,docType,docUuid,firstTicketPresent:firstTicket!==undefined,firstTicket:firstTicket??null,pendPresent:pend!==undefined,pend:pend??null,editHead:editHead??null,numPresent:num!==undefined,num:num??null,raw});},${METHODS["zy.parseFull"].source}};
manager.parseFull(input.join("|\\n"));return JSON.stringify(trace);
})()`;
const parser=new Script(program,{filename:"current-footprint-mutation-publication-data.js"});
export const CURRENT_FOOTPRINT_MUTATION_PUBLICATION_PROJECTION_SHA256=sha256Text(program);
const uuid=z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const client=z.string().regex(/^[a-f\d]{16}$/u);
const integer=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(n=>!Object.is(n,-0));
const text=z.string().max(2_097_152).refine(s=>s.isWellFormed());
const type=z.string().regex(/^[A-Z][A-Z\d_]{0,63}$/u);
const editHead=z.json().nullable();
const head=z.strictObject({kind:z.literal("head"),doc:z.looseObject({uuid,docType:z.literal("FOOTPRINT"),client,ticket:integer}),editHead,raw:text});
const line=z.strictObject({kind:z.literal("line"),id:z.string().min(1).max(256).refine(s=>s.isWellFormed()&&!s.includes("\0")),ticket:integer,data:text,type,client,docType:z.literal("FOOTPRINT"),docUuid:uuid,firstTicketPresent:z.boolean(),firstTicket:integer.nullable(),pendPresent:z.boolean(),pend:z.boolean().nullable(),editHead,numPresent:z.boolean(),num:z.number().nullable(),raw:text});
const traceSchema=z.array(z.discriminatedUnion("kind",[head,line])).min(2).max(2_097_152);
type TraceRow=z.infer<typeof traceSchema>[number];
export interface CurrentFootprintMutationPublicationData{
 readonly profile:"private.current-footprint-mutation-publication-data.v1";
 readonly projectionSourceSha256:string;readonly inputStringSha256:readonly string[];readonly inputStringUtf8Bytes:readonly number[];
 readonly joinedBodySha256:string;readonly joinedBodyUtf8Bytes:number;readonly inputStrings:1|2;
 readonly trace:readonly TraceRow[];readonly headCalls:number;readonly lineCalls:number;readonly documentUuids:readonly string[];readonly recordTypes:readonly string[];
 readonly headSubscriberCallUpperBound:number;readonly changeSubscriberCallUpperBound:number;readonly readyCallbackRunUpperBound:number;readonly readyCallbackHoldUpperBound:number;readonly readyFinalizerUpperBound:number;
 readonly suppliedBodyOnly:true;readonly originalCallbackRostersQualified:false;readonly actualPublicationCountVerified:false;readonly actualQueueCompleted:false;readonly originalNativeOwnershipVerified:false;readonly executionAuthorized:false;readonly completePublicationFrontierVerified:false;
}
const originals=new WeakSet<object>();
function need(value:boolean):asserts value{
if(!value){
throw new Error("FOOTPRINT_MUTATION_PUBLICATION_DATA");
}
}
/** Capture one/two primitive own strings without invoking accessors or Proxy
 * traps. The caller cannot select or supply executable projection source. */
function strings(input:unknown):readonly string[]{
 need(input!==null&&typeof input==="object"&&!types.isProxy(input)&&Array.isArray(input)&&Object.getPrototypeOf(input)===Array.prototype);
 const length=Object.getOwnPropertyDescriptor(input,"length");
need(length!==undefined&&Object.hasOwn(length,"value")&&(length.value===1||length.value===2));
 const n:unknown=length.value;
need(n===1||n===2);
need(Reflect.ownKeys(input).length===n+1);
const values:string[]=[];
 for(let index=0
;index<n;index+=1){
const d=Object.getOwnPropertyDescriptor(input,String(index));
need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="string");
const value:unknown=d.value;
need(typeof value==="string"&&value.length>0&&value.length<=2_097_152&&value.isWellFormed()&&!value.includes("\0"));
values.push(value);
}
 need(values.reduce((sum,value)=>sum+Buffer.byteLength(value),2*(n-1))<=2_097_152);
return Object.freeze(values);
}
/** Run fixed original source on inert supplied plaintext. Duplicate IDs and
 * older tickets stay ordered: suppression depends on the original baseline.
 *
 * With original one-head/one-change rosters, each DOCHEAD calls its subscriber
 * once. Each onLine can publishChange at most once: remoteChange returns from
 * its existing-node branch before reaching its new-node branch. Each change
 * subscriber calls uploadStructure once; Nd coalesces queued calls, so actual
 * callback runs/finalizers may be fewer than the raw onLine calls. */
export function deriveCurrentFootprintMutationPublicationData(source:CurrentFootprintMutationPublicationSource,input:unknown):CurrentFootprintMutationPublicationData{
 requireCurrentFootprintMutationPublicationSource(source);
const values=strings(input);
let raw:unknown;
 try{
raw=parser.runInNewContext(Object.freeze({payload:JSON.stringify(values)}),{timeout:1000,microtaskMode:"afterEvaluate",contextCodeGeneration:{strings:false,wasm:false}}) as unknown;
}
catch{
throw new Error("FOOTPRINT_MUTATION_PUBLICATION_PARSE");
}
 need(typeof raw==="string");
const decoded:unknown=JSON.parse(raw);
const trace=traceSchema.parse(decoded);
let heads=0;
let lines=0;
let active:TraceRow&{kind:"head"}|null=null;
const uuids=new Set<string>();
const typesSeen=new Set<string>();
 for(const row
 of trace){
if(row.kind==="head"){
heads+=1;
active=row;
uuids.add(row.doc.uuid);
need(heads<=2);
const at=row.raw.indexOf("||");
need(at>0);
const parsed:unknown=JSON.parse(row.raw.slice(0,at));
const actual=z.strictObject({type:z.literal("DOCHEAD"),ticket:integer}).parse(parsed);
need(actual.ticket===row.doc.ticket);
}
 else{
need(active!==null&&row.docUuid===active.doc.uuid&&row.docType===active.doc.docType&&row.firstTicketPresent===(row.firstTicket!==null)&&row.pendPresent===(row.pend!==null)&&row.numPresent===(row.num!==null));
need(!["DOCHEAD","EDIT_HEAD"].includes(row.type));
lines+=1;
typesSeen.add(row.type);
}
}
 need(heads>=1&&lines>=1);
const joined=values.join("|\n");
 const packet=freezeDeep({profile:"private.current-footprint-mutation-publication-data.v1",projectionSourceSha256:CURRENT_FOOTPRINT_MUTATION_PUBLICATION_PROJECTION_SHA256,inputStringSha256:values.map(value=>sha256Text(value)),inputStringUtf8Bytes:values.map(value=>Buffer.byteLength(value)),joinedBodySha256:sha256Text(joined),joinedBodyUtf8Bytes:Buffer.byteLength(joined),inputStrings:values.length===1?1:2,trace,headCalls:heads,lineCalls:lines,documentUuids:[...uuids],recordTypes:[...typesSeen].toSorted(),headSubscriberCallUpperBound:heads,changeSubscriberCallUpperBound:lines,readyCallbackRunUpperBound:lines,readyCallbackHoldUpperBound:3*lines,readyFinalizerUpperBound:lines,suppliedBodyOnly:true,originalCallbackRostersQualified:false,actualPublicationCountVerified:false,actualQueueCompleted:false,originalNativeOwnershipVerified:false,executionAuthorized:false,completePublicationFrontierVerified:false} as const);
 originals.add(packet);
return packet;
}
/** The same derived data packet still supplies no original observer, request,
 * callback, returned Promise, native owner or completion authority. */
export function requireCurrentFootprintMutationPublicationData(packet:CurrentFootprintMutationPublicationData):void{
need(originals.has(packet));
}
