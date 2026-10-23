import {
  assertExpectedFingerprint,
  assertSubset,
  loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint,
} from "./core.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";

/** This generation admits only the fixed public Math, Unit and Environment
 * subsets. It must never replace the older shared native-adapter profile.
 */
export const SDK_PUBLIC_UTILITIES_209_PROFILE = Object.freeze({
  schema: "easyeda-pro-control.sdk-public-utilities-209.v1",
  editorReportedVersion: "3.2.209",
  installedPackageVersion: "3.2.209.8a704eab",
  packageSha256: "c63c12edae82c39c1fb2c0f0dd0e27678b83526c89ea174b3b79655711da8e51",
  installedBundles: Object.freeze({
    pcbEditor: Object.freeze({
      version: "3.2.195.6b67774e",
      implementationSha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b",
    }),
    publicApi: Object.freeze({
      version: "0.3.59.1ca9efb5",
      implementationSha256: "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1",
      adapterSha256: "d2b384470013c991733c92c281a3f4e440d7c711a62a4dd27b9288d26d9a6cb0",
      declarationsSha256: "0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72",
    }),
  }),
} as const);

export type SdkPublicUtilitiesRuntimeProfile = typeof SDK_LOCAL_RUNTIME_PROFILE | typeof SDK_PUBLIC_UTILITIES_209_PROFILE;

/** Registration selector only. Matching names never admit installed bytes or
 * an authenticated runtime, and cannot promote an existing offline process.
 */
export function isPublicUtilities209Configured(environment: Readonly<Record<string, string | undefined>>): boolean {
  const pins = SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles;
  return environment["EASYEDA_PCB_BUNDLE_VERSION"] === pins.pcbEditor.version &&
    environment["EASYEDA_PUBLIC_API_BUNDLE_VERSION"] === pins.publicApi.version;
}

/** Select only these two closed reviewed tuples. The new branch repeats every
 * common trust check; it never forges old bundle/version fields for admission.
 */
export function selectSdkPublicUtilitiesRuntimeProfile(fingerprint: unknown): SdkPublicUtilitiesRuntimeProfile {
  assertExpectedFingerprint(fingerprint);
  if (fingerprint.health.payload.easyeda_version !== SDK_PUBLIC_UTILITIES_209_PROFILE.editorReportedVersion) {
    validateSdkLocalRuntimeFingerprint(fingerprint);
    return SDK_LOCAL_RUNTIME_PROFILE;
  }
  const manifestBefore = reviewedCompatibilityManifestFingerprint();
  const manifest = loadReviewedCompatibilityManifest();
  assertSubset(reviewedCompatibilityManifestFingerprint(), manifestBefore, "SDK public utilities manifest stability");
  assertSubset(fingerprint.reviewedCompatibilityManifest, manifestBefore, "SDK public utilities manifest identity");
  const implementation = fingerprint.facadeImplementation;
  assertSubset({
    facadeImplementation: {
      version: implementation.version,
      operationSchema: implementation.operationSchema,
      sha256: implementation.sha256,
      fileCount: implementation.files.length,
      files: implementation.files.map((file) => ({ relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 }))
        .toSorted((left, right) => left.relativePath.localeCompare(right.relativePath)),
    },
    upstream: {
      serverVersion: fingerprint.upstreamServer.version,
      launcher: fingerprint.upstreamLauncher,
      toolCatalog: { count: fingerprint.toolCount, sha256: fingerprint.toolCatalogSha256 },
    },
    connectedRuntime: {
      healthVersion: fingerprint.health.payload.version,
      nodeVersion: fingerprint.health.payload.node_version.replace(/^v/u, ""),
      easyedaVersion: fingerprint.health.payload.easyeda_version,
      extensionVersion: fingerprint.health.payload.extension_version,
      bridgeVersion: fingerprint.bridge.payload.bridge_version,
      bridgeEasyedaVersion: fingerprint.bridge.payload.easyeda_version ?? null,
      methodRegistryHash: fingerprint.bridge.payload.diagnostics.method_registry_hash,
      dispatcher: {
        source: fingerprint.bridgeDispatcher.payload.source,
        buildId: fingerprint.bridgeDispatcher.payload.dispatcher_build_id,
        total: fingerprint.bridgeDispatcher.payload.total,
      },
    },
    installedBundles: fingerprint.installedBundles,
  }, {
    facadeImplementation: manifest.facadeImplementation[implementation.mode],
    upstream: manifest.upstream,
    connectedRuntime: { ...manifest.connectedRuntime, easyedaVersion: SDK_PUBLIC_UTILITIES_209_PROFILE.editorReportedVersion },
    installedBundles: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles,
  }, "SDK public utilities 209 reviewed runtime scope");
  return SDK_PUBLIC_UTILITIES_209_PROFILE;
}
