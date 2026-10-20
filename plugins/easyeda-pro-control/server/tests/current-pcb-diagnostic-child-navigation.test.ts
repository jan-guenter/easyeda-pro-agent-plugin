import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbDiagnosticChildNavigation } from "../src/current-pcb-diagnostic-child-navigation.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const PCB_URL = "https://client/editor?entry=pcb";
function event(method: string, params: Record<string, unknown>): DiagnosticEvent { return { method, params, sessionId: "session-1" }; }
function fixture(): CurrentPcbDiagnosticChildNavigation { return new CurrentPcbDiagnosticChildNavigation("child", "root"); }
function commit(url = PCB_URL, loaderId = "pcb-loader", change: Record<string, unknown> = {}): DiagnosticEvent {
  return event("Page.frameNavigated", { frame: { id: "child", parentId: "root", loaderId, url, securityOrigin: "https://client", ...change }, type: "Navigation" });
}
function requested(reason = "initialFrameNavigation", url = PCB_URL): DiagnosticEvent {
  return event("Page.frameRequestedNavigation", { frameId: "child", reason, url, disposition: "currentTab" });
}
function started(loaderId = "pcb-loader", url = PCB_URL): DiagnosticEvent {
  return event("Page.frameStartedNavigating", { frameId: "child", loaderId, url, navigationType: "differentDocument" });
}
function scheduled(url = PCB_URL): DiagnosticEvent {
  return event("Page.frameScheduledNavigation", { frameId: "child", delay: 0, reason: "scriptInitiated", url });
}
function cleared(): DiagnosticEvent { return event("Page.frameClearedScheduledNavigation", { frameId: "child" }); }
function loading(method: "Page.frameStartedLoading" | "Page.frameStoppedLoading"): DiagnosticEvent { return event(method, { frameId: "child" }); }
function assertRefuses(tracker: CurrentPcbDiagnosticChildNavigation, value: DiagnosticEvent): void {
  assert.throws(() => tracker.accept(value), /CHILD_NAVIGATION/u);
  assert.throws(() => tracker.committedLoader, /CHILD_NAVIGATION/u);
  assert.throws(() => { tracker.assertReady(); }, /CHILD_NAVIGATION/u);
  assert.throws(() => tracker.accept(event("Runtime.consoleAPICalled", {})), /CHILD_NAVIGATION/u);
}

