import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { once } from "node:events";
import {
  chmod,
  link as createHardLink,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, test } from "node:test";

import { acquireFacadeLease } from "../src/lease.ts";
import { openControlRootCapability } from "../src/control-root.ts";

type FacadeLease = Awaited<ReturnType<typeof acquireFacadeLease>>;

interface StoredLease {
  schema: "easyeda-pro-control.facade-lease.v1";
  pid: number;
  pidStartTime?: string;
  childPid?: number;
  childStartTime?: string;
  token: string;
  startedAt: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStoredLease(text: string): StoredLease {
  const value: unknown = JSON.parse(text);
  if (
    !isRecord(value) ||
    value["schema"] !== "easyeda-pro-control.facade-lease.v1" ||
    typeof value["pid"] !== "number" ||
    !Number.isInteger(value["pid"]) ||
    typeof value["token"] !== "string"
  ) {
    throw new TypeError("Test fixture did not contain a valid facade lease.");
  }
  return {
    schema: "easyeda-pro-control.facade-lease.v1",
    pid: value["pid"],
    ...(typeof value["pidStartTime"] === "string"
      ? { pidStartTime: value["pidStartTime"] }
      : {}),
    ...(typeof value["childPid"] === "number"
      ? { childPid: value["childPid"] }
      : {}),
    ...(typeof value["childStartTime"] === "string"
      ? { childStartTime: value["childStartTime"] }
      : {}),
    token: value["token"],
    startedAt: value["startedAt"],
  };
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

async function temporaryRoot(label: string): Promise<string> {
  return mkdtemp(join(tmpdir(), `easyeda-control-lease-${label}-`));
}

async function waitForReady(child: ChildProcess): Promise<void> {
  if (!child.stdout || !child.stderr) {
    throw new Error("Lease child requires piped output.");
  }
  const { stdout: childStdout, stderr: childStderr } = child;
  await new Promise<void>((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      reject(new Error(`Lease child did not become ready. stderr: ${stderr}`));
    }, 10_000);
    childStdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.includes("READY\n")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    childStderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      if (!stdout.includes("READY\n")) {
        clearTimeout(timeout);
        reject(
          new Error(
            `Lease child exited before ready (${code ?? signal}). stderr: ${stderr}`,
          ),
        );
      }
    });
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  const exited = new Promise<void>((resolve) => {
    child.once("exit", () => {
      resolve();
    });
  });
  child.kill("SIGTERM");
  await exited;
}

