/** Actual ledger and pipe with synthetic CDP streams. No native owner, source
 * execution, cache request or actor-resume request is made by these peers. */
import assert from "node:assert/strict";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { CurrentPcbViaSavedEarlyActors } from "../src/current-pcb-via-saved-early-actors.ts";
import { CurrentPcbViaSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { currentPcbViaSavedEarlyActorNativeFrame, currentPcbViaSavedEarlyActorWire } from "../src/current-pcb-via-saved-cache-wire.ts";

const projectUuid = "a".repeat(64);
function target(id = "background", type = "worker"): Record<string, unknown> { return { targetId: id, type, url: "", title: "", attached: true }; }
function attachment(waitingForDebugger: boolean, targetInfo = target(), page = false): DiagnosticEvent {
  return { method: "Target.attachedToTarget", params: { sessionId: page ? "held-page-session" : "held-browser-session", targetInfo, waitingForDebugger }, ...(page ? { sessionId: "page" } : {}) };
}
void test("first-script browser holds preserve blank worker metadata and page references without actor execution", () => {
  for (const type of ["worker", "shared_worker", "service_worker"]) {
    const ledger = new CurrentPcbViaSavedEarlyActors(projectUuid), row = target("background", type); ledger.before({ targetInfos: [] }); ledger.beginArm();
    assert.equal(ledger.attachment(attachment(true, row)), "held"); ledger.acknowledgeArm(); ledger.after({ targetInfos: [row] });
    ledger.parent("page"); assert.equal(ledger.attachment(attachment(false, row, true)), "held"); ledger.inventory({ targetInfos: [row] });
    assert.deepEqual(ledger.status(), { sealed: true, failed: false, backgroundHeld: 1, projectSeen: false, actorExecutionAuthorized: false, cacheMutationAuthorized: false });
  }
});
void test("preexisting or already-running workers, foreign/duplicate references and missing roster members refuse", () => {
  const before = new CurrentPcbViaSavedEarlyActors(projectUuid); assert.throws(() => { before.before({ targetInfos: [target()] }); });
  const running = new CurrentPcbViaSavedEarlyActors(projectUuid); running.before({ targetInfos: [] }); running.beginArm(); assert.throws(() => running.attachment(attachment(false)));
  for (const wrong of ["duplicate", "missing", "changed", "unheld-page"] as const) {
    const ledger = new CurrentPcbViaSavedEarlyActors(projectUuid); ledger.before({ targetInfos: [] }); ledger.beginArm(); ledger.acknowledgeArm();
    if (wrong === "unheld-page") { ledger.after({ targetInfos: [] }); ledger.parent("page"); assert.throws(() => ledger.attachment(attachment(false, target(), true))); }
    else {
      ledger.attachment(attachment(true)); ledger.after({ targetInfos: [target()] });
      if (wrong === "duplicate") { assert.throws(() => ledger.attachment(attachment(true))); }
      else { assert.throws(() => { ledger.inventory({ targetInfos: wrong === "missing" ? [] : [{ ...target(), url: "foreign" }] }); }); }
    }
    assert.equal(ledger.status().failed, true);
  }
});
void test("the actual pipe accepts its original early worker event before page attachment and consumes the three fixed messages once", async () => {
  const commands: Record<string, unknown>[] = [], input = new PassThrough(), ledger = new CurrentPcbViaSavedEarlyActors(projectUuid);
  const reply = (value: unknown): void => { input.write(Buffer.from(`${JSON.stringify(value)}\0`)); };
  const output = new Writable({
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise Writable's original callback boundary rather than an async wrapper.
    write(chunk: unknown, _encoding, callback): void {
    try {
      assert.ok(Buffer.isBuffer(chunk)); const value: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8"));
      assert.ok(value !== null && typeof value === "object" && "id" in value && "savedReadbackEarlyActors" in value);
      const command = Object.fromEntries(Object.entries(value)); commands.push(command);
      if (value.savedReadbackEarlyActors === "arm") { reply(attachment(true)); }
      reply({ id: value.id, result: value.savedReadbackEarlyActors === "arm" ? {} : { targetInfos: value.savedReadbackEarlyActors === "before" ? [] : [target()] } });
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Terminal actual Writable completion.
      callback(); return;
    } catch (caughtError) {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Terminal actual Writable failure completion.
      callback(caughtError instanceof Error ? caughtError : new Error("synthetic write")); return;
    }
  } });
  const pipe = new CurrentPcbViaSavedReadbackPipe(input, output); pipe.start(); pipe.retainSavedReadbackEarlyActors(event => ledger.attachment(event));
  ledger.before(await pipe.observeSavedReadbackEarlyActors("before")); ledger.beginArm(); await pipe.observeSavedReadbackEarlyActors("arm"); ledger.acknowledgeArm(); ledger.after(await pipe.observeSavedReadbackEarlyActors("after"));
  assert.equal(ledger.status().sealed, true); assert.equal(commands.length, 3);
  await assert.rejects(pipe.observeSavedReadbackEarlyActors("after"));
  assert.deepEqual(commands.map(row => row["method"]), ["Target.getTargets", "Target.setAutoAttach", "Target.getTargets"]);
  for (const stage of ["before", "arm", "after"] as const) {
    const id = ["before", "arm", "after"].indexOf(stage) + 1, wire = currentPcbViaSavedEarlyActorWire(id, stage);
    const bytes = Buffer.from(`${JSON.stringify(wire)}\0`);
    assert.deepEqual(currentPcbViaSavedEarlyActorNativeFrame(bytes, stage), { action: "saved-readback-early-actors", requestId: id, earlyStage: stage });
    const foreign = Buffer.from(`${JSON.stringify({ ...wire, sessionId: "foreign" })}\0`);
    assert.throws(() => currentPcbViaSavedEarlyActorNativeFrame(foreign, stage));
  }
});
