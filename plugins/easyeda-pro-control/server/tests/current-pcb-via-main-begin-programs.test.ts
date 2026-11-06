/** Synthetic source selectors only; no native owner, SQL or application call. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import vm from "node:vm";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as CALLS } from "../src/current-pcb-via-main-begin-programs.ts";
import { currentPcbViaMainBeginNativeCases, validateCurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import { currentPcbViaMainBeginWire } from "../src/current-pcb-via-main-begin-wire.ts";
import { currentPcbViaMainBeginNativeSource } from "../src/current-pcb-via-main-begin-native-fragment.ts";

void test("fixed BEGIN selectors join one actual resolver/callback/await chain and invoke no application method", () => {
  for (const scenario of ["positive", "foreign-db", "wrong-sql", "foreign-resolver", "error-callback", "changes-getter"] as const) {
    const context = vm.createContext({ programs: CALLS, scenario, isProxy: types.isProxy });
    vm.runInContext(`
"use strict";let calls=0,getters=0;const forbidden=()=>{calls++;throw Error("application method")};
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),projectKey:"a".repeat(64),path:"synthetic-disposable",dataStr:"worker-source"},ctx={db:{}},service={},owner={ctx,service,path:plan.path};
class Database{}class Statement{}class SqlWrap{}class Sql{queryOne(){forbidden()}}const sqlite={Database,Statement},util={types:{isProxy}},native=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(native,"filename",{value:plan.path});Object.assign(wrap,{db:native});Object.assign(sql,{path:plan.path,db:native,dbWrap:wrap,transactionDepth:0});
const value={uuid:"c".repeat(32),username:"actor",nickname:"name",updateTime:1700000000123},modify={...value},promise=Promise.resolve(sql);ctx.db[plan.path]=promise;
const controller=[null,[null,null,null,null,null,ctx],plan,owner,service,plan.path,null,null,null,Date,Date.now,null];
const actor=[null,controller,null,{dataStr:plan.dataStr,modify},modify,null,promise,null,null,value],q=[actor,sql,Sql.prototype,native,wrap,SqlWrap.prototype,Sql.prototype.queryOne];
const captureFrame=[SqlWrap,Sql,sqlite,util],capture=[captureFrame,SqlWrap,Sql,sqlite,util,[],isProxy,plan.path,new Map,Date,Date.now];
const input={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,dataStr:JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify(modify)+"|\\n"+plan.dataStr},callback=async()=>{forbidden()},params=[],resolve=forbidden,reject=()=>forbidden();
const select=(role,receiver,args)=>Reflect.apply(eval("("+programs[role].program+")"),receiver,args);let stage="save",result=null,error=false;
try{const saved=select("save",[service,ctx,plan.path,input],[actor,q]);stage="transaction";const tx=select("transaction",[sql,callback],[saved]);sql.transactionDepth=1;
 if(scenario==="foreign-db")wrap.db=new Database;
 const sqlText=scenario==="wrong-sql"?"commit transaction":"begin immediate transaction";
 stage="run";const run=select("run",[wrap,sqlText,params,resolve,reject,sqlite,util],[capture,tx]);
 const stmt=new Statement;Object.defineProperty(stmt,"sql",{value:"begin immediate transaction"});Object.defineProperty(stmt,"changes",scenario==="changes-getter"?{get(){getters++;return 0}}:{value:0});
 stage="callback";const after=select("callback",[stmt,scenario==="error-callback"?{code:"SQLITE_BUSY"}:null,"begin immediate transaction",params,scenario==="foreign-resolver"?()=>{}:resolve,reject,sqlite,util],[run]);
 stage="returned";result=select("returned",[sql,1],[after]);}catch{error=true;}globalThis.report={stage,error,result,calls,getters};
`, context);
    const report: unknown = structuredClone(context["report"]); assert.ok(report !== null && typeof report === "object");
    assert.equal(Reflect.get(report, "calls"), 0); assert.equal(Reflect.get(report, "getters"), 0); assert.equal(Reflect.get(report, "error"), scenario !== "positive");
    if (scenario === "positive") { assert.deepEqual(Reflect.get(report, "result"), { schema: "private.current-pcb-via-main-begin-result.v1", originalNativeCallbackSucceeded: true, originalBeginAwaitCompleted: true, transactionDepth: 1, historySqlCompleted: false, furtherSelectedSqlAuthorized: false, persistenceVerified: false }); }
    else { assert.equal(Reflect.get(report, "stage"), scenario === "foreign-db" || scenario === "wrong-sql" ? "run" : "callback"); }
  }
});
void test("BEGIN grammar and native codebook contain only fixed source programs and original handle slots", () => {
  const cases = currentPcbViaMainBeginNativeCases(); assert.equal(cases.length, 23);
  for (const command of cases) { const wire = currentPcbViaMainBeginWire(command, 79); assert.equal(wire.request["action"], "pcb-via-main-begin");
    for (const field of ["sql", "params", "condition", "functionDeclaration", "expression", "sessionId"]) { assert.equal(Object.hasOwn(wire.request, field), false); }
    assert.throws(() => validateCurrentPcbViaMainBeginCommand({ ...command, authority: true }));
    if (command.phase === "via-main-begin-join") { assert.throws(() => validateCurrentPcbViaMainBeginCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } })); }
  }
  assert.match(currentPcbViaMainBeginNativeSource(), /EasyedaDiagnosticFixedTable.Load/u); assert.match(currentPcbViaMainBeginNativeSource(), /viaMainStep!=3/u);
});
