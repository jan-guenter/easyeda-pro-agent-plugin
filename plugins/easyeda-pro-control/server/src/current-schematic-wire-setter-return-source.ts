/** Exact native Symbol metadata for its immutable well-known keys.
 * A present prototype is observed; no Symbol constructibility is inferred. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {currentSchematicRelevanceRawProperties as properties} from "./current-schematic-relevance-action-raw-replies.ts";

function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_SETTER_RETURN_NATIVE_SYMBOL");}}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional()});
const internalRow=z.object({name:z.string(),value:remote});
export function qualifyCurrentSchematicWireSetterReturnSymbol(input:unknown,actual:unknown):void{
 const fn=remote.parse(capture(actual).value);need(fn.type==="function"&&fn.subtype===undefined&&fn.className==="Function"&&fn.description==="function Symbol() { [native code] }"&&fn.objectId!==undefined);
 const value=capture(input).value;const fields=properties(value);
 const length=fields.get("length"),name=fields.get("name"),prototype=fields.get("prototype");
 need(name?.value?.type==="string"&&name.value.value==="Symbol"&&name.writable===false&&!name.enumerable&&name.configurable&&length?.value?.type==="number"&&length.value.value===0&&length.writable===false&&!length.enumerable&&length.configurable);
 need(prototype?.value?.type==="object"&&prototype.value.subtype===undefined&&prototype.value.className==="Symbol"&&prototype.value.description==="Symbol"&&prototype.value.objectId!==undefined&&prototype.writable===false&&!prototype.enumerable&&!prototype.configurable);
 for(const key of["iterator","species"]){const row=fields.get(key);need(row?.value?.type==="symbol"&&row.value.subtype===undefined&&row.value.description===`Symbol(Symbol.${key})`&&row.value.objectId!==undefined&&row.writable===false&&!row.enumerable&&!row.configurable);}
 const raw=z.object({internalProperties:z.array(internalRow).length(2)}).parse(value);
 const internal=new Map(raw.internalProperties.map(row=>[row.name,row.value])),parent=internal.get("[[Prototype]]"),scopes=internal.get("[[Scopes]]");
 need(internal.size===2&&parent?.type==="function"&&parent.subtype===undefined&&parent.className==="Function"&&parent.description==="function () { [native code] }"&&parent.objectId!==undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.description==="Scopes[0]"&&scopes.objectId!==undefined);
}
