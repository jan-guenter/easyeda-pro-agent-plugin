import { Buffer } from "node:buffer";

/** Shared decoder for immutable generated tables. Runtime callers cannot
 * supply encoded data. The original program decoder retains its64KiB bound,
 * canonical base64, compressed/decoded hashes and complete gzip checks. */
export function currentPcbDiagnosticFixedTableNativeSource(): string {
  return `internal static class EasyedaDiagnosticFixedTable {
internal static string[][] Load(string encoded,int length,string hash,string packedHash,int rows,int columns) {
if(rows<1||rows>256||columns<1||columns>8)throw new System.InvalidOperationException("pcb-diagnostic-fixed-table-shape");
string[] text=EasyedaDiagnosticOwner.UnpackFixedProgram(encoded,length,hash,packedHash).Split('\\0');
if(text.Length!=rows)throw new System.InvalidOperationException("pcb-diagnostic-fixed-table-rows");
string[][] result=new string[rows][];for(int i=0;i<rows;i++){result[i]=text[i].Split('\\t');if(result[i].Length!=columns)throw new System.InvalidOperationException("pcb-diagnostic-fixed-table-columns");}return result;
}
internal static string[] Hashes(string encoded,int count) {
if(encoded==null||count<1||count>256||encoded.Length>10924)throw new System.InvalidOperationException("pcb-diagnostic-fixed-hashes-bound");
byte[] bytes=System.Convert.FromBase64String(encoded);if(bytes.Length!=count*32||System.Convert.ToBase64String(bytes)!=encoded)throw new System.InvalidOperationException("pcb-diagnostic-fixed-hashes-encoding");
string[] result=new string[count];for(int i=0;i<count;i++)result[i]=System.BitConverter.ToString(bytes,i*32,32).Replace("-","").ToLowerInvariant();return result;
}
}`;
}

/** Pack only exact build-time SHA-256 smoke expectations; wire packets and
 * their hashes are unchanged. Native smoke execution decodes every entry. */
export function currentPcbDiagnosticNativeHashVector(hashes: readonly string[]): string {
  if (hashes.length === 0 || hashes.length > 256 || hashes.some(hash => !/^[a-f\d]{64}$/u.test(hash))) { throw new Error("NATIVE_HASH_VECTOR"); }
  return `EasyedaDiagnosticFixedTable.Hashes(@"${Buffer.from(hashes.join(""), "hex").toString("base64")}",${String(hashes.length)})`;
}
