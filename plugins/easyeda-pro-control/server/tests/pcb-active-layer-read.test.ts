import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { buildPublicSdkReadCode } from "../src/public-sdk-read.ts";
import { PCB_ACTIVE_LAYER_API_SHA256, PCB_ACTIVE_LAYER_LIMITATIONS, PCB_ACTIVE_LAYER_METHOD, PCB_ACTIVE_LAYER_PCB_SHA256, PCB_ACTIVE_LAYER_PROFILE,
  PCB_ACTIVE_LAYER_SOURCE_EDIT_VERSION, derivePcbActiveLayer, pcbActiveLayerRequestSchema, pcbActiveLayerResultSchema, readPcbActiveLayer } from "../src/pcb-active-layer-read.ts";
import type { PcbActiveLayerEngine } from "../src/pcb-active-layer-read.ts";

type Value = Record<string, unknown>;
const request = { method: PCB_ACTIVE_LAYER_METHOD, arguments: {} };
const context = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
const allLayersRequest = { method: "eda.pcb_Layer.getAllLayers", arguments: {} };
const layer = { id: 1, name: "Top Layer", type: "SIGNAL", color: "#ff0000", transparency: 0,
  inactiveColor: "#770000", inactiveTransparency: 50, layerStatus: 1, locked: false };
