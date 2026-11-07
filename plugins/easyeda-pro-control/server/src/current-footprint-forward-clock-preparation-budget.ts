/** Additional same-writer renderer reads, charged to the original v2 cursor.
 * Control/cleanup ledgers remain cumulative; this is no whole-writer budget. */
import { CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS as PRODUCERS } from "./current-footprint-copy-producer-runner.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS as DEPENDENCIES } from "./current-footprint-copy-dependency-runner.ts";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTED_ASYNC_REQUESTS as CALLBACKS } from "./current-footprint-copy-async-runner.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_REQUESTS as DESTINATIONS } from "./current-footprint-copy-destination-runner.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS as REGISTRATION } from "./current-footprint-copy-clock-registration-runner.ts";

// The original owned-source reproof reads identity+assignments.
const source = 2;
// The opening wrappers add identity+assignments before each owner observation.
const dependencies = 2 + DEPENDENCIES.observeMaximum, producers = 2 + PRODUCERS.observeMaximum;
const callbacks = CALLBACKS.observe, destinations = DESTINATIONS.originalObserve;
// Native registration reproves the original opening before and after17 reads.
const registration = REGISTRATION.observe + 2;
// Exact original dependency, callback and destination reproofs, then assignment.
const leases = DEPENDENCIES.requireMaximum + CALLBACKS.reproof + DESTINATIONS.originalReproof + 1;
export const CURRENT_FOOTPRINT_FORWARD_CLOCK_PREPARATION_REQUESTS = Object.freeze({
  source, producers, dependencies, callbacks, destinations, registration, leases,
  normal: source + producers + dependencies + callbacks + destinations + registration + leases,
  newNativeCommands: 0, cleanupReserveExpanded: false, wholeWriterReserved: false,
});
