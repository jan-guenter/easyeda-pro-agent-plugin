/** Pure native DELETE append relation over complete original SQLite readers.
 * Supplied effects and this comparison issue no owner or persistence token. */
/* oxlint-disable import/max-dependencies -- Bind the native append baseline, genuine v1/v2 body bytes, complete reader/schema and independent crypto relation together. */
import { z } from "zod";
import { types } from "node:util";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import { decodeNativeHistoryChunk, isNativeDocumentDeleted } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";

import { deriveCurrentFootprintInverseNativeDeleteMainBaseline } from "./current-footprint-inverse-native-delete-main-baseline.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";
import { verifyCurrentFootprintDeleteWorkerUpload } from "./current-footprint-delete-plan.ts";
import type { CurrentFootprintDeletePlan } from "./current-footprint-delete-plan.ts";
import { verifyCurrentFootprintDeleteObservedUpload } from "./current-footprint-delete-observed-plan.ts";
import type { CurrentFootprintDeleteObservedPlan } from "./current-footprint-delete-observed-plan.ts";

type BodyPlan = CurrentFootprintDeletePlan | CurrentFootprintDeleteObservedPlan;
type Value = string | number | null; type Fields = Readonly<Record<string, Value>>;
const uuid = z.string().regex(/^[a-f\d]{32}$(?![\s\S])/u); const hash = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u); const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const time = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$(?![\s\S])/u);
const nativeCallback = z.strictObject({ slot: z.enum(["data","head","branch","commit","project"]), changes: integer, lastID: integer, beforeEpochMs: integer.positive(), afterEpochMs: integer.positive() }).refine(value => value.afterEpochMs >= value.beforeEpochMs && value.afterEpochMs-value.beforeEpochMs<=120_000);
const historySchema = z.strictObject({ schema:z.literal("private.current-project-history-sql-effects.v1"), projectUuid:z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$(?![\s\S])/u), branchUuid:uuid, initialLogicalSha256:hash,
  mode:z.literal("append"),historyUuid:uuid,parentHistoryUuid:uuid,keyHex:uuid,chunkUuid:z.string().regex(/^[a-f\d]{32}(?:-1)?$(?![\s\S])/u),dataBase64Parts:z.array(z.string().max(8192)).min(1).max(8),
  plaintextSha256:hash,bodySha256:hash,historyNum:z.union([z.literal(0),z.literal(1)]),actor:z.strictObject({uuid,username:z.string().max(1024),nickname:z.string().max(1024),updateTime:integer.positive()}),
  projectUpdatedAt:time,projectModifierUuid:uuid,nativeCallbacks:z.array(nativeCallback).length(5),originalServiceAwaitCompleted:z.literal(true),selectedSqlStillFenced:z.literal(true) });
