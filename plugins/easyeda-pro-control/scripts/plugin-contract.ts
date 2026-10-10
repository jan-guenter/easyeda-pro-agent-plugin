import { z } from "zod";

export const FACADE_TOOL_NAMES = [
  "easyeda_control_api",
  "easyeda_control_status", "easyeda_control_discover", "easyeda_control_context",
  "easyeda_control_design", "easyeda_control_library", "easyeda_control_runtime", "easyeda_control_native_ui", "easyeda_control_check",
  "easyeda_control_exact_read", "easyeda_control_read", "easyeda_control_read_batch", "easyeda_control_execute",
  "easyeda_control_capture", "easyeda_control_export", "easyeda_control_plan", "easyeda_control_apply",
  "easyeda_control_verify", "easyeda_control_rollback", "easyeda_control_save_reopen", "easyeda_control_checkpoint",
  "easyeda_control_recover_incomplete", "easyeda_control_evidence_recover", "easyeda_control_evidence_verify", "easyeda_control_artifact_read",
] as const;
export const AGENT_DEFAULT_PROMPT = "Use $easyeda-pro-control to inspect EasyEDA, apply the requested typed API changes, and verify saved results; use native controls for missing APIs and dialogs.";
export const MANIFEST_DEFAULT_PROMPTS = [
  "Validate the EasyEDA bridge without bypassing compatibility gates.",
  "Inspect the admitted EasyEDA project with exact readers and managed evidence.",
  "Apply the requested typed design change and verify it after saving and reopening.",
] as const;

export const portableMcpArgumentsSchema = z.tuple([
  z.literal("server/dist/server.mjs"),
  z.literal("--machine-launch"),
]);

// Check the whole executable contract; tool-policy metadata is validated separately.
export const portableMcpLaunchSchema = z.object({
  command: z.literal("node"), args: portableMcpArgumentsSchema, cwd: z.literal("."),
  env: z.record(z.string(), z.string()).refine((environment) => Object.keys(environment).length === 0),
});
export function hasPortableMcpLaunch(server: unknown): boolean {
  return portableMcpLaunchSchema.safeParse(server).success;
}
