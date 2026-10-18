import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";

const preload = fileURLToPath(new URL("../../scripts/test-isolation.ts", import.meta.url));
const artifacts = new URL("../src/artifacts.ts", import.meta.url).href;
const core = new URL("../src/core.ts", import.meta.url).href;

interface IsolationFixture {
  readonly root: string;
  readonly temporaryDirectory: string;
  readonly ambientRoot: string;
  readonly sentinels: readonly { readonly path: string; readonly bytes: Buffer }[];
}

async function fixture(context: TestContext): Promise<IsolationFixture> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-isolation-regression-"));
  const identity = await lstat(root);
  context.after(async () => {
    const current = await lstat(root);
    assert.ok(current.isDirectory() && !current.isSymbolicLink());
    assert.equal(current.dev, identity.dev); assert.equal(current.ino, identity.ino);
    assert.equal(await realpath(root), root);
    await rm(root, { recursive: true, force: true });
  });
  const ambientRoot = join(root, "ambient"), temporaryDirectory = join(root, "temporary");
  await mkdir(temporaryDirectory); await mkdir(join(ambientRoot, "operations"), { recursive: true });
  await mkdir(join(ambientRoot, "upstream"));
  const sentinels = [{ path: join(ambientRoot, "operations", "retained.json"), bytes: Buffer.from("Synthetic ambient operation. Never change.\n") },
    { path: join(ambientRoot, "bridge-token"), bytes: Buffer.from("Synthetic ambient credential. Never change.\n") },
    { path: join(ambientRoot, "upstream", "retained-state"), bytes: Buffer.from("Synthetic ambient upstream state. Never change.\n") }];
  for (const sentinel of sentinels) { await writeFile(sentinel.path, sentinel.bytes, { flag: "wx", mode: 0o600 }); }
  return { root, temporaryDirectory, ambientRoot, sentinels };
}

function run(options: IsolationFixture, files: readonly string[]): ReturnType<typeof spawnSync> {
  const environment = { ...process.env, TMPDIR: options.temporaryDirectory, EASYEDA_CONTROL_DATA_DIR: options.ambientRoot,
    EASYEDA_BRIDGE_TOKEN_FILE: join(options.ambientRoot, "bridge-token"), EASYEDA_UPSTREAM_DATA_DIR: join(options.ambientRoot, "upstream") };
  // This is a new test runner, not another worker belonging to this test runner.
  Reflect.deleteProperty(environment, "NODE_TEST_CONTEXT");
  // oxlint-disable-next-line node/no-sync -- Observe complete child-worker termination without sharing this test process's module cache or environment.
  return spawnSync(process.execPath, ["--import", preload, "--test", "--test-concurrency=2", ...files], {
    cwd: options.root, env: environment,
    encoding: "utf8", timeout: 20_000, maxBuffer: 256 * 1024,
  });
}

async function writeWorker(options: IsolationFixture, name: string, fail: boolean): Promise<string> {
  const path = join(options.root, `${name}.test.mjs`);
  await writeFile(path, `
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
// Deliberately static: before()/dynamic-import ordering cannot protect this.
import { controlDataDirectory, controlRootCapability, createOperation, operationPath, readArtifact } from ${JSON.stringify(artifacts)};
import { OPERATION_SCHEMA, buildPlanHash } from ${JSON.stringify(core)};
const capturedRoot = controlDataDirectory();
await writeFile(${JSON.stringify(join(options.root, `${name}.observed.json`))}, JSON.stringify({
  capturedRoot, environmentRoot: process.env.EASYEDA_CONTROL_DATA_DIR, pid: process.pid,
  tokenPath: process.env.EASYEDA_BRIDGE_TOKEN_FILE, upstreamPath: process.env.EASYEDA_UPSTREAM_DATA_DIR,
  home: process.env.HOME, codexHome: process.env.CODEX_HOME,
}), { flag: "wx" });
test("static-import synthetic journal ${name}", async () => {
  assert.notEqual(capturedRoot, ${JSON.stringify(options.ambientRoot)});
  await assert.rejects(readArtifact(join(capturedRoot, "bridge-token")), /reserved/);
  await assert.rejects(readArtifact(join(capturedRoot, "upstream", "state")), /reserved/);
  const operationId = "easyeda-isolation-${name}", plan = { expectedFingerprint: { synthetic: true } };
  await createOperation({ schema: OPERATION_SCHEMA, operationId, plan,
    planHash: buildPlanHash(plan), journalPath: operationPath(operationId), artifacts: [],
    state: "completed", nextSafeAction: "Synthetic isolation fixture." });
  const capability = await controlRootCapability(); await capability.close();
  ${fail ? 'assert.fail("Deliberate test failure after private journal publication");' : 'assert.equal(operationPath(operationId), join(capturedRoot, "operations", operationId + ".json"));'}
});
`, { flag: "wx" });
  return path;
}

