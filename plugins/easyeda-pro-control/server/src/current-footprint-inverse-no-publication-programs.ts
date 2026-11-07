/** Original readOnly/format getter association only. These fixed projections
 * invoke neither method/accessor nor a queue, callback, timer or publisher. */
import { z } from "zod";
import { CURRENT_PCB_STRING_WORKER_GATE_SELECTOR } from "./current-pcb-string-worker-gate-program.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const source=CURRENT_PCB_STRING_WORKER_GATE_SELECTOR;
function once(marker:string):number{const index=source.indexOf(marker);if(index===-1||source.includes(marker,index+marker.length)){throw new Error("FOOTPRINT_INVERSE_GATE_TEMPLATE");}return index;}
const prefix=source.slice("function(){".length,once('const bus=object(own(project,"workerBus"));'));
const check=source.slice(once("const recheck=()=>"),once("recheck();return methods;}"));
const select='const methods=[nativeMethod(gp,"isReadOnly"),format.get];';
export const CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_PROGRAMS=Object.freeze({
  capture:`function(){${prefix}${select}${check}recheck();return methods;}`,
  reprove:`function(original){${prefix}${select}${check}if(arraySize(original)!==2)bad();for(let i=0;i<2;i++)if(own(original,String(i))!==methods[i])bad();recheck();return true;}`,
});
export const CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_GROUP="easyeda-footprint-inverse-no-publication-v1";
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const properties=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const capture=z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_PROGRAMS.capture),arguments:z.tuple([]),returnByValue:z.literal(false)});
const reprove=z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_PROGRAMS.reprove),arguments:z.tuple([ref]),returnByValue:z.literal(true)});
const schema=z.union([
  z.strictObject({phase:z.literal("inverse-producer-gate-capture"),method:z.literal("Runtime.callFunctionOn"),params:capture}),
  z.strictObject({phase:z.literal("inverse-producer-gate-reprove"),method:z.literal("Runtime.callFunctionOn"),params:reprove}),
  z.strictObject({phase:z.literal("inverse-producer-gate-properties"),method:z.literal("Runtime.getProperties"),params:properties}),
  z.strictObject({phase:z.literal("inverse-producer-gate-metadata-readOnly"),method:z.literal("Runtime.getProperties"),params:properties}),
  z.strictObject({phase:z.literal("inverse-producer-gate-metadata-format"),method:z.literal("Runtime.getProperties"),params:properties}),
]);
export type CurrentFootprintInverseNoPublicationCommand=z.infer<typeof schema>;
export const CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_FLAGS=Object.freeze({objectGroup:CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false} as const);
export const CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_ORDER=Object.freeze(["inverse-producer-gate-capture","inverse-producer-gate-properties","inverse-producer-gate-metadata-readOnly","inverse-producer-gate-metadata-format","inverse-producer-gate-reprove"] as const);
export function validateCurrentFootprintInverseNoPublicationCommand(input:unknown):CurrentFootprintInverseNoPublicationCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentFootprintInverseNoPublicationCases():readonly CurrentFootprintInverseNoPublicationCommand[]{
  return Object.freeze([
    validateCurrentFootprintInverseNoPublicationCommand({phase:"inverse-producer-gate-capture",method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_FLAGS,objectId:"original_project",functionDeclaration:CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_PROGRAMS.capture,arguments:[],returnByValue:false}}),
    ...CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_ORDER.slice(1,4).map(phase=>validateCurrentFootprintInverseNoPublicationCommand({phase,method:"Runtime.getProperties",params:{objectId:"original_gate",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}})),
    validateCurrentFootprintInverseNoPublicationCommand({phase:"inverse-producer-gate-reprove",method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_FLAGS,objectId:"original_project",functionDeclaration:CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_PROGRAMS.reprove,arguments:[{objectId:"original_gate_tuple"}],returnByValue:true}}),
  ]);
}
