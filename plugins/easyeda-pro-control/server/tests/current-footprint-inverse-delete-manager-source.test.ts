/** Original inert registrar/class, actual Inspector metadata; no application,
 * native callback, constructor instance, deletion, clock or Save is invoked. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES } from "../src/current-footprint-inverse-public-delete-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_LINKS as LINKS, CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as SOURCE,
  requireCurrentFootprintInverseDeleteManagerDescription as description, qualifyCurrentFootprintInverseDeleteManagerFunction as metadata,
  qualifyCurrentFootprintInverseDeleteManagerSource as qualify } from "../src/current-footprint-inverse-delete-manager-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("original manager DEL and selected V0 method retain source links and actual function metadata", async context => {
  const full = await readConfiguredEasyedaAsset(CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES.manager.relativePath);
  if (full === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  assert.equal(process.versions.node, "24.18.0"); qualify(full); assert.throws(() => { qualify(`${full} `); });
  assert.equal(full.slice(LINKS.outerTopic.start, LINKS.outerTopic.end), 'e.DEL="/PrjDB/footprint/delData"');
  assert.equal(full.slice(LINKS.innerTopic.start, LINKS.innerTopic.end), 'delete:"/mgr/projectWorker/footprint/delete"');
  assert.match(full.slice(LINKS.registration.start, LINKS.registration.end), /^V\(te\.FOOTPRINT\.DEL,/u);
  const prefix = '(()=>{const captures=new Map,te={FOOTPRINT:new Proxy({},{get:(_t,k)=>k})},K=()=>{throw Error("inert")},V=(topic,callback)=>captures.set(topic,callback);let V0;';
  let source = prefix + full.replaceAll(/[^\r\n]/gu, " ").slice(prefix.length);
  // Full unchanged V0 class and gG registrar preserve lexical function locations.
  for (const [start, end] of [[1_730_789, 1_736_591], [2_069_032, 2_072_226]] as const) {
    source = `${source.slice(0, start)}${full.slice(start, end)};${source.slice(end + 1)}`;
  }
  source += ';gG(null);globalThis.inertDeleteManagerPair=[captures.get("DEL"),V0.prototype.deleteData];})();';
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const compiled = await session.post("Runtime.compileScript", { expression: source, sourceURL: "inert-original-delete-manager.js", persistScript: true });
    assert.ok(compiled.scriptId !== undefined); const ran = await session.post("Runtime.runScript", { scriptId: compiled.scriptId }); assert.equal(ran.exceptionDetails, undefined);
    for (const [index, role] of (["handler", "method"] as const).entries()) {
      const remote = await session.post("Runtime.evaluate", { expression: `globalThis.inertDeleteManagerPair[${String(index)}]` });
      assert.equal(remote.result.type, "function"); assert.ok(remote.result.objectId !== undefined && remote.result.description !== undefined);
      description(remote.result.description, role); const row = SOURCE[role]; assert.equal(remote.result.description, full.slice(row.descriptionStart, row.end));
      const properties = await session.post("Runtime.getProperties", { objectId: remote.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const scopes = metadata(properties, role, compiled.scriptId); assert.throws(() => { metadata(properties, role, "foreign-script"); });
      const lexical = await session.post("Runtime.getProperties", { objectId: scopes, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      assert.deepEqual(lexical.result.map(field => field.value?.description), ["Closure", "Global"]);
    }
    assert.throws(() => { description("async()=>true", "handler"); });
  } finally {
    try { await session.post("Debugger.disable"); } finally { session.disconnect(); Reflect.deleteProperty(globalThis, "inertDeleteManagerPair"); }
  }
});
