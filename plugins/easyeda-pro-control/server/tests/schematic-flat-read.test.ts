import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, InstalledEasyedaBundles } from "../src/engine.ts";
import type { CheckpointReceipt, CheckpointVerification } from "../src/checkpoint.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";
import { observeSchematicFlatTopology, readSchematicFlatTopology } from "../src/schematic-flat-read.ts";
import type { FlatDisplayObservationEvidence } from "../src/schematic-flat-read.ts";
import { buildExactReadExpression, validateExactReadRequest } from "../src/exact-readers.ts";

const hash = "a".repeat(64), projectUuid = "b".repeat(32);
const context: ContextProbePayload = { project: { uuid: projectUuid, path: "/tmp/disposable-flat.eprj2" },
  document: { uuid: "page", documentType: 1, tabId: `page@${projectUuid}` }, schematic: { uuid: "schematic" } };
const fileIdentity = { birthtimeNs: "1", ctimeNs: "1", dev: "1", ino: "1" };
const receipt: CheckpointReceipt = { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "fixture", source: context.project.path,
  checkpoint: "/tmp/disposable-flat-checkpoint.eprj2", checkpointSha256: hash, sourceSha256: hash,
  sourceDumpSha256: hash, checkpointDumpSha256: hash, receiptSha256: hash, receiptPath: "/tmp/disposable-flat.receipt.json",
  sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity };
const verified: CheckpointVerification = { ...receipt, ok: true, sourceChanged: false, sourceEqualsCheckpoint: true,
  sourceMatchesReceipt: true, checkpointMatchesReceipt: true };
const bundles: InstalledEasyedaBundles = { available: true, assetsRoot: "/fixture",
  pcbEditor: { version: "fixture", implementationPath: "/fixture/pcb", implementationSha256: hash },
  publicApi: { version: "fixture", implementationPath: "/fixture/api", implementationSha256: hash,
    adapterPath: "/fixture/adapter", adapterSha256: hash, declarationsPath: "/fixture/declarations", declarationsSha256: hash } };

