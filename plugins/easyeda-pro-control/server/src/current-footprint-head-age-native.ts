/** Fixed native compiler for the separate head-age purpose. Only three
 * bounded scalar values and original remote handles cross the flat pipe. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as CONSTRUCTION } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN } from "./current-footprint-copy-main-transport-contract.ts";
import { validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM } from "./current-footprint-head-age-main.ts";

const normalMainRequests = CONSTRUCTION.observeNormal + 15;
const cleanupMainRequests = CONSTRUCTION.observeCleanup + CONSTRUCTION.releaseCleanup;
// Each main request/poll has at most two original-owner reproof controls plus
// Its one exchange. The full original poll cap leaves proof capacity available
// While cleanup uses its separately reserved controls. Thirty-two fixed controls
// Cover allocation identity, launch, bracket, window and detach observations.
const normalControls = MAIN.totalPolls * 3 + (normalMainRequests + cleanupMainRequests) * 3 + 32;
const cleanupControls = (MAIN.totalPolls - MAIN.normalPolls) * 3 + cleanupMainRequests * 3 + 512;
export const CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS = Object.freeze({ normalMainRequests, cleanupMainRequests, mainRequests: normalMainRequests + cleanupMainRequests,
  windowsClockSamples: 2, bracketNativeRequests: 1, normalControls, cleanupControls, bracketPolls: 1024, bracketRawBytes: 65_536,
  // Reserve the entire still-possible original main byte stream, framed into
  // Base64, plus cleanup headers and one pending maximum helper line. This
  // Conservative reserve may refuse normal work; it grants no completion claim.
  helperCleanupReserveBytes: 4 * Math.ceil(MAIN.totalReceivedBytes / 3) + cleanupControls * 512 + 100_000,
  maximumReplyBytes: 131_072, executionAuthorized: false });
/** Encode only an already checked head-age call. This route cannot encode
 * arbitrary programs, ordinary main commands, sessions or inspector endpoints. */
export function currentFootprintHeadAgeNativeWire(input: unknown, id: number): Readonly<Record<string, string | number>> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.mainRequests) { throw new Error("HEAD_AGE_NATIVE_ID"); }
  const command = validateCurrentFootprintCopyMainBackendCommand(input);
  const base = { action: "head-age-main", requestId: id, phase: command.phase };
  if (command.phase === "head-age-capture") {
    return Object.freeze({ ...base, objectId: command.params.objectId, argument0: command.params.arguments[0].objectId });
  }
  if (command.phase === "head-age-observe") {
    return Object.freeze({ ...base, objectId: command.params.objectId, createdAtLiteral: command.params.arguments[0].value,
      wallEpochMs: command.params.arguments[1].value });
  }
  throw new Error("HEAD_AGE_NATIVE_PURPOSE");
}
/** Escape fixed source data as a C# verbatim literal during generation only. */
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Generate two immutable function rows and a native scalar-only encoder.
 * Hash and decoded bounds stay under the existing shared table limits. */
export function currentFootprintHeadAgeNativeSource(): string {
  const bytes = Buffer.from([CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM].join("\0"));
  // oxlint-disable-next-line node/no-sync -- The native compiler packs two fixed in-memory programs deterministically.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintHeadAgeProtocol {
public const int MainNormal=${String(normalMainRequests)},MainCleanup=${String(cleanupMainRequests)},MainRequests=${String(normalMainRequests + cleanupMainRequests)},NormalControls=${String(normalControls)},CleanupControls=${String(cleanupControls)};
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-head-age-protocol");}
static readonly string[][] Programs=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},2,1);
static string Quote(string value){var b=new System.Text.StringBuilder("\\"");foreach(char c in value){if(c=='\\\\'||c=='"')b.Append('\\\\').Append(c);else if(c<' ')b.Append("\\\\u").Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));else b.Append(c);}return b.Append('"').ToString();}
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return Quote(value);}
static string Integer(object value){Need(value is int||value is long);long n=System.Convert.ToInt64(value,System.Globalization.CultureInfo.InvariantCulture);Need(n>=0&&n<=253402214399999L);return n.ToString(System.Globalization.CultureInfo.InvariantCulture);}
public static string Encode(int id,string phase,System.Collections.IDictionary fields){Need(id>0&&id<=37&&fields!=null);bool capture=phase=="head-age-capture";Need(capture||phase=="head-age-observe");string[] names=capture?new string[]{"objectId","argument0"}:new string[]{"objectId","createdAtLiteral","wallEpochMs"};Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string arguments;if(capture)arguments="[{\\"objectId\\":"+Handle(fields["argument0"])+"}]";else{string date=fields["createdAtLiteral"] as string;System.DateTime parsed;Need(date!=null&&date.Length==19&&System.DateTime.TryParseExact(date,"yyyy-MM-dd HH:mm:ss",System.Globalization.CultureInfo.InvariantCulture,System.Globalization.DateTimeStyles.None,out parsed)&&parsed.Year>=1970);arguments="[{\\"value\\":"+Quote(date)+"},{\\"value\\":"+Integer(fields["wallEpochMs"])+"}]";}
return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\"Runtime.callFunctionOn\\",\\"params\\":{\\"objectGroup\\":${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP},\\"silent\\":true,\\"generatePreview\\":false,\\"throwOnSideEffect\\":"+(capture?"true":"false")+",\\"awaitPromise\\":false,\\"userGesture\\":false,\\"objectId\\":"+Handle(fields["objectId"])+",\\"functionDeclaration\\":"+Quote(Programs[capture?0:1][0])+",\\"arguments\\":"+arguments+",\\"returnByValue\\":"+(capture?"false":"true")+"}}";}
public static void VerifySmoke(){var fields=new System.Collections.Hashtable();fields.Add("objectId","head-array");fields.Add("argument0","original-array");Need(Encode(1,"head-age-capture",fields).Contains("\\"throwOnSideEffect\\":true"));fields.Remove("argument0");fields.Add("createdAtLiteral","2026-01-15 12:34:56");fields.Add("wallEpochMs",1700000000000L);Need(Encode(37,"head-age-observe",fields).Contains("\\"throwOnSideEffect\\":false"));bool refused=false;fields["createdAtLiteral"]="2026-01-15 12:34:56\\n";try{Encode(1,"head-age-observe",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}
}`.replace(`\\"objectGroup\\":${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP}`, `\\"objectGroup\\":\\"${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP}\\"`);
}
