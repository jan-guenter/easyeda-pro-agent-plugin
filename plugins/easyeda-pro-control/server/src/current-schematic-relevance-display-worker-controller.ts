/* oxlint-disable import/max-dependencies -- This dedicated seven-record policy joins independent fixed startup, Save and source-custody protocols. */
import type { CurrentPcbViaLocalUploadRole } from "./current-pcb-via-local-upload-protocol.ts";
import type { CurrentPcbViaUploadRequestRole } from "./current-pcb-via-upload-request-protocol.ts";
/** Dedicated seven-record startup lanes. The native owner supplies the actual
 * source, child and breakpoint replies; a caller cannot reconstruct that custody. */
import { CurrentSchematicRelevanceDisplayHelperReceipts } from "./current-schematic-relevance-display-helper-receipts.ts";
import { CurrentSchematicDisplayWorkerController } from "./current-schematic-display-worker-controller.ts";
import type { CurrentSchematicDisplayStartupEventPoint, CurrentSchematicDisplayWorkerChild } from "./current-schematic-display-worker-controller.ts";
import type { CurrentSchematicDisplayProjectSourceHeld } from "./current-schematic-display-worker-bootstrap.ts";
import type { CurrentSchematicDisplayEventRouterBindings, CurrentSchematicDisplayRoutedEvent, DiagnosticEvent } from "./current-schematic-display-event-router.ts";
import { CurrentSchematicRelevanceDisplayEventRouter } from "./current-schematic-relevance-display-event-router.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS } from "./current-project-library-refresh-programs.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS } from "./current-project-sync-quiesce-programs.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_SITES } from "./current-project-sync-quiesce-source.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_SITES } from "./current-project-library-refresh-source.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_STARTUP_ORIGINAL_CURSOR"); } }
type LibraryRole = keyof typeof CURRENT_PROJECT_LIBRARY_REFRESH_SITES;
export class CurrentSchematicRelevanceDisplayWorkerController extends CurrentSchematicDisplayWorkerController {
  readonly #pollingPoints = new Map<"entry" | "returned", CurrentSchematicDisplayStartupEventPoint>();
  readonly #libraryPoints = new Map<LibraryRole, CurrentSchematicDisplayStartupEventPoint>();
  #ownRouter: CurrentSchematicRelevanceDisplayEventRouter | null = null;
  #pollingComplete = false; readonly #helpers = new CurrentSchematicRelevanceDisplayHelperReceipts();
  #helperSource: CurrentSchematicDisplayProjectSourceHeld | null = null;
  public registerSubmitted(source: CurrentSchematicDisplayProjectSourceHeld, command: object): void { this.requireHeld(source); need(!this.status().failed && this.status().ready && (this.#helperSource === null || this.#helperSource === source)); this.#helperSource = source; this.#helpers.register(command); }
  public async verifyOriginalHelperReceipt(source: CurrentSchematicDisplayProjectSourceHeld, command: object, raw: unknown, read: (scriptId: string) => Promise<unknown>): Promise<void> { this.requireHeld(source); need(this.#helperSource === source); try { await this.#helpers.verify(command, raw, read); this.requireHeld(source); need(!this.status().failed); } catch (error) { this.fail(); throw error; } }
  protected override qualifyObservedWorkerScript(event: DiagnosticEvent): Promise<void> { return this.#helpers.requireVerified(event); }
  public override fail(): void { super.fail(); this.#helpers.fail(); }
  protected override setupHelperRequestLimit(): number { return super.setupHelperRequestLimit() + 2; }
  protected override qualifySetupHelper(program: string): void { if (program !== CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS.capture && program !== CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.pristine) { super.qualifySetupHelper(program); } }
  protected override qualifySetupHelperSource(input: unknown, program: string): void {
    if (program === CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS.capture || program === CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.pristine) { need(input === `(${program})`); } else { super.qualifySetupHelperSource(input, program); }
  }
  protected override createEventRouter(bindings: CurrentSchematicDisplayEventRouterBindings): CurrentSchematicRelevanceDisplayEventRouter {
    need(this.#ownRouter === null); const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings); this.#ownRouter = router; return router;
  }
  protected override originalStartupPoints(): readonly CurrentSchematicDisplayStartupEventPoint[] { return Object.freeze([...this.#pollingPoints.values(), ...this.#libraryPoints.values()]); }
  protected originalWorkerRouter(source: CurrentSchematicDisplayProjectSourceHeld): CurrentSchematicRelevanceDisplayEventRouter {
    this.requireHeld(source); const router = this.#ownRouter; need(router !== null && super.originalEventRouter() === router); return router;
  }
  protected override observeStartupControlEvent(event: DiagnosticEvent): void {
    super.observeStartupControlEvent(event);
    if (this.status().ready && event.method === "Debugger.scriptParsed") { const source = this.#helperSource; need(source !== null); this.#helpers.observe(event, source.executionContextId, source.scriptId); }
    if (this.#pollingComplete && event.method === "Debugger.paused" && Array.isArray(event.params["hitBreakpoints"]) && event.params["hitBreakpoints"].includes(this.#pollingPoints.get("entry")?.point.breakpointId)) { this.fail(); throw new Error("SCHEMATIC_RELEVANCE_POLLING_REENTERED"); }
  }
  #bind(source: CurrentSchematicDisplayProjectSourceHeld, role: string, breakpointId: string, site: Readonly<{ lineNumber: number; columnNumber: number }>, lane: "quiesce" | "library"): CurrentSchematicDisplayStartupEventPoint {
    const child = this.requireHeld(source); need(!this.status().ready && this.status().pumping && /^[A-Za-z\d_.:-]{1,256}$/u.test(breakpointId));
    need(![...this.#pollingPoints.values(), ...this.#libraryPoints.values()].some(value => value.point.breakpointId === breakpointId));
    return Object.freeze({ lane, point: Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }) });
  }
  public reserveSaveLocalResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:CurrentPcbViaLocalUploadRole):void{this.originalWorkerRouter(source).reserveSaveLocalResume(event,role);}
  public reserveSaveUploadResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:CurrentPcbViaUploadRequestRole):void{this.originalWorkerRouter(source).reserveSaveUploadResume(event,role);}
  public bindSyncQuiesceBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: "entry" | "returned", breakpointId: string): void {
    need(!this.#pollingPoints.has(role)); this.#pollingPoints.set(role, this.#bind(source, role, breakpointId, CURRENT_PROJECT_SYNC_QUIESCE_SITES[role], "quiesce"));
  }
  public bindLibraryRefreshBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: LibraryRole, breakpointId: string): void {
    need(!this.#libraryPoints.has(role)); this.#libraryPoints.set(role, this.#bind(source, role, breakpointId, CURRENT_PROJECT_LIBRARY_REFRESH_SITES[role], "library"));
  }
  public async nextSyncQuiesceEvent(): Promise<CurrentSchematicDisplayRoutedEvent> { await this.whenOriginalSourceResumed(); return super.originalEventRouter().next("quiesce"); }
  public async nextLibraryRefreshEvent(): Promise<CurrentSchematicDisplayRoutedEvent> { await this.whenOriginalSourceResumed(); return super.originalEventRouter().next("library"); }
  public reserveSyncQuiesceResume(source: CurrentSchematicDisplayProjectSourceHeld, role: "entry" | "returned"): void { const child = this.requireHeld(source); this.originalWorkerRouter(source).reserveResume("quiesce", child.sessionId, role); }
  public reserveLibraryRefreshResume(source: CurrentSchematicDisplayProjectSourceHeld, role: "firstLoop" | "loopReturned" | "mountReturned"): void { const child = this.requireHeld(source); this.originalWorkerRouter(source).reserveResume("library", child.sessionId, role); }
  public completeSyncQuiesce(source: CurrentSchematicDisplayProjectSourceHeld, child: CurrentSchematicDisplayWorkerChild): void { this.requireOriginal(source, child); need(this.status().ready && !this.#pollingComplete && this.#pollingPoints.size === 2); this.#pollingComplete = true; }
}
