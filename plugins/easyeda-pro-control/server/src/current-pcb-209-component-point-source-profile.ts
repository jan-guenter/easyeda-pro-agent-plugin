/** Prospective complete Component/owned circular-top-Pad point source roster.
 * This source/cost checkpoint is not a native purpose or an enabled reader.
 * The old rejected Component/Pad attempt supplies no guard/owner authority. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PLANS as PAD_PLANS, CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES as PAD_PROFILES } from "./current-pcb-209-spatial-pad-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE } from "./current-pcb-209-spatial-source-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Only placed rE Pads are eligible; source tE templates are not candidates.
 * Top-only nonpolygon geometry skips these exact unentered template branches. */
export const CURRENT_PCB_209_COMPONENT_POINT_OMITTED_PAD_KEYS = ["tE.get:globalIndex", "tE.get:center", "tE.get:rotation", "tE.inShape", "tE.get:isTestPad"] as const;
export const CURRENT_PCB_209_COMPONENT_POINT_EXTRA_PROFILES = freezeDeep([
  {
    "key": "rE.class",
    "className": "Function",
    "sourceStart": 3_532_066,
    "sourceEnd": 3_548_405,
    "sourceBytes": 16_339,
    "sourceSha256": "fadad96c3c80103b9f2a5a75fe6a684da8a5d8ad11629bda40a0bc47b7171801",
    "lineNumber": 3637,
    "columnNumber": 410_096,
    "name": "o",
    "parameterCount": 2,
    "kind": "class",
    "prototypeClassName": "et"
  },
  {
    "key": "xi.class",
    "className": "Function",
    "sourceStart": 4_316_440,
    "sourceEnd": 4_331_476,
    "sourceBytes": 15_036,
    "sourceSha256": "dab1dccead34577b5545d131efd6c93699cca15c747fd67f268654dcdc1c3e49",
    "lineNumber": 3641,
    "columnNumber": 458_620,
    "name": "o",
    "parameterCount": 12,
    "kind": "class",
    "prototypeClassName": "ki"
  },
  {
    "key": "ws.class",
    "className": "Function",
    "sourceStart": 3_963_179,
    "sourceEnd": 3_967_535,
    "sourceBytes": 4356,
    "sourceSha256": "dc1f9536ef7494782c39c589e11f386d8bacfe42cc04165568fcf3c28f0b89ce",
    "lineNumber": 3641,
    "columnNumber": 105_420,
    "name": "iE",
    "parameterCount": 7,
    "kind": "class",
    "prototypeClassName": "Object"
  },
  {
    "key": "et.get:globalIndex",
    "className": "Function",
    "sourceStart": 3_515_917,
    "sourceEnd": 3_515_960,
    "sourceBytes": 43,
    "sourceSha256": "977dfaccb703d19f9dd710c36e534b15254f70e9d2ab57c3545d2617285000c6",
    "lineNumber": 3637,
    "columnNumber": 393_932,
    "name": "get globalIndex",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.get:top",
    "className": "Function",
    "sourceStart": 3_520_650,
    "sourceEnd": 3_520_677,
    "sourceBytes": 27,
    "sourceSha256": "f51b57aa818520b3cb7e8ae9e7ae76f24eba509f9314a3c50baeeeb8f3439b0c",
    "lineNumber": 3637,
    "columnNumber": 398_657,
    "name": "get top",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "tE.isPolygon",
    "className": "Function",
    "sourceStart": 3_525_932,
    "sourceEnd": 3_526_040,
    "sourceBytes": 108,
    "sourceSha256": "4dcca4159e72c916dff0182e7bb548787f1e39dc96c0e6a80c9a4cb527147c0a",
    "lineNumber": 3637,
    "columnNumber": 403_941,
    "name": "isPolygon",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "rE.inShape",
    "className": "Function",
    "sourceStart": 3_543_613,
    "sourceEnd": 3_544_230,
    "sourceBytes": 617,
    "sourceSha256": "fe8b4860e31a7f2ac46471afc675e413d42549b8a8cd55880a6379065dd3efc3",
    "lineNumber": 3637,
    "columnNumber": 421_620,
    "name": "inShape",
    "parameterCount": 3,
    "kind": "method"
  },
  {
    "key": "rE.get:layerId",
    "className": "Function",
    "sourceStart": 3_537_122,
    "sourceEnd": 3_537_157,
    "sourceBytes": 35,
    "sourceSha256": "024dfa25f994d82775c72ed0671e0b648f301efc011aa646944ab17584c14346",
    "lineNumber": 3637,
    "columnNumber": 415_133,
    "name": "get layerId",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:top",
    "className": "Function",
    "sourceStart": 3_534_891,
    "sourceEnd": 3_535_063,
    "sourceBytes": 172,
    "sourceSha256": "98936ca0c28e36ae8b4f7d184efd7f4eaa70134a5339a346ccbbaabc1e73026c",
    "lineNumber": 3637,
    "columnNumber": 412_898,
    "name": "get top",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:center",
    "className": "Function",
    "sourceStart": 3_539_751,
    "sourceEnd": 3_539_785,
    "sourceBytes": 34,
    "sourceSha256": "f375d6493434a92632376e60da03c13f702422f18001f45ce2fde37eac4ca78d",
    "lineNumber": 3637,
    "columnNumber": 417_761,
    "name": "get center",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:rotation",
    "className": "Function",
    "sourceStart": 3_539_860,
    "sourceEnd": 3_539_897,
    "sourceBytes": 37,
    "sourceSha256": "a096050bda4313035d5cb316d95368467c1d25c4d8251ef323408b2dfd08b14f",
    "lineNumber": 3637,
    "columnNumber": 417_872,
    "name": "get rotation",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:model",
    "className": "Function",
    "sourceStart": 3_532_590,
    "sourceEnd": 3_532_621,
    "sourceBytes": 31,
    "sourceSha256": "9fe8f9c53069021a5ab95c56b64d2550c519a12561446da2591900b2059710ea",
    "lineNumber": 3637,
    "columnNumber": 410_599,
    "name": "get model",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:locked",
    "className": "Function",
    "sourceStart": 3_541_480,
    "sourceEnd": 3_541_532,
    "sourceBytes": 52,
    "sourceSha256": "7d32179e9e71ac54870b1025333fe3082a7a1f761baee3e37ed8825753d8e702",
    "lineNumber": 3637,
    "columnNumber": 419_490,
    "name": "get locked",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:padType",
    "className": "Function",
    "sourceStart": 3_533_858,
    "sourceEnd": 3_533_935,
    "sourceBytes": 77,
    "sourceSha256": "eb130b37b42d7d3e226d86bb6662e6f19aeb697342daef95735fbaa187d4eaf8",
    "lineNumber": 3637,
    "columnNumber": 411_869,
    "name": "get padType",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.get:isTestPad",
    "className": "Function",
    "sourceStart": 3_533_986,
    "sourceEnd": 3_534_025,
    "sourceBytes": 39,
    "sourceSha256": "32b740d13ebda9fd7901e231c7a5c8d1fbcb9d68be4023d0dd03700e8c74295b",
    "lineNumber": 3637,
    "columnNumber": 411_999,
    "name": "get isTestPad",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "rE.isPolygon",
    "className": "Function",
    "sourceStart": 3_542_267,
    "sourceEnd": 3_542_309,
    "sourceBytes": 42,
    "sourceSha256": "cfe2c32e3d3cedaa8c36245a1217114dbadbaac172a321e2e4ef63e4b19af3ff",
    "lineNumber": 3637,
    "columnNumber": 420_276,
    "name": "isPolygon",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "Le.isSelect",
    "className": "Function",
    "sourceStart": 7_406_351,
    "sourceEnd": 7_406_582,
    "sourceBytes": 231,
    "sourceSha256": "c55c61dca2904bcc9d270fda675e17a1be8b1abdf2daaebf8aa7c3d335553e31",
    "lineNumber": 4597,
    "columnNumber": 20_784,
    "name": "isSelect",
    "parameterCount": 2,
    "kind": "method"
  },
  {
    "key": "Le.getPads",
    "className": "Function",
    "sourceStart": 7_401_690,
    "sourceEnd": 7_401_717,
    "sourceBytes": 27,
    "sourceSha256": "9736a5ab4fc528bd17aad0014ffa89e93c5d48445a7fa39dfcefd2eb9cc66b1d",
    "lineNumber": 4597,
    "columnNumber": 16_122,
    "name": "getPads",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "Le.buildBBox",
    "className": "Function",
    "sourceStart": 7_411_222,
    "sourceEnd": 7_411_264,
    "sourceBytes": 42,
    "sourceSha256": "2e6457a6ea2b723a7fce427729976bf9d44b862a0ce66710ff7bb982e6fa4f8b",
    "lineNumber": 4597,
    "columnNumber": 25_656,
    "name": "buildBBox",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "Le.get:layerId",
    "className": "Function",
    "sourceStart": 7_398_909,
    "sourceEnd": 7_398_949,
    "sourceBytes": 40,
    "sourceSha256": "a1cc06460f885a993416dc6ff0398ebb73db5c75452061e4aa67c425c31f9dad",
    "lineNumber": 4597,
    "columnNumber": 13_345,
    "name": "get layerId",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Le.get:locked",
    "className": "Function",
    "sourceStart": 7_398_715,
    "sourceEnd": 7_398_753,
    "sourceBytes": 38,
    "sourceSha256": "6c9f3027c0bebdc1a78db3c850452a81166867c9f8ba96da6feffbd761ec1112",
    "lineNumber": 4597,
    "columnNumber": 13_150,
    "name": "get locked",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "xi.inShape",
    "className": "Function",
    "sourceStart": 4_329_933,
    "sourceEnd": 4_329_975,
    "sourceBytes": 42,
    "sourceSha256": "ff66f21b08d2fabad2b64f5603426f0e667a708197b85a9212a9af676d78cd07",
    "lineNumber": 3641,
    "columnNumber": 472_090,
    "name": "inShape",
    "parameterCount": 2,
    "kind": "method"
  },
  {
    "key": "xi.buildBBox",
    "className": "Function",
    "sourceStart": 4_331_369,
    "sourceEnd": 4_331_475,
    "sourceBytes": 106,
    "sourceSha256": "800b6f50889aaffc330a420a633da554179459f9f29317ca5a72b369eb14068f",
    "lineNumber": 3641,
    "columnNumber": 473_528,
    "name": "buildBBox",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "xi.get:bbox",
    "className": "Function",
    "sourceStart": 4_321_448,
    "sourceEnd": 4_321_480,
    "sourceBytes": 32,
    "sourceSha256": "f327982a4edc445ebc6710e0600e6a0e49ecf162d700c97d13be307f21f404b7",
    "lineNumber": 3641,
    "columnNumber": 463_606,
    "name": "get bbox",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "xi.get:layerId",
    "className": "Function",
    "sourceStart": 4_318_308,
    "sourceEnd": 4_318_346,
    "sourceBytes": 38,
    "sourceSha256": "b76a70964e59a3ab1c780143271932e9978a97623d9837f99120dd049f9ebef5",
    "lineNumber": 3641,
    "columnNumber": 460_469,
    "name": "get layerId",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "xi.get:locked",
    "className": "Function",
    "sourceStart": 4_321_480,
    "sourceEnd": 4_321_516,
    "sourceBytes": 36,
    "sourceSha256": "88f59df56472a721a63a24ce2d782a955bde4bcce9805ee2514cec2053b59f5f",
    "lineNumber": 3641,
    "columnNumber": 463_640,
    "name": "get locked",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.inShape",
    "className": "Function",
    "sourceStart": 3_966_414,
    "sourceEnd": 3_966_862,
    "sourceBytes": 448,
    "sourceSha256": "cf7ad6537457a0232d0b738243a984b793104ecf6b53f97299f0fd8b121b8b11",
    "lineNumber": 3641,
    "columnNumber": 108_571,
    "name": "inShape",
    "parameterCount": 3,
    "kind": "method"
  },
  {
    "key": "ws.get:width",
    "className": "Function",
    "sourceStart": 3_964_501,
    "sourceEnd": 3_964_558,
    "sourceBytes": 57,
    "sourceSha256": "a9b68fd9c3f8a4dd6534cdb5a5917b22e0fc64023124c891bee9a275e60d0adf",
    "lineNumber": 3641,
    "columnNumber": 106_660,
    "name": "get width",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:height",
    "className": "Function",
    "sourceStart": 3_964_558,
    "sourceEnd": 3_964_614,
    "sourceBytes": 56,
    "sourceSha256": "6d2475c08630580af15cadc0466854e9535873c1873abb29cf07264453ee7d46",
    "lineNumber": 3641,
    "columnNumber": 106_718,
    "name": "get height",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:leftLow",
    "className": "Function",
    "sourceStart": 3_963_768,
    "sourceEnd": 3_963_803,
    "sourceBytes": 35,
    "sourceSha256": "d973fd35ffdc8e12b576aacfad4ac6532917f1846b25df848375070156732816",
    "lineNumber": 3641,
    "columnNumber": 105_929,
    "name": "get leftLow",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:leftUp",
    "className": "Function",
    "sourceStart": 3_963_875,
    "sourceEnd": 3_963_908,
    "sourceBytes": 33,
    "sourceSha256": "adf6f0d49cfd4e1f3524ab1a21a5fd419bb35f4039e88fd986c501505ee6214a",
    "lineNumber": 3641,
    "columnNumber": 106_035,
    "name": "get leftUp",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:rightLow",
    "className": "Function",
    "sourceStart": 3_963_977,
    "sourceEnd": 3_964_014,
    "sourceBytes": 37,
    "sourceSha256": "fd97417f4769bfa3a32079529803b41cf3977280c09f2b49ed342116fefa6eb6",
    "lineNumber": 3641,
    "columnNumber": 106_139,
    "name": "get rightLow",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:rightUp",
    "className": "Function",
    "sourceStart": 3_964_089,
    "sourceEnd": 3_964_124,
    "sourceBytes": 35,
    "sourceSha256": "37cef51a0e6f08e3d9e6680f2c764d5e389e0bf2c63ed489a9f43384ca1a4d4f",
    "lineNumber": 3641,
    "columnNumber": 106_250,
    "name": "get rightUp",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:layerId",
    "className": "Function",
    "sourceStart": 3_963_682,
    "sourceEnd": 3_963_717,
    "sourceBytes": 35,
    "sourceSha256": "024dfa25f994d82775c72ed0671e0b648f301efc011aa646944ab17584c14346",
    "lineNumber": 3641,
    "columnNumber": 105_843,
    "name": "get layerId",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:locked",
    "className": "Function",
    "sourceStart": 3_964_873,
    "sourceEnd": 3_964_906,
    "sourceBytes": 33,
    "sourceSha256": "0f60d7d0d93c44b0cd6b5057257494cbfa4bc1b2a6716912a70b92421be68525",
    "lineNumber": 3641,
    "columnNumber": 107_033,
    "name": "get locked",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.get:bbox",
    "className": "Function",
    "sourceStart": 3_964_196,
    "sourceEnd": 3_964_225,
    "sourceBytes": 29,
    "sourceSha256": "76ae22e3ebffc0c85ec995b4eb09f1b8f290f78787029f23382639bfd7c62491",
    "lineNumber": 3641,
    "columnNumber": 106_354,
    "name": "get bbox",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "E.sub",
    "className": "Function",
    "sourceStart": 1_062_610,
    "sourceEnd": 1_062_666,
    "sourceBytes": 56,
    "sourceSha256": "573805b4efaf588ff96226d72024d6d68ea6267606f983ab7b76dd1f785abbfb",
    "lineNumber": 60,
    "columnNumber": 15_169,
    "name": "sub",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "E.normalize",
    "className": "Function",
    "sourceStart": 1_064_459,
    "sourceEnd": 1_064_585,
    "sourceBytes": 126,
    "sourceSha256": "b950d5ec7bbf467026fa427862839ddf289440f7d9a0aa3239d4707d7306ccd7",
    "lineNumber": 60,
    "columnNumber": 17_024,
    "name": "normalize",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "E.cross",
    "className": "Function",
    "sourceStart": 1_062_931,
    "sourceEnd": 1_062_969,
    "sourceBytes": 38,
    "sourceSha256": "3be5b986d605a53a29f03837dbe17cf63cd11d8d87855840d1579f08229ec099",
    "lineNumber": 60,
    "columnNumber": 15_492,
    "name": "cross",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "E.length",
    "className": "Function",
    "sourceStart": 1_062_531,
    "sourceEnd": 1_062_573,
    "sourceBytes": 42,
    "sourceSha256": "a64284acc1bd7da9afc1a91cee47a1643773ba398d266d6ead25060ff028ac86",
    "lineNumber": 60,
    "columnNumber": 15_093,
    "name": "length",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "E.dot",
    "className": "Function",
    "sourceStart": 1_062_495,
    "sourceEnd": 1_062_531,
    "sourceBytes": 36,
    "sourceSha256": "fd2cd6ff4d977676d0ad35503596292057f2eed3c8dc8fadc5185206ad606b89",
    "lineNumber": 60,
    "columnNumber": 15_054,
    "name": "dot",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "Dm.class",
    "className": "Function",
    "sourceStart": 4_312_574,
    "sourceEnd": 4_315_484,
    "sourceBytes": 2910,
    "sourceSha256": "9cbc36f6b1230fcdeb1680f8a5c2e2a23f51161cc7f70953187495ea5055ba99",
    "lineNumber": 3641,
    "columnNumber": 454_755,
    "name": "Dm",
    "parameterCount": 0,
    "kind": "class",
    "prototypeClassName": "Ni"
  },
  {
    "key": "Dm.getItem",
    "className": "Function",
    "sourceStart": 4_314_710,
    "sourceEnd": 4_314_755,
    "sourceBytes": 45,
    "sourceSha256": "bb30d9492f33465dbca295c37e75090a6fca166418b27384a08e5e3b32bbd80b",
    "lineNumber": 3641,
    "columnNumber": 456_867,
    "name": "getItem",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "lC.class",
    "className": "Function",
    "sourceStart": 4_301_685,
    "sourceEnd": 4_312_227,
    "sourceBytes": 10_544,
    "sourceSha256": "527cce803d8946d49059e287587b04661cca291732733b21fcc03c0d9d52d1ce",
    "lineNumber": 3641,
    "columnNumber": 443_852,
    "name": "lC",
    "parameterCount": 2,
    "kind": "class",
    "prototypeClassName": "Object"
  },
  {
    "key": "lC.getLayeredBoxMap",
    "className": "Function",
    "sourceStart": 4_302_607,
    "sourceEnd": 4_302_653,
    "sourceBytes": 46,
    "sourceSha256": "0e7ef7e3cfb08a2d92d02738d0a2b1766bbdf82df46e3263225b2ce08d31bba6",
    "lineNumber": 3641,
    "columnNumber": 444_773,
    "name": "getLayeredBoxMap",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "Le.getVisibleBBox",
    "className": "Function",
    "sourceStart": 7_406_738,
    "sourceEnd": 7_406_966,
    "sourceBytes": 228,
    "sourceSha256": "416f865cb657480b1ddf42ed26fead9f66038faffe8bd3d23b14bd6c544c2856",
    "lineNumber": 4597,
    "columnNumber": 21_177,
    "name": "getVisibleBBox",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "Le.getLayerIsVisible",
    "className": "Function",
    "sourceStart": 7_406_966,
    "sourceEnd": 7_407_052,
    "sourceBytes": 86,
    "sourceSha256": "318bfb02bb31473b1be570b9afaf958c1d594d5b3c7ccbfc1780ac8970e7d64c",
    "lineNumber": 4597,
    "columnNumber": 21_408,
    "name": "getLayerIsVisible",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "Le.get:footprintUUID",
    "className": "Function",
    "sourceStart": 7_398_077,
    "sourceEnd": 7_398_129,
    "sourceBytes": 52,
    "sourceSha256": "86efb23700d51e16f3f81221bf4eccd13eada7da58900cc14a0ef30754becd5b",
    "lineNumber": 4597,
    "columnNumber": 12_519,
    "name": "get footprintUUID",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Le.get:position",
    "className": "Function",
    "sourceStart": 7_399_066,
    "sourceEnd": 7_399_108,
    "sourceBytes": 42,
    "sourceSha256": "f60ad67fe35e8daab261b81809d9220cd65faeddd06893aa25d1c7140edf6682",
    "lineNumber": 4597,
    "columnNumber": 13_503,
    "name": "get position",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "Le.get:rotation",
    "className": "Function",
    "sourceStart": 7_399_783,
    "sourceEnd": 7_399_825,
    "sourceBytes": 42,
    "sourceSha256": "239d432dde6040c898afde8cdba4ab52a770911bc36ff0f0f2708f1633f3d190",
    "lineNumber": 4597,
    "columnNumber": 14_220,
    "name": "get rotation",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "xi.get:footprintUUID",
    "className": "Function",
    "sourceStart": 4_317_648,
    "sourceEnd": 4_317_695,
    "sourceBytes": 47,
    "sourceSha256": "afc95c0d07a6ce9a689a6bf7f2c7f41c3e848397ec863e4405bd9df2dcb13bf4",
    "lineNumber": 3641,
    "columnNumber": 459_815,
    "name": "get footprintUUID",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "xi.get:position",
    "className": "Function",
    "sourceStart": 4_320_233,
    "sourceEnd": 4_320_270,
    "sourceBytes": 37,
    "sourceSha256": "699014fd0b1d6a8db24b78999f4c8750605ab52e5ba813d4fa7316d1d9984297",
    "lineNumber": 3641,
    "columnNumber": 462_395,
    "name": "get position",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "xi.get:rotation",
    "className": "Function",
    "sourceStart": 4_320_971,
    "sourceEnd": 4_321_008,
    "sourceBytes": 37,
    "sourceSha256": "a096050bda4313035d5cb316d95368467c1d25c4d8251ef323408b2dfd08b14f",
    "lineNumber": 3641,
    "columnNumber": 463_133,
    "name": "get rotation",
    "parameterCount": 0,
    "kind": "getter"
  },
  {
    "key": "ws.transform",
    "className": "Function",
    "sourceStart": 3_966_228,
    "sourceEnd": 3_966_414,
    "sourceBytes": 186,
    "sourceSha256": "2dbcfbfe4da3e6eef9732e87fbeaaee1e604f41184fce3465d2d40bfcc70d9f2",
    "lineNumber": 3641,
    "columnNumber": 108_387,
    "name": "transform",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "ws.set:leftLow",
    "className": "Function",
    "sourceStart": 3_963_803,
    "sourceEnd": 3_963_875,
    "sourceBytes": 72,
    "sourceSha256": "662181d3167e28299be61f58f8563d12396d221540580fe50e38d9086afd05e5",
    "lineNumber": 3641,
    "columnNumber": 105_964,
    "name": "set leftLow",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "ws.set:leftUp",
    "className": "Function",
    "sourceStart": 3_963_908,
    "sourceEnd": 3_963_977,
    "sourceBytes": 69,
    "sourceSha256": "d8485f03e854e3c86f3ad9a605f88f2abc5260e3edf8e8d2906e06b7fb031c47",
    "lineNumber": 3641,
    "columnNumber": 106_068,
    "name": "set leftUp",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "ws.set:rightLow",
    "className": "Function",
    "sourceStart": 3_964_014,
    "sourceEnd": 3_964_089,
    "sourceBytes": 75,
    "sourceSha256": "00b4758fd50ce01b3004370528ea79cbd4668591c6a815e6a135faf212f1f2d5",
    "lineNumber": 3641,
    "columnNumber": 106_176,
    "name": "set rightLow",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "ws.set:rightUp",
    "className": "Function",
    "sourceStart": 3_964_124,
    "sourceEnd": 3_964_196,
    "sourceBytes": 72,
    "sourceSha256": "5b247c21f7e7084d4c611a6bde513314af5b1d7deaebee7a62bd8128b6e73350",
    "lineNumber": 3641,
    "columnNumber": 106_285,
    "name": "set rightUp",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "ws.updateBox",
    "className": "Function",
    "sourceStart": 3_966_862,
    "sourceEnd": 3_967_001,
    "sourceBytes": 139,
    "sourceSha256": "9d93cdc88a673eb04e5f95e3198050ab05ce72ed78f0cefe5fd1f38daac41fc4",
    "lineNumber": 3641,
    "columnNumber": 109_021,
    "name": "updateBox",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "ws.set:bbox",
    "className": "Function",
    "sourceStart": 3_964_225,
    "sourceEnd": 3_964_250,
    "sourceBytes": 25,
    "sourceSha256": "f09db0c6ce07dfd804bc8d27b218660f17490af04cad0522d3e17e1903d96a20",
    "lineNumber": 3641,
    "columnNumber": 106_383,
    "name": "set bbox",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "Ae.class",
    "className": "Function",
    "sourceStart": 1_066_518,
    "sourceEnd": 1_068_623,
    "sourceBytes": 2105,
    "sourceSha256": "2933fb8251e887863ae14d7f7910ca43e22e36cc6b2beeca88c5057732f0ec94",
    "lineNumber": 60,
    "columnNumber": 20_282,
    "name": "_p",
    "parameterCount": 0,
    "kind": "class",
    "prototypeClassName": "IQ"
  },
  {
    "key": "IQ.class",
    "className": "Function",
    "sourceStart": 1_046_724,
    "sourceEnd": 1_049_716,
    "sourceBytes": 2992,
    "sourceSha256": "83ea610b89b84997169d4a98892ee0d006b3adb80a3bdc4f76007940e90e0235",
    "lineNumber": 59,
    "columnNumber": 54_320,
    "name": "Bl",
    "parameterCount": 3,
    "kind": "class",
    "prototypeClassName": "Object"
  },
  {
    "key": "Ae.getMatrix4",
    "className": "Function",
    "sourceStart": 1_067_565,
    "sourceEnd": 1_067_715,
    "sourceBytes": 150,
    "sourceSha256": "a6b1bfabc9c338ec8462f1a53c5b3f6117260052cf1c54dfc8b0f9935cb0d400",
    "lineNumber": 60,
    "columnNumber": 20_131,
    "name": "getMatrix4",
    "parameterCount": 4,
    "kind": "method"
  },
  {
    "key": "E.multiply4",
    "className": "Function",
    "sourceStart": 1_063_746,
    "sourceEnd": 1_063_876,
    "sourceBytes": 130,
    "sourceSha256": "0ef10271b61eb3c7269962dd786f1f3b393d04727e93824035bf1ce9ab71ad7a",
    "lineNumber": 60,
    "columnNumber": 16_311,
    "name": "multiply4",
    "parameterCount": 1,
    "kind": "method"
  },
  {
    "key": "xe.build",
    "className": "Function",
    "sourceStart": 1_074_910,
    "sourceEnd": 1_074_973,
    "sourceBytes": 63,
    "sourceSha256": "5e68cfa13a6fb9c012334428cd73567b15c240b0c6318bc8186f906f62be5373",
    "lineNumber": 60,
    "columnNumber": 27_471,
    "name": "build",
    "parameterCount": 0,
    "kind": "method"
  },
  {
    "key": "at.extend2",
    "className": "Function",
    "sourceStart": 1_075_367,
    "sourceEnd": 1_075_531,
    "sourceBytes": 164,
    "sourceSha256": "2e56e74eddf28098e8e7d1ee06b519ad2b47c27e45c8d3b9055f1af5b0530586",
    "lineNumber": 60,
    "columnNumber": 27_930,
    "name": "extend2",
    "parameterCount": 2,
    "kind": "method"
  },
  {
    "key": "at.extend3",
    "className": "Function",
    "sourceStart": 1_075_538,
    "sourceEnd": 1_075_658,
    "sourceBytes": 120,
    "sourceSha256": "63dc3be22874de5cba95b5a8cea00069b3ce033f78780c816824fa73ba637513",
    "lineNumber": 60,
    "columnNumber": 28_101,
    "name": "extend3",
    "parameterCount": 2,
    "kind": "method"
  },
  {
    "key": "gqe",
    "className": "Function",
    "sourceStart": 7_396_901,
    "sourceEnd": 7_396_969,
    "sourceBytes": 68,
    "sourceSha256": "190b5a3ec6c79201207e4bef364d75aa71ddfaf75855949e794326699211f930",
    "lineNumber": 4597,
    "columnNumber": 11_338,
    "name": "gqe",
    "parameterCount": 6,
    "kind": "function"
  },
  {
    "key": "yqe",
    "className": "Function",
    "sourceStart": 7_396_969,
    "sourceEnd": 7_397_127,
    "sourceBytes": 158,
    "sourceSha256": "2bf19c02eca8ddf458c977fc1506336a1775702238ad4e9659895bacca8bfb20",
    "lineNumber": 4597,
    "columnNumber": 11_406,
    "name": "yqe",
    "parameterCount": 4,
    "kind": "function"
  }
] as const);
/** Setter extraction is metadata-only. A future finite native codebook must
 * select the actual descriptor.set, never invoke it while qualifying. */
