import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";

import {
  CurrentSchematicWireWriterV5Pipe, requireCurrentSchematicWireV5BundleSourceReceive,
} from "../src/current-pcb-diagnostic-pipe.ts";

const session = "original-session";
const script = "original-schematic";
const command = {
  phase: "wire-v5-title-bundle-source", method: "Debugger.getScriptSource", params: { scriptId: script },
} as const;

function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }

async function attached(context: TestContext): Promise<Readonly<{
  pipe: CurrentSchematicWireWriterV5Pipe;
  input: PassThrough;
  acknowledge: (failure?: Error) => void;
}>> {
  const input = new PassThrough();
  let pending: ((failure?: Error | null) => void) | null = null;
  const output = new Writable({ write(_chunk, _encoding, callback) { assert.equal(pending, null); pending = callback; } });
  const pipe = new CurrentSchematicWireWriterV5Pipe(input, output);
  pipe.start();
  context.after(() => { input.destroy(); output.destroy(); });
  const acknowledge = (failure?: Error): void => {
    assert.ok(pending !== null);
    const callback = pending;
    pending = null;
    callback(failure);
  };
  const attaching = pipe.attachTarget("original-target", () => { assert.fail("Unexpected renderer event"); });
  input.write(wire({ id: 1, result: { sessionId: session } }));
  acknowledge();
  assert.equal(await attaching, session);
  return { pipe, input, acknowledge };
}

void test("a V5 bundle receipt recognizes the settled original ID, source frame, session and result identity", async context => {
  const { pipe, input, acknowledge } = await attached(context);
  const pending = pipe.observeSchematicWireV5Title(command);
  const scriptSource = "x".repeat(2 * 1024 * 1024);
  const bytes = wire({ id: 2, result: { scriptSource }, sessionId: session });
  for (let offset = 0; offset < bytes.length; offset += 65_536) {
    input.write(bytes.subarray(offset, offset + 65_536));
  }
  assert.equal(pipe.status().pendingRequestId, 2);
  acknowledge();
  const result = await pending;
  const receipt = requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, session, script);
  assert.deepEqual(receipt, { requestId: 2, sessionId: session, scriptId: script, frameBytes: bytes.length - 1 });
  assert.equal(requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, session, script), receipt);
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(pipe, { scriptSource }, session, script),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, session, "bus-script"),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
  const foreign = await attached(context);
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(foreign.pipe, result, session, script),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, "changed-session", script),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
  const sourceField = Object.getOwnPropertyDescriptor(result, "scriptSource");
  assert.ok(sourceField !== undefined);
  Object.defineProperty(result, "scriptSource", { get: () => assert.fail("Source getter was invoked") });
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, session, script),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
  Object.defineProperty(result, "scriptSource", sourceField);
  const closed = once(input, "close");
  input.destroy();
  await closed;
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, session, script),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
});

void test("a V5 helper-source reply cannot become a whole bundle receipt", async context => {
  const { pipe, input, acknowledge } = await attached(context);
  const pending = pipe.observeSchematicWireV5Title({ ...command, phase: "wire-title-source" });
  input.write(wire({ id: 2, result: { scriptSource: "helper expression" }, sessionId: session }));
  acknowledge();
  const result = await pending;
  assert.throws(() => requireCurrentSchematicWireV5BundleSourceReceive(pipe, result, session, script),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
});

void test("a foreign session or a failed write cannot settle a V5 source receipt", async context => {
  const foreign = await attached(context);
  const missing = foreign.pipe.observeSchematicWireV5Title(command);
  const rejectedForeign = assert.rejects(missing, /PIPE_REPLY/u);
  foreign.input.write(wire({ id: 2, result: { scriptSource: "wrong origin" }, sessionId: "foreign-session" }));
  foreign.acknowledge();
  await rejectedForeign;
  const broken = await attached(context);
  const pending = broken.pipe.observeSchematicWireV5Title(command);
  const rejectedWrite = assert.rejects(pending, /PIPE_OUTPUT/u);
  broken.input.write(wire({ id: 2, result: { scriptSource: "matching reply" }, sessionId: session }));
  assert.equal(broken.pipe.status().pendingRequestId, 2);
  broken.acknowledge(new Error("inert native write refusal"));
  await rejectedWrite;
});
