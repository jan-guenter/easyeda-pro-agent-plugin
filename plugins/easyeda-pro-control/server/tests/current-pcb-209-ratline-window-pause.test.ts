import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { CURRENT_PCB_209_RATLINE_WINDOW_SOURCE, CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256,
  isCurrentPcb209RatlineWindowScript, qualifyCurrentPcb209RatlineWindowOwner,
  qualifyCurrentPcb209RatlineWindowPause, qualifyCurrentPcb209RatlineWindowSource } from "../src/current-pcb-209-ratline-window-pause.ts";
import type { CurrentPcb209RatlineWindowStage } from "../src/current-pcb-209-ratline-window-pause.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const contextId = 4, generatedScriptId = "58", sessionId = "original-session", uiScriptId = "12";
const uiUrl = `https://modules.lceda.cn/${CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath}`;
type Location = Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>;
type Frame = Readonly<{ functionName: string; url: string; functionLocation: Location; location: Location }>;
function frames(): Frame[] {
  const points = [["", 0, 0, 0, 0], ["", 1931, 1315, 1931, 1320], ["n", 1923, 80_850, 1931, 91],
    ["create", 1923, 80_633, 1931, 1313], ["create", 1923, 80_386, 1923, 80_406], ["by", 1923, 75_126, 1923, 76_601]] as const;
  return points.map(([functionName, startLine, startColumn, stopLine, stopColumn], index) => {
    const scriptId = index === 0 ? generatedScriptId : uiScriptId;
    return { functionName, url: "", functionLocation: { scriptId, lineNumber: startLine, columnNumber: startColumn },
      location: { scriptId, lineNumber: stopLine, columnNumber: stopColumn } };
  });
}
function creator(): object {
  return { functionName: "", scriptId: uiScriptId, url: uiUrl, lineNumber: 1931, columnNumber: 1320 };
}
function observations(stage: CurrentPcb209RatlineWindowStage = "initial"): { event: DiagnosticEvent; script: DiagnosticEvent } {
  const callFrames = frames();
  return {
    event: { method: "Debugger.paused", sessionId, params: { reason: "instrumentation", hitBreakpoints: [], data: { scriptId: generatedScriptId, url: "" },
      callFrames: stage === "initial" ? callFrames : callFrames.slice(0, 1) } },
    script: { method: "Debugger.scriptParsed", sessionId, params: { scriptId: generatedScriptId, executionContextId: contextId, url: "",
      hasSourceURL: false, isLiveEdit: false, isModule: false, startLine: 0, startColumn: 0, endLine: 0, endColumn: 6,
      length: 6, hash: CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256, scriptLanguage: "JavaScript", sourceMapURL: "",
      ...(stage === "initial" ? { stackTrace: { callFrames: [creator()], parentId: { id: "3" } } } : {}) } },
  };
}

void test("initial window qualification retains the observed creator and optional async parent token", () => {
  const { event, script } = observations();
  assert.equal(isCurrentPcb209RatlineWindowScript(script), true);
  assert.equal(qualifyCurrentPcb209RatlineWindowPause(event, script, sessionId, contextId, uiScriptId, "initial"), generatedScriptId);
  const withoutParent = { ...script, params: { ...script.params, stackTrace: { callFrames: [creator()] } } };
  assert.equal(qualifyCurrentPcb209RatlineWindowPause(event, withoutParent, sessionId, contextId, uiScriptId, "initial"), generatedScriptId);
  // This is a source-derived synthetic document shape, not connected evidence.
  const document = observations("document");
  assert.equal(qualifyCurrentPcb209RatlineWindowPause(document.event, document.script, sessionId, contextId, uiScriptId, "document"), generatedScriptId);
  assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(document.event, document.script, sessionId, contextId, uiScriptId, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(event, script, sessionId, contextId, uiScriptId, "document"), /PCB209_RATLINE_WINDOW_PAUSE/u);
});

