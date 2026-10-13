/** Internal fixed native clock transport. Its observations do not grant execution authority. */
import { createHash } from "node:crypto";
import type { WindowsAuthorityTransport } from "./windows-authority.ts";

type Bag = Record<string, unknown>;
type Phase = "launch" | "capture" | "termination";
interface Sample {
  readonly schema: "easyeda-pro-control.windows-clock-sample.v1";
  readonly utcBeforeTicks: string; readonly utcAfterTicks: string;
  readonly qpcBefore: string; readonly qpcAfter: string; readonly qpcFrequency: string;
  readonly highResolution: true; readonly localOffsetMinutes: number; readonly zoneRulesSha256: string;
}
type Clock = Readonly<{ status: "observed"; tzAbsentBefore: true; tzAbsentAfter: true; before: Sample; after: Sample }> |
  Readonly<{ status: "unavailable"; reason: "tz-present" | "tz-query" | "clock-sample" | "timezone" | "not-clocked-launch" | "invalid-clock" }>;
export interface ClockAttachment {
  readonly schema: "easyeda-pro-control.owned-clock-attachment.v1";
  readonly phase: Phase; readonly baseSha256: string;
  readonly helperSourceSha256: string; readonly executionScopeSha256: string;
  readonly base: Readonly<Bag>; readonly clock: Clock;
  readonly producerBindingVerified: false; readonly executionAuthorized: false;
}
const hashPattern = /^[a-f0-9]{64}$/u, idPattern = /^[a-f0-9]{32}$/u;
const SAMPLE_KEYS = ["schema", "utcBeforeTicks", "utcAfterTicks", "qpcBefore", "qpcAfter", "qpcFrequency", "highResolution", "localOffsetMinutes", "zoneRulesSha256"];
const EPOCH_TICKS = 621_355_968_000_000_000n;
const MAX_DATE_TICKS = 3_155_378_975_999_999_999n;
const MAX_COUNTER = 9_223_372_036_854_775_807n;
function bad(): never { throw new Error("CLOCK_RECEIPT_REFUSED"); }
function isBag(input: unknown): input is Bag {
  return input !== null && typeof input === "object" && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null);
}
function fields(input: unknown, keys: readonly string[]): Bag {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) ||
      Reflect.ownKeys(input).length !== keys.length) { bad(); }
  const out: Bag = {};
  for (const key of keys) {
    const item = Object.getOwnPropertyDescriptor(input, key);
    if (item === undefined || !Object.hasOwn(item, "value")) { bad(); }
    out[key] = item.value as unknown;
  }
  return out;
}
function snapshotRequest(input: unknown): Readonly<Bag> {
  let cells = 0;
  function visit(value: unknown, depth: number): unknown {
    cells += 1;
    if (cells > 64 || depth > 3) { bad(); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { if (value.length > 4096) { bad(); } return value; }
    if (typeof value === "number") { if (!Number.isSafeInteger(value)) { bad(); } return value; }
    if (!isBag(value)) { bad(); }
    const copy: Bag = {};
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string" || key.length > 128) { bad(); }
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { bad(); }
      Object.defineProperty(copy, key, { value: visit(descriptor.value, depth + 1), enumerable: true });
    }
    return Object.freeze(copy);
  }
  const result = visit(input, 0);
  if (!isBag(result)) { bad(); }
  return result;
}
function envelope(input: unknown): Readonly<{ schema: unknown; base: unknown; clockInput: unknown }> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)) { bad(); }
  const keys = Reflect.ownKeys(input);
  if (keys.some((key) => key !== "schema" && key !== "base" && key !== "clock")) { bad(); }
  const baseValue = Object.getOwnPropertyDescriptor(input, "base"), schema = Object.getOwnPropertyDescriptor(input, "schema");
  if (schema === undefined || baseValue === undefined || !Object.hasOwn(schema, "value") || !Object.hasOwn(baseValue, "value")) { bad(); }
  const clockValue = Object.getOwnPropertyDescriptor(input, "clock");
  return { schema: schema.value, base: baseValue.value, clockInput: clockValue !== undefined && Object.hasOwn(clockValue, "value") ? clockValue.value : undefined };
}
function text(value: unknown, pattern: RegExp): string { if (typeof value !== "string" || !pattern.test(value)) { bad(); } return value; }
function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) { bad(); } return value;
}
function decimal(value: unknown, min: bigint, max: bigint): string {
  const literal = text(value, /^(?:0|[1-9]\d{0,18})$/u), parsed = BigInt(literal);
  if (parsed < min || parsed > max) { bad(); } return literal;
}
export function tzProbeProvesAbsence(length: unknown, lastError: unknown): boolean {
  const size = integer(length, 0, 4_294_967_295);
  const error = integer(lastError, 0, 4_294_967_295);
  return size === 0 && error === 203;
}
export function validateClockSample(input: unknown): Sample {
  const v = fields(input, SAMPLE_KEYS);
  if (v["schema"] !== "easyeda-pro-control.windows-clock-sample.v1" || v["highResolution"] !== true) { bad(); }
  const utcBeforeTicks = decimal(v["utcBeforeTicks"], EPOCH_TICKS, MAX_DATE_TICKS);
  const utcAfterTicks = decimal(v["utcAfterTicks"], EPOCH_TICKS, MAX_DATE_TICKS);
  const qpcBefore = decimal(v["qpcBefore"], 0n, MAX_COUNTER);
  const qpcAfter = decimal(v["qpcAfter"], 0n, MAX_COUNTER);
  const qpcFrequency = decimal(v["qpcFrequency"], 1n, MAX_COUNTER);
  const elapsedUtc = BigInt(utcAfterTicks) - BigInt(utcBeforeTicks);
  const elapsedQpc = BigInt(qpcAfter) - BigInt(qpcBefore);
  // Fixed one-second per-sample work bound, not a calibrated UTC/QPC agreement tolerance.
  if (elapsedUtc < 0n || elapsedUtc > 10_000_000n || elapsedQpc < 0n || elapsedQpc > BigInt(qpcFrequency)) { bad(); }
  return Object.freeze({ schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks, utcAfterTicks, qpcBefore, qpcAfter, qpcFrequency,
    highResolution: true, localOffsetMinutes: integer(v["localOffsetMinutes"], -840, 840), zoneRulesSha256: text(v["zoneRulesSha256"], hashPattern) });
}
function clock(input: unknown): Clock {
  if (input === null || typeof input !== "object") { bad(); }
  const status = Object.getOwnPropertyDescriptor(input, "status");
  if (status === undefined || !Object.hasOwn(status, "value")) { bad(); }
  if (status.value === "unavailable") {
    const v = fields(input, ["status", "reason"]);
    const reason = v["reason"];
    if (reason !== "tz-present" && reason !== "tz-query" && reason !== "clock-sample" && reason !== "timezone" && reason !== "not-clocked-launch") { bad(); }
    return Object.freeze({ status: "unavailable", reason });
  }
  const v = fields(input, ["status", "tzAbsentBefore", "tzAbsentAfter", "before", "after"]);
  if (v["status"] !== "observed" || v["tzAbsentBefore"] !== true || v["tzAbsentAfter"] !== true) { bad(); }
  const before = validateClockSample(v["before"]);
  const after = validateClockSample(v["after"]);
  if (before.qpcFrequency !== after.qpcFrequency || BigInt(after.qpcBefore) < BigInt(before.qpcAfter) ||
      BigInt(after.utcBeforeTicks) < BigInt(before.utcAfterTicks)) { bad(); }
  return Object.freeze({ status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before, after });
}
function processRecord(input: unknown, jobId: string): Bag {
  const v = fields(input, ["pid", "role", "startIdentity"]);
  integer(v["pid"], 1, 2_147_483_647);
  text(v["role"], /^(?:easyeda-main|easyeda-descendant|renderer|native-socket-owner)$/u);
  const start = text(v["startIdentity"], /^win32:\d{15,20}:job:[a-f0-9]{32}$/u);
  if (!start.endsWith(`:job:${jobId}`)) { bad(); } return v;
}
function base(input: unknown, phase: Phase): Bag {
  let keys: string[];
  if (phase === "launch") { keys = ["jobId", "helperInstance", "root"]; }
  else if (phase === "capture") { keys = ["jobId", "helperInstance", "bindingSha256", "capturedAt", "processes", "runtimePid", "socketOwnerPid"]; }
  else { keys = ["jobId", "helperInstance", "captureBindingSha256", "jobEmpty", "retainedProcessesExited", "checkedAt"]; }
  const v = fields(input, keys);
  const jobId = text(v["jobId"], idPattern); text(v["helperInstance"], idPattern);
  if (phase === "launch") { if (processRecord(v["root"], jobId)["role"] !== "easyeda-main") { bad(); } }
  else if (phase === "capture") {
    text(v["bindingSha256"], hashPattern);
    const rows = v["processes"];
    if (!Array.isArray(rows) || rows.length === 0 || rows.length > 512 || Reflect.ownKeys(rows).length !== rows.length + 1) { bad(); }
    let previous = 0;
    for (let index = 0; index < rows.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(rows, String(index));
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { bad(); }
      const pid = integer(processRecord(descriptor.value, jobId)["pid"], 1, 2_147_483_647);
      if (pid <= previous) { bad(); } previous = pid;
    }
    for (const key of ["runtimePid", "socketOwnerPid"]) { if (v[key] !== null) { integer(v[key], 1, 2_147_483_647); } }
  } else { text(v["captureBindingSha256"], hashPattern); if (v["jobEmpty"] !== true || v["retainedProcessesExited"] !== true) { bad(); } }
  if (phase !== "launch") {
    const timestamp = text(v[phase === "capture" ? "capturedAt" : "checkedAt"], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u);
    if (!Number.isFinite(Date.parse(timestamp))) { bad(); }
  }
  return v;
}
const mapped: Readonly<Record<string, Readonly<{ action: string; phase: Phase }>>> = {
  launch: { action: "clocked-launch", phase: "launch" },
  capture: { action: "clocked-capture", phase: "capture" },
  "finish-probe": { action: "clocked-finish-probe", phase: "capture" },
  "prove-terminated": { action: "clocked-prove-terminated", phase: "termination" },
};
const passThrough = new Set(["begin-probe", "end-probe", "release-capture", "normal-close"]);

