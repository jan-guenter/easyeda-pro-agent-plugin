/* oxlint-disable import/max-dependencies -- Exercise both public coordinators against the real inventory producer and maintained native checkpoint decoder. */
import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import type { CheckpointReceipt } from "../src/checkpoint.ts";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { buildExactReadCode, decodeExactReadEnvelope, validateExactReadPayload } from "../src/exact-readers.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "../src/native-history.ts";
import { assertPcbInheritedLineEvidence, capturePcbInheritedLineScope, derivePcbInheritedLines } from "../src/pcb-inherited-lines.ts";
import { PCB_NET_MEMBERSHIP_METHOD, derivePcbNetMembership } from "../src/pcb-net-membership.ts";
import { readPcbNetMembership } from "../src/pcb-net-membership-read.ts";
import type { PcbNetMembershipEngine } from "../src/pcb-net-membership-read.ts";
import { PCB_PRIMITIVE_TYPE_METHOD, derivePcbPrimitiveType, readPcbPrimitiveType } from "../src/pcb-primitive-type-read.ts";
import { PCB_SELECTED_OBJECTS_IDS_METHOD, PCB_SELECTED_OBJECTS_METHOD } from "../src/pcb-selected-objects.ts";
import { readPcbSelectedObjects } from "../src/pcb-selected-objects-read.ts";
import { validatePublicSdkReadPayload } from "../src/public-sdk-read.ts";

