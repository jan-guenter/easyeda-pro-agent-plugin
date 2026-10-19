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
import type { CurrentSchematicRenameBaseline } from "../src/current-schematic-rename-owner-baseline.ts";
import { verifyCurrentSchematicRenamePosteditPreopenSource, verifyCurrentSchematicRenamePreopenSource } from "../src/current-schematic-rename-preopen-source.ts";
import type { CurrentSchematicRenameSnapshot } from "../src/current-schematic-rename-snapshot.ts";
import type { EasyedaControlEngine } from "../src/engine.ts";

interface Fixture {
  readonly source: string;
  readonly bytes: Buffer;
  readonly copy: CurrentSchematicRenameBaseline;
  readonly engine: EasyedaControlEngine;
  readonly state: { owned: boolean; yields: number; afterYield?: () => Promise<void> };
  readonly run: typeof verifyCurrentSchematicRenamePreopenSource;
  readonly snapshot: CurrentSchematicRenameSnapshot;
  readonly runPostedit: typeof verifyCurrentSchematicRenamePosteditPreopenSource;
}
async function sourceBinding(source: string, bytes: Buffer): Promise<Pick<CurrentSchematicRenameBaseline, "checkpoint" | "copy">> {
  const sha256 = createHash("sha256").update(bytes).digest("hex"), stat = await lstat(source, { bigint: true });
  const binding = { checkpoint: { source, sourceSha256: sha256, sourceIdentity: { dev: String(stat.dev), ino: String(stat.ino),
    ctimeNs: String(stat.ctimeNs), birthtimeNs: String(stat.birthtimeNs) } }, copy: { source, sha256, bytes: Number(stat.size),
    sourceIdentity: { device: String(stat.dev), inode: String(stat.ino), size: String(stat.size), mtimeNs: String(stat.mtimeNs),
      ctimeNs: String(stat.ctimeNs), birthtimeNs: String(stat.birthtimeNs), mode: String(stat.mode), uid: String(stat.uid), gid: String(stat.gid), links: String(stat.nlink) } } };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only fields consumed by the maintained raw-file reader are supplied to this private issuer fixture.
  return binding as Pick<CurrentSchematicRenameBaseline, "checkpoint" | "copy">;
}
async function fixture(oversized = false, phase: "closed-edit" | "closed-verification" = "closed-edit"): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-schematic-preopen-source-")), source = join(root, "fixture.eprj2");
  const bytes = Buffer.alloc(1_048_607, 0x31);
  await writeFile(source, bytes, { mode: 0o600, flag: "wx" });
  if (oversized) { await truncate(source, 268_435_457); }
  const data = await sourceBinding(source, bytes);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The private VM issuer accepts only this exact synthetic copy and engine, never a production reader input.
  const copy = data as unknown as CurrentSchematicRenameBaseline;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This private VM issuer supplies only the fields consumed by the real raw-file reader, never a production snapshot.
  const snapshot = { ...data, phase } as unknown as CurrentSchematicRenameSnapshot;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Identity-only engine sentinel for the private VM issuer, not an injectable production verifier.
  const engine = {} as EasyedaControlEngine;
  const snapshotText = JSON.stringify(snapshot), state: Fixture["state"] = { owned: true, yields: 0 }, text = JSON.stringify(copy);
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-preopen-source.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const scope = vm.createContext({ createHash, constants, lstat, open, basename, dirname, isAbsolute, resolve, process, Buffer,
    Error, AggregateError, Object, Number, Promise,
    assertOriginalCurrentSchematicRenameBaseline(value: unknown, owner: unknown): void {
      assert.equal(value, copy); assert.equal(owner, engine); assert.equal(state.owned, true, "original copy lost"); assert.equal(JSON.stringify(copy), text);
    },
    assertOriginalCurrentSchematicRenameSnapshot(value: unknown, owner: unknown): void {
      assert.equal(value, snapshot); assert.equal(owner, engine); assert.equal(state.owned, true, "original snapshot lost"); assert.equal(JSON.stringify(snapshot), snapshotText);
    },
    async yieldProofEventLoop(): Promise<void> {
      state.yields += 1; await yieldProofEventLoop();
      if (state.yields === 1) { await state.afterYield?.(); }
    },
  });
  const loaded: unknown = vm.runInContext(`${program}\n({run:verifyCurrentSchematicRenamePreopenSource,runPostedit:verifyCurrentSchematicRenamePosteditPreopenSource});`, scope);
  assert.ok(typeof loaded === "object" && loaded !== null && "run" in loaded && typeof loaded.run === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Maintained source function is evaluated only in this private fixture realm.
  const readers = loaded as Pick<Fixture, "run" | "runPostedit">;
  return { source, bytes, copy, snapshot, engine, state, ...readers };
}
function refused(error: unknown, text: RegExp): boolean {
  return error instanceof Error && (text.test(error.message) || (error instanceof AggregateError && error.errors.some((nested: unknown) => refused(nested, text))));
}

