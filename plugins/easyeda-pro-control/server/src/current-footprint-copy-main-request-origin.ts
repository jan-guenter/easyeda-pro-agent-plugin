/** Private original-object seam. The runner alone issues a token after genuine
 * combined native-owner and complete original-construction checks. No factory,
 * callback registration, serialized handles or purpose upgrade is exposed. */
// oxlint-disable-next-line import/no-cycle -- The original issuer calls the collector's atomic transfer after construction; this getter is never invoked during module initialization, and a registration callback would weaken token custody.
export { requireCurrentFootprintCopyMainRequestOrigin } from "./current-footprint-copy-main-backend-runner.ts";
export type { CurrentFootprintCopyMainRequestOrigin, CurrentFootprintCopyMainRequestOriginBindings,
  CurrentFootprintCopyMainRequestOriginEvent } from "./current-footprint-copy-main-backend-runner.ts";
