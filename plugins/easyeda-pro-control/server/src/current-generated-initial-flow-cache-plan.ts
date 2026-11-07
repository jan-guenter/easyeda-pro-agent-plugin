/* oxlint-disable import/max-dependencies -- Three distinct genuine fixture issuers share only an inert initial cache projection. */
/** Original checkpoint-derived startup cache data. No worker, cache Promise,
 * continuation or upload frontier authority is issued by this plan. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "./current-generated-initial-cache-source.ts";
import { assertOriginalGeneratedFixtureOpenCheckpoint, verifyGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import { assertOriginalGeneratedFixtureTarget, originalGeneratedFixtureInventory } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { assertOriginalGeneratedSchematicFixtureOpenCheckpoint, verifyGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import { assertOriginalGeneratedSchematicFixtureTarget, originalGeneratedSchematicFixtureInventory } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint, verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureTarget, originalGeneratedSchematicRelevanceFixtureInventory } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";

export type CurrentGeneratedInitialFlowCachePrepared = GeneratedFixtureOpenCheckpoint | GeneratedSchematicFixtureOpenCheckpoint | GeneratedSchematicRelevanceFixtureOpenCheckpoint;
export interface CurrentGeneratedInitialFlowCachePlan { readonly profile: "private.current-generated-initial-flow-cache-plan.v1" }
export interface CurrentGeneratedInitialFlowCacheData {
  readonly projectUuid: string; readonly branchUuid: string; readonly historyUuid: string; readonly namespace: string;
  readonly initialSourceSha256: string; readonly initialLogicalSha256: string; readonly projectionSourceSha256: string;
  readonly documents: readonly Readonly<{ documentUuid: string; url: string; body: string; sha256: string }>[];
  /** Contains generated native key material. Private comparisons only; never
   * print, journal or include this body in public result/error packets. */
  readonly headIndex: Readonly<{ url: string; body: string; sha256: string }>;
  readonly nativeWorkerOwnershipVerified: false; readonly cacheContinuationAuthorized: false; readonly completeUploadFrontierVerified: false;
}
type Qualification = QualifiedGeneratedFixtureTarget | QualifiedGeneratedSchematicFixtureTarget | QualifiedGeneratedSchematicRelevanceFixtureTarget;
type Scalar = string | number | null;
interface Original { readonly prepared: CurrentGeneratedInitialFlowCachePrepared; readonly inventory: NativeSqlInventory; readonly data: CurrentGeneratedInitialFlowCacheData; readonly text: string }
const issued = new WeakMap<CurrentGeneratedInitialFlowCachePlan, Original>();
const pending = new WeakMap<CurrentGeneratedInitialFlowCachePrepared, Promise<CurrentGeneratedInitialFlowCachePlan>>();
const fields = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_INITIAL_FLOW_CACHE_PLAN"); } }
function assertPrepared(prepared: CurrentGeneratedInitialFlowCachePrepared): void {
  need(prepared !== null && typeof prepared === "object" && !types.isProxy(prepared));
  const descriptor = Object.getOwnPropertyDescriptor(prepared, "profile"); need(descriptor !== undefined && Object.hasOwn(descriptor, "value"));
  need(descriptor.value === prepared.profile);
  if (prepared.profile === "easyeda-pro-control.generated-fixture-open-checkpoint.v1") { assertOriginalGeneratedFixtureOpenCheckpoint(prepared); }
  else if (prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1") { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); }
  else { assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared); }
}
function inventoryFor(qualification: Qualification): NativeSqlInventory {
  if (qualification.schema === "easyeda-pro-control.qualified-generated-fixture-target.v1") { assertOriginalGeneratedFixtureTarget(qualification); return originalGeneratedFixtureInventory(qualification); }
  if (qualification.schema === "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1") { assertOriginalGeneratedSchematicRelevanceFixtureTarget(qualification); return originalGeneratedSchematicRelevanceFixtureInventory(qualification); }
  assertOriginalGeneratedSchematicFixtureTarget(qualification); return originalGeneratedSchematicFixtureInventory(qualification);
}
function scalar(cell: SqlCell | undefined): Scalar {
  need(cell !== undefined); if (cell.kind === "null") { return null; }
  if (cell.kind === "integer") { const value = Number(cell.decimal); need(Number.isSafeInteger(value) && String(value) === cell.decimal); return value; }
  need(cell.kind === "text"); const bytes = Buffer.from(cell.hex, "hex"), text = bytes.toString("utf8"); need(Buffer.from(text).equals(bytes)); return text;
}
function sole(table: SqlTable | undefined): Readonly<Record<string, Scalar>> {
  need(table !== undefined && table.rows.length === 1); const row = table.rows[0]; need(row !== undefined && row.rowid !== null && scalar(row.rowid) === 1);
  const names = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; });
  need(new Set(names).size === names.length && row.cells.length === names.length);
  return Object.fromEntries(names.map((name, index) => [name, scalar(row.cells[index])]));
}
function string(value: unknown): string { need(typeof value === "string"); return value; }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function jsonRecord(raw: string): Record<string, unknown> { const value: unknown = JSON.parse(raw); need(record(value)); return value; }

