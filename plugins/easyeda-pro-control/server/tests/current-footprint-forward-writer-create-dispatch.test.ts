/** Actual Core dispatch/queue reproof/join methods with explicit inert
 * original maps and loader/native peers. No production issuer or owner. */
/* oxlint-disable import/max-dependencies -- Join the maintained methods to real command/capacity parsers while substituting only explicit inert custody and native dispatch. */
import {deriveCurrentFootprintForwardWriterColdCapacity,requireOriginalCurrentFootprintForwardWriterColdCapacity} from "../src/current-footprint-forward-writer-cold-capacity.ts";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInThisContext} from "node:vm";
import {setImmediate as nextTurn} from "node:timers/promises";
import {test} from "node:test";
import {transform} from "esbuild";
import {canonicalJson} from "../src/core.ts";
import {currentFootprintCopyNativeCreateCommand as command,currentFootprintCopyNativeCreateWire as wire} from "../src/current-footprint-copy-native-create-wire.ts";
import {requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy} from "../src/current-footprint-forward-writer-main-request-plan.ts";
import {deriveCurrentFootprintForwardWriterCompleteCapacity as deriveCapacity,requirePrecreateCurrentFootprintForwardWriterCompleteCapacity as requirePrecreate} from "../src/current-footprint-forward-writer-complete-capacity.ts";
import {completeCapacityFixture} from "./helpers/footprint-forward-complete-capacity-fixture.ts";

