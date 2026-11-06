import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { join, win32 } from "node:path";
import { z } from "zod";
import { deriveWindowsRuntimePaths } from "./windows-runtime.ts";

export const CLOSED_GENERATED_FIXTURE_HELPER_SHA256 = "cd39dd22a32813674643778a3adc7ccb3e86347cca5ce36d53d894f905f55e2d";
const sha = z.string().regex(/^[a-f0-9]{64}$/u);
export const generatedWindowsPath = z.string().min(20).max(1024).regex(/^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*CodexEasyedaFixture_[a-f0-9]{32}\\Codex_(?:via_only|line_and_via|arc_line_and_via|schematic)_[a-f0-9]{16}\.eprj2$/u);
export const generatedPadWindowsPath = z.string().min(20).max(1024).regex(/^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*CodexEasyedaFixture_[a-f0-9]{32}\\Codex_circular_smt_pad_[a-f0-9]{16}\.eprj2$/u);
export const generatedSchematicRelevanceWindowsPath = z.string().min(20).max(1024).regex(/^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*CodexEasyedaFixture_[a-f0-9]{32}\\Codex_schematic_relevance_[a-f0-9]{16}\.eprj2$/u);
const alternativeWindowsPath = z.union([generatedPadWindowsPath, generatedSchematicRelevanceWindowsPath]);
const supportedWindowsPath = z.union([generatedWindowsPath, alternativeWindowsPath]);
const nativeObservationFields = z.object({
  leaseId: z.string().regex(/^[a-f0-9]{32}$/u), windowsPath: generatedWindowsPath,
  parentDirectory: z.string().min(8).max(1024), directoryIdentity: z.string().regex(/^[a-f0-9]{8}:[a-f0-9]{16}$/u),
  fileIdentity: z.string().regex(/^[a-f0-9]{8}:[a-f0-9]{16}$/u), sha256: sha, bytes: z.number().int().min(512).max(67_108_864),
  createdEpochMs: z.number().int().positive(), modifiedEpochMs: z.number().int().positive(), watchState: z.enum(["pending", "cancelled-no-changes"]),
  privateDirectoryOwnerVerified: z.literal(true), readOnlyFileLease: z.literal(true), oldRuntimeAdopted: z.literal(false),
}).strict();
const nativeObservation = nativeObservationFields.refine(value => value.parentDirectory === win32.dirname(value.windowsPath));
const fileObservation = z.object({
  schema: z.literal("easyeda-pro-control.closed-generated-file-lease.v1"), nonce: sha, state: z.enum(["held", "released"]), observation: nativeObservation,
  requestId: z.number().int().min(1).max(16).optional(), originalHandlesClosed: z.boolean(), filesDeleted: z.literal(false),
}).strict();
export const closedGeneratedFixtureFileObservationSchema = fileObservation.refine(value => value.originalHandlesClosed === (value.state === "released") && value.observation.watchState === (value.state === "held" ? "pending" : "cancelled-no-changes"));
/** New fixed data profiles retain the released v1 path/schema unchanged. */
export const closedGeneratedAlternativeFileObservationSchema = fileObservation.extend({
  schema: z.literal("easyeda-pro-control.closed-generated-alternative-file-lease.v1"),
  observation: nativeObservationFields.extend({ windowsPath: alternativeWindowsPath }).refine(value => value.parentDirectory === win32.dirname(value.windowsPath)),
}).refine(value => value.originalHandlesClosed === (value.state === "released") && value.observation.watchState === (value.state === "held" ? "pending" : "cancelled-no-changes"));
const supportedObservation = z.union([closedGeneratedFixtureFileObservationSchema, closedGeneratedAlternativeFileObservationSchema]);
export type ClosedGeneratedFixtureFileObservation = z.infer<typeof supportedObservation>;
export interface ClosedGeneratedFixtureFileOptions {
  readonly pluginRoot: string; readonly assetsRoot: string; readonly nonce: string; readonly windowsPath: string; readonly expectedSha256: string; readonly expectedBytes: number;
}
/** Offline regression seam, never a registered tool dependency. */
export interface ClosedGeneratedFixtureFileDependencies {
  readonly spawnProcess?: (executable: string, args: readonly string[]) => ChildProcessWithoutNullStreams;
  readonly verifyHelper?: (path: string) => Promise<void>;
}
async function verifyHelper(path: string): Promise<void> {
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size < 1n || before.size > 65_536n || await realpath(path) !== path) { throw new Error("Closed generated file lease helper path differs from its source profile."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Refuse symlinks and substituted FIFOs on the reviewed helper descriptor.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const opened = await file.stat({ bigint: true }); const storage = Buffer.alloc(Number(before.size) + 1); let consumed = 0;
    while (consumed < storage.length) {
      const read = await file.read(storage, consumed, storage.length - consumed, consumed);
      if (read.bytesRead === 0) { break; } consumed += read.bytesRead;
    }
    const bytes = storage.subarray(0, consumed);
    const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    for (const item of [opened, after, named]) {
      if (!item.isFile() || item.dev !== before.dev || item.ino !== before.ino || item.size !== before.size || item.mtimeNs !== before.mtimeNs || item.ctimeNs !== before.ctimeNs) { throw new Error("Closed generated file lease helper changed during admission."); }
    }
    if (BigInt(bytes.length) !== before.size || await realpath(path) !== path || createHash("sha256").update(bytes).digest("hex") !== CLOSED_GENERATED_FIXTURE_HELPER_SHA256) { throw new Error("Closed generated file lease helper bytes differ from its source profile."); }
  } finally { await file.close(); }
}


