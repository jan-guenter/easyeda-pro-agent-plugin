/** Fixed native-iterator recipes on an isolated inert graph. These checks
 * create no worker owner, native sender, continuation or completion receipt. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_PROGRAMS as P } from "../src/current-schematic-relevance-modify-body-programs.ts";

void test("the worker prefix preserves the exact single task and refuses iterator hooks without invoking them", () => {
  const context = createContext({ programs: P });
  const result: unknown = runInContext(`(()=>{
    let hooks=0, callbacks=0;
    const root={console:{debug(){callbacks++;}},Symbol};
    const native=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,root];
    const callback=()=>{callbacks++;},running=()=>{callbacks++;},execute=()=>{callbacks++;};
    const job={unsafe:true,isRunning:true,callback,running,execute};
    const roster=[job],bus={subscribed:{'/pro-mgr/worker/batchPendData':roster},onMessage(){callbacks++;},onReceivedPublish(){callbacks++;}};
    const project={workerBus:bus},functions=Array(10).fill(callback);functions[4]=bus.onMessage;functions[5]=bus.onReceivedPublish;functions[6]=callback;functions[8]=running;functions[9]=execute;
    const known=[],add=o=>{for(let at=o;at!==null;at=Object.getPrototypeOf(at))if(!known.includes(at))known.push(at);};
    [project,bus,bus.subscribed,job,root.console,Symbol,Array.prototype,...functions].forEach(add);
    const run=(role,args)=>Reflect.apply(eval('('+programs[role]+')'),native,args);
    const roots=run('roots',[]);roots.forEach(add);const parts=run('parts',[roots,known]);parts.filter(v=>typeof v==='function').forEach(add);
    const iterator=run('iterator',[parts,roster]);iterator.forEach(add);const parents=run('parents',[iterator,known]);parents.forEach(add);
    const next=run('next',[parents,known]);next.forEach(add);
    const args=[[project,bus],[bus,{},{}],[job],functions,roster,roots,parts,iterator,parents,next,known];
    const first=run('proof',args),original=Object.getOwnPropertyDescriptor(parents[0],'return');
    Object.defineProperty(parents[0],'return',{get(){hooks++;},configurable:true});
    let returnRefused=false;try{run('proof',args);}catch{returnRefused=true;}
    if(original)Object.defineProperty(parents[0],'return',original);else delete parents[0].return;
    job.unsafe=false;let taskRefused=false;try{run('proof',args);}catch{taskRefused=true;}
    return [first,returnRefused,taskRefused,hooks,callbacks];
  })()`, context);
  assert.ok(Array.isArray(result));
  const values: readonly unknown[] = result;
  assert.deepEqual([...values], [true, true, true, 0, 0]);
});
