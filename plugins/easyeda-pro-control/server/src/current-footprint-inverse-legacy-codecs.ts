/** Inverse-only build sharing of exact original pure packet encoders. Each
 * original table, Field/Need guard, public signature and golden smoke remains;
 * no sender, ledger, phase, flag or runtime configuration is added. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_LEGACY_CODEC_PROFILES = freezeDeep([
  {
    "className": "EasyedaFootprintCopyUiProtocol",
    "method": "Encode",
    "bytes": 1422,
    "sha256": "c8593639244fef653fc6c12254ba74e622e5ab6ccf817b19d36d66e205965972",
    "signature": "public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Session(id,phase,method,originalParentSession,fields,Cases,\"copyui\",16384,Field,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintCopyManagerRouteProtocol",
    "method": "Encode",
    "bytes": 1427,
    "sha256": "a552dc377a62b1021eee82cc10ed3e791756dece11d0814329ce59615178dd6e",
    "signature": "public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Session(id,phase,method,originalParentSession,fields,Cases,\"copymanager\",16384,Field,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintCopyTransactionClockProtocol",
    "method": "Encode",
    "bytes": 1424,
    "sha256": "ac80980cb52e303fa0b9696fbd2d84d8e56c19a7e262053badb0cf66022c6154",
    "signature": "public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Session(id,phase,method,originalWorkerSession,fields,Cases,\"copyclock\",8192,Field,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintCopyExecutionWorkerProtocol",
    "method": "Encode",
    "bytes": 1426,
    "sha256": "795c8a4acd8f2c41d4392f6c8949a17dc76baf2bd8d30f4a9de2691d7e6cd3f4",
    "signature": "public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Session(id,phase,method,originalWorkerSession,fields,Cases,\"copyworker\",16384,Field,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintCopyClockRegistrationProtocol",
    "method": "Encode",
    "bytes": 1432,
    "sha256": "38a1eeeafca3b7696b483537f33934cfb6a39191d9f2ad6f1d8e7ece9a4e1cc3",
    "signature": "public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Session(id,phase,method,originalParentSession,fields,Cases,\"copyregistration\",16384,Field,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaPcbViaMainBeginProtocol",
    "method": "Encode",
    "bytes": 729,
    "sha256": "a58d70fe6b9885837ba034196add8c85aaeab919d763d0053bf84fab67e5adeb",
    "signature": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Root(id,phase,method,fields,Cases,\"via_begin\",Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaPcbViaMainHistoryProtocol",
    "method": "Encode",
    "bytes": 733,
    "sha256": "33a86cbde5ee2e8be9c4ae7e6c213e7518af5a40ce8107cd8f4f846ad68db287",
    "signature": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Root(id,phase,method,fields,Cases,\"via_history\",Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaPcbViaMainLiveHistoryProtocol",
    "method": "Encode",
    "bytes": 727,
    "sha256": "a300da9bd44cb65f63fad3dae8ab4ed3fe2a1d3e25fccdd937c6cedeec8034ff",
    "signature": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Root(id,phase,method,fields,Cases,\"via_live\",Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintInverseMainHistoryProtocol",
    "method": "Encode",
    "bytes": 741,
    "sha256": "985afc35d20806a3512395e91996ca8ffd9f634cc60bb742813ddbbe50d6e697",
    "signature": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Root(id,phase,method,fields,Cases,\"inverse_history\",Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaProjectStructureTransportProtocol",
    "method": "Encode",
    "bytes": 1125,
    "sha256": "5900f4d418d9f5d945837066476a0bfe1ef28c54d09f3e7bfe7caa3709c6d83f",
    "signature": "public static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Context(id,session,context,phase,method,fields,Cases,\"project_structure_transport\",Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaProjectSaveProducerProtocol",
    "method": "Encode",
    "bytes": 1119,
    "sha256": "1d7d8584ab3cd79a4b7ab62fe25033da7490f7b4dfa2ecc355dabfd05727e214",
    "signature": "public static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields)",
    "wrapper": "public static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields){return EasyedaInverseLegacyCodec.Context(id,session,context,phase,method,fields,Cases,\"project_save_producer\",Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintCopyMainRequestProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaProjectStructureMainProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaSelectedFileMainSqlFenceProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaPcbViaMainStructureProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaGeneratedInitialCacheProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaGeneratedInitialSyncProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintInverseInitialCacheProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "internal"
  },
  {
    "className": "EasyedaFootprintInverseInitialSyncProtocol",
    "method": "Quote",
    "bytes": 664,
    "sha256": "694f029181794e034192a115b74af4b5b9df08197ad98c69f2a6a4db037c2294",
    "signature": "static string Quote(string value)",
    "wrapper": "static string Quote(string value){return EasyedaInverseLegacyCodec.Quote(value,Need);}",
    "visibility": "internal"
  },
  {
    "className": "EasyedaPcbViaMainBeginProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "7a8894eb3d2feaa32e976fda110dc06a161199f48c2f5fe7d18c84944e983e2e",
    "signature": "static string Handle(object value)",
    "wrapper": "static string Handle(object value){return EasyedaInverseLegacyCodec.Handle(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaPcbViaMainHistoryProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "7a8894eb3d2feaa32e976fda110dc06a161199f48c2f5fe7d18c84944e983e2e",
    "signature": "static string Handle(object value)",
    "wrapper": "static string Handle(object value){return EasyedaInverseLegacyCodec.Handle(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaPcbViaMainLiveHistoryProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "7a8894eb3d2feaa32e976fda110dc06a161199f48c2f5fe7d18c84944e983e2e",
    "signature": "static string Handle(object value)",
    "wrapper": "static string Handle(object value){return EasyedaInverseLegacyCodec.Handle(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaFootprintInverseMainHistoryProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "7a8894eb3d2feaa32e976fda110dc06a161199f48c2f5fe7d18c84944e983e2e",
    "signature": "static string Handle(object value)",
    "wrapper": "static string Handle(object value){return EasyedaInverseLegacyCodec.Handle(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaProjectSyncQuiesceProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "7a8894eb3d2feaa32e976fda110dc06a161199f48c2f5fe7d18c84944e983e2e",
    "signature": "static string Handle(object value)",
    "wrapper": "static string Handle(object value){return EasyedaInverseLegacyCodec.Handle(value,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaProjectLibraryRefreshProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "7a8894eb3d2feaa32e976fda110dc06a161199f48c2f5fe7d18c84944e983e2e",
    "signature": "static string Handle(object value)",
    "wrapper": "static string Handle(object value){return EasyedaInverseLegacyCodec.Handle(value,Need);}",
    "visibility": "internal"
  },
  {
    "className": "EasyedaProjectStructureTransportProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "10faae49f6b824d635f59eb7a9b675de00b0746f70294584d43c8c1664012772",
    "signature": "static string Handle(object input)",
    "wrapper": "static string Handle(object input){return EasyedaInverseLegacyCodec.Handle(input,Need);}",
    "visibility": "public"
  },
  {
    "className": "EasyedaProjectSaveProducerProtocol",
    "method": "Handle",
    "bytes": 175,
    "sha256": "10faae49f6b824d635f59eb7a9b675de00b0746f70294584d43c8c1664012772",
    "signature": "static string Handle(object input)",
    "wrapper": "static string Handle(object input){return EasyedaInverseLegacyCodec.Handle(input,Need);}",
    "visibility": "public"
  }
] as const);
const helper = String.raw`// BEGIN FIXED INVERSE LEGACY CODECS V1
internal static class EasyedaInverseLegacyCodec{
internal static string Session(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields,string[][] Cases,string marker,int maximum,System.Func<string,object,string> Field,System.Action<bool> Need){Need(id>0&&fields!=null);string session=Field("sessionId",originalParentSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\"__"+marker+"_([A-Za-z0-9]+)__\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=maximum);return "{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\0";}
internal static string Root(int id,string phase,string method,System.Collections.IDictionary fields,string[][] Cases,string marker,System.Action<bool> Need){Need(id>0&&fields!=null);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);string text=row[3];foreach(string name in names){Need(fields.Contains(name));text=text.Replace("__"+marker+"_"+name+"__",Handle(fields[name],Need));}Need(!text.Contains("__"+marker+"_"));string result="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+"}\0";Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536);return result;}
internal static string Context(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields,string[][] Cases,string marker,System.Action<bool> Need){
Need(id>0&&fields!=null);Handle(session,Need);Handle(context,Need);string[] row=null;foreach(var candidate in Cases)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var replacements=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);replacements.Add("boundContext",context);foreach(string name in names){Need(fields.Contains(name));replacements.Add(name,Handle(fields[name],Need));}
string text=System.Text.RegularExpressions.Regex.Replace(row[3],"__"+marker+"_([A-Za-z0-9]+)__",match=>{string value;Need(replacements.TryGetValue(match.Groups[1].Value,out value));return value;});string encoded="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\"sessionId\":\""+session+"\"}\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
internal static string Quote(string value,System.Action<bool> Need){var b=new System.Text.StringBuilder();b.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));b.Append(c);b.Append(value[++i]);}else{Need(!char.IsLowSurrogate(c));if(c=='"'||c=='\\'){b.Append('\\');b.Append(c);}else if(c=='\b')b.Append("\\b");else if(c=='\t')b.Append("\\t");else if(c=='\n')b.Append("\\n");else if(c=='\f')b.Append("\\f");else if(c=='\r')b.Append("\\r");else if(c<32){b.Append("\\u");b.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else b.Append(c);}}b.Append('"');return b.ToString();}
internal static string Handle(object value,System.Action<bool> Need){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\A[A-Za-z0-9_.:-]{1,256}\z"));return text;}
}
// END FIXED INVERSE LEGACY CODECS V1
`;
const helperName = "EasyedaInverseLegacyCodec";
const begin = "// BEGIN FIXED INVERSE LEGACY CODECS V1";
const end = "// END FIXED INVERSE LEGACY CODECS V1";
const profiles = CURRENT_FOOTPRINT_INVERSE_LEGACY_CODEC_PROFILES;
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_FIXED_LEGACY_CODECS"); } }
need(profiles.length === 27 && new Set(profiles.map(row => `${row.className}:${row.method}`)).size === 27);
need(createHash("sha256").update(JSON.stringify(profiles)).digest("hex") === "7d166374003fe335df5b6d80d63669cd1b98bbbfc204e3fbb258d866788bc872");
need(Buffer.byteLength(helper) === 4553 && createHash("sha256").update(helper).digest("hex") === "a96bbbe926449d504f3318934aedb2670ec44843586c07dd0b98434e1816b1cf");
interface Span { readonly start: number; readonly end: number; readonly text: string }
type Token = ReturnType<typeof tokenize>[number];
/** Locate one complete brace-delimited body with strings/comments already
 * separated by the maintained C# lexer. Unterminated or ambiguous input refuses. */
