/** Inert source and callable metadata for three original reference queries.
 * Manager callbacks swallow worker failures as []; require actual successful
 * worker completion separately before accepting any empty reference result. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";

export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_FILES = freezeDeep({
  "manager": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js",
    "bytes": 2_196_424,
    "sha256": "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d"
  },
  "worker": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/project-worker.js",
    "bytes": 2_181_308,
    "sha256": "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046"
  }
} as const);
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE = freezeDeep({
  "managerDeviceAll": {
    "file": "manager",
    "start": 1_726_830,
    "end": 1_727_014,
    "descriptionStart": 1_726_830,
    "name": "getAllArrData",
    "owner": "z0",
    "arity": 0,
    "kind": "method",
    "async": true,
    "strict": true,
    "parent": null,
    "lineNumber": 104,
    "columnNumber": 67_250,
    "bytes": 184,
    "sha256": "d2c0a0a7f765cbf80743201bf488c0c2b8db153f52947b578df410437bf98c91"
  },
  "managerFootprintKeys": {
    "file": "manager",
    "start": 1_734_143,
    "end": 1_734_330,
    "descriptionStart": 1_734_143,
    "name": "getKeysBySource",
    "owner": "V0",
    "arity": 1,
    "kind": "method",
    "async": true,
    "strict": true,
    "parent": null,
    "lineNumber": 104,
    "columnNumber": 74_565,
    "bytes": 187,
    "sha256": "a7bce135306a4885d1eb39e050393040223df4083e981e9fe632b43508b52b2f"
  },
  "managerPcbAll": {
    "file": "manager",
    "start": 1_741_030,
    "end": 1_741_211,
    "descriptionStart": 1_741_030,
    "name": "getAllArrData",
    "owner": "q0",
    "arity": 0,
    "kind": "method",
    "async": true,
    "strict": true,
    "parent": null,
    "lineNumber": 104,
    "columnNumber": 81_450,
    "bytes": 181,
    "sha256": "82e83ecc0cca74aacf316d3bc190265d771f5f36e212d770bde09802967b50f1"
  },
  "managerPcbCallback": {
    "file": "manager",
    "start": 2_064_209,
    "end": 2_064_324,
    "descriptionStart": 2_064_209,
    "name": "",
    "owner": null,
    "arity": 1,
    "kind": "arrow",
    "async": true,
    "strict": false,
    "parent": null,
    "lineNumber": 108,
    "columnNumber": 36_855,
    "bytes": 115,
    "sha256": "c673463b201a437383f79a83a3bcb19f23f83da0039abe8b23135ffefdbcbfff"
  },
  "managerFootprintCallback": {
    "file": "manager",
    "start": 2_071_026,
    "end": 2_071_153,
    "descriptionStart": 2_071_026,
    "name": "",
    "owner": null,
    "arity": 2,
    "kind": "arrow",
    "async": true,
    "strict": false,
    "parent": null,
    "lineNumber": 108,
    "columnNumber": 43_672,
    "bytes": 127,
    "sha256": "0f2b6846a2d8934aa67d13fb04c9a20e2b41185c01bbe83c20e987aa4a60859e"
  },
  "managerDeviceCallback": {
    "file": "manager",
    "start": 2_073_994,
    "end": 2_074_112,
    "descriptionStart": 2_073_994,
    "name": "",
    "owner": null,
    "arity": 1,
    "kind": "arrow",
    "async": true,
    "strict": false,
    "parent": null,
    "lineNumber": 108,
    "columnNumber": 46_640,
    "bytes": 118,
    "sha256": "fff95db2fa376183d91245f7cfc6e57e7dd2f365316b33bf21e475084f3d19f9"
  },
  "workerDeviceGetAll": {
    "file": "worker",
    "start": 1_868_046,
    "end": 1_868_115,
    "descriptionStart": 1_868_046,
    "name": "getAll",
    "owner": "Eg",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 20_739,
    "bytes": 69,
    "sha256": "2971e93eff56f0c3c326fef1f97cbdd4acbc4c2ba153e33213ab23b9de6b8894"
  },
  "workerDeviceGetAllCallback0": {
    "file": "worker",
    "start": 1_868_094,
    "end": 1_868_113,
    "descriptionStart": 1_868_094,
    "name": "",
    "owner": "Eg",
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 20_781,
    "bytes": 19,
    "sha256": "27ff90f52ccb310b16fb33b40ad1bd22dabcfb8f7a657f73107b1dc9d7d2cd91"
  },
  "workerDeviceAll": {
    "file": "worker",
    "start": 1_869_714,
    "end": 1_869_803,
    "descriptionStart": 1_869_714,
    "name": "getAllArrData",
    "owner": "Eg",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 22_414,
    "bytes": 89,
    "sha256": "5ce9582f6051bd5e1810fdaffc0921571fa6965e2c8938feff7acb5d0167aa8b"
  },
  "workerDeviceAllCallback0": {
    "file": "worker",
    "start": 1_869_784,
    "end": 1_869_800,
    "descriptionStart": 1_869_784,
    "name": "",
    "owner": "Eg",
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 22_471,
    "bytes": 16,
    "sha256": "bb324af7c687c4935022c8e90a1d6f20037f9c6f571a9c669b267d861c2c282e"
  },
  "workerFootprintVerifySource": {
    "file": "worker",
    "start": 1_880_038,
    "end": 1_880_135,
    "descriptionStart": 1_880_038,
    "name": "verifySource",
    "owner": "Tg",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 32_737,
    "bytes": 97,
    "sha256": "aecf5c7fffaab05bf2eb453c4442ad719264b7bb26271fe32826d74cb75be0e3"
  },
  "workerFootprintGetAll": {
    "file": "worker",
    "start": 1_881_480,
    "end": 1_881_549,
    "descriptionStart": 1_881_480,
    "name": "getAll",
    "owner": "Tg",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 34_173,
    "bytes": 69,
    "sha256": "2971e93eff56f0c3c326fef1f97cbdd4acbc4c2ba153e33213ab23b9de6b8894"
  },
  "workerFootprintGetAllCallback0": {
    "file": "worker",
    "start": 1_881_528,
    "end": 1_881_547,
    "descriptionStart": 1_881_528,
    "name": "",
    "owner": "Tg",
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 34_215,
    "bytes": 19,
    "sha256": "27ff90f52ccb310b16fb33b40ad1bd22dabcfb8f7a657f73107b1dc9d7d2cd91"
  },
  "workerFootprintKeys": {
    "file": "worker",
    "start": 1_883_780,
    "end": 1_883_915,
    "descriptionStart": 1_883_780,
    "name": "getKeysBySource",
    "owner": "Tg",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 36_482,
    "bytes": 135,
    "sha256": "eb7a9d455e5f42738e2820a7d04c2ccbd3e52e83d0372754a6825ec8f9038ee7"
  },
  "workerFootprintKeysCallback0": {
    "file": "worker",
    "start": 1_883_858,
    "end": 1_883_891,
    "descriptionStart": 1_883_858,
    "name": "",
    "owner": "Tg",
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 36_545,
    "bytes": 33,
    "sha256": "fc0695aa186c36d45146b85ceda188b3ae427da3e364cae2470ade72cb17d67b"
  },
  "workerPcbGetAll": {
    "file": "worker",
    "start": 1_902_759,
    "end": 1_902_828,
    "descriptionStart": 1_902_759,
    "name": "getAll",
    "owner": "Sg",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 55_452,
    "bytes": 69,
    "sha256": "2971e93eff56f0c3c326fef1f97cbdd4acbc4c2ba153e33213ab23b9de6b8894"
  },
  "workerPcbGetAllCallback0": {
    "file": "worker",
    "start": 1_902_807,
    "end": 1_902_826,
    "descriptionStart": 1_902_807,
    "name": "",
    "owner": "Sg",
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 55_494,
    "bytes": 19,
    "sha256": "27ff90f52ccb310b16fb33b40ad1bd22dabcfb8f7a657f73107b1dc9d7d2cd91"
  },
  "workerPcbAll": {
    "file": "worker",
    "start": 1_903_605,
    "end": 1_903_694,
    "descriptionStart": 1_903_605,
    "name": "getAllArrData",
    "owner": "Sg",
    "arity": 0,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 56_305,
    "bytes": 89,
    "sha256": "5ce9582f6051bd5e1810fdaffc0921571fa6965e2c8938feff7acb5d0167aa8b"
  },
  "workerPcbAllCallback0": {
    "file": "worker",
    "start": 1_903_675,
    "end": 1_903_691,
    "descriptionStart": 1_903_675,
    "name": "",
    "owner": "Sg",
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 109,
    "columnNumber": 56_362,
    "bytes": 16,
    "sha256": "bb324af7c687c4935022c8e90a1d6f20037f9c6f571a9c669b267d861c2c282e"
  },
  "workerDeviceHandler": {
    "file": "worker",
    "start": 2_150_456,
    "end": 2_150_484,
    "descriptionStart": 2_150_456,
    "name": "",
    "owner": null,
    "arity": 0,
    "kind": "arrow",
    "async": false,
    "strict": false,
    "parent": null,
    "lineNumber": 110,
    "columnNumber": 136_246,
    "bytes": 28,
    "sha256": "f3b33140d0ed291cdc18d16180754f240a701982208ca1fcb13c493bcf79c37d"
  },
  "workerFootprintHandler": {
    "file": "worker",
    "start": 2_154_487,
    "end": 2_154_520,
    "descriptionStart": 2_154_487,
    "name": "",
    "owner": null,
    "arity": 1,
    "kind": "arrow",
    "async": false,
    "strict": false,
    "parent": null,
    "lineNumber": 110,
    "columnNumber": 140_277,
    "bytes": 33,
    "sha256": "713db1223f059a758bbf6551578d93254cd79d8c24c998848f802d75948e6d7b"
  },
  "workerPcbHandler": {
    "file": "worker",
    "start": 2_158_792,
    "end": 2_158_817,
    "descriptionStart": 2_158_792,
    "name": "",
    "owner": null,
    "arity": 0,
    "kind": "arrow",
    "async": false,
    "strict": false,
    "parent": null,
    "lineNumber": 110,
    "columnNumber": 144_582,
    "bytes": 25,
    "sha256": "ec2f4f8450d738343e844802e8c55f647438d0a238e6b1d3b22e00bf4ab8dac1"
  },
  "workerFootprintSourceValid": {
    "file": "worker",
    "start": 1_372_266,
    "end": 1_372_316,
    "descriptionStart": 1_372_266,
    "name": "Hl",
    "owner": null,
    "arity": 1,
    "kind": "function",
    "async": false,
    "strict": false,
    "parent": null,
    "lineNumber": 103,
    "columnNumber": 50_446,
    "bytes": 50,
    "sha256": "06b3dd372bf7a3ad4ce82e49ce9cdb9525c7d3924142942bd003a34b485a515e"
  },
  "workerMustString": {
    "file": "worker",
    "start": 1_695_471,
    "end": 1_695_569,
    "descriptionStart": 1_695_478,
    "name": "mustString",
    "owner": "Se",
    "arity": 1,
    "kind": "method",
    "async": false,
    "strict": true,
    "parent": null,
    "lineNumber": 106,
    "columnNumber": 67_028,
    "bytes": 91,
    "sha256": "34535972a38925853c776822f10110059bd3dd620c9a3f2fb62efcd5c0cc5451"
  }
} as const);
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_LINKS = freezeDeep([
  {
    "file": "manager",
    "start": 2_064_188,
    "end": 2_064_325,
    "bytes": 137,
    "sha256": "55d5d2da101476a796e68aabc69cb38d81e508fbe44e73c536b16c35ad93ec16"
  },
  {
    "file": "manager",
    "start": 2_070_992,
    "end": 2_071_154,
    "bytes": 162,
    "sha256": "fc4b617a5aed1b9027c2e1a7f5089ede17d37edd41b289c91efd7bb00e5e8d60"
  },
  {
    "file": "manager",
    "start": 2_073_970,
    "end": 2_074_113,
    "bytes": 143,
    "sha256": "93953d0f0302ca1d4485fa266169f8a16979e3ca9e592e8e93dd395a27608505"
  },
  {
    "file": "manager",
    "start": 1_713_190,
    "end": 1_713_242,
    "bytes": 52,
    "sha256": "9fd3a04beef1f65c007baf0a3a28c9428236080daf00306fafda179b58943489"
  },
  {
    "file": "manager",
    "start": 1_706_778,
    "end": 1_706_833,
    "bytes": 55,
    "sha256": "719e6f99d51b43a13e83493ec237b28d6e4c6dd9dd4c7353074e42a9c66c7991"
  },
  {
    "file": "manager",
    "start": 1_710_908,
    "end": 1_710_970,
    "bytes": 62,
    "sha256": "b4e77b34ad9269d3944472d5035a0af77cfe2f76d673c6afe8732753fe131c63"
  },
  {
    "file": "manager",
    "start": 686_963,
    "end": 687_002,
    "bytes": 39,
    "sha256": "14e7bef6f6242bd87fe7592c288b192c14b0dc906bfbfaf3b3605bb6d10b68c3"
  },
  {
    "file": "manager",
    "start": 691_874,
    "end": 691_916,
    "bytes": 42,
    "sha256": "914dc1c88e3a1adf486c2e9c625da49ac79341190fc8b86ca0e674f435fd1413"
  },
  {
    "file": "manager",
    "start": 690_351,
    "end": 690_404,
    "bytes": 53,
    "sha256": "fd5c268bb248a14ff2c3ca4e6f2ff5927dad8868ec85bb010beb64b99f4a3cd7"
  },
  {
    "file": "worker",
    "start": 2_150_410,
    "end": 2_150_485,
    "bytes": 75,
    "sha256": "ef57665e737fa420c6b090d3e2dedbed5bfb3b1d6e79321fc2e99c2fed955285"
  },
  {
    "file": "worker",
    "start": 2_154_436,
    "end": 2_154_521,
    "bytes": 85,
    "sha256": "10b496664b227aa4414ff001e646dd8c105ced22a736ae09218b576115a4c4d0"
  },
  {
    "file": "worker",
    "start": 2_158_749,
    "end": 2_158_818,
    "bytes": 69,
    "sha256": "c113fd3043cb8bc53fb58d3918258cc0605792bdc55c54be5f410b007488cb66"
  },
  {
    "file": "worker",
    "start": 1_667_040,
    "end": 1_667_092,
    "bytes": 52,
    "sha256": "9fd3a04beef1f65c007baf0a3a28c9428236080daf00306fafda179b58943489"
  },
  {
    "file": "worker",
    "start": 1_660_628,
    "end": 1_660_683,
    "bytes": 55,
    "sha256": "719e6f99d51b43a13e83493ec237b28d6e4c6dd9dd4c7353074e42a9c66c7991"
  },
  {
    "file": "worker",
    "start": 1_664_758,
    "end": 1_664_820,
    "bytes": 62,
    "sha256": "b4e77b34ad9269d3944472d5035a0af77cfe2f76d673c6afe8732753fe131c63"
  },
  {
    "file": "worker",
    "start": 1_378_946,
    "end": 1_378_985,
    "bytes": 39,
    "sha256": "14e7bef6f6242bd87fe7592c288b192c14b0dc906bfbfaf3b3605bb6d10b68c3"
  },
  {
    "file": "worker",
    "start": 1_383_857,
    "end": 1_383_899,
    "bytes": 42,
    "sha256": "914dc1c88e3a1adf486c2e9c625da49ac79341190fc8b86ca0e674f435fd1413"
  },
  {
    "file": "worker",
    "start": 1_382_334,
    "end": 1_382_387,
    "bytes": 53,
    "sha256": "fd5c268bb248a14ff2c3ca4e6f2ff5927dad8868ec85bb010beb64b99f4a3cd7"
  },
  {
    "file": "worker",
    "start": 1_370_431,
    "end": 1_370_453,
    "bytes": 22,
    "sha256": "9d6217d54d0b2f4c341997c579dbbcf766b9d82cc0d7216650482b86c3744542"
  }
] as const);
export type CurrentFootprintInverseReferenceQueryRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE;
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_REFERENCE_QUERY_SOURCE"); } }
export function requireCurrentFootprintInverseReferenceQueryDescription(text: string, role: CurrentFootprintInverseReferenceQueryRole): void {
  const row = CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE[role]; need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256);
}
export function qualifyCurrentFootprintInverseReferenceQuerySource(source: string, file: keyof typeof CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_FILES): void {
  const pin = CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_FILES[file]; need(Buffer.byteLength(source) === pin.bytes && createHash("sha256").update(source).digest("hex") === pin.sha256);
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE)) { if (row.file === file) { const text = source.slice(row.descriptionStart, row.end); need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256); } }
  for (const row of CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_LINKS) { if (row.file === file) { const text = source.slice(row.start, row.end); need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256); } }
}
/** Actual source metadata only, with no request/result or continuation token. */
export function qualifyCurrentFootprintInverseReferenceQueryFunction(input: unknown, role: CurrentFootprintInverseReferenceQueryRole, scriptId: string): string {
  return qualifyCurrentFootprintSourceFunctionMetadata(input, CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE[role], scriptId);
}
