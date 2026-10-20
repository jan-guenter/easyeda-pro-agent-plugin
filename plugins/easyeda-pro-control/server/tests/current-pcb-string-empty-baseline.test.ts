import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbDiagnosticInteractionSchema } from "../src/current-pcb-diagnostic-interaction.ts";
import type { CurrentPcbDiagnosticRootInventory } from "../src/current-pcb-diagnostic-root-inventory.ts";
import { inspectCurrentPcbStringEmptyBaseline } from "../src/current-pcb-string-empty-baseline.ts";
import type { CurrentPcbStringEmptyBaseline } from "../src/current-pcb-string-empty-baseline.ts";
import { currentPcbDiagnosticInteractionFixture } from "./helpers/current-pcb-diagnostic-interaction-fixture.ts";

const DOCUMENT = "a".repeat(32);
const interaction = currentPcbDiagnosticInteractionSchema.parse(currentPcbDiagnosticInteractionFixture());
interaction.secondary.partitions = { marker: "present", count: 0 };
interaction.secondary.retainedLineMarker = "present";
interaction.secondary.retainedLines = { mapCount: 0, updateCount: 0 };
function tree(): CurrentPcbDiagnosticRootInventory["spatialIndexes"]["typed"] {
  return {
    outerKeyCount: 0, nestedKeyCount: 0, treeCount: 0, itemCount: 0, changeCount: 0, deadCount: 0,
    rootNodeCount: 0, rootLeafCount: 0, rootLeafWithoutItemCount: 0, rootLeafWithoutItemOrDeadCount: 0,
    itemWithoutRootLeafCount: 0, itemWithoutRootLeafOrChangeCount: 0, repeatedRootLeafCount: 0,
  };
}
function family(): { marker: string; count: number | null } { return { marker: "present", count: 0 }; }
const BASE = {
    root: {
      schema: "easyeda-pro-control.pcb-diagnostic-root-inventory.v1", documentUuid: DOCUMENT,
      families: Object.fromEntries(["tracks", "pads", "vias", "circles", "radiusDimensions", "rectangles", "strings",
        "protractorDimensions", "lengthDimensions", "smartDimensions", "components", "polygons", "images", "pictures",
        "copper", "inner", "groups"].map(name => [name, family()])),
      board: { ownerMarker: "present", boardMarker: "null", outlineCount: 0, autoGenerate: false },
      panelization: {
        ownerMarker: "present", viewModelMatchesOwner: true, activation: { on: false, success: false },
        counts: { items: 0, outlines: 0, slots: 0, originOutline: 0, holes: 0, positionHoles: 0, stampGroups: 0,
          marks: 0, vCutShapes: 0, closures: 0, borderClosuresFirst: 0, borderClosuresSecond: 0, borderClosuresOuterMost: 0 },
      },
      spatialIndexes: { typed: tree(), other: tree(), ratline: tree() }, interaction, collectionEntries: 3, treeCount: 0,
    },
    model: {
      schema: "easyeda-pro-control.pcb-diagnostic-model-state.v1",
      main: { uuid: DOCUMENT, uniqueId: "b".repeat(32), headType: "PCB", isProject: true, isInit: true,
        canSave: true, isInitIng: false, pendCacheLength: 0, pendingDocumentKeyCount: 0, cacheKeyCount: 0,
        deleteCacheCount: 0, subscriptionCount: 2, pendTimer: "null", pendPromise: "null", maxTicket: 10,
        pendingChange: false, localChange: false },
      loadedFootprintCount: 0, customFootprints: [],
      dynamicCopper: { openPcb: true, workerNameMarker: "null", workerName: null as number | null, timer: "null", bus: "null" },
    },
    pending: {
      schema: "easyeda-pro-control.pcb-diagnostic-pending-state.v1", documentUuid: DOCUMENT,
      copperUploads: { marker: "present", count: 0 }, planeUploads: { marker: "present", count: 0 },
      boardUpload: { marker: "present", flag: false }, commands: { undoCount: 0, redoCount: 0, activeStack: null },
      teardrops: { isMove: false, suspend: true, modifyCount: 0, taskCount: 0, modifyTearsCount: 0, timer: "null" },
      workerRegistry: { marker: "present", workers: { workerCount: 0, bridgeCount: 0, ratlineWorkerCount: 0,
        threadBusCount: 0, stateCount: 0, nextWorkerId: 1, nextThreadId: 0 } },
      dynamicCopper: { workerMarker: "null", workerId: null as number | null, busMarker: "null", association: "no-worker-id" },
    },
    strings: { schema: "easyeda-pro-control.pcb-diagnostic-raw-strings.v1", documentUuid: DOCUMENT, managerModelCount: 0, models: [] },
};
function fixture(): typeof BASE { return structuredClone(BASE); }
type Fixture = ReturnType<typeof fixture>;
interface Reply { result: { type: string; value: string } }
function reply(value: unknown): Reply { return { result: { type: "string", value: JSON.stringify(value) } }; }
function input(value = fixture()): { rootReply: Reply; modelReply: Reply; pendingReply: Reply; stringsReply: Reply } {
  return { rootReply: reply(value.root), modelReply: reply(value.model), pendingReply: reply(value.pending), stringsReply: reply(value.strings) };
}
function inspect(value = fixture()): CurrentPcbStringEmptyBaseline { return inspectCurrentPcbStringEmptyBaseline(DOCUMENT, input(value)); }
function assertUnmet(change: (value: Fixture) => void, name: string): void {
  const value = fixture(); change(value);
  const result = inspect(value);
  assert.equal(result.observedConditionsSatisfied, false); assert.ok(result.unmetConditions.includes(name));
  assert.equal(result.emptyRootPcbVerified, false); assert.equal(result.executionAuthorized, false);
}

