/** Classify the original fixed capture's CDP exception without returning its
 * vendor message, stack, handles or paths. This is descriptive, never a grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const classes = ["Error", "EvalError", "TypeError", "ReferenceError", "SyntaxError", "RangeError"] as const;
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u);
const remote = z.looseObject({ type: z.literal("object"), subtype: z.literal("error"), className: z.enum(classes), objectId: handle, description: z.string().max(65_536) });
const packet = z.looseObject({ result: remote,
  exceptionDetails: z.looseObject({ text: z.literal("Uncaught"), exception: remote }) });
const codes = Object.freeze({ Error: "SELECTED_SQL_CAPTURE_ERROR", EvalError: "SELECTED_SQL_CAPTURE_EVAL_ERROR",
  TypeError: "SELECTED_SQL_CAPTURE_TYPE_ERROR", ReferenceError: "SELECTED_SQL_CAPTURE_REFERENCE_ERROR",
  SyntaxError: "SELECTED_SQL_CAPTURE_SYNTAX_ERROR", RangeError: "SELECTED_SQL_CAPTURE_RANGE_ERROR" });

/** Call only on the response to the actual fixed sql-fence-capture request.
 * Supplied data can describe a failure but cannot issue original request custody. */
export function currentSelectedFileMainSqlCaptureError(input: unknown): string | null {
  const parsed = packet.safeParse(captureCurrentPcbStringClockReply(input).value);
  if (!parsed.success) { return null; }
  const { result, exceptionDetails } = parsed.data;
  // V8 binds two distinct remote handles while serializing the same thrown
  // Error twice. Matching descriptions describe this one response, not object
  // Identity or authority to continue its failed request.
  if (result.className !== exceptionDetails.exception.className || result.description !== exceptionDetails.exception.description) { return null; }
  const firstLine = result.description.split("\n", 1)[0];
  if (result.className === "EvalError" && firstLine === "EvalError: Possible side-effect in debug-evaluate") { return "SELECTED_SQL_CAPTURE_SIDE_EFFECT"; }
  if (result.className === "Error" && firstLine === "Error: SELECTED_FILE_MAIN_SQL_FENCE_BINDING") { return "SELECTED_SQL_CAPTURE_BINDING"; }
  return codes[result.className];
}
