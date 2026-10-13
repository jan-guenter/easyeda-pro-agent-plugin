/** Corrected fixed transport regression; mocked children only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compileMainReferenceTransport, invokeMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";
import { flushMicrotasks, request, transportFixture } from "./helpers/main-reference-settlement-fixture.ts";

const transport = { compileMainReferenceTransport, invokeMainReferenceTransport };

for (const failure of ["stdout", "stderr", "stdin-after-setup"] as const) {
  void test(`${failure} error cannot escape its owned transport`, async (context) => {
    const compiled = await transport.compileMainReferenceTransport(request);
    const fixture = transportFixture(context, failure === "stdin-after-setup" ? { setup: "throw-in-output-listener" } : {});
    let settled = false;
    // oxlint-disable-next-line promise/prefer-await-to-then -- Assert the promise remains pending until the original close event.
    const pending = transport.invokeMainReferenceTransport(compiled).then((value) => { settled = true; return value; });
    let target = fixture.input;
    if (failure === "stdout") { target = fixture.output; } else if (failure === "stderr") { target = fixture.error; }
    assert.doesNotThrow(() => { target.emit("error", new Error("Synthetic private stream error")); });
    await flushMicrotasks(); assert.equal(settled, false); assert.equal(fixture.state.kills, 1);
    fixture.close(197, null); const result = await pending;
    assert.equal(result.transportFailure, failure === "stdin-after-setup" ? "start-failure" : `${failure}-failure`);
    assert.throws(() => transport.invokeMainReferenceTransport(compiled), /already consumed/u);
  });
}