void test("source-defined idle chain and empty smart command satisfy only the supplied subset", () => {
  const result = inspect();
  assert.equal(result.observedConditionsSatisfied, true);
  assert.deepEqual(result.unmetConditions, []);
  assert.equal(result.conditions.length, 47);
  assert.equal(result.remainingPrerequisites.length, 8);
  assert.ok(result.remainingPrerequisites.includes("ratline-model-view-and-network-secondary-indexes"));
  for (const [name, value] of Object.entries(result)) {
    if (name.endsWith("Verified") || name.endsWith("Authorized") || name === "writerSupported" || name === "continuousObservation") {
      assert.equal(value, false, name);
    }
  }
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.conditions[0]));
  assert.ok(Object.isFrozen(result.unmetConditions)); assert.ok(Object.isFrozen(result.remainingPrerequisites));
  assert.equal(inspect().observationSha256, result.observationSha256);
});

void test("empty family counters do not hide secondary roots or an independent command", () => {
  for (const [change, name] of [
    [(value: Fixture): void => { value.root.interaction.secondary.partitions.count = 1; }, "secondary.partitions-empty"],
    [(value: Fixture): void => { value.root.interaction.controllers.smart.commandCount = 1; }, "interaction.smart-command-empty"],
    [(value: Fixture): void => { value.root.interaction.controllers.turn.settleCallbackCount = 1; }, "interaction.turn-idle"],
    [(value: Fixture): void => { value.root.interaction.secondary.groupViews = 1; }, "secondary.dimension-and-group-views-empty"],
    [(value: Fixture): void => { value.root.interaction.secondary.retainedLines = { mapCount: 0, updateCount: 1 }; }, "secondary.retained-lines-empty"],
  ] as const) {
    assertUnmet(value => {
      change(value); value.root.interaction.collectionEntries += 1; value.root.collectionEntries += 1;
    }, name);
  }
  assertUnmet(value => { value.root.board.boardMarker = "present"; }, "root.board");
  assertUnmet(value => { value.root.panelization.activation.on = true; }, "root.panelization");
  assertUnmet(value => { value.root.interaction.secondary.innerViewManagerMatches = false; }, "secondary.inner-empty");
});

void test("missing manager markers remain unmet and raw timer states stay distinct", () => {
  for (const marker of ["absent", "undefined", "null"]) {
    assertUnmet(value => { value.root.families["images"] = { marker, count: null }; }, "root.family.images");
    assertUnmet(value => { value.root.interaction.secondary.partitions = { marker: "null", count: null }; }, "secondary.partitions-empty");
  }
  assertUnmet(value => { value.root.interaction.toolChain.rightDownTimer = "present"; }, "interaction.no-mouse-or-wheel-timer");
  assertUnmet(value => { value.root.interaction.controllers.attributeTimer = "present"; }, "interaction.attribute-tool-unused");
  assertUnmet(value => { value.pending.teardrops.timer = "present"; }, "pending.teardrops-idle");
  const value = fixture(); value.root.interaction.controllers.attributeTimer = "undefined";
  assert.equal(inspect(value).observedConditionsSatisfied, true);
  assert.notEqual(inspect(value).observationSha256, inspect().observationSha256);
});

