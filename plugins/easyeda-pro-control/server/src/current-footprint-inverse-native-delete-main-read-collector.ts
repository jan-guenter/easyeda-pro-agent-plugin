/** One original natural request return. Observation and original resume are
 * separate so the next owned return point can be armed before this response. */
import {z}from"zod";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_FUNCTIONS as FUNCTIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READ_GROUP as GROUP,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS as READS,validateCurrentFootprintInverseNativeDeleteMainReadCommand as validate}from"./current-footprint-inverse-native-delete-main-read-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteMainReadKind as Kind}from"./current-footprint-inverse-native-delete-main-read-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteMainReadCustody,CurrentFootprintInverseNativeDeleteMainReadValue}from"./current-footprint-inverse-native-delete-main-read-custody.ts";

const remote=z.looseObject({objectId:z.string().optional()});
const member=z.looseObject({name:z.string(),value:remote.optional()});
const members=z.looseObject({result:z.array(member).max(64),internalProperties:z.array(member).max(8).optional()});
const object=z.strictObject({result:z.looseObject({type:z.literal("object"),subtype:z.literal("array"),objectId:z.string()})});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_COLLECTOR");}}
export class CurrentFootprintInverseNativeDeleteMainReadCollector{
 readonly #kind:Kind;readonly #custody:CurrentFootprintInverseNativeDeleteMainReadCustody;readonly #sql:string;
 #point:string|null=null;#armAttempted=false;#observeAttempted=false;#observed=false;#finishAttempted=false;
 public constructor(kind:Kind,custody:CurrentFootprintInverseNativeDeleteMainReadCustody,sql:string){this.#kind=kind;this.#custody=custody;this.#sql=sql;Object.freeze(this);}
 #request(command:Readonly<Record<string,unknown>>,cleanup:boolean):Promise<unknown>{
  return this.#custody.request(validate({...command,kind:this.#kind}),cleanup);
 }
 public async arm(scriptId:string):Promise<void>{
  need(!this.#armAttempted);this.#armAttempted=true;const site=READS[this.#kind].site;
  try{
   const result=await this.#request({phase:"inverse-native-delete-main-read-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber}}},false);
   this.#point=z.strictObject({breakpointId:z.string(),actualLocation:z.unknown()}).parse(result).breakpointId;
  }catch(error){this.#custody.failOriginalObservation(error);throw error;}
 }
 public async observeHeld(frameId:string):Promise<void>{
  need(this.#point!==null&&!this.#observeAttempted);this.#observeAttempted=true;
  try{
   const definition=READS[this.#kind],request=this.#custody.originalRequestObjectId();
   const frame=object.parse(await this.#request({phase:"inverse-native-delete-main-read-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frameId,expression:definition.site.expression,includeCommandLineAPI:false,returnByValue:false}},false)).result.objectId;
   const capture=object.parse(await this.#request({phase:"inverse-native-delete-main-read-join",role:"capture",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:frame,functionDeclaration:definition.programs.capture.program,arguments:[{objectId:this.#sql},{objectId:request}],returnByValue:false,awaitPromise:false,userGesture:false}},false)).result.objectId;
   const packet=members.parse(await this.#request({phase:"inverse-native-delete-main-read-properties",role:"packet",method:"Runtime.getProperties",params:{objectId:capture,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},false));
   const promiseId=packet.result.find(row=>row.name===String(definition.promiseIndex))?.value?.objectId;need(typeof promiseId==="string");
   const promise=members.parse(await this.#request({phase:"inverse-native-delete-main-read-properties",role:"promise",method:"Runtime.getProperties",params:{objectId:promiseId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},false));
   const result=promise.internalProperties?.find(row=>row.name==="[[PromiseResult]]")?.value?.objectId;need(typeof result==="string");
   await this.#request({phase:"inverse-native-delete-main-read-join",role:"resolved",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:capture,functionDeclaration:definition.programs.resolved.program,arguments:[{objectId:result}],returnByValue:true,awaitPromise:false,userGesture:false}},false);
   if(this.#kind==="history"){
    for(const role of["projectSql","table","branches"]as const){
     const objectId=packet.result.find(row=>row.name===String(FUNCTIONS[role].index))?.value?.objectId;need(typeof objectId==="string");
     await this.#request({phase:"inverse-native-delete-main-read-properties",role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},false);
    }
   }
   await this.#request({phase:"inverse-native-delete-main-read-join",role:"value",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:capture,functionDeclaration:definition.programs.value.program,arguments:[],returnByValue:true,awaitPromise:false,userGesture:false}},false);
   this.#observed=true;
  }catch(error){this.#custody.failOriginalObservation(error);throw error;}
 }
 public async finishHeld():Promise<CurrentFootprintInverseNativeDeleteMainReadValue>{
  need(this.#point!==null&&this.#observed&&!this.#finishAttempted);this.#finishAttempted=true;const point=this.#point;
  try{
   await this.#request({phase:"inverse-native-delete-main-read-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point}},true);
   await this.#request({phase:"inverse-native-delete-main-read-step",method:"Debugger.resume",params:{}},false);
   await this.#request({phase:"inverse-native-delete-main-read-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:GROUP}},true);
   return this.#custody.result();
  }catch(error){this.#custody.failOriginalObservation(error);throw error;}
 }
}
Object.freeze(CurrentFootprintInverseNativeDeleteMainReadCollector.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteMainReadCollector);
