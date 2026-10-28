import { z } from "zod";
import { extensionApiSnapshots } from "./extension-api-catalog-data.ts";
import { installed209ApiOmission } from "./extension-api-installed-209-omissions.ts";
import type { ApiDeclarationMethod, ApiDeclarationSnapshot } from "./extension-api-declarations.ts";
import { maintainedApiCoverageRoutes } from "./extension-api-coverage-routes.ts";
import type { ApiCoverageRoute } from "./extension-api-coverage-routes.ts";
import { libraryExecutionLifecycleRefusal } from "./library-execution-lifecycle.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL, designExecutionLifecycleRefusal } from "./design-execution-lifecycle.ts";
import { publicSdkReadDescriptors } from "./public-sdk-read.ts";
import { sdkMathDescriptors } from "./sdk-math.ts";
import { sdkSystemDescriptors } from "./sdk-system.ts";
// oxlint-disable-next-line import/max-dependencies -- This fixed coverage aggregator joins each maintained descriptor and omission policy directly; a barrel would only hide the same dependencies.
import { sdkPublicReadersDescriptors } from "./sdk-public-readers.ts";

export type ApiCoverageStatus = "implemented-public-subset" | "implemented-native-equivalent" | "implemented-vendor-http-equivalent" | "internal-lifecycle-only" | "implemented-but-blocked" | "omitted";
export interface ApiCoverageOmission {
  readonly code: string;
  readonly reason: string;
  readonly nextRequirement: string;
  readonly evidence: readonly string[];
}
export interface ApiCoverageEntry {
  readonly path: string;
  readonly namespace: string;
  readonly method: string;
  readonly declarations: readonly {
    readonly reference: ApiDeclarationSnapshot["reference"];
    readonly className: string;
    readonly signature: string;
    readonly sourceLine: number;
    readonly documentationUrl: string;
  }[];
  readonly reviewedRuntimeDeclaration: boolean;
  readonly installed209Declaration: boolean;
  readonly status: ApiCoverageStatus;
  readonly routes: readonly ApiCoverageRoute[];
  readonly omission: ApiCoverageOmission | null;
  readonly completeDeclaredContractSupported: false;
  readonly currentGenerationLiveValidation: "not-recorded";
  readonly runtimeAdmission: "not-granted-by-inventory";
}

const statusSchema = z.enum(["implemented-public-subset", "implemented-native-equivalent", "implemented-vendor-http-equivalent", "internal-lifecycle-only", "implemented-but-blocked", "omitted"]);
export const extensionApiCoverageInputSchema = z.object({
  reference: z.enum(["all", "reviewed-installed", "official-latest", "installed-209"]).default("all"),
  namespace: z.string().regex(/^(?:dmt|lib|pcb|pnl|sch|sys)_[A-Za-z0-9]+$/u).optional(),
  search: z.string().min(1).max(128).optional(),
  status: statusSchema.optional(),
  offset: z.number().int().min(0).max(10_000).default(0),
  limit: z.number().int().min(1).max(100).default(25),
  detail: z.boolean().default(false),
}).strict();
export const extensionApiCoverageQuerySchema = z.custom<Record<string, unknown>>((input) => {
  if (input === null || typeof input !== "object" || Array.isArray(input)) { return false; }
  const prototype: unknown = Object.getPrototypeOf(input);
  return (prototype === Object.prototype || prototype === null) && !["__proto__", "constructor", "prototype"].some((key) => Object.hasOwn(input, key));
}).pipe(extensionApiCoverageInputSchema);

