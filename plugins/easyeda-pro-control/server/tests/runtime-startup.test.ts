import assert from "node:assert/strict";
import fileSystem from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import process from "node:process";
import { describe, test } from "node:test";

import { captureBackendProcessAuthority } from "../src/backend-listener-authority.ts";
import { waitForSandboxNodeIdentity } from "../src/sandboxed-stdio-client-transport.ts";
import {
  UpstreamEasyedaClient,
  UpstreamStartupError,
  startupFailureWithStderr,
} from "../src/upstream.ts";

void describe("upstream startup failure boundaries", { concurrency: false }, () => {
  void test("joins startup after its gateway has been published", async () => {
    const upstream = new UpstreamEasyedaClient();
    const startup = Promise.withResolvers<never>();
    const expectedFailure = new Error("shared startup failure");
    assert.equal(Reflect.set(upstream, "connectPromise", startup.promise), true);
    assert.equal(Reflect.set(upstream, "bridgeGateway", {}), true);
    const joined = upstream.connect();
    const rejection = assert.rejects(joined, expectedFailure);
    startup.reject(expectedFailure);
    await rejection;
  });

  void test("reports categorical startup evidence without reflecting private text", () => {
    const privateText = "private-credential-and-design-content";
    const diagnostics = {
      schema: "easyeda-pro-control.sandbox-startup-diagnostics.v1",
      stage: "supervisor-readiness",
      monitorExitCode: 1,
      monitorSignal: null,
      sandboxExitCode: 1,
    } as const;
    const failure = startupFailureWithStderr(
      new Error(privateText),
      229,
      "e".repeat(64),
      diagnostics,
    );
    assert.ok(failure instanceof UpstreamStartupError);
    assert.deepEqual(failure.startupDiagnostics, diagnostics);
    assert.match(failure.message, /Startup stage: supervisor-readiness/u);
    assert.match(failure.message, /229 private diagnostic bytes/u);
    assert.equal(failure.message.includes(privateText), false);
    assert.equal(JSON.stringify(failure).includes(privateText), false);
  });

  void test("retains categorical diagnostics even when stderr is empty", () => {
    const diagnostics = {
      schema: "easyeda-pro-control.sandbox-startup-diagnostics.v1",
      stage: "process-spawn",
      monitorExitCode: null,
      monitorSignal: null,
      sandboxExitCode: null,
    } as const;
    const failure = startupFailureWithStderr(new Error("spawn failed"), 0, "0".repeat(64), diagnostics);
    assert.ok(failure instanceof UpstreamStartupError);
    assert.deepEqual(failure.startupDiagnostics, diagnostics);
  });

  void test("closes an executable descriptor acquired after child exit", async (context) => {
    const nodeHandle = await fileSystem.open(process.execPath, "r");
    const authority = await captureBackendProcessAuthority(process.pid);
    const childClosed = Promise.withResolvers<null>();
    const originalOpen = fileSystem.open;
    const retained: { handle: FileHandle | undefined } = { handle: undefined };
    const intercepted = context.mock.method(
      fileSystem,
      "open",
      async (...arguments_: Parameters<typeof originalOpen>): Promise<FileHandle> => {
        const handle = await originalOpen(...arguments_);
        if (arguments_[0] === `/proc/${process.pid}/exe`) {
          retained.handle = handle;
          childClosed.resolve(null);
          await Promise.resolve();
        }
        return handle;
      },
    );
    syncBuiltinESMExports();
    try {
      await assert.rejects(
        waitForSandboxNodeIdentity(authority, nodeHandle, [], childClosed.promise),
        /closed before exact reviewed Node identity admission/u,
      );
      assert.ok(retained.handle !== undefined);
      await assert.rejects(retained.handle.stat(), { code: "EBADF" });
    } finally {
      intercepted.mock.restore();
      syncBuiltinESMExports();
      await retained.handle?.close();
      await nodeHandle.close();
    }
  });
});
