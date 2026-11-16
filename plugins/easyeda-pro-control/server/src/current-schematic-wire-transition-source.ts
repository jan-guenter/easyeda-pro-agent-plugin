/** Exact Wire points/monitor/group-history source. Matching bytes supply
 * comparison data, never an original callback, continuation or writer grant. */
import {createHash} from "node:crypto";

import {z} from "zod";

import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

import {qualifyCurrentSchematicWireAccessorSource as qualifyBase} from "./current-schematic-wire-accessor-observer.ts";

import {captureCurrentSchematicDisplayAccessorSource} from "./current-schematic-display-accessor-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";


export const CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE=freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "groupAlias": "Ck",
    "baseAlias": "pf",
    "methods": {
      "pointsGet": {
        "start": 3_851_997,
        "end": 3_852_030,
        "bytes": 33,
        "sha256": "554ea2472f8d2bba679446cce1ac6c3c91c77a7a6d1fa96d5dc580690463bac9",
        "lineNumber": 3606,
        "columnNumber": 185_123,
        "name": "get points",
        "arity": 0,
        "constructor": false
      },
      "pointsSet": {
        "start": 3_852_030,
        "end": 3_852_175,
        "bytes": 145,
        "sha256": "50254cd104fa912cb79c0e86041f99981c6c8053a9b50a6164df57e857c12db6",
        "lineNumber": 3606,
        "columnNumber": 185_156,
        "name": "set points",
        "arity": 1,
        "constructor": false
      },
      "setLines": {
        "start": 3_918_102,
        "end": 3_918_587,
        "bytes": 485,
        "sha256": "3880c8aa2c2e509e73aeb464ee91aab65b14687642afe70d5065b7c6adbcd21c",
        "lineNumber": 3606,
        "columnNumber": 251_226,
        "name": "setLines",
        "arity": 1,
        "constructor": false
      },
      "modifyRecord": {
        "start": 1_697_343,
        "end": 1_697_577,
        "bytes": 234,
        "sha256": "785e2bb8b04f50a74c0cda4798c622d6ad410092f94d923b4f6221f5bc9dc362",
        "lineNumber": 58,
        "columnNumber": 58_714,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "modifyView": {
        "start": 1_696_644,
        "end": 1_696_804,
        "bytes": 160,
        "sha256": "86d78fde9fbbdf22f8a1412af6292c8808473633e8fb55c25e9567b2cc51239b",
        "lineNumber": 58,
        "columnNumber": 58_015,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "modifyAst": {
        "start": 1_697_287,
        "end": 1_697_329,
        "bytes": 42,
        "sha256": "0b278713c85e52953ed61d4ba0f6d7d31211ae3e4307b6d8f5cd64020925a549",
        "lineNumber": 58,
        "columnNumber": 58_658,
        "name": "t",
        "arity": 0,
        "constructor": false
      },
      "bboxAttribute": {
        "start": 3_962_267,
        "end": 3_962_346,
        "bytes": 79,
        "sha256": "fffdee5cd13bdf9b8421f6e16b889582eaba454ee91564e7c8fdefa6dbe213e8",
        "lineNumber": 3606,
        "columnNumber": 295_383,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "bboxAdd": {
        "start": 3_960_008,
        "end": 3_960_411,
        "bytes": 403,
        "sha256": "392a33101d5a0c5d2e98225fac6bab7ea2a3baf13e1ed27642b38b31eaf90d5e",
        "lineNumber": 3606,
        "columnNumber": 293_124,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "bboxTryParent": {
        "start": 3_960_814,
        "end": 3_960_948,
        "bytes": 134,
        "sha256": "603a3ea6bd6f14093304acf038a709c131f2bb9222ad3a875502be9d9e951ec7",
        "lineNumber": 3606,
        "columnNumber": 293_930,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "bboxCommon": {
        "start": 3_960_444,
        "end": 3_960_580,
        "bytes": 136,
        "sha256": "510b108dee0fa2f4b4999704ee8e68ac89e9157353606205409e0c78d40e569b",
        "lineNumber": 3606,
        "columnNumber": 293_560,
        "name": "forCommon",
        "arity": 1,
        "constructor": false
      },
      "bboxUpdating": {
        "start": 3_960_593,
        "end": 3_960_748,
        "bytes": 155,
        "sha256": "ff6f2b531178e1bc6426b9b91dc34d81334c3ff8aed7c6a463f4a33cf0b672a7",
        "lineNumber": 3606,
        "columnNumber": 293_709,
        "name": "forUpdating",
        "arity": 1,
        "constructor": false
      },
      "bboxUpdate": {
        "start": 3_961_273,
        "end": 3_961_764,
        "bytes": 491,
        "sha256": "919bdf344946e98483f700d78d8650bf47dee17ae7414c68cc43e1cb7ab0d9b6",
        "lineNumber": 3606,
        "columnNumber": 294_395,
        "name": "update",
        "arity": 0,
        "constructor": false
      },
      "attrWatcher": {
        "start": 3_957_807,
        "end": 3_958_057,
        "bytes": 250,
        "sha256": "91d59e8fae0d047215d20fc7c53fc36a96a0817412538505d4a1008f75b95212",
        "lineNumber": 3606,
        "columnNumber": 290_923,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "historyAttribute": {
        "start": 3_975_774,
        "end": 3_975_974,
        "bytes": 200,
        "sha256": "dae075ea9bcef2f7de3b13d40387480a7ddbb082c2b08da2cf70a253999dc698",
        "lineNumber": 3606,
        "columnNumber": 308_890,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "historyTryGroup": {
        "start": 3_973_259,
        "end": 3_973_577,
        "bytes": 318,
        "sha256": "590867e3ce143550cb1bffc5c164b46cfefda5555bde24fe6bebc5ac5e05ca46",
        "lineNumber": 3606,
        "columnNumber": 306_375,
        "name": "",
        "arity": 4,
        "constructor": false
      },
      "historyGroup": {
        "start": 3_974_103,
        "end": 3_974_258,
        "bytes": 155,
        "sha256": "08da3778bb8b8d2053f0093a15ae7e4c15f16d1c3cb6d7761619c3f3673c6805",
        "lineNumber": 3606,
        "columnNumber": 307_246,
        "name": "getGroupModelHistoryCommand",
        "arity": 2,
        "constructor": false
      },
      "historyGroupClass": {
        "start": 1_805_275,
        "end": 1_806_364,
        "bytes": 1089,
        "sha256": "6b0f4dfedf6bbe525b42a8c792e8254c00ead7dace7fb36adb493063cd17b9a8",
        "lineNumber": 59,
        "columnNumber": 88_760,
        "name": "Ck",
        "arity": 1,
        "constructor": true
      },
      "historyBaseClass": {
        "start": 1_803_249,
        "end": 1_804_358,
        "bytes": 1109,
        "sha256": "d6daf449f473b617aebd31484d22227ef854df8fe8c15ccc8495cdb12eadf5ba",
        "lineNumber": 59,
        "columnNumber": 86_723,
        "name": "pf",
        "arity": 1,
        "constructor": true
      },
      "historyInitOldData": {
        "start": 1_805_831,
        "end": 1_806_153,
        "bytes": 322,
        "sha256": "916388e11e1c1627f2be558571b8faa57e1de96d7f447211957140c38617b48f",
        "lineNumber": 59,
        "columnNumber": 89_299,
        "name": "initOldData",
        "arity": 3,
        "constructor": false
      },
      "historyGroupData": {
        "start": 1_805_345,
        "end": 1_805_512,
        "bytes": 167,
        "sha256": "8f4a315ec7334f61031ebf4d33ac2fc9a86592d0913b57ce1b0f10f474f4af00",
        "lineNumber": 59,
        "columnNumber": 88_809,
        "name": "getData",
        "arity": 0,
        "constructor": false
      },
      "historyGroupUpdate": {
        "start": 1_806_284,
        "end": 1_806_363,
        "bytes": 79,
        "sha256": "bb6b52229c5874bcad43ec8110d8ef5c8b2e1fde6a7124bd4e2e6113369120ed",
        "lineNumber": 59,
        "columnNumber": 89_747,
        "name": "update",
        "arity": 0,
        "constructor": false
      },
      "historyBaseData": {
        "start": 1_803_315,
        "end": 1_803_380,
        "bytes": 65,
        "sha256": "6a05642c10a4014b91a90ca8772efff03a9476340c247159ce901c14ee900ae3",
        "lineNumber": 59,
        "columnNumber": 86_779,
        "name": "getData",
        "arity": 0,
        "constructor": false
      }
    },
    "tail": {
      "bboxTick": {
        "start": 3_960_081,
        "end": 3_960_391,
        "bytes": 310,
        "sha256": "a2e61bf0e1a6c747f21dded3a5b8dce6de46ad262dc0ba8aeb287e90d09cc29b",
        "lineNumber": 3606,
        "columnNumber": 293_197
      },
      "bboxTransact": {
        "start": 3_961_977,
        "end": 3_962_163,
        "bytes": 186,
        "sha256": "32601658f173b8690f32147beac5e2d5a9a203ae00f2f6712480023b66251dc3",
        "lineNumber": 3606,
        "columnNumber": 295_093
      },
      "bboxAfterAll": {
        "start": 3_962_034,
        "end": 3_962_160,
        "bytes": 126,
        "sha256": "aeed4dc39b2f2af86d41337ffb3f03240c20e6abe6fc18db927dc4ebbca15737",
        "lineNumber": 3606,
        "columnNumber": 295_150
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "groupAlias": "b8",
    "baseAlias": "Pf",
    "methods": {
      "pointsGet": {
        "start": 2_147_832,
        "end": 2_147_865,
        "bytes": 33,
        "sha256": "554ea2472f8d2bba679446cce1ac6c3c91c77a7a6d1fa96d5dc580690463bac9",
        "lineNumber": 557,
        "columnNumber": 234_745,
        "name": "get points",
        "arity": 0,
        "constructor": false
      },
      "pointsSet": {
        "start": 2_147_865,
        "end": 2_148_010,
        "bytes": 145,
        "sha256": "50254cd104fa912cb79c0e86041f99981c6c8053a9b50a6164df57e857c12db6",
        "lineNumber": 557,
        "columnNumber": 234_778,
        "name": "set points",
        "arity": 1,
        "constructor": false
      },
      "setLines": {
        "start": 3_971_747,
        "end": 3_972_232,
        "bytes": 485,
        "sha256": "3880c8aa2c2e509e73aeb464ee91aab65b14687642afe70d5065b7c6adbcd21c",
        "lineNumber": 4098,
        "columnNumber": 12_467,
        "name": "setLines",
        "arity": 1,
        "constructor": false
      },
      "modifyRecord": {
        "start": 1_893_897,
        "end": 1_894_131,
        "bytes": 234,
        "sha256": "785e2bb8b04f50a74c0cda4798c622d6ad410092f94d923b4f6221f5bc9dc362",
        "lineNumber": 556,
        "columnNumber": 114_251,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "modifyView": {
        "start": 1_893_198,
        "end": 1_893_358,
        "bytes": 160,
        "sha256": "86d78fde9fbbdf22f8a1412af6292c8808473633e8fb55c25e9567b2cc51239b",
        "lineNumber": 556,
        "columnNumber": 113_552,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "modifyAst": {
        "start": 1_893_841,
        "end": 1_893_883,
        "bytes": 42,
        "sha256": "0b278713c85e52953ed61d4ba0f6d7d31211ae3e4307b6d8f5cd64020925a549",
        "lineNumber": 556,
        "columnNumber": 114_195,
        "name": "t",
        "arity": 0,
        "constructor": false
      },
      "bboxAttribute": {
        "start": 4_169_468,
        "end": 4_169_547,
        "bytes": 79,
        "sha256": "c70c069625072326c85dbd744de7948409930929c4738cd974570861cd13c1b0",
        "lineNumber": 4105,
        "columnNumber": 160_851,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "bboxAdd": {
        "start": 4_167_209,
        "end": 4_167_612,
        "bytes": 403,
        "sha256": "392a33101d5a0c5d2e98225fac6bab7ea2a3baf13e1ed27642b38b31eaf90d5e",
        "lineNumber": 4105,
        "columnNumber": 158_592,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "bboxTryParent": {
        "start": 4_168_015,
        "end": 4_168_149,
        "bytes": 134,
        "sha256": "603a3ea6bd6f14093304acf038a709c131f2bb9222ad3a875502be9d9e951ec7",
        "lineNumber": 4105,
        "columnNumber": 159_398,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "bboxCommon": {
        "start": 4_167_645,
        "end": 4_167_781,
        "bytes": 136,
        "sha256": "510b108dee0fa2f4b4999704ee8e68ac89e9157353606205409e0c78d40e569b",
        "lineNumber": 4105,
        "columnNumber": 159_028,
        "name": "forCommon",
        "arity": 1,
        "constructor": false
      },
      "bboxUpdating": {
        "start": 4_167_794,
        "end": 4_167_949,
        "bytes": 155,
        "sha256": "ff6f2b531178e1bc6426b9b91dc34d81334c3ff8aed7c6a463f4a33cf0b672a7",
        "lineNumber": 4105,
        "columnNumber": 159_177,
        "name": "forUpdating",
        "arity": 1,
        "constructor": false
      },
      "bboxUpdate": {
        "start": 4_168_474,
        "end": 4_168_965,
        "bytes": 491,
        "sha256": "919bdf344946e98483f700d78d8650bf47dee17ae7414c68cc43e1cb7ab0d9b6",
        "lineNumber": 4105,
        "columnNumber": 159_863,
        "name": "update",
        "arity": 0,
        "constructor": false
      },
      "attrWatcher": {
        "start": 4_165_008,
        "end": 4_165_258,
        "bytes": 250,
        "sha256": "91d59e8fae0d047215d20fc7c53fc36a96a0817412538505d4a1008f75b95212",
        "lineNumber": 4105,
        "columnNumber": 156_391,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "historyAttribute": {
        "start": 4_182_975,
        "end": 4_183_175,
        "bytes": 200,
        "sha256": "dae075ea9bcef2f7de3b13d40387480a7ddbb082c2b08da2cf70a253999dc698",
        "lineNumber": 4105,
        "columnNumber": 174_358,
        "name": "",
        "arity": 1,
        "constructor": false
      },
      "historyTryGroup": {
        "start": 4_180_460,
        "end": 4_180_778,
        "bytes": 318,
        "sha256": "590867e3ce143550cb1bffc5c164b46cfefda5555bde24fe6bebc5ac5e05ca46",
        "lineNumber": 4105,
        "columnNumber": 171_843,
        "name": "",
        "arity": 4,
        "constructor": false
      },
      "historyGroup": {
        "start": 4_181_304,
        "end": 4_181_459,
        "bytes": 155,
        "sha256": "b04f0ab9ecbf2da7c29d3f93313670853db95145aa3a9f1143a80f08d84649eb",
        "lineNumber": 4105,
        "columnNumber": 172_714,
        "name": "getGroupModelHistoryCommand",
        "arity": 2,
        "constructor": false
      },
      "historyGroupClass": {
        "start": 6_280_134,
        "end": 6_281_223,
        "bytes": 1089,
        "sha256": "708da0fa592ae5e2e6f1724a9226b4153c703cb4582a4d2c2021e8dff46bce94",
        "lineNumber": 4331,
        "columnNumber": 75_944,
        "name": "b8",
        "arity": 1,
        "constructor": true
      },
      "historyBaseClass": {
        "start": 6_278_108,
        "end": 6_279_217,
        "bytes": 1109,
        "sha256": "1242b1333bd5d2da97dcedf496b082509740631adb01bcbcbb14f81938ec753d",
        "lineNumber": 4331,
        "columnNumber": 73_907,
        "name": "Pf",
        "arity": 1,
        "constructor": true
      },
      "historyInitOldData": {
        "start": 6_280_690,
        "end": 6_281_012,
        "bytes": 322,
        "sha256": "7ccbdbb9cea2e9e9847e3b2f5af1ebbd0fb3f4d73bced0128828e700945b8bd7",
        "lineNumber": 4331,
        "columnNumber": 76_483,
        "name": "initOldData",
        "arity": 3,
        "constructor": false
      },
      "historyGroupData": {
        "start": 6_280_204,
        "end": 6_280_371,
        "bytes": 167,
        "sha256": "8f4a315ec7334f61031ebf4d33ac2fc9a86592d0913b57ce1b0f10f474f4af00",
        "lineNumber": 4331,
        "columnNumber": 75_993,
        "name": "getData",
        "arity": 0,
        "constructor": false
      },
      "historyGroupUpdate": {
        "start": 6_281_143,
        "end": 6_281_222,
        "bytes": 79,
        "sha256": "bb6b52229c5874bcad43ec8110d8ef5c8b2e1fde6a7124bd4e2e6113369120ed",
        "lineNumber": 4331,
        "columnNumber": 76_931,
        "name": "update",
        "arity": 0,
        "constructor": false
      },
      "historyBaseData": {
        "start": 6_278_174,
        "end": 6_278_239,
        "bytes": 65,
        "sha256": "6a05642c10a4014b91a90ca8772efff03a9476340c247159ce901c14ee900ae3",
        "lineNumber": 4331,
        "columnNumber": 73_963,
        "name": "getData",
        "arity": 0,
        "constructor": false
      }
    },
    "tail": {
      "bboxTick": {
        "start": 4_167_282,
        "end": 4_167_592,
        "bytes": 310,
        "sha256": "a2e61bf0e1a6c747f21dded3a5b8dce6de46ad262dc0ba8aeb287e90d09cc29b",
        "lineNumber": 4105,
        "columnNumber": 158_665
      },
      "bboxTransact": {
        "start": 4_169_178,
        "end": 4_169_364,
        "bytes": 186,
        "sha256": "32601658f173b8690f32147beac5e2d5a9a203ae00f2f6712480023b66251dc3",
        "lineNumber": 4105,
        "columnNumber": 160_561
      },
      "bboxAfterAll": {
        "start": 4_169_235,
        "end": 4_169_361,
        "bytes": 126,
        "sha256": "aeed4dc39b2f2af86d41337ffb3f03240c20e6abe6fc18db927dc4ebbca15737",
        "lineNumber": 4105,
        "columnNumber": 160_618
      }
    }
  }
] as const);

export type CurrentSchematicWireTransitionRole=keyof typeof CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE[0]["methods"];

export const CURRENT_SCHEMATIC_WIRE_TRANSITION_ROLES=Object.freeze(["pointsGet", "pointsSet", "setLines", "modifyRecord", "modifyView", "modifyAst", "bboxAttribute", "bboxAdd", "bboxTryParent", "bboxCommon", "bboxUpdating", "bboxUpdate", "attrWatcher", "historyAttribute", "historyTryGroup", "historyGroup", "historyGroupClass", "historyBaseClass", "historyInitOldData", "historyGroupData", "historyGroupUpdate", "historyBaseData"] as const);

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);

const remote=z.strictObject({type:z.enum(["object","function","undefined","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().max(16_384).optional(),objectId:handle.optional(),value:z.unknown().optional(),unserializableValue:z.string().optional()});

const property=z.strictObject({name:z.string(),value:remote.optional(),get:remote.optional(),set:remote.optional(),writable:z.boolean().optional(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});

const internal=z.strictObject({name:z.string(),value:remote});

const packet=z.strictObject({result:z.array(property).max(4),internalProperties:z.array(internal).length(3)});

function need(value:boolean):asserts value{if(!value){throw new Error("SCHEMATIC_WIRE_TRANSITION_SOURCE");
}}
interface Span{readonly start:number;
readonly end:number;
readonly bytes:number;
readonly sha256:string}
/** First qualify the entire original bundle, then every new complete span. */
export function qualifyCurrentSchematicWireTransitionSource(input:unknown):0|1{const variant=qualifyBase(input);
const raw=captureCurrentSchematicDisplayAccessorSource(input);
const row:Readonly<{methods:Readonly<Record<string,Span>>;
tail:Readonly<Record<string,Span>>}>=CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE[variant];
for(const span of[...Object.values(row.methods),...Object.values(row.tail)]){const text=raw.scriptSource.slice(span.start,span.end);
need(Buffer.byteLength(text)===span.bytes&&createHash("sha256").update(text).digest("hex")===span.sha256);
}return variant;
}
export interface CurrentSchematicWireTransitionFunction {readonly objectId:string;
readonly scopes:string;
readonly parent:z.infer<typeof remote>;
readonly prototype:string|null}
/** Rejoin complete function text, own roster and actual original script PC.
 * A copied function, Proxy, renamed function or matching text elsewhere refuses. */
export function decodeCurrentSchematicWireTransitionFunction(input:unknown,actual:unknown,variant:0|1,role:CurrentSchematicWireTransitionRole,scriptId:string):CurrentSchematicWireTransitionFunction{handle.parse(scriptId);
need((variant===0||variant===1)&&!Object.is(variant,-0));
const expected=CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE[variant].methods[role];
const fn=remote.parse(capture(actual).value);
need(fn.type==="function"&&fn.subtype===undefined&&fn.className==="Function"&&fn.objectId!==undefined&&fn.value===undefined&&typeof fn.description==="string"&&Buffer.byteLength(fn.description)===expected.bytes&&createHash("sha256").update(fn.description).digest("hex")===expected.sha256);
const raw=packet.parse(capture(input).value);
const fields=new Map(raw.result.map(row=>[row.name,row]));
need(fields.size===raw.result.length&&fields.size===(expected.constructor?3:2));
for(const[key,value]of[["name",expected.name],["length",expected.arity]]as const){const field=fields.get(key);
need(field?.value!==undefined&&field.value.type===(key==="name"?"string":"number")&&field.value.value===value&&field.value.objectId===undefined&&field.writable===false&&!field.enumerable&&field.configurable);
}
 const values=new Map(raw.internalProperties.map(row=>[row.name,row.value]));
const location=values.get("[[FunctionLocation]]");const scopes=values.get("[[Scopes]]");const parent=values.get("[[Prototype]]");
need(values.size===3&&location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined);
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()}).parse(location.value);
need(site.scriptId===scriptId&&site.lineNumber===expected.lineNumber&&site.columnNumber===expected.columnNumber&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[[1-8]\]$/u.test(scopes.description??"")&&parent?.type==="function"&&parent.subtype===undefined&&parent.objectId!==undefined&&parent.value===undefined);
let prototype:string|null=null;
if(expected.constructor){const p=fields.get("prototype");
need(p?.value?.type==="object"&&p.value.subtype===undefined&&p.value.objectId!==undefined&&p.writable===false&&!p.enumerable&&!p.configurable);
prototype=p.value.objectId;
}return Object.freeze({objectId:fn.objectId,scopes:scopes.objectId,parent,prototype});
}
