import assert from "node:assert/strict";
import { test } from "node:test";
import { selectCurrentPcb209StartPage, selectCurrentPcb209StartPageFrame } from "../src/current-pcb-209-start-page-selection.ts";

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
