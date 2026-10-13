/** Private fixture parity correction: runtime producer returns own ok:true; no production source change. */
/** Actual stages/managed artifacts; fake child streams and gateway only. No native process. */
/* oxlint-disable import/max-dependencies -- Integration fixture binds the maintained stages and source-qualified transport without an authority stub. */
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { ClosedSymbolAdmissionStage } from "../../src/closed-symbol-admission.ts";
import { ClosedSymbolBootstrapLaunchStage } from "../../src/closed-symbol-launch.ts";
import { ClosedSymbolCloseStage } from "../../src/closed-symbol-close.ts";
import { ClosedSymbolCopyStage } from "../../src/closed-symbol-copy.ts";
import { FAMILY, appendClosedSymbolEvent, createClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import { isRecord, loadReviewedCompatibilityManifest, newOperationId, reviewedCompatibilityManifestFingerprint, sha256Json } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding, ClosedSessionAuthorityCapture, UpstreamClient } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../../src/windows-runtime.ts";
import type { WindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import { HISTORY_TABLE, IDS, OPERATION, mutate, fixture as sqlFixture } from "./symbol-sql-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { startupFixture } from "./closed-symbol-startup-browser-fixture.ts";
import { qualifiedClockFixture } from "./windows-clock-fixture.ts";
import { ClosedSymbolMainReferenceStage } from "../../src/closed-symbol-main-reference.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "../../src/closed-symbol-native-profile.ts";

type Bag = Record<string, unknown>;
type Bundles = Awaited<ReturnType<NonNullable<UpstreamClient["installedEasyedaBundles"]>>>;
interface FixtureState {
  scope: boolean; sequence: number; generation: string; runtimeReads: number; clockMs: number; witnessCalls: number;
  beforeWitness: (() => void | Promise<void>) | undefined; afterWitness: ((value: Bag) => void | Promise<void>) | undefined;
  afterRuntime: (() => void | Promise<void>) | undefined; returned: unknown; failWitness: boolean;
}
export interface MainReferenceFixture {
 owner: Awaited<ReturnType<typeof qualifiedClockFixture>>; engine: EasyedaControlEngine; runtime: WindowsControlRuntime;
 journal: Awaited<ReturnType<typeof createClosedSymbolJournal>>; state: FixtureState; source: Awaited<ReturnType<typeof sqlFixture>>;
 copied: Awaited<ReturnType<ClosedSymbolCopyStage["copy"]>>; stage: ClosedSymbolMainReferenceStage; input: Parameters<ClosedSymbolMainReferenceStage["runOnce"]>[0];
 baselineCapture: ClosedSessionAuthorityCapture;
 identity: Bag; launchClock: Awaited<ReturnType<WindowsControlRuntime["clockObservationForLaunch"]>>;
}
const ASSETS = "/mnt/c/Program Files/easyeda-pro/resources/app/assets";
function fingerprint(): Bag & { installedBundles: Bundles } {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => { const projected = { path: `/synthetic/${file.relativePath}` }; return Object.assign(projected, file); }) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion, extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: ASSETS, pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/synthetic/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/synthetic/api.js", adapterPath: "/synthetic/adapter.js", declarationsPath: "/synthetic/api.d.ts" } } };
}
export async function mainReferenceFixture(context: TestContext, recent = false): Promise<MainReferenceFixture> {
  // Keep checkpoint verification's temporary VACUUM copy inside the same
  // Isolated test root required by the exact Linux-child delegation.
  const originalTemp = process.env["TMPDIR"]; process.env["TMPDIR"] = syntheticSqlRoot();
  context.after((): void => { if (originalTemp === undefined) { delete process.env["TMPDIR"]; } else { process.env["TMPDIR"] = originalTemp; } });
  const source = await sqlFixture(), sqlRuntime = await syntheticSqlRuntime();
  mutate(source.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='${recent ? "2026-10-13 11:59:45" : "2026-01-15 12:34:56"}' WHERE uuid='${IDS.oldHead}'`);
  const identity = fingerprint(), owner = await qualifiedClockFixture(context);
  const state: FixtureState = { scope: false, sequence: 1, generation: "synthetic-witness-runtime-0001", runtimeReads: 0,
    clockMs: 0, witnessCalls: 0, beforeWitness: undefined, afterWitness: undefined, afterRuntime: undefined, returned: undefined, failWitness: false };
  owner.behavior.mutateResponse = (request, response): void => {
    const clock = response["clock"];
    if (isRecord(clock) && isRecord(clock["after"])) {
      state.clockMs = Number((BigInt(String(clock["after"]["utcAfterTicks"])) - 621_355_968_000_000_000n) / 10_000n);
      const base = response["base"];
      if (request["action"] === "clocked-prove-terminated" && isRecord(base)) {
        const checkedMs = Number((BigInt(String(clock["after"]["utcBeforeTicks"])) - 621_355_968_000_000_000n) / 10_000n);
        base["checkedAt"] = new Date(checkedMs).toISOString().replace(/Z$/u, "0000Z");
      }
    }
  };
  const startupBrowser = startupFixture("edit-marker-read");
  Object.assign(startupBrowser.input, { projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor });
  Object.assign(startupBrowser.actor, { uuid: IDS.actor, username: "synthetic-user" });
  startupBrowser.state.host["globalVariableCookieData"] = { userInfo: { ...startupBrowser.actor } };
  startupBrowser.state.host["messageBus"] = { rpcCall(route: unknown, args: unknown): Promise<unknown> {
    assert.equal(route, "/pro-mgr/hasProject"); assert.equal(JSON.stringify(args), JSON.stringify([IDS.project])); return Promise.resolve({ message: false });
  } };
  const upstream: UpstreamClient & WindowsControlRuntimeOptions["upstream"] = {
    findTool: () => Promise.resolve({ name: "easyeda_execute" }),
    bridgeSessionLifecycle: () => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43), activeSession: {
      sessionId: "s".repeat(43), sequence: state.sequence, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 }, publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] }),
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sessionSequence: state.sequence,
        begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
    installedEasyedaBundles: () => Promise.resolve(identity.installedBundles),
    async callTool(name, args, _timeout, binding) {
      assert.equal(name, "easyeda_execute"); assert.ok(binding !== undefined); const code = String(args?.["code"]);
      let value: unknown;
      if (code.includes("runtime-identity")) {
        state.runtimeReads += 1; value = { ok: true, kind: "runtime-identity", generation: state.generation, timeOrigin: 1000, processId: 101 }; await state.afterRuntime?.();
      } else if (code.includes("symbol-predispatch-observation.v2")) {
        state.witnessCalls += 1; assert.equal(args?.["confirmWrite"], true); await state.beforeWitness?.();
        if (state.failWitness) { throw new Error("synthetic uncertain witness transport"); }
        const time = state.clockMs + 100;
        const observation: Bag = { profile: "easyeda-pro-control.symbol-predispatch-observation.v2", projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor,
          targetUuid: IDS.target, activeUuid: IDS.peer, createdAtLiteral: "2020-01-01 00:00:00", workerClient: "a".repeat(16), workerMaxTicket: 100,
          workerTimeBeforeMs: time, workerTimeAfterMs: time + 1, cachedActorUuid: IDS.actor, startupActor: { ...startupBrowser.actor }, cachedActor: { ...startupBrowser.actor },
          rendererParsedCreatedAtMs: Date.parse("2019-12-31T23:00:00Z"), rendererTimezoneOffsetMinutes: -120, rendererClockBeforeMs: time, rendererClockAfterMs: time + 1,
          scope: "point-in-time-read-only-observation", appActorVerified: false, appClockVerified: false, workerFreshOfflineClockVerified: false, producerBindingVerified: false, executionAuthorized: false };
        await state.afterWitness?.(observation); value = observation;
      } else { value = await startupBrowser.run(); assert.ok(isRecord(value)); assert.equal(value["ok"], true, JSON.stringify(value)); }
      const raw = { content: [{ type: "text" as const, text: JSON.stringify(value) }] }; if (code.includes("symbol-predispatch-observation.v2")) { state.returned = raw; } return raw;
    },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: owner.options.reviewedExecutionScopeSha256 }, { hashExecutable: (): Promise<string> => Promise.resolve(owner.options.expectedExecutableSha256),
    startSupervisor: (): Promise<WindowsAuthoritySupervisor> => Promise.resolve(owner.supervisor) });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: {
    capture: (input): ReturnType<WindowsControlRuntime["capture"]> => runtime.capture(input),
    proveTerminated: (input): ReturnType<WindowsControlRuntime["proveTerminated"]> => runtime.proveTerminated(input),
    releaseCapture: (input): ReturnType<WindowsControlRuntime["releaseCapture"]> => runtime.releaseCapture(input),
  } });
  const facade = await engine.controlFingerprintPromise;
  // Fingerprint gateway projection is a synthetic fixture, never an issuer or
  // An override in the collector. Source programs themselves are read+hashed.
  context.mock.method(engine, "status", () => Promise.resolve({ stableFingerprint: identity }));
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor,
    targetUuid: IDS.target, activeUuid: IDS.peer, projectPath: source.path, operation: OPERATION, marker: startupBrowser.input.marker,
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: facade.sha256, expectedFingerprintSha256: sha256Json(identity) });
  context.after(async (): Promise<void> => { await retireSyntheticJournal(journal.operationId); });
  const bootstrap = new ClosedSymbolBootstrapLaunchStage(engine, runtime); await bootstrap.launch(journal);
  const originalLaunch = bootstrap.originalLaunch(journal.operationId); assert.ok(originalLaunch !== undefined);
  const launchClock = await runtime.clockObservationForLaunch(originalLaunch);
  const admission = new ClosedSymbolAdmissionStage(engine, runtime); state.scope = true;
  const admitted = await admission.admit(journal, "baseline-admission");
  // Baseline marker is a historical prerequisite here; no synthetic cache is
  // Claimed to survive. The current edit startup program is exercised below.
  for (const kind of ["intent", "result"] as const) { await appendClosedSymbolEvent(journal, { step: "baseline-marker-create", kind, generation: admitted.generation, requestSha256: "a".repeat(64), data: { syntheticOnly: true } }); }
  state.scope = false;
  const close = new ClosedSymbolCloseStage(engine, runtime), closed = await close.close({ journal, generation: admitted.generation, capture: admitted.capture, phase: "baseline-close", windowHandle: "12345" });
  const proof = await close.prove(closed);
  const copied = await new ClosedSymbolCopyStage(engine, sqlRuntime).copy(journal, "baseline-copy", admitted.generation, proof);
  const stage = new ClosedSymbolMainReferenceStage(engine);
  return { owner, engine, runtime, journal, state, source, copied, stage, baselineCapture: admitted.capture, identity, launchClock,
    input: { journal, baselineCopy: copied.copy, baselineInventory: copied.inventory, baselineProof: proof } };
}
