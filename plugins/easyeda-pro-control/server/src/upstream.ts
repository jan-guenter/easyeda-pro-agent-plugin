import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import type {
  CallToolResult,
  Implementation,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";

import {
  AuthenticatedBridgeGateway,
  allocatePrivateLoopbackPort,
} from "./authenticated-bridge-gateway.ts";
import { loadAuthenticatedBridgeBuildIdentity } from "./authenticated-bridge-build-identity.ts";
import type {
  AuthenticatedBridgeSessionLifecycle,
  BridgeDispatchAbortOutcome,
  BridgeDispatchAbortResult,
  BridgeDispatchLeaseBinding,
  ClosedAuthenticatedBridgeSession,
} from "./authenticated-bridge-gateway.ts";
import type { BackendProcessAuthority } from "./backend-listener-authority.ts";
import type { ControlRootCapability } from "./control-root.ts";
import {
  configuredBridgeAuthenticationKey,
  prepareBoundUpstreamEnvironment,
} from "./upstream-environment.ts";
import {
  assertPathSealsCurrent,
  captureLauncherAdmission,
  captureLauncherFingerprint,
  captureRuntimeLauncherExecution,
  launcherFingerprintSha256,
  openReviewedNodeExecutable,
  openReviewedSandboxExecutable,
} from "./upstream-trust.ts";
import type { LauncherAdmission } from "./upstream-trust.ts";
import { encodeBridgeBootstrapSecret } from "./upstream-bootstrap.ts";
import { serializeCapturedUpstreamModuleGraph } from "./upstream-module-execution.ts";
import { stagePrivateRuntimePayload } from "./private-runtime-payload.ts";
import { SandboxedStdioClientTransport } from "./sandboxed-stdio-client-transport.ts";
import { stageReviewedSupervisorExecution } from "./supervisor-execution.ts";
import { createReviewedUpstreamSeccompProgram } from "./upstream-seccomp.ts";
import type { UpstreamLauncherFingerprint } from "./core.ts";

export type UpstreamToolResult = CallToolResult;

interface AuthenticatedBridgeDispatchScopeState {
  ambiguousCall: boolean;
  attemptedCallCount: number;
  readonly binding: BridgeDispatchLeaseBinding;
  closed: boolean;
  inFlightCallCount: number;
}

type AuthenticatedBridgeDispatchScopeOutcome<Result> =
  | { readonly ok: false; readonly error: unknown }
  | { readonly ok: true; readonly value: Result };

export interface UpstreamEasyedaClientOptions {
  readonly afterPreSpawnValidationForTesting?: () => Promise<void>;
  readonly beforePostReadyValidationForTesting?: () => Promise<void>;
  readonly bridgePublicPortForTesting?: number;
  readonly controlRoot?: ControlRootCapability;
  readonly onChildStarted?: (
    pid: number,
    authority: BackendProcessAuthority,
  ) => Promise<void>;
  readonly trustedLauncher?: UpstreamLauncherFingerprint;
}

interface InstalledBundleFingerprint {
  available: true;
  assetsRoot: string;
  pcbEditor: {
    version: string;
    implementationPath: string;
    implementationSha256: string;
  };
  publicApi: {
    version: string;
    implementationPath: string;
    implementationSha256: string;
    adapterPath: string;
    adapterSha256: string;
    declarationsPath: string;
    declarationsSha256: string;
  };
}

export function startupFailureWithStderr(
  error: unknown,
  diagnosticBytes: number,
  diagnosticSha256: string,
): unknown {
  return diagnosticBytes === 0
    ? error
    : new Error(
        `EasyEDA upstream emitted ${String(diagnosticBytes)} private diagnostic bytes (SHA-256 ${diagnosticSha256}); content is withheld.`,
        { cause: error },
      );
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  const source: AsyncIterable<unknown> = createReadStream(path);
  for await (const chunk of source) {
    if (typeof chunk !== "string" && !Buffer.isBuffer(chunk)) {
      throw new TypeError("File hashing received a non-binary stream chunk.");
    }
    hash.update(chunk);
  }
  return hash.digest("hex");
}

function requireVersionSegment(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    !/^[a-z0-9][a-z0-9._-]{2,80}$/iu.test(value)
  ) {
    throw new Error(
      `${label} must be configured as a filename-safe installed version.`,
    );
  }
  return value;
}

