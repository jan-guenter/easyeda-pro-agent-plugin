/** Complete serialization/tree functions and one original after-call site.
 * Source and metadata comparison data grant no async or writer ownership. */
import { createHash } from "node:crypto";
import { captureCurrentSchematicDisplayAccessorSource as capture } from "./current-schematic-display-accessor-replies.ts";
import { compareCurrentSchematicWireFunctionMetadata as compare, qualifyCurrentSchematicWireCompletionSource as qualify } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "serial": {
        "start": 295_348,
        "end": 295_539,
        "bytes": 191,
        "sha256": "b07542d849981fbc4c6a05b2da84402194c63b5d038ab0c458f22ac742e19c16",
        "lineNumber": 4,
        "columnNumber": 94_814,
        "name": "Pc",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "declaration"
      },
      "serialCall": {
        "start": 295_389,
        "end": 295_538,
        "bytes": 149,
        "sha256": "4524d176bdcb72b4b9df55a413c6ffd83556211f1f754c98349f22ef5e689697",
        "lineNumber": 4,
        "columnNumber": 94_844,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "serialFresh": {
        "start": 295_487,
        "end": 295_531,
        "bytes": 44,
        "sha256": "c5c9aaf27a714aa655bc06121c14a240b070beebd657247ca72af8df9c71cbb5",
        "lineNumber": 4,
        "columnNumber": 94_942,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "serialQueued": {
        "start": 295_412,
        "end": 295_475,
        "bytes": 63,
        "sha256": "0484625cc997cd836b7e2dba6c37b30a6c33d45c673072fcb6ffa77954cea59a",
        "lineNumber": 4,
        "columnNumber": 94_867,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "objectContent": {
        "start": 5_483_559,
        "end": 5_484_998,
        "bytes": 1439,
        "sha256": "f10730f4137c40096bfb498d753db7b5bb7aeefd8c51af85c3b991b2236b1ec5",
        "lineNumber": 3673,
        "columnNumber": 171_382,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "pageContent": {
        "start": 5_520_822,
        "end": 5_522_653,
        "bytes": 1831,
        "sha256": "effb935e06c243aa5d0d731e3c43f0f7303afba2f6e04d22898c8297105f7a2c",
        "lineNumber": 3673,
        "columnNumber": 208_645,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "netContent": {
        "start": 5_505_523,
        "end": 5_506_974,
        "bytes": 1451,
        "sha256": "e9dd69e9ade40193161f182edb844b48bb4977106184f0dce205ef063bd80e8d",
        "lineNumber": 3673,
        "columnNumber": 193_346,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "symbolContent": {
        "start": 5_530_882,
        "end": 5_532_486,
        "bytes": 1604,
        "sha256": "2ac76b39fbae3d543f329ae349ac741676722f8c144f9fcb66765e1f0367d991",
        "lineNumber": 3673,
        "columnNumber": 218_705,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "astGetBatch": {
        "start": 5_549_573,
        "end": 5_549_609,
        "bytes": 36,
        "sha256": "a58d6ec80b65cbecac70480cd8d271301d07555b91df621daa78eece6b9346f3",
        "lineNumber": 3673,
        "columnNumber": 237_404,
        "name": "getBatch",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "astGetEvent": {
        "start": 5_541_588,
        "end": 5_541_953,
        "bytes": 365,
        "sha256": "784d5a18718d8ce209192efe653004dedea00c0ef30f39c1c6def19834ced2f9",
        "lineNumber": 3673,
        "columnNumber": 229_419,
        "name": "getEvent",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "astOn": {
        "start": 5_770_361,
        "end": 5_770_513,
        "bytes": 152,
        "sha256": "dcf854d909be5d8106778e945b89ab22ff6d69f85f0c72849dbb013a3899f923",
        "lineNumber": 3697,
        "columnNumber": 80_768,
        "name": "On",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "declaration"
      },
      "astIdle": {
        "start": 5_548_841,
        "end": 5_548_871,
        "bytes": 30,
        "sha256": "3a217057cfe9721192847b117eea8363173bef95bef7a1927c316bee247b2aea",
        "lineNumber": 3673,
        "columnNumber": 236_664,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      }
    },
    "continuation": {
      "lineNumber": 3673,
      "columnNumber": 230_432,
      "endColumnNumber": 230_436
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "serial": {
        "start": 1_318_760,
        "end": 1_318_951,
        "bytes": 191,
        "sha256": "9d6d71907c29f9aed9e807e97d211911ef4a5a35fb68ce280b57d50a8e7dc8ef",
        "lineNumber": 530,
        "columnNumber": 28_612,
        "name": "Dc",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "declaration"
      },
      "serialCall": {
        "start": 1_318_801,
        "end": 1_318_950,
        "bytes": 149,
        "sha256": "4524d176bdcb72b4b9df55a413c6ffd83556211f1f754c98349f22ef5e689697",
        "lineNumber": 530,
        "columnNumber": 28_642,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      },
      "serialFresh": {
        "start": 1_318_899,
        "end": 1_318_943,
        "bytes": 44,
        "sha256": "c5c9aaf27a714aa655bc06121c14a240b070beebd657247ca72af8df9c71cbb5",
        "lineNumber": 530,
        "columnNumber": 28_740,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "serialQueued": {
        "start": 1_318_824,
        "end": 1_318_887,
        "bytes": 63,
        "sha256": "0484625cc997cd836b7e2dba6c37b30a6c33d45c673072fcb6ffa77954cea59a",
        "lineNumber": 530,
        "columnNumber": 28_665,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "objectContent": {
        "start": 4_018_305,
        "end": 4_019_744,
        "bytes": 1439,
        "sha256": "eec03226ea18a67eb69752fb5cf0619647655d0c824645ff270f43d82b63b982",
        "lineNumber": 4105,
        "columnNumber": 9688,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "pageContent": {
        "start": 4_071_147,
        "end": 4_072_978,
        "bytes": 1831,
        "sha256": "5b0f47d4e145c0ca8de3e27f26c9decabbe61e79b89df69ec5e7346b9b8c3c38",
        "lineNumber": 4105,
        "columnNumber": 62_530,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "netContent": {
        "start": 4_040_269,
        "end": 4_041_720,
        "bytes": 1451,
        "sha256": "0b58074a7835063eec6c7338fe8ad2d2a96e3db243ab79c9fec9fbcca5a84a89",
        "lineNumber": 4105,
        "columnNumber": 31_652,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "symbolContent": {
        "start": 4_081_207,
        "end": 4_082_811,
        "bytes": 1604,
        "sha256": "811a3bce51e03ff0c261a322bf280f5f56ddab9af84ae3039ab3dcf0926a941a",
        "lineNumber": 4105,
        "columnNumber": 72_590,
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "expression"
      },
      "astGetBatch": {
        "start": 4_099_898,
        "end": 4_099_934,
        "bytes": 36,
        "sha256": "a58d6ec80b65cbecac70480cd8d271301d07555b91df621daa78eece6b9346f3",
        "lineNumber": 4105,
        "columnNumber": 91_289,
        "name": "getBatch",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "astGetEvent": {
        "start": 4_091_913,
        "end": 4_092_278,
        "bytes": 365,
        "sha256": "784d5a18718d8ce209192efe653004dedea00c0ef30f39c1c6def19834ced2f9",
        "lineNumber": 4105,
        "columnNumber": 83_304,
        "name": "getEvent",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "method"
      },
      "astOn": {
        "start": 6_413_829,
        "end": 6_413_981,
        "bytes": 152,
        "sha256": "7538edcf34b417c54e101b4466c10d418a58240d3638b6f945fabc582b41b124",
        "lineNumber": 4331,
        "columnNumber": 209_628,
        "name": "bn",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "form": "declaration"
      },
      "astIdle": {
        "start": 4_099_166,
        "end": 4_099_196,
        "bytes": 30,
        "sha256": "3a217057cfe9721192847b117eea8363173bef95bef7a1927c316bee247b2aea",
        "lineNumber": 4105,
        "columnNumber": 90_549,
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "form": "expression"
      }
    },
    "continuation": {
      "lineNumber": 4105,
      "columnNumber": 84_317,
      "endColumnNumber": 84_321
    }
  }
] as const);
export const CURRENT_SCHEMATIC_WIRE_ASYNC_ROLES = Object.freeze(["serial", "serialCall", "serialFresh", "serialQueued", "objectContent", "pageContent", "netContent", "symbolContent", "astGetBatch", "astGetEvent", "astOn", "astIdle"] as const);
export type CurrentSchematicWireAsyncRole = keyof typeof CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE[0]["rows"];
export type CurrentSchematicWireAsyncTree = "objectContent" | "pageContent" | "netContent" | "symbolContent";
/** First qualify the entire installed bundle, then all twelve complete spans. */
export function qualifyCurrentSchematicWireAsyncSource(input: unknown): 0 | 1 {
  const variant = qualify(input); const raw = capture(input);
  const rows: Readonly<Record<CurrentSchematicWireAsyncRole, Readonly<{ start: number; end: number; bytes: number; sha256: string }>>> = CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE[variant].rows;
  for (const row of Object.values(rows)) { const text = raw.scriptSource.slice(row.start, row.end); if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_WIRE_ASYNC_SOURCE"); } }
  return variant;
}
/** Compare complete function text and its actual source script/PC metadata. */
export function decodeCurrentSchematicWireAsyncFunction(input: unknown, actual: unknown, variant: 0 | 1, role: CurrentSchematicWireAsyncRole, scriptId: string): CurrentSchematicWireCompletionFunction {
  if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_ASYNC_VARIANT"); }
  return compare(input, actual, CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE[variant].rows[role], scriptId);
}
