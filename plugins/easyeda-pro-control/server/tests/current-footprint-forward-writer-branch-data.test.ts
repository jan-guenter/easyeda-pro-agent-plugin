/** Complete isolated SQL inventory and inert API values; no native receipt. */
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { compareCurrentFootprintForwardWriterPostBranchData } from "../src/current-footprint-forward-writer-post-branch-data.ts";
import { compareCurrentFootprintForwardWriterBranchData } from "../src/current-footprint-forward-writer-branch-data.ts";
import { inventory } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

const ACTOR="d".repeat(32), BRANCH="b".repeat(32), HISTORY="c".repeat(32), PROJECT="a".repeat(64);
async function fixture():Promise<Readonly<{before:Awaited<ReturnType<typeof inventory>>;row:Readonly<Record<string,string|number|boolean|null>>}>>{
 const root=await mkdtemp(join(syntheticSqlRoot(),"full-branch-")); const path=join(root,"source.eprj2"); const db=new DatabaseSync(path);
 try{
  db.exec(`CREATE TABLE projects(uuid TEXT,branch_uuid TEXT);CREATE TABLE branches(uuid TEXT,project_uuid TEXT,history_uuid TEXT,name TEXT,node INTEGER,delete_status INTEGER,description TEXT,parent_uuid TEXT,creator_uuid TEXT,modifier_uuid TEXT,created_at TEXT,updated_at TEXT);CREATE TABLE users(uuid TEXT,nickname TEXT);CREATE TABLE project_history_${BRANCH}(id INTEGER,uuid TEXT);`);
  db.prepare("INSERT INTO projects VALUES(?,?)").run(PROJECT,BRANCH);db.prepare("INSERT INTO users VALUES(?,?)").run(ACTOR,"Synthetic");
  db.prepare("INSERT INTO branches VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").run(BRANCH,PROJECT,HISTORY,"disposable",0,0,"",null,ACTOR,ACTOR,"2026-11-14 10:00:00","2026-11-14 10:01:00");db.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?)`).run(1,HISTORY);
 }finally{db.close()}
 const row={uuid:BRANCH,delete_status:0,name:"disposable",project_uuid:PROJECT,branch_uuid:BRANCH,history_uuid:HISTORY,description:"",node:false,created_at:"2026-11-14 11:00:00",updated_at:"2026-11-14 11:01:00",parent_uuid:null,parent_name:null,creator_nickname:"Synthetic",creator_uuid:ACTOR,modifier_nickname:"Synthetic",default:true,project_histories_id:1};return{before:await inventory(path),row};
}
void test("actual branch dates must share one observed SQL normalization, with all peers and field order preserved",async()=>{
 const {before,row}=await fixture(),body=JSON.stringify(row),value=compareCurrentFootprintForwardWriterBranchData(before,PROJECT,BRANCH,body);assert.equal(value.body,body);assert.equal(value.observedLocalOffsetMinutes,60);assert.equal(value.writerClockAuthority,false);assert.ok(Object.isFrozen(value));
 for(const changed of [{...row,updated_at:"2026-11-14 11:02:00"},{...row,creator_nickname:"Other"},{...row,history_uuid:"e".repeat(32)},{...row,extra:true},{...row,node:true},{...row,project_histories_id:2},Object.fromEntries(Object.entries(row).toReversed())]){assert.throws(()=>compareCurrentFootprintForwardWriterBranchData(before,PROJECT,BRANCH,JSON.stringify(changed)))}
});

void test("post branch preserves all original bytes except actual completed history and observed native id",async()=>{
 const {before,row}=await fixture();const original=compareCurrentFootprintForwardWriterBranchData(before,PROJECT,BRANCH,JSON.stringify(row));const historyUuid="e".repeat(32);const changed={...row,history_uuid:historyUuid,project_histories_id:37};
 const observed=compareCurrentFootprintForwardWriterPostBranchData(original,historyUuid,JSON.stringify(changed));assert.equal(observed.historyUuid,historyUuid);assert.equal(observed.observedLocalOffsetMinutes,60);assert.equal(observed.writerClockAuthority,false);
 for(const other of [{...changed,name:"collateral"},{...changed,created_at:"2026-11-14 12:00:00"},{...changed,extra:true},{...changed,project_histories_id:1},{...changed,history_uuid:HISTORY}]){assert.throws(()=>compareCurrentFootprintForwardWriterPostBranchData(original,historyUuid,JSON.stringify(other)))}
 assert.throws(()=>compareCurrentFootprintForwardWriterPostBranchData({...original,sha256:"0".repeat(64)},historyUuid,JSON.stringify(changed)));assert.throws(()=>compareCurrentFootprintForwardWriterPostBranchData(original,HISTORY,JSON.stringify(changed)));
});
