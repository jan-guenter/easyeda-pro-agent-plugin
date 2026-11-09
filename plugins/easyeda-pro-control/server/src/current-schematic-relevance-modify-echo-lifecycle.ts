/* oxlint-disable import/max-dependencies -- The original UI/worker controls, native Event, passive sender, exact CM deletion and old publisher proof remain independent prerequisites. */
/** Continue the two original retained streams through Canvas delivery and
 * matching UI Echo suppression. The original owner supplies all transport,
 * event, registration and exit custody; no receipt here authorizes Save. */
import { types } from "node:util";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CurrentSchematicRelevanceModifyEchoControlController as Controls, assertOriginalCurrentSchematicRelevanceModifyEchoControlController as originalControl } from "./current-schematic-relevance-modify-echo-control-controller.ts";
import type { CurrentSchematicRelevanceModifyEchoControlHost as ControlHost, CurrentSchematicRelevanceModifyEchoControlHeld as Held } from "./current-schematic-relevance-modify-echo-control-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES as UI, validateCurrentSchematicRelevanceModifyEchoControlCommand as control } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import { collectCurrentSchematicRelevanceModifyEcho } from "./current-schematic-relevance-modify-echo-collector.ts";
import { collectCurrentSchematicRelevanceModifyEchoEvent as actualEvent, collectCurrentSchematicRelevanceModifyEchoReceiver as receiver } from "./current-schematic-relevance-modify-echo-event-collector.ts";
import type { CurrentSchematicRelevanceModifyEchoEventPrepared, CurrentSchematicRelevanceModifyEchoReceiverPrepared } from "./current-schematic-relevance-modify-echo-event-collector.ts";
import { collectCurrentSchematicRelevanceModifyEchoCompletionBefore as cmBefore, collectCurrentSchematicRelevanceModifyEchoCompletionHeld as cmHeld } from "./current-schematic-relevance-modify-echo-completion-collector.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyEchoCompletionCommand as passive } from "./current-schematic-relevance-modify-echo-completion-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoContinuationCommand as Command } from "./current-schematic-relevance-modify-echo-continuation-wire.ts";
import { reproveCurrentSchematicRelevancePublicationReturned as publisherUnchanged } from "./current-schematic-relevance-publication-body-collector.ts";
import type { CurrentSchematicRelevancePublicationCleared, CurrentSchematicRelevancePublicationBodyInputs as PublicationInput } from "./current-schematic-relevance-publication-body-collector.ts";
import type { CurrentSchematicRelevancePublicationController, CurrentSchematicRelevancePublicationOriginal } from "./current-schematic-relevance-publication-controller.ts";
import { assertOriginalCurrentSchematicRelevancePublicationController as originalPublication } from "./current-schematic-relevance-publication-controller.ts";
import { assertOriginalCurrentSchematicRelevanceModifyCanvasController as originalCanvas } from "./current-schematic-relevance-modify-canvas-controller.ts";
import type { CurrentSchematicRelevanceModifyCanvasController, CurrentSchematicRelevanceModifyCanvasHeld } from "./current-schematic-relevance-modify-canvas-controller.ts";
import { validateCurrentSchematicRelevanceModifyCanvasControlCommand as canvasControl } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import { collectCurrentSchematicRelevanceModifyCanvasSendLoopback as loopback, collectCurrentSchematicRelevanceModifyCanvasSendBefore as sendBefore, collectCurrentSchematicRelevanceModifyCanvasSendPost as sendPost, collectCurrentSchematicRelevanceModifyCanvasSendPublish as sendPublish, collectCurrentSchematicRelevanceModifyCanvasSendTimerReturned as timerReturned } from "./current-schematic-relevance-modify-canvas-send-collector.ts";
import type { CurrentSchematicRelevanceModifyCanvasSendInputs as WorkerInput } from "./current-schematic-relevance-modify-canvas-send-collector.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { requireCurrentSchematicRelevanceConsistencyCalleeDescription as cmDescription, decodeCurrentSchematicRelevanceConsistencyCalleeFunction as cmMetadata } from "./current-schematic-relevance-consistency-callee-replies.ts";

