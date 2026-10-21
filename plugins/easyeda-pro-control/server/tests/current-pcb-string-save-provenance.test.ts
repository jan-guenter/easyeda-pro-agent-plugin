/** Synthetic actor replies and private SQLite fixtures only. No CAD/native IO. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbStringActorClockRunner } from "../src/current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringActorClockPacket } from "../src/current-pcb-string-actor-clock-runner.ts";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { prepareCurrentPcbStringHistory } from "../src/current-pcb-string-history.ts";
import type { CurrentPcbStringHistoryProjection } from "../src/current-pcb-string-history.ts";
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";
import { compareCurrentPcbStringSaveHistoryProvenance, prepareCurrentPcbStringSaveProvenance,
  requireOriginalCurrentPcbStringSaveProvenance } from "../src/current-pcb-string-save-provenance.ts";
import { IDS, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: IDS.branch,
  documentUuid: IDS.target, windowTabId: "original-string-window" });
const USER = Object.freeze({ uuid: IDS.actor, nickname: "UI nickname", username: "UI username", avatar: "" });
const CONTEXTS = Object.freeze({ ui: "original-ui", worker: "original-worker", pcb: "original-pcb" });
const ACTOR = Object.freeze({ uuid: USER.uuid, username: USER.username, nickname: USER.nickname });
const SQL_ACTOR = Object.freeze({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" });
function collection(): Readonly<{ runner: CurrentPcbStringActorClockRunner; expire: () => void }> {
  let current = true;
  const runner = new CurrentPcbStringActorClockRunner({
    async request(command): Promise<unknown> {
      const stamp = { milliseconds: 1000, iso: new Date(1000).toISOString(), timezoneOffsetMinutes: 0 };
      const common = { schema: "easyeda-pro-control.pcb-string-actor-clock.v1", phase: command.actorClockPhase,
        clock: { before: stamp, after: stamp } };
      const user = { identity: IDENTITY, workerUser: USER, workerUserText: JSON.stringify(USER) };
      const value = command.actorClockPhase === "pcb" ? common : { ...common, ...user,
        ...(command.actorClockPhase === "ui" ? { cachedActor: ACTOR, startupActor: ACTOR } : {}) };
      await Promise.resolve(); return { result: { type: "string", value: JSON.stringify(value) } };
    },
    assertCurrent(): void { assert.equal(current, true, "original owner lost"); },
  }, CONTEXTS, IDENTITY);
  return { runner, expire(): void { current = false; } };
}
async function setup(): Promise<ReturnType<typeof collection> & Awaited<ReturnType<typeof fixture>> & {
  packet: CurrentPcbStringActorClockPacket;
}> {
  const f = collection(), packet = await f.runner.observe();
  const database = await fixture({ project: IDENTITY.projectUuid, branch: IDENTITY.branchUuid, target: IDENTITY.documentUuid });
  return { ...f, packet, ...database };
}
function history(backendActor: Readonly<{ uuid: string; username: string; nickname: string }> = SQL_ACTOR,
  workerUser: typeof USER = USER): CurrentPcbStringHistoryProjection {
  const candidate = planCurrentPcbStringCreate({ x: 100, y: -200, text: "Original String" });
  const create = planCurrentPcbStringCreateObservation(candidate, { projectUuid: IDENTITY.projectUuid,
    branchUuid: IDENTITY.branchUuid, documentUuid: IDENTITY.documentUuid,
    tabId: `${IDENTITY.documentUuid}@${IDENTITY.projectUuid}` });
  const publication = planCurrentPcbStringPublication(candidate, create, { primitiveId: "d".repeat(16),
    client: "e".repeat(16), uniqueId: "string-token", maximumTicket: 100 });
  return prepareCurrentPcbStringHistory(candidate, publication, { maximumTargetHeaderTime: 0, saveTime: 2000, backendTime: 3000,
    saveClock: { minimumMs: 1999, maximumMs: 2001 }, backendClock: { minimumMs: 2999, maximumMs: 3001 },
    workerUser, backendActor });
}
void test("String issuance joins original actor collection and SQL names without promoting any clock or backend authority", async () => {
  const f = await setup(), token = prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, f.before);
  assert.equal(requireOriginalCurrentPcbStringSaveProvenance(token, f.runner, f.packet, f.before), token);
  assert.equal(token.workerUserText, JSON.stringify(USER));
  assert.deepEqual(token.backendActorCandidate, { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" });
  assert.equal(token.backendActorSelection, "one-original-project-user"); assert.notEqual(token.selectedUserRowSha256, null);
  assert.equal(token.originalLocalClockSampleCount, 6);
  for (const key of ["nativeOwnerVerified", "sqlSourceOwnershipVerified", "sourceFreshnessVerified", "backendRequestActorVerified",
    "backendActorProvenanceVerified", "windowsClockProvenanceVerified", "saveClockProvenanceVerified", "serverClockObserved",
    "workerUserFutureUseVerified", "executionAuthorized", "saveAuthorized"] as const) { assert.equal(token[key], false); }
  const joined = compareCurrentPcbStringSaveHistoryProvenance(token, history());
  assert.equal(joined.historyActorBytesMatchOriginalSelection, true); assert.equal(joined.clockProvenanceVerified, false);
  assert.equal(joined.originalSaveVerified, false); assert.equal(joined.executionAuthorized, false);
  assert.throws(() => prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, f.before), /already consumed/u);
});
void test("String SQL actor absence keeps empty backend names, not observed UI names", async () => {
  const f = await setup(); mutate(f.path, "DELETE FROM users"); const before = await inventory(f.path);
  const token = prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, before);
  assert.equal(token.backendActorSelection, "no-original-project-user"); assert.equal(token.selectedUserRowSha256, null);
  assert.deepEqual(token.backendActorCandidate, { uuid: IDS.actor, username: "", nickname: "" });
  assert.equal(compareCurrentPcbStringSaveHistoryProvenance(token, history({ uuid: IDS.actor, username: "", nickname: "" }))
    .historyActorBytesMatchOriginalSelection, true);
  assert.throws(() => compareCurrentPcbStringSaveHistoryProvenance(token, history()), /exact actor bytes/u);
});
void test("String issuer rejects copied inventories, packets and method-forged runners before adoption", async () => {
  const f = await setup();
  assert.throws(() => prepareCurrentPcbStringSaveProvenance(f.runner, structuredClone(f.packet), f.before), /original/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately fake class instance must fail private-field ownership checks.
  const impostor = Object.create(CurrentPcbStringActorClockRunner.prototype) as CurrentPcbStringActorClockRunner;
  Object.defineProperty(impostor, "requireOriginalPacket", { value: () => f.packet });
  assert.throws(() => prepareCurrentPcbStringSaveProvenance(impostor, f.packet, f.before));
  assert.throws(() => prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, structuredClone(f.before)), /original inventory/u);
  // Even a refused SQL admission consumes the original actor packet.
  assert.throws(() => prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, f.before), /already consumed/u);
});
void test("Original String token cannot cross lifetimes or recover after owner loss", async () => {
  const f = await setup(), other = await setup(), token = prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, f.before);
  assert.throws(() => requireOriginalCurrentPcbStringSaveProvenance(structuredClone(token), f.runner, f.packet, f.before), /original current/u);
  assert.throws(() => requireOriginalCurrentPcbStringSaveProvenance(token, other.runner, other.packet, f.before), /original current/u);
  assert.throws(() => requireOriginalCurrentPcbStringSaveProvenance(token, f.runner, f.packet, other.before), /original current/u);
  f.expire(); assert.throws(() => compareCurrentPcbStringSaveHistoryProvenance(token, history()), /owner lost/u);
  assert.throws(() => requireOriginalCurrentPcbStringSaveProvenance(token, f.runner, f.packet, f.before), /original current/u);
});
void test("String history joins preserve worker JSON order and distinguish UI versus SQL actor names", async () => {
  const f = await setup(), token = prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, f.before);
  assert.throws(() => compareCurrentPcbStringSaveHistoryProvenance(token, structuredClone(history())), /original history/u);
  assert.throws(() => compareCurrentPcbStringSaveHistoryProvenance(token, history(ACTOR)), /exact actor bytes/u);
  const reordered = { uuid: USER.uuid, username: USER.username, nickname: USER.nickname, avatar: USER.avatar };
  assert.throws(() => compareCurrentPcbStringSaveHistoryProvenance(token, history(undefined, reordered)), /exact actor bytes/u);
});
void test("Original SQL project and branch association must match the String actor collection", async () => {
  const f = await setup(), other = await fixture();
  assert.throws(() => prepareCurrentPcbStringSaveProvenance(f.runner, f.packet, other.before), /project\/branch differ/u);
});
