import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
/** Synthetic transport/UI only; all stages, managed storage and SQL children are real. */
/* oxlint-disable import/max-dependencies -- Exercise concrete maintained owners together instead of fake phase callbacks. */
import assert from "node:assert/strict";
import { createDecipheriv } from "node:crypto";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { gunzipSync } from "node:zlib";
import type { TestContext } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { UpstreamEasyedaClient } from "../../src/upstream.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import { WindowsNativeUiController } from "../../src/windows-native-ui.ts";
import { qualifiedNativeFixture } from "./windows-pending-fixture.ts";
import { startupFixture } from "./closed-symbol-startup-browser-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { HISTORY_TABLE, IDS, OPERATION, TIMES, applyEffect, encrypted, expectedRaw, fixture as sqlFixture } from "./symbol-sql-fixture.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "../../src/saved-symbol-projection.ts";
import { encodeExactReadEnvelope } from "../../src/exact-readers.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "../../src/closed-symbol-native-profile.ts";
import { FAMILY } from "../../src/closed-symbol-journal.ts";
import { assertExpectedFingerprint, isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../../src/core.ts";

function makeCompanionPcb(source: string): string {
  const database = new DatabaseSync(source);
  try {
    const record = database.prepare("SELECT dataStr FROM history_data WHERE uuid=?").get(IDS.oldHead);
    assert.equal(typeof record?.["dataStr"], "string");
    const bytes = Buffer.from(String(record?.["dataStr"]), "base64");
    const decipher = createDecipheriv("aes-128-gcm", Buffer.from(IDS.oldKey, "hex"), Buffer.from(IDS.oldHead, "hex"));
    decipher.setAuthTag(bytes.subarray(-16));
    const plaintext = Buffer.concat([decipher.update(bytes.subarray(0, -16)), decipher.final()]);
    // oxlint-disable-next-line node/no-sync -- Decode the tiny fixed synthetic history only; no project/profile input is accessed.
    const raw = gunzipSync(plaintext).toString("utf8");
    let peer = false;
    const converted = raw.split("|\n").map((line) => {
      const [headerText, bodyText] = line.split("||"); assert.ok(headerText !== undefined);
      const header: unknown = JSON.parse(headerText); assert.ok(isRecord(header));
      if (header["type"] === "DOCHEAD") {
        const body: unknown = JSON.parse(bodyText ?? "null"); assert.ok(isRecord(body)); peer = body["uuid"] === IDS.peer;
        if (peer) { body["docType"] = "PCB"; return `${headerText}||${JSON.stringify(body)}`; }
      }
      if (peer && header["type"] === "META") {
        const body: unknown = JSON.parse(bodyText ?? "null"); assert.ok(isRecord(body)); body["docType"] = 3;
        return `${headerText}||${JSON.stringify(body)}`;
      }
      return line;
    }).join("|\n");
    database.prepare("UPDATE history_data SET dataStr=? WHERE uuid=?").run(encrypted(converted, IDS.oldHead, IDS.oldKey), IDS.oldHead);
    return converted;
  } finally { database.close(); }
}

function adjustEffectTimes(source: string, time: number): void {
  const utc = new Date(time).toISOString().slice(0, 19).replace("T", " ");
  const local = new Date(time + 120 * 60_000).toISOString().slice(0, 19).replace("T", " ");
  const database = new DatabaseSync(source);
  try {
    database.prepare("UPDATE history_data SET created_at=?,updated_at=? WHERE uuid=?").run(utc, utc, IDS.newHead);
    database.prepare(`UPDATE "${HISTORY_TABLE}" SET created_at=?,updated_at=? WHERE uuid=?`).run(utc, utc, IDS.newHead);
    database.prepare("UPDATE projects SET updated_at=? WHERE uuid=?").run(local, IDS.project);
  } finally { database.close(); }
}

type Bundles = Awaited<ReturnType<UpstreamEasyedaClient["installedEasyedaBundles"]>>;
export type SyntheticReplyKind = "runtime" | "write" | "witness" | "saved-read" | "navigation" | "startup";
function fullFingerprint(): Record<string, unknown> & { installedBundles: Bundles } {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => {
    const projected = { path: `/synthetic/${file.relativePath}` }; return Object.assign(projected, file);
  }) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion,
      extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/synthetic/easyeda/resources/app/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/synthetic/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/synthetic/api.js", adapterPath: "/synthetic/adapter.js", declarationsPath: "/synthetic/api.d.ts" } } };
}

