import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { archiveCaptureEvidence, controlDataDirectory, ensureManagedDirectory, releaseEvidenceReservation, reserveEvidencePaths } from "./artifacts.ts";
import { canonicalJson } from "./core.ts";
import { deriveWindowsRuntimePaths } from "./windows-runtime.ts";
import type { WindowsControlRuntime, WindowsControlRuntimeOptions } from "./windows-runtime.ts";

const SCHEMA = "easyeda-pro-control.windows-native-ui.v1";
const MAX_RESPONSE = 24 * 1024 * 1024;
const handleSchema = z.string().regex(/^[1-9][0-9]{0,18}$/u);
const textSchema = z.string().max(4096).refine((value) => !value.includes("\0"), "NUL is not native UI text.");
const bindingSchema = z.object({ rootPid: z.number().int().positive(), rootStartTicks: z.string().regex(/^[0-9]{15,20}$/u),
  executable: z.string().min(1), executableSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict();
export const nativeUiAppBindingSchema = bindingSchema.extend({ authority: z.literal("observed-unowned") });
const bound = { appBinding: nativeUiAppBindingSchema.optional() };
const windowSelection = { windowHandle: handleSchema, ...bound };
const selection = { ...windowSelection, name: textSchema.optional(), automationId: textSchema.optional() };
const confirmed = { confirmUIWrite: z.literal(true) };
export const nativeUiRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("discover") }).strict(),
  z.object({ action: z.literal("windows"), ...bound }).strict(),
  z.object({ action: z.literal("inspect"), ...selection }).strict(),
  z.object({ action: z.literal("focused"), ...windowSelection }).strict(),
  z.object({ action: z.literal("capture"), ...windowSelection }).strict(),
  z.object({ action: z.literal("focus"), ...windowSelection, ...confirmed }).strict(),
  z.object({ action: z.literal("normal-close"), ...windowSelection, ...confirmed }).strict(),
  z.object({ action: z.literal("invoke"), ...selection, ...confirmed }).strict(),
  z.object({ action: z.literal("setvalue"), ...selection, text: textSchema, ...confirmed }).strict(),
  z.object({ action: z.literal("filename"), ...windowSelection, controlHandle: handleSchema, text: textSchema, ...confirmed }).strict(),
  z.object({ action: z.enum(["click", "doubleclick", "rightclick"]), ...windowSelection, x: z.number().int().min(-32_768).max(32_767), y: z.number().int().min(-32_768).max(32_767), ...confirmed }).strict(),
  z.object({ action: z.literal("keys"), ...windowSelection, text: textSchema, ...confirmed }).strict(),
]);
export type NativeUiRequest = z.infer<typeof nativeUiRequestSchema>;

export interface WindowsNativeUiControllerOptions extends Omit<WindowsControlRuntimeOptions, "upstream" | "reviewedExecutionScopeSha256"> {
  readonly runtime: Pick<WindowsControlRuntime, "status">;
}
export interface NativeUiInvocation {
  readonly powershellExecutable: string;
  readonly helperWindowsPath: string;
  readonly request: Readonly<Record<string, unknown>>;
  readonly timeoutMs: 10_000;
}
/** Offline injection only. Production never accepts a caller-selected program. */
export interface WindowsNativeUiDependencies {
  readonly invoke?: (input: NativeUiInvocation) => Promise<unknown>;
  readonly verifyHelper?: (helperPath: string) => Promise<void>;
  readonly hashExecutable?: (executablePath: string) => Promise<string>;
  readonly archiveCapture?: (request: NativeUiRequest, payload: Record<string, unknown>, bytes: Buffer) => Promise<unknown>;
}
const responseSchema = z.object({ schema: z.literal(SCHEMA), binding: bindingSchema, action: z.string(), result: z.record(z.string(), z.json()) }).strict();
const discoverySchema = z.object({ schema: z.literal(SCHEMA), action: z.literal("discover"), observations: z.array(nativeUiAppBindingSchema).max(16) }).strict();
const failedSchema = z.object({ schema: z.literal(SCHEMA), error: z.enum(["native-ui-refused", "native-ui-action-failed"]), dispatched: z.boolean() }).strict();

function nativeUiFailure(code: string, dispatched: boolean): Error & { readonly dispatched: boolean } {
  return Object.assign(new Error(code), { name: "NativeUiFailureError", dispatched });
}

async function verifyHelper(helperPath: string): Promise<void> {
  const before = await lstat(helperPath);
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size === 0 || before.size > 128 * 1024 || await realpath(helperPath) !== helperPath) {
    throw new Error("Native UI helper is not the canonical bounded packaged file.");
  }
}

