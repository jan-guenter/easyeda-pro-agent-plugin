/* oxlint-disable unicorn/max-nested-calls -- Fixed Zod argument tuples are compared exactly at the private native boundary. */
/** One fixed planned local-upload lane. Handles remain original-owner data;
 * no generic producer resume or caller program can cross its wire grammar. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_PROGRAMS as PROGRAMS } from "./current-pcb-via-local-upload-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES = ["localIngress", "headEntry", "headPromise", "headSuccess", "bufferIngress", "bufferScheduled", "localReturned"] as const;
export type CurrentPcbViaLocalUploadRole = typeof CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES[number];
export const CURRENT_PCB_VIA_LOCAL_UPLOAD_REQUESTS = Object.freeze({ proofs: 7, resumes: 7, properties: 2, keyMetadata:4, cdpRequests: 20, events: 7 });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const key = z.string().regex(/^https:\/\/client\/upload\/[a-f\d]{32}\?key=[a-f\d]{16}$/u);
const body = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const bodyArguments=z.tuple([z.strictObject({value:key}),z.strictObject({value:body})]);
const oneReference=z.tuple([ref]);const twoReferences=z.tuple([ref,ref]);const threeReferences=z.tuple([ref,ref,ref]);
function argumentsSchema(role: CurrentPcbViaLocalUploadRole): typeof bodyArguments | typeof oneReference | typeof twoReferences | typeof threeReferences {
  if(role==="headEntry") { return bodyArguments; }
  if(role==="localIngress"||role==="headPromise") { return oneReference; }
  if(role==="headSuccess") { return twoReferences; } return threeReferences;
}
const keyFrameFlags={objectGroup:z.literal(CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)};
const shapes=CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES.map(role=>z.strictObject({phase:z.literal("via-local-proof"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS[role]),arguments:argumentsSchema(role)})}));
const schema = z.union([z.strictObject({phase:z.literal("via-local-key-frame"),role:z.literal("source"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...keyFrameFlags,callFrameId:handle,expression:z.literal("[Qe,cg]")})}),z.strictObject({phase:z.literal("via-local-key-properties"),role:z.enum(["tuple","Qe","cg"]),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),...shapes, z.strictObject({ phase: z.literal("via-local-resume"), role: z.enum(CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES), method: z.literal("Debugger.resume"), params: z.strictObject({}) }), z.strictObject({ phase: z.literal("via-local-properties"), role: z.enum(["cache", "buffer"]), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) })]);
export type CurrentPcbViaLocalUploadCommand = z.infer<typeof schema>;
export const CURRENT_PCB_VIA_LOCAL_UPLOAD_FLAGS = Object.freeze({ ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, returnByValue: true } as const);
export function validateCurrentPcbViaLocalUploadCommand(input: unknown): CurrentPcbViaLocalUploadCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
export function currentPcbViaLocalUploadNativeCases(): readonly CurrentPcbViaLocalUploadCommand[] {
  const cases: unknown[] = [{phase:"via-local-key-frame",role:"source",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS,callFrameId:"original",expression:"[Qe,cg]"}},...(["tuple","Qe","cg"] as const).map(role=>({phase:"via-local-key-properties",role,method:"Runtime.getProperties",params:{objectId:"original",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}))];
  for (const role of CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES) { let count=3; if(role==="localIngress"||role==="headPromise") { count=1; } else if(role==="headSuccess") { count=2; }
    const args=role==="headEntry"?[{value:`https://client/upload/${"a".repeat(32)}?key=${"b".repeat(16)}`},{value:"original_body"}]:Array.from({length:count},(_value,index)=>({objectId:`original_${String(index)}`}));
    cases.push({ phase: "via-local-proof", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_LOCAL_UPLOAD_FLAGS, objectId: "original_frame", functionDeclaration: PROGRAMS[role], arguments: args } }, { phase: "via-local-resume", role, method: "Debugger.resume", params: {} }); }
  for (const role of ["cache", "buffer"]) { cases.push({ phase: "via-local-properties", role, method: "Runtime.getProperties", params: { objectId: "original_promise", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  return freezeDeep(cases.map(value=>validateCurrentPcbViaLocalUploadCommand(value)));
}
