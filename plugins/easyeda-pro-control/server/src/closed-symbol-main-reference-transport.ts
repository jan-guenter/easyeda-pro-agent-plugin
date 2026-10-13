/** Private source-owned transport compiler. No configurable executable, source,
 * script path, callback, policy override or registry registration is exposed. */
/* oxlint-disable import/max-dependencies -- Legacy and current fixed compilers share only the original one-shot process observer. */
import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { exact } from "./symbol-clock-controls.ts";
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { MAIN_REFERENCE_PACKAGE, buildMainReferenceProgram, validateMainReferenceRequest, validateMainReferenceResult } from "./closed-symbol-main-reference-program.ts";
import { RUNTIME_PINS } from "./closed-symbol-main-reference-runtime.ts";
import { compileMainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";
import type { MainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";

const SOURCES = Object.freeze({ "owner-command.ps1": "f417642a0dffa2f80df33b6aafd5865aa944acb635b3a4b4814814dcdcfabbd5",
  "stdin-decoder.ps1": "c16caba4dc933f299f25b3bc9acede20e590f8bad3cfdb66799aefb978631e90",
  "OwnedSyntheticJob.cs": "e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727",
  "EasyedaClockObservation.cs": "97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c" });
const POWERSHELL = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
const compiled = new WeakSet<object>();
function need(value: boolean, message = "Main reference transport refused."): asserts value { if (!value) { throw new Error(message); } }

async function source(name: keyof typeof SOURCES): Promise<string> {
  // oxlint-disable-next-line no-bitwise -- Read exact packaged regular source, never a symlink.
  const handle = await open(fileURLToPath(new URL(`../../scripts/main-reference/${name}`, import.meta.url)), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true }); need(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= 32_768n);
    const bytes = Buffer.alloc(Number(before.size)); let offset = 0;
    while (offset < bytes.length) { const part = await handle.read(bytes, offset, bytes.length - offset, offset); need(part.bytesRead > 0); offset += part.bytesRead; }
    const after = await handle.stat({ bigint: true }), end = await handle.read(Buffer.alloc(1), 0, 1, bytes.length);
    need(end.bytesRead === 0 && before.size === after.size && before.ino === after.ino && before.dev === after.dev && before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs);
    const text = bytes.toString("utf8"); need(Buffer.from(text).equals(bytes) && sha256Text(text) === SOURCES[name]); return text;
  } finally { await handle.close(); }
}
export interface CompiledMainReferenceTransport {
  readonly request: ReturnType<typeof validateMainReferenceRequest>; readonly command: string; readonly stdin: string;
  readonly requestSha256: string; readonly mainSha256: string; readonly commandSha256: string;
  readonly sourcePins: typeof SOURCES; readonly runtimePinsSha256: string;
  readonly stdinProfile: "private.main-reference-stdin.v2"; readonly stdinSha256: string;
}
export interface MainReferenceTransportOutcome {
  readonly stdout: string; readonly stderr: string; readonly exitCode: number | null; readonly signal: string | null; readonly timedOut: boolean;
  readonly transportFailure: null | "output-limit" | "stdin-failure" | "stdout-failure" | "stderr-failure" | "start-failure" | "malformed-utf8" | "deadline";
  readonly rawStdoutBase64: string; readonly rawStderrBase64: string;
  readonly transportState: "closed" | "unresolved";
  readonly spawnReturnObserved: boolean;
  readonly transportCloseObserved: boolean;
  readonly observationGuardsComplete: boolean;
  readonly containmentRequest: "not-requested" | "accepted" | "refused" | "threw";
  readonly windowsJobTerminationProved: false;
  readonly executionAuthorized: false;
}
export async function compileMainReferenceTransport(input: unknown): Promise<CompiledMainReferenceTransport> {
  const request = validateMainReferenceRequest(input);
  const main = buildMainReferenceProgram(request), requestText = canonicalJson(request);
  const [template, owner, clock, decoder] = await Promise.all([source("owner-command.ps1"), source("OwnedSyntheticJob.cs"), source("EasyedaClockObservation.cs"), source("stdin-decoder.ps1")]);
  const mainSha256 = sha256Text(main), requestSha256 = sha256Text(requestText);
  const replacements = Object.freeze({ __NONCE__: request.nonce, __REQUEST_HASH__: requestSha256, __MAIN_HASH__: mainSha256,
    __STDIN_DECODER__: decoder,
    __PACKAGE_BASE64__: Buffer.from(MAIN_REFERENCE_PACKAGE).toString("base64"),
    __RUNTIME_PINS__: `@{${Object.entries(RUNTIME_PINS).map(([name, digest]) => `'${name}'='${digest}'`).join(";")}}` });
  let command = template;
  for (const [token, value] of Object.entries(replacements)) { need(command.split(token).length === 2); command = command.replace(token, value); }
  const stdinProfile = "private.main-reference-stdin.v2";
  const stdin = JSON.stringify({ profile: stdinProfile, ownerBase64: Buffer.from(owner).toString("base64"), clockBase64: Buffer.from(clock).toString("base64"),
    mainBase64: Buffer.from(main).toString("base64"), requestBase64: Buffer.from(requestText).toString("base64") });
  need(!/__[A-Z_]+__/u.test(command) && command.length > 0 && command.length <= 30_000 && stdin.length > 0 && stdin.length <= 180_000 &&
    Buffer.byteLength(stdin) === stdin.length && Buffer.byteLength(main) > 0 && Buffer.byteLength(main) <= 100_000 &&
    Buffer.byteLength(requestText) > 0 && Buffer.byteLength(requestText) <= 8192);
  const result = Object.freeze({ request, command, stdin, requestSha256, mainSha256, commandSha256: sha256Text(command), sourcePins: SOURCES, runtimePinsSha256: sha256Json(RUNTIME_PINS), stdinProfile, stdinSha256: sha256Text(stdin) });
  compiled.add(result); return result;
}

