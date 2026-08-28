import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmod,
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import { canonicalJson, isRecord, sha256Text } from "../src/core.ts";
import type { UnknownRecord } from "../src/core.ts";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import { openControlRootCapability } from "../src/control-root.ts";

let testDir = "";

function parseJsonRecord(text: string): UnknownRecord {
  const parsed: unknown = JSON.parse(text);
  assert.ok(isRecord(parsed), "Expected fixture JSON to contain an object.");
  return parsed;
}

before(async () => {
  testDir = await mkdtemp(join(tmpdir(), "easyeda-control-checkpoint-"));
});

after(async () => {
  if (testDir) {
    await rm(testDir, { recursive: true, force: true });
  }
});

function createFixtureDatabase(path: string): void {
  execFileSync("sqlite3", [
    path,
    "PRAGMA journal_mode=DELETE; CREATE TABLE evidence(id INTEGER PRIMARY KEY, value TEXT NOT NULL); INSERT INTO evidence(value) VALUES ('baseline');",
  ]);
}

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, name);
  } else {
    process.env[name] = value;
  }
}

void describe("SQLite checkpoint creation and verification", () => {
  void test("creates a logically exact backup with a canonical self-hashed receipt", async () => {
    const source = join(testDir, "fixture.eprj2");
    const outputDir = join(testDir, "checkpoints");
    createFixtureDatabase(source);

    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "pre-mutation",
    });
    const receipt = parseJsonRecord(
      await readFile(checkpoint.receiptPath, "utf8"),
    );
    const { receiptSha256, ...receiptCore } = receipt;
    const quickCheck = receipt["quickCheck"];
    assert.ok(isRecord(quickCheck));

    assert.equal(receipt["schema"], "easyeda-pro-control.checkpoint.v1");
    assert.notEqual(receipt["source"], receipt["checkpoint"]);
    assert.equal(receipt["sourceDumpSha256"], receipt["checkpointDumpSha256"]);
    assert.equal(quickCheck["sourceBefore"], "ok");
    assert.equal(quickCheck["sourceAfter"], "ok");
    assert.equal(quickCheck["checkpoint"], "ok");
    assert.equal(receiptSha256, sha256Text(canonicalJson(receiptCore)));

    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, true);
  });

  void test("keeps a replacement temporary directory untouched during verification cleanup", async () => {
    const source = join(testDir, "temporary-cleanup-source.eprj2");
    const outputDir = join(testDir, "temporary-cleanup-checkpoints");
    const temporaryParent = await mkdtemp(
      join("/tmp", "easyeda-checkpoint-temporary-swap-"),
    );
    const temporaryRoot = join(temporaryParent, "temporary");
    const displacedRoot = join(temporaryParent, "temporary-displaced");
    const replacementMarker = join(temporaryRoot, "must-survive.txt");
    const configuredTemporaryDirectory = process.env["TMPDIR"];
    createFixtureDatabase(source);
    await mkdir(temporaryRoot, { mode: 0o700 });
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "temporary-cleanup",
    });
    process.env["TMPDIR"] = temporaryRoot;
    try {
      const verified = await verifyCheckpoint(
        checkpoint.receiptPath,
        undefined,
        async () => {
          await rename(temporaryRoot, displacedRoot);
          await mkdir(temporaryRoot, { mode: 0o700 });
          await writeFile(replacementMarker, "replacement survives\n", "utf8");
        },
      );
      assert.equal(verified.ok, true);
      assert.equal(
        await readFile(replacementMarker, "utf8"),
        "replacement survives\n",
      );
      assert.deepEqual(await readdir(displacedRoot), []);
    } finally {
      restoreEnvironment("TMPDIR", configuredTemporaryDirectory);
      await rm(temporaryParent, { recursive: true, force: true });
    }
  });

  void test("keeps checkpoint bytes private in a readable output directory", async () => {
    const source = join(testDir, "private-mode-source.eprj2");
    const outputDir = join(testDir, "readable-checkpoints");
    createFixtureDatabase(source);
    await mkdir(outputDir, { mode: 0o755 });
    await chmod(outputDir, 0o755);
    const originalUmask = process.umask(0);
    let checkpoint;
    try {
      checkpoint = await createCheckpoint({
        source,
        outputDir,
        label: "private-mode",
      });
    } finally {
      process.umask(originalUmask);
    }
    const checkpointInformation = await stat(checkpoint.checkpoint);
    const receiptInformation = await stat(checkpoint.receiptPath);
    assert.equal(checkpointInformation.mode % 512, 0o600);
    assert.equal(receiptInformation.mode % 512, 0o600);
  });

  void test("detects source mutation after checkpoint creation", async () => {
    const source = join(testDir, "mutable.eprj2");
    const outputDir = join(testDir, "mutable-checkpoints");
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "before-edit",
    });

    execFileSync("sqlite3", [
      source,
      "UPDATE evidence SET value='changed' WHERE id=1;",
    ]);
    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, false);
    assert.notEqual(verified.sourceDumpSha256, checkpoint.sourceDumpSha256);
    assert.equal(
      verified.checkpointDumpSha256,
      checkpoint.checkpointDumpSha256,
    );
  });

  void test("distinguishes a physical-only rewrite from a logical SQLite change", async () => {
    const source = join(testDir, "physical-rewrite.eprj2");
    const outputDir = join(testDir, "physical-rewrite-checkpoints");
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "before-vacuum",
    });

    execFileSync("sqlite3", [source, "VACUUM;"]);
    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, false);
    assert.equal(verified.checkpointMatchesReceipt, true);
    assert.equal(verified.sourceMatchesReceipt, false);
    assert.equal(verified.sourceChanged, true);
    assert.equal(verified.sourceEqualsCheckpoint, true);
    assert.notEqual(verified.sourceSha256, checkpoint.sourceSha256);
    assert.equal(verified.sourceDumpSha256, checkpoint.sourceDumpSha256);
  });

  void test("detects a tampered receipt even when database artifacts still match", async () => {
    const source = join(testDir, "receipt-source.eprj2");
    const outputDir = join(testDir, "receipt-checkpoints");
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "receipt-check",
    });
    const receipt = parseJsonRecord(
      await readFile(checkpoint.receiptPath, "utf8"),
    );
    receipt["createdAt"] = "2000-01-01T00:00:00.000Z";
    await writeFile(
      checkpoint.receiptPath,
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );

    await assert.rejects(
      verifyCheckpoint(checkpoint.receiptPath),
      /Checkpoint receipt hash is invalid/u,
    );
  });

  void test("rejects unsafe labels, empty source files, and unexpected receipt schemas", async () => {
    const source = join(testDir, "validation.eprj2");
    createFixtureDatabase(source);
    await assert.rejects(
      createCheckpoint({ source, outputDir: testDir, label: "../escape" }),
      /filename-safe/u,
    );

    const empty = join(testDir, "empty.eprj2");
    await writeFile(empty, "");
    await assert.rejects(
      createCheckpoint({ source: empty, outputDir: testDir, label: "empty" }),
      /non-empty file/u,
    );

    const invalidReceipt = join(testDir, "invalid-receipt.json");
    await writeFile(invalidReceipt, '{"schema":"unexpected"}\n', "utf8");
    await assert.rejects(
      verifyCheckpoint(invalidReceipt),
      /Unexpected checkpoint receipt schema/u,
    );
  });
});

