/** One original manager-to-worker readonly GET. The private runtime issuer
 * must join actual UI/manager/native sender custody; this module issues none. */
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";
import type { CurrentFootprintInversePublicLookupEntry } from "./current-footprint-inverse-public-lookup-entry.ts";
import type { CurrentFootprintInversePublicRowPlan } from "./current-footprint-inverse-public-row-plan.ts";
import type { CurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInversePublicGetJob { readonly profile: "private.current-footprint-inverse-public-get-job.v1" }
export interface CurrentFootprintInversePublicGetJobBindings {
  readonly call: CurrentFootprintInversePublicDeleteCall;
  readonly lookupEntry: CurrentFootprintInversePublicLookupEntry;
  readonly rowPlan: CurrentFootprintInversePublicRowPlan;
  readonly rowData: CurrentFootprintInversePublicRowData;
  readonly projectUuid: string; readonly footprintUuid: string; readonly replyTopic: string;
  readonly nativeEnvelope: Readonly<{
    type: "IGIVE"; uuid: string; topic: "/mgr/projectWorker/footprint/get"; id: number; target: string;
    /** Structured clone preserves own undefined. JSON alone cannot prove it. */
    message: Readonly<{ message: Readonly<{ uuid: string; need: undefined }>; replyTopic: string }>;
  }>;
  readonly nativeOrigin: string;
  readonly assertCurrent: () => void;
  readonly assertOriginalForwarded: () => void;
}
export { requireOriginalCurrentFootprintInversePublicGetJob } from "./current-pcb-diagnostic-owner.ts";
