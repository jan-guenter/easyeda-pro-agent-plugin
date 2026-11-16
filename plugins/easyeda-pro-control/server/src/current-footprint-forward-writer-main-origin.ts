/** Full-writer origins have their own registry kind; historical v2/Combined
 * resolvers cannot read these genuine original references. */
export interface CurrentFootprintForwardWriterMainRequestOrigin { readonly profile:"private.current-footprint-forward-writer-main-request-origin.v1"; readonly executionAuthorized:false }
export interface CurrentFootprintForwardWriterMainCompletionOrigin { readonly profile:"private.current-footprint-forward-writer-main-completion-origin.v1"; readonly executionAuthorized:false }
// oxlint-disable-next-line import/no-cycle -- These original backend resolvers are invoked only after both modules initialize; data/type reexports issue no owner or authority.
export type { CurrentFootprintForwardMainRequestOriginBindings as CurrentFootprintForwardWriterMainRequestOriginBindings, CurrentFootprintForwardMainCompletionOriginBindings as CurrentFootprintForwardWriterMainCompletionOriginBindings } from "./current-footprint-copy-main-backend-runner.ts";
export { isCurrentFootprintForwardWriterMainRequestOrigin, isCurrentFootprintForwardWriterMainCompletionOrigin, requireCurrentFootprintForwardWriterMainRequestClockOrigin, requireCurrentFootprintForwardWriterMainRequestOrigin, requireCurrentFootprintForwardWriterMainCompletionOrigin } from "./current-footprint-copy-main-backend-runner.ts";
