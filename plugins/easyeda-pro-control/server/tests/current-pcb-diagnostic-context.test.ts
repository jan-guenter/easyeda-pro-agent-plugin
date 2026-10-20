import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentPcbDiagnosticContext, diagnosticBoundedObservation, validateDiagnosticFrameExpectation, validateDiagnosticScriptProfile } from "../src/current-pcb-diagnostic-context.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const SOURCE = "const syntheticIdentity = true;\n";
const EXPECTED = Object.freeze({ targetId: "target-1", frameId: "frame-1", frameUrl: "file:///synthetic/pcb.html", scriptUrl: "file:///synthetic/pcb.js",
  scriptSha256: createHash("sha256").update(SOURCE).digest("hex"), scriptBytes: Buffer.byteLength(SOURCE) });
const TARGET = { targetId: "target-1", type: "page", title: "synthetic", url: "file:///synthetic/ui.html", attached: false };
const FRAME = { id: "frame-1", loaderId: "loader-1", url: EXPECTED.frameUrl, securityOrigin: "file://", mimeType: "text/html" };
const CONTEXT = { id: 7, uniqueId: "unique-context-1", origin: "file://", name: "", auxData: { frameId: "frame-1", isDefault: true, type: "default" } };
const SCRIPT = { scriptId: "script-1", url: EXPECTED.scriptUrl, executionContextId: 7, hasSourceURL: false, scriptLanguage: "JavaScript" };
function event(method: string, params: Record<string, unknown>): DiagnosticEvent { return { method, params, sessionId: "session-1" }; }
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function fixture(): CurrentPcbDiagnosticContext {
  const context = new CurrentPcbDiagnosticContext(EXPECTED);
  context.selectTarget({ targetInfos: [TARGET] }); context.bindSession("session-1");
  context.observeFrame({ frameTree: { frame: FRAME } });
  context.observeEvent(event("Runtime.executionContextCreated", { context: CONTEXT }));
  context.observeEvent(event("Debugger.scriptParsed", SCRIPT));
  return context;
}
function finish(context: CurrentPcbDiagnosticContext, source = SOURCE): Readonly<Record<string, unknown>> {
  return context.finish({ scriptSource: source }, { targetInfos: [{ ...TARGET, attached: true }] }, { frameTree: { frame: FRAME } });
}
void test("fixed context binds target session frame loader default context uniqueId and exact source independently of URL", () => {
  const context = fixture(); assert.equal(context.script().scriptId, "script-1"); const result = finish(context);
  assert.equal(result["sourceVerified"], true); assert.equal(result["projectWorkerAssociationVerified"], false);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["continuousObservation"], false);
  assert.equal(result["sourceSha256"], EXPECTED.scriptSha256);
  assert.deepEqual(result["context"], CONTEXT); assert.deepEqual(result["frame"], FRAME);
});
void test("source identity refuses matching URL with different source or invalid UTF16 and never recovers", () => {
  for (const source of [SOURCE.replace("true", "null"), "\uD800", `${SOURCE}\0`]) {
    const context = fixture(); assert.throws(() => finish(context, source), /IDENTITY/u);
    assert.throws(() => finish(context), /IDENTITY/u);
  }
});
void test("returned script evidence cannot mutate retained context auxData", () => {
  const context = fixture(), selected = context.script(); const aux = selected.context["auxData"];
  assert.ok(aux !== null && typeof aux === "object" && "frameId" in aux); aux["frameId"] = "foreign";
  const result = finish(context); assert.deepEqual(result["context"], CONTEXT);
});
void test("navigation detach context loss debugger pause and unknown events invalidate without resume", () => {
  for (const method of ["Page.frameNavigated", "Page.frameDetached", "Page.navigatedWithinDocument", "Page.frameStartedNavigating",
    "Runtime.executionContextDestroyed", "Runtime.executionContextsCleared", "Target.detachedFromTarget", "Debugger.paused", "Future.unknown"]) {
    const context = fixture(); assert.throws(() => { context.observeEvent(event(method, {})); }, /INVALIDATED/u);
    assert.throws(() => finish(context), /IDENTITY/u);
  }
});
void test("unscoped detach and wrong session events are terminal", () => {
  for (const item of [{ method: "Target.detachedFromTarget", params: { sessionId: "session-1" } },
    { method: "Runtime.executionContextsCleared", params: {}, sessionId: "other-session" }]) {
    const context = fixture(); assert.throws(() => { context.observeEvent(item); }, /INVALIDATED/u);
  }
});
void test("duplicate context identity script identity and sourceURL spoof refuse", () => {
  for (const item of [event("Runtime.executionContextCreated", { context: CONTEXT }),
    event("Runtime.executionContextCreated", { context: { ...CONTEXT, id: 8 } }), event("Debugger.scriptParsed", SCRIPT)]) {
    const context = fixture(); assert.throws(() => { context.observeEvent(item); }, /INVALIDATED/u);
  }
  const context = new CurrentPcbDiagnosticContext(EXPECTED);
  context.selectTarget({ targetInfos: [TARGET] }); context.bindSession("session-1"); context.observeFrame({ frameTree: { frame: FRAME } });
  context.observeEvent(event("Runtime.executionContextCreated", { context: CONTEXT }));
  context.observeEvent(event("Debugger.scriptParsed", { ...SCRIPT, hasSourceURL: true }));
  assert.throws(() => context.script(), /IDENTITY/u);
});
void test("frame-tree reciprocal membership loader changes and duplicate frames refuse", () => {
  for (const frameTree of [{ frame: { ...FRAME, loaderId: "loader-2" } },
    { frame: FRAME, childFrames: [{ frame: FRAME }] },
    { frame: { ...FRAME, id: "root" }, childFrames: [{ frame: { ...FRAME, parentId: "wrong" } }] }]) {
    const context = fixture(); assert.throws(() => { context.observeFrame({ frameTree }); }, /IDENTITY/u);
  }
});
void test("target inspection refuses worker URL lookalikes and preexisting attached targets", () => {
  for (const item of [{ ...TARGET, type: "worker" }, { ...TARGET, attached: true }, { ...TARGET, targetId: "different" }]) {
    const context = new CurrentPcbDiagnosticContext(EXPECTED); assert.throws(() => { context.selectTarget({ targetInfos: [item] }); }, /IDENTITY/u);
  }
  const context = fixture(); assert.throws(() => context.finish({ scriptSource: SOURCE }, { targetInfos: [{ ...TARGET, attached: true, title: "changed" }] }, { frameTree: { frame: FRAME } }), /IDENTITY/u);
});
void test("separate default context for selected frame is required, not just a script URL", () => {
  const context = new CurrentPcbDiagnosticContext(EXPECTED); context.selectTarget({ targetInfos: [TARGET] }); context.bindSession("session-1");
  context.observeFrame({ frameTree: { frame: FRAME } });
  context.observeEvent(event("Runtime.executionContextCreated", { context: { ...CONTEXT, auxData: { ...CONTEXT.auxData, frameId: "other-frame" } } }));
  context.observeEvent(event("Debugger.scriptParsed", SCRIPT)); assert.throws(() => context.script(), /IDENTITY/u);
});
void test("bounded expectations reject extra fields source sizes and noncanonical tokens", () => {
  for (const value of [{ ...EXPECTED, targetId: "target\n" }, { ...EXPECTED, scriptBytes: 20_971_521 },
    { ...EXPECTED, scriptBytes: -0 }, { ...EXPECTED, extra: "arbitrary-eval" }]) {
    assert.throws(() => validateDiagnosticFrameExpectation(value), /IDENTITY/u);
  }
});
const PROFILE = { family: "pcb", relativePath: "pro-pcb/test-version/js/pcb.js", scriptSha256: EXPECTED.scriptSha256, scriptBytes: EXPECTED.scriptBytes } as const;
function staged(scriptUrl = `file:///synthetic/${PROFILE.relativePath}`): CurrentPcbDiagnosticContext {
  const context = new CurrentPcbDiagnosticContext("target-1"); context.selectTarget({ targetInfos: [TARGET] }); context.bindSession("session-1");
  context.observeFrames({ frameTree: { frame: FRAME } }); context.selectFrame("frame-1", PROFILE);
  context.observeEvent(event("Runtime.executionContextCreated", { context: CONTEXT }));
  context.observeEvent(event("Debugger.scriptParsed", { ...SCRIPT, url: scriptUrl })); return context;
}
void test("staged frame identity accepts an observed frame and fixed versioned family without target-frame equality", () => {
  const context = staged(); context.observeEvent(event("Runtime.consoleAPICalled", { args: [{ value: "private-console-data" }] }));
  const result = finish(context); assert.equal(result["family"], "pcb"); assert.equal(result["sourceVerified"], true);
  assert.equal(result["eventCount"], 3); assert.equal(Object.hasOwn(result, "events"), false);
  assert.equal(JSON.stringify(result).includes("private-console-data"), false);
  assert.deepEqual(result["script"], { scriptId: "script-1", url: `file:///synthetic/${PROFILE.relativePath}`, executionContextId: 7 });
});
void test("staged script paths reject aliases credentials query fragments and wrong version boundaries", () => {
  const credentialedUrl = new URL(`https://host/${PROFILE.relativePath}`);
  credentialedUrl.username = "user"; credentialedUrl.password = "pass";
  for (const url of [`file:///synthetic/not-${PROFILE.relativePath}`, `file:///synthetic/${PROFILE.relativePath}?`,
    `file:///synthetic/${PROFILE.relativePath}#`, credentialedUrl.href,
    `file:///synthetic/../${PROFILE.relativePath}`, `file:///synthetic/${PROFILE.relativePath.replace("pcb.js", "%70cb.js")}`,
    `javascript:/${PROFILE.relativePath}`, `file:///synthetic/${PROFILE.relativePath.replace("test-version", "other-version")}`]) {
    assert.throws(() => staged(url).script(), /IDENTITY/u);
  }
  assert.equal(finish(staged(`file:///Program%20Files/EasyEDA/${PROFILE.relativePath}`))["sourceVerified"], true);
});
void test("staged inventory refuses changed reciprocal tree or a frame absent from its retained sample", () => {
  const context = new CurrentPcbDiagnosticContext("target-1"); context.selectTarget({ targetInfos: [TARGET] }); context.bindSession("session-1");
  const inventory = context.observeFrames({ frameTree: { frame: FRAME } });
  assert.deepEqual(inventory["frames"], [{ id: "frame-1", loaderId: "loader-1", url: FRAME.url, securityOrigin: "file://" }]);
  assert.throws(() => { context.selectFrame("target-1", PROFILE); }, /IDENTITY/u);
  const changed = staged(); assert.throws(() => { changed.observeFrames({ frameTree: { frame: { ...FRAME, loaderId: "different" } } }); }, /IDENTITY/u);
  assert.throws(() => changed.script(), /IDENTITY/u);
});
void test("staged profiles retain20MiB decoded bound and128KiB compact result bound", () => {
  assert.equal(validateDiagnosticScriptProfile({ ...PROFILE, scriptBytes: 20_971_520 }).scriptBytes, 20_971_520);
  for (const value of [{ ...PROFILE, scriptBytes: 20_971_521 }, { ...PROFILE, relativePath: "../pcb.js" },
    { ...PROFILE, relativePath: "pro-pcb/../pcb.js" }, { ...PROFILE, extra: true }]) {
    assert.throws(() => validateDiagnosticScriptProfile(value), /IDENTITY/u);
  }
  assert.throws(() => diagnosticBoundedObservation({ value: "x".repeat(128 * 1024) }), /IDENTITY/u);
});
void test("fixed native command vocabulary has no generic methods or params", () => {
  assert.deepEqual(diagnosticNativeRequest(wire({ id: 1, method: "Target.attachToTarget", params: { targetId: "target-1", flatten: true } })),
    { action: "send", requestId: 1, method: "Target.attachToTarget", targetId: "target-1" });
  assert.deepEqual(diagnosticNativeRequest(wire({ id: 2, method: "Debugger.getScriptSource", params: { scriptId: "script-1" }, sessionId: "session-1" })),
    { action: "send", requestId: 2, method: "Debugger.getScriptSource", sessionId: "session-1", scriptId: "script-1" });
  for (const value of [{ id: 1, method: "Runtime.evaluate", params: { expression: "1" }, sessionId: "session-1" },
    { id: 1, method: "Debugger.pause" }, { id: 1, method: "Target.attachToTarget", params: { targetId: "target-1", flatten: false } },
    { id: 1, method: "Page.enable", params: { evil: true }, sessionId: "session-1" },
    { id: 1, method: "Debugger.getScriptSource", params: { scriptId: "x\"" }, sessionId: "session-1" },
    { id: DIAGNOSTIC_REQUEST_LIMIT + 1, method: "Browser.getVersion" }]) { assert.throws(() => diagnosticNativeRequest(wire(value)), /OUTBOUND/u); }
});
const PROJECT_UUID = "a".repeat(64), UI_BASE = "https://client/editor?cll=warn";
const UI_TARGET = { ...TARGET, url: `${UI_BASE}#` };
const UI_FRAME = { ...FRAME, url: UI_BASE, urlFragment: "#", securityOrigin: "https://client" };
const UI_CONTEXT = { ...CONTEXT, origin: "https://client" };
const UI_PROFILE = { ...PROFILE, family: "ui", relativePath: "pro-ui/test-version/js/ui.js" } as const;
const OPEN_URL = `${UI_BASE}#id=${PROJECT_UUID}`;
const OPEN_TARGET_REPLY = { targetInfos: [{ ...UI_TARGET, url: OPEN_URL, attached: true }] };
const OPEN_FRAME_REPLY = { frameTree: { frame: { ...UI_FRAME, urlFragment: `#id=${PROJECT_UUID}` } } };
function openingFixture(verifySource = true, initialFragment: "#" | "" = "#"): CurrentPcbDiagnosticContext {
  const context = new CurrentPcbDiagnosticContext("target-1");
  const targetRow = { ...UI_TARGET, url: `${UI_BASE}${initialFragment}` };
  const { urlFragment: _fragment, ...baseFrame } = UI_FRAME;
  const frameRow = initialFragment === "#" ? UI_FRAME : baseFrame;
  context.selectTarget({ targetInfos: [targetRow] }); context.bindSession("session-1");
  context.observeFrames({ frameTree: { frame: frameRow } }); context.selectFrame("frame-1", UI_PROFILE);
  context.observeEvent(event("Runtime.executionContextCreated", { context: UI_CONTEXT }));
  context.observeEvent(event("Debugger.scriptParsed", { ...SCRIPT, url: `https://client/${UI_PROFILE.relativePath}` }));
  if (verifySource) { context.finish({ scriptSource: SOURCE }, { targetInfos: [{ ...targetRow, attached: true }] }, { frameTree: { frame: frameRow } }); }
  return context;
}
function within(context: CurrentPcbDiagnosticContext, change: Record<string, unknown> = {}): void {
  context.observeEvent(event("Page.navigatedWithinDocument", { frameId: "frame-1", url: OPEN_URL, navigationType: "fragment", ...change }));
}
void test("source-admitted UI allows exactly one selected worker-only same-document transition", () => {
  for (const fragment of ["#", ""] as const) {
    const context = openingFixture(true, fragment);
    const selected = { sessionId: "session-1", uniqueContextId: CONTEXT.uniqueId };
    assert.deepEqual(context.openingContext(), selected);
    assert.deepEqual(context.beginOpeningTransition(PROJECT_UUID), selected);
    within(context); context.finishOpeningTransition(OPEN_TARGET_REPLY, OPEN_FRAME_REPLY);
    assert.deepEqual(context.openingContext(), selected);
    context.observeTarget(OPEN_TARGET_REPLY); context.observeFrames(OPEN_FRAME_REPLY);
    assert.throws(() => context.beginOpeningTransition(PROJECT_UUID), /IDENTITY/u);
    assert.throws(() => context.openingContext(), /IDENTITY/u);
  }
});
void test("project title transition requires original CDP initial title and one exact source-derived opened title", () => {
  const titleProof = { initialTitle: TARGET.title, expectedOpenedTitle: `Diagnostic | ${TARGET.title}` };
  const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID, titleProof); within(context);
  const opened = { targetInfos: [{ ...OPEN_TARGET_REPLY.targetInfos[0], title: titleProof.expectedOpenedTitle }] };
  context.finishOpeningTransition(opened, OPEN_FRAME_REPLY); context.observeTarget(opened);
  const wrongInitial = openingFixture();
  assert.throws(() => wrongInitial.beginOpeningTransition(PROJECT_UUID, { ...titleProof, initialTitle: "foreign" }), /IDENTITY/u);
  const wrongFinal = openingFixture(); wrongFinal.beginOpeningTransition(PROJECT_UUID, titleProof); within(wrongFinal);
  assert.throws(() => { wrongFinal.finishOpeningTransition(OPEN_TARGET_REPLY, OPEN_FRAME_REPLY); }, /IDENTITY/u);
});
void test("opening selector requires source-proved top-level UI and never revives failed identity", () => {
  for (const context of [openingFixture(false), fixture(), staged()]) {
    assert.throws(() => context.openingContext(), /IDENTITY/u);
  }
  const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID);
  assert.throws(() => { context.observeEvent(event("Runtime.executionContextDestroyed", { executionContextId: 7 })); }, /INVALIDATED/u);
  assert.throws(() => { context.finishOpeningTransition(OPEN_TARGET_REPLY, OPEN_FRAME_REPLY); }, /IDENTITY/u);
  assert.throws(() => context.beginOpeningTransition(PROJECT_UUID), /IDENTITY/u);
});
void test("one-shot opening refuses absent navigation, replacement loader, title drift and restored child frames", () => {
  const absent = openingFixture(); absent.beginOpeningTransition(PROJECT_UUID);
  assert.throws(() => { absent.finishOpeningTransition(OPEN_TARGET_REPLY, OPEN_FRAME_REPLY); }, /IDENTITY/u);
  for (const frameTree of [
    { frame: { ...OPEN_FRAME_REPLY.frameTree.frame, loaderId: "new-loader" } },
    { frame: { ...OPEN_FRAME_REPLY.frameTree.frame, securityOrigin: "https://foreign" } },
    { frame: { ...OPEN_FRAME_REPLY.frameTree.frame, url: OPEN_URL, urlFragment: undefined } },
    { frame: OPEN_FRAME_REPLY.frameTree.frame, childFrames: [{ frame: { ...FRAME, id: "child", parentId: "frame-1" } }] },
  ]) {
    const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID); within(context);
    assert.throws(() => { context.finishOpeningTransition(OPEN_TARGET_REPLY, { frameTree }); }, /IDENTITY/u);
  }
  const changedTitle = openingFixture(); changedTitle.beginOpeningTransition(PROJECT_UUID); within(changedTitle);
  assert.throws(() => { changedTitle.finishOpeningTransition({ targetInfos: [{ ...UI_TARGET, url: OPEN_URL, attached: true, title: "changed" }] }, OPEN_FRAME_REPLY); }, /IDENTITY/u);
});
void test("armed opening admits no foreign frame, restored-tab URL, full navigation or unbounded event stream", () => {
  for (const change of [{ frameId: "foreign" }, { url: `${UI_BASE}#id=${"b".repeat(64)}` },
    { url: `${OPEN_URL},tab=*${"d".repeat(16)}@${PROJECT_UUID}` }, { url: `${UI_BASE}#` },
    { navigationType: "other" }, { extra: true }]) {
    const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID);
    assert.throws(() => { within(context, change); }, /INVALIDATED/u);
  }
  for (const method of ["Page.frameAttached", "Page.frameDetached", "Page.frameNavigated",
    "Runtime.executionContextsCleared", "Target.detachedFromTarget", "Debugger.paused"]) {
    const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID);
    assert.throws(() => { context.observeEvent(event(method, {})); }, /INVALIDATED/u);
  }
  const bounded = openingFixture(); bounded.beginOpeningTransition(PROJECT_UUID);
  for (let i = 0; i < 8; i += 1) { within(bounded); }
  assert.throws(() => { within(bounded); }, /INVALIDATED/u);
});
void test("unarmed and completed opening retain ordinary navigation invalidation", () => {
  assert.throws(() => { within(openingFixture()); }, /INVALIDATED/u);
  const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID); within(context);
  context.finishOpeningTransition(OPEN_TARGET_REPLY, OPEN_FRAME_REPLY);
  assert.throws(() => { within(context); }, /INVALIDATED/u);
});
void test("fixed model selector retains only an already source-qualified PCB frame", () => {
  const context = staged(); finish(context);
  assert.deepEqual(context.modelContext(), { sessionId: "session-1", scriptId: "script-1", uniqueContextId: CONTEXT.uniqueId });
  for (const refused of [openingFixture(), fixture(), staged()]) {
    assert.throws(() => refused.modelContext(), /IDENTITY/u);
  }
  assert.throws(() => { context.observeEvent(event("Runtime.executionContextsCleared", {})); }, /INVALIDATED/u);
  assert.throws(() => context.modelContext(), /IDENTITY/u);
});
const PCB_DOCUMENT = "b".repeat(16), PCB_TAB = `${PCB_DOCUMENT}@${PROJECT_UUID}`;
const PCB_URL = `${OPEN_URL},tab=*${PCB_TAB}`;
const PCB_CHILD = { id: "pcb-frame", parentId: "frame-1", loaderId: "pcb-loader", url: "https://client/editor?entry=pcb",
  securityOrigin: "https://client", mimeType: "text/html" };
