/** Current3.2.209 fresh-history/cache destination getter candidates only.
 * Matching supplied content proves no observed replay branch or reopened editor.
 */
import { isRecord, sha256Text } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_WORKER_SHA256, currentFootprintCopySourceRows } from "./current-footprint-copy-append.ts";
import { completedCurrentFootprintCopySqlSource } from "./current-footprint-copy-sql.ts";
import type { CurrentFootprintCopySqlPlan, CurrentFootprintCopySqlSource } from "./current-footprint-copy-sql.ts";
import { parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Replay = "complete-raw-history" | "current-footprint-chunk-cache";
type Data = Readonly<Record<string, unknown>>;
export interface CurrentFootprintCopySavedProjection {
  readonly profile: "private.current-footprint-copy-saved-projections.v1";
  readonly targetUuid: string;
  readonly afterSqlSha256: string;
  readonly creationPlaintextSha256: string;
  readonly maximumTicket: number;
  readonly metadataTicket: number;
  readonly getterHeaderTicket: number;
  readonly selectedHeaderTicket: number;
  readonly selectedHeaderTime: number;
  readonly equalCreationClocks: boolean;
  readonly canvasRecords: number;
  readonly workerSourceSha256: typeof CURRENT_FOOTPRINT_COPY_WORKER_SHA256;
  readonly cacheBranchObserved: false;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
  readonly completionProved: false;
  readonly reopened: false;
}
interface Retained {
  readonly sqlPlan: CurrentFootprintCopySqlPlan;
  readonly effect: unknown;
  readonly after: Inventory;
  readonly source: CurrentFootprintCopySqlSource;
  readonly rawUser: Data;
  readonly cacheUser: Data;
  readonly metadata: string;
  readonly canvas: readonly string[];
}
const originals = new WeakMap<object, Retained>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current footprint saved source: ${message}`); }
}
function original(plan: CurrentFootprintCopySavedProjection): Retained {
  const state = originals.get(plan); need(state !== undefined, "original saved projection required");
  need(completedCurrentFootprintCopySqlSource(state.sqlPlan, state.effect, state.after) === state.source,
    "original completed SQL relation changed"); return state;
}
function body(raw: string | undefined): Data {
  need(raw !== undefined, "creation row missing"); const parsed = parseNativeRecords(raw)[0];
  need(parsed?.body !== null && parsed?.body !== undefined, "creation body missing"); return parsed.body;
}
function clock(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 8_640_000_000_000_000,
    "nonzero generated header clock required"); return value;
}

/** The original successful full-SQL comparison already fixes one appended
 * chunk, two omitted-user headers and one losing source META, with no earlier
 * occurrence of the destination anywhere in history. Never adopt its JSON.
 */
export async function prepareCurrentFootprintCopySavedProjection(sqlPlan: CurrentFootprintCopySqlPlan,
  effect: unknown, after: Inventory): Promise<CurrentFootprintCopySavedProjection> {
  const source = completedCurrentFootprintCopySqlSource(sqlPlan, effect, after); const completion = readerCompletion(after);
  const { appendPlan, append } = source, identity = appendPlan.copyPlan.source;
  const decoded = await decodeCurrentSymbolPreEditHistory(after, { projectUuid: identity.projectUuid, branchUuid: identity.branchUuid });
  const chunk = decoded.chunks.at(-1);
  need(chunk !== undefined && sha256Text(chunk) === append.plaintextSha256 && decoded.maximumTicket === appendPlan.canvasHeaderTicket,
    "original creation append or maximum ticket differs");
  const rows = chunk.split("|\n"); const edit = body(rows[0]), first = body(rows[1]), second = body(rows[3]);
  const firstTime = clock(first["updateTime"]), secondTime = clock(second["updateTime"]);
  need(secondTime >= firstTime && !Object.hasOwn(first, "user") && !Object.hasOwn(second, "user"),
    "fresh omitted-user header path required");
  const copied = currentFootprintCopySourceRows(appendPlan); const canvas = copied.slice(1), metadata = rows[2];
  need(metadata !== undefined && rows.length === copied.length + 4 && rows.slice(4).join("|\n") === copied.join("|\n") &&
    canvas.length === appendPlan.canvasRecords, "creation source relation differs");
  // Tg.data.ticket tracks accepted atom tickets, not DOCHEAD tickets. The old
  // META loses to M+1; all copied canvas atom tickets are <=M. Header selection
  // Only advances on a strictly newer time, so equal clocks retain M+1.
  const equalCreationClocks = firstTime === secondTime;
  const descriptor: CurrentFootprintCopySavedProjection = freezeDeep({ profile: "private.current-footprint-copy-saved-projections.v1",
    targetUuid: append.targetUuid, afterSqlSha256: after.logicalSha256, creationPlaintextSha256: append.plaintextSha256,
    maximumTicket: appendPlan.canvasHeaderTicket, metadataTicket: appendPlan.metadataTicket,
    getterHeaderTicket: appendPlan.canvasHeaderTicket + 1,
    selectedHeaderTicket: equalCreationClocks ? appendPlan.metadataTicket : appendPlan.canvasHeaderTicket,
    selectedHeaderTime: equalCreationClocks ? firstTime : secondTime, equalCreationClocks, canvasRecords: canvas.length,
    workerSourceSha256: CURRENT_FOOTPRINT_COPY_WORKER_SHA256, cacheBranchObserved: false,
    executionAuthorized: false, producerBindingVerified: false, completionProved: false, reopened: false });
  const state: Retained = { sqlPlan, effect, after, source,
    rawUser: freezeDeep({ uuid: edit["uuid"], username: edit["username"], nickname: edit["nickname"] }),
    // Native flowParseFull omits EDIT_HEAD from per-type cache files. The new chunk
    // Contains only this footprint, whose first header has no user; its one
    // Synthesized actor therefore serializes only the destination UUID.
    cacheUser: Object.freeze({ uuid: append.targetUuid }), metadata, canvas: Object.freeze(canvas) };
  need(readerCompletion(after) === completion && completedCurrentFootprintCopySqlSource(sqlPlan, effect, after) === source,
    "original completed SQL inputs changed");
  originals.set(descriptor, state); return descriptor;
}

function head(plan: CurrentFootprintCopySavedProjection, client: string, ticket: number, user: Data): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid: plan.targetUuid,
    updateTime: plan.selectedHeaderTime, version: String(plan.selectedHeaderTime), editVersion: "3.2.209", user })}`;
}

