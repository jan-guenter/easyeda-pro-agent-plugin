/** Reviewed links from public SDK methods to actual maintained execution paths.
 * A native task equivalent does not claim to invoke the public wrapper, support
 * every overload, or validate that wrapper's implementation.
 */
export interface ApiCoverageRoute {
  readonly tool: string;
  readonly selector: string;
  readonly implementation: "public-method" | "native-task-equivalent" | "internal-lifecycle-only";
  readonly scope: string;
  readonly source: readonly string[];
  readonly tests: readonly string[];
  readonly validation: "offline-regression;current-live-unclaimed";
  readonly executionState: "available-with-runtime-guards" | "blocked" | "partially-blocked";
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

groups.push({ namespace: "dmt_Pcb", methods: ["getPcbInfo"], route: {
  tool: "easyeda_control_project_pcb", selector: "eda.dmt_Pcb.getPcbInfo;loaded-local-project-no-editors", implementation: "native-task-equivalent",
  scope: "One explicit project/branch/PCB identity in an already loaded local path-hash project with no editor tabs or hidden frames. Fixed project-qualified native metadata getter, captured RPC receivers and two matching bounded observations bracketed by project-owner checks. Preserves native title/display title, parent, board, source/version, ticket and updateTime. Source/version/board fallbacks are observed getter semantics, not lossless storage. No public-wrapper parity, worker lease, saved membership, startup completion or writer authority. No canvas load, navigation, cloud lookup, mutation or Save. Other PCB metadata, full inventory and renaming remain separate.",
  source: ["current-project-pcb-metadata.ts", "current-project-pcb-metadata-program.ts", "current-project-pcb-metadata-runtime.ts", "current-project-only-symbol-guard.ts", "current-disposable-open-profile.ts"],
  tests: ["current-project-pcb-metadata.test.ts", "current-project-pcb-metadata-runtime.test.ts", "facade-mode.test.ts"],
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
    scope: `Separately pinned current API/UI/PCB loaded-view geometry subset. Explicit ordinary active PCB project/branch/document/tab, retained native frame/receiver and two matching ordered bounded observations. Unfiltered Line/Arc/Via geometry and narrow Component/Pad state; fixed projections in mil/degrees without public-wrapper rounding, not public class instances or public-wrapper dispatch. Component admits layers1/2 and six optional raw strings: designator, name, manufacturer, manufacturerPart, supplier and supplierPart. Missing or own-undefined values omit the field; empty strings and Name formulas remain exact. Selected null/non-string/inherited/accessor values refuse. Metadata is not verified part identity or schematic linkage. Pad admits layers1/2/12 and pad types0/1/2. Pad net spelling and empty-string versus null are preserved; pad number requires a bounded string. Pad hole is null or a strict ROUND/SLOT DTO with nonnegative mil dimensions, mil offsets and degree rotation relative to the pad. Holeless rows skip unused native hole scalars; native zero dimensions do not establish fabrication validity. Default copper ELLIPSE/OVAL/RECT parameters retain native0.1mil rounding and RECT corner ratio percent, not radius. POLYGON returns only a not-projected marker; its omitted path is not compared. NGON refuses and physical-layer stacks remain omitted. Mask mode1/2 and top/bottom solder plus one shared paste value are observed mil, not refreshed rules or explicit overrides. Nullable thermal mode0 includes mil clearance/spokeWidth and degree angle; modes1/2 omit unused dimensions. Null is not no connection; inherited values and actual pours remain unverified. Not complete shape reconstruction; Arc center/radius/sweep are omitted and full-circle angle can project to zero. Other Component attributes, library enrichment and reverse ownership are omitted. Net labels and lock flags are not connectivity or editing authority. No filters, complete saved membership, selection change, navigation, write or Save. Vendor enumeration and full DTO allocation precede output bounds; limits do not cancel execution or bound cache/child serialization work.${method === "get" ? " This get route accepts only 1..256 distinct bounded primitiveIds in an array, selects DTOs in caller order after complete-family checks and refuses any unavailable ID. It does not support scalar get or public missing-ID skipping. Returned and full-family observed row counts are distinct; all family bounds still apply before selection." : " This getAll route accepts empty arguments only."}`,
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
  scope: "Separately pinned current API 0.3.50/UI 3.2.196 public shortcut-registry read, without design context or legacy-route admission. Optional includeSystem defaults false. Two owner-stable bounded copies preserve raw key strings, order, duplicates and empty tokens. Shortcut scope enums are not document types. No key execution, registration, navigation, settings or Save; the separate menu registry is excluded and vendor enumeration is not cancelled by the observer deadline.",
  source: ["shortcut-keys.ts", "shortcut-keys-runtime.ts", "current-ui-implementation.ts", "sdk-local-runtime.ts", "facade-mode.ts"],
  tests: ["shortcut-keys.test.ts", "shortcut-keys-runtime.test.ts", "facade-mode.test.ts"],
  validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "shortcuts", query: { includeSchemas: true } } } },
} });

