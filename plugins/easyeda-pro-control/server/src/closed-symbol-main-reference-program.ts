/** Private fixed custom-main compiler/parser. Data only; no transport or authority. */
import { canonicalJson, sha256Text } from "./core.ts";
import { buildMainClockReference, exact, validateClockControlScope, validateClockControls } from "./symbol-clock-controls.ts";
import type { ClockControls } from "./symbol-clock-controls.ts";

export const MAIN_REFERENCE_PROFILE = "private.exact-literal-main-reference.v1";
export const MAIN_REFERENCE_PACKAGE = '{"name":"easyeda-main-clock-reference","productName":"EasyEDA Main Clock Reference","version":"0.0.0","main":"main.cjs","private":true}\n';
export interface MainReferenceRequest {
  readonly profile: typeof MAIN_REFERENCE_PROFILE; readonly nonce: string; readonly operationId: string;
  readonly closedPlanSha256: string; readonly baselineCopyReceiptSha256: string; readonly baselineLogicalSha256: string;
  readonly baselineClosureClockSha256: string; readonly nativePinsSha256: string;
  readonly historyUuid: string; readonly createdAtLiteral: string; readonly referenceUtcMs: number;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("MAIN_REFERENCE_INPUT_REFUSED"); } }
export function validateMainReferenceRequest(input: unknown): Readonly<MainReferenceRequest> {
  const value = exact(input, ["profile", "nonce", "operationId", "closedPlanSha256", "baselineCopyReceiptSha256", "baselineLogicalSha256",
    "baselineClosureClockSha256", "nativePinsSha256", "historyUuid", "createdAtLiteral", "referenceUtcMs"]);
  need(value["profile"] === MAIN_REFERENCE_PROFILE);
  const historyUuid = value["historyUuid"], nonce = value["nonce"], operationId = value["operationId"];
  need(typeof nonce === "string" && /^[a-f0-9]{64}$/u.test(nonce) && typeof operationId === "string" && /^easyeda-\d{8}t\d{6}z-[a-f0-9]{8}$/u.test(operationId) &&
    typeof historyUuid === "string" && /^[a-f0-9]{32}$/u.test(historyUuid));
  const fields = ["closedPlanSha256", "baselineCopyReceiptSha256", "baselineLogicalSha256", "baselineClosureClockSha256", "nativePinsSha256"] as const;
  for (const field of fields) { need(typeof value[field] === "string" && /^[a-f0-9]{64}$/u.test(value[field])); }
  const scope = validateClockControlScope({ createdAtLiteral: value["createdAtLiteral"], referenceUtcMs: value["referenceUtcMs"] });
  return Object.freeze({ profile: MAIN_REFERENCE_PROFILE, nonce, operationId, historyUuid, ...scope,
    closedPlanSha256: String(value["closedPlanSha256"]), baselineCopyReceiptSha256: String(value["baselineCopyReceiptSha256"]), baselineLogicalSha256: String(value["baselineLogicalSha256"]),
    baselineClosureClockSha256: String(value["baselineClosureClockSha256"]), nativePinsSha256: String(value["nativePinsSha256"]) });
}

/** Internal fixed compiler. The owning runOnce adapter selects this exact data
 * from an original closed baseline; caller JSON never issues a reference.
 * No eval, VM, renderer, protocol, app import or arbitrary program argument.
 */
