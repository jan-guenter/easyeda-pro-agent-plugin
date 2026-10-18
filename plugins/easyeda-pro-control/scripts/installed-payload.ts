import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, opendir, realpath } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { promisify } from "node:util";

// This is a read-only installation comparison, never runtime admission.
const SUBTREE = "plugins/easyeda-pro-control";
const MAX_ENTRIES = 5000;
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_TOTAL_BYTES = 128 * 1024 * 1024;
const MAX_TREE_BYTES = 2 * 1024 * 1024;
const MAX_DURATION_MS = 120_000;
const HASH_PATTERN = /^[a-f0-9]{40}$/u;
// oxlint-disable-next-line typescript/strict-void-return -- promisify consumes execFile's callback, not its ChildProcess return.
const execFileAsync = promisify(execFile);

interface TreeEntry {
  readonly hash: string;
  readonly kind: "blob" | "tree";
  readonly mode: string;
  readonly path: string;
}

interface InventoryEntry {
  readonly bytes: number;
  readonly mode: string;
  readonly path: string;
  readonly sha256: string;
}

export interface InstalledPayloadRequest {
  readonly commit: string;
  readonly installedRoot: string;
  readonly repositoryRoot: string;
}

export interface InstalledPayloadResult {
  readonly schema: "easyeda-pro-control.installed-payload.v1";
  readonly scope: "read-only-file-comparison;not-runtime-admission";
  readonly commit: string;
  readonly tree: string;
  readonly installedRoot: string;
  readonly fileCount: number;
  readonly directoryCountIncludingRoot: number;
  readonly bytes: number;
  readonly inventorySha256: string;
}

function identity(value: BigIntStats): string {
  return [value.dev, value.ino, value.mode, value.nlink, value.size, value.mtimeNs, value.ctimeNs].join(":");
}

function checkedPath(path: string): void {
  // oxlint-disable-next-line eslint/no-control-regex -- Reject line delimiters and controls in explicit filesystem roots.
  if (!isAbsolute(path) || path === "/" || path !== resolve(path) || path.length > 4096 || /[\u0000-\u001F\u007F]/u.test(path)) {
    throw new Error("An explicit canonical absolute directory path is required.");
  }
}

function safeRelativePath(path: string): boolean {
  // oxlint-disable-next-line eslint/no-control-regex -- Git paths must not contain control bytes or platform-dependent aliases.
  return path.length > 0 && path.length <= 1024 && !/[\\:\u0000-\u001F\u007F]/u.test(path) &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== "..") && path.split("/").length <= 32;
}

async function canonicalDirectory(path: string): Promise<string> {
  checkedPath(path);
  const information = await lstat(path, { bigint: true });
  if (!information.isDirectory() || information.isSymbolicLink() || await realpath(path) !== path) {
    throw new Error("Directory is missing, linked or noncanonical.");
  }
  return identity(information);
}

function parseTree(bytes: Buffer): Map<string, TreeEntry> {
  const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (!source.endsWith("\0")) { throw new Error("Git tree output is incomplete."); }
  const rows = source.slice(0, -1).split("\0");
  if (rows.length === 0 || rows.length > MAX_ENTRIES) { throw new Error("Git tree exceeds the entry bound."); }
  const entries = new Map<string, TreeEntry>();
  for (const row of rows) {
    const match = /^(040000|100644|100755) (tree|blob) ([a-f0-9]{40})\t(.+)$/u.exec(row);
    if (match === null) { throw new Error("Git tree contains an unsupported entry."); }
    const [, mode, kind, hash, path] = match;
    if (mode === undefined || hash === undefined || path === undefined || (kind !== "tree" && kind !== "blob") ||
      (kind === "tree") !== (mode === "040000") || !safeRelativePath(path) || entries.has(path)) {
      throw new Error("Git tree contains an unsafe or duplicate path.");
    }
    entries.set(path, { hash, kind, mode, path });
  }
  return entries;
}

