import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { Writable } from "node:stream";
import { describe, test } from "node:test";

import {
  classifySandboxStdoutLine,
  closeSandboxProcess,
  deliverSandboxBootstrap,
  parseBubblewrapStatusLine,
  writeComplete,
} from "../src/sandboxed-stdio-client-transport.ts";
import type { BubblewrapStatusState } from "../src/sandboxed-stdio-client-transport.ts";
import {
  createSerializedShutdown,
  shutdownBeforeLeaseRelease,
} from "../src/shutdown.ts";
import {
  assertSandboxDescriptorTargets,
  assertSandboxProcessTopology,
  assertZeroSoftCoreLimit,
  captureBackendProcessAuthority,
} from "../src/backend-listener-authority.ts";
import {
  UpstreamEasyedaClient,
  startupFailureWithStderr,
} from "../src/upstream.ts";
import { SerializedGate } from "../src/engine.ts";

function reviewedNodeDescriptorBaseline(): Map<number, string> {
  return new Map([
    [0, "socket:[100]"],
    [1, "socket:[101]"],
    [2, "socket:[102]"],
    [3, "anon_inode:[eventpoll]"],
    [4, "pipe:[200]"],
    [5, "pipe:[200]"],
    [6, "pipe:[201]"],
    [7, "pipe:[201]"],
    [8, "anon_inode:[eventfd]"],
    [9, "anon_inode:[eventpoll]"],
    [10, "pipe:[202]"],
    [11, "pipe:[202]"],
    [12, "anon_inode:[eventfd]"],
    [13, "anon_inode:[eventpoll]"],
    [14, "pipe:[203]"],
    [15, "pipe:[203]"],
    [16, "anon_inode:[eventfd]"],
    [17, "/dev/null"],
  ]);
}

