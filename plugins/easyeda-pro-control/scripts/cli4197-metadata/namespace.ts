/** Fixed Node PID1 bootstrap. Tests substitute builtins in an isolated VM;
 * production emits this exact first-party function and its fixed catalogue. */
import { chmodSync, closeSync, existsSync, fstatSync, readFileSync, readdirSync, readlinkSync, statSync, writeFileSync, writeSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { networkInterfaces, userInfo } from "node:os";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "../../server/src/current-pcb-string-clock-reply.ts";
import { CLI4197_METADATA_COMMANDS, CLI4197_METADATA_LIMITS } from "./profile.ts";
import type { Cli4197MetadataCommand } from "./profile.ts";

export const CLI4197_NAMESPACE_NAMES = Object.freeze(["user", "mnt", "pid", "net", "ipc", "uts"] as const);
export interface Cli4197NamespaceSpec {
  readonly command: Cli4197MetadataCommand; readonly nodeSha256: string;
  readonly hostNamespaces: Readonly<Record<typeof CLI4197_NAMESPACE_NAMES[number], string>>;
  readonly roleIdentities: Readonly<Record<string, Readonly<{ dev: string; ino: string }>>>;
}
const namespace = z.string().min(7).max(64).regex(/^(?:user|mnt|pid|net|ipc|uts):\[\d+\]$/u);
const number = z.string().regex(/^(?:0|[1-9]\d{0,19})$/u);
const roleSchema = z.strictObject({ dev: number, ino: number });
const specSchema = z.strictObject({ command: z.enum(["rootHelp", "openHelp", "apiHelp", "invokeHelp", "sessionListHelp", "viaCreateDocs"]), nodeSha256: z.string().regex(/^[a-f\d]{64}$/u),
  hostNamespaces: z.strictObject({ user: namespace, mnt: namespace, pid: namespace, net: namespace, ipc: namespace, uts: namespace }),
  roleIdentities: z.strictObject({ "3": roleSchema, "4": roleSchema, "5": roleSchema, "6": roleSchema, "7": roleSchema, "8": roleSchema, "9": roleSchema }),
});
/** Fail before vendor code unless this is the original isolated PID1 and all
 * seven original authority descriptor identities have been closed and audited.
 * PID1 exit, including its own deadline, closes its namespace descendants. */
/* oxlint-disable node/no-sync -- The fixed PID1 audits/closes inherited descriptors before vendor code and emits its final report synchronously before namespace exit. */
/* oxlint-disable unicorn/no-process-exit -- Exiting this original namespace PID1 is the kernel-backed descendant cleanup mechanism, including its fixed deadline. */
/* oxlint-disable unicorn/consistent-function-scoping -- This exact function is emitted as a standalone builtin-only bootstrap, so all helpers must remain inside its serialized body. */
export function runCli4197MetadataNamespace(spec: Cli4197NamespaceSpec): void {
  const need = (value: boolean): void => { if (!value) { throw new Error("CLI4197_METADATA_NAMESPACE_REFUSED"); } };
  need(process.pid === 1 && process.version === "v24.18.0" && process.getuid?.() === 1000 && process.getgid?.() === 1000);
  const names = ["user", "mnt", "pid", "net", "ipc", "uts"] as const;
  need(names.every(name => spec.hostNamespaces[name].startsWith(`${name}:[`)));
  const namespaces = Object.fromEntries(names.map(name => [name, readlinkSync(`/proc/self/ns/${name}`)]));
  need(names.every(name => namespaces[name] !== spec.hostNamespaces[name]));
  need(!existsSync("/root") && !existsSync("/mnt") && !existsSync("/proc/1/root/root") && !existsSync("/run/dbus/system_bus_socket"));
  need(process.env["HOME"] === "/home/agent" && process.env["DISPLAY"] === undefined && process.env["WAYLAND_DISPLAY"] === undefined && process.env["NODE_OPTIONS"] === undefined);
  need(!existsSync("/etc/passwd") && !existsSync("/etc/group"));
  writeFileSync("/etc/passwd", "agent:x:1000:1000:Private metadata agent:/home/agent:/bin/false\n", { flag: "wx", mode: 0o444 });
  writeFileSync("/etc/group", "agent:x:1000:\n", { flag: "wx", mode: 0o444 }); chmodSync("/etc", 0o555);
  const account = userInfo(); need(account.uid === 1000 && account.gid === 1000 && account.username === "agent" && account.homedir === "/home/agent");
  need(Object.keys(networkInterfaces()).every(name => name === "lo"));
  need(createHash("sha256").update(readFileSync("/proc/self/exe")).digest("hex") === spec.nodeSha256);
  need(Object.hasOwn(CLI4197_METADATA_COMMANDS, spec.command));
  const roles = [3, 4, 5, 6, 7, 8, 9];
  need(Object.keys(spec.roleIdentities).length === roles.length && new Set(Object.values(spec.roleIdentities).map(value => `${value.dev}:${value.ino}`)).size === roles.length);
  const same = (value: Readonly<{ dev: bigint; ino: bigint }>, identity: Readonly<{ dev: string; ino: string }>): boolean => value.dev.toString() === identity.dev && value.ino.toString() === identity.ino;
  for (const role of roles) {
    const expected = spec.roleIdentities[String(role)]; need(expected !== undefined);
    if (expected === undefined) { throw new Error("CLI4197_METADATA_DESCRIPTOR_REQUIRED"); }
    need(same(fstatSync(role, { bigint: true }), expected)); closeSync(role);
  }
  for (const name of readdirSync("/proc/self/fd")) {
    if (/^\d+$/u.test(name) && Number(name) >= 3) {
      let identity;
      try { identity = statSync(`/proc/self/fd/${name}`, { bigint: true }); }
      catch (caughtError) {
        if (caughtError !== null && typeof caughtError === "object" && Object.getOwnPropertyDescriptor(caughtError, "code")?.value === "ENOENT") { identity = null; }
        else { throw caughtError; }
      }
      if (identity !== null) { need(!Object.values(spec.roleIdentities).some(expected => same(identity, expected))); }
    }
  }
  const args = [...CLI4197_METADATA_COMMANDS[spec.command], "--no-sandbox", "--ozone-platform=headless", "--disable-gpu"];
  const stderr: Buffer[] = [], stdout: Buffer[] = []; let settled = false, stderrBytes = 0, stdoutBytes = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  /** Emit one bounded complete report, then leave namespace cleanup to PID1
   * exit. The outer original ChildProcess must separately prove exit/stdio. */
  const finish = (exitCode: number, reason: "completed" | "vendor-failed" | "deadline" | "stdout-bound" | "stderr-bound" | "spawn-refused", vendorExitCode: number | null = null): void => {
    if (settled) { return; } settled = true; if (timer !== null) { clearTimeout(timer); }
    const complete = reason === "completed" || reason === "vendor-failed";
    const encode = (values: readonly Buffer[]): Readonly<{ base64: string; bytes: number; sha256: string }> => {
      const bytes = Buffer.concat(values); return { base64: bytes.toString("base64"), bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
    };
    const report = { profile: "private.cli4197-isolated-metadata-result.v1", command: spec.command, namespacePid: process.pid, uid: process.getuid?.(), gid: process.getgid?.(), namespaces,
      allOriginalAuthorityDescriptorsClosed: true, closedRoles: roles, reason, vendorExitCode, outputComplete: complete,
      stdoutBytesObserved: stdoutBytes, stderrBytesObserved: stderrBytes, stdout: complete ? encode(stdout) : null, stderr: complete ? encode(stderr) : null,
      editorOpenAuthorized: false, apiInvocationAuthorized: false, networkAuthorized: false, connectedRuntimeAdmitted: false };
    const text = Buffer.from(`${JSON.stringify(report)}\n`); need(text.length <= CLI4197_METADATA_LIMITS.reportBytes);
    let offset = 0; while (offset < text.length) { const written = writeSync(1, text, offset); need(written > 0); offset += written; }
    process.exit(exitCode);
  };
  const child = spawn("/app/lceda-pro", args, { shell: false, detached: false, stdio: ["ignore", "pipe", "pipe"],
    env: { HOME: "/home/agent", XDG_CONFIG_HOME: "/home/agent/.config", XDG_DATA_HOME: "/home/agent/.local/share", XDG_CACHE_HOME: "/home/agent/.cache", LANG: "C.UTF-8", LC_ALL: "C.UTF-8", LD_LIBRARY_PATH: "/app" } });
  timer = setTimeout(() => { finish(124, "deadline"); }, CLI4197_METADATA_LIMITS.deadlineMilliseconds);
  child.stdout.on("data", (chunk: Buffer): void => { stdoutBytes += chunk.length; if (stdoutBytes > CLI4197_METADATA_LIMITS.outputBytes) { finish(125, "stdout-bound"); } else { stdout.push(chunk); } });
  child.stderr.on("data", (chunk: Buffer): void => { stderrBytes += chunk.length; if (stderrBytes > CLI4197_METADATA_LIMITS.outputBytes) { finish(125, "stderr-bound"); } else { stderr.push(chunk); } });
  child.once("error", (): void => { finish(126, "spawn-refused"); });
  child.once("close", (code, signal): void => { finish(code === 0 && signal === null ? 0 : 1, code === 0 && signal === null ? "completed" : "vendor-failed", code); });
}
/* oxlint-enable node/no-sync, unicorn/no-process-exit, unicorn/consistent-function-scoping */
/** Fixed program only. All variable data is descriptor/namespace identity and
 * one closed command ID. No caller program, argv, expression or module loads. */
export function cli4197MetadataBootstrap(spec: Cli4197NamespaceSpec): string {
  const parsed = specSchema.parse(captureCurrentPcbStringClockReply(spec).value);
  const source = `import {chmodSync,closeSync,existsSync,fstatSync,readFileSync,readdirSync,readlinkSync,statSync,writeFileSync,writeSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nimport {spawn} from 'node:child_process';\nimport {networkInterfaces,userInfo} from 'node:os';\nconst CLI4197_METADATA_COMMANDS=${JSON.stringify(CLI4197_METADATA_COMMANDS)};\nconst CLI4197_METADATA_LIMITS=${JSON.stringify(CLI4197_METADATA_LIMITS)};\n(${runCli4197MetadataNamespace.toString()})(${JSON.stringify(parsed)});\n`;
  if (Buffer.byteLength(source) > CLI4197_METADATA_LIMITS.bootstrapBytes) { throw new Error("CLI4197_METADATA_BOOTSTRAP_BOUND"); } return source;
}
/** The only host mounts are fixed readonly runtime libraries and descriptor-
 * pinned Node/runtime/ELF inputs. Home, Documents, configuration and tmp are new. */
export function cli4197MetadataSandboxArguments(bootstrap: string): readonly string[] {
  return Object.freeze(["--unshare-user", "--unshare-pid", "--unshare-net", "--unshare-ipc", "--unshare-uts", "--unshare-cgroup-try", "--uid", "1000", "--gid", "1000", "--cap-drop", "ALL",
    "--hostname", "easyeda-cli-metadata", "--new-session", "--die-with-parent", "--as-pid-1", "--clearenv",
    "--setenv", "HOME", "/home/agent", "--setenv", "XDG_CONFIG_HOME", "/home/agent/.config", "--setenv", "XDG_DATA_HOME", "/home/agent/.local/share", "--setenv", "XDG_CACHE_HOME", "/home/agent/.cache", "--setenv", "LANG", "C.UTF-8", "--setenv", "LC_ALL", "C.UTF-8",
    "--dir", "/usr", "--ro-bind", "/usr/lib", "/usr/lib", "--ro-bind", "/usr/lib64", "/usr/lib64", "--symlink", "usr/lib", "/lib", "--symlink", "usr/lib64", "/lib64", "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp", "--tmpfs", "/run", "--dir", "/etc",
    "--dir", "/home", "--dir", "/home/agent", "--dir", "/home/agent/Documents", "--dir", "/home/agent/.config", "--dir", "/home/agent/.local/share", "--dir", "/home/agent/.cache",
    "--ro-bind", "/proc/self/fd/3", "/node", "--ro-bind", "/proc/self/fd/4", "/app", "--ro-bind", "/proc/self/fd/5", "/app/lceda-pro", "--chdir", "/home/agent", "--", "/node", "--input-type=module", "-e", bootstrap]);
}
