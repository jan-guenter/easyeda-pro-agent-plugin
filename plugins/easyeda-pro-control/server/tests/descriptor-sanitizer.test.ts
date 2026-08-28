import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import {
  chmod,
  lstat,
  mkdtemp,
  open,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { Readable } from "node:stream";
import { describe, test } from "node:test";

import {
  DESCRIPTOR_SANITIZER_BYTES,
  DESCRIPTOR_SANITIZER_FILE_NAME,
  DESCRIPTOR_SANITIZER_SHA256,
} from "../src/descriptor-sanitizer-identity.ts";

interface SanitizerResult {
  readonly auxiliary: Readonly<Record<number, string>>;
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stderr: string;
  readonly stdout: string;
}

type ChildStdioEntry = "ignore" | "pipe" | number;

const sanitizerPath = resolve(
  import.meta.dirname,
  "..",
  "bin",
  DESCRIPTOR_SANITIZER_FILE_NAME,
);

function sanitizerStdio(lastDescriptor = 10): ChildStdioEntry[] {
  const stdio: ChildStdioEntry[] = Array.from(
    { length: lastDescriptor + 1 },
    (_, descriptor) => (descriptor <= 9 ? "pipe" : "ignore"),
  );
  stdio[1] = "pipe";
  stdio[2] = "pipe";
  return stdio;
}

async function collect(stream: AsyncIterable<unknown>): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError("Sanitizer test pipe emitted a non-buffer chunk.");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function runExecutable(
  command: string,
  arguments_: readonly string[],
  stdio: ChildStdioEntry[],
  input?: string,
  auxiliaryDescriptors: readonly number[] = [],
): Promise<SanitizerResult> {
  const child = spawn(command, arguments_, {
    cwd: "/",
    env: { LANG: "C", LC_ALL: "C", PATH: "/usr/bin:/bin" },
    shell: false,
    stdio,
    windowsHide: true,
  });
  if (child.stdout === null || child.stderr === null) {
    child.kill("SIGKILL");
    throw new Error("Sanitizer test pipes are unavailable.");
  }
  const stdout = collect(child.stdout);
  const stderr = collect(child.stderr);
  const auxiliaryEntries = auxiliaryDescriptors.map((descriptor) => {
    const stream = child.stdio[descriptor];
    if (!(stream instanceof Readable)) {
      child.kill("SIGKILL");
      throw new Error(
        `Sanitizer test pipe ${String(descriptor)} is unavailable.`,
      );
    }
    return [descriptor, collect(stream)] as const;
  });
  if (input !== undefined) {
    if (child.stdin === null) {
      child.kill("SIGKILL");
      throw new Error("Sanitizer test stdin is unavailable.");
    }
    child.stdin.end(input);
  }
  await once(child, "close");
  const auxiliary = Object.fromEntries(
    await Promise.all(
      auxiliaryEntries.map(
        async ([descriptor, output]) => [descriptor, await output] as const,
      ),
    ),
  );
  return {
    auxiliary,
    exitCode: child.exitCode,
    signal: child.signalCode,
    stderr: await stderr,
    stdout: await stdout,
  };
}

function runSanitizer(
  arguments_: readonly string[],
  stdio: ChildStdioEntry[],
): Promise<SanitizerResult> {
  return runExecutable(sanitizerPath, arguments_, stdio);
}

const descriptorProbe = String.raw`
  import { readFileSync, writeSync } from "node:fs";
  import { readdir, readlink } from "node:fs/promises";

  const input = readFileSync(0, "utf8");
  if (input !== "reviewed-stdin-authority") {
    throw new Error("Descriptor 0 did not retain its exact pipe authority.");
  }
  for (let descriptor = 3; descriptor <= 9; descriptor += 1) {
    writeSync(descriptor, "reviewed-fd-" + String(descriptor), null, "utf8");
  }
  const descriptors = (await readdir("/proc/self/fd"))
    .map(Number)
    .filter(Number.isSafeInteger)
    .toSorted((left, right) => left - right);
  const required = Array.from({ length: 10 }, (_, descriptor) => descriptor);
  for (const descriptor of required) {
    await readlink("/proc/self/fd/" + String(descriptor));
  }
  const targets = [];
  for (const descriptor of descriptors) {
    try {
      targets.push(await readlink("/proc/self/fd/" + String(descriptor)));
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
  process.stdout.write(JSON.stringify({ descriptors, targets }));
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error["code"] === "string"
    ? error["code"]
    : undefined;
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown): item is number => Number.isSafeInteger(item),
    )
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown): item is string => typeof item === "string")
  );
}

function parseDescriptorProbe(output: string): {
  readonly descriptors: number[];
  readonly targets: string[];
} {
  const value: unknown = JSON.parse(output);
  if (!isRecord(value)) {
    throw new TypeError("Descriptor probe result is not an object.");
  }
  const descriptors = value["descriptors"];
  const targets = value["targets"];
  if (
    !isNumberArray(descriptors) ||
    !isStringArray(targets)
  ) {
    throw new TypeError("Descriptor probe result is malformed.");
  }
  return { descriptors, targets };
}

async function observeDescriptorBoundary(
  sanitized: boolean,
): Promise<SanitizerResult> {
  const executable = await open(process.execPath, "r");
  const hosts = await open("/etc/hosts", "r");
  const group = await open("/etc/group", "r");
  try {
    const stdio = sanitizerStdio(145);
    for (let descriptor = 0; descriptor <= 9; descriptor += 1) {
      stdio[descriptor] = "pipe";
    }
    stdio[10] = executable.fd;
    stdio[142] = hosts.fd;
    stdio[145] = group.fd;
    const nodeArguments = [
      "--input-type=module",
      "--eval",
      descriptorProbe,
    ];
    return await runExecutable(
      sanitized ? sanitizerPath : process.execPath,
      sanitized
        ? [String(process.pid), process.execPath, ...nodeArguments]
        : nodeArguments,
      stdio,
      "reviewed-stdin-authority",
      [3, 4, 5, 6, 7, 8, 9],
    );
  } finally {
    await Promise.all([executable.close(), hosts.close(), group.close()]);
  }
}

async function runSanitizerWithExecutableDescriptor(
  executablePath: string,
  expectedParent: string,
): Promise<SanitizerResult> {
  const executable = await open(executablePath, "r");
  try {
    const stdio = sanitizerStdio();
    stdio[10] = executable.fd;
    return await runSanitizer(
      [expectedParent, executablePath],
      stdio,
    );
  } finally {
    await executable.close();
  }
}

const parentDeathProbe = String.raw`
  import { spawn } from "node:child_process";
  import { open, readFile, readlink } from "node:fs/promises";
  import process from "node:process";
  import { setTimeout as wait } from "node:timers/promises";

  const sanitizerPath = process.argv[1];
  const nullFile = await open("/dev/null", "r+");
  const executable = await open("/usr/bin/sleep", "r");
  const stdio = Array.from(
    { length: 11 },
    (_, descriptor) => descriptor === 10 ? executable.fd : nullFile.fd,
  );
  const child = spawn(
    sanitizerPath,
    [String(process.pid), "/usr/bin/sleep", "5"],
    { detached: true, stdio },
  );
  child.unref();
  await Promise.all([nullFile.close(), executable.close()]);
  if (child.pid === undefined) {
    throw new Error("The parent-death fixture PID is unavailable.");
  }
  let ready = false;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      if (await readlink("/proc/" + String(child.pid) + "/exe") === "/usr/bin/sleep") {
        ready = true;
        break;
      }
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
    await wait(5);
  }
  if (!ready) {
    throw new Error("The parent-death fixture did not enter sleep.");
  }
  const status = await readFile("/proc/" + String(child.pid) + "/stat", "utf8");
  const close = status.lastIndexOf(")");
  const startTimeTicks = status.slice(close + 2).split(" ")[19];
  if (startTimeTicks === undefined) {
    throw new Error("The parent-death fixture start time is unavailable.");
  }
  process.stdout.write(
    JSON.stringify({ pid: child.pid, startTimeTicks }),
    () => process.exit(0),
  );
