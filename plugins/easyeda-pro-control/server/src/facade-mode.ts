import { isPublicUtilities209Configured } from "./sdk-public-utilities-profile.ts";

/** Registration is selected once at startup, never by a tool argument. A new
 * installation must not inherit generic readers or native controls merely
 * because a separately reviewed calculation works there.
 */
export type FacadeMode = "legacy-reviewed" | "calculation-only" | "public-utilities-only";

export const PUBLIC_UTILITIES_ONLY_TOOLS = Object.freeze([
  "easyeda_control_api", "easyeda_control_discover", "easyeda_control_status",
  "easyeda_control_calculate", "easyeda_control_system", "easyeda_control_launch",
]);
export const PUBLIC_UTILITIES_ONLY_SCOPE = "EasyEDA 3.2.209 public Math, Unit and Environment subsets and separately admitted ordinary launch only. No project opening, native/private adapter, design read/write, Save, recovery or PCB-worker route is registered. Source review and synthetic tests are not connected execution validation. Launch uses the existing profile and does not prove isolation or readiness.";

export function publicUtilitiesOnlyCapabilities(): Record<string, unknown> {
  return {
    sdkCalculations: { tool: "easyeda_control_calculate", runtimeAdmissionRequired: true, connectedValidation: false },
    sdkSystem: { tool: "easyeda_control_system", runtimeAdmissionRequired: true, connectedValidation: false },
    ordinaryLaunch: { tool: "easyeda_control_launch", installedIdentityAdmissionRequired: true, profileIsolation: false, connectedValidation: false },
    designAccess: { enabled: false, scope: "all-design-routes" }, navigation: { enabled: false },
    save: { enabled: false }, recovery: { enabled: false }, nativeAdapters: { enabled: false },
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
  return mode === "legacy-reviewed" ||
    (mode === "public-utilities-only" ? PUBLIC_UTILITIES_ONLY_TOOLS : CALCULATION_ONLY_TOOLS).includes(name);
}
