/** Class metadata use the actual original source locations and descriptors. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_ROLES as ROLES, CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE as SOURCE, decodeCurrentSchematicWireDerivedRtreeFunction as decode } from "../src/current-schematic-wire-derived-rtree-source.ts";
import { wireDerivedRtreeMetadataFixture } from "./helpers/current-schematic-wire-derived-rtree-metadata-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

for (const variant of [0, 1] as const) {
  void test(`Wire class and function metadata variant ${  String(variant)}`, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const session = new Session(); session.connect(); context.after(() => { session.disconnect(); }); await session.post("Debugger.enable"); let scriptId = ""; const url = `wireDerivedMetadata${  String(variant)  }.js`;
    session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph = await session.post("Runtime.evaluate", { expression: `${wireDerivedRtreeMetadataFixture(source, variant)  }\n//# sourceURL=${  url}`, objectGroup: "wireDerivedMetadata" }); assert.ok(graph.exceptionDetails === undefined); assert.ok(graph.result.objectId !== undefined && scriptId.length > 0);
    const fields = await session.post("Runtime.getProperties", { objectId: graph.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const originalScript = scriptId;
    for (const role of ROLES) {
      const fn = fields.result.find(row => row.name === role)?.value; assert.ok(fn?.objectId !== undefined); const raw = await session.post("Runtime.getProperties", { objectId: fn.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const data = decode(raw, fn, variant, role, originalScript); assert.equal(data.originalBindingsComplete, false); assert.equal(data.executionAuthorized, false);
      assert.throws(() => decode(raw, fn, variant, role, "foreign-script")); const changed = structuredClone(raw); const property = changed.result.find(row => row.name === "prototype");
      if (property !== undefined) { property.writable = property.writable !== true; assert.throws(() => decode(changed, fn, variant, role, originalScript)); }
    }
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "wireDerivedMetadata" });
  });
}
