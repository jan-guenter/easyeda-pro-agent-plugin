/** Strict comparison data only. The manager retains original connection and
 * generation custody; serialized requests cannot recreate the separate cold-UI continuation ownership. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_COLD_UI_CLEANUP_ACTIONS, CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_SCHEMA, CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL, currentFootprintInverseColdUiControlActionSchema } from "../server/src/current-footprint-inverse-cold-ui-control-contract.ts";
import type { CurrentFootprintInverseColdUiControlAction } from "../server/src/current-footprint-inverse-cold-ui-control-contract.ts";
import { freezeDeep } from "../server/src/sqlite-inventory-core.ts";

export interface OriginalFootprintInverseColdUiManagerRequest {
 readonly operationId:string;
 readonly action:CurrentFootprintInverseColdUiControlAction["action"];
 readonly request:Readonly<CurrentFootprintInverseColdUiControlAction>;
}
const outer=z.strictObject({request:currentFootprintInverseColdUiControlActionSchema});
const cleanup=z.enum(CURRENT_FOOTPRINT_INVERSE_COLD_UI_CLEANUP_ACTIONS);
export function captureOriginalFootprintInverseColdUiManagerRequest(tool:string,input:unknown):OriginalFootprintInverseColdUiManagerRequest|null{
 if(tool!==CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL){return null;}
 const parsed=outer.safeParse(input);if(!parsed.success){return null;}const request=parsed.data.request;
 return freezeDeep({operationId:request.operationId,action:request.action,request});
}
export function isOriginalFootprintInverseColdUiManagerControl(action:string):boolean{return cleanup.safeParse(action).success;}
export function originalFootprintInverseColdUiManagerControl(original:OriginalFootprintInverseColdUiManagerRequest,action:string):Readonly<{
 tool:typeof CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL;arguments:{request:CurrentFootprintInverseColdUiControlAction};
}>{
 const selected=cleanup.parse(action);
 const request=currentFootprintInverseColdUiControlActionSchema.parse({schema:CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_SCHEMA,action:selected,operationId:original.operationId,...(selected==="cleanup"?{confirmOriginalJobsOnly:true}:{})});
 return freezeDeep({tool:CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL,arguments:{request}});
}
