/** Exact normal-history completion callees. These source facts authorize no
 * command update, record, callback, setter or event dispatch. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "roles": {
      "commandCanRecordGet": {
        "start": 1_803_445,
        "end": 1_803_507,
        "name": "get canRecord",
        "kind": "getter",
        "arity": 0,
        "bytes": 62,
        "sha256": "4e84068101f58e401971593ff80e7c745d56e2eb1a43443a7686aa52baf7e102",
        "lineNumber": 59,
        "columnNumber": 86_915
      },
      "historyRecord": {
        "start": 3_971_944,
        "end": 3_972_212,
        "name": "_record",
        "kind": "method",
        "arity": 1,
        "bytes": 268,
        "sha256": "e234e39e848fa0c5ed3fcaa04d1ea4b18d15eb593e731a160d37d384ce66a988",
        "lineNumber": 3606,
        "columnNumber": 305_067
      },
      "historyClearRecordsCore": {
        "start": 3_972_343,
        "end": 3_972_487,
        "name": "clearRecordsCore",
        "kind": "method",
        "arity": 0,
        "bytes": 144,
        "sha256": "0e84b51dd099240cccbd3f2deed6fac7f88a83a7a8a5423fbee17e6b714fa621",
        "lineNumber": 3606,
        "columnNumber": 305_475
      },
      "historyStatusGet": {
        "start": 3_969_439,
        "end": 3_969_502,
        "name": "get status",
        "kind": "getter",
        "arity": 0,
        "bytes": 63,
        "sha256": "344683d3d402a546670939093660ce011cb78810c5188630b4383ee11e36310c",
        "lineNumber": 3606,
        "columnNumber": 302_565
      },
      "historyCanRedoBaseGet": {
        "start": 3_969_341,
        "end": 3_969_390,
        "name": "get canRedo",
        "kind": "getter",
        "arity": 0,
        "bytes": 49,
        "sha256": "3cd9f44f23afb62923daf6297c15fd602ef507dd4c90cd535e3277183ae8f7e4",
        "lineNumber": 3606,
        "columnNumber": 302_468
      },
      "historyCanUndoBaseGet": {
        "start": 3_969_390,
        "end": 3_969_439,
        "name": "get canUndo",
        "kind": "getter",
        "arity": 0,
        "bytes": 49,
        "sha256": "cfe4b1c3176f29fbb7e5598622d298dc3ec80719da38c0f3ef70d44140a5a888",
        "lineNumber": 3606,
        "columnNumber": 302_517
      },
      "historyCanRedoGet": {
        "start": 3_973_736,
        "end": 3_973_826,
        "name": "get canRedo",
        "kind": "getter",
        "arity": 0,
        "bytes": 90,
        "sha256": "8864f77cd727886f96d17f955f09c4483cabb7f1a1040c18d1edfacb0d507bce",
        "lineNumber": 3606,
        "columnNumber": 306_863
      },
      "historyCanUndoGet": {
        "start": 3_973_826,
        "end": 3_973_916,
        "name": "get canUndo",
        "kind": "getter",
        "arity": 0,
        "bytes": 90,
        "sha256": "52ceba4a0a5f0c69346245303f6bdae131ab782ee7c62360869b8e5273008ead",
        "lineNumber": 3606,
        "columnNumber": 306_953
      },
      "groupForEach": {
        "start": 3_972_664,
        "end": 3_972_788,
        "name": "forEach",
        "kind": "method",
        "arity": 1,
        "bytes": 124,
        "sha256": "bd7c3ddace60a478877ad1c1238232c402a750cbccbc779c9c74842c7b5e6a8c",
        "lineNumber": 3606,
        "columnNumber": 305_787
      },
      "groupRemove": {
        "start": 3_972_858,
        "end": 3_972_893,
        "name": "remove",
        "kind": "method",
        "arity": 1,
        "bytes": 35,
        "sha256": "6f2844b493e158e9393bb91f6d8df6e54a7a92ce196d3bc0f54903cf0c591e0c",
        "lineNumber": 3606,
        "columnNumber": 305_980
      },
      "groupSizeGet": {
        "start": 3_972_893,
        "end": 3_972_931,
        "name": "get size",
        "kind": "getter",
        "arity": 0,
        "bytes": 38,
        "sha256": "fd0bac3a7daff80a64c1fac3496f76a78ef9e4e24254821f3b2033676e1e852a",
        "lineNumber": 3606,
        "columnNumber": 306_017
      },
      "stackWillRecord": {
        "start": 3_975_173,
        "end": 3_975_285,
        "name": "",
        "kind": "arrow",
        "arity": 0,
        "bytes": 112,
        "sha256": "24dffbb95a095a7913723176f9a39866470401c2ef1ca9d4db0b2f91149fc513",
        "lineNumber": 3606,
        "columnNumber": 308_289
      },
      "stackVisitCommand": {
        "start": 3_975_206,
        "end": 3_975_283,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 77,
        "sha256": "950e0481aad6c46282d7da0abd58bb4f9427ae86cfcb8db003d456ca03d054ca",
        "lineNumber": 3606,
        "columnNumber": 308_322
      },
      "willRecordTab": {
        "start": 3_976_283,
        "end": 3_976_421,
        "name": "",
        "kind": "arrow",
        "arity": 0,
        "bytes": 138,
        "sha256": "a2a5b982fd56fa11e9dea808690eee616f410c43ebc9d4bb1df1aee365d6ef12",
        "lineNumber": 3606,
        "columnNumber": 309_399
      },
      "positionAttributeVisit": {
        "start": 1_805_117,
        "end": 1_805_267,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 150,
        "sha256": "829fe88c7c0e1b995aca8c8b34536e67c52d3cac09105649e9fd65b91e6c4c5b",
        "lineNumber": 59,
        "columnNumber": 88_574
      }
    }
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "roles": {
      "commandCanRecordGet": {
        "start": 6_278_304,
        "end": 6_278_366,
        "name": "get canRecord",
        "kind": "getter",
        "arity": 0,
        "bytes": 62,
        "sha256": "831d94edc57dcad85f034e47bd43c91d4eda173d8bacf36ba3500c9bece0cfd0",
        "lineNumber": 4331,
        "columnNumber": 74_099
      },
      "historyRecord": {
        "start": 4_179_145,
        "end": 4_179_413,
        "name": "_record",
        "kind": "method",
        "arity": 1,
        "bytes": 268,
        "sha256": "e234e39e848fa0c5ed3fcaa04d1ea4b18d15eb593e731a160d37d384ce66a988",
        "lineNumber": 4105,
        "columnNumber": 170_535
      },
      "historyClearRecordsCore": {
        "start": 4_179_544,
        "end": 4_179_688,
        "name": "clearRecordsCore",
        "kind": "method",
        "arity": 0,
        "bytes": 144,
        "sha256": "0e84b51dd099240cccbd3f2deed6fac7f88a83a7a8a5423fbee17e6b714fa621",
        "lineNumber": 4105,
        "columnNumber": 170_943
      },
      "historyStatusGet": {
        "start": 4_176_640,
        "end": 4_176_703,
        "name": "get status",
        "kind": "getter",
        "arity": 0,
        "bytes": 63,
        "sha256": "344683d3d402a546670939093660ce011cb78810c5188630b4383ee11e36310c",
        "lineNumber": 4105,
        "columnNumber": 168_033
      },
      "historyCanRedoBaseGet": {
        "start": 4_176_542,
        "end": 4_176_591,
        "name": "get canRedo",
        "kind": "getter",
        "arity": 0,
        "bytes": 49,
        "sha256": "3cd9f44f23afb62923daf6297c15fd602ef507dd4c90cd535e3277183ae8f7e4",
        "lineNumber": 4105,
        "columnNumber": 167_936
      },
      "historyCanUndoBaseGet": {
        "start": 4_176_591,
        "end": 4_176_640,
        "name": "get canUndo",
        "kind": "getter",
        "arity": 0,
        "bytes": 49,
        "sha256": "cfe4b1c3176f29fbb7e5598622d298dc3ec80719da38c0f3ef70d44140a5a888",
        "lineNumber": 4105,
        "columnNumber": 167_985
      },
      "historyCanRedoGet": {
        "start": 4_180_937,
        "end": 4_181_027,
        "name": "get canRedo",
        "kind": "getter",
        "arity": 0,
        "bytes": 90,
        "sha256": "8864f77cd727886f96d17f955f09c4483cabb7f1a1040c18d1edfacb0d507bce",
        "lineNumber": 4105,
        "columnNumber": 172_331
      },
      "historyCanUndoGet": {
        "start": 4_181_027,
        "end": 4_181_117,
        "name": "get canUndo",
        "kind": "getter",
        "arity": 0,
        "bytes": 90,
        "sha256": "52ceba4a0a5f0c69346245303f6bdae131ab782ee7c62360869b8e5273008ead",
        "lineNumber": 4105,
        "columnNumber": 172_421
      },
      "groupForEach": {
        "start": 4_179_865,
        "end": 4_179_989,
        "name": "forEach",
        "kind": "method",
        "arity": 1,
        "bytes": 124,
        "sha256": "bd7c3ddace60a478877ad1c1238232c402a750cbccbc779c9c74842c7b5e6a8c",
        "lineNumber": 4105,
        "columnNumber": 171_255
      },
      "groupRemove": {
        "start": 4_180_059,
        "end": 4_180_094,
        "name": "remove",
        "kind": "method",
        "arity": 1,
        "bytes": 35,
        "sha256": "6f2844b493e158e9393bb91f6d8df6e54a7a92ce196d3bc0f54903cf0c591e0c",
        "lineNumber": 4105,
        "columnNumber": 171_448
      },
      "groupSizeGet": {
        "start": 4_180_094,
        "end": 4_180_132,
        "name": "get size",
        "kind": "getter",
        "arity": 0,
        "bytes": 38,
        "sha256": "fd0bac3a7daff80a64c1fac3496f76a78ef9e4e24254821f3b2033676e1e852a",
        "lineNumber": 4105,
        "columnNumber": 171_485
      },
      "stackWillRecord": {
        "start": 4_182_374,
        "end": 4_182_486,
        "name": "",
        "kind": "arrow",
        "arity": 0,
        "bytes": 112,
        "sha256": "237ffd69a26749180f7eeebb30bd51a0d189a2ee1c15dacfd608ba447ef867f6",
        "lineNumber": 4105,
        "columnNumber": 173_757
      },
      "stackVisitCommand": {
        "start": 4_182_407,
        "end": 4_182_484,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 77,
        "sha256": "6fd497a97dd363599883a0f45b9a544f872d13532911cf0adce1b70ffbaa35e2",
        "lineNumber": 4105,
        "columnNumber": 173_790
      },
      "willRecordTab": {
        "start": 4_183_484,
        "end": 4_183_622,
        "name": "",
        "kind": "arrow",
        "arity": 0,
        "bytes": 138,
        "sha256": "a2a5b982fd56fa11e9dea808690eee616f410c43ebc9d4bb1df1aee365d6ef12",
        "lineNumber": 4105,
        "columnNumber": 174_867
      },
      "positionAttributeVisit": {
        "start": 6_279_976,
        "end": 6_280_126,
        "name": "",
        "kind": "arrow",
        "arity": 1,
        "bytes": 150,
        "sha256": "829fe88c7c0e1b995aca8c8b34536e67c52d3cac09105649e9fd65b91e6c4c5b",
        "lineNumber": 4331,
        "columnNumber": 75_758
      }
    }
  }
] as const);
export type CurrentSchematicRelevanceCompletionCalleeRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_SOURCE[0]["roles"];
export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_ROLES = Object.freeze(["commandCanRecordGet", "historyRecord", "historyClearRecordsCore", "historyStatusGet", "historyCanRedoBaseGet", "historyCanUndoBaseGet", "historyCanRedoGet", "historyCanUndoGet", "groupForEach", "groupRemove", "groupSizeGet", "stackWillRecord", "stackVisitCommand", "willRecordTab", "positionAttributeVisit"] as const);
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentSchematicRelevanceCompletionCalleeSource(input: string): 0 | 1 {
  if (!input.isWellFormed()) { throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_SOURCE"); }
  for (const variant of [0, 1] as const) {
    const profile = CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_SOURCE[variant];
    if (Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256) {
      for (const role of CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_ROLES) {
        const method = profile.roles[role], text = input.slice(method.start, method.end);
        if (Buffer.byteLength(text) !== method.bytes || digest(text) !== method.sha256) { throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_SPAN"); }
      }
      return variant;
    }
  }
  throw new Error("SCHEMATIC_RELEVANCE_COMPLETION_CALLEE_SOURCE");
}
