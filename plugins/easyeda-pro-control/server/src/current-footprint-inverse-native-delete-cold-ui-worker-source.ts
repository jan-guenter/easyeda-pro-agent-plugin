/** Immutable original worker channel profiles. Whole-source qualification
 * precedes these independently pinned spans; no owner or execution is issued. */
import {createHash} from "node:crypto";
import {qualifyCurrentFootprintInverseGetSource as qualify} from "./current-footprint-inverse-get-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_ALIASES=freezeDeep({
 "WR": "JP",
 "VR": "KP",
 "_w": "Mb",
 "Gy": "Hg",
 "bl": "Ac",
 "YR": "WP",
 "yh": "wu",
 "Rf": "op",
 "GR": "VP",
 "OR": "NP",
 "Uy": "Fg"
}as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_SOURCE=freezeDeep({
 "innerRpcBaseRpcServiceCallback1":{"file":"worker","start":8383,"end":8695,"descriptionStart":8383,"name":"s","arity":1,"kind":"arrow","strict":true,"async":false,"syntax":"expression","bytes":312,"sha256":"c6546a1b802699793873a9bc6cc53b50d74f21ff17dc3dcc688839cef4444824","lineNumber":0,"columnNumber":8383,"ownNames":["length","name"]},
 "innerBroadcastOnMessage": {
  "file": "worker",
  "start": 11_813,
  "end": 12_230,
  "descriptionStart": 11_813,
  "name": "onMessage",
  "arity": 1,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 417,
  "sha256": "924c657491184748fa1ac302ebaaaeeac47ef56b9df88c5d8404bcd0a6f92308",
  "lineNumber": 0,
  "columnNumber": 11_822,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBroadcastPublish": {
  "file": "worker",
  "start": 12_230,
  "end": 12_313,
  "descriptionStart": 12_230,
  "name": "broadcastPublish",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 83,
  "sha256": "30cd880109ad82ba614691e6fc0de9b7a9469053af28ebafe94fa38af1d006a4",
  "lineNumber": 0,
  "columnNumber": 12_246,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBroadcastWhoHas": {
  "file": "worker",
  "start": 12_313,
  "end": 12_382,
  "descriptionStart": 12_313,
  "name": "broadcastWhoHas",
  "arity": 1,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 69,
  "sha256": "cbd0c7d4facad6a0f669b425fadb64e3722e419cc7d3d633cdf40d8be441a96f",
  "lineNumber": 0,
  "columnNumber": 12_328,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBroadcastIHave": {
  "file": "worker",
  "start": 12_382,
  "end": 12_456,
  "descriptionStart": 12_382,
  "name": "broadcastIHave",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 74,
  "sha256": "f52969bc7fc4c6c0068453eec41e151be441d14ad39fff68c9a46eba868d0808",
  "lineNumber": 0,
  "columnNumber": 12_396,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBroadcastINeed": {
  "file": "worker",
  "start": 12_456,
  "end": 12_541,
  "descriptionStart": 12_456,
  "name": "broadcastINeed",
  "arity": 3,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 85,
  "sha256": "152c302997c0f7310a4422f2a2a66d59b533e8b15499f8aa726303c4dc624e12",
  "lineNumber": 0,
  "columnNumber": 12_470,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBroadcastIGive": {
  "file": "worker",
  "start": 12_541,
  "end": 12_638,
  "descriptionStart": 12_541,
  "name": "broadcastIGive",
  "arity": 4,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 97,
  "sha256": "0e24b2b9f31de73f0b4a6b629518e149268059d053aed0b7cc2ba40fb7f2caa3",
  "lineNumber": 0,
  "columnNumber": 12_555,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastPost": {
  "file": "worker",
  "start": 12_638,
  "end": 12_717,
  "descriptionStart": 12_638,
  "name": "post",
  "arity": 1,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 79,
  "sha256": "9dc43a09fc1339c50618ee681fa45a2967e94215e2a85361e1a9cb41a8d4f3c2",
  "lineNumber": 0,
  "columnNumber": 12_642,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBasePublish": {
  "file": "worker",
  "start": 9842,
  "end": 9926,
  "descriptionStart": 9842,
  "name": "publish",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 84,
  "sha256": "5f187de3262123ee1cdd5e9fd4cc789057e61148ce3ae18f5d44c475e17cd74b",
  "lineNumber": 0,
  "columnNumber": 9849,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseSubscribe": {
  "file": "worker",
  "start": 9926,
  "end": 10_043,
  "descriptionStart": 9926,
  "name": "subscribe",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 117,
  "sha256": "450d1d293308163521ccbbfc41dc0451d2390625dd6c288f4d1261a63d1c1bf5",
  "lineNumber": 0,
  "columnNumber": 9935,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBasePush": {
  "file": "worker",
  "start": 10_043,
  "end": 10_200,
  "descriptionStart": 10_043,
  "name": "push",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 157,
  "sha256": "5dd2e69c15d7d28dfdd72ae7debbd98f7658cd6cddcc59be370092f353a7a1dd",
  "lineNumber": 0,
  "columnNumber": 10_047,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBasePull": {
  "file": "worker",
  "start": 10_200,
  "end": 10_327,
  "descriptionStart": 10_200,
  "name": "pull",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 127,
  "sha256": "e29950318b78172dd347bce6fac59b5959b8e2e512714cd8b6cf2efb65682761",
  "lineNumber": 0,
  "columnNumber": 10_204,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseBroadcastPushedHeadMessage": {
  "file": "worker",
  "start": 10_327,
  "end": 10_418,
  "descriptionStart": 10_327,
  "name": "broadcastPushedHeadMessage",
  "arity": 1,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 91,
  "sha256": "863e4ae2c1f26ba18aa22bb0c3abe2099ff99c751b8864f5e1a1f8005dbbddf9",
  "lineNumber": 0,
  "columnNumber": 10_353,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseOnReceivedPublish": {
  "file": "worker",
  "start": 10_418,
  "end": 10_687,
  "descriptionStart": 10_418,
  "name": "onReceivedPublish",
  "arity": 3,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 269,
  "sha256": "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa",
  "lineNumber": 0,
  "columnNumber": 10_435,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseOnReceivedWhoHas": {
  "file": "worker",
  "start": 10_687,
  "end": 10_802,
  "descriptionStart": 10_687,
  "name": "onReceivedWhoHas",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 115,
  "sha256": "b9db33bd175c8a16bf6d30c385cbe57b8041220633682993ea3e3f0ed9afaa2a",
  "lineNumber": 0,
  "columnNumber": 10_703,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseOnReceivedIHave": {
  "file": "worker",
  "start": 10_802,
  "end": 11_081,
  "descriptionStart": 10_802,
  "name": "onReceivedIHave",
  "arity": 3,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 279,
  "sha256": "89aa5366398340c337c83945a7aa789e1195cf14342df97bb3baad14d272b3ad",
  "lineNumber": 0,
  "columnNumber": 10_817,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseOnReceivedINeed": {
  "file": "worker",
  "start": 11_081,
  "end": 11_372,
  "descriptionStart": 11_081,
  "name": "onReceivedINeed",
  "arity": 4,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 291,
  "sha256": "9d51dd69b28ae87fff452c7f9caa914de5ee1f79d9301e7de1190eb45a9bc14f",
  "lineNumber": 0,
  "columnNumber": 11_096,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastBaseOnReceivedIGive": {
  "file": "worker",
  "start": 11_372,
  "end": 11_667,
  "descriptionStart": 11_372,
  "name": "onReceivedIGive",
  "arity": 5,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 295,
  "sha256": "7c3ee4ce6ae8ba16e68c68b3de941647e2357be227d5b577542031bdef8ba0f4",
  "lineNumber": 0,
  "columnNumber": 11_387,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerRpcBaseSubscribeOnce": {
  "file": "worker",
  "start": 8239,
  "end": 8312,
  "descriptionStart": 8239,
  "name": "subscribeOnce",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 73,
  "sha256": "e5e12d56cd7e6f3b003eb4e5b36a07b9310be2227b64101e62bafb96207e4074",
  "lineNumber": 0,
  "columnNumber": 8252,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerRpcBasePullA": {
  "file": "worker",
  "start": 8312,
  "end": 8361,
  "descriptionStart": 8312,
  "name": "pullA",
  "arity": 1,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 49,
  "sha256": "0c6444029523a24e090d692a6758ab03a22f5804a273863d7922c5d2ca9e0497",
  "lineNumber": 0,
  "columnNumber": 8317,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerRpcBaseRpcService": {
  "file": "worker",
  "start": 8361,
  "end": 8711,
  "descriptionStart": 8361,
  "name": "rpcService",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 350,
  "sha256": "5cf13ec1e0a39519e5e278ba24fa7606bdaeb54eb27bfb91dee22b69f17b1c83",
  "lineNumber": 0,
  "columnNumber": 8371,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerRpcBaseRpcCall": {
  "file": "worker",
  "start": 8711,
  "end": 8984,
  "descriptionStart": 8711,
  "name": "rpcCall",
  "arity": 2,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 273,
  "sha256": "1721483546085355a236ebc6ac113012cfafca7ba4a0853af18f3d45848a3d9c",
  "lineNumber": 0,
  "columnNumber": 8718,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastClass": {
  "file": "worker",
  "start": 11_672,
  "end": 12_718,
  "descriptionStart": 11_672,
  "name": "JP",
  "arity": 1,
  "kind": "class",
  "strict": true,
  "async": false,
  "syntax": "class",
  "bytes": 1046,
  "sha256": "7205fbe0dc77e5742396733391d21b158dac507da6ce7b57ed9808ed24cd0812",
  "lineNumber": 0,
  "columnNumber": 11_700,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerBroadcastBaseClass": {
  "file": "worker",
  "start": 9717,
  "end": 11_668,
  "descriptionStart": 9717,
  "name": "KP",
  "arity": 0,
  "kind": "class",
  "strict": true,
  "async": false,
  "syntax": "class",
  "bytes": 1951,
  "sha256": "5012c1ef383ce45df668a00f61fb48621b2e50112d9bd15b3e891893a80d18a3",
  "lineNumber": 0,
  "columnNumber": 9745,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerRpcBaseClass": {
  "file": "worker",
  "start": 8169,
  "end": 8985,
  "descriptionStart": 8169,
  "name": "Mb",
  "arity": 0,
  "kind": "class",
  "strict": true,
  "async": false,
  "syntax": "class",
  "bytes": 816,
  "sha256": "aa3a0f4b1e732bc498df082f496f4d926666a095c16da4af973fa790e8e83a09",
  "lineNumber": 0,
  "columnNumber": 8186,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerRemove": {
  "file": "worker",
  "start": 7712,
  "end": 7815,
  "descriptionStart": 7712,
  "name": "Hg",
  "arity": 2,
  "kind": "regular",
  "strict": true,
  "async": false,
  "syntax": "function",
  "bytes": 103,
  "sha256": "9c865a249f6924e86ba0ba08c7e65b8d09a0ea5e4f491c7a99b0283e10ebf0f4",
  "lineNumber": 0,
  "columnNumber": 7723,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerEnsureArray": {
  "file": "worker",
  "start": 7815,
  "end": 7854,
  "descriptionStart": 7815,
  "name": "Ac",
  "arity": 2,
  "kind": "regular",
  "strict": true,
  "async": false,
  "syntax": "function",
  "bytes": 39,
  "sha256": "3105e62185e24095fff17489bda15dcd8657e756bd838a983decedea03d7f830",
  "lineNumber": 0,
  "columnNumber": 7826,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerEnsure": {
  "file": "worker",
  "start": 7854,
  "end": 7921,
  "descriptionStart": 7854,
  "name": "WP",
  "arity": 3,
  "kind": "regular",
  "strict": true,
  "async": false,
  "syntax": "function",
  "bytes": 67,
  "sha256": "092140314256918974a6092dbda12c051d1c537ede7a56a2ce6c7ee3c7ec99cb",
  "lineNumber": 0,
  "columnNumber": 7865,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerBroadcastTaskClass": {
  "file": "worker",
  "start": 7928,
  "end": 8165,
  "descriptionStart": 7928,
  "name": "wu",
  "arity": 2,
  "kind": "class",
  "strict": true,
  "async": false,
  "syntax": "class",
  "bytes": 237,
  "sha256": "b2cfc4d7b5ae6c0f08a2d5277ffd779403685308be265d6cca6bd9e89645cdc8",
  "lineNumber": 0,
  "columnNumber": 7945,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 },
 "innerBroadcastTaskCancel": {
  "file": "worker",
  "start": 7999,
  "end": 8045,
  "descriptionStart": 7999,
  "name": "cancel",
  "arity": 0,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 46,
  "sha256": "d305727d024fc4d843eed8e1af4c16cd1ccaed5f2f8864f4f5f25053ec0adcc8",
  "lineNumber": 0,
  "columnNumber": 8005,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastTaskRunning": {
  "file": "worker",
  "start": 8045,
  "end": 8077,
  "descriptionStart": 8045,
  "name": "running",
  "arity": 0,
  "kind": "method",
  "strict": true,
  "async": false,
  "syntax": "method",
  "bytes": 32,
  "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
  "lineNumber": 0,
  "columnNumber": 8052,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastTaskExecute": {
  "file": "worker",
  "start": 8077,
  "end": 8164,
  "descriptionStart": 8077,
  "name": "execute",
  "arity": 1,
  "kind": "method",
  "strict": true,
  "async": true,
  "syntax": "method",
  "bytes": 87,
  "sha256": "09ae1ae955dd319fee3e34c7819bb1f061e8c74ecb48c7851a3ba6f3b2091f27",
  "lineNumber": 0,
  "columnNumber": 8090,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "innerBroadcastClassCallback1": {
  "file": "worker",
  "start": 11_785,
  "end": 11_812,
  "descriptionStart": 11_785,
  "name": "",
  "arity": 1,
  "kind": "arrow",
  "strict": true,
  "async": false,
  "syntax": "expression",
  "bytes": 27,
  "sha256": "d257238e1366dbd0132b6a8f3445117f2db2c2c2daa50815aaacf4de8506d4b7",
  "lineNumber": 0,
  "columnNumber": 11_785,
  "ownNames": [
   "length",
   "name"
  ]
 },
 "workerClone": {
  "file": "worker",
  "start": 2570,
  "end": 2942,
  "descriptionStart": 2570,
  "name": "op",
  "arity": 1,
  "kind": "regular",
  "strict": true,
  "async": false,
  "syntax": "function",
  "bytes": 372,
  "sha256": "4ebfd01a8201efe7b61724bd5e327fb856f0458fbca0d0ac6f58c3bbc9504994",
  "lineNumber": 0,
  "columnNumber": 2581,
  "ownNames": [
   "length",
   "name",
   "prototype"
  ]
 }
}as const);
export type CurrentFootprintInverseNativeDeleteColdUiWorkerRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_SOURCE;
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_WORKER_SOURCE");}}
export function qualifyCurrentFootprintInverseNativeDeleteColdUiWorkerSource(source:string):void{qualify(source);for(const row of Object.values(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_SOURCE)){const text=source.slice(row.start,row.end);need(Buffer.byteLength(text)===row.bytes&&createHash("sha256").update(text).digest("hex")===row.sha256);}}
export function requireCurrentFootprintInverseNativeDeleteColdUiWorkerDescription(source:string,role:CurrentFootprintInverseNativeDeleteColdUiWorkerRole):void{const row=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_SOURCE[role];need(Buffer.byteLength(source)===row.bytes&&createHash("sha256").update(source).digest("hex")===row.sha256);}
