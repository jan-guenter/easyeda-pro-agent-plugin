/** Historical data issued only by the original Via Core after observed
 * original termination. It carries no live worker/SQL continuation lease. */
import type { CurrentPcbViaPendingSaveDelta } from "./current-pcb-via-save-delta.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";

export interface CurrentPcbViaWriteClosedEffects {
  readonly schema:"private.current-pcb-via-write-closed-effects.v1";
  readonly body:CurrentPcbViaPendingSaveDelta;
  readonly history:CurrentProjectHistorySqlEffects;
  readonly structure:CurrentProjectStructureSqlEffects;
  readonly workerClock:number;
  readonly originalSaveAttemptRetained:true;
  readonly originalRootAndJobClosureRetained:true;
  readonly liveContinuationAuthorized:false;
}
