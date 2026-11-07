/** Distinct original-request continuation. The observation codebook remains
 * unable to resume. Root owns generated helper and installation pin refresh. */
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "./current-pcb-via-write-native-profile.ts";
import { CURRENT_PCB_VIA_MAIN_STEP_PHASES as PHASES } from "./current-pcb-via-main-step-protocol.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_MAIN_STEP_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("PCB_VIA_MAIN_STEP_NATIVE_ANCHOR"); } return source.replace(before, after);
}
const native = `int viaMainStep;
public void SendViaMainStep(int id,string phase){if(!pcbViaWrite209||viaAbortAttempted||!viaConstructionComplete||originalMain==null||!viaSdkStages[4])throw Error("via-main-step-owner");MainPurpose();AssertLive();string[] sequence={${PHASES.map(phase => `"${phase}"`).join(",")}};if(id!=mainRequest+1||id>${String(PROFILE.main.total)}||viaMainStep>=sequence.Length||phase!=sequence[viaMainStep])throw Error("via-main-step-sequence");string text="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.resume\\",\\"params\\":{}}\\0";viaMainStep++;mainRequest=id;originalMain.SendFixed(text,false);AssertLive();}
`;
const dispatch = String.raw`        'pcb-via-main-step' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -cne 'Debugger.resume' -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,method,phase,requestId,rootCreated,rootPid') {throw 'pcb-diagnostic-via-main-step-fields'}
          $owner.SendViaMainStep([int]$request.requestId,$request.phase);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaMainStepNativeFragment(input: string): string {
  const anchor = "bool pcbViaWrite209,viaAbortAttempted,viaRegistrationRemoved,viaConstructionComplete;", start = input.indexOf("int viaMainStep;"), stop = input.indexOf(anchor);
  let source: string;
  if (start === -1) { source = one(input, anchor, `${native}${anchor}`); }
  else { if (stop <= start || input.includes("int viaMainStep;", start + 1) || !input.slice(start, stop).includes("public void SendViaMainStep(")) { throw new Error("PCB_VIA_MAIN_STEP_NATIVE_EXISTING_BLOCK"); } source = input.slice(0, start) + native + input.slice(stop); }
  source = one(source, 'case "pcb-via-main-observe":', 'case "pcb-via-main-observe":case "pcb-via-main-step":');
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-main-observe' {");
  source = one(source, "$PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'", "$PcbViaWrite209 -and @('pcb-via-main-observe','pcb-via-main-step') -ccontains $request.action");
  return source;
}
