/** Pure exclusions for the first String on a supplied empty PCB observation.
 * No caller data establishes an original scope, complete baseline or write token.
 * The four diagnostic samples are non-atomic, even when every condition matches.
 */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeCurrentPcbDiagnosticModelReply } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticPendingReply } from "./current-pcb-diagnostic-pending-program.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { decodeCurrentPcbDiagnosticRootInventoryReply } from "./current-pcb-diagnostic-root-inventory.ts";
import type { CurrentPcbDiagnosticRootInventory } from "./current-pcb-diagnostic-root-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const LIMITS = Object.freeze({
  originalScopeVerified: false, sourceOwnershipVerified: false, completeModelMembershipVerified: false,
  emptyRootPcbVerified: false, completeLiveBaselineVerified: false, completeStoredBaselineVerified: false,
  completePendingProducerInventoryVerified: false, projectWorkerAssociationVerified: false,
  queueCompletionVerified: false, persistenceVerified: false, renderingVerified: false,
  saveAuthorized: false, writerSupported: false, executionAuthorized: false, continuousObservation: false,
} as const);

const REMAINING = Object.freeze([
  "original-renderer-and-project-worker-association",
  "complete-stored-source-history-assets-and-renderer-correlation",
  "ratline-model-view-and-network-secondary-indexes",
  "latent-eL-move-closure-or-owned-fresh-no-interaction-lifecycle",
  "complete-compiler-channel-registry-and-lock-state",
  "startup-and-extension-subscriber-effects",
  "one-shot-create-id-membership-publication-and-post-create-effect",
  "one-shot-save-intent-complete-closed-sql-fresh-reopen-and-visual-result",
] as const);

const REPLY_FIELDS = ["rootReply", "modelReply", "pendingReply", "stringsReply"] as const;
type ReplyField = typeof REPLY_FIELDS[number];
type Replies = Readonly<Record<ReplyField, unknown>>;
type Root = CurrentPcbDiagnosticRootInventory;
type Condition = Readonly<{ name: string; satisfied: boolean }>;

function refuse(): never { throw new Error("PCB_STRING_EMPTY_BASELINE_INPUT"); }
function replies(input: unknown): Replies {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== REPLY_FIELDS.length ||
      keys.some(key => typeof key !== "string" || !REPLY_FIELDS.some(field => field === key))) { return refuse(); }
  const result: Record<ReplyField, unknown> = { rootReply: undefined, modelReply: undefined, pendingReply: undefined, stringsReply: undefined };
  for (const field of REPLY_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(input, field);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return refuse(); }
    result[field] = descriptor.value as unknown;
  }
  return result;
}

function emptyCounts(counts: Readonly<Record<string, number>>): boolean {
  return Object.values(counts).every(value => value === 0);
}
function absentReference(marker: string): boolean {
  // The observer distinguishes these raw states. None is a present reference;
  // This classification does not erase the original marker in the input digest.
  return marker === "absent" || marker === "undefined" || marker === "null";
}
function add(conditions: Condition[], name: string, satisfied: boolean): void {
  conditions.push({ name, satisfied });
}

function rootConditions(root: Root, conditions: Condition[]): void {
  for (const [name, family] of Object.entries(root.families)) {
    // Lazy/missing owners are not a sampled empty map. Keep them unmet rather
    // Than claiming complete exclusion from an absent singleton.
    add(conditions, `root.family.${name}`, family.marker === "present" && family.count === 0);
  }
  const { board, panelization, spatialIndexes } = root;
  add(conditions, "root.board", board.ownerMarker === "present" && board.boardMarker !== null &&
    absentReference(board.boardMarker) && board.outlineCount === 0 && board.autoGenerate === false);
  add(conditions, "root.panelization", panelization.ownerMarker === "present" &&
    panelization.viewModelMatchesOwner === true && panelization.activation?.on === false &&
    !panelization.activation.success && panelization.counts !== null && emptyCounts(panelization.counts));
  for (const [name, tree] of Object.entries(spatialIndexes)) {
    // Empty retained tree/layer keys are permissible. Any node/leaf divergence
    // Or pending change/dead membership is excluded from this first fixture.
    add(conditions, `root.spatial.${name}`, tree.itemCount === 0 && tree.changeCount === 0 && tree.deadCount === 0 &&
      tree.rootLeafCount === 0 && tree.rootNodeCount === tree.treeCount &&
      tree.rootLeafWithoutItemCount === 0 && tree.rootLeafWithoutItemOrDeadCount === 0 &&
      tree.itemWithoutRootLeafCount === 0 && tree.itemWithoutRootLeafOrChangeCount === 0 &&
      tree.repeatedRootLeafCount === 0);
  }
}