void describe("adversarial checkpoint path and identity handling", () => {
  void test("treats URI metacharacters, quotes, whitespace, Unicode, and newlines literally", async () => {
    const source = join(testDir, "literal ?#%' ü\nsource.eprj2");
    const outputDir = join(testDir, "output ?#%' ü\nfolder");
    createFixtureDatabase(source);

    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "literal-path",
    });
    assert.equal(
      execFileSync("sqlite3", [
        checkpoint.checkpoint,
        "SELECT value FROM evidence WHERE id=1;",
      ], { encoding: "utf8" }).trim(),
      "baseline",
    );
    const verification = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verification.ok, true);
  });

  void test("ignores PATH when selecting the SQLite dump executable", async () => {
    const source = join(testDir, "path-trust-source.eprj2");
    const outputDir = join(testDir, "path-trust-checkpoints");
    const fakeBin = join(testDir, "path-trust-bin");
    const fakeSqlite = join(fakeBin, "sqlite3");
    createFixtureDatabase(source);
    await mkdir(fakeBin, { recursive: true });
    await writeFile(fakeSqlite, "#!/bin/sh\nexit 97\n", "utf8");
    await chmod(fakeSqlite, 0o700);

    const originalPath = process.env["PATH"];
    process.env["PATH"] = `${fakeBin}:${originalPath ?? ""}`;
    try {
      const checkpoint = await createCheckpoint({
        source,
        outputDir,
        label: "fixed-sqlite",
      });
      const verification = await verifyCheckpoint(checkpoint.receiptPath);
      assert.equal(verification.ok, true);
    } finally {
      restoreEnvironment("PATH", originalPath);
    }
  });

  void test("does not load a hostile user SQLite startup file", async () => {
    const source = join(testDir, "sqliterc-source.eprj2");
    const outputDir = join(testDir, "sqliterc-checkpoints");
    const hostileHome = join(testDir, "hostile-sqlite-home");
    const marker = join(testDir, "sqliterc-command-executed");
    createFixtureDatabase(source);
    await mkdir(hostileHome, { recursive: true });
    await writeFile(
      join(hostileHome, ".sqliterc"),
      `.shell /usr/bin/touch ${marker}\n.output ${marker}\n`,
      "utf8",
    );

    const originalHome = process.env["HOME"];
    process.env["HOME"] = hostileHome;
    try {
      const checkpoint = await createCheckpoint({
        source,
        outputDir,
        label: "no-user-init",
      });
      const verification = await verifyCheckpoint(checkpoint.receiptPath);
      assert.equal(verification.ok, true);
      await assert.rejects(
        readFile(marker, "utf8"),
        (error: unknown) => isRecord(error) && error["code"] === "ENOENT",
      );
    } finally {
      restoreEnvironment("HOME", originalHome);
    }
  });

  void test("binds verification to the original checkpoint inode", async () => {
    const source = join(testDir, "inode-source.eprj2");
    const outputDir = join(testDir, "inode-checkpoints");
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "inode",
    });
    const originalBytes = await readFile(checkpoint.checkpoint);
    await unlink(checkpoint.checkpoint);
    await writeFile(checkpoint.checkpoint, originalBytes);

    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, false);
    assert.equal(verified.checkpointMatchesReceipt, false);
    assert.equal(verified.sourceEqualsCheckpoint, true);
    assert.equal(verified.checkpointSha256, checkpoint.checkpointSha256);
  });

  void test("rejects a valid receipt copied byte-for-byte to another path", async () => {
    const source = join(testDir, "receipt-path-source.eprj2");
    const outputDir = join(testDir, "receipt-path-checkpoints");
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "receipt-path",
    });
    const copiedReceipt = join(outputDir, "copied.checkpoint.json");
    await writeFile(copiedReceipt, await readFile(checkpoint.receiptPath));

    await assert.rejects(
      verifyCheckpoint(copiedReceipt),
      /receipt path does not match the exact receipt path opened/u,
    );
  });

  void test("rejects a self-rehashed receipt missing mandatory inode identities", async () => {
    const source = join(testDir, "missing-identity-source.eprj2");
    const outputDir = join(testDir, "missing-identity-checkpoints");
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({
      source,
      outputDir,
      label: "missing-identity",
    });
    const checkpointBytes = await readFile(checkpoint.checkpoint);
    await unlink(checkpoint.checkpoint);
    await writeFile(checkpoint.checkpoint, checkpointBytes);
    const receipt = parseJsonRecord(
      await readFile(checkpoint.receiptPath, "utf8"),
    );
    delete receipt["sourceIdentity"];
    delete receipt["checkpointIdentity"];
    delete receipt["receiptSha256"];
    receipt["receiptSha256"] = sha256Text(canonicalJson(receipt));
    await writeFile(
      checkpoint.receiptPath,
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );

    await assert.rejects(
      verifyCheckpoint(checkpoint.receiptPath),
      /sourceIdentity is invalid/u,
    );
  });

  void test("rejects symlinked source and output parents without writing through them", async () => {
    const source = join(testDir, "symlink-source-real.eprj2");
    const sourceLink = join(testDir, "symlink-source.eprj2");
    const outside = join(testDir, "symlink-output-target");
    const outputLink = join(testDir, "symlink-output");
    createFixtureDatabase(source);
    await symlink(source, sourceLink, "file");
    await mkdir(outside);
    await symlink(outside, outputLink, "dir");

    await assert.rejects(
      createCheckpoint({ source: sourceLink, outputDir: testDir, label: "source-link" }),
      /symbolic link|non-symlink/u,
    );
    await assert.rejects(
      createCheckpoint({ source, outputDir: outputLink, label: "output-link" }),
      /symbolic link/u,
    );
    assert.deepEqual(await readdir(outside), []);
  });

  void test("enforces active-source and artifact-root policy before payload paths are opened", async () => {
    const source = join(testDir, "policy-source.eprj2");
    const otherSource = join(testDir, "policy-other.eprj2");
    const artifactRoot = join(testDir, "policy-checkpoints");
    createFixtureDatabase(source);
    createFixtureDatabase(otherSource);
    const policy = { expectedSource: source, artifactRoots: [artifactRoot] };
    const checkpoint = await createCheckpoint(
      { source, outputDir: artifactRoot, label: "policy" },
      policy,
    );
    const verification = await verifyCheckpoint(checkpoint.receiptPath, policy);
    assert.equal(verification.ok, true);

    await assert.rejects(
      createCheckpoint(
        { source: otherSource, outputDir: artifactRoot, label: "wrong-source" },
        policy,
      ),
      /authorized active project/u,
    );
    await assert.rejects(
      createCheckpoint(
        { source, outputDir: join(testDir, "outside-policy"), label: "outside" },
        policy,
      ),
      /outside the authorized checkpoint roots/u,
    );
    await assert.rejects(
      verifyCheckpoint(join(testDir, "outside-receipt.json"), policy),
      /outside the authorized checkpoint roots/u,
    );

    const receipt = parseJsonRecord(await readFile(checkpoint.receiptPath, "utf8"));
    receipt["checkpoint"] = join(testDir, "outside-payload.eprj2");
    delete receipt["receiptSha256"];
    receipt["receiptSha256"] = sha256Text(canonicalJson(receipt));
    await writeFile(
      checkpoint.receiptPath,
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );
    await assert.rejects(
      verifyCheckpoint(checkpoint.receiptPath, policy),
      /outside the authorized checkpoint roots/u,
    );
  });

  void test("binds managed checkpoint creation and verification to the retained control-root inode", async () => {
    const parent = await mkdtemp(
      join("/tmp", "easyeda-checkpoint-root-capability-"),
    );
    const source = join(parent, "source.eprj2");
    const root = join(parent, "control");
    const movedRoot = join(parent, "control-moved");
    const artifactRoot = join(root, "checkpoints");
    createFixtureDatabase(source);
    await mkdir(root, { mode: 0o700 });
    const controlRoot = await openControlRootCapability(root);
    const policy = {
      expectedSource: source,
      artifactRoots: [artifactRoot],
      controlRoot,
    };
    try {
      const checkpoint = await createCheckpoint(
        { source, outputDir: artifactRoot, label: "before-root-swap" },
        policy,
      );
      await rename(root, movedRoot);
      await mkdir(root, { mode: 0o700 });

      await assert.rejects(
        verifyCheckpoint(checkpoint.receiptPath, policy),
        /control-root pathname changed/u,
      );
      await assert.rejects(
        createCheckpoint(
          { source, outputDir: artifactRoot, label: "after-root-swap" },
          policy,
        ),
        /control-root pathname changed/u,
      );
      assert.deepEqual(await readdir(root), []);
      const originalRootEntries = await readdir(
        join(movedRoot, "checkpoints"),
      );
      assert.equal(
        originalRootEntries.some((name) =>
          name.includes("after-root-swap"),
        ),
        false,
      );
    } finally {
      await controlRoot.close();
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("rejects an intermediate checkpoint-parent symlink installed before final path proof", async () => {
    const parent = await mkdtemp(
      join("/tmp", "easyeda-checkpoint-parent-swap-"),
    );
    const source = join(parent, "source.eprj2");
    const root = join(parent, "control");
    const artifactParent = join(root, "managed");
    const movedArtifactParent = join(root, "managed-moved");
    const artifactRoot = join(artifactParent, "checkpoints");
    createFixtureDatabase(source);
    await mkdir(artifactRoot, { recursive: true, mode: 0o700 });
    await chmod(root, 0o700);
    const controlRoot = await openControlRootCapability(root);
    const policy = {
      expectedSource: source,
      artifactRoots: [artifactRoot],
      controlRoot,
    };
    try {
      await assert.rejects(
        createCheckpoint(
          { source, outputDir: artifactRoot, label: "parent-swap" },
          policy,
          async () => {
            await rename(artifactParent, movedArtifactParent);
            await symlink(movedArtifactParent, artifactParent, "dir");
          },
        ),
        /not a real directory/u,
      );
      assert.deepEqual(
        await readdir(join(movedArtifactParent, "checkpoints")),
        [],
      );
    } finally {
      await controlRoot.close();
      await unlink(artifactParent).catch(() => null);
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("rejects hard-linked managed checkpoint and receipt files", async () => {
    const parent = await mkdtemp(
      join("/tmp", "easyeda-checkpoint-hard-link-"),
    );
    const source = join(parent, "source.eprj2");
    const root = join(parent, "control");
    const artifactRoot = join(root, "checkpoints");
    createFixtureDatabase(source);
    await mkdir(root, { mode: 0o700 });
    const controlRoot = await openControlRootCapability(root);
    const policy = {
      expectedSource: source,
      artifactRoots: [artifactRoot],
      controlRoot,
    };
    try {
      const checkpoint = await createCheckpoint(
        { source, outputDir: artifactRoot, label: "before-hard-link" },
        policy,
      );
      const checkpointAlias = join(root, "checkpoint-alias.eprj2");
      await link(checkpoint.checkpoint, checkpointAlias);
      await assert.rejects(
        verifyCheckpoint(checkpoint.receiptPath, policy),
        /single-link managed file/u,
      );
      await unlink(checkpointAlias);

      const receiptAlias = join(root, "receipt-alias.json");
      await link(checkpoint.receiptPath, receiptAlias);
      await assert.rejects(
        verifyCheckpoint(checkpoint.receiptPath, policy),
        /single-link managed file/u,
      );
      await unlink(receiptAlias);
      const verified = await verifyCheckpoint(checkpoint.receiptPath, policy);
      assert.equal(verified.ok, true);
    } finally {
      await controlRoot.close();
      await rm(parent, { recursive: true, force: true });
    }
  });
});

void describe("checkpoint failure cleanup", () => {
  void test("removes every unpublished artifact when canonical dump output exceeds its bound", async () => {
    const source = join(testDir, "dump-limit-source.eprj2");
    const outputDir = join(testDir, "dump-limit-checkpoints");
    createFixtureDatabase(source);
    const originalLimit = process.env["EASYEDA_CHECKPOINT_STDOUT_MAX_BYTES"];
    process.env["EASYEDA_CHECKPOINT_STDOUT_MAX_BYTES"] = "1";
    try {
      await assert.rejects(
        createCheckpoint({ source, outputDir, label: "dump-limit" }),
        /stdout exceeded 1 bytes/u,
      );
    } finally {
      restoreEnvironment("EASYEDA_CHECKPOINT_STDOUT_MAX_BYTES", originalLimit);
    }
    assert.deepEqual(await readdir(outputDir), []);
  });
});
