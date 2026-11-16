/** Descriptor-only original DEL worker caller joins. These recipes neither
 * call a service/Promise method nor adopt an old GET/startup origin. Metadata,
 * exact source frames, pending work and result issuance remain host custody. */
import{CURRENT_NATIVE_OWN_DATA_CHECK as CHECK}from"./current-native-own-data-intrinsics.ts";
import{CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as CALLEES}from"./current-footprint-inverse-clock-worker-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_TOPIC as TOPIC}from"./current-footprint-inverse-delete-rpc-source.ts";

const index=(key:string):number=>{const at=CALLEES.findIndex(row=>row.key===key);if(at===-1){throw new Error("INVERSE_NATIVE_DELETE_CALLER_WORKER_CALLEE");}return at;};
const c=(key:string):string=>`value(functions,"${String(index(key))}")`;
const methodRows=CALLEES.filter(row=>row.kind==="method"&&["JP","KP","Mb","wu"].includes(row.owner));
const statePrelude=`"use strict";const reflection=state[0],packet=reflection;${CHECK.replace("const packet=this,","const ")}
dense(state,14);const service=value(state,"1"),event=value(state,"2"),job=value(state,"3"),acceptedEntry=value(state,"4"),native=value(state,"5"),original=value(state,"6"),project=value(state,"7"),bus=value(state,"8"),queue=value(state,"9"),task=value(state,"10"),handler=value(state,"11"),callback=value(state,"12"),guard=value(state,"13");
dense(service,7);dense(event,2);dense(job,3);dense(acceptedEntry,3);dense(native,8);if(typeof guard!=="function"||invoke(guard,undefined,[])!==true)bad();
const incoming=value(service,"1"),reply=value(service,"6"),promiseProto=value(native,"1");
const rearmed=()=>{dense(queue,1);const next=value(queue,"0");if(next===task||proto(next)!==proto(task)||count(next)!==3||value(next,"callback")!==callback||value(next,"unsafe")!==true||value(next,"isRunning")!==true)bad();return next;};
const successful=result=>{if(proto(result)!==objectProto||count(result)!==1||value(result,"success")!==true)bad();};
`;
const prepare=`function(service,event,job,entry,native){"use strict";${CHECK}
dense(service,7);dense(event,2);dense(job,3);dense(entry,3);dense(native,8);
const rpc=value(job,"0");dense(rpc,6);const bound=value(rpc,"0");dense(bound,4);const link=value(bound,"0");dense(link,3);const prelude=value(link,"0");dense(prelude,7);
const original=value(prelude,"0"),clock=value(prelude,"1"),bus=value(prelude,"2"),queue=value(prelude,"3"),task=value(prelude,"4"),callback=value(prelude,"5"),handler=value(link,"1");
dense(original,4);dense(clock,9);const ready=value(original,"1"),functions=value(clock,"2");dense(ready,9);dense(functions,34);
const project=value(ready,"0"),manager=value(ready,"2"),target=value(ready,"7"),incoming=value(service,"1"),reply=value(service,"6");
if(value(service,"0")!==bus||value(service,"2")!==${JSON.stringify(TOPIC)}||value(service,"3")!==handler||value(service,"4")!==callback||value(service,"5")!==target||value(event,"0")!==bus||value(rpc,"1")!==incoming||value(rpc,"2")!==bus||value(rpc,"3")!==target||value(rpc,"4")!==reply||value(bound,"1")!==project||value(bound,"2")!==manager||value(entry,"1")!==clock||value(job,"1")!==value(entry,"0")||value(value(entry,"0"),"0")!==original)bad();
if(proto(incoming)!==objectProto||count(incoming)!==2||value(incoming,"message")!==target||value(incoming,"replyTopic")!==reply||typeof reply!=="string"||reply.length<32||reply.length>256)bad();
const jp=value(${c("JP")},"prototype"),kp=value(${c("KP")},"prototype"),mb=value(${c("Mb")},"prototype"),wp=value(${c("wu")},"prototype");
if(proto(bus)!==jp||proto(jp)!==kp||proto(kp)!==mb||proto(mb)!==objectProto||proto(task)!==wp||proto(wp)!==objectProto||value(task,"callback")!==callback||value(task,"unsafe")!==true||value(task,"isRunning")!==true||count(task)!==3)bad();
${methodRows.map(row=>`if(value(value(${c(row.owner)},"prototype"),${JSON.stringify(row.name)})!==${c(row.key)}||get(${row.owner==="wu"?"task":"bus"},${JSON.stringify(row.name)})!==undefined)bad();`).join("")}
dense(queue,0);const pulled=value(bus,"pulled"),pushed=value(bus,"pushed"),subscribed=value(bus,"subscribed");if(proto(pulled)!==objectProto||proto(pushed)!==objectProto||proto(subscribed)!==objectProto||value(pulled,${JSON.stringify(TOPIC)})!==queue||get(pushed,${JSON.stringify(TOPIC)})!==undefined||get(subscribed,${JSON.stringify(TOPIC)})!==undefined||get(subscribed,reply)!==undefined||get(objectProto,reply)!==undefined)bad();
const ctor=value(native,"0"),promiseProto=value(native,"1"),then=value(native,"2"),caught=value(native,"3"),species=value(native,"4"),speciesGetter=value(native,"5"),hasInstance=value(native,"6"),hasInstanceFn=value(native,"7");
if(typeof species!=="symbol"||typeof hasInstance!=="symbol"||value(root,"Promise")!==ctor||proto(ctor)!==functionProto||value(ctor,"prototype")!==promiseProto||proto(promiseProto)!==objectProto||value(promiseProto,"constructor")!==ctor||value(promiseProto,"then")!==then||value(promiseProto,"catch")!==caught||get(ctor,hasInstance)!==undefined||value(functionProto,hasInstance)!==hasInstanceFn)bad();
const sd=get(ctor,species);if(!sd||has(sd,"value")||sd.get!==speciesGetter||sd.set!==undefined||sd.enumerable||!sd.configurable)bad();
const fixed=[[root,"Promise",get(root,"Promise")],[ctor,"prototype",get(ctor,"prototype")],[ctor,species,sd],[functionProto,hasInstance,get(functionProto,hasInstance)],[promiseProto,"constructor",get(promiseProto,"constructor")],[promiseProto,"then",get(promiseProto,"then")],[promiseProto,"catch",get(promiseProto,"catch")],${methodRows.map(row=>`[value(${c(row.owner)},"prototype"),${JSON.stringify(row.name)},get(value(${c(row.owner)},"prototype"),${JSON.stringify(row.name)})]`).join(",")}];
const same=(a,b)=>{if(a===undefined||b===undefined)return a===b;return has(a,"value")===has(b,"value")&&a.value===b.value&&a.get===b.get&&a.set===b.set&&a.writable===b.writable&&a.enumerable===b.enumerable&&a.configurable===b.configurable;};
const guard=()=>{if(value(root,"PROJECT")!==project||value(project,"workerBus")!==bus||value(project,"footprint")!==manager||value(manager,"projectManager")!==project||proto(bus)!==jp||proto(jp)!==kp||proto(kp)!==mb||proto(mb)!==objectProto||proto(task)!==wp||value(task,"callback")!==callback||value(task,"unsafe")!==true||value(task,"isRunning")!==true||value(bus,"pulled")!==pulled||value(bus,"pushed")!==pushed||value(bus,"subscribed")!==subscribed||value(pulled,${JSON.stringify(TOPIC)})!==queue||get(pushed,${JSON.stringify(TOPIC)})!==undefined||get(subscribed,${JSON.stringify(TOPIC)})!==undefined||get(subscribed,reply)!==undefined||get(objectProto,reply)!==undefined)bad();
 for(let i=0;i<${String(7+methodRows.length)};i++){const row=value(fixed,""+i);dense(row,3);if(!same(get(value(row,"0"),value(row,"1")),value(row,"2")))bad();}
 if(get(ctor,hasInstance)!==undefined||get(objectProto,"then")!==undefined)bad();return true;};
guard();return[packet,service,event,job,entry,native,original,project,bus,queue,task,handler,callback,guard];}`;

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_WORKER_PROGRAMS=Object.freeze({
 /** Select a root value without traversing the unqualified constructor. */
 promise:`function(){"use strict";${CHECK}return value(root,"Promise");}`,
 promiseMembers:`function(ctor){"use strict";${CHECK}if(value(root,"Promise")!==ctor||proto(ctor)!==functionProto)bad();const prototype=value(ctor,"prototype"),speciesList=symbols(ctor),instanceList=symbols(functionProto);dense(speciesList,1);dense(instanceList,1);const species=value(speciesList,"0"),hasInstance=value(instanceList,"0"),sd=get(ctor,species);if(typeof species!=="symbol"||typeof hasInstance!=="symbol"||!sd||has(sd,"value")||typeof sd.get!=="function"||sd.set!==undefined||sd.enumerable||!sd.configurable)bad();return[prototype,value(prototype,"then"),value(prototype,"catch"),species,sd.get,hasInstance,value(functionProto,hasInstance)];}`,
 bindNative:"function(ctor,prototype,then,caught,species,speciesGetter,hasInstance,hasInstanceFn){return[ctor,prototype,then,caught,species,speciesGetter,hasInstance,hasInstanceFn];}",
 prepare,
 returned:`function(state){${statePrelude}dense(this,8);for(let i=0;i<7;i++)if(value(this,""+i)!==value(service,""+i))bad();const promise=value(this,"7");if(proto(promise)!==promiseProto||count(promise)!==0)bad();return[state,this,promise];}`,
 serviceReturn:`function(state){${statePrelude}dense(this,5);for(let i=0;i<5;i++)if(value(this,""+i)!==value(service,""+i))bad();return[state,this,rearmed()];}`,
 success:`function(state,returned,actualResult,innerDeleteResult){${statePrelude}dense(returned,3);dense(this,3);if(value(returned,"0")!==state||value(this,"0")!==bus||value(this,"1")!==actualResult||value(this,"2")!==reply||actualResult!==innerDeleteResult)bad();successful(actualResult);const next=rearmed();return[state,this,returned,actualResult,next];}`,
 successReturn:`function(state,entry){${statePrelude}dense(entry,5);dense(this,3);const frame=value(entry,"1");dense(frame,3);if(value(entry,"0")!==state)bad();for(let i=0;i<3;i++)if(value(this,""+i)!==value(frame,""+i))bad();if(value(entry,"4")!==rearmed())bad();successful(value(entry,"3"));return true;}`,
 final:`function(state,returned,success,serviceReturned){${statePrelude}dense(returned,3);dense(success,5);dense(serviceReturned,3);if(value(returned,"0")!==state||value(success,"0")!==state||value(success,"2")!==returned||value(serviceReturned,"0")!==state||value(serviceReturned,"2")!==rearmed()||value(success,"4")!==value(serviceReturned,"2"))bad();successful(value(success,"3"));return true;}`,
});
