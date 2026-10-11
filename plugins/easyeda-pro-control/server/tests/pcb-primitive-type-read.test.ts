import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_PCB_SHA256, PCB_NET_MEMBERSHIP_TYPES, derivePcbPhysicalMembers } from "../src/pcb-net-membership.ts";
import type { PcbNetMembershipEngine } from "../src/pcb-net-membership-read.ts";
import { PCB_PRIMITIVE_TYPE_LIMITATIONS, PCB_PRIMITIVE_TYPE_METHOD, PCB_PRIMITIVE_TYPE_PROFILE, derivePcbPrimitiveType,
  pcbPrimitiveTypeRequestSchema, pcbPrimitiveTypeResultSchema, readPcbPrimitiveType } from "../src/pcb-primitive-type-read.ts";

type Value = Record<string, unknown>;
interface Item { primitiveId: string; primitiveType: string; net: string | null; parentComponentPrimitiveId?: string; padNumber?: string; }
interface Family { count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Item>; }
interface Link { primitiveId: string; parentComponentPrimitiveId: string; padNumber: string; net: string | null; }
interface Inventory { ok: true; kind: "pcb-inventory"; documentType: 3; families: Record<string, Family>;
  componentPadCorrelation: { status: "exact-subset"; count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Link>; byComponentPrimitiveId: Record<string, string[]> }; }
