/** Internal comparison policy, not an actor observer or lifecycle authority.
 * UI selections and clock bounds are supplied evidence. The original SQL
 * reader objects prove completed reads, not source ownership or process exit.
 */
import { canonicalJson, sha256Json } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { ACTOR_NAME_MAX_CODE_UNITS, validateActorProjection } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";
import { decodeRawHistoryForOriginalCurrentSymbolSqlPlan, metadataPlanForOriginalCurrentSymbolSqlPlan, prepareCurrentSymbolNewHeadSqlPlan, verifyCurrentSymbolNewHeadSqlEffect } from "./symbol-sql-comparator.ts";
import type { CurrentSymbolNewHeadSqlPlan, CurrentSymbolSqlWitness } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type ComparisonBounds = Omit<CurrentSymbolSqlWitness, "backendActorUuid">;
const LIMITATIONS = Object.freeze({ uiSelectionProvenanceVerified: false, sourceOwnershipVerified: false,
  sourceFreshnessVerified: false, backendActorPreverified: false, futureRequestActorVerified: false,
  backendClockVerified: false, producerBindingVerified: false, generationClosureVerified: false,
  persistentUploadReplayExcluded: false, reopened: false, writerReady: false, executionAuthorized: false } as const);

export interface CurrentSymbolTransactionActorInput {
  readonly before: Inventory;
  readonly operation: unknown;
  readonly startupActor: unknown;
  readonly cachedActor: unknown;
  readonly bounds: ComparisonBounds;
}
export interface CurrentSymbolTransactionActorPlan extends Readonly<typeof LIMITATIONS> {
  readonly profile: "easyeda-pro-control.current-symbol-transaction-actor-plan.v1";
  readonly selectionPolicy: "supplied-agreeing-ui-and-single-original-project-user";
  readonly expectedActorUuid: string;
  readonly selectionSha256: string;
  readonly selectedProjectUserRowSha256: string;
  readonly beforeSqlSha256: string;
  readonly targetUuid: string;
  readonly expectedTicket: number;
}
interface SelectedActor {
  readonly startupActor: ActorProjection;
  readonly cachedActor: ActorProjection;
  readonly projectActor: ActorProjection;
  readonly selectedProjectUserRowSha256: string;
}
interface Prepared {
  readonly selected: SelectedActor;
  readonly sqlPlan: CurrentSymbolNewHeadSqlPlan;
}
const preparations = new WeakMap<CurrentSymbolTransactionActorPlan, Prepared>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }

function ownDataFields(value: unknown, required: readonly string[], optional: readonly string[] = []): void {
  need(value !== null && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "Actor selection input must be a plain data object.");
  const keys = Reflect.ownKeys(value);
  need(keys.every((key) => typeof key === "string" && (required.includes(key) || optional.includes(key))) &&
    required.every((key) => keys.includes(key)), "Actor selection input fields differ.");
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "Actor selection accessors are not accepted.");
  }
}

function textCell(table: SqlTable, row: SqlRow, column: string, maximum: number): string {
  const index = table.columns.findIndex((value) => value["name"] === column);
  const cell: SqlCell | undefined = row.cells[index];
  need(index !== -1 && cell?.kind === "text" && cell.hex.length <= maximum * 8, "Selected project actor requires bounded SQL TEXT.");
  const bytes = Buffer.from(cell.hex, "hex"), text = bytes.toString("utf8");
  need(text.length <= maximum && Buffer.from(text).equals(bytes), "Selected project actor text is not exact bounded UTF8.");
  return text;
}

function projectActor(before: Inventory, uuid: string): Readonly<{ actor: ActorProjection; rowSha256: string }> {
  const completion = readerCompletion(before);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "Actor selection requires an original completed SQL inventory.");
  const tables = before.tables.filter((table) => table.name === "users"), users = tables[0];
  need(tables.length === 1 && users !== undefined && users.rows.length <= 4096, "Project users table is missing, ambiguous or exceeds its bound.");
  const rows = users.rows.filter((row) => textCell(users, row, "uuid", 32) === uuid);
  const row = rows[0];
  need(rows.length === 1 && row !== undefined, "Actor selection requires exactly one original project user.");
  const actor = validateActorProjection({ uuid, username: textCell(users, row, "username", ACTOR_NAME_MAX_CODE_UNITS),
    nickname: textCell(users, row, "nickname", ACTOR_NAME_MAX_CODE_UNITS) });
  return Object.freeze({ actor, rowSha256: sha256Json(row) });
}

/** Preparation consumes no after data. The public projection is frozen
 * and only its original identity can reach the retained exact SQL plan.
 * This function does not observe UI caches, capture a session, check a clock
 * or establish when the caller collected its supplied snapshots.
 */
