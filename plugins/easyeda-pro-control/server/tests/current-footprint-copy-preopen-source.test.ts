/* oxlint-disable import/max-dependencies -- Run the maintained raw reader with real filesystem/crypto operations; only its original-copy issuer is substituted inside a private test realm. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdtemp, open, readFile, rename, symlink, truncate, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { yieldProofEventLoop } from "../src/cooperative-proof.ts";
import type { CurrentFootprintCopyClosedSnapshot } from "../src/current-footprint-copy-closed-snapshot.ts";
import type { Inventory } from "../src/closed-sql-equality.ts";
import type { verifyCurrentFootprintCopyPosteditPreopenSource } from "../src/current-footprint-copy-preopen-source.ts";
import type { CurrentFootprintCopyGenerationOwner } from "../src/current-pcb-diagnostic-owner.ts";

interface Fixture {
  readonly source: string;
  readonly bytes: Buffer;
  readonly copy: CurrentFootprintCopyClosedSnapshot;
  readonly owner: CurrentFootprintCopyGenerationOwner;
  readonly inventory: Inventory;
  readonly state: { owned: boolean; yields: number; afterYield?: () => Promise<void> };
  readonly run: typeof verifyCurrentFootprintCopyPosteditPreopenSource;
}
async function sourceBinding(source: string, bytes: Buffer): Promise<CurrentFootprintCopyClosedSnapshot> {
  const sha256 = createHash("sha256").update(bytes).digest("hex"), stat = await lstat(source, { bigint: true });
  const binding = { checkpoint: { source, sourceSha256: sha256, sourceIdentity: { dev: String(stat.dev), ino: String(stat.ino),
    ctimeNs: String(stat.ctimeNs), birthtimeNs: String(stat.birthtimeNs) } }, sourceIdentity: { device: String(stat.dev), inode: String(stat.ino), size: String(stat.size), mtimeNs: String(stat.mtimeNs),
      ctimeNs: String(stat.ctimeNs), birthtimeNs: String(stat.birthtimeNs), mode: String(stat.mode), uid: String(stat.uid), gid: String(stat.gid), links: String(stat.nlink) }, inventory: {} };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only fields consumed by the maintained raw-file reader are supplied to this private issuer fixture.
  return binding as CurrentFootprintCopyClosedSnapshot;
}
async function fixture(oversized = false): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-footprint-preopen-source-")), source = join(root, "fixture.eprj2");
  const bytes = Buffer.alloc(1_048_607, 0x31);
  await writeFile(source, bytes, { mode: 0o600, flag: "wx" });
  if (oversized) { await truncate(source, 268_435_457); }
  const copy = await sourceBinding(source, bytes);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Identity-only engine sentinel for the private VM issuer, not an injectable production verifier.
  const owner = {} as CurrentFootprintCopyGenerationOwner;
  const inventory = copy.inventory;
  const state: Fixture["state"] = { owned: true, yields: 0 }, text = JSON.stringify(copy);
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-copy-preopen-source.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const scope = vm.createContext({ createHash, constants, lstat, open, basename, dirname, isAbsolute, resolve, process, Buffer,
    Error, AggregateError, Object, Number, Promise,
    requireCurrentFootprintCopyClosedSnapshot(selectedOwner: unknown, value: unknown): CurrentFootprintCopyClosedSnapshot {
      assert.equal(value, inventory); assert.equal(selectedOwner, owner); assert.equal(state.owned, true, "original copy lost"); assert.equal(JSON.stringify(copy), text); return copy;
    },
    async yieldProofEventLoop(): Promise<void> {
      state.yields += 1; await yieldProofEventLoop();
      if (state.yields === 1) { await state.afterYield?.(); }
    },
  });
  const loaded: unknown = vm.runInContext(`${program}\n({run:verifyCurrentFootprintCopyPosteditPreopenSource});`, scope);
  assert.ok(typeof loaded === "object" && loaded !== null && "run" in loaded && typeof loaded.run === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Maintained source function is evaluated only in this private fixture realm.
  const readers = loaded as Pick<Fixture, "run">;
  return { source, bytes, copy, owner, inventory, state, ...readers };
}
function refused(error: unknown, text: RegExp): boolean {
  return error instanceof Error && (text.test(error.message) || (error instanceof AggregateError && error.errors.some((nested: unknown) => refused(nested, text))));
}

void test("Footprint preopen source hashes original post-close bytes cooperatively without reviving old closure authority", async () => {
  const f = await fixture();
  const observed = await f.run(f.owner, f.inventory);
  assert.equal(observed.sourceSha256, f.copy.checkpoint.sourceSha256); assert.equal(observed.bytes, f.bytes.length);
  assert.equal(observed.sourceMatchesClosedPostedit, true); assert.equal(observed.sidecarsObservedAbsent, true);
  assert.equal(observed.scope, "point-in-time-before-project-opening");
  assert.equal(observed.ongoingSourceContinuity, false); assert.equal(observed.startupQualified, false);
  assert.equal(observed.writerAuthority, false); assert.equal(observed.executionAuthorized, false);
  assert.equal(Object.isFrozen(observed), true); assert.equal(Object.isFrozen(observed.sourceIdentity), true);
  assert.equal(f.state.yields, 2); assert.deepEqual(await readFile(f.source), f.bytes);
  await assert.rejects(f.run(f.owner, structuredClone(f.inventory)), /reference-equal/u);
});

void test("Footprint preopen source refuses replaced identity, sidecars, symlink parents and oversized originals before hashing", async () => {
  for (const kind of ["replacement", "sidecar", "symlink-parent", "oversized"] as const) {
    const f = await fixture(kind === "oversized");
    if (kind === "replacement") { await rename(f.source, `${f.source}.old`); await writeFile(f.source, f.bytes); }
    if (kind === "sidecar") { await writeFile(`${f.source}-wal`, "synthetic pending writes"); }
    if (kind === "symlink-parent") { const parent = dirname(f.source); await rename(parent, `${parent}-moved`); await symlink(`${parent}-moved`, parent); }
    await assert.rejects(f.run(f.owner, f.inventory), (error: unknown) => refused(error, /identity or size|sidecar|real directory/u));
    assert.equal(f.state.yields, 0);
  }
});

void test("Footprint preopen source detects changes and original-copy loss across the cooperative hash boundary", async () => {
  for (const kind of ["bytes", "replacement", "late-sidecar", "issuer"] as const) {
    const f = await fixture();
    f.state.afterYield = async (): Promise<void> => {
      if (kind === "bytes") { const changed = Buffer.from(f.bytes); changed[changed.length - 1] = 0x32; await writeFile(f.source, changed); }
      if (kind === "replacement") { await rename(f.source, `${f.source}.old`); await writeFile(f.source, f.bytes); }
      if (kind === "late-sidecar") { await writeFile(`${f.source}-journal`, "synthetic pending writes"); }
      if (kind === "issuer") { f.state.owned = false; }
    };
    await assert.rejects(f.run(f.owner, f.inventory), (error: unknown) => refused(error, /hash differs|descriptor or path changed|sidecar|original copy lost/u));
  }
});
