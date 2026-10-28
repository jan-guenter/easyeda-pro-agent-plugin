/** Private execution-purpose vocabulary. No caller nonce, expression or replay
 * permission crosses the MCP boundary. Parent capture/child bootstrap are owned
 * by the native execution channel, not recreated from these handle strings. */
import type { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_PROGRAMS as PROGRAMS } from "./current-footprint-copy-parent-worker-programs.ts";

export type CurrentFootprintParentWorkerPhase = keyof typeof PROGRAMS;
export const CURRENT_FOOTPRINT_PARENT_WORKER_REQUESTS = Object.freeze({ observe: 16, reprove: 2, managerJoin: 1, cleanup: 3 });
/** Bootstrap retains its separate native startup budget. These fixed caps bound
 * the diagnostic's own awaits and do not promise nested worst cases all fit. */
export const CURRENT_FOOTPRINT_PARENT_WORKER_LIMITS = Object.freeze({ requestMs: 2000, ownerCheckMs: 10_000, bootstrapMs: 300_000 });
export type CurrentFootprintParentWorkerCommand =
  | Readonly<{ phase: "properties"; method: "Runtime.getProperties"; sessionId: string;
    params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; sessionId: string; params: Readonly<{ objectGroup: typeof GROUP }> }>
  | Readonly<{ phase: CurrentFootprintParentWorkerPhase; method: "Runtime.callFunctionOn"; sessionId: string;
    params: Readonly<{ objectId?: string; uniqueContextId?: string; functionDeclaration: typeof PROGRAMS[CurrentFootprintParentWorkerPhase];
      arguments: readonly Readonly<{ value: string } | { objectId: string }>[]; objectGroup: typeof GROUP;
      returnByValue: boolean; awaitPromise: boolean; silent: true; generatePreview: false; userGesture: false; throwOnSideEffect: boolean }> }>;
export interface CurrentFootprintParentWorkerBinding {
  readonly parentSessionId: string;
  readonly parentUniqueContextId: string;
  readonly projectObjectId: string;
  readonly childSessionId: string;
  readonly childUniqueContextId: string;
  readonly childTargetId: string;
}
export interface CurrentFootprintParentWorkerTransport {
  /** Original native owner checks the retained parent pause, original one-shot
   * open, exactly one startup-held child, qualified contexts and no imports yet.
   * During bootstrap-idle parent still cannot create its bus or openProject RPC.
   * After peer-proved the parent may resume once; retained identities still bind.
   * A new/unknown child always refuses and remains held for generation cleanup. */
  readonly assertOriginalState: (stage: "before-imports" | "bootstrap-idle" | "peer-proved") => Promise<void>;
  readonly request: (command: CurrentFootprintParentWorkerCommand) => Promise<unknown>;
  /** Runs only the qualified bootstrap and initial constructors to an idle event
   * loop. Does not wait for project-open/assignment/actor state needing parent RPC. */
  readonly advanceOriginalChildBootstrap: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
}
