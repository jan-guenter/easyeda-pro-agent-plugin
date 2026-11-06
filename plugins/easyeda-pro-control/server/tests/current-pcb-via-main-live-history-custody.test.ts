/** Production same-cursor state machine, with an explicit inert native CDP
 * transport seam. No original app, DB, owner or continuation grant exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaMainLiveHistoryCustody } from "../src/current-pcb-via-main-live-history-custody.ts";
import type { CurrentPcbViaMainLiveHistoryHost } from "../src/current-pcb-via-main-live-history-custody.ts";
import type { CurrentProjectHistorySqlEffects } from "../src/current-project-history-sql-effects.ts";
import type { CurrentPcbViaMainLiveHistoryCommand } from "../src/current-pcb-via-main-live-history-protocol.ts";
import { currentPcbViaMainLiveHistoryNativeCases } from "../src/current-pcb-via-main-live-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS as FUNCTIONS, CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE as SITE } from "../src/current-pcb-via-main-live-history-source.ts";

function member(name: string, value: object): object { return { name, value, writable: false, enumerable: false, configurable: true, isOwn: true }; }
async function cursor(scenario: "positive" | "foreign-head" | "lost-ack"): Promise<Readonly<{ calls: string[]; resumed: boolean; complete: boolean }>> {
  const calls: string[] = []; let currentId: number | null = null, pointCurrent = false; let resumeAttempted = false; let resumed = false;
  const identity = Object.freeze({ originalDeliveredPause: true });
  const effects: CurrentProjectHistorySqlEffects = Object.freeze({ schema: "private.current-project-history-sql-effects.v1", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), initialLogicalSha256: "1".repeat(64),
    mode: "mutable", historyUuid: "c".repeat(32), parentHistoryUuid: "c".repeat(32), keyHex: "e".repeat(32), chunkUuid: `${"c".repeat(32)}-1`, dataBase64: "YQ==", plaintextSha256: "2".repeat(64), bodySha256: "3".repeat(64), historyNum: 1,
    actor: {uuid:"f".repeat(32),username:"",nickname:"",updateTime:1},projectUpdatedAt:"2026-11-07 01:02:03",projectModifierUuid:"f".repeat(32),nativeCallbacks:[],originalServiceAwaitCompleted:true,selectedSqlStillFenced:true });
  const location = { scriptId: "script", lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber };
  let custody: CurrentPcbViaMainLiveHistoryCustody | null = null;
  const send = async (command: CurrentPcbViaMainLiveHistoryCommand): Promise<unknown> => {
    await Promise.resolve(); currentId = calls.length+1; assert.ok(custody !== null); custody.consume(command,currentId); calls.push(`${command.phase}${"role" in command?`-${command.role}`:""}`);
    if(scenario==="lost-ack"&&command.phase==="via-main-live-join"){throw new Error("original native acknowledgement lost");}
    if(command.phase==="via-main-live-arm"){return{breakpointId:"point",actualLocation:location};}
    if(command.phase==="via-main-live-frame"){return{result:{type:"object",subtype:"array",objectId:"frame-packet"}};}
    if(command.phase==="via-main-live-join"){return command.role==="capture"?{result:{type:"object",subtype:"array",objectId:"capture-packet"}}:{result:{type:"object",value:{projectUuid:scenario==="foreign-head"?"f".repeat(64):effects.projectUuid,branchUuid:effects.branchUuid,historyUuid:effects.historyUuid,rows:[{id:1,uuid:effects.historyUuid,parent:null,key:effects.keyHex,is_lock:0,num:1,snapshot_num:0,created_at:"2026-11-06 01:02:03",updated_at:"2026-11-06 01:02:03",lock_time:"1970-01-01 08:00:00",iv:effects.historyUuid}]}}};}
    if(command.phase==="via-main-live-properties"){
      if(command.role==="packet"){return{result:[...Array.from({length:8},(_,i)=>member(String(i),{type:i>=4&&i<=6?"function":"object",objectId:["fn-projectSql","fn-table","fn-branches"][i-4]??"packet-member"})),member("length",{type:"number",value:8})]};}
      const source=FUNCTIONS[command.role];return{result:[member("name",{type:"string",value:source.name}),member("length",{type:"number",value:source.arity})],internalProperties:[{name:"[[FunctionLocation]]",value:{type:"object",subtype:"internal#location",value:{scriptId:"script",lineNumber:source.lineNumber,columnNumber:source.columnNumber}}},{name:"[[Prototype]]",value:{type:"object",className:"AsyncFunction",description:"AsyncFunction",objectId:"async-prototype"}},{name:"[[Scopes]]",value:{type:"object",subtype:"internal#scopeList",objectId:"module-scopes",description:"Scopes[2]"}}]};
    }return{};
  };
  const host: CurrentPcbViaMainLiveHistoryHost = {scriptId:"script",sqlCaptureObjectId:"sql-capture",originalSqlObjectId:(): string=>"prior-sql",assertCurrent:(): void=>{ assert.equal(Object.isFrozen(effects),true); },effects:(): CurrentProjectHistorySqlEffects=>effects,pendingRequestId:(): number|null=>currentId,busy:(): boolean=>true,
    pause:(): ReturnType<CurrentPcbViaMainLiveHistoryHost["pause"]>=>({identity,frameId:"frame",raw:{reason:"other",hitBreakpoints:["point"],callFrames:[{callFrameId:"frame",functionName:SITE.name,location,functionLocation:{...location,columnNumber:SITE.functionColumn}}]},sqlSite:null,pendingEvents:0,resumed,resumeAttempted}),
    send,registerPoint:(id): void=>{assert.equal(id,"point");pointCurrent=true;},removePoint:(id): void=>{assert.equal(id,"point");pointCurrent=false;},pointCurrent:(): boolean=>pointCurrent,
    resume:async(original,command): Promise<unknown>=>{assert.equal(original,identity);assert.equal(pointCurrent,false);resumeAttempted=true;const value=await send(command);resumed=true;return value;}};
  custody = new CurrentPcbViaMainLiveHistoryCustody(host);
  const samples=currentPcbViaMainLiveHistoryNativeCases();const order=["arm","frame","join-capture","properties-packet","properties-projectSql","properties-table","properties-branches","join-value","remove","step","release"];
  let complete=false;
  try{for(const name of order){const sample=samples.find(candidate=>`${candidate.phase}${"role" in candidate?`-${candidate.role}`:""}`===`via-main-live-${name}`);assert.ok(sample!==undefined);const input=structuredClone(sample);
    if(input.phase==="via-main-live-arm"){input.params.location.scriptId="script";}
    else if(input.phase==="via-main-live-frame"){input.params.callFrameId="frame";}
    else if(input.phase==="via-main-live-join"){input.params.objectId=input.role==="capture"?"frame-packet":"capture-packet";input.params.arguments=input.role==="capture"?[{objectId:"sql-capture"},{objectId:"prior-sql"}]:[];}
    else if(input.phase==="via-main-live-properties"){input.params.objectId=input.role==="packet"?"capture-packet":`fn-${input.role}`;}
    else if(input.phase==="via-main-live-remove"){input.params.breakpointId="point";}
    await custody.request(input,input.phase==="via-main-live-remove"||input.phase==="via-main-live-release");}
    const value=custody.result();assert.equal(Object.isFrozen(value.rows),true);complete=true;
  }catch(error){if(scenario==="positive"){throw error;}assert.throws(()=>custody.result(),/FAILED/u);}
  return{calls,resumed,complete};
}
void test("production custody consumes original native acknowledgements and removes its own point before one resume",async()=>{
  const result=await cursor("positive");assert.equal(result.complete,true);assert.equal(result.resumed,true);assert.equal(result.calls.length,11);assert.deepEqual(result.calls.slice(-3),["via-main-live-remove","via-main-live-step","via-main-live-release"]);
});
void test("foreign actual scope and lost native acknowledgement stay held without a readonly resume or reconstructed packet",async()=>{
  for(const scenario of ["foreign-head","lost-ack"]as const){const result=await cursor(scenario);assert.equal(result.complete,false);assert.equal(result.resumed,false);assert.equal(result.calls.includes("via-main-live-step"),false);}
});
