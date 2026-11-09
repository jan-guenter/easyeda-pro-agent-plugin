/** Actual fixed programs in a separate realm. SQLite shapes are inert test
 * peers; no app/native owner or write authority is issued by this fixture. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CLASSIFY, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as EXPRESSIONS } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as CALLS } from "../src/current-main-startup-config-programs.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_SQL as SQL } from "../src/current-main-startup-config-sql.ts";
import { CurrentMainStartupConfigProgress, currentMainStartupConfigSelectionSchema } from "../src/current-main-startup-config-progress.ts";

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ nativeProxy: types.isProxy, jbScript: SQL.scripts.jb.map(row => row.sql).join("\n\n"), dcScript: SQL.scripts.dc.map(row => row.sql).join("\n\n") });
  runInContext(String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("application/native call");};
class Z2{constructor(db){this.db=db;}}class Yo{constructor(path,db){this.path=path;this.db=db;this.dbWrap=new Z2(db);this.transactionDepth=0;}}
const F5={types:{isProxy:nativeProxy}},sc={Database:Map,Statement:Set},documents="C:\\Synthetic\\Documents",root=documents+"\\EasyEDA-Pro",directory=root+"\\database",path=directory+"\\web.db";
const db=()=>{const value=new Map;Object.defineProperty(value,"filename",{value:path});return value;},init=new Yo(path,db()),jb=new Yo(path,db()),dc=new Yo(path,db());
const row={key:"sqlite",value:"25.10.31.1"},frame=[path,init.db,init,row,path,documents,root,directory,"EasyEDA-Pro",sc,F5,Date,Date.now];
const capture=(${CAPTURE}).call([Z2,Yo,sc,F5],"C:\\Synthetic\\selected.eprj2");
let tracker,sql="",params=[],statement=null;const resolve=()=>{},reject=()=>{};
const jbFrame=[jb,{},path,documents,root,directory,"EasyEDA-Pro",jbScript,sc,F5,Date,Date.now],dcFrame=[dc,path,documents,root,directory,"EasyEDA-Pro",dcScript,sc,F5,Date,Date.now];`, context);
  return context;
}
function version(context: ReturnType<typeof createContext>): void { runInContext(`tracker=(${CALLS.version}).call(frame,capture)`, context); }
function bind(context: ReturnType<typeof createContext>, role: "jb" | "dc"): void { runInContext(`(${role === "jb" ? CALLS.bindJB : CALLS.bindDC}).call(${role}Frame,tracker)`, context); }
function select(context: ReturnType<typeof createContext>, role: "jb" | "dc", site: "run" | "prepare" | "prepared" | "statementRun", sql: string): unknown {
  runInContext(`sql=${JSON.stringify(sql)};`, context);
  let frame = `[${role}.dbWrap,statement,params,sc,F5]`;
  if (site === "run") { frame = `[${role}.dbWrap,sql,params,sc,F5]`; }
  else if (site === "prepare") { frame = `[${role}.dbWrap,sql,resolve,reject,sc,F5]`; }
  else if (site === "prepared") { frame = `[${role}.dbWrap,sql,resolve,reject,statement,sc,F5]`; }
  return runInContext(`(${CALLS.select}).call(${frame},tracker,${JSON.stringify(site)})`, context);
}
function accept(progress: CurrentMainStartupConfigProgress, value: unknown): void { const captured = currentMainStartupConfigSelectionSchema.parse(structuredClone(value)); assert.equal(progress.consume(captured), true); }
void test("path-derived startup names still pass the unchanged original tracker and reject another app root", () => {
  const context = fixture();
  runInContext(`function versionRaw(Je){const t=path,a=init.db,o=init,A=row,_=path,nl=documents,A2=directory;return ${EXPRESSIONS.startupVersion};}
    function jbRaw(){const e=jb,r={},_=path,nl=documents,Je=root,A2=directory,h6=jbScript;return ${EXPRESSIONS.startupJB};}
    function dcRaw(){const t=dc,_=path,nl=documents,Je=root,A2=directory,KB=dcScript;return ${EXPRESSIONS.startupDC};}
    function classified(raw,site){return (${CLASSIFY}).call(raw,capture,site);}
    tracker=(${CALLS.version}).call(classified(versionRaw(root),"startupVersion"),capture);
    (${CALLS.bindJB}).call(classified(jbRaw(),"startupJB"),tracker);
    (${CALLS.bindDC}).call(classified(dcRaw(),"startupDC"),tracker);`, context);
  assert.equal(runInContext("typeof lc", context), "undefined");
  assert.throws(() => runInContext(`(${CALLS.version}).call(classified(versionRaw(documents+"\\\\LCEDA-Pro"),"startupVersion"),capture)`, context));
  assert.equal(runInContext("calls", context), 0);
});
void test("actual retained profile frames admit only the complete ordered startup sequence and retain the actual prepared statement", () => {
  const context = fixture(), progress = new CurrentMainStartupConfigProgress(); version(context); progress.version(); bind(context, "jb"); progress.bind("jb");
  runInContext("jb.transactionDepth=1", context); accept(progress, select(context, "jb", "run", SQL.transaction.begin));
  for (const row of SQL.scripts.jb) { accept(progress, select(context, "jb", "run", row.sql)); }
  accept(progress, select(context, "jb", "run", `${SQL.broadcastDeletePrefix}1793920000000`));
  runInContext("jb.transactionDepth=0", context); accept(progress, select(context, "jb", "run", SQL.transaction.commit)); bind(context, "dc"); progress.bind("dc");
  for (const row of SQL.scripts.dc) { accept(progress, select(context, "dc", "run", row.sql)); }
  accept(progress, select(context, "dc", "run", `${SQL.cookieDeletePrefix}1793920000.25`)); accept(progress, select(context, "dc", "prepare", SQL.cookieUpsert));
  runInContext('statement=new Set;Object.defineProperty(statement,"sql",{value:sql});', context); accept(progress, select(context, "dc", "prepared", SQL.cookieUpsert)); progress.complete();
  runInContext('params=["https","example.invalid","name","private-cookie-value",1793920000,1,"private-cookie-value",1793920000,1];', context);
  const update = select(context, "dc", "statementRun", SQL.cookieUpsert); assert.equal(JSON.stringify(update).includes("private-cookie-value"), false);
  const captured = currentMainStartupConfigSelectionSchema.parse(structuredClone(update)); assert.throws(() => { progress.consume(captured); });
  assert.equal(runInContext("calls", context), 0); assert.equal(progress.snapshot()["selectedProjectWriteGrant"], false);
});
void test("actual source tracker refuses unknown/migrating version, path/export drift, changed source and replay without application calls", () => {
  for (const mutation of ['row.value="0.0.0"', String.raw`frame[4]="C:\\foreign\\web.db"`, 'frame[11]=function Date(){}', 'Object.defineProperty(row,"value",{get:forbidden})', 'frame[3]=new Proxy(row,{getOwnPropertyDescriptor:forbidden})']) {
    const context = fixture(); runInContext(mutation, context); assert.throws(() => { version(context); }); assert.equal(runInContext("calls", context), 0);
  }
  for (const mutation of [String.raw`jbFrame[7]+="\n\nDROP TABLE projects"`, 'jbFrame[0]=dc', 'sc.Database=WeakMap', 'Date.now=forbidden']) {
    const context = fixture(); version(context); runInContext(mutation, context);
    if (mutation === "jbFrame[0]=dc") { bind(context, "jb"); }
    assert.throws(() => { bind(context, "jb"); });
    assert.equal(runInContext("calls", context), 0);
  }
});
void test("same SQL on another native handle is not the retained config origin and same SQL cannot recreate the actual prepare return", () => {
  const context = fixture(); version(context); bind(context, "jb");
  runInContext('const foreign=new Yo(path,db());params=[];', context);
  const foreign: unknown = runInContext(`(${CALLS.select}).call([foreign.dbWrap,${JSON.stringify(SQL.transaction.begin)},params,sc,F5],tracker,"run")`, context);
  assert.equal(JSON.stringify(foreign), '{"recognized":false}'); bind(context, "dc"); select(context, "dc", "prepare", SQL.cookieUpsert);
  runInContext('statement=new Set;Object.defineProperty(statement,"sql",{value:sql});const replaced=()=>{};', context);
  assert.throws(() => runInContext(`(${CALLS.select}).call([dc.dbWrap,sql,replaced,reject,statement,sc,F5],tracker,"prepared")`, context));
  assert.doesNotThrow(() => { select(context, "dc", "prepared", SQL.cookieUpsert); });
  runInContext('statement=new Set;Object.defineProperty(statement,"sql",{value:sql});', context);
  assert.throws(() => { select(context, "dc", "statementRun", SQL.cookieUpsert); }); assert.equal(runInContext("calls", context), 0);
});
void test("sequence refuses skipping, duplicate SQL, rollback, wrong transaction depth and a cookie execution grant", () => {
  for (const [sql, depth] of [[SQL.scripts.jb[0]?.sql, 1], [SQL.transaction.begin, 0], [SQL.transaction.rollback, 1]] as const) {
    assert.ok(sql !== undefined); const progress = new CurrentMainStartupConfigProgress(); progress.version(); progress.bind("jb");
    assert.throws(() => { progress.consume({ recognized: true, role: "jb", site: "run", sql, parametersEmpty: true, transactionDepth: depth, designWriteGrant: false, nativeCompletionProven: false }); });
  }
  const progress = new CurrentMainStartupConfigProgress(); progress.version(); assert.throws(() => { progress.bind("dc"); }); assert.throws(() => { progress.complete(); });
});
