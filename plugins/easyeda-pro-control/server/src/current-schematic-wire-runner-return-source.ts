/** Original runner/Promise source metadata for the bounded callback-exit lane.
 * Matching inert source supplies no native action or persistence authority. */
import {createHash} from "node:crypto";
import {CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK as CALLBACK} from "./current-schematic-wire-writer-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V4_CALLBACK_LOCATION as CALLBACK_LOCATION} from "./current-schematic-wire-writer-v4-programs.ts";
import {captureCurrentSchematicDisplayAccessorSource as captureSource} from "./current-schematic-display-accessor-replies.ts";
import {z} from "zod";
import {GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION} from "./generated-schematic-display-action-source.ts";
import {qualifyCurrentSchematicWireTransitionSource as qualifyBase} from "./current-schematic-wire-transition-source.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {currentSchematicRelevanceRawProperties as properties} from "./current-schematic-relevance-action-raw-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_SOURCE=freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "aliases": {
      "class": "_L",
      "base": "He",
      "helper": "bO",
      "promiseType": "ZH",
      "promiseTag": "sre",
      "tagAlias": "eC",
      "stack": "fre",
      "trim": "qm",
      "history": "xDe",
      "nullish": "Bt"
    },
    "methods": {
      "helper": {
        "start": 305_310,
        "end": 305_429,
        "bytes": 119,
        "sha256": "2d5414bdb70f6cde9f5785ba0be8b087ec5e2df114a69708fa5c6c660541b669",
        "lineNumber": 6,
        "columnNumber": 7283,
        "name": "bO",
        "arity": 1,
        "kind": "regular"
      },
      "promiseType": {
        "start": 296_672,
        "end": 296_713,
        "bytes": 41,
        "sha256": "251005408c148f2f8a585615eea24608a963787a27e5504f8afc8a72030deb55",
        "lineNumber": 4,
        "columnNumber": 96_138,
        "name": "ZH",
        "arity": 1,
        "kind": "regular"
      },
      "promiseTag": {
        "start": 295_806,
        "end": 295_852,
        "bytes": 46,
        "sha256": "e006607f9e69456fc23e16e98bcd195e3df26fc4f73bdcb7a9ab653e6eab5b83",
        "lineNumber": 4,
        "columnNumber": 95_273,
        "name": "sre",
        "arity": 1,
        "kind": "regular"
      },
      "fulfill": {
        "start": 305_390,
        "end": 305_401,
        "bytes": 11,
        "sha256": "bb3cb7e4123595d1e2f6fb6d3bcad275234d0b134b4874712bf1834ab42e5044",
        "lineNumber": 6,
        "columnNumber": 7352,
        "name": "",
        "arity": 1,
        "kind": "arrow"
      },
      "executor": {
        "start": 824_727,
        "end": 824_899,
        "bytes": 172,
        "sha256": "d825b024d07f9a24955dad43d23ecac9e6f3046594af507583bd1544542bdc64",
        "lineNumber": 30,
        "columnNumber": 68_493,
        "name": "",
        "arity": 1,
        "kind": "arrow"
      },
      "success": {
        "start": 824_774,
        "end": 824_799,
        "bytes": 25,
        "sha256": "cc739743f82ca72d4ad8f350104ee59c105dc145d0d6a295843e73216e8b6431",
        "lineNumber": 30,
        "columnNumber": 68_547,
        "name": "success",
        "arity": 1,
        "kind": "method"
      },
      "failure": {
        "start": 824_800,
        "end": 824_889,
        "bytes": 89,
        "sha256": "5f73faa8139199bdbf88d3bc90dac61ff2c032c693d7f58bb6273619d5122e17",
        "lineNumber": 30,
        "columnNumber": 68_573,
        "name": "failure",
        "arity": 1,
        "kind": "method"
      },
      "actionStart": {
        "start": 822_273,
        "end": 822_542,
        "bytes": 269,
        "sha256": "1b5e81f5e3542d4c9b307a3b4b27169e1e838bfdc49c75292bd3cb6de845c861",
        "lineNumber": 30,
        "columnNumber": 66_039,
        "name": "start",
        "arity": 0,
        "kind": "arrow"
      },
      "actionEnd": {
        "start": 822_543,
        "end": 822_572,
        "bytes": 29,
        "sha256": "38c1bbba46484de2e3d1d528cb1f0f22c0db2fe04ded9da90f9e0168169547df",
        "lineNumber": 30,
        "columnNumber": 66_312,
        "name": "end",
        "arity": 0,
        "kind": "method"
      },
      "actionCancel": {
        "start": 822_729,
        "end": 822_761,
        "bytes": 32,
        "sha256": "28a17c5a2f825975c70891ef610adc608b230ddd94e68864907026695caf20b6",
        "lineNumber": 30,
        "columnNumber": 66_501,
        "name": "cancel",
        "arity": 0,
        "kind": "method"
      },
      "actionFinish": {
        "start": 821_732,
        "end": 822_244,
        "bytes": 512,
        "sha256": "1bd9462c3130f28361a0a5282545067f8274ebfc405d7852d9494f404357a2ea",
        "lineNumber": 30,
        "columnNumber": 65_498,
        "name": "s",
        "arity": 1,
        "kind": "arrow"
      },
      "stack": {
        "start": 297_985,
        "end": 298_058,
        "bytes": 73,
        "sha256": "a5959d07ac5f45455ad56a33cad5f8dec74ebffe5d95d7b9f96047aa58a319a9",
        "lineNumber": 5,
        "columnNumber": 134,
        "name": "fre",
        "arity": 0,
        "kind": "regular"
      },
      "trim": {
        "start": 305_124,
        "end": 305_194,
        "bytes": 70,
        "sha256": "2cbc6effc0a7bb535fbc2018380456ea2fa347f569e63b44f71e51641250559a",
        "lineNumber": 6,
        "columnNumber": 7097,
        "name": "qm",
        "arity": 1,
        "kind": "regular"
      },
      "history": {
        "start": 819_939,
        "end": 820_017,
        "bytes": 78,
        "sha256": "eda93f2d9ffe3ac12cb16e70c615fdc5c9f8ea5aa51eb57f24b4977ebd7f73a8",
        "lineNumber": 30,
        "columnNumber": 63_717,
        "name": "xDe",
        "arity": 1,
        "kind": "regular"
      },
      "nullish": {
        "start": 295_939,
        "end": 295_969,
        "bytes": 30,
        "sha256": "fee478194eeab984af324a06402f9c39dcf8674c558524c9871d83a8465a342c",
        "lineNumber": 4,
        "columnNumber": 95_405,
        "name": "Bt",
        "arity": 1,
        "kind": "regular"
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "aliases": {
      "class": "Ok",
      "base": "He",
      "helper": "PO",
      "promiseType": "oz",
      "promiseTag": "Eae",
      "tagAlias": "AC",
      "stack": "Rae",
      "trim": "sm",
      "history": "l4e",
      "nullish": "Bt"
    },
    "methods": {
      "helper": {
        "start": 1_328_722,
        "end": 1_328_841,
        "bytes": 119,
        "sha256": "09b335a2e0d307745a174dc0f3ecbfbf07c3bc398e2e7267cffeb5e17e6b1568",
        "lineNumber": 532,
        "columnNumber": 7283,
        "name": "PO",
        "arity": 1,
        "kind": "regular"
      },
      "promiseType": {
        "start": 1_320_084,
        "end": 1_320_125,
        "bytes": 41,
        "sha256": "80126812d4ea07dbbd4f83d42d806c7f97084cee0c0ee170e2b60ecb763aa553",
        "lineNumber": 530,
        "columnNumber": 29_936,
        "name": "oz",
        "arity": 1,
        "kind": "regular"
      },
      "promiseTag": {
        "start": 1_319_218,
        "end": 1_319_264,
        "bytes": 46,
        "sha256": "95872bd7e8390459e7f92e26ef6df953a8ba859aae5b477becb7d551fff1f66a",
        "lineNumber": 530,
        "columnNumber": 29_071,
        "name": "Eae",
        "arity": 1,
        "kind": "regular"
      },
      "fulfill": {
        "start": 1_328_802,
        "end": 1_328_813,
        "bytes": 11,
        "sha256": "bb3cb7e4123595d1e2f6fb6d3bcad275234d0b134b4874712bf1834ab42e5044",
        "lineNumber": 532,
        "columnNumber": 7352,
        "name": "",
        "arity": 1,
        "kind": "arrow"
      },
      "executor": {
        "start": 1_848_139,
        "end": 1_848_311,
        "bytes": 172,
        "sha256": "3b1b6a152c6fd589648950821799dec2d3815efb57afc718b25a34e808f15601",
        "lineNumber": 556,
        "columnNumber": 68_493,
        "name": "",
        "arity": 1,
        "kind": "arrow"
      },
      "success": {
        "start": 1_848_186,
        "end": 1_848_211,
        "bytes": 25,
        "sha256": "cc739743f82ca72d4ad8f350104ee59c105dc145d0d6a295843e73216e8b6431",
        "lineNumber": 556,
        "columnNumber": 68_547,
        "name": "success",
        "arity": 1,
        "kind": "method"
      },
      "failure": {
        "start": 1_848_212,
        "end": 1_848_301,
        "bytes": 89,
        "sha256": "5f73faa8139199bdbf88d3bc90dac61ff2c032c693d7f58bb6273619d5122e17",
        "lineNumber": 556,
        "columnNumber": 68_573,
        "name": "failure",
        "arity": 1,
        "kind": "method"
      },
      "actionStart": {
        "start": 1_845_685,
        "end": 1_845_954,
        "bytes": 269,
        "sha256": "d6d089b704b28851e9190673ecdc8c0d4a8b8d4ea4c621cd5425683dc0c35168",
        "lineNumber": 556,
        "columnNumber": 66_039,
        "name": "start",
        "arity": 0,
        "kind": "arrow"
      },
      "actionEnd": {
        "start": 1_845_955,
        "end": 1_845_984,
        "bytes": 29,
        "sha256": "38c1bbba46484de2e3d1d528cb1f0f22c0db2fe04ded9da90f9e0168169547df",
        "lineNumber": 556,
        "columnNumber": 66_312,
        "name": "end",
        "arity": 0,
        "kind": "method"
      },
      "actionCancel": {
        "start": 1_846_141,
        "end": 1_846_173,
        "bytes": 32,
        "sha256": "28a17c5a2f825975c70891ef610adc608b230ddd94e68864907026695caf20b6",
        "lineNumber": 556,
        "columnNumber": 66_501,
        "name": "cancel",
        "arity": 0,
        "kind": "method"
      },
      "actionFinish": {
        "start": 1_845_144,
        "end": 1_845_656,
        "bytes": 512,
        "sha256": "1bd9462c3130f28361a0a5282545067f8274ebfc405d7852d9494f404357a2ea",
        "lineNumber": 556,
        "columnNumber": 65_498,
        "name": "s",
        "arity": 1,
        "kind": "arrow"
      },
      "stack": {
        "start": 1_321_397,
        "end": 1_321_470,
        "bytes": 73,
        "sha256": "56d6d01fe27adfb47844a4c2bd5b68d1abc1f416285039228ef4f2c4a3c3858a",
        "lineNumber": 531,
        "columnNumber": 134,
        "name": "Rae",
        "arity": 0,
        "kind": "regular"
      },
      "trim": {
        "start": 1_328_536,
        "end": 1_328_606,
        "bytes": 70,
        "sha256": "dfd68827f7893cfcc4baca3ba903975d71f781c5eae74f77645791112b809ca8",
        "lineNumber": 532,
        "columnNumber": 7097,
        "name": "sm",
        "arity": 1,
        "kind": "regular"
      },
      "history": {
        "start": 1_843_351,
        "end": 1_843_429,
        "bytes": 78,
        "sha256": "22fc682b5dc2a23ee03b3c0634025d303929154d17e73cf0258580123737d1ac",
        "lineNumber": 556,
        "columnNumber": 63_717,
        "name": "l4e",
        "arity": 1,
        "kind": "regular"
      },
      "nullish": {
        "start": 1_319_351,
        "end": 1_319_381,
        "bytes": 30,
        "sha256": "fee478194eeab984af324a06402f9c39dcf8674c558524c9871d83a8465a342c",
        "lineNumber": 530,
        "columnNumber": 29_203,
        "name": "Bt",
        "arity": 1,
        "kind": "regular"
      }
    }
  }
] as const);
export {CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK as CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_CALLBACK} from "./current-schematic-wire-writer-programs.ts";
export type CurrentSchematicWireRunnerReturnRole=keyof typeof CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_SOURCE[0]["methods"]|"run"|"useAction"|"runnerClass"|"currentAction"|"running"|"callback";
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const internal=z.strictObject({name:z.string(),value:remote});
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_RUNNER_RETURN_SOURCE");}}
interface PinnedFunction{readonly name:string;readonly arity:number;readonly kind:"regular"|"arrow"|"method"|"class";readonly bytes:number;readonly sha256:string;readonly lineNumber:number;readonly columnNumber:number}
function expected(variant:0|1,role:CurrentSchematicWireRunnerReturnRole):Readonly<PinnedFunction>{
 if(role==="callback"){return{...CALLBACK_LOCATION,name:"",arity:0,kind:"arrow" as const,bytes:Buffer.byteLength(CALLBACK),sha256:createHash("sha256").update(CALLBACK).digest("hex")};}
 const action=ACTION[variant].methods;
 if(role==="run"){return action.runnerRun;}
 if(role==="useAction"){return action.runnerUseAction;}
 if(role==="runnerClass"){return action.runnerConstructor;}
 if(role==="currentAction"){return action.runnerCurrentActionGet;}
 if(role==="running"){return action.runnerRunningGet;}
 return CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_SOURCE[variant].methods[role];
}
export function currentSchematicWireRunnerReturnFunctionSite(variant:0|1,role:CurrentSchematicWireRunnerReturnRole):Readonly<{lineNumber:number;columnNumber:number}>{const row=expected(variant,role);return Object.freeze({lineNumber:row.lineNumber,columnNumber:row.columnNumber});}
export function qualifyCurrentSchematicWireRunnerReturnSource(input:unknown):0|1{
 const variant=qualifyBase(input);const raw=captureSource(input);
 for(const role of["helper","promiseType","promiseTag","fulfill","executor","success","failure","actionStart","actionEnd","actionCancel","actionFinish","stack","trim","history","nullish"]as const){const row=CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_SOURCE[variant].methods[role];const text=raw.scriptSource.slice(row.start,row.end);need(Buffer.byteLength(text)===row.bytes&&createHash("sha256").update(text).digest("hex")===row.sha256);}
 return variant;
}
/** Compare the observed complete own roster, including explicit sloppy-function
 * caller/arguments fields when present; no absent metadata is inferred. */
