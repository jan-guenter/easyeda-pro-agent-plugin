/* oxlint-disable import/max-dependencies -- The actual isolated CLI, original sealed build, output publisher and exact package proof exercise separate custody boundaries together. */
/** Actual packaged CLI and sealed-build tests in private offline roots. No
 * installed control connection, upstream process or EasyEDA app is used. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { copyFile, lstat, mkdir, readFile, readdir, readlink, realpath, symlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { z } from "zod";
import { buildForegroundManagerBundle } from "../../scripts/build-server.ts";
import type { ForegroundManagerBundle } from "../../scripts/build-server.ts";
import { FOREGROUND_MANAGER_OUTPUT_NAME, publishForegroundManagerBundle } from "../../scripts/build-control-manager.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

const pluginRoot = resolve(import.meta.dirname, "../..");
let originalBuild: Promise<ForegroundManagerBundle> | undefined;
/** Reuse the genuine sealed build, never a supplied metadata description. */
function candidate(): Promise<ForegroundManagerBundle> { originalBuild ??= buildForegroundManagerBundle(pluginRoot); return originalBuild; }
/** Compare exact published JSON records without accepting null or arrays. */
function record(input: unknown): Record<string, unknown> { return z.record(z.string(), z.unknown()).parse(input); }
/** Hash actual bytes; an emitted frontend hash supplies no native admission. */
function hash(input: Uint8Array): string { return createHash("sha256").update(input).digest("hex"); }
/** Prove package ancestors contain no dependency directory a runtime import
 * could silently use in place of the standalone frontend's own closure. */
async function noDependencyAncestor(path: string): Promise<void> {
  let current = path;
  for (;;) {
    await assert.rejects(lstat(join(current, "node_modules")), { code: "ENOENT" });
    const parent = dirname(current); if (parent === current) { return; } current = parent;
  }
}
/** Create only installed-style runtime files and a fresh private offline
 * profile; no TypeScript/source or dependency tree enters this package. */
async function fixture(metadataReady = true): Promise<Readonly<{ root: string; dist: string; frontend: string; profile: string; bootstrap: string; control: string }>> {
  const root = await createTestTemporaryDirectory("easyeda-packaged-manager-");
  const dist = join(root, "server", "dist"); const bin = join(root, "server", "bin"); const control = join(root, "control");
  await Promise.all([mkdir(dist, { recursive: true }), mkdir(bin, { recursive: true }), mkdir(control, { mode: 0o700 })]);
  for (const name of ["server.mjs", "upstream-supervisor.mjs"]) { await copyFile(join(pluginRoot, "server", "dist", name), join(dist, name)); }
  await copyFile(join(pluginRoot, "server", "bin", "easyeda-fd-sanitizer"), join(bin, "easyeda-fd-sanitizer"));
  for (const name of [".mcp.json", "reviewed-compatibility.json"]) { await copyFile(join(pluginRoot, name), join(root, name)); }
  const pinned = await realpath(process.execPath); const bootstrap = join(root, "ambient-bootstrap-node");
  await copyFile(pinned, bootstrap);
  const profile = join(control, "machine-profile.json");
  const upstream = join(root, "metadata-upstream"); const assets = join(root, "metadata-assets");
  if (metadataReady) {
    await mkdir(join(upstream, "dist"), { recursive: true });
    await writeFile(join(upstream, "package.json"), JSON.stringify({ name: "easyeda-mcp-pro", version: "1.0.0" }));
    await writeFile(join(upstream, "dist", "index.js"), `import {writeFileSync} from "node:fs";writeFileSync(${JSON.stringify(join(root, "upstream-executed"))},"unexpected");throw new Error("Offline fixture must never start upstream");\n`);
    for (const path of [join(assets, "pro-pcb", "3.2.195.6b67774e", "js", "pcb.js"),
      ...["api.js", "api-types.js", "api-types.d.ts"].map(name => join(assets, "pro-api", "0.3.59.1ca9efb5", name))]) {
      await mkdir(dirname(path), { recursive: true }); await writeFile(path, "synthetic metadata only; never executed\n");
    }
  }
  const pinnedBytes = await readFile(pinned); const nodeSha256 = hash(pinnedBytes);
  await writeFile(profile, JSON.stringify({ schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64",
    runtime: { nodeExecutable: pinned, nodeVersion: "24.18.0", nodeSha256 },
    upstream: { root: upstream, entrypoint: join(upstream, "dist", "index.js"), serverVersion: "1.0.0" },
    easyeda: { assetsRoot: assets, pcbBundleVersion: "3.2.195.6b67774e", publicApiBundleVersion: "0.3.59.1ca9efb5" }, controlDirectory: control }), { mode: 0o600 });
  const frontend = await publishForegroundManagerBundle(dist, await candidate());
  await assert.rejects(lstat(join(root, "scripts")), { code: "ENOENT" }); await assert.rejects(lstat(join(root, "server", "src")), { code: "ENOENT" });
  await noDependencyAncestor(dist);
  return Object.freeze({ root, dist, frontend, profile, bootstrap, control });
}
/** Execute the one actual CLI. Its input includes cooperative retirement and
 * shutdown; no signal or replacement client disposes its child. */
