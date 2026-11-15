/** Complete pure title helpers and original UI project/locale service owners.
 * Source pins grant no service event, mutation, native or Save authority. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { compareCurrentSchematicWireFunctionMetadata as compare } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction,CurrentSchematicWireFunctionMetadataProfile } from "./current-schematic-wire-completion-source.ts";
import { qualifyCurrentSchematicWireClassicRpcSource as qualify } from "./current-schematic-wire-classic-rpc-source.ts";

export const CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE=freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "rows": {
      "helper00": {
        "start": 302_718,
        "end": 302_930,
        "bytes": 212,
        "sha256": "b4c907099cd798b38c374a3e19dcf61acd6749306c6cbfa410475b0c2e3eced2",
        "name": "ft",
        "arity": 2,
        "constructible": false,
        "className": "AsyncFunction",
        "lineNumber": 6,
        "columnNumber": 4697,
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "points": {
          "entry": {
            "lineNumber": 6,
            "columnNumber": 4703
          },
          "returned": {
            "lineNumber": 6,
            "columnNumber": 4891,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "ft"
      },
      "helper01": {
        "start": 302_503,
        "end": 302_718,
        "bytes": 215,
        "sha256": "a4137ea1ab5e11b08b7e04347b14f0ccd835ddf8c93fa2e1324b4e0aa1e87ac5",
        "name": "V",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 6,
        "columnNumber": 4475,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 6,
            "columnNumber": 4481
          },
          "returned": {
            "lineNumber": 6,
            "columnNumber": 4679,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "V"
      },
      "helper02": {
        "start": 5_737_948,
        "end": 5_737_989,
        "bytes": 41,
        "sha256": "72ed8c4be0d1065d5b0edd13a0357fa2881c9747b62b902767e81c42f346ed5a",
        "name": "oi",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 48_349,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 48_353
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 48_378,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "oi"
      },
      "helper03": {
        "start": 5_741_481,
        "end": 5_741_648,
        "bytes": 167,
        "sha256": "f20b80153e715640c688bd1f067535b490c215d5dbb8c69670307f70781c39ef",
        "name": "Nt",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 51_882,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 51_890
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 52_037,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Nt"
      },
      "helper04": {
        "start": 5_722_821,
        "end": 5_722_915,
        "bytes": 94,
        "sha256": "abb6438061592a9efefd9348a3ed56cdba1765bfbbab407be4c305b24e875cee",
        "name": "ei",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 33_222,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 33_226
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 33_304,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "ei"
      },
      "helper05": {
        "start": 1_690_067,
        "end": 1_690_130,
        "bytes": 63,
        "sha256": "9fa1feeef4b811772018776fa3deb8345f3c2e0133e38798fbbf1446cd832afa",
        "name": "Tt",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 58,
        "columnNumber": 51_449,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 58,
            "columnNumber": 51_462,
            "type": "call"
          },
          "returned": {
            "lineNumber": 58,
            "columnNumber": 51_500,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Tt"
      },
      "helper06": {
        "start": 5_737_780,
        "end": 5_737_812,
        "bytes": 32,
        "sha256": "742e4384d6eb46084518ee8477590326f0fa623a32f6619671b369d66afe01d3",
        "name": "HTe",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 48_170,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 48_173
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 48_202,
            "type": "return"
          }
        },
        "sourceKind": "ArrowFunctionExpression",
        "binding": "HTe"
      },
      "helper07": {
        "start": 5_737_813,
        "end": 5_737_948,
        "bytes": 135,
        "sha256": "26bce44c97338878f4ef84ca17ed2bbcb08b398fa97b0917a5f0360fda65dff9",
        "name": "eee",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 48_215,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 48_219
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 48_337,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "eee"
      },
      "helper08": {
        "start": 5_741_187,
        "end": 5_741_441,
        "bytes": 254,
        "sha256": "1738dbe434033087e1b2590e989ea25b165abb8cee3b26815948a17ff826da04",
        "name": "Hn",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 51_588,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 51_592
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 51_830,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Hn"
      },
      "helper09": {
        "start": 5_737_231,
        "end": 5_737_293,
        "bytes": 62,
        "sha256": "8f18916e78c35ded8a0fb766772f1dd67412aa1493f2d8560a1dfb7eab02f729",
        "name": "Fm",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 3697,
        "columnNumber": 47_632,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 3697,
            "columnNumber": 47_648,
            "type": "call"
          },
          "returned": {
            "lineNumber": 3697,
            "columnNumber": 47_682,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Fm"
      },
      "helper10": {
        "start": 1_684_676,
        "end": 1_684_757,
        "bytes": 81,
        "sha256": "52cb127bdff47616e75e2cbcfa19c915975e399b6ca6b7d6570483a40a5b6353",
        "name": "Gc",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 58,
        "columnNumber": 46_058,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 58,
            "columnNumber": 46_062
          },
          "returned": {
            "lineNumber": 58,
            "columnNumber": 46_127,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Gc"
      },
      "helper11": {
        "start": 1_684_359,
        "end": 1_684_531,
        "bytes": 172,
        "sha256": "947fbc4b2aa001577d2bac39911fca2dcc0c287e3d2308c9dfd476c055fd322d",
        "name": "VR",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 58,
        "columnNumber": 45_741,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 58,
            "columnNumber": 45_763
          },
          "returned": {
            "lineNumber": 58,
            "columnNumber": 45_901,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "VR"
      }
    },
    "classes": {},
    "literals": {
      "lc": {
        "start": 1_689_787,
        "end": 1_689_790,
        "bytes": 3,
        "sha256": "080390646b2497878dd1321ed9780c229a3d08ac5b158117f943d92e225425f7",
        "value": "_"
      },
      "Wy": {
        "start": 1_673_369,
        "end": 1_673_372,
        "bytes": 3,
        "sha256": "2f7a37a63ead3743c2213ecd5c22e5ffbbde2570159274e7bc0a97c6ba52b0b6",
        "value": "@"
      },
      "uW": {
        "start": 1_684_538,
        "end": 1_684_541,
        "bytes": 3,
        "sha256": "2f7a37a63ead3743c2213ecd5c22e5ffbbde2570159274e7bc0a97c6ba52b0b6",
        "value": "@"
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "rows": {
      "helper00": {
        "start": 1_326_130,
        "end": 1_326_342,
        "bytes": 212,
        "sha256": "b4c907099cd798b38c374a3e19dcf61acd6749306c6cbfa410475b0c2e3eced2",
        "name": "ft",
        "arity": 2,
        "constructible": false,
        "className": "AsyncFunction",
        "lineNumber": 532,
        "columnNumber": 4697,
        "parentType": "object",
        "parentClassName": "AsyncFunction",
        "parentDescription": "AsyncFunction",
        "points": {
          "entry": {
            "lineNumber": 532,
            "columnNumber": 4703
          },
          "returned": {
            "lineNumber": 532,
            "columnNumber": 4891,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "ft"
      },
      "helper01": {
        "start": 1_325_915,
        "end": 1_326_130,
        "bytes": 215,
        "sha256": "a4137ea1ab5e11b08b7e04347b14f0ccd835ddf8c93fa2e1324b4e0aa1e87ac5",
        "name": "V",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 532,
        "columnNumber": 4475,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 532,
            "columnNumber": 4481
          },
          "returned": {
            "lineNumber": 532,
            "columnNumber": 4679,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "V"
      },
      "helper02": {
        "start": 6_449_074,
        "end": 6_449_115,
        "bytes": 41,
        "sha256": "918aa3a2089278879e6c6efeeb862c397de88877dcebc330b7995a9ec2a88e8b",
        "name": "oi",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 244_867,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 244_871
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 244_896,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "oi"
      },
      "helper03": {
        "start": 6_452_607,
        "end": 6_452_774,
        "bytes": 167,
        "sha256": "244700f380d6be5846daa39aa4076355a29fbd8d33b482ebb23fffd9c55e2d2c",
        "name": "Nt",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 248_400,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 248_408
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 248_555,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Nt"
      },
      "helper04": {
        "start": 6_433_943,
        "end": 6_434_037,
        "bytes": 94,
        "sha256": "3b638fda6c083e1e4e26aa4ba3866637b01ad813f682acf2e08a83ea3872a96a",
        "name": "ti",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 229_736,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 229_740
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 229_818,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "ti"
      },
      "helper05": {
        "start": 6_423_993,
        "end": 6_424_056,
        "bytes": 63,
        "sha256": "8923971fcc9968670805226cc8d5e0829b803ba97c75f814c0c604dd76f60ac5",
        "name": "Tt",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 219_786,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 219_799,
            "type": "call"
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 219_837,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Tt"
      },
      "helper06": {
        "start": 6_448_906,
        "end": 6_448_938,
        "bytes": 32,
        "sha256": "9ba992a0474d6da7197a87f78cdd54e65d0cf2bc6eea95df3604272f27639011",
        "name": "W2e",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 244_688,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 244_691
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 244_720,
            "type": "return"
          }
        },
        "sourceKind": "ArrowFunctionExpression",
        "binding": "W2e"
      },
      "helper07": {
        "start": 6_448_939,
        "end": 6_449_074,
        "bytes": 135,
        "sha256": "d88b5f691097809e02daf2d9d13fddf97215ecefa1e7f5409e179cbaa62103b2",
        "name": "Uee",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 244_733,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 244_737
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 244_855,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Uee"
      },
      "helper08": {
        "start": 6_452_313,
        "end": 6_452_567,
        "bytes": 254,
        "sha256": "85bcb363e8b43d13f980544fb2d0bd50b3510e719115fa953dc42db46d2675cd",
        "name": "Hn",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 248_106,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 248_110
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 248_348,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Hn"
      },
      "helper09": {
        "start": 6_448_357,
        "end": 6_448_419,
        "bytes": 62,
        "sha256": "bc64c7b09a5327a885d037dd8ed7531ca4b93f78ab48605e32ce5ee79f2447ed",
        "name": "Hg",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 244_150,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 244_166,
            "type": "call"
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 244_200,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Hg"
      },
      "helper10": {
        "start": 6_423_727,
        "end": 6_423_809,
        "bytes": 82,
        "sha256": "05235dd72759900bd9fd222f08a37d1ae93aeb1ae50a3fcd51e2410056cadb64",
        "name": "jc",
        "arity": 1,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 219_520,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 219_524
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 219_590,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "jc"
      },
      "helper11": {
        "start": 6_423_407,
        "end": 6_423_579,
        "bytes": 172,
        "sha256": "3b9a2559a2e5891fa02722a5b1e8904ecd27e51ebb0cb49b822304874cba163f",
        "name": "Mk",
        "arity": 2,
        "constructible": true,
        "className": "Function",
        "lineNumber": 4331,
        "columnNumber": 219_200,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 4331,
            "columnNumber": 219_222
          },
          "returned": {
            "lineNumber": 4331,
            "columnNumber": 219_360,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration",
        "binding": "Mk"
      }
    },
    "classes": {},
    "literals": {
      "lc": {
        "start": 1_890_392,
        "end": 1_890_395,
        "bytes": 3,
        "sha256": "080390646b2497878dd1321ed9780c229a3d08ac5b158117f943d92e225425f7",
        "value": "_"
      },
      "zy": {
        "start": 1_856_804,
        "end": 1_856_807,
        "bytes": 3,
        "sha256": "2f7a37a63ead3743c2213ecd5c22e5ffbbde2570159274e7bc0a97c6ba52b0b6",
        "value": "@"
      },
      "Ree": {
        "start": 6_423_587,
        "end": 6_423_590,
        "bytes": 3,
        "sha256": "2f7a37a63ead3743c2213ecd5c22e5ffbbde2570159274e7bc0a97c6ba52b0b6",
        "value": "@"
      }
    }
  },
  {
    "variant": 2,
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "rows": {
      "registryLookup": {
        "start": 15_089_709,
        "end": 15_089_783,
        "bytes": 74,
        "sha256": "1264a92f206dc890da07f816a5ab42b5da1a14337d6b4c6184669ba08ea86b52",
        "name": "Zst",
        "arity": 0,
        "constructible": true,
        "className": "Function",
        "lineNumber": 1913,
        "columnNumber": 203_738,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1913,
            "columnNumber": 203_769
          },
          "returned": {
            "lineNumber": 1913,
            "columnNumber": 203_799,
            "type": "return"
          }
        },
        "sourceKind": "FunctionDeclaration"
      },
      "registryGet": {
        "start": 15_075_806,
        "end": 15_075_836,
        "bytes": 30,
        "sha256": "70760cba7f52cb2e35e66b59200643029a8e27d2ba2b4e7aa28908b659df4538",
        "name": "get",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1913,
        "columnNumber": 189_826,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1913,
            "columnNumber": 189_842
          },
          "returned": {
            "lineNumber": 1913,
            "columnNumber": 189_852,
            "type": "return"
          }
        },
        "sourceKind": "method"
      },
      "registryGetInstance": {
        "start": 15_076_136,
        "end": 15_076_201,
        "bytes": 65,
        "sha256": "df0a52bde81213a4e0d959bf3dc7f39f8913738296d5927d6755cbf082cb9aa6",
        "name": "getInstance",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1913,
        "columnNumber": 190_164,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1913,
            "columnNumber": 190_167
          },
          "returned": {
            "lineNumber": 1913,
            "columnNumber": 190_217,
            "type": "return"
          }
        },
        "sourceKind": "method"
      },
      "localeCurr": {
        "start": 8_089_574,
        "end": 8_089_603,
        "bytes": 29,
        "sha256": "09134fe14272f718f4a6a0e610acd71f8b86375cc90d4369412c59f93f617c44",
        "name": "get curr",
        "arity": 0,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1172,
        "columnNumber": 1_832_918,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1172,
            "columnNumber": 1_832_933
          },
          "returned": {
            "lineNumber": 1172,
            "columnNumber": 1_832_938,
            "type": "return"
          }
        },
        "sourceKind": "getter"
      },
      "localeBrand": {
        "start": 8_095_038,
        "end": 8_095_617,
        "bytes": 633,
        "sha256": "4943fb0ca91eb34b760cc2607de20ef7b48d4b9c5b03b81ba932db844196f24c",
        "name": "replaceWordsECAD",
        "arity": 1,
        "constructible": false,
        "className": "Function",
        "lineNumber": 1172,
        "columnNumber": 1_838_390,
        "parentType": "function",
        "parentClassName": "Function",
        "parentDescription": "function () { [native code] }",
        "points": {
          "entry": {
            "lineNumber": 1172,
            "columnNumber": 1_838_394
          },
          "returned": {
            "lineNumber": 1172,
            "columnNumber": 1_838_952,
            "type": "return"
          }
        },
        "sourceKind": "method"
      }
    },
    "classes": {
      "registry": {
        "start": 15_076_107,
        "end": 15_076_224,
        "bytes": 117,
        "sha256": "3ee38dcdf0e97d4d587852b8fb7f8eaf455a1887b58ff1d361dadf55e9712a1a"
      },
      "registryBase": {
        "start": 15_075_499,
        "end": 15_076_098,
        "bytes": 599,
        "sha256": "2e38189126a4832784d527b92db856d3d8db3645c9ca040b9e2408705e3caefe"
      }
    },
    "literals": {}
  }
] as const);
export type CurrentSchematicWireServiceRole=keyof typeof CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE[0]["rows"]|keyof typeof CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE[2]["rows"];
interface Span extends CurrentSchematicWireFunctionMetadataProfile {readonly start:number;readonly end:number}
function need(value:boolean):asserts value{if(!value){throw new Error("SCHEMATIC_WIRE_SERVICE_SOURCE");}}
export function qualifyCurrentSchematicWireServiceSource(input:unknown):0|1|2{
 const variant=qualify(input);const text:unknown=Object.getOwnPropertyDescriptor(input,"scriptSource")?.value;need(typeof text==="string");
 const profile=CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE[variant];
 type FixedSpan=Readonly<{start:number;end:number;bytes:number;sha256:string}>;
 const rows:Readonly<Record<string,FixedSpan>>=profile.rows;
 const classes:Readonly<Record<string,FixedSpan>>=profile.classes;
 const literals:Readonly<Record<string,FixedSpan>>=profile.literals;
 for(const row of[...Object.values(rows),...Object.values(classes),...Object.values(literals)]){
  const actual=text.slice(row.start,row.end);need(Buffer.byteLength(actual)===row.bytes&&createHash("sha256").update(actual).digest("hex")===row.sha256);
 }
 return variant;
}
export function currentSchematicWireServiceSourceRow(variant:0|1|2,role:CurrentSchematicWireServiceRole):Span{
 need(!Object.is(variant,-0));z.union([z.literal(0),z.literal(1),z.literal(2)]).parse(variant);
 const rows:Readonly<Record<string,Span>>=CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE[variant].rows;need(Object.hasOwn(rows,role));const row=rows[role];need(row!==undefined);return row;
}
export function decodeCurrentSchematicWireServiceFunction(input:unknown,actual:unknown,variant:0|1|2,role:CurrentSchematicWireServiceRole,scriptId:string):CurrentSchematicWireCompletionFunction{
 return compare(input,actual,currentSchematicWireServiceSourceRow(variant,role),scriptId);
}
