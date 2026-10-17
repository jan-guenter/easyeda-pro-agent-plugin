import assert from "node:assert/strict";
import { mkdir, rename, symlink, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { assertOperationIdUnused, controlDataDirectory, ensureOperationStorage, operationPath } from "../src/artifacts.ts";

void test("unused-ID observation reads only the exact name and rejects every present journal or evidence entry", async () => {
  const directory = await ensureOperationStorage();
  await writeFile(operationPath("unrelated-malformed-peer"), "not JSON", { mode: 0o600, flag: "wx" });
  await assertOperationIdUnused("unused-exact-operation");
  for (const kind of ["malformed", "empty", "symlink", "directory", "evidence"] as const) {
    const id = `consumed-operation-${kind}`, path = operationPath(id);
    if (kind === "symlink") { await symlink(join(directory, "missing-target"), path); }
    else if (kind === "directory") { await mkdir(path, { mode: 0o700 }); }
    else if (kind === "evidence") { await mkdir(join(directory, id), { mode: 0o700 }); }
    else { await writeFile(path, kind === "empty" ? "" : "not JSON", { mode: 0o600, flag: "wx" }); }
    await assert.rejects(assertOperationIdUnused(id), /ID is consumed/u);
  }
  await assert.rejects(assertOperationIdUnused("../escaped-operation"), /Invalid operationId/u);
});

void test("unused-ID observation refuses a missing or symlinked operations namespace", async () => {
  const directory = await ensureOperationStorage(), retained = join(controlDataDirectory(), "retained-test-operations");
  await rename(directory, retained);
  try {
    await assert.rejects(assertOperationIdUnused("missing-parent-operation"), /ENOENT/u);
    await symlink(retained, directory, "dir");
    try { await assert.rejects(assertOperationIdUnused("aliased-parent-operation"), /not a real directory/u); }
    finally { await unlink(directory); }
  } finally { await rename(retained, directory); }
});
