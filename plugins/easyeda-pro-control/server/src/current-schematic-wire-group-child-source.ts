// Exact first original child attribute getter; no body completion authority.
import {createHash} from "node:crypto";
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {captureCurrentSchematicDisplayAccessorSource as source} from "./current-schematic-display-accessor-replies.ts";
import {qualifyCurrentSchematicWireTransitionSource as fullSource} from "./current-schematic-wire-transition-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SOURCE=freezeDeep([
  {
    "start": 3_853_022,
    "end": 3_853_205,
    "bytes": 183,
    "sha256": "1bf4112e5ef007dc1979753fe803040f3a2bffdaec0ff25fe6bf7a0ec86bbc22",
    "lineNumber": 3606,
    "columnNumber": 186_152,
    "name": "get attributes",
    "arity": 0,
    "constructible": false,
    "className": "Function",
    "parentType": "function",
    "parentClassName": "Function",
    "parentDescription": "function () { [native code] }"
  },
  {
    "start": 2_148_857,
    "end": 2_149_040,
    "bytes": 183,
    "sha256": "1bf4112e5ef007dc1979753fe803040f3a2bffdaec0ff25fe6bf7a0ec86bbc22",
    "lineNumber": 557,
    "columnNumber": 235_774,
    "name": "get attributes",
    "arity": 0,
    "constructible": false,
    "className": "Function",
    "parentType": "function",
    "parentClassName": "Function",
    "parentDescription": "function () { [native code] }"
  }
] as const);
export function qualifyCurrentSchematicWireGroupChildSource(input:unknown,variant:0|1):void{if(fullSource(input)!==variant){throw new Error("WIRE_CHILD_SOURCE");}const row=CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SOURCE[variant],span=source(input).scriptSource.slice(row.start,row.end);if(Buffer.byteLength(span)!==row.bytes||createHash("sha256").update(span).digest("hex")!==row.sha256){throw new Error("WIRE_CHILD_SOURCE");}}
export function qualifyCurrentSchematicWireGroupChildFunction(input:unknown,actual:unknown,variant:0|1,scriptId:string):ReturnType<typeof compare>{return compare(input,actual,CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SOURCE[variant],scriptId);}
