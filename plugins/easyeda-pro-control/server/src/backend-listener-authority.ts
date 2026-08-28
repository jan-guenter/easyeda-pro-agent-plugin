import { readFile, readdir, readlink, stat as statPath } from "node:fs/promises";
import type { Socket } from "node:net";
import process from "node:process";

import { assertZeroSoftCoreLimit } from "./soft-core-limit.ts";

export { assertZeroSoftCoreLimit } from "./soft-core-limit.ts";

export interface BackendProcessAuthority {
  readonly pid: number;
  readonly startTimeTicks: string;
}

export interface SandboxNamespaceIdentity {
  readonly cgroup: number;
  readonly ipc: number;
  readonly mnt: number;
  readonly pid: number;
  readonly uts: number;
}

function processStartTime(stat: string): string {
  const closingParenthesis = stat.lastIndexOf(")");
  if (closingParenthesis < 1) {
    throw new Error("The supervised backend process stat record is malformed.");
  }
  const fields = stat.slice(closingParenthesis + 1).trim().split(/\s+/u);
  const startTime = fields[19];
  if (startTime === undefined || !/^\d+$/u.test(startTime)) {
    throw new Error("The supervised backend process start identity is unavailable.");
  }
  return startTime;
}

async function readProcessStartTime(pid: number): Promise<string> {
  return processStartTime(await readFile(`/proc/${pid}/stat`, "utf8"));
}

function assertLinuxProcessOwnership(status: string): void {
  if (typeof process.getuid !== "function") {
    throw new TypeError(
      "Backend socket ownership requires a numeric local user ID.",
    );
  }
  const match = /^Uid:\s+(\d+)\s+/mu.exec(status);
  if (match?.[1] === undefined || Number(match[1]) !== process.getuid()) {
    throw new Error("The supervised backend process is not owned by this user.");
  }
}

export async function captureBackendProcessAuthority(
  pid: number,
): Promise<BackendProcessAuthority> {
  if (process.platform !== "linux") {
    throw new Error(
      "Authenticated backend socket ownership is currently supported only on Linux.",
    );
  }
  if (!Number.isSafeInteger(pid) || pid <= 0) {
    throw new TypeError("The supervised backend PID is invalid.");
  }
  const before = await readProcessStartTime(pid);
  const status = await readFile(`/proc/${pid}/status`, "utf8");
  const after = await readProcessStartTime(pid);
  return validateBackendProcessAuthorityCapture(pid, before, status, after);
}

export function validateBackendProcessAuthorityCapture(
  pid: number,
  before: string,
  status: string,
  after: string,
): BackendProcessAuthority {
  if (before !== after) {
    throw new Error(
      "The supervised backend PID changed during authority capture.",
    );
  }
  assertLinuxProcessOwnership(status);
  return { pid, startTimeTicks: after };
}

function numericDescriptorName(value: string): boolean {
  return /^(?:0|[1-9]\d*)$/u.test(value) && Number.isSafeInteger(Number(value));
}

async function sandboxDescriptorTargets(
  pid: number,
): Promise<ReadonlyMap<number, string>> {
  const directory = `/proc/${pid}/fd`;
  const output = new Map<number, string>();
  for (const entry of await readdir(directory)) {
    if (!numericDescriptorName(entry)) {
      throw new Error("Sandbox process exposed a malformed descriptor name.");
    }
    let target: string;
    try {
      target = await readlink(`${directory}/${entry}`);
    } catch (error) {
      if (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        throw new Error(
          "Sandbox descriptor topology changed during authority admission.",
          { cause: error },
        );
      }
      throw error;
    }
    output.set(Number(entry), target);
  }
  return output;
}