/** Pure initial projection, kept private to the original issuer. Raw cache
 * document strings preserve input bytes; source parser mutations affect only
 * its history-index metadata, never serializer-normalized document contents. */
async function deriveInitialFlowCacheData(qualification: Qualification, history: NativeHistorySnapshot): Promise<Readonly<{ inventory: NativeSqlInventory; data: CurrentGeneratedInitialFlowCacheData }>> {
  const inventory = inventoryFor(qualification); readerCompletion(inventory);
  const current = (): void => { need(inventoryFor(qualification) === inventory && inventory.checkpointSha256 === qualification.target.expectedSourceSha256 && history.headHistoryUuid.length === 32); readerCompletion(inventory); };
  current(); const tableMap = new Map(inventory.tables.map(table => [table.name, table])); need(tableMap.size === inventory.tables.length);
  const cipher = sole(tableMap.get("history_data")), head = sole(tableMap.get(`project_history_${qualification.target.branchUuid}`));
  const historyUuid = string(head["uuid"]), key = string(head["key"]);
  need(historyUuid === history.headHistoryUuid && history.branchUuid === qualification.target.branchUuid && history.projectUuid === qualification.target.projectUuid &&
    history.historyRowCount === 1 && history.chunkCount === 1 && head["num"] === 0 && head["snapshot"] === null && head["snapshot_num"] === 0 && cipher["uuid"] === historyUuid && cipher["history_uuid"] === historyUuid);
  const plaintext = await decodeNativeHistoryChunk({ historyUuid, keyHex: key, dataBase64: string(cipher["dataStr"]) }); current();
  need(plaintext.isWellFormed() && Buffer.byteLength(plaintext) <= 16_384 && sha256Text(plaintext) === qualification.sourceSha256 && plaintext.endsWith("|\n"));
  const rows = plaintext.slice(0, -2).split("|\n"); const editHead = rows.shift(); need(editHead !== undefined);
  const boundary = editHead.indexOf("||"); need(editHead.slice(0, boundary) === '{"type":"EDIT_HEAD"}'); const actor = jsonRecord(editHead.slice(boundary + 2));
  const groups: { documentUuid: string; type: string; lines: string[] }[] = [];
  for (const raw of rows) {
    const at = raw.indexOf("||"); need(at > 0); const header = jsonRecord(raw.slice(0, at));
    if (header["type"] === "DOCHEAD") {
      const body = jsonRecord(raw.slice(at + 2)), documentUuid = string(body["uuid"]), type = string(body["docType"]);
      need(Object.keys(header).length === 1 && /^[a-f\d]{32}$/u.test(documentUuid) && ["PCB", "SCH", "SCH_PAGE"].includes(type) && !groups.some(value => value.documentUuid === documentUuid));
      groups.push({ documentUuid, type, lines: [raw] });
    } else { const group = groups.at(-1); need(group !== undefined); group.lines.push(raw); }
  }
  need(groups.length > 0 && groups.length <= 2 && canonicalJson(groups.map(group => ({ uuid: group.documentUuid, type: group.type }))) ===
    canonicalJson(history.documents.map(document => ({ uuid: document.uuid, type: document.docType }))));
  const documents = groups.map(group => { const body = group.lines.join("|\n"); need(group.lines.length > 1 && Buffer.byteLength(body) <= 8192);
    return Object.freeze({ documentUuid: group.documentUuid, url: `https://client/dataStr/${historyUuid}-${group.documentUuid}`, body, sha256: sha256Text(body) }); });
  // The original yB projection order excludes snapshot; mB then appends dataStrUrl.
  const apiRow: Record<string, unknown> = Object.fromEntries(fields.map(name => { const value = head[name]; need(value !== undefined); return [name, value]; }));
  apiRow["iv"] = historyUuid; apiRow["dataStrUrl"] = `/api/v4/histories/dataStr?path=${qualification.target.projectUuid}&uuid=${historyUuid}`;
  apiRow["editHead"] = [actor]; apiRow["docs"] = [Object.fromEntries(groups.map(group => [group.documentUuid, 0]))]; apiRow["docIds"] = [groups.map(group => group.documentUuid)];
  const body = JSON.stringify([apiRow]); need(Buffer.byteLength(body) <= 8192);
  const data: CurrentGeneratedInitialFlowCacheData = freezeDeep({ projectUuid: qualification.target.projectUuid, branchUuid: qualification.target.branchUuid, historyUuid,
    namespace: `project_${qualification.target.projectUuid}_v6`, initialSourceSha256: qualification.sourceSha256, initialLogicalSha256: inventory.logicalSha256,
    projectionSourceSha256: sha256Text(canonicalJson(SOURCE)), documents, headIndex: { url: `https://client/index/v1/${qualification.target.branchUuid}`, body, sha256: sha256Text(body) },
    nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false }); current(); return Object.freeze({ inventory, data });
}

