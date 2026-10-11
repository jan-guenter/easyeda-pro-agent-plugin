import type { ExpectedContext } from "./engine.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import type { FlatDisplayObservationEvidence } from "./schematic-flat-read.ts";
import { assertFlatDisplayLibraryPeers } from "./flat-display-library-peers.ts";
import { verifyFlatDisplayMembershipTopology, verifyFlatDisplayObservation, verifyFlatDisplayPersistence } from "./flat-display-profile.ts";
import { assertFlatWireLibraryPeers, verifyFlatWireObservation, verifyFlatWirePersistence } from "./flat-wire-profile.ts";
import { assertFlatTransactionBinding, isFlatWireBinding } from "./flat-transaction-binding.ts";
import type { FlatTransactionBinding } from "./flat-transaction-binding.ts";

export function assertFlatTransactionLibraryPeers(binding: FlatTransactionBinding, history: NativeHistorySnapshot): void {
  if (isFlatWireBinding(binding)) { assertFlatWireLibraryPeers(binding, history); }
  else { assertFlatDisplayLibraryPeers(binding, history); }
}
export function verifyFlatTransactionObservation(bindingInput: unknown, operation: unknown, context: ExpectedContext,
  evidence: FlatDisplayObservationEvidence, native: unknown, phase: "before" | "after", lifecycle = false): void {
  const binding = assertFlatTransactionBinding(bindingInput, operation, context);
  if (isFlatWireBinding(binding)) { verifyFlatWireObservation(binding, operation, context, evidence, native, phase, lifecycle); }
  else if (lifecycle) { verifyFlatDisplayMembershipTopology(binding, operation, context, evidence, native); }
  else { verifyFlatDisplayObservation(binding, operation, context, evidence, native, phase); }
}
type Persistence = Omit<Parameters<typeof verifyFlatDisplayPersistence>[0], "binding"> & { readonly binding: FlatTransactionBinding };
export function verifyFlatTransactionPersistence(input: Persistence): Promise<Readonly<Record<string, unknown>>> {
  return isFlatWireBinding(input.binding) ? verifyFlatWirePersistence({ ...input, binding: input.binding }) :
    verifyFlatDisplayPersistence({ ...input, binding: input.binding });
}
