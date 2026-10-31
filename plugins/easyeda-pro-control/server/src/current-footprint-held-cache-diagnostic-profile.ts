/** Fixed read-only qualification envelope. This purpose owns no copy, saved
 * generation, project-opening, worker or replay authority. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as HELD } from "./current-footprint-saved-cache-held-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS = Object.freeze({ targetSamples: 16, delayMilliseconds: 250 });
const discovery = { browser: 1 + CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS.targetSamples, frames: 6, script: 7, parent: 2, ancillary: 2 } as const;
const discoveryRequests = Object.values(discovery).reduce((total, value) => total + value, 0);
export const CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE = freezeDeep({
  purpose: "footprint-held-cache209", discovery, discoveryRequests,
  normalRequestLimit: discoveryRequests + HELD.normal, cleanupRequestLimit: HELD.cleanup,
  requestLimit: discoveryRequests + HELD.normal + HELD.cleanup,
  maximumRequestBytes: 32_768, maximumHeldReplyFrameBytes: HELD.replyBytes + 256,
  nativeAuthorityIssued: false, copyAuthorized: false, savedGenerationAuthorized: false,
  runtimeAdmissionGranted: false, replayTokenIssued: false, executionAuthorized: false,
} as const);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
export const currentFootprintHeldCacheDiagnosticBindingSchema = z.object({ sessionId: token, uniqueContextId: token,
  projectUuid: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u), branchUuid: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u) }).strict();
export type CurrentFootprintHeldCacheDiagnosticBinding = Readonly<z.infer<typeof currentFootprintHeldCacheDiagnosticBindingSchema>>;
export const CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget",
  "Page.enable", "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"] as const);
