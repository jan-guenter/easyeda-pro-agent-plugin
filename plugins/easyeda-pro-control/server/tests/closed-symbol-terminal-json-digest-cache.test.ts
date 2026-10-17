/** Pure digest reuse plus real synthetic-file observations, never live admission. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fsPromises, { readFile, writeFile } from "node:fs/promises";
import { registerHooks, stripTypeScriptTypes, syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord, sha256Json } from "../src/core.ts";
import type { observeClosedSymbolTerminalClosure, revalidateClosedSymbolTerminalClosure } from "../src/closed-symbol-terminal-closure-observer.ts";
/* oxlint-disable node/no-top-level-await -- Install the synthetic manifest resolver before the fixed closure consumer, without changing production issuers. */

const observerUrl = new URL("../src/closed-symbol-terminal-closure-observer.ts", import.meta.url);
const coreUrl = new URL("../src/core.ts", import.meta.url), syntheticCore = new URL("helpers/closed-symbol-terminal-closure-synthetic-core.ts", import.meta.url);
registerHooks({ resolve(specifier, context, nextResolve) {
  const selected = nextResolve(specifier, context);
  if (selected.url === coreUrl.href && context.parentURL === new URL("../src/closed-symbol-terminal-closure-plan.ts", import.meta.url).href) {
    return { url: syntheticCore.href, shortCircuit: true };
  }
  return selected;
} });
const { closureFixture } = await import("./helpers/closed-symbol-terminal-closure-fixture.ts");
const { deriveClosedSymbolTerminalClosure, ClosureEvidenceChangedError } = await import("../src/closed-symbol-terminal-closure-plan.ts");
interface Observer {
  readonly observeClosedSymbolTerminalClosure: typeof observeClosedSymbolTerminalClosure;
  readonly revalidateClosedSymbolTerminalClosure: typeof revalidateClosedSymbolTerminalClosure;
}
function isObserver(value: unknown): value is Observer {
  return isRecord(value) && typeof value["observeClosedSymbolTerminalClosure"] === "function" &&
    typeof value["revalidateClosedSymbolTerminalClosure"] === "function";
}
let sequence = 0;
async function freshObserver(): Promise<Observer> {
  sequence += 1;
  const loaded: unknown = await import(`${observerUrl.href}?digest-test=${String(sequence)}`);
  assert.ok(isObserver(loaded)); return loaded;
}
function bytesDigest(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }

interface DigestFixture {
  readonly digest: (bytes: Buffer, sha256: string) => string;
  readonly size: () => number;
  readonly capacity: number;
  readonly parses: () => number;
}
async function digestFixture(): Promise<DigestFixture> {
  const source = stripTypeScriptTypes(await readFile(observerUrl, "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  let parses = 0;
  const loaded: unknown = runInNewContext(`${source}\n({ digest: jsonDigest, size: () => jsonDigests.size, capacity: MAX_JSON_DIGEST_ENTRIES });`, {
    Buffer, TextDecoder, ClosureEvidenceChangedError, sha256Json,
    JSON: { parse(text: string): unknown { parses += 1; return JSON.parse(text) as unknown; } },
  });
  assert.ok(isRecord(loaded) && typeof loaded["digest"] === "function" && typeof loaded["size"] === "function" &&
    typeof loaded["capacity"] === "number");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Execute the unchanged private helper in an isolated VM for accounting; no test export or callback is added to production.
  const result = loaded as Omit<DigestFixture, "parses">;
  return { ...result, parses: (): number => parses };
}

void test("JSON digest reuse keys exact bytes while equivalent formatting keeps equal canonical digests", async () => {
  const compact = Buffer.from('{"a":1,"b":2}'), f = await digestFixture(), pretty = Buffer.from('{\n "b":2, "a":1\n}\n');
  const expected = sha256Json({ a: 1, b: 2 });
  assert.notEqual(bytesDigest(compact), bytesDigest(pretty));
  for (const bytes of [compact, compact, pretty, pretty]) { assert.equal(f.digest(bytes, bytesDigest(bytes)), expected); }
  assert.equal(f.parses(), 2); assert.equal(f.size(), 2);
});

void test("invalid JSON and invalid UTF-8 never populate the digest cache", async () => {
  const f = await digestFixture();
  for (const bytes of [Buffer.from('{"unfinished":'), Buffer.from([0xC3, 0x28])]) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      assert.throws(() => f.digest(bytes, bytesDigest(bytes)), /closure-replayed-json-invalid/u);
      assert.equal(f.size(), 0);
    }
  }
  assert.equal(f.parses(), 2);
});