function disconnectedLifecycleBoundarySha256(
  lifecycle: AuthenticatedBridgeSessionLifecycle,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        gatewayInstanceId: lifecycle.gatewayInstanceId,
        publicEndpoint: lifecycle.publicEndpoint,
        recentClosedSessions: lifecycle.recentClosedSessions,
        schema: lifecycle.schema,
      }),
      "utf8",
    )
    .digest("hex");
}

function assertDisconnectedLifecycleBoundary(
  gateway: AuthenticatedBridgeGateway,
  expectedSha256: string,
): void {
  const lifecycle = gateway.lifecycle();
  if (
    lifecycle.activeSession !== null ||
    disconnectedLifecycleBoundarySha256(lifecycle) !== expectedSha256
  ) {
    throw new Error(
      "The authenticated bridge session changed across an unbound disconnected call boundary.",
    );
  }
}

function frozenDispatchBindingCopy(
  binding: BridgeDispatchLeaseBinding,
): BridgeDispatchLeaseBinding {
  return Object.freeze({ ...binding });
}

async function prepareAuthenticatedBridgeGateway(
  testingPublicPort: number | undefined,
  controlRoot: ControlRootCapability,
): Promise<{
  readonly backendPort: number;
  readonly backendSessionToken: string;
  readonly gateway: AuthenticatedBridgeGateway;
}> {
  const authenticationKey = await configuredBridgeAuthenticationKey(
    controlRoot,
  );
  const authenticatedBuildIdentity =
    await loadAuthenticatedBridgeBuildIdentity(authenticationKey, controlRoot);
  const publicHost = process.env["EASYEDA_BRIDGE_HOST"] ?? "127.0.0.1";
  if (publicHost !== "127.0.0.1") {
    throw new Error("The authenticated EasyEDA bridge must bind IPv4 loopback.");
  }
  const configuredPublicPort = Number(
    process.env["EASYEDA_BRIDGE_PORT"] ?? "49621",
  );
  const publicPort = testingPublicPort ?? configuredPublicPort;
  if (
    !Number.isSafeInteger(publicPort) ||
    publicPort < 0 ||
    publicPort > 65_535 ||
    (testingPublicPort === undefined && publicPort !== 49_621)
  ) {
    throw new Error(
      "The production authenticated bridge endpoint is exactly 127.0.0.1:49621.",
    );
  }
  const configuredScan = process.env["EASYEDA_BRIDGE_PORT_SCAN"] ?? "49621";
  if (testingPublicPort === undefined && configuredScan !== "49621") {
    throw new Error("Authenticated bridge adjacent-port scanning is prohibited.");
  }
  const maximumPayloadBytes = Number(
    process.env["EASYEDA_BRIDGE_MAX_PAYLOAD_SIZE"] ?? "10485760",
  );
  const backendPort = await allocatePrivateLoopbackPort();
  const backendSessionToken = randomBytes(48).toString("base64url");
  return {
    backendPort,
    backendSessionToken,
    gateway: new AuthenticatedBridgeGateway({
      authenticationKey,
      backendHost: "127.0.0.1",
      backendPort,
      backendSessionToken,
      expectedAuthenticatedIndexBuildId:
        authenticatedBuildIdentity.authenticatedIndexBuildId,
      expectedAuthenticationKeySha256:
        authenticatedBuildIdentity.authenticationKeySha256,
      maximumPayloadBytes,
      publicHost: "127.0.0.1",
      publicPort,
    }),
  };
}

export class UpstreamEasyedaClient {
  private readonly options: UpstreamEasyedaClientOptions;
  private readonly authenticatedBridgeDispatchScope =
    new AsyncLocalStorage<AuthenticatedBridgeDispatchScopeState>();
  private client: Client | null = null;
  private transport: SandboxedStdioClientTransport | null = null;
  private connectPromise: Promise<Client> | null = null;
  private tools: Tool[] | null = null;
  private stderrBytes = 0;
  private stderrDigest = createHash("sha256");
  private startupLauncherAdmission: LauncherAdmission | null = null;
  private bridgeGateway: AuthenticatedBridgeGateway | null = null;
  private fatalStartupCleanupFailure: AggregateError | null = null;
  private closed = false;
  private closePromise: Promise<void> | null = null;

