import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, lstat, mkdtemp, readFile, readdir, rename, symlink, truncate, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { mintSyntheticClosedSessionProof } from "./helpers/windows-closed-session-fixture.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "../src/closed-file-copy.ts";

async function fixture(): Promise<Readonly<{
  source: string; expectedSourceSha256: string; artifactDirectory: string; directory: string;
}>> {
  const isolated = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.match(isolated ?? "", /easyeda-test-control-/u);
  assert.ok(isolated !== undefined);
  const directory = await mkdtemp(join(isolated, "raw-copy-synthetic-"));
  const source = join(directory, "source.eprj2");
  const database = new DatabaseSync(source, { defensive: false });
  try {
    database.exec("PRAGMA journal_mode=DELETE; CREATE TABLE payload(value BLOB); INSERT INTO payload(rowid,value) VALUES(55,zeroblob(3145728)); PRAGMA user_version=37; PRAGMA schema_version=99;");
  } finally { database.close(); }
  return { source, expectedSourceSha256: createHash("sha256").update(await readFile(source)).digest("hex"),
    artifactDirectory: join(directory, "artifacts"), directory };
}

void test("raw copy preserves exact database bytes, schema cookie and implicit rowid after branded closure", async () => {
  const input = await fixture();
  const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
  const original = await readFile(input.source);
  const receipt = await copyClosedProjectBytes({ ...input, closureProof: proof });
  assert.deepEqual(await readFile(receipt.artifact), original);
  assert.deepEqual(await readFile(input.source), original);
  assert.equal(receipt.sha256, input.expectedSourceSha256);
  assert.equal(receipt.sourceProjectGenerationBindingVerified, false);
  assert.equal(receipt.executionAuthorized, false);
  assert.equal(receipt.closureProofSha256, proof.proofSha256);
  assert.equal(Object.isFrozen(receipt), true);
  assert.equal(Object.isFrozen(receipt.sourceIdentity), true);
  assertIssuedClosedFileCopy(receipt);
  assert.throws(() => { assertIssuedClosedFileCopy(structuredClone(receipt)); }, /not issued/u);
  const database = new DatabaseSync(receipt.artifact, { readOnly: true, defensive: true });
  try {
    assert.equal(database.prepare("PRAGMA schema_version").get()?.["schema_version"], 99);
    assert.equal(database.prepare("PRAGMA user_version").get()?.["user_version"], 37);
    assert.equal(database.prepare("SELECT rowid FROM payload").get()?.["rowid"], 55);
  } finally { database.close(); }
  assert.equal(authority.requests.filter((request) => request["action"] === "normal-close").length, 1);
  assert.equal(authority.requests.filter((request) => request["action"] === "prove-terminated").length, 1);
  const information = await lstat(receipt.artifact);
  assert.equal(information.mode % 512, 0o600);
});

void test("forged or cloned closure proofs fail before any artifact authority", async () => {
  const input = await fixture();
  const { proof } = await mintSyntheticClosedSessionProof();
  for (const invalid of [true, {}, structuredClone(proof), { ...proof, jobEmpty: true }]) {
    await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: invalid }), /proof|issued|retained|brand/iu);
  }
  await assert.rejects(lstat(input.artifactDirectory), { code: "ENOENT" });
});

for (const name of ["helper lost", "helper source drift", "authority released"] as const) {
  void test(`closed copy refuses ${name} before file access`, async () => {
    const input = await fixture();
    const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
    if (name === "helper lost") { authority.behavior.helperLost = true; }
    if (name === "helper source drift") { authority.behavior.helperDrift = true; }
    if (name === "authority released") { await authority.supervisor.release(); }
    await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /helper|released|proof/iu);
    await assert.rejects(lstat(input.artifactDirectory), { code: "ENOENT" });
  });
}

void test("wrong source hash refuses before output creation", async () => {
  const input = await fixture();
  const { proof } = await mintSyntheticClosedSessionProof();
  await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof, expectedSourceSha256: "0".repeat(64) }), /source hash/u);
  await assert.rejects(lstat(input.artifactDirectory), { code: "ENOENT" });
});

for (const suffix of ["-wal", "-shm", "-journal"]) {
  void test(`source ${suffix} sidecar refuses without modifying either file`, async () => {
    const input = await fixture();
    const { proof } = await mintSyntheticClosedSessionProof();
    const sidecar = `${input.source}${suffix}`;
    await writeFile(sidecar, "synthetic retained sidecar", { flag: "wx", mode: 0o600 });
    await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /sidecar/u);
    assert.equal(await readFile(sidecar, "utf8"), "synthetic retained sidecar");
    assert.equal(createHash("sha256").update(await readFile(input.source)).digest("hex"), input.expectedSourceSha256);
    await assert.rejects(lstat(input.artifactDirectory), { code: "ENOENT" });
  });
}

