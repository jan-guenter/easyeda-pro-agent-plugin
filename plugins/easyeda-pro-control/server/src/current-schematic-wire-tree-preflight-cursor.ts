/** Exact source parser scopes select one fresh original Object/Pages child. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentSchematicRelevanceRawHandle as object}from"./current-schematic-relevance-action-raw-replies.ts";
import{requireCurrentSchematicWireServiceInvocationRoot as requireRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type{CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";
import{decodeCurrentSchematicWireCompletionFunction as completion}from"./current-schematic-wire-completion-source.ts";
import{CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as ASYNC,decodeCurrentSchematicWireAsyncFunction as asyncFunction}from"./current-schematic-wire-async-source.ts";
import{CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_REQUESTS as LIMIT,validateCurrentSchematicWireTreePreflightCommand as validate}from"./current-schematic-wire-tree-preflight-protocol.ts";
import type{CurrentSchematicWireTreePreflightCommand as Command}from"./current-schematic-wire-tree-preflight-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const scopeValue=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.string().optional(),description:z.string().optional(),objectId:handle});
const scopeField=z.strictObject({name:z.string(),value:scopeValue,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true)});
const scopeList=z.strictObject({result:z.array(scopeField).min(1).max(LIMIT.scopeLimit),internalProperties:z.array(z.never()).length(0).optional()});
const selected=z.strictObject({result:z.object({type:z.enum(["undefined","function","object","number"]),objectId:handle.optional(),subtype:z.string().optional(),value:z.unknown().optional(),className:z.string().max(256).optional(),description:z.string().max(32_768).optional()})});
const internal=z.strictObject({name:z.literal("[[Prototype]]"),value:z.unknown()});
const ordinary=z.strictObject({result:z.array(z.unknown()).max(256),internalProperties:z.array(internal).length(1)});
const field=z.strictObject({type:z.literal("string"),value:z.enum(["objectTreeManager","pageTreeManager"])});
export interface CurrentSchematicWireTreePreflightData{
 readonly schema:"private.schematic-wire-tree-preflight.v1";readonly ast:string;readonly snapshot:string;readonly serial:string;readonly target:string;readonly on:string;
 readonly role:"objectContent"|"pageContent";readonly originalParserModuleAndHostCompared:true;readonly originalSelectedTreeAndWrapperCompared:true;
 readonly originalNoPendingSerialCallCompared:true;readonly sourceOnNoArgumentBranchSelected:true;readonly capturedBeforeModify:true;
 readonly suppliedObservationsOnly:true;readonly originalNativeOwnerJoined:false;readonly originalWrapperReturnJoined:false;
 readonly selectedTreeHelperBindingsComplete:false;readonly selectedTreeChildJoined:false;readonly serviceDeliveryJoined:false;readonly saveAuthorized:false;
}
interface Stored{readonly root:CurrentSchematicWireServiceInvocationRoot;readonly ast:string;readonly snapshot:string;readonly serial:string;readonly target:string;readonly on:string;readonly role:"objectContent"|"pageContent";readonly wrapper:string;readonly scope:string;readonly ticketScope:string}
const issued=new WeakMap<CurrentSchematicWireTreePreflightData,Stored>();const spent=new WeakSet<CurrentSchematicWireTreePreflightData>();
/** A separate source observer may compare this exact still-live tree prefix. */
export function requireCurrentSchematicWireTreePreflightData(data:CurrentSchematicWireTreePreflightData,root:CurrentSchematicWireServiceInvocationRoot):Readonly<Stored>{
 const original=issued.get(data);need(original!==undefined&&original.root===root);requireRoot(root);return original;
}
export function consumeCurrentSchematicWireTreePreflightData(data:CurrentSchematicWireTreePreflightData,root:CurrentSchematicWireServiceInvocationRoot):Readonly<Stored>{
 const original=issued.get(data);need(original!==undefined&&original.root===root&&!spent.has(data));requireRoot(root);spent.add(data);return original;
}
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TREE_PREFLIGHT_CURSOR");}}
function props(objectId:string):Command{return validate({phase:"wire-tree-preflight-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[]):Command{
 const row=CALLS[role];need(refs.length===row.refs);return validate({phase:"wire-tree-preflight-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});
}
type ScopeRole="scopeHost"|"scopeSheet0"|"scopeSheet1"|"scopeAst"|"scopeInfo"|"scopeTabs"|"scopeOn0"|"scopeOn1"|"scopeProject"|"scopeSameAst";
interface ScopeReads{readonly native:string;readonly cache:Map<string,z.infer<typeof scopeList>>;readonly observations:Map<string,unknown>}
function* scopes(input:ScopeReads,id:string):Generator<Command,z.infer<typeof scopeList>,unknown>{
 let value=input.cache.get(id);if(value===undefined){value=scopeList.parse(yield props(id));for(const[index,row]of value.result.entries()){need(row.name===String(index));}input.cache.set(id,value);}return value;
}
function* binding(input:ScopeReads,id:string,role:ScopeRole,kind:"object"|"function",same?:string):Generator<Command,string,unknown>{
 const list=yield* scopes(input,id);let found:string|null=null;
 for(const row of list.result){
  const refs=[input.native];if(role==="scopeSameAst"){need(same!==undefined);refs.push(same);}
  const candidate=selected.parse(yield call(role,row.value.objectId,refs)).result;
  if(candidate.type==="undefined"){need(candidate.objectId===undefined);}else{need(found===null&&candidate.type===kind&&candidate.subtype===undefined&&candidate.objectId!==undefined);found=candidate.objectId;input.observations.set(found,candidate);}
 }
 need(found!==null);return found;
}
function* ticket(input:ScopeReads,id:string,variant:0|1):Generator<Command,string,unknown>{
 const list=yield* scopes(input,id);let found:string|null=null;
 for(const row of list.result){const candidate=selected.parse(yield call(variant===0?"scopeCounter0":"scopeCounter1",row.value.objectId,[input.native])).result;
  if(candidate.type==="undefined"){need(candidate.objectId===undefined);}else{need(found===null&&candidate.type==="number"&&candidate.objectId===undefined&&candidate.subtype===undefined);z.number().int().min(0).max(9_007_199_254_740_990).parse(candidate.value);found=row.value.objectId;}
 }need(found!==null);return found;
}
function nil(value:unknown):void{z.strictObject({type:z.literal("object"),subtype:z.literal("null"),value:z.null()}).parse(value);}
export class CurrentSchematicWireTreePreflightCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireTreePreflightData,unknown>;
 #pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireTreePreflightData|null=null;readonly #raw:unknown[]=[];
 public constructor(root:CurrentSchematicWireServiceInvocationRoot){requireRoot(root);this.#plan=CurrentSchematicWireTreePreflightCursor.collect(root);Object.freeze(this);}
 private static *collect(root:CurrentSchematicWireServiceInvocationRoot):Generator<Command,CurrentSchematicWireTreePreflightData,unknown>{
  const original=requireRoot(root);const {holder,native,scriptId,variant}=original.input;const reg=root.registrations;
  const reads:ScopeReads={native,cache:new Map(),observations:new Map()};
  const seed=tuple(yield call(variant===0?"seed0":"seed1",holder,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB]),2);const seedFields=array(yield props(seed),2);
  const doc=seedFields.get("0");const docMeta=completion(yield props(object(doc,"function")),doc,variant,"docParse",scriptId);
  const host=yield* binding(reads,docMeta.scopes,"scopeHost","object");const sheet=yield* binding(reads,docMeta.scopes,variant===0?"scopeSheet0":"scopeSheet1","function");
  const sheetMeta=completion(yield props(sheet),reads.observations.get(sheet),variant,"sheetParse",scriptId);
  const ast=yield* binding(reads,sheetMeta.scopes,"scopeAst","object");const info=yield* binding(reads,sheetMeta.scopes,"scopeInfo","object");const tabs=yield* binding(reads,sheetMeta.scopes,"scopeTabs","object");
  for(const objectId of[ast,info,tabs]){ordinary.parse(yield props(objectId));}
  const snapshot=tuple(yield call("ast",ast,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,host,info,tabs]),10);const fields=array(yield props(snapshot),10);
  const role=field.parse(fields.get("2")).value==="objectTreeManager"?"objectContent":"pageContent";
  const tree=object(fields.get("1"),"object");ordinary.parse(yield props(tree));
  const getBatch=fields.get("5"),getEvent=fields.get("6"),passContent=fields.get("7");
  asyncFunction(yield props(object(getBatch,"function")),getBatch,variant,"astGetBatch",scriptId);asyncFunction(yield props(object(getEvent,"function")),getEvent,variant,"astGetEvent",scriptId);
  const passMeta=completion(yield props(object(passContent,"function")),passContent,variant,"astPassContent",scriptId);
  const on=yield* binding(reads,passMeta.scopes,variant===0?"scopeOn0":"scopeOn1","function");const onMeta=asyncFunction(yield props(on),reads.observations.get(on),variant,"astOn",scriptId);
  yield* binding(reads,onMeta.scopes,"scopeSameAst","object",ast);const project=yield* binding(reads,onMeta.scopes,"scopeProject","object");const ticketScope=yield* ticket(reads,onMeta.scopes,variant);ordinary.parse(yield props(project));
  const wrapper=fields.get("3");const wrapperId=object(wrapper,"function");const wrapperMeta=asyncFunction(yield props(wrapperId),wrapper,variant,"serialCall",scriptId);
  const list=yield* scopes(reads,wrapperMeta.scopes);const matches=list.result.filter(row=>row.value.description===`Closure (${ASYNC[variant].rows.serial.name})`);need(matches.length===1);const scope=matches[0]?.value.objectId;need(scope!==undefined);
  const serial=tuple(yield call("serial",scope,[native]),4);const slots=array(yield props(serial),4);nil(slots.get("0"));nil(slots.get("1"));const target=slots.get("3");const targetId=object(target,"function");asyncFunction(yield props(targetId),target,variant,role,scriptId);
  const onSnapshot=tuple(yield call(variant===0?"complete0":"complete1",holder,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,snapshot,project,on,scope,targetId,ticketScope]),4);array(yield props(onSnapshot),4);requireRoot(root);
  const data:CurrentSchematicWireTreePreflightData=Object.freeze({schema:"private.schematic-wire-tree-preflight.v1",ast,snapshot,serial,target:targetId,on:onSnapshot,role,originalParserModuleAndHostCompared:true,originalSelectedTreeAndWrapperCompared:true,originalNoPendingSerialCallCompared:true,sourceOnNoArgumentBranchSelected:true,capturedBeforeModify:true,suppliedObservationsOnly:true,originalNativeOwnerJoined:false,originalWrapperReturnJoined:false,selectedTreeHelperBindingsComplete:false,selectedTreeChildJoined:false,serviceDeliveryJoined:false,saveAuthorized:false});
  issued.set(data,Object.freeze({root,ast,snapshot,serial,target:targetId,on:onSnapshot,role,wrapper:wrapperId,scope,ticketScope}));return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending===command&&this.#reads<LIMIT.ordinary);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{this.#raw.push(raw);const row=this.#plan.next(capture(raw).value);this.#reserved=false;this.#pending=null;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireTreePreflightData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#raw]);}
 public fail():void{this.#failed=true;}
}
Object.freeze(CurrentSchematicWireTreePreflightCursor.prototype);Object.freeze(CurrentSchematicWireTreePreflightCursor);