  public constructor(options: UpstreamEasyedaClientOptions = {}) {
    this.options = options;
  }

  public async connect(): Promise<Client> {
    if (this.closed) {
      throw new Error("The EasyEDA upstream client is closed.");
    }
    if (this.fatalStartupCleanupFailure !== null) {
      throw new Error(
        "The EasyEDA upstream client is quarantined after incomplete startup cleanup.",
        { cause: this.fatalStartupCleanupFailure },
      );
    }
    if (this.client) {
      return this.client;
    }
    if (this.transport !== null || this.bridgeGateway !== null) {
      throw new Error(
        "The prior EasyEDA upstream generation has incomplete cleanup; call close() before retrying.",
      );
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }
    this.connectPromise = this.#connect();
    try {
      const client = await this.connectPromise;
      if (this.closed) {
        throw new Error("The EasyEDA upstream client closed during startup.");
      }
      return client;
    } finally {
      this.connectPromise = null;
    }
  }

  async #connect(): Promise<Client> {
    this.stderrBytes = 0;
    this.stderrDigest = createHash("sha256");
    const controlRoot = this.options.controlRoot;
    if (controlRoot === undefined) {
      throw new Error(
        "A retained control-root capability is required to start the upstream sandbox.",
      );
    }
    const launcherAdmission = await captureLauncherAdmission(
      this.options.trustedLauncher,
    );
    const startupLauncherFingerprint = launcherAdmission.fingerprint;
    const launcherCapture = await captureRuntimeLauncherExecution(
      startupLauncherFingerprint,
      startupLauncherFingerprint.command,
      startupLauncherFingerprint.cwd,
      startupLauncherFingerprint.entrypoint,
    );
    const bridge = await prepareAuthenticatedBridgeGateway(
      this.options.bridgePublicPortForTesting,
      controlRoot,
    );
    const preparedEnvironment = await prepareBoundUpstreamEnvironment(
      startupLauncherFingerprint.command,
      {
        host: "127.0.0.1",
        port: bridge.backendPort,
        sessionToken: bridge.backendSessionToken,
      },
      controlRoot,
    );
    const configuredBootstrapToken =
      preparedEnvironment.environment["BRIDGE_TOKEN"];
    if (configuredBootstrapToken === undefined) {
      await preparedEnvironment.dataDirectory.handle.close();
      throw new Error("The private upstream bridge bootstrap token is unavailable.");
    }
    Reflect.deleteProperty(
      preparedEnvironment.environment,
      "BRIDGE_TOKEN",
    );
    const preparedSandbox = await (async (): Promise<{
      readonly bootstrapFrame: Buffer;
      readonly graphPayload: Awaited<ReturnType<typeof stagePrivateRuntimePayload>>;
      readonly nodeExecution: Awaited<ReturnType<typeof openReviewedNodeExecutable>>;
      readonly sandboxExecution: Awaited<ReturnType<typeof openReviewedSandboxExecutable>>;
      readonly seccompPayload: Awaited<ReturnType<typeof stagePrivateRuntimePayload>>;
      readonly supervisorExecution: Awaited<ReturnType<typeof stageReviewedSupervisorExecution>>;
    }> => {
      let bootstrapFrame: Buffer | undefined;
      let graphPayload: Awaited<ReturnType<typeof stagePrivateRuntimePayload>> | undefined;
      let seccompPayload: Awaited<ReturnType<typeof stagePrivateRuntimePayload>> | undefined;
      let supervisorExecution: Awaited<ReturnType<typeof stageReviewedSupervisorExecution>> | undefined;
      let sandboxExecution: Awaited<ReturnType<typeof openReviewedSandboxExecutable>> | undefined;
      let nodeExecution: Awaited<ReturnType<typeof openReviewedNodeExecutable>> | undefined;
      try {
        bootstrapFrame = encodeBridgeBootstrapSecret(configuredBootstrapToken);
        const graphBytes = serializeCapturedUpstreamModuleGraph(
          launcherCapture.moduleGraph,
        );
        graphPayload = await stagePrivateRuntimePayload(
          graphBytes,
          preparedEnvironment.dataDirectory.handle,
        );
        seccompPayload = await stagePrivateRuntimePayload(
          createReviewedUpstreamSeccompProgram(),
          preparedEnvironment.dataDirectory.handle,
        );
        supervisorExecution = await stageReviewedSupervisorExecution(
          preparedEnvironment.dataDirectory.handle,
        );
        sandboxExecution = await openReviewedSandboxExecutable(
          startupLauncherFingerprint.sandbox,
        );
        nodeExecution = await openReviewedNodeExecutable(
          startupLauncherFingerprint.command,
          startupLauncherFingerprint.commandSha256,
        );
        return {
          bootstrapFrame,
          graphPayload,
          nodeExecution,
          sandboxExecution,
          seccompPayload,
          supervisorExecution,
        };
      } catch (error) {
        // A staging AggregateError means cleanup may already have failed.
        // Authority which was never returned cannot be retried in this scope.
        // Preserve that fault even when every returned resource closes.
        const nestedCleanupFailure =
          error instanceof AggregateError ? error : null;
        bootstrapFrame?.fill(0);
        const cleanupErrors: unknown[] = [];
        for (const resource of [
          graphPayload,
          seccompPayload,
          supervisorExecution,
          sandboxExecution,
          nodeExecution,
        ]) {
          await resource?.dispose().catch((cleanupError: unknown) => {
            cleanupErrors.push(cleanupError);
          });
        }
        await preparedEnvironment.dataDirectory.handle
          .close()
          .catch((cleanupError: unknown) => {
            cleanupErrors.push(cleanupError);
          });
        if (cleanupErrors.length > 0) {
          const cleanupFailure = new AggregateError(
            [error, ...cleanupErrors],
            "Upstream sandbox preparation and cleanup both failed.",
            { cause: error },
          );
          this.fatalStartupCleanupFailure = cleanupFailure;
          throw cleanupFailure;
        }
        if (nestedCleanupFailure !== null) {
          this.fatalStartupCleanupFailure = nestedCleanupFailure;
        }
        throw error;
      }
    })();
    const {
      bootstrapFrame,
      graphPayload,
      nodeExecution,
      sandboxExecution,
      seccompPayload,
      supervisorExecution,
    } = preparedSandbox;
    let dataDirectoryClosed = false;
    const dataDirectoryResource = {
      descriptor: preparedEnvironment.dataDirectory.handle.fd,
      dispose: async (): Promise<void> => {
        if (!dataDirectoryClosed) {
          await preparedEnvironment.dataDirectory.handle.close();
          dataDirectoryClosed = true;
        }
      },
    };
    const assertSandboxInputsCurrent = async (): Promise<void> => {
      await Promise.all([
        controlRoot.assertCurrent(),
        preparedEnvironment.assertCurrent(),
        assertPathSealsCurrent(
          launcherCapture.seals,
          "between graph capture and sandbox admission",
        ),
        graphPayload.assertCurrent(),
        supervisorExecution.assertCurrent(),
        sandboxExecution.assertCurrent(),
        seccompPayload.assertCurrent(),
        nodeExecution.assertCurrent(),
      ]);
    };
    const transport = new SandboxedStdioClientTransport({
      afterPreSpawnValidationForTesting:
        this.options.afterPreSpawnValidationForTesting,
      afterChildReady: assertSandboxInputsCurrent,
      beforeSpawn: assertSandboxInputsCurrent,
      beforePostReadyValidationForTesting:
        this.options.beforePostReadyValidationForTesting,
      bootstrapFrame,
      childEnvironment: preparedEnvironment.environment,
      dataDirectory: dataDirectoryResource,
      graph: graphPayload,
      node: nodeExecution,
      onBootstrapDelivered: (authority): Promise<void> => {
        bridge.gateway.bindBackendAuthority(authority);
        return Promise.resolve();
      },
      onChildPrepared: async (authority): Promise<void> => {
        await this.options.onChildStarted?.(authority.pid, authority);
      },
      sandbox: sandboxExecution,
      seccomp: seccompPayload,
      supervisor: supervisorExecution,
      supervisorArguments: [
        String(launcherCapture.moduleGraph.fingerprint.moduleCount),
        String(launcherCapture.moduleGraph.fingerprint.edgeCount),
        String(launcherCapture.moduleGraph.fingerprint.totalBytes),
        launcherCapture.moduleGraph.fingerprint.sha256,
        graphPayload.sha256,
        String(graphPayload.bytes),
        supervisorExecution.sha256,
        String(supervisorExecution.bytes),
        String(preparedEnvironment.dataDirectory.info.dev),
        String(preparedEnvironment.dataDirectory.info.ino),
        String(bridge.backendPort),
      ],
    });
    try {
      await bridge.gateway.start();
      this.bridgeGateway = bridge.gateway;
    } catch (error) {
      const cleanupErrors: unknown[] = [];
      await transport.close().catch((cleanupError: unknown) => {
        this.transport = transport;
        cleanupErrors.push(cleanupError);
      });
      await bridge.gateway.close().catch((cleanupError: unknown) => {
        this.bridgeGateway = bridge.gateway;
        cleanupErrors.push(cleanupError);
      });
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [error, ...cleanupErrors],
          "Authenticated gateway startup failed and sandbox cleanup was incomplete.",
          { cause: error },
        );
      }
      throw error;
    }
    transport.stderr.on("data", (chunk: unknown) => {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      this.stderrBytes = Math.min(
        Number.MAX_SAFE_INTEGER,
        this.stderrBytes + bytes.length,
      );
      this.stderrDigest.update(bytes);
    });
    const client = new Client(
      { name: "easyeda-pro-control-upstream", version: "0.3.0" },
      { capabilities: {} },
    );
    try {
      await client.connect(transport);
    } catch (error) {
      const startupError = startupFailureWithStderr(
        error,
        this.stderrBytes,
        this.stderrDigest.copy().digest("hex"),
      );
      this.stderrBytes = 0;
      this.stderrDigest = createHash("sha256");
      const cleanupErrors: unknown[] = [];
      let clientClosed = true;
      let transportClosed = true;
      let gatewayClosed = true;
      await client.close().catch((cleanupError: unknown) => {
        clientClosed = false;
        this.client = client;
        cleanupErrors.push(cleanupError);
      });
      await transport.close().catch((cleanupError: unknown) => {
        transportClosed = false;
        this.transport = transport;
        cleanupErrors.push(cleanupError);
      });
      await bridge.gateway.close().catch((cleanupError: unknown) => {
        gatewayClosed = false;
        this.bridgeGateway = bridge.gateway;
        cleanupErrors.push(cleanupError);
      });
      if (clientClosed && this.client === client) {
        this.client = null;
      }
      if (transportClosed && this.transport === transport) {
        this.transport = null;
      }
      if (gatewayClosed && this.bridgeGateway === bridge.gateway) {
        this.bridgeGateway = null;
      }
      this.startupLauncherAdmission = null;
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [startupError, ...cleanupErrors],
          "EasyEDA upstream startup failed and private execution cleanup was incomplete.",
          { cause: error },
        );
      }
      throw startupError;
    }
    this.stderrBytes = 0;
    this.stderrDigest = createHash("sha256");
    this.startupLauncherAdmission = launcherAdmission;
    this.client = client;
    this.transport = transport;
    return client;
  }

  public async listTools(force = false): Promise<Tool[]> {
    const client = await this.connect();
    await this.assertStartupAuthorityCurrent();
    if (!force && this.tools) {
      return this.tools;
    }
    const response = await client.listTools();
    this.tools = Array.isArray(response.tools) ? response.tools : [];
    return this.tools;
  }

  public async findTool(name: string): Promise<Tool | undefined> {
    const tools = await this.listTools();
    return tools.find((tool) => tool.name === name);
  }

  public async callTool(
    name: string,
    args: Record<string, unknown> | undefined,
    timeoutMs = 70_000,
    dispatchLease?: BridgeDispatchLeaseBinding,
  ): Promise<UpstreamToolResult> {
    const scope = this.authenticatedBridgeDispatchScope.getStore();
    if (scope?.closed === true) {
      throw new Error(
        "The authenticated bridge dispatch scope already settled.",
      );
    }
    const client = await this.connect();
    await this.assertStartupAuthorityCurrent();
    const gateway = this.bridgeGateway;
    if (gateway === null) {
      throw new Error("The authenticated bridge gateway is unavailable.");
    }
    let effectiveBinding = dispatchLease;
    let disconnectedBoundarySha256: string | undefined;
    if (scope !== undefined) {
      effectiveBinding ??= scope.binding;
    } else if (dispatchLease === undefined) {
      const lifecycle = gateway.lifecycle();
      if (lifecycle.activeSession !== null) {
        throw new Error(
          "An active authenticated bridge session requires a dispatch scope or its exact binding.",
        );
      }
      disconnectedBoundarySha256 =
        disconnectedLifecycleBoundarySha256(lifecycle);
    }
    gateway.assertDispatchLeaseForCall(effectiveBinding);
    if (disconnectedBoundarySha256 !== undefined) {
      assertDisconnectedLifecycleBoundary(gateway, disconnectedBoundarySha256);
    }
    if (scope !== undefined) {
      scope.attemptedCallCount += 1;
      scope.inFlightCallCount += 1;
    }
    let knownReturn = false;
    try {
      const result = await client.callTool(
        { name, arguments: args ?? {} },
        CallToolResultSchema,
        { timeout: timeoutMs, maxTotalTimeout: timeoutMs },
      );
      knownReturn = true;
      if (disconnectedBoundarySha256 !== undefined) {
        assertDisconnectedLifecycleBoundary(gateway, disconnectedBoundarySha256);
      }
      return CallToolResultSchema.parse(result);
    } catch (error) {
      if (scope !== undefined && !knownReturn) {
        scope.ambiguousCall = true;
      }
      throw error;
    } finally {
      if (scope !== undefined) {
        scope.inFlightCallCount -= 1;
      }
    }
  }

  // AsyncLocalStorage.run requires one callback boundary so every descendant
  // Descendant callTool invocations inherit the exact authenticated session authority.
  // oxlint-disable promise/prefer-await-to-callbacks
  public async withAuthenticatedBridgeDispatchScope<Result>(
    callback: (
      binding: BridgeDispatchLeaseBinding,
    ) => PromiseLike<Result> | Result,
  ): Promise<Result> {
    if (this.authenticatedBridgeDispatchScope.getStore() !== undefined) {
      throw new Error(
        "Nested authenticated bridge dispatch scopes are prohibited.",
      );
    }
    await this.connect();
    const gateway = this.bridgeGateway;
    if (gateway === null) {
      throw new Error("The authenticated bridge gateway is unavailable.");
    }
    const lifecycle = gateway.lifecycle();
    const activeSession = lifecycle.activeSession;
    if (activeSession === null) {
      throw new Error(
        "An authenticated bridge dispatch scope requires an active proxying session.",
      );
    }
    const binding = gateway.beginDispatchLease(
      lifecycle.gatewayInstanceId,
      activeSession.sessionId,
    );
    const scope: AuthenticatedBridgeDispatchScopeState = {
      ambiguousCall: false,
      attemptedCallCount: 0,
      binding,
      closed: false,
      inFlightCallCount: 0,
    };
    let outcome: AuthenticatedBridgeDispatchScopeOutcome<Result>;
    try {
      const value = await this.authenticatedBridgeDispatchScope.run(
        scope,
        () => callback(frozenDispatchBindingCopy(binding)),
      );
      outcome = { ok: true, value };
    } catch (error) {
      outcome = { error, ok: false };
    }
    scope.closed = true;
    if (scope.inFlightCallCount > 0) {
      scope.ambiguousCall = true;
      if (outcome.ok) {
        outcome = {
          error: new Error(
            "The authenticated bridge dispatch scope completed with an upstream call still in flight.",
          ),
          ok: false,
        };
      }
    }
    try {
      if (scope.ambiguousCall) {
        gateway.abortDispatchLease(
          binding,
          "ambiguous-after-dispatch",
        );
      } else if (scope.attemptedCallCount === 0) {
        gateway.abortDispatchLease(binding, "not-dispatched");
      } else {
        gateway.endDispatchLease(binding);
      }
    } catch (settlementError) {
      if (!outcome.ok) {
        throw new AggregateError(
          [outcome.error, settlementError],
          "The authenticated bridge dispatch scope and lease settlement both failed.",
          { cause: settlementError },
        );
      }
      throw settlementError;
    }
    if (!outcome.ok) {
      throw outcome.error;
    }
    return outcome.value;
  }
  // oxlint-enable promise/prefer-await-to-callbacks

  public currentAuthenticatedBridgeDispatchBinding():
    | BridgeDispatchLeaseBinding
    | undefined {
    const scope = this.authenticatedBridgeDispatchScope.getStore();
    return scope === undefined || scope.closed
      ? undefined
      : frozenDispatchBindingCopy(scope.binding);
  }

  public serverInfo(): Implementation | undefined {
    return this.client?.getServerVersion?.() ?? undefined;
  }

  public instructions(): string | undefined {
    return this.client?.getInstructions?.() ?? undefined;
  }

  public async launcherFingerprint(): Promise<UpstreamLauncherFingerprint> {
    const capture = await captureLauncherFingerprint();
    return capture.fingerprint;
  }

  public async launcherState(): Promise<{
    startup: UpstreamLauncherFingerprint;
    current: UpstreamLauncherFingerprint;
    startupSha256: string;
    currentSha256: string;
    drift: boolean;
  }> {
    if (!this.startupLauncherAdmission) {
      await this.connect();
    }
    const startupAdmission = this.startupLauncherAdmission;
    if (!startupAdmission) {
      throw new Error(
        "The connected upstream has no startup launcher fingerprint.",
      );
    }
    const startup = startupAdmission.fingerprint;
    const current = await this.launcherFingerprint();
    const startupSha256 = launcherFingerprintSha256(startup);
    const currentSha256 = launcherFingerprintSha256(current);
    return {
      startup,
      current,
      startupSha256,
      currentSha256,
      drift: startupSha256 !== currentSha256,
    };
  }

  public async installedEasyedaBundles(): Promise<InstalledBundleFingerprint> {
    const assetsRoot = resolve(
      process.env["EASYEDA_ASSETS_ROOT"] ??
        "/mnt/c/Program Files/easyeda-pro/resources/app/assets",
    );
    const pcbVersion = requireVersionSegment(
      process.env["EASYEDA_PCB_BUNDLE_VERSION"],
      "EASYEDA_PCB_BUNDLE_VERSION",
    );
    const apiVersion = requireVersionSegment(
      process.env["EASYEDA_PUBLIC_API_BUNDLE_VERSION"],
      "EASYEDA_PUBLIC_API_BUNDLE_VERSION",
    );
    const pcbImplementation = join(
      assetsRoot,
      "pro-pcb",
      pcbVersion,
      "js",
      "pcb.js",
    );
    const apiImplementation = join(assetsRoot, "pro-api", apiVersion, "api.js");
    const apiAdapter = join(assetsRoot, "pro-api", apiVersion, "api-types.js");
    const apiDeclarations = join(
      assetsRoot,
      "pro-api",
      apiVersion,
      "api-types.d.ts",
    );
    for (const path of [
      pcbImplementation,
      apiImplementation,
      apiAdapter,
      apiDeclarations,
    ]) {
      const info = await stat(path);
      if (!info.isFile()) {
        throw new Error(
          `Installed EasyEDA bundle file is unavailable: ${path}`,
        );
      }
    }
    const [
      pcbImplementationSha256,
      apiImplementationSha256,
      apiAdapterSha256,
      apiDeclarationsSha256,
    ] = await Promise.all([
      sha256File(pcbImplementation),
      sha256File(apiImplementation),
      sha256File(apiAdapter),
      sha256File(apiDeclarations),
    ]);
    return {
      available: true,
      assetsRoot,
      pcbEditor: {
        version: pcbVersion,
        implementationPath: pcbImplementation,
        implementationSha256: pcbImplementationSha256,
      },
      publicApi: {
        version: apiVersion,
        implementationPath: apiImplementation,
        implementationSha256: apiImplementationSha256,
        adapterPath: apiAdapter,
        adapterSha256: apiAdapterSha256,
        declarationsPath: apiDeclarations,
        declarationsSha256: apiDeclarationsSha256,
      },
    };
  }

  private async closeResources(): Promise<void> {
    this.closed = true;
    const pendingConnect = this.connectPromise;
    if (pendingConnect !== null) {
      // The original connect caller observes its startup error.
      // Shutdown waits to prevent publication, then closes retained state.
      await pendingConnect.catch(() => null);
    }
    const client = this.client;
    this.tools = null;
    const gateway = this.bridgeGateway;
    const transport = this.transport;
    const failures: unknown[] = [];
    if (this.fatalStartupCleanupFailure !== null) {
      failures.push(this.fatalStartupCleanupFailure);
    }
    if (gateway !== null) {
      try {
        await gateway.close();
        if (this.bridgeGateway === gateway) {
          this.bridgeGateway = null;
        }
      } catch (error) {
        failures.push(error);
      }
    }
    if (client !== null) {
      try {
        await client.close();
        if (this.client === client) {
          this.client = null;
        }
      } catch (error) {
        failures.push(error);
      }
    }
    if (transport !== null) {
      try {
        await transport.close();
        if (this.transport === transport) {
          this.transport = null;
        }
      } catch (error) {
        failures.push(error);
      }
    }
    this.startupLauncherAdmission = null;
    this.stderrBytes = 0;
    this.stderrDigest = createHash("sha256");
    if (failures.length > 0) {
      throw new AggregateError(
        failures,
        "EasyEDA upstream shutdown was incomplete.",
      );
    }
  }

  public async close(): Promise<void> {
    if (this.closePromise !== null) {
      return this.closePromise;
    }
    const closing = this.closeResources();
    this.closePromise = closing;
    try {
      await closing;
    } finally {
      if (this.closePromise === closing) {
        this.closePromise = null;
      }
    }
  }

  public bridgeSessionLifecycle():
    | AuthenticatedBridgeSessionLifecycle
    | undefined {
    return this.bridgeGateway?.lifecycle();
  }

  public closedAuthenticatedBridgeSession(
    sessionId: string,
  ): ClosedAuthenticatedBridgeSession | undefined {
    return this.bridgeGateway?.closedSession(sessionId);
  }

  public beginAuthenticatedBridgeDispatch(
    expectedGatewayInstanceId: string,
    expectedSessionId: string,
  ): BridgeDispatchLeaseBinding {
    const gateway = this.bridgeGateway;
    if (gateway === null) {
      throw new Error("The authenticated bridge gateway is unavailable.");
    }
    return gateway.beginDispatchLease(
      expectedGatewayInstanceId,
      expectedSessionId,
    );
  }

  public endAuthenticatedBridgeDispatch(
    binding: BridgeDispatchLeaseBinding,
  ): void {
    const gateway = this.bridgeGateway;
    if (gateway === null) {
      throw new Error("The authenticated bridge gateway is unavailable.");
    }
    gateway.endDispatchLease(binding);
  }

  public abortAuthenticatedBridgeDispatch(
    binding: BridgeDispatchLeaseBinding,
    outcome: BridgeDispatchAbortOutcome,
  ): BridgeDispatchAbortResult {
    const gateway = this.bridgeGateway;
    if (gateway === null) {
      throw new Error("The authenticated bridge gateway is unavailable.");
    }
    return gateway.abortDispatchLease(binding, outcome);
  }

  private async assertStartupAuthorityCurrent(): Promise<void> {
    if (!this.startupLauncherAdmission || !this.options.controlRoot) {
      throw new Error(
        "The connected upstream has no retained sandbox authority.",
      );
    }
    await this.options.controlRoot.assertCurrent();
  }
}
