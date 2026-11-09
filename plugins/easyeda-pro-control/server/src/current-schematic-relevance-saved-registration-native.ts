/** Build-time fixed registration program, with a purpose-local original
 * enrollment and no selected-design SQL continuation. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_REGISTRATION_FUNCTION as PROGRAM, currentSchematicRelevanceSavedRegistrationWire } from "./current-schematic-relevance-saved-registration.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "./current-schematic-relevance-saved-readback-profile.ts";

const quote = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
export function currentSchematicRelevanceSavedRegistrationNative(): string {
  const bytes = Buffer.from(PROGRAM); if (bytes.length === 0 || bytes.length > 65_536) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic packing of one fixed source declaration under the unchanged decoder limit.
  const packed = gzipSync(bytes, { level: 9 }); const unpack = `UnpackFixedProgram(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(createHash("sha256").update(bytes).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))})`;
  const path = String.raw`C:\Synthetic\CodexEasyedaFixture_11111111111111111111111111111111\Codex_schematic_relevance_2222222222222222.eprj2`, project = createHash("sha256").update(path).digest("hex");
  const target = { rawWindowsPath: path, projectUuid: project, branchUuid: "b".repeat(32), pageUuid: "c".repeat(32), schematicUuid: "d".repeat(32), expectedSourceSha256: "e".repeat(64) };
  const { schematicSavedRegistration: _marker, ...wire } = currentSchematicRelevanceSavedRegistrationWire(176, "session", "context", target);
  const hash = createHash("sha256").update(`${JSON.stringify(wire)}\0`).digest("hex");
  return String.raw`
public sealed partial class EasyedaDiagnosticOwner {
static readonly string SchematicSavedRegistrationFunction=${unpack};
bool schematicSavedRegistrationEnrolled,schematicSavedRegistrationAttempted,schematicSavedRegistrationAwaited;string schematicSavedSchematic,schematicSavedWindow;
string SchematicSavedTargetJson(){return "{\"branchUuid\":"+JsonString(schematicSavedCacheBranch)+",\"expectedSourceSha256\":"+JsonString(schematicSavedCacheSource)+",\"pageUuid\":"+JsonString(schematicSavedCachePage)+",\"projectUuid\":"+JsonString(schematicSavedCacheProject)+",\"rawWindowsPath\":"+JsonString(schematicSavedCachePath)+",\"schematicUuid\":"+JsonString(schematicSavedSchematic)+"}";}
public void EnrollSchematicSavedRegistration(string schematic,string window){if(!schematicSavedReadback209||!schematicSavedColdArmed||schematicSavedColdBound||!schematicSavedCacheUntracked||schematicSavedRegistrationEnrolled||!System.Text.RegularExpressions.Regex.IsMatch(schematic??"",@"\A[a-f0-9]{32}\z")||schematic==schematicSavedCachePage||!System.Text.RegularExpressions.Regex.IsMatch(window??"",@"\A[A-Za-z0-9_-]{1,128}\z"))throw Error("schematic-saved-registration-enroll");SchematicSavedGuardMessage(1,schematicSavedSession,schematicSavedCacheContext,schematicSavedCachePath,schematicSavedCacheProject,schematicSavedCacheBranch,schematicSavedCachePage,schematicSavedCacheSource);schematicSavedSchematic=schematic;schematicSavedWindow=window;schematicSavedRegistrationEnrolled=true;}
public static string SchematicSavedRegistrationMessage(int id,string session,string context,string target){if(id<1||id>${String(PROFILE.renderer.activeRegistration)}||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||target==null||target.Length<1||target.Length>8192)throw Error("schematic-saved-registration-message");string text="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\"Runtime.callFunctionOn\",\"params\":{\"functionDeclaration\":"+JsonString(SchematicSavedRegistrationFunction)+",\"uniqueContextId\":"+JsonString(context)+",\"arguments\":[{\"value\":"+JsonString(target)+"}],\"returnByValue\":true,\"awaitPromise\":true,\"silent\":true,\"generatePreview\":false,\"userGesture\":false,\"throwOnSideEffect\":false},\"sessionId\":"+JsonString(session)+"}\0";if(Encoding.UTF8.GetByteCount(text)>65536)throw Error("schematic-saved-registration-frame-bound");return text;}
public void SendSchematicSavedRegistration(int id,string session,string context,string target){if(!schematicSavedReadback209||!schematicSavedRegistrationEnrolled||!schematicSavedColdArmed||schematicSavedColdBound||schematicSavedRegistrationAttempted||session!=schematicSavedSession||context!=schematicSavedCacheContext||target!=SchematicSavedTargetJson())throw Error("schematic-saved-registration-original");string text=SchematicSavedRegistrationMessage(id,session,context,target);schematicSavedRegistrationAttempted=true;SendMessage(id,text);}
public void CompleteSchematicSavedRegistration(){if(!schematicSavedReadback209||!schematicSavedRegistrationEnrolled||!schematicSavedRegistrationAttempted||schematicSavedRegistrationAwaited||schematicSavedColdBound)throw Error("schematic-saved-registration-completion");schematicSavedRegistrationAwaited=true;}
public static void VerifySchematicSavedRegistrationSmoke(){string target="{\"branchUuid\":\""+new string('b',32)+"\",\"expectedSourceSha256\":\""+new string('e',64)+"\",\"pageUuid\":\""+new string('c',32)+"\",\"projectUuid\":\""+${quote(project)}+"\",\"rawWindowsPath\":"+JsonString(${quote(path)})+",\"schematicUuid\":\""+new string('d',32)+"\"}";string text=SchematicSavedRegistrationMessage(176,"session","context",target);using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=${quote(hash)})throw Error("schematic-saved-registration-wire-parity");var fresh=CreateSchematicRelevanceSavedReadback209();bool refused=false;try{fresh.EnrollSchematicSavedRegistration(new string('d',32),"window");}catch(InvalidOperationException){refused=true;}if(!refused||fresh.schematicSavedRegistrationEnrolled)throw Error("schematic-saved-registration-before-loading");fresh.originalMain.Release();}
}
`;
}
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_REGISTRATION_DISPATCH = String.raw`        'schematic-saved-registration-enroll' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,schematicUuid,windowTabId' -or $request.schematicUuid -isnot [string] -or $request.windowTabId -isnot [string]) {throw 'schematic-saved-registration-enroll-fields'}
          $owner.EnrollSchematicSavedRegistration($request.schematicUuid,$request.windowTabId);$result=@{enrolled=$true}
        }
        'schematic-saved-register' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId,targetJson,uniqueContextId' -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'schematic-saved-register-fields'}
          foreach ($name in @('sessionId','targetJson','uniqueContextId')) {if ($request.$name -isnot [string]) {throw 'schematic-saved-register-types'}}
          $owner.SendSchematicSavedRegistration([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.targetJson);$result=@{written=$true}
        }
        'schematic-saved-registration-complete' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'schematic-saved-registration-complete-fields'}
          $owner.CompleteSchematicSavedRegistration();$result=@{registrationAwaited=$true}
        }
`;
