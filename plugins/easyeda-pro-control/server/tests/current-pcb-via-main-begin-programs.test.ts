/** Synthetic source selectors only; no native owner, SQL or application call. */
import assert from "node:assert/strict";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { test } from "node:test";
import { types } from "node:util";
import vm from "node:vm";
import { CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING as BOOKKEEPING, CURRENT_PCB_VIA_MAIN_BEGIN_REBASE as REBASE } from "../src/current-pcb-via-main-captured-rebase.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as CALLS } from "../src/current-pcb-via-main-begin-programs.ts";
import { currentPcbViaMainBeginNativeCases, validateCurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import { currentPcbViaMainBeginWire } from "../src/current-pcb-via-main-begin-wire.ts";
import { currentPcbViaMainBeginNativeSource } from "../src/current-pcb-via-main-begin-native-fragment.ts";

void test("fixed BEGIN selectors join one actual resolver/callback/await chain and invoke no application method", () => {
  for (const variant of ["legacy", "captured"]) {
  for (const scenario of ["positive", "foreign-db", "wrong-sql", "foreign-resolver", "error-callback", "changes-getter", "inherited-setter", "inherited-readonly", "inherited-state-setter", "inherited-state-readonly"] as const) {
    const context = vm.createContext({ captureProgram: CAPTURE, programs: CALLS, bookkeeping: BOOKKEEPING, rebase: REBASE, variant, scenario, isProxy: types.isProxy });
    vm.runInContext(`
"use strict";let calls=0,getters=0;const forbidden=()=>{calls++;throw Error("application method")};
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),projectKey:"a".repeat(64),path:"synthetic-disposable",dataStr:"worker-source"},ctx={db:{}},service={},owner={ctx,service,path:plan.path};
class Database{}class Statement{}class SqlWrap{}class Sql{queryOne(){forbidden()}}const sqlite={Database,Statement},util={types:{isProxy}},native=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(native,"filename",{value:plan.path});Object.assign(wrap,{db:native});Object.assign(sql,{path:plan.path,db:native,dbWrap:wrap,transactionDepth:0});
const value={uuid:"c".repeat(32),username:"actor",nickname:"name",updateTime:1700000000123},modify={...value},promise=Promise.resolve(sql);ctx.db[plan.path]=promise;
const controller=[null,[null,null,null,null,null,ctx],plan,owner,service,plan.path,null,null,null,Date,Date.now,null];
const actor=[null,controller,null,{dataStr:plan.dataStr,modify},modify,null,promise,null,null,value],q=[actor,sql,Sql.prototype,native,wrap,SqlWrap.prototype,Sql.prototype.queryOne];
const captureFrame=[SqlWrap,Sql,sqlite,util],capture=Reflect.apply(eval("("+captureProgram+")"),captureFrame,[plan.path]);
const input={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,dataStr:JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify(modify)+"|\\n"+plan.dataStr},callback=async()=>{forbidden()},params=[],resolve=forbidden,reject=()=>forbidden();
const select=(role,receiver,args)=>{if(variant==="captured"&&(role==="run"||role==="callback")){return Reflect.apply(eval("("+rebase[role].program+")"),receiver.slice(0,-1),role==="callback"?[capture,...args]:args)}const fixed=variant==="captured"&&Object.hasOwn(bookkeeping,role)?bookkeeping[role]:programs[role];return Reflect.apply(eval("("+fixed.program+")"),receiver,args)};let stage="save",result=null,error=false;
if(scenario.startsWith("inherited")){const key=scenario.includes("state")?"frame":"input";Object.defineProperty(Object.prototype,key,scenario.endsWith("setter")?{set(){calls++},configurable:true}:{value:"inherited",writable:false,configurable:true});}
try{const saved=select("save",[service,ctx,plan.path,input],[actor,q]);stage="transaction";const tx=select("transaction",[sql,callback],[saved]);sql.transactionDepth=1;
 if(scenario==="foreign-db")wrap.db=new Database;
 const sqlText=scenario==="wrong-sql"?"commit transaction":"begin immediate transaction";
 stage="run";const run=select("run",[wrap,sqlText,params,resolve,reject,sqlite,util],[capture,tx]);
 const stmt=new Statement;Object.defineProperty(stmt,"sql",{value:"begin immediate transaction"});Object.defineProperty(stmt,"changes",scenario==="changes-getter"?{get(){getters++;return 0}}:{value:0});
 stage="callback";const after=select("callback",[stmt,scenario==="error-callback"?{code:"SQLITE_BUSY"}:null,"begin immediate transaction",params,scenario==="foreign-resolver"?()=>{}:resolve,reject,sqlite,util],[run]);
 stage="returned";result=select("returned",[sql,1],[after]);}catch{error=true;}globalThis.report={stage,error,result,calls,getters};
`, context);
    const report: unknown = structuredClone(context["report"]); assert.ok(report !== null && typeof report === "object");
    assert.equal(Reflect.get(report, "calls"), 0); assert.equal(Reflect.get(report, "getters"), 0); const expectedError = scenario.startsWith("inherited") ? variant === "captured" : scenario !== "positive"; assert.equal(Reflect.get(report, "error"), expectedError);
    if (expectedError) { let stage = "callback"; if (scenario.startsWith("inherited")) { stage = scenario.includes("state") ? "run" : "save"; } else if (scenario === "foreign-db" || scenario === "wrong-sql") { stage = "run"; } assert.equal(Reflect.get(report, "stage"), stage); }
    else { assert.deepEqual(Reflect.get(report, "result"), { schema: "private.current-pcb-via-main-begin-result.v1", originalNativeCallbackSucceeded: true, originalBeginAwaitCompleted: true, transactionDepth: 1, historySqlCompleted: false, furtherSelectedSqlAuthorized: false, persistenceVerified: false }); }
  }}
});
void test("BEGIN grammar and native codebook contain only fixed source programs and original handle slots", () => {
  const cases = currentPcbViaMainBeginNativeCases(); assert.equal(cases.length, 30);
  for (const command of cases) { const wire = currentPcbViaMainBeginWire(command, 79); assert.equal(wire.request["action"], "pcb-via-main-begin");
    for (const field of ["sql", "params", "condition", "functionDeclaration", "expression", "sessionId"]) { assert.equal(Object.hasOwn(wire.request, field), false); }
    assert.throws(() => validateCurrentPcbViaMainBeginCommand({ ...command, authority: true }));
    if (command.phase === "via-main-begin-join") { assert.throws(() => validateCurrentPcbViaMainBeginCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } })); }
  }
  assert.match(currentPcbViaMainBeginNativeSource(), /EasyedaDiagnosticFixedTable.Load/u); assert.match(currentPcbViaMainBeginNativeSource(), /viaMainStep!=3/u);
});
