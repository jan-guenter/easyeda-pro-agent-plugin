/** Fixed PCB217199c8 startup markers. This leaf does not discover a timer or
 * infer its absence: k3e retains no public timer field. An original opening
 * owner must separately establish which startup branch actually ran. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** On freshly acquired original Save-handler scope. Own descriptor reads only,
 * throwOnSideEffect:true, awaitPromise:false. No native constructor or method. */
export const CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION = `function(originalCallback){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),ec=own(scope,"x");if(typeof ec!=="function")bad();
const env=object(own(ec,"env"));if(Object.getPrototypeOf(env)!==own(ec,"prototype")||own(env,"_doctype")!==3)bad();
const documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),startup=plain(own(scope,"tl"));
const expected=["useWebgl","multiThreadingOnOpen","rebuildingRatlineInWorker","needFlushService","modelIsBuilt","controllerIsBuilt","engineHighlightReady"];
const actual=keys(startup);if(actual.length!==expected.length||expected.some(k=>!actual.includes(k)))bad();
const state={schema:"easyeda-pro-control.pcb-string-startup-state.v1",documentUuid,
useWebgl:flag(own(startup,"useWebgl")),multiThreadingOnOpen:flag(own(startup,"multiThreadingOnOpen")),
rebuildingRatlineInWorker:flag(own(startup,"rebuildingRatlineInWorker")),needFlushService:flag(own(startup,"needFlushService")),
modelIsBuilt:flag(own(startup,"modelIsBuilt")),controllerIsBuilt:flag(own(startup,"controllerIsBuilt")),engineHighlightReady:flag(own(startup,"engineHighlightReady"))};
verify();const after=keys(startup);if(after.length!==actual.length||after.some((k,i)=>k!==actual[i]))bad();
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();return JSON.stringify(state);
}`;
export const CURRENT_PCB_STRING_STARTUP_STATE_SHA256 = createHash("sha256").update(CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION).digest("hex");
const schema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-startup-state.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u), useWebgl: z.boolean(), multiThreadingOnOpen: z.boolean(),
  rebuildingRatlineInWorker: z.boolean(), needFlushService: z.boolean(), modelIsBuilt: z.boolean(), controllerIsBuilt: z.boolean(),
  engineHighlightReady: z.boolean() }).strict();
export function decodeCurrentPcbStringStartupState(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof schema>> {
  return decodeCurrentPcbStringObservation(input, schema);
}

/** This source-backed route classification deliberately has no caller booleans
 * for original startup/channel proof. Those are absent, not user assertions.
 * A branch ending in `compatible` is a necessary scalar relation only. */
export function inspectCurrentPcbStringStartupRoute(input: unknown): Readonly<{
  schema: "easyeda-pro-control.pcb-string-startup-route.v1";
  state: ReturnType<typeof decodeCurrentPcbStringStartupState>;
  route: "model-not-built" | "startup-ratline-pending" | "single-result-terminal-compatible" | "no-startup-worker-compatible";
  requiredOriginalEvidence: readonly string[];
  startupCallbackCompletionVerified: false;
  writeDestinationsContained: false;
  executionAuthorized: false;
}> {
  const state = decodeCurrentPcbStringStartupState(input);
  let route: "model-not-built" | "startup-ratline-pending" | "single-result-terminal-compatible" | "no-startup-worker-compatible";
  if (!state.modelIsBuilt || !state.controllerIsBuilt) { route = "model-not-built"; }
  else if (state.rebuildingRatlineInWorker) { route = "startup-ratline-pending"; }
  else { route = state.multiThreadingOnOpen ? "single-result-terminal-compatible" : "no-startup-worker-compatible"; }
  const common = ["original completed initialization and its exact preview/docType/unActive inputs",
    "source-qualified native message bridge and exclusion of foreign publishers",
    "post-opening complete empty-root and worker registries",
    "later original-parent context and source reproof"];
  let selected: string[];
  if (route === "single-result-terminal-compatible") { selected = [
    "original startup ratline-worker source/context and one rebuildRatlineInWorker request",
    "its sole ratlineResultFromWorker publication with exact worker identity and empty ratlineRes",
    "ARt terminal dynamic-copper owner openPcb=true with no worker/bus/timer and no deferred flush",
  ]; } else if (route === "no-startup-worker-compatible") { selected = [
    "original initialization predicate Oe=false, not merely its default/current tl value",
    "absence of every other ratlineResultFromWorker publisher in the original native channel",
  ]; } else { selected = ["finish the original startup phase without retrying opening or manufacturing empty state"]; }
  return freezeDeep({ schema: "easyeda-pro-control.pcb-string-startup-route.v1", state, route,
    requiredOriginalEvidence: [...common, ...selected], startupCallbackCompletionVerified: false,
    writeDestinationsContained: false, executionAuthorized: false });
}
