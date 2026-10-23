import { z } from "zod";
import { CURRENT_UI_IMPLEMENTATION } from "./current-ui-implementation.ts";
import { EDITOR_OBSERVATION_209_PROVENANCE } from "./editor-observation209-profile.ts";
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
const documentType209 = z.number().int().min(0).max(14);
// The pinned UI's Log scope has one omitted slot. Preserve its representation
// Explicitly; never invent a numeric editor scope or silently remove the slot.
const knownGapScope209 = z.tuple([z.literal(4), z.literal(2), z.literal(5), z.literal(3),
  z.object({ unmappedScope: z.enum(["hole", "undefined", "null"]) }).strict(),
  // Zod literals admit -0 as 0; the native exact-shape guard rejects it.
  z.literal(0).refine((value) => !Object.is(value, -0))]);
const shortcut209 = shortcut.extend({ documentType: z.union([z.array(documentType209).max(MAX_SCOPES), knownGapScope209]) });
const payload209Schema = payloadSchema.extend({ shortcuts: z.array(shortcut209).max(MAX_RECORDS) }).refine((value) => {
  const gaps = value.shortcuts.filter((item) => item.documentType.some((scope) => typeof scope === "object")).length;
  return gaps <= (value.includeSystem ? 1 : 0);
});
export const SHORTCUT_KEYS_209_REFUSAL_STAGES = Object.freeze([
  "initial-environment", "public-method", "rpc-method", "locale-cache", "locale-methods", "timer-owner",
  "frame-owner", "editor-mode", "api-owner", "rpc-owner", "locale-owner", "locale-method-owner", "public-call",
  "result-array", "result-record", "result-keys", "result-key-token", "result-title", "result-document-types", "result-scenes",
  "sample-size", "sample-equality", "result-envelope", "deadline", "timer-cleanup",
] as const);
const refusal209Schema = z.object({ ok: z.literal(false), kind: z.literal("shortcut-key-refusal"),
  method: z.literal(SHORTCUT_KEYS_METHOD), includeSystem: z.boolean(), code: z.literal("SHORTCUT_KEYS_209_READ_REFUSED"),
  stage: z.enum(SHORTCUT_KEYS_209_REFUSAL_STAGES), sample: z.number().int().min(0).max(2),
  publicCallsAttempted: z.number().int().min(0).max(2), cleanupFailed: z.boolean(), partialResultsReturned: z.literal(false),
  keyboardExecutionAuthorized: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false) }).strict()
  .refine((value) => value.publicCallsAttempted <= value.sample);

const limitations = [
  "Observes the initialized hotkeys registry, not every menu/local shortcut, current focus, or whether a key would execute. includeSystem defaults to false; false returns vendor isCustomize entries only.",
  "Raw key tokens preserve spelling, order, duplicates and empty strings. The installed mapper can return Ctrl, Delete or Page Down despite its uppercase declaration union. Returned tokens are not native input instructions.",
  "Shortcut documentType uses its own 0-10 scope enum, not EDMT_EditorDocumentType; PCB is 4. Scenes use 1-6. No shortcut registration, callback invocation, key press, navigation, settings or design mutation is dispatched.",
  "Two complete bounded samples retain public receiver/method, frame, RPC and locale owners. Vendor-internal registry ownership and atomic locale-cache contents are not independently proved; malformed or changed output refuses without truncation or retry.",
  "At most 1024 records, 8 key tokens per record, 32 characters per token, 1024 title characters, 32 entries per scope array and 262144 UTF-8 bytes. Vendor enumeration/formatting occurs before these bounds and is not cancelled by the 10-second observation deadline. RPC bookkeeping and timers are incidental local effects.",
  "Source review and offline tests are not connected validation. The installed API 0.3.50 method is beta; newer documentation marks it obsolete since EDA 4.2. No newer get/getAll method is inferred to exist here.",
] as const;
const limitations209: string[] = limitations.map((limitation) => {
  if (limitation.startsWith("Shortcut documentType")) {
    return "Shortcut documentType is the raw UI registry scope 0-14, not EDMT_EditorDocumentType; PCB is 4, 11 is assembly variant, 12 NGSPICE, 13 SimulIDE and 14 waveform. The installed declaration lists only 0-10. Scenes remain 1-6. No registration, callback invocation, key press, navigation, settings or design mutation is dispatched.";
  }
  if (limitation.startsWith("Source review")) {
    return "Source review and offline tests are not connected validation. The installed API 0.3.59 method is beta; newer documentation marks it obsolete since EDA 4.2. No newer get/getAll method is inferred to exist here.";
  }
  return limitation;
});
limitations209.push(
  "A failed 209 observation returns only a fixed refusal code/first-failure stage, sample/call-attempt counters and cleanupFailed boolean, with ok:false and no partial shortcuts or raw vendor/native errors. These diagnostics locate the failed guard or call; they do not establish its cause or authorize a retry.",
  "For includeSystem:true only, one exact source-known scope shape [4,2,5,3,<gap>,0] may preserve its fifth slot as {unmappedScope:'hole'|'undefined'|'null'}. This is a tagged representation of the observed missing value, not a numeric scope, a repaired registry or verified Log-command identity. All other sparse, null or undefined scope slots refuse. No such exception applies to scenes or the older206 profile.",
);

