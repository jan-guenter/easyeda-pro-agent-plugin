/** Shared existing transport ceilings. These values confer no request or owner
 * authority; purpose-specific reservations may only narrow their consumption. */
export const CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS = Object.freeze({
  maximumFrameBytes: 1024 * 1024, maximumEventCount: 4096, maximumEventBytes: 8 * 1024 * 1024,
  maximumNativePollBytes: 65_536, maximumNativePollBase64Units: 87_384,
  maximumHelperLineBytes: 100_000, maximumHelperStdoutBytes: 96 * 1024 * 1024,
});
