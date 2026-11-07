/** Actual source frames and every intermediate exact state before the next
 * original body is permitted. There is no general callback or resume host. */
import {CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_CALLS as CALLS,CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_FLAGS as FLAGS,CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_READS as READS,validateCurrentSchematicRelevanceMonitorBatchCommand as validate} from "./current-schematic-relevance-monitor-batch-protocol.ts";
import type {CurrentSchematicRelevanceMonitorBatchCommand as Command} from "./current-schematic-relevance-monitor-batch-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_EXPRESSIONS as EXPRESSIONS} from "./current-schematic-relevance-monitor-batch-programs.ts";
import {currentSchematicRelevanceUiPublicationCapture as capture,currentSchematicRelevanceUiPublicationHandle as handle,currentSchematicRelevanceUiPublicationTrue as truth,currentSchematicRelevanceUiPublicationTuple as tuple} from "./current-schematic-relevance-ui-publication-replies.ts";
import {currentSchematicRelevancePrefixProperties as properties} from "./current-schematic-relevance-run-prefix-replies.ts";
import type {CurrentSchematicRelevanceRecordAstInputs} from "./current-schematic-relevance-record-ast-cursor.ts";
import type {CurrentSchematicRelevanceActiveHistoryReceipt} from "./current-schematic-relevance-active-history-cursor.ts";
import type {CurrentSchematicRelevanceRunPrefixCapture} from "./current-schematic-relevance-run-prefix-cursor.ts";

