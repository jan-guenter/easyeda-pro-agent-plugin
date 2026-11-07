/** Fixed inverse pre-model steps only. Plaintext, parsed and ready releases
 * require separate actual startup/frontier proof and are absent here. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_COLD_STEP_ROLES=Object.freeze(["branch","cold","histories","fetchEntry","response","bytes"]as const);
export type CurrentFootprintInverseColdStepRole=typeof CURRENT_FOOTPRINT_INVERSE_COLD_STEP_ROLES[number];
const schema=z.strictObject({phase:z.literal("inverse-cold-step"),role:z.enum(CURRENT_FOOTPRINT_INVERSE_COLD_STEP_ROLES),method:z.literal("Debugger.resume"),params:z.strictObject({})});
export type CurrentFootprintInverseColdStepCommand=z.infer<typeof schema>;
export function currentFootprintInverseColdStepBudget(chunks:number):number{if(!Number.isSafeInteger(chunks)||chunks<1||chunks>8){throw new Error("FOOTPRINT_INVERSE_COLD_STEP_CHUNK_BOUND");}return 3+3*chunks;}
export const CURRENT_FOOTPRINT_INVERSE_COLD_STEP_REQUESTS=Object.freeze({fixed:3,perChunk:3,maximum:currentFootprintInverseColdStepBudget(8)});
export function validateCurrentFootprintInverseColdStepCommand(input:unknown):CurrentFootprintInverseColdStepCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentFootprintInverseColdStepWire(input:CurrentFootprintInverseColdStepCommand,id:number,sessionId:string):CurrentFootprintInverseColdStepCommand&Readonly<{id:number;sessionId:string;inverseColdStep:true}>{
 if(!Number.isSafeInteger(id)||id<1||!/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)){throw new Error("FOOTPRINT_INVERSE_COLD_STEP_ENVELOPE");}return freezeDeep({...validateCurrentFootprintInverseColdStepCommand(input),id,sessionId,inverseColdStep:true});
}
export function currentFootprintInverseColdStepNativeFrame(chunk:Buffer,input:CurrentFootprintInverseColdStepCommand,sessionId:string):Readonly<{action:"footprint-inverse-cold-step";requestId:number;stepRole:CurrentFootprintInverseColdStepRole}>{
 if(chunk.length>65_536||chunk.at(-1)!==0){throw new Error("FOOTPRINT_INVERSE_COLD_STEP_FRAME");}const command=validateCurrentFootprintInverseColdStepCommand(input);
 const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(chunk.subarray(0,-1)));const value=z.looseObject({id:z.number().int().positive()}).parse(captureCurrentPcbStringClockReply(raw).value);
 const expected=currentFootprintInverseColdStepWire(command,value.id,sessionId);if(canonicalJson(value)!==canonicalJson(expected)||chunk.toString("utf8")!==`${JSON.stringify(expected)}\0`){throw new Error("FOOTPRINT_INVERSE_COLD_STEP_FRAME");}
 return Object.freeze({action:"footprint-inverse-cold-step",requestId:value.id,stepRole:command.role});
}
