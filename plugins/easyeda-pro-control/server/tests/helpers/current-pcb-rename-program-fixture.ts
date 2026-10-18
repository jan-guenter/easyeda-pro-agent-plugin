/** Synthetic completed SQL preparation only, never a live PCB setup route. */
import { prepareCurrentPcbRenameBinding } from "../../src/current-pcb-rename-binding.ts";
import { prepareCurrentPcbRename } from "../../src/current-pcb-rename-preparation.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";

export const PCB_PROGRAM_TARGET = Object.freeze({ projectUuid: "1".repeat(64), branchUuid: IDS.branch, ownerUuid: IDS.actor, pcbUuid: IDS.target });
export const PCB_PROGRAM_ACTOR = Object.freeze({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" });
const window = { minimumMs: 1_000_000, maximumMs: 1_060_000 };
function record(identity: unknown, body?: unknown): string { return `${JSON.stringify(identity)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function treeEntry(uuid: string, title: string): Record<string, unknown> { return { uuid, title, board: "", parent_uuid: "", source: "", version: "1", updateTime: 1 }; }
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
export async function pcbProgramBaseline(): Promise<Readonly<{ path: string; before: Awaited<ReturnType<typeof inventory>> }>> {
  const original = await fixture();
  const raw = [record({ type: "EDIT_HEAD" }, { ...PCB_PROGRAM_ACTOR, updateTime: 1 }),
    record({ type: "DOCHEAD", ticket: 1 }, { docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" }),
    record({ type: "META", ticket: 1, id: "META" }, { title: "Source PCB", parent: "", source: "", board: "", zIndex: null }),
    record({ type: "LINE", ticket: 90, id: "deleted" }, { x: 0 }), record({ type: "LINE", ticket: 100, id: "deleted" }),
    record({ type: "DOCHEAD", ticket: 2 }, { docType: "PCB", client: "b".repeat(16), uuid: IDS.peer, updateTime: 1, version: "1", editVersion: "3.0" }),
    record({ type: "META", ticket: 2, id: "META" }, { title: "Peer PCB", parent: "", source: "", board: "", zIndex: null })].join("|\n");
  const tree = JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: treeEntry(IDS.target, "Source PCB"), [IDS.peer]: treeEntry(IDS.peer, "Peer PCB") },
    panels: {}, blockSymbols: {}, owner: { ...PCB_PROGRAM_ACTOR, avatar: null } });
  mutate(original.path, [`UPDATE projects SET uuid='${PCB_PROGRAM_TARGET.projectUuid}'`, `UPDATE branches SET project_uuid='${PCB_PROGRAM_TARGET.projectUuid}'`,
    `UPDATE project_images SET project_uuid='${PCB_PROGRAM_TARGET.projectUuid}'`,
    `UPDATE project_structures SET project_uuid='${PCB_PROGRAM_TARGET.projectUuid}',structure=${literal(tree)}`,
    `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`].join(";"));
  return { path: original.path, before: await inventory(original.path) };
}
export async function pcbProgramPreparation(options: Readonly<{ documentMinimumMs?: number; backendOffsetMinutes?: number }> = {}): Promise<Readonly<{ preparation: Awaited<ReturnType<typeof prepareCurrentPcbRename>>;
  binding: Awaited<ReturnType<typeof prepareCurrentPcbRenameBinding>>; input: Record<string, unknown> }>> {
  const { before } = await pcbProgramBaseline(), preparation = await prepareCurrentPcbRename({ before, target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB",
    witness: { projectUuid: PCB_PROGRAM_TARGET.projectUuid, branchUuid: IDS.branch, client: "a".repeat(16), backendActorUuid: IDS.actor,
      documentClockMinMs: options.documentMinimumMs ?? window.minimumMs, documentClockMaxMs: (options.documentMinimumMs ?? window.minimumMs) + 60_000, backendClockMinMs: window.minimumMs,
      backendClockMaxMs: window.maximumMs, backendLocalOffsetMinutes: options.backendOffsetMinutes ?? 0 } });
  const binding = await prepareCurrentPcbRenameBinding({ before, preparation });
  return { preparation, binding, input: { expectedActor: PCB_PROGRAM_ACTOR, startup: { sheetUuids: ["2".repeat(16)], templates: [] },
    rendererTimezoneOffsetMinutes: options.backendOffsetMinutes === undefined || options.backendOffsetMinutes === 0 ? 0 : -options.backendOffsetMinutes } };
}
