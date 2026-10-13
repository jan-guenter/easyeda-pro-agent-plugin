import { z } from "zod";
import { buildEditorObservationProgram } from "./editor-observation-program.ts";
import { EDITOR_SHELL_API_SHA256, EDITOR_SHELL_API_VERSION, EDITOR_SHELL_UI_SHA256, EDITOR_SHELL_UI_VERSION } from "./editor-shell.ts";

export const EDITOR_CONTEXT_MAX_BYTES = 8192;
export const editorContextRequestSchema = z.object({ action: z.literal("observe-editor-context") }).strict();
export type EditorContextRequest = z.infer<typeof editorContextRequestSchema>;
export function parseEditorContextRequest(input: unknown): EditorContextRequest { return editorContextRequestSchema.parse(input); }

const projectUuid = z.string().regex(/^[a-f0-9]{32}$/u);
const documentUuid = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const absentIdentity = z.object({ state: z.literal("absent") }).strict();
const undefinedIdentity = z.object({ state: z.literal("undefined") }).strict();
const valuedIdentity = z.object({ state: z.literal("value"), value: projectUuid }).strict();
const projectIdentity = z.discriminatedUnion("state", [absentIdentity, undefinedIdentity, valuedIdentity]);
const branchIdentity = z.discriminatedUnion("state", [absentIdentity, undefinedIdentity,
  z.object({ state: z.literal("empty") }).strict(), valuedIdentity]);
const documentTypeSchema = z.union([z.literal(1), z.literal(3)]);
const activeIdentity = z.discriminatedUnion("state", [
  z.object({ state: z.literal("none") }).strict(),
  z.object({ state: z.literal("start-page") }).strict(),
  z.object({ state: z.literal("placeholder") }).strict(),
  z.object({ state: z.literal("unsupported"), reason: z.enum(["document-type", "tab-identity"]) }).strict(),
  z.object({ state: z.literal("document"), documentType: documentTypeSchema,
    documentUuid, projectUuid, tabId: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})@[a-f0-9]{32}$/u) }).strict(),
]);

/** UI identities only. Missing fields are not evidence of closed projects. */
export const editorContextResultSchema = z.object({
  ok: z.literal(true), kind: z.literal("editor-context-observation"), action: z.literal("observe-editor-context"),
  active: activeIdentity, project: projectIdentity, branch: branchIdentity,
  visibilityVerified: z.literal(false), inputFocusVerified: z.literal(false),
  restorationCompletionVerified: z.literal(false), projectClosureVerified: z.literal(false),
  startupQualified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine((value) => (value.branch.state !== "value" || value.project.state === "value") &&
  (value.active.state !== "document" || value.project.state === "value" &&
    value.active.projectUuid === value.project.value && value.active.tabId === `${value.active.documentUuid}@${value.active.projectUuid}`));

const limitations = [
  "Registered UI metadata only, not actual input focus, visibility, native document readiness, project closure, completed restoration, CAD authority or persistence.",
  "Ordinary schematic/PCB identities require type 1/3, a 16- or 32-lowercase-hex document UUID, a 32-lowercase-hex project UUID and exact documentUuid@projectUuid equality with tab pid and UI current project. Other active types or tab formats are reported unsupported without raw identity.",
  "Project and branch own-data fields preserve absent, undefined and value states; branch also preserves the native empty-string sentinel. Missing branch metadata does not mean no project. UI fields are not independent manager or database proof.",
  "Two matching bounded samples retain frame, UI, tab-manager methods, complete registry owners, active data and project-object identity. This is not an atomic guard for any later operation.",
  "No titles, paths, owners/account identifiers, document contents, settings, selection or nonactive payloads are returned. The fixed editor program makes no RPC, project-manager call, DOM query, navigation, Save, file or preference change.",
  "Bounds remain 128 containers, 256 tabs, 255 tree nodes, depth 16 and 8192 UTF-8 output bytes. Missing, inconsistent, accessor-backed or changed inspected state refuses without truncation.",
] as const;

export const editorContextQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryEditorContext(input: unknown = {}): Record<string, unknown> {
  const query = editorContextQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{
    action: "observe-editor-context", effect: "registered-editor-context-read", invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(editorContextRequestSchema), resultSchema: z.toJSONSchema(editorContextResultSchema) } : {}),
    limitations: [...limitations], provenance: { apiVersion: EDITOR_SHELL_API_VERSION, apiSha256: EDITOR_SHELL_API_SHA256,
      uiVersion: EDITOR_SHELL_UI_VERSION, uiSha256: EDITOR_SHELL_UI_SHA256,
      implementationKind: "fixed-native-context-observer", liveValidation: "not-recorded" },
  }] };
}

export function validateEditorContextArguments(input: unknown): Record<string, unknown> {
  const result = editorContextRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

export function buildEditorContextProgram(input: unknown): string {
  parseEditorContextRequest(input);
  return buildEditorObservationProgram("context");
}

export function validateEditorContextResult(input: unknown, raw: unknown): Record<string, unknown> {
  parseEditorContextRequest(input);
  const payload = editorContextResultSchema.parse(raw);
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > EDITOR_CONTEXT_MAX_BYTES) { throw new Error("Editor-context result exceeds its byte bound."); }
  return { ...payload, effect: "registered-editor-context-read", authority: "ui-identity-observation-only;not-cad-persistence-or-startup-authorization",
    apiVersion: EDITOR_SHELL_API_VERSION, apiSha256: EDITOR_SHELL_API_SHA256,
    uiVersion: EDITOR_SHELL_UI_VERSION, uiSha256: EDITOR_SHELL_UI_SHA256, limitations: [...limitations] };
}
