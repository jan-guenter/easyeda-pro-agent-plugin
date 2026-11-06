/** Original central registries alone issue these tokens. No matching JSON,
 * source snapshot, elapsed delay or SDK acknowledgement can create custody. */
export interface CurrentPcbViaSaveProducerPrefix { readonly profile: "private.current-pcb-via-save-producer-prefix.v1" }
export interface CurrentSchematicDisplaySaveProducerPrefix { readonly profile: "private.current-schematic-display-save-producer-prefix.v1" }
export type CurrentProjectSaveProducerPrefix = CurrentPcbViaSaveProducerPrefix | CurrentSchematicDisplaySaveProducerPrefix;
export interface CurrentProjectSaveProducerPrefixBindings {
  readonly originalGuardsArmedBeforeAction: true;
  readonly originalNonprivateBootstrapObserved: true;
  readonly unexpectedProducerCannotProceed: true;
  readonly plannedProducerContinuationAuthorized: false;
  readonly completeUploadFrontierVerified: false;
  readonly assertCurrent: () => Promise<void>;
}
