import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { once } from "node:events";
import { open, readFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { PassThrough, Readable, Writable } from "node:stream";
import { setTimeout as wait } from "node:timers/promises";

import {
  deserializeMessage,
  serializeMessage,
} from "@modelcontextprotocol/sdk/shared/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

import {
  assertSandboxProcessDescriptorBoundary,
  assertSandboxProcessTopology,
  captureBackendProcessAuthority,
} from "./backend-listener-authority.ts";
import type {
  BackendProcessAuthority,
  SandboxNamespaceIdentity,
} from "./backend-listener-authority.ts";
// oxlint-disable-next-line import/max-dependencies -- The private readiness marker is a separate security protocol from JSON-RPC and process authority.
import { UPSTREAM_SUPERVISOR_READY_LINE } from "./upstream-bootstrap.ts";

const STATUS_TIMEOUT_MS = 5000;
const EXEC_IDENTITY_TIMEOUT_MS = 5000;
const CLOSE_GRACE_MS = 2000;
const MAXIMUM_STATUS_BYTES = 16 * 1024;
const MAXIMUM_STATUS_LINE_BYTES = 4096;
const MAXIMUM_MCP_STDOUT_BUFFER_BYTES = 32 * 1024 * 1024;

interface InheritedSandboxDescriptor {
  readonly descriptor: number;
}

interface DisposableSandboxResource extends InheritedSandboxDescriptor {
  readonly dispose: () => Promise<void>;
}

export interface SandboxedStdioClientTransportOptions {
  readonly bootstrapFrame: Buffer;
  readonly childEnvironment: Readonly<Record<string, string>>;
  readonly dataDirectory: {
    readonly descriptor: number;
    readonly dispose: () => Promise<void>;
  };
  readonly graph: DisposableSandboxResource;
  readonly node: DisposableSandboxResource & {
    readonly handle: FileHandle;
  };
  readonly onBootstrapDelivered?: (
    authority: BackendProcessAuthority,
  ) => Promise<void>;
  readonly onChildPrepared?: (
    authority: BackendProcessAuthority,
  ) => Promise<void>;
  readonly sandbox: DisposableSandboxResource & {
    readonly executionPath: string;
  };
  readonly seccomp: DisposableSandboxResource;
  readonly supervisor: DisposableSandboxResource;
  readonly supervisorArguments: readonly string[];
  readonly beforeSpawn: () => Promise<void>;
  readonly afterChildReady: () => Promise<void>;
  readonly afterPreSpawnValidationForTesting:
    | (() => Promise<void>)
    | undefined;
  readonly beforePostReadyValidationForTesting:
    | (() => Promise<void>)
    | undefined;
}

export interface BubblewrapStatusState {
  childNamespaces: SandboxNamespaceIdentity | null;
  childPid: number | null;
  exitCode: number | null;
  totalBytes: number;
}

interface BubblewrapChildStatus {
  readonly namespaces: SandboxNamespaceIdentity;
  readonly pid: number;
}

export function classifySandboxStdoutLine(
  line: string,
  supervisorReady: boolean,
  protocolAdmitted: boolean,
): "protocol" | "ready" {
  if (!supervisorReady) {
    if (line !== UPSTREAM_SUPERVISOR_READY_LINE) {
      throw new Error(
        "The upstream emitted output before its exact supervisor readiness marker.",
      );
    }
    return "ready";
  }
  if (!protocolAdmitted) {
    throw new Error(
      "The upstream emitted output between supervisor readiness and protocol admission.",
    );
  }
  return "protocol";
}

const CHILD_STATUS_KEYS = new Set([
  "cgroup-namespace",
  "child-pid",
  "ipc-namespace",
  "mnt-namespace",
  "pid-namespace",
  "uts-namespace",
]);
const EXIT_STATUS_KEYS = new Set(["exit-code"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && typeof value === "number" && value > 0;
}

function requiredPositiveSafeInteger(value: unknown, label: string): number {
  if (!positiveSafeInteger(value)) {
    throw new Error(`Bubblewrap emitted an invalid ${label}.`);
  }
  return value;
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: ReadonlySet<string>,
): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.size && keys.every((key) => expected.has(key));
}

export function parseBubblewrapStatusLine(
  line: string,
  state: BubblewrapStatusState,
): number | undefined {
  const value: unknown = JSON.parse(line);
  if (!isRecord(value)) {
    throw new Error("Bubblewrap emitted a non-object status record.");
  }
  if (state.exitCode !== null) {
    throw new Error("Bubblewrap emitted status after its exit record.");
  }
  if (Object.hasOwn(value, "child-pid")) {
    if (
      !hasExactKeys(value, CHILD_STATUS_KEYS) ||
      state.childPid !== null ||
      state.exitCode !== null ||
      !positiveSafeInteger(value["child-pid"])
    ) {
      throw new Error("Bubblewrap emitted an invalid child status record.");
    }
    for (const key of CHILD_STATUS_KEYS) {
      if (!positiveSafeInteger(value[key])) {
        throw new Error("Bubblewrap emitted an invalid namespace identity.");
      }
    }
    const childPid = value["child-pid"];
    if (!positiveSafeInteger(childPid)) {
      throw new Error("Bubblewrap emitted an invalid child PID.");
    }
    state.childPid = childPid;
    state.childNamespaces = {
      cgroup: requiredPositiveSafeInteger(
        value["cgroup-namespace"],
        "cgroup namespace identity",
      ),
      ipc: requiredPositiveSafeInteger(
        value["ipc-namespace"],
        "IPC namespace identity",
      ),
      mnt: requiredPositiveSafeInteger(
        value["mnt-namespace"],
        "mount namespace identity",
      ),
      pid: requiredPositiveSafeInteger(
        value["pid-namespace"],
        "PID namespace identity",
      ),
      uts: requiredPositiveSafeInteger(
        value["uts-namespace"],
        "UTS namespace identity",
      ),
    };
    return childPid;
  }
  if (Object.hasOwn(value, "exit-code")) {
    const exitCode: unknown = value["exit-code"];
    if (
      !hasExactKeys(value, EXIT_STATUS_KEYS) ||
      state.childPid === null ||
      state.exitCode !== null ||
      typeof exitCode !== "number" ||
      !Number.isSafeInteger(exitCode) ||
      exitCode < 0 ||
      exitCode > 255
    ) {
      throw new Error("Bubblewrap emitted an invalid exit status record.");
    }
    state.exitCode = exitCode;
    return undefined;
  }
  throw new Error("Bubblewrap emitted an unknown status record.");
}

function requireReadable(
  value: Readable | Writable | null,
  label: string,
): Readable {
  if (!(value instanceof Readable)) {
    throw new Error(`${label} pipe is unavailable.`);
  }
  return value;
}

function requireWritable(
  value: Readable | Writable | null,
  label: string,
): Writable {
  if (!(value instanceof Writable)) {
    throw new Error(`${label} pipe is unavailable.`);
  }
  return value;
}

function sandboxNodeArguments(
  supervisorArguments: readonly string[],
): readonly string[] {
  return [
    "/runtime/node",
    "--disallow-code-generation-from-strings",
    "--jitless",
    "--permission",
    "--allow-fs-read=/runtime",
    "--allow-fs-read=/data",
    "--allow-fs-read=/dev/null",
    "--allow-fs-write=/data",
    "/runtime/upstream-supervisor.mjs",
    ...supervisorArguments,
  ];
}

export function bubblewrapArguments(
  environment: Readonly<Record<string, string>>,
  supervisorArguments: readonly string[],
): readonly string[] {
  if (Object.hasOwn(environment, "BRIDGE_TOKEN")) {
    throw new Error("The private bridge token must not enter bubblewrap argv.");
  }
  const environmentArguments = Object.entries(environment)
    .toSorted(([left], [right]) => left.localeCompare(right))
    .flatMap(([name, value]) => {
      if (
        !/^[A-Z][A-Z0-9_]*$/u.test(name) ||
        name.includes("\0") ||
        value.includes("\0")
      ) {
        throw new Error("Sandbox child environment is malformed.");
      }
      return ["--setenv", name, value];
    });
  return [
    "--unshare-all",
    // Bubblewrap 0.11.2 requires the explicit option before --disable-userns,
    // Explicit user-namespace selection is required despite --unshare-all.
    "--unshare-user",
    "--unshare-pid",
    "--share-net",
    "--as-pid-1",
    "--die-with-parent",
    "--new-session",
    "--disable-userns",
    "--cap-drop",
    "ALL",
    "--clearenv",
    ...environmentArguments,
    "--dir",
    "/runtime",
    "--dir",
    "/usr",
    "--ro-bind",
    "/usr/lib",
    "/usr/lib",
    "--symlink",
    "lib",
    "/usr/lib64",
    "--symlink",
    "usr/lib",
    "/lib",
    "--dir",
    "/lib64",
    // The reviewed x64 Node binary names this ELF interpreter.
    // Arch exposes it in /usr/lib; Debian/Ubuntu use a multiarch target.
    // Bind the host-resolved loader at the ABI path.
    "--ro-bind",
    "/lib64/ld-linux-x86-64.so.2",
    "/lib64/ld-linux-x86-64.so.2",
    "--dir",
    "/dev",
    "--dev-bind",
    "/dev/null",
    "/dev/null",
    "--tmpfs",
    "/tmp",
    "--bind-fd",
    "3",
    "/data",
    "--perms",
    "0400",
    "--ro-bind-data",
    "4",
    "/runtime/graph.json",
    "--perms",
    "0400",
    "--ro-bind-data",
    "5",
    "/runtime/upstream-supervisor.mjs",
    "--json-status-fd",
    "6",
    "--ro-bind-fd",
    "7",
    "/runtime/node",
    "--seccomp",
    "9",
    "--block-fd",
    "8",
    "--chdir",
    "/data",
    "--",
    ...sandboxNodeArguments(supervisorArguments),
  ];
}

export async function writeComplete(
  stream: Writable,
  bytes: Buffer,
): Promise<void> {
  const completion = Promise.withResolvers<null>();
  const onError = (error: Error): void => {
    completion.reject(error);
  };
  stream.once("error", onError);
  try {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable.write's callback is the API's exact buffer-consumption boundary; drain/backpressure is not completion.
    stream.write(bytes, (error: Error | null | undefined) => {
      stream.off("error", onError);
      if (error === null || error === undefined) {
        completion.resolve(null);
      } else {
        completion.reject(error);
      }
    });
  } catch (error) {
    stream.off("error", onError);
    completion.reject(error);
  }
  await completion.promise;
}

export async function deliverSandboxBootstrap(
  stream: Writable,
  bootstrapFrame: Buffer,
  prepareAuthority: () => Promise<void>,
): Promise<void> {
  try {
    await prepareAuthority();
    await writeComplete(stream, bootstrapFrame);
  } finally {
    bootstrapFrame.fill(0);
  }
}

function waitForProcessClose(
  closed: Promise<unknown>,
  graceMs: number,
): Promise<boolean> {
  const observedClose = (async (): Promise<boolean> => {
    await closed;
    return true;
  })();
  return Promise.race([
    observedClose,
    wait(graceMs, false, { ref: false }),
  ]);
}

export async function closeSandboxProcess(
  child: ChildProcess,
  closed: Promise<unknown>,
  graceMs = CLOSE_GRACE_MS,
): Promise<void> {
  if (!Number.isSafeInteger(graceMs) || graceMs <= 0) {
    throw new Error("Sandbox close grace must be a positive integer.");
  }
  child.stdin?.end();
  if (await waitForProcessClose(closed, graceMs)) {
    return;
  }
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
    if (await waitForProcessClose(closed, graceMs)) {
      return;
    }
  }
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
  }
  if (!(await waitForProcessClose(closed, graceMs))) {
    // The reviewed production topology forbids child_process/Worker creation,
    // Bubblewrap --die-with-parent owns the single sandbox Node child.
    // A descriptor held after this bound therefore violates that topology.
    // Report incomplete cleanup instead of claiming a reap that did not occur.
    throw new Error("Bubblewrap did not reach its close/reap boundary.");
  }
}

