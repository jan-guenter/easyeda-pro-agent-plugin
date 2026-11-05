/** Inert bounded capture for fixed spatial programs, whose complete generated
 * declarations exceed the separate clock reply's16KiB string limit. */
import { types } from "node:util";

function refuse(): never { throw new Error("PCB_SPATIAL_COMMAND_INPUT"); }
export function captureCurrentPcbSpatialCommand(input: unknown): unknown {
  const seen = new Set<object>(); let nodes = 0;
  function copy(value: unknown, depth: number): unknown {
    nodes += 1;
    if (nodes > 128 || depth > 8) { return refuse(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > 65_536 || !value.isWellFormed()) { return refuse(); } return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return refuse(); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return refuse(); }
    seen.add(value);
    const read = (key: string): unknown => {
      const field = Object.getOwnPropertyDescriptor(value, key);
      if (field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true) { return refuse(); }
      return copy(field.value as unknown, depth + 1);
    };
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 16 || Reflect.ownKeys(value).length !== value.length + 1) { return refuse(); }
      return Object.freeze(Array.from({ length: value.length }, (_, index) => read(String(index))));
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null || keys.length > 32) { return refuse(); }
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (typeof key !== "string" || key.length > 128 || !key.isWellFormed()) { return refuse(); }
      Object.defineProperty(result, key, { value: read(key), enumerable: true });
    }
    return Object.freeze(result);
  }
  return copy(input, 0);
}
