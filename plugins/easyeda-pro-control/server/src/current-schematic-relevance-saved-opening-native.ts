/** Purpose-local normal opening. The complete fixed project/page code is
 * packed once, while target, window, context and phase remain original state. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_WRAPPER as PROGRAM, currentSchematicRelevanceSavedOpeningWire } from "./current-schematic-relevance-saved-opening-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "./current-schematic-relevance-saved-readback-profile.ts";
import { canonicalJson } from "./core.ts";

const quote = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
export function currentSchematicRelevanceSavedOpeningNative(): string {
  const bytes = Buffer.from(PROGRAM); if (bytes.length === 0 || bytes.length > 65_536) { throw new Error("SCHEMATIC_SAVED_OPENING_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic packing of a fixed declaration; no runtime source or path is accepted.
  const packed = gzipSync(bytes, { level: 9 }); const unpack = `UnpackFixedProgram(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(createHash("sha256").update(bytes).digest("hex"))},${quote(createHash("sha256").update(packed).digest("hex"))})`;
  const path = String.raw`C:\Synthetic\CodexEasyedaFixture_11111111111111111111111111111111\Codex_schematic_relevance_2222222222222222.eprj2`, project = createHash("sha256").update(path).digest("hex");
  const target = { rawWindowsPath: path, projectUuid: project, branchUuid: "b".repeat(32), pageUuid: "c".repeat(32), schematicUuid: "d".repeat(32), expectedSourceSha256: "e".repeat(64) };
  const hashes = ["preflight", "open-project", "open-page"].map(phase => {
    if (phase !== "preflight" && phase !== "open-project" && phase !== "open-page") { throw new Error("SCHEMATIC_SAVED_OPENING_PHASE"); }
    const { schematicSavedOpening: _marker, ...wire } = currentSchematicRelevanceSavedOpeningWire(190, "session", "context", target, phase, "window");
    const hash = createHash("sha256").update(`${JSON.stringify(wire)}\0`).digest("hex");
    return `{string text=SchematicSavedOpeningMessage(190,"session","context",${quote(canonicalJson(target))},${quote(phase)},"window");using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=${quote(hash)})throw Error("schematic-saved-opening-wire-parity");}`;
  }).join("");
  return String.raw`
public sealed partial class EasyedaDiagnosticOwner {
static readonly string SchematicSavedOpeningFunction=${unpack};
bool schematicSavedOpeningEnrolled,schematicSavedOpeningPreflight,schematicSavedOpeningDispatched,schematicSavedPageDispatched;
public void EnrollSchematicSavedOpening(){if(!schematicSavedReadback209||!schematicSavedColdArmed||!schematicSavedRegistrationAwaited||schematicSavedOpeningEnrolled||schematicSavedColdBound||!schematicSavedCacheUntracked)throw Error("schematic-saved-opening-enroll");schematicSavedOpeningEnrolled=true;}
public static string SchematicSavedOpeningMessage(int id,string session,string context,string target,string phase,string window){if(id<1||id>${String(PROFILE.renderer.activeCold)}||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||!System.Text.RegularExpressions.Regex.IsMatch(window??"",@"\A[A-Za-z0-9_-]{1,128}\z")||target==null||target.Length<1||target.Length>8192||phase!="preflight"&&phase!="open-project"&&phase!="open-page")throw Error("schematic-saved-opening-message");string text="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\"Runtime.callFunctionOn\",\"params\":{\"functionDeclaration\":"+JsonString(SchematicSavedOpeningFunction)+",\"uniqueContextId\":"+JsonString(context)+",\"arguments\":[{\"value\":"+JsonString(target)+"},{\"value\":"+JsonString(phase)+"},{\"value\":"+JsonString(window)+"}],\"returnByValue\":true,\"awaitPromise\":true,\"silent\":true,\"generatePreview\":false,\"userGesture\":false,\"throwOnSideEffect\":false},\"sessionId\":"+JsonString(session)+"}\0";if(Encoding.UTF8.GetByteCount(text)>65536)throw Error("schematic-saved-opening-frame-bound");return text;}
public void SendSchematicSavedOpening(int id,string session,string context,string target,string phase,string window){if(!schematicSavedReadback209||!schematicSavedOpeningEnrolled||!schematicSavedRegistrationAwaited||session!=schematicSavedSession||context!=schematicSavedCacheContext||target!=SchematicSavedTargetJson()||window!=schematicSavedWindow)throw Error("schematic-saved-opening-original");if(phase=="preflight"){if(schematicSavedOpeningPreflight||schematicSavedOpeningDispatched||schematicSavedColdBound)throw Error("schematic-saved-opening-preflight-once");}else if(phase=="open-project"){if(!schematicSavedOpeningPreflight||schematicSavedOpeningDispatched||schematicSavedColdBound)throw Error("schematic-saved-opening-project-once");}else if(phase=="open-page"){if(!schematicSavedColdComplete||!schematicSavedOpeningDispatched||schematicSavedPageDispatched)throw Error("schematic-saved-opening-page-once");}else throw Error("schematic-saved-opening-phase");string text=SchematicSavedOpeningMessage(id,session,context,target,phase,window);if(phase=="preflight")schematicSavedOpeningPreflight=true;else if(phase=="open-project")schematicSavedOpeningDispatched=true;else schematicSavedPageDispatched=true;SendMessage(id,text);}
public static void VerifySchematicSavedOpeningSmoke(){${hashes}var fresh=CreateSchematicRelevanceSavedReadback209();bool refused=false;try{fresh.EnrollSchematicSavedOpening();}catch(InvalidOperationException){refused=true;}if(!refused||fresh.schematicSavedOpeningEnrolled)throw Error("schematic-saved-opening-before-original-registration");fresh.originalMain.Release();}
}
`;
}
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_DISPATCH = String.raw`        'schematic-saved-opening-enroll' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'schematic-saved-opening-enroll-fields'}
          $owner.EnrollSchematicSavedOpening();$result=@{openingEnrolled=$true}
        }
        'schematic-saved-open' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,openingPhase,requestId,rootCreated,rootPid,sessionId,targetJson,uniqueContextId,windowTabId' -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'schematic-saved-opening-fields'}
          foreach ($name in @('sessionId','targetJson','uniqueContextId','openingPhase','windowTabId')) {if ($request.$name -isnot [string]) {throw 'schematic-saved-opening-types'}}
          $owner.SendSchematicSavedOpening([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.targetJson,$request.openingPhase,$request.windowTabId);$result=@{written=$true}
        }
`;
