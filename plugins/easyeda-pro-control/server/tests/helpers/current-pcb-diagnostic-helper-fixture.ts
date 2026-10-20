/** Synthetic native-helper protocol peer. No Windows/EasyEDA launch or handles. */
import assert from "node:assert/strict";
import process from "node:process";
import { createInterface } from "node:readline";

const scenario = process.argv[2];
const owner = { helperInstance: "b".repeat(32), jobId: "a".repeat(32), rootPid: 123, rootCreated: "133712345678901234" };
const staged = scenario?.startsWith("staged") === true;
const identityCase = staged || scenario === "identity" || scenario === "identity-navigation" || scenario === "identity-large-source";
const noProcessCase = scenario?.startsWith("no-process-") === true;
const creationState = scenario === "no-process-create-refused" ? "returned-false" : "not-entered";
const target = { targetId: "target-1", type: "page", title: "synthetic", url: "file:///synthetic/ui.html" };
let attached = false;
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
    if (identityCase) {
      if (request["method"] === "Browser.getVersion") { payload = { product: "synthetic", protocolVersion: "1.3", revision: "synthetic-revision", userAgent: "synthetic-agent", jsVersion: "synthetic-js" }; }
      else if (request["method"] === "Target.getTargets") {
        targetReads += 1;
        payload = { targetInfos: [{ ...target, attached, ...(scenario === "staged-target-changed" && targetReads > 1 ? { title: "changed" } : {}) }] };
      }
      else if (request["method"] === "Target.attachToTarget") {
        assert.ok("targetId" in request);
        assert.equal(request["targetId"], "target-1"); attached = true; payload = { sessionId: "session-1" };
        events.push({ method: "Target.attachedToTarget", params: { sessionId: "session-1", targetInfo: { ...target, attached }, waitingForDebugger: false } });
      } else {
        assert.ok("sessionId" in request);
        assert.equal(request["sessionId"], "session-1");
        if (request["method"] === "Page.enable") { payload = {}; }
        else if (request["method"] === "Page.getFrameTree") {
          frameReads += 1;
          const frame = { id: "frame-1", loaderId: scenario === "staged-frame-changed" && frameReads > 2 ? "loader-2" : "loader-1",
            url: "file:///synthetic/pcb.html", securityOrigin: "file://" };
          payload = { frameTree: staged ? { frame: { ...frame, id: "ui-root", loaderId: "root-loader" },
            childFrames: [{ frame: { ...frame, parentId: "ui-root" } }] } : { frame } };
        } else if (request["method"] === "Runtime.enable") {
          payload = {}; events.push({ method: "Runtime.executionContextCreated", sessionId: "session-1",
            params: { context: { id: 7, uniqueId: "unique-context-1", origin: "file://", name: "", auxData: { frameId: "frame-1", isDefault: true, type: "default" } } } },
          ...(staged ? [{ method: "Runtime.consoleAPICalled", sessionId: "session-1", params: { args: [{ value: "private-console-data" }] } }] : []));
        } else if (request["method"] === "Debugger.enable") {
          payload = { debuggerId: "debugger-1" }; events.push({ method: "Debugger.scriptParsed", sessionId: "session-1",
            params: { scriptId: "script-1", url: staged ? "file:///synthetic/pro-pcb/test-version/js/pcb.js" : "file:///synthetic/pcb.js",
              executionContextId: 7, hasSourceURL: false, scriptLanguage: "JavaScript" } });
        } else if (request["method"] === "Debugger.getScriptSource") {
          assert.ok("scriptId" in request);
          assert.equal(request["scriptId"], "script-1");
          payload = { scriptSource: sourcePayload() };
          events.push(...navigationEvent());
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
    result = { creationState: release && scenario === "no-process-release-changed" ? "returned-false" : creationState,
      processCreated: scenario === "no-process-proof-malformed" || release && scenario === "no-process-release-malformed",
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
// The fixture has no native handles. EOF naturally releases only this test peer.
