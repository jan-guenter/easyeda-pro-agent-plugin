import {
  assertExpectedFingerprint,
  assertSubset,
  loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint,
} from "./core.ts";
import type { EasyedaControlEngine, UpstreamClient } from "./engine.ts";

/** Shared installation identity for separately reviewed local SDK adapters.
 * These bytes do not admit project readers, navigation or design operations.
 * Each caller still fixes its own programs, schema and supported methods.
 */
export const SDK_LOCAL_RUNTIME_PROFILE = {
  schema: "easyeda-pro-control.sdk-local-runtime.v1",
  // The authenticated handshake forwards getEditorCurrentVersion(), which
  // Reports editorMainVersion, not the suffixed installed package version.
  editorReportedVersion: "3.2.206",
  installedBundles: {
    pcbEditor: {
      version: "3.2.193.682ed44e",
      implementationSha256: "217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33",
    },
    publicApi: {
      version: "0.3.50.ab46409c",
      implementationSha256: "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76",
      adapterSha256: "5570385041b304d6b2fc8ce59de7e0030f2732913cf6d43861fe985e0c079f3a",
      declarationsSha256: "d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def",
    },
  },
} as const;

export type SdkLocalEngine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed"> & {
  readonly status: () => Promise<{ stableFingerprint: Record<string, unknown> }>;
  readonly upstream: Pick<UpstreamClient, "callTool">;
};

/** Retain every common manifest trust field while selecting this local-only
 * app/API tuple. Never normalize or forge a fingerprint for the legacy design
 * validator, and never treat this identity check as permission for other APIs.
 */
export function validateSdkLocalRuntimeFingerprint(fingerprint: unknown): true {
  assertExpectedFingerprint(fingerprint);
  const manifestBefore = reviewedCompatibilityManifestFingerprint();
  const manifest = loadReviewedCompatibilityManifest();
  assertSubset(reviewedCompatibilityManifestFingerprint(), manifestBefore, "SDK local manifest stability");
  assertSubset(fingerprint.reviewedCompatibilityManifest, manifestBefore, "SDK local manifest identity");
  const implementation = fingerprint.facadeImplementation;
  const actual = {
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
  };
  assertSubset(actual, {
    facadeImplementation: manifest.facadeImplementation[implementation.mode],
    upstream: manifest.upstream,
    connectedRuntime: { ...manifest.connectedRuntime, easyedaVersion: SDK_LOCAL_RUNTIME_PROFILE.editorReportedVersion },
    installedBundles: SDK_LOCAL_RUNTIME_PROFILE.installedBundles,
  }, "SDK local reviewed runtime scope");
  return true;
}
