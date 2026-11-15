/** Closed descriptor and original Storage read grammar. Before and after
 * share only fixed syntax; Core must join each to its own original lifecycle. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_PROGRAMS as P} from "./current-footprint-inverse-native-delete-collateral-programs.ts";

const roles=["module","tabRoots","tabContainers","tabLists","tabRows","tabPrepare","tabReprove","storageRoots","storageMembers","storageValue","storagePrepare","storageReprove"] as const;
const h=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const ref=z.strictObject({objectId:h});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_FLAGS=Object.freeze({objectGroup:"easyeda-footprint-inverse-native-delete-collateral-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false} as const);
const F=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_FLAGS;
const flags={objectGroup:z.literal(F.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_CALLS=freezeDeep({module:{program:P.module,args:2,value:false},tabRoots:{program:P.tabRoots,args:1,value:false},tabContainers:{program:P.tabContainers,args:1,value:false},tabLists:{program:P.tabLists,args:1,value:false},tabRows:{program:P.tabRows,args:1,value:false},tabPrepare:{program:P.tabPrepare,args:5,value:false},tabReprove:{program:P.tabReprove,args:1,value:true},storageRoots:{program:P.storageRoots,args:0,value:false},storageMembers:{program:P.storageMembers,args:1,value:false},storageValue:{program:P.storageValue,args:2,value:false},storagePrepare:{program:P.storagePrepare,args:3,value:false},storageReprove:{program:P.storageReprove,args:1,value:true}} as const);
/* oxlint-disable unicorn/max-nested-calls -- Closed literal CDP vocabulary is checked against the fixed source table below. */
const schema=z.discriminatedUnion("phase",[
 z.strictObject({round:z.enum(["before","after"]),phase:z.literal("inverse-native-delete-collateral-call"),role:z.enum(roles),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:h,functionDeclaration:z.string().max(16_384),arguments:z.array(ref).max(5),returnByValue:z.boolean()})}),
 z.strictObject({round:z.enum(["before","after"]),phase:z.literal("inverse-native-delete-collateral-properties"),role:z.enum(["tuple","subject","storage"]),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:h,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({round:z.enum(["before","after"]),phase:z.literal("inverse-native-delete-collateral-helper"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:h})})
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseNativeDeleteCollateralCommand=Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_REQUESTS=freezeDeep({maximumContainers:8,maximumTabs:32,before:{calls:12,helpers:12,properties:72,cdp:96},after:{calls:2,helpers:2,properties:1,cdp:5},cdpRequests:101,controls:105,events:14,cleanupAfterOriginalExit:0,tabCloseAuthorized:false,preferenceRemovalAuthorized:false,restorationAuthorized:false,deleteAuthorized:false,saveAuthorized:false});
function need(value:boolean):asserts value{
if(!value){
throw new Error("INVERSE_NATIVE_DELETE_COLLATERAL_COMMAND");
}
}
export function validateCurrentFootprintInverseNativeDeleteCollateralCommand(input:unknown):CurrentFootprintInverseNativeDeleteCollateralCommand{
const c=schema.parse(capture(input));
if(c.phase==="inverse-native-delete-collateral-call"){
const row=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_CALLS[c.role];
need(c.params.functionDeclaration===row.program&&c.params.arguments.length===row.args&&c.params.returnByValue===row.value&&(c.round==="before"||c.role==="tabReprove"||c.role==="storageReprove"));
}
else if(c.phase==="inverse-native-delete-collateral-properties"){
need(c.round==="before"||c.role==="storage");
}
return freezeDeep(c);
}
export function currentFootprintInverseNativeDeleteCollateralProgram(c:CurrentFootprintInverseNativeDeleteCollateralCommand):string|null{
return c.method==="Runtime.callFunctionOn"?c.params.functionDeclaration:null;
}
export function qualifyCurrentFootprintInverseNativeDeleteCollateralHelper(input:unknown,command:CurrentFootprintInverseNativeDeleteCollateralCommand):void{
const c=validateCurrentFootprintInverseNativeDeleteCollateralCommand(command);
const program=currentFootprintInverseNativeDeleteCollateralProgram(c);
const raw=z.strictObject({scriptSource:z.string().max(16_386)}).parse(capture(input));
need(program!==null&&raw.scriptSource===`(${program})`);
}
export function currentFootprintInverseNativeDeleteCollateralWire(input:CurrentFootprintInverseNativeDeleteCollateralCommand,id:number,sessionId:string):CurrentFootprintInverseNativeDeleteCollateralCommand&Readonly<{id:number;sessionId:string;inverseNativeDeleteCollateral:true}>{
need(Number.isSafeInteger(id)&&id>0&&id<=2_147_483_647);
h.parse(sessionId);
return freezeDeep({...validateCurrentFootprintInverseNativeDeleteCollateralCommand(input),id,sessionId,inverseNativeDeleteCollateral:true});
}
export function currentFootprintInverseNativeDeleteCollateralNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteCollateralCommand,sessionId:string):Readonly<Record<string,string|number>>{
need(bytes.length<=65_536&&bytes.at(-1)===0);
const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));
const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(capture(raw)).id;
const c=validateCurrentFootprintInverseNativeDeleteCollateralCommand(input);
need(bytes.toString("utf8")===`${JSON.stringify(currentFootprintInverseNativeDeleteCollateralWire(c,id,sessionId))}\0`);
const fields:Record<string,string|number>={action:"footprint-inverse-native-delete-collateral",requestId:id,phase:c.phase,method:c.method,round:c.round};
if("role"in c){
fields["role"]=c.role;
}
if(c.method==="Debugger.getScriptSource"){
fields["scriptId"]=c.params.scriptId;
}
else{
fields["objectId"]=c.params.objectId;
if(c.method==="Runtime.callFunctionOn"){
for(const[index,arg]
of c.params.arguments.entries()){
fields[`argument${String(index)}`]=arg.objectId;
}
}
}
return Object.freeze(fields);
}
export function currentFootprintInverseNativeDeleteCollateralCases():readonly CurrentFootprintInverseNativeDeleteCollateralCommand[]{
const out:CurrentFootprintInverseNativeDeleteCollateralCommand[]=[];
for(const round
 of ["before","after"] as const){
for(const role
 of roles.filter(candidate=>round==="before"||candidate==="tabReprove"||candidate==="storageReprove")){
const row=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_CALLS[role];
out.push(validateCurrentFootprintInverseNativeDeleteCollateralCommand({round,phase:"inverse-native-delete-collateral-call",role,method:"Runtime.callFunctionOn",params:{...F,objectId:"original_ref",functionDeclaration:row.program,arguments:Array.from({length:row.args},()=>({objectId:"original_ref"})),returnByValue:row.value}}));
}
for(const role
 of (["tuple","subject","storage"] as const).filter(candidate=>round==="before"||candidate==="storage")){
out.push(validateCurrentFootprintInverseNativeDeleteCollateralCommand({round,phase:"inverse-native-delete-collateral-properties",role,method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}));
}
out.push(validateCurrentFootprintInverseNativeDeleteCollateralCommand({round,phase:"inverse-native-delete-collateral-helper",method:"Debugger.getScriptSource",params:{scriptId:"original_ref"}}));
}
return freezeDeep(out);
}
export function currentFootprintInverseNativeDeleteCollateralTemplate(input:CurrentFootprintInverseNativeDeleteCollateralCommand):Readonly<{key:string;method:string;names:readonly string[];template:string}>{
const c=validateCurrentFootprintInverseNativeDeleteCollateralCommand(input);
const names:string[]=[];
const field=(name:string):string=>{
need(!names.includes(name));
names.push(name);
return `__inverse_native_delete_collateral_${name}__`;
}
;
const params:Record<string,unknown>={...c.params};
if(c.method==="Debugger.getScriptSource"){
params["scriptId"]=field("scriptId");
}
else{
params["objectId"]=field("objectId");
if(c.method==="Runtime.callFunctionOn"){
params["functionDeclaration"]=`__inverse_native_delete_collateral_program_${c.role}__`;
params["arguments"]=c.params.arguments.map((_,index)=>({objectId:field(`argument${String(index)}`)}));
}
}
return freezeDeep({key:c.phase.slice("inverse-native-delete-collateral-".length)+("role"in c?`:${c.role}`:""),method:c.method,names,template:JSON.stringify({method:c.method,params})});
}