interface Fixture { objects: NativeSourceObject[]; inventory: Inventory; }
const request = { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id: "line" } };
const context = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
function object(type: string, id: string, body: Value): NativeSourceObject { return { type, id, body }; }
function snapshot(objects: NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function family(rows: Item[]): Family { return { count: rows.length, primitiveIds: rows.map((row) => row.primitiveId).toSorted(), byPrimitiveId: Object.fromEntries(rows.map((row) => [row.primitiveId, row])) }; }
function fixture(net = "SIGNAL"): Fixture {
  const objects = [object("LINE", "line", { netName: net }), object("LINE", "unassigned", { netName: "" }), object("ARC", "arc", { netName: net }),
    object("VIA", "via", { netName: net }), object("PAD", "pad", { netName: net, num: "3" }), object("COMPONENT", "component", { footprintUuid: "footprint" }),
    object("PAD_NET", '["PAD_NET","component","1","local"]', { padNet: net }), object("CANVAS", "origin", { x: 0, y: 0 }),
    object("BOARD", "outline", { path: ["CIRCLE", 0, 0, 100] }), object("FILL", "fill", { netName: net })];
  return { objects, inventory: { ok: true, kind: "pcb-inventory", documentType: 3, families: {
    lines: family([{ primitiveId: "line", primitiveType: "Line", net }, { primitiveId: "unassigned", primitiveType: "Line", net: null }]),
    arcs: family([{ primitiveId: "arc", primitiveType: "Arc", net }]), vias: family([{ primitiveId: "via", primitiveType: "Via", net }]),
    pads: family([{ primitiveId: "pad", primitiveType: "Pad", net, padNumber: "3" }, { primitiveId: "componentlocal", primitiveType: "Pad", net, padNumber: "1", parentComponentPrimitiveId: "component" }]),
    components: family([{ primitiveId: "component", primitiveType: "Component", net: null }]),
  }, componentPadCorrelation: { status: "exact-subset", count: 1, primitiveIds: ["componentlocal"],
    byPrimitiveId: { componentlocal: { primitiveId: "componentlocal", parentComponentPrimitiveId: "component", padNumber: "1", net } },
    byComponentPrimitiveId: { component: ["componentlocal"] } } } };
}
function getFamily(state: Fixture, name: string): Family { const value = state.inventory.families[name]; assert.ok(value); return value; }
function source(state: Fixture, id: string): NativeSourceObject { const value = state.objects.find((row) => row.id === id); assert.ok(value); return value; }
function derive(state: Fixture, id = "line"): ReturnType<typeof derivePcbPrimitiveType> {
  return derivePcbPrimitiveType(snapshot(state.objects), state.inventory, { ...request, arguments: { id } }, "board");
}
for (const net of ["SIGNAL", "", "mixedCase"]) {
  for (const [id, expected] of [["line", "Line"], ["arc", "Arc"], ["via", "Via"], ["pad", "Pad"], ["componentlocal", "ComponentPad"], ["unassigned", "Line"]] as const) {
    void test(`native type ${expected} is source-bound for ${id} with net ${JSON.stringify(net)}`, () => {
      const state = fixture(net); const before = structuredClone(state);
      assert.equal(derive(state, id), expected); assert.deepEqual(state, before);
    });
  }
}
for (const id of ["missing", "component", "fill", "outline", "origin", "local", '["PAD_NET","component","1","local"]']) {
  void test(`native type refuses missing/unsupported identity ${id}, never false absence`, () => {
    assert.throws(() => derive(fixture(), id), /existing identity/u);
  });
}
for (const name of ["lines", "arcs", "vias", "pads", "components"]) {
  void test(`all-five-family type lookup refuses missing ${name} even for a known line`, () => {
    const state = fixture(); state.inventory.families = Object.fromEntries(Object.entries(state.inventory.families).filter(([key]) => key !== name));
    assert.throws(() => derive(state));
  });
  void test(`all-five-family type lookup refuses extra ${name} even for a known line`, () => {
    const state = fixture(); const rows = getFamily(state, name); rows.count += 1; rows.primitiveIds.push("extra");
    rows.byPrimitiveId["extra"] = { primitiveId: "extra", primitiveType: "Line", net: "" };
    assert.throws(() => derive(state));
  });
}
const defects: [string, (state: Fixture) => void][] = [
  ["missing unassigned source identity", (state) => { state.objects = state.objects.filter((row) => row.id !== "unassigned"); }],
  ["wrong non-target net", (state) => { source(state, "arc").body["netName"] = "WRONG"; }],
  ["wrong non-target primitive type", (state) => { const row = getFamily(state, "arcs").byPrimitiveId["arc"]; assert.ok(row); row.primitiveType = "Line"; }],
  ["inherited pad and selected-family collision", (state) => { state.objects.push(object("LINE", "componentlocal", { netName: "SIGNAL" })); const rows = getFamily(state, "lines"); rows.count += 1; rows.primitiveIds.push("componentlocal"); rows.byPrimitiveId["componentlocal"] = { primitiveId: "componentlocal", primitiveType: "Line", net: "SIGNAL" }; }],
  ["inherited pad and unsupported-family collision", (state) => { state.objects.push(object("FILL", "componentlocal", { netName: "SIGNAL" })); }],
  ["wrong component owner", (state) => { state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"] = []; }],
  ["missing inherited pad owner", (state) => { const row = getFamily(state, "pads").byPrimitiveId["componentlocal"]; assert.ok(row); delete row.parentComponentPrimitiveId; }],
  ["wrong inherited pad number", (state) => { const row = state.inventory.componentPadCorrelation.byPrimitiveId["componentlocal"]; assert.ok(row); row.padNumber = "2"; }],
  ["partition", (state) => { source(state, "outline").body["partitionId"] = "partition"; }],
  ["unknown source family", (state) => { state.objects.push(object("FUTURE", "future", {})); }],
];
for (const [label, mutate] of defects) {
  void test(`native type refuses ${label} before returning any classification`, () => { const state = fixture(); mutate(state); assert.throws(() => derive(state)); });
}
for (const invalid of [undefined, {}, { ...request, code: "arbitrary()" }, { ...request, method: "eda.pcb_Primitive.getPrimitiveByPrimitiveId" },
  { ...request, arguments: {} }, { ...request, arguments: { id: "" } }, { ...request, arguments: { id: "line\n" } },
  { ...request, arguments: { id: "x".repeat(257) } }, { ...request, arguments: { id: ["line"] } }, { ...request, arguments: { id: "line", primitiveTypes: ["Line"] } }]) {
  void test(`type lookup rejects malformed request ${JSON.stringify(invalid)?.slice(0, 70) ?? "undefined"}`, () => { assert.equal(pcbPrimitiveTypeRequestSchema.safeParse(invalid).success, false); });
}
void test("type result is exactly a supported enum string, never a DTO or undefined", () => {
  for (const value of [undefined, null, [], "Component", "Fill", "", { primitiveType: "Line" }]) { assert.equal(pcbPrimitiveTypeResultSchema.safeParse(value).success, false); }
  for (const value of PCB_NET_MEMBERSHIP_TYPES) { assert.equal(pcbPrimitiveTypeResultSchema.parse(value), value); }
});
void test("shared complete-member extraction retains its literal family and source bounds", () => {
  const state = fixture();
  assert.throws(() => derivePcbPhysicalMembers(snapshot(state.objects), state.inventory, "board", []));
  assert.throws(() => derivePcbPhysicalMembers(snapshot(state.objects), state.inventory, "board", ["Line", "Line"]));
  assert.throws(() => derivePcbPrimitiveType(snapshot(Array.from({ length: 20_001 }, (_, index) => object("NET", `n${index}`, {}))), state.inventory, request, "board"));
  const original = snapshot(state.objects);
  assert.throws(() => derivePcbPrimitiveType({ ...original, sha256: "0".repeat(64) }, state.inventory, request, "board"));
  assert.throws(() => derivePcbPrimitiveType(original, state.inventory, request, "foreign"));
});

function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest(); const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
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
function exact(sample: Value): Value { return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample),
  contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } }; }
