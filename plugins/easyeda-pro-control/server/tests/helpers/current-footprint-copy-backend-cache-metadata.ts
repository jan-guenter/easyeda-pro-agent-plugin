/** Synthetic native metadata only. No browser ownership or cache I/O. */
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_NATIVE_PROFILES as PROFILES } from "../../src/current-footprint-copy-backend-cache.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });

export function backendCacheArrayTail(): Data[] {
  return [
    ...["JP", "bb", "bb", "Cache", "Cache"].map((className, index) => property(String(index + 61),
      { type: "object", className, objectId: `runtime-${String(index)}` }, true, true)),
    ...PROFILES.map((profile, index) => property(String(index + 66), { type: "function", className: "Function",
      description: `function ${profile.name}() { [native code] }`, objectId: `native-${String(index)}` }, true, true)),
  ];
}

export function backendCacheNativeMetadata(index: number): Data {
  const profile = PROFILES[index]; if (profile === undefined) { throw new Error("TEST_CACHE_NATIVE_INDEX"); }
  const result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (index === 0) { result.push(property("prototype", { type: "object", className: "Cache", description: "Cache", objectId: "cache-prototype" }, false, false, false)); }
  return { result, internalProperties: [
    { name: "[[Prototype]]", value: { type: "function", className: "Function", description: "function () { [native code] }", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } },
  ] };
}
