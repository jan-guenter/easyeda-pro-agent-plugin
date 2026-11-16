/** Read-only capture grammar for the native tombstone's original producer
 * points. Old producer origins and continuation helpers remain disjoint. */
import {z} from "zod";
import {CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as FLAGS,currentProjectSaveProducerNativeCases as oldCases,validateCurrentProjectSaveProducerCommand as validate} from "./current-project-save-producer-protocol.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PRODUCER_FLAGS=Object.freeze({...FLAGS,objectGroup:"easyeda-inverse-native-delete-producer-v1"});
const roles=["headEntry","headPromise","headSuccess","bufferIngress","bufferScheduled","localReturned"]as const;
const envelope=z.strictObject({phase:z.literal("inverse-native-delete-producer"),role:z.enum(roles),command:z.unknown()});
type Fixed=ReturnType<typeof validate>;
export type CurrentFootprintInverseNativeDeleteProducerCommand=Readonly<{phase:"inverse-native-delete-producer";role:typeof roles[number];command:Fixed}>;
function allowed(command:Fixed):boolean{
 if(command.phase==="project-save-producer-frame"||command.phase==="project-save-producer-receiver"){return roles.some(r=>r===command.role);}
 if(command.phase==="project-save-producer-cache-caller"||command.phase==="project-save-producer-cache-receiver"){return command.cacheRole==="localUpload";}
 return command.phase==="project-save-producer-properties"||command.phase==="project-save-producer-cache-properties"||command.phase==="project-save-producer-cache-promise"||command.phase==="project-save-producer-cache-promise-properties";
}
export function validateCurrentFootprintInverseNativeDeleteProducerCommand(input:unknown):CurrentFootprintInverseNativeDeleteProducerCommand{
 const value=envelope.parse(captureCurrentPcbStringClockReply(input).value);const c=z.record(z.string(),z.unknown()).parse(value.command);const params=z.record(z.string(),z.unknown()).parse(c["params"]);let normalized:unknown=c;
 if(Object.hasOwn(params,"objectGroup")){if(params["objectGroup"]!==CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PRODUCER_FLAGS.objectGroup){throw new Error("INVERSE_NATIVE_DELETE_PRODUCER_GROUP");}normalized={...c,params:{...params,objectGroup:FLAGS.objectGroup}};}
 const fixed=validate(normalized);if(!allowed(fixed)||"role"in fixed&&fixed.role!==value.role){throw new Error("INVERSE_NATIVE_DELETE_PRODUCER_ROLE");}
 const command="objectGroup"in fixed.params?{...fixed,params:{...fixed.params,objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PRODUCER_FLAGS.objectGroup}}:fixed;
 // The checked own object group is the only changed field.
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Every command field/role/program was fixed by the old pure syntax validator before changing its group.
 return freezeDeep({...value,command:command as Fixed});
}
export function currentFootprintInverseNativeDeleteProducerCases():readonly CurrentFootprintInverseNativeDeleteProducerCommand[]{
 const out:CurrentFootprintInverseNativeDeleteProducerCommand[]=[];
 for(const role of roles){for(const c of oldCases()){if(allowed(c)&&(!("role"in c)||c.role===role)){out.push(validateCurrentFootprintInverseNativeDeleteProducerCommand({phase:"inverse-native-delete-producer",role,command:{...c,params:{...c.params,...("objectGroup"in c.params?{objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PRODUCER_FLAGS.objectGroup}:{})}}}));}}}
 return freezeDeep(out);
}
