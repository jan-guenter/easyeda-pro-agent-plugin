/** Only an original before-launch selected-file native birth can issue this
 * reference. Its visible fields cannot recreate transport or file custody. */
export interface CurrentSelectedFileMainSqlFenceBootstrap {
  readonly profile: "private.selected-file-main-sql-fence-bootstrap.v1";
  readonly executionAuthorized: false;
}
// oxlint-disable-next-line import/no-cycle -- Only the original native factory issues/retains this token; its registry is accessed after both classes exist.
export { requireCurrentSelectedFileMainSqlFenceBootstrap, sendCurrentSelectedFileMainSqlFenceCommand, sendOriginalCurrentPcbViaMainCommand } from "./current-pcb-diagnostic-owner.ts";
