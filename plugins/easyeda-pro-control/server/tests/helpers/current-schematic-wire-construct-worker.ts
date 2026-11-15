/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- Inspector callbacks retain the original two held pauses and worker port. */
/** Observe actual native constructor bindings in an inert VM, without any
 * EasyEDA process, model, application method or native owner allocation. */
import { Session } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireConstructCursor } from "../../src/current-schematic-wire-construct-cursor.ts";
import type { CurrentSchematicWireConstructData } from "../../src/current-schematic-wire-construct-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_CONSTRUCT_SAME as SAME } from "../../src/current-schematic-wire-construct-protocol.ts";

const config = z.strictObject({ key: z.string().regex(/^[A-Za-z\d_]+$/u) }).parse(workerData);
const port = parentPort; if (port === null) { throw new Error("worker port"); }
port.on("message", () => {
  // Retain the original port while main is held.
});
const session = new Session(); session.connectToMainThread();
const helpers = new Set<string>();
session.on("Debugger.scriptParsed", event => { if (event.params.url === "" && event.params.length === SAME.length + 2) { helpers.add(event.params.scriptId); } });
async function post(method: string, params: unknown): Promise<unknown> { const value: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); return await value; }
let native: string | null = null, previous: CurrentSchematicWireConstructData | undefined; let reads = 0; let pauses = 0;
const fail = async (error: unknown): Promise<void> => {
  try { await session.post("Debugger.resume"); } catch {
    // Setup may have no held frame.
  }
  port.postMessage({ error: error instanceof Error ? error.stack : String(error) }); session.disconnect(); port.close();
};
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0]; if (frame === undefined || pauses >= 2) { throw new Error("unexpected held construct frame"); }
  if (native === null) {
    const value = await session.post("Debugger.evaluateOnCallFrame", { callFrameId: frame.callFrameId, expression: "native", returnByValue: false, throwOnSideEffect: true, includeCommandLineAPI: false });
    if (value.exceptionDetails !== undefined || value.result.objectId === undefined) { throw new Error("native fixture selector"); }
    native = value.result.objectId;
  }
  const cursor = new CurrentSchematicWireConstructCursor(frame.callFrameId, native, previous); let actual = 0;
  for (let command = cursor.next(); command !== null; command = cursor.next()) {
    if (cursor.next() !== command) { throw new Error("pending command drift"); }
    cursor.reserve(command); cursor.accept(command, await post(command.method, command.params)); actual += 1;
  }
  if (actual !== (pauses === 0 ? 5 : 3) || cursor.retainedReplies().length !== actual) { throw new Error("construct bound"); }
  previous = cursor.requireCompleted(); reads += actual; pauses += 1;
  if (pauses === 2) {
    if (helpers.size !== 2) { throw new Error("constructor helper source roster"); }
    for (const scriptId of helpers) { const source = await session.post("Debugger.getScriptSource", { scriptId }); if (source.scriptSource !== `(${SAME})`) { throw new Error("constructor helper source"); } }
  }
  await session.post("Debugger.resume");
  if (pauses === 2) { port.postMessage({ data: previous, reads, pauses, resumed: pauses, helperSources: helpers.size }); session.disconnect(); port.close(); }
})().catch(fail); });
void (async (): Promise<void> => {
  if (config.key.length === 0) { throw new Error("fixture key"); }
  await session.post("Debugger.enable");
  port.postMessage({ ready: true });
})().catch(fail);
