/** Separate private startup vocabulary. It does not broaden diagnostic owners,
 * accept caller CDP or grant construction/Save authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbWorkerStartupUiActorCommand } from "./current-pcb-worker-startup-actor.ts";

export const CURRENT_PCB_WORKER_STARTUP_ATTACH = freezeDeep({ autoAttach: true,
  waitForDebuggerOnStart: true, flatten: true,
  filter: [{ type: "worker", exclude: false }, { exclude: true }],
} as const);
export type CurrentPcbWorkerStartupParentCommand =
  | CurrentPcbWorkerStartupUiActorCommand
  | Readonly<{ method: "Target.getTargets"; params: Readonly<Record<string, never>>; sessionId?: never }>
  | (Readonly<{ sessionId: string }> & (
    | Readonly<{ method: "Page.getFrameTree"; params: Readonly<Record<string, never>> }>
    | Readonly<{ method: "DOM.getFrameOwner"; params: Readonly<{ frameId: string }> }>
    | Readonly<{ method: "DOM.describeNode"; params: Readonly<{ backendNodeId: number; depth: 0; pierce: false }> }>
    | Readonly<{ method: "Runtime.callFunctionOn"; params: Readonly<{
      functionDeclaration: typeof CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION; uniqueContextId: string;
      arguments: readonly [Readonly<{ value: CurrentDisposableOpenSealedTarget }>, Readonly<{ value: "preflight" | "open-project" }>];
      returnByValue: true; awaitPromise: true; silent: true; generatePreview: false; userGesture: false; throwOnSideEffect: false;
    }> }>
  ));
export type CurrentPcbWorkerStartupWorkerCommand = (
  | Readonly<{ method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_WORKER_STARTUP_ATTACH }>
  | Readonly<{ method: "Runtime.enable" | "Runtime.runIfWaitingForDebugger"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.enable"; params: Readonly<{ maxScriptsCacheSize: 33_554_432 }> }>
  | Readonly<{ method: "Debugger.setInstrumentationBreakpoint"; params: Readonly<{ instrumentation: "beforeScriptExecution" }> }>
  | Readonly<{ method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | CurrentPcbWorkerConstructionCommand
) & Readonly<{ sessionId: string }>;
export type CurrentPcbWorkerStartupCommand = CurrentPcbWorkerStartupParentCommand | CurrentPcbWorkerStartupWorkerCommand;

export interface CurrentPcbWorkerStartupEvent {
  readonly method: string;
  readonly sessionId: string;
  readonly params: Readonly<Record<string, unknown>>;
}
/** Retain these original methods before any allocation. The native dependency
 * must bind requests/events to the same retained process, Job and pipe. */
export interface CurrentPcbWorkerStartupDependency {
  readonly parentTargetId: string;
  readonly parentSessionId: string;
  readonly assertOriginalOwner: () => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly request: (command: CurrentPcbWorkerStartupCommand) => Promise<unknown>;
  readonly subscribe: (event: (value: CurrentPcbWorkerStartupEvent) => void) => () => void;
}
