/** Fixed build-source custody for the new inverse native profiles only.
 * Canonical code is inert input, never an owner or runtime execution request. */
import {createHash} from "node:crypto";
import {constants} from "node:fs";
import type {Stats} from "node:fs";
import {lstat,open,realpath} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {CURRENT_INVERSE_NATIVE_CANONICAL_BASELINES as BASELINES} from "./inverse-native-canonical-baselines.ts";
import {projectCurrentFootprintInverseNativeContinuationV4TypeAliases} from "../server/src/current-footprint-inverse-native-continuation-v4-type-aliases.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES as V4_REVIEW} from "../server/src/current-footprint-inverse-native-v4-build-profile.ts";
import {CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as HELPER_MAXIMUM} from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";

export type CurrentInverseNativeCanonicalLayout=keyof typeof BASELINES;
export interface CurrentInverseNativeCanonicalInputs {readonly ownerSource:string;readonly driverSource:string}
type ByteIdentity=Readonly<{bytes:number;sha256:string}>;
type Pin=ByteIdentity&Readonly<{relativePath:string}>;
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_CANONICAL_SOURCE");}}
const hash=(source:string|Buffer):string=>createHash("sha256").update(source).digest("hex");
function baseline(layout:CurrentInverseNativeCanonicalLayout):typeof BASELINES[CurrentInverseNativeCanonicalLayout]{
 need(layout==="inverse-native-continuation.v4"||layout==="inverse-native-delete-cold-ui.v1");return BASELINES[layout];
}
function exact(source:string,pin:ByteIdentity,maximum:number):void{
 need(typeof source==="string"&&pin.bytes>0&&pin.bytes<=maximum&&Buffer.byteLength(source)===pin.bytes&&hash(source)===pin.sha256&&!Buffer.from(source).some(byte=>byte===0||byte>127));
}
function same(first:Stats,last:Stats):boolean{return first.dev===last.dev&&first.ino===last.ino&&first.mode===last.mode&&first.size===last.size&&first.mtimeMs===last.mtimeMs&&first.ctimeMs===last.ctimeMs&&last.nlink===1;}
async function read(pin:Pin,maximum:number):Promise<string>{
 need(pin.bytes>0&&pin.bytes<=maximum);const path=fileURLToPath(new URL(`../${pin.relativePath}`,import.meta.url));const named=await lstat(path);need(named.isFile()&&!named.isSymbolicLink()&&named.nlink===1&&named.size===pin.bytes);
 // oxlint-disable-next-line no-bitwise -- Only the fixed immutable source may be read, never a symlink, FIFO or substituted pathname.
 const file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
 try{const before=await file.stat();need(before.isFile()&&same(named,before)&&await realpath(path)===path);const bytes=Buffer.alloc(pin.bytes+1);let count=0;
  while(count<bytes.length){const result=await file.read(bytes,count,bytes.length-count,null);if(result.bytesRead===0){break;}count+=result.bytesRead;}
  const after=await file.stat(),final=await lstat(path);need(count===pin.bytes&&same(before,after)&&same(before,final)&&!final.isSymbolicLink());const source=bytes.subarray(0,count).toString("utf8");exact(source,pin,maximum);return source;
 }finally{await file.close();}
}
/** Exact canonical source can be supplied to pure build composition. Its hashes,
 * fixed layout and bounds grant no ability to create or resume a native owner. */
export function requireCurrentInverseNativeCanonicalInputs(layout:CurrentInverseNativeCanonicalLayout,input:CurrentInverseNativeCanonicalInputs):CurrentInverseNativeCanonicalInputs{
 const row=baseline(layout);need(typeof input==="object"&&input!==null&&Object.keys(input).length===2&&Object.hasOwn(input,"ownerSource")&&Object.hasOwn(input,"driverSource"));
 // Capture each untrusted build-source property once. Later getters/proxies
 // Cannot replace code between exact validation and fixed composition.
 const snapshot=Object.freeze({ownerSource:input.ownerSource,driverSource:input.driverSource});
 exact(snapshot.ownerSource,row.owner,layout==="inverse-native-continuation.v4"?V4_REVIEW:HELPER_MAXIMUM);exact(snapshot.driverSource,row.driver,HELPER_MAXIMUM);
 need(snapshot.driverSource.split(row.marker).length===2&&!snapshot.driverSource.includes("Add-Type"));return snapshot;
}
export async function readCurrentInverseNativeCanonicalInputs(layout:CurrentInverseNativeCanonicalLayout):Promise<CurrentInverseNativeCanonicalInputs>{
 const row=baseline(layout);const ownerSource=await read(row.owner,layout==="inverse-native-continuation.v4"?V4_REVIEW:HELPER_MAXIMUM);const driverSource=await read(row.driver,HELPER_MAXIMUM);return requireCurrentInverseNativeCanonicalInputs(layout,Object.freeze({ownerSource,driverSource}));
}
/** Keep the independently pinned canonical driver, replacing its sole fixed
 * source insertion marker; no generated target is read as a build input. */
export function composeCurrentInverseNativeCanonicalSource(layout:CurrentInverseNativeCanonicalLayout,input:CurrentInverseNativeCanonicalInputs):string{
 const snapshot=requireCurrentInverseNativeCanonicalInputs(layout,input);const compilerSource=layout==="inverse-native-continuation.v4"?projectCurrentFootprintInverseNativeContinuationV4TypeAliases(snapshot.ownerSource):snapshot.ownerSource;return snapshot.driverSource.replace(baseline(layout).marker,`Add-Type @'
${compilerSource}
'@
`);
}
/** Exact fork parity refuses drift in a codec or driver. A deliberate new
 * canonical source version requires its own reviewed input/output provenance. */
export function requireCurrentInverseNativeCanonicalOutput(layout:CurrentInverseNativeCanonicalLayout,helper:string,review:string):void{
 const row=baseline(layout);exact(helper,row.outputHelper,HELPER_MAXIMUM);exact(review,row.outputReview,layout==="inverse-native-continuation.v4"?V4_REVIEW:HELPER_MAXIMUM);
}
