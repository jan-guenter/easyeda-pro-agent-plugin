import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { deriveWindowsRuntimePaths } from "./windows-runtime.ts";

export const MANAGED_FIXTURE_DESTINATION_HELPER_SHA256 = "5729fc3300d31737b0ff7b5f4585f81cf620759cb1243b0ce54b15e1c528fe78";
const basename = z.string().regex(/^Codex_(?:via_only|line_and_via|arc_line_and_via|schematic)_[a-f0-9]{16}\.eprj2$/u);
export const managedFixtureLibraryDirectoriesSchema = z.array(z.string().min(4).max(1024).regex(/^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*[A-Za-z0-9_-]+$/u)
  .refine((value) => value.slice(3).split("\\").every((part) => part.trim() === part && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/iu.test(part))))
  .min(1).max(4).refine((value) => new Set(value.map((path) => path.toLowerCase())).size === value.length);
const librarySchema = z.object({ windowsDirectory: managedFixtureLibraryDirectoriesSchema.element,
  directoryIdentity: z.string().regex(/^[a-f0-9]{8}:[a-f0-9]{16}$/u),
  // oxlint-disable-next-line no-control-regex -- Native child names cannot contain control bytes or path separators.
  names: z.array(z.string().min(1).max(128).refine((value) => !/[\\/\u0000-\u001F\u007F]/u.test(value) && !/\.elib$/iu.test(value))).max(64),
  watchState: z.enum(["pending", "cancelled-no-changes"]),
}).strict().refine((value) => new Set(value.names).size === value.names.length && JSON.stringify(value.names) === JSON.stringify(value.names.toSorted()));
export const managedFixtureDestinationObservationSchema = z.object({
  schema: z.literal("easyeda-pro-control.fixture-destination-owner.v1"), nonce: z.string().regex(/^[a-f0-9]{64}$/u),
  ownerId: z.string().regex(/^[a-f0-9]{32}$/u),
  windowsDirectory: z.string().min(8).max(1024).regex(/^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*CodexEasyedaFixture_[a-f0-9]{32}$/u),
  directoryIdentity: z.string().regex(/^[a-f0-9]{8}:[a-f0-9]{16}$/u), expectedBasename: basename,
  entries: z.array(z.string().min(1).max(128)).max(8), state: z.enum(["held", "released"]),
  libraries: z.array(librarySchema).min(1).max(4),
  deletionAuthorized: z.literal(false), requestId: z.number().int().min(1).max(16).optional(),
}).strict().refine((value) => value.windowsDirectory.endsWith(`CodexEasyedaFixture_${value.ownerId}`) &&
  new Set(value.entries).size === value.entries.length && value.entries.every((entry) =>
    [value.expectedBasename, `${value.expectedBasename}-wal`, `${value.expectedBasename}-shm`, `${value.expectedBasename}-journal`].includes(entry)) &&
  value.libraries.every((library) => library.watchState === (value.state === "held" ? "pending" : "cancelled-no-changes")),
"The retained fixture destination has an unexpected complete child roster.");
export type ManagedFixtureDestinationObservation = z.infer<typeof managedFixtureDestinationObservationSchema>;
const fileTime = z.string().regex(/^[1-9][0-9]{0,18}$/u);
export const managedFixtureClosedFileMetadataSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.fixture-closed-file-metadata.v1"), destination: managedFixtureDestinationObservationSchema,
  file: z.strictObject({ windowsPath: z.string().min(8).max(1152), fileIdentity: z.string().regex(/^[a-f0-9]{8}:[a-f0-9]{16}$/u),
    sha256: z.string().regex(/^[a-f0-9]{64}$/u), bytes: z.number().int().min(512).max(67_108_864), createdFileTime: fileTime, modifiedFileTime: fileTime,
    createdEpochMs: z.number().int().positive().max(8_640_000_000_000_000), modifiedEpochMs: z.number().int().positive().max(8_640_000_000_000_000),
    watchState: z.literal("pending"), readOnlyFileLease: z.literal(true) }),
}).refine(value => value.destination.state === "held" && value.destination.entries.length === 1 && value.destination.entries[0] === value.destination.expectedBasename &&
  value.file.windowsPath === `${value.destination.windowsDirectory}\\${value.destination.expectedBasename}` && value.file.fileIdentity.slice(0, 8) === value.destination.directoryIdentity.slice(0, 8) &&
  BigInt(value.file.createdFileTime) <= 2_650_467_743_999_999_999n && BigInt(value.file.modifiedFileTime) <= 2_650_467_743_999_999_999n &&
  (BigInt(value.file.createdFileTime) - 116_444_736_000_000_000n) / 10_000n === BigInt(value.file.createdEpochMs) &&
  (BigInt(value.file.modifiedFileTime) - 116_444_736_000_000_000n) / 10_000n === BigInt(value.file.modifiedEpochMs),
"The original closed file path, complete roster or native FILETIME conversion differs.");
export type ManagedFixtureClosedFileMetadata = z.infer<typeof managedFixtureClosedFileMetadataSchema>;
/** Exact closed-capture sequence: three destination/root boundaries, one file
 * lease, three same-file reproofs (including after the final Linux hash), then
 * the existing final destination release. The native16 ceiling is unchanged. */
