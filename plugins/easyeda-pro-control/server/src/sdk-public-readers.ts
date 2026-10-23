import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "./sdk-public-utilities-profile.ts";

export const SDK_PUBLIC_READERS_MAX_BYTES = 8192;
export const SDK_PUBLIC_READERS_MAX_VIEWPORT_DIMENSION = 1_000_000;

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
  z.object({ method: z.literal("eda.sys_Window.getViewportSize"), arguments: emptyArguments }).strict(),
]);
export type SdkPublicReadersRequest = z.infer<typeof sdkPublicReadersRequestSchema>;
type PublicReaderMethod = SdkPublicReadersRequest["method"];
interface Definition {
  readonly namespace: "sys_I18n" | "sys_Window";
  readonly name: "getAllSupportedLanguages" | "isLanguageSupported" | "getViewportSize";
  readonly parameters: readonly string[];
  readonly resultKind: "languages" | "boolean" | "viewport";
  readonly effect: "language-catalog-read" | "extension-page-viewport-read";
  readonly limitation: string;
  readonly sourceOffsets: readonly number[];
  readonly documentationUrl: string;
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
  "eda.sys_Window.getViewportSize": {
    namespace: "sys_Window", name: "getViewportSize", parameters: [], resultKind: "viewport", effect: "extension-page-viewport-read",
    limitation: "Reads the public API window's page viewport in CSS pixels, not the OS window, screen, document canvas or PCB geometry. Width and height must be integers 0-1000000. Zero is retained, not interpreted as a visible or ready editor. Two synchronous matching samples do not prove later layout stability.",
    sourceOffsets: [1_893_138], documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.getviewportsize.html",
  },
};
const commonLimitations = [
  "Only the separately hash-admitted EasyEDA 3.2.209 / API 0.3.59 tuple. No admission of older, newer or unknown implementations, native adapters or general SDK dispatch.",
  "Two complete synchronous samples retain the same namespace and method. Viewport reads additionally retain the same window object. No project, document, account, file, network, navigation, settings change or Save access.",
  "Replies are bounded to 8192 UTF-8 bytes. Promises, partial or malformed values, changed owners, unstable samples and oversized responses refuse without truncation or automatic retry. Source implementation and synthetic tests do not establish connected validation.",
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
}

export function sdkPublicReadersDescriptors(): SdkPublicReadersDescriptor[] {
  return sdkPublicReadersRequestSchema.options.map((schema) => {
    const method = schema.shape.method.value;
    const definition = definitions[method];
    return { path: method, method, inputSchema: z.toJSONSchema(schema), parameters: [...definition.parameters], resultKind: definition.resultKind,
      effect: definition.effect, limitations: [...commonLimitations, definition.limitation], invocationEnabledByDiscovery: false, provenance,
      source: { utf16Offsets: [...definition.sourceOffsets], documentationUrl: definition.documentationUrl } };
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

/** Only three parsed literal methods. None of the caller's values select an
 * object path, property, callback, native command or generated statement.
 */
export function buildSdkPublicReadersProgram(input: unknown): string {
  const request = parseSdkPublicReadersRequest(input);
  const definition = definitions[request.method];
  const languageArgument = "language" in request.arguments ? request.arguments.language : undefined;
  const expectedSupported = SDK_PUBLIC_READERS_209_LANGUAGES.some((entry) => entry === languageArgument);
  const argumentsCode = languageArgument === undefined ? "" : JSON.stringify(languageArgument);
  return `try {
const fail=()=>{throw new Error('SDK_PUBLIC_READERS_INVALID_RESULT');};
const owner=eda.${definition.namespace},method=owner?.${definition.name};if(!owner||typeof method!=='function')fail();
const kind=${JSON.stringify(definition.resultKind)},languages=Object.freeze(${JSON.stringify(SDK_PUBLIC_READERS_209_LANGUAGES)});
const pageWindow=kind==='viewport'?window:null;
if(kind==='viewport'&&(!pageWindow||typeof pageWindow!=='object'))fail();
const data=(object,key)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))fail();return descriptor.value;};
const project=value=>{
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
const sameOwner=()=>{if(eda.${definition.namespace}!==owner||owner.${definition.name}!==method||(kind==='viewport'&&window!==pageWindow))fail();};
const read=()=>{sameOwner();const value=project(method.call(owner,${argumentsCode}));sameOwner();return value;};
const first=read(),second=read();if(JSON.stringify(first)!==JSON.stringify(second))fail();sameOwner();
const json=JSON.stringify({ok:true,kind:'sdk-public-readers',method:${JSON.stringify(request.method)},value:first});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${SDK_PUBLIC_READERS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SDK_PUBLIC_READERS_MAX_BYTES})fail();
return envelope;
}catch{throw new Error('SDK_PUBLIC_READERS_READ_FAILED');}`;
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
  } else {
    value = viewportSchema.parse(payload.value);
  }
  return { ...payload, value, effect: definition.effect,
    ...(definition.resultKind === "viewport" ? { units: "css-pixels", viewportScope: "public-api-extension-page" } : {}),
    authority: "bounded-language-catalog-or-extension-page-viewport-only;not-project-state-or-runtime-admission",
    apiVersion: provenance.version, apiSha256: provenance.apiSha256,
    limitations: [...commonLimitations, definition.limitation] };
}
