import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { prepareCurrentSymbolTransactionActor, verifyCurrentSymbolTransactionActor } from "../src/current-symbol-transaction-actor.ts";
import type { CurrentSymbolTransactionActorInput, CurrentSymbolTransactionActorPlan } from "../src/current-symbol-transaction-actor.ts";
import { HISTORY_TABLE, IDS, OPERATION, TIMES, WITNESS, applyEffect, encrypted, expectedRaw, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const UI_ACTOR = Object.freeze({ uuid: IDS.actor, username: "current-ui-name", nickname: "Current UI nickname" });
const BOUNDS = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, client: WITNESS.client,
  preDispatchMaxTicket: WITNESS.preDispatchMaxTicket, documentClockMinMs: WITNESS.serverClockMinMs,
  documentClockMaxMs: WITNESS.serverClockMaxMs, backendClockMinMs: WITNESS.serverClockMinMs,
  backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes });
function input(before: CurrentSymbolTransactionActorInput["before"]): CurrentSymbolTransactionActorInput {
  return { before, operation: OPERATION, startupActor: UI_ACTOR, cachedActor: UI_ACTOR, bounds: BOUNDS };
}
function currentRaw(): string { return expectedRaw().replace('"editVersion":"3.0"', '"editVersion":"3.2.206"'); }
function absentActorRaw(): string { return currentRaw().replace('"username":"synthetic-user"', '"username":""').replace('"nickname":"Synthetic"', '"nickname":""'); }
function replaceNewChunk(path: string, raw: string): void {
  mutate(path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.newHead, IDS.newKey)}' WHERE id=12`);
}

void test("actor wrapper derives success from full SQL effect while keeping UI and project names distinct", async () => {
  const data = await fixture(), plan = await prepareCurrentSymbolTransactionActor(input(data.before));
  assert.equal(plan.expectedActorUuid, IDS.actor); assert.equal(plan.expectedTicket, 101);
  assert.equal(plan.selectionPolicy, "supplied-agreeing-ui-and-single-original-project-user");
  assert.equal(typeof plan.selectedProjectUserRowSha256, "string");
  assert.equal(Object.hasOwn(plan, "selectedProjectUsersTableSha256"), false);
  assert.ok(Object.isFrozen(plan));
  applyEffect(data.path, currentRaw());
  const proof = await verifyCurrentSymbolTransactionActor(plan, await inventory(data.path));
  assert.equal(proof["transactionActorMatchesExpected"], true);
  assert.equal(proof["expectedActorUuid"], IDS.actor);
  assert.ok(Object.isFrozen(proof));
  for (const key of ["uiSelectionProvenanceVerified", "sourceOwnershipVerified", "sourceFreshnessVerified", "backendActorPreverified",
    "futureRequestActorVerified", "backendClockVerified", "producerBindingVerified", "generationClosureVerified", "persistentUploadReplayExcluded",
    "reopened", "writerReady", "executionAuthorized"]) {
    assert.equal(Reflect.get(plan, key), false); assert.equal(proof[key], false);
  }
  const fullSqlEffect = proof["fullSqlEffect"];
  assert.ok(typeof fullSqlEffect === "object" && fullSqlEffect !== null);
  assert.equal(Reflect.get(fullSqlEffect, "profile"), "easyeda-pro-control.current-symbol-new-head-full-sql-effect.v1");
  assert.equal(Reflect.get(fullSqlEffect, "exactLogicalSqlEffect"), true);
  replaceNewChunk(data.path, currentRaw().replace('"synthetic-user"', JSON.stringify(UI_ACTOR.username)));
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
});

void test("actor selection freezes caller projections, operation and bounds before awaited preparation", async () => {
  const data = await fixture(), startupActor = { ...UI_ACTOR };
  const cachedActor: { uuid: string; username: string; nickname: string } = { ...UI_ACTOR };
  const bounds = { ...BOUNDS };
  const operation = structuredClone(OPERATION);
  const pending = prepareCurrentSymbolTransactionActor({ before: data.before, operation, startupActor, cachedActor, bounds });
  startupActor.uuid = "a".repeat(32); cachedActor.username = "changed later";
  bounds.backendClockMaxMs = 1; operation.patch.name = "Changed later";
  const plan = await pending;
  assert.equal(plan.expectedActorUuid, IDS.actor);
  applyEffect(data.path, currentRaw());
  const proof = await verifyCurrentSymbolTransactionActor(plan, await inventory(data.path));
  assert.equal(proof["transactionActorMatchesExpected"], true);
});

