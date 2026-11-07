/** Fixed passive preparation at the original F2 entry. Its host retains the
 * original receipt, pause and command/reply pairs; this leaf grants no resume. */
import type { CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-lookup-native-programs.ts";
import { qualifyCurrentFootprintInverseLookupNativeConstructor as constructor, qualifyCurrentFootprintInverseLookupNativeMethod as method, currentFootprintInverseLookupNativeParent as parentValue, currentFootprintInverseLookupNativeResult as remoteResult } from "./current-footprint-inverse-lookup-native-metadata.ts";
import type { CurrentFootprintInverseLookupNativeConstructorRole as Constructor } from "./current-footprint-inverse-lookup-native-metadata.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

export interface CurrentFootprintInverseGetIntrinsicsBindings {
  readonly current: () => void;
  readonly call: (role: Exclude<keyof typeof PROGRAMS, "applicationApply" | "realm">, references: readonly string[]) => Promise<unknown>;
  readonly properties: (objectId: string) => Promise<unknown>;
}
export interface CurrentFootprintInverseGetIntrinsicGraph {
  readonly roots: string; readonly members: string; readonly qualified: string;
  readonly iterator: string; readonly iteratorProof: string; readonly asyncPrototype: string;
  readonly reprove: () => Promise<void>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_GET_INTRINSIC_GRAPH"); } }
const nullValue = (value: Remote): boolean => value.type === "object" && value.subtype === "null" && value.value === null && value.objectId === undefined;
const rootConstructorRoles = ["Object", "Array", "Function", "Symbol", "Promise", "Date", "ArrayBuffer", "SharedArrayBuffer", "Blob", "FormData", "Uint8ClampedArray", "HTMLImageElement", "String", "Number", "WeakRef"] as const;
const constructorRoles = [...rootConstructorRoles, "TypedArray", "HTMLElement", "Element", "Node", "EventTarget"] as const;
/** Metadata precedes every traversal of a newly returned object. Constructor
 * parents and JS identity are rejoined by the fixed programs, not objectId text. */
export async function collectCurrentFootprintInverseGetIntrinsics(b: CurrentFootprintInverseGetIntrinsicsBindings): Promise<CurrentFootprintInverseGetIntrinsicGraph> {
  const saved: { objectId: string; role: Constructor; remote: Remote }[] = [];
  const props = async (id: string): Promise<unknown> => { b.current(); const raw = await b.properties(id); b.current(); return raw; };
  const call = async (role: Exclude<keyof typeof PROGRAMS, "applicationApply" | "realm">, refs: readonly string[]): Promise<unknown> => { b.current(); const raw = await b.call(role, refs); b.current(); return raw; };
  const tuple = async (role: Exclude<keyof typeof PROGRAMS, "applicationApply" | "realm">, refs: readonly string[], size: number): Promise<Readonly<{ id: string; values: readonly Remote[] }>> => { const id = result(await call(role, refs), size); return Object.freeze({ id, values: array(await props(id), size) }); };
  const opaque = async (values: readonly Remote[]): Promise<void> => { for (const value of values) { if (!nullValue(value)) { properties(await props(object(value))); } } };
  const nativeConstructor = async (value: Remote, role: Constructor): Promise<void> => { constructor(await props(object(value)), value, role); saved.push({ objectId: object(value), role, remote: value }); };
  const roots = await tuple("roots", [], 20);
  for (let index = 0; index < 19; index += 1) {
    const value = roots.values[index]; need(value !== undefined);
    if (nullValue(value)) { need(index === 7 || index === 11 || index === 14); }
    else if (index < 15) { const name = rootConstructorRoles[index]; need(name !== undefined); await nativeConstructor(value, name); }
    else if (index === 16 || index === 17) { method(await props(object(value)), value, index === 16 ? "setTimeout" : "clearTimeout"); }
    else { properties(await props(object(value))); }
  }
  const rootGuard = roots.values[19]; need(rootGuard?.type === "function"); properties(await props(object(rootGuard)));
  let qualified = roots.id;
  const merge = async (next: string): Promise<void> => {
    const raw = await call("merge", [qualified, next]); need(raw !== null && typeof raw === "object" && "result" in raw && raw.result !== null && typeof raw.result === "object" && "description" in raw.result && typeof raw.result.description === "string");
    const match = /^Array\((0|[1-9]\d?)\)$/u.exec(raw.result.description); need(match !== null); const size = Number(match[1]); need(size >= 1 && size <= 64); qualified = result(raw, size); array(await props(qualified), size);
  };
  const prototypes = await tuple("prototypes", [roots.id], 15); await opaque(prototypes.values); await merge(prototypes.id);
  let parent = await tuple("parents", [roots.id], 15);
  for (let depth = 0; depth < 5; depth += 1) {
    let nonempty = false;
    for (const value of parent.values) {
      if (!nullValue(value)) { nonempty = true;
        need(value.type === "function" && typeof value.description === "string");
        const role = constructorRoles.find(name => value.description === `function ${name}() { [native code] }`); need(role !== undefined); await nativeConstructor(value, role);
      }
    }
    await merge(parent.id); if (!nonempty) { break; }
    need(depth < 4); parent = await tuple("nextParents", [parent.id], 15);
  }
  const members = await tuple("members", [roots.id, qualified], 24);
  const roles = ["hasInstance", "map", "hasOwnProperty", "call", "species", "species", "race", "resolve", "promiseThen", "promiseCatch", "push", "shift", "splice", "values", "deref", "stringify", "error", "debug"] as const;
  for (const [index, role] of roles.entries()) { const value = members.values[index + 3]; need(value !== undefined); if (!(role === "deref" && nullValue(value))) { method(await props(object(value)), value, role); } }
  await opaque(members.values.slice(21)); truth(await call("defaultInstance", [roots.id, members.id, qualified])); truth(await call("hooks", [roots.id, members.id]));
  const iterator = object(remoteResult(await call("iterator", [members.id]))); const iteratorProperties = await props(iterator); properties(iteratorProperties);
  const iteratorPrototype = object(parentValue(iteratorProperties)); properties(await props(iteratorPrototype));
  const iteratorProof = await tuple("iteratorNext", [iterator, iteratorPrototype], 2); const next = iteratorProof.values[0]; need(next !== undefined); method(await props(object(next)), next, "next");
  const asyncPrototype = object(remoteResult(await call("asyncPrototype", []))); properties(await props(asyncPrototype));
  const reprove = async (): Promise<void> => { b.current(); for (const item of saved) { constructor(await props(item.objectId), item.remote, item.role); } truth(await call("defaultInstance", [roots.id, members.id, qualified])); truth(await call("hooks", [roots.id, members.id])); b.current(); };
  await reprove(); return Object.freeze({ roots: roots.id, members: members.id, qualified, iterator, iteratorProof: iteratorProof.id, asyncPrototype, reprove });
}
