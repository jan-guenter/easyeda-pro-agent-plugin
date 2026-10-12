import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fsPromises, { appendFile, chmod, link, lstat, mkdir, mkdtemp, readFile, rename, symlink, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, readArtifact, readExactUtf8Artifact } from "../src/artifacts.ts";

type Descriptor = Parameters<typeof readExactUtf8Artifact>[0];
async function fixture(bytes: Buffer): Promise<Descriptor> {
  assert.match(controlDataDirectory(), /easyeda-test-control-/u);
  const directory = await mkdtemp(join(controlDataDirectory(), "exact-utf8-"));
  const path = join(directory, "payload.txt");
  await writeFile(path, bytes, { mode: 0o600, flag: "wx" });
  return { path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}
for (const text of ["", "ascii", "Ω中😀", "\uFFFD", "before\uFFFD😀after", "\uFEFFliteral BOM", "a".repeat(256 * 1024)]) {
  void test(`exact reader preserves valid UTF-8 ${Buffer.byteLength(text)} bytes ${JSON.stringify(text.slice(0, 16))}`, async () => {
    const descriptor = await fixture(Buffer.from(text));
    const result = await readExactUtf8Artifact(descriptor);
    assert.deepEqual(result, { ...descriptor, text });
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Buffer.byteLength(result.text), descriptor.bytes);
  });
}
for (const bytes of [[0xF0, 0x9F, 0x92], [0x80], [0xC0, 0xAF], [0xED, 0xA0, 0x80], [0xF4, 0x90, 0x80, 0x80], [0xEF, 0xBF, 0xBD, 0xF0, 0x9F, 0x92]]) {
  void test(`correct hash does not admit malformed UTF-8 ${bytes.join("-")}`, async () => {
    const descriptor = await fixture(Buffer.from(bytes));
    await assert.rejects(readExactUtf8Artifact(descriptor), /encoded data|encoding/u);
  });
}
void test("lossy partial display remains unchanged but is not whole-file integrity", async () => {
  const descriptor = await fixture(Buffer.from("\uFFFD"));
  await writeFile(descriptor.path, Buffer.from([0xF0, 0x9F, 0x92]));
  const display = await readArtifact(descriptor.path, 0, descriptor.bytes);
  assert.equal(display.text, "\uFFFD");
  assert.equal(createHash("sha256").update(display.text).digest("hex"), descriptor.sha256);
  await assert.rejects(readExactUtf8Artifact(descriptor), /raw bytes/u);
});
for (const changed of ["hash", "short", "long", "negative", "fraction", "over-limit", "uppercase-hash", "path-type", "accessor"] as const) {
  void test(`invalid exact descriptor ${changed} refuses`, async () => {
    const descriptor = await fixture(Buffer.from("abc"));
    const value = { ...descriptor };
    if (changed === "hash") { value.sha256 = "f".repeat(64); }
    if (changed === "uppercase-hash") { value.sha256 = value.sha256.toUpperCase(); }
    if (changed === "short") { value.bytes -= 1; }
    if (changed === "long") { value.bytes += 1; }
    if (changed === "negative") { value.bytes = -1; }
    if (changed === "fraction") { value.bytes = 0.5; }
    if (changed === "over-limit") { value.bytes = 256 * 1024 + 1; }
    if (changed === "path-type") { Object.defineProperty(value, "path", { value: false }); }
    if (changed === "accessor") { Object.defineProperty(value, "sha256", { get(): string { assert.fail("Getter must never run."); } }); }
    await assert.rejects(readExactUtf8Artifact(value));
  });
}
void test("missing parent and missing final file remain absent", async () => {
  const path = join(controlDataDirectory(), "exact-reader-missing-parent", "child.txt");
  const sha256 = createHash("sha256").digest("hex");
  await assert.rejects(readExactUtf8Artifact({ path, bytes: 0, sha256 }), { code: "ENOENT" });
  const missingParent = join(controlDataDirectory(), "exact-reader-missing-parent");
  await assert.rejects(lstat(missingParent), { code: "ENOENT" });
});
for (const changed of ["symlink", "hardlink", "directory"] as const) {
  void test(`exact reader rejects ${changed} path`, async () => {
    const descriptor = await fixture(Buffer.from("safe"));
    const alias = `${descriptor.path}.alias`;
    if (changed === "symlink") { await symlink(descriptor.path, alias); }
    if (changed === "hardlink") { await link(descriptor.path, alias); }
    if (changed === "directory") { await mkdir(alias); }
    await assert.rejects(readExactUtf8Artifact({ ...descriptor, path: alias }), /regular|single-link|symbolic|symlink/u);
  });
}
for (const changed of ["contents", "same-byte-inode", "parent"] as const) {
  void test(`descriptor and current path reject ${changed} changed during reading`, async (context) => {
    const descriptor = await fixture(Buffer.from("safe")), originalOpen = fsPromises.open;
    let injected = false;
    const spy = context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
      const handle = await originalOpen(...args);
      if (String(args[0]).endsWith("/payload.txt")) {
        const originalRead = handle.read.bind(handle);
        context.mock.method(handle, "read", async (...readArgs: Parameters<typeof originalRead>) => {
          const result = await originalRead(...readArgs);
          if (!injected) {
            injected = true;
            if (changed === "contents") { await writeFile(descriptor.path, "evil"); }
            if (changed === "same-byte-inode") { await rename(descriptor.path, `${descriptor.path}.old`); await writeFile(descriptor.path, "safe", { mode: 0o600 }); }
            if (changed === "parent") {
              const parent = descriptor.path.slice(0, -"/payload.txt".length);
              await rename(parent, `${parent}.old`); await mkdir(parent, { mode: 0o700 }); await writeFile(descriptor.path, "safe", { mode: 0o600 });
            }
          }
          return result;
        });
      }
      return handle;
    });
    syncBuiltinESMExports();
    try { await assert.rejects(readExactUtf8Artifact(descriptor), /changed|replaced/u); }
    finally { spy.mock.restore(); syncBuiltinESMExports(); }
    assert.equal(injected, true);
  });
}
void test("growth between open and allocation is rejected before the first data read", async (context) => {
  const descriptor = await fixture(Buffer.from("safe")), originalOpen = fsPromises.open;
  let reads = 0, stats = 0;
  const spy = context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
    const handle = await originalOpen(...args);
    if (String(args[0]).endsWith("/payload.txt")) {
      const originalStat = handle.stat.bind(handle);
      context.mock.method(handle, "stat", async (...statArgs: Parameters<typeof originalStat>) => {
        stats += 1; if (stats === 2) { await appendFile(descriptor.path, "extra"); }
        return originalStat(...statArgs);
      });
      const originalRead = handle.read.bind(handle);
      context.mock.method(handle, "read", (...readArgs: Parameters<typeof originalRead>) => { reads += 1; return originalRead(...readArgs); });
    }
    return handle;
  });
  syncBuiltinESMExports();
  try { await assert.rejects(readExactUtf8Artifact(descriptor), /byte bound/u); }
  finally { spy.mock.restore(); syncBuiltinESMExports(); }
  assert.equal(reads, 0); assert.equal(stats, 2);
});
void test("descriptor snapshot cannot redirect the opened read after an await", async (context) => {
  const descriptor = await fixture(Buffer.from("first")), peer = await fixture(Buffer.from("second"));
  const mutable = { ...descriptor }, originalOpen = fsPromises.open;
  const spy = context.mock.method(fsPromises, "open", (...args: Parameters<typeof originalOpen>) => {
    if (String(args[0]).endsWith("/payload.txt")) { Object.assign(mutable, peer); }
    return originalOpen(...args);
  });
  syncBuiltinESMExports();
  try { assert.deepEqual(await readExactUtf8Artifact(mutable), { ...descriptor, text: "first" }); }
  finally { spy.mock.restore(); syncBuiltinESMExports(); }
  assert.equal(await readFile(peer.path, "utf8"), "second");
  await chmod(descriptor.path, 0o600);
});