function objects(id = 1, nativeType = "TOP"): NativeSourceObject[] {
  return [{ id: "ACTIVE_LAYER", type: "ACTIVE_LAYER", body: { layerId: id } },
    { id: JSON.stringify(["LAYER", id]), type: "LAYER", body: { layerName: layer.name, layerType: nativeType, use: true, show: true, locked: false,
      activeColor: "#ff0000", activateTransparency: 1, inactiveColor: "#770000", inactiveTransparency: 0.5 } },
    { id: "unrelated", type: "FUTURE_UNINTERPRETED", body: { retained: "exact" } }];
}
function snapshot(rows: NativeSourceObject[] = objects()): NativeSourceSnapshot {
  const result = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "board", docType: "PCB", editVersion: PCB_ACTIVE_LAYER_SOURCE_EDIT_VERSION },
    objects: rows.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...result, sha256: sha256Json(result) };
}
function sourceString(rows = objects()): string {
  const value = snapshot(rows);
  return [`{"type":"DOCHEAD"}||${JSON.stringify(value.document)}`,
    ...value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n");
}
for (const [nativeType, type] of [["TOP", "SIGNAL"], ["BOTTOM", "SIGNAL"], ["SIGNAL", "SIGNAL"], ["PLANE", "PLANE"],
  ["TOP_SILK", "SILKSCREEN"], ["BOT_SILK", "SILKSCREEN"], ["TOP_SOLDER_MASK", "SOLDER_MASK"], ["BOT_SOLDER_MASK", "SOLDER_MASK"],
  ["TOP_PASTE_MASK", "PASTE_MASK"], ["BOT_PASTE_MASK", "PASTE_MASK"], ["TOP_ASSEMBLY", "ASSEMBLY"], ["BOT_ASSEMBLY", "ASSEMBLY"],
  ["CUSTOM", "CUSTOM"], ["OUTLINE", "OTHER"], ["SUBSTRATE", "OTHER"]]) {
  void test(`active layer uses the pinned native-to-public type mapping for ${nativeType}`, () => {
    const original = snapshot(objects(71, nativeType)), rows = [{ ...layer, id: 71, type }];
    const before = structuredClone({ original, rows });
    assert.deepEqual(derivePcbActiveLayer(original, rows, "board"), rows[0]);
    assert.deepEqual({ original, rows }, before);
  });
}
for (const [use, show, status] of [[true, true, 1], [true, false, 2], [false, true, 0], [false, false, 0]] as const) {
  void test(`active layer status follows native model use=${use} show=${show}`, () => {
    const rows = objects(), source = rows[1]; assert.ok(source); source.body["use"] = use; source.body["show"] = show;
    assert.equal(derivePcbActiveLayer(snapshot(rows), [{ ...layer, layerStatus: status }], "board").layerStatus, status);
  });
}
const sourceDefects: [string, (rows: NativeSourceObject[]) => void][] = [
  ["missing active record", (rows) => { rows.splice(0, 1); }],
  ["second active record", (rows) => { rows.push({ id: "second", type: "ACTIVE_LAYER", body: { layerId: 1 } }); }],
  ["wrong active family", (rows) => { rows[0] = { id: "ACTIVE_LAYER", type: "LAYER", body: { layerId: 1 } }; }],
  ["wrong active record ID", (rows) => { rows[0] = { id: "other", type: "ACTIVE_LAYER", body: { layerId: 1 } }; }],
  ["unknown active field", (rows) => { assert.ok(rows[0]); rows[0].body["extra"] = true; }],
  ["missing selected layer record", (rows) => { rows.splice(1, 1); }],
  ["wrong selected layer family", (rows) => { rows[1] = { id: '["LAYER",1]', type: "META", body: {} }; }],
  ["noncanonical layer key", (rows) => { assert.ok(rows[1]); rows[1] = { ...rows[1], id: '["LAYER", 1]' }; }],
  ["duplicate source IDs", (rows) => { assert.ok(rows[1]); rows.push(structuredClone(rows[1])); }],
  ["mismatched optional native layer ID", (rows) => { assert.ok(rows[1]); rows[1].body["layerId"] = 2; }],
  ...['["LAYER", 1]', '["OTHER",1]', "1"].map((id): [string, (rows: NativeSourceObject[]) => void] => [`additional ambiguous layer key ${id}`, (rows) => { assert.ok(rows[1]); rows.push({ ...structuredClone(rows[1]), id }); }]),
  ...["layerName", "layerType", "locked", "show", "use"].map((key): [string, (rows: NativeSourceObject[]) => void] => [`missing native ${key}`, (rows) => { assert.ok(rows[1]); Reflect.deleteProperty(rows[1].body, key); }]),
];
for (const [label, mutate] of sourceDefects) {
  void test(`active layer refuses ${label}`, () => { const rows = objects(); mutate(rows); assert.throws(() => derivePcbActiveLayer(snapshot(rows), [layer], "board")); });
}
for (const id of [0, -1, 1.5, 65_536, "1", null, Number.NaN, Number.POSITIVE_INFINITY]) {
  void test(`active layer refuses malformed identity ${String(id)}`, () => {
    const rows = objects(); assert.ok(rows[0]); rows[0].body["layerId"] = id;
    assert.throws(() => derivePcbActiveLayer(snapshot(rows), [layer], "board"));
  });
}
for (const invalid of [[], [layer, layer], [{ ...layer, id: 2 }], [{ ...layer, name: "wrong" }], [{ ...layer, type: "OTHER" }],
  [{ ...layer, locked: true }], [{ ...layer, layerStatus: 2 }], [{ ...layer, extra: true }], [{ ...layer, color: "" }],
  [{ ...layer, color: 0 }], [{ ...layer, inactiveColor: "x".repeat(129) }],
  [{ ...layer, transparency: 101 }], [{ ...layer, inactiveTransparency: -1 }], [{ ...layer, type: "TOP" }],
  [{ ...layer, name: "x".repeat(1025) }], Array.from({ length: 513 }, (_, index) => ({ ...layer, id: index + 1 }))]) {
  void test(`active layer refuses invalid public rows ${JSON.stringify(invalid).slice(0, 75)}`, () => {
    assert.throws(() => derivePcbActiveLayer(snapshot(), invalid, "board"));
  });
}
for (const key of Object.keys(layer)) {
  void test(`the public layer DTO requires the real producer field ${key}`, () => {
    const invalid: Value = { ...layer }; Reflect.deleteProperty(invalid, key); assert.equal(pcbActiveLayerResultSchema.safeParse(invalid).success, false);
  });
}
void test("source integrity, identity, edit version and complete record bounds remain mandatory", () => {
  const original = snapshot();
  assert.throws(() => derivePcbActiveLayer({ ...original, sha256: "0".repeat(64) }, [layer], "board"));
  assert.throws(() => derivePcbActiveLayer(original, [layer], "other"));
  const { sha256: _sha256, ...changed } = original; changed.document["editVersion"] = "future";
  assert.throws(() => derivePcbActiveLayer({ ...changed, sha256: sha256Json(changed) }, [layer], "board"));
  assert.throws(() => derivePcbActiveLayer(snapshot(Array.from({ length: 20_001 }, (_, index) => ({ id: `x${index}`, type: "NET", body: {} }))), [layer], "board"));
});
for (const invalid of [undefined, {}, { ...request, code: "arbitrary()" }, { ...request, arguments: { id: 1 } },
  { ...request, arguments: undefined }, { ...request, method: "eda.pcb_Layer.selectLayer" }]) {
  void test(`active layer request is a literal empty selector ${JSON.stringify(invalid)}`, () => { assert.equal(pcbActiveLayerRequestSchema.safeParse(invalid).success, false); });
}

function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: pinned.nodeVersion, bridge_connected: true, easyeda_version: pinned.easyedaVersion,
      extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion, ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api.d.ts" } } };
}
const contextBinding = { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false };
function exact(sample: Value): Value { return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample), contextBinding } }; }
function publicLayers(rows: unknown = [layer], extra: Value = {}): Value {
  const sample = { ok: true, kind: "public-sdk-read", method: allLayersRequest.method, present: true, value: rows, undefinedPaths: [],
    assurance: "bounded-public-sdk-observation-not-native-or-persistence-proof", publicApiSha256: PCB_ACTIVE_LAYER_API_SHA256, liveValidation: "not-yet-validated", limitations: [], ...extra };
  return { ...exact(sample), authority: "public-sdk-observation-not-complete-design-proof" };
}
interface Options { failContext?: number; quarantine?: number; runtimeDrift?: boolean; corruptHash?: number; sourceDrift?: number; failRead?: number; layerDrift?: boolean; badLayers?: Value; sourcePayload?: Value; }
function runtime(options: Options = {}): { engine: PcbActiveLayerEngine; calls: string[]; counts: { contexts: number; gates: number; statuses: number } } {
  const originalFingerprint = fingerprint(), rows = objects();
  const calls: string[] = [], counts = { contexts: 0, gates: 0, statuses: 0 };
  const failure = (): void => { if (calls.length === options.failRead) { throw new Error("synthetic read failure"); } };
  return { calls, counts, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => { counts.gates += 1; return counts.gates === options.quarantine ? Promise.reject(new Error("quarantined")) : Promise.resolve(true); },
    status: (): Promise<{ stableFingerprint: Value }> => { counts.statuses += 1; return Promise.resolve({ stableFingerprint: options.runtimeDrift === true && counts.statuses > 1 ? { ...originalFingerprint, toolCount: 0 } : structuredClone(originalFingerprint) }); },
    assertContext: (): Promise<typeof context> => { counts.contexts += 1; return Promise.resolve(counts.contexts === options.failContext ? { ...structuredClone(context), document: { ...context.document, tabId: "other" } } : structuredClone(context)); },
    exactRead: (query): ReturnType<PcbActiveLayerEngine["exactRead"]> => {
      assert.deepEqual(query, { kind: "pcb-source" }); calls.push("source"); failure();
      if (calls.length === options.sourceDrift) { assert.ok(rows[2]); rows[2].body["retained"] = "changed"; }
      const payload = options.sourcePayload ?? exact({ ok: true, kind: "pcb-source", documentType: 3, source: sourceString(rows) });
      if (calls.length === options.corruptHash) { payload["source"] = "substitution"; }
      return Promise.resolve(payload);
    },
    publicSdkRead: (query): ReturnType<PcbActiveLayerEngine["publicSdkRead"]> => {
      assert.deepEqual(query, allLayersRequest); calls.push("layers"); failure();
      const payload = options.badLayers ?? publicLayers([layer], options.layerDrift === true && calls.length === 5 ? { retainedExtraField: true } : {});
      if (calls.length === options.corruptHash) { payload["value"] = []; }
      return Promise.resolve(payload);
    },
  } };
}
void test("active layer coordinator commits the exact nine-field result and all six observations", async () => {
  const current = runtime(), result = await readPcbActiveLayer(current.engine, request, context, fingerprint());
  assert.deepEqual(current.calls, ["source", "layers", "source", "source", "layers", "source"]);
  assert.deepEqual(result["value"], layer); assert.equal(result["present"], true); assert.deepEqual(result["undefinedPaths"], []);
  assert.equal(result["method"], PCB_ACTIVE_LAYER_METHOD); assert.equal(result["authority"], "native-active-layer-with-public-fields-not-public-method-parity");
  assert.equal(result["implementationKind"], "native-task-equivalent"); assert.equal(result["publicApiSha256"], PCB_ACTIVE_LAYER_API_SHA256);
  assert.equal(result["nativePcbEditorSha256"], PCB_ACTIVE_LAYER_PCB_SHA256); assert.deepEqual(result["limitations"], PCB_ACTIVE_LAYER_LIMITATIONS);
  assert.equal(result["liveValidation"], "not-yet-validated"); assert.equal(result["assurance"], "bounded-native-active-layer-not-complete-design-state");
  const { read_consistency: consistency, ...sample } = result; assert.ok(isRecord(consistency)); assert.equal(consistency["snapshotSha256"], sha256Json(sample));
  assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["profile"], PCB_ACTIVE_LAYER_PROFILE); assert.equal(result["proof"]["layerId"], 1);
  assert.deepEqual(current.counts, { contexts: 14, gates: 8, statuses: 2 });
});
for (const options of [...Array.from({ length: 6 }, (_, index) => ({ failRead: index + 1 })), ...Array.from({ length: 6 }, (_, index) => ({ corruptHash: index + 1 })),
  { sourceDrift: 3 }, { sourceDrift: 4 }, { layerDrift: true }, { runtimeDrift: true },
  ...Array.from({ length: 14 }, (_, index) => ({ failContext: index + 1 })), ...Array.from({ length: 8 }, (_, index) => ({ quarantine: index + 1 }))]) {
  void test(`active layer coordinator refuses drift/failure without retries ${JSON.stringify(options)}`, async () => {
    const current = runtime(options); await assert.rejects(readPcbActiveLayer(current.engine, request, context, fingerprint()));
    assert.deepEqual(current.calls, ["source", "layers", "source", "source", "layers", "source"].slice(0, current.calls.length));
    assert.ok(current.calls.length <= 6);
  });
}
for (const extra of [{ kind: "pcb-inventory" }, { method: PCB_ACTIVE_LAYER_METHOD }, { present: false }, { undefinedPaths: ["/value/0/color"] },
  { publicApiSha256: "0".repeat(64) }, { assurance: "exact-native" }, { implementationKind: "native-task-equivalent" },
  { value: [{ ...layer, missing: "[Truncated]" }] }]) {
  void test(`active layer refuses a mismatched producer envelope ${JSON.stringify(extra)}`, async () => {
    const payload = publicLayers([layer], extra);
    if (Object.hasOwn(extra, "implementationKind")) { payload["authority"] = "native-task-observation"; }
    const current = runtime({ badLayers: payload }); await assert.rejects(readPcbActiveLayer(current.engine, request, context, fingerprint()));
  });
}
void test("public envelope commitment must exclude only coordinator-added authority, not extra sample fields", async () => {
  const payload = publicLayers(), { read_consistency: _consistency, ...incorrectSample } = payload;
  const current = runtime({ badLayers: exact(incorrectSample) });
  await assert.rejects(readPcbActiveLayer(current.engine, request, context, fingerprint()), /enumeration commitment/u);
});
for (const document of [{ ...context.document, documentType: 4 }, { ...context.document, parentProjectUuid: "foreign" }, { ...context.document, parentLibraryUuid: "library" },
  { ...context.document, documentUuid: "foreign" }, { ...context.document, tabId: "foreign" }]) {
  void test(`active layer rejects invalid owner before dispatch ${JSON.stringify(document)}`, async () => {
    const current = runtime(); await assert.rejects(readPcbActiveLayer(current.engine, request, { ...context, document }, fingerprint()));
    assert.equal(current.counts.gates, 0); assert.deepEqual(current.calls, []);
  });
}
void test("active layer rejects invalid arguments, aliased owner and incomplete runtime before dispatch", async () => {
  const current = runtime();
  await assert.rejects(readPcbActiveLayer(current.engine, { ...request, arguments: { layer: 1 } }, context, fingerprint()));
  await assert.rejects(readPcbActiveLayer(current.engine, request, { ...context, project: { ...context.project, projectUuid: "foreign" } }, fingerprint()));
  await assert.rejects(readPcbActiveLayer(current.engine, request, context, {}));
  assert.equal(current.counts.gates, 0); assert.deepEqual(current.calls, []);
});