type Value = Record<string, unknown>;
const BRANCH = "22".repeat(16), HISTORY = "33".repeat(16), KEY = "44".repeat(16), PROJECT = "11".repeat(32);
const sourceDocument = { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" };
const context = { project: { uuid: PROJECT, path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: `board@${PROJECT}`, parentProjectUuid: PROJECT } };
const request = { method: PCB_NET_MEMBERSHIP_METHOD, arguments: { net: "signal", primitiveTypes: ["Line"] } };
const typeRequest = { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id: "component-1template-line" } };
interface Fixture { objects: NativeSourceObject[]; footprint: NativeSourceObject[]; lineRows: Value[]; }
function row(type: string, id: string, body: Value): NativeSourceObject { return { type, id, body }; }
function fixture(): Fixture {
  const objects = [row("LINE", "standalone", { netName: "SIGNAL" })];
  const lineRows: Value[] = [{ primitiveId: "standalone", primitiveType: "Line", net: "SIGNAL", layer: 1,
    startX: 0, startY: 0, endX: 10, endY: 0, lineWidth: 5, primitiveLock: false }];
  // Synthetic geometry exercises the pinned native /10, translate, *10 order.
  for (const [index, x] of [202.278, 57.531].entries()) {
    const id = `component-${String(index + 1)}`, y = -225.8584;
    objects.push(row("COMPONENT", id, { partitionId: "", groupId: 0, layerId: 1, x, y, angle: 0,
      attrs: { "Unique ID": id, "Channel ID": `$1I${String(index + 1)}`, "Group ID": "", "Reuse Block": "" }, locked: false, zIndex: -1 }),
    row("ATTR", `${id}attr`, { parentId: id, key: "Footprint", value: "footprint" }));
    lineRows.push({ primitiveId: `${id}template-line`, primitiveType: "Line", net: "", layer: 3,
      startX: x / 10 * 10, startY: (80 / 10 + y / 10) * 10,
      endX: (100 / 10 + x / 10) * 10, endY: (80 / 10 + y / 10) * 10, lineWidth: 6, primitiveLock: false });
  }
  return { objects, lineRows, footprint: [row("LINE", "template-line", { groupId: 0, netName: "", layerId: 3,
    startX: 0, startY: 80, endX: 100, endY: 80, width: 6, locked: false, zIndex: -1 }),
  row("CANVAS", "CANVAS", { originX: 0, originY: 0, unit: "mm", gridXSize: 10, gridYSize: 10, snapXSize: 1, snapYSize: 1,
    gridType: "NONE", multiGridType: "NONE", highlightValue: 0.5 }), row("META", "META", { title: "synthetic" })] };
}
function snapshot(state: Fixture): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: sourceDocument,
    objects: state.objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function document(uuid: string, docType: string, objects: NativeSourceObject[]): NativeDocumentSnapshot {
  const metadata = { uuid, docType, editVersion: sourceDocument.editVersion };
  const records: NativeObjectSnapshot[] = objects.toSorted((left, right) => left.id.localeCompare(right.id)).map((entry, index) =>
    Object.assign(structuredClone(entry), { ticket: index + 1, client: null }));
  return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata,
    records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
}
function history(state: Fixture): NativeHistorySnapshot {
  const documents = [document("board", "PCB", state.objects), document("footprint", "FOOTPRINT", state.footprint)];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: PROJECT, branchUuid: BRANCH, headHistoryUuid: HISTORY,
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 4096, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
type State = Record<string, () => unknown>;
type AsyncFunctionConstructor = new (...parameters: string[]) => (eda: unknown) => Promise<unknown>;
/* oxlint-disable typescript/no-unsafe-type-assertion, typescript/no-unsafe-member-access -- Execute the actual generated inventory program against synthetic SDK objects, never the bridge. */
const AsyncFunction = Object.getPrototypeOf(async (): Promise<void> => { await Promise.resolve(); }).constructor as AsyncFunctionConstructor;
/* oxlint-enable typescript/no-unsafe-type-assertion, typescript/no-unsafe-member-access */
function getters(fields: Value): State {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [`getState_${key.slice(0, 1).toUpperCase()}${key.slice(1)}`, () => value]));
}
async function producedInventory(state: Fixture): Promise<Value> {
  const types = ["Component", "Pad", "Via", "Line", "Arc", "String", "Attribute", "Polyline", "Region", "Pour", "Fill", "Dimension", "Image", "Object", "Poured"];
  const components = state.objects.filter((entry) => entry.type === "COMPONENT").map((entry) => ({ primitiveId: entry.id }));
  const eda = Object.fromEntries(types.map((type) => {
    let values: Value[] = [];
    if (type === "Component") { values = components; }
    if (type === "Line") { values = state.lineRows; }
    return [`pcb_Primitive${type}`, { getAllPrimitiveId: (): unknown[] => values.map((entry) => entry["primitiveId"]),
      getAll: (): State[] => values.map((entry) => getters(entry)), getAllPinsByPrimitiveId: (): never[] => [] }];
  }));
  const query = { kind: "pcb-inventory" } as const;
  const envelope = await new AsyncFunction("eda", buildExactReadCode(query))(eda);
  const result = validateExactReadPayload(decodeExactReadEnvelope(envelope), query);
  assert.ok(isRecord(result)); return result;
}
function valueAt(rows: NativeSourceObject[], id: string): Value { const found = rows.find((entry) => entry.id === id); assert.ok(found); return found.body; }
function observed(state: Fixture): Value { const found = state.lineRows[1]; assert.ok(found); return found; }
function derive(state: Fixture, inventory: unknown): ReturnType<typeof derivePcbInheritedLines> {
  return derivePcbInheritedLines(snapshot(state), inventory, history(state));
}

