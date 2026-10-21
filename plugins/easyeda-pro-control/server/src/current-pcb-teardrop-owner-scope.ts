/** Fixed bound-callback metadata. Matching descriptors alone is not original
 * subscription ownership; the fixed association compares all six receivers. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { currentPcbTeardropFailure, currentPcbTeardropFailureDetail, currentPcbTeardropFailureSchema } from "./current-pcb-teardrop-failure.ts";
import type { CurrentPcbTeardropFailure } from "./current-pcb-teardrop-failure.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_TEARDROP_TARGET_PROFILES = freezeDeep([
  { topic: "isMoveSwitch", name: "isMoveSwitch", arity: 1, lineNumber: 4630, columnNumber: 17_769, sourceBytes: 30,
    sourceSha256: "87d706bc4d8f91a009f9db07d23d8e334fdb0814a724658577e5e8e2038b6f26" },
  { topic: "SetSuspend", name: "setSuspend", arity: 1, lineNumber: 4630, columnNumber: 17_797, sourceBytes: 29,
    sourceSha256: "6d077b05a50b60806d76a6f48fbd2dff68f2682e1c8149260431784e6c6c9cdf" },
  { topic: "cheakTearDrop", name: "addModify", arity: 1, lineNumber: 4630, columnNumber: 17_888, sourceBytes: 49,
    sourceSha256: "c1f5dc4ac0437fedd21af037d69adcfce03c4e618f2ec39311ecdc5cc08f0eff" },
  { topic: "addModifyTeardrop", name: "addMaodifyTeardrop", arity: 1, lineNumber: 4630, columnNumber: 17_834, sourceBytes: 63,
    sourceSha256: "266bf9060974985711ca24c84b6208d3f68e5e951fa4f8b4d2d0b5677f4c2a8d" },
  { topic: "flushTearDrop", name: "flushService", arity: 0, lineNumber: 4630, columnNumber: 17_940, sourceBytes: 301,
    sourceSha256: "3bfbbb83ec2cdc8cdc046cb7a225c5ae9a384477b247f1f5a0ce009549d23ac6" },
  { topic: "refreshTearDrop", name: "refreshService", arity: 0, lineNumber: 4630, columnNumber: 18_243, sourceBytes: 248,
    sourceSha256: "dbf20e815a890e7fcfd755f6a1c374505e9e2f0fee1b8cd167e7e147614140ab" },
] as const);
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function failure(stage: CurrentPcbTeardropFailure["stage"], index?: number): Error {
  return currentPcbTeardropFailure({ schema: "easyeda-pro-control.pcb-teardrop-owner-failure.v1", stage,
    topic: index === undefined ? null : CURRENT_PCB_TEARDROP_TARGET_PROFILES[index]?.topic ?? null, reason: "reply" });
}
function refuse(): never { throw failure("decode"); }
function data(input: unknown): unknown { return copyData(input, 0, { nodes: 0, bytes: 0 }); }
function copyData(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (depth > 9 || budget.nodes > 1024) { return refuse(); }
  if (typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (input.length > 4096 || !input.isWellFormed() || budget.bytes > 65_536) { return refuse(); } return input;
  }
  if (input === null || typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) { return refuse(); }
  if (keys.length > 32 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const items: unknown[] = [], object: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    budget.bytes += Buffer.byteLength(key); if (budget.bytes > 65_536) { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copyData(descriptor.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(object, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); } return array ? items : object;
}
function functionShape(value: z.infer<typeof remote>): string {
  if (value.type !== "function" || value.className !== "Function" || value.subtype !== undefined || value.value !== undefined || value.objectId === undefined) { return refuse(); }
  return value.objectId;
}
export function decodeCurrentPcbTeardropHandle(input: unknown, length: 3 | 6): string {
  try {
    const value = z.object({ result: remote }).strict().parse(data(input)).result;
    if (value.type === "string" && typeof value.value === "string" && value.objectId === undefined &&
        value.className === undefined && value.subtype === undefined && Buffer.byteLength(value.value) <= 1024) {
      const decoded = decodeCurrentPcbDiagnosticJson(Buffer.from(value.value));
      throw currentPcbTeardropFailure(currentPcbTeardropFailureSchema.parse(decoded));
    }
    if (value.type !== "object" || value.subtype !== "array" || value.className !== "Array" || value.description !== `Array(${length})` ||
        value.objectId === undefined || value.value !== undefined) { return refuse(); } return value.objectId;
  } catch (error) { if (currentPcbTeardropFailureDetail(error) !== null) { throw error; } throw failure("decode"); }
}
function arrayProperties(input: unknown, length: 0 | 6): readonly z.infer<typeof property>[] {
  const reply = z.object({ result: z.array(property).length(length + 1), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
  const values = new Map(reply.result.map(item => [item.name, item]));
  const prototype = reply.internalProperties[0], size = values.get("length");
  if (values.size !== length + 1 || size === undefined || !size.writable || size.configurable || size.enumerable ||
      size.value.type !== "number" || size.value.value !== length || Object.is(size.value.value, -0) || size.value.objectId !== undefined ||
      prototype?.name !== "[[Prototype]]" || prototype.value.type !== "object" || prototype.value.subtype !== "array" ||
      prototype.value.className !== "Array" || prototype.value.objectId === undefined || prototype.value.value !== undefined) { return refuse(); }
  const items: z.infer<typeof property>[] = [];
  for (let index = 0; index < length; index += 1) {
    const item = values.get(String(index)); if (item === undefined || !item.writable || !item.configurable || !item.enumerable) { return refuse(); } items.push(item);
  }
  return items;
}
export function decodeCurrentPcbTeardropCallbacks(input: unknown): readonly string[] {
  try {
    const handles = arrayProperties(input, 6).map(item => {
      const handle = functionShape(item.value);
      if (item.value.description !== "function () { [native code] }") { return refuse(); } return handle;
    });
    if (new Set(handles).size !== 6) { return refuse(); } return Object.freeze(handles);
  } catch { throw failure("tuple"); }
}
function metadata(input: unknown, index: number, bound: boolean): Map<string, z.infer<typeof remote>> {
  const expected = CURRENT_PCB_TEARDROP_TARGET_PROFILES[index]; if (expected === undefined) { return refuse(); }
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(bound ? 4 : 3) }).strict().parse(data(input));
  const own = new Map(reply.result.map(item => [item.name, item])); if (own.size !== 2) { return refuse(); }
  for (const name of ["length", "name"] as const) {
    const item = own.get(name);
    if (item === undefined || item.writable || !item.configurable || item.enumerable || item.value.objectId !== undefined ||
        item.value.type !== (name === "length" ? "number" : "string") ||
        item.value.value !== (name === "length" ? expected.arity : `${bound ? "bound " : ""}${expected.name}`) || Object.is(item.value.value, -0)) { return refuse(); }
  }
  const values = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  if (values.size !== (bound ? 4 : 3)) { return refuse(); }
  functionShape(values.get("[[Prototype]]") ?? refuse()); return values;
}
export function decodeCurrentPcbTeardropBound(input: unknown, index: number): Readonly<{ ownerId: string; targetId: string; argumentsId: string }> {
  try {
    const expected = CURRENT_PCB_TEARDROP_TARGET_PROFILES[index]; if (expected === undefined) { return refuse(); }
    const values = metadata(input, index, true);
    const args = values.get("[[BoundArgs]]"), owner = values.get("[[BoundThis]]"), target = values.get("[[TargetFunction]]");
    const targetId = functionShape(target ?? refuse());
    if (target?.description === undefined || Buffer.byteLength(target.description) !== expected.sourceBytes ||
        createHash("sha256").update(target.description).digest("hex") !== expected.sourceSha256 ||
        owner?.type !== "object" || owner.className !== "Sfe" || owner.objectId === undefined || owner.subtype !== undefined || owner.value !== undefined ||
        args?.type !== "object" || args.subtype !== "array" || args.className !== "Array" || args.description !== "Array(0)" || args.objectId === undefined || args.value !== undefined) { return refuse(); }
    return Object.freeze({ ownerId: owner.objectId, targetId, argumentsId: args.objectId });
  } catch { throw failure("bound-metadata", index); }
}
export function decodeCurrentPcbTeardropTarget(input: unknown, scriptId: string, index: number): void {
  try {
    token.parse(scriptId); const expected = CURRENT_PCB_TEARDROP_TARGET_PROFILES[index]; if (expected === undefined) { refuse(); }
    const values = metadata(input, index, false);
    const location = values.get("[[FunctionLocation]]"), scopes = values.get("[[Scopes]]");
    const point = location?.value;
    if (location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined || point === undefined || typeof point !== "object" ||
        point.scriptId !== scriptId || point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { refuse(); }
  } catch { throw failure("target-metadata", index); }
}
export function decodeCurrentPcbTeardropArguments(input: unknown, index: number): void {
  try { if (CURRENT_PCB_TEARDROP_TARGET_PROFILES[index] === undefined) { refuse(); } arrayProperties(input, 0); }
  catch { throw failure("bound-arguments", index); }
}
