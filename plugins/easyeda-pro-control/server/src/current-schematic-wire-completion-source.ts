/** Exact original Wire completion functions. Byte and PC comparison supplies
 * data; original event, Promise, worker, Save and durable custody remain separate. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import { qualifyCurrentSchematicWireTransitionSource } from "./current-schematic-wire-transition-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

import type {
  CURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES as ReviewedCURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES,
  CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as ReviewedCURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE,
} from "./current-schematic-wire-completion-source.review.ts";
import { PACKED_SCHEMATIC_WIRE_COMPLETION_DATA } from "./current-schematic-wire-completion-data-packed.ts";
import { unpackFixedRuntimeData } from "./fixed-runtime-data-storage.ts";

type WireCompletionData = readonly [
  typeof ReviewedCURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE,
  typeof ReviewedCURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES,
];
// This private reader accepts only its complete generated SHA-bound data.
function assertFixedData(value: unknown): asserts value is WireCompletionData {
  if (!Array.isArray(value) || value.length !== 2) { throw new Error("FIXED_WIRECOMPLETIONDATA_SHAPE"); }
}
const data = unpackFixedRuntimeData(PACKED_SCHEMATIC_WIRE_COMPLETION_DATA);
assertFixedData(data);
export const CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE = freezeDeep(data[0]);
export const CURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES = freezeDeep(data[1]);
export type CurrentSchematicWireCompletionRole = typeof CURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES[number];

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(16_384).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().optional() });
const property = z.strictObject({ name: z.string(), value: remote.optional(), get: remote.optional(), set: remote.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const packet = z.strictObject({ result: z.array(property).max(3), internalProperties: z.array(internal).length(3) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_COMPLETION_SOURCE"); } }

/** Qualify the complete installed bundle before all completion spans. */
/** Return the qualified immutable source text so downstream span checks need
 * not recapture caller input. This supplies data, never original ownership. */
export function captureQualifiedCurrentSchematicWireCompletionSource(input: unknown): Readonly<{variant: 0 | 1; scriptSource: string}> {
  const raw = captureCurrentSchematicDisplayAccessorSource(input);
  const variant = qualifyCurrentSchematicWireTransitionSource(raw);
  const spans: Readonly<Record<CurrentSchematicWireCompletionRole, { readonly start: number; readonly end: number; readonly bytes: number; readonly sha256: string }>> = CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE[variant].rows;
  for (const row of Object.values(spans)) {
    const text = raw.scriptSource.slice(row.start, row.end);
    need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256);
  }
  return Object.freeze({variant, scriptSource: raw.scriptSource});
}
export function qualifyCurrentSchematicWireCompletionSource(input: unknown): 0 | 1 { return captureQualifiedCurrentSchematicWireCompletionSource(input).variant; }
export interface CurrentSchematicWireCompletionFunction { readonly objectId: string; readonly scopes: string; readonly parent: z.infer<typeof remote> }

/** Compare complete function text, ordinary metadata, name, arity and exact
 * source PC. A matching copy at another location cannot replace this function. */
export interface CurrentSchematicWireFunctionMetadataProfile {
  readonly bytes: number; readonly sha256: string; readonly name: string; readonly arity: number; readonly constructible: boolean;
  readonly className: string; readonly parentType: string; readonly parentClassName: string; readonly parentDescription: string;
  readonly lineNumber: number; readonly columnNumber: number;
}
/** Shared comparison data engine. Its caller supplies a closed source row;
 * matching data can never construct an original owner or continuation grant. */
export function compareCurrentSchematicWireFunctionMetadata(input: unknown, actual: unknown, expected: CurrentSchematicWireFunctionMetadataProfile, scriptId: string): CurrentSchematicWireCompletionFunction {
  handle.parse(scriptId);
  const fn = remote.parse(capture(actual).value);
  need(fn.type === "function" && fn.subtype === undefined && fn.className === expected.className && fn.objectId !== undefined && fn.value === undefined && typeof fn.description === "string" && Buffer.byteLength(fn.description) === expected.bytes && createHash("sha256").update(fn.description).digest("hex") === expected.sha256);
  const raw = packet.parse(capture(input).value);
  const fields = new Map(raw.result.map(row => [row.name, row]));
  need(fields.size === raw.result.length && fields.size === (expected.constructible ? 3 : 2));
  for (const [key, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(key);
    need(field?.value !== undefined && field.value.type === (key === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined && field.writable === false && !field.enumerable && field.configurable);
  }
  if (expected.constructible) {
    const p = fields.get("prototype");
    need(p?.value?.type === "object" && p.value.subtype === undefined && p.value.objectId !== undefined && p.writable === true && !p.enumerable && !p.configurable);
  }
  const internals = new Map(raw.internalProperties.map(row => [row.name, row.value]));
  const location = internals.get("[[FunctionLocation]]"); const scopes = internals.get("[[Scopes]]"); const parent = internals.get("[[Prototype]]");
  need(internals.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined);
  const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).parse(location.value);
  need(site.scriptId === scriptId && site.lineNumber === expected.lineNumber && site.columnNumber === expected.columnNumber && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "") && parent?.type === expected.parentType && parent.subtype === undefined && parent.className === expected.parentClassName && parent.description === expected.parentDescription && parent.objectId !== undefined && parent.value === undefined);
  return Object.freeze({ objectId: fn.objectId, scopes: scopes.objectId, parent });
}
export function decodeCurrentSchematicWireCompletionFunction(input: unknown, actual: unknown, variant: 0 | 1, role: CurrentSchematicWireCompletionRole, scriptId: string): CurrentSchematicWireCompletionFunction {
  need((variant === 0 || variant === 1) && !Object.is(variant, -0));
  return compareCurrentSchematicWireFunctionMetadata(input, actual, CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE[variant].rows[role], scriptId);
}
