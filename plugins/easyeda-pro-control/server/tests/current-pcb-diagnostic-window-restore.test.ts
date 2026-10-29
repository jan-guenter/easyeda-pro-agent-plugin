/** Pure fixed-contract checks; no native window or process is involved. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCurrentWindowRestore, requireCurrentWindowRestoreReadiness } from "../src/current-pcb-diagnostic-window-restore.ts";
import { windowRestorePacket } from "./helpers/window-restore-packet.ts";

void test("restore fixes nonactivating command4 and reports submission without geometry or render claims", () => {
  const packet = windowRestorePacket(); const decoded = decodeCurrentWindowRestore(packet);
  assert.equal(decoded["showCommand"], 4); assert.equal(decoded["requestSubmitted"], true);
  assert.equal(decoded["geometryVerified"], false); assert.equal(decoded["renderCompletionVerified"], false);
  assert.equal(decoded["positionMayChange"], true);
  for (const changes of [{ showCommand: 9 }, { activationRequested: true }, { positionMayChange: false }, { previousMaximized: false }, { x: 0 }]) {
    assert.throws(() => decodeCurrentWindowRestore({ ...packet, ...changes }));
  }
});
void test("post-restore readiness requires the same nonmaximized window while permitting system-restored position", () => {
  const observed = { hwnd: "12345", bounds: { left: 200, top: 80, right: 1480, bottom: 800 }, maximized: false, restoreStateObserved: true };
  requireCurrentWindowRestoreReadiness(observed, windowRestorePacket());
  assert.throws(() => { requireCurrentWindowRestoreReadiness({ ...observed, hwnd: "54321" }, windowRestorePacket()); });
  assert.throws(() => { requireCurrentWindowRestoreReadiness({ ...observed, maximized: true }, windowRestorePacket()); });
  assert.throws(() => { requireCurrentWindowRestoreReadiness({ ...observed, restoreStateObserved: false }, windowRestorePacket()); });
});
