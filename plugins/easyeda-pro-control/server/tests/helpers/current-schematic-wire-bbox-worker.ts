/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- One Inspector worker retains the four original callback pauses and both exact Promises. */
import { Session } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireBboxCursor } from "../../src/current-schematic-wire-bbox-cursor.ts";
import type { CurrentSchematicWireBboxData } from "../../src/current-schematic-wire-bbox-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_BBOX_POINTS as POINTS } from "../../src/current-schematic-wire-bbox-source.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE } from "../../src/current-schematic-wire-completion-source.ts";
import { CURRENT_SCHEMATIC_WIRE_BBOX_PROGRAMS as PROGRAMS } from "../../src/current-schematic-wire-bbox-programs.ts";

const config = z.strictObject({ key: z.string().regex(/^[A-Za-z\d_]+$/u), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]) }).parse(workerData);
const port = parentPort ?? (() : never => { throw new Error("worker port"); })(); port.on("message", () => {
  // Keep this worker alive while its original main-thread callback is held.
});
const session = new Session(); session.connectToMainThread(); let observing = false; const helpers = new Set<string>(); const expected: string[] = []; const refs = new Map<string, string>(); const points = new Map<string, "entry" | "returned" | "caught">(); const stageReads: number[] = []; let current: CurrentSchematicWireBboxData | null = null; let returnedFirst: CurrentSchematicWireBboxData | null = null; let tick = 0; let pauses = 0; let resumed = 0; let reads = 0;
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && Object.values(PROGRAMS).some(program => event.params.length === program.length + 2)) { helpers.add(event.params.scriptId); } });
const need = (key: string): string => { const value = refs.get(key); if (value === undefined) { throw new Error("missing original selector"); } return value; };
async function post(method: string, params: unknown): Promise<unknown> {
  if (method === "Runtime.callFunctionOn" && params !== null && typeof params === "object") { const fn: unknown = Reflect.get(params, "functionDeclaration"); if (typeof fn !== "string") { throw new TypeError("helper"); } expected.push(`(${fn})`); }
  const pending: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); const result: unknown = await pending;
  if (result !== null && typeof result === "object" && "exceptionDetails" in result) { throw new Error(JSON.stringify({ method, result })); } return result;
}
async function run(cursor: CurrentSchematicWireBboxCursor): Promise<CurrentSchematicWireBboxData> {
  const initial = reads;
  try { for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); reads += 1; cursor.accept(command, await post(command.method, command.params)); } }
  catch (error) { cursor.fail(); throw error; }
  stageReads.push(reads - initial); return cursor.requireCompleted();
}
function copies(data: CurrentSchematicWireBboxData): void {
  const previous = structuredClone(data); let refused = false;
  try {
    let cursor: CurrentSchematicWireBboxCursor;
    if (data.role === "entry") { cursor = new CurrentSchematicWireBboxCursor({ role: "returned", frame: "original", previous }); }
    else if (data.role === "returned") { cursor = new CurrentSchematicWireBboxCursor({ role: "settled", previous }); }
    else { cursor = new CurrentSchematicWireBboxCursor({ role: "entry", tick: 2, frame: "original", previous }); }
    cursor.next();
  } catch { refused = true; } if (!refused) { throw new Error("copied bbox successor accepted"); }
}
async function fail(error: unknown): Promise<void> { try { await session.post("Debugger.resume"); } catch {
  // A data comparison can fail after its native callback has already resumed.
} port.postMessage({ error: error instanceof Error ? error.stack : String(error), reads, stageReads, pauses, resumed }); session.disconnect(); port.close(); }
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0]; const ids = event.params.hitBreakpoints ?? []; const role = ids[0] === undefined ? undefined : points.get(ids[0]); const expectedLocation = role === undefined ? undefined : POINTS[config.variant][role]; const fn = SOURCE[config.variant].rows.bboxTick;
  if (frame === undefined || role === undefined || expectedLocation === undefined || ids.length !== 1 || frame.location.scriptId !== config.scriptId || frame.location.lineNumber !== expectedLocation.lineNumber || frame.location.columnNumber !== expectedLocation.columnNumber || frame.functionLocation?.scriptId !== config.scriptId || frame.functionLocation.lineNumber !== fn.lineNumber || frame.functionLocation.columnNumber !== fn.columnNumber) { throw new Error("foreign bbox callback pause"); }
  pauses += 1; if (role === "caught") { throw new Error("original bbox caught failure"); }
  if (role === "entry") {
    tick += 1;
    if (tick === 1) { current = await run(new CurrentSchematicWireBboxCursor({ role, tick: 1, frame: frame.callFrameId, holder: need("holder"), native: need("native"), action: need("action") })); }
    else if (tick === 2 && returnedFirst !== null) { const first = await run(new CurrentSchematicWireBboxCursor({ role: "settled", previous: returnedFirst })); copies(first); current = await run(new CurrentSchematicWireBboxCursor({ role, tick: 2, frame: frame.callFrameId, previous: first })); }
    else { throw new Error("extra bbox callback"); }
    copies(current);
  } else {
    if (current === null || frame.returnValue?.type !== "undefined" || Object.keys(frame.returnValue).length !== 1) { throw new Error("missing original bbox ordinary return"); }
    current = await run(new CurrentSchematicWireBboxCursor({ role, frame: frame.callFrameId, previous: current })); copies(current); if (tick === 1) { returnedFirst = current; }
  }
  await session.post("Debugger.resume"); resumed += 1;
  if (role === "returned" && tick === 2) {
    if (current === null) { throw new Error("missing second return"); }
    const last = await run(new CurrentSchematicWireBboxCursor({ role: "settled", previous: current }));
    if (!last.twoTickSequenceCompared || !last.samePromiseFulfilledCompared || last.bboxComplete || last.rTreeComplete || last.derivedMarkersComplete || last.saveAuthorized || helpers.size !== 6 || expected.length !== 6) { throw new Error("bbox comparison authority"); }
    let replay = false; try { const cursor = new CurrentSchematicWireBboxCursor({ role: "settled", previous: current }); cursor.next(); } catch { replay = true; } if (!replay) { throw new Error("bbox return replayed"); }
    const actual: string[] = []; for (const scriptId of helpers) { const source = await session.post("Debugger.getScriptSource", { scriptId }); actual.push(source.scriptSource); } if (JSON.stringify(actual.toSorted()) !== JSON.stringify(expected.toSorted())) { throw new Error("bbox helper scripts"); }
    port.postMessage({ complete: true, reads, stageReads, pauses, resumed, helpers: helpers.size }); session.disconnect(); port.close();
  }
})().catch(fail); });
void (async (): Promise<void> => {
  await session.post("Debugger.enable"); observing = true;
  for (const key of ["holder", "native", "action"]) { const selected = await session.post("Runtime.evaluate", { expression: `globalThis.${config.key}.${key}` }); if (selected.result.objectId === undefined || selected.exceptionDetails !== undefined) { throw new Error("fixture selector"); } refs.set(key, selected.result.objectId); }
  for (const role of ["entry", "caught", "returned"] as const) {
    const point = POINTS[config.variant][role]; const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: config.scriptId, ...point }, end: { scriptId: config.scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber + 1 }, restrictToFunction: true }); if (possible.locations.length !== 1 || possible.locations[0]?.lineNumber !== point.lineNumber || possible.locations[0].columnNumber !== point.columnNumber || role === "returned" && possible.locations[0].type !== "return") { throw new Error("bbox point mismatch"); }
    const armed = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(await post("Debugger.setBreakpoint", { location: { scriptId: config.scriptId, ...point }, condition: "" })); points.set(armed.breakpointId, role);
  } port.postMessage({ ready: true });
})().catch(fail);