/** Feed this transport to the existing ownership validator, never directly to a caller.
 * Attachments are observations; only the existing retained validator can issue ownership.
 */
export function createClockedTransport(raw: WindowsAuthorityTransport, source: Readonly<{ helperSourceSha256: string; executionScopeSha256: string }>): Readonly<{
  transport: WindowsAuthorityTransport; observations: () => readonly ClockAttachment[];
  originalAttachment: (base: unknown) => ClockAttachment | undefined;
}> {
  const sourceFields = fields(source, ["helperSourceSha256", "executionScopeSha256"]);
  const helperSourceSha256 = text(sourceFields["helperSourceSha256"], hashPattern);
  const executionScopeSha256 = text(sourceFields["executionScopeSha256"], hashPattern);
  const availableDescriptor = Object.getOwnPropertyDescriptor(raw, "assertClosedSessionAvailable");
  if (availableDescriptor !== undefined && !Object.hasOwn(availableDescriptor, "value")) { bad(); }
  const assertAvailable: unknown = availableDescriptor?.value;
  if (availableDescriptor !== undefined && typeof assertAvailable !== "function") { bad(); }
  if (availableDescriptor === undefined && "assertClosedSessionAvailable" in raw) { bad(); }
  const releaseDescriptor = Object.getOwnPropertyDescriptor(raw, "release"), requestDescriptor = Object.getOwnPropertyDescriptor(raw, "request");
  if (requestDescriptor === undefined || !Object.hasOwn(requestDescriptor, "value") || typeof requestDescriptor.value !== "function" ||
      releaseDescriptor === undefined || !Object.hasOwn(releaseDescriptor, "value") || typeof releaseDescriptor.value !== "function") { bad(); }
  const releaseMethod = raw.release, requestMethod = raw.request;
  function methods(): void {
    const releaseNow = Object.getOwnPropertyDescriptor(raw, "release"), requestNow = Object.getOwnPropertyDescriptor(raw, "request");
    if (requestNow === undefined || !Object.hasOwn(requestNow, "value") || requestNow.value !== requestMethod ||
        releaseNow === undefined || !Object.hasOwn(releaseNow, "value") || releaseNow.value !== releaseMethod) { bad(); }
  }
  const originalAttachments = new WeakMap<object, ClockAttachment>();
  const records: ClockAttachment[] = []; let inFlight = false, released = false;
  const transport: WindowsAuthorityTransport = {
    ...(assertAvailable === undefined ? {} : { assertClosedSessionAvailable(): void {
      methods();
      const current = Object.getOwnPropertyDescriptor(raw, "assertClosedSessionAvailable");
      if (typeof assertAvailable !== "function" || current === undefined || !Object.hasOwn(current, "value") || current.value !== assertAvailable) { bad(); }
      Reflect.apply(assertAvailable, raw, []);
    } }),
    async request(request): Promise<unknown> {
      methods(); if (released || inFlight) { bad(); }
      const retainedRequest = snapshotRequest(request);
      const action = text(retainedRequest["action"], /^[a-z-]{1,40}$/u), mapping = Object.hasOwn(mapped, action) ? mapped[action] : undefined;
      if (mapping === undefined && !passThrough.has(action)) { bad(); }
      inFlight = true;
      try {
        if (mapping === undefined) { return await requestMethod.call(raw, retainedRequest); }
        const response = envelope(await requestMethod.call(raw, Object.freeze({ ...retainedRequest, action: mapping.action })));
        if (released) { bad(); }
        if (response.schema !== `easyeda-pro-control.windows-clocked-${mapping.phase}.v1`) { bad(); }
        const validatedBase = base(response.base, mapping.phase);
        if (mapping.phase === "capture" && validatedBase["bindingSha256"] !== retainedRequest["bindingSha256"] ||
            mapping.phase === "termination" && (validatedBase["captureBindingSha256"] !== retainedRequest["captureBindingSha256"] ||
            validatedBase["jobId"] !== retainedRequest["jobId"] || validatedBase["helperInstance"] !== retainedRequest["helperInstance"])) { bad(); }
        let observed: Clock;
        try { observed = clock(response.clockInput); }
        catch { observed = Object.freeze({ status: "unavailable", reason: "invalid-clock" }); }
        const rawBase = response.base;
        // The unchanged object goes to the existing validator. Never manufacture
        // A launch/capture/termination grant here from these observations.
        const attachment: ClockAttachment = { schema: "easyeda-pro-control.owned-clock-attachment.v1", phase: mapping.phase,
          baseSha256: createHash("sha256").update(JSON.stringify(rawBase)).digest("hex"), helperSourceSha256, executionScopeSha256,
          base: structuredClone(validatedBase), clock: observed, producerBindingVerified: false, executionAuthorized: false };
        if (rawBase !== null && typeof rawBase === "object") { originalAttachments.set(rawBase, attachment); }
        records.push(attachment);
        if (records.length > 64) { records.shift(); }
        return rawBase;
      } finally { inFlight = false; }
    },
    async release(): Promise<void> { methods(); released = true; await releaseMethod.call(raw); },
  };
  return Object.freeze({ transport, observations: (): readonly ClockAttachment[] => structuredClone(records),
    originalAttachment(baseValue: unknown): ClockAttachment | undefined {
      methods(); if (released) { bad(); }
      return baseValue !== null && typeof baseValue === "object" ? originalAttachments.get(baseValue) : undefined;
    } });
}