/** Current binary-helper compiler. The metadata twin itself grants no invocation. */
export async function compileMainReferenceTransportV3(input: unknown): Promise<Readonly<MainReferenceV3Metadata>> {
  const result = await compileMainReferenceV3Metadata(input);
  compiled.add(result); return result;
}

// Retain unresolved original children until their own close event. This is a
// Diagnostic ownership set, not a registration or permission to retry.
const unresolvedChildren = new Set<ReturnType<typeof spawn>>();

/** Transport evidence only. Native qualification is a separate result check;
 * child closure never establishes Windows Job termination.
 * Original invocation consumption is permanent, including after a late close. */
export function invokeMainReferenceTransport(input: CompiledMainReferenceTransport | MainReferenceV3Metadata): Promise<Readonly<MainReferenceTransportOutcome>> {
  need(compiled.delete(input), "Main reference invocation is unissued or already consumed.");
  const outcome = Promise.withResolvers<Readonly<MainReferenceTransportOutcome>>();
  let child: ReturnType<typeof spawn> | undefined, outputBytes = 0, settled = false;
  let drain: ReturnType<typeof setTimeout> | undefined, timeout: ReturnType<typeof setTimeout> | undefined;
  let failure: MainReferenceTransportOutcome["transportFailure"] = null;
  let containmentRequest: MainReferenceTransportOutcome["containmentRequest"] = "not-requested";
  let closeObserved = false, observationGuardsComplete = false, requestingContainment = false, settingUp = true;
  let exitCode: number | null = null, signal: string | null = null;
  const stderr: Buffer[] = [], stdout: Buffer[] = [];
  const settle = (transportState: MainReferenceTransportOutcome["transportState"]): void => {
    if (settled) { return; }
    settled = true; clearTimeout(timeout); clearTimeout(drain);
    const errorBytes = Buffer.concat(stderr), output = Buffer.concat(stdout);
    let errorText = "", outputText = "";
    if (failure === null) {
      try { const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }); outputText = decoder.decode(output); errorText = decoder.decode(errorBytes); }
      catch { failure = "malformed-utf8"; }
    }
    if (transportState === "unresolved" && child !== undefined && !closeObserved) { unresolvedChildren.add(child); }
    outcome.resolve(Object.freeze({ stdout: failure === null ? outputText : "", stderr: failure === null ? errorText : "", exitCode, signal,
      timedOut: failure === "deadline", transportFailure: failure, rawStdoutBase64: output.toString("base64"), rawStderrBase64: errorBytes.toString("base64"),
      transportState, spawnReturnObserved: child !== undefined, transportCloseObserved: closeObserved, observationGuardsComplete,
      containmentRequest, windowsJobTerminationProved: false, executionAuthorized: false }));
  };
  const settleClosed = (): void => { settle(observationGuardsComplete ? "closed" : "unresolved"); };
  const containOrSettle = (): void => {
    if (settled || settingUp) { return; }
    // Node can throw after its internal native spawn but before returning the
    // ChildProcess. No original handle then exists here to prove non-launch.
    if (child === undefined) { settle("unresolved"); return; }
    if (closeObserved) { settleClosed(); return; }
    drain = setTimeout(() => { if (closeObserved) { settleClosed(); } else { settle("unresolved"); } }, 5000); drain.unref();
    requestingContainment = true;
    try { containmentRequest = child.kill() ? "accepted" : "refused"; }
    catch { containmentRequest = "threw"; }
    finally { requestingContainment = false; }
    // Native close events are asynchronous. Retain correct evidence even if a
    // Synthetic child emits close synchronously from its containment request.
    if (closeObserved) { settleClosed(); }
  };
  const fail = (reason: NonNullable<MainReferenceTransportOutcome["transportFailure"]>): void => {
    if (settled || failure !== null) { return; }
    failure = reason; clearTimeout(timeout); containOrSettle();
  };
  const collect = (target: Buffer[], chunk: Buffer): void => {
    if (settled || closeObserved || failure !== null) { return; }
    const remaining = 131_072 - outputBytes, retained = Math.min(remaining, chunk.length);
    if (retained > 0) { target.push(Buffer.from(chunk.subarray(0, retained))); outputBytes += retained; }
    if (chunk.length > remaining) { fail("output-limit"); }
  };
  try {
    child = spawn(POWERSHELL, ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", input.command], { shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const current = child;
    const guard = (install: () => void): boolean => {
      try { install(); return true; }
      catch { fail("start-failure"); return false; }
    };
    const childError = guard(() => { current.on("error", () => { fail("start-failure"); }); });
    const childClose = guard(() => {
      current.once("close", (code, closedSignal) => {
        closeObserved = true; exitCode = code; signal = closedSignal;
        unresolvedChildren.delete(current);
        if (!requestingContainment && !settingUp) { settleClosed(); }
      });
    });
    // Attempt every available stream guard independently before any data/end
    // Operation. An unavailable guard cannot become complete on later close.
    const inputStream = current.stdin;
    const outputStream = current.stdout;
    const errorStream = current.stderr;
    const inputError = inputStream !== null && guard(() => { inputStream.on("error", () => { fail("stdin-failure"); }); });
    const outputError = outputStream !== null && guard(() => { outputStream.on("error", () => { fail("stdout-failure"); }); });
    const errorError = errorStream !== null && guard(() => { errorStream.on("error", () => { fail("stderr-failure"); }); });
    observationGuardsComplete = childError && childClose && inputError && outputError && errorError;
    if (!observationGuardsComplete) { fail("start-failure"); }
    if (!closeObserved && failure === null && inputStream !== null && outputStream !== null && errorStream !== null) {
      timeout = setTimeout(() => { fail("deadline"); }, 180_000); timeout.unref();
      outputStream.on("data", (chunk: Buffer) => { collect(stdout, chunk); });
      errorStream.on("data", (chunk: Buffer) => { collect(stderr, chunk); });
      if (!closeObserved && failure === null) { try { inputStream.end(input.stdin); } catch { fail("stdin-failure"); } }
    }
  } catch { fail("start-failure"); }
  finally { settingUp = false; if (closeObserved) { settleClosed(); } else if (failure !== null) { containOrSettle(); } }
  return outcome.promise;
}

