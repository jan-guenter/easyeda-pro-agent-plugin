import { z } from "zod";
import { CURRENT_UI_IMPLEMENTATION } from "./current-ui-implementation.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const SHORTCUT_KEYS_METHOD = "eda.sys_ShortcutKey.getShortcutKeys";
export const SHORTCUT_KEYS_MAX_BYTES = 262_144;
const MAX_RECORDS = 1024;
const MAX_KEYS = 8;
const MAX_SCOPES = 32;
// oxlint-disable-next-line no-control-regex -- Preserve raw key/title spelling, but reject control bytes rather than silently removing them.
const boundedText = (maximum: number): z.ZodString => z.string().max(maximum).regex(/^[^\u0000-\u001F\u007F]*$/u);
const documentType = z.number().int().min(0).max(10);
const scene = z.number().int().min(1).max(6);
const shortcut = z.object({ shortcutKey: z.array(boundedText(32)).max(MAX_KEYS), title: boundedText(1024),
  documentType: z.array(documentType).max(MAX_SCOPES), scene: z.array(scene).max(MAX_SCOPES) }).strict();

export const shortcutKeysRequestSchema = z.object({ method: z.literal(SHORTCUT_KEYS_METHOD),
  arguments: z.object({ includeSystem: z.boolean().default(false) }).strict() }).strict();
export type ShortcutKeysRequest = z.infer<typeof shortcutKeysRequestSchema>;
export function parseShortcutKeysRequest(input: unknown): ShortcutKeysRequest { return shortcutKeysRequestSchema.parse(input); }
export const shortcutKeysQuerySchema = z.object({ method: z.literal(SHORTCUT_KEYS_METHOD).optional(), includeSchemas: z.boolean().default(false) }).strict();
const payloadSchema = z.object({ ok: z.literal(true), kind: z.literal("shortcut-key-observation"), method: z.literal(SHORTCUT_KEYS_METHOD),
  includeSystem: z.boolean(), shortcuts: z.array(shortcut).max(MAX_RECORDS), keyboardExecutionAuthorized: z.literal(false),
  cadAuthority: z.literal(false), persistenceVerified: z.literal(false) }).strict();

const limitations = [
  "Observes the initialized hotkeys registry, not every menu/local shortcut, current focus, or whether a key would execute. includeSystem defaults to false; false returns vendor isCustomize entries only.",
  "Raw key tokens preserve spelling, order, duplicates and empty strings. The installed mapper can return Ctrl, Delete or Page Down despite its uppercase declaration union. Returned tokens are not native input instructions.",
  "Shortcut documentType uses its own 0-10 scope enum, not EDMT_EditorDocumentType; PCB is 4. Scenes use 1-6. No shortcut registration, callback invocation, key press, navigation, settings or design mutation is dispatched.",
  "Two complete bounded samples retain public receiver/method, frame, RPC and locale owners. Vendor-internal registry ownership and atomic locale-cache contents are not independently proved; malformed or changed output refuses without truncation or retry.",
  "At most 1024 records, 8 key tokens per record, 32 characters per token, 1024 title characters, 32 entries per scope array and 262144 UTF-8 bytes. Vendor enumeration/formatting occurs before these bounds and is not cancelled by the 10-second observation deadline. RPC bookkeeping and timers are incidental local effects.",
  "Source review and offline tests are not connected validation. The installed API 0.3.50 method is beta; newer documentation marks it obsolete since EDA 4.2. No newer get/getAll method is inferred to exist here.",
] as const;

export function queryShortcutKeys(input: unknown = {}): Record<string, unknown> {
  const query = shortcutKeysQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ path: SHORTCUT_KEYS_METHOD, method: SHORTCUT_KEYS_METHOD,
    effect: "configured-shortcut-registry-read", parameters: ["includeSystem"], invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(shortcutKeysRequestSchema) } : {}), limitations: [...limitations],
    provenance: { version: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
      apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
      uiVersion: CURRENT_UI_IMPLEMENTATION.version, uiSha256: CURRENT_UI_IMPLEMENTATION.sha256,
      implementationKind: "public-method-bounded-subset", liveValidation: "not-recorded" } }] };
}

