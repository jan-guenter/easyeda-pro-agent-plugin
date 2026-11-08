/** Phase-specific fixed seven-record programs. The shared stage remains exact
 * for the separate Wire owner. No supplied callback or setter table is accepted. */
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as BASE } from "./generated-schematic-relevance-display-program.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_REPLACEMENT} from "./current-schematic-relevance-sdk-gate-template.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const oldCallback = 'async()=>{ownedAction=b.runner.currentAction;check();same(before,capture(operation.beforeBody));for(const[field,value]of changes){check();const binding=b.setters[field];if(binding.object!==before.text)bad("TEXT_RECEIVER");reproveSetter(binding);apply(binding.set,before.text,[value]);}check();}';
/** Each debugger marker belongs to this complete fixed program. A separate
 * Original active-action collector must authorize every continuation. Each
 * direct property read is checked while the preceding actual marker is held. */
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK = `async()=>{const originalContext=[tuple,b,state,before,changes,target,operation];debugger;try{ownedAction=b.runner._currentAction;if(ownedAction===null||typeof ownedAction!=="object")throw{reason:"SCH209_CALLBACK_ACTIVE_ACTION"};for(let originalIndex=0;originalIndex<changes.length;originalIndex++){debugger;const originalChange=changes[originalIndex],originalBinding=b.setters[originalChange[0]];if(originalBinding.object!==before.text)throw "SCH209_CALLBACK_TEXT_RECEIVER";apply(originalBinding.set,before.text,[originalChange[1]]);}debugger;}catch(originalError){debugger;throw originalError;}}`;
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_REPLACEMENTS = freezeDeep([['b={ui,host,sch,tabs,', 'b={root,ui,host,sch,tabs,']] as const);
/** The original callback joins the retained capture-stage receipt. A fresh
 * source capture reproves that same baseline before the run; it must not
 * replace the receipt identity consumed by the original raw/entry collectors. */
const oldModifyBaseline = 'const before=capture(operation.beforeBody);same(state.before,before);';
const retainedModifyBaseline = 'const before=state.before;same(before,capture(operation.beforeBody));';
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_REPLACEMENTS = freezeDeep([[oldModifyBaseline, retainedModifyBaseline], [oldCallback, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK],
  ['{history:true,name:"Codex disposable Text display"}', '{history:true,name:"Codex disposable Text display",timeout:0,dependencies:[]}'],CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_REPLACEMENT] as const);
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
if (offsets.length !== markerRoles.length+2) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_MARKERS"); }
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS = freezeDeep(markerRoles.map((role, index) => {
  const offset = offsets[index]; if (offset === undefined) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_MARKER"); }
  const prefix = originalScript.slice(0, offset); return { role, lineNumber: prefix.split("\n").length - 1, columnNumber: prefix.length - prefix.lastIndexOf("\n") - 1 };
}));
