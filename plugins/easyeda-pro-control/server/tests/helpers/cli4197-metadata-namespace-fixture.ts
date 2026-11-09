/** Production namespace bootstrap with explicit builtin-only synthetic peers.
 * No Bwrap, vendor executable, namespace or native helper is started. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { transform } from "esbuild";
import type { Cli4197NamespaceSpec } from "../../../scripts/cli4197-metadata/namespace.ts";

export async function cli4197NamespaceFixture(): Promise<Readonly<{
  run: () => void; stdout: PassThrough; stderr: PassThrough; close: (code: number | null, signal?: NodeJS.Signals | null) => void;
  deadline: () => void; report: () => Record<string, unknown>; exits: number[]; closed: number[]; calls: unknown[][];
  descriptors: Map<number, { dev: bigint; ino: bigint }>; files: Map<string, string>; setAccountWrong: () => void; setNamespaceShared: () => void;
}>> {
  const path = new URL("../../../scripts/cli4197-metadata/namespace.ts", import.meta.url); const originalRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  // oxlint-disable-next-line unicorn/prefer-event-target -- This synthetic peer must implement the production Node ChildProcess EventEmitter contract.
  const child = new EventEmitter(), stderr = new PassThrough(), stdout = new PassThrough();
  Object.assign(child, { stdout, stderr });
  const descriptors = new Map(Array.from({ length: 7 }, (_value, index) => [index + 3, { dev: 1n, ino: BigInt(index + 3) }]));
  const calls: unknown[][] = [], closed: number[] = [], exits: number[] = [], files = new Map<string, string>(), timers: (() => void)[] = [], written: Buffer[] = [];
  let accountWrong = false, namespaceShared = false;
  const builtins: Readonly<Record<string, unknown>> = {
    "node:fs": {
      existsSync: (value: string): boolean => files.has(value),
      writeFileSync: (name: string, value: string, options: { flag: string; mode: number }): void => { assert.equal(options.flag, "wx"); assert.equal(options.mode, 0o444); assert.equal(files.has(name), false); files.set(name, value); },
      chmodSync: (name: string, mode: number): void => { assert.equal(name, "/etc"); assert.equal(mode, 0o555); },
      readlinkSync: (value: string): string => `${value.slice(value.lastIndexOf("/") + 1)}:[${namespaceShared ? "1" : "2"}]`,
      readFileSync: (value: string): Buffer => { assert.equal(value, "/proc/self/exe"); return Buffer.from("synthetic-node"); },
      fstatSync: (fd: number): { dev: bigint; ino: bigint } => { const value = descriptors.get(fd); assert.ok(value !== undefined); return value; },
      closeSync: (fd: number): void => { assert.ok(descriptors.delete(fd)); closed.push(fd); },
      readdirSync: (): string[] => ["0", "1", "2", ...[...descriptors.keys()].map(String)],
      statSync: (name: string): { dev: bigint; ino: bigint } => { const fd = Number(name.slice(name.lastIndexOf("/") + 1)), value = descriptors.get(fd); assert.ok(value !== undefined); return value; },
      writeSync: (fd: number, value: Buffer, offset: number): number => { assert.equal(fd, 1); written.push(value.subarray(offset)); return value.length - offset; },
    },
    "node:os": { networkInterfaces: (): object => ({ lo: [] }), userInfo: (): object => ({ uid: 1000, gid: 1000, username: accountWrong ? "host-user" : "agent", homedir: "/home/agent" }) },
    "node:child_process": { spawn: (...args: unknown[]): EventEmitter => { calls.push(args); assert.deepEqual(closed, [3, 4, 5, 6, 7, 8, 9]); assert.equal(descriptors.size, 0); return child; } },
  };
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInNewContext(`(function(require,module,exports){${output.code}\n})`, {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Retain the exact timer callback for deterministic PID1 deadline tests without real waits.
    Buffer, setTimeout: (callback: () => void): number => { timers.push(callback); return timers.length; }, clearTimeout: (): void => undefined,
    process: { pid: 1, version: "v24.18.0", getuid: (): number => 1000, getgid: (): number => 1000, env: { HOME: "/home/agent" }, exit: (code: number): void => { exits.push(code); } },
  });
  assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [(name: string): unknown => builtins[name] ?? originalRequire(name), loaded, loaded.exports]);
  const run = loaded.exports["runCli4197MetadataNamespace"]; assert.ok(typeof run === "function");
  const spec: Cli4197NamespaceSpec = { command: "openHelp", nodeSha256: createHash("sha256").update("synthetic-node").digest("hex"),
    hostNamespaces: { user: "user:[1]", mnt: "mnt:[1]", pid: "pid:[1]", net: "net:[1]", ipc: "ipc:[1]", uts: "uts:[1]" },
    roleIdentities: Object.fromEntries([...descriptors].map(([fd, value]) => [String(fd), { dev: value.dev.toString(), ino: value.ino.toString() }])) };
  return { run: (): void => { Reflect.apply(run, undefined, [spec]); }, stdout, stderr, closed, exits, calls, descriptors, files,
    close: (code, signal = null): void => { child.emit("close", code, signal); },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Invoke the original fixed timer callback as the deterministic synthetic deadline event.
    deadline: (): void => { const callback = timers[0]; assert.ok(callback !== undefined); callback(); },
    report: (): Record<string, unknown> => { const value: unknown = JSON.parse(Buffer.concat(written).toString("utf8")); assert.ok(value !== null && typeof value === "object" && !Array.isArray(value)); return Object.fromEntries(Object.entries(value)); },
    setAccountWrong: (): void => { accountWrong = true; }, setNamespaceShared: (): void => { namespaceShared = true; } };
}