function close(tokens: readonly Token[], from: number): number { need(tokens[from]?.text === "{"); let depth = 1; for (let index = from + 1; index < tokens.length; index += 1) { const text = tokens[index]?.text; if (text === "{") { depth += 1; } else if (text === "}") { depth -= 1; if (depth === 0) { return index; } } } throw new Error("INVERSE_FIXED_LEGACY_CODECS_BODY"); }
/** Select only this immutable catalogue's one class-level string method.
 * Local calls, overloads, foreign classes and changed bodies cannot match. */
function method(source: string, active: readonly Token[], selected: typeof profiles[number]): Span { const classes: number[] = []; for (let index = 0; index < active.length; index += 1) { if (active[index]?.text === "class" && active[index + 1]?.kind === "identifier" && active[index + 1]?.text === selected.className) { classes.push(index); } } need(classes.length === 1); const index = classes[0]; need(index !== undefined && active[index - 1]?.text === "static" && active[index - 2]?.text === selected.visibility); let level = 0; for (const token of active.slice(0, index)) { if (token.text === "{") { level += 1; } else if (token.text === "}") { level -= 1; } } need(level === 0); let open = index + 2; while (active[open] !== undefined && active[open]?.text !== "{") { open += 1; } const last = close(active, open); let depth = 1; const found: Span[] = [];
  for (let cursor = open + 1; cursor < last; cursor += 1) { const token = active[cursor]; need(token !== undefined); if (depth === 1 && token.kind === "identifier" && token.text === selected.method && active[cursor - 1]?.text === "string" && active[cursor + 1]?.text === "(") { let from = cursor - 2; while (["public", "private", "internal", "static"].includes(active[from - 1]?.text ?? "")) { from -= 1; } let body = cursor + 2; while (active[body] !== undefined && active[body]?.text !== "{") { body += 1; } const until = close(active, body); const start = active[from]?.start; const finish = active[until]?.end; need(start !== undefined && finish !== undefined && until < last); found.push({ start, end: finish, text: source.slice(start, finish) }); cursor = until; } else if (token.text === "{") { depth += 1; } else if (token.text === "}") { depth -= 1; } }
  need(found.length === 1); const original = found[0]; need(original !== undefined); return original;
}
/** Replace only all27 hash-pinned methods and one exact helper block. Warm
 * regeneration may recreate original classes beside the old exact helper;
 * every individual body must still be its own original or canonical wrapper.
 * All bytes outside those closed spans are retained verbatim. */
