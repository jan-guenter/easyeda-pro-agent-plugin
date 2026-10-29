/** Synthetic SQLite/crypto forward-copy and inverse appends. No app, native
 * process owner, destination deletion or production project is involved. */
import { DatabaseSync } from "node:sqlite";
import { prepareCurrentFootprintSourcePlan } from "../../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintCopyV2SqlPlan, verifyCurrentFootprintCopyV2SqlEffect } from "../../src/current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintDeletePlan } from "../../src/current-footprint-delete-plan.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";

export const DELETE_CLIENT = "f".repeat(16), DELETE_TARGET = "e".repeat(16);
export const DELETE_HEAD = "bbbbbbbbbbbb4bbb8bbbbbbbbbbbbbbb", DELETE_KEY = "c".repeat(32);
const actor = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" }, client = "a".repeat(16);
const meta = { title: "Source", description: "Keep Ω", tags: ["kept"], source: "original" };
const canvas = '{"type":"CANVAS","ticket":10,"id":"CANVAS"}||{"originX":0}';
const pad = '{"type":"PAD","ticket":12,"id":"pad"}||{"number":"1", "unknown":[1,"Ω"]}';
function row(type: string, ticket: number, id: string, body: unknown): string { return `${JSON.stringify({ type, ticket, id })}||${JSON.stringify(body)}`; }
function head(uuid: string, ticket: number, time: number, user = false): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.209", ...(user ? { user: actor } : {}) })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...actor, updateTime: time })}`; }
export async function footprintDeleteSqlFixture(): Promise<Readonly<{
  path: string;
  input: Readonly<{
    copySqlPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SqlPlan>>; copyEffect: unknown;
    copyAfter: Awaited<ReturnType<typeof inventory>>; before: Awaited<ReturnType<typeof inventory>>;
    witness: Readonly<{
      projectUuid: string; branchUuid: string; backendActorUuid: string; client: string; preDispatchMaxTicket: 102;
      documentClockMinMs: number; documentClockMaxMs: number; backendClockMinMs: number; backendClockMaxMs: number;
      backendLocalOffsetMinutes: number; managerUserAbsent: true;
      agedHead: Readonly<{ createdAtLiteral: string; nativeParsedLocalMs: number; nativeTimezoneOffsetMinutes: number }>;
    }>;
  }>;
  raw: string; apply: (raw?: string) => void;
}>> {
  const initial = await fixture();
  const raw = [edit(1), head(IDS.target, 100, 300, true), row("META", 5, "META", meta), canvas, pad,
    head(IDS.peer, 2, 2, true), row("META", 2, "META", { ...meta, title: "Peer" })].join("|\n");
  mutate(initial.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const beforeCopy = await inventory(initial.path);
  const source = await prepareCurrentFootprintSourcePlan(beforeCopy, { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const copy = await prepareCurrentFootprintCopyV2Plan(beforeCopy, source, { client, content: [head(IDS.target, 101, 300, true),
    row("META", 12, "META", meta), head(IDS.target, 100, 300, true), canvas, pad].join("|\n") });
  const copySqlPlan = await prepareCurrentFootprintCopyV2SqlPlan({ before: beforeCopy, copyPlan: copy, witness: {
    projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client, preDispatchMaxTicket: 100,
    documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
    backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: 120,
  } });
  const created = [edit(TIMES.edit), head(DELETE_TARGET, 101, TIMES.document), row("META", 101, "META", { ...meta, title: "Source_1", source: "" }),
    head(DELETE_TARGET, 102, TIMES.document + 1), row("META", 12, "META", meta), canvas, pad].join("|\n");
  applyEffect(initial.path, created); mutate(initial.path, "UPDATE project_structures SET ticket=100");
  const copyAfter = await inventory(initial.path), copyEffect = await verifyCurrentFootprintCopyV2SqlEffect(copySqlPlan, copyAfter, { returnedUuid: DELETE_TARGET });
  const witness = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: DELETE_CLIENT, preDispatchMaxTicket: 102 as const,
    documentClockMinMs: WITNESS.serverClockMinMs + 120_000, documentClockMaxMs: WITNESS.serverClockMaxMs + 120_000,
    backendClockMinMs: WITNESS.serverClockMinMs + 120_000, backendClockMaxMs: WITNESS.serverClockMaxMs + 120_000,
    backendLocalOffsetMinutes: 120, managerUserAbsent: true as const,
    agedHead: Object.freeze({ createdAtLiteral: TIMES.head, nativeParsedLocalMs: Date.parse("2026-10-12T10:34:58Z"), nativeTimezoneOffsetMinutes: -120 }) });
  const deletion = prepareCurrentFootprintDeletePlan({ targetUuid: DELETE_TARGET, client: DELETE_CLIENT,
    maximumTicketBeforeClock: 102, maximumTicketAfterClock: 102, documentClock: TIMES.document + 120_000,
    managerUserAbsent: true, editorVersion: "3.2.209" });
  const deletionRaw = `${edit(TIMES.edit + 120_000)}|\n${deletion.workerUpload}`;
  const apply = (value = deletionRaw): void => {
    const database = new DatabaseSync(initial.path, { enableForeignKeyConstraints: false });
    try {
      database.exec("BEGIN");
      database.prepare("INSERT INTO history_data(uuid,history_uuid,dataStr,created_at,updated_at) VALUES(?,?,?,?,?)")
        .run(DELETE_HEAD, DELETE_HEAD, encrypted(value, DELETE_HEAD, DELETE_KEY), "2026-10-12 12:36:57", "2026-10-12 12:36:57");
      database.prepare(`INSERT INTO "project_history_${IDS.branch}"(uuid,parent,snapshot,key,created_at,updated_at) VALUES(?,?,?,?,?,?)`)
        .run(DELETE_HEAD, IDS.newHead, null, DELETE_KEY, "2026-10-12 12:36:58", "2026-10-12 12:36:58");
      database.prepare("UPDATE branches SET history_uuid=? WHERE uuid=?").run(DELETE_HEAD, IDS.branch);
      database.prepare("UPDATE projects SET updated_at=?,modifier_uuid=?").run("2026-10-12 14:36:59", IDS.actor);
      database.exec("COMMIT");
    } finally { database.close(); }
  };
  return { path: initial.path, input: { copySqlPlan, copyEffect, copyAfter, before: await inventory(initial.path), witness }, raw: deletionRaw, apply };
}