export function buildMainReferenceProgram(input: unknown): string {
  const request = validateMainReferenceRequest(input), requestText = canonicalJson(request);
  const observation = buildMainClockReference({ createdAtLiteral: request.createdAtLiteral, referenceUtcMs: request.referenceUtcMs });
  return `'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {app}=require('electron');
const expected=${requestText},requestSha256=${JSON.stringify(sha256Text(requestText))};
const root=path.resolve(__dirname,'..','..','..'),evidence=path.join(root,'evidence');
const samePath=(a,b)=>path.resolve(a).toLowerCase()===path.resolve(b).toLowerCase();
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let stage='BOOT',finished=false;
const tzAbsent=()=>Reflect.ownKeys(process.env).every(key=>typeof key==='string'&&key.toUpperCase()!=='TZ');
function write(name,value){const bytes=Buffer.from(JSON.stringify(value)+'\\n');assert.ok(bytes.length>0&&bytes.length<=32768);fs.writeFileSync(path.join(evidence,name),bytes,{flag:'wx'});}
function bounded(file,max){const f=fs.openSync(file,fs.constants.O_RDONLY);try{const s=fs.fstatSync(f);assert.ok(s.isFile()&&s.size>0&&s.size<=max);const bytes=fs.readFileSync(f);assert.equal(bytes.length,s.size);return bytes;}finally{fs.closeSync(f);}}
function fail(){if(finished)return;finished=true;try{write('failure.json',{profile:'private.main-reference-failure.v1',nonce:expected.nonce,requestSha256,stage});}finally{app.exit(1);}}
process.on('uncaughtException',fail);process.on('unhandledRejection',fail);
async function run(){
 assert.equal(path.basename(root),'easyeda-main-reference-'+expected.nonce);
 const identity={profile:'private.main-reference-identity.v1',nonce:expected.nonce,pid:process.pid,electron:process.versions.electron,chrome:process.versions.chrome,node:process.versions.node,
  appName:app.getName(),appPath:app.getAppPath(),resourcesPath:process.resourcesPath,executable:process.execPath,rendererCreated:false};
 write('identity.json',identity);
 assert.equal(process.platform,'win32');assert.equal(identity.electron,'41.2.1-jlc-sa-win-x64.2');assert.equal(identity.chrome,'146.0.7680.188');assert.equal(identity.node,'24.14.1');assert.ok(tzAbsent());
 assert.equal(identity.appName,'EasyEDA Main Clock Reference');assert.equal(app.getVersion(),'0.0.0');
 assert.ok(samePath(__dirname,path.join(root,'runtime','resources','app'))&&samePath(identity.appPath,__dirname));
 assert.ok(samePath(identity.resourcesPath,path.join(root,'runtime','resources'))&&samePath(identity.executable,path.join(root,'runtime','easyeda-pro.exe')));
 assert.deepEqual(process.argv.slice(1),['--user-data-dir='+path.join(root,'user-data'),'--disable-background-networking','--no-proxy-server','--lang=en-US','--easyeda-clock-reference=once']);
 for(const [name,relative]of[['userData','user-data'],['sessionData','session-data'],['logs','logs'],['crashDumps','crash-dumps']]){const target=path.join(root,relative);const info=fs.lstatSync(target);assert.ok(info.isDirectory()&&!info.isSymbolicLink());app.setPath(name,target);assert.ok(samePath(app.getPath(name),target));}
 for(const flag of ['disable-component-update','disable-domain-reliability','disable-breakpad'])app.commandLine.appendSwitch(flag);
 app.commandLine.appendSwitch('host-resolver-rules','MAP * ~NOTFOUND');
 const requestBytes=bounded(path.join(__dirname,'request.json'),8192);assert.equal(sha(requestBytes),requestSha256);assert.deepEqual(JSON.parse(requestBytes.toString('utf8')),expected);
 stage='HANDSHAKE';write('handshake.json',{...identity,profile:'private.main-reference-handshake.v1',requestSha256,userData:app.getPath('userData'),sessionData:app.getPath('sessionData'),logs:app.getPath('logs'),crashDumps:app.getPath('crashDumps'),tzEnvironmentAbsent:true});
 fs.writeFileSync(path.join(evidence,'handshake.ready'),'',{flag:'wx'});
 const deadline=Date.now()+10000;while(!fs.existsSync(path.join(evidence,'reference-admission.ready'))){assert.ok(Date.now()<deadline);await new Promise(resolve=>setTimeout(resolve,25));}
 assert.deepEqual(JSON.parse(bounded(path.join(evidence,'reference-admission.json'),2048).toString('utf8')),{profile:'private.main-reference-admission.v1',nonce:expected.nonce,pid:process.pid,requestSha256});
 stage='MAIN_REFERENCE';
 const actualDate=Date,actualProcess=process,actualEnv=process.env;
 const own=(owner,key)=>{const d=Object.getOwnPropertyDescriptor(owner,key);assert.ok(d&&Object.hasOwn(d,'value'));return d.value;};
 const prototype=own(actualDate,'prototype'),now=own(actualDate,'now'),names=['getTime','toISOString','getTimezoneOffset','getFullYear','getMonth','getDate','getHours','getMinutes','getSeconds','getMilliseconds'];
 const methods=names.map(name=>own(prototype,name));
 const retained=()=>{assert.equal(Date,actualDate);assert.equal(process,actualProcess);assert.equal(process.env,actualEnv);assert.ok(tzAbsent());assert.equal(own(actualDate,'prototype'),prototype);assert.equal(own(actualDate,'now'),now);for(let i=0;i<names.length;i++)assert.equal(own(prototype,names[i]),methods[i]);};
 retained();const mainReference=((globalThis)=>${observation})(Object.freeze({Date:actualDate,process:actualProcess}));retained();
 write('result.json',{profile:'private.main-reference-result.v1',nonce:expected.nonce,requestSha256,mainReference,mainDateIdentityRetained:true,rendererCreated:false,appClockDirectlyObserved:false,executionAuthorized:false});
 finished=true;app.exit(0);
}
const watchdog=setTimeout(fail,25000);watchdog.unref();void run().catch(fail);
`;
}

export function validateMainReferenceResult(input: unknown, expected: unknown): Readonly<{
  request: Readonly<MainReferenceRequest>; requestSha256: string; mainReference: ClockControls;
  appClockDirectlyObserved: false; executionAuthorized: false;
}> {
  const request = validateMainReferenceRequest(expected), requestSha256 = sha256Text(canonicalJson(request));
  const value = exact(input, ["profile", "nonce", "requestSha256", "mainReference", "mainDateIdentityRetained", "rendererCreated", "appClockDirectlyObserved", "executionAuthorized"]);
  need(value["profile"] === "private.main-reference-result.v1" && value["nonce"] === request.nonce && value["requestSha256"] === requestSha256 &&
    value["mainDateIdentityRetained"] === true && value["rendererCreated"] === false && value["appClockDirectlyObserved"] === false && value["executionAuthorized"] === false);
  const mainReference = validateClockControls(value["mainReference"], { createdAtLiteral: request.createdAtLiteral, referenceUtcMs: request.referenceUtcMs }, "main-reference");
  return Object.freeze({ request, requestSha256, mainReference, appClockDirectlyObserved: false, executionAuthorized: false });
}