interface Attempt{dispatch:Promise<object>;join:Promise<string>|null;failed:boolean;failure:unknown}
interface Fixture{
 owner:{dispatchFootprintForwardWriterCreate:(origin:object,intent:object)=>Promise<object>;joinFootprintForwardWriterCreate:(origin:object,pending:object)=>Promise<string>;reproveForTest:(request:object)=>Promise<void>};
 origin:object;intent:object;pending:object;request:object;fs:PromiseWithResolvers<unknown>;result:PromiseWithResolvers<string>;attempt:()=>Attempt|undefined;
 state:{dispatchCalls:number;writes:number;joins:number;proofs:number;fence:boolean;whole:boolean;failAck:boolean;tail:boolean};
}
async function fixture():Promise<Fixture>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");const a=source.indexOf("  /** Same original complete route only;"),b=source.indexOf("  #endFootprintForwardWriterClock()",a);assert.ok(a>0&&b>a);
 const methods=source.slice(a,b).replaceAll("#","_").replace("_reproveForwardWriterCreateAtWrite","reproveForTest");
 const f=await completeCapacityFixture();const copy=requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy(f.reservation);const capacity=deriveCapacity(f.reservation,f.input,f.flow,f.publication);
 const coldCapacity=deriveCurrentFootprintForwardWriterColdCapacity(capacity,copy);
 const env={coldCapacity,requireCold:requireOriginalCurrentFootprintForwardWriterColdCapacity,canonicalJson,command,wire,copy,capacity,input:f.input,flow:f.flow,maximum:f.publication,reservation:f.reservation,requirePrecreate};
 const prelude=String.raw`
const{coldCapacity,requireCold:requireOriginalCurrentFootprintForwardWriterColdCapacity,canonicalJson,command:currentFootprintCopyNativeCreateCommand,wire:currentFootprintCopyNativeCreateWire,copy,capacity,input,flow,maximum,reservation,requirePrecreate:requirePrecreateCurrentFootprintForwardWriterCompleteCapacity}=env;
const origin={},intent={},capability={},mainOrigin={},intervalToken={},pending={profile:"inert-pending"},fs=Promise.withResolvers(),result=Promise.withResolvers();
const state={dispatchCalls:0,writes:0,joins:0,proofs:0,fence:true,whole:true,failAck:false,tail:false};
const forwardWriterCopyDrains=new WeakMap(),forwardWriterCreateDispatches=new WeakMap(),forwardWriterProducerOwnerIntervals=new WeakMap(),forwardWriterProducerIntervals=new WeakMap(),forwardWriterPublications=new WeakMap(),forwardWriterTicketTimers=new WeakMap(),forwardWriterProducerOwners=new WeakMap(),forwardWriterFrontiers=new WeakMap();
const exact=(value,names)=>value!==null&&typeof value==="object"&&Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name));
const error=code=>new Error(code),currentFootprintForwardWriterCompleteProfile=()=>({wholeWriterReserved:state.whole}),assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner=()=>{},assertOriginalForwardWriterTicketClasses=()=>{};
class CurrentFootprintCopyMainBackendRunner{requireForwardWriterSelectedUsersReadContinuity(value){if(value!==capability||!state.fence)throw Error("inert-original-fence-ended");}}
const runner=new CurrentFootprintCopyMainBackendRunner();const requireOriginalCurrentFootprintForwardMainRunner=value=>{if(value!==runner)throw Error("wrong-original-runner");};
const journal={async assertCurrent(){}};const interval={consumed:true,capability,origin:mainOrigin,runner,assertOriginal(){}},publication={coldCapacity,originalSource:{owned:{copyPlan:copy}},capacity,request:reservation,maximum,journal,journalTail:Promise.resolve(),startup:{data:{input,flow},journal,journalTail:Promise.resolve()}};
const binding={workerSessionId:"session27",copyPlan:copy,invocationBinding:{projectObjectId:"project27",handles:["arg01","arg12","arg23","arg34","arg45"],prewriteHandles:["scope27","original27","upload27"]}};
const request=currentFootprintCopyNativeCreateWire(JSON.stringify(currentFootprintCopyNativeCreateCommand(binding.workerSessionId,binding.invocationBinding.projectObjectId,binding.invocationBinding.handles,copy,binding.invocationBinding.prewriteHandles)),79).request;
let owner=null;
const route={async dispatchCreate(){state.dispatchCalls++;await owner.reproveForTest(request);const attempt=forwardWriterCreateDispatches.get(owner);if(!attempt||!attempt.reservedWrite)throw Error("missing-original-write");attempt.sendConsumed=true;state.writes++;if(state.failAck)throw Error("inert-native-ack-lost");return pending;},async joinCreate(value){if(value!==pending)throw Error("wrong-original-pending");state.joins++;return result.promise;}};
const requireCurrentFootprintForwardWriterCreateClockChannelRoute=value=>{if(value!==route)throw Error("wrong-original-route");return binding;};
const intentModule={requireOriginalCurrentFootprintForwardWriterConsumedCreateIntent(token,native,cap,main,clock){if(token!==intent||native!==owner||cap!==capability||main!==mainOrigin||clock!==origin)throw Error("wrong-original-intent");},async reproveOriginalCurrentFootprintForwardWriterConsumedCreateIntent(...args){intentModule.requireOriginalCurrentFootprintForwardWriterConsumedCreateIntent(...args);state.proofs++;await fs.promise;}};
const workflowModule={
 requireOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission(native,cap,main,clock,token){intentModule.requireOriginalCurrentFootprintForwardWriterConsumedCreateIntent(token,native,cap,main,clock);},
 async reproveOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission(...args){workflowModule.requireOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission(...args);},
 requireOriginalCurrentFootprintForwardWriterWorkflowCreateJoin(native,cap,main,clock,token,actual){workflowModule.requireOriginalCurrentFootprintForwardWriterWorkflowCreateAdmission(native,cap,main,clock,token);if(actual!==pending||!state.tail)throw Error("wrong-original-join-scope");},
 async reproveOriginalCurrentFootprintForwardWriterWorkflowCreateJoin(...args){workflowModule.requireOriginalCurrentFootprintForwardWriterWorkflowCreateJoin(...args);}
};
const timerResult={},producer={origin:{},context:{sessionId:"session27"}};
const joinedContext={capability,mainOrigin,clockOrigin:origin,backend:runner,timer:timerResult,clocks:{samples:[{documentUuid:"created27"},{documentUuid:"created27"}]}};
const pairModule={requireOriginalCurrentFootprintForwardWriterCreateJoin(actual,native,clock){if(actual!==pending||native!==owner||clock!==origin)throw Error("wrong-original-joined-token");return joinedContext;}};
const decodeCurrentFootprintCopyV2NativeResult=(plan,serialized)=>{if(plan!==copy||serialized!=='{"inert":true}')throw Error("wrong-original-test-result");return{returnedUuid:"created27"};};
publication.scope=producer;publication.failed=false;publication.bodyBound=true;publication.driver={status(){return{completed:state.tail}}};
const drain={main:runner,get nativeCompleted(){return state.tail},get postCompleted(){return state.tail},get publicationCompleted(){return state.tail},cursor:{progress(){return{completed:state.tail}}},post:{progress(){return{completed:state.tail}}}};
forwardWriterCopyDrains.set(producer.origin,drain);
class ActualCoreCreateFixture{
 _forwardWriterClockRoute=route;_startupHandoff={};_forwardWriterClockUnit={origin};
 _request(request){if(request.action!=="footprint-forward-copy-tail-control"||request.operation!=="final-complete")throw Error("wrong-original-tail");return Promise.resolve({completed:true});}
 _available(){};originalFootprintForwardWriterClockRunners(value){if(value!==origin)throw Error("wrong-original-clock");};originalFootprintForwardWriterSource(){return{owned:{copyPlan:copy}};}
 _requireFootprintForwardWriterPublication(value){if(value!==publication)throw Error("wrong-original-publication");}
 requireOriginalForwardWriterMainRunner(value,mode){if(value!==runner||mode!=="normal")throw Error("wrong-original-main");}
`;
 const suffix="}\nowner=new ActualCoreCreateFixture();forwardWriterProducerOwnerIntervals.set(owner,intervalToken);forwardWriterProducerIntervals.set(intervalToken,interval);forwardWriterPublications.set(owner,publication);forwardWriterFrontiers.set(owner,publication.startup);forwardWriterTicketTimers.set(owner,{journal,journalTail:Promise.resolve(),wsObserved:true,finishResult:timerResult,finishPending:Promise.resolve(timerResult),failed:false,driver:{status(){return{beforeCreate:!state.tail,complete:state.tail}}}});forwardWriterProducerOwners.set(owner,producer);return{owner,origin,intent,pending,request,fs,result,state,intentModule,workflowModule,pairModule,attempt:()=>forwardWriterCreateDispatches.get(owner)};";
 // Standard CommonJS lowering lets the test loader substitute exactly the
 // Exact intent, workflow and completed-join dependencies. Production method source remains unchanged.
 const compiled=await transform(`export function make(env){${prelude}${methods}${suffix}}`,{loader:"ts",format:"cjs",target:"node24",supported:{"dynamic-import":false}});
 const loaded:{exports:Record<string,unknown>}={exports:{}};let intentModule:unknown=null,pairModule:unknown=null,workflowModule:unknown=null;
 const evaluate:unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");
 Reflect.apply(evaluate,undefined,[(name:string):unknown=>{const modules:Readonly<Record<string,unknown>>={"./current-footprint-forward-writer-create-intent.ts":intentModule,"./current-footprint-forward-writer-workflow.ts":workflowModule,"./current-footprint-forward-writer-paired-scheduler.ts":pairModule};assert.ok(Object.hasOwn(modules,name));const selected=modules[name];assert.ok(selected!==null&&typeof selected==="object");return selected;},loaded,loaded.exports]);
 const make=loaded.exports["make"];assert.ok(typeof make==="function");const value:unknown=Reflect.apply(make,undefined,[env]);assert.ok(value!==null&&typeof value==="object");intentModule=Reflect.get(value,"intentModule");workflowModule=Reflect.get(value,"workflowModule");pairModule=Reflect.get(value,"pairModule");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The checked test factory returns only these explicit inert peers; maintained Core methods are copied unchanged before standard module lowering.
 return value as Fixture;
}
async function handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch{
 // The exact same failure remains available to the test assertions.
}}
void test("Core retains the sole original dispatch while filesystem reproof blocks, then joins only its actual pending token",async()=>{
 const f=await fixture();const dispatch=f.owner.dispatchFootprintForwardWriterCreate(f.origin,f.intent);void handled(dispatch);assert.equal(f.attempt()?.dispatch,dispatch);await nextTurn();assert.equal(f.state.proofs,1);assert.equal(f.state.writes,0);await assert.rejects(f.owner.reproveForTest(f.request),/WRITE_ONCE/u);
 f.fs.resolve(null);const pending=await dispatch;assert.equal(pending,f.pending);assert.equal(f.state.writes,1);await assert.rejects(f.owner.dispatchFootprintForwardWriterCreate(f.origin,f.intent),/CONSUMED_OR_WHOLE/u);
 await assert.rejects(f.owner.joinFootprintForwardWriterCreate(f.origin,{...pending}),/ORIGINAL_PENDING/u);f.state.fence=false;f.state.tail=true;
 const joined=f.owner.joinFootprintForwardWriterCreate(f.origin,pending);assert.equal(f.attempt()?.join,joined);await nextTurn();assert.equal(f.state.joins,1);f.result.resolve('{"inert":true}');assert.equal(await joined,'{"inert":true}');assert.equal(f.state.proofs,1);
});
void test("lost native ACK and raw null/undefined filesystem failures never restore the original dispatch",async()=>{
 const lost=await fixture();lost.state.failAck=true;lost.fs.resolve(null);await assert.rejects(lost.owner.dispatchFootprintForwardWriterCreate(lost.origin,lost.intent),/inert-native-ack-lost/u);assert.equal(lost.state.writes,1);await assert.rejects(lost.owner.dispatchFootprintForwardWriterCreate(lost.origin,lost.intent),/CONSUMED_OR_WHOLE/u);assert.equal(lost.state.dispatchCalls,1);
 for(const cause of[null,undefined]){const f=await fixture();const pending=f.owner.dispatchFootprintForwardWriterCreate(f.origin,f.intent);void handled(pending);await nextTurn();f.fs.reject(cause);await assert.rejects(pending,error=>error===cause);assert.equal(f.attempt()?.failed,true);assert.equal(f.attempt()?.failure,cause);assert.equal(f.state.writes,0);}
});
void test("missing whole reservation and a replaced prewrite users fence refuse before native write",async()=>{
 const whole=await fixture();whole.state.whole=false;await assert.rejects(whole.owner.dispatchFootprintForwardWriterCreate(whole.origin,whole.intent),/WHOLE_RESERVATION/u);assert.equal(whole.state.dispatchCalls,0);
 const changed=await fixture();const pending=changed.owner.dispatchFootprintForwardWriterCreate(changed.origin,changed.intent);void handled(pending);await nextTurn();changed.state.fence=false;changed.fs.resolve(null);await assert.rejects(pending,/inert-original-fence-ended/u);assert.equal(changed.state.writes,0);
});
