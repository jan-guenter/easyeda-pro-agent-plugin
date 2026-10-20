/** Pure interpretation of supplied closure observations. These are selected
 * observations, never an upload barrier, retained owner or writer admission. */
import { decodeCurrentPcbStringCooperationClosure, decodeCurrentPcbStringDebounceClosure,
  decodeCurrentPcbStringMoveClosure, decodeCurrentPcbStringSerialClosure,
  decodeCurrentPcbStringUploadClosure } from "./current-pcb-string-producer-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function observeCurrentPcbStringProducerClosures(moveReply: unknown, uploadStructureReply: unknown,
  structureReply: unknown, debounceReply: unknown, cooperationReply: unknown, uploadReply: unknown): Readonly<{
    schema: "easyeda-pro-control.pcb-string-producer-observation.v1";
    move: ReturnType<typeof decodeCurrentPcbStringMoveClosure>;
    uploadStructure: ReturnType<typeof decodeCurrentPcbStringSerialClosure>;
    structure: ReturnType<typeof decodeCurrentPcbStringSerialClosure>;
    debounce: ReturnType<typeof decodeCurrentPcbStringDebounceClosure>;
    cooperation: ReturnType<typeof decodeCurrentPcbStringCooperationClosure>;
    upload: ReturnType<typeof decodeCurrentPcbStringUploadClosure>;
    moveHasNoRetainedState: boolean; serialWrappersHaveNoRetainedPromises: boolean;
    debounceMarkers: "not-yet-scheduled" | "retained-schedule-markers" | "mixed-markers";
    cooperationHasNoRetainedBatch: boolean; uploadHasNoRetainedSchedule: boolean;
    completeProducerInventoryVerified: false; atomicSnapshotVerified: false; originalOwnerVerified: false;
    projectWorkerAssociationVerified: false; queueCompletionVerified: false; saveAuthorized: false; executionAuthorized: false;
  }> {
  const move = decodeCurrentPcbStringMoveClosure(moveReply);
  const uploadStructure = decodeCurrentPcbStringSerialClosure(uploadStructureReply);
  const structure = decodeCurrentPcbStringSerialClosure(structureReply);
  const debounce = decodeCurrentPcbStringDebounceClosure(debounceReply);
  const cooperation = decodeCurrentPcbStringCooperationClosure(cooperationReply);
  const upload = decodeCurrentPcbStringUploadClosure(uploadReply);
  const identity = uploadStructure.identity;
  if (uploadStructure.kind !== "uploadStructure" || structure.kind !== "structure" ||
      [structure, debounce, cooperation, upload].some(value => value.identity.projectUuid !== identity.projectUuid ||
        value.identity.branchUuid !== identity.branchUuid || value.identity.windowTabId !== identity.windowTabId)) {
    throw new Error("PCB_STRING_PRODUCER_IDENTITY");
  }
  let debounceMarkers: "not-yet-scheduled" | "retained-schedule-markers" | "mixed-markers" = "mixed-markers";
  if (debounce.timer === "undefined" && debounce.resolver === "null") { debounceMarkers = "not-yet-scheduled"; }
  if (debounce.timer === "present" && debounce.resolver === "present") { debounceMarkers = "retained-schedule-markers"; }
  return freezeDeep({ schema: "easyeda-pro-control.pcb-string-producer-observation.v1", move, uploadStructure, structure,
    debounce, cooperation, upload,
    moveHasNoRetainedState: move.timer === "null" && move.selectionCount === 0 && move.builder === "null" && move.command === "null",
    serialWrappersHaveNoRetainedPromises: [uploadStructure, structure].every(value => value.inFlight === "null" && value.queued === "null"),
    // QA does not clear either marker after settling its returned promise.
    // Present fields therefore establish neither a live timer nor completion.
    debounceMarkers,
    cooperationHasNoRetainedBatch: cooperation.batchCount === 0 && cooperation.outerTimer === "null" && cooperation.innerTimer === "null",
    // BufferedStream clears these three before awaiting t(); task1 plus its
    // Current upload operation remain separate participants after this point.
    uploadHasNoRetainedSchedule: upload.timer === "null" && upload.promise === "null" && upload.resolver === "null",
    completeProducerInventoryVerified: false, atomicSnapshotVerified: false, originalOwnerVerified: false,
    projectWorkerAssociationVerified: false, queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false });
}
