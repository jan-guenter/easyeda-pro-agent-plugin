/** Metadata for the newly generated readonly guard and original native return.
 * These observations create no SDK, worker, SQL or Save authority. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_POSTCONDITION_GUARD_ARROW as ARROW,CURRENT_SCHEMATIC_WIRE_POSTCONDITION_PROGRAMS as PROGRAMS} from "./current-schematic-wire-postcondition-programs.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().max(16_384).optional(),objectId:handle.optional(),value:z.unknown().optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const slot=z.strictObject({name:z.enum(["length","name"]),value:remote,writable:z.literal(false),configurable:z.literal(true),enumerable:z.literal(false),isOwn:z.literal(true)});
const metadata=z.strictObject({result:z.tuple([slot,slot]),internalProperties:z.array(internal).length(3)});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_POSTCONDITION_METADATA");}}
export function qualifyCurrentSchematicWirePostconditionGuard(input:unknown,actual:unknown,scriptId:string):string{
 const fn=remote.parse(actual);need(fn.type==="function"&&fn.subtype===undefined&&fn.className==="Function"&&fn.description===ARROW&&fn.objectId!==undefined);
 const data=metadata.parse(capture(input).value),slots=new Map(data.result.map(row=>[row.name,row.value]));need(slots.size===2&&slots.get("name")?.type==="string"&&slots.get("name")?.value==="guard"&&slots.get("length")?.type==="number"&&slots.get("length")?.value===0);
 const values=new Map(data.internalProperties.map(row=>[row.name,row.value]));need(values.size===3);const at=values.get("[[FunctionLocation]]");const scopes=values.get("[[Scopes]]");const parent=values.get("[[Prototype]]");
 need(at?.type==="object"&&at.subtype==="internal#location"&&at.objectId===undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[[1-8]\]$/u.test(scopes.description??"")&&parent?.type==="function"&&parent.objectId!==undefined);
 const observed=location.parse(at.value),prefix=PROGRAMS.guardFactory.slice(0,PROGRAMS.guardFactory.indexOf(ARROW)+1);need(observed.scriptId===scriptId&&observed.lineNumber===prefix.split("\n").length-1&&observed.columnNumber===prefix.length-prefix.lastIndexOf("\n")-1);
 return fn.objectId;
}
const symbolName=z.enum(["Symbol(async_id_symbol)","Symbol(trigger_async_id_symbol)"]);
const symbol=z.strictObject({type:z.literal("symbol"),description:symbolName,objectId:handle});
const property=z.strictObject({name:symbolName,value:z.strictObject({type:z.literal("number"),value:z.number().int().nonnegative(),description:z.string().optional()}),writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true),symbol});
const promise=z.strictObject({result:z.array(property).max(2),internalProperties:z.array(internal).length(3)});
export function currentSchematicWirePostconditionPromise(input:unknown):Readonly<{fulfilled:boolean;result:string|null}>{
 const data=promise.parse(capture(input).value);need(data.result.length===0||data.result.length===2&&new Set(data.result.map(row=>row.name)).size===2);for(const row of data.result){need(row.symbol.description===row.name&&!Object.is(row.value.value,-0));}
 const values=new Map(data.internalProperties.map(row=>[row.name,row.value]));need(values.size===3);const parent=values.get("[[Prototype]]");const state=values.get("[[PromiseState]]");const result=values.get("[[PromiseResult]]");
 need(parent?.type==="object"&&parent.subtype===undefined&&parent.className==="Promise"&&parent.objectId!==undefined&&state?.type==="string"&&(state.value==="pending"||state.value==="fulfilled")&&state.objectId===undefined&&result!==undefined);
 if(state.value==="pending"){need(result.type==="undefined"&&result.objectId===undefined&&result.value===undefined);return Object.freeze({fulfilled:false,result:null});}
 need(result.type==="object"&&result.subtype===undefined&&result.className==="Object"&&result.objectId!==undefined&&result.value===undefined);return Object.freeze({fulfilled:true,result:result.objectId});
}
