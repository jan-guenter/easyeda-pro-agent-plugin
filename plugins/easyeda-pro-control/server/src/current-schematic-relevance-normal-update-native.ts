/** Fixed partial-step codec. Its one resume row needs a separately completed
 * original native readiness guard and an original controller reservation. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UPDATE_CALLS as CALLS } from "./current-schematic-relevance-normal-update-protocol.ts";
import { currentSchematicRelevanceNormalUpdateCases, currentSchematicRelevanceNormalUpdateTemplate } from "./current-schematic-relevance-normal-update-wire.ts";

const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function table(name: string, rows: readonly (readonly string[])[], columns: number): string {
  const raw = Buffer.from(rows.map(row => row.join("\t")).join("\0"));
  if (raw.length > 65_536) { throw new Error("SCHEMATIC_NORMAL_UPDATE_FIXED_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- These immutable in-memory tables retain both original and packed hashes under the existing decoder cap.
  const packed = gzipSync(raw, { level: 9 });
  return `static readonly string[][] ${name}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(hash(raw))},${quote(hash(packed))},${String(rows.length)},${String(columns)});`;
}
export function currentSchematicRelevanceNormalUpdateNativeSource(): string {
  const cases = currentSchematicRelevanceNormalUpdateCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceNormalUpdateTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  const programs = CALLS.map((row, index) => [String(index), JSON.stringify(row[1])]);
  const hashes = cases.map(command => hash(Buffer.from(`${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`)));
  return [
    `public static class EasyedaSchematicRelevanceNormalUpdateProtocol{`,
    `static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-normal-update-codec");}`,
    table("Rows", rows, 4),
    table("Programs", programs, 2),
    `public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicUiFixedCodec.Encode(id,session,phase,method,fields,Rows,Programs,"normalupdate",Need);}`,
    `public static void VerifySmoke(){EasyedaSchematicUiFixedCodec.VerifySmoke(Rows,${currentPcbDiagnosticNativeHashVector(hashes)},Encode,Need);}`,
    `}`,
  ].join("");
}