add("sys_FileManager", ["getDocumentSource"], "easyeda_control_exact_read", "*-source", "public-method",
  "Complete active schematic, symbol, PCB or footprint source, bounded and normalized only for volatile DOCHEAD export fields.", ["exact-readers.ts"], ["exact-readers.test.ts"]);
add("dmt_EditorControl", ["getCurrentRenderedAreaImage"], "easyeda_control_capture", "easyeda_canvas_capture", "public-method",
  "Existing visible-canvas capture only, with an explicit tab equal to the proven active tab, unchanged before/after runtime fingerprint and post-capture context. The bridge calls the public image method and converts its Blob; the facade validates one complete bounded PNG and archives managed image evidence. Viewport-image observation only, not complete source, connectivity, persistence or visual acceptance. No omitted-tab default, foreign-tab access, native canvas-receiver identity or full declared-contract claim.",
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
  scope: "Separate original-owner disposable schematic-container title lifecycle, not generic SDK writer support. Requires the retained disposable opener, exact closed SQL baseline, original SCH metadata and child roster, fresh project-only generation, startup/actor/clock checks and one durable mutation attempt. Preserves every child sheet, peer and unrelated SQL cell. Completion requires original root/Job closure, complete intended SQL effect, cache-excluded fresh reopening, matching container/all-peer metadata and complete child roster/both ASTs, final closure and SQL equality. Prospective backend actor, delayed subscriber completion, complete canvas and connectivity are not attested. Printable ASCII without capital I, unique old normalized name, ordinary stable child lineage and no reuse/block-symbol branch only. No explicit Save, inverse, deletion, ordinary-project scope or caller-supplied authority. No connected schematic rename validation is recorded; legacy library route stays blocked.",
  source: ["current-schematic-rename-operation.ts", "current-schematic-rename-operation-runtime.ts", "current-schematic-rename-owner-baseline.ts",
    "current-schematic-rename-generation-runtime.ts", "current-schematic-rename-startup-runtime.ts", "current-schematic-rename-program.ts",
    "current-schematic-rename-clock.ts", "current-schematic-rename-writer-runtime.ts", "current-schematic-rename-snapshot.ts",
    "current-schematic-rename-stored-effect.ts", "current-schematic-rename-saved-source.ts", "current-schematic-rename-verification-runtime.ts"],
  tests: ["current-schematic-rename-registration.test.ts", "current-schematic-rename-operation-runtime.test.ts", "current-schematic-rename-program.test.ts",
    "current-schematic-rename-clock.test.ts", "current-schematic-rename-writer-runtime.test.ts", "current-schematic-rename-snapshot.test.ts",
    "current-schematic-rename-stored-effect.test.ts", "current-schematic-rename-saved-source.test.ts", "current-schematic-rename-verification-runtime.test.ts"],
  documentTypes: [], validation: "offline-regression;current-live-unclaimed", executionState: "available-with-runtime-guards",
  inputDiscovery: { tool: "easyeda_control_api", arguments: { request: { action: "disposable-schematic-rename", query: { includeSchemas: true } } } },
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
