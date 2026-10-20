/** Fixed private CDP vocabulary. No generic method, params, evaluation or pause. */
export type DiagnosticCommand =
  | Readonly<{ id: number; method: "Browser.getVersion" | "Target.getTargets" }>
  | Readonly<{ id: number; method: "Target.attachToTarget"; params: Readonly<{ targetId: string; flatten: true }> }>
  | Readonly<{ id: number; method: "Page.enable" | "Page.getFrameTree" | "Runtime.enable"; params: Readonly<Record<string, never>>; sessionId: string }>
  | Readonly<{ id: number; method: "Debugger.enable"; params: Readonly<{ maxScriptsCacheSize: 33_554_432 }>; sessionId: string }>
  | Readonly<{ id: number; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }>; sessionId: string }>;
export interface DiagnosticEvent { readonly method: string; readonly params: Readonly<Record<string, unknown>>; readonly sessionId?: string }
export const DIAGNOSTIC_SOURCE_FRAME_BYTES = 33_554_432;
export const DIAGNOSTIC_SOURCE_BYTES = 20 * 1024 * 1024;
export const DIAGNOSTIC_SESSION_BYTES = 64 * 1024 * 1024;
export function diagnosticToken(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,128}$/u.test(value); }
export function diagnosticRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
export function diagnosticExact(value: object, keys: readonly string[]): boolean {
  return Object.keys(value).toSorted().join(",") === keys.toSorted().join(",");
}
/** The native helper independently checks these same flat fields and constructs
 * JSON itself. Canonical re-encoding prevents an alternative wire vocabulary. */
export function diagnosticNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 1024 || chunk.at(-1) !== 0) { return fail(); }
  const raw: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8"));
  if (!diagnosticRecord(raw) || !Number.isSafeInteger(raw["id"]) || typeof raw["id"] !== "number" || raw["id"] < 1 || raw["id"] > 32) { return fail(); }
  const id = raw["id"], method = raw["method"], params = raw["params"], sessionId = raw["sessionId"];
  let command: DiagnosticCommand;
  let request: Readonly<Record<string, unknown>>;
  if (method === "Browser.getVersion" || method === "Target.getTargets") {
    if (!diagnosticExact(raw, ["id", "method"])) { return fail(); }
    command = { id, method }; request = { action: "send", requestId: id, method };
  } else if (method === "Target.attachToTarget") {
    if (!diagnosticExact(raw, ["id", "method", "params"]) || !diagnosticRecord(params) ||
        !diagnosticExact(params, ["targetId", "flatten"]) || !diagnosticToken(params["targetId"]) || params["flatten"] !== true) { return fail(); }
    command = { id, method, params: { targetId: params["targetId"], flatten: true } };
    request = { action: "send", requestId: id, method, targetId: params["targetId"] };
  } else {
    if (!diagnosticExact(raw, ["id", "method", "params", "sessionId"]) || !diagnosticToken(sessionId) || !diagnosticRecord(params)) { return fail(); }
    if (method === "Page.enable" || method === "Page.getFrameTree" || method === "Runtime.enable") {
      if (!diagnosticExact(params, [])) { return fail(); }
      command = { id, method, params: {}, sessionId }; request = { action: "send", requestId: id, method, sessionId };
    } else if (method === "Debugger.enable") {
      if (!diagnosticExact(params, ["maxScriptsCacheSize"]) || params["maxScriptsCacheSize"] !== DIAGNOSTIC_SOURCE_FRAME_BYTES) { return fail(); }
      command = { id, method, params: { maxScriptsCacheSize: DIAGNOSTIC_SOURCE_FRAME_BYTES }, sessionId };
      request = { action: "send", requestId: id, method, sessionId };
    } else if (method === "Debugger.getScriptSource") {
      if (!diagnosticExact(params, ["scriptId"]) || !diagnosticToken(params["scriptId"])) { return fail(); }
      command = { id, method, params: { scriptId: params["scriptId"] }, sessionId };
      request = { action: "send", requestId: id, method, sessionId, scriptId: params["scriptId"] };
    } else { return fail(); }
  }
  if (chunk.toString("utf8") !== `${JSON.stringify(command)}\0`) { return fail(); }
  return request;
}
function fail(): never { throw new Error("PCB_DIAGNOSTIC_OUTBOUND_FRAME"); }
