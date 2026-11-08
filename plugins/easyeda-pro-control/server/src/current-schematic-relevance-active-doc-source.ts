/** Exact uninvoked active-document chain. Original singleton, document,
 * native Map/String/Array and UI receiver custody remain separate. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {qualifyCurrentSchematicDocumentConstructorSource} from "./current-schematic-document-constructor-source.ts";
import {qualifyCurrentSchematicRelevanceStatusUiSource} from "./current-schematic-relevance-status-ui-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_SOURCE=freezeDeep({
  "schematic": [
    {
      "variant": 0,
      "managerBlueprint": {
        "name": "i",
        "kind": "class",
        "arity": 0,
        "start": 5_757_106,
        "end": 5_761_814,
        "bytes": 4708,
        "sha256": "8afd851ca882ac46b711c8ce39cb376f138eaccc53c367d1976927380d65e535",
        "lineNumber": 3697,
        "columnNumber": 67_496,
        "descriptionBytes": 4708,
        "descriptionSha256": "8afd851ca882ac46b711c8ce39cb376f138eaccc53c367d1976927380d65e535"
      },
      "functions": {
        "isActive": {
          "name": "get isActive",
          "kind": "getter",
          "arity": 0,
          "start": 4_461_887,
          "end": 4_461_983,
          "bytes": 96,
          "sha256": "010435bc0b57a31a70792514199b462f1fe269b0e9bc6a1bd34f72661142aca9",
          "lineNumber": 3614,
          "columnNumber": 26_771,
          "descriptionBytes": 96,
          "descriptionSha256": "010435bc0b57a31a70792514199b462f1fe269b0e9bc6a1bd34f72661142aca9"
        },
        "tabId": {
          "name": "get tabId",
          "kind": "getter",
          "arity": 0,
          "start": 4_461_473,
          "end": 4_461_504,
          "bytes": 31,
          "sha256": "5faecd38425bb08493c0e469139e7317fe82308bab886d69e0f5679989bd231b",
          "lineNumber": 3614,
          "columnNumber": 26_354,
          "descriptionBytes": 31,
          "descriptionSha256": "5faecd38425bb08493c0e469139e7317fe82308bab886d69e0f5679989bd231b"
        },
        "instance": {
          "name": "get instance",
          "kind": "getter",
          "arity": 0,
          "start": 5_757_200,
          "end": 5_757_262,
          "bytes": 62,
          "sha256": "0b82964fd8051ace60d3adea45d4f61bd377b935e80b3a2c14edb7ab68d2ed64",
          "lineNumber": 3697,
          "columnNumber": 67_609,
          "descriptionBytes": 55,
          "descriptionSha256": "572581bf6eb3718f5366b820fc94dbc4e4327813ba317cce6ed45dffd2676759"
        },
        "getActiveDoc": {
          "name": "getActiveDoc",
          "kind": "method",
          "arity": 0,
          "start": 5_758_737,
          "end": 5_758_836,
          "bytes": 99,
          "sha256": "f6fdc26d96cafef4589f184549199862b663bcbc7b77d8e344bf083d743dd512",
          "lineNumber": 3697,
          "columnNumber": 69_139,
          "descriptionBytes": 99,
          "descriptionSha256": "f6fdc26d96cafef4589f184549199862b663bcbc7b77d8e344bf083d743dd512"
        },
        "getDocByTabId": {
          "name": "getDocByTabId",
          "kind": "method",
          "arity": 1,
          "start": 5_758_697,
          "end": 5_758_737,
          "bytes": 40,
          "sha256": "61de05bd37cc48ab03672709ffac93596109d70eca5cd3334fcbcefdce6e625d",
          "lineNumber": 3697,
          "columnNumber": 69_100,
          "descriptionBytes": 40,
          "descriptionSha256": "61de05bd37cc48ab03672709ffac93596109d70eca5cd3334fcbcefdce6e625d"
        },
        "get": {
          "name": "get",
          "kind": "method",
          "arity": 1,
          "start": 5_757_377,
          "end": 5_757_507,
          "bytes": 130,
          "sha256": "d6e94a228c71429ef4ea172cdf561df2e8d0b3309f4f81f3f16cd767431312a3",
          "lineNumber": 3697,
          "columnNumber": 67_770,
          "descriptionBytes": 130,
          "descriptionSha256": "d6e94a228c71429ef4ea172cdf561df2e8d0b3309f4f81f3f16cd767431312a3"
        },
        "normalizeInput": {
          "name": "oi",
          "kind": "function",
          "arity": 1,
          "start": 5_737_948,
          "end": 5_737_989,
          "bytes": 41,
          "sha256": "72ed8c4be0d1065d5b0edd13a0357fa2881c9747b62b902767e81c42f346ed5a",
          "lineNumber": 3697,
          "columnNumber": 48_349,
          "descriptionBytes": 41,
          "descriptionSha256": "72ed8c4be0d1065d5b0edd13a0357fa2881c9747b62b902767e81c42f346ed5a"
        },
        "splitDocId": {
          "name": "eee",
          "kind": "function",
          "arity": 1,
          "start": 5_737_813,
          "end": 5_737_948,
          "bytes": 135,
          "sha256": "26bce44c97338878f4ef84ca17ed2bbcb08b398fa97b0917a5f0360fda65dff9",
          "lineNumber": 3697,
          "columnNumber": 48_215,
          "descriptionBytes": 135,
          "descriptionSha256": "26bce44c97338878f4ef84ca17ed2bbcb08b398fa97b0917a5f0360fda65dff9"
        },
        "normalizeTab": {
          "name": "Nt",
          "kind": "function",
          "arity": 1,
          "start": 5_741_481,
          "end": 5_741_648,
          "bytes": 167,
          "sha256": "f20b80153e715640c688bd1f067535b490c215d5dbb8c69670307f70781c39ef",
          "lineNumber": 3697,
          "columnNumber": 51_882,
          "descriptionBytes": 167,
          "descriptionSha256": "f20b80153e715640c688bd1f067535b490c215d5dbb8c69670307f70781c39ef"
        },
        "getTabId": {
          "name": "Hn",
          "kind": "function",
          "arity": 1,
          "start": 5_741_187,
          "end": 5_741_441,
          "bytes": 254,
          "sha256": "1738dbe434033087e1b2590e989ea25b165abb8cee3b26815948a17ff826da04",
          "lineNumber": 3697,
          "columnNumber": 51_588,
          "descriptionBytes": 254,
          "descriptionSha256": "1738dbe434033087e1b2590e989ea25b165abb8cee3b26815948a17ff826da04"
        },
        "hasSheetPath": {
          "name": "Fm",
          "kind": "function",
          "arity": 1,
          "start": 5_737_231,
          "end": 5_737_293,
          "bytes": 62,
          "sha256": "8f18916e78c35ded8a0fb766772f1dd67412aa1493f2d8560a1dfb7eab02f729",
          "lineNumber": 3697,
          "columnNumber": 47_632,
          "descriptionBytes": 62,
          "descriptionSha256": "8f18916e78c35ded8a0fb766772f1dd67412aa1493f2d8560a1dfb7eab02f729"
        },
        "isString": {
          "name": "Wr",
          "kind": "function",
          "arity": 1,
          "start": 296_202,
          "end": 296_255,
          "bytes": 53,
          "sha256": "53233339bdb8c6804a93523d90c8c0961e662741e2faf3ddf256eb539d81a421",
          "lineNumber": 4,
          "columnNumber": 95_668,
          "descriptionBytes": 53,
          "descriptionSha256": "53233339bdb8c6804a93523d90c8c0961e662741e2faf3ddf256eb539d81a421"
        },
        "hasProjectDelimiter": {
          "name": "HTe",
          "kind": "arrow",
          "arity": 1,
          "start": 5_737_780,
          "end": 5_737_812,
          "bytes": 32,
          "sha256": "742e4384d6eb46084518ee8477590326f0fa623a32f6619671b369d66afe01d3",
          "lineNumber": 3697,
          "columnNumber": 48_170,
          "descriptionBytes": 32,
          "descriptionSha256": "742e4384d6eb46084518ee8477590326f0fa623a32f6619671b369d66afe01d3"
        }
      }
    },
    {
      "variant": 1,
      "managerBlueprint": {
        "name": "i",
        "kind": "class",
        "arity": 0,
        "start": 6_457_945,
        "end": 6_462_653,
        "bytes": 4708,
        "sha256": "f70d22362a09f5a4c609f105e796466cecb4e96e4abf887c410c74b9dde6a25e",
        "lineNumber": 4331,
        "columnNumber": 253_727,
        "descriptionBytes": 4708,
        "descriptionSha256": "f70d22362a09f5a4c609f105e796466cecb4e96e4abf887c410c74b9dde6a25e"
      },
      "functions": {
        "isActive": {
          "name": "get isActive",
          "kind": "getter",
          "arity": 0,
          "start": 4_684_656,
          "end": 4_684_752,
          "bytes": 96,
          "sha256": "010435bc0b57a31a70792514199b462f1fe269b0e9bc6a1bd34f72661142aca9",
          "lineNumber": 4113,
          "columnNumber": 26_771,
          "descriptionBytes": 96,
          "descriptionSha256": "010435bc0b57a31a70792514199b462f1fe269b0e9bc6a1bd34f72661142aca9"
        },
        "tabId": {
          "name": "get tabId",
          "kind": "getter",
          "arity": 0,
          "start": 4_684_242,
          "end": 4_684_273,
          "bytes": 31,
          "sha256": "5faecd38425bb08493c0e469139e7317fe82308bab886d69e0f5679989bd231b",
          "lineNumber": 4113,
          "columnNumber": 26_354,
          "descriptionBytes": 31,
          "descriptionSha256": "5faecd38425bb08493c0e469139e7317fe82308bab886d69e0f5679989bd231b"
        },
        "instance": {
          "name": "get instance",
          "kind": "getter",
          "arity": 0,
          "start": 6_458_039,
          "end": 6_458_101,
          "bytes": 62,
          "sha256": "0b82964fd8051ace60d3adea45d4f61bd377b935e80b3a2c14edb7ab68d2ed64",
          "lineNumber": 4331,
          "columnNumber": 253_840,
          "descriptionBytes": 55,
          "descriptionSha256": "572581bf6eb3718f5366b820fc94dbc4e4327813ba317cce6ed45dffd2676759"
        },
        "getActiveDoc": {
          "name": "getActiveDoc",
          "kind": "method",
          "arity": 0,
          "start": 6_459_576,
          "end": 6_459_675,
          "bytes": 99,
          "sha256": "f6fdc26d96cafef4589f184549199862b663bcbc7b77d8e344bf083d743dd512",
          "lineNumber": 4331,
          "columnNumber": 255_370,
          "descriptionBytes": 99,
          "descriptionSha256": "f6fdc26d96cafef4589f184549199862b663bcbc7b77d8e344bf083d743dd512"
        },
        "getDocByTabId": {
          "name": "getDocByTabId",
          "kind": "method",
          "arity": 1,
          "start": 6_459_536,
          "end": 6_459_576,
          "bytes": 40,
          "sha256": "61de05bd37cc48ab03672709ffac93596109d70eca5cd3334fcbcefdce6e625d",
          "lineNumber": 4331,
          "columnNumber": 255_331,
          "descriptionBytes": 40,
          "descriptionSha256": "61de05bd37cc48ab03672709ffac93596109d70eca5cd3334fcbcefdce6e625d"
        },
        "get": {
          "name": "get",
          "kind": "method",
          "arity": 1,
          "start": 6_458_216,
          "end": 6_458_346,
          "bytes": 130,
          "sha256": "c4301bbdf6c16cf2638cf5dd8de483f04d7278602bcde2a6c9a6b7ff703ce5ce",
          "lineNumber": 4331,
          "columnNumber": 254_001,
          "descriptionBytes": 130,
          "descriptionSha256": "c4301bbdf6c16cf2638cf5dd8de483f04d7278602bcde2a6c9a6b7ff703ce5ce"
        },
        "normalizeInput": {
          "name": "oi",
          "kind": "function",
          "arity": 1,
          "start": 6_449_074,
          "end": 6_449_115,
          "bytes": 41,
          "sha256": "918aa3a2089278879e6c6efeeb862c397de88877dcebc330b7995a9ec2a88e8b",
          "lineNumber": 4331,
          "columnNumber": 244_867,
          "descriptionBytes": 41,
          "descriptionSha256": "918aa3a2089278879e6c6efeeb862c397de88877dcebc330b7995a9ec2a88e8b"
        },
        "splitDocId": {
          "name": "Uee",
          "kind": "function",
          "arity": 1,
          "start": 6_448_939,
          "end": 6_449_074,
          "bytes": 135,
          "sha256": "d88b5f691097809e02daf2d9d13fddf97215ecefa1e7f5409e179cbaa62103b2",
          "lineNumber": 4331,
          "columnNumber": 244_733,
          "descriptionBytes": 135,
          "descriptionSha256": "d88b5f691097809e02daf2d9d13fddf97215ecefa1e7f5409e179cbaa62103b2"
        },
        "normalizeTab": {
          "name": "Nt",
          "kind": "function",
          "arity": 1,
          "start": 6_452_607,
          "end": 6_452_774,
          "bytes": 167,
          "sha256": "244700f380d6be5846daa39aa4076355a29fbd8d33b482ebb23fffd9c55e2d2c",
          "lineNumber": 4331,
          "columnNumber": 248_400,
          "descriptionBytes": 167,
          "descriptionSha256": "244700f380d6be5846daa39aa4076355a29fbd8d33b482ebb23fffd9c55e2d2c"
        },
        "getTabId": {
          "name": "Hn",
          "kind": "function",
          "arity": 1,
          "start": 6_452_313,
          "end": 6_452_567,
          "bytes": 254,
          "sha256": "85bcb363e8b43d13f980544fb2d0bd50b3510e719115fa953dc42db46d2675cd",
          "lineNumber": 4331,
          "columnNumber": 248_106,
          "descriptionBytes": 254,
          "descriptionSha256": "85bcb363e8b43d13f980544fb2d0bd50b3510e719115fa953dc42db46d2675cd"
        },
        "hasSheetPath": {
          "name": "Hg",
          "kind": "function",
          "arity": 1,
          "start": 6_448_357,
          "end": 6_448_419,
          "bytes": 62,
          "sha256": "bc64c7b09a5327a885d037dd8ed7531ca4b93f78ab48605e32ce5ee79f2447ed",
          "lineNumber": 4331,
          "columnNumber": 244_150,
          "descriptionBytes": 62,
          "descriptionSha256": "bc64c7b09a5327a885d037dd8ed7531ca4b93f78ab48605e32ce5ee79f2447ed"
        },
        "isString": {
          "name": "Xr",
          "kind": "function",
          "arity": 1,
          "start": 1_319_614,
          "end": 1_319_667,
          "bytes": 53,
          "sha256": "6cb8115bde8e0e81ba3ccca1650928735bb0a26b2676fc13c09f18f3e2436a44",
          "lineNumber": 530,
          "columnNumber": 29_466,
          "descriptionBytes": 53,
          "descriptionSha256": "6cb8115bde8e0e81ba3ccca1650928735bb0a26b2676fc13c09f18f3e2436a44"
        },
        "hasProjectDelimiter": {
          "name": "W2e",
          "kind": "arrow",
          "arity": 1,
          "start": 6_448_906,
          "end": 6_448_938,
          "bytes": 32,
          "sha256": "9ba992a0474d6da7197a87f78cdd54e65d0cf2bc6eea95df3604272f27639011",
          "lineNumber": 4331,
          "columnNumber": 244_688,
          "descriptionBytes": 32,
          "descriptionSha256": "9ba992a0474d6da7197a87f78cdd54e65d0cf2bc6eea95df3604272f27639011"
        }
      }
    }
  ],
  "ui": {
    "functions": {
      "getActiveTab": {
        "name": "getActiveTab",
        "kind": "method",
        "arity": 0,
        "start": 16_437_415,
        "end": 16_437_464,
        "bytes": 49,
        "sha256": "3af22b478ae49a40488a5a724c01d69bbacdd1d3020b83c7bf98985081170b22",
        "lineNumber": 2028,
        "columnNumber": 51_950,
        "descriptionBytes": 42,
        "descriptionSha256": "03159539fdf3f40f1beb4796b80a2996100c911bc1e7a90e640dd4f8f496b0c1"
      }
    }
  }
} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_ROLES=Object.freeze(["isActive","tabId","instance","getActiveDoc","getDocByTabId","get","normalizeInput","splitDocId","normalizeTab","getTabId","hasSheetPath","isString","hasProjectDelimiter"]as const);
export type CurrentSchematicRelevanceActiveDocRole=typeof CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_ROLES[number]|"getActiveTab";
export type CurrentSchematicRelevanceActiveDocVariant=0|1|2;
export interface CurrentSchematicRelevanceActiveDocFunctionProfile {
 readonly name:string;readonly kind:"getter"|"method"|"function"|"arrow";readonly arity:number;
 readonly start:number;readonly end:number;readonly bytes:number;readonly sha256:string;
 readonly lineNumber:number;readonly columnNumber:number;readonly descriptionBytes:number;readonly descriptionSha256:string;
}
function bad():never{throw new Error("SCH_ACTIVE_DOC_SOURCE");}
export function currentSchematicRelevanceActiveDocFunctionProfile(variant:CurrentSchematicRelevanceActiveDocVariant,role:CurrentSchematicRelevanceActiveDocRole):CurrentSchematicRelevanceActiveDocFunctionProfile {
 if(variant===2){if(role!=="getActiveTab"){return bad();}return CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_SOURCE.ui.functions.getActiveTab;}
 if((variant!==0&&variant!==1)||role==="getActiveTab"||!CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_ROLES.includes(role)){return bad();}
 return CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_SOURCE.schematic[variant].functions[role];
}
export function qualifyCurrentSchematicRelevanceActiveDocSource(source:string,variant:CurrentSchematicRelevanceActiveDocVariant):void {
 if(variant===2){qualifyCurrentSchematicRelevanceStatusUiSource(source);}
 else if((variant!==0&&variant!==1)||qualifyCurrentSchematicDocumentConstructorSource(source)!==variant){return bad();}
 const rows:readonly CurrentSchematicRelevanceActiveDocFunctionProfile[]=variant===2?[CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_SOURCE.ui.functions.getActiveTab]:Object.values(CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_SOURCE.schematic[variant].functions);
 for(const row of rows){const text=source.slice(row.start,row.end);if(Buffer.byteLength(text)!==row.bytes||createHash("sha256").update(text).digest("hex")!==row.sha256){return bad();}}
 if(variant!==2){const row=CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_SOURCE.schematic[variant].managerBlueprint;const text=source.slice(row.start,row.end);if(Buffer.byteLength(text)!==row.bytes||createHash("sha256").update(text).digest("hex")!==row.sha256){return bad();}}
}
