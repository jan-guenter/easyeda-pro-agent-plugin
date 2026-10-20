/** Conditional supplied-data model for one token-selected String Save upload.
 * It does not count real uploads, observe Save or grant execution authority. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { compareCurrentPcbStringCreateBody } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { compareCurrentPcbStringPublication } from "./current-pcb-string-publication.ts";
import type { CurrentPcbStringPublicationPlan } from "./current-pcb-string-publication.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const actor = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u),
  username: z.string().max(1024), nickname: z.string().max(1024) }).strict();
// Worker saveCanvas passes loginUser/get verbatim. This initial subset admits
// Only its bounded four-field account shape and preserves its serialization order.
const user = actor.extend({ avatar: z.string().max(4096) }).strict();
const window = z.object({ minimumMs: time, maximumMs: time }).strict()
  .refine(value => value.maximumMs >= value.minimumMs && value.maximumMs - value.minimumMs <= 60_000);
const inputSchema = z.object({ maximumTargetHeaderTime: time, saveTime: time, backendTime: time,
  saveClock: window, backendClock: window, workerUser: user, backendActor: actor }).strict();
export const CURRENT_PCB_STRING_HISTORY_LIMITS = Object.freeze({
  executionAuthorized: false, originalSaveVerified: false, completePublicationIntervalVerified: false,
  producerBindingVerified: false, actorProvenanceVerified: false, clockProvenanceVerified: false,
  uploadCountVerified: false, queueCompletionVerified: false, fullSqlVerified: false, reopened: false,
} as const);
export interface CurrentPcbStringHistoryProjection extends Readonly<typeof CURRENT_PCB_STRING_HISTORY_LIMITS> {
  readonly profile: "private.current-pcb-string-history.v1";
  readonly targetUuid: string; readonly primitiveId: string; readonly client: string; readonly uniqueId: string;
  readonly publicationTicket: number; readonly headTicket: number;
  readonly saveTime: number; readonly backendTime: number;
  readonly workerUserText: string; readonly backendActorText: string;
  readonly bodyText: string; readonly recordsText: string; readonly recordsSha256: string;
  readonly chunkText: string; readonly chunkSha256: string;
  readonly supportedBackendUploadCount: 1;
}
const originals = new WeakSet<CurrentPcbStringHistoryProjection>();
function need(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`Current PCB String history: ${message}.`); }
}
function own(value: unknown): Record<string, unknown> {
  need(value !== null && typeof value === "object" && !types.isProxy(value), "plain own data required");
  const prototype: unknown = Object.getPrototypeOf(value);
  need(prototype === Object.prototype || prototype === null, "plain own data required");
  const keys = Reflect.ownKeys(value);
  need(keys.length <= 12, "object bound exceeded");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    need(typeof key === "string" && !["__proto__", "constructor", "prototype"].includes(key), "object key refused");
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true, "own data fields required");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function stringField(value: unknown, key: string): string {
  const result = projectionField(value, key); need(typeof result === "string", "original projection field missing"); return result;
}
function projectionField(value: unknown, key: string): unknown {
  need(value !== null && typeof value === "object" && !types.isProxy(value), "original projection required");
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "original projection data field required");
  return descriptor.value as unknown;
}
function utf8(value: string): void {
  need(Buffer.byteLength(value) <= 16_384 && Buffer.from(value).toString("utf8") === value, "UTF8 or byte bound differs");
}

/** WORKERb849bd12: saveCanvas2144972 increments max ticket, compress284133
 * selects uniqueIds[token] intersect docIds, and xt241441 serializes its header.
 * The pending STRING keeps its create ticket. compress supplies uniqueId as
 * xt's editVersion argument; its separate internal onDocHead uses editorVersion.
 * APP52f51ce4 L3/PB2602357 supplies a distinct EDIT_HEAD actor and clock.
 *
 * This is only the branch with exactly one token-owned STRING and no other
 * buffered upload. It cannot establish that branch or count actual publications.
 * BLOB/FONT, a prior durable create, extra Save and upload retries are unmodeled.
 */
