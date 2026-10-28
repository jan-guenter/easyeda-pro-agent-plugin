/** Exact original renderer clock registration. Source qualification grants no
 * clock result, responder exclusivity or Electron-main backend ownership. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE = freezeDeep({
  relativePath: "pro-mgr/3.2.185.bf63a159/js/ws-service.js", bytes: 855_142,
  sha256: "7adb29ba4ea0bee9729caadc01c154d9299b1fc42e12f1c3f46e4343b5040e00",
  functions: {
    wrapper: { start: 8383, end: 8695, bytes: 312, name: "i", arity: 1, lineNumber: 0, columnNumber: 8383,
      sha256: "3fddac48e66bb0bfe3c7535ca0159c98f5fc683df1c5409c06c0c21c468811fa" },
    callback: { start: 851_606, end: 851_623, bytes: 17, name: "", arity: 0, lineNumber: 28, columnNumber: 23_421,
      sha256: "2c7bd02ac5405909c1e86e8259159dfa5c5c32dd1b14937b18c048592f984e7b" },
  },
});
export type CurrentFootprintCopyClockRegistrationFunction = keyof typeof CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE.functions;
export interface CurrentFootprintCopyClockRegistrationSource { readonly sha256: string; readonly runtimeBound: false }
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE"); } }
function hash(text: string): string { return createHash("sha256").update(text).digest("hex"); }
export function assertCurrentFootprintCopyClockRegistrationFunction(role: CurrentFootprintCopyClockRegistrationFunction, input: unknown): void {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE.functions, role));
  const profile = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE.functions[role];
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256);
}
/** Keep the sole large source reply out of the small clock packet decoder. */
export function captureCurrentFootprintCopyClockRegistrationSourceReply(input: unknown): Readonly<{ scriptSource: string }> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"), keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource" && descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
    descriptor.enumerable === true && typeof descriptor.value === "string" && descriptor.value.isWellFormed() &&
    Buffer.byteLength(descriptor.value) <= CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE.bytes);
  return Object.freeze({ scriptSource: descriptor.value });
}
export function qualifyCurrentFootprintCopyClockRegistrationSource(input: unknown): CurrentFootprintCopyClockRegistrationSource {
  const profile = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE;
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256);
  for (const role of ["wrapper", "callback"] as const) { const fn = profile.functions[role]; assertCurrentFootprintCopyClockRegistrationFunction(role, input.slice(fn.start, fn.end)); }
  const token = Object.freeze({ sha256: profile.sha256, runtimeBound: false as const }); originals.add(token); return token;
}
export function requireCurrentFootprintCopyClockRegistrationSource(input: unknown): void { need(input !== null && typeof input === "object" && originals.has(input)); }
