/** Read a bounded original Inspector data graph without executing a property
 * getter or walking a Proxy. The source pause must remain held throughout. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const prototype = z.strictObject({ name: z.literal("[[Prototype]]"), value: remote });
const reply = z.strictObject({ result: z.array(property).max(24), internalProperties: z.tuple([prototype]) });
export type CurrentPcbViaPostSyncRemote = z.infer<typeof remote>;
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_POST_SYNC_DATA_GRAPH"); } }
export function currentPcbViaPostSyncPlainHandle(input: unknown, array: boolean): string {
  const value = remote.parse(input); need(value.type === "object" && value.objectId !== undefined && !Object.hasOwn(value, "value") && value.className === (array ? "Array" : "Object") && value.subtype === (array ? "array" : undefined)); return value.objectId;
}
export function currentPcbViaPostSyncOwnProperties(input: unknown, array: boolean): ReadonlyMap<string, CurrentPcbViaPostSyncRemote> {
  const fields = reply.parse(captureCurrentPcbStringClockReply(input).value); currentPcbViaPostSyncPlainHandle(fields.internalProperties[0].value, array);
  const result = new Map(fields.result.map(field => [field.name, field.value])); need(result.size === fields.result.length); return result;
}
export async function readCurrentPcbViaPostSyncGraph(root: unknown, request: (objectId: string, ordinal: number) => Promise<unknown>): Promise<string> {
  const active = new Set<string>(); let objects = 0, values = 0;
  const visit = async (input: unknown, depth: number): Promise<unknown> => {
    values += 1; need(depth <= 7 && values <= 128); const value = remote.parse(input);
    if (value.type !== "object") { need(value.objectId === undefined && value.subtype === undefined && ["string", "number", "boolean"].includes(value.type) && typeof value.value === value.type); if (typeof value.value === "string") { need(value.value.isWellFormed() && Buffer.byteLength(value.value) <= 8192); } if (typeof value.value === "number") { need(Number.isFinite(value.value) && !Object.is(value.value, -0)); } return value.value; }
    if (value.subtype === "null") { need(value.value === null && value.objectId === undefined); return null; }
    const array = value.subtype === "array", objectId = currentPcbViaPostSyncPlainHandle(value, array);
    need(!active.has(objectId) && objects < 24); const ordinal = objects; objects += 1; active.add(objectId);
    const fields = reply.parse(captureCurrentPcbStringClockReply(await request(objectId, ordinal)).value);
    currentPcbViaPostSyncPlainHandle(fields.internalProperties[0].value, array);
    const entries = new Map(fields.result.map(field => [field.name, field])); need(entries.size === fields.result.length);
    const output: Record<string, unknown> | unknown[] = array ? [] : {};
    if (array) {
      const length = entries.get("length"); need(length !== undefined && length.value.type === "number" && Number.isSafeInteger(length.value.value) && !length.enumerable && !length.configurable && length.writable);
      const count = z.number().int().min(0).max(4).parse(length.value.value); need(entries.size === count + 1);
      need(Array.isArray(output)); for (let index = 0; index < count; index += 1) { const field = entries.get(String(index)); need(field !== undefined && field.enumerable && field.configurable && field.writable); output.push(await visit(field.value, depth + 1)); }
    } else {
      for (const field of fields.result) { need(field.enumerable && field.writable && field.configurable && field.name !== "toJSON" && field.name !== "__proto__"); Object.defineProperty(output, field.name, { value: await visit(field.value, depth + 1), enumerable: true }); }
    }
    active.delete(objectId); return output;
  };
  const output = JSON.stringify(await visit(root, 0)); need(Buffer.byteLength(output) <= 8192); return output;
}
