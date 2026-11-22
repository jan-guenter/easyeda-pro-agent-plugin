/** Exact original registration functions. Source matches alone grant no owner. */
 import {createHash} from "node:crypto";
 import {captureQualifiedCurrentSchematicWireCompletionSource,compareCurrentSchematicWireFunctionMetadata} from "./current-schematic-wire-completion-source.ts";
 import {freezeDeep} from "./sqlite-inventory-core.ts";

 export const CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE=freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "watch": {
        "start": 3_946_515,
        "end": 3_946_781,
        "bytes": 266,
        "sha256": "330d8d332bb76b6e12a3a912d5b31fdbeece9e01b7eaaeef6e721b2cd967b05d",
        "name": "watch",
        "arity": 0,
        "functionStart": 3_946_520,
        "bodyStart": 3_946_522,
        "bodyEnd": 3_946_781,
        "lineNumber": 3606,
        "columnNumber": 279_636
      },
      "bboxOnUpdate": {
        "start": 3_961_161,
        "end": 3_961_204,
        "bytes": 43,
        "sha256": "93ffb747515fb4d5c39d2dc9336aa9376dd7fc64b860c06e7dd149ae4fed8019",
        "name": "get onUpdate",
        "arity": 0,
        "functionStart": 3_961_173,
        "bodyStart": 3_961_175,
        "bodyEnd": 3_961_204,
        "lineNumber": 3606,
        "columnNumber": 294_289
      },
      "dispatcherEventGet": {
        "start": 329_918,
        "end": 330_277,
        "bytes": 359,
        "sha256": "6000e31c3bd084afdac58fcdb40d46d62e1da8c68e0fb28a30e2afbf81fe516b",
        "name": "get event",
        "arity": 0,
        "functionStart": 329_927,
        "bodyStart": 329_929,
        "bodyEnd": 330_277,
        "lineNumber": 6,
        "columnNumber": 31_889
      },
      "dispatcherEvent": {
        "start": 329_963,
        "end": 330_263,
        "bytes": 300,
        "sha256": "79ffe6d6047b879bee35566341f1684a88673e009b136dd9e85dcf51f772fe86",
        "name": "",
        "arity": 0,
        "functionStart": 329_963,
        "bodyStart": 329_973,
        "bodyEnd": 330_263,
        "lineNumber": 6,
        "columnNumber": 31_925
      },
      "register": {
        "start": 325_424,
        "end": 325_703,
        "bytes": 279,
        "sha256": "86f05a168bffe4ad38bbcfa613b2332634818fda392aad4282ffb0b1c090b399",
        "name": "register",
        "arity": 1,
        "functionStart": 325_432,
        "bodyStart": 325_435,
        "bodyEnd": 325_703,
        "lineNumber": 6,
        "columnNumber": 27_394
      },
      "listener": {
        "start": 3_946_611,
        "end": 3_946_776,
        "bytes": 165,
        "sha256": "b92da5218b1dd8ca265c234ae23f4f0918ce9b9fc398ded2c8389d7af7717f22",
        "name": "",
        "arity": 1,
        "functionStart": 3_946_611,
        "bodyStart": 3_946_629,
        "bodyEnd": 3_946_776,
        "lineNumber": 3606,
        "columnNumber": 279_727
      },
      "dispose": {
        "start": 325_150,
        "end": 325_170,
        "bytes": 20,
        "sha256": "7a33e009cf37552a2fd198b758a5fc82cb6ebbe27962e3b95dfbfa59a1b7523c",
        "name": "dispose",
        "arity": 0,
        "functionStart": 325_157,
        "bodyStart": 325_159,
        "bodyEnd": 325_170,
        "lineNumber": 6,
        "columnNumber": 27_119
      },
      "baseWatch": {
        "start": 4_570_122,
        "end": 4_570_303,
        "bytes": 181,
        "sha256": "8b27750acf3ea9c57bb5cda5514938a9e9ffdc19a9931d820e4812686677b42c",
        "name": "baseWatch",
        "arity": 0,
        "functionStart": 4_570_131,
        "bodyStart": 4_570_133,
        "bodyEnd": 4_570_303,
        "lineNumber": 3614,
        "columnNumber": 135_003
      }
    },
    "actors": {
      "collection": {
        "alias": "IB",
        "start": 325_185,
        "end": 325_763,
        "bytes": 578,
        "sha256": "a37f5494520be1a4212a3298457c8c549510d624b95f7514c1eef4d568deedd4"
      },
      "dispatcherBase": {
        "alias": "DB",
        "start": 329_365,
        "end": 331_011,
        "bytes": 1646,
        "sha256": "6e4488bf3090ba9edc268159be973ec2384b84d9b1d64718273b90fb1c2ae082"
      },
      "dispatcher": {
        "alias": "Vt",
        "start": 331_012,
        "end": 331_313,
        "bytes": 301,
        "sha256": "a999c35d1d3d1cee7875f9109f3b9fbe18b158a5e1b27db42f91ae2736d8ded6"
      },
      "symbols": [
        {
          "alias": "nC",
          "start": 324_703,
          "end": 324_732,
          "bytes": 29,
          "sha256": "a739861318f1224d629a958d659c1afab0c835eaca12dc783a9cd90086d5ef49"
        },
        {
          "alias": "wB",
          "start": 324_675,
          "end": 324_702,
          "bytes": 27,
          "sha256": "55784b12d602cafc28f5f63b4fff842f62fa6bf5fb9b5fdaa33af9418b9592a9"
        }
      ],
      "disposeFactory": {
        "alias": "tn",
        "start": 325_128,
        "end": 325_181,
        "bytes": 53,
        "sha256": "f9ff79823c657847197f5f86c7936b4d6bbac926eb70bd85f7dc022121174096"
      }
    },
    "points": {
      "watch": {
        "lineNumber": 3606,
        "columnNumber": 279_645
      },
      "returned": {
        "lineNumber": 3606,
        "columnNumber": 279_896
      },
      "event": {
        "lineNumber": 6,
        "columnNumber": 31_948
      },
      "register": {
        "lineNumber": 6,
        "columnNumber": 27_398
      },
      "eventCaller": {
        "lineNumber": 3606,
        "columnNumber": 279_718
      },
      "registerCaller": {
        "lineNumber": 3606,
        "columnNumber": 279_679
      },
      "parentCaller": {
        "lineNumber": 3614,
        "columnNumber": 135_039
      },
      "parentReturned": {
        "lineNumber": 6,
        "columnNumber": 27_664
      },
      "parentRegister": {
        "lineNumber": 6,
        "columnNumber": 27_398
      }
    },
    "symbolNames": [
      "nC",
      "wB"
    ]
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "watch": {
        "start": 4_151_582,
        "end": 4_151_848,
        "bytes": 266,
        "sha256": "330d8d332bb76b6e12a3a912d5b31fdbeece9e01b7eaaeef6e721b2cd967b05d",
        "name": "watch",
        "arity": 0,
        "functionStart": 4_151_587,
        "bodyStart": 4_151_589,
        "bodyEnd": 4_151_848,
        "lineNumber": 4105,
        "columnNumber": 142_970
      },
      "bboxOnUpdate": {
        "start": 4_168_362,
        "end": 4_168_405,
        "bytes": 43,
        "sha256": "93ffb747515fb4d5c39d2dc9336aa9376dd7fc64b860c06e7dd149ae4fed8019",
        "name": "get onUpdate",
        "arity": 0,
        "functionStart": 4_168_374,
        "bodyStart": 4_168_376,
        "bodyEnd": 4_168_405,
        "lineNumber": 4105,
        "columnNumber": 159_757
      },
      "dispatcherEventGet": {
        "start": 1_353_330,
        "end": 1_353_689,
        "bytes": 359,
        "sha256": "016aac4b133e467ddf7cdd62be95a1da6e19270a304be7d9304408e0a01a8a14",
        "name": "get event",
        "arity": 0,
        "functionStart": 1_353_339,
        "bodyStart": 1_353_341,
        "bodyEnd": 1_353_689,
        "lineNumber": 532,
        "columnNumber": 31_889
      },
      "dispatcherEvent": {
        "start": 1_353_375,
        "end": 1_353_675,
        "bytes": 300,
        "sha256": "bd2c2f668d6588cab1a0ada96aab48adfd7ee2073ca18f73247b1e48461c9278",
        "name": "",
        "arity": 0,
        "functionStart": 1_353_375,
        "bodyStart": 1_353_385,
        "bodyEnd": 1_353_675,
        "lineNumber": 532,
        "columnNumber": 31_925
      },
      "register": {
        "start": 1_348_836,
        "end": 1_349_115,
        "bytes": 279,
        "sha256": "2cbcd42cc155af5cca472f57c1b1f6b36a748652d60185763b2562b84d6210f3",
        "name": "register",
        "arity": 1,
        "functionStart": 1_348_844,
        "bodyStart": 1_348_847,
        "bodyEnd": 1_349_115,
        "lineNumber": 532,
        "columnNumber": 27_394
      },
      "listener": {
        "start": 4_151_678,
        "end": 4_151_843,
        "bytes": 165,
        "sha256": "b92da5218b1dd8ca265c234ae23f4f0918ce9b9fc398ded2c8389d7af7717f22",
        "name": "",
        "arity": 1,
        "functionStart": 4_151_678,
        "bodyStart": 4_151_696,
        "bodyEnd": 4_151_843,
        "lineNumber": 4105,
        "columnNumber": 143_061
      },
      "dispose": {
        "start": 1_348_562,
        "end": 1_348_582,
        "bytes": 20,
        "sha256": "65b4c779e7ee5a57d143b3a62a9e5fe26075721c5e043ca392410742e88831bb",
        "name": "dispose",
        "arity": 0,
        "functionStart": 1_348_569,
        "bodyStart": 1_348_571,
        "bodyEnd": 1_348_582,
        "lineNumber": 532,
        "columnNumber": 27_119
      },
      "baseWatch": {
        "start": 4_789_973,
        "end": 4_790_154,
        "bytes": 181,
        "sha256": "8b27750acf3ea9c57bb5cda5514938a9e9ffdc19a9931d820e4812686677b42c",
        "name": "baseWatch",
        "arity": 0,
        "functionStart": 4_789_982,
        "bodyStart": 4_789_984,
        "bodyEnd": 4_790_154,
        "lineNumber": 4113,
        "columnNumber": 132_085
      }
    },
    "actors": {
      "collection": {
        "alias": "EL",
        "start": 1_348_597,
        "end": 1_349_175,
        "bytes": 578,
        "sha256": "2466dc1a616ee1124e7f1595b4a8000537ef8cb198f2082560b89291a63f8704"
      },
      "dispatcherBase": {
        "alias": "NL",
        "start": 1_352_777,
        "end": 1_354_423,
        "bytes": 1646,
        "sha256": "b3ecfe1c6b35ff1b8bd9916c42680dbba742fd9cca14df16afdca89280c7fca3"
      },
      "dispatcher": {
        "alias": "Vt",
        "start": 1_354_424,
        "end": 1_354_725,
        "bytes": 301,
        "sha256": "a08d15597de73a5c9a346baefe008337e6709155c3b4991ed60867da6d63de85"
      },
      "symbols": [
        {
          "alias": "LC",
          "start": 1_348_115,
          "end": 1_348_144,
          "bytes": 29,
          "sha256": "3ab29550ac3a921a4903e23f71c60923cbeae7c6d7e3eefa0bcbfd863d860067"
        },
        {
          "alias": "IL",
          "start": 1_348_087,
          "end": 1_348_114,
          "bytes": 27,
          "sha256": "dbab9491e216c4e3622a591116ec6057a35d7ee703904db4e71b886ef7df024e"
        }
      ],
      "disposeFactory": {
        "alias": "rn",
        "start": 1_348_540,
        "end": 1_348_593,
        "bytes": 53,
        "sha256": "15c2d5e75eab59415a70ae5fe433420e8ccdb429a5fb7ef9a065d5fbf917f662"
      }
    },
    "points": {
      "watch": {
        "lineNumber": 4105,
        "columnNumber": 142_979
      },
      "returned": {
        "lineNumber": 4105,
        "columnNumber": 143_230
      },
      "event": {
        "lineNumber": 532,
        "columnNumber": 31_948
      },
      "register": {
        "lineNumber": 532,
        "columnNumber": 27_398
      },
      "eventCaller": {
        "lineNumber": 4105,
        "columnNumber": 143_052
      },
      "registerCaller": {
        "lineNumber": 4105,
        "columnNumber": 143_013
      },
      "parentCaller": {
        "lineNumber": 4113,
        "columnNumber": 132_121
      },
      "parentReturned": {
        "lineNumber": 532,
        "columnNumber": 27_664
      },
      "parentRegister": {
        "lineNumber": 532,
        "columnNumber": 27_398
      }
    },
    "symbolNames": [
      "LC",
      "IL"
    ]
  }
] as const);

 export type CurrentSchematicWireNetWatchRole=keyof typeof CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE[0]["rows"];
 export function qualifyCurrentSchematicWireNetWatchSource(input:unknown):0|1{
  const data=captureQualifiedCurrentSchematicWireCompletionSource(input);const profile=CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE[data.variant];
  const spans:Readonly<Record<CurrentSchematicWireNetWatchRole,Readonly<{start:number;end:number;bytes:number;sha256:string}>>>=profile.rows;
  for(const row of [...Object.values(spans),profile.actors.collection,profile.actors.dispatcherBase,profile.actors.dispatcher,profile.actors.disposeFactory,...profile.actors.symbols]){
   const text=data.scriptSource.slice(row.start,row.end);if(Buffer.byteLength(text)!==row.bytes||createHash("sha256").update(text).digest("hex")!==row.sha256){throw new Error("WIRE_NET_WATCH_SOURCE");}
  }return data.variant;
 }
 export function qualifyCurrentSchematicWireNetWatchFunction(input:unknown,actual:unknown,variant:0|1,role:CurrentSchematicWireNetWatchRole,scriptId:string):string{
  if((variant!==0&&variant!==1)||Object.is(variant,-0)){throw new Error("WIRE_NET_WATCH_VARIANT");}const row=CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE[variant].rows[role];
  return compareCurrentSchematicWireFunctionMetadata(input,actual,{...row,constructible:false,className:"Function",parentType:"function",parentClassName:"Function",parentDescription:"function () { [native code] }"},scriptId).objectId;
 }
