/** Current fixed helper success relation. Negative reports stay in the raw
 * transport envelope and never acquire main-reference authority. */
import { exact } from "./symbol-clock-controls.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { validateMainReferenceResult } from "./closed-symbol-main-reference-program.ts";
import type { MainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";

type Bag = Record<string, unknown>;
function need(value: boolean): asserts value { if (!value) { throw new Error("Main reference v3 result refused."); } }
function flags(value: Bag, yes: readonly string[], no: readonly string[], zero: readonly string[]): void {
  for (const key of yes) { need(value[key] === true); }
  for (const key of no) { need(value[key] === false); }
  for (const key of zero) { need(Object.is(value[key], 0)); }
}
function empty(value: Bag, keys: readonly string[]): void {
  for (const key of keys) {
    const items = value[key]; need(Array.isArray(items) && items.length === 0 && Reflect.ownKeys(items).length === 1);
    value[key] = Object.freeze([]);
  }
}
function component(value: string): void {
  // oxlint-disable-next-line no-control-regex -- Refuse native path component controls without normalizing any name.
  const forbidden = /[\u0000-\u001F\\/:*?"<>|]/u;
  need(value.length > 0 && value.length <= 255 && value !== "." && value !== ".." && !/[. ]$/u.test(value) &&
    !forbidden.test(value) && value.isWellFormed());
  const stem = value.split(".", 1)[0];
  need(stem !== undefined && !/^(?:[Cc][Oo][Nn]|[Pp][Rr][Nn]|[Aa][Uu][Xx]|[Nn][Uu][Ll]|[Cc][Oo][Mm][0-9]|[Ll][Pp][Tt][0-9])$/u.test(stem));
}
function rootPath(input: unknown, nonce: string): string {
  // Grammar on the original handle-derived name, not a separate path lookup or
  // An ancestry proof. The fixed native owner must also have completed below.
  need(typeof input === "string" && input.length < 4352 &&
    /^\\\\\?\\Volume\{[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\}\\/u.test(input));
  const parts = input.slice(49).split("\\");
  need(parts.length >= 2 && parts.length <= 35 && parts.at(-1) === `easyeda-main-reference-${nonce}` &&
    /^[Tt][Ee][Mm][Pp]$/u.test(parts.at(-2) ?? ""));
  for (const part of parts) { component(part); }
  return input;
}
function nativeOwner(input: unknown): Readonly<Bag> {
  const owner = exact(input, ["preparedSha256", "settlementReceiptWritten", "jobDependencyRetained", "job", "files", "layout", "ancestry"]);
  need(typeof owner["preparedSha256"] === "string" && /^[a-f0-9]{64}$/u.test(owner["preparedSha256"]));
  flags(owner, ["settlementReceiptWritten"], ["jobDependencyRetained"], []);
  const job = exact(owner["job"], ["launchAttempted", "launchCallEntered", "launchAcknowledged", "pid", "startFileTime",
    "rootSignaled", "emptyJob", "terminalObserved", "exitCodeObserved", "exitCode", "forced", "stopAccepted", "killOnCloseAttempted",
    "settlementFinished", "cleanupFinished", "cleanupSucceeded", "nativeSuccess", "primaryCode", "primaryNativeError",
    "errorCodes", "errorSlots", "nativeErrors", "errorOverflow", "acquisitionUncertain", "resourceAliasDetected"]);
  flags(job, ["launchAttempted", "launchCallEntered", "launchAcknowledged", "rootSignaled", "emptyJob", "terminalObserved",
    "exitCodeObserved", "settlementFinished", "cleanupFinished", "cleanupSucceeded", "nativeSuccess"],
  ["forced", "stopAccepted", "killOnCloseAttempted", "errorOverflow", "acquisitionUncertain", "resourceAliasDetected"],
  ["exitCode", "primaryCode", "primaryNativeError"]);
  need(typeof job["pid"] === "number" && Number.isSafeInteger(job["pid"]) && job["pid"] > 0 && job["pid"] <= 4_294_967_295 &&
    typeof job["startFileTime"] === "string" && /^[1-9][0-9]{0,18}$/u.test(job["startFileTime"]) &&
    BigInt(job["startFileTime"]) <= 9_223_372_036_854_775_807n);
  empty(job, ["errorCodes", "errorSlots", "nativeErrors"]);
  const files = exact(owner["files"], ["prepared", "unresolved", "allHandlesClosed", "acquiredHandles", "closeAttempts",
    "failedCloseSlots", "retainedSlots", "retainedCalls", "managedDigestCleanupUnresolved", "storageReleased", "failureNone"]);
  flags(files, ["prepared", "allHandlesClosed", "storageReleased", "failureNone"],
    ["unresolved", "managedDigestCleanupUnresolved"], ["retainedCalls"]);
  need(files["acquiredHandles"] === 109 && files["closeAttempts"] === 109);
  empty(files, ["failedCloseSlots", "retainedSlots"]);
  const layout = exact(owner["layout"], ["prepared", "cleanupDeferred", "allResourcesReleased", "usedFrames", "cleanupErrors",
    "failureNone", "coreFailureNone", "layoutObserved", "returnedHandles", "uniqueHandles", "closeAttempts", "allHandlesClosed",
    "failedCloseSlots", "aliasSlots"]);
  flags(layout, ["prepared", "allResourcesReleased", "failureNone", "coreFailureNone", "layoutObserved", "allHandlesClosed"],
    ["cleanupDeferred"], ["cleanupErrors"]);
  need(layout["usedFrames"] === 22 && layout["returnedHandles"] === 23 && layout["uniqueHandles"] === 23 && layout["closeAttempts"] === 23);
  empty(layout, ["failedCloseSlots", "aliasSlots"]);
  const ancestry = exact(owner["ancestry"], ["prepared", "cleanupDeferred", "allResourcesReleased", "unresolved", "leaseOutstanding",
    "storageReleased", "ownedHandles", "closeAttempts", "closeFailures", "cleanupErrors", "failureNone"]);
  flags(ancestry, ["prepared", "allResourcesReleased", "storageReleased", "failureNone"],
    ["cleanupDeferred", "unresolved", "leaseOutstanding"], ["closeFailures", "cleanupErrors"]);
  need(typeof ancestry["ownedHandles"] === "number" && Number.isSafeInteger(ancestry["ownedHandles"]) &&
    ancestry["ownedHandles"] >= 1 && ancestry["ownedHandles"] <= 70 && ancestry["closeAttempts"] === ancestry["ownedHandles"]);
  return Object.freeze({ ...owner, job: Object.freeze(job), files: Object.freeze(files), layout: Object.freeze(layout), ancestry: Object.freeze(ancestry) });
}

export function validateMainReferenceTransportV3Result(input: unknown, invocation: MainReferenceV3Metadata): Readonly<Bag> {
  const outer = exact(input, ["profile", "helperSha256", "session"]);
  need(outer["profile"] === "private.main-reference-transport-result.v3" && outer["helperSha256"] === invocation.helperIdentity.sha256);
  const value = exact(outer["session"], ["profile", "nonce", "mainSha256", "requestSha256", "root", "nativeCollectionComplete",
    "referenceValidated", "executionAuthorized", "clockCleanupKnown", "failure", "cleanupErrors", "owner", "nativeBefore", "nativeAfter", "result"]);
  need(value["profile"] === "private.main-reference-native-session.v1" && value["nonce"] === invocation.request.nonce &&
    value["mainSha256"] === invocation.mainSha256 && value["requestSha256"] === invocation.requestSha256 && value["failure"] === "none");
  flags(value, ["nativeCollectionComplete", "clockCleanupKnown"], ["referenceValidated", "executionAuthorized"], ["cleanupErrors"]);
  const root = rootPath(value["root"], invocation.request.nonce);
  const owner = nativeOwner(value["owner"]);
  const nativeAfter = validateClockSample(value["nativeAfter"]), nativeBefore = validateClockSample(value["nativeBefore"]);
  const reference = validateMainReferenceResult(value["result"], invocation.request);
  const start = Number((BigInt(nativeBefore.utcBeforeTicks) - 621_355_968_000_000_000n) / 10_000n);
  const relation = compareRendererClockEndpoints({ nativeBefore, nativeAfter, plannedWindow: { notBeforeMs: start, notAfterMs: start + 60_000 },
    renderer: { schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: reference.mainReference.clockBefore.epochMs,
      nowAfterMs: reference.mainReference.clockAfter.epochMs, isoBefore: reference.mainReference.clockBefore.iso,
      isoAfter: reference.mainReference.clockAfter.iso, offsetBeforeMinutes: reference.mainReference.clockBefore.offsetMinutes,
      offsetAfterMinutes: reference.mainReference.clockAfter.offsetMinutes } });
  return Object.freeze({ root, owner, helperIdentity: invocation.helperIdentity, nativeBefore, nativeAfter, reference, relation,
    executionAuthorized: false, appClockDirectlyObserved: false });
}
