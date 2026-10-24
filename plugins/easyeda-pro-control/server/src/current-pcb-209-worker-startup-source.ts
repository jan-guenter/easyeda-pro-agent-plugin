/** Complete generation209 source qualification. This pure report does not own
 * a native process, worker, debugger event, execution context or remote handle. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES, CURRENT_PCB_209_WORKER_STARTUP_SOURCE,
  CURRENT_PCB_209_WORKER_STARTUP_SPANS } from "./current-pcb-209-worker-startup-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }

export function inspectCurrentPcb209WorkerStartupSource(input: unknown): Readonly<{
  schema: "easyeda-pro-control.pcb209-worker-startup-source.v1";
  completeSourceMatches: boolean;
  spans: readonly Readonly<{ name: string; matches: boolean }>[];
  locations: readonly Readonly<{ name: string; matches: boolean }>[];
  sourceProfileMatches: boolean;
  originalWorkerOwnershipVerified: false;
  compatibilityAdmitted: false;
  executionAuthorized: false;
}> {
  if (typeof input !== "string" || !input.isWellFormed() || input.length > 3 * 1024 * 1024) {
    throw new Error("PCB209_WORKER_STARTUP_SOURCE_INPUT");
  }
  const profile = CURRENT_PCB_209_WORKER_STARTUP_SOURCE;
  const completeSourceMatches = Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256;
  const spans = Object.entries(CURRENT_PCB_209_WORKER_STARTUP_SPANS).map(([name, span]) => {
    const source = input.slice(span.start, span.end);
    return { name, matches: Buffer.byteLength(source) === span.bytes && digest(source) === span.sha256 };
  });
  const locations = Object.entries(CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES).map(([name, site]) => {
    const before = input.slice(0, site.offset), lineNumber = before.split("\n").length - 1;
    const columnNumber = site.offset - before.lastIndexOf("\n") - 1;
    return { name, matches: site.offset < input.length && lineNumber === site.lineNumber && columnNumber === site.columnNumber };
  });
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-worker-startup-source.v1", completeSourceMatches, spans, locations,
    sourceProfileMatches: completeSourceMatches && spans.every(span => span.matches) && locations.every(location => location.matches),
    originalWorkerOwnershipVerified: false, compatibilityAdmitted: false, executionAuthorized: false });
}