`;

function processIdentity(status: string): {
  readonly startTimeTicks: string;
  readonly state: string;
} {
  const closingParenthesis = status.lastIndexOf(")");
  const fields = status.slice(closingParenthesis + 2).split(" ");
  const state = fields[0];
  const startTimeTicks = fields[19];
  if (
    closingParenthesis === -1 ||
    state === undefined ||
    startTimeTicks === undefined
  ) {
    throw new Error("Process start-time status is malformed.");
  }
  return { startTimeTicks, state };
}

async function currentProcessIdentity(
  pid: number,
): Promise<ReturnType<typeof processIdentity> | null> {
  try {
    return processIdentity(
      await readFile(`/proc/${String(pid)}/stat`, "utf8"),
    );
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function waitMilliseconds(milliseconds: number): Promise<void> {
  const completion = Promise.withResolvers<null>();
  setTimeout(completion.resolve, milliseconds, null);
  await completion.promise;
}

void describe("reviewed native descriptor sanitizer", () => {
  void test("is the exact static W^X ELF64 image", async () => {
    const [bytes, information] = await Promise.all([
      readFile(sanitizerPath),
      lstat(sanitizerPath),
    ]);
    assert.equal(bytes.length, DESCRIPTOR_SANITIZER_BYTES);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      DESCRIPTOR_SANITIZER_SHA256,
    );
    assert.equal(information.isFile(), true);
    assert.equal(information.isSymbolicLink(), false);
    assert.equal(information.nlink, 1);
    // oxlint-disable-next-line eslint/no-bitwise -- POSIX executable modes are bit fields.
    assert.equal(information.mode & 0o7777, 0o755);
    assert.equal(bytes.subarray(0, 4).toString("hex"), "7f454c46");

    const view = new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    );
    assert.equal(view.getUint8(4), 2);
    assert.equal(view.getUint8(5), 1);
    assert.equal(view.getUint16(16, true), 2);
    assert.equal(view.getUint16(18, true), 62);
    const programHeaderOffset = Number(view.getBigUint64(32, true));
    const programHeaderSize = view.getUint16(54, true);
    const programHeaderCount = view.getUint16(56, true);
    const programHeaders = Array.from(
      { length: programHeaderCount },
      (_, index) => {
        const offset = programHeaderOffset + index * programHeaderSize;
        return {
          type: view.getUint32(offset, true),
          flags: view.getUint32(offset + 4, true),
        };
      },
    );
    assert.deepEqual(programHeaders, [
      { type: 1, flags: 5 },
      { type: 1_685_382_481, flags: 6 },
    ]);

    const sectionHeaderOffset = Number(view.getBigUint64(40, true));
    const sectionHeaderSize = view.getUint16(58, true);
    const sectionHeaderCount = view.getUint16(60, true);
    const sectionTypes = new Set(
      Array.from(
        { length: sectionHeaderCount },
        (_, index) =>
          view.getUint32(
            sectionHeaderOffset + index * sectionHeaderSize + 4,
            true,
          ),
      ),
    );
    assert.equal(sectionTypes.has(4), false);
    assert.equal(sectionTypes.has(6), false);
    assert.equal(sectionTypes.has(9), false);
  });

  void test("preserves exact descriptor 0-9 pipes and closes injected 142 and 145", async () => {
    const unsafe = await observeDescriptorBoundary(false);
    assert.deepEqual(
      { exitCode: unsafe.exitCode, signal: unsafe.signal, stderr: unsafe.stderr },
      { exitCode: 0, signal: null, stderr: "" },
    );
    const unsafeProbe = parseDescriptorProbe(unsafe.stdout);
    assert.equal(unsafeProbe.descriptors.includes(142), true);
    assert.equal(unsafeProbe.descriptors.includes(145), true);
    assert.equal(unsafeProbe.targets.includes("/etc/hosts"), true);
    assert.equal(unsafeProbe.targets.includes("/etc/group"), true);
    assert.equal(unsafeProbe.targets.includes(process.execPath), true);

    const sanitized = await observeDescriptorBoundary(true);
    assert.deepEqual(
      {
        exitCode: sanitized.exitCode,
        signal: sanitized.signal,
        stderr: sanitized.stderr,
      },
      { exitCode: 0, signal: null, stderr: "" },
    );
    const sanitizedProbe = parseDescriptorProbe(sanitized.stdout);
    assert.deepEqual(
      sanitizedProbe.descriptors.slice(0, 10),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
    assert.equal(sanitizedProbe.descriptors.includes(142), false);
    assert.equal(sanitizedProbe.descriptors.includes(145), false);
    assert.equal(sanitizedProbe.targets.includes("/etc/hosts"), false);
    assert.equal(sanitizedProbe.targets.includes("/etc/group"), false);
    assert.equal(sanitizedProbe.targets.includes(process.execPath), false);
    for (let descriptor = 3; descriptor <= 9; descriptor += 1) {
      assert.equal(
        sanitized.auxiliary[descriptor],
        `reviewed-fd-${String(descriptor)}`,
      );
    }
  });

  void test("fails closed when a required descriptor is missing", async () => {
    const result = await runSanitizer(
      [String(process.pid), "/usr/bin/true"],
      sanitizerStdio(9),
    );
    assert.equal(result.exitCode, 65);
    assert.equal(result.signal, null);
    assert.equal(result.stdout, "");
    assert.equal(
      result.stderr,
      "EasyEDA descriptor sanitizer: required descriptor missing.\n",
    );
  });

  void test("rejects malformed or changed parent identities before execution", async () => {
    const invalidParents = [
      "",
      "0",
      "-1",
      "+1",
      "not-a-pid",
      "2147483648",
      String(process.pid + 1),
    ];
    for (const invalidParent of invalidParents) {
      const result = await runSanitizerWithExecutableDescriptor(
        "/usr/bin/true",
        invalidParent,
      );
      assert.equal(result.exitCode, 72);
      assert.equal(result.signal, null);
      assert.equal(result.stdout, "");
      assert.equal(
        result.stderr,
        "EasyEDA descriptor sanitizer: parent identity changed.\n",
      );
    }
  });

  void test("kills the descriptor-entered child when its exact parent exits", async () => {
    const parent = await runExecutable(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        parentDeathProbe,
        "--",
        sanitizerPath,
      ],
      ["ignore", "pipe", "pipe"],
    );
    assert.deepEqual(
      { exitCode: parent.exitCode, signal: parent.signal, stderr: parent.stderr },
      { exitCode: 0, signal: null, stderr: "" },
    );
    const fixture: unknown = JSON.parse(parent.stdout);
    if (
      !isRecord(fixture) ||
      !Number.isSafeInteger(fixture["pid"]) ||
      typeof fixture["startTimeTicks"] !== "string"
    ) {
      throw new TypeError("Parent-death fixture result is malformed.");
    }
    const pid = Number(fixture["pid"]);
    const expectedStartTime = fixture["startTimeTicks"];
    let currentIdentity: Awaited<ReturnType<typeof currentProcessIdentity>> = {
      startTimeTicks: expectedStartTime,
      state: "R",
    };
    for (let attempt = 0; attempt < 200; attempt += 1) {
      currentIdentity = await currentProcessIdentity(pid);
      if (
        currentIdentity === null ||
        currentIdentity.startTimeTicks !== expectedStartTime ||
        currentIdentity.state === "Z"
      ) {
        break;
      }
      await waitMilliseconds(5);
    }
    if (
      currentIdentity !== null &&
      currentIdentity.startTimeTicks === expectedStartTime &&
      currentIdentity.state !== "Z"
    ) {
      process.kill(pid, "SIGKILL");
    }
    assert.ok(
      currentIdentity === null ||
        currentIdentity.startTimeTicks !== expectedStartTime ||
        currentIdentity.state === "Z",
    );
  });

  void test("rejects a non-0755 executable descriptor before execveat", async () => {
    const result = await runSanitizerWithExecutableDescriptor(
      "/etc/hosts",
      String(process.pid),
    );
    assert.equal(result.exitCode, 74);
    assert.equal(result.signal, null);
    assert.equal(result.stdout, "");
    assert.equal(
      result.stderr,
      "EasyEDA descriptor sanitizer: descriptor isolation failed.\n",
    );
  });

  void test("fails closed when the reviewed executable cannot be entered", async () => {
    const directory = await mkdtemp("/tmp/easyeda-sanitizer-exec-test-");
    const invalidExecutable = resolve(directory, "invalid-executable");
    try {
      await writeFile(invalidExecutable, "not an executable image\n", {
        mode: 0o755,
      });
      await chmod(invalidExecutable, 0o755);
      const result = await runSanitizerWithExecutableDescriptor(
        invalidExecutable,
        String(process.pid),
      );
      assert.equal(result.exitCode, 71);
      assert.equal(result.signal, null);
      assert.equal(result.stdout, "");
      assert.equal(
        result.stderr,
        "EasyEDA descriptor sanitizer: execveat failed.\n",
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
