/** Actual completed synthetic SQL/cipher data plus inert pinned parser only.
 * No application, native owner, checkpoint issuer or cache continuation exists. */
/* oxlint-disable import/max-dependencies -- Focused real SQL/cipher and exact parser projection check uses both distinct fixture issuers plus the production private-data seam. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext, runInThisContext } from "node:vm";
import { types } from "node:util";
import { transform } from "esbuild";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";
import { prepareCurrentGeneratedInitialFlowCachePlan, requireOriginalCurrentGeneratedInitialFlowCachePlan } from "../src/current-generated-initial-flow-cache-plan.ts";
import type { CurrentGeneratedInitialFlowCacheData, CurrentGeneratedInitialFlowCachePrepared } from "../src/current-generated-initial-flow-cache-plan.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

async function actualDeriver(): Promise<(qualification: unknown, history: unknown) => Promise<CurrentGeneratedInitialFlowCacheData>> {
  const url = new URL("../src/current-generated-initial-flow-cache-plan.ts", import.meta.url); const loaded = { exports: {} as Record<string, unknown> };
  // Expose the production private pure-data function only in this inert VM;
  // The actual public issuer still requires a genuine original checkpoint.
  const source = `${await readFile(url, "utf8")}\nexport { deriveInitialFlowCacheData };`;
  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [createRequire(url), loaded, loaded.exports]); const derive = loaded.exports["deriveInitialFlowCacheData"]; assert.ok(typeof derive === "function");
  return async (qualification, history): Promise<CurrentGeneratedInitialFlowCacheData> => {
    const pending: unknown = Reflect.apply(derive, undefined, [qualification, history]); assert.ok(types.isPromise(pending)); const result: unknown = await pending;
    assert.ok(result !== null && typeof result === "object" && "data" in result);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The production typed function above is executed unchanged; this seam exposes only its inert data result.
    return result.data as CurrentGeneratedInitialFlowCacheData;
  };
}
void test("genuine initial SQL decrypts into exact raw PCB/SCH bodies and the source-derived ordered head index", async () => {
  const derive = await actualDeriver();
  for (const kind of ["pcb", "schematic", "relevance"] as const) {
    const input = kind === "pcb" ? await managedFixtureInitialSqlFixture() : await managedSchematicFixtureInitialSqlFixture(undefined, kind === "relevance" ? "relevance" : "original");
    const qualifiers = { pcb: qualifyGeneratedFixtureInitialSql, schematic: qualifyGeneratedSchematicFixtureInitialSql, relevance: qualifyGeneratedSchematicRelevanceFixtureInitialSql };
    const qualified = await qualifiers[kind](input);
    const data = await derive(qualified.qualification, qualified.history);
    assert.equal(data.documents.length, kind === "pcb" ? 1 : 2); assert.equal(data.cacheContinuationAuthorized, false); assert.equal(data.nativeWorkerOwnershipVerified, false);
    const archive = readManagedLibraryZip(input.archive).get("Fixture.epru"); assert.ok(archive !== undefined);
    assert.equal(data.documents.map(document => document.body).join("|\n"), archive.toString("utf8").slice(0, -2));
    const initial: unknown = JSON.parse(data.headIndex.body); assert.ok(Array.isArray(initial)); const head: unknown = initial[0]; assert.ok(head !== null && typeof head === "object");
    assert.deepEqual(Object.keys(head), ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time", "iv", "dataStrUrl", "editHead", "docs", "docIds"]);
    const rawHead = Object.fromEntries(Object.entries(head).filter(([key]) => !["editHead", "docs", "docIds"].includes(key)));
    const actor: unknown = Reflect.get(head, "editHead"); assert.ok(Array.isArray(actor));
    const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify(actor[0])}|\n${archive.toString("utf8")}`;
    const raw: unknown = runInNewContext(`(()=>{const input=${JSON.stringify({ row: rawHead, plaintext, project: data.projectUuid, branch: data.branchUuid })},puts=[],location={origin:"https://client"},Request=class{},console={error(){throw Error("unexpected parser error")}};
${SOURCE.Gu.source};${SOURCE.Ro.source};var ${SOURCE.groupTypes.source};${SOURCE.Na.source};${SOURCE.$y.source};${SOURCE.Uo.source};
const parser={${SOURCE.flowParseFull.source},${SOURCE.onEditHead.source},onDocHead(){},onLine(){},onEnd(){}};class Response{constructor(body){this.body=body}}
const target={${SOURCE.getFlowParse.source},cachePromise:new Set(),consistencyManager:parser,cache:{put(key,response){puts.push({key,body:response.body});return Promise.resolve();}}};
const flow=target.getFlowParse(input.row,0,true,true);flow.start();flow.update(input.plaintext);flow.end();return{puts,index:JSON.stringify([input.row])};})()`, {}, { timeout: 1000 });
    assert.ok(raw !== null && typeof raw === "object"); assert.equal(JSON.stringify(Reflect.get(raw, "puts")), JSON.stringify(data.documents.map(document => ({ key: document.url, body: document.body }))));
    assert.equal(Reflect.get(raw, "index"), data.headIndex.body); assert.equal(Object.isFrozen(data.documents), true);
    await assert.rejects(derive(structuredClone(qualified.qualification), qualified.history));
  }
});
void test("serialized checkpoints, token copies and getter profiles cannot mint the original plan", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forged MCP-shaped data must fail before any checkpoint/file IO.
  const copied = { profile: "easyeda-pro-control.generated-fixture-open-checkpoint.v1" } as CurrentGeneratedInitialFlowCachePrepared;
  assert.throws(() => prepareCurrentGeneratedInitialFlowCachePlan(copied));
  assert.throws(() => requireOriginalCurrentGeneratedInitialFlowCachePlan({ profile: "private.current-generated-initial-flow-cache-plan.v1" }, copied));
  let accesses = 0; const getter = Object.defineProperty({}, "profile", { get: (): string => { accesses += 1; return copied.profile; } });
  assert.throws(() => Reflect.apply(prepareCurrentGeneratedInitialFlowCachePlan, undefined, [getter])); assert.equal(accesses, 0);
});
