/** Offline image-data bounds and owned publication; no native capture. */
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentWindowCaptureTransportBudget, CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION as RESERVATION } from "../src/current-pcb-diagnostic-window-capture-budget.ts";
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "../src/current-pcb-diagnostic-transport-limits.ts";
import { decodeCurrentWindowResize, requireCurrentWindowResizeReadiness } from "../src/current-pcb-diagnostic-window-resize.ts";
import { windowResizePacket } from "./helpers/window-resize-packet.ts";
import { currentWindowCaptureReadiness } from "../src/current-pcb-diagnostic-window-capture-readiness.ts";
import { CURRENT_WINDOW_CAPTURE_LIMITS, currentWindowCaptureArtifactPath, decodeCurrentWindowCapture } from "../src/current-pcb-diagnostic-window-capture.ts";
import { windowCapturePacket } from "./helpers/window-capture-png.ts";

void test("fixed window PNG verifies all pixels and preserves blank status without a render claim", () => {
  for (const zero of [false, true]) {
    const decoded = decodeCurrentWindowCapture(windowCapturePacket(zero));
    assert.equal(decoded.observation.allRgbZero, zero); assert.equal(decoded.observation.renderCompletionVerified, false);
    assert.equal(decoded.observation.nativeResourcesRetained, true); assert.equal(Object.hasOwn(decoded.observation, "pngBase64"), false);
  }
});
void test("capture refuses excess geometry, malformed pixels and executable packet properties", () => {
  const packet = windowCapturePacket();
  for (const changes of [{ width: 4096, height: 4096 }, { pngBytes: CURRENT_WINDOW_CAPTURE_LIMITS.maximumPngBytes + 1 },
    { pngBase64: "A".repeat(CURRENT_WINDOW_CAPTURE_LIMITS.maximumBase64Units + 1) }, { allRgbZero: true },
    { renderCompletionVerified: true }, { extra: "not admitted" }, { bounds: { left: 0, top: 0, right: 321, bottom: 200 } }]) {
    assert.throws(() => decodeCurrentWindowCapture({ ...packet, ...changes }));
  }
  let invoked = false; const accessor = { ...packet }; Object.defineProperty(accessor, "pngBase64", { enumerable: true, get: () => { invoked = true; return ""; } });
  assert.throws(() => decodeCurrentWindowCapture(accessor)); assert.equal(invoked, false);
  assert.throws(() => decodeCurrentWindowCapture(new Proxy(packet, {})));
  assert.throws(() => currentWindowCaptureArtifactPath("../foreign", "a".repeat(64), "b".repeat(64)));
  assert.throws(() => currentWindowCaptureArtifactPath(`pcb209-visual-${"a".repeat(80)}`, "a".repeat(64), "b".repeat(64)));
});

void test("full PNG bytes must pass CRC and extent checks even with a matching packet digest", () => {
  const packet = windowCapturePacket(); assert.equal(typeof packet["pngBase64"], "string");
  const source = Buffer.from(String(packet["pngBase64"]), "base64");
  for (const png of [Buffer.concat([source, Buffer.from([0])]), Buffer.from(source)]) {
    if (png.length === source.length) { png[45] = ((png[45] ?? 0) + 1) % 256; }
    assert.throws(() => decodeCurrentWindowCapture({ ...packet, pngBase64: png.toString("base64"), pngBytes: png.length,
      pngSha256: createHash("sha256").update(png).digest("hex") }));
  }
});

void test("capture reserves every bounded helper reply plus cleanup before native dispatch", () => {
  assert.equal(RESERVATION.requiredHeadroomBytes, 32 * 1024 * 1024);
  assert.ok(RESERVATION.requiredHeadroomBytes >= RESERVATION.stageReplyBytes + RESERVATION.cleanupReplyBytes);
  assert.ok(RESERVATION.maximumCdpRawBytes <= RESERVATION.pollRequests * TRANSPORT.maximumNativePollBytes);
  const largestPriorUsage = TRANSPORT.maximumHelperStdoutBytes - RESERVATION.requiredHeadroomBytes;
  assert.throws(() => new CurrentWindowCaptureTransportBudget(largestPriorUsage + 1), /STDOUT_HEADROOM/u);
  assert.throws(() => new CurrentWindowCaptureTransportBudget(Number.NaN), /STDOUT_HEADROOM/u);
  const budget = new CurrentWindowCaptureTransportBudget(largestPriorUsage);
  let downstream = 0;
  const send = (poll: boolean): void => { budget.consume(poll); downstream += 1; };
  for (let index = 0; index < RESERVATION.pollRequests; index += 1) { send(true); }
  assert.throws(() => { send(true); }, /POLL_BUDGET/u); assert.equal(downstream, RESERVATION.pollRequests);
  for (let index = 0; index < RESERVATION.controlRequests; index += 1) { send(false); }
  assert.throws(() => { send(false); }, /CONTROL_BUDGET/u);
  assert.equal(downstream, RESERVATION.pollRequests + RESERVATION.controlRequests);
  assert.ok(TRANSPORT.maximumHelperStdoutBytes - largestPriorUsage - RESERVATION.stageReplyBytes >= RESERVATION.cleanupReplyBytes);
});

