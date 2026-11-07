/** Purpose-local original Inspector metadata. The qualified graph can contain
 * 384 references; the pinned renderer's largest class description is70,496
 * bytes. Neither fits the older clock packet's smaller purpose contract. */
import { types } from "node:util";

export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_METADATA_LIMITS = Object.freeze({ nodes: 8192, depth: 12, array: 513, fields: 32, key: 128, string: 131_072, bytes: 1_048_576 });
function fail(): never { throw new Error("SCHEMATIC_RELEVANCE_PREFIX_METADATA_CAPTURE"); }
/** No caller-selected budget, getter, Proxy, toJSON hook, alias or truncated
 * successful result is accepted. This copy supplies no owner or permission. */
export function captureCurrentSchematicRelevancePrefixMetadata(input: unknown): unknown {
  const limits = CURRENT_SCHEMATIC_RELEVANCE_PREFIX_METADATA_LIMITS; let nodes = 0; const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > limits.nodes || depth > limits.depth) { return fail(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > limits.string || !value.isWellFormed()) { return fail(); } return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return fail(); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return fail(); } seen.add(value);
    const own = (key: string): unknown => { const descriptor = Object.getOwnPropertyDescriptor(value, key); if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return fail(); } return descriptor.value as unknown; };
    if (Array.isArray(value)) {
      const size = Object.getOwnPropertyDescriptor(value, "length");
      if (Object.getPrototypeOf(value) !== Array.prototype || size === undefined || !Object.hasOwn(size, "value") || typeof size.value !== "number" || !Number.isSafeInteger(size.value) || size.value < 0 || size.value > limits.array || Reflect.ownKeys(value).length !== size.value + 1) { return fail(); }
      return Object.freeze(Array.from({ length: size.value }, (_unused, index) => copy(own(String(index)), depth + 1)));
    }
    const keys = Reflect.ownKeys(value); const prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null || keys.length > limits.fields) { return fail(); }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fresh null-prototype output receives only checked own data fields.
    const result = Object.create(null) as Record<string, unknown>;
    for (const key of keys) { if (typeof key !== "string" || key.length > limits.key || !key.isWellFormed()) { return fail(); } Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true }); }
    return Object.freeze(result);
  };
  const value = copy(input, 0);
  if (Object.getOwnPropertyDescriptor(Object.prototype, "toJSON") !== undefined || Object.getOwnPropertyDescriptor(Array.prototype, "toJSON") !== undefined || Buffer.byteLength(JSON.stringify(value)) > limits.bytes) { return fail(); }
  return value;
}
