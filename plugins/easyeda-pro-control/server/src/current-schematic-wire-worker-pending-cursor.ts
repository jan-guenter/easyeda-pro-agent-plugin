/** The original held batch body has one before/after data comparison.
 * No supplied frame, baseline or renderer packet issues native worker ownership. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CurrentSchematicWireWorkerPendingCensus as Census, wireWorkerPendingRef as ref, wireWorkerPendingFieldValue as value } from "./current-schematic-wire-worker-pending-census.ts";
import type { CurrentSchematicWireWorkerPendingFields as Fields } from "./current-schematic-wire-worker-pending-census.ts";
import { consumeCurrentSchematicWirePendingBatchData as consume } from "./current-schematic-wire-pending-batch-cursor.ts";
import type { CurrentSchematicWirePendingBatchData } from "./current-schematic-wire-pending-batch-cursor.ts";
import { currentSchematicWirePublicationValueSchema as publication, sameCurrentSchematicWirePublicationBody as sameBody } from "./current-schematic-wire-publication-values.ts";
import { CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_REQUESTS as LIMIT, validateCurrentSchematicWireWorkerPendingCommand as validate } from "./current-schematic-wire-worker-pending-protocol.ts";
import type { CurrentSchematicWireWorkerPendingCommand as Command } from "./current-schematic-wire-worker-pending-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().min(1).max(16_384).refine(v=>v.isWellFormed()&&Buffer.byteLength(v)<=16_384);
const baselineRow = z.strictObject({ page:text,id:text,type:z.enum(["META","WIRE","LINE","ATTR","BUS","BUSLINE","TEXT"]),body:text,client:text,ticket:z.number().int().positive().max(Number.MAX_SAFE_INTEGER-1) }).readonly();
const baseline = z.array(baselineRow).length(8).readonly();
type Baseline = z.infer<typeof baseline>;
const beforeValue = z.array(z.tuple([text,text,text,text,text,z.number().int().positive()])).length(8);
const identitySchema = z.tuple([text,text,text]);
const publicationRows = z.array(publication).length(3);
const beforeValuesSchema = z.tuple([beforeValue,identitySchema,publicationRows]);
const beforeReply = z.strictObject({result:z.strictObject({type:z.literal("object"),value:beforeValuesSchema})});
const versionSchema = z.tuple([text,z.number().int().positive(),z.enum(["WIRE","LINE","ATTR"]),text,z.literal(true),text]);
const afterValuesSchema = z.tuple([publicationRows,z.array(versionSchema).length(3)]);
const afterReply = z.strictObject({result:z.strictObject({type:z.literal("object"),value:afterValuesSchema})});
function need(condition:boolean): asserts condition { if(!condition){throw new Error("SCHEMATIC_WIRE_WORKER_PENDING_CURSOR");} }
function props(objectId:string):Command{return validate({phase:"wire-worker-pending-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[]):Command{const row=CALLS[role];need(refs.length===row.refs);return validate({phase:"wire-worker-pending-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});}
function frame(callFrameId:string):Command{return validate({phase:"wire-worker-pending-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression:"[this,s]",returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireWorkerPendingData {
 readonly schema:"private.schematic-wire-worker-pending-comparison-data.v1";readonly stage:"before"|"after";readonly snapshot:string|null;
 readonly originalThreeExistingNodesCompared:true;readonly threePendingHeadsCompared:boolean;readonly priorHeadsAndOrderNumbersPreservedCompared:boolean;readonly unchangedMapMembershipCompared:boolean;
 readonly suppliedObservationsOnly:true;readonly originalEventJoined:false;readonly nativeWorkerProvenanceVerified:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly saveAuthorized:false;
}
type First=Readonly<{stage:"before";frame:string;native:string;projectUuid:string;baseline:Baseline;renderer:CurrentSchematicWirePendingBatchData}>;
export type CurrentSchematicWireWorkerPendingInput=First|Readonly<{stage:"after";frame:string;previous:CurrentSchematicWireWorkerPendingData}>;
interface Stored{readonly first:First;readonly publication:ReturnType<typeof consume>;readonly snapshot:string}
const issued=new WeakMap<CurrentSchematicWireWorkerPendingData,Stored>();const spent=new WeakSet<CurrentSchematicWireWorkerPendingData>();

function* graph(census:Census,captured:string,native:string):Generator<Command,Readonly<{project:Fields;tables:string}>,unknown>{
 const cells=yield* census.array(captured,2);const project=yield* census.field(cells,"0");const cm=yield* census.field(project,"consistencyManager");const message=yield* census.array(ref(cells,"1","array"),4);
 const cache=yield* census.field(message,"0");const page=value(message,"3");need(page.type==="string"&&typeof page.value==="string");const row=yield* census.field(cache,page.value);const pending=yield* census.array(ref(row,"pend","array"),3);
 for(let i=0;i<3;i += 1){yield* census.array(ref(pending,String(i),"array"),4);}
 for(const key of ["tempLocalIds","docMaxTicket"]){yield* census.field(cm,key);}
 for(const key of ["cacheType","needDocIdDoctype"]){yield* census.read(ref(cm,key,"array"),"array");}
 yield* census.field(cm,"caseInsensitiveTypes","set");
 const heads=yield* census.field(cm,"docHead");need(heads.size===2);for(const key of heads.keys()){yield* census.field(heads,key);}
 const order=yield* census.field(cm,"orderTree");const numbers=yield* census.field(order,"numSets");need(numbers.size > 0&&numbers.size<=2);
 for(const key of numbers.keys()){const num=yield* census.field(numbers,key);yield* census.field(num,"orderLists");yield* census.field(num,"maxNum");}
 const ids=yield* census.field(cm,"uniqueIds");need(ids.size<=4);
 for(const key of ids.keys()){const namespace=yield* census.field(ids,key);need(namespace.size<=2);for(const uuid of namespace.keys()){yield* census.field(namespace,uuid,"set");}}
 const docs=ref(cm,"wDocData","map");yield* census.read(docs,"map");const outer=tuple(yield call("map",docs,[native]),2);const outerRows=yield* census.array(outer,2);const tables:string[]=[outer];
 for(let i=0;i<2;i += 1){const pair=yield* census.array(ref(outerRows,String(i),"array"),2);const map=ref(pair,"1","map");yield* census.read(map,"map");const records=tuple(yield call("map",map,[native]),value(pair,"0").value===page.value?7:1);const recordsRows=yield* census.read(records,"array");const count=value(recordsRows,"length");need(count.type==="number"&&(count.value===1||count.value===7));tables.push(records);
  for(let j=0;j<count.value;j += 1){const item=yield* census.array(ref(recordsRows,String(j),"array"),2);const node=yield* census.field(item,"1");yield* census.field(node,"last");if(node.has("list")){const list=yield* census.array(ref(node,"list","array"),1);yield* census.field(list,"0");}}
 }
 need(tables.length===3);const packed=tuple(yield call("tables",captured,[native,...tables]),3);yield* census.array(packed,3);return Object.freeze({project,tables:packed});
}
export class CurrentSchematicWireWorkerPendingCursor {
 readonly #plan:Generator<Command,CurrentSchematicWireWorkerPendingData,unknown>;readonly #maximum:number;#pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireWorkerPendingData|null=null;readonly #packets:unknown[]=[];
 public constructor(input:CurrentSchematicWireWorkerPendingInput){let first:First;let original:Stored|null=null;if(input.stage==="before"){first=Object.freeze({...input,baseline:baseline.parse(input.baseline)});handle.parse(first.native);text.max(128).parse(first.projectUuid);original=Object.freeze({first,publication:consume(input.renderer),snapshot:""});}else{const before=issued.get(input.previous);need(before!==undefined&&!spent.has(input.previous)&&input.previous.stage==="before");spent.add(input.previous);first=before.first;original=before;}handle.parse(input.frame);if(input.stage==="before"){const published=original.publication;capture({result:{type:"object",value:[published.values,published.values.map(row=>[published.client,row[1],row[2],row[3],true,published.unique])]}});}this.#maximum=input.stage==="before"?LIMIT.before:LIMIT.after;this.#plan=CurrentSchematicWireWorkerPendingCursor.collect(input,first,original);Object.freeze(this);}
 private static *collect(input:CurrentSchematicWireWorkerPendingInput,first:First,original:Stored):Generator<Command,CurrentSchematicWireWorkerPendingData,unknown>{
  const census=new Census(128);const captured=tuple(yield frame(input.frame),2);const current=yield* graph(census,captured,first.native);const uuid=value(current.project,"uuid");need(uuid.type==="string"&&uuid.value===first.projectUuid);
  const refs=[...census.approved];while(refs.length<LIMIT.approvedSlots){refs.push(first.native);}const approved=tuple(yield call("approved",captured,[first.native,...refs]),LIMIT.approvedSlots);let snapshot:string|null=null;
  if(input.stage==="before"){snapshot=tuple(yield call("before",captured,[first.native,approved,current.tables]),13);array(yield props(snapshot),13);const capturedValues=beforeReply.parse(yield call("values",snapshot,[first.native])).result.value;const rows=capturedValues[0];const identity=capturedValues[1];const published=capturedValues[2];const wanted=original.publication;need(identity[0]===wanted.page&&identity[1]===wanted.client&&identity[2]===wanted.unique);for(let i=0;i<3;i += 1){const actual=published[i];const expected=wanted.values[i];need(actual!==undefined&&expected!==undefined&&actual.every((v,j)=>v===expected[j]));}for(const actual of rows){const expected=first.baseline.find(v=>v.page===actual?.[0]&&v.id===actual[1]);need(actual!==undefined&&expected!==undefined&&actual[0]===expected.page&&actual[1]===expected.id&&actual[2]===expected.type&&sameBody(actual[3],expected.body)&&actual[4]===expected.client&&actual[5]===expected.ticket);}}
  else{const rows=afterReply.parse(yield call("after",captured,[first.native,approved,current.tables,original.snapshot])).result.value;const wanted=original.publication;for(let i=0;i<3;i += 1){const actual=rows[0][i];const expected=wanted.values[i];const version=rows[1][i];need(actual!==undefined&&expected!==undefined&&version!==undefined&&actual.every((v,j)=>v===expected[j])&&version[0]===wanted.client&&version[1]===expected[1]&&version[2]===expected[2]&&version[3]===expected[3]&&version[5]===wanted.unique);}}
  const data:CurrentSchematicWireWorkerPendingData=Object.freeze({schema:"private.schematic-wire-worker-pending-comparison-data.v1",stage:input.stage,snapshot,originalThreeExistingNodesCompared:true,threePendingHeadsCompared:input.stage==="after",priorHeadsAndOrderNumbersPreservedCompared:input.stage==="after",unchangedMapMembershipCompared:input.stage==="after",suppliedObservationsOnly:true,originalEventJoined:false,nativeWorkerProvenanceVerified:false,workerCompleted:false,modifyCompleted:false,saveAuthorized:false});if(snapshot!==null){issued.set(data,Object.freeze({first,publication:original.publication,snapshot}));}return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const step=this.#plan.next();need(step.done!==true);this.#pending=step.value;return step.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending!==null&&command===this.#pending&&this.#reads<this.#maximum);this.#reserved=true;this.#reads += 1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{const captured=capture(raw).value;this.#packets.push(captured);const step=this.#plan.next(captured);this.#pending=null;this.#reserved=false;if(step.done===true){this.#result=step.value;}else {this.#pending=step.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireWorkerPendingData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#packets]);}
 public fail():void{this.#failed=true;}
}
