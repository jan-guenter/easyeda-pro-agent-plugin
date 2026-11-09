/** Actual selected manager/handler/echo callees. These source facts alone
 * prove neither delivery nor receiver, publication, model or task settlement. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NOECHO_CALLEE_SOURCE=freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "consistencyForwardUpload": {
        "start": 4_460_495,
        "end": 4_460_574,
        "name": "handleUpload",
        "kind": "method",
        "arity": 0,
        "bytes": 79,
        "sha256": "cf544f176997471961d783506eeeed3462aee953ba7ebebf3cd8baefb762eb80",
        "lineNumber": 3614,
        "columnNumber": 25_379
      },
      "handlerUpload": {
        "start": 4_454_800,
        "end": 4_454_922,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 122,
        "sha256": "4ccb9d1eb542cf466699493bbecc70fed27c39fdcdd02e9d10a8d4ee9878fc6b",
        "lineNumber": 3614,
        "columnNumber": 19_672
      },
      "handlerAddTask": {
        "start": 4_454_996,
        "end": 4_455_058,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 62,
        "sha256": "0c558f3368821ddbe2bfbb480ed93e35e26190085afc25e897480f4d06c45771",
        "lineNumber": 3614,
        "columnNumber": 19_868
      },
      "handlerSetSourceType": {
        "start": 4_455_086,
        "end": 4_455_161,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 75,
        "sha256": "928a385dba5c7b9c09f83c878e61ffd58b03ef375db6f7c6377b8fd03c0a92aa",
        "lineNumber": 3614,
        "columnNumber": 19_958
      },
      "taskUpload": {
        "start": 4_452_723,
        "end": 4_452_880,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 157,
        "sha256": "b06a2de04d9cc27eea8810e5dfce35f4570377b46f39a498e81f4e1d23d15083",
        "lineNumber": 3614,
        "columnNumber": 17_595
      },
      "taskAddTask": {
        "start": 4_453_216,
        "end": 4_453_574,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 358,
        "sha256": "2c2fd0eb14b920ff68779485fa61ecc66b42d65def8fd0fbf98d6cd6e33fec54",
        "lineNumber": 3614,
        "columnNumber": 18_088
      },
      "taskAddOrUpdate": {
        "start": 4_452_900,
        "end": 4_453_062,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 162,
        "sha256": "66e96fdf8037993361ad6c2e1a12838fdffdbed1f2019b81a71671da7200ea7a",
        "lineNumber": 3614,
        "columnNumber": 17_772
      },
      "handlerDocument": {
        "start": 4_452_245,
        "end": 4_452_301,
        "name": "get docManager",
        "kind": "getter",
        "arity": 0,
        "bytes": 56,
        "sha256": "d6d2d348ee0cbeac455770bedf3a213fb8d1159231a3a1659dcf4cf8146db8cd",
        "lineNumber": 3614,
        "columnNumber": 17_131
      },
      "projectHistory": {
        "start": 5_921_737,
        "end": 5_921_780,
        "name": "get isHistoryMode",
        "kind": "getter",
        "arity": 0,
        "bytes": 43,
        "sha256": "e53bd3f23e901cb59fda5e089f1561a8e18bf20c02bdaf637df2b0d2c61ecddb",
        "lineNumber": 3697,
        "columnNumber": 232_144
      },
      "managerLocalChange": {
        "start": 804_329,
        "end": 804_652,
        "name": "localChange",
        "kind": "method",
        "arity": 1,
        "bytes": 323,
        "sha256": "43feab5bc0667ea46281334143f969e2b12ce4e5d71e8afe6999c789a3d804b5",
        "lineNumber": 30,
        "columnNumber": 48_106
      },
      "managerGetOrderNum": {
        "start": 452_084,
        "end": 452_126,
        "name": "getOrderNum",
        "kind": "method",
        "arity": 1,
        "bytes": 42,
        "sha256": "7c292e5b2ee230a00fc1378d64884204a92118f621098b836ce253e28d519abd",
        "lineNumber": 10,
        "columnNumber": 21_319
      },
      "managerGetMaxNum": {
        "start": 452_210,
        "end": 452_305,
        "name": "getMaxNum",
        "kind": "method",
        "arity": 1,
        "bytes": 95,
        "sha256": "dd1460b712a82a8cee5d9743943a819dc4b7b2246961dbdec26ccc2f05b1edb8",
        "lineNumber": 10,
        "columnNumber": 21_443
      },
      "managerSetMaxNum": {
        "start": 452_126,
        "end": 452_210,
        "name": "setMaxNum",
        "kind": "method",
        "arity": 3,
        "bytes": 84,
        "sha256": "dd23c431e54bc659c524946ca272f7718eb05a9d5cfb424fda70c90f87e1ab95",
        "lineNumber": 10,
        "columnNumber": 21_359
      },
      "managerOnTextNum": {
        "start": 4_412_269,
        "end": 4_412_316,
        "name": "onTextNum",
        "kind": "method",
        "arity": 2,
        "bytes": 47,
        "sha256": "4e3758926b0bc3a81145c18c3d713e3e9f683f5b4b114c7fd6138fb9e1d7b4fe",
        "lineNumber": 3613,
        "columnNumber": 98_663
      },
      "handlerNumberChange": {
        "start": 4_457_437,
        "end": 4_457_472,
        "name": "",
        "kind": "arrow",
        "arity": 0,
        "bytes": 35,
        "sha256": "1afbeef4c3c6692d12ffdaf685321561fd04816331df84461ac3cce8fef23a9f",
        "lineNumber": 3614,
        "columnNumber": 22_309
      },
      "managerOrderNum": {
        "start": 785_280,
        "end": 786_174,
        "name": "onOrderNum",
        "kind": "method",
        "arity": 3,
        "bytes": 894,
        "sha256": "9f12f81f19788f91034e3e1434f123b1c05bb88c74be6e82acd09de857ad5d2a",
        "lineNumber": 30,
        "columnNumber": 29_056
      },
      "managerNumberChange": {
        "start": 4_412_992,
        "end": 4_413_065,
        "name": "onNumberChange",
        "kind": "method",
        "arity": 3,
        "bytes": 73,
        "sha256": "555771613911fc517ae8de5575a69e1a7ba2638bdb35ebea8fc0b04a1186c0a0",
        "lineNumber": 3613,
        "columnNumber": 99_391
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "consistencyForwardUpload": {
        "start": 4_683_264,
        "end": 4_683_343,
        "name": "handleUpload",
        "kind": "method",
        "arity": 0,
        "bytes": 79,
        "sha256": "cf544f176997471961d783506eeeed3462aee953ba7ebebf3cd8baefb762eb80",
        "lineNumber": 4113,
        "columnNumber": 25_379
      },
      "handlerUpload": {
        "start": 4_677_569,
        "end": 4_677_691,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 122,
        "sha256": "4ccb9d1eb542cf466699493bbecc70fed27c39fdcdd02e9d10a8d4ee9878fc6b",
        "lineNumber": 4113,
        "columnNumber": 19_672
      },
      "handlerAddTask": {
        "start": 4_677_765,
        "end": 4_677_827,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 62,
        "sha256": "0c558f3368821ddbe2bfbb480ed93e35e26190085afc25e897480f4d06c45771",
        "lineNumber": 4113,
        "columnNumber": 19_868
      },
      "handlerSetSourceType": {
        "start": 4_677_855,
        "end": 4_677_930,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 75,
        "sha256": "928a385dba5c7b9c09f83c878e61ffd58b03ef375db6f7c6377b8fd03c0a92aa",
        "lineNumber": 4113,
        "columnNumber": 19_958
      },
      "taskUpload": {
        "start": 4_675_492,
        "end": 4_675_649,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 157,
        "sha256": "b06a2de04d9cc27eea8810e5dfce35f4570377b46f39a498e81f4e1d23d15083",
        "lineNumber": 4113,
        "columnNumber": 17_595
      },
      "taskAddTask": {
        "start": 4_675_985,
        "end": 4_676_343,
        "name": "",
        "kind": "arrow",
        "arity": 2,
        "bytes": 358,
        "sha256": "2c2fd0eb14b920ff68779485fa61ecc66b42d65def8fd0fbf98d6cd6e33fec54",
        "lineNumber": 4113,
        "columnNumber": 18_088
      },
      "taskAddOrUpdate": {
        "start": 4_675_669,
        "end": 4_675_831,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 162,
        "sha256": "66e96fdf8037993361ad6c2e1a12838fdffdbed1f2019b81a71671da7200ea7a",
        "lineNumber": 4113,
        "columnNumber": 17_772
      },
      "handlerDocument": {
        "start": 4_675_014,
        "end": 4_675_070,
        "name": "get docManager",
        "kind": "getter",
        "arity": 0,
        "bytes": 56,
        "sha256": "d6d2d348ee0cbeac455770bedf3a213fb8d1159231a3a1659dcf4cf8146db8cd",
        "lineNumber": 4113,
        "columnNumber": 17_131
      },
      "projectHistory": {
        "start": 5_904_450,
        "end": 5_904_493,
        "name": "get isHistoryMode",
        "kind": "getter",
        "arity": 0,
        "bytes": 43,
        "sha256": "e53bd3f23e901cb59fda5e089f1561a8e18bf20c02bdaf637df2b0d2c61ecddb",
        "lineNumber": 4195,
        "columnNumber": 170_521
      },
      "managerLocalChange": {
        "start": 1_827_741,
        "end": 1_828_064,
        "name": "localChange",
        "kind": "method",
        "arity": 1,
        "bytes": 323,
        "sha256": "43feab5bc0667ea46281334143f969e2b12ce4e5d71e8afe6999c789a3d804b5",
        "lineNumber": 556,
        "columnNumber": 48_106
      },
      "managerGetOrderNum": {
        "start": 1_475_496,
        "end": 1_475_538,
        "name": "getOrderNum",
        "kind": "method",
        "arity": 1,
        "bytes": 42,
        "sha256": "7c292e5b2ee230a00fc1378d64884204a92118f621098b836ce253e28d519abd",
        "lineNumber": 536,
        "columnNumber": 21_319
      },
      "managerGetMaxNum": {
        "start": 1_475_622,
        "end": 1_475_717,
        "name": "getMaxNum",
        "kind": "method",
        "arity": 1,
        "bytes": 95,
        "sha256": "dd1460b712a82a8cee5d9743943a819dc4b7b2246961dbdec26ccc2f05b1edb8",
        "lineNumber": 536,
        "columnNumber": 21_443
      },
      "managerSetMaxNum": {
        "start": 1_475_538,
        "end": 1_475_622,
        "name": "setMaxNum",
        "kind": "method",
        "arity": 3,
        "bytes": 84,
        "sha256": "dd23c431e54bc659c524946ca272f7718eb05a9d5cfb424fda70c90f87e1ab95",
        "lineNumber": 536,
        "columnNumber": 21_359
      },
      "managerOnTextNum": {
        "start": 4_635_038,
        "end": 4_635_085,
        "name": "onTextNum",
        "kind": "method",
        "arity": 2,
        "bytes": 47,
        "sha256": "4e3758926b0bc3a81145c18c3d713e3e9f683f5b4b114c7fd6138fb9e1d7b4fe",
        "lineNumber": 4112,
        "columnNumber": 96_071
      },
      "handlerNumberChange": {
        "start": 4_680_206,
        "end": 4_680_241,
        "name": "",
        "kind": "arrow",
        "arity": 0,
        "bytes": 35,
        "sha256": "1afbeef4c3c6692d12ffdaf685321561fd04816331df84461ac3cce8fef23a9f",
        "lineNumber": 4113,
        "columnNumber": 22_309
      },
      "managerOrderNum": {
        "start": 1_808_692,
        "end": 1_809_586,
        "name": "onOrderNum",
        "kind": "method",
        "arity": 3,
        "bytes": 894,
        "sha256": "9f12f81f19788f91034e3e1434f123b1c05bb88c74be6e82acd09de857ad5d2a",
        "lineNumber": 556,
        "columnNumber": 29_056
      },
      "managerNumberChange": {
        "start": 4_635_761,
        "end": 4_635_834,
        "name": "onNumberChange",
        "kind": "method",
        "arity": 3,
        "bytes": 73,
        "sha256": "555771613911fc517ae8de5575a69e1a7ba2638bdb35ebea8fc0b04a1186c0a0",
        "lineNumber": 4112,
        "columnNumber": 96_799
      }
    }
  }
] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_NOECHO_CALLEE_ROLES=Object.freeze(["consistencyForwardUpload", "handlerUpload", "handlerAddTask", "handlerSetSourceType", "taskUpload", "taskAddTask", "taskAddOrUpdate", "handlerDocument", "projectHistory", "managerLocalChange", "managerGetOrderNum", "managerGetMaxNum", "managerSetMaxNum", "managerOnTextNum", "handlerNumberChange", "managerOrderNum", "managerNumberChange"] as const);
export type CurrentSchematicRelevanceNoEchoCalleeRole=typeof CURRENT_SCHEMATIC_RELEVANCE_NOECHO_CALLEE_ROLES[number];
export function qualifyCurrentSchematicRelevanceNoEchoCalleeSource(source:string):0|1{if(!source.isWellFormed()){throw new Error("SCH_NOECHO_SOURCE_ENCODING");}const bytes=Buffer.byteLength(source);const sha256=createHash("sha256").update(source).digest("hex");for(const profile of CURRENT_SCHEMATIC_RELEVANCE_NOECHO_CALLEE_SOURCE){if(profile.bytes===bytes&&profile.sha256===sha256){for(const role of CURRENT_SCHEMATIC_RELEVANCE_NOECHO_CALLEE_ROLES){const row=profile.roles[role];const value=source.slice(row.start,row.end);if(Buffer.byteLength(value)!==row.bytes||createHash("sha256").update(value).digest("hex")!==row.sha256){throw new Error("SCH_NOECHO_SOURCE_SPAN");}}return profile.variant;}}throw new Error("SCH_NOECHO_SOURCE_PIN");}
