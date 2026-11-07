/** Original fresh-reader source custody. Its data cannot authorize a writer,
 * selected SQL mutation, final project resume or a replacement generation. */
import type { CurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaSavedLoadPlan } from "./current-pcb-via-saved-load-plan.ts";
import type { CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";

export interface CurrentPcbViaSavedLoadOrigin { readonly profile: "private.current-pcb-via-saved-load-origin.v1" }
export interface CurrentPcbViaSavedLoadBindings {
  readonly prepared: CurrentPcbViaWriteClosedCheckpoint; readonly plan: CurrentPcbViaSavedLoadPlan;
  readonly sessionId: string; readonly targetId: string; readonly source: CurrentPcbViaSavedLoadProjectSourceHeld;
  readonly assertCurrent: () => Promise<void>; readonly projectInitialSourceRemainsPaused: true;
  readonly actualNativeLoadingVerified: false; readonly reopenedVerified: false;
}
