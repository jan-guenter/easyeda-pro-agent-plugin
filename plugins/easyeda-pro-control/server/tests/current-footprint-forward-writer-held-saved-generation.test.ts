/** Actual full adapter and fixed held/saved readers over explicit inert native
 * issuers. Synthetic ownership is never installed in the production registry. */
/* oxlint-disable import/max-dependencies -- Focused end-to-end adapter composition retains actual SQL, native cache recipes and both original readers in one inert native realm. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {setImmediate as nextTurn} from "node:timers/promises";
import {test} from "node:test";
import {types} from "node:util";
import {createContext,runInContext} from "node:vm";
import {canonicalJson} from "../src/core.ts";
import {compareCompleteClosedSql} from "../src/closed-sql-equality.ts";
import {readerCompletion} from "../src/sqlite-inventory.ts";
import {currentFootprintCopyV2SavedTarget} from "../src/current-footprint-copy-v2-saved-source.ts";
import {CurrentFootprintCopyV2SavedReadRunner} from "../src/current-footprint-copy-v2-saved-read-runner.ts";
import type {CurrentFootprintCopySavedExecutionNative} from "../src/current-footprint-copy-execution-runtime.ts";
import {CurrentFootprintSavedCacheHeldRunner} from "../src/current-footprint-saved-cache-held-runner.ts";
import {CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE as ENGINE} from "../src/current-footprint-saved-cache-held-profile.ts";
import {createHeldCacheSyntheticPage} from "./helpers/current-footprint-saved-cache-held-fixture.ts";
import {STATE,nativeSavedCache,nativeSavedReply,savedFixture,stateReply} from "./helpers/current-footprint-copy-v2-saved-fixture.ts";
import {inventory} from "./helpers/symbol-sql-fixture.ts";

interface Fixture{
 readonly binding:CurrentFootprintCopySavedExecutionNative;readonly input:Awaited<ReturnType<typeof savedFixture>>;
 readonly calls:string[];readonly entered:Promise<null>;readonly resume:()=>void;
 readonly observe:()=>Promise<unknown>;readonly seal:()=>Promise<unknown>;readonly abort:()=>Promise<void>;readonly lookup:(token:unknown)=>unknown;
}
async function fixture(blocked=false):Promise<Fixture>{
 const input=await savedFixture();const target=currentFootprintCopyV2SavedTarget(input.projection);const calls:string[]=[];
 const writer=Object.freeze({});const paired=Object.freeze({inert:true});const termination=Object.freeze({});const checkpoint=Object.freeze({source:"/synthetic-full-held.eprj2"});const snapshot=Object.freeze({checkpoint});
 const entered=Promise.withResolvers<null>(),resume=Promise.withResolvers<null>();let owner:object|null=null;let closed=false;let released=false;let launched=false;
 let finalInventory:typeof input.after|null=null;const page=createHeldCacheSyntheticPage();
 const runner=new CurrentFootprintSavedCacheHeldRunner({assertCurrent:():Promise<void>=>{assert.equal(closed,false);return Promise.resolve();},request:(command):Promise<unknown>=>{calls.push(command.heldCachePhase);return page.run(command);}},
 {sessionId:"full-parent27",uniqueContextId:"full-context27",projectUuid:target.projectUuid,branchUuid:target.branchUuid},ENGINE);
 const pairedModule=Object.freeze({requireOriginalCurrentFootprintForwardWriterSavedContinuation(a:unknown,b:unknown):object{assert.equal(a,paired);assert.equal(b,writer);return{copyPlan:input.copy,paired};}});
 let source=stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-forward-writer-held-saved-generation.ts",import.meta.url),"utf8")).replaceAll(/^import[\s\S]*?;\n/gmu,"").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu,"");
 const lazy='await import("./current-footprint-forward-writer-paired-scheduler.ts")';assert.equal(source.split(lazy).length,2);source=source.replace(lazy,"await Promise.resolve(syntheticFullPairedModuleForTest)");
 const context=createContext({Object,Reflect,Error,Promise,WeakMap,WeakSet,Set,types,canonicalJson,compareCompleteClosedSql,readerCompletion,
 CurrentFootprintSavedCacheHeldRunner,CurrentFootprintCopyV2SavedReadRunner,currentFootprintCopyV2SavedTarget,writer,paired,syntheticFullPairedModuleForTest:pairedModule,
 assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner:(a:unknown):void=>{assert.equal(a,writer);},
 assertOriginalCurrentFootprintForwardWriterHeldSavedNativeOwner:(a:unknown):void=>{assert.equal(a,owner);},
 requireOriginalCurrentFootprintForwardWriterSavedProjection:(a:unknown,b:unknown,c:unknown,d:unknown):void=>{assert.equal(a,writer);assert.equal(b,paired);assert.equal(c,input.projection);assert.equal(d,input.after);},
 requireOriginalCurrentFootprintForwardWriterHeldSavedOwner:(a:unknown,b:unknown,c:unknown,d:unknown,e:unknown):void=>{assert.equal(a,owner);assert.equal(b,writer);assert.equal(c,input.after);assert.equal(d,input.projection);assert.equal(e,paired);},
 requireCurrentFootprintForwardWriterClosedSnapshot:(a:unknown,b:unknown):object=>{assert.equal(a,writer);assert.equal(b,input.after);return snapshot;},
 originalCurrentFootprintForwardWriterNativeTarget:(a:unknown):object=>{assert.equal(a,writer);return{target,checkpoint,source:checkpoint.source};},
 originalCurrentFootprintForwardWriterHeldSavedNativeTarget:(a:unknown):object=>{assert.equal(a,owner);return{target,checkpoint,source:checkpoint.source};},
 originalCurrentFootprintForwardWriterHeldSavedNativeTermination:(a:unknown):object=>{assert.equal(a,owner);assert.equal(closed,true);return termination;},
 assertOriginalCurrentFootprintForwardWriterHeldSavedNativeTermination:(a:unknown,b:unknown):void=>{assert.equal(a,owner);assert.equal(b,termination);assert.equal(closed,true);},
 verifyCurrentFootprintForwardWriterPosteditPreopenSource:(a:unknown,b:unknown):Promise<unknown>=>{assert.equal(a,writer);assert.equal(b,input.after);calls.push("original-postedit-bytes");return Promise.resolve({});},
 requireCurrentFootprintForwardWriterSavedClosedSnapshot:(a:unknown,b:unknown):object=>{assert.equal(a,owner);assert.equal(b,finalInventory);assert.equal(closed,true);return snapshot;},
 captureCurrentFootprintForwardWriterSavedClosedSnapshot:async(a:unknown,b:unknown):Promise<unknown>=>{assert.equal(a,owner);assert.equal(b,termination);assert.equal(closed,true);calls.push("closed-reader");finalInventory=await inventory(input.path);return finalInventory;},
 currentFootprintForwardWriterHeldSavedAllocationOutcome:(a:unknown):object=>{assert.equal(a,writer);return{status:owner===null?"no-resource":"retained",owner};},
 });
 class NativeOwner{
  public startFootprintCopyHeldSavedGeneration():Promise<void>{assert.equal(this,owner);calls.push("launch");launched=true;return Promise.resolve();}
  public retainedFootprintCopyHeldSavedCache():CurrentFootprintSavedCacheHeldRunner{assert.equal(this,owner);return runner;}
  public requireOriginalFootprintCopyHeldSavedCache(a:unknown):void{assert.equal(this,owner);assert.equal(a,runner);}
  public prepareFootprintCopyHeldSavedCache():Promise<void>{assert.equal(this,owner);return runner.prepare();}
  public async observeFirstFootprintCopyHeldSavedCache():Promise<unknown>{assert.equal(this,owner);const result=await runner.observeFirst();entered.resolve(null);if(blocked){await resume.promise;}return result;}
  public observeFreshFootprintCopyHeldSavedCache():Promise<unknown>{assert.equal(this,owner);return runner.observeFresh();}
  public releaseFootprintCopyHeldSavedCache():Promise<void>{assert.equal(this,owner);return runner.release();}
  public async openFootprintForwardWriterHeldSavedProject(a:unknown,b:unknown):Promise<unknown>{assert.equal(this,owner);
   assert.equal(a,input.projection);context["nativeOwner"]=this;context["originalGuard"]=b;calls.push("open-preflight");
   await runInContext("revalidateCurrentFootprintForwardWriterHeldSavedOpenGuard(nativeOwner,originalGuard)",context);calls.push("open-dispatch");const cache=nativeSavedCache(input,true);
   return{state:STATE,transport:Object.freeze({assertOriginalState:(state:unknown):Promise<void>=>{assert.equal(state,STATE);assert.equal(closed,false);return Promise.resolve();},observeState:():Promise<unknown>=>Promise.resolve(stateReply()),readSource:():Promise<unknown>=>{assert.equal(closed,false);calls.push("saved-source");return nativeSavedReply(cache);}})};
  }
  public observeApplicationWindow():Promise<string>{assert.equal(this,owner);return Promise.resolve("1");}
  public requestNormalClose(hwnd:string):Promise<void>{assert.equal(this,owner);assert.equal(hwnd,"1");closed=true;calls.push("close");return Promise.resolve();}
  public abortFootprintCopyHeldSavedJob(a:unknown):Promise<void>{assert.equal(this,owner);assert.equal(a,true);closed=true;calls.push("abort-original-job");return Promise.resolve();}
  public observeTermination():Promise<boolean>{assert.equal(this,owner);calls.push("exit");return Promise.resolve(closed);}
  public endFootprintForwardWriterHeldSavedObserversAfterTermination():Promise<void>{assert.equal(this,owner);assert.equal(closed,true);calls.push("end-observers");return Promise.resolve();}
  public releaseUnlaunched():Promise<void>{assert.equal(this,owner);assert.equal(launched,false);closed=true;released=true;return Promise.resolve();}
  public releaseNoProcess():Promise<void>{assert.equal(this,owner);throw new Error("unused-inert-no-process");}
  public observeFootprintCopyRelease():"pending"|"released"{assert.equal(this,owner);return released?"released":"pending";}
  public status():unknown{return{binding:{jobId:this===writer?"parent-job":"saved-job",helperInstance:this===writer?"parent-helper":"saved-helper"},launchConsumed:launched,noProcessCleanupAvailable:false,released,helperClosed:released};}
  public releaseClosed():Promise<void>{assert.equal(this,owner);assert.equal(closed,true);calls.push("release-helper");released=true;return Promise.resolve();}
 }
 context["CurrentFootprintForwardWriterHeldSavedNativeOwner"]=NativeOwner;
 context["startCurrentFootprintForwardWriterHeldSavedNativeOwner"]=(a:unknown,b:unknown,c:unknown,d:unknown):Promise<NativeOwner>=>{assert.equal(a,writer);assert.equal(b,paired);assert.equal(c,input.projection);assert.equal(d,input.after);assert.equal(owner,null);calls.push("allocate");const native=new NativeOwner();owner=native;return Promise.resolve(native);};
 const loaded:unknown=await runInContext(`${source}\ncreateCurrentFootprintForwardWriterHeldSavedExecutionNative(writer,paired)`,context);assert.ok(loaded!==null&&typeof loaded==="object");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual maintained adapter with explicit inert native issuers only; none register in Core.
 const binding=loaded as CurrentFootprintCopySavedExecutionNative;context["binding"]=binding;
 const invoke=(expression:string):unknown=>runInContext(expression,context);
 const promise=(expression:string):Promise<unknown>=>{const value=invoke(expression);assert.ok(types.isPromise(value));return value;};
 return{binding,input,calls,entered:entered.promise,resume:():void=>{resume.resolve(null);},observe:()=>promise("observeCurrentFootprintForwardWriterHeldSavedSource(binding)"),seal:()=>promise("sealCurrentFootprintForwardWriterSavedCheckpoint(binding)"),abort:async():Promise<void>=>{await promise("abortCurrentFootprintForwardWriterHeldSavedJob(binding)");},lookup:(token:unknown):unknown=>{context["token"]=token;return invoke("requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(token)");}};
}
void test("full cold adapter uses both exact cache samples, original bytes, actual saved reader and independent closed SQL",async()=>{
 const f=await fixture();await f.binding.start(f.input.projection,f.input.after);const witness=await f.binding.excludeReplay();await f.binding.requireReplayExclusion(witness);
 await f.binding.open(f.input.projection,f.input.after,witness);await f.observe();await f.binding.close();const ended=await f.binding.termination();assert.equal(ended.status,"terminated");assert.ok(ended.status==="terminated");
 await f.binding.snapshot(ended.original);await f.binding.release(ended.original);assert.equal(await f.binding.observeRelease(ended.original),"released");const checkpoint=await f.seal();assert.ok(f.lookup(checkpoint)!==undefined);
 assert.throws(()=>f.lookup(structuredClone(checkpoint)),/ORIGINAL_FULL_CHECKPOINT/u);assert.ok(f.calls.indexOf("fresh")<f.calls.indexOf("original-postedit-bytes"));assert.ok(f.calls.indexOf("original-postedit-bytes")<f.calls.indexOf("open-dispatch"));assert.ok(f.calls.indexOf("end-observers")<f.calls.indexOf("release-helper"));assert.equal(f.calls.filter(value=>value==="saved-source").length,2);
});
void test("original cold exit joins the exact pending normal stage before allowing helper release",async()=>{
 const f=await fixture(true);await f.binding.start(f.input.projection,f.input.after);const pending=f.binding.excludeReplay();void(async():Promise<void>=>{try{await pending;}catch{
// The following assertion observes the same original rejection.
}})();await f.entered;await f.abort();
 let settled=false;const ending=(async():Promise<Awaited<ReturnType<typeof f.binding.termination>>>=>{const value=await f.binding.termination();settled=true;return value;})();await nextTurn();assert.equal(settled,false);assert.equal(f.calls.includes("release-helper"),false);
 f.resume();await assert.rejects(pending,/STAGE_CONSUMED/u);const ended=await ending;assert.ok(ended.status==="terminated");await f.binding.release(ended.original);assert.equal(f.calls.filter(value=>value==="abort-original-job").length,1);assert.equal(f.calls.filter(value=>value==="release-helper").length,1);
});
