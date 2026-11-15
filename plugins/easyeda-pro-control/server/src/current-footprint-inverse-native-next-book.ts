/** Immutable common-table factoring for the new native query family.
 * Fixed program identities and complete command bytes keep separate hashes. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {currentPcbDiagnosticNativeHashVector} from "./current-pcb-diagnostic-fixed-table-native.ts";

interface Row{readonly key:string;readonly method:string;readonly names:readonly string[];readonly template:string}
interface Case{readonly method:string;readonly params:unknown}
const quote=(value:string):string=>`@"${value.replaceAll('"','""')}"`;
const sha=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
export function currentFootprintInverseNativeNextBook(name:string,programs:Readonly<Record<string,Readonly<Record<string,string>>>>,cases:Readonly<Record<string,readonly Case[]>>,templates:readonly Row[]):Readonly<{source:string;rows:string;hashes:string}>{
 if(!/^[A-Z][A-Za-z]+$/u.test(name)){throw new Error("INVERSE_NATIVE_NEXT_BOOK_NAME");}
 const kinds=Object.keys(programs);const first=programs[kinds[0]??""];if(first===undefined){throw new Error("INVERSE_NATIVE_NEXT_BOOK_EMPTY");}
 const common:string[][]=[],distinct:string[][]=[];
 for(const role of Object.keys(first)){const values=kinds.map(kind=>programs[kind]?.[role]);if(values.some(value=>typeof value!=="string")){throw new Error("INVERSE_NATIVE_NEXT_BOOK_ROSTER");}if(values.every(value=>value===values[0])){common.push(["program",role,"",JSON.stringify(values[0])]);}else{for(const kind of kinds){distinct.push(["program",`${kind}:${role}`,"",JSON.stringify(programs[kind]?.[role])]);}}}
 const rows=[...common,...distinct,...templates.map(row=>[row.key,row.method,row.names.join(","),row.template])];const groups:string[][][]=[];let group:string[][]=[];let size=0;
 for(const row of rows){if(row.some(v=>v.includes("\0")||v.includes("\t"))){throw new Error("INVERSE_NATIVE_NEXT_BOOK_FIELD");}const bytes=Buffer.byteLength(row.join("\t"));if(bytes>60_000){throw new Error("INVERSE_NATIVE_NEXT_BOOK_ROW");}if(size+Number(group.length>0)+bytes>60_000){groups.push(group);group=[];size=0;}group.push(row);size+=Number(group.length>1)+bytes;}if(group.length>0){groups.push(group);}if(groups.length>8){throw new Error("INVERSE_NATIVE_NEXT_BOOK_BOUND");}
 const declarations=groups.map((part,index)=>{const raw=Buffer.from(part.map(row=>row.join("\t")).join("\0"));
 // oxlint-disable-next-line node/no-sync -- Immutable fixed build-time rows enter this deterministic compressor.
 const packed=gzipSync(raw,{level:9});return `static readonly string[][] ${name}Rows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(part.length)},4);`;}).join("\n");
 const all=`InverseFixedRows(new string[][][]{${groups.map((_g,index)=>`${name}Rows${String(index)}`).join(",")}})`;
 const source=`${declarations}
static System.Collections.Generic.IEnumerable<string[]> ${name}Book(string kind){foreach(string[] row in ${all}){if(row[0]!="program"){yield return row;continue;}int at=row[1].IndexOf(':');if(at<0)yield return row;else if(row[1].Substring(0,at)==kind)yield return new string[]{"program",row[1].Substring(at+1),row[2],row[3]};}}
`;
 const hashes=kinds.flatMap(kind=>(cases[kind]??[]).map(c=>sha(Buffer.from(`${JSON.stringify({id:79,method:c.method,params:c.params,sessionId:"original_ui"})}\0`))));
 return Object.freeze({source,rows:`${name}Book(kind)`,hashes:currentPcbDiagnosticNativeHashVector(hashes)});
}
