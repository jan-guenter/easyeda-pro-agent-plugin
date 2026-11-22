/** Private native encoding for the encoder checkpoint's existing reads.
 * A future owner must bind the original session, script and each remote handle. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET as PEER_BUDGET, currentSchematicWireEncoderComparison,
  currentSchematicWireEncoderMetadataCommand, currentSchematicWireEncoderSourceCommand, validateCurrentSchematicWireEncoderCommand,
} from "./current-schematic-wire-encoder-protocol.ts";

const sourceRequests = 1;
const totalRequests = sourceRequests + PEER_BUDGET.normal;
const wireBytes = 16_384;
const argNames = Object.freeze(Array.from({ length: 2 + 4 * PEER_BUDGET.peers }, (_, index) => `arg${String(index)}ObjectId`));

export const CURRENT_SCHEMATIC_WIRE_ENCODER_NATIVE_BUDGET = Object.freeze({
  source: sourceRequests, metadata: PEER_BUDGET.metadata, membership: PEER_BUDGET.membership, total: totalRequests,
});

interface CurrentSchematicWireEncoderNativeRequest {
  readonly phase: "wire-encoder-source" | "wire-encoder-metadata" | "wire-encoder-compare";
  readonly method: "Debugger.getScriptSource" | "Runtime.getProperties" | "Runtime.callFunctionOn";
  readonly fields: Readonly<Record<string, string>>;
}

/** Project only the fields that the native row can vary. In particular,
 * dropping the compare role must never turn a return proposal into membership. */
export function currentSchematicWireEncoderNativeRequest(input: unknown): CurrentSchematicWireEncoderNativeRequest {
  const command = validateCurrentSchematicWireEncoderCommand(input);
  const { phase, method } = command;
  if (phase === "wire-encoder-source") {
    return Object.freeze({ phase, method, fields: Object.freeze({ scriptId: command.params.scriptId }) });
  }
  if (phase === "wire-encoder-metadata") {
    return Object.freeze({ phase, method, fields: Object.freeze({ objectId: command.params.objectId }) });
  }
  if (phase === "wire-encoder-compare" && command.role === "membership") {
    const fields = Object.fromEntries(argNames.map((name, index) => {
      const argument = command.params.arguments[index];
      if (argument === undefined) { throw new Error("WIRE_ENCODER_NATIVE_ARGUMENT"); }
      return [name, argument.objectId];
    }));
    return Object.freeze({ phase, method, fields: Object.freeze({ objectId: command.params.objectId, ...fields }) });
  }
  throw new Error("WIRE_ENCODER_NATIVE_PHASE");
}

