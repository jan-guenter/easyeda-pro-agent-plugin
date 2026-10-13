import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

export const STARTUP_EXTENSIONS_API_VERSION = "0.3.50.ab46409c";
export const STARTUP_EXTENSIONS_API_SHA256 = "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76";
export const STARTUP_EXTENSIONS_UI_VERSION = "3.2.196.26ed3d6c";
export const STARTUP_EXTENSIONS_UI_SHA256 = "3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a";
export const STARTUP_EXTENSIONS_BRIDGE_UUID = "7e06d286b1ac846ef7eab9c7f2a9ee40";
export const STARTUP_EXTENSIONS_MAX_BYTES = 65_536;
const MAX_ENTRIES = 128;
const MAX_EVENTS = 32;
const eventKeyPattern = /^[A-Za-z][A-Za-z0-9]{0,63}$/u;
// oxlint-disable-next-line no-control-regex -- Metadata must reject embedded control bytes rather than normalize private or malformed strings.
const text = (maximum: number): z.ZodString => z.string().min(1).max(maximum).regex(/^[^\u0000-\u001F\u007F]+$/u);
const eventValue = z.union([z.boolean(), text(128), z.array(text(128)).max(32)]);
const activationEvents = z.record(z.string().regex(eventKeyPattern).refine((value) => value !== "constructor" && value !== "prototype"), eventValue)
  .refine((value) => Object.keys(value).length <= MAX_EVENTS);
const extension = z.object({
  uuid: z.string().regex(/^[a-z0-9]{32}$/u),
  config: z.object({ name: text(128), version: text(128), entry: text(512), activationEvents: activationEvents.optional() }).strict(),
  isEnable: z.boolean(), isAutoUpdate: z.boolean(), isOnlineSync: z.boolean(),
}).strict();
const payloadSchema = z.object({
  ok: z.literal(true), kind: z.literal("startup-extension-index"), action: z.literal("list-startup-index"),
  databaseActorBound: z.literal(false), startupQualified: z.literal(false),
  extensions: z.array(extension).min(1).max(MAX_ENTRIES),
}).strict().refine((value) => new Set(value.extensions.map((item) => item.uuid)).size === value.extensions.length &&
  value.extensions.some((item) => item.uuid === STARTUP_EXTENSIONS_BRIDGE_UUID));

export const startupExtensionsRequestSchema = z.object({ action: z.literal("list-startup-index") }).strict();
export type StartupExtensionsRequest = z.infer<typeof startupExtensionsRequestSchema>;
export function parseStartupExtensionsRequest(input: unknown): StartupExtensionsRequest { return startupExtensionsRequestSchema.parse(input); }

const limitations = [
  "Observed initialized user-extension database index only. No builtin manifest, file content, user configuration, credentials or account identifiers are returned.",
  "Stable UI actor UUIDs do not bind the API's database actor. Account switching initializes that database asynchronously; an observation can lag the UI account. databaseActorBound and startupQualified remain false.",
  "An index row does not establish current loaded code, completed activation, sole bridge ownership, or permission for a future application launch. Enabled entries can run even without startup activation flags.",
  "Two owner/actor-stable samples preserve row order, raw entry strings, optional activation events and literal false values. No defaults or completeness are inferred from logged-out empty results.",
  "The fixed RPC reads an already-open IndexedDB database with readonly transactions; it does not initialize, create, upgrade or change extensions. RPC bookkeeping and deadline timers are local effects; vendor error handling may log diagnostics.",
  "Results are limited to 128 entries and 65536 UTF-8 bytes. The vendor cursor internally enumerates all entries before returning; this work is neither bounded nor cancelled by the observer's 10-second deadline. Timeout never authorizes a retry or startup.",
] as const;

export const startupExtensionsQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryStartupExtensions(input: unknown = {}): Record<string, unknown> {
  const query = startupExtensionsQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{
    action: "list-startup-index", effect: "initialized-user-extension-index-read", invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(startupExtensionsRequestSchema) } : {}),
    limitations: [...limitations], provenance: { apiVersion: STARTUP_EXTENSIONS_API_VERSION, apiSha256: STARTUP_EXTENSIONS_API_SHA256,
      uiVersion: STARTUP_EXTENSIONS_UI_VERSION, uiSha256: STARTUP_EXTENSIONS_UI_SHA256, implementationKind: "fixed-native-index-observer", liveValidation: "not-recorded" },
  }] };
}

