/* oxlint-disable eslint/max-classes-per-file -- Three related finite readers share the same command-identity engine and no execution authority. */
/** Finite source/metadata comparison cursors for the original Wire path.
 * They accept selectors only;
 Core must retain actual events, replies and
 * current ownership. No cursor issues a body, history, mutation or Save permit. */
import {z} from "zod";

import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

import {currentSchematicRelevanceRawHandle as object,currentSchematicRelevanceRawProperties as properties} from "./current-schematic-relevance-action-raw-replies.ts";

import type {CurrentSchematicRelevanceRawProperty as Property,CurrentSchematicRelevanceRawRemote as Remote} from "./current-schematic-relevance-action-raw-replies.ts";

import {CURRENT_SCHEMATIC_WIRE_TRANSITION_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_TRANSITION_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_TRANSITION_REQUESTS as LIMIT,validateCurrentSchematicWireTransitionCommand as validate} from "./current-schematic-wire-transition-protocol.ts";

import type {CurrentSchematicWireTransitionCallRole as CallRole,CurrentSchematicWireTransitionCommand as Command} from "./current-schematic-wire-transition-protocol.ts";

import {CURRENT_SCHEMATIC_WIRE_TRANSITION_ROLES as ROLES,decodeCurrentSchematicWireTransitionFunction as qualify} from "./current-schematic-wire-transition-source.ts";

import type {CurrentSchematicWireTransitionFunction as FunctionData,CurrentSchematicWireTransitionRole as Role} from "./current-schematic-wire-transition-source.ts";

import {CURRENT_SCHEMATIC_WIRE_TRANSITION_FRAMES as FRAMES} from "./current-schematic-wire-transition-programs.ts";


const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);

