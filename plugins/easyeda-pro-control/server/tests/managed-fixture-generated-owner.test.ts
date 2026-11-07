/* oxlint-disable import/max-dependencies -- Genuine completed synthetic SQL qualification is joined to the real retained owner and independent helper process transport. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { CurrentPcb209DiagnosticOwner, CurrentPcbSpatialOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { consumeManagedFixtureOpeningSource, stageManagedFixtureOpeningSource } from "../src/managed-fixture-opening-source.ts";
import { currentPcbOrdinaryReadRequestSchema } from "../src/current-pcb-ordinary-read-validation.ts";
import { currentPcbSpatialRequestSchema } from "../src/current-pcb-spatial-validation.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

const source = "const syntheticIdentity = true;\n";
async function fixture(context: TestContext, scenario = "opening-pcb-generated", generated = true, spatial = false): Promise<Readonly<{ owner: CurrentPcb209DiagnosticOwner; phases: string[] }>> {
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), scenario], { stdio: ["pipe", "pipe", "pipe"] });
  const phases: string[] = []; const originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    if (typeof args[0] === "string") {
      const value: unknown = JSON.parse(args[0]); assert.ok(value !== null && typeof value === "object");
      for (const key of ["generatedFixtureRegistrationPhase", "openingPhase"]) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key); const observed: unknown = descriptor?.value;
        if (descriptor !== undefined) { phases.push(String(observed)); }
      }
    }
    return originalWrite(...args);
  });
  const Owner = spatial ? CurrentPcbSpatialOwner : CurrentPcb209DiagnosticOwner;
  const owner = new Owner(child, () => Promise.resolve(), null, () => Promise.resolve(), generated); owner.start();
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.launch({ executable: "C:\\Synthetic\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true });
  await owner.browserObservation(); await owner.inspectFrames("target-1");
  await owner.inspectScript("frame-1", { family: "ui", relativePath: "pro-ui/test-version/js/ui.js", scriptSha256: createHash("sha256").update(source).digest("hex"), scriptBytes: Buffer.byteLength(source) });
  return { owner, phases };
}
async function close(owner: CurrentPcb209DiagnosticOwner): Promise<void> {
  assert.equal(await owner.observeApplicationWindow(), "456"); await owner.requestNormalClose("456");
  assert.equal(await owner.observeTermination(), true); await owner.releaseClosed(); assert.equal(owner.status().helperClosed, true);
}
void test("same-facade staging consumes only an original generated qualification and cannot transfer JSON or stage twice", async () => {
  const input = await managedFixtureInitialSqlFixture(), qualified = await qualifyGeneratedFixtureInitialSql(input);
  const staged = stageManagedFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive });
  assert.throws(() => consumeManagedFixtureOpeningSource(structuredClone(staged)));
  const retained = consumeManagedFixtureOpeningSource(staged); assert.equal(retained.qualification, qualified.qualification); assert.deepEqual(retained.archive, input.archive);
  assert.throws(() => consumeManagedFixtureOpeningSource(staged));
  assert.throws(() => stageManagedFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive }));
});
void test("fresh original generated birth registers once before existing project opening and retains two checkpoint reproof boundaries", async context => {
  const input = await managedFixtureInitialSqlFixture(), qualified = await qualifyGeneratedFixtureInitialSql(input), value = await fixture(context);
  let reproofs = 0;
  const result = await value.owner.openGeneratedFixtureProject(qualified.qualification, () => { reproofs += 1; return Promise.resolve(); });
  assert.equal(result.ok, true); assert.equal(reproofs, 2); assert.deepEqual(value.phases, ["register-generated-fixture", "preflight", "open-project"]);
  assert.equal(value.owner.retainedGeneratedFixtureRegistration()?.["recentPathRowMayHaveChanged"], true);
  assert.throws(() => value.owner.openGeneratedFixtureProject(qualified.qualification, () => Promise.resolve()), /CONSUMED/u);
  await close(value.owner);
});
void test("ambiguous registration and post-registration source failure consume the original stage and keep normal cleanup", async context => {
  const qualified = await qualifyGeneratedFixtureInitialSql(await managedFixtureInitialSqlFixture());
  const ambiguous = await fixture(context, "opening-pcb-generated-ambiguous");
  await assert.rejects(ambiguous.owner.openGeneratedFixtureProject(qualified.qualification, () => Promise.resolve()));
  assert.deepEqual(ambiguous.phases, ["register-generated-fixture"]);
  assert.throws(() => ambiguous.owner.openGeneratedFixtureProject(qualified.qualification, () => Promise.resolve()), /CONSUMED/u); await close(ambiguous.owner);
  const changed = await fixture(context); let reproofs = 0;
  await assert.rejects(changed.owner.openGeneratedFixtureProject(qualified.qualification, () => { reproofs += 1; return reproofs === 2 ? Promise.reject(new Error("source changed")) : Promise.resolve(); }));
  assert.deepEqual(changed.phases, ["register-generated-fixture", "preflight"]); assert.notEqual(changed.owner.retainedGeneratedFixtureRegistration(), null); await close(changed.owner);
  const old = await fixture(context, "opening-pcb-generated", false);
  assert.throws(() => old.owner.openGeneratedFixtureProject(qualified.qualification, () => Promise.resolve()), /CONSUMED/u); assert.deepEqual(old.phases, []); await close(old.owner);
});
void test("the generated public action accepts effects but never paths, targets, SQL, code or serialized qualification", () => {
  const request = { action: "open-generated-fixture", operationId: "pcb209-ordinary-generated", expectedBindingSha256: "a".repeat(64),
    confirmGeneratedDisposableFixture: true, acceptRecentPathRegistration: true, acceptNormalOpenEffects: true };
  assert.equal(currentPcbOrdinaryReadRequestSchema.safeParse(request).success, true);
  for (const key of ["target", "rawWindowsPath", "qualification", "source", "sql", "code"]) { assert.equal(currentPcbOrdinaryReadRequestSchema.safeParse({ ...request, [key]: "caller" }).success, false); }
  const spatial = { ...request, operationId: "pcb209-spatial-generated" };
  assert.equal(currentPcbSpatialRequestSchema.safeParse(spatial).success, true);
  assert.equal(currentPcbSpatialRequestSchema.safeParse({ ...spatial, target: "caller" }).success, false);
});
void test("generated spatial is a separate original birth that retains its own fixed pipeline and cannot upgrade old spatial owners", async context => {
  const qualified = await qualifyGeneratedFixtureInitialSql(await managedFixtureInitialSqlFixture());
  const value = await fixture(context, "opening-pcb-generated", true, true); let reproofs = 0;
  const result = await value.owner.openGeneratedFixtureProject(qualified.qualification, () => { reproofs += 1; return Promise.resolve(); });
  assert.equal(result.ok, true); assert.equal(reproofs, 2); assert.equal(value.owner.status().profile, "pcb-spatial209");
  assert.deepEqual(value.phases, ["register-generated-fixture", "preflight", "open-project"]);
  await close(value.owner);
  const old = await fixture(context, "opening-pcb-generated", false, true);
  assert.throws(() => old.owner.openGeneratedFixtureProject(qualified.qualification, () => Promise.resolve()), /CONSUMED/u);
  assert.deepEqual(old.phases, []); await close(old.owner);
});
