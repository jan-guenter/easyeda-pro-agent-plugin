/** Exact UI collateral bodies and original aliases only. These data profiles
 * cannot dispatch a callback, close a tab, restore a preference or delete. */
import{createHash}from"node:crypto";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{qualifyCurrentFootprintInversePublicDeleteSource}from"./current-footprint-inverse-public-delete-source.ts";
import{qualifyCurrentFootprintSourceFunctionMetadata}from"./current-footprint-source-function-metadata.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_UI_METHODS=freezeDeep({
  "tabSetTabData": {
    "start": 16_408_895,
    "end": 16_408_975,
    "descriptionStart": 16_408_902,
    "name": "setTabData",
    "arity": 2,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 73,
    "sha256": "f78689101ebeda80eac394c8b4a1dcd87b7223b1206fae115532dd2bb0a1181b",
    "lineNumber": 2028,
    "columnNumber": 23_428
  },
  "tabGetActiveTabData": {
    "start": 16_409_324,
    "end": 16_409_515,
    "descriptionStart": 16_409_331,
    "name": "getActiveTabData",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 184,
    "sha256": "309aff8cacb02a460be2539dfe5aae492264f130237d28259c1f501786737dec",
    "lineNumber": 2028,
    "columnNumber": 23_863
  },
  "tabGetTabById": {
    "start": 16_409_515,
    "end": 16_409_681,
    "descriptionStart": 16_409_522,
    "name": "getTabById",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 159,
    "sha256": "4989a07a3fa86e35be8fc945b4c62b353745675154595648e421a7c5e3581a26",
    "lineNumber": 2028,
    "columnNumber": 24_048
  },
  "tabGetTabContainer": {
    "start": 16_410_009,
    "end": 16_410_112,
    "descriptionStart": 16_410_016,
    "name": "getTabContainer",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 96,
    "sha256": "ede283625cfc51e64ff0ff1d7faa3e4597daecc9f3178d17bed9dd05f2687926",
    "lineNumber": 2028,
    "columnNumber": 24_547
  },
  "tabGetActiveTab": {
    "start": 16_437_415,
    "end": 16_437_464,
    "descriptionStart": 16_437_422,
    "name": "getActiveTab",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 42,
    "sha256": "03159539fdf3f40f1beb4796b80a2996100c911bc1e7a90e640dd4f8f496b0c1",
    "lineNumber": 2028,
    "columnNumber": 51_950
  },
  "tabClearSchTopMenuStatus": {
    "start": 16_438_932,
    "end": 16_439_074,
    "descriptionStart": 16_438_939,
    "name": "clearSchTopMenuStatus",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 135,
    "sha256": "1a4d6b20fa6bd531a5008a7720a88404fd5044b2448e4ab2e30987c6aca0557e",
    "lineNumber": 2028,
    "columnNumber": 53_476
  },
  "tabGetTabInfo": {
    "start": 16_441_645,
    "end": 16_442_208,
    "descriptionStart": 16_441_652,
    "name": "getTabInfo",
    "arity": 0,
    "kind": "method",
    "async": true,
    "strict": true,
    "parent": null,
    "bytes": 556,
    "sha256": "acaf1c583db8a02136948aaf7fa1dc96563a8c299b093f1f697ff63e63747363",
    "lineNumber": 2028,
    "columnNumber": 56_184
  },
  "tabGetTabData": {
    "start": 16_442_208,
    "end": 16_442_308,
    "descriptionStart": 16_442_215,
    "name": "getTabData",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 93,
    "sha256": "bd84f7ad711208e703e291c147979a64346a0440adef104f22b9b6cd35bb6f90",
    "lineNumber": 2028,
    "columnNumber": 56_741
  },
  "tabIsHasTabById": {
    "start": 16_443_687,
    "end": 16_443_829,
    "descriptionStart": 16_443_694,
    "name": "isHasTabById",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 135,
    "sha256": "d5d7ecda01a2b13dce205f1ed8e0f8d2b4f428aec2d9fdff5bf1c406bb6957df",
    "lineNumber": 2028,
    "columnNumber": 58_222
  },
  "tabGetTabTitle": {
    "start": 16_443_960,
    "end": 16_444_315,
    "descriptionStart": 16_443_967,
    "name": "getTabTitle",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 348,
    "sha256": "d32416dd1df21c5811808d7a855ba3d53d99053328a6466a1c9fea714057787b",
    "lineNumber": 2028,
    "columnNumber": 58_494
  },
  "tabGetTabDocType": {
    "start": 16_448_430,
    "end": 16_448_536,
    "descriptionStart": 16_448_437,
    "name": "getTabDocType",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 99,
    "sha256": "0cbbb85e8d01ba9d67375e3fdb914b93aff142472a05191693ca90c9b2567e10",
    "lineNumber": 2028,
    "columnNumber": 62_966
  },
  "tabGetTabIFrame": {
    "start": 16_448_856,
    "end": 16_449_091,
    "descriptionStart": 16_448_863,
    "name": "getTabIFrame",
    "arity": 0,
    "kind": "method",
    "async": true,
    "strict": true,
    "parent": null,
    "bytes": 228,
    "sha256": "461ee9beb1b183c5d45362e7f4721aa98e17aecc041418a5628c37edab3c65b0",
    "lineNumber": 2028,
    "columnNumber": 63_397
  },
  "tabRemoveTab": {
    "start": 16_453_806,
    "end": 16_453_914,
    "descriptionStart": 16_453_813,
    "name": "removeTab",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 101,
    "sha256": "5ec47f7de2f86eff5bbe0c222e450fc6e588176fd5cd006ed09fbbf68e383c06",
    "lineNumber": 2028,
    "columnNumber": 68_338
  },
  "tabGetPath": {
    "start": 16_455_459,
    "end": 16_455_556,
    "descriptionStart": 16_455_466,
    "name": "getPath",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 90,
    "sha256": "b03d890ece289fbe5de4427dffb333dfaf419db24bcfe8a7bfc0f117bb683f7e",
    "lineNumber": 2028,
    "columnNumber": 69_989
  },
  "tabGetAllTabBySheetId": {
    "start": 16_455_556,
    "end": 16_455_695,
    "descriptionStart": 16_455_563,
    "name": "getAllTabBySheetId",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 132,
    "sha256": "94ca96450fe389f2c7cf0b6747ce58de8d88b27367b2528756c98ebff1c7dd4d",
    "lineNumber": 2028,
    "columnNumber": 70_097
  },
  "tabGetDoctypeByTabId": {
    "start": 16_456_009,
    "end": 16_456_119,
    "descriptionStart": 16_456_016,
    "name": "getDoctypeByTabId",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 103,
    "sha256": "bf8e523f77efdcb32c6f9a34579f9f9522a1d1115fa9dbd50d5c6fef20b62374",
    "lineNumber": 2028,
    "columnNumber": 70_549
  },
  "locationExtractFileId": {
    "start": 16_374_634,
    "end": 16_374_714,
    "descriptionStart": 16_374_641,
    "name": "extractFileId",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 73,
    "sha256": "55f163de394b595c8d1c8628c9be76b26b71477046c6ed6b9479083b89b3d1bc",
    "lineNumber": 2006,
    "columnNumber": 15_621
  },
  "locationRemoveFileId": {
    "start": 16_375_909,
    "end": 16_376_311,
    "descriptionStart": 16_375_916,
    "name": "removeFileId",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 395,
    "sha256": "51c16ddaa162265141133cbb07cc83439ebaa3593e55976f3641b3a4261fc4f2",
    "lineNumber": 2006,
    "columnNumber": 16_895
  },
  "locationSetHash": {
    "start": 16_376_915,
    "end": 16_377_400,
    "descriptionStart": 16_376_922,
    "name": "setHash",
    "arity": 4,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 478,
    "sha256": "d59229afcf570b3dd25cf0b53cda4e0868204987fcb8928b210e7d3cae6ed2cb",
    "lineNumber": 2006,
    "columnNumber": 17_896
  },
  "locationGetHash": {
    "start": 16_377_400,
    "end": 16_377_531,
    "descriptionStart": 16_377_407,
    "name": "getHash",
    "arity": 2,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 124,
    "sha256": "3a744336e7de479c06a5514942498418f85853468722d18a24569b08b4c3b969",
    "lineNumber": 2006,
    "columnNumber": 18_381
  },
  "locationDeletePage": {
    "start": 16_381_176,
    "end": 16_381_590,
    "descriptionStart": 16_381_183,
    "name": "deletePage",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 407,
    "sha256": "21d519df62e18b4c4ba159460088573bc8520cf555da8b3b56782d7ce2963202",
    "lineNumber": 2006,
    "columnNumber": 22_160
  },
  "exportDeleteExportCache": {
    "start": 10_856_399,
    "end": 10_856_566,
    "descriptionStart": 10_856_399,
    "name": "deleteExportCache",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "bytes": 167,
    "sha256": "e3bd1606be470625156de826345c9f260eb1ce6f390c88ae471aee691bac969d",
    "lineNumber": 1371,
    "columnNumber": 53_161
  }
}as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_UI_CLASSES=freezeDeep({
  "tab": {
    "start": 16_405_738,
    "end": 16_456_186,
    "name": "tt",
    "arity": 0,
    "lineNumber": 2028,
    "columnNumber": 20_254,
    "bytes": 50_448,
    "sha256": "179693ced6e642443a5fa938204079318ad6dfa8dd3f218767cbf52ee943ec8c"
  },
  "location": {
    "start": 16_374_366,
    "end": 16_381_917,
    "name": "t",
    "arity": 0,
    "lineNumber": 2006,
    "columnNumber": 15_333,
    "bytes": 7551,
    "sha256": "a9acb145be93f8ad2c60da171698a877c1c596234efe390ba70c76fe917729e9"
  }
}as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_UI_LINKS=freezeDeep({
  "tabAlias": {
    "start": 16_460_921,
    "end": 16_460_926,
    "bytes": 5,
    "sha256": "901ae6005dbcf088e90a77e657c72c3cc1aaf7776ceab4d20ef489ab47123744"
  },
  "exportInstance": {
    "start": 10_856_678,
    "end": 10_856_688,
    "bytes": 10,
    "sha256": "625a7636417cfec679f8407efe247a9eb17860440e52df8222182945068ab060"
  },
  "jqueryModule": {
    "start": 8_136_168,
    "end": 8_136_178,
    "bytes": 10,
    "sha256": "fd1c60c0fb72a439e319c7f9dedc95450561eb50306f2997efa0915afab87467"
  },
  "separator": {
    "start": 15_985_216,
    "end": 15_985_222,
    "bytes": 6,
    "sha256": "b7ac67782031098d594178dad47f5246c2ae42716cad7242d07769d3b4d229e8"
  }
}as const);
export type CurrentFootprintInverseDeleteUiMethod=keyof typeof CURRENT_FOOTPRINT_INVERSE_DELETE_UI_METHODS;
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_DELETE_UI_SOURCE");}}
/** Extract the exact original UI function or class span and refuse a missing, truncated or changed source range. */
function fragment(text:string,row:Readonly<{bytes:number;sha256:string}>):void{need(text.isWellFormed()&&Buffer.byteLength(text)===row.bytes&&createHash("sha256").update(text).digest("hex")===row.sha256);}
/** Require the complete pinned UI file and each original collateral span before selecting any tab or component-log metadata. */
export function qualifyCurrentFootprintInverseDeleteUiSource(source:string):void{qualifyCurrentFootprintInversePublicDeleteSource("ui",source);for(const r of Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_UI_METHODS)){fragment(source.slice(r.descriptionStart,r.end),r);}for(const r of [...Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_UI_CLASSES),...Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_UI_LINKS)]){fragment(source.slice(r.start,r.end),r);}}
/** Compare a returned function description with its exact original collateral source span before using its location or scopes. */
export function requireCurrentFootprintInverseDeleteUiDescription(text:string,role:CurrentFootprintInverseDeleteUiMethod):void{fragment(text,CURRENT_FOOTPRINT_INVERSE_DELETE_UI_METHODS[role]);}
/** Check original function metadata and location for the selected UI role without invoking its log, tab or close operation. */
export function qualifyCurrentFootprintInverseDeleteUiFunction(input:unknown,role:CurrentFootprintInverseDeleteUiMethod,scriptId:string):string{return qualifyCurrentFootprintSourceFunctionMetadata(input,CURRENT_FOOTPRINT_INVERSE_DELETE_UI_METHODS[role],scriptId);}

/** Require the complete original class description before its static fields or selected methods participate in readonly collateral proof. */
export function requireCurrentFootprintInverseDeleteUiClassDescription(text:string):void{fragment(text,CURRENT_FOOTPRINT_INVERSE_DELETE_UI_CLASSES.tab);}
