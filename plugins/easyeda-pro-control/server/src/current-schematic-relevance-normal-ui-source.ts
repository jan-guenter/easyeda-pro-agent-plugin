/** Exact UI command-store and bounded React dispatch syntax. No callback or sender authority. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE as UI,qualifyCurrentSchematicRelevanceStatusUiSource as qualifyUi} from "./current-schematic-relevance-status-ui-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE=freezeDeep({
  "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
  "bytes": 17_468_192,
  "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
  "roles": {
    "reactReducer": {
      "start": 1_840_474,
      "end": 1_840_527,
      "name": "Bxe",
      "kind": "function",
      "strict": true,
      "arity": 2,
      "bytes": 53,
      "sha256": "8d89a3fb760a647c2f8f8e3a3ef0ee6de4d19e288457d9d8e72dc6b40e31284b",
      "lineNumber": 1039,
      "columnNumber": 20_656
    },
    "reactStateMount": {
      "start": 1_842_585,
      "end": 1_842_842,
      "name": "Fci",
      "kind": "function",
      "strict": true,
      "arity": 1,
      "bytes": 257,
      "sha256": "c655a539628be6ee4c4ecf948055c0028745fe14017d4fd8d49b7195877ccf90",
      "lineNumber": 1039,
      "columnNumber": 22_767
    },
    "reactDispatch": {
      "start": 1_844_675,
      "end": 1_845_143,
      "name": "i0n",
      "kind": "function",
      "strict": true,
      "arity": 3,
      "bytes": 468,
      "sha256": "2fa38ee101e979f783665492abe6a91c04804bd063e688553321337b21c10cce",
      "lineNumber": 1039,
      "columnNumber": 24_857
    },
    "storeBaseConstructor": {
      "start": 8_088_664,
      "end": 8_089_131,
      "name": "Xe",
      "kind": "class",
      "strict": true,
      "arity": 0,
      "bytes": 467,
      "sha256": "f9ae316aa4e770e6bb7c204fa79bff9fd38ccc181bc79c650e2a90a330252648",
      "lineNumber": 1172,
      "columnNumber": 1_832_017
    },
    "notify": {
      "start": 8_088_760,
      "end": 8_088_991,
      "name": "notify",
      "kind": "method",
      "strict": true,
      "arity": 0,
      "bytes": 231,
      "sha256": "cb6447eb0930137961d0f0c82c8b2b33ef693e8c20e885507d89e247842d091b",
      "lineNumber": 1172,
      "columnNumber": 1_832_102
    },
    "notification": {
      "start": 8_088_824,
      "end": 8_088_974,
      "name": "",
      "kind": "arrow",
      "strict": true,
      "arity": 0,
      "bytes": 150,
      "sha256": "fe2b28e5e2ea065d25223b78eb2d8d115ccb2521d8d58b7844fed7b2acc9d1d4",
      "lineNumber": 1172,
      "columnNumber": 1_832_160
    },
    "notificationVisit": {
      "start": 8_088_855,
      "end": 8_088_944,
      "name": "",
      "kind": "asyncArrow",
      "strict": true,
      "arity": 1,
      "bytes": 89,
      "sha256": "8421fa4d0c3433c766066f8c100e449b9f3a3f971e2050a802c6f249979328ff",
      "lineNumber": 1172,
      "columnNumber": 1_832_191
    },
    "valueStoreConstructor": {
      "start": 8_224_911,
      "end": 8_225_046,
      "name": "Bs",
      "kind": "class",
      "strict": true,
      "arity": 1,
      "bytes": 135,
      "sha256": "4db0e7baab14b107743f522c396ba7cea3190b84a9e758b3dd13e8993c711127",
      "lineNumber": 1172,
      "columnNumber": 1_968_275
    },
    "setValue": {
      "start": 8_224_964,
      "end": 8_225_021,
      "name": "setValue",
      "kind": "method",
      "strict": true,
      "arity": 1,
      "bytes": 57,
      "sha256": "4e0d2dc01b9af448089545d7b27325bc2ad392fc4445256b9ab6ca95d9e5b557",
      "lineNumber": 1172,
      "columnNumber": 1_968_308
    },
    "disabledStoreConstructor": {
      "start": 8_225_413,
      "end": 8_225_844,
      "name": "_4t",
      "kind": "class",
      "strict": true,
      "arity": 0,
      "bytes": 431,
      "sha256": "39c831b4d4394646628bcd6835fb19ddb91dc3e070bf4f4e26aaefe7ff6b2aa3",
      "lineNumber": 1172,
      "columnNumber": 1_968_777
    },
    "setDisabled": {
      "start": 8_225_523,
      "end": 8_225_694,
      "name": "setDisableCmd",
      "kind": "method",
      "strict": true,
      "arity": 1,
      "bytes": 171,
      "sha256": "5939b8f5813b6af0baabc269edf5bf94813e9d0b9a5257de8b9b3784073209b7",
      "lineNumber": 1172,
      "columnNumber": 1_968_872
    },
    "menuDisabled": {
      "start": 15_872_725,
      "end": 15_872_922,
      "name": "e_",
      "kind": "function",
      "strict": false,
      "arity": 2,
      "bytes": 197,
      "sha256": "f0198a979eee017b4f58b5da6a0a8e04d76db5f8566c74e7946a91787b1a3872",
      "lineNumber": 1946,
      "columnNumber": 35_546
    },
    "toolbarDisabled": {
      "start": 15_873_773,
      "end": 15_873_970,
      "name": "w5",
      "kind": "function",
      "strict": false,
      "arity": 2,
      "bytes": 197,
      "sha256": "3cc0d2af4601aa7e607797a2850790e89ca23d1c687dc8840a842ea3fe1e024b",
      "lineNumber": 1946,
      "columnNumber": 36_594
    }
  },
  "blueprints": {
    "setToolbarItemDisabled": {
      "start": 16_702_014,
      "end": 16_702_039,
      "bytes": 25,
      "sha256": "8a20105290f4bec151f96d7ce1704fdbec77a81e2dd44763bd0abd01d851998e",
      "target": "w5"
    },
    "setMenuItemDisabled": {
      "start": 16_702_040,
      "end": 16_702_062,
      "bytes": 22,
      "sha256": "392d4c0598e2952a9f767df485319a9653f4d2c0b05e9973d8e7f33ca144ecde",
      "target": "e_"
    }
  }
} as const);
export type CurrentSchematicRelevanceNormalUiRole=keyof typeof CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE.roles;
export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_ROLES=Object.freeze(["reactReducer","reactStateMount","reactDispatch","storeBaseConstructor","notify","notification","notificationVisit","valueStoreConstructor","setValue","disabledStoreConstructor","setDisabled","menuDisabled","toolbarDisabled"] as const);
export function qualifyCurrentSchematicRelevanceNormalUiSource(source:string):void{qualifyUi(source);if(CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE.sha256!==UI.sha256){throw new Error("SCH_NORMAL_UI_SOURCE_PROFILE");}for(const row of [...Object.values(CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE.roles),...Object.values(CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE.blueprints)]){const value=source.slice(row.start,row.end);if(Buffer.byteLength(value)!==row.bytes||createHash("sha256").update(value).digest("hex")!==row.sha256){throw new Error("SCH_NORMAL_UI_SOURCE");}}}