export function queryShortcutKeys(input: unknown = {}): Record<string, unknown> {
  const query = shortcutKeysQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ path: SHORTCUT_KEYS_METHOD, method: SHORTCUT_KEYS_METHOD,
    effect: "configured-shortcut-registry-read", parameters: ["includeSystem"], invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(shortcutKeysRequestSchema) } : {}), limitations: [...limitations],
    provenance: { version: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
      apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
      uiVersion: CURRENT_UI_IMPLEMENTATION.version, uiSha256: CURRENT_UI_IMPLEMENTATION.sha256,
      implementationKind: "public-method-bounded-subset", liveValidation: "not-recorded" },
    additionalReviewedProvenance: [{ ...EDITOR_OBSERVATION_209_PROVENANCE,
      implementationKind: "public-method-bounded-subset", documentTypeRange: [0, 14],
      declarationScopeConformanceVerified: false, limitations: [...limitations209], liveValidation: "not-recorded" }] }] };
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
  return buildShortcutKeysProgramForScope(input, 10);
}

/** Source-reviewed 209 registry extends the raw scope enum beyond declarations.
 * Only this fixed wrapper widens its domain; callers cannot supply a maximum.
 */
export function buildShortcutKeys209Program(input: unknown): string {
  return buildShortcutKeysProgramForScope(input, 14);
}