async function hashExecutable(executablePath: string): Promise<string> {
  if (await realpath(executablePath) !== executablePath) { throw nativeUiFailure("native-ui-installed-path-not-canonical", false); }
  // oxlint-disable-next-line eslint/no-bitwise -- Read-only no-follow descriptor for the installed executable.
  const file = await open(executablePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await file.stat();
    if (!before.isFile() || before.nlink !== 1 || before.size === 0 || before.size > 1_073_741_824) { throw nativeUiFailure("native-ui-installed-executable-invalid", false); }
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) { throw nativeUiFailure("native-ui-installed-read-invalid", false); }
      hash.update(chunk);
    }
    for (const after of [await file.stat(), await lstat(executablePath)]) {
      if (!after.isFile() || after.nlink !== 1 || after.dev !== before.dev || after.ino !== before.ino || after.size !== before.size || after.ctimeMs !== before.ctimeMs || after.mtimeMs !== before.mtimeMs) { throw nativeUiFailure("native-ui-installed-executable-changed", false); }
    }
    return hash.digest("hex");
  } finally { await file.close(); }
}

/** One short-lived fixed-script process. Raw stderr is deliberately withheld. */
export function invokeNativeUiHelper(input: NativeUiInvocation): Promise<unknown> {
  // oxlint-disable-next-line promise/avoid-new -- Adapt the short-lived child process event lifecycle into one bounded completion.
  return new Promise((resolve, reject) => {
    const child = spawn(input.powershellExecutable, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", input.helperWindowsPath], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    const chunks: Buffer[] = [];
    let size = 0;
    let failure: ReturnType<typeof nativeUiFailure> | undefined;
    const mutating = input.request["confirmUIWrite"] === true;
    const abort = (code: string): void => { failure ??= nativeUiFailure(code, mutating); child.kill("SIGKILL"); };
    const deadline = setTimeout(() => { abort("native-ui-timeout"); }, input.timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_RESPONSE) { abort("native-ui-response-limit"); }
      else { chunks.push(chunk); }
    });
    // Native errors can include user text or paths; never forward them.
    child.stderr.on("data", () => {
      // Consume but do not publish native stderr.
    });
    child.stdin.on("error", () => { abort("native-ui-request-channel-failed"); });
    child.on("error", () => { failure ??= nativeUiFailure("native-ui-start-failed", false); });
    child.on("close", (code) => {
      clearTimeout(deadline);
      if (failure !== undefined) { reject(failure); return; }
      if (code !== 0) { reject(nativeUiFailure("native-ui-helper-exited", mutating)); return; }
      try { const decoded: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8").trim()); resolve(decoded); }
      catch { reject(nativeUiFailure("native-ui-response-invalid", mutating)); }
    });
    child.stdin.end(`${JSON.stringify(input.request)}\n`);
  });
}

async function archiveNativeCapture(request: NativeUiRequest, payload: Record<string, unknown>, bytes: Buffer): Promise<unknown> {
  const directory = await ensureManagedDirectory(path.join(controlDataDirectory(), "native-ui"));
  const stem = path.join(directory, randomUUID());
  const reservation = await reserveEvidencePaths({ resultPath: `${stem}.result.json`, receiptPath: `${stem}.receipt.json` });
  try {
    return await archiveCaptureEvidence({ reservation, request, payload, images: [{ mimeType: "image/png", bytes }], metadata: { source: "native-desktop", designPersistenceProven: false } });
  } catch (error) {
    await releaseEvidenceReservation(reservation).catch(() => {
      // Preserve the original error and any incomplete evidence for recovery.
    });
    throw error;
  }
}

