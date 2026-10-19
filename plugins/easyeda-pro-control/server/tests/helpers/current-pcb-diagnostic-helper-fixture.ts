/** Synthetic native-helper protocol peer. No Windows/EasyEDA launch or handles. */
import assert from "node:assert/strict";
import process from "node:process";
import { createInterface } from "node:readline";

const scenario = process.argv[2];
const owner = { helperInstance: "b".repeat(32), jobId: "a".repeat(32), rootPid: 123, rootCreated: "133712345678901234" };
let sent = Buffer.alloc(0), terminated = false;
const lines = createInterface({ input: process.stdin });
lines.on("line", line => {
  const request: unknown = JSON.parse(line);
  assert.ok(request !== null && typeof request === "object");
  assert.ok("action" in request && "id" in request);
  let result: unknown = {};
  if (request["action"] === "launch") {
    if (scenario === "launch-failed") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-post-create-failure" })}\n`); return;
    }
    result = owner;
  } else if (request["action"] === "identity") { result = owner; }
  else if (request["action"] === "send") {
    if (scenario === "hang") { return; }
    if (scenario === "stderr") { process.stderr.write("synthetic private diagnostic\n"); return; }
    if (scenario === "duplicate") { process.stdout.write(`{"id":"${String(request["id"])}","ok":true,"result":{},"result":{"written":true}}\n`); return; }
    if (scenario === "native-send-failed") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-partial-write" })}\n`); return;
    }
    assert.ok("method" in request && "requestId" in request);
    const payload = request["method"] === "Browser.getVersion" ? { product: "synthetic", protocolVersion: "1.3" } : { targetInfos: [] };
    sent = Buffer.from(`${JSON.stringify({ id: scenario === "malformed-cdp" ? 99 : request["requestId"], result: payload })}\0`);
    result = { written: true };
  } else if (request["action"] === "poll") {
    if (scenario === "malformed-chunk") {
      process.stdout.write(`${JSON.stringify({ id: request["id"], ok: true, result: { bytes: "%%%" } })}\n`); return;
    }
    result = { bytes: sent.subarray(0, 17).toString("base64") }; sent = sent.subarray(17);
  } else if (request["action"] === "window") { result = { hwnd: "456" }; }
  else if (request["action"] === "normal-close") { terminated = true; result = { closeDispatched: true, saveOrDiscardSelected: false }; }
  else if (request["action"] === "termination") { result = { terminated }; }
  else if (request["action"] === "release") {
    if (!terminated) { process.stdout.write(`${JSON.stringify({ id: request["id"], ok: false, error: "pcb-diagnostic-retain-live-owner" })}\n`); return; }
    result = { released: true };
  }
  process.stdout.write(`${JSON.stringify({ id: request["id"], ok: true, result })}\n`);
  if (request["action"] === "release" && scenario === "late-stderr") { process.stderr.write("synthetic failure after release acknowledgement\n"); }
});
// The fixture has no native handles. EOF naturally releases only this test peer.
