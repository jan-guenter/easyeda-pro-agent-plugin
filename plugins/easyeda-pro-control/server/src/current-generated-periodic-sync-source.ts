/** Initial-head periodic continuation. Full original source and actual function
 * metadata remain separate requirements from the immutable branch candidate. */
import { CURRENT_GENERATED_INITIAL_BRANCH_SOURCE as BRANCH } from "./current-generated-initial-branch-source.ts";
import { qualifyCurrentGeneratedInitialSyncSource } from "./current-generated-initial-sync-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_PERIODIC_SYNC_CALLEES = freezeDeep([
  { ...BRANCH.getLastHistoryUuid, name: "getLastHistoryUuid", arity: 1, async: true, regular: false, lineNumber: 110, columnNumber: 6044 },
  { ...BRANCH.checkProject, name: "checkProject", arity: 0, async: false, regular: false, lineNumber: 110, columnNumber: 112_807 },
]);
export const CURRENT_GENERATED_PERIODIC_SYNC_CALLER = Object.freeze({ lineNumber: 110, columnNumber: 112_915, functionLineNumber: 110, functionColumnNumber: 112_879, expression: "[this]", length: 1 });
export const CURRENT_GENERATED_PERIODIC_SYNC_LAST_SITE = Object.freeze({ functionLineNumber: 110, functionColumnNumber: 17_658, lineNumber: 110, columnNumber: 17_953, offset: 2_032_163, expression: "[this,t,s,r,i,g]", length: 6 });
export function qualifyCurrentGeneratedPeriodicSyncSource(source: string): void {
  qualifyCurrentGeneratedInitialSyncSource(source);
  for (const row of CURRENT_GENERATED_PERIODIC_SYNC_CALLEES) { if (source.slice(row.start, row.end) !== row.source) { throw new Error("PERIODIC_SYNC_SOURCE"); } }
  if (source.slice(2_032_158, 2_032_178) !== "if(g.success===!1)th" || source.slice(2_127_089, 2_127_194) !== "()=>{this.updateProjectInNet(),this.syncCloud().catch(()=>{}),this.projectTimer=null,this.checkProject()}") { throw new Error("PERIODIC_SYNC_SOURCE_SITE"); }
}
