/** Fixed original-script function qualification for the dormant spatial reader.
 * Remote descriptions come from V8's internal inspector representation, never
 * a page's Function.prototype.toString. Text alone does not bind a closure:
 * every retained callee also needs the admitted script and fixed location.
 * These decoders issue no owner, transport, intrinsic or execution authority.
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES } from "./current-pcb-209-spatial-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PROFILES } from "./current-pcb-209-spatial-track-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PROFILES } from "./current-pcb-209-spatial-arc-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES } from "./current-pcb-209-spatial-pad-source-profile.ts";

import { CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES } from "./current-pcb-209-component-point-complete-source-profile.ts";

import { CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PROFILES } from "./current-pcb-209-component-cloned-point-source-profile.ts";

const trackProfiles = Object.freeze([...CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES, ...CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PROFILES]);
const arcProfiles = Object.freeze([...trackProfiles, ...CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PROFILES]);
export type CurrentPcbSpatialVariant = "via" | "line-via" | "arc-line-via" | "pad-point" | "component-point" | "component-cloned-point";
type FixedProfile = (typeof arcProfiles)[number] | (typeof CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES)[number] | (typeof CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES)[number];
export type CurrentPcbSpatialFunctionSourceKey = FixedProfile["key"];
type Profile = Readonly<{ key: CurrentPcbSpatialFunctionSourceKey;
  kind: "class" | "method" | "getter" | "function" | "arrow";
  className: "Function" | "AsyncFunction" | "GeneratorFunction" | "AsyncGeneratorFunction";
  name: string; parameterCount: number; sourceStart: number; sourceEnd: number;
  sourceBytes: number; sourceSha256: string; lineNumber: number; columnNumber: number }>;
export interface CurrentPcbSpatialFunctionSourceReference {
  readonly key: CurrentPcbSpatialFunctionSourceKey;
  readonly objectId: string;
}
/** One frozen tuple property request, then one metadata request per callee.
 * The original owner must budget the entire path before any dispatch.
 */
export const CURRENT_PCB_SPATIAL_FUNCTION_SOURCE_REQUESTS = CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length + 1;
export const CURRENT_PCB_SPATIAL_FUNCTION_SOURCE_COUNT = CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length;

const MAX_FUNCTIONS = 512;
const MAX_DESCRIPTION_BYTES = 262_144;
const MAX_REPLY_BYTES = 4 * 1024 * 1024;
export const CURRENT_PCB_SPATIAL_FAILURE_REPLY_BYTES = MAX_REPLY_BYTES;
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(MAX_DESCRIPTION_BYTES).refine(value => value.isWellFormed() && !value.includes("\0"));
const extent = z.number().int().nonnegative().refine(value => !Object.is(value, -0));
const location = z.strictObject({ scriptId: handle, lineNumber: extent, columnNumber: extent });
const remote = z.strictObject({
  type: z.enum(["object", "function", "string", "number", "boolean", "undefined", "symbol", "bigint"]),
  subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: handle.optional(),
  value: z.union([z.null(), text, z.number(), z.boolean(), location]).optional(),
  unserializableValue: z.string().max(256).optional(),
});
const descriptor = { name: z.string().max(256), configurable: z.boolean(), enumerable: z.boolean(),
  isOwn: z.literal(true), symbol: remote.optional() };
const dataProperty = z.strictObject({ ...descriptor, value: remote, writable: z.boolean() });
const accessorProperty = z.strictObject({ ...descriptor, get: remote, set: remote });
const property = z.union([dataProperty, accessorProperty]);
const internal = z.strictObject({ name: z.string().max(256), value: remote });
type Remote = z.infer<typeof remote>;
type DataProperty = z.infer<typeof dataProperty>;

function refuse(): never { throw new Error("PCB_SPATIAL_FUNCTION_SOURCE"); }

/** Reject non-JSON behavior before Zod can inspect it. The serving transport
 * independently bounds and rejects duplicate keys in the raw protocol JSON.
 */
function data(input: unknown): unknown { return copy(input, 0, { nodes: 0, bytes: 0 }); }
/** Diagnostic data only. Preserve unknown JSON fields without invoking getters
 * or accepting this failed packet as source, owner or execution evidence. */
export function captureCurrentPcbSpatialFailureReply(input: unknown): string {
  const encoded = JSON.stringify(data(input));
  if (Buffer.byteLength(encoded) > MAX_REPLY_BYTES) { return refuse(); }
  return encoded;
}
/** Rebuild dense arrays and plain own data within one shared depth/node/byte
 * Budget. Accessors, proxies and malformed strings refuse before schema reads. */
