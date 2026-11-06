/** Actual fixed programs and production cursor custody on inert data only.
 * No vendor function invocation, database, native helper or live grant exists. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_PROGRAMS as PROGRAMS } from "../src/current-pcb-via-main-live-history-programs.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "../src/current-pcb-via-main-live-history-source.ts";
import { currentPcbViaMainLiveHistoryNativeCases, validateCurrentPcbViaMainLiveHistoryCommand } from "../src/current-pcb-via-main-live-history-protocol.ts";
import { currentPcbViaMainLiveHistoryWire } from "../src/current-pcb-via-main-live-history-wire.ts";

function observe(scenario: "positive" | "proxy-row" | "getter-row" | "foreign-db" | "drift"): unknown {
  return runInNewContext(`(()=>{let getters=0,applications=0;const forbidden=()=>{applications++;throw Error("application")};class SqlWrap{}class Sql{}class Database{}class Statement{};const sqlite={Database,Statement},util={types:{isProxy}},path="synthetic-original-selected",db=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(db,"filename",{value:path});Object.assign(wrap,{db});Object.assign(sql,{path,db,dbWrap:wrap,transactionDepth:0});const frame=[SqlWrap,Sql,sqlite,util],capture=[frame,SqlWrap,Sql,sqlite,util,[],isProxy,path,new Map,Date,Date.now],prior=[null,sql,Sql.prototype,db,wrap,SqlWrap.prototype,forbidden];
const row={id:2,uuid:"c".repeat(32),parent:"d".repeat(32),key:"e".repeat(32),is_lock:0,num:0,snapshot_num:0,created_at:"2026-11-07 01:02:03",updated_at:"2026-11-07 01:02:04",lock_time:"1970-01-01 08:00:00",iv:"c".repeat(32)};
if(scenario==="getter-row")Object.defineProperty(row,"key",{enumerable:true,get(){getters++;return"e".repeat(32)}});
const rows=[scenario==="proxy-row"?new Proxy(row,{getOwnPropertyDescriptor(){getters++;throw Error("proxy trap")},getPrototypeOf(){getters++;throw Error("proxy trap")}}):row];
if(scenario==="foreign-db"){const foreign=new Database;Object.defineProperty(foreign,"filename",{value:path});sql.db=foreign;wrap.db=foreign;}
const scoped=[{projectUuid:"a".repeat(64)},path,{historyUuid:"c".repeat(32),branchUuid:"b".repeat(32)},sql,[{uuid:"b".repeat(32),node:0}],rows,forbidden,forbidden,forbidden];let refused=false,value=null;
try{const captured=Reflect.apply(eval("("+programs.capture.program+")"),scoped,[capture,prior]);if(scenario==="drift")row.created_at="2026-11-07 01:02:05";value=Reflect.apply(eval("("+programs.value.program+")"),captured,[]);}catch{refused=true;}return{refused,value,getters,applications};})()`, { programs: PROGRAMS, isProxy: types.isProxy, scenario });
}
void test("actual fixed read retains source SQLite timestamp strings without sampling or predicting them", () => {
  const raw: unknown = structuredClone(observe("positive")); assert.ok(raw !== null && typeof raw === "object");
  assert.equal(Reflect.get(raw, "refused"), false); assert.equal(Reflect.get(raw, "applications"), 0); assert.equal(Reflect.get(raw, "getters"), 0);
  const value: unknown = Reflect.get(raw, "value"); assert.ok(value !== null && typeof value === "object"); const rows: unknown = Reflect.get(value, "rows"); assert.ok(Array.isArray(rows));
  assert.equal(Reflect.get(rows[0], "created_at"), "2026-11-07 01:02:03"); assert.equal(Reflect.get(rows[0], "updated_at"), "2026-11-07 01:02:04");
});
void test("Proxy/accessor rows, another connection at the same path and held-row drift refuse without application calls", () => {
  for (const scenario of ["proxy-row", "getter-row", "foreign-db", "drift"] as const) {
    const raw: unknown = structuredClone(observe(scenario)); assert.ok(raw !== null && typeof raw === "object");
    assert.equal(Reflect.get(raw, "refused"), true, scenario); assert.equal(Reflect.get(raw, "applications"), 0); assert.equal(Reflect.get(raw, "getters"), 0);
  }
});
void test("pinned yB syntax has the exact post-sort return pause without running application code", async () => {
  const inspector = new Session(); inspector.connect();
  try {
    await inspector.post("Runtime.enable"); await inspector.post("Debugger.enable");
    const source = "\n".repeat(SITE.lineNumber) + " ".repeat(23_256) + SOURCE.yB.source;
    const compiled = await inspector.post("Runtime.compileScript", { expression: source, sourceURL: "inert-via-yb-syntax-only.js", persistScript: true }); assert.ok(compiled.scriptId !== undefined);
    const result = await inspector.post("Debugger.getPossibleBreakpoints", { start: { scriptId: compiled.scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber }, end: { scriptId: compiled.scriptId, lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber + 1 } });
    assert.ok(result.locations.some(point => point.lineNumber === SITE.lineNumber && point.columnNumber === SITE.columnNumber));
    assert.equal(SOURCE.yB.source.at(-2), "a");
  } finally { inspector.disconnect(); }
});
void test("all eleven fixed native selectors reject caller SQL, timestamp, program and target additions", () => {
  const cases = currentPcbViaMainLiveHistoryNativeCases(); assert.equal(cases.length, 11);
  for (const input of cases) {
    const command = validateCurrentPcbViaMainLiveHistoryCommand(input), wire = currentPcbViaMainLiveHistoryWire(command, 17); assert.equal(wire["action"], "pcb-via-main-live-history");
    assert.throws(() => validateCurrentPcbViaMainLiveHistoryCommand({ ...input, timestamp: 1 }));
    assert.throws(() => validateCurrentPcbViaMainLiveHistoryCommand({ ...input, params: { ...input.params, sql: "select * from projects" } }));
  }
  const join = cases.find(value => value.phase === "via-main-live-join"); assert.ok(join !== undefined); assert.throws(() => validateCurrentPcbViaMainLiveHistoryCommand({ ...join, params: { ...join.params, functionDeclaration: "function(){return []}" } }));
});

