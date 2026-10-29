/** Real fixed selectors in an isolated synthetic realm. Native source/runtime,
 * SQL driver, callback and process authority are not provided by this fixture. */
import vm from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as PROGRAMS } from "../../src/current-footprint-copy-main-completion-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SQL as SQL } from "../../src/current-footprint-copy-main-completion-source.ts";

export type MainCompletionSelectorScenario = "positive" | "aged" | "missing-head" | "foreign-context" | "fresh-head" | "nested-transaction" | "foreign-callback" | "wrong-singleton-sql" | "wrong-modifier" | "getter-actor";
export function mainCompletionSelectorFixture(scenario: MainCompletionSelectorScenario): Readonly<{ completed: readonly string[]; value: unknown; error: boolean; mutationCalls: number; getterCalls: number }> {
  const context = vm.createContext({});
  vm.runInContext(`
"use strict";
const scenario=${JSON.stringify(scenario)},SQL=${JSON.stringify(SQL)},programs=${JSON.stringify(PROGRAMS)},order=${JSON.stringify(ORDER)};
let mutationCalls=0,getterCalls=0;const forbidden=()=>{mutationCalls++;throw Error("application callback invoked")};
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),projectKey:"a".repeat(64),path:"synthetic-disposable",dataStr:"native-source"};
const ctx={db:{}},service={},owner={ctx,service,path:plan.path},nativeDb={};
class SqlWrap{};class Sql{queryOne(){forbidden()}};
const wrap=new SqlWrap;wrap.db=nativeDb;const sql=new Sql;Object.assign(sql,{path:plan.path,db:nativeDb,dbWrap:wrap,transactionDepth:0});
const value={uuid:"c".repeat(32),username:"actor",nickname:"nickname",updateTime:1700000000123},modify={...value};
if(scenario==="getter-actor")Object.defineProperty(value,"username",{get(){getterCalls++;return"actor"},enumerable:true});
const promise=Promise.resolve(sql);ctx.db[plan.path]=promise;
const contextPacket=[null,null,null,null,null,ctx],controller=[null,contextPacket,plan,owner,service,plan.path,null,null,null,Date,Date.now,null];
const actor=[null,controller,null,{dataStr:plan.dataStr,modify},modify,null,promise,null,null,value],sqlPacket=[actor,sql,Sql.prototype,nativeDb,wrap,SqlWrap.prototype,Sql.prototype.queryOne];
const body=JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify(modify)+"|\\n"+plan.dataStr;
const input={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,dataStr:body},branch={node:"node",uuid:plan.branchUuid,delete_status:0,history_uuid:scenario==="missing-head"?null:"d".repeat(32)};
const head=scenario==="missing-head"?null:{num:1,uuid:branch.history_uuid,key:"key",is_lock:scenario==="aged"||scenario==="fresh-head"?0:1,created_at:"2026-10-29 00:00:00",is_within_one_minute:scenario==="aged"?0:1};
const callback=async()=>{forbidden()},history="e".repeat(32),table={updated_at:{},modifier_uuid:{}},time="2026-10-29 03:00:00";
const params=[{symbol:Symbol(),value:time},{symbol:Symbol(),value:value.uuid}],args=[{JOIN:table},{EQ:[1,1]},{UPDATE:[[table.updated_at,params[0]],[table.modifier_uuid,params[1]]]}];
const frames={save:[service,ctx,plan.path,input],"transaction-enter":[sql,callback],"callback-enter":[service,ctx,plan.path,input,branch],branch:[service,ctx,plan.path,input,branch,head],append:[ctx,plan.path,input,branch],"branch-return":[service,ctx,plan.path,input,branch,head,history],"commit-enter":[sql,1],"commit-return":[sql,0],"transaction-return":[sql,callback],"save-post-transaction":[service,ctx,plan.path,input,branch,history],"project-sql":[sql,args,SQL,params],"project-return":[ctx,plan.path,plan.projectUuid,table],"save-return":[service,ctx,plan.path,input,branch,history],"controller-return":[owner,ctx,service,plan.path,input]};
const caller=[ctx,plan.path,plan.projectUuid,table,Date,Date.now],packets={},completed=[];let result=null,error=false;
for(const stage of order){
 if(stage==="save"&&scenario==="foreign-context")frames.save[1]={};
 if(stage==="transaction-enter"&&scenario==="nested-transaction")sql.transactionDepth=1;
 if(stage==="callback-enter")sql.transactionDepth=1;
 if(stage==="commit-return")sql.transactionDepth=0;
 if(stage==="transaction-return"&&scenario==="foreign-callback")frames[stage][1]=async()=>{};
 if(stage==="project-sql"&&scenario==="wrong-singleton-sql")frames[stage][2]=SQL.replace("projects","unrelated");
 if(stage==="project-sql"&&scenario==="wrong-modifier")params[1].value="f".repeat(32);
 if(stage==="controller-return")ctx.body=history;
 const index=order.indexOf(stage);let argumentsList=stage==="save"?[actor,sqlPacket]:stage==="transaction-return"?[packets["transaction-enter"],packets["commit-return"]]:stage==="project-sql"?[caller,packets["save-post-transaction"]]:[packets[order[index-1]]];
 try{const selected=eval("("+programs[stage].program+")");const value=Reflect.apply(selected,frames[stage],argumentsList);packets[stage]=value;completed.push(stage);if(stage==="controller-return")result=value;}catch{error=true;break;}
}
globalThis.result={completed,value:result,error,mutationCalls,getterCalls};
`, context);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the bounded fixture's primitive report crosses from the isolated VM; no runtime authority or native object is returned.
  return structuredClone(context["result"]) as ReturnType<typeof mainCompletionSelectorFixture>;
}
