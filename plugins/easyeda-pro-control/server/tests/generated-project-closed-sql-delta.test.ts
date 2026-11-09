/** Real synthetic SQLite/crypto and complete readers. Supplied effect DTOs
 * are explicit inert observations; no native clock, actor or writer is issued. */
/* oxlint-disable import/max-dependencies -- Verify the pure comparator with actual complete native-schema files, independent cipher construction and finished readers. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { StatementResultingChanges } from "node:sqlite";
import { test } from "node:test";
import { compareGeneratedProjectClosedSqlDelta as compare } from "../src/generated-project-closed-sql-delta.ts";
import type { CurrentProjectHistorySqlEffects, CurrentProjectHistorySqlNativeCallback, CurrentProjectHistorySqlSlot } from "../src/current-project-history-sql-effects.ts";
import type { CurrentProjectStructureSqlEffects } from "../src/current-project-structure-sql-effects.ts";
import { CURRENT_PROJECT_HISTORY_SQL as SQL, currentProjectSelectedHistorySql } from "../src/current-project-history-sql-data.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { sha256Text } from "../src/core.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

async function inventory(path:string):ReturnType<typeof readExactSqlInventory>{return readExactSqlInventory({checkpointPath:path,expectedSha256:createHash("sha256").update(await readFile(path)).digest("hex"),runtime:await syntheticSqlRuntime()});}
async function fixture(mode:"append"|"mutable"):Promise<Readonly<{before:Awaited<ReturnType<typeof readExactSqlInventory>>;after:Awaited<ReturnType<typeof readExactSqlInventory>>;path:string;body:string;history:CurrentProjectHistorySqlEffects;structure:CurrentProjectStructureSqlEffects}>>{
  const initial=await managedFixtureInitialSqlFixture();
  const qualified=await qualifyGeneratedFixtureInitialSql(initial);
  const path=join(dirname(initial.syntheticDatabasePath),`after-${mode}.eprj2`);await copyFile(initial.syntheticDatabasePath,path);
  const project=qualified.qualification.target.projectUuid;
  const branch=qualified.qualification.target.branchUuid;
  const oldHead="5".repeat(32);
  const head=mode==="append"?"7".repeat(32):oldHead;
  const key=mode==="append"?"8".repeat(32):"6".repeat(32);
  const chunk=mode==="append"?head:`${head}-1`;
  const actor={uuid:"4".repeat(32),username:"",nickname:"",updateTime:Date.now()};
  const body="explicit synthetic original Save body";
  const plaintext=`{"type":"EDIT_HEAD"}||${JSON.stringify(actor)}|\n${body}`;
  const cipher=encrypted(plaintext,head,key);
  const tree='{"explicitSyntheticTree":true}';
  const database=new DatabaseSync(path,{enableForeignKeyConstraints:false});
  const callbacks:CurrentProjectHistorySqlNativeCallback[]=[];
  let structure:CurrentProjectStructureSqlEffects;
  const updatedAt=new Date().toISOString().slice(0,19).replace("T"," ");
  const run=(slot:CurrentProjectHistorySqlSlot,call:()=>StatementResultingChanges):void=>{const beforeEpochMs=Date.now();
  const result=call();
  const afterEpochMs=Date.now();callbacks.push({slot,changes:Number(result.changes),lastID:Number(result.lastInsertRowid),beforeEpochMs,afterEpochMs});};
  try{const previous=database.prepare('select structure from project_structures').get()?.["structure"];assert.ok(typeof previous==="string");
  const nativeBeforeEpochMs=Date.now();
  const result=database.prepare(SQL.structure).run(5,tree,branch);
  const nativeAfterEpochMs=Date.now();
    structure={schema:"private.current-project-structure-sql-effects.v1",projectUuid:project,branchUuid:branch,initialLogicalSha256:initial.inventory.logicalSha256,previousTicket:1,previousStructureText:previous,ticket:5,structureText:tree,selectedRows:1,nativeChanges:1,nativeLastID:Number(result.lastInsertRowid),nativeBeforeEpochMs,nativeAfterEpochMs,originalServiceAwaitCompleted:true,originalControllerBodyVerified:true,originalResponseFinalizerReturned:true,selectedSqlStillFenced:true};
    database.exec("begin immediate transaction");run("data",()=>database.prepare(SQL.historyData).run(chunk,head,cipher,cipher));run("head",()=>mode==="append"?database.prepare(currentProjectSelectedHistorySql(branch,mode)).run(head,oldHead,null,key):database.prepare(currentProjectSelectedHistorySql(branch,mode)).run(1,head));run("branch",()=>database.prepare(SQL.branch).run(head,branch));run("commit",()=>database.prepare(SQL.commit).run());run("project",()=>database.prepare(SQL.project).run(updatedAt,actor.uuid));
  }finally{database.close();}
  const history:CurrentProjectHistorySqlEffects={schema:"private.current-project-history-sql-effects.v1",projectUuid:project,branchUuid:branch,initialLogicalSha256:initial.inventory.logicalSha256,mode,historyUuid:head,parentHistoryUuid:oldHead,keyHex:key,chunkUuid:chunk,dataBase64:cipher,plaintextSha256:sha256Text(plaintext),bodySha256:sha256Text(body),historyNum:mode==="append"?0:1,actor,projectUpdatedAt:updatedAt,projectModifierUuid:actor.uuid,nativeCallbacks:callbacks,originalServiceAwaitCompleted:true,selectedSqlStillFenced:true};
  return {before:initial.inventory,after:await inventory(path),path,body,history,structure};
}
for(const mode of["append","mutable"]as const){void test(`complete closed SQL admits only the finite native history/structure rows (${mode})`,async()=>{const f=await fixture(mode);
  const result=await compare(f.before,f.after,f.body,f.history,f.structure);assert.equal(result.completeSqlVerified,true);assert.equal(result.allOtherRowsSchemaAndPropertiesUnchanged,true);assert.equal(result.persistenceVerified,false);assert.equal(result.executionAuthorized,false);assert.equal(result.chunkUuid,f.history.chunkUuid);await assert.rejects(compare(structuredClone(f.before),f.after,f.body,f.history,f.structure),/original inventory/u);});}
void test("foreign rows, persisted properties, cipher bytes and metadata refuse complete comparison",async()=>{const f=await fixture("append");
  const mutations={peer:"UPDATE users SET nickname='foreign'",property:"PRAGMA user_version=1",cipher:"UPDATE history_data SET dataStr='changed' WHERE id=2",head:`UPDATE project_history_${f.history.branchUuid} SET lock_time='2026-11-06 00:00:00' WHERE id=2`,ticket:"UPDATE projects SET g_ticket=2"};
  for(const[name,sql]of Object.entries(mutations)){const path=join(dirname(f.path),`${name}.eprj2`);await copyFile(f.path,path);
  const db=new DatabaseSync(path,{enableForeignKeyConstraints:false});try{db.exec(sql);}finally{db.close();}await assert.rejects(compare(f.before,await inventory(path),f.body,f.history,f.structure),/GENERATED_PROJECT_CLOSED_SQL/u);}
  await assert.rejects(compare(f.before,f.after,`${f.body}changed`,f.history,f.structure),/SCOPE/u);await assert.rejects(compare(f.before,f.after,f.body,{...f.history,keyHex:"9".repeat(32)},f.structure));
});
void test("effect getters/proxies and unrelated callback windows cannot become observation data",async()=>{const f=await fixture("mutable");let calls=0;
  const hook=():never=>{calls+=1;throw new Error("caller callback");};
  const getter=Object.defineProperty({...f.history},"dataBase64",{get:hook,enumerable:true});await assert.rejects(compare(f.before,f.after,f.body,getter,f.structure));await assert.rejects(compare(f.before,f.after,f.body,new Proxy(f.history,{getPrototypeOf:hook}),f.structure));assert.equal(calls,0);
  const callbacks=f.history.nativeCallbacks.map(value=>({...value,beforeEpochMs:value.beforeEpochMs+600_000,afterEpochMs:value.afterEpochMs+600_000}));await assert.rejects(compare(f.before,f.after,f.body,{...f.history,nativeCallbacks:callbacks},f.structure),/NATIVE_UTC_DEFAULTS/u);
});
