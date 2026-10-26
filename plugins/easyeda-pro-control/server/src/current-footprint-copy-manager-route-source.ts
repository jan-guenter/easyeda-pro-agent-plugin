/** Exact parent manager route source. Qualification never evaluates supplied
 * source or invokes the initialized registry's lazy getInstance method. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE = freezeDeep({
  relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
  sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d",
  functions: {
  "rpcUi": {
    "bundle": "ui",
    "start": 1_650_139,
    "end": 1_650_404,
    "bytes": 265,
    "sha256": "ffc74c64be71140f4e6d8cc2cacc9be76f838d970c90e7f3fcca8eca9bd41d7a",
    "name": "",
    "arity": 3,
    "async": false,
    "prototype": false,
    "lineNumber": 1033,
    "columnNumber": 29_836
  },
  "rpcManager": {
    "bundle": "manager",
    "start": 7139,
    "end": 7403,
    "bytes": 264,
    "sha256": "ed792a63b5bb2ea4315c741f697492b7252c637aebadd52dc8cc8d41c2db7596",
    "name": "",
    "arity": 3,
    "async": false,
    "prototype": false,
    "lineNumber": 0,
    "columnNumber": 7139
  },
  "workerRpcCall": {
    "bundle": "manager",
    "start": 8711,
    "end": 8984,
    "bytes": 273,
    "sha256": "0190800b8b1cee6ed4683d6f10131957c2dae7c75b9bfb27aff73105ee5699f3",
    "name": "rpcCall",
    "arity": 2,
    "async": false,
    "prototype": false,
    "lineNumber": 0,
    "columnNumber": 8718
  },
  "registryGet": {
    "bundle": "manager",
    "start": 1_701_933,
    "end": 1_701_963,
    "bytes": 30,
    "sha256": "2c5909596b987213a5a40d2c63ff8a1a2bad7d07d03378ed36220214ba9854fc",
    "name": "get",
    "arity": 1,
    "async": false,
    "prototype": false,
    "lineNumber": 104,
    "columnNumber": 42_337
  },
  "registryInstance": {
    "bundle": "manager",
    "start": 1_702_260,
    "end": 1_702_321,
    "bytes": 61,
    "sha256": "fde24f12c9a137ac1da42e1b9452be5204f7030309029be3a1d49103c93f8b31",
    "name": "getInstance",
    "arity": 0,
    "async": false,
    "prototype": false,
    "lineNumber": 104,
    "columnNumber": 42_672
  },
  "footprintGetStr": {
    "bundle": "manager",
    "start": 1_735_718,
    "end": 1_735_887,
    "bytes": 169,
    "sha256": "348eb62d18eff5005d2c839b4bf393d9ea2dc5810b2e49e23879c123517d0e7e",
    "name": "getStr",
    "arity": 1,
    "async": true,
    "prototype": false,
    "lineNumber": 104,
    "columnNumber": 76_131
  },
  "channelProducer": {
    "bundle": "manager",
    "start": 1_780_804,
    "end": 1_780_880,
    "bytes": 76,
    "sha256": "6c2c463dc1eee064096168b0bd74eaa274859329e6cf87f2b2f62cb4496fcaa6",
    "name": "Hn",
    "arity": 1,
    "async": false,
    "prototype": true,
    "lineNumber": 104,
    "columnNumber": 121_216
  },
  "registryLookup": {
    "bundle": "manager",
    "start": 1_787_848,
    "end": 1_787_978,
    "bytes": 130,
    "sha256": "a19da670950bcd31bb55fd85b6570ab5b9a5747c1fed6c91aad9912977a15047",
    "name": "K",
    "arity": 0,
    "async": false,
    "prototype": true,
    "lineNumber": 104,
    "columnNumber": 128_259
  },
  "service": {
    "bundle": "manager",
    "start": 2_052_419,
    "end": 2_052_436,
    "bytes": 17,
    "sha256": "512ac07a880e8f3f177579d316ccc1058ac7f8b3d2ea1459ab27651c89ebe344",
    "name": "",
    "arity": 1,
    "async": true,
    "prototype": false,
    "lineNumber": 108,
    "columnNumber": 25_065
  },
  "handler": {
    "bundle": "manager",
    "start": 2_071_870,
    "end": 2_071_952,
    "bytes": 82,
    "sha256": "f6f329ea42539f0f5d350a4aa31f72e6dad479f0a6eae9893db1a30e4ca0a3b9",
    "name": "",
    "arity": 2,
    "async": true,
    "prototype": false,
    "lineNumber": 108,
    "columnNumber": 44_516
  }
} as const,
});
export type CurrentFootprintCopyManagerRouteFunction = keyof typeof CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE.functions;
export interface CurrentFootprintCopyManagerRouteSource { readonly sha256: string; readonly runtimeBound: false }
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE"); } }
function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
/** The sole large manager reply gets its own fixed bound. It is retained
 * before owner reproof, then the full exact source hash qualifies it separately. */
export function captureCurrentFootprintCopyManagerRouteSourceReply(input: unknown): Readonly<{ scriptSource: string }> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"), keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource" && descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
    descriptor.enumerable === true && typeof descriptor.value === "string" && descriptor.value.isWellFormed() &&
    Buffer.byteLength(descriptor.value) <= CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE.bytes);
  return Object.freeze({ scriptSource: descriptor.value });
}
export function assertCurrentFootprintCopyManagerRouteFunction(role: CurrentFootprintCopyManagerRouteFunction, text: unknown): void {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE.functions, role));
  const profile = CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE.functions[role];
  need(typeof text === "string" && text.isWellFormed() && Buffer.byteLength(text) === profile.bytes && hash(text) === profile.sha256);
}
export function qualifyCurrentFootprintCopyManagerRouteSource(input: unknown): CurrentFootprintCopyManagerRouteSource {
  const profile = CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE;
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256);
  for (const role of ["rpcUi", "rpcManager", "workerRpcCall", "registryGet", "registryInstance", "footprintGetStr", "channelProducer", "registryLookup", "service", "handler"] as const) {
    const fn = profile.functions[role]; if (fn.bundle === "manager") { assertCurrentFootprintCopyManagerRouteFunction(role, input.slice(fn.start, fn.end)); }
  }
  const token = Object.freeze({ sha256: profile.sha256, runtimeBound: false as const }); originals.add(token); return token;
}
export function requireCurrentFootprintCopyManagerRouteSource(input: unknown): void {
  need(typeof input === "object" && input !== null && originals.has(input));
}