export function validateStartupExtensionsArguments(input: unknown): Record<string, unknown> {
  const result = startupExtensionsRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** Fixed read-only vendor topic. Private API state and database handles are not
 * exposed; the coordinator separately pins API/UI bytes and authenticates.
 */
export function buildStartupExtensionsProgram(input: unknown): string {
  parseStartupExtensionsRequest(input);
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply;let expired=false;
const bad=()=>{throw new Error('STARTUP_EXTENSIONS_READ_FAILED');};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(owner,key,optional=false)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();
 const d=Object.getOwnPropertyDescriptor(owner,key);
 if(!d){if(optional&&!(key in owner))return undefined;bad();}
 if(!Object.hasOwn(d,'value'))bad();return d.value;
};
const string=(value,max)=>{if(typeof value!=='string'||value.length<1||value.length>max||/[\\u0000-\\u001F\\u007F]/.test(value))bad();return value;};
const boolean=value=>{if(typeof value!=='boolean')bad();return value;};
const dense=(value,max)=>{
 if(!Array.isArray(value))bad();const n=own(value,'length');
 if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();
 for(let i=0;i<n;i++)own(value,String(i));return n;
};
const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const uuid=value=>{if(typeof value!=='string'||!/^[a-z0-9]{32}$/.test(value))bad();return value;};
const location=root.location,href=location?.href,document=root.document;
const mode=own(root,'PRO_EDITOR_MODE'),ui=own(root,'UI'),host=own(root,'gVars');
const cookies=own(host,'globalVariableCookieData'),actor=own(cookies,'userInfo'),startupActor=own(host,'loginedUserInfo');
const actorUuid=uuid(own(actor,'uuid'));
if(uuid(own(startupActor,'uuid'))!==actorUuid)bad();
const bridgeUuid=${JSON.stringify(STARTUP_EXTENSIONS_BRIDGE_UUID)},edaOwner=eda;
if(own(edaOwner,'extensionUuid')!==bridgeUuid)bad();
const bus=own(root,'_MSG_BUS2_EXTAPI_'),chain=[bus];let method,methodOwner;
for(let i=0;i<3;i++){
 const node=chain[i];if(!object(node))bad();const d=Object.getOwnPropertyDescriptor(node,'rpcCall');
 if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();method=d.value;methodOwner=node;break;}
 chain.push(Object.getPrototypeOf(node));
}
if(typeof method!=='function')bad();
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');
if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.top!==root||root.window!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))bad();
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'globalVariableCookieData')!==cookies||own(cookies,'userInfo')!==actor||own(host,'loginedUserInfo')!==startupActor||own(actor,'uuid')!==actorUuid||own(startupActor,'uuid')!==actorUuid)bad();
 if(eda!==edaOwner||own(edaOwner,'extensionUuid')!==bridgeUuid||own(root,'_MSG_BUS2_EXTAPI_')!==bus||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
 for(let i=0;i<chain.length;i++){
  const node=chain[i];if(i>0&&Object.getPrototypeOf(chain[i-1])!==node)bad();
  if(node===methodOwner){if(own(node,'rpcCall')!==method)bad();}else if(Object.hasOwn(node,'rpcCall'))bad();
 }
};
const events=value=>{
 plain(value);const keys=Reflect.ownKeys(value);if(keys.length>${MAX_EVENTS})bad();const result={};
 for(const key of keys){
  if(typeof key!=='string'||!/^[A-Za-z][A-Za-z0-9]{0,63}$/.test(key)||key==='constructor'||key==='prototype'||key==='__proto__')bad();
  const current=own(value,key);let projected;
  if(typeof current==='boolean')projected=current;
  else if(typeof current==='string')projected=string(current,128);
  else {const n=dense(current,32);projected=[];for(let i=0;i<n;i++)projected.push(string(own(current,String(i)),128));}
  Object.defineProperty(result,key,{value:projected,enumerable:true,writable:true,configurable:true});
 }
 return result;
};
const project=value=>{
 const n=dense(value,${MAX_ENTRIES});if(n===0)bad();const seen=new Set(),result=[];
 for(let i=0;i<n;i++){
  const row=plain(own(value,String(i))),id=uuid(own(row,'uuid')),config=plain(own(row,'config'));
  if(seen.has(id)||uuid(own(config,'uuid'))!==id)bad();seen.add(id);
  const eventDescriptor=Object.getOwnPropertyDescriptor(config,'activationEvents');
  if(!eventDescriptor&&'activationEvents' in config)bad();
  const eventData=eventDescriptor?events(own(config,'activationEvents')):undefined;
  result.push({uuid:id,config:{name:string(own(config,'name'),128),version:string(own(config,'version'),128),entry:string(own(config,'entry'),512),...(eventDescriptor?{activationEvents:eventData}:{})},
   isEnable:boolean(own(row,'isEnable')),isAutoUpdate:boolean(own(row,'isAutoUpdate')),isOnlineSync:boolean(own(row,'isOnlineSync'))});
 }
 if(!seen.has(bridgeUuid))bad();return result;
};
const run=async()=>{
 const read=async()=>{check();const raw=await apply(method,bus,['extensionApi.getExtensionsIndex']);check();const result=project(raw);check();return result;};
 const first=await read(),firstJson=JSON.stringify(first);
 if(new TextEncoder().encode(firstJson).byteLength>${STARTUP_EXTENSIONS_MAX_BYTES})bad();
 const second=await read();if(JSON.stringify(second)!==firstJson)bad();check();
 const json=JSON.stringify({ok:true,kind:'startup-extension-index',action:'list-startup-index',databaseActorBound:false,startupQualified:false,extensions:first});
 const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${STARTUP_EXTENSIONS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${STARTUP_EXTENSIONS_MAX_BYTES})bad();return envelope;
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('STARTUP_EXTENSIONS_READ_FAILED'));},10000]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('STARTUP_EXTENSIONS_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('STARTUP_EXTENSIONS_READ_FAILED');}}}`;
}

export function validateStartupExtensionsResult(input: unknown, raw: unknown): Record<string, unknown> {
  parseStartupExtensionsRequest(input);
  const payload = payloadSchema.parse(raw);
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > STARTUP_EXTENSIONS_MAX_BYTES) { throw new Error("Startup extension index exceeds its result bound."); }
  return { ...payload, effect: "initialized-user-extension-index-read", authority: "index-observation-only;not-startup-or-extension-execution-authorization",
    builtinInventoryIncluded: false, codeContentVerified: false, activationCompletionVerified: false, startupAuthorized: false,
    apiVersion: STARTUP_EXTENSIONS_API_VERSION, apiSha256: STARTUP_EXTENSIONS_API_SHA256,
    uiVersion: STARTUP_EXTENSIONS_UI_VERSION, uiSha256: STARTUP_EXTENSIONS_UI_SHA256, limitations: [...limitations] };
}
