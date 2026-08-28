import { basename, join, resolve } from "node:path";
import { after, before, beforeEach, describe, test } from "node:test";
import {
  buildPlanHash,
  loadReviewedCompatibilityManifest,
  normalizeProofEnvelope,
  reviewedCompatibilityManifestFingerprint,
  sha256Json,
  sha256Text,
} from "../src/core.ts";
import type {
  AuthenticatedBridgeDispatchBinding,
  EngineStatus,
  ExecutionAuthorityTerminationProof,
  InstalledEasyedaBundles,
  LauncherFingerprint,
  LauncherState,
  MutationPlan,
  MutationStateName,
  OperationJournal,
  OperationSummary,
  EasyedaControlEngine as SourceEngineClass,
  ToolCallSpec,
  ToolDescriptor,
  UpstreamClient,
} from "../src/engine.ts";
import { exactReadRequestSchema } from "../src/exact-readers.ts";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

type SourceEngineConstructor = typeof SourceEngineClass;
type EngineInstance = InstanceType<SourceEngineConstructor>;
type EngineConstructor = new (upstream: UpstreamClient) => EngineInstance;
type ExactReadRequest = ReturnType<typeof exactReadRequestSchema.parse>;
interface TypedArtifactsModule {
  controlRootCapability: () => Promise<{
    close: () => Promise<void>;
  }>;
  listOperations: () => Promise<OperationJournal[]>;
  loadOperation: (operationId: string) => Promise<OperationJournal>;
  updateOperation: (operation: OperationJournal) => Promise<string>;
}
type ComponentReadRequest = Extract<
  ExactReadRequest,
  { kind: "schematic-components" | "pcb-components" }
>;

interface MutableComponentRecord extends Record<string, unknown> {
  bounds?: unknown;
  pins?: unknown;
  pads?: unknown;
}

interface InventoryFamily {
  status: string;
  count: number;
  primitiveIds: string[];
  byPrimitiveId?: Record<string, unknown>;
}

function isComponentReadRequest(
  request: ExactReadRequest,
): request is ComponentReadRequest {
  return (
    request.kind === "schematic-components" || request.kind === "pcb-components"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Fixture ${label} must be an object.`);
  }
  return value;
}

function requireError(value: unknown): Error {
  if (!(value instanceof Error)) {
    throw new Error("Expected the fixture to reject with an Error.");
  }
  return value;
}

function parseJson(text: string): unknown {
  const value: unknown = JSON.parse(text);
  return value;
}

function isSourceEngineConstructor(
  value: unknown,
): value is SourceEngineConstructor {
  return typeof value === "function";
}

function requireEngineConstructor(value: unknown): SourceEngineConstructor {
  if (!isSourceEngineConstructor(value)) {
    throw new TypeError(
      "Fixture engine module does not export EasyedaControlEngine.",
    );
  }
  return value;
}

function isOperationJournal(value: unknown): value is OperationJournal {
  return (
    isRecord(value) &&
    typeof value["operationId"] === "string" &&
    typeof value["planHash"] === "string" &&
    isRecord(value["plan"]) &&
    typeof value["state"] === "string" &&
    typeof value["mutationState"] === "string" &&
    typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" &&
    isRecord(value["context"]) &&
    isRecord(value["preCheckpoint"]) &&
    Array.isArray(value["artifacts"])
  );
}

function requireOperationJournal(value: unknown): OperationJournal {
  if (!isOperationJournal(value)) {
    throw new Error("Fixture operation journal has an invalid shape.");
  }
  return value;
}

function requireDefined<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Fixture ${label} is missing.`);
  }
  return value;
}

let artifacts: TypedArtifactsModule;
let EasyedaControlEngine: EngineConstructor;
let RuntimeDisabledEasyedaControlEngine: EngineConstructor;
let source = "";
let outputDir = "";
let testDir = "";

async function onlyOperation(): Promise<OperationJournal> {
  const operations = await artifacts.listOperations();
  if (operations.length !== 1) {
    throw new Error(
      `Expected one fixture operation, received ${operations.length}.`,
    );
  }
  return requireDefined(operations[0], "operation");
}

function lastArtifact(
  operation: OperationJournal,
): OperationJournal["artifacts"][number] {
  return requireDefined(operation.artifacts.at(-1), "phase artifact");
}

function createFixtureDatabase(): void {
  execFileSync("sqlite3", [
    source,
    "PRAGMA journal_mode=DELETE; CREATE TABLE project_state(id INTEGER PRIMARY KEY, value TEXT NOT NULL); INSERT INTO project_state(value) VALUES ('fixture');",
  ]);
}

async function resetFixture(): Promise<void> {
  const controlDataDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
  if (controlDataDirectory === undefined || controlDataDirectory.length === 0) {
    throw new Error("Fixture control-data directory is not configured.");
  }
  await mkdir(controlDataDirectory, { recursive: true, mode: 0o700 });
  for (const name of await readdir(controlDataDirectory)) {
    await rm(join(controlDataDirectory, name), { recursive: true, force: true });
  }
  await rm(outputDir, { recursive: true, force: true });
  await rm(source, { force: true });
  createFixtureDatabase();
}

before(async () => {
  testDir = await mkdtemp(join(tmpdir(), "easyeda-control-engine-"));
  source = join(testDir, "mock-project.eprj2");
  outputDir = join(testDir, "backups");
  process.env["EASYEDA_CONTROL_DATA_DIR"] = join(testDir, "control-data");
  const engineModule: unknown = await import(
    `../src/engine.ts?engine-test=${encodeURIComponent(testDir)}`
  );
  const SourceEngine = requireEngineConstructor(
    requireRecord(engineModule, "engine module")["EasyedaControlEngine"],
  );
  RuntimeDisabledEasyedaControlEngine = SourceEngine;
  EasyedaControlEngine = class ManifestBoundFixtureEngine extends SourceEngine {
    public constructor(upstream: UpstreamClient) {
      super(upstream, {
        privateComponentWriterValidated: true,
        // This is a unit-fixture policy. Production deliberately supplies no
        // Validator until a connected EasyEDA database-delta profile exists.
        semanticPersistenceValidator: async (input) => {
          const optionsValue = isRecord(upstream)
            ? upstream["options"]
            : undefined;
          const mockOptions = isMockOptions(optionsValue)
            ? optionsValue
            : undefined;
          await mockOptions?.onSemanticPersistenceValidation?.();
          const observedDelta = {
            preCheckpointReceiptSha256: sha256Json(input.preCheckpoint),
            finalCheckpointReceiptSha256: sha256Json(input.finalCheckpoint),
            reopenedProofSnapshotSha256:
              input.reopenedProofSnapshotSha256,
          };
          return {
            ok: true,
            bindingSha256:
              mockOptions?.semanticPersistenceBindingOverride ??
              input.bindingSha256,
            policyId: "fixture.project-state-only.v1",
            policySha256: sha256Json({
              table: "project_state",
              operation: "single-row-update",
            }),
            observedDelta,
            observedDeltaSha256: sha256Json(observedDelta),
          };
        },
        executionAuthorityValidator: {
          capture: (input) => {
            const rendererPid = input.runtimeIdentity.processId;
            if (rendererPid === null) {
              throw new Error("Fixture renderer PID is unavailable.");
            }
            const processes = [
              {
                pid: rendererPid,
                role: "renderer",
                startIdentity: `fixture-renderer-${String(input.runtimeIdentity.timeOrigin)}`,
              },
              {
                pid:
                  9000 +
                  Math.trunc(input.runtimeIdentity.timeOrigin / 1000),
                role: "easyeda-main",
                startIdentity: `fixture-main-${String(input.runtimeIdentity.timeOrigin)}`,
              },
            ];
            const processTreeSha256 = sha256Json(processes);
            const capturedAt = "2026-08-28T00:00:00.000Z";
            const policyId = "fixture.easyeda-process-tree.v1";
            const policySha256 = sha256Json({
              scope: "fixture-complete-easyeda-authority",
            });
            const authoritySha256 = sha256Json({
              schema: "easyeda-pro-control.execution-authority.v1",
              bindingSha256: input.bindingSha256,
              policyId,
              policySha256,
              capturedAt,
              processes,
              processTreeSha256,
            });
            return Promise.resolve({
              schema: "easyeda-pro-control.execution-authority.v1" as const,
              bindingSha256: input.bindingSha256,
              policyId,
              policySha256,
              capturedAt,
              processes,
              processTreeSha256,
              authoritySha256,
            });
          },
          proveTerminated: (
            input,
          ): Promise<ExecutionAuthorityTerminationProof> => {
            const optionsValue = isRecord(upstream)
              ? upstream["options"]
              : undefined;
            const mockOptions = isMockOptions(optionsValue)
              ? optionsValue
              : undefined;
            return Promise.resolve({
              schema:
                "easyeda-pro-control.execution-authority-termination.v1" as const,
              ok: true as const,
              noPriorExecutionAuthorityRemains: true as const,
              bindingSha256: input.bindingSha256,
              terminatedAuthoritySha256:
                input.priorExecutionAuthority.authoritySha256,
              policyId:
                mockOptions?.executionTerminationPolicyIdOverride ??
                input.priorExecutionAuthority.policyId,
              policySha256: input.priorExecutionAuthority.policySha256,
              checkedAt: "2026-08-28T00:01:00.000Z",
            });
          },
        },
      });
    }

    public override async status(): Promise<EngineStatus> {
      const status = await super.status();
      const optionsValue = isRecord(this.upstream)
        ? this.upstream["options"]
        : undefined;
      const mockOptions = isMockOptions(optionsValue)
        ? optionsValue
        : undefined;
      const installedEasyedaBundles =
        this.upstream.installedEasyedaBundles?.bind(this.upstream);
      if (
        mockOptions === undefined ||
        installedEasyedaBundles === undefined ||
        mockOptions.implementationDrift === true
      ) {
        return status;
      }
      const manifest = loadReviewedCompatibilityManifest();
      const launcher = structuredClone(manifest.upstream.launcher);
      const serverVersion =
        mockOptions.serverVersion ?? manifest.upstream.serverVersion;
      const installedBundles = structuredClone(await installedEasyedaBundles());
      installedBundles.pcbEditor.version =
        mockOptions.pcbEditorVersion ??
        manifest.installedBundles.pcbEditor.version;
      installedBundles.pcbEditor.implementationSha256 =
        mockOptions.pcbImplementationSha256 ??
        manifest.installedBundles.pcbEditor.implementationSha256;
      installedBundles.publicApi.version =
        mockOptions.publicApiVersion ??
        manifest.installedBundles.publicApi.version;
      installedBundles.publicApi.implementationSha256 =
        mockOptions.publicApiImplementationSha256 ??
        manifest.installedBundles.publicApi.implementationSha256;
      installedBundles.publicApi.adapterSha256 =
        mockOptions.publicApiAdapterSha256 ??
        manifest.installedBundles.publicApi.adapterSha256;
      installedBundles.publicApi.declarationsSha256 =
        mockOptions.publicApiDeclarationsSha256 ??
        manifest.installedBundles.publicApi.declarationsSha256;
      const healthPayload = {
        version: manifest.connectedRuntime.healthVersion,
        node_version: manifest.connectedRuntime.nodeVersion,
        bridge_connected: true,
        easyeda_version: manifest.connectedRuntime.easyedaVersion,
        extension_version: manifest.connectedRuntime.extensionVersion,
        extension_version_mismatch: false,
        registry_mismatch: false,
      };
      const bridgePayload = {
        connected: true,
        bridge_version: manifest.connectedRuntime.bridgeVersion,
        easyeda_version: manifest.connectedRuntime.bridgeEasyedaVersion,
        diagnostics: {
          method_registry_hash: manifest.connectedRuntime.methodRegistryHash,
        },
      };
      const dispatcherPayload = {
        source: manifest.connectedRuntime.dispatcher.source,
        dispatcher_build_id: manifest.connectedRuntime.dispatcher.buildId,
        total: manifest.connectedRuntime.dispatcher.total,
      };
      status.upstreamServer = {
        name: "mock-easyeda-mcp",
        version: serverVersion,
      };
      status.upstreamLauncher = launcher;
      status.upstreamLauncherState = {
        startup: launcher,
        current: structuredClone(launcher),
        startupSha256: sha256Json(launcher),
        currentSha256: sha256Json(launcher),
        drift: false,
      };
      status.installedBundles = installedBundles;
      status.toolCount = manifest.upstream.toolCatalog.count;
      status.toolCatalogSha256 = manifest.upstream.toolCatalog.sha256;
      status.health = { available: true, payload: healthPayload };
      status.bridge = { available: true, payload: bridgePayload };
      status.dispatcher = { available: true, payload: dispatcherPayload };
      status.stableFingerprint = {
        facadeImplementation: structuredClone(status.facadeImplementation),
        reviewedCompatibilityManifest:
          reviewedCompatibilityManifestFingerprint(),
        upstreamServer: { version: serverVersion },
        upstreamLauncher: launcher,
        upstreamImplementationDrift: false,
        installedBundles,
        toolCount: manifest.upstream.toolCatalog.count,
        toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
        health: { payload: healthPayload },
        bridge: { payload: bridgePayload },
        bridgeDispatcher: { payload: dispatcherPayload },
      };
      return status;
    }
  };
  const artifactsModule = await import("../src/artifacts.ts");
  artifacts = {
    ...artifactsModule,
    async listOperations(): Promise<OperationJournal[]> {
      const operations = await artifactsModule.listOperations();
      return operations.map((operation) => requireOperationJournal(operation));
    },
    async loadOperation(operationId: string): Promise<OperationJournal> {
      return requireOperationJournal(
        await artifactsModule.loadOperation(operationId),
      );
    },
  };
});

beforeEach(resetFixture);

after(async () => {
  delete process.env["EASYEDA_CONTROL_DATA_DIR"];
  const controlRoot = await artifacts.controlRootCapability();
  await controlRoot.close();
  if (testDir.length > 0) {
    await rm(testDir, { recursive: true, force: true });
  }
});

function toolResult(payload: unknown): {
  structuredContent: { ok: true; result: unknown };
} {
  return { structuredContent: { ok: true, result: payload } };
}

const digest = (character: string): string => character.repeat(64);

interface MockSnapshot {
  state: string;
  collateralState: string;
}

interface MockCall {
  name: string;
  args: Record<string, unknown>;
  timeoutMs: number | undefined;
  dispatchLease: AuthenticatedBridgeDispatchBinding | undefined;
}

interface JournalCapture {
  journal?: OperationJournal;
}

function captureOperationOnReopen(
  operationId: string,
  capture: JournalCapture,
): () => Promise<void> {
  return async () => {
    capture.journal = await artifacts.loadOperation(operationId);
  };
}

interface MockOptions {
  applyCollateral?: boolean;
  applyError?: Error;
  applyMutatesBeforeError?: boolean;
  applyPersistence?: "logical" | "physical-only";
  baselineReopenErrorsRemaining?: number;
  baselineReopenState?: string;
  contextPath?: string;
  documentType?: number;
  doubleReadMismatch?: boolean;
  executionTerminationPolicyIdOverride?: string;
  implementationDrift?: boolean;
  lockOnlyTargetMutation?: boolean;
  onApply?: (mock: MockUpstream) => void | Promise<void>;
  onBaselineReopen?: (
    mock: MockUpstream,
    count: number,
  ) => void | Promise<void>;
  onReadState?: (mock: MockUpstream, count: number) => void | Promise<void>;
  onReopen?: (mock: MockUpstream, count: number) => void | Promise<void>;
  onRollback?: (mock: MockUpstream) => void | Promise<void>;
  onSave?: () => void | Promise<void>;
  onSemanticPersistenceValidation?: () => void | Promise<void>;
  semanticPersistenceBindingOverride?: string;
  pcbEditorVersion?: string;
  pcbImplementationSha256?: string;
  persistOnSave?: boolean;
  publicApiAdapterSha256?: string;
  publicApiDeclarationsSha256?: string;
  publicApiImplementationSha256?: string;
  publicApiVersion?: string;
  recoveryActivationErrorsRemaining?: number;
  recoveryActivationOpened?: boolean;
  recoveryActivationTabId?: string;
  reopenErrorsRemaining?: number;
  reopenState?: string;
  reopenedTabId?: string;
  reportedReopenTabId?: string;
  reportedSaveTabId?: string;
  runtimeIdentityInvalidAtCall?: number;
  saveError?: Error;
  savePersistence?: "physical-only";
  serverVersion?: string;
  targetPadDirectDeclaredMismatch?: boolean;
  targetPadDirectOrthogonalDrift?: boolean;
  targetPadPrimitiveLockChanges?: boolean;
  targetPadTransformChanges?: boolean;
}

