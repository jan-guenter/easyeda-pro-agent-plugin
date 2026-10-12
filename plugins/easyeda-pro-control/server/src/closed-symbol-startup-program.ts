/** Fixed direct-main-frame composite; no caller code or transport fallback. */
import { isRecord } from "./core.ts";
import { buildStartupActorReadExpression, validateStartupActorReadResult } from "./symbol-startup-actor.ts";
import { buildServiceWorkerReadExpression, validateServiceWorkerReadResult } from "./service-worker-read.ts";
import { buildUploadQueueReadExpression, validateUploadQueueReadResult } from "./upload-queue-read.ts";
import { STORAGE_MARKER_DESCRIPTOR, buildStorageMarkerCreateExpression, buildStorageMarkerReadExpression, parseStorageMarkerDescriptor, validateStorageMarkerResult } from "./storage-marker.ts";
import type { StorageMarkerDescriptor } from "./storage-marker.ts";

export type StartupPhase = "baseline-marker-create" | "edit-marker-read" | "verify-marker-read";
type Step = "startup-before" | "sw-before" | "queue-before" | "marker-create" | "marker-read" | "startup-after" | "sw-after" | "queue-after";
export interface StartupInput {
  readonly phase: StartupPhase; readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string;
  readonly marker: Readonly<Record<"namespaceNonce" | "keyNonce" | "bodyNonce", string>>;
}
const PROFILE = "easyeda-pro-control.closed-symbol-startup-observations.v1";
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function fields(input: unknown, keys: readonly string[]): Record<string, unknown> {
  requireValue(isRecord(input) && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) && Reflect.ownKeys(input).length === keys.length,
    "Startup exact object refused.");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    requireValue(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "Startup own data field required.");
    result[key] = descriptor.value as unknown;
  }
  return result;
}
function selected(inputValue: StartupInput): { input: StartupInput; steps: readonly Step[]; descriptor: StorageMarkerDescriptor } {
  const value = fields(inputValue, ["phase", "projectUuid", "branchUuid", "ownerUuid", "marker"]);
  const branchUuid = value["branchUuid"], ownerUuid = value["ownerUuid"], phase = value["phase"], projectUuid = value["projectUuid"];
  requireValue((phase === "baseline-marker-create" || phase === "edit-marker-read" || phase === "verify-marker-read") &&
    typeof projectUuid === "string" && typeof branchUuid === "string" && typeof ownerUuid === "string" &&
    /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid) && /^[a-f0-9]{32}$/u.test(branchUuid) && /^[a-f0-9]{32}$/u.test(ownerUuid),
    "Startup fixed input refused.");
  const marker = fields(value["marker"], ["namespaceNonce", "keyNonce", "bodyNonce"]);
  const descriptor = parseStorageMarkerDescriptor({ profile: STORAGE_MARKER_DESCRIPTOR, ...marker });
  const input: StartupInput = { phase, projectUuid, branchUuid, ownerUuid, marker: { namespaceNonce: descriptor.namespaceNonce, keyNonce: descriptor.keyNonce, bodyNonce: descriptor.bodyNonce } };
  const steps: readonly Step[] = phase === "baseline-marker-create"
    ? ["startup-before", "sw-before", "queue-before", "marker-create", "startup-after", "sw-after", "queue-after"]
    : ["startup-before", "sw-before", "marker-read", "queue-after", "startup-after", "sw-after"];
  return { input, steps, descriptor };
}
function expression(step: Step, input: StartupInput, descriptor: StorageMarkerDescriptor): string {
  if (step.startsWith("startup-")) { return buildStartupActorReadExpression(); }
  if (step.startsWith("sw-")) { return buildServiceWorkerReadExpression(); }
  if (step.startsWith("queue-")) { return buildUploadQueueReadExpression({ projectUuid: input.projectUuid, branchUuid: input.branchUuid }); }
  return step === "marker-create" ? buildStorageMarkerCreateExpression(descriptor) : buildStorageMarkerReadExpression(descriptor);
}

