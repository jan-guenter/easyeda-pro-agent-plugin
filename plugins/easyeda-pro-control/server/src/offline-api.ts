import { z } from "zod";
import { extensionApiCatalogInputSchema, queryExtensionApiCatalog } from "./extension-api-catalog.ts";
import { extensionApiCoverageInputSchema, queryExtensionApiCoverage } from "./extension-api-coverage.ts";
import { publicSdkCatalogQuerySchema, publicSdkValidationQuerySchema, queryPublicSdkReads, validatePublicSdkArguments } from "./public-sdk-catalog.ts";
import { operationCatalogQuerySchema, operationValidationRequestSchema, queryOperationCatalog, validateCatalogOperation } from "./operation-catalog.ts";
import { querySdkMathCalculations, sdkMathCatalogQuerySchema, validateSdkMathArguments } from "./sdk-math.ts";
import { querySdkSystemMethods, sdkSystemCatalogQuerySchema, validateSdkSystemArguments } from "./sdk-system.ts";
import { queryStartupExtensions, startupExtensionsQuerySchema, validateStartupExtensionsArguments } from "./startup-extensions.ts";
import { editorShellQuerySchema, queryEditorShell, validateEditorShellArguments } from "./editor-shell.ts";
import { queryOrdinaryLaunch, validateOrdinaryLaunchArguments } from "./ordinary-launch.ts";

const ordinaryLaunchQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();

export const apiRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sdk"), query: extensionApiCatalogInputSchema.optional() }).strict(),
  z.object({ action: z.literal("coverage"), query: extensionApiCoverageInputSchema.optional() }).strict(),
  z.object({ action: z.literal("sdk-reads"), query: publicSdkCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("sdk-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("calculations"), query: sdkMathCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("calculate-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("system"), query: sdkSystemCatalogQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("system-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("extensions"), query: startupExtensionsQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("extensions-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("editor-shell"), query: editorShellQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("editor-shell-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("launch"), query: ordinaryLaunchQuerySchema.optional() }).strict(),
  z.object({ action: z.literal("launch-validate"), query: publicSdkValidationQuerySchema }).strict(),
  z.object({ action: z.literal("operations"), query: operationCatalogQuerySchema }).strict(),
  z.object({ action: z.literal("validate"), query: operationValidationRequestSchema }).strict(),
]);

export const offlineApiToolConfiguration = {
  title: "EasyEDA offline API reference and argument validation",
  description: "Query hash-pinned SDK declarations and exhaustive per-method execution coverage with concrete omission reasons. Retrieve exact typed design/library, SDK-read, calculation, local-system, extension-metadata, editor-shell or ordinary-launch schemas; validate arguments including refinements. Entirely offline: no bridge calls, application launch, design changes, journal writes or execution authority. Declaration and adapter presence do not imply live validation.",
  inputSchema: { request: apiRequestSchema },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
};

export function queryOfflineApi(request: z.infer<typeof apiRequestSchema>): { offline: true; result: unknown } {
  let result: unknown;
  switch (request.action) {
    case "sdk": { result = queryExtensionApiCatalog(request.query ?? {}); break; }
    case "coverage": { result = queryExtensionApiCoverage(request.query ?? {}); break; }
    case "sdk-reads": { result = queryPublicSdkReads(request.query ?? {}); break; }
    case "sdk-validate": { result = validatePublicSdkArguments(request.query); break; }
    case "calculations": { result = querySdkMathCalculations(request.query ?? {}); break; }
    case "calculate-validate": { result = validateSdkMathArguments(request.query.request); break; }
    case "system": { result = querySdkSystemMethods(request.query ?? {}); break; }
    case "system-validate": { result = validateSdkSystemArguments(request.query.request); break; }
    case "extensions": { result = queryStartupExtensions(request.query ?? {}); break; }
    case "extensions-validate": { result = validateStartupExtensionsArguments(request.query.request); break; }
    case "editor-shell": { result = queryEditorShell(request.query ?? {}); break; }
    case "editor-shell-validate": { result = validateEditorShellArguments(request.query.request); break; }
    case "launch": { result = queryOrdinaryLaunch(request.query ?? {}); break; }
    case "launch-validate": { result = validateOrdinaryLaunchArguments(request.query.request); break; }
    case "operations": { result = queryOperationCatalog(request.query); break; }
    case "validate": { result = validateCatalogOperation(request.query); break; }
    default: { throw new Error("Unknown offline API reference action."); }
  }
  return { offline: true, result };
}
