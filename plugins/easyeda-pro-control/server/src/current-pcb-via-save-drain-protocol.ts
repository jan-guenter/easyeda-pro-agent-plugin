/* oxlint-disable unicorn/max-nested-calls -- Every nested field is part of the fixed, bounded private CDP grammar. */
/** One original uploader tail. Delete continuations have their own four-call
 * owner lane and are deliberately absent from this codebook. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE as RETAIN } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_PCB_VIA_SAVE_DRAIN_PROGRAMS as PROGRAMS } from "./current-pcb-via-save-drain-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVE_DRAIN_ROLES=["historyReply","detachedEntry","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone","detachedReturned","headEntry","headPromise","headSuccess"] as const;
export type CurrentPcbViaSaveDrainRole=typeof CURRENT_PCB_VIA_SAVE_DRAIN_ROLES[number]|"cacheDeleteCall"|"cacheDeleteReturned";
export const CURRENT_PCB_VIA_SAVE_DRAIN_FLAGS=Object.freeze({objectGroup:"easyeda-via-save-drain209-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false} as const);
export const CURRENT_PCB_VIA_SAVE_DRAIN_REQUESTS=Object.freeze({events:22,proofAndResume:40,captureProperties:3,retainedReturns:3,queuedProperties:1,promiseMetadata:18,cloudResultProofs:2,finalProofs:2,cdpRequests:69,delegatedDeleteRequests:4,totalRequests:73,settlementPasses:2});
const roles=["capture","detachedEntry","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone","detachedReturned","localSave","flow","head","headPromise","headSuccess","cloudResult","final","retain"] as const;
export type CurrentPcbViaSaveDrainProgramRole=typeof roles[number];
const counts:Readonly<Record<CurrentPcbViaSaveDrainProgramRole,number>>=Object.freeze({capture:5,detachedEntry:1,syncEntry:1,syncDeferred:2,historyQueued:1,historyFinally:2,cloudReturned:2,cloudFinally:2,batchReturned:1,bufferDone:1,detachedReturned:2,localSave:3,flow:6,head:3,headPromise:1,headSuccess:2,cloudResult:2,final:1,retain:0});
const flags={objectGroup:z.literal(CURRENT_PCB_VIA_SAVE_DRAIN_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const ref=z.strictObject({objectId:handle});const text=z.string().min(1).max(16_384).refine(v=>v.isWellFormed()&&Buffer.byteLength(v)<=16_384);const argument=z.union([ref,z.strictObject({value:text}),z.strictObject({value:z.union([z.literal(0),z.literal(1)])})]);
const schema=z.discriminatedUnion("phase",[
  z.strictObject({phase:z.literal("via-drain-call"),role:z.enum(roles),slot:z.number().int().min(0).max(2),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,returnByValue:z.boolean(),functionDeclaration:z.string().min(1).max(16_384),arguments:z.array(argument).max(6)})}),
  z.strictObject({phase:z.literal("via-drain-properties"),role:z.enum(["replyFrame","capture","queued","cloudFrame","settled"]),slot:z.number().int().min(0).max(8),pass:z.number().int().min(0).max(2),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
  z.strictObject({phase:z.literal("via-drain-resume"),role:z.enum(CURRENT_PCB_VIA_SAVE_DRAIN_ROLES),slot:z.number().int().min(0).max(2),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
]);
export type CurrentPcbViaSaveDrainCommand=z.infer<typeof schema>;
function need(v:boolean):asserts v{if(!v){throw new Error("VIA_DRAIN_FIXED_COMMAND");}}
function textArgument(role:CurrentPcbViaSaveDrainProgramRole,index:number):boolean{if(role==="capture"){return index===4;}if(["localSave","head","flow"].includes(role)){return index>=1;}return false;}
export function validateCurrentPcbViaSaveDrainCommand(input:unknown):CurrentPcbViaSaveDrainCommand{
  const c=schema.parse(captureCurrentPcbStringClockReply(input).value);
  if(c.phase==="via-drain-call"){need(c.params.functionDeclaration===(c.role==="retain"?RETAIN:PROGRAMS[c.role])&&c.params.arguments.length===counts[c.role]&&c.params.returnByValue!==["capture","retain"].includes(c.role));
    for(let i=0;i<c.params.arguments.length;i+=1){const a=c.params.arguments[i];need(a!==undefined&&("value"in a)===textArgument(c.role,i));if(c.role==="flow"&&i===5){need("value"in a&&typeof a.value==="number");}else if("value"in a){need(typeof a.value==="string");}}
    if(c.role==="localSave"){need(c.slot===0);}else if(c.role==="flow"){need(c.slot===1);}else if(c.role==="head"){need(c.slot===2);}else if(!["headPromise","headSuccess","retain","cloudResult"].includes(c.role)){need(c.slot===0);}else if(c.role==="cloudResult"){need(c.slot<=1);}
  }else if(c.phase==="via-drain-properties"){need(c.role==="settled"?c.pass>=1:c.slot===0&&c.pass===0);}else{need(["headEntry","headPromise","headSuccess"].includes(c.role)||c.slot===0);}
  return freezeDeep(c);
}
export function currentPcbViaSaveDrainNativeCases():readonly CurrentPcbViaSaveDrainCommand[]{
  const result:unknown[]=[];
  for(const role of roles){let slots=[0];if(["headPromise","headSuccess","retain"].includes(role)){slots=[0,1,2];}else if(role==="cloudResult"){slots=[0,1];}else if(role==="flow"){slots=[1];}else if(role==="head"){slots=[2];}for(const slot of slots){result.push({phase:"via-drain-call",role,slot,method:"Runtime.callFunctionOn",params:{...CURRENT_PCB_VIA_SAVE_DRAIN_FLAGS,objectId:"original_object",returnByValue:!["capture","retain"].includes(role),functionDeclaration:role==="retain"?RETAIN:PROGRAMS[role],arguments:Array.from({length:counts[role]},(_,i)=>textArgument(role,i)?{value:role==="flow"&&i===5?0:"original_private_value"}:{objectId:"original_reference"})}});}}
  for(const role of ["replyFrame","capture","queued","cloudFrame"]){result.push({phase:"via-drain-properties",role,slot:0,pass:0,method:"Runtime.getProperties",params:{objectId:"original_object",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
  for(const pass of [1,2]){for(let slot=0;slot<9;slot+=1){result.push({phase:"via-drain-properties",role:"settled",slot,pass,method:"Runtime.getProperties",params:{objectId:"original_promise",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}}
  for(const role of CURRENT_PCB_VIA_SAVE_DRAIN_ROLES){for(const slot of ["headEntry","headPromise","headSuccess"].includes(role)?[0,1,2]:[0]){result.push({phase:"via-drain-resume",role,slot,method:"Debugger.resume",params:{}});}}
  return freezeDeep(result.map(v=>validateCurrentPcbViaSaveDrainCommand(v)));
}
