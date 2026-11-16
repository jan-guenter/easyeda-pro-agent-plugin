/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- A single Inspector worker retains the actual inert VM frame until its finite reader completes. */
/** Native Inspector comparison on an actual generated capture, without edits. */
import { Session } from "node:inspector/promises";
import { parentPort } from "node:worker_threads";
import { CurrentSchematicWireSceneRawCursor } from "../../src/current-schematic-wire-scene-raw-cursor.ts";
import type { CurrentSchematicWireSceneRawCommand as Command } from "../../src/current-schematic-wire-scene-raw-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_SCENE_RAW_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_SCENE_RAW_FLAGS as FLAGS } from "../../src/current-schematic-wire-scene-raw-protocol.ts";

const port = parentPort; if (port === null) { throw new Error("port"); } port.on("message", () => {
  // Retain the worker through its single actual held VM frame.
});
const session = new Session(); session.connectToMainThread(); const helpers = new Set<string>(); const expected: string[] = []; let observing = false; let guardScript: string | null = null;
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && CALLS.some(row => event.params.length === row[1].length + 2)) { helpers.add(event.params.scriptId); } });
async function post(method: string, params: unknown): Promise<unknown> { const raw: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); return await raw; }
const fail = async (error: unknown): Promise<void> => { try { await session.post("Debugger.resume"); } catch {
  // Setup can fail without a held frame.
} port.postMessage({ error: error instanceof Error ? error.stack : String(error) }); session.disconnect(); port.close(); };
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0]; if (frame === undefined || frame.functionName !== "originalSceneRawHeld") { throw new Error("foreign scene raw frame"); }
  const selected = await session.post("Debugger.evaluateOnCallFrame", { callFrameId: frame.callFrameId, expression: "heldHolder", returnByValue: false, throwOnSideEffect: true, includeCommandLineAPI: false }); if (selected.exceptionDetails !== undefined || selected.result.objectId === undefined) { throw new Error("holder selector"); }
  const cursor = new CurrentSchematicWireSceneRawCursor(frame.callFrameId, selected.result.objectId); let count = 0; let snapshot: Command | null = null; let same: Command | null = null;
  for (let command = cursor.next(); command !== null; command = cursor.next()) {
    if (command.phase === "wire-scene-raw-snapshot") { snapshot = command; } if (command.phase === "wire-scene-raw-same") { same = command; }
    if (command.method === "Runtime.callFunctionOn") { expected.push(`(${command.params.functionDeclaration})`); }
    if (command.phase === "wire-scene-raw-source") { guardScript = command.params.scriptId; }
    cursor.reserve(command); const raw = await post(command.method, command.params);
    try { cursor.accept(command, raw); } catch (error) { throw new Error(`${command.phase}: ${JSON.stringify(raw)}`, { cause: error }); } count += 1;
  }
  const data = cursor.requireCompleted(); if (helpers.size !== 19 || expected.length !== 19 || guardScript === null || !helpers.has(guardScript)) { throw new Error("scene raw helper roster"); }
  const actual: string[] = []; let externalSources = 0;
  for (const scriptId of helpers) { const source = await session.post("Debugger.getScriptSource", { scriptId }); actual.push(source.scriptSource); if (scriptId !== guardScript) { externalSources += 1; } }
  if (JSON.stringify(actual.toSorted()) !== JSON.stringify(expected.toSorted())) { throw new Error("scene raw helper sources"); }
  const helperCount = helpers.size;
  if (snapshot === null || same === null) { throw new Error("missing original raw commands"); }
  // Fault injection touches only the owned inert graph. The production
  // Vocabulary contains none of these test mutation programs.
  await post("Runtime.callFunctionOn", { objectId: data.referencesObjectId, functionDeclaration: 'function(){Object.defineProperty(this[0],"inertOwnModelGetter",{get(){throw Error("model getter must stay uncalled")},configurable:true});}', returnByValue: true });
  const model = await post(snapshot.method, snapshot.params); const modelAccessorRefused = model !== null && typeof model === "object" && "exceptionDetails" in model;
  await post("Runtime.callFunctionOn", { objectId: data.referencesObjectId, functionDeclaration: 'function(){delete this[0].inertOwnModelGetter;Object.defineProperty(this[20],"opaqueExportGetter",{get(){throw Error("replacement getter must stay uncalled")},configurable:true});}', returnByValue: true });
  const drift = await post(same.method, same.params); const namespaceGetterDriftRefused = drift !== null && typeof drift === "object" && "exceptionDetails" in drift;
  if (!modelAccessorRefused || !namespaceGetterDriftRefused) { throw new Error("unsafe raw descriptor acceptance"); }
  await session.post("Debugger.resume"); await session.post("Runtime.releaseObjectGroup", { objectGroup: FLAGS.objectGroup }); port.postMessage({ count, data, helpers: helperCount, externalSources, modelAccessorRefused, namespaceGetterDriftRefused, pauses: 1, resumed: 1 }); session.disconnect(); port.close();
})().catch(fail); });
void (async (): Promise<void> => { await session.post("Debugger.enable"); observing = true; port.postMessage({ ready: true }); })().catch(fail);
