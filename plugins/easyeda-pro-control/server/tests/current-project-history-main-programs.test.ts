/* oxlint-disable import/max-dependencies -- Compare fixed legacy/captured joins with genuine capture and independent source/crypto verification in the same inert fixture. */
/** Source/crypto joins on synthetic objects only. No SQL, app, original native
 * owner or write grant is supplied by this isolated fixture. */
import assert from "node:assert/strict";
import { verifyViaBookkeepingInspector } from "./helpers/via-main-bookkeeping-inspector.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { createCipheriv } from "node:crypto";
import { test } from "node:test";
import { types } from "node:util";
import vm from "node:vm";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as INITIAL } from "../src/current-footprint-copy-main-completion-programs.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_BOOKKEEPING as BOOKKEEPING, CURRENT_PCB_VIA_MAIN_HISTORY_REBASE as REBASE } from "../src/current-pcb-via-main-captured-rebase.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as PROGRAMS } from "../src/current-project-history-main-programs.ts";
import { CURRENT_PROJECT_HISTORY_SQL as SQL, currentProjectSelectedHistorySql } from "../src/current-project-history-sql-data.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";

let fixtureNumber = 0;
function cryptoValue(value: object): Readonly<{ historyUuid: string; keyHex: string; cipherHex: string }> {
  const historyUuid: unknown = Reflect.get(value, "historyUuid"); const keyHex: unknown = Reflect.get(value, "keyHex"); const parts: unknown = Reflect.get(value, "cipherHexParts");
  assert.ok(typeof historyUuid === "string" && typeof keyHex === "string" && Array.isArray(parts));
  const cipherHex = parts.map((part: unknown): string => { assert.ok(typeof part === "string" && part.length <= 8192); return part; }).join(""); return { historyUuid, keyHex, cipherHex };
}
/** Exercise unchanged consumers and their captured-frame partners on one
 * inert graph using the genuine maintained capture program and fixed sources. */
