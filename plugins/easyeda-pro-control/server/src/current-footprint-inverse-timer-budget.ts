/** Separate first-timer reservation. Only a new inverse-origin transport may
 * spend it; these finite counts do not mount cancellation or widen Via/SCH. */
import { CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS } from "./current-project-sync-quiesce-protocol.ts";

const normal = CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS.cdpRequests;
// Capture, two exact [this] expressions, entry, returned and cancel each have
// An original anonymous source receipt. Only entry has a nonempty condition.
const helperSources = 6; const conditionSources = 1;
const direct = normal + helperSources; const total = direct + conditionSources;
const heldControls = 2; const bindControls = 1; const completionControls = 1;
export const CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS = Object.freeze({ normal, helperSources, conditionSources, direct, total,
  events: CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS.events, heldControls, bindControls, completionControls,
  directControls: direct + heldControls + bindControls + completionControls,
  controls: total + heldControls + bindControls + completionControls });
