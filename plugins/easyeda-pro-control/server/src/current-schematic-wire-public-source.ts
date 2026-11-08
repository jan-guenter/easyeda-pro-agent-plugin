/** Exact public Wire call path. Source bytes do not grant receiver, native job,
 * callback, history, SQL, Save or reopened authority. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_PUBLIC_SOURCE=freezeDeep([
  {
    "relativePath": "pro-api/0.3.59.1ca9efb5/api.js",
    "bytes": 1_980_754,
    "sha256": "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1",
    "roles": {
      "apiClass": {
        "start": 1_610_358,
        "end": 1_611_744,
        "bytes": 1386,
        "sha256": "411a9f804f38572d0eb9c318e8e3294ecaf9d83d5f9183525575298f7520f285",
        "lineNumber": 38,
        "columnNumber": 82_441
      },
      "stateClass": {
        "start": 1_611_748,
        "end": 1_614_002,
        "bytes": 2254,
        "sha256": "bb4863aa607f855deea9f39a66ecd9de9c78b70fad633d03966fbca54ce9d4f6",
        "lineNumber": 38,
        "columnNumber": 83_831
      },
      "apiClass_create": {
        "start": 1_610_364,
        "end": 1_610_428,
        "bytes": 64,
        "sha256": "3d78650866ca453418bc72056aa51637dd35fedcd33bae0f4a038ac2bf98a56a",
        "lineNumber": 38,
        "columnNumber": 82_447
      },
      "apiClass_modify": {
        "start": 1_610_665,
        "end": 1_611_048,
        "bytes": 383,
        "sha256": "cec712603a29c4d713ad10185f613974b83a9380562208100b79f0d213914e7c",
        "lineNumber": 38,
        "columnNumber": 82_748
      },
      "apiClass_delete": {
        "start": 1_610_428,
        "end": 1_610_665,
        "bytes": 237,
        "sha256": "f66008a94269a9e70ecbf1b25deb3ec57155b4455f5e9bd34ad7fcd777aaf5e6",
        "lineNumber": 38,
        "columnNumber": 82_511
      },
      "stateClass_constructor": {
        "start": 1_611_754,
        "end": 1_611_930,
        "bytes": 176,
        "sha256": "34aac7910a45260a6d960f8d2893039332e3eb13537ebce5c88b04908d5c8900",
        "lineNumber": 38,
        "columnNumber": 83_837
      },
      "stateClass_create": {
        "start": 1_611_930,
        "end": 1_612_521,
        "bytes": 591,
        "sha256": "9a1f5952d7e3dddda5e7f57afaf51ee70578accbefcaed0bd07e5ad3c5f52e22",
        "lineNumber": 38,
        "columnNumber": 84_013
      },
      "stateClass_done": {
        "start": 1_613_540,
        "end": 1_614_001,
        "bytes": 461,
        "sha256": "24397364e6be3d0e942f7f3ac8c33eb1f9cc090cfe829e933e9d0985024c8c9d",
        "lineNumber": 38,
        "columnNumber": 85_623
      },
      "stateClass_isAsync": {
        "start": 1_613_486,
        "end": 1_613_514,
        "bytes": 28,
        "sha256": "f7062d3b1390371c0efe1116055d8a94a407ac516d690b7b76fbed400be9d6e2",
        "lineNumber": 38,
        "columnNumber": 85_569
      },
      "stateClass_setState_Line": {
        "start": 1_612_974,
        "end": 1_613_039,
        "bytes": 65,
        "sha256": "249d2fd544523cd08451589f470a2c66aef6c35eb54d676d3c1e3457ba111ade",
        "lineNumber": 38,
        "columnNumber": 85_057
      },
      "stateClass_setState_Net": {
        "start": 1_613_039,
        "end": 1_613_137,
        "bytes": 98,
        "sha256": "e3c450b431ad8a89d676947ecab9debe69d434dbc97883a541c85c23d20fa6e8",
        "lineNumber": 38,
        "columnNumber": 85_122
      },
      "stateClass_setState_Color": {
        "start": 1_613_137,
        "end": 1_613_204,
        "bytes": 67,
        "sha256": "b6dd1089bc680226839178b36655663c82e5d9771e9ccc58ce5c83b584a8ae0b",
        "lineNumber": 38,
        "columnNumber": 85_220
      },
      "stateClass_setState_LineWidth": {
        "start": 1_613_204,
        "end": 1_613_305,
        "bytes": 101,
        "sha256": "6161893edb0d20411cc515e01b82a48cc34eeb7d9847cf96c8ce76ea0c781843",
        "lineNumber": 38,
        "columnNumber": 85_287
      },
      "stateClass_setState_LineType": {
        "start": 1_613_305,
        "end": 1_613_403,
        "bytes": 98,
        "sha256": "74da9a59bfb72119a4145844a95a8333c4b45f7c5548536a6dbc133dd590f1ee",
        "lineNumber": 38,
        "columnNumber": 85_388
      },
      "namespaceAssignment": {
        "start": 1_905_601,
        "end": 1_905_630,
        "bytes": 29,
        "sha256": "7e32a5856c8d750cc230c994b1288c25b960be09fae6b7c18b5f9164c25e3498",
        "lineNumber": 41,
        "columnNumber": 138_006
      }
    }
  },
  {
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "bytes": 17_468_192,
    "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
    "roles": {
      "uiClass": {
        "start": 17_418_236,
        "end": 17_419_304,
        "bytes": 1068,
        "sha256": "12ac88e9c4a22fc11a644c65bfafdd9e09ce020c6373f10a096e97b413e9a22f",
        "lineNumber": 2657,
        "columnNumber": 170_004
      },
      "uiNamespace": {
        "start": 17_454_717,
        "end": 17_455_058,
        "bytes": 341,
        "sha256": "72500d6dbe714851222c5c1c064e3aeb6560569fd217e18797f2d6919f7a2cba",
        "lineNumber": 2669,
        "columnNumber": 20_268
      },
      "uiClass_create": {
        "start": 17_418_244,
        "end": 17_418_364,
        "bytes": 120,
        "sha256": "7e9756a02e603b0e6b3b49020f1b9e148adc8e38ee8a40572c5973f3af2343a7",
        "lineNumber": 2657,
        "columnNumber": 170_012
      },
      "uiClass_modify": {
        "start": 17_418_481,
        "end": 17_418_722,
        "bytes": 241,
        "sha256": "6851d2d2eb6f1e1421de6c3e1d59a0759486d878c57cd888f273385129c9ad84",
        "lineNumber": 2657,
        "columnNumber": 170_249
      },
      "uiClass_delete": {
        "start": 17_418_364,
        "end": 17_418_481,
        "bytes": 117,
        "sha256": "7a542a7f7e69d98e4c20870934b176379351f4b2f10b48c833d72f69edce1e2f",
        "lineNumber": 2657,
        "columnNumber": 170_132
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "rendererClass": {
        "start": 6_106_132,
        "end": 6_107_318,
        "bytes": 1186,
        "sha256": "587001718372f9afbb7a5d07076fad3ae6ddf9b21c70900909f1e936d610f650",
        "lineNumber": 3830,
        "columnNumber": 6304,
        "alias": "U3"
      },
      "rendererClass_constructor": {
        "start": 6_106_140,
        "end": 6_106_175,
        "bytes": 35,
        "sha256": "461a36a93cc53b24bd210c49a1208912729360fd510e33c0850c8305140f688b",
        "lineNumber": 3830,
        "columnNumber": 6312
      },
      "rendererClass_runCreateOrModifyAction": {
        "start": 6_106_175,
        "end": 6_106_479,
        "bytes": 304,
        "sha256": "f3cb9a00b02a3af59f1253ca424966d3975bcbd9ad964ff3f47e7f455274da6d",
        "lineNumber": 3830,
        "columnNumber": 6347
      },
      "rendererClass_createOrModify": {
        "start": 6_106_479,
        "end": 6_106_977,
        "bytes": 498,
        "sha256": "b83ae8154139ee3d31ef2bdf15ec31980046f1c87e5be844ea9f9fae4870c65e",
        "lineNumber": 3830,
        "columnNumber": 6651
      },
      "rendererClass_getResult": {
        "start": 6_106_977,
        "end": 6_107_317,
        "bytes": 340,
        "sha256": "9a593276f554685291ab436f568f95f587ebc9195ea80a1cd9addeaa530a420d",
        "lineNumber": 3830,
        "columnNumber": 7149
      },
      "parse": {
        "start": 6_105_757,
        "end": 6_106_125,
        "bytes": 368,
        "sha256": "c03333ac782b32283483c115976417a699c939f10c2bd2ac824df45ebcb6aeeb",
        "lineNumber": 3830,
        "columnNumber": 5929,
        "alias": "mnt"
      },
      "defaults": {
        "start": 6_105_691,
        "end": 6_105_757,
        "bytes": 66,
        "sha256": "67a9b739b7f0997e45e1b1fc719144d70fb0b055588d3cd6c9e5e0ca3d033523",
        "lineNumber": 3830,
        "columnNumber": 5863,
        "alias": "fnt"
      },
      "compile": {
        "start": 3_787_990,
        "end": 3_788_070,
        "bytes": 80,
        "sha256": "b1bbc45d602817a45d65dbe4d4cbf9be810867b83684f195b569ee1b19148239",
        "lineNumber": 3606,
        "columnNumber": 121_106,
        "alias": "xo"
      },
      "compileFactory": {
        "start": 3_787_285,
        "end": 3_787_990,
        "bytes": 705,
        "sha256": "0ccbad26c1a45ed8ca703b5157fd0d5bc0161c6c439c990e7d3479577ad3e2a7",
        "lineNumber": 3606,
        "columnNumber": 120_401,
        "alias": "XD"
      },
      "compileEngine": {
        "start": 3_782_301,
        "end": 3_783_988,
        "bytes": 1687,
        "sha256": "aa9e7af58f3d112b566648c22f29c887d1c6a3cd83d99b7048edd20cd88815a9",
        "lineNumber": 3606,
        "columnNumber": 115_417,
        "alias": "q6"
      },
      "compileEngine_analyze": {
        "start": 3_782_677,
        "end": 3_783_208,
        "bytes": 531,
        "sha256": "bf5843351edb60b6f6adb513dbf2579e57feed202dce379cf81b84048791653e",
        "lineNumber": 3606,
        "columnNumber": 115_793
      },
      "compileEngine_do": {
        "start": 3_783_208,
        "end": 3_783_310,
        "bytes": 102,
        "sha256": "2cd326540a0670c81e27f128579381ebc47e8ff11e7c7441dbd3ed781b746f41",
        "lineNumber": 3606,
        "columnNumber": 116_324
      },
      "compileApply": {
        "start": 3_775_080,
        "end": 3_782_294,
        "bytes": 7214,
        "sha256": "764fc582ea60c7a10e4138705d80bf7e1fe21f825653761b76b1e104a27fbc2b",
        "lineNumber": 3606,
        "columnNumber": 108_196,
        "alias": "D0e"
      },
      "createService": {
        "start": 6_107_580,
        "end": 6_107_706,
        "bytes": 126,
        "sha256": "730b6f7b889caf2be2290a2d732c260c7b1cc96e43e20388708598ce8942b2e6",
        "lineNumber": 3830,
        "columnNumber": 7752
      },
      "modifyService": {
        "start": 6_107_756,
        "end": 6_107_908,
        "bytes": 152,
        "sha256": "6a67f5ad9cb81f07c3456624aa4be85922d680138a12249beb24ed1d7f9457e6",
        "lineNumber": 3830,
        "columnNumber": 7928
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "rendererClass": {
        "start": 6_097_802,
        "end": 6_098_988,
        "bytes": 1186,
        "sha256": "de8fa23acbad563cf0e39db5f61f27f98544ad25f48ea0dad65b7f6bd0a2d7d9",
        "lineNumber": 4328,
        "columnNumber": 6304,
        "alias": "R3"
      },
      "rendererClass_constructor": {
        "start": 6_097_810,
        "end": 6_097_845,
        "bytes": 35,
        "sha256": "461a36a93cc53b24bd210c49a1208912729360fd510e33c0850c8305140f688b",
        "lineNumber": 4328,
        "columnNumber": 6312
      },
      "rendererClass_runCreateOrModifyAction": {
        "start": 6_097_845,
        "end": 6_098_149,
        "bytes": 304,
        "sha256": "f8741e683ad223df0b27b204eb71e33777f704c6707598a8841814ad4670873f",
        "lineNumber": 4328,
        "columnNumber": 6347
      },
      "rendererClass_createOrModify": {
        "start": 6_098_149,
        "end": 6_098_647,
        "bytes": 498,
        "sha256": "255b72db3c58fef872f50e66d8e15c3409990b4233036f6bb749ba770a2f49c8",
        "lineNumber": 4328,
        "columnNumber": 6651
      },
      "rendererClass_getResult": {
        "start": 6_098_647,
        "end": 6_098_987,
        "bytes": 340,
        "sha256": "db188dfeda4ae4c69ce967bbd372682101830ee220a5501a73cdf75e247d3bb4",
        "lineNumber": 4328,
        "columnNumber": 7149
      },
      "parse": {
        "start": 6_097_427,
        "end": 6_097_795,
        "bytes": 368,
        "sha256": "b9856f67a3d1d587af08e258c8471f8591d5117b86390a188dbee0013c591f11",
        "lineNumber": 4328,
        "columnNumber": 5929,
        "alias": "Brt"
      },
      "defaults": {
        "start": 6_097_361,
        "end": 6_097_427,
        "bytes": 66,
        "sha256": "bc8c9faa965c4a6080304067d1f4f599de2ef772a1728338b9b83262b75eef21",
        "lineNumber": 4328,
        "columnNumber": 5863,
        "alias": "Nrt"
      },
      "compile": {
        "start": 2_208_367,
        "end": 2_208_447,
        "bytes": 80,
        "sha256": "68a10a4a9c19be0b86d9220c68a22c48da29bb8289f9ef851141ec36f4ab071c",
        "lineNumber": 557,
        "columnNumber": 295_270,
        "alias": "Oo"
      },
      "compileFactory": {
        "start": 2_207_662,
        "end": 2_208_367,
        "bytes": 705,
        "sha256": "c0c7e79f732c6b4bcca2b62a4d8c71314d9e645525fe213ef1cc48c4a8c08ef5",
        "lineNumber": 557,
        "columnNumber": 294_565,
        "alias": "SA"
      },
      "compileEngine": {
        "start": 2_202_678,
        "end": 2_204_365,
        "bytes": 1687,
        "sha256": "24286530c59bf8d27e3ede2fd0265bb1b1a1b60fdedd8377f5d83660be00691a",
        "lineNumber": 557,
        "columnNumber": 289_581,
        "alias": "r5"
      },
      "compileEngine_analyze": {
        "start": 2_203_054,
        "end": 2_203_585,
        "bytes": 531,
        "sha256": "930383c37bb034db395edbf9b32d2631264bed82d9cf44d8238d8bc8b97b9709",
        "lineNumber": 557,
        "columnNumber": 289_957
      },
      "compileEngine_do": {
        "start": 2_203_585,
        "end": 2_203_687,
        "bytes": 102,
        "sha256": "5137c79347a79abc7ecf2232df4b44c87dbfd0d91116fe437d3dc9da51fc4a1f",
        "lineNumber": 557,
        "columnNumber": 290_488
      },
      "compileApply": {
        "start": 2_195_457,
        "end": 2_202_671,
        "bytes": 7214,
        "sha256": "dbf05e4516dc8bbde9b635a50a1c528799ee5d49a46446ed58932704a504e2fc",
        "lineNumber": 557,
        "columnNumber": 282_360,
        "alias": "Hpe"
      },
      "createService": {
        "start": 6_099_250,
        "end": 6_099_376,
        "bytes": 126,
        "sha256": "02794b1f4340ba5cd744a85c0b527a0cbd4bddf073d40df7fe64146b9324a09f",
        "lineNumber": 4328,
        "columnNumber": 7752
      },
      "modifyService": {
        "start": 6_099_426,
        "end": 6_099_578,
        "bytes": 152,
        "sha256": "c14c552b1e83638901ad9d366fb669c68fbbecbf88de6fa28d30c22efbb26b96",
        "lineNumber": 4328,
        "columnNumber": 7928
      }
    }
  }
] as const);
/** Unmodified class/namespace text, retained independently of an installed SDK
 * so offline tests can expose its actual Promise semantics. Never an issuer. */
