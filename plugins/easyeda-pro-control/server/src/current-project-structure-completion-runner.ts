/** Incremental comparison of a supplied structure-operation transcript.
 * The comparison accounts for native-shaped queue/finalizer relations, not
 * original events. In particular, completing this model issues no live lease.
 * The original construction owner still has no structure event transport. */
import { createHash } from "node:crypto";
import { validateCurrentProjectStructureCompletionEvent, validateCurrentProjectStructureCompletionPlan } from "./current-project-structure-completion-protocol.ts";
import type { CurrentProjectStructureCompletionEvent as Event, CurrentProjectStructureCompletionPlan as Plan } from "./current-project-structure-completion-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Kind = "uploadStructure" | "structure";
interface Slot {
  readonly kind: Kind;
  readonly promiseId: string;
  argumentsId: string;
  runId: string | null;
  dependency: string | null;
  enteredAt: number | null;
  finalized: boolean;
  settled: boolean;
}
interface Serial { current: Slot | null; queued: Slot | null }
interface Publication { readonly callbackId: string; readonly taskId: string; readonly packetId: string; readonly runId: string;
  requestId: string | null; responseId: string | null; step: number }
function need(value: boolean, code: string): asserts value {
  if (!value) { throw new Error(`PROJECT_STRUCTURE_COMPLETION_${code}`); }
}
function sameSelectedRows(left: Plan["rows"], right: Extract<Event, { stage: "main-select" }>["rows"]): boolean {
  if (left.length !== right.length) { return false; }
  const projected = left.map(row => JSON.stringify([row.ticket, row.structureText])).toSorted();
  const observed = right.map(row => JSON.stringify([row.ticket, row.structureText])).toSorted();
  return projected.every((row, index) => row === observed[index]);
}
export class CurrentProjectStructureCompletionModel {
  readonly #plan: Plan;
  readonly #serial: Record<Kind, Serial> = { uploadStructure: { current: null, queued: null }, structure: { current: null, queued: null } };
  readonly #promises = new Map<string, Slot>();
  readonly #calls = new Map<string, Readonly<{ slot: Slot; sequence: number }>>();
  readonly #dependencies = new Set<string>();
  readonly #runs = new Map<string, Slot>();
  readonly #hash = createHash("sha256");
  #publication: Publication | null = null;
  #boundaries = 0;
  #events = 0;
  #failed = false;
  #finished = false;
  public constructor(input: unknown) {
    this.#plan = validateCurrentProjectStructureCompletionPlan(input);
    const ids = new Set<number>(), plan = this.#plan;
    for (const row of plan.rows) {
      need(!ids.has(row.id), "DUPLICATE_ROW"); ids.add(row.id);
      need(row.projectUuid === plan.scope.projectUuid && row.branchUuid === plan.scope.branchUuid &&
        row.ticket < plan.ticket && row.structureText === plan.beforeStructureText, "LOWER_TICKET_BASELINE");
    }
  }
  #idle(): boolean {
    return Object.values(this.#serial).every(serial => serial.current === null && serial.queued === null) &&
      [...this.#promises.values()].every(slot => slot.finalized && slot.settled);
  }
  #run(kind: Kind, runId: string): Slot {
    const slot = this.#runs.get(runId);
    need(slot !== undefined && slot.kind === kind && this.#serial[kind].current === slot && !slot.finalized, "ORIGINAL_RUN"); return slot;
  }
  #request(event: Extract<Event, { requestId: string }>, step: number): Publication {
    const publication = this.#publication;
    need(publication !== null && publication.requestId === event.requestId && publication.step === step, "REQUEST_ORDER"); return publication;
  }
  #accept(event: Event): void {
    const plan = this.#plan;
    if (event.stage === "boundary") {
      need(JSON.stringify(event.scope) === JSON.stringify(plan.scope), "SCOPE_CHANGED");
      need(this.#boundaries < 2 && this.#idle(), "PENDING_WORK");
      if (this.#boundaries === 1) { need(this.#publication?.step === 9 && this.#runs.size >= 2, "MISSING_CHAIN"); }
      this.#boundaries += 1; return;
    }
    need(this.#boundaries === 1, "OBSERVATION_INTERVAL");
    if (event.stage === "serial-call") {
      need(this.#calls.size < 32 && !this.#calls.has(event.callId), "CALL_ID");
      const serial = this.#serial[event.kind]; let slot: Slot;
      if (event.disposition === "coalesce") {
        need(serial.current !== null && serial.queued !== null && serial.queued.promiseId === event.promiseId, "COALESCED_PROMISE"); slot = serial.queued;
        slot.argumentsId = event.argumentsId;
      } else {
        need(!this.#promises.has(event.promiseId), "PROMISE_ID");
        slot = { kind: event.kind, promiseId: event.promiseId, argumentsId: event.argumentsId, runId: null, dependency: null, enteredAt: null, finalized: false, settled: false };
        if (event.disposition === "start") { need(serial.current === null && serial.queued === null, "PREEXISTING_RUN"); serial.current = slot; }
        else { need(serial.current !== null && serial.queued === null, "QUEUE_STATE"); serial.queued = slot; }
        this.#promises.set(slot.promiseId, slot);
      }
      this.#calls.set(event.callId, { slot, sequence: this.#events }); return;
    }
    if (event.stage === "serial-enter") {
      const serial = this.#serial[event.kind];
      if (serial.current === null && serial.queued !== null) { serial.current = serial.queued; serial.queued = null; }
      const slot = serial.current;
      need(slot !== null && slot.runId === null && slot.promiseId === event.promiseId && slot.argumentsId === event.argumentsId &&
        !this.#runs.has(event.runId), "RUN_ENTRY"); slot.runId = event.runId; slot.enteredAt = this.#events; this.#runs.set(event.runId, slot); return;
    }
    if (event.stage === "upload-return") {
      const dependency = this.#calls.get(event.structureCallId), slot = this.#run("uploadStructure", event.runId);
      need(slot.dependency === null && slot.enteredAt !== null && dependency?.slot.kind === "structure" &&
        dependency.sequence > slot.enteredAt && !this.#dependencies.has(event.structureCallId), "UPLOAD_DEPENDENCY");
      this.#dependencies.add(event.structureCallId); slot.dependency = dependency.slot.promiseId; return;
    }
    if (event.stage === "callback-enter") {
      this.#run("structure", event.runId);
      need(this.#publication === null && event.ticket === plan.ticket && event.structureText === plan.structureText, "EXTRA_OR_CHANGED_PUBLICATION");
      this.#publication = { callbackId: event.callbackId, taskId: event.taskId, packetId: event.packetId, runId: event.runId,
        requestId: null, responseId: null, step: 0 }; return;
    }
    if (event.stage === "post") {
      const publication = this.#publication;
      need(publication !== null && publication.step === 0 && publication.callbackId === event.callbackId && publication.packetId === event.packetId &&
        event.projectUuid === plan.scope.projectUuid && event.branchUuid === plan.scope.branchUuid && event.path === plan.scope.path &&
        event.url === `/api/v4/projects/${plan.scope.projectUuid}/branches/${plan.scope.branchUuid}/structures` &&
        event.ticket === plan.ticket && event.structureText === plan.structureText, "POST_JOIN");
      publication.requestId = event.requestId; publication.step = 1; return;
    }
    if (event.stage === "main-select") {
      const publication = this.#request(event, 1);
      need(event.connectionObjectId === plan.scope.connectionObjectId && event.projectPath === plan.scope.projectPath && sameSelectedRows(plan.rows, event.rows) &&
        plan.rows.some(row => row.ticket === event.selectedTicket && row.structureText === event.selectedStructureText), "SELECT_JOIN"); publication.step = 2; return;
    }
    if (event.stage === "main-update") {
      const publication = this.#request(event, 2);
      need(event.connectionObjectId === plan.scope.connectionObjectId && event.branchUuid === plan.scope.branchUuid &&
        event.ticket === plan.ticket && event.structureText === plan.structureText, "UPDATE_JOIN"); publication.step = 3; return;
    }
    if (event.stage === "main-update-return") { this.#request(event, 3).step = 4; return; }
    if (event.stage === "main-service-return") { this.#request(event, 4).step = 5; return; }
    if (event.stage === "main-controller-return") {
      const publication = this.#request(event, 5); publication.responseId = event.responseId; publication.step = 6; return;
    }
    if (event.stage === "post-return") {
      const publication = this.#request(event, 6);
      need(publication.callbackId === event.callbackId && publication.responseId === event.responseId, "RESPONSE_JOIN"); publication.step = 7; return;
    }
    if (event.stage === "callback-return") {
      const publication = this.#publication;
      need(publication?.step === 7 && publication.callbackId === event.callbackId && publication.taskId === event.taskId, "CALLBACK_RETURN");
      publication.step = 8; return;
    }
    if (event.stage === "serial-finally") {
      const slot = this.#run(event.kind, event.runId);
      need(slot.promiseId === event.promiseId, "FINALIZER_PROMISE");
      if (event.kind === "structure") {
        const publication = this.#publication;
        need(publication?.step === 8 && publication.runId === event.runId, "CALLBACK_PENDING"); publication.step = 9;
      } else {
        need(slot.dependency !== null && this.#promises.get(slot.dependency)?.finalized === true, "DEPENDENCY_PENDING");
      }
      slot.finalized = true; this.#serial[event.kind].current = null; return;
    }
    need(event.stage === "promise-settled", "UNKNOWN_EVENT");
    const slot = this.#promises.get(event.promiseId);
    need(slot !== undefined && slot.kind === event.kind && slot.finalized && !slot.settled, "PROMISE_SETTLEMENT"); slot.settled = true;
  }
  /** Synchronous, once-only event admission. Any missing/contradictory event
   * poisons this comparison; a later duplicate cannot repair its conclusion. */
  public accept(input: unknown): void {
    need(!this.#failed && !this.#finished, "CONSUMED");
    try {
      need(this.#events < 256 && this.#boundaries < 2, "EVENT_BOUND");
      const event = validateCurrentProjectStructureCompletionEvent(input); this.#accept(event);
      this.#hash.update(JSON.stringify(event)); this.#hash.update("\n"); this.#events += 1;
    } catch (error) { this.#failed = true; throw error; }
  }
  public finish(): Readonly<{ profile: "private.current-project-structure-completion-comparison.v1";
    suppliedTranscriptConsistent: true; transcriptSha256: string; events: number; calls: number; runs: number;
    originalEventProvenanceVerified: false; nativeQueueCompletionGranted: false; completeSqlEffectVerified: false;
    independentClosedSqlVerified: false; savedResultVerified: false; executionAuthorized: false }> {
    need(!this.#failed && !this.#finished, "CONSUMED"); this.#finished = true;
    need(this.#boundaries === 2 && this.#idle() && this.#publication?.step === 9 &&
      [...this.#runs.values()].some(slot => slot.kind === "uploadStructure") &&
      [...this.#promises.values()].filter(slot => slot.kind === "structure").every(slot =>
        [...this.#runs.values()].some(upload => upload.kind === "uploadStructure" && upload.dependency === slot.promiseId)), "INCOMPLETE");
    return freezeDeep({ profile: "private.current-project-structure-completion-comparison.v1", suppliedTranscriptConsistent: true,
      transcriptSha256: this.#hash.digest("hex"), events: this.#events, calls: this.#calls.size, runs: this.#runs.size,
      originalEventProvenanceVerified: false, nativeQueueCompletionGranted: false, completeSqlEffectVerified: false,
      independentClosedSqlVerified: false, savedResultVerified: false, executionAuthorized: false });
  }
}
