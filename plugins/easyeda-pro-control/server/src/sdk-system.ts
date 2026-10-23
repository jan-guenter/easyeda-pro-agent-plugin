import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "./sdk-public-utilities-profile.ts";

export const SDK_SYSTEM_API_VERSION = "0.3.50.ab46409c";
export const SDK_SYSTEM_API_SHA256 = "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76";
const defaultProvenance = Object.freeze({ version: SDK_SYSTEM_API_VERSION, implementationSha256: SDK_SYSTEM_API_SHA256 });
export const SDK_SYSTEM_MAX_BYTES = 8192;
const inputNumber = z.number().min(-1_000_000_000).max(1_000_000_000);
const precision = z.number().int().min(0).max(12).optional();
const emptyArguments = z.object({}).strict();
// The public comparator pads/truncates versions and treats invalid input as a
// Boolean result. Admit canonical triples only, before any SDK invocation.
const version = z.string().max(20).regex(/^(?:0|[1-9][0-9]{0,5})\.(?:0|[1-9][0-9]{0,5})\.(?:0|[1-9][0-9]{0,5})$/u);
const comparisonArguments = z.object({ version }).strict();
const editorVersionArguments = z.object({ onlySemantic: z.boolean().optional() }).strict();

export const sdkSystemRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("eda.sys_Unit.milToMm"), arguments: z.object({ mil: inputNumber, numberOfDecimals: precision }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.milToInch"), arguments: z.object({ mil: inputNumber, numberOfDecimals: precision }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.mmToMil"), arguments: z.object({ mm: inputNumber, numberOfDecimals: precision }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.mmToInch"), arguments: z.object({ mm: inputNumber, numberOfDecimals: precision }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.inchToMil"), arguments: z.object({ inch: inputNumber, numberOfDecimals: precision }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Unit.inchToMm"), arguments: z.object({ inch: inputNumber, numberOfDecimals: precision }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isClient"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isWeb"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isEasyEDAProEdition"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isJLCEDAProEdition"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isProPrivateEdition"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isOnlineMode"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isHalfOfflineMode"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isOfflineMode"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.getEditorCurrentVersion"), arguments: editorVersionArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.getEditorCompliedDate"), arguments: emptyArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isEditorCurrentVersionGreaterThanOrEqual"), arguments: comparisonArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Environment.isEditorCurrentVersionLessThanOrEqual"), arguments: comparisonArguments }).strict(),
]);
export type SdkSystemRequest = z.infer<typeof sdkSystemRequestSchema>;
type SystemMethod = SdkSystemRequest["method"];
type ResultKind = "number" | "boolean" | "string";
type Unit = "mil" | "mm" | "inch";
interface Definition {
  parameters: string[];
  result: ResultKind;
  limitation: string;
  effect: "supplied-value-calculation" | "environment-metadata-read" | "environment-metadata-local-cache";
  units?: { input: Unit; output: Unit };
}

function unitDefinition(input: Unit, output: Unit): Definition {
  return { parameters: [input, "numberOfDecimals"], result: "number", effect: "supplied-value-calculation", units: { input, output },
    limitation: "Finite input magnitude <=1e9; integer decimal precision 0-12, default 4. Uses SDK rounding, including its positive 1e-10 intermediate adjustment, not exact decimal arithmetic. Negative zero is preserved by the negativeZero flag. No canvas-origin or frontend-unit conversion." };
}
const environmentBoolean: Definition = { parameters: [], result: "boolean", effect: "environment-metadata-read",
  limitation: "Reads the API's captured application mode/edition flag. This is not a network-connectivity probe or current project state." };
