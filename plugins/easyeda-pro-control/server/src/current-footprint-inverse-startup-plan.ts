/** Current-facade original saved-data eligibility only. It grants no native
 * queue/Promise, bootstrap continuation or old runtime-owner transfer. */
import { deriveCurrentFootprintInverseColdLoadData } from "./current-footprint-inverse-cold-load-data.ts";
import type { CurrentFootprintInverseColdLoadData } from "./current-footprint-inverse-cold-load-data.ts";
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentFootprintForwardSavedCheckpoint, verifyCurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import { deriveCurrentFootprintInverseStartupData } from "./current-footprint-inverse-startup-data.ts";
import type { CurrentFootprintInverseStartupData } from "./current-footprint-inverse-startup-data.ts";
import { requireOriginalCurrentFootprintSavedFlowCacheInput, requireOriginalCurrentFootprintSavedFlowCachePlan } from "./current-footprint-saved-flow-cache-plan.ts";
import type { CurrentFootprintSavedFlowCachePlan } from "./current-footprint-saved-flow-cache-plan.ts";

export interface CurrentFootprintInverseStartupPlan{readonly profile:"private.current-footprint-inverse-startup-plan.v1"}
const issued=new WeakMap<CurrentFootprintInverseStartupPlan,Readonly<{prepared:CurrentFootprintForwardSavedCheckpoint;flow:CurrentFootprintSavedFlowCachePlan;input:ReturnType<typeof requireOriginalCurrentFootprintSavedFlowCacheInput>;data:CurrentFootprintInverseStartupData;cold:CurrentFootprintInverseColdLoadData;coldText:string;text:string}>>();
const pending=new WeakMap<CurrentFootprintSavedFlowCachePlan,Promise<CurrentFootprintInverseStartupPlan>>();
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_STARTUP_ORIGINAL");}}
export function prepareCurrentFootprintInverseStartupPlan(flow:CurrentFootprintSavedFlowCachePlan,prepared:CurrentFootprintForwardSavedCheckpoint):Promise<CurrentFootprintInverseStartupPlan>{
  const source=requireOriginalCurrentFootprintSavedFlowCachePlan(flow,prepared);const input=requireOriginalCurrentFootprintSavedFlowCacheInput(flow,prepared),prior=requireOriginalCurrentFootprintForwardSavedCheckpoint(prepared);
  const old=pending.get(flow);if(old!==undefined){return old;}
  const current=():void=>{need(requireOriginalCurrentFootprintSavedFlowCachePlan(flow,prepared)===source&&requireOriginalCurrentFootprintSavedFlowCacheInput(flow,prepared)===input&&requireOriginalCurrentFootprintForwardSavedCheckpoint(prepared).inventory===prior.inventory);};
  const promise=(async():Promise<CurrentFootprintInverseStartupPlan>=>{current();await verifyCurrentFootprintForwardSavedCheckpoint(prepared);current();
    const data=deriveCurrentFootprintInverseStartupData(input);const cold=deriveCurrentFootprintInverseColdLoadData(input,source,prior.inventory);const target=currentFootprintCopyV2SavedTarget(prior.projection);const copied=data.documentFamilies.find(row=>row.uuid===target.footprintUuid);
    need(data.projectUuid===target.projectUuid&&data.branchUuid===target.branchUuid&&copied!==undefined&&copied.families.length===1&&copied.families[0]?.docType==="FOOTPRINT"&&copied.families[0].rawRows>0);
    await verifyCurrentFootprintForwardSavedCheckpoint(prepared);current();const plan:CurrentFootprintInverseStartupPlan=Object.freeze({profile:"private.current-footprint-inverse-startup-plan.v1"});issued.set(plan,Object.freeze({prepared,flow,input,data,cold,coldText:canonicalJson(cold),text:canonicalJson(data)}));return plan;
  })();pending.set(flow,promise);return promise;
}
export function requireOriginalCurrentFootprintInverseStartupPlan(plan:CurrentFootprintInverseStartupPlan,flow:CurrentFootprintSavedFlowCachePlan,prepared:CurrentFootprintForwardSavedCheckpoint):CurrentFootprintInverseStartupData{
  const original=issued.get(plan);need(original!==undefined&&original.prepared===prepared&&original.flow===flow&&original.input===requireOriginalCurrentFootprintSavedFlowCacheInput(flow,prepared)&&original.text===canonicalJson(original.data));return original.data;
}
/** Same private original startup/input/inventory references; these expected
 * native bytes do not reconstruct a prior worker or grant a continuation. */
export function requireOriginalCurrentFootprintInverseColdLoadData(plan:CurrentFootprintInverseStartupPlan,flow:CurrentFootprintSavedFlowCachePlan,prepared:CurrentFootprintForwardSavedCheckpoint):CurrentFootprintInverseColdLoadData{
  requireOriginalCurrentFootprintInverseStartupPlan(plan,flow,prepared);const original=issued.get(plan);need(original!==undefined&&original.coldText===canonicalJson(original.cold));return original.cold;
}
export interface CurrentFootprintInverseStartupPlanModule{
  readonly requireOriginalCurrentFootprintInverseColdLoadData:typeof requireOriginalCurrentFootprintInverseColdLoadData;
  readonly prepareCurrentFootprintInverseStartupPlan:typeof prepareCurrentFootprintInverseStartupPlan;
  readonly requireOriginalCurrentFootprintInverseStartupPlan:typeof requireOriginalCurrentFootprintInverseStartupPlan;
}
