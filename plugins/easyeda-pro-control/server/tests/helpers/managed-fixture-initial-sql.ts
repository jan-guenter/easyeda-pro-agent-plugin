/* oxlint-disable import/max-dependencies -- The synthetic fixture joins the maintained generator, schema, crypto and genuine completed SQL reader without native project access. */
/** Synthetic SQLite and crypto only; never constructs or imports a native project. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue } from "node:sqlite";
import { generateManagedFixtureArchiveData } from "../../src/managed-fixture-generator.ts";
import type { ManagedFixtureGeneratorKind } from "../../src/managed-fixture-generator.ts";
import { MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS } from "../../src/managed-fixture-initial-sql.ts";
import type { qualifyGeneratedFixtureInitialSql } from "../../src/managed-fixture-initial-sql.ts";
import { readManagedLibraryZip } from "../../src/managed-library-files-zip.ts";
import { nativeProjectSymbolSqlSchema } from "../../src/native-project-sql-schema.ts";
import { readExactSqlInventory } from "../../src/sqlite-inventory.ts";
import { encrypted } from "./symbol-sql-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";

const actor = "4".repeat(32), branch = "3".repeat(32), headId = "5".repeat(32), key = "6".repeat(32), start = "2".repeat(32);
const directoryWindows = `C:\\SyntheticTemp\\CodexEasyedaFixture_${"1".repeat(32)}`;
type Patch = "extra-empty-table-row" | "changed-seed" | "extra-history" | "changed-header" | "bad-sequence" | "changed-arc" | undefined;
export async function managedFixtureInitialSqlFixture(patch?: Patch, kind: ManagedFixtureGeneratorKind = "line-and-via"): Promise<Parameters<typeof qualifyGeneratedFixtureInitialSql>[0] & { syntheticDatabasePath: string }> {
  const generated = generateManagedFixtureArchiveData(kind), source = readManagedLibraryZip(generated.bytes).get("Fixture.epru"); assert.ok(source !== undefined);
  const rawWindowsPath = `${directoryWindows}\\${generated.name.replace(/\.epro2$/u, ".eprj2")}`; const project = createHash("sha256").update(rawWindowsPath).digest("hex");
  const documentUuid = String(generated.metadata["documentUuid"]), generatedAt = Number(generated.metadata["generatedAtEpochMs"]);
  const when = Math.ceil(Date.now() / 1000) * 1000 + 1000; const utc = new Date(when).toISOString().slice(0, 19).replace("T", " ");
  const local = new Date(when + 60 * 60_000).toISOString().slice(0, 19).replace("T", " ");
  let sourceText = source.toString("utf8");
  if (patch === "changed-header") { sourceText = sourceText.replace('"type":"DOCHEAD"', '"type":"DOCHEAD","ticket":0'); }
  if (patch === "changed-arc") { sourceText = sourceText.replace('"angle":90', '"angle":91'); }
  const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: actor, username: "", nickname: "", updateTime: when })}|\n${sourceText}`;
  const structure = { boards: {}, schematics: {}, sheets: {}, pcbs: { [documentUuid]: { uuid: documentUuid, title: "PCB1", board: "", zIndex: null,
    parent_uuid: "", source: "", version: String(generatedAt), updateTime: generatedAt } }, panels: {}, blockSymbols: {}, owner: { uuid: `${directoryWindows}/`, username: "", nickname: "" } };
  const directory = await mkdtemp(join(syntheticSqlRoot(), "generated-initial-sql-")), path = join(directory, "synthetic.eprj2");
  const schema = nativeProjectSymbolSqlSchema(branch); const database = new DatabaseSync(path);
  try {
    for (const entry of schema.entries) { if (entry.type === "table" && entry.name !== "sqlite_sequence" && entry.sql !== null) { database.exec(entry.sql); } }
    for (const entry of schema.entries) { if (entry.type === "index" && entry.sql !== null) { database.exec(entry.sql); } }
    const insert = (name: string, record: Readonly<Record<string, SQLInputValue>>): void => {
      const names = Object.keys(record); database.prepare(`INSERT INTO "${name}" (${names.map((column) => `"${column}"`).join(",")}) VALUES (${names.map(() => "?").join(",")})`).run(...Object.values(record));
    };
    insert("db_versions", MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.db_versions.fields);
    insert("users", MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.users.fields);
    insert("projects", { uuid: project, archive: 0, name: String(generated.metadata["title"]), content: "", cbb_project: 0, thumb: "", ticket: 1, g_ticket: 1,
      owner_uuid: actor, creator_uuid: actor, created_at: utc, updated_at: local, modifier_uuid: actor, boards: "{}", block_symbol_attrs_groups: "{}", pcb_count: 0, branch_uuid: branch, default_sheet: "" });
    insert("project_members", { role: 1, project_uuid: project, user_uuid: actor, created_at: utc, updated_at: utc });
    insert("branches", { uuid: start, project_uuid: project, name: "start", history_uuid: null, creator_uuid: actor, description: "", parent_uuid: null, modifier_uuid: actor, node: 1, delete_status: 0, created_at: utc, updated_at: utc });
    insert("branches", { uuid: branch, project_uuid: project, name: "main", history_uuid: headId, creator_uuid: actor, description: "", parent_uuid: start, modifier_uuid: actor, node: 0, delete_status: 0, created_at: utc, updated_at: utc });
    insert("history_data", { uuid: headId, history_uuid: headId, dataStr: encrypted(plaintext, headId, key), created_at: utc, updated_at: utc });
    insert(`project_history_${branch}`, { uuid: headId, parent: null, snapshot: null, key, is_lock: 0, num: 0, created_at: utc, updated_at: utc, lock_time: "1970-01-01 08:00:00", snapshot_num: 0 });
    insert("project_structures", { ticket: 1, project_uuid: project, branch_uuid: branch, structure: JSON.stringify(structure) });
    if (patch === "extra-empty-table-row") { insert("editor_caches", { key: "unexpected", value: "retained unknown payload" }); }
    if (patch === "changed-seed") { database.exec("UPDATE db_versions SET value='unreviewed'"); }
    if (patch === "extra-history") { insert(`project_history_${branch}`, { uuid: "a".repeat(32), parent: headId, snapshot: null, key, created_at: utc, updated_at: utc }); }
    if (patch === "bad-sequence") { database.exec("UPDATE sqlite_sequence SET seq=9 WHERE name='branches'"); }
  } finally { database.close(); }
  const expectedSha256 = createHash("sha256").update(await readFile(path)).digest("hex");
  const inventory = await readExactSqlInventory({ checkpointPath: path, expectedSha256, runtime: await syntheticSqlRuntime() });
  return { archive: generated.bytes, inventory, rawWindowsPath, sourceCreatedEpochMs: when - 500, sourceModifiedEpochMs: when + 500, syntheticDatabasePath: path };
}
