/** Corrected fixed transport regression; mocked children only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compileMainReferenceTransport, invokeMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";
import { flushMicrotasks, request, transportFixture } from "./helpers/main-reference-settlement-fixture.ts";

const transport = { compileMainReferenceTransport, invokeMainReferenceTransport };

for (const failure of ["stdin-failure", "output-limit"] as const) {
  void test(`${failure} does not resolve before the original child closes`, async (context) => {
    const compiled = await transport.compileMainReferenceTransport(request), fixture = transportFixture(context);
    let settled = false;
    // oxlint-disable-next-line promise/prefer-await-to-then -- Assert the promise remains pending until the original close event.
    const pending = transport.invokeMainReferenceTransport(compiled).then((value) => { settled = true; return value; });
    if (failure === "stdin-failure") { fixture.input.emit("error", new Error("Synthetic stdin failure")); }
    else { fixture.output.write(Buffer.alloc(131_073, 97)); }
    await flushMicrotasks();
    assert.equal(fixture.state.kills, 1);
    assert.equal(settled, false, "A failure is not observed child closure");
    fixture.close(197, null);
    const result = await pending;
    assert.equal(result.transportFailure, failure);
    assert.equal(result.exitCode, 197); assert.equal(result.signal, null);
    assert.throws(() => transport.invokeMainReferenceTransport(compiled), /already consumed/u);
  });
}
