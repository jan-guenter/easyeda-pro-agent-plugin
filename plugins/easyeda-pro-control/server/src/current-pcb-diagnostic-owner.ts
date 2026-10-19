/** Private diagnostic launch path. No MCP registration imports this module.
 * Its retained helper owns the original process, non-breakaway Job and pipes.
 * A diagnostic failure never ends stdin or closes an Electron pipe. The only
 * release path first proves original root and complete Job termination.
 * Browser discovery grants no frame, worker, script or CAD execution authority. */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import process from "node:process";
import { PassThrough, Writable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { CurrentPcbDiagnosticPipe, decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-pipe.ts";

const HELPER_SHA256 = "8e224dded3c2de503d24ee190f5411deaaecca94375bebc0394a112f5099be99";
const MAX_LINE = 100_000;
const MAX_TOTAL = 16 * 1024 * 1024;
// Original helper owners remain reachable after caller exceptions.
const retainedOwners = new Set<object>();
type RecordValue = Record<string, unknown>;
interface Binding { readonly helperInstance: string; readonly jobId: string; readonly rootPid: number; readonly rootCreated: string }
interface Pending {
  readonly id: string; readonly resolve: (value: RecordValue) => void; readonly reject: (error: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>; written: boolean; reply: RecordValue | null;
}
function record(value: unknown): value is RecordValue { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: RecordValue, fields: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === fields.toSorted().join(","); }
function error(code: string): Error { return new Error(`PCB_DIAGNOSTIC_OWNER_${code}`); }
function binding(value: RecordValue): Binding {
  const { helperInstance, jobId, rootPid, rootCreated } = value;
  if (!exact(value, ["helperInstance", "jobId", "rootPid", "rootCreated"]) ||
      typeof helperInstance !== "string" || !/^[a-f\d]{32}$/u.test(helperInstance) ||
      typeof jobId !== "string" || !/^[a-f\d]{32}$/u.test(jobId) ||
      typeof rootPid !== "number" || !Number.isSafeInteger(rootPid) || rootPid < 1 ||
      typeof rootCreated !== "string" || !/^[1-9]\d{14,19}$/u.test(rootCreated)) { throw error("BINDING"); }
  return Object.freeze({ helperInstance, jobId, rootPid, rootCreated });
}

/** Test seams supply a real retained child, never process IDs or an attach path.
 * Only startCurrentPcbDiagnosticOwner checks packaged helper source. Neither
 * constructor nor successful discovery grants current runtime admission. */
export class CurrentPcbDiagnosticOwner {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #verify: () => Promise<void>;
  readonly #input = new PassThrough({ autoDestroy: false });
  readonly #output: Writable;
  readonly #pipe: CurrentPcbDiagnosticPipe;
  readonly #closed = Promise.withResolvers<null>();
  #pending: Pending | null = null;
  #buffer = Buffer.alloc(0);
  #total = 0;
  #failure: string | null = null;
  #binding: Binding | null = null;
  #busy = false;
  #launchConsumed = false;
  #closeConsumed = false;
  #releaseConsumed = false;
  #released = false;
  #childClosed = false;
  #send: Promise<void> | null = null;

  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>) {
    this.#child = child; this.#verify = verify;
    this.#output = new Writable({ autoDestroy: false,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable requires its original callback, acknowledged only after native WriteFile.
      write: (chunk: unknown, _encoding, callback): void => {
        this.#send = this.#sendFrame(chunk, callback);
      },
    });
    this.#pipe = new CurrentPcbDiagnosticPipe(this.#input, this.#output);
  }

  /** Retain the object before attaching listeners; failures preserve its child. */
  public start(): void {
    if (this.#pipe.status().started) { throw error("START_CONSUMED"); }
    this.#child.on("error", this.#childError);
    this.#child.on("close", this.#childClose);
    this.#child.stdin.on("error", this.#childError);
    this.#child.stdout.on("error", this.#childError);
    this.#child.stderr.on("error", this.#childError);
    this.#child.stderr.on("data", this.#stderr);
    this.#child.stdout.on("data", this.#data);
    this.#pipe.start();
  }

  public status(): Readonly<{ helperPid: number | null; binding: Binding | null; failure: string | null;
    busy: boolean; launchConsumed: boolean; closeConsumed: boolean; released: boolean; helperClosed: boolean;
    frameWorkerVerified: false; executionAuthorized: false }> {
    return Object.freeze({ helperPid: this.#child.pid ?? null, binding: this.#binding, failure: this.#failure,
      busy: this.#busy, launchConsumed: this.#launchConsumed, closeConsumed: this.#closeConsumed,
      released: this.#released, helperClosed: this.#childClosed, frameWorkerVerified: false, executionAuthorized: false });
  }

  public async launch(input: Readonly<{ executable: string; executableSha256: string; confirmDiagnosticLaunch: true }>): Promise<Binding> {
    if (this.#launchConsumed) { throw error("LAUNCH_CONSUMED"); }
    const { executable, executableSha256, confirmDiagnosticLaunch } = input;
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare, eslint/no-control-regex -- Exact confirmation and exclusion of native command control characters are required at this boundary.
    if (confirmDiagnosticLaunch !== true || !/^[A-Za-z]:\\[^\u0000-\u001F"\r\n]+\\easyeda-pro\.exe$/u.test(executable) ||
        !/^[a-f\d]{64}$/u.test(executableSha256)) { throw error("LAUNCH_INPUT"); }
    this.#enter(); this.#launchConsumed = true;
    try {
      await this.#verify(); this.#available();
      try { this.#binding = binding(await this.#request({ action: "launch", executable, executableSha256, confirmDiagnosticLaunch: true })); }
      catch (caughtError) {
        // Native failure can follow successful CreateProcess. Recover only this
        // Original helper's retained binding; never launch or adopt a PID again.
        if (this.#failure === null) {
          const observed = await this.#request({ action: "identity" });
          if (observed["rootPid"] !== 0) { this.#binding = binding(observed); }
        }
        throw caughtError;
      }
      await this.#verify(); this.#available(); return this.#binding;
    } finally { this.#busy = false; }
  }

  public getVersion(): Promise<RecordValue> { return this.#discover("version"); }
  public getTargets(): Promise<RecordValue> { return this.#discover("targets"); }

  public async observeApplicationWindow(): Promise<string | null> {
    this.#enter(true);
    try {
      await this.#verify(); this.#available(); const reply = await this.#request({ action: "window" });
      await this.#verify(); this.#available();
      if (!exact(reply, ["hwnd"]) || (reply["hwnd"] !== null && (typeof reply["hwnd"] !== "string" || !/^[1-9]\d{0,18}$/u.test(reply["hwnd"])))) { throw error("WINDOW_REPLY"); }
      return reply["hwnd"];
    } finally { this.#busy = false; }
  }

  public async requestNormalClose(hwnd: string): Promise<void> {
    if (this.#closeConsumed) { throw error("CLOSE_CONSUMED"); }
    if (!/^[1-9]\d{0,18}$/u.test(hwnd)) { throw error("WINDOW_INPUT"); }
    this.#enter(true); this.#closeConsumed = true;
    try {
      await this.#verify(); this.#available();
      const reply = await this.#request({ action: "normal-close", hwnd, confirmNormalClose: true });
      if (!exact(reply, ["closeDispatched", "saveOrDiscardSelected"]) || reply["closeDispatched"] !== true || reply["saveOrDiscardSelected"] !== false) { throw error("CLOSE_REPLY"); }
      await this.#verify(); this.#available();
    } finally { this.#busy = false; }
  }

  public async observeTermination(): Promise<boolean> {
    this.#enter();
    try {
      await this.#verify(); this.#available(); const reply = await this.#request({ action: "termination" });
      await this.#verify(); this.#available();
      if (!exact(reply, ["terminated"]) || typeof reply["terminated"] !== "boolean") { throw error("TERMINATION_REPLY"); }
      return reply["terminated"];
    } finally { this.#busy = false; }
  }

  public async releaseClosed(): Promise<void> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    this.#enter();
    try {
      await this.#verify(); this.#available();
      const termination = await this.#request({ action: "termination" });
      if (!exact(termination, ["terminated"]) || termination["terminated"] !== true) { throw error("RETAIN_LIVE_OWNER"); }
      this.#releaseConsumed = true;
      // Native release independently observes original root and Job again.
      // A rejected live release consumes only this call, never closes a pipe.
      const reply = await this.#request({ action: "release" });
      if (!exact(reply, ["released"]) || reply["released"] !== true) { throw error("RELEASE_REPLY"); }
      this.#released = true;
      this.#child.stdin.end();
      await this.#closed.promise;
      if (this.#failure !== null) { throw error(this.#failure); }
      if (this.#child.exitCode !== 0 || this.#child.signalCode !== null) { throw error("RELEASE_EXIT"); }
      this.#input.destroy(); this.#output.destroy();
      // Local synthetic adapters only. Native pipes were released after closure.
      await delay(0); this.#pipe.releaseClosedListeners();
      retainedOwners.delete(this);
    } finally { this.#busy = false; }
  }

  #available(): void {
    if (this.#failure !== null || this.#released || this.#childClosed || this.#child.exitCode !== null || this.#child.signalCode !== null) { throw error(this.#failure ?? "UNAVAILABLE"); }
  }
  #enter(requireLaunch = false): void {
    this.#available();
    if (this.#busy) { throw error("BUSY"); }
    if (requireLaunch && this.#binding === null) { throw error("NO_LAUNCH"); }
    this.#busy = true;
  }
  async #discover(kind: "version" | "targets"): Promise<RecordValue> {
    this.#enter(true);
    try {
      await this.#verify(); this.#available();
      const reply = kind === "version" ? this.#pipe.getVersion() : this.#pipe.getTargets();
      // Attach rejection before any await, including the native write callback.
      const observed = (async (): Promise<{ value: RecordValue } | { cause: unknown }> => {
        try { return { value: await reply }; } catch (caughtError) { return { cause: caughtError }; }
      })();
      await this.#send;
      while (this.#pipe.status().pendingRequestId !== null) {
        this.#available(); const chunk = await this.#request({ action: "poll" });
        if (!exact(chunk, ["bytes"]) || typeof chunk["bytes"] !== "string" || chunk["bytes"].length > 87_384 ||
            !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(chunk["bytes"])) { throw error("PIPE_CHUNK"); }
        const bytes = Buffer.from(chunk["bytes"], "base64");
        if (bytes.toString("base64") !== chunk["bytes"] || bytes.length > 65_536) { throw error("PIPE_CHUNK"); }
        if (bytes.length > 0) { this.#input.write(bytes); } else { await delay(20); }
      }
      const result = await observed;
      if ("cause" in result) { throw result.cause; }
      await this.#verify(); this.#available(); return result.value;
    } catch (caughtError) {
      // A malformed helper chunk must poison discovery immediately, not leave
      // Its prior request pending until the byte transport's later deadline.
      // This local adapter error preserves every native endpoint and normal close.
      this.#input.emit("error", error("DISCOVERY_FAILED")); throw caughtError;
    } finally { this.#busy = false; }
  }
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- This adapter must settle the original Writable completion callback after native WriteFile.
  async #sendFrame(chunk: unknown, callback: (cause?: Error | null) => void): Promise<void> {
    try {
      if (!Buffer.isBuffer(chunk) || chunk.length > 128 || chunk.at(-1) !== 0) { throw error("OUTBOUND_FRAME"); }
      const parsed: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8"));
      if (!record(parsed) || !exact(parsed, ["id", "method"]) || typeof parsed["id"] !== "number" ||
          !Number.isSafeInteger(parsed["id"]) || parsed["id"] < 1 || parsed["id"] > 32 ||
          (parsed["method"] !== "Browser.getVersion" && parsed["method"] !== "Target.getTargets") ||
          chunk.toString() !== `${JSON.stringify({ id: parsed["id"], method: parsed["method"] })}\0`) { throw error("OUTBOUND_FRAME"); }
      const result = await this.#request({ action: "send", requestId: parsed["id"], method: parsed["method"] });
      if (!exact(result, ["written"]) || result["written"] !== true) { throw error("WRITE_ACK"); }
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Writable completion must be the terminal branch operation.
      callback(); return;
    } catch {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Native failure settles the Writable callback as the terminal branch operation.
      callback(error("WRITE_FAILED")); return;
    }
  }
  #request(request: RecordValue): Promise<RecordValue> {
    this.#available();
    if (this.#pending !== null) { throw error("REQUEST_PENDING"); }
    const deferred = Promise.withResolvers<RecordValue>(), id = randomBytes(16).toString("hex");
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject, written: false, reply: null,
      timer: setTimeout(() => { this.#fail("HELPER_DEADLINE"); }, 15_000) };
    this.#pending = pending;
    try {
      const data = `${JSON.stringify({ ...this.#binding, ...request, id })}\n`;
      if (Buffer.byteLength(data) > 4096) { throw error("REQUEST_SIZE"); }
      this.#child.stdin.write(data, cause => {
        if (cause !== null && cause !== undefined) { this.#fail("HELPER_WRITE"); }
        else if (this.#pending === pending) { pending.written = true; this.#settle(); }
      });
    } catch { this.#fail("HELPER_WRITE"); }
    return deferred.promise;
  }
  #settle(): void {
    const pending = this.#pending;
    if (pending !== null && pending.written && pending.reply !== null && this.#failure === null) {
      this.#pending = null; clearTimeout(pending.timer);
      const reply = pending.reply;
      if (reply["ok"] === false) { pending.reject(error("NATIVE_REFUSAL")); }
      else if (record(reply["result"])) { pending.resolve(reply["result"]); }
      else { pending.reject(error("HELPER_REPLY")); }
    }
  }
  #fail(reason: string): void {
    this.#failure ??= reason; this.#buffer = Buffer.alloc(0);
    const pending = this.#pending; this.#pending = null;
    if (pending !== null) { clearTimeout(pending.timer); pending.reject(error(this.#failure)); }
    // Do not end, destroy, signal, unref or detach this original helper.
  }
  readonly #data = (chunk: unknown): void => {
    if (this.#failure !== null) { return; }
    if (!Buffer.isBuffer(chunk) || chunk.length > MAX_LINE || this.#total + chunk.length > MAX_TOTAL || this.#buffer.length + chunk.length > MAX_LINE) { this.#fail("HELPER_BOUND"); return; }
    this.#total += chunk.length; this.#buffer = Buffer.concat([this.#buffer, chunk]);
    const newline = this.#buffer.indexOf(10);
    if (newline === -1) { return; }
    if (newline !== this.#buffer.length - 1) { this.#fail("HELPER_FRAMING"); return; }
    try {
      const raw = decodeCurrentPcbDiagnosticJson(this.#buffer.subarray(0, newline));
      const pending = this.#pending;
      if (!record(raw) || pending === null || pending.reply !== null || raw["id"] !== pending.id ||
          (raw["ok"] === true ? !exact(raw, ["id", "ok", "result"]) || !record(raw["result"]) :
            raw["ok"] !== false || !exact(raw, ["id", "ok", "error"]) || typeof raw["error"] !== "string" || !/^pcb-diagnostic-[a-z-]{1,80}$/u.test(raw["error"]))) { this.#fail("HELPER_REPLY"); return; }
      this.#buffer = Buffer.alloc(0); pending.reply = raw; this.#settle();
    } catch { this.#fail("HELPER_FRAMING"); }
  };
  readonly #stderr = (): void => { this.#fail("HELPER_STDERR"); };
  readonly #childError = (): void => { this.#fail("HELPER_ERROR"); };
  readonly #childClose = (): void => { this.#childClosed = true; if (!this.#released) { this.#fail("HELPER_CLOSED"); } this.#closed.resolve(null); };
}

// Source remains private and unregistered until runtime qualification.
export async function startCurrentPcbDiagnosticOwner(): Promise<CurrentPcbDiagnosticOwner> {
  const helperPath = fileURLToPath(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  const before = await lstat(helperPath);
  const verify = async (): Promise<void> => {
    const first = await lstat(helperPath);
    if (!first.isFile() || first.isSymbolicLink() || first.nlink !== 1 || first.size > 65_536 ||
        first.dev !== before.dev || first.ino !== before.ino || first.size !== before.size ||
        first.mtimeMs !== before.mtimeMs || first.ctimeMs !== before.ctimeMs || await realpath(helperPath) !== helperPath ||
        createHash("sha256").update(await readFile(helperPath)).digest("hex") !== HELPER_SHA256) { throw error("HELPER_SOURCE"); }
    const after = await lstat(helperPath);
    if (after.dev !== first.dev || after.ino !== first.ino || after.size !== first.size || after.mtimeMs !== first.mtimeMs || after.ctimeMs !== first.ctimeMs) { throw error("HELPER_SOURCE"); }
  };
  await verify();
  const distro = process.env["WSL_DISTRO_NAME"];
  let windowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(helperPath)) { windowsPath = `${helperPath[5]?.toUpperCase()}:\\${helperPath.slice(7).replaceAll("/", "\\")}`; }
  else {
    if (distro === undefined || !/^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distro)) { throw error("WSL_PATH"); }
    windowsPath = `\\\\wsl.localhost\\${distro}${helperPath.replaceAll("/", "\\")}`;
  }
  // PowerShell executes exactly the bytes hashed through this retained file.
  // A short encoded bootstrap avoids the Windows command-length limit for the
  // Entire native helper and avoids reopening a pathname after byte admission.
  const bootstrap = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';` +
    `$file=[IO.File]::Open('${windowsPath.replaceAll("'", "''")}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);` +
    `try{if($file.Length -gt 65536){throw 'pcb-diagnostic-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;` +
    `while($offset -lt $bytes.Length){$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if($count -le 0){throw 'pcb-diagnostic-helper-eof'};$offset+=$count};` +
    `$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};` +
    `if($digest -cne '${HELPER_SHA256}'){throw 'pcb-diagnostic-helper-hash'};` +
    `$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes)))}finally{$file.Dispose()}`;
  const encoded = Buffer.from(bootstrap, "utf16le").toString("base64");
  if (encoded.length > 16_000) { throw error("BOOTSTRAP_BOUND"); }
  const child = spawn("/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded],
    { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  const owner = new CurrentPcbDiagnosticOwner(child, verify); retainedOwners.add(owner); owner.start();
  return owner;
}
