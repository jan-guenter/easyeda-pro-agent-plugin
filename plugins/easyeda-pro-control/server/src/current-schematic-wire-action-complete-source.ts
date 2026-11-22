/** Original variant-zero finish/empty-roster/immediate-resume source only. */
import {createHash} from "node:crypto";
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {currentSchematicRelevanceRawProperties as properties} from "./current-schematic-relevance-action-raw-replies.ts";
import {captureCurrentSchematicDisplayAccessorSource as captureSource} from "./current-schematic-display-accessor-replies.ts";
import {qualifyCurrentSchematicWireTickBodySource as qualifyBase} from "./current-schematic-wire-tick-body-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SOURCE=freezeDeep({
  "variant": 0,
  "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
  "methods": {
    "collectionClass": {
      "start": 323_661,
      "end": 324_326,
      "bytes": 665,
      "sha256": "45138784279af9b33bd8c029cf7bf3173fad85c283961ae3257dc3a59c3ada90",
      "lineNumber": 6,
      "columnNumber": 25_640,
      "name": "_O",
      "arity": 0,
      "kind": "class"
    },
    "timerClass": {
      "start": 326_476,
      "end": 326_808,
      "bytes": 332,
      "sha256": "a126752783f34abae82eb0102a5d4885c1317e2544a608a87d9182aca83f6a56",
      "lineNumber": 6,
      "columnNumber": 28_455,
      "name": "su",
      "arity": 2,
      "kind": "class"
    },
    "channelClass": {
      "start": 767_771,
      "end": 768_899,
      "bytes": 1128,
      "sha256": "9e2a1f64d85560e51dba30f998f4ec08fb89c5e8de60a9ebd1540b3e156b2b7b",
      "lineNumber": 30,
      "columnNumber": 11_554,
      "name": "gL",
      "arity": 0,
      "kind": "class"
    },
    "pausedChannelClass": {
      "start": 818_007,
      "end": 818_251,
      "bytes": 244,
      "sha256": "84e42e3f91cbd10d770d2cb145a468623ffee789d6b0f4efb56e2cfb8bdd39f2",
      "lineNumber": 30,
      "columnNumber": 61_773,
      "name": "CC",
      "arity": 0,
      "kind": "class"
    },
    "consistencyClass": {
      "start": 820_024,
      "end": 820_571,
      "bytes": 547,
      "sha256": "ecc2c1ff8f6f6629f37dfe5be9bfdd5efd8cb2244420f0492ae2809958195d5a",
      "lineNumber": 30,
      "columnNumber": 63_807,
      "name": "nz",
      "arity": 1,
      "kind": "class"
    },
    "debounceFactory": {
      "start": 305_429,
      "end": 306_377,
      "bytes": 948,
      "sha256": "353fbab4c2493df464d8077bc6619f1368b4552486c6ee58183bdd0186eb04e3",
      "lineNumber": 6,
      "columnNumber": 7402,
      "name": "Ta",
      "arity": 3,
      "kind": "regular"
    },
    "collectionIterator": {
      "start": 324_169,
      "end": 324_267,
      "bytes": 98,
      "sha256": "58ab2ecd88ae9e09b543d7270d990e3e90dd324c0dcb6ffa40a05d20de1c8fb2",
      "lineNumber": 6,
      "columnNumber": 26_149,
      "name": "[Symbol.iterator]",
      "arity": 0,
      "kind": "generator"
    },
    "timerCancel": {
      "start": 326_601,
      "end": 326_665,
      "bytes": 64,
      "sha256": "72ca90576e3d8520f529cd9b16d696487291672cb6c03da50700a0144e8df0e4",
      "lineNumber": 6,
      "columnNumber": 28_569,
      "name": "cancel",
      "arity": 0,
      "kind": "method"
    },
    "timerExist": {
      "start": 326_549,
      "end": 326_577,
      "bytes": 28,
      "sha256": "6c61ac5ba5d2bc4ac5ec5a831b9bb041d46d9164d2ab7b5e30e3d09531a1378f",
      "lineNumber": 6,
      "columnNumber": 28_516,
      "name": "exist",
      "arity": 0,
      "kind": "method"
    },
    "channelResume": {
      "start": 768_736,
      "end": 768_775,
      "bytes": 39,
      "sha256": "094d263bf3bfb1f3f62dac01d07536e043b5c0ad9a7959d04b2e2dd03372061f",
      "lineNumber": 30,
      "columnNumber": 12_508,
      "name": "resume",
      "arity": 0,
      "kind": "method"
    },
    "channelPublish": {
      "start": 767_982,
      "end": 768_281,
      "bytes": 299,
      "sha256": "c9953d498118bdf5c8c456a515d8e9fc3d9286cebf1978082e09a311132e8d3b",
      "lineNumber": 30,
      "columnNumber": 11_755,
      "name": "publish",
      "arity": 0,
      "kind": "method"
    },
    "channelPause": {
      "start": 768_775,
      "end": 768_817,
      "bytes": 42,
      "sha256": "56cb115b5b803e81c76a6d0c7febfd6d0c1a07c7a20f2a12711953b7a773178e",
      "lineNumber": 30,
      "columnNumber": 12_546,
      "name": "pause",
      "arity": 0,
      "kind": "method"
    },
    "pausedChannelResume": {
      "start": 818_106,
      "end": 818_190,
      "bytes": 84,
      "sha256": "90247f1e91fa2afa7f3f48c08f06d7f778b50ed671639e9a79f67d79170ee2ae",
      "lineNumber": 30,
      "columnNumber": 61_878,
      "name": "resume",
      "arity": 0,
      "kind": "method"
    },
    "pausedChannelPause": {
      "start": 818_024,
      "end": 818_106,
      "bytes": 82,
      "sha256": "3b8332e9315bdcbb17a1c2885d09eca04a7eac1b0217ad783d2d39185e73722f",
      "lineNumber": 30,
      "columnNumber": 61_795,
      "name": "pause",
      "arity": 0,
      "kind": "method"
    },
    "consistencyPause": {
      "start": 820_403,
      "end": 820_493,
      "bytes": 90,
      "sha256": "b56f354fb902bedccec034a736fad0ce8f4dc4da57dcfee25732a8000ef119d1",
      "lineNumber": 30,
      "columnNumber": 64_177,
      "name": "tryPause",
      "arity": 0,
      "kind": "method"
    },
    "setImmediate": {
      "start": 820_253,
      "end": 820_403,
      "bytes": 150,
      "sha256": "eb1f5015305e66b5a5d3d01b84f1a5772aea18c57f0cd80da3fcb02fb6691bd9",
      "lineNumber": 30,
      "columnNumber": 64_040,
      "name": "setImmediateTryResume",
      "arity": 0,
      "kind": "method"
    },
    "immediateResume": {
      "start": 820_325,
      "end": 820_402,
      "bytes": 77,
      "sha256": "9d42b00159b20da10bd4665de694e1cfebb14281f6cb6f2f937f7cd12913cb0f",
      "lineNumber": 30,
      "columnNumber": 64_091,
      "name": "",
      "arity": 0,
      "kind": "arrow"
    },
    "currentActionSet": {
      "name": "set currentAction",
      "arity": 1,
      "kind": "method",
      "start": 823_741,
      "end": 823_926,
      "bytes": 185,
      "sha256": "59e89f2aa23c181366c94a02d7b2570473bfbd6bd48e816ef4bb159fcb146e6a",
      "lineNumber": 30,
      "columnNumber": 67_524
    }
  }
} as const);
const SOURCE=CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SOURCE;
export type CurrentSchematicWireActionCompleteRole=keyof typeof SOURCE.methods;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_ACTION_COMPLETE_SOURCE");}}
export function qualifyCurrentSchematicWireActionCompleteSource(input:unknown):0{
 need(qualifyBase(input)===0);const raw=captureSource(input);
 for(const row of Object.values(SOURCE.methods)){const body=raw.scriptSource.slice(row.start,row.end);need(Buffer.byteLength(body)===row.bytes&&createHash("sha256").update(body).digest("hex")===row.sha256);}return 0;
}
export function qualifyCurrentSchematicWireActionCompleteFunction(input:unknown,actual:unknown,role:CurrentSchematicWireActionCompleteRole,scriptId:string):Readonly<{objectId:string;scopes:string;prototype:string|null}>{
 handle.parse(scriptId);const row=SOURCE.methods[role];const fn=remote.parse(capture(actual).value);
 const generator=row.kind==="generator";const regular=row.kind==="regular";const hasPrototype=generator||regular||row.kind==="class";
 need(fn.type==="function"&&fn.subtype===undefined&&fn.className===(generator?"GeneratorFunction":"Function")&&fn.objectId!==undefined&&typeof fn.description==="string"&&Buffer.byteLength(fn.description)===row.bytes&&createHash("sha256").update(fn.description).digest("hex")===row.sha256);
 const raw=capture(input).value;const packet=z.object({result:z.array(z.unknown()),internalProperties:z.array(internal).length(generator?4:3)}).parse(raw);const fields=properties({...packet,internalProperties:[]});
 const sloppy=regular&&fields.size===5;need(fields.size===(hasPrototype?3:2)+(sloppy?2:0));
 for(const[key,value]of[["name",row.name],["length",row.arity]]as const){const field=fields.get(key);need(field?.value?.type===(key==="name"?"string":"number")&&field.value.value===value&&field.value.objectId===undefined&&field.writable===false&&!field.enumerable&&field.configurable);}
 let prototype:string|null=null;
 if(hasPrototype){const field=fields.get("prototype");need(field?.value?.type==="object"&&field.value.subtype!=="proxy"&&field.value.objectId!==undefined&&field.writable===(regular||generator)&&!field.enumerable&&!field.configurable);prototype=field.value.objectId;}
 if(sloppy){for(const key of["arguments","caller"]){const field=fields.get(key);need(field?.value?.type==="object"&&field.value.subtype==="null"&&field.value.value===null&&field.value.objectId===undefined&&field.writable===false&&!field.enumerable&&!field.configurable);}}
 const names=new Set(["name","length",...(hasPrototype?["prototype"]:[]),...(sloppy?["arguments","caller"]:[])]);need([...fields.keys()].every(key=>names.has(key)));
 const values=new Map(packet.internalProperties.map(field=>[field.name,field.value]));need(values.size===packet.internalProperties.length);
 const location=values.get("[[FunctionLocation]]");const scopes=values.get("[[Scopes]]");const parent=values.get("[[Prototype]]");const flag=values.get("[[IsGenerator]]");
 need(generator?flag?.type==="boolean"&&flag.value===true&&flag.objectId===undefined:flag===undefined);
 need(location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined);const at=site.parse(location.value);
 need(at.scriptId===scriptId&&at.lineNumber===row.lineNumber&&at.columnNumber===row.columnNumber&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[[1-8]\]$/u.test(scopes.description??"")&&parent?.objectId!==undefined);
 need(generator?parent.type==="object"&&parent.className==="GeneratorFunction":parent.type==="function");
 return Object.freeze({objectId:fn.objectId,scopes:scopes.objectId,prototype});
}

// V8's internal WeakMap entry list is not an ordinary user Array reply: it has
// Only its real length descriptor and no invented prototype metadata.
const emptyEntryValue=z.strictObject({type:z.literal("number"),value:z.literal(0),description:z.literal("0")});
const emptyEntryLength=z.strictObject({name:z.literal("length"),value:emptyEntryValue,writable:z.literal(true),configurable:z.literal(false),enumerable:z.literal(false),isOwn:z.literal(true)});
const emptyEntriesReply=z.strictObject({result:z.tuple([emptyEntryLength])});
/** Data grammar only. Original owner, handle and WeakMap correlation stay private. */
export function requireCurrentSchematicWireActionCompleteEmptyEntries(input:unknown):void{emptyEntriesReply.parse(capture(input).value);}