void test("SCH preopen source hashes original post-close bytes cooperatively without reviving old closure authority", async () => {
  const f = await fixture();
  await assert.rejects(verifyCurrentSchematicRenamePreopenSource(f.engine, f.copy), /not issued unchanged/u);
  const observed = await f.run(f.engine, f.copy);
  assert.equal(observed.sourceSha256, f.copy.checkpoint.sourceSha256); assert.equal(observed.bytes, f.bytes.length);
  assert.equal(observed.sourceMatchesClosedBaseline, true); assert.equal(observed.sidecarsObservedAbsent, true);
  assert.equal(observed.scope, "point-in-time-before-project-opening");
  assert.equal(observed.ongoingSourceContinuity, false); assert.equal(observed.startupQualified, false);
  assert.equal(observed.writerAuthority, false); assert.equal(observed.executionAuthorized, false);
  assert.equal(Object.isFrozen(observed), true); assert.equal(Object.isFrozen(observed.sourceIdentity), true);
  assert.equal(f.state.yields, 2); assert.deepEqual(await readFile(f.source), f.bytes);
  await assert.rejects(f.run(f.engine, structuredClone(f.copy)), /reference-equal/u);
});

void test("SCH preopen source refuses replaced identity, sidecars, symlink parents and oversized originals before hashing", async () => {
  for (const kind of ["replacement", "sidecar", "symlink-parent", "oversized"] as const) {
    const f = await fixture(kind === "oversized");
    if (kind === "replacement") { await rename(f.source, `${f.source}.old`); await writeFile(f.source, f.bytes); }
    if (kind === "sidecar") { await writeFile(`${f.source}-wal`, "synthetic pending writes"); }
    if (kind === "symlink-parent") { const parent = dirname(f.source); await rename(parent, `${parent}-moved`); await symlink(`${parent}-moved`, parent); }
    await assert.rejects(f.run(f.engine, f.copy), (error: unknown) => refused(error, /identity or size|sidecar|real directory/u));
    assert.equal(f.state.yields, 0);
  }
});

void test("SCH preopen source detects changes and original-copy loss across the cooperative hash boundary", async () => {
  for (const kind of ["bytes", "replacement", "late-sidecar", "issuer"] as const) {
    const f = await fixture();
    f.state.afterYield = async (): Promise<void> => {
      if (kind === "bytes") { const changed = Buffer.from(f.bytes); changed[changed.length - 1] = 0x32; await writeFile(f.source, changed); }
      if (kind === "replacement") { await rename(f.source, `${f.source}.old`); await writeFile(f.source, f.bytes); }
      if (kind === "late-sidecar") { await writeFile(`${f.source}-journal`, "synthetic pending writes"); }
      if (kind === "issuer") { f.state.owned = false; }
    };
    await assert.rejects(f.run(f.engine, f.copy), (error: unknown) => refused(error, /hash differs|descriptor or path changed|sidecar|original copy lost/u));
  }
});

void test("SCH saved opening hashes only its original post-edit snapshot and refuses another phase or issuer", async () => {
  const f = await fixture();
  await assert.rejects(verifyCurrentSchematicRenamePosteditPreopenSource(f.engine, f.snapshot), /original snapshot/u);
  const observed = await f.runPostedit(f.engine, f.snapshot);
  assert.equal(observed.sourceMatchesClosedPostedit, true); assert.equal(observed.sourceSha256, f.snapshot.copy.sha256);
  assert.equal(observed.executionAuthorized, false); assert.equal(observed.ongoingSourceContinuity, false);
  await assert.rejects(f.runPostedit(f.engine, structuredClone(f.snapshot)), /reference-equal/u);
  const wrong = await fixture(false, "closed-verification");
  await assert.rejects(wrong.runPostedit(wrong.engine, wrong.snapshot), /post-edit snapshot/u); assert.equal(wrong.state.yields, 0);
  const lost = await fixture(); lost.state.afterYield = (): Promise<void> => { lost.state.owned = false; return Promise.resolve(); };
  await assert.rejects(lost.runPostedit(lost.engine, lost.snapshot), (error: unknown) => refused(error, /original snapshot lost/u));
});

