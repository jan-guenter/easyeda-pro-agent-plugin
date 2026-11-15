/** Full copy replay codec over immutable shared readonly post-sync rows.
 * The complete native owner supplies the two original replay references.
 * The historical Via compressed-Save replay row is never selected here. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_FLAGS as FLAGS } from "./current-pcb-via-post-history-sync-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_REPLAY_PROGRAM as PROGRAM } from "./current-footprint-forward-writer-copy-replay-program.ts";

const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintForwardWriterCopyPostNativeSource(): string {
  const template = JSON.stringify({ method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: true, objectId: "__full_copy_body__", functionDeclaration: PROGRAM, arguments: [{ objectId: "__full_copy_merged__" }] } });
  const bytes = Buffer.from(template);
  // oxlint-disable-next-line node/no-sync -- Pack only this immutable build-time template, with exact decompressed/source hashes.
  const packed = gzipSync(bytes, { level: 9 });
  const message = `{"id":79,${template.replaceAll("__full_copy_body__", "original_body").replaceAll("__full_copy_merged__", "original_merged").slice(1, -1)},"sessionId":"worker"}\0`;
  return `internal static class EasyedaForwardWriterCopyPostProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("forward-copy-post-codec");}
static readonly string Template=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(hash(bytes))},${literal(hash(packed))},1,1)[0][0];
static string Handle(object input){string text=input as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return EasyedaDiagnosticOwner.PostSyncQuote(text);}
internal static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){
if(phase!="via-post-sync-replay")return EasyedaPcbViaPostHistorySyncProtocol.Encode(id,session,phase,method,fields);
Need(id>0&&fields!=null&&fields.Count==2&&fields.Contains("originalBody")&&fields.Contains("merged")&&method=="Runtime.callFunctionOn");
string expanded=Template.Replace("\\"__full_copy_body__\\"",Handle(fields["originalBody"])).Replace("\\"__full_copy_merged__\\"",Handle(fields["merged"]));
string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+expanded.Substring(1,expanded.Length-2)+",\\"sessionId\\":"+Handle(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return text;
}
internal static void VerifySmoke(){var fields=new System.Collections.Hashtable();fields.Add("originalBody","original_body");fields.Add("merged","original_merged");string text=Encode(79,"worker","via-post-sync-replay","Runtime.callFunctionOn",fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==${literal(hash(Buffer.from(message)))});bool refused=false;try{Encode(79,"worker","via-post-sync-replay","Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}
}
`;
}
