import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";

/** Read-only wait for native project-worker writes already queued by a prior
 * save. It neither saves current editor changes nor forces an upload.
 * pro-mgr.js 2045084 -> 1757499; project-worker.js 2019560 -> 2117636.
 */
export function buildProjectUploadBarrierExpression(projectUuid: string): string {
  if (!/^[a-f0-9]{64}$/u.test(projectUuid)) { throw new Error("Upload barrier requires an exact native project UUID."); }
  return `(async()=>{
${DEVICE_NATIVE_HOST_GUARD}
const uuid=${JSON.stringify(projectUuid)};
const assertProject=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();if(host.currentProject?.projectId!==uuid||project?.uuid!==uuid)throw new Error('PROJECT_UPLOAD_SCOPE_DRIFT');};
await assertProject();
const reply=await bus.rpcCall('/PrjDB/project/awaitUploadEnd',[uuid]);
if(reply?.message?.success!==true)throw new Error('PROJECT_UPLOAD_BARRIER_REFUSED');
await assertProject();
return {profile:'easyeda-pro-control.project-upload-barrier.v1',projectUuid:uuid,scheduledWritesSettled:true,savedEditorChanges:false};
})()`;
}

export interface ProjectUploadBarrierReceipt extends Record<string, unknown> {
  profile: "easyeda-pro-control.project-upload-barrier.v1";
  projectUuid: string;
  scheduledWritesSettled: true;
  savedEditorChanges: false;
}

export function validateProjectUploadBarrierResult(value: unknown, projectUuid: string): ProjectUploadBarrierReceipt {
  if (!/^[a-f0-9]{64}$/u.test(projectUuid) || value === null || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== 4 ||
      !("profile" in value) || value.profile !== "easyeda-pro-control.project-upload-barrier.v1" ||
      !("projectUuid" in value) || value.projectUuid !== projectUuid ||
      !("scheduledWritesSettled" in value) || value.scheduledWritesSettled !== true ||
      !("savedEditorChanges" in value) || value.savedEditorChanges !== false) { throw new Error("Native project upload barrier returned an invalid receipt."); }
  return { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid, scheduledWritesSettled: true, savedEditorChanges: false };
}