const PCB_TARGET_REPLY = { targetInfos: [{ ...UI_TARGET, url: PCB_URL, attached: true }] };
const PCB_FRAME_REPLY = { frameTree: { frame: { ...UI_FRAME, urlFragment: `#id=${PROJECT_UUID},tab=*${PCB_TAB}` }, childFrames: [{ frame: PCB_CHILD }] } };
const PCB_NODE = { nodeType: 1, nodeName: "IFRAME", localName: "iframe", backendNodeId: 42, frameId: "pcb-frame",
  attributes: ["id", `frame_${PCB_TAB}`, "c_dbid", PCB_TAB, "c_doctype", "3", "src", "editor?entry=pcb",
    "pcb-canvas", "true", "class", "editframe selected"] };
function pcbOpeningFixture(): CurrentPcbDiagnosticContext {
  const context = openingFixture(); context.beginOpeningTransition(PROJECT_UUID); within(context);
  context.finishOpeningTransition(OPEN_TARGET_REPLY, OPEN_FRAME_REPLY);
  context.beginPcbOpeningTransition(PROJECT_UUID, PCB_DOCUMENT);
  return context;
}
function pcbChild(context: CurrentPcbDiagnosticContext): void {
  within(context, { url: PCB_URL });
  context.observeEvent(event("Page.frameAttached", { frameId: "pcb-frame", parentFrameId: "frame-1" }));
  context.observeEvent(event("Page.frameNavigated", { frame: PCB_CHILD, type: "Navigation" }));
  context.observeEvent(event("Runtime.executionContextCreated", { context: { ...UI_CONTEXT, id: 8, uniqueId: "pcb-context",
    auxData: { ...UI_CONTEXT.auxData, frameId: "pcb-frame" } } }));
  context.observeEvent(event("Debugger.scriptParsed", { ...SCRIPT, scriptId: "pcb-script", executionContextId: 8,
    url: `https://client/${PROFILE.relativePath}` }));
}
function pcbSource(context: CurrentPcbDiagnosticContext): Readonly<Record<string, unknown>> {
  pcbChild(context); context.observePcbOpeningFrames(PCB_TARGET_REPLY, PCB_FRAME_REPLY);
  context.observePcbFrameOwner({ backendNodeId: 42 }, { node: PCB_NODE }); context.pcbScript(PROFILE);
  return context.finishPcbOpening({ scriptSource: SOURCE }, PCB_TARGET_REPLY, PCB_FRAME_REPLY);
}
void test("separate PCB branch binds original UI, one DOM-owned child and separate complete source before commit", () => {
  const context = pcbOpeningFixture(), result = pcbSource(context);
  assert.equal(result["sourceVerified"], true); assert.equal(result["domOwnerVerified"], true);
  assert.equal(result["documentUuid"], PCB_DOCUMENT); assert.equal(result["executionAuthorized"], false);
  assert.deepEqual(context.pcbOpeningContext(), { sessionId: "session-1", uniqueContextId: UI_CONTEXT.uniqueId });
  context.completePcbOpening();
  assert.deepEqual(context.modelContext(), { sessionId: "session-1", scriptId: "pcb-script", uniqueContextId: "pcb-context" });
  assert.throws(() => { context.completePcbOpening(); }, /IDENTITY/u);
});
void test("PCB source alone never admits model and native completion cannot precede source", () => {
  const sourceOnly = pcbOpeningFixture(); pcbSource(sourceOnly);
  assert.throws(() => sourceOnly.modelContext(), /IDENTITY/u);
  const noSource = pcbOpeningFixture(); pcbChild(noSource);
  noSource.observePcbOpeningFrames(PCB_TARGET_REPLY, PCB_FRAME_REPLY);
  noSource.observePcbFrameOwner({ backendNodeId: 42 }, { node: PCB_NODE });
  assert.throws(() => { noSource.completePcbOpening(); }, /IDENTITY/u);
});
void test("PCB opening allows initial blank transition but refuses any second committed navigation", () => {
  const context = pcbOpeningFixture(); within(context, { url: PCB_URL });
  context.observeEvent(event("Page.frameAttached", { frameId: "pcb-frame", parentFrameId: "frame-1" }));
  context.observeEvent(event("Page.frameNavigated", { frame: { ...PCB_CHILD, url: "about:blank", loaderId: "blank-loader" }, type: "Navigation" }));
  context.observeEvent(event("Page.frameNavigated", { frame: PCB_CHILD, type: "Navigation" }));
  assert.deepEqual(context.observePcbOpeningFrames(PCB_TARGET_REPLY, PCB_FRAME_REPLY), { frameId: "pcb-frame", rootFrameId: "frame-1" });
  for (const frame of [PCB_CHILD, { ...PCB_CHILD, loaderId: "reloaded-pcb" },
    { ...PCB_CHILD, url: "about:blank", loaderId: "replacement-blank" }]) {
    const changed = pcbOpeningFixture(); pcbChild(changed);
    assert.throws(() => { changed.observeEvent(event("Page.frameNavigated", { frame, type: "Navigation" })); }, /INVALIDATED/u);
    assert.throws(() => changed.observePcbOpeningFrames(PCB_TARGET_REPLY, PCB_FRAME_REPLY), /IDENTITY/u);
  }
});
void test("PCB branch rejects second child, root replacement and foreign navigation", () => {
  for (const item of [
    event("Page.frameAttached", { frameId: "another", parentFrameId: "frame-1" }),
    event("Page.frameNavigated", { frame: { ...PCB_CHILD, id: "frame-1" }, type: "Navigation" }),
    event("Page.frameNavigated", { frame: { ...PCB_CHILD, url: "https://foreign/editor?entry=pcb" }, type: "Navigation" }),
    event("Runtime.executionContextDestroyed", { executionContextId: 7 }),
  ]) {
    const context = pcbOpeningFixture(); pcbChild(context);
    assert.throws(() => { context.observeEvent(item); }, /INVALIDATED/u);
  }
  for (const target of [{ ...PCB_TARGET_REPLY.targetInfos[0], title: "foreign" }, { ...PCB_TARGET_REPLY.targetInfos[0], targetId: "other" }]) {
    const context = pcbOpeningFixture(); pcbChild(context);
    assert.throws(() => context.observePcbOpeningFrames({ targetInfos: [target] }, PCB_FRAME_REPLY), /IDENTITY/u);
  }
});
void test("PCB frame owner requires reciprocal backend/frame identity and exact attributes", () => {
  for (const node of [{ ...PCB_NODE, backendNodeId: 43 }, { ...PCB_NODE, frameId: "other" },
    { ...PCB_NODE, attributes: [...PCB_NODE.attributes, "id", `frame_${PCB_TAB}`] },
    { ...PCB_NODE, attributes: [...PCB_NODE.attributes, "blankiframe", "true"] },
    { ...PCB_NODE, attributes: PCB_NODE.attributes.map(value => value === "3" ? "1" : value) },
    { ...PCB_NODE, attributes: PCB_NODE.attributes.map(value => value === "editor?entry=pcb" ? "editor?entry=sch" : value) }]) {
    const context = pcbOpeningFixture(); pcbChild(context); context.observePcbOpeningFrames(PCB_TARGET_REPLY, PCB_FRAME_REPLY);
    assert.throws(() => { context.observePcbFrameOwner({ backendNodeId: 42 }, { node }); }, /IDENTITY/u);
  }
});
void test("PCB admission refuses changed source and post-source context loss", () => {
  const changed = pcbOpeningFixture(); pcbChild(changed); changed.observePcbOpeningFrames(PCB_TARGET_REPLY, PCB_FRAME_REPLY);
  changed.observePcbFrameOwner({ backendNodeId: 42 }, { node: PCB_NODE }); changed.pcbScript(PROFILE);
  assert.throws(() => changed.finishPcbOpening({ scriptSource: SOURCE.replace("true", "null") }, PCB_TARGET_REPLY, PCB_FRAME_REPLY), /IDENTITY/u);
  const lost = pcbOpeningFixture(); pcbSource(lost);
  assert.throws(() => { lost.observeEvent(event("Runtime.executionContextDestroyed", { executionContextId: 8 })); }, /INVALIDATED/u);
  assert.throws(() => { lost.completePcbOpening(); }, /IDENTITY/u);
});
