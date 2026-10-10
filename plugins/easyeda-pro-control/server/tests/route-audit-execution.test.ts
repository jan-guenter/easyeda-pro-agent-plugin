import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import { runPcbRouteAudit } from "../src/route-audit-execution.ts";
import type { RouteAuditEngine } from "../src/route-audit-execution.ts";

type Value = Record<string, unknown>;
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "tab" } };
function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"]; const runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion,
      extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }),
      diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api.d.ts" } } };
}
function exact(sample: Value, corruptHash = false): Value {
  return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: corruptHash ? "a".repeat(64) : sha256Json(sample),
    contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } };
}
function fixture(options: { sourceDrift?: boolean; hashDrift?: boolean; runtimeDrift?: boolean } = {}): { engine: RouteAuditEngine; calls: string[]; expectedFingerprint: Value } {
  const expectedFingerprint = fingerprint(); const calls: string[] = []; let sourceReads = 0; let statusReads = 0;
  return { expectedFingerprint, calls, engine: {
    status: (): Promise<{ stableFingerprint: Value }> => { statusReads += 1; return Promise.resolve({ stableFingerprint: options.runtimeDrift === true && statusReads > 1 ? { ...expectedFingerprint, toolCount: 0 } : expectedFingerprint }); },
    assertContext: (): Promise<typeof CONTEXT> => Promise.resolve(structuredClone(CONTEXT)),
    exactRead: (request): ReturnType<RouteAuditEngine["exactRead"]> => {
      assert.ok(isRecord(request) && typeof request["kind"] === "string");
      const kind = request["kind"]; calls.push(kind);
      if (kind === "pcb-source") {
        sourceReads += 1;
        const document = { uuid: "board", docType: "PCB", editVersion: options.sourceDrift === true && sourceReads > 1 ? "changed" : "fixture" };
        return Promise.resolve(exact({ ok: true, kind, documentType: 3, source: `{"type":"DOCHEAD"}||${JSON.stringify(document)}` }, options.hashDrift));
      }
      return Promise.resolve(exact({ ok: true, kind, documentType: 3, units: { coordinatesAndLengths: "mil" }, families: { pads: { count: 0, primitiveIds: [], byPrimitiveId: {} } },
        componentPadCorrelation: { status: "exact-subset", primitiveIds: [], byPrimitiveId: {} } }));
    },
  } };
}
void test("callable route audit binds source/inventory/source exact samples and report hashes without native writes", async () => {
  const state = fixture();
  const result = await runPcbRouteAudit(state.engine, { audit: { kind: "pcb-route-audit" }, expectedContext: CONTEXT, expectedFingerprint: state.expectedFingerprint });
  assert.deepEqual(state.calls, ["pcb-source", "pcb-inventory", "pcb-source"]);
  assert.equal(result.proof.sourceUnchanged, true);
  assert.equal(result.proof.reportSha256, sha256Json(result.report));
  assert.equal(result.proof.inventorySha256, result.report.inventorySha256);
});
void test("route audit refuses changed source, forged exact commitment and runtime drift", async () => {
  for (const options of [{ sourceDrift: true }, { hashDrift: true }, { runtimeDrift: true }]) {
    const state = fixture(options);
    await assert.rejects(runPcbRouteAudit(state.engine, { audit: { kind: "pcb-route-audit" }, expectedContext: CONTEXT, expectedFingerprint: state.expectedFingerprint }));
    if (options.hashDrift === true) { assert.deepEqual(state.calls, ["pcb-source"]); }
  }
});
