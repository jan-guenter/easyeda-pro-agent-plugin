/* oxlint-disable import/max-dependencies -- Both fixed graphs join exact preimages, purpose-specific codebooks and bounded compiler storage. */
/** Separate V5 projection of an exact reviewed V4 build. The maintained
 * older schematic compiler continues to publish its original bytes. */
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_CSHARP_COMPILER_MAX_BYTES,packCurrentSchematicWireWriterV5CSharpStorage} from "../server/src/current-schematic-wire-writer-v5-csharp-storage.ts";
import {createHash} from "node:crypto";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as V4 } from "../server/src/current-schematic-wire-writer-v4-native-profile.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE as PROFILE} from "../server/src/current-schematic-wire-writer-v5-native-profile.ts";
import {currentSchematicWireV5TitleNativeSource} from "../server/src/current-schematic-wire-v5-title-native.ts";
import {currentSchematicWireGlobalsNativeSource} from "../server/src/current-schematic-wire-globals-native.ts";
import {CURRENT_SCHEMATIC_EXTRA_PRIVATE_FIELDS} from "../server/src/current-schematic-extra-private-fields.ts";
import {CURRENT_SCHEMATIC_LEGACY_PRIVATE_FIELDS} from "../server/src/current-schematic-legacy-private-fields.ts";
import {CURRENT_SCHEMATIC_PRIVATE_FIELDS} from "../server/src/current-schematic-private-fields.ts";
import {currentPcbDiagnosticCSharpLexicalTokens} from "../server/src/current-pcb-diagnostic-csharp-spacing.ts";
import {currentPcbDiagnosticCSharpReviewSource,currentPcbDiagnosticCSharpRuntimeCompilerInput,expandCurrentPcbDiagnosticCSharpReviewSource} from "../server/src/current-pcb-diagnostic-csharp-review-storage.ts";
import {CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM} from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";
import {installOwnedNativeDispatch} from "../server/src/native-owned-dispatch.ts";
import {SCHEMATIC_WIRE_WRITER_V4_PREIMAGE} from "../server/src/current-schematic-wire-writer-v4-native-preimage.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_IDENTITY} from "../server/src/current-schematic-wire-writer-v5-native-identity.ts";
import {CURRENT_SCHEMATIC_WIRE_V5_EARLY_INIT_NATIVE_LIMITS as EARLY, currentSchematicWireV5EarlyInitNativeDispatch, currentSchematicWireV5EarlyInitNativePreimage} from "../server/src/current-schematic-wire-v5-early-init-native.ts";
import {CURRENT_SCHEMATIC_WIRE_V5_ENCODER_NATIVE_LIMITS as ENCODER, currentSchematicWireV5EncoderNativeDispatch, currentSchematicWireV5EncoderNativePreimage} from "../server/src/current-schematic-wire-encoder-dispatch-native.ts";

