/** Bounded Inspector data for the original run-prefix collector. No decoded
 * handle or structural packet supplies an owner or permission to continue. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_METADATA_LIMITS as LIMITS, captureCurrentSchematicRelevanceUiPublicationMetadata } from "./current-schematic-relevance-ui-publication-metadata.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().max(128).optional(), className: z.string().max(256).optional(), description: z.string().max(LIMITS.string).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().max(128).optional() });
const field = z.strictObject({ name: z.string().max(256), value: remote.optional(), get: remote.optional(), set: remote.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true), symbol: remote.optional() });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const packet = z.strictObject({ result: z.array(field).max(2048), internalProperties: z.array(internal).max(8).optional() });
const remoteReply = z.strictObject({ result: remote });
const trueReply = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
export type CurrentSchematicRelevanceUiPublicationRemote = z.infer<typeof remote>;
export type CurrentSchematicRelevanceUiPublicationProperties = z.infer<typeof packet>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_UI_PUBLICATION_REPLY"); } }
export function currentSchematicRelevanceUiPublicationHandle(value: CurrentSchematicRelevanceUiPublicationRemote | undefined): string {
  need(value !== undefined && (value.type === "object" || value.type === "function" || value.type === "symbol") && value.objectId !== undefined && value.subtype !== "proxy" && value.subtype !== "null" && value.value === undefined); return value.objectId;
}
export function currentSchematicRelevanceUiPublicationCapture(input: unknown): string {
  const value = remoteReply.parse(captureCurrentPcbStringClockReply(input).value).result;
  need(value.type === "object" && value.subtype === "array" && value.className === "Array" && /^Array\((?:0|[1-9]\d{0,2})\)$/u.test(value.description ?? "")); return currentSchematicRelevanceUiPublicationHandle(value);
}
/** Inspect an original value before any program follows its descriptors or
 * prototype. Proxy internals and duplicate properties fail before that read. */
export function currentSchematicRelevanceUiPublicationProperties(input: unknown): CurrentSchematicRelevanceUiPublicationProperties {
  const value = packet.parse(captureCurrentSchematicRelevanceUiPublicationMetadata(input));
  const names = new Set(value.result.map(item => item.name)); need(names.size === value.result.length);
  const internals = value.internalProperties ?? []; need(new Set(internals.map(item => item.name)).size === internals.length);
  need(internals.every(item => !["[[Target]]", "[[Handler]]", "[[IsRevoked]]", "[[TargetFunction]]", "[[BoundThis]]", "[[BoundArgs]]"].includes(item.name)));
  return value;
}
export function currentSchematicRelevanceUiPublicationTuple(input: unknown, length?: number): readonly CurrentSchematicRelevanceUiPublicationRemote[] {
  const value = currentSchematicRelevanceUiPublicationProperties(input); const fields = new Map(value.result.map(item => [item.name, item]));
  const size = fields.get("length"); need(size?.value?.type === "number" && typeof size.value.value === "number" && Number.isSafeInteger(size.value.value) && size.value.value >= 0 && size.value.value <= 384 && !Object.is(size.value.value, -0) && size.writable === true && !size.enumerable && !size.configurable);
  const count = size.value.value; need((length === undefined || count === length) && fields.size === count + 1);
  const parent = value.internalProperties; need(parent?.length === 1 && parent[0]?.name === "[[Prototype]]" && parent[0].value.type === "object" && parent[0].value.subtype === "array" && parent[0].value.className === "Array" && parent[0].value.objectId !== undefined);
  const result: CurrentSchematicRelevanceUiPublicationRemote[] = [];
  for (let index = 0; index < count; index += 1) { const item = fields.get(String(index)); need(item?.value !== undefined && item.get === undefined && item.set === undefined && item.writable === true && item.enumerable && item.configurable && item.value.subtype !== "proxy"); result.push(item.value); }
  return Object.freeze(result);
}
export function currentSchematicRelevanceUiPublicationTrue(input: unknown): void { trueReply.parse(captureCurrentPcbStringClockReply(input).value); }
