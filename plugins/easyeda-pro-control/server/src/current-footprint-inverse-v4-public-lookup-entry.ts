/** Only Core's original service-to-F2 collector can issue this held entry. */
import { originalCurrentFootprintInversePublicLookupEntry } from "./current-footprint-inverse-v4-native-owner.ts";
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";

export interface CurrentFootprintInversePublicLookupEntry { readonly profile: "private.current-footprint-inverse-public-lookup-entry.v1" }
export interface CurrentFootprintInversePublicLookupEntryBindings {
  readonly call: CurrentFootprintInversePublicDeleteCall;
  readonly assertCurrent: () => void;
  /** This is an original F2 entry hold, never a completed GET or row proof. */
  readonly assertOriginalHeld: () => void;
}
export function requireOriginalCurrentFootprintInversePublicLookupEntry(token: CurrentFootprintInversePublicLookupEntry, owner: object, prepared: CurrentFootprintInversePreparedCheckpoint): CurrentFootprintInversePublicLookupEntryBindings { return originalCurrentFootprintInversePublicLookupEntry(token, owner, prepared); }
