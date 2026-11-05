import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildManagedFixtureImportPrograms, managedFixtureImportJobObservationSchema, validateManagedFixtureImportJobObservation } from "../src/managed-fixture-import-program.ts";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";

// Golden SHA-256 of the literal Windows path C:\PrivateFixtures\original\Fixture.eprj2.
const UUID = "bbd7e0ad75800669f5a66d2b188d835a3eafef02da50da748f58dd6cac5bda3d", plan = { operationId: "fixture-import-synthetic", nonce: "2".repeat(64),
  archiveName: "Fixture.epro2", destinationWindowsDirectory: "C:\\PrivateFixtures\\original" };
const PROJECT = { itemType: "Project", uuid: UUID, friendlyName: "Fixture", folderUuid: undefined, teamUuid: "synthetic-owner" };
const archive = managedProjectFootprintArchive([{ name: "project2.json", content: '{"title":"Fixture"}' },
  { name: "Fixture.epru", content: '{"type":"DOCHEAD"}||{"uuid":"1234567890abcdef","docType":"PCB"}|\n{"type":"META","id":"META"}||{"title":"Fixture"}|\n' }]);
const programs = buildManagedFixtureImportPrograms(plan, archive);
function fixture(options: Readonly<{ throwSynchronously?: boolean; wrongReturn?: boolean }> = {}): Readonly<{
  run: (program: string) => Promise<unknown>; calls: () => number; args: () => readonly unknown[];
  resolve: (value: unknown) => void; reject: (error: Error) => void; changeOwner: () => void;
}> {
  let count = 0; let captured: readonly unknown[] = [];
  const pending = Promise.withResolvers<unknown>();
  const manager = { importProjectByProjectFile(...args: readonly unknown[]): unknown {
    count += 1; captured = args;
    if (options.throwSynchronously === true) { throw new Error("Synthetic partial failure"); }
    return options.wrongReturn === true ? { incomplete: true } : pending.promise;
  } };
  const location = { href: "https://client/editor?cll=debug", origin: "https://client" };
  const host = { currentProject: null as unknown };
  const root: Record<string, unknown> = { atob, crypto: webcrypto, File, Promise, location, gVars: host,
    UI: { gVars: host }, PRO_EDITOR_MODE: "CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    eda: { extensionUuid: "7e06d286b1ac846ef7eab9c7f2a9ee40", sys_FileManager: manager } };
  const context = createContext(root);
  runInContext("globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};", context);
  return { run: async (program) => { const result: unknown = runInContext(`(async function(){${program}})()`, context); return await result; },
    calls: () => count, args: () => captured, resolve: (value) => {
      root["syntheticValue"] = value;
      const sameRealm: unknown = runInContext("typeof syntheticValue==='object' && syntheticValue!==null ? JSON.parse(JSON.stringify(syntheticValue)) : syntheticValue", context);
      pending.resolve(sameRealm);
    }, reject: pending.reject,
    changeOwner: () => { host.currentProject = { projectId: "unexpected" }; } };
}
function observation(value: unknown): ReturnType<typeof managedFixtureImportJobObservationSchema.parse> {
  return managedFixtureImportJobObservationSchema.parse(value);
}

void test("synthetic original import Promise remains pending across repeated observations and is never redispatched", async () => {
  const native = fixture(); const first = observation(await native.run(programs.launch));
  assert.equal(first.state, "pending"); assert.equal(first.originalPromiseRetained, true);
  for (let index = 0; index < 3; index += 1) { assert.equal(observation(await native.run(programs.observe)).sdkOutcome, "pending"); }
  assert.equal(native.calls(), 1);
  const args = native.args(); assert.equal(args[1], "EasyEDA Pro");
  assert.deepEqual(structuredClone(args[3]), { operation: "Offline Client Local Path", folderPath: plan.destinationWindowsDirectory });
  const file = args[0]; assert.ok(file instanceof File);
  assert.equal(Object.hasOwn(file, "path"), false);
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), archive);
  native.resolve(PROJECT);
  await Promise.resolve();
  const settled = observation(await native.run(programs.observe));
  assert.equal(settled.state, "sdk-settled"); assert.equal(settled.returnedUuid, UUID);
  assert.equal(settled.expectedProjectUuid, UUID); assert.equal(settled.expectedIdentityMatched, true);
  for (const key of ["delayedNativeJobsCompleted", "registrationVerified", "closedSqlVerified", "originalClosureVerified", "retryAllowed", "executionAuthorized"] as const) {
    assert.equal(settled[key], false);
  }
  await assert.rejects(native.run(programs.launch), /REFUSED/u);
  assert.equal(native.calls(), 1);
});