function history(): NativeHistorySnapshot {
  const documents = ["SCH", "SCH_PAGE"].map((docType): NativeDocumentSnapshot => {
    const uuid = docType === "SCH" ? "schematic" : "page";
    const metadata = { uuid, docType };
    const records = [{ id: "META", type: "META", ticket: 1, client: null,
      body: docType === "SCH" ? { title: "Disposable" } : { title: "Disposable", schematic: "schematic" } }];
    return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata,
      records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid, projectOwnerUuid: "c".repeat(32), branchUuid: "d".repeat(32), headHistoryUuid: "head",
    checkpointSha256: hash, historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
interface Options { quarantine?: number; profileFail?: number; checkpointFail?: number; contextFail?: number;
  dispatchFail?: boolean; missingPage?: boolean; foreignDeclared?: boolean; varyingSource?: boolean; malformedPayload?: boolean;
  checkpointProofOverride?: Record<string, unknown>; checkpointProofOverrideAt?: number; projectDriftAt?: number; historyHashDrift?: boolean }
function fixture(options: Options = {}): { engine: EasyedaControlEngine; run: () => Promise<Record<string, unknown>>;
  observe: () => Promise<FlatDisplayObservationEvidence>; events: string[] } {
  const events: string[] = [];
  let checkpoints = 0, contexts = 0, dispatches = 0, gates = 0, profiles = 0, projectReads = 0;
  const nativeProject = { setting: { universal: { defaultNetName: true } }, netLabelInterPageConnection: true };
  const source = (): string => `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ docType: "SCH_PAGE", uuid: "page", client: "0123456789abcdef", updateTime: 1, version: "1" })}|\n` +
    `${JSON.stringify({ id: "META", type: "META" })}||${JSON.stringify({ schematic: "schematic", title: options.varyingSource === true ? String(dispatches) : "fixture" })}|\n`;
  const shapeManager = { getModels: (): object[] => [], actionRunner: { running: false }, netPointManager: { getNetPoint: (): undefined => undefined },
    idManager: { idMap: new Map(), get: (): undefined => undefined } };
  const page = { uuid: "page", tabId: context.document.tabId, project_uuid: projectUuid, schematicUuid: "schematic",
    projectMgr: nativeProject, isSchSheetDoc: (): true => true, isBlockSymbolInstancePage: false, shapeManager,
    idManager: shapeManager.idManager, consistencyImpl: { state: "initialized", getSourceCode: source,
      decodeAndRealTimeSyncHandler: { getSourceCodeIdMap: (): Map<string, number> => new Map() } } };
  const runtime = { Map, Set, TextEncoder,
    gVars: { currentProject: { projectId: projectUuid, branchUuid: "d".repeat(32), isV2Format: false }, isHistoryMode: false,
      messageBus: { rpcCall: (topic: string): Promise<{ message: object }> => {
        assert.equal(topic, "/PrjDB/project/getData"); events.push("project-read"); projectReads += 1;
        return Promise.resolve({ message: { uuid: projectUuid, owner: { uuid: projectReads === options.projectDriftAt ? "f".repeat(32) : "c".repeat(32) },
          currentBranch: "d".repeat(32), isV2Format: false } });
      } } }, SCH: { docMemoryManager: { getActiveDoc: (): object => page,
    getSchDocs: (): object[] => options.missingPage === true ? [] : [page] } }, eda: {
    dmt_Project: { getCurrentProjectInfo: (): object => context.project },
    dmt_SelectControl: { getCurrentDocumentInfo: (): object => context.document },
    dmt_Schematic: { getCurrentSchematicInfo: (): object => ({ uuid: "schematic", parentProjectUuid: projectUuid,
      page: [{ uuid: options.foreignDeclared === true ? "foreign" : "page", parentSchematicUuid: "schematic" }] }) },
  } };
  const engine = new EasyedaControlEngine({ installedEasyedaBundles: (): Promise<InstalledEasyedaBundles> => Promise.resolve(bundles),
    callTool: async (name, args): Promise<unknown> => {
      events.push("dispatch"); dispatches += 1; assert.equal(name, "easyeda_execute"); assert.equal(args?.["confirmWrite"], true);
      assert.equal(typeof args?.["code"], "string");
      if (options.dispatchFail === true) { throw new Error("fixture transport"); }
      if (options.malformedPayload === true) { return { structuredContent: { ok: true, result: {} } }; }
      const pending: unknown = runInNewContext(`(async()=>{${String(args?.["code"])}})()`, runtime);
      return { structuredContent: { ok: true, result: await pending } };
    } });
  engine.assertBridgeDispatchAllowed = (): Promise<true> => {
    events.push("gate"); gates += 1;
    return gates === options.quarantine ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true);
  };
  engine.assertContext = (): Promise<ContextProbePayload> => {
    events.push("context"); contexts += 1;
    return contexts === options.contextFail ? Promise.reject(new Error("fixture context")) : Promise.resolve(structuredClone(context));
  };
  engine.checkpoint = (args): Promise<CheckpointReceipt | CheckpointVerification> => {
    events.push(args.receiptPath === undefined ? "checkpoint-create" : "checkpoint-verify");
    if (args.receiptPath === undefined) { return Promise.resolve(structuredClone(receipt)); }
    checkpoints += 1;
    return Promise.resolve({ ...verified, ok: checkpoints !== options.checkpointFail, sourceChanged: checkpoints === options.checkpointFail,
      ...(checkpoints === (options.checkpointProofOverrideAt ?? 1) ? options.checkpointProofOverride : {}) });
  };
  const dependencies = {
    readNativeHistoryCheckpoint: (): Promise<NativeHistorySnapshot> => { events.push("history"); return Promise.resolve({ ...history(), checkpointSha256: options.historyHashDrift === true ? "f".repeat(64) : hash }); },
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => {
      events.push("profile"); profiles += 1;
      return profiles === options.profileFail ? Promise.reject(new Error("fixture profile")) : Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION);
    }, verifyDeviceAssociationNativeProfile: (): Promise<void> => Promise.resolve(),
  };
  const run = (): Promise<Record<string, unknown>> => readSchematicFlatTopology(engine, context, dependencies);
  const observe = (): Promise<FlatDisplayObservationEvidence> => observeSchematicFlatTopology(engine, context, dependencies);
  return { engine, run, observe, events };
}

void test("flat reader executes its actual generated capture twice with independently bound saved membership", async () => {
  const current = fixture(); const result = await current.run();
  assert.equal(result["kind"], "schematic-flat-topology"); assert.equal(result["transactionTopology"], false);
  assert.equal(result["currentGenerationLiveValidated"], false); assert.deepEqual(result["topology"], []);
  assert.equal(current.events.filter((event) => event === "dispatch").length, 2);
  assert.equal(current.events.filter((event) => event === "checkpoint-verify").length, 6);
  assert.ok(current.events.indexOf("history") < current.events.indexOf("dispatch"));
});
void test("flat reader fails on absent loaded pages or conflicting public membership without a retry", async () => {
  for (const options of [{ missingPage: true }, { foreignDeclared: true }, { malformedPayload: true }]) {
    const current = fixture(options); await assert.rejects(current.run());
    assert.equal(current.events.filter((event) => event === "dispatch").length, 1);
  }
});
void test("flat reader stops after an uncertain transport or changed first post-read checkpoint", async () => {
  for (const options of [{ dispatchFail: true }, { checkpointFail: 3 }, { contextFail: 3 }, { quarantine: 3 }]) {
    const current = fixture(options); await assert.rejects(current.run());
    assert.equal(current.events.filter((event) => event === "dispatch").length, 1);
  }
});
void test("flat reader never publishes differing complete observations or late profile drift", async () => {
  for (const options of [{ varyingSource: true }, { profileFail: 2 }, { checkpointFail: 6 }, { contextFail: 6 }]) {
    const current = fixture(options); await assert.rejects(current.run());
    assert.equal(current.events.filter((event) => event === "dispatch").length, 2);
  }
});
void test("flat reader refuses initial quarantine, profile drift and changed baseline before dispatch", async () => {
  for (const options of [{ quarantine: 1 }, { profileFail: 1 }, { checkpointFail: 1 }]) {
    const current = fixture(options); await assert.rejects(current.run()); assert.equal(current.events.includes("dispatch"), false);
  }
});
void test("flat reader binds checkpoint verification to its retained complete receipt before dispatch", async () => {
  for (const checkpointProofOverride of [
    { sourceMatchesReceipt: false }, { checkpointMatchesReceipt: false }, { sourceEqualsCheckpoint: false },
    { receiptPath: "/tmp/substituted.receipt.json" }, { source: "/tmp/substituted.eprj2" }, { checkpoint: "/tmp/substituted-checkpoint.eprj2" },
    { checkpointSha256: "c".repeat(64) }, { checkpointDumpSha256: "c".repeat(64) },
  ]) {
    const current = fixture({ checkpointProofOverride });
    await assert.rejects(current.run(), /unchanged complete checkpoint/u);
    assert.equal(current.events.includes("dispatch"), false);
  }
});
void test("flat reader refuses a substituted successful final checkpoint after both captures", async () => {
  const current = fixture({ checkpointProofOverride: { checkpointSha256: "c".repeat(64) }, checkpointProofOverrideAt: 6 });
  await assert.rejects(current.run(), /unchanged complete checkpoint/u);
  assert.equal(current.events.filter((event) => event === "dispatch").length, 2);
});
void test("flat request cannot supply scope, code or checkpoint and cannot reuse historical topology dispatch", () => {
  assert.deepEqual(validateExactReadRequest({ kind: "schematic-flat-topology" }, context), { kind: "schematic-flat-topology" });
  for (const addition of [{ scope: {} }, { code: "caller()" }, { receiptPath: "/tmp/forged" }]) {
    assert.throws(() => validateExactReadRequest({ kind: "schematic-flat-topology", ...addition }, context));
  }
  assert.throws(() => buildExactReadExpression({ kind: "schematic-flat-topology" }), /checkpoint-bound/u);
  assert.throws(() => validateExactReadRequest({ kind: "schematic-topology" }, context), /disabled/u);
});

void test("internal flat observer retains exact raw capture, checkpoint history and checked native owner/branch", async () => {
  const current = fixture(), result = await current.observe();
  assert.equal(result.projectBinding.projectUuid, projectUuid); assert.equal(result.projectBinding.ownerUuid, "c".repeat(32));
  assert.equal(result.projectBinding.branchUuid, "d".repeat(32)); assert.deepEqual(result.observation.scope.pageIds, ["page"]);
  assert.equal(result.checkpoint.checkpointSha256, result.history.checkpointSha256);
  assert.equal(current.events.filter((event) => event === "project-read").length, 4);
  assert.equal(current.events.filter((event) => event === "dispatch").length, 2);
});
void test("internal flat observer refuses owner drift at all native project boundaries without another observation", async () => {
  for (const projectDriftAt of [1, 2, 3, 4]) {
    const current = fixture({ projectDriftAt }); await assert.rejects(current.observe(), /PROJECT_METADATA/u);
    assert.equal(current.events.filter((event) => event === "project-read").length, projectDriftAt);
    assert.equal(current.events.filter((event) => event === "dispatch").length, Math.ceil(projectDriftAt / 2));
  }
});
void test("flat observation refuses history from a different checkpoint before any native dispatch", async () => {
  for (const mode of ["run", "observe"] as const) {
    const current = fixture({ historyHashDrift: true }); await assert.rejects(current[mode](), /checkpoint identity/u);
    assert.equal(current.events.includes("dispatch"), false);
  }
});
void test("public flat diagnostic still exposes no raw history, authority binding or transaction admission", async () => {
  const current = fixture(), result = await current.run();
  for (const key of ["history", "projectBinding", "observation", "checkpoint", "binding"]) { assert.equal(Object.hasOwn(result, key), false); }
  assert.equal(result["transactionTopology"], false); assert.equal(result["currentGenerationLiveValidated"], false);
  assert.equal(current.events.includes("project-read"), false);
});
