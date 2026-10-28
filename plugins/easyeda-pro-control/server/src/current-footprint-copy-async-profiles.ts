/** Pinned worker callbacks. Identity/source qualification does not prove completion. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES = freezeDeep([
  {
    "key": "head-subscriber",
    "name": "",
    "kind": "arrow",
    "async": false,
    "arity": 2,
    "lineNumber": 110,
    "columnNumber": 91_268,
    "start": 2_105_478,
    "end": 2_105_507,
    "bytes": 29,
    "sha256": "ae462acd2b2238e06c322d814d0155601ac22ada5951926e03aedb016a584dcf"
  },
  {
    "key": "change-subscriber",
    "name": "",
    "kind": "arrow",
    "async": false,
    "arity": 13,
    "lineNumber": 110,
    "columnNumber": 91_332,
    "start": 2_105_542,
    "end": 2_107_140,
    "bytes": 1598,
    "sha256": "44bfca1afed5a3f24c30767ac3b7a0235fc8fd92808eb604564f98cee1424c9e"
  },
  {
    "key": "buffered-upload",
    "name": "",
    "kind": "arrow",
    "async": false,
    "arity": 1,
    "lineNumber": 110,
    "columnNumber": 15_521,
    "start": 2_029_731,
    "end": 2_029_857,
    "bytes": 126,
    "sha256": "7b350c3d20de0324f1c34fd12954845adc8a919726dad878f165436155d2ae90"
  },
  {
    "key": "cache-factory",
    "name": "",
    "kind": "arrow",
    "async": false,
    "arity": 0,
    "lineNumber": 109,
    "columnNumber": 165_321,
    "start": 2_012_634,
    "end": 2_012_657,
    "bytes": 23,
    "sha256": "eab725d34d5930d3980d0fb86c5ad5a5d0f8beebb5f011a597cf152223f8b41e"
  },
  {
    "key": "upload-callback",
    "name": "",
    "kind": "arrow",
    "async": true,
    "arity": 0,
    "lineNumber": 109,
    "columnNumber": 165_146,
    "start": 2_012_459,
    "end": 2_012_519,
    "bytes": 60,
    "sha256": "a724d28e81619f3d15dd170537a0defcad27d3c88b463045de3234eced63eaef"
  },
  {
    "key": "buffered-completion",
    "name": "c",
    "kind": "function",
    "async": true,
    "arity": 0,
    "lineNumber": 110,
    "columnNumber": 15_766,
    "start": 2_029_960,
    "end": 2_030_080,
    "bytes": 120,
    "sha256": "c823aa9affa52525a590c69b1282f9a5a8e022ea474a32c5d971c4473a594735"
  },
  {
    "key": "buffered-add",
    "name": "o",
    "kind": "function",
    "async": false,
    "arity": 1,
    "lineNumber": 110,
    "columnNumber": 15_658,
    "start": 2_029_858,
    "end": 2_029_960,
    "bytes": 102,
    "sha256": "56f95d481a87fce2f09ed4186704a00b4c0e5589c3dd632b97a84435547f2133"
  }
] as const);
