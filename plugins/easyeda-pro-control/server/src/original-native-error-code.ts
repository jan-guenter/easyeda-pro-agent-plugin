/** Extract only errors issued by the original source or native-packet reader.
 * Never inspect caller-supplied Error properties, messages, stacks or causes. */
import { currentPcbDiagnosticNativeRefusal } from "./current-pcb-diagnostic-native-refusal.ts";
import { originalSourceErrorCode } from "./original-source-error.ts";

export function originalNativeOrSourceErrorCode(input: unknown): string | null {
  const source = originalSourceErrorCode(input);
  if (source !== null) { return source; }
  const native = currentPcbDiagnosticNativeRefusal(input);
  return native === null ? null : native.nativeCode.replaceAll("-", "_").toUpperCase();
}
