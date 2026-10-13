import { z } from "zod";
import { buildEditorObservationProgram } from "./editor-observation-program.ts";

export const EDITOR_SHELL_API_VERSION = "0.3.50.ab46409c";
export const EDITOR_SHELL_API_SHA256 = "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76";
export const EDITOR_SHELL_UI_VERSION = "3.2.196.26ed3d6c";
export const EDITOR_SHELL_UI_SHA256 = "3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a";
export const EDITOR_SHELL_MAX_BYTES = 8192;
const MAX_CONTAINERS = 128;
const MAX_TABS = 256;

export const editorShellRequestSchema = z.object({ action: z.literal("observe-editor-shell") }).strict();
export type EditorShellRequest = z.infer<typeof editorShellRequestSchema>;
export function parseEditorShellRequest(input: unknown): EditorShellRequest { return editorShellRequestSchema.parse(input); }

/** Counts of registered shell entries, not visibility, open-project or CAD proof. */
export const editorShellResultSchema = z.object({
  ok: z.literal(true), kind: z.literal("editor-shell-observation"), action: z.literal("observe-editor-shell"),
  containerCount: z.number().int().min(1).max(MAX_CONTAINERS),
  tabCount: z.number().int().min(0).max(MAX_TABS),
  startPagePresent: z.boolean(), startPageActive: z.boolean(), activeTabPresent: z.boolean(),
  placeholderTabCount: z.number().int().min(0).max(1), otherTabCount: z.number().int().min(0).max(MAX_TABS),
  visibilityVerified: z.literal(false), restorationCompletionVerified: z.literal(false),
  projectClosureVerified: z.literal(false), startupQualified: z.literal(false),
  cadAuthority: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine((value) => value.tabCount === Number(value.startPagePresent) + value.placeholderTabCount + value.otherTabCount &&
  (!value.startPageActive || value.startPagePresent && value.activeTabPresent) && (!value.activeTabPresent || value.tabCount > 0) &&
  (!value.activeTabPresent || value.startPageActive || value.placeholderTabCount + value.otherTabCount > 0));

const limitations = [
  "Registered editor-shell counts only. Other tabs are not classified as designs; no titles, paths, account identifiers, document identifiers or tab payloads are returned.",
  "Start Page presence and active identity do not prove native window visibility, completed restoration, project closure, safe startup, CAD authority or persistence.",
  "Two identical bounded samples retain frame, UI, tab-manager, container/tree/array and tab-object owners. A matching observation is not an atomic guard for a later action.",
  "The fixed native getters read current tab identity and container references only. No public deep-clone getter, project manager, RPC, navigation, settings, files, Save or callbacks are invoked in the editor.",
  "Bounds are 128 containers, 256 tabs, 255 tree nodes, depth 16 and 8192 output UTF-8 bytes. Missing, inconsistent, changed or oversized state refuses without truncation.",
] as const;

export const editorShellQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryEditorShell(input: unknown = {}): Record<string, unknown> {
  const query = editorShellQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{
    action: "observe-editor-shell", effect: "registered-editor-shell-read", invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(editorShellRequestSchema), resultSchema: z.toJSONSchema(editorShellResultSchema) } : {}),
    limitations: [...limitations], provenance: { apiVersion: EDITOR_SHELL_API_VERSION, apiSha256: EDITOR_SHELL_API_SHA256,
      uiVersion: EDITOR_SHELL_UI_VERSION, uiSha256: EDITOR_SHELL_UI_SHA256, implementationKind: "fixed-native-shell-observer", liveValidation: "not-recorded" },
  }] };
}

export function validateEditorShellArguments(input: unknown): Record<string, unknown> {
  const result = editorShellRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** The current UI exports a class with static data/methods as UI.tabBar.
 * Deliberately do not traverse tab titles, raw data or project state.
 */
export function buildEditorShellProgram(input: unknown): string {
  parseEditorShellRequest(input);
  return buildEditorObservationProgram("shell");
}
export function validateEditorShellResult(input: unknown, raw: unknown): Record<string, unknown> {
  parseEditorShellRequest(input);
  const payload = editorShellResultSchema.parse(raw);
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > EDITOR_SHELL_MAX_BYTES) { throw new Error("Editor-shell result exceeds its byte bound."); }
  return { ...payload, effect: "registered-editor-shell-read", authority: "shell-observation-only;not-cad-persistence-or-startup-authorization",
    apiVersion: EDITOR_SHELL_API_VERSION, apiSha256: EDITOR_SHELL_API_SHA256,
    uiVersion: EDITOR_SHELL_UI_VERSION, uiSha256: EDITOR_SHELL_UI_SHA256, limitations: [...limitations] };
}
