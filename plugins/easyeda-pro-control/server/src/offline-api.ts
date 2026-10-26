import { z } from "zod";
import { queryCurrentFootprintCopyPreparation, validateCurrentFootprintCopyPreparationArguments } from "./current-footprint-copy-preparation-validation.ts";
import { extensionApiCatalogInputSchema, queryExtensionApiCatalog } from "./extension-api-catalog.ts";
import { extensionApiCoverageInputSchema, queryExtensionApiCoverage } from "./extension-api-coverage.ts";
import { publicSdkCatalogQuerySchema, publicSdkValidationQuerySchema, queryPublicSdkReads, validatePublicSdkArguments } from "./public-sdk-catalog.ts";
import { operationCatalogQuerySchema, operationValidationRequestSchema, queryOperationCatalog, validateCatalogOperation } from "./operation-catalog.ts";
import { querySdkMathCalculations, sdkMathCatalogQuerySchema, validateSdkMathArguments } from "./sdk-math.ts";
import { querySdkSystemMethods, sdkSystemCatalogQuerySchema, validateSdkSystemArguments } from "./sdk-system.ts";
import { querySdkPublicReadersMethods, sdkPublicReadersCatalogQuerySchema, validateSdkPublicReadersArguments } from "./sdk-public-readers.ts";
import { netlistFilesCatalogQuerySchema, queryNetlistFiles, validateNetlistFilesArguments } from "./netlist-files.ts";
// oxlint-disable-next-line import/max-dependencies -- This fixed offline router imports each capability's own validator; an intermediary would only hide those dependencies.
import { managedLibraryFilesCatalogQuerySchema, queryManagedLibraryFiles, validateManagedLibraryFilesArguments } from "./managed-library-files.ts";
import { publicSystemFootprintQuerySchema, queryPublicSystemFootprint, validatePublicSystemFootprintArguments } from "./public-system-footprint.ts";
import { publicSystemCatalogQuerySchema, queryPublicSystemCatalog, validatePublicSystemCatalogArguments } from "./public-system-catalog.ts";
import { queryStartupExtensions, startupExtensionsQuerySchema, validateStartupExtensionsArguments } from "./startup-extensions.ts";
import { editorShellQuerySchema, queryEditorShell, validateEditorShellArguments } from "./editor-shell.ts";
import { editorContextQuerySchema, queryEditorContext, validateEditorContextArguments } from "./editor-context.ts";
import { queryShortcutKeys, shortcutKeysQuerySchema, validateShortcutKeysArguments } from "./shortcut-keys.ts";
import { queryOrdinaryLaunch, validateOrdinaryLaunchArguments } from "./ordinary-launch.ts";
import { currentPcbDiagnosticValidationQuerySchema, queryCurrentPcbDiagnosticValidation,
  validateCurrentPcbDiagnosticValidationArguments } from "./current-pcb-diagnostic-validation.ts";
import { queryCurrentPcb209RatlineContinuationValidation, validateCurrentPcb209RatlineContinuationArguments } from "./current-pcb-209-ratline-continuation-validation.ts";
import { queryCurrentPcb209RatlineStartupValidation, validateCurrentPcb209RatlineStartupArguments } from "./current-pcb-209-ratline-startup-validation.ts";
import { queryCurrentPcb209EmptyStartupValidation, validateCurrentPcb209EmptyStartupArguments } from "./current-pcb-209-empty-startup-validation.ts";
import { queryCurrentPcb209WorkerStartupValidation, validateCurrentPcb209WorkerStartupArguments } from "./current-pcb-209-worker-startup-validation.ts";
import { queryCurrentPcb209Opening, validateCurrentPcb209OpeningArguments } from "./current-pcb-209-opening-validation.ts";
import { currentPcbStringPrecreateQuerySchema, queryCurrentPcbStringPrecreate,
  validateCurrentPcbStringPrecreateArguments } from "./current-pcb-string-precreate-validation.ts";
