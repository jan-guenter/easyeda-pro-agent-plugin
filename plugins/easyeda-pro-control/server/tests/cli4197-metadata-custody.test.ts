/** Pure filesystem custody checks. No executable, Bwrap or vendor is run. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createCli4197Artifacts, openCli4197Runtime, parseCli4197Inventory, requireCli4197Directory } from "../../scripts/cli4197-metadata/custody.ts";
import { CLI4197_METADATA_PROFILE as PROFILE } from "../../scripts/cli4197-metadata/profile.ts";
import { openReviewedSandboxDescriptorWithoutExecution } from "../src/upstream-trust.ts";
import { DESCRIPTOR_SANITIZER_SCHEMA, DESCRIPTOR_SANITIZER_SHA256 } from "../src/descriptor-sanitizer-identity.ts";

void test("fixed inventory refuses altered bytes before runtime lookup", { skip: process.platform !== "linux" }, async () => {
  const parent = await mkdtemp(join(homedir(), "cli4197-metadata-test-")); const manifest = join(parent, "inventory.json");
  try {
    const bytes = Buffer.alloc(PROFILE.inventoryBytes); await writeFile(manifest, bytes, { flag: "wx", mode: 0o600 });
    assert.throws(() => parseCli4197Inventory(bytes)); await assert.rejects(openCli4197Runtime(join(parent, "unopened-runtime"), manifest));
    const retained = await readFile(manifest); assert.equal(retained.length, PROFILE.inventoryBytes);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

void test("private artifacts are exclusive, names are fixed and every canary is a unique empty held file", { skip: process.platform !== "linux" }, async () => {
  const parent = await mkdtemp(join(homedir(), "cli4197-artifacts-test-"));
  try {
    const artifacts = await createCli4197Artifacts(parent);
    try {
      const identities = new Set<string>();
      for (const handle of artifacts.canaries) { const info = await handle.stat({ bigint: true }); assert.equal(info.size, 0n); identities.add(`${info.dev}:${info.ino}`); }
      assert.equal(identities.size, 4); await artifacts.write("launch-intent.json", Buffer.from("first"));
      await assert.rejects(artifacts.write("launch-intent.json", Buffer.from("replacement"))); await assert.rejects(artifacts.write("../escape", Buffer.from("private")));
      const directoryInfo = await stat(artifacts.directory), fileInfo = await stat(join(artifacts.directory, "launch-intent.json")), intent = await readFile(join(artifacts.directory, "launch-intent.json"));
      assert.equal(intent.toString(), "first"); assert.equal(directoryInfo.mode % 4096, 0o700); assert.equal(fileInfo.mode % 4096, 0o600);
      const alias = join(parent, "alias"); await symlink(artifacts.directory, alias); await assert.rejects(requireCli4197Directory(alias, true));
    } finally { await artifacts.dispose(); }
    assert.ok(artifacts.canaries.every(handle => handle.fd === -1));
  } finally { await rm(parent, { recursive: true, force: true }); }
});

void test("static reviewed Bwrap descriptor opening never executes version/help and rechecks bytes/mode/links", { skip: process.platform !== "linux" }, async () => {
  const parent = await mkdtemp(join(homedir(), "cli4197-opener-test-")); const marker = join(parent, "executed"), path = join(parent, "must-not-execute");
  const old = process.env["EASYEDA_BWRAP_COMMAND"];
  try {
    const bytes = Buffer.from(`#!/bin/sh\nprintf executed > '${marker}'\nexit 91\n`); await writeFile(path, bytes, { flag: "wx", mode: 0o755 }); await chmod(path, 0o755);
    process.env["EASYEDA_BWRAP_COMMAND"] = path;
    const expected = { command: path, commandSha256: createHash("sha256").update(bytes).digest("hex"), version: "0.13.1",
      descriptorSanitizer: { schema: DESCRIPTOR_SANITIZER_SCHEMA, sha256: DESCRIPTOR_SANITIZER_SHA256 } };
    let mismatch: Promise<unknown> | undefined;
    assert.doesNotThrow(() => { mismatch = openReviewedSandboxDescriptorWithoutExecution({ ...expected, version: "unreviewed" }); });
    assert.ok(mismatch instanceof Promise); await assert.rejects(mismatch, /identity differs from review/u);
    const executable = await openReviewedSandboxDescriptorWithoutExecution(expected);
    try { await executable.assertCurrent(); await writeFile(path, Buffer.from("changed")); await assert.rejects(executable.assertCurrent()); }
    finally { await executable.dispose(); }
    await writeFile(path, bytes); await chmod(path, 0o644); await assert.rejects(openReviewedSandboxDescriptorWithoutExecution(expected));
    await chmod(path, 0o755); await link(path, join(parent, "second-link")); await assert.rejects(openReviewedSandboxDescriptorWithoutExecution(expected));
    await assert.rejects(stat(marker), { code: "ENOENT" });
  } finally {
    if (old === undefined) { delete process.env["EASYEDA_BWRAP_COMMAND"]; } else { process.env["EASYEDA_BWRAP_COMMAND"] = old; }
    await rm(parent, { recursive: true, force: true });
  }
});
