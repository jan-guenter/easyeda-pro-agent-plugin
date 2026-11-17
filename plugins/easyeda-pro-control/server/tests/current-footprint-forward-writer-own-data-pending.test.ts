/** Actual Core setup and exit methods over explicitly synthetic maps,
 * constructor prerequisites and one blocked native control acknowledgment.
 * No original production owner, pipe, helper, Job or app is created. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {parse} from "acorn";
import {test} from "node:test";
import {setImmediate as yieldToLoop} from "node:timers/promises";
import {runInThisContext} from "node:vm";
import {transform} from "esbuild";

interface Fixture{
 readonly owner:{prepareFootprintForwardWriterOwnData:(runner:object)=>Promise<void>;retireForTest:()=>Promise<void>};
 readonly runner:object;readonly held:PromiseWithResolvers<unknown>;
 readonly state:{calls:number;failures:number};
 readonly scope:{retired:boolean;failed:boolean;firstFailure:unknown};
 readonly originals:WeakMap<object,{pending:Promise<undefined>;failed:boolean;failure:unknown;capture:unknown}>;
}
async function fixture():Promise<Fixture>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const plain=stripTypeScriptTypes(source,{mode:"transform"});const tree=parse(plain,{ecmaVersion:"latest",sourceType:"module"});
 const matches=tree.body.filter(node=>node.type==="FunctionDeclaration"&&node.id?.name==="failForwardWriterProducerScope");assert.equal(matches.length,1);const helper=matches[0];assert.ok(helper?.type==="FunctionDeclaration");const failureHelper=plain.slice(helper.start,helper.end);
 const begin=source.indexOf("  public prepareFootprintForwardWriterOwnData("),end=source.indexOf("  /** The sole readonly worker GET",begin);assert.ok(begin!==-1&&end>begin);
 const retireBegin=source.indexOf("  async #retireForwardWriterProducer()"),retireEnd=source.indexOf("  static async #captureProducerIntrinsics",retireBegin);assert.ok(retireBegin!==-1&&retireEnd>retireBegin);
 const methods=(source.slice(begin,end)+source.slice(retireBegin,retireEnd)).replaceAll("#","_").replace("_retireForwardWriterProducer","retireForTest");
 const prelude=String.raw`
const forwardWriterCreateDispatches=new WeakMap(),forwardWriterOwnDataOriginals=new WeakMap(),forwardWriterProducerOwners=new WeakMap(),footprintForwardWriterCompleteFactories=new WeakSet(),forwardWriterCopyTailObservations=new WeakMap(),forwardWriterCopyDrains=new WeakMap();
const state={calls:0,failures:0},runner={},held=Promise.withResolvers(),startup={projectObjectId:"project27",sessionId:"worker",uniqueContextId:"context27"};
const assertOriginalCurrentFootprintForwardWriterNativeOwner=()=>{},assertOriginalCurrentProjectSaveProducerObserverClass=()=>{},requireOriginalCurrentFootprintForwardWriterStartup=()=>startup,error=code=>new Error(code);
const scope={intrinsics:"cache28",event:null,resumeExpected:false,continuation:null,read:Promise.resolve(),source:{project:"project27",assertCurrent:async()=>{},fail(){state.failures++;}},channel:{assertCurrent:async()=>{}},context:{sessionId:"worker",uniqueContextId:"context27"},assertOriginal(){},origin:{},retired:false,failed:false,firstFailure:null,observer:null};
class ActualMethodsFixture{
 _forwardWriterProducerIntervalAttempted=false;_forwardWriterClockIssueAttempted=false;
 _forwardWriterBranchQueryPending=null;_forwardWriterProducerIntervalPending=null;_forwardWriterCopyLocalPending=null;_forwardWriterCopyUploadPending=null;
 _mainRunner=null;_terminationObserved=true;_terminationObservation={terminated:true};
 _available(){}
 _request(){state.calls++;return held.promise;}
`;
 const suffix="}\nconst owner=new ActualMethodsFixture();forwardWriterProducerOwners.set(owner,scope);footprintForwardWriterCompleteFactories.add(owner);return {owner,runner,held,state,scope,originals:forwardWriterOwnDataOriginals};";
 const compiled=await transform(`(function(){${failureHelper}${prelude}${methods}${suffix}})`,{loader:"ts",format:"cjs",target:"node24"});
 const make:unknown=runInThisContext(compiled.code);assert.ok(typeof make==="function");
 const value:unknown=Reflect.apply(make,undefined,[]);assert.ok(value!==null&&typeof value==="object");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit inert fixture above constructs this ordinary test record; its methods are copied unchanged from maintained Core.
 return value as Fixture;
}
async function observeRejection(pending:Promise<unknown>):Promise<void>{try{await pending;}catch{
 // The test retains this exact rejection in the following assertions.
}}
void test("Core retains the exact reflection setup Promise and joins null/undefined failures before original observer retirement",async()=>{
 for(const cause of[undefined,null]){
  const f=await fixture(),pending=f.owner.prepareFootprintForwardWriterOwnData(f.runner);void observeRejection(pending);
  const original=f.originals.get(f.owner);assert.ok(original!==undefined);assert.equal(original.pending,pending);
  await assert.rejects(f.owner.prepareFootprintForwardWriterOwnData(f.runner),/CONSUMED_OR_LATE/u);
  await yieldToLoop();assert.equal(f.state.calls,1);
  let ended=false;const ending=(async():Promise<void>=>{await f.owner.retireForTest();ended=true;})();
  await yieldToLoop();assert.equal(ended,false);assert.equal(f.scope.retired,false);
  f.held.reject(cause);await assert.rejects(pending,error=>error===cause);await ending;
  assert.equal(f.scope.retired,true);assert.equal(original.failed,true);assert.equal(original.failure,cause);assert.equal(f.scope.firstFailure,cause);assert.equal(f.scope.failed,true);assert.equal(original.capture,null);assert.equal(f.state.failures,1);assert.equal(f.state.calls,1);
 }
});
