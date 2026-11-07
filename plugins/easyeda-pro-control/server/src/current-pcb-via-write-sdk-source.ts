/** Original inspector metadata binds both retained SDK methods to the actual
 * full installed api.js. Function text alone is insufficient. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { types } from "node:util";
import { CURRENT_PCB_VIA_WRITE_SDK_METHODS, CURRENT_PCB_VIA_WRITE_SDK_SOURCE } from "./current-pcb-via-write-program.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.strictObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(8192).optional(),
  objectId: handle.optional(), value: z.union([z.string(), z.number(), location]).optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const properties = z.strictObject({ result: z.array(property).max(16), internalProperties: z.array(internal).max(4) });
function bad(): never { throw new Error("PCB_VIA_SDK_ORIGINAL_SOURCE"); }
export function decodeCurrentPcbViaSdkTuple(raw: unknown): Readonly<{ create: string; save: string }> {
  const result = properties.parse(captureCurrentPcbStringClockReply(raw).value);
  if (result.result.length !== 10 || new Set(result.result.map(row => row.name)).size !== 10 ||
    result.internalProperties.length !== 1 || result.internalProperties[0]?.name !== "[[Prototype]]") { return bad(); }
  for (const name of [...Array.from({ length: 9 }, (_value, index) => String(index)), "length"]) { if (!result.result.some(row => row.name === name)) { return bad(); } }
  if (result.result.find(row => row.name === "length")?.value.value !== 9) { return bad(); }
  const handles = ["3", "6"].map(name => {
    const item = result.result.find(row => row.name === name)?.value;
    if (item?.type !== "function" || item.className !== "AsyncFunction" || item.objectId === undefined ||
      item.description !== CURRENT_PCB_VIA_WRITE_SDK_METHODS[name === "3" ? "create" : "save"]) { return bad(); } return item.objectId;
  });
  const create = handles[0], save = handles[1]; if (create === undefined || save === undefined) { return bad(); } return Object.freeze({ create, save });
}
export function decodeCurrentPcbViaSdkMethod(raw: unknown, kind: "create" | "save"): string {
  const result = properties.parse(captureCurrentPcbStringClockReply(raw).value);
  if (result.result.length !== 2 || result.internalProperties.length !== 3 || new Set(result.internalProperties.map(row => row.name)).size !== 3) { return bad(); }
  const count = result.result.find(row => row.name === "length"), name = result.result.find(row => row.name === "name");
  if (name?.value.type !== "string" || name.value.value !== kind || count?.value.type !== "number" || count.value.value !== (kind === "create" ? 9 : 0) ||
    name.writable || count.writable || name.enumerable || count.enumerable || !name.configurable || !count.configurable) { return bad(); }
  const metadata = result.internalProperties.find(row => row.name === "[[FunctionLocation]]")?.value;
  const current = location.parse(metadata?.value);
  if (metadata?.type !== "object" || metadata.subtype !== "internal#location" || current.lineNumber !== 37 ||
    current.columnNumber !== (kind === "create" ? 41_170 : 139_882) ||
    !result.internalProperties.some(row => row.name === "[[Scopes]]" && row.value.subtype === "internal#scopeList" && row.value.objectId !== undefined) ||
    !result.internalProperties.some(row => row.name === "[[Prototype]]" && row.value.type === "function" && row.value.objectId !== undefined)) { return bad(); }
  return current.scriptId;
}
export function qualifyCurrentPcbViaSdkSource(raw: unknown): void {
  if (raw === null || typeof raw !== "object" || types.isProxy(raw) || Array.isArray(raw) || Reflect.ownKeys(raw).length !== 1 ||
    (Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null)) { return bad(); }
  const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "string") { return bad(); }
  const source: string = descriptor.value;
  if (Buffer.byteLength(source) !== CURRENT_PCB_VIA_WRITE_SDK_SOURCE.bytes || createHash("sha256").update(source).digest("hex") !== CURRENT_PCB_VIA_WRITE_SDK_SOURCE.sha256) { return bad(); }
  for (const [kind, start] of [["create", 1_353_915], ["save", 1_452_629]] as const) {
    const expected = CURRENT_PCB_VIA_WRITE_SDK_METHODS[kind]; if (source.slice(start, start + expected.length) !== expected || source.indexOf(expected) !== start) { return bad(); }
  }
}
