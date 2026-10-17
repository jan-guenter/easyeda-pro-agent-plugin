/** Managed synthetic checkpoints only; the recorded original source is absent. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, truncate } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";
import { prepareCurrentSymbolCopyCheckpoint } from "../src/current-symbol-copy-preparation.ts";
import { currentClosedSymbolMetadataResultSchema } from "../src/current-symbol-closed-target.ts";
// oxlint-disable-next-line import/max-dependencies -- Reuse the existing synthetic native encryption helper; no application fixture or production checkpoint creation is involved.
import { encrypted } from "./helpers/symbol-sql-fixture.ts";

const source = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), symbolUuid: "3".repeat(16) };
const ownerUuid = "4".repeat(32), peerUuid = "5".repeat(16);
const CLIENT = "a".repeat(16), HISTORY = "6".repeat(32), KEY = "7".repeat(32);
const metadata = { title: "Source", description: "Original description", tags: [" a ", "a"], docType: 2, source: "template" };
const header = { uuid: source.symbolUuid, docType: "SYMBOL", client: CLIENT, updateTime: 1, version: "1", editVersion: "3.2.206" };
function line(type: string, body: unknown, id?: string, ticket = 1): string {
  return `${JSON.stringify({ type, ticket, ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}`;
}
function observer(): ReturnType<typeof currentClosedSymbolMetadataResultSchema.parse> {
  return currentClosedSymbolMetadataResultSchema.parse({ ok: true, kind: "current-closed-symbol-metadata-witness", method: "eda.lib_Symbol.get",
    target: { projectUuid: source.projectUuid, branchUuid: source.branchUuid, documentUuid: peerUuid, tabId: `${peerUuid}@${source.projectUuid}` },
    value: { uuid: source.symbolUuid, projectUuid: source.projectUuid, ownerUuid, name: metadata.title, description: metadata.description,
      tagsJson: JSON.stringify(metadata.tags), source: metadata.source, version: "1", ticket: 100 }, samples: 2,
    implementationKind: "native-task-equivalent", targetClosedInRegistry: true, hiddenEditorsVerified: true, workerIdentityVerified: false,
    cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false,
    clientTicketObservation: { client: CLIENT, maxTicket: 100, samples: 4 },
    runtimeObservation: { editorVersion: "3.2.206", actor: { uuid: ownerUuid, username: "synthetic", nickname: "Synthetic" },
      clockSamples: Array.from({ length: 4 }, (_, index) => ({ rendererBeforeMs: index, serverTimeMs: index, rendererAfterMs: index })),
      backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false } });
}
interface Options { readonly meta?: Record<string, unknown>; readonly head?: Record<string, unknown>; readonly deleted?: boolean; readonly x?: number; readonly reverseRawKeys?: boolean }
async function fixture(t: TestContext, options: Options = {}): Promise<{
  checkpoint: Awaited<ReturnType<typeof receipt>>; source: typeof source; observation: ReturnType<typeof observer>;
}> {
  const root = join(controlDataDirectory(), "checkpoints"); await mkdir(root, { recursive: true, mode: 0o700 });
  const directory = await mkdtemp(join(root, "copy-preparation-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const path = join(directory, "fixture.eprj2"), shape = options.reverseRawKeys === true ? { y: 0, x: options.x ?? 0 } : { x: options.x ?? 0, y: 0 };
  const raw = [line("DOCHEAD", { ...header, ...options.head }), line("META", { ...metadata, ...options.meta }, "META"),
    line("PART", { title: "A" }, "part"), line("RECT", shape, "rect"),
    ...(options.deleted === true ? [line("DELETE_DOC", { isDelete: true }, "DELETE_DOC", 2)] : []),
    line("DOCHEAD", { ...header, uuid: peerUuid, docType: "PCB" }), line("META", { title: "PCB" }, "META")].join("|\n");
  const database = new DatabaseSync(path);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY,branch_uuid TEXT,owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY,project_uuid TEXT,history_uuid TEXT);
      CREATE TABLE project_history_${source.branchUuid}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(source.projectUuid, source.branchUuid, ownerUuid);
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(source.branchUuid, source.projectUuid, HISTORY);
    database.prepare(`INSERT INTO project_history_${source.branchUuid} VALUES(?,?,?,?,?,?)`).run(HISTORY, null, null, KEY, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HISTORY, HISTORY, encrypted(raw, HISTORY, KEY));
  } finally { database.close(); }
  await chmod(path, 0o600);
  return { checkpoint: await receipt(path), source, observation: observer() };
}
async function receipt(path: string): Promise<{
  schema: "easyeda-pro-control.checkpoint.v2"; createdAt: string; source: string; checkpoint: string; receiptPath: string;
  sourceIdentity: { dev: string; ino: string; birthtimeNs: string; ctimeNs: string };
  checkpointIdentity: { dev: string; ino: string; birthtimeNs: string; ctimeNs: string };
  sourceStatBefore: { size: string; mtimeNs: string; ctimeNs: string }; sourceStatAfter: { size: string; mtimeNs: string; ctimeNs: string };
  sourceDataVersion: number; sourceSha256: string; checkpointSha256: string; sourceDumpSha256: string; checkpointDumpSha256: string;
  quickCheck: { sourceBefore: "ok"; sourceAfter: "ok"; checkpoint: "ok" }; integrityModel: string; receiptSha256: string;
}> {
  const bytes = await readFile(path), info = await lstat(path, { bigint: true });
  const identity = { dev: String(info.dev), ino: String(info.ino), birthtimeNs: String(info.birthtimeNs), ctimeNs: String(info.ctimeNs) };
  const stat = { size: String(info.size), mtimeNs: String(info.mtimeNs), ctimeNs: String(info.ctimeNs) };
  const hash = createHash("sha256").update(bytes).digest("hex");
  const core = { schema: "easyeda-pro-control.checkpoint.v2" as const, createdAt: "2026-10-17T12:00:00.000Z",
    source: join(controlDataDirectory(), "absent-original.eprj2"), checkpoint: path, receiptPath: `${path.slice(0, -6)}.checkpoint.json`,
    sourceIdentity: identity, checkpointIdentity: identity, sourceStatBefore: stat, sourceStatAfter: stat, sourceDataVersion: 1,
    sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: "f".repeat(64), checkpointDumpSha256: "f".repeat(64),
    quickCheck: { sourceBefore: "ok" as const, sourceAfter: "ok" as const, checkpoint: "ok" as const },
    integrityModel: "Unkeyed SHA-256 values detect accidental corruption. They do not authenticate files against a writer with access to this directory." };
  return { ...core, receiptSha256: sha256Json(core) };
}
function reseal<T extends { receiptSha256: string }>(value: T): T {
  const { receiptSha256: _old, ...core } = value; return { ...value, receiptSha256: sha256Json(core) };
}

void test("copy checkpoint preparation binds complete source semantics and exact raw history without reading an original source", async t => {
  const input = await fixture(t);
  const bytes = await readFile(input.checkpoint.checkpoint);
  const result = await prepareCurrentSymbolCopyCheckpoint(input);
  assert.equal(result.checkpoint, input.checkpoint); assert.deepEqual(result.target, { ...source, ownerUuid });
  assert.deepEqual(result.sourceMetadata, metadata); assert.equal(result.sourceDocumentHeaderSha256, sha256Json(header));
  assert.equal(result.sourceDocumentSemanticSha256, sha256Json({ uuid: source.symbolUuid, docType: "SYMBOL", metadata: header,
    records: [{ id: "META", type: "META", body: metadata }, { id: "part", type: "PART", body: { title: "A" } }, { id: "rect", type: "RECT", body: { x: 0, y: 0 } }] }));
  const { preparationSha256, ...body } = result; assert.equal(preparationSha256, sha256Json(body));
  assert.equal(result.ticketCompared, false); assert.equal(result.executionAuthorized, false); assert.equal(result.producerBindingVerified, false);
  assert.equal(result.liveSourceRead, false); assert.equal(result.sqlInventoryVerified, false); assert.equal(result.persistenceVerified, false);
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.sourceMetadata.tags));
  assert.deepEqual(await readFile(input.checkpoint.checkpoint), bytes);
  assert.deepEqual(await readdir(dirname(input.checkpoint.checkpoint)), ["fixture.eprj2"]);
  await assert.rejects(lstat(input.checkpoint.source), { code: "ENOENT" }); await assert.rejects(lstat(input.checkpoint.receiptPath), { code: "ENOENT" });
  const reordered = await prepareCurrentSymbolCopyCheckpoint(await fixture(t, { reverseRawKeys: true }));
  assert.equal(reordered.sourceDocumentSemanticSha256, result.sourceDocumentSemanticSha256);
  assert.notEqual(reordered.sourceDocumentRecordsSha256, result.sourceDocumentRecordsSha256);
  const changed = await prepareCurrentSymbolCopyCheckpoint(await fixture(t, { x: 5 }));
  assert.notEqual(changed.sourceDocumentSemanticSha256, result.sourceDocumentSemanticSha256);
  assert.notEqual(changed.historySemanticSha256, result.historySemanticSha256);
});

void test("copy checkpoint preparation refuses project, owner, stored metadata and observation mismatches", async t => {
  const input = await fixture(t);
  for (const change of [{ projectUuid: "b".repeat(64) }, { branchUuid: "b".repeat(32) }, { symbolUuid: "b".repeat(16) }]) {
    await assert.rejects(prepareCurrentSymbolCopyCheckpoint({ ...input, source: { ...source, ...change } }));
  }
  for (const change of [{ ownerUuid: "b".repeat(32) }, { name: "Other" }, { description: "Other" }, { source: "" }, { tagsJson: "[]" }, { version: "2" }]) {
    await assert.rejects(prepareCurrentSymbolCopyCheckpoint({ ...input, observation: { ...input.observation, value: { ...input.observation.value, ...change } } }));
  }
  for (const options of [{ meta: { futureField: "unknown" } }, { meta: { docType: 18 } }, { meta: { source: null } },
    { head: { docType: "FOOTPRINT" } }, { head: { version: "" } }, { deleted: true }]) {
    await assert.rejects(prepareCurrentSymbolCopyCheckpoint(await fixture(t, options)));
  }
});

void test("copy checkpoint preparation rejects invalid receipt hashes and identity substitution", async t => {
  const input = await fixture(t);
  await assert.rejects(prepareCurrentSymbolCopyCheckpoint({ ...input, checkpoint: { ...input.checkpoint, receiptSha256: "0".repeat(64) } }));
  for (const change of [{ checkpointSha256: "0".repeat(64) }, { checkpointIdentity: { ...input.checkpoint.checkpointIdentity, ino: "0" } },
    { sourceDumpSha256: "0".repeat(64) }, { checkpoint: join(controlDataDirectory(), "outside.eprj2") }]) {
    const checkpoint = reseal({ ...input.checkpoint, ...change }); await assert.rejects(prepareCurrentSymbolCopyCheckpoint({ ...input, checkpoint }));
  }
  const missing = reseal({ ...input.checkpoint, checkpoint: join(dirname(input.checkpoint.checkpoint), "missing.eprj2") });
  await assert.rejects(prepareCurrentSymbolCopyCheckpoint({ ...input, checkpoint: missing }), { code: "ENOENT" });
  assert.deepEqual(await readdir(dirname(input.checkpoint.checkpoint)), ["fixture.eprj2"]);
});

void test("copy checkpoint preparation refuses links, permissions, sidecars and oversized actual descriptor bytes", async t => {
  for (const mode of ["hardlink", "symlink", "directory-link", "permissions", "sidecar", "oversized"]) {
    const input = await fixture(t), path = input.checkpoint.checkpoint;
    if (mode === "hardlink") { await link(path, `${path}.alias`); }
    else if (mode === "symlink") {
      const alias = join(dirname(path), "alias.eprj2"); await symlink(path, alias); input.checkpoint = reseal({ ...input.checkpoint, checkpoint: alias });
    } else if (mode === "directory-link") {
      const alias = join(dirname(path), "alias"); await symlink(dirname(path), alias);
      input.checkpoint = reseal({ ...input.checkpoint, checkpoint: join(alias, "fixture.eprj2"), receiptPath: join(alias, "fixture.checkpoint.json") });
    } else if (mode === "permissions") { await chmod(path, 0o640); }
    else if (mode === "sidecar") { await symlink(path, `${path}-wal`); }
    else { await truncate(path, 256 * 1024 * 1024 + 1); }
    await assert.rejects(prepareCurrentSymbolCopyCheckpoint(input));
  }
});

void test("copy checkpoint preparation rejects caller mutation and accessors without invoking them", async t => {
  const input = await fixture(t); let called = false;
  const accessor = { ...input }; Object.defineProperty(accessor, "checkpoint", { get() { called = true; return input.checkpoint; } });
  await assert.rejects(prepareCurrentSymbolCopyCheckpoint(accessor)); assert.equal(called, false);
  await assert.rejects(prepareCurrentSymbolCopyCheckpoint({ ...input, code: "native()" }));
  const pending = prepareCurrentSymbolCopyCheckpoint(input); input.checkpoint.createdAt = "2026-10-17T12:00:01.000Z";
  await assert.rejects(pending);
});
