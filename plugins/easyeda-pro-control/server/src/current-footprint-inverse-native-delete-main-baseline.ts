/** Pure projection of the original native inverse's complete saved inventory.
 * This data issues no request, SQL, owner, callback or upload continuation. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";
import { verifyCurrentFootprintDeleteWorkerUpload } from "./current-footprint-delete-plan.ts";
import type { CurrentFootprintDeletePlan } from "./current-footprint-delete-plan.ts";
import {verifyCurrentFootprintDeleteObservedUpload} from "./current-footprint-delete-observed-plan.ts";
import type {CurrentFootprintDeleteObservedPlan} from "./current-footprint-delete-observed-plan.ts";

type BodyPlan=CurrentFootprintDeletePlan|CurrentFootprintDeleteObservedPlan;

type Cell=string|number|null;
const time=z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u),uuid=z.string().regex(/^[a-f0-9]{32}$/u);
export const currentFootprintInverseNativeDeleteMainBranchSchema=z.strictObject({node:z.literal(0),uuid,delete_status:z.literal(0),history_uuid:uuid});
export const currentFootprintInverseNativeDeleteMainHeadSchema=z.strictObject({num:z.number().int().min(0).max(7),uuid,key:uuid,is_lock:z.union([z.literal(0),z.literal(1)]),created_at:time});
export const currentFootprintInverseNativeDeleteMainBaselineSchema=z.strictObject({
 profile:z.literal("private.current-footprint-inverse-native-delete-main-baseline.v1"),projectUuid:z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),branchUuid:uuid,
 initialLogicalSha256:z.string().regex(/^[a-f0-9]{64}$/u),branch:currentFootprintInverseNativeDeleteMainBranchSchema,head:currentFootprintInverseNativeDeleteMainHeadSchema,
 headCount:z.number().int().min(1).max(8),dataLastId:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),headLastId:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
 workerUploadSha256:z.string().regex(/^[a-f0-9]{64}$/u),maximumPlaintextBytes:z.number().int().positive().max(8192),maximumCiphertextBytes:z.literal(32_768),
 expectedStructureRequests:z.literal(0),explicitSaveAttempts:z.literal(0),sourceOwnerBound:z.literal(false),selectedSqlAuthorized:z.literal(false),executionAuthorized:z.literal(false),
});
export type CurrentFootprintInverseNativeDeleteMainBaseline=Readonly<z.infer<typeof currentFootprintInverseNativeDeleteMainBaselineSchema>>;
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FOOTPRINT_INVERSE_NATIVE_MAIN_BASELINE_${code}`);}}
function cell(value:SqlCell|undefined):Cell{
 need(value!==undefined,"CELL");if(value.kind==="null"){return null;}if(value.kind==="integer"){const number=Number(value.decimal);need(Number.isSafeInteger(number)&&String(number)===value.decimal,"INTEGER");return number;}
 need(value.kind==="text","TEXT");const bytes=Buffer.from(value.hex,"hex"),text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);need(Buffer.from(text).equals(bytes),"utf8");return text;
}
function table(inventory:NativeSqlInventory,name:string):SqlTable{const matches=inventory.tables.filter(value=>value.name===name);need(matches.length===1&&matches[0]!==undefined,"TABLE");return matches[0];}
function rows(value:SqlTable):readonly Readonly<Record<string,Cell>>[]{
 const names=value.columns.map(column=>{need(typeof column["name"]==="string","COLUMN");return column["name"];});need(new Set(names).size===names.length,"COLUMN_ROSTER");
 return value.rows.map(row=>{need(row.cells.length===names.length,"ROW");return Object.fromEntries(names.map((name,i)=>[name,cell(row.cells[i])]));});
}
function nextId(inventory:NativeSqlInventory,name:string):number{
 const selected=table(inventory,name);const entries=rows(selected),sequences=rows(table(inventory,"sqlite_sequence")).filter(row=>row["name"]===name);
 const schema=inventory.schema.filter(value=>value.type==="table"&&value.name===name);
 need(schema.length===1&&schema[0]!==undefined&&typeof schema[0].sql==="string"&&!selected.withoutRowid,"ROWID_SCHEMA");
 const idColumn=selected.columns.filter(value=>value["name"]==="id");need(idColumn.length===1&&idColumn[0]!==undefined&&idColumn[0]["pk"]===1&&String(idColumn[0]["type"]).toUpperCase()==="INTEGER","INTEGER_PRIMARY_KEY");
 let highest=0;
 for(let i=0;i<entries.length;i+=1){const id=entries[i]?.["id"],rowid=selected.rows[i]?.rowid;
  need(typeof id==="number"&&Number.isSafeInteger(id)&&id>0&&id<Number.MAX_SAFE_INTEGER&&rowid?.kind==="integer"&&rowid.decimal===String(id),"ROWID_IDENTITY");highest=Math.max(highest,id);
 }
 const autoincrement=/\bAUTOINCREMENT\b/iu.test(schema[0].sql);
 if(name==="history_data"){
  need(autoincrement&&sequences.length===1&&sequences[0]!==undefined,"AUTOINCREMENT_SEQUENCE");
  const sequence=sequences[0]["seq"];need(typeof sequence==="number"&&Number.isSafeInteger(sequence)&&sequence>=highest&&sequence<Number.MAX_SAFE_INTEGER,"SEQUENCE_COVERS_ROWS");
  return sequence+1;
 }
 need(!autoincrement&&sequences.length===0&&highest>0,"HEAD_ROWID_POLICY");return highest+1;
}
function maximumPlaintext(inventory:NativeSqlInventory,body:string):number{
 const users=rows(table(inventory,"users"));const labels:{username:string;nickname:string}[]=[{username:"",nickname:""}];
 for(const user of users){need(typeof user["username"]==="string"&&typeof user["nickname"]==="string"&&user["username"].length<=1024&&user["nickname"].length<=1024,"ACTOR_LABELS");labels.push({username:user["username"],nickname:user["nickname"]});}
 let maximum=0;
 for(const label of labels){const plaintext=`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify({uuid:"f".repeat(32),...label,updateTime:8_640_000_000_000_000})}|\n${body}`;maximum=Math.max(maximum,Buffer.byteLength(plaintext));}
 need(maximum<=8192,"PLAINTEXT_CAPACITY");return maximum;
}
export function deriveCurrentFootprintInverseNativeDeleteMainBaseline(inventory:NativeSqlInventory,history:CurrentFootprintInverseMainHistoryBaseline,bodyPlan:BodyPlan):CurrentFootprintInverseNativeDeleteMainBaseline{
 readerCompletion(inventory);if(bodyPlan.profile==="private.current-footprint-delete-plan.v2"){verifyCurrentFootprintDeleteObservedUpload(bodyPlan,bodyPlan.workerUpload);}else{verifyCurrentFootprintDeleteWorkerUpload(bodyPlan,bodyPlan.workerUpload);}
 need(table(inventory,"projects").rows.length===1,"SINGLE_PROJECT_UPDATE");
 const branchUuid=history.branchUuid;const projectUuid=history.projectUuid;const name=`project_history_${branchUuid}`;
 const branchRows=rows(table(inventory,"branches")).filter(row=>row["uuid"]===branchUuid);const branch=branchRows[0];
 need(branchRows.length===1&&branch!==undefined&&branch["project_uuid"]===projectUuid&&branch["history_uuid"]===history.historyUuid,"BRANCH");
 const heads=rows(table(inventory,name));need(heads.length===history.rows.length&&heads.length > 0&&heads.length<=8,"HEAD_COUNT");
 for(const actual of history.rows){
  const selected=heads.filter(row=>row["uuid"]===actual.uuid);need(selected.length===1&&selected[0]!==undefined,"HEAD_IDENTITY");const observed=selected[0];
  for(const field of ["id","uuid","parent","key","is_lock","num","snapshot_num","created_at","updated_at","lock_time"] as const){need(observed[field]===actual[field],"HEAD_ROW");}
  need(observed["snapshot"]===null&&actual.iv===actual.uuid,"HEAD_ENCODING");
 }
 const head=history.rows[0];need(head!==undefined&&head.uuid===history.historyUuid&&typeof head.created_at==="string","CURRENT_HEAD");
 const dataLastId=nextId(inventory,"history_data"),headLastId=nextId(inventory,name);
 return freezeDeep(currentFootprintInverseNativeDeleteMainBaselineSchema.parse({
  profile:"private.current-footprint-inverse-native-delete-main-baseline.v1",projectUuid,branchUuid,initialLogicalSha256:inventory.logicalSha256,
  branch:{node:branch["node"],uuid:branch["uuid"],delete_status:branch["delete_status"],history_uuid:branch["history_uuid"]},
  head:{num:head.num,uuid:head.uuid,key:head.key,is_lock:head.is_lock,created_at:head.created_at},headCount:heads.length,dataLastId,headLastId,
  workerUploadSha256:bodyPlan.workerUploadSha256,maximumPlaintextBytes:maximumPlaintext(inventory,bodyPlan.workerUpload),maximumCiphertextBytes:32_768,
  expectedStructureRequests:0,explicitSaveAttempts:0,sourceOwnerBound:false,selectedSqlAuthorized:false,executionAuthorized:false,
 }));
}
/** Data drift check only. The original Core/Backend maps remain the issuers. */
export function requireCurrentFootprintInverseNativeDeleteMainBaseline(value:CurrentFootprintInverseNativeDeleteMainBaseline,inventory:NativeSqlInventory,history:CurrentFootprintInverseMainHistoryBaseline,bodyPlan:BodyPlan):void{
 const derived=deriveCurrentFootprintInverseNativeDeleteMainBaseline(inventory,history,bodyPlan);need(canonicalJson(value)===canonicalJson(derived),"DRIFT");
}