function interactionConditions(root: Root, conditions: Condition[]): void {
  const { toolChain, scene, selection, controllers, secondary } = root.interaction;
  const nav = toolChain.navigation;
  const idle = nav?.idle;
  add(conditions, "interaction.idle-tool-chain", toolChain.nextMarker === "present" && toolChain.nextKind === "m0e" &&
    nav !== null && !nav.drawing && nav.filterCount === 0 && !nav.mouseRightDown && !nav.mouseMidDown &&
    nav.markCount === 0 && absentReference(nav.shiftHelp) && nav.nextMarker === "present" && nav.nextKind === "Eh" &&
    idle !== null && idle !== undefined && !idle.drawing && idle.filterCount === 0 && idle.next === "null");
  add(conditions, "interaction.no-mouse-or-wheel-timer", absentReference(toolChain.rightDownTimer) &&
    absentReference(toolChain.mouseDownMarker) && nav !== null && absentReference(nav.wheelTimer));
  add(conditions, "interaction.selection-mode", scene.modes.length === 1 && scene.modes[0] === 3 &&
    scene.dropDrag && scene.historyToolCount === 0);
  add(conditions, "interaction.selection-empty", emptyCounts(selection.counts) && !selection.mouseLeftDown &&
    !selection.mouseLeftUp && !selection.dragging && !selection.readyToCopyDragging &&
    !selection.keepSelection && !selection.specialPaste && absentReference(selection.dialog));
  add(conditions, "interaction.controllers-idle", absentReference(controllers.pointControl) &&
    controllers.lockedLayerCount === 0 && !controllers.mouseMoveCheck && !controllers.mouseAltDown && !controllers.hasAlt &&
    absentReference(controllers.layerTool) && absentReference(controllers.routeTool) &&
    absentReference(controllers.attributeTool) && absentReference(controllers.flipMoveTool) && !controllers.flipping);
  add(conditions, "interaction.tool-history-empty", controllers.toolHistory === null ?
    absentReference(controllers.toolHistoryMarker) :
    absentReference(controllers.toolHistory.activeTool) && absentReference(controllers.toolHistory.activeId));
  add(conditions, "interaction.attribute-tool-unused", absentReference(controllers.attributeType) &&
    !controllers.attributesUnmounted && absentReference(controllers.attributeTimer));
  const { smart, turn } = controllers;
  add(conditions, "interaction.smart-command-empty", absentReference(smart.control) && absentReference(smart.dimension) &&
    absentReference(smart.start) && absentReference(smart.end) && smart.startSpotCount === 0 && smart.highlightSpotCount === 0 &&
    smart.historyItemCount === 0 && smart.commandCount === 0 && smart.waitingUploadCount === 0 &&
    smart.commandIndexCount === 0 && !smart.commandFromOutside);
  add(conditions, "interaction.turn-idle", turn.selectionRelation === "matching" && turn.itemCount === 0 &&
    turn.queueCount === 0 && turn.settleCallbackCount === 0 && !turn.processing);
  add(conditions, "secondary.partitions-empty", secondary.partitions.marker === "present" && secondary.partitions.count === 0);
  add(conditions, "secondary.inner-empty", secondary.innerModelMarker === "present" &&
    secondary.innerModels?.members === 0 && secondary.innerViews.members === 0 && secondary.innerViewManagerMatches);
  add(conditions, "secondary.retained-lines-empty", secondary.retainedLineMarker === "present" &&
    secondary.retainedLines?.mapCount === 0 && secondary.retainedLines.updateCount === 0);
  add(conditions, "secondary.dimension-and-group-views-empty", secondary.smartDimensionViews === 0 && secondary.groupViews === 0);
}

export interface CurrentPcbStringEmptyBaseline extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-empty-baseline.v1";
  readonly stage: "supplied-pre-create-only";
  readonly documentUuid: string;
  readonly observationSha256: string;
  readonly conditions: readonly Condition[];
  readonly unmetConditions: readonly string[];
  readonly observedConditionsSatisfied: boolean;
  readonly remainingPrerequisites: typeof REMAINING;
}

