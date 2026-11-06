import { z } from "zod";
import { buildEditorObservationProgram } from "./editor-observation-program.ts";
import { managedFixtureLibraryDirectoriesSchema } from "./managed-fixture-destination.ts";

export const managedFixtureEnvironmentObservationSchema = z.object({
  schema: z.literal("easyeda-pro-control.fixture-import-environment.v1"), mode: z.literal("HALF_OFFLINE"),
  libraryWindowsDirectories: managedFixtureLibraryDirectoriesSchema,
  candidatePredicate: z.literal("exclude-all-immediate-elib-names"), actualMainConfigDirectories: z.literal(true),
  systemLibNameAssumed: z.literal(false), libraryContentsRead: z.literal(false), libraryMigrationExcluded: z.literal(false),
}).strict();

/** Failed preflight observations describe only fixed local execution stages.
 * They contain no config values and confer no completion or retry authority. */
export const managedFixtureEnvironmentRefusalSchema = z.object({
  schema: z.literal("easyeda-pro-control.fixture-import-environment-refusal.v1"),
  stage: z.enum(["capture-context", "empty-start-page", "owner-before-fetch", "fetch-config", "response-metadata", "response-text", "config-envelope", "config-fields", "directory-roster", "owner-final"]),
  reason: z.enum(["predicate-refused", "empty-start-page-refused", "external-exception"]),
  configGetAttempted: z.boolean(), responseReceived: z.boolean(), responseTextAttempted: z.boolean(),
  responseStatus: z.number().int().min(0).max(599).nullable(),
  responseUrl: z.enum(["unobserved", "expected", "empty", "other"]),
  effectsUnknown: z.literal(true), retryAllowed: z.literal(false),
}).strict();

/** Same fixed local config GET used by pinned manager HA and UI Tai. c0 can
 * create configured directories/perform drive classification; it does not run
 * ju/JL or read library contents. Return only the actual resolved directory
 * roster, under the exact original empty StartPage and HALF_OFFLINE mode.
 * A native watcher owner must separately exclude candidates over the lifetime.
 */
export function buildManagedFixtureEnvironmentProgram(): string {
  return `let stage='capture-context',configGetAttempted=false,responseReceived=false,responseTextAttempted=false,responseStatus=null,responseUrl='unobserved';
try{
const root=globalThis,bad=()=>{throw new Error('FIXTURE_IMPORT_ENVIRONMENT_REFUSED');};
const own=(v,k)=>{const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const ui=own(root,'UI'),host=own(root,'gVars'),mode=own(root,'PRO_EDITOR_MODE'),fetcher=own(root,'fetch'),ResponseClass=own(root,'Response');
stage='empty-start-page';const guard=await(async()=>{${buildEditorObservationProgram("empty-start-page-guard")}})();
const check=()=>{guard.assertCurrent();if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(root,'PRO_EDITOR_MODE')!==mode||mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'||own(root,'fetch')!==fetcher||own(root,'Response')!==ResponseClass||typeof fetcher!=='function'||typeof ResponseClass!=='function')bad();};
stage='owner-before-fetch';check();stage='fetch-config';configGetAttempted=true;const response=await Reflect.apply(fetcher,root,['/api/client/config',{method:'GET'}]);responseReceived=true;check();
stage='response-metadata';
if(response instanceof ResponseClass){const status=response.status,url=response.url;responseStatus=Number.isInteger(status)&&status>=0&&status<=599?status:null;responseUrl=url==='https://client/api/client/config'?'expected':url===''?'empty':'other';}
if(!(response instanceof ResponseClass)||response.status!==200||response.redirected!==false||response.url!=='https://client/api/client/config'||response.bodyUsed!==false)bad();
stage='response-text';responseTextAttempted=true;const text=await response.text();check();if(typeof text!=='string'||text.length>262144)bad();
stage='config-envelope';
const decoded=JSON.parse(text),plain=value=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const reply=plain(decoded);if(own(reply,'success')!==true)bad();const config=plain(own(reply,'result'));
stage='config-fields';const directories=own(config,'systemLib'),reuse=own(config,'reuseBlock');
if(own(config,'platform')!=='win32'||!Array.isArray(directories)||Object.getPrototypeOf(directories)!==Array.prototype||directories.length<1||directories.length>4||!Array.isArray(reuse)||JSON.stringify(reuse)!==JSON.stringify(directories))bad();
stage='directory-roster';for(const value of directories)if(typeof value!=='string'||value.length>1024||!new RegExp(${JSON.stringify(String.raw`^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*[A-Za-z0-9_-]+$`)}).test(value)||value.slice(3).split('\\\\').some(part=>part.trim()!==part||/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(part)))bad();
if(new Set(directories.map(path=>path.toLowerCase())).size!==directories.length)bad();stage='owner-final';check();
return {schema:'easyeda-pro-control.fixture-import-environment.v1',mode:'HALF_OFFLINE',libraryWindowsDirectories:directories.slice(),candidatePredicate:'exclude-all-immediate-elib-names',actualMainConfigDirectories:true,systemLibNameAssumed:false,libraryContentsRead:false,libraryMigrationExcluded:false};
}catch(error){const d=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;
const message=d&&Object.hasOwn(d,'value')?d.value:undefined;
const reason=message==='FIXTURE_IMPORT_ENVIRONMENT_REFUSED'?'predicate-refused':message==='EDITOR_SHELL_READ_FAILED'?'empty-start-page-refused':'external-exception';
return {schema:'easyeda-pro-control.fixture-import-environment-refusal.v1',stage,reason,configGetAttempted,responseReceived,responseTextAttempted,responseStatus,responseUrl,effectsUnknown:true,retryAllowed:false};}`;
}
