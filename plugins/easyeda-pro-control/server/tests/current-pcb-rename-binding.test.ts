/** Original synthetic completed SQL readers and data-only observations.
 * No native worker/process ownership or connected preflight is fabricated.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertOriginalCurrentPcbRenameBinding, prepareCurrentPcbRenameBinding, verifyCurrentPcbRenamePreflightBinding } from "../src/current-pcb-rename-binding.ts";
import type { CurrentPcbRenameBinding } from "../src/current-pcb-rename-binding.ts";
import { CURRENT_PCB_RENAME_PREFLIGHT_LIMITATIONS } from "../src/current-pcb-rename-preflight.ts";
import { inventoryForOriginalCurrentPcbRenamePreparation, prepareCurrentPcbRename } from "../src/current-pcb-rename-preparation.ts";
import { IDS, TIMES, WITNESS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const BOARD = "a".repeat(16), DESIRED = "Renamed PCB", PROJECT = "1".repeat(64), TITLE = "PCB1";
const TARGET = Object.freeze({ projectUuid: PROJECT, branchUuid: IDS.branch, ownerUuid: IDS.actor, pcbUuid: IDS.target });
const CLOCK = Object.freeze({ projectUuid: PROJECT, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: WITNESS.client,
  documentClockMinMs: TIMES.document - 500, documentClockMaxMs: TIMES.document + 500,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: 120 });
const STORED_USER = Object.freeze({ uuid: IDS.peer, username: "prior-user", nickname: "Historical", avatar: "" });
interface Options {
  readonly title?: string;
  readonly peerTitle?: string;
  readonly desiredTitle?: string;
  readonly laterHeader?: Readonly<{ ticket: number; updateTime: number; version: string }>;
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function record(identity: unknown, body?: unknown): string { return `${JSON.stringify(identity)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function header(uuid: string, updateTime = 1, version = "1"): Record<string, unknown> {
  return { docType: "PCB", client: "b".repeat(16), uuid, updateTime, version, editVersion: "3.0", user: STORED_USER };
}
function meta(title: string): Record<string, unknown> { return { title, parent: "", source: "", board: BOARD, zIndex: null }; }
function treeEntry(uuid: string, title: string, updateTime = 1, version = "1"): Record<string, unknown> {
  return { uuid, title, board: BOARD, parent_uuid: "", source: "", version, updateTime };
}
async function setup(options: Options = {}): Promise<Readonly<{ path: string; before: Parameters<typeof prepareCurrentPcbRename>[0]["before"];
  preparation: Awaited<ReturnType<typeof prepareCurrentPcbRename>> }>> {
  const original = await fixture(), peerTitle = options.peerTitle ?? "Peer PCB", title = options.title ?? TITLE;
  const raw = [record({ type: "EDIT_HEAD" }, { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: 1 }),
    record({ type: "DOCHEAD", ticket: 453 }, header(IDS.target)), record({ type: "META", ticket: 450, id: "META" }, meta(title)),
    record({ type: "LINE", ticket: 451, id: "deleted-shape" }, { x: 0 }), record({ type: "LINE", ticket: 452, id: "deleted-shape" }),
    ...(options.laterHeader === undefined ? [] : [record({ type: "DOCHEAD", ticket: options.laterHeader.ticket },
      header(IDS.target, options.laterHeader.updateTime, options.laterHeader.version))]),
    record({ type: "DOCHEAD", ticket: 777 }, header(IDS.peer)), record({ type: "META", ticket: 12, id: "META" }, meta(peerTitle)),
    record({ type: "DOCHEAD", ticket: 2 }, { ...header(BOARD), docType: "BOARD" }),
    record({ type: "META", ticket: 2, id: "META" }, { title: "Board", zIndex: null })].join("|\n");
  const latest = options.laterHeader !== undefined && options.laterHeader.ticket > 453 ? options.laterHeader : { updateTime: 1, version: "1" };
  const tree = JSON.stringify({ boards: { [BOARD]: { uuid: BOARD, title: "Board", zIndex: null } }, schematics: {}, sheets: {}, pcbs: {
    [IDS.target]: treeEntry(IDS.target, title, latest.updateTime, latest.version), [IDS.peer]: treeEntry(IDS.peer, peerTitle) },
  panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: null } });
  mutate(original.path, [`UPDATE projects SET uuid='${PROJECT}',ticket=777`, `UPDATE branches SET project_uuid='${PROJECT}'`,
    `UPDATE project_images SET project_uuid='${PROJECT}'`,
    `UPDATE project_structures SET project_uuid='${PROJECT}',ticket=777,structure=${literal(tree)}`,
    `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`].join(";"));
  const before = await inventory(original.path), preparation = await prepareCurrentPcbRename({ before, target: TARGET,
    desiredTitle: options.desiredTitle ?? DESIRED, witness: CLOCK });
  return { path: original.path, before, preparation };
}
function bindingFor(input: Awaited<ReturnType<typeof setup>>): Promise<CurrentPcbRenameBinding> {
  return prepareCurrentPcbRenameBinding({ before: input.before, preparation: input.preparation });
}
function observation(binding: CurrentPcbRenameBinding): Record<string, unknown> {
  return { ...CURRENT_PCB_RENAME_PREFLIGHT_LIMITATIONS, ok: true, kind: "current-pcb-rename-preflight", ...structuredClone(binding.request),
    samples: 2, currentTabId: "0", peers: structuredClone(binding.peers), nativeNameAvailableObserved: true, completeNativePcbMapObserved: true,
    expectedBeforeMatched: true, noEditorTabsObserved: true, hiddenEditorsAbsentObserved: true, dirtyTabsAbsentObserved: true,
    cachedProjectReadOnlyAbsentObserved: true, concurrentStrictModeAbsentObserved: true,
    clientTicketObservation: { client: binding.client, maxTicket: binding.maximumTicket, samples: 4 },
    runtimeObservation: { editorVersion: "3.2.206", actor: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" },
      clockSamples: [0, 1, 2, 3].map(index => ({ rendererBeforeMs: 1000 + index * 3, serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
      backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false } };
}

void test("PCB binding derives raw display/folded titles, data ticket and complete peers from its original reader", async () => {
  const input = await setup(); const binding = await bindingFor(input);
  assert.equal(inventoryForOriginalCurrentPcbRenamePreparation(input.preparation), input.before);
  assert.deepEqual(binding.request, { target: TARGET, expectedBefore: { title: "pcb1", displayTitle: TITLE, parentUuid: "", source: "",
    version: "1", boardUuid: BOARD, ticket: 452, updateTime: 1, docType: 3 }, desiredTitle: DESIRED });
  assert.equal(binding.maximumTicket, 777); assert.equal(binding.peers[1]?.ticket, 12);
  assert.equal(input.preparation.baseline.maximumTargetHeaderTime, 1);
  assert.equal(binding.sqlSha256, input.before.logicalSha256); assert.equal(binding.checkpointSha256, input.before.checkpointSha256);
  assert.equal(binding.preparationSha256, input.preparation.preparationSha256); assert.equal(binding.rawHistorySha256, input.preparation.baseline.rawHistorySha256);
  assertOriginalCurrentPcbRenameBinding(binding, input.preparation);
  assert.ok(Object.isFrozen(binding)); assert.ok(Object.isFrozen(binding.request.expectedBefore)); assert.ok(Object.isFrozen(binding.peers[0]));
  const result = verifyCurrentPcbRenamePreflightBinding(binding, observation(binding));
  assert.equal(result["originalSqlComparisonMatched"], true); assert.equal(result["peerCount"], 2);
  for (const key of ["executionAuthorized", "originalOwnerVerified", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified",
    "nativeNamePolicyVerified", "queueCompletionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"] as const) {
    assert.equal(binding[key], false); assert.equal(result[key], false);
  }
});

void test("PCB binding rejects JSON copies and a second complete reader even when all content digests match", async () => {
  const input = await setup(); const binding = await bindingFor(input), second = await inventory(input.path);
  assert.equal(second.logicalSha256, input.before.logicalSha256); assert.equal(second.checkpointSha256, input.before.checkpointSha256);
  await assert.rejects(prepareCurrentPcbRenameBinding({ before: second, preparation: input.preparation }), /original prepared SQL/u);
  await assert.rejects(prepareCurrentPcbRenameBinding({ before: structuredClone(input.before), preparation: input.preparation }), /original prepared SQL/u);
  await assert.rejects(prepareCurrentPcbRenameBinding({ before: input.before, preparation: structuredClone(input.preparation) }), /original PCB preparation/u);
  assert.throws(() => inventoryForOriginalCurrentPcbRenamePreparation(structuredClone(input.preparation)), /original PCB preparation/u);
  assert.throws(() => verifyCurrentPcbRenamePreflightBinding(structuredClone(binding), observation(binding)), /original PCB binding/u);
  assert.throws(() => { assertOriginalCurrentPcbRenameBinding(structuredClone(binding), input.preparation); }, /original PCB binding/u);
  assert.throws(() => { assertOriginalCurrentPcbRenameBinding(binding, structuredClone(input.preparation)); }, /original preparation\/reader/u);
  const secondPreparation = await prepareCurrentPcbRename({ before: input.before, target: TARGET, desiredTitle: DESIRED, witness: CLOCK });
  assert.equal(secondPreparation.preparationSha256, input.preparation.preparationSha256);
  assert.throws(() => { assertOriginalCurrentPcbRenameBinding(binding, secondPreparation); }, /original preparation\/reader/u);
});

void test("PCB binding refuses accessors without reading them and rejects extra input fields", async () => {
  const input = await setup(); let accessed = false;
  const getter = (): never => { accessed = true; throw new Error("unexpected getter"); };
  for (const key of ["before", "preparation"]) {
    await assert.rejects(prepareCurrentPcbRenameBinding(Object.defineProperty({ before: input.before, preparation: input.preparation }, key, { get: getter })), /accessors/u);
  }
  const extra = { ...input, extra: true }; await assert.rejects(prepareCurrentPcbRenameBinding(extra), /own-data/u);
  const binding = await prepareCurrentPcbRenameBinding({ before: input.before, preparation: input.preparation }), raw = observation(binding);
  Object.defineProperty(raw, "peers", { get: getter }); assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, raw), /accessors/u);
  const nested = observation(binding); nested["runtimeObservation"] = Object.defineProperty({}, "clockSamples", { get: getter });
  assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, nested), /accessors/u); assert.equal(accessed, false);
});

void test("PCB complete-map binding rejects extra/missing/drifted peers and DOCHEAD/global ticket substitution", async () => {
  const input = await setup(); const binding = await bindingFor(input), raw = observation(binding);
  for (const peers of [binding.peers.slice(0, 1), [...binding.peers, { ...binding.peers[1], uuid: "f".repeat(16) }],
    binding.peers.map((peer, index) => index === 1 ? { ...peer, boardUuid: "" } : peer),
    binding.peers.map((peer, index) => index === 1 ? { ...peer, ticket: 777 } : peer)]) {
    assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw, peers }), /complete observed PCB map/u);
  }
  for (const ticket of [453, 777]) {
    assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw,
      expectedBefore: { ...binding.request.expectedBefore, ticket }, peers: binding.peers.map(peer => peer.uuid === IDS.target ? { ...peer, ticket } : peer) }));
  }
  for (const clientTicketObservation of [{ client: "c".repeat(16), maxTicket: 777, samples: 4 },
    { client: binding.client, maxTicket: 778, samples: 4 }]) {
    assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw, clientTicketObservation }), /client\/global ticket/u);
  }
  assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw, desiredTitle: "Different" }));
});

void test("PCB binding reserves locale-invariant ASCII for existing peers and the future saved title", async () => {
  for (const options of [{ title: "PCB I" }, { title: "PCB İ" }, { peerTitle: "CAFÉ" }, { peerTitle: "I" }, { desiredTitle: "Renamed I" }, { desiredTitle: "Renamed Ω" }]) {
    const input = await setup(options); await assert.rejects(bindingFor(input), /locale-invariant ASCII/u);
  }
  const input = await setup({ title: "Pcb i 09_-", desiredTitle: "Desired i 09_-" }); const binding = await bindingFor(input);
  assert.equal(binding.request.expectedBefore.title, "pcb i 09_-"); assert.equal(binding.request.desiredTitle, "Desired i 09_-");
  assert.equal(binding.nativeNamePolicyVerified, false);
});

void test("PCB binding admits monotone positive header times and stable versions on ties", async () => {
  for (const laterHeader of [{ ticket: 454, updateTime: 2, version: "2" }, { ticket: 454, updateTime: 1, version: "1" }]) {
    const input = await setup({ laterHeader }); const binding = await bindingFor(input);
    assert.equal(binding.request.expectedBefore.updateTime, laterHeader.updateTime);
    assert.equal(binding.request.expectedBefore.version, laterHeader.version); assert.equal(binding.request.expectedBefore.ticket, 452);
  }
});

void test("PCB binding refuses zero/fallback times, header ticket regression and conflicting tied-time versions", async () => {
  for (const laterHeader of [{ ticket: 454, updateTime: 0, version: "0" }, { ticket: 452, updateTime: 2, version: "2" },
    { ticket: 454, updateTime: 1, version: "2" }]) {
    const input = await setup({ laterHeader }); await assert.rejects(bindingFor(input), /time\/version order/u);
  }
});

void test("PCB binding keeps data matching separate from observed UI identity and all native authority", async () => {
  const input = await setup(); const binding = await bindingFor(input), raw = observation(binding);
  // UI identity is deliberately not promoted to the backend actor in the plan.
  const runtime = raw["runtimeObservation"]; assert.ok(runtime !== null && typeof runtime === "object");
  const altered = { ...raw, runtimeObservation: { ...runtime, actor: { uuid: IDS.peer, username: "another-ui", nickname: "UI only" } } };
  assert.equal(verifyCurrentPcbRenamePreflightBinding(binding, altered)["actorProvenanceVerified"], false);
  for (const key of Object.keys(CURRENT_PCB_RENAME_PREFLIGHT_LIMITATIONS)) {
    assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw, [key]: true }));
  }
  assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw, extra: true }));
  assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, { ...raw, peers: Array.from({ length: 4097 }, () => null) }), /bound/u);
  const cyclic: Record<string, unknown> = {}; cyclic["next"] = cyclic;
  assert.throws(() => verifyCurrentPcbRenamePreflightBinding(binding, cyclic), /bound/u);
});
