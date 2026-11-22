/** Build-only native fragment for a separately selected early/encoder helper.
 * Its sender uses the existing owner handle and fixed renderer writer. */
import { createHash } from "node:crypto";
import { CURRENT_SCHEMATIC_PRIVATE_FIELDS } from "./current-schematic-private-fields.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_IDENTITY } from "./current-schematic-wire-writer-v5-native-identity.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE } from "./current-schematic-wire-writer-v5-native-profile.ts";
import { currentSchematicWireNetBirthSite as siteFor } from "./current-schematic-wire-net-birth-source.ts";
import { CURRENT_SCHEMATIC_WIRE_V5_EARLY_INIT_PROFILE as PROFILE } from "./current-schematic-wire-v5-early-init.ts";

const { renderer, polling } = PROFILE;
const requests = renderer.arm + renderer.source + renderer.remove + renderer.resume;
const polls = ((requests - renderer.source) * polling.ordinaryMilliseconds + renderer.source * polling.sourceMilliseconds) / polling.emptyMilliseconds;
export const CURRENT_SCHEMATIC_WIRE_V5_EARLY_INIT_NATIVE_LIMITS = Object.freeze({
  requests, polls, controls: requests + polls,
});

export function currentSchematicWireV5EarlyInitNativeSource(): string {
  const sites = [siteFor(0), siteFor(1)];
  const lines = sites.map(site => site.lineNumber).join(", ");
  const columns = sites.map(site => site.columnNumber).join(", ");
  const urls = sites.map(site => JSON.stringify(site.url)).join(", ");
  const ids = sites.map(site => JSON.stringify(site.breakpointId)).join(", ");
  return String.raw`internal sealed class EasyedaWireV5EarlyInitSender {
  private static readonly int[] Lines = { __LINES__ };
  private static readonly int[] Columns = { __COLUMNS__ };
  private static readonly string[] Urls = { __URLS__ };
  private static readonly string[] Breakpoints = { __IDS__ };
  private static readonly System.Text.RegularExpressions.Regex Handle =
    new System.Text.RegularExpressions.Regex(@"\A[A-Za-z0-9_.:-]{1,256}\z");
  private readonly string ownSession;
  private int armAttempts, removeAttempts;
  private int sourceVariant = -1;
  private string sourceScript;
  private bool resumeAttempted;
  internal EasyedaWireV5EarlyInitSender(string session) {
    Need(session != null && Handle.IsMatch(session));
    ownSession = session;
  }
  private static void Need(bool current) {
    if (!current) throw new InvalidOperationException("wire-v5-early-init-native-custody");
  }
  private static string Number(int value) { return value.ToString(System.Globalization.CultureInfo.InvariantCulture); }
  internal string Reserve(int id, string session, string phase, int variant, string value, bool navigationStarted) {
    Need(id > 0 && session == ownSession && variant >= 0 && variant < Urls.Length && !resumeAttempted);
    int bit = 1 << variant;
    string method;
    string parameters;
    switch (phase) {
      case "arm":
        Need(!navigationStarted && removeAttempts == 0 && (armAttempts & bit) == 0 && value == null);
        method = "Debugger.setBreakpointByUrl";
        parameters = "{\"url\":" + EasyedaDiagnosticOwner.WireGlobalsQuote(Urls[variant]) +
          ",\"lineNumber\":" + Number(Lines[variant]) + ",\"columnNumber\":" + Number(Columns[variant]) + ",\"condition\":\"\"}";
        armAttempts |= bit;
        break;
      case "source":
        Need(navigationStarted && armAttempts == ((1 << Urls.Length) - 1) && removeAttempts == 0 &&
          sourceVariant == -1 && value != null && Handle.IsMatch(value));
        method = "Debugger.getScriptSource";
        parameters = "{\"scriptId\":" + EasyedaDiagnosticOwner.WireGlobalsQuote(value) + "}";
        sourceVariant = variant;
        sourceScript = value;
        break;
      case "remove":
        Need((armAttempts & bit) != 0 && (removeAttempts & bit) == 0 && value == Breakpoints[variant]);
        method = "Debugger.removeBreakpoint";
        parameters = "{\"breakpointId\":" + EasyedaDiagnosticOwner.WireGlobalsQuote(value) + "}";
        removeAttempts |= bit;
        break;
      case "resume":
        Need(navigationStarted && sourceVariant == variant && value == sourceScript && removeAttempts == armAttempts);
        method = "Debugger.resume";
        parameters = "{}";
        resumeAttempted = true;
        break;
      default: throw new InvalidOperationException("wire-v5-early-init-native-phase");
    }
    return "{\"id\":" + Number(id) + ",\"method\":" + EasyedaDiagnosticOwner.WireGlobalsQuote(method) +
      ",\"params\":" + parameters + ",\"sessionId\":" + EasyedaDiagnosticOwner.WireGlobalsQuote(session) + "}\0";
  }
}
public sealed partial class EasyedaDiagnosticOwner {
  private EasyedaWireV5EarlyInitSender wireV5EarlyInit;
  private bool wireV5EarlyInitEnabled, wireV5EarlyInitFailed;
  private int wireV5EarlyInitControls;
  // Only the new combined profile's exact constructor may enable this sender.
  private void EnableWireV5EarlyInit() {
    if (!wireWriterV5 || wireV5EarlyInitEnabled || root != IntPtr.Zero) throw Error("wire-v5-early-init-native-birth");
    wireV5EarlyInitEnabled = true;
  }
  public static EasyedaDiagnosticOwner CreateSchematicWireWriterV5EarlyInit() {
    EasyedaDiagnosticOwner owner = CreateSchematicWireWriterV5();
    owner.EnableWireV5EarlyInit();
    return owner;
  }
  public void AdmitWireV5EarlyInitAction() {
    if (!wireV5EarlyInitEnabled || wireV5EarlyInitFailed ||
        ++wireV5EarlyInitControls > __CONTROLS__) throw Error("wire-v5-early-init-native-control");
    AssertLive();
  }
  public void SendWireV5EarlyInit(int id, string session, string phase, int variant, string value) {
    if (!wireV5EarlyInitEnabled || wireV5EarlyInitFailed || !wireWriterV5 || schematicDisplayAbort ||
        !schematicDisplayConstructionComplete || !schematicDisplayStages[0] || schematicDisplayStages[2] ||
        session == null || session != schematicDisplaySession) throw Error("wire-v5-early-init-native-owner");
    AssertLive();
    if (wireV5EarlyInit == null) wireV5EarlyInit = new EasyedaWireV5EarlyInitSender(session);
    try {
      string command = wireV5EarlyInit.Reserve(id, session, phase, variant, value, schematicDisplayStages[1]);
      SendMessage(id, command);
    } catch { wireV5EarlyInitFailed = true; throw; }
  }
}
`.replace("__LINES__", lines).replace("__COLUMNS__", columns).replace("__URLS__", urls).replace("__IDS__", ids)
    .replace("__CONTROLS__", String(CURRENT_SCHEMATIC_WIRE_V5_EARLY_INIT_NATIVE_LIMITS.controls));
}

