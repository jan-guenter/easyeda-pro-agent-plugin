/** Fixed complete-writer copy-local table only. This pure table cannot issue
 * an owner, switch a graph, resume a producer or admit native Create. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentFootprintForwardWriterCopyLocalTemplates } from "./current-footprint-forward-writer-copy-local-wire.ts";

const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function sample(name: string): string {
  if (name === "key") { return `https://client/upload/${"a".repeat(32)}?key=${"b".repeat(16)}`; }
  return name === "body" ? "original_body" : "original_ref";
}
/** Original codec rows, including the separate source-body capture, form one
 * fixed21-command schedule. All handles remain supplied by the original owner. */
export function currentFootprintForwardWriterCopyLocalNativeSource(): string {
  const rows = currentFootprintForwardWriterCopyLocalTemplates();
  const bytes = Buffer.from(rows.map(row => [row.phase, row.method, row.fields.join(","), row.template].join("\t")).join("\0"));
  if (rows.length !== 21 || bytes.length > 65_536) { throw new Error("FORWARD_COPY_LOCAL_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Compress only immutable build-time codebook bytes with the maintained bounded fixed-table codec.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = rows.map(row => {
    const template = row.template.replaceAll(/"__forward_copy_local_([A-Za-z\d]+)__"/gu, (_match, name: string) => JSON.stringify(sample(name)));
    return hash(Buffer.from(`{"id":79,${template.slice(1, -1)},"sessionId":"worker"}\0`));
  });
  return `public static class EasyedaForwardWriterCopyLocalProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("forward-copy-local-codec");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(hash(bytes))},${literal(hash(packed))},21,4);
static string Value(string name,object input){string value=input as string;Need(value!=null);if(name=="key")Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\Ahttps://client/upload/[a-f0-9]{32}\\?key=[a-f0-9]{16}\\z"));else if(name=="body")Need(value.Length>0&&value.Length<=16384&&System.Text.Encoding.UTF8.GetByteCount(value)<=16384);else Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Phase(int index){Need(index>=0&&index<Rows.Length);return Rows[index][0];}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Value("session",session);string[] row=null;foreach(string[] candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var values=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));values.Add(name,Value(name,fields[name]));}string template=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__forward_copy_local_([A-Za-z0-9]+)__\\"",match=>{string value;Need(values.TryGetValue(match.Groups[1].Value,out value));return EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(value);});string message="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+template.Substring(1,template.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(message)<=16384);return message;}
public static int RequireBodyCapacity(string body){Need(body!=null&&body.Length>0&&System.Text.Encoding.UTF8.GetByteCount(body)<=8192);int checkedRows=0;foreach(string[] row in Rows){string[] names=row[2].Length==0?new string[0]:row[2].Split(',');if(System.Array.IndexOf(names,"body")<0)continue;var fields=new System.Collections.Hashtable();foreach(string name in names)fields.Add(name,name=="body"?body:name=="key"?"https://client/upload/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?key=bbbbbbbbbbbbbbbb":new string('a',256));Encode(int.MaxValue,new string('a',256),row[0],row[1],fields);checkedRows++;}Need(checkedRows==2);return System.Text.Encoding.UTF8.GetByteCount(EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(body));}
public static void VerifySmoke(){Need(Rows.Length==21);string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="key"?"https://client/upload/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?key=bbbbbbbbbbbbbbbb":name=="body"?"original_body":"original_ref");string message=Encode(79,"worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {public static string ForwardWriterCopyLocalQuote(string value){return JsonString(value);}}
`;
}
