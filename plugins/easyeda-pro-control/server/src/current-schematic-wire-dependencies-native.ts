/** Closed Wire dependency codebook. Only remote handles vary; native custody
 * supplies the original holder and checkpoint argument strings. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_REQUESTS as REQUESTS, currentSchematicWireDependencyCases, currentSchematicWireDependencyTemplate } from "./current-schematic-wire-dependencies-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Separate counters consume this finite readonly lane without changing the
 * historical aggregate reservation or any released native counter. */
export function currentSchematicWireDependencyOwnerSource(): string {
  return `public sealed partial class EasyedaDiagnosticOwner {
// BEGIN GENERATED SCHEMATIC WIRE DEPENDENCY FIELDS
int schematicWireDependencyNormal,schematicWireDependencyCleanup;
public void SendSchematicWireDependency(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicWireEdit209||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[5])throw Error("schematic-wire-dependency-original-holder");bool cleanup=phase=="wire-dependency-release";if(cleanup?schematicWireDependencyCleanup>=${String(REQUESTS.cleanup)}:schematicWireDependencyNormal>=${String(REQUESTS.normal)})throw Error("schematic-wire-dependency-budget");string encoded=EasyedaSchematicWireDependencyProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)schematicWireDependencyCleanup++;else schematicWireDependencyNormal++;SendMessage(id,encoded);}
// END GENERATED SCHEMATIC WIRE DEPENDENCY FIELDS
}`;
}
/** Emit the finite dependency codec with original holder/JSON binding, a 64 KiB
 * table bound and raw/packed hashes. Smoke rows reject extra caller programs. */
export function currentSchematicWireDependencyNativeSource(): string {
  const cases = currentSchematicWireDependencyCases().map(command => currentSchematicWireDependencyTemplate(command));
  const rows = cases.map(row => [row.phase, row.method, Object.entries(row.fields).map(([name, kind]) => `${name}:${kind}`).join(","), row.template].join("\t"));
  const raw = Buffer.from(rows.join("\0")); if (raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_DEPENDENCY_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only fixed rows retain the shared64KiB decoder and original raw/gzip hashes.
  const packed = gzipSync(raw, { level: 9 });
  const hashes = cases.map(row => {
    const text = row.template.replaceAll(/"__schematic_wiredependency_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => {
      const bound: Record<string, string> = { boundHolder: "original_holder", boundTarget: "{}", boundOperation: "{}" }; return JSON.stringify(bound[name] ?? "original_ref");
    });
    return createHash("sha256").update(`{"id":83,${text.slice(1, -1)},"sessionId":"original_ui"}\0`).digest("hex");
  });
  return `public static class EasyedaSchematicWireDependencyProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-wire-dependency-codec");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(createHash("sha256").update(raw).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
public static string Encode(int id,string session,string holder,string target,string operation,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicRelevanceDisplayModifyEntryProtocol.EncodeBound(id,session,holder,null,target,operation,phase,method,fields,Cases,"wiredependency",false,Need);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Cases.Length;index++){var row=Cases[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string field in row[2].Split(','))fields.Add(field.Split(':')[0],"original_ref");string message=Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("callerCode","caller");bool refused=false;try{Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
