/** Supplied v2 observations retain unavailable owners instead of fabricating
 * empty instances. The v1 comparison is reused only for exact present states. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeCurrentPcbDiagnosticModelReplyV2 } from "./current-pcb-diagnostic-model-program.ts";
import type { CurrentPcbDiagnosticModelStateV2 } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticPendingReplyV2 } from "./current-pcb-diagnostic-pending-program.ts";
import type { CurrentPcbDiagnosticPendingStateV2 } from "./current-pcb-diagnostic-pending-program.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { decodeCurrentPcbDiagnosticRootInventoryReply } from "./current-pcb-diagnostic-root-inventory.ts";
import { inspectCurrentPcbStringEmptyBaseline } from "./current-pcb-string-empty-baseline.ts";
import type { CurrentPcbStringEmptyBaseline } from "./current-pcb-string-empty-baseline.ts";
import { decodeCurrentPcbStringEmptyProducersV2 } from "./current-pcb-string-empty-producers.ts";
import type { CurrentPcbStringEmptyProducersV2 } from "./current-pcb-string-empty-producers.ts";
import { decodeCurrentPcbStringProducerMarkersV2 } from "./current-pcb-string-producer-markers.ts";
import type { CurrentPcbStringProducerMarkersV2 } from "./current-pcb-string-producer-markers.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const FIELDS = ["rootReply", "modelReply", "pendingReply", "stringsReply", "emptyProducersReply", "producerMarkersReply"] as const;
type Replies = Readonly<Record<typeof FIELDS[number], unknown>>;
type Condition = Readonly<{ name: string; satisfied: boolean }>;
function refuse(): never { throw new Error("PCB_STRING_LAZY_BASELINE_INPUT"); }
function replies(input: unknown): Replies {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== FIELDS.length ||
      keys.some(key => typeof key !== "string" || !FIELDS.some(field => field === key))) { return refuse(); }
  const result: Record<typeof FIELDS[number], unknown> = {
    rootReply: undefined, modelReply: undefined, pendingReply: undefined, stringsReply: undefined,
    emptyProducersReply: undefined, producerMarkersReply: undefined,
  };
  for (const field of FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(input, field);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return refuse(); }
    result[field] = descriptor.value as unknown;
  }
  return result;
}
function reply(value: unknown): unknown { return { result: { type: "string", value: JSON.stringify(value) } }; }

/** This is a pure data projection, not an observed v1 reply or an owner token.
 * No missing owner ever enters the older present-only comparison. */
function presentComparison(documentUuid: string, supplied: Replies, model: CurrentPcbDiagnosticModelStateV2,
  pending: CurrentPcbDiagnosticPendingStateV2): CurrentPcbStringEmptyBaseline | null {
  if (model.dynamicCopper.manager !== "present" || pending.dynamicCopper.manager !== "present") { return null; }
  return inspectCurrentPcbStringEmptyBaseline(documentUuid, {
    rootReply: supplied.rootReply, stringsReply: supplied.stringsReply,
    modelReply: reply({ schema: "easyeda-pro-control.pcb-diagnostic-model-state.v1", main: model.main,
      loadedFootprintCount: model.loadedFootprintCount, customFootprints: model.customFootprints,
      dynamicCopper: model.dynamicCopper.state }),
    pendingReply: reply({ schema: "easyeda-pro-control.pcb-diagnostic-pending-state.v1", documentUuid: pending.documentUuid,
      copperUploads: pending.copperUploads, planeUploads: pending.planeUploads, boardUpload: pending.boardUpload,
      commands: pending.commands, teardrops: pending.teardrops, workerRegistry: pending.workerRegistry,
      dynamicCopper: pending.dynamicCopper.state }),
  });
}
function copperMatches(model: CurrentPcbDiagnosticModelStateV2, pending: CurrentPcbDiagnosticPendingStateV2,
  markers: CurrentPcbStringProducerMarkersV2): boolean {
  const first = model.dynamicCopper, second = pending.dynamicCopper, third = markers.dynamicCopper;
  if (first.manager !== second.manager || first.manager !== third.manager) { return false; }
  if (first.manager !== "present" || second.manager !== "present" || third.manager !== "present") { return true; }
  return first.state.workerNameMarker === second.state.workerMarker && first.state.workerName === second.state.workerId &&
    first.state.bus === second.state.busMarker && first.state.openPcb === third.state.openPcb &&
    first.state.workerNameMarker === third.state.workerNameMarker && first.state.workerName === third.state.workerId &&
    first.state.timer === third.state.timerMarker && first.state.bus === third.state.busMarker;
}

