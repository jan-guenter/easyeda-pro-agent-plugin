/** Synthetic protocol metadata only, never connected bound-receiver evidence. */
import { CURRENT_PCB_TEARDROP_TARGET_PROFILES } from "../../src/current-pcb-teardrop-owner-scope.ts";
import { currentPcbTeardropSources } from "./current-pcb-teardrop-fixture.ts";

const property = (name: string, value: object, writable = false, configurable = true, enumerable = false): object =>
  ({ name, value, writable, configurable, enumerable, isOwn: true });
const nativeFunction = { type: "function", className: "Function", description: "function () { [native code] }" };
const arrayPrototype = { name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array.prototype", description: "Array(0)" } };
export const teardropCallbacksReply = (): object => ({ result: { type: "object", subtype: "array", className: "Array", description: "Array(6)", objectId: "teardrop-callbacks" } });
export const teardropProofReply = (): object => ({ result: { type: "object", subtype: "array", className: "Array", description: "Array(3)", objectId: "teardrop-proof" } });
export const teardropTupleReply = (): object => ({ result: [
  ...CURRENT_PCB_TEARDROP_TARGET_PROFILES.map((_profile, index) => property(String(index), { ...nativeFunction, objectId: `teardrop-callback-${index}` }, true, true, true)),
  property("length", { type: "number", value: 6 }, true, false),
], internalProperties: [arrayPrototype] });
export function teardropBoundReply(index: number): object {
  const expected = CURRENT_PCB_TEARDROP_TARGET_PROFILES[index], source = currentPcbTeardropSources[index];
  if (expected === undefined || source === undefined) { throw new Error("Synthetic teardrop index."); }
  return { result: [property("length", { type: "number", value: expected.arity }), property("name", { type: "string", value: `bound ${expected.name}` })],
    internalProperties: [
      { name: "[[Prototype]]", value: { ...nativeFunction, objectId: "function.prototype" } },
      { name: "[[TargetFunction]]", value: { type: "function", className: "Function", description: source, objectId: `teardrop-target-${index}` } },
      { name: "[[BoundThis]]", value: { type: "object", className: "Sfe", objectId: `teardrop-receiver-${index}` } },
      { name: "[[BoundArgs]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: `teardrop-arguments-${index}` } },
    ] };
}
export function teardropTargetReply(index: number, scriptId: string): object {
  const expected = CURRENT_PCB_TEARDROP_TARGET_PROFILES[index]; if (expected === undefined) { throw new Error("Synthetic teardrop index."); }
  return { result: [property("length", { type: "number", value: expected.arity }), property("name", { type: "string", value: expected.name })],
    internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId, lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } },
      { name: "[[Prototype]]", value: { ...nativeFunction, objectId: "function.prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: "method-scopes" } },
    ] };
}
export const teardropArgumentsReply = (): object => ({ result: [property("length", { type: "number", value: 0 }, true, false)], internalProperties: [arrayPrototype] });
