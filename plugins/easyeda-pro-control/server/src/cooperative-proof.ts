import { setImmediate } from "node:timers/promises";

/** Let the authenticated gateway forward real heartbeat traffic. A resolved
 * promise only advances microtasks and does not service the socket event loop.
 * Two check-phase boundaries also give poll a turn when the caller itself
 * resumed inside an I/O callback. This never manufactures liveness, extends
 * a lease or changes a deadline.
 */
export async function yieldProofEventLoop(): Promise<void> {
  await setImmediate();
  await setImmediate();
}
