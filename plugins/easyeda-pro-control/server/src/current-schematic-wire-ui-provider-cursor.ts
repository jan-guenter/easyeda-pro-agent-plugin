/** Original captured UI providers are qualified while Modify remains closed. */
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentSchematicRelevanceRawHandle as object}from"./current-schematic-relevance-action-raw-replies.ts";
import {requireCurrentSchematicWireServiceInvocationRoot as requireRoot}from"./current-schematic-wire-service-invocation-root.ts";
import type {CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";
import {decodeCurrentSchematicWireClassicRpcFunction as classic}from"./current-schematic-wire-classic-rpc-source.ts";
import {decodeCurrentSchematicWireServiceFunction as service}from"./current-schematic-wire-service-source.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_REQUESTS as LIMIT,validateCurrentSchematicWireUiProviderCommand as validate}from"./current-schematic-wire-ui-provider-protocol.ts";
import type {CurrentSchematicWireUiProviderCommand as Command}from"./current-schematic-wire-ui-provider-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const scopeValue=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.string().optional(),description:z.string().optional(),objectId:handle});
const scopeField=z.strictObject({name:z.string(),value:scopeValue,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true)});
const scopeList=z.strictObject({result:z.array(scopeField).min(1).max(LIMIT.scopeLimit),internalProperties:z.array(z.never()).length(0).optional()});
const selected=z.strictObject({result:z.object({type:z.enum(["undefined","function","object","boolean"]),objectId:handle.optional(),subtype:z.string().optional(),value:z.unknown().optional(),className:z.string().optional(),description:z.string().max(4096).optional()})});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const text=z.strictObject({type:z.literal("string"),value:z.string().min(1).max(8192)});
const nativeFunction=z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function trim() { [native code] }"),objectId:handle});
const nativeField=z.strictObject({name:z.enum(["name","length"]),value:z.unknown(),writable:z.literal(false),configurable:z.literal(true),enumerable:z.literal(false),isOwn:z.literal(true)});
const nativeInternal=z.strictObject({name:z.enum(["[[Prototype]]","[[Scopes]]"]),value:z.unknown()});
const nativeMetadata=z.strictObject({result:z.array(nativeField).length(2),internalProperties:z.array(nativeInternal).length(2)});
export interface CurrentSchematicWireUiProviderData{
 readonly schema:"private.schematic-wire-ui-provider.v1";readonly registry:string;readonly locale:string;readonly translation:string;
 readonly originalCapturedProjectRegistryCompared:true;readonly originalExistingToolAndMapCompared:true;
 readonly originalClosingGetterSourceCompared:true;readonly originalClosingDataFalseCompared:true;
 readonly originalCapturedLocaleAndCurrCompared:true;readonly firstOwnDictionaryHitCompared:true;readonly brandingFalseCompared:true;
 readonly originalNativeTrimShapeCompared:true;readonly capturedBeforeModify:true;
 readonly suppliedObservationsOnly:true;readonly originalNativeOwnerJoined:false;readonly nativeGlobalsQualified:false;
 readonly titleHelperRuntimeQualified:false;readonly serviceDeliveryJoined:false;readonly mutationAuthorized:false;readonly saveAuthorized:false;
}
interface Stored{readonly root:CurrentSchematicWireServiceInvocationRoot;readonly registry:string;readonly locale:string;readonly translation:string;readonly localeName:string}
const issued=new WeakMap<CurrentSchematicWireUiProviderData,Stored>();const spent=new WeakSet<CurrentSchematicWireUiProviderData>();
/** A future original event owner may consume this exact before-Modify tuple
 * once. Source data does not authenticate its eventual transport or native Job. */
