/** Pure relation for one current SCH-container title upload. No dispatch. */
import { createHash } from "node:crypto";
import { z } from "zod";

// Reviewed project-worker.js 3.2.184.355087e9, SHA-256
// Digest b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928.
// UTF-16 offsets: xt/$e 241441/241789; of.head 619874; oN.metaData 649563;
// Pi constructor/newTicket 1856199/1856486; Dg.updateString/updateData
// 1915393/1915783. Fresh Dg construction2105145 precedes subscribe2115300,
// So the fresh header has no user. Caller actor fields describe APP EDIT_HEAD,
// Not that producer. APP52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c,
// PB/L3 at2602357/2602467 selects request UUID and original project-users row.
// This model neither performs that selection nor supplies its provenance.
const MAX_RECORD_BYTES = 32_768, MAX_WINDOW_MS = 60_000;
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const title = z.string().min(1).max(512).refine(value => value.trim() === value && !/\p{Cc}/u.test(value));
const metaSchema = z.object({ title, source: z.literal(""), board: z.union([z.literal(""), identifier]), zIndex: z.null() }).strict();
const windowSchema = z.object({ minimumMs: time, maximumMs: time }).strict()
  .refine(value => value.maximumMs >= value.minimumMs && value.maximumMs - value.minimumMs <= MAX_WINDOW_MS);
const actorSchema = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u), username: z.string().max(1024), nickname: z.string().max(1024) }).strict();
const inputSchema = z.object({ targetUuid: identifier, beforeMetaText: z.string().min(1).max(MAX_RECORD_BYTES), desiredTitle: title,
  maximumTargetHeaderTime: time, client: z.string().regex(/^[a-f0-9]{16}$/u), maximumTicket: integer.max(Number.MAX_SAFE_INTEGER - 1),
  documentTime: time, backendTime: time, documentClock: windowSchema, backendClock: windowSchema, backendActor: actorSchema }).strict();
const LIMITS = Object.freeze({ executionAuthorized: false, producerBindingVerified: false, completeHistoryVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, nativeNamePolicyVerified: false,
  queueCompletionVerified: false, fullSqlVerified: false, reopened: false } as const);
export interface CurrentSchematicRenameHistoryProjection extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-schematic-rename-history.v1";
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
export interface CurrentSchematicRenameHistoryComparison extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-schematic-rename-history-comparison.v1";
  readonly exactAppendedChunk: true;
  readonly chunkSha256: string;
}
const projections = new WeakSet<object>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current schematic rename history: ${message}`); }
}
function fields(value: unknown, keys: readonly string[]): Record<string, unknown> {
  need(value !== null && typeof value === "object" && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain data required");
  const actual = Reflect.ownKeys(value);
  need(actual.length === keys.length && actual.every(key => typeof key === "string" && keys.includes(key)), "input fields differ");
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

/** Supplied values only. Complete target/peer history, native naming policy,
 * original Dg/client/actor, independent clocks and full SQL remain unproved.
 * SCH META forces null zIndex; refuse other baseline values rather than silently
 * normalizing them. This relation is distinct from SCH_PAGE title editing.
 */
export function prepareCurrentSchematicRenameHistory(input: unknown): CurrentSchematicRenameHistoryProjection {
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
  const afterMetaText = JSON.stringify({ title: captured.desiredTitle, source: before.source, board: before.board, zIndex: null });
  const header = { docType: "SCH", client: captured.client, uuid: captured.targetUuid, updateTime: captured.documentTime,
    version: String(captured.documentTime), editVersion: "3.2.206" };
  const recordsText = `${JSON.stringify({ type: "DOCHEAD", ticket: expectedTicket })}||${JSON.stringify(header)}|\n` +
    `${JSON.stringify({ type: "META", ticket: expectedTicket, id: "META" })}||${afterMetaText}`;
  const actor = captured.backendActor;
  const chunkText = `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ uuid: actor.uuid, username: actor.username,
    nickname: actor.nickname, updateTime: captured.backendTime })}|\n${recordsText}`;
  exactUtf8(chunkText);
  const projection: CurrentSchematicRenameHistoryProjection = Object.freeze({ profile: "private.current-schematic-rename-history.v1", targetUuid: captured.targetUuid,
    expectedTicket, documentTime: captured.documentTime, backendTime: captured.backendTime, beforeMetaText: captured.beforeMetaText,
    afterMetaText, recordsText, recordsSha256: digest(recordsText), chunkText, chunkSha256: digest(chunkText), ...LIMITS });
  projections.add(projection); return projection;
}

/** Exact decoded chunk equality, not SQL placement, prior-history invariance,
 * generation closure or saved/reopened acceptance. Copies are not projections.
 */
export function verifyCurrentSchematicRenameHistory(projection: CurrentSchematicRenameHistoryProjection, observedChunk: unknown): CurrentSchematicRenameHistoryComparison {
  need(projections.has(projection), "original pure projection required");
  need(typeof observedChunk === "string" && observedChunk === projection.chunkText, "complete appended chunk differs");
  return Object.freeze({ profile: "private.current-schematic-rename-history-comparison.v1", exactAppendedChunk: true,
    chunkSha256: projection.chunkSha256, ...LIMITS });
}
