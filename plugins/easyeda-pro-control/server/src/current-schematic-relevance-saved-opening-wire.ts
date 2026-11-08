/** Only original saved-reader state can supply the target/context. This fixed
 * data codec cannot register a project, issue a worker or select arbitrary code. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_FUNCTION as OPEN, currentSchematicRelevanceSavedOpeningArguments, decodeCurrentSchematicRelevanceSavedOpeningResult } from "./current-schematic-relevance-saved-opening-programs.ts";
import type { CurrentSchematicRelevanceSavedOpeningPhase } from "./current-schematic-relevance-saved-opening-programs.ts";
import type { CurrentSchematicRelevanceSavedRegistrationTarget } from "./current-schematic-relevance-saved-registration.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_WRAPPER = `async function(targetJson,phase,expectedWindowTabId){"use strict";return await (${OPEN})(JSON.parse(targetJson),phase,expectedWindowTabId);}`;
export function currentSchematicRelevanceSavedOpeningWire(id: number, sessionId: string, context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget, phase: CurrentSchematicRelevanceSavedOpeningPhase, windowTabId: string): Readonly<{
  id: number; method: "Runtime.callFunctionOn"; params: Readonly<{ functionDeclaration: string; uniqueContextId: string; arguments: readonly Readonly<{ value: unknown }>[];
    returnByValue: true; awaitPromise: true; silent: true; generatePreview: false; userGesture: false; throwOnSideEffect: false }>; sessionId: string; schematicSavedOpening: CurrentSchematicRelevanceSavedOpeningPhase;
}> {
  const args = currentSchematicRelevanceSavedOpeningArguments(target, phase, windowTabId);
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId) || !/^[A-Za-z\d_.:-]{1,128}$/u.test(context)) { throw new Error("SCHEMATIC_SAVED_OPENING_WIRE"); }
  return freezeDeep({ id, method: "Runtime.callFunctionOn", params: { functionDeclaration: CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_WRAPPER, uniqueContextId: context,
    arguments: [{ value: canonicalJson(args[0]?.value) }, { value: phase }, { value: windowTabId }], returnByValue: true, awaitPromise: true, silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false }, sessionId, schematicSavedOpening: phase });
}
export function currentSchematicRelevanceSavedOpeningNativeFrame(chunk: Buffer, sessionId: string, context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget, phase: CurrentSchematicRelevanceSavedOpeningPhase, windowTabId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_SAVED_OPENING_FRAME"); }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || chunk.toString("utf8") !== `${JSON.stringify(currentSchematicRelevanceSavedOpeningWire(value.id, sessionId, context, target, phase, windowTabId))}\0`) { throw new Error("SCHEMATIC_SAVED_OPENING_FRAME"); }
  return Object.freeze({ action: "schematic-saved-open", requestId: value.id, sessionId, uniqueContextId: context, openingPhase: phase, targetJson: canonicalJson(target), windowTabId });
}
export function decodeCurrentSchematicRelevanceSavedOpeningReply(input: unknown, target: CurrentSchematicRelevanceSavedRegistrationTarget, phase: CurrentSchematicRelevanceSavedOpeningPhase, windowTabId: string): ReturnType<typeof decodeCurrentSchematicRelevanceSavedOpeningResult> {
  const raw = captureCurrentPcbStringClockReply(input).value;
  if (raw === null || typeof raw !== "object" || Reflect.ownKeys(raw).length !== 1 || !("result" in raw) || raw.result === null || typeof raw.result !== "object" || Reflect.ownKeys(raw.result).length !== 2 || !("type" in raw.result) || raw.result.type !== "object" || !("value" in raw.result)) { throw new Error("SCHEMATIC_SAVED_OPENING_REPLY"); }
  return decodeCurrentSchematicRelevanceSavedOpeningResult(raw.result.value, target, phase, windowTabId);
}
