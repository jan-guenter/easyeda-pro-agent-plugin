/** Original startup actor and completed-SQL attribution for footprint copy.
 * The footprint state here is supplied data; only the separate opening-owned
 * composition may establish its ownership. Local Date is never a qe result. */
import { types } from "node:util";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentFootprintCopyStatePacketSchema } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import type { CurrentPcb209OriginalStartupActorObservation } from "./current-pcb-209-worker-startup-actor.ts";
import { CurrentPcbWorkerStartupActorRunner } from "./current-pcb-worker-startup-actor-runner.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export const CURRENT_FOOTPRINT_COPY_ACTOR_LIMITS = Object.freeze({
  backendRequestActorVerified: false, backendActorProvenanceVerified: false,
  footprintUserFutureUseVerified: false, windowsClockProvenanceVerified: false,
  buildStringServerClockObserved: false, canvasStringServerClockObserved: false,
  clockProvenanceVerified: false, producerBindingVerified: false,
  executionAuthorized: false, persistenceVerified: false,
} as const);
export interface CurrentFootprintCopyActorProjection extends Readonly<typeof CURRENT_FOOTPRINT_COPY_ACTOR_LIMITS> {
  readonly profile: "private.current-footprint-copy-actor-projection.v1";
  readonly identity: CurrentFootprintCopyStatePacket["identity"];
  readonly originalActorCollectionRetained: true;
  readonly originalCompletedSqlRetained: true;
  readonly originalFootprintStateRetained: false;
  readonly footprintCapturedUser: "own-undefined";
  readonly footprintDocheadUserOmitted: true;
  readonly actorPacketSha256: string;
  readonly beforeSqlSha256: string;
  readonly stateSha256: string;
  readonly projectWorkerUserSha256: string;
  readonly backendActorCandidate: Readonly<{ uuid: string; username: string; nickname: string }>;
  readonly backendActorCandidateText: string;
  readonly backendActorSelection: "one-original-project-user" | "no-original-project-user";
  readonly usersTableSha256: string;
  readonly selectedUserRowSha256: string | null;
  readonly originalLocalDateSampleCount: 4;
  readonly localDateSamplesSha256: string;
}
interface Retained {
  readonly observation: CurrentPcb209OriginalStartupActorObservation;
  readonly before: Inventory;
  readonly completion: ReturnType<typeof readerCompletion>;
  failed: boolean;
}
const originals = new WeakMap<CurrentFootprintCopyActorProjection, Retained>();
const consumed = new WeakSet<object>();
// oxlint-disable-next-line typescript/unbound-method -- The original class method runs with its retained private-field receiver.
const originalPacket = CurrentPcbWorkerStartupActorRunner.prototype.requireOriginal;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_ACTOR: ${detail}`); }
}
function observation(input: CurrentPcb209OriginalStartupActorObservation): CurrentPcb209OriginalStartupActorObservation {
  need(input !== null && typeof input === "object" && !types.isProxy(input) &&
    Object.getPrototypeOf(input) === Object.prototype && Object.isFrozen(input), "fixed original observation required");
  const keys = ["runner", "packet"];
  need(Reflect.ownKeys(input).length === keys.length && keys.every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    return descriptor !== undefined && Object.hasOwn(descriptor, "value");
  }), "original observation data references required");
  need(input.runner !== null && typeof input.runner === "object" && input.packet !== null && typeof input.packet === "object" &&
    !types.isProxy(input.runner) && !types.isProxy(input.packet), "original observation objects required"); return input;
}
async function actor(input: CurrentPcb209OriginalStartupActorObservation): Promise<void> {
  need(CurrentPcbWorkerStartupActorRunner.prototype.requireOriginal === originalPacket, "original actor method changed");
  need(await originalPacket.call(input.runner, input.packet) === input.packet, "original actor collection required");
  need(CurrentPcbWorkerStartupActorRunner.prototype.requireOriginal === originalPacket, "original actor method changed");
}
function sql(before: Inventory, completion: ReturnType<typeof readerCompletion>): void {
  need(readerCompletion(before) === completion && completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "original completed SQL reader required");
  need(before.logicalSha256 === sha256Json({ schema: before.schema, properties: before.properties, tables: before.tables }),
    "original SQL inventory changed");
}
function table(before: Inventory, name: string): SqlTable {
  const tables = before.tables.filter(value => value.name === name); const selected = tables[0];
  need(tables.length === 1 && selected !== undefined && selected.rows.length <= 4096, "bounded unique SQL table required"); return selected;
}
function text(owner: SqlTable, row: SqlRow, name: string, maximum: number): string {
  const indexes = owner.columns.flatMap((column, index) => column["name"] === name ? [index] : []);
  const index = indexes[0]; const cell = index === undefined ? undefined : row.cells[index];
  need(indexes.length === 1 && cell?.kind === "text" && cell.hex.length <= maximum * 8, "bounded SQL TEXT required");
  const bytes = Buffer.from(cell.hex, "hex"), value = bytes.toString("utf8");
  need(value.length <= maximum && value.isWellFormed() && Buffer.from(value).equals(bytes), "exact SQL UTF8 required"); return value;
}
function project(before: Inventory, state: CurrentFootprintCopyStatePacket): void {
  const branches = table(before, "branches"), projects = table(before, "projects");
  const selected = projects.rows.filter(row => text(projects, row, "uuid", 64) === state.identity.projectUuid);
  const branch = branches.rows.filter(row => text(branches, row, "uuid", 32) === state.identity.branchUuid);
  need(selected.length === 1 && branch.length === 1 && branch[0] !== undefined &&
    text(branches, branch[0], "project_uuid", 64) === state.identity.projectUuid, "actor and SQL project/branch differ");
}
/** SQL names predict EDIT_HEAD attribution. They are not the UI names and do
 * not prove the actor of a future backend request. The separate Tg.user is own
 * undefined, so the project worker's user object must not enter DOCHEAD. */
export async function prepareCurrentFootprintCopyActorProjection(input: CurrentPcb209OriginalStartupActorObservation,
  before: Inventory, suppliedState: CurrentFootprintCopyStatePacket): Promise<CurrentFootprintCopyActorProjection> {
  const original = observation(input);
  // Reserve before the first awaited native owner check: overlapping requests
  // Must not consume a second reproof's capacity for the same actor packet.
  need(!consumed.has(original.packet), "actor preparation consumed"); consumed.add(original.packet);
  await actor(original);
  const completion = readerCompletion(before); sql(before, completion);
  const state = freezeDeep(currentFootprintCopyStatePacketSchema.parse(captureCurrentPcbStringClockReply(suppliedState).value));
  need(canonicalJson(original.packet.identity) === canonicalJson(state.identity), "actor and footprint identity differ");
  project(before, state);
  const first = original.packet.samples[0]; need(first?.phase === "ui", "original UI sample required");
  const users = table(before, "users"), uuid = first.startupActor.uuid;
  const rows = users.rows.filter(row => text(users, row, "uuid", 32) === uuid); const row = rows[0];
  need(rows.length <= 1, "SQL actor is ambiguous");
  const backendActorCandidate = Object.freeze({ uuid, username: row === undefined ? "" : text(users, row, "username", 1024),
    nickname: row === undefined ? "" : text(users, row, "nickname", 1024) });
  await actor(original); sql(before, completion);
  const token: CurrentFootprintCopyActorProjection = freezeDeep({ profile: "private.current-footprint-copy-actor-projection.v1",
    identity: state.identity, originalActorCollectionRetained: true, originalCompletedSqlRetained: true,
    originalFootprintStateRetained: false, footprintCapturedUser: "own-undefined", footprintDocheadUserOmitted: true,
    actorPacketSha256: original.packet.packetSha256, beforeSqlSha256: before.logicalSha256, stateSha256: sha256Json(state),
    projectWorkerUserSha256: sha256Text(original.packet.workerUserText), backendActorCandidate,
    backendActorCandidateText: JSON.stringify(backendActorCandidate),
    backendActorSelection: row === undefined ? "no-original-project-user" : "one-original-project-user",
    usersTableSha256: sha256Json(users), selectedUserRowSha256: row === undefined ? null : sha256Json(row),
    originalLocalDateSampleCount: 4, localDateSamplesSha256: sha256Json(original.packet.samples.map(sample => sample.clock)),
    ...CURRENT_FOOTPRINT_COPY_ACTOR_LIMITS });
  originals.set(token, { observation: original, before, completion, failed: false }); return token;
}
export async function requireCurrentFootprintCopyActorProjection(token: CurrentFootprintCopyActorProjection,
  input: CurrentPcb209OriginalStartupActorObservation, before: Inventory): Promise<CurrentFootprintCopyActorProjection> {
  const retained = originals.get(token);
  need(retained !== undefined && retained.observation === input && retained.before === before && !retained.failed,
    "original actor preparation required");
  try { await actor(retained.observation); sql(before, retained.completion); return token; }
  catch (error) { retained.failed = true; throw error; }
}
