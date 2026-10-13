import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { assertConsumed, fixture, phase } from "./closed-symbol-coordinator-automatic-fixture.ts";
import { selectionCalls } from "./closed-symbol-coordinator-automatic-observer.ts";
import { originalClosedSymbolFullEvidenceKind } from "../../src/closed-symbol-coordinator.ts";
import { ClosedSymbolMainReferenceStage, assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import type { OriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { isRecord } from "../../src/core.ts";

function failReferenceTransport(context: TestContext, f: Awaited<ReturnType<typeof fixture>>): void {
  const original = childProcess.spawn;
  const interceptor = ((executable: string, args: string[], options: unknown): ChildProcess => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Delegate unchanged only to the fixed existing synthetic child interceptor.
    if (!args.includes("-Command")) { return Reflect.apply(original, childProcess, [executable, args, options]) as ChildProcess; }
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]); assert.equal(args.length, 5);
    assert.match(String(args[4]), /UNREVIEWED MAIN REFERENCE TRANSPORT/u);
    f.transport.calls += 1; f.events.push("main-reference"); assert.equal(f.state.scope, false);
    const child = new ChildProcess(), input = new PassThrough(), output = new PassThrough(), stderr = new PassThrough();
    Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: stderr } });
    context.mock.method(child, "kill", (): boolean => true); input.resume();
    input.on("finish", () => { queueMicrotask(() => { output.end("{}\n"); stderr.end("synthetic reference failure"); child.emit("close", 1, null); }); });
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The child owns streams only and does not launch a Windows process.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", interceptor); syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}
export function registerFailedReference(): void {
  void test("automatic aged reference failure retains raw output and never tries locked", async (context) => {
    const f = await fixture(context, "aged"); const calls = selectionCalls(); failReferenceTransport(context, f);
    await assert.rejects(f.stage.recordAutomaticFullEvidence(f.plan), /transport failed or is ambiguous/u);
    const operationId = await phase(f, 10), retained = f.stage.retained(); const raw = retained["mainReferenceRaw"];
    assert.equal(selectionCalls() - calls, 1); assert.equal(retained["headEligibility"], "aged-unlocked"); assert.equal(retained["mainReference"], undefined);
    assert.ok(isRecord(raw)); assert.equal(raw["exitCode"], 1); assert.equal(raw["stdout"], "{}\n"); assert.equal(raw["stderr"], "synthetic reference failure");
    assert.equal(f.transport.calls, 1); assert.equal(f.events.filter((value) => value === "launch").length, 1);
    assert.equal(f.state.opens, 0); assert.equal(f.state.writes, 0); assert.equal(f.state.reads, 0);
    assert.throws(() => originalClosedSymbolFullEvidenceKind(retained, f.engine, operationId), /original successful/u); await assertConsumed(f);
  });
}
export function registerRecent(): void {
  void test("automatic unlocked selection does not substitute for aged eligibility", async (context) => {
    const f = await fixture(context, "recent"); const calls = selectionCalls();
    await assert.rejects(f.stage.recordAutomaticFullEvidence(f.plan), /aged|61|old|eligible/u);
    const operationId = await phase(f, 20), retained = f.stage.retained(); assert.equal(selectionCalls() - calls, 1);
    const reference = assertOriginalMainReference(retained["mainReference"], f.engine, operationId);
    assert.equal(reference.request.createdAtLiteral, "2026-10-13 12:00:00");
    assert.equal(retained["headEligibility"], "aged-unlocked"); assert.equal(f.transport.calls, 1); assert.equal(f.transport.rendererCalls, 1);
    assert.equal(f.events.filter((value) => value === "launch").length, 2); assert.equal(f.state.opens, 1); assert.equal(f.state.writes, 0); assert.equal(f.state.reads, 0);
    await assertConsumed(f);
  });
}
export function registerReferenceDrift(drift: "caller" | "owner"): void {
  void test(`automatic reference token survives settled ${drift} drift without edit launch`, async (context) => {
    const f = await fixture(context, "aged");
    // oxlint-disable-next-line typescript/unbound-method -- Delegate with the same stage receiver and original arguments.
    const original = ClosedSymbolMainReferenceStage.prototype.runOnce;
    let received: OriginalMainReference | undefined;
    context.mock.method(ClosedSymbolMainReferenceStage.prototype, "runOnce", async function delegated(this: ClosedSymbolMainReferenceStage,
      input: Parameters<typeof original>[0]): ReturnType<typeof original> {
      const result = await original.call(this, input); received = result;
      if (drift === "caller") { f.plan["targetUuid"] = "e".repeat(32); }
      else { const method = f.upstream.bridgeSessionLifecycle.bind(f.upstream); context.mock.method(f.upstream, "bridgeSessionLifecycle", method); }
      return result;
    });
    await assert.rejects(f.stage.recordAutomaticFullEvidence(f.plan), /caller|owner/u); assert.ok(received !== undefined);
    assert.equal(f.stage.retained()["mainReference"], received); assert.equal(assertOriginalMainReference(received, f.engine, received.operationId), received);
    await phase(f, 10); assert.equal(f.transport.calls, 1); assert.equal(f.events.filter((value) => value === "launch").length, 1);
    assert.equal(f.state.opens, 0); assert.equal(f.state.writes, 0); assert.equal(f.transport.rendererCalls, 0); await assertConsumed(f);
  });
}
