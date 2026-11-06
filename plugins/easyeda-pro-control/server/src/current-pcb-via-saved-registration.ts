/** Fixed normal registration for the original closed saved target. This data
 * codec cannot issue the original intent, pending pipe Promise or SQL grant. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { diagnosticGeneratedFixtureRegistrationParams } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { generatedFixtureRegistrationResultSchema } from "./managed-fixture-registration-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function decodeCurrentPcbViaSavedRegistrationReply(input: unknown, target: CurrentDisposableOpenSealedTarget): z.infer<typeof generatedFixtureRegistrationResultSchema> {
  currentDisposableOpenSealedTargetSchema.parse(target);
  const value = z.strictObject({ type: z.literal("string"), value: z.string().max(32_768) });
  const envelope = z.strictObject({ result: value }).parse(captureCurrentPcbStringClockReply(input).value);
  const result = generatedFixtureRegistrationResultSchema.parse(JSON.parse(envelope.result.value) as unknown);
  if (result.projectUuid !== target.projectUuid || result.rawWindowsPath !== target.rawWindowsPath || !result.registrationDispatched || result.priorRegistrationPresent) { throw new Error("SAVED_READBACK_ORIGINAL_REGISTRATION_REPLY"); }
  return freezeDeep(result);
}
export function currentPcbViaSavedRegistrationNativeFrame(chunk: Buffer, sessionId: string, uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SAVED_READBACK_REGISTRATION_FRAME"); }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1));
  const raw: unknown = JSON.parse(decoded), value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || !Number.isSafeInteger(value.id) || value.id < 1) { throw new Error("SAVED_READBACK_REGISTRATION_FRAME"); }
  const expected = { id: value.id, method: "Runtime.callFunctionOn", params: diagnosticGeneratedFixtureRegistrationParams(uniqueContextId, target), sessionId };
  if (canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("SAVED_READBACK_REGISTRATION_FRAME"); }
  return Object.freeze({ action: "saved-readback-register", requestId: value.id, sessionId, uniqueContextId });
}
