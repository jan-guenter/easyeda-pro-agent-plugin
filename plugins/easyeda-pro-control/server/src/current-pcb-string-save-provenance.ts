/** String-specific actor attribution from an original six-sample collection and
 * an original completed SQL reader. SQL names are a backend prediction, never
 * an observed request actor. Local Date samples supply no Save clock window. */
import { types } from "node:util";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { CurrentPcbStringActorClockRunner } from "./current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringActorClockPacket } from "./current-pcb-string-actor-clock-runner.ts";
import { requireOriginalCurrentPcbStringHistory } from "./current-pcb-string-history.ts";
import type { CurrentPcbStringHistoryProjection } from "./current-pcb-string-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export const CURRENT_PCB_STRING_SAVE_PROVENANCE_LIMITS = Object.freeze({
  nativeOwnerVerified: false, sqlSourceOwnershipVerified: false, sourceFreshnessVerified: false,
  backendRequestActorVerified: false, backendActorProvenanceVerified: false,
  workerUserFutureUseVerified: false, windowsClockProvenanceVerified: false,
  serverClockObserved: false, saveClockProvenanceVerified: false, clockProvenanceVerified: false,
  producerBindingVerified: false, originalSaveVerified: false, generationClosureVerified: false,
  persistentUploadReplayExcluded: false, reopened: false, executionAuthorized: false, saveAuthorized: false,
} as const);
export interface CurrentPcbStringSaveProvenance extends Readonly<typeof CURRENT_PCB_STRING_SAVE_PROVENANCE_LIMITS> {
  readonly profile: "private.current-pcb-string-save-provenance.v1";
  readonly identity: CurrentPcbStringActorClockPacket["identity"];
  readonly originalActorCollectionRetained: true;
  readonly originalCompletedSqlRetained: true;
  readonly actorPacketSha256: string;
  readonly beforeSqlSha256: string;
  readonly workerUserText: string;
  readonly workerUserSha256: string;
  readonly backendActorCandidate: ActorProjection;
  readonly backendActorCandidateText: string;
  readonly backendActorSelection: "one-original-project-user" | "no-original-project-user";
  readonly usersTableSha256: string;
  readonly selectedUserRowSha256: string | null;
  readonly originalLocalClockSampleCount: 6;
  readonly localClockSamplesSha256: string;
}
interface Retained {
  readonly runner: CurrentPcbStringActorClockRunner;
  readonly packet: CurrentPcbStringActorClockPacket;
  readonly before: Inventory;
  readonly token: CurrentPcbStringSaveProvenance;
  readonly tokenText: string;
  failed: boolean;
}
const consumed = new WeakSet<CurrentPcbStringActorClockPacket>();
const issued = new WeakMap<CurrentPcbStringSaveProvenance, Retained>();
// Capture the actual private-field method. An own method on a lookalike runner
// Or a later instance override must not manufacture original packet ownership.
// oxlint-disable-next-line typescript/unbound-method -- Identity-pinned method is called only with its original runner receiver.
const originalPacket = CurrentPcbStringActorClockRunner.prototype.requireOriginalPacket;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_STRING_SAVE_PROVENANCE: ${detail}`); }
}
function actorPacket(runner: CurrentPcbStringActorClockRunner, packet: CurrentPcbStringActorClockPacket): void {
  need(!types.isProxy(runner) && !types.isProxy(packet), "original objects required");
  need(originalPacket.call(runner, packet) === packet, "original actor collection required");
}
function sql(before: Inventory): void {
  const completion = readerCompletion(before);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "original completed SQL reader required");
  need(before.logicalSha256 === sha256Json({ schema: before.schema, properties: before.properties, tables: before.tables }),
    "original SQL inventory changed");
}
function table(before: Inventory, name: string): SqlTable {
  const tables = before.tables.filter(value => value.name === name); const selected = tables[0];
  need(tables.length === 1 && selected !== undefined && selected.rows.length <= 4096, "bounded unique SQL table required");
  return selected;
}
function text(owner: SqlTable, row: SqlRow, name: string, maximum: number): string {
  const columns = owner.columns.map((column, index) => ({ column, index })).filter(value => value.column["name"] === name);
  const index = columns[0]?.index; const cell = index === undefined ? undefined : row.cells[index];
  need(columns.length === 1 && cell?.kind === "text" && cell.hex.length <= maximum * 8, "bounded SQL TEXT required");
  const bytes = Buffer.from(cell.hex, "hex"), value = bytes.toString("utf8");
  need(value.length <= maximum && value.isWellFormed() && Buffer.from(value).equals(bytes), "exact SQL UTF8 required");
  return value;
}
function identity(before: Inventory, packet: CurrentPcbStringActorClockPacket): void {
  const branches = table(before, "branches"), projects = table(before, "projects");
  const project = projects.rows.filter(row => text(projects, row, "uuid", 64) === packet.identity.projectUuid);
  const branch = branches.rows.filter(row => text(branches, row, "uuid", 32) === packet.identity.branchUuid);
  need(project.length === 1 && branch.length === 1 && branch[0] !== undefined &&
    text(branches, branch[0], "project_uuid", 64) === packet.identity.projectUuid, "actor collection and SQL project/branch differ");
}
/** No renderer, Windows or backend callback runs here. One attempt consumes the
 * original actor packet even if later SQL checks fail. This does not turn the
 * diagnostic owner into the ordinary rename owner or establish SQL freshness. */
export function prepareCurrentPcbStringSaveProvenance(runner: CurrentPcbStringActorClockRunner,
  packet: CurrentPcbStringActorClockPacket, before: Inventory): CurrentPcbStringSaveProvenance {
  actorPacket(runner, packet);
  need(!consumed.has(packet), "original actor collection already consumed"); consumed.add(packet);
  sql(before); identity(before, packet);
  const first = packet.samples[0]; need(first?.phase === "ui", "original UI actor sample required");
  const users = table(before, "users"), uuid = first.startupActor.uuid;
  const rows = users.rows.filter(row => text(users, row, "uuid", 32) === uuid); const row = rows[0];
  need(rows.length <= 1, "original SQL actor is ambiguous");
  // APP52f51ce4 L3/PB2602357 takes names from the project users table. An absent
  // Row means empty names, not a substitution of the current UI account names.
  const backendActorCandidate = Object.freeze({ uuid,
    username: row === undefined ? "" : text(users, row, "username", 1024),
    nickname: row === undefined ? "" : text(users, row, "nickname", 1024) });
  actorPacket(runner, packet);
  const token: CurrentPcbStringSaveProvenance = freezeDeep({ profile: "private.current-pcb-string-save-provenance.v1",
    identity: packet.identity, originalActorCollectionRetained: true, originalCompletedSqlRetained: true,
    actorPacketSha256: packet.packetSha256, beforeSqlSha256: before.logicalSha256,
    workerUserText: packet.workerUserText, workerUserSha256: sha256Text(packet.workerUserText), backendActorCandidate,
    backendActorCandidateText: JSON.stringify(backendActorCandidate),
    backendActorSelection: row === undefined ? "no-original-project-user" : "one-original-project-user",
    usersTableSha256: sha256Json(users), selectedUserRowSha256: row === undefined ? null : sha256Json(row),
    originalLocalClockSampleCount: 6, localClockSamplesSha256: sha256Json(packet.samples.map(sample => sample.clock)),
    ...CURRENT_PCB_STRING_SAVE_PROVENANCE_LIMITS });
  issued.set(token, { runner, packet, before, token, tokenText: canonicalJson(token), failed: false }); return token;
}
/** Revalidates only this issuer's original String objects. It accepts neither
 * serialized tokens nor PCB/SCH rename clocks, actor plans or owner objects. */
export function requireOriginalCurrentPcbStringSaveProvenance(token: CurrentPcbStringSaveProvenance,
  runner: CurrentPcbStringActorClockRunner, packet: CurrentPcbStringActorClockPacket, before: Inventory): CurrentPcbStringSaveProvenance {
  const retained = issued.get(token);
  need(retained !== undefined && retained.runner === runner && retained.packet === packet && retained.before === before &&
    !retained.failed, "original current String provenance required");
  try {
    actorPacket(runner, packet); sql(before); identity(before, packet);
    need(canonicalJson(token) === retained.tokenText, "original provenance changed"); return token;
  } catch (error) { retained.failed = true; throw error; }
}
/** Private compositions can obtain the original inputs, not a reissued token.
 * This accessor keeps the underlying actor lifetime current at every use. */
export function currentPcbStringSaveProvenanceSource(token: CurrentPcbStringSaveProvenance): Readonly<{
  packet: CurrentPcbStringActorClockPacket; before: Inventory;
}> {
  const retained = issued.get(token); need(retained !== undefined, "original String provenance required");
  requireOriginalCurrentPcbStringSaveProvenance(token, retained.runner, retained.packet, retained.before);
  return Object.freeze({ packet: retained.packet, before: retained.before });
}
/** Joins exact DOCHEAD and EDIT_HEAD actor bytes to the history model. The
 * model's supplied Save/backend windows remain supplied data; no local Date
 * sample is substituted for them, and no Save attempt is created or refreshed. */
export function compareCurrentPcbStringSaveHistoryProvenance(token: CurrentPcbStringSaveProvenance,
  history: CurrentPcbStringHistoryProjection): Readonly<{
    profile: "private.current-pcb-string-save-history-provenance.v1";
    actorPacketSha256: string; beforeSqlSha256: string; historyChunkSha256: string;
    historyActorBytesMatchOriginalSelection: true;
  } & typeof CURRENT_PCB_STRING_SAVE_PROVENANCE_LIMITS> {
  const retained = issued.get(token); need(retained !== undefined, "original String provenance required");
  requireOriginalCurrentPcbStringSaveProvenance(token, retained.runner, retained.packet, retained.before);
  requireOriginalCurrentPcbStringHistory(history);
  need(history.targetUuid === token.identity.documentUuid && history.workerUserText === token.workerUserText &&
    history.backendActorText === token.backendActorCandidateText, "history target or exact actor bytes differ");
  return Object.freeze({ profile: "private.current-pcb-string-save-history-provenance.v1",
    actorPacketSha256: token.actorPacketSha256, beforeSqlSha256: token.beforeSqlSha256,
    historyChunkSha256: history.chunkSha256, historyActorBytesMatchOriginalSelection: true,
    ...CURRENT_PCB_STRING_SAVE_PROVENANCE_LIMITS });
}
