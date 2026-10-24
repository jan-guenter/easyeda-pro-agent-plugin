import { isPublicUtilities209Configured } from "./sdk-public-utilities-profile.ts";

/** Registration is selected once at startup, never by a tool argument. A new
 * installation must not inherit generic readers or native controls merely
 * because a separately reviewed calculation works there.
 */
export type FacadeMode = "legacy-reviewed" | "calculation-only" | "public-utilities-only";

export const PUBLIC_UTILITIES_ONLY_TOOLS = Object.freeze([
  "easyeda_control_api", "easyeda_control_discover", "easyeda_control_status",
  "easyeda_control_calculate", "easyeda_control_system", "easyeda_control_launch",
  "easyeda_control_public_readers",
  "easyeda_control_catalog_footprint", "easyeda_control_catalog_components", "easyeda_control_editor_shell",
  "easyeda_control_editor_context", "easyeda_control_shortcuts",
  "easyeda_control_pcb209_opening", "easyeda_control_pcb209_worker_startup",
]);
export const PUBLIC_UTILITIES_ONLY_SCOPE = "EasyEDA 3.2.209 scoped Math, Unit, Environment, language, API-page viewport, tab-count, active-identity and shortcut observations, plus ordinary launch. Separate catalog tools perform explicitly confirmed credential-free vendor HTTPS metadata queries without EasyEDA or SDK execution. The separate pcb209_opening route owns one disposable project/PCB opening, UI/PCB source/identity checks, bounded layer/copper-count and Line/Arc/Via/parentless-String/Component/Pad/Attribute/Dimension/Image loaded-view observations through original normal cleanup. Its selection/relations stage also captures selected IDs and requested component child-pad IDs. A separate Pad stage observes native top/inner/bottom special style groups without expanding physical layers. An Image stage retains bounded serialized vector paths or opaque Picture references without loading assets. Arc observations add native center, radius, endpoint angles and direction. Poured observations retain existing native fill contours and parent associations without rebuilding or qualifying copper. Digest-bound historical queries read published observations without live RPCs or owner adoption; they do not describe current state. Ordinary opening can migrate data and automatically Save. The separate pcb209_worker_startup route captures original project-worker constructors, current wrapper/channel relations and bracketed actor/local-Date observations on a disposable project. No general geometry read/write, explicit Save, recovery or PCB-worker/ratline route is registered. Source review and synthetic tests are not connected execution validation. These observations and launch do not prove isolation, complete-board membership, reciprocal ownership, connectivity, saved state, physical stackup or readiness.";

