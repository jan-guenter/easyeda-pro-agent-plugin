/** Separate Wire scene projection. The immutable Text/v3 raw programs keep
 * their historical eight-row tree contract. Wire capture has six persistent
 * rows and two separately retained derived markers. No scene object is made. */
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM as BASE, CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM as SNAPSHOT } from "./current-schematic-relevance-action-raw-programs.ts";

function once(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH209_WIRE_SCENE_RAW_ANCHOR"); } return source.replace(before, after);
}
const oldGuard = '!isArray(tree)||own(tree,"length")!==8||keys(tree).length!==9';
const oldModels = 'const result=[own(before,"rootModel")];for(let i=0;i<8;i++)result[result.length]=own(own(tree,i),"model");';
const newModels = 'const markers=own(before,"markers");if(!isArray(markers)||own(markers,"length")!==2||keys(markers).length!==3)bad();const result=[own(before,"rootModel")];for(let i=0;i<6;i++)result[result.length]=own(own(tree,i),"model");for(let i=0;i<2;i++){const marker=own(markers,i);for(let j=0;j<result.length;j++)if(result[j]===marker)bad();result[result.length]=marker;}';
export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_REFERENCES = once(once(BASE, oldGuard, '!isArray(tree)||own(tree,"length")!==6||keys(tree).length!==7'), oldModels, newModels);

/** The two original export namespaces can contain accessor descriptors.
 * Preserve those complete descriptors as opaque references, without invoking
 * either getter/setter. Every model and other primary accessor still refuses. */
export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_SNAPSHOT = once(SNAPSHOT, 'if(i<objects&&!has(d,"value"))bad();', 'if(i<objects&&!has(d,"value")&&value!==own(this,20)&&value!==own(this,21))bad();');
