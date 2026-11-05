/** Private fresh-birth transport limits. No caller cap or existing-owner upgrade. */
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES } from "./current-pcb-209-spatial-source-profile.ts";

export const CURRENT_PCB_SPATIAL_PROFILE = Object.freeze({ purpose: "pcb-spatial209", requestLimit: 384, normalRequestLimit: 383,
  maximumReads: 16, sessionBytes: 64 * 1024 * 1024, requestMilliseconds: 5000, sourceRequestMilliseconds: 30_000 } as const);
/** One complete original opening/discovery path plus the fixed capture graph,
 * its bounded descriptor readers and original release. This is a prospective
 * allocation bound, never a claim that a live path or source graph passed. */
const calleeProperties = CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length;
const spatialStage = 7 + 1 + 1 + calleeProperties + CURRENT_PCB_SPATIAL_PROFILE.maximumReads + 1;
export const CURRENT_PCB_SPATIAL_REQUEST_DERIVATION = Object.freeze({
  originalOpeningSourceAndReproof: 103, capture: 7, functions: 1, tuple: 1, calleeProperties,
  reads: CURRENT_PCB_SPATIAL_PROFILE.maximumReads, release: 1, spatialStage, fullWorkflow: 103 + spatialStage,
  headroom: CURRENT_PCB_SPATIAL_PROFILE.requestLimit - 103 - spatialStage,
} as const);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
/** This local seal records the owner's already admitted original page/source.
 * Parsing supplies neither source qualification nor native ownership. */
export const currentPcbSpatialBindingSchema = z.strictObject({ uniqueContextId: token, scriptId: token });
export type CurrentPcbSpatialBinding = Readonly<z.infer<typeof currentPcbSpatialBindingSchema>>;
export const CURRENT_PCB_SPATIAL_DISCOVERY_METHODS = Object.freeze([
  "Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree", "Runtime.enable",
  "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode",
] as const);