export interface CurrentPcbStringLazyBaseline {
  readonly profile: "private.current-pcb-string-lazy-baseline.v2";
  readonly stage: "supplied-pre-create-only";
  readonly documentUuid: string;
  readonly observationSha256: string;
  readonly owners: Readonly<{
    compilerCopper: CurrentPcbDiagnosticModelStateV2["dynamicCopper"];
    pendingCopper: CurrentPcbDiagnosticPendingStateV2["dynamicCopper"];
    producerCopper: CurrentPcbStringProducerMarkersV2["dynamicCopper"];
    producerRatline: CurrentPcbStringProducerMarkersV2["ratlineModel"];
    emptyRatline: CurrentPcbStringEmptyProducersV2["model"];
  }>;
  readonly strictV1Comparison: CurrentPcbStringEmptyBaseline | null;
  readonly strictV1ComparisonIsPresentStateProjection: boolean;
  readonly conditions: readonly Condition[];
  readonly unmetConditions: readonly string[];
  readonly observedConditionsSatisfied: boolean;
  readonly managerAbsenceImpliesEmpty: false;
  readonly originalOwnerVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly emptyRootPcbVerified: false;
  readonly completePendingProducerInventoryVerified: false;
  readonly queueCompletionVerified: false;
  readonly continuousObservation: false;
  readonly saveAuthorized: false;
  readonly writerSupported: false;
  readonly executionAuthorized: false;
}
export function inspectCurrentPcbStringLazyBaseline(expectedDocumentUuid: string, input: unknown): CurrentPcbStringLazyBaseline {
  if (typeof expectedDocumentUuid !== "string" || !/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(expectedDocumentUuid)) { return refuse(); }
  const supplied = replies(input);
  const root = decodeCurrentPcbDiagnosticRootInventoryReply(supplied.rootReply);
  const model = decodeCurrentPcbDiagnosticModelReplyV2(supplied.modelReply);
  const pending = decodeCurrentPcbDiagnosticPendingReplyV2(supplied.pendingReply);
  const strings = decodeCurrentPcbDiagnosticRawStringsReply(supplied.stringsReply);
  const producers = decodeCurrentPcbStringEmptyProducersV2(supplied.emptyProducersReply);
  const markers = decodeCurrentPcbStringProducerMarkersV2(supplied.producerMarkersReply);
  const strictV1Comparison = presentComparison(expectedDocumentUuid, supplied, model, pending);
  const conditions: Condition[] = [
    { name: "identity.document", satisfied: [root.documentUuid, model.main.uuid, pending.documentUuid, strings.documentUuid,
      producers.documentUuid, markers.documentUuid].every(value => value === expectedDocumentUuid) },
    { name: "identity.dynamic-copper", satisfied: copperMatches(model, pending, markers) },
    { name: "identity.ratline-model", satisfied: producers.model.manager === markers.ratlineModel.manager &&
      (producers.model.manager !== "present" || markers.ratlineModel.manager !== "present" ||
        markers.ratlineModel.state.netCount === 0 && markers.ratlineModel.state.idCount === 0 &&
        producers.model.state.last === markers.ratlineModel.state.lastMarker &&
        producers.model.state.lastRatline === markers.ratlineModel.state.lastRatlineMarker) },
    { name: "strict-v1.owner-profile-available", satisfied: strictV1Comparison !== null },
    { name: "ratline.model-owner-observed", satisfied: producers.model.manager === "present" && markers.ratlineModel.manager === "present" },
    { name: "ratline.view-empty", satisfied: Object.values(markers.ratlineView).every(value => value === 0) },
    { name: "network.indexes-empty", satisfied: [markers.net.netCount, markers.net.noneNetCount, markers.net.lengthCount,
      markers.net.modifyCount, markers.net.rubbishCount, markers.net.optionCount, markers.net.addCount, markers.net.deleteCount,
      markers.net.updateLengthCount, markers.net.grayCount].every(value => value === 0) &&
      (markers.net.viewGroupCount === null || markers.net.viewGroupCount === 0) },
    { name: "network.notification-unused", satisfied: markers.notification.funcMarker === "null" &&
      markers.notification.frameMarker === "null" && markers.notification.lastTime === -1 && markers.notification.delay === 0 &&
      markers.notification.updateLeftTreeMarker !== "function" },
    { name: "clusters.empty", satisfied: markers.clusters.networkCount === 0 && markers.clusters.wireClusterCount === 0 &&
      markers.clusters.jumpWireCount === 0 && markers.clusters.useWireClusterCache === producers.clusters.useWireClusterCache &&
      markers.clusters.emptyNetChange === producers.clusters.emptyNetChange },
  ];
  if (strictV1Comparison !== null) {
    for (const condition of strictV1Comparison.conditions) { conditions.push({ name: `strict-v1.${condition.name}`, satisfied: condition.satisfied }); }
  }
  const unmetConditions = conditions.filter(condition => !condition.satisfied).map(condition => condition.name);
  return freezeDeep({ profile: "private.current-pcb-string-lazy-baseline.v2" as const, stage: "supplied-pre-create-only" as const,
    documentUuid: expectedDocumentUuid, observationSha256: sha256Text(canonicalJson({ root, model, pending, strings, producers, markers })),
    owners: { compilerCopper: model.dynamicCopper, pendingCopper: pending.dynamicCopper,
      producerCopper: markers.dynamicCopper, producerRatline: markers.ratlineModel, emptyRatline: producers.model },
    strictV1Comparison, strictV1ComparisonIsPresentStateProjection: strictV1Comparison !== null,
    conditions, unmetConditions, observedConditionsSatisfied: unmetConditions.length === 0,
    managerAbsenceImpliesEmpty: false as const, originalOwnerVerified: false as const, completeLiveBaselineVerified: false as const,
    emptyRootPcbVerified: false as const, completePendingProducerInventoryVerified: false as const,
    queueCompletionVerified: false as const, continuousObservation: false as const,
    saveAuthorized: false as const, writerSupported: false as const, executionAuthorized: false as const,
  });
}
