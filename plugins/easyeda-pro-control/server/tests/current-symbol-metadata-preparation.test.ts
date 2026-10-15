import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";
import { currentSymbolMetadataPreparationResultSchema, prepareCurrentSymbolMetadata, queryCurrentSymbolMetadataPreparation,
  validateCurrentSymbolMetadataPreparationArguments } from "../src/current-symbol-metadata-preparation.ts";
import { validateCurrentSymbolMetadataResult } from "../src/current-symbol-metadata.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise the real offline router and reuse the synthetic encryption fixture without a new test harness.
import { apiRequestSchema, runOfflineApi } from "../src/offline-api.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";

const target = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), ownerUuid: "3".repeat(32), symbolUuid: "4".repeat(16) };
const head = "5".repeat(32), key = "6".repeat(32), priorHead = "7".repeat(32);
const peerUuid = "8".repeat(16);
const patch = { name: "Renamed fixture", description: "New description" };
function line(type: string, body: unknown, id?: string): string {
  return `${JSON.stringify({ type, ticket: 1, ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}
function symbol(uuid: string, name: string, extraMeta: Record<string, unknown> = {}): string {
  return line("DOCHEAD", { uuid, docType: "SYMBOL", client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2.196.5cb3e1b3" }) +
    line("META", { title: name, description: "Original description", tags: [" tag ", "tag"], docType: 2, source: "template", ...extraMeta }, "META");
}
async function fixture(t: TestContext, extraMeta: Record<string, unknown> = {}): Promise<{
  checkpoint: { path: string; bytes: number; sha256: string }; target: typeof target; patch: typeof patch;
}> {
  const checkpointRoot = join(controlDataDirectory(), "checkpoints");
  await mkdir(checkpointRoot, { mode: 0o700, recursive: true });
  const directory = await mkdtemp(join(checkpointRoot, "symbol-preparation-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const path = join(directory, "fixture.eprj2");
  const database = new DatabaseSync(path);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY,branch_uuid TEXT,owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY,project_uuid TEXT,history_uuid TEXT);
      CREATE TABLE project_history_${target.branchUuid}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(target.projectUuid, target.branchUuid, target.ownerUuid);
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(target.branchUuid, target.projectUuid, head);
    const insertHead = database.prepare(`INSERT INTO project_history_${target.branchUuid} VALUES(?,?,?,?,?,?)`);
    insertHead.run(priorHead, null, null, key, 0, 0); insertHead.run(head, priorHead, null, key, 0, 0);
    const insertData = database.prepare("INSERT INTO history_data VALUES(?,?,?)");
    insertData.run(priorHead, priorHead, encrypted(symbol(peerUuid, "Peer fixture"), priorHead, key));
    insertData.run(head, head, encrypted(symbol(target.symbolUuid, "Original fixture", extraMeta) + line("PART", { name: "A" }, "part"), head, key));
  } finally { database.close(); }
  await chmod(path, 0o600);
  const bytes = await readFile(path);
  return { checkpoint: { path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") }, target, patch };
}

void test("current symbol preparation binds complete checkpoint history and preserves source/tags without writer authority", async (t) => {
  const input = await fixture(t);
  const before = await readFile(input.checkpoint.path);
  const routed = await runOfflineApi(apiRequestSchema.parse({ action: "project-symbol-prepare", query: { request: input } }));
  assert.equal(routed.offline, true);
  const prepared = currentSymbolMetadataPreparationResultSchema.parse(routed.result);
  assert.deepEqual(prepared.metadata.before, { name: "Original fixture", description: "Original description", tags: [" tag ", "tag"], source: "template" });
  assert.deepEqual(prepared.metadata.after, { ...prepared.metadata.before, ...patch });
  assert.deepEqual(prepared.metadata.peerNames, ["Peer fixture"]);
  assert.equal(prepared.history.headHistoryUuid, head); assert.equal(prepared.history.historyRows, 2);
  assert.equal(prepared.history.chunks, 2); assert.equal(prepared.history.documents, 2);
  const { preparationSha256, ...payload } = prepared; assert.equal(preparationSha256, sha256Json(payload));
  for (const field of ["liveSourceRead", "cadAuthority", "writerReady", "inverseReady", "executionAuthorized", "persistenceVerified", "sqlInventoryVerified"] as const) {
    assert.equal(prepared[field], false);
  }
  assert.deepEqual(await readFile(input.checkpoint.path), before);
  const changed = await fixture(t, { source: "different stored source" });
  const changedPreparation = await prepareCurrentSymbolMetadata(changed);
  assert.notEqual(changedPreparation.history.selectedBranchRecordsSha256, prepared.history.selectedBranchRecordsSha256);
  const large = await fixture(t, { description: "界".repeat(65_536) });
  await assert.rejects(prepareCurrentSymbolMetadata({ ...large, patch: { description: "界".repeat(65_536) } }),
    { message: "Current symbol metadata preparation exceeds the 512 KiB offline response limit." });
});

void test("current symbol preparation correlates an explicit producer core projection without treating it as freshness or authority", async (t) => {
  const input = await fixture(t);
  const active = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: "9".repeat(16),
    tabId: `${"9".repeat(16)}@${target.projectUuid}` };
  const core = { ok: true, kind: "current-symbol-metadata-observation", method: "eda.lib_Symbol.get", target: active,
    value: { uuid: target.symbolUuid, projectUuid: target.projectUuid, ownerUuid: target.ownerUuid, name: "Original fixture",
      description: "Original description", tagsJson: '[" tag ","tag"]', source: "template", version: "1", ticket: 900 },
    samples: 2, implementationKind: "native-task-equivalent", targetClosedInRegistry: true, hiddenEditorsVerified: false,
    workerIdentityVerified: false, cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false };
  const produced = validateCurrentSymbolMetadataResult({ method: core.method, arguments: { symbolUuid: target.symbolUuid }, target: active }, core);
  // Discovery explicitly lists these core fields; the decorated envelope is not silently stripped by production parsing.
  const projection = Object.fromEntries(Object.keys(core).map((field) => [field, produced[field]]));
  const prepared = await prepareCurrentSymbolMetadata({ ...input, observationProjection: projection });
  assert.deepEqual(prepared.correlation, { observationProjectionSha256: sha256Json(core), metadataMatches: true,
    freshnessVerified: false, ticketCompared: false, versionCompared: false });
  await assert.rejects(prepareCurrentSymbolMetadata({ ...input, observationProjection: produced }));
  await assert.rejects(prepareCurrentSymbolMetadata({ ...input, observationProjection: { ...core, value: { ...core.value, source: "" } } }), /not proven/u);
});

void test("current symbol preparation refuses invalid patches, exact identity mismatches, peer collisions and unsupported META", async (t) => {
  const input = await fixture(t);
  for (const invalid of [{}, { name: " " }, { description: null }, { classification: "x" }, { name: "x", extra: true }]) {
    assert.equal(validateCurrentSymbolMetadataPreparationArguments({ ...input, patch: invalid })["valid"], false);
  }
  assert.equal(validateCurrentSymbolMetadataPreparationArguments(input)["valid"], true);
  assert.equal(validateCurrentSymbolMetadataPreparationArguments({ ...input, code: "execute()" })["valid"], false);
  for (const field of ["branchUuid", "ownerUuid"] as const) {
    await assert.rejects(prepareCurrentSymbolMetadata({ ...input, target: { ...target, [field]: "b".repeat(32) } }), /not proven/u);
  }
  await assert.rejects(prepareCurrentSymbolMetadata({ ...input, target: { ...target, projectUuid: "b".repeat(64) } }));
  await assert.rejects(prepareCurrentSymbolMetadata({ ...input, target: { ...target, symbolUuid: "b".repeat(16) } }), /one active SYMBOL/u);
  await assert.rejects(prepareCurrentSymbolMetadata({ ...input, patch: { name: " peer FIXTURE " } }), /normalized name/u);
  await assert.rejects(prepareCurrentSymbolMetadata(await fixture(t, { futureField: "must not discard" })));
  const query = queryCurrentSymbolMetadataPreparation({ includeSchemas: true });
  assert.notEqual(query["inputSchema"], undefined); assert.notEqual(query["resultSchema"], undefined); assert.equal(query["writerReady"], false);
});

void test("current symbol preparation confines descriptor reads and refuses mismatched bytes, links and sidecars", async (t) => {
  const input = await fixture(t);
  for (const checkpoint of [{ ...input.checkpoint, bytes: input.checkpoint.bytes + 1 }, { ...input.checkpoint, sha256: "0".repeat(64) },
    { ...input.checkpoint, path: join(controlDataDirectory(), "not-a-checkpoint.eprj2") }]) {
    await assert.rejects(prepareCurrentSymbolMetadata({ ...input, checkpoint }));
  }
  const directory = join(controlDataDirectory(), "checkpoints", "preparation-link-check");
  await symlink(join(input.checkpoint.path, ".."), directory);
  t.after(async () => { await rm(directory, { force: true }); });
  await assert.rejects(prepareCurrentSymbolMetadata({ ...input, checkpoint: { ...input.checkpoint, path: join(directory, "fixture.eprj2") } }));
  const alias = `${input.checkpoint.path}.alias`;
  await link(input.checkpoint.path, alias);
  await assert.rejects(prepareCurrentSymbolMetadata(input), /not proven/u);
  await rm(alias);
  await chmod(input.checkpoint.path, 0o640);
  await assert.rejects(prepareCurrentSymbolMetadata(input), /not proven/u);
  await chmod(input.checkpoint.path, 0o600);
  const sidecar = `${input.checkpoint.path}-wal`;
  await symlink(input.checkpoint.path, sidecar);
  await assert.rejects(prepareCurrentSymbolMetadata(input), /native history/u);
});
