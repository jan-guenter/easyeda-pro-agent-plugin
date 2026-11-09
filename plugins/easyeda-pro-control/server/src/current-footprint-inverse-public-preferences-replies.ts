/** Private Storage snapshots. Peer values are hashed in memory and never
 * included in the two-key backup artifact or a public diagnostic. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCE_KEYS as KEYS } from "./current-footprint-inverse-public-preferences-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_SOURCE as SOURCE } from "./current-footprint-inverse-public-preferences-source.ts";

function bad(): never { throw new Error("FOOTPRINT_INVERSE_PREFERENCES_REPLY"); }
/** A new purpose-local bound; existing clock/metadata capture limits stay
 * unchanged. Reject accessors/Proxies before inspecting their contents. */
export function captureCurrentFootprintInversePreferenceReply(input: unknown): unknown {
  let nodes = 0; const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > 8192 || depth > 12) { return bad(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > 65_536 || !value.isWellFormed()) { return bad(); } return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return bad(); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return bad(); } seen.add(value);
    const own = (key: string): unknown => { const entry = Object.getOwnPropertyDescriptor(value, key); if (entry === undefined || !Object.hasOwn(entry, "value") || entry.enumerable !== true) { return bad(); } return entry.value as unknown; };
    if (Array.isArray(value)) {
      const entry = Object.getOwnPropertyDescriptor(value, "length"); if (Object.getPrototypeOf(value) !== Array.prototype || entry === undefined || !Object.hasOwn(entry, "value") || typeof entry.value !== "number" || !Number.isSafeInteger(entry.value) || entry.value < 0 || entry.value > 256 || Reflect.ownKeys(value).length !== entry.value + 1) { return bad(); }
      return Object.freeze(Array.from({ length: entry.value }, (_, index) => copy(own(String(index)), depth + 1)));
    }
    const names = Reflect.ownKeys(value); const parent: unknown = Object.getPrototypeOf(value); if (parent !== Object.prototype && parent !== null || names.length > 32) { return bad(); }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fresh output receives checked own data fields only.
    const result = Object.create(null) as Record<string, unknown>;
    for (const name of names) { if (typeof name !== "string" || name.length > 128 || !name.isWellFormed()) { return bad(); } Object.defineProperty(result, name, { value: copy(own(name), depth + 1), enumerable: true }); }
    return Object.freeze(result);
  };
  const value = copy(input, 0); if (Object.getOwnPropertyDescriptor(Object.prototype, "toJSON") !== undefined || Object.getOwnPropertyDescriptor(Array.prototype, "toJSON") !== undefined || Buffer.byteLength(JSON.stringify(value)) > 1_048_576) { return bad(); } return value;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(4096), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const arrayPacket = z.strictObject({ result: z.array(property).min(3).max(6), internalProperties: z.tuple([internal]) });
function need(condition: boolean): asserts condition { if (!condition) { return bad(); } }
export function decodeCurrentFootprintInversePreferenceArray(input: unknown, count: 2 | 4 | 5, frozen = false): readonly z.infer<typeof remote>[] {
  const raw = arrayPacket.parse(captureCurrentFootprintInversePreferenceReply(input)); const fields = new Map(raw.result.map(row => [row.name, row])); need(fields.size === count + 1 && raw.result.length === count + 1);
  const length = fields.get("length"), parent = raw.internalProperties[0]; need(length?.value.type === "number" && length.value.value === count && length.writable === !frozen && !length.enumerable && !length.configurable && parent.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined);
  return Object.freeze(Array.from({ length: count }, (_, index) => { const row = fields.get(String(index)); need(row !== undefined && row.writable === !frozen && row.enumerable && row.configurable === !frozen && row.value.subtype !== "proxy"); return row.value; }));
}
const arrayRemote = z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string(), objectId: handle });
const arrayHandle = z.strictObject({ result: arrayRemote });
export function currentFootprintInversePreferenceArray(input: unknown, count: 2 | 4 | 5): string { const raw = arrayHandle.parse(captureCurrentFootprintInversePreferenceReply(input)); need(raw.result.description === `Array(${String(count)})`); return raw.result.objectId; }
export function currentFootprintInversePreferenceObject(value: z.infer<typeof remote>): string { need((value.type === "object" || value.type === "function") && value.objectId !== undefined && value.subtype !== "proxy" && value.value === undefined); return value.objectId; }
export function currentFootprintInversePreferenceNullable(value: z.infer<typeof remote>): string | null {
  if (value.type === "object" && value.subtype === "null" && value.value === null && value.objectId === undefined) { return null; }
  need(value.type === "string" && typeof value.value === "string" && value.value.length <= 4096 && value.objectId === undefined && value.subtype === undefined); return value.value;
}
/** The complete native own-property census must match the separately invoked
 * original native length getter. Named Storage properties are own string data. */
