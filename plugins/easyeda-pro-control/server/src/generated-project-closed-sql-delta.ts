/** Pure complete-row comparison against supplied observed effects. Only the
 * original operation's owner may establish provenance or persistence later. */
import { z } from "zod";
import { types } from "node:util";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";

type Value = string | number | null; type Fields = Readonly<Record<string, Value>>;
const uuid = z.string().regex(/^[a-f\d]{32}$/u); const hash = z.string().regex(/^[a-f\d]{64}$/u); const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const time = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u);
const nativeCallback = z.strictObject({ slot: z.enum(["data","head","branch","commit","project"]), changes: integer, lastID: integer, beforeEpochMs: integer.positive(), afterEpochMs: integer.positive() }).refine(value => value.afterEpochMs >= value.beforeEpochMs && value.afterEpochMs-value.beforeEpochMs<=120_000);
const historySchema = z.strictObject({ schema:z.literal("private.current-project-history-sql-effects.v1"), projectUuid:hash, branchUuid:uuid, initialLogicalSha256:hash,
  mode:z.enum(["append","mutable"]),historyUuid:uuid,parentHistoryUuid:uuid,keyHex:uuid,chunkUuid:z.string().regex(/^[a-f\d]{32}(?:-1)?$/u),dataBase64Parts:z.array(z.string().max(8192)).min(1).max(8),
  plaintextSha256:hash,bodySha256:hash,historyNum:z.union([z.literal(0),z.literal(1)]),actor:z.strictObject({uuid,username:z.string().max(1024),nickname:z.string().max(1024),updateTime:integer.positive()}),
  projectUpdatedAt:time,projectModifierUuid:uuid,nativeCallbacks:z.array(nativeCallback).length(5),originalServiceAwaitCompleted:z.literal(true),selectedSqlStillFenced:z.literal(true) });
