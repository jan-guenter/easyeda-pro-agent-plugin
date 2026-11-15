import type { FileHandle } from "node:fs/promises";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
/** Fixed readonly Windows-to-WSL bootstrap. Its serialized functions accept
 * data only and create no facade, lease or native owner before byte checks. */
interface WslFileSpec { readonly relativePath: string; readonly mode: number; readonly maximumBytes: number }
export interface WindowsWslRuntimeFile { readonly relativePath: string; readonly bytes: number; readonly sha256: string }
export interface WindowsWslRuntimePacket {
  readonly nodeExecutable: string; readonly pluginRoot: string; readonly machineProfilePath: string;
  readonly files: readonly WindowsWslRuntimeFile[];
}
function wslNeed(value: unknown): asserts value {
  if (value !== true) { throw new Error("windows-wsl-runtime-refused"); }
}
function wslObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function isWindowsWslLinuxPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 2 || value.length > 4096 ||
      !value.isWellFormed() || !value.startsWith("/")) { return false; }
  for (const character of value) {
    const code = character.codePointAt(0); if (code === undefined || code < 32 || code === 127) { return false; }
  }
  const parts = value.slice(1).split("/");
  for (const part of parts) { if (part === "" || part === "." || part === "..") { return false; } }
  return true;
}
export function windowsWslRuntimeFiles(): readonly WslFileSpec[] {
  return [
    { relativePath: "server/dist/server.mjs", mode: 0o644, maximumBytes: 20 * 1024 * 1024 },
    { relativePath: "server/dist/upstream-supervisor.mjs", mode: 0o644, maximumBytes: 16 * 1024 * 1024 },
    { relativePath: "server/bin/easyeda-fd-sanitizer", mode: 0o755, maximumBytes: 16 * 1024 * 1024 },
    { relativePath: "server/dist/control-session-manager.mjs", mode: 0o644, maximumBytes: 16 * 1024 * 1024 },
    { relativePath: "reviewed-compatibility.json", mode: 0o644, maximumBytes: 16 * 1024 * 1024 },
    { relativePath: ".codex-plugin/plugin.json", mode: 0o644, maximumBytes: 16 * 1024 * 1024 },
  ];
}
function parseWslRuntimePacket(text: string): WindowsWslRuntimePacket {
  wslNeed(Buffer.byteLength(text) <= 24 * 1024);
  const value: unknown = JSON.parse(text);
  wslNeed(wslObject(value) && Object.keys(value).length === 4 &&
    isWindowsWslLinuxPath(value["nodeExecutable"]) && isWindowsWslLinuxPath(value["pluginRoot"]) && isWindowsWslLinuxPath(value["machineProfilePath"]) &&
    Array.isArray(value["files"]));
  const rows: readonly unknown[] = value["files"];
  const specs = windowsWslRuntimeFiles(); const files: WindowsWslRuntimeFile[] = [];
  wslNeed(rows.length === specs.length);
  let total = 0;
  for (const [index, row] of rows.entries()) {
    const spec = specs[index];
    wslNeed(spec !== undefined && wslObject(row) && Object.keys(row).length === 3 && row["relativePath"] === spec.relativePath &&
      typeof row["bytes"] === "number" && Number.isSafeInteger(row["bytes"]) && row["bytes"] > 0 && row["bytes"] <= spec.maximumBytes &&
      typeof row["sha256"] === "string" && /^[a-f\d]{64}$/u.test(row["sha256"]));
    total += row["bytes"];
    files.push({ relativePath: spec.relativePath, bytes: row["bytes"], sha256: row["sha256"] });
  }
  wslNeed(total <= 64 * 1024 * 1024);
  return { nodeExecutable: value["nodeExecutable"], pluginRoot: value["pluginRoot"], machineProfilePath: value["machineProfilePath"], files };
}
interface WslCapturedFile { readonly file: FileHandle; readonly content: Buffer }
async function openWslVerifiedFile(filename: string, bytes: number, sha256: string, mode: number): Promise<WslCapturedFile> {
  const crypto = await import("node:crypto"), fs = await import("node:fs/promises"), native = await import("node:fs");
  wslNeed(await fs.realpath(filename) === filename);
  // oxlint-disable-next-line no-bitwise -- Refuse a symlink at the retained Linux descriptor boundary.
  const file = await fs.open(filename, native.constants.O_RDONLY | native.constants.O_NOFOLLOW);
  try {
    const before = await file.stat({ bigint: true });
    // oxlint-disable-next-line no-bitwise -- Permission and special bits are one kernel field.
    wslNeed(before.isFile() && before.nlink === 1n && Number(before.mode & 0o7777n) === mode && before.size === BigInt(bytes));
    const content = Buffer.alloc(bytes); let offset = 0;
    while (offset < content.length) { const read = await file.read(content, offset, content.length - offset, offset); wslNeed(read.bytesRead > 0); offset += read.bytesRead; }
    const extra = await file.read(Buffer.alloc(1), 0, 1, offset);
    wslNeed(extra.bytesRead === 0 && crypto.createHash("sha256").update(content).digest("hex") === sha256);
    const after = await file.stat({ bigint: true }), current = await fs.lstat(filename, { bigint: true });
    wslNeed(after.isFile() && current.isFile() && !current.isSymbolicLink() && current.dev === before.dev && current.ino === before.ino &&
      after.dev === before.dev && after.ino === before.ino && after.nlink === 1n && after.mode === before.mode && after.size === before.size &&
      after.mtimeNs === before.mtimeNs && after.ctimeNs === before.ctimeNs && current.nlink === after.nlink && current.mode === after.mode &&
      current.size === after.size && current.mtimeNs === after.mtimeNs && current.ctimeNs === after.ctimeNs && await fs.realpath(filename) === filename);
    return { file, content };
  } catch (error) { await file.close(); throw error; }
}
async function verifyWslRuntimeFile(root: string, expected: WindowsWslRuntimeFile): Promise<Buffer> {
  const path = await import("node:path"), spec = windowsWslRuntimeFiles().find(row => row.relativePath === expected.relativePath);
  wslNeed(spec !== undefined); const captured = await openWslVerifiedFile(path.join(root, expected.relativePath), expected.bytes, expected.sha256, spec.mode);
  try { return captured.content; } finally { await captured.file.close(); }
}
async function captureWslSandbox(content: Buffer): Promise<WslCapturedFile> {
  const manifest: unknown = JSON.parse(content.toString("utf8"));
  wslNeed(wslObject(manifest) && wslObject(manifest["upstream"]) && wslObject(manifest["upstream"]["launcher"]) && wslObject(manifest["upstream"]["launcher"]["sandbox"]));
  const sandbox = manifest["upstream"]["launcher"]["sandbox"];
  wslNeed(isWindowsWslLinuxPath(sandbox["command"]) && typeof sandbox["commandSha256"] === "string" && /^[a-f\d]{64}$/u.test(sandbox["commandSha256"]));
  const fs = await import("node:fs/promises"); const filename = await fs.realpath(sandbox["command"]); const before = await fs.lstat(filename, { bigint: true });
  wslNeed(before.size > 0n && before.size <= 16n * 1024n * 1024n);
  return openWslVerifiedFile(filename, Number(before.size), sandbox["commandSha256"], 0o755);
}
async function wslSiblingMount(filename: string): Promise<readonly string[]> {
  const fs = await import("node:fs/promises");
  try {
    const current = await fs.lstat(filename);
    if (current.isSymbolicLink()) { return ["--symlink", await fs.readlink(filename), filename]; }
    return [filename === "/dev" ? "--dev-bind-try" : "--bind-try", filename, filename];
  } catch (error) {
    if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) { throw error; }
    return [];
  }
}
/** Freeze every selected pathname component; unrelated sibling trees keep
 * their original shared mounts and remain subject to normal Linux admission. */