export const CURRENT_PCB_209_COMPONENT_POINT_EXTRA_PLANS = freezeDeep([
  {
    "key": "rE.class",
    "role": "rE",
    "target": "class"
  },
  {
    "key": "xi.class",
    "role": "xi",
    "target": "class"
  },
  {
    "key": "ws.class",
    "role": "ws",
    "target": "class"
  },
  {
    "key": "et.get:globalIndex",
    "role": "et",
    "target": "prototype",
    "property": "globalIndex",
    "getter": true
  },
  {
    "key": "tE.get:top",
    "role": "tE",
    "target": "prototype",
    "property": "top",
    "getter": true
  },
  {
    "key": "tE.isPolygon",
    "role": "tE",
    "target": "prototype",
    "property": "isPolygon"
  },
  {
    "key": "rE.inShape",
    "role": "rE",
    "target": "prototype",
    "property": "inShape"
  },
  {
    "key": "rE.get:layerId",
    "role": "rE",
    "target": "prototype",
    "property": "layerId",
    "getter": true
  },
  {
    "key": "rE.get:top",
    "role": "rE",
    "target": "prototype",
    "property": "top",
    "getter": true
  },
  {
    "key": "rE.get:center",
    "role": "rE",
    "target": "prototype",
    "property": "center",
    "getter": true
  },
  {
    "key": "rE.get:rotation",
    "role": "rE",
    "target": "prototype",
    "property": "rotation",
    "getter": true
  },
  {
    "key": "rE.get:model",
    "role": "rE",
    "target": "prototype",
    "property": "model",
    "getter": true
  },
  {
    "key": "rE.get:locked",
    "role": "rE",
    "target": "prototype",
    "property": "locked",
    "getter": true
  },
  {
    "key": "rE.get:padType",
    "role": "rE",
    "target": "prototype",
    "property": "padType",
    "getter": true
  },
  {
    "key": "rE.get:isTestPad",
    "role": "rE",
    "target": "prototype",
    "property": "isTestPad",
    "getter": true
  },
  {
    "key": "rE.isPolygon",
    "role": "rE",
    "target": "prototype",
    "property": "isPolygon"
  },
  {
    "key": "Le.isSelect",
    "role": "Le",
    "target": "prototype",
    "property": "isSelect"
  },
  {
    "key": "Le.getPads",
    "role": "Le",
    "target": "prototype",
    "property": "getPads"
  },
  {
    "key": "Le.buildBBox",
    "role": "Le",
    "target": "prototype",
    "property": "buildBBox"
  },
  {
    "key": "Le.get:layerId",
    "role": "Le",
    "target": "prototype",
    "property": "layerId",
    "getter": true
  },
  {
    "key": "Le.get:locked",
    "role": "Le",
    "target": "prototype",
    "property": "locked",
    "getter": true
  },
  {
    "key": "xi.inShape",
    "role": "xi",
    "target": "prototype",
    "property": "inShape"
  },
  {
    "key": "xi.buildBBox",
    "role": "xi",
    "target": "prototype",
    "property": "buildBBox"
  },
  {
    "key": "xi.get:bbox",
    "role": "xi",
    "target": "prototype",
    "property": "bbox",
    "getter": true
  },
  {
    "key": "xi.get:layerId",
    "role": "xi",
    "target": "prototype",
    "property": "layerId",
    "getter": true
  },
  {
    "key": "xi.get:locked",
    "role": "xi",
    "target": "prototype",
    "property": "locked",
    "getter": true
  },
  {
    "key": "ws.inShape",
    "role": "ws",
    "target": "prototype",
    "property": "inShape"
  },
  {
    "key": "ws.get:width",
    "role": "ws",
    "target": "prototype",
    "property": "width",
    "getter": true
  },
  {
    "key": "ws.get:height",
    "role": "ws",
    "target": "prototype",
    "property": "height",
    "getter": true
  },
  {
    "key": "ws.get:leftLow",
    "role": "ws",
    "target": "prototype",
    "property": "leftLow",
    "getter": true
  },
  {
    "key": "ws.get:leftUp",
    "role": "ws",
    "target": "prototype",
    "property": "leftUp",
    "getter": true
  },
  {
    "key": "ws.get:rightLow",
    "role": "ws",
    "target": "prototype",
    "property": "rightLow",
    "getter": true
  },
  {
    "key": "ws.get:rightUp",
    "role": "ws",
    "target": "prototype",
    "property": "rightUp",
    "getter": true
  },
  {
    "key": "ws.get:layerId",
    "role": "ws",
    "target": "prototype",
    "property": "layerId",
    "getter": true
  },
  {
    "key": "ws.get:locked",
    "role": "ws",
    "target": "prototype",
    "property": "locked",
    "getter": true
  },
  {
    "key": "ws.get:bbox",
    "role": "ws",
    "target": "prototype",
    "property": "bbox",
    "getter": true
  },
  {
    "key": "E.sub",
    "role": "E",
    "target": "prototype",
    "property": "sub"
  },
  {
    "key": "E.normalize",
    "role": "E",
    "target": "prototype",
    "property": "normalize"
  },
  {
    "key": "E.cross",
    "role": "E",
    "target": "prototype",
    "property": "cross"
  },
  {
    "key": "E.length",
    "role": "E",
    "target": "prototype",
    "property": "length"
  },
  {
    "key": "E.dot",
    "role": "E",
    "target": "prototype",
    "property": "dot"
  },
  {
    "key": "Dm.class",
    "role": "Li",
    "target": "class"
  },
  {
    "key": "Dm.getItem",
    "role": "Li",
    "target": "prototype",
    "property": "getItem"
  },
  {
    "key": "lC.class",
    "role": "lC",
    "target": "class"
  },
  {
    "key": "lC.getLayeredBoxMap",
    "role": "lC",
    "target": "prototype",
    "property": "getLayeredBoxMap"
  },
  {
    "key": "Le.getVisibleBBox",
    "role": "Le",
    "target": "prototype",
    "property": "getVisibleBBox"
  },
  {
    "key": "Le.getLayerIsVisible",
    "role": "Le",
    "target": "prototype",
    "property": "getLayerIsVisible"
  },
  {
    "key": "Le.get:footprintUUID",
    "role": "Le",
    "target": "prototype",
    "property": "footprintUUID",
    "getter": true
  },
  {
    "key": "Le.get:position",
    "role": "Le",
    "target": "prototype",
    "property": "position",
    "getter": true
  },
  {
    "key": "Le.get:rotation",
    "role": "Le",
    "target": "prototype",
    "property": "rotation",
    "getter": true
  },
  {
    "key": "xi.get:footprintUUID",
    "role": "xi",
    "target": "prototype",
    "property": "footprintUUID",
    "getter": true
  },
  {
    "key": "xi.get:position",
    "role": "xi",
    "target": "prototype",
    "property": "position",
    "getter": true
  },
  {
    "key": "xi.get:rotation",
    "role": "xi",
    "target": "prototype",
    "property": "rotation",
    "getter": true
  },
  {
    "key": "ws.transform",
    "role": "ws",
    "target": "prototype",
    "property": "transform"
  },
  {
    "key": "ws.set:leftLow",
    "role": "ws",
    "target": "prototype",
    "property": "leftLow",
    "setter": true
  },
  {
    "key": "ws.set:leftUp",
    "role": "ws",
    "target": "prototype",
    "property": "leftUp",
    "setter": true
  },
  {
    "key": "ws.set:rightLow",
    "role": "ws",
    "target": "prototype",
    "property": "rightLow",
    "setter": true
  },
  {
    "key": "ws.set:rightUp",
    "role": "ws",
    "target": "prototype",
    "property": "rightUp",
    "setter": true
  },
  {
    "key": "ws.updateBox",
    "role": "ws",
    "target": "prototype",
    "property": "updateBox"
  },
  {
    "key": "ws.set:bbox",
    "role": "ws",
    "target": "prototype",
    "property": "bbox",
    "setter": true
  },
  {
    "key": "Ae.class",
    "role": "Ae",
    "target": "class"
  },
  {
    "key": "IQ.class",
    "role": "IQ",
    "target": "class"
  },
  {
    "key": "Ae.getMatrix4",
    "role": "Ae",
    "target": "static",
    "property": "getMatrix4"
  },
  {
    "key": "E.multiply4",
    "role": "E",
    "target": "prototype",
    "property": "multiply4"
  },
  {
    "key": "xe.build",
    "role": "xe",
    "target": "prototype",
    "property": "build"
  },
  {
    "key": "at.extend2",
    "role": "at",
    "target": "static",
    "property": "extend2"
  },
  {
    "key": "at.extend3",
    "role": "at",
    "target": "static",
    "property": "extend3"
  },
  {
    "key": "gqe",
    "role": "gqe",
    "target": "function"
  },
  {
    "key": "yqe",
    "role": "yqe",
    "target": "function"
  }
] as const);
const omitted = new Set<string>(CURRENT_PCB_209_COMPONENT_POINT_OMITTED_PAD_KEYS);
export const CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_PROFILES = Object.freeze([...PAD_PROFILES.filter(profile => !omitted.has(profile.key)), ...CURRENT_PCB_209_COMPONENT_POINT_EXTRA_PROFILES]);
export const CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_PLANS = Object.freeze([...PAD_PLANS.filter(plan => !omitted.has(plan.key)), ...CURRENT_PCB_209_COMPONENT_POINT_EXTRA_PLANS]);
/** Prospective reuse of the unchanged original opening/capture request graph.
 * A distinct original birth and finite codebook must enforce any future cap;
 * the existing384-ID spatial birth refuses even one complete query. */