function isMockOptions(value: unknown): value is MockOptions {
  return isRecord(value);
}

class MockUpstream implements UpstreamClient {
  public options: MockOptions;
  public state: string;
  public applyAttempts: number;
  public rollbackAttempts: number;
  public saveAttempts: number;
  public reopenAttempts: number;
  public baselineReopenAttempts: number;
  public recoveryActivationAttempts: number;
  public readStateCalls: number;
  public contextCalls: number;
  public activeTabId: string;
  public collateralState: string;
  public exactReadExecutions: Map<string, number>;
  public exactReadSnapshots: Map<string, MockSnapshot>;
  public lastApplyCode: string | undefined;
  public calls: MockCall[];
  public events: string[];
  public tools: ToolDescriptor[];
  public runtimeGeneration: number;
  public runtimeIdentityCalls: number;
  public runtimeTimeOrigin: number;
  public readonly bridgeGatewayInstanceId: string;
  public bridgeSessionSequence: number;
  public bridgeSessionId: string;
  public bridgeAuthenticatedAtEpochMs: number;
  public closedBridgeSessions: Map<string, Record<string, unknown>>;
  public activeBridgeDispatch: AuthenticatedBridgeDispatchBinding | null;
  public releaseDispatchOnSessionClose: boolean;
  public authenticatedScopeBinding: AuthenticatedBridgeDispatchBinding | null;
  public beginDispatchCalls: number;
  public endDispatchCalls: number;
  public abortDispatchCalls: number;

