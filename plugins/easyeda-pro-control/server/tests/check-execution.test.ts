import assert from "node:assert/strict";
import { test } from "node:test";
import { RuleCheckExecutor, assertRuleCheckDatabaseUnchanged, boundedRuleReport, ruleSnapshotHash } from "../src/check-execution.ts";
import type { RuleCheckDependencies, RuleCheckEngine } from "../src/check-execution.ts";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { verifyNativeRuleReport } from "../src/native-rule-report.ts";

type Value = Record<string, unknown>;
const HASH = "a".repeat(64);
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "tab" } };
const BINDING = { projectUuid: "project", documentUuid: "board", tabId: "tab" };
const SNAPSHOT = { document: BINDING, kind: "pcb-drc" as const, source: "complete native calculation scope", policy: { config: { fixture: true } } };
const RECEIPT = { schema: "easyeda-pro-control.checkpoint.v2" as const, createdAt: "2026-01-01T00:00:00Z", source: CONTEXT.project.path,
  checkpoint: "/fixture/baseline.sqlite", receiptPath: "/fixture/receipt.json", checkpointSha256: HASH, checkpointDumpSha256: HASH,
  sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH, sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
  checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } };
const VERIFIED = { ok: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true, sourceEqualsCheckpoint: true, sourceChanged: false,
  checkpoint: RECEIPT.checkpoint, source: RECEIPT.source, receiptPath: RECEIPT.receiptPath, checkpointSha256: HASH, checkpointDumpSha256: HASH,
  sourceSha256: HASH, sourceDumpSha256: HASH };
const EVIDENCE = { profile: "easyeda-pro-control.native-rule-report.v1", kind: "pcb-drc", document: BINDING,
  sourceBefore: SNAPSHOT.source, sourceAfter: SNAPSHOT.source, policyBefore: SNAPSHOT.policy, policyAfter: SNAPSHOT.policy,
  nativeReport: [], nativeCounts: null, execution: { source: "native-pcb-verbose", completed: true, actionSucceeded: null, groupStarted: 0, groupEnded: 0 } };

function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], runtime = manifest.connectedRuntime;
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
function fixture(): { executor: RuleCheckExecutor; calls: string[]; journals: Map<string, Value>; input: { kind: "pcb-drc"; expectedContext: typeof CONTEXT; expectedFingerprint: Value };
  state: { otherIncomplete: boolean; sourceDrift: boolean; databaseDrift: boolean; uncertain: boolean; calls: number } } {
  const calls: string[] = [], journals = new Map<string, Value>();
  const state = { otherIncomplete: false, sourceDrift: false, databaseDrift: false, uncertain: false, calls: 0 };
  const identity = fingerprint();
  const save = (journal: Value): Promise<string> => {
    assert.equal(typeof journal["operationId"], "string"); const id = String(journal["operationId"]);
    journals.set(id, structuredClone(journal)); return Promise.resolve(`/fixture/${id}.json`);
  };
  const services: RuleCheckDependencies = { createOperation: save, updateOperation: save,
    listOperations: (): Promise<Value[]> => Promise.resolve(state.otherIncomplete ? [{ operationId: "other", state: "applied-unsaved" }] : [...journals.values()]),
    loadOperation: (id): ReturnType<NonNullable<RuleCheckDependencies["loadOperation"]>> => {
      const journal = journals.get(id);
      if (journal === undefined || !isRecord(journal["plan"]) || typeof journal["planHash"] !== "string") { throw new Error("Fixture journal missing."); }
      return Promise.resolve({ ...structuredClone(journal), operationId: id, plan: journal["plan"], planHash: journal["planHash"] });
    },
    writePhaseArtifact: (id, sequence, phase, value): ReturnType<NonNullable<RuleCheckDependencies["writePhaseArtifact"]>> => Promise.resolve({ path: `/fixture/${id}/${sequence}-${phase}.json`, bytes: JSON.stringify(value).length, sha256: sha256Json(value) }),
    verifyProfile: (_root, kind): ReturnType<NonNullable<RuleCheckDependencies["verifyProfile"]>> => Promise.resolve({ profile: "easyeda-pro-control.native-rule-implementation.v1", kind, implementations: [] }),
  };
  const engine: RuleCheckEngine = {
    executionAuthorityValidator: {}, status: (): Promise<{ stableFingerprint: Value }> => Promise.resolve({ stableFingerprint: identity }),
    assertContext: (): Promise<typeof CONTEXT> => Promise.resolve(structuredClone(CONTEXT)),
    upstream: { installedEasyedaBundles: (): Promise<{ assetsRoot: string }> => Promise.resolve({ assetsRoot: "/opt/assets" }) },
    checkpoint: (request): ReturnType<RuleCheckEngine["checkpoint"]> => Promise.resolve(request.receiptPath === undefined ? RECEIPT : { ...VERIFIED, ok: !state.databaseDrift, sourceChanged: state.databaseDrift }),
    assertRecoveryOperationIsolated: (): Promise<true> => Promise.resolve(true),
    ensureRuntimeRestartChallenge: (): Promise<string> => Promise.resolve("fixture-challenge"),
    recoverDispatchAuthority: (): Promise<never> => Promise.reject(new Error("Unused fixture authority recovery")),
    dispatchWithOrphanTracking: async (journal, phase): Promise<unknown> => {
      calls.push(phase); state.calls += 1;
      assert.equal(journals.get(journal.operationId)?.["state"], `${phase}-dispatching`);
      if (phase === "native-check" && state.uncertain) { journal.orphanedCallPossible = true; await save(journal); throw new Error("uncertain native check"); }
      const payload = phase === "native-check" ? EVIDENCE : { ...SNAPSHOT, source: state.sourceDrift && phase !== "check-baseline" ? "changed other loaded sheet" : SNAPSHOT.source };
      return { structuredContent: encodeExactReadEnvelope(payload) };
    },
  };
  return { executor: new RuleCheckExecutor(engine, services), calls, journals, input: { kind: "pcb-drc", expectedContext: CONTEXT, expectedFingerprint: identity }, state };
}

