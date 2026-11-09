/* oxlint-disable import/max-dependencies -- Fixed native grammar, source callees, actual stack parser and descriptor-safe tuple receipts are independently qualified. */
/** Continue only the original readonly GET prefix to three genuine live
 * entries. Actual body permission remains the original Core's next join. */
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskCompletionLiveHints as Hints } from "./current-footprint-inverse-native-get-task-completion-observer.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_COMPLETION_FLAGS as FLAGS, currentFootprintInverseNativeGetTaskCompletionProgram as program, validateCurrentFootprintInverseNativeGetTaskCompletionCommand as validate } from "./current-footprint-inverse-native-get-task-completion-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskCompletionCommand as Command } from "./current-footprint-inverse-native-get-task-completion-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-native-get-task-completion-live-programs.ts";
import { currentFootprintInverseNativeGetTaskCompletionLiveFrame as frame } from "./current-footprint-inverse-native-get-task-completion-live-replies.ts";
import type { CurrentFootprintInverseNativeGetTaskCompletionLiveRole as Role } from "./current-footprint-inverse-native-get-task-completion-live-replies.ts";
import { currentFootprintInverseGetCallable as callable, qualifyCurrentFootprintInverseGetFunction as metadata } from "./current-footprint-inverse-get-source.ts";
import { currentFootprintInverseLookupPoint as point } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintInverseDeleteRpcTrue as truth } from "./current-footprint-inverse-delete-rpc-protocol.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { z } from "zod";

interface Bindings {
  readonly source: string; readonly scriptId: string; readonly sessionId: string; readonly intrinsics: string; readonly hints: Hints;
  readonly current: () => void; readonly assertOriginalEntryHeld: () => void; readonly assertOriginalEvent: (event: DiagnosticEvent) => void;
  readonly request: (command: Command) => Promise<unknown>; readonly qualifyHelper: (command: Command, raw: unknown) => Promise<void>;
  readonly requireOriginalResumed: () => Promise<void>; readonly nextOriginalPause: (role: Role, point: string) => Promise<DiagnosticEvent>;
  /** These acknowledgements retain the existing original native envelope;
   * matching caller fields cannot register a function, point or body permit. */
  readonly control: (phase: "live-functions" | "live-point" | "live-permit" | "live-held" | "live-proof" | "live-complete", fields?: Readonly<Record<string, string>>) => Promise<void>;
}
export interface CurrentFootprintInverseNativeGetTaskCompletionLiveReceipt { readonly roots: string; readonly requests: 33; readonly helpers: 8; readonly resumes: 3; readonly getBodyAuthorized: false; readonly suppliedObservationsOnly: true }
const empty = z.strictObject({});
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_SEQUENCE"); } }
/** Qualify original callees before arming them, then use fresh getData/get/Ne
 * operands to join the actual receiver/model, Ne/Oe/JSON and Fe/console. The
 * prefix stays at Ne entry; no scope mirror authorizes its remaining body. */
export async function collectCurrentFootprintInverseNativeGetTaskCompletionLive(b: Bindings): Promise<Readonly<CurrentFootprintInverseNativeGetTaskCompletionLiveReceipt>> {
  b.current(); b.assertOriginalEntryHeld(); let requests = 0; let helpers = 0;
  /** Burn before transport and require this same original helper receipt
   * before a later request can inspect or use any returned opaque value. */
  const send = async (input: Command): Promise<unknown> => { b.current(); const command = validate(input); need((requests += 1) <= 33); const raw = await b.request(command); b.current(); if (program(command) !== null) { need((helpers += 1) <= 8 && (requests += 1) <= 33); await b.qualifyHelper(command, raw); b.current(); } return raw; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "inverse-native-get-task-completion-live-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  /** Choose one fixed helper and original references, with no scalar source
   * selector, caller expression or alternate application invocation. */
  const call = (role: keyof typeof CALLS, refs: readonly string[]): Promise<unknown> => { const row = CALLS[role]; return send(validate({ phase: "inverse-native-get-task-completion-live-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.intrinsics, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue } })); };
  const roots = result(await call("roots", [b.hints.input, b.hints.lexical, b.hints.values, b.hints.methods]), 16); const values = array(await props(roots), 16); const functions: Record<Role, string> = { data: "", row: "", title: "" };
  for (const [role, slot, sourceRole] of [["data", 7, "getData"], ["row", 8, "get"], ["title", 9, "normalizeTitle"]] as const) { const selected = values.get(String(slot)); const id = callable({ result: selected }, sourceRole); metadata(await props(id), sourceRole, b.scriptId, b.source); functions[role] = id; }
  await b.control("live-functions", functions); b.current(); const points = new Map<Role, string>();
  for (const role of ["data", "row", "title"] as const) { const id = point(await send(validate({ phase: "inverse-native-get-task-completion-live-arm", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: functions[role], condition: "" } }))); need(![...points.values()].includes(id)); points.set(role, id); await b.control("live-point", { role, breakpointId: id }); b.current(); }
  b.current(); b.assertOriginalEntryHeld(); await b.control("live-permit"); b.current();
  /** Read only the declared live tuple. Unknown members remain opaque until
   * fixed equality with the already qualified original comparison roots. */
  const project = async (role: keyof typeof EXPRESSIONS, callFrameId: string, size: number): Promise<string> => { const id = result(await send(validate({ phase: "inverse-native-get-task-completion-live-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: EXPRESSIONS[role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), size); array(await props(id), size); return id; };
  for (const role of ["data", "row", "title"] as const) { const selected = points.get(role); need(selected !== undefined); const command = validate({ phase: "inverse-native-get-task-completion-live-resume", role, method: "Debugger.resume", params: {} }); const resumed = capture(await send(command)); empty.parse(resumed); await b.requireOriginalResumed(); b.current(); const event = await b.nextOriginalPause(role, selected); b.current(); b.assertOriginalEvent(event); const held = frame(event, role, b.sessionId, b.scriptId, selected); await b.control("live-held", { role, breakpointId: selected }); b.current(); let size = 3; if (role === "data") { size = 2; } else if (role === "row") { size = 5; } const current = await project(role, held.frame, size);
    if (role === "title") { need(held.caller !== null); const caller = await project("caller", held.caller, 6); truth(await call("title", [current, caller, roots])); } else { truth(await call(role, [current, roots])); } await b.control("live-proof", { role }); b.current(); const removal = validate({ phase: "inverse-native-get-task-completion-live-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: selected } }); const removed = capture(await send(removal)); empty.parse(removed);
  }
  need(requests === 33 && helpers === 8); await b.control("live-complete"); b.current(); return Object.freeze({ roots, requests: 33, helpers: 8, resumes: 3, getBodyAuthorized: false, suppliedObservationsOnly: true });
}
