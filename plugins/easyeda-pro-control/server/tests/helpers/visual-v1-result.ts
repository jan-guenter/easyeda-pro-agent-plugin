/** Frozen synthetic copy of the camera-only v1 publication contract from
 * commit 8e0de6a. It exercises historical reads without a live owner or design. */
import { sha256Json } from "../../src/core.ts";

export function historicalCameraVisualResult(target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>): Record<string, unknown> {
  const packet = { ok: true, kind: "pcb209-original-visual-action", target: { ...target, tabId: `${target.documentUuid}@${target.projectUuid}` },
    operation: { kind: "zoom-to", xMil: 1, yMil: 2, scaleRatio: 1 }, stage: "viewport-acknowledged",
    previousSelection: [], observedSelection: [], viewportAttempted: true, viewportAcknowledged: true,
    nativeBounds: { minX: 1, maxX: 11, minY: 2, maxY: 22 } };
  return { schema: "easyeda-pro-control.pcb209-visual-action.v1", ...packet, mutationMayHaveOccurred: true,
    boundsMil: { left: 10, right: 110, bottom: 20, top: 220 }, resultSha256: sha256Json(packet), implementationKind: "native-task-equivalent",
    cameraBoundsScope: "single-source-returned-camera-getBBox2", cameraStateDoubleSampled: false, automaticInverseAvailable: false,
    cadAuthority: false, startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Only camera UI effects and native render notifications are requested. No source edit or Save is requested, and file invariance is not established by this response.",
      "Selection mutation is excluded. Installed selection handlers can flush connectivity, DRC and uploads, and delete empty views. Fit-selected compares the complete ordered selected-ID list with the request before dispatch and again afterward.",
      "Viewport bounds come from the original native handler once. Camera state is not independently double-sampled and render completion is not observed. Fit-selected includes component attribute bounding boxes. No screenshot, overlays, schematic or3D routing is included."] };
}

/** Fixed navigation-expanded v1 contract from protected main 27881f4. */
export function historicalNavigationVisualResult(target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>): Record<string, unknown> {
  const packet = { ok: true, kind: "pcb209-original-visual-action", target: { ...target, tabId: `${target.documentUuid}@${target.projectUuid}` },
    operation: { kind: "navigate-coordinates", xMil: 1, yMil: 2, acceptTransientOverlayEffects: true }, stage: "viewport-acknowledged",
    previousSelection: [], observedSelection: [], viewportAttempted: true, viewportAcknowledged: true, nativeBounds: null };
  return { schema: "easyeda-pro-control.pcb209-visual-action.v1", ...packet, mutationMayHaveOccurred: true, boundsMil: null,
    resultSha256: sha256Json(packet), implementationKind: "native-task-equivalent",
    cameraBoundsScope: "not-observed-native-navigation-boolean-acknowledgment", cameraStateDoubleSampled: false,
    transientOverlayCompletionVerified: false, automaticInverseAvailable: false,
    cadAuthority: false, startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Camera UI effects and native render notifications are requested. Navigation also requires explicit acceptance of native transient overlays. No source edit or Save is requested, and file invariance is not established by this response.",
      "Selection mutation is excluded. Installed selection handlers can flush connectivity, DRC and uploads, and delete empty views. Fit-selected compares the complete ordered selected-ID list with the request before dispatch and again afterward.",
      "Fit/zoom viewport bounds come from the original native handler once. Navigation returns only the exact native true acknowledgment, with no camera bounds. Camera state is not independently double-sampled and render completion is not observed. Fit-selected includes component attribute bounding boxes.",
      "navigate-coordinates and navigate-region pass data-origin mil values unchanged to their fixed native handlers. Both center the viewport without requesting a scale change. They may cancel an existing navigation overlay and schedule an animation frame, a 75ms timer and a 3s crossline or rectangle overlay. Their acknowledgment does not prove callback execution, timer settlement, overlay absence or visual arrival. Keep the original disposable owner through actual process/Job exit and release. No screenshot, schematic or3D routing is included."] };
}
