/** Descriptor-only native collateral and Storage continuity. An equal-shaped
 * receipt grants neither original ownership nor any mutation continuation. */
import {types} from "node:util";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_REQUESTS as R,validateCurrentFootprintInverseNativeDeleteCollateralCommand as validate} from "./current-footprint-inverse-native-delete-collateral-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteCollateralCommand as Command} from "./current-footprint-inverse-native-delete-collateral-protocol.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {requireCurrentFootprintInverseDeleteUiClassDescription as classDescription} from "./current-footprint-inverse-delete-ui-source.ts";
import {qualifyCurrentFootprintInverseDeleteCollateralClass as classMetadata} from "./current-footprint-inverse-delete-collateral-replies.ts";
import {captureCurrentFootprintInversePreferenceReply as capture,decodeCurrentFootprintInversePreferenceCensus as census,currentFootprintInversePreferenceCount as count,qualifyCurrentFootprintInversePreferenceNative as native} from "./current-footprint-inverse-public-preferences-replies.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";
import {z} from "zod";

interface Bindings{
 readonly receipt:string;readonly uiScope:string;readonly sender:string;readonly uiScriptId:string;
 readonly current:()=>void;readonly assertBefore:()=>void;readonly assertAfter:()=>void;
 /** For each Runtime.callFunctionOn, retain its original helper scriptParsed,
  * issue Debugger.getScriptSource and qualify that exact fixed program before
  * resolving. The next call or property census must never precede this join.
  * Core supplies this helper transport; the collector counts normal reads only. */
 readonly request:(command:Command)=>Promise<unknown>;readonly assertOriginalExit:()=>void;
}
interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
export interface CurrentFootprintInverseNativeDeleteCollateralPrepared{
 readonly profile:"private.current-footprint-inverse-native-delete-collateral-prepared.v1";
 readonly tabProof:string;readonly storageProof:string;readonly storage:string;readonly tabId:string;
 readonly containers:number;readonly presentContainers:number;readonly tabs:number;readonly properties:number;
 readonly targetTabAbsent:true;readonly storageKeys:number;readonly storagePeerSha256:string;
 readonly publicTabCloseObserved:false;readonly publicPreferenceRemovalObserved:false;readonly restorationAuthorized:false;readonly deleteAuthorized:false;
}
export interface CurrentFootprintInverseNativeDeleteCollateralResult{
 readonly profile:"private.current-footprint-inverse-native-delete-collateral-result.v1";
 readonly targetTabStillAbsent:true;readonly originalTabDescriptorsUnchanged:true;readonly originalStorageUnchanged:true;
 readonly publicCollateralExecuted:false;readonly preferenceRemovalObserved:false;readonly restorationAuthorized:false;readonly savedAbsenceVerified:false;
}
const originals=new WeakSet<object>();
function need(value:boolean):asserts value{
if(!value){
throw new Error("INVERSE_NATIVE_DELETE_COLLATERAL_CUSTODY");
}
}
/** Retain the same private descriptors, opaque guards and original requests
 * across both observation rounds. Neither round invokes an application body. */