export const MANAGED_FIXTURE_CLOSED_CAPTURE_DESTINATION_REQUESTS = Object.freeze({ destinationInspections: 3, fileCapture: 1, fileInspections: 3, release: 1, total: 8 });

export interface ManagedFixtureDestinationOptions {
  readonly pluginRoot: string; readonly assetsRoot: string; readonly nonce: string; readonly expectedBasename: string;
  readonly libraryWindowsDirectories: readonly string[];
}
/** Offline regression seam; never supplied through a registered tool. */
export interface ManagedFixtureDestinationDependencies {
  readonly spawnProcess?: (executable: string, args: readonly string[]) => ChildProcessWithoutNullStreams;
  readonly verifyHelper?: (path: string) => Promise<void>;
}
async function verifyHelper(path: string): Promise<void> {
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size < 1n || before.size > 32_768n || await realpath(path) !== path) { throw new Error("Fixture destination helper path differs from its source profile."); }
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
      if (!item.isFile() || item.dev !== before.dev || item.ino !== before.ino || item.size !== before.size || item.mtimeNs !== before.mtimeNs || item.ctimeNs !== before.ctimeNs) { throw new Error("Fixture destination helper changed during admission."); }
    }
    if (BigInt(bytes.length) !== before.size || await realpath(path) !== path || createHash("sha256").update(bytes).digest("hex") !== MANAGED_FIXTURE_DESTINATION_HELPER_SHA256) { throw new Error("Fixture destination helper bytes differ from its source profile."); }
  } finally { await file.close(); }
}

/** Owns only its original helper transport and fresh directory handles. Keep
 * this object allocated before awaiting initialize(), including on failures.
 * EOF/release closes handles and preserves every resulting file. No historical
 * descriptor, arbitrary destination, cleanup/delete or app authority exists.
 */
