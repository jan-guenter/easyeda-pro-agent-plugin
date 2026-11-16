/** Distinct natural post-copy branch GET; a pre-Create origin cannot supply it. */
import type { CurrentFootprintForwardWriterBranchBindings } from "./current-footprint-forward-writer-branch-origin.ts";

export interface CurrentFootprintForwardWriterPostBranchOrigin { readonly profile: "private.current-footprint-forward-writer-post-branch-origin.v1" }
export type CurrentFootprintForwardWriterPostBranchBindings = CurrentFootprintForwardWriterBranchBindings;
// oxlint-disable-next-line import/no-cycle -- Only the original Main creates and resolves this registry after actual completion; initialization performs no lookup.
export { requireCurrentFootprintForwardWriterPostBranchOrigin, requireOriginalCurrentFootprintForwardWriterPostBranchData } from "./current-footprint-copy-main-backend-runner.ts";