/** Extend only the exact legacy V5 review preimage for a new compilation.
 * Legacy V5 continues through the unchanged constructor and request limit. */
export function currentSchematicWireV5EarlyInitNativePreimage(review: string): string {
  const expected = CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_IDENTITY.review;
  if (Buffer.byteLength(review) !== expected.bytes || createHash("sha256").update(review).digest("hex") !== expected.sha256) {
    throw new Error("WIRE_V5_EARLY_INIT_NATIVE_PREIMAGE");
  }
  const { total } = CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE.renderer;
  const limitPrefix = `int RequestLimit { get { if(wireWriterV5)return ${String(total)};`;
  if (review.split(limitPrefix).length !== 2) { throw new Error("WIRE_V5_EARLY_INIT_NATIVE_PREIMAGE"); }
  const reviewWithLimit = review.replace(limitPrefix,
    `int RequestLimit { get { if(wireV5EarlyInitEnabled)return ${String(total + requests)}; if(wireWriterV5)return ${String(total)};`);
  let fragment = currentSchematicWireV5EarlyInitNativeSource();
  for (const field of ["schematicDisplayAbort", "schematicDisplayConstructionComplete", "schematicDisplaySession"] as const) {
    const original = CURRENT_SCHEMATIC_PRIVATE_FIELDS.find(row => row.field === field);
    if (original === undefined || fragment.split(field).length !== 2) { throw new Error("WIRE_V5_EARLY_INIT_NATIVE_FIELD"); }
    fragment = fragment.replace(field, original.emitted);
  }
  return `${reviewWithLimit}\n${fragment}`;
}

/** Install under the separate helper's fixed owner action validation. Poll
 * routing remains the responsibility of that owner's early receive lane. */
export function currentSchematicWireV5EarlyInitNativeDispatch(): string {
  return String.raw`        'schematic-wire-v5-early-init' {
          if (-not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or
              ($request.variant -isnot [int] -and $request.variant -isnot [long])) {throw 'wire-v5-early-init-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','sessionId','phase','variant')
          $value=[System.Management.Automation.Language.NullString]::Value
          switch -CaseSensitive ($request.phase) {
            'arm' {$expected=$baseFields}
            'source' {$expected=$baseFields+@('scriptId');$value=$request.scriptId}
            'remove' {$expected=$baseFields+@('breakpointId');$value=$request.breakpointId}
            'resume' {$expected=$baseFields+@('scriptId');$value=$request.scriptId}
            default {throw 'wire-v5-early-init-phase'}
          }
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($expected | Sort-Object) -join ',') -or
              ($request.phase -cne 'arm' -and $value -isnot [string])) {throw 'wire-v5-early-init-fields'}
          $owner.AdmitWireV5EarlyInitAction()
          $owner.SendWireV5EarlyInit([int]$request.requestId,$request.sessionId,$request.phase,[int]$request.variant,$value)
          $result=@{written=$true}
        }
`;
}
