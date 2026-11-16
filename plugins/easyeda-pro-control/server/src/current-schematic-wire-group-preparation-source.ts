/** Running group method preparation only; these pins execute no command. */
import {createHash} from "node:crypto";
import {captureCurrentSchematicDisplayAccessorSource as capture} from "./current-schematic-display-accessor-replies.ts";
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_PREPARATION_SOURCE=freezeDeep([
  {
    "variant": 0,
    "rows": {
      "stackAdd": {
        "start": 3_972_829,
        "end": 3_972_858,
        "bytes": 29,
        "sha256": "aaebf5c2bfbb01aca6a998547871161d2db4d59c66aa1e8af620d563094a0d58",
        "lineNumber": 3606,
        "columnNumber": 305_948,
        "name": "add",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      }
    }
  },
  {
    "variant": 1,
    "rows": {
      "stackAdd": {
        "start": 4_180_030,
        "end": 4_180_059,
        "bytes": 29,
        "sha256": "aaebf5c2bfbb01aca6a998547871161d2db4d59c66aa1e8af620d563094a0d58",
        "lineNumber": 4105,
        "columnNumber": 171_416,
        "name": "add",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      }
    }
  }
] as const);
export function qualifyCurrentSchematicWireGroupPreparationSource(input:unknown,variant:0|1):void{const text=capture(input).scriptSource;const row=CURRENT_SCHEMATIC_WIRE_GROUP_PREPARATION_SOURCE[variant].rows.stackAdd;const part=text.slice(row.start,row.end);if(Buffer.byteLength(part)!==row.bytes||createHash("sha256").update(part).digest("hex")!==row.sha256){throw new Error("WIRE_GROUP_PREPARATION_SOURCE");}}
export function qualifyCurrentSchematicWireGroupPreparationFunction(input:unknown,actual:unknown,variant:0|1,scriptId:string):void{compare(input,actual,CURRENT_SCHEMATIC_WIRE_GROUP_PREPARATION_SOURCE[variant].rows.stackAdd,scriptId);}