export interface CurrentFootprintInverseNativeDeleteClosedSqlDelta {
  readonly schema: "private.current-footprint-inverse-native-delete-closed-sql-delta.v1";
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly beforeLogicalSha256: string;
  readonly afterLogicalSha256: string;
  readonly historyUuid: string;
  readonly chunkUuid: string;
  readonly bodySha256: string;
  readonly targetUuid: string;
  readonly maximumTicket: number;
  readonly retainedDocuments: number;
  readonly visibleDocuments: number;
  readonly visibleRosterSha256: string;
  readonly targetSemanticSha256: string;
  readonly allPeerDocumentsUnchanged: true;
  readonly targetHistoricalRecordsRetained: true;
  readonly dataRowid: number;
  readonly headRowid: number;
  readonly preservedHeadCount: number;
  readonly completeSqlVerified: true;
  readonly allOtherRowsSchemaAndPropertiesUnchanged: true;
  readonly structureRequests: 0;
  readonly explicitSaveAttempts: 0;
  readonly suppliedObservationsOnly: true;
  readonly persistenceVerified: false;
  readonly reopenedVerified: false;
  readonly executionAuthorized: false;
}
function need(value:boolean,reason:string):asserts value {if(!value){throw new Error(`FOOTPRINT_INVERSE_NATIVE_DELETE_CLOSED_SQL_${reason}`);}}
function historyInput(input:CurrentProjectHistorySqlEffects):z.infer<typeof historySchema> & Readonly<{dataBase64:string}> {
  need(input!==null&&typeof input==="object"&&!types.isProxy(input)&&Object.getPrototypeOf(input)===Object.prototype,"OBSERVATION_DATA");
  const keys=Reflect.ownKeys(input); const expected=Object.keys(historySchema.shape).map(key=>key==="dataBase64Parts"?"dataBase64":key);
  need(keys.length===expected.length&&keys.every(key=>typeof key==="string"&&expected.includes(key)),"OBSERVATION_KEYS");
  const captured:Record<string,unknown>={};for(const key of Reflect.ownKeys(input)){need(typeof key==="string","OBSERVATION_KEYS");
  const property=Object.getOwnPropertyDescriptor(input,key);
  need(property!==undefined&&Object.hasOwn(property,"value")&&property.enumerable===true,"OBSERVATION_DESCRIPTOR");if(key==="dataBase64"){const value:unknown=property.value;
  need(typeof value==="string"&&value.length>0&&value.length<=65_536&&value.isWellFormed(),"CIPHER_BOUND");captured["dataBase64Parts"]=Array.from({length:Math.ceil(value.length/8192)},(_,index)=>value.slice(index*8192,(index+1)*8192));}else{captured[key]=property.value as unknown;}}
  const parsed=historySchema.parse(captureCurrentPcbStringClockReply(captured).value);
  const dataBase64=parsed.dataBase64Parts.join("");
  need(Buffer.from(dataBase64,"base64").toString("base64")===dataBase64,"CANONICAL_CIPHER");return Object.freeze({...parsed,dataBase64});
}
function decode(cell:SqlCell|null|undefined):Value {need(cell!==undefined&&cell!==null,"CELL");if(cell.kind==="null"){return null;}if(cell.kind==="integer"){const value=Number(cell.decimal);
  need(Number.isSafeInteger(value)&&String(value)===cell.decimal,"INTEGER");return value;}need(cell.kind==="text","CELL_KIND");
  const bytes=Buffer.from(cell.hex,"hex");
  const value=bytes.toString("utf8");
  need(Buffer.from(value,"utf8").equals(bytes),"utf8");return value;}
function encode(value:Value):SqlCell {if(value===null){return {kind:"null"};}if(typeof value==="number"){need(Number.isSafeInteger(value)&&!Object.is(value,-0),"ENCODE_INTEGER");return {kind:"integer",decimal:String(value)};}return {kind:"text",hex:Buffer.from(value,"utf8").toString("hex")};}
function columns(table:SqlTable):readonly string[]{const result=table.columns.map(column=>{need(typeof column["name"]==="string","COLUMN");return column["name"];});
  need(new Set(result).size===result.length&&!table.withoutRowid,"COLUMN_ROSTER");return result;}
function fields(table:SqlTable,original:SqlRow):Fields {const names=columns(table);
  need(original.cells.length===names.length,"ROW_COVERAGE");return Object.fromEntries(names.map((name,index)=>[name,decode(original.cells[index])]));}
function row(table:SqlTable,id:number,value:Fields):SqlRow {const names=columns(table);
  need(Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name)),"COMPLETE_PROJECTED_ROW");return {rowid:encode(id),cells:names.map(name=>{const field=value[name];
  need(field!==undefined,"PROJECTED_CELL");return encode(field);})};}
function sole(table:SqlTable):Readonly<{original:SqlRow;value:Fields}>{need(table.rows.length===1&&table.rows[0]!==undefined,"SOLE_ROW");
  const original=table.rows[0];return {original,value:fields(table,original)};}
function literal(value:Value|undefined):string {need(typeof value==="string","TEXT");return value;}
function utc(value:Value|undefined):number {const text=time.parse(value);
  const number=Date.parse(`${text.replace(" ","T")}Z`);
  need(Number.isFinite(number)&&new Date(number).toISOString().slice(0,19).replace("T"," ")===text,"CALENDAR");return number;}
function defaults(value:Fields,window:z.infer<typeof nativeCallback>):void {const created=utc(value["created_at"]);
  need(value["created_at"]===value["updated_at"]&&created>=Math.floor(window.beforeEpochMs/1000)*1000&&created<=Math.floor(window.afterEpochMs/1000)*1000,"NATIVE_UTC_DEFAULTS");}
