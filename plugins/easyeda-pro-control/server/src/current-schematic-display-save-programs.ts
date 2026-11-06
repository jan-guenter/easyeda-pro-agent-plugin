/** Distinct SCH_PAGE/TEXT joins over the actual shared saveCanvas source.
 * Reuses fixed inert syntax only; no Via plan, origin or native lease moves. */
import { CURRENT_PCB_VIA_SAVE_CALLS as BASE } from "./current-pcb-via-save-programs.ts";
import { CURRENT_PROJECT_CANVAS_PENDING_CAPTURE as PENDING } from "./current-project-canvas-pending-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_DISPLAY_SAVE_GROUP = "easyeda-pro-control-schematic-display-save-v1";
function one(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_SAVE_PROGRAM_ANCHOR"); } return source.replace(before, after);
}
function program(role: keyof typeof BASE): string {
  let source = BASE[role].replaceAll("PCB_VIA_SAVE_RELATION", "SCHEMATIC_DISPLAY_SAVE_RELATION").replaceAll('own(project,"pcb")', 'own(project,"sheet")');
  source = one(source, "const selected=", `${PENDING}\nconst selected=`);
  source = one(source, "const retained=original=>", "const retained=(original,phase)=>");
  source = one(source, "return{project,arg,r,snapshot};", 'reprovePending(own(snapshot,"pending"),r,arg,phase);return{project,arg,r,snapshot};');
  source = one(source, "const verify=()=>{", "const verify=()=>{reprovePendingMissing();");
  if (role === "entry") {
    source = one(source, "client:s.client,owner:null", 'client:s.client,pending:capturePending(r,arg,documentUuid,"SCH_PAGE","TEXT"),owner:null');
    source = one(source, "retained(result);", 'retained(result,"entry");');
  } else {
    let phase = "compressed"; if (role === "clock") { phase = "entry"; } else if (role === "compress") { phase = "allocated"; }
    source = one(source, "retained(original)", `retained(original,${JSON.stringify(phase)})`);
  }
  if (role === "value") {
    const start = source.indexOf('const user=own(original,"9");'), stop = source.indexOf('verify();return{documentUuid:', start);
    if (start === -1 || stop < start) { throw new Error("SCHEMATIC_DISPLAY_SAVE_USER_ANCHOR"); }
    source = `${source.slice(0, start)}const user=own(original,"9")||own(own(old.snapshot,"pending"),"priorUser"),userJson=pendingUserJson(user);${source.slice(stop)}`;
    source = one(source, "return{documentUuid:", 'return{schema:"private.generated-schematic-display-save-body-value.v2",documentUuid:');
    source = one(source, "userUndefined:user===undefined,userJson};", 'userUndefined:user===undefined,userJson,pending:pendingValue(own(old.snapshot,"pending"))};');
  }
  return source;
}
export const CURRENT_SCHEMATIC_DISPLAY_SAVE_CALLS = freezeDeep({ entry: program("entry"), clock: program("clock"), compress: program("compress"), body: program("body"), value: program("value"), result: program("result") });
