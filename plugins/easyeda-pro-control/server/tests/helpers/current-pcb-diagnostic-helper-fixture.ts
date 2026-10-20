/** Synthetic native-helper protocol peer. No Windows/EasyEDA launch or handles. */
import assert from "node:assert/strict";
import process from "node:process";
import { createInterface } from "node:readline";

const scenario = process.argv[2];
const owner = { helperInstance: "b".repeat(32), jobId: "a".repeat(32), rootPid: 123, rootCreated: "133712345678901234" };
const staged = scenario?.startsWith("staged") === true;
const openingCase = scenario?.startsWith("opening") === true;
const modelCase = scenario?.startsWith("staged-model") === true;
const workerCase = scenario?.startsWith("staged-worker") === true;
const identityCase = staged || openingCase || scenario === "identity" || scenario === "identity-navigation" || scenario === "identity-large-source";
const noProcessCase = scenario?.startsWith("no-process-") === true;
const creationState = scenario === "no-process-create-refused" || scenario?.startsWith("no-process-win32") === true ? "returned-false" : "not-entered";
const uiBase = "https://client/editor?cll=warn";
const target = { targetId: "target-1", type: "page", title: "synthetic", url: openingCase ? `${uiBase}#` : "file:///synthetic/ui.html" };
const worker = { targetId: "worker-1", type: "worker", title: `project_${"a".repeat(64)}_window_1`,
  url: "file:///synthetic/editor?entry=mgr-project-worker.js", attached: true };
