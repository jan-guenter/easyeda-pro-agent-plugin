/** Private orchestration metadata for the actual PCB dispatcher transports.
 * No caller-selected deadlines, timing-based authority or worker recursion. */
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as profile } from "./current-pcb-209-ratline-budget.ts";
import { currentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";

const pcbTransports = new WeakSet<object>();
const monotonic = process.hrtime.bigint.bind(process.hrtime);
/** Called only on the dispatcher's newly created transport objects. Standalone
 * and worker transports retain their existing ordinary request deadline. */
export function bindCurrentPcb209RatlinePcbTransport(transport: object): void {
  if (pcbTransports.has(transport)) { throw new Error("PCB209_RATLINE_TRANSPORT_WINDOW_CONSUMED"); }
  pcbTransports.add(transport);
}
export function currentPcb209RatlineTransportRequestMilliseconds(transport: object, method: string): number {
  const timing = currentPcb209RatlineContinuationTiming(transport);
  if (timing !== null) {
    if (method === "Debugger.setBreakpoint") { return timing.allocationMilliseconds; }
    if (method === "Runtime.runIfWaitingForDebugger") { return timing.childStartRequestMilliseconds; }
    if (method === "Debugger.removeBreakpoint" || method === "Debugger.resume") { return profile.elapsed.ordinaryRequestMilliseconds; }
    return timing.bootstrapSendMilliseconds;
  }
  if (!pcbTransports.has(transport)) { return profile.elapsed.ordinaryRequestMilliseconds; }
  if (method === "Debugger.setBreakpoint") { return profile.elapsed.pcbRealmAllocationMilliseconds; }
  if (method === "Runtime.runIfWaitingForDebugger") { return profile.elapsed.pcbChildStartMilliseconds; }
  if (method === "Debugger.removeBreakpoint" || method === "Debugger.resume") { return profile.elapsed.ordinaryRequestMilliseconds; }
  return profile.elapsed.pcbBootstrapSendMilliseconds;
}
/** Expiry removes execution authority but leaves the actual allocation promise
 * alive. Its original owner must still receive a late handle for cleanup. */
export async function retainCurrentPcb209RatlineAllocation(request: () => Promise<unknown>, expire: () => void): Promise<unknown> {
  const started = monotonic(); let expired = false;
  const expireOnce = (): void => {
    if (expired) { return; } expired = true;
    try { expire(); } catch {
      // Owners retain failure before notifying lost listeners. A listener must
      // Not turn an already recorded deadline into an uncaught timer exception.
    }
  };
  const timer = setTimeout(expireOnce, profile.elapsed.ordinaryRequestMilliseconds);
  try { return await request(); } finally {
    if (Number(monotonic() - started) / 1_000_000 >= profile.elapsed.ordinaryRequestMilliseconds) { expireOnce(); }
    clearTimeout(timer);
  }
}
