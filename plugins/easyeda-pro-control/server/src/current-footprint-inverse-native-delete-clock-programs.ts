/** Descriptor-only programs for the native DEL's one natural clock.
 * Original Job and event custody must be supplied independently by Core. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_CALLS as RPC } from "./current-footprint-copy-clock-rpc-programs.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_CALLS as REGISTRATION } from "./current-footprint-copy-clock-registration-v2-programs.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_CALLS as DELETE } from "./current-footprint-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as CALLEES } from "./current-footprint-inverse-clock-worker-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_PROGRAM_PREIMAGE"); } }
function pinnedPart(source: string, start: string, end: string, bytes: number, sha256: string): string {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  need(a !== -1 && b > a && !source.includes(start, a + 1));
  const part = source.slice(a, b);
  need(Buffer.byteLength(part) === bytes && createHash("sha256").update(part).digest("hex") === sha256);
  return part;
}
const oldWorker = pinnedPart(RPC.worker.program, "const worker=w=>", "\nconst ui=u=>", 962, "0bf2f119bdf9d0ada6fc2965396d605f7528cc07802d27cc15e4d924db0db996");
const oldInitial = pinnedPart(REGISTRATION.initial.program, "const initial=", "\nconst registration=", 939, "1082b78c47e4d02ac673b8e7c77ab229f87b371fe80a3d74e319de5993c97197");

const busLookups = ["rpcCall", "subscribeOnce", "subscribe", "publish", "push", "pull", "onReceivedINeed", "onReceivedPublish"].map(name => {
  const depth = ["JP", "KP", "Mb"].findIndex(owner => CALLEES.some(row => row.kind === "method" && row.owner === owner && row.key === `${owner}.${name}`)) + 1;
  need(depth >= 1 && depth <= 3); return [name, depth] as const;
});
const worker = String.raw`const worker=w=>{array(w,16);const project=own(w,"0"),bus=own(w,"1"),manager=own(w,"2"),bundle=own(w,"4"),clock=own(w,"5"),id=own(w,"12"),tab=own(w,"13");array(bundle,2);const original=own(bundle,"0"),prelude=own(bundle,"1");array(original,4);array(clock,9);array(prelude,4);
const promise=own(prelude,"0"),promisePrototype=own(prelude,"1"),then=own(prelude,"2"),species=own(prelude,"3"),symbols=Object.getOwnPropertySymbols(promise);array(symbols,1);const speciesDescriptor=Object.getOwnPropertyDescriptor(promise,own(symbols,"0"));
if(own(globalThis,"Promise")!==promise||own(promise,"prototype")!==promisePrototype||own(promisePrototype,"constructor")!==promise||own(promisePrototype,"then")!==then||!speciesDescriptor||Object.hasOwn(speciesDescriptor,"value")||speciesDescriptor.get!==species||speciesDescriptor.set!==undefined)bad();native(promise,"Promise",1);native(then,"then",2);native(species,"get [Symbol.species]",0);
const editorTop=Object.getOwnPropertyDescriptor(globalThis,"EDITOR_TOP");if(editorTop){if(!Object.hasOwn(editorTop,"value"))bad();const top=editorTop.value;if(top&&top!==globalThis&&own(top,"_TAB_ID_")!==tab)bad();}
const readyFunctions=own(original,"0"),state=own(original,"1"),readyGuard=own(original,"2"),functions=own(clock,"2");array(readyFunctions,28);array(state,9);array(functions,34);
if(typeof readyGuard!=="function"||readyGuard()!==true||own(clock,"0")!==original||own(state,"0")!==project||own(state,"2")!==manager||own(state,"4")!==bus||own(clock,"3")!==bus||own(clock,"4")!==tab||own(clock,"5")!==id||own(clock,"6")!==own(w,"14")||own(clock,"7")!==own(w,"15"))bad();
if(own(globalThis,"PROJECT")!==project||own(project,"footprint")!==manager||own(manager,"projectManager")!==project||own(project,"wsBus")!==bus||own(globalThis,"/"+tab+"/notify")!==bus||own(bus,"uuid")!==id||own(own(clock,"1"),"2")!==own(w,"3")||own(readyFunctions,"23")!==own(w,"3"))bad();
const jp=proto(bus),kp=proto(jp),mb=proto(kp);for(const[p,index,name]of[[jp,8,"JP"],[kp,9,"KP"],[mb,10,"Mb"]]){const c=own(readyFunctions,String(index));if(own(p,"constructor")!==c||own(c,"name")!==name||own(c,"prototype")!==p)bad();}
for(const[k,index]of[["push",6],["onReceivedINeed",7],["onReceivedPublish",8]])if(method(kp,k)!==own(w,String(index)))bad();
for(const[name,depth]of`+JSON.stringify(busLookups)+String.raw`){const lower=[bus,jp,kp];for(let i=0;i<depth;i++)if(Object.getOwnPropertyDescriptor(lower[i],name)!==undefined)bad();}

const classes=Object.create(null);` + CALLEES.filter(row => row.kind === "class").map(row => `classes[${JSON.stringify(row.key)}]=own(functions,${JSON.stringify(String(CALLEES.indexOf(row)))});`).join("") + CALLEES.filter(row => row.kind === "method").map(row => `if(method(own(classes[${JSON.stringify(row.owner)}],"prototype"),${JSON.stringify(row.key.slice(row.key.indexOf(".") + 1))})!==own(functions,${JSON.stringify(String(CALLEES.indexOf(row)))}))bad();`).join("") + String.raw`
const ticket=number(own(bus,"rpcTicket")),pushCount=number(own(bus,"pushCnt")),beforeTicket=number(own(w,"14")),beforePush=number(own(w,"15"));if(ticket<beforeTicket||ticket>beforeTicket+1||pushCount<beforePush||pushCount>beforePush+1)bad();
const checked=channel(globalThis,bus,tab);for(let i=0;i<3;i++)if(checked[i]!==own(w,String(i+9)))bad();return{project,bus,manager,lexicals:original,deps:clock,id,tab,kp,mb};};`;

const initial = String.raw`const initial=(root,path,branch,tab)=>{if(root!==globalThis)bad();const host=own(root,"gVars"),project=own(host,"currentProject"),bus=own(host,"concurrentBus");if(own(project,"projectId")!==path||own(project,"branchUuid")!==branch||own(root,"_TAB_ID_")!==tab||own(root,"/"+tab+"/notify")!==bus)bad();
const topic="/pro-mgr/serverTime/now",pulled=own(bus,"pulled"),pushed=own(bus,"pushed"),subscribed=own(bus,"subscribed"),queue=own(pulled,topic);array(queue,1);absent(pushed,topic);absent(subscribed,topic);
const task=own(queue,"0"),wrapper=own(task,"callback"),bc=own(bus,"bc"),getter=nameGetter(root,bc,tab);if(own(task,"isRunning")!==true||own(task,"unsafe")!==true||typeof wrapper!=="function")bad();return[root,host,project,bus,wrapper,queue,task,bc,getter,root];};`;
function projectWorker(program: string): string {
  need(program.split(oldWorker).length === 2);
  return program.replace(oldWorker, worker);
}
function projectRegistration(program: string): string {
  need(program.split(oldInitial).length === 2);
  return program.replace(oldInitial, initial);
}
const shared = projectWorker(RPC.push.program);
const helperStart = shared.indexOf('"use strict";');
const helperEnd = shared.indexOf("\narray(this,4);");
need(helperStart > 0 && helperEnd > helperStart);
const helpers = shared.slice(helperStart, helperEnd);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_HELPERS = helpers;
const captureWorker = `function(entry){${helpers}
array(this,9);array(entry,3);const original=own(this,"0"),guard=own(this,"8"),entryGuard=own(entry,"2");array(original,4);const functions=own(original,"0"),state=own(original,"1");array(functions,28);array(state,9);
if(own(entry,"1")!==this||typeof guard!=="function"||guard()!==true||typeof entryGuard!=="function"||entryGuard()!==true)bad();
const bus=own(this,"3"),tab=own(this,"4"),kp=proto(proto(bus)),project=own(state,"0"),manager=own(state,"2"),clock=own(functions,"23");if(own(own(this,"1"),"2")!==clock)bad();
const promise=own(globalThis,"Promise"),promisePrototype=own(promise,"prototype"),then=method(promisePrototype,"then"),symbols=Object.getOwnPropertySymbols(promise);array(symbols,1);const speciesDescriptor=Object.getOwnPropertyDescriptor(promise,own(symbols,"0"));if(!speciesDescriptor||Object.hasOwn(speciesDescriptor,"value")||typeof speciesDescriptor.get!=="function"||speciesDescriptor.set!==undefined)bad();const species=speciesDescriptor.get;native(promise,"Promise",1);native(then,"then",2);native(species,"get [Symbol.species]",0);const prelude=[promise,promisePrototype,then,species],bundle=[original,prelude];
const [bc,getter,post]=channel(globalThis,bus,tab),result=[project,bus,manager,clock,bundle,this,method(kp,"push"),method(kp,"onReceivedINeed"),method(kp,"onReceivedPublish"),bc,getter,post,uuid(own(bus,"uuid")),text(tab,/^[A-Za-z\\d_-]{1,128}$/),number(own(bus,"rpcTicket")),number(own(bus,"pushCnt"))];
worker(result);verify();return result;}`;
const pushed = projectWorker(RPC.push.program);
const pushReturn = "verify();return[original,w.bus,message,entry,queue,pending,callback,replyTopic,id];";
need(pushed.split(pushReturn).length === 2);
const onePush = pushed.replace(pushReturn, `if(ordinal!==1||ticket!==number(own(original,"14"))+1||id!==number(own(original,"15")))bad();${  pushReturn}`);

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_PROGRAMS = freezeDeep({
  initial: projectRegistration(REGISTRATION.initial.program), callback: projectRegistration(REGISTRATION.callback.program),
  bindings: projectRegistration(REGISTRATION.bindings.program), sample: projectRegistration(REGISTRATION.sample.program),
} as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS = freezeDeep({
  retainReturn: String.raw`function(){"use strict";const bad=()=>{throw new Error("INVERSE_NATIVE_DELETE_CLOCK_RETURN_PROMISE");};
const prototype=Object.getPrototypeOf(this),descriptor=Object.getOwnPropertyDescriptor(prototype,"constructor");
if(Reflect.ownKeys(this).length!==0||!descriptor||!Object.hasOwn(descriptor,"value")||typeof descriptor.value!=="function"||Function.prototype.toString.call(descriptor.value)!=="function Promise() { [native code] }")bad();
const constructor=descriptor.value,owned=Object.getOwnPropertyDescriptor(constructor,"prototype");if(!owned||!Object.hasOwn(owned,"value")||owned.value!==prototype)bad();return[this,prototype,constructor];}`,
  returnJoin: `function(originalWorker,retained){${helpers}
array(this,1);array(retained,3);worker(originalWorker);if(own(this,"0")!==own(originalWorker,"3"))bad();
const promise=own(retained,"0"),prototype=own(retained,"1"),constructor=own(retained,"2");if(constructor!==own(own(own(originalWorker,"4"),"1"),"0")||proto(promise)!==prototype||own(prototype,"constructor")!==constructor||own(constructor,"prototype")!==prototype||Reflect.ownKeys(promise).length!==0)bad();native(constructor,"Promise",1);verify();return[originalWorker,this,retained,()=>{verify();return true;}];}`,
  returnReprove: `function(originalWorker,originalPromise){${helpers}
array(this,4);const frame=own(this,"1"),retained=own(this,"2"),guard=own(this,"3");array(frame,1);array(retained,3);if(own(this,"0")!==originalWorker||own(retained,"0")!==originalPromise||own(frame,"0")!==own(originalWorker,"3")||typeof guard!=="function"||guard()!==true)bad();worker(originalWorker);
const prototype=own(retained,"1"),constructor=own(retained,"2");if(constructor!==own(own(own(originalWorker,"4"),"1"),"0")||proto(originalPromise)!==prototype||own(prototype,"constructor")!==constructor||own(constructor,"prototype")!==prototype||Reflect.ownKeys(originalPromise).length!==0)bad();native(constructor,"Promise",1);verify();return true;}`,
  expected: `function(){${helpers}
const selected=worker(this),bundle=own(this,"4"),original=own(bundle,"0"),state=own(original,"1");array(state,9);
const result={projectUuid:text(own(selected.project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:text(own(selected.project,"_branchUuid"),/^[a-f0-9]{32}$/),targetUuid:text(own(state,"7"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),client:text(own(state,"5"),/^[a-f0-9]{16}$/),maximumTicket:number(own(state,"6"))};
if(result.maximumTicket>Number.MAX_SAFE_INTEGER-2||own(selected.manager,"client")!==result.client||own(own(selected.project,"consistencyManager"),"client")!==result.client||own(own(selected.project,"consistencyManager"),"maxTicket")!==result.maximumTicket)bad();verify();return result;}`,
  worker: captureWorker, ui: projectWorker(RPC.ui.program), push: onePush,
  dispatch: projectWorker(RPC.dispatch.program), result: projectWorker(RPC.result.program), reply: projectWorker(RPC.reply.program),
  entry: `function(originalWorker,accepted,expected){${helpers}
array(this,5);array(accepted,3);const instance=own(accepted,"0"),clock=own(accepted,"1"),guard=own(accepted,"2");array(instance,5);array(clock,9);
if(own(instance,"0")!==own(clock,"0")||own(instance,"2")!==own(this,"2")||own(instance,"3")!==own(this,"3")||typeof guard!=="function"||guard()!==true)bad();array(own(this,"3"),0);
const legacy=${DELETE.entry.program};const joined=legacy.call([own(this,"0"),own(this,"1"),own(this,"4")],originalWorker,[own(this,"0"),own(this,"1")],expected);verify();return[joined,accepted,own(this,"2"),own(this,"3")];}`,
  producer: `function(entry,push,expected){${helpers}
array(this,6);array(entry,4);const accepted=own(entry,"1");array(accepted,3);const instance=own(accepted,"0");array(instance,5);const instanceGuard=own(instance,"4");if(typeof instanceGuard!=="function"||instanceGuard()!==true)bad();array(own(this,"3"),0);if(own(entry,"2")!==own(this,"2")||own(entry,"3")!==own(this,"3"))bad();
const legacy=${DELETE.producer.program};const joined=legacy.call([own(this,"0"),own(this,"1"),own(this,"4"),own(this,"5")],own(entry,"0"),push,expected);verify();return[joined,entry,own(this,"2"),own(this,"3")];}`,
} as const);
