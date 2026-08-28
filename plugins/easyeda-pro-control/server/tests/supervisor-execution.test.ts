import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  readlink,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { describe, test } from "node:test";

import { stageReviewedSupervisorExecution } from "../src/supervisor-execution.ts";

interface SupervisorFingerprint {
  readonly bytes: number;
  readonly relativePath: "upstream-supervisor.mjs";
  readonly sha256: string;
}

function fingerprint(bytes: Buffer): SupervisorFingerprint {
  return {
    bytes: bytes.length,
    relativePath: "upstream-supervisor.mjs" as const,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

const reviewedFixture = Buffer.from(`
  export const identity = "reviewed supervisor";
`, "utf8");

const replacementFixture = Buffer.from(`
  export const identity = "replacement supervisor";
`, "utf8");

void describe("reviewed supervisor execution", () => {
  void test(
    "executes captured reviewed bytes when the source path is replaced after capture",
    { skip: process.platform !== "linux" },
    async () => {
      const root = await mkdtemp("/tmp/supervisor-source-race-");
      const sourcePath = join(root, "upstream-supervisor.mjs");
      const oldSourcePath = join(root, "captured-upstream-supervisor.mjs");
      const privatePath = join(root, "private");
      await mkdir(privatePath, { mode: 0o700 });
      const privateDirectory = await open(
        privatePath,
        fsConstants.O_RDONLY +
          fsConstants.O_DIRECTORY +
          fsConstants.O_NOFOLLOW,
      );
      await writeFile(sourcePath, reviewedFixture, { mode: 0o400 });
      let staged;
      try {
        staged = await stageReviewedSupervisorExecution(
          privateDirectory,
          {
            afterSourceCapture: async () => {
              await rename(sourcePath, oldSourcePath);
              await writeFile(sourcePath, replacementFixture, { mode: 0o400 });
            },
            expectedFingerprint: fingerprint(reviewedFixture),
            sourcePath,
          },
        );
        await staged.assertCurrent();
        assert.deepEqual(await readFile(staged.path), reviewedFixture);
      } finally {
        await staged?.dispose();
        await privateDirectory.close();
        await rm(root, { force: true, recursive: true });
      }
    },
  );

  void test(
    "keeps only an unlinked descriptor for the staged supervisor",
    { skip: process.platform !== "linux" },
    async () => {
      const root = await mkdtemp("/tmp/supervisor-spawn-race-");
      const sourcePath = join(root, "upstream-supervisor.mjs");
      const privatePath = join(root, "private");
      await mkdir(privatePath, { mode: 0o700 });
      const privateDirectory = await open(
        privatePath,
        fsConstants.O_RDONLY +
          fsConstants.O_DIRECTORY +
          fsConstants.O_NOFOLLOW,
      );
      await writeFile(sourcePath, reviewedFixture, { mode: 0o400 });
      const staged = await stageReviewedSupervisorExecution(
        privateDirectory,
        {
          expectedFingerprint: fingerprint(reviewedFixture),
          sourcePath,
        },
      );
      try {
        await staged.assertCurrent();
        assert.match(
          await readlink(`/proc/self/fd/${String(staged.descriptor)}`),
          / \(deleted\)$/u,
        );
        assert.deepEqual(await readFile(staged.path), reviewedFixture);
      } finally {
        await staged.dispose();
        await privateDirectory.close();
        await rm(root, { force: true, recursive: true });
      }
    },
  );

  void test(
    "stages through the retained private-directory descriptor after a path swap",
    { skip: process.platform !== "linux" },
    async () => {
      const root = await mkdtemp("/tmp/supervisor-directory-race-");
      const sourcePath = join(root, "upstream-supervisor.mjs");
      const privatePath = join(root, "private");
      const movedPrivatePath = join(root, "private-reviewed");
      await mkdir(privatePath, { mode: 0o700 });
      const privateDirectory = await open(
        privatePath,
        fsConstants.O_RDONLY +
          fsConstants.O_DIRECTORY +
          fsConstants.O_NOFOLLOW,
      );
      await writeFile(sourcePath, reviewedFixture, { mode: 0o400 });
      let staged;
      try {
        await rename(privatePath, movedPrivatePath);
        await mkdir(privatePath, { mode: 0o700 });
        staged = await stageReviewedSupervisorExecution(privateDirectory, {
          expectedFingerprint: fingerprint(reviewedFixture),
          sourcePath,
        });
        assert.deepEqual(await readFile(staged.path), reviewedFixture);
        assert.deepEqual(await readdir(privatePath), []);
        assert.deepEqual(await readdir(movedPrivatePath), []);
      } finally {
        await staged?.dispose();
        await privateDirectory.close();
        await rm(root, { force: true, recursive: true });
      }
    },
  );
});
