/** Complete-only reflection codebook and original instance cursor. The old
 * full writer and inverse reflection owner are never admitted here. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_OWN_DATA_PROGRAMS as PROGRAMS,currentFootprintForwardWriterOwnDataCases,currentFootprintForwardWriterOwnDataTemplate} from "./current-footprint-forward-writer-own-data-protocol.ts";

const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
function load(text:string,rows:number,columns:number):string{
 const bytes=Buffer.from(text);if(bytes.length>60_000){throw new Error("FORWARD_WRITER_OWN_DATA_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Compress only immutable build-time source with the unchanged bounded fixed-table decoder.
 const packed=gzipSync(bytes,{level:9});return `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(bytes.length)},"${hash(bytes)}","${hash(packed)}",${String(rows)},${String(columns)})`;
}
export function currentFootprintForwardWriterOwnDataNativeSource():string{
 const cases=currentFootprintForwardWriterOwnDataCases(),rows=cases.map(command=>currentFootprintForwardWriterOwnDataTemplate(command));
 const normal=cases.filter(command=>command.method!=="Debugger.getScriptSource").map(command=>command.phase);
 const programs=Object.entries(PROGRAMS).map(([name,program])=>`${name}\t${program}`);
 if(rows.length!==21||normal.length!==20||programs.length!==5){throw new Error("FORWARD_WRITER_OWN_DATA_NATIVE_ROSTER");}
 return `internal static class EasyedaForwardWriterOwnDataProtocol {
static void Need(bool value){if(!value)throw new InvalidOperationException("forward-writer-own-data-codec");}
static readonly string[][] Rows=${load(rows.map(row=>[row.phase,row.method,row.names.join(","),row.template].join("\t")).join("\0"),rows.length,4)};
static readonly string[][] Programs=${load(programs.join("\0"),5,2)};
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(value);}
internal static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string text=row[3];foreach(var program in Programs)text=text.Replace("\\"__forward_writer_own_data_program"+program[0]+"__\\"",EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(program[1]));text=System.Text.RegularExpressions.Regex.Replace(text,"\\"__forward_writer_own_data_([A-Za-z0-9]+)__\\"",match=>Handle(fields[match.Groups[1].Value]));text="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Handle(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return text;}
internal static void VerifySmoke(){foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Split(','))if(name.Length>0)fields.Add(name,"original27");string text=Encode(79,"session29",row[0],row[1],fields);Need(text.StartsWith("{\\"id\\":79,",StringComparison.Ordinal)&&text.EndsWith(",\\"sessionId\\":\\"session29\\"}\\0",StringComparison.Ordinal)&&!text.Contains("__forward_writer_own_data_"));bool refused=false;try{Encode(79,"session29",row[0],"Runtime.evaluate",fields);}catch(InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
int fullOwnDataStep,fullOwnDataHelpers;bool fullOwnDataBound,fullOwnDataReady,fullOwnDataHelperPending,fullOwnDataFailed;
static readonly string[] FullOwnDataOrder={${normal.map(phase=>JSON.stringify(phase)).join(",")}};
public void ControlForwardWriterOwnData(string operation){RequireForwardWriterCompleteBase();if(footprintCreateClockBegun||fullOwnDataFailed)throw Error("forward-writer-own-data-precreate");if(operation=="bind"){if(fullOwnDataBound||fullOwnDataReady)throw Error("forward-writer-own-data-bind-once");fullOwnDataBound=true;}else if(operation=="complete"){if(!fullOwnDataBound||fullOwnDataReady||fullOwnDataHelperPending||fullOwnDataStep!=20||fullOwnDataHelpers!=5)throw Error("forward-writer-own-data-completion");fullOwnDataReady=true;}else throw Error("forward-writer-own-data-control");}
public void SendForwardWriterOwnData(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteBase();if(fullOwnDataFailed||footprintCreateClockBegun||!fullOwnDataBound||fullOwnDataReady||fields==null)throw Error("forward-writer-own-data-owner");bool helper=phase=="forward-writer-own-data-helper";if(helper){if(!fullOwnDataHelperPending||fullOwnDataHelpers>=5)throw Error("forward-writer-own-data-helper-once");}else{if(fullOwnDataHelperPending||fullOwnDataStep>=20||phase!=FullOwnDataOrder[fullOwnDataStep]||phase=="forward-writer-own-data-literal"&&fields["uniqueContextId"] as string!=forwardWriterProducerContext)throw Error("forward-writer-own-data-order");}
string encoded=EasyedaForwardWriterOwnDataProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);if(helper){fullOwnDataHelperPending=false;fullOwnDataHelpers++;}else{fullOwnDataStep++;if(method=="Runtime.callFunctionOn")fullOwnDataHelperPending=true;}try{SendForwardWriterNormalMessage(id,encoded);}catch{fullOwnDataFailed=true;throw;}}
public static void VerifyForwardWriterOwnDataSmoke(){EasyedaForwardWriterOwnDataProtocol.VerifySmoke();var owner=CreateFootprintForwardWriter209();try{bool refused=false;try{owner.ControlForwardWriterOwnData("bind");}catch(InvalidOperationException){refused=true;}if(!refused||owner.fullOwnDataBound||owner.fullOwnDataReady)throw Error("forward-writer-own-data-unissued-smoke");}finally{owner.originalMain.Release();}}
}
`;
}
