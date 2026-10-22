/** Separate private startup vocabulary. It does not broaden diagnostic owners,
 * accept caller CDP or grant construction/Save authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";

export const CURRENT_PCB_WORKER_STARTUP_ATTACH = freezeDeep({ autoAttach: true,
  waitForDebuggerOnStart: true, flatten: true,
  filter: [{ type: "worker", exclude: false }, { exclude: true }],
} as const);
export type CurrentPcbWorkerStartupCommand = (
  | Readonly<{ method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_WORKER_STARTUP_ATTACH }>
  | Readonly<{ method: "Runtime.enable" | "Runtime.runIfWaitingForDebugger"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.enable"; params: Readonly<{ maxScriptsCacheSize: 33_554_432 }> }>
  | Readonly<{ method: "Debugger.setInstrumentationBreakpoint"; params: Readonly<{ instrumentation: "beforeScriptExecution" }> }>
  | Readonly<{ method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | CurrentPcbWorkerConstructionCommand
) & Readonly<{ sessionId: string }>;

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
