import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { runtimeFixture } from "./helpers/machine-current-runtime-fixture.ts";

void test("current runtime uses retained kernel and named descriptors, exact minimal probes, and closes both", async (context) => {
  const f = await runtimeFixture(context);
  const runtime = await f.module.currentProcessSqlRuntime();
  assert.deepEqual(runtime, { nodeExecutable: process.execPath, nodeVersion: "24.18.0",
    nodeSha256: createHash("sha256").update("synthetic executable\n").digest("hex") });
  assert.equal(Object.isFrozen(runtime), true);
  assert.equal(f.probes.length, 2);
  assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
  assert.equal(f.opened[0]?.label, "kernel");
  assert.equal(f.opened[1]?.label, "named");
  assert.ok(f.reads.every((path) => path === "/proc/self/exe" || path === "/proc/self/limits" || path === process.execPath));
  for (const entry of f.opened) { await assert.rejects(entry.handle.read(Buffer.alloc(1), 0, 1, 0), /closed/u); }
});

for (const [name, sameBytes] of [["same bytes on another inode", true], ["different bytes on another inode", false]] as const) {
  void test(`refuses ${name} substituted between lstat and named open, before version probe`, async (context) => {
    const f = await runtimeFixture(context);
    f.state.beforeOpen = (label): Promise<void> => {
      if (label === "named") { f.state.namedPath = sameBytes ? f.files.sameBytes : f.files.differentBytes; }
      return Promise.resolve();
    };
    await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-identity-mismatch/u);
    assert.equal(f.probes.length, 0);
    assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
  });
}
void test("refuses named substitution before lstat even when replacement bytes are equal", async (context) => {
  const f = await runtimeFixture(context); f.state.namedPath = f.files.sameBytes;
  await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-identity-mismatch/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
void test("refuses in-place replacement between original kernel hash and named admission", async (context) => {
  const f = await runtimeFixture(context);
  f.state.beforeOpen = async (label): Promise<void> => {
    if (label === "named") { await f.rewrite(f.files.original, "replaced executable!\n"); }
  };
  await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-identity-mismatch|machine-node-changed/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
void test("refuses kernel path divergence before opening named executable", async (context) => {
  const f = await runtimeFixture(context); f.state.kernelReportedPath = "/synthetic/unrelated-node";
  await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-invalid/u);
  assert.equal(f.opened.length, 1); assert.equal(f.probes.length, 0); assert.deepEqual(f.closed, ["kernel"]);
});
void test("refuses named symlink/canonical divergence before opening named executable", async (context) => {
  const f = await runtimeFixture(context); f.state.namedReportedPath = "/synthetic/unrelated-node";
  await assert.rejects(f.module.currentProcessSqlRuntime(), /not-bounded-canonical-regular/u);
  assert.equal(f.opened.length, 1); assert.equal(f.probes.length, 0); assert.deepEqual(f.closed, ["kernel"]);
});
for (const mode of [0o644, 0o775, 0o4755, 0o2755]) {
  void test(`refuses kernel executable mode ${mode.toString(8)} before named admission`, async (context) => {
    const f = await runtimeFixture(context); await f.chmod(f.files.original, mode);
    await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-invalid/u);
    assert.equal(f.probes.length, 0); assert.deepEqual(f.closed, ["kernel"]);
  });
}
void test("refuses empty kernel executable without a probe", async (context) => {
  const f = await runtimeFixture(context); await f.rewrite(f.files.original, "");
  await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-invalid/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed, ["kernel"]);
});
void test("refuses kernel path change at the final pre-probe identity check", async (context) => {
  const f = await runtimeFixture(context);
  f.state.beforeRealpath = (path, count): Promise<void> => {
    if (path === "/proc/self/exe" && count > 1) { f.state.kernelReportedPath = "/changed"; }
    return Promise.resolve();
  };
  await assert.rejects(f.module.currentProcessSqlRuntime(), /kernel-changed/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
for (const label of ["kernel", "named"] as const) {
  void test(`refuses ${label} descriptor mutation at the last pre-probe check`, async (context) => {
    const f = await runtimeFixture(context);
    f.state.beforeStat = async (actualLabel, count): Promise<void> => {
      if (actualLabel === label && count === 4) {
        await f.rewrite(f.files.original, "replaced executable!\n");
      }
    };
    await assert.rejects(f.module.currentProcessSqlRuntime(), /machine-node-changed/u);
    assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
  });
}
for (const mutate of ["bytes", "mode", "kernel-path", "named-path"] as const) {
  void test(`refuses ${mutate} drift during first probe and does not issue another`, async (context) => {
    const f = await runtimeFixture(context);
    f.state.beforeProbe = async (): Promise<void> => {
      if (mutate === "bytes") { await f.rewrite(f.files.original, "replaced executable!\n"); }
      if (mutate === "mode") { await f.chmod(f.files.original, 0o700); }
      if (mutate === "kernel-path") { f.state.kernelReportedPath = "/changed"; }
      if (mutate === "named-path") { f.state.namedPath = f.files.sameBytes; }
    };
    await assert.rejects(f.module.currentProcessSqlRuntime(), /machine-node-|kernel-changed/u);
    assert.equal(f.probes.length, 1); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
  });
}
for (const mutate of ["stdout", "stderr", "throw"] as const) {
  void test(`refuses probe ${mutate} and closes both handles`, async (context) => {
    const f = await runtimeFixture(context);
    if (mutate === "stdout") { f.state.stdout = "v26.0.0\n"; }
    if (mutate === "stderr") { f.state.stderr = "untrusted warning"; }
    if (mutate === "throw") { f.state.probeError = new Error("synthetic version probe failed"); }
    await assert.rejects(f.module.currentProcessSqlRuntime(), /version|probe failed/u);
    assert.equal(f.probes.length, 1); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
  });
}
void test("refuses nonzero soft core limit before executing any version probe", async (context) => {
  const f = await runtimeFixture(context);
  f.state.limits = "Max core file size         unlimited            unlimited            bytes\n";
  await assert.rejects(f.module.currentProcessSqlRuntime(), /zero soft core/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
for (const closeFailure of ["kernel", "named", "both"] as const) {
  void test(`attempts every owned close and returns no runtime when ${closeFailure} cleanup fails`, async (context) => {
    const f = await runtimeFixture(context); f.state.closeFailure = closeFailure;
    await assert.rejects(f.module.currentProcessSqlRuntime(), /close-failed/u);
    assert.equal(f.probes.length, 2); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
  });
}
void test("kernel close is still attempted after a named rejection close throws", async (context) => {
  const f = await runtimeFixture(context); f.state.namedPath = f.files.sameBytes; f.state.closeFailure = "named";
  await assert.rejects(f.module.currentProcessSqlRuntime(), /named close failure/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
void test("refuses unsupported current version without file access or version probe", async (context) => {
  const f = await runtimeFixture(context);
  const descriptor = Object.getOwnPropertyDescriptor(process.versions, "node"); assert.ok(descriptor);
  Object.defineProperty(process.versions, "node", { ...descriptor, value: "26.0.0" });
  try { await assert.rejects(f.module.currentProcessSqlRuntime(), /current-node-version-mismatch/u); }
  finally { Object.defineProperty(process.versions, "node", descriptor); }
  assert.equal(f.reads.length, 0); assert.equal(f.probes.length, 0); assert.equal(f.opened.length, 0);
});
for (const field of ["platform", "arch"] as const) {
  void test(`refuses unsupported ${field} before any file or child access`, async (context) => {
    const f = await runtimeFixture(context);
    const descriptor = Object.getOwnPropertyDescriptor(process, field); assert.ok(descriptor);
    Object.defineProperty(process, field, { ...descriptor, value: "unsupported" });
    try { await assert.rejects(f.module.currentProcessSqlRuntime(), /requires-linux-x64/u); }
    finally { Object.defineProperty(process, field, descriptor); }
    assert.equal(f.reads.length, 0); assert.equal(f.probes.length, 0); assert.equal(f.opened.length, 0);
  });
}
for (const label of ["kernel", "named"] as const) {
  void test(`propagates ${label} open failure and closes every already owned handle`, async (context) => {
    const f = await runtimeFixture(context);
    f.state.beforeOpen = (actualLabel): Promise<void> => {
      if (actualLabel === label) { return Promise.reject(new Error("synthetic open failure")); }
      return Promise.resolve();
    };
    await assert.rejects(f.module.currentProcessSqlRuntime(), /synthetic open failure/u);
    assert.equal(f.probes.length, 0); assert.deepEqual(f.closed, label === "kernel" ? [] : ["kernel"]);
  });
}
void test("second version probe mutation still refuses and closes both original handles", async (context) => {
  const f = await runtimeFixture(context);
  f.state.beforeProbe = async (count): Promise<void> => {
    if (count === 2) { await f.rewrite(f.files.original, "replaced executable!\n"); }
  };
  await assert.rejects(f.module.currentProcessSqlRuntime(), /machine-node-version-or-identity-mismatch/u);
  assert.equal(f.probes.length, 2); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
void test("kernel-derived content hash independently refuses changed bytes even if named metadata is reported unchanged", async (context) => {
  const f = await runtimeFixture(context);
  f.state.beforeOpen = async (label): Promise<void> => {
    if (label === "named") {
      const kernel = f.opened[0]; assert.ok(kernel);
      f.state.namedStatOverride = await kernel.handle.stat();
      await f.rewrite(f.files.original, "different executable\n");
    }
  };
  await assert.rejects(f.module.currentProcessSqlRuntime(), /machine-node-hash-mismatch/u);
  assert.equal(f.probes.length, 0); assert.deepEqual(f.closed.toSorted(), ["kernel", "named"]);
});
void test("close-time replacement leaves only original observed data and the next executable admission refuses before probing", async (context) => {
  const f = await runtimeFixture(context);
  f.state.beforeClose = (label): Promise<void> => {
    if (label === "named") { f.state.namedPath = f.files.differentBytes; }
    return Promise.resolve();
  };
  const runtime = await f.module.currentProcessSqlRuntime();
  assert.equal(runtime.nodeSha256, createHash("sha256").update("synthetic executable\n").digest("hex"));
  assert.equal(Object.isFrozen(runtime), true);
  assert.equal("descriptorPath" in runtime, false);
  assert.equal("assertCurrent" in runtime, false);
  assert.equal(f.probes.length, 2);
  await assert.rejects(f.module.openVerifiedMachineNode(runtime), /machine-node-hash-mismatch/u);
  assert.equal(f.probes.length, 2);
  assert.deepEqual(f.closed.toSorted(), ["kernel", "named", "named"]);
});