export async function waitForSandboxNodeIdentity(
  authority: BackendProcessAuthority,
  nodeHandle: FileHandle,
  expectedCommandLine: readonly string[],
  childClosed: Promise<unknown>,
): Promise<void> {
  let childHasClosed = false;
  const closedBeforeIdentity = (async (): Promise<never> => {
    await childClosed;
    childHasClosed = true;
    throw new Error(
      "The sandbox child closed before exact reviewed Node identity admission.",
    );
  })();
  const whileChildOpen = <Value>(operation: Promise<Value>): Promise<Value> =>
    Promise.race([operation, closedBeforeIdentity]);
  const expectedNode = await whileChildOpen(
    nodeHandle.stat({ bigint: true }),
  );
  const deadline = Date.now() + EXEC_IDENTITY_TIMEOUT_MS;
  let lastError: unknown;
  while (Date.now() < deadline) {
    let executable: FileHandle | undefined;
    try {
      const currentAuthority = await whileChildOpen(
        captureBackendProcessAuthority(authority.pid),
      );
      if (currentAuthority.startTimeTicks !== authority.startTimeTicks) {
        throw new Error("Sandbox child PID changed before Node admission.");
      }
      executable = await whileChildOpen(
        open(`/proc/${authority.pid}/exe`, fsConstants.O_RDONLY),
      );
      const actualNode = await executable.stat({ bigint: true });
      const commandLineBytes = await whileChildOpen(
        readFile(`/proc/${authority.pid}/cmdline`),
      );
      const commandLine = commandLineBytes
        .toString("utf8")
        .split("\0")
        .filter((part) => part.length > 0);
      if (
        actualNode.dev === expectedNode.dev &&
        actualNode.ino === expectedNode.ino &&
        JSON.stringify(commandLine) === JSON.stringify(expectedCommandLine)
      ) {
        if (childHasClosed) {
          await closedBeforeIdentity;
        }
        return;
      }
      lastError = new Error(
        "Sandbox child has not entered the reviewed Node command yet.",
      );
    } catch (error) {
      lastError = error;
    } finally {
      await executable?.close();
    }
    await whileChildOpen(wait(10, undefined, { ref: false }));
  }
  throw new Error(
    "Bubblewrap child did not become the exact reviewed Node command before the admission deadline.",
    { cause: lastError },
  );
}

