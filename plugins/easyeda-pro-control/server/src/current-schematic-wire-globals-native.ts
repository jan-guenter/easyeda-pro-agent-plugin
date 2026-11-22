/** Complete-only reflection codebook and original instance cursor. The old
 * full writer and inverse reflection owner are never admitted here. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE as PROFILE} from "./current-schematic-wire-writer-v5-native-profile.ts";
import {CURRENT_SCHEMATIC_WIRE_GLOBALS_ORDER as ORDER,CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS as PROGRAMS,currentSchematicWireGlobalsCases,currentSchematicWireGlobalsTemplate} from "./current-schematic-wire-globals-protocol.ts";

const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
function load(text:string,rows:number,columns:number):string{
 const bytes=Buffer.from(text);if(bytes.length>60_000){throw new Error("SCHEMATIC_WIRE_GLOBALS_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Compress only immutable build-time source with the unchanged bounded fixed-table decoder.
 const packed=gzipSync(bytes,{level:9});return `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(bytes.length)},"${hash(bytes)}","${hash(packed)}",${String(rows)},${String(columns)})`;
}
export function currentSchematicWireGlobalsNativeSource():string{
 const cases=currentSchematicWireGlobalsCases(),rows=cases.map(command=>currentSchematicWireGlobalsTemplate(command));
 const normal=ORDER;
 const programs=Object.entries({...PROGRAMS,check:PROGRAMS.continuity}).map(([name,program])=>`${name}\t${program}`);
 const expected=rows.map(row=>{let text=row.template;for(const[name,program]of Object.entries({...PROGRAMS,check:PROGRAMS.continuity})){text=text.replaceAll(`"__wire_globals_program${name}__"`,()=>JSON.stringify(program));}text=text.replaceAll(/"__wire_globals_([A-Za-z\d]+)__"/gu,()=>JSON.stringify("original27"));return createHash("sha256").update(`{"id":79,${text.slice(1,-1)},"sessionId":"session29"}`).update(Buffer.from([0])).digest();});const hashes=Buffer.concat(expected).toString("base64");
 if(rows.length!==48||normal.length!==46||programs.length!==8){throw new Error("SCHEMATIC_WIRE_GLOBALS_NATIVE_ROSTER");}
 return `internal static class EasyedaWireGlobalsProtocol {
static void Need(bool value){if(!value)throw new InvalidOperationException("wire-globals-codec");}
static readonly string[][] Rows=${load(rows.map(row=>[row.phase,row.method,row.names.join(","),row.template].join("\t")).join("\0"),rows.length,4)};
static readonly string[][] Programs=${load(programs.join("\0"),8,2)};
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return EasyedaDiagnosticOwner.WireGlobalsQuote(value);}
internal static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&id<=${String(PROFILE.renderer.total)}&&fields!=null);string[] row=null;foreach(var candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string text=row[3];foreach(var program in Programs)text=text.Replace("\\"__wire_globals_program"+program[0]+"__\\"",EasyedaDiagnosticOwner.WireGlobalsQuote(program[1]));text=System.Text.RegularExpressions.Regex.Replace(text,"\\"__wire_globals_([A-Za-z0-9]+)__\\"",match=>Handle(fields[match.Groups[1].Value]));text="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Handle(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return text;}
internal static void VerifySmoke(){string[] hashes=EasyedaDiagnosticFixedTable.Hashes("${hashes}",Rows.Length);int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Split(','))if(name.Length>0)fields.Add(name,"original27");string text=Encode(79,"session29",row[0],row[1],fields);Need(text.StartsWith("{\\"id\\":79,",StringComparison.Ordinal)&&text.EndsWith(",\\"sessionId\\":\\"session29\\"}\\0",StringComparison.Ordinal)&&!text.Contains("__wire_globals_"));using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"session29",row[0],"Runtime.evaluate",fields);}catch(InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
internal static string WireGlobalsQuote(string value){return JsonString(value);}
int wireGlobalsStep,wireGlobalsHelpers;bool wireGlobalsBound,wireGlobalsReady,wireGlobalsHelperPending,wireGlobalsFailed;string wireGlobalsContext;
static readonly string[] WireGlobalsOrder={${normal.map(phase=>JSON.stringify(phase)).join(",")}};
void RequireWireGlobals(){if(!wireWriterV5||schematicDisplayAbort||schematicDisplaySession==null||schematicDisplayTuple==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[5]||wireGlobalsFailed)throw Error("wire-globals-original-preflight");AssertLive();}
public void ControlWireGlobals(string operation,string context){RequireWireGlobals();if(operation=="bind"){if(wireGlobalsBound||wireGlobalsReady||context==null||!System.Text.RegularExpressions.Regex.IsMatch(context,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("wire-globals-bind-once");wireGlobalsContext=context;wireGlobalsBound=true;}else if(operation=="complete"){if(context!=null||!wireGlobalsBound||wireGlobalsReady||wireGlobalsHelperPending||wireGlobalsStep!=46||wireGlobalsHelpers!=7)throw Error("wire-globals-incomplete");wireGlobalsReady=true;}else throw Error("wire-globals-control");}
public void SendWireGlobals(int id,string phase,string method,System.Collections.IDictionary fields){RequireWireGlobals();if(!wireGlobalsBound||fields==null)throw Error("wire-globals-owner");bool helper=phase=="wire-globals-helper";if(helper){if(!wireGlobalsHelperPending||!wireGlobalsReady&&wireGlobalsHelpers>=7)throw Error("wire-globals-helper-once");}else if(wireGlobalsReady){if(wireGlobalsHelperPending||phase!="wire-globals-check"||wireV5ContinuityChecks>=${String(PROFILE.title.continuityChecks)}||wireV5ContinuityChecks!=wireV5TitleReads*2&&wireV5ContinuityChecks!=wireV5TitleReads*2-1)throw Error("wire-v5-continuity-order");}else if(wireGlobalsHelperPending||wireGlobalsStep>=46||phase!=WireGlobalsOrder[wireGlobalsStep]||phase=="wire-globals-literal"&&fields["uniqueContextId"] as string!=wireGlobalsContext)throw Error("wire-globals-order");
string encoded=EasyedaWireGlobalsProtocol.Encode(id,schematicDisplaySession,phase,method,fields);AssertLive();if(helper){wireGlobalsHelperPending=false;wireGlobalsHelpers++;}else{if(wireGlobalsReady)wireV5ContinuityChecks++;else wireGlobalsStep++;if(method=="Runtime.callFunctionOn")wireGlobalsHelperPending=true;}try{SendMessage(id,encoded);}catch{wireGlobalsFailed=true;throw;}}
}
`;
}
