import assert from "node:assert/strict";
import { lstat, realpath, rm, rmdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { assertRejectsAtBoundary } from "./helpers/rejection-boundary.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

void test("test fixtures honor the canonical temporary root with private permissions", async () => {
  const directory = await createTestTemporaryDirectory("easyeda-temp-path-test-");
  try {
    assert.equal(dirname(directory), await realpath(tmpdir()));
    const information = await lstat(directory);
    if (process.platform !== "win32") {
      assert.equal(information.mode % 4096, 0o700);
      assert.equal(information.uid, process.getuid?.());
    }
  } finally {
    await rmdir(directory);
  }
});

void test("test fixtures resolve a TMPDIR symlink without retaining its spelling", { skip: process.platform === "win32" }, async () => {
  const parent = await createTestTemporaryDirectory("easyeda-temp-alias-test-");
  const alias = join(parent, "alias"), previous = process.env["TMPDIR"];
  await symlink(parent, alias);
  try {
    process.env["TMPDIR"] = alias;
    const directory = await createTestTemporaryDirectory("easyeda-canonical-child-");
    assert.equal(dirname(directory), parent);
    await rmdir(directory);
  } finally {
    if (previous === undefined) { delete process.env["TMPDIR"]; }
    else { process.env["TMPDIR"] = previous; }
    await rm(parent, { recursive: true });
  }
});

void test("test fixture prefixes cannot choose another parent", async () => {
  for (const prefix of ["", "../escape-", "/absolute-", "nested/child-", "without-suffix", String.raw`bad\prefix-`]) {
    await assert.rejects(createTestTemporaryDirectory(prefix), /regular expression/u);
  }
});

void test("rejection boundary keeps the original setup error and secondary assertion", async () => {
  const original = Object.assign(new Error("synthetic fixture write failure"), { code: "ENOSPC" });
  const boundary = new Error("dispatch was not reached");
  await assert.rejects(assertRejectsAtBoundary(Promise.reject(original), () => { throw boundary; }), (error: unknown): boolean => {
    assert.ok(error instanceof AggregateError);
    assert.equal(error.cause, original);
    assert.deepEqual(error.errors, [original, boundary]);
    return true;
  });
});

void test("rejection boundary still requires rejection and runs the boundary exactly once", async () => {
  let observations = 0;
  await assertRejectsAtBoundary(Promise.reject(new Error("intended refusal")), () => { observations += 1; });
  assert.equal(observations, 1);
  await assert.rejects(assertRejectsAtBoundary(Promise.resolve(), () => { observations += 1; }), /Missing expected rejection/u);
  assert.equal(observations, 1);
});
