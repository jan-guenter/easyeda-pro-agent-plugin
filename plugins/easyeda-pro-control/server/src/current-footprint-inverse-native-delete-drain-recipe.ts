/** Original pre-action primitive-receipt reader. The enclosing Core-issued
 * drain owns its sends/events/helper sources; this class cannot issue origin
 * authority or resume an application frame. */
import{types}from"node:util";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_NATIVE_PROFILES as PROFILES,currentFootprintInverseNativeDeleteDrainJson as jsonMembers}from"./current-footprint-inverse-native-delete-drain-metadata.ts";
import{currentFootprintInverseNativeDeleteDrainCall as call,validateCurrentFootprintInverseNativeDeleteDrainCommand as validate}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainCommand as Command}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as objectAt}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentFootprintInverseLookupNativeCallable as callable}from"./current-footprint-inverse-lookup-native-metadata.ts";
import{decodeCurrentNativeFunctionMetadata}from"./current-native-function-metadata.ts";
import{decodeCurrentGeneratedSyncCallee}from"./current-generated-initial-sync-replies.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_METHODS as METHODS}from"./current-project-save-producer-source.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";

export interface CurrentFootprintInverseNativeDeleteDrainRecipeBindings{
 readonly reflection:string;readonly uploadRecipe:string;readonly scriptId:string;
 readonly current:()=>void;readonly assertOriginalExit:()=>void;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
 readonly fail:(cause:unknown)=>void;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_RECIPE_REQUESTS=Object.freeze({normal:12,helpers:3,cdpRequests:15,resumes:0,helperEvents:3});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_DRAIN_RECIPE_${code}`);}}
export class CurrentFootprintInverseNativeDeleteDrainRecipe{
 readonly #b:CurrentFootprintInverseNativeDeleteDrainRecipeBindings;readonly #requests:Promise<unknown>[]=[];
 #pending:Promise<string>|null=null;#failed=false;#failure:unknown;#ended=false;#helpers=0;#data:string|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteDrainRecipeBindings){this.#b=Object.freeze({...bindings});Object.freeze(this);}
 #current():void{if(this.#failed){throw this.#failure;}this.#b.current();need(!this.#ended,"ENDED");}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;try{this.#b.fail(cause);}catch{
 // Failure handoff cannot replace the retained original cause or strand its join.
 }}}
 async #send(input:Command):Promise<unknown>{this.#current();need(this.#requests.length<15,"REQUEST_BOUND");const c=validate(input),pending=this.#b.request(c);need(types.isPromise(pending),"ORIGINAL_REQUEST");this.#requests.push(pending);const raw=capture(await pending).value;this.#current();if(c.method==="Runtime.callFunctionOn"){need((this.#helpers+=1)<=3,"HELPER_BOUND");const helper=this.#b.qualifyHelper(c);need(types.isPromise(helper),"ORIGINAL_HELPER");this.#requests.push(helper);await helper;this.#current();}return raw;}
 #props(role:Extract<Command,{phase:"inverse-native-delete-drain-properties"}>["role"],objectId:string):Promise<unknown>{return this.#send({phase:"inverse-native-delete-drain-properties",role,slot:0,pass:0,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 public prepare():Promise<string>{
  need(this.#pending===null,"PREPARE_ONCE");const result=Promise.withResolvers<string>();this.#pending=result.promise;
  void(async():Promise<void>=>{try{this.#current();const refs=[this.#b.reflection,this.#b.uploadRecipe];
   const nativeCommand=call("recipe","natives",this.#b.reflection,refs.map(objectId=>({objectId})));
   const nativesId=arrayCapture(await this.#send(nativeCommand),4);
   const natives=array(await this.#props("natives",nativesId),4);const add=objectAt(natives,0),json=objectAt(natives,3),sync=objectAt(natives,2),values=objectAt(natives,1);
   for(const[index,role]of[[0,"add"],[1,"values"]]as const){const profile=PROFILES.find(row=>row.role===role);need(profile!==undefined,"PROFILE");callable(natives.get(String(index)),profile.name);decodeCurrentNativeFunctionMetadata(await this.#props(`native-${role}`,objectAt(natives,index)),profile);this.#current();}
   const site=METHODS.syncCloud;decodeCurrentGeneratedSyncCallee(await this.#props("callee-syncCloud",sync),{name:"syncCloud",arity:1,async:true,regular:false,lineNumber:site.functionLineNumber,columnNumber:site.functionColumnNumber},this.#b.scriptId);this.#current();
   const members=jsonMembers(await this.#props("json",json),natives.get("3"));this.#current();
   for(const role of["parse","stringify"]as const){const profile=PROFILES.find(row=>row.role===role);need(profile!==undefined,"PROFILE");decodeCurrentNativeFunctionMetadata(await this.#props(`native-${role}`,members[role]),profile);this.#current();}
   const iteratorCommand=call("recipe","iterator",this.#b.reflection,[...refs,add,values,json,members.parse,members.stringify].map(objectId=>({objectId})));
   const prepared=arrayCapture(await this.#send(iteratorCommand),8);
   const fields=array(await this.#props("prepared",prepared),8),next=objectAt(fields,4),profile=PROFILES.find(row=>row.role==="next");need(profile!==undefined,"NEXT_PROFILE");callable(fields.get("4"),"next");decodeCurrentNativeFunctionMetadata(await this.#props("native-next",next),profile);this.#current();
   const finishCommand=call("recipe","finish",this.#b.reflection,[...refs,prepared,sync].map(objectId=>({objectId})));
   const packet=arrayCapture(await this.#send(finishCommand),9);
   need(this.#requests.length===15&&this.#helpers===3,"COMPLETE_ROSTER");this.#data=packet;result.resolve(packet);
  }catch(error){this.#fail(error);result.reject(error);}})();void this.#handled(result.promise);return result.promise;
 }
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 public requireOriginal(packet:string):void{this.#current();need(this.#data===packet&&this.#pending!==null&&this.#requests.length===15&&this.#helpers===3,"ORIGINAL_PACKET");}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;const pending=this.#pending;await Promise.allSettled([...this.#requests,...(pending===null?[]:[pending])]);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainRecipe.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainRecipe);
