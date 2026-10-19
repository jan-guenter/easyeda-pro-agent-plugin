import assert from "node:assert/strict";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { describe, test } from "node:test";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

import {
  createPrivateTemporaryDirectory,
  removeEmptyPrivateTemporaryDirectory,
} from "../../scripts/private-temporary-directory.ts";

void describe("private temporary-directory cleanup", () => {
  void test("removes only the exact empty directory", async () => {
    const parent = await createTestTemporaryDirectory("easyeda-private-temp-test-");
    try {
      const directory = await createPrivateTemporaryDirectory(
        join(parent, "private-"),
        "Test private directory",
      );
      await mkdir(join(directory.path, "operations"), { mode: 0o700 });
      await removeEmptyPrivateTemporaryDirectory(
        directory,
        "Test private directory",
        ["operations"],
      );
      await assert.rejects(stat(directory.path), { code: "ENOENT" });
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("refuses a pathname replacement without deleting its contents", async () => {
    const parent = await createTestTemporaryDirectory("easyeda-private-temp-swap-");
    const directory = await createPrivateTemporaryDirectory(
      join(parent, "private-"),
      "Test private directory",
    );
    const displaced = `${directory.path}.displaced`;
    const marker = join(directory.path, "must-survive.txt");
    try {
      await rename(directory.path, displaced);
      await mkdir(directory.path, { mode: 0o700 });
      await writeFile(marker, "replacement survives\n", "utf8");
      await assert.rejects(
        removeEmptyPrivateTemporaryDirectory(
          directory,
          "Test private directory",
        ),
        /pathname changed before cleanup/u,
      );
      assert.equal(await readFile(marker, "utf8"), "replacement survives\n");
      assert.deepEqual(await readdir(displaced), []);
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  for (const child of [false, true]) {
    void test(`retains unknown contents ${child ? "inside an expected child" : "at the root"}`, async () => {
      const parent = await createTestTemporaryDirectory("easyeda-private-temp-retain-");
      const directory = await createPrivateTemporaryDirectory(join(parent, "private-"), "Test private directory");
      const contentDirectory = child ? join(directory.path, "operations") : directory.path;
      if (child) { await mkdir(contentDirectory, { mode: 0o700 }); }
      const marker = join(contentDirectory, "failure-evidence.json");
      await writeFile(marker, "synthetic retained evidence\n", { flag: "wx", mode: 0o600 });
      try {
        await assert.rejects(removeEmptyPrivateTemporaryDirectory(directory, "Test private directory", ["operations"]), /not empty; refusing recursive cleanup/u);
        assert.equal(await readFile(marker, "utf8"), "synthetic retained evidence\n");
      } finally {
        // Only this test's newly created, known synthetic files are removed.
        await rm(parent, { recursive: true, force: true });
      }
    });
  }
});