  public constructor(options: MockOptions = {}) {
    this.options = options;
    this.state = "baseline";
    this.applyAttempts = 0;
    this.rollbackAttempts = 0;
    this.saveAttempts = 0;
    this.reopenAttempts = 0;
    this.baselineReopenAttempts = 0;
    this.recoveryActivationAttempts = 0;
    this.readStateCalls = 0;
    this.contextCalls = 0;
    this.activeTabId = "tab-1";
    this.collateralState = "baseline";
    this.exactReadExecutions = new Map();
    this.exactReadSnapshots = new Map();
    this.lastApplyCode = undefined;
    this.calls = [];
    this.events = [];
    this.runtimeGeneration = 1;
    this.runtimeIdentityCalls = 0;
    this.runtimeTimeOrigin = 1000;
    this.bridgeGatewayInstanceId = Buffer.alloc(32, 21).toString("base64url");
    this.bridgeSessionSequence = 1;
    this.bridgeSessionId = Buffer.alloc(32, 22).toString("base64url");
    this.bridgeAuthenticatedAtEpochMs = 10_000;
    this.closedBridgeSessions = new Map();
    this.activeBridgeDispatch = null;
    this.releaseDispatchOnSessionClose = false;
    this.authenticatedScopeBinding = null;
    this.beginDispatchCalls = 0;
    this.endDispatchCalls = 0;
    this.abortDispatchCalls = 0;
    this.tools = [
      {
        name: "easyeda_execute",
        annotations: { destructiveHint: true },
        inputSchema: {
          type: "object",
          properties: { confirmWrite: { type: "boolean" } },
        },
      },
      {
        name: "easyeda_read_state",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_health_check",
        annotations: { readOnlyHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_bridge_status",
        annotations: { readOnlyHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_bridge_probe_methods",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_schematic_get_components",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_schematic_components",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_pcb_get_components",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_pcb_components",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_board_dimensions",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_component_probe",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_canvas_capture",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_export_gerbers",
        annotations: { destructiveHint: true },
        inputSchema: {
          type: "object",
          properties: { confirmWrite: { type: "boolean" } },
        },
      },
      {
        name: "easyeda_schematic_verify_write",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "easyeda_pcb_add_text",
        annotations: { destructiveHint: true },
        inputSchema: {
          type: "object",
          properties: { confirmWrite: { type: "boolean" } },
        },
      },
      {
        name: "easyeda_pcb_modify_component",
        annotations: { destructiveHint: true },
        inputSchema: {
          type: "object",
          properties: { confirmWrite: { type: "boolean" } },
        },
      },
      {
        name: "easyeda_pcb_workflow_write",
        annotations: { destructiveHint: true },
        inputSchema: {
          type: "object",
          properties: { confirmWrite: { type: "boolean" } },
        },
      },
      {
        name: "easyeda_schematic_regression_write",
        annotations: { destructiveHint: true },
        inputSchema: {
          type: "object",
          properties: { confirmWrite: { type: "boolean" } },
        },
      },
    ];
  }

  public listTools(): Promise<ToolDescriptor[]> {
    return Promise.resolve(this.tools);
  }

  public findTool(name: string): Promise<ToolDescriptor | undefined> {
    return Promise.resolve(this.tools.find((tool) => tool.name === name));
  }

  public serverInfo(): { name: string; version: string } {
    return {
      name: "mock-easyeda-mcp",
      version: this.options.serverVersion ?? "1.0.0-rc.1",
    };
  }

  public launcherFingerprint(): Promise<LauncherFingerprint> {
    return Promise.resolve({
      command: "/usr/bin/node",
      commandSha256: digest("1"),
      args: ["/opt/easyeda/dist/index.js"],
      cwd: "/opt/easyeda",
      entrypoint: "/opt/easyeda/dist/index.js",
      entrypointSha256: digest("2"),
      implementationTree: {
        root: "/opt/easyeda/dist",
        sha256: digest("3"),
        fileCount: 24,
      },
      executionClosure: {
        root: "/opt/easyeda",
        directoryCount: 30,
        fileCount: 240,
        symlinkCount: 0,
        totalBytes: 1_000_000,
        sha256: digest("4"),
      },
      dependencyLock: {
        type: "pnpm",
        path: "/opt/easyeda/pnpm-lock.yaml",
        sha256: digest("4"),
      },
    });
  }

  public async launcherState(): Promise<LauncherState> {
    const startup = await this.launcherFingerprint();
    const current = structuredClone(startup);
    if (this.options.implementationDrift === true) {
      current.entrypointSha256 = digest("9");
      current.implementationTree.sha256 = digest("8");
    }
    return {
      startup,
      current,
      startupSha256: digest("5"),
      currentSha256:
        this.options.implementationDrift === true ? digest("6") : digest("5"),
      drift: this.options.implementationDrift === true,
    };
  }

  public instructions(): string {
    return "Offline EasyEDA control fixture.";
  }

  public installedEasyedaBundles(): Promise<InstalledEasyedaBundles> {
    return Promise.resolve({
      available: true,
      assetsRoot: "/opt/easyeda/assets",
      pcbEditor: {
        version: this.options.pcbEditorVersion ?? "3.2.149.5378b690",
        implementationPath: "/opt/easyeda/assets/pro-pcb/pcb.js",
        implementationSha256:
          this.options.pcbImplementationSha256 ??
          "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54",
      },
      publicApi: {
        version: this.options.publicApiVersion ?? "0.2.53.aee2f57a",
        implementationPath: "/opt/easyeda/assets/pro-api/api.js",
        implementationSha256:
          this.options.publicApiImplementationSha256 ??
          "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc",
        adapterPath: "/opt/easyeda/assets/pro-api/adapter.js",
        adapterSha256:
          this.options.publicApiAdapterSha256 ??
          "4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb",
        declarationsPath: "/opt/easyeda/assets/pro-api/api-types.d.ts",
        declarationsSha256:
          this.options.publicApiDeclarationsSha256 ??
          "32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1",
      },
    });
  }

  public persistDatabase(): void {
    execFileSync("sqlite3", [
      source,
      `UPDATE project_state SET value='saved-${this.saveAttempts}' WHERE id=1;`,
    ]);
  }

  public restartRuntime(): void {
    const closedAtEpochMs = this.bridgeAuthenticatedAtEpochMs + 500;
    this.closedBridgeSessions.set(this.bridgeSessionId, {
      ...this.activeBridgeSession(),
      closeReason: "fixture-runtime-terminated",
      closedAtEpochMs,
    });
    if (this.releaseDispatchOnSessionClose) {
      this.activeBridgeDispatch = null;
      this.releaseDispatchOnSessionClose = false;
    }
    this.runtimeGeneration += 1;
    this.runtimeTimeOrigin += 1000;
    this.bridgeSessionSequence += 1;
    this.bridgeSessionId = Buffer.alloc(
      32,
      21 + this.bridgeSessionSequence,
    ).toString("base64url");
    this.bridgeAuthenticatedAtEpochMs = closedAtEpochMs + 500;
  }

  private activeBridgeSession(): Record<string, unknown> {
    return {
      authenticatedAtEpochMs: this.bridgeAuthenticatedAtEpochMs,
      authenticationReceiptSha256: sha256Text(
        `fixture-bridge-session-${this.bridgeSessionSequence}`,
      ),
      sequence: this.bridgeSessionSequence,
      sessionId: this.bridgeSessionId,
    };
  }

  public bridgeSessionLifecycle(): unknown {
    return {
      schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1",
      gatewayInstanceId: this.bridgeGatewayInstanceId,
      activeSession: this.activeBridgeSession(),
      publicEndpoint: { host: "127.0.0.1", port: 49_621 },
      recentClosedSessions: [...this.closedBridgeSessions.values()],
    };
  }

  public closedAuthenticatedBridgeSession(sessionId: string): unknown {
    return this.closedBridgeSessions.get(sessionId);
  }

  public beginAuthenticatedBridgeDispatch(
    expectedGatewayInstanceId: string,
    expectedSessionId: string,
  ): AuthenticatedBridgeDispatchBinding {
    this.beginDispatchCalls += 1;
    if (
      this.activeBridgeDispatch !== null ||
      expectedGatewayInstanceId !== this.bridgeGatewayInstanceId ||
      expectedSessionId !== this.bridgeSessionId
    ) {
      throw new Error("Fixture bridge dispatch lease cannot begin.");
    }
    const binding = {
      schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const,
      gatewayInstanceId: this.bridgeGatewayInstanceId,
      leaseId: Buffer.alloc(32, 30 + this.bridgeSessionSequence).toString(
        "base64url",
      ),
      sessionId: this.bridgeSessionId,
      sessionSequence: this.bridgeSessionSequence,
      begunAtEpochMs: this.bridgeAuthenticatedAtEpochMs + 1,
      bindingReceipt: Buffer.alloc(
        32,
        40 + this.bridgeSessionSequence,
      ).toString("base64url"),
    };
    this.activeBridgeDispatch = binding;
    return { ...binding };
  }

  public endAuthenticatedBridgeDispatch(
    binding: AuthenticatedBridgeDispatchBinding,
  ): void {
    this.endDispatchCalls += 1;
    if (
      this.activeBridgeDispatch === null ||
      sha256Json(binding) !== sha256Json(this.activeBridgeDispatch) ||
      binding.sessionId !== this.bridgeSessionId
    ) {
      throw new Error("Fixture bridge dispatch lease cannot complete.");
    }
    this.activeBridgeDispatch = null;
  }

  public abortAuthenticatedBridgeDispatch(
    binding: AuthenticatedBridgeDispatchBinding,
    outcome: "not-dispatched" | "ambiguous-after-dispatch",
  ): { released: boolean; retainedUntilSessionClose: boolean } {
    this.abortDispatchCalls += 1;
    if (
      this.activeBridgeDispatch === null ||
      sha256Json(binding) !== sha256Json(this.activeBridgeDispatch)
    ) {
      throw new Error("Fixture bridge dispatch lease cannot abort.");
    }
    if (outcome === "not-dispatched") {
      this.activeBridgeDispatch = null;
      return { released: true, retainedUntilSessionClose: false };
    }
    this.releaseDispatchOnSessionClose = true;
    return { released: false, retainedUntilSessionClose: true };
  }

  public currentAuthenticatedBridgeDispatchBinding():
    | AuthenticatedBridgeDispatchBinding
    | undefined {
    return this.authenticatedScopeBinding === null
      ? undefined
      : Object.freeze({ ...this.authenticatedScopeBinding });
  }

  public rewriteDatabaseWithoutLogicalChange(): void {
    execFileSync("sqlite3", [source, "VACUUM;"]);
  }

  public async callTool(
    name: string,
    args: Record<string, unknown> = {},
    timeoutMs?: number,
    dispatchLease?: AuthenticatedBridgeDispatchBinding,
  ): Promise<unknown> {
    const effectiveDispatchLease =
      dispatchLease ?? this.authenticatedScopeBinding ?? undefined;
    if (
      this.activeBridgeDispatch !== null &&
      (effectiveDispatchLease === undefined ||
        sha256Json(effectiveDispatchLease) !==
          sha256Json(this.activeBridgeDispatch))
    ) {
      throw new Error(
        "Fixture call omitted or changed the authenticated bridge dispatch lease.",
      );
    }
    this.calls.push({
      name,
      args,
      timeoutMs,
      dispatchLease: effectiveDispatchLease,
    });
    if (name === "easyeda_health_check") {
      return toolResult({
        version: "1.0.0-rc.1",
        node_version: "24.18.0",
        bridge_connected: true,
        easyeda_version: "3.2.149.88089769",
        extension_version: "1.0.0-rc.1",
        extension_version_mismatch: false,
        registry_mismatch: false,
      });
    }
    if (name === "easyeda_bridge_status") {
      return toolResult({
        connected: true,
        bridge_version: "1.0.0-rc.1",
        easyeda_version: "3.2.149.88089769",
        diagnostics: { method_registry_hash: "mock-registry-v1" },
      });
    }
    if (name === "easyeda_bridge_probe_methods") {
      return toolResult({
        source: "loader_status",
        dispatcher_build_id: "d18b6xd531xe6ca",
        total: 116,
      });
    }
    if (
      [
        "easyeda_read_state",
        "easyeda_schematic_components",
        "easyeda_pcb_components",
        "easyeda_board_dimensions",
        "easyeda_component_probe",
      ].includes(name)
    ) {
      this.readStateCalls += 1;
      await this.options.onReadState?.(this, this.readStateCalls);
      this.events.push(`read-state:${this.readStateCalls}:${this.state}`);
      return toolResult({ state: this.state, reference: "R1" });
    }
    if (name === "easyeda_schematic_verify_write") {
      return toolResult({ ok: true, state: this.state, verified: true });
    }
    if (name !== "easyeda_execute") {
      throw new Error(`Unexpected mock tool ${name}`);
    }

    const codeValue = args["code"];
    const code = typeof codeValue === "string" ? codeValue : "";
    if (code.includes('kind: "runtime-identity"')) {
      this.runtimeIdentityCalls += 1;
      if (
        this.runtimeIdentityCalls ===
        this.options.runtimeIdentityInvalidAtCall
      ) {
        return toolResult({
          ok: true,
          kind: "runtime-identity",
          generation: "invalid-runtime-identity-fixture",
        });
      }
      return toolResult({
        ok: true,
        kind: "runtime-identity",
        generation: `easyeda-renderer:${this.runtimeTimeOrigin}:fixture-${this.runtimeGeneration.toString().padStart(12, "0")}`,
        timeOrigin: this.runtimeTimeOrigin,
        processId: 4242 + this.runtimeGeneration,
      });
    }
    if (
      code.includes('kind: "exact-component-mutation"') &&
      code.includes('state: "after"')
    ) {
      this.applyAttempts += 1;
      this.lastApplyCode = code;
      await this.options.onApply?.(this);
      if (this.options.applyMutatesBeforeError === true) {
        this.state = "applied";
      }
      if (this.options.applyError !== undefined) {
        throw this.options.applyError;
      }
      this.state = "applied";
      if (this.options.applyCollateral === true) {
        this.collateralState = "changed";
      }
      if (this.options.applyPersistence === "logical") {
        this.persistDatabase();
      }
      if (this.options.applyPersistence === "physical-only") {
        this.rewriteDatabaseWithoutLogicalChange();
      }
      return toolResult({
        ok: true,
        kind: "exact-component-mutation",
        state: "after",
        documentType: 3,
        applied: [{ primitiveId: "R1", fields: ["x"] }],
      });
    }
    if (
      code.includes('kind: "exact-component-mutation"') &&
      code.includes('state: "before"')
    ) {
      this.rollbackAttempts += 1;
      await this.options.onRollback?.(this);
      this.state = "baseline";
      this.collateralState = "baseline";
      return toolResult({
        ok: true,
        kind: "exact-component-mutation",
        state: "before",
        documentType: 3,
        applied: [{ primitiveId: "R1", fields: ["x"] }],
      });
    }
    if (code.includes("document save did not return exactly true")) {
      this.saveAttempts += 1;
      this.events.push(`save-reopen:${this.saveAttempts}`);
      if (this.options.savePersistence === "physical-only") {
        this.rewriteDatabaseWithoutLogicalChange();
      } else if (this.options.persistOnSave !== false) {
        this.persistDatabase();
      }
      await this.options.onSave?.();
      if (this.options.saveError !== undefined) {
        throw this.options.saveError;
      }
      this.activeTabId = "new-tab";
      return toolResult({
        ok: true,
        saved: true,
        closed: true,
        reopened: true,
        document: {
          uuid: "document-1",
          documentType: this.options.documentType ?? 3,
          tabId: this.options.reportedSaveTabId ?? this.activeTabId,
        },
      });
    }
    if (code.includes('kind: "activate-recovery-target"')) {
      this.recoveryActivationAttempts += 1;
      const remainingActivationErrors =
        this.options.recoveryActivationErrorsRemaining ?? 0;
      if (remainingActivationErrors > 0) {
        this.options.recoveryActivationErrorsRemaining =
          remainingActivationErrors - 1;
        throw applyTimeout();
      }
      this.activeTabId =
        this.options.recoveryActivationTabId ?? this.activeTabId;
      return toolResult({
        ok: true,
        kind: "activate-recovery-target",
        openedOrActivated: this.options.recoveryActivationOpened === true,
        document: {
          uuid: "document-1",
          documentType: this.options.documentType ?? 3,
          tabId: this.activeTabId,
        },
      });
    }
    if (code.includes("reopen-only recovery")) {
      const baselineReopen = this.applyAttempts === 0;
      if (baselineReopen) {
        this.baselineReopenAttempts += 1;
      } else {
        this.reopenAttempts += 1;
      }
      const attempt = baselineReopen
        ? this.baselineReopenAttempts
        : this.reopenAttempts;
      this.events.push(
        `${baselineReopen ? "baseline-reopen" : "reopen-only"}:${attempt}`,
      );
      await (
        baselineReopen ? this.options.onBaselineReopen : this.options.onReopen
      )?.(this, attempt);
      const errorCounter = baselineReopen
        ? "baselineReopenErrorsRemaining"
        : "reopenErrorsRemaining";
      const remainingReopenErrors = this.options[errorCounter] ?? 0;
      if (remainingReopenErrors > 0) {
        this.options[errorCounter] = remainingReopenErrors - 1;
        throw applyTimeout();
      }
      this.state = baselineReopen
        ? (this.options.baselineReopenState ?? "baseline")
        : (this.options.reopenState ?? "applied");
      this.activeTabId = this.options.reopenedTabId ?? "reopened-tab";
      return toolResult({
        ok: true,
        saved: false,
        closed: true,
        reopened: true,
        document: {
          uuid: "document-1",
          documentType: this.options.documentType ?? 3,
          tabId: this.options.reportedReopenTabId ?? this.activeTabId,
        },
      });
    }

    const requestMatch = /const REQUEST = (\{[^\n]+\});/u.exec(code);
    const requestSource = requestMatch?.[1];
    if (requestSource !== undefined) {
      const request: ExactReadRequest = exactReadRequestSchema.parse(
        parseJson(requestSource),
      );
      const execution = (this.exactReadExecutions.get(request.kind) ?? 0) + 1;
      this.exactReadExecutions.set(request.kind, execution);
      const firstObservation = execution % 2 === 1;
      const componentRequest = isComponentReadRequest(request);
      if (componentRequest && firstObservation) {
        this.readStateCalls += 1;
        await this.options.onReadState?.(this, this.readStateCalls);
        this.events.push(`read-state:${this.readStateCalls}:${this.state}`);
        this.exactReadSnapshots.set(request.kind, {
          state: this.state,
          collateralState: this.collateralState,
        });
      }
      const snapshot = structuredClone(
        this.exactReadSnapshots.get(request.kind) ?? {
          state: this.state,
          collateralState: this.collateralState,
        },
      );
      if (
        componentRequest &&
        !firstObservation &&
        this.options.doubleReadMismatch === true
      ) {
        snapshot.state = `${snapshot.state}-unstable`;
      }
      if (!firstObservation) {
        this.exactReadSnapshots.delete(request.kind);
      }
      const documentType = request.kind === "schematic-components" ? 1 : 3;
      if (componentRequest) {
        const targetValue = snapshot.state;
        const includeTargetPad =
          documentType === 3 &&
          (this.options.targetPadPrimitiveLockChanges === true ||
            this.options.targetPadTransformChanges === true ||
            this.options.targetPadDirectOrthogonalDrift === true ||
            this.options.targetPadDirectDeclaredMismatch === true);
        const targetPadX =
          this.options.targetPadTransformChanges === true &&
          targetValue === "applied"
            ? 201
            : 101;
        const targetPads = includeTargetPad
          ? [
              {
                primitiveId: "R1-pad-1",
                primitiveType: "ComponentPad",
                parentComponentPrimitiveId: "R1",
                layer: 1,
                padNumber: "1",
                x: targetPadX,
                y: 100,
                rotation: 0,
                net: "GND",
                source: "component-pin-wrapper-transformed-placement-only",
              },
            ]
          : [];
        let targetX = 100;
        if (
          documentType === 3 &&
          this.options.lockOnlyTargetMutation !== true
        ) {
          if (targetValue === "applied") {
            targetX = 200;
          } else if (targetValue !== "baseline") {
            targetX = 999;
          }
        }
        const allByPrimitiveId: Record<string, MutableComponentRecord> = {
          R1: {
            primitiveId: "R1",
            primitiveType: "Component",
            component: null,
            footprint: null,
            model3D: null,
            designator: "R1",
            x: targetX,
            y: 100,
            rotation: 0,
            layer: 1,
            primitiveLock:
              this.options.lockOnlyTargetMutation === true &&
              targetValue === "applied",
            addIntoBom: true,
            name: "Fixture R1",
            uniqueId: "gge-r1",
            manufacturer:
              documentType === 1 ? targetValue : "fixture-manufacturer",
            manufacturerId: "fixture-id",
            supplier: "fixture-supplier",
            supplierId: "fixture-supplier-id",
            otherProperty: {},
            bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
            [documentType === 1 ? "pins" : "pads"]: targetPads,
          },
          R2: {
            primitiveId: "R2",
            primitiveType: "Component",
            component: null,
            footprint: null,
            model3D: null,
            designator: "R2",
            x: snapshot.collateralState === "baseline" ? 20 : 30,
            y: 100,
            rotation: 0,
            layer: 1,
            primitiveLock: false,
            addIntoBom: true,
            name: "Fixture R2",
            uniqueId: "gge-r2",
            manufacturer: "unchanged",
            manufacturerId: "fixture-id-r2",
            supplier: "fixture-supplier",
            supplierId: "fixture-supplier-id-r2",
            otherProperty: {},
            bounds: { minX: 20, minY: 0, maxX: 30, maxY: 10 },
            [documentType === 1 ? "pins" : "pads"]: [],
          },
        };
        const selectedIds =
          request.selector?.primitiveIds ?? Object.keys(allByPrimitiveId);
        const byPrimitiveId = Object.fromEntries(
          selectedIds.map((primitiveId) => {
            const sourceRecord = allByPrimitiveId[primitiveId];
            if (sourceRecord === undefined) {
              throw new Error(`Unknown fixture component ${primitiveId}.`);
            }
            const record = structuredClone(sourceRecord);
            if (!request.includeBounds) {
              delete record.bounds;
            }
            if (!request.includePins) {
              delete record.pins;
              delete record.pads;
            }
            return [primitiveId, record];
          }),
        );
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType,
          detail: { pins: request.includePins, bounds: request.includeBounds },
          units:
            documentType === 1
              ? { coordinates: "0.01inch", bounds: "0.01inch" }
              : {
                  coordinates: "mil",
                  bounds: "mil",
                  transformedPadCoordinates: "mil",
                },
          limitations:
            documentType === 1
              ? {
                  componentPinOtherProperty:
                    "Omitted because the pinned Component3 mapper does not populate it.",
                  componentOtherPropertyFiltering:
                    "The adapter filters internal component metadata.",
                  cbbLibraryOwnership:
                    "CBB records are adapter-owned library identifiers.",
                }
              : {
                  componentPadWrapper:
                    "Placed transformed pad identity and coordinates only.",
                },
          primitiveIds: Object.keys(byPrimitiveId),
          byPrimitiveId,
        });
      }
      if (request.kind === "schematic-topology") {
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType: 1,
          authority: {
            connectivity: "sch_Netlist.getNetlist(JLCEDA)",
            wireGeometry: "unavailable",
          },
          componentCorrelation: {
            status: "exact-match",
            source: "sch_PrimitiveComponent.getAll(part,true)",
            componentCount: 0,
            pinCount: 0,
            primitiveIds: [],
            uniqueIds: [],
            byUniqueId: {},
          },
          limitations: [
            "The pinned sch_Net net-tree/name adapters are hard stubs and are not read.",
            "The pinned sch_PrimitiveWire enumerators swallow RPC failures, so wire geometry is not claimed complete.",
          ],
          compiledConnectivity: [],
        });
      }
      if (request.kind === "pcb-inventory") {
        const familyNames = [
          "arcs",
          "attributes",
          "components",
          "dimensions",
          "fills",
          "images",
          "lines",
          "objects",
          "pads",
          "polylines",
          "pours",
          "regions",
          "strings",
          "vias",
        ];
        const families: Record<string, InventoryFamily> = Object.fromEntries(
          familyNames.map((family) => [
            family,
            {
              status: "adapter-enumerated",
              count: family === "components" ? 2 : 0,
              primitiveIds: family === "components" ? ["R1", "R2"] : [],
              ...([
                "arcs",
                "fills",
                "lines",
                "pads",
                "polylines",
                "pours",
                "regions",
                "vias",
              ].includes(family)
                ? { byPrimitiveId: {} }
                : {}),
            },
          ]),
        );
        const includeTargetPad =
          this.options.targetPadPrimitiveLockChanges === true ||
          this.options.targetPadTransformChanges === true ||
          this.options.targetPadDirectOrthogonalDrift === true ||
          this.options.targetPadDirectDeclaredMismatch === true;
        if (includeTargetPad) {
          const targetValue =
            snapshot.state === "baseline" ? "baseline" : snapshot.state;
          const transformedX =
            this.options.targetPadTransformChanges === true &&
            targetValue === "applied"
              ? 201
              : 101;
          const pad = {
            primitiveId: "R1-pad-1",
            primitiveType: "ComponentPad",
            layer: 1,
            padNumber: "1",
            x:
              this.options.targetPadDirectDeclaredMismatch === true &&
              targetValue === "applied"
                ? 202
                : transformedX,
            y:
              this.options.targetPadDirectOrthogonalDrift === true &&
              targetValue === "applied"
                ? 101
                : 100,
            rotation: 0,
            pad: ["ELLIPSE", 20, 20],
            specialPad: [[1, 1, ["RECT", 18, 12, 0]]],
            net: "GND",
            hole: ["ROUND", 10],
            holeOffsetX: 0,
            holeOffsetY: 0,
            holeRotation: 0,
            metallization: true,
            padType: 1,
            solderMaskAndPasteMaskExpansion: {
              topSolderMask: 0,
              bottomSolderMask: 0,
              topPasteMask: 0,
              bottomPasteMask: 0,
            },
            heatWelding: { connectionMethod: "Direct-connected" },
            primitiveLock:
              this.options.targetPadPrimitiveLockChanges === true &&
              targetValue === "applied",
            source: "pcb_PrimitivePad-direct-state",
            parentComponentPrimitiveId: "R1",
            componentCorrelationSource: "component-getState_Pads",
          };
          const pads = families["pads"];
          if (pads === undefined) {
            throw new Error("Fixture pad family is missing.");
          }
          pads.count = 1;
          pads.primitiveIds = ["R1-pad-1"];
          pads.byPrimitiveId = { "R1-pad-1": pad };
        }
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType: 3,
          units: {
            coordinatesAndLengths: "mil",
            angles: "degree",
            layers: "numeric EPCB_LayerId",
          },
          limitations: {
            directPads: "Direct adapter pad state is authoritative.",
            componentPadCorrelation:
              "Component summaries are an exact subset correlation.",
            pouredCorrelation: "Poured state is derived from parent pours.",
            regionRuleTypes:
              "Omitted because the pinned adapter drops no-via state.",
            fillModes:
              "Omitted because the pinned adapter hardcodes fill mode.",
            arcPrecision: "Arc geometry is adapter-rounded to one decimal.",
            viaPrecision: "Via radii are adapter-rounded to one decimal.",
            unmonitoredFamilies:
              "Identity and counts only for unmonitored visual families.",
          },
          families,
          componentPadCorrelation: {
            status: "exact-subset",
            count: includeTargetPad ? 1 : 0,
            primitiveIds: includeTargetPad ? ["R1-pad-1"] : [],
            byPrimitiveId: includeTargetPad
              ? {
                  "R1-pad-1": {
                    primitiveId: "R1-pad-1",
                    parentComponentPrimitiveId: "R1",
                    padNumber: "1",
                    net: "GND",
                    source: "component-getState_Pads",
                  },
                }
              : {},
            byComponentPrimitiveId: {
              R1: includeTargetPad ? ["R1-pad-1"] : [],
              R2: [],
            },
          },
          pouredCorrelation: {
            status: "derived-subset",
            count: 0,
            pourPrimitiveIds: [],
            byPourPrimitiveId: {},
          },
          physicalPadCount: includeTargetPad ? 1 : 0,
          standalonePadCount: 0,
          pouredFillPieceCount: 0,
          enumeratedPrimitiveCount: includeTargetPad ? 3 : 2,
        });
      }
      if (request.kind === "pcb-rules") {
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType: 3,
          nets: ["GND"],
          rules: {
            configurationName: "fixture",
            configuration: {
              name: "fixture",
              config: { id: "fixture-config" },
            },
            netRules: [{ type: "net", name: "GND", rule: "default" }],
            netByNetRules: {},
            regionRules: [],
            netClasses: [],
            differentialPairs: [],
            equalLengthGroups: [],
            padPairGroups: [],
          },
        });
      }
    }

    this.contextCalls += 1;
    const documentType = this.options.documentType ?? 3;
    return toolResult({
      ok: true,
      project: {
        uuid: "project-1",
        name: "Mock project",
        path: this.options.contextPath ?? source,
      },
      document: {
        uuid: "document-1",
        documentType,
        title: documentType === 1 ? "Mock schematic" : "Mock PCB",
        tabId: this.activeTabId,
      },
      pcb:
        documentType === 3
          ? { uuid: "document-1", title: "Mock PCB", tabId: this.activeTabId }
          : {},
      schematic:
        documentType === 1
          ? {
              uuid: "document-1",
              title: "Mock schematic",
              tabId: this.activeTabId,
            }
          : {},
    });
  }
}

function beginMockAuthenticatedScope(
  upstream: MockUpstream,
): AuthenticatedBridgeDispatchBinding {
  const binding = upstream.beginAuthenticatedBridgeDispatch(
    upstream.bridgeGatewayInstanceId,
    upstream.bridgeSessionId,
  );
  upstream.authenticatedScopeBinding = binding;
  return binding;
}

function endMockAuthenticatedScope(
  upstream: MockUpstream,
  binding: AuthenticatedBridgeDispatchBinding,
): void {
  upstream.authenticatedScopeBinding = null;
  upstream.endAuthenticatedBridgeDispatch(binding);
}

function abortMockAuthenticatedScope(
  upstream: MockUpstream,
  binding: AuthenticatedBridgeDispatchBinding,
): void {
  upstream.authenticatedScopeBinding = null;
  upstream.abortAuthenticatedBridgeDispatch(
    binding,
    "ambiguous-after-dispatch",
  );
}

