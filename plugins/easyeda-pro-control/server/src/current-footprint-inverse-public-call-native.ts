/** Original inverse SDK prefix: one admitted SDK write, then a held original
 * service entry. There is deliberately no handler-resume command. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_PROGRAMS as P } from "./current-footprint-inverse-public-call-programs.ts";
import { currentFootprintInversePublicCallCases, currentFootprintInversePublicCallTemplate, currentFootprintInversePublicCallTemplateHash } from "./current-footprint-inverse-public-call-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
export function currentFootprintInversePublicCallNativeSource(): string {
  const cases = currentFootprintInversePublicCallCases();
  const rows = [
    ...Object.entries({ sdk: P.invoke, proof: P.entry, reprove: P.reprove }).map(([name, program]) => ["program", name, "", JSON.stringify(program)]),
    ...cases.map(command => { const row = currentFootprintInversePublicCallTemplate(command); return [row.key, row.method, row.names.join(","), row.template]; }),
  ];
  const raw = Buffer.from(rows.map(row => row.join("\t")).join("\0")); if (raw.length > 65_536 || rows.length !== 16 || cases.length !== 13) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_TABLE"); }
  // oxlint-disable-next-line node/no-sync -- Bounded immutable build input only.
  const packed = gzipSync(raw, { level: 9 });
  return String.raw`public sealed partial class EasyedaDiagnosticOwner{
static readonly string[][] InversePublicCallRows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},16,4);
bool footprintInversePublicCallBound,footprintInversePublicCallAttempted,footprintInversePublicCallHeld,footprintInversePublicCallCompleted;int footprintInversePublicCallStep,footprintInversePublicCallHelpers;string footprintInversePublicCallScript;
public void BindFootprintInversePublicCall(string script){if(!footprintInverse209||footprintInverseAborted||!footprintInversePublicServiceCompleted||footprintInversePublicServiceStep!=47||footprintInversePublicServiceHelpers!=14||footprintInversePublicCallBound)throw Error("inverse-public-call-bind");AssertLive();AssertFootprintInverseDeleteWorkerAdmission();InversePublicServiceHandle(script);footprintInversePublicCallScript=script;footprintInversePublicCallBound=true;}
public static string FootprintInversePublicCallMessage(int id,string session,string phase,string method,System.Collections.IDictionary fields){return InverseFixedRoleMessage(id,session,phase,method,fields,"inverse-public-call-","inverse_call_","arm,frame,properties",InversePublicCallRows);}
public void SendFootprintInversePublicCall(int id,string phase,string method,System.Collections.IDictionary fields){if(id<1||id>RequestLimit||!footprintInverse209||footprintInverseAborted||!footprintInversePublicCallBound||footprintInversePublicCallCompleted)throw Error("inverse-public-call-purpose");AssertLive();if(phase=="inverse-public-call-helper"){if(++footprintInversePublicCallHelpers>5)throw Error("inverse-public-call-helper-cap");}else{string key=phase.Substring(20);if(key=="arm"||key=="frame"||key=="properties")key+=":"+(fields["role"] as string);string[] order={"arm:entry","arm:returned","sdk","frame:entry","properties:entry","frame:dispatch","properties:dispatch","properties:packet","properties:message","proof","properties:proof","reprove"};if(footprintInversePublicCallStep>=order.Length||order[footprintInversePublicCallStep]!=key)throw Error("inverse-public-call-order");if(footprintInversePublicCallStep<2&&fields["scriptId"] as string!=footprintInversePublicCallScript)throw Error("inverse-public-call-script");if(footprintInversePublicCallStep>=3&&!footprintInversePublicCallHeld)throw Error("inverse-public-call-held");if(key=="sdk"){if(footprintInversePublicCallAttempted||fields["argument1"] as string!=footprintInverseDocument)throw Error("inverse-public-call-sdk-once");AssertFootprintInverseDeleteWorkerAdmission();}footprintInversePublicCallStep++;}string text=FootprintInversePublicCallMessage(id,footprintInverseUiSession,phase,method,fields);if(phase=="inverse-public-call-sdk"){footprintInversePublicCallAttempted=true;ConsumeFootprintInverseDeleteWorkerAdmission();}SendMessage(id,text);}
public void HoldFootprintInversePublicCall(){if(!footprintInverse209||footprintInverseAborted||!footprintInversePublicCallAttempted||footprintInversePublicCallHeld||footprintInversePublicCallStep!=3)throw Error("inverse-public-call-entry");AssertLive();footprintInversePublicCallHeld=true;}
public void CompleteFootprintInversePublicCall(){if(!footprintInverse209||footprintInverseAborted||!footprintInversePublicCallHeld||footprintInversePublicCallCompleted||footprintInversePublicCallStep!=12||footprintInversePublicCallHelpers!=5)throw Error("inverse-public-call-complete");AssertLive();footprintInversePublicCallCompleted=true;}
public static void VerifyFootprintInversePublicCallSmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(cases.map(command => currentFootprintInversePublicCallTemplateHash(command)))};int index=0;foreach(string[] row in InversePublicCallRows){if(row[0]=="program")continue;var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="argument1"&&row[0]=="sdk"||name=="argument5"?new string('a',16):"original_ref");string key=row[0],phase="inverse-public-call-"+key;int at=key.IndexOf(':');if(at>=0){fields.Add("role",key.Substring(at+1));phase="inverse-public-call-"+key.Substring(0,at);}string text=FootprintInversePublicCallMessage(79,"original_ui",phase,row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=hashes[index++])throw Error("inverse-public-call-parity");}if(index!=13)throw Error("inverse-public-call-roster");}
}`;
}
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_DISPATCH = String.raw`        'footprint-inverse-public-call' {
          if(-not $FootprintInverse209 -or -not $launched){throw 'inverse-public-call-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'inverse-public-call-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-public-call-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 1 -or -not $fields.Contains('scriptId')){throw 'inverse-public-call-bind'};$owner.BindFootprintInversePublicCall([string]$fields['scriptId'])}
          elseif($request.phase -ceq 'held' -or $request.phase -ceq 'complete'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'inverse-public-call-control'};if($request.phase -ceq 'held'){$owner.HoldFootprintInversePublicCall()}else{$owner.CompleteFootprintInversePublicCall()}}
          else{$owner.SendFootprintInversePublicCall([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