export function validateShortcutKeysArguments(input: unknown): Record<string, unknown> {
  const result = shortcutKeysRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** One literal public method on the retained extension instance. No caller
 * selectors, registry refresh, keyboard input or extension callback is used.
 */
export function buildShortcutKeysProgram(input: unknown): string {
  const request = parseShortcutKeysRequest(input);
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply;let expired=false;
const bad=()=>{throw new Error('SHORTCUT_KEYS_READ_FAILED');};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(owner,key)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();
 const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;
};
const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const fn=(owner,key)=>{const value=own(owner,key);if(typeof value!=='function')bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max||/[\\u0000-\\u001F\\u007F]/.test(value))bad();return value;};
const dense=(value,max)=>{
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');
 if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;
};
const retainMethod=(owner,key)=>{
 const chain=[owner];let method,methodOwner;
 for(let i=0;i<3;i++){const node=chain[i];if(!object(node))bad();const d=Object.getOwnPropertyDescriptor(node,key);
  if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();method=d.value;methodOwner=node;break;}
  chain.push(Object.getPrototypeOf(node));
 }
 if(typeof method!=='function')bad();
 return {method,check:()=>{for(let i=0;i<chain.length;i++){const node=chain[i];if(i>0&&Object.getPrototypeOf(chain[i-1])!==node)bad();if(node===methodOwner){if(own(node,key)!==method)bad();}else if(Object.hasOwn(node,key))bad();}}};
};
const location=root.location,href=location?.href,document=root.document;
const mode=own(root,'PRO_EDITOR_MODE'),ui=own(root,'UI'),host=own(root,'gVars');
const edaOwner=eda,bridgeUuid='7e06d286b1ac846ef7eab9c7f2a9ee40',owner=own(edaOwner,'sys_ShortcutKey'),getter=retainMethod(owner,'getShortcutKeys');
const bus=own(root,'_MSG_BUS2_EXTAPI_'),rpc=retainMethod(bus,'rpcCall');
const locale=plain(own(root,'Locale')),language=text(own(locale,'_curr'),32),cache=plain(own(locale,'_cache'));
if(language.length===0)bad();const currentCache=plain(own(cache,language)),englishCache=plain(own(cache,'en'));
const translate=fn(locale,'i18n'),contextTranslate=fn(locale,'_context_i18n'),getValue=fn(locale,'_getValue');
const currentDescriptor=Object.getOwnPropertyDescriptor(locale,'curr');
if(!currentDescriptor||Object.hasOwn(currentDescriptor,'value')||typeof currentDescriptor.get!=='function')bad();
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.top!==root||root.window!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))bad();
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||eda!==edaOwner||own(edaOwner,'extensionUuid')!==bridgeUuid||own(edaOwner,'sys_ShortcutKey')!==owner)bad();
 if(own(root,'_MSG_BUS2_EXTAPI_')!==bus||own(host,'extensionApiMessageBus2')!==bus||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();getter.check();rpc.check();
 if(own(root,'Locale')!==locale||own(locale,'_curr')!==language||own(locale,'_cache')!==cache||own(cache,language)!==currentCache||own(cache,'en')!==englishCache)bad();
 if(fn(locale,'i18n')!==translate||fn(locale,'_context_i18n')!==contextTranslate||fn(locale,'_getValue')!==getValue)bad();
 const d=Object.getOwnPropertyDescriptor(locale,'curr');if(!d||Object.hasOwn(d,'value')||d.get!==currentDescriptor.get||d.set!==currentDescriptor.set||d.enumerable!==currentDescriptor.enumerable||d.configurable!==currentDescriptor.configurable)bad();
};
const scopes=(value,min,max)=>{const n=dense(value,${MAX_SCOPES}),out=[];for(let i=0;i<n;i++){const item=own(value,String(i));if(!Number.isInteger(item)||item<min||item>max||Object.is(item,-0))bad();out.push(item);}return out;};
const project=value=>{
 const n=dense(value,${MAX_RECORDS}),result=[];
 for(let i=0;i<n;i++){
  const row=plain(own(value,String(i))),keys=Reflect.ownKeys(row);if(keys.length!==4||!keys.every(key=>['shortcutKey','title','documentType','scene'].includes(key)))bad();
  const inputKeys=own(row,'shortcutKey'),count=dense(inputKeys,${MAX_KEYS}),shortcutKey=[];for(let j=0;j<count;j++)shortcutKey.push(text(own(inputKeys,String(j)),32));
  result.push({shortcutKey,title:text(own(row,'title'),1024),documentType:scopes(own(row,'documentType'),0,10),scene:scopes(own(row,'scene'),1,6)});
 }
 return result;
};
const run=async()=>{
 const read=async()=>{check();const raw=await apply(getter.method,owner,[${request.arguments.includeSystem}]);check();const copied=project(raw);check();return copied;};
 const first=await read(),firstJson=JSON.stringify(first);if(new TextEncoder().encode(firstJson).byteLength>${SHORTCUT_KEYS_MAX_BYTES})bad();
 const second=await read();if(JSON.stringify(second)!==firstJson)bad();check();
 const json=JSON.stringify({ok:true,kind:'shortcut-key-observation',method:${JSON.stringify(SHORTCUT_KEYS_METHOD)},includeSystem:${request.arguments.includeSystem},shortcuts:first,keyboardExecutionAuthorized:false,cadAuthority:false,persistenceVerified:false});
 const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${SHORTCUT_KEYS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SHORTCUT_KEYS_MAX_BYTES})bad();return envelope;
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('SHORTCUT_KEYS_READ_FAILED'));},10000]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('SHORTCUT_KEYS_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('SHORTCUT_KEYS_READ_FAILED');}}}`;
}

export function validateShortcutKeysResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseShortcutKeysRequest(input);
  const payload = payloadSchema.parse(raw);
  if (payload.includeSystem !== request.arguments.includeSystem) { throw new Error("Shortcut query result differs from its request."); }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > SHORTCUT_KEYS_MAX_BYTES) { throw new Error("Shortcut query exceeds its result bound."); }
  return { ...payload, effect: "configured-shortcut-registry-read", authority: "registry-observation-only;not-keyboard-execution-authorization",
    completeShortcutInventory: false, focusVerified: false, declarationTokenConformanceVerified: false, liveValidation: "not-recorded", limitations: [...limitations] };
}
