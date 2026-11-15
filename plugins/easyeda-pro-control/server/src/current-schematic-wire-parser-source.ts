/** Complete original sheet-parser helper source. Whole source and metadata
 * are comparison data; original RPC/async event and native custody are separate. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as COMPLETION,compareCurrentSchematicWireFunctionMetadata,qualifyCurrentSchematicWireCompletionSource} from "./current-schematic-wire-completion-source.ts";
import {createHash} from "node:crypto";
import type {CurrentSchematicWireCompletionFunction} from "./current-schematic-wire-completion-source.ts";
import {captureCurrentSchematicDisplayAccessorSource} from "./current-schematic-display-accessor-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "timer": {
        "start": 304_289,
        "end": 304_357,
        "bytes": 68,
        "sha256": "c83dc701f2761daef1998866268a49ba2d80c8aeb191f0d6c5ee91a3668aef81",
        "name": "nu",
        "arity": 0,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 6,
        "columnNumber": 6262
      },
      "helper01": {
        "start": 5_447_913,
        "end": 5_448_819,
        "bytes": 906,
        "sha256": "d4a4a91d60170bf6f0dfbf62c64d9729d92cd36d49fa89851dfc4621ae4fd724",
        "name": "Htt",
        "arity": 4,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 135_748
      },
      "helper02": {
        "start": 5_448_819,
        "end": 5_450_875,
        "bytes": 2056,
        "sha256": "e34920fa80078c606d2a08e540384ffc37ffb2c5e76091a29a5968400150456c",
        "name": "Vtt",
        "arity": 4,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 136_654
      },
      "helper03": {
        "start": 5_450_875,
        "end": 5_451_267,
        "bytes": 392,
        "sha256": "0ad791da66e050043b593504cc079c445de7c6eaaf443682f6838a45ffd5ce04",
        "name": "ztt",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 138_710
      },
      "helper04": {
        "start": 5_460_523,
        "end": 5_460_953,
        "bytes": 430,
        "sha256": "09167c4ed449ba308b3525881407761488ad15fc9f094d5ef494dfba0856b0eb",
        "name": "$tt",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 148_358
      },
      "helper05": {
        "start": 5_460_953,
        "end": 5_461_308,
        "bytes": 355,
        "sha256": "24bfd1ff4c1a6c2b53097ebf7947187a3635a358410a025b5b8a0f20c40f6178",
        "name": "Qtt",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 148_788
      },
      "helper06": {
        "start": 5_461_308,
        "end": 5_461_621,
        "bytes": 313,
        "sha256": "9bbd8ae0e2565ad55e8841d638cf3617697ff03b85338fc3418a4e698368265b",
        "name": "eit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 149_143
      },
      "helper07": {
        "start": 5_461_621,
        "end": 5_461_963,
        "bytes": 342,
        "sha256": "fbac1333ec6a73609cbf4256921896ea98cc567e3746a19fceca1caefe5fafab",
        "name": "tit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 149_456
      },
      "helper08": {
        "start": 5_461_963,
        "end": 5_462_289,
        "bytes": 326,
        "sha256": "9be40f9ee7803b7489c414c48002cedb8c7e7c5c2da0d2101ff745ab1da73f93",
        "name": "iit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 149_798
      },
      "helper09": {
        "start": 5_462_289,
        "end": 5_462_526,
        "bytes": 237,
        "sha256": "bedba55a47eb017458a29d03af8196e4eb099ca5fdf33d963174e0f501597dff",
        "name": "rit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 150_124
      },
      "helper10": {
        "start": 5_460_142,
        "end": 5_460_523,
        "bytes": 381,
        "sha256": "f242c7ebb1c1e8639d96d25cbfa05d0c98f849af741deba0151bbbc4b7910e0d",
        "name": "Jtt",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 147_977
      },
      "helper11": {
        "start": 5_462_526,
        "end": 5_462_818,
        "bytes": 292,
        "sha256": "f77f733b58a0d387cebe63feda961ec365312647dc4fbb2b3daeb4751527efba",
        "name": "nit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 150_361
      },
      "helper12": {
        "start": 5_462_818,
        "end": 5_463_098,
        "bytes": 280,
        "sha256": "5daf965a3d673fbd8f07204884713ac794b03bb8968196cedfac32f5b0af9256",
        "name": "sit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 150_653
      },
      "helper13": {
        "start": 5_463_274,
        "end": 5_463_444,
        "bytes": 170,
        "sha256": "ed5c6ad4c18253d48e252bd639f415268401924c2621c67db8788b90aa39d799",
        "name": "oit",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 151_109
      },
      "helper14": {
        "start": 5_463_098,
        "end": 5_463_274,
        "bytes": 176,
        "sha256": "9a9475d5b524cfe6c363ee68f56866eeb920edb0f76b00e905bdbf94227f86e5",
        "name": "ait",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 150_933
      },
      "helper15": {
        "start": 5_451_267,
        "end": 5_454_339,
        "bytes": 3072,
        "sha256": "70c33640547c6db7fb6ca8ad02d8c40f158923fd877e359949ad7d50feac3f03",
        "name": "Ytt",
        "arity": 4,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "lineNumber": 3673,
        "columnNumber": 139_108
      },
      "helper16": {
        "start": 5_456_713,
        "end": 5_456_896,
        "bytes": 183,
        "sha256": "a984ee6d50bddd00e6e7613535a537dfb1df8effdc7f260ee57f6f42d83c1901",
        "name": "Xtt",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 144_548
      },
      "helper17": {
        "start": 5_457_585,
        "end": 5_457_838,
        "bytes": 253,
        "sha256": "c85a731d55762195f2e4c973b384880c85892cab74665fe4821910758e416355",
        "name": "Ktt",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 145_420
      },
      "helper18": {
        "start": 5_457_838,
        "end": 5_460_142,
        "bytes": 2304,
        "sha256": "a38eb2193dd9f8f1dadf123da5fd95d222eee55d394662246230b8e46e66f618",
        "name": "Ztt",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 145_673
      },
      "helper19": {
        "start": 5_456_896,
        "end": 5_457_585,
        "bytes": 689,
        "sha256": "63ef4ac0487e85d4ad093c05942789649f0624c785531d079d255f79a77bd324",
        "name": "qtt",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 144_731
      },
      "helper20": {
        "start": 5_463_444,
        "end": 5_469_143,
        "bytes": 5699,
        "sha256": "689f33718c25b599739b6fe27d00e7e45a0ec2fb487384835535d608e0149562",
        "name": "lit",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "lineNumber": 3673,
        "columnNumber": 151_285
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "timer": {
        "start": 1_327_701,
        "end": 1_327_769,
        "bytes": 68,
        "sha256": "4a2483e7f89a5a42de224ae556b075ab4603bbd133e183026adb29adc5f84cf0",
        "name": "cu",
        "arity": 0,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 532,
        "columnNumber": 6262
      },
      "helper01": {
        "start": 3_921_418,
        "end": 3_922_324,
        "bytes": 906,
        "sha256": "b482171ef5b13bd8f08f9127272932e78192e88a8ca3524361592866f487cb13",
        "name": "xJe",
        "arity": 4,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 43_800
      },
      "helper02": {
        "start": 3_922_324,
        "end": 3_924_380,
        "bytes": 2056,
        "sha256": "7c59768335584de07be052c80523ab78c3d468276136019764698428a7311e54",
        "name": "TJe",
        "arity": 4,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 44_706
      },
      "helper03": {
        "start": 3_924_380,
        "end": 3_924_772,
        "bytes": 392,
        "sha256": "6dd4d6f7111c629684cf24ba8f29c49062e7b2f0fd8b032640a9dbb3be457653",
        "name": "CJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 46_762
      },
      "helper04": {
        "start": 3_934_028,
        "end": 3_934_458,
        "bytes": 430,
        "sha256": "710844331bcb84cd8a5426f55389fbc67cb2027af2f2d379bc0faac06b8ad391",
        "name": "NJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 56_410
      },
      "helper05": {
        "start": 3_934_458,
        "end": 3_934_813,
        "bytes": 355,
        "sha256": "8d432eb99e1eb7776957938c0f12a40f00dedbb62c22d5fc550a277f13343a47",
        "name": "BJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 56_840
      },
      "helper06": {
        "start": 3_934_813,
        "end": 3_935_126,
        "bytes": 313,
        "sha256": "a8e134c2028b19fadc518c0609d900493e181b702f193e9b61b287a7e05843d0",
        "name": "LJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 57_195
      },
      "helper07": {
        "start": 3_935_126,
        "end": 3_935_468,
        "bytes": 342,
        "sha256": "fa656403d629d86fcc910b8a921ac8c03aef9cc59b998979bf8652c76cde939a",
        "name": "kJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 57_508
      },
      "helper08": {
        "start": 3_935_468,
        "end": 3_935_794,
        "bytes": 326,
        "sha256": "f05e378ab5edeea406e965ec564819ef3fe52d8639921b1b1108089e810b6834",
        "name": "RJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 57_850
      },
      "helper09": {
        "start": 3_935_794,
        "end": 3_936_031,
        "bytes": 237,
        "sha256": "60a9fee308895507fd95014db39221728c56867e4b96949763ebe6f733e7fc29",
        "name": "FJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 58_176
      },
      "helper10": {
        "start": 3_933_647,
        "end": 3_934_028,
        "bytes": 381,
        "sha256": "819514bae5d4c902b02243e3a75e6bd0129cdae5d0e7fc0f0c0777279827c470",
        "name": "DJe",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 56_029
      },
      "helper11": {
        "start": 3_936_031,
        "end": 3_936_323,
        "bytes": 292,
        "sha256": "9eb154496c911aa57863b29c786352b6d58638962bcde7a143a820a2272264e8",
        "name": "UJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 58_413
      },
      "helper12": {
        "start": 3_936_323,
        "end": 3_936_603,
        "bytes": 280,
        "sha256": "45fd4a4a737bed9db992f96dcfa90db10a91ba94b8f35e8c2f0baaa45676643e",
        "name": "GJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 58_705
      },
      "helper13": {
        "start": 3_936_779,
        "end": 3_936_949,
        "bytes": 170,
        "sha256": "ee2a69dff38a9c35967318355592feb44ee845fd50d2252dc5650bad170bd773",
        "name": "HJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 59_161
      },
      "helper14": {
        "start": 3_936_603,
        "end": 3_936_779,
        "bytes": 176,
        "sha256": "95c911a3bc4b193fc7873342b5378603a5c453199ef6740a34274425967e9ec3",
        "name": "jJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 58_985
      },
      "helper15": {
        "start": 3_924_772,
        "end": 3_927_844,
        "bytes": 3072,
        "sha256": "60643232cc8cbf8e1956da1814e8de7c0db2441799c14985616b9d2a35e758f0",
        "name": "wJe",
        "arity": 4,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "lineNumber": 4097,
        "columnNumber": 47_160
      },
      "helper16": {
        "start": 3_930_218,
        "end": 3_930_401,
        "bytes": 183,
        "sha256": "26de56df3b4e9d3bccaf31eddd90cb8e7b2b68e6581f03454b8da768aee501f9",
        "name": "EJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 52_600
      },
      "helper17": {
        "start": 3_931_090,
        "end": 3_931_343,
        "bytes": 253,
        "sha256": "dd07e93fb3cf2a83f1c69030a52eafef26bb005f4b61a3eca5ab66dae374e4d8",
        "name": "PJe",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 53_472
      },
      "helper18": {
        "start": 3_931_343,
        "end": 3_933_647,
        "bytes": 2304,
        "sha256": "06d76e9bec779ca12cf79a50d02cc67153bc9d067b85dff6970503685d269b36",
        "name": "AJe",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 53_725
      },
      "helper19": {
        "start": 3_930_401,
        "end": 3_931_090,
        "bytes": 689,
        "sha256": "16a04765cf27bd78477329a3433cba1dfab3a0ee43414781be490e9c7061c059",
        "name": "MJe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4097,
        "columnNumber": 52_783
      },
      "helper20": {
        "start": 3_936_949,
        "end": 3_942_648,
        "bytes": 5699,
        "sha256": "e9de8864d85120799f970dcbdc1bae0763dbbe07349c3a59cb9a52d2eb203fdb",
        "name": "VJe",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "lineNumber": 4097,
        "columnNumber": 59_337
      }
    }
  }
] as const);
export const CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_ROLES=Object.freeze(["timer", "helper01", "helper02", "helper03", "helper04", "helper05", "helper06", "helper07", "helper08", "helper09", "helper10", "helper11", "helper12", "helper13", "helper14", "helper15", "helper16", "helper17", "helper18", "helper19", "helper20"] as const);
export type CurrentSchematicWireParserHelperRole=typeof CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_ROLES[number];
export const CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_FRAMES=Object.freeze(["[nu,Htt,Vtt,ztt,$tt,Qtt,eit,tit,iit,rit,Jtt,nit,sit,oit,ait,Ytt,Xtt,Ktt,Ztt,qtt,lit]", "[cu,xJe,TJe,CJe,NJe,BJe,LJe,kJe,RJe,FJe,DJe,UJe,GJe,HJe,jJe,wJe,EJe,PJe,AJe,MJe,VJe]"] as const);
export const CURRENT_SCHEMATIC_WIRE_PARSER_MEMBERS=freezeDeep([
  {
    "variant": 0,
    "rows": {
      "getEvent": {
        "start": 5_541_588,
        "end": 5_541_953,
        "bytes": 365,
        "sha256": "784d5a18718d8ce209192efe653004dedea00c0ef30f39c1c6def19834ced2f9",
        "name": "getEvent",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 229_419
      },
      "getBatch": {
        "start": 5_549_573,
        "end": 5_549_609,
        "bytes": 36,
        "sha256": "a58d6ec80b65cbecac70480cd8d271301d07555b91df621daa78eece6b9346f3",
        "name": "getBatch",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 3673,
        "columnNumber": 237_404
      }
    }
  },
  {
    "variant": 1,
    "rows": {
      "getEvent": {
        "start": 4_091_913,
        "end": 4_092_278,
        "bytes": 365,
        "sha256": "784d5a18718d8ce209192efe653004dedea00c0ef30f39c1c6def19834ced2f9",
        "name": "getEvent",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4105,
        "columnNumber": 83_304
      },
      "getBatch": {
        "start": 4_099_898,
        "end": 4_099_934,
        "bytes": 36,
        "sha256": "a58d6ec80b65cbecac70480cd8d271301d07555b91df621daa78eece6b9346f3",
        "name": "getBatch",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "lineNumber": 4105,
        "columnNumber": 91_289
      }
    }
  }
] as const);
/** Whole original source precedes all twenty-one complete helper spans. */
export function qualifyCurrentSchematicWireParserSource(input:unknown):0|1{
 const variant=qualifyCurrentSchematicWireCompletionSource(input);const text=captureCurrentSchematicDisplayAccessorSource(input).scriptSource;
 for(const role of CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_ROLES){const row=CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS[variant].rows[role];const body=text.slice(row.start,row.end);if(Buffer.byteLength(body)!==row.bytes||createHash("sha256").update(body).digest("hex")!==row.sha256){throw new Error("SCHEMATIC_WIRE_PARSER_HELPER_SOURCE");}}
 for(const role of ["getEvent","getBatch"] as const){const row=CURRENT_SCHEMATIC_WIRE_PARSER_MEMBERS[variant].rows[role];const body=text.slice(row.start,row.end);if(Buffer.byteLength(body)!==row.bytes||createHash("sha256").update(body).digest("hex")!==row.sha256){throw new Error("SCHEMATIC_WIRE_PARSER_MEMBER_SOURCE");}}
 return variant;
}
/** A matching helper never issues an event, callback or invocation owner. */
export function decodeCurrentSchematicWireParserHelperFunction(input:unknown,actual:unknown,variant:0|1,role:CurrentSchematicWireParserHelperRole,scriptId:string):CurrentSchematicWireCompletionFunction{
 if((variant!==0&&variant!==1)||Object.is(variant,-0)||!CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_ROLES.includes(role)){throw new Error("SCHEMATIC_WIRE_PARSER_HELPER_ROLE");}
 return compareCurrentSchematicWireFunctionMetadata(input,actual,CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS[variant].rows[role],scriptId);
}

