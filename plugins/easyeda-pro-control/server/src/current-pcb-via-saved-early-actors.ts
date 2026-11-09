/** Original-event bookkeeping only. The owning Core enrolls it before its
 * original app-main startup pause resumes. No actor is resumed by this class. */
import { types } from "node:util";
import { diagnosticTargetInventory } from "./current-pcb-diagnostic-context.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { isCurrentPcb209BootstrapTargetUrl } from "./current-pcb-209-worker-bootstrap-source.ts";

type Row = Record<string, unknown>;
interface Actor { readonly targetId: string; readonly type: string; readonly url: string; readonly title: string; readonly browserSession: string; pageSession: string | null }
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_READBACK_EARLY_ACTORS"); } }
function token(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z\d_.:-]{1,128}$/u.test(value); }
function record(value: unknown): value is Row { return value !== null && typeof value === "object" && !Array.isArray(value) && !types.isProxy(value); }
function worker(row: Row): boolean { return row["type"] === "worker" || row["type"] === "shared_worker" || row["type"] === "service_worker"; }
function string(value: unknown): value is string { return typeof value === "string" && value.length <= 8192 && value.isWellFormed() && !value.includes("\0"); }
export class CurrentPcbViaSavedEarlyActors {
  readonly #actors = new Map<string, Actor>();
  readonly #sessions = new Set<string>();
  readonly #projectUuid: string;
  #before = false; #armAttempted = false; #armAcknowledged = false; #sealed = false; #failed = false;
  #pageSession: string | null = null; #windowTabId: string | null = null; #projectTarget: string | null = null;
  public constructor(projectUuid: string) { need(/^[a-f\d]{64}$/u.test(projectUuid)); this.#projectUuid = projectUuid; Object.freeze(this); }
  #current(): void { need(!this.#failed); }
  #guard(work: () => void): void { this.#current(); try { work(); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  public before(input: Row): void { this.#guard(() => { need(!this.#before && !this.#armAttempted && this.#actors.size === 0);
    need(!diagnosticTargetInventory(input).some(row => worker(row))); this.#before = true; }); }
  public beginArm(): void { this.#guard(() => { need(this.#before && !this.#armAttempted); this.#armAttempted = true; }); }
  public acknowledgeArm(): void { this.#guard(() => { need(this.#armAttempted && !this.#armAcknowledged); this.#armAcknowledged = true; }); }
  public after(input: Row): void { this.#guard(() => { need(this.#before && this.#armAcknowledged && !this.#sealed); this.#inventory(input); this.#sealed = true; }); }
  /** Only the actual staged parent and original empty-UI tab may be enrolled.
   * Their strings do not release any worker; the original Core supplies custody. */
  public parent(sessionId: string): void { this.#guard(() => { need(this.#sealed && this.#pageSession === null && token(sessionId) && !this.#sessions.has(sessionId)); this.#pageSession = sessionId; }); }
  public expectProject(windowTabId: string): void { this.#guard(() => { need(this.#sealed && this.#pageSession !== null && this.#windowTabId === null && token(windowTabId)); this.#windowTabId = windowTabId; }); }
  /** Browser attachments must prove a first-script wait. Existing running
   * actors cannot be adopted, even if their IDs/URL/source look familiar. */
  public attachment(event: DiagnosticEvent): "held" | "project" {
    let result: "held" | "project" = "held";
    this.#guard(() => {
      need(this.#armAttempted && event.method === "Target.attachedToTarget");
      const p = event.params; const info = p["targetInfo"], session = p["sessionId"];
      need(Reflect.ownKeys(p).length === 3 && record(info) && worker(info) && token(info["targetId"]) && token(session) &&
        info["attached"] === true && string(info["url"]) && string(info["title"]) && !this.#sessions.has(session) && typeof p["waitingForDebugger"] === "boolean");
      const targetId = info["targetId"], type = info["type"];
      need(typeof type === "string");
      const project = this.#sealed && this.#windowTabId !== null && type === "worker" &&
        info["title"] === `project_${this.#projectUuid}_${this.#windowTabId}` && isCurrentPcb209BootstrapTargetUrl(info["url"]) && info["url"].endsWith("&debugOpen=0");
      if (project) {
        need(p["waitingForDebugger"] && (event.sessionId === undefined || event.sessionId === this.#pageSession) &&
          (this.#projectTarget === null || this.#projectTarget === targetId)); this.#projectTarget = targetId; result = "project";
      } else if (event.sessionId === undefined) {
        need(p["waitingForDebugger"] && !this.#actors.has(targetId) && targetId !== this.#projectTarget && this.#actors.size < 8);
        this.#actors.set(targetId, { targetId, type, url: info["url"], title: info["title"], browserSession: session, pageSession: null });
      } else {
        const original = this.#actors.get(targetId);
        need(this.#sealed && event.sessionId === this.#pageSession && original !== undefined && original.pageSession === null &&
          original.type === type && original.url === info["url"] && original.title === info["title"]);
        // The original browser session still holds this actor before any script.
        // A second page attachment is a reference, never a new execution grant.
        original.pageSession = session;
      }
      this.#sessions.add(session);
    }); return result;
  }
  #inventory(input: Row): void {
    const present = new Set<string>();
    for (const row of diagnosticTargetInventory(input)) {
      if (worker(row)) {
        const targetId = row["targetId"]; need(token(targetId));
        if (targetId === this.#projectTarget) { need(this.#windowTabId !== null && row["type"] === "worker" && row["title"] === `project_${this.#projectUuid}_${this.#windowTabId}` && typeof row["url"] === "string" && isCurrentPcb209BootstrapTargetUrl(row["url"]) && row["url"].endsWith("&debugOpen=0") && row["attached"] === true); }
        else {
          const original = this.#actors.get(targetId);
          need(original !== undefined && row["type"] === original.type && row["url"] === original.url && row["title"] === original.title && row["attached"] === true); present.add(targetId);
        }
      }
    }
    need(present.size === this.#actors.size && [...this.#actors.keys()].every(id => present.has(id)));
  }
  public inventory(input: Row): void { this.#guard(() => { need(this.#sealed); this.#inventory(input); }); }
  public assertSealed(): void { this.#current(); need(this.#sealed && this.#armAcknowledged); }
  public status(): Readonly<{ sealed: boolean; failed: boolean; backgroundHeld: number; projectSeen: boolean; actorExecutionAuthorized: false; cacheMutationAuthorized: false }> {
    return Object.freeze({ sealed: this.#sealed, failed: this.#failed, backgroundHeld: this.#actors.size, projectSeen: this.#projectTarget !== null, actorExecutionAuthorized: false, cacheMutationAuthorized: false });
  }
}
