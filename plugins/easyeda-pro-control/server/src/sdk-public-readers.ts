import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { EDITOR_OBSERVATION_209_UI } from "./editor-observation209-profile.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "./sdk-public-utilities-profile.ts";

export const SDK_PUBLIC_READERS_MAX_BYTES = 8192;
export const SDK_PUBLIC_READERS_BATCH_MAX_BYTES = 65_536;
export const SDK_PUBLIC_READERS_BATCH_MAX_METHODS = 7;
export const SDK_PUBLIC_READERS_BATCH_DEADLINE_MS = 10_000;
export const SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION = 1_000_000;
export const SDK_PUBLIC_READERS_MAX_API_HREF_BYTES = 8192;
export const SDK_PUBLIC_READERS_API_LOG_LEVELS = Object.freeze(["trace", "debug", "info", "warn", "error"] as const);
export const SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID = "0819f05c4eef4c71ace90d822a990e87";
export const SDK_PUBLIC_READERS_209_SELECTED_LIBRARY_TYPES = Object.freeze(["1", "2", "3", "4", "5", "29"] as const);
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
const cllArguments = z.object({ key: z.literal("cll") }).strict();
const language = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/u);
export const sdkPublicReadersRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("eda.sys_I18n.getAllSupportedLanguages"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_I18n.isLanguageSupported"), arguments: z.object({ language }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_I18n.getCurrentLanguage"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Window.getViewportSize"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Window.getUrlParam"), arguments: cllArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Window.getCurrentTheme"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.getFrontendDataUnit"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.lib_LibrariesList.getSystemLibraryUuid"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.lib_SelectControl.getSelectedLibraryRowInfo"), arguments: emptyArguments }).strict(),
]);
export type SdkPublicReadersRequest = z.infer<typeof sdkPublicReadersRequestSchema>;
export const sdkPublicReadersBatchRequestSchema = z.object({ action: z.literal("batch"),
  requests: z.array(sdkPublicReadersRequestSchema).min(1).max(SDK_PUBLIC_READERS_BATCH_MAX_METHODS),
}).strict().superRefine((value, context) => {
  const seen = new Set<SdkPublicReadersRequest["method"]>();
  for (const [index, request] of value.requests.entries()) {
    if (seen.has(request.method)) { context.addIssue({ code: "custom", path: ["requests", index, "method"], message: "Batch method names must be unique." }); }
    seen.add(request.method);
  }
});
export const sdkPublicReadersOperationSchema = z.union([sdkPublicReadersRequestSchema, sdkPublicReadersBatchRequestSchema]);
export type SdkPublicReadersBatchRequest = z.infer<typeof sdkPublicReadersBatchRequestSchema>;
export type SdkPublicReadersOperation = z.infer<typeof sdkPublicReadersOperationSchema>;
type PublicReaderMethod = SdkPublicReadersRequest["method"];
interface Definition {
  readonly namespace: "sys_I18n" | "sys_Window" | "sys_Unit" | "lib_LibrariesList" | "lib_SelectControl";
  readonly name: "getAllSupportedLanguages" | "isLanguageSupported" | "getCurrentLanguage" | "getViewportSize" | "getUrlParam" | "getCurrentTheme" | "getFrontendDataUnit" | "getSystemLibraryUuid" | "getSelectedLibraryRowInfo";
  readonly parameters: readonly string[];
  readonly resultKind: "languages" | "boolean" | "resolved-language" | "viewport" | "api-url-log-level" | "theme" | "toolbar-unit" | "system-library-uuid" | "selected-system-library-row";
  readonly effect: "language-catalog-read" | "sdk-resolved-language-read" | "extension-page-viewport-read" | "api-page-log-level-query-read" | "ui-theme-read" | "ui-toolbar-unit-read" | "system-library-identity-read" | "selected-system-library-row-read";
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
  "eda.sys_Window.getUrlParam": {
    namespace: "sys_Window", name: "getUrlParam", parameters: ["key"], resultKind: "api-url-log-level", effect: "api-page-log-level-query-read",
    limitation: "Only key cll is admitted. Reads the actual public API execution page's query, which can belong to an API iframe and differ from the application UI. Returns null for an absent key or exactly trace, debug, info, warn or error; other values refuse. Both synchronous samples must match the retained API page's own parsed value. Window, location, document, href and the original method/receiver stay unchanged. Href input is bounded to 8192 UTF-8 bytes and never returned; other query keys, the fragment, full URL and UI log-state claims remain unavailable. The source-pinned API extension compiler and bridge executor create the generated program in the API realm; no UI or parent URL is substituted.",
    sourceOffsets: [472_002, 1_892_975, 1_907_530, 1_944_339], documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.geturlparam.html",
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
  "eda.lib_SelectControl.getSelectedLibraryRowInfo": {
    namespace: "lib_SelectControl", name: "getSelectedLibraryRowInfo", parameters: [], resultKind: "selected-system-library-row", effect: "selected-system-library-row-read",
    limitation: "This SDK method is beta. Reads one bottom-library row with the fixed system-library UUID reported by the UI. Returns only its UUID, supported library type and reported library UUID; no selection or a missing subscriber refuses rather than becoming an empty success. The callback combines independently retained row and library state, so even two matching samples do not prove that this asset belongs to that library. A non-system reported library UUID refuses. No ownership, freshness, existence, geometry or current-project binding is verified. No lookup, download, navigation, placement or Save runs.",
    sourceOffsets: [1_345_306, 1_974_359], uiSourceOffsets: [12_328_063, 17_427_892, 17_445_105, 17_456_623],
    documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.lib_selectcontrol.getselectedlibraryrowinfo.html",
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
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries,
    batch: { action: "batch", maximumMethods: SDK_PUBLIC_READERS_BATCH_MAX_METHODS, uniqueMethods: true,
      completeOrderedPasses: 2, sharedDeadlineMilliseconds: SDK_PUBLIC_READERS_BATCH_DEADLINE_MS,
      maximumResponseBytes: SDK_PUBLIC_READERS_BATCH_MAX_BYTES, maximumMemberBytes: SDK_PUBLIC_READERS_MAX_BYTES,
      atomicSnapshot: false, partialSuccess: false, invocationEnabledByDiscovery: false,
      ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(sdkPublicReadersBatchRequestSchema) } : {}) } };
}

