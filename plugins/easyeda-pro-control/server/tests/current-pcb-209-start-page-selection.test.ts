import { currentPcbViaSavedStartPageNativeFrame, currentPcbViaSavedStartPageWire } from "../src/current-pcb-via-saved-start-page-protocol.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { observeCurrentPcb209StartPageCandidate, selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "../src/current-pcb-209-start-page-selection.ts";

const page = { targetId: "page", type: "page", url: "https://client/editor?cll=warn#", attached: false };
const browser = { schema: "easyeda-pro-control.pcb-diagnostic-browser-observation.v1", targets: [page, { targetId: "background", type: "worker", url: "", attached: true }] };
const root = { id: "root", loaderId: "loader", url: "https://client/editor?cll=warn", securityOrigin: "https://client" };
const frames = { schema: "easyeda-pro-control.pcb-diagnostic-frame-inventory.v1", targetId: page.targetId, frames: [root] };
void test("pure selector chooses only one unattached Start Page and its corresponding root frame", () => {
  const selected = selectCurrentPcb209StartPage(browser); assert.deepEqual(selected, { targetId: page.targetId, url: page.url });
  assert.deepEqual(selectCurrentPcb209StartPageFrame(frames, selected), { targetId: page.targetId, frameId: root.id, frameUrl: root.url });
  assert.throws(() => selectCurrentPcb209StartPage({ ...browser, targets: [page, { ...page, targetId: "other" }] }));
  for (const row of [{ ...page, attached: true }, { ...page, url: "https://client/editor?cll=warn#id=project" }, { ...page, url: "https://foreign/editor?cll=warn" }]) { assert.throws(() => selectCurrentPcb209StartPage({ ...browser, targets: [row] })); }
  for (const value of [{ ...frames, targetId: "other" }, { ...frames, frames: [{ ...root, parentId: "foreign" }] }, { ...frames, frames: [{ ...root, securityOrigin: "https://foreign" }] }, { ...frames, frames: [root, { ...root, id: "other" }] }]) { assert.throws(() => selectCurrentPcb209StartPageFrame(value, selected)); }
});
void test("selector refuses Proxy/getter metadata without invoking caller callbacks", () => {
  let calls = 0; const getter = { ...page }; Object.defineProperty(getter, "url", { get: (): string => { calls += 1; return page.url; } });
  assert.throws(() => selectCurrentPcb209StartPage({ ...browser, targets: [getter] }));
  const proxy = new Proxy(page, { get(): never { calls += 1; throw new Error("trap"); }, ownKeys(): never { calls += 1; throw new Error("trap"); } });
  assert.throws(() => selectCurrentPcb209StartPage({ ...browser, targets: [proxy] })); assert.equal(calls, 0);
});

void test("startup candidates pin the first blank page and refuse closure, replacement and foreign transitions", () => {
  const empty = { ...browser, targets: [] }; assert.deepEqual(observeCurrentPcb209StartPageCandidate(empty, null), { targetId: null, ready: false });
  const blank = { ...browser, targets: [{ ...page, url: "about:blank" }] };
  assert.deepEqual(observeCurrentPcb209StartPageCandidate(blank, null), { targetId: page.targetId, ready: false });
  assert.deepEqual(observeCurrentPcb209StartPageCandidate(browser, page.targetId), { targetId: page.targetId, ready: true });
  assert.throws(() => observeCurrentPcb209StartPageCandidate(empty, page.targetId));
  for (const row of [{ ...page, targetId: "replacement" }, { ...page, url: "https://client/foreign" }, { ...page, attached: true }]) { assert.throws(() => observeCurrentPcb209StartPageCandidate({ ...browser, targets: [row] }, page.targetId)); }
  assert.throws(() => observeCurrentPcb209StartPageCandidate({ ...browser, targets: [page, { ...page, targetId: "extra" }] }, page.targetId));
});

void test("saved-only startup wire accepts no caller method, URL, context or session", () => {
  for (const phase of ["version", "targets"] as const) {
    const command = currentPcbViaSavedStartPageWire(4, phase); const frame = Buffer.from(`${JSON.stringify(command)}\0`);
    assert.deepEqual(currentPcbViaSavedStartPageNativeFrame(frame), { action: "saved-readback-start-page", requestId: 4, startPagePhase: phase });
    for (const value of [{ ...command, method: "Runtime.evaluate" }, { ...command, url: "https://foreign" }, { ...command, sessionId: "foreign" }, { ...command, id: 0 }]) { assert.throws(() => currentPcbViaSavedStartPageNativeFrame(Buffer.from(`${JSON.stringify(value)}\0`))); }
  }
});