void test("actor preparation refuses mismatched and malformed UI selections", async () => {
  const data = await fixture();
  for (const cachedActor of [{ ...UI_ACTOR, uuid: "a".repeat(32) }, { ...UI_ACTOR, username: "different" },
    { ...UI_ACTOR, nickname: "different" }, { ...UI_ACTOR, username: "" }, { ...UI_ACTOR, nickname: "x".repeat(1025) },
    { ...UI_ACTOR, uuid: 4 }, { ...UI_ACTOR, extra: true }]) {
    await assert.rejects(prepareCurrentSymbolTransactionActor({ ...input(data.before), cachedActor }), /actor|ACTOR/u);
  }
  let getterInvoked = false;
  const accessor = Object.defineProperty({ ...UI_ACTOR }, "uuid", { get: () => { getterInvoked = true; return IDS.actor; } });
  await assert.rejects(prepareCurrentSymbolTransactionActor({ ...input(data.before), startupActor: accessor }), /ACTOR/u);
  assert.equal(getterInvoked, false);
});

void test("actor preparation rejects duplicate project-user rows and malformed exact text", async () => {
  const data = await fixture();
  // A malformed synthetic schema removes native uniqueness to exercise the early selection refusal.
  mutate(data.path, `DROP TABLE users; CREATE TABLE users(uuid TEXT,username TEXT,nickname TEXT);
    INSERT INTO users(uuid,username,nickname) VALUES('${IDS.actor}','one','first'),('${IDS.actor}','two','second')`);
  const ambiguous = input(await inventory(data.path));
  await assert.rejects(prepareCurrentSymbolTransactionActor(ambiguous), /exactly one original project user/u);
  mutate(data.path, `DELETE FROM users; INSERT INTO users(uuid,username,nickname) VALUES('${IDS.actor}','one',CAST(X'80' AS TEXT))`);
  const malformed = input(await inventory(data.path));
  await assert.rejects(prepareCurrentSymbolTransactionActor(malformed), /exact bounded UTF8/u);
});

void test("absent project-user policy keeps the agreeing actor UUID and binds empty native names to the complete original users table", async () => {
  const data = await fixture();
  mutate(data.path, `UPDATE users SET uuid='${"a".repeat(32)}'`);
  const before = await inventory(data.path), users = before.tables.find(table => table.name === "users"); assert.ok(users);
  const plan = await prepareCurrentSymbolTransactionActor(input(before));
  assert.equal(plan.selectionPolicy, "supplied-agreeing-ui-and-no-original-project-user");
  assert.equal(plan.expectedActorUuid, IDS.actor); assert.equal(plan.selectedProjectUserRowSha256, null);
  assert.equal(plan.selectedProjectUsersTableSha256, sha256Json(users));
  applyEffect(data.path, absentActorRaw());
  const proof = await verifyCurrentSymbolTransactionActor(plan, await inventory(data.path));
  assert.equal(proof["transactionActorMatchesExpected"], true); assert.equal(proof["expectedActorUuid"], IDS.actor);
  assert.equal(proof["selectionPolicy"], plan.selectionPolicy); assert.equal(proof["selectedProjectUserRowSha256"], null);
  assert.equal(proof["selectedProjectUsersTableSha256"], sha256Json(users));
  assert.equal(proof["backendActorPreverified"], false); assert.equal(proof["executionAuthorized"], false);
});

void test("absent project-user policy refuses empty UI names and coherent alternative persisted actors", async () => {
  const data = await fixture(), foreign = "a".repeat(32);
  mutate(data.path, `UPDATE users SET uuid='${foreign}'`);
  const before = await inventory(data.path), missing = input(before);
  const emptyUi = { ...UI_ACTOR, username: "" };
  await assert.rejects(prepareCurrentSymbolTransactionActor({ ...missing, startupActor: emptyUi, cachedActor: emptyUi }), /ACTOR/u);
  const plan = await prepareCurrentSymbolTransactionActor(missing);
  applyEffect(data.path, absentActorRaw().replace(IDS.actor, foreign));
  mutate(data.path, `UPDATE projects SET modifier_uuid='${foreign}'`);
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
  replaceNewChunk(data.path, absentActorRaw());
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /projects/u);
});

void test("absent project-user policy never learns newly inserted user rows from after data", async () => {
  const data = await fixture(); mutate(data.path, "DELETE FROM users");
  const plan = await prepareCurrentSymbolTransactionActor(input(await inventory(data.path)));
  applyEffect(data.path, absentActorRaw());
  mutate(data.path, `INSERT INTO users(uuid,username,nickname) VALUES('${IDS.actor}','new row','new nickname')`);
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /users/u);
  replaceNewChunk(data.path, absentActorRaw().replace('"username":""', '"username":"new row"').replace('"nickname":""', '"nickname":"new nickname"'));
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
});

