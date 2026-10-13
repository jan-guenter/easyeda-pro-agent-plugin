import assert from "node:assert/strict";
import fsPromises, { chmod, link, readFile, rename, symlink, truncate, writeFile } from "node:fs/promises";
import { registerHooks, syncBuiltinESMExports } from "node:module";
import { performance } from "node:perf_hooks";
import { basename } from "node:path";
import test from "node:test";
/* oxlint-disable node/no-top-level-await -- Install the fixed test-only manifest resolver before importing its consumer; never shipped as require(esm). */

const coreUrl = new URL("../src/core.ts", import.meta.url), syntheticCore = new URL("helpers/closed-symbol-terminal-closure-synthetic-core.ts", import.meta.url);
registerHooks({ resolve(specifier, context, nextResolve) {
  const selected = nextResolve(specifier, context);
  if (selected.url === coreUrl.href && context.parentURL === new URL("../src/closed-symbol-terminal-closure-plan.ts", import.meta.url).href) { return { url: syntheticCore.href, shortCircuit: true }; }
  return selected;
} });
const { closureFixture } = await import("./helpers/closed-symbol-terminal-closure-fixture.ts");
const { deriveClosedSymbolTerminalClosure, ClosureEvidenceChangedError, ClosureIneligibleError } = await import("../src/closed-symbol-terminal-closure-plan.ts");
const { observeClosedSymbolTerminalClosure, revalidateClosedSymbolTerminalClosure } = await import("../src/closed-symbol-terminal-closure-observer.ts");
const { sha256Json } = await import("../src/core.ts");
const { readExactUtf8Artifact } = await import("../src/artifacts.ts");

