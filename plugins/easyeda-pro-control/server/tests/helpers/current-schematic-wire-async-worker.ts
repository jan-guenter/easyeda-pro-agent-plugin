/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- One original Inspector worker retains the held entry, caller and subsequent async replies. */
import { Session } from "node:inspector/promises";
import { once } from "node:events";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireAsyncCursor } from "../../src/current-schematic-wire-async-cursor.ts";
import type { CurrentSchematicWireAsyncData } from "../../src/current-schematic-wire-async-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as SOURCE } from "../../src/current-schematic-wire-async-source.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_PROGRAMS as PROGRAMS } from "../../src/current-schematic-wire-async-programs.ts";

const config = z.strictObject({ key: z.string().regex(/^[A-Za-z\d_]+$/u), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]), mode: z.enum(["complete", "exhaust", "coalesced"]), treeRole: z.enum(["objectContent", "pageContent", "netContent", "symbolContent"]), deferred: z.boolean() }).parse(workerData);
const port = parentPort ?? (() : never => { throw new Error("worker port"); })();
const session = new Session(); session.connectToMainThread(); let observing = false; const helpers = new Set<string>(); const expected: string[] = []; const refs = new Map<string, string>(); const points = new Map<string, "entry" | "target" | "continuation">(); const stageReads: number[] = []; let before: CurrentSchematicWireAsyncData | null = null; let target: CurrentSchematicWireAsyncData | null = null; let continuation: CurrentSchematicWireAsyncData | null = null; let pauses = 0; let resumed = 0; let reads = 0;
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && Object.values(PROGRAMS).some(program => event.params.length === program.length + 2)) { helpers.add(event.params.scriptId); } });
const need = (key: string): string => { const value = refs.get(key); if (value === undefined) { throw new Error("missing original selector"); } return value; };
async function post(method: string, params: unknown): Promise<unknown> {
  if (method === "Runtime.callFunctionOn" && params !== null && typeof params === "object") { const fn: unknown = Reflect.get(params, "functionDeclaration"); if (typeof fn !== "string") { throw new TypeError("helper"); } expected.push(`(${fn})`); }
  const pending: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); const result: unknown = await pending;
  if (result !== null && typeof result === "object" && "exceptionDetails" in result) { throw new Error(JSON.stringify({ method, result })); } return result;
}
async function run(cursor: CurrentSchematicWireAsyncCursor): Promise<CurrentSchematicWireAsyncData> {
  const initial = reads;
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); reads += 1; cursor.accept(command, await post(command.method, command.params)); }
  stageReads.push(reads - initial); return cursor.requireCompleted();
}
function copied(previous: CurrentSchematicWireAsyncData, role: "target" | "continuation" | "settled"): void {
  let refused = false; try { const cursor = new CurrentSchematicWireAsyncCursor(role === "settled" ? { role, previous: structuredClone(previous) } : { role, frame: "original", previous: structuredClone(previous) }); cursor.next(); } catch { refused = true; } if (!refused) { throw new Error("copied comparison admitted"); }
}
async function sources(): Promise<void> {
  const actual: string[] = []; for (const scriptId of helpers) { const source = await session.post("Debugger.getScriptSource", { scriptId }); actual.push(source.scriptSource); }
  if (helpers.size !== expected.length || JSON.stringify(actual.toSorted()) !== JSON.stringify(expected.toSorted())) { throw new Error("async helper source mismatch"); }
}
async function fail(error: unknown): Promise<void> { try { await session.post("Debugger.resume"); } catch {
  // A bounded refusal can occur after the last original held pause.
} port.postMessage({ error: error instanceof Error ? error.stack : String(error), reads, stageReads, pauses, resumed, helpers: helpers.size }); session.disconnect(); port.close(); }
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0]; const ids = event.params.hitBreakpoints ?? []; const role = ids[0] === undefined ? undefined : points.get(ids[0]);
  if (frame === undefined || role === undefined || ids.length !== 1 || frame.location.scriptId !== config.scriptId) { throw new Error("foreign async pause"); }
  pauses += 1;
  if (role === "entry") {
    before = await run(new CurrentSchematicWireAsyncCursor({ role, frame: frame.callFrameId, holder: need("holder"), native: need("native"), ast: need("ast"), tree: need("tree"), wrapper: need("wrapper"), scriptId: config.scriptId, variant: config.variant, treeRole: config.treeRole }));
    copied(before, "target");
    const arm = z.strictObject({ breakpointId: z.string() }).parse(await post("Debugger.setBreakpointOnFunctionCall", { objectId: before.targetFunction, condition: "" })); points.set(arm.breakpointId, "target");
  } else if (role === "target") {
    if (before === null) { throw new Error("missing wrapper entry"); }
    const targetSite = SOURCE[config.variant].rows[config.treeRole];
    if (frame.functionLocation === undefined || frame.functionLocation.scriptId !== config.scriptId || frame.functionLocation.lineNumber !== targetSite.lineNumber || frame.functionLocation.columnNumber !== targetSite.columnNumber) { throw new Error("foreign target entry"); }
    target = await run(new CurrentSchematicWireAsyncCursor({ role, frame: frame.callFrameId, previous: before })); copied(target, "continuation");
  } else {
    if (target === null) { throw new Error("missing entry"); }
    const site = SOURCE[config.variant].continuation; if (frame.location.lineNumber !== site.lineNumber || frame.location.columnNumber !== site.columnNumber) { throw new Error("wrong original caller location"); }
    continuation = await run(new CurrentSchematicWireAsyncCursor({ role, frame: frame.callFrameId, previous: target })); copied(continuation, "settled");
    let replay = false; try { const cursor = new CurrentSchematicWireAsyncCursor({ role: "target", frame: frame.callFrameId, previous: before ?? (() : never => { throw new Error("missing entry"); })() }); cursor.next(); } catch { replay = true; } if (!replay) { throw new Error("entry replayed"); }
  }
  await session.post("Debugger.removeBreakpoint", { breakpointId: ids[0] ?? "" }); await session.post("Debugger.resume"); resumed += 1;
  if (role === "continuation") { port.postMessage({ childPending: true }); }
})().catch(fail); });
port.on("message", (value: unknown) => { void (async (): Promise<void> => {
  const message = z.union([z.strictObject({ settle: z.literal(true) }), z.strictObject({ released: z.literal(true) })]).parse(value); if ("released" in message) { return; } if (!message.settle || continuation === null) { throw new Error("missing continuation"); }
  const cursor = new CurrentSchematicWireAsyncCursor({ role: "settled", previous: continuation }); const initial = reads; let pendingObserved = false;
  for (let command = cursor.next(); command !== null; command = cursor.next()) {
    cursor.reserve(command); reads += 1; const raw = await post(command.method, command.params); cursor.accept(command, raw);
    if (!pendingObserved && config.deferred && config.mode !== "exhaust") { pendingObserved = true; port.postMessage({ pendingAfterParent: true }); await once(port, "message"); }
  }
  const data = cursor.requireCompleted(); stageReads.push(reads - initial);
  if (!data.samePromiseFulfilledCompared || !data.originalCallerReturnCompared || data.asynchronousPublicationComplete || data.saveAuthorized) { throw new Error("async data authority"); }
  let replay = false; try { const replayCursor = new CurrentSchematicWireAsyncCursor({ role: "settled", previous: continuation }); replayCursor.next(); } catch { replay = true; } if (!replay) { throw new Error("continuation replayed"); }
  await sources(); port.postMessage({ complete: true, reads, stageReads, pauses, resumed, helpers: helpers.size }); session.disconnect(); port.close();
})().catch(fail); });
void (async (): Promise<void> => {
  await session.post("Debugger.enable"); observing = true;
  for (const key of ["holder", "native", "ast", "tree", "wrapper"]) { const selected = await session.post("Runtime.evaluate", { expression: `globalThis.${config.key}.${key}` }); if (selected.exceptionDetails !== undefined || selected.result.objectId === undefined) { throw new Error("selector"); } refs.set(key, selected.result.objectId); }
  const site = SOURCE[config.variant].continuation; const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: config.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, end: { scriptId: config.scriptId, lineNumber: site.lineNumber, columnNumber: site.endColumnNumber }, restrictToFunction: true }); if (possible.locations.length !== 1 || possible.locations[0]?.type !== "call") { throw new Error("original continuation site"); }
  const location = possible.locations[0]; if (location === undefined || location.columnNumber !== site.columnNumber) { throw new Error("relocated caller"); }
  const caller = z.strictObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(await post("Debugger.setBreakpoint", { location, condition: "" })); points.set(caller.breakpointId, "continuation");
  const first = z.strictObject({ breakpointId: z.string() }).parse(await post("Debugger.setBreakpointOnFunctionCall", { objectId: need("wrapper"), condition: "" })); points.set(first.breakpointId, "entry"); port.postMessage({ ready: true });
})().catch(fail);
