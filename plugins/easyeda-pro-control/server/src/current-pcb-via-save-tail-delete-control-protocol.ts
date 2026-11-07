/* oxlint-disable unicorn/max-nested-calls -- Exact private argument tuples define only the two original deletion continuations. */
import { z } from "zod";
import { CURRENT_PCB_VIA_SAVE_TAIL_DELETE_PROGRAMS as PROGRAMS } from "./current-pcb-via-save-tail-delete-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as FLAGS } from "./current-project-save-producer-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false),returnByValue:z.literal(true)};
const schema=z.union([
  z.strictObject({phase:z.literal("via-tail-delete-call-proof"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS.callProof),arguments:z.tuple([ref,ref,ref,z.strictObject({value:z.string().regex(/^[a-f0-9]{32}$/u)})])})}),
  z.strictObject({phase:z.literal("via-tail-delete-returned-proof"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS.returnedProof),arguments:z.tuple([ref])})}),
  z.strictObject({phase:z.literal("via-tail-delete-resume"),role:z.enum(["cacheDeleteCall","cacheDeleteReturned"]),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
]);
export type CurrentPcbViaSaveTailDeleteControlCommand=z.infer<typeof schema>;
export const CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CONTROL_REQUESTS=Object.freeze({proofs:2,resumes:2,cdpRequests:4,events:2});
export function validateCurrentPcbViaSaveTailDeleteControlCommand(input:unknown):CurrentPcbViaSaveTailDeleteControlCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentPcbViaSaveTailDeleteControlNativeCases():readonly CurrentPcbViaSaveTailDeleteControlCommand[]{return freezeDeep([
{phase:"via-tail-delete-call-proof",method:"Runtime.callFunctionOn",params:{...FLAGS,returnByValue:true,objectId:"original",functionDeclaration:PROGRAMS.callProof,arguments:[{objectId:"history"},{objectId:"reply"},{objectId:"local"},{value:"a".repeat(32)}]}},
{phase:"via-tail-delete-resume",role:"cacheDeleteCall",method:"Debugger.resume",params:{}},
{phase:"via-tail-delete-returned-proof",method:"Runtime.callFunctionOn",params:{...FLAGS,returnByValue:true,objectId:"original",functionDeclaration:PROGRAMS.returnedProof,arguments:[{objectId:"original_call"}]}},
{phase:"via-tail-delete-resume",role:"cacheDeleteReturned",method:"Debugger.resume",params:{}},
].map(value=>validateCurrentPcbViaSaveTailDeleteControlCommand(value)));}
