/** Actual retained channel with explicitly synthetic constructor/context
 * prerequisites and native replies. No native owner, app or Job is allocated. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_OWN_DATA_PROGRAMS as PROGRAMS,currentFootprintForwardWriterOwnDataCases,validateCurrentFootprintForwardWriterOwnDataCommand} from "../src/current-footprint-forward-writer-own-data-protocol.ts";
import {forwardWriterClockChannelFixture} from "./helpers/footprint-forward-writer-clock-channel-fixture.ts";
import type {CreateClockNativeCommand} from "./helpers/footprint-forward-writer-clock-channel-fixture.ts";

function commands():Readonly<{literal:ReturnType<typeof currentFootprintForwardWriterOwnDataCases>[number];helper:ReturnType<typeof currentFootprintForwardWriterOwnDataCases>[number]}>{
 const rows=currentFootprintForwardWriterOwnDataCases();const first=rows[0],last=rows.at(-1);assert.ok(first!==undefined&&last!==undefined&&last.method==="Debugger.getScriptSource");
 return {literal:validateCurrentFootprintForwardWriterOwnDataCommand({...first,params:{...first.params,uniqueContextId:"worker-context"}}),helper:last};
}
function forbidden():never{throw new Error("unexpected-create-or-clock");}
void test("the actual full preclock channel captures its same-context helper event and admits only its original source read",async()=>{
 const rows=commands();let current:CreateClockNativeCommand={...rows.literal,sessionId:"worker"};const events:object[]=[];
 const f=await forwardWriterClockChannelFixture(true,{},{
  begin:forbidden,retire:():Promise<void>=>Promise.resolve(),create:forbidden,nextCommand:()=>current,
  request:(command):Promise<unknown>=>{
   if(command.phase==="forward-writer-own-data-literal"){events.push({method:"Debugger.scriptParsed",sessionId:"worker",params:{scriptId:"script27",executionContextId:42,url:"",length:PROGRAMS.literal.length+2,startLine:0,startColumn:0,isModule:false}});return Promise.resolve({});}
   assert.equal(command.phase,"forward-writer-own-data-helper");return Promise.resolve({scriptSource:`(${PROGRAMS.literal})`});
  },pump:():Promise<void>=>Promise.resolve(),takeEvent:():object|null=>events.shift()??null,
 },true,true,9000);
 try{
  f.channel.prepareBranchQueryForTest();await f.channel.requestForwardWriterOwnData(f.dependency,rows.literal);
  const sent=f.state.sent.length;await assert.rejects(f.channel.requestForwardWriterOwnData(f.dependency,rows.literal));await assert.rejects(f.channel.qualifyForwardWriterOwnDataHelper(f.dependency,rows.literal,`${PROGRAMS.literal} `));assert.equal(f.state.sent.length,sent);
  current={...rows.helper,sessionId:"worker"};await f.channel.qualifyForwardWriterOwnDataHelper(f.dependency,rows.literal,PROGRAMS.literal);
  await assert.rejects(f.channel.qualifyForwardWriterOwnDataHelper(f.dependency,rows.literal,PROGRAMS.literal));
  const writes=f.state.sent.filter(row=>row["action"]==="footprint-forward-own-data");assert.deepEqual(writes.map(row=>row["requestId"]),[9000,9001]);assert.equal(writes[1]?.["scriptId"],"script27");assert.equal(f.state.consumed,0);
 }finally{f.state.exited=true;await f.channel.releaseAfterTermination();}
});
void test("a full clock reservation cannot admit a late reflection collector",async()=>{
 const rows=commands();const current:CreateClockNativeCommand={...rows.literal,sessionId:"worker"};
 const f=await forwardWriterClockChannelFixture(true,{},{
  begin:forbidden,retire:():Promise<void>=>Promise.resolve(),create:forbidden,nextCommand:()=>current,request:():Promise<unknown>=>Promise.resolve({}),pump:():Promise<void>=>Promise.resolve(),takeEvent:():null=>null,
 },true,true,9000);
 try{const sent=f.state.sent.length;await assert.rejects(f.channel.requestForwardWriterOwnData(f.dependency,rows.literal));assert.equal(f.state.sent.length,sent);assert.equal(f.state.consumed,0);}
 finally{f.state.exited=true;await f.channel.releaseAfterTermination();}
});
