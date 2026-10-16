// Exercise maintained source with real private filesystem/crypto operations;
// Only fixed pin bytes and the independent base profile change in the private VM.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { link, lstat, mkdir, mkdtemp, open, readFile, realpath, rename, symlink, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION, CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import type { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "../src/current-disposable-open-profile.ts";

interface Fixture {
  readonly assetsRoot: string;
  readonly files: readonly { path: string; bytes: Buffer }[];
  readonly state: { baseCalls: number; opened: string[]; afterOpen?: (path: string) => Promise<void>;
    afterRealpath?: (path: string, count: number) => Promise<void> };
  readonly persistence: typeof verifyCurrentSymbolPersistenceImplementation;
  readonly preflight: typeof verifyCurrentProjectOnlySymbolPreflightImplementation;
}

async function fixture(): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-persistence-profile-"));
  const assetsRoot = join(root, "app", "assets");
  await mkdir(assetsRoot, { recursive: true });
  const files: { path: string; bytes: Buffer }[] = [];
  let program = await readFile(new URL("../src/current-disposable-open-profile.ts", import.meta.url), "utf8");
  for (const pin of [...CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION]) {
    const bytes = Buffer.from(`Synthetic inert dependency: ${pin.relativePath}`), path = resolve(assetsRoot, pin.relativePath);
    await mkdir(dirname(path), { recursive: true }); await writeFile(path, bytes, { mode: 0o600, flag: "wx" });
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    assert.ok(program.includes(pin.sha256));
    const literal = pin.bytes < 10_000 ? String(pin.bytes) : pin.bytes.toLocaleString("en-US").replaceAll(",", "_");
    assert.ok(program.includes(`bytes: ${literal}`));
    program = program.replace(pin.sha256, sha256).replace(`bytes: ${literal}`, `bytes: ${String(bytes.length)}`);
    files.push({ path, bytes });
  }
  program = stripTypeScriptTypes(program).replaceAll(/^import[\s\S]*?;\n/gmu, "")
    .replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "")
    .replaceAll("await verifyCurrentDisposableOpenImplementation(assetsRoot);", "await fixtureBase(assetsRoot);");
  const realpaths = new Map<string, number>(), state: Fixture["state"] = { baseCalls: 0, opened: [] };
  const context = vm.createContext({ createHash, constants, lstat, dirname, isAbsolute, resolve, Buffer, Error,
    CURRENT_UI_IMPLEMENTATION: Object.freeze({ synthetic: true }),
    fixtureBase(path: string): Promise<void> { assert.equal(path, assetsRoot); state.baseCalls += 1; return Promise.resolve(); },
    async open(path: string, flags: number): Promise<Awaited<ReturnType<typeof open>>> {
      state.opened.push(path); const handle = await open(path, flags);
      try { await state.afterOpen?.(path); return handle; } catch (error) { await handle.close(); throw error; }
    },
    async realpath(path: string): Promise<string> {
      const count = (realpaths.get(path) ?? 0) + 1, result = await realpath(path);
      realpaths.set(path, count); await state.afterRealpath?.(path, count); return result;
    },
  });
  const loaded: unknown = vm.runInContext(`${program}\n({ persistence: verifyCurrentSymbolPersistenceImplementation, preflight: verifyCurrentProjectOnlySymbolPreflightImplementation });`, context);
  assert.ok(loaded !== null && typeof loaded === "object" && "persistence" in loaded && typeof loaded.persistence === "function" &&
    "preflight" in loaded && typeof loaded.preflight === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Maintained functions run only in this private fixture realm; no production injection API exists.
  return { assetsRoot, files, state, ...loaded as Pick<Fixture, "persistence" | "preflight"> };
}

function selected(f: Fixture, index = 3): Fixture["files"][number] {
  const file = f.files[index]; assert.ok(file !== undefined); return file;
}

