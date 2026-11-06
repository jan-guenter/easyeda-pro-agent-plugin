/* oxlint-disable import/max-dependencies -- These closed-data regressions join both genuine initial profiles, the shared descriptor pipeline and independent full SQL/raw-history evidence. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { normalizeEasyedaProjectPath, sha256Json } from "../src/core.ts";
import { captureGeneratedReaderClosedData } from "../src/managed-generated-reader-closed-data.ts";
import { qualifyGeneratedComponentFixtureInitialSql } from "../src/managed-component-fixture-initial-sql.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { captureGeneratedReaderClosedSnapshot, decodeGeneratedReaderRawHistory } from "../src/managed-fixture-reader-closed-snapshot.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

void test("closed reader diagnostics decode every genuine initial encrypted history row while preserving unticked headers and Arc source", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via"), result = await decodeGeneratedReaderRawHistory(input.inventory);
  assert.equal(result["completeHistoryDataRowsDecoded"], true); assert.equal(result["chunkCount"], 1);
  assert.equal(result["semanticChainAccepted"], false); assert.equal(result["writerAuthority"], false);
  assert.match(JSON.stringify(result), /EDIT_HEAD/u); assert.match(JSON.stringify(result), /ARC/u);
  await assert.rejects(decodeGeneratedReaderRawHistory(structuredClone(input.inventory)), /completion|reader|issued/iu);
});
void test("original owner and native closure must reprove before any generated source filesystem lookup", async () => {
  const input = await managedFixtureInitialSqlFixture(), result = await qualifyGeneratedFixtureInitialSql(input); let observed = 0;
  await assert.rejects(captureGeneratedReaderClosedSnapshot({ source: { qualification: result.qualification, archive: input.archive },
    assertOriginalOwner: () => { throw new Error("ORIGINAL_OWNER_REFUSED"); }, observeOriginalTermination: () => { observed += 1; return Promise.resolve(); } }), /ORIGINAL_OWNER_REFUSED/u);
  assert.equal(observed, 0);
  await assert.rejects(captureGeneratedReaderClosedSnapshot({ source: { qualification: result.qualification, archive: input.archive },
    assertOriginalOwner: () => { assert.equal(result.qualification.completeInitialSqlRowsQualified, true); }, observeOriginalTermination: () => Promise.reject(new Error("ORIGINAL_JOB_STILL_LIVE")) }), /ORIGINAL_JOB_STILL_LIVE/u);
});
void test("closed capture rejects proxies/accessors and pins its original callbacks across asynchronous closure observation", async () => {
  const input = await managedFixtureInitialSqlFixture(), result = await qualifyGeneratedFixtureInitialSql(input); const pending = Promise.withResolvers<null>();
  const options = { source: { qualification: result.qualification, archive: input.archive }, assertOriginalOwner: (): void => { assert.equal(result.qualification.writerClockAuthority, false); },
    observeOriginalTermination: async (): Promise<void> => { await pending.promise; } };
  await assert.rejects(captureGeneratedReaderClosedSnapshot(new Proxy(options, {})), /plain original capture inputs/u);
  const capture = captureGeneratedReaderClosedSnapshot(options);
  options.observeOriginalTermination = (): Promise<void> => Promise.resolve(); pending.resolve(null);
  await assert.rejects(capture, /callback\/source identities/u);
  let getterCalls = 0;
  Object.defineProperty(options, "assertOriginalOwner", { get: () => { getterCalls += 1; return (): void => { throw new Error("unowned callback"); }; } });
  await assert.rejects(captureGeneratedReaderClosedSnapshot(options), /capture data property/u); assert.equal(getterCalls, 0);
  const fake = Object.defineProperty({}, "schema", { enumerable: true, get: (): string => { getterCalls += 1; return "foreign"; } });
  const foreignSource = { qualification: result.qualification, archive: input.archive }; Object.defineProperty(foreignSource, "qualification", { value: fake });
  await assert.rejects(captureGeneratedReaderClosedSnapshot({ source: foreignSource, assertOriginalOwner: (): void => { throw new Error("unowned"); }, observeOriginalTermination: (): Promise<void> => Promise.resolve() }), /qualification data property/u);
  assert.equal(getterCalls, 0);

});
void test("closed capture copies the full synthetic file through fresh descriptors, retains SQL/raw history, and refuses an added sidecar", async () => {
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via", directory), qualified = await qualifyGeneratedFixtureInitialSql(input);
  const source = normalizeEasyedaProjectPath(input.rawWindowsPath); await copyFile(input.syntheticDatabasePath, source);
  let observed = 0, ownerChecks = 0;
  const options = { source: { qualification: qualified.qualification, archive: input.archive }, assertOriginalOwner: (): void => { ownerChecks += 1; },
    observeOriginalTermination: (): Promise<void> => { observed += 1; return Promise.resolve(); } };
  const result = await captureGeneratedReaderClosedSnapshot(options);
  assert.equal(result["completeSqlInventoryCaptured"], true); assert.equal(result["sourceEqualsInitialBytes"], true);
  assert.equal(result["newReadOpenTargetIssued"], false); assert.equal(result["completeSqlEffectsAccepted"], false); assert.equal(result["writerAuthority"], false);
  for (const name of ["snapshot", "sql", "rawHistory"]) {
    const descriptor = result[name]; assert.ok(descriptor !== null && typeof descriptor === "object" && "path" in descriptor && "sha256" in descriptor);
    assert.equal(typeof descriptor.path, "string"); assert.equal(typeof descriptor.sha256, "string");
    const bytes = await readFile(String(descriptor.path)); assert.equal(createHash("sha256").update(bytes).digest("hex"), descriptor.sha256);
    if (name === "snapshot") { assert.deepEqual(bytes, await readFile(source)); }
    if (name === "rawHistory") { assert.match(bytes.toString("utf8"), /ARC/u); assert.match(bytes.toString("utf8"), /completeHistoryDataRowsDecoded/u); }
  }
  assert.ok(observed >= 4 && ownerChecks > observed);
  await writeFile(`${source}-wal`, Buffer.from("synthetic sidecar"));
  await assert.rejects(captureGeneratedReaderClosedSnapshot(options), /directory roster\/no sidecars/u);
});

void test("Component closed data retains every source byte and35SQL tables while forwarding fresh clocks without fallback", async () => {
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const input = await managedFixtureInitialSqlFixture(undefined, "component-circular-smt-pad", directory), qualified = await qualifyGeneratedComponentFixtureInitialSql(input);
  await assert.rejects(qualifyGeneratedComponentFixtureInitialSql({ ...input, sourceCreatedEpochMs: 0, sourceModifiedEpochMs: 0 }), /initial SQL refused/u);
  const source = normalizeEasyedaProjectPath(input.rawWindowsPath); await copyFile(input.syntheticDatabasePath, source);
  const before = await stat(source, { bigint: true }); let qualifications = 0; let closures = 0;
  const report = await captureGeneratedReaderClosedData(Object.freeze({ target: qualified.qualification.target, archive: input.archive, originalQualificationSha256: sha256Json(qualified.qualification),
    reportSchema: "easyeda-pro-control.generated-component-reader-closed-snapshot.v1", artifactKind: "generated-component-reader-closed", assertCurrent: (): void => {
      assert.equal(qualified.qualification.nativeComponentCacheQualified, false);
    }, observeOriginalTermination: (): Promise<void> => { closures += 1; return Promise.resolve(); }, qualifyInitial: (value: Parameters<typeof qualifyGeneratedComponentFixtureInitialSql>[0]) => {
      qualifications += 1; assert.equal(value.sourceCreatedEpochMs, Number(before.birthtimeMs)); assert.equal(value.sourceModifiedEpochMs, Number(before.mtimeMs));
      return qualifyGeneratedComponentFixtureInitialSql(value);
    } }));
  assert.equal(report["schema"], "easyeda-pro-control.generated-component-reader-closed-snapshot.v1"); assert.equal(qualifications, 1); assert.ok(closures >= 4);
  assert.equal(report["sourceEqualsInitialBytes"], true); assert.equal(report["writerAuthority"], false); assert.equal(report["newReadOpenTargetIssued"], false);
  assert.ok(Array.isArray(report["tableRoster"])); assert.equal(report["tableRoster"].length, 35);
  for (const name of ["snapshot", "sql", "rawHistory"]) {
    const artifact = report[name]; assert.ok(artifact !== null && typeof artifact === "object" && "path" in artifact && typeof artifact.path === "string");
    const bytes = await readFile(artifact.path);
    if (name === "snapshot") { assert.deepEqual(bytes, await readFile(source)); }
    if (name === "sql") { const parsed: unknown = JSON.parse(bytes.toString("utf8")); assert.ok(parsed !== null && typeof parsed === "object" && "logicalSha256" in parsed); assert.equal(parsed.logicalSha256, input.inventory.logicalSha256); }
    if (name === "rawHistory") { for (const family of ["FOOTPRINT", "COMPONENT", "PAD", "ATTR"]) { assert.ok(bytes.toString("utf8").includes(family)); } }
  }
  if (before.birthtimeMs === 0n) { assert.equal(report["completeInitialSqlRowsQualified"], false); assert.equal(report["currentInitialQualification"], null); }
});
