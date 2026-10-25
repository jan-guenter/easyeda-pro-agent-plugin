import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { EDITOR_OBSERVATION_209_UI } from "./editor-observation209-profile.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "./sdk-public-utilities-profile.ts";

export const SDK_PUBLIC_READERS_MAX_BYTES = 8192;
export const SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION = 1_000_000;
export const SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID = "0819f05c4eef4c71ace90d822a990e87";
// Exact m2 return domain, including the vendor's edition fallback. This is
// Deliberately distinct from the API's supported-language catalog below.
export const SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES = Object.freeze([
  "zh-Hans", "zh-Hant", "en", "pl", "ja", "fr", "es", "de", "sv", "ru", "uk", "vi", "cs", "pt",
] as const);

// Exact ordered d2 constant from API 0.3.59.1ca9efb5. This comparison is a
// Completeness guard, not an offline substitute for calling the public method.
export const SDK_PUBLIC_READERS_209_LANGUAGES = Object.freeze([
  "ar", "bn", "cs", "de", "en", "es", "fr", "hi", "ja", "mr", "ms", "pa", "pl", "pt", "ru", "sv", "ta", "te", "uk", "ur", "vi", "zh",
  "zh-Hans", "zh-Hans-CN", "zh-Hans-HK", "zh-Hans-MO", "zh-Hans-SG", "zh-Hans-TW", "zh-Hant", "zh-Hant-CN", "zh-Hant-HK", "zh-Hant-MO", "zh-Hant-SG", "zh-Hant-TW",
  "en-boont", "en-scouse", "gan", "cdo", "cjy", "cmn", "cnp", "cpx", "csp", "czh", "czo", "hak", "hsn", "lzh", "mnp", "nan", "wuu", "yue",
] as const);
const emptyArguments = z.object({}).strict();
const language = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/u);
export const sdkPublicReadersRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("eda.sys_I18n.getAllSupportedLanguages"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_I18n.isLanguageSupported"), arguments: z.object({ language }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_I18n.getCurrentLanguage"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Window.getViewportSize"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Window.getCurrentTheme"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.getFrontendDataUnit"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.lib_LibrariesList.getSystemLibraryUuid"), arguments: emptyArguments }).strict(),
]);
export type SdkPublicReadersRequest = z.infer<typeof sdkPublicReadersRequestSchema>;
type PublicReaderMethod = SdkPublicReadersRequest["method"];
interface Definition {
  readonly namespace: "sys_I18n" | "sys_Window" | "sys_Unit" | "lib_LibrariesList";
  readonly name: "getAllSupportedLanguages" | "isLanguageSupported" | "getCurrentLanguage" | "getViewportSize" | "getCurrentTheme" | "getFrontendDataUnit" | "getSystemLibraryUuid";
  readonly parameters: readonly string[];
  readonly resultKind: "languages" | "boolean" | "resolved-language" | "viewport" | "theme" | "toolbar-unit" | "system-library-uuid";
  readonly effect: "language-catalog-read" | "sdk-resolved-language-read" | "extension-page-viewport-read" | "ui-theme-read" | "ui-toolbar-unit-read" | "system-library-identity-read";
  readonly limitation: string;
  readonly sourceOffsets: readonly number[];
  readonly documentationUrl: string;
  readonly uiSourceOffsets?: readonly number[];
}
const definitions: Record<PublicReaderMethod, Definition> = {
  "eda.sys_I18n.getAllSupportedLanguages": {
    namespace: "sys_I18n", name: "getAllSupportedLanguages", parameters: [], resultKind: "languages", effect: "language-catalog-read",
    limitation: "Returns the exact ordered 52-language catalog of API 0.3.59, preserving spelling and case. This is supported-language metadata, not the current UI language or a translation-completeness claim.",
    sourceOffsets: [1_845_521, 1_847_860], documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.getallsupportedlanguages.html",
  },
  "eda.sys_I18n.isLanguageSupported": {
    namespace: "sys_I18n", name: "isLanguageSupported", parameters: ["language"], resultKind: "boolean", effect: "language-catalog-read",
    limitation: "Exact case-sensitive membership in the reviewed 52-language catalog. Input is 1-64 ASCII letters, digits, hyphens or underscores; no case folding, trimming, alias resolution or locale normalization. A false result is not a current-language observation.",
    sourceOffsets: [468_267, 1_845_521, 1_846_324, 1_847_901], documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.islanguagesupported.html",
  },
  "eda.sys_I18n.getCurrentLanguage": {
    namespace: "sys_I18n", name: "getCurrentLanguage", parameters: [], resultKind: "resolved-language", effect: "sdk-resolved-language-read",
    limitation: "Observes only the SDK-resolved language enum. The legacy provider reads URL language, local preferences and environment defaults; the SDK maps aliases and may return an edition fallback after a missing/unknown reply or a provider exception. Neither provider success nor raw/current UI preference is verified. The available root/host legacy bus is retained, but the API's private cached bus identity is inaccessible and unverified. Legacy RPC bookkeeping includes a 300-second vendor timeout not cancelled on success; the adapter cannot cancel it. The 8192-byte reply bound does not bound the preceding vendor preferences parse.",
    sourceOffsets: [518_842, 1_523_878, 1_845_491, 1_846_360, 1_847_821],
    uiSourceOffsets: [1_647_030, 1_650_406, 8_089_452, 8_093_989, 8_791_495, 15_929_245, 15_930_435, 15_997_119, 16_377_407, 16_711_760, 16_738_959, 16_968_247],
    documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.getcurrentlanguage.html",
  },
  "eda.sys_Window.getViewportSize": {
    namespace: "sys_Window", name: "getViewportSize", parameters: [], resultKind: "viewport", effect: "extension-page-viewport-read",
    limitation: "Reads the public API window's page viewport in CSS pixels, not the OS window, screen, document canvas or PCB geometry. Width and height must be integers 0-1000000. Zero is retained, not interpreted as a visible or ready editor. Two synchronous matching samples do not prove later layout stability.",
    sourceOffsets: [1_893_138], documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.getviewportsize.html",
  },
  "eda.sys_Window.getCurrentTheme": {
    namespace: "sys_Window", name: "getCurrentTheme", parameters: [], resultKind: "theme", effect: "ui-theme-read",
    limitation: "Awaits the public method and accepts only the resolved light or dark UI theme. This does not read or change the follow-system preference, OS theme, schematic colors or PCB layer colors. Two matching observations do not guarantee later theme stability.",
    sourceOffsets: [1_892_867, 1_974_359], uiSourceOffsets: [8_977_909, 8_978_311, 10_445_066, 17_437_358, 17_456_623],
    documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.getcurrenttheme.html",
  },
  "eda.sys_Unit.getFrontendDataUnit": {
    namespace: "sys_Unit", name: "getFrontendDataUnit", parameters: [], resultKind: "toolbar-unit", effect: "ui-toolbar-unit-read",
    limitation: "This SDK method is beta. It awaits the global toolbar selection and accepts only mm, inch or mil. The reviewed handler maps unit(mm), unit(inch) and unit(mil) from an existing UI store; it does not resolve a document. This value may reflect the default or a previous selection and never establishes schematic coordinate scale, PCB native units or an active document's settings. Missing or other values refuse.",
    sourceOffsets: [1_325_714, 1_974_359], uiSourceOffsets: [8_224_908, 8_470_100, 8_472_344, 17_434_853, 17_445_971, 17_456_623],
    documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.getfrontenddataunit.html",
  },
  "eda.lib_LibrariesList.getSystemLibraryUuid": {
    namespace: "lib_LibrariesList", name: "getSystemLibraryUuid", parameters: [], resultKind: "system-library-uuid", effect: "system-library-identity-read",
    limitation: "Awaits the public method and requires the exact system-library UUID constant in the reviewed UI. The constant is a validation expectation, never a fallback result. No personal, team, favorite or project library enumeration, account lookup, asset retrieval, network request or write is performed. Missing and different values refuse.",
    sourceOffsets: [1_342_770, 1_974_359], uiSourceOffsets: [8_799_592, 17_214_753, 17_443_393, 17_456_623],
    documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.lib_librarieslist.getsystemlibraryuuid.html",
  },
};
const commonLimitations = [
  "Only the separately hash-admitted EasyEDA 3.2.209 / API 0.3.59 tuple. No admission of older, newer or unknown implementations, native adapters or general SDK dispatch.",
  "Two complete samples retain the same extension, namespace and method. Viewport reads retain the window object. UI-backed methods additionally require exact UI and selector files and retain the editor window, document, UI, host and method-specific available RPC bus around each await. No project, document, account, file, network, navigation, settings change or Save access is performed by these getters.",
  "Replies are bounded to 8192 UTF-8 bytes. Synchronous methods reject Promises; UI-backed methods await sequentially. Partial or malformed values, changed owners, unstable samples and oversized responses refuse without truncation or automatic retry. Source implementation and synthetic tests do not establish connected validation.",
  "UI-backed reads enforce a 10-second monotonic deadline around every await and before a second sample. The timer is cooperative; it does not cancel an outstanding vendor RPC or synchronous vendor work. The 60-second execution and 70-second transport limits are separate waiting bounds.",
] as const;
const provenance = Object.freeze({
  version: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.version,
  apiSha256: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.implementationSha256,
  declarationsSha256: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.declarationsSha256,
  implementationKind: "public-method-bounded-subset" as const,
  liveValidation: "not-recorded" as const,
});

