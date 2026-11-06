import { buildEditorObservationProgram } from "./editor-observation-program.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { assertOriginalGeneratedPcbReadTarget as assertOriginalGeneratedFixtureTarget } from "./managed-pcb-fixture-read-target.ts";
import type { QualifiedGeneratedPcbReadTarget as QualifiedGeneratedFixtureTarget } from "./managed-pcb-fixture-read-target.ts";
import { z } from "zod";

export const generatedFixtureRegistrationResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.generated-fixture-path-registration.v1"),
  projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), rawWindowsPath: z.string().min(12).max(1024),
  beforeRegistrySha256: z.string().regex(/^[a-f0-9]{64}$/u), afterRegistrySha256: z.string().regex(/^[a-f0-9]{64}$/u),
  beforeCount: z.number().int().min(0).max(4096), afterCount: z.number().int().min(1).max(4096),
  registrationDispatched: z.boolean(), priorRegistrationPresent: z.boolean(), exactOtherRegistrationRosterUnchanged: z.literal(true),
  selectedRawPathMatched: z.literal(true), selectedNonCbbMatched: z.literal(true), recentPathRowMayHaveChanged: z.boolean(),
  projectNavigationDispatched: z.literal(false), cadEditDispatched: z.literal(false), explicitSaveDispatched: z.literal(false),
  persistentRegistrationVerified: z.literal(false), replayAllowed: z.literal(false), writerAuthority: z.literal(false),
}).strict().refine((value) => value.registrationDispatched === !value.priorRegistrationPresent &&
  value.recentPathRowMayHaveChanged === value.registrationDispatched && value.afterCount === value.beforeCount + Number(value.registrationDispatched));

/** Fixed main local-path registration used by manager vC/Client.openProject.
 * The server accepts only the original completed generated-file qualification.
 * This program is dispatched only by a fresh original opening owner after its
 * own checkpoint reproof. It opens one exact native backend path and may upsert
 * one recent-path row; it does not invoke design Save or UI navigation.
 */
