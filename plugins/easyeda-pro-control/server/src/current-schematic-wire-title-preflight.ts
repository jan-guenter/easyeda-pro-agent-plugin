/** Before-Modify title project and transitive helper bindings, issued to one root. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentSchematicRelevanceRawHandle as object}from"./current-schematic-relevance-action-raw-replies.ts";
import{requireCurrentSchematicWireServiceInvocationRoot as requireRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type{CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";
import{requireCurrentSchematicWireTreePreflightData as requireTree}from"./current-schematic-wire-tree-preflight-cursor.ts";
import type{CurrentSchematicWireTreePreflightData}from"./current-schematic-wire-tree-preflight-cursor.ts";
import{decodeCurrentSchematicWireClassicRpcFunction as classic}from"./current-schematic-wire-classic-rpc-source.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as SOURCE,decodeCurrentSchematicWireServiceFunction as service}from"./current-schematic-wire-service-source.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_TITLE_REQUESTS as LIMIT,validateCurrentSchematicWireTitleCommand as validate}from"./current-schematic-wire-title-protocol.ts";
import type{CurrentSchematicWireTitleCommand as Command}from"./current-schematic-wire-title-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const scopeValue=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.string().optional(),description:z.string().optional(),objectId:handle});
const scopeField=z.strictObject({name:z.string(),value:scopeValue,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true)});
const scopeList=z.strictObject({result:z.array(scopeField).min(1).max(LIMIT.scopeLimit),internalProperties:z.array(z.never()).length(0).optional()});
const selected=z.strictObject({result:z.object({type:z.enum(["undefined","function","object","string"]),objectId:handle.optional(),subtype:z.string().optional(),value:z.unknown().optional(),className:z.string().optional(),description:z.string().optional()})});
export interface CurrentSchematicWireTitlePreflightData{readonly schema:"private.schematic-wire-title-preflight.v1";readonly originalTreeProjectAndTitleQueryCompared:true;readonly allTwelveOriginalHelperSourcesAndBindingsCompared:true;readonly threeOriginalSeparatorsCompared:true;readonly oneSheetEmptySymbolBranchSelected:true;readonly capturedBeforeModify:true;readonly suppliedObservationsOnly:true;readonly originalNativeOwnerJoined:false;readonly nativeGlobalsQualified:false;readonly titleHelperRuntimeQualified:false;readonly saveAuthorized:false}
interface Stored{readonly root:CurrentSchematicWireServiceInvocationRoot;readonly tree:CurrentSchematicWireTreePreflightData;readonly before:string;readonly helpers:string;readonly query:string}
const issued=new WeakMap<CurrentSchematicWireTitlePreflightData,Stored>();const spent=new WeakSet<CurrentSchematicWireTitlePreflightData>();
export function consumeCurrentSchematicWireTitlePreflightData(data:CurrentSchematicWireTitlePreflightData,root:CurrentSchematicWireServiceInvocationRoot):Readonly<Stored>{const original=issued.get(data);need(original!==undefined&&original.root===root&&!spent.has(data));requireRoot(root);requireTree(original.tree,root);spent.add(data);return original;}
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TITLE_PREFLIGHT");}}
export function currentSchematicWireTitleProperties(objectId:string):Command{return validate({phase:"wire-title-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
export function currentSchematicWireTitleCall(role:string,receiver:string,refs:readonly string[]):Command{const calls:Readonly<Record<string,Readonly<{program:string;refs:number;byValue:boolean}>>>=CALLS;const row=calls[role];need(row!==undefined&&refs.length===row.refs);return validate({phase:"wire-title-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});}
interface Reads{readonly native:string;readonly scopes:Map<string,z.infer<typeof scopeList>>}
function* binding(reads:Reads,id:string,key:string):Generator<Command,z.infer<typeof selected>["result"],unknown>{
 let scopes=reads.scopes.get(id);if(scopes===undefined){scopes=scopeList.parse(yield currentSchematicWireTitleProperties(id));reads.scopes.set(id,scopes);}let found:z.infer<typeof selected>["result"]|null=null;
 for(const[index,scope]of scopes.result.entries()){need(scope.name===String(index));const candidate=selected.parse(yield currentSchematicWireTitleCall(key,scope.value.objectId,[reads.native])).result;if(candidate.type==="undefined"){need(candidate.objectId===undefined);}else{need(found===null);found=candidate;}}
 need(found!==null);return found;
}
export class CurrentSchematicWireTitlePreflightCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireTitlePreflightData,unknown>;#pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireTitlePreflightData|null=null;readonly #raw:unknown[]=[];
 public constructor(root:CurrentSchematicWireServiceInvocationRoot,tree:CurrentSchematicWireTreePreflightData){requireRoot(root);requireTree(tree,root);this.#plan=CurrentSchematicWireTitlePreflightCursor.collect(root,tree);Object.freeze(this);}
 private static *collect(root:CurrentSchematicWireServiceInvocationRoot,tree:CurrentSchematicWireTreePreflightData):Generator<Command,CurrentSchematicWireTitlePreflightData,unknown>{
  const context=requireRoot(root);const before=requireTree(tree,root);const {holder,native,scriptId,variant}=context.input;const reg=root.registrations;const reads:Reads={native,scopes:new Map()};
  const targetRaw=selected.parse(yield currentSchematicWireTitleCall("seed",holder,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,reg.targets])).result;const target=object(targetRaw,"function");
  const targetMeta=classic(yield currentSchematicWireTitleProperties(target),targetRaw,variant,"titleService",scriptId);
  const queryRaw=yield* binding(reads,targetMeta.scopes,variant===0?"tj":"Cj");const query=object(queryRaw,"function");const queryMeta=classic(yield currentSchematicWireTitleProperties(query),queryRaw,variant,"titleQuery",scriptId);
  const project=object(yield* binding(reads,queryMeta.scopes,"Z"),"object"),types=object(yield* binding(reads,queryMeta.scopes,"Ie"),"object");
  const profiles=SOURCE[variant].rows;const helpers:string[]=[];const helperScopes:string[]=[];const values=new Map<string,z.infer<typeof selected>["result"]>();
  const roles=["helper00","helper01","helper02","helper03","helper04","helper05","helper06","helper07","helper08","helper09","helper10","helper11"]as const;
  for(const role of roles){const row=profiles[role];const raw=yield* binding(reads,queryMeta.scopes,row.binding);const id=object(raw,"function");const metadata=service(yield currentSchematicWireTitleProperties(id),raw,variant,role,scriptId);helpers.push(id);helperScopes.push(metadata.scopes);values.set(row.binding,raw);}
  const literals:Readonly<Record<string,Readonly<{value:string}>>>=SOURCE[variant].literals;for(const[name,row]of Object.entries(literals)){const raw=yield* binding(reads,queryMeta.scopes,name);need(raw.type==="string"&&raw.value===row.value&&raw.objectId===undefined);values.set(name,raw);}
  const projectRaw:z.infer<typeof selected>["result"]={type:"object",objectId:project};const dependencies=variant===0?[[],[],["HTe","eee"],["Z","Hn","Fm"],["Z","V","oi"],["Gc","lc"],["Wy"],["Wy"],["oi","Fm","lc"],["eee","lc"],["VR","uW"],[]]:[[],[],["W2e","Uee"],["Z","Hn","Hg"],["Z","V","oi"],["jc","lc"],["zy"],["zy"],["oi","Hg","lc"],["Uee","lc"],["Mk","Ree"],[]];
  for(const[index,names]of dependencies.entries()){const scope=helperScopes[index];need(scope!==undefined);for(const name of names){const expected=name==="Z"?projectRaw:values.get(name);need(expected!==undefined);const actual=yield* binding(reads,scope,name);need(actual.type===expected.type);if(expected.objectId===undefined){need(actual.objectId===undefined&&Object.is(actual.value,expected.value));}else{need(actual.objectId!==undefined);z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(yield currentSchematicWireTitleCall("same",actual.objectId,[native,expected.objectId]));}}}
  const bundled=tuple(yield currentSchematicWireTitleCall("bundle",holder,[native,...helpers]),12);array(yield currentSchematicWireTitleProperties(bundled),12);
  const snapshot=tuple(yield currentSchematicWireTitleCall("before",holder,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,before.on,project,types,bundled,query]),14);array(yield currentSchematicWireTitleProperties(snapshot),14);requireRoot(root);requireTree(tree,root);
  const data:CurrentSchematicWireTitlePreflightData=Object.freeze({schema:"private.schematic-wire-title-preflight.v1",originalTreeProjectAndTitleQueryCompared:true,allTwelveOriginalHelperSourcesAndBindingsCompared:true,threeOriginalSeparatorsCompared:true,oneSheetEmptySymbolBranchSelected:true,capturedBeforeModify:true,suppliedObservationsOnly:true,originalNativeOwnerJoined:false,nativeGlobalsQualified:false,titleHelperRuntimeQualified:false,saveAuthorized:false});issued.set(data,Object.freeze({root,tree,before:snapshot,helpers:bundled,query}));return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending===command&&this.#reads<LIMIT.preflight);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{this.#raw.push(raw);const row=this.#plan.next(capture(raw).value);this.#reserved=false;this.#pending=null;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireTitlePreflightData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#raw]);}
 public fail():void{this.#failed=true;}
}
Object.freeze(CurrentSchematicWireTitlePreflightCursor.prototype);Object.freeze(CurrentSchematicWireTitlePreflightCursor);
