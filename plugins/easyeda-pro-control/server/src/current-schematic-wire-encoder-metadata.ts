/** Descriptor-only comparison for the separately pinned encoder actors.
 * The long consistency class is accepted only in its exact description slot.
 * Historical Wire reply bounds and every other field keep their old limits. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import {
  currentSchematicWireEncoderSourceDigest as digest,
  currentSchematicWireEncoderScriptId as handle,
  requireCurrentSchematicWireEncoderSourceCheckpoint,
  currentSchematicWireEncoderSourceRow as sourceRow,
} from "./current-schematic-wire-encoder-source.ts";
import type {
  CurrentSchematicWireEncoderRole,
  CurrentSchematicWireEncoderSourceCheckpoint,
} from "./current-schematic-wire-encoder-source.ts";

const remote = z.strictObject({
  type: z.string(), subtype: z.string().optional(), className: z.string().optional(),
  objectId: handle.optional(), description: z.string().max(16_384).optional(), value: z.unknown().optional(),
});
const ownField = z.strictObject({
  name: z.string(), value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true),
});
const internal = z.strictObject({ name: z.string(), value: remote });
const metadata = z.strictObject({ result: z.array(ownField).min(2).max(5), internalProperties: z.array(internal).length(3) });
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });

function need(value: boolean): asserts value {
  if (!value) { throw new Error("WIRE_ENCODER_METADATA"); }
}

function field(input: object, key: PropertyKey): unknown {
  const d = Object.getOwnPropertyDescriptor(input, key);
  need(d !== undefined && d.enumerable === true && Object.hasOwn(d, "value"));
  return d.value as unknown;
}
function record(input: unknown): Record<string, unknown> {
  need(input !== null && typeof input === "object" && !types.isProxy(input));
  const proto: unknown = Object.getPrototypeOf(input);
  need(proto === null || proto === Object.prototype);
  const keys = Reflect.ownKeys(input);
  need(keys.length <= 8);
  const output: Record<string, unknown> = {};
  for (const key of keys) {
    need(typeof key === "string");
    Object.defineProperty(output, key, { enumerable: true, writable: true, value: field(input, key) });
  }
  return output;
}
function projectedDescription(input: unknown, expected: Readonly<{ bytes: number; sha256: string }>): Record<string, unknown> {
  const value = record(input);
  const text = value["description"];
  need(typeof text === "string" && text.length <= expected.bytes && text.isWellFormed() &&
    Buffer.byteLength(text) === expected.bytes && digest(text) === expected.sha256);
  value["description"] = expected.sha256;
  return value;
}
function projectParent(raw: unknown, expected: Readonly<{ bytes: number; sha256: string }>): unknown {
  const packet = record(raw);
  const entries = packet["internalProperties"];
  need(Array.isArray(entries) && !types.isProxy(entries) && Object.getPrototypeOf(entries) === Array.prototype &&
    entries.length === 3 && Reflect.ownKeys(entries).length === 4);
  packet["internalProperties"] = Array.from({ length: 3 }, (_, index) => {
    const entry = record(field(entries, index));
    if (entry["name"] === "[[Prototype]]") { entry["value"] = projectedDescription(entry["value"], expected); }
    return entry;
  });
  return capture(packet).value;
}

const functionPrototypeSource = "function () { [native code] }";
const functionPrototype = Object.freeze({
  bytes: Buffer.byteLength(functionPrototypeSource), sha256: digest(functionPrototypeSource),
});

export interface CurrentSchematicWireEncoderFunction {
  readonly objectId: string;
  readonly scopes: string;
  readonly prototypeObjectId: string | null;
  readonly parentObjectId: string;
  readonly role: CurrentSchematicWireEncoderRole;
  readonly originalNativeOwnerJoined: false;
  readonly executionAuthorized: false;
}

/** All caller ownership and response correlation stays with the native owner.
 * Matching function descriptions, even with exact source locations, cannot
 * issue live authority. The consistency parent is a byte pin, not a role. */
export function compareCurrentSchematicWireEncoderFunction(
  checkpoint: CurrentSchematicWireEncoderSourceCheckpoint, role: CurrentSchematicWireEncoderRole,
  input: unknown, actual: unknown,
): CurrentSchematicWireEncoderFunction {
  requireCurrentSchematicWireEncoderSourceCheckpoint(checkpoint);
  const expected = sourceRow(checkpoint.variant, role);
  need(expected.parent !== null);
  const expectedParent = expected.parent === "native" ? functionPrototype : sourceRow(checkpoint.variant, expected.parent);
  const fn = remote.parse(capture(projectedDescription(actual, expected)).value);
  need(fn.type === "function" && fn.className === "Function" && fn.subtype === undefined && fn.objectId !== undefined && fn.value === undefined);
  const packet = metadata.parse(projectParent(input, expectedParent));
  const fields = new Map(packet.result.map(row => [row.name, row]));
  const constructor = expected.kind !== "method";
  const sloppy = expected.kind === "function" && fields.size === 5;
  need(fields.size === packet.result.length && fields.size === (constructor ? 3 : 2) + (sloppy ? 2 : 0));
  for (const [key, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const row = fields.get(key);
    need(row !== undefined && row.value.type === (key === "name" ? "string" : "number") && row.value.value === value &&
      row.value.objectId === undefined && row.value.subtype === undefined &&
      !row.writable && !row.enumerable && row.configurable);
  }
  let prototypeObjectId: string | null = null;
  if (constructor) {
    const row = fields.get("prototype");
    need(row !== undefined && row.value.type === "object" && row.value.subtype === undefined &&
      row.value.objectId !== undefined && row.value.value === undefined &&
      row.writable === (expected.kind === "function") && !row.enumerable && !row.configurable);
    prototypeObjectId = row.value.objectId;
  }
  if (sloppy) {
    for (const key of ["arguments", "caller"]) {
      const row = fields.get(key);
      need(row !== undefined && row.value.type === "object" && row.value.subtype === "null" && row.value.value === null &&
        row.value.objectId === undefined && !row.writable && !row.enumerable && !row.configurable);
    }
  }
  const internals = new Map(packet.internalProperties.map(row => [row.name, row.value]));
  const at = internals.get("[[FunctionLocation]]");
  const scopes = internals.get("[[Scopes]]");
  const parent = internals.get("[[Prototype]]");
  need(internals.size === 3 && at?.type === "object" && at.subtype === "internal#location" &&
    at.objectId === undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" &&
    scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "") &&
    parent?.type === "function" && parent.className === "Function" && parent.description === expectedParent.sha256 &&
    parent.objectId !== undefined && parent.subtype === undefined && parent.value === undefined);
  const observed = location.parse(at.value);
  need(observed.scriptId === checkpoint.scriptId && observed.lineNumber === expected.location.lineNumber &&
    observed.columnNumber === expected.location.columnNumber);
  return Object.freeze({
    objectId: fn.objectId, scopes: scopes.objectId, parentObjectId: parent.objectId, prototypeObjectId, role,
    originalNativeOwnerJoined: false, executionAuthorized: false,
  });
}
