import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildDeviceCreateExpression, prepareDeviceCreate } from "../src/device-create.ts";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { DEVICE_NATIVE_ASSET_GUARD } from "../src/device-runtime-guard.ts";

const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner",
  branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "b".repeat(64),
  documents: [{ uuid: "symbol", docType: "SYMBOL", metadata: {}, semanticSha256: "c".repeat(64), records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: "Symbol" } }] }] };
const operation = { id: "create", action: "library.device.create", libraryUuid: "project", name: "Fixture", association: { symbol: { uuid: "symbol", libraryUuid: "project" } }, property: { addIntoBom: false, addIntoPcb: false } };
const createdId = "d".repeat(16), plan = prepareDeviceCreate(operation, history);
function fixture(options: { host?: "local" | "outer" | "ambiguous" | "missing"; failRpc?: boolean; badAck?: boolean; badAsset?: boolean } = {}): { run: () => Promise<unknown>; calls: string[] } {
  const calls: string[] = [];
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall(topic: string): Promise<unknown> {
    calls.push(topic);
    if (topic === "/PrjDB/symbol/getData") { return Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, title: "symbol", display_title: options.badAsset === true ? "Other" : "Symbol" } }); }
    if (topic.endsWith("getDataByTitle")) { return Promise.resolve({ message: [] }); }
    if (options.failRpc === true) { throw new Error("PRIVATE NATIVE EXCEPTION /private/path/model-name"); }
    return Promise.resolve({ message: { success: options.badAck !== true, result: { device: { uuid: createdId, project_uuid: "project", owner: { uuid: "owner" }, attributes: plan.expectedMeta["attributes"], display_title: "Fixture" } } } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) },
    lib_Symbol: { get: (): Promise<never> => Promise.reject(new Error("Public symbol getter must not be used for native asset proof.")) } };
  const where = options.host ?? "local";
  let top: { gVars?: typeof host } = {};
  if (where === "outer") { top = { gVars: host }; }
  if (where === "ambiguous") { top = { gVars: { currentProject: { projectId: "other" }, messageBus: host.messageBus } }; }
  const globals = { eda, TextEncoder, ...(where === "local" || where === "ambiguous" ? { gVars: host } : {}),
    top };
  return { calls, run: (): Promise<unknown> => {
    const result: unknown = runInNewContext(buildDeviceCreateExpression(plan), globals);
    return Promise.resolve(result);
  } };
}

void test("current-frame UI gVars works when top is a separate host; legacy unambiguous top remains valid", async () => {
  for (const host of ["local", "outer"] as const) {
    const run = fixture({ host });
    assert.deepEqual(decodeExactReadEnvelope(await run.run()), { kind: "project-device-create", createdId });
    assert.deepEqual(run.calls, ["/PrjDB/symbol/getData", "/PrjDB/device/getDataByTitle", "/PrjDB/device/createData"]);
  }
  for (const host of ["ambiguous", "missing"] as const) {
    const run = fixture({ host });
    await assert.rejects(run.run(), /Device operation refused: create:HOST:DEVICE_NATIVE_/u);
    assert.deepEqual(run.calls, []);
  }
});

void test("asset metadata keeps exact mixed-case titles for both families without SDK document creation", async () => {
  const associations = [{ uuid: "symbol", family: "symbol", name: "0603WAF1002T5E" }, { uuid: "footprint", family: "footprint", name: "R0603" }];
  const immutable = JSON.stringify(associations);
  const calls: unknown[] = [];
  const result: unknown = runInNewContext(`(async()=>{${DEVICE_NATIVE_ASSET_GUARD}return true;})()`, {
    PLAN: { projectUuid: "project", ownerUuid: "owner", associations }, assertProject: (): Promise<void> => Promise.resolve(),
    bus: { rpcCall: (topic: string, args: string[]): Promise<unknown> => {
      calls.push([topic, ...args]);
      const item = associations.find((value) => value.uuid === args[0]);
      assert.ok(item);
      return Promise.resolve({ message: { uuid: item.uuid, project_uuid: "project", owner: { uuid: "owner" }, title: item.name.toLowerCase(), display_title: item.name } });
    } },
  });
  assert.equal(await result, true);
  assert.deepEqual(calls, [["/PrjDB/symbol/getData", "symbol", "project"], ["/PrjDB/footprint/getData", "footprint", "project"]]);
  assert.equal(JSON.stringify(associations), immutable);
});

void test("asset identity, owner, project and display-title differences still fail exactly", async () => {
  for (const patch of [{ uuid: "SYMBOL" }, { project_uuid: "PROJECT" }, { owner: { uuid: "OWNER" } }, { display_title: "mixedcase" }]) {
    const result: unknown = runInNewContext(`(async()=>{${DEVICE_NATIVE_ASSET_GUARD}})()`, {
      PLAN: { projectUuid: "project", ownerUuid: "owner", associations: [{ uuid: "symbol", family: "symbol", name: "MixedCase" }] },
      assertProject: (): Promise<void> => Promise.resolve(), bus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
        uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, title: "mixedcase", display_title: "MixedCase", ...patch,
      } }) },
    });
    await assert.rejects(Promise.resolve(result), /DEVICE_ASSOCIATION_ASSET_DRIFT/u);
  }
});

void test("fixed stage diagnostics distinguish prewrite, RPC and acknowledgment failure without native text", async () => {
  for (const [options, stage, code] of [[{ badAsset: true }, "ASSET_READ", "DEVICE_ASSOCIATION_ASSET_DRIFT"],
    [{ failRpc: true }, "CREATE_RPC", "EXCEPTION"], [{ badAck: true }, "ACKNOWLEDGMENT", "DEVICE_CREATE_ACK_INVALID"]] as const) {
    const run = fixture(options);
    await assert.rejects(run.run(), (error: unknown): boolean => {
      assert.ok(error !== null && typeof error === "object" && "message" in error);
      assert.equal(error.message, `Device operation refused: create:${stage}:${code}`);
      assert.equal(nativeFailureCategory(error.message), `native-device:create:${stage}:${code}`);
      assert.equal(error.message.includes("PRIVATE"), false);
      return true;
    });
    assert.ok(run.calls.filter((entry) => entry.endsWith("createData")).length <= 1);
  }
  for (const message of ["Device operation refused: create:PRIVATE:EXCEPTION", "Device operation refused: create:HOST:EXCEPTION secret", "Device operation refused: caller:HOST:EXCEPTION"]) {
    assert.equal(nativeFailureCategory(message), null);
  }
});
