/** Production verifier with inert descriptor/version seams. No executable,
 * filesystem, app or controller is opened by these focused protocol checks. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { promisify } from "node:util";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { openVerifiedMachineNode, retainCurrentProcessSqlNode } from "../src/machine-profile.ts";

async function fixture(): Promise<Readonly<{ api: { retain: typeof retainCurrentProcessSqlNode; configured: typeof openVerifiedMachineNode };
  state: { bytes: Buffer; versions: number; coreChecks: number; pathPasses: number; kernelPasses: number; namedInode: number; pathInode: number; kernelInode: number;
    kernelPath: string; corruptAfterVersion: boolean; failCore: boolean; closes: number[] }; digest: string }>> {
  const url = new URL("../src/machine-profile.ts", import.meta.url);
  const sourceRequire = createRequire(url);
  const initial = Buffer.from("synthetic-original-executable-bytes");
  const state = { bytes: Buffer.from(initial), versions: 0, coreChecks: 0, pathPasses: 0, kernelPasses: 0, namedInode: 2, pathInode: 2, kernelInode: 2,
    kernelPath: process.execPath, corruptAfterVersion: false, failCore: false, closes: [] as number[] };
  const information = (inode: number): unknown => ({ dev: 1, ino: inode, size: initial.length, mtimeMs: 1, ctimeMs: 1, mode: 32_768 + 0o755, uid: 0, gid: 0, nlink: 1,
    isFile: (): true => true, isSymbolicLink: (): false => false });
  const descriptor = (kernel: boolean): unknown => ({ fd: kernel ? 31 : 32,
    stat: (): Promise<unknown> => Promise.resolve(information(kernel ? state.kernelInode : state.namedInode)),
    read: (buffer: Buffer, offset: number, length: number, position: number): Promise<Readonly<{ bytesRead: number; buffer: Buffer }>> => {
      if (position === 0) { if (kernel) { state.kernelPasses += 1; } else { state.pathPasses += 1; } }
      const count = Math.max(0, Math.min(length, state.bytes.length - position)); state.bytes.copy(buffer, offset, position, position + count);
      return Promise.resolve({ bytesRead: count, buffer });
    }, close: (): Promise<void> => { state.closes.push(kernel ? 31 : 32); return Promise.resolve(); } });
  const execute = (): never => { assert.equal(state.closes.length, 0); throw new Error("Unexpected unpromisified executable dispatch"); };
  Object.defineProperty(execute, promisify.custom, { value: async (file: string, args: string[]): Promise<Readonly<{ stdout: string; stderr: string }>> => {
    assert.equal(file, `/proc/${String(process.pid)}/fd/32`); assert.deepEqual(args, ["--version"]); state.versions += 1;
    if (state.corruptAfterVersion) { state.bytes = Buffer.from("x".repeat(initial.length)); }
    await Promise.resolve(); return { stdout: "v24.18.0\n", stderr: "" };
  } });
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "node:fs/promises") { return {
      lstat: (path: string): Promise<unknown> => { assert.equal(path, process.execPath); return Promise.resolve(information(state.pathInode)); },
      realpath: (path: string): Promise<string> => { assert.ok(path === "/proc/self/exe" || path === process.execPath); return Promise.resolve(path === "/proc/self/exe" ? state.kernelPath : path); },
      open: (path: string): Promise<unknown> => { assert.ok(path === "/proc/self/exe" || path === process.execPath); return Promise.resolve(descriptor(path === "/proc/self/exe")); },
    }; }
    if (name === "node:child_process") { return { execFile: execute }; }
    if (name === "./soft-core-limit.ts") { return { assertSelfSoftCoreLimitZero: (): Promise<void> => {
      state.coreChecks += 1; return state.failCore ? Promise.reject(new Error("synthetic nonzero core limit")) : Promise.resolve();
    } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const configured = loaded.exports["openVerifiedMachineNode"], retain = loaded.exports["retainCurrentProcessSqlNode"];
  assert.equal(typeof retain, "function"); assert.equal(typeof configured, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The runtime checked functions are the production exports with only the stated descriptor/version seams.
  const api = { retain, configured } as { retain: typeof retainCurrentProcessSqlNode; configured: typeof openVerifiedMachineNode };
  return { api, state, digest: createHash("sha256").update(initial).digest("hex") };
}
void test("current-process acquisition publishes one complete original birth proof and closes both descriptors on birth drift", async () => {
  const f = await fixture(), owner = await f.api.retain();
  assert.equal(f.state.versions, 1); assert.equal(f.state.coreChecks, 1);
  assert.equal(f.state.pathPasses, 1); assert.equal(f.state.kernelPasses, 3);
  assert.deepEqual(f.state.closes, []); await owner.close();
  assert.deepEqual(f.state.closes.toSorted((left, right) => left - right), [31, 32]);
  const changed = await fixture(); changed.state.corruptAfterVersion = true;
  await assert.rejects(changed.api.retain(), /kernel-changed/u);
  assert.equal(changed.state.versions, 1);
  assert.deepEqual(changed.state.closes.toSorted((left, right) => left - right), [31, 32]);
});
void test("a current-process assertion hashes the joined original inode before and after version, with no redundant alias pass", async () => {
  const f = await fixture(), owner = await f.api.retain();
  f.state.pathPasses = 0; f.state.kernelPasses = 0; const coreChecks = f.state.coreChecks, versions = f.state.versions;
  await owner.assertCurrent(); assert.equal(f.state.kernelPasses, 2); assert.equal(f.state.pathPasses, 0);
  assert.equal(f.state.versions, versions + 1); assert.equal(f.state.coreChecks, coreChecks + 1);
  await owner.close(); assert.deepEqual(f.state.closes.toSorted((left, right) => left - right), [31, 32]);
});
void test("bytes changed before or during the version probe refuse despite unchanged inode metadata", async () => {
  for (const during of [false, true]) {
    const f = await fixture(), owner = await f.api.retain(); const versions = f.state.versions;
    if (during) { f.state.corruptAfterVersion = true; } else { f.state.bytes[0] = 120; }
    await assert.rejects(owner.assertCurrent(), /kernel-changed/u); assert.equal(f.state.versions, versions + Number(during));
    await owner.close(); assert.deepEqual(f.state.closes.toSorted((left, right) => left - right), [31, 32]);
  }
});
void test("each original descriptor, named path, kernel link and core-limit predicate remains independently required", async () => {
  for (const field of ["namedInode", "pathInode", "kernelInode", "kernelPath", "failCore"] as const) {
    const f = await fixture(), owner = await f.api.retain(); const versions = f.state.versions;
    if (field === "kernelPath") { f.state.kernelPath = "/synthetic/replaced-node"; }
    else if (field === "failCore") { f.state.failCore = true; } else { f.state[field] = 9; }
    await assert.rejects(owner.assertCurrent()); assert.equal(f.state.versions, versions); await owner.close();
    assert.deepEqual(f.state.closes.toSorted((left, right) => left - right), [31, 32]);
  }
});
void test("a configured executable without the current-process kernel alias retains its own complete hash", async () => {
  const f = await fixture(), owner = await f.api.configured({ nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: f.digest });
  f.state.pathPasses = 0; const versions = f.state.versions; await owner.assertCurrent();
  assert.equal(f.state.pathPasses, 1); assert.equal(f.state.kernelPasses, 0); assert.equal(f.state.versions, versions + 1);
  f.state.bytes[0] = 120; await assert.rejects(owner.assertCurrent(), /machine-node-changed/u); await owner.close(); assert.deepEqual(f.state.closes, [32]);
});
