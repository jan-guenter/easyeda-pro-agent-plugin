import { createHash } from "node:crypto";
import { win32 } from "node:path";
import { z } from "zod";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";

export const MANAGED_FIXTURE_IMPORT_PROGRAM_MAX_BYTES = 65_536;
export const MANAGED_FIXTURE_IMPORT_INLINE_ARCHIVE_MAX_BYTES = 32_768;
const hex = z.string().regex(/^[a-f0-9]{64}$/u);
const returnedUuid = z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u);
const returnedProjectSchema = z.object({ itemType: z.literal("Project"), uuid: returnedUuid, friendlyName: z.string().min(1).max(96),
  teamUuid: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/u), folderUuid: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/u).nullable(),
  folderUuidWasUndefined: z.boolean() }).strict().refine((value) => value.folderUuidWasUndefined === (value.folderUuid === null));
const planSchema = z.object({ operationId: z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u), nonce: hex,
  archiveName: z.string().max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*\.epro2$/u),
  // This internal builder does not reserve or grant authority over this path.
  // A separate native owner must issue and bind its exclusive destination.
  destinationWindowsDirectory: z.string().min(8).max(1024).regex(/^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*[A-Za-z0-9_-]+$/u)
    .refine((value) => value.slice(3).split("\\").every((part) => part.trim() === part &&
      !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/iu.test(part)), "Windows path aliases are unsupported."),
}).strict();
export const managedFixtureImportJobObservationSchema = z.object({
  schema: z.literal("easyeda-pro-control.managed-fixture-import-job-observation.v1"), operationId: z.string(), nonce: hex,
  archiveSha256: hex, qualificationSha256: hex, expectedProjectUuid: hex, expectedIdentityMatched: z.boolean(), state: z.enum(["pending", "sdk-settled"]),
  sdkOutcome: z.enum(["pending", "fulfilled-project", "fulfilled-undefined", "fulfilled-other", "rejected", "synchronous-throw"]),
  returnedUuid: returnedUuid.nullable(), returnedProject: returnedProjectSchema.nullable(), ownerIntact: z.boolean(), originalPromiseRetained: z.boolean(),
  dispatchAttempted: z.literal(true), nativeEffectsMayHaveOccurred: z.literal(true), retryAllowed: z.literal(false),
  delayedNativeJobsCompleted: z.literal(false), registrationVerified: z.literal(false), closedSqlVerified: z.literal(false),
  originalClosureVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict().refine((value) => (value.state === "pending") === (value.sdkOutcome === "pending") &&
  (value.sdkOutcome === "fulfilled-project") === (value.returnedUuid !== null) &&
  (value.returnedProject === null) === (value.returnedUuid === null) &&
  (value.returnedProject === null || value.returnedProject.uuid === value.returnedUuid) &&
  (!value.expectedIdentityMatched || value.returnedUuid === value.expectedProjectUuid) &&
  (value.sdkOutcome === "synchronous-throw" || value.originalPromiseRetained), "Contradictory original-job observation.");

/** Bind serialized observation to the original supplied plan and archive. This
 * is comparison only. It issues no native owner or registration authority. */
export function validateManagedFixtureImportJobObservation(raw: unknown, input: unknown, archive: Buffer): z.infer<typeof managedFixtureImportJobObservationSchema> {
  const plan = planSchema.parse(input), qualification = qualifyManagedFixtureArchive(archive);
  const result = managedFixtureImportJobObservationSchema.parse(raw);
  const expectedProjectUuid = createHash("sha256").update(win32.join(plan.destinationWindowsDirectory, qualification.expectedDestinationBasename), "utf8").digest("hex");
  const expectedIdentityMatched = result.returnedProject !== null && result.returnedProject.uuid === expectedProjectUuid &&
    result.returnedProject.friendlyName === qualification.manifest.title;
  if (result.operationId !== plan.operationId || result.nonce !== plan.nonce || result.archiveSha256 !== qualification.archiveSha256 ||
      result.qualificationSha256 !== qualification.qualificationSha256 || result.expectedProjectUuid !== expectedProjectUuid ||
      result.expectedIdentityMatched !== expectedIdentityMatched) { throw new Error("Fixture import observation differs from its original plan and archive."); }
  return result;
}

/** Dormant fixed SDK programs, deliberately unregistered. The first program
 * retains the sole original public Promise before returning. Observations never
 * invoke the importer again, and settlement never claims delayed task, SQL or
 * registration completion. A retained native Job/destination/closure owner is
 * still required before a runtime route may call these programs. */
export function buildManagedFixtureImportPrograms(input: unknown, archive: Buffer): Readonly<{
  launch: string; observe: string; archiveSha256: string; qualificationSha256: string;
}> {
  const plan = planSchema.parse(input), qualification = qualifyManagedFixtureArchive(archive);
  if (archive.length > MANAGED_FIXTURE_IMPORT_INLINE_ARCHIVE_MAX_BYTES) { throw new Error("Fixture archive exceeds the fixed inline import-program byte budget."); }
  const target = { ...plan, archiveSha256: qualification.archiveSha256, qualificationSha256: qualification.qualificationSha256,
    manifestTitle: qualification.manifest.title,
    expectedProjectUuid: createHash("sha256").update(win32.join(plan.destinationWindowsDirectory, qualification.expectedDestinationBasename), "utf8").digest("hex") };
  const slot = `__easyeda_fixture_import_${plan.nonce}`;
  const launch = `const target=${JSON.stringify(target)},root=globalThis,slot=${JSON.stringify(slot)};
const bad=()=>{throw new Error('MANAGED_FIXTURE_IMPORT_REFUSED');};
const own=(v,k)=>{const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const retain=(value,key)=>{const chain=[];let node=value,method;
 for(let i=0;node!==null&&i<8;i++){if(typeof node!=='object'&&typeof node!=='function')bad();const d=Object.getOwnPropertyDescriptor(node,key);
  if(!method&&d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();method=d.value;}chain.push({node,d});node=Object.getPrototypeOf(node);}
 if(node!==null||!method)bad();return {method,check:()=>{for(let i=0;i<chain.length;i++){const item=chain[i],next=chain[i+1]?.node??null,current=Object.getOwnPropertyDescriptor(item.node,key),before=item.d;
  if(Object.getPrototypeOf(item.node)!==next)bad();if(before===undefined){if(current!==undefined)bad();continue;}
  if(!current||current.value!==before.value||current.get!==before.get||current.set!==before.set||current.writable!==before.writable||current.enumerable!==before.enumerable||current.configurable!==before.configurable)bad();}}};};
if(Object.hasOwn(root,slot))bad();
const edaOwner=eda,host=own(root,'gVars'),ui=own(root,'UI'),mode=own(root,'PRO_EDITOR_MODE'),location=root.location,document=root.document,href=location?.href;
const manager=own(edaOwner,'sys_FileManager'),importer=retain(manager,'importProjectByProjectFile'),fn=importer.method,FileClass=own(root,'File'),decode=own(root,'atob');
const cryptoOwner=root.crypto,subtle=cryptoOwner?.subtle,hasher=retain(subtle,'digest'),digest=hasher.method,apply=Reflect.apply;
const check=()=>{if(root.top!==root||root.window!==root||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||root.location!==location||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!new RegExp('^https://client/editor[?]cll=(?:trace|debug|info|warn|error)#?$').test(href))bad();
 if(own(root,'gVars')!==host||own(root,'UI')!==ui||own(ui,'gVars')!==host||own(host,'currentProject')!=null||own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(edaOwner,'sys_FileManager')!==manager||own(root,'File')!==FileClass||own(root,'atob')!==decode||root.crypto!==cryptoOwner||cryptoOwner.subtle!==subtle||typeof FileClass!=='function'||typeof decode!=='function')bad();importer.check();hasher.check();};
check();const raw=apply(decode,root,[${JSON.stringify(archive.toString("base64"))}]),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
const hash=new Uint8Array(await apply(digest,subtle,['SHA-256',bytes]));check();
if(Array.from(hash,c=>c.toString(16).padStart(2,'0')).join('')!==target.archiveSha256)bad();
const file=new FileClass([bytes],target.archiveName,{type:'application/zip',lastModified:0});
if(file.name!==target.archiveName||file.size!==${archive.length}||file.type!=='application/zip')bad();
let state='pending',sdkOutcome='pending',returnedUuid=null,returnedProject=null,ownerIntact=true,promise;
const projectItem=value=>{try{if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype) return null;
 const keys=Reflect.ownKeys(value);if(keys.length<4||keys.length>5||!keys.every(key=>['itemType','uuid','friendlyName','teamUuid','folderUuid'].includes(key)))return null;
 const itemType=own(value,'itemType'),uuid=own(value,'uuid'),friendlyName=own(value,'friendlyName'),teamUuid=own(value,'teamUuid'),folderUuid=Object.hasOwn(value,'folderUuid')?own(value,'folderUuid'):undefined;
 if(itemType!=='Project'||typeof uuid!=='string'||!/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.test(uuid)||typeof friendlyName!=='string'||friendlyName.length<1||friendlyName.length>96||typeof teamUuid!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(teamUuid)||folderUuid!==undefined&&(typeof folderUuid!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(folderUuid)))return null;
 return {itemType,uuid,friendlyName,teamUuid,folderUuid:folderUuid??null,folderUuidWasUndefined:folderUuid===undefined};}catch{return null;}};
const snapshot=()=>({schema:'easyeda-pro-control.managed-fixture-import-job-observation.v1',operationId:target.operationId,nonce:target.nonce,archiveSha256:target.archiveSha256,qualificationSha256:target.qualificationSha256,expectedProjectUuid:target.expectedProjectUuid,expectedIdentityMatched:returnedProject!==null&&returnedProject.uuid===target.expectedProjectUuid&&returnedProject.friendlyName===target.manifestTitle,state,sdkOutcome,returnedUuid,returnedProject,ownerIntact,originalPromiseRetained:promise!==undefined,dispatchAttempted:true,nativeEffectsMayHaveOccurred:true,retryAllowed:false,delayedNativeJobsCompleted:false,registrationVerified:false,closedSqlVerified:false,originalClosureVerified:false,executionAuthorized:false});
const observe=()=>{try{check();}catch{ownerIntact=false;}return snapshot();};
const job=Object.freeze({operationId:target.operationId,nonce:target.nonce,archiveSha256:target.archiveSha256,qualificationSha256:target.qualificationSha256,observe});
Object.defineProperty(root,slot,{value:job,writable:false,configurable:false,enumerable:false});
try{check();promise=apply(fn,manager,[file,'EasyEDA Pro',{importOption:'ImportDocument'},{operation:'Offline Client Local Path',folderPath:target.destinationWindowsDirectory}]);
 if(!(promise instanceof Promise)){state='sdk-settled';sdkOutcome='fulfilled-other';promise=Promise.resolve(promise);}
 else promise.then(value=>{state='sdk-settled';returnedProject=projectItem(value);if(returnedProject!==null){returnedUuid=returnedProject.uuid;sdkOutcome='fulfilled-project';}else sdkOutcome=value===undefined?'fulfilled-undefined':'fulfilled-other';try{check();}catch{ownerIntact=false;}},()=>{state='sdk-settled';sdkOutcome='rejected';try{check();}catch{ownerIntact=false;}});
}catch{state='sdk-settled';sdkOutcome='synchronous-throw';}
return snapshot();`;
  const observe = `const target=${JSON.stringify(target)},d=Object.getOwnPropertyDescriptor(globalThis,${JSON.stringify(slot)});
if(!d||!Object.hasOwn(d,'value')||d.configurable!==false||d.writable!==false||d.enumerable!==false)throw new Error('MANAGED_FIXTURE_IMPORT_ORIGINAL_JOB_MISSING');
const job=d.value;if(!job||job.operationId!==target.operationId||job.nonce!==target.nonce||job.archiveSha256!==target.archiveSha256||job.qualificationSha256!==target.qualificationSha256||typeof job.observe!=='function'||!Object.isFrozen(job))throw new Error('MANAGED_FIXTURE_IMPORT_ORIGINAL_JOB_DIFFERENT');return job.observe();`;
  if ([launch, observe].some((value) => Buffer.byteLength(value, "utf8") > MANAGED_FIXTURE_IMPORT_PROGRAM_MAX_BYTES)) {
    throw new Error("Fixture import program exceeds its complete transport byte budget.");
  }
  return Object.freeze({ launch, observe, archiveSha256: qualification.archiveSha256, qualificationSha256: qualification.qualificationSha256 });
}