/** Decode every original reply shape before composition. Unknown/missing fields,
 * malformed markers and unsupported data throw. Valid nonempty observations
 * return named unmet conditions, not a retry recommendation or mutation token.
 */
export function inspectCurrentPcbStringEmptyBaseline(expectedDocumentUuid: string, input: unknown): CurrentPcbStringEmptyBaseline {
  if (typeof expectedDocumentUuid !== "string" || !/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(expectedDocumentUuid)) { return refuse(); }
  const supplied = replies(input);
  const root = decodeCurrentPcbDiagnosticRootInventoryReply(supplied.rootReply);
  const model = decodeCurrentPcbDiagnosticModelReply(supplied.modelReply);
  const pending = decodeCurrentPcbDiagnosticPendingReply(supplied.pendingReply);
  const strings = decodeCurrentPcbDiagnosticRawStringsReply(supplied.stringsReply);
  const conditions: Condition[] = [];
  add(conditions, "identity.document", [root.documentUuid, model.main.uuid, pending.documentUuid, strings.documentUuid]
    .every(id => id === expectedDocumentUuid));
  add(conditions, "identity.string-membership", root.families.strings.marker === "present" &&
    root.families.strings.count === strings.managerModelCount);
  add(conditions, "identity.dynamic-copper", model.dynamicCopper.workerNameMarker === pending.dynamicCopper.workerMarker &&
    model.dynamicCopper.workerName === pending.dynamicCopper.workerId && model.dynamicCopper.bus === pending.dynamicCopper.busMarker);
  rootConditions(root, conditions);
  interactionConditions(root, conditions);
  add(conditions, "strings.empty", strings.managerModelCount === 0 && strings.models.length === 0);
  const { main, dynamicCopper } = model;
  add(conditions, "compiler.ready", main.isProject && main.isInit && main.canSave && !main.isInitIng);
  add(conditions, "compiler.no-pending-data", main.pendCacheLength === 0 && main.pendingDocumentKeyCount === 0 &&
    main.cacheKeyCount === 0 && main.deleteCacheCount === 0 && !main.pendingChange && !main.localChange &&
    absentReference(main.pendTimer) && absentReference(main.pendPromise));
  add(conditions, "compiler.no-loaded-footprints", model.loadedFootprintCount === 0 && model.customFootprints.length === 0);
  add(conditions, "compiler.no-dynamic-copper", absentReference(dynamicCopper.workerNameMarker) &&
    absentReference(dynamicCopper.timer) && absentReference(dynamicCopper.bus));
  add(conditions, "pending.uploads-empty", pending.copperUploads.marker === "present" && pending.copperUploads.count === 0 &&
    pending.planeUploads.marker === "present" && pending.planeUploads.count === 0 &&
    pending.boardUpload.marker === "present" && pending.boardUpload.flag === false);
  add(conditions, "pending.history-unused", pending.commands.undoCount === 0 && pending.commands.redoCount === 0 &&
    pending.commands.activeStack === null);
  const tears = pending.teardrops, workers = pending.workerRegistry.workers;
  add(conditions, "pending.teardrops-idle", !tears.isMove && tears.suspend && tears.modifyCount === 0 &&
    tears.taskCount === 0 && tears.modifyTearsCount === 0 && absentReference(tears.timer));
  add(conditions, "pending.workers-empty", pending.workerRegistry.marker === "present" && workers !== null &&
    workers.workerCount === 0 && workers.bridgeCount === 0 && workers.ratlineWorkerCount === 0 &&
    workers.threadBusCount === 0 && workers.stateCount === 0 && pending.dynamicCopper.association === "no-worker-id");
  const unmetConditions = conditions.filter(condition => !condition.satisfied).map(condition => condition.name);
  return freezeDeep({
    profile: "private.current-pcb-string-empty-baseline.v1", stage: "supplied-pre-create-only",
    documentUuid: expectedDocumentUuid,
    observationSha256: sha256Text(canonicalJson({ expectedDocumentUuid, root, model, pending, strings })),
    conditions, unmetConditions, observedConditionsSatisfied: unmetConditions.length === 0,
    remainingPrerequisites: REMAINING, ...LIMITS,
  });
}
