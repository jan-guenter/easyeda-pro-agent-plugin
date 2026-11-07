/** Passive complete row comparison only. This structural reader issues no
 * original row token, GET completion, SDK or deletion authority. */
import type { CurrentFootprintInversePublicRowValue as Row } from "./current-footprint-inverse-public-row-data.ts";
import { compareCurrentFootprintInverseRuntimeRowProperties, qualifyCurrentFootprintInverseRuntimeRowPrototype } from "./current-footprint-inverse-public-row-runtime.ts";
import { currentFootprintInverseOwnDataParent, currentFootprintInverseOwnDataProperty } from "./current-footprint-inverse-own-data-replies.ts";
import { currentFootprintInverseLookupArray, currentFootprintInverseLookupResult } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue } from "./current-footprint-inverse-public-service-replies.ts";

export interface CurrentFootprintInversePublicRowReaderBindings {
  readonly current: () => void;
  readonly properties: (objectId: string) => Promise<unknown>;
  readonly call: (role: "capture" | "reprove", references: readonly string[], kind?: "Object" | "Array") => Promise<unknown>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_PUBLIC_ROW_READER"); } }
/** Core supplies a held original F2/M8 value and its genuine immutable row
 * plan. Each newly encountered object is inspected before any helper uses it. */
export async function readCurrentFootprintInversePublicRow(root: string, expected: Row, bindings: CurrentFootprintInversePublicRowReaderBindings): Promise<Readonly<{ reprove: () => Promise<void>; objects: number }>> {
  need(expected.kind === "object"); const snapshots: Readonly<{ snapshot: string; row: string; expected: Row }>[] = [];
  const visit = async (row: string, value: Row, depth: number): Promise<void> => {
    bindings.current(); need(depth <= 8 && snapshots.length < 128 && (value.kind === "object" || value.kind === "array"));
    const raw = await bindings.properties(row); bindings.current(); const children = compareCurrentFootprintInverseRuntimeRowProperties(raw, value);
    const prototype = currentFootprintInverseOwnDataParent(raw, value.kind === "array" ? "array" : "object"); const prototypeReply = await bindings.properties(prototype); bindings.current();
    const kind = value.kind === "array" ? "Array" : "Object";
    // The existing passive qualifier obtains the native constructor from the
    // Exact prototype packet. The helper then proves all three JS identities.
    const constructor = nativeConstructor(prototypeReply); const constructorReply = await bindings.properties(constructor); bindings.current();
    const native = qualifyCurrentFootprintInverseRuntimeRowPrototype(prototypeReply, constructorReply, kind); need(native.constructor === constructor);
    const snapshot = currentFootprintInverseLookupResult(await bindings.call("capture", [row, prototype, constructor], kind), 4); currentFootprintInverseLookupArray(await bindings.properties(snapshot), 4); bindings.current();
    snapshots.push(Object.freeze({ snapshot, row, expected: value }));
    for (const child of children) { await visit(child.objectId, child.expected, depth + 1); }
  };
  await visit(root, expected, 0);
  const reprove = async (): Promise<void> => { for (const entry of snapshots) { bindings.current(); compareCurrentFootprintInverseRuntimeRowProperties(await bindings.properties(entry.row), entry.expected); bindings.current(); requireCurrentFootprintInversePublicServiceTrue(await bindings.call("reprove", [entry.snapshot, entry.row])); bindings.current(); } };
  await reprove(); return Object.freeze({ reprove, objects: snapshots.length });
}
function nativeConstructor(input: unknown): string {
  // Reuse only the passive property packet decoder; no constructor is called.
  const value = currentFootprintInverseOwnDataProperty(input, "constructor", "constructor"); need(value.objectId !== undefined); return value.objectId;
}
/** The enclosing finite GET protocol admits these exact declarations only. */
export { CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_PROGRAMS_V2 as CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_READER_PROGRAMS } from "./current-footprint-inverse-public-row-programs-v2.ts";