export function factorCurrentFootprintInverseLegacyCodecs(input: string): string { const hasHelper = input.includes(begin) || input.includes(end); let source = input; if (hasHelper) { need(input.split(begin).length === 2 && input.split(end).length === 2 && input.split(helper).length === 2); source = input.replace(helper, ""); }
  const active = tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment"); const spans: Readonly<{ span: Span; wrapper: string }>[] = []; let current = 0;
  for (const profile of profiles) { const span = method(source, active, profile); if (span.text === profile.wrapper) { current += 1; } else { need(Buffer.byteLength(span.text) === profile.bytes && span.text.startsWith(profile.signature) && createHash("sha256").update(span.text).digest("hex") === profile.sha256); } spans.push({ span, wrapper: profile.wrapper }); }
  need((current === 0 || hasHelper) && active.filter(token => token.kind === "identifier" && token.text.replace(/^@/u, "") === helperName).length === current);
  let result = source; for (const row of spans.toSorted((left, right) => right.span.start - left.span.start)) { result = result.slice(0, row.span.start) + row.wrapper + result.slice(row.span.end); }
  const anchor = "public static class EasyedaFootprintCopyUiProtocol"; need(result.split(anchor).length === 2); result = result.replace(anchor, helper + anchor); need(Buffer.byteLength(result) < Buffer.byteLength(input) || hasHelper); return result;
}
