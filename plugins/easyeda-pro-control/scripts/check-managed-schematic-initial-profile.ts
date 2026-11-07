/** Fixed source-only projection check. No app, SDK, SQLite or helper starts. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Script } from "node:vm";
import { z } from "zod";
import { canonicalJson } from "../server/src/core.ts";
import { readManagedLibraryZip } from "../server/src/managed-library-files-zip.ts";
import { generateManagedSchematicFixtureArchiveData } from "../server/src/managed-schematic-fixture-generator.ts";
import { MANAGED_SCHEMATIC_INITIAL_SQL_PROFILE } from "../server/src/managed-schematic-fixture-initial-sql.ts";

const sourceRow = z.object({ header: z.object({ type: z.string() }), body: z.record(z.string(), z.unknown()) });
async function main(): Promise<void> {
  assert.equal(process.argv.length, 2); const assets = process.env["EASYEDA_ASSETS_ROOT"]; assert.ok(assets !== undefined);
  const profile = MANAGED_SCHEMATIC_INITIAL_SQL_PROFILE; const bytes = await readFile(join(assets, profile.source.relativePath));
  assert.equal(bytes.length, profile.source.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), profile.source.sha256);
  const source = bytes.toString("utf8"); const methods = new Map<string, string>();
  for (const method of profile.methods) { const text = source.slice(method.start, method.end); assert.equal(createHash("sha256").update(text).digest("hex"), method.sha256); methods.set(method.name, text); }
  const native = profile.nativeMainSource; const mainBytes = await readFile(join(assets, native.relativePath));
  assert.equal(mainBytes.length, native.bytes); assert.equal(createHash("sha256").update(mainBytes).digest("hex"), native.sha256);
  assert.equal(createHash("sha256").update(mainBytes.toString("utf8").slice(native.start, native.end)).digest("hex"), native.functionSha256);
  const get = (name: string): string => { const text = methods.get(name); assert.ok(text !== undefined); return text; };
  const generated = generateManagedSchematicFixtureArchiveData(), supplied = readManagedLibraryZip(generated.bytes).get("Fixture.epru"); assert.ok(supplied !== undefined);
  const rows = supplied.toString("utf8").slice(0, -2).split("|\n").map(text => { const boundary = text.indexOf("||");
    return sourceRow.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown }); });
  const actor = { uuid: "4".repeat(32), username: "", nickname: "", updateTime: 1 }, owner = { uuid: "C:\\SyntheticTemp\\CodexEasyedaFixture_11111111111111111111111111111111/", username: "", nickname: "" };
  const program = `"use strict";class Xa {${["Xa.onDocHead", "Xa.parseSchematic", "Xa.parseSheet"].map(name => get(name)).join("\n")}parse(value){return JSON.parse(value);}}
class Qo {${get("Qo.schematic")}\n${get("Qo.sheet")}}${get("hy")}
const rows=${JSON.stringify(rows)},actor=${JSON.stringify(actor)},owner=${JSON.stringify(owner)},parser=new Xa;let ordered=0;
parser.isExtractComponent=false;parser.notCanvas=true;parser.datas={boards:{},schematics:{},sheets:{},pcbs:{},panels:{},symbols:{}};
parser.calculation={setOrderNum(){ordered++;}};parser.onDocHead(rows[0].body,actor);parser.parseSchematic('META',rows[0].body.uuid,JSON.stringify(rows[1].body));
parser.onDocHead(rows[2].body,actor);parser.parseSheet('META',rows[2].body.uuid,JSON.stringify(rows[3].body),1,'META','SCH_PAGE',rows[2].body.client);
JSON.stringify({structure:hy(parser.datas,owner),ordered,headerActorRetained:parser.datas.schematics[rows[0].body.uuid].creator.uuid===actor.uuid&&parser.datas.sheets[rows[2].body.uuid].modifier.uuid===actor.uuid});`;
  const context: unknown = Object.create(null); assert.ok(context !== null && typeof context === "object");
  const raw: unknown = new Script(program, { filename: "fixed-schematic-tree-projection.js" }).runInNewContext(context, { timeout: 1000 }); assert.equal(typeof raw, "string");
  const head = rows[0]?.body, page = rows[2]?.body; assert.ok(head !== undefined && page !== undefined);
  const expected = { boards: {}, schematics: { [String(head["uuid"])]: { uuid: head["uuid"], name: "Schematic1", board: "", source: "", version: head["version"], updateTime: head["updateTime"] } },
    sheets: { [String(page["uuid"])]: { uuid: page["uuid"], title: "Sheet1", schematic_uuid: head["uuid"], zIndex: 1, source: "", version: page["version"], updateTime: page["updateTime"] } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner };
  const observed: unknown = JSON.parse(String(raw));
  assert.equal(canonicalJson(observed), canonicalJson({ structure: expected, ordered: 1, headerActorRetained: true }));
  process.stdout.write(`${JSON.stringify({ ok: true, managerSha256: profile.source.sha256, originalTreeMethods: profile.methods.length,
    nativeInsertSha256: native.functionSha256, exactSchematicAndSheetProjection: true, fixedHeaderMetaDispatch: true,
    orderCallbackSubstituted: true, fullNativeImportExecuted: false, nativePageReadinessVerified: false, connectivityVerified: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Read-only source qualification completes before the CLI exits.
await main();
