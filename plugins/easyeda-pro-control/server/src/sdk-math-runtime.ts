import {
  assertExpectedFingerprint,
  assertSubset,
  assertUpstreamReplySettled,
  canonicalJson,
  extractToolPayload,
  loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint,
  sha256Json,
} from "./core.ts";
import type { EasyedaControlEngine, UpstreamClient } from "./engine.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import {
  SDK_MATH_API_SHA256,
  SDK_MATH_API_VERSION,
  SDK_MATH_MAX_BYTES,
  buildSdkMathProgram,
  parseSdkMathRequest,
  validateSdkMathResult,
} from "./sdk-math.ts";

/** Admission of this tuple is exclusively for the fixed sys_Math programs.
 * PCB bytes identify the installation; no PCB operation or semantic parity is
 * admitted. The legacy private manifest and every native profile stay intact.
 */
export const SDK_MATH_RUNTIME_PROFILE = {
  schema: "easyeda-pro-control.sdk-math-runtime.v1",
  easyedaVersion: "3.2.206.715d940d",
  installedBundles: {
    pcbEditor: {
      version: "3.2.193.682ed44e",
      implementationSha256: "217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33",
    },
    publicApi: {
      version: SDK_MATH_API_VERSION,
      implementationSha256: SDK_MATH_API_SHA256,
      adapterSha256: "5570385041b304d6b2fc8ce59de7e0030f2732913cf6d43861fe985e0c079f3a",
      declarationsSha256: "d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def",
    },
  },
} as const;

export type SdkMathEngine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed"> & {
  readonly status: () => Promise<{ stableFingerprint: Record<string, unknown> }>;
  readonly upstream: Pick<UpstreamClient, "callTool">;
};

/** Keep all common manifest trust fields. Only the explicitly named math tuple
 * replaces the legacy app/bundle fields in this separate scope; never feed a
 * normalized or forged fingerprint into validatePrivateFingerprint.
 */
export function validateSdkMathFingerprint(fingerprint: unknown): true {
  assertExpectedFingerprint(fingerprint);
  const manifestBefore = reviewedCompatibilityManifestFingerprint();
  const manifest = loadReviewedCompatibilityManifest();
  assertSubset(reviewedCompatibilityManifestFingerprint(), manifestBefore, "SDK math manifest stability");
  assertSubset(fingerprint.reviewedCompatibilityManifest, manifestBefore, "SDK math manifest identity");
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
    connectedRuntime: { ...manifest.connectedRuntime, easyedaVersion: SDK_MATH_RUNTIME_PROFILE.easyedaVersion },
    installedBundles: SDK_MATH_RUNTIME_PROFILE.installedBundles,
  }, "SDK math reviewed runtime scope");
  return true;
}

/** The registered caller supplies the existing serialized authenticated bridge
 * scope. No client, renderer owner, launch authority or context is constructed.
 * One fixed execute contains the adapter's two synchronous input-only samples.
 */
export async function calculateSdkMath(engine: SdkMathEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseSdkMathRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkMathFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkMathFingerprint(initial);
  assertSubset(initial, expected, "SDK math expected runtime");
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildSdkMathProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  // The generic exact envelope permits larger document snapshots. Calculations
  // Deliberately impose their smaller bound before decoding nested JSON.
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > SDK_MATH_MAX_BYTES) {
    throw new Error("SDK math reply exceeds its byte bound.");
  }
  const result = validateSdkMathResult(request, decodeExactReadEnvelope(envelope));
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkMathFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) {
    throw new Error("SDK math runtime changed around the calculation.");
  }
  const response = { ...result, runtimeAdmission: {
    profile: SDK_MATH_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(initial),
    beforeAndAfterChecked: true,
    scope: "fixed-input-only-sdk-math",
    liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > SDK_MATH_MAX_BYTES) {
    throw new Error("SDK math result exceeds its byte bound.");
  }
  return response;
}
