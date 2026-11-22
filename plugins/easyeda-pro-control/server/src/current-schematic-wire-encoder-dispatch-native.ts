/** Build-only late sender for the separate combined Wire owner. It reuses
 * the fourteen checkpoint rows and keeps the legacy V5 helper pinned. */
import { createHash } from "node:crypto";
import { CURRENT_SCHEMATIC_PRIVATE_FIELDS } from "./current-schematic-private-fields.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_DISPATCH_BUDGET as BUDGET } from "./current-schematic-wire-encoder-dispatch.ts";
import { currentSchematicWireEncoderFixedDispatch as fixed } from "./current-schematic-wire-encoder-dispatch-protocol.ts";
import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_NATIVE_BUDGET as CHECKPOINT, currentSchematicWireEncoderNativeSource,
} from "./current-schematic-wire-encoder-native.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM as PROGRAM } from "./current-schematic-wire-encoder-programs.ts";
import {
  currentSchematicWireEncoderComparison, currentSchematicWireEncoderMetadataCommand, currentSchematicWireEncoderSourceCommand,
} from "./current-schematic-wire-encoder-protocol.ts";
import { currentSchematicWireV5TitleTemplate } from "./current-schematic-wire-v5-title-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS } from "./current-schematic-wire-writer-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_V5_ENCODER_NATIVE_LIMITS = Object.freeze({
  requests: BUDGET.requests, polls: BUDGET.polls, controls: BUDGET.requests + BUDGET.polls + 1,
});

const peerCount = CHECKPOINT.metadata / 2;
const holder = "fixture.holder";
const reflection = "fixture.reflection";
const session = "fixture.session";
const script = "fixture.bundle";
const frameMaximum = 16_384;

function replaceOne(source: string, from: string, to: string): string {
  if (source.split(from).length !== 2) { throw new Error("WIRE_V5_ENCODER_NATIVE_PREIMAGE"); }
  return source.replace(from, to);
}
const slot = /"__wire_encoder_([A-Za-z0-9]+)__"/gu;
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha = (value: string): string => createHash("sha256").update(value).digest("hex");
const field = (name: string): string => `__wire_encoder_${name}__`;
const scalarFields = (native: Readonly<Record<string, string | number>>): [string, string | number][] =>
  Object.entries(native).filter(([name]) => name !== "action" && name !== "requestId" && name !== "phase" && name !== "method");

function graph(objectId: string, native: string): unknown {
  return { phase: "wire-encoder-before-graph", method: "Runtime.callFunctionOn", params: {
    ...FLAGS, objectId, functionDeclaration: PROGRAM, arguments: [{ objectId: native }],
    returnByValue: false, awaitPromise: false, userGesture: false,
  } };
}
function properties(objectId: string): unknown {
  return { ...currentSchematicWireEncoderMetadataCommand(objectId), phase: "wire-encoder-before-graph-properties" };
}
function helper(scriptId: string): unknown {
  return { phase: "wire-encoder-helper-source", method: "Debugger.getScriptSource", params: { scriptId } };
}
function browserFrame(command: ReturnType<typeof fixed>["wire"]): string {
  const { id, method, params, sessionId } = command;
  return `${JSON.stringify({ id, method, params, sessionId })}\0`;
}

function rendererMaximum(input: unknown): number {
  const maximumHandle = "x".repeat(256);
  const { method, params } = fixed(input, 2_147_483_647, maximumHandle).wire;
  const template = JSON.stringify({ id: 2_147_483_647, method, params, sessionId: maximumHandle });
  const length = Buffer.byteLength(`${template.replaceAll(slot, () => JSON.stringify(maximumHandle))}\0`);
  if (length > frameMaximum) { throw new Error("WIRE_V5_ENCODER_NATIVE_FRAME_BOUND"); }
  return length;
}
function smokeInputs(): readonly unknown[] {
  const peers = Array.from({ length: peerCount }, (_, index) => {
    const prefix = `fixture.peer${String(index)}`;
    return { row: `${prefix}.row`, model: `${prefix}.model`, proto: `${prefix}.proto`, upload: `${prefix}.upload` };
  });
  return [
    graph(holder, reflection), helper("fixture.graph.script"), properties("fixture.graph.tuple"),
    currentSchematicWireEncoderSourceCommand(script),
    ...peers.flatMap(({ row, upload }) => [currentSchematicWireEncoderMetadataCommand(row), currentSchematicWireEncoderMetadataCommand(upload)]),
    currentSchematicWireEncoderComparison("membership", holder, [reflection, "fixture.graph", ...peers.flatMap(({ row, model, proto, upload }) => [row, model, proto, upload])]),
    helper("fixture.membership.script"),
  ];
}

