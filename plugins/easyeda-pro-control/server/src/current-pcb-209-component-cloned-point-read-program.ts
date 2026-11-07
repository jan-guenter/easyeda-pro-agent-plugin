/** Separate direct cloned-Pad scene. The pinned lC clone2Template has both
 * rE and tE branches; this reader never treats one class as the other. */
import { CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION as ORIGINAL } from "./current-pcb-209-component-point-read-program.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_COLLECTOR as FUNCTIONS } from "./current-pcb-209-component-point-capture.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_GUARDS as GUARDS } from "./current-pcb-209-component-point-kernel.ts";
import { CURRENT_PCB_209_COMPONENT_CLONED_POINT_FUNCTION_COLLECTOR as CLONED_FUNCTIONS } from "./current-pcb-209-component-cloned-point-capture.ts";

function replace(source: string, before: string, after: string): string { if (source.split(before).length !== 2) { throw new Error("COMPONENT_CLONED_POINT_ANCHOR"); } return source.replace(before, after); }
function section(source: string, start: string, end: string, replacement: string): string {
 const at = source.indexOf(start), stop = source.indexOf(end, at);
 if (at === -1 || stop <= at || source.includes(start, at + start.length) || source.includes(end, stop + end.length)) { throw new Error("COMPONENT_CLONED_POINT_SECTION"); }
 return source.slice(0, at) + replacement + source.slice(stop);
}
let guards = section(GUARDS, "const templatePad=", "const Li=", `const plainPad=(model,wanted,template)=>{instance(model,"tE");retainData(model);if(template){optionalEmpty(model,"_stateWatcher");if(parentOf(model)!==null||uint(own(model,"_dataState"))!==5202)bad();}if(own(model,"modelType")!=="Pad"||own(model,"_globalIndex")!==wanted||own(model,"_layerId")!==1||own(model,"_locked")!==false||own(model,"_padType")!==0||own(model,"_type")!==1||own(model,"_plated")!==false||num(own(model,"_rotation"))!==0)bad();noPartition(model);origin(own(model,"_center"));const style=instance(own(model,"_top"),"tC");retainData(style);if(own(style,"type")!=="ELLIPSE"||own(style,"width")!==20||own(style,"height")!==20)bad();for(const k of["_bottom","_inner","_hole"])optionalEmpty(model,k);if(list(own(model,"_unusedInnerLayers"))!==0)bad();bounds(own(model,"_bbox"));return model;};const templatePad=model=>plainPad(model,own(expected,"padId"),true);
`);
guards = section(guards, "const pad=", "const attribute=", `const pad=(value,layer)=>{instance(value,"Mi");absent(value,"_smartPad");const model=plainPad(own(value,"model"),own(expected,"ownedPadId"),false);if(own(model,"_stateWatcher")!==value||![0,5202].includes(uint(own(model,"_dataState")))||(uint(own(value,"_dataState"))&4)!==0)bad();absent(model,"_model");if(padView!==null||layer!==1)bad();const b=bounds(own(model,"_bbox"));padView=value;padModel=model;register(value,model,"Pad",b,own(expected,"ownedPadId"));};
`);
let program = replace(ORIGINAL, GUARDS, guards);
program = replace(program, FUNCTIONS, CLONED_FUNCTIONS);
program = replace(program, "list(functions,290)", "list(functions,295)");
program = replace(program, 'schema:"easyeda-pro-control.pcb209-spatial-component-point-read.v1"', 'schema:"easyeda-pro-control.pcb209-component-cloned-point.v1"');
program = replace(program, 'scope:"generated-top-origin-component-owned-circular-pad-hidden-attrs-ready-point-scene"', 'scope:"generated-component-cloned-pad-point-scene",templateGeometryMatched:true,templateReferenceLinked:false,cloneModelState:own(padModel,"_dataState")');
export const CURRENT_PCB_209_COMPONENT_CLONED_POINT_READ_FUNCTION = program;
