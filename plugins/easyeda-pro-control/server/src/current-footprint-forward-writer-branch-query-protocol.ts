/** Six finite worker branch-read messages. There is only one application
 * invocation; the optional sixth message observes that same Promise again. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_CAPTURE as CAPTURE, CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_INVOKE as INVOKE } from "./current-footprint-forward-writer-branch-query-programs.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_REQUESTS = Object.freeze({ capture: 1, tupleProperties: 1, calleeProperties: 1, invocation: 1, promiseSamples: 2, maximum: 6, applicationCalls: 1 });
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_FLAGS = Object.freeze({ objectGroup: "easyeda-full-branch-query209-v1", silent: true, generatePreview: false, awaitPromise: false, userGesture: false, returnByValue: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(false) };
const argument = z.strictObject({ value: z.string().regex(/^[a-f\d]{32}$/u) });
const captureParams = z.strictObject({ ...flags, objectId: handle, throwOnSideEffect: z.literal(true), functionDeclaration: z.literal(CAPTURE), arguments: z.tuple([argument]) });
const invokeParams = z.strictObject({ ...flags, objectId: handle, throwOnSideEffect: z.literal(false), functionDeclaration: z.literal(INVOKE), arguments: z.tuple([argument]) });
const schema = z.union([
  z.strictObject({ phase: z.literal("forward-branch-query-capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }),
  z.strictObject({ phase: z.literal("forward-branch-query-invoke"), method: z.literal("Runtime.callFunctionOn"), params: invokeParams }),
  z.strictObject({ phase: z.enum(["forward-branch-query-tuple", "forward-branch-query-callee", "forward-branch-query-promise-1", "forward-branch-query-promise-2"]), method: z.literal("Runtime.getProperties"), params: properties }),
]);
export type CurrentFootprintForwardWriterBranchQueryCommand = z.infer<typeof schema>;
export function validateCurrentFootprintForwardWriterBranchQueryCommand(input: unknown): CurrentFootprintForwardWriterBranchQueryCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
export function currentFootprintForwardWriterBranchQueryNativeCases(): readonly CurrentFootprintForwardWriterBranchQueryCommand[] {
  const params = { objectId: "original", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false };
  const input: unknown[] = [
    { phase: "forward-branch-query-capture", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_FLAGS, objectId: "original", throwOnSideEffect: true, functionDeclaration: CAPTURE, arguments: [{ value: "a".repeat(32) }] } },
    { phase: "forward-branch-query-tuple", method: "Runtime.getProperties", params }, { phase: "forward-branch-query-callee", method: "Runtime.getProperties", params },
    { phase: "forward-branch-query-invoke", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_FLAGS, objectId: "original", throwOnSideEffect: false, functionDeclaration: INVOKE, arguments: [{ value: "a".repeat(32) }] } },
    { phase: "forward-branch-query-promise-1", method: "Runtime.getProperties", params }, { phase: "forward-branch-query-promise-2", method: "Runtime.getProperties", params },
  ]; return freezeDeep(input.map(value => validateCurrentFootprintForwardWriterBranchQueryCommand(value)));
}
