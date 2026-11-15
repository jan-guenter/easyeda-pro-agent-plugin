/** Complete fixed startup callback/queue/timer loop under the same full
 * native purpose. No historical shared or V2 limit is changed here. */
export function currentFootprintForwardWriterStartupFrontierBudget(records: number): Readonly<{
  records: number; callbackArms: 4; callbackCommands: number; callbackHolds: number;
  queueCommands: number; timerCommands: 28; timerSetup: 17; timerHolds: 2;
  rendererCommands: number; controls: number; eventCount: number;
  artifactBytes: number; journalBytes: number; retainedBytes: number;
}> {
  if (!Number.isSafeInteger(records) || records < 1 || records > 512) { throw new Error("FORWARD_WRITER_STARTUP_FRONTIER_SOURCE_BOUND"); }
  // Entry8 + return4 + finalizer6; queue rechecks each original frame and
  // At most two Promise references, then two closure reads and its fixed join.
  const callbackCommands = 18 * records, callbackHolds = 3 * records, queueCommands = 3 * records + 3;
  // Operation/setup, each callback pair, two timer pairs, queue/frontier and
  // The three cleanup rows use the component journal's separate4KiB records.
  const publicationRecords = 6 * records + 13;
  const artifactBytes = publicationRecords * 4096, journalBytes = publicationRecords * (4096 + 8192 + 512) + 65_536;
  // Each callback triple has six pause/resumed events, seven evaluated frame
  // Or join programs and at most two evaluated startup conditions. Four point
  // Resolutions/two condition scripts and the fixed timer's fourteen events
  // Have their own allowance. These are events, never invented helper reads.
  return Object.freeze({ records, callbackArms: 4, callbackCommands, callbackHolds, queueCommands, timerCommands: 28, timerSetup: 17, timerHolds: 2,
    rendererCommands: 4 + callbackCommands + queueCommands + 28, controls: callbackHolds + 6, eventCount: 15 * records + 20,
    artifactBytes, journalBytes, retainedBytes: artifactBytes + journalBytes });
}
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_REQUESTS = currentFootprintForwardWriterStartupFrontierBudget(512);
