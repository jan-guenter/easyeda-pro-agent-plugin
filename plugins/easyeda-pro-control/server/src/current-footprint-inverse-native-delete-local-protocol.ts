/* oxlint-disable unicorn/max-nested-calls -- Fixed Zod argument tuples are compared exactly at the private native boundary. */
/** Native tombstone local-upload data grammar. Original one-string/default-parse
 * custody is separate from the historical false-parse Via Save grammar.
 * Handles remain original-owner data;
 * no generic producer resume or caller program can cross its wire grammar. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS } from "./current-project-save-producer-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_CAPTURE as CAPTURE, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-local-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_ROLES = ["localIngress", "headEntry", "headPromise", "headSuccess", "bufferIngress", "bufferScheduled", "localReturned"] as const;
export type CurrentFootprintInverseNativeDeleteLocalRole = typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_ROLES[number];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_REQUESTS = Object.freeze({ capture: 2, proofs: 7, resumes: 7, properties: 2, keyMetadata:4, cdpRequests: 22, events: 7 });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal("easyeda-inverse-native-delete-local-v1"), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const key = z.string().regex(/^https:\/\/client\/upload\/[a-f\d]{32}\?key=[a-f\d]{16}$/u);
const body = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const bodyArguments=z.tuple([z.strictObject({value:key}),z.strictObject({value:body})]);
const oneReference=z.tuple([ref]);const twoReferences=z.tuple([ref,ref]);const threeReferences=z.tuple([ref,ref,ref]);
function argumentsSchema(role: CurrentFootprintInverseNativeDeleteLocalRole): typeof bodyArguments | typeof oneReference | typeof twoReferences | typeof threeReferences {
  if(role==="headEntry") { return bodyArguments; }
  if(role==="localIngress"||role==="headPromise") { return oneReference; }
  if(role==="headSuccess") { return twoReferences; } return threeReferences;
}
const keyFrameFlags={objectGroup:z.literal("easyeda-inverse-native-delete-local-v1"),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)};
const shapes=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_ROLES.map(role=>z.strictObject({phase:z.literal("inverse-native-delete-local-proof"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS[role]),arguments:argumentsSchema(role)})}));
const schema = z.union([z.strictObject({phase:z.literal("inverse-native-delete-local-capture-properties"),role:z.literal("sourceBody"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),z.strictObject({phase:z.literal("inverse-native-delete-local-capture"),role:z.literal("sourceBody"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,returnByValue:z.literal(false),objectId:handle,functionDeclaration:z.literal(CAPTURE),arguments:z.tuple([ref,ref,ref])})}),z.strictObject({phase:z.literal("inverse-native-delete-local-key-frame"),role:z.literal("source"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...keyFrameFlags,callFrameId:handle,expression:z.literal("[Qe,cg]")})}),z.strictObject({phase:z.literal("inverse-native-delete-local-key-properties"),role:z.enum(["tuple","Qe","cg"]),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),...shapes, z.strictObject({ phase: z.literal("inverse-native-delete-local-resume"), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_ROLES), method: z.literal("Debugger.resume"), params: z.strictObject({}) }), z.strictObject({ phase: z.literal("inverse-native-delete-local-properties"), role: z.enum(["cache", "buffer"]), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) })]);
export type CurrentFootprintInverseNativeDeleteLocalCommand = z.infer<typeof schema>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS = Object.freeze({ ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS,objectGroup:"easyeda-inverse-native-delete-local-v1", returnByValue: true } as const);
export function validateCurrentFootprintInverseNativeDeleteLocalCommand(input: unknown): CurrentFootprintInverseNativeDeleteLocalCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
export function currentFootprintInverseNativeDeleteLocalNativeCases(): readonly CurrentFootprintInverseNativeDeleteLocalCommand[] {
  const cases: unknown[] = [{phase:"inverse-native-delete-local-capture-properties",role:"sourceBody",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},{phase:"inverse-native-delete-local-capture",role:"sourceBody",method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS,returnByValue:false,objectId:"original_ref",functionDeclaration:CAPTURE,arguments:Array.from({length:3},()=>({objectId:"original_ref"}))}},{phase:"inverse-native-delete-local-key-frame",role:"source",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS,objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS.objectGroup,callFrameId:"original",expression:"[Qe,cg]"}},...(["tuple","Qe","cg"] as const).map(role=>({phase:"inverse-native-delete-local-key-properties",role,method:"Runtime.getProperties",params:{objectId:"original",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}))];
  for (const role of CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_ROLES) { let count=3; if(role==="localIngress"||role==="headPromise") { count=1; } else if(role==="headSuccess") { count=2; }
    const args=role==="headEntry"?[{value:`https://client/upload/${"a".repeat(32)}?key=${"b".repeat(16)}`},{value:"original_body"}]:Array.from({length:count},(_value,index)=>({objectId:`original_${String(index)}`}));
    cases.push({ phase: "inverse-native-delete-local-proof", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS, objectId: "original_frame", functionDeclaration: PROGRAMS[role], arguments: args } }, { phase: "inverse-native-delete-local-resume", role, method: "Debugger.resume", params: {} }); }
  for (const role of ["cache", "buffer"]) { cases.push({ phase: "inverse-native-delete-local-properties", role, method: "Runtime.getProperties", params: { objectId: "original_promise", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  return freezeDeep(cases.map(value=>validateCurrentFootprintInverseNativeDeleteLocalCommand(value)));
}
