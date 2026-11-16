/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- Inspector event callbacks bridge the startup and two held pauses to an original parent worker port. */
/** Worker observes actual original function-entry pauses in the inert main VM.
 * Neither the worker nor cursor allocates an EasyEDA/native lifecycle. */
import { Session } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireRecordCursor, CurrentSchematicWireSetterCursor } from "../../src/current-schematic-wire-transition-cursor.ts";

const config = z.strictObject({ key: z.string().regex(/^[A-Za-z\d_]+$/u), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]) }).parse(workerData);
const port = parentPort; if (port === null) { throw new Error("worker port"); }
port.on("message", () => {
// Keep the original worker port alive through the held entry callbacks.
});
const session = new Session(); session.connectToMainThread();
async function post(method:string,params:unknown):Promise<unknown>{const pending:unknown=Reflect.apply(session.post.bind(session),session,[method,params]);return await pending;}
const id = async (expression: string): Promise<string> => { const out = await session.post("Runtime.evaluate", { expression: `globalThis.${  config.key  }.${  expression}` }); if (out.exceptionDetails !== undefined || out.result.objectId === undefined) { throw new Error("fixture selector"); } return out.result.objectId; };
let state: { holder: string; native: string; first: string; second: string; ast: string; setterBreakpoint: string; recordBreakpoint: string; tuple: string | null; pauses: number } | null = null;
const fail = async (error: unknown): Promise<void> => { try { await session.post("Debugger.resume"); } catch {
// The setup failure path may have no held invocation.
} port.postMessage({ error: error instanceof Error ? error.stack : String(error) }); session.disconnect(); port.close(); };
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  const actual = state; if (actual === null) { throw new Error("early pause"); }
  const frame = event.params.callFrames[0]; if (frame === undefined) { throw new Error("missing frame"); }
  actual.pauses += 1;
  const cursor = actual.tuple === null ? new CurrentSchematicWireSetterCursor(frame.callFrameId, actual.holder, actual.native, actual.first, actual.second) : new CurrentSchematicWireRecordCursor(frame.callFrameId, actual.holder, actual.native, actual.tuple, actual.ast, config.scriptId, config.variant);
  let reads = 0;
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); const raw: unknown = await post(command.method, command.params); cursor.accept(command, raw); reads += 1; }
  const result = cursor.requireCompleted(); if (reads !== 6) { throw new Error("finite entry count"); }
  if (result.schema === "private.schematic-wire-setter-operands-data.v1") {
    actual.tuple = result.tuple; await session.post("Debugger.removeBreakpoint", { breakpointId: actual.setterBreakpoint }); await session.post("Debugger.resume");
  } else {
    await session.post("Debugger.removeBreakpoint", { breakpointId: actual.recordBreakpoint }); await session.post("Debugger.resume"); port.postMessage({ data: result, reads: 12, pauses: actual.pauses, resumed: 2 }); session.disconnect(); port.close();
  }
})().catch(fail); });
void (async (): Promise<void> => {
  await session.post("Debugger.enable"); const holder = await id("holder");const native = await id("native");const first = await id("first");const second = await id("second");const ast = await id("refs.modifyAst");const setter = await id("refs.pointsSet");const record = await id("refs.modifyRecord");
  const breakpoint=z.strictObject({breakpointId:z.string()});const sb=breakpoint.parse(await post("Debugger.setBreakpointOnFunctionCall",{objectId:setter,condition:""}));const rb=breakpoint.parse(await post("Debugger.setBreakpointOnFunctionCall",{objectId:record,condition:""}));
  state = { holder, native, first, second, ast, setterBreakpoint: sb.breakpointId, recordBreakpoint: rb.breakpointId, tuple: null, pauses: 0 }; port.postMessage({ ready: true });
})().catch(fail);
