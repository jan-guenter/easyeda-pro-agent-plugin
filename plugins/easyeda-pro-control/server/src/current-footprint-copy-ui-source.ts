/** Fixed notification-source qualification. These pins describe the
 * already installed UI bundle; no supplied text is evaluated. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_UI_SOURCE = freezeDeep({
  relativePath: "pro-ui/3.2.198.2800f583/js/ui.js", bytes: 17_468_192,
  sha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
  functions: {
  "wrapper": {
    "start": 1_651_394,
    "end": 1_651_706,
    "bytes": 312,
    "sha256": "b5d2b0f9f1f48b813c553b930bca51e42ff3cf2b7d6683029e8cc6ae0c6a46e9",
    "name": "i",
    "arity": 1,
    "async": false,
    "lineNumber": 1033,
    "columnNumber": 31_091
  },
  "responder": {
    "start": 16_969_142,
    "end": 16_969_178,
    "bytes": 36,
    "sha256": "391b67d00b4dc26b7504ada02d36093d3e989718243663ff378e2c95458c4bab",
    "name": "",
    "arity": 1,
    "async": true,
    "lineNumber": 2262,
    "columnNumber": 162_743
  },
  "sourceRouter": {
    "start": 6_340_927,
    "end": 6_341_182,
    "bytes": 255,
    "sha256": "a8b5eec79104425f6429cb78856eb3a2ab9e2a3165952ff597b8df91440fd4eb",
    "name": "getProLibSource",
    "arity": 1,
    "async": true,
    "lineNumber": 1172,
    "columnNumber": 84_284
  },
  "projectSource": {
    "start": 6_339_790,
    "end": 6_340_307,
    "bytes": 517,
    "sha256": "eb571ea134ccc8fdc0eac32b1ccdaa2e8cb74fbbbb2e7c7c337f0b9628014e05",
    "name": "getProjectLibByWorker",
    "arity": 1,
    "async": true,
    "lineNumber": 1172,
    "columnNumber": 83_153
  },
  "registryInstance": {
    "start": 6_122_661,
    "end": 6_122_767,
    "bytes": 106,
    "sha256": "2b7a90c0dc900576e65fd21b21b9324c39b693dc835c01cfdb3737c96122edff",
    "name": "getInstance",
    "arity": 0,
    "async": false,
    "lineNumber": 1171,
    "columnNumber": 5204
  },
  "registryHas": {
    "start": 6_123_168,
    "end": 6_123_202,
    "bytes": 34,
    "sha256": "6c056f3638f1cb318c36aa528173d5c71e9d5863829d399bafdfb054e49a340a",
    "name": "hasLib",
    "arity": 1,
    "async": false,
    "lineNumber": 1171,
    "columnNumber": 5706
  },
  "registryContext": {
    "start": 6_122_628,
    "end": 6_122_654,
    "bytes": 26,
    "sha256": "a2905ab91bc27c634dba0e470663580576713fac52ba2a186a7a20e80d44c69b",
    "name": "get context",
    "arity": 0,
    "async": false,
    "lineNumber": 1171,
    "columnNumber": 5171
  },
  "messageBus": {
    "start": 5_995_118,
    "end": 5_995_388,
    "bytes": 270,
    "sha256": "cd1a353c3981c8404b6f31346fe896b17c47abdff61215b6b6657e3474c35787",
    "name": "get messageBus",
    "arity": 0,
    "async": false,
    "lineNumber": 1169,
    "columnNumber": 21_861
  },
  "contextProducer": {
    "start": 5_428_539,
    "end": 5_428_582,
    "bytes": 43,
    "sha256": "9e5b2ec1f2768fd54c2e2e522da1b4739e8454aa81f1b11e92be86f9c1039024",
    "name": "Po",
    "arity": 0,
    "async": false,
    "lineNumber": 1084,
    "columnNumber": 469_634
  }
} as const,
});
export type CurrentFootprintCopyUiFunction = keyof typeof CURRENT_FOOTPRINT_COPY_UI_SOURCE.functions;
export const CURRENT_FOOTPRINT_COPY_UI_FUNCTION_NAMES = Object.freeze([
  "wrapper", "responder", "sourceRouter", "projectSource", "registryInstance", "registryHas", "registryContext", "messageBus", "contextProducer",
] as const);
const original = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_UI_SOURCE"); } }
function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }

export function assertCurrentFootprintCopyUiFunction(role: CurrentFootprintCopyUiFunction, source: unknown): void {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_UI_SOURCE.functions, role));
  const profile = CURRENT_FOOTPRINT_COPY_UI_SOURCE.functions[role];
  need(typeof source === "string" && source.length <= profile.bytes && source.isWellFormed() &&
    Buffer.byteLength(source) === profile.bytes && hash(source) === profile.sha256);
}

export type CurrentFootprintCopyUiSourceQualification = Readonly<{
  sourceSha256: string; functionCount: 9; runtimeBound: false; executionAuthorized: false;
}>;
export function qualifyCurrentFootprintCopyUiSource(source: unknown): CurrentFootprintCopyUiSourceQualification {
  const profile = CURRENT_FOOTPRINT_COPY_UI_SOURCE;
  need(typeof source === "string" && source.length <= profile.bytes && source.isWellFormed() &&
    Buffer.byteLength(source) === profile.bytes && hash(source) === profile.sha256);
  for (const name of CURRENT_FOOTPRINT_COPY_UI_FUNCTION_NAMES) {
    const span = profile.functions[name];
    assertCurrentFootprintCopyUiFunction(name, source.slice(span.start, span.end));
  }
  const result = Object.freeze({ sourceSha256: profile.sha256, functionCount: 9 as const, runtimeBound: false as const, executionAuthorized: false as const });
  original.add(result); return result;
}
export function requireCurrentFootprintCopyUiSource(value: unknown): void {
  need(value !== null && typeof value === "object" && original.has(value));
}
