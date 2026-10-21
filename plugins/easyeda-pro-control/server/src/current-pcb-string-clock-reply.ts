/** Bounded immutable clock-reply capture before any post-await owner callback.
 * No getters, proxies, toJSON hooks or inherited array serialization run. */
import { types } from "node:util";
import { sha256Text } from "./core.ts";

function fail(): never { throw new Error("PCB_STRING_CLOCK_REPLY_CAPTURE"); }
export function captureCurrentPcbStringClockReply(input: unknown): Readonly<{ value: unknown; text: string; sha256: string }> {
  let nodes = 0;
  const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > 1024 || depth > 12) { return fail(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > 16_384 || !value.isWellFormed()) { return fail(); } return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return fail(); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return fail(); } seen.add(value);
    const own = (key: string): unknown => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return fail(); }
      return descriptor.value as unknown;
    };
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 256 || Reflect.ownKeys(value).length !== value.length + 1) { return fail(); }
      const result = Array.from({ length: value.length }, (_, index) => copy(own(String(index)), depth + 1)); return Object.freeze(result);
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null || keys.length > 32) { return fail(); }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The newly allocated empty null-prototype object receives only checked own data fields below.
    const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const key of keys) {
      if (typeof key !== "string" || key.length > 128 || !key.isWellFormed()) { return fail(); }
      Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true });
    }
    return Object.freeze(result);
  };
  const value = copy(input, 0); const text = JSON.stringify(value);
  if (Buffer.byteLength(text) > 131_072) { return fail(); }
  return Object.freeze({ value, text, sha256: sha256Text(text) });
}
