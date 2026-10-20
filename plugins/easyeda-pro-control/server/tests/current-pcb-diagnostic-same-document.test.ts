import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbDiagnosticSameDocument } from "../src/current-pcb-diagnostic-same-document.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const FRAME = "original-root", URL = `https://client/editor?cll=warn#id=${"a".repeat(64)}`;
const event = (method: string, params: Record<string, unknown> = {}): DiagnosticEvent =>
  ({ method, sessionId: "original-session", params: { frameId: FRAME, ...params } });
const schedule = (params: Record<string, unknown> = {}): DiagnosticEvent =>
  event("Page.frameScheduledNavigation", { delay: 0, reason: "scriptInitiated", url: URL, ...params });
const fragment = (): DiagnosticEvent => event("Page.navigatedWithinDocument", { url: URL, navigationType: "fragment" });
const clear = (): DiagnosticEvent => event("Page.frameClearedScheduledNavigation");

void test("Chromium renderer schedule fragment clear and late browser loading are one sealed transition", () => {
  const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
  for (const item of [schedule(), fragment(), clear()]) { assert.equal(state.accept(item), true); }
  state.seal();
  // Browser IPC does not share the renderer response's total ordering.
  assert.equal(state.accept(event("Page.frameStartedLoading")), true);
  assert.equal(state.accept(event("Page.frameStoppedLoading")), true);
  assert.throws(() => state.accept(schedule()), /SAME_DOCUMENT/u);
  assert.throws(() => state.accept(fragment()), /SAME_DOCUMENT/u);
});

void test("history API needs no schedule or loading pair and pending loader is not committed identity", () => {
  const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
  assert.equal(state.accept(event("Page.frameStartedNavigating", { url: URL, loaderId: "different-pending-token", navigationType: "sameDocument" })), true);
  assert.equal(state.accept(event("Page.navigatedWithinDocument", { url: URL, navigationType: "historyApi" })), true);
  state.seal();
});

void test("missing renderer commit or uncleared schedule cannot seal", () => {
  const empty = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
  assert.throws(() => { empty.seal(); }, /SAME_DOCUMENT/u);
  const active = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
  active.accept(schedule()); active.accept(fragment());
  assert.throws(() => { active.seal(); }, /SAME_DOCUMENT/u);
});

void test("scheduled transition rejects altered URL reason delay shape and duplicate schedule", () => {
  for (const patch of [{ url: `${URL},tab=foreign` }, { reason: "reload" }, { delay: 1 }, { delay: -0 }, { extra: true }]) {
    assert.throws(() => new CurrentPcbDiagnosticSameDocument(FRAME, URL).accept(schedule(patch)), /SAME_DOCUMENT/u);
  }
  const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL); state.accept(schedule());
  assert.throws(() => state.accept(schedule()), /SAME_DOCUMENT/u);
  assert.throws(() => new CurrentPcbDiagnosticSameDocument(FRAME, URL).accept(clear()), /SAME_DOCUMENT/u);
});

void test("full navigation reload malformed loader or unknown fields never become same-document admission", () => {
  for (const patch of [{ navigationType: "differentDocument" }, { navigationType: "reload" },
    { navigationType: "historySameDocument" }, { loaderId: "" }, { url: "https://foreign/" }, { extra: true }]) {
    const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
    assert.throws(() => state.accept(event("Page.frameStartedNavigating",
      { url: URL, loaderId: "pending-token", navigationType: "sameDocument", ...patch })), /SAME_DOCUMENT/u);
  }
  const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
  assert.equal(state.accept(event("Page.frameNavigated")), false);
  assert.equal(state.accept(event("Page.frameStartedLoading", { frameId: "foreign" })), false);
  assert.throws(() => state.accept(event("Page.frameStoppedLoading", { extra: true })), /SAME_DOCUMENT/u);
});

void test("every root event class keeps its own bound without pretending loading proves completion", () => {
  for (const method of ["Page.frameStartedLoading", "Page.frameStoppedLoading"]) {
    const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
    for (let index = 0; index < 8; index += 1) { state.accept(event(method)); }
    assert.throws(() => state.accept(event(method)), /SAME_DOCUMENT/u);
  }
  const state = new CurrentPcbDiagnosticSameDocument(FRAME, URL);
  for (let index = 0; index < 8; index += 1) { state.accept(schedule()); state.accept(fragment()); state.accept(clear()); }
  assert.throws(() => state.accept(schedule()), /SAME_DOCUMENT/u);
});

void test("constructor keeps exact supported URL grammar and same project in a PCB tab", () => {
  const tab = `${"b".repeat(16)}@${"a".repeat(64)}`;
  assert.doesNotThrow(() => new CurrentPcbDiagnosticSameDocument(FRAME, `${URL},tab=*${tab}`));
  for (const url of [`${URL},tab=*${"b".repeat(17)}@${"a".repeat(64)}`, `${URL},tab=*${"b".repeat(16)}@${"c".repeat(64)}`,
    `${URL}\n`, "https://foreign/#id=x"]) {
    assert.throws(() => new CurrentPcbDiagnosticSameDocument(FRAME, url), /SAME_DOCUMENT/u);
  }
});
