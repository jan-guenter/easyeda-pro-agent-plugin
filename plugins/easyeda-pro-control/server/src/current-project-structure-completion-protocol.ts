/** Finite supplied-observation grammar for Nd/QA and the structure request.
 * Remote IDs in this protocol are comparison strings. Parsing them cannot
 * construct original handles, an event subscription or a native lease. */
import { z } from "zod";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const project = z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u);
const branch = z.string().regex(/^[a-f0-9]{32}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const structure = z.string().min(1).max(2_097_152).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 2_097_152);
const serial = z.enum(["uploadStructure", "structure"]);
const row = z.object({ id: integer.positive(), projectUuid: project, branchUuid: branch, ticket: integer, structureText: structure }).strict();
const selectedRow = z.object({ ticket: integer, structureText: structure }).strict();
const scope = z.object({ workerScriptId: handle, mainScriptId: handle, projectObjectId: handle, channelObjectId: handle,
  projectUuid: project, branchUuid: branch, connectionObjectId: handle, path: z.string().min(1).max(4096), projectPath: z.string().min(1).max(4096) }).strict();
const plan = z.object({ scope, ticket: integer.positive(), beforeStructureText: structure, structureText: structure,
  rows: z.array(row).min(1).max(4096) }).strict();
const event = z.discriminatedUnion("stage", [
  z.object({ stage: z.literal("boundary"), scope, uploadRunning: z.null(), uploadQueued: z.null(),
    structureRunning: z.null(), structureQueued: z.null(), task2Count: z.literal(0) }).strict(),
  z.object({ stage: z.literal("serial-call"), kind: serial, callId: handle, argumentsId: handle, promiseId: handle,
    disposition: z.enum(["start", "queue", "coalesce"]) }).strict(),
  z.object({ stage: z.literal("serial-enter"), kind: serial, runId: handle, argumentsId: handle, promiseId: handle }).strict(),
  z.object({ stage: z.literal("upload-return"), runId: handle, structureCallId: handle }).strict(),
  z.object({ stage: z.literal("callback-enter"), runId: handle, callbackId: handle, taskId: handle, packetId: handle,
    ticket: integer.positive(), structureText: structure }).strict(),
  z.object({ stage: z.literal("post"), callbackId: handle, packetId: handle, requestId: handle, projectUuid: project,
    branchUuid: branch, path: z.string().min(1).max(4096), method: z.literal("POST"), url: z.string().min(1).max(512), ticket: integer.positive(), structureText: structure }).strict(),
  z.object({ stage: z.literal("main-select"), requestId: handle, connectionObjectId: handle, projectPath: z.string().min(1).max(4096), selectedTicket: integer, selectedStructureText: structure,
    rows: z.array(selectedRow).min(1).max(4096) }).strict(),
  z.object({ stage: z.literal("main-update"), requestId: handle, connectionObjectId: handle, branchUuid: branch,
    ticket: integer.positive(), structureText: structure }).strict(),
  z.object({ stage: z.enum(["main-update-return", "main-service-return"]), requestId: handle }).strict(),
  z.object({ stage: z.literal("main-controller-return"), requestId: handle, responseId: handle }).strict(),
  z.object({ stage: z.literal("post-return"), callbackId: handle, requestId: handle, responseId: handle, success: z.literal(true) }).strict(),
  z.object({ stage: z.literal("callback-return"), callbackId: handle, taskId: handle }).strict(),
  z.object({ stage: z.literal("serial-finally"), kind: serial, runId: handle, promiseId: handle }).strict(),
  z.object({ stage: z.literal("promise-settled"), kind: serial, promiseId: handle, outcome: z.literal("fulfilled") }).strict(),
]);
export type CurrentProjectStructureCompletionPlan = Readonly<z.infer<typeof plan>>;
export type CurrentProjectStructureCompletionEvent = Readonly<z.infer<typeof event>>;
// Structure text needs its own limit. The small clock-packet copier accepts
// Only16KiB strings and would silently make this grammar's2MiB contract unusable.
function bad(): never { throw new Error("PROJECT_STRUCTURE_COMPLETION_INPUT"); }
function capture(input: unknown): unknown {
  let bytes = 0, nodes = 0;
  const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > 40_000 || depth > 8) { return bad(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return bad(); } return value; }
    if (typeof value === "string") {
      if (!value.isWellFormed() || value.length > 2_097_152) { return bad(); }
      bytes += Buffer.byteLength(value); if (bytes > 8_388_608) { return bad(); } return value;
    }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return bad(); } seen.add(value);
    const own = (key: string): unknown => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return bad(); }
      return descriptor.value as unknown;
    };
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 4096 || Reflect.ownKeys(value).length !== value.length + 1) { return bad(); }
      return Object.freeze(Array.from({ length: value.length }, (_, index) => copy(own(String(index)), depth + 1)));
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null || keys.length > 16) { return bad(); }
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (typeof key !== "string" || key.length > 64) { return bad(); }
      Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true });
    }
    return Object.freeze(result);
  };
  return copy(input, 0);
}
export function validateCurrentProjectStructureCompletionPlan(input: unknown): CurrentProjectStructureCompletionPlan {
  return freezeDeep(plan.parse(capture(input)));
}
export function validateCurrentProjectStructureCompletionEvent(input: unknown): CurrentProjectStructureCompletionEvent {
  return freezeDeep(event.parse(capture(input)));
}
