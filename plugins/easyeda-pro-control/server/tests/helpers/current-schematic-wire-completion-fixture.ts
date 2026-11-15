/** Function creation in inert surroundings preserves each qualified vendor
 * span and original PC; no original application function is invoked. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE } from "../../src/current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionRole as Role } from "../../src/current-schematic-wire-completion-source.ts";

/** Surround one unchanged span with whitespace and a private reference slot. */
export function wireCompletionFunctionFixture(source: string, variant: 0 | 1, role: Role): string {
  const row = SOURCE[variant].rows[role]; let before: string; let after: string;
  if (row.form === "method") { before = '(function(){"use strict";const refs={'; after = `};return refs[${JSON.stringify(row.name)}];})()`; }
  else if (row.form === "declaration") { before = '(function(){"use strict";'; after = `;return ${row.name};})()`; }
  else { before = '(function(){"use strict";const refs={};refs.value='; after = ";return refs.value;})()"; }
  assert.ok(!source.slice(row.start - before.length, row.start).includes("\n"));
  return source.slice(0, row.start - before.length).replaceAll(/[^\r\n]/gu, character => " ".repeat(character.length)) + before + source.slice(row.start, row.end) + after;
}
