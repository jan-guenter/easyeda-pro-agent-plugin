/** Full-only metadata accounting. The mixed-source registration observes18
 * fixed reads; the historical single-source preparation remains242 reads. */
import { CURRENT_FOOTPRINT_FORWARD_CLOCK_PREPARATION_REQUESTS as PREVIOUS } from "./current-footprint-forward-clock-preparation-budget.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS as OLD_REGISTRATION } from "./current-footprint-copy-clock-registration-runner.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS as REGISTRATION } from "./current-footprint-copy-clock-registration-v2-runner.ts";

const additionalRegistration = REGISTRATION.observe - OLD_REGISTRATION.observe;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_PREPARATION_REQUESTS = Object.freeze({ ...PREVIOUS,
  registration: PREVIOUS.registration + additionalRegistration, normal: PREVIOUS.normal + additionalRegistration,
});
