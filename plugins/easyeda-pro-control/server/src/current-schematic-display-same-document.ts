/** Exact project then page fragments for the single generated-schematic
 * navigation Promise. This owns no source, process, worker or writer grant. */
import { CurrentPcbDiagnosticSameDocument } from "./current-pcb-diagnostic-same-document.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

function refuse(): never { throw new Error("SCHEMATIC_DISPLAY_SAME_DOCUMENT"); }
export class CurrentSchematicDisplaySameDocument {
  readonly #project: CurrentPcbDiagnosticSameDocument;
  readonly #page: CurrentPcbDiagnosticSameDocument;
  readonly #projectUrl: string; readonly #pageUrl: string;
  #pageStarted = false; #sealed = false; #failed = false;
  public constructor(frameId: string, projectUrl: string, pageUrl: string) {
    const first = /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)#id=([a-f\d]{64})$/u.exec(projectUrl);
    const page = /^,tab=\*([a-f\d]{32})@([a-f\d]{64})$/u.exec(pageUrl.slice(projectUrl.length));
    if (first === null || first[0] !== projectUrl || !pageUrl.startsWith(projectUrl) || page === null || page[0] !== pageUrl.slice(projectUrl.length) || page[2] !== first[1]) { refuse(); }
    this.#projectUrl = projectUrl; this.#pageUrl = pageUrl;
    this.#project = new CurrentPcbDiagnosticSameDocument(frameId, projectUrl); this.#page = new CurrentPcbDiagnosticSameDocument(frameId, pageUrl);
  }
  public accept(event: DiagnosticEvent): boolean {
    if (this.#failed) { return refuse(); }
    try {
      if (event.params["url"] === this.#projectUrl && this.#pageStarted) { return this.#project.acceptLateNavigation(event); }
      if (this.#sealed) { return this.#page.accept(event); }
      if (!this.#pageStarted && event.params["url"] === this.#pageUrl) { this.#project.seal(); this.#pageStarted = true; }
      return (this.#pageStarted ? this.#page : this.#project).accept(event);
    } catch { this.#failed = true; return refuse(); }
  }
  public seal(): void {
    if (this.#failed || this.#sealed || !this.#pageStarted) { this.#failed = true; return refuse(); }
    try { this.#page.seal(); this.#sealed = true; } catch { this.#failed = true; refuse(); }
  }
}
