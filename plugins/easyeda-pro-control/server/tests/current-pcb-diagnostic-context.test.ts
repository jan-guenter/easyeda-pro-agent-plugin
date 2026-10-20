import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentPcbDiagnosticContext, diagnosticBoundedObservation, validateDiagnosticFrameExpectation, validateDiagnosticScriptProfile } from "../src/current-pcb-diagnostic-context.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
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
    { id: 33, method: "Browser.getVersion" }]) { assert.throws(() => diagnosticNativeRequest(wire(value)), /OUTBOUND/u); }
});
