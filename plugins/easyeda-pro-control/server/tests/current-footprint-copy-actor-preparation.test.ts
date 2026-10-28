/** Synthetic original runner and completed SQL only. No native opening, clock
 * request, lifecycle publication or writer is dispatched by these tests. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintCopyActorProjection, requireCurrentFootprintCopyActorProjection } from "../src/current-footprint-copy-actor-projection.ts";
import { prepareCurrentFootprintCopyActorOwned, requireCurrentFootprintCopyActorOwned } from "../src/current-footprint-copy-actor-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REQUIREMENTS } from "../src/current-footprint-copy-clock-requirements.ts";
import type { CurrentFootprintCopyStatePacket } from "../src/current-footprint-copy-state.ts";
import { CurrentPcb209WorkerStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { currentFootprintCopyPreparationOpeningMethods } from "../src/current-footprint-copy-preparation-opening.ts";
import { CurrentPcbWorkerStartupActorRunner } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { IDS, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const IDENTITY = Object.freeze({ projectUuid: "1".repeat(64), branchUuid: IDS.branch, windowTabId: "synthetic-window" });
const STATE: CurrentFootprintCopyStatePacket = Object.freeze({ profile: "private.current-footprint-copy-state.v1",
  identity: IDENTITY, client: "a".repeat(16), maximumTicket: 100, capturedUser: "own-undefined", samples: 2,
  originalConstructorManagerMatched: true, atomicSnapshotVerified: false, cacheBranchObserved: false,
  executionAuthorized: false, persistenceVerified: false });
async function actorFixture(): Promise<Readonly<{
  observation: Readonly<{ runner: CurrentPcbWorkerStartupActorRunner; packet: Awaited<ReturnType<CurrentPcbWorkerStartupActorRunner["observe"]>> }>;
  expire: () => void;
  ownerChecks: () => number;
}>> {
  let current = true, ownerChecks = 0;
  const user = { uuid: IDS.actor, nickname: "UI nickname differs", username: "UI username differs", avatar: "" };
  const stamp = { milliseconds: 1_700_000_000_000, iso: "2023-11-14T22:13:20.000Z", timezoneOffsetMinutes: 0 };
  const reply = (phase: "ui" | "worker"): unknown => ({ result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-worker-startup-actor.v1", phase, identity: IDENTITY,
    workerUser: user, workerUserText: JSON.stringify(user), clock: { before: stamp, after: stamp },
    ...(phase === "ui" ? { cachedActor: { uuid: user.uuid, username: user.username, nickname: user.nickname },
      startupActor: { uuid: user.uuid, username: user.username, nickname: user.nickname } } :
      { originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
  }) } });
  const runner = new CurrentPcbWorkerStartupActorRunner({ observeUi: (): Promise<unknown> => Promise.resolve(reply("ui")),
    observeWorker: (): Promise<unknown> => Promise.resolve(reply("worker")),
    assertCurrent: (): Promise<void> => { ownerChecks += 1; assert.ok(current, "original actor owner expired"); return Promise.resolve(); },
  }, IDENTITY);
  return { observation: Object.freeze({ runner, packet: await runner.observe() }), expire: (): void => { current = false; },
    ownerChecks: (): number => ownerChecks };
}
function sqlFixture(): ReturnType<typeof fixture> {
  return fixture({ project: IDENTITY.projectUuid, branch: IDENTITY.branchUuid, target: IDS.target });
}

void test("footprint actor projection keeps manager undefined, project user and SQL backend names distinct", async () => {
  const db = await sqlFixture(), f = await actorFixture();
  const checksBefore = f.ownerChecks(), preparing = prepareCurrentFootprintCopyActorProjection(f.observation, db.before, STATE);
  await assert.rejects(prepareCurrentFootprintCopyActorProjection(f.observation, db.before, STATE), /consumed/u);
  const projection = await preparing; assert.equal(f.ownerChecks() - checksBefore, 2);
  assert.equal(projection.originalCompletedSqlRetained, true); assert.equal(projection.originalActorCollectionRetained, true);
  assert.equal(projection.originalFootprintStateRetained, false); assert.equal(projection.footprintCapturedUser, "own-undefined");
  assert.equal(projection.footprintDocheadUserOmitted, true);
  assert.deepEqual(projection.backendActorCandidate, { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" });
  assert.equal(projection.backendActorSelection, "one-original-project-user");
  assert.equal(projection.originalLocalDateSampleCount, 4);
  assert.equal(projection.backendActorProvenanceVerified, false); assert.equal(projection.clockProvenanceVerified, false);
  assert.equal(projection.buildStringServerClockObserved, false); assert.equal(projection.canvasStringServerClockObserved, false);
  assert.equal(await requireCurrentFootprintCopyActorProjection(projection, f.observation, db.before), projection);
  await assert.rejects(prepareCurrentFootprintCopyActorProjection(f.observation, db.before, STATE), /consumed/u);
  await assert.rejects(requireCurrentFootprintCopyActorProjection(structuredClone(projection), f.observation, db.before), /original actor preparation/u);
  f.expire(); await assert.rejects(requireCurrentFootprintCopyActorProjection(projection, f.observation, db.before), /expired/u);
  await assert.rejects(requireCurrentFootprintCopyActorProjection(projection, f.observation, db.before), /original actor preparation/u);
});

void test("footprint actor SQL absence selects empty names and rejects cloned provenance or a wrong project", async () => {
  const db = await sqlFixture(); mutate(db.path, "DELETE FROM users"); const before = await inventory(db.path);
  const f = await actorFixture(), projection = await prepareCurrentFootprintCopyActorProjection(f.observation, before, STATE);
  assert.deepEqual(projection.backendActorCandidate, { uuid: IDS.actor, username: "", nickname: "" });
  assert.equal(projection.selectedUserRowSha256, null); assert.equal(projection.backendActorSelection, "no-original-project-user");
  const copy = await actorFixture();
  const cloned = Object.freeze({ runner: copy.observation.runner, packet: structuredClone(copy.observation.packet) });
  await assert.rejects(prepareCurrentFootprintCopyActorProjection(cloned, before, STATE), /original completed packet/u);
  await assert.rejects(prepareCurrentFootprintCopyActorProjection(copy.observation, structuredClone(before), STATE), /reader|inventory|original/iu);
  const other = await actorFixture();
  await assert.rejects(prepareCurrentFootprintCopyActorProjection(other.observation, before,
    { ...STATE, identity: { ...STATE.identity, projectUuid: "2".repeat(64) } }), /identity differ/u);
});

void test("owned actor preparation refuses forged private openings and getter wrappers without executing them", async () => {
  let calls = 0;
  const getter = (): object => { calls += 1; return {}; };
  const forged = Object.freeze({ opening: Object.create(CurrentPcb209WorkerStartupOpening.prototype) as unknown,
    result: {}, assignments: {}, state: {}, actor: {}, preparation: {} });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forged original owner and tokens exercise private-field/data-descriptor refusal.
  const source = forged as Parameters<typeof prepareCurrentFootprintCopyActorOwned>[0];
  const wrapper = Object.freeze(Object.defineProperty({ ...source }, "actor", { get: getter }));
  await assert.rejects(prepareCurrentFootprintCopyActorOwned(wrapper), /data references/u);
  await assert.rejects(prepareCurrentFootprintCopyActorOwned(new Proxy(source,
    { getPrototypeOf(): object { calls += 1; return Object.prototype; } })), /fixed original/u);
  await assert.rejects(prepareCurrentFootprintCopyActorOwned(source), /original preparation/u);
  await assert.rejects(prepareCurrentFootprintCopyActorOwned(source), /consumed/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The forged actor getter must remain uncalled when the original private opening is absent.
  const forgedActor = Object.defineProperty({}, "originalActorPacket", { get: getter }) as typeof source.actor;
  await assert.rejects(currentFootprintCopyPreparationOpeningMethods(source.opening).originalActorObservation.call(source.opening,
    source.result, source.assignments, forgedActor), /private|class|object/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A public-shaped token cannot retrieve privately retained actor or copy inputs.
  await assert.rejects(requireCurrentFootprintCopyActorOwned({} as Parameters<typeof requireCurrentFootprintCopyActorOwned>[0], source.opening), /original owned actor/u);
  assert.equal(calls, 0);
});

void test("footprint clock contract requires both native qe call identities and preserves absent adapter accounting", () => {
  const requirement = CURRENT_FOOTPRINT_COPY_CLOCK_REQUIREMENTS;
  assert.deepEqual(requirement.documentProducers.map(value => [value.role, value.nativeCallOrdinal]), [["buildString", 1], ["canvasString", 2]]);
  assert.equal(requirement.distinctNativeResultsRequired, 2); assert.equal(requirement.resultValuesMayCoincide, true);
  assert.equal(requirement.callIdentityMayBeMerged, false); assert.equal(requirement.projectWorkerLocalDateMaySupplyServerTime, false);
  assert.equal(requirement.nativeClockRequestCount, null); assert.equal(requirement.nativeClockAdapterImplemented, false);
  assert.equal(requirement.backendClock.distinctFromDocumentClock, true);
  assert.equal(requirement.sqlDocumentWindow.coversBothDocumentResults, true); assert.equal(requirement.executionAuthorized, false);
});
