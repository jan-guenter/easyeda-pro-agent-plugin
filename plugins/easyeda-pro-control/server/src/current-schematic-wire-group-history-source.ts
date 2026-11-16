/** Original single GROUP publication listener, qualified after its entire
 * original schematic source. Matching metadata grants no callback ownership. */
import { createHash } from "node:crypto";
import { captureCurrentSchematicDisplayAccessorSource as capture } from "./current-schematic-display-accessor-replies.ts";
import { compareCurrentSchematicWireFunctionMetadata as compare, qualifyCurrentSchematicWireCompletionSource as qualify } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "groupPublication": {
        "start": 4_407_212,
        "end": 4_407_228,
        "bytes": 16,
        "sha256": "8d67dd121a24dd9b67aea7e501713f082fb7d3193ea1a881f82a9ba6497b91ae",
        "lineNumber": 3613,
        "columnNumber": 93_597,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "uploaderWatch": {
        "start": 4_405_629,
        "end": 4_407_541,
        "bytes": 1912,
        "sha256": "8687a8044c2c2d5117c8ff44004a0abb3b347e2e5e4f22ae8685464d79e0060e",
        "lineNumber": 3613,
        "columnNumber": 92_019,
        "name": "watch",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "handleModelCommand": {
        "start": 4_405_228,
        "end": 4_405_629,
        "bytes": 401,
        "sha256": "5ad1e10bf645306e8fd5eee659ff136fd392317b307ccfa5f6aa2ddc22a7058a",
        "lineNumber": 3613,
        "columnNumber": 91_632,
        "name": "_handleModelCommand",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "groupUpload": {
        "start": 3_913_488,
        "end": 3_914_164,
        "bytes": 676,
        "sha256": "8cc706e805e24f39db9a6f5f6cc9d0a6b5b7c8b289129f0def53607e2e1a4b62",
        "lineNumber": 3606,
        "columnNumber": 246_630,
        "name": "uploadToConsistencyManager",
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
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "groupPublication": {
        "start": 4_629_981,
        "end": 4_629_997,
        "bytes": 16,
        "sha256": "8d67dd121a24dd9b67aea7e501713f082fb7d3193ea1a881f82a9ba6497b91ae",
        "lineNumber": 4112,
        "columnNumber": 91_005,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "uploaderWatch": {
        "start": 4_628_398,
        "end": 4_630_310,
        "bytes": 1912,
        "sha256": "37afd753227a4c6c34a3498c3241fa3db976b39055488343928fc81441e05dd2",
        "lineNumber": 4112,
        "columnNumber": 89_427,
        "name": "watch",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "handleModelCommand": {
        "start": 4_627_997,
        "end": 4_628_398,
        "bytes": 401,
        "sha256": "5ad1e10bf645306e8fd5eee659ff136fd392317b307ccfa5f6aa2ddc22a7058a",
        "lineNumber": 4112,
        "columnNumber": 89_040,
        "name": "_handleModelCommand",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "groupUpload": {
        "start": 3_967_133,
        "end": 3_967_809,
        "bytes": 676,
        "sha256": "8cc706e805e24f39db9a6f5f6cc9d0a6b5b7c8b289129f0def53607e2e1a4b62",
        "lineNumber": 4098,
        "columnNumber": 7871,
        "name": "uploadToConsistencyManager",
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
/** Qualify both original whole-source identity and the complete callback span. */
export function qualifyCurrentSchematicWireGroupHistorySource(input: unknown): 0 | 1 {
  const variant = qualify(input); const raw = capture(input);
  const spans: Readonly<Record<CurrentSchematicWireGroupHistorySourceRole, Readonly<{ start: number; end: number; bytes: number; sha256: string }>>> = CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_SOURCE[variant].rows;
  for (const row of Object.values(spans)) {
    const text = raw.scriptSource.slice(row.start, row.end);
    if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_WIRE_GROUP_HISTORY_SOURCE"); }
  }
  return variant;
}
export type CurrentSchematicWireGroupHistorySourceRole = keyof typeof CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_SOURCE[0]["rows"];
/** Compare complete callback text, actual original PC and ordinary metadata. */
export function decodeCurrentSchematicWireGroupHistoryFunction(input: unknown, actual: unknown, variant: 0 | 1, scriptId: string, role: CurrentSchematicWireGroupHistorySourceRole = "groupPublication"): CurrentSchematicWireCompletionFunction {
  if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_GROUP_HISTORY_VARIANT"); }
  return compare(input, actual, CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_SOURCE[variant].rows[role], scriptId);
}