async function cli(executable: string, args: readonly string[], input: string | ((first: Record<string, unknown>) => string), cwd: string, profile?: string): Promise<Readonly<{ pid: number; code: unknown; signal: unknown; rows: readonly Record<string, unknown>[]; stderr: string }>> {
  const child = spawn(executable, args, { cwd, env: { LANG: "C", LC_ALL: "C", ...(profile === undefined ? {} : { EASYEDA_MACHINE_PROFILE: profile }) }, stdio: ["pipe", "pipe", "pipe"] });
  const closed = once(child, "close"); const stdout: string[] = []; const stderr: string[] = [];
  child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
  let pending = "", sent = false;
  child.stdout.on("data", (text: string) => {
    stdout.push(text); pending += text;
    let boundary = pending.indexOf("\n");
    while (boundary !== -1) {
      const line = pending.slice(0, boundary); pending = pending.slice(boundary + 1);
      if (typeof input === "function" && !sent) {
        const row = record(JSON.parse(line));
        if (row["ready"] === true || row["error"] === "manager-initialization-failed") { sent = true; child.stdin.end(input(row)); }
      }
      boundary = pending.indexOf("\n");
    }
  }); child.stderr.on("data", (text: string) => { stderr.push(text); });
  if (typeof input === "string") { child.stdin.end(input); }
  const [code, signal] = z.tuple([z.number().int().nullable(), z.string().nullable()]).parse(await closed); assert.ok(child.pid !== undefined);
  const rows = stdout.join("").trim().split("\n").filter(Boolean).map(line => record(JSON.parse(line)));
  return Object.freeze({ pid: child.pid, code, signal, rows, stderr: stderr.join("") });
}
void test("sealed standalone manager is reproducible and publishes one atomic file while refusing symlink substitution", { timeout: 30_000 }, async () => {
  const first = await candidate(), second = await buildForegroundManagerBundle(pluginRoot);
  assert.equal(first.buildId, second.buildId); assert.equal(first.sha256, second.sha256); assert.deepEqual(first.bytes, second.bytes);
  const root = await createTestTemporaryDirectory("easyeda-manager-publication-");
  const target = join(root, FOREGROUND_MANAGER_OUTPUT_NAME), unrelated = join(root, "unrelated");
  await writeFile(unrelated, "unchanged"); await symlink(unrelated, target);
  await assert.rejects(publishForegroundManagerBundle(root, first)); assert.equal(await readFile(unrelated, "utf8"), "unchanged");
  const clean = join(root, "clean"); await mkdir(clean);
  assert.equal(await publishForegroundManagerBundle(clean, first), join(clean, FOREGROUND_MANAGER_OUTPUT_NAME));
  assert.deepEqual(await readdir(clean), [FOREGROUND_MANAGER_OUTPUT_NAME]);
  const publishedBytes = await readFile(join(clean, FOREGROUND_MANAGER_OUTPUT_NAME)); assert.equal(hash(publishedBytes), first.sha256);
  assert.equal(await publishForegroundManagerBundle(clean, second), join(clean, FOREGROUND_MANAGER_OUTPUT_NAME));
  assert.deepEqual(await readdir(clean), [FOREGROUND_MANAGER_OUTPUT_NAME]);
  assert.deepEqual(await readFile(join(clean, FOREGROUND_MANAGER_OUTPUT_NAME)), publishedBytes);
});
void test("packaged frontend identity and actual CLI need no source dependencies and preserve pinned-node PID through original child retirement", { timeout: 120_000 }, async () => {
  const selected = await fixture(); const built = await candidate();
  const identity = await cli(process.execPath, [selected.frontend, "--frontend-identity"], "", selected.root);
  assert.equal(identity.code, 0, identity.stderr); assert.equal(identity.rows.length, 1);
  assert.equal(identity.rows[0]?.["sha256"], built.sha256); assert.equal(identity.rows[0]?.["buildId"], built.buildId);
  assert.equal(identity.rows[0]?.["admissionGranted"], false); assert.equal(identity.rows[0]?.["facadeRuntimeIdentityIncluded"], false);
  const input = `${[
    { id: "offline-child", tool: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } },
    { id: "original-retire", action: "retire", generation: 1, confirmRetire: true }, { id: "original-shutdown", action: "shutdown" },
  ].map(value => JSON.stringify(value)).join("\n")  }\n`;
  const observed = await cli(selected.bootstrap, [selected.frontend], first => {
    if (first["ready"] === true) { return input; }
    // Keep input usable until a refusal is known; this original unused child
    // Must receive supported cleanup before EOF, even when assertions later fail.
    return `${[{ id: "startup-cleanup", action: "cleanup-startup", confirmCloseOriginalStartup: true },
      { id: "startup-shutdown", action: "shutdown" }].map(value => JSON.stringify(value)).join("\n")  }\n`;
  }, selected.root, selected.profile);
  assert.equal(observed.code, 0, JSON.stringify(observed.rows)); assert.equal(observed.signal, null);
  const ready = observed.rows.find(row => row["ready"] === true); assert.equal(ready?.["managerPid"], observed.pid);
  const facade = record(ready?.["loadedFacade"]); assert.equal(facade["nodeVersion"], "v24.18.0");
  const offline = observed.rows.find(row => row["id"] === "offline-child"); const envelope = record(record(offline?.["result"])["structuredContent"]);
  assert.equal(record(envelope["result"])["pid"], ready?.["facadePid"]);
  const retired = observed.rows.find(row => row["id"] === "original-retire"); assert.equal(retired?.["retired"], true);
  const closure = record(retired?.["closure"]); assert.equal(closure["pid"], ready?.["facadePid"]); assert.equal(closure["stdinEof"], true);
  assert.equal(closure["exitCode"], 0); assert.equal(closure["signal"], null);
  assert.equal(observed.rows.find(row => row["id"] === "original-shutdown")?.["closing"], true);
  await assert.rejects(readlink(`/proc/${observed.pid}/exe`), { code: "ENOENT" });
  await assert.rejects(lstat(join(selected.control, "facade.lock")), { code: "ENOENT" });
  await noDependencyAncestor(selected.dist);
  await assert.rejects(lstat(join(selected.root, "upstream-executed")), { code: "ENOENT" });
});
void test("packaged unready startup retains and cooperatively closes only its original unused child before EOF", { timeout: 120_000 }, async () => {
  const selected = await fixture(false);
  const observed = await cli(selected.bootstrap, [selected.frontend], () => `${[
    { id: "unready-cleanup", action: "cleanup-startup", confirmCloseOriginalStartup: true }, { id: "unready-shutdown", action: "shutdown" },
  ].map(value => JSON.stringify(value)).join("\n")  }\n`, selected.root, selected.profile);
  assert.equal(observed.code, 0, JSON.stringify(observed.rows)); assert.equal(observed.signal, null);
  const failed = observed.rows.find(row => row["error"] === "manager-initialization-failed"); assert.ok(failed !== undefined);
  const manager = record(failed["manager"]); assert.equal(manager["stage"], "blocked"); assert.equal(manager["callerToolDispatchStarted"], false);
  assert.equal(record(failed["diagnostic"])["reason"], "unexpected-facade-catalog");
  const cleaned = observed.rows.find(row => row["id"] === "unready-cleanup"); assert.equal(cleaned?.["startupClosed"], true);
  const closure = record(cleaned?.["closure"]); assert.equal(closure["pid"], manager["facadePid"]); assert.equal(closure["stdinEof"], true);
  assert.equal(closure["exitCode"], 0); assert.equal(closure["signal"], null); assert.equal(cleaned?.["replacementAllowed"], false);
  assert.equal(observed.rows.find(row => row["id"] === "unready-shutdown")?.["closing"], true);
});
