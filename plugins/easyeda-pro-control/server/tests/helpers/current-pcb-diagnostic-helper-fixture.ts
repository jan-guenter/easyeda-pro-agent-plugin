/** Synthetic native-helper protocol peer. No Windows/EasyEDA launch or handles. */
import assert from "node:assert/strict";
import process from "node:process";
import { createInterface } from "node:readline";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION, CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION } from "../../src/current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION } from "../../src/current-pcb-string-empty-producers.ts";
import { pendingModelReply, rawStringsModelReply, rootInventoryModelReply } from "./current-pcb-diagnostic-model-replies.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./current-pcb-string-observation-fixture.ts";

const scenario = process.argv[2];
const owner = { helperInstance: "b".repeat(32), jobId: "a".repeat(32), rootPid: 123, rootCreated: "133712345678901234" };
const staged = scenario?.startsWith("staged") === true;
const openingCase = scenario?.startsWith("opening") === true;
const pcbCase = scenario?.startsWith("opening-pcb") === true;
const stringCase = scenario?.startsWith("opening-pcb-string") === true;
const ancillaryCase = scenario?.includes("ancillary") === true;
const modelCase = scenario?.startsWith("staged-model") === true || pcbCase;
const workerCase = scenario?.startsWith("staged-worker") === true || stringCase;
const identityCase = staged || openingCase || scenario === "identity" || scenario === "identity-navigation" || scenario === "identity-large-source";
const noProcessCase = scenario?.startsWith("no-process-") === true;
const creationState = scenario === "no-process-create-refused" || scenario?.startsWith("no-process-win32") === true ? "returned-false" : "not-entered";
const uiBase = "https://client/editor?cll=warn";
const initialTitle = "Synthetic Pro - V3.2.206";
const target = { targetId: "target-1", type: "page", title: openingCase ? initialTitle : "synthetic",
  url: openingCase ? `${uiBase}#` : "file:///synthetic/ui.html" };
const worker = { targetId: "worker-1", type: "worker", title: `project_${"a".repeat(64)}_window_1`,
  url: "file:///synthetic/editor?entry=mgr-project-worker.js", attached: true };