export function publicUtilitiesOnlyCapabilities(): Record<string, unknown> {
  return {
    sdkCalculations: { tool: "easyeda_control_calculate", runtimeAdmissionRequired: true, connectedValidation: false },
    sdkSystem: { tool: "easyeda_control_system", runtimeAdmissionRequired: true, connectedValidation: false },
    publicReaders: { tool: "easyeda_control_public_readers", runtimeAdmissionRequired: true, connectedValidation: false,
      scope: "supported-languages-and-api-page-viewport" },
    catalogFootprint: { tool: "easyeda_control_catalog_footprint", runtimeAdmissionRequired: false, connectedValidation: false,
      implementation: "vendor-http-task-equivalent", networkConfirmationRequired: true, publicSdkMethodExecuted: false },
    catalogComponents: { tool: "easyeda_control_catalog_components", runtimeAdmissionRequired: false, connectedValidation: false,
      implementation: "vendor-http-task-equivalent", networkConfirmationRequired: true, publicSdkMethodExecuted: false },
    editorShell: { tool: "easyeda_control_editor_shell", runtimeAdmissionRequired: true, readinessProof: false },
    editorContext: { tool: "easyeda_control_editor_context", runtimeAdmissionRequired: true, identityOnly: true, cadAuthority: false },
    shortcutKeys: { tool: "easyeda_control_shortcuts", runtimeAdmissionRequired: true, keyboardExecution: false },
    ordinaryLaunch: { tool: "easyeda_control_launch", installedIdentityAdmissionRequired: true, profileIsolation: false, connectedValidation: false },
    disposableOpening: { tool: "easyeda_control_pcb209_opening", validationOnly: true, connectedValidation: false,
      runtimeAdmissionRequired: true, startupCompletionVerified: false, cadAuthority: false, layerObservation: "double-sampled-metadata-and-copper-count",
      observationStages: ["observe-layers", "observe-primitives", "observe-extended-primitives", "observe-selection-relations", "observe-pad-shapes", "observe-image-shapes", "observe-arc-shapes", "observe-poured-shapes"],
      primitiveObservation: "nine-loaded-view-families;ordered-selection-and-requested-component-child-pad-lists",
      padShapeObservation: "native-top-inner-bottom-style-groups;no-physical-layer-expansion",
      imageShapeObservation: "bounded-native-vector-paths-and-opaque-picture-references;no-asset-loading-or-rendered-proof",
      arcShapeObservation: "native-centers-radii-endpoint-radians-and-direction;no-rendered-circle-proof",
      pouredShapeObservation: "serialized-loaded-copper-fill-contours-and-parent-groups;no-rebuild-or-freshness-proof",
      historicalQuery: "digest-bound-published-snapshot;no-live-rpc-owner-adoption-or-current-state-proof" },
    disposableWorkerStartup: { tool: "easyeda_control_pcb209_worker_startup", validationOnly: true, connectedValidation: false,
      runtimeAdmissionRequired: true, debuggerPauseAcceptanceRequired: true, startupCompletionVerified: false,
      completeLiveBaselineVerified: false, serverClockProvenanceVerified: false, cadAuthority: false },
    designAccess: { enabled: false, scope: "general-geometry-and-writers;disposable-bounded-observations-and-historical-queries-only" }, navigation: { enabled: true, scope: "original-owner-disposable209-opening-only" },
    save: { enabled: false }, recovery: { enabled: false }, nativeAdapters: { enabled: true, scope: "identity-observations-and-disposable209-opening-layer-primitive-selection-relations-only" },
  };
}

export const CALCULATION_ONLY_TOOLS = Object.freeze([
  "easyeda_control_api", "easyeda_control_discover", "easyeda_control_status", "easyeda_control_calculate",
  "easyeda_control_system", "easyeda_control_extensions",
  "easyeda_control_launch", "easyeda_control_editor_shell",
  "easyeda_control_pcb_diagnostic_validation",
  "easyeda_control_pcb_string_precreate_validation",
  "easyeda_control_editor_context",
  "easyeda_control_shortcuts",
  "easyeda_control_pcb_layers",
  "easyeda_control_project_open",
  "easyeda_control_pcb_identities", "easyeda_control_history",
  "easyeda_control_pcb_geometry",
  "easyeda_control_project_symbol",
  "easyeda_control_project_pcb",
  "easyeda_control_project_schematic",
  "easyeda_control_project_board",
  "easyeda_control_project_symbol_metadata",
  "easyeda_control_disposable_symbol_copy",
  "easyeda_control_disposable_pcb_rename",
  "easyeda_control_disposable_schematic_rename",
  "easyeda_control_project_schematic_rename",
]);

export function configuredFacadeMode(environment: Readonly<Record<string, string | undefined>>): FacadeMode {
  if (isPublicUtilities209Configured(environment)) { return "public-utilities-only"; }
  return environment["EASYEDA_PCB_BUNDLE_VERSION"] === "3.2.149.5378b690" &&
    environment["EASYEDA_PUBLIC_API_BUNDLE_VERSION"] === "0.2.53.aee2f57a"
    ? "legacy-reviewed" : "calculation-only";
}

export function facadeToolRegistered(mode: FacadeMode, name: string): boolean {
  if (name === "easyeda_control_public_readers" || name === "easyeda_control_catalog_footprint" ||
      name === "easyeda_control_catalog_components" || name === "easyeda_control_pcb209_opening" || name === "easyeda_control_pcb209_worker_startup") { return mode === "public-utilities-only"; }
  return mode === "legacy-reviewed" ||
    (mode === "public-utilities-only" ? PUBLIC_UTILITIES_ONLY_TOOLS : CALCULATION_ONLY_TOOLS).includes(name);
}