export async function verifyInstalledPayload(request: InstalledPayloadRequest): Promise<InstalledPayloadResult> {
  if (!HASH_PATTERN.test(request.commit)) { throw new Error("Expected a full lowercase SHA-1 commit ID."); }
  const repositoryIdentity = await canonicalDirectory(request.repositoryRoot);
  const installedIdentity = await canonicalDirectory(request.installedRoot);
  const deadline = Date.now() + MAX_DURATION_MS;
  function remaining(): number {
    const duration = deadline - Date.now();
    if (duration <= 0) { throw new Error("Installed payload comparison exceeded its deadline."); }
    return Math.min(duration, 10_000);
  }
  async function git(args: readonly string[], maxBuffer = MAX_TREE_BYTES): Promise<Buffer> {
    const result = await execFileAsync("/usr/bin/git", ["--no-pager", "--no-replace-objects", "-c", "core.fsmonitor=false", "-c", "protocol.allow=never", "-C", request.repositoryRoot, ...args], {
      encoding: "buffer", maxBuffer, timeout: remaining(),
      env: { PATH: "/usr/bin:/bin", LC_ALL: "C", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_OPTIONAL_LOCKS: "0", GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0" },
    });
    if (result.stderr.length > 0) { throw new Error("Git emitted unexpected diagnostics."); }
    return result.stdout;
  }
  async function assertGitHead(): Promise<void> {
    const head = await git(["rev-parse", "--verify", "HEAD^{commit}"]);
    if (head.toString("utf8").trim() !== request.commit) {
      throw new Error("Repository HEAD does not match the requested commit.");
    }
  }
  await assertGitHead();
  const topLevel = await git(["rev-parse", "--show-toplevel"]);
  const objectFormat = await git(["rev-parse", "--show-object-format"]);
  if (topLevel.toString("utf8").trim() !== request.repositoryRoot || objectFormat.toString("utf8").trim() !== "sha1") {
    throw new Error("Expected the canonical root of a SHA-1 Git repository.");
  }
  const treeBytes = await git(["rev-parse", "--verify", `${request.commit}:${SUBTREE}`]);
  const tree = treeBytes.toString("utf8").trim();
  if (!HASH_PATTERN.test(tree)) { throw new Error("The committed plugin subtree is unavailable."); }
  const expected = parseTree(await git(["ls-tree", "-r", "-t", "-z", tree]));
  const seen = new Set<string>();
  const inventory: InventoryEntry[] = [];
  const samples = new Map<string, string>();
  let totalBytes = 0;
  let directoryCount = 0;

  async function inspectFile(path: string, entry: TreeEntry): Promise<void> {
    const object = await git(["cat-file", "blob", entry.hash], MAX_FILE_BYTES);
    totalBytes += object.length;
    if (totalBytes > MAX_TOTAL_BYTES) { throw new Error("Installed package exceeds its total byte bound."); }
    const file = await open(path, fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW + fsConstants.O_NONBLOCK);
    try {
      const initial = await file.stat({ bigint: true });
      const expectedMode = entry.mode === "100755" ? 0o755n : 0o644n;
      if (!initial.isFile() || initial.nlink !== 1n || initial.mode % 4096n !== expectedMode || initial.size !== BigInt(object.length)) {
        throw new Error("Installed file type, links, mode or byte count differs.");
      }
      const bytes = Buffer.alloc(object.length + 1);
      let count = 0;
      while (count < bytes.length) {
        remaining();
        const read = await file.read(bytes, count, bytes.length - count, count);
        if (read.bytesRead === 0) { break; }
        count += read.bytesRead;
      }
      const after = await file.stat({ bigint: true });
      const named = await lstat(path, { bigint: true });
      if (count !== object.length || !bytes.subarray(0, count).equals(object) || identity(initial) !== identity(after) || identity(after) !== identity(named)) {
        throw new Error("Installed file bytes or identity changed during comparison.");
      }
      samples.set(entry.path, identity(after));
      inventory.push({ bytes: count, mode: entry.mode, path: entry.path, sha256: createHash("sha256").update(object).digest("hex") });
    } finally { await file.close(); }
  }

  async function inspectDirectory(path: string, relativePath: string): Promise<void> {
    remaining();
    const handle = await open(path, fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW + fsConstants.O_DIRECTORY);
    try {
      const before = await handle.stat({ bigint: true });
      if (!before.isDirectory() || before.mode % 4096n !== 0o755n) { throw new Error("Installed directory must have mode 0755."); }
      directoryCount += 1;
      if (directoryCount > MAX_ENTRIES) { throw new Error("Installed directory count exceeds its bound."); }
      const descriptorPath = `/proc/self/fd/${String(handle.fd)}`;
      const directory = await opendir(descriptorPath, { bufferSize: 64 });
      for await (const child of directory) {
        const childRelative = relativePath === "" ? child.name : `${relativePath}/${child.name}`;
        const entry = expected.get(childRelative);
        if (entry === undefined || seen.has(childRelative) || !safeRelativePath(childRelative)) { throw new Error("Installed package contains an extra or unsafe entry."); }
        seen.add(childRelative);
        const childPath = join(descriptorPath, child.name);
        await (entry.kind === "tree" ? inspectDirectory(childPath, childRelative) : inspectFile(childPath, entry));
      }
      const after = await handle.stat({ bigint: true });
      const named = await lstat(path, { bigint: true });
      if (identity(before) !== identity(after) || identity(after) !== identity(named)) { throw new Error("Installed directory changed during comparison."); }
      samples.set(relativePath, identity(after));
    } finally { await handle.close(); }
  }

  await inspectDirectory(request.installedRoot, "");
  if (seen.size !== expected.size) { throw new Error("Installed package is missing committed entries."); }
  for (const [path, sample] of samples) {
    remaining();
    if (identity(await lstat(join(request.installedRoot, path), { bigint: true })) !== sample) { throw new Error("Installed package changed before comparison completed."); }
  }
  await assertGitHead();
  if (await canonicalDirectory(request.repositoryRoot) !== repositoryIdentity || await canonicalDirectory(request.installedRoot) !== installedIdentity) {
    throw new Error("A comparison root changed during verification.");
  }
  inventory.sort((left, right) => left.path < right.path ? -1 : Number(left.path > right.path));
  const directories = [...expected.values()].filter((entry) => entry.kind === "tree").map((entry) => entry.path).toSorted();
  return {
    schema: "easyeda-pro-control.installed-payload.v1", scope: "read-only-file-comparison;not-runtime-admission",
    commit: request.commit, tree, installedRoot: request.installedRoot, fileCount: inventory.length,
    directoryCountIncludingRoot: directoryCount, bytes: totalBytes,
    inventorySha256: createHash("sha256").update(JSON.stringify({ directories: ["", ...directories], files: inventory })).digest("hex"),
  };
}
