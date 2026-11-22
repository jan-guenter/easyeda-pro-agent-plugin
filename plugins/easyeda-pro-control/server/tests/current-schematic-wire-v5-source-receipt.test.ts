import assert from "node:assert/strict";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import type { TestContext } from "node:test";

import { sha256Text } from "../src/core.ts";
import { CurrentPcbDiagnosticContext } from "../src/current-pcb-diagnostic-context.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

import {
  CurrentSchematicWireWriterV5Pipe, requireCurrentSchematicWireV5BundleSourceReceive,
} from "../src/current-pcb-diagnostic-pipe.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM as GRAPH } from "../src/current-schematic-wire-encoder-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS } from "../src/current-schematic-wire-writer-protocol.ts";
import { currentSchematicWireWriterV5NativeCommand } from "../src/current-schematic-wire-writer-v5-native-command.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE } from "../src/generated-schematic-display-accessor-source.ts";

const session = "original-session";
const script = "original-schematic";
const command = {
  phase: "wire-v5-title-bundle-source", method: "Debugger.getScriptSource", params: { scriptId: script },
} as const;

function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }

async function attached(context: TestContext, observeWrite?: (chunk: Buffer) => void,
  observeEvent: (event: DiagnosticEvent) => void = () => { assert.fail("Unexpected renderer event"); },
): Promise<Readonly<{
  pipe: CurrentSchematicWireWriterV5Pipe;
  input: PassThrough;
  acknowledge: (failure?: Error) => void;
}>> {
  const input = new PassThrough();
  let pending: ((failure?: Error | null) => void) | null = null;
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The Writable holds its real completion until the fixture releases it.
  const output = new Writable({ write(chunk: Buffer, _encoding, callback): void { assert.equal(pending, null); pending = callback; observeWrite?.(chunk); } });
  const pipe = new CurrentSchematicWireWriterV5Pipe(input, output);
  pipe.start();
  context.after(() => { input.destroy(); output.destroy(); });
  const acknowledge = (failure?: Error): void => {
    assert.ok(pending !== null);
    const callback = pending;
    pending = null;
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Release this retained Writable completion with the fixture-selected outcome.
    callback(failure);
  };
  const attaching = pipe.attachTarget("original-target", observeEvent);
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
  const closed = Promise.withResolvers<null>();
  input.once("close", () => { closed.resolve(null); });
  input.destroy();
  await closed.promise;
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

void test("V5 opening joins the canonical raw script event to its acknowledged original navigation without another dispatch", async context => {
  const target = Object.freeze({
    rawWindowsPath: String.raw`C:\Disposable\wire-navigation-custody-fixture.eprj2`,
    projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), schematicUuid: "c".repeat(32),
    pageUuid: "d".repeat(32), expectedSourceSha256: "e".repeat(64),
  });
  const binding = "original-ui-context", contextId = 7;
  const renderer = new CurrentPcbDiagnosticContext("original-target");
  const uiUrl = "https://client/editor?cll=warn";
  const targetRow = { targetId: "original-target", type: "page", attached: false, url: `${uiUrl}#` };
  const frames = { frameTree: { frame: { id: "root-frame", url: uiUrl, urlFragment: "#", loaderId: "root-loader", securityOrigin: "https://client" } } };
  renderer.selectTarget({ targetInfos: [targetRow] });
  const receipts: Promise<Record<string, unknown>>[] = [];
  const writes: Buffer[] = [];
  const fixture = await attached(context, chunk => {
    if (writes.length === 1) { assert.equal(receipts.length, 1); }
    writes.push(chunk);
  }, received => { renderer.observeEvent(received); });
  renderer.bindSession(session);
  renderer.observeFrames(frames);
  const uiSource = "const testUi = true;";
  const uiRelativePath = "pro-ui/test/js/ui.js";
  renderer.selectFrame("root-frame", { family: "ui", relativePath: uiRelativePath, scriptBytes: Buffer.byteLength(uiSource), scriptSha256: sha256Text(uiSource) });
  fixture.input.write(wire({ sessionId: session, method: "Runtime.executionContextCreated", params: { context: {
    id: contextId, uniqueId: binding, origin: "https://client", name: "", auxData: { type: "default", isDefault: true, frameId: "root-frame" },
  } } }));
  fixture.input.write(wire({ sessionId: session, method: "Debugger.scriptParsed", params: { scriptId: "ui-script", url: `https://client/${uiRelativePath}`, executionContextId: contextId } }));
  renderer.finish({ scriptSource: uiSource }, { targetInfos: [{ ...targetRow, attached: true }] }, frames);
  assert.throws(() => renderer.schematicWireV5OpeningContext(), /IDENTITY/u);
  renderer.beginSchematicOpeningTransition(target.projectUuid, target.pageUuid);
  const realm = renderer.schematicWireV5OpeningContext();
  assert.deepEqual(realm, { sessionId: session, uniqueContextId: binding, contextId });

  const pending = fixture.pipe.observeSchematicWireV5Navigation(binding, realm.contextId, target, value => { receipts.push(value); });
  const observed = Promise.allSettled([pending]);
  const original = receipts[0]; assert.ok(original !== undefined);
  const navigationCommand = currentSchematicWireWriterV5NativeCommand("navigate", binding, target);
  assert.deepEqual(writes[1], wire({ id: 2, ...navigationCommand, sessionId: session }));
  assert.equal(fixture.pipe.status().requestCount, 2);
  assert.throws(() => { fixture.pipe.requireOriginalSchematicWireV5NavigationPending(original, session, binding, target); }, /NOT_ORIGINAL_PENDING/u);

  fixture.acknowledge();
  await setImmediate();
  fixture.pipe.requireOriginalSchematicWireV5NavigationPending(original, session, binding, target);
  assert.throws(() => { fixture.pipe.requireOriginalSchematicWireV5NavigationPending(pending, session, binding, target); }, /NOT_ORIGINAL_PENDING/u);
  assert.throws(() => { fixture.pipe.requireOriginalSchematicWireV5NavigationPending(original, "other", binding, target); }, /NOT_ORIGINAL_PENDING/u);
  assert.throws(() => { fixture.pipe.requireOriginalSchematicWireV5NavigationPending(original, session, "other", target); }, /CONTEXT_CHANGED/u);
  assert.throws(() => { fixture.pipe.requireOriginalSchematicWireV5NavigationPending(original, session, binding, { ...target, pageUuid: "f".repeat(32) }); }, /CONTEXT_CHANGED/u);
  await assert.rejects(fixture.pipe.getVersion(), /RETAINED_PENDING_SCOPE/u);
  assert.equal(writes.length, 2);

  const record = {
    sessionId: session, method: "Debugger.scriptParsed", params: {
      scriptId: script, executionContextId: contextId,
      url: `https://client/${GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE[0].relativePath}`,
      startLine: 0, startColumn: 0, endLine: 4000, endColumn: 0, length: 6_000_000, hash: "1".repeat(64),
      hasSourceURL: false, isLiveEdit: false, scriptLanguage: "JavaScript",
    },
  } as const;
  fixture.input.write(wire({ ...record, params: { ...record.params, scriptId: "foreign-script", executionContextId: 8 } }));
  assert.throws(() => renderer.schematicWireV5OpeningScript(), /IDENTITY/u);
  const raw = Buffer.from(` ${JSON.stringify(record)}\0`);
  fixture.input.write(raw);
  const selected = renderer.schematicWireV5OpeningScript();
  assert.equal(selected.variant, 0); assert.equal(selected.scriptId, script);
  const requireScript = (): ReturnType<CurrentSchematicWireWriterV5Pipe["requireOriginalSchematicWireV5NavigationScript"]> =>
    fixture.pipe.requireOriginalSchematicWireV5NavigationScript(original, session, binding, target, selected);
  const receipt = requireScript();
  assert.equal(receipt.originalText, raw.subarray(0, -1).toString("utf8"));
  assert.equal(receipt.transportBytesRetained, true);
  assert.equal(requireScript(), receipt);
  assert.throws(() => fixture.pipe.requireOriginalSchematicWireV5NavigationScript(original, session, binding, target,
    { ...selected, parsed: { ...selected.parsed, hash: "false hash" } }), /SCRIPT_CHANGED/u);
  fixture.input.write(wire({ ...record, params: { ...record.params, scriptId: "other-source", hasSourceURL: true } }));
  assert.throws(() => renderer.schematicWireV5OpeningScript(), /IDENTITY/u);
  assert.throws(requireScript, /SCRIPT_UNAVAILABLE/u);

  fixture.input.write(wire({ id: 2, result: { written: true }, sessionId: session }));
  const [outcome] = await observed;
  assert.ok(outcome?.status === "fulfilled");
  assert.equal(outcome.value, await original);
  assert.throws(requireScript, /NOT_ORIGINAL_PENDING/u);
  assert.throws(() => { fixture.pipe.requireOriginalSchematicWireV5NavigationPending(original, session, binding, target); }, /NOT_ORIGINAL_PENDING/u);
  await assert.rejects(fixture.pipe.observeSchematicWireV5Navigation(binding, contextId, target, (): void => { assert.fail("Unexpected retry"); }), /NAVIGATION_CONSUMED/u);
  assert.equal(writes.length, 2);

  const broken = await attached(context);
  const failed = broken.pipe.observeSchematicWireV5Navigation(binding, contextId, target, value => { receipts.push(value); });
  const failedOriginal = receipts[1]; assert.ok(failedOriginal !== undefined);
  const rejected = assert.rejects(failed, /PIPE_OUTPUT/u);
  broken.acknowledge(new Error("inert native write refusal"));
  await rejected;
  assert.throws(() => { broken.pipe.requireOriginalSchematicWireV5NavigationPending(failedOriginal, session, binding, target); }, /NOT_ORIGINAL_PENDING/u);
});

