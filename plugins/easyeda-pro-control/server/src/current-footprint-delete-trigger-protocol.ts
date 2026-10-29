/** Fixed unmounted deletion grammar. Supplied handles and expected scalars are
 * descriptive data, never proof of original ownership or copied-UUID custody. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_GROUP as GROUP, CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS as PROGRAMS } from "./current-footprint-delete-trigger-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u);
const remote = z.object({ objectId: token }).strict();
export const currentFootprintDeleteTriggerExpectationSchema = z.object({
  projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})(?![\s\S])/u), branchUuid: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u),
  targetUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})(?![\s\S])/u), client: z.string().regex(/^[a-f\d]{16}(?![\s\S])/u),
  maximumTicket: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1).refine(value => !Object.is(value, -0)),
}).strict();
export type CurrentFootprintDeleteTriggerExpectation = Readonly<z.infer<typeof currentFootprintDeleteTriggerExpectationSchema>>;
const expected = z.object({ value: currentFootprintDeleteTriggerExpectationSchema }).strict();
const base = { objectId: token, objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), userGesture: z.literal(false) };
const owner = [remote, remote, remote, remote] as const;
const captureParameters = z.object({ ...base, functionDeclaration: z.literal(PROGRAMS.capture.program), arguments: z.tuple(owner),
  returnByValue: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false) }).strict();
const preflightParameters = z.object({ ...base, functionDeclaration: z.literal(PROGRAMS.preflight.program), arguments: z.tuple([...owner, remote, expected]),
  returnByValue: z.literal(true), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false) }).strict();
const invokeParameters = z.object({ ...base, functionDeclaration: z.literal(PROGRAMS.invoke.program), arguments: z.tuple([...owner, remote, expected]),
  returnByValue: z.literal(true), throwOnSideEffect: z.literal(false), awaitPromise: z.literal(true) }).strict();
const commands = z.discriminatedUnion("role", [
  z.object({ role: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), sessionId: token.max(128), params: captureParameters }).strict(),
  z.object({ role: z.literal("preflight"), method: z.literal("Runtime.callFunctionOn"), sessionId: token.max(128), params: preflightParameters }).strict(),
  z.object({ role: z.literal("invoke"), method: z.literal("Runtime.callFunctionOn"), sessionId: token.max(128), params: invokeParameters }).strict(),
]);
export type CurrentFootprintDeleteTriggerCommand = Readonly<z.infer<typeof commands>>;
export function validateCurrentFootprintDeleteTriggerCommand(input: unknown): CurrentFootprintDeleteTriggerCommand {
  const value = commands.parse(captureCurrentPcbStringClockReply(input).value);
  if (Buffer.byteLength(JSON.stringify(value)) > 16_384) { throw new Error("FOOTPRINT_DELETE_TRIGGER_COMMAND_BYTES"); }
  return freezeDeep(value);
}
const observation = currentFootprintDeleteTriggerExpectationSchema.extend({ ownLiveFootprintPresent: z.literal(true), managerUserAbsent: z.literal(true),
  dependencyEligibilityVerified: z.literal(false), executionAuthorized: z.literal(false) }).strict();
function textResult(input: unknown): string {
  const result = z.object({ type: z.literal("string"), value: z.string().max(4096) }).strict();
  return z.object({ result }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value).result.value;
}
export function decodeCurrentFootprintDeleteTriggerPreflight(input: unknown): Readonly<z.infer<typeof observation>> {
  const raw: unknown = JSON.parse(textResult(input));
  return freezeDeep(observation.parse(raw));
}
/** Native deleteData ignores a false upload result. This acknowledgment is
 * deliberately unaccompanied by upload, SQL, saved-absence or success proof. */
export function decodeCurrentFootprintDeleteTriggerAcknowledgment(input: unknown): Readonly<{ nativeReturnedSuccess: true; uploadCompletionVerified: false; nativeSqlCompletionVerified: false; savedAbsenceVerified: false; executionAuthorized: false }> {
  z.object({ success: z.literal(true) }).strict().parse(JSON.parse(textResult(input)) as unknown);
  return Object.freeze({ nativeReturnedSuccess: true, uploadCompletionVerified: false, nativeSqlCompletionVerified: false, savedAbsenceVerified: false, executionAuthorized: false });
}