function buildShortcutKeysProgramForScope(input: unknown, maxDocumentType: 10 | 14): string {
  const request = parseShortcutKeysRequest(input);
  const diagnostics209 = maxDocumentType === 14;
  const stage = (value: typeof SHORTCUT_KEYS_209_REFUSAL_STAGES[number]): string => diagnostics209 ? `diagnosticStage=${JSON.stringify(value)};` : "";
  const failure = diagnostics209 ? "firstFailureStage??=diagnosticStage;return refusal();" : "throw new Error('SHORTCUT_KEYS_READ_FAILED');";
  const cleanupFailure = diagnostics209 ? "cleanupFailed=true;firstFailureStage??='timer-cleanup';return refusal();" : failure;
  return `${diagnostics209 ? `let diagnosticStage='initial-environment',firstFailureStage,sample=0,publicCallsAttempted=0,cleanupFailed=false;
const refusal=()=>{const json=JSON.stringify({ok:false,kind:'shortcut-key-refusal',method:${JSON.stringify(SHORTCUT_KEYS_METHOD)},includeSystem:${request.arguments.includeSystem},code:'SHORTCUT_KEYS_209_READ_REFUSED',stage:firstFailureStage??diagnosticStage,sample,publicCallsAttempted,cleanupFailed,partialResultsReturned:false,keyboardExecutionAuthorized:false,cadAuthority:false,persistenceVerified:false});return {schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes:new TextEncoder().encode(json).byteLength,json};};
` : ""}let timer,clear;
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
${stage("public-method")}
const edaOwner=eda,bridgeUuid='7e06d286b1ac846ef7eab9c7f2a9ee40',owner=own(edaOwner,'sys_ShortcutKey'),getter=retainMethod(owner,'getShortcutKeys');
${stage("rpc-method")}
const bus=own(root,'_MSG_BUS2_EXTAPI_'),rpc=retainMethod(bus,'rpcCall');
${stage("locale-cache")}
const locale=plain(own(root,'Locale')),language=text(own(locale,'_curr'),32),cache=plain(own(locale,'_cache'));
if(language.length===0)bad();const currentCache=plain(own(cache,language)),englishCache=plain(own(cache,'en'));
${stage("locale-methods")}
const translate=fn(locale,'i18n'),contextTranslate=fn(locale,'_context_i18n'),getValue=fn(locale,'_getValue');
const currentDescriptor=Object.getOwnPropertyDescriptor(locale,'curr');
if(!currentDescriptor||Object.hasOwn(currentDescriptor,'value')||typeof currentDescriptor.get!=='function')bad();
${stage("timer-owner")}
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 ${diagnostics209 ? "if(expired)bad();" : ""}
 ${stage("frame-owner")}
 if(expired||root.top!==root||root.window!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))bad();
 ${stage("editor-mode")}
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 ${stage("api-owner")}
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||eda!==edaOwner||own(edaOwner,'extensionUuid')!==bridgeUuid||own(edaOwner,'sys_ShortcutKey')!==owner)bad();
 ${stage("rpc-owner")}
 if(own(root,'_MSG_BUS2_EXTAPI_')!==bus||own(host,'extensionApiMessageBus2')!==bus||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();getter.check();rpc.check();
 ${stage("locale-owner")}
 if(own(root,'Locale')!==locale||own(locale,'_curr')!==language||own(locale,'_cache')!==cache||own(cache,language)!==currentCache||own(cache,'en')!==englishCache)bad();
 ${stage("locale-method-owner")}
 if(fn(locale,'i18n')!==translate||fn(locale,'_context_i18n')!==contextTranslate||fn(locale,'_getValue')!==getValue)bad();
 const d=Object.getOwnPropertyDescriptor(locale,'curr');if(!d||Object.hasOwn(d,'value')||d.get!==currentDescriptor.get||d.set!==currentDescriptor.set||d.enumerable!==currentDescriptor.enumerable||d.configurable!==currentDescriptor.configurable)bad();
};
${diagnostics209 && request.arguments.includeSystem ? `const knownScopeGap=value=>{
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||own(value,'length')!==6)return;
 const d=Object.getOwnPropertyDescriptor(value,'4');
 if(d&&(!Object.hasOwn(d,'value')||d.value!==null&&d.value!==undefined))return;
 if(!d&&'4' in value)bad();
 const expected=['0','1','2','3','5','length',...(d?['4']:[])],keys=Reflect.ownKeys(value);
 if(keys.length!==expected.length||!keys.every(key=>expected.includes(key)))bad();
 for(const [index,wanted]of [[0,4],[1,2],[2,5],[3,3],[5,0]])if(own(value,String(index))!==wanted||Object.is(own(value,String(index)),-0))bad();
 return [4,2,5,3,{unmappedScope:!d?'hole':d.value===null?'null':'undefined'},0];
};` : ""}
const scopes=(value,min,max)=>{${diagnostics209 && request.arguments.includeSystem ? "if(min===0){const gap=knownScopeGap(value);if(gap)return gap;}" : ""}const n=dense(value,${MAX_SCOPES}),out=[];for(let i=0;i<n;i++){const item=own(value,String(i));if(!Number.isInteger(item)||item<min||item>max||Object.is(item,-0))bad();out.push(item);}return out;};
const project=value=>{
 ${stage("result-array")}
 const n=dense(value,${MAX_RECORDS}),result=[];${diagnostics209 ? "let gapCount=0;" : ""}
 for(let i=0;i<n;i++){
  ${stage("result-record")}
  const row=plain(own(value,String(i))),keys=Reflect.ownKeys(row);if(keys.length!==4||!keys.every(key=>['shortcutKey','title','documentType','scene'].includes(key)))bad();
  ${stage("result-keys")}
  const inputKeys=own(row,'shortcutKey'),count=dense(inputKeys,${MAX_KEYS}),shortcutKey=[];
  ${stage("result-key-token")}
  for(let j=0;j<count;j++)shortcutKey.push(text(own(inputKeys,String(j)),32));
  ${stage("result-title")}
  const title=text(own(row,'title'),1024);
  ${stage("result-document-types")}
  const documentType=scopes(own(row,'documentType'),0,${maxDocumentType});
  ${diagnostics209 ? "if(documentType.some(scope=>typeof scope==='object')&&++gapCount>1)bad();" : ""}
  ${stage("result-scenes")}
  const scene=scopes(own(row,'scene'),1,6);
  result.push({shortcutKey,title,documentType,scene});
 }
 return result;
};
const run=async()=>{
 const read=async()=>{${diagnostics209 ? "sample+=1;" : ""}check();${stage("public-call")}${diagnostics209 ? "publicCallsAttempted+=1;" : ""}const raw=await apply(getter.method,owner,[${request.arguments.includeSystem}]);check();const copied=project(raw);check();return copied;};
 const first=await read(),firstJson=JSON.stringify(first);${stage("sample-size")}if(new TextEncoder().encode(firstJson).byteLength>${SHORTCUT_KEYS_MAX_BYTES})bad();
 const second=await read();${stage("sample-equality")}if(JSON.stringify(second)!==firstJson)bad();check();
 ${stage("result-envelope")}
 const json=JSON.stringify({ok:true,kind:'shortcut-key-observation',method:${JSON.stringify(SHORTCUT_KEYS_METHOD)},includeSystem:${request.arguments.includeSystem},shortcuts:first,keyboardExecutionAuthorized:false,cadAuthority:false,persistenceVerified:false});
 const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${SHORTCUT_KEYS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SHORTCUT_KEYS_MAX_BYTES})bad();return envelope;
};
check();${stage("timer-owner")}const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{${stage("deadline")}expired=true;reject(new Error('SHORTCUT_KEYS_READ_FAILED'));},10000]);});
return await Promise.race([run(),timeout]);
}catch{${failure}}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{${cleanupFailure}}}}`;
}

