/** Descriptor-only snapshot for the independently born cold UI generation.
 * It invokes neither GET nor a manager lookup. The retained originals are
 * checked again at the actual worker handler and getData entry holds. */
import {types} from "node:util";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {currentFootprintInverseGetCallable as callable,qualifyCurrentFootprintInverseGetFunction as metadata} from "./current-footprint-inverse-get-source.ts";
import {currentFootprintInverseNativeDeleteColdGetTargetSchema as targetSchema} from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdGetTarget as Target} from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,currentFootprintInverseNativeDeleteColdUiCallSpec as spec,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";

type Role="tombstoneProject"|"tombstoneFootprint"|"tombstoneMethods"|"tombstoneSnapshot"|"tombstoneReprove";
interface Bindings{
 readonly originalProject:string;readonly reflection:string;readonly source:string;readonly scriptId:string;readonly target:Target;
 readonly current:()=>void;readonly assertOriginalExit:()=>void;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteColdUiTombstone{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-tombstone.v1";
 readonly project:string;readonly footprint:string;readonly proof:string;readonly getData:string;
 readonly targetUuid:string;readonly maximumTicket:number;readonly applicationMethodInvoked:false;readonly executionAuthorized:false;
}
const originals=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiTombstone,CurrentFootprintInverseNativeDeleteColdUiTombstoneCollector>();
const collectors=new WeakSet<object>();
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_TOMBSTONE_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_TOMBSTONE");}}
export class CurrentFootprintInverseNativeDeleteColdUiTombstoneCollector{
 readonly #b:Bindings;readonly #pending:Promise<unknown>[]=[];
 #normal=0;#helpers=0;#started:Promise<CurrentFootprintInverseNativeDeleteColdUiTombstone>|null=null;
 #data:CurrentFootprintInverseNativeDeleteColdUiTombstone|null=null;#end:Promise<void>|null=null;#ended=false;
 #failed=false;#cause:unknown;
 public constructor(bindings:Bindings){this.#b=Object.freeze({...bindings,target:Object.freeze(targetSchema.parse(bindings.target))});collectors.add(this);Object.freeze(this);}
 #current():void{if(this.#failed){throw this.#cause;}need(!this.#ended);this.#b.current();}
 #keep<T>(pending:Promise<T>):Promise<T>{need(types.isPromise(pending));this.#pending.push(pending);void(async():Promise<void>=>{try{await pending;}catch{
 // The retained original Promise keeps its exact rejection.
 }})();return pending;}
 async #send(input:Command):Promise<unknown>{
  this.#current();need(this.#normal<11);const command=validate(input);this.#normal+=1;this.#current();
  const raw=await this.#keep(this.#b.request(command));this.#current();
  if(command.method==="Runtime.callFunctionOn"){need(this.#helpers<5);this.#helpers+=1;this.#current();await this.#keep(this.#b.qualifyHelper(command));this.#current();}return raw;
 }
 #properties(objectId:string):Promise<unknown>{return this.#send({phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 #call(role:Role,refs:readonly string[]):Promise<unknown>{
  const fixed=spec(role);const args:unknown[]=refs.map(objectId=>({objectId}));if(fixed.target){args.push({value:this.#b.target});}
  return this.#send(validate({phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.reflection,functionDeclaration:fixed.program,arguments:args,returnByValue:fixed.byValue}}));
 }
 async #tuple(role:Role,refs:readonly string[],size:number):Promise<Readonly<{id:string;values:ReturnType<typeof array>}>>{
  const id=result(await this.#call(role,refs),size);const values=array(await this.#properties(id),size);return Object.freeze({id,values});
 }
 public start():Promise<CurrentFootprintInverseNativeDeleteColdUiTombstone>{
  if(this.#started!==null){return this.#started;}const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<CurrentFootprintInverseNativeDeleteColdUiTombstone>=>{await gate.promise;try{
   this.#current();const project=await this.#tuple("tombstoneProject",[this.#b.originalProject],1);const selected=project.values[0];need(selected!==undefined);const footprint=object(selected);
   const manager=await this.#tuple("tombstoneFootprint",[footprint],2);const parent=manager.values[0];const rows=manager.values[1];need(parent!==undefined&&rows!==undefined);
   const methods=await this.#tuple("tombstoneMethods",[this.#b.originalProject,footprint,object(parent),object(rows)],3);const entry=methods.values[2];need(entry!==undefined);object(entry);
   let getData:string|null=null;
   for(const[index,role]of [[0,"get"],[1,"getData"]]as const){const fn=methods.values[index];need(fn!==undefined);const ref=callable({result:fn},role);metadata(await this.#properties(ref),role,this.#b.scriptId,this.#b.source);if(role==="getData"){getData=ref;}}
   const proof=await this.#tuple("tombstoneSnapshot",[this.#b.originalProject,footprint,object(parent),object(rows),methods.id],5);
   truth(await this.#call("tombstoneReprove",[proof.id]));this.#current();need(getData!==null&&this.#normal===11&&this.#helpers===5);
   const data:CurrentFootprintInverseNativeDeleteColdUiTombstone=Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-tombstone.v1",project:this.#b.originalProject,footprint,proof:proof.id,getData,targetUuid:this.#b.target.targetUuid,maximumTicket:this.#b.target.maximumTicket,applicationMethodInvoked:false,executionAuthorized:false});
   this.#data=data;originals.set(data,this);return data;
  }catch(error){this.#failed=true;this.#cause=error;throw error;}})();this.#started=pending;void(async():Promise<void>=>{try{await pending;}catch{
 // The retained original Promise keeps its exact rejection.
 }})();gate.resolve(null);return pending;
 }
 public requireOriginal(data:CurrentFootprintInverseNativeDeleteColdUiTombstone):void{this.#current();need(this.#data===data&&originals.get(data)===this);}
 public settleAfterOriginalExit():Promise<void>{
  this.#b.assertOriginalExit();if(this.#end!==null){return this.#end;}this.#ended=true;
  const pending=(async():Promise<void>=>{await Promise.allSettled([this.#started,...this.#pending]);this.#b.assertOriginalExit();})();this.#end=pending;return pending;
 }
}
Object.freeze(CurrentFootprintInverseNativeDeleteColdUiTombstoneCollector.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteColdUiTombstoneCollector);
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiTombstone(data:CurrentFootprintInverseNativeDeleteColdUiTombstone):void{
 need(data!==null&&typeof data==="object"&&!types.isProxy(data));const original=originals.get(data);need(original!==undefined&&collectors.has(original));original.requireOriginal(data);
}
