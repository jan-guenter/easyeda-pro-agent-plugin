/** Exact attribute dependency function spans, without receiver or execution authority. */
import {createHash} from "node:crypto";
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {captureCurrentSchematicDisplayAccessorSource as source} from "./current-schematic-display-accessor-replies.ts";
import {qualifyCurrentSchematicWireTransitionSource as fullSource} from "./current-schematic-wire-transition-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE=freezeDeep([
  {
    "groupAttributes": {
      "start": 3_916_320,
      "end": 3_916_480,
      "bytes": 160,
      "sha256": "fdc5fd19a69a5da643700db1e59dbf644b4edb8fa40e0bb7e12d548addabf421",
      "lineNumber": 3606,
      "columnNumber": 249_450,
      "name": "get attributes",
      "arity": 0,
      "constructible": false,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    },
    "baseAttributes": {
      "start": 1_734_110,
      "end": 1_734_379,
      "bytes": 269,
      "sha256": "e381b4a565787587ec7af43aa2fc722b3aef7d0a0b15c7504e0c8d568556f810",
      "lineNumber": 59,
      "columnNumber": 17_581,
      "name": "get attributes",
      "arity": 0,
      "constructible": false,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    },
    "highlightGet": {
      "start": 3_965_754,
      "end": 3_965_889,
      "bytes": 135,
      "sha256": "88acfe7984aaca4eb4b82410e06b78f0ebe1b38966dd2634df19b5f66912f549",
      "lineNumber": 3606,
      "columnNumber": 298_887,
      "name": "getNetHighlighted",
      "arity": 1,
      "constructible": false,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    },
    "numeric": {
      "start": 296_966,
      "end": 297_007,
      "bytes": 41,
      "sha256": "f5d16a925ce5583162030b790829a6dddc609fcc30259d5d465cd6b093e387cf",
      "lineNumber": 4,
      "columnNumber": 96_432,
      "name": "ia",
      "arity": 1,
      "constructible": true,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    }
  },
  {
    "groupAttributes": {
      "start": 3_969_965,
      "end": 3_970_125,
      "bytes": 160,
      "sha256": "fdc5fd19a69a5da643700db1e59dbf644b4edb8fa40e0bb7e12d548addabf421",
      "lineNumber": 4098,
      "columnNumber": 10_691,
      "name": "get attributes",
      "arity": 0,
      "constructible": false,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    },
    "baseAttributes": {
      "start": 1_930_664,
      "end": 1_930_933,
      "bytes": 269,
      "sha256": "e381b4a565787587ec7af43aa2fc722b3aef7d0a0b15c7504e0c8d568556f810",
      "lineNumber": 557,
      "columnNumber": 17_581,
      "name": "get attributes",
      "arity": 0,
      "constructible": false,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    },
    "highlightGet": {
      "start": 4_172_955,
      "end": 4_173_090,
      "bytes": 135,
      "sha256": "88acfe7984aaca4eb4b82410e06b78f0ebe1b38966dd2634df19b5f66912f549",
      "lineNumber": 4105,
      "columnNumber": 164_355,
      "name": "getNetHighlighted",
      "arity": 1,
      "constructible": false,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    },
    "numeric": {
      "start": 1_320_378,
      "end": 1_320_419,
      "bytes": 41,
      "sha256": "f5d16a925ce5583162030b790829a6dddc609fcc30259d5d465cd6b093e387cf",
      "lineNumber": 530,
      "columnNumber": 30_230,
      "name": "ia",
      "arity": 1,
      "constructible": true,
      "className": "Function",
      "parentType": "function",
      "parentClassName": "Function",
      "parentDescription": "function () { [native code] }"
    }
  }
] as const);
export type CurrentSchematicWireGroupDataDependencyRole=keyof typeof CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE[0];
export function qualifyCurrentSchematicWireGroupDataDependencySource(input:unknown,variant:0|1):void{if(fullSource(input)!==variant){throw new Error("WIRE_DATA_DEPENDENCY_SOURCE");}const text=source(input).scriptSource;for(const role of ["groupAttributes","baseAttributes","highlightGet","numeric"]as const){const row=CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE[variant][role];const span=text.slice(row.start,row.end);if(Buffer.byteLength(span)!==row.bytes||createHash("sha256").update(span).digest("hex")!==row.sha256){throw new Error("WIRE_DATA_DEPENDENCY_SOURCE");}}}
export function qualifyCurrentSchematicWireGroupDataDependencyFunction(input:unknown,actual:unknown,variant:0|1,role:CurrentSchematicWireGroupDataDependencyRole,scriptId:string):ReturnType<typeof compare>{return compare(input,actual,CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE[variant][role],scriptId);}
