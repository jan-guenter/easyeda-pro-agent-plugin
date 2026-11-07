/** Production same-cursor state machine, with an explicit inert native CDP
 * transport seam. No original app, DB, owner or continuation grant exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintInverseMainHistoryCustody } from "../src/current-footprint-inverse-main-history-custody.ts";
import type { CurrentFootprintInverseMainHistoryHost } from "../src/current-footprint-inverse-main-history-custody.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "../src/current-footprint-inverse-main-history-baseline.ts";
import type { CurrentFootprintInverseMainHistoryCommand } from "../src/current-footprint-inverse-main-history-protocol.ts";
import { currentFootprintInverseMainHistoryNativeCases } from "../src/current-footprint-inverse-main-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as FUNCTIONS, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "../src/current-pcb-via-main-live-history-source.ts";

function member(name: string, value: object): object { return { name, value, writable: false, enumerable: false, configurable: true, isOwn: true }; }
async function cursor(scenario: "positive" | "foreign-head" | "lost-ack"): Promise<Readonly<{ calls: string[]; resumed: boolean; complete: boolean }>> {
  const calls: string[] = []; let currentId: number | null = null, pointCurrent = false; let resumeAttempted = false; let resumed = false;
  const identity = Object.freeze({ originalDeliveredPause: true });
  const current = Object.freeze({id:3,uuid:"c".repeat(32),parent:"d".repeat(32),key:"e".repeat(32),is_lock:1,num:2,snapshot_num:0,created_at:null,updated_at:null,lock_time:null,iv:"c".repeat(32)} as const);
  const prior = Object.freeze({id:1,uuid:"d".repeat(32),parent:null,key:"f".repeat(32),is_lock:0,num:7,snapshot_num:0,created_at:"2026-11-06 01:02:03",updated_at:"2026-11-06 01:02:03",lock_time:"1970-01-01 08:00:00",iv:"d".repeat(32)} as const);
  const rows = Object.freeze([current, prior]);
  const baseline: CurrentFootprintInverseMainHistoryBaseline = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), historyUuid: "c".repeat(32), rows });
  const location = { scriptId: "script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber };
  let custody: CurrentFootprintInverseMainHistoryCustody | null = null;
  const send = async (command: CurrentFootprintInverseMainHistoryCommand): Promise<unknown> => {
    await Promise.resolve(); currentId = calls.length+1; assert.ok(custody !== null); custody.consume(command,currentId); calls.push(`${command.phase}${"role" in command?`-${command.role}`:""}`);
    if(scenario==="lost-ack"&&command.phase==="inverse-main-history-join"){throw new Error("original native acknowledgement lost");}
    if(command.phase==="inverse-main-history-arm"){return{breakpointId:"point",actualLocation:location};}
    if(command.phase==="inverse-main-history-frame"){return{result:{type:"object",subtype:"array",objectId:"frame-packet"}};}
    if(command.phase==="inverse-main-history-join"){if(command.role==="resolved"){return{result:{type:"boolean",value:true}};}return command.role==="capture"?{result:{type:"object",subtype:"array",objectId:"capture-packet"}}:{result:{type:"object",value:{projectUuid:scenario==="foreign-head"?"f".repeat(64):baseline.projectUuid,branchUuid:baseline.branchUuid,historyUuid:baseline.historyUuid,rows:baseline.rows}}};}
    if(command.phase==="inverse-main-history-properties"){
      if(command.role==="packet"){return{result:[...Array.from({length:10},(_,i)=>member(String(i),{type:i>=4&&i<=6?"function":"object",...(i===8?{subtype:"promise"}:{}),objectId:i===8?"db-promise":["fn-projectSql","fn-table","fn-branches"][i-4]??"packet-member"})),member("length",{type:"number",value:10})]};}
      if(command.role==="promise"){return{result:[],internalProperties:[{name:"[[Prototype]]",value:{type:"object",objectId:"promise-prototype"}},{name:"[[PromiseState]]",value:{type:"string",value:"fulfilled"}},{name:"[[PromiseResult]]",value:{type:"object",objectId:"fulfilled-db-owner"}}]};}
      const source=FUNCTIONS[command.role];return{result:[member("name",{type:"string",value:source.name}),member("length",{type:"number",value:source.arity})],internalProperties:[{name:"[[FunctionLocation]]",value:{type:"object",subtype:"internal#location",value:{scriptId:"script",lineNumber:source.lineNumber,columnNumber:source.columnNumber}}},{name:"[[Prototype]]",value:{type:"object",className:"AsyncFunction",description:"AsyncFunction",objectId:"async-prototype"}},{name:"[[Scopes]]",value:{type:"object",subtype:"internal#scopeList",objectId:"module-scopes",description:"Scopes[2]"}}]};
    }return{};
  };
  const host: CurrentFootprintInverseMainHistoryHost = {scriptId:"script",sqlCaptureObjectId:"sql-capture",assertCurrent:(): void=>{ assert.equal(Object.isFrozen(baseline),true); },expected:(): CurrentFootprintInverseMainHistoryBaseline=>baseline,pendingRequestId:(): number|null=>currentId,busy:(): boolean=>true,
    pause:(): ReturnType<CurrentFootprintInverseMainHistoryHost["pause"]>=>({identity,frameId:"frame",raw:{reason:"other",hitBreakpoints:["point"],callFrames:[{callFrameId:"frame",functionName:SITE.name,location,functionLocation:{...location,columnNumber:SITE.functionColumn}}]},sqlSite:null,pendingEvents:0,resumed,resumeAttempted}),
    send,registerPoint:(id): void=>{assert.equal(id,"point");pointCurrent=true;},removePoint:(id): void=>{assert.equal(id,"point");pointCurrent=false;},pointCurrent:(): boolean=>pointCurrent,
    resume:async(original,command): Promise<unknown>=>{assert.equal(original,identity);assert.equal(pointCurrent,false);resumeAttempted=true;const value=await send(command);resumed=true;return value;}};
  custody = new CurrentFootprintInverseMainHistoryCustody(host);
  const samples=currentFootprintInverseMainHistoryNativeCases();const order=["arm","frame","join-capture","properties-packet","properties-promise","join-resolved","properties-projectSql","properties-table","properties-branches","join-value","remove","step","release"];
  let complete=false;
  try{for(const name of order){const sample=samples.find(candidate=>`${candidate.phase}${"role" in candidate?`-${candidate.role}`:""}`===`inverse-main-history-${name}`);assert.ok(sample!==undefined);const input=structuredClone(sample);
    if(input.phase==="inverse-main-history-arm"){input.params.location.scriptId="script";}
    else if(input.phase==="inverse-main-history-frame"){input.params.callFrameId="frame";custody.retainReadonlyRequest({schema:"private.selected-file-main-request.v1",mode:"fetch",method:"GET",pathHeader:baseline.projectUuid,pureQuery:"",pureUrl:`/api/v4/projects/${baseline.projectUuid}/branches/${baseline.branchUuid}/histories/${baseline.historyUuid}`,originalRequestVerified:true,readonlySql:false,executionAuthorized:false,saveAuthorized:false},"original-get-capture");}
    else if(input.phase==="inverse-main-history-join"){input.params.objectId=input.role==="capture"?"frame-packet":"capture-packet";input.params.arguments=[];if(input.role==="capture"){input.params.arguments=[{objectId:"sql-capture"},{objectId:"original-get-capture"}];}else if(input.role==="resolved"){input.params.arguments=[{objectId:"fulfilled-db-owner"}];}}
    else if(input.phase==="inverse-main-history-properties"){input.params.objectId=`fn-${input.role}`;if(input.role==="packet"){input.params.objectId="capture-packet";}else if(input.role==="promise"){input.params.objectId="db-promise";}}
    else if(input.phase==="inverse-main-history-remove"){input.params.breakpointId="point";}
    await custody.request(input,input.phase==="inverse-main-history-remove"||input.phase==="inverse-main-history-release");}
    const value=custody.result();assert.equal(Object.isFrozen(value.rows),true);complete=true;
  }catch(error){if(scenario==="positive"){throw error;}assert.throws(()=>custody.result(),/FAILED/u);}
  return{calls,resumed,complete};
}
void test("inverse saved-history custody consumes original native acknowledgements and removes its own point before one resume",async()=>{
  const result=await cursor("positive");assert.equal(result.complete,true);assert.equal(result.resumed,true);assert.equal(result.calls.length,13);assert.deepEqual(result.calls.slice(-3),["inverse-main-history-remove","inverse-main-history-step","inverse-main-history-release"]);
});
void test("foreign actual scope and lost native acknowledgement stay held without a readonly resume or reconstructed packet",async()=>{
  for(const scenario of ["foreign-head","lost-ack"]as const){const result=await cursor(scenario);assert.equal(result.complete,false);assert.equal(result.resumed,false);assert.equal(result.calls.includes("inverse-main-history-step"),false);}
});
