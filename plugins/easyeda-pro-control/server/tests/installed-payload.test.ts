import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, cp, link, mkdir, mkdtemp, readFile, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { promisify } from "node:util";

import { verifyInstalledPayload } from "../../scripts/installed-payload.ts";

// oxlint-disable-next-line typescript/strict-void-return -- promisify consumes execFile's completion callback.
const execFileAsync = promisify(execFile);

async function fixture(): Promise<{ readonly commit: string; readonly installedRoot: string; readonly repositoryRoot: string; readonly sourceRoot: string }> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-installed-payload-test-"));
  const repositoryRoot = join(root, "repository");
  const sourceRoot = join(repositoryRoot, "plugins/easyeda-pro-control");
  const installedRoot = join(root, "installed");
  await mkdir(join(sourceRoot, "nested"), { recursive: true });
  await writeFile(join(sourceRoot, "README.md"), "fixture payload\n");
  await writeFile(join(sourceRoot, "nested", "é binary.bin"), Buffer.from([0, 1, 255]));
  await writeFile(join(sourceRoot, "run"), "#!/bin/false\n");
  for (const path of [sourceRoot, join(sourceRoot, "nested")]) { await chmod(path, 0o755); }
  for (const path of [join(sourceRoot, "README.md"), join(sourceRoot, "nested", "é binary.bin")]) { await chmod(path, 0o644); }
  await chmod(join(sourceRoot, "run"), 0o755);
  await cp(sourceRoot, installedRoot, { recursive: true });
  const options = { cwd: repositoryRoot, timeout: 10_000 };
  await execFileAsync("/usr/bin/git", ["init", "--initial-branch=main"], options);
  await execFileAsync("/usr/bin/git", ["add", "plugins"], options);
  await execFileAsync("/usr/bin/git", ["-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "--no-gpg-sign", "--no-verify", "-m", "fixture"], options);
  const result = await execFileAsync("/usr/bin/git", ["rev-parse", "HEAD"], options);
  return { commit: result.stdout.trim(), installedRoot, repositoryRoot, sourceRoot };
}

void describe("installed committed payload comparison", () => {
  void test("compares binary bytes, executable modes and complete directories without modifying them", async () => {
    const input = await fixture();
    const first = await verifyInstalledPayload(input);
    const second = await verifyInstalledPayload(input);
    assert.deepEqual(first, second);
    assert.equal(first.fileCount, 3);
    assert.equal(first.directoryCountIncludingRoot, 2);
    assert.equal(first.bytes, 32);
    assert.equal(first.scope, "read-only-file-comparison;not-runtime-admission");
    assert.match(first.inventorySha256, /^[a-f0-9]{64}$/u);
    assert.equal(await readFile(join(input.installedRoot, "README.md"), "utf8"), "fixture payload\n");
  });

  void test("rejects same-size changed bytes and file or directory permission drift", async () => {
    for (const kind of ["bytes", "file-mode", "directory-mode"] as const) {
      const input = await fixture();
      if (kind === "bytes") { await writeFile(join(input.installedRoot, "README.md"), "changed payload\n"); }
      if (kind === "file-mode") { await chmod(join(input.installedRoot, "run"), 0o644); }
      if (kind === "directory-mode") { await chmod(join(input.installedRoot, "nested"), 0o700); }
      await assert.rejects(verifyInstalledPayload(input), /Installed (?:file|directory)/u);
    }
  });

  void test("rejects extra files, extra empty directories and missing committed files", async () => {
    for (const kind of ["extra-file", "extra-directory", "missing"] as const) {
      const input = await fixture();
      if (kind === "extra-file") { await writeFile(join(input.installedRoot, "extra"), "extra"); }
      if (kind === "extra-directory") { await mkdir(join(input.installedRoot, "empty")); }
      if (kind === "missing") { await unlink(join(input.installedRoot, "README.md")); }
      await assert.rejects(verifyInstalledPayload(input), /(?:extra|missing)/u);
    }
  });

  void test("rejects hardlinks, file symlinks and linked roots", async () => {
    for (const kind of ["hardlink", "symlink", "root"] as const) {
      const input = await fixture();
      const path = join(input.installedRoot, "README.md");
      if (kind === "hardlink") { await link(path, join(input.repositoryRoot, "linked-copy")); }
      if (kind === "symlink") {
        await unlink(path);
        await symlink(join(input.sourceRoot, "README.md"), path);
      }
      if (kind === "root") {
        const linkedRoot = join(input.repositoryRoot, "installed-link");
        await symlink(input.installedRoot, linkedRoot);
        await assert.rejects(verifyInstalledPayload({ ...input, installedRoot: linkedRoot }), /linked or noncanonical/u);
      } else {
        await assert.rejects(verifyInstalledPayload(input));
      }
    }
  });

  void test("refuses noncanonical root paths, abbreviated hashes and another HEAD", async () => {
    const input = await fixture();
    for (const installedRoot of ["relative", `${input.installedRoot}/`, `${input.installedRoot}/../installed`, "/"]) {
      await assert.rejects(verifyInstalledPayload({ ...input, installedRoot }), /canonical absolute/u);
    }
    for (const commit of [input.commit.slice(0, 8), "HEAD", "f".repeat(40)]) {
      await assert.rejects(verifyInstalledPayload({ ...input, commit }), /(?:commit ID|does not match)/u);
    }
  });

  void test("rejects symlinks in committed Git objects before walking the installed payload", async () => {
    const input = await fixture();
    await symlink("README.md", join(input.sourceRoot, "link"));
    const options = { cwd: input.repositoryRoot, timeout: 10_000 };
    await execFileAsync("/usr/bin/git", ["add", "plugins"], options);
    await execFileAsync("/usr/bin/git", ["-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "--no-gpg-sign", "--no-verify", "-m", "linked fixture"], options);
    const head = await execFileAsync("/usr/bin/git", ["rev-parse", "HEAD"], options);
    await assert.rejects(verifyInstalledPayload({ ...input, commit: head.stdout.trim() }), /unsupported entry/u);
  });
});
