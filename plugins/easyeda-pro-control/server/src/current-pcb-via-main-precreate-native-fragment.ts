/** A separate original pre-create enrollment. No SQL/Save/resume action is
 * admitted by this native receipt; the original planned tails remain fenced. */
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as BEGIN } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as HISTORY } from "./current-pcb-via-main-history-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS as STRUCTURE } from "./current-pcb-via-main-structure-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL VIA PRECREATE MAIN ENROLLMENT", end = "// END ORIGINAL VIA PRECREATE MAIN ENROLLMENT";
const native = `public sealed partial class EasyedaDiagnosticOwner {
bool viaMainPrecreateEnrollmentAttempted,viaMainPrecreateEnrolled;
public void EnrollViaMainPrecreate(){if(!pcbViaWrite209||viaAbortAttempted||viaMainPrecreateEnrollmentAttempted||!viaConstructionComplete||originalMain==null||!viaProducerPrefixEnrolled||!viaSdkStages[0]||!viaSdkStages[1]||viaSdkStages[2]||viaSdkStages[4]||viaWorkerStage!=7||viaBeginArms.Count!=${String(BEGIN.sourceArms)}||viaBeginStep!=0||viaHistoryArms.Count!=${String(HISTORY.sourceArms)}||viaHistoryStep!=0||viaStructureMainArms.Count!=${String(STRUCTURE.arms - 3)}||viaStructureMainStep!=0)throw Error("via-main-precreate-original-enrollment");MainPurpose();AssertLive();viaMainPrecreateEnrollmentAttempted=true;viaMainPrecreateEnrolled=true;AssertLive();}
public static void VerifyViaMainPrecreateSmoke(){foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){try{bool refused=false;try{owner.EnrollViaMainPrecreate();}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaMainPrecreateEnrollmentAttempted||owner.viaMainPrecreateEnrolled)throw Error("via-main-precreate-unissued-smoke");}finally{if(owner.originalMain!=null)owner.originalMain.Release();}}}
}
`;
const dispatch = String.raw`        'pcb-via-main-precreate-enroll' {
          if (-not $PcbViaWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-via-main-precreate-fields'}
          $owner.EnrollViaMainPrecreate();$result=@{enrolled=$true}
        }
`;
function one(source: string, before: string, after: string): string { if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_MAIN_PRECREATE_DUPLICATE"); } return source; } if (source.split(before).length !== 2) { throw new Error("PCB_VIA_MAIN_PRECREATE_ANCHOR"); } return source.replace(before,after); }
export function applyCurrentPcbViaMainPrecreateNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-structure-body-enroll":', 'case "pcb-via-structure-body-enroll":case "pcb-via-main-precreate-enroll":');
  source = one(source, 'if(index==0){viaStructureNativeProject=', 'if(stage=="create"&&!viaMainPrecreateEnrolled)throw Error("via-main-precreate-required");if(index==0){viaStructureNativeProject=');
  source = one(source, '||viaStructureBodyEnrollmentAttempted||!viaConstructionComplete', '||viaStructureBodyEnrollmentAttempted||!viaMainPrecreateEnrolled||!viaConstructionComplete');
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-structure-body-enroll' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyViaMainPrecreateSmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainStructureSmoke()");
  const value = `${begin}\n${native}\n${end}`; const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin,start+begin.length) || source.includes(end,stop+end.length)) { throw new Error("PCB_VIA_MAIN_PRECREATE_MARKERS"); } source=source.slice(0,start)+value+source.slice(stop+end.length); }
  else { source=one(source,"internal enum EasyedaPcbViaWriteBirth { Original }",`${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`); } return source;
}
