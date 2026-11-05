/** Fixed mixed-origin profile only. Source positions are not Electron pause
 * evidence: every allocation and pause must exactly match or be refused. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES as LEGACY } from "./current-footprint-copy-clock-rpc-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as REGISTRATION } from "./current-footprint-copy-clock-registration-v2-source.ts";

export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_GROUP = "easyeda-footprint-clock-rpc-v2";
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES = freezeDeep({
  push: LEGACY.push, dispatch: LEGACY.dispatch,
  // Promise follows the original callback's synchronous return. Unlike the
  // V1 profile, this candidate has not been compiled or allocated in V8.
  result: { realm: "ui", lineNumber: 1, columnNumber: 86_544, functionName: "k", functionLine: 1, functionColumn: 86_476,
    expression: "[this,B,q,Q,ee,v,y,k]" },
  reply: LEGACY.reply, buildString: LEGACY.buildString, canvasString: LEGACY.canvasString,
} as const);
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_CALLER = freezeDeep({
  expression: "[this,y,v,k,B,q,oe,Q]", functionName: "onReceivedIGive", lineNumber: 1, columnNumber: 89_687,
  functionLine: 1, functionColumn: 89_481, start: 138_394, end: 138_695, bytes: 301,
  sha256: "2ce36d5c7ef52b45cb2f652a153efab8cf4a505c25678cb3c141e691864a0d00",
} as const);
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SOURCE_ROLES = freezeDeep({
  wrapper: REGISTRATION.wrapper, callback: REGISTRATION.callback,
  resultScriptRole: "wrapper", callerScriptRole: "wrapper", callbackScopeScriptRole: "callback",
  distinctUiScriptIdsRequired: true, optimizedScopeAvailabilityObserved: false, nativeMounted: false, executionAuthorized: false,
} as const);
export type CurrentFootprintCopyClockRpcV2Site = keyof typeof CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES;