export class CurrentFootprintInverseNativeDeleteCollateralCollector{
 readonly #b:Bindings;#round:"before"|"after"="before";#failed=false;#calls=0;#properties=0;
 #pending:Promise<CurrentFootprintInverseNativeDeleteCollateralPrepared>|null=null;
 #finishing:Promise<CurrentFootprintInverseNativeDeleteCollateralResult>|null=null;
 #prepared:CurrentFootprintInverseNativeDeleteCollateralPrepared|null=null;#result:CurrentFootprintInverseNativeDeleteCollateralResult|null=null;
 #originalStorage:ReturnType<typeof census>|null=null;
 /** Capture only the original owner's retained closures and handles. */
 public constructor(bindings:Bindings){
this.#b=Object.freeze({...bindings});
originals.add(this);
}
 /** Reprove the selected original round before and after every awaited read. */
 #current():void{
try{
this.#b.current();
need(!this.#failed);
if(this.#round==="before"){
this.#b.assertBefore();
}
else{
this.#b.assertAfter();
}
}
catch(caughtError){
this.#failed=true;
throw caughtError;
}
}
 /** Spend a fixed normal slot before issuing the original readonly request. */
 async #send(input:Command):Promise<unknown>{
this.#current();
const c=validate(input);
need(c.round===this.#round);
if(c.method==="Runtime.callFunctionOn"){
need((this.#calls+=1)<=(this.#round==="before"?R.before.calls:R.after.calls));
}
else if(c.method==="Runtime.getProperties"){
need((this.#properties+=1)<=(this.#round==="before"?R.before.properties:R.after.properties));
}
else{
need(false);
}
const raw=await this.#b.request(c);
this.#current();
return raw;
}
 /** Inspect every newly exposed object before a later helper traverses it. */
 #props(objectId:string,role:"tuple"|"subject"|"storage"="subject"):Promise<unknown>{
return this.#send({round:this.#round,phase:"inverse-native-delete-collateral-properties",role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
}
 /** The finite role table supplies all programs, arities and return modes. */
 #call(role:keyof typeof CALLS,refs:readonly string[]):Promise<unknown>{
const row=CALLS[role];
return this.#send(validate({round:this.#round,phase:"inverse-native-delete-collateral-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.receipt,functionDeclaration:row.program,arguments:refs.map(objectId=>({objectId})),returnByValue:row.value}}));
}
 /** Read one dense tuple and qualify each opaque member without invoking it. */
 async #tuple(role:keyof typeof CALLS,refs:readonly string[],size?:number):Promise<Tuple>{
const raw=await this.#call(role,refs);
let length=size;
if(length===undefined){
const remote=z.strictObject({result:z.looseObject({description:z.string()})}).parse(capture(raw)).result;
const match=/^Array\((0|[1-9]\d?)\)$/u.exec(remote.description);
need(match!==null);
length=Number(match[1]);
need(length<=32);
}
const id=result(raw,length);
const values=array(await this.#props(id,"tuple"),length);
const packets:unknown[]=[];
for(const[index,value]
of values.entries()){
if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){
const isStorage=(role==="storageValue"||role==="storagePrepare")&&index===0;
const packet=await this.#props(object(value),isStorage?"storage":"subject");
if(isStorage){
census(packet);
}
else{
properties(packet);
}
packets.push(packet);
}
else{
packets.push(null);
}
}
return Object.freeze({id,values,packets:Object.freeze(packets)});
}
 /** Start once; a failure retains the same rejected original work Promise. */
 public prepare():Promise<CurrentFootprintInverseNativeDeleteCollateralPrepared>{
if(this.#pending!==null){
return this.#pending;
}
const pending=Promise.withResolvers<CurrentFootprintInverseNativeDeleteCollateralPrepared>();
this.#pending=pending.promise;
void(async():Promise<void>=>{
try{
pending.resolve(await this.#prepare());
}
catch(caughtError){
this.#failed=true;
pending.reject(caughtError);
}
}
)();
return pending.promise;
}
 /** Require the exact original class and native Storage functions before any
 * tab traversal or native getter; compare independent whole-Storage censuses. */
 async #prepare():Promise<CurrentFootprintInverseNativeDeleteCollateralPrepared>{
  this.#current();
const b=this.#b;
const module=await this.#tuple("module",[b.uiScope,b.sender],6);
const bar=module.values[0];
need(bar?.type==="function"&&typeof bar.description==="string");
classDescription(bar.description);
classMetadata(module.packets[0],b.uiScriptId);
  const roots=await this.#tuple("tabRoots",[module.id],2);
const containers=await this.#tuple("tabContainers",[roots.id]);
const lists=await this.#tuple("tabLists",[containers.id]);
const rows=await this.#tuple("tabRows",[lists.id]);
need(containers.values.length>0&&containers.values.length<=8&&lists.values.length===containers.values.length&&rows.values.length<=32);
const present=containers.values.filter(value=>value.subtype!=="null").length;
  const tabs=await this.#tuple("tabPrepare",[module.id,roots.id,containers.id,lists.id,rows.id],2);
const tab=tabs.values[0];
need(tab?.type==="string"&&typeof tab.value==="string"&&/^[a-f\d]{16}(?:[a-f\d]{16})?@[a-f\d]{64}$/u.test(tab.value));
truth(await this.#call("tabReprove",[tabs.id]));
  const storageRoots=await this.#tuple("storageRoots",[],2);
native(storageRoots.packets[0],"constructor");
native(storageRoots.packets[1],"getter");
const members=await this.#tuple("storageMembers",[storageRoots.id],2);
native(members.packets[1],"length");
const storage=await this.#tuple("storageValue",[storageRoots.id,members.id],1);
const first=census(storage.packets[0]);
  const prepared=await this.#tuple("storagePrepare",[storageRoots.id,members.id,storage.id],2);
const second=census(prepared.packets[0]);
const n=count(await this.#call("storageReprove",[prepared.id]));
need(n===first.count&&JSON.stringify(first)===JSON.stringify(second)&&this.#calls===R.before.calls&&this.#properties===24+2*present+rows.values.length);
this.#originalStorage=first;
  const storageValue=storage.values[0];
need(storageValue!==undefined);
const value:CurrentFootprintInverseNativeDeleteCollateralPrepared=Object.freeze({profile:"private.current-footprint-inverse-native-delete-collateral-prepared.v1",tabProof:tabs.id,storageProof:prepared.id,storage:object(storageValue),tabId:tab.value,containers:containers.values.length,presentContainers:present,tabs:rows.values.length,properties:this.#properties,targetTabAbsent:true,storageKeys:n,storagePeerSha256:first.peerSha256,publicTabCloseObserved:false,publicPreferenceRemovalObserved:false,restorationAuthorized:false,deleteAuthorized:false});
this.#prepared=value;
this.#current();
return value;
 }
 /** Equal-shaped data cannot recover the original private guard tuple. */
 public requirePrepared(value:CurrentFootprintInverseNativeDeleteCollateralPrepared):void{
this.#current();
need(this.#prepared===value);
}
 /** Core supplies the genuine original DEL return assertion. This method
 * retains that original closure and never derives completion from JSON. */
 public finish(value:CurrentFootprintInverseNativeDeleteCollateralPrepared):Promise<CurrentFootprintInverseNativeDeleteCollateralResult>{
need(value===this.#prepared&&this.#pending!==null);
if(this.#finishing!==null){
return this.#finishing;
}
this.#b.assertAfter();
this.#round="after";
this.#calls=0;
this.#properties=0;
const pending=Promise.withResolvers<CurrentFootprintInverseNativeDeleteCollateralResult>();
this.#finishing=pending.promise;
void(async():Promise<void>=>{
try{
this.#current();
truth(await this.#call("tabReprove",[value.tabProof]));
const n=count(await this.#call("storageReprove",[value.storageProof]));
const after=census(await this.#props(value.storage,"storage"));
this.#current();
need(this.#originalStorage!==null&&n===value.storageKeys&&JSON.stringify(after)===JSON.stringify(this.#originalStorage)&&this.#calls===2&&this.#properties===1);
const receipt:CurrentFootprintInverseNativeDeleteCollateralResult=Object.freeze({profile:"private.current-footprint-inverse-native-delete-collateral-result.v1",targetTabStillAbsent:true,originalTabDescriptorsUnchanged:true,originalStorageUnchanged:true,publicCollateralExecuted:false,preferenceRemovalObserved:false,restorationAuthorized:false,savedAbsenceVerified:false});
this.#result=receipt;
pending.resolve(receipt);
}
catch(caughtError){
this.#failed=true;
pending.reject(caughtError);
}
}
)();
return pending.promise;
}
 /** Require only this exact completed receipt under the original assertion. */
 public requireOriginalCompletion(value:CurrentFootprintInverseNativeDeleteCollateralResult):void{
this.#current();
need(value===this.#result&&this.#round==="after");
}
 /** Only actual original Job exit can join these already retained requests. */
 public async settleAfterOriginalExit():Promise<void>{
this.#b.assertOriginalExit();
this.#failed=true;
await Promise.allSettled([this.#pending,this.#finishing]);
this.#b.assertOriginalExit();
}
}
const descriptors=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteCollateralCollector.prototype);
/** Refuse copied instances, Proxy traps and changed collector methods. */
export function assertOriginalCurrentFootprintInverseNativeDeleteCollateralCollector(value:CurrentFootprintInverseNativeDeleteCollateralCollector):void{
need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteCollateralCollector.prototype&&Reflect.ownKeys(value).length===0);
const now=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteCollateralCollector.prototype);
need(Reflect.ownKeys(now).length===Reflect.ownKeys(descriptors).length&&Object.entries(descriptors).every(([name,d]):boolean=>{
const actual=now[name];
return actual!==undefined&&actual.value===d.value&&actual.get===d.get&&actual.set===d.set&&actual.writable===d.writable&&actual.configurable===d.configurable&&actual.enumerable===d.enumerable;
}
));
}
