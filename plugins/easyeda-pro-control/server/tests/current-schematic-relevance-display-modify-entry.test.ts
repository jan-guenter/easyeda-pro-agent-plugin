/** Original pipe/Inspector behavior on inert streams and synthetic models.
 * No native owner, application action, setter, Save or SQL is invoked. */
/* oxlint-disable promise/prefer-await-to-callbacks -- Inspector and Writable callbacks are the acknowledgement boundaries under test. */
import assert from "node:assert/strict";
import { Session } from "node:inspector";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentSchematicDisplayWritePipe, CurrentSchematicRelevanceDisplayWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentSchematicRelevanceDisplayModifyEntryNativeCases } from "../src/current-schematic-relevance-display-modify-entry-protocol.ts";
import { decodeCurrentSchematicRelevanceDisplayModifyEntryCallback, requireCurrentSchematicRelevanceDisplayModifyCallbackSource } from "../src/current-schematic-relevance-display-modify-entry-replies.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture as modelFixture } from "./generated-schematic-relevance-display-vm.ts";

async function fixture(context: TestContext, holdWrite = false): Promise<Readonly<{ pipe: CurrentSchematicRelevanceDisplayWritePipe; sent: Record<string, unknown>[]; replyModify: () => void; acknowledgeModify: (error: Error) => void; stop: () => void }>> {
  const input = new PassThrough(), sent: Record<string, unknown>[] = [];
  let original: Record<string, unknown> | null = null, writeAck: ((error?: Error | null) => void) | null = null;
  const reply = (command: Record<string, unknown>, result: unknown): void => { const response = { id: command["id"], result, ...(Object.hasOwn(command, "sessionId") ? { sessionId: command["sessionId"] } : {}) }; const text = `${JSON.stringify(response)}\0`; input.write(Buffer.from(text)); };
  const output = new Writable({ write(bytes: Buffer, _encoding, callback): void {
    const raw: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(raw !== null && typeof raw === "object" && !Array.isArray(raw)); const command = Object.fromEntries(Object.entries(raw)); sent.push(command);
    if (command["schematicRelevanceModifyGeneration"] === true) { original = command; if (holdWrite) { writeAck = callback; return; } }
    else { reply(command, command["method"] === "Target.attachToTarget" ? { sessionId: "original-ui" } : {}); }
    callback();
  } });
  const inputClosed = Promise.withResolvers<true>(), outputClosed = Promise.withResolvers<true>();
  input.once("close", () => { inputClosed.resolve(true); }); output.once("close", () => { outputClosed.resolve(true); });
  const pipe = new CurrentSchematicRelevanceDisplayWritePipe(input, output); pipe.start();
  context.after(async () => { input.destroy(); output.destroy(); await Promise.all([inputClosed.promise, outputClosed.promise]); pipe.releaseClosedListeners(); });
  await pipe.attachTarget("original-ui-target", () => { assert.fail("No actor event expected"); }); pipe.bindSchematicDisplayActionGuard("original-script", 0);
  return { pipe, sent, replyModify: (): void => { assert.ok(original !== null); reply(original, { result: { type: "boolean", value: false } }); },
    acknowledgeModify: (error: Error): void => { assert.ok(writeAck !== null); const acknowledge = writeAck; writeAck = null; acknowledge(error); },
    stop: (): void => { input.emit("error", new Error("inert original generation ended")); } };
}
void test("one original seven-record Modify remains pending while its fixed entry read settles on the same ID stream", async context => {
  const args = data().args, f = await fixture(context);
  const original = f.pipe.generateSchematicRelevanceDisplayModify("original-holder", args.target, args.operation), refused = assert.rejects(original);
  const turn = Promise.withResolvers<true>(); setImmediate(() => { turn.resolve(true); }); await turn.promise;
  f.pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); assert.throws(() => { f.pipe.requireOriginalSchematicRelevanceDisplayModifyPending(Promise.resolve({})); }, /ORIGINAL_REQUEST_PENDING/u);
  const command = currentSchematicRelevanceDisplayModifyEntryNativeCases().find(value => value.phase === "schematic-modify-entry-frame"); assert.ok(command !== undefined); await f.pipe.observeSchematicRelevanceDisplayModifyEntry(command);
  assert.deepEqual(f.sent.map(row => row["id"]), [1, 2, 3]); assert.equal(f.pipe.status().pendingRequestId, 2);
  const generated = f.sent[1], observed = f.sent[2]; assert.ok(generated !== undefined && observed !== undefined);
  const generationBytes = Buffer.from(`${JSON.stringify(generated)}\0`), generationRequest = currentSchematicRelevanceDisplayWriteNativeRequest(generationBytes);
  assert.equal(generationRequest["action"], "schematic-relevance-display-modify-generate");
  const observationBytes = Buffer.from(`${JSON.stringify(observed)}\0`), observationRequest = currentSchematicRelevanceDisplayWriteNativeRequest(observationBytes);
  assert.equal(observationRequest["action"], "schematic-relevance-display-modify-entry");
  assert.throws(() => f.pipe.generateSchematicRelevanceDisplayModify("original-holder", args.target, args.operation), /ORIGINAL_GENERATION/u);
  f.stop(); await refused;
});
void test("a Modify reply without its original write ACK never acknowledges generation or permits another attempt", async context => {
  const args = data().args, f = await fixture(context, true); let completed = false;
  const original = (async (): Promise<void> => { await f.pipe.generateSchematicRelevanceDisplayModify("original-holder", args.target, args.operation); completed = true; })();
  const refused = assert.rejects(original, /OUTPUT/u); f.replyModify(); await Promise.resolve(); assert.equal(completed, false);
  f.acknowledgeModify(new Error("original native write acknowledgement lost")); await refused;
  assert.equal(completed, false); assert.equal(f.pipe.status().failure, "output"); assert.throws(() => f.pipe.generateSchematicRelevanceDisplayModify("original-holder", args.target, args.operation));
  const input = new PassThrough(), output = new PassThrough(); const old = new CurrentSchematicDisplayWritePipe(input, output); old.start();
  assert.throws(() => old.generateSchematicRelevanceDisplayModify("foreign-holder", args.target, args.operation), /ORIGINAL_GENERATION/u);
  const inputClosed = Promise.withResolvers<true>(), outputClosed = Promise.withResolvers<true>(); input.once("close", () => { inputClosed.resolve(true); }); output.once("close", () => { outputClosed.resolve(true); });
  input.destroy(); output.destroy(); await Promise.all([inputClosed.promise, outputClosed.promise]); old.releaseClosedListeners();
});
void test("actual Inspector metadata binds the generated callback to the complete named seven-record stage", async () => {
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect();
  // oxlint-disable-next-line promise/avoid-new -- Preserve this actual Inspector callback and its original error/result settlement.
  const post = (method: string, params: Record<string, unknown> = {}): Promise<unknown> => new Promise((resolve, reject) => { session.post(method, params, (error, value) => { if (error === null) { resolve(value); } else { reject(error); } }); });
  const vm = modelFixture("hold-run"); await post("Debugger.enable"); await vm.call("capture"); await vm.call("preflight"); const original = vm.call("modify");
  const key = `__inertRelevanceCallback_${globalThis.crypto.randomUUID().replaceAll("-", "")}`; Object.defineProperty(globalThis, key, { value: vm.reference("heldCallback"), configurable: true });
  try {
    const evaluated = await post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-relevance-entry" }); assert.ok(evaluated !== null && typeof evaluated === "object"); const ref: unknown = Reflect.get(evaluated, "result"); assert.ok(ref !== null && typeof ref === "object"); const objectId: unknown = Reflect.get(ref, "objectId"); assert.ok(typeof objectId === "string");
    const metadata = await post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const scriptId = decodeCurrentSchematicRelevanceDisplayModifyEntryCallback(metadata); requireCurrentSchematicRelevanceDisplayModifyCallbackSource(await post("Debugger.getScriptSource", { scriptId }));
    assert.deepEqual(structuredClone(vm.reference("heldOptions")), { history: true, name: "Codex disposable Text display", timeout: 0, dependencies: [] }); assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 1, save: 0 });
  } finally { vm.edit("releaseHold()"); await original; Reflect.deleteProperty(globalThis, key); await post("Runtime.releaseObjectGroup", { objectGroup: "inert-relevance-entry" }); session.disconnect(); }
});