void test("encoder binder proves the original written frame and its same-session generated helper through the retained pipe", async context => {
  const forwarded: Readonly<Record<string, string | number>>[] = [];
  let forward: ((bytes: Buffer) => void) | null = null;
  const { pipe, input, acknowledge } = await attached(context, bytes => { forward?.(bytes); });
  const source = pipe.observeSchematicWireV5Title(command);
  input.write(wire({ id: 2, result: { scriptSource: "inert original source" }, sessionId: session }));
  acknowledge();
  const originalBundleReply = await source;
  let polls = 0;
  const helperSource = `(${GRAPH})`;
  const bindings = {
    originalBundleReply, scriptId: script, contextId: 17, holder: "original.holder", native: "original.native",
    assertCurrent: (): void => { assert.equal(pipe.status().failure, null); },
    poll: (): Promise<void> => {
      polls += 1;
      if (polls === 1) {
        const event = { method: "Debugger.scriptParsed", params: { scriptId: "generated.helper", executionContextId: 17,
          url: "", length: helperSource.length }, sessionId: session };
        input.write(Buffer.concat([wire(event), wire({ id: 3, result: { originalGraph: "retained" }, sessionId: session })]));
      } else {
        assert.equal(polls, 2);
        input.write(wire({ id: 4, result: { scriptSource: helperSource }, sessionId: session }));
      }
      return Promise.resolve();
    },
  };
  assert.throws(() => pipe.prepareSchematicWireV5EncoderTransport({ ...bindings, originalBundleReply: { ...originalBundleReply } }),
    /WIRE_V5_BUNDLE_SOURCE_ORIGINAL_REPLY/u);
  const transport = pipe.prepareSchematicWireV5EncoderTransport(bindings);
  forward = (bytes): void => {
    assert.throws(() => pipe.forwardSchematicWireV5EncoderFrame(Buffer.from(bytes.subarray(0, -1))), /ORIGINAL_FRAME/u);
    forwarded.push(pipe.forwardSchematicWireV5EncoderFrame(bytes));
    assert.throws(() => pipe.forwardSchematicWireV5EncoderFrame(bytes), /ORIGINAL_FRAME/u);
  };
  const graph = {
    phase: "wire-encoder-before-graph", method: "Runtime.callFunctionOn", params: {
      ...FLAGS, objectId: bindings.holder, functionDeclaration: GRAPH, arguments: [{ objectId: bindings.native }],
      returnByValue: false, awaitPromise: false, userGesture: false,
    },
  } as const;
  const pendingGraph = transport.request(graph);
  assert.equal(pipe.status().pendingRequestId, 3);
  assert.equal(polls, 0);
  acknowledge();
  const result = await pendingGraph;
  const pendingHelper = transport.qualifyHelper(graph, result);
  assert.equal(pipe.status().pendingRequestId, 4);
  acknowledge();
  await pendingHelper;
  assert.deepEqual(forwarded, [
    { action: "schematic-wire-v5-encoder", requestId: 3, phase: "wire-encoder-before-graph", method: "Runtime.callFunctionOn",
      objectId: bindings.holder, arg0ObjectId: bindings.native },
    { action: "schematic-wire-v5-encoder", requestId: 4, phase: "wire-encoder-helper-source", method: "Debugger.getScriptSource",
      scriptId: "generated.helper" },
  ]);
  await assert.rejects(transport.qualifyHelper(graph, result), /ORIGINAL_HELPER_REPLY/u);
  assert.equal(polls, 2);
});
