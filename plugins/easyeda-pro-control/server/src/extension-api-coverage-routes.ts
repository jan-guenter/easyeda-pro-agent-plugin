import { CURRENT_PCB_SELECTED_GEOMETRY_METHOD, CURRENT_PCB_SELECTION_LIMITATION } from "./current-pcb-selection.ts";

/** Reviewed links from public SDK methods to actual maintained execution paths.
 * Native and vendor HTTP task equivalents do not claim to invoke the public
 * wrapper, support every overload, or validate that wrapper's implementation.
 */
export interface ApiCoverageRoute {
  readonly tool: string;
  readonly selector: string;
  readonly implementation: "public-method" | "native-task-equivalent" | "vendor-http-task-equivalent" | "internal-lifecycle-only";
  readonly scope: string;
  readonly source: readonly string[];
  readonly tests: readonly string[];
  readonly validation: "offline-regression;current-live-unclaimed";
  readonly executionState: "available-with-runtime-guards" | "available-with-network-guards" | "available-with-managed-file-guards" | "blocked" | "partially-blocked";
  readonly blockedReason?: string;
  readonly blockedDocumentTypes?: readonly number[];
  readonly inputDiscovery?: { readonly tool: "easyeda_control_api"; readonly arguments: Readonly<Record<string, unknown>> };
  readonly documentTypes?: readonly number[];
}

interface RouteGroup {
  readonly namespace: string;
  readonly methods: readonly string[];
  readonly route: ApiCoverageRoute;
}
const groups: RouteGroup[] = [];
const topologyBlock = "Generic ordinary schematic type-1 execution requires readDesignTopology in design-execution.ts. The exact schematic-topology reader is currently refused before dispatch: the pinned compiled-netlist path can annotate DESIGNATOR/UNIQUEID and invoke global SaveAll. A reviewed pure complete topology reader and disposable proof are required for this generic route; existing action schemas and historical tests do not make it callable. Separately listed sealed flat-display and flat-wire-reroute routes do not activate this route or other schematic operations.";

groups.push({ namespace: "dmt_Project", methods: ["openProject"], route: {
  tool: "easyeda_control_pcb209_worker_startup", selector: "footprint-combined/capture-project", implementation: "native-task-equivalent",
  scope: "Separate disposable main/renderer validation purpose sealed before launch. A challenge-bound helper readiness packet is required before application launch can be requested. Only an original factory failure with the exact original options, observed helper transport closure and zero stdin/launch dispatch can publish the separate v2 before-launch terminal; it proves neither Windows native-resource release nor termination and cannot clear earlier v1 unknown launches. A distinct fresh-facade historical abandonment path admits only the pinned old producer's unchanged intent-only record, explicit unknown-effects acceptance and original opaque observations excluding other Linux facades, Windows PowerShell and EasyEDA processes; its separate receipt relinquishes only that startup blocker and proves no non-dispatch, termination, native-resource release or design/persistence authority. Presence refusals expose only two validated presence flags and sample count, without process identity or termination authority. Published original main source/function construction is required before one checkpoint-bound project opening; browser/frame/UI and original worker/callback/cache/actor/route observations keep their exact guards. The startup transport passes the same complete qualified project source to its original execution construction runner without another source fetch and clears its temporary reference on every terminal capture path; source retention issues no native origin. Both transports retain the same original root/Job and absolute lifetime, with independent protocol counters and one main event cursor. Private clock integration now issues an origin only through the genuine combined owner and original registration/construction leases, with one paired router, allocator and event cursor. Fixed native begin/send/retire reserves the67-command unit within the unchanged normal-ID ceiling780, accounting for49 normal and18 cleanup commands; up to69 IDs cover original group handoff plus the unit. This supplies no public clock invocation action, complete writer reservation or connected clock/origin validation. The fourteen-stage backend-completion48-variant codec, genuine original completion issuer, atomic held-PB transfer and fixed native begin/send/retire are implemented privately. The current54-ID observation purpose refuses the75-command completion unit and final construction release before any held transfer. Known main stages require at least86 normal/41 cleanup/127 total; no complete writer reservation or public completion action follows. A confirmed journaled abort targets only this original Job, consumes the generation and blocks normal work; acknowledgment, observed original-root exit, empty Job and release are separate. Existing owners cannot upgrade. Opening may migrate, replay caches, restore tabs, use the network or automatically persist. Installed042605 passed historical relinquishment, original main construction, disposable project/worker/cache/peer capture and assignments, followed by retained original-Job exit/release and exact closed-fixture equality. Actor collection completed but publication refused an omitted combined-purpose prefix; the exact source fix preserves packet/timing/generation bounds and does not repair that consumed historical stage. Installed081309 was later admitted as the actual host-owned facade with complete packaged-file equality, then passed new original main/project/worker capture, assignments and four-sample actor publication over38481ms. Route cache construction, state and producer capture passed before dependency capture refused a missing optimized-away lexical class alias. The consumed route was not repeated. Source now retains eleven original manager/common/project/bus constructors and qualifies encoder ancestry without extra requests; this correction remains unvalidated live. One normal close acknowledged without exit, then one authorized original-Job abort, retained actual root-exit/empty-Job proof and release completed with the entire closed fixture byte-exact. No public backend request collector, actual document-clock invocation, copy/delete, explicit Save, complete startup or saved-result proof is mounted. The four-generation writer budget remains incomplete and refuses reservation.",
  source: ["current-footprint-combined-validation.ts", "current-footprint-copy-combined-profile.ts", "current-footprint-copy-combined-capacity.ts",
    "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts",
    "current-pcb-worker-startup-channel.ts", "current-pcb-worker-startup-transport.ts", "current-pcb-209-worker-bootstrap-source.ts",
    "current-footprint-copy-main-backend-runner.ts", "current-footprint-copy-main-request-runner.ts",
    "current-footprint-copy-main-completion-source.ts", "current-footprint-copy-main-completion-programs.ts",
    "current-footprint-copy-main-completion-protocol.ts", "current-footprint-copy-main-completion-origin.ts",
    "current-footprint-copy-main-completion-runner.ts", "current-footprint-copy-main-completion-native.ts", "current-footprint-copy-main-completion-wire.ts",
    "current-footprint-copy-main-capacity.ts",
    "current-footprint-copy-clock-rpc-native.ts", "current-footprint-copy-clock-rpc-origin.ts", "current-footprint-copy-clock-rpc-budget.ts", "../../scripts/pcb-diagnostic-owner.ps1",
    "current-footprint-combined-ready.ts", "current-footprint-combined-abandonment-contract.ts", "current-footprint-combined-abandonment-journal.ts",
    "current-footprint-combined-linux-facade-observation.ts", "current-footprint-combined-unknown-abandonment.ts"],
  tests: ["current-footprint-copy-combined.test.ts", "current-footprint-combined-lifecycle.test.ts", "current-pcb-worker-startup-validation.test.ts",
    "current-footprint-combined-ready.test.ts", "current-footprint-combined-before-launch-lifecycle.test.ts",
    "current-footprint-combined-unknown-abandonment.test.ts", "current-footprint-combined-linux-facade-observation.test.ts",
    "current-footprint-clock-source-transport.test.ts", "current-pcb-209-worker-bootstrap-source.test.ts",
    "current-footprint-copy-clock-rpc-wire.test.ts", "current-pcb-diagnostic-native.test.ts", "current-pcb-diagnostic-protocol-adapters.test.ts",
    "current-footprint-copy-main-request-runner.test.ts", "current-footprint-copy-main-completion.test.ts",
    "current-footprint-copy-main-completion-runner.test.ts", "current-footprint-copy-main-completion-wire.test.ts",
    "current-footprint-copy-clock-rpc-budget.test.ts", "current-footprint-clock-rpc-channel.test.ts", "current-footprint-combined-actor-journal.test.ts"],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "footprint-combined", query: { includeSchemas: true } } } },
} }, { namespace: "pcb_SelectControl", methods: ["getSelectedPrimitives"], route: {
  tool: "easyeda_control_pcb_geometry", selector: CURRENT_PCB_SELECTED_GEOMETRY_METHOD, implementation: "native-task-equivalent",
  scope: `Separately pinned current API/UI/PCB equivalent on one explicit active ordinary type-3 target. Captured frame/receiver and native identity checks around every awaited boundary. ${CURRENT_PCB_SELECTION_LIMITATION} Each family/selection/group is bounded to256 rows, identities256characters, combined evidence393216bytes; existing field bounds and projections apply. At most2304 observed family rows and256 returned rows. Native enumeration/serialization precedes bounds and is not cancelled by deadline. No selection, navigation, write, source export, Save or current connected validation.`,
  source: ["current-pcb-selection.ts", "current-pcb-geometry.ts", "current-pcb-geometry-program.ts", "current-pcb-geometry-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
  tests: ["current-pcb-geometry.test.ts", "current-pcb-geometry-registration.test.ts", "extension-api-coverage.test.ts"], documentTypes: [3],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-geometry", query: {
    method: CURRENT_PCB_SELECTED_GEOMETRY_METHOD, includeSchemas: true,
  } } } },
} }, { namespace: "dmt_Board", methods: ["getBoardInfo", "getAllBoardsInfo"], route: {
  tool: "easyeda_control_project_board", selector: "eda.dmt_Board.getBoardInfo|getAllBoardsInfo;loaded-local-project-no-editors", implementation: "native-task-equivalent",
  scope: "Explicit loaded local path-hash project/branch with no editor tabs or hidden frames. Two matching complete bounded native board key/value maps, bracketed by project-owner checks; selected lookup also matches its exact project-qualified native getter. The public getBoardInfo boardName selector is intentionally replaced by an explicit boardUuid contract; boardName is rejected. Preserves UUID, raw title, zIndex and ticket, with UUID comparison order rather than visual order. Genuine empty maps accepted; full sample bounded to 128 boards and 65536 UTF-8 bytes before selected filtering, after native enumeration. No public IDMT_BoardItem parity, child document membership, saved membership, worker lease, startup completion or writer authority. No canvas/source loading, clock/client, name lookup, navigation, cloud lookup, mutation or Save. Installed143713 passed both methods with one populated board and two matching samples per call. Empty-map behavior and later generations remain unvalidated live.",
  source: ["current-project-board-metadata.ts", "current-project-board-metadata-program.ts", "current-project-board-metadata-runtime.ts", "current-project-only-symbol-guard.ts", "current-disposable-open-profile.ts"],
  tests: ["current-project-board-metadata.test.ts", "current-project-board-metadata-runtime.test.ts", "current-project-board-metadata-registration.test.ts", "facade-mode.test.ts"],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-board", query: { includeSchemas: true } } } },
} }, { namespace: "dmt_Schematic", methods: ["getSchematicInfo", "getAllSchematicsInfo", "getSchematicPageInfo", "getAllSchematicPagesInfo"], route: {
  tool: "easyeda_control_project_schematic", selector: "eda.dmt_Schematic.getSchematicInfo|getAllSchematicsInfo|getSchematicPageInfo|getAllSchematicPagesInfo;loaded-local-project-no-editors", implementation: "native-task-equivalent",
  scope: "Explicit loaded local path-hash project/branch with no editor tabs or hidden frames. Two matching complete bounded schematic and sheet metadata maps, bracketed by project-owner checks, retain every observed child association. Selected lookup also matches its exact native getter. Independent native name/displayName, child title/displayTitle, source/version, board, ticket, updateTime and zIndex are preserved; UUID comparison order is not visual order. Complete combined sample is bounded before selected filtering. No public object parity, saved membership, worker lease, AST-holder preflight, startup completion or writer authority. No canvas/source loading, clock/client, name availability, navigation, cloud lookup, mutation or Save. Installed143713 passed the selected/all page methods with one container and two pages. Those calls do not validate the selected/all container methods, empty maps, saved membership or later generations.",
  source: ["current-project-schematic-metadata.ts", "current-project-schematic-metadata-program.ts", "current-project-schematic-metadata-runtime.ts", "current-project-only-symbol-guard.ts", "current-disposable-open-profile.ts"],
  tests: ["current-project-schematic-metadata.test.ts", "current-project-schematic-metadata-runtime.test.ts", "current-project-schematic-metadata-registration.test.ts", "facade-mode.test.ts"],
  documentTypes: [1], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-schematic", query: { includeSchemas: true } } } },
} }, { namespace: "dmt_Pcb", methods: ["getPcbInfo", "getAllPcbsInfo"], route: {
  tool: "easyeda_control_project_pcb", selector: "eda.dmt_Pcb.getPcbInfo|getAllPcbsInfo;loaded-local-project-no-editors", implementation: "native-task-equivalent",
  scope: "Explicit project/branch identity and optional selected PCB in an already loaded local path-hash project with no editor tabs or hidden frames. Fixed project-qualified native selected getter or complete key/value metadata map, captured RPC receivers and two matching observations bracketed by project-owner checks. Inventory admits genuine empty maps, sorts UUIDs rather than visual order, and is bounded to 128 PCBs and 65536 UTF-8 sample/envelope bytes after native enumeration. Preserves native title/display title, parent, board, source/version, ticket and updateTime. Source/version/board fallbacks are observed getter semantics, not lossless storage. No public-wrapper parity, worker lease, saved membership, startup completion or writer authority. No canvas load, navigation, cloud lookup, mutation or Save. Current-focused PCB metadata and renaming remain separate.",
  source: ["current-project-pcb-metadata.ts", "current-project-pcb-metadata-program.ts", "current-project-pcb-metadata-runtime.ts", "current-project-only-symbol-guard.ts", "current-disposable-open-profile.ts"],
  tests: ["current-project-pcb-metadata.test.ts", "current-project-pcb-metadata-runtime.test.ts", "current-project-pcb-metadata-registration.test.ts", "facade-mode.test.ts"],
  documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-pcb", query: { includeSchemas: true } } } },
} });

