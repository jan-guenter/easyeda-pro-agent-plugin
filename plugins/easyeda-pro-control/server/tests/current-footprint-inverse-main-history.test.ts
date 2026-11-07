/** Actual fixed programs and production cursor custody on inert data only.
 * No vendor function invocation, database, native helper or live grant exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-main-history-programs.ts";
import { currentFootprintInverseMainHistoryNativeCases, validateCurrentFootprintInverseMainHistoryCommand } from "../src/current-footprint-inverse-main-history-protocol.ts";
import { currentFootprintInverseMainHistoryWire } from "../src/current-footprint-inverse-main-history-wire.ts";

function observe(scenario: "positive" | "proxy-row" | "getter-row" | "foreign-db" | "drift" | "promise-drift" | "owner-drift"): unknown {
  return runInNewContext(`(()=>{let getters=0,applications=0;const forbidden=()=>{applications++;throw Error("application")};class SqlWrap{}class Sql{}class Database{}class Statement{};const sqlite={Database,Statement},util={types:{isProxy}},path="synthetic-original-selected",db=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(db,"filename",{value:path});Object.assign(wrap,{db});Object.assign(sql,{path,db,dbWrap:wrap,transactionDepth:0});const frame=[SqlWrap,Sql,sqlite,util],capture=[frame,SqlWrap,Sql,sqlite,util,[],isProxy,path,new Map,Date,Date.now],prior=[null,sql,Sql.prototype,db,wrap,SqlWrap.prototype,forbidden];
const row={id:2,uuid:"c".repeat(32),parent:"d".repeat(32),key:"e".repeat(32),is_lock:0,num:0,snapshot_num:0,created_at:"2026-11-07 01:02:03",updated_at:"2026-11-07 01:02:04",lock_time:"1970-01-01 08:00:00",iv:"c".repeat(32)};
const rows=[{...row,id:3,uuid:"1".repeat(32),num:3,is_lock:1}, {...row,id:2,uuid:"2".repeat(32),num:7},scenario==="proxy-row"?new Proxy(row,{getOwnPropertyDescriptor(){getters++;throw Error("proxy trap")},getPrototypeOf(){getters++;throw Error("proxy trap")}}):row];
if(scenario==="getter-row")Object.defineProperty(row,"key",{enumerable:true,get(){getters++;return"e".repeat(32)}});

const request={},response=()=>{},requestFrame=[null,request,response,sqlite,util,null,null],requestCapture=[requestFrame,capture,request,null,null,null,null,null,null],ctx={projectUuid:"a".repeat(64),req:request,res:response,db:{[path]:Promise.resolve(sql)}};
let selected=sql;if(scenario==="foreign-db"){const other=new Sql;Object.assign(other,{path,db:sql.db,dbWrap:wrap,transactionDepth:0});selected=other;}
const scoped=[ctx,path,{historyUuid:"c".repeat(32),branchUuid:"b".repeat(32)},selected,[{uuid:"b".repeat(32),node:0}],rows,forbidden,forbidden,forbidden];let refused=false,value=null,stage="capture";
try{const captured=Reflect.apply(eval("("+programs.capture.program+")"),scoped,[capture,requestCapture]);stage="resolved";Reflect.apply(eval("("+programs.resolved.program+")"),captured,[sql]);stage="value";if(scenario==="drift")row.created_at="2026-11-07 01:02:05";if(scenario==="promise-drift")ctx.db[path]=Promise.resolve(sql);if(scenario==="owner-drift"){const other=new Sql;Object.assign(other,{path,db,dbWrap:wrap,transactionDepth:0});scoped[3]=other;}value=Reflect.apply(eval("("+programs.value.program+")"),captured,[]);}catch{refused=true;}return{refused,value,getters,applications,stage};})()`, { programs: PROGRAMS, isProxy: types.isProxy, scenario });
}
void test("inverse fixed read retains complete saved multi-head rows and timestamp strings without sampling or predicting them", () => {
  const raw: unknown = structuredClone(observe("positive")); assert.ok(raw !== null && typeof raw === "object");
  assert.equal(Reflect.get(raw, "refused"), false, JSON.stringify(raw)); assert.equal(Reflect.get(raw, "applications"), 0); assert.equal(Reflect.get(raw, "getters"), 0);
  const value: unknown = Reflect.get(raw, "value"); assert.ok(value !== null && typeof value === "object"); const rows: unknown = Reflect.get(value, "rows"); assert.ok(Array.isArray(rows));
  assert.equal(rows.length, 3); assert.equal(Reflect.get(rows[0], "num"), 3); assert.equal(Reflect.get(rows[1], "num"), 7);
  assert.equal(Reflect.get(rows[0], "created_at"), "2026-11-07 01:02:03"); assert.equal(Reflect.get(rows[0], "updated_at"), "2026-11-07 01:02:04");
});
void test("Proxy/accessor rows, another connection at the same path and held-row drift refuse without application calls", () => {
  for (const scenario of ["proxy-row", "getter-row", "foreign-db", "drift", "promise-drift", "owner-drift"] as const) {
    const raw: unknown = structuredClone(observe(scenario)); assert.ok(raw !== null && typeof raw === "object");
    assert.equal(Reflect.get(raw, "refused"), true, scenario); assert.equal(Reflect.get(raw, "applications"), 0); assert.equal(Reflect.get(raw, "getters"), 0);
  }
});
void test("all thirteen fixed native selectors reject caller SQL, timestamp, program and target additions", () => {
  const cases = currentFootprintInverseMainHistoryNativeCases(); assert.equal(cases.length, 13);
  for (const input of cases) {
    const command = validateCurrentFootprintInverseMainHistoryCommand(input), wire = currentFootprintInverseMainHistoryWire(command, 17); assert.equal(wire["action"], "footprint-inverse-main-history");
    assert.throws(() => validateCurrentFootprintInverseMainHistoryCommand({ ...input, timestamp: 1 }));
    assert.throws(() => validateCurrentFootprintInverseMainHistoryCommand({ ...input, params: { ...input.params, sql: "select * from projects" } }));
  }
  const join = cases.find(value => value.phase === "inverse-main-history-join"); assert.ok(join !== undefined); assert.throws(() => validateCurrentFootprintInverseMainHistoryCommand({ ...join, params: { ...join.params, functionDeclaration: "function(){return []}" } }));
});