function copy(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (depth > 12 || budget.nodes > 32_768) { return refuse(); }
  if (input === null || typeof input === "boolean") { return input; }
  if (typeof input === "number") { if (!Number.isFinite(input)) { return refuse(); } return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (!input.isWellFormed() || input.length > MAX_DESCRIPTION_BYTES || budget.bytes > MAX_REPLY_BYTES) { return refuse(); }
    return input;
  }
  if (typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if ((array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) ||
      keys.length > MAX_FUNCTIONS + 1 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const items: unknown[] = [];
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string" || key.length > 256) { return refuse(); }
    budget.bytes += Buffer.byteLength(key); if (budget.bytes > MAX_REPLY_BYTES) { return refuse(); }
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (field === undefined || !Object.hasOwn(field, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copy(field.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(result, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); }
  return array ? items : result;
}

/** Require the fixed catalog to remain nonempty, bounded and uniquely keyed.
 * A caller cannot replace this module-owned source qualification roster. */
function profiles(variant: CurrentPcbSpatialVariant): readonly Profile[] {
  const selected: readonly Profile[] = { "arc-line-via": arcProfiles, "line-via": trackProfiles, via: CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES, "pad-point": CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES, "component-point": CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES, "component-cloned-point": CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PROFILES }[variant];
  if (selected.length === 0 || selected.length > MAX_FUNCTIONS || new Set(selected.map(item => item.key)).size !== selected.length) { return refuse(); }
  return selected;
}
/** Resolve one key only within the fixed catalog; unknown callees refuse. */
function profile(key: CurrentPcbSpatialFunctionSourceKey, variant: CurrentPcbSpatialVariant): Profile {
  return profiles(variant).find(item => item.key === key) ?? refuse();
}
/** Check the complete V8 description's kind, UTF-16 extent, UTF-8 bytes and
 * Digest. The returned handle still needs its independent script/location check. */
function source(value: Remote, expected: Profile): string {
  if (value.type !== "function" || value.className !== expected.className || value.subtype !== undefined ||
      value.value !== undefined || value.unserializableValue !== undefined || value.objectId === undefined ||
      value.description === undefined || value.description.length !== expected.sourceEnd - expected.sourceStart ||
      Buffer.byteLength(value.description) !== expected.sourceBytes ||
      createHash("sha256").update(value.description).digest("hex") !== expected.sourceSha256) { return refuse(); }
  return value.objectId;
}
/** Require a non-value remote reference of the expected inspector shape.
 * A matching display label supplies no callable or original-owner authority. */
function referenced(value: Remote, type: "object" | "function", className: string): void {
  if (value.type !== type || value.className !== className || value.objectId === undefined ||
      value.value !== undefined || value.unserializableValue !== undefined) { refuse(); }
}
/** Require an ordinary nonsymbol data descriptor without invoking its value. */
function ordinary(item: z.infer<typeof property> | undefined): DataProperty {
  if (item === undefined || !("value" in item) || item.symbol !== undefined) { return refuse(); }
  return item;
}
/** Match the fixed own name/arity descriptor, including its immutable value and
 * Exact flags, rather than accepting a getter or substituted remote handle. */
function scalar(item: DataProperty, type: "string" | "number", value: string | number): void {
  if (item.writable || !item.configurable || item.enumerable || item.value.type !== type || item.value.value !== value ||
      Object.is(item.value.value, -0) || item.value.objectId !== undefined || item.value.className !== undefined ||
      item.value.subtype !== undefined || item.value.unserializableValue !== undefined) { refuse(); }
}

/** Decode only the fixed frozen callee-array handle from the capture program. */
export function decodeCurrentPcbSpatialFunctionSourceArray(input: unknown, variant: CurrentPcbSpatialVariant = "via"): string {
  try {
    const value = z.strictObject({ result: remote }).parse(data(input)).result;
    referenced(value, "object", "Array");
    if (value.subtype !== "array" || value.description !== `Array(${profiles(variant).length})`) { return refuse(); }
    return value.objectId ?? refuse();
  } catch { return refuse(); }
}

/** Decode fixed slots, full descriptions and frozen descriptors in one pass.
 * No caller-provided profile or source text can extend this private catalog.
 */
export function decodeCurrentPcbSpatialFunctionSourceTuple(input: unknown, variant: CurrentPcbSpatialVariant = "via"): readonly CurrentPcbSpatialFunctionSourceReference[] {
  try {
    const expected = profiles(variant);
    const reply = z.strictObject({ result: z.array(dataProperty).length(expected.length + 1),
      internalProperties: z.array(internal).length(1) }).parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item]));
    const length = fields.get("length"), prototype = reply.internalProperties[0];
    if (fields.size !== expected.length + 1 || length === undefined || length.symbol !== undefined ||
        length.value.type !== "number" || length.value.value !== expected.length || length.value.objectId !== undefined ||
        length.value.subtype !== undefined || length.value.className !== undefined || length.value.unserializableValue !== undefined ||
        length.writable || length.configurable || length.enumerable || prototype?.name !== "[[Prototype]]") { return refuse(); }
    referenced(prototype.value, "object", "Array");
    if (prototype.value.subtype !== "array") { return refuse(); }
    const seen = new Set<string>();
    return Object.freeze(expected.map((item, index) => {
      const entry = fields.get(String(index));
      if (entry === undefined || entry.writable || entry.configurable || !entry.enumerable || entry.symbol !== undefined) { return refuse(); }
      const objectId = source(entry.value, item);
      if (seen.has(objectId)) { return refuse(); } seen.add(objectId);
      return Object.freeze({ key: item.key, objectId });
    }));
  } catch { return refuse(); }
}

/** Match one exact application callee to the already-admitted original script.
 * Classes may expose bounded static fields/accessors; their used callable
 * values require their own fixed tuple slots. Native and bound functions have
 * no matching application location and are never admitted by their text alone.
 */
export function decodeCurrentPcbSpatialFunctionSourceMetadata(input: unknown, scriptId: string,
  key: CurrentPcbSpatialFunctionSourceKey, variant: CurrentPcbSpatialVariant = "via"): true {
  try {
    handle.parse(scriptId); const expected = profile(key, variant);
    const generator = expected.className === "GeneratorFunction" || expected.className === "AsyncGeneratorFunction";
    const reply = z.strictObject({ result: z.array(property).min(2).max(MAX_FUNCTIONS),
      internalProperties: z.array(internal).length(generator ? 4 : 3) }).parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item]));
    if (fields.size !== reply.result.length) { return refuse(); }
    scalar(ordinary(fields.get("length")), "number", expected.parameterCount);
    scalar(ordinary(fields.get("name")), "string", expected.name);
    const hasPrototype = expected.kind === "class" || expected.kind === "function" && expected.className === "Function" || generator;
    if (hasPrototype) {
      const member = ordinary(fields.get("prototype"));
      if (expected.kind === "class") {
        // V8 describes a subclass prototype using its immediate superclass.
        // This display label grants no authority.
        // Original class source, immutable prototype and each callee are checked apart.
        if (member.value.type !== "object" || member.value.objectId === undefined || member.value.value !== undefined ||
            member.value.unserializableValue !== undefined || member.value.className === undefined || member.value.className.length > 256) { return refuse(); }
      } else {
        let prototypeClass = "Object";
        if (generator) { prototypeClass = expected.className === "GeneratorFunction" ? "Generator" : "AsyncGenerator"; }
        referenced(member.value, "object", prototypeClass);
      }
      if (member.value.subtype !== undefined || member.configurable || member.enumerable || member.writable !== (expected.kind !== "class")) { return refuse(); }
    }
    if (expected.kind === "function" && expected.className === "Function" && fields.size === 5) {
      // Node24 exposes these two fixed null fields on sloppy ordinary functions.
      // Strict ordinary functions and the reviewed later V8 form have three fields.
      // Both exact forms reject extra behavior.
      for (const name of ["arguments", "caller"]) {
        const member = ordinary(fields.get(name));
        if (member.value.type !== "object" || member.value.subtype !== "null" || member.value.value !== null ||
            member.value.objectId !== undefined || member.value.className !== undefined || member.value.unserializableValue !== undefined ||
            member.writable || member.configurable || member.enumerable) { return refuse(); }
      }
    } else if (expected.kind !== "class" && fields.size !== (hasPrototype ? 3 : 2)) { return refuse(); }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const parent = internals.get("[[Prototype]]"), point = internals.get("[[FunctionLocation]]"), scopes = internals.get("[[Scopes]]");
    if (internals.size !== (generator ? 4 : 3) || point?.type !== "object" || point.subtype !== "internal#location" ||
        point.objectId !== undefined || point.className !== undefined || point.unserializableValue !== undefined ||
        point.value === null || typeof point.value !== "object" || point.value.scriptId !== scriptId ||
        point.value.lineNumber !== expected.lineNumber || point.value.columnNumber !== expected.columnNumber || parent === undefined || scopes === undefined) { return refuse(); }
    referenced(parent, expected.className === "Function" ? "function" : "object", expected.className);
    if (parent.subtype !== undefined) { return refuse(); }
    referenced(scopes, "object", "Array");
    if (scopes.subtype !== "internal#scopeList" || !/^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? "")) { return refuse(); }
    if (generator) {
      const marker = internals.get("[[IsGenerator]]");
      if (marker?.type !== "boolean" || marker.value !== true || marker.objectId !== undefined || marker.className !== undefined ||
          marker.subtype !== undefined || marker.unserializableValue !== undefined) { return refuse(); }
    }
    return true;
  } catch { return refuse(); }
}