export function assertSandboxDescriptorTargets(
  targets: ReadonlyMap<number, string>,
): number {
  const expectedDescriptors = new Map<number, "eventfd" | "eventpoll" | "null" | "pipe" | "stdio">([
    [0, "stdio"],
    [1, "stdio"],
    [2, "stdio"],
    [3, "eventpoll"],
    [4, "pipe"],
    [5, "pipe"],
    [6, "pipe"],
    [7, "pipe"],
    [8, "eventfd"],
    [9, "eventpoll"],
    [10, "pipe"],
    [11, "pipe"],
    [12, "eventfd"],
    [13, "eventpoll"],
    [14, "pipe"],
    [15, "pipe"],
    [16, "eventfd"],
    [17, "null"],
  ]);
  if (targets.size !== expectedDescriptors.size) {
    throw new Error("Sandbox process retained a non-baseline descriptor count.");
  }
  const pipePairs = [[4, 5], [6, 7], [10, 11], [14, 15]] as const;
  for (const [descriptor, kind] of expectedDescriptors) {
    const target = targets.get(descriptor);
    const accepted =
      (kind === "stdio" && /^socket:\[\d+\]$/u.test(target ?? "")) ||
      (kind === "pipe" && /^pipe:\[\d+\]$/u.test(target ?? "")) ||
      (kind === "eventfd" && target === "anon_inode:[eventfd]") ||
      (kind === "eventpoll" && target === "anon_inode:[eventpoll]") ||
      (kind === "null" && target === "/dev/null");
    if (!accepted) {
      throw new Error(
        `Sandbox descriptor ${String(descriptor)} differs from the exact Node 24 baseline: ${target ?? "missing"}`,
      );
    }
  }
  for (const [left, right] of pipePairs) {
    if (targets.get(left) !== targets.get(right)) {
      throw new Error("Sandbox process retained a non-baseline internal pipe pair.");
    }
  }
  return 17;
}

export async function assertSandboxProcessDescriptorBoundary(
  authority: BackendProcessAuthority,
): Promise<void> {
  const before = await readProcessStartTime(authority.pid);
  if (before !== authority.startTimeTicks) {
    throw new Error("Sandbox child PID changed before descriptor admission.");
  }
  const targets = await sandboxDescriptorTargets(authority.pid);
  const nullDescriptor = assertSandboxDescriptorTargets(targets);
  const [actualNull, reviewedNull, limits] = await Promise.all([
    statPath(`/proc/${authority.pid}/fd/${String(nullDescriptor)}`, {
      bigint: true,
    }),
    statPath("/dev/null", { bigint: true }),
    readFile(`/proc/${authority.pid}/limits`, "utf8"),
  ]);
  if (
    !actualNull.isCharacterDevice() ||
    !reviewedNull.isCharacterDevice() ||
    actualNull.dev !== reviewedNull.dev ||
    actualNull.ino !== reviewedNull.ino ||
    actualNull.rdev !== reviewedNull.rdev
  ) {
    throw new Error("Sandbox null-device descriptor has the wrong identity.");
  }
  assertZeroSoftCoreLimit(limits);
  const after = await readProcessStartTime(authority.pid);
  if (after !== before) {
    throw new Error("Sandbox child PID changed during descriptor admission.");
  }
}

function statusInteger(status: string, field: string): number {
  const match = new RegExp(`^${field}:\\s+(\\d+)(?:\\s|$)`, "mu").exec(status);
  const value = match?.[1];
  if (value === undefined || !positiveProcessInteger(Number(value))) {
    throw new Error(`Sandbox process ${field} identity is unavailable.`);
  }
  return Number(value);
}

function positiveProcessInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export async function assertSandboxProcessTopology(
  authority: BackendProcessAuthority,
  monitor: BackendProcessAuthority,
  namespaces: SandboxNamespaceIdentity,
): Promise<void> {
  const [childBefore, monitorBefore, status, ...namespaceLinks] =
    await Promise.all([
      readProcessStartTime(authority.pid),
      readProcessStartTime(monitor.pid),
      readFile(`/proc/${authority.pid}/status`, "utf8"),
      ...(["cgroup", "ipc", "mnt", "pid", "uts"] as const).map((name) =>
        readlink(`/proc/${authority.pid}/ns/${name}`),
      ),
    ]);
  if (
    childBefore !== authority.startTimeTicks ||
    monitorBefore !== monitor.startTimeTicks ||
    statusInteger(status, "PPid") !== monitor.pid
  ) {
    throw new Error("Sandbox child is not owned by the exact live bubblewrap monitor.");
  }
  const nspid = /^NSpid:\s+(\d+)\s+1$/mu.exec(status);
  if (nspid?.[1] !== String(authority.pid)) {
    throw new Error("Sandbox child is not PID 1 in the reviewed PID namespace.");
  }
  const expectedNamespaces = [
    namespaces.cgroup,
    namespaces.ipc,
    namespaces.mnt,
    namespaces.pid,
    namespaces.uts,
  ];
  for (const [index, expected] of expectedNamespaces.entries()) {
    if (
      namespaceLinks[index]?.endsWith(`:[${String(expected)}]`) !== true
    ) {
      throw new Error("Sandbox child namespace identity differs from bubblewrap status.");
    }
  }
  const [childAfter, monitorAfter] = await Promise.all([
    readProcessStartTime(authority.pid),
    readProcessStartTime(monitor.pid),
  ]);
  if (
    childAfter !== authority.startTimeTicks ||
    monitorAfter !== monitor.startTimeTicks
  ) {
    throw new Error("Sandbox process topology changed during authority admission.");
  }
}

async function processSocketInodes(pid: number): Promise<Set<string>> {
  const directory = `/proc/${pid}/fd`;
  const inodes = new Set<string>();
  for (const entry of await readdir(directory)) {
    let target: string | undefined;
    try {
      target = await readlink(`${directory}/${entry}`);
    } catch (error) {
      if (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        ["ENOENT", "EINVAL"].includes(String(error.code))
      ) {
        target = undefined;
      } else {
        throw error;
      }
    }
    const match =
      target === undefined ? null : /^socket:\[(\d+)\]$/u.exec(target);
    if (match?.[1] !== undefined) {
      inodes.add(match[1]);
    }
  }
  return inodes;
}

function ipv4LoopbackHex(address: string | undefined): string {
  if (address !== "127.0.0.1") {
    throw new Error("The private backend TCP connection left IPv4 loopback.");
  }
  return "0100007F";
}

function portHex(port: number | undefined): string {
  if (port === undefined || !Number.isSafeInteger(port) || port < 1) {
    throw new Error("The private backend TCP connection has no bound port.");
  }
  return port.toString(16).toUpperCase().padStart(4, "0");
}

async function establishedServerSocketInode(socket: Socket): Promise<string> {
  const expectedLocal = `${ipv4LoopbackHex(socket.remoteAddress)}:${portHex(socket.remotePort)}`;
  const expectedRemote = `${ipv4LoopbackHex(socket.localAddress)}:${portHex(socket.localPort)}`;
  const tables = ["/proc/net/tcp", "/proc/net/tcp6"];
  const matches: string[] = [];
  for (const table of tables) {
    const text = await readFile(table, "utf8");
    for (const line of text.split(/\r?\n/u).slice(1)) {
      const fields = line.trim().split(/\s+/u);
      if (
        fields.length >= 10 &&
        fields[1] === expectedLocal &&
        fields[2] === expectedRemote &&
        fields[3] === "01" &&
        fields[9] !== undefined
      ) {
        matches.push(fields[9]);
      }
    }
  }
  if (matches.length !== 1 || matches[0] === undefined) {
    throw new Error(
      "The private backend established socket could not be identified exactly.",
    );
  }
  return matches[0];
}

export async function assertBackendConnectionOwnedByProcess(
  socket: Socket,
  authority: BackendProcessAuthority,
): Promise<void> {
  const before = await readProcessStartTime(authority.pid);
  if (before !== authority.startTimeTicks) {
    throw new Error("The supervised backend PID was reused before connection proof.");
  }
  const [serverSocketInode, ownedInodes] = await Promise.all([
    establishedServerSocketInode(socket),
    processSocketInodes(authority.pid),
  ]);
  const after = await readProcessStartTime(authority.pid);
  if (after !== authority.startTimeTicks || !ownedInodes.has(serverSocketInode)) {
    throw new Error(
      "The private bridge connection is not owned by the supervised upstream process.",
    );
  }
}
