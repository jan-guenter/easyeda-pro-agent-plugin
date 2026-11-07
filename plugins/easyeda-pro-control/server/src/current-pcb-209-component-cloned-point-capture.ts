/** Fixed alternate collector. It restores the five tE sites which the rE
 * path cannot enter, without altering that existing collector or catalogue. */
import { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION as BINDINGS, CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_COLLECTOR as ORIGINAL } from "./current-pcb-209-component-point-capture.ts";
import { CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_PLANS as PLANS } from "./current-pcb-209-component-cloned-point-source-profile.ts";

const plans = PLANS.map(plan => {
 let accessor = 0; if ("getter" in plan && plan.getter) { accessor = 1; } else if ("setter" in plan && plan.setter) { accessor = 2; }
 return [plan.role, ["class", "function", "field", "prototype", "static"].indexOf(plan.target), "property" in plan ? plan.property : null, accessor];
});
const begin = "for(const[role,target,property,accessor]of ", end = "){const owner=";
const start = ORIGINAL.indexOf(begin), stop = ORIGINAL.indexOf(end, start);
if (start === -1 || stop <= start || ORIGINAL.includes(begin, start + begin.length) || ORIGINAL.includes(end, stop + end.length) || BINDINGS.split(ORIGINAL).length !== 2) { throw new Error("COMPONENT_CLONED_CAPTURE_ANCHOR"); }
export const CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_COLLECTOR = ORIGINAL.slice(0, start + begin.length) + JSON.stringify(plans) + ORIGINAL.slice(stop);
export const CURRENT_PCB_209_COMPONENT_CLONED_POINT_BINDINGS_FUNCTION = BINDINGS.replace(ORIGINAL, CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_COLLECTOR);
