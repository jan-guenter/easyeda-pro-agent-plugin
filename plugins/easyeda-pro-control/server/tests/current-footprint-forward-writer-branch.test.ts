/* oxlint-disable import/max-dependencies -- Verify both distinct original custody implementations plus exact fixed grammars without a shared authority adapter. */
/** Production fixed branch programs on inert objects only; no application,
 * native process, request or database is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_PROGRAMS as PROGRAMS } from "../src/current-footprint-forward-writer-branch-programs.ts";
import { currentFootprintForwardWriterBranchNativeCases, validateCurrentFootprintForwardWriterBranchCommand } from "../src/current-footprint-forward-writer-branch-protocol.ts";
import { currentFootprintForwardWriterBranchWire } from "../src/current-footprint-forward-writer-branch-wire.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SQL_CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { validateCurrentFootprintInverseMainHistoryCommand } from "../src/current-footprint-inverse-main-history-protocol.ts";

import { CurrentFootprintForwardWriterBranchCustody } from "../src/current-footprint-forward-writer-branch-custody.ts";
import { CurrentFootprintForwardWriterBranchCollector } from "../src/current-footprint-forward-writer-branch-collector.ts";
import { CurrentFootprintForwardWriterLiveHistoryCustody } from "../src/current-footprint-forward-writer-live-history-custody.ts";
import { CurrentFootprintForwardWriterLiveHistoryCollector } from "../src/current-footprint-forward-writer-live-history-collector.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_SITE } from "../src/current-footprint-forward-writer-branch-source.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE } from "../src/current-pcb-via-main-live-history-source.ts";
import { requireCurrentFootprintForwardWriterCopyLocalBodyCapacity } from "../src/current-footprint-forward-writer-copy-local-wire.ts";

function observe(scenario: string): unknown {
 return runInNewContext(`(()=>{let getters=0,applications=0;class SqlWrap{}class Sql{}class Database{}class Statement{};const sqlite={Database,Statement},util={types:{isProxy}},path="synthetic-selected",db=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(db,"filename",{value:path});Object.assign(wrap,{db});Object.assign(sql,{path,db,dbWrap:wrap,transactionDepth:0});const capture=Reflect.apply(eval("("+sqlCaptureProgram+")"),[SqlWrap,Sql,sqlite,util],[path]);
const row={uuid:"b".repeat(32),delete_status:0,name:"disposable",project_uuid:"a".repeat(64),branch_uuid:"b".repeat(32),history_uuid:"c".repeat(32),description:"",node:false,created_at:"2026-11-14 10:00:00",updated_at:"2026-11-14 10:00:00",parent_uuid:null,parent_name:null,creator_nickname:null,creator_uuid:null,modifier_nickname:null,default:true,project_histories_id:1};
const request={},response=()=>{},requestFrame=[null,request,response,sqlite,util,null,null],requestCapture=[requestFrame,capture,request,null,null,null,null,null,null],ctx={projectUuid:"a".repeat(64),routerParams:{projectUuid:"a".repeat(64),branchUuid:"b".repeat(32)},req:request,res:response,db:{[path]:Promise.resolve(sql)}},controller={ctx,path};
let selected=row;if(scenario==="proxy")selected=new Proxy(row,{getPrototypeOf(){getters++;throw Error("trap")},ownKeys(){getters++;throw Error("trap")}});if(scenario==="getter")Object.defineProperty(row,"name",{enumerable:true,get(){getters++;return"disposable"}});if(scenario==="extra")row.extra=true;if(scenario==="foreign-response")ctx.res={};
const frame=[controller,"a".repeat(64),"b".repeat(32),selected];let refused=false,value=null;try{const packet=Reflect.apply(eval("("+programs.capture.program+")"),frame,[capture,requestCapture]);Reflect.apply(eval("("+programs.resolved.program+")"),packet,[sql]);if(scenario==="drift")row.description="changed";if(scenario==="promise-drift")ctx.db[path]=Promise.resolve(sql);value=Reflect.apply(eval("("+programs.value.program+")"),packet,[]);}catch{refused=true}return{refused,value,getters,applications}})()`,{programs:PROGRAMS,sqlCaptureProgram:SQL_CAPTURE,isProxy:types.isProxy,scenario});
}
void test("fixed branch selectors retain the real API row and refuse traps, foreign responses and drift",()=>{
 const positive=observe("positive");assert.ok(positive!==null&&typeof positive==="object"&&"refused" in positive);assert.equal(positive.refused,false);
 for(const scenario of ["proxy","getter","extra","foreign-response","drift","promise-drift"]){const result=observe(scenario);assert.ok(result!==null&&typeof result==="object"&&"refused" in result&&"getters" in result&&"applications" in result);assert.equal(result.refused,true,scenario);assert.equal(result.getters,0,scenario);assert.equal(result.applications,0,scenario);}
});
void test("all ten branch commands are finite and absent from the historical inverse grammar",()=>{
 const cases=currentFootprintForwardWriterBranchNativeCases();assert.equal(cases.length,10);
 for(const [i,command] of cases.entries()){assert.deepEqual(validateCurrentFootprintForwardWriterBranchCommand(command),command);const wire=currentFootprintForwardWriterBranchWire(command,i+1);assert.equal(wire["action"],"footprint-forward-writer-branch");assert.throws(()=>validateCurrentFootprintInverseMainHistoryCommand(command));assert.throws(()=>validateCurrentFootprintForwardWriterBranchCommand({...command,extra:true}));}
});

void test("branch and live-history failures hand off exactly once and never resume a failed proof",async()=>{
 for(const kind of ["branch","live"] as const){
  const site=kind==="branch"?CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_SITE:CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE;
  const point={scriptId:"original7",lineNumber:site.lineNumber,columnNumber:site.columnNumber};
  const held={identity:{},frameId:"frame8",raw:{reason:"other",hitBreakpoints:["point9"],callFrames:[{callFrameId:"frame8",functionName:site.name,location:point,functionLocation:{...point,columnNumber:site.functionColumn}}]},
   sqlSite:null,pendingEvents:0,resumed:false,resumeAttempted:false};
  const error=new Error("original-read-refusal");const failures:unknown[]=[];let resumes=0,sends=0;
  let branch:CurrentFootprintForwardWriterBranchCustody|null=null,live:CurrentFootprintForwardWriterLiveHistoryCustody|null=null;
  const expected={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),historyUuid:"c".repeat(32),compare:():never=>{throw error;}};
  const host={scriptId:"original7",sqlCaptureObjectId:"capture6",assertCurrent:():void=>{assert.equal(held.resumed,false);},expected:():typeof expected=>expected,
   fail:(cause:unknown):void=>{failures.push(cause);},pause:():typeof held=>held,pendingRequestId:():number=>1,busy:():boolean=>true,
   registerPoint:():void=>{assert.equal(sends,1);},removePoint:():never=>{throw new Error("failed proof removed point");},pointCurrent:():boolean=>true,
   resume:():Promise<never>=>{resumes+=1;return Promise.reject(new Error("failed proof resumed"));},
   send:(input:unknown):Promise<unknown>=>{
    sends+=1;
    if(kind==="branch"){assert.ok(branch);branch.consume(validateCurrentFootprintForwardWriterBranchCommand(input),1);}
    else{assert.ok(live);live.consume(validateCurrentFootprintInverseMainHistoryCommand(input),1);}
    if(sends===1){return Promise.resolve({breakpointId:"point9",actualLocation:point});}
    return Promise.reject(error);
   }};
  let collector:CurrentFootprintForwardWriterBranchCollector|CurrentFootprintForwardWriterLiveHistoryCollector;
  if(kind==="branch"){branch=new CurrentFootprintForwardWriterBranchCustody(host);collector=new CurrentFootprintForwardWriterBranchCollector(branch,"capture6");}
  else{live=new CurrentFootprintForwardWriterLiveHistoryCustody(host);collector=new CurrentFootprintForwardWriterLiveHistoryCollector(live,"capture6");}
  await collector.arm("original7");
  const custody=branch??live;assert.ok(custody);
  const pureUrl=`/api/v4/projects/${expected.projectUuid}/branches/${expected.branchUuid}${kind==="live"?`/histories/${expected.historyUuid}`:""}`;
  custody.retainReadonlyRequest({schema:"private.selected-file-main-request.v1",mode:"fetch",method:"GET",pureQuery:"",pathHeader:expected.projectUuid,
   pureUrl,originalRequestVerified:true,readonlySql:false,executionAuthorized:false,saveAuthorized:false},"request5");
  await assert.rejects(collector.observeHeld("frame8"),value=>value===error);
  custody.failOriginalObservation(new Error("later failure"));
  assert.deepEqual(failures,[error]);assert.equal(resumes,0);assert.equal(held.resumed,false);assert.equal(sends,2);
  await assert.rejects(collector.observeHeld("frame8"));assert.equal(sends,2);
 }
});
void test("precreate copy capacity checks both escaped physical envelopes",()=>{
 assert.ok(requireCurrentFootprintForwardWriterCopyLocalBodyCapacity("a".repeat(8192))<=16_384);
 assert.ok(requireCurrentFootprintForwardWriterCopyLocalBodyCapacity("😀".repeat(2048))<=16_384);
 for(const body of ['"'.repeat(8192),"\\".repeat(8192),"\0".repeat(8192),"a".repeat(8193),"\uD800"]){
  assert.throws(()=>requireCurrentFootprintForwardWriterCopyLocalBodyCapacity(body),/BODY_CAPACITY/u);
 }
 const maximum='{"uuid":"ffffffffffffffff","clock":8640000000000000}';
 const actual='{"uuid":"aaaaaaaaaaaaaaaa","clock":1700000000000}';
 assert.ok(requireCurrentFootprintForwardWriterCopyLocalBodyCapacity(actual)<=requireCurrentFootprintForwardWriterCopyLocalBodyCapacity(maximum));
});
