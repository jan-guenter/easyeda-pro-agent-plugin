/** Synthetic by-value leaves for composed diagnostic transport tests.
 * These supplied samples do not test vendor code or confer runtime ownership. */
export function pendingModelReply(documentUuid = "a".repeat(32)): unknown {
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-pending-state.v1", documentUuid,
    copperUploads: { marker: "absent", count: null }, planeUploads: { marker: "absent", count: null },
    boardUpload: { marker: "absent", flag: null }, commands: { undoCount: 0, redoCount: 0, activeStack: null },
    teardrops: { isMove: false, suspend: false, modifyCount: 0, taskCount: 0, modifyTearsCount: 0, timer: "absent" },
    workerRegistry: { marker: "absent", workers: null },
    dynamicCopper: { workerMarker: "absent", workerId: null, busMarker: "absent", association: "no-worker-id" },
  }) } };
}
export function rawStringsModelReply(documentUuid = "a".repeat(32)): unknown {
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-raw-strings.v1", documentUuid, managerModelCount: 0, models: [],
  }) } };
}
