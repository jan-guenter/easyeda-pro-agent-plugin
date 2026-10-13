/** Registration is selected once at startup, never by a tool argument. A new
 * installation must not inherit generic readers or native controls merely
 * because a separately reviewed calculation works there.
 */
export type FacadeMode = "legacy-reviewed" | "calculation-only";

export const CALCULATION_ONLY_TOOLS = Object.freeze([
  "easyeda_control_api", "easyeda_control_discover", "easyeda_control_status", "easyeda_control_calculate",
  "easyeda_control_system", "easyeda_control_extensions",
]);

export function configuredFacadeMode(environment: Readonly<Record<string, string | undefined>>): FacadeMode {
  return environment["EASYEDA_PCB_BUNDLE_VERSION"] === "3.2.149.5378b690" &&
    environment["EASYEDA_PUBLIC_API_BUNDLE_VERSION"] === "0.2.53.aee2f57a"
    ? "legacy-reviewed" : "calculation-only";
}

export function facadeToolRegistered(mode: FacadeMode, name: string): boolean {
  return mode === "legacy-reviewed" || CALCULATION_ONLY_TOOLS.includes(name);
}
