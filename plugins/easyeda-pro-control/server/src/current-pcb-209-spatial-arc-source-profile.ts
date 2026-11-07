/** Fixed native ArcTrack callees from the pinned209 source.
 * Original-position Node metadata grants no native owner or live execution. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PROFILES = freezeDeep([
  {
    "key": "Oi.class",
    "className": "Function",
    "sourceStart": 4_829_737,
    "sourceEnd": 4_830_884,
    "sourceBytes": 1147,
    "sourceSha256": "cf612d38c8ca31020d01a40c1e38b56cf875359825da07e3a71339047d224c4e",
    "lineNumber": 3641,
    "columnNumber": 971_915,
    "name": "Oi",
    "parameterCount": 1,
    "kind": "class"
  },
  {
    "key": "vi.class",
    "className": "Function",
    "sourceStart": 4_077_371,
    "sourceEnd": 4_078_900,
    "sourceBytes": 1529,
    "sourceSha256": "7209de2a79dd655f033d6959b077d691fb657398185e34e39acceb785fecc6ef",
    "lineNumber": 3641,
    "columnNumber": 219_551,
    "name": "o",
    "parameterCount": 12,
    "kind": "class"
  },
  {
    "key": "tF.class",
    "className": "Function",
    "sourceStart": 4_071_708,
    "sourceEnd": 4_077_363,
    "sourceBytes": 5655,
    "sourceSha256": "795c1d790105833e5e9b927252f610c7821aea29f6543ba3ac64ee4247a715e7",
    "lineNumber": 3641,
    "columnNumber": 213_877,
    "name": "o",
    "parameterCount": 5,
    "kind": "class"
  },
  {
    "key": "tF.get:center",
    "className": "Function",
    "sourceStart": 4_071_847,
    "sourceEnd": 4_071_880,
    "sourceBytes": 33,
    "sourceSha256": "ec1d9f050dd34f3b600bf5c7ba1ab6a4f6edc0d614cd67f2cf5899c84ecf69e0",
    "lineNumber": 3641,
    "columnNumber": 214_007,
    "name": "get center",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tF.get:radius",
    "className": "Function",
    "sourceStart": 4_071_928,
    "sourceEnd": 4_071_961,
    "sourceBytes": 33,
    "sourceSha256": "a3a2ce9bc5839a38258be1fb08bb586983f292c79014b558e8e08bfbaab20fcc",
    "lineNumber": 3641,
    "columnNumber": 214_088,
    "name": "get radius",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tF.get:startAngle",
    "className": "Function",
    "sourceStart": 4_072_024,
    "sourceEnd": 4_072_065,
    "sourceBytes": 41,
    "sourceSha256": "337a92e13dc4c26b37df6e31bcb9b2725e20d396ee3dda2ee2b8eb47a592a03f",
    "lineNumber": 3641,
    "columnNumber": 214_188,
    "name": "get startAngle",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tF.get:endAngle",
    "className": "Function",
    "sourceStart": 4_072_133,
    "sourceEnd": 4_072_170,
    "sourceBytes": 37,
    "sourceSha256": "004421a726009be1855ea7c3b5673f3c8a29dd544cba0a1bd0666965b2d2d354",
    "lineNumber": 3641,
    "columnNumber": 214_295,
    "name": "get endAngle",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tF.get:sweep",
    "className": "Function",
    "sourceStart": 4_072_232,
    "sourceEnd": 4_072_263,
    "sourceBytes": 31,
    "sourceSha256": "fc46706af7217104e6c49305f86e283d95fdb1eb26360865266176ba946652fa",
    "lineNumber": 3641,
    "columnNumber": 214_391,
    "name": "get sweep",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tF.inShape",
    "className": "Function",
    "sourceStart": 4_076_288,
    "sourceEnd": 4_076_902,
    "sourceBytes": 614,
    "sourceSha256": "a7919f020245e0171bc45a023c378a1ed6e0a45976ac753c758573845d1b0796",
    "lineNumber": 3641,
    "columnNumber": 218_445,
    "name": "inShape",
    "parameterCount": 4,
    "kind": "method"
  }
] as const);

export const CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PLANS = freezeDeep([
  {
    "key": "Oi.class",
    "role": "Oi",
    "target": "class"
  },
  {
    "key": "vi.class",
    "role": "vi",
    "target": "class"
  },
  {
    "key": "tF.class",
    "role": "tF",
    "target": "class"
  },
  {
    "key": "tF.get:center",
    "role": "tF",
    "target": "prototype",
    "property": "center",
    "getter": true
  },
  {
    "key": "tF.get:radius",
    "role": "tF",
    "target": "prototype",
    "property": "radius",
    "getter": true
  },
  {
    "key": "tF.get:startAngle",
    "role": "tF",
    "target": "prototype",
    "property": "startAngle",
    "getter": true
  },
  {
    "key": "tF.get:endAngle",
    "role": "tF",
    "target": "prototype",
    "property": "endAngle",
    "getter": true
  },
  {
    "key": "tF.get:sweep",
    "role": "tF",
    "target": "prototype",
    "property": "sweep",
    "getter": true
  },
  {
    "key": "tF.inShape",
    "role": "tF",
    "target": "prototype",
    "property": "inShape"
  }
] as const);

export const CURRENT_PCB_209_SPATIAL_ARC_EXTRA_RELATIONS = freezeDeep({
  "Oi": {
    "parent": "Ue",
    "prototypeKeys": [
      "constructor",
      "arcType",
      "angle",
      "center",
      "radius",
      "startAngle",
      "endAngle",
      "isCCW",
      "sweep",
      "midPoint",
      "toJSON",
      "getType"
    ]
  },
  "vi": {
    "parent": "mt",
    "prototypeKeys": [
      "constructor",
      "radius",
      "arcType",
      "startAngle",
      "endAngle",
      "center",
      "midPoint",
      "sweepAngle",
      "sweep",
      "isCCW",
      "angle",
      "primitive",
      "transform",
      "clone"
    ]
  },
  "tF": {
    "parent": null,
    "prototypeKeys": [
      "constructor",
      "center",
      "radius",
      "startAngle",
      "endAngle",
      "sweep",
      "arcType",
      "angle",
      "sweepAngle",
      "start",
      "end",
      "length",
      "midPoint",
      "primitive",
      "getAngle",
      "setStartAngleAndEndAngle",
      "transform",
      "inShape",
      "getBBox",
      "getMathGraphics",
      "clone",
      "equals"
    ]
  }
} as const);