/** Pre-opening only. Genuine checkpoint/source verification brackets the
 * decrypt/projection. A repeated call retains the same original Promise. */
export function prepareCurrentGeneratedInitialFlowCachePlan(prepared: CurrentGeneratedInitialFlowCachePrepared): Promise<CurrentGeneratedInitialFlowCachePlan> {
  assertPrepared(prepared); const previous = pending.get(prepared); if (previous !== undefined) { return previous; }
  const promise = (async (): Promise<CurrentGeneratedInitialFlowCachePlan> => {
    const verify = async (): Promise<void> => { assertPrepared(prepared);
      if (prepared.profile === "easyeda-pro-control.generated-fixture-open-checkpoint.v1") { await verifyGeneratedFixtureOpenCheckpoint(prepared); }
      else if (prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1") { await verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); }
      else { await verifyGeneratedSchematicFixtureOpenCheckpoint(prepared); } assertPrepared(prepared); };
    await verify(); const result = await deriveInitialFlowCacheData(prepared.qualification, prepared.history); assertPrepared(prepared); await verify();
    need(inventoryFor(prepared.qualification) === result.inventory);
    const plan: CurrentGeneratedInitialFlowCachePlan = Object.freeze({ profile: "private.current-generated-initial-flow-cache-plan.v1" });
    issued.set(plan, Object.freeze({ prepared, inventory: result.inventory, data: result.data, text: canonicalJson(result.data) })); return plan;
  })(); pending.set(prepared, promise); return promise;
}
/** Historical private data lookup after opening. This never reads or accepts
 * a changed live source, grants a native continuation or prints key material. */
export function requireOriginalCurrentGeneratedInitialFlowCachePlan(plan: CurrentGeneratedInitialFlowCachePlan, prepared: CurrentGeneratedInitialFlowCachePrepared): CurrentGeneratedInitialFlowCacheData {
  assertPrepared(prepared); const original = issued.get(plan);
  need(original !== undefined && original.prepared === prepared && inventoryFor(prepared.qualification) === original.inventory && original.text === canonicalJson(original.data));
  readerCompletion(original.inventory); return original.data;
}
