/** Lossless fixed snippet storage for the new original Via/SCH observers.
 * No input program, decoder bound, source profile or runtime message changes. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_PROJECT_CANVAS_PENDING_CAPTURE } from "./current-project-canvas-pending-programs.ts";
import { CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS } from "./current-pcb-via-save-programs.ts";

const marker=Object.freeze({pending:"__current209_pending_capture_part__",via:"__current209_via_retained_part__",schematic:"__current209_schematic_retained_part__"});
const quote=(value:string):string=>`@"${value.replaceAll('"','""')}"`;
const encoded=(text:string):string=>JSON.stringify(text).slice(1,-1);
const pending=encoded(CURRENT_PROJECT_CANVAS_PENDING_CAPTURE);
const via=encoded(CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS);
const schematic=encoded(CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS.replaceAll("PCB_VIA_SAVE_RELATION","SCHEMATIC_DISPLAY_SAVE_RELATION").replaceAll('own(project,"pcb")','own(project,"sheet")'));
function replaceOnce(text:string,part:string,replacement:string):string{if(!text.includes(part)){return text;}if(text.split(part).length!==2){throw new Error("CURRENT209_PENDING_PART_ALIAS");}return text.replace(part,replacement);}
export function currentProjectCanvasPendingNativeTemplate(input:string):string{if(Object.values(marker).some(value=>input.includes(value))){throw new Error("CURRENT209_PENDING_PART_INPUT");}return replaceOnce(replaceOnce(replaceOnce(input,via,marker.via),schematic,marker.schematic),pending,marker.pending);}
/** Inert build-time parity check, independent of native field substitution. */
export function expandCurrentProjectCanvasPendingNativeTemplate(input:string):string{const text=input.replaceAll(marker.via,via).replaceAll(marker.schematic,schematic).replaceAll(marker.pending,pending);if(Object.values(marker).some(value=>text.includes(value))){throw new Error("CURRENT209_PENDING_PART_REMAINDER");}return text;}
export function currentProjectCanvasPendingNativeSource():string{const parts=[pending,replaceOnce(via,pending,marker.pending),replaceOnce(schematic,pending,marker.pending)];if(parts.some(text=>text.includes("\0")||text.includes("\t"))){throw new Error("CURRENT209_PENDING_PART_SEPARATOR");}const bytes=Buffer.from(parts.join("\0"));if(bytes.length>65_536){throw new Error("CURRENT209_PENDING_PART_BOUND");}
// oxlint-disable-next-line node/no-sync -- Fixed build-time strings only, with both hashes under the existing64KiB program decoder.
const packed=gzipSync(bytes,{level:9});return`internal static class EasyedaCurrent209PendingPrograms {
static readonly string[][] Parts=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(createHash("sha256").update(bytes).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))},3,1);
internal static string Expand(string input){if(input==null)throw new System.InvalidOperationException("current209-pending-part-input");string text=input.Replace("${marker.via}",Parts[1][0]).Replace("${marker.schematic}",Parts[2][0]).Replace("${marker.pending}",Parts[0][0]);if(text.Contains("${marker.pending}")||text.Contains("${marker.via}")||text.Contains("${marker.schematic}"))throw new System.InvalidOperationException("current209-pending-part-remainder");return text;}
}`;}