/** All strings executed below are emitted only by the four reviewed builders. */
export function buildStartupProgram(inputValue: StartupInput): string {
  const { input, steps, descriptor } = selected(inputValue);
  const calls = steps.map((step) => `step=${JSON.stringify(step)};
${step === "marker-create" ? "markerCreateAttempted=true;" : ""}
{const observation=await ${expression(step, input, descriptor)};observations.push({step,observation});
${step.startsWith("startup-") ? `const actor=observation.startupActor;
if(actor.uuid!==${JSON.stringify(input.ownerUuid)})throw new Error('OWNER');
if(firstActor===undefined)firstActor={...actor};else if(actor.uuid!==firstActor.uuid||actor.username!==firstActor.username||actor.nickname!==firstActor.nickname)throw new Error('ACTOR_DRIFT');` : ""}}
`).join("");
  return `return await (async()=>{
const observations=[];let step=${JSON.stringify(steps[0])},firstActor,markerCreateAttempted=false;
const result=(ok,failedStep)=>({profile:${JSON.stringify(PROFILE)},phase:${JSON.stringify(input.phase)},ok,failedStep,markerCreateAttempted,observations,executionAuthorized:false,startupQualified:false,completionProved:false});
try{${calls}return result(true,null);}catch{return result(false,step);}
})()`;
}

/** Strict bounded data parser. Even accepted observations grant no authority. */
export function validateStartupResult(inputValue: unknown, input: StartupInput): Readonly<Record<string, unknown>> {
  const { steps, descriptor } = selected(input);
  const value = fields(inputValue, ["profile", "phase", "ok", "failedStep", "markerCreateAttempted", "observations", "executionAuthorized", "startupQualified", "completionProved"]);
  requireValue(value["profile"] === PROFILE && value["phase"] === input.phase &&
    typeof value["ok"] === "boolean" && typeof value["markerCreateAttempted"] === "boolean" &&
    value["executionAuthorized"] === false && value["startupQualified"] === false && value["completionProved"] === false,
    "Startup result shape refused.");
  const failedStep = value["failedStep"], observations = value["observations"];
  requireValue(Array.isArray(observations) && Object.getPrototypeOf(observations) === Array.prototype && observations.length <= steps.length && Reflect.ownKeys(observations).length === observations.length + 1,
    "Startup observation list refused.");
  const failure = (steps as readonly unknown[]).indexOf(failedStep);
  requireValue(value["ok"] ? failedStep === null && observations.length === steps.length :
    failure !== -1 && observations.length >= failure && observations.length <= failure + 1, "Startup observation order refused.");
  const markerIndex = steps.indexOf("marker-create");
  requireValue(value["markerCreateAttempted"] === (markerIndex !== -1 && (value["ok"] || failure >= markerIndex)), "Startup mutation attempt flag refused.");
  let actor: unknown;
  const parsed = steps.slice(0, observations.length).map((_, index) => {
    const step = steps[index];
    const itemDescriptor = Object.getOwnPropertyDescriptor(observations, String(index));
    requireValue(itemDescriptor !== undefined && Object.hasOwn(itemDescriptor, "value"), "Startup observation index refused.");
    const entry = fields(itemDescriptor.value as unknown, ["step", "observation"]);
    requireValue(entry["step"] === step && step !== undefined, "Startup observation entry refused.");
    const observation = entry["observation"];
    let result: Readonly<Record<string, unknown>>;
    if (step.startsWith("startup-")) {
      result = validateStartupActorReadResult(observation);
      if (value["ok"] === true) {
        const current = result["startupActor"]; requireValue(isRecord(current) && current["uuid"] === input.ownerUuid, "Startup actor owner differs.");
        requireValue(actor === undefined || JSON.stringify(actor) === JSON.stringify(current), "Startup actor changed."); actor = current;
      }
    } else if (step.startsWith("sw-")) { result = validateServiceWorkerReadResult(observation); }
    else if (step.startsWith("queue-")) { result = validateUploadQueueReadResult(observation, { projectUuid: input.projectUuid, branchUuid: input.branchUuid }); }
    else { result = validateStorageMarkerResult(observation, descriptor, step === "marker-create" ? "created-and-readback" : "observed-present"); }
    return Object.freeze({ step, observation: result });
  });
  return Object.freeze({ ...value, observations: Object.freeze(parsed) });
}
