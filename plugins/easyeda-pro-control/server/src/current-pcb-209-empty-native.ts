/** Native encoder fragment for the separately launch-sealed209 purpose. This
 * generated class carries no authority and never owns/allocates request IDs. */
import { CURRENT_PCB_209_EMPTY_NATIVE_CASES, currentPcb209EmptyNativePlaceholder } from "./current-pcb-209-empty-native-cases.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_PROFILE } from "./current-pcb-209-empty-native-profile.ts";
import { currentPcb209EmptyNativeWire } from "./current-pcb-209-empty-native-wire.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

function literal(value: string): string { return `@"${value.replaceAll('"', '""')}"`; }
export function currentPcb209EmptyNativeSource(): string {
  const rows: string[] = [], smoke: string[] = [], templates: string[] = [];
  for (const [index, command] of CURRENT_PCB_209_EMPTY_NATIVE_CASES.entries()) {
    const request = currentPcb209EmptyNativeWire(command, 1).request;
    const family = "commonPhase" in command ? "common" : "root", phase = "commonPhase" in command ? command.commonPhase : command.rootPhase;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "sessionId", "commonPhase", "rootPhase"].includes(key));
    const template = JSON.stringify(command.params);
    for (const [key, value] of fields) {
      if (value !== currentPcb209EmptyNativePlaceholder(key) || !template.includes(JSON.stringify(value))) { throw new Error("PCB209_EMPTY_NATIVE_TEMPLATE"); }
    }
    for (const match of template.matchAll(/"__empty209_([A-Za-z\d]+)__"/gu)) {
      const key = match[1];
      if (key === undefined || !fields.some(([name]) => name === key)) { throw new Error("PCB209_EMPTY_NATIVE_PLACEHOLDER"); }
    }
    if (Buffer.byteLength(template) > 65_536 || template.includes("\0")) { throw new Error("PCB209_EMPTY_NATIVE_TEMPLATE_BYTES"); }
    templates.push(template);
    rows.push(`    if(family==${literal(family)} && phase==${literal(phase)}) {\n` +
      `      Need(method==${literal(command.method)},"method");Keys(fields,new string[]{${fields.map(([key]) => literal(key)).join(",")}});\n` +
      `      parameters=Parameters(Templates[${index}],fields);\n    }`);
    const prefix = `${JSON.stringify({ id: 1, method: command.method }).slice(0, -1)  },"params":`;
    const suffix = `,"sessionId":${  JSON.stringify(command.sessionId)  }}`;
    smoke.push(`    fields.Clear();\n${fields.map(([key, value]) => `    fields.Add(${literal(key)},${literal(String(value))});`).join("\n")}\n` +
      `    Need(EncodeBaseline(1,${literal(command.method)},${literal(command.sessionId)},${literal(family)},${literal(phase)},fields)==${literal(prefix)}+Templates[${index}]+${literal(suffix)}+"\\0","smoke-parity");`);
  }
  const templateBytes = Buffer.from(templates.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Build-only deterministic compression of a bounded fixed program table; no filesystem or live runtime work.
  const compressed = gzipSync(templateBytes, { level: 9 });
  return `// BEGIN GENERATED WORKER STARTUP EMPTY209 PROTOCOL
// Generated from current-pcb-209-empty-native.ts. Requires original launch purpose.
public static class EasyedaWorkerStartupEmpty209Protocol {
  public const int RequestLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.requestLimit};
  public const int NormalRequestLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.normalRequestLimit};
  public const long TotalByteLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.bytes.total}L;
  public const long NormalByteLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.bytes.normal}L;
  public const long HelperStdoutByteLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.bytes.helperStdout}L;
  public const int PollLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.polling.limit};
  public const int HelperControlLimit=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.helperControlMessages};
  public const long NormalMilliseconds=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.elapsed.normalMilliseconds}L;
  public const long TotalMilliseconds=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.elapsed.totalMilliseconds}L;
  static void Need(bool value,string code) { if(!value)throw new System.InvalidOperationException("pcb-diagnostic-empty-"+code); }
  static string Unpack(string encoded,int length,string hash) {
    Need(length==${templateBytes.length},"template-length");byte[] bytes=new byte[length];int count=0;
    byte[] packed=System.Convert.FromBase64String(encoded);Need(packed.Length==${compressed.length} && System.Convert.ToBase64String(packed)==encoded,"template-base64");
    using(var input=new System.IO.MemoryStream(packed,false))
    using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)) {
      while(count<length) {int read=stream.Read(bytes,count,length-count);if(read==0)break;count+=read;}
      Need(count==length && stream.ReadByte()==-1,"template-bytes");
    }
    using(var sha=System.Security.Cryptography.SHA256.Create()) {
      string actual=System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();Need(actual==hash,"template-hash");
    }
    return new System.Text.UTF8Encoding(false,true).GetString(bytes);
  }
  static readonly string[] Templates=Unpack(${literal(compressed.toString("base64"))},${templateBytes.length},${literal(createHash("sha256").update(templateBytes).digest("hex"))}).Split('\\0');
  static EasyedaWorkerStartupEmpty209Protocol() {
    Need(Templates.Length==${templates.length},"template-count");foreach(string template in Templates)Need(System.Text.Encoding.UTF8.GetByteCount(template)<=65536,"template-bound");
  }
  static string Field(System.Collections.IDictionary fields,string key) {
    Need(fields!=null && fields.Contains(key),"field");string result=fields[key] as string;Need(result!=null,"field-type");return result;
  }
  static void Keys(System.Collections.IDictionary fields,string[] expected) {
    Need(fields!=null && fields.Count==expected.Length,"fields");foreach(string key in expected)Need(fields.Contains(key),"fields");
    foreach(System.Collections.DictionaryEntry field in fields) {
      string key=field.Key as string;bool found=false;foreach(string name in expected)if(System.String.Equals(key,name,System.StringComparison.Ordinal))found=true;
      Need(found,"field-name");
    }
  }
  static string Handle(string value,int limit) {
    Need(value!=null && value.Length<=limit && System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]+\\z"),"handle");return value;
  }
  static string Parameters(string template,System.Collections.IDictionary fields) {
    var result=new System.Text.StringBuilder();int previous=0;
    foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__empty209_([A-Za-z0-9]+)__\\"")) {
      string key=match.Groups[1].Value;result.Append(template,previous,match.Index-previous);result.Append('"');
      result.Append(Handle(Field(fields,key),key=="uniqueContextId"?128:256));result.Append('"');previous=match.Index+match.Length;
    }
    result.Append(template,previous,template.Length-previous);return result.ToString();
  }
  static string OriginalId(int id,string encoded) {
    Need(id>=1 && id<=RequestLimit,"id");
    const string prefix="{\\"id\\":1,";
    Need(encoded!=null && encoded.StartsWith(prefix,System.StringComparison.Ordinal) && encoded.EndsWith("}\\0",System.StringComparison.Ordinal),"fixed-envelope");
    // Only the known leading ID from the fixed encoder is replaced. No dynamic
    // text replacement, counter mutation or downstream call occurs here.
    string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length);
    Need(System.Text.Encoding.UTF8.GetByteCount(result)<=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.frames.outbound},"size");return result;
  }
  public static string EncodeStartup(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    Need(id>=1 && id<=RequestLimit,"id");return OriginalId(id,EasyedaWorkerStartupProtocol.Encode209(1,method,sessionId,phase,fields));
  }
  public static string EncodeParent(int id,string method,string phase,System.Collections.IDictionary fields) {
    Need(id>=1 && id<=RequestLimit,"id");return OriginalId(id,EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(1,method,phase,fields));
  }
  public static string EncodeCommon(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    return EncodeBaseline(id,method,sessionId,"common",phase,fields);
  }
  public static string EncodeRoot(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    return EncodeBaseline(id,method,sessionId,"root",phase,fields);
  }
  static string EncodeBaseline(int id,string method,string sessionId,string family,string phase,System.Collections.IDictionary fields) {
    Need(id>=1 && id<=RequestLimit,"id");Handle(sessionId,128);string parameters=null;
${rows.join(" else\n")}
    Need(parameters!=null,"phase");
    string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\""+method+"\\",\\"params\\":"+parameters+",\\"sessionId\\":\\""+sessionId+"\\"}\\0";
    Need(System.Text.Encoding.UTF8.GetByteCount(result)<=${CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.frames.outbound},"size");return result;
  }
  public static void VerifySmoke() {
    System.Collections.Hashtable fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);
${smoke.join("\n")}
    fields.Clear();fields.Add("objectId","__empty209_argument0__");fields.Add("argument0","original");
    string collision=EncodeRoot(RequestLimit,"Runtime.callFunctionOn","s","before",fields);
    Need(collision.Contains(@"""objectId"":""__empty209_argument0__""") && collision.Contains(@"""objectId"":""original"""),"smoke-placeholder");
    foreach(int id in new int[]{0,RequestLimit+1}) { bool refused=false;try{EncodeRoot(id,"Runtime.callFunctionOn","s","before",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-id"); }
    fields.Add("expression","arbitrary");bool extra=false;try{EncodeRoot(1,"Runtime.callFunctionOn","s","before",fields);}catch(System.InvalidOperationException){extra=true;}Need(extra,"smoke-extra");
    var insensitive=new System.Collections.Hashtable(System.StringComparer.OrdinalIgnoreCase);insensitive.Add("ObjectId","a");insensitive.Add("argument0","b");
    bool alias=false;try{EncodeRoot(1,"Runtime.callFunctionOn","s","before",insensitive);}catch(System.InvalidOperationException){alias=true;}Need(alias,"smoke-field-name");
    foreach(object bad in new object[]{null,7,"","bad\\nhandle"}) {
      fields.Clear();fields.Add("objectId","original");fields.Add("argument0",bad);bool refused=false;
      try{EncodeRoot(1,"Runtime.callFunctionOn","s","before",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-field-type");
    }
  }
}
// END GENERATED WORKER STARTUP EMPTY209 PROTOCOL`;
}
