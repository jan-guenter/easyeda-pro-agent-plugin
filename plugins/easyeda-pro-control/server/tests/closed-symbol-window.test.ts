import assert from "node:assert/strict";
import { test } from "node:test";
import { selectClosedSymbolApplicationWindow } from "../src/closed-symbol-window.ts";

const application = { handle: "101", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false,
  title: "JLCEDA Pro - V3.2.149.88089769", bounds: [0, 0, 1384, 736] };
const tooltip = { ...application, handle: "202", title: "", bounds: [20, 20, 71, 32] };
void test("semantic application selection ignores a reported ownerless tooltip and preserves the real handle", () => {
  assert.equal(selectClosedSymbolApplicationWindow({ windows: [tooltip, application], mainWindowHandle: tooltip.handle }, 100), application.handle);
  assert.equal(selectClosedSymbolApplicationWindow({ windows: [application], mainWindowHandle: application.handle }, 100), application.handle);
});
void test("semantic application selection rejects ambiguous, malformed and foreign-root candidates", () => {
  for (const windows of [[application, { ...application, handle: "333" }], [application, { ...tooltip, handle: application.handle }],
    [{ ...application, pid: 101 }], [{ ...application, bounds: [0, 0, Number.NaN, 736] }], [tooltip]]) {
    assert.throws(() => selectClosedSymbolApplicationWindow({ windows, mainWindowHandle: tooltip.handle }, 100), /ambiguous or unavailable/u);
  }
});
