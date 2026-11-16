/** Original nested parser contexts, exact sheet publication, and six retained
 * native return Promises. All output remains source comparison data. */
import {z} from "zod";
import {decodeCurrentSchematicWireParserPromise as decodePromise} from "./current-schematic-wire-parser-promise.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentSchematicRelevanceRawHandle as object} from "./current-schematic-relevance-action-raw-replies.ts";
import {CurrentSchematicWireParserCensus as Census,wireParserRef as ref,wireParserFieldValue as value} from "./current-schematic-wire-parser-census.ts";
import {consumeCurrentSchematicWireParserHelperData as helpers} from "./current-schematic-wire-parser-helper-cursor.ts";
import type {CurrentSchematicWireParserHelperData} from "./current-schematic-wire-parser-helper-cursor.ts";
import {decodeCurrentSchematicWireCompletionFunction as qualify} from "./current-schematic-wire-completion-source.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_PARSER_REQUESTS as LIMIT,validateCurrentSchematicWireParserCommand as validate} from "./current-schematic-wire-parser-protocol.ts";
import type {CurrentSchematicWireParserCommand as Command} from "./current-schematic-wire-parser-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FRAMES as FRAMES} from "./current-schematic-wire-parser-programs.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const nativePromise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
const retainedPromise=z.strictObject({result:nativePromise});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const RETURN_ROLES=["sheetAst","astPassSchematic","astPassContent","astUpdate","sheetParse","docParse"] as const;
type ReturnRole=typeof RETURN_ROLES[number];
type First=Readonly<{stage:"context";frame:string;callerFrame:string;holder:string;native:string;scriptId:string;variant:0|1}>;
export interface CurrentSchematicWireParserData{
 readonly schema:"private.schematic-wire-parser-comparison-data.v1";readonly stage:"context"|"sheet"|"astEntry"|"published"|"returned"|"settled";
 readonly context:string;readonly sheet:string|null;readonly returnedRole:ReturnRole|null;readonly normalReturnPromisesCompared:number;
 readonly sameOriginalContextCompared:true;readonly allTwentyOneHelpersCompared:boolean;readonly sameAstPublishedCompared:boolean;readonly allSixRetainedPromisesFulfilledCompared:boolean;
 readonly suppliedObservationsOnly:true;readonly originalHeldEventsJoined:false;readonly helperClosureBindingsComplete:false;readonly childRpcJoined:false;readonly selectedTreeChildJoined:false;readonly parserCompleted:false;readonly saveAuthorized:false;
}
export type CurrentSchematicWireParserInput=First|Readonly<{stage:"sheet";frame:string;previous:CurrentSchematicWireParserData}>|Readonly<{stage:"astEntry";frame:string;helpers:CurrentSchematicWireParserHelperData;previous:CurrentSchematicWireParserData}>|Readonly<{stage:"published";frame:string;callerFrame:string;previous:CurrentSchematicWireParserData}>|Readonly<{stage:"returned";frame:string;role:ReturnRole;promise:string;previous:CurrentSchematicWireParserData}>|Readonly<{stage:"settled";previous:CurrentSchematicWireParserData}>;
interface Returned{readonly role:ReturnRole;readonly promise:string;readonly result:string|null}
interface Stored{readonly first:First;readonly context:string;readonly sheet:string|null;readonly helperTuple:string|null;readonly helpersCompared:boolean;readonly published:boolean;readonly returns:readonly Returned[];readonly uuid:string;readonly schematic:string}
const issued=new WeakMap<CurrentSchematicWireParserData,Stored>();const spent=new WeakSet<CurrentSchematicWireParserData>();
function need(condition:boolean):asserts condition{if(!condition){throw new Error("SCHEMATIC_WIRE_PARSER_CURSOR");}}
function props(objectId:string):Command{return validate({phase:"wire-parser-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[]):Command{const row=CALLS[role];need(refs.length===row.refs);return validate({phase:"wire-parser-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});}
function frame(first:First,role:keyof typeof FRAMES[0],callFrameId:string):Command{return validate({phase:"wire-parser-frame",variant:first.variant,role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression:FRAMES[first.variant][role],returnByValue:false,includeCommandLineAPI:false}});}
function promiseResult(raw:unknown,role:ReturnRole):string|null{return decodePromise(raw,role==="sheetAst"?"object":"undefined");}
function* approved(census:Census,first:First,receiver:string):Generator<Command,string,unknown>{const refs=[...census.approved];while(refs.length<LIMIT.approvedSlots){refs.push(first.native);}return tuple(yield call("approved",receiver,[first.native,...refs]),LIMIT.approvedSlots);}
function* settle(first:First,context:string,sheet:string,returns:readonly Returned[]):Generator<Command,void,unknown>{
 for(const retained of returns){const result=promiseResult(yield props(retained.promise),retained.role);if(retained.role==="sheetAst"){need(result!==null&&retained.result!==null);truth.parse(yield call("sameObject",retained.result,[result]));}}
 truth.parse(yield call("contextCurrent",first.holder,[first.native,first.holder,context,sheet]));
}
export class CurrentSchematicWireParserCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireParserData,unknown>;readonly #maximum:number;#pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireParserData|null=null;readonly #packets:unknown[]=[];
 public constructor(input:CurrentSchematicWireParserInput){
  let first:First;let old:Stored|null=null;
  if(input.stage==="context"){first=Object.freeze({...input});for(const id of[first.frame,first.callerFrame,first.holder,first.native,first.scriptId]){handle.parse(id);}need((first.variant===0||first.variant===1)&&!Object.is(first.variant,-0));}
  else{const stored=issued.get(input.previous);need(stored!==undefined&&!spent.has(input.previous));spent.add(input.previous);first=stored.first;old=stored;
   const previous=input.previous;
   if(input.stage==="sheet"){need(previous.stage==="context");}
   else if(input.stage==="astEntry"){need(previous.stage==="sheet");}
   else if(input.stage==="published"){need(previous.stage==="returned"&&previous.returnedRole==="sheetAst");}
   else if(input.stage==="settled"){need(previous.stage==="returned"&&previous.returnedRole==="docParse"&&stored.returns.length===6&&stored.published);}
   else{need(input.role===RETURN_ROLES[stored.returns.length]);let expectedStage:"astEntry"|"published"|"returned"="returned";if(input.role==="sheetAst"){expectedStage="astEntry";}else if(input.role==="astPassSchematic"){expectedStage="published";}need(previous.stage===expectedStage);handle.parse(input.promise);}
   if(input.stage!=="settled"){handle.parse(input.frame);}if(input.stage==="published"){handle.parse(input.callerFrame);}
  }
  if(input.stage==="returned"){this.#maximum=input.role==="sheetAst"?LIMIT.astReturn:LIMIT.otherReturn;}else{this.#maximum=({context:LIMIT.context,sheet:LIMIT.sheet,astEntry:LIMIT.astEntry,published:LIMIT.published,settled:LIMIT.settle} as const)[input.stage];}
  this.#plan=CurrentSchematicWireParserCursor.collect(input,first,old);Object.freeze(this);
 }
 private static *collect(input:CurrentSchematicWireParserInput,first:First,old:Stored|null):Generator<Command,CurrentSchematicWireParserData,unknown>{
  const {native,holder,variant,scriptId}=first;let context:string;let sheet=old?.sheet??null;let helperTuple=old?.helperTuple??null;let helpersCompared=old?.helpersCompared??false;let published=old?.published??false;const returns=[...old?.returns??[]];let uuid=old?.uuid??"";let schematic=old?.schematic??"";
  if(input.stage==="context"){
   const census=new Census(64);const captured=tuple(yield frame(first,"context",first.frame),4);const cells=yield* census.array(captured,4);const caller=tuple(yield frame(first,"caller",first.callerFrame),2);const callCells=yield* census.array(caller,2);const h=yield* census.array(holder,2);const b=yield* census.field(h,"0");const state=yield* census.field(h,"1");yield* census.field(state,"before");
   for(const key of["shapes","host","metadata","line","group","runner"]){yield* census.field(b,key);}const page=yield* census.field(b,"page");yield* census.field(page,"projectMgr");const arg=yield* census.field(callCells,"1");const action=yield* census.field(arg,"action");yield* census.array(ref(action,"dependencies","array"),0);
   const fn=value(cells,"3");qualify(yield props(object(fn,"function")),fn,variant,"sheetParse",scriptId);
   const table=yield* approved(census,first,holder);context=tuple(yield call("context",captured,[native,holder,caller,table]),23);const snapshot=array(yield props(context),23);const pageId=snapshot.get("14"); const schematicId=snapshot.get("13");need(pageId?.type==="string"&&typeof pageId.value==="string"&&schematicId?.type==="string"&&typeof schematicId.value==="string");uuid=pageId.value;schematic=schematicId.value;
  }else{
   need(old!==null);context=old.context;
   if(input.stage==="sheet"){
    const census=new Census(64);const captured=tuple(yield frame(first,"sheet",input.frame),6);const cells=yield* census.array(captured,6);const h=yield* census.array(holder,2);const b=yield* census.field(h,"0");const state=yield* census.field(h,"1");yield* census.field(state,"before");
    for(const key of["page","shapes","host","metadata","line","group","runner"]){yield* census.field(b,key);}const page=yield* census.field(b,"page");yield* census.field(page,"projectMgr");
    const info=yield* census.field(cells,"2");const ast=yield* census.field(cells,"3");yield* census.field(cells,"5");const table=yield* census.field(info,"schematics");const selected=yield* census.field(table,schematic);yield* census.field(selected,"sheets");for(const key of["objectTreeManager","pageTreeManager"]){yield* census.field(ast,key);}
    const fn=value(cells,"4");qualify(yield props(object(fn,"function")),fn,variant,"sheetAst",scriptId);const checked=yield* approved(census,first,holder);sheet=tuple(yield call("sheet",captured,[native,holder,context,checked]),9);array(yield props(sheet),9);
   }else{
    need(sheet!==null);
    if(input.stage==="astEntry"){
     const selected=helpers(input.helpers,{frame:input.frame,scriptId,variant});helperTuple=selected.frameTuple;const captured=tuple(yield frame(first,"astEntry",input.frame),5);array(yield props(captured),5);truth.parse(yield call("astEntry",captured,[native,holder,context,sheet,helperTuple]));helpersCompared=true;
    }else if(input.stage==="published"){
     const last=returns[0];need(last?.role==="sheetAst"&&last.result!==null);const captured=tuple(yield frame(first,"published",input.frame),4);array(yield props(captured),4);const caller=tuple(yield frame(first,"publishCaller",input.callerFrame),6);array(yield props(caller),6);truth.parse(yield call("published",captured,[native,holder,context,sheet,caller,last.result]));published=true;
    }else if(input.stage==="returned"){
     const role=({sheetAst:"astReturned",astPassSchematic:"passSchematicReturned",astPassContent:"passContentReturned",astUpdate:"updateReturned",sheetParse:"sheetReturned",docParse:"docReturned"} as const)[input.role];
     const captured=tuple(yield frame(first,role,input.frame),({astReturned:6,passSchematicReturned:3,passContentReturned:3,updateReturned:4,sheetReturned:4,docReturned:3} as const)[role]);array(yield props(captured),({astReturned:6,passSchematicReturned:3,passContentReturned:3,updateReturned:4,sheetReturned:4,docReturned:3} as const)[role]);
     const retained=retainedPromise.parse(yield call("retainPromise",input.promise,[])).result.objectId;const result=promiseResult(yield props(retained),input.role);
     if(input.role==="sheetAst"){need(result!==null);const census=new Census(64);const ast=yield* census.read(result);const symbols=ref(ast,"symbols"); const unused=ref(ast,"useLessSymbols");yield* census.read(symbols);yield* census.read(unused);truth.parse(yield call("astReturned",captured,[native,holder,context,sheet,result,symbols,unused]));}
     else {truth.parse(yield call(role,captured,[native,holder,context,sheet]));}
     returns.push(Object.freeze({role:input.role,promise:retained,result}));
    }else{
     need(input.stage==="settled"&&returns.length===6);yield* settle(first,context,sheet,returns);
    }
   }
  }
  const data:CurrentSchematicWireParserData=Object.freeze({schema:"private.schematic-wire-parser-comparison-data.v1",stage:input.stage,context,sheet,returnedRole:input.stage==="returned"?input.role:null,normalReturnPromisesCompared:returns.length,sameOriginalContextCompared:true,allTwentyOneHelpersCompared:helpersCompared,sameAstPublishedCompared:published,allSixRetainedPromisesFulfilledCompared:input.stage==="settled",suppliedObservationsOnly:true,originalHeldEventsJoined:false,helperClosureBindingsComplete:false,childRpcJoined:false,selectedTreeChildJoined:false,parserCompleted:false,saveAuthorized:false});
  if(input.stage!=="settled"){issued.set(data,Object.freeze({first,context,sheet,helperTuple,helpersCompared,published,returns:Object.freeze(returns),uuid,schematic}));}return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const step=this.#plan.next();need(step.done!==true);this.#pending=step.value;return step.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending!==null&&command===this.#pending&&this.#reads<this.#maximum);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{this.#packets.push(raw);const step=this.#plan.next(capture(raw).value);this.#pending=null;this.#reserved=false;if(step.done===true){this.#result=step.value;}else {this.#pending=step.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireParserData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#packets]);}
 public fail():void{this.#failed=true;}
}

Object.freeze(CurrentSchematicWireParserCursor.prototype);Object.freeze(CurrentSchematicWireParserCursor);
