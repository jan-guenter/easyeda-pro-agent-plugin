/** Synchronous identity reproof from the maintained opening observer. It
 * performs no RPC while the selected main SQL entry may be held paused. */
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION as OPENING } from "./current-pcb-diagnostic-pcb-opening.ts";

function between(source: string, start: string, stop: string): string {
  const first = source.indexOf(start), last = source.indexOf(stop, first);
  if (first === -1 || last <= first || source.includes(start, first + start.length)) { throw new Error("PCB_VIA_TARGET_SOURCE_DRIFT"); }
  return source.slice(first, last);
}
const prefix = between(OPENING, "const root=globalThis,apply=Reflect.apply;", "const registration=async required=>{");
const frame = between(OPENING, "const before=sample(true),frame=before.frame,child=frame?.contentWindow", "for(let i=0;i<2;i++){frameCheck();");
/** Initial invocation retains every original object/function identity. The
 * returned closure reruns the exact opening frame/target descriptor checks.
 * No pending request is detached and no async request is started by reproof. */
export const CURRENT_PCB_VIA_WRITE_TARGET_CAPTURE = `function(target){
"use strict";
let clear,windowTabId;
const expired=false,phase="observe",bad=()=>{throw new Error("PCB209_VIA_TARGET_REFUSED");};
${prefix}
${frame}
frameCheck();return frameCheck;
}`;
