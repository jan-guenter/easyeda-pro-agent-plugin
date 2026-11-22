/* oxlint-disable import/max-dependencies -- This separate V5 graph joins the immutable preimage, its fixed readonly codebooks and its own explicitly bounded compiler envelope. */
/** Separate V5 projection of an exact reviewed V4 build. The maintained
 * older schematic compiler continues to publish its original bytes. */
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_CSHARP_COMPILER_MAX_BYTES,packCurrentSchematicWireWriterV5CSharpStorage} from "../server/src/current-schematic-wire-writer-v5-csharp-storage.ts";
import {createHash} from "node:crypto";
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
 source=installOwnedNativeDispatch(source,ownStage,"        'schematic-wire-writer-v4-native' {");
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
