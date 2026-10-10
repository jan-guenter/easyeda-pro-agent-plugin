import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildProjectUploadBarrierExpression, validateProjectUploadBarrierResult } from "../src/project-upload-barrier.ts";
import { extractToolPayload } from "../src/core.ts";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";

void test("native project barrier awaits the existing queue and refuses drift without save or retry", async () => {
  const uuid = "a".repeat(64);
  let calls = 0, queuedWriteDone = false;
  const host = { currentProject: { projectId: uuid }, messageBus: { rpcCall: async (topic: string, args: unknown): Promise<unknown> => {
    calls += 1;
    assert.equal(topic, "/PrjDB/project/awaitUploadEnd");
    assert.deepEqual(structuredClone(args), [uuid]);
    await Promise.resolve(); queuedWriteDone = true;
    return { message: { success: true } };
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: host.currentProject.projectId }) } };
  const result: unknown = await runInNewContext(buildProjectUploadBarrierExpression(uuid), { gVars: host, eda });
  assert.equal(queuedWriteDone, true);
  assert.deepEqual(structuredClone(result), { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: uuid, scheduledWritesSettled: true, savedEditorChanges: false });
  host.currentProject.projectId = "b".repeat(64);
  await assert.rejects(async () => { await runInNewContext(buildProjectUploadBarrierExpression(uuid), { gVars: host, eda }); }, /PROJECT_UPLOAD_SCOPE_DRIFT/u);
  assert.equal(calls, 1);
  const receipt = validateProjectUploadBarrierResult(result, uuid);
  assert.deepEqual(receipt, structuredClone(result));
  assert.throws(() => validateProjectUploadBarrierResult({ ...receipt, savedEditorChanges: true }, uuid), /invalid receipt/u);
  assert.throws(() => validateProjectUploadBarrierResult(result, "b".repeat(64)), /invalid receipt/u);
  assert.throws(() => buildProjectUploadBarrierExpression("not-a-native-project"), /exact native project UUID/u);
});

void test("all four fixed barrier failures reach the operator with bounded stage diagnostics and no retry", async () => {
  const uuid = "a".repeat(64);
  for (const [failure, stage, code, expectedRpcCalls] of [
    ["ambiguous-host", "HOST", "DEVICE_NATIVE_HOST_AMBIGUOUS", 0],
    ["missing-bus", "HOST", "DEVICE_NATIVE_BUS_MISSING", 0],
    ["initial-drift", "INITIAL_PROJECT", "PROJECT_UPLOAD_SCOPE_DRIFT", 0],
    ["refused", "ACKNOWLEDGMENT", "PROJECT_UPLOAD_BARRIER_REFUSED", 1],
    ["final-drift", "FINAL_PROJECT", "PROJECT_UPLOAD_SCOPE_DRIFT", 1],
  ] as const) {
    let navigationCalls = 0, rpcCalls = 0, saveCalls = 0;
    const host = { currentProject: { projectId: failure === "initial-drift" ? "b".repeat(64) : uuid },
      messageBus: failure === "missing-bus" ? undefined : { rpcCall: (topic: string): Promise<unknown> => {
        rpcCalls += 1;
        assert.equal(topic, "/PrjDB/project/awaitUploadEnd");
        if (failure === "final-drift") { host.currentProject.projectId = "b".repeat(64); }
        return Promise.resolve({ message: { success: failure !== "refused" } });
      } } };
    const eda = {
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: host.currentProject.projectId }) },
      pcb_Document: { save: (): Promise<boolean> => { saveCalls += 1; return Promise.resolve(true); } },
      sch_Document: { save: (): Promise<boolean> => { saveCalls += 1; return Promise.resolve(true); } },
      dmt_EditorControl: { openDocument: (): Promise<boolean> => { navigationCalls += 1; return Promise.resolve(true); },
        closeDocument: (): Promise<boolean> => { navigationCalls += 1; return Promise.resolve(true); } },
    };
    const result: unknown = runInNewContext(buildProjectUploadBarrierExpression(uuid), { gVars: host, eda,
      top: { gVars: failure === "ambiguous-host" ? { ...host } : host } });
    const message = `Project upload barrier refused: ${stage}:${code}`;
    const category = `native-project-upload-barrier:${stage}:${code}`;
    await assert.rejects(Promise.resolve(result), (error: unknown): boolean => {
      assert.ok(error !== null && typeof error === "object" && "message" in error);
      assert.equal(error.message, message);
      assert.equal(nativeFailureCategory(error.message), category);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: { message: error.message } } }),
        { message: `The upstream EasyEDA tool reported failure [${category}].` });
      return true;
    });
    assert.equal(rpcCalls, expectedRpcCalls);
    assert.equal(saveCalls, 0);
    assert.equal(navigationCalls, 0);
  }
});

void test("unknown native failures and hostile error messages remain private without invoking accessors", async () => {
  const uuid = "a".repeat(64);
  const privateText = "PRIVATE NATIVE DETAIL /private/path/project-name";
  let accessorReads = 0;
  const accessorError = Object.defineProperty({}, "message", { get: (): string => { accessorReads += 1; return privateText; } });
  const descriptorError = new Proxy({}, { getOwnPropertyDescriptor: (): never => { throw new Error(privateText); } });
  for (const failure of [new Error(privateText), new Error("PROJECT_UPLOAD_SCOPE_DRIFT private suffix"), accessorError, descriptorError,
    Object.create({ message: "PROJECT_UPLOAD_BARRIER_REFUSED" }) as unknown, null, privateText]) {
    let rpcCalls = 0;
    const host = { currentProject: { projectId: uuid }, messageBus: { rpcCall: (): Promise<never> => {
      rpcCalls += 1;
      // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Adversarial native boundaries can reject non-Errors and hostile objects; prove those values are sanitized without reading accessors.
      return Promise.reject(failure);
    } } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid }) } };
    const result: unknown = runInNewContext(buildProjectUploadBarrierExpression(uuid), { gVars: host, eda });
    await assert.rejects(Promise.resolve(result), (error: unknown): boolean => {
      assert.ok(error !== null && typeof error === "object" && "message" in error);
      assert.equal(error.message, "Project upload barrier refused: UPLOAD:EXCEPTION");
      assert.equal(nativeFailureCategory(error.message), "native-project-upload-barrier:UPLOAD:EXCEPTION");
      assert.ok(!error.message.includes(privateText));
      return true;
    });
    assert.equal(rpcCalls, 1);
  }
  assert.equal(accessorReads, 0);
});
