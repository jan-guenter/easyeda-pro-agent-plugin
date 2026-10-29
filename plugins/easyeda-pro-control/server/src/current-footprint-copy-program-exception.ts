/** Report a fixed inspector program's refusal without publishing its values,
 * exception message, object handles or stack. The caller retains the raw reply
 * before this check; a diagnostic failure never grants another dispatch. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

function data(object: unknown, key: string): unknown {
  return object !== null && typeof object === "object" && !Array.isArray(object)
    ? Object.getOwnPropertyDescriptor(object, key)?.value as unknown : undefined;
}

export function assertCurrentFootprintCopyProgramReturned(
  input: unknown,
  stage: "dependencies" | "destinations",
): void {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (value === null || typeof value !== "object" || Array.isArray(value) || !Object.hasOwn(value, "exceptionDetails")) { return; }
  const exception = Object.getOwnPropertyDescriptor(value, "exceptionDetails")?.value as unknown;
  const scriptId = data(exception, "scriptId"), stack = data(data(exception, "stackTrace"), "callFrames");
  // The throw itself is usually the fixed helper's bad() line. Retain the last
  // Same-program callsite instead when CDP supplies it. No remote text or name
  // Is included in the public diagnostic, and other scripts are not selected.
  const callsite: unknown = typeof scriptId === "string" && Array.isArray(stack) && stack.length <= 24
    ? stack.findLast((frame: unknown) => data(frame, "scriptId") === scriptId) : undefined;
  const position = (name: "lineNumber" | "columnNumber"): string => {
    if (exception === null || typeof exception !== "object" || Array.isArray(exception)) { return "unknown"; }
    const number = data(callsite ?? exception, name);
    return typeof number === "number" && Number.isSafeInteger(number) && number >= 0 && !Object.is(number, -0) && number < 1_000_000
      ? String(number + 1) : "unknown";
  };
  throw new Error(`FOOTPRINT_COPY_INSPECTOR_EXCEPTION:${stage}:${position("lineNumber")}:${position("columnNumber")}`);
}
