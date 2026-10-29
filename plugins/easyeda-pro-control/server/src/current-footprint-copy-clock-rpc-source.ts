/** Exact original request/reply clock code. These pins and inert Node locations
 * do not establish an invocation, an authenticated sender or writer authority. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE = freezeDeep({
  worker: { bytes: 2_181_308, sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046",
    functions: {
      push: { start: 10_043, end: 10_200, bytes: 157, sha256: "5dd2e69c15d7d28dfdd72ae7debbd98f7658cd6cddcc59be370092f353a7a1dd", name: "push", arity: 2, lineNumber: 0, columnNumber: 10_047 },
      dispatch: { start: 11_081, end: 11_372, bytes: 291, sha256: "9d51dd69b28ae87fff452c7f9caa914de5ee1f79d9301e7de1190eb45a9bc14f", name: "onReceivedINeed", arity: 4, lineNumber: 0, columnNumber: 11_096 },
      reply: { start: 10_418, end: 10_687, bytes: 269, sha256: "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa", name: "onReceivedPublish", arity: 3, lineNumber: 0, columnNumber: 10_435 },
    } },
  ui: { bytes: 855_142, sha256: "7adb29ba4ea0bee9729caadc01c154d9299b1fc42e12f1c3f46e4343b5040e00",
    functions: {
      result: { start: 8383, end: 8695, bytes: 312, sha256: "3fddac48e66bb0bfe3c7535ca0159c98f5fc683df1c5409c06c0c21c468811fa", name: "i", arity: 1, lineNumber: 0, columnNumber: 8383 },
    } },
} as const);
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES = freezeDeep({
  // Full vendor scripts were compiled without executing them. Requested AST
  // Starts10165/11270/10578/8436 relocate to these Node24 V8 positions. Exact
  // Runtime allocation acknowledgments remain mandatory; Electron is untested.
  push: { realm: "worker", lineNumber: 0, columnNumber: 10_170, functionName: "push", functionLine: 0, functionColumn: 10_047, expression: "[this,e,t,s]" },
  dispatch: { realm: "worker", lineNumber: 0, columnNumber: 11_275, functionName: "onReceivedINeed", functionLine: 0, functionColumn: 11_096, expression: "[this,e,t,s,r,n,i]" },
  result: { realm: "ui", lineNumber: 0, columnNumber: 8449, functionName: "i", functionLine: 0, functionColumn: 8383, expression: "[this,s,r,n,a,t,e,i]" },
  reply: { realm: "worker", lineNumber: 0, columnNumber: 10_580, functionName: "onReceivedPublish", functionLine: 0, functionColumn: 10_435, expression: "[this,e,t,s,n,r]" },
  buildString: { realm: "worker", lineNumber: 109, columnNumber: 36_825, functionName: "buildString", functionLine: 109, functionColumn: 36_619, expression: "[this,n,l,qe]" },
  canvasString: { realm: "worker", lineNumber: 109, columnNumber: 42_324, functionName: "canvasString", functionLine: 109, functionColumn: 42_124, expression: "[this,s,a,qe]" },
} as const);
export type CurrentFootprintCopyClockRpcSite = keyof typeof CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES;
export type CurrentFootprintCopyClockRpcRealm = "worker" | "ui";
export interface CurrentFootprintCopyClockRpcSource {
  readonly profile: "private.current-footprint-copy-clock-rpc-source.v1";
  readonly realm: CurrentFootprintCopyClockRpcRealm;
  readonly sha256: string;
  readonly invocationObserved: false;
}
const issued = new WeakSet<object>();
const hash = (source: string): string => createHash("sha256").update(source).digest("hex");
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_CLOCK_RPC_SOURCE"); } }
export function qualifyCurrentFootprintCopyClockRpcSource(realm: CurrentFootprintCopyClockRpcRealm, source: unknown): CurrentFootprintCopyClockRpcSource {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE, realm));
  const profile = CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE[realm];
  need(typeof source === "string" && source.isWellFormed() && Buffer.byteLength(source) === profile.bytes && hash(source) === profile.sha256);
  const functions: Readonly<Record<string, Readonly<{ start: number; end: number; bytes: number; sha256: string }>>> = profile.functions;
  for (const expected of Object.values(functions)) {
    const fn = source.slice(expected.start, expected.end); need(Buffer.byteLength(fn) === expected.bytes && hash(fn) === expected.sha256);
  }
  const token = Object.freeze({ profile: "private.current-footprint-copy-clock-rpc-source.v1" as const, realm, sha256: profile.sha256, invocationObserved: false as const });
  issued.add(token); return token;
}
export function requireCurrentFootprintCopyClockRpcSource(token: CurrentFootprintCopyClockRpcSource, realm: CurrentFootprintCopyClockRpcRealm): void {
  need(issued.has(token) && token.realm === realm && token.sha256 === CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE[realm].sha256);
}
