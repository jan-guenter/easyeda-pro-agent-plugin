/* oxlint-disable import/max-dependencies -- Synthetic SCH data joins the fixed generator, native schema and a genuine completed SQL inventory; no native project or PCB stand-in is constructed. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue } from "node:sqlite";
import { MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS } from "../../src/managed-fixture-initial-sql-common.ts";
import type { GeneratedFixtureInitialSqlInput } from "../../src/managed-fixture-initial-sql-common.ts";
import { readManagedLibraryZip } from "../../src/managed-library-files-zip.ts";
import { generateManagedSchematicFixtureArchiveData } from "../../src/managed-schematic-fixture-generator.ts";
import { nativeProjectSymbolSqlSchema } from "../../src/native-project-sql-schema.ts";
import { readExactSqlInventory } from "../../src/sqlite-inventory.ts";
import { encrypted } from "./symbol-sql-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";

type Patch = "extra-auxiliary" | "wrong-structure-parent" | "changed-text" | "ticked-page-header" | "extra-history" | undefined;
/** Fixed synthetic SCH rows only. This is not execution of a native importer. */
export async function managedSchematicFixtureInitialSqlFixture(patch?: Patch): Promise<GeneratedFixtureInitialSqlInput & { syntheticDatabasePath: string }> {
  const generated = generateManagedSchematicFixtureArchiveData(), source = readManagedLibraryZip(generated.bytes).get("Fixture.epru"); assert.ok(source !== undefined);
  const directory = `C:\\SyntheticTemp\\CodexEasyedaFixture_${"1".repeat(32)}`, rawWindowsPath = `${directory}\\${generated.name.replace(/\.epro2$/u, ".eprj2")}`;
  const project = createHash("sha256").update(rawWindowsPath).digest("hex"); const actor = "4".repeat(32), branch = "3".repeat(32), headId = "5".repeat(32), key = "6".repeat(32), start = "2".repeat(32);
  const schematicUuid = String(generated.metadata["schematicUuid"]); const pageUuid = String(generated.metadata["pageUuid"]); const generatedAt = Number(generated.metadata["generatedAtEpochMs"]);
  const when = Math.ceil(Date.now() / 1000) * 1000 + 1000; const utc = new Date(when).toISOString().slice(0, 19).replace("T", " "); const local = new Date(when + 60 * 60_000).toISOString().slice(0, 19).replace("T", " ");
  let text = source.toString("utf8");
  if (patch === "changed-text") { text = text.replace("Disposable schematic fixture", "Substituted schematic fixture"); }
  if (patch === "ticked-page-header") { const at = text.indexOf('{"type":"DOCHEAD"}', 1); text = `${text.slice(0, at)}${text.slice(at).replace('{"type":"DOCHEAD"}', '{"type":"DOCHEAD","ticket":0}')}`; }
  const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: actor, username: "", nickname: "", updateTime: when })}|\n${text}`;
  const structure = { boards: {}, schematics: { [schematicUuid]: { uuid: schematicUuid, name: "Schematic1", board: "", source: "", version: String(generatedAt), updateTime: generatedAt } },
    sheets: { [pageUuid]: { uuid: pageUuid, title: "Sheet1", schematic_uuid: patch === "wrong-structure-parent" ? pageUuid : schematicUuid, zIndex: 1, source: "", version: String(generatedAt), updateTime: generatedAt } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner: { uuid: `${directory}/`, username: "", nickname: "" } };
  const temporary = await mkdtemp(join(syntheticSqlRoot(), "generated-sch-initial-")); const path = join(temporary, "synthetic.eprj2"); const schema = nativeProjectSymbolSqlSchema(branch); const database = new DatabaseSync(path);
  try {
    for (const entry of schema.entries) { if (entry.type === "table" && entry.name !== "sqlite_sequence" && entry.sql !== null) { database.exec(entry.sql); } }
    for (const entry of schema.entries) { if (entry.type === "index" && entry.sql !== null) { database.exec(entry.sql); } }
    const insert = (name: string, record: Readonly<Record<string, SQLInputValue>>): void => {
      const names = Object.keys(record); database.prepare(`INSERT INTO "${name}" (${names.map(value => `"${value}"`).join(",")}) VALUES (${names.map(() => "?").join(",")})`).run(...Object.values(record));
    };
    insert("db_versions", MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.db_versions.fields); insert("users", MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.users.fields);
    insert("projects", { uuid: project, archive: 0, name: String(generated.metadata["title"]), content: "", cbb_project: 0, thumb: "", ticket: 1, g_ticket: 1,
      owner_uuid: actor, creator_uuid: actor, created_at: utc, updated_at: local, modifier_uuid: actor, boards: "{}", block_symbol_attrs_groups: "{}", pcb_count: 0, branch_uuid: branch, default_sheet: "" });
    insert("project_members", { role: 1, project_uuid: project, user_uuid: actor, created_at: utc, updated_at: utc });
    insert("branches", { uuid: start, project_uuid: project, name: "start", history_uuid: null, creator_uuid: actor, description: "", parent_uuid: null, modifier_uuid: actor, node: 1, delete_status: 0, created_at: utc, updated_at: utc });
    insert("branches", { uuid: branch, project_uuid: project, name: "main", history_uuid: headId, creator_uuid: actor, description: "", parent_uuid: start, modifier_uuid: actor, node: 0, delete_status: 0, created_at: utc, updated_at: utc });
    insert("history_data", { uuid: headId, history_uuid: headId, dataStr: encrypted(plaintext, headId, key), created_at: utc, updated_at: utc });
    insert(`project_history_${branch}`, { uuid: headId, parent: null, snapshot: null, key, is_lock: 0, num: 0, created_at: utc, updated_at: utc, lock_time: "1970-01-01 08:00:00", snapshot_num: 0 });
    insert("project_structures", { ticket: 1, project_uuid: project, branch_uuid: branch, structure: JSON.stringify(structure) });
    if (patch === "extra-auxiliary") { insert("editor_caches", { key: "unexpected", value: "unknown SCH startup effect" }); }
    if (patch === "extra-history") { insert(`project_history_${branch}`, { uuid: "a".repeat(32), parent: headId, snapshot: null, key, created_at: utc, updated_at: utc }); }
  } finally { database.close(); }
  const expectedSha256 = createHash("sha256").update(await readFile(path)).digest("hex"), inventory = await readExactSqlInventory({ checkpointPath: path, expectedSha256, runtime: await syntheticSqlRuntime() });
  return { archive: generated.bytes, inventory, rawWindowsPath, sourceCreatedEpochMs: when - 500, sourceModifiedEpochMs: when + 500, syntheticDatabasePath: path };
}
