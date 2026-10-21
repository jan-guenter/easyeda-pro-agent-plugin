/* oxlint-disable import/max-dependencies -- One synthetic lifecycle fixture joins real plan issuers, original SQL readers and source-shaped replies without CAD IO. */
import assert from "node:assert/strict";
import { CurrentPcbStringActorClockRunner } from "../../src/current-pcb-string-actor-clock-runner.ts";
import { planCurrentPcbStringCreate } from "../../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../../src/current-pcb-string-create-observation.ts";
import { prepareCurrentPcbStringHistory } from "../../src/current-pcb-string-history.ts";
import { CurrentPcbStringLifecycleLedger } from "../../src/current-pcb-string-lifecycle-ledger.ts";
import { planCurrentPcbStringPublication } from "../../src/current-pcb-string-publication.ts";
import { planCurrentPcbStringSaveObservation } from "../../src/current-pcb-string-save-observation.ts";
import { prepareCurrentPcbStringSaveProvenance } from "../../src/current-pcb-string-save-provenance.ts";
import { decodeNativeHistoryChunk } from "../../src/native-history.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";

const primitiveId = "d".repeat(16), project = "a".repeat(64), windowTabId = WITNESS.client;
const target = Object.freeze({ projectUuid: project, branchUuid: IDS.branch, documentUuid: IDS.target, tabId: `${IDS.target}@${project}` });
const identity = Object.freeze({ projectUuid: project, branchUuid: IDS.branch, documentUuid: IDS.target, windowTabId });
const user = Object.freeze({ uuid: IDS.actor, nickname: "UI nickname", username: "UI name", avatar: "" });
const actor = Object.freeze({ uuid: IDS.actor, username: user.username, nickname: user.nickname });
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function structure(saved = false): string {
  return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: {
    uuid: IDS.target, title: "Empty PCB", board: "", parent_uuid: "", source: "",
    version: saved ? String(TIMES.document) : "1", updateTime: saved ? TIMES.document : 1,
  } }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor } });
}
export function stringLedgerRaw(models: readonly unknown[] = []): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-raw-strings.v1",
    documentUuid: target.documentUuid, managerModelCount: models.length, models }) } };
}
function rawModel(): Record<string, unknown> {
  return { globalIndex: primitiveId, modelType: "Text", zIndex: { kind: "absent" }, partition: { kind: "absent" },
    groupId: { kind: "absent" }, parent: { kind: "absent" }, number: { kind: "absent" }, dataState: 65, matrixChange: false,
    key: "", value: "Test", position: { x: 12, y: -45 }, rotation: 0,
    base: { kind: "U8", num: 1, type: 0, origin: 3, strokeWidth: 0.8, mirror: false, showKey: false, showValue: true,
      fontFamily: "default", fontSize: 12, reverse: false, reverseExpansion: 0, positionIsNull: false,
      silkColor: { kind: "value", value: { r: 0, g: 0, b: 0, alpha: 1 } }, layerId: { kind: "absent" }, locked: { kind: "absent" } },
    box: { kind: "value", value: { layerId: 3, locked: false, leftLow: { x: 12, y: -45 }, leftUp: { x: 12, y: -33 },
      rightLow: { x: 35.989999999999995, y: -45 }, rightUp: { x: 35.989999999999995, y: -33 } } },
    stateWatcher: { kind: "value", value: "reciprocal-yr" } };
}
export async function stringLedgerActorCollection(): Promise<{
  runner: CurrentPcbStringActorClockRunner; packet: Awaited<ReturnType<CurrentPcbStringActorClockRunner["observe"]>>;
  expire: () => void;
}> {
  let current = true;
  const runner = new CurrentPcbStringActorClockRunner({
    request: (command): Promise<unknown> => {
      const stamp = { milliseconds: 1000, iso: new Date(1000).toISOString(), timezoneOffsetMinutes: 0 };
      const common = { schema: "easyeda-pro-control.pcb-string-actor-clock.v1", phase: command.actorClockPhase,
        clock: { before: stamp, after: stamp } };
      const value = command.actorClockPhase === "pcb" ? common : { ...common, identity, workerUser: user,
        workerUserText: JSON.stringify(user), ...(command.actorClockPhase === "ui" ? { cachedActor: actor, startupActor: actor } : {}) };
      return Promise.resolve({ result: { type: "string", value: JSON.stringify(value) } });
    },
    assertCurrent(): void { assert.equal(current, true, "original actor owner lost"); },
  }, { ui: "synthetic-ui", worker: "synthetic-worker", pcb: "synthetic-pcb" }, identity);
  return { runner, packet: await runner.observe(), expire(): void { current = false; } };
}
interface LedgerFixture {
  readonly path: string;
  readonly before: Awaited<ReturnType<typeof inventory>>;
  readonly candidate: ReturnType<typeof planCurrentPcbStringCreate>;
  readonly createPlan: ReturnType<typeof planCurrentPcbStringCreateObservation>;
  readonly publication: ReturnType<typeof planCurrentPcbStringPublication>;
  readonly result: Readonly<Record<string, unknown>>;
  readonly createResult: string;
  readonly saveResult: string;
  readonly beforeRaw: unknown;
  readonly afterRaw: unknown;
  readonly capture: unknown;
  readonly provenance: ReturnType<typeof prepareCurrentPcbStringSaveProvenance>;
  readonly history: ReturnType<typeof prepareCurrentPcbStringHistory>;
  readonly witness: Readonly<{ projectUuid: string; branchUuid: string; backendClockMinMs: number;
    backendClockMaxMs: number; backendLocalOffsetMinutes: number }>;
  readonly apply: () => void;
}
export async function stringLedgerFixture(): Promise<LedgerFixture> {
  const base = await fixture({ project, branch: IDS.branch, target: IDS.target });
  const table = base.before.tables.find(entry => entry.name === "history_data"); assert.ok(table);
  const cell = table.rows[0]?.cells[table.columns.findIndex(column => column["name"] === "dataStr")]; assert.ok(cell?.kind === "text");
  const raw = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(cell.hex, "hex").toString() });
  const rows = raw.split("|\n");
  rows[1] = `{"type":"DOCHEAD","ticket":1}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16),
    uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" })}`;
  rows[2] = '{"type":"META","ticket":1,"id":"META"}||{"title":"Empty PCB","parent":"","source":"","board":"","zIndex":null}';
  const changed = rows.join("|\n"), encoded = encrypted(changed, IDS.oldHead, IDS.oldKey);
  mutate(base.path, `UPDATE history_data SET dataStr=${literal(encoded)} WHERE id=7;
    UPDATE project_structures SET structure=${literal(structure())};`);
  const before = await inventory(base.path), candidate = planCurrentPcbStringCreate({ x: 120, y: -450, text: "Test" });
  const createPlan = planCurrentPcbStringCreateObservation(candidate, target);
  const publication = planCurrentPcbStringPublication(candidate, createPlan,
    { primitiveId, client: WITNESS.client, uniqueId: "synthetic-string-token", maximumTicket: 100 });
  const result = { profile: "private.current-pcb-string-create-dormant-result.v1", planSha256: createPlan.planSha256,
    completed: true, stage: "complete", dispatchAttempts: 1, acknowledgedPrimitiveId: primitiveId, matchingBeforeSamples: 2,
    matchingAfterSamples: 2, readback: { globalIndex: primitiveId, ...createPlan.expectedExposedScalars }, deadlineExpired: false };
  const createResult = JSON.stringify(result), savePlan = planCurrentPcbStringSaveObservation(createPlan, createResult);
  const saveResult = JSON.stringify({ profile: "private.current-pcb-string-save-dormant-result.v1", planSha256: savePlan.planSha256,
    primitiveId, completed: true, stage: "complete", saveAttempted: true, saveAcknowledgment: true,
    beforeIdentity: true, afterIdentity: true, deadlineExpired: false });
  const clocks = { minimumMs: WITNESS.serverClockMinMs, maximumMs: WITNESS.serverClockMaxMs };
  const history = prepareCurrentPcbStringHistory(candidate, publication, { maximumTargetHeaderTime: 1, saveTime: TIMES.document,
    backendTime: TIMES.edit, saveClock: clocks, backendClock: clocks, workerUser: user,
    backendActor: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" } });
  const witness = { projectUuid: project, branchUuid: IDS.branch, backendClockMinMs: clocks.minimumMs,
    backendClockMaxMs: clocks.maximumMs, backendLocalOffsetMinutes: 120 };
  const { runner, packet } = await stringLedgerActorCollection();
  const provenance = prepareCurrentPcbStringSaveProvenance(runner, packet, before);
  const payloadJson = JSON.stringify([{ [IDS.target]: { ...publication.expectedPayload[0][IDS.target], length: 0 } },
    ...publication.expectedPayload.slice(1)]);
  const capture = { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-string-publication-capture.v1",
    identity: { projectUuid: project, branchUuid: IDS.branch, windowTabId, channelName: `/${windowTabId}/project/${project}` },
    topic: "/pro-mgr/worker/batchPendData", armed: true, finished: true, cleanup: "cancelled-tombstone-retained", firstFailure: null,
    overflow: false, lateCallbackObserved: false, observedCallbacks: 1, callbackCountExact: true,
    totalPayloadBytes: Buffer.byteLength(payloadJson), observedSubscriptionIntervalComplete: true,
    events: [{ sequence: 1, status: "payload", payloadJson, error: null }] }) } };
  const afterRaw = stringLedgerRaw([rawModel()]), beforeRaw = stringLedgerRaw();
  return { path: base.path, before, candidate, createPlan, publication, result, createResult, saveResult, beforeRaw, afterRaw,
    capture, provenance, history, witness, apply(): void {
      applyEffect(base.path, history.chunkText);
      mutate(base.path, `UPDATE project_structures SET ticket=102,structure=${literal(structure(true))} WHERE branch_uuid='${IDS.branch}'`);
    } };
}
export async function stringLedgerThroughPublication(id: string): Promise<LedgerFixture & Readonly<{
  ledger: CurrentPcbStringLifecycleLedger; create: Awaited<ReturnType<CurrentPcbStringLifecycleLedger["reserveCreate"]>>;
}>> {
  const f = await stringLedgerFixture(), ledger = await CurrentPcbStringLifecycleLedger.prepare(id, f.candidate, f.createPlan, f.before);
  const create = await ledger.reserveCreate(); await ledger.recordCreateOutcome(create, f.createResult);
  await ledger.comparePostCreate(f.publication, f.beforeRaw, f.beforeRaw, f.afterRaw, f.afterRaw, f.publication.expectedPayload);
  await ledger.compareDeliveredPublication(f.capture);
  return { ...f, ledger, create };
}
