/** Capture actual receiver resolution together with every original prototype
 * descriptor. These checks retain references; they issue no native authority. */
import { types } from "node:util";

interface PrototypeEntry {
  readonly original: object;
  readonly parent: object | null;
  readonly fields: ReadonlyMap<PropertyKey, PropertyDescriptor>;
}
export type CurrentFootprintForwardExecutionPrototypeSnapshot = readonly PrototypeEntry[];
function fail(): never { throw new Error("FORWARD_EXECUTION_ORIGINAL_METHODS_CHANGED"); }
export function captureCurrentFootprintForwardExecutionPrototypes(prototype: object): CurrentFootprintForwardExecutionPrototypeSnapshot {
  const entries: PrototypeEntry[] = []; let current: object | null = prototype;
  while (current !== null && current !== Object.prototype) {
    if (types.isProxy(current)) { fail(); }
    const fields = new Map<PropertyKey, PropertyDescriptor>();
    for (const key of Reflect.ownKeys(current)) { const descriptor = Object.getOwnPropertyDescriptor(current, key); if (descriptor === undefined) { fail(); } fields.set(key, Object.freeze(descriptor)); }
    const parent: unknown = Object.getPrototypeOf(current);
    if (parent !== null && typeof parent !== "object") { fail(); }
    entries.push(Object.freeze({ original: current, parent, fields })); current = parent;
  }
  return Object.freeze(entries);
}
export function requireCurrentFootprintForwardExecutionPrototypes(snapshot: CurrentFootprintForwardExecutionPrototypeSnapshot): void {
  for (const entry of snapshot) {
    if (types.isProxy(entry.original) || Object.getPrototypeOf(entry.original) !== entry.parent || Reflect.ownKeys(entry.original).length !== entry.fields.size) { fail(); }
    for (const [key, original] of entry.fields) {
      const actual = Object.getOwnPropertyDescriptor(entry.original, key);
      if (actual === undefined || actual.configurable !== original.configurable || actual.enumerable !== original.enumerable || actual.writable !== original.writable ||
          actual.value !== original.value || actual.get !== original.get || actual.set !== original.set) { fail(); }
    }
  }
}
function method(receiver: object, key: string): unknown {
  let current: object | null = receiver;
  while (current !== null) {
    if (types.isProxy(current)) { fail(); }
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor !== undefined) { if (!Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "function") { fail(); } return descriptor.value as unknown; }
    const parent: unknown = Object.getPrototypeOf(current);
    if (parent !== null && typeof parent !== "object") { fail(); }
    current = parent;
  }
  return fail();
}
/** Accessors are rejected without invocation; a shadow of an inherited helper
 * cannot reuse a prototype-only snapshot even when every prototype is intact. */
export function captureCurrentFootprintForwardExecutionReceiver(receiver: object, snapshot: CurrentFootprintForwardExecutionPrototypeSnapshot,
  keys: readonly string[]): () => void {
  requireCurrentFootprintForwardExecutionPrototypes(snapshot);
  if (types.isProxy(receiver) || Reflect.ownKeys(receiver).length > 0 || Object.getPrototypeOf(receiver) !== snapshot[0]?.original) { fail(); }
  const values = new Map(keys.map(key => [key, method(receiver, key)]));
  return (): void => {
    requireCurrentFootprintForwardExecutionPrototypes(snapshot);
    if (types.isProxy(receiver) || Reflect.ownKeys(receiver).length > 0 || Object.getPrototypeOf(receiver) !== snapshot[0]?.original) { fail(); }
    for (const [key, value] of values) { if (method(receiver, key) !== value) { fail(); } }
  };
}
