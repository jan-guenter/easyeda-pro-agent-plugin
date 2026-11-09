/** Native helper packets admit only fixed labels before issuing these errors.
 * A message-shaped Error or copied JSON cannot issue their provenance. */
const refusals = new WeakMap<object, Readonly<{ nativeCode: string }>>();
export function issueCurrentPcbDiagnosticNativeRefusal(nativeCode: string): Error {
  if (!/^pcb-diagnostic-[a-z-]{1,80}$/u.test(nativeCode)) { throw new Error("PCB_DIAGNOSTIC_NATIVE_REFUSAL_CODE"); }
  const error = new Error("PCB_DIAGNOSTIC_OWNER_NATIVE_REFUSAL");
  refusals.set(error, Object.freeze({ nativeCode }));
  return error;
}
export function currentPcbDiagnosticNativeRefusal(input: unknown): Readonly<{ nativeCode: string }> | null {
  return typeof input === "object" && input !== null ? refusals.get(input) ?? null : null;
}
