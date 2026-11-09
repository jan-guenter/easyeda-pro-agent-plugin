/** Real byte transport and genuine generated SQL-data qualification. Peer
 * replies are inert; no native owner or Main callback authority is supplied. */
import assert from "node:assert/strict";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentSchematicDisplayWritePipe, CurrentSchematicRelevanceDisplayWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import { decodeCurrentSchematicRelevanceDisplayRegistrationNavigation } from "../src/current-schematic-relevance-display-registration.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

async function qualification(): Promise<QualifiedGeneratedSchematicRelevanceFixtureTarget> {
  const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance"); const result = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(input); return result.qualification;
}
function navigationReply(target: QualifiedGeneratedSchematicRelevanceFixtureTarget["target"], prior: boolean): object {
  const registration = { schema: "easyeda-pro-control.generated-fixture-path-registration.v1", projectUuid: target.projectUuid, rawWindowsPath: target.rawWindowsPath,
    beforeRegistrySha256: "1".repeat(64), afterRegistrySha256: (prior ? "1" : "2").repeat(64), beforeCount: prior ? 1 : 0, afterCount: 1,
    registrationDispatched: !prior, priorRegistrationPresent: prior, exactOtherRegistrationRosterUnchanged: true, selectedRawPathMatched: true,
    selectedNonCbbMatched: true, recentPathRowMayHaveChanged: !prior, projectNavigationDispatched: false, cadEditDispatched: false, explicitSaveDispatched: false,
    persistentRegistrationVerified: false, replayAllowed: false, writerAuthority: false };
  const value = { schema: "easyeda-pro-control.generated-schematic-navigation.v1", target, state: "settled", outcome: "partial-or-refused", attempted: ["registration", "project-preflight"],
    failedStage: "project-preflight", registration, projectPreflight: null, project: null, pagePreflight: null, page: null, identity: null,
    originalContextIntact: true, replayAllowed: false, persistentRegistrationVerified: false, completeSourceVerified: false, persistenceVerified: false, connectivityVerified: false, executionAuthorized: false, explicitSaveDispatched: false };
  const json = JSON.stringify(value); return { result: { type: "object", value: { navigation: { schema: "easyeda-pro-control.exact-json.v1", json, utf8Bytes: Buffer.byteLength(json) }, documentTitle: "Inert Start Page" } } };
}
function pipeFixture(context: TestContext): Readonly<{ pipe: CurrentSchematicRelevanceDisplayWritePipe; input: PassThrough; sent: Record<string, unknown>[]; original: { pending: Promise<unknown> | null }; reply: object | null; setReply: (value: object) => void }> {
  const input = new PassThrough(); const sent: Record<string, unknown>[] = []; const original: { pending: Promise<unknown> | null } = { pending: null }; let selected: object | null = null;
  const holder: { pipe: CurrentSchematicRelevanceDisplayWritePipe | null } = { pipe: null };
  const output = new Writable({ write(chunk: Buffer, _encoding, done): void {
    const raw: unknown = JSON.parse(chunk.subarray(0, -1).toString()); assert.ok(raw !== null && typeof raw === "object" && "id" in raw && "method" in raw); const command = Object.fromEntries(Object.entries(raw)); sent.push(command);
    if (command["method"] === "Target.attachToTarget") { input.write(`${JSON.stringify({ id: command["id"], result: { sessionId: "original-ui" } })}\0`); }
    else { assert.ok(original.pending !== null && holder.pipe !== null); holder.pipe.requireOriginalSchematicRelevanceDisplayRegistrationPending(original.pending); assert.ok(selected !== null); input.write(`${JSON.stringify({ id: command["id"], sessionId: command["sessionId"], result: selected })}\0`); }
    done();
  } });
  const pipe = new CurrentSchematicRelevanceDisplayWritePipe(input, output); holder.pipe = pipe; pipe.start(); context.after(() => { input.destroy(); output.destroy(); });
  return Object.freeze({ pipe, input, sent, original, reply: selected, setReply: (value: object): void => { selected = value; } });
}
void test("original navigation is retained before synchronous output/reply, and only actual prior-path data can skip Main", async context => {
  const qualified = await qualification(); const f = pipeFixture(context); await f.pipe.attachTarget("original-ui-target", (): void => { assert.fail("No events expected"); });
  const reply = navigationReply(qualified.target, true); assert.ok("result" in reply && reply.result !== null && typeof reply.result === "object"); f.setReply(reply);
  assert.throws(() => f.pipe.observeSchematicOperation("navigate", "original-context", qualified.target), /ORIGINAL_REGISTRATION_REQUIRED/u); const before = f.sent.length;
  const pending = f.pipe.navigateSchematicRelevanceDisplayRegistered("original-context", qualified.target, original => { f.original.pending = original; f.pipe.requireOriginalSchematicRelevanceDisplayRegistrationPending(original); });
  assert.ok(f.original.pending !== null); const original = f.original.pending; const raw = await pending; assert.equal(await original, raw); assert.notEqual(pending, original); assert.equal(f.sent.length, before + 1);
  assert.throws(() => { f.pipe.requireOriginalSchematicRelevanceDisplayRegistrationPending(original); }, /ORIGINAL_PENDING/u);
  f.pipe.requireOriginalSchematicRelevanceDisplayRegistrationNoDispatch(original, qualified);
  assert.throws(() => { f.pipe.requireOriginalSchematicRelevanceDisplayRegistrationNoDispatch(pending, qualified); }, /ORIGINAL_NO_DISPATCH/u);
  assert.throws(() => f.pipe.navigateSchematicRelevanceDisplayRegistered("original-context", qualified.target, (): void => { assert.fail("Never called"); }), /REGISTRATION_ONCE/u);
  assert.equal(decodeCurrentSchematicRelevanceDisplayRegistrationNavigation(raw, qualified).navigation.registration?.priorRegistrationPresent, true);
});
void test("an actual dispatched registration reply cannot be reclassified as prior-path or copied qualification", async context => {
  const qualified = await qualification(); const f = pipeFixture(context); await f.pipe.attachTarget("original-ui-target", (): void => { assert.fail("No events expected"); });
  const reply = navigationReply(qualified.target, false); assert.ok("result" in reply && reply.result !== null && typeof reply.result === "object"); f.setReply(reply);
  await f.pipe.navigateSchematicRelevanceDisplayRegistered("original-context", qualified.target, original => { f.original.pending = original; }); assert.ok(f.original.pending !== null);
  assert.throws(() => { f.pipe.requireOriginalSchematicRelevanceDisplayRegistrationNoDispatch(f.original.pending ?? Promise.resolve(), qualified); }, /NO_DISPATCH_REQUIRED/u);
  assert.throws(() => decodeCurrentSchematicRelevanceDisplayRegistrationNavigation(reply, structuredClone(qualified)), /original|Original/u);
  const input = new PassThrough(); const output = new PassThrough(); const old = new CurrentSchematicDisplayWritePipe(input, output); old.start(); context.after(() => { input.destroy(); output.destroy(); });
  // oxlint-disable-next-line typescript/unbound-method -- Intentionally borrow this original method to prove the old receiver refuses before writing or calling the retainer.
  const method = CurrentSchematicRelevanceDisplayWritePipe.prototype.navigateSchematicRelevanceDisplayRegistered;
  assert.throws(() => Reflect.apply(method, old, ["original-context", qualified.target, (): void => { assert.fail("No borrowed callback"); }]), /REGISTRATION_ONCE/u);
});
