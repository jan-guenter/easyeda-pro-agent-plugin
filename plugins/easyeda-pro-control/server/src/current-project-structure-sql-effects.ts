/** Inert observed values for complete closed-SQL comparison. Only original
 * owner registries may issue worker/body/publication continuations. */
export interface CurrentProjectStructureSqlEffects {
  readonly schema: "private.current-project-structure-sql-effects.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly initialLogicalSha256: string;
  readonly previousTicket: 1; readonly previousStructureText: string;
  readonly ticket: number; readonly structureText: string; readonly selectedRows: 1;
  readonly nativeChanges: 1; readonly nativeLastID: number; readonly nativeBeforeEpochMs: number; readonly nativeAfterEpochMs: number;
  readonly originalServiceAwaitCompleted: true; readonly originalControllerBodyVerified: true;
  readonly originalResponseFinalizerReturned: true; readonly selectedSqlStillFenced: true;
}
