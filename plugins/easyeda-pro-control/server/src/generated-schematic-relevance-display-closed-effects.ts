/** Original completed Save/SQL data retained after original root/Job closure.
 * This historical packet carries neither a live continuation nor a reopen grant. */
import type { GeneratedSchematicRelevanceDisplaySaveDelta } from "./generated-schematic-relevance-display-native-save.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";

export interface GeneratedSchematicRelevanceDisplayClosedEffects {
  readonly schema: "private.generated-schematic-relevance-display-closed-effects.v1";
  readonly body: GeneratedSchematicRelevanceDisplaySaveDelta;
  readonly history: CurrentProjectHistorySqlEffects;
  readonly structure: CurrentProjectStructureSqlEffects;
  readonly workerClock: number;
  readonly originalSaveAttemptRetained: true;
  readonly originalSaveAcknowledgementRetained: true;
  readonly originalRootAndJobClosureRetained: true;
  readonly liveContinuationAuthorized: false;
}