void test("initial iframe branch needs no scheduled events and retains the sole committed PCB loader", () => {
  const tracker = fixture();
  for (const value of [requested(), started(), loading("Page.frameStartedLoading"), commit(), loading("Page.frameStoppedLoading")]) {
    assert.equal(tracker.accept(value), true);
  }
  tracker.assertReady(); assert.equal(tracker.committedLoader, "pcb-loader");
  assert.equal(tracker.accept(event("Debugger.scriptParsed", {})), false);
});
void test("optional initial blank commit and existing-frame source change keep separate loader identities", () => {
  const tracker = fixture();
  for (const value of [commit("about:blank", "blank-loader"), scheduled(), requested("scriptInitiated"), cleared(), started(), commit()]) {
    tracker.accept(value);
  }
  tracker.assertReady(); assert.equal(tracker.committedLoader, "pcb-loader");
});
void test("browser started/loading notifications may straddle the renderer commit without changing authority", () => {
  for (const values of [
    [requested(), commit(), started(), loading("Page.frameStoppedLoading"), loading("Page.frameStartedLoading")],
    [scheduled(), requested("scriptInitiated"), cleared(), commit(), started()],
    [commit("about:blank", "blank"), commit(), started("blank", "about:blank"), started()],
    [commit()],
  ]) {
    const tracker = fixture();
    for (const value of values) { tracker.accept(value); }
    tracker.assertReady(); assert.equal(tracker.committedLoader, "pcb-loader");
  }
});
void test("scheduled pairs are renderer-local and must be complete at readiness", () => {
  const incomplete = fixture(); incomplete.accept(scheduled()); incomplete.accept(commit());
  assert.throws(() => { incomplete.assertReady(); }, /CHILD_NAVIGATION/u);
  assertRefuses(fixture(), cleared());
  const duplicate = fixture(); duplicate.accept(scheduled()); assertRefuses(duplicate, scheduled());
  const paired = fixture(); paired.accept(scheduled()); paired.accept(cleared()); paired.accept(commit()); paired.assertReady();
});
void test("at most one blank and one PCB commit, distinct loaders and no later navigation are admitted", () => {
  const blank = fixture(); blank.accept(commit("about:blank", "blank")); assertRefuses(blank, commit("about:blank", "blank2"));
  const sameLoader = fixture(); sameLoader.accept(commit("about:blank", "same")); assertRefuses(sameLoader, commit(PCB_URL, "same"));
  for (const value of [commit(), commit(PCB_URL, "replacement"), commit("about:blank", "replacement"), scheduled(), requested(), started("replacement")]) {
    const tracker = fixture(); tracker.accept(commit()); assertRefuses(tracker, value);
  }
  const repeatStart = fixture(); repeatStart.accept(started()); repeatStart.accept(commit()); assertRefuses(repeatStart, started());
});
void test("pending loader must equal the selected commit and cannot be replaced by a late browser start", () => {
  const before = fixture(); before.accept(started("pending")); assertRefuses(before, commit());
  const after = fixture(); after.accept(commit()); assertRefuses(after, started("other"));
  const blank = fixture(); blank.accept(commit("about:blank", "blank")); blank.accept(commit()); assertRefuses(blank, started("other", "about:blank"));
  const missingBlank = fixture(); missingBlank.accept(commit()); assertRefuses(missingBlank, started("blank", "about:blank"));
});
void test("navigation method parameters use closed shapes, exact child, fixed URL and supported intent", () => {
  for (const original of [scheduled(), cleared(), requested(), started(), loading("Page.frameStartedLoading"), loading("Page.frameStoppedLoading")]) {
    for (const change of [{ extra: true }, { frameId: "root" }, { frameId: "sensor" }]) {
      const tracker = fixture(); if (original.method === "Page.frameClearedScheduledNavigation") { tracker.accept(scheduled()); }
      assertRefuses(tracker, { ...original, params: { ...original.params, ...change } });
    }
  }
  for (const change of [{ navigationType: "reload" }, { navigationType: "sameDocument" }, { loaderId: "" }, { url: `${PCB_URL}#other` }]) {
    assertRefuses(fixture(), { ...started(), params: { ...started().params, ...change } });
  }
  for (const change of [{ reason: "reload" }, { disposition: "newTab" }, { disposition: "download" }, { url: "https://foreign/" }]) {
    assertRefuses(fixture(), { ...requested(), params: { ...requested().params, ...change } });
  }
  for (const change of [{ delay: -0 }, { delay: 0.1 }, { delay: Number.NaN }, { reason: "metaTagRefresh" }, { url: "https://foreign/" }]) {
    assertRefuses(fixture(), { ...scheduled(), params: { ...scheduled().params, ...change } });
  }
});
void test("committed frames retain reciprocal parent, source URL, security origin and navigation type", () => {
  for (const change of [{ id: "root" }, { parentId: "other" }, { loaderId: "" }, { urlFragment: "#" }, { securityOrigin: "https://foreign" }]) {
    assertRefuses(fixture(), commit(PCB_URL, "pcb-loader", change));
  }
  assertRefuses(fixture(), commit("about:blank", "blank", { securityOrigin: "https://foreign" }));
  const validBlank = fixture(); validBlank.accept(commit("about:blank", "blank", { securityOrigin: "://" }));
  validBlank.accept(commit()); validBlank.assertReady();
  for (const params of [{ ...commit().params, extra: true }, { ...commit().params, type: "BackForwardCacheRestore" }, { frame: commit().params["frame"] }]) {
    assertRefuses(fixture(), event("Page.frameNavigated", params));
  }
});
void test("loading observations are bounded and neither prove completion nor permit unknown frame navigation", () => {
  for (const method of ["Page.frameStartedLoading", "Page.frameStoppedLoading"] as const) {
    const tracker = fixture(); tracker.accept(loading(method)); tracker.accept(loading(method));
    assertRefuses(tracker, loading(method));
  }
  for (const tracker of [fixture(), new CurrentPcbDiagnosticChildNavigation("other-child", "root")]) {
    assert.equal(tracker.committedLoader, null);
    assert.throws(() => { tracker.assertReady(); }, /CHILD_NAVIGATION/u);
  }
  for (const [child, root] of [["root", "root"], ["", "root"], ["child", ""]]) {
    assert.throws(() => new CurrentPcbDiagnosticChildNavigation(child ?? "", root ?? ""), /CHILD_NAVIGATION/u);
  }
});
