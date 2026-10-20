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
export function rootInventoryModelReply(documentUuid = "a".repeat(32)): unknown {
  const owner = { marker: "null", count: null };
  const branch = { outerKeyCount: 0, nestedKeyCount: 0, treeCount: 0, itemCount: 0, changeCount: 0, deadCount: 0,
    rootNodeCount: 0, rootLeafCount: 0, rootLeafWithoutItemCount: 0, rootLeafWithoutItemOrDeadCount: 0,
    itemWithoutRootLeafCount: 0, itemWithoutRootLeafOrChangeCount: 0, repeatedRootLeafCount: 0 };
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-root-inventory.v1", documentUuid,
    families: { tracks: owner, pads: owner, vias: owner, circles: owner, radiusDimensions: owner, rectangles: owner,
      strings: owner, protractorDimensions: owner, lengthDimensions: owner, smartDimensions: owner, components: owner,
      polygons: owner, images: owner, pictures: owner, copper: owner, inner: owner, groups: owner },
    board: { ownerMarker: "null", boardMarker: null, outlineCount: null, autoGenerate: null },
    panelization: { ownerMarker: "null", viewModelMatchesOwner: null, activation: null, counts: null },
    spatialIndexes: { typed: branch, other: branch, ratline: branch }, collectionEntries: 0, treeCount: 0,
  }) } };
}
