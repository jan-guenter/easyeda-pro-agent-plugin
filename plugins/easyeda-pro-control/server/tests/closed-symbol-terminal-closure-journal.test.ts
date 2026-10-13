import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import fsPromises, { chmod, link, readFile, rename, symlink, truncate, writeFile } from "node:fs/promises";
import { registerHooks, syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { promisify } from "node:util";
/* oxlint-disable node/no-top-level-await -- Fixed synthetic manifest path before importing closure derivation; no authority issuer replacement. */
const coreUrl = new URL("../src/core.ts", import.meta.url), syntheticCore = new URL("helpers/closed-symbol-terminal-closure-synthetic-core.ts", import.meta.url);
registerHooks({ resolve(specifier, context, nextResolve) {
  const selected = nextResolve(specifier, context);
  if (selected.url === coreUrl.href && context.parentURL === new URL("../src/closed-symbol-terminal-closure-plan.ts", import.meta.url).href) { return { url: syntheticCore.href, shortCircuit: true }; }
  return selected;
} });
const { closureFixture } = await import("./helpers/closed-symbol-terminal-closure-fixture.ts");
const { captureClosedSymbolJournalBytes } = await import("../src/closed-symbol-terminal-closure-journal.ts");
const { deriveClosedSymbolTerminalClosure, ClosureEvidenceChangedError, ClosureIneligibleError } = await import("../src/closed-symbol-terminal-closure-plan.ts");
const { observeClosedSymbolTerminalClosure } = await import("../src/closed-symbol-terminal-closure-observer.ts");
const { sha256Json, sha256Text } = await import("../src/core.ts");

// oxlint-disable-next-line typescript/strict-void-return -- Node promisify intentionally ignores execFile's immediate ChildProcess return and retains actual callback completion.
const execFileAsync = promisify(execFile);
async function makeFifo(path: string): Promise<void> {
  await execFileAsync("/usr/bin/mkfifo", ["-m", "600", path], { env: {}, timeout: 1000 });
}
void test("fixed pre-cold capture binds exact raw bytes and whole semantic projection", async () => {
  const f = await closureFixture(), value = f.input.journalBytes;
  const bytes = await readFile(value.artifact.path);
  assert.equal(value.artifact.sha256, sha256Text(bytes.toString("utf8"))); assert.equal(value.artifact.bytes, bytes.length);
  assert.equal(value.journalSemanticSha256, sha256Json(f.input.journal));
  assert.ok(Object.isFrozen(value) && Object.isFrozen(value.artifact));
  assert.deepEqual(await captureClosedSymbolJournalBytes(f.input.journal), value);
});
void test("real last-append descriptor order survives normalization without raw-hash substitution", async () => {
  const f = await closureFixture(), journal = structuredClone(f.input.journal);
  const last = journal.artifacts?.[43]; assert.ok(last !== undefined && journal.artifacts !== undefined);
  journal.artifacts[43] = { path: last.path, sha256: last.sha256, bytes: last.bytes };
  const text = `${JSON.stringify(journal, null, 2)}\n`;
  assert.notEqual(sha256Text(text), f.input.journalBytes.artifact.sha256);
  assert.equal(sha256Json(journal), sha256Json(f.input.journal));
  await writeFile(f.input.journalBytes.artifact.path, text);
  f.input.journalBytes = await captureClosedSymbolJournalBytes(f.input.journal);
  assert.equal(f.input.journalBytes.artifact.sha256, sha256Text(text));
  const observed = await observeClosedSymbolTerminalClosure(f.input);
  assert.equal(observed.semanticValidationPerformed, false);
});
void test("compact but semantically equal pre-cold journal is cache-ineligible", async () => {
  const f = await closureFixture(); await writeFile(f.input.journalBytes.artifact.path, JSON.stringify(f.input.journal));
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), (error: unknown) => error instanceof ClosureIneligibleError && error.message === "closure-journal-producer-encoding");
});
void test("post-capture equal-semantic reordered bytes are not freshly adopted", async () => {
  const f = await closureFixture(), journal = structuredClone(f.input.journal);
  const last = journal.artifacts?.[43]; assert.ok(last !== undefined && journal.artifacts !== undefined);
  journal.artifacts[43] = { path: last.path, sha256: last.sha256, bytes: last.bytes };
  await writeFile(f.input.journalBytes.artifact.path, `${JSON.stringify(journal, null, 2)}\n`);
  await assert.rejects(observeClosedSymbolTerminalClosure(f.input), /closure-expected-bytes-changed/u);
});
void test("pre-cold different semantic object refuses", async () => {
  const f = await closureFixture();
  await writeFile(f.input.journalBytes.artifact.path, `${JSON.stringify({ ...f.input.journal, changed: true }, null, 2)}\n`);
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-semantic-changed/u);
});
void test("loader-dropped descriptor extras are ineligible, never silently normalized away", async () => {
  const f = await closureFixture(), journal = structuredClone(f.input.journal);
  const last = journal.artifacts?.[43]; assert.ok(last !== undefined); Object.assign(last, { extra: true });
  await writeFile(f.input.journalBytes.artifact.path, `${JSON.stringify(journal, null, 2)}\n`);
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-artifact-profile/u);
});
void test("capture rejects an accessor without invoking it", async () => {
  let calls = 0;
  await assert.rejects(captureClosedSymbolJournalBytes(Object.defineProperty({}, "operationId", { get() { calls += 1; return "not-invoked"; } })), /closure-own-data/u);
  assert.equal(calls, 0);
});
void test("malformed UTF8 refuses rather than decoding replacement characters", async () => {
  const f = await closureFixture();
  const bytes = await readFile(f.input.journalBytes.artifact.path); bytes[20] = 255;
  await writeFile(f.input.journalBytes.artifact.path, bytes);
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-json-invalid/u);
});
for (const bytes of [0, 8_388_609]) {
  void test(`journal size${String(bytes)} refuses before content allocation`, async () => {
    const f = await closureFixture(); await truncate(f.input.journalBytes.artifact.path, bytes);
    await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-size/u);
  });
}
void test("journal mode is cache eligibility", async () => {
  const f = await closureFixture(); await chmod(f.input.journalBytes.artifact.path, 0o640);
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-mode/u);
});
for (const alias of ["symlink", "hardlink"]) {
  void test(`journal ${alias} cannot enter capture`, async () => {
    const f = await closureFixture(), path = f.input.journalBytes.artifact.path;
    if (alias === "symlink") { await rename(path, `${path}.original`); await symlink(`${path}.original`, path); }
    else { await link(path, `${path}.linked`); }
    await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), ClosureEvidenceChangedError);
  });
}
void test("journal byte chunks are bounded even for larger exact synthetic data", async (context) => {
  const f = await closureFixture(), journal = { ...f.input.journal, padding: "x".repeat(550_000) };
  await writeFile(f.input.journalBytes.artifact.path, `${JSON.stringify(journal, null, 2)}\n`);
  const originalOpen = fsPromises.open;
  const lengths: number[] = [];
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    if (String(args[0]).endsWith(basename(f.input.journalBytes.artifact.path))) {
      const originalRead = handle.read.bind(handle);
      context.mock.method(handle, "read", (buffer: Buffer, offset: number, length: number, position: number) => { lengths.push(length); return originalRead(buffer, offset, length, position); });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  const result = await captureClosedSymbolJournalBytes(journal);
  assert.ok(result.artifact.bytes > 550_000 && lengths.length === 3 && lengths.every((length) => length <= 262_144));
});
void test("late same-byte replacement refuses before returning capture", async (context) => {
  const f = await closureFixture(), path = f.input.journalBytes.artifact.path;
  const bytes = await readFile(path), original = fsPromises.lstat; let calls = 0;
  context.mock.method(fsPromises, "lstat", async (...args: Parameters<typeof fsPromises.lstat>) => {
    if (args[0] === path) { calls += 1; if (calls === 2) { await rename(path, `${path}.original`); await writeFile(path, bytes, { flag: "wx", mode: 0o600 }); } }
    return Reflect.apply(original, fsPromises, args);
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-final-identity/u); assert.equal(calls, 2);
});
void test("short read refuses and closes the retained file", async (context) => {
  const f = await closureFixture(), original = fsPromises.open; let closes = 0;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(original, fsPromises, args);
    if (String(args[0]).endsWith(basename(f.input.journalBytes.artifact.path))) {
      context.mock.method(handle, "read", () => Promise.resolve({ bytesRead: 0 }));
      const close = handle.close.bind(handle); context.mock.method(handle, "close", async () => { closes += 1; await close(); });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-read-length/u); assert.equal(closes, 1);
});
void test("capture deadline cannot turn a completed read into a success", async (context) => {
  const f = await closureFixture(); let calls = 0;
  context.mock.method(performance, "now", () => { calls += 1; return calls < 6 ? 0 : 10_001; });
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-deadline/u);
});
void test("a file close rejection does not skip closing retained parent descriptors", async (context) => {
  const f = await closureFixture(), original = fsPromises.open;
  const tracked: { closed: boolean }[] = [];
  let injected = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(original, fsPromises, args);
    const entry = { closed: false }; tracked.push(entry);
    const close = handle.close.bind(handle);
    context.mock.method(handle, "close", async () => {
      await close(); entry.closed = true;
      if (String(args[0]).endsWith(basename(f.input.journalBytes.artifact.path))) { injected = true; throw new Error("synthetic-journal-close"); }
    });
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(captureClosedSymbolJournalBytes(f.input.journal), /closure-journal-cleanup/u);
  assert.ok(injected && tracked.length >= 3 && tracked.every((entry) => entry.closed));
});
void test("raw-byte descriptor with a different valid SHA cannot enter post-cold observation", async () => {
  const f = await closureFixture(), selected = structuredClone(f.input.journalBytes);
  Object.assign(selected.artifact, { sha256: "0".repeat(64) });
  await assert.rejects(observeClosedSymbolTerminalClosure({ ...f.input, journalBytes: selected }), /closure-expected-bytes-changed/u);
});
for (const mode of ["capture", "collector"]) {
  void test(`${mode} rejects an actual FIFO swapped between lstat and open`, async (context) => {
    const f = await closureFixture(), original = fsPromises.open;
    const path = mode === "capture" ? f.input.journalBytes.artifact.path : f.input.envelope.body.evidence.savedReadRaw.path;
    let replaced = false;
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
      if (String(args[0]).endsWith(basename(path))) {
        assert.equal(replaced, false); assert.equal(typeof args[1], "number");
        // oxlint-disable-next-line eslint/no-bitwise -- The actual fixed file open must carry this safety flag before a FIFO is installed.
        assert.ok(typeof args[1] === "number" && (args[1] & constants.O_NONBLOCK) !== 0);
        await rename(path, `${path}.regular`);
        await makeFifo(path); replaced = true;
      }
      return Reflect.apply(original, fsPromises, args);
    });
    syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
    await assert.rejects(mode === "capture" ? captureClosedSymbolJournalBytes(f.input.journal) : observeClosedSymbolTerminalClosure(f.input),
      mode === "capture" ? /closure-journal-opened-identity/u : /closure-opened-file-changed/u);
    assert.equal(replaced, true);
  });
}
for (const field of ["operationId", "journalSemanticSha256", "profile", "path", "bytes", "sha256", "extra"]) {
  void test(`fixed captured ${field} binding refuses malformed substitution`, async () => {
    const f = await closureFixture(), selected = structuredClone(f.input.journalBytes);
    if (field === "path" || field === "bytes" || field === "sha256") { Object.assign(selected.artifact, { [field]: field === "bytes" ? 0 : "not-a-matching-value" }); }
    else { Object.assign(selected, { [field]: "not-a-matching-value" }); }
    assert.throws(() => deriveClosedSymbolTerminalClosure({ ...f.input, journalBytes: selected }));
  });
}
