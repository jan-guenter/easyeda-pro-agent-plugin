/** Finite Wire-only bound-holder table. It shares the fixed encoder code,
 * retaining its own programs, field roster, smoke hashes and native counters. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as REQUESTS, currentSchematicWireAccessorCases, currentSchematicWireAccessorTemplate } from "./current-schematic-wire-accessor-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Independently delimited owner fields and all their references. The field
 * emitter checks this exact region, separate from its original155 entries. */
export function currentSchematicWireAccessorOwnerSource(): string {
  return `// BEGIN GENERATED SCHEMATIC WIRE ACCESSOR FIELDS
int schematicWireAccessorNormal,schematicWireAccessorCleanup;
public void SendSchematicWireAccessor(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicWireEdit209||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[5])throw Error("schematic-wire-accessor-original-holder");bool cleanup=phase=="wire-accessor-release";if(cleanup?schematicWireAccessorCleanup>=${String(REQUESTS.cleanup)}:schematicWireAccessorNormal>=${String(REQUESTS.normal)})throw Error("schematic-wire-accessor-budget");string encoded=EasyedaSchematicWireAccessorProtocol.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)schematicWireAccessorCleanup++;else schematicWireAccessorNormal++;SendMessage(id,encoded);}
// END GENERATED SCHEMATIC WIRE ACCESSOR FIELDS`;
}
/** Emit the finite accessor codec with a 64 KiB decoded-table bound and both
 * content hashes. Smoke rows verify bound-holder encoding and reject caller code. */
export function currentSchematicWireAccessorNativeSource(): string {
  const cases = currentSchematicWireAccessorCases().map(command => currentSchematicWireAccessorTemplate(command));
  const rows = cases.map(row => [row.phase, row.method, Object.entries(row.fields).map(([name, kind]) => `${name}:${kind}`).join(","), row.template].join("\t"));
  const raw = Buffer.from(rows.join("\0")); if (raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_ACCESSOR_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only immutable rows use the existing64KiB decoder and exact raw/gzip hashes.
  const packed = gzipSync(raw, { level: 9 });
  const hashes = cases.map(row => {
    const text = row.template.replaceAll(/"__schematic_wireaccessor_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => {
      const values: Record<string, string> = { boundHolder: "original_holder", boundTarget: "{}", boundOperation: "{}" };
      return JSON.stringify(values[name] ?? "original_ref");
    });
    return createHash("sha256").update(`{"id":83,${text.slice(1, -1)},"sessionId":"original_ui"}\0`).digest("hex");
  });
  return `public static class EasyedaSchematicWireAccessorProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-wire-accessor-codec");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(createHash("sha256").update(raw).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
public static string Encode(int id,string session,string holder,string target,string operation,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicRelevanceDisplayModifyEntryProtocol.EncodeBound(id,session,holder,null,target,operation,phase,method,fields,Cases,"wireaccessor",false,Need);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Cases.Length;index++){var row=Cases[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string field in row[2].Split(','))fields.Add(field.Split(':')[0],"original_ref");string message=Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("functionDeclaration","caller");bool refused=false;try{Encode(83,"original_ui","original_holder","{}","{}",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
