/* oxlint-disable node/no-sync -- These bounded descriptor writes run inside original subprocess callbacks; evidence failure must synchronously revoke normal dispatch before an await. */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, openSync, readSync, realpathSync, writeSync } from "node:fs";
import { lstat, mkdir, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

export type ProofRecord = Record<string, unknown>;
export type ProofMethod = "initialize" | "thread/start" | "mcpServerStatus/list" | "mcpServer/tool/call" | "thread/unsubscribe";
export interface OriginalClose { readonly code: number | null; readonly signal: NodeJS.Signals | null }
export interface WatcherSettlement { readonly kind: "await-original-exit" | "release"; readonly nonce: string }
const MAXIMUM_LINE_BYTES = 32 * 1024 * 1024;
export const PROOF_JOURNALS = ["state.jsonl", "cli-version.stdout.log", "cli-version.stderr.log", "app-server.stdout.jsonl", "app-server.stderr.log", "linux-watcher.jsonl", "linux-watcher.stderr.log", "windows-watcher.jsonl", "windows-watcher.stderr.log", "cleanup-manifest.json", "loaded-facade-full-reply.json", "inspect-full-reply.json", "retire-full-reply.json", "close-retired-full-reply.json"] as const;
const JOURNALS = PROOF_JOURNALS;
export type ProofJournalName = typeof JOURNALS[number];
export function proofNeed(value: unknown, code: string): asserts value { if (value !== true) { throw new Error(code); } }
function isProofRecord(value: unknown): value is ProofRecord { return value !== null && typeof value === "object" && !Array.isArray(value); }
export function proofRecord(value: unknown, code: string): ProofRecord { proofNeed(isProofRecord(value), code); return value; }

interface JournalState {
  readonly fd: number;
  readonly limit: number;
  readonly pending: Buffer[];
  readonly hash: ReturnType<typeof createHash>;
  received: number;
  persisted: number;
  retained: number;
  overflow: number;
  closed: boolean;
  unsynced: boolean;
}
export interface ProofJournal {
  readonly append: (bytes: Buffer) => boolean;
  readonly put: (value: unknown) => boolean;
  readonly flush: () => boolean;
  readonly snapshot: () => ProofRecord;
}
export interface ProofFacadeClosure { readonly mayExist: boolean; readonly pid: number | null; readonly originalPidfdHeld: boolean; readonly originalExitObserved: boolean }
export interface ProofEvidence {
  readonly controlFile: string;
  readonly failure: Promise<null>;
  readonly state: ProofJournal;
  readonly cleanup: ProofJournal;
  readonly journal: (name: ProofJournalName) => ProofJournal;
  readonly readControl: () => Promise<Buffer>;
  readonly flush: () => Promise<boolean>;
  readonly hasPending: () => boolean;
  readonly failed: () => boolean;
  readonly snapshots: () => readonly ProofRecord[];
  readonly terminalWorkspaceManifest: (originalTransportsClosed: boolean, facade?: ProofFacadeClosure) => Promise<ProofRecord>;
  readonly close: () => Promise<boolean>;
}

/** Allocate every evidence/control descriptor before any CLI owner exists.
 * Failed writes retain bounded original bytes and never throw through cleanup. */
export async function createProofEvidence(evidenceDirectory: string, workspace: string): Promise<ProofEvidence> {
  proofNeed(process.platform === "linux", "WINDOWS_DURABLE_DIRECTORY_SYNC_UNAVAILABLE");
  const opened: number[] = []; const directories: { readonly fd: number; readonly path: string; readonly dev: bigint; readonly ino: bigint }[] = []; const journals = new Map<ProofJournalName, ProofJournal>(); const states: JournalState[] = [];
  const failure = Promise.withResolvers<null>(); let failed = false; let controlOffset = 0; let finished = false; let directorySyncPending = true;
  const markFailure = (): void => { failed = true; failure.resolve(null); };
  const retainDirectory = (path: string, privateChild = false): number => {
    const before = lstatSync(path, { bigint: true }); proofNeed(before.isDirectory() && !before.isSymbolicLink() && realpathSync(path) === path, "CANONICAL_DIRECTORY_REQUIRED");
    const fd = openSync(path, constants.O_RDONLY + constants.O_DIRECTORY + constants.O_NOFOLLOW); opened.push(fd);
    const current = fstatSync(fd, { bigint: true });
    proofNeed(current.isDirectory() && current.dev === before.dev && current.ino === before.ino, "ORIGINAL_DIRECTORY_CHANGED");
    if (privateChild) { proofNeed(current.mode % 512n === 0o700n && current.uid === BigInt(process.getuid?.() ?? -1), "PRIVATE_OWNED_DIRECTORY_REQUIRED"); }
    directories.push({ fd, path, dev: current.dev, ino: current.ino }); return fd;
  };
  const syncDirectories = (): boolean => {
    directorySyncPending = true;
    try { for (const item of directories.toReversed()) { const current = fstatSync(item.fd, { bigint: true }), path = lstatSync(item.path, { bigint: true });
      proofNeed(current.isDirectory() && current.dev === item.dev && current.ino === item.ino && path.isDirectory() && !path.isSymbolicLink() && path.dev === item.dev && path.ino === item.ino && realpathSync(item.path) === item.path, "ORIGINAL_DIRECTORY_CHANGED"); fsyncSync(item.fd); } directorySyncPending = false; return true;
    } catch { markFailure(); return false; }
  };
  let workspaceCreated = false;
  try {
    const evidenceParent = retainDirectory(dirname(evidenceDirectory)), workspaceParent = retainDirectory(dirname(workspace));
    await mkdir(`/proc/self/fd/${evidenceParent}/${basename(evidenceDirectory)}`, { recursive: false, mode: 0o700 });
    const evidenceFd = retainDirectory(evidenceDirectory, true);
    await mkdir(`/proc/self/fd/${workspaceParent}/${basename(workspace)}`, { recursive: false, mode: 0o700 }); workspaceCreated = true;
    const workspaceFd = retainDirectory(workspace, true); const originalWorkspace = fstatSync(workspaceFd, { bigint: true });
    const controlFile = join(evidenceDirectory, "control.jsonl"); const controlFd = openSync(`/proc/self/fd/${evidenceFd}/control.jsonl`, "wx+", 0o600); opened.push(controlFd); let controlSyncPending = true;
    const syncControl = (): boolean => { controlSyncPending = true; try { fsyncSync(controlFd); controlSyncPending = false; return true; } catch { markFailure(); return false; } };
    proofNeed(syncControl(), "INITIAL_CONTROL_SYNC_REQUIRED");
    for (const name of JOURNALS) {
      const fd = openSync(`/proc/self/fd/${evidenceFd}/${name}`, "wx", 0o600); opened.push(fd);
      let limit = 2 * 1024 * 1024; if (name === "app-server.stdout.jsonl") { limit = 64 * 1024 * 1024; } else if (name.endsWith("stderr.log")) { limit = 4 * 1024 * 1024; }
      const state: JournalState = { fd, limit,
        pending: [], hash: createHash("sha256"), received: 0, persisted: 0, retained: 0, overflow: 0, closed: false, unsynced: true };
      states.push(state);
      const flush = (): boolean => {
        if (state.closed) { return state.pending.length === 0 && !state.unsynced; }
        while (state.pending.length > 0) {
          const first = state.pending[0]; if (first === undefined) { break; }
          try {
            const count = writeSync(state.fd, first); proofNeed(count > 0, "EVIDENCE_WRITE_INCOMPLETE");
            state.persisted += count; state.retained -= count; state.unsynced = true;
            if (count === first.length) { state.pending.shift(); } else { state.pending[0] = first.subarray(count); }
          } catch { markFailure(); return false; }
        }
        if (state.unsynced) { try { fsyncSync(state.fd); state.unsynced = false; } catch { markFailure(); return false; } }
        return true;
      };
      const append = (bytes: Buffer): boolean => {
        try {
          if (state.closed) { markFailure(); return false; }
          state.received += bytes.length; state.hash.update(bytes);
          const remaining = Math.max(0, state.limit - state.persisted - state.retained); const count = Math.min(remaining, bytes.length);
          if (count > 0) { const copy = Buffer.from(bytes.subarray(0, count)); state.pending.push(copy); state.retained += copy.length; }
          state.overflow += bytes.length - count;
          if (count !== bytes.length) { markFailure(); }
          const persisted = flush(); return persisted && count === bytes.length;
        } catch { markFailure(); return false; }
      };
      const journal: ProofJournal = { append, flush,
        put(value): boolean { try { return append(Buffer.from(`${JSON.stringify(value)}\n`)); } catch { markFailure(); return false; } },
        snapshot(): ProofRecord { return { name, receivedBytes: state.received, persistedBytes: state.persisted, retainedBytes: state.retained, overflowBytes: state.overflow, originalFileSyncPending: state.unsynced, receivedSha256: state.hash.copy().digest("hex") }; } };
      proofNeed(journal.flush(), "INITIAL_JOURNAL_SYNC_REQUIRED"); journals.set(name, journal);
    }
    proofNeed(syncDirectories(), "INITIAL_DIRECTORY_SYNC_REQUIRED");
    const journal = (name: ProofJournalName): ProofJournal => { const item = journals.get(name); proofNeed(item !== undefined, "PREALLOCATED_JOURNAL_REQUIRED"); return item; };
    return { controlFile, failure: failure.promise, state: journal("state.jsonl"), cleanup: journal("cleanup-manifest.json"), journal,
      readControl(): Promise<Buffer> {
        try { const bytes = Buffer.alloc(8192), count = readSync(controlFd, bytes, 0, bytes.length, controlOffset); controlOffset += count;
          if (controlOffset > 64 * 1024) { markFailure(); return Promise.resolve(Buffer.alloc(0)); } return Promise.resolve(bytes.subarray(0, count));
        } catch { markFailure(); return Promise.resolve(Buffer.alloc(0)); }
      },
      flush(): Promise<boolean> { let complete = true; for (const item of journals.values()) { if (!item.flush()) { complete = false; } } const controlComplete = syncControl(); return Promise.resolve(syncDirectories() && controlComplete && complete); },
      hasPending(): boolean { return directorySyncPending || controlSyncPending || states.some(item => item.pending.length > 0 || item.unsynced); }, failed(): boolean { return failed; },
      snapshots(): readonly ProofRecord[] { return [...journals.values()].map(item => item.snapshot()); },
      async terminalWorkspaceManifest(originalTransportsClosed, suppliedFacade): Promise<ProofRecord> {
        const facade = suppliedFacade ?? { mayExist: false, pid: null, originalPidfdHeld: false, originalExitObserved: false };
        const loadedFacadeExitUnknown = facade.mayExist && !facade.originalExitObserved; const originalsClosed = originalTransportsClosed && !loadedFacadeExitUnknown;
        try { const current = await lstat(workspace, { bigint: true }), entries = await readdir(`/proc/self/fd/${workspaceFd}`);
          const same = current.isDirectory() && !current.isSymbolicLink() && current.dev === originalWorkspace.dev && current.ino === originalWorkspace.ino && current.birthtimeNs === originalWorkspace.birthtimeNs;
          return { schema: "easyeda-pro-control.fresh-cli-closed-workspace.v1", workspace, createdByThisAttempt: true, originalTransportsClosed, originalsClosed, loadedFacade: facade, loadedFacadeExitUnknown, sameDirectoryIdentity: same,
            entries: entries.length, eligibleForEmptyDirectoryRemovalAfterDriverExit: originalsClosed && same && entries.length === 0,
            createdRuntimeCopies: [], createdClones: [], recursiveDeletionPerformed: false, evidenceDirectory, evidencePreserved: true };
        } catch { return { schema: "easyeda-pro-control.fresh-cli-closed-workspace.v1", workspace, createdByThisAttempt: true, originalTransportsClosed, originalsClosed, loadedFacade: facade, loadedFacadeExitUnknown, inspectionFailed: true,
          eligibleForEmptyDirectoryRemovalAfterDriverExit: false, recursiveDeletionPerformed: false, evidenceDirectory, evidencePreserved: true }; }
      },
      close(): Promise<boolean> { if (finished) { return Promise.resolve(true); }
        let durable = true; for (const item of journals.values()) { if (!item.flush()) { durable = false; } }
        const controlComplete = syncControl(); if (!syncDirectories() || !controlComplete || !durable) { return Promise.resolve(false); }
        finished = true; for (const item of states) { item.closed = true; }
        for (const fd of opened.toReversed()) { try { closeSync(fd); } catch { markFailure(); } } return Promise.resolve(true); },
    };
  } catch (error) {
    // There is no CLI owner yet. Preserve partially created files/directories.
    for (const fd of opened.toReversed()) { try { closeSync(fd); } catch {
      // Original initializer error wins.
    } }
    throw new Error(workspaceCreated ? "LOCAL_EVIDENCE_INITIALIZATION_FAILED" : "EXCLUSIVE_WORKSPACE_CREATION_FAILED", { cause: error });
  }
}

/** One retained original child. Protocol errors stop normal writes; fixed
 * watcher settlement and original stdin EOF remain available after IO failure. */
export class OwnedProofProcess {
  public readonly child: ChildProcessWithoutNullStreams;
  public readonly closed = Promise.withResolvers<OriginalClose>();
  public readonly fault = Promise.withResolvers<never>();
  public readonly pendingMethods = new Map<string, ProofMethod>();
  public closeResult: OriginalClose | undefined;
  public exitResult: OriginalClose | undefined;
  public onRecord: ((value: unknown) => void) | undefined;
  private readonly replies = new Map<string, ReturnType<typeof Promise.withResolvers<unknown>>>();
  private readonly waiting: ReturnType<typeof Promise.withResolvers<unknown>>[] = [];
  private readonly records: unknown[] = [];
  private readonly textChunks: Buffer[] = [];
  private textBytes = 0;
  private sequence = 0;
  private failed = false;
  private protocolFailed = false;
  private inputClosed = false;
  public constructor(executable: string, args: readonly string[], cwd: string, stdout: ProofJournal, stderr: ProofJournal, env: NodeJS.ProcessEnv = process.env, mode: "jsonl" | "plain" = "jsonl") {
    this.child = spawn(executable, args, { cwd, env, stdio: ["pipe", "pipe", "pipe"], shell: false, windowsHide: true });
    // Observe this exact deferred before an error callback can reject it.
    void this.observeFault();
    const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }); let buffer = ""; let decodingFailed = false;
    this.child.stdout.on("data", (bytes: Buffer): void => {
      if (!stdout.append(bytes)) { this.fail(); }
      if (mode === "plain") { this.textBytes += bytes.length; if (this.textBytes > 4096) { this.fail(); } else { this.textChunks.push(Buffer.from(bytes)); } return; }
      if (decodingFailed) { return; }
      try { buffer += decoder.decode(bytes, { stream: true }); proofNeed(Buffer.byteLength(buffer) <= MAXIMUM_LINE_BYTES, "PROTOCOL_LINE_BOUND"); let at = buffer.indexOf("\n");
        while (at >= 0) { const line = buffer.slice(0, at); buffer = buffer.slice(at + 1); if (line.trim().length > 0) { this.record(JSON.parse(line)); } at = buffer.indexOf("\n"); }
      } catch { buffer = ""; decodingFailed = true; this.fail(); }
    });
    this.child.stderr.on("data", (bytes: Buffer): void => { if (!stderr.append(bytes)) { this.fail(); } });
    this.child.stdin.on("error", (): void => { this.fail(); }); this.child.once("error", (): void => { this.fail(); });
    this.child.once("exit", (code, signal): void => { this.exitResult = { code, signal }; });
    this.child.once("close", (code, signal): void => {
      try {
        if (mode === "jsonl") { buffer += decoder.decode(); proofNeed(buffer.trim().length === 0, "PROTOCOL_EOF_INCOMPLETE"); }
        else { decoder.decode(Buffer.concat(this.textChunks)); }
      } catch { this.fail(); }
      this.closeResult = { code, signal }; this.closed.resolve(this.closeResult);
      for (const item of this.replies.values()) { item.reject(new Error("ORIGINAL_PROCESS_CLOSED_WITH_PENDING_REPLY")); }
      for (const item of this.waiting) { item.reject(new Error("ORIGINAL_PROCESS_CLOSED_WITH_PENDING_READ")); }
    });
  }
  private async observeFault(): Promise<void> { try { await this.fault.promise; } catch {
    // The original request/read waiter reports this same failure.
  } }
  private fail(protocolFault = true): void {
    if (protocolFault) { this.protocolFailed = true; }
    if (this.failed) { return; } this.failed = true; const error = new Error("ORIGINAL_PROTOCOL_OR_EVIDENCE_FAILED"); this.fault.reject(error);
    for (const item of this.replies.values()) { item.reject(error); } for (const item of this.waiting) { item.reject(error); }
  }
  private record(value: unknown): void {
    this.onRecord?.(value);
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const item = proofRecord(value, "PROTOCOL_OBJECT");
      if (typeof item["id"] === "string" && !Object.hasOwn(item, "method")) {
        const reply = this.replies.get(item["id"]); if (reply !== undefined) { this.replies.delete(item["id"]); this.pendingMethods.delete(item["id"]);
          if (Object.hasOwn(item, "error")) { reply.reject(new Error("RPC_ERROR_PRESERVED_RAW")); } else { reply.resolve(item["result"]); } return; }
      }
      if (Object.hasOwn(item, "id") && Object.hasOwn(item, "method")) { this.fail(); return; }
    }
    const waiting = this.waiting.shift(); if (waiting === undefined) {
      if (this.records.length >= 512) { this.fail(); return; } this.records.push(value);
    } else { waiting.resolve(value); }
  }
  private async write(value: unknown, settlement: boolean): Promise<void> {
    if ((!settlement && this.failed) || this.inputClosed) { throw new Error("ORIGINAL_NORMAL_WRITES_CLOSED"); }
    const written = Promise.withResolvers<null>();
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable callback is the exact original buffer-consumption boundary.
    this.child.stdin.write(`${JSON.stringify(value)}\n`, (error): void => { if (error !== null && error !== undefined) { this.fail(); written.reject(error); } else { written.resolve(null); } });
    await (settlement ? written.promise : Promise.race([written.promise, this.fault.promise]));
  }
  public protocolHealthy(): boolean { return !this.protocolFailed; }
  public text(): string { return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(Buffer.concat(this.textChunks)); }
  public notifyInitialized(): Promise<void> { return this.write({ method: "initialized" }, false); }
  public async rpc(method: ProofMethod, params: unknown): Promise<unknown> {
    proofNeed(["initialize", "thread/start", "mcpServerStatus/list", "mcpServer/tool/call", "thread/unsubscribe"].includes(method), "FIXED_PROTOCOL_METHOD_REQUIRED");
    this.sequence += 1; const id = String(this.sequence); const reply = Promise.withResolvers<unknown>(); this.replies.set(id, reply); this.pendingMethods.set(id, method);
    const written = this.write({ id, method, params }, false);
    const original = Promise.all([written, reply.promise]);
    const [, value] = await Promise.race([original, this.fault.promise]); return value;
  }
  public sendWatcherPacket(value: unknown): Promise<void> { return this.write(value, false); }
  public settleWatcher(value: WatcherSettlement): Promise<void> { return this.write(value, true); }
  public next(): Promise<unknown> {
    if (this.failed) { return Promise.reject(new Error("ORIGINAL_NORMAL_READS_CLOSED")); }
    const value = this.records.shift(); if (value !== undefined) { return Promise.resolve(value); }
    if (this.closeResult !== undefined) { return Promise.reject(new Error("ORIGINAL_PROCESS_ALREADY_CLOSED")); }
    const pending = Promise.withResolvers<unknown>(); this.waiting.push(pending); return Promise.race([pending.promise, this.fault.promise]);
  }
  public closeInput(): void {
    if (this.inputClosed) { return; } this.inputClosed = true; this.fail(false);
    try { this.child.stdin.end(); } catch {
      // Retain this original close Promise and control route.
    }
  }
}

export async function boundedProofWait<Result>(promise: Promise<Result>, milliseconds: number, code: string): Promise<Result> {
  const timeout = Promise.withResolvers<never>(), timer = setTimeout(() => { timeout.reject(new Error(code)); }, milliseconds);
  try { return await Promise.race([promise, timeout.promise]); } finally { clearTimeout(timer); }
}
