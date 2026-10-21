/** Fixed pre-create observations. No write or caller program. */
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION, CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION } from "./current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION } from "./current-pcb-string-empty-producers.ts";

// 49 UI/project/PCB qualification +12 worker qualification +6 scope acquisition
// +22 constructor-bundle/source checks +2*(7 observations +4 target/frame
// Reproofs) +1 original-group release +18 separately consumed common-baseline
// Requests +4 original target/frame reproofs +21 bound-teardrop-owner checks.
// Observations, not a writer budget.
export const CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT = 155;
export const CURRENT_PCB_STRING_PRECREATE_PHASES = ["renderer-association", "worker-association", "empty-producers"] as const;
export type CurrentPcbStringPrecreatePhase = typeof CURRENT_PCB_STRING_PRECREATE_PHASES[number];
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const);
export type CurrentPcbStringPrecreateCommand =
  | Readonly<{ stringPhase: "renderer-association"; method: "Runtime.callFunctionOn"; params:
    typeof EFFECTS & Readonly<{ objectId: string; functionDeclaration: string; returnByValue: true;
      arguments: readonly [Readonly<{ objectId: string }>]; }> }>
  | Readonly<{ stringPhase: "empty-producers"; method: "Runtime.callFunctionOn"; params:
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
export function currentPcbStringScopeCommand(phase: "empty-producers", scope: string, callbackHandle: string, constructors: string): CurrentPcbStringPrecreateCommand;
export function currentPcbStringScopeCommand(phase: "renderer-association" | "empty-producers", scope: string,
  callbackHandle: string, constructors?: string): CurrentPcbStringPrecreateCommand {
  const argument = Object.freeze({ objectId: checked(callbackHandle) });
  if (phase === "empty-producers") {
    if (constructors === undefined) { throw new Error("PCB_STRING_PRECREATE_HANDLE"); }
    const constructorArgument = Object.freeze({ objectId: checked(constructors) });
    const argumentsList = Object.freeze([argument, constructorArgument] as const);
    return Object.freeze({ stringPhase: phase, method: "Runtime.callFunctionOn", params: Object.freeze({ ...EFFECTS,
      objectId: checked(scope), functionDeclaration: CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, returnByValue: true,
      arguments: argumentsList }) });
  }
  if (constructors !== undefined) { throw new Error("PCB_STRING_PRECREATE_HANDLE"); }
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
