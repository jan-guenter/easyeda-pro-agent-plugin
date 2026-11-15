/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- One original worker port retains actual callback-entry pauses and asynchronous Inspector calls. */
/** Original function entries run only against the explicitly inert fixture. */
import { Session } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireFrontierEntryCursor, CurrentSchematicWireFrontierMetadataCursor } from "../../src/current-schematic-wire-frontier-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_FRONTIER_PROGRAMS as PROGRAMS } from "../../src/current-schematic-wire-frontier-protocol.ts";
import type { CurrentSchematicWireFrontierEntryRole as Role } from "../../src/current-schematic-wire-frontier-protocol.ts";

const config = z.strictObject({ key: z.string().regex(/^[A-Za-z\d_]+$/u), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]) }).parse(workerData);
const port = parentPort; if (port === null) { throw new Error("worker port"); } port.on("message", () => {
  // Keep the original test port alive through the held entries.
});
const session = new Session(); session.connectToMainThread();
let observing = false; const helpers = new Set<string>(); const expected: string[] = [];
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && Object.values(PROGRAMS).some(program => event.params.length === program.length + 2)) { helpers.add(event.params.scriptId); } });
async function post(method: string, params: unknown): Promise<unknown> {
  if (method === "Runtime.callFunctionOn" && params !== null && typeof params === "object") { const declaration: unknown = Reflect.get(params, "functionDeclaration"); if (typeof declaration !== "string") { throw new TypeError("helper"); } expected.push(`(${declaration})`); }
  const value: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); return await value;
}
const points = new Map<string, Role>(); let holder: string | null = null; let native: string | null = null; let roots: string | null = null; let reads = 0; let metadataReads = 0; let pauses = 0;
async function collect<T extends { method: string; params: unknown }>(cursor: { next: () => T | null; reserve: (command: T) => void; accept: (command: T, raw: unknown) => void }): Promise<void> {
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); cursor.accept(command, await post(command.method, command.params)); reads += 1; }
}
const fail = async (error: unknown): Promise<void> => {
  try { await session.post("Debugger.resume"); } catch {
    // Setup may not have a held callback.
  }
  port.postMessage({ error: error instanceof Error ? error.stack : String(error) }); session.disconnect(); port.close();
};
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const frame = event.params.callFrames[0], ids = event.params.hitBreakpoints ?? [];
  if (frame === undefined || ids.length !== 1 || holder === null || native === null || roots === null) { throw new Error("unexpected frontier pause"); }
  const id = ids[0], role = id === undefined ? undefined : points.get(id); if (id === undefined || role === undefined) { throw new Error("foreign frontier point"); }
  const cursor = new CurrentSchematicWireFrontierEntryCursor(role, frame.callFrameId, holder, native, roots); await collect(cursor); cursor.requireCompleted(); pauses += 1;
  await session.post("Debugger.removeBreakpoint", { breakpointId: id });
  if (pauses === 7) {
    if (helpers.size !== 8 || expected.length !== 8) { throw new Error("frontier helper roster"); }
    const actual: string[] = []; for (const scriptId of helpers) { const source = await session.post("Debugger.getScriptSource", { scriptId }); actual.push(source.scriptSource); }
    if (JSON.stringify(actual.toSorted()) !== JSON.stringify(expected.toSorted())) { throw new Error("frontier helper sources"); }
  }
  await session.post("Debugger.resume");
  if (pauses === 7) { port.postMessage({ reads, metadataReads, pauses, resumed: pauses, helpers: helpers.size }); session.disconnect(); port.close(); }
})().catch(fail); });
void (async (): Promise<void> => {
  await session.post("Debugger.enable"); observing = true;
  const select = async (field: string): Promise<string> => { const value = await session.post("Runtime.evaluate", { expression: `globalThis.${config.key}.${field}` }); if (value.exceptionDetails !== undefined || value.result.objectId === undefined) { throw new Error("fixture selector"); } return value.result.objectId; };
  holder = await select("holder"); native = await select("native");
  const cursor = new CurrentSchematicWireFrontierMetadataCursor(holder, native, config.scriptId, config.variant); await collect(cursor); const data = cursor.requireCompleted(); roots = data.roots; metadataReads = reads;
  for (const role of ["historyStart", "historyBusStart", "historyStackWillRecord", "historyWillEnd", "historyEnd", "historyBusEnd", "netPointUpdate"] as const) {
    const raw: unknown = await post("Debugger.setBreakpointOnFunctionCall", { objectId: data.functions[role], condition: "" });
    const breakpoint = z.strictObject({ breakpointId: z.string() }).parse(raw); points.set(breakpoint.breakpointId, role);
  }
  port.postMessage({ ready: true });
})().catch(fail);
