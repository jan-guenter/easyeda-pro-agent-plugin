/** Build-only sharing for three distinct passive Echo vocabularies. Every
 * facade command keeps its own strict parser, fixed source and phase. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CALLS as PREPARATION } from "./current-schematic-relevance-modify-echo-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS as EVENT } from "./current-schematic-relevance-modify-echo-event-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_CALLS as COMPLETION } from "./current-schematic-relevance-modify-echo-completion-protocol.ts";
import { currentSchematicRelevanceModifyEchoCases as preparationCases, currentSchematicRelevanceModifyEchoTemplate as preparationTemplate } from "./current-schematic-relevance-modify-echo-wire.ts";
import { currentSchematicRelevanceModifyEchoEventCases as eventCases, currentSchematicRelevanceModifyEchoEventTemplate as eventTemplate } from "./current-schematic-relevance-modify-echo-event-wire.ts";
import { currentSchematicRelevanceModifyEchoCompletionCases as completionCases, currentSchematicRelevanceModifyEchoCompletionTemplate as completionTemplate } from "./current-schematic-relevance-modify-echo-completion-wire.ts";
import { currentSchematicRelevanceNormalCommandBodyPrograms } from "./current-schematic-relevance-normal-command-ui-native.ts";
import { currentSchematicRelevanceUiCodecNativeSource } from "./current-schematic-relevance-ui-codec-native-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const books = Object.freeze([
  { name: "preparation", calls: PREPARATION, cases: preparationCases, template: preparationTemplate, marker: "modifyecho" },
  { name: "event", calls: EVENT, cases: eventCases, template: eventTemplate, marker: "modifyechoevent" },
  { name: "completion", calls: COMPLETION, cases: completionCases, template: completionTemplate, marker: "modifyechocompletion" },
] as const);
type GroupBook = (typeof books)[number];
interface GroupRow {
  readonly book: GroupBook["name"]; readonly command: ReturnType<GroupBook["cases"]>[number];
  readonly phase: string; readonly method: string; readonly names: readonly string[];
  readonly values: Readonly<Record<string, string>>; readonly template: string;
}
/** Reuse only exact program text, preserving the existing shared40-program
 * order before appending each distinct source-owned Echo helper once. */
export function currentSchematicRelevanceModifyEchoGroupPrograms(): readonly string[] {
  const programs = [...currentSchematicRelevanceNormalCommandBodyPrograms()];
  for (const book of books) { for (const row of book.calls) { if (!programs.includes(row[1])) { programs.push(row[1]); } } }
  return Object.freeze(programs);
}
/** Normalize storage placeholders only. All methods, parameters, object
 * groups, source programs, argument counts and result flags stay exact. */
export function currentSchematicRelevanceModifyEchoGroupRows(): readonly GroupRow[] {
  const programs = currentSchematicRelevanceModifyEchoGroupPrograms();
  return freezeDeep(books.flatMap(book => book.cases().map(command => {
    const row = book.template(command); const pattern = new RegExp(`__schematic_${book.marker}_([A-Za-z\\d]+)__`, "gu");
    const template = row.template.replaceAll(pattern, (_match, field: string) => {
      if (!field.startsWith("program")) { return `__schematic_modifyechogroup_${field}__`; }
      const original = book.calls[Number(field.slice(7))];
      if (original === undefined || command.method !== "Runtime.callFunctionOn" || command.params.functionDeclaration !== original[1]) { throw new Error("SCH_ECHO_GROUP_PROGRAM"); }
      const index = programs.indexOf(original[1]); if (index === -1) { throw new Error("SCH_ECHO_GROUP_INDEX"); } return `__schematic_modifyechogroup_program${String(index)}__`;
    });
    return { book: book.name, command, phase: row.phase, method: row.method, names: row.names, values: row.values, template };
  })));
}
/** Emit one bounded immutable codebook and complete independent golden
 * vector. Runtime owner ledgers still authorize each original stream. */
export function currentSchematicRelevanceModifyEchoGroupNativeSource(): string {
  const rows = currentSchematicRelevanceModifyEchoGroupRows(); const shared = currentSchematicRelevanceNormalCommandBodyPrograms(); const own = currentSchematicRelevanceModifyEchoGroupPrograms().slice(shared.length);
  return currentSchematicRelevanceUiCodecNativeSource({ className: "EasyedaSchematicRelevanceModifyEchoGroupProtocol", errorCode: "schematic-modify-echo-group-codec", tableError: "SCHEMATIC_MODIFY_ECHO_GROUP_FIXED_TABLE_BOUND", marker: "modifyechogroup", rows: rows.map(row => [row.phase, row.method, row.names.join(","), row.template]), programs: own, sharedProgramClass: "EasyedaSchematicRelevanceNormalCommandBodyProtocol", programIndexes: own.map((_value, index) => shared.length + index), messages: rows.map(({ command }) => `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`) });
}
