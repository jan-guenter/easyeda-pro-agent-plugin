/** Fixed209 raw manager roles for the empty-root membership reader. Every
 * class body matches the reviewed206 role after lexical renaming. Full source
 * and exact alias/owner spans remain mandatory; this is no runtime admission. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_COMMON_SOURCE_PROFILE } from "./current-pcb-209-common-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_EMPTY_ROOT_ALIASES = freezeDeep({
  "x": "x",
  "vn": "vn",
  "Jn": "Jn",
  "Dn": "Dn",
  "Xi": "qi",
  "ol": "nl",
  "nn": "nn",
  "bo": "bo",
  "_a": "_a",
  "Aa": "Aa",
  "GR": "UR",
  "Ms": "Ls",
  "Fi": "Vi",
  "oa": "sa",
  "c0": "c0",
  "Yo": "Yo",
  "zo": "zo",
  "Mp": "Mp",
  "_s": "As",
  "ai": "ai",
  "tV": "iV",
  "Md": "Nd",
  "F0": "V0",
  "NI": "BI",
  "iy": "iy"
} as const);
export const CURRENT_PCB_209_EMPTY_ROOT_SOURCE_SPANS = freezeDeep({
  "x": {
    "start": 3_215_256,
    "end": 3_224_143,
    "bytes": 8887,
    "sha256": "26dd20cc2d772ac14590bf620f5a8b97b4d3e9ec4c08be191c0eb6e5954cd2b6"
  },
  "xBinding": {
    "start": 3_224_160,
    "end": 3_224_164,
    "bytes": 4,
    "sha256": "224ae72fea7113a8b5fb08a5c2b9853507efa127c23ebe901df6a3c3a2d141fe"
  },
  "vn": {
    "start": 4_079_606,
    "end": 4_080_122,
    "bytes": 516,
    "sha256": "7c810c4e3858485d49f4ccbf2f9a748ef4836ffb3427fd9af7a4db29ca82ada4"
  },
  "vnBinding": {
    "start": 4_080_143,
    "end": 4_080_148,
    "bytes": 5,
    "sha256": "67f85cd69d64052304db9a9fe18d00b515cbff396f32d4334cf63d70b2d052db"
  },
  "Jn": {
    "start": 4_171_777,
    "end": 4_172_136,
    "bytes": 359,
    "sha256": "4f537d30c436df4fa923ba44b4527cb1ef76bee9b29de621f3abde61d4983a95"
  },
  "JnBinding": {
    "start": 4_172_157,
    "end": 4_172_162,
    "bytes": 5,
    "sha256": "ffa6a29a529a18ea955941f76fefa5114c1ba3a9c610df1e6102d5b8d3525e52"
  },
  "Dn": {
    "start": 4_166_673,
    "end": 4_166_995,
    "bytes": 322,
    "sha256": "f3555158b12a4860a79d47fc2819128ed5fe93791e5e701d501d509721642d55"
  },
  "DnBinding": {
    "start": 4_167_016,
    "end": 4_167_021,
    "bytes": 5,
    "sha256": "d3cc6db960c1597068f42c8c82cc248ba0952faed139cdf1cae4d05d47dcb150"
  },
  "Xi": {
    "start": 3_952_999,
    "end": 3_953_323,
    "bytes": 324,
    "sha256": "ee1adcbb3bf83ec50d38d57e747b582468d041c9c1043bd760ea356c2521167e"
  },
  "XiBinding": {
    "start": 3_953_344,
    "end": 3_953_349,
    "bytes": 5,
    "sha256": "ef8d1c5b896d7d42ea3a7694da8a5509139836ec960502cc17e03ce95a4b8caa"
  },
  "ol": {
    "start": 4_216_127,
    "end": 4_216_497,
    "bytes": 370,
    "sha256": "aaf7b41b9682f30ebea9976bd3bf2bd12dfe4c057ffc7c3a553fe4cbaa41a80a"
  },
  "olBinding": {
    "start": 4_216_518,
    "end": 4_216_523,
    "bytes": 5,
    "sha256": "e44129672e491fccad18b7d0580c6d03dc26ed5c603d4d8c559751ee33c8c3e1"
  },
  "nn": {
    "start": 4_099_076,
    "end": 4_099_404,
    "bytes": 328,
    "sha256": "f1caf6044e9f776d2afc7e2b27305eb6e4af73e04ffcd799435a76d76e548201"
  },
  "nnBinding": {
    "start": 4_099_425,
    "end": 4_099_430,
    "bytes": 5,
    "sha256": "3d619ea8976b13876a404928b9eb1f3cc281642dfc4af8f1343ad732cb80c952"
  },
  "bo": {
    "start": 3_990_627,
    "end": 3_991_091,
    "bytes": 464,
    "sha256": "710a02fcf2c569eced56cdd00c4bf86e643b5861d2788b56d9e8166502d38018"
  },
  "boBinding": {
    "start": 3_991_112,
    "end": 3_991_117,
    "bytes": 5,
    "sha256": "fbddafc3208d72af72bcb5c7c3afd1548eebac0389d81e9a5f29a46c1946c249"
  },
  "_a": {
    "start": 4_211_635,
    "end": 4_212_082,
    "bytes": 447,
    "sha256": "6d400c6c6f60658064862a4ca46f2470334cc8d27a3630a25b08a1f903fe8792"
  },
  "_aBinding": {
    "start": 4_212_103,
    "end": 4_212_108,
    "bytes": 5,
    "sha256": "0408b9cf8c9f781448ef1ae7f70173247391a41d0dfc92d2ed47d50a77adec5f"
  },
  "Aa": {
    "start": 4_205_681,
    "end": 4_206_018,
    "bytes": 337,
    "sha256": "85cccf7a5c53edff6c67ed14312be8aa9c3af7149bc82c5677513a7e57b8515f"
  },
  "AaBinding": {
    "start": 4_206_039,
    "end": 4_206_044,
    "bytes": 5,
    "sha256": "49f71e78f68b45f24b72428edc08c8b36d481523a29604bfc43aae9b8d0fc831"
  },
  "GR": {
    "start": 4_336_395,
    "end": 4_336_677,
    "bytes": 282,
    "sha256": "cbd04fe16006194b391412d7afef6a0f5f3399bd44905699242d9c1df99df09d"
  },
  "GRBinding": {
    "start": 4_336_698,
    "end": 4_336_703,
    "bytes": 5,
    "sha256": "16ff32ca35bcdc5ce74ca3417f410739f94d1a364d1ad49a784a0a5d1d96d3cf"
  },
  "Ms": {
    "start": 4_331_484,
    "end": 4_331_793,
    "bytes": 309,
    "sha256": "f79900ee274370424a472f802b7ebd0fbf8c1e57347e4c3b74d0d9a0d139e594"
  },
  "MsBinding": {
    "start": 4_331_814,
    "end": 4_331_819,
    "bytes": 5,
    "sha256": "0da8e7e918e1ad38538abe427373a0df4d17cd65f6a3219a3f99c9a64894bea6"
  },
  "Fi": {
    "start": 4_112_444,
    "end": 4_112_761,
    "bytes": 317,
    "sha256": "a67dbbbe8b864fb6083a7412a8fbdf7ff2f8ceaa3db3c0bad9ba5f7c757a5b27"
  },
  "FiBinding": {
    "start": 4_112_782,
    "end": 4_112_787,
    "bytes": 5,
    "sha256": "adb84bc9fda083560d0b4bad82bf0b24cc5b8a75014aceb95f50c33f06375108"
  },
  "oa": {
    "start": 4_150_998,
    "end": 4_151_293,
    "bytes": 295,
    "sha256": "afaa3bb2c36c395e8992218b02b31b11c588370b30e38a6cd480cf08baf53480"
  },
  "oaBinding": {
    "start": 4_151_314,
    "end": 4_151_319,
    "bytes": 5,
    "sha256": "ab1380e83cde59c90a2750ff670e47d38644597573d62763d02e4a7379279ed7"
  },
  "c0": {
    "start": 4_239_300,
    "end": 4_239_608,
    "bytes": 308,
    "sha256": "fad58983468c1cb8aae2176c4f18775ec538a64515f17cf25e4e21407b38a67e"
  },
  "c0Binding": {
    "start": 4_239_629,
    "end": 4_239_634,
    "bytes": 5,
    "sha256": "3f3329d6c020aaa81bf0e5f861732d0559f9582cb6da4628560087ce3e8168d9"
  },
  "Yo": {
    "start": 4_144_752,
    "end": 4_145_161,
    "bytes": 409,
    "sha256": "18d4e72e3ccd1660f84d377825c70287adbdb0e52f40ea4c9a8176db91d140f3"
  },
  "YoBinding": {
    "start": 4_145_182,
    "end": 4_145_187,
    "bytes": 5,
    "sha256": "946d91e9a53d7802e1c2332a049e6d10f24b0c8b31e249a03a22832ed267fdb6"
  },
  "zo": {
    "start": 4_133_213,
    "end": 4_133_700,
    "bytes": 487,
    "sha256": "a1b39f53b0a657e1a2db4f5794ac58ce4724ec81461998a14904fe441e98509a"
  },
  "zoBinding": {
    "start": 4_133_721,
    "end": 4_133_726,
    "bytes": 5,
    "sha256": "5f134a5017db670fd927949bb472219ed7616701232dc11085bb06da5c1a38c2"
  },
  "Mp": {
    "start": 4_158_295,
    "end": 4_160_187,
    "bytes": 1892,
    "sha256": "61bd81df4b9ae468741e038d2f9ecf64f80f9f31f8860822e604f1093d66f71d"
  },
  "MpBinding": {
    "start": 4_160_208,
    "end": 4_160_213,
    "bytes": 5,
    "sha256": "27188c1eca768d9839880ec67b48694258e2e32119acb8300f55e7bd0b51b73d"
  },
  "_s": {
    "start": 4_634_524,
    "end": 4_635_640,
    "bytes": 1116,
    "sha256": "a6c4bf336989eee90e49df14f7a56764406ab0644bd3a710f35ed81a43ee13ed"
  },
  "_sBinding": {
    "start": 4_635_672,
    "end": 4_635_677,
    "bytes": 5,
    "sha256": "626822daf849be5a5158fa3ffcaf5ed8ad408163e76f8b75daaa95ec65e26993"
  },
  "ai": {
    "start": 4_758_659,
    "end": 4_765_928,
    "bytes": 7269,
    "sha256": "9344ad9acc6f78ec1799097cff83f98d21693944ea83be4bdd63541d6ac975d2"
  },
  "tV": {
    "start": 5_045_454,
    "end": 5_049_460,
    "bytes": 4006,
    "sha256": "a11ef434381f6053fa51b71ee69420dbea6d688b42f2553e6d72f5ec1ac9fe0c"
  },
  "Md": {
    "start": 3_936_703,
    "end": 3_940_211,
    "bytes": 3508,
    "sha256": "8d716cff7cde6ec163ac6d99a0dd3d4230b6fe793a06e2c600f89fdc888cde89"
  },
  "F0": {
    "start": 5_042_200,
    "end": 5_045_446,
    "bytes": 3246,
    "sha256": "9c572f50c6c6c87f3e87a4ad47b67b26989aa35abceba2c931b148d61b5cd1de"
  },
  "NI": {
    "start": 3_934_360,
    "end": 3_936_684,
    "bytes": 2324,
    "sha256": "33666e26347f589023790a9ee0be4e827a25297c344586f92906bd95c102d080"
  },
  "iy": {
    "start": 5_039_407,
    "end": 5_042_181,
    "bytes": 2774,
    "sha256": "07a1e465f6f9d469fc13a1b3307561a3df7b105ede2ba854e585bb75537a178b"
  },
  "spatialOwner": {
    "start": 10_806_803,
    "end": 10_806_827,
    "bytes": 24,
    "sha256": "98b3ed0a892e94400ddf8ee36faee53f2ebe74abfba1f53e18b807f69cfec43c"
  }
} as const);
function hash(text: string): string { return createHash("sha256").update(text).digest("hex"); }
/** Offsets are UTF16 source coordinates. All data is fixed by this module. */
export function inspectCurrentPcb209EmptyRootSource(input: unknown): Readonly<{
  sourceProfileMatches: boolean; compatibilityAdmitted: false; executionAuthorized: false;
}> {
  if (typeof input !== "string" || !input.isWellFormed() || input.length > 12 * 1024 * 1024) {
    throw new Error("PCB209_EMPTY_ROOT_SOURCE_INPUT");
  }
  const profile = CURRENT_PCB_209_COMMON_SOURCE_PROFILE;
  const sourceProfileMatches = Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256 &&
    Object.values(CURRENT_PCB_209_EMPTY_ROOT_SOURCE_SPANS).every(value => {
      const part = input.slice(value.start, value.end);
      return Buffer.byteLength(part) === value.bytes && hash(part) === value.sha256;
    });
  return Object.freeze({ sourceProfileMatches, compatibilityAdmitted: false, executionAuthorized: false });
}
