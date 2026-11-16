/** A separate complete raw event journal and original-observer view.
 * The old 1,024-node reply/parser limit remains unchanged. */
import{types}from"node:util";
import{sha256Text}from"./core.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";

export const CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS=Object.freeze({frames:64,scopeChain:12,frameNodes:256,envelopeNodes:256,nodes:64*256+256,depth:12,string:16_384,bytes:1_048_576}as const);
interface Envelope{readonly sessionId:unknown;readonly method:unknown;readonly params:unknown}
export interface CurrentSchematicWireEventRecord{
 readonly schema:"private.schematic-wire-original-event-view.v1";readonly event:Readonly<Envelope>;readonly originalText:string;readonly originalSha256:string;readonly original:unknown;
 readonly originalFrameCount:number;readonly transportBytesRetained:boolean;readonly suppliedObservationsOnly:true;readonly originalNativeEventJoined:false;readonly originalNativeOwnerJoined:false;readonly saveAuthorized:false;
}
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_ORIGINAL_EVENT_CAPTURE");}}
function record(value:unknown):object{
 need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&!Array.isArray(value));const proto:unknown=Object.getPrototypeOf(value);need(proto===Object.prototype||proto===null);need(Reflect.ownKeys(value).length<=32);return value;
}
function own(value:unknown,key:string):unknown{const object=record(value);const d=Object.getOwnPropertyDescriptor(object,key);need(d!==undefined&&Object.hasOwn(d,"value")&&d.enumerable===true);return d.value as unknown;}
function optional(value:unknown,key:string):unknown{const object=record(value);const d=Object.getOwnPropertyDescriptor(object,key);if(d===undefined){return undefined;}need(Object.hasOwn(d,"value")&&d.enumerable===true);return d.value as unknown;}
function dense(value:unknown,maximum:number):readonly unknown[]{
 need(Array.isArray(value)&&!types.isProxy(value)&&Object.getPrototypeOf(value)===Array.prototype&&value.length<=maximum&&Reflect.ownKeys(value).length===value.length+1);
 const rows:unknown[]=[];for(let index=0;index<value.length;index+=1){const d=Object.getOwnPropertyDescriptor(value,String(index));need(d!==undefined&&Object.hasOwn(d,"value")&&d.enumerable===true);rows.push(d.value);}return rows;
}
function snapshot(input:unknown):Readonly<{value:unknown;text:string}>{
 let nodes=0;const seen=new Set<object>();
 function copy(value:unknown,depth:number):unknown{
  nodes+=1;need(nodes<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.nodes&&depth<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.depth);
  if(value===null||typeof value==="boolean"){return value;}
  if(typeof value==="string"){need(value.length<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.string&&value.isWellFormed());return value;}
  if(typeof value==="number"){need(Number.isFinite(value)&&!Object.is(value,-0));return value;}
  need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&!seen.has(value));seen.add(value);
  if(Array.isArray(value)){return Object.freeze(dense(value,256).map(item=>copy(item,depth+1)));}
  const object=record(value);const result:unknown=Object.create(null);need(result!==null&&typeof result==="object");
  for(const key of Reflect.ownKeys(object)){need(typeof key==="string"&&key.length<=128&&key.isWellFormed());Object.defineProperty(result,key,{value:copy(own(object,key),depth+1),enumerable:true});}return Object.freeze(result);
 }
 const value=copy(input,0);const text=JSON.stringify(value);need(Buffer.byteLength(text)<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.bytes);return Object.freeze({value,text});
}
function count(value:unknown):number{if(value===null||typeof value!=="object"){return 1;}if(Array.isArray(value)){return 1+value.reduce<number>((total,item)=>total+count(item),0);}return 1+Object.values(value).reduce<number>((total,item)=>total+count(item),0);}
function projection(input:unknown):Readonly<{event:Readonly<Envelope>;frames:number}>{
 const method=own(input,"method"),params=own(input,"params"),sessionId=own(input,"sessionId");let projected:unknown;let frames=0;
 if(method==="Debugger.paused"){
  const rawFrames=dense(own(params,"callFrames"),CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.frames);need(rawFrames.length>0);frames=rawFrames.length;
  let frameNodes=0;for(const frame of rawFrames){record(frame);need(typeof own(frame,"functionName")==="string"&&typeof own(frame,"url")==="string");record(own(frame,"this"));dense(own(frame,"scopeChain"),CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.scopeChain);const size=count(frame);need(size<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.frameNodes);frameNodes+=size;}need(count(input)-frameNodes<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.envelopeNodes);
  // All full raw frames remain above; these readers use only the top/caller.
  const selected=rawFrames.slice(0,2).map(frame=>{
   const output:Record<string,unknown>={callFrameId:own(frame,"callFrameId"),location:own(frame,"location")};
   for(const key of["functionLocation","returnValue"]){const value=optional(frame,key);if(value!==undefined){output[key]=value;}}return Object.freeze(output);
  });
  projected=Object.freeze({reason:own(params,"reason"),hitBreakpoints:own(params,"hitBreakpoints"),callFrames:Object.freeze(selected)});
 }else if(method==="Debugger.scriptParsed"){
  need(count(input)<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.envelopeNodes);
  // These required full-native fields prevent a projected script row from
  // Being resubmitted as a complete original notification.
  for(const key of["startLine","startColumn","endLine","endColumn","executionContextId","hash"]){own(params,key);}
  projected=Object.freeze({scriptId:own(params,"scriptId"),url:own(params,"url"),length:own(params,"length")});
 }else{need(method==="Debugger.resumed"&&Reflect.ownKeys(record(params)).length===0);projected=Object.freeze({});}
 const event=Object.freeze({sessionId,method,params:projected});capture(event);return Object.freeze({event,frames});
}
export class CurrentSchematicWireEventObserver{
 readonly #owner:object;readonly #issued=new WeakSet<CurrentSchematicWireEventRecord>();
 public constructor(owner:object){need(owner!==null&&typeof owner==="object"&&!types.isProxy(owner));this.#owner=owner;Object.freeze(this);}
 #retain(raw:Readonly<{value:unknown;text:string}>,originalText:string,transportBytesRetained:boolean):CurrentSchematicWireEventRecord{
  const view=projection(raw.value);
  const result:CurrentSchematicWireEventRecord=Object.freeze({schema:"private.schematic-wire-original-event-view.v1",event:view.event,originalText,originalSha256:sha256Text(originalText),original:raw.value,originalFrameCount:view.frames,transportBytesRetained,suppliedObservationsOnly:true,originalNativeEventJoined:false,originalNativeOwnerJoined:false,saveAuthorized:false});this.#issued.add(result);return result;
 }
 /** Object SDK notifications have a complete immutable serialization, but
  * never claim to be the original native transport's wire bytes. */
 public captureObject(input:unknown,owner:object):CurrentSchematicWireEventRecord{need(owner===this.#owner);const raw=snapshot(input);return this.#retain(raw,raw.text,false);}
 /** The complete owner supplies its original transport text unchanged. */
 public captureRaw(text:string,owner:object):CurrentSchematicWireEventRecord{need(owner===this.#owner&&typeof text==="string"&&text.isWellFormed()&&Buffer.byteLength(text)<=CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS.bytes);const input:unknown=JSON.parse(text);return this.#retain(snapshot(input),text,true);}
 public requireOriginal(input:CurrentSchematicWireEventRecord,owner:object):CurrentSchematicWireEventRecord{need(owner===this.#owner&&this.#issued.has(input));return input;}
}
Object.freeze(CurrentSchematicWireEventObserver.prototype);Object.freeze(CurrentSchematicWireEventObserver);
