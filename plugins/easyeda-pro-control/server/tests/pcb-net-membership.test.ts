import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_LIMITATIONS, PCB_NET_MEMBERSHIP_METHOD, PCB_NET_MEMBERSHIP_PCB_SHA256,
  derivePcbNetMembership, pcbNetMembershipItemsSchema, pcbNetMembershipRequestSchema } from "../src/pcb-net-membership.ts";
import { readPcbNetMembership } from "../src/pcb-net-membership-read.ts";
import type { PcbNetMembershipEngine } from "../src/pcb-net-membership-read.ts";

type Value = Record<string, unknown>;
interface Item { primitiveId: string; primitiveType: string; net: string | null; parentComponentPrimitiveId?: string; padNumber?: string; }
interface Family { count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Item>; }
interface Link { primitiveId: string; parentComponentPrimitiveId: string; padNumber: string; net: string | null; }
interface Inventory { ok: true; kind: "pcb-inventory"; documentType: 3; families: Record<string, Family>;
  componentPadCorrelation: { status: "exact-subset"; count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Link>; byComponentPrimitiveId: Record<string, string[]> }; }
interface Fixture { objects: NativeSourceObject[]; inventory: Inventory; }
const request = { method: PCB_NET_MEMBERSHIP_METHOD, arguments: { net: "signal", primitiveTypes: ["Line", "Arc", "Via", "Pad", "ComponentPad"] } };
const context = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
function object(type: string, id: string, body: Value): NativeSourceObject { return { type, id, body }; }
function snapshot(objects: NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function family(rows: Item[]): Family { return { count: rows.length, primitiveIds: rows.map((row) => row.primitiveId).toSorted(), byPrimitiveId: Object.fromEntries(rows.map((row) => [row.primitiveId, row])) }; }
function fixture(): Fixture {
  const objects = [object("LINE", "line", { netName: "SIGNAL", parentId: "" }), object("LINE", "other-line", { netName: "OTHER" }),
    object("LINE", "unassigned", { netName: "" }), object("ARC", "arc", { netName: "Signal" }), object("VIA", "via", { netName: "SIGNAL" }),
    object("PAD", "pad", { netName: "SIGNAL", num: "3" }), object("COMPONENT", "component", { footprintUuid: "footprint" }),
    object("PAD_NET", '["PAD_NET","component","1","local"]', { padNet: "SIGNAL" }), object("NET", '["NET","SIGNAL"]', {}),
    object("CANVAS", "origin", { x: 0, y: 0 }), object("FILL", "fill", { netName: "SIGNAL", isBridgingCopper: false })];
  return { objects, inventory: { ok: true, kind: "pcb-inventory", documentType: 3, families: {
    lines: family([{ primitiveId: "line", primitiveType: "Line", net: "SIGNAL" }, { primitiveId: "other-line", primitiveType: "Line", net: "OTHER" }, { primitiveId: "unassigned", primitiveType: "Line", net: null }]),
    arcs: family([{ primitiveId: "arc", primitiveType: "Arc", net: "Signal" }]), vias: family([{ primitiveId: "via", primitiveType: "Via", net: "SIGNAL" }]),
    pads: family([{ primitiveId: "pad", primitiveType: "Pad", net: "SIGNAL", padNumber: "3" },
      { primitiveId: "componentlocal", primitiveType: "Pad", net: "SIGNAL", padNumber: "1", parentComponentPrimitiveId: "component" }]),
    components: family([{ primitiveId: "component", primitiveType: "Component", net: null }]),
  }, componentPadCorrelation: { status: "exact-subset", count: 1, primitiveIds: ["componentlocal"],
    byPrimitiveId: { componentlocal: { primitiveId: "componentlocal", parentComponentPrimitiveId: "component", padNumber: "1", net: "SIGNAL" } },
    byComponentPrimitiveId: { component: ["componentlocal"] } } } };
}
function item(state: Fixture, name: string, id: string): Item {
  const row = state.inventory.families[name]?.byPrimitiveId[id]; assert.ok(row); return row;
}
function getFamily(state: Fixture, name: string): Family { const value = state.inventory.families[name]; assert.ok(value); return value; }
function source(state: Fixture, id: string): NativeSourceObject { const value = state.objects.find((row) => row.id === id); assert.ok(value); return value; }
function derive(state: Fixture, input: unknown = request): ReturnType<typeof derivePcbNetMembership> {
  return derivePcbNetMembership(snapshot(state.objects), state.inventory, input, "board");
}

void test("native net membership preserves spelling, case-folds lookup and proves disjoint physical pad owners", () => {
  const state = fixture();
  const before = structuredClone(state);
  const result = derive(state);
  assert.deepEqual(result.map((row) => [row.primitiveId, row.primitiveType, row.net, row.parentComponentPrimitiveId]), [
    ["arc", "Arc", "Signal", null], ["componentlocal", "ComponentPad", "SIGNAL", "component"], ["line", "Line", "SIGNAL", null],
    ["pad", "Pad", "SIGNAL", null], ["via", "Via", "SIGNAL", null],
  ]);
  assert.equal(result[1]?.sourceRecordId, '["PAD_NET","component","1","local"]');
  assert.deepEqual(state, before);
  assert.deepEqual(derive(state, { ...request, arguments: { net: "UNKNOWN", primitiveTypes: ["Line"] } }), []);
});
for (const type of ["Line", "Arc", "Via", "Pad", "ComponentPad"]) {
  void test(`native net membership returns only the complete selected ${type} role`, () => {
    const result = derive(fixture(), { ...request, arguments: { net: "SIGNAL", primitiveTypes: [type] } });
    assert.equal(result.length, 1); assert.equal(result[0]?.primitiveType, type);
  });
}
void test("native net membership uses Unicode uppercase without normalizing the stored net spelling", () => {
  const state = fixture(); source(state, "line").body["netName"] = "straße"; item(state, "lines", "line").net = "straße";
  assert.equal(derive(state, { ...request, arguments: { net: "STRASSE", primitiveTypes: ["Line"] } })[0]?.net, "straße");
});
void test("ordinary native STRING records do not block or contribute electrical membership", () => {
  const state = fixture();
  const original = derive(state);
  state.objects.push(object("STRING", "silkscreen", { partitionId: "", layerId: 3, text: "SIGNAL", fontFamily: "default", fontSize: 60,
    x: 100, y: 200, strokeWidth: 6, bold: false, italic: false, origin: "LEFT", angle: 0, reverse: false, mirror: false, locked: false }));
  assert.deepEqual(derive(state), original);
  const lines = getFamily(state, "lines");
  lines.primitiveIds.push("silkscreen"); lines.count += 1;
  lines.byPrimitiveId["silkscreen"] = { primitiveId: "silkscreen", primitiveType: "Line", net: "SIGNAL" };
  assert.throws(() => derive(state), /incomplete or ambiguous/u);
});
void test("STRING admission does not admit partition descendants or additional request families", () => {
  const state = fixture(); state.objects.push(object("STRING", "silkscreen", { partitionId: "child", text: "SIGNAL" }));
  assert.throws(() => derive(state), /partition descendants/u);
  assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Text"] } }).success, false);
  assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: ["STRING"] } }).success, false);
});
const nonselectedMetadata: [string, Value][] = [
  ["FONT", { text: "SIGNAL", fontFamily: "default", fontSize: 60, width: 300, height: 60, bold: false, italic: false, reverse: false,
    expansion: 0, path: [[0, 0, "L", 10, 0, "ARC", 90, 20, 10]] }],
  ["RULE_TEMPLATE", { name: "default" }], ["PRIMITIVE", { display: false, pick: false }],
  ["PREFERENCE", { startTrackWidthFollowLast: true, lastTrackWidth: 10, startViaSizeFollowLast: true, lastViaInnerDiameter: 12,
    lastViaDiameter: 24, snap: true, routingMode: "single", routingCorner: "45", removeLoop: true, removeAntenna: true }],
  ["SILK_OPTS", { defaultColor: "#ffffff", baseColor: "#000000" }],
];
for (const [type, body] of nonselectedMetadata) {
  void test(`reviewed ${type} metadata contributes no selected membership and cannot hide incomplete inventory`, () => {
    const state = fixture();
    const original = derive(state);
    state.objects.push(object(type, JSON.stringify([type, "fixture"]), body));
    assert.deepEqual(derive(state), original);
    const lines = getFamily(state, "lines");
    delete lines.byPrimitiveId["unassigned"]; lines.primitiveIds = lines.primitiveIds.filter((id) => id !== "unassigned"); lines.count -= 1;
    assert.throws(() => derive(state), /incomplete or ambiguous/u);
    assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: [type] } }).success, false);
  });
}
const boardPaths: [string, unknown[]][] = [
  ["polygon with drawing Line and Arc children", [0, 0, "L", 100, 0, "ARC", 90, 100, 100, "L", 0, 0]],
  ["nested polygon", [[0, 0, "L", 100, 0, 100, 100, 0, 100, 0, 0]]],
  ["rectangle", ["R", 0, 0, 100, 100, 0, 0]],
  ["circle", ["CIRCLE", 0, 0, 100]],
];
for (const [label, path] of boardPaths) {
  void test(`BOARD ${label} contributes no electrical identities or source changes`, () => {
    const state = fixture();
    const expected = derive(state);
    // The native decoder reads path only, not an apparent net field.
    // That field is not an electrical assignment and cannot fabricate a member.
    state.objects.push(object("BOARD", "board-outline", { path, netName: "SIGNAL" }));
    const before = structuredClone(state);
    assert.deepEqual(derive(state), expected);
    assert.deepEqual(state, before);
    for (const primitiveType of ["Line", "Arc", "Via", "Pad", "ComponentPad"]) {
      const input = { ...request, arguments: { net: "SIGNAL", primitiveTypes: [primitiveType] } };
      assert.deepEqual(derive(state, input), derive(fixture(), input));
    }
  });
}
for (const [name, type] of [["lines", "Line"], ["arcs", "Arc"]] as const) {
  for (const assignedNet of [null, "", "OTHER", "SIGNAL"]) {
    void test(`BOARD cannot excuse an extra ${type} inventory identity with net ${String(assignedNet)}`, () => {
      const state = fixture(); state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] }));
      const rows = getFamily(state, name);
      rows.primitiveIds.push("board-outline-child"); rows.count += 1;
      rows.byPrimitiveId["board-outline-child"] = { primitiveId: "board-outline-child", primitiveType: type, net: assignedNet };
      assert.throws(() => derive(state), /incomplete or ambiguous/u);
    });
  }
}
for (const id of ["line", "other-line", "unassigned"]) {
  void test(`BOARD cannot excuse the missing electrical inventory identity ${id}`, () => {
    const state = fixture(); state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] }));
    const rows = getFamily(state, "lines");
    rows.byPrimitiveId = Object.fromEntries(Object.entries(rows.byPrimitiveId).filter(([key]) => key !== id));
    rows.primitiveIds = rows.primitiveIds.filter((value) => value !== id); rows.count -= 1;
    assert.throws(() => derive(state), /incomplete or ambiguous/u);
  });
}
void test("BOARD admission retains partition, source commitment and request/result family restrictions", () => {
  const state = fixture(); state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] }));
  const before = snapshot(state.objects);
  source(state, "board-outline").body["path"] = ["CIRCLE", 1, 1, 100];
  assert.throws(() => derivePcbNetMembership({ ...before, objects: state.objects }, state.inventory, request, "board"), /commitment/u);
  source(state, "board-outline").body["partitionId"] = "partition";
  assert.throws(() => derive(state), /partition descendants/u);
  assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: ["BOARD"] } }).success, false);
  assert.equal(pcbNetMembershipItemsSchema.safeParse([{ primitiveId: "board-outline", primitiveType: "Line", net: "SIGNAL",
    parentComponentPrimitiveId: null, sourceRecordId: "board-outline", sourceType: "BOARD" }]).success, false);
});
for (const invalid of [undefined, {}, { ...request, code: "arbitrary()" }, { ...request, method: "eda.pcb_Net.selectNet" },
  { ...request, arguments: { net: "SIGNAL" } }, { ...request, arguments: { net: "SIGNAL", primitiveTypes: [] } },
  { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Line", "Line"] } }, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Fill"] } },
  { ...request, arguments: { net: "", primitiveTypes: ["Line"] } }, { ...request, arguments: { net: "SIGNAL\n", primitiveTypes: ["Line"] } },
  { ...request, arguments: { net: "n".repeat(1025), primitiveTypes: ["Line"] } }, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Line"], limit: 1 } }]) {
  void test(`net membership rejects unsupported request ${JSON.stringify(invalid)?.slice(0, 90) ?? "undefined"}`, () => { assert.equal(pcbNetMembershipRequestSchema.safeParse(invalid).success, false); });
}
const defects: [string, (state: Fixture) => void][] = [
  ["missing nonmatching-net line", (state) => { const rows = getFamily(state, "lines"); delete rows.byPrimitiveId["other-line"]; rows.primitiveIds = rows.primitiveIds.filter((id) => id !== "other-line"); rows.count -= 1; }],
  ["missing unassigned line", (state) => { const rows = getFamily(state, "lines"); delete rows.byPrimitiveId["unassigned"]; rows.primitiveIds = rows.primitiveIds.filter((id) => id !== "unassigned"); rows.count -= 1; }],
  ["extra native line", (state) => { const rows = getFamily(state, "lines"); rows.byPrimitiveId["phantom"] = { primitiveId: "phantom", primitiveType: "Line", net: "OTHER" }; rows.primitiveIds.push("phantom"); rows.count += 1; }],
  ["wrong line net", (state) => { item(state, "lines", "other-line").net = "SIGNAL"; }],
  ["wrong native line type", (state) => { item(state, "lines", "line").primitiveType = "Arc"; }],
  ["contradictory row ID", (state) => { item(state, "lines", "line").primitiveId = "other-line"; }],
  ["repeated family ID", (state) => { getFamily(state, "lines").primitiveIds[1] = "line"; }],
  ["wrong family count", (state) => { getFamily(state, "lines").count = 0; }],
  ["missing family", (state) => { delete state.inventory.families["arcs"]; }],
  ["unsupported source record", (state) => { state.objects.push(object("FUTURE_LINE", "new", { netName: "OTHER" })); }],
  ["derived copper source", (state) => { state.objects.push(object("POURED", "poured", { netName: "OTHER" })); }],
  ["partition owner", (state) => { source(state, "line").body["partitionId"] = "partition"; }],
  ["inherited line", (state) => { source(state, "line").body["parentId"] = "component"; }],
  ["unknown native parent", (state) => { item(state, "lines", "line").parentComponentPrimitiveId = "component"; }],
  ["missing native net field", (state) => { delete source(state, "line").body["netName"]; }],
  ["PAD_NET without component", (state) => { state.objects = state.objects.filter((row) => row.type !== "COMPONENT"); }],
  ["PAD_NET noncanonical ID", (state) => { const index = state.objects.findIndex((row) => row.type === "PAD_NET"); state.objects[index] = object("PAD_NET", '["PAD_NET", "component", "1", "local"]', { padNet: "SIGNAL" }); }],
  ["PAD_NET identity too long", (state) => { const index = state.objects.findIndex((row) => row.type === "PAD_NET"); state.objects[index] = object("PAD_NET", '["PAD_NET","component","1","local","extra"]', { padNet: "SIGNAL" }); }],
  ["PAD_NET contradictory explicit parent", (state) => { const row = state.objects.find((entry) => entry.type === "PAD_NET"); assert.ok(row); row.body["parentId"] = "other"; }],
  ["PAD_NET missing assignment", (state) => { const row = state.objects.find((entry) => entry.type === "PAD_NET"); assert.ok(row); delete row.body["padNet"]; }],
  ["two records alias same physical pad", (state) => { state.objects.push(object("PAD", "componentlocal", { num: "1", netName: "SIGNAL" })); }],
  ["inherited local-only ID", (state) => { item(state, "pads", "componentlocal").primitiveId = "local"; }],
  ["inherited parent lost", (state) => { delete item(state, "pads", "componentlocal").parentComponentPrimitiveId; }],
  ["standalone falsely inherited", (state) => { item(state, "pads", "pad").parentComponentPrimitiveId = "component"; }],
  ["pad number contradiction", (state) => { item(state, "pads", "componentlocal").padNumber = "2"; }],
  ["component count missing", (state) => { getFamily(state, "components").count = 0; }],
  ["component identity substitution", (state) => { item(state, "components", "component").primitiveId = "other"; }],
  ["component native type substitution", (state) => { item(state, "components", "component").primitiveType = "Pad"; }],
  ["component correlation extra key", (state) => { state.inventory.componentPadCorrelation.byPrimitiveId["extra"] = { primitiveId: "extra", parentComponentPrimitiveId: "component", net: "SIGNAL", padNumber: "2" }; }],
  ["component correlation missing owner", (state) => { delete state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"]; }],
  ["component correlation duplicate child", (state) => { state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"] = ["componentlocal", "componentlocal"]; }],
  ["component correlation wrong child", (state) => { state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"] = ["pad"]; }],
  ["component correlation wrong count", (state) => { state.inventory.componentPadCorrelation.count = 0; }],
  ["component correlation wrong parent", (state) => { const row = state.inventory.componentPadCorrelation.byPrimitiveId["componentlocal"]; assert.ok(row); row.parentComponentPrimitiveId = "other"; }],
  ["component correlation wrong net", (state) => { const row = state.inventory.componentPadCorrelation.byPrimitiveId["componentlocal"]; assert.ok(row); row.net = "OTHER"; }],
];
for (const [label, mutate] of defects) {
  void test(`net membership refuses ${label} before publishing a subset`, () => { const state = fixture(); mutate(state); assert.throws(() => derive(state)); });
}
void test("Pad-only requests still prove all inherited physical pad ownership before filtering", () => {
  const state = fixture(); delete item(state, "pads", "componentlocal").parentComponentPrimitiveId;
  assert.throws(() => derive(state, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Pad"] } }));
});
void test("unrequested families do not require a fabricated completeness claim", () => {
  const state = fixture(); delete state.inventory.families["arcs"];
  assert.equal(derive(state, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Line"] } }).length, 1);
});
void test("source commitments, identities, editor versions and duplicate source IDs are mandatory", () => {
  const state = fixture();
  const original = snapshot(state.objects);
  for (const changed of [{ ...original, sha256: "0".repeat(64) }, { ...original, document: { ...original.document, uuid: "foreign" } },
    { ...original, document: { ...original.document, editVersion: "latest" } }, snapshot([...state.objects, source(state, "line")])]) {
    assert.throws(() => derivePcbNetMembership(changed, state.inventory, request, "board"));
  }
  assert.throws(() => derivePcbNetMembership(original, state.inventory, request, "foreign"));
});
void test("source row and result byte bounds never truncate membership", () => {
  const state = fixture(); const empty = Array.from({ length: 20_001 }, (_, index) => object("NET", `n${index}`, {}));
  assert.throws(() => derivePcbNetMembership(snapshot(empty), state.inventory, request, "board"));
  const rows: NativeSourceObject[] = [];
  const items: Item[] = [];
  const longNet = "N".repeat(1024);
  for (let index = 0; index < 2500; index += 1) { const id = `line${index}`; rows.push(object("LINE", id, { netName: longNet })); items.push({ primitiveId: id, primitiveType: "Line", net: longNet }); }
  state.objects = rows; state.inventory.families["lines"] = family(items);
  assert.throws(() => derive(state, { ...request, arguments: { net: longNet, primitiveTypes: ["Line"] } }), /byte bound/u);
});
void test("strict result schema refuses extra fields, duplicates and mismatched physical owner roles", () => {
  const rows = derive(fixture());
  const row = rows[0];
  const inherited = rows[1]; assert.ok(row && inherited);
  for (const value of [[{ ...row, x: 12 }], [row, row], [{ ...row, sourceType: "PAD" }], [{ ...row, parentComponentPrimitiveId: "component" }],
    [{ ...inherited, sourceRecordId: '["PAD_NET","other","1","local"]' }], [{ ...inherited, parentComponentPrimitiveId: null }],
    [{ ...inherited, primitiveId: "component", sourceRecordId: '["PAD_NET","component","1",""]' }]]) {
    assert.equal(pcbNetMembershipItemsSchema.safeParse(value).success, false);
  }
});

function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"];
  const pinnedRuntime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinnedRuntime.healthVersion, node_version: pinnedRuntime.nodeVersion, bridge_connected: true, easyeda_version: pinnedRuntime.easyedaVersion,
      extension_version: pinnedRuntime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinnedRuntime.bridgeVersion, ...(pinnedRuntime.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinnedRuntime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinnedRuntime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinnedRuntime.dispatcher.source, dispatcher_build_id: pinnedRuntime.dispatcher.buildId, total: pinnedRuntime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api.d.ts" } } };
}
function exact(sample: Value): Value { return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample),
  contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } }; }
function sourceString(objects: NativeSourceObject[]): string {
  const value = snapshot(objects); return [`{"type":"DOCHEAD"}||${JSON.stringify(value.document)}`,
    ...value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n");
}
interface RuntimeOptions { failContext?: number; quarantine?: number; runtimeDrift?: boolean; corruptHash?: number; sourceDrift?: boolean; failRead?: number; changeKind?: number; cycleDrift?: boolean; inventoryDrift?: boolean; foreignProject?: boolean; metadataDrift?: boolean; boardDrift?: number; }
function runtime(options: RuntimeOptions = {}): { engine: PcbNetMembershipEngine; calls: string[]; counts: { contexts: number; gates: number; statuses: number } } {
  const state = fixture();
  if (options.boardDrift !== undefined) { state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] })); }
  const originalFingerprint = fingerprint();
  const calls: string[] = [];
  const counts = { contexts: 0, gates: 0, statuses: 0 };
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
      if (options.sourceDrift === true && calls.length === 3) { source(state, "other-line").body["netName"] = "CHANGED"; }
      if (options.metadataDrift === true && calls.length === 3) { state.objects.push(object("PREFERENCE", "routing-settings", { removeAntenna: false })); }
      if (calls.length === options.boardDrift) { source(state, "board-outline").body["path"] = ["CIRCLE", 1, 1, 100]; }
      if (options.cycleDrift === true && calls.length === 4) { source(state, "other-line").body["netName"] = "CHANGED"; item(state, "lines", "other-line").net = "CHANGED"; }
      const sample = kind === "pcb-source" ? { ok: true, kind, documentType: 3, source: sourceString(state.objects) } : state.inventory;
      const payload = exact({ ...sample, ...(options.inventoryDrift === true && calls.length === 5 ? { unrelatedNativeMetadata: "changed" } : {}) });
      if (calls.length === options.corruptHash) { payload["source"] = "substitution"; }
      if (calls.length === options.changeKind) { payload["kind"] = "wrong"; }
      return Promise.resolve(payload);
    },
  } };
}
void test("coordinator uses source/inventory/source exact observations and records native authority", async () => {
  const current = runtime(), result = await readPcbNetMembership(current.engine, request, context, fingerprint());
  assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"]);
  assert.equal(result["authority"], "native-filtered-net-membership-not-connectivity-or-persistence-proof");
  assert.equal(result["implementationKind"], "native-task-equivalent");
  assert.equal(result["assurance"], "bounded-native-net-membership-not-connectivity-or-persistence-proof");
  assert.equal(result["publicApiSha256"], PCB_NET_MEMBERSHIP_API_SHA256);
  assert.equal(result["nativePcbEditorSha256"], PCB_NET_MEMBERSHIP_PCB_SHA256);
  assert.equal(result["liveValidation"], "not-yet-validated");
  assert.deepEqual(result["limitations"], PCB_NET_MEMBERSHIP_LIMITATIONS);
  assert.deepEqual(result["value"], derive(fixture()));
  const { read_consistency: consistency, ...sample } = result; assert.ok(isRecord(consistency)); assert.equal(consistency["snapshotSha256"], sha256Json(sample));
  assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["observationCycles"], 2); assert.equal(result["proof"]["samplesPerRead"], 2);
  assert.deepEqual(current.counts, { contexts: 14, gates: 8, statuses: 2 });
});
for (const option of [...Array.from({ length: 6 }, (_, index) => ({ failRead: index + 1 })), ...Array.from({ length: 6 }, (_, index) => ({ corruptHash: index + 1 })),
  { changeKind: 1 }, { sourceDrift: true }, { metadataDrift: true }, { boardDrift: 3 }, { boardDrift: 4 }, { cycleDrift: true }, { inventoryDrift: true }, { foreignProject: true }, { runtimeDrift: true }, ...Array.from({ length: 14 }, (_, index) => ({ failContext: index + 1 })),
  ...Array.from({ length: 8 }, (_, index) => ({ quarantine: index + 1 }))]) {
  void test(`coordinator refuses ${JSON.stringify(option)} without retry or a write path`, async () => {
    const current = runtime(option); await assert.rejects(readPcbNetMembership(current.engine, request, context, fingerprint()));
    assert.ok(current.calls.length <= 6); assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"].slice(0, current.calls.length));
  });
}
for (const document of [{ ...context.document, documentType: 4 }, { ...context.document, parentProjectUuid: "foreign" },
  { ...context.document, parentLibraryUuid: "library" }, { ...context.document, documentUuid: "foreign" }, { ...context.document, tabId: "foreign" }]) {
  void test(`coordinator rejects invalid ownership before read ${JSON.stringify(document)}`, async () => {
    const current = runtime(); await assert.rejects(readPcbNetMembership(current.engine, request, { ...context, document }, fingerprint()));
    assert.equal(current.calls.length, 0); assert.equal(current.counts.gates, 0);
  });
}
void test("coordinator rejects unsupported selectors and contradictory project aliases before read", async () => {
  const current = runtime(); await assert.rejects(readPcbNetMembership(current.engine, { ...request, arguments: { net: "SIGNAL" } }, context, fingerprint()));
  await assert.rejects(readPcbNetMembership(current.engine, request, { ...context, project: { ...context.project, projectUuid: "foreign" } }, fingerprint()));
  assert.equal(current.counts.gates, 0); assert.equal(current.calls.length, 0);
});
void test("coordinator rejects missing or substituted runtime proof before a gate or read", async () => {
  for (const invalid of [{}, { ...fingerprint(), toolCount: 0 }, { ...fingerprint(), installedBundles: {} }]) {
    const current = runtime();
    await assert.rejects(readPcbNetMembership(current.engine, request, context, invalid));
    assert.equal(current.counts.gates, 0); assert.equal(current.calls.length, 0);
  }
});