function sourceString(objects: NativeSourceObject[]): string {
  const value = snapshot(objects); return [`{"type":"DOCHEAD"}||${JSON.stringify(value.document)}`,
    ...value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n");
}
interface RuntimeOptions { failContext?: number; quarantine?: number; runtimeDrift?: boolean; corruptHash?: number; sourceDrift?: number; failRead?: number; changeKind?: number; inventoryDrift?: boolean; foreignProject?: boolean; }
function runtime(options: RuntimeOptions = {}): { engine: PcbNetMembershipEngine; calls: string[]; counts: { contexts: number; gates: number; statuses: number } } {
  const state = fixture(); const originalFingerprint = fingerprint(); const calls: string[] = [], counts = { contexts: 0, gates: 0, statuses: 0 };
  return { calls, counts, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => { counts.gates += 1; return counts.gates === options.quarantine ? Promise.reject(new Error("quarantined")) : Promise.resolve(true); },
    status: (): Promise<{ stableFingerprint: Value }> => { counts.statuses += 1; return Promise.resolve({ stableFingerprint: options.runtimeDrift === true && counts.statuses > 1 ? { ...originalFingerprint, toolCount: 0 } : structuredClone(originalFingerprint) }); },
    assertContext: (): Promise<typeof context> => {
      counts.contexts += 1;
      if (options.foreignProject === true) { return Promise.resolve({ project: { ...context.project, uuid: "foreign" }, document: { ...context.document, parentProjectUuid: "foreign", tabId: "board@foreign" } }); }
      return counts.contexts === options.failContext ? Promise.resolve({ ...structuredClone(context), document: { ...context.document, tabId: "other" } }) : Promise.resolve(structuredClone(context));
    },
    exactRead: (query): ReturnType<PcbNetMembershipEngine["exactRead"]> => {
      assert.ok(isRecord(query)); const kind = query["kind"]; assert.ok(kind === "pcb-source" || kind === "pcb-inventory"); calls.push(kind);
      if (calls.length === options.failRead) { return Promise.reject(new Error("native read failed")); }
      if (calls.length === options.sourceDrift) { source(state, "outline").body["path"] = ["CIRCLE", 1, 1, 100]; }
      const sample = kind === "pcb-source" ? { ok: true, kind, documentType: 3, source: sourceString(state.objects) } : state.inventory;
      const payload = exact({ ...sample, ...(options.inventoryDrift === true && calls.length === 5 ? { unrelatedNativeMetadata: "changed" } : {}) });
      if (calls.length === options.corruptHash) { payload["source"] = "substitution"; }
      if (calls.length === options.changeKind) { payload["kind"] = "wrong"; }
      return Promise.resolve(payload);
    },
  } };
}
void test("type coordinator returns one exact enum in a truthful native envelope after all six exact reads", async () => {
  const current = runtime(), result = await readPcbPrimitiveType(current.engine, request, context, fingerprint());
  assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"]);
  assert.equal(result["value"], "Line"); assert.equal(result["present"], true); assert.deepEqual(result["undefinedPaths"], []);
  assert.equal(result["method"], PCB_PRIMITIVE_TYPE_METHOD); assert.equal(result["authority"], "native-pcb-identity-type-not-public-method-parity");
  assert.equal(result["implementationKind"], "native-task-equivalent"); assert.equal(result["assurance"], "bounded-native-pcb-type-not-complete-design-state");
  assert.equal(result["publicApiSha256"], PCB_NET_MEMBERSHIP_API_SHA256); assert.equal(result["nativePcbEditorSha256"], PCB_NET_MEMBERSHIP_PCB_SHA256);
  assert.equal(result["liveValidation"], "not-yet-validated"); assert.deepEqual(result["limitations"], PCB_PRIMITIVE_TYPE_LIMITATIONS);
  const { read_consistency: consistency, ...sample } = result; assert.ok(isRecord(consistency)); assert.equal(consistency["snapshotSha256"], sha256Json(sample));
  assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["profile"], PCB_PRIMITIVE_TYPE_PROFILE);
  assert.equal(result["proof"]["primitiveId"], "line"); assert.deepEqual(result["proof"]["completeFamilies"], PCB_NET_MEMBERSHIP_TYPES);
  assert.deepEqual(current.counts, { contexts: 14, gates: 8, statuses: 2 });
});
for (const option of [...Array.from({ length: 6 }, (_, index) => ({ failRead: index + 1 })), ...Array.from({ length: 6 }, (_, index) => ({ corruptHash: index + 1 })),
  { changeKind: 1 }, { sourceDrift: 3 }, { sourceDrift: 4 }, { inventoryDrift: true }, { foreignProject: true }, { runtimeDrift: true },
  ...Array.from({ length: 14 }, (_, index) => ({ failContext: index + 1 })), ...Array.from({ length: 8 }, (_, index) => ({ quarantine: index + 1 }))]) {
  void test(`type coordinator refuses ${JSON.stringify(option)} without retries or writes`, async () => {
    const current = runtime(option); await assert.rejects(readPcbPrimitiveType(current.engine, request, context, fingerprint()));
    assert.ok(current.calls.length <= 6); assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"].slice(0, current.calls.length));
  });
}
for (const document of [{ ...context.document, documentType: 4 }, { ...context.document, parentProjectUuid: "foreign" }, { ...context.document, parentLibraryUuid: "library" },
  { ...context.document, documentUuid: "foreign" }, { ...context.document, tabId: "foreign" }]) {
  void test(`type coordinator rejects invalid document before any call ${JSON.stringify(document)}`, async () => {
    const current = runtime(); await assert.rejects(readPcbPrimitiveType(current.engine, request, { ...context, document }, fingerprint()));
    assert.equal(current.calls.length, 0); assert.equal(current.counts.gates, 0);
  });
}
void test("type coordinator rejects invalid selectors, owner aliases and runtime proof before any call", async () => {
  const current = runtime(); await assert.rejects(readPcbPrimitiveType(current.engine, { ...request, arguments: { id: "" } }, context, fingerprint()));
  await assert.rejects(readPcbPrimitiveType(current.engine, request, { ...context, project: { ...context.project, projectUuid: "foreign" } }, fingerprint()));
  await assert.rejects(readPcbPrimitiveType(current.engine, request, context, {}));
  const changed = fingerprint(); assert.ok(isRecord(changed["installedBundles"]));
  changed["installedBundles"]["pcbEditor"] = { implementationSha256: "0".repeat(64) };
  await assert.rejects(readPcbPrimitiveType(current.engine, request, context, changed));
  assert.equal(current.counts.gates, 0); assert.equal(current.calls.length, 0);
});