export async function fixture(context: TestContext, reviewedExecutionScopeSha256?: string): Promise<{
  stage: ClosedSymbolCoordinator; engine: EasyedaControlEngine; upstream: UpstreamEasyedaClient; runtime: WindowsControlRuntime;
  ui: WindowsNativeUiController; owner: Awaited<ReturnType<typeof qualifiedNativeFixture>>; browser: ReturnType<typeof startupFixture>;
  plan: Record<string, unknown>; source: string; events: string[]; identity: Record<string, unknown>;
  machine: Awaited<ReturnType<typeof syntheticSqlRuntime>>;
  state: { scope: boolean; launched: boolean; authReads: number; authAfter: number; sessionSequence: number;
    preexisting: boolean; startupFailure: boolean; scopeFailure: boolean; windows: unknown;
    clockMs: number; writes: number; opens: number; reads: number; chunks: string[];
    onAuth: (() => void) | undefined; onUi: (() => void | Promise<void>) | undefined; onStartup: (() => void | Promise<void>) | undefined;
    onReply: ((kind: SyntheticReplyKind, value: unknown) => unknown) | undefined };
}> {
  const oldTemp = process.env["TMPDIR"]; process.env["TMPDIR"] = syntheticSqlRoot();
  context.after((): void => { if (oldTemp === undefined) { delete process.env["TMPDIR"]; } else { process.env["TMPDIR"] = oldTemp; } });
  const sql = await sqlFixture();
  const source = sql.path;
  const rawBaseline = makeCompanionPcb(source);
  const browser = startupFixture(), events: string[] = [], owner = await qualifiedNativeFixture(context, reviewedExecutionScopeSha256);
  Object.assign(browser.input, { projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor });
  Object.assign(browser.actor, { uuid: IDS.actor, username: "synthetic-user" });
  browser.state.host["globalVariableCookieData"] = { userInfo: { ...browser.actor } };
  browser.state.host["messageBus"] = { rpcCall(route: unknown, args: unknown): Promise<unknown> {
    assert.equal(route, "/pro-mgr/hasProject"); assert.equal(JSON.stringify(args), JSON.stringify([IDS.project])); return Promise.resolve({ message: false });
  } };
  const state = { scope: false, launched: false, authReads: 0, authAfter: 1, sessionSequence: 0, preexisting: false,
    startupFailure: false, scopeFailure: false, windows: undefined as unknown,
    clockMs: 0, writes: 0, opens: 0, reads: 0, chunks: [rawBaseline],
    onAuth: undefined as (() => void) | undefined, onUi: undefined as (() => void | Promise<void>) | undefined,
    onStartup: undefined as (() => void | Promise<void>) | undefined,
    onReply: undefined as ((kind: SyntheticReplyKind, value: unknown) => unknown) | undefined };
  const client = new Client({ name: "synthetic-coordinator", version: "0" }), upstream = new UpstreamEasyedaClient();
  const binding: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43),
    sessionId: "s".repeat(43), sessionSequence: 1, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  context.mock.method(upstream, "connect", (): Promise<Client> => { events.push("connect"); return Promise.resolve(client); });
  context.mock.method(upstream, "currentAuthenticatedBridgeDispatchBinding", (): AuthenticatedBridgeDispatchBinding | undefined => state.scope ? binding : undefined);
  context.mock.method(upstream, "bridgeSessionLifecycle", (): Record<string, unknown> => {
    if (state.launched) { state.authReads += 1; state.onAuth?.(); }
    return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43), activeSession:
      state.preexisting || (state.launched && state.authReads >= state.authAfter) ? { sessionId: String(state.sessionSequence).repeat(43), sequence: state.sessionSequence,
        authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 } : null,
      publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] };
  });
  context.mock.method(upstream, "withAuthenticatedBridgeDispatchScope", async <Result,>(task: (lease: AuthenticatedBridgeDispatchBinding) => PromiseLike<Result> | Result): Promise<Result> => {
    assert.equal(state.scope, false); events.push("scope-enter"); state.scope = true;
    try { const value = await task(binding); if (state.scopeFailure) { throw new Error("synthetic scope settlement failed"); } return value; }
    finally { state.scope = false; events.push("scope-exit"); }
  });
  context.mock.method(upstream, "findTool", (): Promise<{ name: string }> => Promise.resolve({ name: "easyeda_execute" }));
  context.mock.method(upstream, "callTool", async (name: string, args?: Record<string, unknown>, _timeout?: number, lease?: AuthenticatedBridgeDispatchBinding): Promise<unknown> => {
    assert.equal(name, "easyeda_execute"); assert.equal(args?.["confirmWrite"], true); assert.equal(state.scope, true); assert.ok(lease !== undefined);
    const code = String(args?.["code"]);
    let kind: SyntheticReplyKind, result: unknown;
    if (code.includes("runtime-identity")) { kind = "runtime"; result = { ok: true, kind: "runtime-identity", generation: `synthetic-coordinator-runtime-000${state.sessionSequence}`, timeOrigin: 1000 * state.sessionSequence, processId: 101 }; }
    else if (code.includes("kind:'project-symbol-metadata'")) {
      kind = "write";
      assert.equal(args?.["confirmWrite"], true); state.writes += 1; events.push("write");
      const time = state.clockMs + 100;
      const raw = expectedRaw().replaceAll(String(TIMES.document), String(time)).replaceAll(String(TIMES.edit), String(time + 1));
      state.chunks.push(raw); applyEffect(source, raw); adjustEffectTimes(source, time);
      result = encodeExactReadEnvelope({ kind: "project-symbol-metadata", targetId: IDS.target, createdId: null });
    } else if (code.includes("symbol-predispatch-observation.v2")) {
      kind = "witness";
      events.push("witness"); const time = state.clockMs + 100;
      result = { profile: "easyeda-pro-control.symbol-predispatch-observation.v2", projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor,
        targetUuid: IDS.target, activeUuid: IDS.peer, createdAtLiteral: "2020-01-01 00:00:00", workerClient: "a".repeat(16), workerMaxTicket: 100,
        workerTimeBeforeMs: time, workerTimeAfterMs: time + 1, cachedActorUuid: IDS.actor, startupActor: { ...browser.actor }, cachedActor: { ...browser.actor },
        rendererParsedCreatedAtMs: Date.parse("2019-12-31T23:00:00Z"), rendererTimezoneOffsetMinutes: -120, rendererClockBeforeMs: time, rendererClockAfterMs: time + 1,
        scope: "point-in-time-read-only-observation", appActorVerified: false, appClockVerified: false, workerFreshOfflineClockVerified: false, producerBindingVerified: false, executionAuthorized: false };
    } else if (code.includes("saved-symbol-content-observation.v1")) {
      kind = "saved-read";
      state.reads += 1; events.push("saved-read");
      const projection = await prepareSavedSymbolProjection({ chunks: state.chunks, targetUuid: IDS.target, maximumTicket: 101, currentEditVersion: "3.0" });
      result = { profile: "private.saved-symbol-content-observation.v1", projectUuid: IDS.project, targetUuid: IDS.target, maximumTicket: 101,
        workerClient: "c".repeat(16), content: expectedSavedSymbolContent(projection, "c".repeat(16)), executionAuthorized: false, producerBindingVerified: false, completionProved: false };
    } else if (code.includes("recovery-navigation.v1")) {
      kind = "navigation";
      assert.equal(args?.["confirmWrite"], true); state.opens += 1; events.push("navigation");
      result = { schema: "easyeda-pro-control.recovery-navigation.v1", ok: true, openedProject: true, openedDocument: true,
        project: { uuid: IDS.project, path: source }, document: { uuid: IDS.peer, documentType: 3, tabId: `${IDS.peer}@${IDS.project}` } };
    }
    else {
      kind = "startup";
      events.push("startup"); await state.onStartup?.();
      if (state.startupFailure) { throw new Error("synthetic uncertain startup"); }
      const phase = ["baseline-marker-create", "edit-marker-read", "verify-marker-read"][state.sessionSequence - 1];
      assert.ok(phase !== undefined); Object.assign(browser.input, { phase });
      result = await browser.run();
    }
    if (state.onReply !== undefined) { result = await state.onReply(kind, result); }
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  });
  owner.state.onFrame = (wireAction): void => {
    const action = wireAction.replace(/^clocked-/u, "");
    events.push(action);
    if (action === "launch") {
      state.launched = true; state.authReads = 0; state.sessionSequence += 1;
      Object.assign(binding, { sessionId: String(state.sessionSequence).repeat(43), sessionSequence: state.sessionSequence });
    }
    if (action === "normal-close") { state.launched = false; }
    if (action === "normal-close" || action === "prove-terminated") { assert.equal(state.scope, false); }
  };
  owner.behavior.mutateResponse = (request, response): void => {
    const base = response["base"], clock = response["clock"];
    if (isRecord(clock) && isRecord(clock["after"])) {
      state.clockMs = Number((BigInt(String(clock["after"]["utcAfterTicks"])) - 621_355_968_000_000_000n) / 10_000n);
      if ((request["action"] === "clocked-prove-terminated" || request["action"] === "clocked-capture") && isRecord(base)) {
        const checkedMs = Number((BigInt(String(clock["after"]["utcBeforeTicks"])) - 621_355_968_000_000_000n) / 10_000n);
        base[request["action"] === "clocked-capture" ? "capturedAt" : "checkedAt"] = new Date(checkedMs).toISOString().replace(/Z$/u, "0000Z");
      }
    }
  };
  const options = { upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: owner.options.reviewedExecutionScopeSha256 };
  const runtime = new WindowsControlRuntime(options, {
    hashExecutable: (): Promise<string> => Promise.resolve(owner.options.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof owner.supervisor> => Promise.resolve(owner.supervisor),
  });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: {
    capture: (input): ReturnType<WindowsControlRuntime["capture"]> => runtime.capture(input),
    proveTerminated: (input): ReturnType<WindowsControlRuntime["proveTerminated"]> => runtime.proveTerminated(input),
    releaseCapture: (input): ReturnType<WindowsControlRuntime["releaseCapture"]> => runtime.releaseCapture(input),
  } });
  const ui = new WindowsNativeUiController({ ...options, pluginRoot: resolve(import.meta.dirname, "../../.."), runtime }, {
    verifyHelper: (): Promise<void> => Promise.resolve(),
    invoke: async ({ request }): Promise<unknown> => {
      assert.equal(request["action"], "windows"); assert.equal(state.scope, false); events.push("windows"); await state.onUi?.();
      return { schema: "easyeda-pro-control.windows-native-ui.v1", action: "windows",
        binding: { rootPid: request["rootPid"], rootStartTicks: request["rootStartTicks"], executable: request["executable"], executableSha256: request["executableSha256"] },
        result: { windows: state.windows ?? [{ handle: "12345", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false, title: "Synthetic", bounds: [0, 0, 1384, 736] }], mainWindowHandle: "12345" } };
    },
  });
  const identity = fullFingerprint(), machine = await syntheticSqlRuntime();
  await engine.controlFingerprintPromise;
  assertExpectedFingerprint(identity);
  // Fixed reviewed synthetic fingerprint matches the already mocked status.
  // Never relabel current dirty source bytes as reviewed or alter the manifest.
  const implementation = identity.facadeImplementation;
  Object.defineProperty(engine, "controlFingerprintPromise", { value: Promise.resolve(implementation), configurable: true });
  context.mock.method(engine, "status", (): Promise<{ stableFingerprint: typeof identity }> => Promise.resolve({ stableFingerprint: identity }));
  context.mock.method(engine, "assertContext", (): Promise<Record<string, unknown>> => Promise.resolve({ project: { uuid: IDS.project, path: source },
    document: { uuid: IDS.peer, documentType: 3, tabId: `${IDS.peer}@${IDS.project}` } }));
  context.mock.method(upstream, "installedEasyedaBundles", (): Promise<typeof identity.installedBundles> => Promise.resolve(identity.installedBundles));
  const plan: Record<string, unknown> = { profile: FAMILY, projectUuid: browser.input.projectUuid, branchUuid: browser.input.branchUuid,
    ownerUuid: browser.input.ownerUuid, targetUuid: IDS.target, activeUuid: IDS.peer, projectPath: source,
    operation: OPERATION, marker: browser.input.marker,
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: implementation.sha256, expectedFingerprintSha256: sha256Json(identity) };
  assert.ok(isRecord(plan));
  const stage = new ClosedSymbolCoordinator(engine, upstream, runtime, ui, machine, identity);
  context.after(async (): Promise<void> => {
    // Retire only this test's synthetic journal after all assertions. This is
    // Test isolation cleanup, not a coordinator recovery or completion path.
    const operationId = stage.retained()["operationId"];
    if (typeof operationId === "string") {
      await retireSyntheticJournal(operationId);
    }
  });
  return { stage, engine, upstream, runtime, ui, owner, browser, plan, source, events, identity, machine, state };
}
