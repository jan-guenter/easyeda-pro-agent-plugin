/** Finite metadata selectors only. All actual context/object/function/script
 * IDs and the checkpoint UUID must come from the original private owner. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS } from "./current-pcb-via-saved-cache-metadata-programs.ts";

const kind = z.enum(["cache-response", "request"]), ordinal = z.union([z.literal(0), z.literal(1)]);
const helper = z.enum(["cache-constructors", "cache-members", "cache-reprove", "request-constructors", "request-members", "request-catalogue", "request-reprove", "bind", "observe"]);
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("saved-cache-native-constructors"), kind }),
  z.strictObject({ phase: z.literal("saved-cache-native-members"), kind }),
  z.strictObject({ phase: z.literal("saved-cache-native-references"), kind, stage: z.enum(["constructors", "members"]) }),
  z.strictObject({ phase: z.literal("saved-cache-native-function"), kind, slot: z.number().int().min(1).max(31) }),
  z.strictObject({ phase: z.literal("saved-cache-native-catalogue") }),
  z.strictObject({ phase: z.literal("saved-cache-native-reprove"), kind }),
  z.strictObject({ phase: z.literal("saved-cache-native-bind") }),
  z.strictObject({ phase: z.literal("saved-cache-native-observe"), round: z.enum(["backup", "verify"]), ordinal }),
  z.strictObject({ phase: z.literal("saved-cache-native-helper-source"), helper, occurrence: z.number().int().min(0).max(3) }),
  z.strictObject({ phase: z.literal("saved-cache-native-release") }),
]);
export type CurrentPcbViaSavedCacheMetadataCommand = z.infer<typeof schema>;
export const CURRENT_PCB_VIA_SAVED_CACHE_METADATA_GROUP = "easyeda-pcb-via-saved-cache-metadata-v1";
export function validateCurrentPcbViaSavedCacheMetadataCommand(input: unknown): CurrentPcbViaSavedCacheMetadataCommand {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.phase === "saved-cache-native-function" && (value.slot > 3 && value.slot < 8 || value.kind === "cache-response" && value.slot > 27) ||
      value.phase === "saved-cache-native-helper-source" && value.occurrence >= CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS[value.helper].emissions) { throw new Error("SAVED_CACHE_METADATA_COMMAND_SLOT"); }
  return Object.freeze(value);
}
export function currentPcbViaSavedCacheMetadataMethod(input: CurrentPcbViaSavedCacheMetadataCommand): "Runtime.callFunctionOn" | "Runtime.getProperties" | "Debugger.getScriptSource" | "Runtime.releaseObjectGroup" {
  const value = validateCurrentPcbViaSavedCacheMetadataCommand(input);
  if (value.phase === "saved-cache-native-helper-source") { return "Debugger.getScriptSource"; }
  if (value.phase === "saved-cache-native-release") { return "Runtime.releaseObjectGroup"; }
  if (value.phase === "saved-cache-native-references" || value.phase === "saved-cache-native-function") { return "Runtime.getProperties"; }
  return "Runtime.callFunctionOn";
}
export function currentPcbViaSavedCacheMetadataNativeRequest(input: CurrentPcbViaSavedCacheMetadataCommand): Readonly<Record<string, string | number>> {
  const value = validateCurrentPcbViaSavedCacheMetadataCommand(input);
  return Object.freeze({ savedCacheMetadataPhase: value.phase, ...("kind" in value ? { intrinsicKind: value.kind } : {}), ...("stage" in value ? { intrinsicStage: value.stage } : {}),
    ...("slot" in value ? { intrinsicSlot: value.slot } : {}), ...("round" in value ? { metadataRound: value.round } : {}), ...("ordinal" in value ? { namespaceOrdinal: value.ordinal } : {}),
    ...("helper" in value ? { metadataHelper: value.helper, helperOccurrence: value.occurrence } : {}) });
}
