/** Fixed normal registration for this actual saved SCH7 reader. Matching data
 * never issues its durable intent, pending request or Main continuation. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_REGISTRATION_FUNCTION } from "./managed-schematic-fixture-opening-program.ts";
import { generatedSchematicTargetSchema } from "./managed-schematic-fixture-opening.ts";
import { generatedFixtureRegistrationResultSchema } from "./managed-fixture-registration-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentSchematicRelevanceSavedRegistrationTarget = z.infer<typeof generatedSchematicTargetSchema>;
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_REGISTRATION_FUNCTION = `async function(targetJson){"use strict";return await (${GENERATED_SCHEMATIC_RELEVANCE_REGISTRATION_FUNCTION})(JSON.parse(targetJson));}`;
export function currentSchematicRelevanceSavedRegistrationWire(id: number, sessionId: string, context: string, input: CurrentSchematicRelevanceSavedRegistrationTarget): Readonly<{
  id: number; method: "Runtime.callFunctionOn"; params: Readonly<{ functionDeclaration: string; uniqueContextId: string; arguments: readonly Readonly<{ value: string }>[];
    returnByValue: true; awaitPromise: true; silent: true; generatePreview: false; userGesture: false; throwOnSideEffect: false }>; sessionId: string; schematicSavedRegistration: true;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId) || !/^[A-Za-z\d_.:-]{1,128}$/u.test(context)) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_WIRE"); }
  const target = generatedSchematicTargetSchema.parse(input); if (!/\\Codex_schematic_relevance_[a-f\d]{16}\.eprj2$/u.test(target.rawWindowsPath)) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_PROFILE"); }
  return freezeDeep({ id, method: "Runtime.callFunctionOn", params: { functionDeclaration: CURRENT_SCHEMATIC_RELEVANCE_SAVED_REGISTRATION_FUNCTION, uniqueContextId: context,
    arguments: [{ value: canonicalJson(target) }], returnByValue: true, awaitPromise: true, silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false }, sessionId, schematicSavedRegistration: true });
}
export function currentSchematicRelevanceSavedRegistrationNativeFrame(chunk: Buffer, sessionId: string, context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (raw === null || typeof raw !== "object" || !("id" in raw) || typeof raw.id !== "number" || chunk.toString("utf8") !== `${JSON.stringify(currentSchematicRelevanceSavedRegistrationWire(raw.id, sessionId, context, target))}\0`) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_FRAME"); }
  return Object.freeze({ action: "schematic-saved-register", requestId: raw.id, sessionId, uniqueContextId: context, targetJson: canonicalJson(target) });
}
export function decodeCurrentSchematicRelevanceSavedRegistrationReply(input: unknown, target: CurrentSchematicRelevanceSavedRegistrationTarget): z.infer<typeof generatedFixtureRegistrationResultSchema> {
  const envelope = z.strictObject({ result: z.strictObject({ type: z.literal("string"), value: z.string().max(32_768) }) }).parse(captureCurrentPcbStringClockReply(input).value);
  const result = generatedFixtureRegistrationResultSchema.parse(JSON.parse(envelope.result.value) as unknown);
  if (result.projectUuid !== target.projectUuid || result.rawWindowsPath !== target.rawWindowsPath) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_RESULT_TARGET"); } return freezeDeep(result);
}
