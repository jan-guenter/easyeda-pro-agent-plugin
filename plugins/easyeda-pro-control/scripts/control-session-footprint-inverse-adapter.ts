/** Strict comparison data only. The manager retains original connection and
 * generation custody; serialized requests cannot recreate inverse ownership. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_CONTROL_CLEANUP_ACTIONS, CURRENT_FOOTPRINT_INVERSE_CONTROL_SCHEMA, CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL, currentFootprintInverseControlActionSchema } from "../server/src/current-footprint-inverse-control-contract.ts";
import type { CurrentFootprintInverseControlAction } from "../server/src/current-footprint-inverse-control-contract.ts";
import { freezeDeep } from "../server/src/sqlite-inventory-core.ts";

export interface OriginalFootprintInverseManagerRequest {
 readonly operationId:string;
 readonly action:CurrentFootprintInverseControlAction["action"];
 readonly request:Readonly<CurrentFootprintInverseControlAction>;
}
const outer=z.strictObject({request:currentFootprintInverseControlActionSchema});
const cleanup=z.enum(CURRENT_FOOTPRINT_INVERSE_CONTROL_CLEANUP_ACTIONS);
export function captureOriginalFootprintInverseManagerRequest(tool:string,input:unknown):OriginalFootprintInverseManagerRequest|null{
 if(tool!==CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL){return null;}
 const parsed=outer.safeParse(input);if(!parsed.success){return null;}const request=parsed.data.request;
 return freezeDeep({operationId:request.operationId,action:request.action,request});
}
export function isOriginalFootprintInverseManagerControl(action:string):boolean{return cleanup.safeParse(action).success;}
export function originalFootprintInverseManagerControl(original:OriginalFootprintInverseManagerRequest,action:string):Readonly<{
 tool:typeof CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL;arguments:{request:CurrentFootprintInverseControlAction};
}>{
 const selected=cleanup.parse(action);
 const request=currentFootprintInverseControlActionSchema.parse({schema:CURRENT_FOOTPRINT_INVERSE_CONTROL_SCHEMA,action:selected,operationId:original.operationId,...(selected==="cleanup"?{confirmOriginalJobsOnly:true}:{})});
 return freezeDeep({tool:CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL,arguments:{request}});
}
