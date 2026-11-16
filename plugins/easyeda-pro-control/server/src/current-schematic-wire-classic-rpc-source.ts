/** Exact classic MessageBus request/reply/timer and original service spans.
 * Source data cannot issue native events, a callback, cleanup or writer authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { compareCurrentSchematicWireFunctionMetadata as compare } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction, CurrentSchematicWireFunctionMetadataProfile } from "./current-schematic-wire-completion-source.ts";
import { qualifyCurrentSchematicWireParserSource as schematic } from "./current-schematic-wire-parser-source.ts";
import { qualifyCurrentSchematicWirePublicSource as publicSource } from "./current-schematic-wire-public-source.ts";

export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "MessageBus_uniqueRpcTopic": {
        "start": 146_277,
        "end": 146_348,
        "bytes": 71,
        "sha256": "96081920c94e0507c99b1240d684be60c3a0a987ef994614c7170258987a3bc1",
        "name": "uniqueRpcTopic",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 68_422,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 68_426
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 68_478,
            "type": "return"
          }
        }
      },
      "helperListRemove": {
        "start": 143_756,
        "end": 143_860,
        "bytes": 104,
        "sha256": "446f303ea7ae56f88776f77148eaee6fcfeba31d2c8f0ce680743969590ba8fe",
        "name": "LIe",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 65_899,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 65_911
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 65_990,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall": {
        "start": 147_450,
        "end": 147_687,
        "bytes": 237,
        "sha256": "6887d933eb62d531d0a92e0b677b0dc05282c165c56969d84b637841ce87f74e",
        "name": "rpcCall",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_588,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_605,
            "type": "call"
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_817,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall_child0": {
        "start": 147_486,
        "end": 147_616,
        "bytes": 130,
        "sha256": "c6a4f3de52095ff5039d2f228eabcf5ad75715d1a54ee3196a733446b1ca5e81",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_617,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_627
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_746,
            "type": "return"
          },
          "publishing": {
            "lineNumber": 3,
            "columnNumber": 69_655,
            "type": "call"
          }
        }
      },
      "MessageBus_rpcCall_child1": {
        "start": 147_567,
        "end": 147_614,
        "bytes": 47,
        "sha256": "8f8813c1091b0c137b6991846f10cd438634898ef1969cf2f757bdd253101de5",
        "name": "",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_698,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_708,
            "type": "call"
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_744,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall_child2": {
        "start": 147_657,
        "end": 147_681,
        "bytes": 24,
        "sha256": "24ea0900d88a363319a6df4395cce3e5b1054130d81d8eee93f6b6bc71239048",
        "name": "",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_788,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_796,
            "type": "call"
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_811,
            "type": "return"
          }
        }
      },
      "MessageBus_publish": {
        "start": 146_348,
        "end": 146_556,
        "bytes": 208,
        "sha256": "4472a109b3fb1ee6db3ef732ce31309657e119e4b8cec2eb3e361cfa3a0ad7d7",
        "name": "publish",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 68_486,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 68_507
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 68_686,
            "type": "return"
          }
        }
      },
      "MessageBus_pull": {
        "start": 146_860,
        "end": 147_056,
        "bytes": 196,
        "sha256": "d14bbbd805b5bc06106a67f86300c04275cfcc44e62258c3e61fc9545c8d5dbf",
        "name": "pull",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 68_995,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_007,
            "type": "call"
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_186,
            "type": "return"
          }
        }
      },
      "MessageBus_push": {
        "start": 146_626,
        "end": 146_860,
        "bytes": 234,
        "sha256": "416f4c0afc64e0925714785c7de0a8344a20c545bbd269c2105837974c5a2cc9",
        "name": "push",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 68_761,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 68_777
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 68_990,
            "type": "return"
          }
        }
      },
      "MessageBusTask_execute": {
        "start": 146_039,
        "end": 146_120,
        "bytes": 81,
        "sha256": "d980428a5cd3698a092272adb4773097b5571b7e619c2a753de4df2e9bcc93d9",
        "name": "execute",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 68_177,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 68_191
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 68_250,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcService_child0": {
        "start": 147_184,
        "end": 147_448,
        "bytes": 264,
        "sha256": "0b136b98bf6cf8742fa73eaf57a842b101706716f1b1bd3876c1c076f68d6f2d",
        "name": "",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_315,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_337
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_578,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcService_child1": {
        "start": 147_278,
        "end": 147_309,
        "bytes": 31,
        "sha256": "ee5579fd825813b6cf29718366b48edecbaf23798b86adcac7adb5b8b18012f3",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_409,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_413
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_439,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcReply": {
        "start": 147_687,
        "end": 147_736,
        "bytes": 49,
        "sha256": "72ab3de161a594b52a386bb18c9da6f3bf4ffcd5efaccf4837debe52c395d044",
        "name": "rpcReply",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 69_826,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 69_836
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 69_866,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage": {
        "start": 144_231,
        "end": 144_593,
        "bytes": 362,
        "sha256": "9ecd1d1caa175cd940807a83348b0f97ca5a9672df24b0b0905d1b0c820e7af5",
        "name": "processRemoteMessage",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 66_382,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 66_394,
            "type": "call"
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 66_723,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage_child0": {
        "start": 144_337,
        "end": 144_362,
        "bytes": 25,
        "sha256": "1d653911223988b57553e2062fdcb3ff8582ac496ca3731260221733ccdf8a86",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 66_468,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 66_472
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 66_492,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage_child1": {
        "start": 144_407,
        "end": 144_435,
        "bytes": 28,
        "sha256": "02e25d938315f9222d5f3dd4f7e75eee8eaa66d126b249ac972adb9b10a508d6",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 66_538,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 66_542
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 66_565,
            "type": "return"
          }
        }
      },
      "WindowMessageBridge_postMessage": {
        "start": 145_823,
        "end": 145_901,
        "bytes": 78,
        "sha256": "6b4e50c63823e981e7227d5ad80212dbea90c6bed0e485993d5d59a09ef878df",
        "name": "postMessage",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 67_965,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 67_981
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 68_031,
            "type": "return"
          }
        }
      },
      "helperClone": {
        "start": 142_593,
        "end": 142_966,
        "bytes": 373,
        "sha256": "f82a319a1310be51e0a8dc2ebb7ce4b869ca110646b0993ce4cc2ce29ca0b212",
        "name": "yB",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 64_735,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 64_739
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 65_095,
            "type": "return"
          }
        }
      },
      "helperRef": {
        "start": 143_898,
        "end": 144_019,
        "bytes": 121,
        "sha256": "537f344b745083061e5e5ec32b8c82f46aa832dd3dec91b7a95777022960b220",
        "name": "eS",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 66_040,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 66_044
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 66_149,
            "type": "return"
          }
        }
      },
      "helperDeref": {
        "start": 144_019,
        "end": 144_066,
        "bytes": 47,
        "sha256": "28eed561a57500302a168a037473ae2670c5bbbf9ab00e43f62b4dc25c884739",
        "name": "pO",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 66_161,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 66_165
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 66_196,
            "type": "return"
          }
        }
      },
      "helperListGet": {
        "start": 142_966,
        "end": 143_006,
        "bytes": 40,
        "sha256": "865e896c2f3888abb3a7170657d0d1b3735177380459e394142969f9e4d77585",
        "name": "LH",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 65_108,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 65_114
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 65_136,
            "type": "return"
          }
        }
      },
      "helperListEnsure": {
        "start": 143_006,
        "end": 143_074,
        "bytes": 68,
        "sha256": "2eb1201f993a8f3f00f89d99ffd62fe7516c93004649f2c291bae470c2fbf8f8",
        "name": "DIe",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 65_149,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 65_163
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 65_204,
            "type": "return"
          }
        }
      },
      "helperListGet_child0": {
        "start": 142_998,
        "end": 143_004,
        "bytes": 6,
        "sha256": "720370c0b979dd42ba629c4bf29bc2888e9ef1752186506bca10b0da42a297c2",
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3,
        "columnNumber": 65_129,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3,
            "columnNumber": 65_133
          },
          "returned": {
            "lineNumber": 3,
            "columnNumber": 65_135,
            "type": "return"
          }
        }
      },
      "titleQuery": {
        "start": 5_731_416,
        "end": 5_732_597,
        "bytes": 1181,
        "sha256": "3c8c52e7de66aefcf23a090a19adcbb4ae6705ca0cf93641309892e6a64ce737",
        "name": "tj",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "lineNumber": 3697,
        "columnNumber": 41_823,
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 41_833
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 42_986,
            "type": "return"
          }
        }
      },
      "titleService": {
        "start": 6_201_696,
        "end": 6_201_716,
        "bytes": 20,
        "sha256": "fdf27962283344a29b0806697fe75c42e9a9aebd8ea994ccfc8e67a2f239151e",
        "name": "-getSheetAllTitle",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "lineNumber": 3831,
        "columnNumber": 40_838,
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "points": {
          "entry": {
            "lineNumber": 3831,
            "columnNumber": 40_847
          },
          "returned": {
            "lineNumber": 3831,
            "columnNumber": 40_858,
            "type": "return"
          }
        }
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "MessageBus_uniqueRpcTopic": {
        "start": 334_606,
        "end": 334_677,
        "bytes": 71,
        "sha256": "224a91314b923de02dfe6b4dde973fba7b3287498bf217667e04ab22ed82954e",
        "name": "uniqueRpcTopic",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 73_847,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 73_851
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 73_903,
            "type": "return"
          }
        }
      },
      "helperListRemove": {
        "start": 332_085,
        "end": 332_189,
        "bytes": 104,
        "sha256": "16d2e4f8d0ed3c420b49c19fb1f0da4bba27ce92dbed11bfaee1a4934e82aed6",
        "name": "X8e",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 71_324,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 71_336
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 71_415,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall": {
        "start": 335_779,
        "end": 336_016,
        "bytes": 237,
        "sha256": "93f0b4bee5304560cac7b2fc65b3b7aaeb0c8af0f10354724a33bba5e2e04643",
        "name": "rpcCall",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 75_013,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 75_030,
            "type": "call"
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 75_242,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall_child0": {
        "start": 335_815,
        "end": 335_945,
        "bytes": 130,
        "sha256": "ceee672ebeff20ec4393c9b22c94ebb43ba147f3884e3f185b3c3ac188b3a09e",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 75_042,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 75_052
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 75_171,
            "type": "return"
          },
          "publishing": {
            "lineNumber": 501,
            "columnNumber": 75_080,
            "type": "call"
          }
        }
      },
      "MessageBus_rpcCall_child1": {
        "start": 335_896,
        "end": 335_943,
        "bytes": 47,
        "sha256": "f560f4faa0612733570e38a50ddbd9acfa7f6aa141dc2d563330a54a95968cde",
        "name": "",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 75_123,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 75_133,
            "type": "call"
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 75_169,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall_child2": {
        "start": 335_986,
        "end": 336_010,
        "bytes": 24,
        "sha256": "24ea0900d88a363319a6df4395cce3e5b1054130d81d8eee93f6b6bc71239048",
        "name": "",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 75_213,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 75_221,
            "type": "call"
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 75_236,
            "type": "return"
          }
        }
      },
      "MessageBus_publish": {
        "start": 334_677,
        "end": 334_885,
        "bytes": 208,
        "sha256": "5a9032a664dc255379758a84d2fda8d5fdddc1b1ae13fcf8cb0f65c65b4c157e",
        "name": "publish",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 73_911,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 73_932
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 74_111,
            "type": "return"
          }
        }
      },
      "MessageBus_pull": {
        "start": 335_189,
        "end": 335_385,
        "bytes": 196,
        "sha256": "6ce2b7d560ff4a05183ea9b6e99c7357a85ffd31fdfc8d6494e2565ce1299efb",
        "name": "pull",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 74_420,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 74_432,
            "type": "call"
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 74_611,
            "type": "return"
          }
        }
      },
      "MessageBus_push": {
        "start": 334_955,
        "end": 335_189,
        "bytes": 234,
        "sha256": "e01be4346f2557a91b030bc03343e75c8b133515a5ff653fda8661966f085f28",
        "name": "push",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 74_186,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 74_202
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 74_415,
            "type": "return"
          }
        }
      },
      "MessageBusTask_execute": {
        "start": 334_368,
        "end": 334_449,
        "bytes": 81,
        "sha256": "9dc647262600b84debd44467c948ffb8a4a097be453605d78cb1102d87d0179a",
        "name": "execute",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 73_602,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 73_616
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 73_675,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcService_child0": {
        "start": 335_513,
        "end": 335_777,
        "bytes": 264,
        "sha256": "eaf45be25032a33e2745925a141992c8684507d408c23f9454e21e439c8dde75",
        "name": "",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 74_740,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 74_762
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 75_003,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcService_child1": {
        "start": 335_607,
        "end": 335_638,
        "bytes": 31,
        "sha256": "6895807b7ff69f072872ea7770249f9bf4e15385c001c97a2b51ec10347fe918",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 74_834,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 74_838
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 74_864,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcReply": {
        "start": 336_016,
        "end": 336_065,
        "bytes": 49,
        "sha256": "72ab3de161a594b52a386bb18c9da6f3bf4ffcd5efaccf4837debe52c395d044",
        "name": "rpcReply",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 75_251,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 75_261
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 75_291,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage": {
        "start": 332_560,
        "end": 332_922,
        "bytes": 362,
        "sha256": "a0d11461c9c8b78efccdfe79998e67ee8bda0c509867cf17bd0a3d093eec0a66",
        "name": "processRemoteMessage",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 71_807,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 71_819,
            "type": "call"
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 72_148,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage_child0": {
        "start": 332_666,
        "end": 332_691,
        "bytes": 25,
        "sha256": "958f4973e5219b6cbffc7379295232e8f30c09ddd893c19bc9b11eaf2c59fcdd",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 71_893,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 71_897
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 71_917,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage_child1": {
        "start": 332_736,
        "end": 332_764,
        "bytes": 28,
        "sha256": "3f7fddb93fec461a30732612d8d2a87c68e1b70b866b77499a6bdb16114b976e",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 71_963,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 71_967
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 71_990,
            "type": "return"
          }
        }
      },
      "WindowMessageBridge_postMessage": {
        "start": 334_152,
        "end": 334_230,
        "bytes": 78,
        "sha256": "6b4e50c63823e981e7227d5ad80212dbea90c6bed0e485993d5d59a09ef878df",
        "name": "postMessage",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 73_390,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 73_406
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 73_456,
            "type": "return"
          }
        }
      },
      "helperClone": {
        "start": 330_922,
        "end": 331_295,
        "bytes": 373,
        "sha256": "e34d883fcf3d18212d3d08fd51a1d96ca2e512d9cf25a072e15a3259a81b625f",
        "name": "ER",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 70_160,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 70_164
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 70_520,
            "type": "return"
          }
        }
      },
      "helperRef": {
        "start": 332_227,
        "end": 332_348,
        "bytes": 121,
        "sha256": "62383683221db07395af95559f4636381b55d36789ec015d855677c59c89f4d5",
        "name": "tx",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 71_465,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 71_469
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 71_574,
            "type": "return"
          }
        }
      },
      "helperDeref": {
        "start": 332_348,
        "end": 332_395,
        "bytes": 47,
        "sha256": "5b5cad9ddb001038c071119e9eb0aa68b58f6ffc93fcd8ed435b2cf1e358b755",
        "name": "l1",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 71_586,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 71_590
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 71_621,
            "type": "return"
          }
        }
      },
      "helperListGet": {
        "start": 331_295,
        "end": 331_335,
        "bytes": 40,
        "sha256": "09308bfb0f901fe04bba062a32d9d8b43610802e1549227aed7db6e9c7073a73",
        "name": "LW",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 70_533,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 70_539
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 70_561,
            "type": "return"
          }
        }
      },
      "helperListEnsure": {
        "start": 331_335,
        "end": 331_403,
        "bytes": 68,
        "sha256": "7c69fd8ba97d9ebd650ca47c695fa9947bb366edf83cd9ff6b476c27b7c0aece",
        "name": "z8e",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 70_574,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 70_588
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 70_629,
            "type": "return"
          }
        }
      },
      "helperListGet_child0": {
        "start": 331_327,
        "end": 331_333,
        "bytes": 6,
        "sha256": "720370c0b979dd42ba629c4bf29bc2888e9ef1752186506bca10b0da42a297c2",
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "lineNumber": 501,
        "columnNumber": 70_554,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 501,
            "columnNumber": 70_558
          },
          "returned": {
            "lineNumber": 501,
            "columnNumber": 70_560,
            "type": "return"
          }
        }
      },
      "titleQuery": {
        "start": 6_442_542,
        "end": 6_443_723,
        "bytes": 1181,
        "sha256": "e580c54a6ba70b6a65761dd135c3d5fcd0eb29a89747ccf5f245ce6ca33edf17",
        "name": "Cj",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "lineNumber": 4331,
        "columnNumber": 238_341,
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 238_351
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 239_504,
            "type": "return"
          }
        }
      },
      "titleService": {
        "start": 6_193_367,
        "end": 6_193_387,
        "bytes": 20,
        "sha256": "755c7e582ef1b3f2de0ca7aa2ae8c04fbdc63658b6c74abaa5a1cd41e8314d34",
        "name": "-getSheetAllTitle",
        "arity": 1,
        "constructible": false,
        "className": "AsyncFunction",
        "lineNumber": 4329,
        "columnNumber": 40_839,
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "points": {
          "entry": {
            "lineNumber": 4329,
            "columnNumber": 40_848
          },
          "returned": {
            "lineNumber": 4329,
            "columnNumber": 40_859,
            "type": "return"
          }
        }
      }
    }
  },
  {
    "variant": 2,
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "rows": {
      "MessageBus_uniqueRpcTopic": {
        "start": 1_649_225,
        "end": 1_649_296,
        "bytes": 71,
        "sha256": "b600e8035dfec230dcb3a32df1b803ed4aff896224684a56ad493e47c6febb7e",
        "name": "uniqueRpcTopic",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 28_936,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 28_940
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 28_992,
            "type": "return"
          }
        }
      },
      "helperListRemove": {
        "start": 1_646_695,
        "end": 1_646_799,
        "bytes": 104,
        "sha256": "0f7599c45a1ce605e4b12ea9e34a0d670660edae38ec7217e63514934fadf2b3",
        "name": "ndn",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 26_404,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 26_416
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 26_495,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall": {
        "start": 1_650_406,
        "end": 1_650_645,
        "bytes": 239,
        "sha256": "b60612c2e38e030ad9bd5a333f217075aa29af6d75370f5a142d61d91e3bbaaf",
        "name": "rpcCall",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 30_110,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 30_128,
            "type": "call"
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 30_341,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall_child0": {
        "start": 1_650_443,
        "end": 1_650_574,
        "bytes": 131,
        "sha256": "37fb9a29c12fd78a378bca0fc1bb1b57694b9d9511179b774c6c1dcff42697c3",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 30_140,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 30_150
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 30_270,
            "type": "return"
          },
          "publishing": {
            "lineNumber": 1033,
            "columnNumber": 30_178,
            "type": "call"
          }
        }
      },
      "MessageBus_rpcCall_child1": {
        "start": 1_650_524,
        "end": 1_650_572,
        "bytes": 48,
        "sha256": "69afb177cd5036f939c41b0dc2f9e3cdac9aa041341d6453c64245bbe64ddec0",
        "name": "",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 30_221,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 30_231,
            "type": "call"
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 30_268,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcCall_child2": {
        "start": 1_650_615,
        "end": 1_650_639,
        "bytes": 24,
        "sha256": "c05490a099cc6b46220506d46e7636b0338b4e9649b1d2dc65fdb334e3182ae1",
        "name": "",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 30_312,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 30_320,
            "type": "call"
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 30_335,
            "type": "return"
          }
        }
      },
      "MessageBus_publish": {
        "start": 1_649_296,
        "end": 1_649_504,
        "bytes": 208,
        "sha256": "0bce2ea3405188a341e08d4b2f73326ffc7805ad5a468ade32e50ef99275c869",
        "name": "publish",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 29_000,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 29_021
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 29_200,
            "type": "return"
          }
        }
      },
      "MessageBus_pull": {
        "start": 1_649_812,
        "end": 1_650_010,
        "bytes": 198,
        "sha256": "2eafb97dac1141308e31aeea4c491a0d905dd5911d0735ad261533e9c15f5194",
        "name": "pull",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 29_513,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 29_525,
            "type": "call"
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 29_706,
            "type": "return"
          }
        }
      },
      "MessageBus_push": {
        "start": 1_649_576,
        "end": 1_649_812,
        "bytes": 236,
        "sha256": "a8f5e3f794eabedcb1f51d783fcb1e0a4d9f144f18117a3843117ff09644e48d",
        "name": "push",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 29_277,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 29_293
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 29_508,
            "type": "return"
          }
        }
      },
      "MessageBusTask_execute": {
        "start": 1_648_986,
        "end": 1_649_068,
        "bytes": 82,
        "sha256": "e3f3dd7f5d116bf632acf0431c14c33751fa768802c8873552bca13f7970579b",
        "name": "execute",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 28_690,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 28_704
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 28_764,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcService_child0": {
        "start": 1_650_139,
        "end": 1_650_404,
        "bytes": 265,
        "sha256": "ffc74c64be71140f4e6d8cc2cacc9be76f838d970c90e7f3fcca8eca9bd41d7a",
        "name": "",
        "arity": 3,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 29_836,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 29_858
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 30_100,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcService_child1": {
        "start": 1_650_234,
        "end": 1_650_265,
        "bytes": 31,
        "sha256": "68e9c760e963c9dd3eb2b0bf58dedfcea8eea37abea92adc3fd145d62bd5ef5a",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 29_931,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 29_935
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 29_961,
            "type": "return"
          }
        }
      },
      "MessageBus_rpcReply": {
        "start": 1_650_645,
        "end": 1_650_694,
        "bytes": 49,
        "sha256": "854a1ca075b468ad732218e6c4ec992c91da02198a91bf21b804f9540bac8ce4",
        "name": "rpcReply",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 30_350,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 30_360
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 30_390,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage": {
        "start": 1_647_172,
        "end": 1_647_535,
        "bytes": 363,
        "sha256": "114bcfc323a043f098f7b6dcdf2308191391d5676f1ae9091ae492a218b1b75f",
        "name": "processRemoteMessage",
        "arity": 2,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 26_889,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 26_901,
            "type": "call"
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 27_231,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage_child0": {
        "start": 1_647_279,
        "end": 1_647_304,
        "bytes": 25,
        "sha256": "e84c16f181c1831086965943bfccb2d179a68c3a4d2c9662d729819f6ce44a97",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 26_976,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 26_980
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 27_000,
            "type": "return"
          }
        }
      },
      "MessageBridge_processRemoteMessage_child1": {
        "start": 1_647_349,
        "end": 1_647_377,
        "bytes": 28,
        "sha256": "59aaa987a4071535d99c10d55d521e4506695a5b7e96e07e2a1550ab6fe813b6",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 27_046,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 27_050
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 27_073,
            "type": "return"
          }
        }
      },
      "WindowMessageBridge_postMessage": {
        "start": 1_648_769,
        "end": 1_648_847,
        "bytes": 78,
        "sha256": "23f4006e0515b891b5d7c909f7258bbf57e351139313b354d879ab010942ff37",
        "name": "postMessage",
        "arity": 4,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 28_477,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 28_493
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 28_543,
            "type": "return"
          }
        }
      },
      "helperClone": {
        "start": 1_645_526,
        "end": 1_645_903,
        "bytes": 377,
        "sha256": "698dd5cc887837e94cabe91632547aa74da355e8e9e5a069f8d2120d6bd08ce0",
        "name": "e9e",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 25_235,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 25_239
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 25_598,
            "type": "return"
          }
        }
      },
      "helperRef": {
        "start": 1_646_837,
        "end": 1_646_959,
        "bytes": 122,
        "sha256": "5902dcde43644f0f2e692f6379daeae5d28f40768f61deeda5df89247fc1de06",
        "name": "Noe",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 26_546,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 26_550
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 26_655,
            "type": "return"
          }
        }
      },
      "helperDeref": {
        "start": 1_646_959,
        "end": 1_647_006,
        "bytes": 47,
        "sha256": "2b10f4bcdc595af8953fd8af085ec42cfaeebfe3483835fbe1658c4de8936173",
        "name": "aZ",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 26_667,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 26_671
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 26_702,
            "type": "return"
          }
        }
      },
      "helperListGet": {
        "start": 1_645_903,
        "end": 1_645_944,
        "bytes": 41,
        "sha256": "847ac6d1c5112406e6ba17235565fbe6914dc581ae79c8935766f89972378126",
        "name": "P2t",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 25_612,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 25_618
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 25_640,
            "type": "return"
          }
        }
      },
      "helperListEnsure": {
        "start": 1_645_944,
        "end": 1_646_012,
        "bytes": 68,
        "sha256": "ef79d8af6b7bf4c2eb3662e6c6abdda60e102f719db3805883c2cbf1434a39e2",
        "name": "tdn",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 25_653,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 25_667
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 25_708,
            "type": "return"
          }
        }
      },
      "helperListGet_child0": {
        "start": 1_645_936,
        "end": 1_645_942,
        "bytes": 6,
        "sha256": "720370c0b979dd42ba629c4bf29bc2888e9ef1752186506bca10b0da42a297c2",
        "name": "",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1033,
        "columnNumber": 25_633,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1033,
            "columnNumber": 25_637
          },
          "returned": {
            "lineNumber": 1033,
            "columnNumber": 25_639,
            "type": "return"
          }
        }
      },
      "N4e": {
        "start": 15_997_119,
        "end": 15_997_179,
        "bytes": 60,
        "sha256": "781b440bd6ab7728f8773864db7d5513889b91dc7c10f6b6d7c10b0f17c798a3",
        "name": "N4e",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1955,
        "columnNumber": 4447,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1955,
            "columnNumber": 4451
          },
          "returned": {
            "lineNumber": 1955,
            "columnNumber": 4494,
            "type": "return"
          }
        }
      },
      "N4e_child0": {
        "start": 15_997_142,
        "end": 15_997_178,
        "bytes": 36,
        "sha256": "9007000a3301f0f6a981c084ac063213ef5a4657f8f59102ef12f0b40cc6be43",
        "name": "",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1955,
        "columnNumber": 4458,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1955,
            "columnNumber": 4463,
            "type": "call"
          },
          "returned": {
            "lineNumber": 1955,
            "columnNumber": 4494,
            "type": "return"
          }
        }
      },
      "uiClosing": {
        "start": 16_702_743,
        "end": 16_702_827,
        "bytes": 84,
        "sha256": "ea05b13bd3c1e9c735ab17cf0ef0b7c4a5b6a67121c22cca06585c6c3bba4a3a",
        "name": "-isClosing",
        "arity": 0,
        "constructible": true,
        "className": "Function",
        "lineNumber": 2181,
        "columnNumber": 1100,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 2181,
            "columnNumber": 1109
          },
          "returned": {
            "lineNumber": 2181,
            "columnNumber": 1175,
            "type": "return"
          }
        }
      },
      "uiLocale_i18n": {
        "start": 8_091_078,
        "end": 8_091_468,
        "bytes": 390,
        "sha256": "c250475da73f3e79a7c337b4ff06dc4974fa78f6bfb3ec63e1964038dd8b24bc",
        "name": "i18n",
        "arity": 3,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1172,
        "columnNumber": 1_834_422,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1172,
            "columnNumber": 1_834_430
          },
          "returned": {
            "lineNumber": 1172,
            "columnNumber": 1_834_803,
            "type": "return"
          }
        }
      },
      "uiLocale__getValue": {
        "start": 8_090_618,
        "end": 8_091_072,
        "bytes": 454,
        "sha256": "935a0d0d83f6d1ae699d79714018087651d5554601254453929d7f887815a6b4",
        "name": "_getValue",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1172,
        "columnNumber": 1_833_962,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1172,
            "columnNumber": 1_833_968
          },
          "returned": {
            "lineNumber": 1172,
            "columnNumber": 1_834_407,
            "type": "return"
          }
        }
      },
      "uiClosingGetter": {
        "start": 15_080_686,
        "end": 15_080_725,
        "bytes": 39,
        "sha256": "b90f1bf0af23a981f39943a0687db1b2d39cd3311e6ae3085a7c101ff1f99724",
        "name": "get isClosing",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1913,
        "columnNumber": 194_716,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1913,
            "columnNumber": 194_731
          },
          "returned": {
            "lineNumber": 1913,
            "columnNumber": 194_741,
            "type": "return"
          }
        }
      }
    }
  }
] as const);
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_CONTAINERS = freezeDeep([
  {
    "variant": 0,
    "aliases": {
      "MessageBus": "HIe",
      "WindowMessageBridge": "jIe",
      "MessageBusTask": "kH",
      "MessageBridge": "Gie"
    },
    "classes": {
      "MessageBus": {
        "start": 146_126,
        "end": 147_737,
        "bytes": 1611,
        "sha256": "e739f534f7db565d69dcd302aea99ed833a904ca94d26f4481e942ccd2e42e40"
      },
      "MessageBusTask": {
        "start": 145_906,
        "end": 146_121,
        "bytes": 215,
        "sha256": "e2d77d6b57abbeef01b4aa39795e357bf2cdd4ffa282ae045efad6bc3c6187d1"
      },
      "MessageBridge": {
        "start": 144_199,
        "end": 144_855,
        "bytes": 656,
        "sha256": "30812a4b8099220d823e093c03df3fd7aeeeef6499314c111c09120342227b32"
      },
      "WindowMessageBridge": {
        "start": 145_322,
        "end": 145_902,
        "bytes": 580,
        "sha256": "6787300e6d592f57f82179b108a76d31228fd5f931d53395124b11fb4d04edb6"
      }
    },
    "initializer": {
      "timeout": "jH",
      "prefix": "FIe",
      "image": "RH",
      "shared": "AIe",
      "weak": "kIe"
    }
  },
  {
    "variant": 1,
    "aliases": {
      "MessageBus": "eFe",
      "WindowMessageBridge": "Q8e",
      "MessageBusTask": "RW",
      "MessageBridge": "Ode"
    },
    "classes": {
      "MessageBus": {
        "start": 334_455,
        "end": 336_066,
        "bytes": 1611,
        "sha256": "ea5b62da6a283a987be44b995ae38d3bdf96470a7233a270a5f67b208a731636"
      },
      "MessageBusTask": {
        "start": 334_235,
        "end": 334_450,
        "bytes": 215,
        "sha256": "382d129da63e12e475da2085d0046ca19788caddda95d12b15a726dc9326e298"
      },
      "MessageBridge": {
        "start": 332_528,
        "end": 333_184,
        "bytes": 656,
        "sha256": "3a7ba850e36af81601d296c5995ad733d24980436e143969885e5b815907d2d6"
      },
      "WindowMessageBridge": {
        "start": 333_651,
        "end": 334_231,
        "bytes": 580,
        "sha256": "e3635cc920155bb1cf6fca3ef08fa4685859caf066b65a3324328a9763cccb0d"
      }
    },
    "initializer": {
      "timeout": "jW",
      "prefix": "Z8e",
      "image": "kW",
      "shared": "V8e",
      "weak": "K8e"
    }
  },
  {
    "variant": 2,
    "aliases": {
      "MessageBus": "udn",
      "WindowMessageBridge": "ddn",
      "MessageBusTask": "R2t",
      "MessageBridge": "qsi"
    },
    "classes": {
      "MessageBus": {
        "start": 1_649_074,
        "end": 1_650_695,
        "bytes": 1621,
        "sha256": "0971cb97fa0e90079071abfc9bd64aca6b0f266ea2b88008fd9919d99fce27f3"
      },
      "MessageBusTask": {
        "start": 1_648_853,
        "end": 1_649_069,
        "bytes": 216,
        "sha256": "1d35dd579ae03247a36c1bf9cc28432ac1808a4e1d4995a6d8896e01e9197833"
      },
      "MessageBridge": {
        "start": 1_647_140,
        "end": 1_647_800,
        "bytes": 660,
        "sha256": "ca15e8810f39f7dc43c6ae8a86a26398fe8cc61fe1684af185732e9b6ec6561a"
      },
      "WindowMessageBridge": {
        "start": 1_648_268,
        "end": 1_648_848,
        "bytes": 580,
        "sha256": "72ddffe362f629e0933589fee4535083d6f368d068a3227dcc4e3f7dca31c9bf"
      }
    },
    "initializer": {
      "timeout": "z2t",
      "prefix": "sdn",
      "image": "O2t",
      "shared": "edn",
      "weak": "adn"
    }
  }
] as const);
export type CurrentSchematicWireClassicRpcVariant = 0 | 1 | 2;
export type CurrentSchematicWireClassicRpcSourceRole =
"MessageBridge_processRemoteMessage" | "MessageBridge_processRemoteMessage_child0" | "MessageBridge_processRemoteMessage_child1" | "MessageBusTask_execute" | "MessageBus_publish" | "MessageBus_pull" | "MessageBus_push" | "MessageBus_rpcCall" | "MessageBus_rpcCall_child0" | "MessageBus_rpcCall_child1" | "MessageBus_rpcCall_child2" | "MessageBus_rpcReply" | "MessageBus_rpcService_child0" | "MessageBus_rpcService_child1" | "MessageBus_uniqueRpcTopic" | "N4e" | "N4e_child0" | "WindowMessageBridge_postMessage" | "helperClone" | "helperDeref" | "helperListEnsure" | "helperListGet" | "helperListGet_child0" | "helperListRemove" | "helperRef" | "titleQuery" | "titleService" | "uiClosing" | "uiClosingGetter" | "uiLocale__getValue" | "uiLocale_i18n";
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_TOPICS = Object.freeze(["isClosing", "i18n", "getSheetAllTitle"] as const);
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_TIMEOUT = 300_000;
interface Span extends CurrentSchematicWireFunctionMetadataProfile {
  readonly start: number; readonly end: number;
  readonly points: Readonly<{ entry?: Readonly<{lineNumber:number;columnNumber:number}>;
    returned?: Readonly<{lineNumber:number;columnNumber:number}>;
    publishing?: Readonly<{lineNumber:number;columnNumber:number}> }>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE"); } }
export function currentSchematicWireClassicRpcSourceRow(variant: CurrentSchematicWireClassicRpcVariant, role: CurrentSchematicWireClassicRpcSourceRole): Span {
  need((variant === 0 || variant === 1 || variant === 2) && !Object.is(variant, -0));
  const rows: Readonly<Record<string, Span>> = CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE[variant].rows;
  need(Object.hasOwn(rows, role)); const row = rows[role]; need(row !== undefined); return row;
}
/** This new bounded source view admits the complete UI asset. The older
 * schematic-only capture limit and all released parsers stay unchanged. */
