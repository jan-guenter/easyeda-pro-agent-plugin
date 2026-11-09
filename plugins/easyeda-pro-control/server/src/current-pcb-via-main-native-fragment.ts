/** Via-only main observation admission. Every inspector payload still comes
 * from the immutable existing request codebook; no native resume is admitted. */
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "./current-pcb-via-write-native-profile.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_MAIN_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`PCB_VIA_MAIN_NATIVE_ANCHOR:${before.slice(0, 60)}`); } return source.replace(before, after);
}
const native = `public sealed partial class EasyedaDiagnosticOwner {
public void SendViaMainObservation(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||!viaConstructionComplete||originalMain==null)throw Error("via-main-owner");MainPurpose();AssertLive();if(id!=mainRequest+1||id-stockMainRequests>${String(PROFILE.main.total)}||phase==null||!phase.StartsWith("via-main-",StringComparison.Ordinal))throw Error("via-main-request");string selected=phase.Substring(9);if(selected=="request-driver-arm"||method=="Debugger.resume")throw Error("via-main-observe-only");string text=selected=="construction-require"?EasyedaFootprintCopyMainBackendProtocol.Encode(id,"require",method,fields):EasyedaFootprintCopyMainRequestProtocol.Encode(id,selected,method,fields);mainRequest=id;originalMain.SendFixed(text,selected=="request-remove"||selected=="request-release");AssertLive();}
}
`;
const dispatch = String.raw`        'pcb-via-main-observe' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-via-main-fields'}
          $fields=New-Object Collections.Hashtable
          foreach ($field in $request.PSObject.Properties) {if (@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method') -cnotcontains $field.Name) {$fields.Add($field.Name,$field.Value)}}
          $owner.SendViaMainObservation([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaMainNativeFragment(input: string): string {
  const normalized = input.replace("$PcbViaWrite209 -and @('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin','pcb-via-main-history','pcb-via-main-structure','pcb-via-main-live-history') -ccontains $request.action", "$PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'").replace("$PcbViaWrite209 -and @('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin','pcb-via-main-history','pcb-via-main-structure') -ccontains $request.action", "$PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'").replace("$PcbViaWrite209 -and @('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin','pcb-via-main-history') -ccontains $request.action", "$PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'").replace("$PcbViaWrite209 -and @('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin') -ccontains $request.action", "$PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'").replace("$PcbViaWrite209 -and @('pcb-via-main-observe','pcb-via-main-step') -ccontains $request.action", "$PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'");
  let source = one(normalized, "internal enum EasyedaPcbViaWriteBirth { Original }", `${native}internal enum EasyedaPcbViaWriteBirth { Original }`);
  source = one(source, 'case "pcb-via-sdk":case "pcb-via-sdk-properties":', 'case "pcb-via-sdk":case "pcb-via-sdk-properties":case "pcb-via-main-observe":');
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-clock-bind' {");
  source = one(source, "@('main-request-send','main-completion-send') -ccontains $request.action", "@('main-request-send','main-completion-send') -ccontains $request.action -or $PcbViaWrite209 -and $request.action -ceq 'pcb-via-main-observe'");
  return source;
}
