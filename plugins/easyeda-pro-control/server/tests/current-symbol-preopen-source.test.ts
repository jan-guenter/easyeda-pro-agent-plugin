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
import type { CurrentSymbolBaselineCopy, CurrentSymbolFinishSnapshot } from "../src/current-symbol-baseline-copy.ts";
import { verifyCurrentSymbolPosteditPreopenSource, verifyCurrentSymbolPreopenSource } from "../src/current-symbol-preopen-source.ts";
import type { EasyedaControlEngine } from "../src/engine.ts";

interface Fixture {
  readonly source: string;
  readonly bytes: Buffer;
  readonly copy: CurrentSymbolBaselineCopy;
  readonly snapshot: CurrentSymbolFinishSnapshot;
  readonly engine: EasyedaControlEngine;
  readonly state: { owned: boolean; snapshotOwned: boolean; yields: number; afterYield?: () => Promise<void> };
  readonly run: typeof verifyCurrentSymbolPreopenSource;
  readonly runPostedit: typeof verifyCurrentSymbolPosteditPreopenSource;
}
async function sourceBinding(source: string, bytes: Buffer): Promise<Pick<CurrentSymbolBaselineCopy, "checkpoint" | "copy">> {
  const sha256 = createHash("sha256").update(bytes).digest("hex"), stat = await lstat(source, { bigint: true });
  const binding = { checkpoint: { source, sourceSha256: sha256, sourceIdentity: { dev: String(stat.dev), ino: String(stat.ino),
    ctimeNs: String(stat.ctimeNs), birthtimeNs: String(stat.birthtimeNs) } }, copy: { source, sha256, bytes: Number(stat.size),
    sourceIdentity: { device: String(stat.dev), inode: String(stat.ino), size: String(stat.size), mtimeNs: String(stat.mtimeNs),
      ctimeNs: String(stat.ctimeNs), birthtimeNs: String(stat.birthtimeNs), mode: String(stat.mode), uid: String(stat.uid), gid: String(stat.gid), links: String(stat.nlink) } } };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only fields consumed by the maintained raw-file reader are supplied to this private issuer fixture.
  return binding as Pick<CurrentSymbolBaselineCopy, "checkpoint" | "copy">;
}
async function fixture(oversized = false, postedit = false): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-preopen-source-")), source = join(root, "fixture.eprj2");
  const bytes = Buffer.alloc(1_048_607, 0x31);
  await writeFile(source, bytes, { mode: 0o600, flag: "wx" });
  if (oversized) { await truncate(source, 268_435_457); }
  const data = await sourceBinding(source, bytes);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The private VM issuer accepts only this exact synthetic copy and engine, never a production reader input.
  const copy = data as unknown as CurrentSymbolBaselineCopy;
  if (postedit) { bytes.fill(0x32); await writeFile(source, bytes); }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Snapshot issuer is substituted only in this private realm; production issuance refusal is checked separately.
  const snapshot = { ...await sourceBinding(source, bytes), profile: "private.current-symbol-finish-snapshot.v1" } as CurrentSymbolFinishSnapshot;
  const original = Object.freeze({ baseline: copy });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Identity-only engine sentinel for the private VM issuer, not an injectable production verifier.
  const engine = {} as EasyedaControlEngine;
  const snapshotText = JSON.stringify(snapshot), state: Fixture["state"] = { owned: true, snapshotOwned: true, yields: 0 }, text = JSON.stringify(copy);
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-preopen-source.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const scope = vm.createContext({ createHash, constants, lstat, open, basename, dirname, isAbsolute, resolve, process, Buffer,
    Error, AggregateError, Object, Number, Promise,
    assertOriginalCurrentSymbolBaselineCopy(value: unknown, owner: unknown): void {
      assert.equal(value, copy); assert.equal(owner, engine); assert.equal(state.owned, true, "original copy lost"); assert.equal(JSON.stringify(copy), text);
    },
    assertOriginalCurrentSymbolFinishSnapshot(value: unknown, owner: unknown): typeof original {
      assert.equal(value, snapshot); assert.equal(owner, engine); assert.equal(state.snapshotOwned, true, "original snapshot lost");
      assert.equal(JSON.stringify(snapshot), snapshotText); return original;
    },
    async yieldProofEventLoop(): Promise<void> {
      state.yields += 1; await yieldProofEventLoop();
      if (state.yields === 1) { await state.afterYield?.(); }
    },
  });
  const loaded: unknown = vm.runInContext(`${program}\n({run:verifyCurrentSymbolPreopenSource,runPostedit:verifyCurrentSymbolPosteditPreopenSource});`, scope);
  assert.ok(typeof loaded === "object" && loaded !== null && "run" in loaded && typeof loaded.run === "function" &&
    "runPostedit" in loaded && typeof loaded.runPostedit === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Maintained source function is evaluated only in this private fixture realm.
  const readers = loaded as Pick<Fixture, "run" | "runPostedit">;
  return { source, bytes, copy, snapshot, engine, state, ...readers };
}
function refused(error: unknown, text: RegExp): boolean {
  return error instanceof Error && (text.test(error.message) || (error instanceof AggregateError && error.errors.some((nested: unknown) => refused(nested, text))));
}

