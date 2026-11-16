/** Exact Line tag getter and the first NetGroupLine init callback only.
 * These pins lend no class, receiver, model, constructor or event authority. */
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_METHOD_SOURCE=freezeDeep([
  {
    "variant": 0,
    "rows": {
      "lineTagName": {
        "start": 3_854_623,
        "end": 3_854_658,
        "bytes": 35,
        "sha256": "d9a34a2cce4bbc05db5492ba6a6d6a3bcc0b20ca2ce633b7661f6861cc14b5d5",
        "lineNumber": 3606,
        "columnNumber": 187_750,
        "name": "get tagName",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "groupInitCallback": {
        "start": 3_973_361,
        "end": 3_973_386,
        "bytes": 25,
        "sha256": "efbcd5e9a52855ab60dac62633bac1c5b4f7d3cec5accfa2a413f5eeaca06e59",
        "lineNumber": 3606,
        "columnNumber": 306_477,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      }
    }
  },
  {
    "variant": 1,
    "rows": {
      "lineTagName": {
        "start": 2_154_055,
        "end": 2_154_090,
        "bytes": 35,
        "sha256": "d9a34a2cce4bbc05db5492ba6a6d6a3bcc0b20ca2ce633b7661f6861cc14b5d5",
        "lineNumber": 557,
        "columnNumber": 240_969,
        "name": "get tagName",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "groupInitCallback": {
        "start": 4_180_562,
        "end": 4_180_587,
        "bytes": 25,
        "sha256": "efbcd5e9a52855ab60dac62633bac1c5b4f7d3cec5accfa2a413f5eeaca06e59",
        "lineNumber": 4105,
        "columnNumber": 171_945,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      }
    }
  }
] as const);
export function qualifyCurrentSchematicWireGroupMethodFunction(input:unknown,actual:unknown,variant:0|1,role:"lineTagName"|"groupInitCallback",scriptId:string):void{compare(input,actual,CURRENT_SCHEMATIC_WIRE_GROUP_METHOD_SOURCE[variant].rows[role],scriptId);}
