import type { ReviewedCompatibilityManifest } from "../server/src/core.ts";
import { CALCULATION_ONLY_TOOLS, configuredFacadeMode } from "../server/src/facade-mode.ts";
import type { FacadeMode } from "../server/src/facade-mode.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../server/src/sdk-local-runtime.ts";
import { FACADE_TOOL_NAMES } from "./plugin-contract.ts";

export interface DoctorRuntimeContract {
  readonly profile: "reviewed-legacy-installed-bundles" | typeof SDK_LOCAL_RUNTIME_PROFILE.schema;
  readonly facadeMode: FacadeMode;
  readonly pcbBundleVersion: string;
  readonly publicApiBundleVersion: string;
  readonly bundleHashes: Readonly<{
    pcbImplementation: string; publicApiImplementation: string; publicApiAdapter: string; publicApiDeclarations: string;
  }>;
  readonly toolNames: readonly string[];
  readonly executionAuthorized: false;
  readonly connectedValidation: false;
}

/** Offline diagnostic expectations only. Restricted registration also exists
 * for unknown versions; that fallback must never make their doctor checks pass.
 */
export function selectDoctorRuntimeContract(pcbBundleVersion: string, publicApiBundleVersion: string,
  legacy: ReviewedCompatibilityManifest["installedBundles"]): DoctorRuntimeContract | undefined {
  const facadeMode = configuredFacadeMode({ EASYEDA_PCB_BUNDLE_VERSION: pcbBundleVersion,
    EASYEDA_PUBLIC_API_BUNDLE_VERSION: publicApiBundleVersion });
  const current = SDK_LOCAL_RUNTIME_PROFILE.installedBundles;
  const bundles = facadeMode === "legacy-reviewed" ? legacy : current;
  if (pcbBundleVersion !== bundles.pcbEditor.version || publicApiBundleVersion !== bundles.publicApi.version) { return undefined; }
  return Object.freeze({
    profile: facadeMode === "legacy-reviewed" ? "reviewed-legacy-installed-bundles" : SDK_LOCAL_RUNTIME_PROFILE.schema,
    facadeMode, pcbBundleVersion, publicApiBundleVersion,
    bundleHashes: Object.freeze({ pcbImplementation: bundles.pcbEditor.implementationSha256,
      publicApiImplementation: bundles.publicApi.implementationSha256, publicApiAdapter: bundles.publicApi.adapterSha256,
      publicApiDeclarations: bundles.publicApi.declarationsSha256 }),
    toolNames: Object.freeze([...(facadeMode === "legacy-reviewed" ? FACADE_TOOL_NAMES : CALCULATION_ONLY_TOOLS)]),
    executionAuthorized: false, connectedValidation: false,
  });
}