export class SandboxedStdioClientTransport implements Transport {
  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public onmessage?: (message: JSONRPCMessage) => void;

  private readonly options: SandboxedStdioClientTransportOptions;
  private readonly stderrStream = new PassThrough();
  private child: ChildProcess | undefined;
  private childClosed: Promise<unknown> | undefined;
  private childPid: number | null = null;
  private closeNotified = false;
  private readonly disposedInheritedResources = new Set<number>();
  private protocolFailed = false;
  private protocolAdmitted = false;
  private started = false;
  private stdoutBufferedBytes = 0;
  private stdoutChunks: Buffer[] = [];
  private startupBlocker: Writable | undefined;
  private supervisorReady = false;
  private readonly supervisorReadySignal = Promise.withResolvers<true>();

  public constructor(options: SandboxedStdioClientTransportOptions) {
    this.options = options;
    // Admission awaits this later, after PID identity capture. Observe early
    // Rejection now so malformed immediate stdout cannot become unhandled.
    // oxlint-disable-next-line promise/prefer-await-to-then -- An immediate rejection observer must be attached synchronously in the constructor.
    void this.supervisorReadySignal.promise.catch(() => null);
  }

  public get stderr(): PassThrough {
    return this.stderrStream;
  }

  public get pid(): number | null {
    return this.childPid;
  }

