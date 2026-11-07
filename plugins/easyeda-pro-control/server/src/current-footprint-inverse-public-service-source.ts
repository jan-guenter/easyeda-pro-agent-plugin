/** Exact original SDK service and UI collateral callees. These pins issue no
 * SDK call, native delete, selected SQL or collateral-completion authority. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintInversePublicDeleteSource } from "./current-footprint-inverse-public-delete-source.ts";
import type { CurrentFootprintInversePublicDeleteFile } from "./current-footprint-inverse-public-delete-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE = freezeDeep({
  "rpcServiceCallback": {
    "file": "api",
    "start": 138_284,
    "end": 138_596,
    "lineNumber": 1,
    "columnNumber": 99_812,
    "arity": 1,
    "async": false,
    "kind": "arrow",
    "strict": true,
    "name": "i",
    "bytes": 312,
    "sha256": "ac5270a11068ef1a202639a10d99c633778c5d43c996dc373e717a03e702a2da"
  },
  "publicUiDelete": {
    "file": "ui",
    "start": 17_389_039,
    "end": 17_389_293,
    "descriptionStart": 17_389_046,
    "lineNumber": 2657,
    "columnNumber": 140_826,
    "arity": 1,
    "async": true,
    "kind": "method",
    "strict": true,
    "name": "delete",
    "bytes": 247,
    "sha256": "7e16121723ee285a656d7aac4127ae11d910d376cfdba9b08fe86e6543b573a1"
  },
  "projectDelete": {
    "file": "ui",
    "start": 6_232_612,
    "end": 6_232_763,
    "descriptionStart": 6_232_612,
    "lineNumber": 1171,
    "columnNumber": 115_165,
    "arity": 1,
    "async": true,
    "kind": "method",
    "strict": true,
    "name": "deleteFootprint",
    "bytes": 151,
    "sha256": "89cd7f7d9275e6c35d90b164e95275a8ec9095ea1d1469a37deef2f8c8fa49b4"
  },
  "facadeDelete": {
    "file": "ui",
    "start": 6_246_284,
    "end": 6_246_379,
    "descriptionStart": 6_246_291,
    "lineNumber": 1171,
    "columnNumber": 128_844,
    "arity": 1,
    "async": true,
    "kind": "method",
    "strict": true,
    "name": "deleteFootprint",
    "bytes": 88,
    "sha256": "6c4ef010077d0ba177d56381ac11912d79af998fb086bc4916019424431baf79"
  },
  "lookup": {
    "file": "ui",
    "start": 10_248_133,
    "end": 10_248_335,
    "descriptionStart": 10_248_133,
    "lineNumber": 1326,
    "columnNumber": 1602,
    "arity": 3,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "tw",
    "bytes": 202,
    "sha256": "698d13cb83610e63b910998060fd85a11db120c9ecd7ab9d688df6c66bf2b4f3"
  },
  "projectPath": {
    "file": "ui",
    "start": 15_250_856,
    "end": 15_250_955,
    "descriptionStart": 15_250_856,
    "lineNumber": 1923,
    "columnNumber": 73_637,
    "arity": 1,
    "async": false,
    "kind": "regular",
    "strict": false,
    "name": "k1",
    "bytes": 99,
    "sha256": "fa5a2443ad710180fa01784bb8cf827a290607623d9c55370897a93fca945f4e"
  },
  "deleteHelper": {
    "file": "ui",
    "start": 15_337_556,
    "end": 15_342_578,
    "descriptionStart": 15_337_556,
    "lineNumber": 1933,
    "columnNumber": 28_650,
    "arity": 3,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "yw",
    "bytes": 5022,
    "sha256": "b3b1f5a74b0ba92b348c19c6dece16c9c27953fece1478f76452884937a20c7e"
  },
  "pcbReferences": {
    "file": "ui",
    "start": 15_335_255,
    "end": 15_336_575,
    "descriptionStart": 15_335_255,
    "lineNumber": 1933,
    "columnNumber": 26_349,
    "arity": 3,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "Brr",
    "bytes": 1320,
    "sha256": "d91f6d44ec36ee1957340134fe8a895bc5406e13b580dc1bede78fde6389fd41"
  },
  "referenceLabels": {
    "file": "ui",
    "start": 15_336_575,
    "end": 15_336_846,
    "descriptionStart": 15_336_575,
    "lineNumber": 1933,
    "columnNumber": 27_669,
    "arity": 3,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "L6e",
    "bytes": 271,
    "sha256": "4fc87bc80841fd66e5370ea8573f797a62ae51078d0e4a1d1e83bb18a36c3557"
  },
  "schematicReferences": {
    "file": "ui",
    "start": 15_336_846,
    "end": 15_337_277,
    "descriptionStart": 15_336_846,
    "lineNumber": 1933,
    "columnNumber": 27_940,
    "arity": 2,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "v6e",
    "bytes": 431,
    "sha256": "70e6271475b98b99da74a1bb38f96631a848d3a28335d651244a02d1d8470105"
  },
  "derivedReferences": {
    "file": "ui",
    "start": 15_334_707,
    "end": 15_335_255,
    "descriptionStart": 15_334_707,
    "lineNumber": 1933,
    "columnNumber": 25_801,
    "arity": 1,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "Wkt",
    "bytes": 548,
    "sha256": "799b1d595001395e3737088907a8dac997fe1f4ed3cf0af4c1ddbe460563ecc3"
  },
  "deviceReferences": {
    "file": "ui",
    "start": 15_337_277,
    "end": 15_337_556,
    "descriptionStart": 15_337_277,
    "lineNumber": 1933,
    "columnNumber": 28_371,
    "arity": 1,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "Qkt",
    "bytes": 279,
    "sha256": "5ee6c2d95a65a2848fbf7a2380a0b69580395aa37d2accb8a145dea9f82f319d"
  },
  "componentLog": {
    "file": "ui",
    "start": 9_970_757,
    "end": 9_970_909,
    "descriptionStart": 9_970_757,
    "lineNumber": 1321,
    "columnNumber": 124_693,
    "arity": 4,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "P4",
    "bytes": 152,
    "sha256": "1c87f06a152172b0a8f1794bfe972457fe04c64d696b85fe4305f0693dc47c2f"
  },
  "componentLogDispatch": {
    "file": "ui",
    "start": 9_970_372,
    "end": 9_970_757,
    "descriptionStart": 9_970_372,
    "lineNumber": 1321,
    "columnNumber": 124_308,
    "arity": 2,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "Ja",
    "bytes": 385,
    "sha256": "eb65a0c21e9c30cd6c51292816e1dd1501b14aa32c31ca0afa52d0eca4680046"
  },
  "closeTargetTab": {
    "file": "ui",
    "start": 15_962_395,
    "end": 15_963_979,
    "descriptionStart": 15_962_395,
    "lineNumber": 1954,
    "columnNumber": 68_797,
    "arity": 1,
    "async": true,
    "kind": "regular",
    "strict": false,
    "name": "yy",
    "bytes": 1584,
    "sha256": "97a5f768c17a89b300453cd5f66218a91ebb4d6a22942a21f027d353680c351d"
  },
  "tabId": {
    "file": "ui",
    "start": 15_989_248,
    "end": 15_989_330,
    "descriptionStart": 15_989_248,
    "lineNumber": 1954,
    "columnNumber": 95_650,
    "arity": 1,
    "async": false,
    "kind": "regular",
    "strict": false,
    "name": "co",
    "bytes": 82,
    "sha256": "696779360f10a29e41acd9e252794940cc51c49584899a4709d32c8dc5d45f80"
  },
  "sourcePath": {
    "file": "ui",
    "start": 15_989_479,
    "end": 15_989_578,
    "descriptionStart": 15_989_479,
    "lineNumber": 1954,
    "columnNumber": 95_881,
    "arity": 1,
    "async": false,
    "kind": "regular",
    "strict": false,
    "name": "dn",
    "bytes": 99,
    "sha256": "ffbf8faff72bf4b1f34c92d826a039b84d181f41d38dc52b2051763f5baba068"
  }
} as const);
export type CurrentFootprintInversePublicServiceRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE;
export function qualifyCurrentFootprintInversePublicServiceSource(file: CurrentFootprintInversePublicDeleteFile, source: string): void {
  qualifyCurrentFootprintInversePublicDeleteSource(file, source);
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE)) {
    if (row.file === file) {
      const start = "descriptionStart" in row ? row.descriptionStart : row.start, text = source.slice(start, row.end);
      if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE"); }
    }
  }
}
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SCOPE = Object.freeze({ originalServiceReceiverVerified: false, originalSdkCallIssued: false,
  originalNativeDeleteCompleted: false, collateralEffectsCompleted: false, executionAuthorized: false } as const);