void test("source leaf symlinks, ancestor symlinks and hardlinks are refused", async () => {
  const input = await fixture();
  const { proof } = await mintSyntheticClosedSessionProof();
  const symbolic = join(input.directory, "symbolic.eprj2");
  await symlink(input.source, symbolic);
  await assert.rejects(copyClosedProjectBytes({ ...input, source: symbolic, closureProof: proof }), /regular file/u);
  const ancestor = join(input.directory, "ancestor");
  await symlink(input.directory, ancestor);
  await assert.rejects(copyClosedProjectBytes({ ...input, source: join(ancestor, "source.eprj2"), closureProof: proof }), /parent|symlink/u);
  const hard = join(input.directory, "hard.eprj2");
  await link(input.source, hard);
  await assert.rejects(copyClosedProjectBytes({ ...input, source: hard, closureProof: proof }), /single-link/u);
  await assert.rejects(lstat(input.artifactDirectory), { code: "ENOENT" });
});

void test("repeat snapshots create distinct exclusive artifacts and preserve earlier evidence", async () => {
  const input = await fixture();
  const { proof } = await mintSyntheticClosedSessionProof();
  const first = await copyClosedProjectBytes({ ...input, closureProof: proof });
  const second = await copyClosedProjectBytes({ ...input, closureProof: proof });
  assert.notEqual(first.artifact, second.artifact);
  assert.equal(createHash("sha256").update(await readFile(first.artifact)).digest("hex"), first.sha256);
  const artifacts = await readdir(input.artifactDirectory);
  assert.equal(artifacts.length, 2);
});

for (const [name, size] of [["empty", 0], ["over budget", 268_435_457]] as const) {
  void test(`source ${name} size fails before hashing or artifact creation`, async () => {
    const input = await fixture();
    const { proof } = await mintSyntheticClosedSessionProof();
    await truncate(input.source, size);
    await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /bounded/u);
    await assert.rejects(lstat(input.artifactDirectory), { code: "ENOENT" });
  });
}

for (const name of ["source file replaced", "artifact file replaced", "source mode changed", "artifact mode changed", "late sidecar", "late helper loss", "later launch"] as const) {
  void test(`post-copy verification refuses ${name} and retains incomplete evidence`, async () => {
    const input = await fixture();
    const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
    let checks = 0;
    authority.behavior.onHelperCheck = async (): Promise<void> => {
      checks += 1;
      if (checks !== 3) { return; }
      if (name === "source file replaced") {
        const original = await readFile(input.source);
        await rename(input.source, join(input.directory, "original-retained.eprj2"));
        await writeFile(input.source, original, { flag: "wx", mode: 0o600 });
      }
      if (name === "artifact file replaced") {
        const artifacts = await readdir(input.artifactDirectory);
        const file = artifacts[0];
        assert.notEqual(file, undefined);
        const target = join(input.artifactDirectory, file ?? "unreachable");
        const original = await readFile(target);
        await rename(target, join(input.artifactDirectory, "original-retained.eprj2"));
        await writeFile(target, original, { flag: "wx", mode: 0o600 });
      }
      if (name === "source mode changed") { await chmod(input.source, 0o640); }
      if (name === "artifact mode changed") {
        const artifacts = await readdir(input.artifactDirectory);
        const file = artifacts[0];
        assert.notEqual(file, undefined);
        await chmod(join(input.artifactDirectory, file ?? "unreachable"), 0o640);
      }
      if (name === "late sidecar") { await writeFile(`${input.source}-wal`, "late synthetic sidecar", { flag: "wx", mode: 0o600 }); }
      if (name === "late helper loss") { authority.behavior.helperLost = true; }
      if (name === "later launch") { await authority.supervisor.launch({ confirmLaunch: true }); }
    };
    await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /retain incomplete private evidence/u);
    assert.equal(checks, 3);
    const artifacts = await readdir(input.artifactDirectory);
    assert.equal(artifacts.some((file) => file.startsWith("closed-copy-")), true);
  });
}

void test("a launch during final issuance validation prevents a copy receipt", async () => {
  const input = await fixture();
  const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
  let checks = 0;
  authority.behavior.onHelperCheck = async (): Promise<void> => {
    checks += 1;
    if (checks === 4) { await authority.supervisor.launch({ confirmLaunch: true }); }
  };
  await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /Final raw-copy authority failed/u);
  assert.equal(checks, 4);
});
