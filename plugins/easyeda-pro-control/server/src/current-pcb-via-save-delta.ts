/** Exact selected-worker uniqueId delta. This pure projection grants no
 * native request, SQL slot, full-scene invariant or persistence authority. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaProjectedEffect } from "./current-pcb-via-write-effect-data.ts";
import type { CurrentPcbViaSaveBodyValue } from "./current-pcb-via-save-replies.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVE_DELTA_SOURCE = freezeDeep({
  worker: { sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046",
    docHead: 241_441, record: 241_789, compress: 284_133, clearUniquePending: 287_400, asyncCompressFull: 294_244 },
  pcb: { sha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b",
    round: 3_214_904, viaFieldRoster: 3_997_180, group: 4_008_006, viaType: 4_010_495, viaGetData: 4_414_603,
    feed: 4_770_069, directGetData: 4_773_817, uploadVia: 4_777_873, encodeVia: 667_300 },
});
const userSchema = z.strictObject({ uuid: z.string().min(1).max(128), username: z.string().max(1024), nickname: z.string().max(1024) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_SAVE_DELTA_${code}`); } }
function rounded(value: number): number { const factor = 10 ** 4; return Math.round(value * factor + 1e-10) / factor; }
export interface CurrentPcbViaSaveDelta {
  readonly schema: "private.current-pcb-via-save-delta.v1"; readonly dataStr: string; readonly bodySha256: string;
  readonly documentUuid: string; readonly primitiveId: string; readonly primitiveTicket: number; readonly headTicket: number;
  readonly sourceBody: Readonly<{ partitionId: ""; groupId: 0; netName: ""; ruleName: ""; centerX: number; centerY: number;
    holeDiameter: number; viaDiameter: number; viaType: "NORMAL"; topSolderExpansion: 0; bottomSolderExpansion: 0; locked: false; unusedInnerLayers: readonly [] }>;
  readonly exactUniqueIdDeltaVerified: true; readonly sourcePeerProjectionVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
/** The initial qualification owns all baseline records. The issuing caller
 * must separately join the original effect, body and clock references. */
export function compareCurrentPcbViaSaveDelta(plan: CurrentPcbViaWritePlan, history: NativeHistorySnapshot, effect: CurrentPcbViaProjectedEffect,
  value: CurrentPcbViaSaveBodyValue): CurrentPcbViaSaveDelta {
  need(history.projectUuid === plan.target.projectUuid && history.branchUuid === plan.target.branchUuid && history.documents.length === 1 &&
    value.projectUuid === plan.target.projectUuid && value.documentUuid === plan.target.documentUuid && effect.operationId === plan.operationId &&
    effect.documentUuid === plan.target.documentUuid && /^[a-f\d]{16}$/u.test(effect.primitiveId), "IDENTITY");
  const document = history.documents[0]; need(document !== undefined && document.uuid === plan.target.documentUuid && document.docType === "PCB", "DOCUMENT");
  need(!Object.hasOwn(document.metadata, "user") && document.metadata["editVersion"] === "3.2.209" &&
    document.records.every(record => record.id !== effect.primitiveId && ["META", "VIA", "LINE"].includes(record.type)), "BASELINE");
  const maximumTicket = Math.max(...document.records.map(record => record.ticket));
  need(Number.isSafeInteger(maximumTicket) && maximumTicket > 0 && maximumTicket < Number.MAX_SAFE_INTEGER - 2 && value.headTicket === maximumTicket + 2, "SOLE_CREATE_TICKET");
  const native = plan.expectedNative;
  // DC does not implement Na.ZIndex. feed assigns undefined, then the actual
  // EncodeVia JSON.stringify omits it. It must not become a guessed null.
  const sourceBody = { partitionId: "", groupId: 0, netName: "", ruleName: "", centerX: rounded(native.x * 10), centerY: rounded(native.y * 10),
    holeDiameter: rounded(native.holeRadius * 20), viaDiameter: rounded(native.radius * 20), viaType: "NORMAL", topSolderExpansion: 0,
    bottomSolderExpansion: 0, locked: false, unusedInnerLayers: [] } as const;
  let user: z.infer<typeof userSchema> | null = null;
  if (value.userUndefined) { need(value.userJson === null, "USER_UNDEFINED"); }
  else { need(value.userJson !== null, "USER"); const parsed: unknown = JSON.parse(value.userJson); user = userSchema.parse(parsed);
    need(canonicalJson(user) === canonicalJson(parsed), "USER_FIELDS"); }
  const head = { docType: "PCB", client: value.client, uuid: document.uuid, updateTime: value.clock, version: String(value.clock), editVersion: "3.2.209", ...(user === null ? {} : { user }) };
  const primitiveTicket = maximumTicket + 1;
  const expected = `${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(head)}|\n${JSON.stringify({ type: "VIA", ticket: primitiveTicket, id: effect.primitiveId })}||${JSON.stringify(sourceBody)}`;
  need(value.body === expected && Buffer.byteLength(expected) <= 16_384, "EXACT_BODY");
  return freezeDeep({ schema: "private.current-pcb-via-save-delta.v1", dataStr: value.body, bodySha256: sha256Text(value.body), documentUuid: document.uuid,
    primitiveId: effect.primitiveId, primitiveTicket, headTicket: value.headTicket, sourceBody, exactUniqueIdDeltaVerified: true,
    sourcePeerProjectionVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
}