void test("capture checks actual poll envelope and raw-byte costs without poisoning native cleanup", () => {
  const budget = new CurrentWindowCaptureTransportBudget(0);
  budget.observeReply("poll", 80, { bytes: "" }); budget.observeReply("control", 512, {});
  assert.throws(() => { budget.observeReply("control", 513, {}); }, /HELPER_ENVELOPE/u);
  assert.throws(() => { budget.observeReply("poll", 513, { bytes: "" }); }, /HELPER_ENVELOPE/u);
  assert.throws(() => { budget.observeReply("poll", 80, { bytes: "AA==", extra: true }); }, /HELPER_ENVELOPE/u);
  const encoded = Buffer.alloc(TRANSPORT.maximumNativePollBytes).toString("base64");
  const fullPolls = Math.floor(RESERVATION.maximumCdpRawBytes / TRANSPORT.maximumNativePollBytes);
  for (let index = 0; index < fullPolls; index += 1) { budget.observeReply("poll", encoded.length + 512, { bytes: encoded }); }
  assert.throws(() => { budget.observeReply("poll", encoded.length + 512, { bytes: encoded }); }, /RAW_REPLY_BUDGET/u);
});

void test("readiness reports oversized or exhausted snapshots without painting or granting authority", () => {
  const native = { hwnd: "12345", bounds: { left: 0, top: 0, right: 3840, bottom: 2160 }, queriesUsed: 1, maximized: false, resizeAttempted: false, resizeRequestSubmitted: false, resizeGeometryObserved: false,
    captureAttempted: false, paintDispatched: false, nativeResourcesRetained: false };
  const usage = { helperStdoutBytes: 1024, cdpRequests: 60, readerAvailable: true, sourceQualified: true, captureConsumed: false, queriesUsed: 1 };
  const result = currentWindowCaptureReadiness(native, usage);
  assert.equal(result["geometryEligible"], false); assert.equal(result["capacityAvailable"], false); assert.equal(result["captureAttemptConsumed"], false);
  assert.equal(result["paintIssued"], false); assert.equal(result["activePcbRechecked"], false); assert.equal(result["executionAuthorized"], false);
  const valid = { ...native, bounds: { left: 0, top: 0, right: 1920, bottom: 1080 } };
  assert.equal(currentWindowCaptureReadiness(valid, usage)["capacityAvailable"], true);
  assert.equal(currentWindowCaptureReadiness(valid, { ...usage, cdpRequests: 94 })["transportEligible"], false);
  assert.equal(currentWindowCaptureReadiness(valid, { ...usage, helperStdoutBytes: TRANSPORT.maximumHelperStdoutBytes - RESERVATION.requiredHeadroomBytes + 1 })["transportEligible"], false);
  assert.equal(currentWindowCaptureReadiness(valid, { ...usage, captureConsumed: true })["capacityAvailable"], false);
  assert.equal(currentWindowCaptureReadiness({ ...native, hwnd: null, bounds: null, maximized: null }, usage)["geometryEligible"], false);
  assert.throws(() => currentWindowCaptureReadiness({ ...valid, queriesUsed: 9 }, { ...usage, queriesUsed: 9 }));
});

void test("resize metadata fixes its dimensions and independently binds the later no-move sample", () => {
  const packet = windowResizePacket(); assert.equal(decodeCurrentWindowResize(packet)["requestedWidth"], 1920);
  for (const extra of [{ requestedWidth: 3840 }, { geometryVerified: true }, { hwnd: "foreign" }, { x: 0 }]) {
    assert.throws(() => decodeCurrentWindowResize({ ...packet, ...extra }));
  }
  const readiness = { hwnd: "12345", bounds: { left: 0, top: 0, right: 1920, bottom: 1080 }, maximized: false, resizeGeometryObserved: true };
  requireCurrentWindowResizeReadiness(readiness, packet);
  assert.throws(() =>{  requireCurrentWindowResizeReadiness({ ...readiness, bounds: { left: 1, top: 0, right: 1921, bottom: 1080 } }, packet); });
  assert.throws(() =>{  requireCurrentWindowResizeReadiness({ ...readiness, maximized: true }, packet); });
});