export async function prepareCurrentSymbolTransactionActor(input: CurrentSymbolTransactionActorInput): Promise<CurrentSymbolTransactionActorPlan> {
  ownDataFields(input, ["before", "operation", "startupActor", "cachedActor", "bounds"]);
  const cachedActor = validateActorProjection(input.cachedActor), startupActor = validateActorProjection(input.startupActor);
  need(canonicalJson(startupActor) === canonicalJson(cachedActor), "Supplied UI actor projections do not agree.");
  ownDataFields(input.bounds, ["projectUuid", "branchUuid", "client", "preDispatchMaxTicket", "documentClockMinMs", "documentClockMaxMs",
    "backendClockMinMs", "backendClockMaxMs", "backendLocalOffsetMinutes"], ["agedHead"]);
  if (input.bounds.agedHead !== undefined) {
    ownDataFields(input.bounds.agedHead, ["createdAtLiteral", "nativeParsedLocalMs", "nativeTimezoneOffsetMinutes"]);
  }
  const bounds = structuredClone(input.bounds), selectedProject = projectActor(input.before, startupActor.uuid);
  // Project names come from the original SQL row, never from the UI caches.
  const selected: SelectedActor = Object.freeze({ startupActor, cachedActor, projectActor: selectedProject.actor,
    selectedProjectUserRowSha256: selectedProject.rowSha256 });
  const sqlPlan = await prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: input.operation,
    witness: { ...bounds, backendActorUuid: selected.startupActor.uuid } });
  const plan: CurrentSymbolTransactionActorPlan = Object.freeze({
    profile: "easyeda-pro-control.current-symbol-transaction-actor-plan.v1", selectionPolicy: "supplied-agreeing-ui-and-single-original-project-user",
    expectedActorUuid: selected.startupActor.uuid, selectionSha256: sha256Json(selected), selectedProjectUserRowSha256: selected.selectedProjectUserRowSha256,
    beforeSqlSha256: sqlPlan.beforeSqlSha256, targetUuid: sqlPlan.targetUuid, expectedTicket: sqlPlan.expectedTicket, ...LIMITATIONS,
  });
  preparations.set(plan, Object.freeze({ selected, sqlPlan }));
  return plan;
}

/** The success flag comes only from this call's complete maintained comparison.
 * It is an exact attribution postcondition for these supplied snapshots, not
 * proof of a dispatched transaction, original closure or future account use.
 */
export async function verifyCurrentSymbolTransactionActor(plan: CurrentSymbolTransactionActorPlan, after: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const prepared = preparations.get(plan);
  need(prepared !== undefined, "Actor comparison requires its original prepared plan.");
  const fullSqlEffect = await verifyCurrentSymbolNewHeadSqlEffect(prepared.sqlPlan, after);
  return Object.freeze({ profile: "easyeda-pro-control.current-symbol-transaction-actor-effect.v1",
    selectionPolicy: plan.selectionPolicy, expectedActorUuid: prepared.selected.startupActor.uuid,
    selectionSha256: plan.selectionSha256, selectedProjectUserRowSha256: plan.selectedProjectUserRowSha256,
    beforeSqlSha256: plan.beforeSqlSha256, afterSqlSha256: after.logicalSha256, targetUuid: plan.targetUuid,
    transactionActorMatchesExpected: true, fullSqlEffect, ...LIMITATIONS });
}

/** Original data relation only. The enclosing completed clock owner binds the
 * inventory to its successful closed effect before this decoder is reachable.
 */
export async function decodeCurrentSymbolTransactionActorHistory(plan: CurrentSymbolTransactionActorPlan, after: Inventory): Promise<Readonly<{
  decoded: Awaited<ReturnType<typeof decodeRawHistoryForOriginalCurrentSymbolSqlPlan>>;
  metadataPlan: ReturnType<typeof metadataPlanForOriginalCurrentSymbolSqlPlan>;
  expectedActor: ActorProjection; expectedTicket: number; expectedDocumentEditVersion: "3.2.206";
}>> {
  const prepared = preparations.get(plan);
  need(prepared !== undefined, "Actor history requires its original prepared plan.");
  const decoded = await decodeRawHistoryForOriginalCurrentSymbolSqlPlan(prepared.sqlPlan, after);
  need(preparations.get(plan) === prepared, "Actor history preparation changed.");
  return Object.freeze({ decoded, metadataPlan: metadataPlanForOriginalCurrentSymbolSqlPlan(prepared.sqlPlan),
    expectedActor: prepared.selected.startupActor, expectedTicket: prepared.sqlPlan.expectedTicket,
    expectedDocumentEditVersion: prepared.sqlPlan.expectedDocumentEditVersion });
}