let attached = false;
let workerAttached = false;
let opened = false;
let pcbOpened = false, pcbSourceRead = false;
let pcbDocumentUuid = "", pcbTabId = "";
let branchUuid = "b".repeat(32), projectUuid = "a".repeat(64), stringReads = 0;
let launchAttempted = false;
let frameReads = 0, targetReads = 0;
let ancillaryReads = 0;
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
    if (scenario === "native-send-private-error") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "private native exception C:\\private\\synthetic" })}\n`); return;
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
        if ("stringPhase" in request) {
          assert.equal(stringCase, true); payload = stringResponse(request);
        } else if ("modelPhase" in request) {
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
          assert.equal(request["scriptId"], pcbOpened ? "pcb-script-1" : "script-1");
          pcbSourceRead = pcbOpened;
          payload = { scriptSource: pcbOpened && scenario === "opening-pcb-source-drift" ? "changed source" : sourcePayload() };
          events.push(...navigationEvent());
        } else if (request["method"] === "DOM.getFrameOwner") {
          payload = frameOwnerResponse(request);
        } else if (request["method"] === "DOM.describeNode") {
          payload = describeOwnerResponse(request);
        } else if (request["method"] === "Runtime.callFunctionOn") {
          assert.equal(openingCase, true);
          payload = "pcbOpeningPhase" in request ? pcbOpeningResponse(request, events) : openingResponse(request, events);
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
    const size = scenario === "identity-large-source" || scenario === "staged-large-source" || stringCase ? 65_536 : 17;
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
    const children: { frame: Record<string, unknown> }[] = [];
    if (ancillaryCase) {
      children.push({ frame: { id: "ancillary-frame", parentId: "frame-1", loaderId: "ancillary-loader", url: "about:blank", securityOrigin: "://" } });
    }
    if (pcbOpened) { children.push({ frame: pcbFrame() }); }
    else if (opened && scenario === "opening-child-frame") { children.push({ frame: { ...frame, id: "child", parentId: "frame-1" } }); }
    return { frame: { ...frame, url: uiBase, urlFragment: target.url.slice(uiBase.length), securityOrigin: "https://client" },
      ...(children.length === 0 ? {} : { childFrames: children }) };
  }
  if (staged) { return { frame: { ...frame, id: "ui-root", loaderId: "root-loader" }, childFrames: [{ frame: { ...frame, parentId: "ui-root" } }] }; }
  return { frame };
}
function ancillaryNode(): unknown {
  assert.equal(ancillaryCase, true);
  const refusalAt = Number(scenario?.split("ancillary-drift-")[1]);
  const drift = ancillaryReads === refusalAt || scenario === "opening-ancillary-refused";
  return { backendNodeId: 4321, nodeType: 1, nodeName: "OBJECT", localName: "object", frameId: "ancillary-frame",
    attributes: ["style", `display: block; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: none; padding: 0px; margin: 0px; opacity: ${drift ? "1" : "0"}; z-index: -1000; pointer-events: none;`,
      "tabindex", "-1", "type", "text/html", "aria-hidden", "true", "data", "about:blank"] };
}
function frameOwnerResponse(request: object): unknown {
  assert.ok("frameId" in request);
  if (request.frameId === "ancillary-frame") {
    assert.equal(ancillaryCase, true); ancillaryReads += 1; return { backendNodeId: 4321 };
  }
  assert.equal(pcbOpened, true); assert.equal(request.frameId, "pcb-frame");
  return { backendNodeId: 1234 };
}
function describeOwnerResponse(request: object): unknown {
  assert.ok("backendNodeId" in request);
  if (request.backendNodeId === 4321) { return { node: ancillaryNode() }; }
  assert.equal(pcbOpened, true); assert.equal(request.backendNodeId, 1234);
  return { node: { backendNodeId: 1234, nodeType: 1, nodeName: "IFRAME", localName: "iframe", frameId: "pcb-frame",
    attributes: ["id", `frame_${pcbTabId}`, "c_dbid", scenario === "opening-pcb-dom-drift" ? "foreign" : pcbTabId,
      "c_doctype", "3", "src", "editor?entry=pcb", "pcb-canvas", "true", "class", "editframe"] } };
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
      let scriptId = pcbCase ? "pcb-script-1" : "script-1";
      if (scenario === "staged-model-source-refused") { scriptId = "foreign-script"; }
      return { result: [modelProperty("length", { type: "number", value: id === "wrapper" ? 3 : 1 }),
        modelProperty("name", { type: "string", value: "" })], internalProperties: [
        { name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype" } },
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
          scriptId,
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
  assert.equal(id, "handler-scopes-zero");
  assert.ok("callbackObjectId" in request); assert.equal(request.callbackObjectId, "wrapper");
  const documentUuid = pcbCase && scenario !== "opening-pcb-model-document-drift" ? pcbDocumentUuid : "a".repeat(32);
  if (phase === "pending") {
    if (scenario === "opening-pcb-string-pending-refused") {
      return { result: { type: "string", value: JSON.stringify({
        schema: "easyeda-pro-control.pcb-diagnostic-pending-failure.v1", stage: "teardrops", reason: "own",
      }) } };
    }
    return pendingModelReply(scenario === "staged-model-document-drift" ? "f".repeat(32) : documentUuid);
  }
  if (phase === "raw-strings") { return rawStringsModelReply(documentUuid); }
  if (phase === "root-inventory") { return rootInventoryModelReply(documentUuid); }
  assert.equal(phase, "snapshot");
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-model-state.v1",
    main: { uuid: documentUuid, uniqueId: stringCase && scenario !== "opening-pcb-string-token-drift" ? "c".repeat(16) : "b".repeat(32),
      headType: "PCB", isProject: true, isInit: true, canSave: true,
      isInitIng: false, pendCacheLength: 0, pendingDocumentKeyCount: 0, cacheKeyCount: 0, deleteCacheCount: 0,
      subscriptionCount: 0, pendTimer: "absent", pendPromise: "absent", maxTicket: 0, pendingChange: false, localChange: false },
    loadedFootprintCount: 0, customFootprints: [],
    dynamicCopper: { openPcb: true, workerNameMarker: "absent", workerName: null, timer: "absent", bus: "present" },
  }) } };
}
function pcbFrame(): Record<string, unknown> {
  return { id: "pcb-frame", parentId: "frame-1", loaderId: "pcb-loader",
    url: "https://client/editor?entry=pcb", securityOrigin: "https://client" };
}
function pcbOpeningResponse(request: object & Record<"pcbOpeningPhase", unknown>, events: unknown[]): unknown {
  assert.equal(pcbCase, true);
  assert.ok("uniqueContextId" in request && "targetProjectUuid" in request && "targetBranchUuid" in request && "targetDocumentUuid" in request);
  assert.equal(request.uniqueContextId, "unique-context-1");
  const phase = request.pcbOpeningPhase;
  const dispatchAttempted = phase === "open-document";
  assert.ok(phase === "preflight" || phase === "open-document" || phase === "observe");
  const ok = scenario !== `opening-pcb-${phase}-refused`;
  const tabId = `${String(request.targetDocumentUuid)}@${String(request.targetProjectUuid)}`;
  if (dispatchAttempted && ok) {
    pcbOpened = true; pcbTabId = tabId; pcbDocumentUuid = String(request.targetDocumentUuid);
    target.url = `${uiBase}#id=${String(request.targetProjectUuid)},tab=*${tabId}`;
    events.push(
      { method: "Page.navigatedWithinDocument", sessionId: "session-1", params: { frameId: "frame-1", url: target.url, navigationType: "fragment" } },
      { method: "Page.frameAttached", sessionId: "session-1", params: { frameId: "pcb-frame", parentFrameId: "frame-1" } },
      { method: "Page.frameNavigated", sessionId: "session-1", params: { frame: pcbFrame(), type: "Navigation" } },
      { method: "Runtime.executionContextCreated", sessionId: "session-1", params: { context: { id: 9, uniqueId: "pcb-context",
        origin: "https://client", name: "", auxData: { frameId: "pcb-frame", isDefault: true, type: "default" } } } },
      { method: "Debugger.scriptParsed", sessionId: "session-1", params: { scriptId: "pcb-script-1",
        url: "https://client/pro-pcb/test-version/js/pcb.js", executionContextId: 9, hasSourceURL: false, scriptLanguage: "JavaScript" } },
    );
  }
  if (phase === "observe") { assert.equal(pcbSourceRead, true, "Child RPC observation must follow child source admission."); }
  let status = "ready";
  if (!ok) { status = "refused"; } else if (dispatchAttempted) { status = "opened"; } else if (phase === "observe") { status = "frame-observed"; }
  return { result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-pcb-opening.v1", phase,
    projectUuid: request.targetProjectUuid, branchUuid: request.targetBranchUuid, documentUuid: request.targetDocumentUuid, tabId,
    ok, status, failure: ok ? null : { stage: "registration-before", code: "REGISTRY" }, dispatchAttempted,
    publicResult: dispatchAttempted && ok ? tabId : null, nativeWorkMayRemain: dispatchAttempted,
    frameObserved: phase === "observe" && ok, windowTabId: "original-window",
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
  assert.equal(typeof request.targetRawWindowsPath, "string");
  // The UUID-only API leaves the original empty client name and base title.
  const expectedOpenedTitle = initialTitle;
  if (dispatchAttempted && ok) {
    opened = true; target.url = `${uiBase}#id=${String(request.targetProjectUuid)}`; target.title = expectedOpenedTitle;
    projectUuid = String(request.targetProjectUuid); branchUuid = String(request.targetBranchUuid);
    if (stringCase) { worker.title = `project_${projectUuid}_original-window`; }
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
      windowTabId: "original-window", containerCount: 1, tabIds: [], activeTabId: "tab_page1",
      initialTitle, expectedOpenedTitle, documentTitle: dispatchAttempted ? expectedOpenedTitle : initialTitle } : null,
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
    if ("stringPhase" in request) { return stringResponse(request); }
    if (scenario === "staged-worker-context-lost") {
      events.push(workerEvent("Runtime.executionContextDestroyed", { executionContextId: 8, executionContextUniqueId: "worker-context-1" }));
    }
    return scenario === "staged-worker-effect-refused" ? { result: { type: "undefined" }, exceptionDetails: {} } : workerStateReply();
  }
  throw new Error("unexpected synthetic worker method");
}
function stringResponse(request: object & Record<"stringPhase", unknown>): unknown {
  assert.equal(stringCase, true); stringReads += 1;
  const workerRole = request.stringPhase === "worker-association";
  const windowId = scenario === "opening-pcb-string-window-drift" ? "foreign-window" : "original-window";
  const change = `const selectedProject=${JSON.stringify(projectUuid)}, selectedWindow=${JSON.stringify(windowId)};
  const selectedChannel="/"+selectedWindow+"/project/"+selectedProject;
  const env=scope.object.x.env, base=env._compiler.base;
  env._id=${JSON.stringify(pcbDocumentUuid)};env._tabId=env._id+"@"+selectedProject;
  base.uuid=env._id;env._compiler.uuid=env._id;base.path=selectedProject;base.windowId=selectedWindow;
  base.consistencyManager.client=selectedWindow;base.dataBus=new J(selectedChannel);
  PROJECT.uuid=selectedProject;PROJECT._branchUuid=${JSON.stringify(branchUuid)};globalThis._TAB_ID_=selectedWindow;
  PROJECT.workerBus=new JP(selectedChannel);globalThis[selectedChannel]=${workerRole ? "PROJECT.workerBus" : "base.dataBus"};
  ${scenario === "opening-pcb-string-sample-drift" && stringReads > 3 ? 'base.dataBus.uuid="33333333-3333-4333-8333-333333333333";' : ""}`;
  const context = pcbStringObservationFixture(workerRole, change);
  if (workerRole) { return pcbStringReply(runInContext(CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION, context) as unknown); }
  assert.ok("objectId" in request && "callbackObjectId" in request);
  assert.equal(request.objectId, "handler-scopes-zero"); assert.equal(request.callbackObjectId, "wrapper");
  assert.ok(request.stringPhase === "renderer-association" || request.stringPhase === "empty-producers");
  return pcbStringReply(callPcbStringObservation(context, request.stringPhase === "renderer-association" ?
    CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION : CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION));
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