const stubs: Readonly<Record<string, string>> = {
  "dmt_Project.modifyProjectFriendlyName": "Installed project friendly-name setter is a native stub; no durable project rename is performed.",
  "dmt_Project.modifyProjectDescription": "Installed project description setter is a native stub.",
  "dmt_Project.copyProject": "Installed project copy method is a native stub; no complete new-project ownership or asset-copy proof exists.",
  "dmt_Project.deleteProject": "Installed project delete method is a native stub; no deletion, dependency or backup contract exists.",
  "pcb_Layer.getCurrentLayer": "Installed method has an empty body and cannot identify the selected layer.",
  "pcb_MathPolygon.discretize": "Installed polygon discretize delegates to Et.discretize, which unconditionally throws Not implemented; JSON projection alone cannot make this method work.",
  "pcb_Layer.getCurrentPhysicalStackingConfigurationName": "Installed method has an empty body and returns no stack identity.",
  "pcb_Layer.getCurrentPhysicalStackingConfiguration": "Installed method has an empty body and returns no stack data; use the maintained native stack source reader.",
  "pcb_Layer.getPhysicalStackingConfiguration": "Installed method has an empty body and returns no named stack data.",
  "pcb_Layer.getDefaultPhysicalStackingConfigurationName": "Installed method has an empty body and returns no default stack identity.",
  "pcb_Layer.getAllPhysicalStackingConfigurations": "Installed method returns a constant empty array rather than enumerating stored stacks.",
  "pcb_Layer.savePhysicalStackingConfiguration": "Installed method returns constant false and does not save a stack preset.",
  "pcb_Layer.renamePhysicalStackingConfiguration": "Installed method returns constant false and does not rename a stack preset.",
  "pcb_Layer.deletePhysicalStackingConfiguration": "Installed method returns constant false and does not delete a stack preset.",
  "pcb_Layer.setAsDefaultPhysicalStackingConfiguration": "Installed method returns constant false and does not select a default stack preset.",
  "pcb_Drc.getRealTimeDrcStatus": "Installed method returns constant false rather than observing real-time DRC state.",
  "pcb_Drc.startRealTimeDrc": "Installed method returns constant false rather than starting real-time DRC.",
  "pcb_Drc.stopRealTimeDrc": "Installed method returns constant false rather than stopping real-time DRC.",
  "sch_Document.getCurrentFilterConfiguration": "Installed method has an empty body and cannot report filter configuration.",
  "sch_Document.navigateToCoordinates": "Installed method returns constant false without dispatching schematic navigation. A viewport equivalent would need a separately reviewed native route and exact owner/view effects.",
  "sch_Document.navigateToRegion": "Installed method returns constant false without dispatching schematic navigation. A region equivalent would need a separately reviewed native route and bounded view/overlay effects.",
  "pcb_PrimitiveAttribute.create": "Installed method has an empty body and does not create an attribute. Existing field modifications do not establish new parent ownership, native child defaults or exact persistence for creation.",
  "pcb_PrimitivePoured.create": "Installed method has an empty body and does not create generated copper. Pour definition edits or calculation are distinct operations, not this declared creation contract.",
  "pcb_PrimitivePoured.modify": "Installed method has an empty body and does not modify generated copper. A native equivalent requires generated-piece ownership, recalculation effects and complete persistence proof; no route is admitted.",
  "sch_Document.getPrimitiveAtPoint": "Installed method has an empty body and does not inspect a schematic point.",
  "sch_Document.getPrimitivesInRegion": "Installed method returns a constant empty array rather than inspecting a schematic region.",
  "sch_Net.getAllNets": "Installed method returns a constant empty array. Scoped source/native component observations exist, but they do not establish a complete net graph; the former compiled topology reader is refused because of hidden annotation and SaveAll.",
  "sch_Net.getAllNetsName": "Installed method returns a constant empty array. Scoped source/native observations are not a complete net-name enumeration; the former compiled topology reader is refused because of hidden annotation and SaveAll.",
  "sch_Net.getCurrentProjectAllNets": "Installed method returns a constant empty array. Document-bound source/native observations do not establish the whole-project graph; the former compiled topology reader is refused because of hidden annotation and SaveAll.",
  "sch_Net.getNet": "Installed method has an empty body and does not look up a net.",
  "pcb_Primitive.getPrimitiveTypeByPrimitiveId": "Installed method has an empty body and cannot identify primitive type.",
  "pcb_Primitive.getPrimitiveByPrimitiveId": "Installed method has an empty body and cannot return a primitive.",
  "pcb_Primitive.getPrimitiveBoardLine": "Installed method has an empty body and cannot return the board outline.",
  "pcb_Primitive.getPrimitivesByPrimitiveId": "Installed method delegates to the empty singular getter; the declared array result is not useful coverage.",
};
const lossyReaders: Readonly<Record<string, string>> = {
  "sch_PrimitivePin.getAll": "The installed pin enumeration catches RPC and required-attribute projection errors as an empty array, so failure is indistinguishable from an empty pin inventory. Explicit-ID get and ID enumeration rethrow errors, but a complete equivalent still needs independent native membership parity.",
  "sch_PrimitiveBus.get": "The installed callback wrapper catches RPC errors and returns undefined when no callback result is retained. A failed read is indistinguishable from a missing bus.",
  "sch_PrimitiveBus.getAll": "The installed callback wrapper catches RPC errors and returns an empty array, so failure is indistinguishable from an empty bus inventory.",
  "sch_PrimitiveBus.getAllPrimitiveId": "The installed callback wrapper catches errors as an empty array; no exact bus identity reader is implemented.",
  "sch_PrimitiveWire.get": "The installed callback wrapper catches RPC errors and returns undefined when no callback result is retained. A failed read is indistinguishable from a missing wire.",
  "sch_PrimitiveWire.getAll": "The installed callback wrapper catches RPC errors and returns an empty array, so failure is indistinguishable from an empty wire inventory.",
  "sch_PrimitiveWire.getAllPrimitiveId": "The installed callback wrapper catches errors as an empty array; exact wire source is available through schematic-source instead.",
  "sch_PrimitiveText.get": "The installed wrapper publishes a callback without awaiting it and immediately returns a callback-populated local. It can report undefined before an existing text object is returned; array lookup also filters such entries out.",
  "sch_PrimitiveText.getAll": "The installed wrapper publishes a callback without awaiting it and returns a callback-populated array. Serialization can observe an empty or incomplete list before enumeration finishes.",
  "sch_PrimitiveText.getAllPrimitiveId": "The installed wrapper publishes its callback without awaiting completion; an empty result can precede actual enumeration.",
};
function omitted(code: string, reason: string, nextRequirement: string, evidence: readonly string[] = []): ApiCoverageOmission {
  return { code, reason, nextRequirement, evidence };
}
const concreteOmissions: Readonly<Record<string, ApiCoverageOmission>> = {
  "pcb_ManufactureData.getBomTemplateFile": omitted("bom-template-shared-preference-effects", "The inspected current UI awaits template initialization before selecting a template and producing XLSX. Initialization can migrate template data and changes an invalid or missing selected-template cache through saveToServer(false). The handler also requires active PCB/footprint context. A declared File return does not make this a pure supplied-file read.", "Bind shared template/preferences ownership, migration and persistence destinations/effects, plus exact active document and bounded file production. No live settings or network mutation is claimed by this source finding.", ["docs/history/2026-10-25-managed-library-files.md"]),
  "sch_ManufactureData.getBomTemplateFile": omitted("bom-template-shared-preference-effects", "The inspected current UI awaits the same effectful template initialization before generating XLSX and requires schematic context. Initialization may migrate templates, replace selected-template cache state and invoke saveToServer(false); a file hash alone cannot prove those effects.", "Establish shared template/settings ownership and exact migration/persistence effects before the bounded file-producing adapter. The current offline supplied-file metadata tool does not qualify this getter.", ["docs/history/2026-10-25-managed-library-files.md"]),
  "lib_Symbol.getRenderImage": omitted("library-render-resource-and-failure-lifecycle", "The current handler constructs a symbol renderer, resolves library/project and optional subpart, generates an image URL and resolves through Image.onload/canvas.toBlob. It has no Image.onerror or visible terminal renderer cleanup. A timeout cannot prove cancellation or resource retirement.", "Implement exact source/subpart/dependency ownership, bounded dimensions/content, image failure settlement and renderer/resource cleanup before returning a managed render artifact.", ["docs/history/2026-10-25-managed-library-files.md"]),
  "lib_Footprint.getRenderImage": omitted("library-render-resource-and-failure-lifecycle", "The current handler uses shared deviceImgData to generate a footprint image, then Image.onload/canvas.toBlob. It has no Image.onerror or visible terminal resource cleanup. Shared renderer ownership and dependencies are not covered by metadata lookup.", "Implement owned source/dependencies and shared-renderer lifecycle, bounded image dimensions/content, image failure settlement and resource retirement. A caller timeout alone is insufficient.", ["docs/history/2026-10-25-managed-library-files.md"]),
  "lib_Footprint.copy": omitted("footprint-copy-default-matching-and-lifecycle", "The inspected 3.2.209 public matcher can return the existing footprint; native clone requires a special underscore-containing UUID. The separate native-create plan now has original-owned preparation publication, complete supplied SQL/saved-source models, a separate original-owned preparation launch mounting worker lexical bindings, actor/SQL composition, 53 dependency functions and the initialized UI/manager route. The private two-continuation clock collector has fixed command encoding, original-event routing and exact-method V8 tests, but no mounted execution transport or embedded-V8 validation. A private copy/closure/reopen coordinator reuses complete SQL and saved-source readers with zero explicit Save attempts; its native execution owner is unimplemented. Native channel-name qualification does not establish a reciprocal worker peer. Source reading and preparation passed one installed191500 disposable lifecycle with exact closed-file equality; this does not validate native create. Native create allocates and advances a ticket before fetching source, crosses UI routing that can select an extension library, and ignores uploadLocal's success field. Neither preparation nor a returned success proves a new durable copy.", "Qualify parser/upload external effects and reciprocal UI/project-worker bus ownership, mount both actual native document-clock results and backend actor/clock provenance; reserve the complete command/result/failure/journal lifecycle; perform one consumed native create; then prove original-generation closure, exact closed SQL, replay-excluded fresh saved reads and final closed equality on a disposable project. Parser/cache cleanup and upload fallback effects remain unqualified. Do not use the default matcher or clone as a substitute.", ["current-footprint-copy-preparation-runtime.ts", "current-footprint-copy-create-source.ts", "current-footprint-copy-create-bindings.ts", "current-footprint-copy-producer-runner.ts", "current-footprint-copy-actor-preparation.ts", "current-footprint-copy-ui-bindings.ts", "current-footprint-copy-preparation-validation.ts", "current-footprint-copy-dependency-runner.ts", "current-footprint-copy-manager-route-runner.ts", "current-footprint-copy-transaction-clock-runner.ts", "current-footprint-copy-transaction-clock-events.ts", "current-footprint-copy-execution-runtime.ts", "current-footprint-copy-async-runner.ts", "current-footprint-copy-v2-sql.ts", "docs/history/2026-10-25-current-footprint-copy-preparation.md", "docs/history/2026-10-26-footprint-source-and-preparation.md", "docs/history/2026-10-26-footprint-producer-bindings.md", "docs/history/2026-10-26-footprint-copy-integration.md", "docs/history/2026-10-28-footprint-preparation-runtime.md"]),
  "lib_Footprint.delete": omitted("footprint-delete-unawaited-dispatch-and-project-selector", "The inspected 3.2.209 public wrapper enables project dependency checks only for the literal Project selector; an actual current project ID still selects project storage but skips those checks. Its UI helper calls deleteFootprint in an unawaited forEach and reports success before native completion. The current footprint subscriber removes its cache entry; the adjacent symbol preview/forced-close branch is distinct.", "Implement strict project/dependency/editor ownership, an awaited native deletion path, exact tombstone and full-peer/raw/SQL effect comparison, complete subscriber/structure settlement and disposable saved/reopened recovery. The public boolean or older symbol-delete lifecycle assumptions cannot establish footprint completion.", ["docs/history/2026-10-25-current-footprint-copy-preparation.md"]),
  "lib_Device.getByLcscIds": omitted("catalogue-fallback-library-effects", "The reviewed current desktop API 0.3.50/UI 3.2.196/server searchByCodes path can fall through to a local device-update controller when networking is disabled. Concurrent library refresh can temporarily resolve the fixed system library to a physical database, reaching initialization/migration before lookup failure. A renderer mode/network check cannot atomically exclude that path; failed service responses can also become empty arrays.", "Implement a separately reviewed remote-only bounded catalogue route or an explicitly scoped library-effects contract. The current desktop findings do not validate the older declaration tuple or prove that a live mutation occurred.", ["docs/history/2026-10-14-system-device-backend-effects.md"]),
  "lib_Symbol.delete": omitted("symbol-delete-subscriber-and-structure-lifecycle", "The project-qualified symbol delData worker ACK covers local queue acceptance, not native subscriber completion. Deletion emits DOCHEAD/DELETE_DOC, starts preview and close-tab/cache work, and schedules a debounced project_structures update. The ordinary awaitUploadEnd barrier waits task1, not the future timer/task2 write. A closed META-only symbol still takes these paths.", "Implement a complete dependency/editor/cache baseline, exact tombstone/raw-history and peer proof, retained ACK plus request-bound subscriber completion, and exact project_structures ticket/tree persistence with no pending duplicate. Stable polling or a delay alone is not a drain. This is unfinished bounded adapter work, not permanent API infeasibility.", ["docs/history/2026-10-12-symbol-delete-native-effects.md", "assets/pro-mgr/3.2.148.154949d9/js/project-worker.js@sha256:2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949;utf16:1927903,2091543,2117630"]),
  "pcb_Document.setCanvasOrigin": omitted("canvas-origin-pending-geometry-queues", "The installed origin command uploads the complete 13-field CANVAS and flushes private pending BOARD, POURED and LAYER_FILL queues plus deferred teardrops. Blank current FileSource and complete stored history cannot exclude earlier unsaved geometry activity; no reviewed read-only empty-queue predicate is available.", "Implement an enforceable empty-queue or continuous no-physical-edit provenance check bound through dispatch, exact CANVAS projection/inverse and complete disposable persistence proof. This is unfinished adapter work, not inherent infeasibility; no executable route is admitted.", ["docs/history/2026-10-11-api-remaining-method-effects.md", "assets/pro-pcb/3.2.149.5378b690/js/pcb.js@sha256:65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54;utf16:10215588,7837738,4425338,7848624,9013374"]),
  "pcb_Layer.selectLayer": omitted("layer-selection-collateral-state", "The installed native handler returns true even when the layer lookup is absent. Valid selection changes active/last-active IDs, visibility, colors, ordering and plane/UI state; the native ACTIVE_LAYER source model also observes the change. A true result or switching back to the prior ID does not prove the complete effect or restoration.", "Implement an exact existing-layer subset with bound context, complete before/after layer/view/source effects and an explicit inverse or no-inverse proof. This is feasible unfinished adapter work, not an inherently unavailable method.", ["docs/history/2026-10-11-api-remaining-method-effects.md", "assets/pro-pcb/3.2.149.5378b690/js/pcb.js@sha256:65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54;utf16:10234952,7863491,7864588,4426612,10827552"]),
  "dmt_Schematic.reorderSchematicPages": omitted("page-order-partial-write-lifecycle", "The installed implementation checks equal lengths and membership but not duplicate page IDs, writes pages sequentially with zIndex 1,2,4,8 via doubling, and rereads mutable currentProject.projectId between awaited writes. A thrown update can leave an earlier prefix changed, and individual update acknowledgments are not checked.", "Implement a complete unique page permutation bound to one project and explicit stored-order semantics, per-write durable intent/acknowledgments, complete-project effect checks and partial-progress recovery without batch replay. The API is beta; this is unfinished transaction support, not inherent infeasibility.", ["docs/history/2026-10-11-api-remaining-method-effects.md", "assets/pro-ui/3.2.149.43637efe/js/ui.js@sha256:12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a;utf16:17082000"]),
  "pcb_Drc.modifyPadPairGroupName": omitted("pad-pair-group-replacement-effects", "The installed rename marks the group UPDATED, then deletes its old EQLEN_GRP and recreates a group with a fresh native number without carrying the old color. Public name/pad-pair readback omits those fields. Preservation of rule references has not been proved; no explicit RULE or RULE_SELECTOR write is established by this traced update body.", "Implement exact group identity/color/pair and affected-rule reference expectations, collision checks, complete native source/persistence verification, and recovery for the delete/create interval. A bounded adapter remains feasible; do not treat rename as a single metadata-field update.", ["docs/history/2026-10-11-api-remaining-method-effects.md", "assets/pro-pcb/3.2.149.5378b690/js/pcb.js@sha256:65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54;utf16:10229502,8385008,8382375,8382537,3444645"]),
  "lib_Symbol.create": omitted("symbol-template-effect-model-needed", "Creating a symbol also creates type-specific canvas/template records and META defaults, not just one metadata row. Existing symbol geometry edits require an already owned single-part asset.", "Implement exact generated template/META and child-identity expectations, returned-ID ownership, asset dependency checks and complete saved-project addition proof.", ["library-operations.ts", "library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "lib_Symbol.updateDocumentSource": omitted("source-decoder-and-save-lifecycle", "Replacing symbol source runs a decoder that can rewrite complete child identities and compiler state; a string schema does not define a safe exact source replacement.", "Add format validation, complete intended decoded delta, inherited-instance effects, no-repeat compiler Save evidence and disposable reopen/inverse proof.", ["library-operations.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "lib_Footprint.updateDocumentSource": omitted("source-decoder-and-save-lifecycle", "The footprint source wrapper can create an editor iframe, decode a complete asset and invoke compiler Save. This is not a stateless text replacement and cannot share a generic metadata transaction.", "Add owned iframe lifecycle, exact decoded asset/placed-instance delta, a Save-intent boundary before the hidden compiler save, and disposable saved/reopened recovery proof.", ["library-operations.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "pcb_ManufactureData.getInteractiveBomFile": omitted("interactive-export-resource-lifecycle", "The installed interactive BOM path starts a hidden welding iframe, changes a global download flag and URL hash, and waits for an event subscription without bounded cancellation/cleanup.", "Implement explicit iframe/subscription/flag ownership, deadline and cleanup with a verified complete File result; never route it through the ordinary stateless export adapter.", ["library-operations.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "sys_Window.getUrlParam": omitted("private-url-state-projection-needed", "Window query parameters are outside the disposable design and can contain account/session or extension secrets. No allowlisted public-key projection exists.", "Define exact safe parameter names, sensitive-value redaction and URL ownership before exposing selected values; never return the complete query map by default."),
  "sys_Window.getUrlAnchor": omitted("private-url-state-projection-needed", "The global URL fragment can contain project navigation and extension state, including temporary export state; no method-specific public projection or stable owner check exists.", "Define bounded allowlisted fragment fields and ownership; raw URL state is not necessary to inspect the active CAD document."),
  "dmt_Panel.getCurrentPanelInfo": omitted("panel-context-not-admitted", "Panel document type 26 is outside the guarded engine's supported schematic, symbol, PCB and footprint context types.", "Add exact panel owner/source/checkpoint context support and a disposable panel fixture before declaring this reader callable."),
  "lib_Cbb.get": omitted("shared-asset-owner-projection-needed", "CBB lookup can resolve external/shared component-block assets; the existing project symbol/footprint/device metadata verifier does not prove their owner or hierarchical descendants.", "Implement explicit collection ownership, bounded CBB metadata/child projection and failure handling, with no implicit external-library write authority."),
  "lib_PanelLibrary.get": omitted("shared-asset-owner-projection-needed", "Panel-library metadata can refer to external assets and panel document types outside current project-library proof profiles.", "Add explicit library ownership and a bounded panel metadata projection; current-project PCB or footprint guards do not prove panel asset scope."),
  "lib_SelectControl.getSelectedLibraryRowInfo": omitted("shared-asset-owner-projection-needed", "The selected library row is UI state and may point at a cloud/shared library unrelated to the active project. The result has no admitted current-project owner binding.", "Define exact visible row and library scope, validate the selected asset owner, and expose only reviewed metadata fields."),
  "sch_SelectControl.getSelectedPrimitives": omitted("lossy-logging-selection-reader", "The installed selected-primitive wrapper catches failures as an empty array and logs selected primitives or the full native reply. It is not an exact quiet read.", "Use a fixed native selection projection with awaited completion and no private-data logging; retain exact project/document identity and distinguish errors from empty selection."),
  "pcb_Net.getNetlist": omitted("cross-tab-netlist-export-scope", "The installed method invokes getAllPCBTabData and builds a time-derived filename. Its input includes other PCB tabs rather than only the exact bound board.", "Use a dedicated nonmutating export adapter that proves every included tab/project and deterministic format. The separate managed PCB netlist export is also refused because of hidden Save; scoped PCB inventory is available but is not a compiled netlist."),
  "sch_Netlist.getNetlist": omitted("implicit-annotation-and-save-all", "The installed netlist path runs schematic annotation, can update DESIGNATOR/UNIQUEID records, then calls saveAllFiles. It is a mutation and global Save path despite its getter name.", "Implement an explicit annotation transaction with a complete multi-document intended delta and pre-dispatch no-repeat Save boundary, or a separately reviewed nonmutating native netlist reader. Never call this during SDK read validation.", ["docs/history/2026-10-10-api-execution-feasibility.md", "assets/pro-sch/3.2.149.35ae2987/js/sch.js:w3"]),
  "pcb_SelectControl.getSelectedPrimitives": omitted("lossy-selected-object-projection", "The installed raw selection projection drops selected objects without toJSON, so its returned list can silently omit valid selected primitives.", "Bind complete selected IDs first, project every supported object type, and prove identity parity across both samples; reject unknown selected object types instead of dropping them."),
  "pcb_SelectControl.getAllSelectedPrimitives": omitted("lossy-heterogeneous-primitive-projection", "The installed wrapper's type switch skips Text and unknown selected types. A stable projected array can omit selected primitives, even when complete selected-ID enumeration is available.", "Bind complete selected IDs before and after the getter; project only reviewed primitive families and reject any missing, duplicate or unsupported identity. Do not treat the wrapper's array as complete selection evidence.", ["public-sdk-read.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "pcb_Document.getPrimitiveAtPoint": omitted("lossy-heterogeneous-primitive-projection", "The installed wrapper skips Text and unknown native hit types before returning the first mapped primitive. It can report no hit or a later supported hit when the native first hit was omitted.", "Use a reviewed native hit-identity projection with explicit hit ordering and supported family mapping; refuse unknown hit types rather than silently selecting a different primitive.", ["docs/history/2026-10-10-api-execution-feasibility.md"]),
  "pcb_Document.getPrimitivesInRegion": omitted("lossy-heterogeneous-primitive-projection", "The installed wrapper skips Text and unknown native region-hit types. Its array is not a complete region inventory and generic JSON/class projection cannot recover omitted identities.", "Bind the complete native region-hit identity list, project every admitted family and prove exact parity; require explicit region direction and boundary semantics with disposable geometry fixtures.", ["docs/history/2026-10-10-api-execution-feasibility.md"]),
  "sch_ManufactureData.getNetlistFile": omitted("implicit-annotation-and-save-all", "The installed export calls the same netlist compiler that updates DESIGNATOR/UNIQUEID and invokes saveAllFiles. Both export.schematic.netlist and the former schematic-topology path are refused before dispatch.", "Replace with a reviewed nonmutating reader/exporter, or implement a separately authorized full annotation/global-Save lifecycle. Do not restore the old read classification from a successful historical export.", ["library-runtime.ts", "exact-readers.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "sch_ManufactureData.getBomFile": omitted("implicit-save-before-export", "The schematic BOM wrapper reaches native exportBomHandler/getExportFileData, whose paths call saveAllFiles before generating data.", "Add a separately reviewed nonmutating BOM projection or an explicit whole-scope no-repeat Save transaction; the ordinary file-export executor cannot treat this as read-only.", ["library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "pcb_ManufactureData.getBomFile": omitted("implicit-save-before-export", "The PCB BOM wrapper reaches shared schematic exportBomHandler/getExportFileData paths that call saveAllFiles.", "Add a separately reviewed nonmutating BOM projection or an explicit whole-scope no-repeat Save transaction; an unchanged result file cannot prove the export avoided Save.", ["library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "pcb_ManufactureData.getNetlistFile": omitted("implicit-save-before-export", "The installed PCB netlist exporter calls the global Save path when any editor tab is unsaved, including tabs outside the requested board.", "Implement a nonmutating single-board netlist exporter or an explicitly scoped global-Save lifecycle. Do not permit a hidden Save based on a getter name or caller claim that the board is clean.", ["library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "pcb_ManufactureData.getPdfFile": omitted("implicit-save-before-export", "The PCB PDF wrapper reaches getPDFFile/T5e and the UI global SaveAll helper before export.", "Implement a separately reviewed nonmutating render/export adapter or an explicit no-repeat Save lifecycle with complete project scope.", ["library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "sch_ManufactureData.getExportDocumentFile": omitted("implicit-save-before-export", "The schematic document export wrapper immediately awaits the UI global SaveAll helper before producing PDF, PNG or SVG.", "Add a nonmutating render/export adapter or explicitly authorized full Save lifecycle; do not present this wrapper as a read-only file getter.", ["library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
  "sch_ManufactureData.getSimulationNetlistFile": omitted("simulation-editor-not-admitted", "The native getNGspiceNetlist handler returns data only in the NGSPICE editor; the current library export route admits ordinary schematic type 1, where this cannot produce the required File.", "Implement exact simulation-editor ownership and a bounded verified export result on a supported disposable simulation fixture; ordinary schematic context is insufficient.", ["library-runtime.ts", "docs/history/2026-10-10-api-execution-feasibility.md"]),
};

/** These rules classify a gap, never enable execution. Known implementation
 * defects override declaration shapes. The remaining category explicitly says
 * implementation is still missing; absence is not an assertion of infeasibility.
 */
function omissionFor(namespace: string, method: string, declarations: readonly ApiDeclarationMethod[], reviewed: boolean, installed209: boolean): ApiCoverageOmission {
  const short = `${namespace}.${method}`;
  const installedOmission = installed209 ? installed209ApiOmission(short) : undefined;
  if (installedOmission !== undefined) { return installedOmission; }
  if (!reviewed) { return omitted("not-in-reviewed-runtime", `${short} is absent from the legacy reviewed-installed declaration. Its presence in a newer reference${installed209 ? " and the separately cataloged installed-209 declaration" : ""} does not admit that backend or method.`, "Review and admit a newer installed implementation, then implement and test a scoped adapter; changing a declaration checksum does not admit a runtime.", ["reviewed-compatibility.json", "extension-api-catalog-data.ts"]); }
  const concrete = concreteOmissions[short];
  if (concrete !== undefined) { return structuredClone(concrete); }
  const stub = stubs[short];
  if (stub !== undefined) { return omitted("reviewed-native-stub", stub, "Implement a separately reviewed native task adapter with exact effects, or validate a newer runtime where the public method works.", ["assets/pro-api/0.2.53.aee2f57a/api.js@sha256:5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc"]); }
  const lossy = lossyReaders[short];
  if (lossy !== undefined) { return omitted("lossy-or-unawaited-public-reader", lossy, "Use an independently complete native reader with awaited completion, source parity and failure tests; do not report a swallowed error as an empty result.", ["assets/pro-api/0.2.53.aee2f57a/api.js@sha256:5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc"]); }
  if (/^place.*Order$/u.test(method)) { return omitted("external-commercial-action", `${short} submits a board, component, assembly or enclosure order and is outside disposable local CAD validation.`, "A separate explicit purchasing/submission contract, destination review, confirmation and non-production test service are required; do not invoke during a coverage test."); }
  if (["sys_ClientUrl", "sys_WebSocket", "sys_MessageBus", "sys_ExternalApi"].includes(namespace)) {
    return omitted("unrestricted-transport-or-service", `${short} exposes destinations, channels or service endpoints rather than a bounded CAD operation. Some declarations carry callbacks or arbitrary message data.`, "Implement fixed destination/channel adapters with authority, lifetime, cancellation and response schemas. Existing internal private transport is not caller access to this public method.");
  }
  if (namespace.endsWith("_Event") || namespace === "sys_Timer" || /(?:EventListener|ShortcutKey|register|unregister)/u.test(method)) {
    return omitted("callback-or-registration-lifecycle", `${short} creates, removes or observes extension-owned callbacks or registrations; JSON arguments cannot transfer executable closures or safely own persistent handles.`, "Implement typed subscriptions with bounded event buffers, lease ownership, cancellation, disconnect cleanup and no caller code; registration state must not be shared implicitly.");
  }
  if (["sys_HeaderMenu", "sys_RightClickMenu", "sys_Dialog", "sys_MessageBox", "sys_IFrame", "sys_LoadingAndProgressBar", "sys_Message", "sys_ToastMessage", "sys_PanelControl"].includes(namespace)) {
    return omitted("interactive-ui-resource", `${short} controls an interactive dialog, menu, frame, notification or panel resource; successful return does not establish completion or user choice.`, "Add a process-bound typed UI-resource owner, observable result/cancellation and cleanup. Existing native_ui can inspect and operate visible controls but does not implement this API method.");
  }
  if (namespace === "sys_Storage" || namespace === "sys_Setting" || namespace === "sys_Log" || namespace === "sys_FontManager" || method === "setKeepProjectHasOnlyOneBoard") {
    return omitted("extension-or-global-settings-state", `${short} reads or changes extension/global application state that is not bounded by a disposable project checkpoint.`, "Define named key/font/log/config scopes, secret filtering, backups for mutation and cleanup before exposing this method. Project rollback cannot undo these effects.");
  }
  if (namespace === "sys_FileSystem" || namespace === "sys_FormatConversion" || namespace === "sys_FileManager" || /(?:File|RenderImage)$/u.test(method) || /^(?:upload|import).*File/u.test(method)) {
    return omitted("managed-file-contract-needed", `${short} consumes or produces File/Blob, filesystem paths, project archives or image data without an implemented method-specific managed-artifact contract.`, "Add bounded hash-bound artifact transfer, exact input ownership/format checks, exclusive output publication and any associated import effect proof. A filename or Blob handle is not a verified file.");
  }
  if (["dmt_Team", "dmt_Workspace", "dmt_Folder", "lib_LibrariesList", "lib_Classification"].includes(namespace) || /(?:UserInfo|ProjectInfo|ProjectsUuid|search|getByLcscIds|Collaborat|moveProject)/u.test(method)) {
    return omitted("account-or-library-scope-needed", `${short} reaches account, workspace, folder, project or shared-library metadata outside the active disposable document.`, "Define explicit owner, collection/search bounds and privacy rules; mutations also need cloud/shared-asset authority and a durable independent verifier. Read-only catalog discovery is still feasible without granting writes.");
  }
  if (namespace === "pcb_RayTracerEngine" || namespace === "pcb_ImageTool" || namespace === "sch_SimulationEngine" || method.includes("WithMouse") || method.startsWith("placeCbb")) {
    return omitted("interactive-engine-lifecycle", `${short} starts or controls rendering, image processing, simulation or interactive placement rather than returning a completed JSON CAD effect.`, "Add cancellable job ownership, bounded progress/results and process/context reproof; placement or generated geometry also needs an exact source/connectivity effect model.");
  }
  if (method === "importChanges" || method === "autoRouting" || method === "autoLayout" || method === "clearRouting" || method === "setNetlist") {
    return omitted("multi-object-electrical-effect", `${short} can replace connectivity or alter many placed/routed objects; current per-record transactions do not define its complete intended delta.`, "Implement a previewed explicit change set, preserved component/pad/net identities, complete-project source verifier and saved/reopened disposable validation. ECO dialogs are not an API completion receipt.");
  }
  if (method === "generateIndicatorMarkers" || method.startsWith("doCrossProbe") || method === "doSelectPrimitives" || method === "urlPushState" || method === "urlReplaceState") {
    return omitted("selection-marker-or-history-mutation", `${short} changes selected objects, indicator markers, cross-probe state or browser navigation history; it is not a read or pure calculation.`, "Implement typed exact target/state ownership, observe completion and preserve or explicitly restore prior selection, markers or history. Cross-probe can affect another document and needs both contexts bound.");
  }
  if (/^(?:create|delete|remove|modify|set|overwrite|copy|move|reorder|update|add|rename|save|restore|start|stop|clear|lock|unlock|highlight|unhighlight|select|unselect|toggle|switch|push|import|upload|rebuild|trigger|dispose)/u.test(method)) {
    return omitted("scoped-effect-adapter-needed", `${short} has no maintained complete effect/ownership verifier for its declared mutation or application-state change. The method is not classified as inherently impossible.`, "Implement strict typed arguments, exact before/after affected state, collateral invariants, durable intent and recovery; design mutations additionally need disposable save/close/reopen and inverse or explicit no-inverse proof.");
  }
  if (/^(?:open|close|activate|zoom|navigate|tile|merge)/u.test(method)) {
    return omitted("navigation-or-viewport-adapter-needed", `${short} changes editor, viewport or window state without a maintained method-specific one-shot completion/ownership proof.`, "Add strict target/viewport arguments, original owner/context proof, non-replayed dispatch and bounded observable completion; closing must never imply Save or discard.");
  }
  if (declarations.some((entry) => /(?:=>|\bFunction\b|\bFile\b|\bBlob\b|\bElement\b|\bComponent\b|\bI(?:PCB|SCH)_Primitive\w*\b|\bIPCB_(?:Complex)?Polygon\b)/u.test(entry.signature))) {
    return omitted("non-json-result-or-callback", `${short} includes executable callbacks, browser/file objects or extension class state whose serialization is not defined by a JSON method call.`, "Create a fixed data projection or managed resource/file adapter with receiver-bound access and complete failure tests. Never serialize methods, prototype state or arbitrary callback source.");
  }
  return omitted("bounded-read-or-pure-adapter-needed", `${short} has no reviewed fixed read/pure adapter yet. Its declaration alone does not establish JSON-safe results, completed callbacks or absence of side effects.`, "Review the installed implementation, define exact bounded arguments/result projection and stability policy, then add source/contract and disposable connected tests. This is remaining implementation work, not a safety-based claim of infeasibility.");
}

interface MethodGroup { namespace: string; method: string; declarations: ApiCoverageEntry["declarations"][number][]; methods: ApiDeclarationMethod[] }

function designLifecycleRoute(route: ApiCoverageRoute, namespace: string): ApiCoverageRoute {
  if (route.tool !== "easyeda_control_design") { return route; }
  let documentTypes = route.documentTypes;
  if (documentTypes === undefined) {
    if (route.selector.startsWith("pcb.") || namespace === "pcb_Document") { documentTypes = [3]; }
    else if (namespace === "sch_Document") { documentTypes = [1]; }
    else if (namespace === "dmt_EditorControl" && route.selector === "commit/recovery lifecycle") { documentTypes = [1, 2, 3, 4]; }
    else { throw new Error(`Design coverage route lacks exact editor scope: ${route.selector}`); }
  }
  const blockedDocumentTypes = documentTypes.filter((type) => designExecutionLifecycleRefusal(type) !== undefined);
  if (blockedDocumentTypes.length === 0) { return route; }
  return { ...route, documentTypes, blockedDocumentTypes,
    executionState: blockedDocumentTypes.length === documentTypes.length ? "blocked" : "partially-blocked",
    blockedReason: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL + (route.blockedReason === undefined ? "" : ` Additional retained restriction: ${route.blockedReason}`),
    scope: `Retained source/proof contract, not a lifecycle completion or enablement claim. Types 1, 2 and 3 are blocked; any remaining type-4 scope retains its existing guards. ${route.scope}`,
    source: [...route.source, "design-execution-lifecycle.ts"],
  };
}

export function inventoryExtensionApiCoverage(): ApiCoverageEntry[] {
  const methods = new Map<string, MethodGroup>();
  for (const snapshot of extensionApiSnapshots) {
    for (const namespace of snapshot.namespaces) {
      for (const method of namespace.methods) {
        const path = `eda.${namespace.name}.${method.name}`;
        const group = methods.get(path) ?? { namespace: namespace.name, method: method.name, declarations: [], methods: [] };
        group.declarations.push({ reference: snapshot.reference, className: method.className, signature: method.signature, sourceLine: method.sourceLine,
          documentationUrl: `https://prodocs.easyeda.com/en/api/reference/pro-api.${method.className.toLowerCase()}.${method.name.toLowerCase()}.html` });
        group.methods.push(method);
        methods.set(path, group);
      }
    }
  }
  const routes = new Map(maintainedApiCoverageRoutes());
  for (const descriptor of sdkMathDescriptors()) {
    routes.set(descriptor.path, [{ tool: "easyeda_control_calculate", selector: descriptor.path, implementation: "public-method",
      scope: `Separately reviewed EasyEDA 3.2.206/API 0.3.50 or 3.2.209/API 0.3.59 public calculation subset, not legacy/native-tuple admission. ${descriptor.limitations.join(" ")}`,
      source: ["sdk-math.ts", "sdk-math-clipping.ts", "sdk-math-runtime.ts", "sdk-local-runtime.ts", "sdk-public-utilities-profile.ts", "facade-mode.ts"], tests: ["sdk-math.test.ts", "sdk-math-clipping.test.ts", "sdk-math-runtime.test.ts", "sdk-public-utilities-runtime.test.ts", "facade-mode.test.ts"],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "calculations", query: { method: descriptor.path, includeSchemas: true } } } },
    }]);
  }
  for (const descriptor of sdkSystemDescriptors()) {
    const existing = routes.get(descriptor.path) ?? [];
    routes.set(descriptor.path, [...existing, { tool: "easyeda_control_system", selector: descriptor.path, implementation: "public-method",
      scope: `Separately reviewed EasyEDA 3.2.206/API 0.3.50 or 3.2.209/API 0.3.59 local-system subset; no project context or legacy/native-tuple admission. ${descriptor.limitations.join(" ")}`,
      source: ["sdk-system.ts", "sdk-system-runtime.ts", "sdk-local-runtime.ts", "sdk-public-utilities-profile.ts", "facade-mode.ts"],
      tests: ["sdk-system.test.ts", "sdk-system-runtime.test.ts", "sdk-public-utilities-runtime.test.ts", "facade-mode.test.ts"],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "system", query: { method: descriptor.path, includeSchemas: true } } } },
    }]);
  }
  for (const descriptor of sdkPublicReadersDescriptors()) {
    const existing = routes.get(descriptor.path) ?? [];
    routes.set(descriptor.path, [...existing, { tool: "easyeda_control_public_readers", selector: descriptor.path, implementation: "public-method",
      scope: `Separately reviewed EasyEDA 3.2.209/API 0.3.59 only; older profiles do not register this route. Single requests or a batch of up to seven unique methods use two matching observations. Batch methods share one ten-second deadline and retain all owners before invocation; two ordered passes are sequential, not atomic. Each member is bounded to 8192 bytes and the complete batch to 65536 bytes. One failed member refuses the whole result; no cached authority or partial success. ${descriptor.limitations.join(" ")}`,
      source: ["sdk-public-readers.ts", "sdk-public-readers-batch.ts", "sdk-public-readers-runtime.ts", "sdk-public-utilities-profile.ts", "facade-mode.ts"],
      tests: ["sdk-public-readers.test.ts", "sdk-public-readers-batch.test.ts", "sdk-public-readers-runtime.test.ts", "sdk-public-readers-ui.test.ts", "sdk-public-readers-registration.test.ts", "facade-mode.test.ts"],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "public-readers", query: { method: descriptor.path, includeSchemas: true } } } },
    }]);
  }
  routes.set("eda.sys_Tool.netlistComparison", [{
    tool: "easyeda_control_netlist_files", selector: "compare-files", implementation: "public-method",
    scope: "EasyEDA 3.2.209/API 0.3.59 only: public File/File comparison of two exact managed ASCII Allegro .tel artifacts. Local prepare-file writes supplied text to an exclusive managed artifact without app access. Complete subset recognition and an independent model require every returned footprint-to-designator and net-to-pin difference to agree. Two bounded samples retain their original UI, method, RPC and File owners with a monotonic deadline. Values, properties and circuit correctness are not compared; empty differences establish membership equality only. Document UUID/object overloads, .enet and other formats remain omitted: the UUID path dispatches a project-worker read, .enet can retrieve project library assets, and the object overload has no matching implementation. No arbitrary path, export, navigation, upload, CAD edit or Save. Offline exact-source parser fixtures and runtime regressions are not installed connected validation.",
    source: ["netlist-files.ts", "netlist-files-program.ts", "netlist-files-runtime.ts", "editor-observation209-profile.ts", "facade-mode.ts"],
    tests: ["netlist-files.test.ts", "netlist-files-runtime.test.ts", "netlist-files-registration.test.ts", "facade-mode.test.ts"],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "netlist-files", query: { includeSchemas: true } } } },
  }]);
  for (const [method, action] of [["extractLibInfo", "extract-library-info"], ["extractProjectInfo", "extract-project-info"]] as const) {
    routes.set(`eda.sys_FileManager.${method}`, [{
      tool: "easyeda_control_library_files", selector: action, implementation: "native-task-equivalent",
      scope: "Offline supplied-file metadata equivalent available in every facade mode. No public SDK invocation, EasyEDA process, bridge, runtime admission, network, project open, import, conversion or Save. prepare-file validates canonical base64 and the complete admitted bounded file before exclusive managed publication with confirmLocalArtifact:true. Later reads require exact managed path/name/size/SHA-256. Standalone .efoo/.epanl/ordinary-type2 .esym libraries require UTF-8 JSON-line DOCTYPE/HEAD framing; filename SHA-256 supplies UUID, filename stem supplies title, and description/tags are empty. Project .epro/.epro2 ZIP32 archives return title, cbbProject and optional editorVersion from the correct manifest. Every archive member is extent/inflation/CRC checked, with no extraction to disk. 4 MiB input, 8 MiB expanded, 256 members, 256 KiB text/manifest, 8192 records, 16 library files, 64 KiB response. Unknown drawing/manifest data remains unexecuted input; geometry, dependencies, ownership, electrical validity and import suitability are unverified. No storage-ID overload, device/archive library extraction, net flags, ports, ZIP64, encrypted archives, unsafe paths, duplicate names or conflicting manifests. Installed connected SDK execution remains unclaimed.",
      source: ["managed-library-files.ts", "managed-library-files-zip.ts", "managed-library-files-runtime.ts", "artifacts.ts", "facade-mode.ts"],
      tests: ["managed-library-files.test.ts", "managed-library-files-registration.test.ts", "facade-mode.test.ts"],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-managed-file-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "library-files", query: { includeSchemas: true } } } },
    }]);
  }
  const footprintPath = "eda.lib_Footprint.get";
  routes.set(footprintPath, [...routes.get(footprintPath) ?? [], {
    tool: "easyeda_control_catalog_footprint", selector: "fixed-vendor-system-catalog-footprint", implementation: "vendor-http-task-equivalent",
    scope: "Application-independent vendor HTTPS metadata lookup, not public lib_Footprint.get execution or EasyEDA runtime admission. One explicit lowercase 32-hex footprintUuid with confirmNetwork:true; fixed pro.easyeda.com/api/v2/components endpoint, no caller destination/library/path, credentials or redirects. Strict bounded system-owned footprint metadata only, not geometry, pads, connectivity, complete asset, cached SDK parity or persistence proof. The current 3.2.209 public getter remains unregistered: HALF_OFFLINE can initialize SQLite through an unqualified CWD path, while ONLINE uses a remote UI not admitted by local installed pins. The older legacy SDK route remains separately scoped. No project opening, editor, native bridge, library write API or Save.",
    source: ["public-system-footprint.ts", "public-system-footprint-runtime.ts", "facade-mode.ts"],
    tests: ["public-system-footprint.test.ts", "public-system-footprint-runtime.test.ts", "public-system-footprint-registration.test.ts", "facade-mode.test.ts"],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-network-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "catalog-footprint", query: { includeSchemas: true } } } },
  }]);
  for (const [path, selector] of [["eda.lib_Footprint.search", "search-footprints"],
    ["eda.lib_Symbol.search", "search-symbols"], ["eda.lib_Device.search", "search-devices"],
    ["eda.lib_Symbol.get", "get-symbol"], ["eda.lib_Device.get", "get-device"]] as const) {
    routes.set(path, [...routes.get(path) ?? [], {
      tool: "easyeda_control_catalog_components", selector, implementation: "vendor-http-task-equivalent",
      scope: "Application-independent credential-free vendor catalog metadata; not public SDK execution or installed runtime admission. Fixed system owner, bounded public query or exact UUID, explicit confirmNetwork:true, one request without redirects/retries or automatic pagination. Search returns at most twenty candidates with raw vendor pagination, not exact/exhaustive matches. Symbol metadata excludes drawings/subparts/pins; device associations are references, not verified pin mapping or linked-asset ownership. Missing visibility/path flags are disclosed and contradictory supplied flags refuse. No credentials, local library/database, editor, project, geometry, stock, prices, CAD write or Save. Desktop SDK getters remain unregistered on209 because local fallback can initialize storage or construct drawing managers and ONLINE can load unpinned remote UI.",
      source: ["public-system-catalog.ts", "public-system-catalog-runtime.ts", "facade-mode.ts"],
      tests: ["public-system-catalog.test.ts", "public-system-catalog-search.test.ts", "public-system-catalog-runtime.test.ts", "public-system-catalog-registration.test.ts"],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-network-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "catalog-components", query: { includeSchemas: true } } } },
    }]);
  }
  routes.set("eda.lib_Symbol.searchByProperties", [{
    tool: "easyeda_control_catalog_components", selector: "search-symbols-by-name", implementation: "vendor-http-task-equivalent",
    scope: "One explicitly confirmed anonymous system-symbol name lookup on a fixed vendor HTTPS endpoint; not public SDK execution or installed runtime admission. Complete bounded candidate lists retain name equality flags and exact system ownership. Type comes from docType2 or two bounded duplicate-key-checked native header records; no drawing geometry is parsed or executed. Missing visibility/path flags remain unverified. No account owner discovery, credentials, redirects, retries, pagination, linked assets or desktop storage. Direct SDK execution remains omitted on209: the request supplies user_uuids without the desktop controller's required body/header path, and a failed response can collapse to an empty list. This partial routing trace does not establish an unconditional live failure. Desktop path repair needs separate database routing/initialization qualification. Pin mapping, exact matching, exhaustiveness and circuit suitability remain unverified.",
    source: ["public-system-symbol-exact.ts", "public-system-symbol-exact-runtime.ts", "public-system-catalog.ts", "public-system-catalog-runtime.ts", "facade-mode.ts"],
    tests: ["public-system-symbol-exact.test.ts", "public-system-symbol-exact-runtime.test.ts", "public-system-catalog-runtime.test.ts", "public-system-catalog-registration.test.ts"],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-network-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "catalog-components", query: { includeSchemas: true } } } },
  }]);
  for (const [path, selector, desktopLimit] of [
    ["eda.lib_Footprint.searchByProperties", "search-footprints-by-name", "Direct SDK execution remains unqualified: the desktop controller requires body/header path, while the name wrapper supplies titles/docType without that path. Failed responses can collapse to an empty SDK list."],
    ["eda.lib_Device.getByLcscIds", "get-devices-by-lcsc-ids", "Direct SDK execution remains unqualified: concurrent library refresh and desktop local-library fallback can touch library state. This fixed remote-only equivalent does not qualify those effects or implement every SDK overload."],
  ] as const) {
    routes.set(path, [{
      tool: "easyeda_control_catalog_components", selector, implementation: "vendor-http-task-equivalent",
      scope: `Application-independent anonymous system-catalog lookup with bounded metadata enrichment; not public SDK execution or installed runtime admission. Explicit confirmNetwork:true discloses one bounded footprint name or one to five distinct uppercase LCSC C numbers. All returned candidates require exact fixed-URL metadata GETs: at most five candidates and six total requests share one 30-second deadline and 1 MiB aggregate decoded-body budget. Complete candidate and metadata lists must agree on UUID, system owner and supported identity/type fields; LCSC Supplier Part and symbol/footprint references must also agree. Overflow, contradiction, missing witnesses or later failure refuses the entire result without filtering or partial success. All matching LCSC candidates are preserved. No credentials, arbitrary URLs/owners, redirects, retries, pagination, linked assets, stock, prices, CAD, pin mapping, persistence or exhaustive/atomic snapshot claim. Initial lookup endpoint samples did not validate this composed route; installed/live enrichment remains unvalidated. ${desktopLimit}`,
      source: ["public-system-library-lookups.ts", "public-system-library-lookups-runtime.ts", "public-system-catalog.ts", "public-system-catalog-runtime.ts", "facade-mode.ts"],
      tests: ["public-system-library-lookups.test.ts", "public-system-library-lookups-runtime.test.ts", "public-system-catalog-registration.test.ts"],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-network-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "catalog-components", query: { includeSchemas: true } } } },
    }]);
  }
  for (const descriptor of publicSdkReadDescriptors()) {
    const existing = routes.get(descriptor.path) ?? [];
    routes.set(descriptor.path, [...existing, {
      tool: "easyeda_control_sdk_read", selector: descriptor.path, implementation: descriptor.implementation.kind,
      scope: `Fixed ${descriptor.parameterSupport} argument subset; bounded double-sampled ${descriptor.implementation.kind === "native-task-equivalent" ? "native task-equivalent" : "public SDK"} observation, not complete native-source/connectivity/persistence proof. ${descriptor.limitations.join(" ")}`.trim(),
      documentTypes: descriptor.documentTypes,
      source: [descriptor.implementation.source.replace(/^server\/src\//u, "")], tests: [descriptor.implementation.test.replace(/^server\/tests\//u, "")],
      validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
      inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "sdk-reads", query: { method: descriptor.path, includeSchemas: true } } } },
    }]);
  }
  for (const path of routes.keys()) {
    if (!methods.has(path)) { throw new Error(`Coverage route references undeclared method: ${path}`); }
  }
  return [...methods].toSorted(([left], [right]) => left.localeCompare(right, "en")).map(([path, group]) => {
    const reviewed = group.declarations.some((entry) => entry.reference === "reviewed-installed");
    const installed209 = group.declarations.some((entry) => entry.reference === "installed-209");
    const supported: ApiCoverageRoute[] = [];
    for (const original of routes.get(path) ?? []) {
      const route = designLifecycleRoute(original, group.namespace);
      const refusal = route.tool === "easyeda_control_library" ? libraryExecutionLifecycleRefusal(route.selector.split(";")[0] ?? "") : undefined;
      supported.push(refusal === undefined ? route : { ...route, executionState: "blocked", blockedReason: refusal, source: [...route.source, "library-execution-lifecycle.ts"] });
    }
    let status: ApiCoverageStatus = "omitted";
    if (supported.length > 0 && supported.every((entry) => entry.executionState === "blocked")) { status = "implemented-but-blocked"; }
    else if (supported.some((entry) => entry.executionState !== "blocked" && entry.implementation === "public-method")) { status = "implemented-public-subset"; }
    else if (supported.some((entry) => entry.executionState !== "blocked" && entry.implementation === "native-task-equivalent")) { status = "implemented-native-equivalent"; }
    else if (supported.some((entry) => entry.executionState !== "blocked" && entry.implementation === "vendor-http-task-equivalent")) { status = "implemented-vendor-http-equivalent"; }
    else if (supported.length > 0) { status = "internal-lifecycle-only"; }
    return { path, namespace: group.namespace, method: group.method, declarations: group.declarations, reviewedRuntimeDeclaration: reviewed, installed209Declaration: installed209, status, routes: supported,
      omission: supported.length === 0 ? omissionFor(group.namespace, group.method, group.methods, reviewed, installed209) : null,
      completeDeclaredContractSupported: false, currentGenerationLiveValidation: "not-recorded", runtimeAdmission: "not-granted-by-inventory" };
  });
}

