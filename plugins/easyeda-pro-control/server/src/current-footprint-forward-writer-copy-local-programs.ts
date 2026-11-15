/** Fixed copy-local proofs retain the two original strings and default true
 * parseFull argument. Historical Via Save programs remain byte-exact. */
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_PROGRAMS as PREVIOUS } from "./current-pcb-via-local-upload-programs.ts";

const oldLocal = 'const local=(a,b)=>{array(a,4);const p=body(b),t=own(a,"1");array(t,1);if(own(a,"0")!==p||own(t,"0")!==own(b,"5")||own(a,"2")!==false||own(a,"3")!==undefined)bad();return p;};';
// oxlint-disable-next-line unicorn/prefer-string-raw -- Keep the escaped separator in this exact replacement visible beside the fixed historical source matcher.
const copyLocal = 'const local=(a,b)=>{array(a,4);const p=body(b),t=own(a,"1");array(t,2);if(own(a,"0")!==p||t!==own(b,"1")||own(t,"0")!==own(b,"3")||own(t,"1")!==own(b,"4")||own(a,"2")!==true||own(a,"3")!==undefined||own(b,"3")+"|\\n"+own(b,"4")!==own(b,"5"))bad();return p;};';
function qualify(program: string): string {
  if (program.split(oldLocal).length !== 2) { throw new Error("FORWARD_COPY_LOCAL_FIXED_SOURCE"); }
  return program.replace(oldLocal, copyLocal);
}
const start = "function(originalBody){"; const end = "local(this,originalBody);verify();return true;}";
const qualified = qualify(PREVIOUS.localIngress);
if (!qualified.startsWith(start) || !qualified.endsWith(end)) { throw new Error("FORWARD_COPY_LOCAL_CAPTURE_SOURCE"); }
const guards = qualified.slice(start.length, -end.length);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_CAPTURE = `function(originalProject,expectedBody){${guards}
array(this,4);const p=own(this,"0"),t=own(this,"1");array(t,2);
if(p!==originalProject||own(globalThis,"PROJECT")!==p||own(this,"2")!==true||own(this,"3")!==undefined||typeof expectedBody!=="string"||expectedBody.length<1||expectedBody.length>16384)bad();
const first=own(t,"0"),second=own(t,"1");if(typeof first!=="string"||typeof second!=="string"||first+"|\\n"+second!==expectedBody)bad();
const result=[p,t,own(p,"consistencyManager"),first,second,expectedBody];verify();return result;}`;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_PROGRAMS = Object.freeze({
  localIngress: qualified,
  headEntry: PREVIOUS.headEntry, headPromise: PREVIOUS.headPromise, headSuccess: PREVIOUS.headSuccess,
  bufferIngress: qualify(PREVIOUS.bufferIngress), bufferScheduled: qualify(PREVIOUS.bufferScheduled), localReturned: qualify(PREVIOUS.localReturned),
});
