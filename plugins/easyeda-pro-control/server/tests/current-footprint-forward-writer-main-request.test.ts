/* oxlint-disable import/max-dependencies -- Actual SQL copy preparation, independent old/new binders and the fixed collector run against explicitly synthetic origin issuers. */
/** Synthetic original issuers exercise the actual full collector and binder.
 * No native owner, app, genuine Main capability or clock origin is issued. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {test} from "node:test";
import {runInThisContext} from "node:vm";
import {transform} from "esbuild";
import type {CurrentFootprintForwardWriterClockRpcOrigin} from "../src/current-footprint-forward-writer-clock-origin.ts";
import type {CurrentFootprintForwardWriterClockRpcObservation} from "../src/current-footprint-forward-writer-clock-rpc-runner.ts";
import {prepareCurrentFootprintSourcePlan} from "../src/current-footprint-source-plan.ts";
import {prepareCurrentFootprintCopyV2Plan} from "../src/current-footprint-copy-v2-plan.ts";
import {IDS,encrypted,fixture,inventory,mutate} from "./helpers/symbol-sql-fixture.ts";
import {requestCollectorFixture,syntheticRequestSource} from "./helpers/footprint-main-request-collector-fixture.ts";
import type {CurrentFootprintForwardWriterMainRequestOrigin} from "../src/current-footprint-forward-writer-main-origin.ts";

import type {bindCurrentFootprintForwardWriterMainRequestPlan,isCurrentFootprintForwardWriterMainRequestReservation,requireCurrentFootprintForwardWriterMainRequestReservation,reserveCurrentFootprintForwardWriterMainRequestPlan} from "../src/current-footprint-forward-writer-main-request-plan.ts";
import type {isCurrentFootprintCopyMainRequestReservation,requireCurrentFootprintCopyMainRequestReservation,reserveCurrentFootprintCopyMainRequestPlan} from "../src/current-footprint-copy-main-request-plan.ts";
import type {CurrentFootprintCopyMainRequestRunner,createCurrentFootprintForwardMainRequestRunner,createCurrentFootprintForwardWriterMainRequestRunner,requireCurrentFootprintCopyMainRequestHeldFinalPb,requireCurrentFootprintForwardWriterMainRequestHeldFinalPb,requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan,requireOriginalCurrentFootprintForwardWriterHeldContext,requireOriginalCurrentFootprintForwardWriterMainRequestReservation,transferCurrentFootprintCopyMainRequestHeldFinalPb,transferCurrentFootprintForwardWriterMainRequestHeldFinalPb} from "../src/current-footprint-copy-main-request-runner.ts";

type FullPlanApi=Readonly<{reserveCurrentFootprintForwardWriterMainRequestPlan:typeof reserveCurrentFootprintForwardWriterMainRequestPlan;requireCurrentFootprintForwardWriterMainRequestReservation:typeof requireCurrentFootprintForwardWriterMainRequestReservation;isCurrentFootprintForwardWriterMainRequestReservation:typeof isCurrentFootprintForwardWriterMainRequestReservation;bindCurrentFootprintForwardWriterMainRequestPlan:typeof bindCurrentFootprintForwardWriterMainRequestPlan}>;
type OldPlanApi=Readonly<{reserveCurrentFootprintCopyMainRequestPlan:typeof reserveCurrentFootprintCopyMainRequestPlan;requireCurrentFootprintCopyMainRequestReservation:typeof requireCurrentFootprintCopyMainRequestReservation;isCurrentFootprintCopyMainRequestReservation:typeof isCurrentFootprintCopyMainRequestReservation}>;
type EngineApi=Readonly<{requireOriginalCurrentFootprintForwardWriterHeldContext:typeof requireOriginalCurrentFootprintForwardWriterHeldContext;requireOriginalCurrentFootprintForwardWriterMainRequestReservation:typeof requireOriginalCurrentFootprintForwardWriterMainRequestReservation;requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan:typeof requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan;CurrentFootprintCopyMainRequestRunner:typeof CurrentFootprintCopyMainRequestRunner;createCurrentFootprintForwardMainRequestRunner:typeof createCurrentFootprintForwardMainRequestRunner;createCurrentFootprintForwardWriterMainRequestRunner:typeof createCurrentFootprintForwardWriterMainRequestRunner;requireCurrentFootprintCopyMainRequestHeldFinalPb:typeof requireCurrentFootprintCopyMainRequestHeldFinalPb;requireCurrentFootprintForwardWriterMainRequestHeldFinalPb:typeof requireCurrentFootprintForwardWriterMainRequestHeldFinalPb;transferCurrentFootprintCopyMainRequestHeldFinalPb:typeof transferCurrentFootprintCopyMainRequestHeldFinalPb;transferCurrentFootprintForwardWriterMainRequestHeldFinalPb:typeof transferCurrentFootprintForwardWriterMainRequestHeldFinalPb}>;

const CLOCK=1_700_000_000_123;const PROJECT="1".repeat(64);const TARGET="e".repeat(16);const CLIENT="a".repeat(16);
const CONTEXT=Object.freeze({projectUuid:PROJECT,branchUuid:IDS.branch,projectKey:PROJECT,path:"inert-full-main-path"});
const WINDOW=Object.freeze({minimum:CLOCK-10,maximum:CLOCK+10});
const CLOCK_ORIGIN:CurrentFootprintForwardWriterClockRpcOrigin=Object.freeze({profile:"private.current-footprint-forward-writer-clock-rpc-origin.v1"});
function packet():CurrentFootprintForwardWriterClockRpcObservation{return Object.freeze({profile:"private.current-footprint-forward-writer-clock-rpc-observation.v1",samples:Object.freeze([{ordinal:1,producer:"buildString",documentUuid:TARGET,updateTime:CLOCK,lexicalOffset:1,replyTopicSha256:"a".repeat(64)},{ordinal:2,producer:"canvasString",documentUuid:TARGET,updateTime:CLOCK+1,lexicalOffset:2,replyTopicSha256:"b".repeat(64)}]as const),distinctOriginalRequestsAndPendingTasksObserved:true,originalShiftAndSelectedServiceTaskJoined:true,originalCallbackResultAndPostAwaitValueMatched:true,allTenResumesObserved:true,allAllocatedBreakpointsRemoved:true,temporaryGroupsReleased:false,nativeBroadcastSenderHandleAuthenticated:false,backendClockOrSqlCompletionVerified:false,nativeCreateCompletionVerified:false,executionAuthorized:false});}
async function copyPlan(large=false):Promise<Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>>{
 const f=await fixture({project:PROJECT,branch:IDS.branch,target:IDS.target});
 const head=(ticket:number):string=>`${JSON.stringify({type:"DOCHEAD",ticket})}||${JSON.stringify({docType:"FOOTPRINT",client:CLIENT,uuid:IDS.target,updateTime:300,version:"300",editVersion:"3.2.209",user:{uuid:IDS.actor,username:"synthetic-user",nickname:"Synthetic"}})}`;
 const meta=`{"type":"META","ticket":30,"id":"META"}||${JSON.stringify({title:"Source",description:'Keep "Ω"\\\n',tags:["raw"],source:"original"})}`;
 const pad=`{"type":"PAD","ticket":20,"id":"pad"}||${JSON.stringify({number:"1",future:large?"\u0001".repeat(6000):String.raw`raw\Ω`})}`;
 const raw=['{"type":"EDIT_HEAD"}||{}',head(100),meta,pad].join("|\n");
 mutate(f.path,`UPDATE history_data SET dataStr='${encrypted(raw,IDS.oldHead,IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
 const before=await inventory(f.path),source=await prepareCurrentFootprintSourcePlan(before,{projectUuid:PROJECT,branchUuid:IDS.branch,footprintUuid:IDS.target});
 return prepareCurrentFootprintCopyV2Plan(before,source,{client:CLIENT,content:[head(101),meta,head(100),pad].join("|\n")});
}
async function load(file:string,dependencies:Readonly<Record<string,unknown>>):Promise<unknown>{
 const path=new URL(`../src/${file}.ts`,import.meta.url);const loaded={exports:{}};const originalRequire=createRequire(path);const out=await transform(await readFile(path,"utf8"),{loader:"ts",format:"cjs",target:"node24"});
 const evaluate:unknown=runInThisContext(`(function(require,module,exports){${out.code}\n})`);assert.ok(typeof evaluate==="function");Reflect.apply(evaluate,undefined,[(name:string):unknown=>Object.hasOwn(dependencies,name)?dependencies[name]:originalRequire(name)as unknown,loaded,loaded.exports]);return loaded.exports;
}
async function plans(proof?:()=>Promise<void>):Promise<Readonly<{full:FullPlanApi;old:OldPlanApi}>>{
 const reader={requireCurrentFootprintForwardWriterClockRpcObservation:async(observed:unknown,origin:unknown):Promise<void>=>{assert.equal(origin,CLOCK_ORIGIN);assert.ok(observed!==null&&typeof observed==="object"&&"profile"in observed&&observed.profile==="private.current-footprint-forward-writer-clock-rpc-observation.v1");await proof?.();}};
 const oldReader={requireCurrentFootprintCopyClockRpcObservation:():Promise<never>=>Promise.reject(new Error("OLD_CLOCK_READER_REFUSED"))};
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Execute exact production source with the explicitly synthetic full observation issuer above.
 const full=await load("current-footprint-forward-writer-main-request-plan",{"./current-footprint-forward-writer-clock-rpc-runner.ts":reader})as FullPlanApi;
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Old production source uses a separate rejecting synthetic issuer; no full token can enter its map.
 const old=await load("current-footprint-copy-main-request-plan",{"./current-footprint-copy-clock-rpc-runner.ts":oldReader})as OldPlanApi;
 return Object.freeze({full,old});
}
async function collector(f:ReturnType<typeof requestCollectorFixture>,p:Awaited<ReturnType<typeof plans>>):Promise<Readonly<{api:EngineApi;origin:CurrentFootprintForwardWriterMainRequestOrigin}>>{
 const origin:CurrentFootprintForwardWriterMainRequestOrigin=Object.freeze({profile:"private.current-footprint-forward-writer-main-request-origin.v1",executionAuthorized:false});
 const binding=Object.freeze({...f.bindings,fail:():void=>{
 // Synthetic revocation records no native authority.
},settleAllocation:():Promise<void>=>Promise.resolve(),request:async(command:Parameters<typeof f.bindings.request>[0],cleanup:boolean,retain?:((reply:unknown)=>void)):Promise<unknown>=>{assert.equal(typeof cleanup,"boolean");const raw=await f.bindings.request(command,cleanup);retain?.(raw);return raw;}});
 const requireFull=(value:unknown):typeof binding=>{assert.equal(value,origin);assert.ok(!f.state.retired);return binding;};
 const modules={
 "./current-footprint-forward-writer-main-origin.ts":{isCurrentFootprintForwardWriterMainRequestOrigin:(value:unknown):boolean=>value===origin,requireCurrentFootprintForwardWriterMainRequestOrigin:requireFull,requireCurrentFootprintForwardWriterMainRequestClockOrigin:(main:unknown,clock:unknown):void=>{requireFull(main);assert.equal(clock,CLOCK_ORIGIN);}},
 "./current-footprint-copy-main-request-origin.ts":{requireCurrentFootprintCopyMainRequestOrigin:f.require,requireCurrentFootprintCopyMainRequestClockOrigin:():never=>{throw new Error("OLD_CLOCK_PAIR_REFUSED");}},
 "./current-footprint-copy-main-backend-runner.ts":{isCurrentFootprintForwardMainRequestOrigin:():false=>false,requireCurrentFootprintForwardMainRequestOrigin:():never=>{throw new Error("OLD_V2_ORIGIN_REFUSED");}},
 "./current-footprint-copy-main-request-source.ts":{requireCurrentFootprintCopyMainRequestSource:(source:unknown):void=>{assert.equal(source,syntheticRequestSource);}},
 "./current-footprint-forward-writer-clock-rpc-runner.ts":{requireCurrentFootprintForwardWriterClockRpcObservation:(observed:unknown,clock:unknown):Promise<void>=>{assert.equal(clock,CLOCK_ORIGIN);assert.ok(observed!==null&&typeof observed==="object");return Promise.resolve();}},
 "./current-footprint-forward-writer-main-request-plan.ts":p.full,"./current-footprint-copy-main-request-plan.ts":p.old,
 };
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exact shared collector is evaluated with explicit synthetic original origin/source issuers; no native authority is manufactured.
 const api=await load("current-footprint-copy-main-request-runner",modules)as EngineApi;return Object.freeze({api,origin});
}
void test("full reservation keeps exact old wire/body bounds while disjoint maps reject copies and old tokens",async()=>{
 const p=await plans();const copy=await copyPlan();const full=p.full.reserveCurrentFootprintForwardWriterMainRequestPlan(copy,CONTEXT,WINDOW);const old=p.old.reserveCurrentFootprintCopyMainRequestPlan(copy,CONTEXT,WINDOW);
 assert.deepEqual(p.full.requireCurrentFootprintForwardWriterMainRequestReservation(full),p.old.requireCurrentFootprintCopyMainRequestReservation(old));
 assert.equal(p.old.isCurrentFootprintCopyMainRequestReservation(full),false);assert.equal(p.full.isCurrentFootprintForwardWriterMainRequestReservation(old),false);assert.equal(p.full.isCurrentFootprintForwardWriterMainRequestReservation({...full}),false);
 assert.throws(()=>Reflect.apply(p.old.requireCurrentFootprintCopyMainRequestReservation,undefined,[full]));assert.throws(()=>Reflect.apply(p.full.requireCurrentFootprintForwardWriterMainRequestReservation,undefined,[old]));
 const bound=await p.full.bindCurrentFootprintForwardWriterMainRequestPlan(full,CLOCK_ORIGIN,packet());assert.ok(bound.dataStr.includes(`"uuid":"${TARGET}"`));assert.ok(bound.dataStr.includes(`"updateTime":${String(CLOCK+1)}`));assert.equal(bound.dataStr.includes('"user"'),false);assert.equal(bound.dataStr.includes("EDIT_HEAD"),false);
 await assert.rejects(p.full.bindCurrentFootprintForwardWriterMainRequestPlan(full,CLOCK_ORIGIN,packet()),/ORIGINAL_RESERVATION/u);
 const large=await copyPlan(true);assert.throws(()=>p.full.reserveCurrentFootprintForwardWriterMainRequestPlan(large,CONTEXT,WINDOW));let traps=0;const bad=Object.defineProperty({},"projectUuid",{get:()=>{traps+=1;return PROJECT;},enumerable:true});assert.throws(()=>p.full.reserveCurrentFootprintForwardWriterMainRequestPlan(copy,bad,WINDOW));assert.equal(traps,0);
});
void test("full binder spends before its first await and rechecks the original issuer after it",async()=>{
 const entered=Promise.withResolvers<null>(),release=Promise.withResolvers<null>();let checks=0,current=true;
 const p=await plans(async()=>{checks+=1;if(checks===1){entered.resolve(null);await release.promise;}assert.ok(current,"original full clocks changed");});const copy=await copyPlan();const r=p.full.reserveCurrentFootprintForwardWriterMainRequestPlan(copy,CONTEXT,WINDOW);
 const first=p.full.bindCurrentFootprintForwardWriterMainRequestPlan(r,CLOCK_ORIGIN,packet());const refused=assert.rejects(first,/original full clocks changed/u);await entered.promise;await assert.rejects(p.full.bindCurrentFootprintForwardWriterMainRequestPlan(r,CLOCK_ORIGIN,packet()),/ORIGINAL_RESERVATION/u);current=false;release.resolve(null);await refused;assert.equal(checks,1);
});
void test("full factory arms the original held PB and atomically removes old and full getter custody on transfer",async()=>{
 const p=await plans();const copy=await copyPlan();const r=p.full.reserveCurrentFootprintForwardWriterMainRequestPlan(copy,CONTEXT,WINDOW);const f=requestCollectorFixture();const loaded=await collector(f,p);const api=loaded.api;
 assert.throws(()=>Reflect.construct(api.CurrentFootprintCopyMainRequestRunner,[loaded.origin,r]));assert.throws(()=>Reflect.apply(api.createCurrentFootprintForwardMainRequestRunner,undefined,[loaded.origin,r]));
 const runner=api.createCurrentFootprintForwardWriterMainRequestRunner(loaded.origin,r);assert.throws(()=>api.createCurrentFootprintForwardWriterMainRequestRunner(loaded.origin,r),/FULL_ENGINE_CONSUMED/u);
 api.requireOriginalCurrentFootprintForwardWriterMainRequestReservation(runner,loaded.origin,r);
 const different=p.full.reserveCurrentFootprintForwardWriterMainRequestPlan(copy,CONTEXT,WINDOW);assert.throws(()=>{api.requireOriginalCurrentFootprintForwardWriterMainRequestReservation(runner,loaded.origin,different);});
 await runner.armForCompletion();runner.consumeBeforeInvocation();const oldClock=Object.freeze({profile:"private.current-footprint-clock-rpc-origin.v1" as const});const oldPacket=Object.freeze({...packet(),profile:"private.current-footprint-clock-rpc-observation.v1" as const});await assert.rejects(runner.bindObservedClocks(oldClock,oldPacket),/ORIGINAL_CLOCK_ORIGIN/u);const actualClockPacket=packet();await runner.bindForwardWriterObservedClocks(CLOCK_ORIGIN,actualClockPacket);
 api.requireOriginalCurrentFootprintForwardWriterMainRequestReservation(runner,loaded.origin,r);const bound=await api.requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan(runner,loaded.origin,CLOCK_ORIGIN,actualClockPacket);assert.ok(Object.isFrozen(bound));assert.ok(bound.dataStr.includes(`"uuid":"${TARGET}"`));
 assert.equal(await api.requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan(runner,loaded.origin,CLOCK_ORIGIN,actualClockPacket),bound);
 await assert.rejects(api.requireOriginalCurrentFootprintForwardWriterBoundMainRequestPlan(runner,loaded.origin,CLOCK_ORIGIN,packet()),/FULL_ORIGINAL_BOUND_PLAN/u);
 await assert.rejects(runner.originalForwardWriterBoundPlan({...loaded.origin},CLOCK_ORIGIN,actualClockPacket),/FULL_ORIGINAL_BOUND_PLAN/u);
 f.state.invoked=true;const held=await runner.collectToHeldFinalPb();
 const context=api.requireOriginalCurrentFootprintForwardWriterHeldContext(held);assert.equal(context.origin,loaded.origin);assert.equal(context.plan,bound);assert.ok(Object.isFrozen(context.actor));assert.throws(()=>api.requireOriginalCurrentFootprintForwardWriterHeldContext({...held}));
 assert.equal(f.commands.filter(c=>c.phase==="request-resume").length,3);assert.equal(f.commands.filter(c=>c.phase==="request-remove").length,4);assert.equal(f.state.mutationCalls,0);
 assert.throws(()=>api.requireCurrentFootprintCopyMainRequestHeldFinalPb(held),/ORIGINAL_HELD_PACKET/u);assert.throws(()=>api.requireCurrentFootprintForwardWriterMainRequestHeldFinalPb({...held}),/FULL_ORIGINAL_HELD_PACKET/u);
 const original=api.requireCurrentFootprintForwardWriterMainRequestHeldFinalPb(held);await original.assertOriginal();assert.equal(original.finalPbFrameId,"frame-3");assert.equal(original.sqlObjectId,"sql");
 assert.throws(()=>Reflect.apply(api.transferCurrentFootprintCopyMainRequestHeldFinalPb,undefined,[held,loaded.origin]));
 const transferred=api.transferCurrentFootprintForwardWriterMainRequestHeldFinalPb(held,loaded.origin);assert.equal(api.requireOriginalCurrentFootprintForwardWriterHeldContext(held),context);assert.equal(transferred,original);assert.throws(()=>api.requireCurrentFootprintForwardWriterMainRequestHeldFinalPb(held));assert.throws(()=>api.transferCurrentFootprintForwardWriterMainRequestHeldFinalPb(held,loaded.origin));await assert.rejects(runner.cleanup(),/COMPLETION_OWNS_GENERATION/u);assert.equal(f.commands.filter(c=>c.phase==="request-resume").length,3);
});
void test("real full clock reader rejects supplied observations and the reservation stays consumed",async()=>{
 const actual=await import("../src/current-footprint-forward-writer-main-request-plan.ts");
 const old=await import("../src/current-footprint-copy-main-request-plan.ts");
 const copy=await copyPlan();const reservation=actual.reserveCurrentFootprintForwardWriterMainRequestPlan(copy,CONTEXT,WINDOW);
 assert.equal(old.isCurrentFootprintCopyMainRequestReservation(reservation),false);
 await assert.rejects(actual.bindCurrentFootprintForwardWriterMainRequestPlan(reservation,CLOCK_ORIGIN,packet()),/^Error: FORWARD_WRITER_CLOCK_RPC_ORIGINAL_PACKET$/u);
 await assert.rejects(actual.bindCurrentFootprintForwardWriterMainRequestPlan(reservation,CLOCK_ORIGIN,packet()),/ORIGINAL_RESERVATION/u);
});