/** Use the exact existing private names only when stitching into the V6
 * review. The standalone fragment has ordinary C# field names for scrutiny. */
export function currentSchematicWireV5EncoderNativeSource(): string {
  const extras = [graph(field("objectId"), field("arg0ObjectId")), helper(field("scriptId")), properties(field("objectId"))];
  const rows = extras.map(input => {
    const { wire, native } = fixed(input, 1, session), { phase, method, params } = wire;
    const fields = scalarFields(native).map(([name]) => name);
    return `new string[]{${[phase, method, fields.join(","), JSON.stringify({ method, params })].map(value => quote(value)).join(",")}}`;
  });
  const peerExamples = [
    currentSchematicWireEncoderSourceCommand(field("scriptId")),
    currentSchematicWireEncoderMetadataCommand(field("objectId")),
    currentSchematicWireEncoderComparison("membership", field("objectId"),
      Array.from({ length: 2 + 4 * peerCount }, (_, index) => field(`arg${String(index)}ObjectId`))),
  ];
  const all = [...extras, extras[1], ...peerExamples, ...Array.from({ length: CHECKPOINT.metadata - 1 }, () => peerExamples[1])];
  const bytes = all.reduce<number>((total, input) => total + rendererMaximum(input), 0);
  const smoke = smokeInputs().map((input, index) => fixed(input, 79 + index, session));
  if (smoke.length !== BUDGET.requests || all.length !== BUDGET.requests) { throw new Error("WIRE_V5_ENCODER_NATIVE_ROSTER"); }
  const smokeCases = smoke.map(({ wire, native }) => {
    const fields = scalarFields(native).map(([key, value]) => `{${quote(key)},${quote(String(value))}}`);
    const frame = browserFrame(wire);
    return `    Check(${String(wire.id)},${quote(wire.phase)},${quote(wire.method)},new System.Collections.Hashtable(System.StringComparer.Ordinal){${fields.join(",")}},${String(Buffer.byteLength(frame))},${quote(sha(frame))},sender);`;
  }).join("\n");
  const bundleSelector = currentSchematicWireV5TitleTemplate({
    phase: "wire-v5-title-bundle-source", method: "Debugger.getScriptSource", params: { scriptId: script },
  }).selector;
  return currentSchematicWireEncoderNativeSource() + String.raw`
internal sealed class EasyedaWireV5EncoderSender {
  internal const int Requests = __REQUESTS__;
  private const int Peers = __PEERS__, BundleStep = 3, MetadataStart = 4, MembershipStep = MetadataStart + 2 * Peers;
  private const int ByteLimit = __BYTES__;
  private static readonly string[][] Extra = { __ROWS__ };
  private static readonly System.Text.RegularExpressions.Regex Handle =
    new System.Text.RegularExpressions.Regex(@"\A[A-Za-z0-9_.:-]{1,256}\z", System.Text.RegularExpressions.RegexOptions.CultureInvariant);
  private static readonly System.Text.RegularExpressions.Regex Slot =
    new System.Text.RegularExpressions.Regex(@"""__wire_encoder_([A-Za-z0-9]+)__""", System.Text.RegularExpressions.RegexOptions.CultureInvariant);
  private readonly EasyedaSchematicWireEncoderCheckpointProtocol checkpoint;
  private readonly string session, holder, reflection, script, bus;
  private readonly string[] metadata = new string[2 * Peers];
  private string graphScript, graphTuple;
  private int step, previous, bytes;
  internal EasyedaWireV5EncoderSender(string session, string holder, string reflection, string script, string bus) {
    this.session = Reference(session);
    this.holder = Reference(holder);
    this.reflection = Reference(reflection);
    this.script = Reference(script);
    this.bus = Reference(bus);
    Need(this.script != this.bus && this.holder != this.reflection, "original");
    checkpoint = new EasyedaSchematicWireEncoderCheckpointProtocol(session, script);
  }
  internal bool Finished { get { return step == Requests; } }
  internal bool LastWasBundle { get { return step == BundleStep + 1; } }
  private static void Need(bool ok, string code) {
    if (!ok) throw new System.InvalidOperationException("wire-v5-encoder-native-" + code);
  }
  internal static string Reference(object value) {
    string handle = value as string;
    Need(handle != null && Handle.IsMatch(handle), "handle");
    return handle;
  }
  private static string Argument(int index) {
    return "arg" + index.ToString(System.Globalization.CultureInfo.InvariantCulture) + "ObjectId";
  }
  private string EncodeExtra(int index, int id, string phase, string method, System.Collections.IDictionary fields) {
    string[] row = Extra[index], names = row[2].Split(',');
    Need(phase == row[0] && method == row[1] && fields.Count == names.Length, "extra-fields");
    var values = new System.Collections.Generic.Dictionary<string, string>(System.StringComparer.Ordinal);
    foreach (System.Collections.DictionaryEntry entry in fields) {
      string key = entry.Key as string;
      Need(key != null && System.Array.IndexOf(names, key) >= 0 && !values.ContainsKey(key), "extra-field");
      values.Add(key, Reference(entry.Value));
    }
    string body = Slot.Replace(row[3], match => "\"" + values[match.Groups[1].Value] + "\"");
    return "{\"id\":" + id.ToString(System.Globalization.CultureInfo.InvariantCulture) + "," +
      body.Substring(1, body.Length - 2) + ",\"sessionId\":\"" + session + "\"}\0";
  }
  internal string Reserve(int id, string selected, string phase, string method, System.Collections.IDictionary fields) {
    Need(selected == session && fields != null && id > 0 && (previous == 0 || id == (long)previous + 1) && !Finished, "slot");
    string text, retained = null;
    if (step == 0) {
      Need(Reference(fields["objectId"]) == holder && Reference(fields["arg0ObjectId"]) == reflection, "original-holder");
      text = EncodeExtra(0, id, phase, method, fields);
    } else if (step == 1 || step == Requests - 1) {
      retained = Reference(fields["scriptId"]);
      Need(retained != script && retained != bus && retained != graphScript, "helper-script");
      text = EncodeExtra(1, id, phase, method, fields);
    } else if (step == 2) {
      retained = Reference(fields["objectId"]);
      Need(retained != holder && retained != reflection, "graph-tuple");
      text = EncodeExtra(2, id, phase, method, fields);
    } else {
      if (step >= MetadataStart && step < MembershipStep) {
        retained = Reference(fields["objectId"]);
        int offset = step - MetadataStart;
        Need(retained != holder && retained != reflection && retained != graphTuple, "metadata-object");
        if (offset % 2 == 0) {
          for (int i = 0; i < offset; i += 2) Need(metadata[i] != retained, "row-once");
        }
      } else if (step == MembershipStep) {
        Need(Reference(fields["objectId"]) == holder && Reference(fields["arg0ObjectId"]) == reflection, "membership-holder");
        string graph = Reference(fields["arg1ObjectId"]);
        Need(graph != holder && graph != reflection && graph != graphTuple, "membership-graph");
        for (int i = 0; i < Peers; i++) {
          Need(Reference(fields[Argument(2 + 4 * i)]) == metadata[2 * i] &&
            Reference(fields[Argument(5 + 4 * i)]) == metadata[2 * i + 1], "membership-peer");
        }
      }
      text = checkpoint.Encode(id, phase, method, fields);
    }
    int length = System.Text.Encoding.UTF8.GetByteCount(text);
    Need(length <= __FRAME_MAX__ && bytes + length <= ByteLimit, "bytes");
    if (step == 1) graphScript = retained;
    if (step == 2) graphTuple = retained;
    if (step >= MetadataStart && step < MembershipStep) metadata[step - MetadataStart] = retained;
    previous = id;
    bytes += length;
    step++;
    return text;
  }
  private static void Check(int id, string phase, string method, System.Collections.IDictionary fields, int length, string expected, EasyedaWireV5EncoderSender sender) {
    if (phase == "wire-encoder-helper-source") {
      var foreign = new System.Collections.Hashtable(fields, System.StringComparer.Ordinal);
      foreign["scriptId"] = "fixture.bundle";
      Refuse(() => sender.Reserve(id, "fixture.session", phase, method, foreign));
    } else if (phase == "wire-encoder-compare") {
      var foreign = new System.Collections.Hashtable(fields, System.StringComparer.Ordinal);
      foreign["arg5ObjectId"] = "foreign.function";
      Refuse(() => sender.Reserve(id, "fixture.session", phase, method, foreign));
    }
    string text = sender.Reserve(id, "fixture.session", phase, method, fields);
    byte[] bytes = System.Text.Encoding.UTF8.GetBytes(text);
    Need(bytes.Length == length, "smoke-length");
    using (var sha = System.Security.Cryptography.SHA256.Create()) {
      string actual = System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-", "").ToLowerInvariant();
      Need(actual == expected, "smoke-frame");
    }
  }
  private static void Refuse(System.Action attempt) {
    bool refused = false;
    try { attempt(); } catch (System.InvalidOperationException) { refused = true; }
    Need(refused, "smoke-refusal");
  }
  internal static void VerifySmoke() {
    var sender = new EasyedaWireV5EncoderSender("fixture.session", "fixture.holder", "fixture.reflection", "fixture.bundle", "fixture.bus");
    var binder = new System.Collections.Hashtable { {"objectId", "foreign"}, {"arg0ObjectId", "fixture.reflection"} };
    Refuse(() => sender.Reserve(79, "fixture.session", "wire-encoder-before-graph", "Runtime.callFunctionOn", binder));
    binder["objectId"] = "fixture.holder";
    Refuse(() => sender.Reserve(79, "foreign.session", "wire-encoder-before-graph", "Runtime.callFunctionOn", binder));
    Refuse(() => sender.Reserve(79, "fixture.session", "wire-encoder-before-graph", "Runtime.evaluate", binder));
__SMOKE__
    Need(sender.Finished, "smoke-complete");
    Refuse(() => sender.Reserve(97, "fixture.session", "wire-encoder-before-graph", "Runtime.callFunctionOn", binder));
  }
}
public sealed partial class EasyedaDiagnosticOwner {
  private EasyedaWireV5EncoderSender wireV5Encoder;
  private string wireV5EncoderReflection, wireV5EncoderScript, wireV5EncoderBus;
  private bool wireV5EncoderFinished, wireV5EncoderFailed;
  private int wireV5EncoderControls, wireV5EncoderPolls, wireV5EncoderReadPolls;
  private void RetainWireV5EncoderGlobals(string phase, System.Collections.IDictionary fields) {
    if (!wireWriterV6 || phase != "wire-globals-check") return;
    if (wireV5Encoder != null && !wireV5EncoderFinished) throw Error("wire-v5-encoder-native-owned");
    string reflection = EasyedaWireV5EncoderSender.Reference(fields["reference1"]);
    if (wireV5EncoderReflection != null && wireV5EncoderReflection != reflection) throw Error("wire-v5-encoder-native-reflection");
    wireV5EncoderReflection = reflection;
  }
  private void RetainWireV5EncoderTitle(int selector, System.Collections.IDictionary fields) {
    if (!wireWriterV6) return;
    if (wireV5Encoder != null && !wireV5EncoderFinished) throw Error("wire-v5-encoder-native-owned");
    if (wireV5TitleReads > 2) return;
    if (selector != __BUNDLE_SELECTOR__) throw Error("wire-v5-encoder-native-title-source");
    string script = EasyedaWireV5EncoderSender.Reference(fields["scriptId"]);
    if (wireV5TitleReads == 1) wireV5EncoderScript = script;
    else {
      if (wireV5EncoderScript == null || wireV5EncoderScript == script) throw Error("wire-v5-encoder-native-title-bus");
      wireV5EncoderBus = script;
    }
  }
  private void RequireWireV5Encoder() {
    if (!wireWriterV6 || wireV5EncoderFailed || wireV5EncoderFinished ||
        !wireGlobalsReady || wireGlobalsHelperPending || wireV5TitleReads < 2 ||
        wireV5ContinuityChecks != 2 * wireV5TitleReads || wireV5EncoderReflection == null ||
        wireV5EncoderScript == null || wireV5EncoderBus == null) throw Error("wire-v5-encoder-native-owner");
    RequireWireGlobals();
    if (++wireV5EncoderControls > __CONTROLS__) throw Error("wire-v5-encoder-native-control-budget");
  }
  private void FailWireV5Encoder() { wireV5EncoderFailed = true; wireGlobalsFailed = true; }
  public void SendWireV5Encoder(int id, string phase, string method, System.Collections.IDictionary fields) {
    try {
      RequireWireV5Encoder();
      if (id != nextRequest || id > EffectiveRequestLimit) throw Error("wire-v5-encoder-native-request-id");
      if (wireV5Encoder != null && wireV5EncoderReadPolls == 0) throw Error("wire-v5-encoder-native-read-poll");
      if (wireV5Encoder == null) wireV5Encoder = new EasyedaWireV5EncoderSender(
        schematicDisplaySession, schematicDisplayTuple, wireV5EncoderReflection, wireV5EncoderScript, wireV5EncoderBus);
      string encoded = wireV5Encoder.Reserve(id, schematicDisplaySession, phase, method, fields);
      wireV5EncoderReadPolls = 0;
      SendMessage(id, encoded);
    } catch { if (wireWriterV6) FailWireV5Encoder(); throw; }
  }
  public bool AdmitWireV5EncoderPoll() {
    if (!wireWriterV6 || wireV5Encoder == null || wireV5EncoderFinished || wireV5EncoderFailed) return false;
    try {
      RequireWireV5Encoder();
      int readLimit = wireV5Encoder.LastWasBundle ? __SOURCE_POLLS__ : __NORMAL_POLLS__;
      if (++wireV5EncoderPolls > __POLLS__ || ++wireV5EncoderReadPolls > readLimit) throw Error("wire-v5-encoder-native-poll-budget");
      return true;
    } catch { FailWireV5Encoder(); throw; }
  }
  public void CompleteWireV5Encoder() {
    try {
      RequireWireV5Encoder();
      if (wireV5Encoder == null || !wireV5Encoder.Finished || wireV5EncoderReadPolls == 0) throw Error("wire-v5-encoder-native-complete");
      wireV5EncoderFinished = true;
    } catch { if (wireWriterV6) FailWireV5Encoder(); throw; }
  }
  public static void VerifyWireV5EncoderSmoke() { EasyedaWireV5EncoderSender.VerifySmoke(); }
}
`.replace("__REQUESTS__", String(BUDGET.requests)).replace("__PEERS__", String(peerCount))
    .replace("__BYTES__", String(bytes)).replace("__ROWS__", rows.join(","))
    .replace("__FRAME_MAX__", String(frameMaximum)).replace("__SMOKE__", smokeCases)
    .replace("__BUNDLE_SELECTOR__", String(bundleSelector)).replace("__CONTROLS__", String(CURRENT_SCHEMATIC_WIRE_V5_ENCODER_NATIVE_LIMITS.controls))
    .replace("__SOURCE_POLLS__", String(BUDGET.sourcePolls)).replace("__NORMAL_POLLS__", String(BUDGET.normalPolls))
    .replace("__POLLS__", String(BUDGET.polls));
}

