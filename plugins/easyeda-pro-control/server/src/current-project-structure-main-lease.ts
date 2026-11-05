/** Private original-main custody. Only the original construction runner issues
 * this lease; matching handles, plans or serialized observations cannot do so. */
import type { CurrentProjectStructureMainSource } from "./current-project-structure-main-source.ts";
import type { CurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";

export { requireCurrentProjectStructureMainLease } from "./current-footprint-copy-main-backend-runner.ts";
export interface CurrentProjectStructureMainLease { readonly profile: "private.current-project-structure-main-lease.v1" }
export interface CurrentProjectStructureMainBinding {
  readonly issuer: object;
  readonly scriptId: string;
  readonly construction: string;
  readonly source: CurrentProjectStructureMainSource;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
  readonly fail: (error: unknown) => void;
  readonly assertGenerationExited: () => void;
  readonly request: (command: CurrentProjectStructureMainCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void) => Promise<unknown>;
  readonly settleAllocation: () => Promise<void>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => Readonly<{ method: "Debugger.paused" | "Debugger.resumed"; params: unknown }> | null;
  readonly retire: () => void;
}