void describe("cross-process facade lease", { concurrency: false }, () => {
  void test("rejects a symlinked control root without creating a lock in its target", async () => {
    const parent = await temporaryRoot("symlink-parent");
    const target = join(parent, "target");
    const link = join(parent, "control-link");
    try {
      await mkdir(target);
      await symlink(target, link, "dir");
      await assert.rejects(
        acquireFacadeLease(link),
        /real directory|symbolic-link/u,
      );
      await assert.rejects(
        readFile(join(target, "facade.lock"), "utf8"),
        (error: unknown) => hasErrorCode(error, "ENOENT"),
      );
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("rejects an intermediate symlink before creating its missing child", async () => {
    const parent = await temporaryRoot("intermediate-symlink");
    const target = join(parent, "target");
    const link = join(parent, "control-link");
    try {
      await mkdir(target);
      await symlink(target, link, "dir");
      await assert.rejects(
        acquireFacadeLease(join(link, "created-outside")),
        /symbolic-link/u,
      );
      assert.deepEqual(await readdir(target), []);
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("does not create missing non-final control-root ancestors", async () => {
    const parent = await mkdtemp(
      join("/tmp", "easyeda-control-lease-missing-ancestor-"),
    );
    const missingParent = join(parent, "missing-parent");
    try {
      await assert.rejects(
        acquireFacadeLease(join(missingParent, "control")),
        /control-root parent must already exist/u,
      );
      await assert.rejects(readdir(missingParent), (error: unknown) =>
        hasErrorCode(error, "ENOENT"),
      );
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("rejects a post-validation control-root replacement without creating a lease", async () => {
    const parent = await mkdtemp(
      join("/tmp", "easyeda-control-lease-root-swap-"),
    );
    const root = join(parent, "control");
    const movedRoot = join(parent, "control-moved");
    await mkdir(root, { mode: 0o700 });
    const capability = await openControlRootCapability(root);
    try {
      await rename(root, movedRoot);
      await assert.rejects(
        capability.assertCurrent(),
        /control-root pathname changed/u,
      );
      await mkdir(root, { mode: 0o700 });
      await assert.rejects(
        acquireFacadeLease(capability),
        /control-root pathname changed/u,
      );
      assert.deepEqual(await readdir(root), []);
      assert.deepEqual(await readdir(movedRoot), []);
    } finally {
      await capability.close();
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("rejects a permissive existing intermediate managed directory", async () => {
    const root = await temporaryRoot("permissive-intermediate");
    const intermediate = join(root, "managed");
    const child = join(intermediate, "child");
    const capability = await openControlRootCapability(root);
    try {
      await mkdir(intermediate, { mode: 0o700 });
      await mkdir(child, { mode: 0o700 });
      await chmod(intermediate, 0o770);
      await assert.rejects(
        capability.openDirectory(child, false),
        /owner-owned mode-0700 directory/u,
      );
    } finally {
      await capability.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("rejects symlinked and hard-linked lease files without modifying their targets", async () => {
    const symlinkRoot = await temporaryRoot("lease-symlink");
    const hardlinkRoot = await temporaryRoot("lease-hardlink");
    const contents = `${JSON.stringify({
      schema: "easyeda-pro-control.facade-lease.v1",
      token: "dead-private-lease-token",
      pid: 2_147_483_647,
      pidStartTime: "0",
      startedAt: "2026-08-27T00:00:00.000Z",
    })}\n`;
    const symlinkTarget = join(symlinkRoot, "target");
    const hardlinkTarget = join(hardlinkRoot, "target");
    try {
      await writeFile(symlinkTarget, contents, {
        encoding: "utf8",
        mode: 0o600,
      });
      await symlink(symlinkTarget, join(symlinkRoot, "facade.lock"));
      await assert.rejects(
        acquireFacadeLease(symlinkRoot),
        /single-link|mode-0600/u,
      );
      assert.equal(await readFile(symlinkTarget, "utf8"), contents);

      await writeFile(hardlinkTarget, contents, {
        encoding: "utf8",
        mode: 0o600,
      });
      await createHardLink(hardlinkTarget, join(hardlinkRoot, "facade.lock"));
      await assert.rejects(
        acquireFacadeLease(hardlinkRoot),
        /single-link|mode-0600/u,
      );
      assert.equal(await readFile(hardlinkTarget, "utf8"), contents);
      assert.equal(
        await readFile(join(hardlinkRoot, "facade.lock"), "utf8"),
        contents,
      );
    } finally {
      await rm(symlinkRoot, { recursive: true, force: true });
      await rm(hardlinkRoot, { recursive: true, force: true });
    }
  });

  void test("rejects a hard-linked stale-cleanup lease without removing either name", async () => {
    const root = await temporaryRoot("cleanup-hardlink");
    const leasePath = join(root, "facade.lock");
    const cleanupPath = `${leasePath}.cleanup`;
    const cleanupSource = join(root, "cleanup-source");
    const staleToken = "dead-facade-owner-token";
    const cleanupContents = `${JSON.stringify({
      schema: "easyeda-pro-control.facade-lease-cleanup.v1",
      token: "dead-cleanup-owner-token",
      pid: 2_147_483_646,
      staleToken,
      startedAt: "2026-08-27T00:00:01.000Z",
    })}\n`;
    try {
      await writeFile(
        leasePath,
        `${JSON.stringify({
          schema: "easyeda-pro-control.facade-lease.v1",
          token: staleToken,
          pid: 2_147_483_647,
          pidStartTime: "0",
          startedAt: "2026-08-27T00:00:00.000Z",
        })}\n`,
        { encoding: "utf8", mode: 0o600 },
      );
      await writeFile(cleanupSource, cleanupContents, {
        encoding: "utf8",
        mode: 0o600,
      });
      await createHardLink(cleanupSource, cleanupPath);
      await assert.rejects(
        acquireFacadeLease(root),
        /cleanup lease must be.*single-link/u,
      );
      assert.equal(await readFile(cleanupSource, "utf8"), cleanupContents);
      assert.equal(await readFile(cleanupPath, "utf8"), cleanupContents);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("allows one owner and rejects a second live owner", async () => {
    const root = await temporaryRoot("same-process");
    let lease: FacadeLease | undefined;
    try {
      lease = await acquireFacadeLease(root);
      const stored = parseStoredLease(await readFile(lease.path, "utf8"));
      assert.equal(stored.pid, process.pid);
      assert.equal(stored.token, lease.token);
      await lease.bindChild(process.pid);
      const bound = parseStoredLease(await readFile(lease.path, "utf8"));
      assert.equal(bound.childPid, process.pid);
      if (process.platform === "linux") {
        assert.match(bound.childStartTime ?? "", /^\d+$/u);
      }
      await assert.rejects(
        acquireFacadeLease(root),
        /Another EasyEDA control facade owns/u,
      );
      await lease.release();
      lease = undefined;
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await lease?.release().catch(() => null);
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("retains a child-bound lease during synchronous exit cleanup", async () => {
    const root = await temporaryRoot("sync-bound-retention");
    try {
      const leaseModuleUrl = pathToFileURL(
        resolvePath(import.meta.dirname, "../src/lease.ts"),
      ).href;
      const child = spawn(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `import { acquireFacadeLease } from ${JSON.stringify(leaseModuleUrl)};
const lease = await acquireFacadeLease(process.argv[1]);
await lease.bindChild(process.pid);`,
          root,
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
      );
      let stderr = "";
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });
      const exit = await new Promise<{
        readonly code: number | null;
        readonly signal: NodeJS.Signals | null;
      }>((resolve) => {
        child.once("exit", (code, signal) => {
          resolve({ code, signal });
        });
      });
      assert.equal(
        exit.code,
        0,
        `Lease fixture failed (${String(exit.signal)}): ${stderr}`,
      );
      const stored = parseStoredLease(
        await readFile(join(root, "facade.lock"), "utf8"),
      );
      assert.equal(stored.pid, stored.childPid);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("automatically releases an unbound lease on process exit", async () => {
    const root = await temporaryRoot("sync-unbound-release");
    try {
      const leaseModuleUrl = pathToFileURL(
        resolvePath(import.meta.dirname, "../src/lease.ts"),
      ).href;
      const child = spawn(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `import { acquireFacadeLease } from ${JSON.stringify(leaseModuleUrl)};
await acquireFacadeLease(process.argv[1]);`,
          root,
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
      );
      let stderr = "";
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });
      const { code, signal } = await new Promise<{
        readonly code: number | null;
        readonly signal: NodeJS.Signals | null;
      }>((resolve) => {
        child.once("exit", (exitCode, exitSignal) => {
          resolve({ code: exitCode, signal: exitSignal });
        });
      });
      assert.equal(code, 0, `Lease fixture failed (${String(signal)}): ${stderr}`);
      await assert.rejects(
        readFile(join(root, "facade.lock"), "utf8"),
        (error: unknown) => hasErrorCode(error, "ENOENT"),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("removes its exit listener after normal release", async () => {
    const root = await temporaryRoot("exit-listener-release");
    const before = process.listenerCount("exit");
    try {
      const lease = await acquireFacadeLease(root);
      assert.equal(process.listenerCount("exit"), before + 1);
      await lease.release();
      assert.equal(process.listenerCount("exit"), before);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("removes a supervised-generation dead-PID lease but refuses a corrupt lease", async () => {
    const staleRoot = await temporaryRoot("stale");
    const corruptRoot = await temporaryRoot("corrupt");
    try {
      await writeFile(
        join(staleRoot, "facade.lock"),
        `${JSON.stringify({
          schema: "easyeda-pro-control.facade-lease.v1",
          token: "dead-process-token",
          pid: 2_147_483_647,
          pidStartTime: "0",
          startedAt: "2026-08-27T00:00:00.000Z",
        })}\n`,
        { encoding: "utf8", mode: 0o600 },
      );
      const replacement = await acquireFacadeLease(staleRoot);
      assert.equal(
        parseStoredLease(await readFile(replacement.path, "utf8")).pid,
        process.pid,
      );
      await replacement.release();

      await writeFile(join(corruptRoot, "facade.lock"), "{not-json}\n", {
        encoding: "utf8",
        mode: 0o600,
      });
      await assert.rejects(
        acquireFacadeLease(corruptRoot),
        /Unexpected token|JSON/u,
      );
      assert.equal(
        await readFile(join(corruptRoot, "facade.lock"), "utf8"),
        "{not-json}\n",
      );
    } finally {
      await rm(staleRoot, { recursive: true, force: true });
      await rm(corruptRoot, { recursive: true, force: true });
    }
  });

  void test("refuses to erase a legacy dead lease with untracked orphan risk", async () => {
    const root = await temporaryRoot("legacy-stale");
    const path = join(root, "facade.lock");
    const contents = `${JSON.stringify({
      schema: "easyeda-pro-control.facade-lease.v1",
      token: "legacy-dead-process-token",
      pid: 2_147_483_647,
      startedAt: "2026-08-27T00:00:00.000Z",
    })}\n`;
    try {
      await writeFile(path, contents, { encoding: "utf8", mode: 0o600 });
      await assert.rejects(
        acquireFacadeLease(root),
        /predates supervised-child identity tracking/u,
      );
      assert.equal(await readFile(path, "utf8"), contents);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("refuses stale facade cleanup while its bound child is alive", async () => {
    const root = await temporaryRoot("live-bound-child");
    const child = spawn(process.execPath, ["--eval", "setInterval(() => {}, 1000)"], {
      stdio: "ignore",
    });
    try {
      await once(child, "spawn");
      if (child.pid === undefined) {
        throw new Error("Bound-child fixture has no PID.");
      }
      await writeFile(
        join(root, "facade.lock"),
        `${JSON.stringify({
          schema: "easyeda-pro-control.facade-lease.v1",
          token: "dead-facade-live-child-token",
          pid: 2_147_483_647,
          childPid: child.pid,
          startedAt: "2026-08-27T00:00:00.000Z",
        })}\n`,
        { encoding: "utf8", mode: 0o600 },
      );
      await assert.rejects(
        acquireFacadeLease(root),
        /still has a live upstream supervisor/u,
      );
      await stopChild(child);
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await stopChild(child);
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("reconciles a dead cleanup lease left by a crashed stale-owner cleanup", async () => {
    const root = await temporaryRoot("cleanup-crash");
    const leasePath = join(root, "facade.lock");
    const cleanupPath = `${leasePath}.cleanup`;
    const staleToken = "stale-facade-owner-token";
    try {
      await writeFile(
        leasePath,
        `${JSON.stringify({
          schema: "easyeda-pro-control.facade-lease.v1",
          token: staleToken,
          pid: 2_147_483_647,
          pidStartTime: "0",
          startedAt: "2026-08-27T00:00:00.000Z",
        })}\n`,
        { encoding: "utf8", mode: 0o600 },
      );
      await writeFile(
        cleanupPath,
        `${JSON.stringify({
          schema: "easyeda-pro-control.facade-lease-cleanup.v1",
          token: "stale-cleanup-owner-token",
          pid: 2_147_483_646,
          staleToken,
          startedAt: "2026-08-27T00:00:01.000Z",
        })}\n`,
        { encoding: "utf8", mode: 0o600 },
      );

      const replacement = await acquireFacadeLease(root);
      assert.equal(
        parseStoredLease(await readFile(replacement.path, "utf8")).pid,
        process.pid,
      );
      await assert.rejects(readFile(cleanupPath, "utf8"), (error: unknown) =>
        hasErrorCode(error, "ENOENT"),
      );
      await replacement.release();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("does not release a lease after its ownership token changes", async () => {
    const root = await temporaryRoot("ownership");
    const lease = await acquireFacadeLease(root);
    try {
      const stored = parseStoredLease(await readFile(lease.path, "utf8"));
      stored.token = "replacement-owner-token";
      await writeFile(lease.path, `${JSON.stringify(stored)}\n`, "utf8");
      await assert.rejects(lease.release(), /ownership changed/u);
      assert.equal(
        parseStoredLease(await readFile(lease.path, "utf8")).token,
        "replacement-owner-token",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("rejects a same-user same-record inode replacement before child binding", async () => {
    const root = await temporaryRoot("identity-replacement");
    const lease = await acquireFacadeLease(root);
    const displaced = `${lease.path}.displaced`;
    try {
      const contents = await readFile(lease.path, "utf8");
      await rename(lease.path, displaced);
      await writeFile(lease.path, contents, {
        encoding: "utf8",
        mode: 0o600,
      });
      await assert.rejects(lease.bindChild(process.pid), /ownership changed/u);
      assert.equal(await readFile(lease.path, "utf8"), contents);
      assert.equal(await readFile(displaced, "utf8"), contents);
      // oxlint-disable-next-line node/no-sync -- This regression exercises the intentional exit-only synchronous fallback.
      lease.releaseSync();
      assert.equal(await readFile(lease.path, "utf8"), contents);
      await assert.rejects(lease.release(), /ownership changed/u);
    } finally {
      // oxlint-disable-next-line node/no-sync -- This regression exercises the intentional exit-only synchronous fallback.
      lease.releaseSync();
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("rejects a second facade process until the owner exits", async () => {
    const root = await temporaryRoot("child");
    const leaseUrl = pathToFileURL(resolvePath("server/src/lease.ts")).href;
    const script = `
      import { acquireFacadeLease } from ${JSON.stringify(leaseUrl)};
      const lease = await acquireFacadeLease(${JSON.stringify(root)});
      process.stdout.write('READY\\n');
      process.once('SIGTERM', async () => {
        await lease.release();
        process.exit(0);
      });
      setInterval(() => {}, 1000);
    `;
    const child = spawn(
      process.execPath,
      ["--input-type=module", "--eval", script],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    try {
      await waitForReady(child);
      await assert.rejects(
        acquireFacadeLease(root),
        /Another EasyEDA control facade owns/u,
      );
      await stopChild(child);
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await stopChild(child);
      await rm(root, { recursive: true, force: true });
    }
  });
});
