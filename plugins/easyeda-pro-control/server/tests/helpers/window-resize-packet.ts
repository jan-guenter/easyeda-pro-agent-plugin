/** Synthetic fixed native submission acknowledgment, never a live resize. */
export function windowResizePacket(): Record<string, unknown> {
  return { schema: "easyeda-pro-control.original-window-resize.v1", hwnd: "12345",
    previousBounds: { left: 0, top: 0, right: 3840, bottom: 2160 }, requestedWidth: 1920, requestedHeight: 1080,
    requestSubmitted: true, noMoveRequested: true, noActivateRequested: true, zOrderPreservationRequested: true,
    geometryVerified: false, renderCompletionVerified: false };
}
