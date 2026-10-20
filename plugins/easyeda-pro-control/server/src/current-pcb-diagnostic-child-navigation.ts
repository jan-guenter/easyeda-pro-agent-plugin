/** One newly attached PCB iframe's diagnostic navigation observations.
 * The enclosing context owns session, UI/source, DOM and process admission.
 * These events are neither caller authority nor a completed editor load. */
import { diagnosticExact, diagnosticRecord, diagnosticToken } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

const PCB_URL = "https://client/editor?entry=pcb";
const BLANK_URL = "about:blank";
const METHODS = ["Page.frameScheduledNavigation", "Page.frameClearedScheduledNavigation", "Page.frameRequestedNavigation",
  "Page.frameStartedNavigating", "Page.frameStartedLoading", "Page.frameStoppedLoading", "Page.frameNavigated"] as const;
type Destination = typeof PCB_URL | typeof BLANK_URL;
interface Navigation {
  scheduled: boolean;
  requested: boolean;
  startedLoader: string | null;
  committedLoader: string | null;
}
function navigation(): Navigation { return { scheduled: false, requested: false, startedLoader: null, committedLoader: null }; }
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_CHILD_NAVIGATION"); }

/** Chromium146 separates browser loading/start events from renderer events.
 * Do not impose a total order across those producers. A scheduled/clear pair
 * is renderer-local; committed loaders remain distinct from pending starts.
 * See docs/current-pcb-cdp-navigation-audit-2026-10-20.md. */
export class CurrentPcbDiagnosticChildNavigation {
  readonly #childId: string;
  readonly #rootId: string;
  readonly #blank = navigation();
  readonly #pcb = navigation();
  #scheduled: Destination | null = null;
  #loadingStarts = 0;
  #loadingStops = 0;
  #eventCount = 0;
  #failed = false;

  public constructor(childId: string, rootId: string) {
    if (!diagnosticToken(childId) || !diagnosticToken(rootId) || childId === rootId) { refuse(); }
    this.#childId = childId; this.#rootId = rootId;
  }

  public get committedLoader(): string | null {
    this.#assertCurrent();
    return this.#pcb.committedLoader;
  }

  /** False means this class does not handle the event. A recognized invalid
   * event poisons this tracker permanently; it cannot be retried or reset. */
  public accept(event: DiagnosticEvent): boolean {
    this.#assertCurrent();
    if (!METHODS.some(method => method === event.method)) { return false; }
    try {
      this.#eventCount += 1;
      if (this.#eventCount > 16) { refuse(); }
      const params = event.params;
      if (event.method === "Page.frameNavigated") { this.#commit(params); return true; }
      if (params["frameId"] !== this.#childId) { refuse(); }
      if (event.method === "Page.frameStartedLoading" || event.method === "Page.frameStoppedLoading") {
        if (!diagnosticExact(params, ["frameId"])) { refuse(); }
        if (event.method === "Page.frameStartedLoading") { this.#loadingStarts += 1; }
        else { this.#loadingStops += 1; }
        if (this.#loadingStarts > 2 || this.#loadingStops > 2) { refuse(); }
        return true;
      }
      if (event.method === "Page.frameClearedScheduledNavigation") {
        if (!diagnosticExact(params, ["frameId"]) || this.#scheduled === null) { refuse(); }
        this.#scheduled = null; return true;
      }
      const url = params["url"];
      if (url !== BLANK_URL && url !== PCB_URL) { refuse(); }
      const state = url === BLANK_URL ? this.#blank : this.#pcb;
      if (event.method === "Page.frameScheduledNavigation") {
        if (!diagnosticExact(params, ["frameId", "delay", "reason", "url"]) || !Object.is(params["delay"], 0) ||
            params["reason"] !== "scriptInitiated" || state.scheduled || this.#scheduled !== null ||
            state.committedLoader !== null || this.#pcb.committedLoader !== null) { refuse(); }
        state.scheduled = true; this.#scheduled = url; return true;
      }
      if (event.method === "Page.frameRequestedNavigation") {
        if (!diagnosticExact(params, ["frameId", "reason", "url", "disposition"]) ||
            (params["reason"] !== "initialFrameNavigation" && params["reason"] !== "scriptInitiated") ||
            params["disposition"] !== "currentTab" || state.requested || state.committedLoader !== null ||
            this.#pcb.committedLoader !== null) { refuse(); }
        state.requested = true; return true;
      }
      // A first browser start may arrive after the matching renderer commit.
      // Only that exact committed loader is accepted, including a delayed
      // Initial blank start after the PCB commit. Repeated starts, different
      // Loaders, reloads or same-document child changes refuse.
      if (!diagnosticExact(params, ["frameId", "url", "loaderId", "navigationType"]) ||
          params["navigationType"] !== "differentDocument" || !diagnosticToken(params["loaderId"]) ||
          state.startedLoader !== null || state.committedLoader !== null && params["loaderId"] !== state.committedLoader ||
          this.#pcb.committedLoader !== null && state.committedLoader === null) { refuse(); }
      state.startedLoader = params["loaderId"]; return true;
    } catch { this.#failed = true; return refuse(); }
  }

  #commit(params: Readonly<Record<string, unknown>>): void {
    if (!diagnosticExact(params, ["frame", "type"]) || params["type"] !== "Navigation" ||
        !diagnosticRecord(params["frame"])) { refuse(); }
    const frame = params["frame"], loader = frame["loaderId"], url = frame["url"];
    if (frame["id"] !== this.#childId || frame["parentId"] !== this.#rootId ||
        !diagnosticToken(loader) || frame["urlFragment"] !== undefined ||
        (url !== BLANK_URL && url !== PCB_URL) || this.#pcb.committedLoader !== null ||
        url === PCB_URL && frame["securityOrigin"] !== "https://client" ||
        url === BLANK_URL && frame["securityOrigin"] !== "https://client" && frame["securityOrigin"] !== "://") { refuse(); }
    const state = url === BLANK_URL ? this.#blank : this.#pcb;
    if (state.committedLoader !== null || state.startedLoader !== null && state.startedLoader !== loader ||
        url === PCB_URL && this.#blank.committedLoader === loader) { refuse(); }
    state.committedLoader = loader;
  }

  /** A selected committed PCB loader and no unmatched renderer scheduling.
   * Loading counters are advisory, never a completion or queue-drain proof. */
  public assertReady(): void {
    this.#assertCurrent();
    if (this.#pcb.committedLoader === null || this.#scheduled !== null) { this.#failed = true; refuse(); }
  }

  #assertCurrent(): void { if (this.#failed) { refuse(); } }
}