function ordered(values:readonly SqlRow[]):readonly string[]{return values.map(value=>canonicalJson(value)).toSorted();}
function compareRows(table:SqlTable,actual:SqlTable,expected:readonly SqlRow[]):void {need(canonicalJson(ordered(actual.rows))===canonicalJson(ordered(expected)),`ROWS_${table.name}`);}
/** A complete native append with all prior heads/data preserved. Its original
 * Main/renderer custody, original termination and helper release are separate. */
export async function compareCurrentFootprintInverseNativeDeleteClosedSqlDelta(
  before: NativeSqlInventory, after: NativeSqlInventory,
  originalHistory: CurrentFootprintInverseMainHistoryBaseline, bodyPlan: BodyPlan,
  effects: CurrentProjectHistorySqlEffects,
): Promise<CurrentFootprintInverseNativeDeleteClosedSqlDelta> {
  readerCompletion(before); readerCompletion(after);
  need(bodyPlan !== null && typeof bodyPlan === "object" && !types.isProxy(bodyPlan), "BODY_PLAN");
  const profile = Object.getOwnPropertyDescriptor(bodyPlan, "profile");
  const upload = Object.getOwnPropertyDescriptor(bodyPlan, "workerUpload");
  need(profile !== undefined && Object.hasOwn(profile, "value") && upload !== undefined && Object.hasOwn(upload, "value") && typeof upload.value === "string", "BODY_PLAN");
  if (profile.value === "private.current-footprint-delete-plan.v2") {
    need(bodyPlan.profile === "private.current-footprint-delete-plan.v2", "BODY_PROFILE");
    verifyCurrentFootprintDeleteObservedUpload(bodyPlan, upload.value);
  } else {
    need(profile.value === "private.current-footprint-delete-plan.v1" && bodyPlan.profile === "private.current-footprint-delete-plan.v1", "BODY_PROFILE");
    verifyCurrentFootprintDeleteWorkerUpload(bodyPlan, upload.value);
  }
  const baseline = deriveCurrentFootprintInverseNativeDeleteMainBaseline(before, originalHistory, bodyPlan);
  const history = historyInput(effects);
  need(baseline.headCount <= 7 && history.projectUuid === baseline.projectUuid && history.branchUuid === baseline.branchUuid &&
    history.initialLogicalSha256 === before.logicalSha256 && history.parentHistoryUuid === baseline.head.uuid &&
    history.bodySha256 === bodyPlan.workerUploadSha256 && history.historyUuid !== history.parentHistoryUuid &&
    history.chunkUuid === history.historyUuid && history.historyNum === 0 &&
    Buffer.from(history.dataBase64, "base64").length <= baseline.maximumCiphertextBytes, "SCOPE");
  const schema = nativeProjectSymbolSqlSchema(history.branchUuid).entries;
  need(canonicalJson(before.schema) === canonicalJson(schema) && before.schemaSha256 === sha256Json(schema) &&
    after.schemaSha256 === before.schemaSha256 && canonicalJson(after.schema) === canonicalJson(before.schema) &&
    canonicalJson(after.properties) === canonicalJson(before.properties), "SCHEMA_PROPERTIES");
  const tables = new Map(before.tables.map(table => [table.name, table]));
  const following = new Map(after.tables.map(table => [table.name, table]));
  need(tables.size === before.tables.length && following.size === after.tables.length &&
    canonicalJson([...tables.keys()]) === canonicalJson([...following.keys()]), "TABLE_ROSTER");
  const get = (name: string): Readonly<{ old: SqlTable; next: SqlTable }> => {
    const old = tables.get(name);
    const next = following.get(name);
    need(old !== undefined && next !== undefined && canonicalJson({ ...old, rows: [], sha256: "" }) === canonicalJson({ ...next, rows: [], sha256: "" }), "TABLE_SHAPE");
    return { old, next };
  };
  const name = `project_history_${history.branchUuid}`;
  const allowed = new Set(["history_data", name, "branches", "projects", "sqlite_sequence"]);
  for (const table of before.tables) {
    if (!allowed.has(table.name)) { need(canonicalJson(table) === canonicalJson(following.get(table.name)), `UNCHANGED_${table.name}`); }
  }
  for (const fresh of [history.historyUuid, history.keyHex]) {
    const encoded = Buffer.from(fresh, "utf8").toString("hex");
    need(!before.tables.some(table => table.rows.some(original => original.cells.some(cell => cell.kind === "text" && cell.hex === encoded))), "FRESH_APPEND_IDENTITIES");
  }
  const callbacks = history.nativeCallbacks;
  for (const [index, slot] of (["data", "head", "branch", "commit", "project"] as const).entries()) {
    const callback = callbacks[index];
    need(callback !== undefined && callback.slot === slot && (slot === "commit" || callback.changes === 1) &&
      (index === 0 || callback.beforeEpochMs >= (callbacks[index - 1]?.afterEpochMs ?? Infinity)), "NATIVE_CALLBACKS");
  }
  const dataWindow = callbacks[0], headWindow = callbacks[1];
  need(dataWindow !== undefined && headWindow !== undefined && dataWindow.lastID === baseline.dataLastId &&
    headWindow.lastID === baseline.headLastId, "NATIVE_INSERT_IDS");
  const headTable = get(name);
  const added = headTable.next.rows.find(original => decode(original.rowid) === baseline.headLastId);
  need(added !== undefined, "HEAD_ROWID");
  const current = fields(headTable.next, added); defaults(current, headWindow);
  // Exact append SQL supplies only uuid/parent/snapshot/key. These remaining
  // Fields are the pinned schema defaults, regardless of the previous head.
  compareRows(headTable.old, headTable.next, [...headTable.old.rows, row(headTable.old, baseline.headLastId, {
    id: baseline.headLastId, uuid: history.historyUuid, parent: history.parentHistoryUuid,
    snapshot: null, key: history.keyHex, is_lock: 0, num: 0, snapshot_num: 0,
    lock_time: "1970-01-01 08:00:00", created_at: literal(current["created_at"]), updated_at: literal(current["updated_at"]),
  })]);
  const data = get("history_data");
  const addedData = data.next.rows.find(original => decode(original.rowid) === baseline.dataLastId);
  need(addedData !== undefined, "DATA_ROWID");
  const addedFields = fields(data.next, addedData); defaults(addedFields, dataWindow);
  compareRows(data.old, data.next, [...data.old.rows, row(data.old, baseline.dataLastId, {
    id: baseline.dataLastId, uuid: history.chunkUuid, history_uuid: history.historyUuid, dataStr: history.dataBase64,
    created_at: literal(addedFields["created_at"]), updated_at: literal(addedFields["updated_at"]),
  })]);
  const branches = get("branches"); let selected = 0;
  const branchRows = branches.old.rows.map(original => {
    const value = fields(branches.old, original);
    if (value["uuid"] !== history.branchUuid) { return original; }
    selected += 1;
    need(value["project_uuid"] === history.projectUuid && value["history_uuid"] === history.parentHistoryUuid &&
      value["node"] === 0 && value["delete_status"] === 0, "SELECTED_BRANCH");
    const id = decode(original.rowid); need(typeof id === "number", "BRANCH_ROWID");
    return row(branches.old, id, { ...value, history_uuid: history.historyUuid });
  });
  need(selected === 1, "SOLE_SELECTED_BRANCH"); compareRows(branches.old, branches.next, branchRows);
  const projects = get("projects");
  const project = sole(projects.old);
  need(project.value["uuid"] === history.projectUuid && history.projectModifierUuid === history.actor.uuid, "PROJECT_ACTOR");
  utc(history.projectUpdatedAt);
  const projectId = decode(project.original.rowid); need(typeof projectId === "number", "PROJECT_ROWID");
  compareRows(projects.old, projects.next, [row(projects.old, projectId, { ...project.value, updated_at: history.projectUpdatedAt, modifier_uuid: history.projectModifierUuid })]);
  const sequence = get("sqlite_sequence"); let sequences = 0;
  const sequenceRows = sequence.old.rows.map(original => {
    const value = fields(sequence.old, original);
    if (value["name"] !== "history_data") { return original; }
    sequences += 1; need(value["seq"] === baseline.dataLastId - 1, "DATA_SEQUENCE");
    const id = decode(original.rowid); need(typeof id === "number", "SEQUENCE_ROWID");
    return row(sequence.old, id, { ...value, seq: baseline.dataLastId });
  });
  need(sequences === 1, "SOLE_DATA_SEQUENCE"); compareRows(sequence.old, sequence.next, sequenceRows);
  const plaintext = await decodeNativeHistoryChunk({ historyUuid: history.historyUuid, keyHex: history.keyHex, dataBase64: history.dataBase64 });
  need(sha256Text(plaintext) === history.plaintextSha256 && Buffer.byteLength(plaintext) <= baseline.maximumPlaintextBytes &&
    plaintext === `{"type":"EDIT_HEAD"}||${JSON.stringify(history.actor)}|\n${bodyPlan.workerUpload}`, "EXACT_NATIVE_PLAINTEXT");
  const identity = { projectUuid: history.projectUuid, branchUuid: history.branchUuid };
  const prior = await decodeCurrentFootprintSourceHistory(before, identity);
  const next = await decodeCurrentFootprintSourceHistory(after, identity);
  need(next.history.documents.length === prior.history.documents.length &&
    next.history.historyRowCount === prior.history.historyRowCount + 1 &&
    next.chunks.length === prior.chunks.length + 1 &&
    canonicalJson(next.chunks.slice(0, -1)) === canonicalJson(prior.chunks) &&
    canonicalJson(next.links.slice(0, -1)) === canonicalJson(prior.links) &&
    next.chunks.at(-1) === plaintext && next.maximumTicket === bodyPlan.ticket &&
    prior.maximumTicket === bodyPlan.ticket - 1, "COMPLETE_HISTORY_APPEND");
  const targetBefore = prior.history.documents.find(document => document.uuid === bodyPlan.targetUuid);
  const targetAfter = next.history.documents.find(document => document.uuid === bodyPlan.targetUuid);
  need(targetBefore !== undefined && targetAfter !== undefined && targetBefore.docType === "FOOTPRINT" &&
    !isNativeDocumentDeleted(targetBefore) && !targetBefore.records.some(record => record.id === "DELETE_DOC") &&
    targetAfter.docType === "FOOTPRINT" && isNativeDocumentDeleted(targetAfter), "TARGET_DELETION");
  const headerBody: unknown = JSON.parse(bodyPlan.workerUpload.slice(bodyPlan.workerUpload.indexOf("||") + 2, bodyPlan.workerUpload.indexOf("|\n")));
  const markers = targetAfter.records.filter(record => record.id === "DELETE_DOC");
  need(canonicalJson(targetAfter.metadata) === canonicalJson(headerBody) &&
    canonicalJson(targetAfter.records.filter(record => record.id !== "DELETE_DOC")) === canonicalJson(targetBefore.records) &&
    markers.length === 1 && markers[0] !== undefined && markers[0].type === "DELETE_DOC" &&
    markers[0].ticket === bodyPlan.ticket && canonicalJson(markers[0].body) === canonicalJson({ isDelete: true }), "EXACT_TARGET_TOMBSTONE");
  const targets = new Map(next.history.documents.map(document => [document.uuid, document]));
  for (const document of prior.history.documents) {
    if (document.uuid !== bodyPlan.targetUuid) { need(targets.get(document.uuid)?.semanticSha256 === document.semanticSha256, "PEER_DOCUMENT"); }
  }
  const visible = next.history.documents.filter(document => !isNativeDocumentDeleted(document)).map(document => ({
    uuid: document.uuid, docType: document.docType, semanticSha256: document.semanticSha256,
  })).toSorted((left, right) => left.uuid.localeCompare(right.uuid));
  readerCompletion(before); readerCompletion(after);
  return freezeDeep({
    schema: "private.current-footprint-inverse-native-delete-closed-sql-delta.v1",
    projectUuid: history.projectUuid, branchUuid: history.branchUuid,
    beforeLogicalSha256: before.logicalSha256, afterLogicalSha256: after.logicalSha256,
    historyUuid: history.historyUuid, chunkUuid: history.chunkUuid, bodySha256: history.bodySha256,
    targetUuid: bodyPlan.targetUuid, maximumTicket: next.maximumTicket,
    retainedDocuments: next.history.documents.length, visibleDocuments: visible.length,
    visibleRosterSha256: sha256Json(visible), targetSemanticSha256: targetAfter.semanticSha256,
    allPeerDocumentsUnchanged: true, targetHistoricalRecordsRetained: true,
    dataRowid: baseline.dataLastId, headRowid: baseline.headLastId, preservedHeadCount: baseline.headCount,
    completeSqlVerified: true, allOtherRowsSchemaAndPropertiesUnchanged: true, structureRequests: 0, explicitSaveAttempts: 0,
    suppliedObservationsOnly: true, persistenceVerified: false, reopenedVerified: false, executionAuthorized: false,
  });
}
