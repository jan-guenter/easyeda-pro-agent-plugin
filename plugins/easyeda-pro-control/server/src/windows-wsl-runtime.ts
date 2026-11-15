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
async function verifyWslRuntimeFile(root: string, expected: WindowsWslRuntimeFile): Promise<void> {
  const fs = await import("node:fs/promises"); const path = await import("node:path"); const crypto = await import("node:crypto");
  const filename = path.join(root, expected.relativePath);
  wslNeed(await fs.realpath(filename) === filename);
  const file = await fs.open(filename, "r");
  try {
    const before = await file.stat({ bigint: true });
    const spec = windowsWslRuntimeFiles().find(row => row.relativePath === expected.relativePath);
    // oxlint-disable-next-line no-bitwise -- Unix permission and special bits form a kernel bit field.
    const permissions = Number(before.mode & 0o7777n);
    wslNeed(spec !== undefined && before.isFile() && before.nlink === 1n && permissions === spec.mode && before.size === BigInt(expected.bytes));
    const content = Buffer.alloc(expected.bytes);
    let offset = 0;
    while (offset < content.length) {
      const read = await file.read(content, offset, content.length - offset, offset);
      wslNeed(read.bytesRead > 0); offset += read.bytesRead;
    }
    const extra = await file.read(Buffer.alloc(1), 0, 1, offset);
    wslNeed(extra.bytesRead === 0 && crypto.createHash("sha256").update(content).digest("hex") === expected.sha256);
    const after = await file.stat({ bigint: true }), current = await fs.lstat(filename, { bigint: true });
    wslNeed(after.isFile() && current.isFile() && !current.isSymbolicLink() && current.dev === before.dev && current.ino === before.ino &&
      after.dev === before.dev && after.ino === before.ino && after.nlink === 1n && after.mode === before.mode &&
      after.size === before.size && after.mtimeNs === before.mtimeNs && after.ctimeNs === before.ctimeNs &&
      current.nlink === after.nlink && current.mode === after.mode && current.size === after.size &&
      current.mtimeNs === after.mtimeNs && current.ctimeNs === after.ctimeNs && await fs.realpath(filename) === filename);
  } finally { await file.close(); }
}
async function runWslRuntimeBootstrap(): Promise<void> {
  const [mode, text, ...extra] = process.argv.slice(1);
  wslNeed(process.platform === "linux" && process.arch === "x64" && process.version === "v24.18.0" &&
    (mode === "launch" || mode === "verify") && typeof text === "string" && extra.length === 0);
  const packet = parseWslRuntimePacket(text); const fs = await import("node:fs/promises"); const path = await import("node:path");
  wslNeed(process.execPath === packet.nodeExecutable && await fs.realpath(packet.pluginRoot) === packet.pluginRoot);
  const root = await fs.lstat(packet.pluginRoot, { bigint: true });
  wslNeed(root.isDirectory() && !root.isSymbolicLink());
  for (const file of packet.files) { await verifyWslRuntimeFile(packet.pluginRoot, file); }
  const current = await fs.lstat(packet.pluginRoot, { bigint: true });
  wslNeed(current.isDirectory() && current.dev === root.dev && current.ino === root.ino && current.mode === root.mode &&
    await fs.realpath(packet.pluginRoot) === packet.pluginRoot);
  if (mode === "verify") {
    process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
      platform: "linux-x64", nodeVersion: process.version, fileCount: packet.files.length, nativeOwnerAllocated: false })  }\n`);
    return;
  }
  wslNeed(typeof process.execve === "function");
  process.chdir(packet.pluginRoot);
  process.execve(process.execPath, [packet.nodeExecutable, path.join(packet.pluginRoot, "server/dist/server.mjs"),
    "--machine-launch", "--profile", packet.machineProfilePath], process.env);
}
/** Function bodies are serialized after TypeScript erasure. All non-builtin
 * helpers are emitted together, including their bundled lexical names. */
export function windowsWslRuntimeProgram(): string {
  const helpers = [wslNeed, wslObject, isWindowsWslLinuxPath, windowsWslRuntimeFiles, parseWslRuntimePacket, verifyWslRuntimeFile];
  const declarations = helpers.map(helper => helper.toString()).join("\n");
  return `${declarations  }\ntry { await (${  runWslRuntimeBootstrap.toString()
    })(); } catch { process.stderr.write('{"ok":false,"error":"windows-wsl-runtime-refused"}\\n'); process.exitCode = 1; }\n`;
}

/** Validate an internal packet before serializing it into an OS argument. */
export function serializeWindowsWslRuntimePacket(input: unknown): string {
  const text = JSON.stringify(captureCurrentPcbStringClockReply(input).value);
  return JSON.stringify(parseWslRuntimePacket(text));
}