  private notifyClose(): void {
    if (!this.closeNotified) {
      this.closeNotified = true;
      this.onclose?.();
    }
  }

  private reportError(error: unknown): void {
    this.onerror?.(
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  private async closeInheritedResources(): Promise<void> {
    const resources = [
      this.options.dataDirectory,
      this.options.graph,
      this.options.node,
      this.options.sandbox,
      this.options.seccomp,
      this.options.supervisor,
    ];
    const pending = resources
      .map((resource, index) => ({ index, resource }))
      .filter(({ index }) => !this.disposedInheritedResources.has(index));
    const results = await Promise.allSettled(
      pending.map(({ resource }) => resource.dispose()),
    );
    const failures: unknown[] = [];
    for (const [resultIndex, result] of results.entries()) {
      if (result.status === "rejected") {
        failures.push(result.reason);
      } else {
        const pendingResource = pending[resultIndex];
        if (pendingResource !== undefined) {
          this.disposedInheritedResources.add(pendingResource.index);
        }
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(
        failures,
        "Sandbox inherited descriptor cleanup was incomplete.",
      );
    }
  }

  private async failProtocol(error: unknown): Promise<void> {
    if (this.protocolFailed) {
      return;
    }
    this.protocolFailed = true;
    this.stdoutBufferedBytes = 0;
    this.stdoutChunks = [];
    const normalized =
      error instanceof Error ? error : new Error(String(error));
    if (!this.supervisorReady) {
      this.supervisorReadySignal.reject(normalized);
    }
    this.reportError(normalized);
    const child = this.child;
    if (child !== undefined) {
      try {
        const childClosed = this.childClosed;
        if (childClosed === undefined) {
          throw new Error("Sandbox child close tracking is unavailable.");
        }
        await closeSandboxProcess(child, childClosed);
      } catch (cleanupError) {
        this.reportError(cleanupError);
      }
    }
  }

  private processStdoutChunk(chunk: Buffer): void {
    if (this.protocolFailed) {
      return;
    }
    try {
      let offset = 0;
      while (offset < chunk.length) {
        if (this.supervisorReady && !this.protocolAdmitted) {
          throw new Error(
            "The upstream emitted output between supervisor readiness and protocol admission.",
          );
        }
        const newline = chunk.indexOf(0x0A, offset);
        if (newline === -1) {
          this.appendStdoutSegment(chunk.subarray(offset));
          return;
        }
        this.appendStdoutSegment(chunk.subarray(offset, newline));
        const line = Buffer.concat(
          this.stdoutChunks,
          this.stdoutBufferedBytes,
        ).toString("utf8");
        this.stdoutBufferedBytes = 0;
        this.stdoutChunks = [];
        const kind = classifySandboxStdoutLine(
          line,
          this.supervisorReady,
          this.protocolAdmitted,
        );
        if (kind === "ready") {
          this.supervisorReady = true;
          this.supervisorReadySignal.resolve(true);
        } else {
          this.onmessage?.(deserializeMessage(line));
        }
        offset = newline + 1;
      }
    } catch (error) {
      void this.failProtocol(error);
    }
  }

  private appendStdoutSegment(segment: Buffer): void {
    if (segment.length === 0) {
      return;
    }
    this.stdoutBufferedBytes += segment.length;
    if (this.stdoutBufferedBytes > MAXIMUM_MCP_STDOUT_BUFFER_BYTES) {
      throw new Error("Upstream MCP stdout frame exceeded its byte limit.");
    }
    this.stdoutChunks.push(segment);
  }

  private monitorStatus(
    stream: Readable,
  ): Promise<BubblewrapChildStatus> {
    const ready = Promise.withResolvers<BubblewrapChildStatus>();
    // Spawn identity is captured before admission awaits the status promise.
    // This observer prevents synchronous status failure from going unhandled.
    // oxlint-disable-next-line promise/prefer-await-to-then -- The observer must be attached before event handlers can reject the deferred promise.
    void ready.promise.catch(() => null);
    const state: BubblewrapStatusState = {
      childNamespaces: null,
      childPid: null,
      exitCode: null,
      totalBytes: 0,
    };
    let buffered = Buffer.alloc(0);
    let settled = false;
    const fail = (error: unknown): void => {
      const normalized =
        error instanceof Error ? error : new Error(String(error));
      if (settled) {
        void this.failProtocol(normalized);
      } else {
        settled = true;
        ready.reject(normalized);
        this.reportError(normalized);
      }
    };
    stream.on("data", (chunk: Buffer) => {
      try {
        state.totalBytes += chunk.length;
        if (state.totalBytes > MAXIMUM_STATUS_BYTES) {
          throw new Error("Bubblewrap status exceeded its byte limit.");
        }
        buffered = Buffer.concat([buffered, chunk]);
        while (true) {
          const newline = buffered.indexOf(0x0A);
          if (newline === -1) {
            if (buffered.length > MAXIMUM_STATUS_LINE_BYTES) {
              throw new Error("Bubblewrap status line exceeded its byte limit.");
            }
            break;
          }
          const lineBytes = buffered.subarray(0, newline);
          buffered = buffered.subarray(newline + 1);
          if (
            lineBytes.length === 0 ||
            lineBytes.length > MAXIMUM_STATUS_LINE_BYTES
          ) {
            throw new Error("Bubblewrap emitted an invalid status line length.");
          }
          const childPid = parseBubblewrapStatusLine(
            lineBytes.toString("utf8"),
            state,
          );
          if (childPid !== undefined && !settled) {
            const namespaces = state.childNamespaces;
            if (namespaces === null) {
              throw new Error("Bubblewrap omitted child namespace identity.");
            }
            settled = true;
            ready.resolve({ namespaces, pid: childPid });
          }
        }
      } catch (error) {
        fail(error);
      }
    });
    stream.once("error", fail);
    stream.once("end", () => {
      if (buffered.length > 0) {
        fail(new Error("Bubblewrap status ended with an incomplete record."));
      } else if (state.childPid === null) {
        fail(new Error("Bubblewrap exited before reporting its child PID."));
      } else if (state.exitCode === null) {
        fail(
          new Error("Bubblewrap status ended without an exit record."),
        );
      }
    });
    return ready.promise;
  }

  public async start(): Promise<void> {
    if (this.started) {
      throw new Error("Sandboxed stdio transport already started.");
    }
    this.started = true;
    const childArguments = sandboxNodeArguments(
      this.options.supervisorArguments,
    );
    try {
      await this.options.beforeSpawn();
      await this.options.afterPreSpawnValidationForTesting?.();
      const child = spawn(
        this.options.sandbox.executionPath,
        bubblewrapArguments(
          this.options.childEnvironment,
          this.options.supervisorArguments,
        ),
        {
          cwd: "/",
          env: {
            LANG: "C.UTF-8",
            LC_ALL: "C.UTF-8",
            PATH: "/usr/bin:/bin",
          },
          shell: false,
          stdio: [
            "pipe",
            "pipe",
            "pipe",
            this.options.dataDirectory.descriptor,
            this.options.graph.descriptor,
            this.options.supervisor.descriptor,
            "pipe",
            this.options.node.descriptor,
            "pipe",
            this.options.seccomp.descriptor,
          ],
          windowsHide: true,
        },
      );
      this.child = child;
      const childClose = Promise.withResolvers<null>();
      this.childClosed = childClose.promise;
      child.once("close", () => {
        childClose.resolve(null);
        this.child = undefined;
        this.childPid = null;
        this.notifyClose();
      });
      const stdout = child.stdout;
      const stderr = child.stderr;
      if (stdout === null || stderr === null || child.stdin === null) {
        throw new Error("Bubblewrap stdio pipes are unavailable.");
      }
      stdout.on("data", (chunk: Buffer) => {
        this.processStdoutChunk(chunk);
      });
      stdout.on("error", (error: Error) => {
        this.reportError(error);
      });
      stdout.once("end", () => {
        if (this.stdoutBufferedBytes > 0) {
          void this.failProtocol(
            new Error("Upstream MCP stdout ended with an incomplete frame."),
          );
        }
      });
      stderr.pipe(this.stderrStream);
      stderr.on("error", (error: Error) => {
        this.reportError(error);
      });
      child.on("error", (error: Error) => {
        this.reportError(error);
      });
      const inheritedStdio = child.stdio as readonly (
        | Readable
        | Writable
        | null
        | undefined
      )[];
      const status = requireReadable(
        inheritedStdio[6] ?? null,
        "Bubblewrap status",
      );
      const blocker = requireWritable(
        inheritedStdio[8] ?? null,
        "Bubblewrap startup block",
      );
      this.startupBlocker = blocker;
      const childPidPromise = this.monitorStatus(status);
      await once(child, "spawn");
      const monitorPid = child.pid;
      if (monitorPid === undefined) {
        throw new Error("Bubblewrap monitor PID is unavailable after spawn.");
      }
      const monitorAuthority = await captureBackendProcessAuthority(monitorPid);
      const childStatus = await Promise.race([
        childPidPromise,
        wait(STATUS_TIMEOUT_MS, undefined, { ref: false }).then(() => {
          throw new Error("Bubblewrap did not report its child PID in time.");
        }),
      ]);
      const childPid = childStatus.pid;
      const authority = await captureBackendProcessAuthority(childPid);
      await assertSandboxProcessTopology(
        authority,
        monitorAuthority,
        childStatus.namespaces,
      );
      await writeComplete(blocker, Buffer.from([1]));
      blocker.end();
      this.startupBlocker = undefined;
      await waitForSandboxNodeIdentity(
        authority,
        this.options.node.handle,
        childArguments,
        childClose.promise,
      );
      await Promise.race([
        this.supervisorReadySignal.promise,
        childClose.promise.then(() => {
          throw new Error(
            "The sandbox child closed before supervisor readiness.",
          );
        }),
        wait(STATUS_TIMEOUT_MS, undefined, { ref: false }).then(() => {
          throw new Error(
            "The sandbox supervisor did not report readiness in time.",
          );
        }),
      ]);
      if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error("Bubblewrap monitor exited before sandbox admission.");
      }
      await this.options.beforePostReadyValidationForTesting?.();
      await assertSandboxProcessTopology(
        authority,
        monitorAuthority,
        childStatus.namespaces,
      );
      await assertSandboxProcessDescriptorBoundary(authority);
      await this.options.afterChildReady();
      if (this.protocolFailed) {
        throw new Error("The sandbox status or protocol failed during admission.");
      }
      this.childPid = childPid;
      await deliverSandboxBootstrap(
        child.stdin,
        this.options.bootstrapFrame,
        async (): Promise<void> => {
          await this.options.onChildPrepared?.(authority);
          await assertSandboxProcessTopology(
            authority,
            monitorAuthority,
            childStatus.namespaces,
          );
          if (this.protocolFailed) {
            throw new Error(
              "The sandbox protocol failed before bootstrap delivery.",
            );
          }
          await assertSandboxProcessDescriptorBoundary(authority);
          await this.options.afterChildReady();
          await this.closeInheritedResources();
          if (this.protocolFailed) {
            throw new Error("The sandbox protocol failed before bootstrap write.");
          }
        },
      );
      await this.options.onBootstrapDelivered?.(authority);
      if (this.protocolFailed) {
        throw new Error("The sandbox protocol failed before authority admission.");
      }
      this.protocolAdmitted = true;
    } catch (error) {
      this.options.bootstrapFrame.fill(0);
      const failures: unknown[] = [error];
      this.startupBlocker?.destroy();
      this.startupBlocker = undefined;
      await this.closeInheritedResources().catch((cleanupError: unknown) => {
        failures.push(cleanupError);
      });
      if (this.child !== undefined) {
        const childClosed = this.childClosed;
        if (childClosed === undefined) {
          failures.push(new Error("Sandbox child close tracking is unavailable."));
        } else {
          await closeSandboxProcess(this.child, childClosed).catch(
            (cleanupError: unknown) => {
              failures.push(cleanupError);
            },
          );
        }
      }
      if (failures.length > 1) {
        throw new AggregateError(
          failures,
          "Sandboxed upstream startup and cleanup both failed.",
          { cause: error },
        );
      }
      throw error;
    }
  }

  public async close(): Promise<void> {
    this.options.bootstrapFrame.fill(0);
    this.startupBlocker?.destroy();
    this.startupBlocker = undefined;
    const child = this.child;
    const childClosed = this.childClosed;
    const failures: unknown[] = [];
    await this.closeInheritedResources().catch((error: unknown) => {
      failures.push(error);
    });
    if (child !== undefined) {
      if (childClosed === undefined) {
        failures.push(new Error("Sandbox child close tracking is unavailable."));
      } else {
        await closeSandboxProcess(child, childClosed).catch((error: unknown) => {
          failures.push(error);
        });
      }
    }
    if (failures.length === 0) {
      this.child = undefined;
      this.childPid = null;
    }
    this.stdoutBufferedBytes = 0;
    this.stdoutChunks = [];
    this.notifyClose();
    if (failures.length > 0) {
      throw new AggregateError(
        failures,
        "Sandboxed upstream shutdown was incomplete.",
      );
    }
  }

  public async send(message: JSONRPCMessage): Promise<void> {
    const stdin = this.child?.stdin;
    if (stdin === null || stdin === undefined) {
      throw new Error("Sandboxed stdio transport is not connected.");
    }
    await writeComplete(stdin, Buffer.from(serializeMessage(message), "utf8"));
  }
}
