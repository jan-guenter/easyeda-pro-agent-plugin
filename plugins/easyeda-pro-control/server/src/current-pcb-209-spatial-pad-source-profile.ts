/** Distinct point-only standalone circular SMT Pad source roster. Excluded
 * base callees are unreachable under the complete Pad-only scene guard.
 * No original owner or connected geometry acceptance is issued by metadata. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS as BASE_PLANS, CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES as BASE_PROFILES, CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE } from "./current-pcb-209-spatial-source-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_SPATIAL_PAD_OMITTED_KEYS = [
  "Qg.class",
  "It.class",
  "Hr.getSelectInside",
  "Hr.getSelectContect",
  "Hr.filterComponentVisible",
  "Hr.rtreeSearchInside",
  "Hr.rtreeSearchNotOutside",
  "Hr.rtreeSearchNotOutsideChildren",
  "LH.filterParent",
  "iV.searchInside",
  "iV.searchIntersectByType",
  "Nd.searchInside",
  "Nd.searchIntersect",
  "GN.getResult",
  "GN.doAction",
  "GN.doCopperAction",
  "Ve.isSelect",
  "Ve.buildBBox",
  "Ve.get:layerId",
  "Ve.get:locked",
  "Ve.get:isSuture",
  "Qg.inShape",
  "Qg.inOutline",
  "Qg.get:radius",
  "Qg.get:holeRadius",
  "Qg.get:viaBaseInfo",
  "Qg.get:center",
  "Qg.get:layerId",
  "Qg.get:locked",
  "Qg.get:type",
  "YP"
] as const;
export const CURRENT_PCB_209_SPATIAL_PAD_EXTRA_PROFILES = freezeDeep([
  {
    "key": "Mi.class",
    "className": "Function",
    "sourceStart": 4_389_479,
    "sourceEnd": 4_397_512,
    "sourceBytes": 8033,
    "sourceSha256": "60740642aa329bb8701e3e8373edb0efa35a6b83dbf96075683ea59efedea31d",
    "lineNumber": 3641,
    "columnNumber": 531_657,
    "name": "Mi",
    "parameterCount": 1,
    "kind": "class",
    "prototypeClassName": "Ne"
  },
  {
    "key": "et.class",
    "className": "Function",
    "sourceStart": 3_515_554,
    "sourceEnd": 3_519_094,
    "sourceBytes": 3540,
    "sourceSha256": "eafd35f54fd65b3d400654f18726fc105bcd172d07a184d9c0f95bea5c4ae3b1",
    "lineNumber": 3637,
    "columnNumber": 393_582,
    "name": "et",
    "parameterCount": 0,
    "kind": "class",
    "prototypeClassName": "ki"
  },
  {
    "key": "tE.class",
    "className": "Function",
    "sourceStart": 3_519_102,
    "sourceEnd": 3_532_058,
    "sourceBytes": 12_956,
    "sourceSha256": "bdd6ea6ebee06fd0d417db8df76465e279f3d7b437d10b7881919c57f24a2b2a",
    "lineNumber": 3637,
    "columnNumber": 397_132,
    "name": "o",
    "parameterCount": 18,
    "kind": "class",
    "prototypeClassName": "et"
  },
  {
    "key": "tC.class",
    "className": "Function",
    "sourceStart": 3_416_257,
    "sourceEnd": 3_418_900,
    "sourceBytes": 2643,
    "sourceSha256": "cebc2fee9b240bc3882a9f64c47fb8c1484fe1b4c894a70a816a70f594e95551",
    "lineNumber": 3637,
    "columnNumber": 294_274,
    "name": "tC",
    "parameterCount": 5,
    "kind": "class",
    "prototypeClassName": "Object"
  },
  {
    "key": "Ne.get:locked",
    "className": "Function",
    "sourceStart": 4_382_882,
    "sourceEnd": 4_382_920,
    "sourceBytes": 38,
    "sourceSha256": "6c9f3027c0bebdc1a78db3c850452a81166867c9f8ba96da6feffbd761ec1112",
    "lineNumber": 3641,
    "columnNumber": 525_042,
    "name": "get locked",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Ne.get:isTestPad",
    "className": "Function",
    "sourceStart": 4_383_710,
    "sourceEnd": 4_383_754,
    "sourceBytes": 44,
    "sourceSha256": "01f1de092bf5fe00f193556d69e5bbd90976c3814093bc3c5287df9f190bb40d",
    "lineNumber": 3641,
    "columnNumber": 525_873,
    "name": "get isTestPad",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Ne.get:smartPad",
    "className": "Function",
    "sourceStart": 4_382_590,
    "sourceEnd": 4_382_627,
    "sourceBytes": 37,
    "sourceSha256": "d685a265b843d1c8d7c8fada8a6a80e716d1297b8b5654cfb04aa8abbe54644b",
    "lineNumber": 3641,
    "columnNumber": 524_752,
    "name": "get smartPad",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Ne.get:partition",
    "className": "Function",
    "sourceStart": 4_382_689,
    "sourceEnd": 4_382_733,
    "sourceBytes": 44,
    "sourceSha256": "f770149822d4a692745e1654efe2213d1ed055a3df3fd816398840f444f384bd",
    "lineNumber": 3641,
    "columnNumber": 524_852,
    "name": "get partition",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Mi.isSelect",
    "className": "Function",
    "sourceStart": 4_395_184,
    "sourceEnd": 4_395_297,
    "sourceBytes": 113,
    "sourceSha256": "dad5b9820d5d0071ec3d83a946a369739a80eb042ab3909940605b6fc08deba5",
    "lineNumber": 3641,
    "columnNumber": 537_342,
    "name": "isSelect",
    "parameterCount": 2,
    "kind": "method"
  },
  {
    "key": "Mi.buildBBox",
    "className": "Function",
    "sourceStart": 4_396_943,
    "sourceEnd": 4_397_107,
    "sourceBytes": 164,
    "sourceSha256": "b0e2c0e69147e6127fca97c87da6f209a815e522e1c764754102fd284769f2c1",
    "lineNumber": 3641,
    "columnNumber": 539_102,
    "name": "buildBBox",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "Mi.get:layerId",
    "className": "Function",
    "sourceStart": 4_390_255,
    "sourceEnd": 4_390_295,
    "sourceBytes": 40,
    "sourceSha256": "a1cc06460f885a993416dc6ff0398ebb73db5c75452061e4aa67c425c31f9dad",
    "lineNumber": 3641,
    "columnNumber": 532_416,
    "name": "get layerId",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:globalIndex",
    "className": "Function",
    "sourceStart": 3_519_977,
    "sourceEnd": 3_520_020,
    "sourceBytes": 43,
    "sourceSha256": "977dfaccb703d19f9dd710c36e534b15254f70e9d2ab57c3545d2617285000c6",
    "lineNumber": 3637,
    "columnNumber": 397_992,
    "name": "get globalIndex",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:layerId",
    "className": "Function",
    "sourceStart": 3_521_386,
    "sourceEnd": 3_521_421,
    "sourceBytes": 35,
    "sourceSha256": "024dfa25f994d82775c72ed0671e0b648f301efc011aa646944ab17584c14346",
    "lineNumber": 3637,
    "columnNumber": 399_397,
    "name": "get layerId",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:center",
    "className": "Function",
    "sourceStart": 3_523_334,
    "sourceEnd": 3_523_367,
    "sourceBytes": 33,
    "sourceSha256": "ec1d9f050dd34f3b600bf5c7ba1ab6a4f6edc0d614cd67f2cf5899c84ecf69e0",
    "lineNumber": 3637,
    "columnNumber": 401_344,
    "name": "get center",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:rotation",
    "className": "Function",
    "sourceStart": 3_523_440,
    "sourceEnd": 3_523_477,
    "sourceBytes": 37,
    "sourceSha256": "a096050bda4313035d5cb316d95368467c1d25c4d8251ef323408b2dfd08b14f",
    "lineNumber": 3637,
    "columnNumber": 401_452,
    "name": "get rotation",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.inShape",
    "className": "Function",
    "sourceStart": 3_527_371,
    "sourceEnd": 3_527_911,
    "sourceBytes": 540,
    "sourceSha256": "fbdfb1fceab61fd60b0327ab233039e887c7e79898f6e00843061f3e70e824a9",
    "lineNumber": 3637,
    "columnNumber": 405_378,
    "name": "inShape",
    "parameterCount": 3,
    "kind": "method"
  },
  {
    "key": "tE.get:locked",
    "className": "Function",
    "sourceStart": 3_524_615,
    "sourceEnd": 3_524_648,
    "sourceBytes": 33,
    "sourceSha256": "0f60d7d0d93c44b0cd6b5057257494cbfa4bc1b2a6716912a70b92421be68525",
    "lineNumber": 3637,
    "columnNumber": 402_625,
    "name": "get locked",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:isTestPad",
    "className": "Function",
    "sourceStart": 3_520_145,
    "sourceEnd": 3_520_184,
    "sourceBytes": 39,
    "sourceSha256": "32b740d13ebda9fd7901e231c7a5c8d1fbcb9d68be4023d0dd03700e8c74295b",
    "lineNumber": 3637,
    "columnNumber": 398_158,
    "name": "get isTestPad",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:padType",
    "className": "Function",
    "sourceStart": 3_520_059,
    "sourceEnd": 3_520_094,
    "sourceBytes": 35,
    "sourceSha256": "8f28759498d481de547c29c821ea4ced9a8c2b4a649e5bfb7b72d3c5ce3abd31",
    "lineNumber": 3637,
    "columnNumber": 398_070,
    "name": "get padType",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tC.inShape",
    "className": "Function",
    "sourceStart": 3_416_732,
    "sourceEnd": 3_417_787,
    "sourceBytes": 1055,
    "sourceSha256": "163e8d5d85fe25b895f66328c960788bf8ebddcfcee34705c61f24cc14ddc8a7",
    "lineNumber": 3637,
    "columnNumber": 294_739,
    "name": "inShape",
    "parameterCount": 5,
    "kind": "method"
  }
] as const);
export const CURRENT_PCB_209_SPATIAL_PAD_EXTRA_PLANS = freezeDeep([
  {
    "key": "Mi.class",
    "role": "Mi",
    "target": "class"
  },
  {
    "key": "et.class",
    "role": "et",
    "target": "class"
  },
  {
    "key": "tE.class",
    "role": "tE",
    "target": "class"
  },
  {
    "key": "tC.class",
    "role": "tC",
    "target": "class"
  },
  {
    "key": "Ne.get:locked",
    "role": "Ne",
    "target": "prototype",
    "property": "locked",
    "getter": true
  },
  {
    "key": "Ne.get:isTestPad",
    "role": "Ne",
    "target": "prototype",
    "property": "isTestPad",
    "getter": true
  },
  {
    "key": "Ne.get:smartPad",
    "role": "Ne",
    "target": "prototype",
    "property": "smartPad",
    "getter": true
  },
  {
    "key": "Ne.get:partition",
    "role": "Ne",
    "target": "prototype",
    "property": "partition",
    "getter": true
  },
  {
    "key": "Mi.isSelect",
    "role": "Mi",
    "target": "prototype",
    "property": "isSelect"
  },
  {
    "key": "Mi.buildBBox",
    "role": "Mi",
    "target": "prototype",
    "property": "buildBBox"
  },
  {
    "key": "Mi.get:layerId",
    "role": "Mi",
    "target": "prototype",
    "property": "layerId",
    "getter": true
  },
  {
    "key": "tE.get:globalIndex",
    "role": "tE",
    "target": "prototype",
    "property": "globalIndex",
    "getter": true
  },
  {
    "key": "tE.get:layerId",
    "role": "tE",
    "target": "prototype",
    "property": "layerId",
    "getter": true
  },
  {
    "key": "tE.get:center",
    "role": "tE",
    "target": "prototype",
    "property": "center",
    "getter": true
  },
  {
    "key": "tE.get:rotation",
    "role": "tE",
    "target": "prototype",
    "property": "rotation",
    "getter": true
  },
  {
    "key": "tE.inShape",
    "role": "tE",
    "target": "prototype",
    "property": "inShape"
  },
  {
    "key": "tE.get:locked",
    "role": "tE",
    "target": "prototype",
    "property": "locked",
    "getter": true
  },
  {
    "key": "tE.get:isTestPad",
    "role": "tE",
    "target": "prototype",
    "property": "isTestPad",
    "getter": true
  },
  {
    "key": "tE.get:padType",
    "role": "tE",
    "target": "prototype",
    "property": "padType",
    "getter": true
  },
  {
    "key": "tC.inShape",
    "role": "tC",
    "target": "prototype",
    "property": "inShape"
  }
] as const);
export const CURRENT_PCB_209_SPATIAL_PAD_EXTRA_RELATIONS = freezeDeep({
  "Mi": {
    "parent": "Ne",
    "prototypeKeys": [
      "constructor",
      "top",
      "bottom",
      "inner",
      "hole",
      "color",
      "layerId",
      "holeOffset",
      "holeRotation",
      "topType",
      "innerType",
      "bottomType",
      "center",
      "topWidth",
      "topHeight",
      "innerWidth",
      "innerHeight",
      "bottomWidth",
      "bottomHeight",
      "topRatio",
      "innerRatio",
      "bottomRatio",
      "pasteExpansion",
      "expansion",
      "topSolderExpansion",
      "bottomSolderExpansion",
      "expansionType",
      "rotation",
      "holeShape",
      "holeRadius",
      "holeLength",
      "holeColor",
      "queryPasteExpansion",
      "oppositeLayer",
      "rotateFor",
      "visible",
      "hidden",
      "remove",
      "flip",
      "transform",
      "isSelect4Layer",
      "isSelect",
      "getBBoxFilterExt",
      "toJSON",
      "getFileGraphics",
      "getTopShape",
      "getInnerShape",
      "getBottomShape",
      "getHoleShape",
      "buildBBox",
      "getDimensionBBox",
      "getType",
      "getLines"
    ]
  },
  "et": {
    "parent": "ki",
    "prototypeKeys": [
      "constructor",
      "attrsMap",
      "addATTRMap",
      "modifyATTRMap",
      "deleteATTRMap",
      "clearMap",
      "numModified",
      "globalIndex",
      "isTestPad",
      "topModified",
      "bottomModified",
      "innerModified",
      "holeModified",
      "holeShape",
      "holeLength",
      "holeOffset",
      "holeRotation",
      "holeRadius",
      "expansionType",
      "pasteExpansion",
      "pasteExpansionModified",
      "topSolderExpansion",
      "topSolderExpansionModified",
      "bottomSolderExpansion",
      "bottomSolderExpansionModified",
      "padStyle",
      "updateShapeData"
    ]
  },
  "tE": {
    "parent": "et",
    "prototypeKeys": [
      "constructor",
      "padLen",
      "net",
      "showNet",
      "num",
      "globalIndex",
      "padType",
      "isTestPad",
      "padRule",
      "padExpansion",
      "pads",
      "polygonPl",
      "top",
      "bottom",
      "inner",
      "hole",
      "plated",
      "unusedInnerLayers",
      "layerId",
      "type",
      "center",
      "rotation",
      "expansionType",
      "pasteExpansion",
      "topSolderExpansion",
      "bottomSolderExpansion",
      "bbox",
      "locked",
      "padStyle",
      "transformPl",
      "update",
      "getExpansionRatio",
      "isPolygon",
      "oppositeLayer",
      "getOneInnerInUse",
      "isUnuseLayer",
      "flip",
      "rotateFor",
      "transform",
      "remove",
      "inShape",
      "updateBox",
      "getPad",
      "getBBox",
      "getFileGraphics",
      "getMathGraphics",
      "cloneLayer",
      "clone",
      "multiply3",
      "isSimilarTo",
      "checkExpansionModify"
    ]
  },
  "tC": {
    "parent": null,
    "prototypeKeys": [
      "constructor",
      "getStrokePolyline",
      "getStrokePolyline1",
      "inShape",
      "clone",
      "getShape",
      "remove",
      "isSimilarTo"
    ]
  }
} as const);
const omitted = new Set<string>(CURRENT_PCB_209_SPATIAL_PAD_OMITTED_KEYS);
export const CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES = Object.freeze([...BASE_PROFILES.filter(profile => !omitted.has(profile.key)), ...CURRENT_PCB_209_SPATIAL_PAD_EXTRA_PROFILES]);
export const CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PLANS = Object.freeze([...BASE_PLANS.filter(plan => !omitted.has(plan.key)), ...CURRENT_PCB_209_SPATIAL_PAD_EXTRA_PLANS]);

const hash = (text: string): string => createHash("sha256").update(text).digest("hex");
export function inspectCurrentPcb209SpatialPadSource(input: unknown): Readonly<{ sourceProfileMatches: boolean; compatibilityAdmitted: false; executionAuthorized: false }> {
  if (typeof input !== "string" || !input.isWellFormed() || input.length > 12 * 1024 * 1024) { throw new Error("PCB209_SPATIAL_PAD_SOURCE"); }
  const full = CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE; const sourceProfileMatches = Buffer.byteLength(input) === full.bytes && hash(input) === full.sha256 && CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES.every(profile => { const text = input.slice(profile.sourceStart, profile.sourceEnd); return Buffer.byteLength(text) === profile.sourceBytes && hash(text) === profile.sourceSha256; });
  return Object.freeze({ sourceProfileMatches, compatibilityAdmitted: false, executionAuthorized: false });
}