function rawSpec(marker: string): ToolCallSpec & {
  mode: "mutate-unsaved";
  acknowledgeUnrestrictedRaw: true;
} {
  const code = `// ${marker}\nreturn { ok: true };`;
  return {
    toolName: "easyeda_execute",
    arguments: { code, timeoutMs: 15_000, confirmWrite: true },
    sourceSha256: sha256Text(code),
    mode: "mutate-unsaved",
    acknowledgeUnrestrictedRaw: true,
  };
}

function exactComponentMutationSpec(state: MutationStateName): ToolCallSpec {
  return {
    toolName: "easyeda_control_exact_component_mutation",
    arguments: { state },
  };
}

function stateReadSpec(
  documentType: number,
  expectedState?: string,
  options: { summary?: boolean } = {},
): ToolCallSpec {
  const summary = options.summary === true;
  let assertion: NonNullable<ToolCallSpec["assertions"]>[number];
  if (expectedState === undefined) {
    assertion = {
      pointer: "/byPrimitiveId/R1/primitiveId",
      op: "equals",
      value: "R1",
    };
  } else if (documentType === 1) {
    assertion = {
      pointer: "/byPrimitiveId/R1/manufacturer",
      op: "equals",
      value: expectedState,
    };
  } else {
    let expectedX = 999;
    if (expectedState === "baseline") {
      expectedX = 100;
    } else if (expectedState === "applied") {
      expectedX = 200;
    }
    assertion = {
      pointer: "/byPrimitiveId/R1/x",
      op: "equals",
      value: expectedX,
    };
  }
  return {
    toolName: "easyeda_control_exact_read",
    arguments: {
      kind: documentType === 1 ? "schematic-components" : "pcb-components",
      selector: summary ? { all: true } : { primitiveIds: ["R1"] },
      includePins: !summary,
      includeBounds: !summary,
    },
    assertions: [assertion],
  };
}

function phaseReadSpecs(
  documentType: number,
  expectedState?: string,
): ToolCallSpec[] {
  const calls: ToolCallSpec[] = [
    stateReadSpec(documentType, expectedState, { summary: true }),
    stateReadSpec(documentType, expectedState),
  ];
  if (documentType === 3) {
    calls.push(
      {
        toolName: "easyeda_control_exact_read",
        arguments: { kind: "pcb-inventory" },
      },
      {
        toolName: "easyeda_control_exact_read",
        arguments: { kind: "pcb-rules" },
      },
    );
  } else {
    calls.push({
      toolName: "easyeda_control_exact_read",
      arguments: { kind: "schematic-topology" },
    });
  }
  return calls;
}

async function makePlan(
  engine: EngineInstance,
  label: string,
  overrides: Partial<MutationPlan> = {},
): Promise<MutationPlan> {
  const status = await engine.status();
  const expectedFingerprint = status.stableFingerprint;
  const documentType = overrides.expectedContext?.document?.documentType ?? 3;
  return {
    name: `Offline ${label} mutation`,
    intent: `Exercise the ${label} state-machine path without a live EasyEDA document.`,
    capabilityLevel: "private-version-pinned",
    expectedFingerprint,
    targetPrimitiveIds: ["R1"],
    targetChanges:
      documentType === 1
        ? [
            {
              primitiveId: "R1",
              pointer: "/manufacturer",
              before: "baseline",
              after: "applied",
            },
          ]
        : [{ primitiveId: "R1", pointer: "/x", before: 100, after: 200 }],
    expectedContext: {
      project: { uuid: "project-1", path: source },
      document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
    },
    preflightCalls: phaseReadSpecs(documentType),
    applyCall: exactComponentMutationSpec("after"),
    verifyCalls: phaseReadSpecs(documentType, "applied"),
    verifyAssertions: [
      {
        pointer:
          documentType === 1
            ? "/1/byPrimitiveId/R1/manufacturer"
            : "/1/byPrimitiveId/R1/x",
        op: "equals",
        value: documentType === 1 ? "applied" : 200,
      },
    ],
    rollbackCalls: [exactComponentMutationSpec("before")],
    reopenedVerifyCalls: phaseReadSpecs(documentType, "applied"),
    reopenedAssertions: [
      {
        pointer:
          documentType === 1
            ? "/1/byPrimitiveId/R1/manufacturer"
            : "/1/byPrimitiveId/R1/x",
        op: "equals",
        value: documentType === 1 ? "applied" : 200,
      },
    ],
    checkpoint: { source, outputDir, label },
    ...overrides,
  };
}

function planWithDiscard(
  engine: EngineInstance,
  plan: MutationPlan,
): Promise<OperationSummary> {
  return engine.plan(plan, { confirmDiscardAnyUnsavedState: true });
}

async function reachDelayedFinalFailure(
  engine: EngineInstance,
  upstream: MockUpstream,
  label: string,
): Promise<{ planned: OperationSummary; failed: OperationJournal }> {
  const planned = await planWithDiscard(engine, await makePlan(engine, label));
  await engine.apply(planned.operationId, planned.planHash);
  await engine.verify(planned.operationId);
  const failAtRead = upstream.readStateCalls + 5;
  upstream.options.onReadState = (mock: MockUpstream, count: number): void => {
    if (count === failAtRead) {
      mock.state = "unsaved-active-editor-change";
    }
  };
  await assert.rejects(
    engine.saveReopen(planned.operationId, planned.planHash),
    /assertion/iu,
  );
  delete upstream.options.onReadState;
  const failed = await artifacts.loadOperation(planned.operationId);
  assert.equal(failed.state, "final-checkpoint-failed");
  assert.equal(failed.saved, true);
  assert.equal(failed.reopened, true);
  assert.equal(upstream.state, "unsaved-active-editor-change");
  return { planned, failed };
}

async function reachSavedVerificationFailure(
  engine: EngineInstance,
  upstream: MockUpstream,
  label: string,
): Promise<{ planned: OperationSummary; failed: OperationJournal }> {
  const planned = await planWithDiscard(engine, await makePlan(engine, label));
  await engine.apply(planned.operationId, planned.planHash);
  await engine.verify(planned.operationId);
  const failAtRead = upstream.readStateCalls + 3;
  upstream.options.onReadState = (mock: MockUpstream, count: number): void => {
    if (count === failAtRead) {
      mock.state = "baseline";
    }
  };
  await assert.rejects(
    engine.saveReopen(planned.operationId, planned.planHash),
    /assertion/iu,
  );
  delete upstream.options.onReadState;
  const failed = await artifacts.loadOperation(planned.operationId);
  assert.equal(failed.state, "reopen-verification-failed");
  assert.equal(failed.saved, true);
  assert.equal(failed.reopened, true);
  upstream.state = "applied";
  return { planned, failed };
}

function applyTimeout(): Error {
  const error = new Error("MCP request timed out after 25000 ms");
  error.name = "McpError";
  return error;
}

async function restartConfirmation(
  operationId: string,
  upstream: MockUpstream,
): Promise<string> {
  const operation = await artifacts.loadOperation(operationId);
  const challenge = operation.runtimeRestartChallenge;
  if (typeof challenge !== "string") {
    throw new TypeError(
      `Operation ${operationId} has no runtime restart challenge.`,
    );
  }
  assert.match(
    challenge,
    new RegExp(`^EASYEDA_RESTARTED_AND_RECONNECTED:${operationId}:`, "u"),
  );
  upstream.restartRuntime();
  return challenge;
}

function windowsPath(path: string): string | undefined {
  const match = /^\/mnt\/([a-z])\/(.*)$/iu.exec(path);
  if (!match) {
    return undefined;
  }
  const drive = match[1];
  const suffix = match[2];
  if (drive === undefined || suffix === undefined) {
    return undefined;
  }
  return `${drive.toUpperCase()}:\\${suffix.replaceAll("/", "\\")}`;
}

