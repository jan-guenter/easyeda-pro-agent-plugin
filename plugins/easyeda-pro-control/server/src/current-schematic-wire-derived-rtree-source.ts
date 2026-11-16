/** Complete original rTree/connection classes and methods. These data do not
 * admit execution, substitute captured bindings or issue an original owner. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { qualifyCurrentSchematicWireCompletionSource } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "rbushFactory": {
        "start": 164_219,
        "end": 170_518,
        "bytes": 6299,
        "sha256": "57eb390c5aca9cbad655f33c54ad8e31d1b5ef634d061177329870647e9bb8d7",
        "lineNumber": 3,
        "columnNumber": 86_358,
        "name": "",
        "arity": 0,
        "classSyntax": false,
        "constructible": true,
        "prototypeWritable": true,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "modelTreeClass": {
        "start": 3_978_361,
        "end": 3_980_060,
        "bytes": 1699,
        "sha256": "163d7769997a6084ff171ec9ca373ffd9b62f821a9f8da4d79ab82307c82c28a",
        "lineNumber": 3606,
        "columnNumber": 311_494,
        "name": "C8",
        "arity": 0,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "pointRangeClass": {
        "start": 3_940_267,
        "end": 3_940_780,
        "bytes": 513,
        "sha256": "65ba0ea4bbf8d24af819b2a14976a7e1cedfb99e6aa5c2d2858aeb186cf3a98e",
        "lineNumber": 3606,
        "columnNumber": 273_400,
        "name": "tI",
        "arity": 1,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "connectionClass": {
        "start": 3_939_407,
        "end": 3_940_263,
        "bytes": 856,
        "sha256": "91f3f7c885b4e6321a94da86e297a2dea089b84d5dc8970ec708126f26e0b632",
        "lineNumber": 3606,
        "columnNumber": 272_605,
        "name": "CJ",
        "arity": 0,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 3069,
        "parentSha256": "7f80924266622384fc092586074547615346c67532b3a8cc9a18958c4b07974c",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "basicPointClass": {
        "start": 1_706_618,
        "end": 1_709_687,
        "bytes": 3069,
        "sha256": "7f80924266622384fc092586074547615346c67532b3a8cc9a18958c4b07974c",
        "lineNumber": 58,
        "columnNumber": 68_732,
        "name": "dl",
        "arity": 2,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype",
          "sortByXAsc",
          "sortByYAsc",
          "sortByXYAsc",
          "normal",
          "getVector2",
          "getKey",
          "getCrossPoint1",
          "getCrossPoint2"
        ]
      },
      "groupRTreeAddible": {
        "start": 3_915_026,
        "end": 3_915_054,
        "bytes": 28,
        "sha256": "fde24afeff40a353f39948e0a87d16140cbd3ea5f6296a9b4aad35d2b6a5de28",
        "lineNumber": 3606,
        "columnNumber": 248_158,
        "name": "get rTreeAddible",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "lineBBox": {
        "start": 3_853_685,
        "end": 3_853_768,
        "bytes": 83,
        "sha256": "bf16341801ce5501b614ded61bc4a0b0bebb1913282b0a73752149b250e9faa7",
        "lineNumber": 3606,
        "columnNumber": 186_808,
        "name": "getBBox",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "lineRenderBBox": {
        "start": 3_853_768,
        "end": 3_853_846,
        "bytes": 78,
        "sha256": "71b86ac9a310284d4007a281ab64fb7bb9b1601ed9fed9f084ec5b1c1d3280cb",
        "lineNumber": 3606,
        "columnNumber": 186_897,
        "name": "getRenderBBox",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "baseBBoxForRTree": {
        "start": 1_738_342,
        "end": 1_738_388,
        "bytes": 46,
        "sha256": "d689780ce6bd804ea1a310f009b39e7c1e488f7f228e246a773ba2d6776f6183",
        "lineNumber": 59,
        "columnNumber": 21_814,
        "name": "getBBoxForRTree",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "baseUpdateSelfBBox": {
        "start": 1_738_423,
        "end": 1_738_529,
        "bytes": 106,
        "sha256": "5a281e578337eeb5846bbf8134a47e98d1086f66e4f73f82f05c41d865416c6f",
        "lineNumber": 59,
        "columnNumber": 21_894,
        "name": "updateSelfBBox",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "netRefresh": {
        "start": 3_945_380,
        "end": 3_946_323,
        "bytes": 943,
        "sha256": "94d8964473f6503af3988b85dc6ceaaa698accbd2e92811a77115424ab42b9c7",
        "lineNumber": 3606,
        "columnNumber": 278_511,
        "name": "refreshNetPoint",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "netAnalyze": {
        "start": 3_943_667,
        "end": 3_943_921,
        "bytes": 254,
        "sha256": "ddb1174253d11ede21cbe70b50f621460756ccb364909475b8bfb11994f637af",
        "lineNumber": 3606,
        "columnNumber": 276_802,
        "name": "analyzeNetPointData",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "netBuild": {
        "start": 3_942_638,
        "end": 3_943_594,
        "bytes": 956,
        "sha256": "63f52b0150d335b1ecf2f173b990ad9085ed861707f24b6209164bbdf793de05",
        "lineNumber": 3606,
        "columnNumber": 275_775,
        "name": "buildNetPointsIndexes",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "rbushFactory": {
        "start": 347_123,
        "end": 353_422,
        "bytes": 6299,
        "sha256": "3390f8ea49492cf12002f5142297cfad688efbbf767efaf548908f0506b8450d",
        "lineNumber": 501,
        "columnNumber": 86_358,
        "name": "",
        "arity": 0,
        "classSyntax": false,
        "constructible": true,
        "prototypeWritable": true,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "modelTreeClass": {
        "start": 4_185_562,
        "end": 4_187_261,
        "bytes": 1699,
        "sha256": "9ed50881f5486cc1306f4c9eccf01cd3268eb12c78ccf6573241231792366732",
        "lineNumber": 4105,
        "columnNumber": 176_962,
        "name": "O8",
        "arity": 0,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "pointRangeClass": {
        "start": 4_145_334,
        "end": 4_145_847,
        "bytes": 513,
        "sha256": "f23b64b3941b9bf4905dbebabdf4cb5f7b0f83d707489e01fae17eb04606b17c",
        "lineNumber": 4105,
        "columnNumber": 136_734,
        "name": "dI",
        "arity": 1,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "connectionClass": {
        "start": 4_144_474,
        "end": 4_145_330,
        "bytes": 856,
        "sha256": "51787f5bc2a3f1d477958889a82c2f9515f096ab82f3a3b6a55a9fa92e2f06ef",
        "lineNumber": 4105,
        "columnNumber": 135_939,
        "name": "XJ",
        "arity": 0,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 3069,
        "parentSha256": "7af41e5d30cb5d3aefd45f54afbbc2ee8fba3d0f45bd5fd2d23072cbdacbb2eb",
        "ownNames": [
          "length",
          "name",
          "prototype"
        ]
      },
      "basicPointClass": {
        "start": 1_903_172,
        "end": 1_906_241,
        "bytes": 3069,
        "sha256": "7af41e5d30cb5d3aefd45f54afbbc2ee8fba3d0f45bd5fd2d23072cbdacbb2eb",
        "lineNumber": 556,
        "columnNumber": 124_269,
        "name": "hl",
        "arity": 2,
        "classSyntax": true,
        "constructible": true,
        "prototypeWritable": false,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name",
          "prototype",
          "sortByXAsc",
          "sortByYAsc",
          "sortByXYAsc",
          "normal",
          "getVector2",
          "getKey",
          "getCrossPoint1",
          "getCrossPoint2"
        ]
      },
      "groupRTreeAddible": {
        "start": 3_968_671,
        "end": 3_968_699,
        "bytes": 28,
        "sha256": "fde24afeff40a353f39948e0a87d16140cbd3ea5f6296a9b4aad35d2b6a5de28",
        "lineNumber": 4098,
        "columnNumber": 9399,
        "name": "get rTreeAddible",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "lineBBox": {
        "start": 2_149_520,
        "end": 2_149_603,
        "bytes": 83,
        "sha256": "bf16341801ce5501b614ded61bc4a0b0bebb1913282b0a73752149b250e9faa7",
        "lineNumber": 557,
        "columnNumber": 236_430,
        "name": "getBBox",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "lineRenderBBox": {
        "start": 2_149_603,
        "end": 2_149_681,
        "bytes": 78,
        "sha256": "71b86ac9a310284d4007a281ab64fb7bb9b1601ed9fed9f084ec5b1c1d3280cb",
        "lineNumber": 557,
        "columnNumber": 236_519,
        "name": "getRenderBBox",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "baseBBoxForRTree": {
        "start": 1_934_896,
        "end": 1_934_942,
        "bytes": 46,
        "sha256": "d689780ce6bd804ea1a310f009b39e7c1e488f7f228e246a773ba2d6776f6183",
        "lineNumber": 557,
        "columnNumber": 21_814,
        "name": "getBBoxForRTree",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "baseUpdateSelfBBox": {
        "start": 1_934_977,
        "end": 1_935_083,
        "bytes": 106,
        "sha256": "5a281e578337eeb5846bbf8134a47e98d1086f66e4f73f82f05c41d865416c6f",
        "lineNumber": 557,
        "columnNumber": 21_894,
        "name": "updateSelfBBox",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "netRefresh": {
        "start": 4_150_447,
        "end": 4_151_390,
        "bytes": 943,
        "sha256": "02290817bc17af656c60e98b633918192d36be8e1222df0fd9d3a91c850305b5",
        "lineNumber": 4105,
        "columnNumber": 141_845,
        "name": "refreshNetPoint",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "netAnalyze": {
        "start": 4_148_734,
        "end": 4_148_988,
        "bytes": 254,
        "sha256": "ddb1174253d11ede21cbe70b50f621460756ccb364909475b8bfb11994f637af",
        "lineNumber": 4105,
        "columnNumber": 140_136,
        "name": "analyzeNetPointData",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      },
      "netBuild": {
        "start": 4_147_705,
        "end": 4_148_661,
        "bytes": 956,
        "sha256": "63f52b0150d335b1ecf2f173b990ad9085ed861707f24b6209164bbdf793de05",
        "lineNumber": 4105,
        "columnNumber": 139_109,
        "name": "buildNetPointsIndexes",
        "arity": 0,
        "classSyntax": false,
        "constructible": false,
        "prototypeWritable": null,
        "parentType": "function",
        "parentClassName": "Function",
        "parentBytes": 29,
        "parentSha256": "0b57ab05538ff09a83dc6159fb7e5e46c4188ee02fe567ce5e1a1ef6823d6e30",
        "ownNames": [
          "length",
          "name"
        ]
      }
    }
  }
] as const);
export type CurrentSchematicWireDerivedRtreeRole = keyof typeof CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE[0]["rows"];
export const CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_ROLES = Object.freeze(["rbushFactory", "modelTreeClass", "pointRangeClass", "connectionClass", "basicPointClass", "groupRTreeAddible", "lineBBox", "lineRenderBBox", "baseBBoxForRTree", "baseUpdateSelfBBox", "netRefresh", "netAnalyze", "netBuild"] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(16_384).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().optional() });
const property = z.strictObject({ name: z.string(), value: remote.optional(), get: remote.optional(), set: remote.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).refine(field => field.value === undefined && field.writable === undefined || field.get === undefined && field.set === undefined);
const internal = z.strictObject({ name: z.string(), value: remote });
const packet = z.strictObject({ result: z.array(property).max(12), internalProperties: z.array(internal).length(3) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE"); } }
function hash(text: string): string { return createHash("sha256").update(text).digest("hex"); }
/** Require the whole installed schematic source and every complete span. */
export function qualifyCurrentSchematicWireDerivedRtreeSource(input: unknown): 0 | 1 {
  const variant = qualifyCurrentSchematicWireCompletionSource(input); const raw = captureCurrentSchematicDisplayAccessorSource(input);
  const spans: Readonly<Record<CurrentSchematicWireDerivedRtreeRole, Readonly<{start: number; end: number; bytes: number; sha256: string}>>> = CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE[variant].rows;
  for (const row of Object.values(spans)) {
    const text = raw.scriptSource.slice(row.start, row.end); need(Buffer.byteLength(text) === row.bytes && hash(text) === row.sha256);
  }
  return variant;
}
export interface CurrentSchematicWireDerivedRtreeFunction {
  readonly objectId: string; readonly scopes: string; readonly parent: z.infer<typeof remote>;
  readonly originalBindingsComplete: false; readonly executionAuthorized: false;
}
/** Compare actual class descriptors as classes: their own prototype property
 * is non-writable. Do not normalize them into ordinary constructible functions. */
