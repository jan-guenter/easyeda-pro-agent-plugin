import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";

const DIAGNOSTIC_PREFIX = "Project upload barrier refused: ";
const diagnosticStages = new Set(["HOST", "INITIAL_PROJECT", "UPLOAD", "ACKNOWLEDGMENT", "FINAL_PROJECT"]);
const diagnosticCodes = new Set(["EXCEPTION", "DEVICE_NATIVE_HOST_AMBIGUOUS", "DEVICE_NATIVE_BUS_MISSING", "PROJECT_UPLOAD_SCOPE_DRIFT", "PROJECT_UPLOAD_BARRIER_REFUSED"]);

/** Read-only wait for the native project worker's task1 upload set. It neither
 * Saves editor changes nor forces an upload. It does not drain the structure
 * Timer, later task2 work or task3 sync. Its legacy receipt field is not a
 * Complete project-write settlement witness.
 * pro-mgr.js 2045084 -> 1757499; project-worker.js 2019560 -> 2117636.
 * The diagnostic wrapper preserves every await and guard. It emits only a
 * fixed stage/code pair, never native exception text or project identifiers.
 */
export function buildProjectUploadBarrierExpression(projectUuid: string): string {
  if (!/^[a-f0-9]{64}$/u.test(projectUuid)) { throw new Error("Upload barrier requires an exact native project UUID."); }
  return `(async()=>{let uploadBarrierStage='HOST';try{
${DEVICE_NATIVE_HOST_GUARD}
const uuid=${JSON.stringify(projectUuid)};
const assertProject=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();if(host.currentProject?.projectId!==uuid||project?.uuid!==uuid)throw new Error('PROJECT_UPLOAD_SCOPE_DRIFT');};
uploadBarrierStage='INITIAL_PROJECT';
await assertProject();
uploadBarrierStage='UPLOAD';
const reply=await bus.rpcCall('/PrjDB/project/awaitUploadEnd',[uuid]);
uploadBarrierStage='ACKNOWLEDGMENT';
if(reply?.message?.success!==true)throw new Error('PROJECT_UPLOAD_BARRIER_REFUSED');
uploadBarrierStage='FINAL_PROJECT';
await assertProject();
return {profile:'easyeda-pro-control.project-upload-barrier.v1',projectUuid:uuid,scheduledWritesSettled:true,savedEditorChanges:false};
}catch(error){let code='EXCEPTION';try{
const descriptor=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;
const message=descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;
if(typeof message==='string'&&${JSON.stringify([...diagnosticCodes])}.includes(message))code=message;
}catch(_){}
throw new Error(${JSON.stringify(DIAGNOSTIC_PREFIX)}+uploadBarrierStage+':'+code);}
})()`;
}

/** Admit exact legacy literals and the compiler-owned bounded wrapper only.
 * Bare host codes are generic preflight diagnostics, not proof that they came
 * from this barrier. Dynamic suffixes, foreign stages and raw text stay private.
 */
export function projectUploadBarrierFailureCategory(message: unknown): string | null {
  if (typeof message !== "string" || message.length > 180) { return null; }
  if (message !== "EXCEPTION" && diagnosticCodes.has(message)) { return `native-preflight:${message}`; }
  if (!message.startsWith(DIAGNOSTIC_PREFIX)) { return null; }
  const tokens = message.slice(DIAGNOSTIC_PREFIX.length).split(":");
  const [stage, code] = tokens;
  if (tokens.length !== 2 || stage === undefined || code === undefined || !diagnosticStages.has(stage) || !diagnosticCodes.has(code)) { return null; }
  return `native-project-upload-barrier:${stage}:${code}`;
}

export interface ProjectUploadBarrierReceipt extends Record<string, unknown> {
  profile: "easyeda-pro-control.project-upload-barrier.v1";
  projectUuid: string;
  /** Legacy v1 name: only the native task1 wait was acknowledged. */
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