export class ManagedFixtureDestinationOwner {
  private child: ChildProcessWithoutNullStreams | undefined;
  private initializationAttempted = false;
  private closedFileMetadataAttempted = false;
  private closedFileMetadata: ManagedFixtureClosedFileMetadata | undefined;
  private releaseAttempted = false;
  private current: ManagedFixtureDestinationObservation | undefined;
  private sequence = 0;
  private buffer = "";
  private outputBytes = 0;
  private pending: { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | undefined;
  private closed: Promise<{ code: number | null; signal: NodeJS.Signals | null }> | undefined;
  private failed: Error | undefined;
  private readonly stderrPrefix = Buffer.alloc(65_536);
  private stderrCapturedBytes = 0;
  private stderrObservedBytes = 0;
  private stderrEnded = false;
  private transportCloseObserved = false;
  private readonly options: ManagedFixtureDestinationOptions;
  private readonly dependencies: ManagedFixtureDestinationDependencies;
  public constructor(options: ManagedFixtureDestinationOptions, dependencies: ManagedFixtureDestinationDependencies = {}) {
    this.options = options; this.dependencies = dependencies;
    z.string().regex(/^[a-f0-9]{64}$/u).parse(options.nonce); basename.parse(options.expectedBasename);
    managedFixtureLibraryDirectoriesSchema.parse(options.libraryWindowsDirectories);
  }
  private fail(error: Error): void {
    this.failed ??= error;
    if (this.pending !== undefined) { clearTimeout(this.pending.timer); this.pending.reject(error); this.pending = undefined; }
  }
  private next(): Promise<unknown> {
    if (this.failed !== undefined) { return Promise.reject(this.failed); }
    if (this.pending !== undefined) { return Promise.reject(new Error("Fixture destination already has an outstanding request.")); }
    // oxlint-disable-next-line promise/avoid-new -- Bridge original stream events to one bounded outstanding protocol response.
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.fail(new Error("Original fixture destination helper did not settle; retain ownership and release without retry.")); }, 30_000);
      this.pending = { resolve, reject, timer };
    });
  }
  private accept(raw: unknown, requestId?: number, state: "held" | "released" = "held"): ManagedFixtureDestinationObservation {
    const value = managedFixtureDestinationObservationSchema.parse(raw); const previous = this.current;
    if (value.nonce !== this.options.nonce || value.expectedBasename !== this.options.expectedBasename || value.requestId !== requestId || value.state !== state ||
        JSON.stringify(value.libraries.map((entry) => entry.windowsDirectory)) !== JSON.stringify(this.options.libraryWindowsDirectories) ||
        previous !== undefined && JSON.stringify(value.libraries.map(({ watchState: _watch, ...entry }) => entry)) !== JSON.stringify(previous.libraries.map(({ watchState: _watch, ...entry }) => entry)) ||
        previous !== undefined && (value.ownerId !== previous.ownerId || value.windowsDirectory !== previous.windowsDirectory || value.directoryIdentity !== previous.directoryIdentity)) {
      throw new Error("Fixture destination reply differs from its original retained owner.");
    }
    this.current = value; return structuredClone(value);
  }
  public async initialize(): Promise<ManagedFixtureDestinationObservation> {
    if (this.initializationAttempted || this.releaseAttempted) { throw new Error("Fixture destination initialization cannot be repeated."); }
    this.initializationAttempted = true;
    const paths = deriveWindowsRuntimePaths({ pluginRoot: this.options.pluginRoot, assetsRoot: this.options.assetsRoot });
    const path = join(this.options.pluginRoot, "scripts/managed-fixture-destination.ps1");
    await (this.dependencies.verifyHelper ?? verifyHelper)(path);
    const helperWindowsPath = paths.helperWindowsPath.replace(/windows-authority\.ps1$/u, "managed-fixture-destination.ps1");
    const first = this.next();
    let child: ChildProcessWithoutNullStreams;
    try {
      child = this.dependencies.spawnProcess === undefined ? spawn(paths.powershellExecutable, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", helperWindowsPath,
        "-Nonce", this.options.nonce, "-ProjectBasename", this.options.expectedBasename, "-LibraryDirectoriesBase64", Buffer.from(JSON.stringify(this.options.libraryWindowsDirectories), "utf8").toString("base64")], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true }) :
        this.dependencies.spawnProcess(paths.powershellExecutable, ["-File", helperWindowsPath, "-Nonce", this.options.nonce, "-ProjectBasename", this.options.expectedBasename]);
    } catch (error) { this.fail(error instanceof Error ? error : new Error("Fixture destination helper spawn failed.")); await first; throw error; }
    this.child = child;
    // oxlint-disable-next-line promise/avoid-new -- Observe the original spawned transport's close event; no PID reopening or signaling.
    this.closed = new Promise((resolve) => { child.once("close", (code, signal) => { this.transportCloseObserved = true; this.fail(new Error("Original fixture destination helper transport closed.")); resolve({ code, signal }); }); });
    child.once("error", (error) => { this.fail(error); });
    child.stdin.on("error", (error) => { this.fail(error); });
    child.stdout.on("error", (error) => { this.fail(error); });
    child.stderr.on("error", (error) => { this.fail(error); });
    child.stderr.once("end", () => { this.stderrEnded = true; });
    child.stderr.on("data", (chunk: Buffer) => {
      this.stderrObservedBytes += chunk.length;
      const copied = chunk.copy(this.stderrPrefix, this.stderrCapturedBytes, 0, Math.min(chunk.length, this.stderrPrefix.length - this.stderrCapturedBytes));
      this.stderrCapturedBytes += copied;
      if (chunk.length > 0) { this.fail(new Error("Original fixture destination helper reported an error; retain its bounded diagnostic artifact and original cleanup.")); }
    });
    child.stdout.on("data", (chunk: Buffer) => {
      this.outputBytes += chunk.length;
      if (this.outputBytes > 1_048_576) { this.fail(new Error("Fixture destination helper exceeded its complete output budget.")); return; }
      this.buffer += chunk.toString("utf8");
      if (Buffer.byteLength(this.buffer, "utf8") > 65_536) { this.fail(new Error("Fixture destination helper exceeded its response budget.")); return; }
      let end = this.buffer.indexOf("\n");
      while (end !== -1) {
        const line = this.buffer.slice(0, end).replace(/\r$/u, ""); this.buffer = this.buffer.slice(end + 1);
        const pending = this.pending;
        if (pending === undefined) { this.fail(new Error("Fixture destination helper emitted an unsolicited reply.")); return; }
        clearTimeout(pending.timer); this.pending = undefined;
        try { const raw: unknown = JSON.parse(line); pending.resolve(raw); } catch { pending.reject(new Error("Fixture destination helper emitted malformed JSON.")); }
        end = this.buffer.indexOf("\n");
      }
    });
    const observed = this.accept(await first);
    if (observed.entries.length > 0) { throw new Error("Fresh fixture destination was not empty at allocation."); }
    return observed;
  }
  public async inspect(): Promise<ManagedFixtureDestinationObservation> {
    if (this.current === undefined || this.child === undefined || this.releaseAttempted || this.sequence >= 16) { throw new Error("Original fixture destination is unavailable for inspection."); }
    this.sequence += 1; const response = this.next();
    this.child.stdin.write(`${JSON.stringify({ nonce: this.options.nonce, id: this.sequence, action: "inspect" })}\n`);
    return this.accept(await response, this.sequence);
  }
  public snapshot(): ManagedFixtureDestinationObservation | null { return this.current === undefined ? null : structuredClone(this.current); }
  private acceptClosedFileMetadata(raw: unknown, requestId: number): ManagedFixtureClosedFileMetadata {
    const value = managedFixtureClosedFileMetadataSchema.parse(raw); this.accept(value.destination, requestId);
    if (this.closedFileMetadata !== undefined && JSON.stringify(value.file) !== JSON.stringify(this.closedFileMetadata.file)) {
      throw new Error("Original retained Windows file handle, metadata or content changed.");
    }
    this.closedFileMetadata = value; return structuredClone(value);
  }
  /** Local counter proof before acquiring any new file/watch handle. The
   * coordinator serializes this entire sequence and keeps the release slot. */
  public assertClosedCaptureCapacity(): void {
    if (this.current === undefined || this.child === undefined || this.closedFileMetadataAttempted || this.releaseAttempted || this.pending !== undefined || this.failed !== undefined ||
      this.sequence > 16 - MANAGED_FIXTURE_CLOSED_CAPTURE_DESTINATION_REQUESTS.total) { throw new Error("Original destination lacks the complete eight-request closed capture/release capacity."); }
  }
  /** The original coordinator must first prove its app root and empty Job.
   * This one fixed action then retains a NEW Windows read-only file handle and
   * name watcher through the existing original destination release. */
  public async captureClosedFileMetadata(): Promise<ManagedFixtureClosedFileMetadata> {
    if (this.closedFileMetadataAttempted || this.current === undefined || this.child === undefined || this.releaseAttempted || this.sequence >= 16) { throw new Error("Original closed Windows file metadata capture cannot be entered or repeated."); }
    this.closedFileMetadataAttempted = true; this.sequence += 1; const response = this.next();
    this.child.stdin.write(`${JSON.stringify({ nonce: this.options.nonce, id: this.sequence, action: "capture-closed-file" })}\n`);
    return this.acceptClosedFileMetadata(await response, this.sequence);
  }
  public async inspectClosedFileMetadata(): Promise<ManagedFixtureClosedFileMetadata> {
    if (this.closedFileMetadata === undefined || this.child === undefined || this.releaseAttempted || this.sequence >= 16) { throw new Error("Original closed Windows file handle is unavailable for metadata reproof."); }
    this.sequence += 1; const response = this.next();
    this.child.stdin.write(`${JSON.stringify({ nonce: this.options.nonce, id: this.sequence, action: "inspect-closed-file" })}\n`);
    return this.acceptClosedFileMetadata(await response, this.sequence);
  }
  /** Original raw bytes only. A prefix or close event never proves directory
   * allocation, original app termination, migration exclusion or safe replay. */
  public failureObservation(): Readonly<Record<string, unknown>> | null {
    if (this.failed === undefined) { return null; }
    const prefix = this.stderrPrefix.subarray(0, this.stderrCapturedBytes);
    return { schema: "easyeda-pro-control.fixture-destination-helper-failure.v1", failure: this.failed.message,
      stderr: { observedBytes: this.stderrObservedBytes, capturedBytes: prefix.length, base64: prefix.toString("base64"),
        capturedPrefixSha256: createHash("sha256").update(prefix).digest("hex"), streamEnded: this.stderrEnded,
        truncated: this.stderrObservedBytes > prefix.length, complete: this.stderrEnded && this.stderrObservedBytes === prefix.length },
      originalTransportAllocated: this.child !== undefined, originalTransportCloseObserved: this.transportCloseObserved,
      nativeApplicationTerminationProved: false, directoryAllocationProved: false, replayAllowed: false };
  }
  public async release(): Promise<Readonly<{ originalTransportClosed: true; filesDeleted: false; migrationExclusionHeldUntilRelease: boolean;
    finalObservation: ManagedFixtureDestinationObservation | null; exitCode: number | null; signal: NodeJS.Signals | null }>> {
    if (this.releaseAttempted) { throw new Error("Fixture destination release cannot be repeated or reconstructed."); }
    this.releaseAttempted = true;
    if (this.child === undefined || this.closed === undefined) { throw new Error("No original fixture destination helper transport was allocated."); }
    let finalObservation: ManagedFixtureDestinationObservation | null = null;
    try {
      if (this.current !== undefined && this.sequence < 16 && this.failed === undefined) {
        this.sequence += 1; const response = this.next();
        this.child.stdin.write(`${JSON.stringify({ nonce: this.options.nonce, id: this.sequence, action: "release" })}\n`);
        finalObservation = this.accept(await response, this.sequence, "released");
      }
    } catch { finalObservation = null; }
    // EOF remains the supported finally/dispose path after a failed roster or
    // Watch completion. It issues no migration-exclusion proof and deletes no files.
    this.child.stdin.end();
    const result = await this.closed;
    return { originalTransportClosed: true, filesDeleted: false, migrationExclusionHeldUntilRelease: finalObservation !== null && result.code === 0 && result.signal === null,
      finalObservation, exitCode: result.code, signal: result.signal };
  }
}
