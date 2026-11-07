/* oxlint-disable import/max-dependencies -- The exact two-document and sole-TEXT projection joins independent initial/branch/parser/body/history source facts; it accepts no owner or callback table. */
/** Exact changed-head flow/cache projection. Structural inputs remain inert;
 * the separate issuer must supply genuine original owner/body/SQL/read refs. */
import { parseNativeRecords } from "./native-history.ts";
import type { GeneratedSchematicRelevanceDisplaySaveDelta } from "./generated-schematic-relevance-display-native-save.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { CurrentGeneratedInitialFlowCacheData } from "./current-generated-initial-flow-cache-plan.ts";
import type { CurrentGeneratedInitialBranchData } from "./current-generated-initial-branch-plan.ts";
import type { CurrentPcbViaMainLiveHistoryRows } from "./current-pcb-via-main-live-history-custody.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "./current-generated-initial-cache-source.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES } from "./current-generated-initial-sync-source.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as BRANCH_FIELDS } from "./current-generated-initial-branch-source.ts";

export interface CurrentSchematicRelevanceDisplayLiveHistoryCacheData {
  readonly schema: "private.current-schematic-relevance-display-live-history-cache-data.v1";
  readonly schematicUuid: string; readonly textId: string;
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly historyUuid: string; readonly chunkUuid: string;
  readonly namespace: string; readonly historyNum: 0 | 1; readonly mode: "append" | "mutable";
  /** Contains generated native key material. Private exact comparisons only. */
  readonly historyApiRows: readonly Readonly<Record<string, unknown>>[];
  readonly documents: readonly Readonly<{ documentUuid: string; url: string; body: string; sha256: string }>[];
  readonly headIndex: Readonly<{ url: string; body: string; sha256: string }>;
  readonly branch: Readonly<{ body: string; sha256: string; importLocalOffsetMinutes: number; nativeCurrentTimezoneVerified: false; writerClockAuthority: false }>;
  readonly historyBodySha256: string; readonly projectionSourceSha256: string;
  readonly nativeWorkerOwnershipVerified: false; readonly cacheContinuationAuthorized: false; readonly completeUploadFrontierVerified: false;
}
const fields = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time", "iv"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_LIVE_HISTORY_CACHE_DATA"); } }
function object(input: unknown): Record<string, unknown> { need(isRecord(input) && Object.getPrototypeOf(input) === Object.prototype); return input; }
function parse(text: string): unknown { need(text.isWellFormed() && Buffer.byteLength(text) <= 16_384); try { return JSON.parse(text) as unknown; } catch { throw new Error("SCHEMATIC_RELEVANCE_LIVE_HISTORY_CACHE_JSON"); } }
function clone(input: unknown): unknown { return parse(JSON.stringify(input)); }
function array(input: unknown, length: number): unknown[] { need(Array.isArray(input) && input.length === length); return input; }
function rowCore(row: Readonly<Record<string, unknown>>): Record<string, unknown> { return Object.fromEntries(fields.map(name => { need(Object.hasOwn(row, name)); return [name, row[name]]; })); }

/** Source ag copies docs before editHead/docIds; source getFlowParse creates
 * editHead first only for a genuinely new head. Preserve both JSON orders. */
