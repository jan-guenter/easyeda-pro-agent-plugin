/** Fixed original Via session action. Old source/read purposes cannot select
 * its capture, cancellation or native completion latch. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentProjectSyncQuiesceTemplates } from "./current-project-sync-quiesce-wire.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL PROJECT SYNC QUIESCE",end="// END ORIGINAL PROJECT SYNC QUIESCE";
const quote=(text:string):string=>`@"${text.replaceAll('"','""')}"`;const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
function native():string {
  const rows=currentProjectSyncQuiesceTemplates();const text=rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0");const bytes=Buffer.from(text);if(bytes.length>65_536){throw new Error("SYNC_QUIESCE_TABLE_BOUND");}
  // oxlint-disable-next-line node/no-sync -- Immutable build-time bytes use only the unchanged bounded fixed-table decoder.
  const packed=gzipSync(bytes,{level:9});const hashes=rows.map(row=>{const expanded=row.template.replaceAll(/"__sync_quiesce_[A-Za-z\d]+__"/gu,JSON.stringify("original_ref"));const message=`{"id":79,${expanded.slice(1,-1)},"sessionId":"worker"}\0`;return hash(Buffer.from(message));});
  return `public static class EasyedaProjectSyncQuiesceProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("sync-quiesce-wire");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},28,4);
static string Handle(object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Phase(int index){Need(index>=0&&index<Rows.Length);return Rows[index][0];}
public static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Handle(session);Handle(context);string[] row=null;foreach(var r in Rows)if(r[0]==phase){Need(row==null);row=r;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);data.Add("boundContext",context);foreach(string name in names){Need(fields.Contains(name));data.Add(name,Handle(fields[name]));}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__sync_quiesce_([A-Za-z0-9]+)__\\"",m=>{string value;Need(data.TryGetValue(m.Groups[1].Value,out value));return EasyedaDiagnosticOwner.ProjectSyncQuiesceQuote(value);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.ProjectSyncQuiesceQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};Need(Rows.Length==28);int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string encoded=Encode(79,"worker","original_ref",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"worker","original_ref",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
string viaSyncQuiesceContext;int viaSyncQuiesceStep;bool viaSyncQuiesceCancelAttempted,viaSyncQuiesceCompleted;
public static string ProjectSyncQuiesceQuote(string text){return JsonString(text);}
public void BindPcbViaSyncQuiesce(string context){if(!pcbViaWrite209||viaAbortAttempted||viaSyncQuiesceContext!=null||viaWorkerSession==null||viaWorkerStage!=6||!viaWorkerSourceRead||viaSdkStages[0]||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("sync-quiesce-original-binding");AssertLive();viaSyncQuiesceContext=context;}
public void SendPcbViaSyncQuiesce(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||viaSyncQuiesceContext==null||viaSyncQuiesceCompleted||viaSdkStages[0]||viaSyncQuiesceStep>=28||phase!=EasyedaProjectSyncQuiesceProtocol.Phase(viaSyncQuiesceStep))throw Error("sync-quiesce-original-sequence");if(viaSyncQuiesceStep<17){if(viaWorkerStage!=6||!viaWorkerSourceRead)throw Error("sync-quiesce-original-source-held");if(phase.StartsWith("sync-quiesce-arm-",StringComparison.Ordinal)&&fields["scriptId"] as string!=viaWorkerProjectScript)throw Error("sync-quiesce-original-script");}else if(viaWorkerStage!=7||!viaStructureBootstrapResumed||!viaProducerModeRequested)throw Error("sync-quiesce-original-construction");string encoded=EasyedaProjectSyncQuiesceProtocol.Encode(id,viaWorkerSession,viaSyncQuiesceContext,phase,method,fields);AssertLive();if(phase=="sync-quiesce-cancel"){if(viaSyncQuiesceCancelAttempted)throw Error("sync-quiesce-cancel-once");viaSyncQuiesceCancelAttempted=true;}viaSyncQuiesceStep++;SendMessage(id,encoded);}
public void CompletePcbViaSyncQuiesce(){if(!pcbViaWrite209||viaAbortAttempted||viaSyncQuiesceCompleted||!viaSyncQuiesceCancelAttempted||viaSyncQuiesceStep!=28)throw Error("sync-quiesce-original-completion");AssertLive();viaSyncQuiesceCompleted=true;}
}
`;
}
const dispatch=String.raw`        'pcb-via-sync-quiesce-bind' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.context -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,context,helperInstance,id,jobId,rootCreated,rootPid'){throw 'sync-quiesce-bind-fields'}
          $owner.BindPcbViaSyncQuiesce($request.context);$result=@{bound=$true}
        }
        'pcb-via-sync-quiesce-complete' {
          if(-not $PcbViaWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'sync-quiesce-complete-fields'}
          $owner.CompletePcbViaSyncQuiesce();$result=@{completed=$true}
        }
        'pcb-via-sync-quiesce' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'sync-quiesce-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'sync-quiesce-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaSyncQuiesce([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentProjectSyncQuiesceNativeFragment(input:string):string {
  let source=input;const before='case "pcb-via-sdk":';const after=`case "pcb-via-sync-quiesce-bind":case "pcb-via-sync-quiesce-complete":case "pcb-via-sync-quiesce":${before}`;
  if(!source.includes(after)){if(source.split(before).length!==2){throw new Error("SYNC_QUIESCE_ACTION_ANCHOR");}source=source.replace(before,after);}
  const sdkBefore='RequireGeneratedFixtureOpening(session,stage=="capture"?fields["uniqueContextId"] as string:viaSdkTuple';
  const sdkAfter=`if((stage=="create"||stage=="save")&&!viaSyncQuiesceCompleted)throw Error("sync-quiesce-before-action");${sdkBefore}`;
  if(!source.includes(sdkAfter)){if(source.split(sdkBefore).length!==2){throw new Error("SYNC_QUIESCE_SDK_ANCHOR");}source=source.replace(sdkBefore,sdkAfter);}
  source=installOwnedNativeDispatch(source,dispatch,"        'pcb-via-local-upload' {");source=installNativeCompileOnlyHook(source,"    [EasyedaProjectSyncQuiesceProtocol]::VerifySmoke()","    [EasyedaPcbViaLocalUploadProtocol]::VerifySmoke()");
  const value=`${begin}\n${native()}\n${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("SYNC_QUIESCE_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}
  const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(anchor).length!==2){throw new Error("SYNC_QUIESCE_NATIVE_ANCHOR");}return source.replace(anchor,`${value}\n${anchor}`);
}
