/** Real private SQLite reader data; no native process, callback or SQL grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { deriveCurrentFootprintInverseNativeDeleteMainBaseline as derive } from "../src/current-footprint-inverse-native-delete-main-baseline.ts";
import { currentFootprintInverseMainHistoryValueSchema } from "../src/current-footprint-inverse-main-history-baseline.ts";
import { prepareCurrentFootprintDeletePlan } from "../src/current-footprint-delete-plan.ts";
import type { NativeSqlInventory } from "../src/sqlite-inventory-core.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as OLD } from "../src/current-project-history-main-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_PROGRAMS as NATIVE } from "../src/current-footprint-inverse-native-delete-main-history-programs.ts";
import { IDS, applyEffect, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const PROJECT="1".repeat(64);
function history(before:NativeSqlInventory):ReturnType<typeof currentFootprintInverseMainHistoryValueSchema.parse>{
 const table=before.tables.find(value=>value.name===`project_history_${IDS.branch}`);assert.ok(table!==undefined);
 const names=table.columns.map(column=>String(column["name"]));
 const rows=table.rows.map(row=>{
  const output:Record<string,string|number|null>={};
  for(const [i,name]of names.entries()){
   const cell=row.cells[i];assert.ok(cell!==undefined);
   let value:string|number|null=null;
   if(cell.kind==="text"){value=Buffer.from(cell.hex,"hex").toString("utf8");}
   else if(cell.kind==="integer"){value=Number(cell.decimal);}
   output[name]=value;
  }
  return output;
 }).toSorted((left,right)=>Number(right["id"])-Number(left["id"]));
 return currentFootprintInverseMainHistoryValueSchema.parse({projectUuid:PROJECT,branchUuid:IDS.branch,historyUuid:IDS.newHead,rows:rows.map(row=>({
  id:row["id"],uuid:row["uuid"],parent:row["parent"],key:row["key"],is_lock:row["is_lock"],num:row["num"],snapshot_num:row["snapshot_num"],
  created_at:row["created_at"],updated_at:row["updated_at"],lock_time:row["lock_time"],iv:row["uuid"],
 }))});
}
function body():ReturnType<typeof prepareCurrentFootprintDeletePlan>{
 return prepareCurrentFootprintDeletePlan({targetUuid:"e".repeat(16),client:"f".repeat(16),maximumTicketBeforeClock:102,maximumTicketAfterClock:102,documentClock:1_700_000_000_000,managerUserAbsent:true,editorVersion:"3.2.209"});
}
void test("native inverse baseline derives actual next IDs from complete original two-head inventory and the distinct AUTOINCREMENT and ROWID rules",async()=>{
 const f=await fixture({project:PROJECT,branch:IDS.branch,target:IDS.target});applyEffect(f.path);
 mutate(f.path,`UPDATE sqlite_sequence SET seq=37 WHERE name='history_data';UPDATE project_history_${IDS.branch} SET id=64 WHERE uuid='${IDS.newHead}'`);
 const before=await inventory(f.path);const baseline=derive(before,history(before),body());
 assert.equal(baseline.headCount,2);assert.equal(baseline.dataLastId,38);assert.equal(baseline.headLastId,65);assert.equal(baseline.head.uuid,IDS.newHead);
 assert.equal(baseline.expectedStructureRequests,0);assert.equal(baseline.explicitSaveAttempts,0);assert.equal(baseline.sourceOwnerBound,false);assert.equal(baseline.selectedSqlAuthorized,false);
 assert.equal(baseline.executionAuthorized,false);assert.ok(baseline.maximumPlaintextBytes<=8192);assert.equal(baseline.initialLogicalSha256,before.logicalSha256);
 assert.throws(()=>derive(structuredClone(before),history(before),body()));
 const changed=history(before);const first=changed.rows[0];assert.ok(first);assert.throws(()=>derive(before,{...changed,rows:changed.rows.with(0,{...first,num:1})},body()));
});
void test("separate native program bytes remove only the wrong fixture IDs; every old program remains exact",()=>{
 const before="381aa1d1afcf026bdb14406383ad9e4bf0662e91d9f6e65fde54782720484ada";assert.deepEqual(Object.keys(NATIVE),Object.keys(OLD));
 for(const name of Object.keys(OLD)){
  const old:unknown=Reflect.get(OLD,name);const native:unknown=Reflect.get(NATIVE,name);assert.ok(old!==null&&typeof old==="object"&&native!==null&&typeof native==="object");
  const original:unknown=Reflect.get(old,"program");const program:unknown=Reflect.get(native,"program");assert.ok(typeof original==="string"&&typeof program==="string");
  assert.equal(program,original.replace('||base.kind==="data"&&lastID!==2||base.kind==="head"&&base.mode==="append"&&lastID!==2',""));
  assert.equal(program.includes("Number.isSafeInteger(lastID)"),name!=="callback");assert.equal(Reflect.get(native,"arguments"),Reflect.get(old,"arguments"));
 }
 assert.equal(createHash("sha256").update(JSON.stringify(OLD)).digest("hex"),before);
});