export function extensionApiCoverageSummary(entries = inventoryExtensionApiCoverage()): Record<string, unknown> {
  const count = (predicate: (entry: ApiCoverageEntry) => boolean): number => entries.filter((entry) => predicate(entry)).length;
  return { totalDistinctMethods: entries.length, reviewedDistinctMethods: count((entry) => entry.reviewedRuntimeDeclaration),
    latestDistinctMethods: count((entry) => entry.declarations.some((declaration) => declaration.reference === "official-latest")),
    installed209DistinctMethods: count((entry) => entry.installed209Declaration),
    statuses: Object.fromEntries(statusSchema.options.map((status) => [status, count((entry) => entry.status === status)])),
    executionRoutes: Object.fromEntries(["available-with-runtime-guards", "available-with-network-guards", "available-with-managed-file-guards", "blocked", "partially-blocked"].map((state) => [state, entries.flatMap((entry) => entry.routes).filter((route) => route.executionState === state).length])),
    omissions: Object.fromEntries([...new Set(entries.flatMap((entry) => entry.omission === null ? [] : [entry.omission.code]))].toSorted().map((code) => [code, count((entry) => entry.omission?.code === code)])),
    currentGenerationLiveValidatedMethods: 0,
    declarationSignatures: extensionApiSnapshots.map((snapshot) => ({ reference: snapshot.reference, version: snapshot.version, sourceSha256: snapshot.sourceSha256, signatures: snapshot.namespaces.reduce((sum, namespace) => sum + namespace.methods.length, 0) })) };
}

