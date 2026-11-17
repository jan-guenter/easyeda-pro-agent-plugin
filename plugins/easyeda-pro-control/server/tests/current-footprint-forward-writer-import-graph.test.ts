/** Fresh ordinary Node imports and defining-module prototype guards only.
 * No native owner, controller instance, upstream or application is allocated. */
import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {test} from "node:test";
import {fileURLToPath} from "node:url";
import {promisify} from "node:util";

// oxlint-disable-next-line typescript/strict-void-return -- Node's builtin execFile custom-promisify adapter accepts its ChildProcess-returning callback API and preserves both collected streams.
const execute=promisify(execFile);
const entries=[
 ["current-footprint-forward-writer-startup-frontier","CurrentFootprintForwardWriterStartupFrontier","assertOriginalCurrentFootprintForwardWriterStartupFrontierClass"],
 ["current-footprint-forward-writer-startup-callbacks","CurrentFootprintForwardWriterStartupCallbacks","assertOriginalCurrentFootprintForwardWriterStartupCallbacksClass"],
 ["current-footprint-forward-writer-startup-timer","CurrentFootprintForwardWriterStartupTimer","assertOriginalCurrentFootprintForwardWriterStartupTimerClass"],
 ["current-project-sync-quiesce-observer","CurrentProjectSyncQuiesceObserver","assertOriginalCurrentProjectSyncQuiesceObserverClass"],
 ["current-footprint-forward-writer-publication-driver","CurrentFootprintForwardWriterPublicationDriver","assertOriginalCurrentFootprintForwardWriterPublicationDriverClass"],
 ["current-footprint-forward-writer-publication-callbacks","CurrentFootprintForwardWriterPublicationCallbacks","assertOriginalCurrentFootprintForwardWriterPublicationCallbacksClass"],
 ["current-footprint-forward-writer-ticket-timer-driver","CurrentFootprintForwardWriterTicketTimerDriver","assertOriginalCurrentFootprintForwardWriterTicketTimerDriverClass"],
 ["current-project-save-producer-observer","CurrentProjectSaveProducerObserver","assertOriginalCurrentProjectSaveProducerObserverClass"],
]as const;
const child=String.raw`
import assert from 'node:assert/strict';
const [url,className,guardName]=process.argv.slice(1);
const loaded=await import(url),Constructor=loaded[className],guard=loaded[guardName];
assert.equal(typeof Constructor,'function');assert.equal(typeof guard,'function');
const prototype=Constructor.prototype,key=Symbol('before-first-original-guard');
const installed=Reflect.defineProperty(prototype,key,{value:true,configurable:true});
if(installed){
 try{assert.throws(()=>Reflect.apply(guard,undefined,[]));}
 finally{assert.equal(Reflect.deleteProperty(prototype,key),true);}
}else{assert.equal(Object.isFrozen(prototype),true);}
Reflect.apply(guard,undefined,[]);
process.stdout.write(JSON.stringify({loaded:true,firstGuardProtected:true,entry:className})+'\n');
`;
for(const [module,constructor,guard]of entries){
 void test(`fresh ${constructor} entry avoids cyclic TDZ and protects its first original guard`,async()=>{
  const result=await execute(process.execPath,["--disable-warning=ExperimentalWarning","--import",fileURLToPath(new URL("../../scripts/test-isolation.ts",import.meta.url)),"--input-type=module","--eval",child,new URL(`../src/${module}.ts`,import.meta.url).href,constructor,guard],{cwd:fileURLToPath(new URL("../../",import.meta.url)),timeout:60_000,maxBuffer:128*1024});
  assert.equal(result.stderr,"");const report:unknown=JSON.parse(result.stdout);assert.ok(report!==null&&typeof report==="object");assert.equal(Reflect.get(report,"loaded"),true);assert.equal(Reflect.get(report,"firstGuardProtected"),true);assert.equal(Reflect.get(report,"entry"),constructor);
 });
}
