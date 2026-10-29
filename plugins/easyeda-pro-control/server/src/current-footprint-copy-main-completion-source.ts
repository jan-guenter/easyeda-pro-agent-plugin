/** Pinned complete main source and fixed continuation sites. Static source
 * qualification is not an original native owner or embedded V8 acceptance. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintCopyMainRequestSource, requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";

export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FUNCTIONS = freezeDeep({
  "save": {
    "start": 2_594_406,
    "end": 2_595_147,
    "bytes": 741,
    "sha256": "3ebbb9c71fc52327bef582827aaf1830a03626bb7df5b84ee34b69652b962791",
    "functionLocation": {
      "lineNumber": 8572,
      "columnNumber": 19_828
    }
  },
  "transaction": {
    "start": 1_301_317,
    "end": 1_301_460,
    "bytes": 143,
    "sha256": "4b53d39fe431a2118f88c4659c5b75d8b106bc0d74311cbf7baf7ff28ba261de",
    "functionLocation": {
      "lineNumber": 1025,
      "columnNumber": 2514
    }
  },
  "callback": {
    "start": 2_594_656,
    "end": 2_594_797,
    "bytes": 141,
    "sha256": "e692eb24415c32e38b6fef872b0ae78a2a95a207c39392f6482153a00f4a87e5",
    "functionLocation": {
      "lineNumber": 8572,
      "columnNumber": 20_054
    }
  },
  "append": {
    "start": 2_599_064,
    "end": 2_599_367,
    "bytes": 303,
    "sha256": "84b269e386d258848f03ed68351ae1cd07ac1d24a8431fe2fc0fe59259eeea65",
    "functionLocation": {
      "lineNumber": 8572,
      "columnNumber": 24_479
    }
  },
  "mutable": {
    "start": 2_599_367,
    "end": 2_599_658,
    "bytes": 291,
    "sha256": "8386341ae7c2a8f050f38c9e98d49d62aba2433c24d86c3e4b6e9fc360807ab7",
    "functionLocation": {
      "lineNumber": 8572,
      "columnNumber": 24_782
    }
  },
  "commit": {
    "start": 1_301_009,
    "end": 1_301_160,
    "bytes": 151,
    "sha256": "11b86b3e34fd6e95896a73f8738392ba3d97c302721950e2aa25d213ac7cf515",
    "functionLocation": {
      "lineNumber": 1025,
      "columnNumber": 2199
    }
  },
  "project": {
    "start": 2_601_108,
    "end": 2_601_284,
    "bytes": 176,
    "sha256": "8d5bc647a6aa778f2ecbb0907db99ffa956721e0c8df2d3e2a7f447c679e3f0a",
    "functionLocation": {
      "lineNumber": 8572,
      "columnNumber": 26_523
    }
  },
  "sqlExec": {
    "start": 1_301_798,
    "end": 1_302_020,
    "bytes": 222,
    "sha256": "e4da44ce9368c2230b6b5c8a29d19e2ee016b83762064793ebc82622ebb57a12",
    "functionLocation": {
      "lineNumber": 1025,
      "columnNumber": 2980
    }
  },
  "controller": {
    "start": 2_604_075,
    "end": 2_604_380,
    "bytes": 305,
    "sha256": "1ea2889c63bbb9a84b6b9eb9845ce977c4e1ecc3e9ef1c50e52f215d1d018ef0",
    "functionLocation": {
      "lineNumber": 8573,
      "columnNumber": 1648
    }
  }
} as const);
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SITES = freezeDeep({
  "save": {
    "role": "save",
    "name": "saveProjectHistory",
    "lineNumber": 8572,
    "columnNumber": 19_844,
    "dynamic": false
  },
  "transaction-enter": {
    "role": "transaction",
    "name": "inTransaction",
    "lineNumber": 1025,
    "columnNumber": 2529,
    "dynamic": false
  },
  "callback-enter": {
    "role": "callback",
    "name": "",
    "lineNumber": 8572,
    "columnNumber": 20_070,
    "dynamic": true
  },
  "branch": {
    "role": "callback",
    "name": "",
    "lineNumber": 8572,
    "columnNumber": 20_106,
    "dynamic": false
  },
  "append": {
    "role": "append",
    "name": "bB",
    "lineNumber": 8572,
    "columnNumber": 24_495,
    "dynamic": false
  },
  "branch-return": {
    "role": "callback",
    "name": "",
    "lineNumber": 8572,
    "columnNumber": 20_194,
    "dynamic": false
  },
  "commit-enter": {
    "role": "commit",
    "name": "commit",
    "lineNumber": 1025,
    "columnNumber": 2202,
    "dynamic": false
  },
  "commit-return": {
    "role": "commit",
    "name": "commit",
    "lineNumber": 1025,
    "columnNumber": 2337,
    "dynamic": false
  },
  "transaction-return": {
    "role": "transaction",
    "name": "inTransaction",
    "lineNumber": 1025,
    "columnNumber": 2637,
    "dynamic": false
  },
  "save-post-transaction": {
    "role": "save",
    "name": "saveProjectHistory",
    "lineNumber": 8572,
    "columnNumber": 20_197,
    "dynamic": false
  },
  "project-sql": {
    "role": "sqlExec",
    "name": "exec",
    "lineNumber": 1025,
    "columnNumber": 3166,
    "dynamic": false
  },
  "project-return": {
    "role": "project",
    "name": "xB",
    "lineNumber": 8572,
    "columnNumber": 26_681,
    "dynamic": false
  },
  "save-return": {
    "role": "save",
    "name": "saveProjectHistory",
    "lineNumber": 8572,
    "columnNumber": 20_236,
    "dynamic": false
  },
  "controller-return": {
    "role": "controller",
    "name": "createProjectHistory",
    "lineNumber": 8573,
    "columnNumber": 1926,
    "dynamic": false
  }
} as const);
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER = Object.freeze(["save", "transaction-enter", "callback-enter", "branch", "append", "branch-return", "commit-enter", "commit-return", "transaction-return", "save-post-transaction", "project-sql", "project-return", "save-return", "controller-return"] as const);
export type CurrentFootprintCopyMainCompletionStage = typeof CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER[number];
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SQL = "update projects set updated_at = \n    ?,modifier_uuid = \n    ? where \n    1 = \n    1";
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SQL_CONDITION = `r===${JSON.stringify(CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SQL)}`;
export interface CurrentFootprintCopyMainCompletionSource {
  readonly profile: "private.current-footprint-copy-main-completion-source.v1";
  readonly sourceSha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c";
  readonly embeddedV8Validated: false; readonly executionAuthorized: false;
}
const originals = new WeakMap<CurrentFootprintCopyMainCompletionSource, ReturnType<typeof qualifyCurrentFootprintCopyMainRequestSource>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_MAIN_COMPLETION_SOURCE"); } }
export function qualifyCurrentFootprintCopyMainCompletionSource(input: unknown): CurrentFootprintCopyMainCompletionSource {
  const original = qualifyCurrentFootprintCopyMainRequestSource(input); need(typeof input === "string");
  for (const profile of Object.values(CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FUNCTIONS)) {
    const text = input.slice(profile.start, profile.end);
    need(Buffer.byteLength(text) === profile.bytes && createHash("sha256").update(text).digest("hex") === profile.sha256);
  }
  const result = Object.freeze({ profile: "private.current-footprint-copy-main-completion-source.v1" as const,
    sourceSha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" as const,
    embeddedV8Validated: false as const, executionAuthorized: false as const });
  originals.set(result, original); return result;
}
export function requireCurrentFootprintCopyMainCompletionSource(input: CurrentFootprintCopyMainCompletionSource): void {
  const original = originals.get(input); need(original !== undefined); requireCurrentFootprintCopyMainRequestSource(original);
}
