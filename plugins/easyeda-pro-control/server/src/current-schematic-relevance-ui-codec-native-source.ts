/** Build-only factory for byte-identical fixed own7 protocol classes.
 * Every caller retains its own closed tables, wire vocabulary and state. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {currentPcbDiagnosticNativeHashVector} from "./current-pcb-diagnostic-fixed-table-native.ts";

const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
const quote=(value:string):string=>`@"${value.replaceAll('"','""')}"`;
interface Input{readonly className:string;readonly errorCode:string;readonly tableError:string;readonly marker:string;readonly rows:readonly(readonly string[])[];readonly programs:readonly string[];readonly messages:readonly string[];readonly sharedProgramClass?:string;readonly programIndexes?:readonly number[];readonly exportPrograms?:boolean}
/** Emit bounded immutable row, program and message-hash tables for one fixed schematic protocol class.
 * Validate class names and shared program indexes before generating the common encoder and complete golden smoke.
 */
export function currentSchematicRelevanceUiCodecNativeSource(input:Input):string{
 if(!/^EasyedaSchematicRelevance[A-Za-z]+Protocol$/u.test(input.className)||!/^schematic-[a-z-]+-codec$/u.test(input.errorCode)||!/^SCHEMATIC_[A-Z_]+_FIXED_TABLE_BOUND$/u.test(input.tableError)||!(/^[a-z]+$/u.test(input.marker))||input.rows.length!==input.messages.length){throw new Error("SCH_UI_CODEC_SOURCE_FIELDS");}
 if(input.sharedProgramClass!==undefined&&(!/^EasyedaSchematicRelevance[A-Za-z]+Protocol$/u.test(input.sharedProgramClass)||input.sharedProgramClass===input.className)||input.programIndexes!==undefined&&(input.programIndexes.length!==input.programs.length||new Set(input.programIndexes).size!==input.programIndexes.length||input.programIndexes.some(index=>!Number.isSafeInteger(index)||index<0||index>=384))){throw new Error("SCH_UI_CODEC_SHARED_PROGRAMS");}
 const table=(name:string,rows:readonly(readonly string[])[],columns:number):string=>{
  const raw=Buffer.from(rows.map(row=>row.join("\t")).join("\0"));if(raw.length>65_536){throw new Error(input.tableError);}
  // oxlint-disable-next-line node/no-sync -- Immutable fixed compile-time tables retain the original bounded pinned-Node gzip and both hashes.
  const packed=gzipSync(raw,{level:9});return `static readonly string[][] ${name}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(rows.length)},${String(columns)});`;
 };
 /** Split only a previously oversized program pool. Every decoder call
  * keeps the same byte/hash/shape ceiling; joining preserves exact row order
  * and the existing common 384-program bound. Successful old pools keep bytes. */
 const programTables=(name:string,rows:readonly(readonly string[])[]):string=>{
  const bytes=Buffer.byteLength(rows.map(row=>row.join("\t")).join("\0"));if(bytes<=65_536){return table(name,rows,2);}
  if(rows.length>384){throw new Error(input.tableError);}const groups:string[][][]=[];let current:string[][]=[],used=0;
  for(const row of rows){const size=Buffer.byteLength(row.join("\t"));if(size>65_536){throw new Error(input.tableError);}if(used+size+(current.length===0?0:1)>65_536){groups.push(current);current=[];used=0;}current.push([...row]);used+=size+(current.length===1?0:1);}
  if(current.length>0){groups.push(current);}let declarations="",joined="";
  for(const[index,group]of groups.entries()){const part=`${name}Group${String(index)}`;declarations+=`${table(part,group,2)}\n`;joined=index===0?part:`EasyedaSchematicUiFixedCodec.JoinPrograms(${joined},${part})`;}
  return `${declarations}static readonly string[][] ${name}=${joined};`;
 };
 const rows=input.rows;const programs=input.programs.map((program,index)=>[String(input.programIndexes?.[index]??index),JSON.stringify(program)]);const hashes=input.messages.map(message=>hash(Buffer.from(message)));
 let programTable:string;
 if(input.sharedProgramClass===undefined){programTable=programTables("Programs",programs);if(input.exportPrograms===true){programTable=programTable.replace("static readonly string[][] Programs=","internal static readonly string[][] Programs=");}}
 else if(programs.length===0){programTable=`static readonly string[][] Programs=${input.sharedProgramClass}.Programs;`;}
 else{programTable=`${programTables("OwnPrograms",programs)}\nstatic readonly string[][] Programs=EasyedaSchematicUiFixedCodec.JoinPrograms(${input.sharedProgramClass}.Programs,OwnPrograms);`;}
 if(input.exportPrograms===true&&!programTable.includes("internal static readonly string[][] Programs=")){programTable=programTable.replace("static readonly string[][] Programs=","internal static readonly string[][] Programs=");}
  return `public static class ${input.className}{
static void Need(bool value){if(!value)throw new System.InvalidOperationException("${input.errorCode}");}
${table("Rows", rows, 4)}
${programTable}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicUiFixedCodec.Encode(id,session,phase,method,fields,Rows,Programs,"${input.marker}",Need);}
public static void VerifySmoke(){EasyedaSchematicUiFixedCodec.VerifySmoke(Rows,${currentPcbDiagnosticNativeHashVector(hashes)},Encode,Need);}
}`;
}