void test("fixed64 role closure retains aliases,18 sidecars, same bytes and no authority", async () => {
  const fixture = await closureFixture(), plan = deriveClosedSymbolTerminalClosure(fixture.input);
  assert.equal(plan.roles.length, 64); assert.equal(new Set(plan.roles.map((entry) => entry.path)).size, 62);
  const first = await observeClosedSymbolTerminalClosure(fixture.input);
  assert.equal(first.files.length, 62); assert.equal(first.absentSidecars.length, 18);
  assert.equal(first.executionAuthorized, false); assert.equal(first.completionProved, false); assert.equal(first.semanticValidationPerformed, false);
  assert.deepEqual(await revalidateClosedSymbolTerminalClosure(fixture.input, first), first);
});
for (let index = 0; index < 64; index += 1) {
  void test(`changed expected evidence role${String(index)} refuses`, async () => {
    const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles[index]; assert.ok(role !== undefined);
    const bytes = await readFile(role.path); bytes[0] = ((bytes[0] ?? 0) + 1) % 256; await writeFile(role.path, bytes);
    await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), ClosureEvidenceChangedError);
  });
}
for (let ordinal = 0; ordinal < 6; ordinal += 1) {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    void test(`database${String(ordinal)}${suffix} absence is explicit`, async () => {
      const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.filter((entry) => entry.database)[ordinal]; assert.ok(role !== undefined);
      await writeFile(`${role.path}${suffix}`, "synthetic", { flag: "wx", mode: 0o600 });
      await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-sidecar-present/u);
    });
  }
}
void test("input accessor is rejected without invocation or artifact I/O", async () => {
  let calls = 0;
  const input = Object.defineProperty({}, "journal", { get() { calls += 1; throw new Error("not invoked"); } });
  await assert.rejects(observeClosedSymbolTerminalClosure(input), /closure-own-data/u); assert.equal(calls, 0);
});
void test("caller path list cannot select filesystem targets", async () => {
  await assert.rejects(observeClosedSymbolTerminalClosure({ paths: ["/must-not-open"] }), /closure-input-fields/u);
});
void test("managed JSON permissive mode is cache ineligibility, not cold corruption", async () => {
  const fixture = await closureFixture(); await chmod(fixture.input.envelope.body.evidence.savedReadRaw.path, 0o640);
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), ClosureIneligibleError);
});
void test("same-byte replaced raw copy refuses recorded inode", async () => {
  const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "copy:0"); assert.ok(role !== undefined);
  const bytes = await readFile(role.path); await rename(role.path, `${role.path}.retained`); await writeFile(role.path, bytes, { flag: "wx", mode: 0o600 });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-recorded-identity-changed/u);
});
void test("same-byte leaf symlink cannot enter closure", async () => {
  const fixture = await closureFixture(), path = fixture.input.envelope.body.evidence.savedReadRaw.path;
  await rename(path, `${path}.retained`); await symlink(`${path}.retained`, path);
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-file-type-owner/u);
});
for (const label of ["journal", "receipt:0", "receipt:1", "receipt:2"]) {
  void test(`noncanonical ${label} classification follows the cold reader`, async () => {
    const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === label); assert.ok(role !== undefined);
    const value = JSON.parse(await readFile(role.path, "utf8")) as unknown;
    await writeFile(role.path, JSON.stringify(value));
    if (label !== "journal") {
      // The actual cold lifecycle reader uses the exact pretty+newline bytes.
      assert.ok(role.bytes !== null);
      await assert.rejects(readExactUtf8Artifact({ path: role.path, bytes: role.bytes, sha256: role.sha256 }));
    }
    // Journal changed AFTER pre-cold capture; exact bytes now differ as well.
    await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), ClosureEvidenceChangedError);
  });
  void test(`semantic change in ${label} is changed evidence`, async () => {
    const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === label); assert.ok(role !== undefined);
    const value: unknown = JSON.parse(await readFile(role.path, "utf8"));
    assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
    assert.ok("schema" in value || "operationId" in value);
    Object.assign(value, { changedAfterReplay: true }); await writeFile(role.path, JSON.stringify(value));
    await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), ClosureEvidenceChangedError);
  });
}
void test("known descriptor length contradiction takes priority over size cap", async () => {
  const fixture = await closureFixture(), path = fixture.input.envelope.body.evidence.savedReadRaw.path;
  await truncate(path, 245_761);
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), (error: unknown) => error instanceof ClosureEvidenceChangedError && error.message === "closure-file-length-changed");
});
void test("raw copy permission change is contradiction, not eligibility", async () => {
  const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "copy:0"); assert.ok(role !== undefined);
  await chmod(role.path, 0o640); await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), ClosureEvidenceChangedError);
});
void test("wrong current runtime refuses before evidence observation", async () => {
  const fixture = await closureFixture(); fixture.input.runtime = { ...fixture.input.runtime, nodeSha256: "0".repeat(64) };
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-current-runtime-changed/u);
});
void test("eight MiB input eligibility bound applies before filesystem reads", async () => {
  await assert.rejects(observeClosedSymbolTerminalClosure({ unrelated: "x".repeat(8_388_609) }), ClosureIneligibleError);
});
void test("fixed role cardinality rejects an extra phase", async () => {
  const fixture = await closureFixture();
  const first = fixture.input.events[0]; assert.ok(first !== undefined);
  fixture.input.events.push(first); await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-events/u);
});
void test("known 512MiB aggregate overflow refuses before opening files", async () => {
  const fixture = await closureFixture();
  for (const ordinal of [0, 1, 2]) {
    const event = fixture.input.events[[9, 25, 41][ordinal] ?? -1]; assert.ok(event !== undefined);
    assert.ok(event.data !== null && typeof event.data === "object" && !Array.isArray(event.data));
    const copy = event.data["copyReceipt"]; assert.ok(copy !== null && typeof copy === "object" && !Array.isArray(copy));
    copy["bytes"] = 268_435_456;
    const artifactIdentity = copy["artifactIdentity"]; assert.ok(artifactIdentity !== null && typeof artifactIdentity === "object" && !Array.isArray(artifactIdentity)); artifactIdentity["size"] = "268435456";
    const { receiptSha256: _hash, ...body } = copy; copy["receiptSha256"] = sha256Json(body);
    Object.defineProperty(event, "dataSha256", { value: sha256Json(event.data) });
    const generation = fixture.input.envelope.body.generations[ordinal]; assert.ok(generation !== undefined);
    // Clone the strict frozen envelope before the bounded pure-input experiment.
  }
  const envelope = structuredClone(fixture.input.envelope);
  for (const ordinal of [0, 1, 2]) {
    const event = fixture.input.events[[9, 25, 41][ordinal] ?? -1]; assert.ok(event !== undefined);
    assert.ok(event.data !== null && typeof event.data === "object" && !Array.isArray(event.data));
    const copy = event.data["copyReceipt"]; assert.ok(copy !== null && typeof copy === "object" && !Array.isArray(copy));
    const generation = envelope.body.generations[ordinal]; assert.ok(generation !== undefined);
    Object.assign(generation, { copyReceiptSha256: sha256Json(copy), copyArtifact: { ...generation.copyArtifact, bytes: 268_435_456 } });
  }
  Object.assign(envelope, { bodySha256: sha256Json(envelope.body) }); fixture.input.envelope = envelope;
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), (error: unknown) => error instanceof ClosureIneligibleError && error.message === "closure-aggregate-budget");
});
void test("elapsed deadline refuses before runtime qualification", async (context) => {
  const fixture = await closureFixture(); let calls = 0;
  context.mock.method(performance, "now", () => { calls += 1; return calls === 1 ? 0 : 10_001; });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-elapsed-deadline/u);
});
void test("bounded256KiB descriptor chunks preserve complete large-file hash", async (context) => {
  const fixture = await closureFixture(600_001);
  const role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "copy:0"); assert.ok(role !== undefined);
  const originalOpen = fsPromises.open;
  const counts: number[] = [];
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    if (String(args[0]).endsWith(basename(role.path))) {
      const originalRead = handle.read.bind(handle);
      context.mock.method(handle, "read", (buffer: Buffer, offset: number, length: number, position: number) => {
        counts.push(length); return originalRead(buffer, offset, length, position);
      });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await observeClosedSymbolTerminalClosure(fixture.input);
  assert.ok(counts.includes(262_144)); assert.ok(counts.includes(75_713)); assert.ok(counts.every((value) => value <= 262_144));
});
void test("late same-byte replacement before final named check refuses", async (context) => {
  const fixture = await closureFixture(), path = fixture.input.envelope.body.evidence.savedReadRaw.path;
  const bytes = await readFile(path), original = fsPromises.lstat; let calls = 0;
  context.mock.method(fsPromises, "lstat", async (...args: Parameters<typeof fsPromises.lstat>) => {
    if (args[0] === path) {
      calls += 1;
      if (calls === 2) { await rename(path, `${path}.retained`); await writeFile(path, bytes, { flag: "wx", mode: 0o600 }); }
    }
    return Reflect.apply(original, fsPromises, args);
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-named-file-changed/u); assert.equal(calls, 2);
});
void test("late sidecar after all file hashes refuses", async (context) => {
  const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "copy:0"); assert.ok(role !== undefined);
  const original = fsPromises.lstat; let absentCalls = 0;
  context.mock.method(fsPromises, "lstat", async (...args: Parameters<typeof fsPromises.lstat>) => {
    if (args[0] === `${role.path}-wal`) {
      absentCalls += 1;
      if (absentCalls === 2) { await writeFile(`${role.path}-wal`, "late synthetic", { flag: "wx", mode: 0o600 }); }
    }
    return Reflect.apply(original, fsPromises, args);
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-sidecar-present/u); assert.equal(absentCalls, 2);
});
void test("manifest-parent stat failure closes its newly acquired descriptor", async (context) => {
  const fixture = await closureFixture();
  const plan = deriveClosedSymbolTerminalClosure(fixture.input);
  const manifest = plan.roles.find((entry) => entry.role === "manifest"); assert.ok(manifest !== undefined);
  const parent = manifest.path.slice(0, -(basename(manifest.path).length + 1));
  const originalOpen = fsPromises.open;
  let closed = 0;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    if (args[0] === parent) {
      context.mock.method(handle, "stat", () => { throw new Error("synthetic-manifest-stat-failure"); });
      const originalClose = handle.close.bind(handle);
      context.mock.method(handle, "close", async () => { closed += 1; await originalClose(); });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /synthetic-manifest-stat-failure/u); assert.equal(closed, 1);
});
void test("all retained descriptor closes are attempted after one close fails", async (context) => {
  const fixture = await closureFixture(), originalOpen = fsPromises.open;
  let tracked = 0;
  let closed = 0;
  let injected = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    const path = String(args[0]);
    if (path.startsWith("/proc/self/fd/") && path.endsWith(".json")) {
      tracked += 1; const originalClose = handle.close.bind(handle);
      context.mock.method(handle, "close", async () => {
        closed += 1; await originalClose();
        if (!injected) { injected = true; throw new Error("synthetic-close-failure"); }
      });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-cleanup-failed/u);
  assert.ok(injected); assert.ok(tracked > 50); assert.equal(closed, tracked);
});
for (const alias of ["witnessRaw", "writeRaw"] as const) {
  void test(`conflicting ${alias} alias cannot hide behind physical deduplication`, async () => {
    const fixture = await closureFixture();
    const envelope = structuredClone(fixture.input.envelope);
    Object.assign(envelope.body.evidence[alias], { sha256: "0".repeat(64) });
    Object.assign(envelope, { bodySha256: sha256Json(envelope.body) }); fixture.input.envelope = envelope;
    await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-alias-conflict/u);
  });
}
void test("descriptor outside sealed operation is rejected before I/O", async () => {
  const fixture = await closureFixture();
  const envelope = structuredClone(fixture.input.envelope);
  Object.assign(envelope.body.evidence.savedReadRaw, { path: "/not-a-managed-operation/38-verify-content-read-raw.json" });
  Object.assign(envelope, { bodySha256: sha256Json(envelope.body) }); fixture.input.envelope = envelope;
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /Terminal artifact path refused/u);
});
void test("fresh bytes do not substitute for the replayed phase JSON", async () => {
  const fixture = await closureFixture();
  const event = fixture.input.events[18]; assert.ok(event !== undefined);
  Object.assign(event, { data: { changedAfterReplay: true }, dataSha256: sha256Json({ changedAfterReplay: true }) });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-replayed-json-changed/u);
});
void test("same-byte JSON replacement changes the retained closure identity", async () => {
  const fixture = await closureFixture();
  const first = await observeClosedSymbolTerminalClosure(fixture.input);
  const path = fixture.input.envelope.body.evidence.savedReadRaw.path;
  const bytes = await readFile(path);
  await rename(path, `${path}.retained`); await writeFile(path, bytes, { flag: "wx", mode: 0o600 });
  await assert.rejects(revalidateClosedSymbolTerminalClosure(fixture.input, first), /closure-previous-observation-changed/u);
});
void test("initial manifest leaf symlink is cache-ineligible", async () => {
  const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "manifest"); assert.ok(role !== undefined);
  await rename(role.path, `${role.path}.retained`); await symlink(`${role.path}.retained`, role.path);
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), (error: unknown) => error instanceof ClosureIneligibleError && error.message === "closure-manifest-file-kind");
});
void test("initial manifest parent alias is cache-ineligible", async () => {
  const fixture = await closureFixture(0, true);
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), (error: unknown) => error instanceof ClosureIneligibleError && error.message === "closure-manifest-parent-alias");
});
void test("initial same-byte manifest hardlink is cache-ineligible", async () => {
  const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "manifest"); assert.ok(role !== undefined);
  await link(role.path, `${role.path}.retained`);
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), (error: unknown) => error instanceof ClosureIneligibleError && error.message === "closure-manifest-owner-or-links");
});
for (const changed of ["length", "digest"] as const) {
  void test(`hardlinked manifest ${changed} contradiction is not hidden by eligibility`, async () => {
    const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "manifest"); assert.ok(role !== undefined);
    await link(role.path, `${role.path}.retained`);
    const bytes = await readFile(role.path); bytes[0] = ((bytes[0] ?? 0) + 1) % 256;
    await writeFile(role.path, changed === "length" ? Buffer.concat([bytes, Buffer.from("x")]) : bytes);
    await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), ClosureEvidenceChangedError);
  });
}
void test("initial non-owner manifest is cache-ineligible after exact bytes", async (context) => {
  const fixture = await closureFixture(), role = deriveClosedSymbolTerminalClosure(fixture.input).roles.find((entry) => entry.role === "manifest"); assert.ok(role !== undefined);
  const originalStat = fsPromises.lstat;
  const originalOpen = fsPromises.open;
  const otherUid = BigInt((process.getuid?.() ?? 0) + 100_000);
  context.mock.method(fsPromises, "lstat", async (...args: Parameters<typeof fsPromises.lstat>) => {
    const value = await Reflect.apply(originalStat, fsPromises, args);
    if (String(args[0]).endsWith("/manifest.json")) { Object.assign(value, { uid: otherUid }); }
    return value;
  });
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    if (String(args[0]).endsWith("/manifest.json")) {
      const original = handle.stat.bind(handle);
      context.mock.method(handle, "stat", async () => { const value = await original({ bigint: true }); Object.assign(value, { uid: otherUid }); return value; });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), (error: unknown) => error instanceof ClosureIneligibleError && error.message === "closure-manifest-owner-or-links");
});
void test("generation receipt relation uses the full receipt, not its inner seal", async () => {
  const fixture = await closureFixture();
  const envelope = structuredClone(fixture.input.envelope);
  const event = fixture.input.events[9]; assert.ok(event !== undefined && event.data !== null && typeof event.data === "object" && !Array.isArray(event.data));
  const copy = event.data["copyReceipt"]; assert.ok(copy !== null && typeof copy === "object" && !Array.isArray(copy));
  const generation = envelope.body.generations[0]; assert.ok(generation !== undefined);
  assert.equal(generation.copyReceiptSha256, sha256Json(copy)); assert.notEqual(generation.copyReceiptSha256, copy["receiptSha256"]);
  Object.assign(generation, { copyReceiptSha256: copy["receiptSha256"] });
  Object.assign(envelope, { bodySha256: sha256Json(envelope.body) }); fixture.input.envelope = envelope;
  await assert.rejects(observeClosedSymbolTerminalClosure(fixture.input), /closure-receipt-binding/u);
});