for (const [namespace, method] of [["dmt_Project", "openProject"], ["dmt_EditorControl", "openDocument"]] as const) {
  groups.push({ namespace, methods: [method], route: {
    tool: "easyeda_control_project_open", selector: "open;registered-local-disposable-pcb", implementation: "public-method",
    scope: "Separately pinned current-version one-shot ordinary opening from an empty registered editor. Exact raw Windows registered-path hash, original source digest, managed checkpoint and undeleted default-branch PCB membership; same-facade retained ordinary launch required. Project/document calls have separate consumed intents and orphan tracking. Normal migrations, cached upload replay, selected-project tab restoration and automatic Save are accepted effects, not unchanged-storage or design-writer proof. Inspect/observe never repeat navigation. Retirement invalidates only the original retained attempt after root/Job termination and exact session closure; lost supervision cannot be adopted. Native identity observation does not establish full initialization, rendering or persistence. No explicit Save, close, discard, restore or CAD edit.",
    source: ["current-disposable-open.ts", "current-disposable-open-runtime.ts", "current-disposable-open-checkpoint.ts", "current-disposable-open-profile.ts"],
    tests: ["current-disposable-open.test.ts", "current-disposable-open-runtime.test.ts", "current-disposable-open-checkpoint.test.ts"],
    documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-open", query: { includeSchemas: true } } } },
  } });
}

for (const [namespace, method, action] of [["dmt_Project", "openProject", "open-project"],
  ["dmt_EditorControl", "openDocument", "open-pcb"]] as const) {
  groups.push({ namespace, methods: [method], route: {
    tool: "easyeda_control_pcb209_opening", selector: action, implementation: "native-task-equivalent",
    scope: `Separately pinned installed209 validation-only native equivalent, not public SDK execution. Original pcb209-* native owner, exact registered disposable project/checkpoint and default-branch PCB membership only. ${action === "open-project" ? "One project opening from the source-qualified empty UI; it does not create the PCB frame." : "One retained PCB opening after the same owner's accepted project opening; the caller cannot substitute another document."} Each stage consumes its intent once; inspect after ambiguity without replay. Normal restoration, migration, cache replay and automatic Save are accepted opening effects, not unchanged-storage proof. Separate UI/PCB source and frame/identity observations do not prove startup completion, ratline completion, complete design contents, persistence or writer authority. The original native owner must remain through normal close, proved root/Job termination, helper release and record settlement. No historical-owner adoption, worker/model capture, caller code/protocol, general navigation, CAD edit, explicit Save, force termination or Save/Discard choice. This route does not admit older diagnostic purposes or inherit their validation.`,
    source: ["current-pcb-209-opening-validation.ts", "current-pcb-209-opening-profile.ts", "current-pcb-diagnostic-installation.ts",
      "current-pcb-diagnostic-owner.ts", "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-opening.ts", "current-pcb-diagnostic-pcb-opening.ts", "current-disposable-open-checkpoint.ts"],
    tests: ["current-pcb-209-opening.test.ts", "current-pcb-209-opening-registration.test.ts", "current-pcb-diagnostic-lifecycle.test.ts"],
    documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
  } });
}

groups.push({ namespace: "pcb_Layer", methods: ["getAllLayers", "getTheNumberOfCopperLayers"], route: {
  tool: "easyeda_control_pcb209_opening", selector: "observe-layers", implementation: "native-task-equivalent",
  scope: "Separately pinned installed209 disposable original-owner layer observation, not public SDK execution. After accepted checkpoint-bound PCB opening and exact UI/PCB source/identity admission, one consumed stage obtains two complete matching native layer collections with original receiver/target checks around each await. At most512 layers and65536 native UTF-8 bytes; nine-field getAllLayers projection and enabled native SIGNAL/PLANE count plus two share those samples. Raw malformed color strings are preserved, not repaired. RPC bookkeeping and possible lazy identity-environment initialization are incidental effects. This proves neither physical stackup, complete startup/ratline delivery, saved contents nor writer/Save authority. Original normal close, termination and release remain required. getCurrentLayer is still excluded; legacy206 owners cannot select this command.",
  source: ["current-pcb-209-layers.ts", "current-pcb-209-opening-validation.ts", "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-owner.ts", "current-pcb-layers.ts"],
  tests: ["current-pcb-209-layers.test.ts", "current-pcb-209-opening.test.ts", "current-pcb-209-opening-registration.test.ts", "current-pcb-diagnostic-owner.test.ts", "current-pcb-diagnostic-lifecycle.test.ts"],
  documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
} });

