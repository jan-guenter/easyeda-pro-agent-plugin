/** Planned normal Main continuations in the distinct full writer. These
 * classifications grant no origin, request, SQL effect or debugger resume. */
export function currentFootprintForwardWriterPlannedMainCleanup(action: unknown, phase: unknown): boolean | null {
  if (action === "footprint-forward-startup-frontier-send") { return false; }
  if (action === "footprint-forward-initial-history") { return phase === "inverse-main-history-remove" || phase === "inverse-main-history-release"; }
  if (action === "main-send" && typeof phase === "string" && (phase.startsWith("sql-stock-v2-") || phase.startsWith("sql-stock-readonly-") || phase.startsWith("sql-fence-"))) { return false; }
  return null;
}