/** Separate exact candidates, never field normalization. The omitted-user
 * same-generation upload can instead retain user:{}; this fresh-replay profile
 * intentionally does not admit that serialization as saved/reopened evidence.
 */
export function expectedCurrentFootprintCopySavedSource(plan: CurrentFootprintCopySavedProjection,
  workerClient: string, replay: Replay): string {
  const state = original(plan);
  need(typeof workerClient === "string" && /^[a-f0-9]{16}$/u.test(workerClient), "current getter client refused");
  need(replay === "complete-raw-history" || replay === "current-footprint-chunk-cache", "exact replay alternative required");
  const user = replay === "complete-raw-history" ? state.rawUser : state.cacheUser;
  return [head(plan, workerClient, plan.getterHeaderTicket, user), state.metadata,
    head(plan, workerClient, plan.selectedHeaderTicket, user), ...state.canvas].join("|\n");
}

function fields(value: unknown): Readonly<Record<string, unknown>> {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain supplied observation required");
  const names = ["profile", "targetUuid", "maximumTicket", "workerClient", "content"]; const keys = Reflect.ownKeys(value);
  need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "exact observation fields required");
  const result: Record<string, unknown> = {};
  for (const key of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "observation accessors refused");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}

/** Matching caller-supplied content is not a live read, reopened generation,
 * cache-branch observation or producer-completion proof.
 */
export function verifyCurrentFootprintCopySavedSource(plan: CurrentFootprintCopySavedProjection,
  observation: unknown): Readonly<Record<string, unknown>> {
  original(plan); const supplied = fields(observation); const client = supplied["workerClient"], content = supplied["content"];
  need(supplied["profile"] === "private.current-footprint-copy-saved-content-observation.v1" &&
    supplied["targetUuid"] === plan.targetUuid && supplied["maximumTicket"] === plan.maximumTicket &&
    typeof client === "string" && typeof content === "string" && Buffer.byteLength(content) <= 2_097_152,
    "supplied identity, clock or content bound differs");
  const raw = expectedCurrentFootprintCopySavedSource(plan, client, "complete-raw-history");
  const cache = expectedCurrentFootprintCopySavedSource(plan, client, "current-footprint-chunk-cache");
  need(content === raw || content === cache, "exact saved getter content differs");
  return Object.freeze({ profile: "private.current-footprint-copy-saved-content-relation.v1", targetUuid: plan.targetUuid,
    afterSqlSha256: plan.afterSqlSha256, creationPlaintextSha256: plan.creationPlaintextSha256,
    exactContent: true, matchedProjection: content === raw ? "complete-raw-history" : "current-footprint-chunk-cache",
    contentSha256: sha256Text(content), contentBytes: Buffer.byteLength(content),
    executionAuthorized: false, producerBindingVerified: false, cacheBranchObserved: false, completionProved: false, reopened: false });
}
