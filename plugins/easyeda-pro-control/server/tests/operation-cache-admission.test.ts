import assert from "node:assert/strict";
import { lstat, readFile, utimes, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { createOperation, createOperationScanner, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord } from "../src/core.ts";

interface Descriptor { path: string; bytes: number; sha256: string }
interface Projection { cacheBytes: number; bytesSha256: string; value: unknown }
interface ProjectionCache { bytes: number; entries: Map<string, Projection> }
interface Validation { artifacts: Descriptor[]; bytesSha256: string; cacheBytes: number }
interface Admission {
  retainOperationValidation: (id: string, hash: string, artifacts: Descriptor[]) => Validation;
  retainOperationProjection: (cache: ProjectionCache, id: string, hash: string, value: unknown) => void;
}
function isAdmission(value: unknown): value is Admission {
  return isRecord(value) && typeof value["retainOperationValidation"] === "function" && typeof value["retainOperationProjection"] === "function";
}

async function admission(): Promise<Admission & { validations: Map<string, Validation>; validationBytes: () => number }> {
  const source = await readFile(new URL("../src/artifacts.ts", import.meta.url), "utf8");
  const validationStart = source.indexOf("function forgetOperationValidation(");
  const validationEnd = source.indexOf("async function loadValidatedOperation(", validationStart);
  const projectionStart = source.indexOf("function projectionCacheEncoding(");
  const projectionEnd = source.indexOf("async function verifiedOperationProjection<", projectionStart);
  assert.ok(validationStart !== -1 && validationEnd > validationStart && projectionStart !== -1 && projectionEnd > projectionStart);
  const validations = new Map<string, Validation>();
  const scope = { Buffer, Map, Object, Array, Number, Reflect, JSON, structuredClone,
    MAX_OPERATION_CACHE_ENTRIES: 512, MAX_OPERATION_PROOF_CACHE_BYTES: 4 * 1024 * 1024,
    MAX_OPERATION_PROJECTION_CACHE_BYTES: 1024 * 1024, MAX_OPERATION_PROJECTION_BYTES: 32 * 1024,
    validatedOperationBytes: validations, validatedOperationCacheBytes: 0 };
  // Execute the actual private admission functions, with their real limits.
  // This tests memory admission only; the integration below uses fresh files.
  const result: unknown = vm.runInNewContext(stripTypeScriptTypes(`${source.slice(validationStart, validationEnd)}
    ${source.slice(projectionStart, projectionEnd)}
    ({ retainOperationValidation, retainOperationProjection });`), scope);
  assert.ok(isAdmission(result));
  return { ...result, validations, validationBytes: (): number => scope.validatedOperationCacheBytes };
}
const changedHash = "2".repeat(64), originalHash = "1".repeat(64);
function descriptor(path: string): Descriptor { return { path, bytes: 1, sha256: originalHash }; }
function assertValidationBound(current: Awaited<ReturnType<typeof admission>>): void {
  assert.ok(current.validations.size <= 512);
  assert.ok(current.validationBytes() <= 4 * 1024 * 1024);
  assert.equal(current.validationBytes(), [...current.validations.values()].reduce((sum, item) => sum + item.cacheBytes, 0));
}
function assertProjectionBound(cache: ProjectionCache): void {
  assert.ok(cache.entries.size <= 512 && cache.bytes <= 1024 * 1024);
  assert.equal(cache.bytes, [...cache.entries.values()].reduce((sum, item) => sum + item.cacheBytes, 0));
}

for (const limit of ["entries", "bytes"] as const) {
  void test(`proof and projection admission preserves resident entries at the ${limit} cap`, async () => {
    const current = await admission();
    const cache: ProjectionCache = { bytes: 0, entries: new Map() };
    const count = limit === "entries" ? 513 : 40;
    const descriptors = limit === "entries" ? [] : [descriptor("x".repeat(120_000))];
    const value = limit === "entries" ? "resident" : "x".repeat(30_000);
    for (let index = 0; index < count; index += 1) {
      const id = `fixture-${String(index).padStart(3, "0")}`;
      current.retainOperationValidation(id, originalHash, descriptors);
      current.retainOperationProjection(cache, id, originalHash, value);
    }
    const projectionResidents = [...cache.entries.keys()], validationResidents = [...current.validations.keys()];
    assert.ok(validationResidents.length > 0 && validationResidents.length < count);
    assert.ok(projectionResidents.length > 0 && projectionResidents.length < count);
    assertValidationBound(current); assertProjectionBound(cache);
    let projectionMisses = 0, validationMisses = 0;
    for (let index = 0; index < count; index += 1) {
      const id = `fixture-${String(index).padStart(3, "0")}`;
      if (!current.validations.has(id)) { validationMisses += 1; current.retainOperationValidation(id, originalHash, descriptors); }
      if (!cache.entries.has(id)) { projectionMisses += 1; current.retainOperationProjection(cache, id, originalHash, value); }
    }
    assert.equal(validationMisses, count - validationResidents.length);
    assert.equal(projectionMisses, count - projectionResidents.length);
    assert.deepEqual([...current.validations.keys()], validationResidents);
    assert.deepEqual([...cache.entries.keys()], projectionResidents);
    assertValidationBound(current); assertProjectionBound(cache);
  });
}

void test("oversized admissions preserve other residents and discard their own stale key", async () => {
  const current = await admission();
  const cache: ProjectionCache = { bytes: 0, entries: new Map() };
  for (const id of ["keep", "change"]) {
    current.retainOperationValidation(id, originalHash, [descriptor("small")]);
    current.retainOperationProjection(cache, id, originalHash, "small");
  }
  const keptProjection = cache.entries.get("keep"), keptValidation = current.validations.get("keep");
  const oversizedDescriptors = [descriptor("x".repeat(4 * 1024 * 1024))];
  for (const id of ["new", "change"]) {
    const uncached = current.retainOperationValidation(id, changedHash, oversizedDescriptors);
    assert.equal(uncached.bytesSha256, changedHash);
    current.retainOperationProjection(cache, id, changedHash, "x".repeat(40_000));
    assert.equal(current.validations.has(id), false); assert.equal(cache.entries.has(id), false);
  }
  assert.equal(current.validations.get("keep"), keptValidation);
  assert.equal(cache.entries.get("keep"), keptProjection);
  assertValidationBound(current); assertProjectionBound(cache);
  current.retainOperationValidation("change", changedHash, [descriptor("new-small")]);
  current.retainOperationProjection(cache, "change", changedHash, "new-small");
  assert.equal(current.validations.get("change")?.bytesSha256, changedHash);
  assert.equal(cache.entries.get("change")?.bytesSha256, changedHash);
  assertValidationBound(current); assertProjectionBound(cache);
});

void test("full scans above the entry cap retain warm residents and still detect changed journal and artifact bytes", async () => {
  const plan = { name: "Capacity fixture", intent: "Read-only synthetic cache test" }, prefix = "easyeda-capacity-";
  const targetId = `${prefix}000`;
  const artifact = await writePhaseArtifact(targetId, 0, "baseline", { stable: "a" });
  const operation = (id: string): Record<string, unknown> => ({ schema: OPERATION_SCHEMA, operationId: id,
    state: "completed", plan, planHash: buildPlanHash(plan), artifacts: id === targetId ? [artifact] : [] });
  for (let index = 0; index < 513; index += 1) {
    await createOperation(operation(`${prefix}${String(index).padStart(3, "0")}`));
  }
  const calls = new Map<string, number>();
  const scan = createOperationScanner((value) => {
    const id = String(value["operationId"]);
    calls.set(id, (calls.get(id) ?? 0) + 1);
    return { id, state: value["state"] };
  });
  const first = await scan(), second = await scan();
  assert.equal(first.length, 513);
  assert.equal(second.length, 513);
  assert.equal(calls.get(targetId), 1);
  assert.equal(calls.get(`${prefix}512`), 2);
  assert.equal([...calls.values()].reduce((sum, count) => sum + count, 0), 514);
  const targetPath = operationPath(targetId);
  const journal = await readFile(targetPath, "utf8"), journalInfo = await lstat(targetPath);
  await writeFile(targetPath, journal.replace('"completed"', '"tampered!"'));
  await utimes(targetPath, journalInfo.atime, journalInfo.mtime);
  const changedJournal = await scan();
  assert.equal(changedJournal.find((item) => item.id === targetId)?.state, "journal-unreadable");
  await writeFile(targetPath, journal);
  const restoredJournal = await scan();
  assert.equal(restoredJournal.find((item) => item.id === targetId)?.state, "completed");
  const artifactInfo = await lstat(artifact.path), artifactText = await readFile(artifact.path, "utf8");
  await writeFile(artifact.path, artifactText.replace('"a"', '"b"'));
  await utimes(artifact.path, artifactInfo.atime, artifactInfo.mtime);
  const changedArtifact = await scan();
  assert.equal(changedArtifact.find((item) => item.id === targetId)?.state, "journal-unreadable");
  await writeFile(artifact.path, artifactText);
  await updateOperation({ ...operation(targetId), state: "changed" });
  const validUpdate = await scan();
  assert.equal(validUpdate.find((item) => item.id === targetId)?.state, "changed");
});
