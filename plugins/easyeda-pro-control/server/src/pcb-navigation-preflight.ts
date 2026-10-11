import { z } from "zod";
import { PCB_NAVIGATION_PREFERENCE_GUARD } from "./pcb-navigation-preferences.ts";
import type { ExpectedContext } from "./runtime-scripts.ts";

export const PCB_NAVIGATION_PREFLIGHT_PROFILE = "easyeda-pro-control.pcb-navigation-preference-preflight.v1";
const scopeSchema = z.object({ projectUuid: z.string().min(1).max(256), documentUuid: z.string().min(1).max(256),
  documentType: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), tabId: z.string().min(1).max(512),
  metadataOwnerUuid: z.string().min(1).max(256).optional() }).strict().refine((scope) =>
  ![2, 4].includes(scope.documentType) || scope.metadataOwnerUuid !== undefined);

/** Early passive admission prevents a known refusal from consuming an edit or
 * Save intent. It is not a lease. Every final dispatch retains its own guard.
 */
export function buildPcbNavigationPreferencePreflight(context: ExpectedContext): string {
  const scope = scopeSchema.parse({ projectUuid: context.project?.uuid ?? context.project?.projectUuid,
    documentUuid: context.document?.uuid ?? context.document?.documentUuid, documentType: context.document?.documentType,
    tabId: context.document?.tabId, ...(context.document?.parentLibraryUuid === undefined ? {} : { metadataOwnerUuid: context.document.parentLibraryUuid }) });
  return `return await (async()=>{
${PCB_NAVIGATION_PREFERENCE_GUARD}
const scope=${JSON.stringify(scope)};
const project=await eda.dmt_Project.getCurrentProjectInfo();
const document=await eda.dmt_SelectControl.getCurrentDocumentInfo();
if(project?.uuid!==scope.projectUuid||document?.uuid!==scope.documentUuid||document?.documentType!==scope.documentType||document?.tabId!==scope.tabId||scope.metadataOwnerUuid!==undefined&&document?.parentLibraryUuid!==scope.metadataOwnerUuid)throw new Error('PCB_NAVIGATION_PREFLIGHT_CONTEXT');
assertPcbLifecyclePreferences(scope,scope.tabId);
return {profile:${JSON.stringify(PCB_NAVIGATION_PREFLIGHT_PROFILE)},admitted:true};
})();`;
}
