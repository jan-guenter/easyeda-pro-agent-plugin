/** The extracted original cursor runs against inert events and the real pause
 * decoder. No native owner, SQL request or application is created. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyMainRequestCollectionPause as decodePause } from "../src/current-footprint-copy-main-request-protocol.ts";

void test("BEGIN cursor proves original driver and caller frames before reading or resuming GET", async () => {
  const source = await readFile(new URL("../src/current-pcb-via-main-begin-observer.ts", import.meta.url), "utf8");
  const start = source.indexOf("  async #next("); const end = source.indexOf("  async #capture(", start);
  const schemaStart = source.indexOf("const eventFrame ="); const schemaEnd = source.indexOf("const resultSchema =", schemaStart);
  assert.ok(start > 0 && end > start && schemaStart > 0 && schemaEnd > schemaStart);
  const method = source.slice(start, end).replace("#next", "next").replaceAll("this.#", "this.");
  const program = stripTypeScriptTypes(`${source.slice(schemaStart, schemaEnd)};({${method}}).next`);
  for (const change of ["none", "script", "site", "caller", "caller-function"]) {
    const point = { scriptId: "original-script", lineNumber: 1164, columnNumber: 2453 };
    const first = { callFrameId: "driver-frame", functionName: "", location: { ...point }, functionLocation: { ...point, columnNumber: 2434 } };
    const caller = { callFrameId: "caller-frame", functionName: "interceptHttpProtocol", location: { ...point, columnNumber: 51_414 }, functionLocation: { ...point, columnNumber: 51_072 } };
    if (change === "script") { first.location.scriptId = "foreign-script"; }
    if (change === "site") { first.location.columnNumber += 1; }
    if (change === "caller") { caller.functionName = "foreign"; }
    if (change === "caller-function") { caller.functionLocation.columnNumber += 1; }
    const events = [{ method: "Debugger.paused", params: { reason: "other", hitBreakpoints: ["driver-point"], callFrames: [first, caller] } },
      { method: "Debugger.paused", params: { hitBreakpoints: ["save-point"], callFrames: [{ callFrameId: "finish" }] } }];
    let observed = 0, resumed = 0;
    const receiver = { points: new Map([["save", "save-point"]]), current: (): Promise<void> => Promise.resolve(), bindings: {
      scriptId: "original-script", persistentDriverBreakpointId: "driver-point",
      nextEvent: (): Promise<unknown> => Promise.resolve(events.shift()),
      observeRequest: (): Promise<object> => { observed += 1; return Promise.resolve({ method: "GET" }); },
      requireOriginalRequest: (request: unknown): void => { assert.deepEqual(request, { method: "GET" }); },
      continueReadonlyRequest: (): Promise<void> => { resumed += 1; return Promise.resolve(); },
    } };
    const next: unknown = runInNewContext(program, { z, captureCurrentPcbStringClockReply, decodePause,
      need: (value: boolean): void => { assert.ok(value); } });
    assert.ok(typeof next === "function"); const pending: unknown = Reflect.apply(next, receiver, ["save"]);
    assert.ok(pending !== null && typeof pending === "object" && "then" in pending);
    if (change === "none") { assert.equal(await Promise.resolve(pending), "finish"); assert.equal(observed, 1); assert.equal(resumed, 1); }
    else { await assert.rejects(Promise.resolve(pending), /FOOTPRINT_MAIN_REQUEST_COLLECTION_REPLY/u); assert.equal(observed, 0); assert.equal(resumed, 0); }
  }
});
