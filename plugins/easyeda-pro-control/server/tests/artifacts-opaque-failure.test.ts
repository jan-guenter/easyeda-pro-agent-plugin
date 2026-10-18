// Actual managed filesystem operations under the ordinary isolation preload.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rename,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { after, test } from "node:test";
import {
  controlRootCapability,
  publishManagedAttachmentExclusive,
  reserveEvidencePaths,
} from "../src/artifacts.ts";
import { isErrnoException } from "../src/core.ts";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";

type Kind = "reservation" | "attachment";
interface Files {
  readonly directory: string;
  readonly resultPath: string;
  readonly receiptPath: string;
  readonly attachmentPath: string;
}
interface Outcome {
  readonly rejected: boolean;
  readonly value?: unknown;
  readonly error?: unknown;
}

// oxlint-disable-next-line node/no-top-level-await -- Reprove the original preloaded identity, not an arbitrary environment path.
const { directory: root } = await assertTestIsolation();
// oxlint-disable-next-line node/no-top-level-await -- Verify the preload root before registering filesystem cases.
const rootInfo = await lstat(root);
assert.ok(rootInfo.isDirectory() && !rootInfo.isSymbolicLink());
// oxlint-disable-next-line eslint/no-bitwise -- This checks the exact private directory permission bits.
assert.equal(rootInfo.mode & 0o7777, 0o700);
assert.ok(process.getuid);
assert.equal(rootInfo.uid, process.getuid());
const payload = Buffer.from("owned synthetic attachment\n");
const hash = (value: Buffer): string => createHash("sha256").update(value).digest("hex");

async function fixture(): Promise<Files> {
  const directory = await mkdtemp(path.join(root, "opaque-case-"));
  return {
    directory,
    resultPath: path.join(directory, "result.json"),
    receiptPath: path.join(directory, "receipt.json"),
    attachmentPath: path.join(directory, "attachment.bin"),
  };
}
async function descriptorsUnder(directory: string): Promise<{ fd: string; target: string }[]> {
  const found: { fd: string; target: string }[] = [];
  for (const fd of await readdir("/proc/self/fd")) {
    try {
      const target = await readlink(`/proc/self/fd/${fd}`);
      if (target === directory || target.startsWith(`${directory}/`)) {
        found.push({ fd, target });
      }
    } catch (error) {
      if (!isErrnoException(error) || error.code !== "ENOENT") {
        throw error;
      }
    }
  }
  return found;
}
async function outcome(action: () => Promise<unknown>): Promise<Outcome> {
  try { return { rejected: false, value: await action() }; }
  catch (error) { return { rejected: true, error }; }
}
// oxlint-disable-next-line promise/prefer-await-to-callbacks -- These regressions exercise the two existing callback boundaries directly.
function invoke(kind: Kind, files: Files, callback: () => Promise<void>): ReturnType<typeof reserveEvidencePaths> | ReturnType<typeof publishManagedAttachmentExclusive> {
  return kind === "reservation"
    ? reserveEvidencePaths({ resultPath: files.resultPath, receiptPath: files.receiptPath }, callback)
    : publishManagedAttachmentExclusive(files.attachmentPath, "Synthetic attachment", payload, "synthetic", callback);
}
function cause(error: unknown, original: unknown): void {
  assert.ok(error instanceof Error);
  assert.ok(Object.hasOwn(error, "cause"));
  assert.equal(error.cause, original);
}
async function cleaned(files: Files): Promise<void> {
  assert.deepEqual(await readdir(files.directory), []);
  assert.deepEqual(await descriptorsUnder(files.directory), []);
}

