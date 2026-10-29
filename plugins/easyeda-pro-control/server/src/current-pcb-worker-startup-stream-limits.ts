/** Existing stream ceilings, shared by the channel and prelaunch resource
 * reservation. These constants provide no original-owner or writer authority. */
export const CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS = Object.freeze({
  receivedBytes: 64 * 1024 * 1024, eventCount: 4096, eventBytes: 8 * 1024 * 1024,
  frameBytes: 1024 * 1024, sourceFrameBytes: 32 * 1024 * 1024, pollChunkBytes: 65_536,
  activePollMilliseconds: 20, idlePollMilliseconds: 250, lifetimeMilliseconds: 60 * 60 * 1000,
  dataPolls: 8192, idlePolls: 14_400, waitPolls: 8192, clockRpcEvents: 20, allocatedCreateClockEvents: 22,
});
