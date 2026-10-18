/** Fixed synthetic children only. This module never allocates or changes a control root. */
import assert from "node:assert/strict";
import { lstat, realpath } from "node:fs/promises";
import { basename, dirname, isAbsolute } from "node:path";

export async function assertParentTestRoot(encoded: string | undefined): Promise<string> {
  assert.ok(encoded !== undefined && encoded.length <= 8192);
  const value: unknown = JSON.parse(encoded);
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  assert.deepEqual(Object.keys(value).toSorted(), ["dev", "directory", "gid", "ino", "mode", "pid", "temporaryDirectory", "uid"]);
  const parent: unknown = Reflect.get(value, "temporaryDirectory"), root: unknown = Reflect.get(value, "directory");
  assert.ok(typeof root === "string" && typeof parent === "string" && isAbsolute(root) && isAbsolute(parent));
  assert.equal(Reflect.get(value, "pid"), process.ppid);
  assert.equal(dirname(root), parent);
  assert.match(basename(root), new RegExp(`^easyeda-test-control-${String(process.ppid)}-[A-Za-z0-9]+$`, "u"));
  assert.equal(await realpath(parent), parent);
  assert.equal(await realpath(root), root);
  const current = await lstat(root);
  assert.ok(current.isDirectory() && !current.isSymbolicLink());
  assert.equal(current.mode % 4096, 0o700);
  assert.equal(current.uid, process.getuid?.());
  for (const key of ["dev", "ino", "uid", "gid", "mode"] as const) { assert.equal(current[key], Reflect.get(value, key)); }
  return root;
}
