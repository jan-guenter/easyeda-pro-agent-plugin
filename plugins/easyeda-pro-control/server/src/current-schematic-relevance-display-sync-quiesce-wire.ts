/** Distinct seven-record action verb; the shared template is inert syntax. */
import { currentProjectSyncQuiesceTemplate } from "./current-project-sync-quiesce-wire.ts";
import { validateCurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceDisplaySyncQuiesceWire(input: unknown, id: number): Readonly<{ command: ReturnType<typeof validateCurrentProjectSyncQuiesceCommand>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_RELEVANCE_QUIESCE_WIRE_ID"); }
  const command = validateCurrentProjectSyncQuiesceCommand(input), row = currentProjectSyncQuiesceTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-display-sync-quiesce", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
