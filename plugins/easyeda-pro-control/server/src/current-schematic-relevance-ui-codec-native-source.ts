/** Build-only factory for byte-identical fixed own7 protocol classes.
 * Every caller retains its own closed tables, wire vocabulary and state. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {currentPcbDiagnosticNativeHashVector} from "./current-pcb-diagnostic-fixed-table-native.ts";

const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
const quote=(value:string):string=>`@"${value.replaceAll('"','""')}"`;
interface Input{readonly className:string;readonly errorCode:string;readonly tableError:string;readonly marker:string;readonly rows:readonly(readonly string[])[];readonly programs:readonly string[];readonly messages:readonly string[]}
export function currentSchematicRelevanceUiCodecNativeSource(input:Input):string{
 if(!/^EasyedaSchematicRelevance[A-Za-z]+Protocol$/u.test(input.className)||!/^schematic-[a-z-]+-codec$/u.test(input.errorCode)||!/^SCHEMATIC_[A-Z_]+_FIXED_TABLE_BOUND$/u.test(input.tableError)||!(/^[a-z]+$/u.test(input.marker))||input.rows.length!==input.messages.length){throw new Error("SCH_UI_CODEC_SOURCE_FIELDS");}
 const table=(name:string,rows:readonly(readonly string[])[],columns:number):string=>{
  const raw=Buffer.from(rows.map(row=>row.join("\t")).join("\0"));if(raw.length>65_536){throw new Error(input.tableError);}
  // oxlint-disable-next-line node/no-sync -- Immutable fixed compile-time tables retain the original bounded pinned-Node gzip and both hashes.
  const packed=gzipSync(raw,{level:9});return `static readonly string[][] ${name}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(rows.length)},${String(columns)});`;
 };
 const rows=input.rows;const programs=input.programs.map((program,index)=>[String(index),JSON.stringify(program)]);const hashes=input.messages.map(message=>hash(Buffer.from(message)));
  return `public static class ${input.className}{
static void Need(bool value){if(!value)throw new System.InvalidOperationException("${input.errorCode}");}
${table("Rows", rows, 4)}
${table("Programs", programs, 2)}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicUiFixedCodec.Encode(id,session,phase,method,fields,Rows,Programs,"${input.marker}",Need);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Rows.Length;index++){string[] row=Rows[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string text=Encode(83,"original_ui",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("functionDeclaration","caller");bool refused=false;try{Encode(83,"original_ui",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}bool resumeRefused=false;try{Encode(83,"original_ui","unknown-resume","Debugger.resume",new System.Collections.Hashtable());}catch(System.InvalidOperationException){resumeRefused=true;}Need(resumeRefused);}
}`;
}