export const GENERATED_FIXTURE_REGISTRATION_FUNCTION = `async function(target){
const root=globalThis,bad=()=>{throw new Error('GENERATED_FIXTURE_PATH_REGISTRATION_REFUSED');};
const own=(value,key)=>{const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))bad();return descriptor.value;};
if(!target||typeof target!=='object'||Array.isArray(target)||Object.getPrototypeOf(target)!==Object.prototype||Reflect.ownKeys(target).length!==5)bad();
for(const key of ['rawWindowsPath','projectUuid','branchUuid','documentUuid','expectedSourceSha256'])if(typeof own(target,key)!=='string')bad();
if(!/^[a-f0-9]{64}$/.test(target.projectUuid)||!/^[a-f0-9]{32}$/.test(target.branchUuid)||!/^[a-f0-9]{32}$/.test(target.documentUuid)||!/^[a-f0-9]{64}$/.test(target.expectedSourceSha256)||!/^Codex_(?:via_only|line_and_via|arc_line_and_via|circular_smt_pad)_[a-f0-9]{16}\\.eprj2$/.test(target.rawWindowsPath.slice(target.rawWindowsPath.lastIndexOf('\\\\')+1)))bad();
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
const ui=own(root,'UI'),host=own(root,'gVars'),bus=own(host,'messageBus'),call=method(bus,'rpcCall'),mode=own(root,'PRO_EDITOR_MODE'),crypto=root.crypto,subtle=crypto.subtle,digest=method(subtle,'digest'),Encoder=root.TextEncoder;
const empty=await(async()=>{${buildEditorObservationProgram("native-empty-start-page-guard")}})();
const check=()=>{empty.assertCurrent();methodCheck(call);methodCheck(digest);if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'messageBus')!==bus||own(root,'PRO_EDITOR_MODE')!==mode||mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'||root.crypto!==crypto||crypto.subtle!==subtle||root.TextEncoder!==Encoder)bad();
 const project=own(host,'currentProject');if(!project||typeof project!=='object'||Object.getPrototypeOf(project)!==Object.prototype||own(host,'isHistoryMode')!==false)bad();
 for(const key of ['projectId','branchUuid']){const d=Object.getOwnPropertyDescriptor(project,key);if(d){if(!Object.hasOwn(d,'value')||(key==='projectId'?d.value!==undefined:d.value!==undefined&&d.value!==''))bad();}else if(key in project)bad();}};
const plain=value=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
let cells=0;const canonical=(value,depth=0)=>{if(++cells>65536||depth>8)bad();if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);if(Array.isArray(value)){if(value.length>4096)bad();return '['+value.map(item=>canonical(item,depth+1)).join(',')+']';}plain(value);const keys=Reflect.ownKeys(value);if(keys.length>256||keys.some(key=>typeof key!=='string'))bad();return '{'+keys.sort().map(key=>JSON.stringify(key)+':'+canonical(own(value,key),depth+1)).join(',')+'}';};
const registry=async()=>{check();const response=await Reflect.apply(call.fn,bus,['/pro-mgr/api/client/getProjectPaths',{},0]);check();const message=plain(own(plain(response),'message'));if(own(message,'success')!==true)bad();const value=plain(own(message,'result')),keys=Reflect.ownKeys(value);if(keys.length>4096||keys.some(key=>typeof key!=='string'||!/^[a-f0-9]{64}$/.test(key)))bad();const result={};for(const key of keys.sort()){const entry=plain(own(value,key));if(typeof own(entry,'path')!=='string')bad();cells=0;const text=canonical(entry);if(text.length>16384)bad();result[key]=text;}return result;};
const hash=async value=>{const text=JSON.stringify(value);if(text.length>1048576)bad();const bytes=new Encoder().encode(text),raw=new Uint8Array(await Reflect.apply(digest.fn,subtle,['SHA-256',bytes]));check();return Array.from(raw,x=>x.toString(16).padStart(2,'0')).join('');};
check();const before=await registry(),beforeKeys=Object.keys(before).sort(),prior=Object.hasOwn(before,target.projectUuid);let dispatched=false;
const selected=(encoded)=>{const value=plain(JSON.parse(encoded));if(own(value,'path')!==target.rawWindowsPath||own(value,'isCbb')!==false)bad();};
if(prior)selected(before[target.projectUuid]);else{check();dispatched=true;const reply=await Reflect.apply(call.fn,bus,['/pro-mgr/api/client/openProject',[target.rawWindowsPath]]);check();const message=plain(own(plain(reply),'message'));if(own(message,'success')!==true)bad();const value=plain(own(message,'result'));if(Reflect.ownKeys(value).length!==1||!Object.hasOwn(value,target.projectUuid))bad();const item=plain(own(value,target.projectUuid));if(own(item,'path')!==target.rawWindowsPath||own(item,'isCbb')!==false||own(item,'readOnly')!==false)bad();}
const after=await registry(),afterKeys=Object.keys(after).sort();if(afterKeys.length!==beforeKeys.length+Number(dispatched)||!Object.hasOwn(after,target.projectUuid))bad();selected(after[target.projectUuid]);for(const key of beforeKeys){if(before[key]!==after[key])bad();}
const beforeRegistrySha256=await hash(before),afterRegistrySha256=await hash(after);check();
return JSON.stringify({schema:'easyeda-pro-control.generated-fixture-path-registration.v1',projectUuid:target.projectUuid,rawWindowsPath:target.rawWindowsPath,beforeRegistrySha256,afterRegistrySha256,beforeCount:beforeKeys.length,afterCount:afterKeys.length,registrationDispatched:dispatched,priorRegistrationPresent:prior,exactOtherRegistrationRosterUnchanged:true,selectedRawPathMatched:true,selectedNonCbbMatched:true,recentPathRowMayHaveChanged:dispatched,projectNavigationDispatched:false,cadEditDispatched:false,explicitSaveDispatched:false,persistentRegistrationVerified:false,replayAllowed:false,writerAuthority:false});}`;

export function generatedFixtureRegistrationArguments(qualified: QualifiedGeneratedFixtureTarget): readonly Readonly<{ value: unknown }>[] {
  assertOriginalGeneratedFixtureTarget(qualified);
  const value = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(qualified.target));
  return Object.freeze([Object.freeze({ value }), Object.freeze({ value: "register-generated-fixture" })]);
}
export function buildGeneratedFixtureRegistrationProgram(qualified: QualifiedGeneratedFixtureTarget): string {
  generatedFixtureRegistrationArguments(qualified);
  return `return JSON.parse(await (${GENERATED_FIXTURE_REGISTRATION_FUNCTION})(${JSON.stringify(qualified.target)}));`;
}
export function decodeGeneratedFixtureRegistrationReply(input: unknown, qualified: QualifiedGeneratedFixtureTarget): z.infer<typeof generatedFixtureRegistrationResultSchema> {
  assertOriginalGeneratedFixtureTarget(qualified);
  const replySchema = z.object({ type: z.literal("string"), value: z.string().max(32_768) }).strict();
  const envelope = z.object({ result: replySchema }).strict().parse(input);
  const result = generatedFixtureRegistrationResultSchema.parse(JSON.parse(envelope.result.value) as unknown);
  if (result.projectUuid !== qualified.target.projectUuid || result.rawWindowsPath !== qualified.target.rawWindowsPath) { throw new Error("Generated registration reply differs from its original issued target."); }
  return Object.freeze(result);
}
