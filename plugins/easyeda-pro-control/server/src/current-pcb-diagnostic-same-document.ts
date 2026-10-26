/** Bounded event admission for one sealed UI fragment transition.
 * Chromium146 emits renderer schedule/clear around Location navigation, while
 * loading and started-navigation events arrive through the browser separately.
 * Their relative order is not a readiness barrier or a new loader identity.
 */
import { diagnosticExact, diagnosticToken } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

type Row = Readonly<Record<string, unknown>>;
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_SAME_DOCUMENT"); }
function loading(params: Row, count: number): void {
  // Browser IPC may arrive after the renderer's function response, or the
  // Loader may already have been loading. These counts are not paired proof.
  if (count >= 8 || !diagnosticExact(params, ["frameId"])) { refuse(); }
}

export class CurrentPcbDiagnosticSameDocument {
  readonly #frameId: string;
  readonly #url: string;
  #scheduled = false;
  #scheduleCount = 0;
  #fragmentCount = 0;
  #startedCount = 0;
  #loadingStartCount = 0;
  #loadingStopCount = 0;
  #sealed = false;
  #failed = false;

  public constructor(frameId: string, url: string) {
    const match = /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)#id=([a-f\d]{64})(?:,tab=\*(?:[a-f\d]{16}|[a-f\d]{32})@([a-f\d]{64}))?$/u.exec(url);
    if (!diagnosticToken(frameId) || match === null || match[0] !== url || match[2] !== undefined && match[2] !== match[1]) {
      refuse();
    }
    this.#frameId = frameId; this.#url = url;
  }

  /** False means this is not one of this root's supported event kinds.
   * The context must still reject unsupported events or route the selected child.
   * No method mutates the retained committed loader or execution context.
   */
  public accept(event: DiagnosticEvent): boolean {
    if (this.#failed) { return refuse(); }
    try { return this.#accept(event); }
    catch { this.#failed = true; return refuse(); }
  }

  /** A browser start for the completed project fragment can arrive after the
   * PCB fragment phase is armed. Match only that old exact URL; never accept
   * another renderer schedule or commit through this historical phase. */
  public acceptLateNavigation(event: DiagnosticEvent): boolean {
    if (this.#failed) { return refuse(); }
    if (!this.#sealed || event.method !== "Page.frameStartedNavigating" ||
        event.params["frameId"] !== this.#frameId || event.params["url"] !== this.#url) { return false; }
    return this.accept(event);
  }

  #accept(event: DiagnosticEvent): boolean {
    const params = event.params;
    if (params["frameId"] !== this.#frameId) { return false; }
    switch (event.method) {
      case "Page.frameScheduledNavigation": {
        if (this.#sealed || this.#scheduled || this.#scheduleCount >= 8 ||
            !diagnosticExact(params, ["frameId", "delay", "reason", "url"]) ||
            !Object.is(params["delay"], 0) || params["reason"] !== "scriptInitiated" ||
            params["url"] !== this.#url) { refuse(); }
        this.#scheduled = true; this.#scheduleCount += 1; return true;
      }
      case "Page.frameClearedScheduledNavigation": {
        if (this.#sealed || !this.#scheduled || !diagnosticExact(params, ["frameId"])) { refuse(); }
        this.#scheduled = false; return true;
      }
      case "Page.navigatedWithinDocument": {
        if (this.#sealed || this.#fragmentCount >= 8 ||
            !diagnosticExact(params, ["frameId", "url", "navigationType"]) || params["url"] !== this.#url ||
            (params["navigationType"] !== "fragment" && params["navigationType"] !== "historyApi")) { refuse(); }
        this.#fragmentCount += 1; return true;
      }
      case "Page.frameStartedNavigating": {
        // The protocol's pending loader token may differ even for a same-document
        // Attempt. Only the later full frame snapshot can prove committed identity.
        if (this.#startedCount >= 8 || !diagnosticExact(params, ["frameId", "url", "loaderId", "navigationType"]) ||
            params["url"] !== this.#url || !diagnosticToken(params["loaderId"]) ||
            params["navigationType"] !== "sameDocument") { refuse(); }
        this.#startedCount += 1; return true;
      }
      case "Page.frameStartedLoading": {
        loading(params, this.#loadingStartCount);
        this.#loadingStartCount += 1; return true;
      }
      case "Page.frameStoppedLoading": {
        loading(params, this.#loadingStopCount);
        this.#loadingStopCount += 1; return true;
      }
      default: { return false; }
    }
  }

  public seal(): void {
    if (this.#failed || this.#sealed || this.#scheduled || this.#fragmentCount === 0) {
      this.#failed = true; refuse();
    }
    this.#sealed = true;
  }

  /** A source-held child can precede this root's tab activation. This read
   * proves only that no fragment event has committed yet; it does not seal,
   * cancel or reset the original transition or its scheduling observations. */
  public assertPendingFragment(): void {
    if (this.#failed || this.#sealed || this.#fragmentCount !== 0) {
      this.#failed = true; refuse();
    }
  }
}
