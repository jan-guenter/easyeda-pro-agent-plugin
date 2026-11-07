/** Fixed Via-only clock selectors. Only inert descriptor/source programs are
 * shared with mixed209 observations; no footprint lease, tuple or issuer moves. */
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_CALLS as REGISTRATION } from "./current-footprint-copy-clock-registration-v2-programs.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_CALLS as RPC } from "./current-footprint-copy-clock-rpc-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function between(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2 || source.split(after).length !== 2) { throw new Error("PCB_VIA_CLOCK_PROGRAM_ANCHOR"); }
  return source.slice(source.indexOf(before) + before.length, source.indexOf(after));
}
function one(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("PCB_VIA_CLOCK_PROGRAM_ANCHOR"); } return source.replace(before, after);
}
const registrationInitial = String.raw`const initial=(route,path,branch,tab)=>{array(route,9);const state=own(route,"7"),guard=own(route,"8"),root=globalThis;
if(own(state,"owner")!==route||own(state,"failed")!==false||own(state,"createAcknowledged")!==true||own(state,"saveAttempted")!==false||typeof guard!=="function"||own(root,"_EXTAPI_ROOT_")!==own(route,"0"))bad();Reflect.apply(guard,undefined,[]);
const host=own(root,"gVars"),project=own(host,"currentProject"),bus=own(host,"concurrentBus");if(own(project,"projectId")!==path||own(project,"branchUuid")!==branch||own(root,"_TAB_ID_")!==tab||own(root,"/"+tab+"/notify")!==bus)bad();
const topic="/pro-mgr/serverTime/now",pulled=own(bus,"pulled"),pushed=own(bus,"pushed"),subscribed=own(bus,"subscribed"),queue=own(pulled,topic);array(queue,1);absent(pushed,topic);absent(subscribed,topic);
const task=own(queue,"0"),wrapper=own(task,"callback"),bc=own(bus,"bc"),getter=nameGetter(root,bc,tab);if(own(task,"isRunning")!==true||own(task,"unsafe")!==true||typeof wrapper!=="function")bad();return[root,host,project,bus,wrapper,queue,task,bc,getter,route];};
`;
const oldInitial = `const initial=${between(REGISTRATION.initial.program, "const initial=", "const registration=")}`;
const registrationProgram = (role: keyof typeof REGISTRATION): string => one(REGISTRATION[role].program, oldInitial, registrationInitial)
  .replaceAll("FOOTPRINT_CLOCK_REGISTRATION_V2_BINDING", "PCB_VIA_CLOCK_REGISTRATION");

const workerGuard = String.raw`const worker=w=>{array(w,14);const project=own(w,"0"),bus=own(w,"1"),id=own(w,"12"),tab=own(w,"13");if(own(globalThis,"PROJECT")!==project||own(w,"2")!==project||own(project,"wsBus")!==bus||own(project,"uuid")!==own(w,"10")||own(globalThis,"_TAB_ID_")!==tab||tab!==own(w,"11")||own(globalThis,"/"+tab+"/notify")!==bus||own(bus,"uuid")!==id)bad();const jp=proto(bus),kp=proto(jp),mb=proto(kp);for(const[p,name]of[[jp,"JP"],[kp,"KP"],[mb,"Mb"]])if(own(own(p,"constructor"),"name")!==name||own(own(p,"constructor"),"prototype")!==p)bad();for(const[k,index]of[["push",3],["onReceivedINeed",4],["onReceivedPublish",5]])if(method(kp,k)!==own(w,String(index)))bad();if(method(mb,"rpcCall")!==own(w,"6"))bad();const checked=channel(globalThis,bus,tab);for(let i=0;i<3;i++)if(checked[i]!==own(w,String(i+7)))bad();return{project,bus,manager:project,id,tab,kp,mb};};
`;
const rpcHead = between(RPC.worker.program, "function(project,manager,lexicals){", "\narray(this,70);");
const oldWorker = `const worker=${between(rpcHead, "const worker=", "const ui=")}`;
const helpers = one(rpcHead, oldWorker, workerGuard).replaceAll("FOOTPRINT_CLOCK_RPC_RELATION", "PCB_VIA_CLOCK_RPC");
const rpcProgram = (role: "ui" | "push" | "dispatch" | "result" | "reply"): string => one(RPC[role].program, rpcHead, helpers);
const workerCapture = `function(projectUuid,windowTabId){${helpers}
if(!/^[a-f0-9]{64}$/.test(projectUuid)||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))bad();const project=own(globalThis,"PROJECT"),bus=own(project,"wsBus"),jp=proto(bus),kp=proto(jp),mb=proto(kp),tab=own(globalThis,"_TAB_ID_");if(own(project,"uuid")!==projectUuid||tab!==windowTabId)bad();
const[bc,getter,post]=channel(globalThis,bus,tab),result=[project,bus,project,method(kp,"push"),method(kp,"onReceivedINeed"),method(kp,"onReceivedPublish"),method(mb,"rpcCall"),bc,getter,post,projectUuid,windowTabId,uuid(own(bus,"uuid")),tab];worker(result);verify();return result;}`;
const pushProgram = one(rpcProgram("push"), "function(original,previous,ordinal){", "function(original){");
const resultProgram = one(rpcProgram("result"), "function(original,caller,scope,previous,expected){", "function(original,caller,scope,expected){");
export const CURRENT_PCB_VIA_CLOCK_GROUP = "easyeda-pro-control-pcb-via-clock-v1";
export const CURRENT_PCB_VIA_CLOCK_CALLS = freezeDeep({
  registration: registrationProgram("initial"), callback: registrationProgram("callback"), bindings: registrationProgram("bindings"), offset: registrationProgram("sample"),
  worker: workerCapture, ui: rpcProgram("ui"),
  push: one(pushProgram, "\narray(this,4);", "\nconst previous=original,ordinal=1;array(this,4);"),
  dispatch: rpcProgram("dispatch"),
  result: one(resultProgram, "\narray(this,8);", "\nconst previous=original;array(this,8);"),
  reply: rpcProgram("reply"),
  complete: `function(result,original){${helpers}
array(this,5);array(result,8);const u=ui(original),first=own(original,"0"),topic=own(result,"6");if(own(this,"0")!==u.bus||own(this,"0")!==own(result,"0")||own(this,"1")!==own(result,"1")||own(this,"2")!==own(result,"5")||own(this,"3")!==topic||own(this,"4")!==own(result,"7")||topic!=="/pro-mgr/serverTime/now")bad();const queue=own(own(u.bus,"pulled"),topic);array(queue,1);const current=own(queue,"0"),previous=own(first,"6");if(current===previous||proto(current)!==proto(previous)||own(current,"callback")!==own(original,"3")||own(current,"unsafe")!==true||own(current,"isRunning")!==true)bad();verify();return[this,result,original,queue,current];}`,

});