async function observed(options: IsolationFixture, name: string): Promise<{ readonly root: string; readonly pid: number }> {
  const value: unknown = JSON.parse(await readFile(join(options.root, `${name}.observed.json`), "utf8"));
  assert.ok(value !== null && typeof value === "object" && "capturedRoot" in value && "environmentRoot" in value && "pid" in value);
  assert.ok(typeof value.capturedRoot === "string" && typeof value.pid === "number");
  assert.equal(value.capturedRoot, value.environmentRoot);
  assert.equal(dirname(value.capturedRoot), options.temporaryDirectory);
  const expectedPrefix = join(options.temporaryDirectory, `easyeda-test-control-${String(value.pid)}-`);
  assert.ok(value.capturedRoot.startsWith(expectedPrefix));
  assert.equal(Reflect.get(value, "home"), process.env["HOME"]);
  assert.equal(Reflect.get(value, "codexHome"), process.env["CODEX_HOME"]);
  assert.equal(Reflect.get(value, "tokenPath"), join(value.capturedRoot, "bridge-token"));
  assert.equal(Reflect.get(value, "upstreamPath"), join(value.capturedRoot, "upstream"));
  const information = await lstat(value.capturedRoot); assert.ok(information.isDirectory() && !information.isSymbolicLink());
  assert.equal(information.mode % 512, 448);
  assert.equal(await realpath(value.capturedRoot), value.capturedRoot);
  return { root: value.capturedRoot, pid: value.pid };
}

async function assertAmbientUnchanged(options: IsolationFixture): Promise<void> {
  assert.deepEqual(await readdir(options.ambientRoot), ["bridge-token", "operations", "upstream"]);
  assert.deepEqual(await readdir(join(options.ambientRoot, "operations")), ["retained.json"]);
  assert.deepEqual(await readdir(join(options.ambientRoot, "upstream")), ["retained-state"]);
  for (const sentinel of options.sentinels) { assert.deepEqual(await readFile(sentinel.path), sentinel.bytes); }
}

void test("the package test command always preloads isolation before loading test files", async () => {
  const manifest: unknown = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));
  assert.ok(manifest !== null && typeof manifest === "object" && "scripts" in manifest);
  const scripts: unknown = manifest.scripts;
  assert.ok(scripts !== null && typeof scripts === "object" && "test" in scripts);
  assert.equal(scripts.test, "node --import ./scripts/test-isolation.ts --test server/tests/*.test.ts");
});

void test("preload isolates static artifact imports, overrides an ambient root and retains evidence after failure", async (context) => {
  const options = await fixture(context), worker = await writeWorker(options, "failure", true);
  const result = run(options, [worker]);
  assert.equal(result.error, undefined); assert.equal(result.signal, null); assert.equal(result.status, 1);
  assert.match(String(result.stdout), /Deliberate test failure after private journal publication/u);
  const information = await observed(options, "failure");
  assert.deepEqual(await readdir(join(information.root, "operations")), ["easyeda-isolation-failure.json"]);
  await assertAmbientUnchanged(options);
});

