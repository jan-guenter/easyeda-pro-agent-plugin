/** Phase-specific fixed seven-record programs. The shared stage remains exact
 * for the separate Wire owner. No supplied callback or setter table is accepted. */
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as BASE } from "./generated-schematic-relevance-display-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const oldCallback = 'async()=>{ownedAction=b.runner.currentAction;check();same(before,capture(operation.beforeBody));for(const[field,value]of changes){check();const binding=b.setters[field];if(binding.object!==before.text)bad("TEXT_RECEIVER");reproveSetter(binding);apply(binding.set,before.text,[value]);}check();}';
/** Each debugger marker belongs to this complete fixed program. A separate
 * original active-action collector must authorize every continuation. Until
 * then run remains held, and no originalAction property can be installed. */
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK = `async()=>{const originalContext=[tuple,b,state,before,changes,target,operation];debugger;try{const originalAction=own(state,"originalAction");ownedAction=apply(originalAction,undefined,["enter",originalContext]);for(let originalIndex=0;originalIndex<changes.length;originalIndex++){debugger;apply(originalAction,undefined,["set",originalContext,ownedAction,originalIndex]);}debugger;apply(originalAction,undefined,["leave",originalContext,ownedAction,changes.length]);}catch(originalError){debugger;throw originalError;}}`;
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_REPLACEMENTS = freezeDeep([['b={ui,host,sch,tabs,', 'b={root,ui,host,sch,tabs,']] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_REPLACEMENTS = freezeDeep([[oldCallback, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK],
  ['{history:true,name:"Codex disposable Text display"}', '{history:true,name:"Codex disposable Text display",timeout:0,dependencies:[]}']] as const);
export function replaceCurrentSchematicRelevanceDisplayPhase(source: string, replacements: readonly (readonly [string, string])[]): string {
  let result = source;
  for (const [before, after] of replacements) { if (result.split(before).length !== 2) { throw new Error("SCHEMATIC_RELEVANCE_PHASE_PROGRAM_ANCHOR"); } result = result.replace(before, after); }
  return result;
}
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_FUNCTION = replaceCurrentSchematicRelevanceDisplayPhase(BASE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_REPLACEMENTS);
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION = replaceCurrentSchematicRelevanceDisplayPhase(BASE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_REPLACEMENTS);
/** Exact debugger statements in the original Runtime-compiled Modify wrapper.
 * Locations are selectors only; the actual owner must join its original script. */
const originalScript = `(${CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION})`;
const markerRoles = ["entry", "setter", "finish", "failure"] as const;
const offsets = [...originalScript.matchAll(/debugger;/gu)].map(match => match.index);
if (offsets.length !== markerRoles.length) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_MARKERS"); }
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS = freezeDeep(markerRoles.map((role, index) => {
  const offset = offsets[index]; if (offset === undefined) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_MARKER"); }
  const prefix = originalScript.slice(0, offset); return { role, lineNumber: prefix.split("\n").length - 1, columnNumber: prefix.length - prefix.lastIndexOf("\n") - 1 };
}));
