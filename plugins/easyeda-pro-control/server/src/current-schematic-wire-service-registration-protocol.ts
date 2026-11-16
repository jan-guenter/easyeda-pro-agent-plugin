/** A finite before-Modify reader for the three original service targets. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_PROGRAMS as PROGRAMS } from "./current-schematic-wire-service-registration-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as FLAGS } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_REQUESTS=Object.freeze({
 approvedSlots:64,scopeLimit:10,bindings:5,
 ordinary:64+2+1+1+1+1+3+5*(1+10+10)+8+1+6+4,
 sources:2+1+1+1+5*10+4+1+2,
 normal:197+62,cleanup:0,
}as const);
export const CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_CALLS=freezeDeep({
 approved:{program:PROGRAMS.approved,refs:65,byValue:false},bus:{program:PROGRAMS.bus,refs:3,byValue:false},
 roots:{program:PROGRAMS.roots,refs:3,byValue:false},lists:{program:PROGRAMS.lists,refs:4,byValue:false},
 scopeE:{program:PROGRAMS.scopeE,refs:1,byValue:false},scopeT:{program:PROGRAMS.scopeT,refs:1,byValue:false},
 bundle:{program:PROGRAMS.bundle,refs:4,byValue:false},complete:{program:PROGRAMS.complete,refs:11,byValue:true},
}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),object=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.union(Object.entries(CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_CALLS).map(([role,row])=>z.strictObject({
 phase:z.literal("wire-service-registration-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),
 params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(object).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)}),
})));
export type CurrentSchematicWireServiceRegistrationCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireServiceRegistrationCommand(input:unknown):CurrentSchematicWireServiceRegistrationCommand{return freezeDeep(schema.parse(capture(input).value));}
