export const BASE_RELEASE_VERSION = "0.3.0";

const PLUGIN_INSTALL_VERSION_PATTERN = /^0\.3\.0(?:\+codex\.\d+)?$/u;
const STAMPED_PLUGIN_INSTALL_VERSION_PATTERN = /^0\.3\.0\+codex\.\d+$/u;

export interface ReleaseVersionCoordinates {
  readonly bridgeExtensionManifest: unknown;
  readonly bridgePackageManifest: unknown;
  readonly controlVersion: unknown;
  readonly packageLockRoot: unknown;
  readonly packageLockTopLevel: unknown;
  readonly packageManifest: unknown;
  readonly pluginManifest: unknown;
  readonly reviewedBundle: unknown;
  readonly reviewedSourceTree: unknown;
}

export interface ReleaseVersionValidation {
  readonly detail: string;
  readonly mismatches: readonly string[];
  readonly ok: boolean;
}

export interface ReleaseVersionPolicy {
  readonly requirePluginCachebuster?: boolean;
}

export function validateReleaseVersionParity(
  coordinates: ReleaseVersionCoordinates,
  policy: ReleaseVersionPolicy = {},
): ReleaseVersionValidation {
  const mismatches: string[] = [];
  const pluginInstallVersionPattern = policy.requirePluginCachebuster === true
    ? STAMPED_PLUGIN_INSTALL_VERSION_PATTERN
    : PLUGIN_INSTALL_VERSION_PATTERN;
  if (
    typeof coordinates.pluginManifest !== "string" ||
    !pluginInstallVersionPattern.test(coordinates.pluginManifest)
  ) {
    mismatches.push("pluginManifest");
  }
  const baseCoordinates: Readonly<Record<string, unknown>> = {
    bridgeExtensionManifest: coordinates.bridgeExtensionManifest,
    bridgePackageManifest: coordinates.bridgePackageManifest,
    controlVersion: coordinates.controlVersion,
    packageLockRoot: coordinates.packageLockRoot,
    packageLockTopLevel: coordinates.packageLockTopLevel,
    packageManifest: coordinates.packageManifest,
    reviewedBundle: coordinates.reviewedBundle,
    reviewedSourceTree: coordinates.reviewedSourceTree,
  };
  for (const [name, value] of Object.entries(baseCoordinates)) {
    if (value !== BASE_RELEASE_VERSION) {
      mismatches.push(name);
    }
  }
  return {
    detail: JSON.stringify({
      allowedPluginManifest: [
        ...(policy.requirePluginCachebuster === true
          ? []
          : [BASE_RELEASE_VERSION]),
        `${BASE_RELEASE_VERSION}+codex.<digits>`,
      ],
      coordinates,
      expectedBase: BASE_RELEASE_VERSION,
      mismatches,
    }),
    mismatches,
    ok: mismatches.length === 0,
  };
}
