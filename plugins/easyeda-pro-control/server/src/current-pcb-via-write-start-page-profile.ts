/** Separate disposable writer startup allowance. It cannot consume the fresh
 * saved-reader allowance or extend another diagnostic purpose's discovery. */
export const CURRENT_PCB_VIA_WRITE_START_PAGE = Object.freeze({
  version: 1, inventorySamples: 8, delayMilliseconds: 250, total: 9, additionalInventoryRequests: 7,
});
