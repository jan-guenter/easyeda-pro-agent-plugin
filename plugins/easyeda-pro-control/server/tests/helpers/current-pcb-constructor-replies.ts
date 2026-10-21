/** Synthetic CDP records, not source or transport admission. */
import { CURRENT_PCB_CONSTRUCTOR_BUNDLES, CURRENT_PCB_CONSTRUCTOR_PROFILES } from "../../src/current-pcb-constructor-scope.ts";
import type { CurrentPcbConstructorBundleKind, CurrentPcbConstructorName } from "../../src/current-pcb-constructor-scope.ts";

function property(name: string, value: unknown, writable: boolean, configurable: boolean, enumerable = false): unknown {
  return { name, value, writable, configurable, enumerable, isOwn: true };
}
export function constructorHandle(name: CurrentPcbConstructorName): string {
  return `constructor-${CURRENT_PCB_CONSTRUCTOR_PROFILES[name].name}`;
}
export function constructorBundleReply(kind: CurrentPcbConstructorBundleKind): unknown {
  return { result: { type: "object", subtype: "array", className: "Array",
    description: `Array(${CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind].length})`, objectId: "constructors" } };
}
export function constructorTupleReply(kind: CurrentPcbConstructorBundleKind): unknown {
  const names = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind];
  return { result: [...names.map((name, index) => property(String(index), { type: "function", className: "Function",
    description: "synthetic class", objectId: constructorHandle(name) }, true, true, true)),
  property("length", { type: "number", value: names.length }, true, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
export function constructorPropertiesReply(name: CurrentPcbConstructorName, scriptId: string): unknown {
  const location = CURRENT_PCB_CONSTRUCTOR_PROFILES[name];
  return { result: [property("length", { type: "number", value: location.parameterCount }, false, true),
    property("name", { type: "string", value: location.name }, false, true),
    property("prototype", { type: "object", className: location.prototypeClassName, objectId: `prototype-${location.name}` }, false, false),
    ...Object.entries(location.staticFields).map(([key, value]) => property(key, { type: "number", value }, true, true, true))],
  internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location",
      value: { scriptId, lineNumber: location.lineNumber, columnNumber: location.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scope-${location.name}` } },
  ] };
}
export function constructorReplies(kind: CurrentPcbConstructorBundleKind, scriptId: string): readonly unknown[] {
  return [constructorBundleReply(kind), constructorTupleReply(kind),
    ...CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind].map(name => constructorPropertiesReply(name, scriptId))];
}
