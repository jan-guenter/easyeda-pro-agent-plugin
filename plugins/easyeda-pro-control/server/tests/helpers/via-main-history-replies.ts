/** Synthetic inspector packets only. The actual backend/custody and fixed
 * programs are tested separately; no application or SQL driver runs here. */
import { createCipheriv } from "node:crypto";
import { gzipSync } from "node:zlib";
import type { CurrentPcbViaMainHistoryCommand as Command } from "../../src/current-pcb-via-main-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS as SLOTS, currentPcbViaMainHistoryFrame } from "../../src/current-pcb-via-main-history-protocol.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as PROGRAMS } from "../../src/current-project-history-main-programs.ts";
import { viaMainActorValue } from "./via-main-actor-replies.ts";

type Data = Record<string, unknown>;
export const historyBaseline = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), initialLogicalSha256: "7".repeat(64),
  branch: Object.freeze({ node: 0 as const, uuid: "b".repeat(32), delete_status: 0 as const, history_uuid: "2".repeat(32) }),
  head: Object.freeze({ num: 0 as const, uuid: "2".repeat(32), key: "1".repeat(32), is_lock: 0 as const, created_at: "2026-11-06 00:00:00" }),
  structure: Object.freeze({ ticket: 1 as const, structure: "{}" }) });
const history = "3".repeat(32), key = "4".repeat(32);
const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(history, "hex"));
// oxlint-disable-next-line node/no-sync -- Deterministic in-memory source framing; no SQL/application call.
const plain = gzipSync(Buffer.from(`{"type":"EDIT_HEAD"}||${JSON.stringify(viaMainActorValue)}|\noriginal-held-body`), { level: 1 });
const encrypted = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data => ({ name, value, writable, enumerable, configurable, isOwn: true });
const value = (data: unknown): Data => ({ result: { type: "object", value: data } });
export function viaMainHistoryReply(command: Command, id: number, slot: string): unknown {
  const array = (length: number): Data => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: `history-packet-${String(id)}` } });
  if (command.phase === "via-main-history-arm") { return { breakpointId: `history-${command.role}`, actualLocation: command.params.location }; }
  if (command.phase === "via-main-history-callback-arm") { return { breakpointId: "history-callback" }; }
  if (command.phase === "via-main-history-frame") { return array(currentPcbViaMainHistoryFrame(command.role).length); }
  if (command.phase === "via-main-history-properties") {
    if (command.role === "transaction") { const source = "async()=>{let o=await hB(e,r,a.history_uuid,a.uuid);!o||o.is_lock||!Number(o.is_within_one_minute)?s=await bB(e,r,i,a):s=await OB(e,r,i,a,o)}";
      return { result: [property("0", { type: "object", objectId: "transaction-frame" }, true, true), property("1", { type: "object", objectId: "save-packet" }, true, true), property("2", { type: "function", className: "AsyncFunction", description: source, objectId: "original-history-callback" }, true, true), property("length", { type: "number", value: 3 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
    }
    return { result: [property("name", { type: "string", value: "" }), property("length", { type: "number", value: 0 })], internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "app", lineNumber: 8572, columnNumber: 20_054 } } },
      { name: "[[Prototype]]", value: { type: "object", className: "AsyncFunction", objectId: "async-prototype" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[4]", objectId: "scopes" } }] };
  }
  if (command.phase === "via-main-history-join") {
    if (!PROGRAMS[command.role].returnByValue) { return array(PROGRAMS[command.role].length); }
    if (command.role === "branchValue") { return value({ mode: "append", branch: historyBaseline.branch, head: historyBaseline.head, withinOneMinute: 0 }); }
    if (command.role === "cipherValue") { return value({ historyUuid: history, chunkUuid: history, keyHex: key, cipherHexParts: [encrypted.toString("hex")] }); }
    if (command.role === "sqlValue") { let fields: Data = {}; if (slot === "data") { fields = { dataBase64Parts: [encrypted.toString("base64")] }; } else if (slot === "project") { fields = { updatedAt: "2026-11-06 01:02:03", modifierUuid: viaMainActorValue.uuid }; } return value({ kind: slot, fields }); }
    if (command.role === "sqlCallbackValue") { return value({ kind: slot, changes: 1, lastID: 2 }); }
    return value({ historyUuid: history, originalServiceAwaitCompleted: true, controllerBodyJoined: true });
  } return {};
}
export function viaMainHistoryWindow(role: string): Readonly<{ slot: typeof SLOTS[number]; beforeEpochMs: number; afterEpochMs: number }> | null {
  const slot = SLOTS.find(item => role === `sql-${item}` || role === `callback-${item}`); if (slot === undefined) { return null; }
  const beforeEpochMs = 1_793_920_000_000 + SLOTS.indexOf(slot) * 10; return Object.freeze({ slot, beforeEpochMs, afterEpochMs: role.startsWith("callback-") ? beforeEpochMs + 1 : 0 });
}
