/** Fixed pre-create observations. No write or caller program. */
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION, CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION } from "./current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION } from "./current-pcb-string-empty-producers.ts";
import { CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION } from "./current-pcb-string-producer-markers.ts";

// 49 UI/project/PCB qualification +12 worker qualification +6 scope acquisition
// +22 constructor-bundle/source checks +2*(8 observations +4 target/frame
// Reproofs) +1 original-group release +18 separately consumed common-baseline
// Requests +4 original target/frame reproofs +21 bound-teardrop-owner checks.
// That precreate/common route is157 requests. The same action adds58 original
// Worker-producer requests,6 actor/clock samples and4 parent target/frame
// Reproofs:225 total. The original move/startup collector adds12, giving237.
// Observations, not a writer budget; diagnostic remains103.
export const CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT = 237;
export const CURRENT_PCB_STRING_PRECREATE_PHASES = Object.freeze(["renderer-association", "worker-association", "empty-producers",
  "empty-producers-v2", "producer-markers-v2"] as const);
export type CurrentPcbStringPrecreatePhase = typeof CURRENT_PCB_STRING_PRECREATE_PHASES[number];
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const);
const PRODUCER_PROGRAMS = Object.freeze({ "empty-producers": CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION,
  "empty-producers-v2": CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION, "producer-markers-v2": CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION });
export type CurrentPcbStringPrecreateCommand =
  | Readonly<{ stringPhase: "renderer-association"; method: "Runtime.callFunctionOn"; params:
    typeof EFFECTS & Readonly<{ objectId: string; functionDeclaration: string; returnByValue: true;
      arguments: readonly [Readonly<{ objectId: string }>]; }> }>
  | Readonly<{ stringPhase: "empty-producers" | "empty-producers-v2" | "producer-markers-v2"; method: "Runtime.callFunctionOn"; params:
    typeof EFFECTS & Readonly<{ objectId: string; functionDeclaration: string; returnByValue: true;
      arguments: readonly [Readonly<{ objectId: string }>, Readonly<{ objectId: string }>]; }> }>
  | Readonly<{ stringPhase: "worker-association"; method: "Runtime.evaluate"; params:
    typeof EFFECTS & Readonly<{ expression: string; uniqueContextId: string; returnByValue: true;
      includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false; timeout: 1000; }> }>;
function checked(value: string): string {
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { throw new Error("PCB_STRING_PRECREATE_HANDLE"); }
  return value;
}
export function currentPcbStringScopeCommand(phase: "renderer-association", scope: string, callbackHandle: string): CurrentPcbStringPrecreateCommand;
export function currentPcbStringScopeCommand(phase: "empty-producers" | "empty-producers-v2" | "producer-markers-v2", scope: string, callbackHandle: string, constructors: string): CurrentPcbStringPrecreateCommand;
export function currentPcbStringScopeCommand(phase: "renderer-association" | "empty-producers" | "empty-producers-v2" | "producer-markers-v2", scope: string,
  callbackHandle: string, constructors?: string): CurrentPcbStringPrecreateCommand {
  const argument = Object.freeze({ objectId: checked(callbackHandle) });
  if (phase === "empty-producers" || phase === "empty-producers-v2" || phase === "producer-markers-v2") {
    if (constructors === undefined) { throw new Error("PCB_STRING_PRECREATE_HANDLE"); }
    const constructorArgument = Object.freeze({ objectId: checked(constructors) });
    const argumentsList = Object.freeze([argument, constructorArgument] as const);
    return Object.freeze({ stringPhase: phase, method: "Runtime.callFunctionOn", params: Object.freeze({ ...EFFECTS,
      objectId: checked(scope), functionDeclaration: PRODUCER_PROGRAMS[phase], returnByValue: true,
      arguments: argumentsList }) });
  }
  if (phase !== "renderer-association" || constructors !== undefined) { throw new Error("PCB_STRING_PRECREATE_HANDLE"); }
  return Object.freeze({ stringPhase: phase, method: "Runtime.callFunctionOn", params: Object.freeze({
    ...EFFECTS, objectId: checked(scope),
    functionDeclaration: CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION,
    returnByValue: true, arguments: Object.freeze([argument] as const),
  }) });
}
export function currentPcbStringWorkerCommand(uniqueContextId: string): CurrentPcbStringPrecreateCommand {
  return Object.freeze({ stringPhase: "worker-association", method: "Runtime.evaluate", params: Object.freeze({
    ...EFFECTS, expression: CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION, uniqueContextId: checked(uniqueContextId),
    returnByValue: true, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false, timeout: 1000,
  }) });
}
