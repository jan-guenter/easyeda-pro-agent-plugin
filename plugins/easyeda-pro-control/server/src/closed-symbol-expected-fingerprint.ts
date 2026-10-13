// Internal expectation. An expectation from reviewed/local identities, never a connected observation.
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, validatePrivateFingerprint } from "./core.ts";
import type { ExpectedFingerprint } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { UpstreamEasyedaClient } from "./upstream.ts";

const MAX_BYTES = 262_144;
export interface ClosedSymbolExpectedFingerprint {
  readonly profile: "easyeda-pro-control.closed-symbol-expected-fingerprint.v1";
  readonly fingerprint: ExpectedFingerprint;
  readonly expectationOnly: true;
  readonly connectedRuntimeObserved: false;
  readonly executionAuthorized: false;
}

function dataText(value: unknown): string {
  let bytes = 0, nodes = 0;
  const seen = new Set<object>();
  function string(text: string): void {
    bytes += Buffer.byteLength(text);
    if (bytes > MAX_BYTES) { throw new Error("Expected fingerprint exceeds its data bound."); }
  }
  function visit(item: unknown, depth: number): void {
    nodes += 1;
    if (nodes > 20_000 || depth > 32) { throw new Error("Expected fingerprint exceeds its structural bound."); }
    if (typeof item === "string") { string(item); return; }
    if (item === null || typeof item === "boolean") { return; }
    if (typeof item === "number" && Number.isFinite(item) && !Object.is(item, -0)) { return; }
    if (typeof item !== "object" || seen.has(item)) { throw new Error("Expected fingerprint requires unaliased JSON data."); }
    seen.add(item);
    const array = Array.isArray(item);
    if (Object.getPrototypeOf(item) !== (array ? Array.prototype : Object.prototype)) { throw new Error("Expected fingerprint requires ordinary data objects."); }
    const keys = Reflect.ownKeys(item).filter((key) => !(array && key === "length"));
    if (array && keys.length !== item.length) { throw new Error("Expected fingerprint arrays must be dense."); }
    for (const [index, key] of keys.entries()) {
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (typeof key !== "string" || descriptor === undefined || !("value" in descriptor) || descriptor.enumerable !== true || (array && key !== String(index))) {
        throw new Error("Expected fingerprint refuses accessors or hidden data.");
      }
      string(key); visit(descriptor.value, depth + 1);
    }
  }
  visit(value, 0);
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text) + 1 > MAX_BYTES) { throw new Error("Expected fingerprint plus artifact newline exceeds 256 KiB."); }
  return text;
}

function freezeData(value: unknown): void {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) { freezeData(child); }
    Object.freeze(value);
  }
}
function ownValue(value: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined || !("value" in descriptor)) { throw new Error(`Expected fingerprint owner requires own data ${key}.`); }
  return descriptor.value;
}
function method(value: object, key: string): unknown {
  let owner: object | null = value;
  for (let depth = 0; owner !== null && depth < 8; depth += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(owner, key);
    if (descriptor !== undefined) {
      if (!("value" in descriptor) || typeof descriptor.value !== "function") { throw new Error(`Expected fingerprint owner requires method ${key}.`); }
      return descriptor.value;
    }
    const parent: unknown = Object.getPrototypeOf(owner);
    if (parent !== null && typeof parent !== "object") { throw new TypeError("Expected fingerprint method owner has an invalid prototype."); }
    owner = parent;
  }
  throw new Error(`Expected fingerprint owner lacks ${key}.`);
}

/** Only the fixed index-owned engine/upstream pair is input. No fingerprint, verifier or hash override is accepted.
 * Local launcher/bundle readers may read immutable installed program files when the future index calls
 * this function. Tests replace those I/O methods. No status, launcherState, connection or tool is used.
 */
export async function buildClosedSymbolExpectedFingerprint(engine: EasyedaControlEngine, upstream: UpstreamEasyedaClient): Promise<ClosedSymbolExpectedFingerprint> {
  ownValue(engine, "upstream"); ownValue(engine, "controlFingerprintPromise");
  const facadePromise = engine.controlFingerprintPromise;
  if (ownValue(engine, "upstream") !== upstream || ownValue(engine, "controlFingerprintPromise") !== facadePromise) { throw new Error("Expected fingerprint engine ownership changed."); }
  method(upstream, "launcherFingerprint"); method(upstream, "installedEasyedaBundles");
  // oxlint-disable-next-line typescript/unbound-method -- Retain exact identities; both are called with the original upstream receiver below.
  const bundleReader = upstream.installedEasyedaBundles, launcherReader = upstream.launcherFingerprint;
  if (launcherReader === undefined || bundleReader === undefined) { throw new Error("Expected fingerprint local readers are unavailable."); }
  const manifestFingerprint = reviewedCompatibilityManifestFingerprint();
  const manifest = loadReviewedCompatibilityManifest();
  const manifestDataSeal = dataText(manifest), manifestSeal = dataText(manifestFingerprint);
  const retained: { original: unknown; seal: string }[] = [];
  function current(): void {
    if (ownValue(engine, "upstream") !== upstream || ownValue(engine, "controlFingerprintPromise") !== facadePromise ||
        method(upstream, "launcherFingerprint") !== launcherReader || method(upstream, "installedEasyedaBundles") !== bundleReader) {
      throw new Error("Expected fingerprint local owner or reader changed.");
    }
    if (dataText(reviewedCompatibilityManifestFingerprint()) !== manifestSeal || dataText(loadReviewedCompatibilityManifest()) !== manifestDataSeal) {
      throw new Error("Expected fingerprint reviewed manifest changed.");
    }
    for (const item of retained) { if (dataText(item.original) !== item.seal) { throw new Error("Expected fingerprint local identity changed."); } }
  }
  function retain<T>(original: T): T {
    const seal = dataText(original);
    retained.push({ original, seal });
    const result = structuredClone(original);
    if (dataText(result) !== seal) { throw new Error("Expected fingerprint snapshot changed."); }
    return result;
  }
  current();
  const facadeImplementation = retain(await facadePromise); current();
  const upstreamLauncher = retain(await launcherReader.call(upstream)); current();
  const installedBundles = retain(await bundleReader.call(upstream)); current();
  const pinned = manifest.connectedRuntime;
  const fingerprint: ExpectedFingerprint = {
    facadeImplementation, reviewedCompatibilityManifest: manifestFingerprint,
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher,
    upstreamImplementationDrift: false, installedBundles,
    toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: pinned.nodeVersion,
      bridge_connected: true, easyeda_version: pinned.easyedaVersion, extension_version: pinned.extensionVersion,
      extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }),
      diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
  };
  dataText(fingerprint); validatePrivateFingerprint(fingerprint); current();
  freezeData(fingerprint);
  return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-expected-fingerprint.v1", fingerprint,
    expectationOnly: true, connectedRuntimeObserved: false, executionAuthorized: false });
}
