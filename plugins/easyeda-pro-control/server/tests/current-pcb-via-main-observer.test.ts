/** Real initial observer with explicit original native/source/body seams.
 * No original main cursor, SDK Save or mutation grant is manufactured. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaMainRequestObserver } from "../src/current-pcb-via-main-request-observer.ts";
import { currentPcbViaMainNativeCases, currentPcbViaMainWire, validateCurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";
import type { CurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";

void test("Via main codebook keeps fixed request selectors separate and cannot encode a resume or second driver arm", () => {
  const commands = currentPcbViaMainNativeCases(); assert.ok(commands.length > 10);
  for (const command of commands) { const wire = currentPcbViaMainWire(command, 7); assert.equal(wire.request["action"], "pcb-via-main-observe"); assert.ok(String(wire.request["phase"]).startsWith("via-main-"));
    for (const field of ["functionDeclaration", "expression", "arguments", "sessionId", "condition", "lineNumber", "columnNumber"]) { assert.equal(Object.hasOwn(wire.request, field), false); }
    assert.throws(() => currentPcbViaMainWire({ ...command, owner: "caller" }, 7)); assert.throws(() => validateCurrentPcbViaMainCommand({ ...command, phase: command.phase.slice(9) }));
  }
  assert.throws(() => validateCurrentPcbViaMainCommand({ phase: "via-main-request-resume", method: "Debugger.resume", params: {} }), /NO_RESUME/u);
  assert.throws(() => validateCurrentPcbViaMainCommand({ phase: "via-main-request-driver-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "foreign" } }), /DRIVER_ARM/u);
});
void test("actual observer setup and driver capture retain exact source frames without attributing the unread body or resuming it", async () => {
  const origin = Object.freeze({ explicitOriginSeam: true }); const plan = Object.freeze({ explicitPlanSeam: true });
  const source = Object.freeze({ explicitSourceSeam: true }); const projection = Object.freeze({ schema: "private.current-pcb-via-save-projection.v2" as const, bodySha256: "d".repeat(64), primitiveId: "3".repeat(16), exactOriginalUniqueIdDeltaVerified: true as const, originalClockBodyJoinVerified: true as const, selectedSqlAuthorized: false as const, persistenceVerified: false as const });
  const owner = Object.freeze({ bindViaMainOriginalBody: (p: unknown, o: unknown): unknown => { assert.equal(p, plan); assert.equal(o, origin); return { bodySha256: projection.bodySha256, primitiveId: projection.primitiveId }; } });
  const commands: CurrentPcbViaMainCommand[] = []; let delivered = false, failed = false, saveAttempted = false;
  const event = { method: "Debugger.paused", params: { reason: "other", hitBreakpoints: ["sql-driver"], callFrames: [
    { callFrameId: "driver", functionName: "", location: { scriptId: "app", lineNumber: 1164, columnNumber: 2453 }, functionLocation: { scriptId: "app", lineNumber: 1164, columnNumber: 2434 } },
    { callFrameId: "caller", functionName: "interceptHttpProtocol", location: { scriptId: "app", lineNumber: 1164, columnNumber: 51_414 }, functionLocation: { scriptId: "app", lineNumber: 1164, columnNumber: 51_072 } },
  ] } };
  const bindings = { scriptId: "app", constructionObjectId: "original-construction", persistentDriverBreakpointId: "sql-driver", source,
    assertCurrent: (): Promise<void> => { assert.equal(failed, false); if (delivered) { event.params.hitBreakpoints[0] = "foreign-after-capture"; } return Promise.resolve(); },
    assertSaveAttempt: (): void => { assert.equal(saveAttempted, true); }, fail: (): void => { failed = true; },
    nextEvent: (): Promise<unknown> => { delivered = true; return Promise.resolve(event); },
    request: (input: CurrentPcbViaMainCommand, cleanup: boolean): Promise<unknown> => {
      const command = validateCurrentPcbViaMainCommand(input); commands.push(command); assert.equal(cleanup, false);
      if (command.method === "Debugger.setBreakpoint") { return Promise.resolve({ breakpointId: `original-source-point-${String(commands.length)}`, actualLocation: command.params["location"] }); }
      const count = command.phase === "via-main-request-invocation" ? 6 : 3;
      return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", objectId: command.phase, description: `Array(${String(count)})` } });
    } };
  const url = new URL("../src/current-pcb-via-main-request-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-owner.ts") { return { requireOriginalCurrentPcbViaMainOrigin: (o: unknown, actual: unknown, p: unknown): unknown => { assert.equal(o, origin); assert.equal(actual, owner); assert.equal(p, plan); return bindings; } }; }
    if (name === "./current-footprint-copy-main-request-source.ts") { return { requireCurrentFootprintCopyMainRequestSource: (s: unknown): void => { assert.equal(s, source); } }; }
    if (name === "./current-pcb-via-save-projection.ts") { return { requireOriginalCurrentPcbViaSaveProjection: (p: unknown, o: unknown, actual: unknown): void => { assert.equal(p, projection); assert.equal(o, owner); assert.equal(actual, plan); } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaMainRequestObserver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit native/source/body seams above replace issuance; the real observer state and protocol run unchanged.
  const observer = Reflect.construct(Constructor, [origin, owner, plan]) as CurrentPcbViaMainRequestObserver;
  await observer.arm(); assert.equal(commands.length, 3); saveAttempted = true;
  const body = projection;
  await observer.bindOriginalBody(body); await assert.rejects(observer.bindOriginalBody(body), /BODY_BIND_CONSUMED/u);
  const packet = await observer.captureDriver(body); assert.equal(commands.length, 6); assert.equal(packet.actualRequestBodyJoined, false); assert.equal(packet.nativeMutationResumed, false);
  await observer.requireOriginal(packet); await assert.rejects(observer.requireOriginal({ ...packet }), /ORIGINAL_PACKET/u); await assert.rejects(observer.captureDriver(body), /DRIVER_CONSUMED/u);
  assert.equal(commands.some(command => command.method === "Debugger.resume"), false); assert.equal(failed, false);
});
