/** New readonly cold-UI build from independent readable canonical code.
 * This source composition grants no native owner or runtime execution. */
import {readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {composeCurrentInverseNativeCanonicalSource,readCurrentInverseNativeCanonicalInputs,requireCurrentInverseNativeCanonicalOutput} from "./inverse-native-canonical-inputs.ts";
import type {CurrentInverseNativeCanonicalInputs} from "./inverse-native-canonical-inputs.ts";
import {currentPcbDiagnosticCSharpReviewSource,currentPcbDiagnosticCSharpRuntimeCompilerInput,packCurrentPcbDiagnosticCSharpReviewStorage} from "../server/src/current-pcb-diagnostic-csharp-review-storage.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_HELPER_PROFILE as PROFILE} from "../server/src/current-footprint-inverse-native-delete-cold-ui-helper-profile.ts";

function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_BUILD");}}
const hash=(value:string):string=>createHash("sha256").update(value).digest("hex");
export function generateFootprintInverseNativeDeleteColdUiSource(input:CurrentInverseNativeCanonicalInputs):Readonly<{helper:string;review:string;compiler:string;sourceBytes:number;sourceSha256:string;reviewBytes:number;reviewSha256:string;compilerBytes:number;compilerSha256:string}>{
 const source=composeCurrentInverseNativeCanonicalSource("inverse-native-delete-cold-ui.v1",input);const helper=packCurrentPcbDiagnosticCSharpReviewStorage(source);
 const compiler=currentPcbDiagnosticCSharpRuntimeCompilerInput(helper),review=currentPcbDiagnosticCSharpReviewSource(helper);
 const compilerBytes=Buffer.byteLength(compiler),reviewBytes=Buffer.byteLength(review),sourceBytes=Buffer.byteLength(helper);
 need(sourceBytes<=PROFILE.helperMaxBytes&&reviewBytes<=PROFILE.reviewMaxBytes&&compilerBytes<=PROFILE.compilerMaxBytes);requireCurrentInverseNativeCanonicalOutput("inverse-native-delete-cold-ui.v1",helper,review);
 return Object.freeze({helper,review,compiler,sourceBytes,sourceSha256:hash(helper),reviewBytes,reviewSha256:hash(review),compilerBytes,compilerSha256:hash(compiler)});
}
export function footprintInverseNativeDeleteColdUiIdentity(data:ReturnType<typeof generateFootprintInverseNativeDeleteColdUiSource>):string{
 return `/** Generated separate cold-UI identity; no lifecycle authority. */\n/* oxlint-disable unicorn/numeric-separators-style -- Generated exact reviewed byte/hash pins. */\nexport const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_HELPER_IDENTITY=Object.freeze(${JSON.stringify({schema:"private.current-footprint-inverse-native-delete-cold-ui-helper-identity.v1",layout:PROFILE.layout,sourceBytes:data.sourceBytes,sourceSha256:data.sourceSha256,reviewBytes:data.reviewBytes,reviewSha256:data.reviewSha256,compilerBytes:data.compilerBytes,compilerSha256:data.compilerSha256},null,2)}as const);\n`;
}
async function main():Promise<void>{
 const mode=process.argv[2];need(process.argv.length===3&&(mode==="--write"||mode==="--check"));
 const input=await readCurrentInverseNativeCanonicalInputs("inverse-native-delete-cold-ui.v1");const data=generateFootprintInverseNativeDeleteColdUiSource(input);
 const outputs=[{url:new URL("footprint-inverse-native-delete-cold-ui.ps1",import.meta.url),text:data.helper},{url:new URL("footprint-inverse-native-delete-cold-ui.cs",import.meta.url),text:data.review},{url:new URL("../server/src/current-footprint-inverse-native-delete-cold-ui-helper-identity.ts",import.meta.url),text:footprintInverseNativeDeleteColdUiIdentity(data)}];
 for(const output of outputs){if(mode==="--write"){await writeFile(output.url,output.text,{mode:0o644});}else{need(await readFile(output.url,"utf8")===output.text);}}
 process.stdout.write(`${JSON.stringify({ok:true,sourceBytes:data.sourceBytes,sourceSha256:data.sourceSha256,compilerBytes:data.compilerBytes,compilerSha256:data.compilerSha256,nativeExecuted:false})}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only immutable build command, never part of runtime.
if(import.meta.main){await main();}
