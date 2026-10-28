/** Exact pinned bb wrapper bodies. Native Cache namespace ownership remains separate. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_PROFILES = freezeDeep([
  {
    "key": "bb",
    "name": "bb",
    "kind": "class",
    "async": false,
    "arity": 1,
    "lineNumber": 106,
    "columnNumber": 55_679,
    "bytes": 2103,
    "sha256": "dc9d525ea38c56cf9277426bcca6f61d7ee78c94882ae267497eeb50bcbcef21",
    "parent": null
  },
  {
    "key": "bb.open",
    "name": "open",
    "kind": "method",
    "async": true,
    "arity": 0,
    "lineNumber": 106,
    "columnNumber": 55_710,
    "bytes": 203,
    "sha256": "700845a1778ffc13bf8a9ef1d58f9c4728d623b4b3405ee1a8a7be2ce0bb4893",
    "parent": null
  },
  {
    "key": "bb.put",
    "name": "put",
    "kind": "method",
    "async": true,
    "arity": 3,
    "lineNumber": 106,
    "columnNumber": 55_912,
    "bytes": 522,
    "sha256": "fbcf4d11c5d4b47e9ffa46057e13721851543486f43797f13c72d840a8cf159e",
    "parent": null
  },
  {
    "key": "bb.match",
    "name": "match",
    "kind": "method",
    "async": true,
    "arity": 3,
    "lineNumber": 106,
    "columnNumber": 56_436,
    "bytes": 329,
    "sha256": "e5168264a9690e5cf7560a714a5107f6802c951d9a884a06cd30eb26332283d1",
    "parent": null
  },
  {
    "key": "bb.flowStrMatch",
    "name": "flowStrMatch",
    "kind": "method",
    "async": true,
    "arity": 4,
    "lineNumber": 106,
    "columnNumber": 56_772,
    "bytes": 521,
    "sha256": "2d531fef8015783be8ba29995540af92d360ca60e17a88c82706c695ff3707fc",
    "parent": null
  },
  {
    "key": "bb.keys",
    "name": "keys",
    "kind": "method",
    "async": true,
    "arity": 3,
    "lineNumber": 106,
    "columnNumber": 57_285,
    "bytes": 244,
    "sha256": "2b9592dac2940568cca83c286f7e9f9b88fbc7ee8b2d40aff0aa4ee41b82306a",
    "parent": null
  },
  {
    "key": "bb.delete",
    "name": "delete",
    "kind": "method",
    "async": true,
    "arity": 3,
    "lineNumber": 106,
    "columnNumber": 57_531,
    "bytes": 245,
    "sha256": "225b955f2d4671c055291a40525fbbf2600401de8d8a57fe57b53b070ad0e499",
    "parent": null
  }
] as const);
