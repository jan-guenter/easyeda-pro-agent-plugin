/** Separate native tree Promise settlement metadata. Node's two bounded async-hook
 * Symbols are accepted; arbitrary own fields and rejected/results fail closed. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const symbolName=z.enum(["Symbol(async_id_symbol)","Symbol(trigger_async_id_symbol)"]);
const symbol=z.strictObject({type:z.literal("symbol"),description:symbolName,objectId:handle});
const numeric=z.strictObject({type:z.literal("number"),value:z.number().int().nonnegative(),description:z.string().optional()});
const property=z.strictObject({name:symbolName,value:numeric,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true),symbol});
const remote=z.strictObject({type:z.enum(["object","function","undefined","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().max(16_384).optional(),objectId:handle.optional(),value:z.unknown().optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const packet=z.strictObject({result:z.array(property).max(2),internalProperties:z.array(internal).length(3)});
function need(condition:boolean):asserts condition{if(!condition){throw new Error("WIRE_TREE_PROMISE");}}
export function currentSchematicWireTreePromiseSettled(input:unknown):boolean{
 const data=packet.parse(capture(input).value);need(data.result.length===0||data.result.length===2&&new Set(data.result.map(row=>row.name)).size===2);for(const row of data.result){need(row.symbol.description===row.name&&!Object.is(row.value.value,-0));}
 const values=new Map(data.internalProperties.map(row=>[row.name,row.value]));need(values.size===3);const state=values.get("[[PromiseState]]"); const result=values.get("[[PromiseResult]]"); const parent=values.get("[[Prototype]]");
 need(state?.type==="string"&&(state.value==="fulfilled"||state.value==="pending")&&state.objectId===undefined&&state.subtype===undefined&&parent?.type==="object"&&parent.subtype===undefined&&parent.className==="Promise"&&parent.description==="Promise"&&parent.objectId!==undefined&&parent.value===undefined);
 need(result?.type==="undefined"&&result.value===undefined&&result.objectId===undefined&&result.subtype===undefined);return state.value==="fulfilled";
}
