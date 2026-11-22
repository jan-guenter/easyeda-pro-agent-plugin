/** Exact variant-zero vendor event-dispatch bodies for the empty-listener tick lane.
 * Source identity supplies no live application or subscriber authority. */
import {createHash} from "node:crypto";
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {currentSchematicRelevanceRawProperties as properties} from "./current-schematic-relevance-action-raw-replies.ts";
import {captureCurrentSchematicDisplayAccessorSource as captureSource} from "./current-schematic-display-accessor-replies.ts";
import {qualifyCurrentSchematicWireRunnerReturnSource as qualifyBase} from "./current-schematic-wire-runner-return-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_TICK_BODY_SOURCE=freezeDeep({
  "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
  "variant": 0,
  "methods": {
    "dispatcherBase": {
      "start": 329_368,
      "end": 331_011,
      "bytes": 1643,
      "sha256": "db5ebf53269b6af0b3f08c2f3e78ea73da3a68393dd1ca36dfb3658ea8502fc4",
      "lineNumber": 6,
      "columnNumber": 31_347,
      "name": "DB",
      "arity": 0,
      "kind": "class"
    },
    "dispatcherClass": {
      "start": 331_015,
      "end": 331_313,
      "bytes": 298,
      "sha256": "544496592162d29a3b3d324bfa6205a368fe36f8b7e77ffc2e3f95f0863c1a73",
      "lineNumber": 6,
      "columnNumber": 32_977,
      "name": "Vt",
      "arity": 0,
      "kind": "class"
    },
    "dispatch": {
      "start": 331_032,
      "end": 331_312,
      "bytes": 280,
      "sha256": "04fe3ae664d67ec7c667f43d4d750e0da85c4da63006e65ffffb6b9dd42484ce",
      "lineNumber": 6,
      "columnNumber": 33_002,
      "name": "dispatch",
      "arity": 1,
      "kind": "method"
    },
    "deliver": {
      "start": 330_820,
      "end": 330_887,
      "bytes": 67,
      "sha256": "2a2eb7dbebeba2b7b4fc8b454ddeca3dda928bb3f84c2ee47ed50fa605fb2076",
      "lineNumber": 6,
      "columnNumber": 32_790,
      "name": "_deliver",
      "arity": 2,
      "kind": "method"
    }
  }
} as const);
const SOURCE=CURRENT_SCHEMATIC_WIRE_TICK_BODY_SOURCE;
export type CurrentSchematicWireTickBodyRole=keyof typeof SOURCE.methods;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TICK_BODY_SOURCE");}}
export function qualifyCurrentSchematicWireTickBodySource(input:unknown):0{
 need(qualifyBase(input)===0);const raw=captureSource(input);
 for(const row of Object.values(SOURCE.methods)){const body=raw.scriptSource.slice(row.start,row.end);need(Buffer.byteLength(body)===row.bytes&&createHash("sha256").update(body).digest("hex")===row.sha256);}return 0;
}
export function qualifyCurrentSchematicWireTickBodyFunction(input:unknown,actual:unknown,variant:0|1,role:CurrentSchematicWireTickBodyRole,scriptId:string):Readonly<{objectId:string;scopes:string;prototype:string|null;regularOwnFields:"strict"|"sloppy"|"active-helper"|null;argumentsObject:string|null}>{
 handle.parse(scriptId);const row=SOURCE.methods[role];need(variant===0);const fn=remote.parse(capture(actual).value);need(fn.type==="function"&&fn.subtype===undefined&&fn.className==="Function"&&fn.objectId!==undefined&&typeof fn.description==="string"&&Buffer.byteLength(fn.description)===row.bytes&&createHash("sha256").update(fn.description).digest("hex")===row.sha256);
 const raw=capture(input).value;const fields=properties(raw);const constructible=row.kind==="class";const regularOwnFields=null;const argumentsObject=null;
 need(fields.size===(constructible?3:2));
 for(const[key,value]of[["name",row.name],["length",row.arity]]as const){const field=fields.get(key);need(field?.value?.type===(key==="name"?"string":"number")&&field.value.value===value&&field.value.objectId===undefined&&field.writable===false&&!field.enumerable&&field.configurable);}
 let prototype:string|null=null;
 if(constructible){const p=fields.get("prototype");need(p?.value?.type==="object"&&p.value.subtype===undefined&&p.value.objectId!==undefined&&p.writable===false&&!p.enumerable&&!p.configurable);prototype=p.value.objectId;}
 const names=new Set(["length","name",...(constructible?["prototype"]:[])]);need([...fields.keys()].every(key=>names.has(key)));
 const packet=z.object({internalProperties:z.array(internal).length(3)}).parse(raw);const values=new Map(packet.internalProperties.map(p=>[p.name,p.value]));need(values.size===3);
 const location=values.get("[[FunctionLocation]]");const scopes=values.get("[[Scopes]]");const parent=values.get("[[Prototype]]");need(location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined);const at=site.parse(location.value);
 need(at.scriptId===scriptId&&at.lineNumber===row.lineNumber&&at.columnNumber===row.columnNumber&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[[1-8]\]$/u.test(scopes.description??"")&&parent!==undefined&&parent.subtype===undefined&&parent.objectId!==undefined);need(parent.type==="function");
 return Object.freeze({objectId:fn.objectId,scopes:scopes.objectId,prototype,regularOwnFields,argumentsObject});
}
