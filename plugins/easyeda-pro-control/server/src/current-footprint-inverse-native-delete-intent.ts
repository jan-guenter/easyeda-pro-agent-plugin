/** One original durable fresh native-equivalent inverse intent. Public SDK
 * Call/Job tokens, copied packets and equal checkpoints cannot substitute it.
 * Publication alone permits no sender invocation, worker resume or SQL. */
export interface CurrentFootprintInverseNativeDeleteIntent { readonly profile: "private.current-footprint-inverse-native-delete-intent.v1" }
export interface CurrentFootprintInverseNativeDeleteIntentBindings { readonly assertCurrent: () => void; readonly assertBeforeAttempt: () => void; readonly assertPublished: () => Promise<void> }
export { requireOriginalCurrentFootprintInverseNativeDeleteIntent } from "./current-pcb-diagnostic-owner.ts";