void test("preopen source hashes original post-close bytes cooperatively without reviving old closure authority", async () => {
  const f = await fixture();
  await assert.rejects(verifyCurrentSymbolPreopenSource(f.engine, f.copy), /not issued unchanged/u);
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

void test("preopen source refuses replaced identity, sidecars, symlink parents and oversized originals before hashing", async () => {
  for (const kind of ["replacement", "sidecar", "symlink-parent", "oversized"] as const) {
    const f = await fixture(kind === "oversized");
    if (kind === "replacement") { await rename(f.source, `${f.source}.old`); await writeFile(f.source, f.bytes); }
    if (kind === "sidecar") { await writeFile(`${f.source}-wal`, "synthetic pending writes"); }
    if (kind === "symlink-parent") { const parent = dirname(f.source); await rename(parent, `${parent}-moved`); await symlink(`${parent}-moved`, parent); }
    await assert.rejects(f.run(f.engine, f.copy), (error: unknown) => refused(error, /identity or size|sidecar|real directory/u));
    assert.equal(f.state.yields, 0);
  }
});

void test("preopen source detects changes and original-copy loss across the cooperative hash boundary", async () => {
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

void test("post-edit preopen hashes its retained result rather than accepting the older baseline", async () => {
  const f = await fixture(false, true);
  assert.notEqual(f.snapshot.copy.sha256, f.copy.copy.sha256);
  await assert.rejects(verifyCurrentSymbolPosteditPreopenSource(f.engine, f.snapshot), /not issued/u);
  await assert.rejects(f.run(f.engine, f.copy), (error: unknown) => refused(error, /identity or size/u));
  const observed = await f.runPostedit(f.engine, f.snapshot);
  assert.equal(observed.profile, "private.current-symbol-postedit-preopen-source.v1");
  assert.equal(observed.sourceSha256, f.snapshot.copy.sha256); assert.equal(observed.sourceMatchesClosedPosteditSnapshot, true);
  assert.equal(Object.hasOwn(observed, "sourceMatchesClosedBaseline"), false);
  assert.equal(observed.writerAuthority, false); assert.equal(observed.executionAuthorized, false); assert.equal(observed.ongoingSourceContinuity, false);
  assert.equal(Object.isFrozen(observed), true); assert.deepEqual(await readFile(f.source), f.bytes);
  await assert.rejects(f.runPostedit(f.engine, structuredClone(f.snapshot)), /reference-equal/u);
});

void test("post-edit preopen refuses bytes restored to the old baseline and lost snapshot issuance during hashing", async () => {
  for (const fault of ["old-bytes", "issuer", "late-sidecar"] as const) {
    const f = await fixture(false, true);
    if (fault === "old-bytes") { await writeFile(f.source, Buffer.alloc(f.bytes.length, 0x31)); }
    else {
      f.state.afterYield = async (): Promise<void> => {
        if (fault === "issuer") { f.state.snapshotOwned = false; }
        else { await writeFile(`${f.source}-wal`, "synthetic pending write"); }
      };
    }
    await assert.rejects(f.runPostedit(f.engine, f.snapshot), (error: unknown) => refused(error, /identity or size|snapshot lost|sidecar/u));
  }
});