export type CurrentSchematicRelevanceMonitorBatchStage=keyof typeof READS;
export interface CurrentSchematicRelevanceMonitorBatchInputs extends CurrentSchematicRelevanceRecordAstInputs{readonly active:CurrentSchematicRelevanceActiveHistoryReceipt;readonly prefix:CurrentSchematicRelevanceRunPrefixCapture;readonly variant:0|1}
export interface CurrentSchematicRelevanceMonitorBatchReceipt{readonly stage:CurrentSchematicRelevanceMonitorBatchStage;readonly frameObjectId:string;readonly stateObjectId:string;readonly viewObjectId:string|null;readonly originalRequests:number;readonly originalReceiverVerified:true;readonly exactPartialMutationVerified:true;readonly originalCurrentBodyStillHeld:true;readonly modifyCompleted:false;readonly saveAuthorized:false}
function need(value:boolean):asserts value{if(!value){throw new Error("SCHEMATIC_MONITOR_ORIGINAL_CURSOR");}}
const props=(objectId:string):Command=>validate({phase:"properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
const call=(role:typeof CALLS[number][0],objectId:string,args:readonly string[]):Command=>{const row=CALLS.find(value=>value[0]===role);need(row!==undefined&&args.length===row[2]);return validate({phase:"call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId,functionDeclaration:row[1],arguments:args.map(id=>({objectId:id})),returnByValue:row[3],awaitPromise:false,userGesture:false}});};
export class CurrentSchematicRelevanceMonitorBatchCursor{
 readonly #plan:Generator<Command,CurrentSchematicRelevanceMonitorBatchReceipt,unknown>;readonly #stage:CurrentSchematicRelevanceMonitorBatchStage;#pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#receipt:CurrentSchematicRelevanceMonitorBatchReceipt|null=null;
 public constructor(frame:string,stage:CurrentSchematicRelevanceMonitorBatchStage,input:CurrentSchematicRelevanceMonitorBatchInputs,previous:CurrentSchematicRelevanceMonitorBatchReceipt|null){this.#stage=stage;this.#plan=CurrentSchematicRelevanceMonitorBatchCursor.#collect(frame,stage,input,previous);Object.freeze(this);}
 static *#collect(frame:string,stage:CurrentSchematicRelevanceMonitorBatchStage,input:CurrentSchematicRelevanceMonitorBatchInputs,previous:CurrentSchematicRelevanceMonitorBatchReceipt|null):Generator<Command,CurrentSchematicRelevanceMonitorBatchReceipt,unknown>{
 const {raw,entry,primitive,record,active,prefix,ui,completion,variant}=input;truth(yield call("hooks",raw.nativeObjectId,[]));let role:keyof typeof EXPRESSIONS;if(stage==="bbox"){role=variant===0?"bboxMain":"bboxChild";}else{role=stage;}
 const actual=capture(yield validate({phase:"frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frame,expression:EXPRESSIONS[role],returnByValue:false,includeCommandLineAPI:false}}));let length=3;if(stage==="ast"){length=1;}else if(stage==="history"){length=2;}const values=tuple(yield props(actual),length);
 let state=previous?.stateObjectId??""; let view=previous?.viewObjectId??null;
 if(stage==="ast"){
  truth(yield call("raw",raw.snapshotObjectId,[raw.nativeObjectId,raw.referencesObjectId,entry.activeActionObjectId,entry.busGroupSetObjectId,entry.boundObjectId,primitive.captureObjectId]));truth(yield call("ui",ui.snapshotObjectId,[raw.nativeObjectId,ui.qualifiedObjectId,entry.boundObjectId,primitive.captureObjectId]));truth(yield call("ui",completion.snapshotObjectId,[raw.nativeObjectId,completion.qualifiedObjectId,entry.boundObjectId,primitive.captureObjectId]));
  state=capture(yield call("state",actual,[raw.nativeObjectId,entry.boundObjectId,raw.referencesObjectId]));const slots=tuple(yield props(state),3);properties(yield props(handle(slots[0])));truth(yield call("before",state,[raw.nativeObjectId,entry.boundObjectId,raw.referencesObjectId,prefix.intrinsicFunctionsObjectId,actual]));
 }else{
  need(previous!==null&&state.length>0);
  if(stage==="bbox"){
   const root=capture(yield call("view-root",entry.boundObjectId,[raw.nativeObjectId,entry.boundObjectId]));const slots=tuple(yield props(root),1);properties(yield props(handle(slots[0])));view=capture(yield call("view",root,[raw.nativeObjectId,entry.boundObjectId,raw.referencesObjectId,state]));tuple(yield props(view),4);
   properties(yield props(handle(values[2])));const map=capture(yield call("bbox-root",actual,[raw.nativeObjectId]));const maps=tuple(yield props(map),1);properties(yield props(handle(maps[0])));truth(yield call("bbox",actual,[raw.nativeObjectId,entry.boundObjectId,active.rootsObjectId,record.eventObjectId,map]));
  }else if(stage==="watch"){need(view!==null);truth(yield call("view-same",view,[raw.nativeObjectId,entry.boundObjectId,raw.referencesObjectId,state]));properties(yield props(handle(values[2])));truth(yield call("watch",actual,[raw.nativeObjectId,entry.boundObjectId,active.rootsObjectId,record.eventObjectId]));}
  else if(stage==="history"){need(view!==null);truth(yield call("view-same",view,[raw.nativeObjectId,entry.boundObjectId,raw.referencesObjectId,state]));truth(yield call("history",actual,[raw.nativeObjectId,entry.boundObjectId,active.rootsObjectId,record.eventObjectId]));}
  else {truth(yield call("modify",actual,[raw.nativeObjectId,entry.boundObjectId,raw.referencesObjectId,state]));}
  const changed=stage!=="modify";need(!changed||view!==null);const extra=changed&&view!==null?[view]:[];
  truth(yield call(changed?"view-raw":"ast-raw",raw.snapshotObjectId,[raw.nativeObjectId,raw.referencesObjectId,entry.activeActionObjectId,entry.busGroupSetObjectId,entry.boundObjectId,primitive.captureObjectId,...extra]));truth(yield call(changed?"view-ui":"ast-ui",ui.snapshotObjectId,[raw.nativeObjectId,ui.qualifiedObjectId,entry.boundObjectId,primitive.captureObjectId,...extra]));truth(yield call(changed?"view-ui":"ast-ui",completion.snapshotObjectId,[raw.nativeObjectId,completion.qualifiedObjectId,entry.boundObjectId,primitive.captureObjectId,...extra]));
 }
 return Object.freeze({stage,frameObjectId:actual,stateObjectId:state,viewObjectId:view,originalRequests:READS[stage],originalReceiverVerified:true,exactPartialMutationVerified:true,originalCurrentBodyStillHeld:true,modifyCompleted:false,saveAuthorized:false});}
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#receipt!==null){return null;}const next=this.#plan.next();need(next.done!==true);this.#pending=next.value;return this.#pending;}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.next()===command);this.#reserved=true;this.#reads += 1;need(this.#reads<=READS[this.#stage]);}
 public accept(command:Command,reply:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{const next=this.#plan.next(reply);this.#pending=null;this.#reserved=false;if(next.done===true){need(this.#reads===READS[this.#stage]);this.#receipt=next.value;}else {this.#pending=next.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicRelevanceMonitorBatchReceipt{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#receipt!==null);return this.#receipt;}public fail():void{this.#failed=true;}
}
