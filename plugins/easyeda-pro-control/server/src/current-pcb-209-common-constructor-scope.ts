/** Exact209 constructor locations for the four fixed common owners. No
 * constructor invocation, name-only fallback, caller profile or source override. */
import { types } from "node:util";
import { z } from "zod";
import { currentPcbConstructorFailure } from "./current-pcb-constructor-failure.ts";
import { CURRENT_PCB_209_COMMON_CONSTRUCTORS } from "./current-pcb-209-common-profile.ts";
import type { CurrentPcb209CommonConstructor } from "./current-pcb-209-common-profile.ts";

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(16_384).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(),
  value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function refuse(): never { throw new Error("PCB_CONSTRUCTOR_SCOPE"); }

function data(input: unknown): unknown { return copyData(input, 0, { nodes: 0, bytes: 0 }); }
function copyData(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (budget.nodes > 2048 || depth > 10) { return refuse(); }
  if (input === null || typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (input.length > 16_384 || !input.isWellFormed() || budget.bytes > 262_144) { return refuse(); }
    return input;
  }
  if (typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) { return refuse(); }
  if (keys.length > 64 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const items: unknown[] = [], result: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    budget.bytes += Buffer.byteLength(key); if (budget.bytes > 262_144) { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copyData(descriptor.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(result, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); }
  return array ? items : result;
}

/** The complete pinned script must already be admitted. This checks its exact
 * constructor location and own class metadata; supplied metadata alone grants
 * no original lexical-binding identity, transport or execution permission. */
export function decodeCurrentPcb209CommonConstructorProperties(input: unknown, scriptId: string, name: CurrentPcb209CommonConstructor,
  kind = "common" as const):
Readonly<{ prototypeId: string; lexicalBindingVerified: false; executionAuthorized: false }> {
  let reason: Parameters<typeof currentPcbConstructorFailure>[0]["reason"] = "reply";
  try {
    token.parse(scriptId);
    const expected = CURRENT_PCB_209_COMMON_CONSTRUCTORS[name];
    const staticFields = Object.entries(expected.staticFields);
    const reply = z.object({ result: z.array(property).length(3 + staticFields.length), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
    const values = new Map(reply.result.map(item => [item.name, item]));
    const length = values.get("length");
    const label = values.get("name");
    const ownerPrototype = values.get("prototype");
    if (values.size !== 3 + staticFields.length) { return refuse(); }
    reason = "arity";
    if (length?.value.type !== "number" || length.value.value !== expected.parameterCount || Object.is(length.value.value, -0) ||
        length.value.objectId !== undefined || length.value.subtype !== undefined || length.value.className !== undefined ||
        length.writable || !length.configurable || length.enumerable) { return refuse(); }
    reason = "name";
    if (label?.value.type !== "string" || label.value.value !== expected.name || label.value.objectId !== undefined ||
        label.value.subtype !== undefined || label.value.className !== undefined ||
        label.writable || !label.configurable || label.enumerable) { return refuse(); }
    reason = "prototype";
    // V8 describes a subclass prototype by its immediate superclass name.
    // These eight inherited profiles are source-pinned, not a generic fallback.
    if (ownerPrototype?.value.type !== "object" ||
        ownerPrototype.value.className !== expected.prototypeClassName || ownerPrototype.value.objectId === undefined ||
        ownerPrototype.value.value !== undefined || ownerPrototype.value.subtype !== undefined ||
        ownerPrototype.writable || ownerPrototype.configurable || ownerPrototype.enumerable) { return refuse(); }
    reason = "static";
    for (const [field, value] of staticFields) {
      const item = values.get(field);
      if (item?.value.type !== "number" || !Object.is(item.value.value, value) || item.value.objectId !== undefined ||
          item.value.subtype !== undefined || item.value.className !== undefined ||
          !item.writable || !item.configurable || !item.enumerable) { return refuse(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]");
    const prototype = internals.get("[[Prototype]]");
    const scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    reason = "location";
    if (internals.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber) { return refuse(); }
    reason = "prototype";
    if (prototype?.type !== "function" || prototype.className !== "Function" || prototype.objectId === undefined || prototype.value !== undefined) { return refuse(); }
    reason = "scopes";
    if (scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.objectId === undefined || scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return Object.freeze({ prototypeId: ownerPrototype.value.objectId, lexicalBindingVerified: false, executionAuthorized: false });
  } catch {
    throw currentPcbConstructorFailure({ schema: "easyeda-pro-control.pcb-constructor-failure.v1", bundle: kind,
      profile: name, stage: "metadata", reason });
  }
}
