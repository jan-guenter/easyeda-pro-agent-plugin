/* oxlint-disable import/max-dependencies -- Exact SQLite baseline, pinned worker schedule and inert original-method failure checks share this existing source-only fixture. */
/** Real private SQLite reader data; no native process, callback or SQL grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import vm from "node:vm";
import {CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as WORKER,CURRENT_PROJECT_SAVE_PRODUCER_METHODS as WORKER_PINS} from "../src/current-project-save-producer-source.ts";
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


void test("pinned original upload cannot issue its natural sync before the history POST response",async()=>{
 for(const role of["uploadCloud","syncCloud"]as const){assert.equal(createHash("sha256").update(WORKER[role]).digest("hex"),WORKER_PINS[role].sha256);}
 const response=Promise.withResolvers<{success:true;result:string}>(),sent=Promise.withResolvers<null>();
 const events:string[]=[];const payload=body().workerUpload;
 const context=vm.createContext({Response,body:payload,Re:{getInstance:()=>({projectHistory:{set:(input:unknown):Promise<unknown>=>{
  assert.deepEqual(structuredClone(input),{projectId:PROJECT,branchData:{uuid:IDS.branch},dataStr:payload});
  events.push("history-post");sent.resolve(null);return response.promise;
 }}})},Ie:"|\n",cg:(value:string):string=>value,console:{error:()=>{assert.fail("successful inert source path must not retry");}},
  afterHistory:():Promise<void>=>{events.push("post-response-sync");return Promise.resolve();},
 });
 const source=["const producer={",WORKER.uploadCloud,",isV2Format:false,isTemporary:false,pendingSyncCloud:false,uuid:",JSON.stringify(PROJECT),",branchUuid:",JSON.stringify(IDS.branch),
  ",bufferUploadData:new Map([['one',body]]),bufferUploadCache:new Map(),task1:new Set(),localCache:{put:async()=>{},delete:async()=>{}},publishUploadPending(){},syncCloud:afterHistory};producer.uploadCloud();"].join("");
 const pending:unknown=vm.runInContext(source,context);assert.ok(pending instanceof Promise||pending!==null&&typeof pending==="object"&&"then"in pending);
 const early=(async():Promise<never>=>{await pending;throw new Error("Upload ended before the original POST barrier.");})();
 try{await Promise.race([sent.promise,early]);assert.deepEqual(events,["history-post"]);}
 finally{response.resolve({success:true,result:IDS.newHead});await pending;}
 assert.deepEqual(events,["history-post","post-response-sync"]);
 // The pinned sync successor performs the natural branch GET.
 // It does not rule out unrelated driver traffic, qualify a runtime or mint an owner.
 assert.ok(WORKER.syncCloud.includes("let g=await this.getLastHistoryUuid(this.branchUuid)"));
});

void test("an exact original GET or HEAD consumes the unsupported prefix without resume or retry",async()=>{
 const source=await readFile(new URL("../src/current-footprint-inverse-native-delete-main-controller.ts",import.meta.url),"utf8");
 function method(name:string):string{
  const start=source.indexOf(name);assert.ok(start!==-1);let depth=1,position=source.indexOf("{",start);
  for(position+=1;depth>0;position+=1){assert.ok(position<source.length);if(source[position]==="{"){depth+=1;}if(source[position]==="}"){depth-=1;}}
  return source.slice(start,position);
 }
 for(const verb of["GET","HEAD"]as const){
  const packet=Object.freeze({method:verb});const failures:unknown[]=[];let proofs=0;
  const context=vm.createContext({packet,Error,need:(value:boolean,code:string):void=>{assert.ok(value,code);},
   host:{requireRequest:(value:unknown):void=>{assert.equal(value,packet);proofs+=1;},fail:(error:unknown):void=>{failures.push(error);throw new Error("cleanup handoff failed");}},
  });
  const program=["class Fixture{#host=host;#failed=false;#failure;",
   "#same(){need(!this.#failed,'FAILED_OR_ENDED');}",
   method("#fail(cause:unknown):void"),method("#refuseUnreservedReadonlyRequest(packet:"),
   "refuse(value){return this.#refuseUnreservedReadonlyRequest(value);}",
   "failure(){return this.#failure;}};const fixture=new Fixture();"].join("\n");
  vm.runInContext(stripTypeScriptTypes(program),context);
  assert.throws(()=>vm.runInContext("fixture.refuse(packet)",context),/UNRESERVED_HTTP_READ/u);
  assert.equal(failures.length,1);assert.equal(vm.runInContext("fixture.failure()",context),failures[0]);assert.equal(proofs,1);
  assert.throws(()=>vm.runInContext("fixture.refuse(packet)",context),/FAILED_OR_ENDED/u);assert.equal(failures.length,1);assert.equal(proofs,1);
 }
});