export function validateMainReferenceTransportResult(input: unknown, invocation: CompiledMainReferenceTransport): Readonly<Record<string, unknown>> {
  const value = exact(input, ["profile", "requestSha256", "root", "owner", "nativeBefore", "nativeAfter", "result", "ownerSourceSha256", "clockSourceSha256", "mainSha256", "executionAuthorized"]);
  need(value["profile"] === "private.main-reference-transport-result.v2" && value["requestSha256"] === invocation.requestSha256 &&
    value["ownerSourceSha256"] === SOURCES["OwnedSyntheticJob.cs"] && value["clockSourceSha256"] === SOURCES["EasyedaClockObservation.cs"] && value["mainSha256"] === invocation.mainSha256 && value["executionAuthorized"] === false);
  const root = value["root"]; need(typeof root === "string" && root.length <= 400 && /^[A-Za-z]:\\[^\r\n\0]*\\Temp\\easyeda-main-reference-[a-f0-9]{64}$/u.test(root) && root.endsWith(invocation.request.nonce));
  const owner = exact(value["owner"], ["profile", "nonce", "requestSha256", "preparedSha256", "accepted", "stage", "rootPid", "rootStartFileTime",
    "forced", "emptyRetainedJob", "rootSignaled", "terminationObserved", "rootExitCode", "killOnCloseAttempted", "nativeCleanupComplete",
    "nativeCleanupSucceeded", "managedCleanupSucceeded", "settlementReceiptPublished", "primaryCategory", "nativePrimaryCode", "nativePrimaryError",
    "cleanupCodes", "cleanupSlots", "cleanupNativeErrors", "managedCleanupFailureCount", "managedCleanupOverflow", "executionAuthorized",
    "launchAttempted", "launchCallEntered", "launchAcknowledged", "nativeCleanupOverflow", "ownerRecordingFailed", "nativeAcquisitionUncertain",
    "nativeResourceAliasDetected", "ownershipUnresolved", "managedCleanupSlots"]);
  need(owner["profile"] === "private.main-reference-owner-final.v2" && owner["nonce"] === invocation.request.nonce && owner["requestSha256"] === invocation.requestSha256 &&
    typeof owner["preparedSha256"] === "string" && /^[a-f0-9]{64}$/u.test(owner["preparedSha256"]) && owner["accepted"] === true && owner["stage"] === "COMPLETE" &&
    typeof owner["rootPid"] === "number" && Number.isSafeInteger(owner["rootPid"]) && owner["rootPid"] > 0 && typeof owner["rootStartFileTime"] === "string" && /^[1-9]\d{16,18}$/u.test(owner["rootStartFileTime"]));
  // This is a current-producer success relation, not a parser for failed native
  // Diagnostics. Failed output remains in the separate raw transport envelope.
  for (const key of ["launchAttempted", "launchCallEntered", "launchAcknowledged", "rootSignaled", "emptyRetainedJob", "terminationObserved",
    "nativeCleanupComplete", "nativeCleanupSucceeded", "managedCleanupSucceeded", "settlementReceiptPublished"] as const) { need(owner[key] === true); }
  for (const key of ["forced", "killOnCloseAttempted", "nativeAcquisitionUncertain", "nativeResourceAliasDetected", "ownershipUnresolved",
    "ownerRecordingFailed", "nativeCleanupOverflow", "managedCleanupOverflow", "executionAuthorized"] as const) { need(owner[key] === false); }
  for (const key of ["rootExitCode", "primaryCategory", "nativePrimaryCode", "nativePrimaryError", "managedCleanupFailureCount"] as const) { need(Object.is(owner[key], 0)); }
  for (const key of ["cleanupCodes", "cleanupSlots", "cleanupNativeErrors", "managedCleanupSlots"] as const) {
    const errors = owner[key]; need(Array.isArray(errors) && errors.length === 0 && Reflect.ownKeys(errors).length === 1);
  }
  const nativeAfter = validateClockSample(value["nativeAfter"]), nativeBefore = validateClockSample(value["nativeBefore"]);
  const reference = validateMainReferenceResult(value["result"], invocation.request);
  const start = Number((BigInt(nativeBefore.utcBeforeTicks) - 621_355_968_000_000_000n) / 10_000n);
  const relation = compareRendererClockEndpoints({ nativeBefore, nativeAfter, plannedWindow: { notBeforeMs: start, notAfterMs: start + 60_000 },
    renderer: { schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: reference.mainReference.clockBefore.epochMs,
      nowAfterMs: reference.mainReference.clockAfter.epochMs, isoBefore: reference.mainReference.clockBefore.iso,
      isoAfter: reference.mainReference.clockAfter.iso, offsetBeforeMinutes: reference.mainReference.clockBefore.offsetMinutes,
      offsetAfterMinutes: reference.mainReference.clockAfter.offsetMinutes } });
  return Object.freeze({ root, owner: Object.freeze(owner), nativeBefore, nativeAfter, reference, relation, executionAuthorized: false, appClockDirectlyObserved: false });
}