void test("actual producer proves explicit inherited Line ownership without changing nonempty-net values", async () => {
  const state = fixture();
  const inventory = await producedInventory(state), source = snapshot(state);
  assert.throws(() => derivePcbNetMembership(source, inventory, request, "board"), /requires fresh inherited-library evidence/u);
  const proof = derive(state, inventory);
  assert.equal(proof.members.length, 2);
  assert.deepEqual(proof.members[0], { primitiveId: "component-1template-line", primitiveType: "Line", net: "",
    parentComponentPrimitiveId: "component-1", sourceRecordId: "template-line", sourceType: "FOOTPRINT_LINE", sourceDocumentUuid: "footprint" });
  assert.deepEqual(derivePcbNetMembership(source, inventory, request, "board", proof), [{ primitiveId: "standalone", primitiveType: "Line",
    net: "SIGNAL", parentComponentPrimitiveId: null, sourceRecordId: "standalone", sourceType: "LINE" }]);
  assert.equal(derivePcbPrimitiveType(source, inventory, typeRequest, "board", proof), "Line");
  assert.throws(() => { assertPcbInheritedLineEvidence(structuredClone(proof), source, inventory); }, /not generated/u);
  assert.throws(() => { assertPcbInheritedLineEvidence(proof, source, { ...inventory, substituted: true }); }, /not generated/u);
  assert.ok(Object.isFrozen(proof) && Object.isFrozen(proof.members) && Object.isFrozen(proof.members[0]));
});

const defects: [string, (state: Fixture) => void][] = [
  ["rotated owner", (state) => { valueAt(state.objects, "component-1")["angle"] = 90; }],
  ["bottom owner", (state) => { valueAt(state.objects, "component-1")["layerId"] = 2; }],
  ["locked owner", (state) => { valueAt(state.objects, "component-1")["locked"] = true; }],
  ["layer replacements", (state) => { valueAt(state.objects, "component-1")["layerIdReplacements"] = { 3: 4 }; }],
  ["grouped owner", (state) => { valueAt(state.objects, "component-1")["groupId"] = 1; }],
  ["group association", (state) => { const attrs = valueAt(state.objects, "component-1")["attrs"]; assert.ok(isRecord(attrs)); attrs["Group ID"] = "group"; }],
  ["reuse association", (state) => { const attrs = valueAt(state.objects, "component-1")["attrs"]; assert.ok(isRecord(attrs)); attrs["Reuse Block"] = "reuse"; }],
  ["partition owner", (state) => { valueAt(state.objects, "component-1")["partitionId"] = "partition"; }],
  ["missing link", (state) => { state.objects = state.objects.filter((entry) => entry.id !== "component-1attr"); }],
  ["duplicate link", (state) => { state.objects.push(row("ATTR", "duplicate", { parentId: "component-1", key: "Footprint", value: "footprint" })); }],
  ["unavailable footprint", (state) => { valueAt(state.objects, "component-1attr")["value"] = "absent"; }],
  ["custom chain", (state) => { state.footprint.push(row("FOOTPRINT", "custom", { source: "footprint" })); }],
  ["deleted footprint", (state) => { state.footprint.push(row("DELETE_DOC", "DELETE_DOC", { isDelete: true })); }],
  ["offset origin", (state) => { valueAt(state.footprint, "CANVAS")["originX"] = 1; }],
  ["assigned library net", (state) => { valueAt(state.footprint, "template-line")["netName"] = "SIGNAL"; }],
  ["bottom silkscreen", (state) => { valueAt(state.footprint, "template-line")["layerId"] = 4; }],
  ["inherited source parent", (state) => { valueAt(state.footprint, "template-line")["parentId"] = "custom"; }],
  ["native collision fallback", (state) => { state.objects.push(row("STRING", "component-1template-line", {})); }],
  ["missing inherited instance", (state) => { state.lineRows.splice(1, 1); }],
  ["wrong inherited ID", (state) => { observed(state)["primitiveId"] = "prefix-guess"; }],
  ["wrong coordinate", (state) => { observed(state)["endX"] = 302.278; }],
  ["wrong width", (state) => { observed(state)["lineWidth"] = 7; }],
  ["wrong net", (state) => { observed(state)["net"] = "SIGNAL"; }],
  ["wrong lock", (state) => { observed(state)["primitiveLock"] = true; }],
];
for (const [label, corrupt] of defects) {
  void test(`inherited real-producer evidence refuses ${label}`, async () => {
    const state = fixture(); corrupt(state); const inventory = await producedInventory(state);
    assert.throws(() => derive(state, inventory));
  });
}
void test("unaccounted line, forged parent, stale saved binding and stale commitments refuse", async () => {
  const state = fixture();
  const before = history(state), inventory = await producedInventory(state);
  valueAt(state.objects, "component-1")["x"] = 20;
  assert.throws(() => derivePcbInheritedLines(snapshot(state), inventory, before), /bindings differ/u);
  const intact = fixture(), stale = history(intact);
  const tampered = { ...stale, documents: stale.documents.map((entry) => Object.assign(structuredClone(entry), { semanticSha256: "f".repeat(64) })) };
  assert.throws(() => derivePcbInheritedLines(snapshot(intact), inventory, tampered), /commitment/u);
  const families = inventory["families"]; assert.ok(isRecord(families)); const lines = families["lines"]; assert.ok(isRecord(lines));
  const byId = lines["byPrimitiveId"]; assert.ok(isRecord(byId)); const inherited = byId["component-1template-line"]; assert.ok(isRecord(inherited));
  inherited["parentComponentPrimitiveId"] = "component-2";
  assert.throws(() => derive(intact, inventory));
  delete inherited["parentComponentPrimitiveId"];
  const ids = lines["primitiveIds"]; assert.ok(Array.isArray(ids)); ids.push("unaccounted"); lines["count"] = 4;
  byId["unaccounted"] = { ...inherited, primitiveId: "unaccounted" };
  const evidence = derive(intact, inventory);
  assert.throws(() => derivePcbNetMembership(snapshot(intact), inventory, request, "board", evidence), /complete family/u);
});

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
function sourceString(state: Fixture): string {
  return [{ type: "DOCHEAD", body: sourceDocument }, ...state.objects].map((entry) => {
    const { body, ...header } = entry; return `${JSON.stringify(header)}||${JSON.stringify(body)}`;
  }).join("|\n");
}
function exact(sample: Value): Value { return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample),
  contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } }; }
