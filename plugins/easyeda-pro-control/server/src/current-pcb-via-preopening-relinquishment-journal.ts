/** A sealed historical pre-opening snapshot is not a live owner or retry. */
import { publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { OperationJournal } from "./artifacts.ts";
import { canonicalJson, isErrnoException, sha256Json } from "./core.ts";
import { freshCurrentPcbViaAbandonmentJournal } from "./current-pcb-via-write-abandonment-data.ts";
import { entries } from "./current-pcb-via-write-journal-codec.ts";
import { currentPcbViaPreopeningRelinquishmentIntentSchema, currentPcbViaPreopeningRelinquishmentRequestSchema, currentPcbViaPreopeningRelinquishmentResultSchema } from "./current-pcb-via-preopening-relinquishment-contract.ts";
import type { CurrentPcbViaPreopeningRelinquishmentIntent as Intent, CurrentPcbViaPreopeningRelinquishmentResult as Result } from "./current-pcb-via-preopening-relinquishment-contract.ts";
import { currentPcbViaPreopeningRelinquishmentPath, readCurrentPcbViaPreopeningRelinquishmentFile } from "./current-pcb-via-preopening-relinquishment-file.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const PREFIX = Object.freeze(["operation-intent", "baseline-intent", "baseline-result", "allocation-intent", "allocation-result", "launch-intent", "launch-result", "main-intent", "failure", "abort-intent", "abort-result", "termination-intent"]);
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_PREOPENING_RELINQUISHMENT_JOURNAL"); } }
export interface CurrentPcbViaPreopeningHistoricalSnapshot { readonly profile: "private.current-pcb-via-preopening-historical-snapshot.v1" }
export interface CurrentPcbViaPreopeningHistoricalOriginal {
  readonly operationId: string; readonly journal: OperationJournal;
  readonly originalEntireJournalSha256: string; readonly originalStoredJournalSha256: string; readonly originalPlanSha256: string;
}
const issued = new WeakMap<CurrentPcbViaPreopeningHistoricalSnapshot, CurrentPcbViaPreopeningHistoricalOriginal>();

/** Exactly the old failed-main prefix. Any opening intent, additional action,
 * missing artifact, completed execution or altered chain refuses this route. */
export function requireCurrentPcbViaPreopeningJournal(input: OperationJournal): void {
  const records = entries(input);
  need(records.length === PREFIX.length && records.every((record, index) => record.kind === PREFIX[index]));
  need(records[8]?.evidence["stage"] === "main" && records[8].evidence["originalExecutionStopped"] === true && records[8].evidence["retryAuthorized"] === false);
  need(records[10]?.evidence["originalAbortAcknowledged"] === false && records[10].evidence["retryAuthorized"] === false);
  need(records[11]?.evidence["originalRootAndJobRequired"] === true);
}
async function readOriginal(operationId: string): Promise<CurrentPcbViaPreopeningHistoricalOriginal> {
  currentPcbViaPreopeningRelinquishmentRequestSchema.shape.operationId.parse(operationId);
  const journal = await freshCurrentPcbViaAbandonmentJournal(operationId); requireCurrentPcbViaPreopeningJournal(journal);
  const originalStoredJournalSha256 = journal["journalSha256"];
  need(typeof originalStoredJournalSha256 === "string" && /^[a-f\d]{64}$/u.test(originalStoredJournalSha256));
  const plan = journal.plan; need(plan !== undefined && typeof plan === "object" && "plan" in plan);
  return freezeDeep({ operationId, journal, originalEntireJournalSha256: sha256Json(journal), originalStoredJournalSha256, originalPlanSha256: sha256Json(plan["plan"]) });
}
export async function readCurrentPcbViaPreopeningHistoricalSnapshot(operationId: string): Promise<CurrentPcbViaPreopeningHistoricalSnapshot> {
  const original = await readOriginal(operationId);
  const token = Object.freeze({ profile: "private.current-pcb-via-preopening-historical-snapshot.v1" as const }); issued.set(token, original); return token;
}
export function requireCurrentPcbViaPreopeningHistoricalSnapshot(token: CurrentPcbViaPreopeningHistoricalSnapshot): CurrentPcbViaPreopeningHistoricalOriginal {
  const original = issued.get(token); need(original !== undefined); return original;
}
export async function assertCurrentPcbViaPreopeningHistoricalSnapshot(token: CurrentPcbViaPreopeningHistoricalSnapshot): Promise<void> {
  const original = requireCurrentPcbViaPreopeningHistoricalSnapshot(token); need(canonicalJson(await readOriginal(original.operationId)) === canonicalJson(original));
}
function matches(record: Intent | Result, original: CurrentPcbViaPreopeningHistoricalOriginal): boolean {
  return (["operationId", "originalEntireJournalSha256", "originalStoredJournalSha256", "originalPlanSha256"] as const).every(key => record[key] === original[key]);
}
async function optional(operationId: string, name: "intent.json" | "relinquished.json"): Promise<string | null> {
  try { const result = await readCurrentPcbViaPreopeningRelinquishmentFile(operationId, name); return result.text; }
  catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return null; } throw error; }
}
export async function readCurrentPcbViaPreopeningRelinquishment(token: CurrentPcbViaPreopeningHistoricalSnapshot): Promise<Readonly<{ intent: Intent; result: Result | null }> | null> {
  const original = requireCurrentPcbViaPreopeningHistoricalSnapshot(token); await assertCurrentPcbViaPreopeningHistoricalSnapshot(token);
  const first = await optional(original.operationId, "intent.json"), last = await optional(original.operationId, "relinquished.json");
  if (first === null) { need(last === null); await assertCurrentPcbViaPreopeningHistoricalSnapshot(token); return null; }
  const intent = currentPcbViaPreopeningRelinquishmentIntentSchema.parse(JSON.parse(first) as unknown);
  const result = last === null ? null : currentPcbViaPreopeningRelinquishmentResultSchema.parse(JSON.parse(last) as unknown);
  need(first === `${JSON.stringify(intent)}\n` && matches(intent, original));
  need(result === null || last === `${JSON.stringify(result)}\n` && matches(result, original) && result.relinquishmentIntentSha256 === sha256Json(intent));
  await assertCurrentPcbViaPreopeningHistoricalSnapshot(token); return Object.freeze({ intent, result });
}
export async function publishCurrentPcbViaPreopeningRelinquishment(token: CurrentPcbViaPreopeningHistoricalSnapshot, name: "intent.json" | "relinquished.json", input: Intent | Result): Promise<void> {
  const original = requireCurrentPcbViaPreopeningHistoricalSnapshot(token);
  const record = (name === "intent.json" ? currentPcbViaPreopeningRelinquishmentIntentSchema : currentPcbViaPreopeningRelinquishmentResultSchema).parse(input); need(matches(record, original));
  await assertCurrentPcbViaPreopeningHistoricalSnapshot(token);
  await publishManagedAttachmentExclusive(currentPcbViaPreopeningRelinquishmentPath(original.operationId, name), "Historical failed Via pre-opening relinquishment", Buffer.from(`${JSON.stringify(record)}\n`), "pcb-via-preopening-relinquishment.v1", () => assertCurrentPcbViaPreopeningHistoricalSnapshot(token));
  await assertCurrentPcbViaPreopeningHistoricalSnapshot(token);
}
/** Historical acceptance clears only this fixed prefix's quarantine. It can
 * never issue native authority or change the original operation's result. */
export async function inspectCurrentPcbViaPreopeningRelinquishment(operationId: string, expected: Readonly<{ entireStoredJournalSha256: string; storedJournalSha256: string }>): Promise<true | undefined> {
  if (await optional(operationId, "intent.json") === null) { need(await optional(operationId, "relinquished.json") === null); return undefined; }
  const snapshot = await readCurrentPcbViaPreopeningHistoricalSnapshot(operationId); const original = requireCurrentPcbViaPreopeningHistoricalSnapshot(snapshot);
  need(original.originalEntireJournalSha256 === expected.entireStoredJournalSha256 && original.originalStoredJournalSha256 === expected.storedJournalSha256);
  const receipt = await readCurrentPcbViaPreopeningRelinquishment(snapshot); return receipt?.result === null || receipt === null ? undefined : true;
}
