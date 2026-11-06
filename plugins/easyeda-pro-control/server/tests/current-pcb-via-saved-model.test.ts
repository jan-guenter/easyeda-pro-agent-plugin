/* oxlint-disable import/max-dependencies -- This focused actual-pipe regression compiles the original private byte core and checks its fixed model codec/profile on real streams. */
/** Actual fixed wire codecs and original production pipe; seeded observation
 * state is inert and cannot issue a native owner or loading proof. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { diagnosticPcbOpeningParams, diagnosticPrimitives209Params } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_MODEL_REQUESTS, currentPcbViaSavedModelNativeFrame } from "../src/current-pcb-via-saved-model-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE } from "../src/current-pcb-via-saved-readback-profile.ts";

const rawWindowsPath = String.raw`C:\Synthetic\Codex_via_only_1111111111111111.eprj2`;
const target = Object.freeze({ rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) });
const phases = ["preflight", "open-document", "observe", "primitives"] as const;
void test("saved fixed model calls retain exact original receivers, source bytes and finite phase", () => {
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activePcbModel,
    CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeLoadObservation + CURRENT_PCB_VIA_SAVED_MODEL_REQUESTS.total);
  for (const phase of phases) {
    const params = phase === "primitives" ? diagnosticPrimitives209Params("ui", target) : diagnosticPcbOpeningParams("ui", target, phase);
    const command = { id: 351, method: "Runtime.callFunctionOn", params, sessionId: "parent" };
    const frame = Buffer.from(`${JSON.stringify(command)}\0`);
    assert.deepEqual(currentPcbViaSavedModelNativeFrame(frame, "parent", "ui", target, phase), { action: "saved-readback-model", requestId: 351, modelPhase: phase });
    assert.throws(() => currentPcbViaSavedModelNativeFrame(frame, "foreign", "ui", target, phase));
    assert.throws(() => currentPcbViaSavedModelNativeFrame(frame, "parent", "other", target, phase));
    assert.throws(() => currentPcbViaSavedModelNativeFrame(Buffer.from(`${JSON.stringify({ ...command, params: { ...params, functionDeclaration: "function(){return true}" } })}\0`), "parent", "ui", target, phase));
    assert.throws(() => currentPcbViaSavedModelNativeFrame(Buffer.concat([frame, frame]), "parent", "ui", target, phase));
  }
});

async function fixture(context: TestContext, loseWrite = false): Promise<Readonly<{ pipe: CurrentPcbViaSavedReadbackPipe; sent: string[] }>> {
  const url = new URL("../src/current-pcb-diagnostic-pipe.ts", import.meta.url); const sourceRequire = createRequire(url);
  const source = await readFile(url, "utf8"); const seeded = source.replace("  public bindSavedReadbackModel(): void {", "public inertSavedObservationForTest(){this.#savedReadbackObservation=true;}\n  public bindSavedReadbackModel(): void {");
  assert.notEqual(seeded, source);
  const compiled = await transform(seeded, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded = { exports: {} as Record<string, unknown> }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);
  assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [sourceRequire, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSavedReadbackPipe"]; assert.ok(typeof Constructor === "function");
  const input = new PassThrough(), sent: string[] = [];
  const output = new Writable({ write(chunk: Buffer, _encoding, done): void {
    const command: unknown = JSON.parse(chunk.subarray(0, -1).toString()); assert.ok(command !== null && typeof command === "object" && "id" in command && "method" in command);
    if (command.method === "Target.attachToTarget") { input.write(Buffer.from(`${JSON.stringify({ id: command.id, result: { sessionId: "parent" } })}\0`)); done(); return; }
    const phase = phases[sent.length]; assert.ok(phase !== undefined); const native = currentPcbViaSavedModelNativeFrame(chunk, "parent", "ui", target, phase); sent.push(String(native["modelPhase"]));
    input.write(Buffer.from(`${JSON.stringify({ id: command.id, result: {}, sessionId: "parent" })}\0`));
    done(loseWrite ? new Error("original ACK lost") : undefined);
  } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The checked VM export adds only the explicitly inert observation seam; all real byte-core slot/ACK rules remain unchanged.
  const pipe = Reflect.construct(Constructor, [input, output]) as CurrentPcbViaSavedReadbackPipe;
  const closedInput = Promise.withResolvers<true>(), closedOutput = Promise.withResolvers<true>();
  input.once("close", () => { closedInput.resolve(true); }); output.once("close", () => { closedOutput.resolve(true); });
  context.after(async () => { input.destroy(); output.destroy(); await Promise.all([closedInput.promise, closedOutput.promise]); pipe.releaseClosedListeners(); });
  pipe.start(); await pipe.attachTarget("page", () => { assert.fail("unexpected event"); });
  assert.throws(() => { pipe.bindSavedReadbackModel(); });
  const seed: unknown = Reflect.get(pipe, "inertSavedObservationForTest"); assert.ok(typeof seed === "function"); Reflect.apply(seed, pipe, []);
  pipe.bindSavedReadbackModel(); assert.throws(() => { pipe.bindSavedReadbackModel(); }); return { pipe, sent };
}
void test("saved production pipe consumes the four model calls once after its distinct binding", async context => {
  const f = await fixture(context);
  assert.throws(() => f.pipe.observeSavedReadbackModel("ui", target, "primitives"));
  for (const phase of phases) { await f.pipe.observeSavedReadbackModel("ui", target, phase); assert.throws(() => f.pipe.observeSavedReadbackModel("ui", target, phase)); }
  assert.deepEqual(f.sent, phases); assert.equal(f.pipe.status().requestCount, 5);
});
void test("saved production pipe never turns an early model result into a missing native write ACK", async context => {
  const f = await fixture(context, true);
  await assert.rejects(f.pipe.observeSavedReadbackModel("ui", target, "preflight"), /OUTPUT/u);
  assert.equal(f.pipe.status().failure, "output"); assert.equal(f.sent.length, 1);
  assert.throws(() => f.pipe.observeSavedReadbackModel("ui", target, "preflight"));
  await assert.rejects(f.pipe.observeSavedReadbackModel("ui", target, "open-document")); assert.equal(f.sent.length, 1);
});
