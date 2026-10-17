/** Shared one-shot reservation across the distinct metadata and copy clocks.
 * An opaque object identifies a caller reservation, not an execution grant.
 */
const owners = new WeakSet<object>();
export function reserveCurrentSymbolTransactionClockOwner(owner: object): void {
  if (owner === null || typeof owner !== "object" || owners.has(owner)) {
    throw new Error("Clock dispatch-owner reservation already consumed or missing.");
  }
  owners.add(owner);
}