for (const [family, detail] of [
  ["Line", "Line returns native mil endpoints and width with raw displayed net spelling; partition and full model/source membership are omitted."],
  ["Arc", "Arc returns native mil endpoints/width, degree arcAngle and interactive mode without public one-decimal rounding. Center/radius/sweep are omitted, so endpoints and angle are not complete arc reconstruction and a full-circle case can project zero angle."],
  ["Via", "Via returns native mil center and doubled radii without public one-decimal radius rounding, type, nullable blind-via name, start/end layers and observed mask fields. Unused-layer/suture state and rule resolution are omitted."],
  ["String", "String returns parentless native text views only, with text/font/style/display flags, positionIsNull and serialized silkColor. Internal distances scale to mil and radians to degrees. Empty strings remain empty; serialized null color does not prove raw model color absence. Existing font caches are read, not loaded or refreshed. Glyphs, outlines, full font contents, partition/group, zIndex and parent/source ownership are omitted."],
] as const) {
  groups.push({ namespace: `pcb_Primitive${family}`, methods: ["getAll", "getAllPrimitiveId"], route: {
    tool: "easyeda_control_pcb209_opening", selector: "observe-primitives", implementation: "native-task-equivalent",
    scope: `Separately pinned installed209 disposable original-owner observation, not public SDK execution or instance parity. After accepted checkpoint-bound PCB opening and exact UI/PCB source/identity admission, one consumed stage observes complete ordered Line/Arc/Via/parentless String projections twice. Each family returns DTO rows and IDs from the same samples. Captured receiver/target checks surround every await; native tab/type identity brackets each four-family sample. Only existing stateWatcher views are included; models without views, parented String and other families are excluded, so empty results do not prove an empty PCB or complete canvas membership. ${detail} All four families share an aggregate393216-byte native/final result limit, with at most256 rows per family and256characters per ID. Missing/undefined projected fields, non-finite or signed-zero numbers, malformed Unicode, unsupported modes, sparse arrays, accessors, changed projections and duplicate/cross-family IDs refuse without partial output. Nullable nets and names preserve null versus empty string. Vendor enumeration/serialization precedes output bounds and is not cancelled by them; samples are sequential, not atomic. Unfiltered getAll and ordered getAllPrimitiveId subsets only, with no filters, requested-ID lookup or selection. No complete startup/ratline delivery, saved/source membership, connectivity, writer/Save authority, navigation, edit or explicit Save. Original normal close, retained root/Job termination and release remain required; legacy206 owners cannot select this command.`,
    source: ["current-pcb-209-primitives.ts", "current-pcb-209-opening-validation.ts", "current-pcb-209-opening-profile.ts",
      "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts",
      "current-pcb-diagnostic-pipe.ts", "current-pcb-diagnostic-protocol.ts", "current-pcb-geometry.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
    tests: ["current-pcb-209-primitives.test.ts", "current-pcb-209-primitives-native.test.ts", "current-pcb-209-opening.test.ts",
      "current-pcb-diagnostic-owner.test.ts", "current-pcb-diagnostic-pipe.test.ts", "current-pcb-diagnostic-lifecycle.test.ts", "extension-api-coverage.test.ts"],
    documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
  } });
}

for (const [family, detail] of [
  ["Component", "Placement, lock, layer and six selected optional metadata fields, with absent/undefined/present states retained separately. Formula values are not evaluated, and library identity is not verified."],
  ["Pad", "Native placement, supported copper and hole shapes, masks and thermal parameters. Shape-space polygon paths have no assumed board transform; no resolved physical stack, rule refresh, parent proof or fabrication geometry."],
  ["Attribute", "Observed component parent groups, including empty groups, and current native attribute text/style. Component/group order and membership are compared, but reciprocal ownership and symbol-pin mapping are not proved."],
  ["Dimension", "Native Length/Radius/Protractor coordinates and annotation style. Canvas units reflect the current getter's override, not verified stored units or measured rendering."],
  ["Image", "Combined Image/Picture placement, dimensions and display flags only. Asset paths/content, rendered boundaries and saved ownership remain excluded."],
] as const) {
  groups.push({ namespace: `pcb_Primitive${family}`, methods: ["getAll", "getAllPrimitiveId"], route: {
    tool: "easyeda_control_pcb209_opening", selector: "observe-extended-primitives", implementation: "native-task-equivalent",
    scope: `Separately pinned installed209 original-owner disposable collection observation, not public SDK instance parity. Two matching complete ordered native projections for Component, Pad, Attribute, Dimension and Image follow exact PCB source/identity admission, retaining the captured receiver and target around every await. ${detail} At most256 rows per family,256 Attribute parent groups and393216 UTF-8 bytes for the whole native/final packet. Only existing loaded views are projected; empty output does not prove an empty board. Unsupported fields/shapes, malformed Unicode, sparse/accessor arrays, non-finite/signed-zero numbers, duplicate IDs and changed samples refuse whole. No caller filters, selected IDs, exact-ID lookup, source export, edits or explicit Save. Observations are sequential and native serialization precedes output bounds. No complete startup, source/SQL baseline, connectivity, persistence or writer authority. The one-shot stage and original normal-close/root/Job/release lifecycle remain mandatory; older206 owners cannot select it.`,
    source: ["current-pcb-209-extended-primitives.ts", "current-pcb-209-opening-validation.ts", "current-pcb-209-opening-profile.ts",
      "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts",
      "current-pcb-diagnostic-pipe.ts", "current-pcb-diagnostic-protocol.ts", "current-pcb-geometry.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
    tests: ["current-pcb-209-extended-primitives.test.ts", "current-pcb-209-extended-primitives-native.test.ts", "current-pcb-209-opening.test.ts",
      "current-pcb-diagnostic-owner.test.ts", "current-pcb-diagnostic-pipe.test.ts", "current-pcb-diagnostic-lifecycle.test.ts", "extension-api-coverage.test.ts"],
    documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
  } });
}

groups.push({ namespace: "pcb_PrimitivePad", methods: ["getAll", "getAllPrimitiveId"], route: {
  tool: "easyeda_control_pcb209_opening", selector: "observe-pad-shapes", implementation: "native-task-equivalent",
  scope: "Separately pinned installed209 original-owner disposable Pad observation. Two matching complete loaded-view Pad collections retain the unchanged supported Pad DTO plus per-ID native special top/inner/bottom style groups. Empty groups mean only that the native serializer emitted none. Nonempty groups require exactly ordered native selectors[1,1],[1,2],[2,2] and supported ELLIPSE/OVAL/RECT dimensions with rectangle corner percent. These selectors are style groups, not physical layer intervals. NGON, incomplete polygon special groups and inner-only handler gaps remain unsupported. At most256 Pad rows and393216 UTF-8 bytes in native/final results; bounded output does not cancel preceding vendor enumeration. Exact original PCB source/target/receiver and normal cleanup remain required. No public SDK instance/getState parity, physical stack expansion, reciprocal parent proof, connectivity, saved geometry, edit, Save or writer baseline. Existing v1 results/decoders remain unchanged. Digest-bound historical Pad queries preserve the selected rows' observed groups without fresh RPCs or present-state authority.",
  source: ["current-pcb-209-pad-shapes.ts", "current-pcb-209-observation-query.ts", "current-pcb-209-opening-validation.ts",
    "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts",
    "current-pcb-diagnostic-pipe.ts", "current-pcb-diagnostic-protocol.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
  tests: ["current-pcb-209-pad-shapes.test.ts", "current-pcb-209-pad-shapes-native.test.ts", "current-pcb-209-observation-query.test.ts",
    "current-pcb-209-opening.test.ts", "current-pcb-diagnostic-owner.test.ts", "current-pcb-diagnostic-pipe.test.ts",
    "current-pcb-diagnostic-lifecycle.test.ts", "extension-api-coverage.test.ts"],
  documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
} }, { namespace: "pcb_PrimitiveImage", methods: ["getAll", "getAllPrimitiveId"], route: {
  tool: "easyeda_control_pcb209_opening", selector: "observe-image-shapes", implementation: "native-task-equivalent",
  scope: "Separately pinned installed209 original-owner disposable Image/Picture observation. Two matching native loaded-view collections retain placement/display DTOs and exact per-ID association to bounded serialized vector paths or opaque Picture asset references. Vector paths accept only the reviewed native command grammar and retain native coordinates/color; no SVG parser, image loader or filesystem/network read is provided. Picture references are opaque data, never resolved paths or authority to load an asset. At most256 rows and393216 UTF-8 bytes per native/final result; serializer work precedes these bounds. Exact original PCB source/target/receiver and one-shot cleanup remain required. No public SDK instance parity, asset content/availability/ownership, rendered boundaries, saved membership, edit, Save or writer authority. Existing v1 observations remain unchanged. Historical Image queries preserve only the selected rows' descriptors and grant no present-state proof.",
  source: ["current-pcb-209-image-shapes.ts", "current-pcb-209-observation-query.ts", "current-pcb-209-opening-validation.ts",
    "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts",
    "current-pcb-diagnostic-pipe.ts", "current-pcb-diagnostic-protocol.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
  tests: ["current-pcb-209-image-shapes.test.ts", "current-pcb-209-image-shapes-native.test.ts", "current-pcb-209-observation-query.test.ts",
    "current-pcb-209-opening.test.ts", "current-pcb-diagnostic-owner.test.ts", "current-pcb-diagnostic-pipe.test.ts",
    "current-pcb-diagnostic-lifecycle.test.ts", "extension-api-coverage.test.ts"],
  documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
} });

for (const [family, selector, module, methods, scope] of [
  ["Arc", "observe-arc-shapes", "arc-shapes", ["getAll", "getAllPrimitiveId"],
    "Complete supported Arc DTOs plus ordered native center/radius in mil, inclusive zero-to-two-pi endpoint radians and direction. Native endpoint and modulo-angle arithmetic is checked before projection, then independently correlated after unit conversion. Coincident endpoints and modulo angle zero do not establish full-circle rendering."],
  ["Poured", "observe-poured-shapes", "poured-shapes", ["getAll"],
    "Existing loaded native copper fill rows retain their own IDs, first-appearance parent groups, every serialized contour, raw style and optimization presence states. Fill IDs are not the public parent's primitiveId. Coordinates and dimensions use native ten-mil units; ARC sweeps use degrees. The serializer can omit tiny segments or an ellipse's second radius. No public grouped-instance parity, getAllPrimitiveId ordering, copper rebuild, freshness or fabrication geometry is claimed."],
] as const) {
  groups.push({ namespace: `pcb_Primitive${family}`, methods, route: {
    tool: "easyeda_control_pcb209_opening", selector, implementation: "native-task-equivalent",
    scope: `Separately pinned installed209 original-owner disposable observation. ${scope} Two complete ordered samples must match; exact target/source/frame/receiver checks run around each await. At most256 rows and393216 UTF-8 bytes per packet/result. Native enumeration precedes bounds and the ten-second deadline does not cancel vendor work. Native dispatch requires nine commands remaining in the unchanged103-command original transport budget; capacity refusal still consumes the lifecycle intent. Digest-bound historical queries preserve descriptors, groups, units and scope. No complete source membership, connectivity, persistence, editing, Save or writer baseline. Existing observation versions remain unchanged.`,
    source: [`current-pcb-209-${module}.ts`, "current-pcb-209-observation-query.ts", "current-pcb-209-opening-validation.ts",
      "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts",
      "current-pcb-diagnostic-pipe.ts", "current-pcb-diagnostic-protocol.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
    tests: [`current-pcb-209-${module}.test.ts`, `current-pcb-209-${module}-native.test.ts`, "current-pcb-209-observation-query.test.ts",
      "current-pcb-209-opening.test.ts", "current-pcb-diagnostic-owner.test.ts", "current-pcb-diagnostic-pipe.test.ts",
      "current-pcb-diagnostic-lifecycle.test.ts", "extension-api-coverage.test.ts"],
    documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
  } });
}

for (const [namespace, methods] of [
  ["pcb_SelectControl", ["getSelectedPrimitives", "getAllSelectedPrimitives", "getAllSelectedPrimitives_PrimitiveId"]],
  ["pcb_PrimitiveComponent", ["getAllPinsByPrimitiveId"]],
] as const) {
  groups.push({ namespace, methods, route: {
    tool: "easyeda_control_pcb209_opening", selector: "observe-selection-relations", implementation: "native-task-equivalent",
    scope: "Separately pinned installed209 original-owner disposable observation, not public SDK execution or instance parity. One consumed stage combines nine supported loaded-view families, complete ordered selected IDs and0..16 explicitly requested Component child-pad lists. Each selected ID must resolve exactly once or the whole result refuses; unsupported selected types and parented String are never dropped. Native child lists preserve empty versus null, request/child order and complete IDs, with number/net/layer/lock/metallization/type correlated to global Pad DTOs. Child geometry is not used because its units and rounding differ. Duplicate assignments across requested parents refuse without proving reciprocal ownership or unrequested parents. Two matching samples bracket selection and native identity, rechecking the original target/receiver around every await. At most256 rows per family/selection/child references and393216 UTF-8 bytes per native/final packet. Existing projection omissions and serializer effects remain; sequential matching is not atomic or complete stored membership. The original normal-close/root/Job/release lifecycle remains required. No selection change, edit, Save, connectivity, symbol-pin mapping, persistence or writer authority. Separate query-observation reads one published historical snapshot by exact record digest; it is not fresh get/getAll execution and does not combine stages or grant live ownership.",
    source: ["current-pcb-209-selection-relations.ts", "current-pcb-209-opening-validation.ts", "current-pcb-diagnostic-lifecycle.ts",
      "current-pcb-diagnostic-lifecycle-journal.ts", "current-pcb-diagnostic-owner.ts", "current-pcb-diagnostic-pipe.ts",
      "current-pcb-diagnostic-protocol.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
    tests: ["current-pcb-209-selection-relations.test.ts", "current-pcb-209-selection-relations-native.test.ts",
      "current-pcb-209-opening.test.ts", "current-pcb-diagnostic-lifecycle.test.ts", "current-pcb-diagnostic-owner.test.ts",
      "current-pcb-diagnostic-pipe.test.ts", "extension-api-coverage.test.ts"],
    documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-opening", query: { includeSchemas: true } } } },
  } });
}

function add(namespace: string, methods: readonly string[], tool: string, selector: string,
  implementation: ApiCoverageRoute["implementation"], scope: string, source: readonly string[], tests: readonly string[], admittedDocumentTypes?: readonly number[]): void {
  let inputDiscovery: ApiCoverageRoute["inputDiscovery"];
  const action = selector.split(";")[0] ?? "";
  const family = tool === "easyeda_control_library" ? "library" : "design";
  if (tool === "easyeda_control_library" || (tool === "easyeda_control_design" && /^(?:pcb|sch|footprint)\./u.test(action))) {
    const selectorQuery = action.endsWith(".*") ? { prefix: action.slice(0, -1) } : { operationAction: action };
    inputDiscovery = { tool: "easyeda_control_api", arguments: { request: { action: "operations", query: { family, ...selectorQuery, includeSchemas: true } } } };
  }
  const schematicWrite = tool === "easyeda_control_design" && action.startsWith("sch.") && !selector.includes("documentType=2");
  const sharedLifecycle = implementation === "internal-lifecycle-only" && namespace !== "pcb_Document";
  let executionState: ApiCoverageRoute["executionState"] = "available-with-runtime-guards";
  if (schematicWrite) { executionState = "blocked"; }
  else if (sharedLifecycle) { executionState = "partially-blocked"; }
  let documentTypes: readonly number[] | undefined = admittedDocumentTypes;
  if (selector.includes("documentType=2")) { documentTypes = [2]; }
  else if (schematicWrite) { documentTypes = [1]; }
  const blocked = schematicWrite || sharedLifecycle;
  groups.push({ namespace, methods, route: { tool, selector, implementation, scope, source: blocked ? [...source, "design-execution.ts", "design-topology.ts", "exact-readers.ts"] : source,
    tests, validation: "offline-regression;current-live-unclaimed", executionState,
    ...(blocked ? { blockedReason: topologyBlock, blockedDocumentTypes: [1] } : {}),
    ...(documentTypes === undefined ? {} : { documentTypes }),
    ...(inputDiscovery === undefined ? {} : { inputDiscovery }) } });
}

for (const [namespace, method] of [["pcb_SelectControl", "getAllSelectedPrimitives_PrimitiveId"],
  ["pcb_PrimitiveLine", "getAllPrimitiveId"], ["pcb_PrimitiveArc", "getAllPrimitiveId"],
  ["pcb_PrimitiveVia", "getAllPrimitiveId"], ["pcb_PrimitiveComponent", "getAllPrimitiveId"],
  ["pcb_PrimitivePad", "getAllPrimitiveId"], ["pcb_Primitive", "getPrimitiveTypeByPrimitiveId"]] as const) {
  groups.push({ namespace, methods: [method], route: {
    tool: "easyeda_control_pcb_identities", selector: `eda.${namespace}.${method}`, implementation: "native-task-equivalent",
    scope: "Separately pinned current API/UI/PCB native view identity subset. Explicit ordinary active PCB project/branch/document/tab, retained frame/receiver and two matching ordered ID observations. Selected IDs preserve observed selection; unfiltered Line/Arc/Via/Component/Pad IDs enumerate loaded views. Type lookup admits only a positive unique membership in Line/Arc/Via, not Component/Pad; missing or ambiguous IDs refuse. No filters, complete stored inventory, root/inherited ownership, ComponentPad associations, geometry, connectivity, public-wrapper dispatch, selection change, navigation or Save. Vendor enumeration and full DTO allocation precede output bounds; limits do not cancel execution or bound cache/child serialization work.",
    source: ["current-pcb-identities.ts", "current-pcb-identities-program.ts", "current-pcb-identities-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: ["current-pcb-identities.test.ts", "facade-mode.test.ts"], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-identities", query: { method: `eda.${namespace}.${method}`, includeSchemas: true } } } },
  } });
}

groups.push({ namespace: "pcb_PrimitiveAttribute", methods: ["getAllPrimitiveId"], route: {
  tool: "easyeda_control_pcb_identities", selector: "eda.pcb_PrimitiveAttribute.getAllPrimitiveId", implementation: "native-task-equivalent",
  scope: "Separately pinned current API/UI/PCB loaded-view Attribute identities. Empty arguments and explicit ordinary active type-3 project/branch/document/tab only. Captured native frame/receiver and surrounding native identity checks; two matching ordered samples retain component parent groups, including empty groups, before flattening attribute IDs. Returns only IDs and observed parentPrimitiveId associations, not reciprocal model ownership, complete stored ownership, attribute fields, geometry or saved membership. Only existing component stateWatcher views participate. Duplicate parents, duplicate or parent-colliding attribute IDs, malformed groups and association drift refuse. At most20000 groups/20000 total attribute IDs/256characters per ID/393216bytes evidence; aggregate lengths are checked before flattening. Native enumeration and full component/attribute serialization precede output bounds and are not cancelled by timeout. Existing footprint/device/font caches and pad/via data are read; an empty pad-length singleton may be allocated. No library fetch, filters, Attribute positive type lookup, selection, navigation, edit, source export or Save. No current connected validation; legacy separately pinned routes remain unchanged.",
  source: ["current-pcb-identities.ts", "current-pcb-identities-program.ts", "current-pcb-identities-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
  tests: ["current-pcb-identities.test.ts", "extension-api-coverage.test.ts"], documentTypes: [3],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-identities", query: { method: "eda.pcb_PrimitiveAttribute.getAllPrimitiveId", includeSchemas: true } } } },
} });

for (const family of ["Dimension", "Image"] as const) {
  const method = `eda.pcb_Primitive${family}.getAllPrimitiveId`;
  groups.push({ namespace: `pcb_Primitive${family}`, methods: ["getAllPrimitiveId"], route: {
    tool: "easyeda_control_pcb_identities", selector: method, implementation: "native-task-equivalent",
    scope: `Separately pinned current API/UI/PCB loaded-view identity read. Empty arguments and explicit ordinary active type-3 project/branch/document/tab only. Captured native frame/receiver, surrounding native identity checks and two matching ordered samples. ${family === "Dimension"
      ? "Concatenates length, radius and angle dimension manager views; annotation text and coordinates remain unprojected."
      : "Concatenates vector Image then Picture manager views; native path conversion allocates temporary geometry. Existing templates/hash metadata are serialized without image-asset loading; neither paths nor picture content leave the adapter."} Neither collection filters parents or includes models without a loaded stateWatcher. Returns only globalIndex identities, not geometry, complete source inventory, root ownership, renderability or saved membership. At most20000 IDs/256characters each/393216bytes evidence; native enumeration and full serialization precede output bounds and are not cancelled by timeout. Positive type lookup remains Line/Arc/Via only. No filters, selection, navigation, writer or Save. No current connected validation. Fill/Polyline/Region are not enabled on this current adapter because their polygon serializer can rebuild native children. Legacy separately pinned routes remain unchanged.`,
    source: ["current-pcb-identities.ts", "current-pcb-identities-program.ts", "current-pcb-identities-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: ["current-pcb-identities.test.ts", "extension-api-coverage.test.ts"], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-identities", query: { method, includeSchemas: true } } } },
  } });
}

for (const family of ["Line", "Arc", "Via", "Component", "Pad"] as const) {
  const namespace = `pcb_Primitive${family}`;
  for (const method of ["getAll", "get"] as const) {
  groups.push({ namespace, methods: [method], route: {
    tool: "easyeda_control_pcb_geometry", selector: `eda.${namespace}.${method}`, implementation: "native-task-equivalent",
    scope: `Separately pinned current API/UI/PCB loaded-view geometry subset. Explicit ordinary active PCB project/branch/document/tab, retained native frame/receiver and two matching ordered bounded observations. Unfiltered Line/Arc/Via geometry and narrow Component/Pad state; fixed projections in mil/degrees without public-wrapper rounding, not public class instances or public-wrapper dispatch. Component admits layers1/2 and six optional raw strings: designator, name, manufacturer, manufacturerPart, supplier and supplierPart. Missing or own-undefined values omit the field; empty strings and Name formulas remain exact. Selected null/non-string/inherited/accessor values refuse. Metadata is not verified part identity or schematic linkage. Pad admits layers1/2/12 and pad types0/1/2. Pad net spelling and empty-string versus null are preserved; pad number requires a bounded string. Pad hole is null or a strict ROUND/SLOT DTO with nonnegative mil dimensions, mil offsets and degree rotation relative to the pad. Holeless rows skip unused native hole scalars; native zero dimensions do not establish fabrication validity. Default copper ELLIPSE/OVAL/RECT parameters retain native0.1mil rounding and RECT corner ratio percent, not radius. POLYGON copies and compares the bounded native pathSource in native-pad-style coordinates: L/ARC/CARC/C/CIRCLE, mil coordinates/radii and degree sweep, native four-decimal rounding, at most2048tokens per pad. Native serialization selects the last available layer1/2/15 style and can omit tiny/unsupported segments; no placement/mirror transform, complete rendered geometry or populated live validation is claimed. NGON refuses and physical-layer stacks remain omitted. Mask mode1/2 and top/bottom solder plus one shared paste value are observed mil, not refreshed rules or explicit overrides. Nullable thermal mode0 includes mil clearance/spokeWidth and degree angle; modes1/2 omit unused dimensions. Null is not no connection; inherited values and actual pours remain unverified. Not complete shape reconstruction; Arc center/radius/sweep are omitted and full-circle angle can project to zero. Other Component attributes, library enrichment and reverse ownership are omitted. Net labels and lock flags are not connectivity or editing authority. No filters, complete saved membership, selection change, navigation, write or Save. Vendor enumeration and full DTO allocation precede output bounds; limits do not cancel execution or bound cache/child serialization work.${method === "get" ? " This get route accepts only 1..256 distinct bounded primitiveIds in an array, selects DTOs in caller order after complete-family checks and refuses any unavailable ID. It does not support scalar get or public missing-ID skipping. Returned and full-family observed row counts are distinct; all family bounds still apply before selection." : " This getAll route accepts empty arguments only."}`,
    source: ["current-pcb-geometry.ts", "current-pcb-geometry-program.ts", "current-pcb-geometry-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: ["current-pcb-geometry.test.ts", "facade-mode.test.ts", "current-pcb-geometry-registration.test.ts"], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-geometry", query: { method: `eda.${namespace}.${method}`, includeSchemas: true } } } },
  } });
  }
}

for (const method of ["get", "getAll", "getAllPrimitiveId"] as const) {
  const identitiesOnly = method === "getAllPrimitiveId";
  const adapter = identitiesOnly ? "current-pcb-identities" : "current-pcb-geometry";
  groups.push({ namespace: "pcb_PrimitiveString", methods: [method], route: {
    tool: identitiesOnly ? "easyeda_control_pcb_identities" : "easyeda_control_pcb_geometry",
    selector: `eda.pcb_PrimitiveString.${method}`, implementation: "native-task-equivalent",
    scope: `Separately pinned current API/UI/PCB String loaded-view read on an explicit ordinary active type-3 project/branch/document/tab. The captured native frame and receiver, native identity bracketing and two complete matching ordered samples retain the existing guards. Native string-getAll excludes parented views; component attributes and inherited text are outside this subset. Existing font caches are observed by the native serializer, not loaded or refreshed. No complete source ownership, saved membership, rendered-text/font validity, connectivity or persistence claim; no public wrapper or SDK constructor, selection, navigation, edit or Save. Vendor enumeration/serialization precedes bounds and is not cancelled by the deadline. ${identitiesOnly
      ? "Empty arguments only. Returns at most 20000 distinct bounded IDs, with 393216-byte evidence limit. Only globalIndex leaves the adapter; text, font and geometry are not read by its projection. Positive generic type lookup remains Line/Arc/Via only."
      : `Returns at most 256 plain String DTOs with identity/lock, native layer, placement, raw text/fontFamily, fontSize, lineWidth, alignMode1..9, rotation, reverse, expansion, mirror, key, showKey, showValue, positionIsNull and serialized silkColor. Native distances multiply by10 to mil; rotation multiplies by180 then divides by Math.PI. No defaults/coercion, net, font-cache, outline, zIndex, partition/group or model-type data. Empty text/font/key strings stay empty; only silkColor accepts null. Its native color.toString()||null normalization cannot prove raw-model color; nonempty strings are not validated CSS. Missing projected values, signed zero and nonfinite data refuse. Text bound65536UTF-16 units, fontFamily/key1024, serialized silkColor128, identity256, scalar magnitude1e12, combined evidence393216bytes. Full-family bounds/stability apply before selection. ${method === "get"
        ? "Accepts only1..256 distinct primitiveIds in an array, returns caller order and refuses any unavailable ID. No scalar get or missing-ID skipping."
        : "Empty arguments only; native family order is preserved."}`}`,
    source: [`${adapter}.ts`, `${adapter}-program.ts`, `${adapter}-runtime.ts`, "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: [`${adapter}.test.ts`, ...(identitiesOnly ? [] : ["current-pcb-geometry-registration.test.ts"])], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: {
      action: identitiesOnly ? "pcb-identities" : "pcb-geometry", query: { method: `eda.pcb_PrimitiveString.${method}`, includeSchemas: true },
    } } },
  } });
}

