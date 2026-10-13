/* oxlint-disable import/max-dependencies -- Test actual managed storage, fixed child restarts and descriptor failure boundaries together. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fsPromises, { chmod, lstat, mkdir, readFile, readdir, rename, symlink, unlink, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { controlDataDirectory } from "../src/artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { claimClosedSymbolValidationTarget } from "../src/closed-symbol-target-claim.ts";
import { fixture, makePlan, slotPath } from "./helpers/closed-symbol-target-claim-fixture.ts";
import { parseClosedSymbolValidationRequest } from "../src/closed-symbol-validation-request.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node's promisify consumes execFile's completion callback, not its ChildProcess return.
const run = promisify(execFile);
async function restart(request: unknown): Promise<void> {
  const result = await run(process.execPath, [join(import.meta.dirname, "helpers/closed-symbol-target-claim-restart-child.ts"), JSON.stringify(request)], { env: { ...process.env, NODE_OPTIONS: "" }, timeout: 20_000, maxBuffer: 4096 });
  assert.equal(result.stdout, "existing reservation refused\n");
}
void test("actual managed claim persists exact plan, marker, fingerprint and no authority", async () => {
  const f = fixture(), result = await claimClosedSymbolValidationTarget(f.request, f.plan);
  const bytes = await readFile(result.artifact.path), value: unknown = JSON.parse(bytes.toString("utf8")); assert.ok(isRecord(value));
  assert.equal(result.reservationPath, slotPath(f.request)); assert.equal(result.artifact.path, join(slotPath(f.request), "claim.json"));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), result.artifact.sha256); assert.equal(bytes.length, result.artifact.bytes);
  assert.equal(canonicalJson(value["request"]), canonicalJson(f.request)); assert.equal(canonicalJson(value["plan"]), canonicalJson(f.plan));
  assert.equal(value["closedPlanSha256"], sha256Json(f.plan)); assert.equal(value["markerSha256"], sha256Json(f.plan.marker));
  assert.equal(value["expectedFingerprintSha256"], f.plan.expectedFingerprintSha256);
  assert.equal(result.attemptConsumed, true); assert.equal(result.executionAuthorized, false); assert.equal(result.completionProved, false);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.artifact));
  const directory = await lstat(result.reservationPath), file = await lstat(result.artifact.path);
  assert.equal(directory.mode % 512, 0o700); assert.equal(file.mode % 512, 0o600);
  await restart(f.request); assert.deepEqual(await readFile(result.artifact.path), bytes);
});
for (const change of ["path-alias", "patch", "branch", "owner", "companion", "marker", "fingerprint"] as const) {
  void test(`${change} cannot change permanent target key or replay`, async () => {
    const f = fixture(); const claim = await claimClosedSymbolValidationTarget(f.request, f.plan); const before = await readFile(claim.artifact.path);
    let request = f.request;
    if (change === "path-alias") { request = parseClosedSymbolValidationRequest({ ...request, target: { ...request.target, projectPath: "C:\\different\\alias.eprj2" } }); }
    if (change === "patch") { request = parseClosedSymbolValidationRequest({ ...request, metadata: { name: "different", description: "different" } }); }
    if (change === "branch" || change === "owner" || change === "companion") {
      const key = { branch: "branchUuid", owner: "ownerUuid", companion: "companionPcbUuid" }[change];
      request = parseClosedSymbolValidationRequest({ ...request, target: { ...request.target, [key]: "f".repeat(32) } });
    }
    const plan = { ...makePlan(request), expectedFingerprintSha256: change === "fingerprint" ? "3".repeat(64) : f.plan.expectedFingerprintSha256 };
    await assert.rejects(claimClosedSymbolValidationTarget(request, plan), { code: "EEXIST" });
    assert.equal(slotPath(request), claim.reservationPath); assert.deepEqual(await readFile(claim.artifact.path), before);
  });
}
void test("concurrent target attempts publish at most one claim", async () => {
  const f = fixture(), results = await Promise.allSettled([claimClosedSymbolValidationTarget(f.request, f.plan), claimClosedSymbolValidationTarget(f.request, makePlan(f.request))]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  assert.deepEqual(await readdir(slotPath(f.request)), ["claim.json"]);
});
void test("different canonical project or symbol has a distinct key", async () => {
  const f = fixture(), first = await claimClosedSymbolValidationTarget(f.request, f.plan);
  for (const key of ["projectUuid", "symbolUuid"] as const) {
    const request = parseClosedSymbolValidationRequest({ ...f.request, target: { ...f.request.target, [key]: "9".repeat(32) } });
    const next = await claimClosedSymbolValidationTarget(request, makePlan(request)); assert.notEqual(next.targetKey, first.targetKey);
  }
});
for (const kind of ["empty-directory", "partial-json", "invalid-json", "unreadable-directory", "regular-file", "symlink"] as const) {
  void test(`existing ${kind} reservation refuses without interpreting bytes, also after restart`, async () => {
    const f = fixture(), path = slotPath(f.request);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    if (kind === "regular-file") { await writeFile(path, "permanent", { mode: 0o600, flag: "wx" }); }
    else if (kind === "symlink") { await symlink("missing-target", path); }
    else { await mkdir(path, { mode: 0o700 }); }
    if (kind === "partial-json" || kind === "invalid-json") { await writeFile(join(path, "claim.json"), kind === "partial-json" ? "{" : "not JSON", { mode: 0o600 }); }
    if (kind === "unreadable-directory") { await chmod(path, 0); }
    await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan), { code: "EEXIST" }); await restart(f.request);
    const retained = await lstat(path); assert.ok(retained.ino > 0);
  });
}
for (const boundary of ["mkdir-ack", "partial-write", "file-sync", "slot-close"] as const) {
  void test(`failed ${boundary} retains permanent consumption without any reset`, async (context) => {
    const f = fixture(), originalMkdir = fsPromises.mkdir, originalOpen = fsPromises.open, path = slotPath(f.request); let injected = false, selected = false;
    if (boundary === "mkdir-ack") {
      context.mock.method(fsPromises, "mkdir", async (...args: Parameters<typeof mkdir>): ReturnType<typeof mkdir> => {
        const result = await originalMkdir(...args);
        if (basename(String(args[0])) === basename(path)) { injected = true; throw new Error("synthetic lost mkdir acknowledgement"); }
        return result;
      });
    } else {
      context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
        const handle = await originalOpen(...args);
        if (basename(String(args[0])) === "claim.json" && !injected) {
          if (boundary === "partial-write") { const original = handle.writeFile.bind(handle); context.mock.method(handle, "writeFile", async (): Promise<void> => { await original("{"); injected = true; throw new Error("synthetic partial write"); }); }
          if (boundary === "file-sync") { context.mock.method(handle, "sync", (): Promise<void> => { injected = true; return Promise.reject(new Error("synthetic file sync")); }); }
        }
        if (boundary === "slot-close" && basename(String(args[0])) === basename(path) && !selected) {
          selected = true; const original = handle.close.bind(handle);
          context.mock.method(handle, "close", async (): Promise<void> => { await original(); injected = true; throw new Error("synthetic directory close acknowledgement"); });
        }
        return handle;
      });
    }
    syncBuiltinESMExports();
    try { await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan)); assert.equal(injected, true); }
    finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    const retained = await lstat(path); assert.equal(retained.isDirectory(), true); await restart(f.request);
    await assert.rejects(claimClosedSymbolValidationTarget(f.request, makePlan(f.request)), { code: "EEXIST" });
  });
}
void test("inputs changed after permanent mkdir are refused, captured target remains consumed", async (context) => {
  const f = fixture(), originalMkdir = fsPromises.mkdir, path = slotPath(f.request);
  context.mock.method(fsPromises, "mkdir", async (...args: Parameters<typeof mkdir>): ReturnType<typeof mkdir> => {
    const result = await originalMkdir(...args);
    if (basename(String(args[0])) === basename(path)) { Reflect.set(f.plan, "targetUuid", "0".repeat(32)); }
    return result;
  }); syncBuiltinESMExports();
  try { await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan), /does not exactly bind/u); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  assert.deepEqual(await readdir(path), []); await restart(f.request);
});
for (const change of ["target", "branch", "patch", "id", "native-pins", "duplicate-markers", "hash", "extra", "nested-object"] as const) {
  void test(`internal plan ${change} mismatch refuses before any target reservation`, async () => {
    const f = fixture(), path = slotPath(f.request);
    if (change === "target") { Reflect.set(f.plan, "targetUuid", "0".repeat(32)); }
    if (change === "branch") { Reflect.set(f.plan, "branchUuid", "0".repeat(32)); }
    if (change === "patch") { Reflect.set(f.plan.operation.patch, "name", "other"); }
    if (change === "id") { Reflect.set(f.plan.operation, "id", "caller-override"); }
    if (change === "native-pins") { Reflect.set(f.plan, "nativePinsSha256", "0".repeat(64)); }
    if (change === "duplicate-markers") { Reflect.set(f.plan.marker, "keyNonce", f.plan.marker.namespaceNonce); }
    if (change === "hash") { Reflect.set(f.plan, "facadeSha256", "bad"); }
    if (change === "extra") { Reflect.set(f.plan, "retry", true); }
    if (change === "nested-object") { Reflect.set(f.plan, "projectUuid", { toJSON(): never { throw new Error("must never execute"); } }); }
    await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan)); await assert.rejects(lstat(path), { code: "ENOENT" });
  });
}
void test("managed claim parent symlink is refused without following another directory", async () => {
  const destination = join(controlDataDirectory(), "claim-symlink-destination"), f = fixture(), parent = dirname(slotPath(f.request)), preserved = join(controlDataDirectory(), "claim-parent-preserved");
  await mkdir(destination, { mode: 0o700 }); await rename(parent, preserved);
  try {
    await symlink(destination, parent);
    await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan), /real directory/u);
    assert.deepEqual(await readdir(destination), []);
  } finally { await unlink(parent); await rename(preserved, parent); }
});
