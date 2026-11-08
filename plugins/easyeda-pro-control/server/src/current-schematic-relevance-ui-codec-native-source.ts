/** Build-only factory for byte-identical fixed own7 protocol classes.
 * Every caller retains its own closed tables, wire vocabulary and state. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {currentPcbDiagnosticNativeHashVector} from "./current-pcb-diagnostic-fixed-table-native.ts";

const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
const quote=(value:string):string=>`@"${value.replaceAll('"','""')}"`;
interface Input{readonly className:string;readonly errorCode:string;readonly tableError:string;readonly marker:string;readonly rows:readonly(readonly string[])[];readonly programs:readonly string[];readonly messages:readonly string[];readonly sharedProgramClass?:string;readonly programIndexes?:readonly number[];readonly exportPrograms?:boolean}
export function currentSchematicRelevanceUiCodecNativeSource(input:Input):string{
 if(!/^EasyedaSchematicRelevance[A-Za-z]+Protocol$/u.test(input.className)||!/^schematic-[a-z-]+-codec$/u.test(input.errorCode)||!/^SCHEMATIC_[A-Z_]+_FIXED_TABLE_BOUND$/u.test(input.tableError)||!(/^[a-z]+$/u.test(input.marker))||input.rows.length!==input.messages.length){throw new Error("SCH_UI_CODEC_SOURCE_FIELDS");}
 if(input.sharedProgramClass!==undefined&&(!/^EasyedaSchematicRelevance[A-Za-z]+Protocol$/u.test(input.sharedProgramClass)||input.sharedProgramClass===input.className)||input.programIndexes!==undefined&&(input.programIndexes.length!==input.programs.length||new Set(input.programIndexes).size!==input.programIndexes.length||input.programIndexes.some(index=>!Number.isSafeInteger(index)||index<0||index>=384))){throw new Error("SCH_UI_CODEC_SHARED_PROGRAMS");}
 const table=(name:string,rows:readonly(readonly string[])[],columns:number):string=>{
  const raw=Buffer.from(rows.map(row=>row.join("\t")).join("\0"));if(raw.length>65_536){throw new Error(input.tableError);}
  // oxlint-disable-next-line node/no-sync -- Immutable fixed compile-time tables retain the original bounded pinned-Node gzip and both hashes.
  const packed=gzipSync(raw,{level:9});return `static readonly string[][] ${name}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(rows.length)},${String(columns)});`;
 };
 const rows=input.rows;const programs=input.programs.map((program,index)=>[String(input.programIndexes?.[index]??index),JSON.stringify(program)]);const hashes=input.messages.map(message=>hash(Buffer.from(message)));
 let programTable:string;
 if(input.sharedProgramClass===undefined){programTable=table("Programs",programs,2);if(input.exportPrograms===true){programTable=programTable.replace("static readonly","internal static readonly");}}
 else{programTable=`${table("OwnPrograms",programs,2)}\nstatic readonly string[][] Programs=JoinPrograms(${input.sharedProgramClass}.Programs,OwnPrograms);
static string[][] JoinPrograms(string[][] shared,string[][] local){if(shared==null||local==null||shared.Length+local.Length>384)throw new System.InvalidOperationException("schematic-shared-program-bound");var result=new string[shared.Length+local.Length][];System.Array.Copy(shared,0,result,0,shared.Length);System.Array.Copy(local,0,result,shared.Length,local.Length);return result;}`;}
  return `public static class ${input.className}{
static void Need(bool value){if(!value)throw new System.InvalidOperationException("${input.errorCode}");}
${table("Rows", rows, 4)}
${programTable}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicUiFixedCodec.Encode(id,session,phase,method,fields,Rows,Programs,"${input.marker}",Need);}
public static void VerifySmoke(){EasyedaSchematicUiFixedCodec.VerifySmoke(Rows,${currentPcbDiagnosticNativeHashVector(hashes)},Encode,Need);}
}`;
}