void test("full digest cache declines new entries without evicting useful residents", async () => {
  const f = await digestFixture(); assert.equal(f.capacity, 512);
  for (let index = 0; index < f.capacity; index += 1) {
    const bytes = Buffer.from(JSON.stringify({ index })); f.digest(bytes, bytesDigest(bytes));
  }
  const extra = Buffer.from('{"extra":true}'), resident = Buffer.from('{"index":0}');
  for (const bytes of [extra, extra, resident, resident]) { f.digest(bytes, bytesDigest(bytes)); }
  assert.equal(f.size(), f.capacity); assert.equal(f.parses(), f.capacity + 2);
});

void test("warm observer skips parsing but still reads every journal byte and returns no authority", async (context) => {
  const f = await closureFixture(), observer = await freshObserver(), path = f.input.journalBytes.artifact.path;
  const originalOpen = fsPromises.open, originalParse = JSON.parse, text = await readFile(path, "utf8");
  let parses = 0, readBytes = 0;
  context.mock.method(JSON, "parse", (...args: Parameters<typeof JSON.parse>): unknown => {
    if (args[0] === text) { parses += 1; }
    return Reflect.apply(originalParse, JSON, args) as unknown;
  });
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    if (String(args[0]).endsWith(basename(path))) {
      const originalRead = handle.read.bind(handle);
      context.mock.method(handle, "read", async (buffer: Buffer, offset: number, length: number, position: number) => {
        const result = await originalRead(buffer, offset, length, position); readBytes += result.bytesRead; return result;
      });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  const first = await observer.observeClosedSymbolTerminalClosure(f.input);
  assert.equal(parses, 1); assert.equal(readBytes, Buffer.byteLength(text));
  assert.deepEqual(await observer.revalidateClosedSymbolTerminalClosure(f.input, first), first);
  assert.equal(parses, 1); assert.equal(readBytes, 2 * Buffer.byteLength(text));
  assert.equal(first.executionAuthorized, false); assert.equal(first.completionProved, false); assert.equal(first.semanticValidationPerformed, false);
});

void test("warm observer rejects changed bytes before digest reuse and closes the changed descriptor", async (context) => {
  const f = await closureFixture(), observer = await freshObserver(), path = f.input.journalBytes.artifact.path;
  const first = await observer.observeClosedSymbolTerminalClosure(f.input);
  const bytes = await readFile(path); bytes[0] = 0; await writeFile(path, bytes);
  const originalOpen = fsPromises.open; let closed = 0;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
    const handle = await Reflect.apply(originalOpen, fsPromises, args);
    if (String(args[0]).endsWith(basename(path))) {
      const close = handle.close.bind(handle);
      context.mock.method(handle, "close", async () => { closed += 1; await close(); throw new Error("synthetic-secondary-close"); });
    }
    return handle;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(observer.revalidateClosedSymbolTerminalClosure(f.input, first),
    (error: unknown) => error instanceof ClosureEvidenceChangedError && error.message === "closure-expected-bytes-changed");
  assert.equal(closed, 1);
});

void test("warm cached bytes still compare against the current expected semantic digest", async () => {
  const f = await closureFixture(), observer = await freshObserver();
  await observer.observeClosedSymbolTerminalClosure(f.input);
  const event = f.input.events[18]; assert.ok(event !== undefined);
  Object.assign(event, { data: { changedAfterReplay: true }, dataSha256: sha256Json({ changedAfterReplay: true }) });
  await assert.rejects(observer.observeClosedSymbolTerminalClosure(f.input), /closure-replayed-json-changed/u);
});

void test("warm digest entries do not hide new sidecars or a changed runtime", async () => {
  const f = await closureFixture(), observer = await freshObserver();
  await observer.observeClosedSymbolTerminalClosure(f.input);
  const plan = deriveClosedSymbolTerminalClosure(f.input);
  const database = plan.roles.find((role) => role.database); assert.ok(database !== undefined);
  await writeFile(`${database.path}-wal`, "synthetic late sidecar", { flag: "wx", mode: 0o600 });
  await assert.rejects(observer.observeClosedSymbolTerminalClosure(f.input), /closure-sidecar-present/u);
  f.input.runtime = { ...f.input.runtime, nodeSha256: "0".repeat(64) };
  await assert.rejects(observer.observeClosedSymbolTerminalClosure(f.input), /closure-current-runtime-changed/u);
});