after(async () => {
  const capability = await controlRootCapability();
  await capability.close();
});
for (const kind of ["reservation", "attachment"] as const) {
  for (const original of [undefined, null, false, 0]) {
    void test(`${kind} rejects ${String(original)} and closes/removes owned resources`, async () => {
      const files = await fixture();
      // oxlint-disable-next-line typescript/only-throw-error, typescript/require-await, eslint/require-await -- Exercise the actual async callback with an opaque rejection and no extra scheduling.
      const result = await outcome(() => invoke(kind, files, async () => { throw original; }));
      assert.equal(result.rejected, true);
      cause(result.error, original);
      await cleaned(files);
    });
  }
  void test(`${kind} retains an ordinary Error identity and diagnostics`, async () => {
    const files = await fixture();
    const original = new Error("ordinary diagnostic retained");
    // oxlint-disable-next-line typescript/require-await, eslint/require-await -- Preserve the immediate async callback rejection used by the original regression.
    const result = await outcome(() => invoke(kind, files, async () => { throw original; }));
    assert.equal(result.rejected, true);
    assert.equal(result.error, original);
    await cleaned(files);
  });
  void test(`${kind} contains a throwing primitive conversion after cleanup`, async () => {
    const files = await fixture();
    const conversion = new Error("conversion must not replace original");
    const original = { [Symbol.toPrimitive](): never { throw conversion; } };
    // oxlint-disable-next-line typescript/only-throw-error, typescript/require-await, eslint/require-await -- This callback deliberately rejects with an object whose conversion throws.
    const result = await outcome(() => invoke(kind, files, async () => { throw original; }));
    assert.equal(result.rejected, true);
    cause(result.error, original);
    await cleaned(files);
  });
  void test(`${kind} contains an instanceof trap after cleanup`, async () => {
    const files = await fixture();
    // oxlint-disable-next-line typescript/only-throw-error, eslint/no-throw-literal -- An opaque getPrototypeOf failure must not skip cleanup or replace the original callback cause.
    const original = new Proxy({}, { getPrototypeOf(): never { throw undefined; } });
    // oxlint-disable-next-line typescript/only-throw-error, typescript/require-await, eslint/require-await -- Preserve the original immediate opaque async rejection.
    const result = await outcome(() => invoke(kind, files, async () => { throw original; }));
    assert.equal(result.rejected, true);
    cause(result.error, original);
    await cleaned(files);
  });
  void test(`${kind} attempts all cleanup without formatting an opaque failure`, async () => {
    const files = await fixture();
    const selected = kind === "reservation" ? files.receiptPath : files.attachmentPath;
    const retained = `${selected}.retained`;
    let conversions = 0;
    const original = { [Symbol.toPrimitive](): never { conversions += 1; throw new Error("must not format before cleanup"); } };
    const result = await outcome(() => invoke(kind, files, async () => {
      await rename(selected, retained);
      await writeFile(selected, "synthetic replacement", { flag: "wx", mode: 0o600 });
      // oxlint-disable-next-line typescript/only-throw-error -- The cleanup path must retain this opaque failure without formatting it.
      throw original;
    }));
    assert.equal(result.rejected, true);
    assert.ok(result.error instanceof AggregateError);
    assert.equal(result.error.errors[0], original);
    cause(result.error, original);
    assert.equal(conversions, 0);
    assert.equal(await readFile(selected, "utf8"), "synthetic replacement");
    const retainedInfo = await lstat(retained);
    assert.ok(retainedInfo.isFile());
    if (kind === "reservation") {
      await assert.rejects(lstat(files.resultPath), { code: "ENOENT" });
    }
    assert.deepEqual(await descriptorsUnder(files.directory), []);
  });
  void test(`${kind} keeps the existing symlink-parent refusal diagnostic`, async () => {
    const files = await fixture();
    const nested = path.join(files.directory, "nested");
    const moved = path.join(files.directory, "moved");
    await mkdir(nested, { mode: 0o700 });
    const targets = {
      ...files,
      resultPath: path.join(nested, "result.json"),
      receiptPath: path.join(nested, "receipt.json"),
      attachmentPath: path.join(nested, "attachment.bin"),
    };
    const result = await outcome(() => invoke(kind, targets, async () => {
      await rename(nested, moved);
      await symlink(moved, nested, "dir");
    }));
    assert.equal(result.rejected, true);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /not a real directory/u);
    assert.deepEqual(await readdir(moved), []);
    assert.deepEqual(await descriptorsUnder(files.directory), []);
  });
  void test(`${kind} preserves normal successful output`, async () => {
    const files = await fixture();
    let callbacks = 0;
    // oxlint-disable-next-line typescript/require-await, eslint/require-await -- Preserve one immediately fulfilled callback without adding another await.
    const result = await invoke(kind, files, async () => { callbacks += 1; });
    assert.equal(callbacks, 1);
    if (kind === "reservation") {
      assert.ok("resultPath" in result && "receiptPath" in result);
      assert.equal(result.resultPath, files.resultPath);
      assert.equal(result.receiptPath, files.receiptPath);
      assert.deepEqual(await readdir(files.directory), ["receipt.json", "result.json"]);
      assert.equal(await readFile(files.resultPath, "utf8"), await readFile(files.receiptPath, "utf8"));
    } else {
      assert.ok("sha256" in result && "bytes" in result && "kind" in result);
      assert.equal(result.sha256, hash(payload));
      assert.equal(result.bytes, payload.length);
      assert.equal(result.kind, "synthetic");
      assert.deepEqual(await readFile(files.attachmentPath), payload);
    }
    assert.deepEqual(await descriptorsUnder(files.directory), []);
  });
}
