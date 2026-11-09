/** Exact current209 public footprint-delete path. This data qualification
 * grants no native object, SDK invocation, dropped-job or collateral completion. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES=freezeDeep({
  "api": {
    "relativePath": "pro-api/0.3.59.1ca9efb5/api.js",
    "bytes": 1_980_754,
    "sha256": "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1"
  },
  "ui": {
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "bytes": 17_468_192,
    "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6"
  },
  "manager": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js",
    "bytes": 2_196_424,
    "sha256": "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d"
  }
} as const);
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_SOURCE=freezeDeep([
  {
    "key": "publicSdkDelete",
    "file": "api",
    "start": 1_340_853,
    "end": 1_340_987,
    "bytes": 134,
    "sha256": "d773ae2b2ebbbc303d3b45b177f6e61ce875d6b845bfd028d7a67e0e7005f657",
    "callable": true
  },
  {
    "key": "publicUiDelete",
    "file": "ui",
    "start": 17_389_039,
    "end": 17_389_293,
    "bytes": 254,
    "sha256": "630b1722fea7f835742bebe19053c0cb86fac10aae506b465073bdfb6ee861ca",
    "callable": true
  },
  {
    "key": "projectDelete",
    "file": "ui",
    "start": 6_232_612,
    "end": 6_232_763,
    "bytes": 151,
    "sha256": "89cd7f7d9275e6c35d90b164e95275a8ec9095ea1d1469a37deef2f8c8fa49b4",
    "callable": true
  },
  {
    "key": "facadeDelete",
    "file": "ui",
    "start": 6_246_284,
    "end": 6_246_379,
    "bytes": 95,
    "sha256": "a2a2399abdee880570311aac14b3dd0429c981a1b2062601e6cf2a132c4a98d0",
    "callable": true
  },
  {
    "key": "lookup",
    "file": "ui",
    "start": 10_248_133,
    "end": 10_248_335,
    "bytes": 202,
    "sha256": "698d13cb83610e63b910998060fd85a11db120c9ecd7ab9d688df6c66bf2b4f3",
    "callable": true
  },
  {
    "key": "projectPath",
    "file": "ui",
    "start": 15_250_856,
    "end": 15_250_955,
    "bytes": 99,
    "sha256": "fa5a2443ad710180fa01784bb8cf827a290607623d9c55370897a93fca945f4e",
    "callable": true
  },
  {
    "key": "deleteHelper",
    "file": "ui",
    "start": 15_337_556,
    "end": 15_342_578,
    "bytes": 5022,
    "sha256": "b3b1f5a74b0ba92b348c19c6dece16c9c27953fece1478f76452884937a20c7e",
    "callable": true
  },
  {
    "key": "pcbReferences",
    "file": "ui",
    "start": 15_335_255,
    "end": 15_336_575,
    "bytes": 1320,
    "sha256": "d91f6d44ec36ee1957340134fe8a895bc5406e13b580dc1bede78fde6389fd41",
    "callable": true
  },
  {
    "key": "referenceLabels",
    "file": "ui",
    "start": 15_336_575,
    "end": 15_336_846,
    "bytes": 271,
    "sha256": "4fc87bc80841fd66e5370ea8573f797a62ae51078d0e4a1d1e83bb18a36c3557",
    "callable": true
  },
  {
    "key": "schematicReferences",
    "file": "ui",
    "start": 15_336_846,
    "end": 15_337_277,
    "bytes": 431,
    "sha256": "70e6271475b98b99da74a1bb38f96631a848d3a28335d651244a02d1d8470105",
    "callable": true
  },
  {
    "key": "derivedReferences",
    "file": "ui",
    "start": 15_334_707,
    "end": 15_335_255,
    "bytes": 548,
    "sha256": "799b1d595001395e3737088907a8dac997fe1f4ed3cf0af4c1ddbe460563ecc3",
    "callable": true
  },
  {
    "key": "deviceReferences",
    "file": "ui",
    "start": 15_337_277,
    "end": 15_337_556,
    "bytes": 279,
    "sha256": "5ee6c2d95a65a2848fbf7a2380a0b69580395aa37d2accb8a145dea9f82f319d",
    "callable": true
  },
  {
    "key": "componentLog",
    "file": "ui",
    "start": 9_970_757,
    "end": 9_970_909,
    "bytes": 152,
    "sha256": "1c87f06a152172b0a8f1794bfe972457fe04c64d696b85fe4305f0693dc47c2f",
    "callable": true
  },
  {
    "key": "componentLogDispatch",
    "file": "ui",
    "start": 9_970_372,
    "end": 9_970_757,
    "bytes": 385,
    "sha256": "eb65a0c21e9c30cd6c51292816e1dd1501b14aa32c31ca0afa52d0eca4680046",
    "callable": true
  },
  {
    "key": "closeTargetTab",
    "file": "ui",
    "start": 15_962_395,
    "end": 15_963_979,
    "bytes": 1584,
    "sha256": "97a5f768c17a89b300453cd5f66218a91ebb4d6a22942a21f027d353680c351d",
    "callable": true
  },
  {
    "key": "tabId",
    "file": "ui",
    "start": 15_989_248,
    "end": 15_989_330,
    "bytes": 82,
    "sha256": "696779360f10a29e41acd9e252794940cc51c49584899a4709d32c8dc5d45f80",
    "callable": true
  },
  {
    "key": "sourcePath",
    "file": "ui",
    "start": 15_989_479,
    "end": 15_989_578,
    "bytes": 99,
    "sha256": "ffbf8faff72bf4b1f34c92d826a039b84d181f41d38dc52b2051763f5baba068",
    "callable": true
  },
  {
    "key": "managerDelete",
    "file": "manager",
    "start": 2_069_740,
    "end": 2_069_827,
    "bytes": 87,
    "sha256": "0e627cb810fa19cc121f27820b3401dea511df795bc90f9971085de54bae2f00",
    "callable": true
  },
  {
    "key": "forceSyncNoop",
    "file": "manager",
    "start": 2_084_894,
    "end": 2_084_905,
    "bytes": 11,
    "sha256": "2df033a9ed67915d6557a5e8880631b2623e5dd71ac467acafd2bfff90e8a1ba",
    "callable": true
  }
] as const);
export type CurrentFootprintInversePublicDeleteFile=keyof typeof CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES;
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_PUBLIC_DELETE_SOURCE");}}
export function qualifyCurrentFootprintInversePublicDeleteSource(file:CurrentFootprintInversePublicDeleteFile,input:unknown):void{need(Object.hasOwn(CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES,file)&&typeof input==="string"&&input.isWellFormed());const expected=CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES[file];need(Buffer.byteLength(input)===expected.bytes&&createHash("sha256").update(input).digest("hex")===expected.sha256);for(const row of CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_SOURCE){if(row.file===file){const fragment=input.slice(row.start,row.end);need(Buffer.byteLength(fragment)===row.bytes&&createHash("sha256").update(fragment).digest("hex")===row.sha256);}}}
export function currentFootprintInversePublicDeleteFragment(file:CurrentFootprintInversePublicDeleteFile,key:typeof CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_SOURCE[number]["key"],source:string):string{qualifyCurrentFootprintInversePublicDeleteSource(file,source);const row=CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_SOURCE.find(item=>item.key===key&&item.file===file);need(row!==undefined);return source.slice(row.start,row.end);}
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_SCOPE=freezeDeep({publicMethod:"lib_Footprint.delete",libraryArgument:"Project",publicCurrentProjectRouteExists:true,literalProjectDependencyChecksRequired:true,rawProjectUuidSkipsDependencyChecks:true,publicBooleanDoesNotAwaitNativeDelete:true,forceSyncServiceSource:"async t=>{}",forceSyncDoesNotProveProducerDrain:true,originalSdkReceiverQualified:false,originalNativeDeletePromiseRetained:false,collateralEffectsQualified:false,executionAuthorized:false}as const);
