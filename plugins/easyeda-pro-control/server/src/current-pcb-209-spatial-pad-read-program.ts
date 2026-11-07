/** A fixed new declaration derived from the maintained point scaffold. Every
 * replacement is module-owned and unique; callers supply only bounded points.
 * Prior Via/Line/Arc program bytes and result contracts remain unchanged. */
import { CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR, CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR } from "./current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION } from "./current-pcb-209-spatial-read-program.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_BINDING_COLLECTOR, CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_COLLECTOR } from "./current-pcb-209-spatial-pad-capture.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_GUARDS } from "./current-pcb-209-spatial-pad-kernel.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES } from "./current-pcb-209-spatial-pad-source-profile.ts";

function replaceOnce(source: string, expected: string, replacement: string): string {
  const index = source.indexOf(expected); if (index === -1 || source.includes(expected, index + expected.length)) { throw new Error("PCB209_SPATIAL_PAD_SCAFFOLD"); }
  return source.slice(0, index) + replacement + source.slice(index + expected.length);
}
function program(): string {
  let source = replaceOnce(CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR, CURRENT_PCB_209_SPATIAL_PAD_BINDING_COLLECTOR);
  source = replaceOnce(source, CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR, CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_COLLECTOR);
  source = replaceOnce(source, 'object(query);const kind=own(query,"kind");', 'object(query);const kind=own(query,"kind");if(kind!=="point")bad();');
  source = replaceOnce(source, 'list(functions,256)', `list(functions,${String(CURRENT_PCB_209_SPATIAL_PAD_FUNCTION_PROFILES.length)})`);
  source = replaceOnce(source, 'scene.push({value,model,primitiveId,family:"Via"});};', `scene.push({value,model,primitiveId,family:"Via"});};${CURRENT_PCB_209_SPATIAL_PAD_GUARDS}`);
  source = replaceOnce(source, 'for(const [family,layerGroups]of groups){if(family!=="Via")bad();for(const [layer,tree]of entries(layerGroups,1)){if(layer!==12)bad();instance(tree,"Nd");',
    'for(const [family,layerGroups]of groups){if(family!=="Pad")bad();for(const [layer,tree]of entries(layerGroups,2)){if(![1,2].includes(layer)||!Object.hasOwn(layerMap,String(layer)))bad();instance(tree,"Nd");');
  source = replaceOnce(source, 'for(const item of items)via(item);', 'for(const item of items)pad(item,layer);');
  source = replaceOnce(source, 'schema:"easyeda-pro-control.pcb209-spatial-via-read.v1"', 'schema:"easyeda-pro-control.pcb209-spatial-pad-point-read.v1"');
  source = replaceOnce(source, 'sceneViaCount:scene.length', 'scenePadCount:scene.length');
  return replaceOnce(source, 'scope:"standalone-via-ready-bbox-scene-no-region-border-crossings"', 'scope:"standalone-circular-pad-ready-point-scene"');
}
export const CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION = program();