for (const method of ["getAll", "get"] as const) {
  groups.push({ namespace: "pcb_PrimitiveAttribute", methods: [method], route: {
    tool: "easyeda_control_pcb_geometry", selector: `eda.pcb_PrimitiveAttribute.${method}`, implementation: "native-task-equivalent",
    scope: `Separately pinned current API/UI/PCB Attribute loaded-view geometry. Exact active ordinary type-3 target, captured frame/receiver and two complete matching native attribute-getAll samples. Retains ordered component parent groups including empty groups and all child IDs; parentPrimitiveId is an observed association, not reciprocal ownership or saved membership. DTOs copy bounded own identity/lock, layer, numeric placement, key/value, keyVisible/valueVisible, fontFamily/fontSize/lineWidth, alignMode1..9, degree rotation, reverse/expansion/mirror, positionIsNull and serialized silkColor. Distances multiply by10 to mil; radians multiply by180 then divide by Math.PI. Value is native model text and may already contain an expanded Name formula; raw formulaName and evaluation are omitted. Null coordinates are refused rather than coerced; positionIsNull stays separate. Empty strings remain exact; only serialized silkColor accepts null, which does not prove raw-model color, and nonempty colors are not validated CSS. Existing font/footprint/device caches are read without loading assets. No fonts/outlines, full source, rendered-text, connectivity, ownership, persistence, write or Save claim. Complete ordered groups and all projected rows must match before selection, with duplicate/colliding identities refused. Bounds256groups/256totalrows/393216bytes apply before selection; native serialization still precedes those bounds. No filters, public wrapper, SDK constructor or positive type lookup. ${method === "get" ? "Only1..256 distinct primitiveIds in an array; exact caller order and all IDs required, no scalar get or missing-ID skipping." : "Empty arguments only; complete observed family and group order are preserved."}`,
    source: ["current-pcb-geometry.ts", "current-pcb-geometry-program.ts", "current-pcb-geometry-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: ["current-pcb-geometry.test.ts", "current-pcb-geometry-registration.test.ts"], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: {
      action: "pcb-geometry", query: { method: `eda.pcb_PrimitiveAttribute.${method}`, includeSchemas: true },
    } } },
  } });
}

for (const method of ["getAll", "get"] as const) {
  groups.push({ namespace: "pcb_PrimitiveDimension", methods: [method], route: {
    tool: "easyeda_control_pcb_geometry", selector: `eda.pcb_PrimitiveDimension.${method}`, implementation: "native-task-equivalent",
    scope: `Separately pinned current API/UI/PCB Dimension loaded-view geometry. Exact active ordinary type-3 target, captured frame/receiver and two complete matching native dimension-getAll samples. Retains Length then Radius then Angle manager order without a parent filter; only existing stateWatcher views participate. DTOs copy bounded own identity/lock, layer, exact dimensionType, coordinateSet, lineWidth, precision0..4 and canvasUnit. Length tuples have8numbers; Radius/Protractor tuples have6. Coordinates and nonnegative lineWidth are already mil and are not scaled again. canvasUnit preserves only current-document mm/cm/inch/mil: native getAll overwrites model units, so this is not the coordinate unit or verified annotation unit. No bare unit, rendered measurement, inferred length/radius/angle, annotation text/font/color/textFollow, reciprocal parent, partition/group, full source, connectivity, ownership, persistence, write or Save claim. Radius tuple includes a text anchor, not glyph bounds. Complete ordered projected rows must match before selection; duplicate identities and malformed tuples refuse. Bounds256rows/256characters per ID/scalar magnitude1e12/393216bytes apply before selection, while native enumeration/serialization precedes these bounds. No filters, public wrapper, SDK constructor, native generic getByIds or positive type lookup. ${method === "get" ? "Only1..256 distinct primitiveIds in an array; exact caller order and all IDs required, no scalar get or missing-ID skipping." : "Empty arguments only; complete observed family order is preserved."}`,
    source: ["current-pcb-geometry.ts", "current-pcb-geometry-program.ts", "current-pcb-geometry-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: ["current-pcb-geometry.test.ts", "current-pcb-geometry-registration.test.ts"], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: {
      action: "pcb-geometry", query: { method: `eda.pcb_PrimitiveDimension.${method}`, includeSchemas: true },
    } } },
  } });
}

for (const method of ["getAll", "get"] as const) {
  groups.push({ namespace: "pcb_PrimitiveImage", methods: [method], route: {
    tool: "easyeda_control_pcb_geometry", selector: `eda.pcb_PrimitiveImage.${method}`, implementation: "native-task-equivalent",
    scope: `Separately pinned current API/UI/PCB Image loaded-view placement. Exact active ordinary type-3 target, captured frame/receiver and two complete matching native image-getAll samples. Retains vector Image then Picture manager order without a parent filter; only existing stateWatcher views participate. DTOs preserve native imageType Image/Picture, identity/lock, layer, start x/y, nonnegative width/height, degree rotation and horizonMirror. Positions and sizes are already mil and are not scaled again. Zero dimensions remain observations, not renderability proof. Start is not a computed rotated bounding box; horizonMirror is the native model flag, not effective rendered mirroring. Native getByIds searches only vector images, so this get equivalent selects from the complete combined family. Template arrays, transformed pathString, Picture hashId, source/binary assets, color, partition/group, ownership and saved membership are omitted and not compared. Existing Picture serialization does not call its asset-backed source getter; vector template/path allocation still precedes facade bounds. No image-content, rendered-bounds, asset-availability, full source, connectivity, persistence or writer-baseline claim. Bounds256rows/256characters per ID/scalar magnitude1e12/393216bytes and complete ordered projected-row equality apply before selection. No public wrapper, SDK constructor, filters, positive generic type lookup, selection change, navigation, mutation or Save. ${method === "get" ? "Only1..256 distinct primitiveIds in an array; exact caller order and all IDs required, no scalar get or missing-ID skipping." : "Empty arguments only; complete observed family order is preserved."}`,
    source: ["current-pcb-image-geometry.ts", "current-pcb-geometry.ts", "current-pcb-geometry-program.ts", "current-pcb-geometry-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
    tests: ["current-pcb-image-geometry.test.ts", "current-pcb-geometry.test.ts", "current-pcb-geometry-registration.test.ts"], documentTypes: [3],
    validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
    inputDiscovery: { tool: "easyeda_control_api", arguments: { request: {
      action: "pcb-geometry", query: { method: `eda.pcb_PrimitiveImage.${method}`, includeSchemas: true },
    } } },
  } });
}

groups.push({ namespace: "lib_Symbol", methods: ["get"], route: {
  tool: "easyeda_control_project_symbol", selector: "eda.lib_Symbol.get", implementation: "native-task-equivalent",
  scope: "Separately pinned current project-local symbol metadata subset. One exact symbolUuid and explicit active ordinary PCB project/branch/document/tab target. Two matching bounded metadata observations correlate the loaded project owner and require the symbol to remain absent from the complete registered editor tree. Hidden or unregistered editors are not independently excluded. Raw tagsJson is retained without normalization. Retained manager/RPC references do not directly lease the module-private worker; workerIdentityVerified remains false. Not a cloud-library lookup, complete library inventory, symbol geometry, lossless stored META or persistence proof, and not authority to rename or edit. No geometry load, navigation, write or Save; legacy library writers and their existing restrictions are unchanged. The same tool separately accepts project-symbol-preflight: exact caller-supplied metadata comparison in a loaded project with no editor tabs. Discover that distinct request through project-symbol-preflight/project-symbol-preflight-validate; it is not this lib_Symbol.get request and grants no source provenance, backend actor/clock qualification, permission, startup, persistence or writer authority.",
  source: ["current-symbol-metadata.ts", "current-symbol-metadata-program.ts", "current-symbol-metadata-runtime.ts", "current-disposable-open-profile.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
  tests: ["current-symbol-metadata.test.ts", "facade-mode.test.ts"], documentTypes: [3],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-symbol", query: { method: "eda.lib_Symbol.get", includeSchemas: true } } } },
} }, { namespace: "pcb_PrimitiveComponent", methods: ["getAllPinsByPrimitiveId"], route: {
  tool: "easyeda_control_pcb_geometry", selector: "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId", implementation: "native-task-equivalent",
  scope: "Current pinned ordinary PCB forward child membership. One bounded component primitiveId and exact project/branch/document/tab target. Two matching complete samples validate component IDs, global Pad DTOs and native component child IDs with shared-field correlation. Returns global Pad DTOs in native child order, with observed component/pad counts and explicit reciprocalParentVerified:false and symbolPinMappingVerified:false. Full IDs come from the native child callback; no ID-prefix reconstruction or caller-derived parent getter. Empty membership requires an observed component. Unrelated pads remain outside the result but still participate in complete-family stability and bounds. This is not public ComponentPad instances, reverse ownership, symbol-pin mapping, saved membership, connectivity or writer authority. No selection, navigation, design edit, library fetch or Save. Native enumeration/serialization precedes output limits and is not cancelled by the observer deadline.",
  source: ["current-pcb-geometry.ts", "current-pcb-geometry-program.ts", "current-pcb-geometry-runtime.ts", "current-pcb-layers.ts", "sdk-local-runtime.ts"],
  tests: ["current-pcb-geometry.test.ts", "current-pcb-geometry-registration.test.ts"], documentTypes: [3],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-geometry", query: { method: "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId", includeSchemas: true } } } },
} }, { namespace: "pcb_Layer", methods: ["getAllLayers", "getTheNumberOfCopperLayers"], route: {
  tool: "easyeda_control_pcb_layers", selector: "explicit-current-pcb-layer-observation", implementation: "native-task-equivalent",
  scope: "Separately pinned current API 0.3.50/UI 3.2.196/PCB 3.2.193 layer metadata reader on an explicit project/branch/document/tab identity for an active ordinary type-3 PCB. Two complete matching samples use a captured native frame receiver with bracketing native identity checks. Ports the nine-field public projection or enabled native SIGNAL/PLANE count plus two; raw color strings remain unchanged. No public wrapper dispatch, legacy-route admission, source export, layer selection, navigation or Save. Not physical-stackup certification, an atomic lock or current connected validation. Vendor RPC bookkeeping and possible uninitialized environment defaults are incidental in-memory effects.",
  source: ["current-pcb-layers.ts", "current-pcb-layers-runtime.ts", "current-ui-implementation.ts", "sdk-local-runtime.ts", "facade-mode.ts"],
  tests: ["current-pcb-layers.test.ts", "current-pcb-layers-runtime.test.ts", "facade-mode.test.ts"],
  documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb-layers", query: { includeSchemas: true } } } },
} }, { namespace: "sys_ShortcutKey", methods: ["getShortcutKeys"], route: {
  tool: "easyeda_control_shortcuts", selector: "eda.sys_ShortcutKey.getShortcutKeys", implementation: "public-method",
  scope: "Separately pinned API 0.3.50/UI 3.2.196 and installed-209 API 0.3.59/UI 3.2.198 public shortcut-registry reads, without design context or legacy-route admission. The 206 scope remains 0-10; the 209 raw UI registry scope is 0-14 although its declaration lists only 0-10, so declarationScopeConformanceVerified remains false. Shortcut scope enums are not document types. Optional includeSystem defaults false. Two owner-stable bounded copies preserve raw key strings, order, duplicates and empty tokens. The 209 route additionally verifies both installed generation selectors before and after dispatch. No key execution, registration, navigation, settings or Save; the separate menu registry is excluded and vendor enumeration is not cancelled by the observer deadline. Neither source review nor offline regression establishes connected validation.",
  source: ["shortcut-keys.ts", "shortcut-keys-runtime.ts", "current-ui-implementation.ts", "editor-observation209-profile.ts", "sdk-local-runtime.ts", "sdk-public-utilities-profile.ts", "facade-mode.ts"],
  tests: ["shortcut-keys.test.ts", "shortcut-keys-runtime.test.ts", "editor-observation209-runtime.test.ts", "facade-mode.test.ts"],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "shortcuts", query: { includeSchemas: true } } } },
} });

