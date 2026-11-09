/** Closed Wire lexical codebook. Only remote handles vary; native custody
 * supplies the original holder and checkpoint argument strings. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as REQUESTS, currentSchematicWireLexicalCases, currentSchematicWireLexicalTemplate } from "./current-schematic-wire-lexical-protocol.ts";

import { CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS as INTENT } from "./current-schematic-wire-intent-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentSchematicWireLexicalOwnerSource(): string {
  return `public sealed partial class EasyedaDiagnosticOwner {
// BEGIN GENERATED SCHEMATIC WIRE LEXICAL FIELDS
int schematicWireLexicalNormal,schematicWireLexicalCleanup,schematicWireIntentNormal,schematicWireIntentCleanup;
public void SendSchematicWireLexical(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicWireEdit209||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[5])throw Error("schematic-wire-lexical-original-holder");bool cleanup=phase=="wire-lexical-release";if(cleanup?schematicWireLexicalCleanup>=${String(REQUESTS.cleanup)}:schematicWireLexicalNormal>=${String(REQUESTS.normal)})throw Error("schematic-wire-lexical-budget");string encoded=EasyedaSchematicWireLexicalProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)schematicWireLexicalCleanup++;else schematicWireLexicalNormal++;SendMessage(id,encoded);}
public void SendSchematicWireIntent(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicWireEdit209||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[5])throw Error("schematic-wire-intent-original-holder");bool cleanup=phase=="wire-intent-release";if(cleanup?schematicWireIntentCleanup>=${String(INTENT.cleanup)}:schematicWireIntentNormal>=${String(INTENT.normal)})throw Error("schematic-wire-intent-budget");string encoded=EasyedaSchematicWireIntentProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)schematicWireIntentCleanup++;else schematicWireIntentNormal++;SendMessage(id,encoded);}
// END GENERATED SCHEMATIC WIRE LEXICAL FIELDS
}`;
}
export function currentSchematicWireLexicalNativeSource(): string {
  const cases = currentSchematicWireLexicalCases().map(command => currentSchematicWireLexicalTemplate(command));
  const rows = cases.map(row => [row.phase, row.method, Object.entries(row.fields).map(([name, kind]) => `${name}:${kind}`).join(","), row.template].join("\t"));
  const raw = Buffer.from(rows.join("\0")); if (raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_LEXICAL_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only fixed rows retain the shared64KiB decoder and original raw/gzip hashes.
  const packed = gzipSync(raw, { level: 9 });
  const hashes = cases.map(row => {
    const text = row.template.replaceAll(/"__schematic_wirelexical_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => {
      const bound: Record<string, string> = { boundHolder: "original_holder", boundTarget: "{}", boundOperation: "{}" }; return JSON.stringify(bound[name] ?? "original_ref");
    });
    return createHash("sha256").update(`{"id":83,${text.slice(1, -1)},"sessionId":"original_ui"}\0`).digest("hex");
  });
  return `public static class EasyedaSchematicWireLexicalProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-wire-lexical-codec");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(createHash("sha256").update(raw).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
public static string Encode(int id,string session,string holder,string target,string operation,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicRelevanceDisplayModifyEntryProtocol.EncodeBound(id,session,holder,null,target,operation,phase,method,fields,Cases,"wirelexical",false,Need);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Cases.Length;index++){var row=Cases[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string field in row[2].Split(','))fields.Add(field.Split(':')[0],"original_ref");string message=Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("callerCode","caller");bool refused=false;try{Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
