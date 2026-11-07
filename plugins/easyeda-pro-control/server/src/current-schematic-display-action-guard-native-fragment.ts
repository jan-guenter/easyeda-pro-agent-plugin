/** Separate original SCH refusal guards. Native supplies session/script/sites. */
import { createHash } from "node:crypto";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_ROLES as ROLES, currentSchematicDisplayActionGuardCommand } from "./current-schematic-display-action-guard-protocol.ts";

const begin = "// BEGIN ORIGINAL SCHEMATIC ACTION REFUSAL GUARDS", end = "// END ORIGINAL SCHEMATIC ACTION REFUSAL GUARDS";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_ACTION_GUARD_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_ACTION_GUARD_ANCHOR"); } return source.replace(before, after);
}
function native(): string {
  const hashes = ([0, 1] as const).flatMap(variant => ROLES.map(role => { const c = currentSchematicDisplayActionGuardCommand(role, variant, "original_script"); return createHash("sha256").update(`${JSON.stringify({ id: 67, method: c.method, params: c.params, sessionId: "original_ui" })}\0`).digest("hex"); }));
  return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
string schematicActionGuardScript;int schematicActionGuardVariant;readonly System.Collections.Generic.HashSet<string> schematicActionGuardAttempts=new System.Collections.Generic.HashSet<string>();
public void BindSchematicActionGuard(string script,int variant){if(!schematicDisplayWrite209||schematicDisplayAbort||!schematicProducerPrefixEnrolled||schematicActionGuardScript!=null||schematicActionNormal!=22||schematicActionCleanup!=0||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6]||script==null||!System.Text.RegularExpressions.Regex.IsMatch(script,@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||variant<0||variant>1)throw Error("schematic-action-guard-bind");AssertLive();schematicActionGuardScript=script;schematicActionGuardVariant=variant;}
public static string SchematicActionGuardMessage(int id,string session,string script,int variant,string role){if(id<1||session==null||script==null||!System.Text.RegularExpressions.Regex.IsMatch(session,@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(script,@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||variant<0||variant>1)throw Error("schematic-action-guard-message");int line,column;if(role=="run"){line=variant==0?30:556;column=68474;}else if(role=="x"){line=variant==0?3597:4096;column=variant==0?9920:6856;}else if(role=="y"){line=variant==0?3597:4096;column=variant==0?10086:7022;}else throw Error("schematic-action-guard-role");return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.setBreakpoint\\",\\"params\\":{\\"location\\":{\\"scriptId\\":\\""+script+"\\",\\"lineNumber\\":"+line.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"columnNumber\\":"+column.ToString(System.Globalization.CultureInfo.InvariantCulture)+"}},\\"sessionId\\":\\""+session+"\\"}\\0";}
public void ArmSchematicActionGuard(int id,string role){if(!schematicDisplayWrite209||schematicDisplayAbort||schematicActionGuardScript==null||schematicDisplayStages[4]||schematicDisplayStages[6]||schematicActionGuardAttempts.Count>=3||schematicActionGuardAttempts.Contains(role))throw Error("schematic-action-guard-original");string encoded=SchematicActionGuardMessage(id,schematicDisplaySession,schematicActionGuardScript,schematicActionGuardVariant,role);AssertLive();schematicActionGuardAttempts.Add(role);SendMessage(id,encoded);}
public static void VerifySchematicActionGuardSmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};string[] roles={"run","x","y"};for(int v=0;v<2;v++)for(int r=0;r<3;r++){string value=SchematicActionGuardMessage(67,"original_ui","original_script",v,roles[r]);using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(value))).Replace("-","").ToLowerInvariant()!=hashes[v*3+r])throw Error("schematic-action-guard-smoke");}bool refused=false;try{SchematicActionGuardMessage(67,"original_ui","original_script",0,"resume");}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-action-guard-resume-smoke");}
}
${end}`;
}
const dispatch = String.raw`        'schematic-display-action-guard-bind' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.scriptId -isnot [string] -or ($request.variant -isnot [int] -and $request.variant -isnot [long]) -or $request.variant -lt 0 -or $request.variant -gt 1 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,scriptId,variant') {throw 'schematic-action-guard-bind-fields'}
          $owner.BindSchematicActionGuard($request.scriptId,[int]$request.variant);$result=@{bound=$true}
        }
        'schematic-display-action-guard' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.role -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,role,rootCreated,rootPid') {throw 'schematic-action-guard-fields'}
          $owner.ArmSchematicActionGuard([int]$request.requestId,$request.role);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicDisplayActionGuardNativeFragment(input: string): string {
  let source = one(input, 'case "schematic-display-action":', 'case "schematic-display-action-guard-bind":case "schematic-display-action-guard":case "schematic-display-action":');
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-display-action' {"); source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicActionGuardSmoke()", "    [EasyedaSchematicDisplayActionProtocol]::VerifySmoke()");
  const a = source.indexOf(begin), b = source.indexOf(end);
  if (a !== -1 || b !== -1) { if (a === -1 || b < a || source.includes(begin, a + begin.length) || source.includes(end, b + end.length)) { throw new Error("SCHEMATIC_ACTION_GUARD_MARKERS"); } source = source.slice(0, a) + native() + source.slice(b + end.length); }
  else { source = one(source, "// BEGIN GENERATED SCHEMATIC ORIGINAL ACTION OBSERVER", `${native()}\n// BEGIN GENERATED SCHEMATIC ORIGINAL ACTION OBSERVER`); } return source;
}