import { currentPcbLayersQuerySchema, queryCurrentPcbLayers, validateCurrentPcbLayersArguments } from "./current-pcb-layers.ts";
import { currentDisposableOpenQuerySchema, queryCurrentDisposableOpen, validateCurrentDisposableOpenArguments } from "./current-disposable-open.ts";
import { currentPcbIdentitiesQuerySchema, queryCurrentPcbIdentities, validateCurrentPcbIdentitiesArguments } from "./current-pcb-identities.ts";
import { currentPcbGeometryQuerySchema, queryCurrentPcbGeometry, validateCurrentPcbGeometryArguments } from "./current-pcb-geometry.ts";
import { currentSymbolMetadataQuerySchema, queryCurrentSymbolMetadata, validateCurrentSymbolMetadataArguments } from "./current-symbol-metadata.ts";
import { currentProjectPcbMetadataQuerySchema, queryCurrentProjectPcbMetadata, validateCurrentProjectPcbMetadataArguments } from "./current-project-pcb-metadata.ts";
import { currentProjectSchematicMetadataQuerySchema, queryCurrentProjectSchematicMetadata, validateCurrentProjectSchematicMetadataArguments } from "./current-project-schematic-metadata.ts";
import { currentProjectBoardMetadataQuerySchema, queryCurrentProjectBoardMetadata, validateCurrentProjectBoardMetadataArguments } from "./current-project-board-metadata.ts";
import { queryCurrentPcbRenamePreflight, validateCurrentPcbRenamePreflightArguments } from "./current-pcb-rename-preflight.ts";
import { currentSymbolOperationQuerySchema, queryCurrentSymbolOperation, validateCurrentSymbolOperationArguments } from "./current-symbol-operation.ts";
import { currentSymbolCopyOperationQuerySchema, queryCurrentSymbolCopyOperation, validateCurrentSymbolCopyOperationArguments } from "./current-symbol-copy-operation.ts";
import { currentPcbRenameOperationQuerySchema, queryCurrentPcbRenameOperation, validateCurrentPcbRenameOperationArguments } from "./current-pcb-rename-operation.ts";
import { currentSchematicRenameOperationQuerySchema, queryCurrentSchematicRenameOperation, validateCurrentSchematicRenameOperationArguments } from "./current-schematic-rename-operation.ts";
import { currentSchematicOperationQuerySchema, queryCurrentSchematicOperation, validateCurrentSchematicOperationArguments } from "./current-schematic-operation.ts";
import { queryCurrentProjectOnlySymbolPreflight, validateCurrentProjectOnlySymbolPreflightArguments } from "./current-project-only-symbol-preflight.ts";
import { currentSymbolMetadataPreparationRequestSchema, prepareCurrentSymbolMetadata, queryCurrentSymbolMetadataPreparation,
  validateCurrentSymbolMetadataPreparationArguments } from "./current-symbol-metadata-preparation.ts";
import { historicalAbandonmentRequestSchema } from "./historical-abandonment.ts";
import { analyzeCurrentSymbolBaseline } from "./current-symbol-baseline-analysis.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";

const ordinaryLaunchQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
const baselineAnalysisRequestSchema = z.object({ operationId: z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u) }).strict();

