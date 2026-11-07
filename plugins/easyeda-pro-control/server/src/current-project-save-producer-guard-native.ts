/** Fixed refusal guards; no debugger resume or application call is encoded. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentProjectSaveProducerGuardCases } from "./current-project-save-producer-guard-protocol.ts";

export function currentProjectSaveProducerGuardNativeSource(): string {
  const cases = currentProjectSaveProducerGuardCases("original_script");
  const columns = cases.map(command => command.params.location.columnNumber).join(","), lines = cases.map(command => command.params.location.lineNumber).join(","), phases = cases.map(command => JSON.stringify(`${command.phase}-${command.role}`)).join(",");
  const hashes = cases.map(command => createHash("sha256").update(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_worker" })}\0`).digest("hex"));
  return `public static class EasyedaProjectSaveProducerGuardProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("project-save-producer-guard-codec");}
static readonly string[] Phases={${phases}};static readonly int[] Lines={${lines}},Columns={${columns}};
static string Handle(object input){string text=input as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){int index=System.Array.IndexOf(Phases,phase);Need(id>0&&index>=0&&method=="Debugger.setBreakpoint"&&fields!=null&&fields.Count==1&&fields.Contains("scriptId"));Handle(session);string script=Handle(fields["scriptId"]);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.setBreakpoint\\",\\"params\\":{\\"location\\":{\\"scriptId\\":\\""+script+"\\",\\"lineNumber\\":"+Lines[index].ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"columnNumber\\":"+Columns[index].ToString(System.Globalization.CultureInfo.InvariantCulture)+"}},\\"sessionId\\":\\""+session+"\\"}\\0";}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Phases.Length;i++){var fields=new System.Collections.Hashtable();fields.Add("scriptId","original_script");string encoded=Encode(79,"original_worker",Phases[i],"Debugger.setBreakpoint",fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);bool refused=false;try{Encode(79,"original_worker",Phases[i],"Debugger.resume",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);fields.Add("condition","false");refused=false;try{Encode(79,"original_worker",Phases[i],"Debugger.setBreakpoint",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
