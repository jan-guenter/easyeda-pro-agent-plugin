/** Fixed209 Start Page contract for the separately admitted saved generation.
 * The original206 observer remains unchanged. Native owner, UI source and
 * pre-open lifetime admission remain the saved generation's responsibilities. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-worker-bootstrap-source.ts";
import { buildCurrentStartPageGuard } from "./current-start-page.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_PROFILE = freezeDeep({
  application: "3.2.209.8a704eab", ui: CURRENT_PCB_209_OPENING_SCRIPTS.ui,
  legacyGuard: { bytes: 7419, sha256: "1e2f4366589c3187456dcd3e409688418bf8bebb7a8e1612d2617bdc19a24f2b" },
  savedGuard: { bytes: 7419, sha256: "849161c1c19a4fe99b351dfbf0cc4dc701795e62596e0a7479c7fa93bbafbf97" },
  // Review evidence supplements the shared209 opener's tab/container model.
  // Spans use zero-based UTF16 indices with an exclusive end. The original
  // Owner still qualifies the complete current UI and bootstrap sources.
  sourceEvidence: {
    ui: {
      restoredTabs: { start: 15_090_670, end: 15_090_701, bytes: 31,
        sha256: "9f40dbe4b03bf892a4337c3c9b896696f212da95099c1f022b77b1a06ddae922" },
      projectOpenCompleted: { start: 15_091_207, end: 15_091_243, bytes: 36,
        sha256: "eba16ee24620356d27ed5cf20a56c501c0e9abb542d9fd961559a29b254bcf75" },
      otherOpenCompleted: { start: 15_091_792, end: 15_091_853, bytes: 61,
        sha256: "053ea73a510b14405dddb7a3313e0b8915bfa81fc84bde926e80818c3363da75" },
      defaultUrlCommand: { start: 8_097_359, end: 8_097_370, bytes: 11,
        sha256: "a6b893299b975fa65a95c29dd3a2b71d4a56db554b01a8c5b0e47419cee6ca2d" },
    },
    backend: CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.backend,
    pageVersion: { start: 2_579_337, end: 2_579_372, bytes: 35,
      sha256: "9c4f1da232642504b3e04137f47b1e880160c8fd6d2cb32593b3303648c43186" },
    version: CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.version,
  },
  sourceReviewOnly: true, nativeCacheMatchQualified: false, executionAuthorized: false,
} as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_SAVED_START_PAGE_TEMPLATE"); } }
function exact(text: string, profile: Readonly<{ bytes: number; sha256: string }>): void {
  need(Buffer.byteLength(text) === profile.bytes && createHash("sha256").update(text).digest("hex") === profile.sha256);
}
const legacy = buildCurrentStartPageGuard(); exact(legacy, CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_PROFILE.legacyGuard);
const parts = legacy.split("version!=='3.2.206'"); need(parts.length === 2);
// The209 UI retains the reviewed Start Page/tab restoration fields. Its
// Original owner qualifies UI3515d4c2 before this fixed cache observer runs.
export const CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_GUARD = parts.join("version!=='3.2.209'");
exact(CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_GUARD, CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_PROFILE.savedGuard);
