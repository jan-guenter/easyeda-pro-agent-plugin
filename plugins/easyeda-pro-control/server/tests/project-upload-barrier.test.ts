import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildProjectUploadBarrierExpression, validateProjectUploadBarrierResult } from "../src/project-upload-barrier.ts";

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