/** Offline coverage discovery. It grants no method dispatch, runtime admission,
 * transaction authority or inheritance of a historical live validation record.
 */
export function queryExtensionApiCoverage(input: unknown = {}): Record<string, unknown> {
  const query = extensionApiCoverageQuerySchema.parse(input);
  const all = inventoryExtensionApiCoverage();
  if (query.namespace !== undefined && !all.some((entry) => entry.namespace === query.namespace)) { throw new Error("Unknown API coverage namespace."); }
  const search = query.search?.toLowerCase();
  const matched = all.filter((entry) => (query.reference === "all" || entry.declarations.some((declaration) => declaration.reference === query.reference)) &&
    (query.namespace === undefined || entry.namespace === query.namespace) && (query.status === undefined || entry.status === query.status) &&
    (search === undefined || `${entry.path} ${entry.omission?.reason ?? ""} ${entry.routes.map((route) => route.selector).join(" ")}`.toLowerCase().includes(search)));
  const page: unknown[] = [];
  for (const entry of matched.slice(query.offset, query.offset + query.limit)) {
    const row = query.detail ? entry : { path: entry.path, status: entry.status, reviewedRuntimeDeclaration: entry.reviewedRuntimeDeclaration, installed209Declaration: entry.installed209Declaration,
      routes: entry.routes.map(({ tool, selector, implementation, executionState, blockedReason, blockedDocumentTypes, inputDiscovery }) => ({ tool, selector, implementation, executionState,
        ...(blockedReason === undefined ? {} : { blockedReason, blockedDocumentTypes }), ...(inputDiscovery === undefined ? {} : { inputDiscovery }) })), omission: entry.omission,
      currentGenerationLiveValidation: entry.currentGenerationLiveValidation, runtimeAdmission: entry.runtimeAdmission };
    if (Buffer.byteLength(JSON.stringify([...page, row]), "utf8") > 49_152) {
      if (page.length === 0) { throw new Error("Coverage row exceeds the bounded response budget."); }
      break;
    }
    page.push(row);
  }
  const next = query.offset + page.length;
  const result = { schema: "easyeda-pro-control.extension-api-coverage.v1", offline: true, invocationEnabled: false,
    scope: "Distinct mounted method paths; overloads and all three snapshots retained. Legacy reviewed-installed and installed-209 declaration presence are separate from runtime admission. Supported routes expose documented subsets, not every declared contract.",
    summary: extensionApiCoverageSummary(all), page: { offset: query.offset, limit: query.limit, totalMatched: matched.length, returned: page.length,
      nextOffset: next < matched.length ? next : null, maxEntriesBytes: 49_152, maxResponseBytes: 65_536 }, entries: page };
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > 65_536) { throw new Error("Coverage response exceeds budget."); }
  return result;
}
