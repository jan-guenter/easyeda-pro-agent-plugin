/** Inert child prelude for explicit synthetic combined-owner tests. This is
 * data only and cannot register an actual native factory or process owner. */
import process from "node:process";
import { CURRENT_FOOTPRINT_COMBINED_READY } from "../../src/current-footprint-combined-ready.ts";

process.stdout.write(`${JSON.stringify({ schema: CURRENT_FOOTPRINT_COMBINED_READY.schema,
  challenge: "a".repeat(32), helperInstance: "b".repeat(32), jobId: (process.argv[1]?.endsWith("current-pcb-diagnostic-helper-fixture.ts") === true ? "a" : "c").repeat(32), creationState: "not-entered", processCreated: false,
  emptyJob: true, pipesChecked: true })}\n`);
