/** Read the actual original provider frames and retain normal return aliases. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentSchematicRelevanceRawHandle as object}from"./current-schematic-relevance-action-raw-replies.ts";
import{requireCurrentSchematicWireUiRuntimeRoot as requireRoot}from"./current-schematic-wire-ui-runtime-root.ts";
import type{CurrentSchematicWireUiRuntimeRoot}from"./current-schematic-wire-ui-runtime-root.ts";
import{requireCurrentSchematicWireServiceInvocationRoot as originalRoot}from"./current-schematic-wire-service-invocation-root.ts";
import{CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS as POINTS}from"./current-schematic-wire-ui-runtime-source.ts";
import type{CurrentSchematicWireUiRuntimePoint as Kind}from"./current-schematic-wire-ui-runtime-source.ts";
import{CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_FRAMES as FRAMES,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_RETAIN as RETAIN}from"./current-schematic-wire-ui-runtime-programs.ts";
import{validateCurrentSchematicWireUiRuntimeCommand as validate}from"./current-schematic-wire-ui-runtime-protocol.ts";
import type{CurrentSchematicWireUiRuntimeCommand as Command}from"./current-schematic-wire-ui-runtime-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";

interface Input{readonly root:CurrentSchematicWireUiRuntimeRoot;readonly point:Kind;readonly frame:string;readonly caller:string|null;readonly returnValue:unknown}
export interface CurrentSchematicWireUiRuntimeData{readonly schema:"private.schematic-wire-ui-runtime-frame.v1";readonly point:Kind;readonly sourceFramesAndReceiverCompared:true;readonly originalNormalReturnCompared:boolean;readonly returnedObjectRetainedBeforeResume:boolean;readonly retainedReturnCell:string|null;readonly suppliedObservationsOnly:true;readonly originalNativeOwnerJoined:false;readonly serviceDeliveryJoined:false;readonly saveAuthorized:false}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const returnedObject=z.strictObject({type:z.literal("object"),className:z.string().max(256).optional(),description:z.string().max(16_384).optional(),objectId:handle});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_UI_RUNTIME_CURSOR");}}
function props(objectId:string):Command{return validate({phase:"wire-ui-runtime-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function frame(role:keyof typeof FRAMES,callFrameId:string):Command{return validate({phase:"wire-ui-runtime-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression:FRAMES[role],returnByValue:false,includeCommandLineAPI:false}});}
function call(role:Kind|"retain",receiver:string,refs:readonly string[]):Command{
 const row=role==="retain"?{program:RETAIN,refs:0,byValue:false}:CALLS.find(item=>item.role===role);need(row!==undefined&&refs.length===row.refs);
 return validate({phase:"wire-ui-runtime-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});
}
export class CurrentSchematicWireUiRuntimeCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireUiRuntimeData,unknown>;readonly #maximum:number;
 #pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireUiRuntimeData|null=null;readonly #raw:unknown[]=[];
 public constructor(input:Input){
  requireRoot(input.root);handle.parse(input.frame);if(input.caller!==null){handle.parse(input.caller);}const row=POINTS[input.point];need(row!==undefined);
  let maximum=5;if(input.point==="trim"){maximum=3;}else if(row.returned==="tool"||row.returned==="controller"){maximum=7;}this.#maximum=maximum;this.#plan=CurrentSchematicWireUiRuntimeCursor.collect(input);Object.freeze(this);
 }
 private static *collect(input:Input):Generator<Command,CurrentSchematicWireUiRuntimeData,unknown>{
  const before=requireRoot(input.root);const original=originalRoot(before.root);const {holder,native}=original.input;const reg=before.root.registrations;const row=POINTS[input.point];
  const sizes={lookup:3,instance:2,get:2,closing:1,curr:1,value:3,trim:6}as const;
  const captured=tuple(yield frame(row.frame,input.frame),sizes[row.frame]);array(yield props(captured),sizes[row.frame]);let caller=reg.targets;
  if(row.caller!==null){need(input.caller!==null);const key=({closing:"callerClosing",lookup:"callerLookup",language:"callerLanguage"}as const)[row.caller];const size=({lookup:3,closing:3,language:6}as const)[row.caller];caller=tuple(yield frame(key,input.caller),size);array(yield props(caller),size);}
  const refs=[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,before.registry,before.locale,reg.targets,caller];
  let retained=false;let retainedReturnCell:string|null=null;
  if(row.returned==="tool"||row.returned==="controller"){
   const returned=object(returnedObject.parse(input.returnValue),"object");const raw=yield call("retain",returned,[]);const cell=tuple(raw,1);const values=array(yield props(cell),1);const alias=object(values.get("0"),"object");refs.push(alias);retained=true;retainedReturnCell=cell;
  }else if(row.returned==="false"){z.strictObject({type:z.literal("boolean"),value:z.literal(false)}).parse(input.returnValue);}
  else if(row.returned==="locale"||row.returned==="translation"){const value=z.strictObject({type:z.literal("string"),value:z.string().max(8192)}).parse(input.returnValue).value;need(value===(row.returned==="locale"?before.localeName:before.translation));}
  truth.parse(yield call(input.point,captured,refs));requireRoot(input.root);
  return Object.freeze({schema:"private.schematic-wire-ui-runtime-frame.v1",point:input.point,sourceFramesAndReceiverCompared:true,originalNormalReturnCompared:row.returned!=="none",returnedObjectRetainedBeforeResume:retained,retainedReturnCell,suppliedObservationsOnly:true,originalNativeOwnerJoined:false,serviceDeliveryJoined:false,saveAuthorized:false});
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending===command&&this.#reads<this.#maximum);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{this.#raw.push(raw);const row=this.#plan.next(capture(raw).value);this.#reserved=false;this.#pending=null;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireUiRuntimeData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#raw]);}
 public fail():void{this.#failed=true;}
}
Object.freeze(CurrentSchematicWireUiRuntimeCursor.prototype);Object.freeze(CurrentSchematicWireUiRuntimeCursor);