add("sys_FileManager", ["getDocumentSource"], "easyeda_control_exact_read", "*-source", "public-method",
  "Complete active schematic, symbol, PCB or footprint source, bounded and normalized only for volatile DOCHEAD export fields.", ["exact-readers.ts"], ["exact-readers.test.ts"]);
groups.push({ namespace: "dmt_EditorControl", methods: ["zoomTo", "zoomToAllPrimitives", "zoomToSelectedPrimitives"], route: {
  tool: "easyeda_control_pcb209_opening", selector: "visual.perform-visual", implementation: "native-task-equivalent", documentTypes: [3],
  scope: "Separate EasyEDA3.2.209 original disposable visual owner only. Launch pcb209-visual-* with explicit visual-state acceptance; old opening, worker and main purposes cannot upgrade. After the sealed project/PCB opening and exact source-qualified active-frame admission, one journaled perform-visual chooses fit-all, fit-selected or zoom-to through the original captured receiver. fit-selected requires the complete ordered prior selected-ID list and rechecks that list after the call; no selection mutation is mounted. zoom-to requires explicit mil coordinates and scale ratio. The complete operation is bounded to12KiB, selection to256 distinct IDs and48KiB, raw result to128KiB, and the complete success/failure result is reserved before dispatch. The three-second observer disables later dispatch but cannot cancel an already sent native handler. Returned getBBox2 camera bounds are converted from native ten-mil units to mil; camera state is not independently double-sampled and render completion is not observed. Capacity refusal or missing replies consume the once-only lifecycle stage and grant no retry or automatic inverse. The separate confirmed abort-visual targets only its original retained Job; acknowledgment, observed original root exit, empty Job and release remain distinct. No direct SDK wrapper, omitted-tab/default argument, schematic/3D frame, PNG, selection/net highlighting, overlay timers, CAD source edit, explicit Save, complete-board baseline, ordinary-project or saved-result proof. Opening itself may restore tabs, replay caches, migrate and automatically persist files. Installed142600 passed one disposable zoom-to at0,0 mil/ratio1 with unchanged selection, normal root/Job exit, helper release and byte-exact closed fixture. Fit-all, fit-selected and other domains remain unvalidated. This historical case does not admit later source or loaded owners.",
  source: ["current-pcb-209-visual-actions.ts", "current-pcb-209-visual-validation.ts", "current-pcb-diagnostic-pipe.ts",
    "current-pcb-diagnostic-protocol.ts", "current-pcb-diagnostic-owner.ts", "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts", "../../scripts/pcb-diagnostic-owner.ps1"],
  tests: ["current-pcb-209-visual-actions.test.ts", "current-pcb-209-visual-native.test.ts", "current-pcb-diagnostic-protocol-adapters.test.ts", "current-pcb-209-visual-lifecycle.test.ts"],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-visual", query: { includeSchemas: true } } } },
} });
add("dmt_EditorControl", ["getCurrentRenderedAreaImage"], "easyeda_control_capture", "easyeda_canvas_capture", "public-method",
  "Legacy admitted runtime only. Current209 PNG capture remains unavailable: the native renderer can allocate RGBA, ImageData and canvas content before facade image bounds, while original frame/camera/renderer ownership through asynchronous capture and resource cleanup remain unqualified. The separate current209 viewport route returns camera bounds, not an image. Existing visible-canvas capture only, with an explicit tab equal to the proven active tab, unchanged before/after runtime fingerprint and post-capture context. The bridge calls the public image method and converts its Blob; the facade validates one complete bounded PNG and archives managed image evidence. Viewport-image observation only, not complete source, connectivity, persistence or visual acceptance. No omitted-tab default, foreign-tab access, native canvas-receiver identity or full declared-contract claim.",
  ["index.ts", "../../easyeda-bridge-extension/src/canvas-operations.ts", "../../easyeda-bridge-extension/src/binary-result-policy.ts"],
  ["facade-capture.test.ts", "../../easyeda-bridge-extension/tests/canvas-operations.test.ts"]);
add("dmt_EditorControl", ["zoomToRegion"], "easyeda_control_capture", "easyeda_canvas_capture_region", "public-method",
  "Only the existing capture-region workflow on the explicit proven active tab: finite nonzero bounds are normalized by the bridge, public zoomToRegion must not return false, and a bounded repaint wait precedes PNG capture. Runtime fingerprint and context are rechecked before managed evidence publication. This changes the visible viewport; there is no standalone zoom operation, native receiver binding, exact viewport-restoration promise, design-state proof or visual acceptance.",
  ["index.ts", "../../easyeda-bridge-extension/src/canvas-operations.ts"],
  ["facade-capture.test.ts", "../../easyeda-bridge-extension/tests/canvas-operations.test.ts"]);
for (const family of ["sch", "pcb"]) {
  add(`${family}_PrimitiveComponent`, ["getAll", "getAllPrimitiveId", "getAllPinsByPrimitiveId"], "easyeda_control_exact_read", `${family === "sch" ? "schematic" : "pcb"}-components`, "public-method",
    "Double-sampled complete component identities and selected state fields; mapper omissions remain reported.", ["exact-readers.ts"], ["exact-readers.test.ts"]);
  add(`${family}_Primitive`, ["getPrimitivesBBox"], "easyeda_control_exact_read", `${family === "sch" ? "schematic" : "pcb"}-components;includeBounds`, "public-method",
    "Bounds for selected components only; not a generic arbitrary primitive invocation.", ["exact-readers.ts"], ["exact-readers.test.ts"]);
}
for (const family of ["Arc", "Attribute", "Component", "Dimension", "Fill", "Image", "Line", "Object", "Pad", "Polyline", "Pour", "Poured", "Region", "String", "Via"]) {
  add(`pcb_Primitive${family}`, ["getAll", "getAllPrimitiveId"], "easyeda_control_exact_read", "pcb-inventory", "public-method",
    "Cross-checked ID enumeration; only monitored families have full typed state serialization. Enumeration does not prove unmonitored property completeness.", ["exact-readers.ts"], ["exact-readers.test.ts"]);
}
add("pcb_Drc", ["getCurrentRuleConfigurationName", "getCurrentRuleConfiguration", "getNetRules", "getNetByNetRules", "getRegionRules", "getAllNetClasses", "getAllDifferentialPairs", "getAllEqualLengthNetGroups", "getAllPadPairGroups", "getPadPairGroupMinWireLength"], "easyeda_control_exact_read", "pcb-rules", "public-method",
  "Complete bounded double-sampled supported PCB rule collections, retaining documented normalized/default behavior.", ["exact-readers.ts"], ["exact-readers.test.ts"]);
add("pcb_Net", ["getAllNetsName"], "easyeda_control_exact_read", "pcb-rules", "public-method", "Net-name inventory as part of exact rule reads.", ["exact-readers.ts"], ["exact-readers.test.ts"]);

for (const family of ["line", "arc", "via", "pad", "polyline", "region", "pour", "fill", "component"]) {
  const className = `${family[0]?.toUpperCase() ?? ""}${family.slice(1)}`;
  for (const method of ["create", "modify", "delete"]) {
    add(`pcb_Primitive${className}`, [method], "easyeda_control_design", `pcb.${family}.${method}`, "native-task-equivalent",
      "Operation-specific public/native transaction for representable reviewed PCB records; exact source delta, lock ancestry and persistence guards. Does not expose arbitrary public class instances or every declared property.",
      ["design-action.ts", "design-native-adapter.ts", "design-source-proof.ts"], ["design-native-adapter.test.ts", "design-source-proof.test.ts"]);
  }
}
for (const method of ["create", "modify", "delete"]) {
  add("pcb_PrimitiveString", [method], "easyeda_control_design", `footprint.text.${method}`, "native-task-equivalent",
    "Existing exact-owner project footprint only, document type 4: one standalone built-in-default-font STRING per operation through receiver-bound native history dispatch, exact source/peer preservation and library Save/close/reopen proof. Native mil geometry, explicit creation fields and named origin; no public-wrapper defaults. Modify preserves identity/layer and refuses reverse-state changes; delete has no automatic inverse. No type-3 PCB text, external fonts, placed-instance propagation, public pcb_PrimitiveString wrapper execution/parity, class-instance or bulk-delete arguments, or full declared-contract claim. Current-generation live validation remains unclaimed.",
    ["footprint-action.ts", "footprint-public-geometry.ts", "footprint-lifecycle.ts", "design-action.ts", "design-execution.ts"],
    ["footprint-action.test.ts", "footprint-public-geometry.test.ts", "footprint-lifecycle.test.ts"], [4]);
}
add("pcb_PrimitiveString", ["modify"], "easyeda_control_design", "pcb.text.modify", "native-task-equivalent",
  "One existing unlocked project-owned type-3 standalone STRING: exact x/y/text changes through the reviewed native source merge, complete native-source effect, explicit inverse and saved-project peer proof. All STRINGs require the bounded default-font/top-silkscreen/LEFT_BOTTOM/zero-angle/nonreverse profile. No creation, deletion, component ATTR, inherited text, custom fonts, groups, partitions, pours or generated copper. This does not invoke the public wrapper or its partial-assignment failure branch; no public-method parity, full declared-contract or current-generation connected lifecycle claim.",
  ["pcb-text-action.ts", "pcb-text-runtime.ts", "pcb-exact-frame.ts", "design-action.ts", "design-native-adapter.ts", "design-execution.ts"],
  ["pcb-text-action.test.ts", "design-native-adapter.test.ts", "pcb-dispatch-profile.test.ts", "design-persistence.test.ts"], [3]);
for (const method of ["create", "delete"]) {
  add("pcb_PrimitiveString", [method], "easyeda_control_design", `pcb.text.${method}`, "native-task-equivalent",
    `One project-owned type-3 standalone top-silkscreen default-font STRING addition or unlocked exact-ID removal. Creation has explicit x/y/text/fontSize/strokeWidth and a facade-reserved identity sealed with the prepared program before dispatch; no caller ID or native public-wrapper generation claim. Creation profile v2 fixes specialColor to explicit native-UI-default #000000; existing null/black values remain distinct and unchanged. Exact source/peer proof, captured frame, original acknowledgment and saved-project proof remain mandatory. Creation inverse deletes only its retained original identity; deletion has no inverse. No regeneration or redispatch during recovery, component ATTR, inherited text, fonts/styles/layers outside the conservative profile, pours or generated copper. Not public-wrapper parity or connected lifecycle validation. ${
      method === "create" ? "Creation-only retained-Save reconciliation requires the original six sealed phases and one successful Save/close/reopen acknowledgment. Exact v2 source, or the narrowly proven legacy v1 two-STRING cached-decoder case, may finish by read-only full-project proof. Legacy storage stays null, observed export stays black, and no Save, navigation or creation is repeated. Missing evidence or other deltas refuse." : "Consumed-Save deletion has no retained-Save recovery route."}`,
    ["pcb-text-lifecycle.ts", "pcb-text-lifecycle-runtime.ts", "pcb-text-action.ts", "pcb-exact-frame.ts", "design-action.ts", "design-execution.ts",
      ...(method === "create" ? ["pcb-text-retained-save.ts", "pcb-text-reload-history.ts", "native-history.ts"] : [])],
    ["pcb-text-lifecycle.test.ts", "pcb-text-action.test.ts", "design-persistence.test.ts",
      ...(method === "create" ? ["pcb-text-retained-save.test.ts", "pcb-text-retained-save-coordinator.test.ts", "pcb-text-reload-history.test.ts"] : [])], [3]);
}
add("pcb_PrimitivePour", ["rebuildCopperRegions"], "easyeda_control_design", "pcb.pour.rebuild", "native-task-equivalent",
  "Selected-parent derived copper rebuild with complete scoped effect proof; no global uncontrolled rebuild.", ["design-copper-adapter.ts", "copper-persistence.ts"], ["design-copper-adapter.test.ts", "design-persistence.test.ts"]);
