/** A single natural qe result for this native DEL. Fixed source facts grant no
 * original Job, service registration, request, resume or mutation authority. */
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES as V2 } from "./current-footprint-copy-clock-rpc-v2-profile.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_SITES as DELETE } from "./current-footprint-delete-clock-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_GROUP = "easyeda-footprint-inverse-native-delete-clock-v1";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_SITES = freezeDeep({
  entry: { ...DELETE.entry, expression: "[this,s,r,i,qe]" },
  push: V2.push,
  qeReturned: { realm: "worker", lineNumber: 108, columnNumber: 9749, functionName: "qe", functionLine: 108, functionColumn: 9674, expression: "[qe]" },
  dispatch: V2.dispatch, result: V2.result, reply: V2.reply,
  producer: { ...DELETE.producer, expression: "[this,s,r,i,n,qe]" },
} as const);
export { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_CALLER as CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALLER } from "./current-footprint-copy-clock-rpc-v2-profile.ts";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER = Object.freeze(["entry", "push", "qeReturned", "dispatch", "result", "reply", "producer"] as const);
export type CurrentFootprintInverseNativeDeleteClockSite = typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER[number];
