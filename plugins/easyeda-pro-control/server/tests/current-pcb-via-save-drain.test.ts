/** Real fixed programs and original-packet DAG over inert async/cache data.
 * No application, native cache, network, SDK action or original owner runs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script } from "node:vm";
import { viaSaveDrainFixture } from "./helpers/via-save-drain.ts";
import { currentPcbViaSaveDrainNativeCases,validateCurrentPcbViaSaveDrainCommand } from "../src/current-pcb-via-save-drain-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_DRAIN_PROGRAMS as PROGRAMS } from "../src/current-pcb-via-save-drain-programs.ts";

async function prefix(f:ReturnType<typeof viaSaveDrainFixture>):Promise<void>{
  for(const role of ["historyReply","detachedEntry"] as const){await f.cursor.continue(f.packet(role));}
  await f.cursor.continue(f.packet("headEntry",0));await f.cursor.continue(f.packet("headPromise",0));
  for(const role of ["syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone"] as const){await f.cursor.continue(f.packet(role));}
}
async function suffix(f:ReturnType<typeof viaSaveDrainFixture>):Promise<void>{
  await f.cursor.continue(f.packet("headSuccess",0));await f.cursor.continue(f.packet("cacheDeleteCall"));
  await f.cursor.continue(f.packet("headEntry",1));await f.cursor.continue(f.packet("headPromise",1));
  await f.cursor.continue(f.packet("headEntry",2));await f.cursor.continue(f.packet("headPromise",2));
  await f.cursor.continue(f.packet("cacheDeleteReturned"));await f.cursor.continue(f.packet("detachedReturned"));
  await f.cursor.continue(f.packet("headSuccess",2));await f.cursor.continue(f.packet("headSuccess",1));
}
void test("source finalizers and three overlapping cache jobs join actual distinct Promises without objectId alias equality",async()=>{
  const f=viaSaveDrainFixture();assert.throws(()=>{f.cursor.requirePostHistorySyncEntry();});await prefix(f);f.cursor.requirePostHistorySyncEntry();assert.equal(f.cursor.progress().deferredSyncCompleted,true);assert.equal(f.cursor.progress().cloudFinallyResumed,true);await suffix(f);assert.equal(f.cursor.progress().allCallsResumed,true);assert.equal(f.state.completed,0);assert.equal(f.state.deleted,2);assert.equal(f.state.resumes,20);assert.equal(f.run("hooks"),0);
  f.post();f.state.pending=true;await f.cursor.settle();assert.equal(f.state.completed,0);assert.equal(f.cursor.progress().canSettle,true);f.state.pending=false;await f.cursor.settle();f.cursor.requireCompleted();assert.equal(f.state.completed,1);assert.equal(f.cursor.progress().settlementPasses,2);
});
void test("early dependent calls, retry-shaped puts and lost original ACKs refuse before their source continuation",async()=>{
  const order=viaSaveDrainFixture();await order.cursor.continue(order.packet("historyReply"));await assert.rejects(order.cursor.continue(order.packet("syncDeferred")));assert.equal(order.state.resumes,1);
  const retry=viaSaveDrainFixture();for(const role of ["historyReply","detachedEntry"] as const){await retry.cursor.continue(retry.packet(role));}await retry.cursor.continue(retry.packet("headEntry",0));retry.run("jobs[0].pending[4]=1");await assert.rejects(retry.cursor.continue(retry.packet("headPromise",0)));assert.equal(retry.state.resumes,3);assert.equal(retry.run("hooks"),0);
  const unknown=viaSaveDrainFixture();unknown.state.unknown=true;const packet=unknown.packet("historyReply");await assert.rejects(unknown.cursor.continue(packet));await assert.rejects(unknown.cursor.continue(packet));assert.equal(unknown.state.resumes,1);assert.equal(unknown.state.failed,true);
});
void test("equal-shaped foreign cloud PromiseResult and uncompleted changed-head sync cannot mint a completed drain",async()=>{
  const f=viaSaveDrainFixture();await prefix(f);await suffix(f);await assert.rejects(f.cursor.settle());assert.equal(f.state.completed,0);
  const changed=viaSaveDrainFixture();await prefix(changed);await suffix(changed);changed.post();changed.state.wrongCloud=true;await assert.rejects(changed.cursor.settle());assert.equal(changed.state.completed,0);assert.equal(changed.state.failed,true);
});
void test("all fixed programs compile and the finite grammar rejects program, selector and settlement-slot widening",()=>{
  for(const program of Object.values(PROGRAMS)){const compiled=new Script(`(${program})`);assert.ok(compiled instanceof Script);}
  const cases=currentPcbViaSaveDrainNativeCases();assert.equal(cases.length,68);
  for(const command of cases){if(command.phase==="via-drain-call"){assert.throws(()=>validateCurrentPcbViaSaveDrainCommand({...command,params:{...command.params,functionDeclaration:"function(){return true}"}}));}assert.throws(()=>validateCurrentPcbViaSaveDrainCommand({...command,arbitrary:true}));}
});