const ruleMethods: Readonly<Record<string, string>> = {
  createNetClass: "netclass.create", deleteNetClass: "netclass.delete", modifyNetClassName: "netclass.rename", addNetToNetClass: "netclass.add-nets", removeNetFromNetClass: "netclass.remove-nets",
  createEqualLengthNetGroup: "equal-length.create", deleteEqualLengthNetGroup: "equal-length.delete", modifyEqualLengthNetGroupName: "equal-length.rename", addNetToEqualLengthNetGroup: "equal-length.add-nets", removeNetFromEqualLengthNetGroup: "equal-length.remove-nets",
  createDifferentialPair: "differential-pair.create", deleteDifferentialPair: "differential-pair.delete", modifyDifferentialPairName: "differential-pair.rename", modifyDifferentialPairPositiveNet: "differential-pair.set-positive", modifyDifferentialPairNegativeNet: "differential-pair.set-negative",
  overwriteCurrentRuleConfiguration: "rules.configuration.replace", overwriteNetRules: "rules.net.replace", overwriteNetByNetRules: "rules.net-to-net.replace", overwriteRegionRules: "rules.region.replace",
};
for (const [method, action] of Object.entries(ruleMethods)) {
  add("pcb_Drc", [method], "easyeda_control_design", `pcb.${action}`, "native-task-equivalent",
    "Typed source-bound rule effect; refuses member override resets, unpreserved pair selectors, derived copper or blind-via collateral. Global preset behavior is not exposed.", ["design-rule-public-adapter.ts", "design-rule-collections.ts"], ["design-rule-public-adapter.test.ts", "design-source-proof.test.ts"]);
}
add("pcb_Layer", ["overwriteCurrentPhysicalStackingConfiguration", "setTheNumberOfCopperLayers"], "easyeda_control_design", "pcb.stack.replace", "native-task-equivalent",
  "Atomic complete typed physical stack and enabled copper IDs; individual public setters are not exposed as independent writes.", ["design-stack-adapter.ts", "stack-persistence.ts"], ["design-stack-adapter.test.ts", "stack-native-persistence.test.ts"]);
for (const family of ["circle", "rectangle", "text", "pin", "attribute"]) {
  const className = `${family[0]?.toUpperCase() ?? ""}${family.slice(1)}`;
  add(`sch_Primitive${className}`, ["create", "modify", "delete"], "easyeda_control_design", `sch.${family}.*;documentType=2`, "native-task-equivalent",
    "Existing single-part project SYMBOL only, with exact child/source/persistence proof. This does not admit the same geometry operations on schematic pages.", ["symbol-action.ts", "symbol-persistence.ts"], ["symbol-action.test.ts", "symbol-persistence.test.ts"]);
}
for (const method of ["create", "modify", "delete"]) {
  add("sch_PrimitiveComponent", [method], "easyeda_control_design", `sch.component.${method}`, "native-task-equivalent",
    "Type-1 ordinary parts only; creation uses existing project single-part assets, modification preserves hidden/inherited properties and refuses unsupported rotations or new attributes.", ["schematic-component-create.ts", "schematic-native-adapter.ts", "schematic-electrical-adapter.ts", "schematic-source-proof.ts"], ["schematic-component-create.test.ts", "schematic-electrical-adapter.test.ts", "schematic-source-proof.test.ts"]);
  add("sch_PrimitiveWire", [method], "easyeda_control_design", `sch.wire.${method}`, method === "modify" ? "native-task-equivalent" : "public-method",
    method === "modify" ? "Existing unlocked cardinal wire with explicit style and omitted net; awaited native completion and full topology/persistence proof. Historical wire-v2 disposable lifecycle does not validate this facade generation." : "Source-supported cardinal wire transaction only; new named-net defaults are refused. No claim of public wrapper correctness for every declared shape.",
    ["schematic-source-proof.ts", "schematic-native-wire.ts"], ["schematic-source-proof.test.ts", "schematic-native-wire.test.ts"]);
}
add("sch_PrimitiveAttribute", ["createNetLabel"], "easyeda_control_design", "sch.net-label.create", "native-task-equivalent", "Exact standalone native label and topology effect; public stub is not dispatched.", ["schematic-electrical-adapter.ts"], ["schematic-electrical-adapter.test.ts"]);
add("sch_PrimitivePin", ["modify"], "easyeda_control_design", "sch.component-pin.no-connect", "native-task-equivalent", "Exact ordinary component pin no-connect marker only; arbitrary placed-pin property changes remain unavailable.", ["schematic-electrical-adapter.ts"], ["schematic-electrical-adapter.test.ts"]);
add("sch_PrimitiveComponent", ["createNetFlag"], "easyeda_control_design", "sch.layout.batch;checkpoint-bound-netflag-clone", "native-task-equivalent", "Clone of an existing loaded checkpoint-bound flag template only; not general new library flag creation.", ["schematic-layout-netflag.ts", "schematic-layout-batch.ts"], ["schematic-layout-netflag.test.ts", "schematic-layout-batch.test.ts"]);

// These explicit inventory entries describe the facade-owned sealed exception.
// Keep add()'s generic schematic and shared-lifecycle blocking rules unchanged.
const flatDisplayProfiles = ["easyeda-pro-control.flat-display-transaction.v1", "easyeda-pro-control.flat-display-transaction.v2"] as const;
const flatDisplayRoute: Omit<ApiCoverageRoute, "selector" | "implementation" | "scope"> = {
  tool: "easyeda_control_design", documentTypes: [1], executionState: "available-with-runtime-guards",
  validation: "offline-regression;current-live-unclaimed",
  source: ["flat-display-binding.ts", "flat-display-profile.ts", "flat-display-runtime.ts", "schematic-flat-read.ts", "schematic-flat-topology.ts", "schematic-layout-batch.ts", "design-action.ts", "design-execution.ts"],
  tests: ["flat-display-profile.test.ts", "flat-display-runtime.test.ts", "flat-display-execution.test.ts", "schematic-flat-read.test.ts", "schematic-flat-topology.test.ts", "design-topology-refusal.test.ts"],
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "operations", query: { family: "design", operationAction: "sch.layout.batch", includeSchemas: true } } } },
};
for (const flatDisplayProfile of flatDisplayProfiles) {
  const imported = flatDisplayProfile.endsWith(".v2");
  const route = { ...flatDisplayRoute,
    source: [...flatDisplayRoute.source, "flat-display-storage.ts", ...(imported ? ["native-history.ts", "native-atom-header-history.ts", "native-library-header-evidence.ts", "flat-display-library-peers.ts", "recovery-navigation.ts"] : [])],
    tests: [...flatDisplayRoute.tests, "flat-display-lifecycle.test.ts", "flat-display-apply-encoding.test.ts", ...(imported ? ["native-history-first-ticket.test.ts", "native-history-first-ticket-adversarial.test.ts", "flat-display-imported-peer-adversarial.test.ts", "flat-display-imported-lifecycle.test.ts", "recovery-navigation-capture.test.ts"] : [])],
  };
  const peerScope = imported ? " V2 admits only unchanged imported SYMBOL/FOOTPRINT peers: every lifecycle path rereads the sealed original immutable checkpoint and retains complete atom/header/body encoding, clock, client-presence, tombstone and occurrence-order commitments plus unchanged semantic peer bodies. No library write, history compaction or missing/replayed/changed occurrence is admitted." : " V1 continues to refuse imported firstTicket provenance; its existing seals and strict reader behavior are unchanged.";
  for (const [namespace, step] of [["sch_PrimitiveAttribute", "sch.attribute.display"], ["sch_PrimitiveText", "sch.text.display"]] as const) {
    groups.push({ namespace, methods: ["modify"], route: { ...route,
      selector: `sch.layout.batch;sealed-profile=${flatDisplayProfile};step=${step}`, implementation: "native-task-equivalent",
      scope: `Only ${step} inside a batch composed entirely of existing stored attribute/text display steps on exactly one ordinary project-owned schematic page. Facade-created ${flatDisplayProfile} binds the complete checkpoint, owner/branch, source/native endpoint topology and exact stored-field inverse; no caller-supplied profile or topology grants authority. Native source import runs once inside its own receiver-bound action, with final synchronous guards and complete baseline-or-intended durable classification. Only supported position/style/visibility fields are changed; no text-content or attribute-value edits, pin/net or NO_CONNECT changes, component translation, creation, deletion, mixed layout, hierarchy, variant, multipart or bus support.${peerScope} Not the public modify wrapper or its full declared contract. Offline synthetic coordinator and runtime regression evidence only; current-generation live validation remains unclaimed.`,
    } });
  }
  groups.push({ namespace: "sch_Document", methods: ["save"], route: { ...route,
    selector: `execute/commit;sealed-profile=${flatDisplayProfile}`, implementation: "internal-lifecycle-only",
    scope: `Only the original sealed ${flatDisplayProfile} display-only transaction's commit lifecycle on its one exact ordinary schematic page. Complete baseline-or-intended durable proof, same-execution source/native endpoint guard after final crypto/context awaits, retained no-repeat Save intent, terminal close/ready reopen and full project persistence are required. Recovery checks the sealed original preparation and retained Save acknowledgment; it never repeats an uncertain Save.${peerScope} No standalone Save, generic schematic commit, caller-provided topology grant or broad activation of other type-1 transactions. Offline synthetic coordinator and runtime regression evidence only; current-generation live validation remains unclaimed.`,
    source: [...route.source, "runtime-scripts.ts", "design-save-attempt.ts", "native-document-lifecycle.ts"],
    tests: [...route.tests, "runtime-scripts.test.ts", "design-save-attempt.test.ts"],
  } });
}

const flatWireProfile = "easyeda-pro-control.flat-wire-reroute.v1";
const flatWireRoute: Omit<ApiCoverageRoute, "selector" | "implementation" | "scope"> = {
  tool: "easyeda_control_design", documentTypes: [1], executionState: "available-with-runtime-guards",
  validation: "offline-regression;current-live-unclaimed",
  source: ["flat-wire-binding.ts", "flat-wire-profile.ts", "flat-wire-markers.ts", "flat-transaction-binding.ts", "flat-transaction-profile.ts", "flat-display-runtime.ts", "flat-display-storage.ts", "schematic-flat-read.ts", "schematic-flat-topology.ts", "schematic-native-wire.ts", "design-action.ts", "design-execution.ts"],
  tests: ["flat-wire-profile.test.ts", "flat-wire-runtime.test.ts", "flat-wire-apply.test.ts", "flat-wire-execution.test.ts", "flat-wire-lifecycle.test.ts"],
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "operations", query: { family: "design", operationAction: "sch.wire.modify", includeSchemas: true } } } },
};
const flatWireScope = "Facade-only sealed plan.flatWire on one ordinary complete project-owned page; no caller override or historical journal migration. One unlocked named WIRE changes only integer endpoints of nonzero orthogonal segments belonging to its existing LINE IDs. LINE count/style, literal net name, every ATTR field and category-derived child order remain exact. Complete checkpoint-bound flat topology plus contact-incidence multiset preserve pins, same-name islands and foreign contacts. Generated-marker proof refuses shared-WIRE endpoints and pin-bearing junctions. Exact ID-to-segment inverse requires a fresh unchanged durable baseline; auto-persisted forward effects refuse unsaved rollback. The geometry adapter does not create/delete, change style/net, compile or annotate and does not claim public-wrapper parity. Its retained Save contract is blocked: the pinned sch_Document.save can enumerate other dirty tabs and does not provide target-only Save or debounced structure-job completion. Offline synthetic tests only; current-generation live validation remains unclaimed.";
groups.push({ namespace: "sch_PrimitiveWire", methods: ["modify"], route: { ...flatWireRoute,
  selector: `sch.wire.modify;sealed-profile=${flatWireProfile}`, implementation: "native-task-equivalent", scope: flatWireScope,
} }, { namespace: "sch_Document", methods: ["save"], route: { ...flatWireRoute,
  selector: `execute/commit;sealed-profile=${flatWireProfile}`, implementation: "internal-lifecycle-only",
  scope: `Original sealed wire transaction only: final source/topology/marker reproof, complete durable peer comparison and one-shot Save/close/reopen. Retained-Save recovery requires its original successful synchronous-guard acknowledgment; no repeat Save, inverse or navigation. No standalone Save or generic type-1 admission. ${flatWireScope}`,
  source: [...flatWireRoute.source, "runtime-scripts.ts", "design-save-attempt.ts", "native-document-lifecycle.ts"],
  tests: [...flatWireRoute.tests, "design-save-attempt.test.ts"],
} });