const structureSchema = z.strictObject({schema:z.literal("private.current-project-structure-sql-effects.v1"),projectUuid:hash,branchUuid:uuid,initialLogicalSha256:hash,previousTicket:z.literal(1),previousStructureText:z.string().min(1).max(16_384),ticket:integer.positive(),structureText:z.string().min(1).max(9999),selectedRows:z.literal(1),nativeChanges:z.literal(1),nativeLastID:integer,nativeBeforeEpochMs:integer.positive(),nativeAfterEpochMs:integer.positive(),originalServiceAwaitCompleted:z.literal(true),originalControllerBodyVerified:z.literal(true),originalResponseFinalizerReturned:z.literal(true),selectedSqlStillFenced:z.literal(true)}).refine(value=>value.nativeAfterEpochMs>=value.nativeBeforeEpochMs&&value.nativeAfterEpochMs-value.nativeBeforeEpochMs<=120_000);
export interface GeneratedProjectClosedSqlDelta {
  readonly schema:"private.generated-project-closed-sql-delta.v1"; readonly projectUuid:string; readonly branchUuid:string;
  readonly beforeLogicalSha256:string; readonly afterLogicalSha256:string; readonly historyUuid:string; readonly chunkUuid:string;
  readonly bodySha256:string; readonly structureSha256:string; readonly completeSqlVerified:true; readonly allOtherRowsSchemaAndPropertiesUnchanged:true;
  readonly suppliedObservationsOnly:true; readonly persistenceVerified:false; readonly reopenedVerified:false; readonly executionAuthorized:false;
}
function need(value:boolean,reason:string):asserts value {if(!value){throw new Error(`GENERATED_PROJECT_CLOSED_SQL_${reason}`);}}
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
function decode(cell:SqlCell|undefined):Value {need(cell!==undefined,"CELL");if(cell.kind==="null"){return null;}if(cell.kind==="integer"){const value=Number(cell.decimal);
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
/** Both inventories must be their original complete finished reader results.
 * expectedDataStr and effects are supplied inert observations, not grants. */
export async function compareGeneratedProjectClosedSqlDelta(before:NativeSqlInventory,after:NativeSqlInventory,expectedDataStr:string,historyValue:CurrentProjectHistorySqlEffects,structureValue:CurrentProjectStructureSqlEffects):Promise<GeneratedProjectClosedSqlDelta>{
  readerCompletion(before);readerCompletion(after);
  need(typeof expectedDataStr==="string"&&expectedDataStr.length>0&&expectedDataStr.isWellFormed()&&Buffer.byteLength(expectedDataStr)<=16_384,"BODY_BOUND");
  const history=historyInput(historyValue);
  const structure=structureSchema.parse(captureCurrentPcbStringClockReply(structureValue).value);
  need(before.logicalSha256===history.initialLogicalSha256&&before.logicalSha256===structure.initialLogicalSha256&&history.projectUuid===structure.projectUuid&&history.branchUuid===structure.branchUuid&&sha256Text(expectedDataStr)===history.bodySha256&&structure.ticket>1,"SCOPE");
  const schema=nativeProjectSymbolSqlSchema(history.branchUuid).entries;
  need(canonicalJson(before.schema)===canonicalJson(schema)&&before.schemaSha256===sha256Json(schema)&&after.schemaSha256===before.schemaSha256&&canonicalJson(after.schema)===canonicalJson(before.schema)&&canonicalJson(after.properties)===canonicalJson(before.properties),"SCHEMA_PROPERTIES");
  const tables=new Map(before.tables.map(table=>[table.name,table]));
  const following=new Map(after.tables.map(table=>[table.name,table]));
  need(tables.size===before.tables.length&&following.size===after.tables.length&&canonicalJson([...tables.keys()])===canonicalJson([...following.keys()]),"TABLE_ROSTER");
  const get=(name:string):Readonly<{old:SqlTable;next:SqlTable}>=>{const old=tables.get(name);
  const next=following.get(name);
  need(old!==undefined&&next!==undefined&&canonicalJson({...old,rows:[],sha256:""})===canonicalJson({...next,rows:[],sha256:""}),"TABLE_SHAPE");return {old,next};};
  const name=`project_history_${history.branchUuid}`;
  const allowed=new Set(["history_data",name,"branches","projects","project_structures","sqlite_sequence"]);for(const table of before.tables){if(!allowed.has(table.name)){need(canonicalJson(table)===canonicalJson(following.get(table.name)),`UNCHANGED_${table.name}`);}}
  const callbacks=history.nativeCallbacks;for(const [index,slot] of (["data","head","branch","commit","project"] as const).entries()){const callback=callbacks[index];
  need(callback!==undefined&&callback.slot===slot&&(slot==="commit"||callback.changes===1)&&(index===0||callback.beforeEpochMs>=(callbacks[index-1]?.afterEpochMs??Infinity)),"NATIVE_CALLBACKS");}
  const dataWindow=callbacks[0];
  const headWindow=callbacks[1];
  need(dataWindow!==undefined&&headWindow!==undefined&&dataWindow.lastID===2&&(history.mode!=="append"||headWindow.lastID===2),"NATIVE_INSERT_IDS");
  const headTable=get(name);
  const oldHead=sole(headTable.old);
  const head=oldHead.value;
  need(decode(oldHead.original.rowid??undefined)===1&&head["id"]===1&&head["uuid"]===history.parentHistoryUuid&&head["num"]===0&&head["is_lock"]===0&&head["parent"]===null&&head["snapshot"]===null&&head["snapshot_num"]===0&&head["lock_time"]==="1970-01-01 08:00:00","INITIAL_HEAD");
  if(history.mode==="mutable"){need(history.historyUuid===head["uuid"]&&history.keyHex===head["key"]&&history.chunkUuid===`${history.historyUuid}-1`&&history.historyNum===1,"MUTABLE_HEAD");compareRows(headTable.old,headTable.next,[row(headTable.old,1,{...head,num:1})]);}
  else {need(history.historyUuid!==head["uuid"]&&history.chunkUuid===history.historyUuid&&history.historyNum===0&&headTable.next.rows.length===2,"APPENDED_HEAD");
  const added=headTable.next.rows.find(value=>decode(value.rowid??undefined)===2);
  need(added!==undefined,"NEW_HEAD_ROWID");
  const current=fields(headTable.next,added);defaults(current,headWindow);compareRows(headTable.old,headTable.next,[oldHead.original,row(headTable.old,2,{...head,id:2,uuid:history.historyUuid,parent:history.parentHistoryUuid,key:history.keyHex,created_at:literal(current["created_at"]),updated_at:literal(current["updated_at"])})]);}
  const data=get("history_data");
  const initialData=sole(data.old);
  need(initialData.value["id"]===1&&initialData.value["uuid"]===history.parentHistoryUuid&&initialData.value["history_uuid"]===history.parentHistoryUuid&&data.next.rows.length===2,"INITIAL_DATA");
  const addedData=data.next.rows.find(value=>decode(value.rowid??undefined)===2);
  need(addedData!==undefined,"DATA_ROWID");
  const addedFields=fields(data.next,addedData);defaults(addedFields,dataWindow);compareRows(data.old,data.next,[initialData.original,row(data.old,2,{...initialData.value,id:2,uuid:history.chunkUuid,history_uuid:history.historyUuid,dataStr:history.dataBase64,created_at:literal(addedFields["created_at"]),updated_at:literal(addedFields["updated_at"])})]);
  const branches=get("branches");
  need(branches.old.rows.length===2,"BRANCH_ROSTER");let selected=0;
  const branchRows=branches.old.rows.map(original=>{const value=fields(branches.old,original);if(value["uuid"]!==history.branchUuid){return original;}selected+=1;
  need(value["project_uuid"]===history.projectUuid&&value["history_uuid"]===history.parentHistoryUuid&&value["node"]===0&&value["delete_status"]===0,"SELECTED_BRANCH");
  const id=decode(original.rowid??undefined);
  need(typeof id==="number","BRANCH_ROWID");return row(branches.old,id,{...value,history_uuid:history.historyUuid});});
  need(selected===1,"SOLE_SELECTED_BRANCH");compareRows(branches.old,branches.next,branchRows);
  const projects=get("projects");
  const project=sole(projects.old);
  need(project.value["uuid"]===history.projectUuid&&history.projectModifierUuid===history.actor.uuid,"PROJECT_ACTOR");utc(history.projectUpdatedAt);
  const projectId=decode(project.original.rowid??undefined);
  need(typeof projectId==="number","PROJECT_ROWID");compareRows(projects.old,projects.next,[row(projects.old,projectId,{...project.value,updated_at:history.projectUpdatedAt,modifier_uuid:history.projectModifierUuid})]);
  const structures=get("project_structures");
  const previous=sole(structures.old);
  need(previous.value["ticket"]===1&&previous.value["project_uuid"]===history.projectUuid&&previous.value["branch_uuid"]===history.branchUuid&&previous.value["structure"]===structure.previousStructureText,"INITIAL_STRUCTURE");
  const structureId=decode(previous.original.rowid??undefined);
  need(typeof structureId==="number","STRUCTURE_ROWID");compareRows(structures.old,structures.next,[row(structures.old,structureId,{...previous.value,ticket:structure.ticket,structure:structure.structureText})]);
  const sequence=get("sqlite_sequence");
  need(sequence.old.rows.length===3,"SEQUENCE_ROSTER");let sequences=0;
  const sequenceRows=sequence.old.rows.map(original=>{const value=fields(sequence.old,original);if(value["name"]!=="history_data"){return original;}sequences+=1;
  need(value["seq"]===1,"INITIAL_DATA_SEQUENCE");
  const id=decode(original.rowid??undefined);
  need(typeof id==="number","SEQUENCE_ROWID");return row(sequence.old,id,{...value,seq:2});});
  need(sequences===1,"SOLE_DATA_SEQUENCE");compareRows(sequence.old,sequence.next,sequenceRows);
  const plaintext=await decodeNativeHistoryChunk({historyUuid:history.historyUuid,keyHex:history.keyHex,dataBase64:history.dataBase64});
  need(sha256Text(plaintext)===history.plaintextSha256&&plaintext===`{"type":"EDIT_HEAD"}||${JSON.stringify(history.actor)}|\n${expectedDataStr}`,"EXACT_NATIVE_PLAINTEXT");readerCompletion(before);readerCompletion(after);
  return freezeDeep({schema:"private.generated-project-closed-sql-delta.v1",projectUuid:history.projectUuid,branchUuid:history.branchUuid,beforeLogicalSha256:before.logicalSha256,afterLogicalSha256:after.logicalSha256,historyUuid:history.historyUuid,chunkUuid:history.chunkUuid,bodySha256:history.bodySha256,structureSha256:sha256Text(structure.structureText),completeSqlVerified:true,allOtherRowsSchemaAndPropertiesUnchanged:true,suppliedObservationsOnly:true,persistenceVerified:false,reopenedVerified:false,executionAuthorized:false});
}
