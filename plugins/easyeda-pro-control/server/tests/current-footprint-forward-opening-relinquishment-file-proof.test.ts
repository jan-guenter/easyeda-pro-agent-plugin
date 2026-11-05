/* oxlint-disable import/max-dependencies -- Exercise the collector against real checkpoint creation, encrypted native history, pinned isolated SQL children and the machine profile. */
import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gzipSync } from "node:zlib";
import { compareCompleteClosedSql } from "../src/closed-sql-equality.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { prepareCurrentDisposableOpenCheckpoint } from "../src/current-disposable-open-checkpoint.ts";
import { collectCurrentFootprintForwardOpeningFileProof, currentFootprintForwardOpeningFileProofSchema, revalidateCurrentFootprintForwardOpeningFileProof } from "../src/current-footprint-forward-opening-relinquishment-file-proof.ts";
import type { DiagnosticLifecycleRecords } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

const BRANCH = "22".repeat(16), DOCUMENT = "66".repeat(8), HISTORY = "33".repeat(16);
type Opening = NonNullable<DiagnosticLifecycleRecords["worker-startup-opening-intent.json"]>;
const hash = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

async function fixture(context: TestContext): Promise<{
  readonly opening: Opening; readonly source: string; readonly before: Awaited<ReturnType<typeof readExactSqlInventory>>;
  readonly runtime: Awaited<ReturnType<typeof syntheticSqlRuntime>>;
}> {
  const root = syntheticSqlRoot(), runtime = await syntheticSqlRuntime();
  const directory = await mkdtemp(path.join(root, "forward-file-proof-"));
  const source = path.join(directory, "fixture.eprj2");
  const rawWindowsPath = ["Z:", "Fixture", path.basename(directory), "fixture.eprj2"].join("\\");
  const originalResolve = path.resolve.bind(path);
  const sourceLookup = `/mnt/z/Fixture/${path.basename(directory)}/fixture.eprj2`;
  context.mock.method(path, "resolve", (...parts: string[]): string =>
    parts.length === 1 && parts[0] === sourceLookup ? source : originalResolve(...parts));
  syncBuiltinESMExports();
  const previousProfile = process.env["EASYEDA_MACHINE_PROFILE"];
  context.after(() => {
    context.mock.restoreAll(); syncBuiltinESMExports();
    if (previousProfile === undefined) { delete process.env["EASYEDA_MACHINE_PROFILE"]; }
    else { process.env["EASYEDA_MACHINE_PROFILE"] = previousProfile; }
  });
  const assets = path.join(directory, "assets"), upstream = path.join(directory, "upstream");
  for (const parent of [path.join(upstream, "dist"), path.join(assets, "pro-pcb/3.2.test/js"), path.join(assets, "pro-api/0.2.test")]) {
    await mkdir(parent, { recursive: true });
  }
  await writeFile(path.join(upstream, "package.json"), JSON.stringify({ name: "easyeda-mcp-pro", version: "1.0.0" }));
  for (const file of [path.join(upstream, "dist/index.js"), path.join(assets, "pro-pcb/3.2.test/js/pcb.js"),
    ...["api.js", "api-types.js", "api-types.d.ts"].map(name => path.join(assets, "pro-api/0.2.test", name))]) {
    await writeFile(file, "// Synthetic installation metadata; never executed.\n");
  }
  const profilePath = path.join(root, "file-proof-machine-profile.json");
  await writeFile(profilePath, JSON.stringify({ schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64", runtime,
    upstream: { root: upstream, entrypoint: path.join(upstream, "dist/index.js"), serverVersion: "1.0.0" },
    easyeda: { assetsRoot: assets, pcbBundleVersion: "3.2.test", publicApiBundleVersion: "0.2.test" }, controlDirectory: root }), { mode: 0o600 });
  process.env["EASYEDA_MACHINE_PROFILE"] = profilePath;
  const key = "55".repeat(16), projectUuid = sha256Text(rawWindowsPath);
  const plaintext = `${JSON.stringify({ type: "DOCHEAD", ticket: 1 })}||${JSON.stringify({ uuid: DOCUMENT, docType: "PCB", client: "fixture-client" })}|\n`
    + `${JSON.stringify({ type: "META", id: "META", ticket: 1 })}||${JSON.stringify({ title: "Synthetic PCB" })}|\n`;
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(HISTORY, "hex"));
  // oxlint-disable-next-line node/no-sync -- Compress only the bounded, generated test history before fixture encryption.
  const compressed = gzipSync(plaintext);
  const encoded = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]).toString("base64");
  const database = new DatabaseSync(source, { defensive: false });
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
      CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY, parent TEXT, snapshot TEXT, key TEXT, num INTEGER, snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY, history_uuid TEXT, dataStr TEXT);
      PRAGMA schema_version=117;`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(projectUuid, BRANCH, "44".repeat(16));
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, projectUuid, HISTORY);
    database.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`).run(HISTORY, null, null, key, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HISTORY, HISTORY, encoded);
  } finally { database.close(); }
  const target = { rawWindowsPath, projectUuid, documentUuid: DOCUMENT, expectedSourceSha256: hash(await readFile(source)) };
  const prepared = await prepareCurrentDisposableOpenCheckpoint(target);
  assert.ok(prepared.preparationCheckpoint);
  const before = await readExactSqlInventory({ checkpointPath: prepared.preparationCheckpoint.path,
    expectedSha256: prepared.preparationCheckpoint.sha256, runtime });
  const opening: Opening = { schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1", operationId: "footprint-copy-qualify-file-proof",
    createdAt: new Date().toISOString(), bindingSha256: "a".repeat(64), handoffResultSha256: "b".repeat(64),
    target: { ...target, branchUuid: BRANCH }, preparationCheckpoint: prepared.preparationCheckpoint,
    checkpointReceiptSha256: sha256Json(prepared.checkpoint), beforeSqlSha256: before.logicalSha256,
    confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true };
  return { opening, source, before, runtime };
}