/** Fresh read-only Windows handles and original transport only. Never launches,
 * adopts or closes an application, writes SQLite, changes paths or deletes data.
 * Allocate before awaiting initialize(); a lost reply still requires original EOF. */
export class ClosedGeneratedFixtureFileOwner {
  private child: ChildProcessWithoutNullStreams | undefined;
  private initializationAttempted = false;
  private releaseAttempted = false;
  private transportClosed = false;
  private current: ClosedGeneratedFixtureFileObservation | undefined;
  private sequence = 0;
  private buffer = "";
  private outputBytes = 0;
  private pending: { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | undefined;
  private closed: Promise<{ code: number | null; signal: NodeJS.Signals | null }> | undefined;
  private failed: Error | undefined;
  private readonly options: ClosedGeneratedFixtureFileOptions;
  private readonly dependencies: ClosedGeneratedFixtureFileDependencies;
  public constructor(options: ClosedGeneratedFixtureFileOptions, dependencies: ClosedGeneratedFixtureFileDependencies = {}) {
    this.options = Object.freeze({ ...options }); this.dependencies = Object.freeze({ ...dependencies });
    z.string().regex(/^[a-f0-9]{64}$/u).parse(options.nonce); supportedWindowsPath.parse(options.windowsPath);
    sha.parse(options.expectedSha256); z.number().int().min(512).max(67_108_864).parse(options.expectedBytes);
  }
  private fail(error: Error): void {
    this.failed ??= error;
    if (this.pending !== undefined) { clearTimeout(this.pending.timer); this.pending.reject(error); this.pending = undefined; }
  }
  private next(): Promise<unknown> {
    if (this.failed !== undefined) { return Promise.reject(this.failed); }
    if (this.pending !== undefined) { return Promise.reject(new Error("Closed generated file lease already has an outstanding request.")); }
    // oxlint-disable-next-line promise/avoid-new -- Bridge original stream events to one bounded outstanding protocol response.
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.fail(new Error("Original closed generated file lease helper did not settle; retain ownership and release without retry.")); }, 30_000);
      this.pending = { resolve, reject, timer };
    });
  }
  private accept(raw: unknown, requestId?: number, state: "held" | "released" = "held"): ClosedGeneratedFixtureFileObservation {
    try { const value = supportedObservation.parse(raw); const previous = this.current;
    const previousData = previous?.observation;
    const { watchState: _watch, ...data } = value.observation;
    const previousRest = previousData === undefined ? undefined : { ...previousData, watchState: undefined };
    const comparable = { ...data, watchState: undefined };
    if (value.schema !== (generatedWindowsPath.safeParse(this.options.windowsPath).success ? "easyeda-pro-control.closed-generated-file-lease.v1" : "easyeda-pro-control.closed-generated-alternative-file-lease.v1") || value.nonce !== this.options.nonce || value.requestId !== requestId || value.state !== state ||
        value.observation.windowsPath !== this.options.windowsPath || value.observation.sha256 !== this.options.expectedSha256 || value.observation.bytes !== this.options.expectedBytes ||
        previousRest !== undefined && JSON.stringify(comparable) !== JSON.stringify(previousRest)) {
      throw new Error("Closed generated file reply differs from its original retained read-only lease.");
    }
    this.current = value; return structuredClone(value);
    } catch (error) { const failure = error instanceof Error ? error : new Error("Original closed-data lease reply refused."); this.fail(failure); throw failure; }
  }
  public async initialize(): Promise<ClosedGeneratedFixtureFileObservation> {
    if (this.initializationAttempted || this.releaseAttempted) { throw new Error("Closed generated file lease initialization cannot be repeated."); }
    this.initializationAttempted = true;
    const paths = deriveWindowsRuntimePaths({ pluginRoot: this.options.pluginRoot, assetsRoot: this.options.assetsRoot });
    const path = join(this.options.pluginRoot, "scripts/closed-generated-fixture-data.ps1");
    await (this.dependencies.verifyHelper ?? verifyHelper)(path);
    const helperWindowsPath = paths.helperWindowsPath.replace(/windows-authority\.ps1$/u, "closed-generated-fixture-data.ps1");
    const first = this.next();
    let child: ChildProcessWithoutNullStreams;
    try {
      const args = ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", helperWindowsPath,
        "-Nonce", this.options.nonce, "-SourceWindowsPath", this.options.windowsPath, "-ExpectedSha256", this.options.expectedSha256, "-ExpectedBytes", String(this.options.expectedBytes)];
      child = this.dependencies.spawnProcess === undefined ? spawn(paths.powershellExecutable, args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true }) :
        this.dependencies.spawnProcess(paths.powershellExecutable, args);
    } catch (error) { this.fail(error instanceof Error ? error : new Error("Closed generated file lease helper spawn failed.")); await first; throw error; }
    this.child = child;
    // oxlint-disable-next-line promise/avoid-new -- Observe the original spawned transport's close event; no PID reopening or signaling.
    this.closed = new Promise((resolve) => { child.once("close", (code, signal) => { this.fail(new Error("Original closed generated file lease helper transport closed.")); resolve({ code, signal }); }); });
    child.once("error", (error) => { this.fail(error); });
    child.stdin.on("error", (error) => { this.fail(error); });
    child.stdout.on("error", (error) => { this.fail(error); });
    child.stderr.on("error", (error) => { this.fail(error); });
    child.stderr.on("data", (chunk: Buffer) => { if (chunk.length > 0) { this.fail(new Error("Original closed generated file lease helper reported an error; output retained only as a bounded failure.")); } });
    child.stdout.on("data", (chunk: Buffer) => {
      this.outputBytes += chunk.length;
      if (this.outputBytes > 1_048_576) { this.fail(new Error("Closed generated file lease helper exceeded its complete output budget.")); return; }
      this.buffer += chunk.toString("utf8");
      if (Buffer.byteLength(this.buffer, "utf8") > 65_536) { this.fail(new Error("Closed generated file lease helper exceeded its response budget.")); return; }
      let end = this.buffer.indexOf("\n");
      while (end !== -1) {
        const line = this.buffer.slice(0, end).replace(/\r$/u, ""); this.buffer = this.buffer.slice(end + 1);
        const pending = this.pending;
        if (pending === undefined) { this.fail(new Error("Closed generated file lease helper emitted an unsolicited reply.")); return; }
        clearTimeout(pending.timer); this.pending = undefined;
        try { const raw: unknown = JSON.parse(line); pending.resolve(raw); } catch { pending.reject(new Error("Closed generated file lease helper emitted malformed JSON.")); }
        end = this.buffer.indexOf("\n");
      }
    });
    const observed = this.accept(await first);
    return observed;
  }
  public async inspect(): Promise<ClosedGeneratedFixtureFileObservation> {
    if (this.current === undefined || this.child === undefined || this.releaseAttempted || this.sequence >= 16) { throw new Error("Original closed generated file lease is unavailable for inspection."); }
    this.sequence += 1; const response = this.next();
    this.child.stdin.write(`${JSON.stringify({ nonce: this.options.nonce, id: this.sequence, action: "inspect" })}\n`);
    return this.accept(await response, this.sequence);
  }
  public hasOriginalTransport(): boolean { return this.child !== undefined; }
  public isOriginalTransportClosed(): boolean { return this.transportClosed; }
  public snapshot(): ClosedGeneratedFixtureFileObservation | null { return this.current === undefined ? null : structuredClone(this.current); }
  public async release(): Promise<Readonly<{ originalTransportClosed: true; filesDeleted: false; fileLeaseHeldUntilRelease: boolean;
    finalObservation: ClosedGeneratedFixtureFileObservation | null; exitCode: number | null; signal: NodeJS.Signals | null }>> {
    if (this.releaseAttempted) { throw new Error("Closed generated file lease release cannot be repeated or reconstructed."); }
    this.releaseAttempted = true;
    if (this.child === undefined || this.closed === undefined) { throw new Error("No original closed generated file lease helper transport was allocated."); }
    let finalObservation: ClosedGeneratedFixtureFileObservation | null = null;
    try {
      if (this.current !== undefined && this.sequence < 16 && this.failed === undefined) {
        this.sequence += 1; const response = this.next();
        this.child.stdin.write(`${JSON.stringify({ nonce: this.options.nonce, id: this.sequence, action: "release" })}\n`);
        finalObservation = this.accept(await response, this.sequence, "released");
      }
    } catch { finalObservation = null; }
    // EOF disposes only this original helper and its read-only handles after any
    // Lost/failed reply. An absent drained-watch acknowledgement issues no token.
    this.child.stdin.end();
    const result = await this.closed;
    this.transportClosed = true;
    return { originalTransportClosed: true, filesDeleted: false, fileLeaseHeldUntilRelease: finalObservation !== null && result.code === 0 && result.signal === null,
      finalObservation, exitCode: result.code, signal: result.signal };
  }
}