function fixture(mode: "append" | "mutable", scenario: "positive" | "getter-head" | "wrong-params" | "foreign-resolver" | "busy" | "bad-cipher" | "inherited-field-setter" | "inherited-field-readonly", captured = false): vm.Context {
  fixtureNumber += 1; const inspectorName = `inert-via-history-${String(fixtureNumber)}`;
  const context = vm.createContext({ captureProgram: CAPTURE, mode, scenario, captured, bookkeeping: BOOKKEEPING, rebase: REBASE, programs: PROGRAMS, initial: INITIAL, sqlText: SQL, headSql: currentProjectSelectedHistorySql("b".repeat(32), mode), isProxy: types.isProxy,
    bytesFromHex: (hex: string): Buffer => Buffer.from(hex, "hex"),
    encrypt: (history: string, body: string, key: string): Buffer => {
      const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(history, "hex"));
      // oxlint-disable-next-line node/no-sync -- Deterministic in-memory fixture bytes, with the exact source's gzip level and native GCM framing.
      const compressed = gzipSync(Buffer.from(body), { level: 1 });
      const result = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]); if (scenario === "bad-cipher") { result[0] = ((result[0] ?? 0) + 1) % 256; } return result;
    },
  }, { name: inspectorName });
  context["inspectorName"] = inspectorName;
  vm.runInContext(`
"use strict";globalThis.inspectorCases=[];let calls=0,getters=0;const forbidden=()=>{calls++;throw Error("application method")};
const select=(role,receiver,args)=>{if(captured&&(role.startsWith("run")||role==="sqlCallback")){return Reflect.apply(eval("("+rebase[role].program+")"),receiver.slice(0,-1),role==="sqlCallback"?[capture,...args]:args)}const fixed=captured&&Object.hasOwn(bookkeeping,role)?bookkeeping[role]:programs[role];if(captured)globalThis.inspectorCases.push({role,receiver,args,program:fixed.program});return Reflect.apply(eval("("+fixed.program+")"),receiver,args)};
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),projectKey:"a".repeat(64),path:"synthetic-generated",dataStr:"worker-source"},ctx={db:{}},service={},owner={ctx,service,path:plan.path};
class Database{}class Statement{}class SqlWrap{}class Sql{queryOne(){forbidden()}}const sqlite={Database,Statement},util={types:{isProxy}},native=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(native,"filename",{value:plan.path});Object.assign(wrap,{db:native});Object.assign(sql,{path:plan.path,db:native,dbWrap:wrap,transactionDepth:0});
const modify={uuid:"c".repeat(32),username:"actor",nickname:"name",updateTime:1700000000123},promise=Promise.resolve(sql);ctx.db[plan.path]=promise;
const controller=[null,[null,null,null,null,null,ctx],plan,owner,service,plan.path,null,null,null,Date,Date.now,null],actor=[null,controller,null,{dataStr:plan.dataStr,modify},modify,null,promise,null,null,{...modify}],q=[actor,sql,Sql.prototype,native,wrap,SqlWrap.prototype,Sql.prototype.queryOne];
const captureFrame=[SqlWrap,Sql,sqlite,util],capture=Reflect.apply(eval("("+captureProgram+")"),captureFrame,[plan.path]);
const body=JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify(modify)+"|\\n"+plan.dataStr,input={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,dataStr:body},branch={node:0,uuid:plan.branchUuid,delete_status:0,history_uuid:"2".repeat(32)},head={num:0,uuid:branch.history_uuid,key:"1".repeat(32),is_lock:0,created_at:"2026-11-06 00:00:00",is_within_one_minute:mode==="append"?0:1};
if(scenario.startsWith("inherited"))Object.defineProperty(Object.prototype,"dataStr",scenario.endsWith("setter")?{set(){calls++},configurable:true}:{value:"blocked",writable:false,configurable:true});
if(scenario==="getter-head")Object.defineProperty(head,"key",{get(){getters++;return"1".repeat(32)},enumerable:true});
const initialSelect=(role,receiver,args)=>Reflect.apply(eval("("+initial[role].program+")"),receiver,args),callback=async()=>forbidden(),save=initialSelect("save",[service,ctx,plan.path,input],[actor,q]),tx=initialSelect("transaction-enter",[sql,callback],[save]);sql.transactionDepth=1;
const root=select("callback",[service,ctx,plan.path,input,branch],[tx]);let error=false,stage="branch",cipherValue=null;
try{const b=select("branch",[service,ctx,plan.path,input,branch,head],[root]);globalThis.branchValue=select("branchValue",b,[]);
 const writerArgs=[ctx,plan.path,input,branch,...(mode==="mutable"?[head]:[])],w=select("writer",writerArgs,[b]),history=mode==="append"?"3".repeat(32):head.uuid,key=mode==="append"?"4".repeat(32):head.key,chunk=mode==="append"?history:history+"-1",r=mode==="append"?{dataStr:body,uuid:history}:{dataStr:body,uuid:history,cnt:1,key};
 const writerCaller=mode==="append"?[ctx,plan.path,input,branch,history]:[ctx,plan.path,input,branch,head,history,1],entry=select("encryptEntry",[ctx,plan.path,r,true],[writerCaller,w]),encrypted=encrypt(history,body,key),cipher=select("cipher",[ctx,plan.path,r,true,bytesFromHex(key),encrypted],[entry,capture]);
 cipherValue=select("cipherValue",cipher,[capture]);globalThis.pending={b,w,history,key,chunk,cipher,encrypted,body,root,tx,sql,q,wrap,sqlite,util,ctx,plan,input,branch,head,service,owner,modify,callback,select,capture};
}catch{error=true;}globalThis.report={error,stage,cipherValue,calls,getters,body};
`, context);
  return context;
}
void test("both original head paths retain the actual cipher and decrypt to the exact EDIT_HEAD plus Save body", async () => {
  for (const captured of [false, true]) {
  for (const mode of ["append", "mutable"] as const) {
    const context = fixture(mode, "positive", captured), report: unknown = structuredClone(context["report"]); assert.ok(report !== null && typeof report === "object"); assert.equal(Reflect.get(report, "error"), false);
    const crypto: unknown = Reflect.get(report, "cipherValue"); assert.ok(crypto !== null && typeof crypto === "object");
    const { historyUuid, keyHex, cipherHex } = cryptoValue(crypto);
    assert.equal(await decodeNativeHistoryChunk({ historyUuid, keyHex, dataBase64: Buffer.from(cipherHex, "hex").toString("base64") }), Reflect.get(report, "body"));
    context["dataBase64"] = Buffer.from(cipherHex, "hex").toString("base64");
    vm.runInContext(`
{const p=pending,{sql,wrap,sqlite,util,ctx,plan,input,branch,head,history,key,chunk,cipher,encrypted,modify,callback,service,owner,select,capture}=p;
const table={},resolve=()=>forbidden(),reject=()=>forbidden(),time="2026-11-06 01:02:03",projectTable={};let lastProject=null,lastCallback=null;
const slots=[
 ["Data",sqlText.historyData,[chunk,history,dataBase64,dataBase64],[ctx,plan.path,encrypted,chunk,history,"",table,sql,chunk,dataBase64]],
 ["Head",headSql,mode==="append"?[history,head.uuid,null,key]:[1,history],mode==="append"?[ctx,plan.path,input,branch,history,key,table]:[ctx,plan.path,input,branch,head,history,1,table]],
 ["Branch",sqlText.branch,[history,plan.branchUuid],[ctx,plan.path,"project",plan.branchUuid,history,plan.projectUuid,sql,table]],
 ["Commit",sqlText.commit,[],[sql,callback]],
 ["Project",sqlText.project,[time,modify.uuid],[ctx,plan.path,plan.projectUuid,projectTable,Date,Date.now]]
];const observed=[];
for(const [kind,sqlString,params,caller]of slots){if(kind==="Commit")sql.transactionDepth=0;const run=select("run"+kind,[wrap,sqlString,params,resolve,reject,sqlite,util],[caller,cipher,capture]);const value=select("sqlValue",run,[]);const stmt=new Statement;Object.defineProperty(stmt,"sql",{value:sqlString});stmt.changes=1;stmt.lastID=2;
 const after=select("sqlCallback",[stmt,null,sqlString,params,resolve,reject,sqlite,util],[run]);observed.push(select("sqlCallbackValue",after,[]));lastCallback=after;if(kind==="Commit")select("commitReturned",[sql,0],[after]);if(kind==="Project")lastProject=run;}
const project=select("projectReturned",[ctx,plan.path,plan.projectUuid,projectTable],[lastProject]),saved=select("saveReturned",[service,ctx,plan.path,input,branch,history],[project]);ctx.body=history;
globalThis.completed={observed,value:select("controllerReturned",[owner,ctx,service,plan.path,input],[saved]),calls,getters};}
`, context);
    const completed: unknown = structuredClone(context["completed"]); assert.ok(completed !== null && typeof completed === "object"); assert.equal(Reflect.get(completed, "calls"), 0); assert.equal(Reflect.get(completed, "getters"), 0);
    assert.deepEqual(Reflect.get(completed, "value"), { historyUuid, originalServiceAwaitCompleted: true, controllerBodyJoined: true });
  }}
});
void test("head accessors and unauthentic ciphertext stop before any SQL source slot", async () => {
  const getter = fixture("append", "getter-head"), report: unknown = structuredClone(getter["report"]); assert.ok(report !== null && typeof report === "object"); assert.equal(Reflect.get(report, "error"), true); assert.equal(Reflect.get(report, "getters"), 0);
  const damaged = fixture("mutable", "bad-cipher"), value: unknown = structuredClone(damaged["report"]); assert.ok(value !== null && typeof value === "object");
  const crypto: unknown = Reflect.get(value, "cipherValue"); assert.ok(crypto !== null && typeof crypto === "object");
  const { historyUuid, keyHex, cipherHex } = cryptoValue(crypto);
  const dataBase64 = Buffer.from(cipherHex, "hex").toString("base64"); await assert.rejects(decodeNativeHistoryChunk({ historyUuid, keyHex, dataBase64 }));
});
void test("wrong native parameters, foreign resolvers and busy errors refuse before callback/retry invocation", () => {
  for (const scenario of ["wrong-params", "foreign-resolver", "busy"] as const) {
    const context = fixture("mutable", scenario);
    vm.runInContext(`
{const p=pending,params=[p.chunk,p.history,p.encrypted.toString("base64"),p.encrypted.toString("base64")],caller=[p.ctx,p.plan.path,p.encrypted,p.chunk,p.history,"",{},p.sql,p.chunk,params[2]],resolve=()=>forbidden(),reject=()=>forbidden();let refused=false,stage="run";
if(scenario==="wrong-params")[params[0],params[1]]=[params[1],params[0]];
try{const run=p.select("runData",[p.wrap,sqlText.historyData,params,resolve,reject,p.sqlite,p.util],[caller,p.cipher,p.capture]);stage="callback";const stmt=new Statement;Object.defineProperty(stmt,"sql",{value:sqlText.historyData});stmt.changes=1;stmt.lastID=2;
p.select("sqlCallback",[stmt,scenario==="busy"?{code:"SQLITE_BUSY"}:null,sqlText.historyData,params,scenario==="foreign-resolver"?()=>{}:resolve,reject,p.sqlite,p.util],[run]);}catch{refused=true;}globalThis.failure={refused,stage,calls,getters};}
`, context);
    const result: unknown = structuredClone(context["failure"]); assert.ok(result !== null && typeof result === "object"); assert.equal(Reflect.get(result, "refused"), true); assert.equal(Reflect.get(result, "stage"), scenario === "wrong-params" ? "run" : "callback");
    assert.equal(Reflect.get(result, "calls"), 0); assert.equal(Reflect.get(result, "getters"), 0);
  }
});

void test("history bookkeeping and both snapshot copies pass actual Inspector true with zero fixture effects", async () => {
  const context = fixture("append", "positive", true); await verifyViaBookkeepingInspector(context, ["callback", "branch", "branchValue", "writer", "encryptEntry", "cipher", "cipherValue"]);
});

void test("history field copies refuse inherited setter/non-writable drift with zero hooks while legacy copies remain exact", () => {
  for (const scenario of ["inherited-field-setter", "inherited-field-readonly"] as const) { for (const captured of [false, true]) { const context = fixture("append", scenario, captured); const report: unknown = context["report"]; assert.ok(report !== null && typeof report === "object"); assert.equal(Reflect.get(report, "error"), captured); assert.equal(Reflect.get(report, "calls"), 0); assert.equal(Reflect.get(report, "getters"), 0); } }
});