export function parseSdkPublicReadersRequest(input: unknown): SdkPublicReadersRequest { return sdkPublicReadersRequestSchema.parse(input); }

export interface SdkPublicReadersDescriptor {
  path: PublicReaderMethod;
  method: PublicReaderMethod;
  inputSchema: Record<string, unknown>;
  parameters: string[];
  resultKind: Definition["resultKind"];
  effect: Definition["effect"];
  limitations: string[];
  invocationEnabledByDiscovery: false;
  provenance: typeof provenance;
  source: { utf16Offsets: number[]; documentationUrl: string };
  uiSource?: { version: string; sha256: string; utf16Offsets: number[] };
}

export function sdkPublicReadersDescriptors(): SdkPublicReadersDescriptor[] {
  return sdkPublicReadersRequestSchema.options.map((schema) => {
    const method = schema.shape.method.value;
    const definition = definitions[method];
    return { path: method, method, inputSchema: z.toJSONSchema(schema), parameters: [...definition.parameters], resultKind: definition.resultKind,
      effect: definition.effect, limitations: [...commonLimitations, definition.limitation], invocationEnabledByDiscovery: false, provenance,
      source: { utf16Offsets: [...definition.sourceOffsets], documentationUrl: definition.documentationUrl },
      ...(definition.uiSourceOffsets === undefined ? {} : { uiSource: { version: EDITOR_OBSERVATION_209_UI.version,
        sha256: EDITOR_OBSERVATION_209_UI.sha256, utf16Offsets: [...definition.uiSourceOffsets] } }) };
  });
}

