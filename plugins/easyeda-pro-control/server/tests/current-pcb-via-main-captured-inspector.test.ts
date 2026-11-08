/** Local Node Inspector proof of the exact readonly flag. The evaluated
 * fixture creates inert objects only; no EasyEDA, SQL, native owner or facade
 * grant exists. Setup and all remote references are released in this test. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as FRAMES } from "../src/current-main-captured-scope-frames.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as BEGIN } from "../src/current-pcb-via-main-begin-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING as BOOKKEEPING, CURRENT_PCB_VIA_MAIN_BEGIN_REBASE as REBASE } from "../src/current-pcb-via-main-captured-rebase.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";

const group = "inert-via-captured-inspector-test";
/** The fixture's complete descriptor graph matches the production joins. Its
 * functions count forbidden API/SQL/continuation calls without performing any. */
function fixture(depth = 1): string {
  return `(function(){"use strict";const programs=${JSON.stringify(BEGIN)},captureProgram=${JSON.stringify(CAPTURE)},effects={calls:0},forbidden=()=>{effects.calls++;throw Error("application call")},util=process.getBuiltinModule("util");
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),projectKey:"a".repeat(64),path:"synthetic-inspector",dataStr:"worker-source"},ctx={db:{}},service={},owner={ctx,service,path:plan.path};
class Database{}class Statement{}class SqlWrap{}class Sql{queryOne(){forbidden()}}const sqlite={Database,Statement},native=new Database,wrap=new SqlWrap,sql=new Sql;Object.defineProperty(native,"filename",{value:plan.path});Object.assign(wrap,{db:native});Object.assign(sql,{path:plan.path,db:native,dbWrap:wrap,transactionDepth:0});
const modify={uuid:"c".repeat(32),username:"actor",nickname:"name",updateTime:1700000000123},promise=Promise.resolve(sql);ctx.db[plan.path]=promise;
const controller=[null,[null,null,null,null,null,ctx],plan,owner,service,plan.path,null,null,null,Date,Date.now,null],actor=[null,controller,null,{dataStr:plan.dataStr,modify},modify,null,promise,null,null,{...modify}],q=[actor,sql,Sql.prototype,native,wrap,SqlWrap.prototype,Sql.prototype.queryOne];
const captureFrame=[SqlWrap,Sql,sqlite,util],capture=Reflect.apply(eval("("+captureProgram+")"),captureFrame,[plan.path]);
const input={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,dataStr:JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify(modify)+"|\\n"+plan.dataStr},callback=async()=>forbidden(),params=[],resolve=forbidden,reject=()=>forbidden(),select=(role,receiver,args)=>Reflect.apply(eval("("+programs[role].program+")"),receiver,args);
const saved=select("save",[service,ctx,plan.path,input],[actor,q]),tx=select("transaction",[sql,callback],[saved]);sql.transactionDepth=1;const stmt=new Statement;Object.defineProperty(stmt,"sql",{value:"begin immediate transaction"});Object.defineProperty(stmt,"changes",{value:0});
sql.transactionDepth=${String(depth)};return{saveFrame:[service,ctx,plan.path,input],actor,q,transactionFrame:[sql,callback],returnedFrame:[sql,1],rawRun:[wrap,"begin immediate transaction",params,resolve,reject,sqlite],rawCallback:[stmt,null,"begin immediate transaction",params,resolve,reject,sqlite],capture,tx,effects};})()`;
}
/** Node's bundled declarations omit the supported CDP side-effect field.
 * Keep that additional field typed and required, preserving the exact true flag. */
