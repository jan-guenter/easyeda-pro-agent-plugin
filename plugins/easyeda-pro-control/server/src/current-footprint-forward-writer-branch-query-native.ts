/** Fixed complete-writer branch-query table only. This pure table cannot issue
 * an owner, switch a graph, resume a producer or admit native Create. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentFootprintForwardWriterBranchQueryTemplates } from "./current-footprint-forward-writer-branch-query-wire.ts";

const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function sample(name: string): string { return name === "branchUuid" ? "a".repeat(32) : "original_ref"; }
/** Original codec rows, including the separate source-body capture, form one
 * fixed6-command schedule. All handles remain supplied by the original owner. */
export function currentFootprintForwardWriterBranchQueryNativeSource(): string {
  const rows = currentFootprintForwardWriterBranchQueryTemplates();
  const bytes = Buffer.from(rows.map(row => [row.phase, row.method, row.fields.join(","), row.template].join("\t")).join("\0"));
  if (rows.length !== 6 || bytes.length > 65_536) { throw new Error("FORWARD_COPY_LOCAL_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Compress only immutable build-time codebook bytes with the maintained bounded fixed-table codec.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = rows.map(row => {
    const template = row.template.replaceAll(/"__forward_branch_query_([A-Za-z\d]+)__"/gu, (_match, name: string) => JSON.stringify(sample(name)));
    return hash(Buffer.from(`{"id":79,${template.slice(1, -1)},"sessionId":"worker"}\0`));
  });
  return `public static class EasyedaForwardWriterBranchQueryProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("forward-branch-query-codec");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(hash(bytes))},${literal(hash(packed))},6,4);
static string Value(string name,object input){string value=input as string;Need(value!=null);if(name=="branchUuid")Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[a-f0-9]{32}\\z"));else Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Phase(int index){Need(index>=0&&index<Rows.Length);return Rows[index][0];}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Value("session",session);string[] row=null;foreach(string[] candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var values=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));values.Add(name,Value(name,fields[name]));}string template=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__forward_branch_query_([A-Za-z0-9]+)__\\"",match=>{string value;Need(values.TryGetValue(match.Groups[1].Value,out value));return EasyedaDiagnosticOwner.ForwardWriterBranchQueryQuote(value);});string message="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+template.Substring(1,template.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.ForwardWriterBranchQueryQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(message)<=16384);return message;}
public static void VerifySmoke(){Need(Rows.Length==6);string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="branchUuid"?"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":"original_ref");string message=Encode(79,"worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {public static string ForwardWriterBranchQueryQuote(string value){return JsonString(value);}}
`;
}
