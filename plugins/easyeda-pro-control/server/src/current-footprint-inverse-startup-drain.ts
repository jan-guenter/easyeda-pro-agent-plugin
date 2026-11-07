/** Bounded same-original-stream drain algorithm only. This helper issues no
 * owner, permit, idle token or completion from supplied callback results. */
import { types } from "node:util";

export interface CurrentFootprintInverseStartupDrainBindings<T> {
  readonly maximumPauses: number; readonly assertCurrent: () => Promise<void>;
  readonly settleOriginalPromises: () => Promise<void>; readonly originalCompletionsPresent: () => boolean;
  readonly nextOriginalEvent: () => Promise<T>; readonly serviceOriginalEvent: (event: T) => Promise<boolean>;
  readonly retainUnsupported: (event: T) => void;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_STARTUP_DRAIN"); } }
export async function drainCurrentFootprintInverseStartup<T>(bindings: CurrentFootprintInverseStartupDrainBindings<T>): Promise<void> {
  need(!types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
  const fields = ["maximumPauses", "assertCurrent", "settleOriginalPromises", "originalCompletionsPresent", "nextOriginalEvent", "serviceOriginalEvent", "retainUnsupported"] as const;
  const descriptors = Object.getOwnPropertyDescriptors(bindings); need(Reflect.ownKeys(bindings).length === fields.length);
  for (const field of fields) { const value = descriptors[field]; need(value !== undefined && Object.hasOwn(value, "value")); const member:unknown=value.value; need(field === "maximumPauses" ? typeof member === "number" && Number.isSafeInteger(member) && member >= 1 && member <= 35 : typeof member === "function" && !types.isProxy(member)); }
  let observed = 0;
  for (;;) {
    await bindings.assertCurrent(); await bindings.settleOriginalPromises(); await bindings.assertCurrent();
    const completed=bindings.originalCompletionsPresent();need(typeof completed==="boolean");if(completed){return;}
    need(observed < bindings.maximumPauses); observed += 1;
    const event = await bindings.nextOriginalEvent(); await bindings.assertCurrent();
    const serviced=await bindings.serviceOriginalEvent(event);need(typeof serviced==="boolean");if (!serviced) { bindings.retainUnsupported(event); throw new Error("FOOTPRINT_INVERSE_UNSUPPORTED_POST_READY_EVENT_HELD"); }
  }
}
