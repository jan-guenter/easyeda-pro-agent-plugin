/** PRIVATE metadata-only mirror: no child process import, registry or invoke. */
/** Private source-owned transport compiler. No configurable executable, source,
 * script path, callback, policy override or registry registration is exposed. */
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { exact } from "./symbol-clock-controls.ts";
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { MAIN_REFERENCE_PACKAGE, buildMainReferenceProgram, validateMainReferenceRequest, validateMainReferenceResult } from "./closed-symbol-main-reference-program.ts";
import { RUNTIME_PINS } from "./closed-symbol-main-reference-runtime.ts";

const SOURCES = Object.freeze({ "owner-command.ps1": "f417642a0dffa2f80df33b6aafd5865aa944acb635b3a4b4814814dcdcfabbd5",
  "stdin-decoder.ps1": "c16caba4dc933f299f25b3bc9acede20e590f8bad3cfdb66799aefb978631e90",
  "OwnedSyntheticJob.cs": "e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727",
  "EasyedaClockObservation.cs": "97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c" });
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
export interface RecordedMainReferenceMetadata {
  readonly request: ReturnType<typeof validateMainReferenceRequest>; readonly command: string; readonly stdin: string;
  readonly requestSha256: string; readonly mainSha256: string; readonly commandSha256: string;
  readonly sourcePins: typeof SOURCES; readonly runtimePinsSha256: string;
  readonly stdinProfile: "private.main-reference-stdin.v2"; readonly stdinSha256: string;
}
export async function compileRecordedMainReferenceMetadata(input: unknown): Promise<RecordedMainReferenceMetadata> {
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
  return result;
}

export function validateRecordedMainReferenceTransportResult(input: unknown, invocation: RecordedMainReferenceMetadata): Readonly<Record<string, unknown>> {
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
