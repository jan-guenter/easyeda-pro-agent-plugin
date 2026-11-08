/** Actual isolated Git histories; no canonical ref, index or config changes. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { promisify } from "node:util";
import { checkPublishableHistory, gitEnvironment } from "../../scripts/publishable-history.ts";
import { privateDesignName } from "../../scripts/repository-content-policy.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node returns a child; promisify consumes only its completion callback.
const execute = promisify(execFile);
async function fixture(context: TestContext): Promise<Readonly<{ repository: string; base: string; git: (args: readonly string[]) => Promise<string> }>> {
  const repository = await mkdtemp(join(tmpdir(), "publishable-history-"));
  context.after(async () => { await rm(repository, { recursive: true, force: true }); });
  const git = async (args: readonly string[]): Promise<string> => {
    const result = await execute("git", [...args], { cwd: repository, env: { ...gitEnvironment, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null" }, timeout: 10_000, maxBuffer: 1_048_576 }); return result.stdout.trim();
  };
  await git(["init", "--initial-branch=main"]);
  await git(["config", "user.name", "Isolated Fixture"]); await git(["config", "user.email", "fixture@example.invalid"]);
  await writeFile(join(repository, "README.md"), "Public baseline\n"); await git(["add", "README.md"]); await git(["commit", "-m", "public baseline"]);
  return Object.freeze({ repository, base: await git(["rev-parse", "HEAD"]), git });
}
void test("clean outgoing history scans its actual commit, trees and binary-safe blobs once", async context => {
  const original = await fixture(context);
  await writeFile(join(original.repository, "public.txt"), "Public update\n");
  await writeFile(join(original.repository, "binary.dat"), Buffer.from([0, 255, 10, 1, 0, 2]));
  await original.git(["add", "public.txt", "binary.dat"]); await original.git(["commit", "-m", "public update"]);
  const head = await original.git(["rev-parse", "HEAD"]);
  const roster = await original.git(["rev-list", "--objects", "--no-object-names", `${original.base}..${head}`]);
  const result = await checkPublishableHistory(original.repository, original.base, head);
  assert.equal(result.ok, true); assert.deepEqual(result.findings, []); assert.equal(result.scannedObjects, roster.split("\n").length);
  assert.ok(result.scannedBytes > 0); assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.findings), true);
  const none = await checkPublishableHistory(original.repository, head, head); assert.equal(none.scannedObjects, 0); assert.equal(none.scannedBytes, 0);
});
void test("history HEAD and object scans ignore inherited Git repository overrides", async context => {
  const original = await fixture(context), unrelated = await fixture(context);
  await writeFile(join(original.repository, "change.txt"), "Selected history\n");
  await original.git(["add", "change.txt"]); await original.git(["commit", "-m", "selected update"]);
  const head = await original.git(["rev-parse", "HEAD"]), module = new URL("../../scripts/publishable-history.ts", import.meta.url);
  const source = `import {checkPublishableHistory,gitEnvironment} from ${JSON.stringify(module.href)};import {execFileSync} from 'node:child_process';const [repository,base,head]=process.argv.slice(1);const actual=execFileSync('git',['rev-parse','--verify','HEAD'],{cwd:repository,env:gitEnvironment,encoding:'utf8'}).trim();if(actual!==head)throw Error('wrong HEAD');const result=await checkPublishableHistory(repository,base,head);process.stdout.write(JSON.stringify(result));`;
  const foreign = join(unrelated.repository, ".git");
  const env = { ...process.env, GIT_DIR: foreign, GIT_WORK_TREE: unrelated.repository, GIT_INDEX_FILE: join(foreign, "index"), GIT_OBJECT_DIRECTORY: join(foreign, "objects"), GIT_COMMON_DIR: foreign, GIT_ALTERNATE_OBJECT_DIRECTORIES: join(foreign, "objects"), GIT_NAMESPACE: "foreign", GIT_PREFIX: "foreign/" };
  const output = await execute(process.execPath, ["--input-type=module", "-e", source, original.repository, original.base, head], { env, timeout: 10_000, maxBuffer: 1_048_576 });
  const expected = await checkPublishableHistory(original.repository, original.base, head);
  assert.equal(output.stderr, ""); assert.equal(output.stdout, JSON.stringify(expected)); assert.equal(expected.ok, true); assert.ok(expected.scannedObjects > 0);
  await assert.rejects(execute(process.execPath, [new URL("../../scripts/check-publishable-history.ts", import.meta.url).pathname], { env, timeout: 10_000 }), error => error !== null && typeof error === "object" && "stderr" in error && error.stderr === "PUBLISHABLE_HISTORY_USAGE\n");
});
void test("private text and secret added then deleted remain rejected without disclosing matched content", async context => {
  const original = await fixture(context);
  const secret = ["ghp_", "x".repeat(40)].join("");
  const filename = `${privateDesignName}.txt`;
  await writeFile(join(original.repository, filename), `${privateDesignName}\n${secret}\n`);
  await original.git(["add", filename]); await original.git(["commit", "-m", "temporary fixture content"]);
  const introduced = await original.git(["rev-parse", "HEAD"]);
  const blob = await original.git(["rev-parse", `${introduced}:${filename}`]);
  await original.git(["rm", filename]); await original.git(["commit", "-m", "delete fixture content"]);
  const head = await original.git(["rev-parse", "HEAD"]);
  await assert.rejects(readFile(join(original.repository, filename)), { code: "ENOENT" });
  assert.equal(await original.git(["diff", "--exit-code", original.base, head]), "");
  const result = await checkPublishableHistory(original.repository, original.base, head);
  assert.equal(result.ok, false);
  const retained = result.findings.find(value => value.objectId === blob); assert.ok(retained !== undefined);
  assert.ok(retained.rules.includes("github-classic")); assert.ok(retained.rules.includes("private-design-name"));
  for (const finding of result.findings) { assert.deepEqual(Object.keys(finding), ["objectId", "rules"]); assert.ok(Object.isFrozen(finding)); }
  const module = new URL("../../scripts/publishable-history.ts", import.meta.url);
  const source = `import {checkPublishableHistory} from ${JSON.stringify(module.href)};const [repository,base,head]=process.argv.slice(1);const result=await checkPublishableHistory(repository,base,head);process.stdout.write(JSON.stringify(result));`;
  const output = await execute(process.execPath, ["--input-type=module", "-e", source, original.repository, original.base, head], { timeout: 10_000, maxBuffer: 1_048_576 });
  assert.equal(output.stderr, ""); assert.ok(!output.stdout.includes(secret)); assert.ok(!output.stdout.includes(privateDesignName)); assert.ok(!output.stdout.includes(filename));
  assert.equal(output.stdout, JSON.stringify(result));
});
