/** Synthetic SQL/crypto construction only; never a native fixture setup route. */
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue } from "node:sqlite";
import { gzipSync } from "node:zlib";
import { readExactSqlInventory } from "../../src/sqlite-inventory.ts";
import { nativeProjectSymbolSqlSchema } from "../../src/native-project-sql-schema.ts";
import type { SymbolSqlWitness } from "../../src/symbol-sql-comparator.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";

export const IDS = Object.freeze({ start: "0".repeat(32), project: "1".repeat(32), target: "2".repeat(32), branch: "3".repeat(32), actor: "4".repeat(32),
  oldHead: "5".repeat(32), oldKey: "6".repeat(32), newHead: "77777777777747778777777777777777", newKey: "8".repeat(32), peer: "9".repeat(32) });
export const HISTORY_TABLE = `project_history_${IDS.branch}`;
export const TIMES = Object.freeze({ document: Date.parse("2026-10-12T12:34:56.500Z"), edit: Date.parse("2026-10-12T12:34:57.100Z"),
  chunk: "2026-10-12 12:34:57", head: "2026-10-12 12:34:58", project: "2026-10-12 14:34:59" });
export const OPERATION = Object.freeze({ id: "synthetic-full-sql", action: "library.symbol.modify", libraryUuid: IDS.project,
  target: { uuid: IDS.target }, patch: { name: "Renamed synthetic symbol", description: "New synthetic description" } });
export const WITNESS: SymbolSqlWitness = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, actorUuid: IDS.actor,
  client: "a".repeat(16), preDispatchMaxTicket: 100, serverClockMinMs: Date.parse("2026-10-12T12:34:56.000Z"),
  serverClockMaxMs: Date.parse("2026-10-12T12:35:00.000Z"), serverLocalOffsetMinutes: 120 });