export function decodeCurrentFootprintInversePreferenceCensus(input: unknown): Readonly<{ count: number; values: readonly [string | null, string | null]; peerSha256: string }> {
  const raw = z.strictObject({ result: z.array(property).max(128), internalProperties: z.tuple([internal]) }).parse(captureCurrentFootprintInversePreferenceReply(input)); const parent = raw.internalProperties[0];
  need(parent.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.className === "Storage" && parent.value.subtype === undefined && parent.value.objectId !== undefined);
  const values = new Map<string, string>(); for (const row of raw.result) { need(!values.has(row.name) && row.writable && row.enumerable && row.configurable && row.value.type === "string" && typeof row.value.value === "string" && row.value.objectId === undefined && row.value.subtype === undefined); values.set(row.name, row.value.value); }
  const first = values.get(KEYS[0]) ?? null, second = values.get(KEYS[1]) ?? null; need((first === null || first.length <= 4096) && (second === null || second.length <= 4096));
  const peers = [...values].filter(([key]) => key !== KEYS[0] && key !== KEYS[1]).toSorted(([left], [right]) => { if (left < right) { return -1; } return left > right ? 1 : 0; });
  const peerSha256 = createHash("sha256").update(JSON.stringify(peers)).digest("hex"); return Object.freeze({ count: values.size, values: Object.freeze([first, second] as const), peerSha256 });
}
const nativeProfiles = Object.freeze({ constructor: { name: "Storage", arity: 0, constructor: true }, getter: { name: "get localStorage", arity: 0, constructor: false }, length: { name: "get length", arity: 0, constructor: false }, remove: { name: "removeItem", arity: 1, constructor: false }, set: { name: "setItem", arity: 2, constructor: false } } as const);
export function qualifyCurrentFootprintInversePreferenceNative(input: unknown, role: keyof typeof nativeProfiles): void { decodeCurrentNativeFunctionMetadata(input, nativeProfiles[role]); }
export function currentFootprintInversePreferenceCount(input: unknown): number { const raw = z.strictObject({ result: z.strictObject({ type: z.literal("number"), value: z.number().int().min(0).max(128) }) }).parse(captureCurrentFootprintInversePreferenceReply(input)); return raw.result.value; }

/** G9o is a regular sloppy function in the pinned non-strict outer UI IIFE.
 * Its scopes are classified only; no Script/Global/synthetic scope is read. */
export function qualifyCurrentFootprintInversePreferenceRemoval(input: unknown, scriptId: string): void {
  const raw = z.strictObject({ result: z.array(property).length(5), internalProperties: z.array(internal).length(3) }).parse(captureCurrentFootprintInversePreferenceReply(input)); const fields = new Map(raw.result.map(row => [row.name, row])); need(fields.size === 5);
  for (const [name, value] of [["name", SOURCE.name], ["length", SOURCE.arity]] as const) { const actual = fields.get(name); need(actual !== undefined && !actual.writable && !actual.enumerable && actual.configurable && actual.value.type === (name === "name" ? "string" : "number") && actual.value.value === value && actual.value.objectId === undefined && actual.value.subtype === undefined); }
  const prototype = fields.get("prototype"); need(prototype !== undefined && prototype.writable && !prototype.enumerable && !prototype.configurable && prototype.value.type === "object" && prototype.value.objectId !== undefined && prototype.value.subtype !== "proxy");
  for (const name of ["arguments", "caller"]) { const actual = fields.get(name); need(actual !== undefined && !actual.writable && !actual.enumerable && !actual.configurable && actual.value.type === "object" && actual.value.subtype === "null" && actual.value.value === null && actual.value.objectId === undefined); }
  const entries = new Map(raw.internalProperties.map(row => [row.name, row.value])); need(entries.size === 3); const location = entries.get("[[FunctionLocation]]"), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  const point = z.strictObject({ scriptId: handle, lineNumber: z.literal(SOURCE.lineNumber), columnNumber: z.literal(SOURCE.functionColumn) }).parse(location?.value);
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && point.scriptId === scriptId && parent?.type === "function" && parent.className === "Function" && parent.description === "function () { [native code] }" && parent.objectId !== undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
}

export function currentFootprintInversePreferencePoint(input: unknown, scriptId: string, role: "entry" | "returned"): string {
  const raw = z.strictObject({ breakpointId: handle, actualLocation: z.strictObject({ scriptId: handle, lineNumber: z.literal(SOURCE.lineNumber), columnNumber: z.number().int() }) }).parse(captureCurrentFootprintInversePreferenceReply(input)); need(raw.actualLocation.scriptId === scriptId && raw.actualLocation.columnNumber === (role === "entry" ? SOURCE.entryColumn : SOURCE.returnedColumn)); return raw.breakpointId;
}
