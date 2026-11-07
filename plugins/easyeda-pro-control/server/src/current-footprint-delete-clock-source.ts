/** Single inverse clock source. Source equality and inert V8 locations supply
 * no original native owner, invocation, actor, clock result or inverse grant. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES as RPC_SITES, qualifyCurrentFootprintCopyClockRpcSource, requireCurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";
import type { CurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";
import { CURRENT_FOOTPRINT_DELETE_SOURCE, assertCurrentFootprintDeleteSource } from "./current-footprint-delete-source.ts";
import { qualifyCurrentFootprintDeleteTriggerSource } from "./current-footprint-delete-trigger-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_DELETE_CLOCK_SITES = freezeDeep({
  entry: { realm: "worker", lineNumber: 109, columnNumber: 40_070, functionName: "deleteString", functionLine: 109, functionColumn: 40_040, expression: "[this,s,qe]" },
  push: RPC_SITES.push, dispatch: RPC_SITES.dispatch, result: RPC_SITES.result, reply: RPC_SITES.reply,
  producer: { realm: "worker", lineNumber: 109, columnNumber: 40_077, functionName: "deleteString", functionLine: 109, functionColumn: 40_040, expression: "[this,s,n,qe]" },
} as const);
export const CURRENT_FOOTPRINT_DELETE_CLOCK_ORDER = Object.freeze(["entry", "push", "dispatch", "result", "reply", "producer"] as const);
export type CurrentFootprintDeleteClockSite = keyof typeof CURRENT_FOOTPRINT_DELETE_CLOCK_SITES;
export interface CurrentFootprintDeleteClockSource {
  readonly profile: "private.current-footprint-delete-clock-source.v1";
  readonly realm: "worker" | "ui";
  readonly sha256: string;
  readonly singleDeleteProducerSourceQualified: boolean;
  readonly invocationObserved: false;
  readonly executionAuthorized: false;
}
const sources = new WeakMap<CurrentFootprintDeleteClockSource, CurrentFootprintCopyClockRpcSource>();
export function assertCurrentFootprintDeleteClockMethod(input: unknown): void {
  assertCurrentFootprintDeleteSource("deleteString", input);
  if (typeof input !== "string" || createHash("sha256").update(input).digest("hex") !== CURRENT_FOOTPRINT_DELETE_SOURCE.deleteString.sha256) { throw new Error("FOOTPRINT_DELETE_CLOCK_SOURCE"); }
}
export function qualifyCurrentFootprintDeleteClockSource(realm: "worker" | "ui", input: unknown): CurrentFootprintDeleteClockSource {
  const original = qualifyCurrentFootprintCopyClockRpcSource(realm, input);
  if (realm === "worker") { qualifyCurrentFootprintDeleteTriggerSource(input); }
  const token = Object.freeze({ profile: "private.current-footprint-delete-clock-source.v1" as const, realm, sha256: original.sha256,
    singleDeleteProducerSourceQualified: realm === "worker", invocationObserved: false as const, executionAuthorized: false as const });
  sources.set(token, original); return token;
}
export function requireCurrentFootprintDeleteClockSource(token: CurrentFootprintDeleteClockSource, realm: "worker" | "ui"): void {
  const original = sources.get(token);
  if (original === undefined || token.realm !== realm) { throw new Error("FOOTPRINT_DELETE_CLOCK_ORIGINAL_SOURCE"); }
  requireCurrentFootprintCopyClockRpcSource(original, realm);
}
