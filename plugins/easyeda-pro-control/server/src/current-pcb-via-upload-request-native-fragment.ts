/** Original first buffered upload on the same Via worker; response/drain remain separate. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { gzipSync } from "node:zlib";
import { currentPcbViaUploadRequestTemplates } from "./current-pcb-via-upload-request-wire.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL VIA UPLOAD REQUEST",end="// END ORIGINAL VIA UPLOAD REQUEST";
const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
const quote=(text:string):string=>`@"${text.replaceAll('"','""')}"`;
function sample(_name:string):string { return "original_ref"; }
function native():string {
  const rows=currentPcbViaUploadRequestTemplates();const text=rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0");const bytes=Buffer.from(text);
  if(bytes.length>65_536) { throw new Error("VIA_UPLOAD_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Only immutable build-time protocol bytes use the existing bounded fixed-table codec.
  const packed=gzipSync(bytes,{level:9});
  const hashes=rows.map(row=>{const expanded=row.template.replaceAll(/"__via_upload_([A-Za-z\d]+)__"/gu,(_match,name:string)=>JSON.stringify(sample(name)));return hash(Buffer.from(`{"id":79,${expanded.slice(1,-1)},"sessionId":"worker"}\0`));});
  return `public static class EasyedaPcbViaUploadRequestProtocol {
static void Need(bool v){if(!v)throw new System.InvalidOperationException("via-upload-wire");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},9,4);
static string Value(string name,object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Phase(int index){Need(index>=0&&index<Rows.Length);return Rows[index][0];}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Value("session",session);string[] row=null;foreach(var r in Rows)if(r[0]==phase){Need(row==null);row=r;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));data.Add(name,Value(name,fields[name]));}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__via_upload_([A-Za-z0-9]+)__\\"",m=>{string value;Need(data.TryGetValue(m.Groups[1].Value,out value));return EasyedaDiagnosticOwner.UploadRequestQuote(value);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.UploadRequestQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){Need(Rows.Length==9);string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string encoded=Encode(79,"worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
int viaUploadRequestStep;
public static string UploadRequestQuote(string text){return JsonString(text);}
public void SendPcbViaUploadRequest(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||!viaSaveGenerationAttempted||!viaSdkStages[4]||!viaStructureTransportBodyReserved||viaWorkerStage!=7||viaWorkerSession==null||!viaSyncQuiesceCompleted||viaLocalUploadStep!=16||!viaStructureTransportPublished||!viaMainPrecreateEnrolled||viaUploadRequestStep>=9||phase!=EasyedaPcbViaUploadRequestProtocol.Phase(viaUploadRequestStep))throw Error("via-upload-original-order");string encoded=EasyedaPcbViaUploadRequestProtocol.Encode(id,viaWorkerSession,phase,method,fields);AssertLive();viaUploadRequestStep++;SendMessage(id,encoded);}
}
`;
}
const dispatch=String.raw`        'pcb-via-upload-request' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'via-upload-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'via-upload-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaUploadRequest([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaUploadRequestNativeFragment(input:string):string {
  let source=input;const action='case "pcb-via-sdk":',expanded=`case "pcb-via-upload-request":${action}`;
  if(!source.includes(expanded)){if(source.split(action).length!==2) { throw new Error("VIA_UPLOAD_ACTION_ANCHOR"); }source=source.replace(action,expanded);}
  source=installOwnedNativeDispatch(source,dispatch,"        'pcb-via-local-upload' {");
  source=installNativeCompileOnlyHook(source,"    [EasyedaPcbViaUploadRequestProtocol]::VerifySmoke()","    [EasyedaPcbViaLocalUploadProtocol]::VerifySmoke()");
  const value=`${begin}\n${native()}\n${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);
  if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)) { throw new Error("VIA_UPLOAD_MARKERS"); }return source.slice(0,start)+value+source.slice(stop+end.length);}
  const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(anchor).length!==2) { throw new Error("VIA_UPLOAD_BODY_ANCHOR"); }return source.replace(anchor,`${value}\n${anchor}`);
}
