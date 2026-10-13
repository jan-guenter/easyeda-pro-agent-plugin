import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import type { ReadStream } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";
import { WITNESS_NATIVE_PINS, WITNESS_NATIVE_PINS_SHA256, verifyWitnessNativeProfile } from "../src/closed-symbol-native-profile.ts";
import { sha256Json } from "../src/core.ts";

void test("native profile stops growing stream at retained byte size before a second chunk", async (context) => {
  const root = await fsPromises.mkdtemp(join(syntheticSqlRoot(), "synthetic-native-program-"));
  const app = join(root, "app.js"), assets = join(root, "assets");
  await fsPromises.mkdir(assets, { mode: 0o700 }); await fsPromises.writeFile(app, "x", { mode: 0o600 });
  const open = fsPromises.open; let consumed = 0;
  async function* syntheticChunks(): AsyncGenerator<Buffer> {
    await Promise.resolve(); consumed += 1; yield Buffer.from("xx");
    consumed += 1; throw new Error("synthetic unbounded second chunk reached");
  }
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    const handle = await open(...args); assert.equal(args[0], app);
    context.mock.method(handle, "createReadStream", (): ReadStream => {
      const stream = syntheticChunks();
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test supplies only the async byte iterator consumed by the fixed source hasher; no file authority is constructed.
      return stream as unknown as ReadStream;
    }); return handle;
  }); syncBuiltinESMExports();
  try { await assert.rejects(verifyWitnessNativeProfile(assets), /Witness native program profile/u); assert.equal(consumed, 1); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
});

void test("native profile pins are immutable exact program paths, not synthetic source qualification", () => {
  assert.equal(Object.isFrozen(WITNESS_NATIVE_PINS), true); assert.equal(WITNESS_NATIVE_PINS.length, 6);
  assert.equal(WITNESS_NATIVE_PINS_SHA256, sha256Json(WITNESS_NATIVE_PINS));
  assert.equal(new Set(WITNESS_NATIVE_PINS.map((pin) => `${pin.root}/${pin.relativePath}`)).size, 6);
  for (const pin of WITNESS_NATIVE_PINS) {
    assert.equal(Object.isFrozen(pin), true); assert.match(pin.sha256, /^[a-f0-9]{64}$/u);
    assert.ok(!pin.relativePath.includes("..") && !pin.relativePath.startsWith("/"));
    assert.throws(() => { Object.defineProperty(pin, "sha256", { value: "0".repeat(64) }); });
  }
});

for (const kind of ["empty", "wrong-bytes", "directory", "symlink"] as const) {
  void test(`native profile refuses ${kind} source without admitting synthetic hashes`, async () => {
    const root = await fsPromises.mkdtemp(join(syntheticSqlRoot(), "synthetic-profile-refusal-"));
    const app = join(root, "app.js"), assets = join(root, "assets");
    await fsPromises.mkdir(assets, { mode: 0o700 });
    if (kind === "directory") { await fsPromises.mkdir(app, { mode: 0o700 }); }
    else if (kind === "symlink") {
      const target = join(root, "synthetic-source.txt"); await fsPromises.writeFile(target, "synthetic", { mode: 0o600 }); await fsPromises.symlink(target, app);
    } else { await fsPromises.writeFile(app, kind === "empty" ? "" : "synthetic", { mode: 0o600 }); }
    await assert.rejects(verifyWitnessNativeProfile(assets), /Witness native program profile/u);
  });
}

void test("native profile refuses relative, missing and aliased asset roots", async () => {
  const root = await fsPromises.mkdtemp(join(syntheticSqlRoot(), "synthetic-profile-root-"));
  const alias = join(root, "alias"), assets = join(root, "assets");
  await fsPromises.mkdir(assets, { mode: 0o700 }); await fsPromises.symlink(assets, alias);
  await assert.rejects(verifyWitnessNativeProfile("relative-assets"), /Witness native program profile/u);
  await assert.rejects(verifyWitnessNativeProfile(join(root, "missing")), /ENOENT/u);
  await assert.rejects(verifyWitnessNativeProfile(alias), /Witness native program profile/u);
});
