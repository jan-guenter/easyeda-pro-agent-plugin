/** Real production byte core with explicit inert opening/pair state only.
 * No native owner, source authority, project, worker or SQL is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { currentPcbViaSavedOpeningNativeFrame } from "../src/current-pcb-via-saved-registration.ts";
import type { CurrentPcbViaSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";

const rawWindowsPath = String.raw`C:\Synthetic\Codex_via_only_1111111111111111.eprj2`;
const target = Object.freeze({ rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) });
async function fixture(context: TestContext, holdWrite = false): Promise<Readonly<{ pipe: CurrentPcbViaSavedReadbackPipe; sent: Record<string, unknown>[]; reply: () => void; writeError: () => void }>> {
  const url = new URL("../src/current-pcb-diagnostic-pipe.ts", import.meta.url); const sourceRequire = createRequire(url);
  const source = await readFile(url, "utf8");
  const seeded = source.replace("  public bindSavedReadbackOpening(): void {", `public inertSavedOpeningPairForTest(){this.#savedReadbackLoadingGuard=true;this.#savedReadbackOpening=true;this.#savedReadbackRegistrationAttempted=true;this.#savedReadbackOpeningPhases.add("preflight");this.#savedReadbackLoadPair=Object.freeze({targetId:"worker",browserSessionId:"browser-worker",pageSessionId:"page-worker",url:"https://client/",title:"inert"});this.#workerSessions.set("page-worker","worker");}\n  public bindSavedReadbackOpening(): void {`);
  assert.notEqual(seeded, source); const compiled = await transform(seeded, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded = { exports: {} as Record<string, unknown> }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [sourceRequire, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSavedReadbackPipe"]; assert.ok(typeof Constructor === "function");
  const input = new PassThrough(), sent: Record<string, unknown>[] = [];
  let opening: Record<string, unknown> | null = null, originalWrite: ((cause?: Error | null) => void) | null = null;
  const respond = (command: Record<string, unknown>, result: unknown): void => { const text = `${JSON.stringify({ id: command["id"], result, ...(Object.hasOwn(command, "sessionId") ? { sessionId: command["sessionId"] } : {}) })}\0`; input.write(Buffer.from(text)); };
  const output = new Writable({ write(chunk: Buffer, _encoding, done): void {
    const raw: unknown = JSON.parse(chunk.subarray(0, -1).toString()); assert.ok(raw !== null && typeof raw === "object"); const entries = Object.entries(raw); const command = Object.fromEntries(entries); sent.push(command);
    if (command["method"] === "Target.attachToTarget") { respond(command, { sessionId: "parent" }); }
    else if (command["method"] === "Runtime.callFunctionOn") { opening = command; assert.equal(currentPcbViaSavedOpeningNativeFrame(chunk, "parent", "ui-context", target, "open-project")["action"], "saved-readback-project-open"); if (holdWrite) { originalWrite = done; return; } }
    else { respond(command, {}); } done();
  } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The checked VM export differs only at the explicit inert pair-state method above; the original private pipe core/queues remain unchanged.
  const pipe = Reflect.construct(Constructor, [input, output]) as CurrentPcbViaSavedReadbackPipe;
  const inputClosed = Promise.withResolvers<true>(), outputClosed = Promise.withResolvers<true>();
  input.once("close", () => { inputClosed.resolve(true); }); output.once("close", () => { outputClosed.resolve(true); });
  context.after(async () => { input.destroy(); output.destroy(); await Promise.all([inputClosed.promise, outputClosed.promise]); pipe.releaseClosedListeners(); });
  pipe.start(); await pipe.attachTarget("page", () => { assert.fail("Unexpected event"); });
  const seed: unknown = Reflect.get(pipe, "inertSavedOpeningPairForTest"); assert.ok(typeof seed === "function"); Reflect.apply(seed, pipe, []);
  return { pipe, sent, reply: (): void => { assert.ok(opening !== null); respond(opening, { result: { type: "string", value: "original SDK result" } }); }, writeError: (): void => { assert.ok(originalWrite !== null); originalWrite(new Error("lost write acknowledgment")); } };
}
void test("saved SDK opening and one fixed original worker request settle in distinct slots on one monotonic ID stream", async context => {
  const f = await fixture(context); const opening = f.pipe.observeSavedReadbackOpening("ui-context", target, "open-project"); f.pipe.requireOriginalSavedReadbackOpeningPending();
  await f.pipe.observeSavedReadbackLoadWorker({ phase: "saved-load-runtime", method: "Runtime.enable", params: {} });
  assert.deepEqual(f.sent.map(command => [command["id"], command["sessionId"]]), [[1, undefined], [2, "parent"], [3, "page-worker"]]);
  assert.equal(f.pipe.status().pendingRequestId, 2); await assert.rejects(f.pipe.getVersion(), /RETAINED_PENDING_SCOPE/u); f.reply(); await opening;
  assert.throws(() => { f.pipe.requireOriginalSavedReadbackOpeningPending(); }); assert.throws(() => f.pipe.observeSavedReadbackOpening("ui-context", target, "open-project"));
});
void test("an early opening result cannot replace its original native write callback or restore a consumed opening", async context => {
  const f = await fixture(context, true); let settled = false;
  const opening = (async (): Promise<unknown> => { const result = await f.pipe.observeSavedReadbackOpening("ui-context", target, "open-project"); settled = true; return result; })();
  f.reply(); await Promise.resolve(); assert.equal(settled, false); const refused = assert.rejects(opening, /OUTPUT/u); f.writeError(); await refused;
  assert.equal(settled, false); assert.equal(f.pipe.status().failure, "output"); assert.throws(() => f.pipe.observeSavedReadbackOpening("ui-context", target, "open-project"));
});
