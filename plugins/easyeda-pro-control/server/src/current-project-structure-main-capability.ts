/** The dedicated native factory is the sole capability issuer. Comparison
 * plans and source qualification cannot recreate this original main owner. */
export interface CurrentProjectStructureMainCapability { readonly profile: "private.current-project-structure-main-capability.v1" }
/* oxlint-disable import/no-cycle -- Resolve the genuine factory's private registry after construction. No module initializer issues authority or calls a native method. */
export { currentProjectStructureMainGenerationExited, isCurrentProjectStructureMainCapability,
  requireCurrentProjectStructureMainCapability, requireCurrentProjectStructureMainCleanup,
  sendCurrentProjectStructureMainCommand } from "./current-pcb-diagnostic-owner.ts";
/* oxlint-enable import/no-cycle */
