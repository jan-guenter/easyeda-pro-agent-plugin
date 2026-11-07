/* oxlint-disable import/max-dependencies -- Exact two-document SQL/cipher fixtures and the production reader/parser verify cold data; no native owner or opening is mocked. */
/** Synthetic completed SQL and encrypted native history only. No original
 * closed-writer checkpoint, cache action or reopened application is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { canonicalJson } from "../src/core.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";
import { deriveGeneratedSavedHistoryLoadData } from "../src/current-generated-saved-history-load-data.ts";
import { prepareGeneratedSchematicRelevanceSavedLoadPlan, requireOriginalGeneratedSchematicRelevanceSavedLoadPlan } from "../src/generated-schematic-relevance-saved-load-plan.ts";
import type { GeneratedSchematicRelevanceDisplayClosedCheckpoint } from "../src/generated-schematic-relevance-display-closed-checkpoint.ts";
import { qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

function actualColdParser(chunks: readonly string[]): unknown {
  return runInNewContext(`(()=>{${SOURCE.Gu.source};${SOURCE.Ro.source};${SOURCE.Na.source};
const documents=new Map();class Parser{${SOURCE.flowParseFull.source};onEnd(){}onDocHead(value){if(!documents.has(value.uuid))documents.set(value.uuid,{uuid:value.uuid,docType:value.docType,records:new Map()});}onLine(id,ticket,body,type,client,docType,uuid){documents.get(uuid).records.set(id,{id,ticket,type,body:JSON.parse(body)});}}
const parser=new Parser();for(const text of ${JSON.stringify(chunks)}){const flow=parser.flowParseFull();flow.start();flow.update(text);flow.end();}return Array.from(documents.values(),value=>({...value,records:Array.from(value.records.values())}));})()`);
}
function orderedRows(rows: readonly unknown[]): readonly string[] { return rows.map(row => canonicalJson(row)).toSorted(); }

void test("saved schematic cold data preserves both documents, unchanged peers and actual delimiter-free native Save bytes", async () => {
  for (const mode of ["mutable", "append"] as const) {
    const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance");
    const initial = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(input);
    const { target } = initial.qualification;
    const before = initial.history.documents.find(document => document.docType === "SCH_PAGE"), parent = initial.history.documents.find(document => document.docType === "SCH");
    const text = before?.records.find(row => row.type === "TEXT"); assert.ok(before !== undefined && parent !== undefined && text !== undefined);
    const after = { ...text.body, x: 25, y: 40, zIndex: 1 }, now = Date.now();
    const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: "4".repeat(32), username: "", nickname: "", updateTime: now })}|\n{"type":"DOCHEAD","ticket":10}||${JSON.stringify({ uuid: target.pageUuid, docType: "SCH_PAGE", updateTime: now, version: String(now) })}|\n${JSON.stringify({ type: "TEXT", id: text.id, ticket: 9 })}||${JSON.stringify(after)}`;
    const head = (mode === "mutable" ? "5" : "7").repeat(32), key = (mode === "mutable" ? "6" : "8").repeat(32);
    const cipher = encrypted(plaintext, head, key);
    const database = new DatabaseSync(input.syntheticDatabasePath, { enableForeignKeyConstraints: false });
    try {
      if (mode === "mutable") { database.prepare(`UPDATE project_history_${target.branchUuid} SET num=1 WHERE uuid=?`).run(head); }
      else {
        database.prepare(`INSERT INTO project_history_${target.branchUuid} (uuid,parent,key,is_lock,num,snapshot_num) VALUES (?,?,?,0,0,0)`).run(head, "5".repeat(32), key);
        database.prepare("UPDATE branches SET history_uuid=? WHERE uuid=?").run(head, target.branchUuid);
      }
      database.prepare("INSERT INTO history_data (uuid,history_uuid,dataStr) VALUES (?,?,?)").run(mode === "mutable" ? `${head}-1` : head, head, cipher);
    } finally { database.close(); }
    const sourceSha256 = createHash("sha256").update(await readFile(input.syntheticDatabasePath)).digest("hex");
    const inventory = await readExactSqlInventory({ checkpointPath: input.syntheticDatabasePath, expectedSha256: sourceSha256, runtime: await syntheticSqlRuntime() });
    const data = await deriveGeneratedSavedHistoryLoadData(inventory, { ...target, documentUuid: target.pageUuid, sourceSha256 });
    const saved = data.chunks.find(chunk => chunk.dataBase64 === cipher); assert.ok(saved !== undefined); assert.equal(saved.plaintext, plaintext); assert.equal(saved.plaintext.endsWith("|\n"), false);
    const ordered = data.histories.toReversed().flatMap(row => data.chunks.filter(chunk => chunk.historyUuid === row["uuid"]).toSorted((a, b) => a.ordinal - b.ordinal).map(chunk => chunk.plaintext));
    const documents: unknown = structuredClone(actualColdParser(ordered)); assert.ok(Array.isArray(documents));
    const page: unknown = documents.find((value: unknown) => value !== null && typeof value === "object" && Reflect.get(value, "uuid") === target.pageUuid), schematic: unknown = documents.find((value: unknown) => value !== null && typeof value === "object" && Reflect.get(value, "uuid") === target.schematicUuid);
    assert.equal(documents.length, 2); assert.ok(page !== null && typeof page === "object" && schematic !== null && typeof schematic === "object");
    const pageRows: unknown = Reflect.get(page, "records"), parentRows: unknown = Reflect.get(schematic, "records"); assert.ok(Array.isArray(pageRows)); assert.equal(pageRows.length, 7);
    const fields = (rows: typeof before.records): readonly unknown[] => rows.map(({ body, id, ticket, type }) => ({ body, id, ticket, type }));
    assert.equal(canonicalJson(parentRows), canonicalJson(fields(parent.records)));
    const beforePeers = fields(before.records.filter(row => row.id !== text.id));
    assert.deepEqual(orderedRows(pageRows.filter((row: unknown) => row !== null && typeof row === "object" && Reflect.get(row, "id") !== text.id)), orderedRows(beforePeers));
    const savedText: unknown = pageRows.find((row: unknown) => row !== null && typeof row === "object" && Reflect.get(row, "id") === text.id); assert.ok(savedText !== null && typeof savedText === "object");
    assert.deepEqual(Reflect.get(savedText, "body"), after); assert.equal(data.nativeLoadingVerified, false); assert.equal(data.reopenedVerified, false);
  }
});
void test("serialized schematic checkpoints and plans cannot create cold-load custody", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate serialized forgery must stop at the original closed-checkpoint registry.
  const copied = { profile: "private.generated-schematic-relevance-display-closed-checkpoint.v1" } as GeneratedSchematicRelevanceDisplayClosedCheckpoint;
  assert.throws(() => prepareGeneratedSchematicRelevanceSavedLoadPlan(copied));
  assert.throws(() => requireOriginalGeneratedSchematicRelevanceSavedLoadPlan({ profile: "private.generated-schematic-relevance-saved-load-plan.v1" }, copied));
});
