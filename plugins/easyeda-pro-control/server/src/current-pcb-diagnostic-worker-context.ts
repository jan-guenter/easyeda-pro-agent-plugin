/** Direct-child worker observation, not renderer/compiler ownership.
 * Chromium146 reports existing workers only after their parent requests child
 * reporting. The parent-session attachment event is the relationship evidence;
 * TargetInfo URLs, names and caller-supplied IDs cannot create that relationship.
 */
import { createHash } from "node:crypto";
import { diagnosticBoundedObservation, diagnosticTargetInventory } from "./current-pcb-diagnostic-context.ts";
import { diagnosticExact, diagnosticRecord, diagnosticToken } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256, decodeCurrentPcbDiagnosticWorkerReply } from "./current-pcb-diagnostic-worker-program.ts";

type Row = Readonly<Record<string, unknown>>;
export interface DiagnosticWorkerScriptProfile {
  readonly relativePath: string; readonly scriptSha256: string; readonly scriptBytes: number;
}
export const CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT: DiagnosticWorkerScriptProfile = Object.freeze({
  relativePath: "pro-mgr/3.2.184.355087e9/js/project-worker.js", scriptBytes: 2_181_284,
  scriptSha256: "b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928",
});
interface Child { readonly sessionId: string; readonly target: Row }
interface Selected extends Child { readonly context: Row; readonly script: Row }
const claims = Object.freeze({ projectWorkerAssociationVerified: false, compilerOwnerVerified: false,
  queueCompletionVerified: false, executionAuthorized: false, continuousObservation: false });
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_WORKER_IDENTITY"); }
function text(value: unknown, maximum = 8192): value is string {
  return typeof value === "string" && value.length <= maximum && value.isWellFormed() && !value.includes("\0");
}
function positive(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value > 0; }
function equal(left: unknown, right: unknown): boolean { return JSON.stringify(left) === JSON.stringify(right); }
function copy(value: Row): Row { return Object.freeze(structuredClone(value)); }
function sourceUrl(value: unknown, profile: DiagnosticWorkerScriptProfile): boolean {
  if (!text(value) || value.includes("\\") || /[\s?#@]/u.test(value) ||
      !/^[A-Za-z][A-Za-z\d+.-]*:\/\//u.test(value) || /\/(?:\.|\.\.)(?:\/|$)/u.test(value)) { return false; }
  try {
    const url = new URL(value);
    return url.username === "" && url.password === "" && url.search === "" && url.hash === "" &&
      url.pathname.endsWith(`/${profile.relativePath}`);
  } catch { return false; }
}

export class CurrentPcbDiagnosticWorkerContext {
  readonly #parentTargetId: string;
  readonly #parentSessionId: string;
  readonly #profile: DiagnosticWorkerScriptProfile;
  readonly #children = new Map<string, Child>();
  readonly #contexts = new Map<number, Row>();
  readonly #scripts = new Map<string, Row>();
  readonly #eventKinds = new Set<string>();
  #parent: Row | null = null;
  #selected: Child | null = null;
  #admitted: Selected | null = null;
  #inventorySealed = false;
  #failed = false;
  #eventCount = 0;

  /** Optional profile is an offline comparison seam. The public owner must use
   * the default compiled profile, never caller URL/hash/size expectations. */
  public constructor(parentTargetId: string, parentSessionId: string,
    profile: DiagnosticWorkerScriptProfile = CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT) {
    if (!diagnosticToken(parentTargetId) || !diagnosticToken(parentSessionId) ||
        !diagnosticExact(profile, ["relativePath", "scriptSha256", "scriptBytes"]) ||
        !/^[A-Za-z\d_.-]+(?:\/[A-Za-z\d_.-]+)+\.js$/u.test(profile.relativePath) ||
        profile.relativePath.length > 512 || profile.relativePath.split("/").some(part => part === "." || part === "..") ||
        !/^[a-f\d]{64}$/u.test(profile.scriptSha256) || !positive(profile.scriptBytes) || profile.scriptBytes > 4 * 1024 * 1024) { refuse(); }
    this.#parentTargetId = parentTargetId; this.#parentSessionId = parentSessionId; this.#profile = Object.freeze({ ...profile });
  }
  public observeEvent(event: DiagnosticEvent): void {
    try { this.#acceptEvent(event); } catch { this.#failed = true; throw new Error("PCB_DIAGNOSTIC_WORKER_INVALIDATED"); }
  }
  #acceptEvent(event: DiagnosticEvent): void {
    this.assertCurrent();
    if (this.#eventCount >= 4096) { this.#refuse(); }
    this.#eventCount += 1; this.#eventKinds.add(event.method);
    const params = event.params;
    if (event.sessionId === this.#parentSessionId) {
      if (event.method !== "Target.attachedToTarget" || this.#inventorySealed ||
          !diagnosticExact(params, ["sessionId", "targetInfo", "waitingForDebugger"]) ||
          !diagnosticToken(params["sessionId"]) || params["sessionId"] === this.#parentSessionId ||
          params["waitingForDebugger"] !== false || !diagnosticRecord(params["targetInfo"])) { this.#refuse(); }
      const sessionId = params["sessionId"], target = params["targetInfo"];
      if (target["type"] !== "worker" || target["attached"] !== true || !diagnosticToken(target["targetId"]) ||
          target["targetId"] === this.#parentTargetId || !text(target["url"]) || !text(target["title"]) ||
          this.#children.size >= 16 || this.#children.has(target["targetId"]) ||
          [...this.#children.values()].some(child => child.sessionId === sessionId)) { this.#refuse(); }
      this.#children.set(target["targetId"], Object.freeze({ sessionId, target: copy(target) })); return;
    }
    const selected = this.#selected;
    if (selected === null || event.sessionId !== selected.sessionId) { this.#refuse(); }
    if (event.method === "Runtime.executionContextCreated") {
      const context = params["context"];
      // The146 worker producer supplies name+full bootstrap URL and no auxData.
      // Reusing a page's frame/default-world rules would reject every worker.
      if (!diagnosticExact(params, ["context"]) || !diagnosticRecord(context) ||
          !diagnosticExact(context, ["id", "origin", "name", "uniqueId"]) || !positive(context["id"]) ||
          !diagnosticToken(context["uniqueId"]) || context["origin"] !== selected.target["url"] ||
          context["name"] !== selected.target["title"] || this.#contexts.size > 0) { this.#refuse(); }
      this.#contexts.set(context["id"], copy(context)); return;
    }
    if (event.method === "Debugger.scriptParsed") {
      if (!diagnosticToken(params["scriptId"]) || !positive(params["executionContextId"]) ||
          !text(params["url"]) || this.#scripts.has(params["scriptId"]) || this.#scripts.size >= 4096) { this.#refuse(); }
      this.#scripts.set(params["scriptId"], copy(params));
      // Runtime.evaluate can report an anonymous script. It cannot replace or
      // Duplicate the source-admitted worker script/context.
      if (this.#admitted !== null) { this.#selectedScript(); }
      return;
    }
    if (["Runtime.consoleAPICalled", "Runtime.exceptionThrown", "Runtime.exceptionRevoked", "Runtime.inspectRequested"].includes(event.method)) { return; }
    // Context loss, worker/parent detach, navigation, pause and unknown events
    // All invalidate. There is no debugger resume or transport-close fallback.
    this.#refuse();
  }
  #targets(reply: Row): void {
    this.assertCurrent();
    try {
      const targets = diagnosticTargetInventory(reply);
      const parent = targets.find(row => row["targetId"] === this.#parentTargetId);
      if (parent?.["type"] !== "page" || parent["attached"] !== true || this.#parent !== null && !equal(this.#parent, parent)) { this.#refuse(); }
      this.#parent ??= copy(parent);
      for (const [targetId, child] of this.#children) {
        if (!equal(targets.find(row => row["targetId"] === targetId), child.target)) { this.#refuse(); }
      }
    } catch { this.#refuse(); }
  }
  /** Call only after the original autoattach ACK settles. Child events arriving
   * after this bounded sample invalidate it rather than silently expanding it. */
  public finishInventory(targetReply: Row): Row {
    this.#targets(targetReply);
    if (this.#inventorySealed) { return this.#refuse(); }
    this.#inventorySealed = true;
    return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-worker-inventory.v1",
      parentTargetId: this.#parentTargetId, parentSessionId: this.#parentSessionId,
      workers: [...this.#children].map(([targetId, child]) => ({ targetId, sessionId: child.sessionId, type: "worker" })),
      parentAttachmentObserved: true, completeWorkerInventoryVerified: false, ...claims });
  }
  public selectWorker(targetId: string): Readonly<{ sessionId: string }> {
    this.assertCurrent();
    const child = this.#children.get(targetId);
    if (!this.#inventorySealed || this.#selected !== null || child === undefined) { return this.#refuse(); }
    this.#selected = child;
    return Object.freeze({ sessionId: child.sessionId });
  }
  #selectedScript(): Selected {
    this.assertCurrent();
    const child = this.#selected, context = [...this.#contexts.values()][0];
    if (child === null || this.#contexts.size !== 1 || context === undefined) { return this.#refuse(); }
    const matching = [...this.#scripts.values()].filter(script => script["executionContextId"] === context["id"] &&
      sourceUrl(script["url"], this.#profile));
    const script = matching[0];
    if (matching.length !== 1 || script === undefined || script["hasSourceURL"] === true || script["isLiveEdit"] === true ||
        script["scriptLanguage"] !== undefined && script["scriptLanguage"] !== "JavaScript") { return this.#refuse(); }
    const selected = { ...child, context, script };
    if (this.#admitted !== null && !equal(this.#admitted, selected)) { return this.#refuse(); }
    return selected;
  }
  public script(): Readonly<{ scriptId: string }> {
    const selected = this.#selectedScript();
    if (!diagnosticToken(selected.script["scriptId"])) { return this.#refuse(); }
    return Object.freeze({ scriptId: selected.script["scriptId"] });
  }
  public finishSource(source: Row, targetReply: Row): Row {
    this.#targets(targetReply);
    if (this.#admitted !== null) { return this.#refuse(); }
    const selected = this.#selectedScript(), value = source["scriptSource"];
    if (!diagnosticExact(source, ["scriptSource"]) || typeof value !== "string" || !value.isWellFormed() ||
        Buffer.byteLength(value, "utf8") !== this.#profile.scriptBytes ||
        createHash("sha256").update(value, "utf8").digest("hex") !== this.#profile.scriptSha256) { return this.#refuse(); }
    this.#admitted = selected;
    return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-worker-source.v1", ...this.#identity(),
      relativePath: this.#profile.relativePath, sourceSha256: this.#profile.scriptSha256, sourceBytes: this.#profile.scriptBytes,
      sourceVerified: true, ...claims });
  }
  public evaluationContext(): string {
    if (this.#admitted === null) { return this.#refuse(); }
    const selected = this.#selectedScript(), uniqueId = selected.context["uniqueId"];
    if (!diagnosticToken(uniqueId)) { return this.#refuse(); }
    return uniqueId;
  }
  public observeTargets(reply: Row): void { this.#targets(reply); }
  public finishState(reply: unknown, targetReply: Row): Row {
    this.evaluationContext(); this.#targets(targetReply);
    try {
      const state = decodeCurrentPcbDiagnosticWorkerReply(reply);
      if (this.#selected?.target["title"] !== `project_${state.identity.projectUuid}_${state.identity.windowTabId}`) { this.#refuse(); }
      return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-worker-observation.v1", ...this.#identity(),
        expressionSha256: CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256, state,
        eventCount: this.#eventCount, eventKinds: [...this.#eventKinds].toSorted(), sourceVerified: true, ...claims });
    } catch { return this.#refuse(); }
  }
  #identity(): Row {
    const selected = this.#selectedScript();
    return { parentTargetId: this.#parentTargetId, parentSessionId: this.#parentSessionId,
      targetId: selected.target["targetId"], sessionId: selected.sessionId,
      contextId: selected.context["id"], uniqueContextId: selected.context["uniqueId"], scriptId: selected.script["scriptId"] };
  }
  public assertCurrent(): void { if (this.#failed) { this.#refuse(); } }
  #refuse(): never { this.#failed = true; return refuse(); }
}
