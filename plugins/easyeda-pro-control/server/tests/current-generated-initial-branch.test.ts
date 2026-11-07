/* oxlint-disable import/max-dependencies -- Compare complete genuine SQL to actual pinned worker and main methods on an inert graph. */
/** Complete genuine synthetic SQL plus pinned MC/te/Q on inert objects.
 * No owner, application, native clock or continuation is allocated. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext, runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_GENERATED_INITIAL_BRANCH_SOURCE as SOURCE, qualifyCurrentGeneratedInitialBranchSource } from "../src/current-generated-initial-branch-source.ts";
import type { CurrentGeneratedInitialBranchData } from "../src/current-generated-initial-branch-plan.ts";
import { prepareCurrentGeneratedInitialBranchDataPlan } from "../src/current-generated-initial-branch-plan.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";
import type { NativeSqlInventory, SqlCell } from "../src/sqlite-inventory-core.ts";

function cell(value: SqlCell | undefined): string | number | null { assert.ok(value !== undefined); if(value.kind==="null"){return null;}if(value.kind==="integer"){return Number(value.decimal);}assert.equal(value.kind,"text");assert.ok(value.kind==="text");return Buffer.from(value.hex,"hex").toString("utf8"); }
function rows(inventory: NativeSqlInventory,name: string): readonly Record<string,string|number|null>[] { const table=inventory.tables.find(value=>value.name===name);assert.ok(table!==undefined);return table.rows.map(row=>Object.fromEntries(table.columns.map((column,index)=>[String(column["name"]),cell(row.cells[index])]))); }
async function deriver(): Promise<(qualification: unknown, history: string) => CurrentGeneratedInitialBranchData> {
  const url=new URL("../src/current-generated-initial-branch-plan.ts",import.meta.url); const loaded={exports:{} as Record<string,unknown>};
  const source=`${await readFile(url,"utf8")}\nexport {deriveInitialBranchData};`; const compiled=await transform(source,{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});
  const evaluate: unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");Reflect.apply(evaluate,undefined,[createRequire(url),loaded,loaded.exports]);
  const derive=loaded.exports["deriveInitialBranchData"];assert.ok(typeof derive==="function");return(qualification,history)=>{const value:unknown=Reflect.apply(derive,undefined,[qualification,history]);assert.ok(value!==null&&typeof value==="object"&&"data"in value);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The unchanged production pure derivation is exposed only inside this explicit inert VM seam.
    return value.data as CurrentGeneratedInitialBranchData;};
}
const fakeDate = `class Date {constructor(value){if(value===undefined)this.epoch=NativeDate.parse("2026-11-06T12:00:00Z");else if(typeof value==="string")this.epoch=NativeDate.parse(value.replace(" ","T")+"Z")-input.offset*60000;else this.epoch=value;}getTime(){return this.epoch}getTimezoneOffset(){return-input.offset}date(){return new NativeDate(this.epoch+input.offset*60000)}getFullYear(){return this.date().getUTCFullYear()}getMonth(){return this.date().getUTCMonth()}getDate(){return this.date().getUTCDate()}getHours(){return this.date().getUTCHours()}getMinutes(){return this.date().getUTCMinutes()}getSeconds(){return this.date().getUTCSeconds()}getMilliseconds(){return this.date().getUTCMilliseconds()}}`;
function actualMc(input: Readonly<{ branches: readonly object[]; users: readonly object[]; projects: readonly object[]; history: string; branch: string; project: string; offset: number }>): Promise<unknown> {
  const expression=`(async()=>{const input=${JSON.stringify(input)},NativeDate=globalThis.Date;${fakeDate}
var ${SOURCE.Q.source};var ${SOURCE.Jr.source};var ${SOURCE.d.source};var ${SOURCE.gt.source};var ${SOURCE.fe.source};var ${SOURCE.dt.source};${SOURCE.te.source};${SOURCE.MC.source};
const selected=input.branches.find(row=>row.uuid===input.branch),parent=input.branches.find(row=>row.uuid===selected.parent_uuid),creator=input.users.find(row=>row.uuid===selected.creator_uuid),modifier=input.users.find(row=>row.uuid===selected.modifier_uuid),project=input.projects[0],calls=[];
const y=async()=>({queryAll:async(...args)=>{const projection=args.find(arg=>arg.PROJECTION)?.PROJECTION;if(!projection)throw Error("projection");calls.push("all");const row={};for(const col of projection){const source=col.alias==="parent_"?parent:col.alias==="creator_"?creator:col.alias==="modifier_"?modifier:col.tbSymbol.description==="projects"?project:selected;row[col.alias+col.name]=source?.[col.name]??null;}return[row];},queryOne:async(...args)=>{calls.push("one");const eq=args.find(arg=>arg.EQ)?.EQ;if(!eq||eq[1].value!==input.history)throw Error("history");return{id:1};}});
const Or=async(_ctx,_path,branch)=>{if(branch!==input.branch)throw Error("branch");return new Q("project_history_"+branch,{id:1,uuid:"string"})};
const result=await MC({logger:{error(){throw Error("source error")}}},"private-selected-path",input.project,input.branch);return{body:JSON.stringify(result[0]),calls};})()`;
  const value:unknown=runInNewContext(expression);assert.ok(types.isPromise(value));return Promise.resolve(value);
}
void test("genuine initial branch data matches exact original MC projection, joins, order and local-offset candidate",async()=>{
  const derive=await deriver();
  for(const schematic of[false,true]){const input=schematic?await managedSchematicFixtureInitialSqlFixture():await managedFixtureInitialSqlFixture(),qualified=schematic?await qualifyGeneratedSchematicFixtureInitialSql(input):await qualifyGeneratedFixtureInitialSql(input);
    const data=derive(qualified.qualification,qualified.history.headHistoryUuid);
    const actual=await actualMc({branches:rows(input.inventory,"branches"),users:rows(input.inventory,"users"),projects:rows(input.inventory,"projects"),history:data.historyUuid,branch:data.branchUuid,project:data.projectUuid,offset:qualified.qualification.nativeLocalOffsetMinutes});
    assert.ok(actual!==null&&typeof actual==="object");assert.equal(Reflect.get(actual,"body"),data.body);assert.equal(JSON.stringify(Reflect.get(actual,"calls")),JSON.stringify(["all","one"]));assert.equal(data.writerClockAuthority,false);assert.equal(data.nativeCurrentTimezoneVerified,false);assert.equal(data.continuationAuthorized,false);
    const drift=await actualMc({branches:rows(input.inventory,"branches"),users:rows(input.inventory,"users"),projects:rows(input.inventory,"projects"),history:data.historyUuid,branch:data.branchUuid,project:data.projectUuid,offset:qualified.qualification.nativeLocalOffsetMinutes+60});assert.ok(drift!==null&&typeof drift==="object");assert.notEqual(Reflect.get(drift,"body"),data.body);
    assert.throws(()=>derive(structuredClone(qualified.qualification),qualified.history.headHistoryUuid));assert.throws(()=>derive(qualified.qualification,"0".repeat(32)));
  }
});
void test("complete installed source qualifies; serialized checkpoints cannot issue a branch continuation data plan",async()=>{
  const worker=await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js","utf8"); const main=await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/app.js","utf8");qualifyCurrentGeneratedInitialBranchSource(worker,main);
  assert.throws(()=>Reflect.apply(prepareCurrentGeneratedInitialBranchDataPlan,undefined,[{profile:"easyeda-pro-control.generated-fixture-open-checkpoint.v1"},{profile:"private.current-generated-initial-flow-cache-plan.v1"}]));
});
