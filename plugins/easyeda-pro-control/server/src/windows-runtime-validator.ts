/** Lazy index-owned forwarding only. This binding grants no process authority;
 * actual captures and termination proofs remain issued by the native runtime.
 */
import type { RuntimeExecutionAuthorityValidator } from "./engine.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";

interface Binding {
  readonly select: () => WindowsControlRuntime;
  runtime?: WindowsControlRuntime;
  methods?: readonly unknown[];
}
const issued = new WeakMap<RuntimeExecutionAuthorityValidator, Binding>();
function methods(runtime: WindowsControlRuntime): readonly unknown[] {
  // oxlint-disable-next-line typescript/unbound-method -- These are identity pins only; calls below retain the actual runtime receiver.
  return [runtime.capture, runtime.proveTerminated, runtime.releaseCapture, runtime.observeCurrentClock];
}
function current(binding: Binding): WindowsControlRuntime {
  const runtime = binding.select();
  if (!(runtime instanceof WindowsControlRuntime)) { throw new Error("Windows execution validator requires its original runtime owner."); }
  const observed = methods(runtime);
  if (binding.runtime === undefined) { binding.runtime = runtime; binding.methods = observed; }
  if (runtime !== binding.runtime || observed.some((method, index) => typeof method !== "function" || method !== binding.methods?.[index])) {
    throw new Error("Windows execution validator runtime owner or methods changed.");
  }
  return runtime;
}

/** Construction never calls the fixed index owner reader or allocates a runtime.
 * First dispatch retains its runtime permanently. No post-await check may hide
 * an acquired native capture: callers retain the original result before their
 * existing owner reproof and cleanup boundaries.
 */
export function createWindowsRuntimeValidator(select: () => WindowsControlRuntime): RuntimeExecutionAuthorityValidator {
  const binding: Binding = { select };
  const validator: RuntimeExecutionAuthorityValidator = Object.freeze({
    capture: (input: Parameters<WindowsControlRuntime["capture"]>[0]): ReturnType<WindowsControlRuntime["capture"]> => current(binding).capture(input),
    proveTerminated: (input: Parameters<WindowsControlRuntime["proveTerminated"]>[0]): ReturnType<WindowsControlRuntime["proveTerminated"]> => current(binding).proveTerminated(input),
    releaseCapture: (input: Parameters<WindowsControlRuntime["releaseCapture"]>[0]): ReturnType<WindowsControlRuntime["releaseCapture"]> => current(binding).releaseCapture(input),
    observeCurrentClock: async (input: Parameters<WindowsControlRuntime["observeCurrentClock"]>[0]): ReturnType<WindowsControlRuntime["observeCurrentClock"]> => {
      const runtime = current(binding);
      const observation = await runtime.observeCurrentClock(input);
      // Clock reads acquire no handles. Reject a result if the index selected
      // Another owner or replaced a pinned method during the native await.
      current(binding); return observation;
    },
  });
  issued.set(validator, binding); return validator;
}

/** Only this factory's original, unchanged forwarder can bind an engine to the
 * exact runtime it already used. A copied object or caller boolean is not proof.
 */
export function assertWindowsRuntimeValidator(validator: RuntimeExecutionAuthorityValidator | undefined, runtime: WindowsControlRuntime): void {
  const binding = validator === undefined ? undefined : issued.get(validator);
  if (binding === undefined || binding.runtime !== runtime || current(binding) !== runtime) {
    throw new Error("Windows execution validator is not its original issued runtime binding.");
  }
}