function once(source:string,before:string,after:string):string{if(source.split(before).length!==2){throw new Error("WIRE_V5_NATIVE_EXACT_PREIMAGE");}return source.replace(before,()=>after);}
const hash=(source:string):string=>createHash("sha256").update(source).digest("hex");
export const SCHEMATIC_WIRE_WRITER_V5_REVIEW_PATH = "native-review/easyeda-pro-control/schematic-wire-writer-v5-native.cs";
function originalFields(source:string):string{
 const fields=new Map<string,string>([...CURRENT_SCHEMATIC_PRIVATE_FIELDS,...CURRENT_SCHEMATIC_EXTRA_PRIVATE_FIELDS,...CURRENT_SCHEMATIC_LEGACY_PRIVATE_FIELDS].map(row=>[row.field,row.emitted]));
 let prior=0,result="";for(const token of currentPcbDiagnosticCSharpLexicalTokens(source)){const replacement=token.kind==="identifier"?fields.get(token.text):undefined;if(replacement!==undefined){result+=source.slice(prior,token.start)+replacement;prior=token.end;}}return result+source.slice(prior);
}
export function generateSchematicWireWriterV5NativeSource(seed:string):Readonly<{helper:string;review:string;compiler:string;preimageSha256:string}>{
 const preimage=SCHEMATIC_WIRE_WRITER_V4_PREIMAGE;
 if(Buffer.byteLength(seed)!==preimage.bytes||hash(seed)!==preimage.sha256){throw new Error("WIRE_V5_V4_PREIMAGE");}
 const preimageSha256=hash(currentPcbDiagnosticCSharpRuntimeCompilerInput(seed));
 if(preimageSha256!==preimage.compilerSha256){throw new Error("WIRE_V5_V4_COMPILER_PREIMAGE");}
 let source=expandCurrentPcbDiagnosticCSharpReviewSource(seed);
 const birth=`
public enum EasyedaSchematicWireWriterV5Birth{Original}
public sealed partial class EasyedaDiagnosticOwner{
bool wireWriterV5;int wireV5GlobalsControls,wireV5TitleControls;
EasyedaDiagnosticOwner(EasyedaSchematicWireWriterV5Birth birth):this(EasyedaSchematicWireWriterV4Birth.Original){if(birth!=EasyedaSchematicWireWriterV5Birth.Original)throw Error("wire-v5-birth");wireWriterV5=true;}
public static EasyedaDiagnosticOwner CreateSchematicWireWriterV5(){return new EasyedaDiagnosticOwner(EasyedaSchematicWireWriterV5Birth.Original);}
public void AdmitWireWriterV5Action(string action){
 if(!wireWriterV5)throw Error("wire-v5-purpose");
 if(action=="schematic-wire-v5-title"||wireGlobalsReady&&(action=="schematic-wire-v5-globals"||action=="poll")){
  if(++wireV5TitleControls>${String(PROFILE.title.controls)}||wireGlobalsFailed)throw Error("wire-v5-title-budget");return;
 }
 if(action=="schematic-wire-v5-globals"||action=="schematic-wire-v5-globals-control"||action=="poll"&&wireGlobalsBound&&!wireGlobalsReady){
  if(++wireV5GlobalsControls>${String(PROFILE.globals.controls)}||wireGlobalsFailed)throw Error("wire-v5-globals-budget");return;
 }
 if(action=="schematic-wire-writer-v5-native"){AdmitWireWriterV4Action("schematic-wire-writer-v4-native");return;}
 if(action.StartsWith("schematic-wire-writer-v4-",StringComparison.Ordinal))throw Error("wire-v5-foreign-action");
 AdmitWireWriterV4Action(action);
}
public static void VerifySchematicWireWriterV5Smoke(){
 EasyedaWireGlobalsProtocol.VerifySmoke();EasyedaWireV5TitleProtocol.VerifySmoke();var owner=CreateSchematicWireWriterV5();
 try{if(!owner.wireWriterV5||!owner.wireWriterV4||owner.job!=IntPtr.Zero||owner.root!=IntPtr.Zero)throw Error("wire-v5-birth-smoke");
 bool refused=false;try{owner.ControlWireGlobals("bind","context27");}catch(InvalidOperationException){refused=true;}if(!refused||owner.wireGlobalsBound||owner.wireGlobalsReady)throw Error("wire-v5-unissued-smoke");
 refused=false;try{owner.AdmitWireWriterV5Action("schematic-wire-writer-v4-native");}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("wire-v5-foreign-smoke");
 }finally{owner.originalMain.Release();}
}
}
`;
 const begin="Add-Type @'\n",end="\n'@\n",start=source.indexOf(begin),stop=source.indexOf(end,start);if(start===-1||stop<=start||source.split(begin).length!==2||source.split(end).length!==2){throw new Error("WIRE_V5_NATIVE_CSHARP");}
 let body=source.slice(start+begin.length,stop);body=once(body,"int RequestLimit { get {",`int RequestLimit { get { if(wireWriterV5)return ${String(PROFILE.renderer.total)};`);
 body+=originalFields(birth+currentSchematicWireGlobalsNativeSource()+currentSchematicWireV5TitleNativeSource());source=source.slice(0,start+begin.length)+body+source.slice(stop);
 const first=source.slice(0,source.indexOf("\n"));source=once(source,first,"param([switch]$CompileOnly,[switch]$SchematicWireWriterV5)");
 source=once(source,"$purposeCount=([int][bool]$SchematicRelevanceDisplayWrite209)+([int][bool]$SchematicWireEdit209)+([int][bool]$SchematicWireWriterV4)","$SchematicRelevanceDisplayWrite209=$false\n$SchematicWireEdit209=$false\n$SchematicWireWriterV4=$false\n$purposeCount=([int][bool]$SchematicWireWriterV5)");
 const ownerLine=source.split("\n").find(line=>line.startsWith("$owner=if "));if(ownerLine===undefined){throw new Error("WIRE_V5_OWNER_SELECTION");}source=once(source,ownerLine,"$owner=[EasyedaDiagnosticOwner]::CreateSchematicWireWriterV5()");
 source=once(source,"$footprintMainPurpose=$SchematicWireWriterV4 -or ","$footprintMainPurpose=$SchematicWireWriterV5 -or $SchematicWireWriterV4 -or ");
 source=once(source,"      if ($SchematicWireWriterV4) {$owner.AdmitWireWriterV4Action($request.action)}","      if ($SchematicWireWriterV5) {$owner.AdmitWireWriterV5Action($request.action)}\n      if ($SchematicWireWriterV4) {$owner.AdmitWireWriterV4Action($request.action)}");
 source=source.replaceAll("-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209 -or $SchematicWireWriterV4)","-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209 -or $SchematicWireWriterV4 -or $SchematicWireWriterV5)");
 source=once(source,"          if ($SchematicWireWriterV4) {$requestLimit=6910}",`          if ($SchematicWireWriterV5) {$requestLimit=${String(PROFILE.renderer.total)}}\n          if ($SchematicWireWriterV4) {$requestLimit=6910}`);
 const stage=source.slice(source.indexOf("        'schematic-wire-writer-v4-native' {"),source.indexOf("        'schematic-wire-edit-native' {"));
 if(!stage.startsWith("        'schematic-wire-writer-v4-native' {")||!stage.endsWith("\n")){throw new Error("WIRE_V5_STAGE_PREIMAGE");}
 const ownStage=stage.replaceAll("schematic-wire-writer-v4-native","schematic-wire-writer-v5-native").replaceAll("$SchematicWireWriterV4","$SchematicWireWriterV5");
 const copiedStageSend = "          $owner.SendWireWriterV4Native(";
 const stageGuard = `          if ($request.requestId -lt 1 -or $request.requestId -gt ${String(V4.renderer.total)}) {throw 'wire-v5-stage-request-limit'}
`;
 source=installOwnedNativeDispatch(source,once(ownStage,copiedStageSend,stageGuard+copiedStageSend),"        'schematic-wire-writer-v4-native' {");
 const dispatch=`        'schematic-wire-v5-title' {
          if (-not $SchematicWireWriterV5 -or -not $launched -or $request.method -isnot [string] -or ($request.selector -isnot [int] -and $request.selector -isnot [long]) -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'wire-v5-title-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','selector','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'wire-v5-title-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendWireV5Title([int]$request.requestId,[int]$request.selector,$request.method,$fields);$result=@{written=$true}
        }
        'schematic-wire-v5-globals-control' {
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$expected=if ($request.operation -ceq 'bind') {$baseFields+@('uniqueContextId')} else {$baseFields}
          if (-not $SchematicWireWriterV5 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($expected | Sort-Object) -join ',')) {throw 'wire-v5-globals-control-fields'}
          $context=[System.Management.Automation.Language.NullString]::Value;if ($request.operation -ceq 'bind') {$context=$request.uniqueContextId}
          $owner.ControlWireGlobals($request.operation,$context);$result=@{written=$true}
        }
        'schematic-wire-v5-globals' {
          if (-not $SchematicWireWriterV5 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'wire-v5-globals-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'wire-v5-globals-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendWireGlobals([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-wire-writer-v5-native' {");
 source=once(source,"    [EasyedaDiagnosticOwner]::VerifySchematicWireWriterV4Smoke()","    [EasyedaDiagnosticOwner]::VerifySchematicWireWriterV4Smoke()\n    [EasyedaDiagnosticOwner]::VerifySchematicWireWriterV5Smoke()");
 source=packCurrentSchematicWireWriterV5CSharpStorage(source);const compiler=currentPcbDiagnosticCSharpRuntimeCompilerInput(source),review=currentPcbDiagnosticCSharpReviewSource(source);
 if(Buffer.byteLength(source)>MAXIMUM||Buffer.byteLength(compiler)>CURRENT_SCHEMATIC_WIRE_WRITER_V5_CSHARP_COMPILER_MAX_BYTES){throw new Error("WIRE_V5_FIXED_SOURCE_BOUND");}
 return Object.freeze({helper:source,review,compiler,preimageSha256});
}
const literal=(value:object):string=>JSON.stringify(value).replaceAll(/"bytes":(\d+)/gu,(_match:string,bytes:string)=>`"bytes":${bytes.replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu,"_")}`);
export function schematicWireWriterV5NativeIdentity(data:ReturnType<typeof generateSchematicWireWriterV5NativeSource>):string{
 const fields={schema:"private.current-schematic-wire-writer-v5-native-identity.v1",preimageSha256:data.preimageSha256,helper:{relativePath:"scripts/schematic-wire-writer-v5-native.ps1",bytes:Buffer.byteLength(data.helper),sha256:hash(data.helper)},review:{repositoryRelativePath:SCHEMATIC_WIRE_WRITER_V5_REVIEW_PATH,bytes:Buffer.byteLength(data.review),sha256:hash(data.review)},compiler:{bytes:Buffer.byteLength(data.compiler),sha256:hash(data.compiler)}};

 const rows=Object.entries(fields).map(([key,value])=>`${JSON.stringify(key)}:${typeof value==="string"?JSON.stringify(value):`Object.freeze(${literal(value)} as const)`}`);
 return `/** Generated separate V5 graph. The exact Wire V4 compiler input remains pinned. */\nexport const CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_IDENTITY=Object.freeze({${rows.join(",")}} as const);\n`;
}

const V6_HELPER = "scripts/schematic-wire-writer-v6-native.ps1";
export const SCHEMATIC_WIRE_WRITER_V6_REVIEW_PATH = "native-review/easyeda-pro-control/schematic-wire-writer-v6-native.cs";
const V6_RENDERER_LIMIT = PROFILE.renderer.total + EARLY.requests + ENCODER.requests;

function v6Once(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("WIRE_V6_NATIVE_EXACT_PREIMAGE"); }
  return source.replace(before, () => after);
}

const v6Owner = `
public sealed partial class EasyedaDiagnosticOwner {
  private bool wireWriterV6;
  private int wireV6EarlyInitPolls;
  public static EasyedaDiagnosticOwner CreateSchematicWireWriterV6() {
    EasyedaDiagnosticOwner owner = CreateSchematicWireWriterV5EarlyInit();
    owner.wireWriterV6 = true;
    return owner;
  }
  public void AdmitWireV6EarlyInitPoll() {
    if (!wireWriterV6 || wireV5EarlyInit == null || schematicDisplayStages[2] ||
        ++wireV6EarlyInitPolls > __EARLY_POLLS__) throw Error("wire-v6-early-init-poll");
    AdmitWireV5EarlyInitAction();
  }
  public static void VerifySchematicWireWriterV6Smoke() {
    EasyedaDiagnosticOwner owner = CreateSchematicWireWriterV6();
    try {
      if (!owner.wireWriterV6 || !owner.wireWriterV5 || !owner.wireV5EarlyInitEnabled ||
          owner.RequestLimit != __RENDERER_LIMIT__ || owner.root != IntPtr.Zero || owner.job != IntPtr.Zero ||
          owner.wireV5EarlyInit != null) throw Error("wire-v6-birth-smoke");
    } finally { owner.originalMain.Release(); }
    VerifyWireV5EncoderSmoke();
  }
}
`.replace("__EARLY_POLLS__", String(EARLY.polls)).replace("__RENDERER_LIMIT__", String(V6_RENDERER_LIMIT));

const v6EarlyPoll = `        'schematic-wire-v5-early-init-poll' {
          if (-not $SchematicWireWriterV6 -or -not $launched -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'wire-v6-early-init-poll-fields'}
          $owner.AdmitWireV6EarlyInitPoll()
          $result=@{bytes=$owner.Poll()}
        }
