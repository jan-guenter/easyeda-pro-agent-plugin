/** Distinct SCH_PAGE/TEXT joins over the actual shared saveCanvas source.
 * Reuses fixed inert syntax only; no Via plan, origin or native lease moves. */
import { CURRENT_PCB_VIA_SAVE_CALLS as BASE } from "./current-pcb-via-save-programs.ts";
import { CURRENT_PROJECT_CANVAS_PENDING_CAPTURE as PENDING } from "./current-project-canvas-pending-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_DISPLAY_SAVE_GROUP = "easyeda-pro-control-schematic-display-save-v1";
function one(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_SAVE_PROGRAM_ANCHOR"); } return source.replace(before, after);
}
function program(role: keyof typeof BASE): string {
  let source = BASE[role].replaceAll("PCB_VIA_SAVE_RELATION", "SCHEMATIC_DISPLAY_SAVE_RELATION");
  /* The exact current shared v2 program already owns pending-node capture,
   * phase reproof and source-derived effective user projection. Refuse an old
   * or independently changed helper instead of applying a second augmentation. */
  source = one(source, PENDING, PENDING);
  source = one(source, "const retained=(original,stage)=>", "const retained=(original,stage)=>");
  const receiver = 'own(project,"pcb")';
  if (source.split(receiver).length !== (role === "entry" ? 3 : 2)) { throw new Error("SCHEMATIC_DISPLAY_SAVE_RECEIVER_ANCHOR"); }
  source = source.replaceAll(receiver, 'own(project,"sheet")');
  if (role === "entry") { source = one(source, 'capturePending(r,arg,documentUuid,"PCB","VIA")', 'capturePending(r,arg,documentUuid,"SCH_PAGE","TEXT")'); }
  if (role === "value") { source = one(source, 'schema:"private.current-pcb-via-save-body-value.v2"', 'schema:"private.generated-schematic-display-save-body-value.v2"'); }
  return source;
}
export const CURRENT_SCHEMATIC_DISPLAY_SAVE_CALLS = freezeDeep({ entry: program("entry"), clock: program("clock"), compress: program("compress"), body: program("body"), value: program("value"), result: program("result") });