async function planWslNamespace(packet: WindowsWslRuntimePacket): Promise<readonly string[]> {
  const fs = await import("node:fs/promises"), path = await import("node:path");
  const directories = new Set<string>(), targets = new Set(windowsWslRuntimeFiles().map(row => path.join(packet.pluginRoot, row.relativePath)));
  for (const target of targets) { let at = path.dirname(target); for (;;) { directories.add(at); if (at === "/") { break; } at = path.dirname(at); } }
  wslNeed(directories.size <= 256 && !directories.has(path.dirname(packet.machineProfilePath)));
  const args: string[] = []; let bytes = 0, entries = 0;
  const append = { values(...values: string[]): void { for (const value of values) { bytes += Buffer.byteLength(value) + 1; wslNeed(bytes <= 1024 * 1024); args.push(value); } } };
  append.values("--unshare-user");
  for (const directory of [...directories].toSorted((left, right) => left.length - right.length)) {
    const info = await fs.lstat(directory, { bigint: true }); wslNeed(info.isDirectory() && !info.isSymbolicLink() && await fs.realpath(directory) === directory);
    // oxlint-disable-next-line no-bitwise -- Preserve original ancestor permission/special bits in the private directory skeleton.
    append.values("--perms", Number(info.mode & 0o7777n).toString(8), "--dir", directory);
    for await (const entry of await fs.opendir(directory)) {
      entries += 1; wslNeed(entries <= 8192); const filename = path.join(directory, entry.name);
      if (!directories.has(filename) && !targets.has(filename)) { append.values(...await wslSiblingMount(filename)); }
    }
  }
  for (const [index, spec] of windowsWslRuntimeFiles().entries()) { append.values("--perms", spec.mode.toString(8), "--file", String(index + 3), path.join(packet.pluginRoot, spec.relativePath)); }
  append.values("--remount-ro", "/", "--cap-drop", "ALL", "--chdir", packet.pluginRoot, "--", packet.nodeExecutable,
    path.join(packet.pluginRoot, "server/dist/server.mjs"), "--machine-launch", "--profile", packet.machineProfilePath);
  return args;
}

