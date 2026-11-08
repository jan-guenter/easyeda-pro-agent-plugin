import{captureCurrentFootprintSavedFlowCacheInput}from"../src/current-footprint-saved-flow-cache-data.ts";
import{qualifyCurrentFootprintInverseReferenceFilterSource}from"../src/current-footprint-inverse-reference-data-source.ts";
/** Fixed vendor transforms over inert history and an isolated SQL reader.
 * These cases do not create an original inverse, row or delete authority. */
/* oxlint-disable import/max-dependencies -- This boundary compares source, complete SQL, history transforms and its opaque issuer in one isolated fixture. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_FILES as FILES, CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_SOURCE as SOURCE, qualifyCurrentFootprintInversePublicRowSource } from "../src/current-footprint-inverse-public-row-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_MODEL_READ_FIELDS,deriveCurrentFootprintInverseGetModelInputData,deriveCurrentFootprintInversePublicRowData,deriveCurrentFootprintInverseReferenceData } from "../src/current-footprint-inverse-public-row-data.ts";
import type { CurrentFootprintInversePublicRowValue } from "../src/current-footprint-inverse-public-row-data.ts";
import { prepareCurrentFootprintInversePublicRowPlan, requireOriginalCurrentFootprintInversePublicRowPlan } from "../src/current-footprint-inverse-public-row-plan.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

const actor = "e".repeat(32), branchUuid = "b".repeat(32), footprintUuid = "c".repeat(32), headUuid = "d".repeat(32), owner = "f".repeat(32), projectUuid = "a".repeat(64);
const line = (type: string, body: unknown, extra: object = {}): string => `${JSON.stringify({ type, ...extra })}||${JSON.stringify(body)}|\n`;
function input(title = "Saved copy", secondTime = 1_700_000_001_000): unknown {
  const plaintext = line("EDIT_HEAD", { uuid: actor, updateTime: 1_700_000_000_000 }) +
    line("DOCHEAD", { uuid: footprintUuid, docType: "FOOTPRINT", client: "native", updateTime: 1_700_000_000_000, version: "v1" }, { ticket: 1 }) +
    line("META", { title, description: "Exact saved metadata", tags: ["test"], source: "source" }, { id: "META", ticket: 2 }) +
    line("DOCHEAD", { uuid: footprintUuid, docType: "FOOTPRINT", client: "native", updateTime: secondTime, version: "v2" }, { ticket: 3 }) +
    line("PAD", ["stored", 1], { id: "pad", ticket: 4 });
  return { projectUuid, branchUuid, headHistoryUuid: headUuid,
    heads: [{ id: 1, uuid: headUuid, parent: null, key: "1".repeat(32), is_lock: 1, num: 0, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }],
    chunks: [{ historyUuid: headUuid, ordinal: 0, plaintext, plaintextSha256: sha256Text(plaintext) }] };
}
async function inventory(): Promise<Awaited<ReturnType<typeof readExactSqlInventory>>> {
  const directory = await mkdtemp(join(tmpdir(), "inverse-public-row-inert-")), path = join(directory, "source.eprj2"); const db = new DatabaseSync(path);
  try {
    db.exec("CREATE TABLE projects(uuid TEXT, owner_uuid TEXT); CREATE TABLE users(uuid TEXT, username TEXT, nickname TEXT, avatar TEXT); CREATE TABLE project_structures(content TEXT)");
    db.prepare("INSERT INTO projects VALUES(?,?)").run(projectUuid, owner);
    db.prepare("INSERT INTO users VALUES(?,?,?,?)").run(owner, "project-owner", "Project owner", "avatar");
    db.prepare("INSERT INTO project_structures VALUES(?)").run(JSON.stringify({ owner: { uuid: "directory", username: "", nickname: "" } }));
  } finally { db.close(); }
  return readExactSqlInventory({ checkpointPath: path, expectedSha256: createHash("sha256").update(await readFile(path)).digest("hex"), runtime: await syntheticSqlRuntime() });
}
function fields(value: CurrentFootprintInversePublicRowValue): ReadonlyMap<string, CurrentFootprintInversePublicRowValue> { assert.equal(value.kind, "object"); assert.ok("entries" in value); return new Map(value.entries); }
void test("actual source transforms retain full worker/UI rows, own undefined actors and SQL owner rather than directory owner", async () => {
  const sql = await inventory();
  const data = deriveCurrentFootprintInversePublicRowData(input(), footprintUuid, sql);
  const ui = fields(data.uiRow), worker = fields(data.workerRow);
  assert.deepEqual([...worker.keys()], ["uuid", "project_uuid", "title", "display_title", "docType", "creator", "createTime", "modifier", "description", "updateTime", "custom_tags", "owner", "source", "version", "path", "ticket"]);
  assert.deepEqual(worker.get("title"), { kind: "string", value: "saved copy" }); assert.deepEqual(worker.get("ticket"), { kind: "number", value: 4 });
  assert.deepEqual(worker.get("createTime"), { kind: "number", value: 1_700_000_000_000 }); assert.deepEqual(worker.get("updateTime"), { kind: "number", value: 1_700_000_001_000 });
  const creator = worker.get("creator"); assert.ok(creator !== undefined); assert.deepEqual(fields(creator).get("username"), { kind: "undefined" });
  const workerOwner = worker.get("owner"); assert.ok(workerOwner !== undefined); assert.deepEqual(fields(workerOwner).get("uuid"), { kind: "string", value: owner });
  const uiOwner = ui.get("owner"); assert.ok(uiOwner !== undefined); assert.deepEqual([...fields(uiOwner).keys()], ["uuid", "nickname", "username"]);
  assert.deepEqual(ui.get("custom_tags"), { kind: "string", value: '["test"]' });
  const before=JSON.stringify(data),modelInput=deriveCurrentFootprintInverseGetModelInputData(input(),footprintUuid,sql,data);const model=fields(modelInput.model);assert.deepEqual([...model.keys()],CURRENT_FOOTPRINT_INVERSE_GET_MODEL_READ_FIELDS);assert.deepEqual(model.get("tags"),{kind:"array",values:[{kind:"string",value:"test"}]});assert.deepEqual(modelInput.owner,workerOwner);assert.equal(modelInput.nativeInputVerified,false);assert.equal(JSON.stringify(data),before);
  assert.equal(data.nativeRowVerified, false); assert.equal(data.deletionAuthorized, false);
  const equal = fields(deriveCurrentFootprintInversePublicRowData(input("Saved copy", 1_700_000_000_000), footprintUuid, sql).workerRow);
  assert.deepEqual(equal.get("version"), { kind: "string", value: "v1" });
  assert.throws(() => deriveCurrentFootprintInversePublicRowData(input("TITLE"), footprintUuid, sql), /INVERSE_PUBLIC_ROW_PROJECTION/u);
  assert.throws(() => deriveCurrentFootprintInversePublicRowData(input(), footprintUuid, structuredClone(sql)), /original inventory/u);
});
void test("all row-transform spans match their pinned installed assets and changed source refuses", async context => {
  for (const file of ["worker", "ui", "main"] as const) {
    let source: string;
    try { source = await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${FILES[file].relativePath}`, "utf8"); }
    catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
    qualifyCurrentFootprintInversePublicRowSource(file, source);if(file==="worker"){qualifyCurrentFootprintInverseReferenceFilterSource(source);} assert.throws(() => { qualifyCurrentFootprintInversePublicRowSource(file, `${source} `); });
  }
});
void test("actual Main show derives owner from its users join and controller retains that object while overriding project UUID", async () => {
  const names = ["uuid", "archive", "content", "cbb_project", "thumb", "ticket", "g_ticket", "owner_uuid", "creator_uuid", "created_at", "updated_at", "modifier_uuid", "boards", "block_symbol_attrs_groups", "pcb_count", "default_sheet", "branch_uuid", "username", "nickname", "avatar", "project_uuid", "role", "user_uuid"];
  const entity = (prefix: string): Readonly<Record<string, string>> => Object.freeze(Object.fromEntries(names.map(name => [name, `${prefix}${name}`])));
  const calls: unknown[][] = [];
  const queryAll = (...args: unknown[]): unknown => { calls.push(args); return [{ owner_uuid: owner, owner_username: "project-owner", owner_nickname: "Project owner", owner_avatar: "avatar", boards: "[]", block_symbol_attrs_groups: null }]; };
  const result: unknown = await (runInNewContext(`(async()=>{const service={ctx:{logger:{trace(){}}},${SOURCE.projectServiceShow.source}};const controller={projectService:service,path:'C:/source.eprj2',ctx:{projectUuid:${JSON.stringify(projectUuid)}},${SOURCE.projectControllerShow.source}};await controller.show();return controller.ctx.body;})()`, {
    dt: { instance: () => entity("project_") }, fe: { instance: (prefix = "member_user_") => entity(prefix) }, qL: { instance: (prefix: string) => entity(prefix) },
    DE: { existsSync: () => true }, y: () => ({ queryAll }), rd: { parse: () => ({ name: "source" }) }, uc: () => false,
  }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }) as unknown);
  const encoded: unknown = structuredClone(result); assert.ok(encoded !== null && typeof encoded === "object" && "owner" in encoded && "uuid" in encoded);
  assert.equal(encoded.uuid, projectUuid); assert.deepEqual(encoded.owner, { uuid: owner, username: "project-owner", nickname: "Project owner", avatar: "avatar" });
  assert.equal(calls.length, 1); const sql: unknown = structuredClone(calls[0]); assert.ok(Array.isArray(sql));
  assert.deepEqual(sql[1], { LJOIN: [entity("owner_"), { EQ: ["project_owner_uuid", "owner_uuid"] }] });
});
void test("copied checkpoint, flow and row labels issue neither an original row plan nor native authority", () => {
  const prepared = Object.freeze({ profile: "private.current-footprint-forward-saved-checkpoint.v1" as const });
  const flow = Object.freeze({ profile: "private.current-footprint-saved-flow-cache-plan.v1" as const });
  assert.throws(() => prepareCurrentFootprintInversePublicRowPlan(prepared, flow), /ORIGINAL_FORWARD_CHECKPOINT/u);
  assert.throws(() => requireOriginalCurrentFootprintInversePublicRowPlan(Object.freeze({ profile: "private.current-footprint-inverse-public-row-plan.v1" }), prepared, flow), /INVERSE_PUBLIC_ROW_PLAN_ORIGINAL/u);
});

void test("reference profile derives from complete original histories and refuses mixed documents or a derived footprint",async()=>{
 const sql=await inventory();const source=captureCurrentFootprintSavedFlowCacheInput(input());const row=deriveCurrentFootprintInversePublicRowData(source,footprintUuid,sql);const reference=deriveCurrentFootprintInverseReferenceData(source,footprintUuid,sql,row);assert.equal(reference.deletionAuthorized,false);assert.equal(reference.actualReferenceResultsVerified,false);assert.deepEqual(reference.derivedFootprintUuids,[]);assert.ok(reference.documentFamilies.every(doc=>doc.families.every(family=>family.docType==="FOOTPRINT")));
 const first=source.chunks[0];assert.ok(first!==null&&typeof first==="object"&&"plaintext"in first&&typeof first.plaintext==="string");
 const variant=(docType:string,meta:unknown):unknown=>{const plaintext=first.plaintext+line("DOCHEAD",{uuid:"9".repeat(32),docType,client:"native",updateTime:1_700_000_002_000,version:"v1"},{ticket:5})+line("META",meta,{id:"META",ticket:6});return{...source,chunks:[{...first,plaintext,plaintextSha256:sha256Text(plaintext)}]};};
 const mixed=variant("PCB",{title:"Board"});const mixedRow=deriveCurrentFootprintInversePublicRowData(mixed,footprintUuid,sql);assert.throws(()=>deriveCurrentFootprintInverseReferenceData(mixed,footprintUuid,sql,mixedRow),/INVERSE_PUBLIC_ROW_DATA/u);
 const linked=variant("FOOTPRINT",{title:"Derived copy",description:"",tags:[],source:footprintUuid});const linkedRow=deriveCurrentFootprintInversePublicRowData(linked,footprintUuid,sql);assert.throws(()=>deriveCurrentFootprintInverseReferenceData(linked,footprintUuid,sql,linkedRow),/INVERSE_PUBLIC_ROW_DATA/u);
});