void test("native check journals each dispatch, retains itemized evidence and proves complete saved DB invariance without save", async () => {
  const run = fixture();
  const result = await run.executor.run(run.input);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], false); assert.equal(result["reopened"], false);
  assert.deepEqual(run.calls, ["check-baseline", "native-check", "check-after"]);
  assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["durableDatabaseUnchanged"], true);
  assert.ok(isRecord(result["reportArtifact"])); assert.match(String(result["reportArtifact"]["path"]), /itemized-report/u);
});
void test("incomplete operations refuse before any check; source/DB drift cannot become a verified result", async () => {
  const blocked = fixture(); blocked.state.otherIncomplete = true;
  await assert.rejects(blocked.executor.run(blocked.input), /incomplete operation/u); assert.equal(blocked.state.calls, 0);
  for (const field of ["sourceDrift", "databaseDrift"] as const) {
    const run = fixture(); run.state[field] = true;
    await assert.rejects(run.executor.run(run.input));
    assert.equal([...run.journals.values()][0]?.["state"], "check-needs-review");
  }
});
void test("uncertain calculation retains orphan risk and reconciliation refuses to repeat it", async () => {
  const run = fixture(); run.state.uncertain = true;
  await assert.rejects(run.executor.run(run.input), /uncertain native/u);
  const journal = [...run.journals.values()][0]; assert.ok(journal);
  assert.equal(journal["state"], "check-outcome-unknown"); assert.equal(journal["orphanedCallPossible"], true);
  await assert.rejects(run.executor.reconcileNoMutation(String(journal["operationId"])), /execution authority/u);
  assert.equal(run.calls.filter((phase) => phase === "native-check").length, 1);
});
void test("complete logical-dump and receipt identity are required even when an aggregate ok flag is true", () => {
  assertRuleCheckDatabaseUnchanged(VERIFIED, RECEIPT);
  for (const changed of [{ ...VERIFIED, checkpointMatchesReceipt: false }, { ...VERIFIED, sourceChanged: true },
    { ...VERIFIED, sourceDumpSha256: "b".repeat(64) }, { ...VERIFIED, receiptPath: "/other/receipt.json" }]) {
    assert.throws(() => assertRuleCheckDatabaseUnchanged(changed, RECEIPT));
  }
  assert.notEqual(ruleSnapshotHash(SNAPSHOT), ruleSnapshotHash({ ...SNAPSHOT, source: "unrelated loaded sheet changed" }));
  assert.equal(ruleSnapshotHash(SNAPSHOT), ruleSnapshotHash({ ...SNAPSHOT, document: { ...BINDING, tabId: "explicitly-rebound-tab" } }));
});
void test("inline itemization is bounded and never changes the full report", () => {
  const report = verifyNativeRuleReport(EVIDENCE, BINDING);
  report.items = Array.from({ length: 250 }, (_, index) => ({ index, severity: "error", categories: ["fixture"], native: { detail: "x".repeat(1000) } }));
  const bounded = boundedRuleReport(report, 200);
  assert.ok(Array.isArray(bounded["items"])); assert.ok(bounded["items"].length < 200);
  assert.equal(bounded["itemsOmitted"], 250 - bounded["items"].length); assert.equal(report.items.length, 250);
});