async function runtime(state: Fixture, failedVerification?: number): Promise<{ engine: PcbNetMembershipEngine; counts: { observations: number; creations: number; verifications: number } }> {
  // Real encrypted SQLite fixture: the coordinator uses its normal maintained
  // Readonly history decoder; only the host checkpoint/context transport is fake.
  const directory = await mkdtemp(join(tmpdir(), "pcb-inherited-lines-test-"));
  const checkpointPath = join(directory, "synthetic.eprj2");
  const content = history(state).documents.map((entry) => {
    const rows = [{ type: "DOCHEAD", body: entry.metadata }, ...entry.records];
    return rows.map((record, index) => {
      const { body, ...header } = record; return `${JSON.stringify({ ...header, ticket: index + 1 })}||${JSON.stringify(body)}|\n`;
    }).join("");
  }).join("");
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(KEY, "hex"), Buffer.from(HISTORY, "hex"));
  // oxlint-disable-next-line node/no-sync -- Bounded synthetic fixture compression precedes the test's async coordinator.
  const compressed = gzipSync(content);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]).toString("base64");
  const database = new DatabaseSync(checkpointPath);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY,branch_uuid TEXT,owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY,project_uuid TEXT,history_uuid TEXT);
      CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(PROJECT, BRANCH, "d".repeat(32));
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, PROJECT, HISTORY);
    database.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`).run(HISTORY, null, null, KEY, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HISTORY, HISTORY, encrypted);
  } finally { database.close(); }
  const digest = createHash("sha256").update(await readFile(checkpointPath)).digest("hex");
  const fileIdentity = { birthtimeNs: "1", ctimeNs: "1", dev: "1", ino: "1" };
  const receipt: CheckpointReceipt = { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "test", source: context.project.path,
    checkpoint: checkpointPath, sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity, sourceSha256: digest, checkpointSha256: digest,
    sourceDumpSha256: digest, checkpointDumpSha256: digest, receiptSha256: digest, receiptPath: join(directory, "receipt.json") };
  const counts = { observations: 0, creations: 0, verifications: 0 };
  return { counts, engine: {
    status: (): Promise<{ stableFingerprint: Value }> => Promise.resolve({ stableFingerprint: fingerprint() }),
    assertBridgeDispatchAllowed: (): Promise<true> => Promise.resolve(true),
    assertContext: (): Promise<typeof context> => Promise.resolve(structuredClone(context)),
    checkpoint: (input): ReturnType<PcbNetMembershipEngine["checkpoint"]> => {
      assert.ok(isRecord(input));
      if (input["receiptPath"] === undefined) { counts.creations += 1; return Promise.resolve(receipt); }
      counts.verifications += 1;
      assert.equal(input["receiptPath"], receipt.receiptPath);
      return Promise.resolve({ ...receipt, ok: true, sourceChanged: counts.verifications === failedVerification,
        sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true });
    },
    exactRead: async (input): ReturnType<PcbNetMembershipEngine["exactRead"]> => {
      counts.observations += 1; assert.ok(isRecord(input));
      if (input["kind"] === "pcb-source") { return exact({ ok: true, kind: "pcb-source", documentType: 3, source: sourceString(state) }); }
      assert.equal(input["kind"], "pcb-inventory"); return exact(await producedInventory(state));
    },
  } };
}
for (const typeLookup of [false, true]) {
  void test(`all inherited rows missing cannot bypass fresh library proof type=${String(typeLookup)}`, async () => {
    const state = fixture(); state.lineRows = state.lineRows.filter((entry) => entry["primitiveId"] === "standalone");
    const current = await runtime(state);
    const result = typeLookup ? readPcbPrimitiveType(current.engine, { ...typeRequest, arguments: { id: "standalone" } }, context, fingerprint())
      : readPcbNetMembership(current.engine, request, context, fingerprint());
    await assert.rejects(result);
    assert.equal(current.counts.creations, 1); assert.equal(current.counts.observations, 6);
  });
  void test(`ordinary zero-Line footprints are proved, not assumed absent type=${String(typeLookup)}`, async () => {
    const state = fixture(); state.lineRows = state.lineRows.filter((entry) => entry["primitiveId"] === "standalone");
    state.footprint = state.footprint.filter((entry) => entry.type !== "LINE");
    const current = await runtime(state);
    const result = typeLookup ? await readPcbPrimitiveType(current.engine, { ...typeRequest, arguments: { id: "standalone" } }, context, fingerprint())
      : await readPcbNetMembership(current.engine, request, context, fingerprint());
    const proof = result["proof"]; assert.ok(isRecord(proof)); assert.ok(isRecord(proof["inheritedLines"]));
    assert.deepEqual(proof["inheritedLines"]["instances"], []); assert.equal(current.counts.creations, 1);
  });
  void test(`checkpoint-bound coordinator uses actual inventory/decoder and discards detection cycle type=${String(typeLookup)}`, async () => {
    const current = await runtime(fixture());
    const result = typeLookup ? await readPcbPrimitiveType(current.engine, typeRequest, context, fingerprint())
      : await readPcbNetMembership(current.engine, request, context, fingerprint());
    assert.equal(current.counts.observations, 9); assert.equal(current.counts.creations, 1); assert.equal(current.counts.verifications, 15);
    const proof = result["proof"]; assert.ok(isRecord(proof)); assert.ok(isRecord(proof["inheritedLines"]));
    assert.equal(proof["inheritedLines"]["profile"], "easyeda-pro-control.pcb-inherited-neutral-lines.v1");
    assert.equal(result["liveValidation"], "not-yet-validated");
    if (typeLookup) { assert.equal(result["value"], "Line"); } else { assert.ok(Array.isArray(result["value"])); assert.equal(result["value"].length, 1); }
  });
  for (const failed of [1, 2, 3, 4, 8, 14, 15]) {
    void test(`checkpoint drift stops inherited coordinator before result type=${String(typeLookup)} proof=${String(failed)}`, async () => {
      const current = await runtime(fixture(), failed);
      const result = typeLookup ? readPcbPrimitiveType(current.engine, typeRequest, context, fingerprint())
        : readPcbNetMembership(current.engine, request, context, fingerprint());
      await assert.rejects(result, /unchanged complete checkpoint/u);
      assert.equal(current.counts.creations, 1); assert.equal(current.counts.verifications, failed);
      assert.ok(current.counts.observations <= 9);
    });
  }
}
void test("capture rechecks context and refuses borrowed project history before deriving", async () => {
  const current = await runtime(fixture());
  await assert.rejects(capturePcbInheritedLineScope(current.engine, { ...context, document: { ...context.document, tabId: "different" } }), /project-owned active PCB/u);
  assert.equal(current.counts.creations, 0);
  await assert.rejects(capturePcbInheritedLineScope(current.engine, context, {
    readNativeHistoryCheckpoint: (): Promise<NativeHistorySnapshot> => Promise.resolve({ ...history(fixture()), projectUuid: "f".repeat(64) }),
  }), /checkpoint identity/u);
});
for (const failure of [8, 9, 10, 11, 12, 13, 14, 15, 30, 49, 50, 51]) {
  void test(`inherited checkpoint and accepted-cycle context boundary ${String(failure)} fails closed`, async () => {
    const current = await runtime(fixture()); let contexts = 0;
    current.engine.assertContext = (): Promise<typeof context> => {
      contexts += 1;
      return Promise.resolve(contexts === failure ? { ...context, document: { ...context.document, tabId: "substituted" } } : structuredClone(context));
    };
    await assert.rejects(readPcbPrimitiveType(current.engine, typeRequest, context, fingerprint()), /context changed/u);
    assert.equal(contexts, failure); assert.ok(current.counts.observations <= 9);
  });
}
for (const failedVerification of [undefined, ...Array.from({ length: 14 }, (_, index) => index + 1)]) {
  void test(`selected source shared boundaries retain inherited checkpoint proof ${String(failedVerification)}`, async () => {
    const current = await runtime(fixture(), failedVerification);
    let selections = 0;
    const engine = { ...current.engine, publicSdkRead: (query: unknown): Promise<Value> => {
      const idsRequest = { method: PCB_SELECTED_OBJECTS_IDS_METHOD, arguments: {} };
      assert.deepEqual(query, idsRequest); selections += 1;
      const sample = validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: PCB_SELECTED_OBJECTS_IDS_METHOD,
        present: true, value: ["standalone"], undefinedPaths: [] }, idsRequest);
      return Promise.resolve({ ...exact(sample), authority: "public-sdk-observation-not-complete-design-proof" });
    } };
    const pending = readPcbSelectedObjects(engine, { method: PCB_SELECTED_OBJECTS_METHOD, arguments: {} }, context, fingerprint());
    if (failedVerification === undefined) {
      const result = await pending;
      assert.deepEqual(current.counts, { observations: 9, creations: 1, verifications: 14 });
      assert.equal(selections, 6);
      const proof = result["proof"]; assert.ok(isRecord(proof)); assert.ok(isRecord(proof["inheritedLines"]));
      assert.equal(proof["observationCycles"], 2); assert.equal(proof["samplesPerRead"], 2);
      assert.deepEqual(proof["selectedPrimitiveIds"], ["standalone"]);
    } else {
      await assert.rejects(pending, /unchanged complete checkpoint/u);
      assert.equal(current.counts.verifications, failedVerification);
      assert.ok(current.counts.observations <= 9); assert.ok(selections <= 6);
      // Admission's third reproof is after capture and before a fresh cycle.
      if (failedVerification <= 3) { assert.equal(current.counts.observations, 3); assert.equal(selections, 2); }
    }
    assert.equal(current.counts.creations, 1);
  });
}
