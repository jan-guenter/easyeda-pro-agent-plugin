/** Bounded cold-load data comparison only. Matching JSON never issues a
 * worker, continuation, native-load or saved/reopened authority. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbViaSavedLoadData } from "./current-pcb-via-saved-load-capture.ts";
import type { GeneratedSchematicRelevanceSavedLoadData } from "./generated-schematic-relevance-saved-load-plan.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "./current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";
import { deriveCurrentSchematicRelevanceSavedColdMetadata } from "./current-schematic-relevance-saved-cold-metadata.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_SAVED_COLD_PROGRESS"); } }
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function object(value: unknown): Record<string, unknown> { need(record(value)); return value; }
const projectSchema = z.strictObject({ uuid: z.string(), branchUuid: z.string().nullable(), isOpening: z.boolean(), isReady: z.boolean(), cacheName: z.string().optional(), localCacheName: z.string().optional() });
const fetchSchema = z.strictObject({ history: z.record(z.string(), z.unknown()), url: z.string().max(8192), snapshot: z.literal(true), debugUndefined: z.literal(false),
  bytes: z.array(z.number().int().min(0).max(255)).min(1).max(8192).optional(), plaintext: z.string().max(16_384).optional() });
function exact(value: Record<string, unknown>, names: readonly string[]): void { need(Reflect.ownKeys(value).length === names.length && names.every(name => Object.hasOwn(value, name))); }
function partialHistory(actual: Record<string, unknown>, expected: Readonly<Record<string, string | number | null>>, final: Readonly<Record<string, unknown>>): void {
  for (const key of Object.keys(actual)) { need(Object.hasOwn(expected, key) || ["editHead", "docs", "docIds"].includes(key)); }
  const base = Object.fromEntries(Object.keys(expected).map(key => { need(Object.hasOwn(actual, key)); return [key, actual[key]]; })); need(canonicalJson(base) === canonicalJson(expected));
  for (const key of ["editHead", "docs", "docIds"].filter(name => Object.hasOwn(actual, name))) {
    const all = final[key], value = actual[key]; need(Array.isArray(value) && Array.isArray(all) && value.length <= all.length);
    for (const [index, item] of value.entries()) { if (!(record(item) && Reflect.ownKeys(item).length === 1 && item["schema"] === "private.saved-load-hole.v1")) { need(canonicalJson(item) === canonicalJson(all[index])); } }
  }
}
export class CurrentSchematicRelevanceSavedColdProgress {
  readonly #data: GeneratedSchematicRelevanceSavedLoadData; readonly #histories: readonly Readonly<Record<string, unknown>>[];
  readonly #chunks = new Map<string, number>(); readonly #counts = new Map<CurrentPcbViaSavedLoadRole, number>();
  #stage: "branch" | "cold" | "histories" | "fetches" | "ready" | "complete" = "branch"; #failed = false;
  public constructor(data: GeneratedSchematicRelevanceSavedLoadData) { this.#data = data; need(data.chunks.length === 2 && data.histories.length > 0 && data.histories.length <= 2); this.#histories = deriveCurrentSchematicRelevanceSavedColdMetadata(data); Object.freeze(this); }
  #project(input: unknown, role: CurrentPcbViaSavedLoadRole): void {
    const d = this.#data, value = projectSchema.parse(input);
    need(value.uuid === d.projectUuid && (role === "branch" ? value.branchUuid === null : value.branchUuid === d.branchUuid) && value.isOpening === (role !== "ready") && value.isReady === (role === "ready"));
    if (role === "branch") { need(value.cacheName === undefined && value.localCacheName === undefined); }
    else { need(value.cacheName === `project_${d.projectUuid}_v6` && value.localCacheName === `localProject_${d.projectUuid}_v1`); }
  }
  public accept(role: CurrentPcbViaSavedLoadRole, input: unknown): void {
    need(!this.#failed);
    try {
      const count = (this.#counts.get(role) ?? 0) + 1; need(count <= SITES[role].count); this.#counts.set(role, count);
      const reply = object(captureCurrentPcbViaSavedLoadData(input)); exact(reply, ["result"]); const remote = object(reply["result"]); exact(remote, ["type", "value"]); need(remote["type"] === "object"); const value = object(remote["value"]);
      if (role === "branch") { need(this.#stage === "branch"); exact(value, ["project", "branchUuid", "historyUuid"]); this.#project(value["project"], role); need(value["branchUuid"] === this.#data.branchUuid && value["historyUuid"] === this.#data.headHistoryUuid); this.#stage = "cold"; return; }
      if (role === "cold") { need(this.#stage === "cold"); exact(value, ["project", "emptyLocalIndex"]); this.#project(value["project"], role); need(value["emptyLocalIndex"] === true); this.#stage = "histories"; return; }
      if (role === "histories" || role === "parsed") {
        need(this.#stage === (role === "histories" ? "histories" : "fetches")); exact(value, ["project", "historyUuid", "histories"]); this.#project(value["project"], role); need(value["historyUuid"] === this.#data.headHistoryUuid);
        if (role === "histories") { need(canonicalJson(value["histories"]) === canonicalJson(this.#data.histories)); this.#stage = "fetches"; }
        else { need(this.#chunks.size === 2 && [...this.#chunks.values()].every(stage => stage === 4) && canonicalJson(value["histories"]) === canonicalJson(this.#histories)); this.#stage = "ready"; } return;
      }
      if (role === "ready") { need(this.#stage === "ready"); exact(value, ["project", "histories"]); this.#project(value["project"], role); need(canonicalJson(value["histories"]) === canonicalJson(this.#histories)); this.#stage = "complete"; return; }
      need(this.#stage === "fetches"); const fetched = fetchSchema.parse(value); const chunk = this.#data.chunks.find(item => item.fetchUrl === fetched.url); need(chunk !== undefined);
      const final = this.#histories.find(item => item["uuid"] === chunk.historyUuid), history = this.#data.histories.find(item => item["uuid"] === chunk.historyUuid); need(history !== undefined && final !== undefined); partialHistory(fetched.history, history, final);
      const stage = ({ fetchEntry: 1, response: 2, bytes: 3, plaintext: 4 } as Partial<Record<CurrentPcbViaSavedLoadRole, number>>)[role] ?? 0;
      need(stage > 0 && (this.#chunks.get(chunk.dataUuid) ?? 0) === stage - 1);
      if (stage < 3) { need(fetched.bytes === undefined && fetched.plaintext === undefined); }
      else { need(fetched.bytes !== undefined); const bytes = Buffer.from(fetched.bytes); need(bytes.toString("base64") === chunk.dataBase64 && createHash("sha256").update(bytes).digest("hex") === chunk.cipherSha256);
        need(stage === 3 ? fetched.plaintext === undefined : fetched.plaintext === chunk.plaintext); }
      this.#chunks.set(chunk.dataUuid, stage);
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  public status(): Readonly<{ failed: boolean; complete: boolean; comparedNativeBodies: number; nativeOwnershipVerified: false; reopenedVerified: false }> {
    return Object.freeze({ failed: this.#failed, complete: this.#stage === "complete", comparedNativeBodies: [...this.#chunks.values()].filter(stage => stage === 4).length, nativeOwnershipVerified: false, reopenedVerified: false });
  }
}