for (const [family, api] of [["symbol", "lib_Symbol"], ["footprint", "lib_Footprint"], ["device", "lib_Device"], ["model3d", "lib_3DModel"]] as const) {
  add(api, ["get"], "easyeda_control_library", `library.${family}.get`, "public-method", "Exact identity/owner metadata, bounded double-sampled result; not complete library inventory or asset geometry.", ["library-runtime.ts", "library-execution.ts"], ["library-execution.test.ts"]);
}
groups.push({ namespace: "lib_Footprint", methods: ["getDocumentSource"], route: {
  tool: "easyeda_control_pcb209_worker_startup", selector: "observe-footprint-source", implementation: "native-task-equivalent",
  scope: "Disposable original209 startup owner only, after published construction, assignments and footprint state. One footprintUuid from the original whole-project checkpoint. A dedicated read-only history fold supports ordinary record families, multiple fragments, opaque body bytes and tombstones when normalized-ID winners and header actors are unambiguous. Historical pend/unique flags and DELETE_DOC/META_CREATE/META_MODIFY effects remain refused. The fixed native reader reconstructs source from current consistency entries and existing native Cache chunks. Two matching source reads and four state samples prove stable observed native order; independent checkpoint verification covers every keyed record and generated header, not checkpoint byte-order equality or copy/append eligibility. Source is bounded to 2MiB, cached history to 64 keys and 8MiB, and drawing atoms to 4096; separate encoding bounds can refuse heavily escaped content. Requires 65 remaining normal requests and preserves 32 cleanup slots. A cache miss refuses without fetch, parser replay, cache warming or network fallback. The installed SDK stub calls a LIB_Footprint.getDocumentSource UI handler that is absent from the pinned registration, so public-wrapper execution and its returned format are not verified. This route is a scoped source-inspection task equivalent. No public wrapper or Tg.getStr dispatch, arbitrary library/path, copy/delete, saved/reopened proof, current connected validation or complete declared-contract claim.",
  source: ["current-footprint-source-plan.ts", "current-footprint-cache-source-read.ts", "current-footprint-copy-source-command.ts", "current-footprint-source-read-runner.ts",
    "current-pcb-worker-construction-runner.ts", "current-pcb-209-worker-startup-opening.ts", "current-pcb-diagnostic-lifecycle.ts", "current-pcb-diagnostic-lifecycle-journal.ts"],
  tests: ["current-footprint-source-plan.test.ts", "current-footprint-cache-source-read.test.ts", "current-footprint-source-read-runner.test.ts", "current-pcb-209-worker-startup-lifecycle.test.ts"],
  documentTypes: [4], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "pcb209-worker-startup", query: { includeSchemas: true } } } },
} });
for (const method of ["create", "modify"]) {
  add("lib_Footprint", [method], "easyeda_control_library", `library.footprint.${method}`, "public-method", "Current-project footprint metadata only; classifications and lossy null-description cases refused; complete selected-branch persistence proof.", ["library-runtime.ts", "library-persistence-proof.ts"], ["library-execution.test.ts"]);
  add("lib_Device", [method], "easyeda_control_library", `library.device.${method}`, "native-task-equivalent", "Project-local device addition or association patch to existing assets; no asset import/copy or implicit ECO.", ["device-create.ts", "device-association.ts"], ["device-create.test.ts", "device-association.test.ts"]);
}
add("lib_Symbol", ["openInEditor"], "easyeda_control_library", "library.symbol.open", "public-method", "Existing exact current-project symbol; waits for coherent library editor context and proves unchanged selected branch.", ["library-runtime.ts"], ["library-execution.test.ts"]);
add("lib_Symbol", ["modify"], "easyeda_control_library", "library.symbol.modify", "native-task-equivalent",
  "Project-local ordinary symbol metadata: name and non-null description only; target must be absent from every editor tab. Project-qualified native write avoids the public wrapper's awaited mutable-current-project cloud-routing race and classification reprojection. Complete selected-branch effect and retained-receipt recovery; connected and reopened validation remain separate. The separate current-version coordinator passed the installed101500 unused META-only disposable forward/inverse round trip. Its separate ordinary forward-only route passed the installed123000 unused META-only lifecycle with exact closed SQL, reopened saved content and final closure. Those historical results do not admit this legacy route, which remains blocked.",
  ["project-symbol-metadata.ts", "library-execution.ts", "library-recovery-state.ts", "editor-tabs.ts", "current-symbol-write-program.ts"], ["project-symbol-metadata.test.ts", "project-symbol-transaction.test.ts", "library-recovery.test.ts", "current-symbol-write-program.test.ts"]);
groups.push({ namespace: "lib_Symbol", methods: ["modify"], route: {
  tool: "easyeda_control_project_symbol_metadata", selector: "metadata-advance;forward-only-unused-meta-or-canvas-segments-symbol", implementation: "native-task-equivalent",
  scope: "Separate current-version forward-only name/non-null-description operation for one unused project-local symbol, absent from all editor tabs. Complete original target history must be META-only or satisfy the bounded canvas-segments profile, including every tombstoned occurrence. Canvas requires stable atom types, lossless raw bodies, unambiguous cache actors, a unique latest/max-ticket header and at most 101 complete chunks including the reserved write; stricter reader limits still apply. Saved canvas lines stay byte-exact with a native replay-order witness. Original ordinary launch, sealed pre-navigation startup, complete closed baseline, exact runtime admission and immutable clock windows are required. Predispatch raw-history, saved-content and complete SQL proof budgets reserve one write only; canvas document windows must be strictly newer than every target header and within the fixed time ceiling. Physical allocation, heap and deadlines remain runtime limits. Complete closed SQL effect, reopened exact saved content and final closed SQL equality are mandatory. No inverse, explicit Save, generic library.symbol.modify admission or authority from discovery. Tags, source, classification, otherProperty and geometry changes are unsupported. Historical installed123000 validation passed this ordinary unused META-only forward-only entrypoint with exact closed SQL, reopened saved content, final SQL equality and retained process closure. The shared installed101500 META-only disposable forward/inverse lifecycle also passed. Historical results grant no current-invocation authority. Installed080000 passed the ordinary unused canvas-segments forward lifecycle on a disposable fixture with complete SQL, exact reopened content and final closure.",
  source: ["current-symbol-operation.ts", "current-disposable-open-runtime.ts", "current-symbol-validation-runtime.ts", "current-symbol-startup-runtime.ts", "current-symbol-meta-only.ts", "current-symbol-write-budget.ts", "current-symbol-write-program.ts", "current-symbol-writer-runtime.ts", "current-symbol-verification-runtime.ts", "current-symbol-saved-source.ts", "saved-symbol-projection.ts", "symbol-sql-comparator.ts"],
  tests: ["current-symbol-operation.test.ts", "current-symbol-validation-runtime.test.ts", "current-symbol-meta-only.test.ts", "current-symbol-write-budget.test.ts", "current-symbol-startup-runtime.test.ts", "current-symbol-writer-runtime.test.ts", "current-symbol-saved-source.test.ts", "closed-symbol-disposable-mcp.test.ts"],
  documentTypes: [2], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-symbol-operation", query: { includeSchemas: true } } } },
} }, { namespace: "lib_Symbol", methods: ["copy"], route: {
  tool: "easyeda_control_disposable_symbol_copy", selector: "copy-advance;disposable-project-local-supported-symbol", implementation: "native-task-equivalent",
  scope: "Separate disposable-only native symbol clone with renameKey true and keepSource false; no generic public lib_Symbol.copy contract. Requires the original retained disposable opening, exact checkpoint source and complete closed SQL baseline, fixed supported self-contained drawing types, original startup/actor/dual-clock proof and pre-dispatch saved-content budgets. Retains the native returned UUID before postread; never rediscovers by title or repeats an ambiguous copy. One write, normal closure, complete closed SQL effect, cache-excluded reopening, exact reopened destination content and unchanged source/peer SQL, and final closed SQL equality. Conservative structure-byte preservation, not full native tree projection. No ordinary projects, caller destination/name, explicit Save, inverse/delete or discovery authority. Installed094000 passed one disposable supported drawn-symbol copy with complete closed SQL, exact reopened content and final closure. Later generations and other source histories remain unvalidated.",
  source: ["current-symbol-copy-operation.ts", "current-symbol-copy-operation-runtime.ts", "current-disposable-open-runtime.ts", "current-symbol-copy-plan.ts",
    "current-symbol-copy-startup-runtime.ts", "current-symbol-copy-program.ts", "current-symbol-copy-clock.ts", "current-symbol-copy-writer-runtime.ts",
    "current-symbol-copy-sql.ts", "current-symbol-copy-verification-runtime.ts", "current-symbol-copy-saved-read.ts"],
  tests: ["current-symbol-copy-operation.test.ts", "current-symbol-copy-operation-runtime.test.ts", "current-symbol-copy-plan.test.ts", "current-symbol-copy-program.test.ts", "current-symbol-copy-sql.test.ts"],
  documentTypes: [2], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "disposable-symbol-copy", query: { includeSchemas: true } } } },
} });
add("lib_Symbol", ["create"], "easyeda_control_library", "library.symbol.create", "native-task-equivalent",
  "One closed empty ordinary current-project symbol with an ordinary clean PCB active. Exact project-qualified creation and original returned ID, META-only addition and complete unchanged-peer proof; no classifications, inherited source, template/PART/canvas initialization, editor opening, Save or automatic inverse. Permission denial can display a native dialog. Changed recovery requires the retained original return and never recreates. Current-generation live validation is unclaimed.",
  ["project-symbol-create.ts", "library-execution.ts", "library-recovery-state.ts", "library-recovery.ts", "engine.ts"], ["project-symbol-create.test.ts", "project-symbol-create-transaction.test.ts", "typed-recovery.test.ts"], [3]);
add("lib_Footprint", ["openInEditor"], "easyeda_control_library", "library.footprint.open", "native-task-equivalent", "Uses maintained dmt_EditorControl.openLibraryDocument path for an existing exact current-project footprint.", ["library-runtime.ts", "library-operations.ts"], ["library-execution.test.ts"]);
add("dmt_EditorControl", ["openDocument"], "easyeda_control_library", "document.open", "public-method", "Checkpoint-member current-project document only, with one-shot navigation and complete unchanged saved-state proof.", ["library-runtime.ts", "library-execution.ts"], ["library-execution.test.ts"]);
add("dmt_EditorControl", ["activateDocument"], "easyeda_control_library", "document.activate", "public-method",
  "One already-open checkpoint-member current-project tab only, with complete tab ownership, retained preparation and one activation. Two coherent target observations and unchanged complete durable project; recovery never activates, opens, closes or saves. Current-generation live validation is unclaimed.",
  ["document-activation.ts", "library-execution.ts", "library-recovery.ts"], ["document-activation.test.ts", "document-activation-transaction.test.ts"]);
add("dmt_EditorControl", ["closeDocument"], "easyeda_control_library", "document.close", "public-method",
  "One inactive clean checkpoint-member ordinary symbol (2), PCB (3) or footprint (4), with a separate clean PCB/footprint active and exactly two owned project tabs in one unsplit container. Await terminal removal and prove unchanged active source/context and complete logical database. No Save, reopen or exact inverse. Every post-dispatch failure retains execution quarantine until captured-runtime termination; reconciliation observes only and never repeats close. Current-generation live validation is unclaimed.",
  ["document-close.ts", "library-execution.ts", "library-recovery.ts", "core.ts"], ["document-close.test.ts", "document-close-transaction.test.ts", "typed-recovery.test.ts"], [3, 4]);
add("dmt_Schematic", ["modifySchematicPageName"], "easyeda_control_library", "document.page.rename", "native-task-equivalent",
  "Closed ordinary checkpoint-member page only, with one clean owned sibling active, exact writable local branch, immutable preparation and one project-qualified native metadata write. Complete saved title/header effect and unchanged peers/source; no Save, reopen or UI-caption refresh claim. Current-generation live validation is unclaimed.",
  ["document-page-rename.ts", "library-execution.ts", "library-recovery-state.ts", "library-recovery.ts"], ["document-page-rename.test.ts", "document-page-rename-transaction.test.ts"]);
