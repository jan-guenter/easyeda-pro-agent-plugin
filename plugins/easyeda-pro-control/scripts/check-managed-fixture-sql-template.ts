/** Pinned source literals and a synthetic in-memory database only. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { parse } from "acorn";
import { z } from "zod";
import { canonicalJson, sha256Json } from "../server/src/core.ts";
import { MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS } from "../server/src/managed-fixture-initial-sql.ts";
import { verifyManagedFixtureImportSources } from "../server/src/managed-fixture-import-profile.ts";

function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function addChildren(node: Record<string, unknown>, pending: unknown[]): void {
  for (const value of Object.values(node)) { if (Array.isArray(value)) { for (const child of value as unknown[]) { pending.push(child); } } else if (record(value)) { pending.push(value); } }
}
async function main(): Promise<void> {
  assert.equal(process.argv.length, 2); const root = process.env["EASYEDA_ASSETS_ROOT"]; assert.ok(root !== undefined);
  await verifyManagedFixtureImportSources(root);
  const bytes = await readFile(join(root, "../app.js")); assert.equal(createHash("sha256").update(bytes).digest("hex"), "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c");
  const tree = parse(bytes.toString("utf8"), { ecmaVersion: "latest", sourceType: "script" });
  const names = ["TT", "c2", "u2", "l2", "f2", "L2", "dT"] as const; const pending: unknown[] = [tree]; const literals = new Map<string, string>();
  const quasi = z.object({ value: z.object({ cooked: z.string() }) });
  const literal = z.object({ type: z.literal("TemplateLiteral"), expressions: z.array(z.unknown()).length(0), quasis: z.array(quasi) });
  while (pending.length > 0) {
    const node = pending.pop(); if (record(node)) {
    if (node["type"] === "VariableDeclarator" && typeof node["start"] === "number" && node["start"] > 1_200_000 && node["start"] < 1_300_000 && record(node["id"])) {
      const id = node["id"]["name"];
      if (typeof id === "string" && names.some((name) => name === id)) { assert.equal(literals.has(id), false); literals.set(id, literal.parse(node["init"]).quasis.map((value) => value.value.cooked).join("")); }
    }
    addChildren(node, pending);
    }
  }
  // The vendor's migration literals use legacy SQLite double-quoted strings.
  // Enable that syntax only in this synthetic source reproduction database.
  const database = new DatabaseSync(":memory:", { enableDoubleQuotedStringLiterals: true });
  try {
    for (const name of names) {
      const sql = literals.get(name); assert.ok(sql !== undefined);
      for (const batch of sql.replaceAll(/^--.*$/gu, "").split(/\r?\n\r?\n/mu)) { if (!/^\s*$/u.test(batch)) { database.exec(batch); } }
    }
    const tables = z.array(z.object({ name: z.string() })).parse(database.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all());
    for (const { name } of tables) {
      assert.match(name, /^[a-z_]+$/u);
      const rows = database.prepare(`SELECT rowid,* FROM "${name}" ORDER BY rowid`).all();
      if (name === "users" || name === "db_versions") {
        const expected = MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS[name]; assert.equal(canonicalJson(rows), canonicalJson([{ rowid: expected.rowid, ...expected.fields }]));
      } else { assert.equal(rows.length, 0, `Source baseline ${name} must be empty.`); }
    }
    process.stdout.write(`${JSON.stringify({ ok: true, sourceSha256: createHash("sha256").update(bytes).digest("hex"),
      literalRoster: names, tableCount: tables.length, nonemptyTableRoster: ["db_versions", "users"],
      fixedRowsSha256: sha256Json(MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS), syntheticInMemoryOnly: true, nativeProjectRead: false })}\n`);
  } finally { database.close(); }
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed read-only qualification script awaits its source/synthetic checks before exiting.
await main();
