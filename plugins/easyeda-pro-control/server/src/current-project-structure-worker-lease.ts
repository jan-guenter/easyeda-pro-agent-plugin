/** Original construction custody only. Native purpose, command budgets, the
 * main POST/SQL join and complete closed SQL remain separate admission gates. */
import type { CurrentPcbWorkerConstructionCommand } from "./current-pcb-worker-construction-contract.ts";

export { requireCurrentProjectStructureWorkerLease } from "./current-pcb-worker-construction-runner.ts";

export interface CurrentProjectStructureWorkerLease {
  readonly profile: "private.current-project-structure-worker-lease.v1";
}
export interface CurrentProjectStructureWorkerEvents {
  readonly acceptsPause: (input: unknown) => boolean;
  readonly paused: (input: unknown) => void;
  readonly resumed: () => void;
  readonly lost: () => void;
}
export interface CurrentProjectStructureWorkerBinding {
  readonly issuer: object;
  readonly scriptId: string;
  readonly project: string;
  readonly uploadCallback: string;
  readonly structureCallback: string;
  readonly debounce: string;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
  readonly fail: () => void;
  /** Allocation custody runs on the original reply before caller deadlines or
   * post-reply reproof; it grants neither normal continuation nor owner reuse. */
  readonly request: (command: CurrentPcbWorkerConstructionCommand, cleanup?: boolean, retainAllocationReply?: (reply: unknown) => void) => Promise<unknown>;
  readonly freshScopes: () => Promise<Readonly<{ upload: string; structure: string; debounce: string; debounceParameters: string }>>;
  readonly subscribe: (events: CurrentProjectStructureWorkerEvents) => () => void;
}