export function validateSdkPublicReadersArguments(input: unknown): Record<string, unknown> {
  const result = sdkPublicReadersOperationSchema.safeParse(input);
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
export const SDK_PUBLIC_READERS_RETAIN_OWNER_PROGRAM = `const retain=(value,key)=>{
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
`;

/** Mu and the private bridge executor both construct their functions in the
 * pinned API realm. Capture that page here; EDITOR_TOP can name a different UI
 * window. The existing API-page viewport contract adds no UI URL assumption. */
const apiPageUrlOwnerProgram = (sharedDeadline: boolean): string => `
${SDK_PUBLIC_READERS_RETAIN_OWNER_PROGRAM}const reader=retain(owner,'getUrlParam'),method=reader.method,apply=Reflect.apply;
const apiPage=window,apiLocation=apiPage?.location,apiDocument=apiPage?.document,apiHref=apiLocation?.href;
if(!apiPage||typeof apiPage!=='object'||!apiLocation||typeof apiLocation!=='object'||!apiDocument||typeof apiDocument!=='object'||
 typeof apiHref!=='string'||apiHref.length===0||apiHref.length>${SDK_PUBLIC_READERS_MAX_API_HREF_BYTES}||
 new TextEncoder().encode(apiHref).byteLength>${SDK_PUBLIC_READERS_MAX_API_HREF_BYTES})fail();
const expectedUrlLogLevel=new URLSearchParams(new URL(apiHref).search).get('cll');
if(expectedUrlLogLevel!==null&&!${JSON.stringify(SDK_PUBLIC_READERS_API_LOG_LEVELS)}.includes(expectedUrlLogLevel))fail();
const sameUi=()=>{
 ${sharedDeadline ? "readersBatchDeadline();" : ""}
 if(window!==apiPage||apiPage.location!==apiLocation||apiPage.document!==apiDocument||apiLocation.href!==apiHref||
  apiDocument.defaultView!==apiPage||apiDocument.nodeType!==9||apiDocument.URL!==apiHref)fail();
 reader.check();
};sameUi();
`;

const uiOwnerProgram = (methodName: Definition["name"], sharedDeadline = false): string => {
  const legacy = methodName === "getCurrentLanguage";
  const rootBusKey = JSON.stringify(legacy ? "_MSG_BUS_" : "_MSG_BUS2_EXTAPI_");
  const hostBusKey = JSON.stringify(legacy ? "messageBus" : "extensionApiMessageBus2");
  return `
${SDK_PUBLIC_READERS_RETAIN_OWNER_PROGRAM}const apply=Reflect.apply,root=globalThis,location=root.location,document=root.document,href=location?.href;
const ui=data(root,'UI'),host=data(root,'gVars'),bus=data(root,${rootBusKey}),mode=data(root,'PRO_EDITOR_MODE');
if(!bus||typeof bus!=='object')fail();
${legacy ? `const bindings=[[root,${rootBusKey}],[host,${hostBusKey}]].map(([object,key])=>({object,key,descriptor:Object.getOwnPropertyDescriptor(object,key)}));
const sameBusBindings=()=>{for(const {object,key,descriptor:before} of bindings){
 const current=Object.getOwnPropertyDescriptor(object,key);
 if(!before||!current||!Object.hasOwn(before,'value')||!Object.hasOwn(current,'value')||current.value!==before.value||current.writable!==before.writable||current.enumerable!==before.enumerable||current.configurable!==before.configurable)fail();
}};` : "const sameBusBindings=()=>{};"}
const rpc=retain(bus,'rpcCall'),reader=retain(owner,${JSON.stringify(methodName)}),method=reader.method,editorTop=root.EDITOR_TOP;
if(editorTop!==undefined&&editorTop!==root)fail();
${sharedDeadline ? "" : `const clock=root.performance,now=retain(clock,'now'),set=data(root,'setTimeout');readerClear=data(root,'clearTimeout');
if(typeof set!=='function'||typeof readerClear!=='function')fail();
let lastTime=apply(now.method,clock,[]),expired=false;
if(!Number.isFinite(lastTime)||lastTime<0)fail();const deadline=lastTime+10000;
`}const sameUi=()=>{
${sharedDeadline ? " readersBatchDeadline();\n" : ` if(root.performance!==clock||data(root,'setTimeout')!==set||data(root,'clearTimeout')!==readerClear)fail();
 now.check();const time=apply(now.method,clock,[]);if(expired||!Number.isFinite(time)||time<lastTime||time>=deadline)fail();lastTime=time;
`} if(root.window!==root||root.self!==root||root.top!==root||root.EDITOR_TOP!==editorTop||root.frameElement!==null||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')fail();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))fail();
 if(data(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))fail();
 if(data(root,'UI')!==ui||data(root,'gVars')!==host||data(ui,'gVars')!==host||data(root,${rootBusKey})!==bus||data(host,${hostBusKey})!==bus||data(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')fail();
 sameBusBindings();reader.check();rpc.check();
};
sameUi();${sharedDeadline ? "" : "readerTimer=apply(set,root,[()=>{expired=true;},10000]);"}
`;
};

const readerProjectProgram = (expectedSupported: boolean): string => `const project=value=>{
 if(kind==='api-url-log-level'){if(value!==expectedUrlLogLevel)fail();return value;}
 if(kind==='resolved-language'){if(!${JSON.stringify(SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES)}.includes(value))fail();return value;}
 if(kind==='theme'){if(value!=='light'&&value!=='dark')fail();return value;}
 if(kind==='toolbar-unit'){if(value!=='mm'&&value!=='inch'&&value!=='mil')fail();return value;}
 if(kind==='system-library-uuid'){if(value!==${JSON.stringify(SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID)})fail();return value;}
 if(kind==='selected-system-library-row'){
  if(!value||typeof value!=='object'||Array.isArray(value)||Reflect.ownKeys(value).length!==3)fail();
  const uuid=data(value,'uuid'),libraryUuid=data(value,'libraryUuid'),libraryType=data(value,'libraryType');
  if(typeof uuid!=='string'||uuid.length!==32||!/^[a-f0-9]{32}$/.test(uuid)||
   libraryUuid!==${JSON.stringify(SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID)}||!${JSON.stringify(SDK_PUBLIC_READERS_209_SELECTED_LIBRARY_TYPES)}.includes(libraryType))fail();
  return {uuid,libraryUuid,libraryType};
 }
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
`;

/** Only parsed literal methods. None of the caller's values select an
 * object path, property, callback, native command or generated statement.
 */
export function buildSdkPublicReadersProgram(input: unknown): string {
  const request = parseSdkPublicReadersRequest(input);
  const definition = definitions[request.method];
  const uiBacked = sdkPublicReaderRequiresUi(request);
  const apiUrl = definition.resultKind === "api-url-log-level", strictOwner = uiBacked || apiUrl;
  const languageArgument = "language" in request.arguments ? request.arguments.language : undefined;
  const expectedSupported = SDK_PUBLIC_READERS_209_LANGUAGES.some((entry) => entry === languageArgument);
  const argument = "key" in request.arguments ? request.arguments.key : languageArgument;
  const argumentsCode = argument === undefined ? "" : JSON.stringify(argument);
  let ownerProgram = "const sameUi=()=>{};", readCall = `method.call(owner,${argumentsCode})`;
  if (uiBacked) { ownerProgram = uiOwnerProgram(definition.name); readCall = "await apply(method,owner,[])"; }
  else if (apiUrl) { ownerProgram = apiPageUrlOwnerProgram(false); readCall = `apply(method,owner,[${argumentsCode}])`; }
  return `${uiBacked ? "let readerTimer,readerClear;" : ""}try {
const fail=()=>{throw new Error('SDK_PUBLIC_READERS_INVALID_RESULT');};
const data=(object,key)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))fail();return descriptor.value;};
const edaOwner=eda,owner=${strictOwner ? `data(edaOwner,${JSON.stringify(definition.namespace)})` : `edaOwner.${definition.namespace}`};if(!owner)fail();
${strictOwner ? "" : `const method=owner.${definition.name};if(typeof method!=='function')fail();`}
const kind=${JSON.stringify(definition.resultKind)},languages=Object.freeze(${JSON.stringify(SDK_PUBLIC_READERS_209_LANGUAGES)});
const pageWindow=kind==='viewport'?window:null;
if(kind==='viewport'&&(!pageWindow||typeof pageWindow!=='object'))fail();
${ownerProgram}
${readerProjectProgram(expectedSupported)}const sameOwner=()=>{if(eda!==edaOwner||${strictOwner ? `data(edaOwner,${JSON.stringify(definition.namespace)})!==owner` : `edaOwner.${definition.namespace}!==owner||owner.${definition.name}!==method`}||(kind==='viewport'&&window!==pageWindow))fail();sameUi();};
const read=${uiBacked ? "async " : ""}()=>{sameOwner();const raw=${readCall};sameOwner();const value=project(raw);sameOwner();return value;};
const first=${uiBacked ? "await " : ""}read(),second=${uiBacked ? "await " : ""}read();if(JSON.stringify(first)!==JSON.stringify(second))fail();sameOwner();
const json=JSON.stringify({ok:true,kind:'sdk-public-readers',method:${JSON.stringify(request.method)},value:first});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${SDK_PUBLIC_READERS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SDK_PUBLIC_READERS_MAX_BYTES})fail();
return envelope;
}catch{throw new Error('SDK_PUBLIC_READERS_READ_FAILED');}${uiBacked ? "finally{if(readerTimer!==undefined&&readerClear){try{Reflect.apply(readerClear,globalThis,[readerTimer]);}catch{throw new Error('SDK_PUBLIC_READERS_READ_FAILED');}}}" : ""}`;
}

/** Fixed member factory for the batch generator. Its lexical batch checks are
 * generated by our sibling module, never supplied by a caller or plugin code. */
export function buildSdkPublicReadersBatchMemberProgram(input: unknown): string {
  const request = parseSdkPublicReadersRequest(input);
  const definition = definitions[request.method];
  const uiBacked = sdkPublicReaderRequiresUi(request);
  const apiUrl = definition.resultKind === "api-url-log-level";
  const languageArgument = "language" in request.arguments ? request.arguments.language : undefined;
  const expectedSupported = SDK_PUBLIC_READERS_209_LANGUAGES.some((entry) => entry === languageArgument);
  const argument = "key" in request.arguments ? request.arguments.key : languageArgument;
  const argumentsCode = argument === undefined ? "" : JSON.stringify(argument);
  let ownerProgram = `${SDK_PUBLIC_READERS_RETAIN_OWNER_PROGRAM}const reader=retain(owner,${JSON.stringify(definition.name)}),method=reader.method,apply=Reflect.apply;
const sameUi=()=>{reader.check();readersBatchDeadline();};`;
  if (uiBacked) { ownerProgram = uiOwnerProgram(definition.name, true); }
  else if (apiUrl) { ownerProgram = apiPageUrlOwnerProgram(true); }
  return `(()=>{
const fail=()=>{throw new Error('SDK_PUBLIC_READERS_INVALID_RESULT');};
const data=(object,key)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))fail();return descriptor.value;};
const edaOwner=eda,owner=data(edaOwner,${JSON.stringify(definition.namespace)});if(!owner)fail();
const kind=${JSON.stringify(definition.resultKind)},languages=Object.freeze(${JSON.stringify(SDK_PUBLIC_READERS_209_LANGUAGES)});
const pageWindow=kind==='viewport'?window:null;
if(kind==='viewport'&&(!pageWindow||typeof pageWindow!=='object'))fail();
${ownerProgram}
${readerProjectProgram(expectedSupported)}const sameOwner=()=>{if(eda!==edaOwner||data(edaOwner,${JSON.stringify(definition.namespace)})!==owner||(kind==='viewport'&&window!==pageWindow))fail();sameUi();};
const read=${uiBacked ? "async " : ""}()=>{readersBatchCurrent();const raw=${uiBacked ? "await " : ""}apply(method,owner,[${argumentsCode}]);readersBatchCurrent();const value=project(raw);readersBatchCurrent();return {ok:true,kind:'sdk-public-readers',method:${JSON.stringify(request.method)},value};};
sameOwner();return Object.freeze({sameOwner,read,uiBacked:${String(uiBacked)}});
})()`;
}

const dimensionSchema = z.number().int().min(0).max(SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION).refine((value) => !Object.is(value, -0));
const viewportSchema = z.object({ width: dimensionSchema, height: dimensionSchema }).strict();
const selectedLibraryRowSchema = z.object({
  uuid: z.string().length(32).regex(/^[a-f0-9]{32}$/u),
  libraryUuid: z.literal(SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID),
  libraryType: z.enum(SDK_PUBLIC_READERS_209_SELECTED_LIBRARY_TYPES),
}).strict();
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
  } else if (request.method === "eda.sys_Window.getUrlParam") {
    value = z.enum(SDK_PUBLIC_READERS_API_LOG_LEVELS).nullable().parse(payload.value);
  } else if (request.method === "eda.sys_I18n.getCurrentLanguage") {
    value = z.enum(SDK_PUBLIC_READERS_209_RESOLVED_LANGUAGES).parse(payload.value);
  } else if (request.method === "eda.sys_Unit.getFrontendDataUnit") {
    value = z.enum(["mm", "inch", "mil"]).parse(payload.value);
  } else if (request.method === "eda.lib_LibrariesList.getSystemLibraryUuid") {
    value = z.literal(SDK_PUBLIC_READERS_209_SYSTEM_LIBRARY_UUID).parse(payload.value);
  } else if (request.method === "eda.lib_SelectControl.getSelectedLibraryRowInfo") {
    value = selectedLibraryRowSchema.parse(payload.value);
  } else {
    value = viewportSchema.parse(payload.value);
  }
  return { ...payload, value, effect: definition.effect,
    ...(definition.resultKind === "resolved-language" ? { languageScope: "sdk-resolved-language", fallbackPossible: true,
      providerSuccessVerified: false, cachedMessageBusIdentityVerified: false } : {}),
    ...(definition.resultKind === "viewport" ? { units: "css-pixels", viewportScope: "public-api-extension-page" } : {}),
    ...(definition.resultKind === "api-url-log-level" ? { urlScope: "public-api-execution-page", queryKey: "cll", uiStateVerified: false } : {}),
    ...(definition.resultKind === "selected-system-library-row" ? { libraryScope: "ui-reported-system-library", assetOwnershipVerified: false, selectedRowProvenanceVerified: false, currentProjectBindingVerified: false } : {}),
    ...(sdkPublicReaderRequiresUi(request) ? { uiVersion: EDITOR_OBSERVATION_209_UI.version, uiSha256: EDITOR_OBSERVATION_209_UI.sha256 } : {}),
    authority: "bounded-public-utility-read-only;not-project-state-or-runtime-admission",
    apiVersion: provenance.version, apiSha256: provenance.apiSha256,
    limitations: [...commonLimitations, definition.limitation] };
}
