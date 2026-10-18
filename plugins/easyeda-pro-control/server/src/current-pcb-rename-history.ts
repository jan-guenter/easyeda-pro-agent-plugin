/** Dormant data-only model of one current PCB metadata upload. No dispatch. */
import { createHash } from "node:crypto";
import { z } from "zod";

// Reviewed project-worker.js 3.2.184.355087e9, SHA-256
// Digest b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928.
// UTF-16 offsets: xt/$e 241441/241789; of.head 619874; aN.metaData 649323;
// Pi constructor/newTicket 1856199/1856486; Sg.updateString/updateData 1905741/1906142.
// The fresh model captures project.user before subscribe assigns it. This
// Profile therefore emits no DOCHEAD user. A future issuer must bind that exact
// Constructor/open path; supplied actor data only describes APP's EDIT_HEAD.
// The worker forces META zIndex=null, so non-null original metadata is refused.
// APP SHA-256 52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c,
// PB/L3 at 2602357/2602467 derive the edit actor from request UUID and the
// Original project users row, or empty display names when that row is absent.
const MAX_RECORD_BYTES = 32_768, MAX_WINDOW_MS = 60_000;
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const metaSchema = z.object({ title, parent: z.literal(""), source: z.literal(""),
  board: z.union([z.literal(""), identifier]), zIndex: z.null() }).strict();
const windowSchema = z.object({ minimumMs: time, maximumMs: time }).strict()
  .refine((value) => value.maximumMs >= value.minimumMs && value.maximumMs - value.minimumMs <= MAX_WINDOW_MS);
const actorSchema = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u), username: z.string().max(1024), nickname: z.string().max(1024) }).strict();
const inputSchema = z.object({ targetUuid: identifier, beforeMetaText: z.string().min(1).max(MAX_RECORD_BYTES), desiredTitle: title,
  maximumTargetHeaderTime: time, client: z.string().regex(/^[a-f0-9]{16}$/u), maximumTicket: integer.max(Number.MAX_SAFE_INTEGER - 1),
  documentTime: time, backendTime: time, documentClock: windowSchema, backendClock: windowSchema, backendActor: actorSchema }).strict();
const LIMITS = Object.freeze({ executionAuthorized: false, producerBindingVerified: false, completeHistoryVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, queueCompletionVerified: false, fullSqlVerified: false, reopened: false } as const);

export interface CurrentPcbRenameHistoryProjection extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-rename-history.v1";
  readonly targetUuid: string;
  readonly expectedTicket: number;
  readonly documentTime: number;
  readonly backendTime: number;
  readonly beforeMetaText: string;
  readonly afterMetaText: string;
  readonly recordsText: string;
  readonly recordsSha256: string;
  readonly chunkText: string;
  readonly chunkSha256: string;
}
export interface CurrentPcbRenameHistoryComparison extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-rename-history-comparison.v1";
  readonly exactAppendedChunk: true;
  readonly chunkSha256: string;
}
const projections = new WeakSet<object>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB rename history: ${message}`); }
}
function fields(value: unknown, keys: readonly string[]): Record<string, unknown> {
  need(value !== null && typeof value === "object" && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain data required");
  const actual = Reflect.ownKeys(value);
  need(actual.length === keys.length && actual.every((key) => typeof key === "string" && keys.includes(key)), "input fields differ");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors refused");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function exactUtf8(value: string): void {
  need(Buffer.byteLength(value, "utf8") <= MAX_RECORD_BYTES && Buffer.from(value, "utf8").toString("utf8") === value, "record UTF8 or byte bound differs");
}
function digest(value: string): string { return createHash("sha256").update(value, "utf8").digest("hex"); }

/** Supplied observations only. Neither bounds nor actor fields are issued
 * Evidence. The future coordinator must prove complete target/peer history,
 * original worker/client/actor, independent clocks, closure and full SQL effect.
 * Names must also be checked against the complete native peer-name policy.
 */
export function prepareCurrentPcbRenameHistory(input: unknown): CurrentPcbRenameHistoryProjection {
  const raw = fields(input, ["targetUuid", "beforeMetaText", "desiredTitle", "maximumTargetHeaderTime", "client", "maximumTicket",
    "documentTime", "backendTime", "documentClock", "backendClock", "backendActor"]);
  const captured = inputSchema.parse({ ...raw, documentClock: fields(raw["documentClock"], ["minimumMs", "maximumMs"]),
    backendClock: fields(raw["backendClock"], ["minimumMs", "maximumMs"]), backendActor: fields(raw["backendActor"], ["uuid", "username", "nickname"]) });
  exactUtf8(captured.beforeMetaText);
  const parsed: unknown = JSON.parse(captured.beforeMetaText);
  const before = metaSchema.parse(parsed);
  for (const value of [before.title, captured.desiredTitle, captured.backendActor.username, captured.backendActor.nickname]) { exactUtf8(value); }
  need(JSON.stringify(before) === captured.beforeMetaText, "baseline META is not exact supported native serialization");
  need(before.title !== captured.desiredTitle, "unchanged title refused");
  need(captured.documentTime > captured.maximumTargetHeaderTime, "document clock must exceed every prior target header");
  need(captured.documentTime >= captured.documentClock.minimumMs && captured.documentTime <= captured.documentClock.maximumMs &&
    captured.backendTime >= captured.backendClock.minimumMs && captured.backendTime <= captured.backendClock.maximumMs,
  "generated time lies outside its separate supplied clock bounds");
  const expectedTicket = captured.maximumTicket + 1;
  const afterMetaText = JSON.stringify({ title: captured.desiredTitle, parent: before.parent, source: before.source, board: before.board, zIndex: null });
  const header = { docType: "PCB", client: captured.client, uuid: captured.targetUuid, updateTime: captured.documentTime,
    version: String(captured.documentTime), editVersion: "3.2.206" };
  const recordsText = `${JSON.stringify({ type: "DOCHEAD", ticket: expectedTicket })}||${JSON.stringify(header)}|\n` +
    `${JSON.stringify({ type: "META", ticket: expectedTicket, id: "META" })}||${afterMetaText}`;
  const actor = captured.backendActor;
  const chunkText = `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ uuid: actor.uuid, username: actor.username,
    nickname: actor.nickname, updateTime: captured.backendTime })}|\n${recordsText}`;
  exactUtf8(chunkText);
  const projection: CurrentPcbRenameHistoryProjection = Object.freeze({ profile: "private.current-pcb-rename-history.v1", targetUuid: captured.targetUuid,
    expectedTicket, documentTime: captured.documentTime, backendTime: captured.backendTime, beforeMetaText: captured.beforeMetaText,
    afterMetaText, recordsText, recordsSha256: digest(recordsText), chunkText, chunkSha256: digest(chunkText), ...LIMITS });
  projections.add(projection);
  return projection;
}

/** Exact decoded chunk equality. This proves neither its SQL placement nor
 * encrypted container, prior history preservation, saved content or completion.
 */
export function verifyCurrentPcbRenameHistory(projection: CurrentPcbRenameHistoryProjection, observedChunk: unknown): CurrentPcbRenameHistoryComparison {
  need(projections.has(projection), "original pure projection required");
  need(typeof observedChunk === "string" && observedChunk === projection.chunkText, "complete appended chunk differs");
  return Object.freeze({ profile: "private.current-pcb-rename-history-comparison.v1", exactAppendedChunk: true,
    chunkSha256: projection.chunkSha256, ...LIMITS });
}