void test("absent project-user policy rejects substituting either UI display name for the native empty value", async () => {
  const data = await fixture(); mutate(data.path, "DELETE FROM users");
  const plan = await prepareCurrentSymbolTransactionActor(input(await inventory(data.path)));
  applyEffect(data.path, absentActorRaw());
  for (const name of ["username", "nickname"] as const) {
    replaceNewChunk(data.path, absentActorRaw().replace(`"${name}":""`, `"${name}":${JSON.stringify(UI_ACTOR[name])}`));
    await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
  }
});

void test("actor preparation refuses forged reader evidence and caller-supplied backend actor overrides", async () => {
  const data = await fixture();
  const fabricated = input(structuredClone(data.before));
  await assert.rejects(prepareCurrentSymbolTransactionActor(fabricated), /original inventory/u);
  const bounds = { ...BOUNDS, backendActorUuid: "a".repeat(32) };
  await assert.rejects(prepareCurrentSymbolTransactionActor({ ...input(data.before), bounds }), /input fields/u);
  const extended = { ...input(data.before), transactionActorMatchesExpected: true };
  await assert.rejects(prepareCurrentSymbolTransactionActor(extended), /input fields/u);
});

void test("actor comparison rejects serialized or reconstructed plans and inventories", async () => {
  const data = await fixture(), plan = await prepareCurrentSymbolTransactionActor(input(data.before));
  applyEffect(data.path, currentRaw()); const after = await inventory(data.path);
  await assert.rejects(verifyCurrentSymbolTransactionActor(structuredClone(plan), after), /original prepared plan/u);
  await assert.rejects(verifyCurrentSymbolTransactionActor({ ...plan }, after), /original prepared plan/u);
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, structuredClone(after)), /original inventory/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A fabricated success flag must not substitute for the issuer's original plan.
  const fabricated = { transactionActorMatchesExpected: true, exactLogicalSqlEffect: true } as unknown as CurrentSymbolTransactionActorPlan;
  await assert.rejects(verifyCurrentSymbolTransactionActor(fabricated, after), /original prepared plan/u);
});

void test("actor comparison rejects coherent alternative actors instead of learning them from after data", async () => {
  const data = await fixture(), plan = await prepareCurrentSymbolTransactionActor(input(data.before));
  const foreign = "a".repeat(32);
  applyEffect(data.path, currentRaw().replace(IDS.actor, foreign));
  mutate(data.path, `UPDATE projects SET modifier_uuid='${foreign}'`);
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
  replaceNewChunk(data.path, currentRaw());
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /projects/u);
});

void test("actor comparison preserves baseline project names and all collateral SQL cells", async () => {
  const data = await fixture(), plan = await prepareCurrentSymbolTransactionActor(input(data.before));
  applyEffect(data.path, currentRaw());
  mutate(data.path, "UPDATE users SET nickname='Changed after preparation'");
  replaceNewChunk(data.path, currentRaw().replace('"Synthetic"', '"Changed after preparation"'));
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
  replaceNewChunk(data.path, currentRaw());
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /users/u);
  mutate(data.path, "UPDATE users SET nickname='Synthetic'; UPDATE resources SET dataStr='changed peer'");
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /resources/u);
});

void test("actor comparison still requires the exact structure, document version and independent clocks", async () => {
  const data = await fixture(), plan = await prepareCurrentSymbolTransactionActor(input(data.before));
  applyEffect(data.path, currentRaw());
  mutate(data.path, "UPDATE project_structures SET ticket=100");
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /project_structures/u);
  mutate(data.path, "UPDATE project_structures SET ticket=101");
  replaceNewChunk(data.path, expectedRaw());
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /exact intended raw/u);
  replaceNewChunk(data.path, currentRaw().replace(String(TIMES.edit), String(BOUNDS.backendClockMaxMs + 1)));
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /timestamp.*clock witness/u);
  replaceNewChunk(data.path, currentRaw());
  mutate(data.path, `UPDATE "${HISTORY_TABLE}" SET created_at='2026-10-12 12:35:01',updated_at='2026-10-12 12:35:01' WHERE id=6`);
  await assert.rejects(verifyCurrentSymbolTransactionActor(plan, await inventory(data.path)), /SQL timestamp.*clock witness/u);
});
