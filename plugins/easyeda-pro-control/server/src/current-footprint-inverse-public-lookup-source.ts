/** Exact supplied UI project lookup and row formatters. This table does not
 * admit a library registry, SDK continuation, live row or delete. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintInversePublicRowSource } from "./current-footprint-inverse-public-row-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_SOURCE = freezeDeep({
  "facadeGet": {
    "name": "getFootprint",
    "arity": 1,
    "kind": "method",
    "strict": true,
    "async": false,
    "static": true,
    "start": 6_242_555,
    "descriptionStart": 6_242_562,
    "end": 6_242_686,
    "bytes": 124,
    "sha256": "dac9c7fa3678ef7e5dd333a459e4d3acb19f4e915385d1b78c70263dee05ef4a",
    "lineNumber": 1171,
    "columnNumber": 125_106
  },
  "projectGet": {
    "name": "getFootprint",
    "arity": 1,
    "kind": "method",
    "strict": true,
    "async": true,
    "static": false,
    "start": 6_230_498,
    "descriptionStart": 6_230_498,
    "end": 6_230_699,
    "bytes": 201,
    "sha256": "751bdec5a794eb09a1ed2ef35a3dec7404c651e365f8f2a9dac03293761e3bc2",
    "lineNumber": 1171,
    "columnNumber": 113_048
  },
  "lookup": {
    "name": "tw",
    "arity": 3,
    "kind": "regular",
    "strict": false,
    "async": true,
    "static": false,
    "start": 10_248_133,
    "descriptionStart": 10_248_133,
    "end": 10_248_335,
    "bytes": 202,
    "sha256": "698d13cb83610e63b910998060fd85a11db120c9ecd7ab9d688df6c66bf2b4f3",
    "lineNumber": 1326,
    "columnNumber": 1619
  },
  "rowFormat": {
    "name": "tgt",
    "arity": 2,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_146_304,
    "descriptionStart": 6_146_304,
    "end": 6_146_402,
    "bytes": 98,
    "sha256": "a5bddc7e2acb8754a0e4d152afa38757ef9133c8d85995eb021f040c0f17068f",
    "lineNumber": 1171,
    "columnNumber": 28_848
  },
  "rowBase": {
    "name": "iai",
    "arity": 2,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_145_841,
    "descriptionStart": 6_145_841,
    "end": 6_146_121,
    "bytes": 280,
    "sha256": "1da86b17410df73e82ec42687a86a23927b7cab55d6e74decbaceee85ec122fb",
    "lineNumber": 1171,
    "columnNumber": 28_385
  },
  "time": {
    "name": "am",
    "arity": 1,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_000_239,
    "descriptionStart": 6_000_239,
    "end": 6_000_339,
    "bytes": 100,
    "sha256": "0b0674b7e5867393961073c48413cbb299e0f281d8cb81be440e778a092623c7",
    "lineNumber": 1169,
    "columnNumber": 26_979
  },
  "path": {
    "name": "Eue",
    "arity": 1,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_000_339,
    "descriptionStart": 6_000_339,
    "end": 6_000_426,
    "bytes": 87,
    "sha256": "9afed988f2c07db8a9d4442645c2daea044745ad0d53692fde2443c8217a9152",
    "lineNumber": 1169,
    "columnNumber": 27_080
  },
  "creator": {
    "name": "Oue",
    "arity": 1,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_144_451,
    "descriptionStart": 6_144_451,
    "end": 6_144_533,
    "bytes": 82,
    "sha256": "eff29c9f3c771a6b15fa232f1a26f236ddf4f59cbb5e3ad14dee5c9a23643564",
    "lineNumber": 1171,
    "columnNumber": 26_995
  },
  "modifier": {
    "name": "Rue",
    "arity": 1,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_144_584,
    "descriptionStart": 6_144_584,
    "end": 6_144_666,
    "bytes": 82,
    "sha256": "f60e87d7b319a688d3fd93d0ef7877ae73184d1e1b87fdf3b5396b8c9a60bf78",
    "lineNumber": 1171,
    "columnNumber": 27_128
  },
  "owner": {
    "name": "_ue",
    "arity": 1,
    "kind": "regular",
    "strict": false,
    "async": false,
    "static": false,
    "start": 6_144_666,
    "descriptionStart": 6_144_666,
    "end": 6_144_748,
    "bytes": 82,
    "sha256": "43a408f6962bedd66071de9fd3f53d67e4d7c904e941a5ca9c9aa4926d4293dc",
    "lineNumber": 1171,
    "columnNumber": 27_210
  }
} as const);
export type CurrentFootprintInversePublicLookupRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_SOURCE;
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_ROLES = Object.freeze(["facadeGet", "projectGet", "lookup", "rowFormat", "rowBase", "time", "path", "creator", "modifier", "owner"] as const);
export function qualifyCurrentFootprintInversePublicLookupSource(source: string): void {
  qualifyCurrentFootprintInversePublicRowSource("ui", source);
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_SOURCE)) {
    const body = source.slice(row.descriptionStart, row.end);
    if (Buffer.byteLength(body) !== row.bytes || createHash("sha256").update(body).digest("hex") !== row.sha256) { throw new Error("INVERSE_PUBLIC_LOOKUP_SOURCE"); }
  }
}
