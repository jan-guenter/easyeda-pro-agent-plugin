/** Original SCH Main reservation only. This token preserves the same early
 * selected-file fence and durable modify intent; it grants no SQL or setter. */
export interface CurrentSchematicDisplayPreModifyMainOrigin { readonly profile: "private.current-schematic-display-pre-modify-main-origin.v1" }
export interface CurrentSchematicDisplayPreModifyMainBindings {
  readonly originalSelectedFileMainRetained: true;
  readonly originalUnspentModifyIntentRetained: true;
  readonly selectedFileMutationsStillHeld: true;
  readonly actionHistoryQualified: false;
  readonly selectedSqlAuthorized: false;
  readonly saveAuthorized: false;
  readonly assertCurrent: () => Promise<void>;
}
