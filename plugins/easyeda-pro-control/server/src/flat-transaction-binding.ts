import { isRecord, sha256Json } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { assertFlatDisplayBinding, assertFlatDisplayInverse, flatDisplayOperation } from "./flat-display-binding.ts";
import type { FlatDisplayBinding } from "./flat-display-binding.ts";
import { FLAT_WIRE_TRANSACTION_PROFILE, assertFlatWireBinding, assertFlatWireInverse, flatWireOperation } from "./flat-wire-binding.ts";
import type { FlatWireBinding } from "./flat-wire-binding.ts";

export type FlatTransactionBinding = FlatDisplayBinding | FlatWireBinding;
export function isFlatWireBinding(input: unknown): input is FlatWireBinding {
  return isRecord(input) && input["profile"] === FLAT_WIRE_TRANSACTION_PROFILE;
}

/** Presence is deliberate: undefined, dual profiles and misplaced discriminators
 * refuse. This selector never upgrades an old journal or consumes topology alone.
 */
export function flatTransactionBinding(plan: { readonly flatDisplay?: FlatDisplayBinding | undefined; readonly flatWire?: FlatWireBinding | undefined }): FlatTransactionBinding | undefined {
  const display = Object.hasOwn(plan, "flatDisplay"), wire = Object.hasOwn(plan, "flatWire");
  if ((display && wire) || (display && (plan.flatDisplay === undefined || isFlatWireBinding(plan.flatDisplay))) ||
      (wire && !isFlatWireBinding(plan.flatWire))) { throw new Error("Flat transaction requires one exact server-owned profile field."); }
  if (wire) { return plan.flatWire; }
  return display ? plan.flatDisplay : undefined;
}

export function assertFlatTransactionBinding(input: unknown, operation: unknown, context: ExpectedContext): FlatTransactionBinding {
  return isFlatWireBinding(input) ? assertFlatWireBinding(input, operation, context) : assertFlatDisplayBinding(input, operation, context);
}
export function assertFlatTransactionInverse(input: unknown, inverse: unknown): ReturnType<typeof flatDisplayOperation> | ReturnType<typeof flatWireOperation> {
  return isFlatWireBinding(input) ? assertFlatWireInverse(input, inverse) : assertFlatDisplayInverse(input, inverse);
}
export function assertFlatTransactionAction(binding: FlatTransactionBinding, action: unknown): void {
  const parsed = isFlatWireBinding(binding) ? flatWireOperation(action) : flatDisplayOperation(action);
  if (sha256Json(parsed) !== binding.operationSha256) { throw new Error("Flat writer substituted its sealed original action."); }
}
