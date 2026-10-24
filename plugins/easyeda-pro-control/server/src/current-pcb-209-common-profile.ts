/** Fixed209 lexical bindings. Graph class labels remain stable semantic roles
 * from the pure common encoder; they are never native constructor names.
 * Every binding was compared against exact217199c8 and a8405930 source.
 * Source qualification alone grants no live ownership or baseline authority. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_COMMON_ALIASES = freezeDeep({
  "S": "E",
  "ee": "ee",
  "Ke": "Ke",
  "WA": "WA",
  "Ff": "Ff",
  "HA": "HA",
  "te": "te",
  "Wre": "jre",
  "xI": "DI",
  "fj": "bj",
  "Ky": "Ky",
  "nC": "oC",
  "cR": "hR",
  "E8": "A8",
  "i2": "s2",
  "tR": "rR",
  "rR": "iR",
  "Jx": "Qx",
  "Yre": "qre",
  "zre": "Xre",
  "aR": "lR",
  "eR": "tR",
  "O8": "_8",
  "Qx": "eR",
  "KCe": "tSe",
  "lR": "cR",
  "sR": "aR",
  "hR": "uR",
  "zi": "zi",
  "Ll": "wl",
  "x": "x",
  "Zu": "Zu",
  "A8e": "N8e",
  "sCe": "uCe",
  "mCe": "ICe",
  "At": "At",
  "ogt": "mgt",
  "ai": "ai",
  "vfe": "Dfe",
  "nr": "nr",
  "pl": "dl",
  "ha": "ua",
  "nb": "nb",
  "H8": "z8",
  "Am": "Am",
  "z8": "j8"
} as const);
export const CURRENT_PCB_209_COMMON_CONSTRUCTORS = freezeDeep({
  "Yme": {
    "name": "qme",
    "owner": "Me",
    "prototypeClassName": "Object",
    "lineNumber": 91_819,
    "columnNumber": 19_324,
    "classStart": 10_165_868,
    "classEnd": 10_177_266,
    "constructorOffset": 10_165_885,
    "parameterCount": 0,
    "staticFields": {},
    "sourceBytes": 11_398,
    "sourceSha256": "ae376881e659e607737793ebcf881c014ac5cc0b9f4e8e57c604f6df6a8d3de0"
  },
  "Nfe": {
    "name": "Ffe",
    "owner": "ce",
    "prototypeClassName": "Object",
    "lineNumber": 4630,
    "columnNumber": 120_360,
    "classStart": 9_198_384,
    "classEnd": 9_212_069,
    "constructorOffset": 9_198_401,
    "parameterCount": 0,
    "staticFields": {},
    "sourceBytes": 13_685,
    "sourceSha256": "3712591cce4ce3e392e81aad5ecf7d73a47e54d7e42b4b77451c68d200fcaa03"
  },
  "Epe": {
    "name": "xpe",
    "owner": "rt",
    "prototypeClassName": "Object",
    "lineNumber": 4627,
    "columnNumber": 621_157,
    "classStart": 8_234_967,
    "classEnd": 8_242_912,
    "constructorOffset": 8_234_984,
    "parameterCount": 0,
    "staticFields": {},
    "sourceBytes": 7945,
    "sourceSha256": "99ce6a5486a3dd12d8e998c91a928946202faafb83bc8180eeb690973eebc809"
  },
  "GSe": {
    "name": "YSe",
    "owner": "id",
    "prototypeClassName": "Ni",
    "lineNumber": 3641,
    "columnNumber": 388_076,
    "classStart": 4_245_926,
    "classEnd": 4_246_034,
    "constructorOffset": 4_245_926,
    "parameterCount": 0,
    "staticFields": {},
    "sourceBytes": 108,
    "sourceSha256": "5bc210400f4fc53337853ca9977cbfe9a541a31a7a6ade70647cc8eb652ff98b"
  }
} as const);
export type CurrentPcb209CommonConstructor = keyof typeof CURRENT_PCB_209_COMMON_CONSTRUCTORS;
export const CURRENT_PCB_209_COMMON_SOURCE_PROFILE = freezeDeep({
  relativePath: "pro-pcb/3.2.195.6b67774e/js/pcb.js", bytes: 10_991_441,
  sha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b",
  spans: {
  "Yme": {
    "start": 10_165_868,
    "end": 10_177_266,
    "bytes": 11_398,
    "sha256": "ae376881e659e607737793ebcf881c014ac5cc0b9f4e8e57c604f6df6a8d3de0"
  },
  "Nfe": {
    "start": 9_198_384,
    "end": 9_212_069,
    "bytes": 13_685,
    "sha256": "3712591cce4ce3e392e81aad5ecf7d73a47e54d7e42b4b77451c68d200fcaa03"
  },
  "Epe": {
    "start": 8_234_967,
    "end": 8_242_912,
    "bytes": 7945,
    "sha256": "99ce6a5486a3dd12d8e998c91a928946202faafb83bc8180eeb690973eebc809"
  },
  "GSe": {
    "start": 4_245_926,
    "end": 4_246_034,
    "bytes": 108,
    "sha256": "5bc210400f4fc53337853ca9977cbfe9a541a31a7a6ade70647cc8eb652ff98b"
  },
  "S": {
    "start": 1_060_383,
    "end": 1_065_283,
    "bytes": 4900,
    "sha256": "ec79086b1715bc7e8f5e991f75e7c8722d1014686eae303841998f304a952e83"
  },
  "ee": {
    "start": 1_451_412,
    "end": 1_454_595,
    "bytes": 3183,
    "sha256": "71e29f73121675acb116cbd8dcdb61130be6fb3023a3b054a503056d2b76832a"
  },
  "Ke": {
    "start": 3_185_624,
    "end": 3_188_613,
    "bytes": 2989,
    "sha256": "6a09526341435320a3f08b8efc871098895fb4d74fe6a2f9d5e3ac714fbdb6a9"
  },
  "WA": {
    "start": 3_174_783,
    "end": 3_175_501,
    "bytes": 718,
    "sha256": "c5a688dd3db336747c36410516b4e1eca9d54157639bd857430f1c12b3b1ec65"
  },
  "Ff": {
    "start": 3_174_442,
    "end": 3_174_775,
    "bytes": 333,
    "sha256": "7cf276708c944cb8ccf89773c52e88e5d6a228604e966ba4fd782c64f7d418c2"
  },
  "HA": {
    "start": 3_173_347,
    "end": 3_174_257,
    "bytes": 910,
    "sha256": "d0b2c6686c8f8954e8759058019e53d803c5ef2928f85cc52a23e859f67884d0"
  },
  "te": {
    "start": 3_477_411,
    "end": 3_512_385,
    "bytes": 34_974,
    "sha256": "12a7fb9d04e82d73016c4f403ad4f5954512e7dd266eb168f71124dfecb6bb05"
  },
  "Wre": {
    "start": 3_440_235,
    "end": 3_442_273,
    "bytes": 2038,
    "sha256": "6a933dd960c057428e63addfcca598a69600bfe74a024c04c58d260dc3c202de"
  },
  "xI": {
    "start": 3_467_835,
    "end": 3_470_580,
    "bytes": 2745,
    "sha256": "09fccb974a4fde83552ff965b2ae794f0c88ab12ef44372337364f8cd48746a4"
  },
  "fj": {
    "start": 3_466_744,
    "end": 3_467_808,
    "bytes": 1064,
    "sha256": "14a8679aee1694a0c8f6dac2b918876e05f09a911bc8c26f5199b337c9c70e15"
  },
  "Ky": {
    "start": 3_461_678,
    "end": 3_462_295,
    "bytes": 617,
    "sha256": "709b13d418668084b897867905248d098a4ae8f106997f0715c3ba3a2ed85dd1"
  },
  "nC": {
    "start": 3_476_896,
    "end": 3_477_352,
    "bytes": 456,
    "sha256": "122e39a1075cdd7bbd6f3b50a621358e3fcb973ec88a0deef5e618494de6123e"
  },
  "cR": {
    "start": 3_471_797,
    "end": 3_472_895,
    "bytes": 1098,
    "sha256": "2743848dd8f23240a59d233d9c4b3dde1e3f87d9b9ca4049ed9a9403df8bb90c"
  },
  "E8": {
    "start": 3_444_480,
    "end": 3_444_991,
    "bytes": 511,
    "sha256": "fbcf844a6143b11fa465479057a9a5348af9d29ab694eac975727868fcceda86"
  },
  "i2": {
    "start": 3_452_514,
    "end": 3_455_040,
    "bytes": 2526,
    "sha256": "1bba93d7e7824ab3752403aae1a76bcf38f1e463d367140cc32e5951fce90be7"
  },
  "tR": {
    "start": 3_458_648,
    "end": 3_459_041,
    "bytes": 393,
    "sha256": "83b3a24141e6e50f4c362e80c885a568f2832794d61d80560ede336e95b295b0"
  },
  "rR": {
    "start": 3_459_049,
    "end": 3_459_460,
    "bytes": 411,
    "sha256": "b8cded4949858b59fe32a6d1c93a28e4033fca2e1d0b94614cee6b69564a0eac"
  },
  "Jx": {
    "start": 3_445_775,
    "end": 3_447_333,
    "bytes": 1558,
    "sha256": "d7f64f5d0c4929fcbea6bcd83dccdd7fcb20c9b4424596c59f3299a8972bf9b0"
  },
  "Yre": {
    "start": 3_445_006,
    "end": 3_445_771,
    "bytes": 765,
    "sha256": "26932d3d15893dc17f226a63c60a0c14f7438406bc0dfc2c09e1f759a6504381"
  },
  "zre": {
    "start": 3_442_282,
    "end": 3_443_089,
    "bytes": 807,
    "sha256": "c5b3b1d5c44ce8ab5a8e873ca27fa8516cb6f6e8e3c09ac96aa8d3ba785011ca"
  },
  "aR": {
    "start": 3_463_206,
    "end": 3_464_157,
    "bytes": 951,
    "sha256": "ef6e979357211cbfd78f47aa621fdd301332f67c578d6141480b11cb35b00a6e"
  },
  "eR": {
    "start": 3_455_048,
    "end": 3_456_668,
    "bytes": 1620,
    "sha256": "04e71bdbbe3602f66b6ae6d134c1d4d3a4015f16729ab869a4749eaf424b3b9c"
  },
  "O8": {
    "start": 3_447_341,
    "end": 3_448_267,
    "bytes": 926,
    "sha256": "ee37725245b71cbb8d7e751b84cc8435734d7352fb60d1e6ff3b66839264a2fd"
  },
  "Qx": {
    "start": 3_449_018,
    "end": 3_452_448,
    "bytes": 3430,
    "sha256": "b4cef102b8f98dd932aea0884ccc189fc41ba95df353b918ff3470517ef893d0"
  },
  "KCe": {
    "start": 3_448_852,
    "end": 3_448_981,
    "bytes": 129,
    "sha256": "7ca99d3e695eaa71d78614ed3313f58a334e2bee4c9420a3fad11736cb33adb7"
  },
  "lR": {
    "start": 3_470_588,
    "end": 3_471_789,
    "bytes": 1201,
    "sha256": "3ed57188f97a176849223b1a40a4f2617c2829f1a331471679cbbbd35f3d4a1c"
  },
  "sR": {
    "start": 3_462_329,
    "end": 3_463_198,
    "bytes": 869,
    "sha256": "5c50319454f111f76b585ac2e65c48a52ad14e17b8b39404f76b63c43dd64794"
  },
  "hR": {
    "start": 3_473_042,
    "end": 3_474_269,
    "bytes": 1227,
    "sha256": "477a17f6e8da4fef818061e10ae706f54aa605bc5e546c491a2c599a400807d3"
  },
  "zi": {
    "start": 4_807_075,
    "end": 4_808_343,
    "bytes": 1268,
    "sha256": "d892028c807ea36b81ba4b842e49889312f709fe797504b855fbd943e0f32b91"
  },
  "Ll": {
    "start": 4_806_852,
    "end": 4_807_067,
    "bytes": 215,
    "sha256": "a32277eae82cf9d82d1be62e1f65031124a28219daf37220566935a817b4c47c"
  },
  "x": {
    "start": 3_215_256,
    "end": 3_224_143,
    "bytes": 8887,
    "sha256": "26dd20cc2d772ac14590bf620f5a8b97b4d3e9ec4c08be191c0eb6e5954cd2b6"
  },
  "Zu": {
    "start": 3_194_357,
    "end": 3_201_109,
    "bytes": 6752,
    "sha256": "a4e2a16b0fe635de32f4835b233d2d79f61fde00851ede24c83dc0fab941d94e"
  },
  "A8e": {
    "start": 3_138_527,
    "end": 3_148_399,
    "bytes": 9872,
    "sha256": "938ac631d5be9a49060196c8893ba803f548765a4a3b8a71a5264d6d19a8d3b3"
  },
  "sCe": {
    "start": 2_754_420,
    "end": 2_756_268,
    "bytes": 1848,
    "sha256": "e4360fded571c4aa9f15a89057755536437ba39b6bdaacfc35c8a0f821a43a3d"
  },
  "mCe": {
    "start": 3_134_054,
    "end": 3_135_182,
    "bytes": 1128,
    "sha256": "fb8b7b835403fb4855d6ca91e0336e5f1ef4961a40ca58ff71df9f9b11cb0e52"
  },
  "At": {
    "start": 3_207_441,
    "end": 3_214_434,
    "bytes": 6993,
    "sha256": "310f0f1845c3dfe18dca6f3caddfb90b59f9cd1daa311a7b9af124e81ea3aaf0"
  },
  "ogt": {
    "start": 1_772_099,
    "end": 1_776_808,
    "bytes": 4709,
    "sha256": "e75465b138f9bb069fe3d6e2cda9b5b8280e7cfa4ae8ce60df98e981b5b568f3"
  },
  "ai": {
    "start": 4_758_659,
    "end": 4_765_928,
    "bytes": 7269,
    "sha256": "9344ad9acc6f78ec1799097cff83f98d21693944ea83be4bdd63541d6ac975d2"
  },
  "vfe": {
    "start": 9_175_788,
    "end": 9_187_983,
    "bytes": 12_195,
    "sha256": "605f3cde15eae1ded11be943e3bba24616228b5bd4a7c794b4db3a6e768c5a15"
  },
  "nr": {
    "start": 4_437_093,
    "end": 4_439_443,
    "bytes": 2350,
    "sha256": "fb2107fc1f8604ea3408707894ba31b1e1ac5c744db8441a588eb7ef21e7ad1f"
  },
  "pl": {
    "start": 7_357_950,
    "end": 7_367_635,
    "bytes": 9685,
    "sha256": "e5a4030c5bbfeba8c7b505d31403bbaf78239f8fe1d167e7307d41d75393a940"
  },
  "ha": {
    "start": 7_367_750,
    "end": 7_377_720,
    "bytes": 9972,
    "sha256": "ec5425be318353615155d96c40bc0b77b03cc7dfdeffac4e6e79cf3128cbd4a7"
  },
  "O8e": {
    "start": 3_122_153,
    "end": 3_122_463,
    "bytes": 310,
    "sha256": "ec7a40913a3779576f666bd49708fdf062bd9a71adf4ecc84813e04faee82edf"
  },
  "nb": {
    "start": 3_979_207,
    "end": 3_980_356,
    "bytes": 1149,
    "sha256": "467bfee529277f266ba0ff7d0dfd143e85e288cb154e21aa202bfcaf47939df6"
  },
  "H8": {
    "start": 3_975_842,
    "end": 3_977_591,
    "bytes": 1749,
    "sha256": "eb0429514b2192e89dfa2e5ef6ff708233743f92f283fec3b6111ee7f43a24e9"
  },
  "Am": {
    "start": 3_981_165,
    "end": 3_982_133,
    "bytes": 968,
    "sha256": "3d6dde8c2944b2a8eb4bf440fe0e3068cf20a929ceddd19c98fdee043c51f90c"
  },
  "z8": {
    "start": 3_980_917,
    "end": 3_981_129,
    "bytes": 212,
    "sha256": "901031f3040add64437e555a6d909df6b32b89d5ad630e30c6c1c29b0cda5c96"
  },
  "AF": {
    "start": 4_411_301,
    "end": 4_412_100,
    "bytes": 799,
    "sha256": "f76d256acef4447a7f85f76d4709a34998a6cc28275da96b570ff76ad084de21"
  },
  "YR": {
    "start": 4_412_108,
    "end": 4_412_571,
    "bytes": 463,
    "sha256": "b17d467cd80714d903071828d5d5296b0ab5938b31bca0be199f8146fe325f47"
  },
  "JR": {
    "start": 4_429_793,
    "end": 4_430_109,
    "bytes": 316,
    "sha256": "12ad8571670a13fe6054a495ec33c532464b4c7d71dd2ee23e56927ed403cf0c"
  },
  "jR": {
    "start": 4_412_579,
    "end": 4_412_685,
    "bytes": 106,
    "sha256": "3ad57e219a2f7aca9be22df3dc7848e3a6fb8a10a8d7e0255d6f831a9b4db6c4"
  },
  "wF": {
    "start": 4_434_417,
    "end": 4_434_714,
    "bytes": 297,
    "sha256": "adb9a12fd8d98a556444e9306ec9dcf387ef922f3300b6a3ae3299c61cf0210b"
  },
  "qV": {
    "start": 7_377_728,
    "end": 7_378_916,
    "bytes": 1188,
    "sha256": "bced480497707002a612ad366f9e64d0ac98fc93eab88604b00e22699236b414"
  },
  "Mn": {
    "start": 4_008_970,
    "end": 4_009_001,
    "bytes": 31,
    "sha256": "6ff31e798bce570228355245a0a3bbe63091c071d6965496a73c52ee7568b12b"
  },
  "j1": {
    "start": 3_444_054,
    "end": 3_444_450,
    "bytes": 396,
    "sha256": "3d39f112b0be90e219b66fb912a0fdbd70eff4b86ccb7636f4202acf764132e1"
  }
},
} as const);

function hash(text: string): string { return createHash("sha256").update(text).digest("hex"); }

/** Complete source first, then every fixed semantic-role slice. No caller
 * offsets or aliases and no runtime application code evaluation. */
export function inspectCurrentPcb209CommonSource(input: unknown): Readonly<{
  sourceProfileMatches: boolean; compatibilityAdmitted: false; executionAuthorized: false;
}> {
  if (typeof input !== "string" || !input.isWellFormed() || input.length > 12 * 1024 * 1024) {
    throw new Error("PCB209_COMMON_SOURCE_INPUT");
  }
  const profile = CURRENT_PCB_209_COMMON_SOURCE_PROFILE;
  const sourceProfileMatches = Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256 &&
    Object.values(profile.spans).every(span => {
      const slice = input.slice(span.start, span.end);
      return Buffer.byteLength(slice) === span.bytes && hash(slice) === span.sha256;
    });
  return Object.freeze({ sourceProfileMatches, compatibilityAdmitted: false, executionAuthorized: false });
}
