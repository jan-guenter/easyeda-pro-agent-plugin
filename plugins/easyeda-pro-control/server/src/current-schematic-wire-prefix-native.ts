/** Wire-only readonly encoder over source-equivalent fixed prefix programs.
 * The shared encoder is inert. No Relevance owner field, grant, counter or
 * continuation participates, and every control phase remains unencodable. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GROUP as SHARED_GROUP } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_PREFIX_GROUP as GROUP, currentSchematicWirePrefixCases, currentSchematicWirePrefixTemplate } from "./current-schematic-wire-prefix-protocol.ts";

const hash = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Emit the separate Wire codec and complete readonly smoke vectors. */
export function currentSchematicWirePrefixNativeSource(): string {
  const cases = currentSchematicWirePrefixCases(); const rows = cases.map(command => { const fixed = currentSchematicWirePrefixTemplate(command); return [fixed.phase, fixed.method, fixed.names.join(",")].join("\t"); });
  const raw = Buffer.from(rows.join("\0")); if (raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_PREFIX_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only rows preserve the existing bounded fixed-table decoder and both hashes.
  const packed = gzipSync(raw, { level: 9 });
  const hashes = cases.map(command => {
    const params = { ...command.params }; if ("objectId" in params) { params.objectId = "original_ref"; } if ("callFrameId" in params) { params.callFrameId = "original_ref"; } if ("scriptId" in params) { params.scriptId = "original_ref"; }
    if ("arguments" in params) { params.arguments = params.arguments.map(() => ({ objectId: "original_ref" })); }
    return hash(`${JSON.stringify({ id: 83, method: command.method, params, sessionId: "original_ui" })}\0`);
  });
  const oldField = `${JSON.stringify("objectGroup")}:${JSON.stringify(SHARED_GROUP)}`; const newField = `${JSON.stringify("objectGroup")}:${JSON.stringify(GROUP)}`;
  return `public static class EasyedaSchematicWirePrefixV2Protocol{
static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-wire-prefix-v2-codec");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(rows.length)},3);
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(phase!=null&&phase.StartsWith("wire-prefix-",System.StringComparison.Ordinal));string text=EasyedaSchematicRelevanceRunPrefixProtocol.Encode(id,session,phase.Substring(5),method,fields);string oldField=${quote(oldField)},newField=${quote(newField)};int count=text.Split(new[]{oldField},System.StringSplitOptions.None).Length-1;Need(count==((method=="Runtime.callFunctionOn"||method=="Debugger.evaluateOnCallFrame")?1:0));return text.Replace(oldField,newField);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Rows.Length;index++){string[] row=Rows[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"original_ref");string text=Encode(83,"original_ui",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[index]);}foreach(string phase in new[]{"wire-prefix-resume-run","prefix-frame-run-0","wire-prefix-arm-first-start","wire-prefix-remove-first-start"}){bool refused=false;try{Encode(83,"original_ui",phase,"Debugger.resume",new System.Collections.Hashtable());}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