/** The combined build supplies the verified V5/early derivative and alone
 * introduces wireWriterV6. The two original V5 writes still use their codec. */
export function currentSchematicWireV5EncoderNativePreimage(review: string): string {
  const holderField = CURRENT_SCHEMATIC_PRIVATE_FIELDS.find(row => row.field === "schematicDisplayTuple")?.emitted;
  const sessionField = CURRENT_SCHEMATIC_PRIVATE_FIELDS.find(row => row.field === "schematicDisplaySession")?.emitted;
  if (holderField === undefined || sessionField === undefined) { throw new Error("WIRE_V5_ENCODER_NATIVE_PREIMAGE"); }
  if (review.includes("EasyedaWireV5EncoderSender")) { throw new Error("WIRE_V5_ENCODER_NATIVE_PREIMAGE"); }
  const globals = 'if(method=="Runtime.callFunctionOn")wireGlobalsHelperPending=true;}try{SendMessage(id,encoded);';
  const withGlobals = replaceOne(review, globals,
    globals.replace("try{SendMessage", "try{RetainWireV5EncoderGlobals(phase,fields);SendMessage"));
  const title = "wireV5TitleReads++;try{SendMessage(id,encoded);}catch{wireGlobalsFailed=true;throw;}";
  const withTitle = replaceOne(withGlobals, title,
    title.replace("try{SendMessage", "try{RetainWireV5EncoderTitle(selector,fields);SendMessage"));
  const fragment = currentSchematicWireV5EncoderNativeSource()
    .replaceAll("schematicDisplayTuple", holderField).replaceAll("schematicDisplaySession", sessionField);
  return `${withTitle}\n${fragment}`;
}
export function currentSchematicWireV5EncoderNativeDispatch(): string {
  return String.raw`        'schematic-wire-v5-encoder' {
          if (-not $launched -or $request.action -cne 'schematic-wire-v5-encoder' -or
              $request.phase -isnot [string]) {throw 'wire-v5-encoder-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','phase')
          if ($request.phase -ceq 'complete') {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($baseFields | Sort-Object) -join ',')) {throw 'wire-v5-encoder-complete-fields'}
            $owner.CompleteWireV5Encoder()
          } else {
            if ($request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'wire-v5-encoder-fields'}
            $baseFields+=@('requestId','method')
            $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
            foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'wire-v5-encoder-field'}}
            foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
            $owner.SendWireV5Encoder([int]$request.requestId,$request.phase,$request.method,$fields)
          }
          $result=@{written=$true}
        }
`;
}