export function prepareCurrentPcbStringHistory(candidate: CurrentPcbStringCreateCandidate,
  publication: CurrentPcbStringPublicationPlan, input: unknown): CurrentPcbStringHistoryProjection {
  compareCurrentPcbStringCreateBody(candidate, stringField(candidate, "expectedBodyText"));
  // Reject forged plans before reading their nested properties.
  compareCurrentPcbStringPublication(publication, projectionField(publication, "expectedPayload"));
  need(publication.expectedPayload[0][publication.documentUuid]?.pend[0][3] === candidate.expectedBodyText,
    "create and publication body differ");
  const raw = own(input), workerFields = own(raw["workerUser"]);
  const parsed = inputSchema.parse({ ...raw, saveClock: own(raw["saveClock"]), backendClock: own(raw["backendClock"]),
    workerUser: workerFields, backendActor: own(raw["backendActor"]) });
  need(publication.expectedTicket < Number.MAX_SAFE_INTEGER, "Save ticket capacity exhausted");
  need(parsed.saveTime > parsed.maximumTargetHeaderTime &&
    parsed.saveTime >= parsed.saveClock.minimumMs && parsed.saveTime <= parsed.saveClock.maximumMs &&
    parsed.backendTime >= parsed.backendClock.minimumMs && parsed.backendTime <= parsed.backendClock.maximumMs,
  "separate supplied clock bounds differ");
  need(parsed.workerUser.uuid === parsed.backendActor.uuid, "worker and backend account UUID differ");
  for (const value of [...Object.values(parsed.workerUser), ...Object.values(parsed.backendActor)]) { utf8(value); }
  const workerUserText = JSON.stringify(workerFields);
  // Zod validates the account fields; the captured own-field order remains the
  // Exact worker-supplied order, not a reconstructed canonical account object.
  const backendActorText = JSON.stringify(parsed.backendActor);
  utf8(workerUserText); utf8(backendActorText);
  const headTicket = publication.expectedTicket + 1;
  const header = JSON.stringify({ docType: "PCB", client: publication.binding.client, uuid: publication.documentUuid,
    updateTime: parsed.saveTime, version: String(parsed.saveTime), editVersion: publication.binding.uniqueId });
  const recordsText = `{"type":"DOCHEAD","ticket":${headTicket}}||${header.slice(0, -1)},"user":${workerUserText}}|\n` +
    `{"type":"STRING","ticket":${publication.expectedTicket},"id":"${publication.binding.primitiveId}"}||${candidate.expectedBodyText}`;
  const chunkText = `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...parsed.backendActor, updateTime: parsed.backendTime })}|\n${recordsText}`;
  utf8(chunkText);
  const projection: CurrentPcbStringHistoryProjection = freezeDeep({ profile: "private.current-pcb-string-history.v1",
    targetUuid: publication.documentUuid, primitiveId: publication.binding.primitiveId, client: publication.binding.client,
    uniqueId: publication.binding.uniqueId, publicationTicket: publication.expectedTicket, headTicket,
    saveTime: parsed.saveTime, backendTime: parsed.backendTime, workerUserText, backendActorText,
    bodyText: candidate.expectedBodyText, recordsText, recordsSha256: sha256Text(recordsText),
    chunkText, chunkSha256: sha256Text(chunkText), supportedBackendUploadCount: 1, ...CURRENT_PCB_STRING_HISTORY_LIMITS });
  originals.add(projection); return projection;
}
export function requireOriginalCurrentPcbStringHistory(projection: CurrentPcbStringHistoryProjection): CurrentPcbStringHistoryProjection {
  need(originals.has(projection), "original history projection required"); return projection;
}
/** Exact complete plaintext, including one backend EDIT_HEAD. More or fewer
 * upload chunks refuse rather than normalizing duplicate records or tickets. */
export function compareCurrentPcbStringHistory(projection: CurrentPcbStringHistoryProjection, chunk: unknown):
  Readonly<{ suppliedChunkMatchesPrediction: true; chunkSha256: string } & typeof CURRENT_PCB_STRING_HISTORY_LIMITS> {
  requireOriginalCurrentPcbStringHistory(projection);
  need(typeof chunk === "string" && chunk === projection.chunkText, "complete single-upload transcript differs");
  return Object.freeze({ suppliedChunkMatchesPrediction: true, chunkSha256: projection.chunkSha256, ...CURRENT_PCB_STRING_HISTORY_LIMITS });
}
