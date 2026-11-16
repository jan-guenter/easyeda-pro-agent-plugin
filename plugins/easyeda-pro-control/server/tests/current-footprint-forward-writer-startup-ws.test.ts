/** Actual early Core read and cleanup joins, with explicit inert owner/
 * native peers. No production helper, worker or deployment is created. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setImmediate as nextTurn} from "node:timers/promises";
import {runInThisContext} from "node:vm";
import {test} from "node:test";
import {transform} from "esbuild";
import {z} from "zod";
import {CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES} from "../src/current-project-save-structure-protocol.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_WS_FLAGS as FLAGS,currentFootprintForwardWriterStartupWsWire,decodeCurrentFootprintForwardWriterStartupWs as decode} from "../src/current-footprint-forward-writer-startup-ws-protocol.ts";

interface Fixture{
 owner:{observe:(scope:object,fresh:()=>Promise<void>)=>Promise<void>;retire:()=>Promise<void>};
 scope:object;component:{wsPending:Promise<void>|null;pending:Promise<unknown>[];wsObserved:boolean;failed:boolean;failure:unknown;retired:boolean};
 state:{reads:number;ended:boolean;failed:boolean};held:PromiseWithResolvers<unknown>;replaceEvent:()=>void;records:Readonly<{kind:string;evidence:Readonly<Record<string,unknown>>}>[];
}
async function fixture():Promise<Fixture>{
 const text=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const a=text.indexOf("  #observeForwardWriterStartupWs("),b=text.indexOf("  /** Original natural-timer preparation",a),c=text.indexOf("  async #retireForwardWriterTicketTimer()"),d=text.indexOf("  /** Keep the original complete setup Promise",c);assert.ok(a>0&&b>a&&c>b&&d>c);
 const methods=(text.slice(a,b)+text.slice(c,d)).replaceAll("#","_").replace("_observeForwardWriterStartupWs","observe").replace("_retireForwardWriterTicketTimer","retire");
 const prelude=String.raw`
const forwardWriterTicketTimers=new WeakMap(),forwardWriterFrontiers=new WeakMap(),held=Promise.withResolvers(),state={reads:0,ended:false,failed:false},records=[];
const assertOriginalForwardWriterTicketClasses=()=>{},assertOriginalCurrentFootprintForwardWriterNativeOwner=()=>{},qualifyCurrentFootprintForwardWriterStartupNonprivateSource=()=>{},CURRENT_PCB_209_WORKER_STARTUP_SOURCE={sha256:"0".repeat(64)},sha256Json=()=>"1".repeat(64),error=code=>new Error(code);
const scope={source:{workerSource:"explicit-inert-source",scriptId:"worker27",dependency:{},fail(){state.failed=true;}},assertOriginal(){},failed:false,firstFailure:null};
let event={method:"Debugger.paused",sessionId:"session27",params:{callFrames:[{callFrameId:"frame27",location:{scriptId:"worker27",lineNumber:SITES.startupEntry.lineNumber,columnNumber:SITES.startupEntry.columnNumber}}]}};
const driver={originalCallbackEvent(){return event;}},frontier={driver,data:{input:{}}};
const forwardWriterStartupWsLocationSchema=z.looseObject({scriptId:z.string(),lineNumber:z.number().int(),columnNumber:z.number().int()}),forwardWriterStartupWsCallFrameSchema=z.looseObject({callFrameId:z.string(),location:forwardWriterStartupWsLocationSchema}),forwardWriterStartupWsFrameSchema=z.looseObject({callFrames:z.array(forwardWriterStartupWsCallFrameSchema).min(1).max(32)});
const CURRENT_PROJECT_SAVE_STRUCTURE_SITES=SITES,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_WS_FLAGS=FLAGS,decodeCurrentFootprintForwardWriterStartupWs=decode;
async function requestCurrentFootprintForwardWriterStartupWs(_dependency,command){state.reads++;const wire=wireFor(command,1);if(wire.request.callFrameId!=="frame27")throw Error("fixture-frame");return held.promise;}
const journal={async append(kind,evidence){records.push({kind,evidence});},async waitForCurrentPublication(){},async settle(){},reservationOutcome(){return"retained";},retained(){return{records};}};
const component={wsPending:null,pending:[],wsObserved:false,failed:false,failure:null,retired:false,journal,journalTail:Promise.resolve(),driver:null};
class ActualCoreMethodsFixture{
 _terminationObserved=true;_terminationObservation={terminated:true};
 async _ticketTimerJournal(_component,kind,evidence){await journal.append(kind,evidence);}
`;
 const suffix="}\nconst owner=new ActualCoreMethodsFixture();forwardWriterTicketTimers.set(owner,component);forwardWriterFrontiers.set(owner,frontier);return{owner,scope,component,state,held,records,replaceEvent(){event={...event};}};";
 const transformed=await transform(`(function(z,SITES,FLAGS,decode,wireFor){${prelude}${methods}${suffix}})`,{loader:"ts",format:"cjs",target:"node24"});
 const make:unknown=runInThisContext(transformed.code);assert.ok(typeof make==="function");const value:unknown=Reflect.apply(make,undefined,[z,SITES,FLAGS,decode,currentFootprintForwardWriterStartupWsWire]);
 assert.ok(value!==null&&typeof value==="object");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit inert factory above returns this checked fixture record; Core methods are copied unchanged.
 return value as Fixture;
}
async function fresh():Promise<void>{await Promise.resolve();}
async function handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch{
 // Retain the same original failure for the following assertions.
}}
void test("early deployment read retains its exact pending Promise and cannot publish false from a replacement held event",async()=>{
 const f=await fixture();const pending=f.owner.observe(f.scope,fresh);void handled(pending);assert.equal(f.component.wsPending,pending);assert.equal(f.component.pending[0],pending);await nextTurn();assert.equal(f.state.reads,1);f.replaceEvent();
 f.held.resolve({result:{type:"boolean",value:false}});await assert.rejects(pending,/FORWARD_STARTUP_WS_CHANGED/u);assert.equal(f.component.wsObserved,false);assert.equal(f.records.some(row=>row.kind==="ws-result"),false);await f.owner.retire();assert.equal(f.component.retired,true);
});
void test("early deployment read rejects private/unknown values and original exit joins raw null failures",async()=>{
 for(const cause of[null,undefined]){
  const f=await fixture();const pending=f.owner.observe(f.scope,fresh);void handled(pending);await nextTurn();let ended=false;const end=(async():Promise<void>=>{await f.owner.retire();ended=true;})();await nextTurn();assert.equal(ended,false);
  f.held.reject(cause);await assert.rejects(pending,error=>error===cause);await end;assert.equal(f.component.failure,cause);assert.equal(f.component.failed,true);assert.equal(f.component.wsObserved,false);assert.equal(f.state.reads,1);
 }
 for(const value of[true,0,"false",null]){assert.throws(()=>decode({result:{type:typeof value,value}}));}
});
void test("only false from the retained original held frame records websocket exclusion once",async()=>{
 const f=await fixture();const pending=f.owner.observe(f.scope,fresh);await nextTurn();f.held.resolve({result:{type:"boolean",value:false}});await pending;assert.equal(f.component.wsObserved,true);assert.equal(f.owner.observe(f.scope,fresh),pending);assert.equal(f.state.reads,1);assert.equal(f.records.filter(row=>row.kind==="ws-result").length,1);await f.owner.retire();
});
