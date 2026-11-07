/** Same original compressed TEXT node, before the actual changed-head du call.
 * This fixed readonly program runs no parser and grants no continuation. */
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM } from "./current-pcb-via-replay-program.ts";
import { CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS } from "./current-pcb-via-save-programs.ts";

function one(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("RELEVANCE_REPLAY_FIXED_ANCHOR"); }
  return source.replace(before, after);
}
const guards = one(CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS, 'own(project,"pcb")', 'own(project,"sheet")').replaceAll("PCB_VIA_SAVE_RELATION", "RELEVANCE_SAVE_RELATION");
let program = one(CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM, CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS, guards);
program = one(program, 'own(currentHead,"docType")!=="PCB"', 'own(currentHead,"docType")!=="SCH_PAGE"');
program = one(program, 'own(doc,"docType")!=="PCB"', 'own(doc,"docType")!=="SCH_PAGE"');
program = one(program, 'own(via,"type")!=="VIA"', 'own(via,"type")!=="TEXT"');
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_REPLAY_NO_PUBLICATION_PROGRAM = program;