const definitions: Record<SystemMethod, Definition> = {
  "eda.sys_Unit.milToMm": unitDefinition("mil", "mm"),
  "eda.sys_Unit.milToInch": unitDefinition("mil", "inch"),
  "eda.sys_Unit.mmToMil": unitDefinition("mm", "mil"),
  "eda.sys_Unit.mmToInch": unitDefinition("mm", "inch"),
  "eda.sys_Unit.inchToMil": unitDefinition("inch", "mil"),
  "eda.sys_Unit.inchToMm": unitDefinition("inch", "mm"),
  "eda.sys_Environment.isClient": environmentBoolean,
  "eda.sys_Environment.isWeb": environmentBoolean,
  "eda.sys_Environment.isEasyEDAProEdition": environmentBoolean,
  "eda.sys_Environment.isJLCEDAProEdition": environmentBoolean,
  "eda.sys_Environment.isProPrivateEdition": environmentBoolean,
  "eda.sys_Environment.isOnlineMode": environmentBoolean,
  "eda.sys_Environment.isHalfOfflineMode": environmentBoolean,
  "eda.sys_Environment.isOfflineMode": environmentBoolean,
  "eda.sys_Environment.getEditorCurrentVersion": { parameters: ["onlySemantic"], result: "string", effect: "environment-metadata-read",
    limitation: "Reads editorMainVersion metadata, not the installed package's suffixed version. onlySemantic optionally limits it to three components and pads a two-component value. It does not admit a runtime or update compatibility pins." },
  "eda.sys_Environment.getEditorCompliedDate": { parameters: [], result: "string", effect: "environment-metadata-local-cache",
    limitation: "Reads editorMainDate metadata and may initialize T.editorCompliedDate in the API's local runtime cache. This is not a strictly pure function; it does not change a shared preference or persist data. The bounded returned date text is not parsed or relabeled as a timezone." },
  "eda.sys_Environment.isEditorCurrentVersionGreaterThanOrEqual": { parameters: ["version"], result: "boolean", effect: "environment-metadata-read",
    limitation: "Compares SUPPLIED version >= CURRENT editor semantic version, despite the method's ambiguous English name. Canonical major.minor.patch only, each component 0-999999; no dev, leading zeros, prerelease, build suffix, partial version or implicit coercion. Bundled semver can emit console diagnostics if its initialization enabled semver NODE_DEBUG." },
  "eda.sys_Environment.isEditorCurrentVersionLessThanOrEqual": { parameters: ["version"], result: "boolean", effect: "environment-metadata-read",
    limitation: "Compares SUPPLIED version <= CURRENT editor semantic version, despite the method's ambiguous English name. Canonical major.minor.patch only, each component 0-999999; no dev, leading zeros, prerelease, build suffix, partial version or implicit coercion. Bundled semver can emit console diagnostics if its initialization enabled semver NODE_DEBUG." },
};
const commonLimitations = [
  "Separately hash-admitted API 0.3.50 or 0.3.59 implementation under its exact runtime profile. Discovery, source implementation and offline tests do not establish current connected validation.",
  "Fixed synchronous public methods only, two exact scalar samples on the same owner/method. No project, document, selection, account, file, network, navigation, shared-settings change or Save access.",
  "Responses are bounded to 8192 UTF-8 bytes; metadata strings to 128 printable ASCII characters. Malformed, asynchronous, unstable or oversized results refuse without truncation or automatic retry.",
] as const;

export function parseSdkSystemRequest(input: unknown): SdkSystemRequest { return sdkSystemRequestSchema.parse(input); }

export interface SdkSystemDescriptor {
  path: SystemMethod;
  method: SystemMethod;
  inputSchema: Record<string, unknown>;
  parameters: string[];
  resultKind: ResultKind;
  effect: Definition["effect"];
  units?: { input: Unit; output: Unit };
  limitations: string[];
  invocationEnabledByDiscovery: false;
  provenance: { version: string; apiSha256: string; implementationKind: "public-method-bounded-subset"; liveValidation: "not-recorded" };
  additionalReviewedProvenance: { version: string; apiSha256: string; scope: "public-utilities-only"; liveValidation: "not-recorded" }[];
}

export function sdkSystemDescriptors(): SdkSystemDescriptor[] {
  return sdkSystemRequestSchema.options.map((schema) => {
    const method = schema.shape.method.value;
    const definition = definitions[method];
    return { path: method, method, inputSchema: z.toJSONSchema(schema), parameters: [...definition.parameters], resultKind: definition.result,
      effect: definition.effect, ...(definition.units === undefined ? {} : { units: { ...definition.units } }),
      limitations: [...commonLimitations, definition.limitation], invocationEnabledByDiscovery: false,
      provenance: { version: SDK_SYSTEM_API_VERSION, apiSha256: SDK_SYSTEM_API_SHA256, implementationKind: "public-method-bounded-subset", liveValidation: "not-recorded" },
      additionalReviewedProvenance: [{ version: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.version,
        apiSha256: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.implementationSha256,
        scope: "public-utilities-only", liveValidation: "not-recorded" }] };
  });
}

export const sdkSystemCatalogQuerySchema = z.object({ method: z.enum(sdkSystemRequestSchema.options.map((schema) => schema.shape.method.value)).optional(), includeSchemas: z.boolean().default(false) }).strict();

