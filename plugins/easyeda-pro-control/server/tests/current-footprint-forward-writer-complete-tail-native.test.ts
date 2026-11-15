/** Fixed native rows and actual inert V8 breakpoint behavior; no owner, app or helper is issued. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {gunzipSync} from "node:zlib";
import {z} from "zod";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS,currentFootprintForwardWriterCompleteTailDispatch,currentFootprintForwardWriterCompleteTailNativeSource} from "../src/current-footprint-forward-writer-complete-tail-native.ts";
import {currentFootprintForwardWriterFrontierCases,currentFootprintForwardWriterFrontierTemplate} from "../src/current-footprint-forward-writer-frontier-protocol.ts";
import {currentFootprintForwardWriterFrontierNativeSource} from "../src/current-footprint-forward-writer-frontier-native.ts";

function table(name:string):readonly string[][]{
 const source=currentFootprintForwardWriterCompleteTailNativeSource(),start=source.indexOf(`internal static class ${name} {`);assert.notEqual(start,-1);
 const end=source.indexOf("\n}",start);assert.ok(end>start);
 const found=/EasyedaDiagnosticFixedTable\.Load\("([A-Za-z0-9+/=]+)",([0-9]+),"([a-f0-9]{64})","([a-f0-9]{64})",([0-9]+),4\)/u.exec(source.slice(start,end));assert.ok(found!==null);
 const [,packedText,length,decodedHash,packedHash,count]=found;assert.ok(packedText!==undefined&&length!==undefined&&decodedHash!==undefined&&packedHash!==undefined&&count!==undefined);
 const packed=Buffer.from(packedText,"base64");assert.equal(packed.toString("base64"),packedText);assert.equal(createHash("sha256").update(packed).digest("hex"),packedHash);
 // oxlint-disable-next-line node/no-sync -- Independently decode bounded immutable build-time codebook bytes, never supplied input.
 const bytes=gunzipSync(packed,{maxOutputLength:60_000});assert.equal(bytes.length,Number(length));assert.equal(createHash("sha256").update(bytes).digest("hex"),decodedHash);
 const rows=bytes.toString("utf8").split("\0").map(row=>row.split("\t"));assert.equal(rows.length,Number(count));for(const row of rows){assert.equal(row.length,4);}return rows;
}
const locationSchema=z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()});
const commandSchema=z.strictObject({method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:locationSchema,condition:z.string().optional()})});
function arm(row:readonly string[]):z.infer<typeof commandSchema>{assert.ok(row[3]!==undefined);return commandSchema.parse(JSON.parse(row[3]));}
async function retain(pending:Promise<unknown>,failures:unknown[]):Promise<void>{try{await pending;}catch(error){failures.push(error);}}
void test("complete fixed arms observe ready callbacks in actual inert V8 while historical startup arms remain suppressed",async()=>{
 const before=currentFootprintForwardWriterFrontierNativeSource(),session=new Session();session.connect();
 const script:{value:Readonly<{id:string;context:number}>|null}={value:null};const failures:unknown[]=[];let pauses=0;
 session.on("Debugger.scriptParsed",event=>{if(event.params.url==="synthetic-forward-ready-arms.js"){script.value={id:event.params.scriptId,context:event.params.executionContextId};}});
 session.on("Debugger.paused",()=>{pauses+=1;void retain(session.post("Debugger.resume"),failures);});
 const points:string[]=[];
 try{
  await session.post("Runtime.enable");await session.post("Debugger.enable");
  const context=createContext({});runInContext('globalThis.PROJECT={isReady:true};\nglobalThis.entry=function entry(){\n return 1;\n};\n//# sourceURL=synthetic-forward-ready-arms.js',context);
  const selected=script.value;assert.ok(selected!==null);
  const original=currentFootprintForwardWriterFrontierCases().find(value=>value.command.phase==="project-save-structure-arm"&&value.command.role==="startupEntry");assert.ok(original!==undefined);
  const old=commandSchema.parse(JSON.parse(currentFootprintForwardWriterFrontierTemplate(original).template));assert.ok(old.params.condition!==undefined);
  const current=arm(table("EasyedaForwardWriterCompleteArmRows")[0]??[]);assert.equal(current.params.condition,undefined);
  for(const [params,expected]of[[old.params,0],[current.params,1]]as const){
   const point=await session.post("Debugger.setBreakpoint",{...params,location:{scriptId:selected.id,lineNumber:2,columnNumber:1}});points.push(point.breakpointId);
   const result:unknown=await session.post("Runtime.evaluate",{contextId:selected.context,expression:"entry.call(PROJECT)",returnByValue:true});assert.deepEqual(result,{result:{type:"number",value:1,description:"1"}});assert.equal(pauses,expected);
   await session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId});points.pop();
  }
  assert.deepEqual(failures,[]);assert.equal(currentFootprintForwardWriterFrontierNativeSource(),before);
 }finally{try{for(const breakpointId of points){await session.post("Debugger.removeBreakpoint",{breakpointId});}}finally{session.disconnect();}}
});
void test("ready native rows and complete-only dispatch preserve closed programs, numeric handles and original birth isolation",()=>{
 const ready=table("EasyedaForwardWriterReadyPublicationRows");assert.equal(ready.length,3);
 for(const row of ready){assert.ok(row[3]!==undefined);assert.match(row[3],/own\(project,\\"isReady\\"\)!==true/u);assert.doesNotMatch(row[3],/own\(project,\\"isReady\\"\)!==false/u);}
 assert.equal(table("EasyedaForwardWriterCompleteBranchProtocol").length,10);
 const dispatch=currentFootprintForwardWriterCompleteTailDispatch();assert.equal(new Set(CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS).size,17);
 for(const action of CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS){assert.equal(dispatch.split(`'${action}' {`).length,2);}
 assert.equal(dispatch.match(/if\(-not \$WorkerStartupFootprintForwardWriterComplete209 -or -not \$launched/gu)?.length,17);
 assert.doesNotMatch(dispatch,/functionDeclaration|sessionId|WorkerStartupFootprintForwardWriter209 -or/u);
 assert.match(dispatch,/\$role=\[System\.Management\.Automation\.Language\.NullString\]::Value;\$records=0/u);assert.doesNotMatch(dispatch,/\$role=\$null/u);
 const native=currentFootprintForwardWriterCompleteTailNativeSource();assert.match(native,/\[A-Za-z0-9_.:-\]\{1,256\}/u);
 assert.match(native,/bool forwardWriterCompleteBirth=false,forwardWriterCompleteTimerBaseline=false,forwardWriterCompletePublishTimerComplete=false;/u);
 assert.match(native,/forward-complete-natural-timer-required/u);assert.doesNotMatch(native,/\bviaDrainRequests\b|\bviaPostSyncStep\b|\bpcbViaWrite209\b/u);
});
