/** Historical original startup references only. They cannot issue a native
 * command or establish the current copy/upload frontier. */
// oxlint-disable-next-line import/no-cycle -- Only the original native owner can resolve its private startup records; splitting issuance into an exported setter would weaken that boundary. Initialization performs no lookup or native action.
export { requireOriginalCurrentFootprintForwardWriterStartup } from "./current-pcb-diagnostic-owner.ts";
export type { CurrentFootprintForwardWriterRetainedStartup } from "./current-pcb-diagnostic-owner.ts";
