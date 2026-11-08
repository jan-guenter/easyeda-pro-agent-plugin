/* oxlint-disable import/max-dependencies -- This dedicated seven-record policy joins independent fixed startup, Save and source-custody protocols. */
import { CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES } from "./current-pcb-via-save-tail-observation-source.ts";
import type { CurrentPcbViaSaveTailDeleteRole } from "./current-pcb-via-save-tail-observation-source.ts";
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
import { currentSchematicRelevanceModifyCmControlPoint } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlRole } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SITES } from "./current-schematic-relevance-modify-structure-protocol.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_STARTUP_ORIGINAL_CURSOR"); } }
type LibraryRole = keyof typeof CURRENT_PROJECT_LIBRARY_REFRESH_SITES;
export class CurrentSchematicRelevanceDisplayWorkerController extends CurrentSchematicDisplayWorkerController {
  readonly #modifyPoints = new Map<"handler" | "batch" | "batchReturned" | "handlerReturned", CurrentSchematicDisplayStartupEventPoint>();
  readonly #modifyCmPoints = new Map<CurrentSchematicRelevanceModifyCmControlRole, CurrentSchematicDisplayStartupEventPoint>();
  readonly #modifyCmAttempts = new Set<CurrentSchematicRelevanceModifyCmControlRole>();
  readonly #modifyStructurePoints = new Map<"entry" | "returned", CurrentSchematicDisplayStartupEventPoint>();
  readonly #modifyStructureArms = new Set<"entry" | "returned">();
  readonly #modifyStructureStartupRetired = new Set<"startupEntry" | "startupReturn">();
  readonly #tailPoints=new Map<CurrentPcbViaSaveTailDeleteRole,CurrentSchematicDisplayStartupEventPoint>();
  readonly #pollingPoints = new Map<"entry" | "returned", CurrentSchematicDisplayStartupEventPoint>();
  readonly #libraryPoints = new Map<LibraryRole, CurrentSchematicDisplayStartupEventPoint>();
  #ownRouter: CurrentSchematicRelevanceDisplayEventRouter | null = null;
  #pollingComplete = false; readonly #helpers = new CurrentSchematicRelevanceDisplayHelperReceipts();
  #helperSource: CurrentSchematicDisplayProjectSourceHeld | null = null;
  #originalSourceReader:((scriptId:string)=>Promise<unknown>)|null=null;
  public bindOriginalSourceReader(source:CurrentSchematicDisplayProjectSourceHeld,read:(scriptId:string)=>Promise<unknown>):void{this.assertOriginalProjectSourceHeld(source);need(this.#originalSourceReader===null&&typeof read==="function");this.#helperSource=source;this.#originalSourceReader=read;}
  public registerSubmitted(source: CurrentSchematicDisplayProjectSourceHeld, command: object): void { this.requireHeld(source); need(!this.status().failed && (this.#helperSource === null || this.#helperSource === source)); if(!this.status().ready){ this.assertOriginalProjectSourceHeld(source); } this.#helperSource = source; this.#helpers.register(command); }
  public async verifyOriginalHelperReceipt(source: CurrentSchematicDisplayProjectSourceHeld, command: object, raw: unknown, read: (scriptId: string) => Promise<unknown>): Promise<void> { this.requireHeld(source); need(this.#helperSource === source); try { await this.#helpers.verify(command, raw, read); this.requireHeld(source); need(!this.status().failed); } catch (error) { this.fail(); throw error; } }
  protected override qualifyObservedWorkerScript(event: DiagnosticEvent): Promise<void> { const reader=this.#originalSourceReader;need(reader!==null);return this.#helpers.verifyObserved(event,reader); }
  public override fail(): void { super.fail(); this.#helpers.fail(); }
  protected override setupHelperRequestLimit(): number { return super.setupHelperRequestLimit() + 2; }
  protected override qualifySetupHelper(program: string): void { if (program !== CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS.capture && program !== CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.pristine) { super.qualifySetupHelper(program); } }
  protected override qualifySetupHelperSource(input: unknown, program: string): void {
    if (program === CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS.capture || program === CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.pristine) { need(input === `(${program})`); } else { super.qualifySetupHelperSource(input, program); }
  }
  protected override createEventRouter(bindings: CurrentSchematicDisplayEventRouterBindings): CurrentSchematicRelevanceDisplayEventRouter {
    need(this.#ownRouter === null); const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings); this.#ownRouter = router; return router;
  }
  protected override originalStartupPoints(): readonly CurrentSchematicDisplayStartupEventPoint[] { return Object.freeze([...this.#pollingPoints.values(), ...this.#libraryPoints.values(),...this.#tailPoints.values(), ...this.#modifyPoints.values(), ...this.#modifyStructurePoints.values(), ...this.#modifyCmPoints.values()]); }
  protected originalWorkerRouter(source: CurrentSchematicDisplayProjectSourceHeld): CurrentSchematicRelevanceDisplayEventRouter {
    this.requireHeld(source); const router = this.#ownRouter; need(router !== null && super.originalEventRouter() === router); return router;
  }
  protected override observeStartupControlEvent(event: DiagnosticEvent): void {
    super.observeStartupControlEvent(event);
    if (this.#helperSource!==null && !this.originalProjectSetupActive() && event.method === "Debugger.scriptParsed") { const source = this.#helperSource; need(source !== null); this.#helpers.observe(event, source.executionContextId, source.scriptId); }
    if (this.#pollingComplete && event.method === "Debugger.paused" && Array.isArray(event.params["hitBreakpoints"]) && event.params["hitBreakpoints"].includes(this.#pollingPoints.get("entry")?.point.breakpointId)) { this.fail(); throw new Error("SCHEMATIC_RELEVANCE_POLLING_REENTERED"); }
  }
  #bind(source: CurrentSchematicDisplayProjectSourceHeld, role: string, breakpointId: string, site: Readonly<{ lineNumber: number; columnNumber: number }>, lane: "quiesce" | "library" | "producer"): CurrentSchematicDisplayStartupEventPoint {
    const child = this.requireHeld(source); need(!this.status().ready && this.status().pumping && /^[A-Za-z\d_.:-]{1,256}$/u.test(breakpointId));
    need(![...this.#pollingPoints.values(), ...this.#libraryPoints.values(),...this.#tailPoints.values()].some(value => value.point.breakpointId === breakpointId));
    return Object.freeze({ lane, point: Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber }) });
  }
  /** Register an original function guard only after startup has genuinely
   * completed. The fixed callback controller supplies its exact source point. */
  public bindModifyBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: "handler" | "batch" | "batchReturned" | "handlerReturned", breakpointId: string, location: Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>): void {
    const child = this.requireHeld(source); need(this.status().ready && !this.status().failed && !this.#modifyPoints.has(role) && /^[A-Za-z\d_.:-]{1,256}$/u.test(breakpointId) && location.scriptId === source.scriptId);
    const points = { handler: [0, 11_789], handlerReturned: [0, 11_811], batch: [110, 98_769], batchReturned: [110, 98_916] } as const; const expected = points[role];
    need(location.lineNumber === expected[0] && location.columnNumber === expected[1]);
    const point = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, breakpointId, role, lineNumber: location.lineNumber, columnNumber: location.columnNumber });
    const registration = Object.freeze({ lane: "modify" as const, point }); this.originalWorkerRouter(source).register("modify", point); this.#modifyPoints.set(role, registration);
  }
  /** Join the already retained original worker reader; this opens no second
   * event stream and yields only the dedicated receive/body lane. */
  public nextModifyEvent(source: CurrentSchematicDisplayProjectSourceHeld): Promise<CurrentSchematicDisplayRoutedEvent> { return this.originalWorkerRouter(source).next("modify"); }
  /** Consume the exact event issued by that same original router. */
  public reserveModifyResume(source: CurrentSchematicDisplayProjectSourceHeld, event: CurrentSchematicDisplayRoutedEvent, role: "handler" | "batch" | "batchReturned" | "handlerReturned"): void { this.originalWorkerRouter(source).reserveModifyResume(event, role); }
  /** Remove one enclosing guard from active routing only after its actual
   * native removal ACK, preserving the held final handler-return delivery. */
  public retireModifyBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: "handler" | "batch" | "batchReturned" | "handlerReturned", breakpointId: string, event: CurrentSchematicDisplayRoutedEvent): void {
    this.requireHeld(source); const original = this.#modifyPoints.get(role); need(this.status().ready && !this.status().failed && original !== undefined && original.point.breakpointId === breakpointId);
    this.originalWorkerRouter(source).retireModifyParentPoint(breakpointId, role, event); this.#modifyPoints.delete(role);
  }
  /** Bind the native acknowledgement to one exact source point, using the
   * same original worker router after startup. Each role can be armed once. */
  public bindModifyCmBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: CurrentSchematicRelevanceModifyCmControlRole, breakpointId: string, location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>): void {
    const child = this.requireHeld(source), site = currentSchematicRelevanceModifyCmControlPoint(role);
    need(this.status().ready && !this.status().failed && !this.#modifyCmAttempts.has(role) && /^[A-Za-z\d_.:-]{1,256}$/u.test(breakpointId) && location.scriptId === source.scriptId && location.lineNumber === site.lineNumber && location.columnNumber === site.columnNumber);
    this.#modifyCmAttempts.add(role);
    const point = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, breakpointId, role, lineNumber: site.lineNumber, columnNumber: site.columnNumber });
    this.originalWorkerRouter(source).register("modify", point); this.#modifyCmPoints.set(role, Object.freeze({ lane: "modify", point }));
  }
  /** Consume the exact event from the one retained Modify reader; a copied
   * packet cannot stand in for the delivered nested CM pause. */
  public reserveModifyCmResume(source: CurrentSchematicDisplayProjectSourceHeld, event: CurrentSchematicDisplayRoutedEvent, role: CurrentSchematicRelevanceModifyCmControlRole): void { this.originalWorkerRouter(source).reserveModifyCmResume(event, role); }
  /** Retire only the original acknowledged allocation while the exact final
   * CM return remains held. Historical arm attempts stay consumed. */
  public retireModifyCmBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: CurrentSchematicRelevanceModifyCmControlRole, breakpointId: string, event: CurrentSchematicDisplayRoutedEvent): void {
    this.requireHeld(source); const original = this.#modifyCmPoints.get(role); need(this.status().ready && !this.status().failed && original !== undefined && original.point.breakpointId === breakpointId);
    this.originalWorkerRouter(source).retireModifyCmPoint(breakpointId, role, event); this.#modifyCmPoints.delete(role);
  }
  /** Reuse an exact source coordinate only after both original startup
   * allocations were removed. Even a reused Chrome ID is a fresh epoch. */
  public bindModifyStructureBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: "entry" | "returned", breakpointId: string): void {
    const child = this.requireHeld(source), site = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SITES[role];
    need(this.status().ready && !this.status().failed && this.#modifyStructureStartupRetired.size === 2 && !this.#modifyStructureArms.has(role));
    this.#modifyStructureArms.add(role);
    const point = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, breakpointId, role: role === "entry" ? "modifyEntry" : "modifyReturned", lineNumber: site.lineNumber, columnNumber: site.columnNumber });
    this.originalWorkerRouter(source).register("structure", point); this.#modifyStructurePoints.set(role, Object.freeze({ lane: "structure", point }));
  }
  /** Called only after Core receives the actual empty native remove ACK.
   * Birth bookkeeping remains historical; active routing loses this epoch. */
  public retireModifyStructureBreakpoint(source: CurrentSchematicDisplayProjectSourceHeld, role: "startupEntry" | "startupReturn" | "entry" | "returned", breakpointId: string): void {
    this.requireHeld(source); need(this.status().ready && !this.status().failed);
    const router = this.originalWorkerRouter(source);
    if (role === "startupEntry" || role === "startupReturn") {
      need(!this.#modifyStructureStartupRetired.has(role) && this.originalStartupStructurePoint(source, role) === breakpointId);
      router.retireModifyStructurePoint(breakpointId, role); this.#modifyStructureStartupRetired.add(role); return;
    }
    const original = this.#modifyStructurePoints.get(role); need(original !== undefined && original.point.breakpointId === breakpointId);
    router.retireModifyStructurePoint(breakpointId, role === "entry" ? "modifyEntry" : "modifyReturned"); this.#modifyStructurePoints.delete(role);
  }
  /** Retain the same original structure-reader delivery through the native
   * transfer, including its finalizer pause rather than a copied packet. */
  public reserveModifyStructureResume(source: CurrentSchematicDisplayProjectSourceHeld, event: CurrentSchematicDisplayRoutedEvent, role: "entry" | "returned" | "finalizer"): void {
    const target = { entry: "modifyEntry", returned: "modifyReturned", finalizer: "initialFinally" } as const;
    this.originalWorkerRouter(source).reserveModifyStructureResume(event, target[role]);
  }
  public reserveSaveLocalResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:CurrentPcbViaLocalUploadRole):void{this.originalWorkerRouter(source).reserveSaveLocalResume(event,role);}
  public reserveSaveUploadResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:CurrentPcbViaUploadRequestRole):void{this.originalWorkerRouter(source).reserveSaveUploadResume(event,role);}
  public bindSaveTailBreakpoint(source:CurrentSchematicDisplayProjectSourceHeld,role:CurrentPcbViaSaveTailDeleteRole,breakpointId:string):void{need(!this.#tailPoints.has(role));this.#tailPoints.set(role,this.#bind(source,role,breakpointId,CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES[role],"producer"));}
  public reserveSaveDrainResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:string):void{this.originalWorkerRouter(source).reserveSaveDrainResume(event,role);}
  public reservePostHistorySyncResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:string):void{this.originalWorkerRouter(source).reservePostHistorySyncResume(event,role);}
  public reserveSaveTailDeleteResume(source:CurrentSchematicDisplayProjectSourceHeld,event:CurrentSchematicDisplayRoutedEvent,role:"cacheDeleteCall"|"cacheDeleteReturned"):void{this.originalWorkerRouter(source).reserveSaveTailDeleteResume(event,role);}
  public async settleObservedPrograms(source:CurrentSchematicDisplayProjectSourceHeld):Promise<void>{await this.settleOriginalMetadata(source);this.#helpers.requireIdle();}
  public requireProducerFrontier(source:CurrentSchematicDisplayProjectSourceHeld):void{this.requireOriginalMetadataEmpty(source);this.#helpers.requireIdle();this.originalWorkerRouter(source).requireProducerFrontier();}
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