function need(value:boolean):asserts value{if(!value){throw new Error("SCHEMATIC_WIRE_TRANSITION_CURSOR");
}}
const internal=z.strictObject({name:z.string(),value:z.looseObject({type:z.enum(["object","function","undefined","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()})});

/** Return a metadata-qualified ordinary prototype, never a Proxy or inferred parent. */
function parent(input:unknown):string|null{const raw=z.strictObject({result:z.array(z.unknown()).max(256),internalProperties:z.array(internal).max(3)}).parse(input);
const rows=raw.internalProperties.filter(row=>row.name==="[[Prototype]]");
need(rows.length===1);
const value=rows[0]?.value;
need(value!==undefined);
if(value.type==="object"&&value.subtype==="null"&&value.value===null){return null;
}need(value.type==="object"&&value.subtype===undefined&&value.objectId!==undefined&&value.value===undefined);
return value.objectId;
}
/** Select own data without invoking an accessor or inspecting its value. */
function field(rows:ReadonlyMap<string,Property>,name:string):Remote{const row=rows.get(name);
need(row?.value!==undefined&&row.get===undefined&&row.set===undefined);
return row.value;
}
function props(objectId:string):Command{return validate({phase:"wire-transition-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
}
function call(role:CallRole,receiver:string,refs:readonly string[]):Command{const row=CALLS[role];
need(refs.length===row.refs);
return validate({phase:"wire-transition-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue}});
}
function frame(role:keyof typeof FRAMES,callFrameId:string):Command{return validate({phase:"wire-transition-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId,expression:FRAMES[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});
}
/** Keep one real command identity through reservation and parsing. A copied
 * command, initial null, malformed reply or exhausted budget cannot advance. */
class Cursor<T>{readonly #plan:Generator<Command,T,unknown>;
readonly #maximum:number;
#pending:Command|null=null;
#reserved=false;
#failed=false;
#reads=0;
#result:T|null=null;
readonly #packets:unknown[]=[];

 public constructor(plan:Generator<Command,T,unknown>,maximum:number){this.#plan=plan;
this.#maximum=maximum;
}
 /** Return the retained next command until the owner reserves that identity. */
 public next():Command|null{need(!this.#failed&&!this.#reserved);
if(this.#pending!==null){return this.#pending;
}if(this.#result!==null){return null;
}try{const row=this.#plan.next();
need(row.done!==true);
this.#pending=row.value;
return row.value;
}catch(error){this.#failed=true;
throw error;
}}
 /** Reserve exactly one original pending command before any request is issued. */
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending!==null&&command===this.#pending&&this.#reads<this.#maximum);
this.#reserved=true;
this.#reads+=1;
}
 /** Correlate the original reply with the reserved command and advance once. */
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending!==null&&command===this.#pending);
try{const value=capture(raw).value;
this.#packets.push(value);
const row=this.#plan.next(value);
this.#pending=null;
this.#reserved=false;
if(row.done===true){this.#result=row.value;
}else{this.#pending=row.value;
}}catch(error){this.#failed=true;
throw error;
}}
 /** Return comparison data only after the finite plan has consumed every reply. */
 public requireCompleted():T{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);
return this.#result;
}
 /** Retain supplied replies for their original owner without creating authority. */
 public retainedReplies():readonly unknown[]{need(this.#result!==null&&!this.#failed);
return Object.freeze([...this.#packets]);
}
 /** Permanently close this reader after its retaining owner reports failure. */
 public fail():void{this.#failed=true;
}
}
export interface CurrentSchematicWireTransitionMetadataData{readonly schema:"private.schematic-wire-transition-metadata-data.v1";
readonly roots:string;
readonly functions:Readonly<Record<Role,string>>;
readonly sourceFunctions:22;
readonly suppliedObservationsOnly:true;
readonly actualHeldEntriesJoined:false;
readonly historyComplete:false;
readonly bboxFrontierComplete:false;
readonly derivedMarkersComplete:false;
readonly executionAuthorized:false;
readonly saveAuthorized:false}
/** Qualify source functions through bounded ordinary descriptor and scope paths. */
export class CurrentSchematicWireTransitionMetadataCursor extends Cursor<CurrentSchematicWireTransitionMetadataData>{
 /** Original Core supplies the already qualified holder/native selectors and
  * script variant. Construction itself establishes no source or ownership. */
 public constructor(holder:string,native:string,scriptId:string,variant:0|1){handle.parse(holder);
handle.parse(native);
handle.parse(scriptId);
need((variant===0||variant===1)&&!Object.is(variant,-0));
super(CurrentSchematicWireTransitionMetadataCursor.collect(holder,native,scriptId,variant),LIMIT.metadataMaximum);
Object.freeze(this);
}
 private static *collect(holder:string,native:string,scriptId:string,variant:0|1):Generator<Command,CurrentSchematicWireTransitionMetadataData,unknown>{const roots=tuple(yield call("roots",holder,[native]),6);
const values=array(yield props(roots),6);
const ids=Array.from({length:6},(_,i)=>object(values.get(String(i)),"object"));
const packets:unknown[]=[];
const maps:ReadonlyMap<string,Property>[]=[];
for(const id of ids){const raw:unknown=yield props(id);
packets.push(raw);
maps.push(properties(raw));
}const root=(i:number):ReadonlyMap<string,Property>=>{const row=maps[i];
need(row!==undefined);
return row;
};
const refs:Partial<Record<Role,string>>={};

  const qualifyFn=function* qualifyFn(role:Role,value:Remote):Generator<Command,FunctionData,unknown>{const id=object(value,"function");
const data=qualify(yield props(id),value,variant,role,scriptId);
refs[role]=id;
return data;
};

  const walk=function* walk(index:number,name:string):Generator<Command,Remote,unknown>{let raw=packets[index];
need(raw!==undefined);
for(let depth=0;
depth<LIMIT.prototypeLimit;
depth+=1){const next=parent(raw);
need(next!==null);
raw=yield props(next);
const rows=properties(raw);
const value=rows.get(name)?.value;
if(value!==undefined){return value;
}need(!rows.has(name));
}throw new Error("SCHEMATIC_WIRE_TRANSITION_PROTOTYPE_BOUND");
};

  yield* qualifyFn("pointsGet",field(root(4),"get"));
yield* qualifyFn("pointsSet",field(root(4),"set"));
yield* qualifyFn("setLines",field(root(5),"fn"));
const record=yield*qualifyFn("modifyRecord",field(root(0),"record"));
yield*qualifyFn("modifyView",field(root(0),"onModelAttributeChange"));
yield*qualifyFn("bboxAttribute",field(root(1),"onModelAttributeChange"));
yield*qualifyFn("bboxAdd",field(root(1),"add"));
yield*qualifyFn("bboxTryParent",field(root(1),"_tryAddParent"));
const coreId=object(field(root(1),"_addCoreMethods"),"object");
const core=properties(yield props(coreId));
yield*qualifyFn("bboxCommon",field(core,"forCommon"));
yield*qualifyFn("bboxUpdating",field(core,"forUpdating"));
yield*qualifyFn("bboxUpdate",yield*walk(1,"update"));
yield*qualifyFn("attrWatcher",field(root(2),"onModelAttributeChange"));
yield*qualifyFn("historyAttribute",field(root(3),"onModelAttributeChange"));
yield*qualifyFn("historyTryGroup",field(root(3),"_tryHandleGroupModelCommand"));
const group=yield*qualifyFn("historyGroup",yield*walk(3,"getGroupModelHistoryCommand"));

  const scopes=function* scopes(scopesId:string,role:"scopeAst"|"scopeGroupMain"|"scopeGroupEditor"):Generator<Command,Remote,unknown>{const raw:unknown=yield props(scopesId);
const scopePacket=z.strictObject({result:z.array(z.unknown()).max(LIMIT.scopeLimit)}).parse(raw);
const rows=properties({...scopePacket,internalProperties:[]});
need(rows.size > 0&&rows.size<=LIMIT.scopeLimit);
for(let i=0;
i<rows.size;
i+=1){const value=field(rows,String(i));
need(value.type==="object"&&value.subtype==="internal#scope"&&value.objectId!==undefined&&typeof value.description==="string");
const out=z.strictObject({result:z.looseObject({type:z.enum(["object","function","undefined","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),objectId:handle.optional(),description:z.string().optional(),className:z.string().optional(),value:z.unknown().optional()})}).parse(yield call(role,value.objectId,[native]));
if(out.result.type==="function"){return out.result;
}need(out.result.type==="undefined"&&out.result.value===undefined&&out.result.objectId===undefined);
}throw new Error("SCHEMATIC_WIRE_TRANSITION_SCOPE_BOUND");
};

  yield*qualifyFn("modifyAst",yield*scopes(record.scopes,"scopeAst"));
const ctor=yield*qualifyFn("historyGroupClass",yield*scopes(group.scopes,variant===0?"scopeGroupMain":"scopeGroupEditor"));
const base=yield*qualifyFn("historyBaseClass",ctor.parent);
need(ctor.prototype!==null&&base.prototype!==null);
const prototype=properties(yield props(ctor.prototype));
const parentPrototype=properties(yield props(base.prototype));
yield*qualifyFn("historyInitOldData",field(prototype,"initOldData"));
yield*qualifyFn("historyGroupData",field(prototype,"getData"));
yield*qualifyFn("historyGroupUpdate",field(prototype,"update"));
yield*qualifyFn("historyBaseData",field(parentPrototype,"getData"));
need(Object.keys(refs).length===22);
const complete=z.record(z.enum(ROLES),handle).parse(refs);
return Object.freeze({schema:"private.schematic-wire-transition-metadata-data.v1",roots,functions:Object.freeze(complete),sourceFunctions:22,suppliedObservationsOnly:true,actualHeldEntriesJoined:false,historyComplete:false,bboxFrontierComplete:false,derivedMarkersComplete:false,executionAuthorized:false,saveAuthorized:false});

 }
}
export interface CurrentSchematicWireSetterData{readonly schema:"private.schematic-wire-setter-operands-data.v1";
readonly frame:string;
readonly tuple:string;
readonly setterOperandsCompared:true;
readonly suppliedObservationsOnly:true;
readonly executionAuthorized:false;
readonly historyVerified:false;
readonly bboxVerified:false;
readonly saveAuthorized:false}
/** Compare operands at the original held points setter before its assignment. */
export class CurrentSchematicWireSetterCursor extends Cursor<CurrentSchematicWireSetterData>{public constructor(heldFrame:string,holder:string,native:string,first:string,second:string){for(const id of[heldFrame,holder,native,first,second]){handle.parse(id);
}super(CurrentSchematicWireSetterCursor.collect(heldFrame,holder,native,first,second),LIMIT.setter);
Object.freeze(this);
}
 private static *collect(id:string,holder:string,native:string,first:string,second:string):Generator<Command,CurrentSchematicWireSetterData,unknown>{const f=tuple(yield frame("setter",id),2);
const fields=array(yield props(f),2);
const line=object(fields.get("0"),"object");
const points=object(fields.get("1"),"object");
properties(yield props(line));
const values=array(yield props(points),2);
for(const i of[0,1]){object(values.get(String(i)),"object");
}const out=tuple(yield call("setter",f,[native,holder,first,second]),4);
const captured=array(yield props(out),4);
for(let i=0;
i<4;
i+=1){object(captured.get(String(i)),"object");
}return Object.freeze({schema:"private.schematic-wire-setter-operands-data.v1",frame:f,tuple:out,setterOperandsCompared:true,suppliedObservationsOnly:true,executionAuthorized:false,historyVerified:false,bboxVerified:false,saveAuthorized:false});
}}
export interface CurrentSchematicWireRecordData{readonly schema:"private.schematic-wire-record-operands-data.v1";
readonly frame:string;
readonly recordArgument:string;
readonly recordOperandsCompared:true;
readonly suppliedObservationsOnly:true;
readonly executionAuthorized:false;
readonly historyVerified:false;
readonly bboxVerified:false;
readonly saveAuthorized:false}
/** Compare the original record entry after assignment and before its AST call. */
export class CurrentSchematicWireRecordCursor extends Cursor<CurrentSchematicWireRecordData>{public constructor(heldFrame:string,holder:string,native:string,setter:string,ast:string,scriptId:string,variant:0|1){for(const id of[heldFrame,holder,native,setter,ast,scriptId]){handle.parse(id);
}need((variant===0||variant===1)&&!Object.is(variant,-0));
super(CurrentSchematicWireRecordCursor.collect(heldFrame,holder,native,setter,ast,scriptId,variant),LIMIT.record);
Object.freeze(this);
}
 private static *collect(id:string,holder:string,native:string,setter:string,ast:string,scriptId:string,variant:0|1):Generator<Command,CurrentSchematicWireRecordData,unknown>{const f=tuple(yield frame("record",id),3);
const fields=array(yield props(f),3);
const event=object(fields.get("0"),"object");
const actual=fields.get("1");
object(fields.get("2"),"object");
const eventFields=properties(yield props(event));
const modelId=object(field(eventFields,"model"),"object");
properties(yield props(modelId));
need(actual!==undefined);
qualify(yield props(object(actual,"function")),actual,variant,"modifyAst",scriptId);
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
truth.parse(yield call("record",f,[native,holder,setter,ast]));
return Object.freeze({schema:"private.schematic-wire-record-operands-data.v1",frame:f,recordArgument:event,recordOperandsCompared:true,suppliedObservationsOnly:true,executionAuthorized:false,historyVerified:false,bboxVerified:false,saveAuthorized:false});
}}