export function decodeCurrentSchematicWireDerivedRtreeFunction(input: unknown, actual: unknown, variant: 0 | 1, role: CurrentSchematicWireDerivedRtreeRole, scriptId: string): CurrentSchematicWireDerivedRtreeFunction {
  need((variant === 0 || variant === 1) && !Object.is(variant, -0)); handle.parse(scriptId);
  const expected = CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE[variant].rows[role]; const fn = remote.parse(capture(actual).value);
  need(fn.type === "function" && fn.subtype === undefined && fn.className === "Function" && fn.objectId !== undefined && fn.value === undefined && typeof fn.description === "string" && Buffer.byteLength(fn.description) === expected.bytes && hash(fn.description) === expected.sha256);
  const raw = packet.parse(capture(input).value); const fields = new Map(raw.result.map(row => [row.name, row]));
  const names: readonly string[] = expected.ownNames;
  // ORIGIN is an actual later assignment outside the complete point class body.
  // Its presence cannot establish that assignment's original execution.
  const origin = role === "basicPointClass" && fields.has("ORIGIN");
  need(fields.size === raw.result.length && fields.size === names.length + Number(origin));
  for (const name of fields.keys()) { need(names.includes(name) || origin && name === "ORIGIN"); }
  for (const [key, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(key); need(field?.value !== undefined && field.value.type === (key === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined && field.writable === false && !field.enumerable && field.configurable);
  }
  if (expected.constructible) {
    const field = fields.get("prototype"); need(field?.value?.type === "object" && field.value.subtype === undefined && field.value.objectId !== undefined && field.writable === expected.prototypeWritable && !field.enumerable && !field.configurable);
  }
  for (const name of names.filter(key => !["name", "length", "prototype"].includes(key))) {
    const field = fields.get(name); need(field?.value?.type === "function" && field.value.subtype === undefined && field.value.objectId !== undefined && field.writable === true && !field.enumerable && field.configurable);
  }
  if (origin) {
    const field = fields.get("ORIGIN"); need(field?.value?.type === "object" && field.value.subtype === undefined && field.value.className === expected.name && field.value.objectId !== undefined && field.writable === true && field.enumerable && field.configurable);
  }
  const internals = new Map(raw.internalProperties.map(row => [row.name, row.value]));
  const location = internals.get("[[FunctionLocation]]"); const scopes = internals.get("[[Scopes]]"); const parent = internals.get("[[Prototype]]");
  need(internals.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined);
  const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).parse(location.value);
  need(site.scriptId === scriptId && site.lineNumber === expected.lineNumber && site.columnNumber === expected.columnNumber && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "") && parent?.type === expected.parentType && parent.subtype === undefined && parent.className === expected.parentClassName && typeof parent.description === "string" && Buffer.byteLength(parent.description) === expected.parentBytes && hash(parent.description) === expected.parentSha256 && parent.objectId !== undefined && parent.value === undefined);
  return Object.freeze({ objectId: fn.objectId, scopes: scopes.objectId, parent, originalBindingsComplete: false, executionAuthorized: false });
}