export function querySdkSystemMethods(input: unknown = {}): Record<string, unknown> {
  const query = sdkSystemCatalogQuerySchema.parse(input);
  const entries = sdkSystemDescriptors().filter((entry) => query.method === undefined || entry.method === query.method)
    .map(({ inputSchema, ...entry }) => query.includeSchemas ? Object.assign(entry, { inputSchema }) : entry);
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries };
}

export function validateSdkSystemArguments(input: unknown): Record<string, unknown> {
  const result = sdkSystemRequestSchema.safeParse(input);
  if (result.success) { return { valid: true, request: result.data, executionAuthorized: false }; }
  return { valid: false, executionAuthorized: false, issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

/** No app bootstrap or caller-selected property access. The request is parsed
 * before literal code generation; the runtime separately admits exact bytes.
 */
export function buildSdkSystemProgram(input: unknown): string {
  const request = parseSdkSystemRequest(input);
  const definition = definitions[request.method];
  const namespace = request.method.startsWith("eda.sys_Unit.") ? "sys_Unit" : "sys_Environment";
  const method = request.method.slice(`eda.${namespace}.`.length);
  const argumentProperties = Object.entries(request.arguments).map(([key, value]) => `${JSON.stringify(key)}:${Object.is(value, -0) ? "-0" : JSON.stringify(value)}`).join(",");
  const argumentsCode = definition.parameters.map((parameter) => `args.${parameter}`).join(",");
  return `try {
const fail=()=>{throw new Error('SDK_SYSTEM_INVALID_RESULT');};
const args=Object.freeze({${argumentProperties}});
const owner=eda.${namespace},method=owner?.${method};if(!owner||typeof method!=='function')fail();
const kind=${JSON.stringify(definition.result)};
const project=value=>{
 if(kind==='number'){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e12)fail();return value;}
 if(kind==='boolean'){if(typeof value!=='boolean')fail();return value;}
 if(typeof value!=='string'||value.length<1||value.length>128||!/^[\\u0020-\\u007E]+$/.test(value))fail();return value;
};
const read=()=>{if(eda.${namespace}!==owner||owner.${method}!==method)fail();const value=project(method.call(owner,${argumentsCode}));if(eda.${namespace}!==owner||owner.${method}!==method)fail();return value;};
const first=read(),second=read();if(!Object.is(first,second))fail();
const json=JSON.stringify({ok:true,kind:'sdk-system',method:${JSON.stringify(request.method)},value:first,...(kind==='number'?{negativeZero:Object.is(first,-0)}:{})});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${SDK_SYSTEM_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SDK_SYSTEM_MAX_BYTES})fail();
return envelope;
}catch{throw new Error('SDK_SYSTEM_READ_FAILED');}`;
}

const payloadSchema = z.object({ ok: z.literal(true), kind: z.literal("sdk-system"), method: z.string(), value: z.unknown(), negativeZero: z.boolean().optional() }).strict();
const metadataText = z.string().min(1).max(128).regex(/^[\u0020-\u007E]+$/u);

export function validateSdkSystemResult(input: unknown, raw: unknown,
  provenance: { readonly version: string; readonly implementationSha256: string } = defaultProvenance): Record<string, unknown> {
  const request = parseSdkSystemRequest(input);
  const payload = payloadSchema.parse(raw);
  const definition = definitions[request.method];
  if (payload.method !== request.method) { throw new Error("SDK system result belongs to a different method."); }
  let value: unknown;
  if (definition.result === "number") {
    value = z.number().min(-1_000_000_000_000).max(1_000_000_000_000).parse(payload.value);
    if (payload.negativeZero === undefined || payload.negativeZero && value !== 0 || Object.is(value, -0)) {
      throw new Error("SDK system numeric result has an invalid signed-zero encoding.");
    }
  } else {
    if (Object.hasOwn(payload, "negativeZero")) { throw new Error("SDK system metadata cannot carry a numeric signed-zero flag."); }
    value = definition.result === "boolean" ? z.boolean().parse(payload.value) : metadataText.parse(payload.value);
  }
  return { ...payload, value, effect: definition.effect,
    ...(definition.units === undefined ? {} : { units: { ...definition.units }, numberOfDecimals: "numberOfDecimals" in request.arguments ? request.arguments.numberOfDecimals ?? 4 : 4 }),
    authority: "bounded-system-metadata-or-unit-calculation-only;not-project-state-or-runtime-admission",
    apiVersion: provenance.version, apiSha256: provenance.implementationSha256,
    limitations: [...commonLimitations, definition.limitation] };
}
