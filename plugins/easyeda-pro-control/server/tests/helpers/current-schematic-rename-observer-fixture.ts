/** Synthetic completed SCH SQL and observation data; never a live fixture setup. */
import { prepareCurrentSchematicNativeMetadata } from "../../src/current-schematic-native-metadata.ts";
import { CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS } from "../../src/current-schematic-rename-observation.ts";
import { encodeExactReadEnvelope } from "../../src/exact-readers.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";

export const TARGET = Object.freeze({ projectUuid: "1".repeat(64), branchUuid: IDS.branch, ownerUuid: IDS.actor, schematicUuid: IDS.target });
export const ACTOR = Object.freeze({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" });
export const REQUEST = Object.freeze({ target: TARGET, desiredTitle: "Renamed SCH", expectedBefore: Object.freeze({ name: "source sch", displayName: "Source SCH",
  source: "", version: "1", boardUuid: "", ticket: 100, updateTime: 1 }) });
export const PEERS = Object.freeze([{ uuid: IDS.target, ...REQUEST.expectedBefore }, { uuid: IDS.peer, ...REQUEST.expectedBefore,
  name: "peer sch", displayName: "Peer SCH", ticket: 2 }]);
export const PAYLOAD = Object.freeze({ ok: true, kind: "current-schematic-rename-preflight", ...REQUEST, samples: 2, currentTabId: "0", peers: PEERS,
  nativeNameAvailableObserved: true, completeNativeSchematicMapObserved: true, expectedBeforeMatched: true, noEditorTabsObserved: true,
  hiddenEditorsAbsentObserved: true, dirtyTabsAbsentObserved: true, cachedProjectReadOnlyAbsentObserved: true, concurrentStrictModeAbsentObserved: true,
  clientTicketObservation: { client: "e".repeat(16), maxTicket: 100, samples: 4 }, runtimeObservation: { editorVersion: "3.2.206", actor: ACTOR,
    clockSamples: [0, 1, 2, 3].map(index => ({ rendererBeforeMs: 1000 + index * 3, serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
    backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false }, ...CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS });
export function encoded(value: unknown = PAYLOAD): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }
function record(identity: unknown, body?: unknown): string { return `${JSON.stringify(identity)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function header(uuid: string, docType = "SCH"): Record<string, unknown> {
  return { docType, client: "b".repeat(16), uuid, updateTime: 1, version: "1", editVersion: "3.0" };
}
export async function schematicBaseline(): Promise<Readonly<{ path: string; before: Awaited<ReturnType<typeof inventory>>;
  metadata: Awaited<ReturnType<typeof prepareCurrentSchematicNativeMetadata>> }>> {
  const original = await fixture(), sheet = "c".repeat(16);
  const raw = [record({ type: "EDIT_HEAD" }, { ...ACTOR, updateTime: 1 }), record({ type: "DOCHEAD", ticket: 1 }, header(IDS.target)),
    record({ type: "META", ticket: 1, id: "META" }, { title: "Source SCH", source: "", board: "", zIndex: null }),
    record({ type: "LINE", ticket: 90, id: "deleted" }, { x: 0 }), record({ type: "LINE", ticket: 100, id: "deleted" }),
    record({ type: "DOCHEAD", ticket: 2 }, header(IDS.peer)), record({ type: "META", ticket: 2, id: "META" }, { title: "Peer SCH", source: "", board: "", zIndex: null }),
    record({ type: "DOCHEAD", ticket: 3 }, header(sheet, "SCH_PAGE")), record({ type: "META", ticket: 3, id: "META" },
      { title: "Child title", schematic: IDS.target, source: "", zIndex: 0 })].join("|\n");
  const tree = JSON.stringify({ boards: {}, schematics: Object.fromEntries(PEERS.map(peer => [peer.uuid,
    { uuid: peer.uuid, name: peer.displayName, board: "", source: "", version: "1", updateTime: 1 }])),
    sheets: { [sheet]: { uuid: sheet, title: "Child title", schematic_uuid: IDS.target, docType: 1, zIndex: 0, source: "", version: "1", updateTime: 1 } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner: { ...ACTOR, avatar: null } });
  mutate(original.path, [`UPDATE projects SET uuid='${TARGET.projectUuid}'`, `UPDATE branches SET project_uuid='${TARGET.projectUuid}'`,
    `UPDATE project_images SET project_uuid='${TARGET.projectUuid}'`, `UPDATE project_structures SET project_uuid='${TARGET.projectUuid}',structure=${literal(tree)}`,
    `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`].join(";"));
  const before = await inventory(original.path), metadata = await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: REQUEST.desiredTitle });
  return { path: original.path, before, metadata };
}
