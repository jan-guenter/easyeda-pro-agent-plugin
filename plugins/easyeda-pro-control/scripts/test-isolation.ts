import assert from "node:assert/strict";
import { lstat, mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Node evaluates --import before each test worker's static dependencies.
// Every worker gets a fresh directory, never an inherited control root.
// Keep this preload builtin-only: application imports can capture paths eagerly.
// Retain the exact generated directory, including on failure, for investigation.
// Individual tests may still create and clean up their own narrower fixtures.
// oxlint-disable-next-line node/no-top-level-await -- The test entrypoint must await isolation before Node loads any test module.
const temporaryDirectory = await realpath(tmpdir());
// oxlint-disable-next-line node/no-top-level-await -- Canonicalize TMPDIR before creating this worker's private root.
const directory = await mkdtemp(join(temporaryDirectory, `easyeda-test-control-${String(process.pid)}-`));
// oxlint-disable-next-line node/no-top-level-await -- Retain the original directory identity before application imports.
const information = await lstat(directory);
export const testIsolation = Object.freeze({ directory, temporaryDirectory, pid: process.pid,
  dev: information.dev, ino: information.ino, uid: information.uid, gid: information.gid, mode: information.mode });

/** Reimporting this preloaded module reuses its original identity; it allocates nothing. */
export async function assertTestIsolation(): Promise<typeof testIsolation> {
  assert.equal(process.env["EASYEDA_CONTROL_DATA_DIR"], directory);
  assert.equal(process.env["EASYEDA_BRIDGE_TOKEN_FILE"], join(directory, "bridge-token"));
  assert.equal(process.env["EASYEDA_UPSTREAM_DATA_DIR"], join(directory, "upstream"));
  assert.equal(await realpath(directory), directory);
  const current = await lstat(directory);
  assert.ok(current.isDirectory() && !current.isSymbolicLink());
  assert.equal(current.mode % 4096, 0o700);
  assert.equal(current.uid, process.getuid?.());
  for (const key of ["dev", "ino", "uid", "gid", "mode"] as const) { assert.equal(current[key], testIsolation[key]); }
  return testIsolation;
}
process.env["EASYEDA_CONTROL_DATA_DIR"] = directory;
// These overrides resolve independently in production modules. Inheriting them
// Would leave tests pointed at the user's credential or upstream state paths.
process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(directory, "bridge-token");
process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(directory, "upstream");
