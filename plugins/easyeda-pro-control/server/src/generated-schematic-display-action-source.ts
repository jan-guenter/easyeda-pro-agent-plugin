/** Fixed action/recorder source metadata. Implicit command constructors are
 * retained as source spans only; they have no admitted FunctionLocation.
 * Matching source or inspector data grants no action/write/Save authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES = [
  "runnerConstructor", "runnerRun", "runnerUseAction", "runnerTryStartHistory", "runnerOptions", "runnerCurrentActionGet", "runnerCurrentActionSet", "runnerRunningGet",
  "historyConstructor", "historyBaseConstructor", "historyWatch", "historyGetModelCommand", "historyWithResolvers", "historyTransactionSuccess", "historyTransactionFailure",
  "historyTryGroup", "historyIsWatchedGet", "noop"
] as const;
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES = ["historyActiveAttribute", "resolverStart", "resolverComplete", "resolverFailure", "groupConstructor", "groupAdd"] as const;
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE = freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "methods": {
      "runnerConstructor": {
        "name": "_L",
        "arity": 0,
        "kind": "class",
        "start": 820_575,
        "end": 824_981,
        "bytes": 4406,
        "sha256": "ba23e781e436ab99b8e2b0bf33ad6be725fcd8b7fc70b140b3f82f03250cd279",
        "lineNumber": 30,
        "columnNumber": 64_369
      },
      "runnerRun": {
        "name": "run",
        "arity": 2,
        "kind": "method",
        "start": 824_699,
        "end": 824_901,
        "bytes": 202,
        "sha256": "0a3f8627c416515e6d966b57c6e5a7f7a6672202d190b2e2ab6fe72cecfa53d5",
        "lineNumber": 30,
        "columnNumber": 68_468
      },
      "runnerUseAction": {
        "name": "useAction",
        "arity": 1,
        "kind": "method",
        "start": 821_455,
        "end": 822_772,
        "bytes": 1317,
        "sha256": "661f7d6c26ceab19524a842de2427d1be4863b4a8bc3beae52e8db027530ac22",
        "lineNumber": 30,
        "columnNumber": 65_230
      },
      "runnerTryStartHistory": {
        "name": "_tryStartHistory",
        "arity": 1,
        "kind": "method",
        "start": 821_160,
        "end": 821_417,
        "bytes": 257,
        "sha256": "566abfc3a1b1c08421cade026c4d11e4b5ee7f8cf65a1f3d098b7b3cecb8d116",
        "lineNumber": 30,
        "columnNumber": 64_942
      },
      "runnerOptions": {
        "name": "_getActionRealOptions",
        "arity": 0,
        "kind": "method",
        "start": 824_554,
        "end": 824_699,
        "bytes": 145,
        "sha256": "a3f58776ce972d3501a6fa8b3c7640f97f03e5cf67daee7c9088c603340b144e",
        "lineNumber": 30,
        "columnNumber": 68_341
      },
      "runnerCurrentActionGet": {
        "name": "get currentAction",
        "arity": 0,
        "kind": "method",
        "start": 823_694,
        "end": 823_741,
        "bytes": 47,
        "sha256": "6ba691dbac0bef72274e63136ac8405139287a0bcdf15f7019ae820594b58d31",
        "lineNumber": 30,
        "columnNumber": 67_477
      },
      "runnerCurrentActionSet": {
        "name": "set currentAction",
        "arity": 1,
        "kind": "method",
        "start": 823_741,
        "end": 823_926,
        "bytes": 185,
        "sha256": "59e89f2aa23c181366c94a02d7b2570473bfbd6bd48e816ef4bb159fcb146e6a",
        "lineNumber": 30,
        "columnNumber": 67_524
      },
      "runnerRunningGet": {
        "name": "get running",
        "arity": 0,
        "kind": "method",
        "start": 823_357,
        "end": 823_398,
        "bytes": 41,
        "sha256": "5373ddfefcad744395c73d624715a56f83a3cbb6b1fd90b694f1f773b4abf3f8",
        "lineNumber": 30,
        "columnNumber": 67_134
      },
      "historyConstructor": {
        "name": "x8",
        "arity": 1,
        "kind": "class",
        "start": 3_973_046,
        "end": 3_976_495,
        "bytes": 3449,
        "sha256": "4d2a62ae8cdb7e02b144a089a63bf2efe1a68890a5f7a6ce9cccbea8ac1f6e8b",
        "lineNumber": 3606,
        "columnNumber": 306_190
      },
      "historyBaseConstructor": {
        "name": "S8",
        "arity": 0,
        "kind": "class",
        "start": 3_968_633,
        "end": 3_972_617,
        "bytes": 3984,
        "sha256": "1d870acdba9159e6f69d193fd33c7a9f760dee17e8e64506741676b8d35efa5e",
        "lineNumber": 3606,
        "columnNumber": 301_777
      },
      "historyWatch": {
        "name": "watch",
        "arity": 0,
        "kind": "method",
        "start": 3_975_057,
        "end": 3_976_494,
        "bytes": 1437,
        "sha256": "c0597d29937ba5029b1bec044297d7fc4e30ccaaeee4a1ae967ce43f962f3451",
        "lineNumber": 3606,
        "columnNumber": 308_178
      },
      "historyGetModelCommand": {
        "name": "getModelHistoryCommand",
        "arity": 1,
        "kind": "method",
        "start": 3_973_960,
        "end": 3_974_103,
        "bytes": 143,
        "sha256": "b0c1eddbd9f749e5227dbe44cbe270a2c796b90ce5a8797b9ce83468ff3ea1a3",
        "lineNumber": 3606,
        "columnNumber": 307_098
      },
      "historyTryGroup": {
        "name": "",
        "arity": 4,
        "kind": "arrow",
        "start": 3_973_259,
        "end": 3_973_577,
        "bytes": 318,
        "sha256": "590867e3ce143550cb1bffc5c164b46cfefda5555bde24fe6bebc5ac5e05ca46",
        "lineNumber": 3606,
        "columnNumber": 306_375
      },
      "historyIsWatchedGet": {
        "name": "get isWatched",
        "arity": 0,
        "kind": "method",
        "start": 3_975_018,
        "end": 3_975_057,
        "bytes": 39,
        "sha256": "f11a7f908f0e9b8616fbbb61d7590ddadd3867b6c361b482faf39b1bf70409c8",
        "lineNumber": 3606,
        "columnNumber": 308_147
      },
      "historyWithResolvers": {
        "name": "withResolvers",
        "arity": 0,
        "kind": "method",
        "start": 3_971_545,
        "end": 3_971_844,
        "bytes": 299,
        "sha256": "41eb6f27ba497e4dcedf259e4ee6969cb440ac21b1efc9ec01883c38557bfd77",
        "lineNumber": 3606,
        "columnNumber": 304_674
      },
      "historyTransactionSuccess": {
        "name": "transactionSuccessHandler",
        "arity": 0,
        "kind": "method",
        "start": 3_970_967,
        "end": 3_971_252,
        "bytes": 285,
        "sha256": "2abf8ebd3e8b1d024c7bb1b1396ed7adf3bf6eb483aac1b75e1356f1358113b5",
        "lineNumber": 3606,
        "columnNumber": 304_108
      },
      "historyTransactionFailure": {
        "name": "transactionFailHandler",
        "arity": 0,
        "kind": "method",
        "start": 3_971_252,
        "end": 3_971_486,
        "bytes": 234,
        "sha256": "ae146c82cac57f6f3738443844b0369410eae3595352ed342563fef23d287b6b",
        "lineNumber": 3606,
        "columnNumber": 304_390
      },
      "historyBatchStartGet": {
        "name": "get onBatchSaveStart",
        "arity": 0,
        "kind": "method",
        "start": 3_971_486,
        "end": 3_971_545,
        "bytes": 59,
        "sha256": "73352dd92f1ae56c6f2cac9fb4d0fb4bd87f23c9e1bca66edeac4bb7d9f817ba",
        "lineNumber": 3606,
        "columnNumber": 304_622
      },
      "historyActiveAttribute": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 3_975_774,
        "end": 3_975_974,
        "bytes": 200,
        "sha256": "dae075ea9bcef2f7de3b13d40387480a7ddbb082c2b08da2cf70a253999dc698",
        "lineNumber": 3606,
        "columnNumber": 308_890
      },
      "historyBatchStart": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 3_975_430,
        "end": 3_976_216,
        "bytes": 786,
        "sha256": "b51ddceb329e08007e3a155aecfedc2615d948908fbd22a96ebfeb5700a31bc6",
        "lineNumber": 3606,
        "columnNumber": 308_546
      },
      "resolverStart": {
        "name": "t",
        "arity": 0,
        "kind": "arrow",
        "start": 3_971_611,
        "end": 3_971_736,
        "bytes": 125,
        "sha256": "990cd1cc8749dadd9b66dd78b9fc4f51f2c30bf26b3188ecc5d61f89582b77d3",
        "lineNumber": 3606,
        "columnNumber": 304_727
      },
      "resolverComplete": {
        "name": "r",
        "arity": 0,
        "kind": "arrow",
        "start": 3_971_739,
        "end": 3_971_775,
        "bytes": 36,
        "sha256": "5c750aed9cbdc0c474e7c6427db61c6c12852277a33d4781b3d1720a95373706",
        "lineNumber": 3606,
        "columnNumber": 304_855
      },
      "resolverFailure": {
        "name": "n",
        "arity": 0,
        "kind": "arrow",
        "start": 3_971_778,
        "end": 3_971_811,
        "bytes": 33,
        "sha256": "846bda293246c690fde0119d6932f3e13d50951f92f9d7bc0a7315deffd9c66a",
        "lineNumber": 3606,
        "columnNumber": 304_894
      },
      "groupConstructor": {
        "name": "wJ",
        "arity": 0,
        "kind": "class",
        "start": 3_972_621,
        "end": 3_973_038,
        "bytes": 417,
        "sha256": "1bd06517ef712d0765a1027ec68ee091872a8e3506d5972df17b922c526a47a7",
        "lineNumber": 3606,
        "columnNumber": 305_754
      },
      "groupAdd": {
        "name": "add",
        "arity": 1,
        "kind": "method",
        "start": 3_972_829,
        "end": 3_972_858,
        "bytes": 29,
        "sha256": "aaebf5c2bfbb01aca6a998547871161d2db4d59c66aa1e8af620d563094a0d58",
        "lineNumber": 3606,
        "columnNumber": 305_948
      },
      "commandConstructor": {
        "name": "Tk",
        "arity": 0,
        "kind": "implicit-class",
        "start": 1_804_362,
        "end": 1_805_271,
        "bytes": 909,
        "sha256": "8f902a957453b232506e7e3eb8ef435fc4bfb780d36dae36a17c38fc3b1ef974",
        "lineNumber": 59,
        "columnNumber": 87_819
      },
      "commandBaseConstructor": {
        "name": "pf",
        "arity": 1,
        "kind": "class",
        "start": 1_803_249,
        "end": 1_804_358,
        "bytes": 1109,
        "sha256": "d6daf449f473b617aebd31484d22227ef854df8fe8c15ccc8495cdb12eadf5ba",
        "lineNumber": 59,
        "columnNumber": 86_723
      },
      "commandAttribute": {
        "name": "onAttrChange",
        "arity": 3,
        "kind": "method",
        "start": 1_804_725,
        "end": 1_805_015,
        "bytes": 290,
        "sha256": "eff9de540dcd898efc1098f93dc2297fa9774d5dbe0a672c5370398efb308a4c",
        "lineNumber": 59,
        "columnNumber": 88_194
      },
      "noop": {
        "name": "Cr",
        "arity": 0,
        "kind": "regular",
        "start": 293_473,
        "end": 293_492,
        "bytes": 19,
        "sha256": "1a7537700960b2bdff0515fb4a459506aed1600efd9b642fb1b7d3c60f2f6c6d",
        "lineNumber": 4,
        "columnNumber": 92_939
      },
      "executeCallbacks": {
        "name": "bO",
        "arity": 1,
        "kind": "regular",
        "start": 305_310,
        "end": 305_429,
        "bytes": 119,
        "sha256": "2d5414bdb70f6cde9f5785ba0be8b087ec5e2df114a69708fa5c6c660541b669",
        "lineNumber": 6,
        "columnNumber": 7283
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "methods": {
      "runnerConstructor": {
        "name": "Ok",
        "arity": 0,
        "kind": "class",
        "start": 1_843_987,
        "end": 1_848_393,
        "bytes": 4406,
        "sha256": "0403da82402f91ff4771e1b85ec7a63cf273e6530b46e5c01bf6d129a855baf7",
        "lineNumber": 556,
        "columnNumber": 64_369
      },
      "runnerRun": {
        "name": "run",
        "arity": 2,
        "kind": "method",
        "start": 1_848_111,
        "end": 1_848_313,
        "bytes": 202,
        "sha256": "7cc3363f5047ba8424106ebecd371f02efbbc282932883f1f502bb474ca0af2f",
        "lineNumber": 556,
        "columnNumber": 68_468
      },
      "runnerUseAction": {
        "name": "useAction",
        "arity": 1,
        "kind": "method",
        "start": 1_844_867,
        "end": 1_846_184,
        "bytes": 1317,
        "sha256": "aabb2ce6d244587c6b03216fcfd78debdfb0c1114b73a721f031f954b2fc082f",
        "lineNumber": 556,
        "columnNumber": 65_230
      },
      "runnerTryStartHistory": {
        "name": "_tryStartHistory",
        "arity": 1,
        "kind": "method",
        "start": 1_844_572,
        "end": 1_844_829,
        "bytes": 257,
        "sha256": "566abfc3a1b1c08421cade026c4d11e4b5ee7f8cf65a1f3d098b7b3cecb8d116",
        "lineNumber": 556,
        "columnNumber": 64_942
      },
      "runnerOptions": {
        "name": "_getActionRealOptions",
        "arity": 0,
        "kind": "method",
        "start": 1_847_966,
        "end": 1_848_111,
        "bytes": 145,
        "sha256": "b44dca96ab56177addcc5fabfb7ed0f67ed313c920b6d877b74b48e86a40ad7b",
        "lineNumber": 556,
        "columnNumber": 68_341
      },
      "runnerCurrentActionGet": {
        "name": "get currentAction",
        "arity": 0,
        "kind": "method",
        "start": 1_847_106,
        "end": 1_847_153,
        "bytes": 47,
        "sha256": "6ba691dbac0bef72274e63136ac8405139287a0bcdf15f7019ae820594b58d31",
        "lineNumber": 556,
        "columnNumber": 67_477
      },
      "runnerCurrentActionSet": {
        "name": "set currentAction",
        "arity": 1,
        "kind": "method",
        "start": 1_847_153,
        "end": 1_847_338,
        "bytes": 185,
        "sha256": "59e89f2aa23c181366c94a02d7b2570473bfbd6bd48e816ef4bb159fcb146e6a",
        "lineNumber": 556,
        "columnNumber": 67_524
      },
      "runnerRunningGet": {
        "name": "get running",
        "arity": 0,
        "kind": "method",
        "start": 1_846_769,
        "end": 1_846_810,
        "bytes": 41,
        "sha256": "5373ddfefcad744395c73d624715a56f83a3cbb6b1fd90b694f1f773b4abf3f8",
        "lineNumber": 556,
        "columnNumber": 67_134
      },
      "historyConstructor": {
        "name": "m8",
        "arity": 1,
        "kind": "class",
        "start": 4_180_247,
        "end": 4_183_696,
        "bytes": 3449,
        "sha256": "19843423275a26693e5d228c3f543f39c2689873547811355c2ff88eb1c6fa00",
        "lineNumber": 4105,
        "columnNumber": 171_658
      },
      "historyBaseConstructor": {
        "name": "g8",
        "arity": 0,
        "kind": "class",
        "start": 4_175_834,
        "end": 4_179_818,
        "bytes": 3984,
        "sha256": "0893cefdfed940ccc35737de8b13107ff9bbe171319698f5f460e8d7ff75be64",
        "lineNumber": 4105,
        "columnNumber": 167_245
      },
      "historyWatch": {
        "name": "watch",
        "arity": 0,
        "kind": "method",
        "start": 4_182_258,
        "end": 4_183_695,
        "bytes": 1437,
        "sha256": "393668b82fcec3682401c47881ce947400173a5d0c6ffdd588fd346aa248beae",
        "lineNumber": 4105,
        "columnNumber": 173_646
      },
      "historyGetModelCommand": {
        "name": "getModelHistoryCommand",
        "arity": 1,
        "kind": "method",
        "start": 4_181_161,
        "end": 4_181_304,
        "bytes": 143,
        "sha256": "809ee631e8cc92e7b11af56d720dd1f4e76d63ecf99d4c6e8c80ff73192a256e",
        "lineNumber": 4105,
        "columnNumber": 172_566
      },
      "historyTryGroup": {
        "name": "",
        "arity": 4,
        "kind": "arrow",
        "start": 4_180_460,
        "end": 4_180_778,
        "bytes": 318,
        "sha256": "590867e3ce143550cb1bffc5c164b46cfefda5555bde24fe6bebc5ac5e05ca46",
        "lineNumber": 4105,
        "columnNumber": 171_843
      },
      "historyIsWatchedGet": {
        "name": "get isWatched",
        "arity": 0,
        "kind": "method",
        "start": 4_182_219,
        "end": 4_182_258,
        "bytes": 39,
        "sha256": "f11a7f908f0e9b8616fbbb61d7590ddadd3867b6c361b482faf39b1bf70409c8",
        "lineNumber": 4105,
        "columnNumber": 173_615
      },
      "historyWithResolvers": {
        "name": "withResolvers",
        "arity": 0,
        "kind": "method",
        "start": 4_178_746,
        "end": 4_179_045,
        "bytes": 299,
        "sha256": "41eb6f27ba497e4dcedf259e4ee6969cb440ac21b1efc9ec01883c38557bfd77",
        "lineNumber": 4105,
        "columnNumber": 170_142
      },
      "historyTransactionSuccess": {
        "name": "transactionSuccessHandler",
        "arity": 0,
        "kind": "method",
        "start": 4_178_168,
        "end": 4_178_453,
        "bytes": 285,
        "sha256": "2abf8ebd3e8b1d024c7bb1b1396ed7adf3bf6eb483aac1b75e1356f1358113b5",
        "lineNumber": 4105,
        "columnNumber": 169_576
      },
      "historyTransactionFailure": {
        "name": "transactionFailHandler",
        "arity": 0,
        "kind": "method",
        "start": 4_178_453,
        "end": 4_178_687,
        "bytes": 234,
        "sha256": "ae146c82cac57f6f3738443844b0369410eae3595352ed342563fef23d287b6b",
        "lineNumber": 4105,
        "columnNumber": 169_858
      },
      "historyBatchStartGet": {
        "name": "get onBatchSaveStart",
        "arity": 0,
        "kind": "method",
        "start": 4_178_687,
        "end": 4_178_746,
        "bytes": 59,
        "sha256": "73352dd92f1ae56c6f2cac9fb4d0fb4bd87f23c9e1bca66edeac4bb7d9f817ba",
        "lineNumber": 4105,
        "columnNumber": 170_090
      },
      "historyActiveAttribute": {
        "name": "",
        "arity": 1,
        "kind": "arrow",
        "start": 4_182_975,
        "end": 4_183_175,
        "bytes": 200,
        "sha256": "dae075ea9bcef2f7de3b13d40387480a7ddbb082c2b08da2cf70a253999dc698",
        "lineNumber": 4105,
        "columnNumber": 174_358
      },
      "historyBatchStart": {
        "name": "",
        "arity": 0,
        "kind": "arrow",
        "start": 4_182_631,
        "end": 4_183_417,
        "bytes": 786,
        "sha256": "bf2023c3fd5afd2020281175f1610c080ad9ab49b65250808a8a65f7461c2989",
        "lineNumber": 4105,
        "columnNumber": 174_014
      },
      "resolverStart": {
        "name": "t",
        "arity": 0,
        "kind": "arrow",
        "start": 4_178_812,
        "end": 4_178_937,
        "bytes": 125,
        "sha256": "990cd1cc8749dadd9b66dd78b9fc4f51f2c30bf26b3188ecc5d61f89582b77d3",
        "lineNumber": 4105,
        "columnNumber": 170_195
      },
      "resolverComplete": {
        "name": "r",
        "arity": 0,
        "kind": "arrow",
        "start": 4_178_940,
        "end": 4_178_976,
        "bytes": 36,
        "sha256": "5c750aed9cbdc0c474e7c6427db61c6c12852277a33d4781b3d1720a95373706",
        "lineNumber": 4105,
        "columnNumber": 170_323
      },
      "resolverFailure": {
        "name": "n",
        "arity": 0,
        "kind": "arrow",
        "start": 4_178_979,
        "end": 4_179_012,
        "bytes": 33,
        "sha256": "846bda293246c690fde0119d6932f3e13d50951f92f9d7bc0a7315deffd9c66a",
        "lineNumber": 4105,
        "columnNumber": 170_362
      },
      "groupConstructor": {
        "name": "qJ",
        "arity": 0,
        "kind": "class",
        "start": 4_179_822,
        "end": 4_180_239,
        "bytes": 417,
        "sha256": "1bd06517ef712d0765a1027ec68ee091872a8e3506d5972df17b922c526a47a7",
        "lineNumber": 4105,
        "columnNumber": 171_222
      },
      "groupAdd": {
        "name": "add",
        "arity": 1,
        "kind": "method",
        "start": 4_180_030,
        "end": 4_180_059,
        "bytes": 29,
        "sha256": "aaebf5c2bfbb01aca6a998547871161d2db4d59c66aa1e8af620d563094a0d58",
        "lineNumber": 4105,
        "columnNumber": 171_416
      },
      "commandConstructor": {
        "name": "y8",
        "arity": 0,
        "kind": "implicit-class",
        "start": 6_279_221,
        "end": 6_280_130,
        "bytes": 909,
        "sha256": "14905e9361b991c83511fd529615f73f0cf8c826a5849a8a8ede69b9bac117db",
        "lineNumber": 4331,
        "columnNumber": 75_003
      },
      "commandBaseConstructor": {
        "name": "Pf",
        "arity": 1,
        "kind": "class",
        "start": 6_278_108,
        "end": 6_279_217,
        "bytes": 1109,
        "sha256": "1242b1333bd5d2da97dcedf496b082509740631adb01bcbcbb14f81938ec753d",
        "lineNumber": 4331,
        "columnNumber": 73_907
      },
      "commandAttribute": {
        "name": "onAttrChange",
        "arity": 3,
        "kind": "method",
        "start": 6_279_584,
        "end": 6_279_874,
        "bytes": 290,
        "sha256": "13d021b0bca6aff96df0859124991fecd0616ab4e3f5e905c3fc63006523eab3",
        "lineNumber": 4331,
        "columnNumber": 75_378
      },
      "noop": {
        "name": "Cr",
        "arity": 0,
        "kind": "regular",
        "start": 1_316_885,
        "end": 1_316_904,
        "bytes": 19,
        "sha256": "1a7537700960b2bdff0515fb4a459506aed1600efd9b642fb1b7d3c60f2f6c6d",
        "lineNumber": 530,
        "columnNumber": 26_737
      },
      "executeCallbacks": {
        "name": "PO",
        "arity": 1,
        "kind": "regular",
        "start": 1_328_722,
        "end": 1_328_841,
        "bytes": 119,
        "sha256": "09b335a2e0d307745a174dc0f3ecbfbf07c3bc398e2e7267cffeb5e17e6b1568",
        "lineNumber": 532,
        "columnNumber": 7283
      }
    }
  }
] as const);
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE_ROLES = ["runnerConstructor", "runnerRun", "runnerUseAction", "runnerTryStartHistory", "runnerOptions", "runnerCurrentActionGet", "runnerCurrentActionSet", "runnerRunningGet", "historyConstructor", "historyBaseConstructor", "historyWatch", "historyGetModelCommand", "historyTryGroup", "historyIsWatchedGet", "historyWithResolvers", "historyTransactionSuccess", "historyTransactionFailure", "historyBatchStartGet", "historyActiveAttribute", "historyBatchStart", "resolverStart", "resolverComplete", "resolverFailure", "groupConstructor", "groupAdd", "commandConstructor", "commandBaseConstructor", "commandAttribute", "noop", "executeCallbacks"] as const;
export type GeneratedSchematicDisplayActionRole = keyof typeof GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE[0]["methods"];
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_RECORDER_SCOPE_ROLES = ["historyTryGroup", "historyActiveAttribute", "resolverStart", "resolverComplete", "resolverFailure"] as const;
/** Leaf-only maximum: two projections/two array-property reads,24 function
 * metadata reads,two complete scripts,five scope lists plus at most7 lexical
 * scopes each,five original-recorder closure joins,one final reproof and one
 * object-group cleanup. Original pause/action custody is a separate budget. */
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_METADATA_BUDGET = Object.freeze({
  calleeProjections: 2, calleeArrays: 2, functionMetadata: 24, completeSources: 2,
  scopeLists: 5, lexicalScopes: 35, recorderClosureJoins: 5, finalReproof: 1, objectGroupCleanup: 1,
  cdpRequests: 77, events: 0, actionDispatchAuthorized: false, saveAuthorized: false,
});