export const CURRENT_SCHEMATIC_WIRE_PUBLIC_TEXT=freezeDeep({
  "api": "class{async create(t,i,n,r,s){return await new Xa(t,i,n,r,s).create()}async delete(t){let i=!1,n=(Array.isArray(t)?t:[t]).map(r=>r instanceof Xa?r.getState_PrimitiveId():r);try{await T.extensionApiMessageBus2.rpcCall(\"extensionApi.SCH_PrimitiveWire.delete\",{data:n,getter:r=>{i=r}})}catch{return!1}return i}async modify(t,i){try{let n;return t instanceof Xa?(n=t,i.color!==void 0&&t.setState_Color(i.color),i.line!==void 0&&t.setState_Line(i.line),i.lineType!==void 0&&t.setState_LineType(i.lineType),i.lineWidth!==void 0&&t.setState_LineWidth(i.lineWidth),i.net!==void 0&&t.setState_Net(i.net)):n=new Xa(i.line,i.net,i.color,i.lineWidth,i.lineType,t),n.isAsync()&&n.done(),n}catch{return}}async get(t){let i;try{await T.extensionApiMessageBus2.rpcCall(\"extensionApi.SCH_PrimitiveWire.get\",{data:t,getter:r=>{i=r}})}catch{}if(typeof i>\"u\"&&(i=[]),!i.length)return;let n=i.map(r=>{if(r)return new Xa(r.line,r.net,r.color,r.lineWidth,r.lineType,r.id)});return Array.isArray(t)?n:n[0]}async getAllPrimitiveId(t){let i=[];try{await T.extensionApiMessageBus2.rpcCall(\"extensionApi.SCH_PrimitiveWire.getAllPrimitiveId\",{data:t,getter:n=>{i=n}})}catch{}return i}async getAll(t){let i=[];try{await T.extensionApiMessageBus2.rpcCall(\"extensionApi.SCH_PrimitiveWire.getAll\",{data:t,getter:n=>{i=n}})}catch{}return i.map(({line:n,lineType:r,lineWidth:s,color:a,net:o,id:l})=>new Xa(n,o,a,s,r,l))}}",
  "state": String.raw`class{constructor(t,i="",n=null,r=null,s=null,a){this.async=!0;this.primitiveType="Wire";this.line=t,this.net=i,this.color=n,this.lineWidth=r,this.lineType=s,a&&(this.primitiveId=a)}async create(){this.setState_Line(this.line),this.setState_Net(this.net),this.setState_Color(this.color),this.setState_LineWidth(this.lineWidth),this.setState_LineType(this.lineType);let t,i=new Promise(n=>{T.extensionApiMessageBus2.rpcCall("extensionApi.SCH_PrimitiveWire.create",{data:{line:this.line,net:this.net,color:this.color,lineWidth:this.lineWidth,lineType:this.lineType},getter:r=>{t=r,n()}})});try{await i}catch{}if(t)this.primitiveId=t.id,this.line=t.line,this.color=t.color,this.lineType=t.lineType,this.lineWidth=t.lineWidth;else throw new Error("create failed!");return this}getState_PrimitiveType(){return this.primitiveType}getState_PrimitiveId(){if(this.primitiveId)return this.primitiveId;throw new Error("\u9519\u8BEF\uFF1A\u5BF9\u8C61\u672A\u5728\u539F\u7406\u56FE\u753B\u5E03\u521D\u59CB\u5316\uFF0C\u4E0D\u5B58\u5728 PrimitiveId\u3002")}getState_Line(){return this.line}getState_Net(){return this.net}getState_Color(){return this.color}getState_LineWidth(){return this.lineWidth}getState_LineType(){return this.lineType}setState_Line(t){return this.line=t,this.async||this.done(),this}setState_Net(t){return this.net=(t==null?void 0:t.toUpperCase())||"",this.async||this.done(),this}setState_Color(t){return this.color=t,this.async||this.done(),this}setState_LineWidth(t){return(t===null||t>=1&&t<=10)&&(this.lineWidth=t,this.async||this.done()),this}setState_LineType(t){return(t===null||t>=0&&t<=3)&&(this.lineType=t,this.async||this.done()),this}toAsync(){return this.async=!0,this}toSync(){return this.async=!1,this.done(),this}isAsync(){return this.async}async reset(){return this}async done(){let t,i=new Promise(n=>{T.extensionApiMessageBus2.rpcCall("extensionApi.SCH_PrimitiveWire.modify",{data:{primitiveId:this.primitiveId,line:this.line,net:this.net,color:this.color,lineWidth:this.lineWidth,lineType:this.lineType},getter:r=>{t=r,n()}})});try{await i}catch{}if(!t)throw new Error("modify failed!");return this.primitiveId=t.id,this.line=t.line,this.lineWidth=t.lineWidth,this.lineType=t.lineType,this.color=t.color,this.net=t.net,this}}`,
  "ui": "class t{static create(e,i,o){w.messageBus.publish(\"extensionApi.SCH_PrimitiveWireBusUtil3.create\",{info:e,type:i,cb:n=>{o(n)}})}static async delete(e){return typeof e==\"string\"&&(e=[e]),(await w.messageBus.rpcCall(\"deleteObjs\",{ids:e})).message}static modify({primitiveId:e,...i},o,n){let{line:r,net:a,color:s,lineType:l,lineWidth:c}=i;[r,a,s,l,c].every(d=>Er(d))&&n(null),w.messageBus.rpcCall(\"extensionApi.SCH_PrimitiveWireBusUtil3.modify\",{info:i,type:o,primitiveId:e,cb:d=>{n(d)}})}static get(e){typeof e==\"string\"&&(e=[e]);let i;return w.messageBus.publish(\"extensionApi.SCH_PrimitiveWireBusUtil3.get\",{primitiveIds:e,cb:o=>{i=o}}),i==null?void 0:i.data}static async getAllPrimitiveId(e,i){let o=[];if(typeof i==\"string\"&&(i=[i]),Array.isArray(i)&&i.length>0){let{message:n}=await w.messageBus.rpcCall(\"sch/getNetGroupInfoByNetName\",{data:i});n&&o.push(...n)}else{let{message:n}=await w.messageBus.rpcCall(\"sch/getAllNetGroupIds\",{type:e});n&&o.push(...n)}return o}static async getAll(e,i){let o=await t.getAllPrimitiveId(e,i);return this.get(o).filter(Boolean)}}",
  "uiNamespace": "{create:({data:t,getter:e})=>{VI.create(t,\"wire\",e)},modify:({data:t,getter:e})=>{VI.modify(t,\"wire\",e)},delete:({data:t,getter:e})=>{e(VI.delete(t))},get:({data:t,getter:e})=>{e(VI.get(t))},getAll:async({data:t,getter:e})=>{e(await VI.getAll(\"wire\",t))},getAllPrimitiveId:async({data:t,getter:e})=>{e(await VI.getAllPrimitiveId(\"wire\",t))}}"
} as const);
export const CURRENT_SCHEMATIC_WIRE_PUBLIC_FACTS=freezeDeep({
 modifyAwaitsDone:false,
 createAwaitsGetter:true,
 deleteAdoptsGetterPromise:true,
 geometryUsesPointsOnlySetLines:true,
 geometryAwaitsNetCompiler:true,
 compilerMayShowNetMergeDialog:true,
 compilerMayReplaceLineIdentities:true,
 compilerMayChangeNetNamesLabelsAndVisibility:true,
 compilerTransitiveEffectsClosed:false,
 publicExecutionValidated:false,
 originalReceiverVerified:false,
 nativeJobVerified:false,
 historyVerified:false,
 sqlVerified:false,
 saveVerified:false,
 reopenedVerified:false,
 executionAuthorized:false,
} as const);
export type CurrentSchematicWirePublicSourceVariant=0|1|2|3;
export interface CurrentSchematicWirePublicSourceSpan {
 readonly start:number;readonly end:number;readonly bytes:number;readonly sha256:string;
 readonly lineNumber:number;readonly columnNumber:number;
}
function fail():never{throw new Error("SCHEMATIC_WIRE_PUBLIC_SOURCE");}
function hash(value:string):string{return createHash("sha256").update(value).digest("hex");}
export function qualifyCurrentSchematicWirePublicSource(source:string):CurrentSchematicWirePublicSourceVariant {
 const bytes=Buffer.byteLength(source),sha256=hash(source);
 const index=CURRENT_SCHEMATIC_WIRE_PUBLIC_SOURCE.findIndex(row=>row.bytes===bytes&&row.sha256===sha256);
 if(index!==0&&index!==1&&index!==2&&index!==3){return fail();}
 const file=CURRENT_SCHEMATIC_WIRE_PUBLIC_SOURCE[index];
 const roles:Readonly<Record<string,CurrentSchematicWirePublicSourceSpan>>=file.roles;
 for(const row of Object.values(roles)){const part=source.slice(row.start,row.end);if(Buffer.byteLength(part)!==row.bytes||hash(part)!==row.sha256){return fail();}}
 return index;
}