export class WindowsNativeUiController {
  private readonly options: WindowsNativeUiControllerOptions;
  private readonly dependencies: WindowsNativeUiDependencies;
  private busy = false;
  public constructor(options: WindowsNativeUiControllerOptions, dependencies: WindowsNativeUiDependencies = {}) { this.options = options; this.dependencies = dependencies; }

  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = nativeUiRequestSchema.parse(input);
    if (this.busy) { throw nativeUiFailure("native-ui-call-already-running", false); }
    this.busy = true;
    try { return await this.runBound(request); } finally { this.busy = false; }
  }

  /** Only the journal-bound recovery coordinator calls this method. The public
   * ordinary UI schema cannot supply this screenshot-before-click authority.
   */
  public async runRecoveryCloseClick(input: unknown): Promise<Record<string, unknown>> {
    const parsed = z.object({ ...windowSelection, ...confirmed, x: z.number().int(), y: z.number().int(),
      expectedCaptureSha256: z.string().regex(/^[a-f0-9]{64}$/u), expectedBounds: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive()]) }).strict().parse(input);
    const { expectedCaptureSha256, expectedBounds, appBinding, ...clickFields } = parsed;
    const runtime = this.options.runtime.status();
    if (runtime.state === "owned" && appBinding !== undefined && (runtime.launch?.root.pid !== appBinding.rootPid || runtime.executableSha256 !== appBinding.executableSha256 || !runtime.launch.root.startIdentity.startsWith(`win32:${appBinding.rootStartTicks}:job:`))) { throw nativeUiFailure("native-ui-recovery-owned-binding-mismatch", false); }
    const request = nativeUiRequestSchema.parse({ action: "click", ...clickFields, ...(runtime.state === "owned" || appBinding === undefined ? {} : { appBinding }) });
    if (this.busy) { throw nativeUiFailure("native-ui-call-already-running", false); }
    this.busy = true;
    try { return await this.runBound(request, { expectedCaptureSha256, expectedBounds }); }
    finally { this.busy = false; }
  }

  private async runBound(request: NativeUiRequest, recoveryCloseConfirmation?: { expectedCaptureSha256: string; expectedBounds: [number, number, number, number] }): Promise<Record<string, unknown>> {
    const runtime = this.options.runtime.status();
    const paths = deriveWindowsRuntimePaths(this.options);
    const helperPath = path.join(this.options.pluginRoot, "scripts/native-ui-controller.ps1");
    const legacyHelperPath = path.join(this.options.pluginRoot, "scripts/native-ui.ps1");
    await (this.dependencies.verifyHelper ?? verifyHelper)(helperPath);
    await (this.dependencies.verifyHelper ?? verifyHelper)(legacyHelperPath);
    const legacySha256 = createHash("sha256").update(await readFile(legacyHelperPath)).digest("hex");
    const executableSha256 = runtime.state === "owned" ? runtime.executableSha256 : await (this.dependencies.hashExecutable ?? hashExecutable)(paths.executablePath);
    if (executableSha256 === null || !/^[a-f0-9]{64}$/u.test(executableSha256)) { throw nativeUiFailure("native-ui-installed-executable-invalid", false); }
    let binding: z.infer<typeof bindingSchema> | undefined;
    let authority: "retained-job" | "observed-unowned" = "observed-unowned";
    if (request.action !== "discover") {
      if (request.appBinding === undefined) {
        const launch = runtime.launch;
        if (runtime.state !== "owned" || launch === null) { throw nativeUiFailure("native-ui-discover-and-bind-required", false); }
        const startMatch = /^win32:([0-9]{15,20}):job:([a-f0-9]{32})$/u.exec(launch.root.startIdentity);
        if (startMatch?.[2] !== launch.jobId || startMatch[1] === undefined || launch.root.role !== "easyeda-main") { throw nativeUiFailure("native-ui-root-generation-invalid", false); }
        binding = bindingSchema.parse({ rootPid: launch.root.pid, rootStartTicks: startMatch[1], executable: paths.executableWindowsPath, executableSha256 });
        authority = "retained-job";
      } else {
        if (runtime.state === "owned") { throw nativeUiFailure("native-ui-unowned-binding-conflicts-with-owned-runtime", false); }
        const { authority: _authority, ...observed } = request.appBinding;
        binding = bindingSchema.parse(observed);
        if (binding.executable !== paths.executableWindowsPath || binding.executableSha256 !== executableSha256) { throw nativeUiFailure("native-ui-observed-installation-mismatch", false); }
      }
    }
    if (canonicalJson(this.options.runtime.status()) !== canonicalJson(runtime)) { throw nativeUiFailure("native-ui-runtime-changed-before-dispatch", false); }
    const invoke = this.dependencies.invoke ?? invokeNativeUiHelper;
    const result = await invoke({ powershellExecutable: paths.powershellExecutable,
      helperWindowsPath: paths.helperWindowsPath.replace(/windows-authority\.ps1$/u, "native-ui-controller.ps1"), timeoutMs: 10_000,
      request: { schema: SCHEMA, executable: paths.executableWindowsPath, executableSha256, ...binding, ...request, legacyHelperSha256: legacySha256,
        ...(recoveryCloseConfirmation === undefined ? {} : { recoveryCloseConfirmation }) } });
    if (canonicalJson(this.options.runtime.status()) !== canonicalJson(runtime)) { throw nativeUiFailure("native-ui-runtime-changed-after-dispatch", "confirmUIWrite" in request); }
    const failure = failedSchema.safeParse(result);
    if (failure.success) { throw nativeUiFailure(failure.data.error, failure.data.dispatched); }
    if (request.action === "discover") {
      const discovery = discoverySchema.parse(result);
      if (discovery.observations.some((observed) => observed.executable !== paths.executableWindowsPath || observed.executableSha256 !== executableSha256)) { throw nativeUiFailure("native-ui-discovery-installation-mismatch", false); }
      return discovery;
    }
    const response = responseSchema.parse(result);
    if (response.action !== request.action || canonicalJson(response.binding) !== canonicalJson(binding)) { throw nativeUiFailure("native-ui-response-binding-mismatch", "confirmUIWrite" in request); }
    if (request.action !== "capture") { return { ...response, authority }; }
    const encoded = response.result["pngBase64"];
    if (typeof encoded !== "string" || encoded.length > 22_369_624 || encoded.length % 4 !== 0 || /[^A-Za-z0-9+/=]/u.test(encoded)) { throw nativeUiFailure("native-ui-capture-invalid", false); }
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length < 45 || bytes.length > 16 * 1024 * 1024 || bytes.toString("base64") !== encoded || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) { throw nativeUiFailure("native-ui-capture-invalid", false); }
    const { pngBase64: _encoded, ...captureResult } = response.result;
    const payload: Record<string, unknown> = { ...response, authority, result: captureResult };
    const receipt = await (this.dependencies.archiveCapture ?? archiveNativeCapture)(request, payload, bytes);
    return { ...payload, receipt };
  }
}
