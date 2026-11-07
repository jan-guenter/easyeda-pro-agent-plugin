/** Saved-load-only immutable packet capture. The original clock decoder keeps
 * its smaller limits. This scope carries at most one8KiB native cipher array. */
import { types } from "node:util";

function bad(): never { throw new Error("SAVED_LOAD_DATA_CAPTURE"); }
export function captureCurrentPcbViaSavedLoadData(input: unknown): unknown {
  let cells = 0; const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    cells += 1; if (cells > 16_384 || depth > 16) { return bad(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > 32_768 || !value.isWellFormed()) { return bad(); } return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return bad(); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return bad(); } seen.add(value);
    const own = (key: string): unknown => { const descriptor = Object.getOwnPropertyDescriptor(value, key); if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return bad(); } return descriptor.value as unknown; };
    if (Array.isArray(value)) {
      const length = Object.getOwnPropertyDescriptor(value, "length");
      if (Object.getPrototypeOf(value) !== Array.prototype || length === undefined || !Object.hasOwn(length, "value") || typeof length.value !== "number" || !Number.isSafeInteger(length.value) || length.value < 0 || length.value > 8192 || Reflect.ownKeys(value).length !== length.value + 1) { return bad(); }
      return Object.freeze(Array.from({ length: length.value }, (_, index) => copy(own(String(index)), depth + 1)));
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null || keys.length > 32) { return bad(); }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fresh empty null-prototype output receives only checked own data properties below.
    const result = Object.create(null) as Record<string, unknown>;
    for (const key of keys) { if (typeof key !== "string" || key.length > 128 || !key.isWellFormed()) { return bad(); } Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true }); }
    return Object.freeze(result);
  };
  const result = copy(input, 0); if (Object.getOwnPropertyDescriptor(Object.prototype, "toJSON") !== undefined || Object.getOwnPropertyDescriptor(Array.prototype, "toJSON") !== undefined) { return bad(); }
  if (Buffer.byteLength(JSON.stringify(result)) > 131_072) { return bad(); } return result;
}