function readonlyCall(session: Session, params: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }>): Promise<Runtime.CallFunctionOnReturnType> { return session.post("Runtime.callFunctionOn", params); }
void test("fused BEGIN run/callback joins succeed in actual Node Inspector with throwOnSideEffect true and invoke no application call", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); const setup = await session.post("Runtime.evaluate", { expression: fixture(), objectGroup: group }); assert.equal(setup.exceptionDetails, undefined); const receiver = setup.result.objectId; assert.ok(receiver !== undefined);
    const member = async (program: string): Promise<string> => { const reply = await readonlyCall(session, { objectId: receiver, functionDeclaration: program, objectGroup: group, silent: true, throwOnSideEffect: true, returnByValue: false }); assert.equal(reply.exceptionDetails, undefined); assert.ok(reply.result.objectId !== undefined); return reply.result.objectId; };
    const rawRun = await member("function(){return this.rawRun}"); const rawCallback = await member("function(){return this.rawCallback}"); const capture = await member("function(){return this.capture}"); const tx = await member("function(){return this.tx}");
    const normalizer = await readonlyCall(session, { objectId: rawRun, functionDeclaration: FRAMES.beginRun.program, arguments: [{ objectId: capture }], objectGroup: group, throwOnSideEffect: true, returnByValue: false });
    assert.equal(normalizer.exceptionDetails, undefined);
    const run = await readonlyCall(session, { objectId: rawRun, functionDeclaration: REBASE.run.program, arguments: [{ objectId: capture }, { objectId: tx }], objectGroup: group, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: false });
    assert.equal(run.exceptionDetails, undefined, run.exceptionDetails?.exception?.description); assert.ok(run.result.objectId !== undefined);
    const callback = await readonlyCall(session, { objectId: rawCallback, functionDeclaration: REBASE.callback.program, arguments: [{ objectId: capture }, { objectId: run.result.objectId }], objectGroup: group, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: false });
    assert.equal(callback.exceptionDetails, undefined, callback.exceptionDetails?.exception?.description); assert.equal(callback.result.subtype, "array");
    assert.ok(callback.result.objectId !== undefined); const returned = await member("function(){return this.returnedFrame}");
    const done = await readonlyCall(session, { objectId: returned, functionDeclaration: BOOKKEEPING.returned.program, arguments: [{ objectId: callback.result.objectId }], objectGroup: group, throwOnSideEffect: true, returnByValue: true }); assert.equal(done.exceptionDetails, undefined); const completed: unknown = done.result.value; assert.ok(completed !== null && typeof completed === "object" && "persistenceVerified" in completed && completed.persistenceVerified === false);
    const effects = await readonlyCall(session, { objectId: receiver, functionDeclaration: "function(){return this.effects}", returnByValue: true, throwOnSideEffect: true }); const value: unknown = effects.result.value; assert.deepEqual(value, { calls: 0 });
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); session.disconnect(); }
});

void test("BEGIN save and transaction bookkeeping retain their exact arguments under actual Inspector true", async () => {
  const session = new Session(); session.connect();
  try {
    const setup = await session.post("Runtime.evaluate", { expression: fixture(0), objectGroup: group }); assert.equal(setup.exceptionDetails, undefined); const root = setup.result.objectId; assert.ok(root !== undefined);
    const member = async (name: string): Promise<string> => { const selected = await readonlyCall(session, { objectId: root, functionDeclaration: `function(){return this.${name}}`, objectGroup: group, throwOnSideEffect: true }); assert.equal(selected.exceptionDetails, undefined); assert.ok(selected.result.objectId !== undefined); return selected.result.objectId; };
    const saved = await readonlyCall(session, { objectId: await member("saveFrame"), functionDeclaration: BOOKKEEPING.save.program, arguments: [{ objectId: await member("actor") }, { objectId: await member("q") }], objectGroup: group, throwOnSideEffect: true }); assert.equal(saved.exceptionDetails, undefined); assert.ok(saved.result.objectId !== undefined);
    const tx = await readonlyCall(session, { objectId: await member("transactionFrame"), functionDeclaration: BOOKKEEPING.transaction.program, arguments: [{ objectId: saved.result.objectId }], objectGroup: group, throwOnSideEffect: true }); assert.equal(tx.exceptionDetails, undefined); assert.equal(tx.result.subtype, "array");
    const effects = await readonlyCall(session, { objectId: root, functionDeclaration: "function(){return this.effects}", throwOnSideEffect: true, returnByValue: true }); const value: unknown = effects.result.value; assert.deepEqual(value, { calls: 0 });
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); session.disconnect(); }
});
