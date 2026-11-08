/** Exact installed UI delegate syntax. This leaf grants no receiver or call. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE as UI,qualifyCurrentSchematicRelevanceStatusUiSource} from "./current-schematic-relevance-status-ui-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_SOURCE=freezeDeep({relativePath:UI.relativePath,bytes:UI.bytes,sha256:UI.sha256,roles:{"rootUpdate":{"start": 1_900_876, "end": 1_901_119, "kind": "function", "strict": true, "name": "EPe", "arity": 4, "bytes": 243, "sha256": "3bc4e11ac3c60e0ce43552fa7ef24ea727fcb07052264278293377b85087ab69", "lineNumber": 1041, "columnNumber": 52_518},
  "namespaceCopy": {
    "start": 670,
    "end": 844,
    "kind": "arrow",
    "strict": false,
    "name": "PGo",
    "arity": 4,
    "bytes": 174,
    "sha256": "58e806e9fb32c238667718e953da7870bc6b80b93f1b8465bb247efbe27f10f5",
    "lineNumber": 0,
    "columnNumber": 670
  },
  "namespaceExportGet": {
    "start": 785,
    "end": 793,
    "kind": "arrow",
    "strict": false,
    "name": "get",
    "arity": 0,
    "bytes": 8,
    "sha256": "d496591395d9816bd63ae3c94c72e1533d7caaf0f33ba26c7513ae050372b498",
    "lineNumber": 0,
    "columnNumber": 785
  },
  "rootConstructor": {
    "start": 1_901_534,
    "end": 1_901_571,
    "kind": "function",
    "strict": true,
    "name": "b4t",
    "arity": 1,
    "bytes": 37,
    "sha256": "77c34ebe7a84d6b4f6877595f019561c66866416875d6f667fb9ea3ec18cff64",
    "lineNumber": 1041,
    "columnNumber": 53_176
  },
  "rootRender": {
    "start": 1_901_613,
    "end": 1_901_702,
    "kind": "function",
    "strict": true,
    "name": "",
    "arity": 1,
    "bytes": 89,
    "sha256": "3119021cf9ee98765d46926f823ee1dae64689d02b690d6bd00a6f678fa0ad57",
    "lineNumber": 1041,
    "columnNumber": 53_251
  },
  "hydrationRootConstructor": {
    "start": 1_901_894,
    "end": 1_901_931,
    "kind": "function",
    "strict": true,
    "name": "APe",
    "arity": 1,
    "bytes": 37,
    "sha256": "791642b1920bae4103fbe68ba9cf0d1c3b64b8a7aac0f2917e47ccc752a3d862",
    "lineNumber": 1041,
    "columnNumber": 53_536
  },
  "jsx": {
    "start": 1_920_295,
    "end": 1_920_621,
    "kind": "function",
    "strict": true,
    "name": "f0i",
    "arity": 3,
    "bytes": 326,
    "sha256": "ef7839e199511c6e019a81618099c7130614d0ddcfb05db6b11407e92da34c39",
    "lineNumber": 1041,
    "columnNumber": 71_937
  },
  "tabComponent": {
    "start": 15_696_574,
    "end": 15_700_991,
    "kind": "arrow",
    "strict": false,
    "name": "dlr",
    "arity": 1,
    "bytes": 4417,
    "sha256": "906fa783701e8ec5c39ebba1a3999c322ecb7efae9ea65937111ae82c1ead9a9",
    "lineNumber": 1942,
    "columnNumber": 16_289
  }
},blueprints:{
  "xe": {
    "start": 545,
    "end": 603,
    "bytes": 58,
    "sha256": "8a7df0fbeb38828890de2e6e21d5c36a88c45d8cba920e1c93b1c0304cdf5d7a"
  },
  "g0i": {
    "start": 1_920_036,
    "end": 1_920_664,
    "bytes": 628,
    "sha256": "b828de1ab6326e501b140e09c2f732b6244034fda9a4b50bc22fe2e1f24ae5fc"
  }
},boundaries:{renderReturned:{lineNumber:1942,columnNumber:3853,functionRole:"storeRender"},storeReturned:{lineNumber:1942,columnNumber:9999,functionRole:"storeSetTabUnSaved"}}}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_ROLES=Object.freeze(["rootUpdate","namespaceCopy","namespaceExportGet","rootConstructor","rootRender","hydrationRootConstructor","jsx","tabComponent"]as const);
export type CurrentSchematicRelevanceRenderDelegateRole=keyof typeof CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_SOURCE.roles;
export function qualifyCurrentSchematicRelevanceRenderDelegateSource(source:string):void{qualifyCurrentSchematicRelevanceStatusUiSource(source);for(const row of [...Object.values(CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_SOURCE.roles),...Object.values(CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_SOURCE.blueprints)]){const body=source.slice(row.start,row.end);if(Buffer.byteLength(body)!==row.bytes||createHash("sha256").update(body).digest("hex")!==row.sha256){throw new Error("SCH_RENDER_DELEGATE_SOURCE");}}}