for (const [namespace, method, family] of [["dmt_Pcb", "modifyPcbName", "pcb"], ["dmt_Schematic", "modifySchematicName", "schematic"]] as const) {
  add(namespace, [method], "easyeda_control_library", `document.${family}.rename`, "native-task-equivalent",
    "Closed ordinary target only, every schematic child closed, one other clean direct-open PCB and independent DOM-frame proof. Exact nonimported checkpoint and full peer record clocks/header lineage; checkpoint-bound per-document raw occurrence chains preserve every peer and require exactly one DOCHEAD/META suffix on the renamed target. EDIT_HEAD, chunk boundaries and interdocument ordering are outside that per-document commitment. Refuses hierarchy, CBB, inheritance, non-null target zIndex, pooled panel/export frames. No public wrapper, Save/reopen, automatic inverse or current-generation live-validation claim.",
    ["document-container-rename.ts", "document-container-rename-runtime.ts", "document-container-rename-dom.ts", "document-container-rename-native-profile.ts", "native-history.ts", "native-document-record-history.ts", "library-execution.ts", "library-recovery-state.ts", "library-recovery.ts", "library-undispatched-recovery.ts"],
    ["document-container-rename.test.ts", "document-container-rename-runtime.test.ts", "document-container-rename-transaction.test.ts", "native-history.test.ts", "native-document-record-history.test.ts", "library-undispatched-recovery.test.ts"], [3]);
}
groups.push({ namespace: "dmt_Pcb", methods: ["modifyPcbName"], route: {
  tool: "easyeda_control_disposable_pcb_rename", selector: "advance;rename-write;disposable-project-local-pcb-title", implementation: "native-task-equivalent",
  scope: "Separate disposable-only title update through the pinned project-qualified PCB updateData path, not generic public dmt_Pcb.modifyPcbName enablement. Requires the original retained disposable opening, complete closed SQL baseline, native title/data-ticket projection, complete PCB peers, original startup/actor/dual-clock checks and exact phase acknowledgements. Preserves all target drawing and peer SQL rows; records native acknowledgment before postwrite checks. Complete title-only closed SQL effect, cache-excluded reopening, matching target/all-PCB metadata and final closed SQL equality are mandatory. Reopened native verification is metadata-only, not a complete PCB canvas read or transient AST/source equality proof. Trimmed printable ASCII without capital I only; linked/reuse PCBs refuse. No ordinary projects, caller clock/runtime/code/verifier, explicit Save, inverse/delete or authority from discovery. Installed195000 passed one disposable title-only lifecycle with complete closed SQL, cache-excluded reopened PCB metadata and unchanged final SQL after normal closure. Later generations and other project histories remain unvalidated. The legacy library rename route remains blocked.",
  source: ["current-pcb-rename-operation.ts", "current-pcb-rename-operation-runtime.ts", "current-pcb-rename-owner-baseline.ts",
    "current-pcb-native-metadata.ts", "current-pcb-rename-binding.ts", "current-pcb-rename-startup-runtime.ts", "current-pcb-rename-program.ts",
    "current-pcb-rename-clock.ts", "current-pcb-rename-writer-runtime.ts", "current-pcb-rename-stored-effect.ts", "current-pcb-rename-verification-runtime.ts", "current-pcb-rename-saved-source.ts"],
  tests: ["current-pcb-rename-registration.test.ts", "current-pcb-rename-program.test.ts", "current-pcb-rename-clock.test.ts",
    "current-pcb-rename-writer-runtime.test.ts", "current-pcb-rename-stored-effect.test.ts", "current-pcb-rename-verification-runtime.test.ts"],
  documentTypes: [3], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "disposable-pcb-rename", query: { includeSchemas: true } } } },
} }, { namespace: "dmt_Schematic", methods: ["modifySchematicName"], route: {
  tool: "easyeda_control_disposable_schematic_rename", selector: "advance;rename-write;disposable-project-local-schematic-title", implementation: "native-task-equivalent",
  scope: "Separate original-owner disposable schematic-container title lifecycle, not generic SDK writer support. Requires the retained disposable opener, exact closed SQL baseline, original SCH metadata and child roster, fresh project-only generation, startup/actor/clock checks and one durable mutation attempt. Preserves every child sheet, peer and unrelated SQL cell. Completion requires original root/Job closure, complete intended SQL effect, cache-excluded fresh reopening, matching container/all-peer metadata and complete child roster/both ASTs, final closure and SQL equality. Prospective backend actor, delayed subscriber completion, complete canvas and connectivity are not attested. Printable ASCII without capital I, unique old normalized name, ordinary stable child lineage and no reuse/block-symbol branch only. No explicit Save, inverse, deletion, ordinary-project scope or caller-supplied authority. Installed143713 passed one disposable title-only lifecycle with complete closed SQL, cache-excluded fresh metadata/peer/child-roster verification and final closure with unchanged SQL. That single-phase case does not validate advance-batch or later generations; the legacy library route stays blocked.",
  source: ["current-schematic-rename-operation.ts", "current-schematic-rename-operation-runtime.ts", "current-schematic-rename-owner-baseline.ts",
    "current-schematic-rename-generation-runtime.ts", "current-schematic-rename-startup-runtime.ts", "current-schematic-rename-program.ts",
    "current-schematic-rename-clock.ts", "current-schematic-rename-writer-runtime.ts", "current-schematic-rename-snapshot.ts",
    "current-schematic-rename-stored-effect.ts", "current-schematic-rename-saved-source.ts", "current-schematic-rename-verification-runtime.ts"],
  tests: ["current-schematic-rename-registration.test.ts", "current-schematic-rename-operation-runtime.test.ts", "current-schematic-rename-program.test.ts",
    "current-schematic-rename-clock.test.ts", "current-schematic-rename-writer-runtime.test.ts", "current-schematic-rename-snapshot.test.ts",
    "current-schematic-rename-stored-effect.test.ts", "current-schematic-rename-saved-source.test.ts", "current-schematic-rename-verification-runtime.test.ts"],
  documentTypes: [], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "disposable-schematic-rename", query: { includeSchemas: true } } } },
} }, { namespace: "dmt_Schematic", methods: ["modifySchematicName"], route: {
  tool: "easyeda_control_project_schematic_rename", selector: "advance;rename-write;ordinary-project-local-schematic-title-forward-only", implementation: "native-task-equivalent",
  scope: "Separate original-owner ordinary-project SCH-container title lifecycle. Legacy confirmDisposableProject true is optional at open for old sealed journals; omission stays omitted and false refuses. The separate disposable route retains its required confirmations and scope. Before first navigation, the managed checkpoint seals the exact target/title, supported startup, SCH metadata and complete child projection; changed closed baseline refuses. One retained ordinary-purpose owner spans opening, baseline, clock, exactly one title write, full closed SQL effect, cache-excluded fresh metadata/peer/child-roster verification and final closed SQL equality. Disposable or symbol purposes, copied journals and unqualified startup opt-ins cannot supply authority. Exact acknowledgments and bounded adjacent batching are required. Installed203733 passed this ordinary-purpose title-only lifecycle on a disposable fixture, including batching, complete closed SQL, fresh metadata/peer/child-roster and both AST readback, final normal closure and unchanged full SQL. Historical validation grants no current-invocation authority or other-history qualification. No complete canvas/connectivity read, subscriber-completion claim, explicit Save, inverse, delete, restore or generic writer enablement.",
  source: ["current-schematic-operation.ts", "current-schematic-operation-startup.ts", "current-disposable-open-checkpoint.ts", "current-disposable-open-runtime.ts",
    "current-schematic-rename-operation-runtime.ts", "current-schematic-rename-owner-baseline.ts", "current-schematic-rename-generation-runtime.ts",
    "current-schematic-rename-writer-runtime.ts", "current-schematic-rename-verification-runtime.ts"],
  tests: ["current-schematic-operation-registration.test.ts", "current-schematic-operation.test.ts"],
  documentTypes: [], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "project-schematic-operation", query: { includeSchemas: true } } } },
} });
add("dmt_Schematic", ["createSchematicPage"], "easyeda_control_library", "document.page.create", "native-task-equivalent",
  "Parent-only creation of one closed empty page in an existing ordinary local schematic, with one clean owned PCB or sibling page active and a writable exact branch. Pinned native name/order defaults, original returned ID and full unchanged peer/hierarchy proof; public template/drawing-frame initialization and editor opening are not invoked. No Save or automatic inverse. Changed recovery requires the original native return and immutable preparation, never infers identity from an observed addition or repeats creation. Current-generation live validation is unclaimed.",
  ["document-page-create.ts", "library-execution.ts", "library-recovery-state.ts", "library-recovery.ts"], ["document-page-create.test.ts", "document-page-create-transaction.test.ts"], [1, 3]);
add("dmt_Pcb", ["createPcb"], "easyeda_control_library", "document.pcb.create", "native-task-equivalent",
  "Creates one closed META-only free PCB with boardName absent and one other clean direct-open ordinary PCB active. Exact project-qualified worker, public-path name derivation, retained original UUID and complete peer record clocks/header lineage. Checkpoint-bound per-document raw occurrence chains preserve every peer and require exactly one DOCHEAD/META pair in the new PCB. EDIT_HEAD, chunk boundaries and interdocument ordering are outside that per-document commitment. No board creation or attachment, canvas initialization, editor opening, Save/reopen or automatic inverse. Refuses imported atom histories, hierarchy, CBB, inheritance and hidden/pooled/export frames. Changed recovery requires the original native return and never recreates. Current-generation live validation is unclaimed.",
  ["project-pcb-create.ts", "project-pcb-create-runtime.ts", "document-container-rename-dom.ts", "document-container-rename-native-profile.ts", "native-history.ts", "native-document-record-history.ts", "library-execution.ts", "library-recovery-state.ts", "library-recovery.ts", "library-undispatched-recovery.ts"],
  ["project-pcb-create.test.ts", "project-pcb-create-runtime.test.ts", "project-pcb-create-transaction.test.ts", "native-history.test.ts", "native-document-record-history.test.ts", "library-undispatched-recovery.test.ts"], [3]);
add("dmt_Schematic", ["createSchematic"], "easyeda_control_library", "document.schematic.create", "native-task-equivalent",
  "Creates one closed META-only free schematic with boardName absent and one clean direct-open ordinary PCB active. Exact project-qualified worker, checkpoint-derived name and retained original UUID. Complete peer record clocks/header lineage and per-document raw occurrence chains; exactly one new DOCHEAD/META pair. Requires local ordinary symbol references and absent or empty inline component attrs. No board attachment, page/template/canvas initialization, editor opening, Save/reopen or automatic inverse. Refuses hierarchy, CBB, inheritance, imported atom histories and hidden/pooled/export frames. Changed recovery requires the original native return and never recreates. Native subscribers are not atomic against concurrent project changes; context/readback detect observed drift. Not public sheet-producing workflow parity or connected validation.",
  ["project-schematic-create.ts", "project-schematic-create-runtime.ts", "project-schematic-create-native-profile.ts", "document-container-rename-dom.ts", "native-history.ts", "native-document-record-history.ts", "library-execution.ts", "library-recovery-state.ts", "library-recovery.ts", "library-undispatched-recovery.ts"],
  ["project-schematic-create.test.ts", "project-schematic-create-runtime.test.ts", "project-schematic-create-transaction.test.ts", "native-history.test.ts", "native-document-record-history.test.ts", "library-undispatched-recovery.test.ts"], [3]);
add("dmt_EditorControl", ["openLibraryDocument"], "easyeda_control_library", "library.footprint.open", "public-method", "Existing checkpoint-member current-project footprint only, with one-shot navigation and complete unchanged saved-state proof.", ["library-runtime.ts", "library-execution.ts"], ["library-execution.test.ts"]);

const exports: Readonly<Record<string, string>> = {
  getDxfFile: "dxf", getFlyingProbeTestFile: "flying-probe", getIpcD356AFile: "ipcd356a", getOpenDatabaseDoublePlusFile: "odb", getDsnFile: "dsn", getAutoRouteJsonFile: "autoroute-json", getAutoRouteJsonFileForJRouter: "autoroute-jrouter", getAutoLayoutJsonFile: "autolayout-json", getAltiumDesignerFile: "altium", getPadsFile: "pads", getPcbInfoFile: "info", getIdxFile: "idx", getGerberFile: "gerber", get3DFile: "model3d", getPickAndPlaceFile: "pick-and-place", getTestPointFile: "test-points", getIpc2581CFile: "ipc2581c",
};
for (const [method, selector] of Object.entries(exports)) {
  add("pcb_ManufactureData", [method], "easyeda_control_library", `export.pcb.${selector}`, "public-method", "Bounded actual File result up to 2 MiB, exclusive managed artifact, unchanged source/context; no model generation, arbitrary path, order or fabrication approval.", ["library-operations.ts", "library-runtime.ts"], ["library-operations.test.ts", "library-execution.test.ts"]);
}
for (const family of ["pcb", "sch"]) {
  add(`${family}_Drc`, ["check"], "easyeda_control_check", "run", "native-task-equivalent", "Fixed reviewed native calculation/report, scoped complete state and saved SQLite invariance; SDK boolean alone is not accepted.", ["native-rule-report.ts", "check-execution.ts"], ["native-rule-report.test.ts", "check-execution.test.ts"]);
  add(`${family}_Document`, ["save"], "easyeda_control_design", "execute/commit", "internal-lifecycle-only", "Save is available only inside an original journal's verified no-repeat commit lifecycle; never an unrestricted standalone Save.", ["runtime-scripts.ts", "design-save-attempt.ts", "design-execution.ts"], ["design-save-attempt.test.ts", "design-execute.test.ts"]);
}
add("dmt_EditorControl", ["activateDocument", "closeDocument"], "easyeda_control_design", "commit/recovery lifecycle", "internal-lifecycle-only", "Exact target-bound design commit/recovery lifecycle only. Separately listed library document.activate and document.close routes have their own narrower admission; no unrestricted close/discard or activation.", ["runtime-scripts.ts", "native-document-lifecycle.ts"], ["runtime-scripts.test.ts", "native-document-lifecycle.test.ts"]);
add("dmt_Project", ["getCurrentProjectInfo"], "easyeda_control_context", "context", "public-method", "Exact active project identity used before and after guarded operations.", ["runtime-scripts.ts"], ["runtime-scripts.test.ts"]);
add("dmt_SelectControl", ["getCurrentDocumentInfo"], "easyeda_control_context", "context", "public-method", "Exact active document/type/tab identity used before and after guarded operations.", ["runtime-scripts.ts"], ["runtime-scripts.test.ts"]);
add("dmt_EditorControl", ["getSplitScreenTree"], "easyeda_control_context", "context/editor ownership", "public-method", "Bounded editor tab ownership and exclusivity checks, not navigation authority.", ["editor-tabs.ts", "runtime-scripts.ts"], ["editor-tabs.test.ts", "runtime-scripts.test.ts"]);
add("dmt_Project", ["openProject"], "easyeda_control_runtime", "open-existing", "native-task-equivalent", "Existing saved checkpoint-member project only in empty editor; no repeated navigation or implicit Save/discard.", ["project-open-execution.ts"], ["project-open-execution.test.ts"]);

export function maintainedApiCoverageRoutes(): ReadonlyMap<string, readonly ApiCoverageRoute[]> {
  const result = new Map<string, ApiCoverageRoute[]>();
  for (const group of groups) {
    for (const method of group.methods) {
      const path = `eda.${group.namespace}.${method}`;
      const routes = result.get(path) ?? [];
      routes.push(structuredClone(group.route));
      result.set(path, routes);
    }
  }
  return result;
}
