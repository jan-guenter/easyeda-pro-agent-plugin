/** Exact UI subscriber and tab presentation bodies. Supplied bytes alone grant
 * no callback delivery, UI mutation, renderer completion or native authority. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE=freezeDeep({
  "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
  "bytes": 17_468_192,
  "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
  "roles": {
    "subscriberWrapper": {
      "start": 15_997_142,
      "end": 15_997_178,
      "name": "",
      "arity": 1,
      "lineNumber": 1955,
      "columnNumber": 4458,
      "kind": "arrow",
      "strict": false,
      "bytes": 36,
      "sha256": "9007000a3301f0f6a981c084ac063213ef5a4657f8f59102ef12f0b40cc6be43"
    },
    "uiSetTabUnSaved": {
      "start": 16_449_845,
      "end": 16_450_129,
      "name": "setTabUnSaved",
      "arity": 2,
      "lineNumber": 2028,
      "columnNumber": 64_374,
      "kind": "method",
      "strict": true,
      "bytes": 284,
      "sha256": "88bdc44b98ae15ba475cb52dc06ad968e5f2fa430e20b3ead175763447ccfa4f"
    },
    "storeSetTabUnSaved": {
      "start": 15_690_141,
      "end": 15_690_285,
      "name": "setTabUnSaved",
      "arity": 3,
      "lineNumber": 1942,
      "columnNumber": 9869,
      "kind": "method",
      "strict": true,
      "bytes": 144,
      "sha256": "7c07ff480cdda61a66c760ca95a0453fc9076bf22f78a864ff3bc5a35514da1b"
    },
    "storeRender": {
      "start": 15_683_995,
      "end": 15_684_139,
      "name": "render",
      "arity": 1,
      "lineNumber": 1942,
      "columnNumber": 3716,
      "kind": "method",
      "strict": true,
      "bytes": 144,
      "sha256": "78d04203dadff3cdb80fe74bf5bf1b3000d2c760038492ffbed33f610d40b906"
    },
    "storeSetActiveOrder": {
      "start": 15_692_518,
      "end": 15_692_720,
      "name": "setActiveOrder",
      "arity": 2,
      "lineNumber": 1942,
      "columnNumber": 12_247,
      "kind": "method",
      "strict": true,
      "bytes": 202,
      "sha256": "190a171c9813577922e43230e95ecbc9d891bff0f93a77c7f7273e89d251626e"
    },
    "storeGetTabData": {
      "start": 15_693_614,
      "end": 15_693_736,
      "name": "getTabData",
      "arity": 1,
      "lineNumber": 1942,
      "columnNumber": 13_339,
      "kind": "method",
      "strict": true,
      "bytes": 122,
      "sha256": "d52b0bd48fc7e818c29be72bf13a8044effb66ea92592d32f41eb2f5b65fd68c"
    },
    "getTabById": {
      "start": 16_409_522,
      "end": 16_409_681,
      "name": "getTabById",
      "arity": 1,
      "lineNumber": 2028,
      "columnNumber": 24_048,
      "kind": "method",
      "strict": true,
      "bytes": 159,
      "sha256": "4989a07a3fa86e35be8fc945b4c62b353745675154595648e421a7c5e3581a26"
    },
    "getTabContainer": {
      "start": 16_410_016,
      "end": 16_410_112,
      "name": "getTabContainer",
      "arity": 1,
      "lineNumber": 2028,
      "columnNumber": 24_547,
      "kind": "method",
      "strict": true,
      "bytes": 96,
      "sha256": "ede283625cfc51e64ff0ff1d7faa3e4597daecc9f3178d17bed9dd05f2687926"
    }
  },
  "factory": {
    "start": 15_997_119,
    "end": 15_997_179,
    "name": "N4e",
    "arity": 1,
    "lineNumber": 1955,
    "columnNumber": 4447,
    "kind": "function",
    "strict": false,
    "bytes": 60,
    "sha256": "781b440bd6ab7728f8773864db7d5513889b91dc7c10f6b6d7c10b0f17c798a3"
  },
  "classes": {
    "tabStore": {
      "start": 15_683_979,
      "end": 15_694_829,
      "name": "Xo",
      "arity": 0,
      "lineNumber": 1942,
      "columnNumber": 3694,
      "bytes": 10_850,
      "sha256": "41b843a10f25fdc842646c814e61dab61b55ac9425fb5815f721b5de0f342a1d"
    },
    "tabBar": {
      "start": 16_405_738,
      "end": 16_456_186,
      "name": "tt",
      "arity": 0,
      "lineNumber": 2028,
      "columnNumber": 20_254,
      "bytes": 50_448,
      "sha256": "179693ced6e642443a5fa938204079318ad6dfa8dd3f218767cbf52ee943ec8c"
    }
  }
} as const);
export type CurrentSchematicRelevanceStatusUiContainerRole=keyof typeof CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE.classes;
export type CurrentSchematicRelevanceStatusUiRole=keyof typeof CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE.roles;
export function qualifyCurrentSchematicRelevanceStatusUiSource(source:string):void{const profile=CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE;if(!source.isWellFormed()||Buffer.byteLength(source)!==profile.bytes||createHash("sha256").update(source).digest("hex")!==profile.sha256){throw new Error("SCH_STATUS_UI_SOURCE");}for(const row of[profile.factory,...Object.values(profile.roles),...Object.values(profile.classes)]){const text=source.slice(row.start,row.end);if(Buffer.byteLength(text)!==row.bytes||createHash("sha256").update(text).digest("hex")!==row.sha256){throw new Error("SCH_STATUS_UI_SOURCE_ROLE");}}}