export function qualifyCurrentSchematicWireClassicRpcSource(input: unknown): CurrentSchematicWireClassicRpcVariant {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) && Reflect.ownKeys(input).length === 1);
  const field = Object.getOwnPropertyDescriptor(input, "scriptSource");
  need(field !== undefined && Object.hasOwn(field, "value") && typeof field.value === "string" && field.value.isWellFormed() && Buffer.byteLength(field.value) <= 17_468_192);
  const text = field.value; let variant: CurrentSchematicWireClassicRpcVariant;
  if (Buffer.byteLength(text) > 6_472_538) { need(publicSource(text) === 1); variant = 2; }
  else { variant = schematic({scriptSource:text}); }
  const rows: Readonly<Record<string, Span>> = CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE[variant].rows;
  for (const row of Object.values(rows)) {
    const body = text.slice(row.start, row.end);
    need(Buffer.byteLength(body) === row.bytes && createHash("sha256").update(body).digest("hex") === row.sha256);
  }
  return variant;
}
/** Only an actual supplied function description/PC/scope is compared. */
export function decodeCurrentSchematicWireClassicRpcFunction(input: unknown, actual: unknown,
  variant: CurrentSchematicWireClassicRpcVariant, role: CurrentSchematicWireClassicRpcSourceRole, scriptId: string): CurrentSchematicWireCompletionFunction {
  return compare(input, actual, currentSchematicWireClassicRpcSourceRow(variant, role), scriptId);
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const site = z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame = z.object({callFrameId:handle,functionLocation:site,location:site,returnValue:z.unknown().optional()});
const pause = z.object({reason:z.literal("other"),hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
/** A source location match never authenticates the original event transport. */
export function decodeCurrentSchematicWireClassicRpcPause(input: unknown, variant: CurrentSchematicWireClassicRpcVariant,
  role: CurrentSchematicWireClassicRpcSourceRole, stage: "entry" | "returned" | "publishing", scriptId: string, breakpointId: string):
  Readonly<{frame:string;returnValue:unknown;originalNativeEventJoined:false}> {
  handle.parse(scriptId); handle.parse(breakpointId); z.enum(["entry","returned","publishing"]).parse(stage);
  const row = currentSchematicWireClassicRpcSourceRow(variant,role); const point = row.points[stage]; need(point !== undefined);
  const raw = pause.parse(capture(input).value); const top = raw.callFrames[0]; need(top !== undefined);
  need(raw.hitBreakpoints[0] === breakpointId && top.functionLocation.scriptId === scriptId &&
    top.functionLocation.lineNumber === row.lineNumber && top.functionLocation.columnNumber === row.columnNumber &&
    top.location.scriptId === scriptId && top.location.lineNumber === point.lineNumber && top.location.columnNumber === point.columnNumber);
  if (stage !== "returned") { need(top.returnValue === undefined); }
  return Object.freeze({frame:top.callFrameId,returnValue:top.returnValue,originalNativeEventJoined:false});
}
