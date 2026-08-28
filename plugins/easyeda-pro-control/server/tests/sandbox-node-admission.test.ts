import assert from "node:assert/strict";
import { open } from "node:fs/promises";
import process from "node:process";
import { test } from "node:test";

import { captureBackendProcessAuthority } from "../src/backend-listener-authority.ts";
import { waitForSandboxNodeIdentity } from "../src/sandboxed-stdio-client-transport.ts";

void test(
  "stops Node identity admission as soon as the sandbox child closes",
  { skip: process.platform !== "linux" },
  async () => {
    const authority = await captureBackendProcessAuthority(process.pid);
    const nodeHandle = await open(process.execPath, "r");
    const startedAt = Date.now();
    try {
      await assert.rejects(
        waitForSandboxNodeIdentity(
          authority,
          nodeHandle,
          ["deliberately-inexact-command-line"],
          Promise.resolve(null),
        ),
        /closed before exact reviewed Node identity admission/u,
      );
    } finally {
      await nodeHandle.close();
    }
    assert.ok(Date.now() - startedAt < 1000);
  },
);