export const apiRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sdk"), query: extensionApiCatalogInputSchema.optional() }).strict(),
  z.object({ action: z.literal("coverage"), query: extensionApiCoverageInputSchema.optional() }).strict(),
  z.object({ action: z.literal("sdk-reads"), query: publicSdkCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("sdk-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("calculations"), query: sdkMathCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("calculate-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("system"), query: sdkSystemCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("system-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("public-readers"), query: sdkPublicReadersCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("public-readers-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("netlist-files"), query: netlistFilesCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("netlist-files-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("library-files"), query: managedLibraryFilesCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("library-files-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("catalog-footprint"), query: publicSystemFootprintQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("catalog-footprint-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("catalog-components"), query: publicSystemCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("catalog-components-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("extensions"), query: startupExtensionsQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("extensions-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("editor-shell"), query: editorShellQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("editor-shell-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("editor-context"), query: editorContextQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("editor-context-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("shortcuts"), query: shortcutKeysQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("shortcuts-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb-layers"), query: currentPcbLayersQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb-layers-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-open"), query: currentDisposableOpenQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-open-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb-identities"), query: currentPcbIdentitiesQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb-identities-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb-geometry"), query: currentPcbGeometryQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb-geometry-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-symbol"), query: currentSymbolMetadataQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-symbol-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-pcb"), query: currentProjectPcbMetadataQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-pcb-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-schematic"), query: currentProjectSchematicMetadataQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-schematic-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-board"), query: currentProjectBoardMetadataQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-board-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-pcb-preflight"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-pcb-preflight-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-symbol-operation"), query: currentSymbolOperationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-symbol-operation-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("disposable-symbol-copy"), query: currentSymbolCopyOperationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("disposable-symbol-copy-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("disposable-pcb-rename"), query: currentPcbRenameOperationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("disposable-pcb-rename-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("disposable-schematic-rename"), query: currentSchematicRenameOperationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("disposable-schematic-rename-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-schematic-operation"), query: currentSchematicOperationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-schematic-operation-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-symbol-preflight"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-symbol-preflight-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-symbol-preparation"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("project-symbol-prepare-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("project-symbol-prepare"), query: z.object({ request: currentSymbolMetadataPreparationRequestSchema }).strict() }).strict(),
  z.object({ action: z.literal("baseline-analysis"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("baseline-analysis-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("baseline-analyze"), query: z.object({ request: baselineAnalysisRequestSchema }).strict() }).strict(),
  z.object({ action: z.literal("history"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("history-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("launch"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("launch-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb-diagnostic-validation"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb-diagnostic-validation-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb209-opening"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb209-opening-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("footprint-copy-preparation"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("footprint-copy-preparation-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb209-ratline-continuation"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb209-ratline-continuation-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb209-ratline-held-import"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb209-ratline-held-import-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb209-empty-baseline"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb209-empty-baseline-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb209-worker-startup"), query: currentPcbDiagnosticValidationQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb209-worker-startup-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("pcb-string-precreate-validation"), query: currentPcbStringPrecreateQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("pcb-string-precreate-validation-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("operations"), query: operationCatalogQuerySchema }).strict(),
  z.object({ action: z.literal("validate"), query: operationValidationRequestSchema }).strict(),
]);

export const offlineApiToolConfiguration = {
  title: "EasyEDA offline API reference and argument validation",
  description: "Query hash-pinned SDK declarations and exhaustive per-method execution coverage with concrete omission reasons. Retrieve typed design/library, SDK-read, calculation, local-system, extension-metadata, editor-shell, identity-context, shortcut-key, current-PCB-layer/identity/geometry, historical-abandonment, disposable-project-open or ordinary-launch schemas; validate refinements. Query project-board/project-board-validate for raw board UUID/title/order/ticket metadata without editor tabs; no child membership or public item parity. Query project-pcb/project-pcb-validate for one loaded project's PCB metadata without editor tabs; no canvas or saved-state/rename authority. Query project-schematic/project-schematic-validate for one or all loaded schematic containers or sheets with complete observed parent membership and no editor tabs; no canvas, saved-source membership or writer authority. Query project-pcb-preflight/project-pcb-preflight-validate for complete native PCB peer/title availability and client/clock observations, without rename authority. Query project-symbol-preflight for no-editor symbol comparison; supplied expectations are not provenance. Prepare name/description from a hash-bound managed checkpoint with project-symbol-prepare. Query project-symbol-operation/project-symbol-operation-validate for the separate unused project-local symbol forward-only lifecycle and its exact acknowledgements. Complete history must be META-only or satisfy the bounded canvas-segments profile; ordinary purpose reserves exactly one write with no inverse. Installed080000 passed the ordinary unused drawn-symbol forward lifecycle with complete closed SQL, exact reopened content and final closure on a disposable fixture. Query disposable-symbol-copy/disposable-symbol-copy-validate for the separate original-owner disposable-only symbol copy lifecycle; no ordinary-project or generic lib_Symbol.copy support. Query disposable-pcb-rename/disposable-pcb-rename-validate for the separate original-owner disposable PCB title-only lifecycle, with whole-SQL effect and reopened metadata verification; installed195000 passed one complete disposable title-only lifecycle. No complete canvas read, ordinary-project support or current-invocation admission follows from that historical result. Query disposable-schematic-rename/disposable-schematic-rename-validate for the separate original-owner disposable SCH container title-only lifecycle, requiring an original aged unlocked-head clock reference, whole-SQL effect and reopened metadata plus complete child-roster verification. Installed143713 passed the disposable title-only lifecycle; this does not validate later generations or the new ordinary-purpose composition. Query project-schematic-operation/project-schematic-operation-validate for the separate ordinary-project title-only lifecycle with sealed pre-navigation startup and original ownership. Legacy confirmDisposableProject:true is optional at open for old journals; omission stays omitted and false refuses. Installed203733 passed this ordinary-purpose lifecycle on a disposable fixture with batching, complete closed SQL, fresh metadata/peer/child-roster and both AST readback, final normal closure and unchanged full SQL. This historical result grants no current-invocation authority or other-history qualification. The disposable route remains disposable-only. No complete canvas/connectivity read or generic schematic writer is enabled. Compare completed disposable baseline/final snapshots with baseline-analyze; query baseline-analysis first. Query pcb-diagnostic-validation/pcb-diagnostic-validation-validate for a separate original-owner native diagnostic launcher and bounded browser/frame/pinned-script observations plus parent-scoped direct-worker discovery, exact worker-source admission and one fixed side-effect-checked state sample. The diagnostic open-project action requires an exact registered disposable file/checkpoint and empty source-qualified UI; it acknowledges migration/cache/automatic-Save effects, permits only the selected-project same-document transition and does not create a PCB frame. Separately, observe-model-state requires an existing source-qualified PCB frame and returns fixed bounded compiler/custom-footprint/dynamic-copper observations without invoking Save. It is validation-only, not project-free or isolated, and grants no compiler, queue-completion, startup, design execution or saved-state authority. Query pcb209-worker-startup/pcb209-worker-startup-validate for the separate209 original project-worker constructor capture, current assignments/channel and bracketed actor observations; these do not establish complete startup, containment, native clock provenance or writer authority. Query pcb209-empty-baseline/pcb209-empty-baseline-validate for the separate fixed-budget empty-baseline launch under the startup tool wrapper. It binds PCB navigation and common/SQL observations to the original checkpoint and native owner; it grants no full startup or writer authority. Query pcb209-ratline-held-import/pcb209-ratline-held-import-validate for the distinct launch purpose through qualified PCB construction and the first ratline child held before imported execution. It offers no independent Worker/CDP association, subordinate continuation, complete startup, editing or Save. Query pcb209-ratline-continuation/pcb209-ratline-continuation-validate for a separate original-owner launch, all three source-qualified imports and full PCB/worker capture checkpoints; native Worker/CDP identity, callback completion and complete startup remain unproved. Query library-files/library-files-validate for offline metadata from supplied bounded .efoo/.esym/.epanl and .epro/.epro2 files. The separate library_files tool prepares managed inputs with explicit local-artifact confirmation; no SDK or runtime admission, import or geometry validation. Entirely offline: no bridge calls, app launch, design changes, journal writes or execution authority. Preparation and historical equality do not prove current state or qualify startup effects. Declaration and adapter presence do not imply live validation.",
  inputSchema: { request: apiRequestSchema },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
};

type ApiRequest = z.infer<typeof apiRequestSchema>;

/** Local checkpoint reads share the offline tool, never the bridge or live admission gate. */
export async function runOfflineApi(request: ApiRequest): Promise<{ offline: true; result: unknown }> {
  if (request.action === "project-symbol-prepare") {
    return { offline: true, result: await prepareCurrentSymbolMetadata(request.query.request) };
  }
  if (request.action === "baseline-analyze") {
    const { profile } = await loadRuntimeMachineProfile();
    return { offline: true, result: await analyzeCurrentSymbolBaseline(request.query.request.operationId, profile.runtime) };
  }
  return queryOfflineApi(request);
}

export function queryOfflineApi(request: ApiRequest): { offline: true; result: unknown } {
  let result: unknown;
  switch (request.action) {
    case "pcb-diagnostic-validation": { result = queryCurrentPcbDiagnosticValidation(request.query ?? {}); break; }
    case "pcb-diagnostic-validation-validate": { result = validateCurrentPcbDiagnosticValidationArguments(request.query.request); break; }
    case "pcb209-opening": { result = queryCurrentPcb209Opening(request.query ?? {}); break; }
    case "pcb209-opening-validate": { result = validateCurrentPcb209OpeningArguments(request.query.request); break; }
    case "footprint-copy-preparation": { result = queryCurrentFootprintCopyPreparation(request.query?.includeSchemas ?? false); break; }
    case "footprint-copy-preparation-validate": { result = validateCurrentFootprintCopyPreparationArguments(request.query.request); break; }
    case "pcb209-ratline-continuation": { result = queryCurrentPcb209RatlineContinuationValidation(request.query?.includeSchemas ?? false); break; }
    case "pcb209-ratline-continuation-validate": { result = validateCurrentPcb209RatlineContinuationArguments(request.query.request); break; }
    case "pcb209-ratline-held-import": { result = queryCurrentPcb209RatlineStartupValidation(request.query?.includeSchemas ?? false); break; }
    case "pcb209-ratline-held-import-validate": { result = validateCurrentPcb209RatlineStartupArguments(request.query.request); break; }
    case "pcb209-empty-baseline": { result = queryCurrentPcb209EmptyStartupValidation(request.query?.includeSchemas ?? false); break; }
    case "pcb209-empty-baseline-validate": { result = validateCurrentPcb209EmptyStartupArguments(request.query.request); break; }
    case "pcb209-worker-startup": { result = queryCurrentPcb209WorkerStartupValidation(request.query?.includeSchemas ?? false); break; }
    case "pcb209-worker-startup-validate": { result = validateCurrentPcb209WorkerStartupArguments(request.query.request); break; }
    case "pcb-string-precreate-validation": { result = queryCurrentPcbStringPrecreate(request.query ?? {}); break; }
    case "pcb-string-precreate-validation-validate": { result = validateCurrentPcbStringPrecreateArguments(request.query.request); break; }
    case "sdk": { result = queryExtensionApiCatalog(request.query ?? {}); break; }
    case "coverage": { result = queryExtensionApiCoverage(request.query ?? {}); break; }
    case "sdk-reads": { result = queryPublicSdkReads(request.query ?? {}); break; }
    case "sdk-validate": { result = validatePublicSdkArguments(request.query); break; }
    case "calculations": { result = querySdkMathCalculations(request.query ?? {}); break; }
    case "calculate-validate": { result = validateSdkMathArguments(request.query.request); break; }
    case "system": { result = querySdkSystemMethods(request.query ?? {}); break; }
    case "system-validate": { result = validateSdkSystemArguments(request.query.request); break; }
    case "public-readers": { result = querySdkPublicReadersMethods(request.query ?? {}); break; }
    case "public-readers-validate": { result = validateSdkPublicReadersArguments(request.query.request); break; }
    case "netlist-files": { result = queryNetlistFiles(request.query ?? {}); break; }
    case "netlist-files-validate": { result = validateNetlistFilesArguments(request.query.request); break; }
    case "library-files": { result = queryManagedLibraryFiles(request.query ?? {}); break; }
    case "library-files-validate": { result = validateManagedLibraryFilesArguments(request.query.request); break; }
    case "catalog-footprint": { result = queryPublicSystemFootprint(request.query ?? {}); break; }
    case "catalog-footprint-validate": { result = validatePublicSystemFootprintArguments(request.query.request); break; }
    case "catalog-components": { result = queryPublicSystemCatalog(request.query ?? {}); break; }
    case "catalog-components-validate": { result = validatePublicSystemCatalogArguments(request.query.request); break; }
    case "extensions": { result = queryStartupExtensions(request.query ?? {}); break; }
    case "extensions-validate": { result = validateStartupExtensionsArguments(request.query.request); break; }
    case "editor-shell": { result = queryEditorShell(request.query ?? {}); break; }
    case "editor-shell-validate": { result = validateEditorShellArguments(request.query.request); break; }
    case "editor-context": { result = queryEditorContext(request.query ?? {}); break; }
    case "editor-context-validate": { result = validateEditorContextArguments(request.query.request); break; }
    case "shortcuts": { result = queryShortcutKeys(request.query ?? {}); break; }
    case "shortcuts-validate": { result = validateShortcutKeysArguments(request.query.request); break; }
    case "pcb-layers": { result = queryCurrentPcbLayers(request.query ?? {}); break; }
    case "pcb-layers-validate": { result = validateCurrentPcbLayersArguments(request.query.request); break; }
    case "project-open": { result = queryCurrentDisposableOpen(request.query ?? {}); break; }
    case "project-open-validate": { result = validateCurrentDisposableOpenArguments(request.query.request); break; }
    case "pcb-identities": { result = queryCurrentPcbIdentities(request.query ?? {}); break; }
    case "pcb-identities-validate": { result = validateCurrentPcbIdentitiesArguments(request.query.request); break; }
    case "pcb-geometry": { result = queryCurrentPcbGeometry(request.query ?? {}); break; }
    case "pcb-geometry-validate": { result = validateCurrentPcbGeometryArguments(request.query.request); break; }
    case "project-symbol": { result = queryCurrentSymbolMetadata(request.query ?? {}); break; }
    case "project-symbol-validate": { result = validateCurrentSymbolMetadataArguments(request.query.request); break; }
    case "project-pcb": { result = queryCurrentProjectPcbMetadata(request.query ?? {}); break; }
    case "project-pcb-validate": { result = validateCurrentProjectPcbMetadataArguments(request.query.request); break; }
    case "project-schematic": { result = queryCurrentProjectSchematicMetadata(request.query ?? {}); break; }
    case "project-schematic-validate": { result = validateCurrentProjectSchematicMetadataArguments(request.query.request); break; }
    case "project-board": { result = queryCurrentProjectBoardMetadata(request.query ?? {}); break; }
    case "project-board-validate": { result = validateCurrentProjectBoardMetadataArguments(request.query.request); break; }
    case "project-pcb-preflight": { result = queryCurrentPcbRenamePreflight(request.query ?? {}); break; }
    case "project-pcb-preflight-validate": { result = validateCurrentPcbRenamePreflightArguments(request.query.request); break; }
    case "project-symbol-operation": { result = queryCurrentSymbolOperation(request.query ?? {}); break; }
    case "project-symbol-operation-validate": { result = validateCurrentSymbolOperationArguments(request.query.request); break; }
    case "disposable-symbol-copy": { result = queryCurrentSymbolCopyOperation(request.query ?? {}); break; }
    case "disposable-symbol-copy-validate": { result = validateCurrentSymbolCopyOperationArguments(request.query.request); break; }
    case "disposable-pcb-rename": { result = queryCurrentPcbRenameOperation(request.query ?? {}); break; }
    case "disposable-pcb-rename-validate": { result = validateCurrentPcbRenameOperationArguments(request.query.request); break; }
    case "disposable-schematic-rename": { result = queryCurrentSchematicRenameOperation(request.query ?? {}); break; }
    case "disposable-schematic-rename-validate": { result = validateCurrentSchematicRenameOperationArguments(request.query.request); break; }
    case "project-schematic-operation": { result = queryCurrentSchematicOperation(request.query ?? {}); break; }
    case "project-schematic-operation-validate": { result = validateCurrentSchematicOperationArguments(request.query.request); break; }
    case "project-symbol-preflight": { result = queryCurrentProjectOnlySymbolPreflight(request.query ?? {}); break; }
    case "project-symbol-preflight-validate": { result = validateCurrentProjectOnlySymbolPreflightArguments(request.query.request); break; }
    case "project-symbol-preparation": { result = queryCurrentSymbolMetadataPreparation(request.query ?? {}); break; }
    case "project-symbol-prepare-validate": { result = validateCurrentSymbolMetadataPreparationArguments(request.query.request); break; }
    case "project-symbol-prepare": { throw new Error("Checkpoint preparation requires the asynchronous offline API handler."); }
    case "baseline-analysis": {
      result = { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{
        action: "baseline-analyze", tool: "easyeda_control_api", effect: "local-retained-snapshot-comparison",
        ...(request.query?.includeSchemas === true ? { inputSchema: z.toJSONSchema(baselineAnalysisRequestSchema) } : {}),
        limitations: ["Only a completed, retired 24-phase current closed-baseline lifecycle with both snapshots captured. Missing, failed or conflicting evidence refuses.",
          "Reads only managed journal evidence, retained raw copies and native checkpoints. Never reads the original project, writes files or calls the application.",
          "Compares complete logical SQL and all selected-branch native records/provenance. Bounded table/document hashes and counts are returned, not detailed cell or record values; oversized reports refuse without truncation.",
          "Historical consistency and equality are not startup classification, current state, process closure, persistence, backend actor/clock qualification, restored authority or permission to replay or edit."],
      }] }; break;
    }
    case "baseline-analysis-validate": {
      const parsed = baselineAnalysisRequestSchema.safeParse(request.query.request);
      result = parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
        valid: false, executionAuthorized: false,
        issues: parsed.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
      }; break;
    }
    case "baseline-analyze": { throw new Error("Retained baseline analysis requires the asynchronous offline API handler."); }
    case "history": {
      result = { offline: true, invocationEnabledByDiscovery: false, total: 2, entries: [{
        action: "abandon-before-navigation", tool: "easyeda_control_history", effect: "local-historical-sidecar-publication",
        ...(request.query?.includeSchemas === true ? { inputSchema: z.toJSONSchema(historicalAbandonmentRequestSchema) } : {}),
        limitations: ["Only the maintained sixteen-event validation marker-read boundary; no six-event baseline or later-phase recovery.",
          "The exact confirmation is an argument-consistency check, not human attestation or restart authority.",
          "Execution qualifies retained history and unchanged disposable source before exclusive sidecar publication; original journal and permanent claim remain unchanged.",
          "Existing sidecars are requalified without republishing. No application call, completion, process closure, persistence, continuation or replay authority."],
      }, {
        action: "abandon-baseline-before-relaunch", tool: "easyeda_control_history", effect: "local-historical-sidecar-publication",
        ...(request.query?.includeSchemas === true ? { inputSchema: z.toJSONSchema(historicalAbandonmentRequestSchema) } : {}),
        limitations: ["Only the exact seven-phase current closed-baseline prefix stopped before durable relaunch-intent. Explicit disposable-project confirmation required.",
          "Revalidates every retained phase, closed raw copy and checkpoint; reads no original project and restores no process/copy authority.",
          "Writes one exclusive sidecar preserving the full original journal and phase evidence. Later, missing, conflicting or corrupted evidence refuses.",
          "Historical abandonment only. No completion, current process closure, source invariance, continuation, persistence, writer or replay authority."],
      }] }; break;
    }
    case "history-validate": {
      const parsed = historicalAbandonmentRequestSchema.safeParse(request.query.request);
      result = parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
        valid: false, executionAuthorized: false,
        issues: parsed.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
      }; break;
    }
    case "launch": { result = queryOrdinaryLaunch(request.query ?? {}); break; }
    case "launch-validate": { result = validateOrdinaryLaunchArguments(request.query.request); break; }
    case "operations": { result = queryOperationCatalog(request.query); break; }
    case "validate": { result = validateCatalogOperation(request.query); break; }
    default: { throw new Error("Unknown offline API reference action."); }
  }
  return { offline: true, result };
}
