/** Exact metadata for the separate Wire raw snapshot closure. Its complete
 * script and real function PC are derived from the new namespace-preserving
 * program; released Text metadata and packets remain unchanged. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceRawProperties } from "./current-schematic-relevance-action-raw-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_SCENE_RAW_SNAPSHOT as SNAPSHOT } from "./current-schematic-wire-scene-raw-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remoteSchema = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().max(128).optional(), className: z.string().max(256).optional(), description: z.string().max(16_384).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().max(128).optional() });
const propertySchema = z.strictObject({ name: z.string().max(256), value: remoteSchema.optional(), get: remoteSchema.optional(), set: remoteSchema.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true), symbol: remoteSchema.optional() });
const internalSchema = z.strictObject({ name: z.string().max(256), value: remoteSchema });
const replySchema = z.strictObject({ result: z.array(propertySchema).max(256), internalProperties: z.array(internalSchema).max(3) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_SCENE_RAW_GUARD"); } }
const guardStart = SNAPSHOT.indexOf("function(){for(let i=0;i<entries.length;i++)"), guardStop = SNAPSHOT.lastIndexOf("return true;};") + "return true;}".length;
if (guardStart === -1 || guardStop <= guardStart) { throw new Error("SCHEMATIC_RELEVANCE_RAW_GUARD_ANCHOR"); }
export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_GUARD_SOURCE = SNAPSHOT.slice(guardStart, guardStop);
export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_GUARD_SCRIPT = `(${SNAPSHOT})`;
const start = CURRENT_SCHEMATIC_WIRE_SCENE_RAW_GUARD_SCRIPT.indexOf(CURRENT_SCHEMATIC_WIRE_SCENE_RAW_GUARD_SOURCE); const before = CURRENT_SCHEMATIC_WIRE_SCENE_RAW_GUARD_SCRIPT.slice(0, start);
export function currentSchematicWireSceneRawGuard(input: unknown): string {
  const parsed = replySchema.parse(captureCurrentPcbStringClockReply(input).value); const fields = currentSchematicRelevanceRawProperties(input); const internals = new Map(parsed.internalProperties.map(row => [row.name, row.value]));
  need(fields.size === 3 && fields.has("name") && fields.has("length") && fields.has("prototype") && internals.size === 3);
  const name = fields.get("name"); const length = fields.get("length"); const prototype = fields.get("prototype"); const location = internals.get("[[FunctionLocation]]");
  need(name?.value?.value === "guard" && name.value.type === "string" && name.writable === false && !name.enumerable && name.configurable && length?.value?.value === 0 && length.value.type === "number" && length.writable === false && !length.enumerable && length.configurable && prototype?.value?.type === "object" && prototype.value.objectId !== undefined && prototype.value.subtype !== "proxy" && prototype.writable === true && !prototype.configurable && !prototype.enumerable && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined);
  const point = z.strictObject({ scriptId: handle, lineNumber: z.literal(before.split("\n").length - 1), columnNumber: z.literal(before.length - before.lastIndexOf("\n") - 1 + "function".length) }).parse(location.value);
  const parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]"); need(parent?.type === "function" && parent.description === "function () { [native code] }" && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? "")); return point.scriptId;
}
