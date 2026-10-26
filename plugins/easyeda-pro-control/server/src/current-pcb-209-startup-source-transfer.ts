/** Fixed209 source drain allowances within the existing stage/launch clocks.
 * These are bounded opportunities to deliver a pinned script, not promised
 * throughput, caller-selected timeouts or extensions of the parent clocks. */
import { CURRENT_PCB_209_PRELOAD_COPY_SOURCE, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES,
  CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcb209StartupScriptRole } from "./current-pcb-209-worker-bootstrap-source.ts";

const CHUNK_BYTES = 65_536, ENVELOPE_BYTES = 1024, NATIVE_REQUEST_MS = 2500, POLL_MS = 20;
const slots = Object.freeze(CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES.map(role => {
  let sourceBytes: number = CURRENT_PCB_209_PRELOAD_COPY_SOURCE.generatedBytes;
  if (role === "bootstrap") { sourceBytes = Math.max(...CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES.map(source => Buffer.byteLength(source))); }
  else if (role === "preload" || role === "project") { sourceBytes = CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE[role].bytes; }
  // Same bound as continuation's original source slots: six JSON bytes per
  // UTF8 source byte, fixed CDP envelope, then two extra poll opportunities.
  const frameBytes = 6 * sourceBytes + ENVELOPE_BYTES;
  const chunks = Math.ceil(frameBytes / CHUNK_BYTES);
  return Object.freeze({ role, sourceBytes, frameBytes, chunks,
    deadlineMilliseconds: NATIVE_REQUEST_MS + (chunks + 2) * POLL_MS });
}));
export function currentPcb209StartupSourceTransfer(role: CurrentPcb209StartupScriptRole): typeof slots[number] {
  const slot = slots.find(value => value.role === role);
  if (slot === undefined) { throw new Error("PCB209_STARTUP_SOURCE_TRANSFER_ROLE"); } return slot;
}