void test("window pause rejects foreign callers, locations, sessions and script contexts", () => {
  const { event, script } = observations();
  for (const [session, context, ui] of [["foreign", contextId, uiScriptId], [sessionId, 5, uiScriptId], [sessionId, contextId, "foreign"]] as const) {
    assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(event, script, session, context, ui, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  }
  const originalFrames = frames();
  for (const [index, original] of originalFrames.entries()) {
    for (const changed of [{ ...original, functionName: "foreign" }, { ...original, url: uiUrl },
      { ...original, functionLocation: { ...original.functionLocation, scriptId: "foreign" } },
      { ...original, functionLocation: { ...original.functionLocation, columnNumber: original.functionLocation.columnNumber + 1 } },
      { ...original, location: { ...original.location, scriptId: "foreign" } },
      { ...original, location: { ...original.location, lineNumber: original.location.lineNumber + 1 } }]) {
      const callFrames = originalFrames.map((value, position) => position === index ? changed : value);
      const candidate = { ...event, params: { ...event.params, callFrames } };
      assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(candidate, script, sessionId, contextId, uiScriptId, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
    }
  }
  for (const candidate of [{ ...event, method: "Debugger.resumed" }, { ...event, sessionId: "foreign" },
    { ...event, params: { ...event.params, reason: "other" } },
    { ...event, params: { ...event.params, hitBreakpoints: ["foreign"] } },
    { ...event, params: { ...event.params, data: { scriptId: "59", url: "" } } },
    { ...event, params: { ...event.params, callFrames: originalFrames.slice(1) } },
    { ...event, params: { ...event.params, callFrames: [...originalFrames, ...originalFrames] } }]) {
    assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(candidate, script, sessionId, contextId, uiScriptId, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  }
});

void test("window script metadata and creator provenance reject substitutions and unsupported stacks", () => {
  const { event, script } = observations();
  for (const candidate of [{ ...script, method: "Debugger.paused" }, { ...script, sessionId: "foreign" }]) {
    assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(event, candidate, sessionId, contextId, uiScriptId, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  }
  for (const delta of [{ hash: "0".repeat(64) }, { length: 7 }, { endColumn: 7 }, { endLine: 1 }, { startColumn: 1 },
    { hasSourceURL: true }, { isLiveEdit: true }, { isModule: true }, { scriptLanguage: "WebAssembly" },
    { url: "foreign" }, { sourceMapURL: "foreign" }, { scriptId: uiScriptId }, { executionContextId: 5 }]) {
    const candidate = { ...script, params: { ...script.params, ...delta } };
    assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(event, candidate, sessionId, contextId, uiScriptId, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  }
  for (const stackTrace of [null, {}, { callFrames: [] }, { callFrames: [creator(), creator()] },
    { callFrames: [{ ...creator(), url: "https://foreign/ui.js" }] }, { callFrames: [{ ...creator(), scriptId: "foreign" }] },
    { callFrames: [{ ...creator(), lineNumber: 1932 }] }, { callFrames: [{ ...creator(), columnNumber: 1321 }] },
    { callFrames: [creator()], parent: { callFrames: [] } }, { callFrames: [creator()], description: "foreign" },
    { callFrames: [creator()], debuggerId: "foreign" }, { callFrames: [creator()], parentId: { id: "3", debuggerId: "foreign" } },
    { callFrames: [creator()], parentId: { id: "" } }, { callFrames: [creator()], parentId: { id: 3 } }]) {
    const candidate = { ...script, params: { ...script.params, stackTrace } };
    assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(event, candidate, sessionId, contextId, uiScriptId, "initial"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  }
  const document = observations("document");
  for (const stackTrace of [{ callFrames: [] }, { callFrames: [creator()] }, null]) {
    const candidate = { ...document.script, params: { ...document.script.params, stackTrace } };
    assert.throws(() => qualifyCurrentPcb209RatlineWindowPause(document.event, candidate, sessionId, contextId, uiScriptId, "document"), /PCB209_RATLINE_WINDOW_PAUSE/u);
  }
  assert.equal(isCurrentPcb209RatlineWindowScript(event), false);
  assert.equal(isCurrentPcb209RatlineWindowScript({ ...script, params: { ...script.params, hash: "0".repeat(64) } }), false);
});

void test("window source requires all six exact bytes rather than matching metadata alone", () => {
  assert.equal(Buffer.byteLength(CURRENT_PCB_209_RATLINE_WINDOW_SOURCE), 6);
  assert.equal(createHash("sha256").update(CURRENT_PCB_209_RATLINE_WINDOW_SOURCE).digest("hex"), CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256);
  qualifyCurrentPcb209RatlineWindowSource({ scriptSource: "void 0" });
  for (const raw of [null, {}, { scriptSource: "void 0\n" }, { scriptSource: "void 0;" }, { scriptSource: "void 1" },
    { scriptSource: "void 0", bytecode: "extra" }, { scriptSource: 6 }]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineWindowSource(raw); });
  }
});

const target = { rawWindowsPath: String.raw`C:\Disposable\Window.eprj2`, projectUuid: "a".repeat(64), documentUuid: "b".repeat(16),
  branchUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) };
const frameId = "original-frame", tabId = `${target.documentUuid}@${target.projectUuid}`;
function dom(): { owner: { backendNodeId: number; nodeId: number }; described: { node: {
  backendNodeId: number; frameId: string; nodeType: number; nodeName: string; localName: string; attributes: string[] } } } {
  return { owner: { backendNodeId: 17, nodeId: 3 }, described: { node: { backendNodeId: 17, frameId, nodeType: 1, nodeName: "IFRAME", localName: "iframe",
    attributes: ["id", `frame_${tabId}`, "c_dbid", tabId, "c_doctype", "3", "src", "editor?entry=pcb", "class", "extra\teditframe active"] } } };
}

void test("initial window DOM binds one iframe owner to the selected tab before pcb-canvas is present", () => {
  // Synthetic DOM follows the pinned UI create path; no live DOM was captured.
  const { described, owner } = dom();
  qualifyCurrentPcb209RatlineWindowOwner(owner, described, frameId, target);
  qualifyCurrentPcb209RatlineWindowOwner({ backendNodeId: owner.backendNodeId }, described, frameId, target);
  for (const delta of [{ backendNodeId: 18 }, { frameId: "foreign" }, { nodeType: 9 }, { nodeName: "DIV" }, { localName: "div" }]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, { node: { ...described.node, ...delta } }, frameId, target); });
  }
  for (const changedOwner of [{ ...owner, backendNodeId: 18 }, { ...owner, backendNodeId: 0 }, { ...owner, extra: true }]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(changedOwner, described, frameId, target); });
  }
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, described, "foreign", target); });
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, described, frameId, { ...target, projectUuid: "e".repeat(64) }); });
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, described, frameId, { ...target, documentUuid: "e".repeat(16) }); });
  for (const [attribute, value] of [["id", "foreign"], ["c_dbid", "foreign"], ["c_doctype", "2"],
    ["src", "editor?entry=sch"], ["class", "editframe-other"]] as const) {
    const attributes = [...described.node.attributes]; const index = attributes.indexOf(attribute); assert.notEqual(index, -1); attributes[index + 1] = value;
    assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, { node: { ...described.node, attributes } }, frameId, target); });
  }
  for (const attributes of [
    [...described.node.attributes, "pcb-canvas", ""], [...described.node.attributes, "blankiframe", "false"],
    [...described.node.attributes, "fromfile", ""], [...described.node.attributes, "jsoncacheready", ""],
    [...described.node.attributes, "srcdoc", ""], [...described.node.attributes, "ID", `frame_${tabId}`],
    [...described.node.attributes, "id", `frame_${tabId}`], [...described.node.attributes, "unpaired"],
  ]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, { node: { ...described.node, attributes } }, frameId, target); });
  }
});

void test("window source and DOM replies reject accessors and proxies without invoking their hooks", () => {
  let hooks = 0;
  const source = Object.defineProperty({}, "scriptSource", { enumerable: true, get: (): string => { hooks += 1; return "void 0"; } });
  const { described, owner } = dom();
  const selected = Object.defineProperty({}, "node", { enumerable: true, get: (): object => { hooks += 1; return described.node; } });
  const foreignOwner = Object.defineProperty({}, "backendNodeId", { enumerable: true, get: (): number => { hooks += 1; return owner.backendNodeId; } });
  const proxy = new Proxy({ scriptSource: "void 0" }, { get: (): never => { hooks += 1; throw new Error("must not run"); } });
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowSource(source); });
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowSource(proxy); });
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(foreignOwner, described, frameId, target); });
  assert.throws(() => { qualifyCurrentPcb209RatlineWindowOwner(owner, selected, frameId, target); });
  assert.equal(hooks, 0);
});