export function validateShortcutKeysResult(input: unknown, raw: unknown): Record<string, unknown> {
  return validateShortcutKeysResultForGeneration(input, raw, false);
}

export function validateShortcutKeys209Result(input: unknown, raw: unknown): Record<string, unknown> {
  return validateShortcutKeysResultForGeneration(input, raw, true);
}

function validateShortcutKeysResultForGeneration(input: unknown, raw: unknown, generation209: boolean): Record<string, unknown> {
  const request = parseShortcutKeysRequest(input);
  const payload = (generation209 ? z.union([payload209Schema, refusal209Schema]) : payloadSchema).parse(raw);
  if (payload.includeSystem !== request.arguments.includeSystem) { throw new Error("Shortcut query result differs from its request."); }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > SHORTCUT_KEYS_MAX_BYTES) { throw new Error("Shortcut query exceeds its result bound."); }
  return { ...payload, effect: payload.ok ? "configured-shortcut-registry-read" : "configured-shortcut-registry-read-refused",
    authority: payload.ok ? "registry-observation-only;not-keyboard-execution-authorization" : "fixed-diagnostic-only;not-shortcut-data-or-keyboard-execution-authorization",
    completeShortcutInventory: false, focusVerified: false, declarationTokenConformanceVerified: false, liveValidation: "not-recorded",
    ...(generation209 ? { ...EDITOR_OBSERVATION_209_PROVENANCE, declarationScopeConformanceVerified: false, observationSucceeded: payload.ok } : {}),
    limitations: generation209 ? [...limitations209] : [...limitations] };
}