export const CURRENT_SCHEMATIC_WIRE_PARSER_POINTS=freezeDeep([
  {
    "variant": 0,
    "points": {
      "shapeDidTransact": {
        "entry": {
          "lineNumber": 3614,
          "columnNumber": 134_753
        },
        "returned": {
          "lineNumber": 3614,
          "columnNumber": 134_929
        }
      },
      "docParse": {
        "entry": {
          "lineNumber": 3673,
          "columnNumber": 59_193
        },
        "returned": {
          "lineNumber": 3673,
          "columnNumber": 59_308
        }
      },
      "sheetAst": {
        "entry": {
          "lineNumber": 3673,
          "columnNumber": 134_790
        },
        "returned": {
          "lineNumber": 3673,
          "columnNumber": 135_735
        }
      },
      "sheetParse": {
        "entry": {
          "lineNumber": 3697,
          "columnNumber": 74_809
        },
        "returned": {
          "lineNumber": 3697,
          "columnNumber": 75_042
        }
      },
      "astUpdate": {
        "entry": {
          "lineNumber": 3673,
          "columnNumber": 236_490
        },
        "returned": {
          "lineNumber": 3673,
          "columnNumber": 236_749
        }
      },
      "astPassSchematic": {
        "entry": {
          "lineNumber": 3673,
          "columnNumber": 236_782
        },
        "returned": {
          "lineNumber": 3673,
          "columnNumber": 236_961
        }
      },
      "astPassContent": {
        "entry": {
          "lineNumber": 3673,
          "columnNumber": 230_368
        },
        "returned": {
          "lineNumber": 3673,
          "columnNumber": 230_437
        }
      }
    }
  },
  {
    "variant": 1,
    "points": {
      "shapeDidTransact": {
        "entry": {
          "lineNumber": 4113,
          "columnNumber": 131_835
        },
        "returned": {
          "lineNumber": 4113,
          "columnNumber": 132_011
        }
      },
      "docParse": {
        "entry": {
          "lineNumber": 4191,
          "columnNumber": 64_293
        },
        "returned": {
          "lineNumber": 4191,
          "columnNumber": 64_408
        }
      },
      "sheetAst": {
        "entry": {
          "lineNumber": 4097,
          "columnNumber": 42_842
        },
        "returned": {
          "lineNumber": 4097,
          "columnNumber": 43_787
        }
      },
      "sheetParse": {
        "entry": {
          "lineNumber": 4331,
          "columnNumber": 203_669
        },
        "returned": {
          "lineNumber": 4331,
          "columnNumber": 203_902
        }
      },
      "astUpdate": {
        "entry": {
          "lineNumber": 4105,
          "columnNumber": 90_375
        },
        "returned": {
          "lineNumber": 4105,
          "columnNumber": 90_634
        }
      },
      "astPassSchematic": {
        "entry": {
          "lineNumber": 4105,
          "columnNumber": 90_667
        },
        "returned": {
          "lineNumber": 4105,
          "columnNumber": 90_846
        }
      },
      "astPassContent": {
        "entry": {
          "lineNumber": 4105,
          "columnNumber": 84_253
        },
        "returned": {
          "lineNumber": 4105,
          "columnNumber": 84_322
        }
      }
    }
  }
] as const);
export type CurrentSchematicWireParserRole=keyof typeof CURRENT_SCHEMATIC_WIRE_PARSER_POINTS[0]["points"];
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:handle,location:site,functionLocation:site.optional(),returnValue:z.unknown().optional()});
const paused=z.object({reason:z.literal("other"),hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
const promise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
/** Compare an original source-held parser location and its actual native
 * async return object. Parsing cannot issue that event or Promise ownership. */
export function decodeCurrentSchematicWireParserPause(input:unknown,variant:0|1,role:CurrentSchematicWireParserRole,stage:"entry"|"returned",scriptId:string,breakpointId:string):Readonly<{frame:string;promise:string|null;originalEventJoined:false}>{
 if((variant!==0&&variant!==1)||Object.is(variant,-0)){throw new Error("SCHEMATIC_WIRE_PARSER_VARIANT");}z.enum(["entry","returned"]).parse(stage);handle.parse(scriptId);handle.parse(breakpointId);
 const raw=paused.parse(capture(input).value);const top=raw.callFrames[0];const row=COMPLETION[variant].rows[role];const point=CURRENT_SCHEMATIC_WIRE_PARSER_POINTS[variant].points[role][stage];
 if(top===undefined||raw.hitBreakpoints[0]!==breakpointId||top.location.scriptId!==scriptId||top.location.lineNumber!==point.lineNumber||top.location.columnNumber!==point.columnNumber||top.functionLocation?.scriptId!==scriptId||top.functionLocation.lineNumber!==row.lineNumber||top.functionLocation.columnNumber!==row.columnNumber){throw new Error("SCHEMATIC_WIRE_PARSER_PAUSE");}
 let nativePromise:string|null=null;if(stage==="entry"){if(top.returnValue!==undefined){throw new Error("SCHEMATIC_WIRE_PARSER_EARLY_RETURN");}}else if(role==="shapeDidTransact"){z.strictObject({type:z.literal("undefined")}).parse(top.returnValue);}else {nativePromise=promise.parse(top.returnValue).objectId;}
 return Object.freeze({frame:top.callFrameId,promise:nativePromise,originalEventJoined:false});
}