export function compareCurrentSchematicRelevanceDisplayLiveHistoryCacheData(input: Readonly<{
  projectUuid: string; branchUuid: string; schematicUuid: string; delta: GeneratedSchematicRelevanceDisplaySaveDelta; clock: number; plaintext: string;
  initial: CurrentGeneratedInitialFlowCacheData; initialBranch: CurrentGeneratedInitialBranchData;
  effects: CurrentProjectHistorySqlEffects; native: CurrentPcbViaMainLiveHistoryRows;
}>): CurrentSchematicRelevanceDisplayLiveHistoryCacheData {
  const { branchUuid, clock, delta, effects, initial, initialBranch, native, plaintext, projectUuid, schematicUuid } = input;
  const { body, documentUuid, textId } = delta;
  need(initial.projectUuid === projectUuid && initial.branchUuid === branchUuid && initialBranch.projectUuid === projectUuid && initialBranch.branchUuid === branchUuid &&
    initialBranch.historyUuid === initial.historyUuid && effects.projectUuid === projectUuid && effects.branchUuid === branchUuid && native.projectUuid === projectUuid && native.branchUuid === branchUuid && native.historyUuid === effects.historyUuid &&
    initial.documents.length === 2 && new Set(initial.documents.map(row => row.documentUuid)).size === 2 && schematicUuid !== documentUuid &&
    initial.documents.some(row => row.documentUuid === schematicUuid) && initial.documents.some(row => row.documentUuid === documentUuid) && effects.initialLogicalSha256 === initial.initialLogicalSha256 && effects.bodySha256 === sha256Text(body) && effects.plaintextSha256 === sha256Text(plaintext));
  need(delta.schema === "private.generated-schematic-relevance-display-save-delta.v1" && delta.actualPendingDataMatched && delta.bodySha256 === sha256Text(body) && Number.isSafeInteger(clock) && clock > 0 && !Object.is(clock, -0));
  for (const document of initial.documents) { need(document.sha256 === sha256Text(document.body) && document.url === `https://client/dataStr/${initial.historyUuid}-${document.documentUuid}`);
    const [head, ...records] = parseNativeRecords(document.body); need(head?.header["type"] === "DOCHEAD" && head.body?.["uuid"] === document.documentUuid);
    if (document.documentUuid === schematicUuid) { need(head.body["docType"] === "SCH" && records.length === 1 && records[0]?.header["type"] === "META"); }
    else { const types = records.map(row => row.header["type"]); const ids = records.map(row => row.header["id"]);
      need(head.body["docType"] === "SCH_PAGE" && records.length === 7 && new Set(ids).size === 7 && types.filter(type => type === "TEXT").length === 1 && types.filter(type => type === "META").length === 1 && types.filter(type => type === "WIRE").length === 1 && types.filter(type => type === "BUS").length === 1 && types.filter(type => type === "LINE").length === 2 && types.filter(type => type === "ATTR").length === 1);
      const text = records.find(row => row.header["type"] === "TEXT"); const meta = records.find(row => row.header["type"] === "META"); const wire = records.find(row => row.header["type"] === "WIRE"); const bus = records.find(row => row.header["type"] === "BUS"); const attribute = records.find(row => row.header["type"] === "ATTR");
      need(text?.header["id"] === textId && meta?.body?.["schematic"] === schematicUuid && wire !== undefined && bus !== undefined && attribute?.body?.["parentId"] === wire.header["id"] && records.filter(row => row.header["type"] === "LINE" && row.body?.["lineGroup"] === wire.header["id"]).length === 1 && records.filter(row => row.header["type"] === "LINE" && row.body?.["lineGroup"] === bus.header["id"]).length === 1);
    }
  }
  need(initial.headIndex.sha256 === sha256Text(initial.headIndex.body));
  const initialRows = array(parse(initial.headIndex.body), 1); const initialHead = object(initialRows[0]);
  need(Object.keys(initialHead).length === fields.length + 4 && initialHead["uuid"] === initial.historyUuid && initialHead["id"] === 1 && initialHead["num"] === 0 && initialHead["snapshot_num"] === 0 && initialHead["parent"] === null && initialHead["is_lock"] === 0);
  const initialDocMap = Object.fromEntries(initial.documents.map(row => [row.documentUuid, 0]));
  need(canonicalJson(initialHead["docs"]) === canonicalJson([initialDocMap]) && canonicalJson(initialHead["docIds"]) === canonicalJson([initial.documents.map(row => row.documentUuid)]) && Array.isArray(initialHead["editHead"]) && initialHead["editHead"].length === 1);
  const actorText = JSON.stringify(effects.actor), prefix = `${JSON.stringify({ type: "EDIT_HEAD" })}||${actorText}|\n`;
  need(plaintext === prefix + body && !body.endsWith("|\n"));
  const raw = body.split("|\n"); need(raw.length === 2);
  const rawHead = raw[0], rawText = raw[1]; need(rawHead !== undefined && rawText !== undefined);
  const divider = rawHead.indexOf("||"); const header = object(parse(rawHead.slice(0, divider))); const document = object(parse(rawHead.slice(divider + 2)));
  need(divider > 0 && header["type"] === "DOCHEAD" && document["uuid"] === documentUuid && document["docType"] === "SCH_PAGE" && header["ticket"] === delta.headTicket && document["updateTime"] === clock && document["version"] === String(clock));
  const textDivider = rawText.indexOf("||"); const textHeader = object(parse(rawText.slice(0, textDivider))); const textBody = object(parse(rawText.slice(textDivider + 2)));
  need(textDivider > 0 && canonicalJson(textHeader) === canonicalJson({ type: "TEXT", ticket: delta.textTicket, id: textId }) && Number.isSafeInteger(delta.textTicket) && delta.textTicket > 0 && Number.isSafeInteger(delta.headTicket) && delta.headTicket > delta.textTicket && textBody["zIndex"] === delta.normalizedTextZIndex);
  const rows = native.rows.map(row => rowCore(row));
  const old = rows.find(row => row["uuid"] === initial.historyUuid); need(old !== undefined);
  const expectedOld = rowCore(initialHead); expectedOld["num"] = effects.mode === "mutable" ? 1 : 0;
  need(canonicalJson(old) === canonicalJson(expectedOld));
  if (effects.mode === "mutable") {
    need(rows.length === 1 && effects.historyUuid === initial.historyUuid && effects.keyHex === initialHead["key"] && effects.historyNum === 1 && effects.chunkUuid === `${effects.historyUuid}-1`);
  } else {
    const head = rows[0]; need(rows.length === 2 && head !== undefined && rows[1] === old && effects.historyUuid !== initial.historyUuid && effects.parentHistoryUuid === initial.historyUuid && effects.historyNum === 0 && effects.chunkUuid === effects.historyUuid);
    need(head["id"] === 2 && head["uuid"] === effects.historyUuid && head["parent"] === initial.historyUuid && head["key"] === effects.keyHex && head["is_lock"] === 0 && head["num"] === 0 && head["snapshot_num"] === 0 && head["lock_time"] === initialHead["lock_time"] && head["iv"] === effects.historyUuid);
    // Created_at/updated_at are accepted solely from the separate actual
    // Original yB/native-connection receipt, never a callback clock estimate.
  }
  const historyApiRows = rows.map(row => ({ ...row, dataStrUrl: `/api/v4/histories/dataStr?path=${projectUuid}&uuid=${String(row["uuid"])}` }));
  const index: Record<string, unknown>[] = historyApiRows.map(row => ({ ...row }));
  const older = index.find(row => row["uuid"] === initial.historyUuid); need(older !== undefined);
  older["docs"] = clone(initialHead["docs"]); older["editHead"] = clone(initialHead["editHead"]); older["docIds"] = clone(initialHead["docIds"]);
  const head = index[0]; need(head !== undefined && head["uuid"] === effects.historyUuid);
  head["editHead"] ??= []; array(head["editHead"], effects.historyNum)[effects.historyNum] = parse(actorText);
  head["docs"] ??= []; array(head["docs"], effects.historyNum)[effects.historyNum] = { [documentUuid]: 0 };
  head["docIds"] ??= []; array(head["docIds"], effects.historyNum)[effects.historyNum] = [documentUuid];
  const indexBody = JSON.stringify(index); need(Buffer.byteLength(indexBody) <= 8192);
  const branch = object(parse(initialBranch.body)); need(canonicalJson(Object.keys(branch)) === canonicalJson(BRANCH_FIELDS) && branch["history_uuid"] === initial.historyUuid && branch["project_histories_id"] === 1 && branch["uuid"] === branchUuid && branch["project_uuid"] === projectUuid);
  branch["history_uuid"] = effects.historyUuid; branch["project_histories_id"] = rows[0]?.["id"]; const branchBody = JSON.stringify(branch); need(Buffer.byteLength(branchBody) <= 4096);
  const url = `https://client/dataStr/${effects.historyUuid}${effects.historyNum === 0 ? "" : "-1"}-${documentUuid}`;
  return freezeDeep({ schema: "private.current-schematic-relevance-display-live-history-cache-data.v1", schematicUuid, textId, projectUuid, branchUuid, documentUuid, historyUuid: effects.historyUuid, chunkUuid: effects.chunkUuid, namespace: initial.namespace, historyNum: effects.historyNum, mode: effects.mode,
    historyApiRows, documents: [{ documentUuid, url, body, sha256: sha256Text(body) }], headIndex: { url: initial.headIndex.url, body: indexBody, sha256: sha256Text(indexBody) },
    branch: { body: branchBody, sha256: sha256Text(branchBody), importLocalOffsetMinutes: initialBranch.importLocalOffsetMinutes, nativeCurrentTimezoneVerified: false, writerClockAuthority: false },
    historyBodySha256: effects.bodySha256, projectionSourceSha256: sha256Json({ SOURCE, merge: CURRENT_GENERATED_INITIAL_SYNC_CALLEES.filter(callee => callee.name === "hd" || callee.name === "ag") }),
    nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false });
}
