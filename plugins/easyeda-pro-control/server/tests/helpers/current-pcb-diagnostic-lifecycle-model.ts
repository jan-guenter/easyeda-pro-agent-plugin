import type { CurrentPcbDiagnosticLifecycleOwner } from "../../src/current-pcb-diagnostic-lifecycle.ts";
import { decodeCurrentPcbDiagnosticPendingReply } from "../../src/current-pcb-diagnostic-pending-program.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "../../src/current-pcb-diagnostic-raw-strings.ts";
import { decodeCurrentPcbDiagnosticRootInventoryReply } from "../../src/current-pcb-diagnostic-root-inventory.ts";
import { pendingModelReply, rawStringsModelReply, rootInventoryModelReply } from "./current-pcb-diagnostic-model-replies.ts";

export const LIFECYCLE_MODEL_RESULT: Awaited<ReturnType<CurrentPcbDiagnosticLifecycleOwner["observeModelState"]>> = {
  schema: "easyeda-pro-control.pcb-diagnostic-model-observation.v1", documentUuid: "a".repeat(32),
  compilerState: { schema: "easyeda-pro-control.pcb-diagnostic-model-state.v1",
    main: { uuid: "a".repeat(32), uniqueId: "b".repeat(16), headType: "PCB", isProject: true, isInit: true, canSave: true, isInitIng: false,
      pendCacheLength: 0, pendingDocumentKeyCount: 0, cacheKeyCount: 0, deleteCacheCount: 0, subscriptionCount: 0, pendTimer: "null",
      pendPromise: "null", maxTicket: 0, pendingChange: false, localChange: false },
    loadedFootprintCount: 0, customFootprints: [],
    dynamicCopper: { openPcb: false, workerNameMarker: "absent", workerName: null, timer: "absent", bus: "absent" },
    completeModelMembershipVerified: false, completePendingProducerInventoryVerified: false, projectWorkerAssociationVerified: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false, continuousObservation: false, nativeIntrinsicsVerified: false,
  },
  pendingProducers: decodeCurrentPcbDiagnosticPendingReply(pendingModelReply()),
  rawStrings: decodeCurrentPcbDiagnosticRawStringsReply(rawStringsModelReply()),
  rootInventory: decodeCurrentPcbDiagnosticRootInventoryReply(rootInventoryModelReply()),
  atomicSnapshotVerified: false, completeModelMembershipVerified: false, completePendingProducerInventoryVerified: false,
  queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false, continuousObservation: false,
};