/** Only setup pipes carry immutable captured buffers. Bubblewrap closes
 * them before Node; the original child/input remain joined without signals. */
async function launchWslNamespace(packet: WindowsWslRuntimePacket, snapshots: readonly Buffer[], sandbox: FileHandle, args: readonly string[]): Promise<void> {
  const childProcess = await import("node:child_process"), stream = await import("node:stream");
  wslNeed(snapshots.length === packet.files.length);
  const stdio: ("pipe" | "inherit")[] = ["pipe", "inherit", "inherit", ...snapshots.map((): "pipe" => "pipe")];
  const child = childProcess.spawn(`/proc/${process.pid}/fd/${sandbox.fd}`, args, { stdio, cwd: "/", shell: false });
  const closed = Promise.withResolvers<{ code: number | null; signal: NodeJS.Signals | null }>(); let failed = false;
  child.once("error", () => { failed = true; }); child.once("close", (code, signal) => { closed.resolve({ code, signal }); });
  const input = child.stdin;
  if (input === null) { failed = true; } else { input.on("error", () => { failed = true; }); }
  const control = {
    // oxlint-disable-next-line typescript/no-invalid-void-type -- Explicitly this-free callback preserves bundled serialization without generated naming helpers.
    fail(this: void): void { failed = true; },
    // oxlint-disable-next-line typescript/no-invalid-void-type -- Explicitly this-free callback is registered and removed by the same original method identity.
    closeInput(this: void): void { if (input !== null) { process.stdin.unpipe(input); if (!input.destroyed && !input.writableEnded) { input.end(); } } },
  };
  for (const [index, content] of snapshots.entries()) {
    const pipe = child.stdio[index + 3];
    if (pipe instanceof stream.Writable) { pipe.on("error", control.fail); pipe.end(content); } else { failed = true; }
  }
  process.on("SIGTERM", control.closeInput); process.on("SIGINT", control.closeInput);
  if (input !== null) { process.stdin.pipe(input); }
  try { const result = await closed.promise; wslNeed(!failed && result.code !== null && result.signal === null); process.exitCode = result.code; }
  finally { process.off("SIGTERM", control.closeInput); process.off("SIGINT", control.closeInput); if (input !== null) { process.stdin.unpipe(input); } process.stdin.pause(); }
}

async function runWslRuntimeBootstrap(): Promise<void> {
  const [mode, text, ...extra] = process.argv.slice(1);
  wslNeed(process.platform === "linux" && process.arch === "x64" && process.version === "v24.18.0" &&
    (mode === "launch" || mode === "verify") && typeof text === "string" && extra.length === 0);
  const fs = await import("node:fs/promises"), packet = parseWslRuntimePacket(text);
  wslNeed(process.execPath === packet.nodeExecutable && await fs.realpath(packet.pluginRoot) === packet.pluginRoot);
  const root = await fs.lstat(packet.pluginRoot, { bigint: true }); wslNeed(root.isDirectory() && !root.isSymbolicLink());
  const snapshots: Buffer[] = [];
  for (const file of packet.files) { snapshots.push(await verifyWslRuntimeFile(packet.pluginRoot, file)); }
  const current = await fs.lstat(packet.pluginRoot, { bigint: true });
  wslNeed(current.isDirectory() && current.dev === root.dev && current.ino === root.ino && current.mode === root.mode && await fs.realpath(packet.pluginRoot) === packet.pluginRoot);
  const compatibility = snapshots[4]; wslNeed(compatibility !== undefined); const sandbox = await captureWslSandbox(compatibility);
  try {
    const args = await planWslNamespace(packet);
    if (mode === "verify") {
      process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
        platform: "linux-x64", nodeVersion: process.version, fileCount: packet.files.length, nativeOwnerAllocated: false })}\n`); return;
    }
    await launchWslNamespace(packet, snapshots, sandbox.file, args);
  } finally { await sandbox.file.close(); }
}
/** Function bodies are serialized after TypeScript erasure. All non-builtin
 * helpers are emitted together, including their bundled lexical names. */
export function windowsWslRuntimeProgram(): string {
  const helpers = [wslNeed, wslObject, isWindowsWslLinuxPath, windowsWslRuntimeFiles, parseWslRuntimePacket, openWslVerifiedFile, verifyWslRuntimeFile, captureWslSandbox, wslSiblingMount, planWslNamespace, launchWslNamespace];
  const declarations = helpers.map(helper => helper.toString()).join("\n");
  return `${declarations  }\ntry { await (${  runWslRuntimeBootstrap.toString()
    })(); } catch { process.stderr.write('{"ok":false,"error":"windows-wsl-runtime-refused"}\\n'); process.exitCode = 1; }\n`;
}

/** Validate an internal packet before serializing it into an OS argument. */
export function serializeWindowsWslRuntimePacket(input: unknown): string {
  const text = JSON.stringify(captureCurrentPcbStringClockReply(input).value);
  return JSON.stringify(parseWslRuntimePacket(text));
}
