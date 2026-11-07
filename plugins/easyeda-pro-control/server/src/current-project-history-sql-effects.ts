/** Inert observed fields for complete closed-SQL comparison. Original owner
 * registries, never this structural value, issue history-completion tokens. */
export type CurrentProjectHistorySqlSlot = "data" | "head" | "branch" | "commit" | "project";
export interface CurrentProjectHistorySqlNativeCallback {
  readonly slot: CurrentProjectHistorySqlSlot; readonly changes: number; readonly lastID: number;
  readonly beforeEpochMs: number; readonly afterEpochMs: number;
}
export interface CurrentProjectHistorySqlEffects {
  readonly schema: "private.current-project-history-sql-effects.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly initialLogicalSha256: string;
  readonly mode: "append" | "mutable"; readonly historyUuid: string; readonly parentHistoryUuid: string;
  readonly keyHex: string; readonly chunkUuid: string; readonly dataBase64: string;
  readonly plaintextSha256: string; readonly bodySha256: string; readonly historyNum: 0 | 1;
  readonly actor: Readonly<{ uuid: string; username: string; nickname: string; updateTime: number }>;
  readonly projectUpdatedAt: string; readonly projectModifierUuid: string;
  readonly nativeCallbacks: readonly CurrentProjectHistorySqlNativeCallback[];
  readonly originalServiceAwaitCompleted: true; readonly selectedSqlStillFenced: true;
}