`;

const v6Admission = `      if ($SchematicWireWriterV6) {
        if ($request.action -ceq 'poll') {
          if (-not $owner.AdmitWireV5EncoderPoll()) {$owner.AdmitWireWriterV5Action($request.action)}
        } elseif (@('schematic-wire-v5-early-init','schematic-wire-v5-early-init-poll','schematic-wire-v5-encoder') -cnotcontains $request.action) {
          $owner.AdmitWireWriterV5Action($request.action)
        }
      }`;

interface V6NativeSource {
  readonly helper: string;
  readonly review: string;
  readonly compiler: string;
  readonly preimageSha256: string;
}

/** One build graph with its own compile-only entry and both fixed dispatchers.
 * The legacy helper remains the exact frozen preimage. */
export function generateSchematicWireWriterV6NativeSource(legacyHelper: string): V6NativeSource {
  const previous = CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_IDENTITY;
  const preimageSha256 = hash(legacyHelper);
  if (Buffer.byteLength(legacyHelper) !== previous.helper.bytes || preimageSha256 !== previous.helper.sha256 ||
      hash(currentPcbDiagnosticCSharpRuntimeCompilerInput(legacyHelper)) !== previous.compiler.sha256) {
    throw new Error("WIRE_V6_NATIVE_V5_PREIMAGE");
  }

  let source = expandCurrentPcbDiagnosticCSharpReviewSource(legacyHelper);
  const legacyReview = currentPcbDiagnosticCSharpReviewSource(legacyHelper);
  let body = currentSchematicWireV5EarlyInitNativePreimage(legacyReview);
  body = currentSchematicWireV5EncoderNativePreimage(body);
  body = v6Once(body, `int RequestLimit { get { if(wireV5EarlyInitEnabled)return ${String(PROFILE.renderer.total + EARLY.requests)};`,
    `int RequestLimit { get { if(wireWriterV6)return ${String(V6_RENDERER_LIMIT)}; if(wireV5EarlyInitEnabled)return ${String(PROFILE.renderer.total + EARLY.requests)};`);
  const literalBegin = "Add-Type @'\n", literalEnd = "\n'@\n";
  source = v6Once(source, `${literalBegin}${legacyReview}${literalEnd}`, `${literalBegin}${body}${v6Owner}${literalEnd}`);

  source = v6Once(source, "param([switch]$CompileOnly,[switch]$SchematicWireWriterV5)", `param([switch]$CompileOnly,[switch]$SchematicWireWriterV6)
if (-not $CompileOnly -or -not $SchematicWireWriterV6 -or $args.Count -ne 0) {throw 'wire-v6-compile-only'}
$SchematicWireWriterV5=[System.Management.Automation.SwitchParameter]$true`);
  source = v6Once(source, "$owner=[EasyedaDiagnosticOwner]::CreateSchematicWireWriterV5()", `[EasyedaDiagnosticOwner]::VerifySchematicWireWriterV6Smoke()
[Console]::Out.WriteLine('Wire writer V6 compile-only smoke passed')
return
$owner=[EasyedaDiagnosticOwner]::CreateSchematicWireWriterV6()`);
  source = v6Once(source, "      if ($SchematicWireWriterV5) {$owner.AdmitWireWriterV5Action($request.action)}", v6Admission);
  source = v6Once(source, `          if ($SchematicWireWriterV5) {$requestLimit=${String(PROFILE.renderer.total)}}`,
    `          if ($SchematicWireWriterV6) {$requestLimit=${String(V6_RENDERER_LIMIT)}}`);
  const dispatchAnchor = "        'schematic-wire-writer-v5-native' {";
  source = installOwnedNativeDispatch(source, currentSchematicWireV5EarlyInitNativeDispatch(), dispatchAnchor);
  source = installOwnedNativeDispatch(source, v6EarlyPoll, dispatchAnchor);
  source = installOwnedNativeDispatch(source, currentSchematicWireV5EncoderNativeDispatch(), dispatchAnchor);

  const helper = packCurrentSchematicWireWriterV5CSharpStorage(source);
  const compiler = currentPcbDiagnosticCSharpRuntimeCompilerInput(helper), review = currentPcbDiagnosticCSharpReviewSource(helper);
  if (Buffer.byteLength(helper) > MAXIMUM || Buffer.byteLength(compiler) > CURRENT_SCHEMATIC_WIRE_WRITER_V5_CSHARP_COMPILER_MAX_BYTES) {
    throw new Error("WIRE_V6_FIXED_SOURCE_BOUND");
  }
  return Object.freeze({ helper, review, compiler, preimageSha256 });
}

export function schematicWireWriterV6NativeIdentity(data: V6NativeSource): string {
  const fields = {
    schema: "private.current-schematic-wire-writer-v6-native-identity.v1",
    purpose: "schematic-wire-writer-v6-209", compileOnly: true, preimageSha256: data.preimageSha256,
    helper: { relativePath: V6_HELPER, bytes: Buffer.byteLength(data.helper), sha256: hash(data.helper) },
    review: { repositoryRelativePath: SCHEMATIC_WIRE_WRITER_V6_REVIEW_PATH, bytes: Buffer.byteLength(data.review), sha256: hash(data.review) },
    compiler: { bytes: Buffer.byteLength(data.compiler), sha256: hash(data.compiler) },
    renderer: { total: V6_RENDERER_LIMIT }, early: EARLY, encoder: ENCODER,
  };
  const fieldsSource = Object.entries(fields).map(([key, value]) =>
    `${JSON.stringify(key)}:${typeof value === "object" ? `Object.freeze(${literal(value)} as const)` : JSON.stringify(value)}`);
  return `/** Compile-only combined V6 native graph with exact legacy V5 preimage. */\nexport const CURRENT_SCHEMATIC_WIRE_WRITER_V6_NATIVE_IDENTITY = Object.freeze({${fieldsSource.join(", ")}} as const);\n`;
}
