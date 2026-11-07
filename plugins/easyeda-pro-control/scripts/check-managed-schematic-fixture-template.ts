/** Execute captured, hash-qualified pure vendor serializers in an isolated
 * Linux VM. No application, SDK, network, project or native helper is started. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Script } from "node:vm";
import { z } from "zod";
import { canonicalJson } from "../server/src/core.ts";
import { readManagedLibraryZip } from "../server/src/managed-library-files-zip.ts";
import { MANAGED_SCHEMATIC_FIXTURE_PROFILE, generateManagedSchematicFixtureArchiveData } from "../server/src/managed-schematic-fixture-generator.ts";

const rowSchema = z.object({ header: z.object({ type: z.string(), id: z.string().optional() }), body: z.record(z.string(), z.unknown()) });
async function main(): Promise<void> {
  assert.equal(process.argv.length, 2); const assets = process.env["EASYEDA_ASSETS_ROOT"]; assert.ok(assets !== undefined);
  const profile = MANAGED_SCHEMATIC_FIXTURE_PROFILE;
  const bytes = await readFile(join(assets, profile.source.relativePath));
  assert.equal(bytes.length, profile.source.bytes); assert.equal(createHash("sha256").update(bytes).digest("hex"), profile.source.sha256);
  const source = bytes.toString("utf8");
  const captured = new Map<string, string>();
  for (const method of profile.sourceMethods) {
    const text = source.slice(method.start, method.end);
    assert.equal(createHash("sha256").update(text).digest("hex"), method.sha256); captured.set(method.name, text);
  }
  const get = (name: string): string => { const value = captured.get(name); assert.ok(value !== undefined); return value; };
  const generated = generateManagedSchematicFixtureArchiveData(), meta = z.object({ schematicUuid: z.string(), pageUuid: z.string(), textId: z.string(),
    wireId: z.string(), wireLineId: z.string(), busId: z.string(), busLineId: z.string() }).parse(generated.metadata);
  const supplied = readManagedLibraryZip(generated.bytes).get("Fixture.epru"); assert.ok(supplied !== undefined);
  const rows = supplied.toString("utf8").slice(0, -2).split("|\n").map((text) => {
    const boundary = text.indexOf("||"); assert.ok(boundary > 0);
    return rowSchema.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown });
  });
  const program = `"use strict";${["Me", "rs", "hD"].map((name) => get(name)).join("\n")}
const ids=${JSON.stringify(meta)},lineIds=[ids.wireLineId,ids.busLineId];let nextId=0;const lt=()=>lineIds[nextId++];
const encoder={${["DF.encodeText", "DF.encodeWire", "DF.encodeBus", "DF.encodeLine"].map((name) => get(name)).join(",")}};
const owner={encode:encoder,records:[],getZIndex(){return null;},handleData(value){this.records.push(value);},${["vF.onText", "vF.onWire", "vF.onBus"].map((name) => get(name)).join(",")}};
owner.onText(ids.textId,null,0,false,0,200,0,"Disposable schematic fixture","#000000",null,"Arial",20,false,false,false,false,"LEFT_TOP");
owner.onWire(ids.wireId,null,0,false,[[0,0,100,0]],"#008800","SOLID",null,2,null);
owner.onBus(ids.busId,null,0,false,[[0,-100,100,-100]],"#0000FF","SOLID",null,4,null,{});
const sch={${get("CF.metaData")}},page={${get("RF.metaData")}};
JSON.stringify({schematicMeta:sch.metaData({title:"Schematic1",source:"",board:"",zIndex:null}),pageMeta:page.metaData({title:"Sheet1",schematic:ids.schematicUuid,source:"",zIndex:1}),
records:owner.records.map(row=>({type:row.dataType,id:row.id,body:JSON.parse(row.data)})),lineIdsConsumed:nextId});`;
  const context: unknown = Object.create(null); assert.ok(context !== null && typeof context === "object");
  const raw: unknown = new Script(program, { filename: "fixed-schematic-source-serializer-probe.js" }).runInNewContext(context, { timeout: 1000 });
  assert.ok(typeof raw === "string");
  const observed: unknown = JSON.parse(raw);
  assert.equal(canonicalJson(observed), canonicalJson({ schematicMeta: rows[1]?.body, pageMeta: rows[3]?.body,
    records: rows.slice(4).map((row) => ({ type: row.header.type, id: row.header.id, body: row.body })), lineIdsConsumed: 2 }));
  process.stdout.write(`${JSON.stringify({ ok: true, serializers: profile.sourceMethods.length, suppliedDocuments: 2, primitiveRecords: 5,
    sourceSha256: profile.source.sha256, isolatedVendorSerializerExecution: true, entropyAndOrderCallbacksSubstituted: true,
    nativeImportExecuted: false, nativePageExecuted: false, connectivityVerified: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed read-only source qualification completes before the CLI exits.
await main();
