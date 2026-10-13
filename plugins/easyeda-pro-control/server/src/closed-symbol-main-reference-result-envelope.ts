/** Versioned retained transport diagnostics, never process authority.
 * Stage and historical qualification retain their separate native checks. */
import type { MainReferenceTransportOutcome } from "./closed-symbol-main-reference-transport.ts";

type Bag = Readonly<Record<string, unknown>>;
const COMMON_KEYS = ["exitCode", "signal", "timedOut", "transportFailure", "rawStdoutBase64", "rawStderrBase64"] as const;
const OBSERVATION_KEYS = ["transportState", "spawnReturnObserved", "transportCloseObserved", "observationGuardsComplete", "containmentRequest", "windowsJobTerminationProved", "executionAuthorized"] as const;
const FAILURES = ["output-limit", "stdin-failure", "stdout-failure", "stderr-failure", "start-failure", "malformed-utf8", "deadline"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("Main reference retained transport refused."); } }
function exact(input: unknown, keys: readonly string[]): Bag {
  need(input !== null && typeof input === "object" && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) && Reflect.ownKeys(input).length === keys.length);
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const item = Object.getOwnPropertyDescriptor(input, key);
    need(item !== undefined && Object.hasOwn(item, "value") && item.enumerable === true);
    out[key] = item.value as unknown;
  }
  return Object.freeze(out);
}
function hash(value: unknown): string { need(typeof value === "string" && /^[a-f0-9]{64}$/u.test(value)); return value; }
function bytes(value: unknown): Buffer {
  need(typeof value === "string" && value.length <= 174_764);
  const result = Buffer.from(value, "base64");
  need(result.length <= 131_072 && result.toString("base64") === value); return result;
}
export interface RecordedTransportEnvelope {
  readonly profile: "private.main-reference-retained-result.v1" | "private.main-reference-retained-result.v2";
  readonly requestSha256: string; readonly intentSha256: string;
  readonly returnedEncoding: "base64-streams-v1"; readonly returned: Bag;
}

/** Exact data parser. v1 remains v1: missing close/guard observations are never
 * backfilled. This accepts failed diagnostics, not a successful stage result. */
export function parseRetainedMainReferenceTransport(input: unknown, requestSha256: string, intentSha256: string): Readonly<RecordedTransportEnvelope> {
  hash(requestSha256); hash(intentSha256);
  const envelope = exact(input, ["profile", "requestSha256", "intentSha256", "returnedEncoding", "returned"]);
  const profile = envelope["profile"];
  need((profile === "private.main-reference-retained-result.v1" || profile === "private.main-reference-retained-result.v2") &&
    envelope["requestSha256"] === requestSha256 && envelope["intentSha256"] === intentSha256 && envelope["returnedEncoding"] === "base64-streams-v1");
  const v2 = profile === "private.main-reference-retained-result.v2";
  const streams = exact(envelope["returned"], v2 ? [...COMMON_KEYS, ...OBSERVATION_KEYS] : COMMON_KEYS);
  const code = streams["exitCode"];
  const signal = streams["signal"];
  const failure = streams["transportFailure"];
  // JSON cannot retain a negative-zero sign. No OS-specific integer range is
  // Inferred for diagnostics; successful qualification below still requires0.
  need(code === null || (typeof code === "number" && Number.isSafeInteger(code) && !Object.is(code, -0)));
  need(signal === null || (typeof signal === "string" && /^SIG[A-Z0-9]{1,32}$/u.test(signal) && code === null));
  need(failure === null || (typeof failure === "string" && FAILURES.some(value => value === failure)));
  // New readable-stream classifications were not emitted by the v1 producer.
  need(v2 || (failure !== "stdout-failure" && failure !== "stderr-failure"));
  need(typeof streams["timedOut"] === "boolean" && streams["timedOut"] === (failure === "deadline"));
  need(bytes(streams["rawStdoutBase64"]).length + bytes(streams["rawStderrBase64"]).length <= 131_072);
  if (v2) {
    const state = streams["transportState"];
    const spawn = streams["spawnReturnObserved"];
    const closed = streams["transportCloseObserved"];
    const guards = streams["observationGuardsComplete"];
    const containment = streams["containmentRequest"];
    need((state === "closed" || state === "unresolved") && typeof spawn === "boolean" && typeof closed === "boolean" && typeof guards === "boolean" &&
      (containment === "not-requested" || containment === "accepted" || containment === "refused" || containment === "threw") &&
      streams["windowsJobTerminationProved"] === false && streams["executionAuthorized"] === false);
    need(state === (spawn && closed && guards ? "closed" : "unresolved"));
    need(closed || (code === null && signal === null));
    need(spawn || (!closed && !guards && code === null && signal === null && containment === "not-requested" && failure === "start-failure"));
    need(failure !== null || (state === "closed" && containment === "not-requested"));
  }
  return Object.freeze({ profile, requestSha256, intentSha256, returnedEncoding: "base64-streams-v1", returned: streams });
}

/** Serialize every observation explicitly. The caller still retains the exact
 * original in memory before publication and owns exclusive artifact creation. */
export function retainMainReferenceTransportV2(value: MainReferenceTransportOutcome, requestSha256: string, intentSha256: string): Readonly<RecordedTransportEnvelope> {
  return parseRetainedMainReferenceTransport({ profile: "private.main-reference-retained-result.v2", requestSha256, intentSha256,
    returnedEncoding: "base64-streams-v1", returned: {
      exitCode: value.exitCode, signal: value.signal, timedOut: value.timedOut, transportFailure: value.transportFailure,
      rawStdoutBase64: value.rawStdoutBase64, rawStderrBase64: value.rawStderrBase64,
      transportState: value.transportState, spawnReturnObserved: value.spawnReturnObserved, transportCloseObserved: value.transportCloseObserved,
      observationGuardsComplete: value.observationGuardsComplete, containmentRequest: value.containmentRequest,
      windowsJobTerminationProved: value.windowsJobTerminationProved, executionAuthorized: value.executionAuthorized,
    } }, requestSha256, intentSha256);
}

/** Current producer's historical text only. Never fall back to a serialized
 * v1 profile: that would let resealed data remove required observations. Legacy
 * v1 remains inspectable by the data parser, not admitted by this function.
 * Native qualification, baseline joins and original issuance remain separate. */
export function successfulRetainedMainReferenceText(input: unknown, requestSha256: string, intentSha256: string): Readonly<{
  text: string; transportObservationRetained: true; windowsJobTerminationProved: false; executionAuthorized: false;
}> {
  const envelope = parseRetainedMainReferenceTransport(input, requestSha256, intentSha256), streams = envelope.returned;
  need(envelope.profile === "private.main-reference-retained-result.v2");
  need(streams["exitCode"] === 0 && streams["signal"] === null && streams["timedOut"] === false &&
    streams["transportFailure"] === null && streams["rawStderrBase64"] === "");
  return Object.freeze({ text: new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes(streams["rawStdoutBase64"])),
    transportObservationRetained: true, windowsJobTerminationProved: false, executionAuthorized: false });
}
