/** Exact shared base predicate only. Receiver and return ownership must
 * come from the original Wire parent continuation, never these source data. */
import {createHash} from "node:crypto";
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {currentSchematicRelevanceRawProperties as properties} from "./current-schematic-relevance-action-raw-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_PARENT_PREDICATE_SOURCE=freezeDeep([
  {
    "variant": 0,
    "start": 1_738_140,
    "end": 1_738_174,
    "bytes": 34,
    "sha256": "d6d5b9a6592dfe77e34fabbb3a2c3bb73428e6a524799b3903afc57dd052ff98",
    "lineNumber": 59,
    "columnNumber": 21_619
  },
  {
    "variant": 1,
    "start": 1_934_694,
    "end": 1_934_728,
    "bytes": 34,
    "sha256": "d6d5b9a6592dfe77e34fabbb3a2c3bb73428e6a524799b3903afc57dd052ff98",
    "lineNumber": 557,
    "columnNumber": 21_619
  }
] as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.object({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const packet=z.strictObject({result:z.array(z.unknown()).length(2),internalProperties:z.array(internal).length(3)});
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_ORIGINAL_PARENT_PREDICATE_SOURCE");}}
export function qualifyCurrentSchematicWireParentPredicate(input:unknown,actual:unknown,variant:0|1,scriptId:string):void{
 const row=CURRENT_SCHEMATIC_WIRE_PARENT_PREDICATE_SOURCE[variant];const fn=remote.parse(capture(actual).value);need(fn.type==="function"&&fn.subtype===undefined&&fn.className==="Function"&&fn.objectId!==undefined&&typeof fn.description==="string"&&Buffer.byteLength(fn.description)===row.bytes&&createHash("sha256").update(fn.description).digest("hex")===row.sha256);
 const raw=capture(input).value;const reply=packet.parse(raw);const fields=properties(raw);need(fields.size===2);for(const[key,value]of[["name","shouldUpdateParentBBox"],["length",0]]as const){const field=fields.get(key);need(field?.value?.type===(key==="name"?"string":"number")&&field.value.value===value&&field.value.objectId===undefined&&field.writable===false&&!field.enumerable&&field.configurable);}
 const parts=new Map(reply.internalProperties.map(item=>[item.name,item.value]));const location=parts.get("[[FunctionLocation]]");const parent=parts.get("[[Prototype]]");const scopes=parts.get("[[Scopes]]");const point=site.parse(location?.value);need(parts.size===3&&location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined&&point.scriptId===scriptId&&point.lineNumber===row.lineNumber&&point.columnNumber===row.columnNumber&&parent?.type==="function"&&parent.subtype===undefined&&parent.className==="Function"&&parent.description==="function () { [native code] }"&&parent.objectId!==undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&/^Scopes\[[1-8]\]$/u.test(scopes.description??"")&&scopes.objectId!==undefined);
}
