/** Schematic build-only sharing of the three original bound-holder encoders.
 * Tables, golden vectors and per-owner senders remain in their original classes;
 * other native purposes retain the original standalone encoder bytes. */
import { createHash } from "node:crypto";
import { currentSchematicDisplayAccessorNativeSource } from "./current-schematic-display-accessor-native.ts";
import { currentSchematicDisplayActionNativeSource } from "./current-schematic-display-action-native.ts";
import { currentSchematicRelevanceDisplayModifyEntryNativeSource } from "./current-schematic-relevance-display-modify-entry-native.ts";

const CLASS = "EasyedaSchematicRelevanceDisplayModifyEntryProtocol";
const shared = String.raw`static string Json(string value,System.Action<bool> Need){Need(value!=null);var output=new System.Text.StringBuilder("\"");foreach(char c in value){if(c=='"')output.Append("\\\"");else if(c=='\\')output.Append("\\\\");else if(c=='\b')output.Append("\\b");else if(c=='\f')output.Append("\\f");else if(c=='\n')output.Append("\\n");else if(c=='\r')output.Append("\\r");else if(c=='\t')output.Append("\\t");else if(c<32)output.Append("\\u"+((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));else output.Append(c);}return output.Append('"').ToString();}
static string Field(string kind,object input,System.Action<bool> Need){string value=input as string;Need(value!=null);Need(System.Text.RegularExpressions.Regex.IsMatch(value,kind=="field"?@"\A(?:rotation|fontFamily|fontSize|fontWeight|italic|underline|hAlign|vAlign)\z":@"\A[A-Za-z0-9_.:-]{1,256}\z"));return value;}
internal static string EncodeBound(int id,string session,string holder,string idle,string target,string operation,string phase,string method,System.Collections.IDictionary fields,string[][] Cases,string marker,bool hasIdle,System.Action<bool> Need){Need(id>0&&fields!=null&&target!=null&&operation!=null&&target.Length<=16384&&operation.Length<=16384);Field("handle",session,Need);Field("handle",holder,Need);if(hasIdle)Field("handle",idle,Need);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var kinds=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string pair in names){var parts=pair.Split(':');Need(parts.Length==2&&fields.Contains(parts[0]));kinds.Add(parts[0],parts[1]);}string template=row[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\"__schematic_"+marker+"_([A-Za-z0-9]+)__\"")){output.Append(template,previous,match.Index-previous);string name=match.Groups[1].Value;string value;if(hasIdle&&name=="boundIdle")value=idle;else if(name=="boundHolder")value=holder;else if(name=="boundTarget")value=target;else if(name=="boundOperation")value=operation;else{Need(kinds.ContainsKey(name));value=Field(kinds[name],fields[name],Need);}output.Append(Json(value,Need));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();string encoded="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\"sessionId\":"+Json(session,Need)+"}\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
`;
const profiles = [
  { source: currentSchematicDisplayAccessorNativeSource, marker: "accessor", idle: false, sha256: "d859e3328b7d87b2ed324cfd4df62559f7baa71ce04ba2540afe9d1449f1e3e5" },
  { source: currentSchematicDisplayActionNativeSource, marker: "action", idle: false, sha256: "f8639b391ea8c21ae6d33aec88acd76d2730c2a966c99105ed1ae4a2500a610d" },
  { source: currentSchematicRelevanceDisplayModifyEntryNativeSource, marker: "entry", idle: true, sha256: "1d86ddaf821f8d226a323ff2cb690e1c355075c019523141209b028484078366" }
] as const;
/** Fail closed on drift, partial application or duplicate generated classes.
 * This transformation changes no caller-selected programs or runtime grants. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_BOUND_HOLDER_CODEC"); } }
/** Replace only the pinned JSON/field/encode implementation. Each original
 * public signature, Need error, table and complete golden smoke is retained. */
function replacement(profile: typeof profiles[number]): Readonly<{ original: string; factored: string }> {
  const original = profile.source(); const from = original.indexOf("static string Json("), to = original.indexOf("public static void VerifySmoke()");
  need(from !== -1 && to > from && original.split("static string Json(").length === 2 && original.split("public static void VerifySmoke()").length === 2);
  const body = original.slice(from, to); need(createHash("sha256").update(body).digest("hex") === profile.sha256);
  const signature = profile.idle ? "string holder,string idle" : "string holder";
  const call = `public static string Encode(int id,string session,${signature},string target,string operation,string phase,string method,System.Collections.IDictionary fields){return ${CLASS}.EncodeBound(id,session,holder,${profile.idle ? "idle" : "null"},target,operation,phase,method,fields,Cases,"${profile.marker}",${String(profile.idle)},Need);}`;
  const factored = `${original.slice(0, from)}${profile.idle ? shared : ""}${call}\n${original.slice(to)}`;
  return { original, factored };
}
/** Apply sharing only after the schematic purpose has generated all three
 * original classes. A mixed or substituted family refuses before packing. */
export function factorCurrentSchematicBoundHolderCodecs(input: string): string {
  const rows = profiles.map(profile => replacement(profile)); let current = 0, old = 0;
  for (const row of rows) { if (input.includes(row.original)) { need(input.split(row.original).length === 2); old += 1; } if (input.includes(row.factored)) { need(input.split(row.factored).length === 2); current += 1; } }
  need(old === rows.length && current === 0 || old === 0 && current === rows.length);
  if (current === rows.length) { return input; }
  let result = input; for (const row of rows) { result = result.replace(row.original, row.factored); }
  need(Buffer.byteLength(result) < Buffer.byteLength(input)); return result;
}