void test("synthetic rejection and missing or unexpected native returns preserve possible partial effects and forbid retry", async () => {
  for (const outcome of ["rejected", "fulfilled-undefined", "fulfilled-other", "synchronous-throw"] as const) {
    const native = fixture({ throwSynchronously: outcome === "synchronous-throw", wrongReturn: outcome === "fulfilled-other" });
    await native.run(programs.launch);
    if (outcome === "rejected") { native.reject(new Error("Synthetic delayed native failure")); }
    else if (outcome === "fulfilled-undefined") { native.resolve(void 0); }
    await Promise.resolve();
    const result = observation(await native.run(programs.observe));
    assert.equal(result.sdkOutcome, outcome);
    assert.equal(result.nativeEffectsMayHaveOccurred, true); assert.equal(result.retryAllowed, false);
    await assert.rejects(native.run(programs.launch)); assert.equal(native.calls(), 1);
  }
});

void test("synthetic owner drift retains the original acknowledgment while blocking any completion claim", async () => {
  const native = fixture(); await native.run(programs.launch); native.changeOwner(); native.resolve(PROJECT);
  await Promise.resolve();
  const result = observation(await native.run(programs.observe));
  assert.equal(result.ownerIntact, false); assert.equal(result.returnedUuid, UUID); assert.equal(result.executionAuthorized, false);
  const unopened = fixture(); await assert.rejects(unopened.run(programs.observe), /ORIGINAL_JOB_MISSING/u);
  unopened.changeOwner(); await assert.rejects(unopened.run(programs.launch)); assert.equal(unopened.calls(), 0);
});

void test("internal program grammar rejects path substitution and contradictory serialized job evidence", () => {
  for (const destinationWindowsDirectory of [String.raw`C:\..\escape`, String.raw`C:\unsafe.\dir`, String.raw`\\server\share`, "C:\\a\\", "/mnt/c/fixture", String.raw`C:\CON\target`, String.raw`C:\space \target`]) {
    assert.throws(() => buildManagedFixtureImportPrograms({ ...plan, destinationWindowsDirectory }, archive));
  }
  assert.throws(() => managedFixtureImportJobObservationSchema.parse({ schema: "easyeda-pro-control.managed-fixture-import-job-observation.v1" }));
});

void test("serialized observations cannot substitute another archive or operation", async () => {
  const native = fixture(); const first = await native.run(programs.launch);
  assert.equal(validateManagedFixtureImportJobObservation(first, plan, archive).state, "pending");
  assert.throws(() => validateManagedFixtureImportJobObservation(first, { ...plan, nonce: "3".repeat(64) }, archive));
  assert.throws(() => managedFixtureImportJobObservationSchema.parse({ ...observation(first), state: "sdk-settled" }));
});

void test("an unexpected cloud or local project identity remains visible without becoming registration evidence", async () => {
  const native = fixture(); await native.run(programs.launch);
  native.resolve({ ...PROJECT, uuid: "a".repeat(32) }); await Promise.resolve();
  const result = observation(await native.run(programs.observe));
  assert.equal(result.sdkOutcome, "fulfilled-project"); assert.equal(result.returnedUuid, "a".repeat(32));
  assert.equal(result.expectedIdentityMatched, false); assert.equal(result.registrationVerified, false);
  assert.equal(validateManagedFixtureImportJobObservation(result, plan, archive).expectedIdentityMatched, false);
  assert.throws(() => validateManagedFixtureImportJobObservation({ ...result, expectedIdentityMatched: true }, plan, archive));
});
