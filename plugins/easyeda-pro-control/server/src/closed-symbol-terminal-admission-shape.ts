/** Fixed data-only historical admission relations. No semantic completion issuer. */
import { parseClosedSymbolTerminalArtifact } from "./closed-symbol-terminal-shape.ts";
import type { TerminalDescriptor } from "./closed-symbol-terminal-shape.ts";
import { canonicalJson, isRecord } from "./core.ts";

const HASH = /^[a-f0-9]{64}$/u;
const RESULT_KEYS = ["profile", "operationId", "classification", "historicalCompletionRecorded", "terminalOutcomeVerified",
  "liveOriginalCompletionProved", "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized",
  "replayAllowed", "terminalArtifact", "bodySha256", "storedJournalSha256", "entireStoredJournalSha256"] as const;
const FALSE_KEYS = ["liveOriginalCompletionProved", "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized", "replayAllowed"] as const;
export interface TerminalSelection {
  readonly profile: "easyeda-pro-control.closed-symbol-terminal.v1" | "easyeda-pro-control.closed-symbol-terminal.v2";
  readonly historicalProfile: "private.closed-symbol-historical-terminal.v1" | "private.closed-symbol-historical-terminal.v2";
  readonly bodySha256: string;
}
export interface HistoricalAdmissionBinding {
  readonly operationId: string;
  readonly storedJournalSha256: string;
  readonly entireStoredJournalSha256: string;
  readonly terminalArtifact: TerminalDescriptor;
}
function exact(value: unknown, keys: readonly string[]): Readonly<Record<string, unknown>> {
  if (!isRecord(value)) { throw new Error("Admission own-data object required."); }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) { throw new Error("Admission own-data object required."); }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const names = Reflect.ownKeys(descriptors);
  if (names.length !== keys.length || names.some((key) => typeof key !== "string" || !keys.includes(key))) {
    throw new Error("Admission exact object fields required.");
  }
  const fields: [string, unknown][] = [];
  for (const key of keys) {
    const descriptor = descriptors[key];
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) {
      throw new Error("Admission enumerable own data fields required.");
    }
    fields.push([key, descriptor.value as unknown]);
  }
  return Object.freeze(Object.fromEntries(fields));
}

/** Only choose the fixed inspector. The inspector still validates full shape and semantics. */
export function selectTerminalProfile(value: unknown): TerminalSelection {
  const envelope = exact(value, ["profile", "body", "bodySha256"]);
  const bodySha256 = envelope["bodySha256"], profile = envelope["profile"];
  if (!isRecord(envelope["body"]) || typeof bodySha256 !== "string" || !HASH.test(bodySha256)) {
    throw new Error("Admission terminal routing envelope refused.");
  }
  if (profile === "easyeda-pro-control.closed-symbol-terminal.v1") {
    return Object.freeze({ profile, historicalProfile: "private.closed-symbol-historical-terminal.v1", bodySha256 });
  }
  if (profile === "easyeda-pro-control.closed-symbol-terminal.v2") {
    return Object.freeze({ profile, historicalProfile: "private.closed-symbol-historical-terminal.v2", bodySha256 });
  }
  throw new Error("Admission terminal profile is not supported.");
}

/** Match one fixed inspector's result to the original scanner and routing read. */
export function matchesHistoricalAdmission(value: unknown, expected: HistoricalAdmissionBinding, selection: TerminalSelection): boolean {
  try {
    const fields = exact(value, RESULT_KEYS);
    const descriptor = parseClosedSymbolTerminalArtifact(fields["terminalArtifact"], expected.operationId);
    return fields["profile"] === selection.historicalProfile && fields["operationId"] === expected.operationId &&
      fields["classification"] === "historical-completion-verified" && fields["historicalCompletionRecorded"] === true &&
      fields["terminalOutcomeVerified"] === true && fields["storedJournalSha256"] === expected.storedJournalSha256 &&
      fields["entireStoredJournalSha256"] === expected.entireStoredJournalSha256 &&
      fields["bodySha256"] === selection.bodySha256 &&
      canonicalJson(descriptor) === canonicalJson(expected.terminalArtifact) && FALSE_KEYS.every((key) => fields[key] === false);
  } catch { return false; }
}