void describe("sandbox process lifetime", () => {
  void test("waits for asynchronous write completion before secret zeroing", async () => {
    let consumed: Buffer | undefined;
    // oxlint-disable promise/prefer-await-to-callbacks -- The fixture deliberately delays Writable's callback to prove that a true-returning write is not yet complete.
    const destination = new Writable({
      write: (chunk: Buffer, _encoding, callback): void => {
        setTimeout(() => {
          consumed = Buffer.from(chunk);
          callback();
        }, 25);
      },
    });
    // oxlint-enable promise/prefer-await-to-callbacks
    const secret = Buffer.from("private bootstrap secret", "utf8");
    let settled = false;
    const writing = writeComplete(destination, secret);
    const settlement = (async (): Promise<void> => {
      await writing;
      settled = true;
    })();
    assert.equal(settled, false);
    await writing;
    await settlement;
    assert.deepEqual(consumed, secret);
    secret.fill(0);
    assert.equal(consumed?.toString("utf8"), "private bootstrap secret");
    destination.end();
  });

  void test("writes no bootstrap bytes before child authority is persisted", async () => {
    let consumed: Buffer | undefined;
    // oxlint-disable promise/prefer-await-to-callbacks -- The fixture observes the Writable callback boundary used by bootstrap delivery.
    const destination = new Writable({
      write: (chunk: Buffer, _encoding, callback): void => {
        consumed = Buffer.from(chunk);
        callback();
      },
    });
    // oxlint-enable promise/prefer-await-to-callbacks
    const authorityPrepared = Promise.withResolvers<null>();
    const bootstrapMaterial = Buffer.from("ephemeral bootstrap material", "utf8");
    const expected = Buffer.from(bootstrapMaterial);
    const delivery = deliverSandboxBootstrap(
      destination,
      bootstrapMaterial,
      async (): Promise<void> => {
        await authorityPrepared.promise;
      },
    );
    await Promise.resolve();
    assert.equal(consumed, undefined);
    assert.deepEqual(bootstrapMaterial, expected);
    authorityPrepared.resolve(null);
    await delivery;
    assert.deepEqual(consumed, expected);
    assert.deepEqual(bootstrapMaterial, Buffer.alloc(expected.length));
    destination.end();
  });

  void test("accepts only exact ordered bubblewrap status records", () => {
    const state: BubblewrapStatusState = {
      childNamespaces: null,
      childPid: null,
      exitCode: null,
      totalBytes: 0,
    };
    const childRecord = JSON.stringify({
      "child-pid": 123,
      "cgroup-namespace": 101,
      "ipc-namespace": 102,
      "mnt-namespace": 103,
      "pid-namespace": 104,
      "uts-namespace": 105,
    });
    assert.equal(parseBubblewrapStatusLine(childRecord, state), 123);
    assert.equal(parseBubblewrapStatusLine('{"exit-code":0}', state), undefined);
    assert.deepEqual(state, {
      childNamespaces: {
        cgroup: 101,
        ipc: 102,
        mnt: 103,
        pid: 104,
        uts: 105,
      },
      childPid: 123,
      exitCode: 0,
      totalBytes: 0,
    });

    for (const line of [
      '{"child-pid":123,"exit-code":0}',
      '{"child-pid":123,"extra":true}',
      '{"exit-code":0,"extra":true}',
      '{"unknown":true}',
    ]) {
      const fresh: BubblewrapStatusState = {
        childNamespaces: null,
        childPid: null,
        exitCode: null,
        totalBytes: 0,
      };
      assert.throws(
        () => parseBubblewrapStatusLine(line, fresh),
        /invalid|unknown/u,
      );
    }
  });

  void test("rejects every stdout frame before bootstrap admission", () => {
    assert.equal(
      classifySandboxStdoutLine(
        "easyeda-pro-control.upstream-supervisor-ready.v1",
        false,
        false,
      ),
      "ready",
    );
    assert.throws(
      () => classifySandboxStdoutLine('{"jsonrpc":"2.0"}', false, false),
      /before its exact supervisor readiness marker/u,
    );
    assert.throws(
      () => classifySandboxStdoutLine('{"jsonrpc":"2.0"}', true, false),
      /between supervisor readiness and protocol admission/u,
    );
    assert.equal(
      classifySandboxStdoutLine('{"jsonrpc":"2.0"}', true, true),
      "protocol",
    );
  });

  void test("admits only the exact Node 24 descriptor topology", () => {
    assert.equal(assertSandboxDescriptorTargets(reviewedNodeDescriptorBaseline()), 17);
    for (const mutate of [
      (targets: Map<number, string>): void => {
        targets.set(4096, "pipe:[900]");
      },
      (targets: Map<number, string>): void => {
        targets.set(18, "pipe:[900]");
        targets.set(19, "pipe:[900]");
      },
      (targets: Map<number, string>): void => {
        targets.set(18, "anon_inode:[eventfd]");
      },
      (targets: Map<number, string>): void => {
        targets.set(18, "anon_inode:[io_uring]");
      },
      (targets: Map<number, string>): void => {
        targets.set(18, "socket:[901]");
      },
      (targets: Map<number, string>): void => {
        targets.set(5, "pipe:[999]");
      },
    ]) {
      const targets = reviewedNodeDescriptorBaseline();
      mutate(targets);
      assert.throws(
        () => assertSandboxDescriptorTargets(targets),
        /descriptor|pipe/u,
      );
    }
  });

  void test("requires a zero soft core limit before bootstrap", () => {
    assert.doesNotThrow(() => {
      assertZeroSoftCoreLimit(
        "Max core file size        0                    unlimited            bytes     \n",
      );
    });
    assert.throws(
      () => {
        assertZeroSoftCoreLimit(
          "Max core file size        1024                 unlimited            bytes     \n",
        );
      },
      /zero soft core-file limit/u,
    );
  });

  void test(
    "rejects a same-UID process without exact bubblewrap ancestry and PID namespace identity",
    { skip: process.platform !== "linux" },
    async () => {
      const [current, parent] = await Promise.all([
        captureBackendProcessAuthority(process.pid),
        captureBackendProcessAuthority(process.ppid),
      ]);
      const namespaces = { cgroup: 1, ipc: 1, mnt: 1, pid: 1, uts: 1 };
      await assert.rejects(
        assertSandboxProcessTopology(current, current, namespaces),
        /not owned by the exact live bubblewrap monitor/u,
      );
      await assert.rejects(
        assertSandboxProcessTopology(current, parent, namespaces),
        /not PID 1 in the reviewed PID namespace/u,
      );
    },
  );

  void test("withholds arbitrary upstream stderr content", () => {
    const privateDiagnostic = ["split", "credential", "and", "design", "payload"].join("-");
    const error = startupFailureWithStderr(
      new Error("startup failed"),
      1_000_000,
      "a".repeat(64),
    );
    assert.ok(error instanceof Error);
    assert.doesNotMatch(error.message, new RegExp(privateDiagnostic, "u"));
    assert.doesNotMatch(error.message, /design|token/u);
    assert.match(error.message, /1000000 private diagnostic bytes/u);
    assert.match(error.message, /SHA-256/u);
  });

  void test(
    "does not claim closure when an exited process has descendant-held stdio",
    { skip: process.platform !== "linux" },
    async () => {
      const parentSource = `
        const { spawn } = require("node:child_process");
        const descendant = spawn(process.execPath, ["-e", "setTimeout(() => {}, 1000)"], {
          stdio: ["ignore", 1, 2],
        });
        descendant.unref();
      `;
      const child = spawn(process.execPath, ["--eval", parentSource], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      const closed: Promise<unknown> = once(child, "close");
      await once(child, "exit");
      assert.equal(child.exitCode, 0);
      await assert.rejects(
        closeSandboxProcess(child, closed, 25),
        /did not reach its close\/reap boundary/u,
      );
      await closed;
    },
  );

  void test("surfaces every upstream shutdown boundary failure", async () => {
    const upstream = new UpstreamEasyedaClient();
    const attempted: string[] = [];
    const attempts = new Map<string, number>();
    const failingResource = (name: string): { close: () => Promise<void> } => ({
      close: (): Promise<void> => {
        attempted.push(name);
        const count = (attempts.get(name) ?? 0) + 1;
        attempts.set(name, count);
        return count === 1
          ? Promise.reject(new Error(`${name} close failed`))
          : Promise.resolve();
      },
    });
    assert.equal(
      Reflect.set(upstream, "bridgeGateway", failingResource("gateway")),
      true,
    );
    assert.equal(Reflect.set(upstream, "client", failingResource("client")), true);
    assert.equal(
      Reflect.set(upstream, "transport", failingResource("transport")),
      true,
    );
    await assert.rejects(
      upstream.close(),
      (error: unknown) =>
        error instanceof AggregateError &&
        error.errors.length === 3 &&
        /shutdown was incomplete/u.test(error.message),
    );
    assert.deepEqual(attempted, ["gateway", "client", "transport"]);
    await upstream.close();
    assert.deepEqual(attempted, [
      "gateway",
      "client",
      "transport",
      "gateway",
      "client",
      "transport",
    ]);
  });

  void test("quarantines an unrecoverable startup cleanup failure", async () => {
    const upstream = new UpstreamEasyedaClient();
    const cleanupFailure = new Error("retained pre-transport descriptor");
    assert.equal(
      Reflect.set(upstream, "fatalStartupCleanupFailure", cleanupFailure),
      true,
    );
    await assert.rejects(
      upstream.connect(),
      /quarantined after incomplete startup cleanup/u,
    );
    await assert.rejects(
      upstream.close(),
      (error: unknown) =>
        error instanceof AggregateError &&
        error.errors.includes(cleanupFailure),
    );
  });

  void test("waits for in-flight startup before shutdown can complete", async () => {
    const upstream = new UpstreamEasyedaClient();
    const startup = Promise.withResolvers<object>();
    let transportClosed = false;
    assert.equal(Reflect.set(upstream, "connectPromise", startup.promise), true);
    const closing = upstream.close();
    await Promise.resolve();
    assert.equal(transportClosed, false);
    assert.equal(
      Reflect.set(upstream, "transport", {
        close: (): Promise<void> => {
          transportClosed = true;
          return Promise.resolve();
        },
      }),
      true,
    );
    startup.resolve({});
    await closing;
    assert.equal(transportClosed, true);
    await assert.rejects(upstream.connect(), /client is closed/u);
  });

  void test("retains the ownership lease until every authority closes", async () => {
    const closing = Promise.withResolvers<true>();
    let released = false;
    const shutdown = shutdownBeforeLeaseRelease(
      [
        {
          close: async (): Promise<void> => {
            await closing.promise;
          },
        },
        { close: (): Promise<void> => Promise.resolve() },
      ],
      {
        release: (): Promise<void> => {
          released = true;
          return Promise.resolve();
        },
      },
    );
    await Promise.resolve();
    assert.equal(released, false);
    closing.resolve(true);
    await shutdown;
    assert.equal(released, true);

    released = false;
    await assert.rejects(
      shutdownBeforeLeaseRelease(
        [{ close: (): Promise<void> => Promise.reject(new Error("live child")) }],
        {
          release: (): Promise<void> => {
            released = true;
            return Promise.resolve();
          },
        },
      ),
      /ownership lease remains retained/u,
    );
    assert.equal(released, false);
  });

  void test("closes admission first and drains serialized work before authority and lease release", async () => {
    const gate = new SerializedGate();
    const activeWork = Promise.withResolvers<null>();
    const events: string[] = [];
    const admitted = gate.run(async (): Promise<void> => {
      events.push("work-started");
      await activeWork.promise;
      events.push("work-settled");
    });
    await Promise.resolve();

    const shutdown = createSerializedShutdown(
      {
        close: (): Promise<void> => {
          events.push("admission-closed");
          return Promise.resolve();
        },
      },
      [
        {
          close: (): Promise<void> => {
            events.push("authority-closed");
            return Promise.resolve();
          },
        },
      ],
      {
        release: (): Promise<void> => {
          events.push("lease-released");
          return Promise.resolve();
        },
      },
      gate,
    );

    const firstShutdown = shutdown();
    const duplicateShutdown = shutdown();
    assert.equal(duplicateShutdown, firstShutdown);
    let lateWorkRan = false;
    await assert.rejects(
      gate.run(() => {
        lateWorkRan = true;
      }),
      /no longer accepts operations/u,
    );
    await Promise.resolve();
    assert.deepEqual(events, ["work-started", "admission-closed"]);

    activeWork.resolve(null);
    await Promise.all([admitted, firstShutdown]);
    assert.deepEqual(events, [
      "work-started",
      "admission-closed",
      "work-settled",
      "authority-closed",
      "lease-released",
    ]);
    assert.equal(lateWorkRan, false);
  });

  void test("publishes one shutdown promise before admission close can re-enter", async () => {
    const gate = new SerializedGate();
    const shutdownHolder: { value?: () => Promise<void> } = {};
    let reentered: Promise<void> | undefined;
    let admissionCloseCalls = 0;
    let authorityCloseCalls = 0;
    let leaseReleaseCalls = 0;
    const shutdown = createSerializedShutdown(
      {
        close: (): Promise<void> => {
          admissionCloseCalls += 1;
          assert.ok(shutdownHolder.value);
          reentered = shutdownHolder.value();
          return Promise.resolve();
        },
      },
      [
        {
          close: (): Promise<void> => {
            authorityCloseCalls += 1;
            return Promise.resolve();
          },
        },
      ],
      {
        release: (): Promise<void> => {
          leaseReleaseCalls += 1;
          return Promise.resolve();
        },
      },
      gate,
    );
    shutdownHolder.value = shutdown;

    const first = shutdown();
    assert.equal(reentered, first);
    await first;
    assert.equal(admissionCloseCalls, 1);
    assert.equal(authorityCloseCalls, 1);
    assert.equal(leaseReleaseCalls, 1);
  });

  void test("drains admitted work and closes authority after admission close rejects", async () => {
    const gate = new SerializedGate();
    const activeWork = Promise.withResolvers<null>();
    const events: string[] = [];
    const admitted = gate.run(async (): Promise<void> => {
      events.push("work-started");
      await activeWork.promise;
      events.push("work-settled");
    });
    await Promise.resolve();
    let leaseReleased = false;
    const shutdown = createSerializedShutdown(
      {
        close: (): Promise<void> => {
          events.push("admission-close-rejected");
          return Promise.reject(new Error("transport close failed"));
        },
      },
      [
        {
          close: (): Promise<void> => {
            events.push("authority-closed");
            return Promise.resolve();
          },
        },
      ],
      {
        release: (): Promise<void> => {
          leaseReleased = true;
          return Promise.resolve();
        },
      },
      gate,
    );

    const closing = shutdown();
    await Promise.resolve();
    assert.deepEqual(events, ["work-started", "admission-close-rejected"]);
    activeWork.resolve(null);
    await admitted;
    await assert.rejects(closing, /ownership lease remains retained/u);
    assert.deepEqual(events, [
      "work-started",
      "admission-close-rejected",
      "work-settled",
      "authority-closed",
    ]);
    assert.equal(leaseReleased, false);
  });

  void test("closes authorities concurrently with a pending admission close", async () => {
    const gate = new SerializedGate();
    const admissionClosed = Promise.withResolvers<null>();
    const events: string[] = [];
    const shutdown = createSerializedShutdown(
      {
        close: async (): Promise<void> => {
          events.push("admission-close-started");
          await admissionClosed.promise;
          events.push("admission-close-settled");
        },
      },
      [
        {
          close: (): Promise<void> => {
            events.push("authority-closed");
            admissionClosed.resolve(null);
            return Promise.resolve();
          },
        },
      ],
      {
        release: (): Promise<void> => {
          events.push("lease-released");
          return Promise.resolve();
        },
      },
      gate,
    );

    await shutdown();
    assert.deepEqual(events, [
      "admission-close-started",
      "authority-closed",
      "admission-close-settled",
      "lease-released",
    ]);
  });

  void test(
    "terminates an active child and waits for its exact close boundary",
    { skip: process.platform !== "linux" },
    async () => {
      const child = spawn(
        process.execPath,
        ["--eval", "setInterval(() => {}, 1000)"],
        { stdio: ["pipe", "pipe", "pipe"] },
      );
      const closed: Promise<unknown> = once(child, "close");
      await once(child, "spawn");
      await closeSandboxProcess(child, closed, 500);
      await closed;
      assert.notEqual(child.signalCode, null);
    },
  );
});