let attached = false;
let workerAttached = false;
let opened = false;
let launchAttempted = false;
let frameReads = 0, targetReads = 0;
let sent = Buffer.alloc(0), terminated = false;
const lines = createInterface({ input: process.stdin });
lines.on("line", line => {
  const request: unknown = JSON.parse(line);
  assert.ok(request !== null && typeof request === "object");
  assert.ok("action" in request && "id" in request);
  let result: unknown = {};
  if (request["action"] === "launch") {
    launchAttempted = true;
    if (scenario === "launch-hang") { return; }
    if (scenario === "launch-malformed") { process.stdout.write("{malformed}\n"); return; }
    if (scenario === "launch-failed" || scenario === "launch-time-missing" || noProcessCase) {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-post-create-failure" })}\n`); return;
    }
    result = owner;
  } else if (request["action"] === "identity") {
    if (noProcessCase) { result = { ...owner, rootPid: 0, rootCreated: "0" }; }
    else { result = scenario === "launch-time-missing" ? { ...owner, rootCreated: "0" } : owner; }
  }
  else if (request["action"] === "send") {
    if (scenario === "hang") { return; }
    if (scenario === "stderr") { process.stderr.write("synthetic private diagnostic\n"); return; }
    if (scenario === "duplicate") { process.stdout.write(`{"id":"${String(request["id"])}","ok":true,"result":{},"result":{"written":true}}\n`); return; }
    if (scenario === "native-send-failed") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-partial-write" })}\n`); return;
    }
    assert.ok("method" in request && "requestId" in request);
    let payload: unknown = request["method"] === "Browser.getVersion" ? { product: "synthetic", protocolVersion: "1.3" } : { targetInfos: [] };
    const events: unknown[] = [];
    if ("sessionId" in request && request["sessionId"] === "worker-session-1") {
      assert.equal(workerCase, true);
      payload = workerResponse(request, events);
    } else if (identityCase) {
      if (request["method"] === "Browser.getVersion") { payload = { product: "synthetic", protocolVersion: "1.3", revision: "synthetic-revision", userAgent: "synthetic-agent", jsVersion: "synthetic-js" }; }
      else if (request["method"] === "Target.getTargets") {
        targetReads += 1;
        payload = { targetInfos: [{ ...target, attached, ...(scenario === "staged-target-changed" && targetReads > 1 ? { title: "changed" } : {}) },
          ...(workerAttached ? [worker] : [])] };
      }
      else if (request["method"] === "Target.attachToTarget") {
        assert.ok("targetId" in request);
        assert.equal(request["targetId"], "target-1"); attached = true; payload = { sessionId: "session-1" };
        events.push({ method: "Target.attachedToTarget", params: { sessionId: "session-1", targetInfo: { ...target, attached }, waitingForDebugger: false } });
      } else {
        assert.ok("sessionId" in request);
        assert.equal(request["sessionId"], "session-1");
        if ("modelPhase" in request) {
          assert.equal(modelCase, true); payload = modelResponse(request, events);
        } else if (request["method"] === "Target.setAutoAttach") {
          assert.ok(workerCase || openingCase); payload = {};
          events.push(...workerAttachment());
        } else if (request["method"] === "Page.enable") { payload = {}; }
        else if (request["method"] === "Page.getFrameTree") {
          frameReads += 1;
          const frame = { id: "frame-1", loaderId: scenario === "staged-frame-changed" && frameReads > 2 ? "loader-2" : "loader-1",
            url: "file:///synthetic/pcb.html", securityOrigin: "file://" };
          payload = { frameTree: frameTree(frame) };
        } else if (request["method"] === "Runtime.enable") {
          payload = {}; events.push({ method: "Runtime.executionContextCreated", sessionId: "session-1",
            params: { context: { id: 7, uniqueId: "unique-context-1", origin: openingCase ? "https://client" : "file://", name: "", auxData: { frameId: "frame-1", isDefault: true, type: "default" } } } },
          ...(staged ? [{ method: "Runtime.consoleAPICalled", sessionId: "session-1", params: { args: [{ value: "private-console-data" }] } }] : []));
        } else if (request["method"] === "Debugger.enable") {
          payload = { debuggerId: "debugger-1" }; events.push({ method: "Debugger.scriptParsed", sessionId: "session-1",
            params: { scriptId: "script-1", url: sourceScriptUrl(),
              executionContextId: 7, hasSourceURL: false, scriptLanguage: "JavaScript" } });
        } else if (request["method"] === "Debugger.getScriptSource") {
          assert.ok("scriptId" in request);
          assert.equal(request["scriptId"], "script-1");
          payload = { scriptSource: sourcePayload() };
          events.push(...navigationEvent());
        } else if (request["method"] === "Runtime.callFunctionOn") {
          assert.equal(openingCase, true); payload = openingResponse(request, events);
        } else { throw new Error("unexpected synthetic method"); }
      }
    }
    const response = { id: scenario === "malformed-cdp" ? 99 : request["requestId"], result: payload,
      ...("sessionId" in request ? { sessionId: request["sessionId"] } : {}) };
    sent = Buffer.from([...events, response].map(value => `${JSON.stringify(value)}\0`).join(""));
    result = { written: true };
  } else if (request["action"] === "poll") {
    if (scenario === "malformed-chunk") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: true, result: { bytes: "%%%" } })}\n`); return;
    }
    const size = scenario === "identity-large-source" || scenario === "staged-large-source" ? 65_536 : 17;
    result = { bytes: sent.subarray(0, size).toString("base64") }; sent = sent.subarray(size);
  } else if (request["action"] === "window") { result = { hwnd: "456" }; }
  else if (request["action"] === "normal-close") { terminated = true; result = { closeDispatched: true, saveOrDiscardSelected: false }; }
  else if (request["action"] === "termination") { result = { terminated }; }
  else if (request["action"] === "release-unlaunched") {
    assert.equal(launchAttempted, false);
    result = { released: true, launchNeverAttempted: scenario !== "unlaunched-ambiguous" };
  }
  else if (request["action"] === "no-process-proof" || request["action"] === "release-no-process") {
    assert.deepEqual(Object.keys(request).toSorted(), ["action", "id"]);
    assert.ok(noProcessCase || !launchAttempted);
    if (scenario === "no-process-create-unknown" || scenario === "no-process-nonzero-output") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-no-process-proof-refused" })}\n`); return;
    }
    const release = request["action"] === "release-no-process";
    let createProcessError = 87;
    if (scenario === "no-process-win32-invalid") { createProcessError = -1; }
    else if (release && scenario === "no-process-win32-changed") { createProcessError = 5; }
    result = { creationState: release && scenario === "no-process-release-changed" ? "returned-false" : creationState,
      processCreated: scenario === "no-process-proof-malformed" || release && scenario === "no-process-release-malformed",
      ...(scenario?.startsWith("no-process-win32") === true ? {
        createProcessError,
      } : {}),
      ...(release ? { released: true } : {}) };
  }
  else if (request["action"] === "release") {
    if (!terminated) { process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-retain-live-owner" })}\n`); return; }
    result = { released: true };
  }
  process.stdout.write(`${JSON.stringify({ id: request["id"], ok: true, result })}\n`);
  if (request["action"] === "release" && scenario === "late-stderr") { process.stderr.write("synthetic failure after release acknowledgement\n"); }
  if (request["action"] === "release-no-process" && scenario === "no-process-release-late-stderr") { process.stderr.write("synthetic no-process release failure\n"); }
});
function navigationEvent(): readonly unknown[] {
  return scenario === "identity-navigation" || scenario === "staged-navigation"
    ? [{ method: "Page.frameNavigated", sessionId: "session-1", params: { frame: { id: "frame-1" } } }] : [];
}
function sourcePayload(): string {
  if (scenario === "identity-large-source") { return "x".repeat(12 * 1024 * 1024); }
  if (scenario === "staged-large-source") { return "x".repeat(18 * 1024 * 1024); }
  return "const syntheticIdentity = true;\n";
}
function workerAttachment(): readonly unknown[] {
  if (!workerCase) { return []; }
  workerAttached = true;
  return [{ method: "Target.attachedToTarget", sessionId: "session-1",
    params: { sessionId: "worker-session-1", targetInfo: worker, waitingForDebugger: false } }];
}
function frameTree(frame: Record<string, unknown>): unknown {
  if (openingCase) {
    return { frame: { ...frame, url: uiBase, urlFragment: target.url.slice(uiBase.length), securityOrigin: "https://client" },
      ...(opened && scenario === "opening-child-frame" ? { childFrames: [{ frame: { ...frame, id: "child", parentId: "frame-1" } }] } : {}) };
  }
  if (staged) { return { frame: { ...frame, id: "ui-root", loaderId: "root-loader" }, childFrames: [{ frame: { ...frame, parentId: "ui-root" } }] }; }
  return { frame };
}
function sourceScriptUrl(): string {
  if (openingCase) { return "https://client/pro-ui/test-version/js/ui.js"; }
  return staged ? "file:///synthetic/pro-pcb/test-version/js/pcb.js" : "file:///synthetic/pcb.js";
}
function modelResponse(request: object & Record<"modelPhase", unknown>, events: unknown[]): unknown {
  const phase = request.modelPhase;
  if (phase === "wrapper" || phase === "handler") {
    return { result: { type: "function", className: phase === "wrapper" ? "Function" : "AsyncFunction",
      description: "synthetic private function", objectId: phase === "wrapper" ? "wrapper" : "handler" } };
  }
  if (phase === "release") { return scenario === "staged-model-release-refused" ? { extra: true } : {}; }
  assert.ok("objectId" in request);
  const id = request.objectId;
  if (phase === "properties") {
    if (scenario === "staged-model-context-lost") {
      events.push({ method: "Runtime.executionContextsCleared", sessionId: "session-1", params: {} });
    }
    if (id === "wrapper" || id === "handler") {
      return { result: [modelProperty("length", { type: "number", value: id === "wrapper" ? 3 : 1 }),
        modelProperty("name", { type: "string", value: "" })], internalProperties: [
        { name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype" } },
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
          scriptId: scenario === "staged-model-source-refused" ? "foreign-script" : "script-1",
          lineNumber: id === "wrapper" ? 30 : 91_968, columnNumber: id === "wrapper" ? 14_676 : 9858,
        } } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array",
          description: "Scopes[2]", objectId: `${id}-scopes` } },
      ] };
    }
    assert.ok(id === "wrapper-scopes" || id === "handler-scopes");
    return { result: [modelProperty("0", { type: "object", subtype: "internal#scope", className: "Object",
      description: id === "wrapper-scopes" ? "Closure (rpcService)" : "Closure", objectId: `${id}-zero` }),
    modelProperty("1", { type: "object", subtype: "internal#scope", className: "Object", description: "Global", objectId: "global-scope" })] };
  }
  assert.equal(phase, "snapshot"); assert.equal(id, "handler-scopes-zero");
  assert.ok("callbackObjectId" in request); assert.equal(request.callbackObjectId, "wrapper");
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-model-state.v1",
    main: { uuid: "a".repeat(32), uniqueId: "b".repeat(32), headType: "PCB", isProject: true, isInit: true, canSave: true,
      isInitIng: false, pendCacheLength: 0, pendingDocumentKeyCount: 0, cacheKeyCount: 0, deleteCacheCount: 0,
      subscriptionCount: 0, pendTimer: "absent", pendPromise: "absent", maxTicket: 0, pendingChange: false, localChange: false },
    loadedFootprintCount: 0, customFootprints: [],
    dynamicCopper: { openPcb: true, workerNameMarker: "absent", workerName: null, timer: "absent", bus: "present" },
  }) } };
}
function modelProperty(name: string, value: unknown): unknown {
  return { name, value, writable: true, configurable: true, enumerable: true, isOwn: true };
}
function openingResponse(request: object, events: unknown[]): unknown {
  assert.ok("uniqueContextId" in request && "openingPhase" in request && "targetProjectUuid" in request &&
    "targetBranchUuid" in request && "targetDocumentUuid" in request && "targetRawWindowsPath" in request &&
    "targetExpectedSourceSha256" in request);
  assert.equal(request.uniqueContextId, "unique-context-1");
  assert.equal(Object.hasOwn(request, "expression"), false); assert.equal(Object.hasOwn(request, "functionDeclaration"), false);
  const phase = request.openingPhase;
  assert.ok(phase === "preflight" || phase === "open-project");
  const dispatchAttempted = phase === "open-project";
  const ok = scenario !== (dispatchAttempted ? "opening-open-refused" : "opening-preflight-refused");
  if (dispatchAttempted && ok) {
    opened = true; target.url = `${uiBase}#id=${String(request.targetProjectUuid)}`;
    if (scenario !== "opening-no-event") {
      events.push({ method: scenario === "opening-context-lost" ? "Runtime.executionContextsCleared" : "Page.navigatedWithinDocument",
        sessionId: "session-1", params: scenario === "opening-context-lost" ? {} :
          { frameId: "frame-1", url: target.url, navigationType: "fragment" } });
    }
    if (scenario === "opening-title-changed") { target.title = "changed"; }
  }
  const status = dispatchAttempted ? "opened-prefix-observed" : "ready";
  return { result: { type: "string", value: scenario === "opening-malformed-reply" && dispatchAttempted ? "{}" : JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase, projectUuid: request.targetProjectUuid,
    branchUuid: request.targetBranchUuid, documentUuid: request.targetDocumentUuid, ok,
    status: ok ? status : "refused",
    failure: ok ? null : { stage: dispatchAttempted ? "acknowledgement" : "registration-before", code: dispatchAttempted ? "ACK" : "REGISTRY" },
    dispatchAttempted, publicResult: dispatchAttempted ? ok : null, prefixObserved: dispatchAttempted && ok,
    nativeWorkMayRemain: dispatchAttempted,
    observation: ok ? { projectPresent: dispatchAttempted, branchUuid: dispatchAttempted ? request.targetBranchUuid : null,
      windowTabId: "original-window", containerCount: 1, tabIds: [], activeTabId: "tab_page1" } : null,
  }) } };
}
function workerEvent(method: string, params: unknown): unknown { return { method, params, sessionId: "worker-session-1" }; }
function workerResponse(request: object & Record<"method", unknown>, events: unknown[]): unknown {
  if (request["method"] === "Runtime.enable") {
    events.push(workerEvent("Runtime.executionContextCreated", { context: {
      id: 8, uniqueId: "worker-context-1", origin: worker.url, name: worker.title,
    } }));
    return {};
  }
  if (request["method"] === "Debugger.enable") {
    events.push(workerEvent("Debugger.scriptParsed", { scriptId: "worker-script-1", url: "file:///synthetic/test/js/project-worker.js",
      executionContextId: 8, hasSourceURL: false, scriptLanguage: "JavaScript" }));
    return { debuggerId: "worker-debugger-1" };
  }
  if (request["method"] === "Debugger.getScriptSource") {
    assert.ok("scriptId" in request); assert.equal(request["scriptId"], "worker-script-1");
    return { scriptSource: scenario === "staged-worker-source-drift" ? "changed" : sourcePayload() };
  }
  if (request["method"] === "Runtime.evaluate") {
    assert.ok("uniqueContextId" in request); assert.equal(request["uniqueContextId"], "worker-context-1");
    assert.equal(Object.hasOwn(request, "expression"), false);
    if (scenario === "staged-worker-context-lost") {
      events.push(workerEvent("Runtime.executionContextDestroyed", { executionContextId: 8, executionContextUniqueId: "worker-context-1" }));
    }
    return scenario === "staged-worker-effect-refused" ? { result: { type: "undefined" }, exceptionDetails: {} } : workerStateReply();
  }
  throw new Error("unexpected synthetic worker method");
}
function sizes(names: readonly string[]): Record<string, number> { return Object.fromEntries(names.map(name => [name, 0])); }
function watchers(): Record<string, number> { return sizes(["footprint", "symbol", "device", "board", "sch", "sheet", "pcb", "panel", "simulation"]); }
function workerStateReply(): unknown {
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-worker-state.v1",
    identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window_1" },
    flags: { isReady: true, isTemporary: false, isHistoryBack: false, _isV2Format: false, isOpening: false, isEstablished: true,
      isApplyShot: false, isUploadingCloud: false, pendingSyncCloud: false, isBatchUpload: false, debugOpen: false },
    optionalFlags: { isSyncing: "absent", notSyncCloud: "absent" },
    setSizes: sizes(["task1", "task2", "task3", "cachePromise", "publishTask", "rollbackPromise", "syncPendingNodeUuids",
      "confirmedEmptyNodeUuids", "warnedEmptyNodeUuids"]),
    mapSizes: sizes(["bufferUploadData", "bufferUploadCache", "selectWatch", "historyErrorNodes"]),
    watcherMapSizes: { watcherAddSet: watchers(), watcherDeleteSet: watchers(), watcherUpdateSet: watchers() },
    timers: { projectTimer: "null", publishTimer: "null", orderTimer: "null" },
    dictionaryOwnKeyCounts: { uniqueIds: 0, orderCache: 0 },
  }) } };
}
// The fixture has no native handles. EOF naturally releases only this test peer.
