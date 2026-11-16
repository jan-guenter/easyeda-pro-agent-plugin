/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- One original Inspector worker owns both actual held callbacks and asynchronous command replies. */
/** Only the inert fixture executes. Original source metadata is not authority. */
import { Session } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireGroupHistoryCursor } from "../../src/current-schematic-wire-group-history-cursor.ts";
import type { CurrentSchematicWireGroupHistoryData } from "../../src/current-schematic-wire-group-history-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_PROGRAMS as PROGRAMS } from "../../src/current-schematic-wire-group-history-programs.ts";

const config = z.strictObject({ key: z.string().regex(/^[A-Za-z\d_]+$/u), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]) }).parse(workerData);
const port = parentPort; if (port === null) { throw new Error("worker port"); } port.on("message", () => {
  // Retain the test worker through its two actual original callback pauses.
});
const session = new Session(); session.connectToMainThread(); const expected: string[] = [], helpers = new Set<string>(); let observing = false;
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && Object.values(PROGRAMS).some(program => event.params.length === program.length + 2)) { helpers.add(event.params.scriptId); } });
async function post(method: string, params: unknown): Promise<unknown> {
  if (method === "Runtime.callFunctionOn" && params !== null && typeof params === "object") { const fn: unknown = Reflect.get(params, "functionDeclaration"); if (typeof fn !== "string") { throw new TypeError("helper"); } expected.push(`(${fn})`); }
  const result: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); const value: unknown = await result;
  if (value !== null && typeof value === "object" && "exceptionDetails" in value) {
    const declaration: unknown = params !== null && typeof params === "object" ? Reflect.get(params, "functionDeclaration") : "";
    const prefix = typeof declaration === "string" ? declaration.slice(0, 60) : "";
    throw new Error(JSON.stringify({ method, declaration: prefix, value }));
  } return value;
}
const points = new Map<string, "before" | "after">(), refs = new Map<string, string>(); let before: CurrentSchematicWireGroupHistoryData | null = null; let reads = 0; let pauses = 0; const stageReads: number[] = [];
const need = (key: string): string => { const value = refs.get(key); if (value === undefined) { throw new Error("missing original fixture selector"); } return value; };
const fail = async (error: unknown): Promise<void> => { try { await session.post("Debugger.resume"); } catch {
  // Failure can precede the first held callback.
} port.postMessage({ error: error instanceof Error ? error.stack : String(error) }); session.disconnect(); port.close(); };
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0]; const ids = event.params.hitBreakpoints ?? []; const id = ids[0]; const role = id === undefined ? undefined : points.get(id);
  if (frame === undefined || ids.length !== 1 || role === undefined || frame.location.scriptId !== config.scriptId) { throw new Error("foreign GROUP history pause"); }
  if (role === "after" && before === null) { throw new Error("missing original before data"); }
  const cursor = role === "before" ? new CurrentSchematicWireGroupHistoryCursor({ role, frame: frame.callFrameId, holder: need("holder"), native: need("native"), frontier: need("frontier"), setter: need("setter"), groupConstructor: need("groupConstructor"), scriptId: config.scriptId, variant: config.variant }) : new CurrentSchematicWireGroupHistoryCursor({ role, frame: frame.callFrameId, previous: before ?? (() : never => { throw new Error("missing before"); })() });
  const initial = reads;
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); let raw: unknown; try { raw = await post(command.method, command.params); } catch (error) { throw new Error(JSON.stringify(command.phase === "wire-group-history-call" ? command.role : command.phase), { cause: error }); } cursor.accept(command, raw); reads += 1; }
  const data = cursor.requireCompleted(); stageReads.push(reads - initial); pauses += 1;
  if (role === "before") {
    before = data; const arm = z.strictObject({ breakpointId: z.string() }).parse(await post("Debugger.setBreakpointOnFunctionCall", { objectId: data.publicationFunction, condition: "" })); points.set(arm.breakpointId, "after");
    let refused = false; try { const copied = new CurrentSchematicWireGroupHistoryCursor({ role: "after", frame: frame.callFrameId, previous: structuredClone(data) }); copied.next(); } catch { refused = true; } if (!refused) { throw new Error("copied data bound successor"); }
  } else {
    let replayRefused = false;
    try { if (before === null) { throw new Error("missing before"); } const replay = new CurrentSchematicWireGroupHistoryCursor({ role: "after", frame: frame.callFrameId, previous: before }); replay.next(); } catch { replayRefused = true; }
    if (!replayRefused) { throw new Error("original comparison successor replayed"); }
    if (!data.oldDataOwnDescriptorsAndOpaqueReferencesPreserved || !data.newLinePointsAndPeerAttributesCompared || data.historyComplete || data.saveAuthorized || helpers.size !== 19 || expected.length !== 19) { throw new Error("GROUP history comparison"); }
    const actual: string[] = []; for (const scriptId of helpers) { const source = await session.post("Debugger.getScriptSource", { scriptId }); actual.push(source.scriptSource); }
    if (JSON.stringify(actual.toSorted()) !== JSON.stringify(expected.toSorted())) { throw new Error("GROUP history helper sources"); }
  }
  await session.post("Debugger.removeBreakpoint", { breakpointId: ids[0] ?? "" }); await session.post("Debugger.resume");
  if (role === "after") { port.postMessage({ reads, stageReads, pauses, resumed: pauses, helpers: helpers.size }); session.disconnect(); port.close(); }
})().catch(fail); });
void (async (): Promise<void> => {
  await session.post("Debugger.enable"); observing = true;
  for (const key of ["holder", "native", "frontier", "setter", "groupConstructor", "stackWillRecord"]) { const selected = await session.post("Runtime.evaluate", { expression: `globalThis.${config.key}.${key}` }); if (selected.exceptionDetails !== undefined || selected.result.objectId === undefined) { throw new Error("fixture selector"); } refs.set(key, selected.result.objectId); }
  const first = z.strictObject({ breakpointId: z.string() }).parse(await post("Debugger.setBreakpointOnFunctionCall", { objectId: need("stackWillRecord"), condition: "" })); points.set(first.breakpointId, "before"); port.postMessage({ ready: true });
})().catch(fail);
