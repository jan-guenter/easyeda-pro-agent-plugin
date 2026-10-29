/** Synthetic acknowledgment only; no Windows call or restoration occurs. */
export function windowRestorePacket(): Record<string, unknown> {
  return { schema: "easyeda-pro-control.original-window-restore.v1", hwnd: "12345",
    previousBounds: { left: 0, top: 0, right: 3840, bottom: 2160 }, previousMaximized: true,
    showCommand: 4, requestSubmitted: true, activationRequested: false, positionMayChange: true,
    zOrderPreservationVerified: false, geometryVerified: false, renderCompletionVerified: false };
}