void test("persistence dependency pins and resolver exclusions are fixed and deeply frozen", () => {
  assert.equal(CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files.length, 4);
  assert.deepEqual(CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files.map((pin) => pin.sha256), [
    "a7d2279dfd425ee3f2f368e5160955491333967f7207ff3690a747a11f049985",
    "e453648b76b80be1334dc49bf3ba19672f7acbd11b5d8b1ebe0cab08e3c5edf3",
    "946769d049dacf8a564ab0f7076e1762ebae7ee7aba43d8ac5d72103089b6ccf",
    "a851d31983fd21ee3821b1a0ca148c013029f96c6e0d31afc400e6a62ea7b482",
  ]);
  assert.equal(Object.isFrozen(CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION), true);
  assert.equal(Object.isFrozen(CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files), true);
  assert.equal(Object.isFrozen(CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.absent), true);
  for (const pin of CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files) { assert.equal(Object.isFrozen(pin), true); }
});

void test("persistence admission verifies four runtime dependencies without changing their bytes", async () => {
  const f = await fixture();
  await f.persistence(f.assetsRoot);
  assert.equal(f.state.baseCalls, 1);
  assert.deepEqual(f.state.opened, f.files.slice(0, 4).map((file) => file.path));
  for (const file of f.files) { assert.deepEqual(await readFile(file.path), file.bytes); }
});

for (let index = 0; index < 4; index += 1) {
  void test(`persistence admission rejects exact dependency ${String(index)} byte drift`, async () => {
    const f = await fixture(), file = selected(f, index);
    const changed = Buffer.from(file.bytes);
    changed[0] = 0x58; await writeFile(file.path, changed);
    await assert.rejects(f.persistence(f.assetsRoot), /differs from its reviewed profile/u);
  });
}

for (const candidate of CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.absent) {
  void test(`persistence admission rejects higher-precedence resolution candidate ${candidate}`, async () => {
    const f = await fixture(); await writeFile(resolve(f.assetsRoot, candidate), "unreviewed module");
    await assert.rejects(f.persistence(f.assetsRoot), /differs from its reviewed profile/u);
    assert.equal(f.state.baseCalls, 0); assert.deepEqual(f.state.opened, []);
  });
}

for (const kind of ["file-link", "ancestor-link", "hardlink", "dangling-shadow"] as const) {
  void test(`persistence admission rejects ${kind} before dependency reads`, async () => {
    const f = await fixture(), file = selected(f);
    if (kind === "file-link") { await rename(file.path, `${file.path}.original`); await symlink(`${file.path}.original`, file.path); }
    if (kind === "ancestor-link") { const parent = dirname(file.path); await rename(parent, `${parent}.original`); await symlink(`${parent}.original`, parent); }
    if (kind === "hardlink") { await link(file.path, `${file.path}.alias`); }
    if (kind === "dangling-shadow") { await symlink(join(f.assetsRoot, "does-not-exist"), resolve(f.assetsRoot, "../node_modules/sqlite3.js")); }
    await assert.rejects(f.persistence(f.assetsRoot), /differs from its reviewed profile/u);
    assert.equal(f.state.baseCalls, 0); assert.deepEqual(f.state.opened, []);
  });
}

for (const kind of ["descriptor-replacement", "late-replacement", "late-shadow", "late-ancestor"] as const) {
  void test(`persistence admission rejects ${kind} across awaited verification boundaries`, async () => {
    const f = await fixture(), file = selected(f);
    const replace = async (): Promise<void> => { await rename(file.path, `${file.path}.original`); await writeFile(file.path, file.bytes); };
    if (kind === "descriptor-replacement") { f.state.afterOpen = async (path): Promise<void> => { if (path === file.path) { await replace(); } }; }
    else {
      f.state.afterRealpath = async (path, count): Promise<void> => {
        if (path !== file.path || count !== 3) { return; }
        if (kind === "late-replacement") { await replace(); }
        if (kind === "late-shadow") { await writeFile(resolve(f.assetsRoot, "../node_modules/sqlite3.json"), "{}"); }
        if (kind === "late-ancestor") { const parent = dirname(file.path); await rename(parent, `${parent}.original`); await symlink(`${parent}.original`, parent); }
      };
    }
    await assert.rejects(f.persistence(f.assetsRoot), /differs from its reviewed profile/u);
  });
}

void test("project-only symbol preflight verifies its base once plus SCH and WS, not SQLite", async () => {
  const f = await fixture();
  await writeFile(selected(f).path, "unreviewed SQLite is outside this read-only profile");
  await f.preflight(f.assetsRoot);
  assert.equal(f.state.baseCalls, 1); assert.deepEqual(f.state.opened, f.files.slice(4).map((file) => file.path));
});
