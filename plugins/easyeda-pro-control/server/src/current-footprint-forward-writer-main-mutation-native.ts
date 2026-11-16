/** Complete-only fixed SQL codebook and physical interleave ledger. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentFootprintForwardWriterMainMutationTemplates } from "./current-footprint-forward-writer-main-mutation-protocol.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_ACTION="footprint-forward-writer-main-sql";
const digest=(value:string|Uint8Array):string=>createHash("sha256").update(value).digest("hex");
export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_SEQUENCE=Object.freeze([
 "frame-read","read","step","frame-read","read","step",
 "frame-run","frame-begin","proof-begin","require","step",
 "frame-read","read","step",
 "frame-run","frame-data","frame-cipher","proof-data","require","step",
 ...["head","branch","commit","project"].flatMap(role=>["frame-run",`frame-${role}`,`proof-${role}`,"require","step"]),
].map(suffix=>`forward-writer-sql-${suffix}`));
export function currentFootprintForwardWriterMainMutationNativeSource():string{
 const rows=currentFootprintForwardWriterMainMutationTemplates();const bytes=Buffer.from(rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0"));
 if(rows.length!==18||bytes.length>100_000||CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_SEQUENCE.length!==40){throw new Error("FORWARD_WRITER_SQL_CODEBOOK_BOUND");}
 const groups:string[][]=[];let pending:string[]=[];
 for(const row of rows){const line=[row.phase,row.method,row.fields.join(","),row.template].join("\t");if(Buffer.byteLength([...pending,line].join("\0"))>60_000){groups.push(pending);pending=[];}pending.push(line);}
 if(pending.length>0){groups.push(pending);}
 const loads=groups.map(group=>{const source=Buffer.from(group.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Fixed build-time chunks preserve the unchanged shared64KiB decoder bound.
  const packed=gzipSync(source,{level:9});
  return `EasyedaDiagnosticFixedTable.Load(${JSON.stringify(packed.toString("base64"))},${String(source.length)},${JSON.stringify(digest(source))},${JSON.stringify(digest(packed))},${String(group.length)},4)`;
 });
 return `internal static class EasyedaForwardWriterMainSqlProtocol {
 static void Need(bool value){if(!value)throw new InvalidOperationException("forward-writer-sql-codebook");}
 static string[][] Load(){var result=new List<string[]>();foreach(string[][] group in new string[][][]{${loads.join(",")}})result.AddRange(group);Need(result.Count==18);return result.ToArray();}
 static readonly string[][] Rows=Load();
 static string Quote(string name,object input){string value=input as string;Need(value!=null);if(name=="path")Need(value.Length>0&&value.Length<=4096&&value.IndexOf('\\0')<0);else Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(value);}
 internal static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){
  Need(id>0&&fields!=null);string[] row=null;foreach(string[] item in Rows)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);
  string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));
  string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__forward_sql_([A-Za-z0-9]+)__\\"",match=>Quote(match.Groups[1].Value,fields[match.Groups[1].Value]));
  text="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+"}";Need(Encoding.UTF8.GetByteCount(text)<=65536&&text.IndexOf('\\0')<0);return text;
 }
 internal static void VerifySmoke(){foreach(string[] row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Split(','))if(name.Length>0)fields.Add(name,name=="path"?"C:\\\\Synthetic\\\\fixture.eprj2":"original_123");string text=Encode(79,row[0],row[1],fields);Need(text.StartsWith("{\\"id\\":79,")&&text.IndexOf("__forward_sql_")<0);bool refused=false;try{Encode(79,row[0],"Runtime.evaluate",fields);}catch(InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
 int forwardWriterSqlStep,forwardWriterSqlCompletionOffset;
 string forwardWriterSqlCapture,forwardWriterSqlActor,forwardWriterSqlOwner,forwardWriterSqlProject,forwardWriterSqlBranch,forwardWriterSqlPath,forwardWriterSqlPrior;
 static readonly string[] ForwardWriterSqlPhases={${CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_SEQUENCE.map(value=>JSON.stringify(value)).join(",")}};
 public void SendForwardWriterMainSql(int id,string phase,string method,System.Collections.IDictionary fields){
  MainPurpose();AssertLive();if(!forwardWriterCompleteBirth||footprintCombinedAbortAttempted||mainCompletionRetired||mainCompletionFailed||forwardWriterSqlStep>=40||id!=mainRequest+1||phase!=ForwardWriterSqlPhases[forwardWriterSqlStep]||
   (forwardWriterSqlStep<3?mainCompletionBegun:!mainCompletionActive))throw Error("forward-writer-sql-original-owner");
  string text=EasyedaForwardWriterMainSqlProtocol.Encode(id,phase,method,fields);
  if(phase=="forward-writer-sql-read"){string capture=fields["capture"] as string;if(forwardWriterSqlCapture==null)forwardWriterSqlCapture=capture;else if(forwardWriterSqlCapture!=capture)throw Error("forward-writer-sql-capture");}
  if(phase.StartsWith("forward-writer-sql-proof-",StringComparison.Ordinal)){
   if(forwardWriterSqlCapture!=fields["argument0"] as string)throw Error("forward-writer-sql-capture");
   if(forwardWriterSqlActor==null){forwardWriterSqlActor=fields["argument1"] as string;forwardWriterSqlOwner=fields["argument2"] as string;forwardWriterSqlProject=fields["projectUuid"] as string;forwardWriterSqlBranch=fields["branchUuid"] as string;forwardWriterSqlPath=fields["path"] as string;forwardWriterSqlPrior=fields["priorHistoryUuid"] as string;}
   else if(forwardWriterSqlActor!=fields["argument1"] as string||forwardWriterSqlOwner!=fields["argument2"] as string||forwardWriterSqlProject!=fields["projectUuid"] as string||forwardWriterSqlBranch!=fields["branchUuid"] as string||forwardWriterSqlPath!=fields["path"] as string||forwardWriterSqlPrior!=fields["priorHistoryUuid"] as string)throw Error("forward-writer-sql-original-input");
  }
  if(phase=="forward-writer-sql-require"&&forwardWriterSqlCapture!=fields["objectId"] as string)throw Error("forward-writer-sql-require-capture");
  forwardWriterSqlStep++;if(mainCompletionActive)forwardWriterSqlCompletionOffset++;mainRequest=id;originalMain.SendFixed(text,false);AssertLive();
 }
 public static void VerifyForwardWriterMainSqlSmoke(){EasyedaForwardWriterMainSqlProtocol.VerifySmoke();if(ForwardWriterSqlPhases.Length!=40)throw Error("forward-writer-sql-roster");var owner=CreateFootprintForwardWriterComplete209();try{bool refused=false;try{owner.SendForwardWriterMainSql(1,ForwardWriterSqlPhases[0],"Debugger.evaluateOnCallFrame",new System.Collections.Hashtable());}catch(InvalidOperationException){refused=true;}if(!refused||owner.forwardWriterSqlStep!=0)throw Error("forward-writer-sql-unissued");}finally{owner.originalMain.Release();}}
}
`;
}
/** Apply only to the separately born complete graph. Historical source remains exact. */
export function installCurrentFootprintForwardWriterMainMutationNativeSource(input:string):string{
 let core=input;const one=(before:string,after:string):void=>{if(core.split(before).length!==2){throw new Error("FORWARD_WRITER_SQL_NATIVE_ANCHOR");}core=core.replace(before,after);};
 one("internal void SendFixed(string fixedMessage,bool cleanup){",`internal void RequireForwardWriterSqlCompletionCapacity(int consumed){RequireCompletionCapacity(consumed);Need(normalRequests+EasyedaFootprintCopyMainCompletionProtocol.NormalRequests+37<=normalLimit&&requests+EasyedaFootprintCopyMainCompletionProtocol.Requests+38<=normalLimit+cleanupLimit,"forward-writer-sql-completion-capacity");}\ninternal void SendFixed(string fixedMessage,bool cleanup){`);
 one("originalMain.RequireCompletionCapacity(mainRequest-(forwardWriterBirth?stockMainRequests:0));","if(forwardWriterCompleteBirth){if(forwardWriterSqlStep!=3)throw Error(\"forward-writer-sql-begin-prefix\");originalMain.RequireForwardWriterSqlCompletionCapacity(mainRequest-stockMainRequests);}else originalMain.RequireCompletionCapacity(mainRequest-(forwardWriterBirth?stockMainRequests:0));");
 one("if((long)first+EasyedaFootprintCopyMainCompletionProtocol.Requests>","if((long)first+EasyedaFootprintCopyMainCompletionProtocol.Requests+(forwardWriterCompleteBirth?37:0)>");
 one("id!=mainCompletionFirst+mainCompletionNormal+mainCompletionCleanup||","id!=mainCompletionFirst+mainCompletionNormal+mainCompletionCleanup+forwardWriterSqlCompletionOffset||");
 one("mainRequest+1==mainCompletionFirst+EasyedaFootprintCopyMainCompletionProtocol.Requests;","mainRequest+1==mainCompletionFirst+EasyedaFootprintCopyMainCompletionProtocol.Requests+forwardWriterSqlCompletionOffset&&(!forwardWriterCompleteBirth||forwardWriterSqlStep==40&&forwardWriterSqlCompletionOffset==37);");
 return `${core}\n${currentFootprintForwardWriterMainMutationNativeSource()}`;
}
export function currentFootprintForwardWriterMainMutationDispatch():string{
 return `        'footprint-forward-writer-main-sql' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-writer-sql-fields'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-writer-sql-missing'}}
          foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterMainSql([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
}

export function installCurrentFootprintForwardWriterMainMutationNativeTail(tail:string):string{
 const before='else if(operation=="final-complete"){if(!fullPublicationComplete';
 if(tail.split(before).length!==2){throw new Error("FORWARD_WRITER_SQL_NATIVE_TAIL_ANCHOR");}
 return tail.replace(before,'else if(operation=="final-complete"){if(forwardWriterSqlStep!=40||forwardWriterSqlCompletionOffset!=37||!fullPublicationComplete');
}
