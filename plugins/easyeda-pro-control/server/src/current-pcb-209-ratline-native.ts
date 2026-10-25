/** Fixed native encoding only. The launch-specific owner separately restricts
 * the currently admitted stage and retains session/source ownership plus
 * cumulative lifetime budgets. The full finite table grants no continuation. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES, currentPcb209RatlineNativePlaceholder } from "./current-pcb-209-ratline-native-cases.ts";
import { currentPcb209RatlineNativeWire } from "./current-pcb-209-ratline-native-wire.ts";

function literal(value: string): string { return `@"${value.replaceAll('"', '""')}"`; }
export function currentPcb209RatlineNativeSource(): string {
  const rows: string[] = [];
  let maximumEncodedBytes = 0;
  for (const entry of CURRENT_PCB_209_RATLINE_NATIVE_CASES) {
    const wire = currentPcb209RatlineNativeWire(entry.role, entry.command, 2_147_483_647);
    if (wire.request["phase"] !== entry.phase) { throw new Error("PCB209_RATLINE_NATIVE_AMBIGUOUS_CASE"); }
    const fields = Object.entries(wire.request).filter(([key]) => !["action", "requestId", "method", "role", "phase"].includes(key));
    const { navigationPhase: _privatePhase, ...nativeCommand } = { navigationPhase: undefined, ...entry.command };
    const template = JSON.stringify(nativeCommand);
    let bytes = Buffer.byteLength(template) + Buffer.byteLength(JSON.stringify({ id: 2_147_483_647 }));
    for (const [key, value] of fields) {
      if (value !== currentPcb209RatlineNativePlaceholder(key) || !template.includes(JSON.stringify(value))) { throw new Error("PCB209_RATLINE_NATIVE_TEMPLATE"); }
    }
    for (const match of template.matchAll(/"__ratline209_([A-Za-z\d]+)__"/gu)) {
      const key = match[1];
      if (key === undefined || !fields.some(([name]) => name === key)) { throw new Error("PCB209_RATLINE_NATIVE_PLACEHOLDER"); }
      bytes += (key === "sessionId" ? 128 : 256) - (match[0].length - 2);
    }
    if (bytes > 65_536 || template.includes("\0")) { throw new Error("PCB209_RATLINE_NATIVE_TEMPLATE_BOUND"); }
    maximumEncodedBytes = Math.max(maximumEncodedBytes, bytes);
    const columns = [entry.role, entry.phase, entry.command.method, fields.map(([key]) => key).join(","), template];
    if (columns.some(column => column.includes("\t") || column.includes("\0"))) { throw new Error("PCB209_RATLINE_NATIVE_TABLE_DELIMITER"); }
    rows.push(columns.join("\t"));
  }
  if (new Set(CURRENT_PCB_209_RATLINE_NATIVE_CASES.map(entry => `${entry.role}:${entry.phase}`)).size !== rows.length) {
    throw new Error("PCB209_RATLINE_NATIVE_DUPLICATE_CASE");
  }
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic compression of this bounded fixed table during generation; no I/O or application execution.
  const packed = gzipSync(bytes, { level: 9 });
  return `// Fixed ratline grammar; no owner, session, launch or budget authority.
public static class EasyedaRatline209Protocol {
  public const int MaximumEncodedBytes=${String(maximumEncodedBytes)};
  static void Need(bool value,string code) { if(!value)throw new System.InvalidOperationException("pcb-ratline209-"+code); }
  static string Unpack(string encoded,int length,string hash) {
    Need(length==${String(bytes.length)},"template-length");byte[] bytes=new byte[length];int count=0;
    byte[] packed=System.Convert.FromBase64String(encoded);Need(packed.Length==${String(packed.length)} && System.Convert.ToBase64String(packed)==encoded,"template-base64");
    using(var input=new System.IO.MemoryStream(packed,false))
    using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)) {
      while(count<length) { int read=stream.Read(bytes,count,length-count);if(read==0)break;count+=read; }
      Need(count==length && stream.ReadByte()==-1,"template-bytes");
    }
    using(var sha=System.Security.Cryptography.SHA256.Create()) {
      Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==hash,"template-hash");
    }
    return new System.Text.UTF8Encoding(false,true).GetString(bytes);
  }
  static readonly string[][] Cases=Load();
  static string[][] Load() {
    string[] rows=Unpack(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))}).Split('\\0');
    Need(rows.Length==${String(rows.length)},"template-count");string[][] result=new string[rows.Length][];
    for(int index=0;index<rows.Length;index++) {
      result[index]=rows[index].Split('\\t');Need(result[index].Length==5,"template-columns");
    }
    return result;
  }
  static string Field(System.Collections.IDictionary fields,string name) {
    Need(fields!=null && fields.Contains(name),"field");string value=fields[name] as string;
    Need(value!=null && value.Length<=(name=="sessionId"?128:256) &&
      System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]+\\z"),"handle");return value;
  }
  static void Keys(System.Collections.IDictionary fields,string[] names) {
    Need(fields!=null && fields.Count==names.Length,"fields");foreach(string name in names)Need(fields.Contains(name),"fields");
    foreach(System.Collections.DictionaryEntry field in fields) {
      bool found=false;foreach(string name in names)if(System.String.Equals(field.Key as string,name,System.StringComparison.Ordinal))found=true;
      Need(found,"field-name");
    }
  }
  static string Expand(string template,System.Collections.IDictionary fields) {
    var output=new System.Text.StringBuilder();int previous=0;
    foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__ratline209_([A-Za-z0-9]+)__\\"")) {
      output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(Field(fields,match.Groups[1].Value));output.Append('"');
      previous=match.Index+match.Length;
    }
    output.Append(template,previous,template.Length-previous);return output.ToString();
  }
  public static string Encode(int id,string role,string phase,string method,System.Collections.IDictionary fields) {
    // Int32 positivity is only envelope syntax. The original channel/helper
    // Must enforce its own never-reset lifetime request allowance before use.
    Need(id>=1,"id");string message=null;
    foreach(string[] row in Cases) {
      if(role!=row[0] || phase!=row[1])continue;
      Need(message==null,"case");Need(method==row[2],"method");
      Keys(fields,row[3].Length==0?new string[0]:row[3].Split(','));message=Expand(row[4],fields);
    }
    Need(message!=null && message.StartsWith("{",System.StringComparison.Ordinal),"case");
    string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+message.Substring(1)+"\\0";
    Need(System.Text.Encoding.UTF8.GetByteCount(result)<=MaximumEncodedBytes,"size");return result;
  }
  public static void VerifySmoke() {
    var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);
    fields.Add("sessionId","s");
    Need(Encode(301,"pcb","resume","Debugger.resume",fields)==@"{""id"":301,""method"":""Debugger.resume"",""sessionId"":""s"",""params"":{}}"+"\\0","smoke-frame");
    fields.Add("objectId","__ratline209_argument0__");fields.Add("argument0","original");
    string collision=Encode(301,"pcb","relation-same","Runtime.callFunctionOn",fields);
    Need(collision.Contains(@"""objectId"":""__ratline209_argument0__""") && collision.Contains(@"""objectId"":""original"""),"smoke-placeholder");
    var insensitive=new System.Collections.Hashtable(System.StringComparer.OrdinalIgnoreCase);insensitive.Add("SessionId","s");
    bool alias=false;try{Encode(1,"pcb","resume","Debugger.resume",insensitive);}catch(System.InvalidOperationException){alias=true;}Need(alias,"smoke-field-name");
  }
}`;
}
