/** Synthetic subprocess to exercise the real module's first retained promise. */
import assert from "node:assert/strict";
import { lstat, mkdir, realpath, rename } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

async function main(): Promise<void> {
  const root = process.argv[2]; const mode = process.argv[3];
  assert.ok(root !== undefined && mode !== undefined);
  const parent = dirname(root);
  assert.match(basename(parent), /^easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u);
  assert.equal(await realpath(parent), parent);
  const parentInfo = await lstat(parent);
  assert.equal(parentInfo.mode % 512, 0o700);
  process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(root, "bridge-token");
  process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(root, "upstream");
  const { controlRootCapability } = await import("../../src/artifacts.ts");
  if (mode === "historical-missing") {
    const { inspectRecordedClosedCopy } = await import("../../src/closed-symbol-recorded-copy.ts");
    await assert.rejects(inspectRecordedClosedCopy({ operationId: "easyeda-20261012t000000z-12345678", phase: "baseline-copy", runtime: { nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: "a".repeat(64) } }), /ENOENT/u);
    await assert.rejects(lstat(root), /ENOENT/u);
  } else if (mode === "read-first" || mode === "read-first-concurrent") {
    const first = controlRootCapability(false);
    if (mode === "read-first") { await assert.rejects(first, /ENOENT/u); }
    const second = controlRootCapability(); assert.equal(first, second);
    const result = await Promise.allSettled([first, second]); assert.deepEqual(result.map((entry) => entry.status), ["rejected", "rejected"]);
    await assert.rejects(lstat(root), /ENOENT/u);
  } else if (mode === "write-first" || mode === "existing" || mode === "replaced") {
    const first = controlRootCapability(mode === "write-first"); const second = controlRootCapability(false); assert.equal(first, second);
    const capability = await first;
    try {
      await capability.assertCurrent();
      if (mode === "replaced") { await rename(root, `${root}.retained`); await mkdir(root, { mode: 0o700 }); await assert.rejects(capability.assertCurrent(), /pathname changed/u); assert.equal(controlRootCapability(), first); }
    } finally { await capability.close(); }
  } else if (mode === "symlink") { await assert.rejects(controlRootCapability(false), /symbolic-link/u); }
  else { throw new Error("Unknown synthetic mode."); }
  process.stdout.write(`${JSON.stringify({ mode, passed: true })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Standalone bounded synthetic subprocess entrypoint.
await main();
