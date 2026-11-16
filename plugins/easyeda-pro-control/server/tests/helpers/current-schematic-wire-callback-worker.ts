/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- The original worker port retains seven actual callback pauses and their asynchronous Inspector requests. */
/** The actual unchanged generated callback runs only in an inert VM.
 * Downstream monitor/application ownership and completion are not synthesized. */
import { Session } from "node:inspector/promises";
import { parentPort } from "node:worker_threads";
import { CurrentSchematicWireCallbackCursor } from "../../src/current-schematic-wire-callback-cursor.ts";
import type { CurrentSchematicWireCallbackInput } from "../../src/current-schematic-wire-callback-cursor.ts";
import { CurrentSchematicWireConstructCursor } from "../../src/current-schematic-wire-construct-cursor.ts";
import type { CurrentSchematicWireConstructData } from "../../src/current-schematic-wire-construct-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_CALLBACK_VALUES as VALUES } from "../../src/current-schematic-wire-callback-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CONSTRUCT_SAME as CONSTRUCT } from "../../src/current-schematic-wire-construct-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK_CALLS as CALLS } from "../../src/current-schematic-wire-writer-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "../../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle as object } from "../../src/current-schematic-relevance-action-raw-replies.ts";

const port = parentPort; if (port === null) { throw new Error("worker port"); }
port.on("message", () => {
  // Retain this original port through all paused callbacks.
});
const session = new Session(); session.connectToMainThread();
const programs = [VALUES, CONSTRUCT, ...CALLS.map(row => row[1])]; const helpers = new Set<string>(); const expected: string[] = [];
let observing = false;
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && programs.some(program => program.length + 2 === event.params.length)) { helpers.add(event.params.scriptId); } });
async function post(method: string, params: unknown): Promise<unknown> {
  if (method === "Runtime.callFunctionOn" && params !== null && typeof params === "object") { const program: unknown = Reflect.get(params, "functionDeclaration"); if (typeof program !== "string") { throw new TypeError("helper program"); } expected.push(`(${program})`); }
  const value: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); return await value;
}
const selector = async (frame: string, expression: string): Promise<string> => {
  const out = await session.post("Debugger.evaluateOnCallFrame", { callFrameId: frame, expression, returnByValue: false, throwOnSideEffect: true, includeCommandLineAPI: false });
  if (out.exceptionDetails !== undefined || out.result.objectId === undefined) { throw new Error("fixture selector"); } return out.result.objectId;
};
let holder: string | null = null; let native: string | null = null; let qualified: string | null = null; let first: string | null = null; let second: string | null = null; let previous: string | null = null;
let construct: CurrentSchematicWireConstructData | undefined; let reads = 0; let pauses = 0;
const roles = ["entry", "point-before", "point-after", "point-before", "point-after", "setter-before", "finish"] as const;
async function collect<T extends { method: string; params: unknown }>(cursor: { next: () => T | null; reserve: (command: T) => void; accept: (command: T, input: unknown) => void }): Promise<void> {
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); cursor.accept(command, await post(command.method, command.params)); reads += 1; }
}
const fail = async (error: unknown): Promise<void> => {
  try { await session.post("Debugger.resume"); } catch {
    // An early setup error may have no held frame.
  }
  port.postMessage({ error: error instanceof Error ? error.stack : String(error) }); session.disconnect(); port.close();
};
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0]; const role = roles[pauses]; if (frame === undefined || role === undefined) { throw new Error("unexpected callback pause"); } pauses += 1;
  if (role === "entry") {
    holder = await selector(frame.callFrameId, "tuple"); native = await selector(frame.callFrameId, "native");
    const rawValues = await post("Debugger.evaluateOnCallFrame", { callFrameId: frame.callFrameId, expression: "[Point,Ea,_he,ok,Ea.normal,isFinite,qt,Cr]", returnByValue: false, throwOnSideEffect: true, includeCommandLineAPI: false });
    const valuesId = tuple(rawValues, 8); const values = array(await post("Runtime.getProperties", { objectId: valuesId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), 8);
    const ids = Array.from({ length: 8 }, (_, i) => object(values.get(String(i)), i === 0 || i === 1 || i === 4 || i === 5 || i === 7 ? "function" : "object"));
    const pack = new CurrentSchematicWireCallbackCursor({ role: "values", holder, values: ids }); await collect(pack); qualified = pack.requireCompleted().tuple;
  }
  if (holder === null || native === null || qualified === null) { throw new Error("missing callback setup"); }
  if (role === "point-before") {
    const cursor = new CurrentSchematicWireConstructCursor(frame.callFrameId, native, construct); await collect(cursor); construct = cursor.requireCompleted();
    previous ??= await selector(frame.callFrameId, "originalPoints");
  }
  if (role === "finish") {
    if (helpers.size !== 9 || expected.length !== 9) { throw new Error("callback helper source roster"); }
    const actual: string[] = [];
    for (const scriptId of helpers) { const value = await session.post("Debugger.getScriptSource", { scriptId }); actual.push(value.scriptSource); }
    if (JSON.stringify(actual.toSorted()) !== JSON.stringify(expected.toSorted())) { throw new Error("callback helper sources"); }
    await session.post("Debugger.resume"); port.postMessage({ reads, pauses, resumed: pauses, helpers: helpers.size }); session.disconnect(); port.close(); return;
  }
  let input: CurrentSchematicWireCallbackInput;
  const base = { frame: frame.callFrameId, holder, native, qualified };
  if (role === "entry") { input = { ...base, role }; }
  else if (role === "setter-before") { if (first === null || second === null) { throw new Error("missing original points"); } input = { ...base, role, first, second }; }
  else { if (previous === null) { throw new Error("missing previous point proof"); } input = { ...base, role, previous }; }
  const cursor = new CurrentSchematicWireCallbackCursor(input); await collect(cursor); const data = cursor.requireCompleted();
  if (data.role === "point-after") { if (data.tuple === null) { throw new Error("missing captured point"); } if (first === null) { first = data.tuple; previous = first; } else { second = data.tuple; } }
  await session.post("Debugger.resume");
})().catch(fail); });
void (async (): Promise<void> => { await session.post("Debugger.enable"); observing = true; port.postMessage({ ready: true }); })().catch(fail);
