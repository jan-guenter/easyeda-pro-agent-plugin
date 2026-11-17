/** Actual full Core factory/registry and inert original Linux child. External
 * source/head admission is synthetic; no Windows Job/app/durable edit is proven. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { requireCurrentFootprintForwardWriterReleasePreflightFacts } from "../src/current-pcb-diagnostic-owner.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

async function fixture(context:TestContext,malformed=false):Promise<Readonly<{source:Awaited<ReturnType<typeof combinedReadyFactoryFixture>>;owner:Awaited<ReturnType<Awaited<ReturnType<typeof combinedReadyFactoryFixture>>["api"]["startCurrentFootprintForwardWriterCompleteNativeOwner"]>>;fail:(caught:Error)=>void}>>{
 let failure:Error|null=null;
 const head=Object.freeze({profile:"private.current-footprint-forward-writer-head-input.v1" as const,executionAuthorized:false as const});
 const source=await combinedReadyFactoryFixture("ready","forward-writer",false,{
  modules:{
   "./current-footprint-forward-writer-head-input.ts":{
    consumeCurrentFootprintForwardWriterHeadInput:(value:unknown):void=>{assert.equal(value,head);},
    verifyCurrentFootprintForwardWriterHeadInput:(value:unknown):Promise<void>=>{assert.equal(value,head);return Promise.resolve();},
   },
   "./current-footprint-forward-writer-complete-native-graph.ts":{
    captureCurrentFootprintForwardWriterCompleteNativeGraph:(_distribution:unknown,challenge:unknown):Promise<object>=>Promise.resolve(Object.freeze({
     verify:():Promise<void>=>{const caught=failure;failure=null;return caught===null?Promise.resolve():Promise.reject(caught);},
     bootstrap:`$ErrorActionPreference='Stop';# inert test only\n& {} -WorkerStartupFootprintForwardWriter209 -CombinedReadyChallenge '${String(challenge)}'`,
    })),
   },
  },
  childProgram:`const malformed=${JSON.stringify(malformed)};const readline=require('node:readline');process.stdout.write(JSON.stringify(packet)+'\\n');const input=readline.createInterface({input:process.stdin});input.on('line',line=>{const q=JSON.parse(line);const result=q.action==='termination'?{terminated:true,originalRootExited:true,originalJobEmpty:true}:q.action==='release'?{released:!malformed}:null;if(result===null)throw Error('Unexpected inert request');process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});`,
 });
 const owner=await source.api.startCurrentFootprintForwardWriterCompleteNativeOwner(source.options,head);
 context.after(async()=>{if(!owner.status().helperClosed){const closed=once(source.child(),"close");source.child().stdin.end();await closed;}});
 return {source,owner,fail:(caught:Error):void=>{failure=caught;}};
}
async function originalFailure(pending:Promise<unknown>):Promise<unknown>{
 try{await pending;}catch(caughtError){return caughtError;}
 throw new Error("Original release must fail.");
}
void test("full original first pre-native release failure permits one opaque retry and observed helper close",async context=>{
 const f=await fixture(context);const original=new Error("inert original verify failure");f.fail(original);
 assert.throws(()=>requireCurrentFootprintForwardWriterReleasePreflightFacts({profile:"private.current-footprint-forward-writer-release-preflight.v1"}),/ORIGINAL_PROOF/u);
 assert.equal(await originalFailure(f.owner.releaseClosed()),original);assert.equal(f.source.state.writes,0);
 assert.equal(f.owner.consumeFootprintForwardWriterReleasePreflightFailure(new Error(original.message)),null);
 assert.equal(f.owner.consumeFootprintForwardWriterReleasePreflightFailure(structuredClone(original)),null);
 const proof=f.owner.consumeFootprintForwardWriterReleasePreflightFailure(original);assert.ok(proof!==null);
 assert.equal(f.owner.consumeFootprintForwardWriterReleasePreflightFailure(original),null);
 await assert.rejects(f.owner.releaseClosed(),/EXPLICIT_PROOF_REQUIRED/u);
 const facts=f.source.api.requireCurrentFootprintForwardWriterReleasePreflightFacts(proof);
 assert.equal(facts.failedReleaseAttempt,1);assert.equal(facts.originalReleaseNotDispatched,true);
 assert.throws(()=>f.source.api.requireCurrentFootprintForwardWriterReleasePreflightFacts({...proof}),/ORIGINAL_PROOF/u);
 await f.owner.retryFootprintForwardWriterReleaseAfterPreflight(proof);
 assert.deepEqual(f.source.state.actions,["termination","release"]);assert.equal(f.owner.status().helperClosed,true);assert.equal(f.source.child().exitCode,0);
 await assert.rejects(f.owner.retryFootprintForwardWriterReleaseAfterPreflight(proof),/PREFLIGHT_CHANGED/u);
});
void test("full proof is owner/activity bound and cannot survive another native command",async context=>{
 const f=await fixture(context),other=await fixture(context);const original=new Error("first failure");f.fail(original);
 await originalFailure(f.owner.releaseClosed());
 assert.equal(other.owner.consumeFootprintForwardWriterReleasePreflightFailure(original),null);
 const proof=f.owner.consumeFootprintForwardWriterReleasePreflightFailure(original);assert.ok(proof!==null);
 await assert.rejects(other.owner.retryFootprintForwardWriterReleaseAfterPreflight(proof),/PREFLIGHT_CHANGED/u);
 await f.owner.observeTermination();assert.deepEqual(f.source.state.actions,["termination"]);
 assert.throws(()=>f.source.api.requireCurrentFootprintForwardWriterReleasePreflightFacts(proof),/PREFLIGHT_CHANGED/u);
 await assert.rejects(f.owner.retryFootprintForwardWriterReleaseAfterPreflight(proof),/PREFLIGHT_CHANGED/u);
 assert.deepEqual(f.source.state.actions,["termination"]);
});
void test("full second pre-native failure and dispatched malformed release never grant a further retry",async context=>{
 const f=await fixture(context);const first=new Error("first");f.fail(first);await originalFailure(f.owner.releaseClosed());
 const proof=f.owner.consumeFootprintForwardWriterReleasePreflightFailure(first);assert.ok(proof!==null);
 const second=new Error("second");f.fail(second);assert.equal(await originalFailure(f.owner.retryFootprintForwardWriterReleaseAfterPreflight(proof)),second);
 assert.equal(f.owner.consumeFootprintForwardWriterReleasePreflightFailure(second),null);assert.equal(f.source.state.writes,0);
 const dispatched=await fixture(context,true);const caught=await originalFailure(dispatched.owner.releaseClosed());
 assert.equal(dispatched.owner.consumeFootprintForwardWriterReleasePreflightFailure(caught),null);assert.deepEqual(dispatched.source.state.actions,["termination","release"]);
});
