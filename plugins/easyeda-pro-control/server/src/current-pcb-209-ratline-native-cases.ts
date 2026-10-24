/** Finite native syntax for the two original ratline parent realms. These
 * templates issue no source, session, target, lifecycle or budget authority. */
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES as CREATION, CURRENT_PCB_209_RATLINE_CREATION_GROUP as CREATION_GROUP } from "./current-pcb-209-ratline-creation-profile.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES as CAPTURE, CURRENT_PCB_209_RATLINE_CAPTURE_GROUP as CAPTURE_GROUP } from "./current-pcb-209-ratline-capture-profile.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS as PROGRAMS } from "./current-pcb-209-ratline-capture-program.ts";
import type { CurrentPcb209RatlineBootstrapCommand } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcb209RatlineRealmCommand } from "./current-pcb-209-ratline-event-dispatcher.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcb209RatlineNativeRole = "pcb" | "worker";
export type CurrentPcb209RatlineNativeCommand = CurrentPcb209RatlineRealmCommand | CurrentPcb209RatlineBootstrapCommand;
export interface CurrentPcb209RatlineNativeCase {
  readonly role: CurrentPcb209RatlineNativeRole;
  readonly phase: string;
  readonly command: CurrentPcb209RatlineNativeCommand;
}
export const currentPcb209RatlineNativePlaceholder = (name: string): string => `__ratline209_${name}__`;
const placeholder = currentPcb209RatlineNativePlaceholder;
const callFrameId = placeholder("callFrameId"), objectId = placeholder("objectId"), scriptId = placeholder("scriptId"), sessionId = placeholder("sessionId");
const cases: CurrentPcb209RatlineNativeCase[] = [];
const common = { silent: true, throwOnSideEffect: true, generatePreview: false } as const;
for (const role of ["pcb", "worker"] as const) {
  const put = (phase: string, command: CurrentPcb209RatlineNativeCommand): void => { cases.push({ role, phase, command }); };
  put("targets", { method: "Target.getTargets", params: {} });
  put("remove", { method: "Debugger.removeBreakpoint", sessionId, params: { breakpointId: placeholder("breakpointId") } });
  put("resume", { method: "Debugger.resume", sessionId, params: {} });
  put("start-child", { method: "Runtime.runIfWaitingForDebugger", sessionId, params: {} });
  put("bootstrap-auto-attach", { method: "Target.setAutoAttach", sessionId, params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  put("bootstrap-runtime", { method: "Runtime.enable", sessionId, params: {} });
  put("bootstrap-debugger", { method: "Debugger.enable", sessionId, params: { maxScriptsCacheSize: 33_554_432 } });
  put("bootstrap-instrument", { method: "Debugger.setInstrumentationBreakpoint", sessionId, params: { instrumentation: "beforeScriptExecution" } });
  put("bootstrap-source", { method: "Debugger.getScriptSource", sessionId, params: { scriptId } });
  for (const site of ["before", "after"] as const) {
    const point = CREATION[role][site];
    put(`creation-${site}`, { method: "Debugger.setBreakpoint", sessionId,
      params: { location: { scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber } } });
  }
  for (const [name, returnByValue] of [["url", true], ["name", true], ["worker", false], ["this", false]] as const) {
    const expression = name === "this" ? "this" : CREATION[role][name];
    put(`creation-${name}`, { method: "Debugger.evaluateOnCallFrame", sessionId,
      params: { ...common, callFrameId, expression, returnByValue, objectGroup: CREATION_GROUP, includeCommandLineAPI: false } });
  }
  const sites: Readonly<Record<string, Readonly<{ lineNumber: number; columnNumber: number }>>> = CAPTURE[role].sites;
  for (const [site, point] of Object.entries(sites)) {
    put(`capture-${site}`, { method: "Debugger.setBreakpoint", sessionId,
      params: { location: { scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber } } });
  }
  // These expression/value pairs are the actual runner paths. Type unions alone
  // Include unused names and do not establish a native dispatch contract.
  const objects = role === "pcb" ? ["this", "t", "o"] as const : ["this", "e", "t", "self", "_", "O", "y", "l", "h", "o", "c", "iY"] as const;
  const values = role === "pcb" ? ["i"] as const : ["t", "u", "f"] as const;
  for (const expression of objects) {
    put(`object-${expression}`, { method: "Debugger.evaluateOnCallFrame", sessionId,
      params: { ...common, callFrameId, expression, objectGroup: CAPTURE_GROUP, returnByValue: false, includeCommandLineAPI: false } });
  }
  for (const expression of values) {
    put(`value-${expression}`, { method: "Debugger.evaluateOnCallFrame", sessionId,
      params: { ...common, callFrameId, expression, objectGroup: CAPTURE_GROUP, returnByValue: true, includeCommandLineAPI: false } });
  }
  const programs = role === "pcb" ? ["same", "bridge", "factory", "removed", "payload"] as const :
    ["same", "bridge", "factory", "removed", "name", "world", "canvas", "empty"] as const;
  const arity = { same: 1, bridge: 2, factory: 3, removed: 0, payload: 0, name: 0, world: 0, canvas: 2, empty: 0 } as const;
  for (const name of programs) {
    put(`relation-${name}`, { method: "Runtime.callFunctionOn", sessionId, params: { ...common, objectId,
      functionDeclaration: PROGRAMS[name], arguments: Array.from({ length: arity[name] }, (_, index) => ({ objectId: placeholder(`argument${String(index)}`) })),
      objectGroup: CAPTURE_GROUP, returnByValue: true, awaitPromise: false, userGesture: false } });
  }
}
export const CURRENT_PCB_209_RATLINE_NATIVE_CASES: readonly CurrentPcb209RatlineNativeCase[] = freezeDeep(cases);