void test("historical opening file proof compares actual like-for-like prepared SQL while preserving raw schema-version refusal", async context => {
  const f = await fixture(context);
  const raw = await readExactSqlInventory({ checkpointPath: f.source, expectedSha256: f.opening.target.expectedSourceSha256, runtime: f.runtime });
  assert.equal(raw.properties["schema_version"], 117);
  assert.equal(f.before.properties["schema_version"], 118);
  await assert.rejects(compareCompleteClosedSql(raw, f.before), /SQL equality refused/u);
  let currentChecks = 0;
  const result = await collectCurrentFootprintForwardOpeningFileProof(f.opening, async () => { currentChecks += 1; await Promise.resolve(); });
  assert.equal(currentFootprintForwardOpeningFileProofSchema.safeParse(result).success, true);
  assert.equal(result.beforeSqlSha256, f.opening.beforeSqlSha256); assert.equal(result.beforeSqlSha256, result.freshSqlSha256);
  assert.equal(result.rawSourceSha256, f.opening.target.expectedSourceSha256);
  assert.equal(result.oldHistorySemanticSha256, result.freshHistorySemanticSha256);
  assert.equal(result.fullSqlEqual, true); assert.equal(result.historyEqual, true); assert.equal(result.sidecarsAbsent, true);
  assert.equal(result.executionAuthorized, false); assert.equal(result.restored, false); assert.ok(currentChecks > 20);
  await revalidateCurrentFootprintForwardOpeningFileProof(result);
  await assert.rejects(revalidateCurrentFootprintForwardOpeningFileProof({ ...result }), /Original completed file-proof validator/u);
  await writeFile(`${f.source}-journal`, "Synthetic late sidecar", { mode: 0o600 });
  await assert.rejects(revalidateCurrentFootprintForwardOpeningFileProof(result), /sidecar|changed|malformed|refused|CHECKPOINT/u);
  assert.equal(hash(await readFile(f.source)), f.opening.target.expectedSourceSha256);
});

void test("historical opening file proof rejects changed original SQL binding before accepting a new preparation", async context => {
  const f = await fixture(context);
  await assert.rejects(collectCurrentFootprintForwardOpeningFileProof({ ...f.opening, beforeSqlSha256: "0".repeat(64) },
    async () => { await Promise.resolve(); }), /OLD_SQL_BINDING/u);
});

void test("historical opening file proof rejects a raw-source sidecar despite unchanged registered raw bytes", async context => {
  const f = await fixture(context);
  await writeFile(`${f.source}-journal`, "Synthetic sidecar", { mode: 0o600 });
  await assert.rejects(collectCurrentFootprintForwardOpeningFileProof(f.opening, async () => { await Promise.resolve(); }), /sidecar|changed|malformed|refused|CHECKPOINT/u);
  assert.equal(hash(await readFile(f.source)), f.opening.target.expectedSourceSha256);
});
