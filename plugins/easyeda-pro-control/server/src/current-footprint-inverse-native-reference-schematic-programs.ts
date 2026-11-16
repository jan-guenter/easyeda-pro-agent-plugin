/** Native schematic return uses only independently fixed pure algorithms.
 * Its fresh views and five-slot callback preparation have their own census. */
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_SCHEMATIC_PROGRAMS as BODY,CURRENT_FOOTPRINT_INVERSE_REFERENCE_SCHEMATIC_EXPRESSIONS as BODY_EXPRESSIONS} from "./current-footprint-inverse-reference-schematic-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_RESULT_SHARED_PROGRAMS as RESULT} from "./current-footprint-inverse-reference-result-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_PROGRAMS as NATIVE,CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_EXPRESSIONS as UI_EXPRESSIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_POINTS as UI_POINTS} from "./current-footprint-inverse-native-get-task-result-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as INTRINSICS} from "./current-footprint-inverse-lookup-native-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_SEND_PROGRAMS as SEND} from "./current-footprint-inverse-get-send-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_PROGRESS_POINTS as BODY_POINTS} from "./current-footprint-inverse-reference-progress-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_SEND_EXPRESSIONS as TIMER} from "./current-footprint-inverse-get-send-source.ts";
import {CURRENT_NATIVE_OWN_DATA_CHECK} from "./current-native-own-data-intrinsics.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function replace(s:string,from:string,to:string):string{if(s.split(from).length!==2){throw new Error("INVERSE_NATIVE_SCHEMATIC_CENSUS");}return s.replace(from,to);}
const common=`"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}const guard=f=>{if(typeof f!=="function"||f()!==true)bad();};const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};`;
const executeLive=`function(frame,push,roots,tasks,module,empty){${common}dense(frame,6);dense(push,5);dense(roots,8);dense(tasks,2);dense(module,14);dense(empty,2);guard(value(roots,"7"));guard(value(module,"13"));guard(value(empty,"1"));if(value(frame,"0")!==value(tasks,"1")||value(frame,"1")!==value(empty,"0")||value(frame,"2")!==undefined||value(frame,"3")!==undefined||value(frame,"4")!==false||value(frame,"5")!==value(module,"2")||value(push,"0")!==value(roots,"0")||value(push,"1")!==value(roots,"6")||value(push,"2")!==value(empty,"0")||value(push,"3")!==undefined||value(push,"4")!==undefined)bad();return true;}`;
const callbackLive=`function(frame,execute,push,roots,tasks,module,empty){${common}dense(frame,5);if(value(frame,"4")!==value(module,"6"))bad();const first=[value(frame,"0"),value(frame,"1"),value(frame,"2"),value(frame,"3")];const check=${RESULT.schOuterCallback};return invoke(check,packet,[first,execute,push,roots,tasks,module,empty]);}`;
const replyLive=replace(replace(replace(NATIVE.replyLive,"dense(roots,12)","dense(roots,8)"),'guard(value(roots,"11"))','guard(value(roots,"7"))'),'value(roots,"9")','value(roots,"6")');
const roots=replace(RESULT.schRoots,"dense(prepared,4)","dense(prepared,5)");
const final=replace(RESULT.schFinal,"dense(prepared,4)","dense(prepared,5)");
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_PROGRAMS=freezeDeep({
 ...BODY,retain:"function(original){return original;}",promise:SEND.promise,
 views:replace(NATIVE.views,"/PrjDB/footprint/getData","getDeviceByUuid"),replyState:NATIVE.replyState,target:NATIVE.target,
 roots,tasks:RESULT.schTasks,callbacks:RESULT.schCallbacks,empty:RESULT.empty,emptyReprove:RESULT.emptyReprove,
 replyLive,executeLive,callbackLive,outerResult:NATIVE.outerResult,final,
 nativeInstance:INTRINSICS.defaultInstance,nativeHooks:INTRINSICS.hooks,
}as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_EXPRESSIONS=freezeDeep({...BODY_EXPRESSIONS,
 timer:TIMER.uiTimer,outerLocal:TIMER.uiOuterLocal,reply:UI_EXPRESSIONS.reply,execute:UI_EXPRESSIONS.execute,push:UI_EXPRESSIONS.push,callback:UI_EXPRESSIONS.callback}as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_POINTS=freezeDeep({
 handlerMain:BODY_POINTS.handlerMain,handlerChild:BODY_POINTS.handlerChild,entryMain:BODY_POINTS.entryMain,entryChild:BODY_POINTS.entryChild,iteratorMain:BODY_POINTS.iteratorMain,iteratorChild:BODY_POINTS.iteratorChild,
 returnedMain:BODY_POINTS.returnedMain,returnedChild:BODY_POINTS.returnedChild,handlerReturnedMain:BODY_POINTS.handlerReturnedMain,handlerReturnedChild:BODY_POINTS.handlerReturnedChild,
 timer:BODY_POINTS.uiTimer,outerReturned:BODY_POINTS.uiOuterReturned,
 reply:{file:"ui",name:"rpcReply",line:1033,fn:UI_POINTS.reply.functionColumn,pc:UI_POINTS.reply.columnNumber},
 execute:{file:"ui",name:"execute",line:1033,fn:UI_POINTS.execute.functionColumn,pc:UI_POINTS.execute.columnNumber},
 callback:{file:"ui",name:"",line:1033,fn:UI_POINTS.callback.functionColumn,pc:UI_POINTS.callback.columnNumber},
 callbackReturned:{file:"ui",name:"",line:1033,fn:UI_POINTS.returned.functionColumn,pc:UI_POINTS.returned.columnNumber},
}as const);