export function consumeCurrentSchematicWireUiProviderData(data:CurrentSchematicWireUiProviderData,root:CurrentSchematicWireServiceInvocationRoot):Readonly<Stored>{
 const original=issued.get(data);need(original!==undefined&&original.root===root&&!spent.has(data));requireRoot(root);spent.add(data);return original;
}
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_UI_PROVIDER_CURSOR");}}
function props(objectId:string):Command{return validate({phase:"wire-ui-provider-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
function call(role:keyof typeof CALLS,receiver:string,refs:readonly string[]):Command{
 const row=CALLS[role];need(refs.length===row.refs);return validate({phase:"wire-ui-provider-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.byValue,awaitPromise:false,userGesture:false}});
}
function nativeTrim(input:unknown,actual:unknown):void{
 nativeFunction.parse(actual);const packet=nativeMetadata.parse(input);const fields=new Map(packet.result.map(row=>[row.name,row.value]));need(fields.size===2);
 z.strictObject({type:z.literal("number"),value:z.literal(0),description:z.literal("0")}).parse(fields.get("length"));
 z.strictObject({type:z.literal("string"),value:z.literal("trim")}).parse(fields.get("name"));
 const internals=new Map(packet.internalProperties.map(row=>[row.name,row.value]));need(internals.size===2);
 z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function () { [native code] }"),objectId:handle}).parse(internals.get("[[Prototype]]"));
 z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scopeList"),className:z.literal("Array"),description:z.literal("Scopes[0]"),objectId:handle}).parse(internals.get("[[Scopes]]"));
}
type ScopeRole="scopeW"|"scopeLookup"|"scopeLocale"|"scopeBrand"|"scopeRegistry"|"scopeClass";
function* binding(native:string,scopes:string,role:ScopeRole,kind:"object"|"function"|"boolean",cache:Map<string,z.infer<typeof scopeList>>,observations:Map<string,unknown>,registryW?:string):Generator<Command,string|null,unknown>{
 let list=cache.get(scopes);if(list===undefined){list=scopeList.parse(yield props(scopes));cache.set(scopes,list);}let found:string|null=null;let seen=false;
 for(const[index,scope]of list.result.entries()){
  need(scope.name===String(index));const refs=[native];if(role==="scopeRegistry"){need(registryW!==undefined);refs.push(registryW);}const raw=selected.parse(yield call(role,scope.value.objectId,refs)).result;
  if(raw.type==="undefined"){need(raw.objectId===undefined);}else{
  need(!seen&&raw.type===kind&&raw.subtype===undefined);seen=true;
  if(kind==="boolean"){need(raw.value===false&&raw.objectId===undefined);}else{need(raw.objectId!==undefined);found=raw.objectId;observations.set(raw.objectId,raw);}}
 }
 need(seen);return found;
}
function* objectBinding(native:string,scopes:string,role:ScopeRole,kind:"object"|"function",cache:Map<string,z.infer<typeof scopeList>>,observations:Map<string,unknown>,registryW?:string):Generator<Command,string,unknown>{const value=yield* binding(native,scopes,role,kind,cache,observations,registryW);need(value!==null);return value;}
export class CurrentSchematicWireUiProviderCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireUiProviderData,unknown>;
 #pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireUiProviderData|null=null;readonly #raw:unknown[]=[];
 public constructor(root:CurrentSchematicWireServiceInvocationRoot){requireRoot(root);this.#plan=CurrentSchematicWireUiProviderCursor.collect(root);Object.freeze(this);}
 private static *collect(root:CurrentSchematicWireServiceInvocationRoot):Generator<Command,CurrentSchematicWireUiProviderData,unknown>{
  const original=requireRoot(root);const {holder,native,uiScriptId}=original.input;const reg=root.registrations;const cache=new Map<string,z.infer<typeof scopeList>>();const observations=new Map<string,unknown>();
  const targets=array(yield props(reg.targets),3);const closing=targets.get("0"),language=targets.get("1");
  const closingMeta=classic(yield props(object(closing,"function")),closing,2,"uiClosing",uiScriptId);
  const languageMeta=classic(yield props(object(language,"function")),language,2,"uiLocale_i18n",uiScriptId);
  const w=yield* objectBinding(native,closingMeta.scopes,"scopeW","object",cache,observations);
  const lookup=yield* objectBinding(native,closingMeta.scopes,"scopeLookup","function",cache,observations);
  const de=yield* objectBinding(native,languageMeta.scopes,"scopeLocale","object",cache,observations);yield* binding(native,languageMeta.scopes,"scopeBrand","boolean",cache,observations);
  const lookupMeta=service(yield props(lookup),observations.get(lookup),2,"registryLookup",uiScriptId);
  const factory=yield* objectBinding(native,lookupMeta.scopes,"scopeRegistry","function",cache,observations,w);
  const registry=tuple(yield call("registry",w,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,lookup,factory]),13);const registryFields=array(yield props(registry),13);
  const staticFn=registryFields.get("5");const staticMeta=service(yield props(object(staticFn,"function")),staticFn,2,"registryGetInstance",uiScriptId);
  const actualClass=yield* objectBinding(native,staticMeta.scopes,"scopeClass","function",cache,observations);
  const get=registryFields.get("9");const closingGetter=registryFields.get("11");
  service(yield props(object(get,"function")),get,2,"registryGet",uiScriptId);
  classic(yield props(object(closingGetter,"function")),closingGetter,2,"uiClosingGetter",uiScriptId);
  const locale=tuple(yield call("locale",de,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,object(language,"function")]),10);const localeFields=array(yield props(locale),10);
  const curr=localeFields.get("1"),getValue=localeFields.get("2"),trim=localeFields.get("9");
  service(yield props(object(curr,"function")),curr,2,"localeCurr",uiScriptId);classic(yield props(object(getValue,"function")),getValue,2,"uiLocale__getValue",uiScriptId);
  nativeTrim(yield props(object(trim,"function")),trim);const translation=text.parse(localeFields.get("7")).value;
  truth.parse(yield call("complete",holder,[native,holder,reg.root,reg.senderMethodsA,reg.senderMethodsB,registry,locale,lookup,factory,actualClass]));requireRoot(root);
  const data:CurrentSchematicWireUiProviderData=Object.freeze({schema:"private.schematic-wire-ui-provider.v1",registry,locale,translation,originalCapturedProjectRegistryCompared:true,originalExistingToolAndMapCompared:true,originalClosingGetterSourceCompared:true,originalClosingDataFalseCompared:true,originalCapturedLocaleAndCurrCompared:true,firstOwnDictionaryHitCompared:true,brandingFalseCompared:true,originalNativeTrimShapeCompared:true,capturedBeforeModify:true,suppliedObservationsOnly:true,originalNativeOwnerJoined:false,nativeGlobalsQualified:false,titleHelperRuntimeQualified:false,serviceDeliveryJoined:false,mutationAuthorized:false,saveAuthorized:false});
  const localeName=z.strictObject({type:z.literal("string"),value:z.string().min(1).max(64)}).parse(localeFields.get("6")).value;issued.set(data,Object.freeze({root,registry,locale,translation,localeName}));return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const row=this.#plan.next();need(row.done!==true);this.#pending=row.value;return row.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending===command&&this.#reads<LIMIT.ordinary);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{this.#raw.push(raw);const row=this.#plan.next(capture(raw).value);this.#reserved=false;this.#pending=null;if(row.done===true){this.#result=row.value;}else{this.#pending=row.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireUiProviderData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#raw]);}
 public fail():void{this.#failed=true;}
}
Object.freeze(CurrentSchematicWireUiProviderCursor.prototype);Object.freeze(CurrentSchematicWireUiProviderCursor);
