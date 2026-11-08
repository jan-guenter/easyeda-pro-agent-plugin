/** Distinct writer registration ledger. The shared Main encoder stays inert;
 * its original issuer and actual callbacks are independently required by Core. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN GENERATED SCHEMATIC RELEVANCE WRITER REGISTRATION", end = "// END GENERATED SCHEMATIC RELEVANCE WRITER REGISTRATION";
const mainGuard = "if(schematicRelevanceDisplayWrite209)RelevanceRegistrationMain(phase);";
const stageGuard = "RelevanceRegistrationStage(index,session,fields);";
const admission = 'case "schematic-relevance-registration-enroll":case "schematic-relevance-registration-complete":';
function one(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_NATIVE_ANCHOR"); } return source.replace(before, after);
}
export function normalizeCurrentSchematicRelevanceDisplayRegistrationNative(input: string): string {
  let source = input; const from = source.indexOf(begin), to = source.indexOf(end);
  if (from !== -1 || to !== -1) {
    if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_NATIVE_MARKERS"); }
    if (source[from - 1] !== "\n" || source[to + end.length] !== "\n") { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_NATIVE_MARKER_LINES"); }
    source = source.slice(0, from - 1) + source.slice(to + end.length);
  }
  for (const marker of [mainGuard, stageGuard, admission]) {
    if (source.split(marker).length > 2) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_NATIVE_DUPLICATE"); } source = source.replace(marker, "");
  }
  return source;
}
export function currentSchematicRelevanceDisplayRegistrationNativeSource(): string { return String.raw`${begin}
public sealed partial class EasyedaDiagnosticOwner {
bool relevanceRegistrationEnrolled,relevanceRegistrationAttempted,relevanceRegistrationCompleted;int relevanceRegistrationMainStep;string relevanceRegistrationTarget;
readonly System.Collections.Generic.HashSet<string> relevanceRegistrationArms=new System.Collections.Generic.HashSet<string>();
void RelevanceRegistrationMain(string phase){if(phase==null||!phase.StartsWith("sql-fence-registration-",StringComparison.Ordinal))return;if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicDisplayConstructionComplete||relevanceRegistrationCompleted)throw Error("relevance-registration-main-purpose");if(phase.StartsWith("sql-fence-registration-arm-",StringComparison.Ordinal)){string site=phase.Substring("sql-fence-registration-arm-".Length);if(relevanceRegistrationEnrolled||relevanceRegistrationAttempted||relevanceRegistrationArms.Count>=3||Array.IndexOf(new[]{"bind","afterExec","opened"},site)<0||!relevanceRegistrationArms.Add(site))throw Error("relevance-registration-main-arm-once");return;}if(!relevanceRegistrationEnrolled||!relevanceRegistrationAttempted||relevanceRegistrationArms.Count!=3)throw Error("relevance-registration-main-original-pending");if(phase.StartsWith("sql-fence-registration-frame-",StringComparison.Ordinal)){string site=phase.Substring("sql-fence-registration-frame-".Length);string expected=relevanceRegistrationMainStep==0?"bind":relevanceRegistrationMainStep==2?"afterExec":relevanceRegistrationMainStep==3?"opened":null;if(site!=expected)throw Error("relevance-registration-main-frame");return;}string[] order={"sql-fence-registration-bind","sql-fence-registration-run","sql-fence-registration-after-exec","sql-fence-registration-opened"};if(relevanceRegistrationMainStep>=order.Length||phase!=order[relevanceRegistrationMainStep])throw Error("relevance-registration-main-order");relevanceRegistrationMainStep++;}
void RequireRelevanceRegistrationEnroll(string session,string context,string target){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicDisplayConstructionComplete||originalMain==null||!schematicDisplayStages[0]||schematicDisplayStages[1]||relevanceRegistrationArms.Count!=3||relevanceRegistrationEnrolled||relevanceRegistrationAttempted||relevanceRegistrationCompleted||session!=schematicDisplaySession||context!=schematicDisplayContext||!schematicWorkerParentArmed||schematicWorkerProjectUuid==null||schematicWorkerPageUuid==null||target==null||target.IndexOf("\"projectUuid\":\""+schematicWorkerProjectUuid+"\"",StringComparison.Ordinal)<0||target.IndexOf("\"pageUuid\":\""+schematicWorkerPageUuid+"\"",StringComparison.Ordinal)<0)throw Error("relevance-registration-enroll-original");var fields=new System.Collections.Hashtable(StringComparer.Ordinal);fields.Add("uniqueContextId",context);fields.Add("targetJson",target);SchematicRelevanceDisplayProtocolMessage(1,session,"navigate",fields);}
public void EnrollSchematicRelevanceDisplayRegistration(string session,string context,string target){RequireRelevanceRegistrationEnroll(session,context,target);AssertLive();relevanceRegistrationTarget=target;relevanceRegistrationEnrolled=true;}
void RelevanceRegistrationStage(int index,string session,System.Collections.IDictionary fields){if(index==1){if(!schematicRelevanceDisplayWrite209||!relevanceRegistrationEnrolled||relevanceRegistrationAttempted||relevanceRegistrationCompleted||relevanceRegistrationArms.Count!=3||session!=schematicDisplaySession||fields["uniqueContextId"] as string!=schematicDisplayContext||fields["targetJson"] as string!=relevanceRegistrationTarget)throw Error("relevance-registration-before-navigation");relevanceRegistrationAttempted=true;}else if(index>=2&&!relevanceRegistrationCompleted)throw Error("relevance-registration-before-capture");}
void RequireRelevanceRegistrationComplete(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRegistrationEnrolled||!relevanceRegistrationAttempted||relevanceRegistrationCompleted||!schematicDisplayStages[1]||relevanceRegistrationArms.Count!=3||(relevanceRegistrationMainStep!=0&&relevanceRegistrationMainStep!=4))throw Error("relevance-registration-completion-original");}
public void CompleteSchematicRelevanceDisplayRegistration(){RequireRelevanceRegistrationComplete();AssertLive();relevanceRegistrationCompleted=true;}
public static void VerifySchematicRelevanceDisplayRegistrationSmoke(){var owner=CreateSchematicRelevanceDisplayWrite209();bool refused=false;try{owner.RequireRelevanceRegistrationEnroll("session","context","{}");}catch(InvalidOperationException){refused=true;}if(!refused||owner.relevanceRegistrationEnrolled)throw Error("relevance-registration-before-main");owner.schematicDisplayConstructionComplete=true;var fields=new System.Collections.Hashtable(StringComparer.Ordinal);foreach(string site in new[]{"bind","afterExec","opened"}){fields["site"]=site;owner.RelevanceRegistrationMain("sql-fence-registration-arm-"+site);}refused=false;try{owner.RelevanceRegistrationMain("sql-fence-registration-arm-opened");}catch(InvalidOperationException){refused=true;}if(!refused||owner.relevanceRegistrationArms.Count!=3)throw Error("relevance-registration-duplicate-arm");refused=false;try{owner.RelevanceRegistrationStage(2,"session",fields);}catch(InvalidOperationException){refused=true;}if(!refused||owner.relevanceRegistrationAttempted)throw Error("relevance-registration-unenrolled-capture");owner.relevanceRegistrationEnrolled=true;owner.relevanceRegistrationAttempted=true;owner.schematicDisplayStages[1]=true;owner.RequireRelevanceRegistrationComplete();owner.relevanceRegistrationMainStep=1;refused=false;try{owner.RequireRelevanceRegistrationComplete();}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("relevance-registration-partial-main");owner.relevanceRegistrationMainStep=4;owner.RequireRelevanceRegistrationComplete();owner.relevanceRegistrationCompleted=true;refused=false;try{owner.RequireRelevanceRegistrationComplete();}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("relevance-registration-complete-once");owner.originalMain.Release();}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-registration-enroll' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,sessionId,targetJson,uniqueContextId' -or $request.sessionId -isnot [string] -or $request.uniqueContextId -isnot [string] -or $request.targetJson -isnot [string]) {throw 'relevance-registration-enroll-fields'}
          $owner.EnrollSchematicRelevanceDisplayRegistration($request.sessionId,$request.uniqueContextId,$request.targetJson);$result=@{enrolled=$true}
        }
        'schematic-relevance-registration-complete' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'relevance-registration-complete-fields'}
          $owner.CompleteSchematicRelevanceDisplayRegistration();$result=@{registrationAwaited=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayRegistrationNative(input: string): string {
  let source = normalizeCurrentSchematicRelevanceDisplayRegistrationNative(input);
  const from = source.indexOf("public void AdmitSchematicRelevanceDisplayAction("), to = source.indexOf("public static string SchematicRelevanceDisplayProtocolMessage(", from);
  if (from === -1 || to <= from) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_ADMISSION"); }
  source = source.slice(0, from) + one(source.slice(from, to), 'case "identity":', `${admission}case "identity":`) + source.slice(to);
  const mainFrom = source.indexOf("void SendSchematicDisplayMain("), mainTo = source.indexOf("static int SchematicDisplayIndex(", mainFrom);
  if (mainFrom === -1 || mainTo <= mainFrom) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_MAIN"); }
  const encoded = "string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);";
  source = source.slice(0, mainFrom) + one(source.slice(mainFrom, mainTo), encoded, `${encoded}${mainGuard}`) + source.slice(mainTo);
  const stageFrom = source.indexOf("public void SendSchematicRelevanceDisplayNative("), stageTo = source.indexOf("public static void VerifySchematicRelevanceDisplayProtocolSmoke(", stageFrom);
  if (stageFrom === -1 || stageTo <= stageFrom) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_STAGE"); }
  source = source.slice(0, stageFrom) + one(source.slice(stageFrom, stageTo), "string message=SchematicRelevanceDisplayProtocolMessage(id,session,phase,fields);", `string message=SchematicRelevanceDisplayProtocolMessage(id,session,phase,fields);${stageGuard}`) + source.slice(stageTo);
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplayRegistrationSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()");
  return one(source, "\n'@\n", `\n${currentSchematicRelevanceDisplayRegistrationNativeSource()}\n'@\n`);
}