export const sdkPublicReadersCatalogQuerySchema = z.object({
  method: z.enum(sdkPublicReadersRequestSchema.options.map((schema) => schema.shape.method.value)).optional(), includeSchemas: z.boolean().default(false),
}).strict();

export function querySdkPublicReadersMethods(input: unknown = {}): Record<string, unknown> {
  const query = sdkPublicReadersCatalogQuerySchema.parse(input);
  const entries = sdkPublicReadersDescriptors().filter((entry) => query.method === undefined || entry.method === query.method)
    .map(({ inputSchema, ...entry }) => query.includeSchemas ? Object.assign(entry, { inputSchema }) : entry);
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries };
}

export function validateSdkPublicReadersArguments(input: unknown): Record<string, unknown> {
  const result = sdkPublicReadersRequestSchema.safeParse(input);
  if (result.success) { return { valid: true, request: result.data, executionAuthorized: false }; }
  return { valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

export function sdkPublicReaderRequiresUi(request: SdkPublicReadersRequest): boolean {
  return definitions[request.method].uiSourceOffsets !== undefined;
}

/** Theme, unit and library readers use MessageBus2 captured by Z7/LGo.
 * Language uses legacy ur/QFo; its private cached bus cannot be inspected.
 * Retain available identities only; never dispatch directly to either bus.
 */
const uiOwnerProgram = (methodName: Definition["name"]): string => {
  const legacy = methodName === "getCurrentLanguage";
  const rootBusKey = JSON.stringify(legacy ? "_MSG_BUS_" : "_MSG_BUS2_EXTAPI_");
  const hostBusKey = JSON.stringify(legacy ? "messageBus" : "extensionApiMessageBus2");
  return `
const retain=(value,key)=>{
 const chain=[];let node=value,method;
 for(let i=0;node!==null&&i<8;i++){
  if(typeof node!=='object'&&typeof node!=='function')fail();
  const descriptor=Object.getOwnPropertyDescriptor(node,key);
  if(!method&&descriptor){if(!Object.hasOwn(descriptor,'value')||typeof descriptor.value!=='function')fail();method=descriptor.value;}
  chain.push({node,descriptor});node=Object.getPrototypeOf(node);
 }
 if(node!==null||!method)fail();
 return {method,check:()=>{for(let i=0;i<chain.length;i++){
  const item=chain[i],next=chain[i+1]?.node??null,current=Object.getOwnPropertyDescriptor(item.node,key),before=item.descriptor;
  if(Object.getPrototypeOf(item.node)!==next)fail();
  if(before===undefined){if(current!==undefined)fail();continue;}
  if(!current||current.value!==before.value||current.get!==before.get||current.set!==before.set||current.writable!==before.writable||current.enumerable!==before.enumerable||current.configurable!==before.configurable)fail();
 }}};
};
const apply=Reflect.apply,root=globalThis,location=root.location,document=root.document,href=location?.href;
const ui=data(root,'UI'),host=data(root,'gVars'),bus=data(root,${rootBusKey}),mode=data(root,'PRO_EDITOR_MODE');
if(!bus||typeof bus!=='object')fail();
${legacy ? `const bindings=[[root,${rootBusKey}],[host,${hostBusKey}]].map(([object,key])=>({object,key,descriptor:Object.getOwnPropertyDescriptor(object,key)}));
const sameBusBindings=()=>{for(const {object,key,descriptor:before} of bindings){
 const current=Object.getOwnPropertyDescriptor(object,key);
 if(!before||!current||!Object.hasOwn(before,'value')||!Object.hasOwn(current,'value')||current.value!==before.value||current.writable!==before.writable||current.enumerable!==before.enumerable||current.configurable!==before.configurable)fail();
}};` : "const sameBusBindings=()=>{};"}
const rpc=retain(bus,'rpcCall'),reader=retain(owner,${JSON.stringify(methodName)}),method=reader.method,editorTop=root.EDITOR_TOP;
if(editorTop!==undefined&&editorTop!==root)fail();
const clock=root.performance,now=retain(clock,'now'),set=data(root,'setTimeout');readerClear=data(root,'clearTimeout');
if(typeof set!=='function'||typeof readerClear!=='function')fail();
let lastTime=apply(now.method,clock,[]),expired=false;
if(!Number.isFinite(lastTime)||lastTime<0)fail();const deadline=lastTime+10000;
const sameUi=()=>{
 if(root.performance!==clock||data(root,'setTimeout')!==set||data(root,'clearTimeout')!==readerClear)fail();
 now.check();const time=apply(now.method,clock,[]);if(expired||!Number.isFinite(time)||time<lastTime||time>=deadline)fail();lastTime=time;
 if(root.window!==root||root.self!==root||root.top!==root||root.EDITOR_TOP!==editorTop||root.frameElement!==null||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')fail();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))fail();
 if(data(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))fail();
 if(data(root,'UI')!==ui||data(root,'gVars')!==host||data(ui,'gVars')!==host||data(root,${rootBusKey})!==bus||data(host,${hostBusKey})!==bus||data(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')fail();
 sameBusBindings();reader.check();rpc.check();
};
sameUi();readerTimer=apply(set,root,[()=>{expired=true;},10000]);
`;
};

/** Only parsed literal methods. None of the caller's values select an
 * object path, property, callback, native command or generated statement.
 */
export function buildSdkPublicReadersProgram(input: unknown): string {
  const request = parseSdkPublicReadersRequest(input);
  const definition = definitions[request.method];
  const uiBacked = sdkPublicReaderRequiresUi(request);
  const languageArgument = "language" in request.arguments ? request.arguments.language : undefined;
  const expectedSupported = SDK_PUBLIC_READERS_209_LANGUAGES.some((entry) => entry === languageArgument);
  const argumentsCode = languageArgument === undefined ? "" : JSON.stringify(languageArgument);
  return `${uiBacked ? "let readerTimer,readerClear;" : ""}try {
const fail=()=>{throw new Error('SDK_PUBLIC_READERS_INVALID_RESULT');};
const data=(object,key)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))fail();return descriptor.value;};
const edaOwner=eda,owner=${uiBacked ? `data(edaOwner,${JSON.stringify(definition.namespace)})` : `edaOwner.${definition.namespace}`};if(!owner)fail();
${uiBacked ? "" : `const method=owner.${definition.name};if(typeof method!=='function')fail();`}
const kind=${JSON.stringify(definition.resultKind)},languages=Object.freeze(${JSON.stringify(SDK_PUBLIC_READERS_209_LANGUAGES)});
const pageWindow=kind==='viewport'?window:null;
if(kind==='viewport'&&(!pageWindow||typeof pageWindow!=='object'))fail();
${uiBacked ? uiOwnerProgram(definition.name) : "const sameUi=()=>{};"}
const project=value=>{
 if(kind==='resolved-language'){if(!${JSON.stringify(SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES)}.includes(value))fail();return value;}
 if(kind==='theme'){if(value!=='light'&&value!=='dark')fail();return value;}
 if(kind==='toolbar-unit'){if(value!=='mm'&&value!=='inch'&&value!=='mil')fail();return value;}
 if(kind==='system-library-uuid'){if(value!==${JSON.stringify(SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID)})fail();return value;}
 if(kind==='boolean'){if(typeof value!=='boolean'||value!==${String(expectedSupported)})fail();return value;}
 if(kind==='languages'){
  if(!Array.isArray(value)||value.length!==languages.length||Reflect.ownKeys(value).length!==languages.length+1)fail();
  const copied=[];for(let index=0;index<languages.length;index++){const item=data(value,String(index));if(item!==languages[index])fail();copied.push(item);}return copied;
 }
 if(!value||typeof value!=='object'||Array.isArray(value)||Reflect.ownKeys(value).length!==2)fail();
 const width=data(value,'width'),height=data(value,'height');
 for(const dimension of [width,height])if(!Number.isInteger(dimension)||dimension<0||dimension>${SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION}||Object.is(dimension,-0))fail();
 return {width,height};
};
const sameOwner=()=>{if(eda!==edaOwner||${uiBacked ? `data(edaOwner,${JSON.stringify(definition.namespace)})!==owner` : `edaOwner.${definition.namespace}!==owner||owner.${definition.name}!==method`}||(kind==='viewport'&&window!==pageWindow))fail();sameUi();};
const read=${uiBacked ? "async " : ""}()=>{sameOwner();const raw=${uiBacked ? "await apply(method,owner,[])" : `method.call(owner,${argumentsCode})`};sameOwner();const value=project(raw);sameOwner();return value;};
const first=${uiBacked ? "await " : ""}read(),second=${uiBacked ? "await " : ""}read();if(JSON.stringify(first)!==JSON.stringify(second))fail();sameOwner();
const json=JSON.stringify({ok:true,kind:'sdk-public-readers',method:${JSON.stringify(request.method)},value:first});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${SDK_PUBLIC_READERS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SDK_PUBLIC_READERS_MAX_BYTES})fail();
return envelope;
}catch{throw new Error('SDK_PUBLIC_READERS_READ_FAILED');}${uiBacked ? "finally{if(readerTimer!==undefined&&readerClear){try{Reflect.apply(readerClear,globalThis,[readerTimer]);}catch{throw new Error('SDK_PUBLIC_READERS_READ_FAILED');}}}" : ""}`;
}

const dimensionSchema = z.number().int().min(0).max(SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION).refine((value) => !Object.is(value, -0));
const viewportSchema = z.object({ width: dimensionSchema, height: dimensionSchema }).strict();
const languagesSchema = z.array(language).length(SDK_PUBLIC_READERS_209_LANGUAGES.length)
  .refine((value) => value.every((entry, index) => entry === SDK_PUBLIC_READERS_209_LANGUAGES[index]));
const payloadSchema = z.object({ ok: z.literal(true), kind: z.literal("sdk-public-readers"), method: z.string(), value: z.unknown() }).strict();

export function validateSdkPublicReadersResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseSdkPublicReadersRequest(input);
  const definition = definitions[request.method], payload = payloadSchema.parse(raw);
  if (payload.method !== request.method) { throw new Error("Public reader result belongs to a different method."); }
  let value: unknown;
  if (request.method === "eda.sys_I18n.getAllSupportedLanguages") {
    value = languagesSchema.parse(payload.value);
  } else if (request.method === "eda.sys_I18n.isLanguageSupported") {
    value = z.boolean().parse(payload.value);
    if (value !== SDK_PUBLIC_READERS_209_LANGUAGES.some((entry) => entry === request.arguments.language)) {
      throw new Error("Public language membership differs from the reviewed catalog.");
    }
  } else if (request.method === "eda.sys_Window.getCurrentTheme") {
    value = z.enum(["light", "dark"]).parse(payload.value);
  } else if (request.method === "eda.sys_I18n.getCurrentLanguage") {
    value = z.enum(SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES).parse(payload.value);
  } else if (request.method === "eda.sys_Unit.getFrontendDataUnit") {
    value = z.enum(["mm", "inch", "mil"]).parse(payload.value);
  } else if (request.method === "eda.lib_LibrariesList.getSystemLibraryUuid") {
    value = z.literal(SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID).parse(payload.value);
  } else {
    value = viewportSchema.parse(payload.value);
  }
  return { ...payload, value, effect: definition.effect,
    ...(definition.resultKind === "resolved-language" ? { languageScope: "sdk-resolved-language", fallbackPossible: true,
      providerSuccessVerified: false, cachedMessageBusIdentityVerified: false } : {}),
    ...(definition.resultKind === "viewport" ? { units: "css-pixels", viewportScope: "public-api-extension-page" } : {}),
    ...(sdkPublicReaderRequiresUi(request) ? { uiVersion: EDITOR_OBSERVATION_209_UI.version, uiSha256: EDITOR_OBSERVATION_209_UI.sha256 } : {}),
    authority: "bounded-public-utility-read-only;not-project-state-or-runtime-admission",
    apiVersion: provenance.version, apiSha256: provenance.apiSha256,
    limitations: [...commonLimitations, definition.limitation] };
}