// Verbatim reviewed API 59236967 producers at offsets 1369090/1370133/1370536.
// Native data is synthetic. The actual mapper and SDK coordinator produce the
// Envelope consumed by the new coordinator.
const LAYER_PRODUCER = 'async getAllLayers(){return(await _.extensionApiMessageBus2.rpcCall("extensionApi.PCB_Layer.getAllLayers")).map(i=>({id:i.layerId,name:i.name,type:Pie(i.type),color:i.activeColor,transparency:oM((1-i.activeColorAlpha)*100),inactiveColor:i.deactiveColor,inactiveTransparency:oM((1-i.deactiveColorAlpha)*100),layerStatus:i.layerStatus,locked:i.locked}))}';
const TYPE_PRODUCER = 'function Pie(e){if(!e)return"OTHER";switch(e){case"TOP":case"BOTTOM":case"SIGNAL":return"SIGNAL";case"PLANE":return"PLANE";case"TOP_SILK":case"BOT_SILK":return"SILKSCREEN";case"TOP_SOLDER_MASK":case"BOT_SOLDER_MASK":return"SOLDER_MASK";case"TOP_PASTE_MASK":case"BOT_PASTE_MASK":return"PASTE_MASK";case"TOP_ASSEMBLY":case"BOT_ASSEMBLY":return"ASSEMBLY";case"CUSTOM":return"CUSTOM";default:return"OTHER"}}';
const ROUND_PRODUCER = 'function oM(e){let t=Math.round(e*100)/100,i=parseFloat(t.toFixed(2));return i%1===0,i}';
// Pinned PCB encoder/manager bodies: 1910537, 2243171, 2243361 and 7858181.
// They prove IDs and use/show mapping without a live project.
const SOURCE_KEY_PRODUCER = 'function Gc(o,t){return JSON.stringify([t,o])}';
const ACTIVE_RECORD_PRODUCER = 'encodeActiveLayer(o){return{id:"ACTIVE_LAYER",dataType:"ACTIVE_LAYER",data:JSON.stringify(o)}}';
const LAYER_RECORD_PRODUCER = 'encodeLayer(o,t){return{id:Gc(o,"LAYER"),dataType:"LAYER",data:JSON.stringify(t)}}';
const STATUS_PRODUCER = 'get layerStatus(){return this.model.config?this.model.visible?1:2:0}';
// Qc is aliased as ee at 603765. The default custom builder at 3399632 uses
// These methods and palette entry 1413983 to produce the malformed color.
const COLOR_OF1_PRODUCER = 'static of1(t){return this.of2(t>>16&255,t>>8&255,t&255)}';
const COLOR_OF2_PRODUCER = 'static of2(t,e,r,i=255){return Oy.build(t/255,e/255,r/255,i/255)}';
const COLOR_MUL_PRODUCER = 'mul(t){return Oy.build(Math.max(0,Math.min(1,this.r*t)),Math.max(0,Math.min(1,this.g*t)),Math.max(0,Math.min(1,this.b*t)),this.alpha)}';
const COLOR_STRING_PRODUCER = 'toString(){let t=(this.r*255).toString(16),e=(this.g*255).toString(16),r=(this.b*255).toString(16);return t.length<2&&(t="0"+t),e.length<2&&(e="0"+e),r.length<2&&(r="0"+r),"#"+t.substr(0,2)+e.substr(0,2)+r.substr(0,2)}';
function nativeCustomColor(): string {
  // Only object allocation/cache is a test harness. The pinned methods perform
  // Conversion, multiplication and serialization.
  const result: unknown = runInNewContext(`class Oy{static build(r,g,b,alpha){return Object.assign(new Oy(),{r,g,b,alpha})}${COLOR_OF1_PRODUCER}${COLOR_OF2_PRODUCER}${COLOR_MUL_PRODUCER}${COLOR_STRING_PRODUCER}}Oy.of1(1413983).mul(.5).toString()`);
  assert.ok(typeof result === "string"); return result;
}
void test("pinned native fractional-channel color serialization is preserved as raw public data", () => {
  assert.equal(nativeCustomColor(), "#a.492f");
  const malformed = { ...layer, inactiveColor: nativeCustomColor() };
  assert.deepEqual(derivePcbActiveLayer(snapshot(), [malformed], "board"), malformed);
  assert.deepEqual(derivePcbActiveLayer(snapshot(), [layer, { ...malformed, id: 93, type: "CUSTOM", layerStatus: 0 }], "board"), layer);
});
void test("native encoder IDs survive the real source parser and native status getter agrees for every use/show combination", () => {
  for (const use of [true, false]) {
    for (const show of [true, false]) {
      const sourceBody = { layerName: layer.name, layerType: "TOP", locked: false, use, show };
      const produced: unknown = runInNewContext(`${SOURCE_KEY_PRODUCER}const encoder=new(class{${ACTIVE_RECORD_PRODUCER}${LAYER_RECORD_PRODUCER}});const display=new(class{${STATUS_PRODUCER}});display.model={config:use,visible:show};({records:[encoder.encodeActiveLayer({layerId:1}),encoder.encodeLayer(1,sourceBody)],status:display.layerStatus})`, { use, show, sourceBody });
      assert.ok(isRecord(produced)); assert.ok(Array.isArray(produced["records"]));
      const nativeLines = produced["records"].map((row: unknown) => { assert.ok(isRecord(row)); assert.equal(typeof row["data"], "string");
        return `${JSON.stringify({ type: row["dataType"], id: row["id"] })}||${String(row["data"])}`; });
      const source = parseDocumentSource([`{"type":"DOCHEAD"}||${JSON.stringify(snapshot().document)}`, ...nativeLines].join("|\n"));
      assert.deepEqual(source.objects.map((row) => row.id).toSorted(), ['["LAYER",1]', "ACTIVE_LAYER"].toSorted());
      const dto = { ...layer, layerStatus: produced["status"] };
      assert.deepEqual(derivePcbActiveLayer(source, [dto], "board"), dto);
    }
  }
});
void test("native ID encoder and status getter bodies match the installed hash-pinned PCB when mounted", async (t) => {
  let installed: Buffer;
  try { installed = await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-pcb/3.2.149.5378b690/js/pcb.js"); }
  catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { t.skip("Pinned Windows application is not mounted on this test host."); return; } throw error; }
  assert.equal(createHash("sha256").update(installed).digest("hex"), PCB_ACTIVE_LAYER_PCB_SHA256);
  for (const body of [SOURCE_KEY_PRODUCER, ACTIVE_RECORD_PRODUCER, LAYER_RECORD_PRODUCER, STATUS_PRODUCER,
    COLOR_OF1_PRODUCER, COLOR_OF2_PRODUCER, COLOR_MUL_PRODUCER, COLOR_STRING_PRODUCER]) { assert.ok(installed.toString().includes(body)); }
});
void test("reviewed producer bodies exactly match the installed hash-pinned API when mounted", async (t) => {
  let installed: Buffer;
  try { installed = await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api.js"); }
  catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { t.skip("Pinned Windows application is not mounted on this test host."); return; } throw error; }
  assert.equal(createHash("sha256").update(installed).digest("hex"), PCB_ACTIVE_LAYER_API_SHA256);
  for (const body of [LAYER_PRODUCER, TYPE_PRODUCER, ROUND_PRODUCER]) { assert.equal(installed.toString().split(body).length, 2); }
});
void test("real public SDK producer and coordinator emit the nine fields and commitment consumed by active-layer reading", async () => {
  let calls = 0;
  const native = { layerId: 1, name: layer.name, type: "TOP", activeColor: "#ff0000", activeColorAlpha: 0.876543,
    deactiveColor: nativeCustomColor(), deactiveColorAlpha: 0.456789, layerStatus: 1, locked: false,
    active: true, visible: true, order: 100 };
  class ProducerEngine extends EasyedaControlEngine {
    // oxlint-disable-next-line eslint/class-methods-use-this -- Only offline test admission is replaced; the real public read producer/validator stays intact.
    protected override assertPublicSdkImplementation(): Promise<void> { return Promise.resolve(); }
  }
  const producer = new ProducerEngine({ async callTool(name): Promise<unknown> {
    calls += 1; assert.equal(name, "easyeda_execute");
    const code = `${TYPE_PRODUCER}${ROUND_PRODUCER}const eda={pcb_Layer:new(class{${LAYER_PRODUCER}})};${buildPublicSdkReadCode(allLayersRequest)}`;
    const result: unknown = await runInNewContext(`(async()=>{${code}})()`, { TextEncoder,
      _: { extensionApiMessageBus2: { rpcCall: (method: string): Promise<unknown> => { assert.equal(method, "extensionApi.PCB_Layer.getAllLayers"); return Promise.resolve([structuredClone(native)]); } } } });
    return { structuredContent: { ok: true, result } };
  } });
  producer.assertBridgeDispatchAllowed = (): Promise<true> => Promise.resolve(true);
  producer.assertContext = (): Promise<typeof context> => Promise.resolve(structuredClone(context));
  const current = runtime();
  current.engine.publicSdkRead = producer.publicSdkRead.bind(producer);
  const result = await readPcbActiveLayer(current.engine, request, context, fingerprint());
  assert.deepEqual(result["value"], { ...layer, inactiveColor: "#a.492f", transparency: 12.35, inactiveTransparency: 54.32 });
  assert.equal(calls, 4);
  assert.deepEqual(Object.keys(pcbActiveLayerResultSchema.parse(result["value"])).toSorted(), Object.keys(layer).toSorted());
  assert.equal(parseDocumentSource(sourceString()).objects.length, 3);
});
