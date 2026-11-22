/** Generate the standalone V5 observer table for an eventual retained owner.
 * This fragment has no sender, process actions or changes to the pinned helper. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_SCHEMATIC_WIRE_V5_NET_REQUESTS as LIMIT, currentSchematicWireV5NetSelectors } from "./current-schematic-wire-v5-net-protocol.ts";

const tableSize = 65_536;
const rowLimit = 256;
const tableCount = 16;
function sha256(data: Uint8Array): string { return createHash("sha256").update(data).digest("hex"); }

function tables(): readonly string[] {
  const groups: string[][] = [[]];
  let size = 0;
  for (const row of currentSchematicWireV5NetSelectors()) {
    const record = [row.lane, row.kind, row.method, row.names.join(","), row.template].join("\t");
    const recordSize = Buffer.byteLength(record);
    if (recordSize > tableSize) { throw new Error("WIRE_V5_NET_TABLE_ROW"); }
    const current = groups.at(-1);
    if (current === undefined) { throw new Error("WIRE_V5_NET_TABLE_GROUP"); }
    if (current.length === rowLimit || size + recordSize + Number(current.length > 0) > tableSize) {
      groups.push([record]);
      size = recordSize;
    } else {
      current.push(record);
      size += recordSize + Number(current.length > 1);
    }
  }
  if (groups.length > tableCount) { throw new Error("WIRE_V5_NET_TABLE_COUNT"); }
  return groups.map(group => {
    const source = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- These bounded immutable inputs are generated outside the owner lifecycle.
    const packed = gzipSync(source, { level: 9 });
    if (packed.length > tableSize) { throw new Error("WIRE_V5_NET_PACKED_SIZE"); }
    return `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}", ${source.length}, "${sha256(source)}", "${sha256(packed)}", ${group.length}, 5)`;
  });
}

export function currentSchematicWireV5NetNativeSource(): string {
  const groups = tables();
  const kinds = Object.keys(LIMIT.watch).map(name => JSON.stringify(name)).join(", ");
  const watch = Object.values(LIMIT.watch).join(", ");
  const geometry = Object.values(LIMIT.geometry).join(", ");
  const rows = currentSchematicWireV5NetSelectors().length;
  return String.raw`internal sealed class EasyedaWireV5NetProtocol {
  private static readonly string[][][] Tables = { ${groups.join(",\n    ")} };
  private static readonly string[] Kinds = { ${kinds} };
  private static readonly System.Text.RegularExpressions.Regex Handle = new System.Text.RegularExpressions.Regex(@"\A[A-Za-z0-9_.:-]{1,256}\z");
  private readonly int[,] left = { { ${watch} }, { ${geometry} } };
  private readonly string originalSession;
  private int previousId;

  internal EasyedaWireV5NetProtocol(string originalSession) {
    if (originalSession == null || !Handle.IsMatch(originalSession))
      throw new System.InvalidOperationException("wire-v5-net-native-session");
    this.originalSession = originalSession;
  }

  private static string[] Row(int selector) {
    foreach (string[][] table in Tables) {
      if (selector < table.Length) return table[selector];
      selector -= table.Length;
    }
    throw new System.InvalidOperationException("wire-v5-net-native-selector");
  }

  internal string Encode(int id, string session, string lane, string kind, int selector, string method, System.Collections.IDictionary fields) {
    if (id <= previousId || id > ${LIMIT.prospectiveRendererIdLimit} || selector < 0 || selector >= ${rows} || session != originalSession || fields == null)
      throw new System.InvalidOperationException("wire-v5-net-native-envelope");

    string[] row = Row(selector);
    if (row[0] != lane || row[1] != kind || row[2] != method)
      throw new System.InvalidOperationException("wire-v5-net-native-command");
    string[] names = row[3].Length == 0 ? new string[0] : row[3].Split(',');
    if (fields.Count != names.Length) throw new System.InvalidOperationException("wire-v5-net-native-fields");
    foreach (System.Collections.DictionaryEntry entry in fields) {
      string key = entry.Key as string;
      if (key == null || System.Array.IndexOf(names, key) < 0)
        throw new System.InvalidOperationException("wire-v5-net-native-field-name");
    }

    string text = row[4];
    foreach (string name in names) {
      string value = fields[name] as string;
      if (value == null || !Handle.IsMatch(value)) throw new System.InvalidOperationException("wire-v5-net-native-handle");
      text = text.Replace("\"@wire_v5_net_" + name + "@\"", EasyedaDiagnosticOwner.WireGlobalsQuote(value));
    }
    string encoded = "{\"id\":" + id.ToString(System.Globalization.CultureInfo.InvariantCulture) + "," +
        text.Substring(1, text.Length - 2) + ",\"sessionId\":" + EasyedaDiagnosticOwner.WireGlobalsQuote(session) + "}\0";
    if (System.Text.Encoding.UTF8.GetByteCount(encoded) > ${tableSize})
      throw new System.InvalidOperationException("wire-v5-net-native-size");
    int scope = lane == "watch" ? 0 : 1;
    int column = System.Array.IndexOf(Kinds, kind);
    if (column < 0 || left[scope, column] < 1)
      throw new System.InvalidOperationException("wire-v5-net-native-budget");
    left[scope, column]--;
    previousId = id;
    return encoded;
  }
}
`;
}
