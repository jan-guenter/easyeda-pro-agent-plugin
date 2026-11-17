/* oxlint-disable import/max-dependencies -- The two actual publishers, independent managed reader, filesystem fault hooks and process-local test cleanup require eleven separate contracts. */
/** Real private managed storage faults before the original initial link.
 * No native owner, callback, project, helper or release authority is created. */
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {promises as fsPromises} from "node:fs";
import {lstat,readFile,readlink,rmdir,unlink} from "node:fs/promises";
import {syncBuiltinESMExports} from "node:module";
import {basename,dirname} from "node:path";
import {test} from "node:test";
import type {TestContext} from "node:test";
import {loadOperation,operationPath} from "../src/artifacts.ts";
import {isRecord} from "../src/core.ts";
import {CurrentFootprintForwardWriterStartupFrontierJournal} from "../src/current-footprint-forward-writer-startup-frontier-journal.ts";
import {CurrentFootprintForwardWriterTicketTimerJournal} from "../src/current-footprint-forward-writer-ticket-timer-journal.ts";

interface Publisher{
 readonly reserve:()=>Promise<void>;readonly settle:()=>Promise<void>;readonly assertCurrent:()=>Promise<void>;
 readonly reservationOutcome:()=>"not-entered"|"conflict"|"create-unknown"|"reserved";
 readonly retained:()=>Readonly<{records:readonly unknown[];publicationPending:boolean;reserved:boolean}>;
 readonly append:(kind:"failure"|"release-intent"|"release-result",evidence:Readonly<Record<string,unknown>>)=>Promise<void>;
}
const publishers:readonly Readonly<{name:string;prefix:string;create:(suffix:string)=>Publisher}>[]=[
 {name:"startup frontier",prefix:"footprint-forward-frontier-",create:suffix=>new CurrentFootprintForwardWriterStartupFrontierJournal({operationId:`footprint-forward-frontier-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,acceptOriginalProjectTimerCancellation:true})},
 {name:"ticket timer",prefix:"footprint-forward-ticket-timer-",create:suffix=>new CurrentFootprintForwardWriterTicketTimerJournal({operationId:`footprint-forward-ticket-timer-${suffix}`,parentOperationId:`footprint-forward-writer-${suffix}`,acceptOriginalNaturalTicketTimer:true})},
];
function missing(cause:unknown):boolean{return cause instanceof Error&&"code"in cause&&cause.code==="ENOENT";}
function installInitialFileFault(context:TestContext,manifest:string):{blocked:boolean;attempts:number;original:Buffer|null;injected:Error}{
 const state={blocked:true,attempts:0,original:null as Buffer|null,injected:new Error("injected original initial file sync before exclusive link")};
 const originalOpen=fsPromises.open;
 context.mock.method(fsPromises,"open",async(...args:Parameters<typeof originalOpen>)=>{
  const handle=await originalOpen(...args);const path=await readlink(`/proc/self/fd/${String(handle.fd)}`);const sync=handle.sync.bind(handle);
  context.mock.method(handle,"sync",async()=>{
   if(state.blocked&&path.startsWith(`${manifest}.tmp-`)){state.attempts+=1;state.original??=await readFile(path);throw state.injected;}
   await sync();
  });return handle;
 });syncBuiltinESMExports();return state;
}
async function removeSuccessfulPublisher(operationId:string,journal:Publisher):Promise<void>{
 await journal.append("failure",{phase:"setup",originalErrorRetained:true});await journal.append("release-intent",{});
 await journal.append("release-result",{originalParentJobExitObserved:true,originalPendingCallbacksJoined:true,released:true});await journal.assertCurrent();
 const operation=await loadOperation(operationId);
 for(const descriptor of operation.artifacts??[]){await unlink(descriptor.path);}
 await unlink(operationPath(operationId));await rmdir(dirname(operation.artifacts?.[0]?.path??assert.fail("missing original phase")));
}
for(const publisher of publishers){
 void test(`${publisher.name} exclusively republishes only its retained initial bytes after a pre-link sync failure`,async context=>{
  const suffix=`initial-${randomUUID()}`;const operationId=publisher.prefix+suffix;const manifest=operationPath(operationId);const journal=publisher.create(suffix);
  const state=installInitialFileFault(context,manifest);
  try{
   await assert.rejects(journal.reserve(),cause=>cause===state.injected);assert.equal(journal.reservationOutcome(),"create-unknown");
   await assert.rejects(loadOperation(operationId),missing);await assert.rejects(journal.settle(),cause=>cause===state.injected);
   assert.equal(state.attempts,2);await assert.rejects(loadOperation(operationId),missing);assert.equal(journal.retained().reserved,false);
   state.blocked=false;await journal.settle();await journal.assertCurrent();assert.equal(journal.reservationOutcome(),"reserved");
   assert.equal(journal.retained().publicationPending,false);assert.equal(journal.retained().records.length,1);
   assert.ok(state.original!==null);const original:unknown=JSON.parse(state.original.toString("utf8"));assert.ok(isRecord(original));
   const settled=await loadOperation(operationId);assert.deepEqual(settled.plan,original["plan"]);assert.equal(settled.planHash,original["planHash"]);
   await journal.settle();assert.equal(journal.retained().records.length,1);await assert.rejects(journal.reserve(),/RESERVATION_CONSUMED/u);
  }finally{context.mock.restoreAll();syncBuiltinESMExports();}
  await removeSuccessfulPublisher(operationId,journal);
 });
 for(const collision of["present","during-exclusive-link"]as const){
  void test(`${publisher.name} preserves a competing original manifest ${collision} after unknown creation`,async context=>{
   const suffix=`collision-${randomUUID()}`;const operationId=publisher.prefix+suffix;const manifest=operationPath(operationId);
   const journal=publisher.create(suffix),other=publisher.create(suffix),state=installInitialFileFault(context,manifest);
   try{
    await assert.rejects(journal.reserve(),cause=>cause===state.injected);await assert.rejects(loadOperation(operationId),missing);state.blocked=false;
    const foreign:{bytes:Buffer|null;identity:Awaited<ReturnType<typeof lstat>>|null}={bytes:null,identity:null};
    const publishOther=async():Promise<void>=>{await other.reserve();foreign.bytes=await readFile(manifest);foreign.identity=await lstat(manifest);};
    if(collision==="present"){await publishOther();await assert.rejects(journal.settle(),/RESERVATION_CHANGED/u);}
    else{
     const originalLink=fsPromises.link;let raced=false;
     context.mock.method(fsPromises,"link",async(...args:Parameters<typeof originalLink>)=>{
      if(!raced&&basename(String(args[1]))===basename(manifest)){raced=true;await publishOther();}
      await originalLink(...args);
     });syncBuiltinESMExports();await assert.rejects(journal.settle(),cause=>cause instanceof Error&&"code"in cause&&cause.code==="EEXIST");
     assert.equal(raced,true);assert.equal(journal.reservationOutcome(),"conflict");await assert.rejects(journal.settle(),/ORIGINAL_RESERVATION_REQUIRED/u);
    }
    assert.ok(foreign.bytes!==null&&foreign.identity!==null);assert.deepEqual(await readFile(manifest),foreign.bytes);
    const current=await lstat(manifest);assert.equal(current.dev,foreign.identity.dev);assert.equal(current.ino,foreign.identity.ino);await other.assertCurrent();
    assert.equal(journal.retained().records.length,0);assert.equal(journal.retained().reserved,false);
   }finally{context.mock.restoreAll();syncBuiltinESMExports();}
   await removeSuccessfulPublisher(operationId,other);
  });
 }
}