export function deriveCurrentPcb209ComponentPointBudget(input: unknown): Readonly<{
  originalOpeningSourceAndReproof:103; capture:7; functions:1; tuple:1; calleeProperties:number; reads:number; release:1;
  spatialStage:number; fullWorkflow:number; existingRendererCeiling:384; existingBirthAdmitted:false; executionAuthorized:false;
}> {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 1 || input > 16) { throw new Error("PCB209_COMPONENT_POINT_QUERY_BUDGET"); }
  const calleeProperties = CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_PROFILES.length, spatialStage = 7 + 1 + 1 + calleeProperties + input + 1;
  return Object.freeze({ originalOpeningSourceAndReproof:103, capture:7, functions:1, tuple:1, calleeProperties, reads:input, release:1,
    spatialStage, fullWorkflow:103 + spatialStage, existingRendererCeiling:384, existingBirthAdmitted:false, executionAuthorized:false });
}
const digest = (value:string):string => createHash("sha256").update(value).digest("hex");
export function inspectCurrentPcb209ComponentPointSource(input: unknown): Readonly<{ sourceProfileMatches:boolean; nativePurposeIssued:false; runtimeSceneQualified:false; executionAuthorized:false }> {
  if (typeof input !== "string" || !input.isWellFormed() || input.length > 12 * 1024 * 1024) { throw new Error("PCB209_COMPONENT_POINT_SOURCE"); }
  const sourceProfileMatches = Buffer.byteLength(input) === CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE.bytes && digest(input) === CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE.sha256 &&
    CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_PROFILES.every(profile => { const body = input.slice(profile.sourceStart,profile.sourceEnd); return Buffer.byteLength(body) === profile.sourceBytes && digest(body) === profile.sourceSha256; });
  return Object.freeze({ sourceProfileMatches,nativePurposeIssued:false,runtimeSceneQualified:false,executionAuthorized:false });
}
