/** Original workflow cleanup. Historical JSON never recreates this owner. */
import { dirname, join } from "node:path";
import { operationPath, publishManagedAttachmentExclusive, readExactUtf8Artifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

export type TerminalRuntimeFamily = "project-opening" | "pcb-rename" | "schematic-rename" | "symbol-metadata" | "symbol-copy";
export interface OriginalTerminalRuntimeDisposal {
  readonly profile: "easyeda-pro-control.original-terminal-runtime-disposal.v1";
  readonly operationId: string;
  readonly family: TerminalRuntimeFamily;
  readonly intentArtifact: ArtifactDescriptor;
  readonly releaseArtifact: ArtifactDescriptor;
  readonly helperReleaseAcknowledged: true;
  readonly indexAllocationReleased: true;
  readonly executionAuthorized: false;
  readonly replayAllowed: false;
}
type Completion = (runtime: WindowsControlRuntime, receipt: OriginalTerminalRuntimeDisposal) => void;
const receipts = new WeakMap<object, { readonly runtime: WindowsControlRuntime; readonly seal: string; completed: boolean }>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

export function assertOriginalTerminalRuntimeDisposal(value: OriginalTerminalRuntimeDisposal, runtime: WindowsControlRuntime,
  family: TerminalRuntimeFamily, operationId: string): void {
  const owner = receipts.get(value);
  need(owner !== undefined && owner.runtime === runtime && value.family === family && value.operationId === operationId &&
    canonicalJson(value) === owner.seal && runtime.isReleaseAcknowledged(), "Native disposal requires its original acknowledged workflow receipt.");
}
export function isOriginalTerminalRuntimeDisposalCompleted(value: OriginalTerminalRuntimeDisposal, runtime: object): boolean {
  const owner = receipts.get(value);
  return owner !== undefined && owner.runtime === runtime && owner.completed && canonicalJson(value) === owner.seal;
}

/** Callers are fixed workflow owners. The two validators deliberately differ:
 * native proofs expire during release, while retained object identity survives.
 * Failed publication after acknowledged closure can settle without native replay.
 */
export class OriginalTerminalRuntimeRelease {
  private readonly runtime: WindowsControlRuntime;
  private readonly operationId: string;
  private readonly family: TerminalRuntimeFamily;
  private readonly launch: WindowsAuthorityLaunch;
  private readonly launchText: string;
  private readonly owner: () => void;
  private readonly eligible: () => Promise<void>;
  private readonly retireCaptures: () => Promise<void>;
  private readonly release: WindowsControlRuntime["release"];
  private readonly acknowledged: WindowsControlRuntime["isReleaseAcknowledged"];
  private readonly status: WindowsControlRuntime["status"];
  private busy = false;
  private attempted = false;
  private releaseInvoked = false;
  private intent: Readonly<Record<string, unknown>> | undefined;
  private intentArtifact: ArtifactDescriptor | undefined;
  private releaseArtifact: ArtifactDescriptor | undefined;
  private receipt: OriginalTerminalRuntimeDisposal | undefined;
  private disposed = false;

  public constructor(runtime: WindowsControlRuntime, operationId: string, family: TerminalRuntimeFamily,
    launch: WindowsAuthorityLaunch, owner: () => void, eligible: () => Promise<void>, retireCaptures: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    this.runtime = runtime; this.operationId = operationId; this.family = family; this.launch = launch;
    this.launchText = canonicalJson(launch); this.owner = owner; this.eligible = eligible; this.retireCaptures = retireCaptures;
    // oxlint-disable-next-line typescript/unbound-method -- Identity pins; every invocation retains the original runtime receiver.
    this.release = runtime.release; this.acknowledged = runtime.isReleaseAcknowledged; this.status = runtime.status;
  }
  private current(closed: boolean): void {
    this.owner();
    need(this.runtime.release === this.release && this.runtime.isReleaseAcknowledged === this.acknowledged &&
      this.runtime.status === this.status && canonicalJson(this.launch) === this.launchText,
    "Original native disposal runtime, method or final generation changed.");
    const status = this.status.call(this.runtime);
    need(closed ? this.acknowledged.call(this.runtime) && status.state === "released" && status.launch === null :
      !this.acknowledged.call(this.runtime) && status.state === "owned" && canonicalJson(status.launch) === this.launchText,
    "Native disposal must bind the original latest generation and acknowledged helper closure.");
  }
  private async publish(name: string, value: unknown): Promise<ArtifactDescriptor> {
    const bytes = Buffer.from(`${JSON.stringify(value)}\n`);
    need(bytes.length <= 16_384, "Native disposal record exceeds its bound.");
    const directory = dirname(operationPath(this.operationId));
    const path = join(directory, this.operationId, name);
    const descriptor = await publishManagedAttachmentExclusive(path,
      "Original native runtime disposal", bytes, "easyeda-pro-control.terminal-runtime-release.v1");
    return Object.freeze({ path: descriptor.path, sha256: descriptor.sha256, bytes: descriptor.bytes });
  }
  public isDisposed(runtime?: WindowsControlRuntime): boolean { return this.disposed && (runtime === undefined || runtime === this.runtime); }
  public run(complete: Completion): Promise<OriginalTerminalRuntimeDisposal> { return this.perform(complete, false); }
  public settle(complete: Completion): Promise<OriginalTerminalRuntimeDisposal> { return this.perform(complete, true); }
  private async perform(complete: Completion, settleRecordsOnly: boolean): Promise<OriginalTerminalRuntimeDisposal> {
    need(!this.busy && !this.disposed, "Native disposal is pending or already completed."); this.busy = true;
    try {
      need(settleRecordsOnly ? this.attempted && this.releaseInvoked && this.acknowledged.call(this.runtime) : !this.attempted,
        "Native release is consumed; use explicit record settlement only after original helper closure was acknowledged.");
      if (this.attempted) {
        need(this.releaseInvoked && this.acknowledged.call(this.runtime),
          "Native disposal attempt is consumed; pending, rejected or uncertain release cannot be retried.");
      } else {
        this.current(false); await this.eligible(); this.current(false);
        this.attempted = true;
        this.intent = Object.freeze({ schema: "easyeda-pro-control.terminal-runtime-release-intent.v1", operationId: this.operationId,
          family: this.family, originalLatestLaunch: structuredClone(this.launch), originalLatestLaunchSha256: sha256Json(this.launch),
          createdAt: new Date().toISOString(), confirmReleaseOriginalRuntime: true, replayAllowed: false });
        this.intentArtifact = await this.publish("native-runtime-release-intent.json", this.intent); this.current(false);
        const before = await readExactUtf8Artifact(this.intentArtifact);
        need(before.text === `${JSON.stringify(this.intent)}\n`, "Native disposal intent changed.");
        this.current(false); await this.eligible(); this.current(false);
        // Capture retirement is also consumed before dispatch. Its rejection
        // Leaves this owner blocked and never permits a second release attempt.
        await this.retireCaptures(); this.current(false);
        this.releaseInvoked = true; await this.release.call(this.runtime);
      }
      this.current(true);
      need(this.intent !== undefined && this.intentArtifact !== undefined, "Native disposal retained intent is missing.");
      const intentAfter = await readExactUtf8Artifact(this.intentArtifact);
      need(intentAfter.text === `${JSON.stringify(this.intent)}\n`, "Native disposal intent changed after release.");
      this.current(true);
      const released = Object.freeze({ schema: "easyeda-pro-control.terminal-runtime-released.v1", operationId: this.operationId,
        family: this.family, releaseIntentSha256: sha256Json(this.intent), originalLatestLaunchSha256: sha256Json(this.launch),
        helperTransportClosed: true, captureRetirementAcknowledged: true, executionAuthorized: false, replayAllowed: false });
      this.releaseArtifact ??= await this.publish("native-runtime-released.json", released); this.current(true);
      const releaseRecord = await readExactUtf8Artifact(this.releaseArtifact);
      need(releaseRecord.text === `${JSON.stringify(released)}\n`, "Native disposal completion changed.");
      this.current(true);
      this.receipt ??= Object.freeze({ profile: "easyeda-pro-control.original-terminal-runtime-disposal.v1" as const,
        operationId: this.operationId, family: this.family, intentArtifact: this.intentArtifact, releaseArtifact: this.releaseArtifact,
        helperReleaseAcknowledged: true as const, indexAllocationReleased: true as const, executionAuthorized: false as const, replayAllowed: false as const });
      const receiptOwner = { runtime: this.runtime, seal: canonicalJson(this.receipt), completed: false };
      receipts.set(this.receipt, receiptOwner);
      complete(this.runtime, this.receipt); receiptOwner.completed = true; this.disposed = true; return this.receipt;
    } finally { this.busy = false; }
  }
}
