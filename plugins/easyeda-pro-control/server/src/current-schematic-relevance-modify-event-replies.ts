/** Complete native Event descriptor evidence remains data. Native metadata
 * and matching payload values cannot issue an owner or continuation receipt. */
import { currentSchematicRelevancePublicationNativeProperties as properties } from "./current-schematic-relevance-publication-native-replies.ts";
import { decodeCurrentSchematicRelevancePublicationPayload as payload } from "./current-schematic-relevance-publication-body-replies.ts";
import type { CurrentSchematicRelevancePublicationPayload } from "./current-schematic-relevance-publication-body-replies.ts";
import type { CurrentSchematicRelevanceUiPublicationRemote as Remote } from "./current-schematic-relevance-ui-publication-replies.ts";

/** Require the actual instance's sole unforgeable getter before inspecting
 * its callable metadata. This function never invokes that accessor. */
export function currentSchematicRelevanceModifyEventMetadata(input: unknown, actual: Remote | undefined): void {
  if (actual?.type !== "object" || actual.className !== "MessageEvent" || actual.subtype !== undefined || actual.objectId === undefined) { throw new Error("SCH_MODIFY_EVENT_INSTANCE"); }
  const data = properties(input); const row = data.result[0]; const parent = data.internalProperties?.[0];
  if (data.result.length !== 1 || row?.name !== "isTrusted" || row.value !== undefined || row.writable !== undefined || row.set !== undefined && row.set.type !== "undefined" || row.get?.type !== "function" || row.get.className !== "Function" || row.get.description !== "function get isTrusted() { [native code] }" || row.get.objectId === undefined || row.configurable || !row.enumerable || data.internalProperties?.length !== 1 || parent?.name !== "[[Prototype]]" || parent.value.type !== "object" || parent.value.className !== "MessageEvent" || parent.value.subtype !== undefined || parent.value.objectId === undefined) { throw new Error("SCH_MODIFY_EVENT_INSTANCE"); }
}

/** Compare primitive data using SameValue so negative zero cannot be adopted
 * from a new worker envelope. Caller data supplies no native execution grant. */
export function currentSchematicRelevanceModifyEventPayload(input: unknown, original: Readonly<CurrentSchematicRelevancePublicationPayload>): Readonly<CurrentSchematicRelevancePublicationPayload> {
  const actual = payload(input);
  if (actual.length !== original.length || actual.some((value, index) => !Object.is(value, original[index]))) { throw new Error("SCH_MODIFY_EVENT_PAYLOAD"); }
  return actual;
}
