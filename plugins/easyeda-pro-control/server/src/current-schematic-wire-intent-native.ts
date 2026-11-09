/** Closed Wire intent codebook. Only remote handles vary; native custody
 * supplies the original holder and checkpoint argument strings. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentSchematicWireIntentCases, currentSchematicWireIntentTemplate } from "./current-schematic-wire-intent-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentSchematicWireIntentNativeSource(): string {
  const cases = currentSchematicWireIntentCases().map(command => currentSchematicWireIntentTemplate(command));
  const rows = cases.map(row => [row.phase, row.method, Object.entries(row.fields).map(([name, kind]) => `${name}:${kind}`).join(","), row.template].join("\t"));
  const raw = Buffer.from(rows.join("\0")); if (raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_INTENT_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only fixed rows retain the shared64KiB decoder and original raw/gzip hashes.
  const packed = gzipSync(raw, { level: 9 });
  const hashes = cases.map(row => {
    const text = row.template.replaceAll(/"__schematic_wireintent_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => {
      const bound: Record<string, string> = { boundHolder: "original_holder", boundTarget: "{}", boundOperation: "{}" }; return JSON.stringify(bound[name] ?? "original_ref");
    });
    return createHash("sha256").update(`{"id":83,${text.slice(1, -1)},"sessionId":"original_ui"}\0`).digest("hex");
  });
  return `public static class EasyedaSchematicWireIntentProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-wire-intent-codec");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(createHash("sha256").update(raw).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
public static string Encode(int id,string session,string holder,string target,string operation,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicRelevanceDisplayModifyEntryProtocol.EncodeBound(id,session,holder,null,target,operation,phase,method,fields,Cases,"wireintent",false,Need);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Cases.Length;index++){var row=Cases[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string field in row[2].Split(','))fields.Add(field.Split(':')[0],"original_ref");string message=Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("callerCode","caller");bool refused=false;try{Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
