import assert from "node:assert/strict";
import { lstat, mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Honor TMPDIR without retaining a symlink spelling or silently deleting failures. */
export async function createTestTemporaryDirectory(prefix: string): Promise<string> {
  assert.match(prefix, /^[a-z][a-z0-9-]*-$/u);
  const parent = await realpath(tmpdir());
  const directory = await mkdtemp(join(parent, prefix));
  const information = await lstat(directory);
  assert.ok(information.isDirectory() && !information.isSymbolicLink());
  if (process.platform !== "win32") {
    assert.equal(information.mode % 4096, 0o700);
    assert.equal(information.uid, process.getuid?.());
  }
  assert.equal(await realpath(directory), directory);
  return directory;
}
