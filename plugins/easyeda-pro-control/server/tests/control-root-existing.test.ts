import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, mkdir, symlink } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { openControlRootCapability } from "../src/control-root.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

void test("existing-only direct root admission never creates the missing final directory", async () => {
  const root = join(syntheticSqlRoot(), randomUUID());
  await assert.rejects(openControlRootCapability(root, false), /ENOENT/u);
  await assert.rejects(lstat(root), /ENOENT/u);
});
for (const mode of ["read-first", "read-first-concurrent", "write-first", "existing", "replaced", "symlink", "historical-missing"] as const) {
  void test(`first retained root promise preserves ${mode} semantics`, async () => {
    const root = join(syntheticSqlRoot(), randomUUID());
    if (mode === "existing" || mode === "replaced") { await mkdir(root, { mode: 0o700 }); }
    if (mode === "symlink") { const target = `${root}.target`; await mkdir(target, { mode: 0o700 }); await symlink(target, root); }
    const { promise, resolve, reject } = Promise.withResolvers<{ stdout: string; stderr: string }>();
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Bounded execFile completion is a callback API.
    execFile(process.execPath, [fileURLToPath(new URL("helpers/control-root-existing-child.ts", import.meta.url)), root, mode], { env: { NODE_NO_WARNINGS: "1" }, maxBuffer: 16_384, timeout: 15_000 }, (error, stdout, stderr) => { if (error === null) { resolve({ stdout, stderr }); } else { reject(new Error("Synthetic root-seam child failed.", { cause: error })); } });
    const result = await promise; assert.deepEqual(JSON.parse(result.stdout), { mode, passed: true }); assert.equal(result.stderr, "");
  });
}
