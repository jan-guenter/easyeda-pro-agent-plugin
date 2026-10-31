/** Bounded startup observations for the distinct read-only owner. Transient
 * target discovery never qualifies the UI source or grants cache authority. */
import { sha256Json } from "./core.ts";
import { diagnosticExact } from "./current-pcb-diagnostic-protocol.ts";
import { diagnosticTargetInventory } from "./current-pcb-diagnostic-context.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS as LIMITS, currentFootprintHeldCacheStartupObservationSchema } from "./current-footprint-held-cache-diagnostic-profile.ts";
import type { CurrentFootprintHeldCacheStartupObservation, CurrentFootprintHeldCacheStartupStage } from "./current-footprint-held-cache-diagnostic-profile.ts";

export type { CurrentFootprintHeldCacheStartupObservation, CurrentFootprintHeldCacheStartupStage } from "./current-footprint-held-cache-diagnostic-profile.ts";

type Row = Readonly<Record<string, unknown>>;
type Classification = "empty" | "about-blank" | "ready" | "multiple-pages" | "attached-page" | "unexpected-page";
interface Sample {
  readonly attempt: number; readonly targetCount: number; readonly pageCount: number;
  readonly classification: Classification; readonly inventorySha256: string;
}
interface Transport {
  readonly assertCurrent: () => void; readonly version: () => Promise<Row>; readonly targets: () => Promise<Row>;
  readonly pause: () => Promise<void>;
}
function refuse(code: string): never { throw new Error(`PCB_DIAGNOSTIC_HELD_CACHE_READINESS_${code}`); }

/** Retain only bounded classifications, counts and hashes in public diagnostics.
 * Raw target URLs, titles and IDs stay inside the original owner. Every failed
 * call consumes its attempt, including errors before a valid inventory exists.
 */
export class CurrentFootprintHeldCachePageReadiness {
  #stage: CurrentFootprintHeldCacheStartupStage = "checkpoint";
  #failed = false;
  #failureKind: CurrentFootprintHeldCacheStartupObservation["failureKind"] = null;
  #versionAttempts = 0;
  #versionSha256: string | null = null;
  #targetAttempts = 0;
  readonly #samples: Sample[] = [];

  /** Track the original launch's next fixed stage without replacing a failure. */
  public stage(stage: CurrentFootprintHeldCacheStartupStage): void {
    if (this.#failed) { refuse("FAILED"); } this.#stage = stage;
  }
  /** Preserve the failing stage. The caller supplies no exception text or data. */
  public fail(): void { this.#failed = true; this.#failureKind ??= "transport-or-owner"; }

  /** Read browser identity once, then poll only valid empty/about:blank page
   * inventories. A malformed response, unexpected page or exhausted bound stops
   * immediately. Selection still requires one unattached exact editor URL.
   */
  public async observeBrowser(transport: Transport): Promise<Readonly<{ version: Row; targets: readonly Row[]; targetId: string }>> {
    if (this.#failed || this.#versionAttempts !== 0 || this.#targetAttempts !== 0) { refuse("CONSUMED"); }
    const { assertCurrent, version, targets, pause } = transport;
    const current = (): void => {
      if (transport.assertCurrent !== assertCurrent || transport.version !== version || transport.targets !== targets || transport.pause !== pause) { refuse("TRANSPORT_CHANGED"); }
      assertCurrent();
    };
    try {
      this.#stage = "browser-version"; this.#versionAttempts += 1; current();
      const observedVersion = await version(); current();
      if (!diagnosticExact(observedVersion, ["protocolVersion", "product", "revision", "userAgent", "jsVersion"]) ||
        Object.values(observedVersion).some(value => typeof value !== "string" || value.length > 8192 || value.includes("\0"))) {
        this.#failureKind = "version"; refuse("VERSION");
      }
      this.#versionSha256 = sha256Json(observedVersion);
      this.#stage = "browser-targets";
      for (let attempt = 1; attempt <= LIMITS.targetSamples; attempt += 1) {
        current(); this.#targetAttempts += 1;
        const raw = await targets(); current();
        let inventory: readonly Row[];
        try { inventory = diagnosticTargetInventory(raw); }
        catch (error) { this.#failureKind = "inventory"; throw error; }
        const pages = inventory.filter(value => value["type"] === "page");
        const page = pages[0];
        let classification: Classification;
        if (pages.length === 0) { classification = "empty"; }
        else if (pages.length > 1) { classification = "multiple-pages"; }
        else if (page?.["attached"] !== false) { classification = "attached-page"; }
        else if (page["url"] === "about:blank") { classification = "about-blank"; }
        else if (typeof page["url"] === "string" && /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)(?:#.*)?(?![\s\S])/u.test(page["url"])) { classification = "ready"; }
        else { classification = "unexpected-page"; }
        this.#samples.push(Object.freeze({ attempt, targetCount: inventory.length, pageCount: pages.length, classification, inventorySha256: sha256Json(inventory) }));
        current();
        if (classification === "ready" && typeof page?.["targetId"] === "string") {
          return Object.freeze({ version: Object.freeze(structuredClone(observedVersion)), targets: inventory, targetId: page["targetId"] });
        }
        if (classification !== "empty" && classification !== "about-blank") { this.#failureKind = "selection"; refuse("PAGE"); }
        if (attempt === LIMITS.targetSamples) { this.#failureKind = "target-limit"; refuse("TARGET_LIMIT"); }
        await pause(); current();
      }
      return refuse("TARGET_LIMIT");
    } catch (error) { this.fail(); throw error; }
  }

  /** Return a fresh bounded diagnostic snapshot. It grants no live authority. */
  public observation(): CurrentFootprintHeldCacheStartupObservation {
    return currentFootprintHeldCacheStartupObservationSchema.parse({ schema: "private.current-footprint-held-cache-startup-observation.v1", stage: this.#stage,
      failed: this.#failed, failureKind: this.#failureKind, versionAttempts: this.#versionAttempts, versionSha256: this.#versionSha256,
      targetAttempts: this.#targetAttempts, maximumTargetSamples: 16, delayMilliseconds: 250, samples: Object.freeze([...this.#samples]),
      uiSourceQualified: false, cacheQualificationGranted: false, executionAuthorized: false });
  }
}
