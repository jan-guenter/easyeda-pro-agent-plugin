/** Native DEL caller values. Pure GET task algorithms are reused only over
 * newly captured DEL roots; every original registry remains separate. */
import{createHash}from"node:crypto";
import{CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as NATIVE}from"./current-footprint-inverse-lookup-native-programs.ts";
import{CURRENT_NATIVE_OWN_DATA_CHECK as CHECK}from"./current-native-own-data-intrinsics.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_PROGRAMS as DATA}from"./current-footprint-inverse-native-get-task-result-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_GET_RESULT_PROGRAMS as TASK}from"./current-footprint-inverse-get-result-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_GET_SEND_EVENT_PROGRAMS as EVENT}from"./current-footprint-inverse-get-send-event-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_GET_SEND_PROGRAMS as SEND}from"./current-footprint-inverse-get-send-programs.ts";
import{freezeDeep}from"./sqlite-inventory-core.ts";

const innerTopic="/mgr/projectWorker/footprint/delete";const oldTopic="/PrjDB/footprint/getData";const topic="/PrjDB/footprint/delete";
const anchor=`data(sub,"${oldTopic}")`;
if(DATA.views.split(anchor).length!==2||createHash("sha256").update(DATA.views).digest("hex")!=="76ab12d72d2e747f125ea12f06132556f517149ff3fbb29ffeb18401f2f42191"){throw new Error("INVERSE_NATIVE_DELETE_CALLER_VIEWS_SOURCE");}
const common=`"use strict";${CHECK}const guard=f=>{if(typeof f!=="function"||invoke(f,undefined,[])!==true)bad();};const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};const method=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||d.enumerable||!d.configurable||typeof d.value!=="function")bad();return d.value;};const absent=(o,k)=>{if(get(o,k)!==undefined||get(objectProto,k)!==undefined)bad();};`;
const roots=`function(views,sender,inner,prepared,native,members,queued,innerMethods,qualified){${common}
dense(innerMethods,22);dense(views,5);dense(sender,8);dense(inner,12);dense(prepared,5);dense(native,20);dense(members,24);dense(queued,1);
const outer=value(views,"0"),module=value(views,"1"),methods=value(views,"2");dense(outer,6);dense(module,14);dense(methods,13);guard(value(native,"19"));guard(value(members,"23"));guard(value(inner,"11"));
const bus=value(outer,"0"),p=value(outer,"1"),sub=value(outer,"2"),pulled=value(outer,"3"),pushed=value(outer,"4"),innerBus=value(inner,"0"),innerSub=value(inner,"3"),innerPush=value(inner,"4"),outerKey=value(sender,"2"),innerKey=value(prepared,"0"),q=value(queued,"0");
const nativeHooks=()=>{if(invoke((${NATIVE.defaultInstance}),packet,[native,members,qualified])!==true||invoke((${NATIVE.hooks}),packet,[native,members])!==true)bad();};
const check=()=>{nativeHooks();guard(value(native,"19"));guard(value(members,"23"));guard(value(inner,"11"));guard(value(innerMethods,"21"));
 if(value(root,"_MSG_BUS_")!==bus||proto(bus)!==p||proto(p)!==objectProto||count(bus)!==6||count(p)!==10||method(p,"constructor")!==value(module,"0")||data(bus,"subscribed")!==sub||data(bus,"pulled")!==pulled||data(bus,"pushed")!==pushed||data(bus,"unsafe")!==false||proto(sub)!==objectProto||proto(pulled)!==objectProto||proto(pushed)!==objectProto||data(innerBus,"subscribed")!==innerSub||data(innerBus,"pushed")!==innerPush||value(sender,"0")!==bus||value(sender,"1")!==value(methods,"7")||typeof outerKey!=="string"||typeof innerKey!=="string")bad();
 const keys=["uniqueRpcTopic","publish","subscribe","push","pull","pullA","rpcService","rpcCall","rpcReply"];for(let j=0;j<9;j++){const key=value(keys,""+j);if(get(bus,key)!==undefined||method(p,key)!==value(methods,""+j))bad();}
 if(get(objectProto,${JSON.stringify(innerTopic)})!==undefined)bad();const pending=get(innerPush,${JSON.stringify(innerTopic)});if(pending!==undefined){if(!has(pending,"value")||pending.value!==q||!pending.writable||!pending.enumerable||!pending.configurable)bad();dense(q,0);}
 if(get(objectProto,"then")!==undefined)bad();return true;};check();
return[bus,sub,pulled,pushed,data(sub,${JSON.stringify(topic)}),data(pulled,outerKey),innerBus,innerSub,data(innerSub,innerKey),outerKey,innerKey,check];}`;
const innerSubscribe=`function(frame,roots,tasks,callbacks,callback,caller){${common}
dense(frame,3);dense(roots,12);dense(tasks,3);dense(callbacks,5);dense(callback,2);dense(caller,2);guard(value(roots,"11"));guard(value(callbacks,"3"));guard(value(callback,"1"));
const body=value(frame,"0");if(value(frame,"1")!==value(tasks,"2")||value(frame,"2")!==value(callback,"0")||value(caller,"0")!==value(tasks,"2")||value(caller,"1")!==body||proto(body)!==objectProto||count(body)!==2||data(body,"success")!==true)bad();return[body,()=>{guard(value(roots,"11"));if(proto(body)!==objectProto||count(body)!==2||data(body,"success")!==true)bad();return true;}];}`;
const innerRpc=`function(frame,response,resolvers,tasks,callback){${common}
dense(frame,3);dense(response,2);dense(resolvers,3);dense(tasks,3);dense(callback,2);guard(value(response,"1"));guard(value(resolvers,"2"));guard(value(callback,"1"));
const body=value(response,"0"),task=value(tasks,"2");if(value(frame,"0")!==body||value(frame,"1")!==value(resolvers,"0")||value(frame,"2")!==value(resolvers,"1")||data(task,"callback")!==null||data(task,"isRunning")!==false||data(task,"unsafe")!==true)bad();const result=data(body,"result");if(proto(result)!==objectProto||count(result)!==1||data(result,"success")!==true)bad();return[result];}`;
const innerEnvelope=`function(read,frame,roots,worker,origin){${common}dense(read,5);dense(frame,3);dense(roots,12);guard(value(read,"4"));guard(value(roots,"11"));const envelope=value(read,"2");if(value(read,"3")!==origin||proto(envelope)!==objectProto||count(envelope)!==4||data(envelope,"type")!=="PUBLISH"||data(envelope,"uuid")!==worker||data(envelope,"topic")!==value(roots,"10")||data(envelope,"message")!==value(frame,"0"))bad();return true;}`;
const managerReturned=`function(frame,project,sender,selected){${common}dense(frame,3);dense(project,3);dense(sender,8);dense(selected,2);if(value(frame,"0")!==value(project,"0")||value(frame,"1")!==value(sender,"3")||data(value(frame,"0"),"project")!==value(selected,"0")||data(value(selected,"0"),"uuid")!==value(sender,"4")||data(value(selected,"0"),"workerBus")!==value(project,"1"))bad();return true;}`;
const handlerReturned=`function(frame,sender,module){${common}dense(frame,4);dense(sender,8);dense(module,4);if(value(frame,"0")!==value(sender,"3")||value(frame,"1")!==value(sender,"4")||value(frame,"2")===null||proto(value(frame,"2"))!==objectProto||count(value(frame,"2"))!==1||data(value(frame,"2"),"success")!==true||value(frame,"3")!==value(module,"1"))bad();return[value(frame,"2")];}`;
const callback=`function(frame,roots,tasks,callbacks,module,caller){${common}dense(frame,5);dense(roots,12);dense(tasks,3);dense(callbacks,5);dense(module,14);dense(caller,6);guard(value(roots,"11"));guard(value(callbacks,"4"));
if(value(frame,"0")!==true||value(frame,"1")!==undefined||value(frame,"2")!==undefined||value(frame,"4")!==value(module,"6")||value(caller,"0")!==value(tasks,"1")||value(caller,"1")!==true||value(caller,"2")!==undefined||value(caller,"3")!==undefined||value(caller,"4")!==false||value(caller,"5")!==value(module,"2"))bad();const resolve=value(frame,"3");if(typeof resolve!=="function")bad();return[frame,resolve];}`;
const callbackReturned=`function(frame,entry){${common}dense(frame,5);dense(entry,2);const original=value(entry,"0");dense(original,5);for(let j=0;j<5;j++)if(value(frame,""+j)!==value(original,""+j))bad();return true;}`;
const final=`function(roots,tasks,callbacks){${common}dense(roots,12);dense(tasks,3);dense(callbacks,5);guard(value(roots,"11"));guard(value(callbacks,"4"));const inner=value(tasks,"2");if(data(inner,"callback")!==null||data(inner,"unsafe")!==true||data(inner,"isRunning")!==false)bad();dense(value(roots,"8"),1);if(value(value(roots,"8"),"0")!==inner)bad();absent(value(roots,"2"),value(roots,"9"));absent(value(roots,"3"),value(roots,"9"));absent(data(value(roots,"6"),"pushed"),${JSON.stringify(innerTopic)});return true;}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_UI_PROGRAMS=freezeDeep({
 views:DATA.views.replace(anchor,`data(sub,"${topic}")`),queued:DATA.queued.replace("/mgr/projectWorker/footprint/get",innerTopic),
 eventConstructors:EVENT.constructors,eventMembers:EVENT.members,eventOpaque:EVENT.opaque,promise:SEND.promise,innerEnvelope,
 roots,tasks:TASK.tasks,callbacks:TASK.callbacks,innerCallback:TASK.innerCallback,innerResolvers:TASK.innerResolvers,innerSubscribe,innerRpc,managerReturned,handlerReturned,callback,callbackReturned,final,
 retain:'function(){"use strict";return this;}',same:TASK.same,outerResult:DATA.outerResult,
});
