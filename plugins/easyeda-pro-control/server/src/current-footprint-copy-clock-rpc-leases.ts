/** Private original-runner references only. Neither lease starts an invocation
 * nor supplies a transport, kernel owner or permission to resume a worker. */
import type { CurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";

export interface CurrentFootprintCopyClockRpcRegistrationLease { readonly profile: "private.current-footprint-clock-rpc-registration-lease.v1" }
export interface CurrentFootprintCopyClockRpcConstructionLease { readonly profile: "private.current-footprint-clock-rpc-construction-lease.v1" }
export interface CurrentFootprintCopyClockRpcRegistrationBinding {
  readonly issuer: object;
  readonly sessionId: string;
  readonly scriptId: string;
  readonly registrationArrayObjectId: string;
  readonly callbackObjectId: string;
  readonly bindingsArrayObjectId: string;
  readonly qualifiedSource: CurrentFootprintCopyClockRpcSource;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
}
export interface CurrentFootprintCopyClockRpcConstructionBinding {
  readonly issuer: object;
  readonly scriptId: string;
  readonly projectObjectId: string;
  readonly managerObjectId: string;
  readonly lexicalBundleObjectId: string;
  readonly dependencyBundleObjectId: string;
  readonly qualifiedSource: CurrentFootprintCopyClockRpcSource;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
}
