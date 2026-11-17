/** Rebuild the fixed native-only inverse purpose; never execute native code. */
import { readFile, writeFile } from "node:fs/promises";
import {readCurrentInverseNativeCanonicalInputs} from "./inverse-native-canonical-inputs.ts";
import { footprintInverseNativeContinuationV4Identity, generateFootprintInverseNativeContinuationV4Source } from "./footprint-inverse-native-continuation-v4-source.ts";

async function main():Promise<void>{
 const mode=process.argv[2];if(process.argv.length!==3||mode!=="--write"&&mode!=="--check"){throw new Error("INVERSE_NATIVE_LIFECYCLE_GENERATOR_ARGUMENTS");}
 const input=await readCurrentInverseNativeCanonicalInputs("inverse-native-continuation.v4");const data=generateFootprintInverseNativeContinuationV4Source(input);
 const outputs=[{url:new URL("footprint-inverse-native-continuation-v4.ps1",import.meta.url),text:data.helper},{url:new URL("footprint-inverse-native-continuation-v4.cs",import.meta.url),text:data.review},{url:new URL("../server/src/current-footprint-inverse-native-continuation-v4-identity.ts",import.meta.url),text:footprintInverseNativeContinuationV4Identity(data)}];
 for(const output of outputs){if(mode==="--write"){await writeFile(output.url,output.text,{mode:0o644});}else if(await readFile(output.url,"utf8")!==output.text){throw new Error("INVERSE_NATIVE_LIFECYCLE_GENERATION_CHANGED");}}
 process.stdout.write(`${JSON.stringify({ok:true,helperBytes:Buffer.byteLength(data.helper),compilerBytes:Buffer.byteLength(data.compiler),nativeExecuted:false})}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only immutable build command.
await main();