void test("preload gives every test worker a distinct root instead of inheriting an ambient or sibling root", async (context) => {
  const options = await fixture(context);
  const files = await Promise.all([writeWorker(options, "first", false), writeWorker(options, "second", false)]);
  const result = run(options, files);
  assert.equal(result.error, undefined); assert.equal(result.signal, null); assert.equal(result.status, 0, String(result.stdout) + String(result.stderr));
  const first = await observed(options, "first"), second = await observed(options, "second");
  assert.notEqual(first.root, second.root); assert.notEqual(first.pid, second.pid);
  assert.deepEqual(await readdir(join(first.root, "operations")), ["easyeda-isolation-first.json"]);
  assert.deepEqual(await readdir(join(second.root, "operations")), ["easyeda-isolation-second.json"]);
  const roots = await readdir(options.temporaryDirectory);
  assert.equal(roots.length, 2, "Both workers need their own fresh root");
  assert.notEqual(first.pid, result.pid); assert.notEqual(second.pid, result.pid);
  await assertAmbientUnchanged(options);
});

void test("preload canonicalizes an alternate TMPDIR and fixed children retain original root identities", async (context) => {
  const options = await fixture(context), parent = await assertTestIsolation();
  const alias = join(options.root, "temporary-alias");
  await symlink(options.temporaryDirectory, alias);
  const child = fileURLToPath(new URL("helpers/test-isolation-child.ts", import.meta.url));
  // oxlint-disable-next-line node/no-sync -- This fixed builtin-only child exits normally before inspecting its evidence.
  const result = spawnSync(process.execPath, ["--import", preload, child, JSON.stringify(parent)], {
    env: { TMPDIR: alias, NODE_NO_WARNINGS: "1" }, encoding: "utf8", timeout: 10_000, maxBuffer: 32_768,
  });
  assert.equal(result.error, undefined); assert.equal(result.signal, null); assert.equal(result.status, 0, result.stderr);
  const value: unknown = JSON.parse(result.stdout);
  assert.ok(value !== null && typeof value === "object");
  assert.equal(Reflect.get(value, "temporaryDirectory"), options.temporaryDirectory);
  assert.equal(Reflect.get(value, "parent"), parent.directory);
  const root: unknown = Reflect.get(value, "directory");
  assert.ok(typeof root === "string"); assert.equal(dirname(root), options.temporaryDirectory);
  assert.equal(Reflect.get(value, "pid"), result.pid);
  const roots = await readdir(options.temporaryDirectory);
  assert.equal(roots.length, 1, "Repeated imports must not allocate a replacement root");
  await assertAmbientUnchanged(options);
});

for (const field of ["pid", "ino", "dev", "mode", "directory", "temporaryDirectory"] as const) {
  void test(`fixed synthetic child rejects a substituted parent ${field}`, async (context) => {
    const options = await fixture(context), parent = await assertTestIsolation();
    const changed = { ...parent, [field]: typeof parent[field] === "number" ? parent[field] + 1 : options.ambientRoot };
    const child = fileURLToPath(new URL("helpers/test-isolation-child.ts", import.meta.url));
    // oxlint-disable-next-line node/no-sync -- Retain the fixed child's actual refusal and normal exit before continuing.
    const result = spawnSync(process.execPath, ["--import", preload, child, JSON.stringify(changed)], {
      env: { TMPDIR: options.temporaryDirectory, NODE_NO_WARNINGS: "1" }, encoding: "utf8", timeout: 10_000, maxBuffer: 32_768,
    });
    assert.equal(result.error, undefined); assert.equal(result.signal, null); assert.equal(result.status, 1);
    assert.equal(result.stdout, ""); assert.match(result.stderr, /AssertionError/u);
    await assertAmbientUnchanged(options);
  });
}
