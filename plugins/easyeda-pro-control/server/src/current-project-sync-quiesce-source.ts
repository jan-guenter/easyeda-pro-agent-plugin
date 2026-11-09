/** Current209 source facts only. The deliberate session action is separately
 * owned and journaled; these constants grant neither cancellation nor Save. */
import { CURRENT_GENERATED_PERIODIC_SYNC_CALLEES, qualifyCurrentGeneratedPeriodicSyncSource } from "./current-generated-periodic-sync-source.ts";

const method=CURRENT_GENERATED_PERIODIC_SYNC_CALLEES[1];if(method===undefined){throw new Error("PROJECT_SYNC_QUIESCE_METHOD_PROFILE");}
export const CURRENT_PROJECT_SYNC_QUIESCE_METHOD=method;
export const CURRENT_PROJECT_SYNC_QUIESCE_CALLER = Object.freeze({lineNumber:110,columnNumber:97_017,functionLineNumber:110,functionColumnNumber:94_422});
export const CURRENT_PROJECT_SYNC_QUIESCE_SITES = Object.freeze({entry:Object.freeze({lineNumber:110,columnNumber:112_810,functionLineNumber:110,functionColumnNumber:112_807,expression:"[this]"}),returned:Object.freeze({lineNumber:110,columnNumber:112_997,functionLineNumber:110,functionColumnNumber:112_807,expression:"[this]"})});
export const CURRENT_PROJECT_SYNC_QUIESCE_ENTRY_CONDITION=String.raw`(()=>{try{const p=Object.getOwnPropertyDescriptor(globalThis,"PROJECT");if(!p||!Object.hasOwn(p,"value")||this!==p.value)return true;const e=Object.getOwnPropertyDescriptor(this,"isEstablished"),t=Object.getOwnPropertyDescriptor(this,"projectTimer");if(!e||!t||!Object.hasOwn(e,"value")||!Object.hasOwn(t,"value"))return true;return e.value!==true&&!(typeof t.value==="number"&&t.value%1===0&&t.value>0&&t.value<=2147483647);}catch{return true;}})()`;
export function qualifyCurrentProjectSyncQuiesceSource(source:string):void {
  qualifyCurrentGeneratedPeriodicSyncSource(source);
  if(source.slice(2_103_371,2_103_461)!=="this._updateData=null;this.isEstablished=!1;this.projectTimer=null;this.publishTimer=null;"||source.slice(2_111_222,2_111_264)!=="this.checkProject(),this.progress.update()") { throw new Error("PROJECT_SYNC_QUIESCE_SOURCE_SITE"); }
}