void test("all four documents and duplicated String and copper observations must agree", () => {
  for (const change of [
    (value: Fixture): void => { value.root.documentUuid = "c".repeat(32); },
    (value: Fixture): void => { value.model.main.uuid = "c".repeat(32); },
    (value: Fixture): void => { value.pending.documentUuid = "c".repeat(32); },
    (value: Fixture): void => { value.strings.documentUuid = "c".repeat(32); },
  ]) { assertUnmet(change, "identity.document"); }
  assertUnmet(value => {
    value.root.families["strings"] = { marker: "present", count: 1 }; value.root.collectionEntries += 1;
  }, "identity.string-membership");
  assertUnmet(value => { value.model.dynamicCopper.workerNameMarker = "undefined"; }, "identity.dynamic-copper");
  assertUnmet(value => {
    value.model.dynamicCopper.workerNameMarker = "present"; value.model.dynamicCopper.workerName = 0;
  }, "compiler.no-dynamic-copper");
});

void test("compiler and shared pending work are first-create exclusions, not post-create rules", () => {
  for (const [change, name] of [
    [(value: Fixture): void => { value.model.main.canSave = false; }, "compiler.ready"],
    [(value: Fixture): void => { value.model.main.pendCacheLength = 1; }, "compiler.no-pending-data"],
    [(value: Fixture): void => { value.model.main.localChange = true; }, "compiler.no-pending-data"],
    [(value: Fixture): void => { value.model.loadedFootprintCount = 1; }, "compiler.no-loaded-footprints"],
    [(value: Fixture): void => { value.pending.boardUpload.flag = true; }, "pending.uploads-empty"],
    [(value: Fixture): void => { value.pending.commands.undoCount = 1; }, "pending.history-unused"],
    [(value: Fixture): void => { value.pending.workerRegistry.workers.workerCount = 1; }, "pending.workers-empty"],
  ] as const) { assertUnmet(change, name); }
});

void test("strict original decoders and own-data envelope reject malformed inputs without traps", () => {
  let reads = 0;
  const hostile = new Proxy({}, { ownKeys: (): never => { reads += 1; throw new Error("TRAP"); } });
  assert.throws(() => inspectCurrentPcbStringEmptyBaseline(DOCUMENT, hostile), /PCB_STRING_EMPTY_BASELINE_INPUT/u);
  assert.throws(() => inspectCurrentPcbStringEmptyBaseline(DOCUMENT, Object.defineProperty(input(), "rootReply",
    { get: () => { reads += 1; throw new Error("GETTER"); } })), /PCB_STRING_EMPTY_BASELINE_INPUT/u);
  assert.throws(() => inspectCurrentPcbStringEmptyBaseline(DOCUMENT, { ...input(), executionAuthorized: true }),
    /PCB_STRING_EMPTY_BASELINE_INPUT/u);
  assert.throws(() => inspectCurrentPcbStringEmptyBaseline(DOCUMENT, { ...input(), pendingReply: undefined }),
    /PCB_DIAGNOSTIC_PENDING_REPLY/u);
  const malformed = fixture(); Object.assign(malformed.root.interaction.controllers, { latentTimerObserved: true });
  assert.throws(() => inspect(malformed), /PCB_DIAGNOSTIC_ROOT_INVENTORY_REPLY/u);
  const missing = fixture(); Reflect.deleteProperty(missing.root.interaction.controllers, "attributeTimer");
  assert.throws(() => inspect(missing), /PCB_DIAGNOSTIC_ROOT_INVENTORY_REPLY/u);
  const negativeZero = input();
  negativeZero.rootReply.result.value = negativeZero.rootReply.result.value.replace('"lockedLayerCount":0', '"lockedLayerCount":-0');
  assert.throws(() => inspectCurrentPcbStringEmptyBaseline(DOCUMENT, negativeZero), /PCB_DIAGNOSTIC_ROOT_INVENTORY_REPLY/u);
  assert.equal(reads, 0);
});
