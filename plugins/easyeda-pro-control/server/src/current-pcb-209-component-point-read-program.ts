/** Component-only fixed point program; hidden ATTRs stay in the exact native
 * index and their qualified no-graphics refusal path is never pruned. */
import { CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR, CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR } from "./current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_SELECTION_PROGRAM } from "./current-pcb-209-spatial-read-program.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_BINDING_COLLECTOR, CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_COLLECTOR } from "./current-pcb-209-component-point-capture.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_GUARDS } from "./current-pcb-209-component-point-kernel.ts";
import { CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES } from "./current-pcb-209-component-point-complete-source-profile.ts";

function replace(source: string, before: string, after: string): string { if (source.split(before).length !== 2) { throw new Error("COMPONENT_POINT_SCAFFOLD"); } return source.replace(before, after); }
function build(): string {
  let source = replace(CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR, CURRENT_PCB_209_COMPONENT_POINT_BINDING_COLLECTOR);
  source = replace(source, CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR, CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_COLLECTOR);
  source = replace(source, 'object(query);const kind=own(query,"kind");', 'object(query);const kind=own(query,"kind");if(kind!=="point")bad();');
  source = replace(source, 'record(this,["scope","originalCallback","bindings","functions"]);', 'record(this,["scope","originalCallback","bindings","functions","expectedScene"]);');
  source = replace(source, 'list(functions,256)', `list(functions,${String(CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PROFILES.length)})`);
  source = replace(source, 'const groups=entries(own(spatial,"map"),1)', 'const groups=entries(own(spatial,"map"),3)');
  const start = source.indexOf('const via=value=>{'); const end = source.indexOf('for(const [family,layerGroups]of groups)', start);
  if (start === -1 || end === -1) { throw new Error("COMPONENT_POINT_SCAFFOLD"); }
  source = source.slice(0, start) + CURRENT_PCB_209_COMPONENT_POINT_GUARDS + source.slice(end);
  source = replace(source, 'for(const [family,layerGroups]of groups){if(family!=="Via")bad();for(const [layer,tree]of entries(layerGroups,1)){if(layer!==12)bad();instance(tree,"Nd");',
    'for(const [family,layerGroups]of groups){if(!["Component","Pad","Text"].includes(family))bad();for(const [layer,tree]of entries(layerGroups,1)){if(layer!==(family==="Text"?3:1)||!Object.hasOwn(layerMap,String(layer)))bad();instance(tree,"Nd");');
  source = replace(source, 'for(const item of items)via(item);', 'for(const item of items){if(family==="Component")component(item,layer);else if(family==="Pad")pad(item,layer);else attribute(item,layer);}');
  source = replace(source, CURRENT_PCB_209_SPATIAL_SELECTION_PROGRAM, `finishScene();${CURRENT_PCB_209_SPATIAL_SELECTION_PROGRAM}if(list(selected)!==0)bad();`);
  source = replace(source, 'if(!entry||seen.has(entry.primitiveId))bad();', 'if(!entry||entry.family==="HiddenAttribute"||seen.has(entry.primitiveId))bad();');
  source = replace(source, 'schema:"easyeda-pro-control.pcb209-spatial-via-read.v1"', 'schema:"easyeda-pro-control.pcb209-spatial-component-point-read.v1"');
  source = replace(source, '// Class/static and prototype descriptors are retained across both native calls.\n// The outer runner separately qualifies these original functions against source.\n', '');
  source = replace(source, '// Ll/pe build local rectangle geometry through these two shared math workers.\n// Their exact source-derived scratch writes do not enter a CAD model, index,\n// selection manager, event bus, worker, timer, parser or persistence service.\n', '');
  // Regions are rejected above. Remove only unreachable program syntax to
  // Retain the existing64KiB physical frame bound; all290 callees stay fixed.
  const regionStart = source.indexOf('let regionBounds=null;if(kind==="region"){');
  const regionEnd = source.indexOf('const scratchFlags=', regionStart);
  if (regionStart === -1 || regionEnd === -1) { throw new Error("COMPONENT_POINT_REGION_SCAFFOLD"); }
  source = `${source.slice(0, regionStart)  }const expectedBounds=[query.xMil/10,query.xMil/10,query.yMil/10,query.yMil/10];\n${  source.slice(regionEnd)}`;
  const inputStart = source.indexOf('if(kind==="point"){record(query,');
  const inputEnd = source.indexOf('retain(query);', inputStart);
  if (inputStart === -1 || inputEnd === -1) { throw new Error("COMPONENT_POINT_REGION_SCAFFOLD"); }
  source = `${source.slice(0, inputStart)  }record(query,["kind","xMil","yMil"]);num(own(query,"xMil"));num(own(query,"yMil"));\n${  source.slice(inputEnd)}`;
  const readStart = source.indexOf('if(kind==="point"){result=apply(own(Hr,"pointSelect")');
  const readEnd = source.indexOf('const rows=project(result);', readStart);
  if (readStart === -1 || readEnd === -1) { throw new Error("COMPONENT_POINT_REGION_SCAFFOLD"); }
  source = `${source.slice(0, readStart)  }result=apply(own(Hr,"pointSelect"),Hr,[query.xMil/10,query.yMil/10]);result=Array.from(apply(own(Object.getPrototypeOf(qt),"filter"),qt,[result]));result=apply(own(Hr,"filterPartiton"),Hr,[result]);\n${  source.slice(readEnd)}`;
  source = replace(source, 'sceneViaCount:scene.length', 'sceneComponentCount:1,scenePadCount:1,sceneHiddenAttributeCount:2');
  return replace(source, 'scope:"standalone-via-ready-bbox-scene-no-region-border-crossings"', 'scope:"generated-top-origin-component-owned-circular-pad-hidden-attrs-ready-point-scene"');
}
export const CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION = build();
