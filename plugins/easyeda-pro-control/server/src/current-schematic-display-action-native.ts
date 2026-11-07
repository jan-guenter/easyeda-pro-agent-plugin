/** Finite original-holder metadata encoder. The native owner substitutes its
 * retained page holder and exact target data; no caller program is accepted. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentSchematicDisplayActionTemplates } from "./current-schematic-display-action-wire.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const json = String.raw`static string Json(string value){Need(value!=null);var output=new System.Text.StringBuilder("\"");foreach(char c in value){if(c=='"')output.Append("\\\"");else if(c=='\\')output.Append("\\\\");else if(c=='\b')output.Append("\\b");else if(c=='\f')output.Append("\\f");else if(c=='\n')output.Append("\\n");else if(c=='\r')output.Append("\\r");else if(c=='\t')output.Append("\\t");else if(c<32)output.Append("\\u"+((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));else output.Append(c);}return output.Append('"').ToString();}`;
export function currentSchematicDisplayActionNativeSource(): string {
  const cases = currentSchematicDisplayActionTemplates();
  const rows = cases.map(row => [row.phase, row.method, Object.entries(row.fields).map(([name, kind]) => `${name}:${kind}`).join(","), row.template].join("\t"));
  const bytes = Buffer.from(rows.join("\0")); if (bytes.length > 60_000) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Fixed in-memory templates are packed deterministically under the unchanged64KiB native decoder bound.
  const packed = gzipSync(bytes, { level: 9 });
  const smokeTarget = JSON.stringify({ path: String.raw`C:\Synthetic`, value: "雪" });
  const smokeOperation = JSON.stringify({ fontFamily: "__schematic_action_objectId__", literal: "quote\"\n" });
  const hashes = cases.map(row => {
    const text = row.template.replaceAll(/"__schematic_action_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => {
      if (name === "boundHolder") { return JSON.stringify("original_holder"); } if (name === "boundTarget") { return JSON.stringify(smokeTarget); } if (name === "boundOperation") { return JSON.stringify(smokeOperation); }
      return JSON.stringify("action_handle");
    });
    return createHash("sha256").update(`{"id":73,${text.slice(1, -1)},"sessionId":"original_ui"}\0`).digest("hex");
  });
  return `public static class EasyedaSchematicDisplayActionProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-schematic-action-protocol");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(createHash("sha256").update(bytes).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
${json}
static string Field(string kind,object input){string value=input as string;Need(value!=null);Need(System.Text.RegularExpressions.Regex.IsMatch(value,kind=="field"?@"\\A(?:rotation|fontFamily|fontSize|fontWeight|italic|underline|hAlign|vAlign)\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Encode(int id,string session,string holder,string target,string operation,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null&&target!=null&&operation!=null&&target.Length<=16384&&operation.Length<=16384);Field("handle",session);Field("handle",holder);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var kinds=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string pair in names){var parts=pair.Split(':');Need(parts.Length==2&&fields.Contains(parts[0]));kinds.Add(parts[0],parts[1]);}string template=row[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__schematic_action_([A-Za-z0-9]+)__\\"")){output.Append(template,previous,match.Index-previous);string name=match.Groups[1].Value;string value;if(name=="boundHolder")value=holder;else if(name=="boundTarget")value=target;else if(name=="boundOperation")value=operation;else{Need(kinds.ContainsKey(name));value=Field(kinds[name],fields[name]);}output.Append(Json(value));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Json(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){var row=Cases[i];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string pair in row[2].Split(',')){var parts=pair.Split(':');fields.Add(parts[0],"action_handle");}string encoded=Encode(73,"original_ui","original_holder",System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(${quote(Buffer.from(smokeTarget).toString("base64"))})),System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(${quote(Buffer.from(smokeOperation).toString("base64"))})),row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);fields.Add("functionDeclaration","caller");bool refused=false;try{Encode(73,"original_ui","original_holder","{}","{}",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