void describe("durable mutation state machine", { concurrency: false }, () => {
  void test("status separates the running startup fingerprint from on-disk drift", async () => {
    const upstream = new MockUpstream({ implementationDrift: true });
    const engine = new EasyedaControlEngine(upstream);
    const status = await engine.status();

    assert.equal(status.upstreamLauncherState.drift, true);
    assert.equal(status.upstreamLauncherState.startupSha256, digest("5"));
    assert.equal(status.upstreamLauncherState.currentSha256, digest("6"));
    assert.notEqual(
      status.upstreamLauncherState.startup.entrypointSha256,
      status.upstreamLauncherState.current.entrypointSha256,
    );
    assert.deepEqual(
      status.upstreamLauncher,
      status.upstreamLauncherState.startup,
    );
    assert.equal(status.stableFingerprint.upstreamImplementationDrift, true);
    assert.deepEqual(
      status.stableFingerprint.facadeImplementation,
      status.facadeImplementation,
    );
    assert.match(status.facadeImplementation.sha256, /^[a-f0-9]{64}$/u);
    assert.ok(status.facadeImplementation.files.length > 0);
    const dispatcherPayload = requireDefined(
      status.dispatcher.payload,
      "dispatcher payload",
    );
    assert.equal(dispatcherPayload["source"], "loader_status");
    assert.equal(dispatcherPayload["dispatcher_build_id"], "d18b6xd531xe6ca");
    assert.equal(status.installedBundles.available, true);
    assert.equal(status.capabilities.privateComponentWriter.enabled, true);
    assert.equal(
      status.stableFingerprint.toolCatalogSha256,
      sha256Json(
        upstream.tools.map((tool) => ({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          annotations: tool.annotations,
          inputSchema: tool.inputSchema,
          outputSchema: tool.outputSchema,
        })),
      ),
    );

    requireDefined(upstream.tools[0], "first upstream tool").outputSchema = {
      type: "object",
      properties: { result: { type: "string" } },
    };
    const changed = await engine.status();
    assert.notEqual(
      changed.stableFingerprint.toolCatalogSha256,
      status.stableFingerprint.toolCatalogSha256,
    );
  });

  void test("runtime-disables the private component writer until connected validation is recorded", async () => {
    const upstream = new MockUpstream();
    const engine = new RuntimeDisabledEasyedaControlEngine(upstream);
    const status = await engine.status();

    assert.equal(status.capabilities.privateComponentWriter.enabled, false);
    assert.match(
      status.capabilities.privateComponentWriter.reason,
      /sacrificial-board (?:test|validation)/u,
    );
    await assert.rejects(
      engine.plan({}),
      /private PCB component writer is runtime-disabled/u,
    );
    assert.deepEqual(await artifacts.listOperations(), []);
    assert.equal(upstream.contextCalls, 0);
    assert.equal(upstream.applyAttempts, 0);

    const fixtureEngine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      fixtureEngine,
      await makePlan(fixtureEngine, "runtime-disabled-phase-bypass"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /private PCB component writer is runtime-disabled/u,
    );
    let journal = await artifacts.loadOperation(planned.operationId);
    journal.state = "applied-unsaved";
    journal.mutationState = "applied-unsaved";
    await artifacts.updateOperation(journal);
    await assert.rejects(
      engine.verify(planned.operationId),
      /private PCB component writer is runtime-disabled/u,
    );
    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /private PCB component writer is runtime-disabled/u,
    );
    journal = await artifacts.loadOperation(planned.operationId);
    journal.state = "live-verified";
    await artifacts.updateOperation(journal);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /private PCB component writer is runtime-disabled/u,
    );
    assert.equal(upstream.applyAttempts, 0);
    assert.equal(upstream.rollbackAttempts, 0);
    assert.equal(upstream.saveAttempts, 0);
  });

  void test("context requires and canonicalizes the exact .eprj2 project path", async () => {
    const canonical = new MockUpstream({ contextPath: `file://${source}` });
    const canonicalContext = await new EasyedaControlEngine(
      canonical,
    ).context();
    assert.equal(canonicalContext.project.path, resolve(source));

    for (const contextPath of [
      "",
      "/tmp/not-an-easyeda-project.txt",
      "relative.eprj2",
    ]) {
      const malformed = new MockUpstream({ contextPath });
      await assert.rejects(
        new EasyedaControlEngine(malformed).context(),
        /project UUID\/path|absolute POSIX|\.eprj2 database/u,
      );
    }
  });

  void test("plans checkpoint and journal before discarding the live baseline", async () => {
    const upstream = new MockUpstream({ reopenedTabId: "clean-tab" });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "clean-baseline");
    const originalPlanHash = buildPlanHash(plan);

    await assert.rejects(
      engine.plan(plan),
      /confirmDiscardAnyUnsavedState=true/u,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.equal(upstream.readStateCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);

    let dispatchJournal: OperationJournal | undefined;
    let dispatchCheckpointVerification: unknown;
    upstream.options.onBaselineReopen = async (): Promise<void> => {
      dispatchJournal = await onlyOperation();
      const receipt = parseJson(
        await readFile(dispatchJournal.preCheckpoint.receiptPath, "utf8"),
      );
      dispatchCheckpointVerification = {
        ok:
          isRecord(receipt) &&
          receipt["schema"] === "easyeda-pro-control.checkpoint.v1",
      };
    };
    const planned = await planWithDiscard(engine, plan);
    const observedDispatchJournal = requireDefined(
      dispatchJournal,
      "baseline dispatch journal",
    );
    const observedCheckpointVerification = requireRecord(
      dispatchCheckpointVerification,
      "dispatch checkpoint verification",
    );
    assert.equal(planned.state, "preflight-proven");
    assert.equal(upstream.baselineReopenAttempts, 1);
    assert.equal(upstream.reopenAttempts, 0);
    assert.equal(observedDispatchJournal.state, "baseline-reopen-dispatching");
    assert.equal(observedDispatchJournal.hardStop, true);
    assert.equal(observedDispatchJournal.mutationMayHaveOccurred, true);
    assert.equal(observedCheckpointVerification["ok"], true);
    assert.equal(observedDispatchJournal.artifacts.length, 1);
    assert.match(
      requireDefined(observedDispatchJournal.artifacts[0], "baseline artifact")
        .path,
      /baseline-checkpoint/u,
    );
    assert.deepEqual(upstream.events.slice(0, 2), [
      "baseline-reopen:1",
      "read-state:1:baseline",
    ]);

    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.plan.expectedContext.document.tabId, "clean-tab");
    assert.equal(journal.context.document.tabId, "clean-tab");
    assert.equal(journal.planHash, planned.planHash);
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.notEqual(journal.planHash, originalPlanHash);
    assert.equal(
      requireDefined(journal.baselineHash, "baseline hash").length,
      64,
    );
    assert.equal(journal.artifacts.length, 3);
    const preflightArtifact = lastArtifact(journal);
    const preflightText = await readFile(preflightArtifact.path, "utf8");
    const preflightEvidence = requireRecord(
      parseJson(preflightText),
      "preflight evidence",
    );
    const finalCheckpointVerification = requireRecord(
      preflightEvidence["finalCheckpointVerification"],
      "final checkpoint verification",
    );
    assert.equal(finalCheckpointVerification["ok"], true);
    assert.equal(finalCheckpointVerification["sourceEqualsCheckpoint"], true);
  });

  void test("rebinds duplicate tab IDs in a full PCB context after each lifecycle reopen", async () => {
    const upstream = new MockUpstream({
      reopenedTabId: "clean-full-context-tab",
    });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "full-context-lifecycle", {
      expectedContext: {
        project: { uuid: "project-1", name: "Mock project", path: source },
        document: {
          uuid: "document-1",
          documentType: 3,
          title: "Mock PCB",
          tabId: "tab-1",
        },
        pcb: { uuid: "document-1", title: "Mock PCB", tabId: "tab-1" },
        schematic: {},
      },
    });
    const originalPlanHash = buildPlanHash(plan);

    const planned = await planWithDiscard(engine, plan);
    let journal = await artifacts.loadOperation(planned.operationId);
    const plannedPcbContext = requireDefined(
      journal.plan.expectedContext.pcb,
      "planned PCB context",
    );
    const journalPcbContext = requireDefined(
      journal.context.pcb,
      "journal PCB context",
    );
    assert.equal(
      journal.plan.expectedContext.document.tabId,
      "clean-full-context-tab",
    );
    assert.equal(plannedPcbContext.tabId, "clean-full-context-tab");
    assert.equal(journal.context.document.tabId, "clean-full-context-tab");
    assert.equal(journalPcbContext.tabId, "clean-full-context-tab");
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.notEqual(journal.planHash, originalPlanHash);

    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    const completed = await engine.saveReopen(
      planned.operationId,
      planned.planHash,
    );
    journal = await artifacts.loadOperation(planned.operationId);
    const completedPlanPcbContext = requireDefined(
      journal.plan.expectedContext.pcb,
      "completed plan PCB context",
    );
    const completedJournalPcbContext = requireDefined(
      journal.context.pcb,
      "completed journal PCB context",
    );
    assert.equal(completed.state, "completed");
    assert.equal(journal.plan.expectedContext.document.tabId, "new-tab");
    assert.equal(completedPlanPcbContext.tabId, "new-tab");
    assert.equal(journal.context.document.tabId, "new-tab");
    assert.equal(completedJournalPcbContext.tabId, "new-tab");
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.equal(journal.planHash, completed.planHash);
  });

  void test("hard-stops when lifecycle evidence reports a tab other than the active reopened tab", async () => {
    const upstream = new MockUpstream({
      reopenedTabId: "actual-clean-tab",
      reportedReopenTabId: "different-reported-tab",
    });
    const engine = new EasyedaControlEngine(upstream);

    await assert.rejects(
      planWithDiscard(engine, await makePlan(engine, "mismatched-reopen-tab")),
      /reopened tab does not match the active context tab/u,
    );
    const unknown = await onlyOperation();
    assert.equal(unknown.state, "baseline-reopen-unknown");
    assert.equal(unknown.unknownPhase, "baseline-reopen");
    assert.equal(unknown.hardStop, true);
    assert.equal(unknown.mutationMayHaveOccurred, true);
    assert.equal(unknown.orphanedCallPossible, false);
    assert.equal(unknown.orphanedCallPhase, "baseline-reopen");
    assert.equal(typeof unknown.orphanedCallReturnedAt, "string");
    assert.equal(Object.hasOwn(unknown, "baselineHash"), false);
    assert.equal(unknown.plan.expectedContext.document.tabId, "tab-1");
    assert.equal(upstream.activeTabId, "actual-clean-tab");
    assert.equal(upstream.readStateCalls, 0);
  });

  void test("baseline reopen timeout is recoverably invalidated without a baseline hash", async () => {
    const upstream = new MockUpstream({ baselineReopenErrorsRemaining: 1 });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "baseline-timeout");

    await assert.rejects(planWithDiscard(engine, plan), /timed out/u);
    const unknown = await onlyOperation();
    assert.equal(unknown.state, "baseline-reopen-unknown");
    assert.equal(unknown.unknownPhase, "baseline-reopen");
    assert.equal(unknown.hardStop, true);
    assert.equal(unknown.mutationMayHaveOccurred, true);
    assert.equal(Object.hasOwn(unknown, "baselineHash"), false);
    assert.equal(upstream.baselineReopenAttempts, 1);
    assert.equal(upstream.readStateCalls, 0);

    await assert.rejects(
      engine.recover(unknown.operationId, "reconciled-no-mutation"),
      /terminate EasyEDA Pro, restart it, reconnect the bridge/u,
    );
    const recovered = await engine.recover(
      unknown.operationId,
      "reconciled-no-mutation",
      {
        runtimeRestartConfirmation: await restartConfirmation(
          unknown.operationId,
          upstream,
        ),
      },
    );
    assert.equal(recovered.state, "plan-invalidated");
    assert.equal(recovered.hardStop, false);
    assert.equal(recovered.mutationMayHaveOccurred, false);
    assert.equal(upstream.readStateCalls, 0);
    const journal = await artifacts.loadOperation(unknown.operationId);
    const recoveryArtifact = lastArtifact(journal);
    const recoveryText = await readFile(recoveryArtifact.path, "utf8");
    const evidence = requireRecord(
      parseJson(recoveryText),
      "baseline recovery evidence",
    );
    const preCheckpointVerification = requireRecord(
      evidence["preCheckpointVerification"],
      "pre-checkpoint verification",
    );
    assert.equal(evidence["baselinePreparationInvalidated"], true);
    assert.equal(preCheckpointVerification["ok"], true);
  });

  void test("rejects an echoed recovery nonce from the same bridge session", async () => {
    const upstream = new MockUpstream({ baselineReopenErrorsRemaining: 1 });
    const engine = new EasyedaControlEngine(upstream);
    await assert.rejects(
      planWithDiscard(
        engine,
        await makePlan(engine, "same-renderer-recovery-echo"),
      ),
      /timed out/u,
    );
    const unknown = await onlyOperation();
    const challenge = requireDefined(
      unknown.runtimeRestartChallenge,
      "runtime restart challenge",
    );

    await assert.rejects(
      engine.recover(unknown.operationId, "reconciled-no-mutation", {
        runtimeRestartConfirmation: challenge,
      }),
      /pre-dispatch authenticated EasyEDA bridge session is still active/u,
    );
    const stillBlocked = await artifacts.loadOperation(unknown.operationId);
    assert.equal(stillBlocked.orphanedCallPossible, true);
    assert.equal(stillBlocked.runtimeRestartChallenge, challenge);
  });

  void test("rejects a changed renderer identity on the same authenticated session", async () => {
    const upstream = new MockUpstream({ baselineReopenErrorsRemaining: 1 });
    const engine = new EasyedaControlEngine(upstream);
    await assert.rejects(
      planWithDiscard(
        engine,
        await makePlan(engine, "same-session-renderer-change"),
      ),
      /timed out/u,
    );
    const unknown = await onlyOperation();
    const challenge = requireDefined(
      unknown.runtimeRestartChallenge,
      "runtime restart challenge",
    );
    upstream.runtimeGeneration += 1;
    upstream.runtimeTimeOrigin += 1000;

    await assert.rejects(
      engine.recover(unknown.operationId, "reconciled-no-mutation", {
        runtimeRestartConfirmation: challenge,
      }),
      /pre-dispatch authenticated EasyEDA bridge session is still active/u,
    );
    const stillBlocked = await artifacts.loadOperation(unknown.operationId);
    assert.equal(stillBlocked.orphanedCallPossible, true);
    assert.equal(stillBlocked.runtimeRestartChallenge, challenge);
  });

  void test("plan invalidates when the project source changes during clean-baseline preflight", async () => {
    const upstream = new MockUpstream({
      onReadState(_mock, count): void {
        if (count === 1) {
          execFileSync("sqlite3", [
            source,
            "UPDATE project_state SET value='changed-during-plan-preflight' WHERE id=1;",
          ]);
        }
      },
    });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "baseline-preflight-source-drift");

    await assert.rejects(
      planWithDiscard(engine, plan),
      /durable database changed between the pre-checkpoint, baseline reopen, and preflight/u,
    );
    const invalidated = await onlyOperation();
    assert.equal(invalidated.state, "plan-invalidated");
    assert.equal(invalidated.mutationState, "none");
    assert.equal(invalidated.hardStop, false);
    assert.equal(invalidated.mutationMayHaveOccurred, false);
    assert.equal(upstream.baselineReopenAttempts, 1);
    assert.equal(upstream.readStateCalls, 2);
    assert.equal(upstream.applyAttempts, 0);
  });

  void test("guards apply, verifies live and reopened state, then completes with two checkpoints", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "success"),
    );
    assert.equal(planned.state, "preflight-proven");
    assert.equal(planned.mutationMayHaveOccurred, false);

    let applyingJournal: OperationJournal | undefined;
    let savingJournal: OperationJournal | undefined;
    upstream.options.onApply = async (): Promise<void> => {
      applyingJournal = await artifacts.loadOperation(planned.operationId);
    };
    upstream.options.onSave = async (): Promise<void> => {
      savingJournal = await artifacts.loadOperation(planned.operationId);
    };

    const applied = await engine.apply(planned.operationId, planned.planHash);
    const observedApplyingJournal = requireDefined(
      applyingJournal,
      "applying journal",
    );
    assert.equal(applied.state, "applied-unsaved");
    assert.equal(observedApplyingJournal.state, "applying");
    assert.equal(observedApplyingJournal.hardStop, true);
    assert.equal(observedApplyingJournal.mutationMayHaveOccurred, true);
    assert.equal(applied.mutationMayHaveOccurred, true);
    assert.equal(upstream.applyAttempts, 1);
    const applyCode = requireDefined(upstream.lastApplyCode, "apply source");
    assert.match(applyCode, /EXPECTED_PROJECT_UUID = "project-1"/u);
    assert.match(applyCode, /EXPECTED_DOCUMENT_UUID = "document-1"/u);
    assert.match(applyCode, /EXPECTED_TAB_ID = "reopened-tab"/u);
    assert.match(applyCode, /eda\.pcb_PrimitiveComponent/u);
    assert.match(applyCode, /"primitiveId":"R1","patch":\{"x":200\}/u);
    assert.doesNotMatch(applyCode, /MOCK_APPLY/u);

    const verified = await engine.verify(planned.operationId);
    assert.equal(verified.state, "live-verified");
    assert.equal(verified.hardStop, false);

    const completed = await engine.saveReopen(
      planned.operationId,
      planned.planHash,
    );
    const observedSavingJournal = requireDefined(
      savingJournal,
      "saving journal",
    );
    assert.equal(completed.state, "completed");
    assert.equal(observedSavingJournal.state, "saving");
    assert.equal(observedSavingJournal.hardStop, true);
    assert.equal(observedSavingJournal.mutationMayHaveOccurred, true);
    assert.equal(completed.saved, true);
    assert.equal(completed.reopened, true);
    assert.equal(completed.mutationMayHaveOccurred, false);
    assert.equal(upstream.saveAttempts, 1);

    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.plan.expectedContext.document.tabId, "new-tab");
    assert.equal(journal.context.document.tabId, "new-tab");
    assert.equal(journal.planHash, completed.planHash);
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.notEqual(journal.planHash, planned.planHash);
    assert.equal(
      journal.preCheckpoint.schema,
      "easyeda-pro-control.checkpoint.v1",
    );
    assert.equal(
      requireDefined(journal.finalCheckpoint, "final checkpoint").schema,
      "easyeda-pro-control.checkpoint.v1",
    );
    assert.equal(journal.artifacts.length, 9);
    assert.deepEqual(
      journal.artifacts.map((artifact) =>
        basename(artifact.path)
          .replace(/^\d{2}-/u, "")
          .replace(/-\d{13}(?=\.json$)/u, "")
          .replace(/\.json$/u, ""),
      ),
      [
        "baseline-checkpoint",
        "baseline-reopen",
        "preflight",
        "apply",
        "verify-live",
        "verify-pre-save",
        "save-reopen",
        "verify-reopened",
        "final-checkpoint",
      ],
    );
  });

  void test("delayed finalization retries discard active editor changes before certification", async () => {
    const retryStates = ["final-checkpoint-failed", "reopened-verified"];
    for (let index = 0; index < retryStates.length; index += 1) {
      if (index > 0) {
        await resetFixture();
      }
      const retryState = retryStates[index];
      const upstream = new MockUpstream({ reopenState: "applied" });
      const engine = new EasyedaControlEngine(upstream);
      const { planned, failed } = await reachDelayedFinalFailure(
        engine,
        upstream,
        `delayed-final-${retryState}`,
      );
      if (retryState === "reopened-verified") {
        failed.state = "reopened-verified";
        failed.hardStop = false;
        failed.nextSafeAction = "Resume final checkpoint creation.";
        delete failed.lastError;
        await artifacts.updateOperation(failed);
      }

      const callsBeforeRetry = upstream.events.length;
      const readsBeforeRetry = upstream.readStateCalls;
      const artifactsBeforeRetry = failed.artifacts.length;
      await assert.rejects(
        engine.saveReopen(planned.operationId, failed.planHash),
        /confirmDiscardAnyUnsavedState=true/u,
      );
      assert.equal(upstream.reopenAttempts, 0);
      assert.equal(upstream.saveAttempts, 1);
      assert.equal(upstream.readStateCalls, readsBeforeRetry);
      assert.equal(upstream.events.length, callsBeforeRetry);

      const dispatchCapture: JournalCapture = {};
      upstream.options.onReopen = captureOperationOnReopen(
        planned.operationId,
        dispatchCapture,
      );
      const completed = await engine.saveReopen(
        planned.operationId,
        failed.planHash,
        { confirmDiscardAnyUnsavedState: true },
      );
      const observedDispatchJournal = requireDefined(
        dispatchCapture.journal,
        "retry dispatch journal",
      );
      assert.equal(completed.state, "completed");
      assert.equal(upstream.saveAttempts, 1);
      assert.equal(upstream.reopenAttempts, 1);
      assert.match(observedDispatchJournal.state, /reopen.*dispatch/iu);
      assert.equal(observedDispatchJournal.hardStop, true);
      assert.equal(observedDispatchJournal.mutationMayHaveOccurred, true);
      const retryEvents = upstream.events.slice(callsBeforeRetry);
      assert.equal(retryEvents[0], "reopen-only:1");
      assert.match(
        requireDefined(retryEvents[1], "retry read event"),
        /^read-state:\d+:applied$/u,
      );

      const journal = await artifacts.loadOperation(planned.operationId);
      const addedArtifacts = journal.artifacts.slice(artifactsBeforeRetry);
      const addedPayloads = await Promise.all(
        addedArtifacts.map(async (artifact) =>
          parseJson(await readFile(artifact.path, "utf8")),
        ),
      );
      const firstAddedEvidence = requireRecord(
        requireDefined(addedPayloads[0], "first retry artifact"),
        "first retry artifact",
      );
      const retryPayload = requireRecord(
        firstAddedEvidence["payload"],
        "retry payload",
      );
      assert.deepEqual(
        {
          saved: retryPayload["saved"],
          closed: retryPayload["closed"],
          reopened: retryPayload["reopened"],
        },
        { saved: false, closed: true, reopened: true },
      );
    }
  });

  void test("rolls an applied unsaved mutation back and proves the exact baseline hash", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "rollback-happy"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    let rollingBackJournal: OperationJournal | undefined;
    upstream.options.onRollback = async (): Promise<void> => {
      rollingBackJournal = await artifacts.loadOperation(planned.operationId);
    };

    const rolledBack = await engine.rollback(
      planned.operationId,
      planned.planHash,
    );
    const observedRollingBackJournal = requireDefined(
      rollingBackJournal,
      "rolling-back journal",
    );
    assert.equal(observedRollingBackJournal.state, "rolling-back");
    assert.equal(observedRollingBackJournal.hardStop, true);
    assert.equal(observedRollingBackJournal.mutationMayHaveOccurred, true);
    assert.equal(rolledBack.state, "rolled-back");
    assert.equal(rolledBack.mutationState, "rolled-back");
    assert.equal(rolledBack.saved, false);
    assert.equal(rolledBack.mutationMayHaveOccurred, false);
    assert.equal(upstream.rollbackAttempts, 1);
    assert.equal(upstream.state, "baseline");
  });

  void test("lets the user cancel a live-verified mutation through guarded rollback", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "rollback-live-verified"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    const verified = await engine.verify(planned.operationId);
    assert.equal(verified.state, "live-verified");

    const rolledBack = await engine.rollback(
      planned.operationId,
      planned.planHash,
    );
    assert.equal(rolledBack.state, "rolled-back");
    assert.equal(upstream.rollbackAttempts, 1);
    assert.equal(upstream.state, "baseline");
  });

  void test("refuses rollback before dispatch when the durable baseline drifts", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "rollback-durable-race"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    let changed = false;
    upstream.options.onReadState = (): void => {
      if (changed) {
        return;
      }
      changed = true;
      execFileSync("sqlite3", [
        source,
        "UPDATE project_state SET value='rollback-race' WHERE id=1;",
      ]);
    };

    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /durable baseline changed immediately before rollback/u,
    );
    assert.equal(upstream.rollbackAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "durable-baseline-drift");
    assert.equal(journal.orphanedCallPossible, false);
  });

  void test("refuses save immediately before dispatch when the durable baseline drifts", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "save-pre-dispatch-durable-race"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);

    const requireDurableBaseline =
      engine.requireDurableBaselineBeforeDispatch.bind(engine);
    engine.requireDurableBaselineBeforeDispatch = (
      operation,
      phase,
      failure,
    ): ReturnType<EngineInstance["requireDurableBaselineBeforeDispatch"]> => {
      if (phase === "save-reopen") {
        execFileSync("sqlite3", [
          source,
          "UPDATE project_state SET value='save-pre-dispatch-race' WHERE id=1;",
        ]);
      }
      return requireDurableBaseline(operation, phase, failure);
    };

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /durable baseline changed immediately before save-reopen/u,
    );
    assert.equal(upstream.saveAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "durable-baseline-drift");
    assert.equal(
      journal.unknownPhase,
      "save-reopen-pre-dispatch-durable-baseline",
    );
    assert.equal(journal.orphanedCallPossible, false);
  });

  void test("binds the checkpoint to an equivalent Windows project path", async (context) => {
    const windows = windowsPath(source);
    if (windows === undefined || windows.length === 0) {
      context.skip("Fixture is not under a mounted Windows drive.");
      return;
    }

    const windowsUpstream = new MockUpstream({ contextPath: windows });
    const windowsEngine = new EasyedaControlEngine(windowsUpstream);
    const windowsPlan = await makePlan(windowsEngine, "windows-path", {
      expectedContext: {
        project: { uuid: "project-1", path: windows },
        document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
      },
    });
    const plannedWindows = await planWithDiscard(windowsEngine, windowsPlan);
    const recoveredWindows = await windowsEngine.recover(
      plannedWindows.operationId,
      "reconciled-no-mutation",
    );
    assert.equal(recoveredWindows.state, "reconciled-no-mutation");
  });

  void test("binds the checkpoint to an equivalent file URI project path", async () => {
    const fileUri = `file://${source}`;
    const uriUpstream = new MockUpstream({ contextPath: fileUri });
    const uriEngine = new EasyedaControlEngine(uriUpstream);
    const uriPlan = await makePlan(uriEngine, "file-uri", {
      expectedContext: {
        project: { uuid: "project-1", path: fileUri },
        document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
      },
    });
    const plannedUri = await planWithDiscard(uriEngine, uriPlan);
    const recoveredUri = await uriEngine.recover(
      plannedUri.operationId,
      "reconciled-no-mutation",
    );
    assert.equal(recoveredUri.state, "reconciled-no-mutation");
  });

  void test("rejects a checkpoint source that is not the active project database", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "wrong-checkpoint", {
      expectedContext: {
        project: { uuid: "project-1", path: join(testDir, "different.eprj2") },
        document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
      },
    });
    await assert.rejects(
      engine.plan(plan),
      /checkpoint\.source must be the exact/u,
    );
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("confines public checkpoint creation and verification to the active project", async () => {
    const engine = new EasyedaControlEngine(new MockUpstream());
    await assert.rejects(
      engine.checkpoint({
        source: join(testDir, "other-project.eprj2"),
        outputDir,
        label: "wrong-active-project",
      }),
      /does not match the authorized active project/u,
    );
    await assert.rejects(
      engine.checkpoint({
        source,
        outputDir: join(testDir, "unmanaged-checkpoints"),
        label: "outside-authorized-root",
      }),
      /outside the authorized checkpoint roots/u,
    );
    await assert.rejects(
      engine.checkpoint({
        receiptPath: join(testDir, "foreign.checkpoint.json"),
      }),
      /outside the authorized checkpoint roots/u,
    );
  });

  void test("rejects plans without declared target changes or mandatory exact phase readers", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const noTargetChanges = await makePlan(engine, "no-target-changes", {
      targetChanges: [],
    });
    await assert.rejects(
      engine.plan(noTargetChanges),
      /require explicit before\/after targetChanges/u,
    );

    const noLive = await makePlan(engine, "no-live-assertions", {
      verifyAssertions: [],
      verifyCalls: [
        { toolName: "easyeda_read_state", arguments: {}, assertions: [] },
      ],
    });
    await assert.rejects(
      engine.plan(noLive),
      /Live verification requires one all-component/u,
    );

    const noReopened = await makePlan(engine, "no-reopened-assertions", {
      reopenedAssertions: [],
      reopenedVerifyCalls: [
        { toolName: "easyeda_read_state", arguments: {}, assertions: [] },
      ],
    });
    await assert.rejects(
      engine.plan(noReopened),
      /Reopened verification requires one all-component/u,
    );
  });

  void test("rejects multi-component targets before any lifecycle or mutation dispatch", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "multi-component-target", {
      targetPrimitiveIds: ["R1", "R2"],
      targetChanges: [
        { primitiveId: "R1", pointer: "/x", before: 100, after: 200 },
        { primitiveId: "R2", pointer: "/x", before: 20, after: 30 },
      ],
    });

    await assert.rejects(
      planWithDiscard(engine, plan),
      /require exactly one targetPrimitiveId/u,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.equal(upstream.applyAttempts, 0);
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("restricts declared changes to guarded PCB placement, layer, and lock fields", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const pcbAssociationChange = await makePlan(
      engine,
      "pcb-association-change",
      {
        targetChanges: [
          {
            primitiveId: "R1",
            pointer: "/manufacturer",
            before: "fixture-manufacturer",
            after: "different-manufacturer",
          },
        ],
      },
    );
    await assert.rejects(
      planWithDiscard(engine, pcbAssociationChange),
      /permits component placement\/lock state/u,
    );
    const invalidBeforeValue = await makePlan(engine, "invalid-before-value", {
      targetChanges: [
        { primitiveId: "R1", pointer: "/x", before: "100", after: 200 },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, invalidBeforeValue),
      /target R1\/x before value must be finite/iu,
    );
    const invalidAfterLayer = await makePlan(engine, "invalid-after-layer", {
      targetChanges: [
        { primitiveId: "R1", pointer: "/layer", before: 1, after: 3 },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, invalidAfterLayer),
      /target R1\/layer after value must be Top 1 or Bottom 2/iu,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("rejects schematic mutation plans even with target-bound pinned read evidence", async () => {
    const upstream = new MockUpstream({ documentType: 1 });
    const engine = new EasyedaControlEngine(upstream);
    const verifier: ToolCallSpec = {
      toolName: "easyeda_schematic_verify_write",
      arguments: {},
      assertions: [{ pointer: "/verified", op: "equals", value: true }],
    };
    const plan = await makePlan(engine, "schematic-write-verifier", {
      expectedContext: {
        project: { uuid: "project-1", path: source },
        document: { uuid: "document-1", documentType: 1, tabId: "tab-1" },
      },
      preflightCalls: [...phaseReadSpecs(1), verifier],
      verifyCalls: [...phaseReadSpecs(1, "applied"), verifier],
      verifyAssertions: [],
      reopenedVerifyCalls: [...phaseReadSpecs(1, "applied"), verifier],
      reopenedAssertions: [],
    });
    await assert.rejects(
      planWithDiscard(engine, plan),
      /currently support PCB \(3\) component placement\/layer\/lock only/u,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("rejects cross-editor tools before dispatch", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const schematicReadOnPcb = await makePlan(engine, "schematic-read-on-pcb", {
      preflightCalls: [
        ...phaseReadSpecs(3),
        {
          toolName: "easyeda_schematic_components",
          arguments: {},
          assertions: [{ pointer: "/reference", op: "equals", value: "R1" }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, schematicReadOnPcb),
      /belongs to document type 1, not the plan's active document type 3/u,
    );

    const pcbReadOnSchematic = await makePlan(engine, "pcb-read-on-schematic", {
      expectedContext: {
        project: { uuid: "project-1", path: source },
        document: { uuid: "document-1", documentType: 1, tabId: "tab-1" },
      },
      preflightCalls: [
        ...phaseReadSpecs(1),
        {
          toolName: "easyeda_pcb_components",
          arguments: {},
          assertions: [{ pointer: "/reference", op: "equals", value: "R1" }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, pcbReadOnSchematic),
      /currently support PCB \(3\) component placement\/layer\/lock only/u,
    );

    const boardReadOnSchematic = await makePlan(
      engine,
      "board-read-on-schematic",
      {
        expectedContext: {
          project: { uuid: "project-1", path: source },
          document: { uuid: "document-1", documentType: 1, tabId: "tab-1" },
        },
        preflightCalls: [
          ...phaseReadSpecs(1),
          {
            toolName: "easyeda_board_dimensions",
            arguments: {},
            assertions: [{ pointer: "/reference", op: "equals", value: "R1" }],
          },
        ],
      },
    );
    await assert.rejects(
      planWithDiscard(engine, boardReadOnSchematic),
      /currently support PCB \(3\) component placement\/layer\/lock only/u,
    );

    const diagnosticPlan = await makePlan(engine, "diagnostic-read", {
      preflightCalls: [
        ...phaseReadSpecs(3),
        {
          toolName: "easyeda_component_probe",
          arguments: {},
          assertions: [{ pointer: "/reference", op: "equals", value: "R1" }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, diagnosticPlan),
      /not admitted as mutation proof/u,
    );

    const previewPlan = await makePlan(engine, "preview-document-plan", {
      expectedContext: {
        project: { uuid: "project-1", path: source },
        document: { uuid: "document-1", documentType: 15, tabId: "tab-1" },
      },
    });
    await assert.rejects(
      planWithDiscard(engine, previewPlan),
      /currently support PCB \(3\) component placement\/layer\/lock only/u,
    );
    assert.equal(
      upstream.calls.some((call) =>
        /schematic_components|pcb_components|board_dimensions|component_probe/u.test(
          call.name,
        ),
      ),
      false,
    );
  });

  void test("rejects capture reads and export writers that bypass dedicated facade gates", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const capturePlan = await makePlan(engine, "capture-bypass", {
      preflightCalls: [
        ...phaseReadSpecs(3),
        {
          toolName: "easyeda_canvas_capture",
          arguments: {},
          assertions: [{ pointer: "/captured", op: "equals", value: true }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, capturePlan),
      /dedicated capture or export facade gate/u,
    );

    const exportPlan = await makePlan(engine, "export-bypass", {
      applyCall: {
        toolName: "easyeda_export_gerbers",
        arguments: { confirmWrite: true, projectId: "project-1" },
      },
    });
    await assert.rejects(
      planWithDiscard(engine, exportPlan),
      /applyCall must be the facade-generated easyeda_control_exact_component_mutation/u,
    );
    assert.equal(
      upstream.calls.some((call) => /capture|export/u.test(call.name)),
      false,
    );
  });

  void test("rejects every caller-selected writer outside the exact component mutation facade", async () => {
    const pcbUpstream = new MockUpstream();
    const pcbEngine = new EasyedaControlEngine(pcbUpstream);
    const writerCases: (readonly [string, string, Record<string, unknown>])[] =
      [
        [
          "unreviewed-modify-writer",
          "easyeda_pcb_modify_component",
          { tabId: "tab-1", componentId: "R1", confirmWrite: true },
        ],
        [
          "unreviewed-add-writer",
          "easyeda_pcb_add_text",
          { tabId: "tab-1", text: "fixture", confirmWrite: true },
        ],
        [
          "workflow-writer-bypass",
          "easyeda_pcb_workflow_write",
          { tabId: "tab-1", confirmWrite: true },
        ],
      ];
    for (const [label, toolName, argumentsValue] of writerCases) {
      const plan = await makePlan(pcbEngine, label, {
        applyCall: { toolName, arguments: argumentsValue },
      });
      await assert.rejects(
        planWithDiscard(pcbEngine, plan),
        /applyCall must be the facade-generated easyeda_control_exact_component_mutation/u,
      );
    }

    const rawApply = await makePlan(pcbEngine, "raw-writer-bypass", {
      applyCall: rawSpec("CALLER_SUPPLIED_RAW_APPLY"),
    });
    await assert.rejects(
      planWithDiscard(pcbEngine, rawApply),
      /applyCall must be the facade-generated easyeda_control_exact_component_mutation/u,
    );
    const rawRollback = await makePlan(pcbEngine, "raw-rollback-bypass", {
      rollbackCalls: [rawSpec("CALLER_SUPPLIED_RAW_ROLLBACK")],
    });
    await assert.rejects(
      planWithDiscard(pcbEngine, rawRollback),
      /rollbackCalls must contain exactly one facade-generated easyeda_control_exact_component_mutation/u,
    );
    assert.equal(
      pcbUpstream.calls.some((call) =>
        /modify_component|add_text|workflow_write/u.test(call.name),
      ),
      false,
    );
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("invalidates a plan when the preflight snapshot drifts before apply", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "preflight-drift"),
    );
    upstream.collateralState = "external-drift";

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /Preflight state changed after planning/u,
    );
    assert.equal(upstream.applyAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "plan-invalidated");
    assert.equal(journal.mutationState, "none");
    assert.equal(journal.mutationMayHaveOccurred, false);
  });

  void test("invalidates a plan when the durable database or pre-checkpoint drifts", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "checkpoint-drift"),
    );
    execFileSync("sqlite3", [
      source,
      "UPDATE project_state SET value='external' WHERE id=1;",
    ]);

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /project database changed or its checkpoint proof failed/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "plan-invalidated");
    assert.equal(journal.hardStop, false);
    assert.equal(upstream.applyAttempts, 0);
  });

  void test("does not claim applied-unsaved when apply changes the durable database", async () => {
    const upstream = new MockUpstream({ applyPersistence: "logical" });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "apply-durable-drift"),
    );

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /checkpoint|durable|database/iu,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, "applied-unsaved");
    assert.equal(journal.hardStop, true);
    assert.equal(journal.mutationMayHaveOccurred, true);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(journal.orphanedCallPhase, "apply");
    assert.equal(typeof journal.orphanedCallReturnedAt, "string");
    assert.equal(journal.runtimeRestartBoundary, undefined);
    assert.equal(upstream.applyAttempts, 1);
  });

  void test("does not claim live-verified after the durable database changes", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "verify-durable-drift"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    execFileSync("sqlite3", [
      source,
      "UPDATE project_state SET value='external' WHERE id=1;",
    ]);

    await assert.rejects(
      engine.verify(planned.operationId),
      /checkpoint|durable|database/iu,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, "live-verified");
    assert.equal(journal.hardStop, true);
  });

  void test("revalidates the stored runtime before live verification", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "verify-runtime-drift"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    const readsBefore = upstream.readStateCalls;
    upstream.options.serverVersion = "1.0.0-drifted";

    await assert.rejects(
      engine.verify(planned.operationId),
      /runtime fingerprint/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "applied-unsaved");
    assert.equal(journal.hardStop, true);
    assert.equal(
      requireDefined(journal.runtimeGuardFailure, "verify runtime guard").phase,
      "verify",
    );
    assert.equal(journal.unknownPhase, undefined);
    assert.equal(upstream.readStateCalls, readsBefore);
  });

  void test("revalidates the stored runtime before rollback", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "rollback-runtime-drift"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    upstream.options.serverVersion = "1.0.0-drifted";

    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /runtime fingerprint/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "applied-unsaved");
    assert.equal(
      requireDefined(journal.runtimeGuardFailure, "rollback runtime guard")
        .phase,
      "rollback",
    );
    assert.equal(journal.unknownPhase, undefined);
    assert.equal(upstream.rollbackAttempts, 0);
  });

  void test("revalidates the stored runtime before save and reopen", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "save-runtime-drift"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    upstream.options.serverVersion = "1.0.0-drifted";

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /runtime fingerprint/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "live-verified");
    assert.equal(
      requireDefined(journal.runtimeGuardFailure, "save runtime guard").phase,
      "save-reopen",
    );
    assert.equal(journal.unknownPhase, undefined);
    assert.equal(upstream.saveAttempts, 0);
  });

  void test("recovery runtime failure preserves the original unknown phase", async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "recovery-runtime-drift"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );
    upstream.options.serverVersion = "1.0.0-drifted";

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-no-mutation", {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /runtime fingerprint/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "unknown");
    assert.equal(journal.unknownPhase, "apply");
    assert.equal(
      requireDefined(journal.runtimeGuardFailure, "recovery runtime guard")
        .phase,
      "recovery-runtime-restart-boundary",
    );
    assert.equal(journal.hardStop, true);
  });

  void test("stored runtime checks rerun public and private fingerprint validators", async () => {
    const cases: {
      label: string;
      mutate: (operation: OperationJournal) => void;
      expected: RegExp;
    }[] = [
      {
        label: "stored-public-fingerprint",
        mutate(operation) {
          operation.plan.capabilityLevel = "public-supported";
          const launcher = requireRecord(
            operation.plan.expectedFingerprint["upstreamLauncher"],
            "stored upstream launcher",
          );
          delete launcher["args"];
        },
        expected: /expectedFingerprint must pin a connected/u,
      },
      {
        label: "stored-private-fingerprint",
        mutate(operation) {
          const bundles = requireRecord(
            operation.plan.expectedFingerprint["installedBundles"],
            "stored installed bundles",
          );
          const publicApi = requireRecord(
            bundles["publicApi"],
            "stored public API bundle",
          );
          publicApi["declarationsSha256"] = digest("7");
        },
        expected: /compatibility tuple/u,
      },
    ];
    for (let index = 0; index < cases.length; index += 1) {
      if (index > 0) {
        await resetFixture();
      }
      const scenario = requireDefined(cases[index], "runtime guard scenario");
      const upstream = new MockUpstream();
      const engine = new EasyedaControlEngine(upstream);
      const planned = await planWithDiscard(
        engine,
        await makePlan(engine, scenario.label),
      );
      await engine.apply(planned.operationId, planned.planHash);
      const operation = await artifacts.loadOperation(planned.operationId);
      scenario.mutate(operation);
      operation.planHash = buildPlanHash(operation.plan);
      await artifacts.updateOperation(operation);
      const callsBeforeVerify = upstream.calls.length;

      await assert.rejects(
        engine.verify(planned.operationId),
        scenario.expected,
      );
      assert.equal(upstream.calls.length, callsBeforeVerify);
      const guarded = await artifacts.loadOperation(planned.operationId);
      assert.equal(guarded.state, "applied-unsaved");
      assert.equal(guarded.hardStop, true);
      const runtimeGuard = requireDefined(
        guarded.runtimeGuardFailure,
        "stored runtime guard",
      );
      assert.equal(runtimeGuard.phase, "verify");
      assert.match(runtimeGuard.error.message, scenario.expected);
    }
  });

  void test("records a write timeout as unknown and hard-stops without blind retry", async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "write-timeout"),
    );

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "unknown");
    assert.equal(journal.mutationState, "unknown");
    assert.equal(journal.hardStop, true);
    assert.equal(journal.mutationMayHaveOccurred, true);
    assert.match(journal.nextSafeAction, /Do not retry or save/u);
    assert.equal(upstream.applyAttempts, 1);
    const restartChallenge = requireDefined(
      journal.runtimeRestartChallenge,
      "runtime restart challenge",
    );
    assert.match(
      restartChallenge,
      new RegExp(
        `^EASYEDA_RESTARTED_AND_RECONNECTED:${planned.operationId}:apply:`,
        "u",
      ),
    );
    const boundDispatch = requireDefined(
      journal.bridgeDispatchBeforeOrphan,
      "orphaned bridge dispatch binding",
    );
    assert.equal(
      boundDispatch.sessionId,
      requireDefined(
        journal.bridgeSessionBeforeOrphan,
        "orphaned bridge session",
      ).sessionId,
    );
    assert.ok(
      upstream.calls.some(
        (call) =>
          call.name === "easyeda_execute" &&
          call.dispatchLease?.leaseId === boundDispatch.leaseId,
      ),
    );

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /state unknown, not preflight-proven/u,
    );
    assert.equal(upstream.applyAttempts, 1);
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-no-mutation"),
      (error) => {
        const errorRecord = requireRecord(error, "recovery error");
        assert.equal(
          errorRecord["requiredRuntimeRestartConfirmation"],
          restartChallenge,
        );
        assert.equal(errorRecord["orphanedCallPhase"], "apply");
        return true;
      },
    );
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-no-mutation", {
        runtimeRestartConfirmation:
          "EASYEDA_RESTARTED_AND_RECONNECTED:wrong-operation",
      }),
      /runtimeRestartConfirmation/u,
    );
    upstream.restartRuntime();
    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-no-mutation",
      {
        runtimeRestartConfirmation: restartChallenge,
      },
    );
    assert.equal(recovered.state, "reconciled-no-mutation");
    assert.equal(recovered.orphanedCallPossible, false);
    assert.equal(recovered.orphanedCallPhase, "recovery-target-activation");
    const recoveredJournal = await artifacts.loadOperation(planned.operationId);
    const restartBoundary = requireDefined(
      recoveredJournal.runtimeRestartBoundary,
      "runtime restart boundary",
    );
    assert.equal(recoveredJournal.orphanedCallPossible, false);
    assert.equal(
      restartBoundary.confirmationSha256,
      sha256Text(restartChallenge),
    );
    assert.equal(
      restartBoundary.storedRuntimeFingerprintMatchedAfterReconnect,
      true,
    );
    assert.equal(
      requireDefined(
        restartBoundary.priorBridgeDispatch,
        "restart-boundary prior dispatch",
      ).sessionId,
      requireDefined(
        restartBoundary.priorBridgeSession,
        "restart-boundary prior session",
      ).sessionId,
    );
    assert.equal(
      requireDefined(
        restartBoundary.executionAuthorityTerminationProof,
        "restart-boundary termination proof",
      ).noPriorExecutionAuthorityRemains,
      true,
    );
    assert.ok(
      recoveredJournal.artifacts.some((artifact) =>
        artifact.path.includes("runtime-restart-boundary"),
      ),
    );
  });

  void test("rejects termination proof from a different process-tree policy", async () => {
    const upstream = new MockUpstream({
      applyError: applyTimeout(),
      executionTerminationPolicyIdOverride: "fixture.weaker-policy.v1",
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "changed-termination-policy"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-no-mutation", {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /exact prior process tree/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.orphanedCallPossible, true);
  });

  void test("verification failure hard-stops and blocks save until explicit rollback", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "verification-failure"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    upstream.state = "unexpected-live-state";

    await assert.rejects(
      engine.verify(planned.operationId),
      /Live verification failed|easyeda_control_exact_read failed/u,
    );
    const failed = await artifacts.loadOperation(planned.operationId);
    assert.equal(failed.state, "verification-failed");
    assert.equal(failed.hardStop, true);
    assert.match(failed.nextSafeAction, /Do not save/u);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /cannot save\/reopen from state verification-failed/u,
    );
    assert.equal(upstream.saveAttempts, 0);
    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /fresh exact readback could not prove the complete intended unsaved state/u,
    );
    assert.equal(upstream.rollbackAttempts, 0);
  });

  void test("rebinds a restarted target tab before no-mutation recovery reads", async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "restart-tab-rebind"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );
    const oldPlanHash = planned.planHash;
    upstream.activeTabId = "post-restart-tab";

    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-no-mutation",
      {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      },
    );
    assert.equal(recovered.state, "reconciled-no-mutation");
    assert.notEqual(recovered.planHash, oldPlanHash);
    assert.equal(upstream.recoveryActivationAttempts, 1);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(
      journal.plan.expectedContext.document.tabId,
      "post-restart-tab",
    );
    assert.equal(journal.context.document.tabId, "post-restart-tab");
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.equal(
      requireDefined(journal.runtimeRestartBoundary, "rebound restart boundary")
        .reboundTabId,
      "post-restart-tab",
    );
  });

  void test("rejects applied-unsaved classification after a restart/discard boundary", async () => {
    const upstream = new MockUpstream({
      applyError: applyTimeout(),
      applyMutatesBeforeError: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "restart-cannot-preserve-unsaved"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-applied-unsaved", {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /Applied-unsaved recovery is illegal after .* restart\/discard boundary/u,
    );
    assert.equal(upstream.recoveryActivationAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(journal.runtimeRestartChallenge, undefined);
  });

  void test("allows exact no-mutation recovery from saving before dispatch", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "saving-before-dispatch"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    const interrupted = await artifacts.loadOperation(planned.operationId);
    interrupted.state = "saving";
    interrupted.mutationState = "applied-unsaved";
    interrupted.orphanedCallPossible = false;
    interrupted.hardStop = true;
    await artifacts.updateOperation(interrupted);
    upstream.state = "baseline";
    upstream.activeTabId = "post-process-restart-tab";

    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-no-mutation",
    );
    assert.equal(recovered.state, "reconciled-no-mutation");
    assert.equal(recovered.mutationState, "none");
    assert.equal(upstream.recoveryActivationAttempts, 1);
  });

  void test("preserves the origin state when recovery target activation times out", async () => {
    const upstream = new MockUpstream({ recoveryActivationErrorsRemaining: 1 });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "activation-origin-state"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    const interrupted = await artifacts.loadOperation(planned.operationId);
    interrupted.state = "saving";
    interrupted.mutationState = "applied-unsaved";
    interrupted.orphanedCallPossible = false;
    await artifacts.updateOperation(interrupted);
    upstream.persistDatabase();

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-no-mutation"),
      /timed out/u,
    );
    const activationUnknown = await artifacts.loadOperation(
      planned.operationId,
    );
    assert.equal(activationUnknown.state, "recovery-target-activation-unknown");
    assert.equal(activationUnknown.recoveryActivationResumeState, "saving");
    assert.equal(activationUnknown.orphanedCallPossible, true);

    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-saved-reopened",
      {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
        confirmDiscardAnyUnsavedState: true,
      },
    );
    assert.equal(recovered.state, "completed");
    assert.equal(upstream.reopenAttempts, 1);
  });

  void test("rejects undeclared collateral changes outside the target primitive set", async () => {
    const upstream = new MockUpstream({ applyCollateral: true });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "undeclared-collateral"),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /changed one or more non-target component scalar records/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "verification-failed");
    assert.equal(journal.hardStop, true);
    assert.equal(upstream.state, "applied");
    assert.equal(upstream.collateralState, "changed");
  });

  void test("masks only explicitly declared direct-pad transform consequences", async () => {
    const upstream = new MockUpstream({ targetPadTransformChanges: true });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "declared-target-pad-transform", {
        targetChanges: [
          { primitiveId: "R1", pointer: "/x", before: 100, after: 200 },
          { primitiveId: "R1", pointer: "/pads/0/x", before: 101, after: 201 },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    const verified = await engine.verify(planned.operationId);
    assert.equal(verified.state, "live-verified");
    assert.equal(upstream.state, "applied");
  });

  void test("rejects undeclared orthogonal drift on a target-owned direct pad", async () => {
    const upstream = new MockUpstream({
      targetPadTransformChanges: true,
      targetPadDirectOrthogonalDrift: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "target-pad-orthogonal-drift", {
        targetChanges: [
          { primitiveId: "R1", pointer: "/x", before: 100, after: 200 },
          { primitiveId: "R1", pointer: "/pads/0/x", before: 101, after: 201 },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /changed the PCB primitive inventory or .*pad/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "verification-failed");
    assert.equal(journal.hardStop, true);
  });

  void test("rejects a direct-pad value that disagrees with its declared consequence", async () => {
    const upstream = new MockUpstream({
      targetPadTransformChanges: true,
      targetPadDirectDeclaredMismatch: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "target-pad-declaration-mismatch", {
        targetChanges: [
          { primitiveId: "R1", pointer: "/x", before: 100, after: 200 },
          { primitiveId: "R1", pointer: "/pads/0/x", before: 101, after: 201 },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /direct pad R1-pad-1\/x disagrees with its declared after consequence/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "verification-failed");
    assert.equal(journal.hardStop, true);
  });

  void test("does not mask target-owned pad lock drift when only the component lock changed", async () => {
    const upstream = new MockUpstream({
      lockOnlyTargetMutation: true,
      targetPadPrimitiveLockChanges: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "target-pad-lock-collateral", {
        targetChanges: [
          {
            primitiveId: "R1",
            pointer: "/primitiveLock",
            before: false,
            after: true,
          },
        ],
        verifyCalls: phaseReadSpecs(3),
        verifyAssertions: [
          {
            pointer: "/1/byPrimitiveId/R1/primitiveLock",
            op: "equals",
            value: true,
          },
        ],
        reopenedVerifyCalls: phaseReadSpecs(3),
        reopenedAssertions: [
          {
            pointer: "/1/byPrimitiveId/R1/primitiveLock",
            op: "equals",
            value: true,
          },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /changed the PCB primitive inventory or .*pad/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "verification-failed");
    assert.equal(journal.hardStop, true);
  });

  void test("normal save rejects a physical-only database rewrite", async () => {
    const upstream = new MockUpstream({ savePersistence: "physical-only" });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "physical-only-save"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /logical|checkpoint|durable|database/iu,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, "completed");
    assert.equal(journal.hardStop, true);
  });

  void test("normal save rejects pre-checkpoint corruption during the save call", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "checkpoint-corrupt-during-save"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    upstream.options.onSave = async (): Promise<void> => {
      const journal = await artifacts.loadOperation(planned.operationId);
      execFileSync("sqlite3", [
        requireDefined(journal.preCheckpoint.checkpoint, "pre-checkpoint path"),
        "UPDATE project_state SET value='tampered-checkpoint' WHERE id=1;",
      ]);
    };

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /checkpoint|durable|database/iu,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, "completed");
    assert.equal(journal.hardStop, true);
  });

  void test("normal save rejects durable drift during semantic validation", async () => {
    const upstream = new MockUpstream({
      onSemanticPersistenceValidation: (): void => {
        execFileSync("sqlite3", [
          source,
          "UPDATE project_state SET value='concurrent-save' WHERE id=1;",
        ]);
      },
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "semantic-validator-durable-race"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /database changed during semantic persistence validation/iu,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "final-checkpoint-failed");
    assert.equal(journal.finalCheckpoint, undefined);
    assert.equal(journal.hardStop, true);
  });

  void test("normal save rejects a semantic proof bound to another operation", async () => {
    const upstream = new MockUpstream({
      semanticPersistenceBindingOverride: digest("f"),
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "stale-semantic-proof"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /strict hash-bound proof/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "final-checkpoint-failed");
    assert.equal(journal.finalCheckpoint, undefined);
    assert.equal(journal.hardStop, true);
  });

  void test("rejects a complete but different runtime fingerprint before context or checkpoint", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "private-mismatch");
    const launcher = requireRecord(
      plan.expectedFingerprint["upstreamLauncher"],
      "plan upstream launcher",
    );
    const dependencyLock = requireRecord(
      launcher["dependencyLock"],
      "launcher dependency lock",
    );
    dependencyLock["sha256"] = digest("7");

    await assert.rejects(planWithDiscard(engine, plan), (error) => {
      const observedError = requireError(error);
      assert.match(observedError.message, /compatibility tuple/u);
      assert.deepEqual(
        requireRecord(error, "compatibility error")["mismatches"],
        [
          {
            pointer: "/upstream/launcher/dependencyLock/sha256",
            expected:
              loadReviewedCompatibilityManifest().upstream.launcher
                .dependencyLock.sha256,
            actual: digest("7"),
          },
        ],
      );
      return true;
    });
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("rejects private plans when an installed API or PCB bundle hash is unreviewed", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "private-bundle-mismatch");
    const bundles = requireRecord(
      plan.expectedFingerprint["installedBundles"],
      "plan installed bundles",
    );
    const publicApi = requireRecord(
      bundles["publicApi"],
      "plan public API bundle",
    );
    publicApi["declarationsSha256"] = digest("7");

    await assert.rejects(planWithDiscard(engine, plan), (error) => {
      const observedError = requireError(error);
      assert.match(observedError.message, /compatibility tuple/u);
      assert.deepEqual(
        requireRecord(error, "compatibility error")["mismatches"],
        [
          {
            pointer: "/installedBundles/publicApi/declarationsSha256",
            expected:
              "32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1",
            actual: digest("7"),
          },
        ],
      );
      return true;
    });
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  void test("allows only state-compatible recovery resolutions", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "recovery-transitions"),
    );

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-applied-unsaved"),
      /not legal from operation state preflight-proven/u,
    );
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened"),
      /not legal from operation state preflight-proven/u,
    );

    await engine.apply(planned.operationId, planned.planHash);
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened"),
      /not legal from operation state applied-unsaved/u,
    );
    const rolledBack = await engine.rollback(
      planned.operationId,
      planned.planHash,
    );
    assert.equal(rolledBack.state, "rolled-back");
  });

  void test("blocks recovery when the stored pre-checkpoint receipt is corrupt", async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "corrupt-pre-checkpoint"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );

    const journal = await artifacts.loadOperation(planned.operationId);
    const receipt = requireRecord(
      parseJson(await readFile(journal.preCheckpoint.receiptPath, "utf8")),
      "checkpoint receipt",
    );
    receipt["createdAt"] = "2000-01-01T00:00:00.000Z";
    await writeFile(
      journal.preCheckpoint.receiptPath,
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-no-mutation", {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /pre-checkpoint integrity could not be proved/u,
    );
    const unknownOperation = await artifacts.loadOperation(planned.operationId);
    assert.equal(unknownOperation.state, "unknown");
  });

  void test("cannot classify an apply timeout as saved and reopened", async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "false-saved-recovery"),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
      }),
      /unknown apply cannot be reconciled as saved\/reopened/u,
    );
    assert.equal(upstream.reopenAttempts, 0);
    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-no-mutation",
      {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      },
    );
    assert.equal(recovered.state, "reconciled-no-mutation");
  });

  void test("requires explicit discard confirmation before reopen-only saved recovery", async () => {
    const upstream = new MockUpstream({ saveError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "reopen-only-recovery"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/u,
    );
    const uncertain = await artifacts.loadOperation(planned.operationId);
    assert.equal(uncertain.state, "unknown");
    assert.equal(uncertain.unknownPhase, "save-reopen");
    assert.equal(uncertain.orphanedCallPossible, true);
    assert.equal(uncertain.orphanedCallPhase, "save-reopen");

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened"),
      /terminate EasyEDA Pro, restart it, reconnect the bridge/u,
    );
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /confirmDiscardAnyUnsavedState=true/u,
    );
    assert.equal(upstream.reopenAttempts, 0);

    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-saved-reopened",
      { confirmDiscardAnyUnsavedState: true },
    );
    assert.equal(recovered.state, "completed");
    assert.equal(recovered.saved, true);
    assert.equal(recovered.reopened, true);
    assert.equal(upstream.saveAttempts, 1);
    assert.equal(upstream.reopenAttempts, 1);
    const completed = await artifacts.loadOperation(planned.operationId);
    assert.equal(
      requireDefined(completed.finalCheckpoint, "completed final checkpoint")
        .schema,
      "easyeda-pro-control.checkpoint.v1",
    );
    const completedRecoveryArtifact = lastArtifact(completed);
    assert.match(
      completedRecoveryArtifact.path,
      /recovery-reconciled-saved-reopened-[a-f0-9-]{36}\.json$/u,
    );
    const recoveryArtifactText = await readFile(
      completedRecoveryArtifact.path,
      "utf8",
    );
    const recoveryArtifact = requireRecord(
      parseJson(recoveryArtifactText),
      "saved recovery artifact",
    );
    const recoveryPayload = recoveryArtifact;
    const recoveryResults = recoveryPayload["results"];
    assert.ok(Array.isArray(recoveryResults));
    const reopenedProofSnapshotSha256 = sha256Json(
      recoveryResults.map((candidate) => {
        const result = requireRecord(candidate, "saved recovery result");
        return {
          toolName: result["toolName"],
          payload: normalizeProofEnvelope(result["payload"]),
          assertions: result["assertions"],
        };
      }),
    );
    const completedFinalCheckpoint = requireDefined(
      completed.finalCheckpoint,
      "completed final checkpoint",
    );
    const observedDelta = {
      preCheckpointReceiptSha256: sha256Json(completed.preCheckpoint),
      finalCheckpointReceiptSha256: sha256Json(completedFinalCheckpoint),
      reopenedProofSnapshotSha256,
    };
    assert.deepEqual(
      requireRecord(
        recoveryPayload["semanticPersistenceProof"],
        "saved recovery semantic persistence proof",
      ),
      {
        ok: true,
        bindingSha256: sha256Json({
          schema: "easyeda-pro-control.semantic-persistence-binding.v1",
          operationId: completed.operationId,
          planHash: buildPlanHash(completed.plan),
          preCheckpointSha256: sha256Json(completed.preCheckpoint),
          finalCheckpointSha256: sha256Json(completedFinalCheckpoint),
          reopenedProofSnapshotSha256,
        }),
        policyId: "fixture.project-state-only.v1",
        policySha256: sha256Json({
          table: "project_state",
          operation: "single-row-update",
        }),
        observedDelta,
        observedDeltaSha256: sha256Json(observedDelta),
      },
    );
  });

  void test("saved recovery discards active editor changes before reopened verification", async () => {
    const upstream = new MockUpstream({ reopenState: "baseline" });
    const engine = new EasyedaControlEngine(upstream);
    const { planned, failed } = await reachSavedVerificationFailure(
      engine,
      upstream,
      "saved-active-editor-bypass",
    );
    const readsBeforeRecovery = upstream.readStateCalls;
    const eventsBeforeRecovery = upstream.events.length;

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened"),
      /confirmDiscardAnyUnsavedState=true/u,
    );
    assert.equal(upstream.reopenAttempts, 0);
    assert.equal(upstream.readStateCalls, readsBeforeRecovery);
    assert.equal(upstream.events.length, eventsBeforeRecovery);

    let dispatchJournal: OperationJournal | undefined;
    upstream.options.onReopen = async (): Promise<void> => {
      dispatchJournal = await artifacts.loadOperation(planned.operationId);
    };
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
      }),
      /assertion/iu,
    );
    const observedDispatchJournal = requireDefined(
      dispatchJournal,
      "recovery dispatch journal",
    );
    assert.equal(upstream.reopenAttempts, 1);
    assert.equal(upstream.state, "baseline");
    assert.match(observedDispatchJournal.state, /reopen.*dispatch/iu);
    assert.equal(observedDispatchJournal.hardStop, true);
    assert.equal(observedDispatchJournal.mutationMayHaveOccurred, true);
    const recoveryEvents = upstream.events.slice(eventsBeforeRecovery);
    assert.equal(recoveryEvents[0], "reopen-only:1");
    assert.match(
      requireDefined(recoveryEvents[1], "recovery read event"),
      /^read-state:\d+:baseline$/u,
    );

    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "recovery-verification-failed");
    assert.equal(journal.hardStop, true);
    assert.equal(journal.finalCheckpoint, undefined);
    const addedArtifacts = journal.artifacts.slice(failed.artifacts.length);
    assert.ok(addedArtifacts.length > 0);
    const recoveryArtifact = requireDefined(
      addedArtifacts[0],
      "recovery artifact",
    );
    const reopenText = await readFile(recoveryArtifact.path, "utf8");
    const reopenEvidence = requireRecord(
      parseJson(reopenText),
      "reopen evidence",
    );
    const reopenPayload = requireRecord(
      reopenEvidence["payload"],
      "reopen payload",
    );
    assert.deepEqual(
      {
        saved: reopenPayload["saved"],
        closed: reopenPayload["closed"],
        reopened: reopenPayload["reopened"],
      },
      { saved: false, closed: true, reopened: true },
    );
  });

  void test("saved recovery cannot complete without a semantic persistence validator", async () => {
    const upstream = new MockUpstream({ saveError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "saved-recovery-semantic-policy-required"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/u,
    );
    assert.equal(
      Reflect.set(engine, "semanticPersistenceValidator", undefined),
      true,
    );

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /semantic persistence-delta validator.*forbidden/iu,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, "recovery-verification-failed");
    assert.equal(journal.finalCheckpoint, undefined);
    assert.equal(journal.hardStop, true);
  });

  void test("saved recovery rejects a physical-only source rewrite", async () => {
    const upstream = new MockUpstream({
      savePersistence: "physical-only",
      saveError: applyTimeout(),
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "physical-only-recovery"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/u,
    );

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /logical|demonstrably changed|database/iu,
    );
    assert.equal(upstream.reopenAttempts, 0);
  });

  void test("saved recovery rejects a changed pre-checkpoint artifact", async () => {
    const upstream = new MockUpstream({ saveError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "corrupt-saved-recovery"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/u,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    execFileSync("sqlite3", [
      requireDefined(journal.preCheckpoint.checkpoint, "pre-checkpoint path"),
      "UPDATE project_state SET value='tampered-checkpoint' WHERE id=1;",
    ]);

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: await restartConfirmation(
          planned.operationId,
          upstream,
        ),
      }),
      /intact pre-checkpoint|checkpoint|integrity/iu,
    );
    assert.equal(upstream.reopenAttempts, 0);
  });

  void test("requires confirmation before repeating an uncertain recovery reopen", async () => {
    const upstream = new MockUpstream({
      saveError: applyTimeout(),
      reopenErrorsRemaining: 1,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, "repeat-recovery-reopen"),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/u,
    );
    const firstRestartChallenge = await restartConfirmation(
      planned.operationId,
      upstream,
    );
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: firstRestartChallenge,
      }),
      /timed out/u,
    );
    const retryUnknown = await artifacts.loadOperation(planned.operationId);
    assert.equal(retryUnknown.state, "recovery-reopen-unknown");
    assert.equal(retryUnknown.orphanedCallPossible, true);
    assert.equal(retryUnknown.orphanedCallPhase, "recovery-reopen");
    assert.equal(upstream.reopenAttempts, 1);
    const secondRestartChallenge = requireDefined(
      retryUnknown.runtimeRestartChallenge,
      "second runtime restart challenge",
    );
    assert.notEqual(secondRestartChallenge, firstRestartChallenge);

    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: firstRestartChallenge,
      }),
      /current nonce-bound runtimeRestartChallenge/u,
    );
    assert.equal(upstream.reopenAttempts, 1);

    upstream.restartRuntime();
    await assert.rejects(
      engine.recover(planned.operationId, "reconciled-saved-reopened", {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: secondRestartChallenge,
      }),
      /confirmRepeatAfterUnknownRecovery=true/u,
    );
    assert.equal(upstream.reopenAttempts, 1);

    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-saved-reopened",
      {
        confirmDiscardAnyUnsavedState: true,
        confirmRepeatAfterUnknownRecovery: true,
      },
    );
    assert.equal(recovered.state, "completed");
    assert.equal(upstream.reopenAttempts, 2);
  });

  void test("reuses a scope-owned dispatch while journaling before mutation and clearing on known return", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "scope-owned-known-return");
    const planningBinding = beginMockAuthenticatedScope(upstream);
    const planned = await planWithDiscard(engine, plan);
    endMockAuthenticatedScope(upstream, planningBinding);

    upstream.beginDispatchCalls = 0;
    upstream.endDispatchCalls = 0;
    upstream.abortDispatchCalls = 0;
    upstream.calls = [];
    const mutationJournal: JournalCapture = {};
    upstream.options.onApply = captureOperationOnReopen(
      planned.operationId,
      mutationJournal,
    );
    const applyBinding = beginMockAuthenticatedScope(upstream);
    const applied = await engine.apply(planned.operationId, planned.planHash);
    assert.equal(upstream.beginDispatchCalls, 1);
    assert.equal(upstream.endDispatchCalls, 0);
    assert.equal(upstream.abortDispatchCalls, 0);
    const journalAtMutation = requireDefined(
      mutationJournal.journal,
      "scope-owned mutation journal",
    );
    assert.equal(journalAtMutation.orphanedCallPossible, true);
    assert.equal(journalAtMutation.orphanedCallPhase, "apply");
    assert.deepEqual(journalAtMutation.bridgeDispatchBeforeOrphan, applyBinding);
    const scopeBoundApplyCalls = upstream.calls.filter(
      (call) => call.dispatchLease !== undefined,
    );
    assert.ok(scopeBoundApplyCalls.length > 0);
    assert.ok(
      scopeBoundApplyCalls.every(
        (call) => sha256Json(call.dispatchLease) === sha256Json(applyBinding),
      ),
    );
    endMockAuthenticatedScope(upstream, applyBinding);
    assert.equal(upstream.beginDispatchCalls, 1);
    assert.equal(upstream.endDispatchCalls, 1);
    assert.equal(upstream.abortDispatchCalls, 0);
    assert.equal(applied.state, "applied-unsaved");
    const knownReturnJournal = await artifacts.loadOperation(
      planned.operationId,
    );
    assert.equal(knownReturnJournal.orphanedCallPossible, false);
    assert.equal(knownReturnJournal.runtimeRestartChallenge, undefined);
  });

  void test("leaves scoped ambiguous mutation risk journaled and recovers under the replacement session scope", async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "scope-owned-ambiguous-recovery");
    const planningBinding = beginMockAuthenticatedScope(upstream);
    const planned = await planWithDiscard(engine, plan);
    endMockAuthenticatedScope(upstream, planningBinding);

    upstream.beginDispatchCalls = 0;
    upstream.endDispatchCalls = 0;
    upstream.abortDispatchCalls = 0;
    upstream.calls = [];
    const applyBinding = beginMockAuthenticatedScope(upstream);
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /timed out/u,
    );
    assert.equal(upstream.beginDispatchCalls, 1);
    assert.equal(upstream.endDispatchCalls, 0);
    assert.equal(upstream.abortDispatchCalls, 0);
    let ambiguousJournal = await artifacts.loadOperation(planned.operationId);
    assert.equal(ambiguousJournal.state, "unknown");
    assert.equal(ambiguousJournal.orphanedCallPossible, true);
    assert.equal(ambiguousJournal.orphanedCallPhase, "apply");
    assert.deepEqual(
      ambiguousJournal.bridgeDispatchBeforeOrphan,
      applyBinding,
    );
    abortMockAuthenticatedScope(upstream, applyBinding);
    assert.equal(upstream.abortDispatchCalls, 1);
    assert.notEqual(upstream.activeBridgeDispatch, null);

    const restartChallenge = requireDefined(
      ambiguousJournal.runtimeRestartChallenge,
      "scope-owned restart challenge",
    );
    upstream.restartRuntime();
    assert.equal(upstream.activeBridgeDispatch, null);
    upstream.beginDispatchCalls = 0;
    upstream.endDispatchCalls = 0;
    upstream.abortDispatchCalls = 0;
    upstream.calls = [];
    const recoveryBinding = beginMockAuthenticatedScope(upstream);
    const recovered = await engine.recover(
      planned.operationId,
      "reconciled-no-mutation",
      { runtimeRestartConfirmation: restartChallenge },
    );
    assert.equal(upstream.beginDispatchCalls, 1);
    assert.equal(upstream.endDispatchCalls, 0);
    assert.equal(upstream.abortDispatchCalls, 0);
    endMockAuthenticatedScope(upstream, recoveryBinding);
    assert.equal(upstream.beginDispatchCalls, 1);
    assert.equal(upstream.endDispatchCalls, 1);
    assert.equal(upstream.abortDispatchCalls, 0);
    assert.equal(recovered.state, "reconciled-no-mutation");
    ambiguousJournal = await artifacts.loadOperation(planned.operationId);
    assert.equal(ambiguousJournal.orphanedCallPossible, false);
    const scopeBoundRecoveryCalls = upstream.calls.filter(
      (call) => call.dispatchLease?.sessionId === recoveryBinding.sessionId,
    );
    assert.ok(scopeBoundRecoveryCalls.length > 0);
    assert.ok(
      scopeBoundRecoveryCalls.every(
        (call) =>
          sha256Json(call.dispatchLease) === sha256Json(recoveryBinding),
      ),
    );
  });

  void test("clears a scope-owned marker when the second pre-dispatch runtime proof fails", async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, "scope-owned-second-runtime-proof");
    const planningBinding = beginMockAuthenticatedScope(upstream);
    const planned = await planWithDiscard(engine, plan);
    endMockAuthenticatedScope(upstream, planningBinding);

    upstream.beginDispatchCalls = 0;
    upstream.endDispatchCalls = 0;
    upstream.abortDispatchCalls = 0;
    upstream.runtimeIdentityCalls = 0;
    upstream.options.runtimeIdentityInvalidAtCall = 2;
    const applyBinding = beginMockAuthenticatedScope(upstream);
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /runtime identity/u,
    );
    assert.equal(upstream.runtimeIdentityCalls, 2);
    assert.equal(upstream.applyAttempts, 0);
    assert.equal(upstream.beginDispatchCalls, 1);
    assert.equal(upstream.endDispatchCalls, 0);
    assert.equal(upstream.abortDispatchCalls, 0);
    endMockAuthenticatedScope(upstream, applyBinding);
    assert.equal(upstream.endDispatchCalls, 1);

    const failedProofJournal = await artifacts.loadOperation(
      planned.operationId,
    );
    assert.equal(failedProofJournal.orphanedCallPossible, false);
    assert.equal(failedProofJournal.runtimeRestartChallenge, undefined);
    assert.equal(await engine.assertBridgeDispatchAllowed(), true);
  });
});
