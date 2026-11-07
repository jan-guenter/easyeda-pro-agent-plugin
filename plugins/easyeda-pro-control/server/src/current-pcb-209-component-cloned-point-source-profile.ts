/** Separate cloned-tE point catalogue. The original rE/290 contract stays
 * unchanged. Five restored getters/hit methods consume five query slots. */
import { CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PLANS as PLANS, CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES as PROFILES } from "./current-pcb-209-component-point-complete-source-profile.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_OMITTED_PAD_KEYS as RESTORED } from "./current-pcb-209-component-point-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PLANS as PAD_PLANS, CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES as PAD_PROFILES } from "./current-pcb-209-spatial-pad-source-profile.ts";

const restored = new Set<string>(RESTORED);
export const CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PROFILES = Object.freeze([...PROFILES, ...PAD_PROFILES.filter(row => restored.has(row.key))]);
export const CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PLANS = Object.freeze([...PLANS, ...PAD_PLANS.filter(row => restored.has(row.key))]);
export const CURRENT_PCB_209_COMPONENT_CLONED_POINT_MAXIMUM_READS = 11;
export function deriveCurrentPcb209ComponentClonedPointBudget(input: unknown): Readonly<{ calleeProperties: number; reads: number; spatialStage: number; fullWorkflow: number; nativePurposeIssued: false }> {
 if (typeof input !== "number" || !Number.isInteger(input) || input < 1 || input > CURRENT_PCB_209_COMPONENT_CLONED_POINT_MAXIMUM_READS) { throw new Error("PCB209_COMPONENT_CLONED_QUERY_BUDGET"); }
 const calleeProperties = CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PROFILES.length, spatialStage = 7 + 1 + 1 + calleeProperties + input + 1;
 if (calleeProperties !== 295 || new Set(CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PROFILES.map(row => row.key)).size !== calleeProperties || CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PLANS.length !== calleeProperties || spatialStage + 103 > 419) { throw new Error("PCB209_COMPONENT_CLONED_CATALOGUE"); }
 return Object.freeze({ calleeProperties, reads: input, spatialStage, fullWorkflow: 103 + spatialStage, nativePurposeIssued: false });
}
