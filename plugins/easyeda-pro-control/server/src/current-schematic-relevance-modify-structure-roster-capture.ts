/** Cumulative Modify array descriptors need 257 rows for 256 objects and length.
 * Only their array/node caps differ from the ordinary clock-reply capture. */
import { types } from "node:util";

const LIMITS = Object.freeze({ nodes: 8192, depth: 12, array: 257, fields: 32, key: 128, stringUnits: 16_384, bytes: 131_072 });
function fail(): never { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_ROSTER_CAPTURE"); }
/** Copy complete own data before schema traversal. No getters, proxies,
 * aliases, inherited serializers or caller-selected budgets are accepted. */
export function captureCurrentSchematicRelevanceModifyStructureRosterReply(input: unknown): unknown {
  let nodes = 0; const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > LIMITS.nodes || depth > LIMITS.depth) { return fail(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > LIMITS.stringUnits || !value.isWellFormed()) { return fail(); } return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return fail(); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return fail(); } seen.add(value);
    const own = (key: string): unknown => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return fail(); }
      return descriptor.value as unknown;
    };
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || value.length > LIMITS.array || Reflect.ownKeys(value).length !== value.length + 1) { return fail(); }
      return Object.freeze(Array.from({ length: value.length }, (_unused, index) => copy(own(String(index)), depth + 1)));
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null || keys.length > LIMITS.fields) { return fail(); }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fresh null-prototype output receives only checked own data fields.
    const result = Object.create(null) as Record<string, unknown>;
    for (const key of keys) {
      if (typeof key !== "string" || key.length > LIMITS.key || !key.isWellFormed()) { return fail(); }
      Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true });
    }
    return Object.freeze(result);
  };
  const value = copy(input, 0);
  if (Object.getOwnPropertyDescriptor(Object.prototype, "toJSON") !== undefined || Object.getOwnPropertyDescriptor(Array.prototype, "toJSON") !== undefined || Buffer.byteLength(JSON.stringify(value)) > LIMITS.bytes) { return fail(); }
  return value;
}