export interface CurrentSchematicRelevanceModifyEchoLifecycleBindings {
  readonly publication: PublicationInput; readonly returned: CurrentSchematicRelevancePublicationCleared; readonly workerInput: WorkerInput;
  readonly publicationLane: CurrentSchematicRelevancePublicationController; readonly publicationHeld: CurrentSchematicRelevancePublicationOriginal; readonly canvasLane: CurrentSchematicRelevanceModifyCanvasController;
  readonly uiSession: string; readonly uiScript: string; readonly variant: 0 | 1; readonly workerSession: string; readonly workerScript: string;
  readonly current: () => void; readonly fail: () => void; readonly control: (phase: string) => Promise<void>;
  readonly uiRequest: (command: Command) => Promise<unknown>; readonly workerRequest: (command: Command) => Promise<unknown>;
  /** Execute this marker only inside the original transfer callback, after
   * the owner has completed every asynchronous identity reproof. */
  readonly uiTransfer: (command: Command, mark: () => void) => Promise<unknown>; readonly workerTransfer: (command: Command, mark: () => void) => Promise<unknown>;
  readonly registerWorker: ControlHost["register"]; readonly retireWorker: ControlHost["retire"]; readonly reserveWorker: ControlHost["reserveOriginalResume"];
  readonly nextWorkerEvent: () => Promise<DiagnosticEvent>; readonly retainWorkerTask: (task: Promise<void>) => void;
  readonly installUiControls: (controls: Controls) => void; readonly assertOriginalUiEvent: (event: DiagnosticEvent) => void;
  readonly beginOriginalPublicationTransfer: () => void;
  readonly retireOriginalRemote: (functionObjectId: string) => Promise<void>;
  readonly uiForeignBreakpointIds: () => readonly string[];
}
export interface CurrentSchematicRelevanceModifyEchoCompleted {
  readonly event: CurrentSchematicRelevanceModifyEchoEventPrepared; readonly receiver: CurrentSchematicRelevanceModifyEchoReceiverPrepared;
  readonly originalCanvasTimerResumesConsumed: 2; readonly originalWorkerEchoResumesConsumed: 5; readonly originalUiEchoResumesConsumed: 12;
  readonly originalPublicationTerminalConsumed: true; readonly originalCanvasPromiseFulfilled: true; readonly originalUiTaskPromiseFulfilled: true;
  readonly matchingTemporaryEntryDeleted: true; readonly originalTextSerialCompleted: true; readonly sdkCompletionReleased: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_ORIGINAL_ECHO_LIFECYCLE"); } }

/** One original continuation attempt. Pending work is retained for the same
 * owner's exit settlement; a duplicate attempt cannot create another pump. */
export class CurrentSchematicRelevanceModifyEchoLifecycle {
  readonly #b: CurrentSchematicRelevanceModifyEchoLifecycleBindings; readonly #workerEvents = new WeakSet<DiagnosticEvent>();
  #ui: Controls | null = null; #worker: Controls | null = null; #pending: Promise<CurrentSchematicRelevanceModifyEchoCompleted> | null = null; #failed = false; #completed: CurrentSchematicRelevanceModifyEchoCompleted | null = null;
  /** These bindings remain private in the original Core closure. Construction
   * supplies no accepted event, native acknowledgement or body permission. */
  public constructor(bindings: CurrentSchematicRelevanceModifyEchoLifecycleBindings) { this.#b = Object.freeze({ ...bindings }); originals.add(this); }
  /** Reprove the original streams and immutable controller methods around
   * every await. Historical partial data cannot replace current custody. */
  public assertCurrent(): void { this.#b.current(); need(!this.#failed); originalPublication(this.#b.publicationLane); originalCanvas(this.#b.canvasLane); if (this.#ui !== null) { originalControl(this.#ui); } if (this.#worker !== null) { originalControl(this.#worker); } }
  /** Spend the only start synchronously and return the same retained Promise. */
  public start(): Promise<CurrentSchematicRelevanceModifyEchoCompleted> { if (this.#pending !== null) { this.assertCurrent(); return this.#pending; } const pending = Promise.withResolvers<CurrentSchematicRelevanceModifyEchoCompleted>(); this.#pending = pending.promise; void (async (): Promise<void> => { try { pending.resolve(await this.#run()); } catch (caughtError) { this.fail(); pending.reject(caughtError); } })(); return pending.promise; }
  /** Use one fixed passive call and retain its actual complete property tuple. */
  async #methods(input: CurrentSchematicRelevanceModifyEchoReceiverPrepared): Promise<Readonly<{ remote: string; functions: ReturnType<typeof tuple> }>> {
    const b = this.#b, sdk = b.publication.sdk; const row = CALLS.find(value => value[0] === "methods"); need(row !== undefined); const command = passive({ phase: "modify-echo-completion-call", role: "methods", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: sdk.clone.nativeObjectId, functionDeclaration: row[1], arguments: [input.bindingsObjectId, input.qualifiedObjectId].map(objectId => ({ objectId })), returnByValue: false, awaitPromise: false, userGesture: false } });
    const props = (objectId: string): Promise<unknown> => b.uiRequest(passive({ phase: "modify-echo-completion-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
    this.assertCurrent(); const methods = capture(await b.uiRequest(command)); this.assertCurrent(); const values = tuple(await props(methods), 4); this.assertCurrent(); const remote = values[0]; need(remote?.type === "function" && typeof remote.description === "string"); cmDescription(remote.description, sdk.variant, "consistencyRemoteChange"); cmMetadata(await props(handle(remote)), sdk.variant, "consistencyRemoteChange", sdk.script); this.assertCurrent(); const functions = tuple(await props(input.functionsObjectId), 9); this.assertCurrent(); return { remote: handle(remote), functions };
  }
  /** A controller joins its original ACK/resumed/next-pause reservation. UI
   * expectation begins only at the actual worker native-post transfer. */
  async #resume(lane: Controls, held: Held, before?: () => void): Promise<Held | null> {
    this.assertCurrent(); lane.requireHeld(held); await this.#b.control(`proof-${held.role}`); this.assertCurrent(); lane.requireHeld(held); const reservation = lane.reserve(held); const command = control({ phase: "modify-echo-control-resume", role: held.role, method: "Debugger.resume", params: {} }); const submit = held.role.startsWith("worker") ? this.#b.workerTransfer : this.#b.uiTransfer;
    const raw = await submit(command, (): void => { this.assertCurrent(); lane.requireResume(reservation); before?.(); lane.markSubmitted(reservation); }); this.assertCurrent(); lane.acknowledge(reservation, raw); return lane.complete(reservation);
  }
  /** Let only the original Canvas controller spend each of its last two
   * reservations. The sender lane has independent source/event ownership. */
  async #canvasResume(held: CurrentSchematicRelevanceModifyCanvasHeld, before: () => void): Promise<CurrentSchematicRelevanceModifyCanvasHeld | null> {
    const lane = this.#b.canvasLane; this.assertCurrent(); lane.requireHeld(held); const reservation = lane.reserve(held); const command = canvasControl({ phase: "modify-canvas-control-resume", role: held.role, method: "Debugger.resume", params: {} });
    const raw = await this.#b.workerTransfer(command, (): void => { this.assertCurrent(); lane.requireResume(reservation); before?.(); lane.markSubmitted(reservation); }); this.assertCurrent(); lane.acknowledge(reservation, raw); await lane.waitResumed(reservation); this.assertCurrent(); if (reservation.target === null) { lane.completeReturned(reservation); return null; } return lane.complete(reservation);
  }
  /** Keep the original reader alive for exactly the five sender boundaries,
   * two old Canvas resumes and the old timer-return pause. */
  #pump(worker: Controls): Promise<void> {
    const task = (async (): Promise<void> => { try { for (let index = 0; index < 13; index += 1) { const event = await this.#b.nextWorkerEvent(); this.assertCurrent(); this.#workerEvents.add(event); need(worker.observe(event) || this.#b.canvasLane.observe(event)); } } catch (caughtError) { this.fail(); throw caughtError; } })(); this.#b.retainWorkerTask(task); return task;
  }
  /** Prepare both exact receivers before releasing the old UI loopback,
   * execute the original worker timer and join its native message to the
   * actual trusted UI Event before any selected page callback can run. */
  async #run(): Promise<CurrentSchematicRelevanceModifyEchoCompleted> {
    const b = this.#b; const uiHost = { current: (): void => { this.assertCurrent(); }, request: b.uiRequest }; const workerHost = { current: (): void => { this.assertCurrent(); }, request: b.workerRequest };
    this.assertCurrent(); b.publicationLane.requireHeld(b.publicationHeld); b.canvasLane.requireHeld(b.workerInput.held.held); await b.control("bind"); await publisherUnchanged(uiHost, b.publication, b.returned); this.assertCurrent();
    const echo = await collectCurrentSchematicRelevanceModifyEcho(uiHost, b.publication.sdk, b.publication.native); this.assertCurrent(); const selected = await receiver(uiHost, b.publication.sdk, b.publication.native, echo); this.assertCurrent(); const methods = await this.#methods(selected); const before = await sendBefore(workerHost, b.workerInput); this.assertCurrent(); await publisherUnchanged(uiHost, b.publication, b.returned); this.assertCurrent();
    const host = (realm: "ui" | "worker"): ControlHost => ({ current: (): void => { this.assertCurrent(); }, request: realm === "ui" ? b.uiRequest : b.workerRequest, assertOriginalEvent: realm === "ui" ? b.assertOriginalUiEvent : (event): void => { need(this.#workerEvents.has(event)); }, register: realm === "worker" ? b.registerWorker : (): void => { this.assertCurrent(); }, retire: realm === "worker" ? b.retireWorker : (): void => { this.assertCurrent(); }, reserveOriginalResume: realm === "worker" ? b.reserveWorker : (): void => { this.assertCurrent(); }, held: (): void => { this.assertCurrent(); }, resumed: (): void => { this.assertCurrent(); }, fail: (): void => { this.fail(); } });
    await b.retireOriginalRemote(methods.remote); this.assertCurrent();
    const ui = new Controls(host("ui"), "ui", b.uiSession, b.uiScript, b.variant, b.uiForeignBreakpointIds()), worker = new Controls(host("worker"), "worker", b.workerSession, b.workerScript, 0, []); this.#ui = ui; this.#worker = worker; b.installUiControls(ui);
    await ui.arm({ uiHandler: echo.handlerObjectId, uiExecute: handle(methods.functions[6]), uiCallback: handle(methods.functions[8]), uiPush: handle(methods.functions[2]), uiPublish: handle(methods.functions[3]), uiRemote: methods.remote }); this.assertCurrent();
    const workerFunctions = b.workerInput.held.canvas.before.functions;
    const postFunction = workerFunctions["JP.post"], publishFunction = workerFunctions["KP.publish"]; need(publishFunction !== undefined && postFunction !== undefined);
    await worker.arm({ workerPublish: publishFunction, workerPost: postFunction, workerLoopback: before.onMessageObjectId }); this.assertCurrent(); await b.control("prepared");
    await b.publicationLane.retireForOriginalEcho(b.publicationHeld, b.uiRequest); this.assertCurrent(); const terminal = b.publicationLane.reserveTerminalForOriginalEcho(b.publicationHeld);
    const released = await b.uiTransfer(control({ phase: "modify-echo-control-publication-resume", role: "publicationLoopbackReturned", method: "Debugger.resume", params: {} }), (): void => { this.assertCurrent(); b.beginOriginalPublicationTransfer(); b.publicationLane.markTerminalSubmitted(terminal); }); this.assertCurrent(); b.publicationLane.acknowledgeTerminal(terminal, released); await b.publicationLane.completeTerminal(terminal); this.assertCurrent(); b.publicationLane.requireCompleted(); await b.control("publication-idle");
    const pump = this.#pump(worker); await b.control("worker-timer-ready"); const timerBoundary = (async (): Promise<Readonly<{ok:true;held:CurrentSchematicRelevanceModifyCanvasHeld|null}>|Readonly<{ok:false;error:unknown}>> => {try{return {ok:true,held:await this.#canvasResume(b.workerInput.held.held, (): void => { worker.markExpected(); })};}catch(caughtError){return {ok:false,error:caughtError};}})(); b.retainWorkerTask((async():Promise<void>=>{await timerBoundary;})());
    const publish = await worker.wait("workerPublish"); this.assertCurrent(); const published = await sendPublish(workerHost, publish.callFrameId, b.workerInput, before); this.assertCurrent(); const post = await this.#resume(worker, publish); need(post?.role === "workerPost"); const posted = await sendPost(workerHost, post.callFrameId, b.workerInput, before, published); this.assertCurrent(); const returned = await this.#resume(worker, post, (): void => { ui.markExpected(); }); need(returned?.role === "workerPostReturned"); const postReturned=await sendPost(workerHost, returned.callFrameId, b.workerInput, before, published,posted); this.assertCurrent(); need(await this.#resume(worker, returned) === null);
    const timerResult = await timerBoundary; this.assertCurrent(); if(!timerResult.ok){throw timerResult.error;} const timer=timerResult.held; need(timer?.role === "timerReturned"); const finished = await timerReturned(workerHost, timer.callFrameId, b.workerInput, before, postReturned); this.assertCurrent(); await b.control("worker-timer-returned-ready"); await b.canvasLane.retire(timer); this.assertCurrent(); need(await this.#canvasResume(timer, (): void => { worker.markExpected(); }) === null); b.canvasLane.requireCompleted();
    const local = await worker.wait("workerLoopback"); this.assertCurrent(); await loopback(workerHost, local.callFrameId, b.workerInput, before, postReturned, finished); this.assertCurrent(); const localReturned = await this.#resume(worker, local); need(localReturned?.role === "workerLoopbackReturned"); await loopback(workerHost, localReturned.callFrameId, b.workerInput, before, postReturned, finished); this.assertCurrent(); await worker.retire(localReturned); need(await this.#resume(worker, localReturned) === null); worker.requireCompleted(); await pump; this.assertCurrent(); await b.control("worker-complete");
    let held = await ui.wait("uiHandler"); this.assertCurrent(); const delivered = await actualEvent(uiHost, held.callFrameId, b.publication.sdk, b.publication.native, echo); this.assertCurrent(); need(delivered.evidence.every((value, index) => Object.is(value, postReturned.evidence[index]))); const input = { body: b.publication, returned: b.returned, echo, event: delivered, receiver: selected }; const cm = await cmBefore(uiHost, input); this.assertCurrent(); let taskPromise: string | null = null;
    for (const role of UI) {
      this.assertCurrent(); need(held.role === role); const frames = held.event.params["callFrames"]; need(Array.isArray(frames)); const first: unknown = frames[0]; need(first !== null && typeof first === "object" && !types.isProxy(first)); const asyncValue: unknown = Object.getOwnPropertyDescriptor(first, "returnValue")?.value;
      const observed = await cmHeld(uiHost, held.callFrameId, role, input, cm, asyncValue, taskPromise); this.assertCurrent(); taskPromise = observed.taskPromiseObjectId;
      if (role === "uiHandlerReturned") { need(observed.taskPromiseFulfilled && observed.matchingTemporaryEntryDeleted); await ui.retire(held); this.assertCurrent(); }
      const next = await this.#resume(ui, held); this.assertCurrent(); if (next === null) { need(role === "uiHandlerReturned"); } else { held = next; }
    }
    ui.requireCompleted(); await b.control("complete"); this.assertCurrent(); const completed = Object.freeze({ event: delivered, receiver: selected, originalCanvasTimerResumesConsumed: 2, originalWorkerEchoResumesConsumed: 5, originalUiEchoResumesConsumed: 12, originalPublicationTerminalConsumed: true, originalCanvasPromiseFulfilled: true, originalUiTaskPromiseFulfilled: true, matchingTemporaryEntryDeleted: true, originalTextSerialCompleted: true, sdkCompletionReleased: false, modifyCompleted: false, saveAuthorized: false } as const); this.#completed = completed; return completed;
  }
  /** A genuine source instance and its actual final joins are still required;
   * equal-shaped data cannot retrieve this private completed reference. */
  public requireCompleted(value: CurrentSchematicRelevanceModifyEchoCompleted): void { this.assertCurrent(); need(value === this.#completed && this.#ui !== null && this.#worker !== null); this.#ui.requireCompleted(); this.#worker.requireCompleted(); }
  /** Fail wakes both streams; original Core exit joins the retained start and
   * worker pump rather than replacing either with a fresh attempt. */
  public fail(): void { if (!this.#failed) { this.#failed = true; this.#ui?.fail(); this.#worker?.fail(); this.#b.fail(); } }
}
const source = Object.getOwnPropertyDescriptors(CurrentSchematicRelevanceModifyEchoLifecycle.prototype);
/** Refuse caller-created copies, Proxies or a substituted source method
 * before Core relies on this original lifecycle instance. */
export function assertOriginalCurrentSchematicRelevanceModifyEchoLifecycle(value: CurrentSchematicRelevanceModifyEchoLifecycle): void {
  need(!types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentSchematicRelevanceModifyEchoLifecycle.prototype && Reflect.ownKeys(value).length === 0); const now = Object.getOwnPropertyDescriptors(CurrentSchematicRelevanceModifyEchoLifecycle.prototype); need(Reflect.ownKeys(now).length === Reflect.ownKeys(source).length && Object.entries(source).every(([key, before]) => { const current = now[key]; return current !== undefined && current.value === before.value && current.get === before.get && current.set === before.set && current.enumerable === before.enumerable && current.configurable === before.configurable && current.writable === before.writable; }));
}