export function encrypted(plaintext: string, historyUuid: string, keyHex: string): string {
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(keyHex, "hex"), Buffer.from(historyUuid, "hex"));
  // oxlint-disable-next-line node/no-sync -- Tiny fixed synthetic payload generation; production uses the maintained asynchronous bounded decoder.
  return Buffer.concat([cipher.update(gzipSync(plaintext, { level: 1 })), cipher.final(), cipher.getAuthTag()]).toString("base64");
}
function record(header: unknown, body?: unknown): string { return `${JSON.stringify(header)}||${body === undefined ? "" : JSON.stringify(body)}`; }
export function expectedRaw(): string {
  return [record({ type: "EDIT_HEAD" }, { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: TIMES.edit }),
    record({ type: "DOCHEAD", ticket: 101 }, { docType: "SYMBOL", client: WITNESS.client, uuid: IDS.target, updateTime: TIMES.document,
      version: String(TIMES.document), editVersion: "3.0" }),
    record({ type: "META", ticket: 101, id: "META" }, { title: OPERATION.patch.name, description: OPERATION.patch.description,
      tags: ["synthetic"], docType: 2, source: "" })].join("|\n");
}
function oldRaw(): string {
  return [record({ type: "EDIT_HEAD" }, { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: 1 }),
    record({ type: "DOCHEAD", ticket: 1 }, { docType: "SYMBOL", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" }),
    record({ type: "META", ticket: 1, id: "META" }, { title: "Original synthetic", description: "Old synthetic description", tags: ["synthetic"], docType: 2, source: "" }),
    record({ type: "LINE", ticket: 90, id: "deleted-shape" }, { x: 0 }), record({ type: "LINE", ticket: 100, id: "deleted-shape" }),
    record({ type: "DOCHEAD", ticket: 2 }, { docType: "SYMBOL", client: "b".repeat(16), uuid: IDS.peer, updateTime: 1, version: "1", editVersion: "3.0" }),
    record({ type: "META", ticket: 2, id: "META" }, { title: "Peer synthetic", description: "Keep peer", tags: [], docType: 2, source: "" })].join("|\n");
}
function insertRequired(database: DatabaseSync, table: string, supplied: Readonly<Record<string, SQLInputValue>>): void {
  const columns = database.prepare(`PRAGMA table_info("${table}")`).all();
  const values: Record<string, SQLInputValue> = { ...supplied };
  for (const column of columns) {
    const name = String(column["name"]); const type = String(column["type"]);
    if (!Object.hasOwn(values, name) && column["notnull"] === 1 && column["dflt_value"] === null && !(column["pk"] === 1 && type.toUpperCase() === "INTEGER")) {
      values[name] = /(?:int|boolean|real)/iu.test(type) ? 0 : "";
    }
  }
  const names = Object.keys(values);
  database.prepare(`INSERT INTO "${table}" (${names.map((name) => `"${name}"`).join(",")}) VALUES (${names.map(() => "?").join(",")})`).run(...Object.values(values));
}
export async function inventory(path: string): ReturnType<typeof readExactSqlInventory> {
  const expectedSha256 = createHash("sha256").update(await readFile(path)).digest("hex");
  return readExactSqlInventory({ checkpointPath: path, expectedSha256, runtime: await syntheticSqlRuntime() });
}
export async function fixture(): Promise<Readonly<{ path: string; before: Awaited<ReturnType<typeof readExactSqlInventory>> }>> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "synthetic-symbol-sql-")); const path = join(directory, "source.eprj2");
  const database = new DatabaseSync(path, { enableForeignKeyConstraints: false });
  try {
    database.exec("BEGIN");
    const schema = nativeProjectSymbolSqlSchema(IDS.branch).entries;
    for (const entry of [...schema.filter((value) => value.type === "table"), ...schema.filter((value) => value.type === "index")]) {
      if (entry.sql !== null && entry.name !== "sqlite_sequence") { database.exec(entry.sql); }
    }
    insertRequired(database, "db_versions", { key: "sqlite", value: "25.10.31.1" });
    insertRequired(database, "users", { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" });
    insertRequired(database, "projects", { uuid: IDS.project, branch_uuid: IDS.branch, owner_uuid: IDS.actor, name: "Synthetic only", ticket: 100 });
    insertRequired(database, "branches", { uuid: IDS.start, project_uuid: IDS.project, history_uuid: null, name: "start", node: 1, parent_uuid: null });
    insertRequired(database, "branches", { uuid: IDS.branch, project_uuid: IDS.project, history_uuid: IDS.oldHead, name: "synthetic", node: 0, parent_uuid: IDS.start });
    insertRequired(database, HISTORY_TABLE, { id: 5, uuid: IDS.oldHead, parent: null, snapshot: null, key: IDS.oldKey, is_lock: 1,
      num: 0, created_at: "2020-01-01 00:00:00", updated_at: "2020-01-01 00:00:00", snapshot_num: 0 });
    insertRequired(database, "history_data", { id: 7, uuid: IDS.oldHead, history_uuid: IDS.oldHead, dataStr: encrypted(oldRaw(), IDS.oldHead, IDS.oldKey) });
    database.exec("UPDATE sqlite_sequence SET seq=11 WHERE name='history_data'");
    insertRequired(database, "project_structures", { id: 1, ticket: 100, project_uuid: IDS.project, branch_uuid: IDS.branch,
      structure: JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: {}, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor } }) });
    insertRequired(database, "project_images", { uuid: IDS.peer, project_uuid: IDS.project, branch_uuid: IDS.branch, url: "synthetic" });
    insertRequired(database, "resources", { hash: "synthetic-resource", dataStr: "keep raw peer bytes" });
    database.exec("COMMIT");
  } finally { database.close(); }
  return { path, before: await inventory(path) };
}
export function mutate(path: string, sql: string): void {
  const database = new DatabaseSync(path, { enableForeignKeyConstraints: false });
  try { database.exec(sql); } finally { database.close(); }
}
export function applyEffect(path: string, raw = expectedRaw(), headUuid: string = IDS.newHead, keyHex = IDS.newKey): void {
  const database = new DatabaseSync(path, { enableForeignKeyConstraints: false });
  try {
    database.exec("BEGIN");
    database.prepare("INSERT INTO history_data(uuid,history_uuid,dataStr,created_at,updated_at) VALUES(?,?,?,?,?)").run(headUuid, headUuid, encrypted(raw, headUuid, keyHex), TIMES.chunk, TIMES.chunk);
    database.prepare(`INSERT INTO "${HISTORY_TABLE}"(uuid,parent,snapshot,key,created_at,updated_at) VALUES(?,?,?,?,?,?)`).run(headUuid, IDS.oldHead, null, keyHex, TIMES.head, TIMES.head);
    database.prepare("UPDATE branches SET history_uuid=? WHERE uuid=?").run(headUuid, IDS.branch);
    database.prepare("UPDATE projects SET updated_at=?,modifier_uuid=? WHERE 1=1").run(TIMES.project, IDS.actor);
    database.prepare("UPDATE project_structures SET ticket=101 WHERE branch_uuid=?").run(IDS.branch);
    database.exec("COMMIT");
  } finally { database.close(); }
}