export function qualifyCurrentSchematicWireRunnerReturnFunction(input:unknown,actual:unknown,variant:0|1,role:CurrentSchematicWireRunnerReturnRole,scriptId:string):Readonly<{objectId:string;scopes:string;prototype:string|null;regularOwnFields:"strict"|"sloppy"|"active-helper"|null;argumentsObject:string|null}>{
 handle.parse(scriptId);const row=expected(variant,role);const fn=remote.parse(capture(actual).value);need(fn.type==="function"&&fn.subtype===undefined&&(fn.className==="Function"||role==="callback"&&fn.className==="AsyncFunction")&&fn.objectId!==undefined&&typeof fn.description==="string"&&Buffer.byteLength(fn.description)===row.bytes&&createHash("sha256").update(fn.description).digest("hex")===row.sha256);
 const raw=capture(input).value;const fields=properties(raw);const regular=row.kind==="regular";const constructible=regular||row.kind==="class";let regularOwnFields:"strict"|"sloppy"|"active-helper"|null=null;let argumentsObject:string|null=null;
 if(regular){need(fields.size===3||fields.size===5);regularOwnFields=fields.size===5?"sloppy":"strict";}else{need(fields.size===(constructible?3:2));}
 for(const[key,value]of[["name",row.name],["length",row.arity]]as const){const field=fields.get(key);need(field?.value?.type===(key==="name"?"string":"number")&&field.value.value===value&&field.value.objectId===undefined&&field.writable===false&&!field.enumerable&&field.configurable);}
 let prototype:string|null=null;
 if(constructible){const p=fields.get("prototype");need(p?.value?.type==="object"&&p.value.subtype===undefined&&p.value.objectId!==undefined&&p.writable===regular&&!p.enumerable&&!p.configurable);prototype=p.value.objectId;}
 if(regularOwnFields==="sloppy"){for(const key of["caller","arguments"]){const p=fields.get(key);need(p!==undefined&&p.writable===false&&!p.enumerable&&!p.configurable);if(key==="arguments"&&role==="helper"&&p.value?.type==="object"&&p.value.subtype==="array"&&p.value.className==="Arguments"&&p.value.description==="Arguments(2)"&&p.value.objectId!==undefined){argumentsObject=p.value.objectId;regularOwnFields="active-helper";}else{need(p.value?.type==="object"&&p.value.subtype==="null"&&p.value.value===null&&p.value.objectId===undefined);}}}
 const names=new Set(["length","name",...(constructible?["prototype"]:[]),...(regularOwnFields==="sloppy"||regularOwnFields==="active-helper"?["caller","arguments"]:[])]);need([...fields.keys()].every(key=>names.has(key)));
 const packet=z.object({internalProperties:z.array(internal).length(3)}).parse(raw);const values=new Map(packet.internalProperties.map(p=>[p.name,p.value]));need(values.size===3);
 const location=values.get("[[FunctionLocation]]");const scopes=values.get("[[Scopes]]");const parent=values.get("[[Prototype]]");need(location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined);const at=site.parse(location.value);
 need(at.scriptId===scriptId&&at.lineNumber===row.lineNumber&&at.columnNumber===row.columnNumber&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[[1-8]\]$/u.test(scopes.description??"")&&parent!==undefined&&parent.subtype===undefined&&parent.objectId!==undefined);if(role==="callback"){need(fn.className==="AsyncFunction"&&parent.type==="object"&&parent.className==="AsyncFunction"&&parent.description==="AsyncFunction");}else{need(parent.type==="function");}
 return Object.freeze({objectId:fn.objectId,scopes:scopes.objectId,prototype,regularOwnFields,argumentsObject});
}