const field = (name: string): string => `__wire_encoder_${name}__`;
const slot = /"__wire_encoder_([A-Za-z0-9]+)__"/gu;
const sha256 = (bytes: string | Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

function frame(template: string, id: number, session: string, handle: (name: string) => string): string {
  const body = template.replaceAll(slot, (_match: string, name: string) => JSON.stringify(handle(name)));
  return `{"id":${String(id)},${body.slice(1, -1)},"sessionId":${JSON.stringify(session)}}\0`;
}

/** Emit one independent C#5 table and a finite request cursor. This emitter
 * supplies no owner, dispatcher, event reader, application call or authority. */
export function currentSchematicWireEncoderNativeSource(): string {
  const examples = [
    currentSchematicWireEncoderSourceCommand(field("scriptId")),
    currentSchematicWireEncoderMetadataCommand(field("objectId")),
    currentSchematicWireEncoderComparison("membership", field("objectId"), argNames.map(name => field(name))),
  ];
  const maximumHandle = "x".repeat(256);
  const records = examples.map(command => {
    const { phase, method, fields } = currentSchematicWireEncoderNativeRequest(command);
    const template = JSON.stringify({ method, params: command.params });
    if (Buffer.byteLength(frame(template, 2_147_483_647, maximumHandle, () => maximumHandle)) > wireBytes) {
      throw new Error("WIRE_ENCODER_NATIVE_WIRE_BOUND");
    }
    return { template, row: [phase, method, Object.keys(fields).join(","), template].join("\t") };
  });
  const raw = Buffer.from(records.map(({ row }) => row).join("\0"));
  if (raw.length > 65_536) { throw new Error("WIRE_ENCODER_NATIVE_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- The immutable build-time table uses the shared bounded native decoder.
  const packed = gzipSync(raw, { level: 9 });
  const smokeHandle = field("arg0ObjectId");
  const hashes = records.map(({ template }, index) => sha256(frame(template,
    index === 2 ? 80 + PEER_BUDGET.metadata : 79 + index, "session29",
    name => name === "scriptId" ? "script27" : smokeHandle)));
  const table = `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(raw.length)},"${sha256(raw)}","${sha256(packed)}",3,4)`;
  return String.raw`internal sealed class EasyedaSchematicWireEncoderCheckpointProtocol {
  const int SourceRequests = ${String(sourceRequests)};
  const int MetadataRequests = ${String(PEER_BUDGET.metadata)};
  const int TotalRequests = ${String(totalRequests)};
  static readonly string[][] Rows = ${table};
  static readonly System.Text.RegularExpressions.Regex HandlePattern = new System.Text.RegularExpressions.Regex(@"\A[A-Za-z0-9_.:-]{1,256}\z", System.Text.RegularExpressions.RegexOptions.CultureInvariant);
  static readonly System.Text.RegularExpressions.Regex SlotPattern = new System.Text.RegularExpressions.Regex(@"""__wire_encoder_([A-Za-z0-9]+)__""", System.Text.RegularExpressions.RegexOptions.CultureInvariant);
  readonly object gate = new object();
  readonly string session;
  readonly string script;
  int issued;
  int previous;

  internal EasyedaSchematicWireEncoderCheckpointProtocol(string session, string script) {
    this.session = RequireHandle(session);
    this.script = RequireHandle(script);
  }

  static void Need(bool value) {
    if (!value) throw new System.InvalidOperationException("wire-encoder-checkpoint-codec");
  }

  static string RequireHandle(object input) {
    string value = input as string;
    Need(value != null && value.Length <= 256 && HandlePattern.IsMatch(value));
    return value;
  }

  internal string Encode(int id, string phase, string method, System.Collections.IDictionary fields) {
    lock (gate) {
      Need(id > previous && issued < TotalRequests && fields != null);
      int lane = issued < SourceRequests ? 0 : issued < SourceRequests + MetadataRequests ? 1 : 2;
      string[] row = Rows[lane];
      Need(row[0] == phase && row[1] == method);
      string[] names = row[2].Split(',');
      Need(fields.Count == names.Length);
      var values = new System.Collections.Generic.Dictionary<string, string>(System.StringComparer.Ordinal);
      foreach (object key in fields.Keys) {
        string name = key as string;
        Need(name != null && System.Array.IndexOf(names, name) >= 0 && !values.ContainsKey(name));
        values.Add(name, RequireHandle(fields[key]));
      }
      Need(values.Count == names.Length && (lane != 0 || values["scriptId"] == script));
      // Substitution visits only slots in the original template, never an inserted handle.
      string body = SlotPattern.Replace(row[3], match => "\"" + values[match.Groups[1].Value] + "\"");
      string message = "{\"id\":" + id.ToString(System.Globalization.CultureInfo.InvariantCulture) + "," +
        body.Substring(1, body.Length - 2) + ",\"sessionId\":\"" + session + "\"}\0";
      Need(System.Text.Encoding.UTF8.GetByteCount(message) <= ${String(wireBytes)});
      previous = id;
      issued++;
      return message;
    }
  }

  static System.Collections.Hashtable SmokeFields(int lane, string value) {
    var fields = new System.Collections.Hashtable(System.StringComparer.Ordinal);
    foreach (string name in Rows[lane][2].Split(',')) fields.Add(name, value);
    return fields;
  }

  static void Refuse(System.Action attempt) {
    bool refused = false;
    try { attempt(); } catch (System.InvalidOperationException) { refused = true; }
    Need(refused);
  }

  internal static void VerifySmoke() {
    string[] hashes = ${currentPcbDiagnosticNativeHashVector(hashes)};
    var cursor = new EasyedaSchematicWireEncoderCheckpointProtocol("session29", "script27");
    var source = SmokeFields(0, "script27");
    var metadata = SmokeFields(1, "${smokeHandle}");
    var membership = SmokeFields(2, "${smokeHandle}");
    Refuse(() => cursor.Encode(79, Rows[1][0], Rows[1][1], metadata));
    Refuse(() => cursor.Encode(79, Rows[0][0], Rows[0][1], SmokeFields(0, "foreign")));
    string first = cursor.Encode(79, Rows[0][0], Rows[0][1], source);
    Refuse(() => cursor.Encode(80, Rows[0][0], Rows[0][1], source));
    Refuse(() => cursor.Encode(79, Rows[1][0], Rows[1][1], metadata));
    Refuse(() => cursor.Encode(80, Rows[1][0], "Runtime.evaluate", metadata));
    Refuse(() => cursor.Encode(80, Rows[1][0], Rows[1][1], new System.Collections.Hashtable { { "ObjectId", "original" } }));
    Refuse(() => cursor.Encode(80, Rows[1][0], Rows[1][1], SmokeFields(1, new string('x', 257))));
    Refuse(() => cursor.Encode(80, Rows[2][0], Rows[2][1], membership));
    string descriptor = cursor.Encode(80, Rows[1][0], Rows[1][1], metadata);
    for (int offset = 1; offset < MetadataRequests; offset++) cursor.Encode(80 + offset, Rows[1][0], Rows[1][1], metadata);
    int last = 80 + MetadataRequests;
    Refuse(() => cursor.Encode(last, Rows[1][0], Rows[1][1], metadata));
    membership.Add("callerCode", "foreign");
    Refuse(() => cursor.Encode(last, Rows[2][0], Rows[2][1], membership));
    membership.Remove("callerCode");
    string comparison = cursor.Encode(last, Rows[2][0], Rows[2][1], membership);
    Refuse(() => cursor.Encode(last + 1, Rows[2][0], Rows[2][1], membership));
    string[] messages = { first, descriptor, comparison };
    using (var sha = System.Security.Cryptography.SHA256.Create()) {
      for (int index = 0; index < messages.Length; index++) {
        byte[] digest = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(messages[index]));
        Need(System.BitConverter.ToString(digest).Replace("-", "").ToLowerInvariant() == hashes[index]);
      }
    }
  }
}
`;
}
