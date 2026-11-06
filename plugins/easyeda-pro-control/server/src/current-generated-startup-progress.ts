/** Readonly guidance from the original private cursors. These snapshots cannot
 * issue an owner, resume, action, SQL, Save or completed-frontier capability. */
export interface CurrentGeneratedInitialCacheProgress {
  readonly jobs: number; readonly acknowledgedResumes: number; readonly allCallsResumed: boolean;
  readonly settlementPasses: number; readonly canSettle: boolean; readonly completed: boolean; readonly failed: boolean;
}
export interface CurrentGeneratedInitialSyncProgress {
  readonly acknowledgedResumes: number; readonly settlementPasses: number;
  readonly canSettle: boolean; readonly completed: boolean; readonly failed: boolean;
}
export interface CurrentGeneratedPeriodicSyncProgress {
  readonly completedCalls: number; readonly active: boolean; readonly settlementPasses: number;
  readonly canSettle: boolean; readonly failed: boolean;
}
export interface CurrentGeneratedStartupProgress {
  readonly initialCache: CurrentGeneratedInitialCacheProgress | null;
  readonly initialSync: CurrentGeneratedInitialSyncProgress | null;
  readonly periodicSync: CurrentGeneratedPeriodicSyncProgress | null;
  readonly executionAuthorized: false;
}
